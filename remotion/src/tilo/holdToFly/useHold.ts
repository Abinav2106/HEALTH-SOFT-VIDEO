import {Easing, interpolate} from 'remotion';
import {useConfig} from '../lib/timeline';
import type {HoldConfig} from './config';

/** The Hold to Fly config (a superset of the shared Tilo config). */
export const useHold = (): HoldConfig => useConfig() as HoldConfig;

/** 0→1 across [a, b] (output frames), clamped, with optional easing. */
export const prog = (t: number, [a, b]: readonly [number, number], easing?: (x: number) => number) =>
  interpolate(t, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});

export const easeOut = Easing.out(Easing.cubic);
export const easeInOut = Easing.inOut(Easing.cubic);
