import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {getLength, getPointAtLength, getTangentAtLength} from '@remotion/paths';
import {ASSETS, BOLD, C, COPY, FONT} from '../constants';
import {EASE_IN_OUT, lerp, lerpScale, prog} from '../lib/motion';
import {Tag} from './Tag';
import {Tilo} from './Tilo';
import {Canvas, Trim} from './Trim';

// 8–16 s. Aerial plate under a gentle camera track; one S-shaped cyan route; Tilo follows it;
// Search / Explore / Discover; one pin; the selected workspace card opens a doorway matte that
// grows to fill the frame and hands over to the meeting room (S4 sits underneath, seen through it).

const SEGMENTS = [
  'M -60 1010 C 80 1010 160 720 300 720',
  'M 300 720 C 460 720 480 1100 640 1100',
  'M 640 1100 C 800 1100 820 820 930 820',
];
export const MAP_ROUTE = 'M -60 1010 C 80 1010 160 720 300 720 C 460 720 480 1100 640 1100 C 800 1100 820 820 930 820';
const TOTAL = getLength(MAP_ROUTE);
// Route fraction at the end of segment 1 and segment 2 (where the nodes sit).
const NODE_AT = [1, 2].map((n) => SEGMENTS.slice(0, n).reduce((acc, d) => acc + getLength(d), 0) / TOTAL);
const NODES = [
  {x: 300, y: 720, at: NODE_AT[0]},
  {x: 640, y: 1100, at: NODE_AT[1]},
];
const TARGET = {x: 930, y: 820};

const ROUTE_DRAW = {from: 246, dur: 74};
const TILO_RIDE = {from: 256, dur: 140};
const PIN_AT = 396;
const CARD_IN = {from: 404, dur: 22};
const HOLE_OPEN = {from: 438, dur: 18};
const ZOOM = {from: 450, dur: 40};
export const S3_END = ZOOM.from + ZOOM.dur;

// Workspace card (image 800x1020 → 420x536) and the doorway hole inside it, in card px.
const CARD = {x: 532, y: 872, w: 420, h: 536, border: 10};
const HOLE = {cx: 212, cy: 300, w: 150, h: 290};
const S_END = Math.max(1080 / HOLE.w, 1920 / HOLE.h) * 1.04;

const camera = (f: number) => {
  const t = prog(f, 236, 220, EASE_IN_OUT);
  return {k: lerp(1.0, 1.07, t), tx: lerp(0, -26, t), ty: lerp(6, -18, t)};
};
const toScreen = (f: number, x: number, y: number) => {
  const c = camera(f);
  return {x: 540 + (x - 540) * c.k + c.tx, y: 960 + (y - 960) * c.k + c.ty};
};

/** Card placement on screen: scale s about the hole centre, which travels to frame centre. */
const cardXform = (f: number) => {
  const z = prog(f, ZOOM.from, ZOOM.dur, EASE_IN_OUT);
  const s = lerpScale(1, S_END, z);
  const hc0 = {x: CARD.x + HOLE.cx, y: CARD.y + HOLE.cy};
  const hc = {x: lerp(hc0.x, 540, z), y: lerp(hc0.y, 960, z)};
  return {s, hc, z};
};

export const holeRect = (f: number) => {
  const o = prog(f, HOLE_OPEN.from, HOLE_OPEN.dur, EASE_IN_OUT);
  const {s, hc} = cardXform(f);
  const w = HOLE.w * o * s;
  const h = HOLE.h * o * s;
  return {x: hc.x - w / 2, y: hc.y - h / 2, w, h, open: o};
};

// Half-plane matte x + 0.56·y ≥ c, clipped to the frame — the diagonal of storyboard panel two.
const diagonalMatte = (t: number) => {
  const k = 0.56;
  const c = lerp(1080 + k * 1920 + 40, -40, t);
  const corners: [number, number][] = [[0, 0], [1080, 0], [1080, 1920], [0, 1920]];
  const pts: [number, number][] = [];
  for (let i = 0; i < 4; i++) {
    const a = corners[i];
    const b = corners[(i + 1) % 4];
    const va = a[0] + k * a[1] - c;
    const vb = b[0] + k * b[1] - c;
    if (va >= 0) pts.push(a);
    if (va >= 0 !== vb >= 0) {
      const u = va / (va - vb);
      pts.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]);
    }
  }
  if (pts.length < 3) return 'polygon(0 0, 0 0, 0 0)';
  return `polygon(${pts.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(', ')})`;
};

const Pin: React.FC<{x: number; y: number; p: number}> = ({x, y, p}) => (
  <svg
    width={120}
    height={160}
    viewBox="-60 -140 120 160"
    style={{position: 'absolute', left: x - 60, top: y - 140 - lerp(50, 0, p), opacity: p, overflow: 'visible'}}
  >
    <path d="M0 0 C -8 -24 -38 -46 -38 -76 A38 38 0 1 1 38 -76 C 38 -46 8 -24 0 0Z" fill={C.blue} stroke={C.white} strokeWidth={6} />
    <circle cx={0} cy={-76} r={13} fill={C.white} />
  </svg>
);

const Step: React.FC<{text: string; i: number; f: number}> = ({text, i, f}) => {
  const p = prog(f, 268 + i * 46, 20);
  const top = 1400 + i * 124;
  return (
    <>
      {i > 0 && (
        <div style={{position: 'absolute', left: 92, top: top - 36, width: 18, height: 18, borderRadius: 9, backgroundColor: C.blue, opacity: p}} />
      )}
      <div style={{position: 'absolute', left: 80, top, height: 86, overflow: 'hidden'}}>
        <div
          style={{
            fontFamily: FONT,
            fontWeight: BOLD,
            fontSize: 70,
            lineHeight: '86px',
            letterSpacing: '-0.02em',
            color: C.white,
            transform: `translateY(${lerp(100, 0, p)}%)`,
          }}
        >
          {text}
        </div>
      </div>
    </>
  );
};

export const S3Signal: React.FC<{f: number; preview: boolean}> = ({f, preview}) => {
  const cam = camera(f);
  const draw = prog(f, ROUTE_DRAW.from, ROUTE_DRAW.dur, EASE_IN_OUT);
  const ride = prog(f, TILO_RIDE.from, TILO_RIDE.dur, EASE_IN_OUT) * 0.8; // settles short of the pin
  const len = ride * TOTAL;
  const pt = getPointAtLength(MAP_ROUTE, Math.max(0.01, len)) ?? {x: -200, y: 1010};
  const tan = getTangentAtLength(MAP_ROUTE, Math.max(0.01, len)) ?? {x: 1, y: 0};
  const ang = Math.max(-16, Math.min(16, (Math.atan2(tan.y, tan.x) * 180) / Math.PI));
  const tiloIn = prog(f, TILO_RIDE.from, 10);
  const tiloOut = prog(f, ZOOM.from - 6, 10);
  const pin = prog(f, PIN_AT, 12);
  const pinScreen = toScreen(f, TARGET.x, TARGET.y);
  const cardIn = prog(f, CARD_IN.from, CARD_IN.dur);
  const hole = holeRect(f);
  const xf = cardXform(f);
  const uiOut = prog(f, ZOOM.from, 14);
  const matte = f < 246 ? diagonalMatte(prog(f, 212, 34, EASE_IN_OUT)) : undefined;

  // Everything in S3 is cut by the doorway; the room shows through the hole.
  const holeClip =
    hole.open > 0
      ? `path(evenodd, "M0 0H1080V1920H0Z M${hole.x} ${hole.y}h${hole.w}v${hole.h}h${-hole.w}Z")`
      : undefined;

  const cardLeft = xf.hc.x - HOLE.cx * xf.s;
  const cardTop = xf.hc.y - HOLE.cy * xf.s;
  const growFrom = {x: pinScreen.x - CARD.x, y: pinScreen.y - CARD.y};

  return (
    <AbsoluteFill style={{clipPath: matte ?? holeClip}}>
      {/* camera group: plate + route + Tilo + pin move together */}
      <AbsoluteFill style={{transform: `translate(${cam.tx}px, ${cam.ty}px) scale(${cam.k})`, transformOrigin: '540px 960px'}}>
        <Img src={staticFile(ASSETS.aerial)} style={{position: 'absolute', left: -22, top: 0, width: 1124, height: 1920}} />
        <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(7,28,56,0) 62%, rgba(7,28,56,0.62) 100%)'}} />
        <Canvas>
          <Trim d={MAP_ROUTE} end={draw} width={9} opacity={1 - uiOut} />
          {NODES.map((n, i) => {
            const on = prog(draw, n.at - 0.02, 0.04) * (1 - uiOut);
            return on > 0 ? <circle key={i} cx={n.x} cy={n.y} r={16 * on} fill={C.blue} stroke={C.white} strokeWidth={6} /> : null;
          })}
        </Canvas>
        {tiloIn > 0 && <Tilo x={pt.x} y={pt.y} width={236} rotate={ang} opacity={tiloIn * (1 - tiloOut)} />}
      </AbsoluteFill>

      {COPY.steps.map((s, i) => (
        <div key={s} style={{opacity: 1 - uiOut}}>
          <Step text={s} i={i} f={f} />
        </div>
      ))}

      {/* selected workspace card: grows out of the pin, then becomes the doorway */}
      {cardIn > 0 && (
        <div
          style={{
            position: 'absolute',
            left: cardLeft - CARD.border * xf.s,
            top: cardTop - CARD.border * xf.s,
            width: (CARD.w + CARD.border * 2) * xf.s,
            height: (CARD.h + CARD.border * 2) * xf.s,
            backgroundColor: C.white,
            transform: `scale(${lerp(0.04, 1, cardIn)})`,
            transformOrigin: `${(growFrom.x + CARD.border) * xf.s}px ${(growFrom.y + CARD.border) * xf.s}px`,
            opacity: Math.min(1, cardIn * 3),
          }}
        >
          <Img
            src={staticFile(ASSETS.workspace)}
            style={{position: 'absolute', left: CARD.border * xf.s, top: CARD.border * xf.s, width: CARD.w * xf.s, height: CARD.h * xf.s}}
          />
        </div>
      )}
      {pin > 0 && (
        <div style={{opacity: 1 - prog(f, HOLE_OPEN.from, 10)}}>
          <Pin x={pinScreen.x} y={pinScreen.y} p={pin} />
        </div>
      )}
      {/* doorway frame */}
      {hole.open > 0 && (
        <div
          style={{
            position: 'absolute',
            left: hole.x - 7,
            top: hole.y - 7,
            width: hole.w + 14,
            height: hole.h + 14,
            border: `7px solid ${C.white}`,
            boxSizing: 'border-box',
          }}
        />
      )}
      {preview && <Tag text="Map concept · storyboard plate" x={80} y={1820} dark opacity={1 - uiOut} />}
    </AbsoluteFill>
  );
};
