// A drawn line as a sampled polyline with pen-up gaps (door openings), so it can be revealed by length,
// and a light can travel along exactly the same geometry.

export type Pt = {x: number; y: number};
type Piece = {pts: Pt[]; pen: boolean};

export const line = (a: Pt, b: Pt): Piece => ({pts: [a, b], pen: true});
export const gap = (a: Pt, b: Pt): Piece => ({pts: [a, b], pen: false});
export const cubic = (a: Pt, c1: Pt, c2: Pt, b: Pt, n = 48): Piece => {
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const u = 1 - t;
    pts.push({
      x: u * u * u * a.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * b.x,
      y: u * u * u * a.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * b.y,
    });
  }
  return {pts, pen: true};
};

export type Route = {pts: Pt[]; pen: boolean[]; cum: number[]; length: number};

export const buildRoute = (pieces: Piece[]): Route => {
  const pts: Pt[] = [pieces[0].pts[0]];
  const pen: boolean[] = [];
  for (const p of pieces) {
    for (let i = 1; i < p.pts.length; i++) {
      pts.push(p.pts[i]);
      pen.push(p.pen);
    }
  }
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
  return {pts, pen, cum, length: cum[cum.length - 1]};
};

const segAt = (r: Route, len: number) => {
  const L = Math.max(0, Math.min(r.length, len));
  let i = 0;
  while (i < r.pen.length - 1 && r.cum[i + 1] < L) i++;
  const seg = r.cum[i + 1] - r.cum[i];
  const t = seg > 0 ? (L - r.cum[i]) / seg : 0;
  return {i, t};
};

export const pointAt = (r: Route, len: number): Pt => {
  const {i, t} = segAt(r, len);
  const a = r.pts[i];
  const b = r.pts[i + 1];
  return {x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t};
};

/** Cumulative length at the point of the route closest to p (for timing branches off the main line). */
export const lengthAt = (r: Route, p: Pt) => {
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < r.pts.length - 1; i++) {
    const a = r.pts[i];
    const b = r.pts[i + 1];
    const seg = r.cum[i + 1] - r.cum[i];
    const t = seg > 0 ? Math.max(0, Math.min(1, ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / (seg * seg))) : 0;
    const d = Math.hypot(a.x + (b.x - a.x) * t - p.x, a.y + (b.y - a.y) * t - p.y);
    if (d < bestD) {
      bestD = d;
      best = r.cum[i] + seg * t;
    }
  }
  return best;
};

/** SVG path data for the first `len` px of the route, honouring pen-up gaps. */
export const pathUpTo = (r: Route, len: number) => {
  if (len <= 0) return '';
  const end = segAt(r, len);
  const tip = pointAt(r, len);
  let d = '';
  let down = false;
  for (let i = 0; i <= end.i; i++) {
    const b = i === end.i ? tip : r.pts[i + 1];
    if (!r.pen[i]) {
      down = false;
      continue;
    }
    const a = r.pts[i];
    if (!down) d += `M${a.x.toFixed(2)} ${a.y.toFixed(2)}`;
    d += `L${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
    down = true;
  }
  return d;
};
