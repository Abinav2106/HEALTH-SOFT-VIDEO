import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COLORS, FONT_SANS, FONT_SERIF, SCREEN_CANVAS, SHOTS} from '../constants';
import {useRenderMode} from '../lib/renderMode';
import {MissingStockError, stockClip, trackedQuad} from '../stock/stock';
import {MaskedLines} from './MaskedLines';
import {PinnedScreen} from './ScreenGraphic';
import {StockShot} from './StockShot';

const shadow = '0 2px 28px rgba(0,0,0,0.38)';
const sans = (size: number): React.CSSProperties => ({fontFamily: FONT_SANS, fontSize: size, fontWeight: 500, color: COLORS.white, letterSpacing: '-0.02em', lineHeight: 1.0, textShadow: shadow});
const serif = (size: number, color: string = COLORS.white): React.CSSProperties => ({
  fontFamily: FONT_SERIF,
  fontStyle: 'italic',
  fontSize: size,
  fontWeight: 500,
  color,
  letterSpacing: '-0.01em',
  lineHeight: 1.0,
  textShadow: shadow,
});

// Two-line title used across the opening: plain word, then the orange serif word.
const Title: React.FC<{a: string; b: string; inAt: number; outAt: number; top?: number}> = ({a, b, inAt, outAt, top = 1300}) => (
  <MaskedLines
    inAt={inAt}
    outAt={outAt}
    stagger={5}
    style={{left: 84, top}}
    lines={[
      {text: a, style: sans(104)},
      {text: b, style: {...serif(138, COLORS.orange), marginTop: 6}},
    ]}
  />
);

const within = (frame: number, s: {from: number; to: number}) => frame >= s.from && frame < s.to;

// Panels 01–05. Every picture layer is a StockShot; titles sit above and never move while read.
export const Opening: React.FC = () => {
  const frame = useCurrentFrame();
  const {strict} = useRenderMode();

  // The selection graphic is pinned only to a tracked physical screen — never floated over the picture.
  const s01 = stockClip('s01');
  const quad01 = trackedQuad(s01, frame - SHOTS.s01.from);
  if (strict && within(frame, SHOTS.s01) && !quad01) {
    throw new MissingStockError('Video 06 master: s01 has no screen track (run video06/tools/track_screen.py).');
  }

  return (
    <>
      {within(frame, SHOTS.s01) ? (
        <AbsoluteFill>
          <StockShot id="s01" from={SHOTS.s01.from} to={SHOTS.s01.to} />
          {quad01 ? <PinnedScreen quad={quad01} w={SCREEN_CANVAS.w} h={SCREEN_CANVAS.h} chrome={1} glare={1} /> : null}
          <Title a="You" b="buy it." inAt={6} outAt={46} />
        </AbsoluteFill>
      ) : null}

      {within(frame, SHOTS.s02) ? <StockShot id="s02" from={SHOTS.s02.from} to={SHOTS.s02.to} /> : null}
      {/* "But…" lands as she pauses and holds across the cut into her close-up. */}
      {frame >= 50 && frame < 92 ? <MaskedLines inAt={52} outAt={84} style={{left: 84, top: 900}} lines={[{text: 'But…', style: serif(150)}]} /> : null}

      {within(frame, SHOTS.s03) ? (
        <AbsoluteFill>
          <StockShot id="s03" from={SHOTS.s03.from} to={SHOTS.s03.to} />
          <Title a="They" b="live with it." inAt={96} outAt={137} />
        </AbsoluteFill>
      ) : null}

      {within(frame, SHOTS.s04) ? (
        <AbsoluteFill>
          <StockShot id="s04" from={SHOTS.s04.from} to={SHOTS.s04.to} />
          {/* One continuous routine shot; the lines accumulate and stay still once revealed. */}
          <MaskedLines inAt={148} outAt={209} style={{left: 84, top: 1190}} lines={[{text: 'Their day.', style: serif(124)}]} />
          <MaskedLines inAt={164} outAt={209} style={{left: 84, top: 1350}} lines={[{text: 'Simple routines', style: serif(76)}]} />
          <MaskedLines inAt={180} outAt={209} style={{left: 84, top: 1446}} lines={[{text: 'Things they love', style: serif(76)}]} />
        </AbsoluteFill>
      ) : null}

      {within(frame, SHOTS.s05) ? (
        <AbsoluteFill>
          <StockShot id="s05" from={SHOTS.s05.from} to={SHOTS.s05.to} />
          <Title a="Their" b="comfort." inAt={222} outAt={279} />
        </AbsoluteFill>
      ) : null}
    </>
  );
};
