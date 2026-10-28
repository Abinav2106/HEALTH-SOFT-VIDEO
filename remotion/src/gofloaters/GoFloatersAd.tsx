import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {COLORS, END, FREEZE, S02_PUNCH, SHOTS} from './constants';
import {CyanWipe, NeedChip} from './components/Montage';
import {EndFrame, EndWipe} from './components/EndFrame';
import {LiveShot} from './components/LiveShot';
import {Phone} from './components/Phone';
import {Beats, Flow, StageGround} from './components/Stage';
import {loadFonts} from './lib/fonts';
import {progress} from './lib/motion';
import {requireStatic, RenderModeProvider, useRenderMode} from './lib/renderMode';

export type GoFloatersProps = {mode: 'review' | 'master'};

const SCORE = 'gofloaters/audio/score.wav';
// Where her phone sits in S04 (after the push-in): the white bloom into the phone hero starts here.
const S04_PHONE = {x: 905, y: 640};

// CHAOS → ONE TAP → MATCH → WORK.
export const GoFloatersAd: React.FC<GoFloatersProps> = ({mode}) => {
  loadFonts();
  return (
    <RenderModeProvider value={{strict: mode === 'master'}}>
      <AbsoluteFill style={{background: COLORS.black}}>
        <Problem />
        <Interrupt />
        <Hero />
        <EndWipe />
        <EndFrame />
        <Score />
      </AbsoluteFill>
    </RenderModeProvider>
  );
};

// S01–S03: handheld energy, punch-ins, the three needs, cyan entering at the cuts.
const Problem: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame >= SHOTS.s04.from + 2) return null;
  const push = (from: number, a: number, b: number, len: number) => (f: number) => a + (b - a) * Math.min(1, Math.max(0, (f - from) / len));
  return (
    <AbsoluteFill>
      <LiveShot id="s01" {...SHOTS.s01} shake={6} scale={push(0, 1, 1.05, 90)} origin="33% 32%" />
      <LiveShot id="s02" {...SHOTS.s02} shake={8} scale={(f) => (f < S02_PUNCH ? 1.08 : 1.24)} origin="36% 30%" />
      <LiveShot id="s03a" {...SHOTS.s03a} shake={9} scale={push(SHOTS.s03a.from, 1.1, 1.18, 42)} origin="45% 30%" />
      <LiveShot id="s03b" {...SHOTS.s03b} shake={9} scale={push(SHOTS.s03b.from, 1.06, 1.14, 40)} origin="30% 40%" />
      <LiveShot id="s03c" {...SHOTS.s03c} shake={10} scale={push(SHOTS.s03c.from, 1.04, 1.1, 40)} origin="45% 35%" />
      <NeedChip />
      <CyanWipe at={SHOTS.s03a.from} yellow />
      <CyanWipe at={SHOTS.s03b.from} />
      <CyanWipe at={SHOTS.s03c.from} />
      <CyanWipe at={SHOTS.s04.from} />
    </AbsoluteFill>
  );
};

// S04: frustration peaks, she looks at the phone; picture, camera and sound stop; a breath; then the bloom.
const Interrupt: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < SHOTS.s04.from || frame >= SHOTS.s05.from + 2) return null;
  const frozen = frame >= FREEZE.at && frame < FREEZE.resume;
  const scale = (f: number) => (f < FREEZE.resume ? 1 + 0.1 * Math.min(1, (f - SHOTS.s04.from) / (FREEZE.at - SHOTS.s04.from)) : 1.16);
  const bloom = progress(frame, SHOTS.s05.from - 7, 9);
  return (
    <AbsoluteFill>
      <LiveShot
        id="s04"
        from={SHOTS.s04.from}
        to={SHOTS.s05.from + 2}
        scale={scale}
        freezeAt={FREEZE.at}
        resumeAt={FREEZE.resume}
        resumeIn={FREEZE.resumeIn}
        origin="47% 45%"
        style={{filter: frozen ? 'saturate(0.55) contrast(1.04)' : undefined}}
      />
      {bloom > 0 ? (
        <AbsoluteFill
          style={{
            background: `radial-gradient(circle at ${S04_PHONE.x}px ${S04_PHONE.y}px, ${COLORS.paper} ${bloom * 2300 - 160}px, ${COLORS.cyan} ${bloom * 2300 - 60}px, rgba(110,208,225,0) ${bloom * 2300}px)`,
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};

// S05–S06: locked-off phone hero on a clean white stage.
const Hero: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < SHOTS.s05.from || frame >= END.wipe.to) return null;
  return (
    <AbsoluteFill>
      <StageGround />
      <Beats />
      <Flow />
      <Phone />
    </AbsoluteFill>
  );
};

// Original score + SFX, synthesised by tools/make_score.py from audio/cues.json (no third-party music).
const Score: React.FC = () => {
  const {strict} = useRenderMode();
  return requireStatic(SCORE, strict) ? <Audio src={staticFile(SCORE)} /> : null;
};
