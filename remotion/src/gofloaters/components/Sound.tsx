import React from 'react';
import {Audio, interpolate, Sequence, staticFile} from 'remotion';
import {VO} from '../constants';

// Narration (Kokoro-82M, af_heart) and original synthesised effects (make_sfx.py). No music: none
// was supplied, so this is the narration-and-effects version. The aircraft hum and the effects
// duck under the voice; nothing ticks.
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const LINES = Object.entries(VO) as [keyof typeof VO, {at: number; len: number}][];

/** 1 when no one is speaking, DUCK while narration plays (short ramps either side). */
const DUCK = 0.4; // ≈ −8 dB
const duck = (f: number) => {
  let g = 1;
  for (const [, l] of LINES) {
    const d = interpolate(f, [l.at - 5, l.at, l.at + l.len, l.at + l.len + 6], [0, 1, 1, 0], clamp);
    g = Math.min(g, 1 - d * (1 - DUCK));
  }
  return g;
};

// Tilo's flights: hum only while the aircraft is moving.
const HUM: [number, number][] = [
  [4, 78],
  [100, 160],
  [256, 396],
  [464, 534],
  [646, 704],
  [790, 832],
];
const CUES: {at: number; file: string; len: number; gain: number}[] = [
  {at: 128, file: 'swipe', len: 13, gain: 0.5}, // highlight: "teams meet"
  {at: 158, file: 'swipe', len: 13, gain: 0.5}, // highlight: "beside the window"
  {at: 396, file: 'click', len: 7, gain: 0.75}, // map selection
  {at: 520, file: 'chime', len: 72, gain: 0.6}, // the one discovery chime
  {at: 626, file: 'click', len: 7, gain: 0.4}, // success check
  {at: 668, file: 'lift', len: 33, gain: 0.55}, // gift card lift
  {at: 776, file: 'accent', len: 78, gain: 0.45}, // quiet closing accent as the map settles — decays before "GoFloaters"
];

export const Sound: React.FC<{narration: boolean; sfx: boolean}> = ({narration, sfx}) => (
  <>
    {narration &&
      LINES.map(([key, l]) => (
        <Sequence key={key} from={l.at} durationInFrames={l.len + 2} layout="none">
          <Audio src={staticFile(`gofloaters/voice/${key}.wav`)} />
        </Sequence>
      ))}
    {sfx &&
      HUM.map(([a, b]) => (
        <Sequence key={`hum${a}`} from={a} durationInFrames={b - a} layout="none">
          <Audio
            src={staticFile('gofloaters/audio/hum.wav')}
            volume={(fr) => 0.32 * duck(a + fr) * interpolate(fr, [0, 10, b - a - 12, b - a], [0, 1, 1, 0], clamp)}
          />
        </Sequence>
      ))}
    {sfx &&
      CUES.map((c) => (
        <Sequence key={`${c.file}${c.at}`} from={c.at} durationInFrames={c.len} layout="none">
          <Audio src={staticFile(`gofloaters/audio/${c.file}.wav`)} volume={c.gain * (0.6 + 0.4 * duck(c.at))} />
        </Sequence>
      ))}
  </>
);
