import {sec} from '../../config/video';

// Scene lengths in SECONDS — frames are derived from the composition fps, so changing VIDEO.fps
// (src/config/video.ts) keeps the timing identical. Edit these to change the pacing/duration.
export const TIMELINE = {
  intro: 3.4,
  features: 3.6,
  stats: 3.2,
  outro: 3.2,
  /** Each scene-to-scene transition; adjacent scenes overlap by this much. */
  overlap: 0.6,
} as const;

const SCENES = ['intro', 'features', 'stats', 'outro'] as const;
export type SceneName = (typeof SCENES)[number];

/** Total frames: sum of scenes minus the overlap of the three transitions. */
export const showcaseDurationInFrames = (fps: number) =>
  SCENES.reduce((n, s) => n + sec(TIMELINE[s], fps), 0) - (SCENES.length - 1) * sec(TIMELINE.overlap, fps);

/** Absolute start frame of each scene in the final timeline — used to sync audio cues. */
export const sceneStart = (scene: SceneName, fps: number) => {
  let at = 0;
  for (const s of SCENES) {
    if (s === scene) return at;
    at += sec(TIMELINE[s], fps) - sec(TIMELINE.overlap, fps);
  }
  return at;
};
