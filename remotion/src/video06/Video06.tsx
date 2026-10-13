import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COLORS, SCREEN_PUSH, SCREEN_SETTLE, STAGE} from './constants';
import {progress} from './lib/motion';
import {loadFonts} from './lib/fonts';
import {DEFAULT_MIX, Mix, RenderModeProvider} from './lib/renderMode';
import {AudioStems} from './audio/AudioStems';
import {Closing} from './components/Closing';
import {Guidance} from './components/Guidance';
import {Opening} from './components/Opening';
import {ProductStage} from './components/ProductStage';
import {ReviewBurnIn} from './components/ReviewBurnIn';
import {SharedChoice} from './components/SharedChoice';
import {Thread} from './components/Thread';

loadFonts();

// review: burn-in and stand-in plates allowed. master: no overlays; any missing clip or track fails the render.
export type Video06Props = {mode: 'review' | 'master'; mix?: Mix};

// Healthsoft Video 06 — "You buy it. They live with it." (1080×1920, 24 fps, 32 s).
// Layer order, bottom to top: live action → product stage → guidance foreground → closing → thread → review overlay.
export const Video06: React.FC<Video06Props> = ({mode, mix = DEFAULT_MIX}) => {
  const frame = useCurrentFrame();
  const strict = mode === 'master';
  return (
    <RenderModeProvider value={{strict, burnIn: !strict, mix}}>
      <AbsoluteFill style={{background: COLORS.plateB}}>
        <Opening />
        <SharedChoice />
        {frame >= SCREEN_PUSH.to - SCREEN_SETTLE && frame < STAGE.to ? (
          <ProductStage opacity={progress(frame, SCREEN_PUSH.to - SCREEN_SETTLE, SCREEN_SETTLE, (t) => t)} />
        ) : null}
        <Guidance />
        <Closing />
        <Thread />
        <AudioStems />
        {strict ? null : <ReviewBurnIn />}
      </AbsoluteFill>
    </RenderModeProvider>
  );
};
