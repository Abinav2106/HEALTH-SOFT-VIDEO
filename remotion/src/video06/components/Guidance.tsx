import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COLORS, FONT_SANS, GUIDANCE_RISE, GUIDANCE_STEPS, HEIGHT, SHOTS} from '../constants';
import {EASE_IN_OUT, EASE_OUT, progress} from '../lib/motion';
import {MaskedLines} from './MaskedLines';
import {NODE_Y, SPINE_X} from './Thread';

// Panel 10. A cream foreground rises out of the label scrim; three steps hang off the orange spine.
// Editorial only: no icons, dashboards, readings or onboarding states.
export const Guidance: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < GUIDANCE_RISE.from || frame >= SHOTS.s10.to) return null;
  const rise = progress(frame, GUIDANCE_RISE.from, GUIDANCE_RISE.to - GUIDANCE_RISE.from, EASE_IN_OUT);
  const top = (1 - rise) * (HEIGHT + 160);

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: top - 160,
          height: HEIGHT + 160,
          background: `linear-gradient(to bottom, rgba(252,246,239,0) 0px, ${COLORS.cream} 160px)`,
        }}
      />
      {GUIDANCE_STEPS.map((s, i) => {
        const node = progress(frame, s.at - 2, 8, EASE_OUT);
        return (
          <React.Fragment key={s.num}>
            {node > 0 ? (
              <div
                style={{
                  position: 'absolute',
                  left: SPINE_X - 11,
                  top: NODE_Y[i] - 11,
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  background: COLORS.orange,
                  transform: `scale(${node})`,
                }}
              />
            ) : null}
            <MaskedLines
              inAt={s.at}
              stagger={3}
              dur={14}
              style={{left: SPINE_X + 62, top: NODE_Y[i] - 82, fontFamily: FONT_SANS}}
              lines={[
                {text: s.num, style: {fontSize: 24, fontWeight: 600, letterSpacing: '0.14em', color: COLORS.orange, lineHeight: 1}},
                {text: s.a, style: {fontSize: 68, fontWeight: 600, letterSpacing: '-0.025em', color: COLORS.ink, lineHeight: 1, marginTop: 22}},
                {text: s.b, style: {fontSize: 68, fontWeight: 400, letterSpacing: '-0.02em', color: COLORS.inkSoft, lineHeight: 1, marginTop: 8}},
              ]}
            />
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
