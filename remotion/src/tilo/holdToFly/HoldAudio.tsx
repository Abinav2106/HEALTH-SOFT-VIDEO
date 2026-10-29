import React from 'react';
import {Audio, interpolate, Sequence, staticFile} from 'remotion';
import {useHold} from './useHold';

// Sound for Hold to Fly, from scripts/generate-tilo-audio.py (original, no third-party samples):
// restrained aircraft + wind under the city flight, a short paper/air movement as the marker
// opens, a soft slide for the sheet and one modest accent as the ticket lands. No cash sounds.
// The message reads fully without sound.

type Cue = {src: string; at: number; volume: (t: number) => number};

export const HoldAudio: React.FC = () => {
  const c = useHold();
  const a = c.audio;
  if (!a.enabled) return null;
  const speed = c.review.playbackSpeed;
  const end = c.shots.s06[1];
  const h = c.hold;
  const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
  const cues: Cue[] = [
    {
      src: 'tilo/audio/propeller_bed.wav',
      at: 0,
      volume: (t) => a.bed * interpolate(t, [0, 5, 250, 300, 330, end - 16, end - 1], [0, 1, 1, 0.75, 0.5, 0.5, 0], clamp),
    },
    {src: 'tilo/audio/wind.wav', at: 0, volume: (t) => a.wind * interpolate(t, [0, 10, 150, 180], [0, 1, 1, 0], clamp)},
    {src: 'tilo/audio/wind.wav', at: 140, volume: (t) => a.wind * interpolate(t, [140, 170, 236, 272], [0, 0.9, 0.9, 0], clamp)},
    {src: 'tilo/audio/marker_unfold.wav', at: h.markerOpen[0] - 1, volume: () => a.ui},
    {src: 'tilo/audio/sheet_slide.wav', at: c.timing.sheetRiseStart + 2, volume: () => a.ui * 0.7},
    {src: 'tilo/audio/marker_chime.wav', at: h.ticketSettle[0] + 4, volume: () => a.chime},
  ];
  return (
    <>
      {cues.map((cue, i) => (
        <Sequence key={i} from={Math.round(cue.at / speed)} layout="none" name={`audio:${cue.src.split('/').pop()}`}>
          <Audio src={staticFile(cue.src)} playbackRate={speed} volume={(f) => cue.volume(cue.at + f * speed)} />
        </Sequence>
      ))}
    </>
  );
};
