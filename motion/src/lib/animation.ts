import {Easing, interpolate, spring, useVideoConfig} from 'remotion';

// Frame-driven animation helpers. Everything is a pure function of the frame, so previews scrub
// deterministically and renders are reproducible. Never use CSS transitions/animations in Remotion.

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const EASE = {
  /** Fast start, long soft settle — the default for entrances. */
  out: Easing.bezier(0.16, 1, 0.3, 1),
  /** Symmetric — for moves between two resting states. */
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  /** Accelerating — for exits. */
  in: Easing.bezier(0.55, 0, 1, 0.45),
} as const;

/** 0 → 1 over [start, start + duration] frames, eased and clamped. */
export const progress = (frame: number, start: number, duration: number, easing: (t: number) => number = EASE.out) =>
  interpolate(frame, [start, start + duration], [0, 1], {...clamp, easing});

/** Physically based 0 → 1 (may overshoot slightly) starting at `delay` frames. */
export const springIn = (frame: number, fps: number, delay = 0, config: {damping?: number; stiffness?: number; mass?: number} = {damping: 14, stiffness: 120}) =>
  spring({frame: frame - delay, fps, config});

/** Linear map of a 0 → 1 value onto [from, to]. */
export const mix = (from: number, to: number, t: number) => from + (to - from) * t;

/** Frame offset for the i-th item of a staggered group. */
export const stagger = (index: number, stepFrames: number, start = 0) => start + index * stepFrames;

/**
 * Size multiplier relative to a 1920×1080 design. Lay out at 1920×1080 and multiply pixel sizes
 * by this value — the same scene then works at 1280×720, 3840×2160, square or vertical.
 */
export const useScale = () => {
  const {width, height} = useVideoConfig();
  return Math.min(width / 1920, height / 1080);
};
