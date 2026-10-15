import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COLORS, HEIGHT, Quad, SCREEN_CANVAS, SCREEN_PUSH, SCREEN_SETTLE, SHOTS, WIDTH} from '../constants';
import {lerpQuad, quadCentroid, transformQuad} from '../lib/cornerPin';
import {EASE_IN_OUT, lerp, progress} from '../lib/motion';
import {stockClip, trackedQuad} from '../stock/stock';
import {Headline, headlineStyle} from './Headline';
import {MaskedLines} from './MaskedLines';
import {PinnedScreen} from './ScreenGraphic';
import {StockShot} from './StockShot';

const FRAME_QUAD: Quad = [
  [0, 0],
  [WIDTH, 0],
  [WIDTH, HEIGHT],
  [0, HEIGHT],
];
const PUSH_SCALE = 4.2;
const RISE = {from: 356, to: SCREEN_PUSH.to - SCREEN_SETTLE};

const Titles: React.FC = () => (
  <>
    <Headline lines={['Their choice.']} inAt={294} outAt={338} top={1290} />
    {/* The shared-selection marker: the underline steps down beneath this line as it lands. */}
    <MaskedLines
      inAt={318}
      outAt={340}
      style={{left: 84, top: 1478}}
      lines={[{text: 'Choose together.', style: {...headlineStyle(64), fontWeight: 600, letterSpacing: '-0.02em'}}]}
    />
  </>
);

// Panel 05 (12–16 s), the shared decision, and its hand-over into the product stage.
// With a convincing screen track: the camera pushes into the laptop they are choosing on and the
// tracked screen rectifies into the stage. Without one: no pinned graphic; the footage plays
// untouched and an ivory foreground rises over it — the film's single transition gesture.
export const SharedChoice: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < SHOTS.s06.from || frame >= SCREEN_PUSH.to) return null;

  const clip = stockClip('s06');
  const tracked = trackedQuad(clip, frame - SHOTS.s06.from);

  if (!tracked) {
    const rise = progress(frame, RISE.from, RISE.to - RISE.from, EASE_IN_OUT);
    const top = (1 - rise) * (HEIGHT + 160);
    return (
      <AbsoluteFill style={{overflow: 'hidden'}}>
        <StockShot id="s06" from={SHOTS.s06.from} to={SCREEN_PUSH.to} />
        <Titles />
        {rise > 0 ? (
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: top - 160,
              height: HEIGHT + 160,
              background: `linear-gradient(to bottom, rgba(250,247,242,0) 0px, ${COLORS.ivory} 160px)`,
            }}
          />
        ) : null}
      </AbsoluteFill>
    );
  }

  const pivotQuad = trackedQuad(clip, SCREEN_PUSH.from - SHOTS.s06.from) ?? tracked;
  const dur = SCREEN_PUSH.to - SCREEN_SETTLE - SCREEN_PUSH.from;
  const push = progress(frame, SCREEN_PUSH.from, dur, EASE_IN_OUT);
  const rectify = progress(frame, SCREEN_PUSH.from + 12, dur - 12, EASE_IN_OUT);
  const c = quadCentroid(pivotQuad);
  const scale = lerp(1, PUSH_SCALE, push);
  const shift: [number, number] = [(WIDTH / 2 - c[0]) * push, (HEIGHT / 2 - c[1]) * push];
  const quad = lerpQuad(transformQuad(tracked, c, scale, shift), FRAME_QUAD, rectify);
  const w = lerp(SCREEN_CANVAS.w, WIDTH, rectify);
  const h = lerp(SCREEN_CANVAS.h, HEIGHT, rectify);

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <AbsoluteFill style={{transformOrigin: `${c[0]}px ${c[1]}px`, transform: `translate(${shift[0]}px, ${shift[1]}px) scale(${scale})`}}>
        <StockShot id="s06" from={SHOTS.s06.from} to={SCREEN_PUSH.to} />
      </AbsoluteFill>
      <PinnedScreen quad={quad} w={w} h={h} chrome={1 - progress(frame, SCREEN_PUSH.from, 14)} glare={1 - rectify} />
      <Titles />
    </AbsoluteFill>
  );
};
