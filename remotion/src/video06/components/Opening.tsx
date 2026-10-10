import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COLORS, FONT_SANS, FONT_SERIF, SCREEN_CANVAS, SCREEN_QUAD_S01, SHOTS} from '../constants';
import {MaskedLines} from './MaskedLines';
import {PendingPlate} from './PendingPlate';
import {PinnedScreen} from './ScreenGraphic';

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

export const Opening: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      {within(frame, SHOTS.s01) ? (
        <AbsoluteFill>
          <PendingPlate role="R1" description="Daughter browsing care options on a laptop" device={SCREEN_QUAD_S01}>
            <PinnedScreen quad={SCREEN_QUAD_S01} w={SCREEN_CANVAS.w} h={SCREEN_CANVAS.h} chrome={1} glare={1} />
          </PendingPlate>
          <Title a="You" b="buy it." inAt={4} outAt={41} />
        </AbsoluteFill>
      ) : null}

      {within(frame, SHOTS.s02) ? (
        <AbsoluteFill>
          <PendingPlate role="R2" description="She pauses — natural close-up" />
          <MaskedLines inAt={54} outAt={89} style={{left: 84, top: 900}} lines={[{text: 'But…', style: serif(150)}]} />
        </AbsoluteFill>
      ) : null}

      {within(frame, SHOTS.s03) ? (
        <AbsoluteFill>
          <PendingPlate role="R3" description="Her mother's everyday activity" />
          <Title a="They" b="live with it." inAt={100} outAt={137} />
        </AbsoluteFill>
      ) : null}

      {within(frame, SHOTS.s04) ? (
        <AbsoluteFill>
          {frame < 168 ? <PendingPlate role="R3" description="Montage 1/3 — her day" /> : null}
          {frame >= 168 && frame < 192 ? <PendingPlate role="R4" description="Montage 2/3 — a simple routine" /> : null}
          {frame >= 192 ? <PendingPlate role="R4" description="Montage 3/3 — something she loves" /> : null}
          {/* Lines accumulate and stay still once revealed, so all three remain readable. */}
          <MaskedLines inAt={146} outAt={209} style={{left: 84, top: 1190}} lines={[{text: 'Their day.', style: serif(124)}]} />
          <MaskedLines inAt={162} outAt={209} style={{left: 84, top: 1350}} lines={[{text: 'Simple routines', style: serif(76)}]} />
          <MaskedLines inAt={178} outAt={209} style={{left: 84, top: 1446}} lines={[{text: 'Things they love', style: serif(76)}]} />
        </AbsoluteFill>
      ) : null}

      {within(frame, SHOTS.s05) ? (
        <AbsoluteFill>
          <PendingPlate role="R4" description="Comfort — tea, warm light, close-up" />
          <Title a="Their" b="comfort." inAt={222} outAt={279} />
        </AbsoluteFill>
      ) : null}
    </>
  );
};
