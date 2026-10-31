import {Audio} from '@remotion/media';
import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';
import {wipe} from '@remotion/transitions/wipe';
import React from 'react';
import {AbsoluteFill, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {sec} from '../../config/video';
import {clamp, EASE} from '../../lib/animation';
import {COLORS} from '../../theme/theme';
import {FEATURE_CARD_TIMES, FeaturesScene} from './scenes/FeaturesScene';
import {IntroScene} from './scenes/IntroScene';
import {OUTRO_LOCK_TIME, OutroScene} from './scenes/OutroScene';
import {StatsScene} from './scenes/StatsScene';
import type {ShowcaseProps} from './schema';
import {sceneStart, TIMELINE} from './timeline';

export {showcaseSchema} from './schema';
export {showcaseDurationInFrames} from './timeline';

/** Music bed + sound effects. Every cue is derived from the same timeline the visuals use. */
const SoundTrack: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const transitions = (['features', 'stats', 'outro'] as const).map((s) => sceneStart(s, fps));
  const pops = FEATURE_CARD_TIMES.map((t) => sceneStart('features', fps) + Math.round((t + 0.15) * fps));
  return (
    <>
      <Audio
        name="Music bed"
        src={staticFile('audio/pad.wav')}
        volume={interpolate(frame, [0, fps, durationInFrames - 1.5 * fps, durationInFrames - 1], [0, 0.55, 0.55, 0], clamp)}
      />
      {transitions.map((at, i) => (
        <Audio key={`w${i}`} name={`Whoosh ${i + 1}`} from={at - Math.round(0.1 * fps)} src={staticFile('audio/whoosh.wav')} volume={0.45} />
      ))}
      {pops.map((at, i) => (
        <Audio key={`p${i}`} name={`Pop ${i + 1}`} from={at} src={staticFile('audio/pop.wav')} volume={0.5} />
      ))}
      <Audio name="Logo chime" from={sceneStart('outro', fps) + Math.round(OUTRO_LOCK_TIME * fps)} src={staticFile('audio/chime.wav')} volume={0.5} />
    </>
  );
};

/** Fades in from black at the start and out to black at the end. */
const Bookends: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.ink,
        pointerEvents: 'none',
        opacity: interpolate(frame, [0, 0.3 * fps, durationInFrames - 0.6 * fps, durationInFrames - 1], [1, 0, 0, 1], clamp),
      }}
    />
  );
};

export const Showcase: React.FC<ShowcaseProps> = ({eyebrow, title, subtitle, features, accent, secondary, sound}) => {
  const {fps, durationInFrames} = useVideoConfig();
  const transition = linearTiming({durationInFrames: sec(TIMELINE.overlap, fps), easing: EASE.inOut});

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.ink}}>
      <TransitionSeries name="Scenes">
        <TransitionSeries.Sequence name="Intro" durationInFrames={sec(TIMELINE.intro, fps)}>
          <IntroScene eyebrow={eyebrow} title={title} subtitle={subtitle} accent={accent} secondary={secondary} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({direction: 'from-right'})} timing={transition} />
        <TransitionSeries.Sequence name="Features" durationInFrames={sec(TIMELINE.features, fps)}>
          <FeaturesScene features={features} accent={accent} secondary={secondary} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({direction: 'from-left'})} timing={transition} />
        <TransitionSeries.Sequence name="Stats" durationInFrames={sec(TIMELINE.stats, fps)}>
          <StatsScene accent={accent} secondary={secondary} videoSeconds={durationInFrames / fps} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={transition} />
        <TransitionSeries.Sequence name="Outro" durationInFrames={sec(TIMELINE.outro, fps)}>
          <OutroScene accent={accent} secondary={secondary} />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      <Bookends />
      {sound ? <SoundTrack /> : null}
    </AbsoluteFill>
  );
};
