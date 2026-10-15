import React from 'react';
import {Audio, Sequence, staticFile} from 'remotion';
import {f} from '../constants';
import manifest from './audioManifest.json';

// Scratch audio only: synthesised SFX (ww/tools/make_audio.py) and robotic scratch dialogue for timing
// (espeak-ng). Not a voice performance. Regenerate the manifest with the same script.
type Cue = {file: string; at: number; volume: number};

export const WWAudio: React.FC = () => (
  <>
    {(manifest.cues as Cue[]).map((c, i) => (
      <Sequence key={`${c.file}-${i}`} from={f(c.at)} layout="none">
        <Audio src={staticFile(c.file)} volume={c.volume} />
      </Sequence>
    ))}
  </>
);
