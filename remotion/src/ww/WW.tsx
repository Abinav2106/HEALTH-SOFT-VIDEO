import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, RIG_READY} from './constants';
import {loadWWFonts} from './lib/fonts';
import {QuestionGrid} from './components/QuestionGrid';
import {CallbackShot, DoubtSequence} from './components/DoubtSequence';
import {SceneA, SceneB, SceneC} from './components/Scenes';
import {PhoneCascade} from './components/PhoneCascade';
import {Closing} from './components/Closing';
import {ReviewBurnIn} from './components/Review';
import {WWAudio} from './audio/WWAudio';

export type WWProps = {mode: 'review' | 'master'; captions: boolean; allowStandIns?: boolean};

loadWWFonts();

/** Master timeline. Every layer evaluates purely from the current frame; each returns null outside its window. */
export const WW: React.FC<WWProps> = ({mode, captions, allowStandIns = false}) => {
  if (mode === 'master' && !RIG_READY && !allowStandIns) {
    throw new Error('WW-Master: character shots are blocked (no rigged Doubt). Render WW-Review, or pass allowStandIns for internal frame exports.');
  }
  return (
    <AbsoluteFill style={{background: C.white}}>
      <QuestionGrid />
      <DoubtSequence />
      <SceneA />
      <SceneB />
      <SceneC />
      <PhoneCascade />
      <CallbackShot />
      <Closing />
      <WWAudio />
      {mode === 'review' ? <ReviewBurnIn captions={captions} /> : null}
    </AbsoluteFill>
  );
};
