import type {Quad} from '../constants';

type Vec2 = [number, number];

// Solve the 8 homography unknowns mapping the rectangle (0,0)-(w,h) onto `quad` (TL, TR, BR, BL).
const solveHomography = (w: number, h: number, quad: Quad): number[] => {
  const src: Vec2[] = [
    [0, 0],
    [w, 0],
    [w, h],
    [0, h],
  ];
  const A: number[][] = [];
  const b: number[] = [];
  for (let i = 0; i < 4; i++) {
    const [x, y] = src[i];
    const [u, v] = quad[i];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]);
    b.push(u);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y]);
    b.push(v);
  }
  // Gaussian elimination with partial pivoting.
  const n = 8;
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++) if (Math.abs(A[r][col]) > Math.abs(A[pivot][col])) pivot = r;
    [A[col], A[pivot]] = [A[pivot], A[col]];
    [b[col], b[pivot]] = [b[pivot], b[col]];
    for (let r = col + 1; r < n; r++) {
      const f = A[r][col] / A[col][col];
      for (let c = col; c < n; c++) A[r][c] -= f * A[col][c];
      b[r] -= f * b[col];
    }
  }
  const x = new Array(n).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    let s = b[r];
    for (let c = r + 1; c < n; c++) s -= A[r][c] * x[c];
    x[r] = s / A[r][r];
  }
  return x;
};

/** CSS matrix3d that pins an element of size w×h (transform-origin 0 0) onto `quad`. */
export const cornerPinMatrix = (w: number, h: number, quad: Quad): string => {
  const [a, b, c, d, e, f, g, hh] = solveHomography(w, h, quad);
  // Column-major 4×4 embedding of the 3×3 homography.
  const m = [a, d, 0, g, b, e, 0, hh, 0, 0, 1, 0, c, f, 0, 1];
  return `matrix3d(${m.map((v) => v.toFixed(10)).join(',')})`;
};

export const lerpQuad = (q0: Quad, q1: Quad, t: number): Quad =>
  q0.map(([x, y], i) => [x + (q1[i][0] - x) * t, y + (q1[i][1] - y) * t]) as Quad;

/** Scale a quad about a pivot then translate it — used to keep the pinned screen locked to a camera push. */
export const transformQuad = (q: Quad, pivot: Vec2, scale: number, translate: Vec2): Quad =>
  q.map(([x, y]) => [pivot[0] + (x - pivot[0]) * scale + translate[0], pivot[1] + (y - pivot[1]) * scale + translate[1]]) as Quad;

export const quadCentroid = (q: Quad): Vec2 => [
  (q[0][0] + q[1][0] + q[2][0] + q[3][0]) / 4,
  (q[0][1] + q[1][1] + q[2][1] + q[3][1]) / 4,
];
