import React from 'react';
import {Audio, interpolate, Sequence, staticFile} from 'remotion';
import {VO} from '../constants';

// Narration (Kokoro-82M, af_heart) and original synthesised effects (make_sfx.py). No music was
// supplied, so this is the narration-and-effects mix. The aircraft hum and every effect duck
// under the voice; nothing ticks and the glitch is a single short accent.
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

// Tilo in flight: hum only while the aircraft is moving.
const HUM: [number, number][] = [
  [2, 56],
  [100, 152],
  [252, 352],
  [382, 430],
  [552, 584],
  [726, 750],
  [796, 824],
];
const CUES: {at: number; file: string; len: number; gain: number}[] = [
  {at: 44, file: 'whoosh', len: 15, gain: 0.45}, // clue card rises
  {at: 130, file: 'swipe', len: 13, gain: 0.5}, // "teams meet"
  {at: 154, file: 'swipe', len: 13, gain: 0.5}, // "beside the window"
  {at: 270, file: 'glitch', len: 7, gain: 0.4}, // the one signal-glitch accent
  {at: 336, file: 'click', len: 7, gain: 0.6}, // target lock
  {at: 450, file: 'chime', len: 72, gain: 0.55}, // the one discovery chime
  {at: 556, file: 'thud', len: 11, gain: 0.6}, // closed box settles
  {at: 576, file: 'lift', len: 33, gain: 0.45}, // lid lifts
  {at: 606, file: 'lift', len: 33, gain: 0.4}, // gift card rises
  {at: 690, file: 'whoosh', len: 15, gain: 0.4}, // interface panel rises
  {at: 764, file: 'click', len: 7, gain: 0.45}, // Chennai
  {at: 796, file: 'whoosh', len: 15, gain: 0.35}, // preview → mystery card
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
            volume={(fr) => 0.3 * duck(a + fr) * interpolate(fr, [0, 8, b - a - 10, b - a], [0, 1, 1, 0], clamp)}
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
