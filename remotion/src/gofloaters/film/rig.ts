// Tilo rig runtime for the film: loads the rig asset (public/brand/tilo_rig.json, exported from
// gofloaters/rig by export_film_rig.mjs) and evaluates the rig's own After Effects expression strings
// in the browser. Same semantics as gofloaters/rig/tools/preview.mjs.
import {useEffect, useState} from 'react';
import {cancelRender, continueRender, delayRender, staticFile} from 'remotion';

export type Pt = [number, number];
export type Group = {kind: string; color: string; rings: Pt[][]};
export type RigLayer = {
  name: string;
  type: 'shape' | 'null';
  parent: string | null;
  anchor: Pt;
  position: Pt;
  scale?: Pt;
  expr?: Record<string, string>;
  pathExpr?: string;
  groupExpr?: {position: string};
  lid?: 'upper' | 'lower';
  lidFill?: string;
  lidEdge?: string;
  mask?: 'eye';
  effects?: {type: string; direction: number; lengthExpr: string}[];
  motionBlur?: boolean;
  groups?: Group[];
};
export type RigAsset = {
  comp: {width: number; height: number; fps: number};
  controls: {name: string; type: string; def: number}[];
  layers: RigLayer[];
  eyeOutline: Pt[];
};

/** A control value source: constant, keyframes [t, v, mode?] or a function of time (seconds). */
export type Keys = number | [number, number, ('ease' | 'linear' | 'hold' | 'snap' | 'out' | 'in')?][] | ((t: number) => number);

// AE Easy Ease = cubic-bezier(0.333, 0, 0.667, 1); 'out' / 'in' are one-sided eases, 'snap' is fast-in.
const bez = (x1: number, y1: number, x2: number, y2: number) => (x: number) => {
  let lo = 0, hi = 1, t = x;
  for (let i = 0; i < 28; i++) {
    const cx = 3 * (1 - t) * (1 - t) * t * x1 + 3 * (1 - t) * t * t * x2 + t * t * t;
    if (cx < x) lo = t; else hi = t;
    t = (lo + hi) / 2;
  }
  return 3 * (1 - t) * (1 - t) * t * y1 + 3 * (1 - t) * t * t * y2 + t * t * t;
};
export const EASES = {
  ease: bez(0.333, 0, 0.667, 1),
  out: bez(0.16, 1, 0.3, 1),
  in: bez(0.6, 0, 0.9, 0.5),
  snap: bez(0.7, 0, 0.2, 1),
  linear: (x: number) => x,
};

export function keyValue(k: Keys | undefined, t: number, def: number): number {
  if (k === undefined) return def;
  if (typeof k === 'number') return k;
  if (typeof k === 'function') return k(t);
  if (!k.length) return def;
  if (t <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) {
    const [t0, v0] = k[i - 1];
    const [t1, v1, mode = 'ease'] = k[i];
    if (t <= t1) {
      if (mode === 'hold') return v0;
      const u = (t - t0) / (t1 - t0);
      return v0 + (v1 - v0) * EASES[mode](u);
    }
  }
  return k[k.length - 1][1];
}

// Expressions are completion-value scripts; a sloppy-mode Function + direct eval returns that value
// and keeps every `var` local to the call, so nested evaluations never clobber each other.
// eslint-disable-next-line no-new-func
const runner = new Function('time', 'value', 'thisComp', 'thisProperty', 'createPath', 'clamp', '__code', 'return eval(__code);') as (
  ...a: unknown[]
) => any;
const createPath = (points: Pt[], inT: Pt[], outT: Pt[], closed: boolean) => ({points, inT, outT, closed});
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export type Overrides = Partial<Record<string, {anchor?: Pt; position?: Pt | ((t: number) => Pt); rotation?: number | ((t: number) => number); scale?: Pt | ((t: number) => Pt); opacity?: number | ((t: number) => number)}>>;

export class Rig {
  byName: Record<string, RigLayer>;
  defaults: Record<string, number>;
  cache = new Map<string, any>();
  fd: number;
  constructor(public asset: RigAsset, public keys: Record<string, Keys>, public over: Overrides = {}) {
    this.byName = Object.fromEntries(asset.layers.map((l) => [l.name, l]));
    this.defaults = Object.fromEntries(asset.controls.map((c) => [c.name, c.def]));
    this.fd = 1 / asset.comp.fps;
  }
  control(n: string, t: number) {
    if (!(n in this.defaults)) throw new Error(`Unknown control "${n}"`);
    return keyValue(this.keys[n], t, this.defaults[n]);
  }
  comp(t: number) {
    const rig = this;
    return {
      frameDuration: rig.fd,
      layer(name: string) {
        if (name === 'CTRL_Tilo') return {effect: (n: string) => () => ({value: rig.control(n, t), valueAtTime: (tt: number) => rig.control(n, tt)})};
        const prop = (p: string) => ({get value() { return rig.prop(name, p, t); }, valueAtTime: (tt: number) => rig.prop(name, p, tt)});
        return {transform: {rotation: prop('rotation'), position: prop('position'), scale: prop('scale'), opacity: prop('opacity')}};
      },
    };
  }
  run(code: string, t: number, value: unknown, thisProperty: unknown) {
    return runner(t, value, this.comp(t), thisProperty, createPath, clamp, code);
  }
  base(l: RigLayer, p: string, t: number): any {
    const o = this.over[l.name];
    const pick = (v: any) => (typeof v === 'function' ? v(t) : v);
    if (p === 'anchor') return o?.anchor ?? l.anchor ?? [0, 0];
    if (p === 'rotation') return o?.rotation !== undefined ? pick(o.rotation) : 0;
    if (p === 'position') return o?.position !== undefined ? pick(o.position) : l.position ?? [0, 0];
    if (p === 'scale') return o?.scale !== undefined ? pick(o.scale) : l.scale ?? [100, 100];
    if (p === 'opacity') return o?.opacity !== undefined ? pick(o.opacity) : 100;
    throw new Error(p);
  }
  prop(name: string, p: string, t: number): any {
    const key = `${name}|${p}|${t.toFixed(5)}`;
    const hit = this.cache.get(key);
    if (hit !== undefined) return hit;
    const l = this.byName[name];
    const v0 = this.base(l, p, t);
    const code = l.expr?.[p];
    const v = code ? this.run(code, t, v0, null) : v0;
    this.cache.set(key, v);
    return v;
  }
  path(code: string, ring: Pt[], t: number, closed = true): Pt[] {
    const zeros = ring.map(() => [0, 0]);
    const tp = {points: () => ring, inTangents: () => zeros, outTangents: () => zeros, isClosed: () => closed};
    return this.run(code, t, null, tp).points;
  }
}

// ---- matrices (SVG order a b c d e f) ----
export type M = [number, number, number, number, number, number];
export const mul = (a: M, b: M): M => [
  a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1],
  a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3],
  a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5],
];
export const localM = (pos: Pt, rot: number, sc: Pt, anc: Pt): M => {
  const r = (rot * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r);
  const sx = sc[0] / 100, sy = sc[1] / 100;
  const a = c * sx, b = s * sx, cc = -s * sy, d = c * sy;
  return [a, b, cc, d, pos[0] - (a * anc[0] + cc * anc[1]), pos[1] - (b * anc[0] + d * anc[1])];
};
export const apply = (m: M, p: Pt): Pt => [m[0] * p[0] + m[2] * p[1] + m[4], m[1] * p[0] + m[3] * p[1] + m[5]];

export function worldMatrix(rig: Rig, name: string, t: number): M {
  const l = rig.byName[name];
  const m = localM(rig.prop(name, 'position', t), rig.prop(name, 'rotation', t), rig.prop(name, 'scale', t), rig.base(l, 'anchor', t));
  return l.parent ? mul(worldMatrix(rig, l.parent, t), m) : m;
}

let cached: RigAsset | null = null;
export const useRigAsset = (): RigAsset | null => {
  const [asset, setAsset] = useState<RigAsset | null>(cached);
  const [handle] = useState(() => (cached ? null : delayRender('Loading Tilo rig')));
  useEffect(() => {
    if (cached || handle === null) return;
    fetch(staticFile('brand/tilo_rig.json'))
      .then((r) => {
        if (!r.ok) throw new Error('Missing public/brand/tilo_rig.json: run gofloaters/rig/tools/export_film_rig.mjs');
        return r.json();
      })
      .then((j: RigAsset) => {
        cached = j;
        setAsset(j);
        continueRender(handle);
      })
      .catch((e) => cancelRender(e));
  }, [handle]);
  return asset;
};
