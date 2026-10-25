import React, {useEffect, useMemo, useState} from 'react';
import {AbsoluteFill, cancelRender, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import {Logo, LogoPath, useLogo} from '../logo';
import {B, COL, DOOR, FPS, H, HERO, LOCK, W, lockPt} from './timeline';
import {EASES, Keys, Pt, Rig, apply, keyValue, localM, useRigAsset} from './rig';
import {Tilo} from './Tilo';
import {FilmSfx} from './FilmSfx';

// ---------------------------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------------------------
type K = Exclude<Keys, number | ((t: number) => number)>;
const fk = (f: number, keys: K) => keyValue(keys, f, keys[0][1]);
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const prog = (f: number, a: number, b: number, e: keyof typeof EASES = 'ease') => EASES[e](clamp01((f - a) / (b - a)));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const backOut = (u: number, s = 1.6) => { u = clamp01(u) - 1; return 1 + u * u * ((s + 1) * u + s); };
const decel = (u: number) => 1 - (1 - clamp01(u)) * (1 - clamp01(u));
const bezPt = (p: Pt[], t: number): Pt => {
  const u = 1 - t;
  return [0, 1].map((i) => u * u * u * p[0][i] + 3 * u * u * t * p[1][i] + 3 * u * t * t * p[2][i] + t * t * t * p[3][i]) as Pt;
};
const bezTan = (p: Pt[], t: number) => {
  const u = 1 - t;
  const d = [0, 1].map((i) => 3 * u * u * (p[1][i] - p[0][i]) + 6 * u * t * (p[2][i] - p[1][i]) + 3 * t * t * (p[3][i] - p[2][i]));
  return (Math.atan2(d[1], d[0]) * 180) / Math.PI;
};
const resample = (poly: Pt[], n: number): Pt[] => {
  const seg: number[] = [];
  let tot = 0;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    seg.push(l);
    tot += l;
  }
  const out: Pt[] = [];
  let s = 0, acc = 0;
  for (let k = 0; k < n; k++) {
    const target = (tot * k) / n;
    while (acc + seg[s] < target) acc += seg[s++];
    const u = seg[s] ? (target - acc) / seg[s] : 0;
    const a = poly[s], b = poly[(s + 1) % poly.length];
    out.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]);
  }
  return out;
};
/** Arched doorway outline centred on (0,0), clockwise from the top centre. */
const doorRing = (w: number, h: number, n: number): Pt[] => {
  const r = w / 2, cy = -h / 2 + r, poly: Pt[] = [];
  for (let i = 0; i <= 90; i++) { const a = -Math.PI / 2 + (Math.PI / 2) * (i / 90); poly.push([r * Math.cos(a), cy + r * Math.sin(a)]); }
  poly.push([r, h / 2], [-r, h / 2]);
  for (let i = 0; i < 90; i++) { const a = Math.PI + (Math.PI / 2) * (i / 90); poly.push([r * Math.cos(a), cy + r * Math.sin(a)]); }
  return resample(poly, n);
};
const ringD = (r: Pt[]) => 'M' + r.map((p) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join('L') + 'Z';
const mix = (a: Pt[], b: Pt[], t: number): Pt[] => a.map((p, i) => [lerp(p[0], b[i][0], t), lerp(p[1], b[i][1], t)]);

const useFonts = () => {
  const [handle] = useState(() => delayRender('Ubuntu fonts'));
  useEffect(() => {
    const faces = [
      new FontFace('Ubuntu', `url(${staticFile('fonts/Ubuntu-Regular-latin.woff2')})`, {weight: '400'}),
      new FontFace('Ubuntu', `url(${staticFile('fonts/Ubuntu-Medium-latin.woff2')})`, {weight: '500'}),
    ];
    Promise.all(faces.map((f) => f.load()))
      .then((loaded) => { loaded.forEach((f) => document.fonts.add(f)); continueRender(handle); })
      .catch((e) => cancelRender(e));
  }, [handle]);
};

// ---------------------------------------------------------------------------------------------
// The hero "o": rolling, stop, boop, pivot edge-on, open into a doorway, fold back, swept away
// ---------------------------------------------------------------------------------------------
const R_HERO = 18.5 * HERO.s; // centre-to-floor at hero scale
const HERO_Y = HERO.floorY - R_HERO;
const oX = (f: number) => {
  if (f <= B.rollStop) return lerp(-170, HERO.stopX, Math.pow(f / B.rollStop, 0.93));
  if (f <= B.foldEnd + 1) return HERO.stopX;
  return HERO.stopX + 980 * prog(f, B.foldEnd + 1, B.foldEnd + 11, 'in');
};
const oRot = (f: number) => {
  const dist = oX(f) - oX(0);
  let r = (dist / R_HERO) * (180 / Math.PI);
  // the sudden stop: it rocks forward and settles
  if (f > B.rollStop && f < B.boop) r += 9 * Math.sin((f - B.rollStop) * 0.9) * Math.exp(-(f - B.rollStop) / 4);
  return r;
};

// ---------------------------------------------------------------------------------------------
// Tilo: root transform (screen) and pupil targets
// ---------------------------------------------------------------------------------------------
const TILO_PIVOT: Pt = [400, 470];
const CHARGE: Pt[] = [[175, 455], [430, 1260], [930, 1420], [1500, 760]];
const LOCK_ROOT = lockPt(75 + 0.25 * TILO_PIVOT[0], 0.25 * TILO_PIVOT[1]); // (340, 1012)
const BONK_DX = 36;

function tiloRoot(f: number): {x: number; y: number; s: number; r: number} {
  // act 1: chase, overshoot and brake
  if (f < B.zipOut) {
    const x = f <= B.rollStop ? 640 - 26 * (B.rollStop - f) : 640 + 140 * decel((f - B.rollStop) / (B.tiloStop - B.rollStop));
    const y = fk(f, [[0, 640], [30, 604], [B.rollStop, 614], [B.tiloStop, 590, 'out'], [B.tiloStop + 6, 600]]);
    const r = fk(f, [[0, 3], [B.rollStop, 3], [B.rollStop + 4, -11, 'out'], [B.tiloStop + 2, 2], [B.tiloStop + 8, 0]]);
    const sc = fk(f, [[0, 72], [B.zipOut - 4, 72], [B.zipOut, 62]]);
    return {x, y, s: sc, r};
  }
  // act 2: zip off right, zip in from the left, boop, rise to watch
  if (f < B.zipIn) {
    const u = prog(f, B.zipOut, B.zipIn, 'in');
    return {x: lerp(780, 1560, u), y: lerp(600, 520, u), s: 62, r: -4 * u};
  }
  if (f < B.charge - 8) {
    const x = fk(f, [[B.zipIn, -480], [B.boop - 2, 171, 'out'], [B.boop, 190, 'linear'], [B.boop + 7, 140, 'out'], [B.boop + 24, 250]]);
    const y = fk(f, [[B.zipIn, 560], [B.boop - 2, 754, 'out'], [B.boop, 754], [B.boop + 7, 742, 'out'], [B.boop + 24, 420]]);
    const r = fk(f, [[B.zipIn, 8], [B.boop - 4, 6], [B.boop, 2], [B.boop + 4, -6, 'out'], [B.boop + 24, 0]]);
    return {x, y, s: 62, r};
  }
  // act 3: anticipation, swoop (the airflow becomes the cyan sweep), re-enter at lock-up scale, bonk
  if (f < B.charge) {
    const u = prog(f, B.charge - 8, B.charge);
    return {x: lerp(250, CHARGE[0][0], u), y: lerp(420, CHARGE[0][1], u), s: 62, r: lerp(0, -5, u)};
  }
  if (f < B.tiloIn) {
    const u = prog(f, B.charge, B.charge + 16, 'in');
    const p = bezPt(CHARGE, u);
    return {x: p[0], y: p[1], s: lerp(62, 70, Math.sin(Math.PI * u)), r: Math.max(-40, Math.min(48, bezTan(CHARGE, u))) * 0.75};
  }
  // re-enter from the left at lock-up scale, overshoot into the G, recoil into place
  const x = fk(f, [[B.tiloIn, -260], [B.bonk, LOCK_ROOT[0] + BONK_DX, 'out'], [B.bonk + 2, LOCK_ROOT[0] + BONK_DX - 4, 'linear'], [B.settled - 2, LOCK_ROOT[0], 'out']]);
  const y = fk(f, [[B.tiloIn, 930], [B.bonk, LOCK_ROOT[1] - 4, 'out'], [B.settled - 2, LOCK_ROOT[1]]]);
  const r = fk(f, [[B.tiloIn, -6], [B.bonk - 2, 0], [B.bonk + 1, 5, 'snap'], [B.bonk + 6, -1.5], [B.settled, 0]]);
  return {x, y, s: 40, r};
}
const rootM = (f: number) => {
  const r = tiloRoot(f);
  return localM([r.x, r.y], r.r, [r.s, r.s], TILO_PIVOT);
};

// look targets (screen) — null = straight ahead
const CLUE_AT: Pt = [745, 560];
const BOOK_AT: Pt = [540, 1572];
const BONE_AT: Pt = [540, 1090];
function lookTarget(f: number): Pt | null {
  if (f < B.clueIn + 2) return [oX(f), HERO_Y];
  if (f < B.zipOut) return CLUE_AT;
  if (f < B.zipIn + 2) return null;
  if (f < B.bone) return [HERO.stopX, f < B.pivotTo ? HERO_Y : DOOR.cy];
  if (f < B.book + 2) return BONE_AT;
  if (f < 178) return BOOK_AT;
  if (f < B.fold) return BONE_AT;
  return null;
}
const pupilRaw = (f: number): Pt => {
  const tgt = lookTarget(f);
  if (!tgt) return [0, 0];
  const eye = apply(rootM(f), [486, 120]);
  const dx = tgt[0] - eye[0], dy = tgt[1] - eye[1], d = Math.hypot(dx, dy) || 1;
  return [(100 * dx) / d, (100 * dy) / d];
};
const pupil = (t: number, axis: 0 | 1) => {
  const f = t * FPS;
  let s = 0;
  for (let k = -3; k <= 3; k++) s += pupilRaw(f + k)[axis];
  return s / 7;
};

// Propeller: busy in flight, a restrained spin on the hold (below the blur-disc threshold), then it
// eases to rest. The hold speed is solved so the integrated angle ends on a whole half-turn: the final
// frame shows the blade exactly as drawn in the logo.
const PROP_KEYS: K = [[0, 72], [B.rollStop, 72], [B.tiloStop + 2, 22, 'out'], [B.zipOut - 2, 22], [B.zipOut + 3, 95, 'in'], [B.boop + 2, 20], [B.charge - 3, 20], [B.charge + 4, 100, 'in'], [B.bonk, 70], [B.settled, 31]];
const PROP_HOLD = [B.settled + 9, 282, 296] as const;
const propParts = (f: number): [number, number] => {
  if (f <= B.settled) return [fk(f, PROP_KEYS), 0];
  const base = fk(B.settled, PROP_KEYS);
  const inU = EASES.ease(clamp01((f - B.settled) / (PROP_HOLD[0] - B.settled)));
  const outU = 1 - EASES.ease(clamp01((f - PROP_HOLD[1]) / (PROP_HOLD[2] - PROP_HOLD[1])));
  return [base * (1 - inU) * outU, inU * outU];
};
const PROP_H = (() => {
  // the rig integrates speed/100*22 rev/s per frame up to the final frame (299)
  let a0 = 0, a1 = 0;
  for (let i = 0; i < 299; i++) { const [p, q] = propParts(i); a0 += (p / 100) * 22 / FPS; a1 += (q / 100) * 22 / FPS; }
  const target = Math.round((a0 + 14 * a1) / 0.5) * 0.5;
  return (target - a0) / a1;
})();
const propSpeed = (f: number) => { const [p, q] = propParts(f); return p + PROP_H * q; };

// Rig control keys (seconds). Defaults reproduce the logo; the last frames return to them.
const sec = (k: K): K => k.map(([f, v, m]) => [f / FPS, v, m]) as K;
const HOLD0 = 247;
const FINAL_SVG = 297;
const CONTROLS: Record<string, Keys> = {
  'Flight Speed': (t: number) => {
    const f = t * FPS;
    if (f >= HOLD0) return 50 + 6 * Math.sin((2 * Math.PI * (f - HOLD0)) / (299 - HOLD0));
    return fk(f, [[0, 84], [B.rollStop, 84], [B.tiloStop, 30, 'out'], [B.zipOut - 2, 30], [B.zipOut + 4, 100, 'in'], [B.boop - 6, 40, 'out'], [B.boop, 22], [B.charge - 4, 22], [B.charge + 4, 100, 'in'], [B.tiloIn + 4, 100], [B.bonk, 70], [HOLD0, 50]]);
  },
  'Propeller Speed': (t: number) => propSpeed(t * FPS),
  'Bob Amount': sec([[0, 35], [B.rollStop, 35], [B.tiloStop, 0], [B.boop + 8, 0], [B.boop + 24, 18], [B.charge - 8, 18], [B.charge, 0]]),
  'Ear Flutter': sec([[0, 48], [B.rollStop, 48], [B.tiloStop - 2, 0], [B.zipOut, 0], [B.zipOut + 3, 70], [B.boop - 4, 0], [B.charge, 0], [B.charge + 3, 75], [B.tiloIn + 6, 35], [B.settled, 12], [284, 12], [294, 0]]),
  'Ear Lift': sec([[0, 6], [B.tiloStop, 6], [B.earsCatch, -26, 'snap'], [B.earsCatch + 6, 8], [B.earsCatch + 12, 0], [B.boop, 0], [B.boop + 3, -10, 'snap'], [B.boop + 9, 0], [B.bonk + 1, 0], [B.bonk + 5, -24, 'snap'], [B.bonk + 10, 7], [B.bonk + 16, 0]]),
  'Body Balance': sec([[0, -2], [B.rollStop, -2], [B.rollStop + 6, 9, 'out'], [B.tiloStop + 2, -3], [B.tiloStop + 8, 0], [B.boop, 0], [B.boop + 2, 4, 'snap'], [B.boop + 8, 0], [B.charge - 4, -6], [B.charge + 3, 5], [B.charge + 12, 0], [B.bonk, 0], [B.bonk + 2, 9, 'snap'], [B.bonk + 7, -2], [B.settled + 2, 0]]),
  'Flight Bank': sec([[0, 0], [B.rollStop, 0], [B.rollStop + 5, -15, 'out'], [B.tiloStop + 4, 4], [B.tiloStop + 10, 0]]),
  'Head Tilt': sec([[0, 6], [B.rollStop, 6], [B.tiloStop + 2, -5], [B.pauseFrom, 0], [B.clueIn + 4, -7], [B.zipOut, 0], [B.boop + 6, 9], [B.book, 9], [178, 5], [B.fold, 0]]),
  'Upper Lid Rest': sec([[0, 0], [B.pauseFrom - 2, 0], [B.pauseFrom + 2, 26], [B.pauseTo, 26], [B.pauseTo + 4, 0]]),
  Blink: sec([[0, 0], [B.blink, 0], [B.blink + 2, 100], [B.blink + 6, 0], [172, 0], [174, 100], [178, 0], [B.bonk, 0], [B.bonk + 1, 100, 'snap'], [B.bonk + 5, 0], [B.holdBlink, 0], [B.holdBlink + 2, 100], [B.holdBlink + 6, 0]]),
  'Near Paw Lift': sec([[0, 0], [B.bone, 0], [B.bone + 3, 100], [B.bone + 6, 20], [B.bone + 9, 100], [B.bone + 13, 0]]),
  'Tail Wag': sec([[0, 12], [B.rollStop, 12], [B.tiloStop, 0], [B.bone - 2, 0], [B.bone + 3, 26], [B.fold - 4, 26], [B.fold, 8], [B.charge + 10, 10], [B.settled, 0]]),
  'Tail Wag Speed': 2.6,
  'Pupil X': (t: number) => pupil(t, 0),
  'Pupil Y': (t: number) => pupil(t, 1),
};

// ---------------------------------------------------------------------------------------------
// Letters: giant fragments compose acts 1-2, the sweep carries every letter into the lock-up
// ---------------------------------------------------------------------------------------------
type Frag = {x: number; y: number; s: number; r: number};
// keyed by wordmark glyph index (0 G, 1 o, 2 F, 3 l, 4 o hero, 5 a, 6 t, 7 e, 8 r, 9 s)
const FRAGMENTS: Record<number, Frag> = {
  2: {x: 150, y: 190, s: 15, r: 0},
  8: {x: 1095, y: 140, s: 16, r: 0},
  6: {x: 1040, y: 1150, s: 14, r: 0},
  0: {x: 70, y: 1730, s: 12, r: 0},
  9: {x: 1005, y: 1770, s: 13, r: 0},
};
const ORDER = [0, 1, 2, 3, 5, 6, 7, 8, 9];

function letterState(i: number, f: number, center: Pt): Frag {
  const [lx, ly] = lockPt(center[0], center[1]);
  const k = ORDER.indexOf(i);
  const a = B.lettersFrom + k * 1.6;
  const start = FRAGMENTS[i];
  if (!start) {
    // letters the crop never showed are carried in by the sweep: they pop out of the ribbon in place
    const u = clamp01((f - a) / 9);
    const side = k % 2 ? 1 : -1;
    return {x: lx, y: ly - 26 * (1 - EASES.out(u)), s: LOCK.s * backOut(u, 2.2), r: side * 28 * (1 - EASES.out(u))};
  }
  // the giant crops shrink and fly into their slots
  const b = a + 13;
  const u = clamp01((f - a) / (b - a));
  const e = EASES.snap(u);
  const p = bezPt([[start.x, start.y], [lerp(start.x, lx, 0.25), lerp(start.y, ly, 0.6)], [lx - 120, ly + 90], [lx, ly]], e);
  const s = Math.exp(lerp(Math.log(start.s), Math.log(LOCK.s), e));
  const land = clamp01((f - b) / 6);
  const r = start.r * (1 - e) + (f > b ? 4 * Math.sin(land * Math.PI) * (1 - land) * (k % 2 ? 1 : -1) : 0);
  return {x: p[0], y: p[1], s, r};
}

const LetterPath: React.FC<{logo: Logo; p: LogoPath; tr: string; fill?: string}> = ({logo, p, tr, fill}) => (
  <g transform={tr}>
    <g transform={logo.groups.wordmark.transform}>
      <path d={p.d} fill={fill ?? p.fill} transform={p.transform} />
    </g>
  </g>
);
const around = (c: Pt, x: number, y: number, s: number, r: number, sx = 1, sy = 1) =>
  `translate(${x} ${y}) rotate(${r}) scale(${s * sx} ${s * sy}) translate(${-c[0]} ${-c[1]})`;

// ---------------------------------------------------------------------------------------------
// Room furniture (top view)
// ---------------------------------------------------------------------------------------------
const Chair: React.FC<{x: number; y: number; side: -1 | 1; s: number}> = ({x, y, side, s}) =>
  s <= 0.001 ? null : (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-40} y={-40} width={80} height={80} rx={18} fill={COL.white} stroke={COL.ink} strokeWidth={7} />
      <rect x={side < 0 ? -58 : 34} y={-36} width={24} height={72} rx={12} fill={COL.ink} />
    </g>
  );
const Bone: React.FC<{x: number; y: number; s: number; r: number}> = ({x, y, s, r}) => {
  if (s <= 0.001) return null;
  const parts = (p: React.SVGProps<SVGRectElement> & React.SVGProps<SVGCircleElement>) => (
    <>
      <rect x={-36} y={-9.5} width={72} height={19} rx={3} {...p} />
      {[[-40, -10.5], [-40, 10.5], [40, -10.5], [40, 10.5]].map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r={12.5} {...p} />)}
    </>
  );
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      {parts({fill: COL.ink, stroke: COL.ink, strokeWidth: 8, strokeLinejoin: 'round'})}
      {parts({fill: COL.gold})}
      <path d="M-30 -3.5 L18 -3.5" stroke={COL.white} strokeOpacity={0.75} strokeWidth={3.2} strokeLinecap="round" />
    </g>
  );
};
const Spark: React.FC<{x: number; y: number; r: number}> = ({x, y, r}) =>
  r <= 0.05 ? null : (
    <path
      d="M0 -1 C0.12 -0.12 0.12 -0.12 1 0 C0.12 0.12 0.12 0.12 0 1 C-0.12 0.12 -0.12 0.12 -1 0 C-0.12 -0.12 -0.12 -0.12 0 -1 Z"
      transform={`translate(${x} ${y}) scale(${r})`}
      fill={COL.gold}
      stroke={COL.ink}
      strokeWidth={2.4 / r}
      strokeLinejoin="round"
    />
  );

// ---------------------------------------------------------------------------------------------
// Film
// ---------------------------------------------------------------------------------------------
export const HidingFilm: React.FC = () => {
  const frame = useCurrentFrame();
  const logo = useLogo();
  const asset = useRigAsset();
  useFonts();
  const rig = useMemo(
    () =>
      asset
        ? new Rig(asset, CONTROLS, {
            Tilo_Root: {
              anchor: TILO_PIVOT,
              position: (t: number) => { const r = tiloRoot(t * FPS); return [r.x, r.y] as Pt; },
              rotation: (t: number) => tiloRoot(t * FPS).r,
              scale: (t: number) => { const s = tiloRoot(t * FPS).s; return [s, s] as Pt; },
            },
          })
        : null,
    [asset],
  );
  const contours = useMemo(() => {
    if (!logo) return null;
    const n = logo.ringLight.outer.length;
    const s = HERO.s;
    return {
      oOuter: logo.ringLight.outer.map(([x, y]) => [x * s, y * s] as Pt),
      oInner: logo.ringLight.inner.map(([x, y]) => [x * s, y * s] as Pt),
      dOuter: doorRing(DOOR.w, DOOR.h, n),
      dInner: doorRing(DOOR.w - 2 * DOOR.frame, DOOR.h - 2 * DOOR.frame, n),
    };
  }, [logo]);
  if (!logo || !rig || !contours) return <AbsoluteFill style={{backgroundColor: COL.cream}} />;
  rig.cache.clear();
  const f = frame;
  const t = f / FPS;
  const heroIdx = 4;
  const hero = logo.letters[heroIdx];

  // ---- hero o / door state ----
  const boopSquash = f >= B.boop && f < B.boop + 8 ? Math.sin(((f - B.boop) / 8) * Math.PI) * Math.exp(-(f - B.boop) / 5) : 0;
  const stopSquash = f >= B.rollStop && f < B.rollStop + 8 ? Math.sin(((f - B.rollStop) / 8) * Math.PI) * Math.exp(-(f - B.rollStop) / 4) : 0;
  const k = f < B.pivotTo ? 0 : f < B.fold + 4 ? prog(f, B.pivotTo, B.doorOpen - 2, 'ease') : 1 - prog(f, B.fold + 4, B.foldEnd, 'ease');
  let sx = 1;
  if (f >= B.boop + 2 && f < B.pivotTo) sx = Math.max(0.035, Math.cos((Math.PI / 2) * prog(f, B.boop + 2, B.pivotTo, 'in')));
  else if (f >= B.pivotTo && f < B.doorOpen + 6) sx = lerp(0.035, 1, backOut(clamp01((f - B.pivotTo) / (B.doorOpen - B.pivotTo)), 1.1));
  const heroCx = oX(f);
  const heroCy = lerp(HERO_Y, DOOR.cy, k);
  const morphOn = f >= B.pivotTo && f < B.foldEnd;
  const heroVisible = f < B.foldEnd + 12;
  const roomShow = f >= B.tableIn && f < B.foldEnd;
  const outer = morphOn ? mix(contours.oOuter, contours.dOuter, k) : null;
  const inner = morphOn ? mix(contours.oInner, contours.dInner, k) : null;

  // room contents (retract before the door folds)
  const retract = 1 - prog(f, B.fold, B.fold + 6, 'in');
  const tableS = backOut(clamp01((f - B.tableIn) / 7), 1.4) * retract;
  const chairS = (i: number) => backOut(clamp01((f - (B.chairs + i * 2)) / 6), 2.2) * (1 - prog(f, B.fold + 3 - i * 0.5, B.fold + 7 - i * 0.5, 'in'));
  const boneS = backOut(clamp01((f - B.bone) / 8), 2.4) * (1 - prog(f, B.fold - 2, B.fold + 4, 'in'));
  const CH = [
    [DOOR.cx - 152, BONE_AT[1] - 118, -1], [DOOR.cx - 152, BONE_AT[1], -1], [DOOR.cx - 152, BONE_AT[1] + 118, -1],
    [DOOR.cx + 152, BONE_AT[1] - 118, 1], [DOOR.cx + 152, BONE_AT[1], 1], [DOOR.cx + 152, BONE_AT[1] + 118, 1],
  ] as const;

  // clue and booking option
  const clueChars = '6 seats'.split('');
  const clueOut = prog(f, B.sweepFrom, B.sweepFrom + 8, 'in');
  const clueLine = prog(f, B.clueIn + 5, B.clueIn + 12, 'out') * (1 - clueOut);
  const matched = f >= B.bone ? Math.exp(-(f - B.bone) / 6) : 0;
  const bookS = backOut(clamp01((f - B.book) / 8), 1.8) * (1 - prog(f, B.sweepFrom, B.sweepFrom + 7, 'in'));

  // sweep ribbon (Tilo's airflow becoming one cyan sweep)
  const head = prog(f, B.charge + 1, B.charge + 15, 'in');
  const tail = prog(f, B.sweepFrom + 9, B.sweepTo, 'in');
  const width = 40 + 760 * Math.sin(Math.PI * prog(f, B.sweepFrom, B.sweepTo, 'linear')) ** 0.8;
  const SWEEP: Pt[] = [[-320, 330], [CHARGE[1][0] - 60, CHARGE[1][1] - 90], [CHARGE[2][0] - 40, CHARGE[2][1] - 60], CHARGE[3]];
  const sweepD = `M${SWEEP[0][0]} ${SWEEP[0][1]} C${SWEEP[1][0]} ${SWEEP[1][1]} ${SWEEP[2][0]} ${SWEEP[2][1]} ${SWEEP[3][0]} ${SWEEP[3][1]}`;

  // the late "o" (lock-up scale) rolls over the letter tops and drops in crooked
  const lateOn = f >= B.lateOFrom;
  const lateX = fk(f, [[B.lateOFrom, 652], [B.lateODrop, 448, 'linear'], [B.lateOLand, 434.3, 'out'], [B.bonk + 7, 434.3], [B.click, hero.center[0], 'snap']]);
  const tBump = Math.exp(-(((lateX - 489) / 9) ** 2));
  const onTops = 60 - 18.5 - 7 * tBump;
  const lateY = f < B.lateODrop ? onTops : fk(f, [[B.lateODrop, onTops], [B.lateOLand, hero.center[1] - 2.2, 'in'], [B.bonk + 7, hero.center[1] - 2.2], [B.click, hero.center[1], 'snap']]);
  const lateR = f < B.lateOLand ? ((lateX - 652) / 18.5) * (180 / Math.PI) : fk(f, [[B.lateOLand, ((434.3 - 652) / 18.5) * (180 / Math.PI) % 360], [B.lateOLand + 3, -9], [B.bonk + 7, -9], [B.click, 0, 'snap']]);
  const lateSquash = f >= B.lateOLand && f < B.lateOLand + 6 ? Math.sin(((f - B.lateOLand) / 6) * Math.PI) * 0.12 : 0;
  const clickPop = f >= B.click && f < B.click + 6 ? Math.sin(((f - B.click) / 6) * Math.PI) * 0.06 : 0;

  // letters dip as the late o rolls over them, then the bonk ripples G-o-F-l
  const dip = (i: number, c: Pt) => (lateOn && f < B.lateODrop + 2 ? 1.6 * Math.exp(-(((lateX - c[0]) / 12) ** 2)) : 0);
  const ripple = (i: number) => {
    const order = [0, 1, 2, 3].indexOf(i);
    if (order < 0) return 0;
    const u = (f - (B.bonk + order * 2)) / 6;
    return u > 0 && u < 1 ? 2.2 * Math.sin(u * Math.PI) * (1 - u * 0.4) : 0;
  };
  const exact = f >= B.settled + 1;

  return (
    <AbsoluteFill style={{backgroundColor: COL.cream}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <defs>
          {inner ? (
            <clipPath id="room" clipPathUnits="userSpaceOnUse">
              <path d={ringD(inner)} transform={`translate(${heroCx} ${heroCy}) scale(${sx} 1)`} />
            </clipPath>
          ) : null}
        </defs>

        {/* the cyan sweep */}
        {f >= B.charge && f < B.sweepTo + 1 && head > tail ? (
          <path d={sweepD} fill="none" stroke={COL.cyan} strokeWidth={width} strokeLinecap="round" pathLength={1} strokeDasharray={`${head - tail} 3`} strokeDashoffset={-tail} />
        ) : null}

        {/* letters */}
        {exact ? (
          <g transform={`translate(${LOCK.ox} ${LOCK.oy}) scale(${LOCK.s})`}>
            <g transform={logo.groups.wordmark.transform}>
              {logo.groups.wordmark.paths.map((p) => <path key={p.id} d={p.d} fill={p.fill} transform={p.transform} />)}
            </g>
            <g transform={logo.groups.tagline.transform}>
              {logo.groups.tagline.paths.map((p) => <path key={p.id} d={p.d} fill={p.fill} transform={p.transform} />)}
            </g>
          </g>
        ) : (
          <>
            {logo.letters.map((L, i) => {
              if (i === heroIdx) return null;
              const st = letterState(i, f, L.center);
              if (!FRAGMENTS[i] && f < B.lettersFrom) return null;
              const dy = dip(i, L.center) * st.s;
              const dx = ripple(i) * st.s;
              return <LetterPath key={L.path.id} logo={logo} p={L.path} tr={around(L.center, st.x + dx, st.y + dy, st.s, st.r)} />;
            })}
            {logo.words.map((w, j) => {
              const u = clamp01((f - (B.lettersTo - 2 + j * 2.5)) / 8);
              if (u <= 0) return null;
              const [x, y] = lockPt(w.center[0], w.center[1]);
              return (
                <g key={j} opacity={clamp01(u * 2.5)} transform={around(w.center, x, y + 14 * (1 - EASES.out(u)), LOCK.s, 0)}>
                  <g transform={logo.groups.tagline.transform}>
                    {w.paths.map((p) => <path key={p.id} d={p.d} fill={p.fill} transform={p.transform} />)}
                  </g>
                </g>
              );
            })}
          </>
        )}

        {/* the hero o and its room */}
        {heroVisible && !morphOn ? (
          <LetterPath
            logo={logo}
            p={hero.path}
            tr={around(hero.center, heroCx, heroCy + (1 - (1 - 0.07 * stopSquash)) * R_HERO * 0.5, HERO.s, oRot(f), sx * (1 + 0.07 * stopSquash - 0.06 * boopSquash), 1 - 0.07 * stopSquash + 0.05 * boopSquash)}
          />
        ) : null}
        {morphOn && outer && inner ? (
          <g>
            <g transform={`translate(${heroCx} ${heroCy}) scale(${sx} 1)`}>
              <path d={ringD(inner)} fill={COL.white} fillOpacity={clamp01(k * 3)} />
            </g>
            {roomShow ? (
              <g clipPath="url(#room)">
                <g transform={`translate(${DOOR.cx} ${BONE_AT[1]}) scale(${sx} 1) translate(${-DOOR.cx} ${-BONE_AT[1]})`}>
                  {tableS > 0.001 ? (
                    <rect x={DOOR.cx - 92 * tableS} y={BONE_AT[1] - 176 * tableS} width={184 * tableS} height={352 * tableS} rx={30 * tableS} fill={COL.cyan} stroke={COL.ink} strokeWidth={7} />
                  ) : null}
                  {CH.map(([x, y, side], i) => <Chair key={i} x={x} y={y} side={side} s={chairS(i)} />)}
                  <Bone x={BONE_AT[0]} y={BONE_AT[1]} s={1.35 * boneS} r={-22} />
                  <Spark x={BONE_AT[0] + 78} y={BONE_AT[1] - 70} r={20 * boneS * Math.max(0, Math.sin(f / 3.4))} />
                  <Spark x={BONE_AT[0] - 70} y={BONE_AT[1] + 62} r={14 * boneS * Math.max(0, Math.sin(f / 3.4 + 2))} />
                </g>
              </g>
            ) : null}
            <g transform={`translate(${heroCx} ${heroCy}) scale(${sx} 1)`}>
              <path d={ringD(outer) + ringD(inner)} fill={COL.ink} fillRule="evenodd" />
            </g>
          </g>
        ) : null}

        {/* the clue */}
        {f >= B.clueIn && clueOut < 1 ? (
          <g opacity={1 - clueOut} transform={`translate(${CLUE_AT[0] + 220 * clueOut} ${CLUE_AT[1]})`}>
            <text x={-132} y={0} fontFamily="Ubuntu" fontWeight={500} fontSize={72} fill={COL.ink}>
              {clueChars.map((ch, i) => {
                const u = clamp01((f - (B.clueIn + i * 1.2)) / 5);
                return (
                  <tspan key={i} y={18 * (1 - backOut(u, 2))} fillOpacity={clamp01(u * 3)}>
                    {ch === ' ' ? '\u00A0' : ch}
                  </tspan>
                );
              })}
            </text>
            <rect x={-134} y={22} width={268 * clueLine} height={9} rx={4.5} fill={COL.cyan} transform={`scale(${1 + 0.12 * matched} ${1 + 0.6 * matched})`} />
          </g>
        ) : null}

        {/* the separate booking option */}
        {bookS > 0.001 ? (
          <g transform={`translate(${BOOK_AT[0]} ${BOOK_AT[1]}) scale(${bookS})`}>
            <rect x={-236} y={-58} width={472} height={116} rx={58} fill={COL.cyan} stroke={COL.ink} strokeWidth={6} />
            <text x={0} y={17} textAnchor="middle" fontFamily="Ubuntu" fontWeight={500} fontSize={50} fill={COL.ink}>
              Book a space
            </text>
          </g>
        ) : null}

        {/* the late o */}
        {lateOn && !exact ? (
          <LetterPath
            logo={logo}
            p={hero.path}
            tr={around(hero.center, lockPt(lateX, lateY)[0], lockPt(lateX, lateY)[1], LOCK.s, lateR, 1 + lateSquash + clickPop, 1 - lateSquash + clickPop)}
          />
        ) : null}

        {/* Tilo. Every control is at its default from frame 296, where the rig matches the logo artwork
            to anti-aliasing; the last frames show the supplied SVG mascot itself, so the end is exact. */}
        {f < FINAL_SVG ? (
          <Tilo rig={rig} t={t} id="tilo" />
        ) : (
          <g transform={`translate(${LOCK.ox} ${LOCK.oy}) scale(${LOCK.s})`}>
            {(['mascot', 'speed'] as const).map((k) => (
              <g key={k} transform={logo.groups[k].transform}>
                {logo.groups[k].paths.map((p) => <path key={p.id} d={p.d} fill={p.fill} transform={p.transform} />)}
              </g>
            ))}
          </g>
        )}
      </svg>
      <FilmSfx />
    </AbsoluteFill>
  );
};
