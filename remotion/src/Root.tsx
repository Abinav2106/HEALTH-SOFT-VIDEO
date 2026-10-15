import React from 'react';
import {Composition, Sequence} from 'remotion';
import {DURATION, FPS, HEIGHT, SHOTS, WIDTH} from './video06/constants';
import {Video06, Video06Props} from './video06/Video06';
import * as WWC from './ww/constants';
import {WW} from './ww/WW';
import {Hero} from './ww/Heroes';

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
    {/* W&W "Start with why." — 45 s, 9:16, 30 fps. Review = burn-ins + scratch captions. */}
    <Composition id="WW-Review" component={WW} durationInFrames={WWC.DURATION} fps={WWC.FPS} width={WWC.WIDTH} height={WWC.HEIGHT} defaultProps={{mode: 'review' as const, captions: true}} />
    <Composition id="WW-Master" component={WW} durationInFrames={WWC.DURATION} fps={WWC.FPS} width={WWC.WIDTH} height={WWC.HEIGHT} defaultProps={{mode: 'master' as const, captions: false}} />
    {WWC.HEROES.map((id) => (
      <Composition key={id} id={`WW-Hero-${id}`} component={Hero} durationInFrames={1} fps={WWC.FPS} width={1080} height={1080} defaultProps={{id}} />
    ))}
    <Composition id="WW-Opening" component={WW} durationInFrames={WWC.f(15)} fps={WWC.FPS} width={WWC.WIDTH} height={WWC.HEIGHT} defaultProps={{mode: 'review' as const, captions: true}} />
  </>
);
