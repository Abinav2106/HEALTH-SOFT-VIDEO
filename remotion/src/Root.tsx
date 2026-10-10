import React from 'react';
import {Composition, Sequence} from 'remotion';
import {DURATION, FPS, HEIGHT, SHOTS, WIDTH} from './video06/constants';
import {Video06, Video06Props} from './video06/Video06';

const MG_FROM = SHOTS.s06.from; // motion-graphics section: shared choice → end card

const MotionSection: React.FC<Video06Props> = (props) => (
  <Sequence from={-MG_FROM}>
    <Video06 {...props} />
  </Sequence>
);

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="V06-Preview" component={Video06} durationInFrames={DURATION} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={{burnIn: true}} />
    <Composition
      id="V06-MotionSection"
      component={MotionSection}
      durationInFrames={DURATION - MG_FROM}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={{burnIn: true}}
    />
  </>
);
