import {Easing, interpolate} from 'remotion';

export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
export const EASE_IN = Easing.bezier(0.55, 0, 0.75, 0.06);

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** 0→1 progress over [from, from+dur) with the given easing, clamped. */
export const progress = (frame: number, from: number, dur: number, easing = EASE_OUT) =>
  interpolate(frame, [from, from + dur], [0, 1], {...clamp, easing});

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Magnetic snap: an ease-in pull, then a small damped elastic settle past the target.
 * Overshoot is kept under ~6 % so it reads as sophisticated, not bouncy.
 */
export const magnetic = (frame: number, from: number, snapAt: number, settle = 10) => {
  if (frame <= from) return 0;
  if (frame < snapAt) return 0.92 * interpolate(frame, [from, snapAt], [0, 1], {...clamp, easing: Easing.bezier(0.5, 0, 0.9, 0.6)}) ** 1.15;
  const t = Math.min(1, (frame - snapAt) / settle);
  return 1 + 0.06 * Math.exp(-5 * t) * Math.sin(t * Math.PI * 2.2) * (1 - t);
};

/** Deterministic handheld drift in px (sum of incommensurate sines). */
export const handheld = (frame: number, amp: number, seed = 0) => ({
  x: amp * (0.6 * Math.sin((frame + seed * 13) * 0.071) + 0.4 * Math.sin((frame + seed * 7) * 0.173 + 1.3)),
  y: amp * (0.55 * Math.sin((frame + seed * 11) * 0.059 + 0.7) + 0.45 * Math.sin((frame + seed * 5) * 0.149 + 2.1)),
  r: amp * 0.012 * Math.sin((frame + seed * 3) * 0.047 + 0.4),
});
