import React from 'react';
import {Composition, Sequence} from 'remotion';
import {DURATION, FPS, HEIGHT, SHOTS, WIDTH} from './video06/constants';
import {Video06, Video06Props} from './video06/Video06';
import {ModelSheet} from './tilo/ModelSheet';
import {TiloReward} from './tilo/TiloReward';
import * as TILO from './tilo/constants';

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
    {/* Tilo — "A little exploration. A golden reward." 4:5, 5 s. */}
    <Composition id="Tilo-Reward" component={TiloReward} durationInFrames={TILO.DURATION} fps={TILO.FPS} width={TILO.WIDTH} height={TILO.HEIGHT} defaultProps={{sound: true}} />
    <Composition id="Tilo-ModelSheet" component={ModelSheet} durationInFrames={1} fps={TILO.FPS} width={TILO.WIDTH} height={TILO.HEIGHT} />
  </>
);
