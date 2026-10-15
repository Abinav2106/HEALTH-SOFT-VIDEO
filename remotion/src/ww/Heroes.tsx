import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {C, HeroId, f} from './constants';
import {loadWWFonts} from './lib/fonts';
import {Logo, QMark} from './components/Brand';
import {Doubt} from './components/Doubt';
import {QuestionGrid} from './components/QuestionGrid';
import {KeyVisual, SceneA, SceneB, SceneC} from './components/Scenes';

// Clean hero stills (no copy, no burn-ins) re-used as R4's phone cards. Each is a frame of THIS film's
// own compositions, framed square. Concept material — not completed client work.

loadWWFonts();

const SIZE = 1080;

/** Show a 1080x1920 film frame at master time `at`, cropped to a square around (cx, cy) of side `side`. */
const FilmCrop: React.FC<{at: number; cx: number; cy: number; side: number; children: React.ReactNode}> = ({at, cx, cy, side, children}) => {
  const k = SIZE / side;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transformOrigin: '0 0', transform: `scale(${k}) translate(${side / 2 - cx}px, ${side / 2 - cy}px)`}}>
      <Sequence from={-f(at)} layout="none">
        {children}
      </Sequence>
    </div>
  );
};

export const Hero: React.FC<{id: HeroId}> = ({id}) => (
  <AbsoluteFill style={{background: C.white, overflow: 'hidden'}}>
    {id === 'identity' ? (
      <FilmCrop at={18.6} cx={590} cy={1330} side={1040}>
        <SceneA copy={false} />
      </FilmCrop>
    ) : null}
    {id === 'formats' ? (
      <FilmCrop at={23.5} cx={590} cy={1390} side={1060}>
        <SceneB copy={false} />
      </FilmCrop>
    ) : null}
    {id === 'setup' ? (
      <FilmCrop at={28.4} cx={560} cy={1320} side={1080}>
        <SceneC copy={false} />
      </FilmCrop>
    ) : null}
    {id === 'grid' ? (
      <FilmCrop at={3.3} cx={540} cy={760} side={880}>
        <QuestionGrid />
      </FilmCrop>
    ) : null}
    {id === 'doubt' ? (
      <AbsoluteFill style={{background: C.callBg}}>
        <Doubt cam={{s: 0.72, sx: 540, sy: 250}} />
      </AbsoluteFill>
    ) : null}
    {id === 'poster' ? (
      <AbsoluteFill style={{background: C.white}}>
        <KeyVisual q={460} logo={340} line={44} />
      </AbsoluteFill>
    ) : null}
    {id === 'logo' ? (
      <AbsoluteFill style={{background: C.orange, alignItems: 'center', justifyContent: 'center'}}>
        <Logo width={780} color={C.black} />
      </AbsoluteFill>
    ) : null}
    {id === 'mark' ? (
      <AbsoluteFill style={{background: C.white, alignItems: 'center', justifyContent: 'center'}}>
        <QMark height={620} color={C.orange} />
      </AbsoluteFill>
    ) : null}
  </AbsoluteFill>
);
