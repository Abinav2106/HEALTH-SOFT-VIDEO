// 2D affine matrices in canvas order: [a, b, c, d, e, f] → x' = a·x + c·y + e, y' = b·x + d·y + f.
export type M = [number, number, number, number, number, number];

export const I: M = [1, 0, 0, 1, 0, 0];
export const mul = (m: M, n: M): M => [
  m[0] * n[0] + m[2] * n[1],
  m[1] * n[0] + m[3] * n[1],
  m[0] * n[2] + m[2] * n[3],
  m[1] * n[2] + m[3] * n[3],
  m[0] * n[4] + m[2] * n[5] + m[4],
  m[1] * n[4] + m[3] * n[5] + m[5],
];
export const T = (x: number, y: number): M => [1, 0, 0, 1, x, y];
export const S = (sx: number, sy = sx): M => [sx, 0, 0, sy, 0, 0];
export const R = (deg: number): M => {
  const r = (deg * Math.PI) / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  return [c, s, -s, c, 0, 0];
};
/** Rotate / scale about a point. */
export const about = (px: number, py: number, m: M): M => mul(T(px, py), mul(m, T(-px, -py)));
export const chain = (...ms: M[]): M => ms.reduce((acc, m) => mul(acc, m), I);
export const apply = (m: M, x: number, y: number): [number, number] => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];

/** Affine that maps source triangle (s0,s1,s2) onto destination triangle (d0,d1,d2). */
export const triAffine = (s: number[], d: number[]): M => {
  const [x0, y0, x1, y1, x2, y2] = s;
  const [u0, v0, u1, v1, u2, v2] = d;
  const den = x0 * (y1 - y2) + x1 * (y2 - y0) + x2 * (y0 - y1);
  const a = (u0 * (y1 - y2) + u1 * (y2 - y0) + u2 * (y0 - y1)) / den;
  const c = (u0 * (x2 - x1) + u1 * (x0 - x2) + u2 * (x1 - x0)) / den;
  const e = (u0 * (x1 * y2 - x2 * y1) + u1 * (x2 * y0 - x0 * y2) + u2 * (x0 * y1 - x1 * y0)) / den;
  const b = (v0 * (y1 - y2) + v1 * (y2 - y0) + v2 * (y0 - y1)) / den;
  const dd = (v0 * (x2 - x1) + v1 * (x0 - x2) + v2 * (x1 - x0)) / den;
  const f = (v0 * (x1 * y2 - x2 * y1) + v1 * (x2 * y0 - x0 * y2) + v2 * (x0 * y1 - x1 * y0)) / den;
  return [a, b, c, dd, e, f];
};
