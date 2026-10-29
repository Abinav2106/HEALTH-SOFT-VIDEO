import React from 'react';
import {COLORS} from '../constants';

// The golden spark: the one collectible, and (miniature) the reward-card icon. Same shape everywhere.
// Four points — tall vertical, slightly shorter horizontal — gently concave sides, softened tips.

export const SPARK = {
  height: 62, // main collectible, tip to tip
  widthRatio: 0.78, // horizontal points vs vertical
  concave: [0.17, 0.37] as const, // side control points (fraction of the radii): higher = fuller sides
  tipSoftness: 0.075, // fraction of each side trimmed and rounded at the tips
  halo: '#FFE59A',
  highlight: '#FFF6D6',
} as const;

type P = {x: number; y: number};
const lerpP = (a: P, b: P, t: number): P => ({x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t});

/** Split a cubic at t (de Casteljau), returning [left, right] control polygons. */
const split = (p0: P, p1: P, p2: P, p3: P, t: number): [P[], P[]] => {
  const a = lerpP(p0, p1, t);
  const b = lerpP(p1, p2, t);
  const c = lerpP(p2, p3, t);
  const d = lerpP(a, b, t);
  const e = lerpP(b, c, t);
  const m = lerpP(d, e, t);
  return [
    [p0, a, d, m],
    [m, e, c, p3],
  ];
};

/** Spark outline for a given tip-to-tip height, centred on the origin. */
export const sparkPath = (height: number) => {
  const rv = height / 2;
  const rh = rv * SPARK.widthRatio;
  const [k1, k2] = SPARK.concave;
  const tips: P[] = [
    {x: 0, y: -rv},
    {x: rh, y: 0},
    {x: 0, y: rv},
    {x: -rh, y: 0},
  ];
  // each side is a concave cubic from one tip to the next; trim both ends for soft tips
  const sides = tips.map((a, i) => {
    const b = tips[(i + 1) % 4];
    const sx = Math.sign(a.x + b.x);
    const sy = Math.sign(a.y + b.y);
    const c1 = {x: sx * k1 * rh, y: sy * k2 * rv};
    const c2 = {x: sx * k2 * rh, y: sy * k1 * rv};
    const [, rest] = split(a, c1, c2, b, SPARK.tipSoftness);
    const [mid] = split(rest[0], rest[1], rest[2], rest[3], (1 - 2 * SPARK.tipSoftness) / (1 - SPARK.tipSoftness));
    return mid;
  });
  const f = (n: number) => n.toFixed(2);
  let d = `M ${f(sides[0][0].x)} ${f(sides[0][0].y)}`;
  sides.forEach((s, i) => {
    d += ` C ${f(s[1].x)} ${f(s[1].y)} ${f(s[2].x)} ${f(s[2].y)} ${f(s[3].x)} ${f(s[3].y)}`;
    const next = sides[(i + 1) % 4][0];
    const tip = tips[(i + 1) % 4];
    d += ` Q ${f(tip.x)} ${f(tip.y)} ${f(next.x)} ${f(next.y)}`; // rounded tip
  });
  return `${d} Z`;
};

export type SparkProps = {
  x: number;
  y: number;
  size?: number; // tip-to-tip height
  rotate?: number;
  glow?: number; // 0…1 extra brightness (pulse, contact flash)
  halo?: number; // 0…1 halo strength
  opacity?: number;
  outline?: number; // navy outline width at this size
  id?: string;
};

export const GoldenSpark: React.FC<SparkProps> = ({
  x,
  y,
  size = SPARK.height,
  rotate = 0,
  glow = 0,
  halo = 1,
  opacity = 1,
  outline = 2.6,
  id = 'golden-spark',
}) => {
  if (opacity <= 0 || size <= 0) return null;
  const d = sparkPath(size);
  const inner = sparkPath(size * 0.4);
  const haloR = size * (0.62 + 0.22 * glow);
  const gid = `${id}-halo`;
  return (
    <g id={id} transform={`translate(${x} ${y}) rotate(${rotate})`} opacity={opacity}>
      <defs>
        <radialGradient id={gid}>
          <stop offset="0%" stopColor={SPARK.halo} stopOpacity={0.75} />
          <stop offset="55%" stopColor={SPARK.halo} stopOpacity={0.28} />
          <stop offset="100%" stopColor={SPARK.halo} stopOpacity={0} />
        </radialGradient>
      </defs>
      {halo > 0 ? <circle id={`${id}-glow`} r={haloR} fill={`url(#${gid})`} opacity={Math.min(1, halo * (0.55 + 0.45 * glow))} /> : null}
      <path id={`${id}-body`} d={d} fill={COLORS.gold} stroke={COLORS.navy} strokeWidth={outline} strokeLinejoin="round" />
      <path id={`${id}-core`} d={inner} fill={SPARK.highlight} opacity={0.55 + 0.45 * glow} />
      {glow > 0 ? <path d={d} fill={COLORS.white} opacity={0.3 * glow} /> : null}
    </g>
  );
};
