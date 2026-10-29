import type {TiloConfig} from '../config';
import type {Flight} from './flight';

// Deterministic city layout, reconstructed to match the storyboard's game map (the supplied
// recording contains no map footage): pale parcels between thin white roads, sparse low/mid-rise
// slate buildings with flat yellow roofs and foundations. Seeded hashing only — no Math.random.

export type Pt = {x: number; z: number};
export type Parcel = {corners: [Pt, Pt, Pt, Pt]; color: number};
export type Building = {
  cx: number;
  cz: number;
  w: number;
  d: number;
  angle: number; // radians around +y
  height: number;
  floors: number;
  tint: number; // 0..1 brightness variation
  roofBox: null | {ox: number; oz: number; w: number; d: number; h: number};
  destination?: boolean;
};
export type City = {parcels: Parcel[]; buildings: Building[]; destination: Building};

const hash = (seed: number, ...n: number[]) => {
  let h = 2166136261 ^ seed;
  for (const v of n) {
    h = Math.imul(h ^ (v | 0), 16777619);
    h ^= h >>> 13;
    h = Math.imul(h, 0x5bd1e995);
    h ^= h >>> 15;
  }
  return (h >>> 0) / 4294967296;
};

const lerp = (a: Pt, b: Pt, t: number): Pt => ({x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t});
const bilerp = (q: [Pt, Pt, Pt, Pt], u: number, v: number): Pt => lerp(lerp(q[0], q[1], u), lerp(q[3], q[2], u), v);

/** Shrink a convex quad inward by `inset` metres along each edge normal. */
const insetQuad = (q: [Pt, Pt, Pt, Pt], inset: number): [Pt, Pt, Pt, Pt] => {
  const out = q.map((p, i) => {
    const prev = q[(i + 3) % 4];
    const next = q[(i + 1) % 4];
    const e1 = {x: p.x - prev.x, z: p.z - prev.z};
    const e2 = {x: next.x - p.x, z: next.z - p.z};
    const l1 = Math.hypot(e1.x, e1.z);
    const l2 = Math.hypot(e2.x, e2.z);
    // Inward normals for clockwise-in-screen (x right, z down) winding.
    const n1 = {x: -e1.z / l1, z: e1.x / l1};
    const n2 = {x: -e2.z / l2, z: e2.x / l2};
    const bis = {x: n1.x + n2.x, z: n1.z + n2.z};
    const bl = Math.hypot(bis.x, bis.z);
    const cos = (n1.x * bis.x + n1.z * bis.z) / bl;
    const k = inset / Math.max(cos, 0.3);
    return {x: p.x + (bis.x / bl) * k, z: p.z + (bis.z / bl) * k};
  });
  return out as [Pt, Pt, Pt, Pt];
};

export const buildCity = (config: TiloConfig, flight: Flight): City => {
  const c = config.city;
  const rot = (c.rotationDeg * Math.PI) / 180;
  const cos = Math.cos(rot);
  const sin = Math.sin(rot);
  const toWorld = (u: number, v: number): Pt => ({x: u * cos - v * sin, z: u * sin + v * cos});
  const toGrid = (x: number, z: number) => ({u: x * cos + z * sin, v: -x * sin + z * cos});

  let minU = Infinity, maxU = -Infinity, minV = Infinity, maxV = -Infinity;
  for (const s of flight.samples) {
    const g = toGrid(s.x, s.z);
    minU = Math.min(minU, g.u); maxU = Math.max(maxU, g.u);
    minV = Math.min(minV, g.v); maxV = Math.max(maxV, g.v);
  }
  const i0 = Math.floor((minU - c.radius) / c.block);
  const i1 = Math.ceil((maxU + c.radius) / c.block);
  const j0 = Math.floor((minV - c.radius) / c.block);
  const j1 = Math.ceil((maxV + c.radius) / c.block);

  const node = (i: number, j: number): Pt =>
    toWorld(i * c.block + (hash(c.seed, i, j, 1) - 0.5) * 2 * c.jitter, j * c.block + (hash(c.seed, i, j, 2) - 0.5) * 2 * c.jitter);

  const dest = flight.destination;
  const parcels: Parcel[] = [];
  const buildings: Building[] = [];
  const clearR = c.destinationSize * 0.95;

  for (let i = i0; i < i1; i++) {
    for (let j = j0; j < j1; j++) {
      const block = insetQuad([node(i, j), node(i + 1, j), node(i + 1, j + 1), node(i, j + 1)], c.roadHalfWidth);
      const nu = 1 + Math.floor(hash(c.seed, i, j, 3) * 2.6);
      const nv = 1 + Math.floor(hash(c.seed, i, j, 4) * 2.2);
      const lenU = Math.hypot(block[1].x - block[0].x, block[1].z - block[0].z);
      const lenV = Math.hypot(block[3].x - block[0].x, block[3].z - block[0].z);
      const gu = c.lotGap / 2 / lenU;
      const gv = c.lotGap / 2 / lenV;
      for (let a = 0; a < nu; a++) {
        for (let b = 0; b < nv; b++) {
          const u0 = a / nu + (a > 0 ? gu : 0);
          const u1 = (a + 1) / nu - (a < nu - 1 ? gu : 0);
          const v0 = b / nv + (b > 0 ? gv : 0);
          const v1 = (b + 1) / nv - (b < nv - 1 ? gv : 0);
          const lot: [Pt, Pt, Pt, Pt] = [bilerp(block, u0, v0), bilerp(block, u1, v0), bilerp(block, u1, v1), bilerp(block, u0, v1)];
          const k = hash(c.seed, i, j, a, b, 5);
          parcels.push({corners: lot, color: Math.floor(k * config.colors.parcels.length)});

          if (hash(c.seed, i, j, a, b, 6) > c.buildingChance) continue;
          const center = bilerp(lot, 0.5, 0.5);
          if (Math.hypot(center.x - dest.x, center.z - dest.z) < clearR + 14) continue;
          const eu = {x: lot[1].x - lot[0].x, z: lot[1].z - lot[0].z};
          const lu = Math.hypot(eu.x, eu.z);
          const lv = Math.hypot(lot[3].x - lot[0].x, lot[3].z - lot[0].z);
          if (lu < 12 || lv < 12) continue;
          const w = Math.min(22, lu * (0.42 + hash(c.seed, i, j, a, b, 7) * 0.3));
          const d = Math.min(22, lv * (0.42 + hash(c.seed, i, j, a, b, 8) * 0.3));
          const floors = 2 + Math.floor(Math.pow(hash(c.seed, i, j, a, b, 9), 1.7) * (c.maxFloors - 1));
          const height = floors * c.floorHeight;
          const hasBox = hash(c.seed, i, j, a, b, 10) < 0.45;
          buildings.push({
            cx: center.x,
            cz: center.z,
            w,
            d,
            angle: -Math.atan2(eu.z, eu.x),
            height,
            floors,
            tint: hash(c.seed, i, j, a, b, 11),
            roofBox: hasBox
              ? {
                  ox: (hash(c.seed, i, j, a, b, 12) - 0.5) * w * 0.4,
                  oz: (hash(c.seed, i, j, a, b, 13) - 0.5) * d * 0.4,
                  w: w * 0.28,
                  d: d * 0.28,
                  h: 2.2,
                }
              : null,
          });
        }
      }
    }
  }

  const size = c.destinationSize;
  const destination: Building = {
    cx: dest.x,
    cz: dest.z,
    w: size,
    d: size,
    angle: -rot,
    height: c.destinationFloors * c.floorHeight,
    floors: c.destinationFloors,
    tint: 0.6,
    roofBox: {ox: 0, oz: 0, w: size * 0.3, d: size * 0.3, h: c.rooftopBoxHeight},
    destination: true,
  };
  buildings.push(destination);
  return {parcels, buildings, destination};
};
