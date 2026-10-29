import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, SCENES} from './constants';
import {loadFonts} from './lib/fonts';
import {S1Invitation} from './components/S1Invitation';
import {S2Clue, S2Tilo} from './components/S2Clue';
import {S3Signal} from './components/S3Signal';
import {S4Discovery} from './components/S4Discovery';
import {S5Icon, S5Payoff} from './components/S5Payoff';
import {S6Ending} from './components/S6Ending';
import {Sound} from './components/Sound';

loadFonts();

export type FindTheSparkProps = {
  narration: boolean;
  sfx: boolean;
};

const on = (f: number, s: {from: number; to: number}) => f >= s.from && f < s.to;

// Invitation → Clue → Explore → Found → Reward → Enter the hunt, stacked so every hand-over
// happens on screen: clue card → highlight matte → workspace crop → Spark → success check → marker.
export const FindTheSpark: React.FC<FindTheSparkProps> = ({narration, sfx}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{backgroundColor: C.navy}}>
      {on(f, SCENES.invitation) && <S1Invitation f={f} />}
      {on(f, SCENES.clue) && <S2Clue f={f} />}
      {on(f, SCENES.found) && <S4Discovery f={f} />}
      {on(f, SCENES.explore) && <S3Signal f={f} />}
      {f >= 96 && f < 256 && <S2Tilo f={f} />}
      {on(f, SCENES.reward) && <S5Payoff f={f} />}
      {on(f, SCENES.ending) && <S6Ending f={f} />}
      {on(f, SCENES.reward) && <S5Icon f={f} />}
      <Sound narration={narration} sfx={sfx} />
    </AbsoluteFill>
  );
};
