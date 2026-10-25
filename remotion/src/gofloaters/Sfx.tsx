import React from 'react';
import {Audio, Sequence, staticFile} from 'remotion';
import cues from './cues.json';

const dbToGain = (db: number) => Math.pow(10, db / 20);

/** Every SFX cue from cues.json, each on its own frame. Original synthesised sounds only. */
export const Sfx: React.FC = () => (
  <>
    {cues.sfx.map((c, i) => (
      <Sequence key={i} from={c.at} durationInFrames={36} layout="none">
        <Audio src={staticFile(`audio/gofloaters/${c.file}.wav`)} volume={dbToGain(c.gainDb)} />
      </Sequence>
    ))}
  </>
);
