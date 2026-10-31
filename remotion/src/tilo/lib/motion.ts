import {Easing, interpolate} from 'remotion';
import {PROJ} from '../constants';

export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
export const EASE_IN = Easing.bezier(0.55, 0, 0.75, 0.06);
export const EASE_SOFT = Easing.bezier(0.4, 0, 0.2, 1);

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** 0→1 over [from, from+dur], clamped and eased. */
export const prog = (frame: number, from: number, dur: number, easing: (t: number) => number = EASE_OUT) =>
  interpolate(frame, [from, from + dur], [0, 1], {...clamp, easing});

/** Piecewise interpolation, clamped, one easing for every segment. */
export const keys = (frame: number, input: number[], output: number[], easing: (t: number) => number = EASE_IN_OUT) =>
  interpolate(frame, input, output, {...clamp, easing});

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
export const deg = (r: number) => (r * 180) / Math.PI;
export const rad = (d: number) => (d * Math.PI) / 180;

/**
 * Monotone cubic (Fritsch–Carlson) spline through keyframes. C1-continuous, so a path built from
 * several keyframes never changes speed abruptly and never overshoots between keys.
 */
export const spline = (x: number, xs: number[], ys: number[]) => {
  const n = xs.length;
  if (x <= xs[0]) return ys[0];
  if (x >= xs[n - 1]) return ys[n - 1];
  const d: number[] = [];
  const m: number[] = [];
  for (let i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
  m.push(d[0]);
  for (let i = 1; i < n - 1; i++) m.push(d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2);
  m.push(d[n - 2]);
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const a = m[i] / d[i];
    const b = m[i + 1] / d[i];
    const s = a * a + b * b;
    if (s > 9) {
      const k = 3 / Math.sqrt(s);
      m[i] = k * a * d[i];
      m[i + 1] = k * b * d[i];
    }
  }
  let i = 0;
  while (x > xs[i + 1]) i++;
  const h = xs[i + 1] - xs[i];
  const t = (x - xs[i]) / h;
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h * m[i + 1]
  );
};

/** Damped spring response to a unit step that happened `t` frames ago (0 before the step). */
export const springStep = (t: number, freq = 0.18, damping = 0.22) => {
  if (t <= 0) return 0;
  const w = freq * Math.PI * 2;
  return 1 - Math.exp(-damping * w * t) * Math.cos(w * Math.sqrt(1 - damping * damping) * t);
};

/** Short decaying wobble, 0 at t=0 and settling to 0. */
export const wobble = (t: number, freq = 0.12, decay = 0.12) => (t <= 0 ? 0 : Math.sin(t * freq * Math.PI * 2) * Math.exp(-t * decay));

export type Vec = {x: number; y: number};

/** Oblique world → screen. */
export const project = (X: number, Y: number, Z: number): Vec => ({
  x: PROJ.ox + X + PROJ.kx * Z,
  y: PROJ.oy - Y - PROJ.ky * Z,
});

export const pts = (list: Vec[]) => list.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');

/**
 * Two-segment IK in SVG space (y down). Returns absolute segment angles (degrees, 0 = pointing down,
 * positive = clockwise, matching `rotate()`), for segments that hang along +y at rest.
 * `bend` = +1 bends the joint forward (toward +x), −1 backward.
 */
export const ik2 = (root: Vec, target: Vec, l1: number, l2: number, bend: 1 | -1) => {
  const dx = target.x - root.x;
  const dy = target.y - root.y;
  const dist = Math.min(Math.max(Math.hypot(dx, dy), Math.abs(l1 - l2) + 0.01), l1 + l2 - 0.01);
  const base = Math.atan2(dx, dy); // angle from +y toward +x
  const cosA = (l1 * l1 + dist * dist - l2 * l2) / (2 * l1 * dist);
  const a = Math.acos(Math.min(1, Math.max(-1, cosA)));
  const upper = base + bend * a; // radians, measured from +y toward +x
  const jx = root.x + Math.sin(upper) * l1;
  const jy = root.y + Math.cos(upper) * l1;
  const lower = Math.atan2(target.x - jx, target.y - jy);
  // rotate(θ) maps (0,1) → (−sinθ, cosθ); our angle φ maps (0,1) → (sinφ, cosφ) ⇒ θ = −φ.
  return {upper: -deg(upper), lower: -deg(lower), joint: {x: jx, y: jy}};
};

export const rotateVec = (v: Vec, degrees: number): Vec => {
  const r = rad(degrees);
  return {x: v.x * Math.cos(r) - v.y * Math.sin(r), y: v.x * Math.sin(r) + v.y * Math.cos(r)};
};
