import React from 'react';
import {Audio, Sequence, staticFile} from 'remotion';
import cues from './cues.json';

type Cue = {at: number; file: string; gainDb: number; note?: string};
const dbToGain = (db: number) => Math.pow(10, db / 20);

/** The film's SFX cue sheet (film/cues.json): original synthesised sounds, no music, no narration. */
export const FilmSfx: React.FC = () => (
  <>
    {(cues.sfx as Cue[]).map((c, i) => (
      <Sequence key={i} from={c.at} durationInFrames={45} layout="none">
        <Audio src={staticFile(`audio/gofloaters/${c.file}.wav`)} volume={dbToGain(c.gainDb)} />
      </Sequence>
    ))}
  </>
);
