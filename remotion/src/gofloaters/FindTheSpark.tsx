import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, SCENES} from './constants';
import {loadFonts} from './lib/fonts';
import {S1Invitation} from './components/S1Invitation';
import {S2Clue, S2Tilo} from './components/S2Clue';
import {S3Signal} from './components/S3Signal';
import {S4Discovery} from './components/S4Discovery';
import {S5Payoff} from './components/S5Payoff';
import {S6Next} from './components/S6Next';
import {S7Mystery} from './components/S7Mystery';
import {Sound} from './components/Sound';

loadFonts();

export type FindTheSparkProps = {
  narration: boolean;
  sfx: boolean;
};

const on = (f: number, s: {from: number; to: number}) => f >= s.from && f < s.to;

// A Invitation → B Clue → C Follow the signal → D Found → E–F Reward → G Where next → H Mystery,
// stacked so every hand-over happens on screen: clue card → highlight matte → workspace window →
// Spark → success check · box → interface panel → preview card → mystery card.
export const FindTheSpark: React.FC<FindTheSparkProps> = ({narration, sfx}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{backgroundColor: C.navy}}>
      {on(f, SCENES.invitation) && <S1Invitation f={f} />}
      {on(f, SCENES.clue) && <S2Clue f={f} />}
      {on(f, SCENES.found) && <S4Discovery f={f} />}
      {on(f, SCENES.signal) && <S3Signal f={f} />}
      {f >= 96 && f < 246 && <S2Tilo f={f} />}
      {on(f, SCENES.reward) && <S5Payoff f={f} />}
      {on(f, SCENES.next) && <S6Next f={f} />}
      {on(f, SCENES.mystery) && <S7Mystery f={f} />}
      <Sound narration={narration} sfx={sfx} />
    </AbsoluteFill>
  );
};
