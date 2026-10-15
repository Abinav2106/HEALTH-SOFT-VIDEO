import React from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';
import {C, COPY, FONT, FPS, HEROES, HeroId, T, heroPath} from '../constants';
import {EASE_IN_OUT, EASE_OUT, lerp, prog, rand} from '../lib/motion';
import {Bookmark, PHONE, Phone, SCREEN} from './Phone';

// R4 — the phone is the fixed anchor. Local timing kept exactly (7.5 s):
// 0.0–0.3 bookmark on light screen → black · 0.3–1.3 lead image enlarges near the top ·
// 1.3–2.8 staggered cards with depth · 2.8–4.1 hold, bookmark below · 4.1–6.5 images accelerate and
// shrink into the bookmark (clipped to the screen, sample-based motion blur) · 6.5–7.5 one bookmark.

const L = (t: number) => t - T.r4.from;
const SW = SCREEN.w;
const SH = SCREEN.h;
const BM = {x: 0.5, y: 0.885, size: 74};

// Stack layout in screen-relative units, matched to R4's 3.0 s frame. z = depth order (higher = front).
type Slot = {id: HeroId; x: number; y: number; w: number; at: number; z: number; aspect: number};
const STACK: Slot[] = [
  {id: 'identity', x: 0.44, y: 0.13, w: 0.36, at: 0.3, z: 1, aspect: 1},
  {id: 'grid', x: 0.58, y: 0.24, w: 0.3, at: 1.3, z: 2, aspect: 1},
  {id: 'formats', x: 0.36, y: 0.35, w: 0.34, at: 1.5, z: 3, aspect: 0.8},
  {id: 'poster', x: 0.66, y: 0.4, w: 0.32, at: 1.7, z: 4, aspect: 1.25},
  {id: 'doubt', x: 0.3, y: 0.5, w: 0.32, at: 1.9, z: 5, aspect: 1},
  {id: 'setup', x: 0.58, y: 0.53, w: 0.4, at: 2.1, z: 6, aspect: 1},
  {id: 'mark', x: 0.42, y: 0.62, w: 0.34, at: 2.3, z: 7, aspect: 1},
  {id: 'logo', x: 0.5, y: 0.73, w: 0.38, at: 2.5, z: 8, aspect: 0.75},
];
// Depth: every later arrival pushes the earlier cards back (smaller, slightly higher) — R4's stack reads
// as receding into the phone, with the newest card nearest.
const RECEDE = {scale: 0.93, rise: 0.012};
const recedeCount = (i: number, t: number) =>
  STACK.slice(i + 1).reduce((acc, later) => acc + Math.min(1, Math.max(0, (t - later.at) / 0.42)), 0);

// Stream: the stack's own cards leave first (top down), then more cards pour in from above.
type Streamer = {id: HeroId; x0: number; y0: number; w0: number; aspect: number; start: number; dur: number; bend: number};
const STREAM: Streamer[] = (() => {
  const list: Streamer[] = STACK.map((s, i) => ({
    id: s.id,
    x0: s.x,
    y0: s.y - RECEDE.rise * (STACK.length - 1 - i),
    w0: s.w * Math.pow(RECEDE.scale, STACK.length - 1 - i),
    aspect: s.aspect,
    start: 4.1 + i * 0.1,
    dur: 0.62 - i * 0.02,
    bend: (s.x - 0.5) * 0.6,
  }));
  const N = 46;
  for (let k = 0; k < N; k++) {
    const u = k / (N - 1);
    const start = 4.3 + Math.pow(u, 0.85) * 1.75 + rand(k, 3) * 0.08; // density rises then tails off before 6.1
    list.push({
      id: HEROES[k % HEROES.length],
      x0: 0.08 + rand(k, 1) * 0.84,
      y0: -0.12 - rand(k, 2) * 0.1,
      w0: 0.22 + rand(k, 4) * 0.26,
      aspect: [1, 0.8, 1.25][k % 3],
      start,
      dur: lerp(0.7, 0.38, u),
      bend: (rand(k, 5) - 0.5) * 0.5,
    });
  }
  return list;
})();

const Card: React.FC<{id: HeroId; x: number; y: number; w: number; aspect: number; opacity?: number; blend?: boolean}> = ({
  id,
  x,
  y,
  w,
  aspect,
  opacity = 1,
  blend,
}) => {
  const pw = w * SW;
  const ph = pw / aspect;
  return (
    <Img
      src={staticFile(heroPath(id))}
      style={{
        position: 'absolute',
        left: x * SW - pw / 2,
        top: y * SH - ph / 2,
        width: pw,
        height: ph,
        objectFit: 'cover',
        borderRadius: pw * 0.09,
        opacity,
        mixBlendMode: blend ? 'plus-lighter' : undefined,
      }}
    />
  );
};

const streamPos = (s: Streamer, t: number) => {
  const p = Math.min(1, Math.max(0, (t - s.start) / s.dur));
  const e = p * p * p; // accelerating
  const x = lerp(s.x0, BM.x, e) + s.bend * Math.sin(Math.PI * e) * 0.35;
  const y = lerp(s.y0, BM.y - 0.02, e);
  const w = lerp(s.w0, 0.04, Math.pow(e, 0.8));
  return {p, x, y, w};
};

const SAMPLES = 8;
const SHUTTER = 0.5 / FPS; // 180° shutter

export const PhoneCascade: React.FC = () => {
  const frame = useCurrentFrame();
  const t = L(frame / FPS);
  if (t < 0 || t >= T.r4.to - T.r4.from) return null;

  const dark = t >= 0.22;
  const head = prog(frame, T.r4.from + 2.85, 0.5, EASE_OUT);
  const bmIn = prog(frame, T.r4.from + 2.75, 0.3, EASE_OUT);
  const bmMove = prog(frame, T.r4.from + 6.3, 0.6, EASE_IN_OUT);
  const bmSel = prog(frame, T.r4.from + 6.45, 0.2);
  const bm = {x: BM.x, y: lerp(BM.y, 0.47, bmMove), size: lerp(BM.size, 120, bmMove)};

  const stackCards: React.ReactNode[] = [];
  const streamCards: React.ReactNode[] = [];
  STACK.forEach((s, i) => {
    const st = STREAM[i];
    if (t < s.at || t >= st.start) return;
    const lead = i === 0;
    const p = prog(frame, T.r4.from + s.at, lead ? 0.75 : 0.42, EASE_OUT);
    const n = recedeCount(i, t);
    // anticipation: a small swell just before the card is pulled into the stream
    const antic = Math.max(0, Math.min(1, (t - (st.start - 0.16)) / 0.16));
    const scale = (lead ? lerp(0.55, 1, p) : lerp(0.6, 1, p)) * Math.pow(RECEDE.scale, n) * (1 + 0.07 * antic * antic);
    const fl = Math.min(1, Math.max(0, (t - 2.6) / 0.4)); // hold: the stack floats a little
    stackCards.push(
      <div key={s.id} style={{position: 'absolute', inset: 0, zIndex: s.z, opacity: Math.min(1, p * 4)}}>
        <Card
          id={s.id}
          x={s.x + 0.004 * Math.sin(2 * Math.PI * 0.5 * t + i) * fl}
          y={s.y + (1 - p) * 0.02 - RECEDE.rise * n + 0.004 * Math.sin(2 * Math.PI * 0.42 * t + i * 1.7) * fl}
          w={s.w * scale}
          aspect={s.aspect}
        />
      </div>,
    );
  });
  STREAM.forEach((s, i) => {
    if (t < s.start || t > s.start + s.dur) return;
    const samples: React.ReactNode[] = [];
    for (let k = 0; k < SAMPLES; k++) {
      const q = streamPos(s, t - (SHUTTER * k) / (SAMPLES - 1));
      if (q.p <= 0) continue;
      samples.push(<Card key={k} id={s.id} x={q.x} y={q.y} w={q.w} aspect={s.aspect} opacity={1 / SAMPLES} blend />);
    }
    streamCards.push(<React.Fragment key={`s${i}`}>{samples}</React.Fragment>);
  });

  return (
    <div style={{position: 'absolute', inset: 0, background: C.white}}>
      <div
        style={{
          position: 'absolute',
          left: 84,
          right: 84,
          top: 214,
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 96,
          letterSpacing: -3.5,
          lineHeight: 1,
          color: C.black,
          textAlign: 'center',
          opacity: head,
          transform: `translateY(${(1 - head) * 18}px)`,
        }}
      >
        {COPY.r4.headline}
      </div>
      <Phone cx={PHONE.cx} cy={PHONE.cy} scale={1} screenBg={dark ? C.black : C.white}>
        {!dark ? (
          <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Bookmark size={200} color={C.black} />
          </div>
        ) : null}
        {stackCards}
        {/* additive layer = exact average of the sub-frame samples over the black screen */}
        <div style={{position: 'absolute', inset: 0, zIndex: 20, isolation: 'isolate'}}>{streamCards}</div>
        {dark && t >= 2.75 ? (
          <div
            style={{
              position: 'absolute',
              zIndex: 30,
              left: bm.x * SW - bm.size / 2,
              top: bm.y * SH - (bm.size * 1.3) / 2,
              opacity: bmIn,
            }}
          >
            <Bookmark size={bm.size} color={bmSel > 0 ? `rgb(255, ${Math.round(lerp(255, 106, bmSel))}, ${Math.round(lerp(255, 0, bmSel))})` : C.white} />
          </div>
        ) : null}
      </Phone>
    </div>
  );
};
