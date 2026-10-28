import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {BEATS, COLORS, FLOW, FONT_SANS, PHONE, SHOTS} from '../constants';
import {EASE_IN_OUT, EASE_OUT, progress} from '../lib/motion';
import {Check} from './Icons';
import {LiveShot} from './LiveShot';

// S05/S06 ground: clean paper white with a soft cyan wash behind the phone. The camera is locked off here —
// the calm after the chaos.
export const StageGround: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(760px 760px at ${PHONE.x}px ${PHONE.y + 40}px, ${COLORS.cyanWash} 0%, #F3FBFC 45%, ${COLORS.paper} 75%)`,
    }}
  />
);

// S05 left column: "One tap." → "Match." (earlier beat greys back as the next lands).
export const Beats: React.FC = () => {
  const frame = useCurrentFrame();
  const out = progress(frame, SHOTS.s06.from, 8, EASE_IN_OUT);
  if (out >= 1) return null;
  return (
    <div style={{position: 'absolute', left: 150, top: 330, fontFamily: FONT_SANS, opacity: 1 - out, transform: `translateX(${-out * 60}px)`}}>
      {BEATS.map((b, i) => {
        const p = progress(frame, b.inAt, 10);
        const next = BEATS[i + 1];
        const dim = next ? progress(frame, next.inAt, 8) : 0;
        return (
          <div key={b.text} style={{height: 150, overflow: 'hidden'}}>
            <div
              style={{
                fontSize: 132,
                fontWeight: 850,
                letterSpacing: '-0.035em',
                lineHeight: '150px',
                color: dim > 0.5 ? '#C4CBD0' : COLORS.ink,
                transform: `translateY(${(1 - p) * 150}px)`,
              }}
            >
              {b.text}
            </div>
          </div>
        );
      })}
      <div style={{marginTop: 22, height: 10, width: 140 * progress(frame, BEATS[0].inAt + 4, 12), borderRadius: 5, background: COLORS.cyan}} />
    </div>
  );
};

// S06 left column: the workspace she found (S07 clip) in a window + Select → Discover → Book.
export const Flow: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < SHOTS.s06.from || frame >= SHOTS.s07.from + 4) return null;
  const win = progress(frame, FLOW.windowIn, 14, EASE_OUT);
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: 110,
          top: 186,
          width: 820,
          height: 462,
          borderRadius: 34,
          overflow: 'hidden',
          boxShadow: '0 30px 70px rgba(10,40,50,0.20)',
          opacity: win,
          transform: `translateX(${(1 - win) * -90}px) scale(${0.94 + win * 0.06})`,
        }}
      >
        <LiveShot id="s07" from={SHOTS.s06.from} to={SHOTS.s07.from + 4} scale={(f) => 1.02 + (f - SHOTS.s06.from) * 0.0012} origin="45% 40%" />
      </div>
      <div style={{position: 'absolute', left: 110, top: 700, display: 'flex', alignItems: 'center', gap: 14, fontFamily: FONT_SANS}}>
        {FLOW.steps.map((s, i) => {
          const p = progress(frame, s.at, 8);
          const done = i < FLOW.steps.length - 1 ? progress(frame, FLOW.steps[i + 1].at, 6) : 0;
          return (
            <React.Fragment key={s.text}>
              {i > 0 ? <div style={{width: 26, height: 3, borderRadius: 2, background: p > 0.5 ? COLORS.cyan : '#D6DBDE'}} /> : null}
              <div style={{display: 'flex', alignItems: 'center', gap: 12, opacity: 0.35 + 0.65 * p, transform: `translateY(${(1 - p) * 10}px)`}}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    background: p > 0.5 ? COLORS.cyan : '#E6EAEC',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 21,
                    fontWeight: 850,
                    color: COLORS.ink,
                  }}
                >
                  {done > 0.5 ? <Check size={22} /> : i + 1}
                </div>
                <div style={{fontSize: 25, fontWeight: 750, letterSpacing: '-0.01em', color: COLORS.ink}}>{s.text}</div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </>
  );
};
