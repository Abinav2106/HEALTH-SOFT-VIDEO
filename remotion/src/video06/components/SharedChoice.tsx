import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COLORS, FONT_SANS, FONT_SERIF, HEIGHT, Quad, SCREEN_CANVAS, SCREEN_PUSH, SCREEN_QUAD_S06, SCREEN_SETTLE, SHOTS, WIDTH} from '../constants';
import {lerpQuad, quadCentroid, transformQuad} from '../lib/cornerPin';
import {EASE_IN_OUT, lerp, progress} from '../lib/motion';
import {MaskedLines} from './MaskedLines';
import {PendingPlate} from './PendingPlate';
import {PinnedScreen} from './ScreenGraphic';

const FRAME_QUAD: Quad = [
  [0, 0],
  [WIDTH, 0],
  [WIDTH, HEIGHT],
  [0, HEIGHT],
];
const PUSH_SCALE = 4.2;

// Panel 06 + the transition: the camera pushes into the laptop they are choosing on, the screen
// rectifies to the frame, and the selection graphic becomes the full-frame product stage.
export const SharedChoice: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < SHOTS.s06.from || frame >= SCREEN_PUSH.to) return null;

  const dur = SCREEN_PUSH.to - SCREEN_SETTLE - SCREEN_PUSH.from;
  const push = progress(frame, SCREEN_PUSH.from, dur, EASE_IN_OUT);
  const rectify = progress(frame, SCREEN_PUSH.from + 12, dur - 12, EASE_IN_OUT);
  const c = quadCentroid(SCREEN_QUAD_S06);
  const scale = lerp(1, PUSH_SCALE, push);
  const shift: [number, number] = [(WIDTH / 2 - c[0]) * push, (HEIGHT / 2 - c[1]) * push];
  const quad = lerpQuad(transformQuad(SCREEN_QUAD_S06, c, scale, shift), FRAME_QUAD, rectify);
  const w = lerp(SCREEN_CANVAS.w, WIDTH, rectify);
  const h = lerp(SCREEN_CANVAS.h, HEIGHT, rectify);

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <AbsoluteFill style={{transformOrigin: `${c[0]}px ${c[1]}px`, transform: `translate(${shift[0]}px, ${shift[1]}px) scale(${scale})`}}>
        <PendingPlate role="R5" description="Mother and daughter choosing together on the laptop" device={SCREEN_QUAD_S06} />
      </AbsoluteFill>
      <PinnedScreen quad={quad} w={w} h={h} chrome={1 - progress(frame, SCREEN_PUSH.from, 14)} glare={1 - rectify} />
      <MaskedLines
        inAt={294}
        outAt={338}
        stagger={5}
        style={{left: 84, top: 1180}}
        lines={[
          {text: 'Their', style: {fontFamily: FONT_SANS, fontSize: 104, fontWeight: 500, color: COLORS.white, letterSpacing: '-0.02em', lineHeight: 1}},
          {
            text: 'choice.',
            style: {fontFamily: FONT_SERIF, fontStyle: 'italic', fontSize: 138, fontWeight: 500, color: COLORS.orange, lineHeight: 1, marginTop: 6},
          },
        ]}
      />
      <MaskedLines
        inAt={318}
        outAt={340}
        style={{left: 84, top: 1500}}
        lines={[{text: 'Choose together.', style: {fontFamily: FONT_SANS, fontSize: 52, fontWeight: 400, color: COLORS.white, letterSpacing: '-0.01em'}}]}
      />
    </AbsoluteFill>
  );
};
