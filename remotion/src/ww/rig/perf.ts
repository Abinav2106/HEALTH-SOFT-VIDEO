import {Easing} from 'remotion';
import {Arm, Phone, REST, RigPose} from './DoubtRig';

// Pose keyframes for the character performance. Each key holds the channels that change; the rest
// carry over from the previous key. Interpolation is per channel with the key's easing (the curve of
// the segment that ENDS on that key). Hand-keyed — no shared spring preset.

export const E = {
  io: Easing.bezier(0.65, 0, 0.35, 1), // move-holds
  out: Easing.bezier(0.16, 1, 0.3, 1), // snappy arrival
  in: Easing.bezier(0.55, 0, 0.9, 0.3), // drop / fall
  pop: Easing.bezier(0.34, 1.5, 0.64, 1), // overshoot for character pops only
  lin: (x: number) => x,
};

export type Key = [number, Partial<Omit<RigPose, 'phone'>> & {phone?: Partial<Phone>}, ((x: number) => number)?];

type Full = RigPose & {phone: Phone};
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerpArm = (a: Arm, b: Arm, k: number): Arm => ({s: lerp(a.s, b.s, k), e: lerp(a.e, b.e, k), w: lerp(a.w, b.w, k)});

const resolve = (keys: Key[], base: Full) => {
  const out: [number, Full, (x: number) => number][] = [];
  let prev: Full = base;
  for (const [t, p, ease] of keys) {
    const cur: Full = {
      ...prev,
      ...(p as Partial<RigPose>),
      armL: p.armL ? {...prev.armL, ...p.armL} : prev.armL,
      armR: p.armR ? {...prev.armR, ...p.armR} : prev.armR,
      phone: p.phone ? {...prev.phone, ...p.phone} : prev.phone,
    };
    out.push([t, cur, ease ?? E.io]);
    prev = cur;
  }
  return out;
};

const NUM = ['lean', 'hop', 'squash', 'qTilt', 'qLift', 'qSquash', 'glow'] as const;

export const makeTrack = (keys: Key[], base: Partial<Full> = {}) => {
  const b: Full = {...REST, phone: {hand: 'r', show: 0, up: 0, buzz: 0, tilt: 0}, ...base} as Full;
  const ks = resolve(keys, b);
  return (t: number): Full => {
    if (t <= ks[0][0]) return ks[0][1];
    for (let i = 0; i < ks.length - 1; i++) {
      const [t0, a] = ks[i];
      const [t1, z, ease] = ks[i + 1];
      if (t <= t1) {
        const k = ease((t - t0) / (t1 - t0));
        const r = {...a} as Full;
        for (const n of NUM) r[n] = lerp(a[n], z[n], k);
        r.armL = lerpArm(a.armL, z.armL, k);
        r.armR = lerpArm(a.armR, z.armR, k);
        r.phone = {
          hand: z.phone.hand,
          show: lerp(a.phone.show, z.phone.show, k),
          up: lerp(a.phone.up, z.phone.up, k),
          buzz: lerp(a.phone.buzz, z.phone.buzz, k),
          tilt: lerp(a.phone.tilt ?? 0, z.phone.tilt ?? 0, k),
        };
        return r;
      }
    }
    return ks[ks.length - 1][1];
  };
};

/** 0→1→0 window with soft edges, for layering oscillations onto keyed poses. */
export const win = (t: number, a: number, b: number, edge = 0.12) =>
  Math.max(0, Math.min(1, (t - a) / edge, (b - t) / edge));

/** Smooth deterministic wobble (sum of incommensurate sines), roughly −1…1. */
export const wobble = (t: number, seed: number) =>
  0.55 * Math.sin(t * 1.31 + seed) + 0.3 * Math.sin(t * 2.93 + seed * 2.1) + 0.15 * Math.sin(t * 5.07 + seed * 3.7);
