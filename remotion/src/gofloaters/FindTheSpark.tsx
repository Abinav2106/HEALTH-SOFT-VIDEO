import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, SCENES} from './constants';
import {loadFonts} from './lib/fonts';
import {S1Invitation} from './components/S1Invitation';
import {S2Clue, S2Route} from './components/S2Clue';
import {S3Signal} from './components/S3Signal';
import {S4Discovery} from './components/S4Discovery';
import {S5Payoff} from './components/S5Payoff';
import {S6Ending} from './components/S6Ending';
import {Sound} from './components/Sound';

loadFonts();

export type FindTheSparkProps = {
  /** Working preview: marks the illustrative clue and the storyboard stand-in plates. */
  preview: boolean;
  sound: boolean;
};

const on = (f: number, s: {from: number; to: number}) => f >= s.from && f < s.to;

// One continuous visual language, stacked so each hand-over happens on screen:
// flight line → clue highlight → map route → doorway → Spark → success seal → city markers.
export const FindTheSpark: React.FC<FindTheSparkProps> = ({preview, sound}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{backgroundColor: C.navy}}>
      {on(f, SCENES.invitation) && <S1Invitation f={f} />}
      {on(f, SCENES.clue) && <S2Clue f={f} preview={preview} />}
      {on(f, SCENES.discovery) && <S4Discovery f={f} preview={preview} />}
      {on(f, SCENES.signal) && <S3Signal f={f} preview={preview} />}
      {on(f, SCENES.clue) && <S2Route f={f} />}
      {on(f, SCENES.payoff) && <S5Payoff f={f} />}
      {on(f, SCENES.ending) && <S6Ending f={f} />}
      {sound && <Sound />}
    </AbsoluteFill>
  );
};
