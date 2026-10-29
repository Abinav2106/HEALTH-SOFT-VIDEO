import React from 'react';
import {Composition, Folder, Sequence} from 'remotion';
import {DURATION, FPS, HEIGHT, SHOTS, WIDTH} from './video06/constants';
import {Video06, Video06Props} from './video06/Video06';
import {
  defaultConfig as tiloDefaults,
  DURATION as TILO_DURATION,
  FPS as TILO_FPS,
  HEIGHT as TILO_HEIGHT,
  tiloSchema,
  WIDTH as TILO_WIDTH,
} from './tilo/config';
import {TiloRewardFlight} from './tilo/TiloRewardFlight';

const MG_FROM = SHOTS.s06.from; // motion-graphics section: shared choice → end card
const OPENING_TO = SHOTS.s06.to; // 0–16 s: every live-action shot up to the product entrance

const MotionSection: React.FC<Video06Props> = (props) => (
  <Sequence from={-MG_FROM}>
    <Video06 {...props} />
  </Sequence>
);

const common = {fps: FPS, width: WIDTH, height: HEIGHT} as const;

export const RemotionRoot: React.FC = () => (
  <>
    {/* Review renders (burn-in, stand-in plates allowed). */}
    <Composition id="V06-Preview" component={Video06} durationInFrames={DURATION} {...common} defaultProps={{mode: 'review' as const}} />
    <Composition id="V06-Opening" component={Video06} durationInFrames={OPENING_TO} {...common} defaultProps={{mode: 'review' as const}} />
    <Composition id="V06-MotionSection" component={MotionSection} durationInFrames={DURATION - MG_FROM} {...common} defaultProps={{mode: 'review' as const}} />
    {/* Deliverable: no overlays; fails if any shot lacks a licensed clip, a licence record or a screen track. */}
    <Composition id="V06-Master" component={Video06} durationInFrames={DURATION} {...common} defaultProps={{mode: 'master' as const}} />

    <Folder name="Tilo-RewardFlight">
      {/* GoFloaters Instagram Reel. 24 s master at normal speed — the deliverable. */}
      <Composition
        id="Tilo-RewardFlight"
        component={TiloRewardFlight}
        schema={tiloSchema}
        durationInFrames={TILO_DURATION}
        fps={TILO_FPS}
        width={TILO_WIDTH}
        height={TILO_HEIGHT}
        defaultProps={tiloDefaults}
      />
      {/* Review only: the same master sampled at 2× (what a viewer holding Instagram's 2× sees). */}
      <Composition
        id="Tilo-RewardFlight-2xReview"
        component={TiloRewardFlight}
        schema={tiloSchema}
        durationInFrames={TILO_DURATION / 2}
        fps={TILO_FPS}
        width={TILO_WIDTH}
        height={TILO_HEIGHT}
        defaultProps={{...tiloDefaults, review: {playbackSpeed: 2, burnIn: true}}}
      />
    </Folder>
  </>
);
