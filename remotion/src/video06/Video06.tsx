import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COLORS, SCREEN_PUSH, SCREEN_SETTLE, STAGE} from './constants';
import {progress} from './lib/motion';
import {loadFonts} from './lib/fonts';
import {Closing} from './components/Closing';
import {Guidance} from './components/Guidance';
import {Opening} from './components/Opening';
import {ProductStage} from './components/ProductStage';
import {ReviewBurnIn} from './components/ReviewBurnIn';
import {SharedChoice} from './components/SharedChoice';
import {Thread} from './components/Thread';

loadFonts();

export type Video06Props = {burnIn: boolean};

// Healthsoft Video 06 — "You buy it. They live with it." (1080×1920, 24 fps, 32 s).
// Layer order, bottom to top: picture → product stage → guidance foreground → thread → closing → review overlay.
export const Video06: React.FC<Video06Props> = ({burnIn}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: COLORS.plateB}}>
      <Opening />
      <SharedChoice />
      {frame >= SCREEN_PUSH.to - SCREEN_SETTLE && frame < STAGE.to ? (
        <ProductStage opacity={progress(frame, SCREEN_PUSH.to - SCREEN_SETTLE, SCREEN_SETTLE, (t) => t)} />
      ) : null}
      <Guidance />
      <Thread />
      <Closing />
      {burnIn ? <ReviewBurnIn /> : null}
    </AbsoluteFill>
  );
};
