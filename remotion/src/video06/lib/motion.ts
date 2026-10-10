import {Easing, interpolate} from 'remotion';

// Restrained curves: fast settle, long tail. No overshoot or bounce anywhere in the film.
export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
export const EASE_IN = Easing.bezier(0.55, 0, 0.75, 0.06);

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** 0→1 progress over [from, from+dur) with the given easing, clamped. */
export const progress = (frame: number, from: number, dur: number, easing = EASE_OUT) =>
  interpolate(frame, [from, from + dur], [0, 1], {...clamp, easing});

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const mix = (frame: number, input: number[], output: number[], easing = EASE_IN_OUT) =>
  interpolate(frame, input, output, {...clamp, easing});
