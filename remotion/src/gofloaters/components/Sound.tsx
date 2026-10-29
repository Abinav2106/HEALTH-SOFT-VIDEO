import React from 'react';
import {Audio, interpolate, Sequence, staticFile} from 'remotion';
import {DURATION} from '../constants';

// Original synthesised cues (gofloaters/tools/make_sfx.py). No ticking, no narration; the film
// reads fully with sound off.
const CUES: {at: number; file: string; len: number; gain: number}[] = [
  {at: 4, file: 'aircraft', len: 48, gain: 0.55},
  {at: 74, file: 'swipe', len: 13, gain: 0.6},
  {at: 98, file: 'aircraft', len: 48, gain: 0.35},
  {at: 116, file: 'swipe', len: 13, gain: 0.7},
  {at: 138, file: 'swipe', len: 13, gain: 0.7},
  {at: 204, file: 'swipe', len: 13, gain: 0.5},
  {at: 252, file: 'aircraft', len: 48, gain: 0.45},
  {at: 396, file: 'click', len: 7, gain: 0.8},
  {at: 450, file: 'swipe', len: 13, gain: 0.45},
  {at: 466, file: 'aircraft', len: 48, gain: 0.35},
  {at: 536, file: 'chime', len: 72, gain: 0.75},
  {at: 648, file: 'click', len: 7, gain: 0.55},
  {at: 664, file: 'lift', len: 33, gain: 0.6},
  {at: 756, file: 'swipe', len: 13, gain: 0.45},
  {at: 800, file: 'accent', len: 78, gain: 0.55},
];

export const Sound: React.FC = () => (
  <>
    <Audio
      src={staticFile('gofloaters/audio/bed.wav')}
      volume={(f) => interpolate(f, [0, 20, DURATION - 40, DURATION], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
    />
    {CUES.map((c, i) => (
      <Sequence key={i} from={c.at} durationInFrames={c.len} layout="none">
        <Audio src={staticFile(`gofloaters/audio/${c.file}.wav`)} volume={Math.min(1, c.gain * 1.6)} />
      </Sequence>
    ))}
  </>
);
