import React from 'react';
import {AbsoluteFill, Easing, Img, staticFile} from 'remotion';
import {getLength, getPointAtLength, getTangentAtLength} from '@remotion/paths';
import {ASSETS, BOLD, C, COPY, FONT} from '../constants';
import {EASE_IN_OUT, lerp, prog} from '../lib/motion';
import {HL2, MATTE} from './S2Clue';
import {Tilo} from './Tilo';
import {Canvas, Trim} from './Trim';

// C · 8–14 s. "Follow the signal. Explore the workspaces. Get closer."
// The aerial plate opens out of the clue's last highlight (one rectangular matte). The camera
// establishes, accelerates along the one cyan route — with brief background-only glitch bursts —
// and settles as the target is acquired. Tilo flies that same path. The selected workspace crop
// then becomes a window: its photo gives way to the room (D, underneath) and the window opens out.

const SEGMENTS = [
  'M -60 1010 C 80 1010 160 720 300 720',
  'M 300 720 C 460 720 480 1100 640 1100',
  'M 640 1100 C 800 1100 820 820 930 820',
];
// One path, used for both the drawn route and Tilo's position and heading.
export const MAP_ROUTE = SEGMENTS.map((d, i) => (i ? d.replace(/^M [\d.-]+ [\d.-]+ /, '') : d)).join(' ');
const TOTAL = getLength(MAP_ROUTE);
// Route fraction at the end of segments 1 and 2, where the nodes sit.
const NODE_AT = [1, 2].map((n) => SEGMENTS.slice(0, n).reduce((acc, d) => acc + getLength(d), 0) / TOTAL);
const NODES = [
  {x: 300, y: 720, at: NODE_AT[0]},
  {x: 640, y: 1100, at: NODE_AT[1]},
];
const TARGET = {x: 930, y: 820};

// Accelerate, then settle on the target.
const SURGE = Easing.bezier(0.6, 0, 0.25, 1);
const ROUTE_DRAW = {from: 248, dur: 84};
const TILO_RIDE = {from: 252, dur: 100, end: 0.88}; // settles on the route, just short of the pin
const LABEL_AT = 250; // on "Follow the signal"
const PIN_AT = 334; // on "Get closer"
const LOCK = {from: 336, dur: 16};
const CARD_IN = {from: 350, dur: 16};
const PHOTO_OUT = {from: 380, dur: 12}; // the crop's photo gives way to the room as the window opens
const EXPAND = {from: 384, dur: 30};
// Background-only glitch bursts during the acceleration: [first frame, length].
const GLITCH: [number, number][] = [
  [270, 4],
  [292, 5],
  [314, 3],
];

// Workspace crop on screen (image 800x1020) — opens to the left of the pin, clear of Tilo and the label.
const CARD = {x: 300, y: 852, w: 420, h: 536, border: 10};

const camera = (f: number) => {
  const t = prog(f, 244, 106, SURGE);
  return {k: lerp(1.0, 1.12, t), tx: lerp(30, -60, t), ty: lerp(10, -36, t)};
};
const toScreen = (f: number, x: number, y: number) => {
  const c = camera(f);
  return {x: 540 + (x - 540) * c.k + c.tx, y: 960 + (y - 960) * c.k + c.ty};
};

/** 0 outside a burst; inside, a deterministic per-frame strength. */
const glitchAt = (f: number) => {
  for (const [a, n] of GLITCH) if (f >= a && f < a + n) return 0.6 + 0.4 * Math.abs(Math.sin(f * 12.9898));
  return 0;
};
// Deterministic pseudo-random in [-1, 1] for slice i at frame f.
const jitter = (f: number, i: number) => {
  const v = Math.sin(f * 78.233 + i * 37.719) * 43758.5453;
  return (v - Math.floor(v)) * 2 - 1;
};

/** The aerial plate; during a burst it is cut into horizontal slices displaced sideways and
 * blurred along x. Only the background ever glitches. */
const Plate: React.FC<{f: number}> = ({f}) => {
  const g = glitchAt(f);
  const img: React.CSSProperties = {position: 'absolute', left: -22, top: 0, width: 1124, height: 1920};
  if (g === 0) return <Img src={staticFile(ASSETS.aerial)} style={img} />;
  const slices = 7;
  const bands = Array.from({length: slices}, (_, i) => {
    const top = (1920 / slices) * i;
    const shift = jitter(f, i) * 46 * g;
    return (
      <div key={i} style={{position: 'absolute', inset: 0, clipPath: `inset(${top}px 0 ${1920 - top - 1920 / slices}px 0)`, transform: `translateX(${shift}px)`}}>
        <Img src={staticFile(ASSETS.aerial)} style={img} />
      </div>
    );
  });
  return (
    <>
      <svg width={0} height={0} style={{position: 'absolute'}}>
        <filter id="gf-hblur" x="-5%" y="0" width="110%" height="100%">
          <feGaussianBlur stdDeviation={`${14 * g} 0`} />
        </filter>
      </svg>
      <div style={{position: 'absolute', inset: 0, filter: 'url(#gf-hblur)'}}>{bands}</div>
    </>
  );
};

// The highlight's tilted rectangle, each corner travelling to the matching frame corner.
const highlightMatte = (t: number) => {
  const r = (HL2.rot * Math.PI) / 180;
  const quad = [
    [-1, -1, 0, 0],
    [1, -1, 1080, 0],
    [1, 1, 1080, 1920],
    [-1, 1, 0, 1920],
  ].map(([sx, sy, fx, fy]) => {
    const x = (sx * HL2.w) / 2;
    const y = (sy * HL2.h) / 2;
    const px = HL2.cx + x * Math.cos(r) - y * Math.sin(r);
    const py = HL2.cy + x * Math.sin(r) + y * Math.cos(r);
    return `${lerp(px, fx, t).toFixed(1)}px ${lerp(py, fy, t).toFixed(1)}px`;
  });
  return `polygon(${quad.join(', ')})`;
};

const Pin: React.FC<{x: number; y: number; p: number}> = ({x, y, p}) => (
  <svg
    width={120}
    height={160}
    viewBox="-60 -140 120 160"
    style={{position: 'absolute', left: x - 60, top: y - 140 - lerp(44, 0, p), opacity: p, overflow: 'visible'}}
  >
    <path d="M0 0 C -8 -24 -38 -46 -38 -76 A38 38 0 1 1 38 -76 C 38 -46 8 -24 0 0Z" fill={C.blue} stroke={C.white} strokeWidth={6} />
    <circle cx={0} cy={-76} r={13} fill={C.white} />
  </svg>
);

export const S3Signal: React.FC<{f: number}> = ({f}) => {
  const cam = camera(f);
  const draw = prog(f, ROUTE_DRAW.from, ROUTE_DRAW.dur, SURGE);
  const ride = prog(f, TILO_RIDE.from, TILO_RIDE.dur, SURGE) * TILO_RIDE.end;
  const len = Math.max(0.01, ride * TOTAL);
  const pt = getPointAtLength(MAP_ROUTE, len) ?? {x: -200, y: 1010};
  const tan = getTangentAtLength(MAP_ROUTE, len) ?? {x: 1, y: 0};
  const heading = Math.max(-16, Math.min(16, (Math.atan2(tan.y, tan.x) * 180) / Math.PI));
  const pin = prog(f, PIN_AT, 10);
  const pinScreen = toScreen(f, TARGET.x, TARGET.y);
  const lock = prog(f, LOCK.from, LOCK.dur);
  const cardIn = prog(f, CARD_IN.from, CARD_IN.dur);
  const ex = prog(f, EXPAND.from, EXPAND.dur, EASE_IN_OUT);
  const uiOut = prog(f, EXPAND.from, 10);
  const label = prog(f, LABEL_AT, 16);

  const m = prog(f, MATTE.from, MATTE.dur, EASE_IN_OUT);
  const matte = f < MATTE.from + MATTE.dur ? highlightMatte(m) : undefined;

  const card = {
    x: lerp(CARD.x, 0, ex),
    y: lerp(CARD.y, 0, ex),
    w: lerp(CARD.w, 1080, ex),
    h: lerp(CARD.h, 1920, ex),
    b: lerp(CARD.border, 0, ex),
  };
  const growFrom = {x: pinScreen.x - CARD.x, y: pinScreen.y - CARD.y};
  // Window = the card's inner rectangle; everything in C is cut by it once it starts to open.
  const win = {x: card.x + card.b, y: card.y + card.b, w: card.w - card.b * 2, h: card.h - card.b * 2};
  const windowOpen = f >= PHOTO_OUT.from;
  const clip = matte ?? (windowOpen ? `path(evenodd, "M0 0H1080V1920H0Z M${win.x} ${win.y}h${win.w}v${win.h}h${-win.w}Z")` : undefined);
  const photo = 1 - prog(f, PHOTO_OUT.from, PHOTO_OUT.dur, EASE_IN_OUT);

  return (
    <>
      <AbsoluteFill style={{clipPath: clip, opacity: prog(f, MATTE.from - 4, 6)}}>
        {/* camera group: plate, route and Tilo share one transform, so route and aircraft stay locked */}
        <AbsoluteFill style={{transform: `translate(${cam.tx}px, ${cam.ty}px) scale(${cam.k})`, transformOrigin: '540px 960px'}}>
          <Plate f={f} />
          <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(7,28,56,0) 64%, rgba(7,28,56,0.6) 100%)'}} />
          <Canvas>
            <Trim d={MAP_ROUTE} end={draw} width={9} opacity={1 - uiOut} />
            {NODES.map((n, i) => {
              const on = prog(draw, n.at - 0.02, 0.04) * (1 - uiOut);
              return on > 0 ? <circle key={i} cx={n.x} cy={n.y} r={16 * on} fill={C.blue} stroke={C.white} strokeWidth={6} /> : null;
            })}
          </Canvas>
          {f >= TILO_RIDE.from && (
            <Tilo f={f} x={pt.x} y={pt.y} width={236} rotate={heading} opacity={prog(f, TILO_RIDE.from, 6) * (1 - uiOut)} />
          )}
        </AbsoluteFill>

        <div style={{position: 'absolute', left: 80, top: 1660, height: 96, overflow: 'hidden', opacity: 1 - uiOut}}>
          <div style={{fontFamily: FONT, fontWeight: BOLD, fontSize: 80, lineHeight: '96px', letterSpacing: '-0.02em', color: C.white, transform: `translateY(${lerp(100, 0, label)}%)`}}>
            {COPY.signal}
          </div>
        </div>

        {/* the selected workspace: one crop, grown from the pin, then opened as a window */}
        {cardIn > 0 && (
          <div
            style={{
              position: 'absolute',
              left: card.x,
              top: card.y,
              width: card.w,
              height: card.h,
              backgroundColor: C.white,
              transform: `scale(${lerp(0.04, 1, cardIn)})`,
              transformOrigin: `${growFrom.x}px ${growFrom.y}px`,
              opacity: Math.min(1, cardIn * 3),
            }}
          >
            {!windowOpen && (
              <Img
                src={staticFile(ASSETS.workspace)}
                style={{position: 'absolute', left: card.b, top: card.b, width: card.w - card.b * 2, height: card.h - card.b * 2, objectFit: 'cover'}}
              />
            )}
          </div>
        )}
        {pin > 0 && (
          <div style={{opacity: 1 - uiOut}}>
            <Pin x={pinScreen.x} y={pinScreen.y} p={pin} />
            {/* target lock: one ring closing onto the pin */}
            {lock > 0 && lock < 1 && (
              <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
                <circle cx={pinScreen.x} cy={pinScreen.y - 76} r={lerp(150, 52, lock)} fill="none" stroke={C.blue} strokeWidth={6} opacity={1 - lock * 0.9} />
              </svg>
            )}
          </div>
        )}
      </AbsoluteFill>
      {/* the crop's photo, above the cut, fading to reveal the room inside the same rectangle */}
      {windowOpen && photo > 0 && (
        <Img src={staticFile(ASSETS.workspace)} style={{position: 'absolute', left: win.x, top: win.y, width: win.w, height: win.h, objectFit: 'cover', opacity: photo}} />
      )}
    </>
  );
};
