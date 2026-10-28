import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COLORS, FONT_SANS, NEEDS, SHOTS} from '../constants';
import {EASE_IN_OUT, progress} from '../lib/motion';

// S03 graphics: a "need" chip per cut (these become the requirement cards on the phone) and a cyan
// band that wipes across each cut — the first GoFloaters colour entering the chaos.
export const NeedChip: React.FC = () => {
  const frame = useCurrentFrame();
  const n = NEEDS.find((x) => frame >= SHOTS[x.shot].from && frame < SHOTS[x.shot].to);
  if (!n) return null;
  const {from, to} = SHOTS[n.shot];
  const p = progress(frame, from + 3, 8);
  const out = progress(frame, to - 4, 4, EASE_IN_OUT);
  return (
    <div
      style={{
        position: 'absolute',
        left: 96,
        bottom: 92,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '18px 30px 18px 22px',
        borderRadius: 999,
        background: COLORS.white,
        boxShadow: '0 10px 30px rgba(0,0,0,0.22)',
        fontFamily: FONT_SANS,
        fontSize: 38,
        fontWeight: 700,
        letterSpacing: '-0.01em',
        color: COLORS.ink,
        opacity: p * (1 - out),
        transform: `translateY(${(1 - p) * 26}px)`,
      }}
    >
      <span style={{width: 20, height: 20, borderRadius: 10, background: COLORS.cyan}} />
      {n.text}
    </div>
  );
};

/** Diagonal cyan band across a cut, centred on `at` (absolute frame). */
export const CyanWipe: React.FC<{at: number; dur?: number; yellow?: boolean}> = ({at, dur = 8, yellow}) => {
  const frame = useCurrentFrame();
  const t = (frame - (at - dur / 2)) / dur;
  if (t <= 0 || t >= 1) return null;
  const x = -900 + t * 3600;
  return (
    <AbsoluteFill style={{pointerEvents: 'none', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: x, top: -300, width: 520, height: 1700, background: COLORS.cyan, transform: 'rotate(14deg)'}} />
      {yellow ? (
        <div style={{position: 'absolute', left: x - 120, top: -300, width: 70, height: 1700, background: COLORS.yellow, transform: 'rotate(14deg)'}} />
      ) : null}
    </AbsoluteFill>
  );
};
