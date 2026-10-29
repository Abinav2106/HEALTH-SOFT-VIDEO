import {Easing, interpolate} from 'remotion';

// Controlled curves only: no overshoot, no elastic, no bounce.
export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
export const EASE_IN = Easing.bezier(0.55, 0, 0.75, 0.06);

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** 0→1 over [from, from + dur), eased and clamped. */
export const prog = (f: number, from: number, dur: number, easing = EASE_OUT) =>
  interpolate(f, [from, from + dur], [0, 1], {...clamp, easing});

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Interpolate on a log scale — even-feeling zooms across large scale ranges. */
export const lerpScale = (a: number, b: number, t: number) => Math.exp(lerp(Math.log(a), Math.log(b), t));

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
