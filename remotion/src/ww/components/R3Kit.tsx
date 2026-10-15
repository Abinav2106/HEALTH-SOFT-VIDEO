import React from 'react';
import {C, FONT, FPS, HEIGHT, WIDTH} from '../constants';
import {EASE_EXPAND, EASE_OUT, EASE_RISE, lerp, prog} from '../lib/motion';

// Shared R3 grammar: cards rise from below with a small settling rotation; copy builds word by word;
// a lead panel's interior changes to the next scene's colour, then the panel grows until that interior
// IS the next scene. No transition presets.

/** Secondary life on resting cards (R3: background cards never freeze). Seeded, frame-pure. */
export const alive = (frame: number, seed: number, amp: number, on = 1) => {
  const t = frame / FPS;
  const ph = (seed % 97) * 0.37;
  return {
    r: amp * Math.sin(2 * Math.PI * 0.33 * t + ph) * on,
    y: amp * 4 * Math.sin(2 * Math.PI * 0.27 * t + ph * 1.3) * on,
    x: amp * 2.5 * Math.sin(2 * Math.PI * 0.21 * t + ph * 0.7) * on,
  };
};

/** Small hand-keyed settle after a drop: lands, rebounds once, rests (R3 coins). Returns y offset px. */
export const dropY = (frame: number, at: number, from = -260, dur = 0.42) => {
  const t = frame / FPS - at;
  if (t <= 0) return from;
  if (t < dur) {
    const k = t / dur;
    return from * (1 - k * k); // accelerating fall
  }
  const b = t - dur;
  if (b < 0.22) return -26 * Math.sin((Math.PI * b) / 0.22); // one rebound
  return 0;
};

/** Card entrance: rises from below, rotation settles to its resting angle. */
export const rise = (frame: number, at: number, dur = 0.55) => {
  const p = prog(frame, at, dur, EASE_RISE);
  return {p, dy: (1 - p) * 1150, drot: (1 - p) * -7};
};

export const Card: React.FC<{
  frame: number;
  at: number;
  x: number; // centre
  y: number;
  w: number;
  h: number;
  rot: number;
  r?: number;
  bg: string;
  shadow?: boolean;
  exitAt?: number;
  z?: number;
  drift?: number; // R3 keeps every resting card alive: slow rotation / float, degrees
  children?: React.ReactNode;
}> = ({frame, at, x, y, w, h, rot, r = 28, bg, shadow = true, exitAt, z, drift = 1.6, children}) => {
  const e = rise(frame, at);
  const out = exitAt === undefined ? 0 : prog(frame, exitAt, 0.45, (v) => v * v * v);
  const d = alive(frame, x + y, drift, e.p);
  return (
    <div
      style={{
        position: 'absolute',
        left: x - w / 2,
        top: y - h / 2,
        width: w,
        height: h,
        borderRadius: r,
        background: bg,
        overflow: 'hidden',
        zIndex: z,
        transform: `translate(${d.x}px, ${e.dy + out * 1500 + d.y}px) rotate(${rot + e.drot + out * 6 + d.r}deg)`,
        boxShadow: shadow ? '0 18px 40px rgba(0,0,0,0.16), 0 2px 6px rgba(0,0,0,0.08)' : undefined,
      }}
    >
      {children}
    </div>
  );
};

/** Service label pill + headline that builds one word at a time (R3 benefit copy). */
export const Copy: React.FC<{
  frame: number;
  at: number;
  label: string;
  headline: string;
  ink: string;
  pillBg: string;
  pillInk: string;
  exitAt?: number;
}> = ({frame, at, label, headline, ink, pillBg, pillInk, exitAt}) => {
  const pill = prog(frame, at, 0.4);
  const out = exitAt === undefined ? 0 : prog(frame, exitAt, 0.4, (v) => v * v);
  const words = headline.split(' ');
  return (
    <div style={{position: 'absolute', left: 84, right: 84, top: 236, opacity: 1 - out, transform: `translateY(${-out * 40}px)`}}>
      <div
        style={{
          display: 'inline-block',
          padding: '12px 26px',
          borderRadius: 999,
          background: pillBg,
          color: pillInk,
          fontFamily: FONT,
          fontWeight: 500,
          fontSize: 32,
          letterSpacing: -0.2,
          opacity: pill,
          transform: `translateY(${(1 - pill) * 16}px)`,
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 34,
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 116,
          lineHeight: 1.0,
          letterSpacing: -4,
          color: ink,
        }}
      >
        {words.map((w, i) => {
          const p = prog(frame, at + 0.22 + i * 0.13, 0.3, EASE_OUT);
          return (
            <span key={i} style={{display: 'inline-block', marginRight: 26, opacity: p < 0.02 ? 0 : 0.35 + 0.65 * p, transform: `translateY(${(1 - p) * 14}px)`, visibility: p <= 0 ? 'hidden' : 'visible'}}>
              {w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/** Lead panel that becomes the next scene. `inner` is shown inside the frame until `swapAt`, then the
 *  interior turns `nextBg`; from `expandAt` the whole panel grows until the interior fills the frame. */
export const ExpandingPanel: React.FC<{
  frame: number;
  at: number;
  x: number;
  y: number;
  w: number;
  h: number;
  rot: number;
  frameColor: string;
  inset: number;
  innerBg: string;
  nextBg: string;
  swapAt: number;
  expandAt: number;
  r?: number;
  children?: React.ReactNode;
}> = ({frame, at, x, y, w, h, rot, frameColor, inset, innerBg, nextBg, swapAt, expandAt, r = 44, children}) => {
  const e = rise(frame, at);
  const clear = prog(frame, swapAt - 0.08, 0.16, (v) => v * v);
  const swap = prog(frame, swapAt, 0.1);
  const ex = prog(frame, expandAt, 0.55, EASE_EXPAND);
  const iw = w - inset * 2;
  const ih = h - inset * 2;
  const S = Math.max(WIDTH / iw, HEIGHT / ih) * 1.08;
  const scale = lerp(1, S, ex);
  const d = alive(frame, x * 3 + y, 1.2, e.p * (1 - ex));
  const rotNow = (rot + e.drot) * (1 - ex) + d.r;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - w / 2,
        top: y - h / 2,
        width: w,
        height: h,
        zIndex: 5,
        transform: `translate(${(WIDTH / 2 - x) * ex + d.x}px, ${(HEIGHT / 2 - y) * ex + e.dy + d.y}px) rotate(${rotNow}deg) scale(${scale})`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: r,
          background: frameColor,
          boxShadow: `0 ${22 * (1 - ex)}px ${48 * (1 - ex)}px rgba(0,0,0,${0.18 * (1 - ex)})`,
        }}
      />
      <div style={{position: 'absolute', left: inset, top: inset, width: iw, height: ih, borderRadius: r * 0.7, overflow: 'hidden', background: innerBg}}>
        <div style={{position: 'absolute', inset: 0, opacity: 1 - clear, transform: `translateY(${clear * 120}px)`}}>{children}</div>
        <div style={{position: 'absolute', inset: 0, background: nextBg, opacity: swap}} />
      </div>
    </div>
  );
};

export const Scene: React.FC<{bg: string; children: React.ReactNode}> = ({bg, children}) => (
  <div style={{position: 'absolute', inset: 0, background: bg, overflow: 'hidden'}}>{children}</div>
);

export const sec = (frame: number) => frame / FPS;

/** Placeholder text line (shape only, no copy). */
export const Bar: React.FC<{w: number; top: number; left: number; color: string; h?: number}> = ({w, top, left, color, h = 14}) => (
  <div style={{position: 'absolute', left, top, width: w, height: h, borderRadius: h / 2, background: color}} />
);

export {C};
