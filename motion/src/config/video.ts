// Single source of truth for output format. Change a value here and every composition that uses
// VIDEO (all scenes size and time themselves from useVideoConfig()) follows automatically.

export const VIDEO = {
  width: 1920,
  height: 1080,
  fps: 30,
} as const;

// Common formats — e.g. `{...VIDEO, ...FORMATS.vertical}` in Root.tsx for a 9:16 version.
export const FORMATS = {
  landscape: {width: 1920, height: 1080},
  square: {width: 1080, height: 1080},
  portrait: {width: 1080, height: 1350},
  vertical: {width: 1080, height: 1920},
  uhd: {width: 3840, height: 2160},
} as const;

/** Seconds → whole frames at a given frame rate. */
export const sec = (seconds: number, fps: number) => Math.round(seconds * fps);
