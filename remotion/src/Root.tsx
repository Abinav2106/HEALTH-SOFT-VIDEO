import React from 'react';
import {Composition, Sequence} from 'remotion';
import {DURATION, FPS, HEIGHT, SHOTS, WIDTH} from './video06/constants';
import {Video06, Video06Props} from './video06/Video06';
import * as GF from './gofloaters/constants';
import {GoFloatersAd} from './gofloaters/GoFloatersAd';

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
    {/* GoFloaters "Find your space" 16:9. Review allows stand-ins; Master throws if a clip, the logo or the score is missing. */}
    <Composition id="GF-Review" component={GoFloatersAd} durationInFrames={GF.DURATION} fps={GF.FPS} width={GF.WIDTH} height={GF.HEIGHT} defaultProps={{mode: 'review' as const}} />
    <Composition id="GF-Master" component={GoFloatersAd} durationInFrames={GF.DURATION} fps={GF.FPS} width={GF.WIDTH} height={GF.HEIGHT} defaultProps={{mode: 'master' as const}} />
  </>
);
