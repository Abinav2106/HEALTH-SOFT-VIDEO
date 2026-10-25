import {Easing, interpolate} from 'remotion';
import type {Pt} from './logo';

// ---------- timing ----------

type Ease = (t: number) => number;
export type Key = [frame: number, value: number, ease?: Ease];

/** Piecewise keyframes; each key's easing shapes the segment that ends on it. Clamped at both ends. */
export const kf = (frame: number, keys: Key[]): number => {
  if (frame <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [f1, v1, ease] = keys[i];
    const [f0, v0] = keys[i - 1];
    if (frame <= f1) return interpolate(frame, [f0, f1], [v0, v1], {easing: ease ?? E.inOut});
  }
  return keys[keys.length - 1][1];
};

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const prog = (frame: number, from: number, to: number, ease: Ease = E.inOut) =>
  interpolate(frame, [from, to], [0, 1], {easing: ease, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

export const E = {
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  out: Easing.bezier(0.16, 1, 0.3, 1),
  in: Easing.bezier(0.55, 0, 0.9, 0.4),
  snap: Easing.bezier(0.7, 0, 0.2, 1),
  linear: (t: number) => t,
  /** One small overshoot, then settle. */
  back: Easing.out(Easing.back(1.25)),
  bigBack: Easing.out(Easing.back(2.2)),
};

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const lerpPt = (a: Pt, b: Pt, t: number): Pt => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];

// ---------- curves ----------

export type Bezier = [Pt, Pt, Pt, Pt];
export const bez = ([p0, p1, p2, p3]: Bezier, t: number): Pt => {
  const u = 1 - t;
  const a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
  return [a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]];
};
export const bezAngle = ([p0, p1, p2, p3]: Bezier, t: number) => {
  const u = 1 - t;
  const dx = 3 * u * u * (p1[0] - p0[0]) + 6 * u * t * (p2[0] - p1[0]) + 3 * t * t * (p3[0] - p2[0]);
  const dy = 3 * u * u * (p1[1] - p0[1]) + 6 * u * t * (p2[1] - p1[1]) + 3 * t * t * (p3[1] - p2[1]);
  return (Math.atan2(dy, dx) * 180) / Math.PI;
};
export const bezD = ([p0, p1, p2, p3]: Bezier) =>
  `M${p0[0]} ${p0[1]} C${p1[0]} ${p1[1]} ${p2[0]} ${p2[1]} ${p3[0]} ${p3[1]}`;

// ---------- ring morph targets (logo units, centred on the ring) ----------

/** Even arc-length samples along a polyline outline (closed), starting at its first point. */
const resample = (poly: Pt[], n: number): Pt[] => {
  const segs: number[] = [];
  let total = 0;
  for (let i = 0; i < poly.length; i++) {
    const [x0, y0] = poly[i];
    const [x1, y1] = poly[(i + 1) % poly.length];
    const l = Math.hypot(x1 - x0, y1 - y0);
    segs.push(l);
    total += l;
  }
  const out: Pt[] = [];
  let seg = 0, acc = 0;
  for (let k = 0; k < n; k++) {
    const target = (total * k) / n;
    while (acc + segs[seg] < target) acc += segs[seg++];
    const t = segs[seg] === 0 ? 0 : (target - acc) / segs[seg];
    out.push(lerpPt(poly[seg], poly[(seg + 1) % poly.length], t));
  }
  return out;
};

export const circle = (r: number, n: number, cy = 0): Pt[] =>
  Array.from({length: n}, (_, i) => {
    const a = -Math.PI / 2 + (2 * Math.PI * i) / n; // clockwise on screen, from the top
    return [r * Math.cos(a), cy + r * Math.sin(a)];
  });

export const PIN = {head: 18.2, tip: 43, hole: 11.6};

/** Map-pin outline: round head centred at the origin, point straight down. Clockwise from the top. */
export const pinOutline = (n: number): Pt[] => {
  const {head: R, tip: D} = PIN;
  const at = Math.asin(R / D); // tangent angle below the horizontal
  const poly: Pt[] = [];
  const arc = (a0: number, a1: number, steps: number) => {
    for (let i = 0; i < steps; i++) {
      const a = a0 + ((a1 - a0) * i) / steps;
      poly.push([R * Math.cos(a), R * Math.sin(a)]);
    }
  };
  arc(-Math.PI / 2, at, 400); // top → right tangent point
  poly.push([R * Math.cos(at), R * Math.sin(at)], [0, D]); // down the right edge to the tip
  arc(Math.PI - at, 1.5 * Math.PI, 400); // left tangent point → top
  return resample(poly, n);
};

export const morph = (a: Pt[], b: Pt[], t: number): Pt[] => (t <= 0 ? a : t >= 1 ? b : a.map((p, i) => lerpPt(p, b[i], t)));

export const contoursD = (...rings: Pt[][]) =>
  rings.map((r) => 'M' + r.map(([x, y]) => `${x.toFixed(3)} ${y.toFixed(3)}`).join('L') + 'Z').join('');

// ---------- small drawings (own local units) ----------

/** Pointer arrow, tip at the origin, ~40 units tall. */
export const CURSOR_D = 'M0 0 L0 36 L9 27.6 L14.8 40.6 L20.6 38.1 L14.9 25.2 L26.4 25.2 Z';

/** The Spark Bone: shaft + four knobs, drawn as separate shapes (outline pass, then fill pass). */
export const BONE_PARTS = {
  shaft: {x: -36, y: -9.5, w: 72, h: 19, r: 3},
  knobs: [
    [-40, -10.5],
    [-40, 10.5],
    [40, -10.5],
    [40, 10.5],
  ] as Pt[],
  knobR: 12.5,
};

/** Four-point spark, ~1 unit radius. */
export const SPARK_D = 'M0 -1 C0.12 -0.12 0.12 -0.12 1 0 C0.12 0.12 0.12 0.12 0 1 C-0.12 0.12 -0.12 0.12 -1 0 C-0.12 -0.12 -0.12 -0.12 0 -1 Z';

/** Desk silhouette inside the pin's window (logo units, window radius PIN.hole). */
export const DESK = {
  monitor: {x: -5.6, y: -8.1, width: 11.2, height: 6.9, r: 0.9},
  screen: {x: -4.4, y: -6.9, width: 8.8, height: 4.5, r: 0.4},
  stand: {x: -0.75, y: -1.3, width: 1.5, height: 2.1},
  top: {x: -9.2, y: 0.7, width: 18.4, height: 1.9, r: 0.6},
  legs: [
    {x: -8.1, y: 2.4, width: 1.6, height: 5.6},
    {x: 6.5, y: 2.4, width: 1.6, height: 5.6},
  ],
};

/** Check mark on the booking button (logo units, button radius ~18.8). */
export const CHECK_D = 'M-8 0.6 L-2.4 6.2 L8.6 -5.6';
