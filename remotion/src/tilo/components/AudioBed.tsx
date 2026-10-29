import React from 'react';
import {Audio, interpolate, Sequence, staticFile} from 'remotion';
import {useConfig} from '../lib/timeline';

// Sound design synthesised by scripts/generate-tilo-audio.py (original, no third-party samples).
// The film reads fully without sound. Cue frames are on the master timeline; in the 2× review
// composition they are placed at half the frame and played at 2× (as Instagram would).

type Cue = {src: string; at: number; volume: (t: number) => number};

export const AudioBed: React.FC = () => {
  const config = useConfig();
  const a = config.audio;
  if (!a.enabled) return null;
  const speed = config.review.playbackSpeed;
  const s06 = config.shots.s06[0];
  const [s03a, s03b] = config.shots.s03;
  const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
  const cues: Cue[] = [
    {
      src: 'tilo/audio/propeller_bed.wav',
      at: 0,
      // Ducks as the bird settles and the reward UI takes over.
      volume: (t) => a.bed * interpolate(t, [0, 6, 470, 540, s06, s06 + 12, 712, 719], [0, 1, 1, 0.7, 0.7, 0.45, 0.45, 0], clamp),
    },
    {
      src: 'tilo/audio/wind.wav',
      at: s03a - 15,
      volume: (t) => a.wind * interpolate(t, [s03a - 15, s03a + 15, s03b - 20, s03b + 30], [0, 1, 1, 0], clamp),
    },
    {src: 'tilo/audio/marker_chime.wav', at: config.timing.markerFound, volume: () => a.chime},
    {src: 'tilo/audio/sheet_slide.wav', at: config.timing.sheetRiseStart + 4, volume: () => a.ui * 0.7},
    {src: 'tilo/audio/sheet_slide.wav', at: s06, volume: () => a.ui},
    {src: 'tilo/audio/ui_click.wav', at: config.timing.ctaIn + 2, volume: () => a.ui * 0.8},
  ];
  return (
    <>
      {cues.map((c, i) => {
        const from = Math.round(c.at / speed);
        return (
          <Sequence key={i} from={from} layout="none" name={`audio:${c.src.split('/').pop()}`}>
            <Audio src={staticFile(c.src)} playbackRate={speed} volume={(f) => c.volume(c.at + f * speed)} />
          </Sequence>
        );
      })}
    </>
  );
};
