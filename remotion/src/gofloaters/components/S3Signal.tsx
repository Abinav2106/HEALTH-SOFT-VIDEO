import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {getLength, getPointAtLength, getTangentAtLength} from '@remotion/paths';
import {ASSETS, BOLD, C, COPY, FONT} from '../constants';
import {EASE_IN_OUT, lerp, prog} from '../lib/motion';
import {HL2, MATTE} from './S2Clue';
import {Tilo} from './Tilo';
import {Canvas, Trim} from './Trim';

// 8–16 s. "Search the map. Explore the workspaces. Follow the clue until the right place comes into view."
// The aerial plate opens out of the clue's last highlight (one rectangular matte), the camera
// tracks gently toward the target, one cyan route is drawn and Tilo flies that same path, one pin
// marks the workspace, and its single crop becomes a window: the photo fades to reveal the room
// (S4, underneath) and the window opens to the full frame.

const SEGMENTS = [
  'M -60 1010 C 80 1010 160 720 300 720',
  'M 300 720 C 460 720 480 1100 640 1100',
  'M 640 1100 C 800 1100 820 820 930 820',
];
// One path, used for both the drawn route and Tilo's position/heading.
export const MAP_ROUTE = SEGMENTS.map((d, i) => (i ? d.replace(/^M [\d.-]+ [\d.-]+ /, '') : d)).join(' ');
const TOTAL = getLength(MAP_ROUTE);
// Route fraction at the end of segments 1 and 2, where the nodes sit.
const NODE_AT = [1, 2].map((n) => SEGMENTS.slice(0, n).reduce((acc, d) => acc + getLength(d), 0) / TOTAL);
const NODES = [
  {x: 300, y: 720, at: NODE_AT[0]},
  {x: 640, y: 1100, at: NODE_AT[1]},
];
const TARGET = {x: 930, y: 820};

const ROUTE_DRAW = {from: 250, dur: 80};
const TILO_RIDE = {from: 256, dur: 136, end: 0.88}; // settles on the route, just short of the pin
const STEPS_AT = [254, 288, 392]; // on "Search…", "Explore…", "…comes into view"
const PIN_AT = 396;
const CARD_IN = {from: 402, dur: 20};
const EXPAND = {from: 430, dur: 28};
const PHOTO_OUT = {from: 432, dur: 12}; // the crop's photo gives way to the room as the window opens

// Workspace crop on screen (image 800x1020) — opens to the left of the pin, clear of Tilo and the steps.
const CARD = {x: 300, y: 852, w: 420, h: 536, border: 10};

const camera = (f: number) => {
  const t = prog(f, 300, 150, EASE_IN_OUT);
  return {k: lerp(1.0, 1.1, t), tx: lerp(0, -48, t), ty: lerp(0, -30, t)};
};
const toScreen = (f: number, x: number, y: number) => {
  const c = camera(f);
  return {x: 540 + (x - 540) * c.k + c.tx, y: 960 + (y - 960) * c.k + c.ty};
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

const Step: React.FC<{text: string; i: number; f: number}> = ({text, i, f}) => {
  const p = prog(f, STEPS_AT[i], 18);
  const top = 1420 + i * 128;
  return (
    <>
      {i > 0 && <div style={{position: 'absolute', left: 92, top: top - 38, width: 18, height: 18, borderRadius: 9, backgroundColor: C.blue, opacity: p}} />}
      <div style={{position: 'absolute', left: 80, top, height: 88, overflow: 'hidden'}}>
        <div style={{fontFamily: FONT, fontWeight: BOLD, fontSize: 72, lineHeight: '88px', letterSpacing: '-0.02em', color: C.white, transform: `translateY(${lerp(100, 0, p)}%)`}}>
          {text}
        </div>
      </div>
    </>
  );
};

export const S3Signal: React.FC<{f: number}> = ({f}) => {
  const cam = camera(f);
  const draw = prog(f, ROUTE_DRAW.from, ROUTE_DRAW.dur, EASE_IN_OUT);
  const ride = prog(f, TILO_RIDE.from, TILO_RIDE.dur, EASE_IN_OUT) * TILO_RIDE.end;
  const len = Math.max(0.01, ride * TOTAL);
  const pt = getPointAtLength(MAP_ROUTE, len) ?? {x: -200, y: 1010};
  const tan = getTangentAtLength(MAP_ROUTE, len) ?? {x: 1, y: 0};
  const heading = Math.max(-16, Math.min(16, (Math.atan2(tan.y, tan.x) * 180) / Math.PI));
  const pin = prog(f, PIN_AT, 12);
  const pinScreen = toScreen(f, TARGET.x, TARGET.y);
  const cardIn = prog(f, CARD_IN.from, CARD_IN.dur);
  const ex = prog(f, EXPAND.from, EXPAND.dur, EASE_IN_OUT);
  const uiOut = prog(f, EXPAND.from, 12);

  // The one matte: the clue's last highlight rectangle opening to the full frame.
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
  // Window = the card's inner rectangle; everything in S3 is cut by it once it starts to open.
  const win = {x: card.x + card.b, y: card.y + card.b, w: card.w - card.b * 2, h: card.h - card.b * 2};
  const windowOpen = f >= PHOTO_OUT.from;
  const clip = matte ?? (windowOpen ? `path(evenodd, "M0 0H1080V1920H0Z M${win.x} ${win.y}h${win.w}v${win.h}h${-win.w}Z")` : undefined);
  const photo = 1 - prog(f, PHOTO_OUT.from, PHOTO_OUT.dur, EASE_IN_OUT);

  return (
    <>
    <AbsoluteFill style={{clipPath: clip, opacity: prog(f, MATTE.from - 4, 6)}}>
      {/* camera group: plate, route and Tilo share one transform, so route and aircraft stay locked */}
      <AbsoluteFill style={{transform: `translate(${cam.tx}px, ${cam.ty}px) scale(${cam.k})`, transformOrigin: '540px 960px'}}>
        <Img src={staticFile(ASSETS.aerial)} style={{position: 'absolute', left: -22, top: 0, width: 1124, height: 1920}} />
        <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(7,28,56,0) 60%, rgba(7,28,56,0.6) 100%)'}} />
        <Canvas>
          <Trim d={MAP_ROUTE} end={draw} width={9} opacity={1 - uiOut} />
          {NODES.map((n, i) => {
            const on = prog(draw, n.at - 0.02, 0.04) * (1 - uiOut);
            return on > 0 ? <circle key={i} cx={n.x} cy={n.y} r={16 * on} fill={C.blue} stroke={C.white} strokeWidth={6} /> : null;
          })}
        </Canvas>
        {f >= TILO_RIDE.from && (
          <Tilo f={f} x={pt.x} y={pt.y} width={236} rotate={heading} opacity={prog(f, TILO_RIDE.from, 8) * (1 - uiOut)} />
        )}
      </AbsoluteFill>

      {COPY.steps.map((s, i) => (
        <div key={s} style={{opacity: 1 - uiOut}}>
          <Step text={s} i={i} f={f} />
        </div>
      ))}

      {/* the selected workspace: one crop, grown from the pin, then expanded to fill the frame */}
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
