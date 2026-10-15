import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, COPY, FONT, FPS, T} from '../constants';
import {EASE_IN_OUT, EASE_OUT, prog} from '../lib/motion';
import {Logo, QMark} from './Brand';

// R3 closing mechanic: an expanding pale shape wipes over the call to a central brand card; secondary
// movement stays at the edges. Resolved by ~41.0 s, held to the end. The shape of R3's wipe is not visible
// in the supplied evidence (re-recording stops before it) — built as a circle from frame centre: UNVERIFIED.

const ORIGIN = {x: 540, y: 980};
const R_MAX = 1260;

export const Closing: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  if (t < T.close.from) return null;
  const w = prog(frame, T.close.from, 0.52, EASE_IN_OUT);
  const r = w * R_MAX;
  const logo = prog(frame, T.close.from + 0.3, 0.5, EASE_OUT);
  const line = prog(frame, T.close.from + 0.55, 0.45, EASE_OUT);
  const cta = prog(frame, T.close.from + 0.8, 0.45, EASE_OUT);
  // Edge movement: slow, small, secondary.
  const drift = Math.sin((t - T.close.from) * 1.3);
  return (
    <div style={{position: 'absolute', inset: 0}}>
      {/* soft contact edge so the pale shape reads against the pale call background */}
      {w < 1 ? (
        <div
          style={{
            position: 'absolute',
            left: ORIGIN.x - r,
            top: ORIGIN.y - r,
            width: r * 2,
            height: r * 2,
            borderRadius: '50%',
            boxShadow: '0 0 60px rgba(0,0,0,0.14)',
          }}
        />
      ) : null}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: C.white,
          clipPath: `circle(${r}px at ${ORIGIN.x}px ${ORIGIN.y}px)`,
          overflow: 'hidden',
        }}
      >
        <div style={{position: 'absolute', left: -150, top: -40, transform: `rotate(${-14 + drift * 1.5}deg)`, opacity: 0.08}}>
          <QMark height={620} color={C.black} />
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 780, display: 'flex', justifyContent: 'center', opacity: logo, transform: `translateY(${(1 - logo) * 24}px)`}}>
          <Logo width={760} />
        </div>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 1060,
            textAlign: 'center',
            fontFamily: FONT,
            fontWeight: 500,
            fontSize: 66,
            letterSpacing: -1.4,
            color: C.black,
            opacity: line,
            transform: `translateY(${(1 - line) * 18}px)`,
          }}
        >
          {COPY.close.line}
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 1196, display: 'flex', justifyContent: 'center', opacity: cta, transform: `translateY(${(1 - cta) * 18}px)`}}>
          <div style={{padding: '22px 52px', borderRadius: 999, background: C.orange, color: C.black, fontFamily: FONT, fontWeight: 700, fontSize: 46, letterSpacing: -0.6}}>
            {COPY.close.cta}
          </div>
        </div>
      </div>
    </div>
  );
};
