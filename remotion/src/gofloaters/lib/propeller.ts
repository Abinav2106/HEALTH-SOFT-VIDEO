// Propeller spin, driven only by the composition frame (seekable, deterministic).
// A rate profile (revolutions per second at given frames, linearly interpolated) is integrated
// frame by frame, so speeding up or settling never jumps the blade angle.
import {FPS} from '../constants';

export type SpinKey = {f: number; rps: number};

export const FLIGHT_RPS = 6.3; // ~76° per frame: reads as a fast spin at 30 fps, never a slow clock hand
export const IDLE_RPS = 1.1; // settled: a slow, visible sweep — never frozen

const rateAt = (keys: SpinKey[], f: number) => {
  if (f <= keys[0].f) return keys[0].rps;
  for (let i = 1; i < keys.length; i++) {
    if (f <= keys[i].f) {
      const a = keys[i - 1];
      const b = keys[i];
      return a.rps + ((b.rps - a.rps) * (f - a.f)) / (b.f - a.f);
    }
  }
  return keys[keys.length - 1].rps;
};

/** Blade angle in radians at frame f, plus the current rate (for motion-blur length). */
export const spinAt = (keys: SpinKey[], f: number) => {
  let rev = 0;
  const whole = Math.floor(f);
  for (let i = 0; i < whole; i++) rev += rateAt(keys, i) / FPS;
  rev += (rateAt(keys, whole) / FPS) * (f - whole);
  return {angle: rev * Math.PI * 2, rps: rateAt(keys, f)};
};

export const constantSpin = (rps: number): SpinKey[] => [{f: 0, rps}];
