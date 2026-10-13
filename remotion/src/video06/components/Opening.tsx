import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {SCREEN_CANVAS, SHOTS} from '../constants';
import {useRenderMode} from '../lib/renderMode';
import {MissingStockError, stockClip, trackedQuad} from '../stock/stock';
import {Headline} from './Headline';
import {PinnedScreen} from './ScreenGraphic';
import {StockShot} from './StockShot';

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
          <Headline lines={['You buy it.']} inAt={6} outAt={62} />
        </AbsoluteFill>
      ) : null}

      {within(frame, SHOTS.s02) ? <StockShot id="s02" from={SHOTS.s02.from} to={SHOTS.s02.to} /> : null}

      {within(frame, SHOTS.s03) ? (
        <AbsoluteFill>
          <StockShot id="s03" from={SHOTS.s03.from} to={SHOTS.s03.to} />
          <Headline lines={['They live', 'with it.']} inAt={96} outAt={137} />
        </AbsoluteFill>
      ) : null}

      {within(frame, SHOTS.s04) ? (
        <AbsoluteFill>
          <StockShot id="s04" from={SHOTS.s04.from} to={SHOTS.s04.to} />
          {/* One continuous routine shot; the footage carries the movement. */}
          <Headline lines={['Their day.']} inAt={150} outAt={208} />
        </AbsoluteFill>
      ) : null}

      {within(frame, SHOTS.s05) ? (
        <AbsoluteFill>
          <StockShot id="s05" from={SHOTS.s05.from} to={SHOTS.s05.to} />
          <Headline lines={['Their', 'comfort.']} inAt={222} outAt={279} />
        </AbsoluteFill>
      ) : null}
    </>
  );
};
