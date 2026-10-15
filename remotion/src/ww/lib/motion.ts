import {Easing, interpolate} from 'remotion';
import {FPS} from '../constants';

// Hand-set curves per movement type — no shared spring/bounce preset.
export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1); // entrances: fast start, long settle
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1); // camera moves
export const EASE_IN = Easing.bezier(0.55, 0, 0.9, 0.3); // accelerating exits / stream
export const EASE_RISE = Easing.bezier(0.2, 0.8, 0.25, 1); // R3 card rise (quick, no overshoot)
export const EASE_EXPAND = Easing.bezier(0.7, 0, 0.2, 1); // R3 panel-to-scene expansion

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** 0→1 over [from, from+dur] seconds, evaluated at frame. */
export const prog = (frame: number, fromS: number, durS: number, easing = EASE_OUT) =>
  interpolate(frame / FPS, [fromS, fromS + durS], [0, 1], {...clamp, easing});

/** Piecewise keyframes in seconds with one easing per segment. */
export const keys = (
  frame: number,
  times: number[],
  values: number[],
  easing: ((t: number) => number) | ((t: number) => number)[] = EASE_IN_OUT,
) => {
  const t = frame / FPS;
  if (t <= times[0]) return values[0];
  for (let i = 0; i < times.length - 1; i++) {
    if (t <= times[i + 1]) {
      const e = Array.isArray(easing) ? easing[i] : easing;
      return values[i] + (values[i + 1] - values[i]) * e((t - times[i]) / (times[i + 1] - times[i]));
    }
  }
  return values[values.length - 1];
};

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Deterministic hash → [0,1). Seeded variation, never Math.random. */
export const rand = (...n: number[]) => {
  let h = 2166136261;
  for (const v of n) {
    h ^= Math.floor(v * 1000) + 0x9e3779b9;
    h = Math.imul(h, 16777619);
    h ^= h >>> 13;
  }
  return ((h >>> 0) % 100000) / 100000;
};
