import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COLORS, FONT_SANS, GUIDANCE_OUT, GUIDANCE_RISE, GUIDANCE_STEPS, HEIGHT, SHOTS} from '../constants';
import {EASE_IN, EASE_IN_OUT, EASE_OUT, progress} from '../lib/motion';
import {MaskedLines} from './MaskedLines';
import {NODE_Y, SPINE_X} from './Thread';

// Panel 10 (22–27 s). A cream foreground rises out of the label scrim; the three locked steps hang off
// the orange spine as the narration reaches them. Editorial only: no icons, dashboards or readings.
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
        const node = progress(frame, s.at - 2, 8, EASE_OUT) * (1 - progress(frame, GUIDANCE_OUT + 4, 6, EASE_IN));
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
              outAt={GUIDANCE_OUT}
              stagger={3}
              dur={14}
              style={{left: SPINE_X + 62, top: NODE_Y[i] - 76, fontFamily: FONT_SANS}}
              lines={[
                {text: s.num, style: {fontSize: 24, fontWeight: 600, letterSpacing: '0.14em', color: COLORS.orange, lineHeight: 1}},
                {text: s.a, style: {fontSize: 84, fontWeight: 600, letterSpacing: '-0.03em', color: COLORS.ink, lineHeight: 1, marginTop: 18}},
              ]}
            />
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
