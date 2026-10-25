import React, {useMemo} from 'react';
import {AbsoluteFill, interpolateColors, useCurrentFrame} from 'remotion';
import {
  BONE_DODGE,
  BONE_HOME,
  BONE_PARK,
  BUTTON_AT,
  BUTTON_SCALE,
  C,
  CHOICES,
  EYES,
  HEIGHT,
  LETTER_DUR,
  LETTER_STEP,
  LOGO_ORIGIN,
  LOGO_SCALE,
  PIN_AT,
  PIN_SCALE,
  RING_SAMPLES,
  T,
  WIDTH,
  ZOOM,
  ZOOM_FOCUS_LOGO,
  ZOOM_FOCUS_SCREEN,
} from './constants';
import {LogoGroup, Logo, LogoPath, Pt, RingContours, useLogo} from './logo';
import {
  BONE_PARTS,
  Bezier,
  CHECK_D,
  CURSOR_D,
  DESK,
  E,
  PIN,
  SPARK_D,
  bez,
  bezAngle,
  bezD,
  circle,
  clamp01,
  contoursD,
  kf,
  lerp,
  lerpPt,
  morph,
  pinOutline,
  prog,
} from './shapes';
import {Sfx} from './Sfx';

// ---------------------------------------------------------------------------------------------
// Paths and fixed geometry
// ---------------------------------------------------------------------------------------------

/** Tilo's flight: in low from the left, up and out top-right. The wipes ride the same curve. */
const FLIGHT: Bezier = [
  [-520, 1820],
  [200, 1180],
  [760, 1180],
  [1640, 120],
];
/** The white wipe: a slipstream line in Tilo's wake that swells until it fills the frame. */
const WHITE_SWEEP: Bezier = [
  [-400, 1500],
  [260, 980],
  [820, 1240],
  [1560, 300],
];
const PLANE_CENTRE: Pt = [172, 85]; // centre of the mascot-airplane artwork, logo units
const PLANE_MOUTH: Pt = [207, 40]; // Tilo's mouth, logo units
const CURSOR_SWEEP: Bezier = [
  [90, 2060],
  [120, 1520],
  [560, 1180],
  [BONE_HOME[0] + 6, BONE_HOME[1] + 6],
];
const CURSOR_SCALE = 3;
const BONE_SCALE = 2;
const BUTTON_R = 18.8;

const flightP = (f: number) => prog(f, T.planeIn, T.planeOut, E.inOut);

// ---------------------------------------------------------------------------------------------
// Logo rendering helpers — the supplied paths, untouched
// ---------------------------------------------------------------------------------------------

const PathEl: React.FC<{p: LogoPath; fill?: string}> = ({p, fill}) => <path d={p.d} fill={fill ?? p.fill} transform={p.transform} />;

const GroupEl: React.FC<{g: LogoGroup; only?: (p: LogoPath) => boolean}> = ({g, only}) => (
  <g transform={g.transform}>
    {g.paths.filter(only ?? (() => true)).map((p) => (
      <PathEl key={p.id} p={p} />
    ))}
  </g>
);

/** Transform around a logo-unit centre: translate(c+d) rotate scale translate(-c). */
const around = (c: Pt, d: Pt, rot: number, sx: number, sy = sx) =>
  `translate(${c[0] + d[0]} ${c[1] + d[1]}) rotate(${rot}) scale(${sx} ${sy}) translate(${-c[0]} ${-c[1]})`;

// ---------------------------------------------------------------------------------------------
// Camera for the lock-up: close on the wordmark while letters land, then back to the final frame
// ---------------------------------------------------------------------------------------------

const camera = (f: number) => {
  const z = kf(f, [
    [T.zoomOut, ZOOM],
    [T.zoomOutEnd, 1, E.inOut],
  ]);
  const pan = (z - 1) / (ZOOM - 1);
  const focus: Pt = [LOGO_ORIGIN[0] + LOGO_SCALE * ZOOM_FOCUS_LOGO[0], LOGO_ORIGIN[1] + LOGO_SCALE * ZOOM_FOCUS_LOGO[1]];
  const dest = lerpPt(focus, ZOOM_FOCUS_SCREEN, pan);
  const toScreen = (p: Pt): Pt => [
    dest[0] + z * (LOGO_ORIGIN[0] + LOGO_SCALE * p[0] - focus[0]),
    dest[1] + z * (LOGO_ORIGIN[1] + LOGO_SCALE * p[1] - focus[1]),
  ];
  const transform =
    z === 1
      ? `translate(${LOGO_ORIGIN[0]} ${LOGO_ORIGIN[1]}) scale(${LOGO_SCALE})`
      : `translate(${dest[0]} ${dest[1]}) scale(${z}) translate(${-focus[0]} ${-focus[1]}) translate(${LOGO_ORIGIN[0]} ${LOGO_ORIGIN[1]}) scale(${LOGO_SCALE})`;
  return {z, toScreen, transform, unit: z * LOGO_SCALE};
};

// ---------------------------------------------------------------------------------------------
// The two rings (the wordmark's o's): eyes → pin / booking button → back to o
// ---------------------------------------------------------------------------------------------

type RingState = {pos: Pt; scale: number; rot: number; sx: number; sy: number; k: number; fill: string; pupil: Pt; pupilR: number; visible: boolean};

/** Where both eyes look, as a direction in [-1, 1]². The joke lives in the f56–70 stretch. */
const gaze = (f: number): Pt => [
  kf(f, [
    [T.lookLeft, 0],
    [T.lookLeft + 5, -1, E.out],
    [T.lookRight - 1, -1],
    [T.lookRight + 4, 1, E.out],
    [T.boneIn + 4, 1],
    [T.boneIn + 8, 0.47, E.out], // spot the bone
    [T.dodge, 0.47],
    [T.dodge + 9, -0.55, E.out], // follow its hop
    [T.cursorMiss + 4, -0.55],
    [T.cursorMiss + 6, 0.5, E.snap], // ...look at the cursor that missed
    [T.cursorMiss + 9, 0.5],
    [T.cursorMiss + 11, 0, E.snap], // ...look at us. Blink.
    [T.pauseEnd + 1, 0],
    [T.pauseEnd + 4, -0.55, E.snap],
    [T.morphStart, -0.55],
    [T.morphStart + 6, 0],
  ]),
  kf(f, [
    [T.lookLeft, 0],
    [T.lookLeft + 5, 0.15, E.out],
    [T.boneIn + 4, 0.15],
    [T.boneIn + 8, 0.88, E.out],
    [T.dodge + 9, 0.82, E.out],
    [T.cursorMiss + 6, 0.88, E.snap],
    [T.cursorMiss + 9, 0.88],
    [T.cursorMiss + 11, 0, E.snap],
    [T.pauseEnd + 1, 0],
    [T.pauseEnd + 4, 0.82, E.snap],
    [T.morphStart, 0.82],
    [T.morphStart + 6, 0],
  ]),
];

const ringFill = (f: number) =>
  f < 168
    ? C.cyan
    : f < 182
      ? interpolateColors(f, [168, 175], [C.cyan, C.white]) // riding the aqua wipe
      : interpolateColors(f, [184, 192], [C.white, C.ink]); // becoming letters on white

const ringA = (f: number, cam: ReturnType<typeof camera>, landA: number, ring: RingContours): RingState => {
  const g = gaze(f);
  const pop = kf(f, [
    [T.ringPopA, 0],
    [T.ringPopA + 11, 1, E.bigBack],
  ]);
  const driftX = kf(f, [
    [T.lookLeft, 0],
    [T.lookLeft + 6, -28, E.out],
    [T.lookRight, -28],
    [T.lookRight + 6, 24, E.out],
    [T.boneIn + 10, 24],
    [T.boneIn + 16, 0],
  ]);
  const blink = kf(f, [
    [T.cursorMiss + 11, 1],
    [T.cursorMiss + 13, 0.12, E.in],
    [T.cursorMiss + 16, 1, E.out],
  ]);
  const toPin = prog(f, T.morphStart, T.morphEnd, E.inOut);
  const eye: Pt = [EYES.a[0] + driftX, EYES.a[1] + Math.sin(f / 7) * 5 * (1 - toPin)];
  // Rise then drop onto the map point; the landing squash sells the weight.
  const pinY = kf(f, [
    [T.morphStart, EYES.a[1]],
    [T.morphStart + 13, PIN_AT[1] - 70, E.out],
    [T.morphEnd, PIN_AT[1], E.in],
  ]);
  const pinX = lerp(eye[0], PIN_AT[0], toPin);
  const squash = kf(f, [
    [T.morphEnd, 0],
    [T.morphEnd + 3, 1, E.out],
    [T.morphEnd + 10, 0, E.inOut],
  ]);
  const choose = kf(f, [
    [T.choose, 0],
    [T.choose + 3, 1, E.out],
    [T.choose + 11, 0, E.inOut],
  ]);
  const k = toPin * (1 - prog(f, T.unmorph, T.unmorph + 16, E.inOut));
  let pos: Pt = f < T.morphStart ? eye : [pinX, f < T.morphEnd ? pinY : PIN_AT[1]];
  let scale = lerp(EYES.scale, PIN_SCALE, toPin) * (1 + 0.06 * choose);
  if (f >= T.unmorph) scale = lerp(PIN_SCALE, 5.4, prog(f, T.unmorph, T.unmorph + 16));
  // Fly to the "o" in "Go", tracking the camera so it lands exactly on the glyph.
  const fly = prog(f, 180, landA, E.inOut);
  if (fly > 0) {
    const target = cam.toScreen(ring.center);
    const lift = Math.sin(Math.PI * fly) * -120;
    pos = [lerp(PIN_AT[0], target[0], fly), lerp(PIN_AT[1], target[1], fly) + lift];
    scale = lerp(5.4, cam.unit, fly);
  }
  const pupilR = Math.min(4.4, ring.innerHalf[0] * 0.62);
  return {
    pos,
    scale: scale * pop,
    rot: g[0] * 7 * (1 - toPin) + kf(f, [[180, 0], [192, -200, E.inOut], [landA, -360, E.out]]),
    sx: 1 + 0.12 * squash,
    sy: (1 - 0.14 * squash) * blink,
    k,
    fill: ringFill(f),
    pupil: [g[0] * (ring.innerHalf[0] - pupilR - 0.5), g[1] * (ring.innerHalf[1] - pupilR - 0.5)],
    pupilR: pupilR * (1 - prog(f, T.morphStart, T.morphStart + 8)),
    visible: f < landA,
  };
};

const ringB = (f: number, cam: ReturnType<typeof camera>, landB: number, ring: RingContours): RingState => {
  const g = gaze(f);
  const pop = kf(f, [
    [T.ringPopB, 0],
    [T.ringPopB + 11, 1, E.bigBack],
  ]);
  const driftX = kf(f, [
    [T.lookLeft + 1, 0],
    [T.lookLeft + 7, -28, E.out],
    [T.lookRight + 1, -28],
    [T.lookRight + 7, 24, E.out],
    [T.boneIn + 11, 24],
    [T.boneIn + 17, 0],
  ]);
  const blink = kf(f, [
    [T.cursorMiss + 11, 1],
    [T.cursorMiss + 13, 0.12, E.in],
    [T.cursorMiss + 16, 1, E.out],
  ]);
  const toBtn = prog(f, T.morphStart + 2, T.morphEnd + 2, E.inOut);
  const eye: Pt = [EYES.b[0] + driftX, EYES.b[1] + Math.sin(f / 7 + 0.6) * 5 * (1 - toBtn)];
  const press = kf(f, [
    [T.book, 0],
    [T.book + 3, 1, E.out],
    [T.book + 10, 0, E.back],
  ]);
  const k = toBtn * (1 - prog(f, T.unmorph, T.unmorph + 16, E.inOut));
  // Swings out of the pin's way in a low arc, ending under it.
  const arc = Math.sin(Math.PI * toBtn) * 140;
  let pos: Pt = [lerp(eye[0], BUTTON_AT[0], toBtn) + arc, lerp(eye[1], BUTTON_AT[1], toBtn)];
  let scale = lerp(EYES.scale, BUTTON_SCALE, toBtn) * (1 - 0.1 * press);
  if (f >= T.unmorph) scale = lerp(BUTTON_SCALE, 5.4, prog(f, T.unmorph, T.unmorph + 16));
  const fly = prog(f, 182, landB, E.inOut);
  if (fly > 0) {
    const target = cam.toScreen(ring.center);
    const lift = Math.sin(Math.PI * fly) * 160;
    pos = [lerp(BUTTON_AT[0], target[0], fly) + lift * 0.6, lerp(BUTTON_AT[1], target[1], fly) - lift];
    scale = lerp(5.4, cam.unit, fly);
  }
  const pupilR = Math.min(4.4, ring.innerHalf[0] * 0.62);
  return {
    pos,
    scale: scale * pop,
    rot: g[0] * 7 * (1 - toBtn) + kf(f, [[182, 0], [196, 200, E.inOut], [landB, 360, E.out]]),
    sx: 1,
    sy: blink,
    k,
    fill: ringFill(f),
    pupil: [g[0] * (ring.innerHalf[0] - pupilR - 0.5), g[1] * (ring.innerHalf[1] - pupilR - 0.5)],
    pupilR: pupilR * (1 - prog(f, T.morphStart, T.morphStart + 8)),
    visible: f < landB,
  };
};

// ---------------------------------------------------------------------------------------------
// Small actors
// ---------------------------------------------------------------------------------------------

const Bone: React.FC<{stroke?: number}> = ({stroke = 7}) => {
  const {shaft, knobs, knobR} = BONE_PARTS;
  const parts = (extra: React.SVGProps<SVGElement>) => (
    <>
      <rect x={shaft.x} y={shaft.y} width={shaft.w} height={shaft.h} rx={shaft.r} {...(extra as React.SVGProps<SVGRectElement>)} />
      {knobs.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={knobR} {...(extra as React.SVGProps<SVGCircleElement>)} />
      ))}
    </>
  );
  // Outline pass then fill pass gives one clean silhouette with an ink edge like the mascot's.
  return (
    <g>
      {parts({fill: C.ink, stroke: C.ink, strokeWidth: stroke, strokeLinejoin: 'round'})}
      {parts({fill: C.gold})}
      <path d="M-30 -3.5 L18 -3.5" stroke={C.white} strokeOpacity={0.7} strokeWidth={3.2} strokeLinecap="round" />
    </g>
  );
};

const Spark: React.FC<{x: number; y: number; r: number}> = ({x, y, r}) =>
  r <= 0.01 ? null : (
    <path d={SPARK_D} transform={`translate(${x} ${y}) scale(${r})`} fill={C.gold} stroke={C.ink} strokeWidth={2.2 / r} strokeLinejoin="round" />
  );

const Rays: React.FC<{at: Pt; t: number; r0: number; r1: number; color: string; width: number; n?: number; rot?: number}> = ({at, t, r0, r1, color, width, n = 8, rot = 0}) => {
  if (t <= 0 || t >= 1) return null;
  const head = lerp(r0, r1, E.out(t));
  const tail = lerp(r0, r1, E.in(t));
  return (
    <g transform={`translate(${at[0]} ${at[1]}) rotate(${rot})`}>
      {Array.from({length: n}, (_, i) => {
        const a = (2 * Math.PI * i) / n;
        return (
          <line
            key={i}
            x1={Math.cos(a) * tail}
            y1={Math.sin(a) * tail}
            x2={Math.cos(a) * head}
            y2={Math.sin(a) * head}
            stroke={color}
            strokeWidth={width}
            strokeLinecap="round"
          />
        );
      })}
    </g>
  );
};

const Ripple: React.FC<{at: Pt; t: number; r: number; color: string; width: number}> = ({at, t, r, color, width}) =>
  t <= 0 || t >= 1 ? null : (
    <circle cx={at[0]} cy={at[1]} r={r * E.out(t)} fill="none" stroke={color} strokeWidth={width * (1 - t)} opacity={1 - t * 0.6} />
  );

const rectOf = ({r, ...box}: {x: number; y: number; width: number; height: number; r?: number}) => ({...box, rx: r ?? 0});

const Desk: React.FC = () => (
  <g fill={C.ink}>
    <rect {...rectOf(DESK.monitor)} />
    <rect {...rectOf(DESK.screen)} fill={C.cyan} />
    <rect {...rectOf(DESK.stand)} />
    <rect {...rectOf(DESK.top)} />
    {DESK.legs.map((l, i) => (
      <rect key={i} {...l} rx={0.5} />
    ))}
  </g>
);

/** Calendar glyph on the booking button (logo units); it flips into the check on the click. */
const Calendar: React.FC = () => (
  <g fill="none" stroke={C.white} strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round">
    <rect x={-8} y={-6.2} width={16} height={14} rx={2.2} />
    <path d="M-8 -1.8 H8" />
    <path d="M-4 -8.6 V-4.4 M4 -8.6 V-4.4" />
    <circle cx={-3.6} cy={2.8} r={0.4} fill={C.white} />
    <circle cx={0} cy={2.8} r={0.4} fill={C.white} />
    <circle cx={3.6} cy={2.8} r={0.4} fill={C.white} />
  </g>
);

// ---------------------------------------------------------------------------------------------
// Composition
// ---------------------------------------------------------------------------------------------

export const GoFloatersLogo: React.FC = () => {
  const f = useCurrentFrame();
  const logo = useLogo();
  const targets = useMemo(
    () => ({pin: pinOutline(RING_SAMPLES), btn: circle(BUTTON_R, RING_SAMPLES), hole: circle(PIN.hole, RING_SAMPLES), dot: circle(0.01, RING_SAMPLES)}),
    [],
  );
  if (!logo) return <AbsoluteFill style={{backgroundColor: C.white}} />;

  return (
    <AbsoluteFill style={{backgroundColor: C.white}}>
      <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        {f >= T.exact ? <FinalLogo logo={logo} /> : <Animated f={f} logo={logo} targets={targets} />}
      </svg>
      <Sfx />
    </AbsoluteFill>
  );
};

/** The finished lock-up: the supplied SVG's four groups, in order, one uniform scale. Nothing else. */
const FinalLogo: React.FC<{logo: Logo}> = ({logo}) => (
  <g transform={`translate(${LOGO_ORIGIN[0]} ${LOGO_ORIGIN[1]}) scale(${LOGO_SCALE})`}>
    <GroupEl g={logo.groups.mascot} />
    <GroupEl g={logo.groups.speed} />
    <GroupEl g={logo.groups.wordmark} />
    <GroupEl g={logo.groups.tagline} />
  </g>
);

type Targets = {pin: Pt[]; btn: Pt[]; hole: Pt[]; dot: Pt[]};

const Animated: React.FC<{f: number; logo: Logo; targets: Targets}> = ({f, logo, targets}) => {
  const cam = camera(f);
  const letterStart = (i: number) => T.letters + i * LETTER_STEP;
  const landA = letterStart(1) + LETTER_DUR;
  const landB = letterStart(4) + LETTER_DUR;
  const a = ringA(f, cam, landA, logo.ringBold);
  const b = ringB(f, cam, landB, logo.ringLight);

  // ----- plane on its sweep -----
  const p = flightP(f);
  const planeOn = f >= T.planeIn && f < T.planeOut + 2;
  const planePos = bez(FLIGHT, p);
  const planeRot = Math.max(-42, Math.min(8, bezAngle(FLIGHT, p))) * 0.85;
  const planeScale = 3.1 + Math.sin(Math.PI * p) * 0.6;
  const planeT = (q: Pt): Pt => {
    const r = (planeRot * Math.PI) / 180;
    const x = (q[0] - PLANE_CENTRE[0]) * planeScale;
    const y = (q[1] - PLANE_CENTRE[1]) * planeScale;
    return [planePos[0] + x * Math.cos(r) - y * Math.sin(r), planePos[1] + x * Math.sin(r) + y * Math.cos(r)];
  };

  // ----- wipes: aqua rides right behind Tilo, white chases it -----
  const aquaHead = Math.max(0, p - 0.015);
  const aquaW = kf(f, [
    [T.planeIn, 160],
    [T.planeIn + 14, 620, E.in],
    [T.planeOut - 2, 3200, E.in],
  ]);
  const whiteW = kf(f, [
    [T.whiteWipe - 4, 0],
    [T.whiteWipe + 2, 90, E.out],
    [T.whiteWipe + 18, 3400, E.in],
  ]);

  // ----- bone -----
  const boneIn = kf(f, [
    [T.boneIn, 0],
    [T.boneIn + 9, 1, E.bigBack],
  ]);
  const hop = prog(f, T.dodge, T.dodge + 11, E.inOut);
  let bonePos: Pt = [lerp(BONE_HOME[0], BONE_DODGE[0], hop), lerp(BONE_HOME[1], BONE_DODGE[1], hop) - Math.sin(Math.PI * hop) * 210];
  bonePos[1] += Math.sin(f / 5) * 6 * (f < T.dodge ? 1 : 0);
  let boneRot = -360 * hop + Math.sin(f / 4) * 6 * (f < T.dodge ? 1 : 0);
  // The tease: a smug wiggle while the cursor stands there.
  if (f >= T.dodge + 13 && f < T.pauseEnd) boneRot += Math.sin((f - T.dodge - 13) * 1.3) * 12;
  const land = kf(f, [
    [T.dodge + 11, 0],
    [T.dodge + 13, 1, E.out],
    [T.dodge + 18, 0, E.inOut],
  ]);
  const caught = kf(f, [
    [T.catch, 0],
    [T.catch + 2, 1, E.out],
    [T.catch + 8, 0, E.back],
  ]);
  let boneScale = BONE_SCALE * boneIn * (1 - 0.25 * caught);
  const park = prog(f, T.park, T.park + 14, E.inOut);
  if (park > 0) {
    bonePos = [lerp(BONE_DODGE[0], BONE_PARK[0], park), lerp(BONE_DODGE[1], BONE_PARK[1], park) - Math.sin(Math.PI * park) * 120 + Math.sin(f / 6) * 5 * park];
    boneRot = lerp(0, -18, park) + Math.sin(f / 8) * 4 * park;
    boneScale = lerp(boneScale, BONE_SCALE * 0.55, park);
  }
  // Tilo snaps it up on the way past.
  const gulp = prog(f, T.gulp - 7, T.gulp, E.in);
  const mouth = planeT(PLANE_MOUTH);
  if (gulp > 0) {
    bonePos = lerpPt(bonePos, mouth, gulp);
    boneScale *= 1 - gulp;
  }
  const boneOn = f >= T.boneIn && f < T.gulp;

  // ----- cursor -----
  const sweep = prog(f, T.cursorIn, T.cursorMiss, E.inOut);
  let cur: Pt = bez(CURSOR_SWEEP, sweep);
  let curRot = kf(f, [
    [T.cursorMiss, 0],
    [T.cursorMiss + 3, -14, E.out],
    [T.cursorMiss + 7, 10, E.inOut],
    [T.cursorMiss + 11, 0, E.inOut],
  ]);
  const zip = prog(f, T.pauseEnd, T.catch, E.in);
  const dodgeGrab: Pt = [BONE_DODGE[0] + 4, BONE_DODGE[1] + 4];
  if (zip > 0) cur = lerpPt(CURSOR_SWEEP[3], dodgeGrab, zip);
  const route: [number, Pt][] = [
    [T.catch + 6, dodgeGrab],
    [T.choicesIn + 6, [CHOICES[0][0] + 10, CHOICES[0][1] - 10]], // hover the other option…
    [T.choose, [PIN_AT[0] + 24, PIN_AT[1] + 30]], // …choose this one
    [T.choose + 6, [PIN_AT[0] + 24, PIN_AT[1] + 30]],
    [T.book, [BUTTON_AT[0] + 20, BUTTON_AT[1] + 26]], // separate booking click
  ];
  for (let i = 1; i < route.length; i++) {
    const [f0, p0] = route[i - 1];
    const [f1, p1] = route[i];
    if (f > f0 && f <= f1) cur = lerpPt(p0, p1, prog(f, f0, f1, E.inOut));
    if (f > f1 && i === route.length - 1) cur = p1;
  }
  const blown = prog(f, T.planeIn + 8, T.planeIn + 20, E.in);
  if (blown > 0) {
    cur = [cur[0] + 760 * blown, cur[1] - 520 * blown];
    curRot += 300 * blown;
  }
  const click = (at: number) =>
    kf(f, [
      [at - 1, 0],
      [at + 1, 1, E.out],
      [at + 6, 0, E.out],
    ]);
  const curScale = CURSOR_SCALE * (1 - 0.18 * Math.max(click(T.catch), click(T.choose), click(T.book)));
  const cursorOn = f >= T.cursorIn && blown < 1;

  // ----- discovery props -----
  const deskIn = kf(f, [
    [T.deskIn, 0],
    [T.deskIn + 10, 1, E.bigBack],
    [T.unmorph, 1],
    [T.unmorph + 7, 0, E.in],
  ]);
  const choiceScale = (i: number) =>
    2.7 *
    kf(f, [
      [T.choicesIn + i * 3, 0],
      [T.choicesIn + i * 3 + 9, 1, E.bigBack],
      [T.choose + 2 + i * 2, 1],
      [T.choose + 10 + i * 2, 0, E.in],
    ]) *
    (1 + (i === 0 ? 0.12 * kf(f, [[T.choicesIn + 4, 0], [T.choicesIn + 7, 1, E.out], [T.choicesIn + 13, 0]]) : 0));
  const calendar = 1 - prog(f, T.book + 1, T.book + 4, E.in);
  const checkDraw = prog(f, T.check, T.check + 9, E.out) * (1 - prog(f, T.unmorph, T.unmorph + 6));
  const shadow = a.k;

  // ----- ring drawing -----
  const ringEl = (s: RingState, rc: RingContours, kind: 'pin' | 'btn') => {
    if (!s.visible || s.scale <= 0.001) return null;
    const outer = morph(rc.outer, kind === 'pin' ? targets.pin : targets.btn, s.k);
    const inner = morph(rc.inner, kind === 'pin' ? targets.hole : targets.dot, s.k);
    return (
      <g transform={`translate(${s.pos[0]} ${s.pos[1]}) rotate(${s.rot}) scale(${s.scale * s.sx} ${s.scale * s.sy})`}>
        <path d={contoursD(outer, inner)} fill={s.fill} fillRule="evenodd" />
        {s.pupilR > 0.05 ? <circle cx={s.pupil[0]} cy={s.pupil[1]} r={s.pupilR} fill={C.ink} /> : null}
        {kind === 'pin' && deskIn > 0.001 ? (
          <g transform={`scale(${deskIn})`}>
            <Desk />
          </g>
        ) : null}
        {kind === 'btn' && s.k > 0.6 ? (
          <>
            {calendar > 0.01 ? (
              <g transform={`scale(${clamp01((s.k - 0.6) / 0.4) * calendar} ${clamp01((s.k - 0.6) / 0.4)})`}>
                <Calendar />
              </g>
            ) : null}
            {checkDraw > 0 ? (
              <path d={CHECK_D} fill="none" stroke={C.white} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${checkDraw} 1`} />
            ) : null}
          </>
        ) : null}
      </g>
    );
  };

  // ----- lock-up pieces (inside the camera) -----
  const letterEls = logo.letters.map((L, i) => {
    const s = letterStart(i);
    if (i === 1 || i === 4) {
      // The o's: drawn by the rings until they land, then the supplied glyph with an impact squash.
      const landAt = s + LETTER_DUR;
      if (f < landAt) return null;
      const q = kf(f, [
        [landAt, 1],
        [landAt + 7, 0, E.out],
      ]);
      return (
        <g key={L.path.id} transform={around(L.center, [0, 0], 0, 1 + 0.14 * q, 1 - 0.14 * q)}>
          <g transform={logo.groups.wordmark.transform}>
            <PathEl p={L.path} />
          </g>
        </g>
      );
    }
    const u = prog(f, s, s + LETTER_DUR, E.linear);
    if (u <= 0) return null;
    const ROT = [-150, 0, 120, -100, 0, 130, -115, 105, -135, 95];
    const DY = [-80, 0, 85, -70, 0, 80, -85, 75, -80, 70];
    const e = E.back(u);
    return (
      <g key={L.path.id} opacity={clamp01(u * 4)} transform={around(L.center, [0, DY[i] * (1 - e)], ROT[i] * (1 - E.out(u)), lerp(0.15, 1, e))}>
        <g transform={logo.groups.wordmark.transform}>
          <PathEl p={L.path} />
        </g>
      </g>
    );
  });

  const wordEls = logo.words.map((w, j) => {
    const s = T.tagline + j * 3;
    const u = prog(f, s, s + 9, E.linear);
    if (u <= 0) return null;
    const e = E.back(u);
    return (
      <g key={j} opacity={clamp01(u * 3)} transform={around(w.center, [0, 12 * (1 - e)], 0, lerp(0.55, 1, e))}>
        <g transform={logo.groups.tagline.transform}>
          {w.paths.map((pp) => (
            <PathEl key={pp.id} p={pp} />
          ))}
        </g>
      </g>
    );
  });

  const landOn = f >= T.planeLand;
  const landDX = kf(f, [
    [T.planeLand, -600],
    [T.planeSettle - 7, 9, E.out], // the one small overshoot…
    [T.planeSettle, 0, E.inOut], // …and the settle
  ]);
  const landDY = kf(f, [
    [T.planeLand, 46],
    [T.planeSettle - 7, -2, E.out],
    [T.planeSettle, 0, E.inOut],
  ]);
  const landRot = kf(f, [
    [T.planeLand, -16],
    [T.planeSettle - 7, 1.5, E.out],
    [T.planeSettle, 0, E.inOut],
  ]);
  const speed = prog(f, T.planeSettle - 10, T.planeSettle, E.out);

  return (
    <>
      {/* scene floor: choices and the pin's shadow (the wipes cover these) */}
      {shadow > 0.01 ? (
        <ellipse cx={PIN_AT[0]} cy={PIN_AT[1] + PIN.tip * PIN_SCALE + 8} rx={70 * shadow * (1 + 0.15 * kf(f, [[T.morphEnd, 0], [T.morphEnd + 3, 1], [T.morphEnd + 10, 0]]))} ry={13 * shadow} fill={C.ink} opacity={0.14} />
      ) : null}
      {CHOICES.map((c, i) => {
        const s = choiceScale(i);
        if (s <= 0.001) return null;
        return (
          <g key={i} transform={`translate(${c[0]} ${c[1]}) scale(${s})`}>
            <path d={contoursD(targets.pin, targets.hole)} fill={C.white} fillRule="evenodd" stroke={C.cyan} strokeWidth={2.6} strokeLinejoin="round" />
          </g>
        );
      })}

      {/* the wipes */}
      {f >= T.planeIn ? (
        <path d={bezD(FLIGHT)} fill="none" stroke={C.cyan} strokeWidth={aquaW} pathLength={1} strokeDasharray={`${aquaHead} 2`} strokeLinecap="butt" />
      ) : null}
      {whiteW > 0 ? <path d={bezD(WHITE_SWEEP)} fill="none" stroke={C.white} strokeWidth={whiteW} /> : null}

      {/* the lock-up assembling under the camera */}
      {f >= T.letters - 2 ? (
        <g transform={cam.transform}>
          {landOn ? (
            <g transform={around(PLANE_CENTRE, [landDX, landDY], landRot, 1)}>
              <GroupEl g={logo.groups.mascot} />
            </g>
          ) : null}
          {speed > 0 ? (
            <g opacity={speed} transform={`translate(64 0) scale(${speed} 1) translate(-64 0)`}>
              <GroupEl g={logo.groups.speed} />
            </g>
          ) : null}
          {letterEls}
          {wordEls}
        </g>
      ) : null}

      {/* the two rings */}
      {ringEl(a, logo.ringBold, 'pin')}
      {ringEl(b, logo.ringLight, 'btn')}

      {/* clicks and catches */}
      <Ripple at={[PIN_AT[0] + 24, PIN_AT[1] + 30]} t={prog(f, T.choose, T.choose + 12, E.linear)} r={60} color={C.ink} width={6} />
      <Ripple at={BUTTON_AT} t={prog(f, T.book + 2, T.book + 20, E.linear)} r={BUTTON_R * BUTTON_SCALE + 70} color={C.cyan} width={14} />
      <Rays at={BONE_DODGE} t={prog(f, T.catch, T.catch + 10, E.linear)} r0={70} r1={150} color={C.ink} width={8} rot={22.5} />

      {/* the Spark Bone */}
      {boneOn && boneScale > 0.001 ? (
        <g transform={`translate(${bonePos[0]} ${bonePos[1]}) rotate(${boneRot}) scale(${boneScale * (1 + 0.2 * land)} ${boneScale * (1 - 0.22 * land)})`}>
          <Bone />
          <Spark x={58} y={-30} r={9 * Math.max(0, Math.sin(f / 3.2))} />
          <Spark x={-56} y={28} r={7 * Math.max(0, Math.sin(f / 3.2 + 2))} />
        </g>
      ) : null}
      <Rays at={mouth} t={prog(f, T.gulp, T.gulp + 9, E.linear)} r0={30} r1={90} color={C.gold} width={9} n={6} />

      {/* the cursor */}
      {cursorOn ? (
        <g transform={`translate(${cur[0]} ${cur[1]}) rotate(${curRot}) scale(${curScale})`}>
          <path d={CURSOR_D} fill={C.ink} stroke={C.white} strokeWidth={2.4} strokeLinejoin="round" />
        </g>
      ) : null}

      {/* Tilo's sweep */}
      {planeOn ? (
        <g transform={`translate(${planePos[0]} ${planePos[1]}) rotate(${planeRot}) scale(${planeScale}) translate(${-PLANE_CENTRE[0]} ${-PLANE_CENTRE[1]})`}>
          <GroupEl g={logo.groups.speed} />
          <GroupEl g={logo.groups.mascot} />
        </g>
      ) : null}
    </>
  );
};
