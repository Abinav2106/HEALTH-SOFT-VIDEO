import React from 'react';
import {Audio, interpolate, Sequence, staticFile} from 'remotion';
import {FPS} from '../constants';
import {useRenderMode} from '../lib/renderMode';
import cues from './cues.json';
import audioManifest from './audioManifest.json';

// Four independently adjustable stems: voice, music, SFX (here) and ambience (the stock clips' own
// sound, in StockShot). Each fader is a linear gain set from the composition's `mix` prop.
const SFX_LEN: Record<string, number> = {tap: 0.18, tick: 0.09, swell: 1.5, bloom: 1.6};
const dbToGain = (db: number) => Math.pow(10, db / 20);

// Music ducks ~8 dB under narration with short ramps, so dialogue stays clear.
const duck = (frame: number) => {
  let g = 1;
  for (const l of cues.narration) {
    const d = interpolate(frame, [l.from - 6, l.from, l.to, l.to + 8], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    g = Math.min(g, 1 - d * (1 - dbToGain(-8)));
  }
  return g;
};

export const AudioStems: React.FC = () => {
  const {mix} = useRenderMode();
  const voice = audioManifest.voice as string | null;
  const music = audioManifest.music as string | null;
  return (
    <>
      {cues.sfx.map((c, i) => (
        <Sequence key={`sfx${i}`} from={c.at} durationInFrames={Math.ceil(SFX_LEN[c.file] * FPS) + 1} layout="none">
          <Audio src={staticFile(`audio/sfx/${c.file}.wav`)} volume={mix.sfx * dbToGain(c.gainDb)} />
        </Sequence>
      ))}
      {voice ? <Audio src={staticFile(voice)} volume={mix.voice} /> : null}
      {music ? <Audio src={staticFile(music)} volume={(f) => mix.music * duck(f)} /> : null}
    </>
  );
};
