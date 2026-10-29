import React from 'react';
import {FONT_HEAD} from '../lib/fonts';
import {useT} from '../lib/timeline';
import {easeOut, prog, useHold} from './useHold';

// Shot 01: the only opening instruction, plus one hold-ring gesture near the right edge.
// No number anywhere. Everything is gone by the first frame of shot 02.

export const OpeningInstruction: React.FC = () => {
  const c = useHold();
  const t = useT();
  const h = c.hold;
  if (t >= c.shots.s01[1]) return null;
  const k = prog(t, [h.copyIn, h.copyIn + 8], easeOut);
  const out = 1 - prog(t, h.copyOut);
  const ring = prog(t, [h.ringIn, h.ringIn + h.ringFrames], easeOut);
  const dot = prog(t, [h.ringIn - 4, h.ringIn + 4], easeOut) * out;
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: c.ui.headline.x,
          top: c.ui.headline.y + (1 - k) * 18,
          maxWidth: c.ui.headlineMaxWidth,
          opacity: k * out,
          whiteSpace: 'pre-line',
          fontFamily: FONT_HEAD,
          fontWeight: 800,
          fontSize: c.ui.headlineSize,
          lineHeight: 0.94,
          letterSpacing: '-0.015em',
          color: c.colors.ink,
          textShadow: '0 0 24px rgba(255,255,255,0.92), 0 0 7px rgba(255,255,255,0.85)',
        }}
      >
        {c.copy.headline}
      </div>
      {/* Hold gesture: a touch point with one ring that expands and fades once. */}
      <div style={{position: 'absolute', right: 92, top: 440, width: 44, height: 44, opacity: dot}}>
        {ring > 0 && ring < 1 && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: `4px solid ${c.colors.turquoise}`,
              transform: `scale(${1 + ring * 2.2})`,
              opacity: 0.9 * (1 - ring),
            }}
          />
        )}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.95)',
            border: `5px solid ${c.colors.turquoise}`,
            boxShadow: '0 4px 14px rgba(5,5,6,0.18)',
          }}
        />
      </div>
    </>
  );
};
