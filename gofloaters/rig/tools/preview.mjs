// Preview renderer for the Tilo rig. Evaluates the exact expression strings from rig_spec.mjs in a
// small After Effects expression runtime (Node vm), composes parenting, masks, directional blur and
// motion blur, and renders SVG frames through Chromium. Used for the acting test and pose sheets.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {buildSpec} from './rig_spec.mjs';

// ---------- keyframes (AE "Easy Ease" = cubic-bezier(0.333,0,0.667,1)) ----------
function bezierEase(x) {
  // solve cubic-bezier(0.333,0,0.667,1) for y at x
  const x1 = 0.333, x2 = 0.667;
  let lo = 0, hi = 1, t = x;
  for (let i = 0; i < 30; i++) {
    const cx = 3 * (1 - t) * (1 - t) * t * x1 + 3 * (1 - t) * t * t * x2 + t * t * t;
    if (cx < x) lo = t; else hi = t;
    t = (lo + hi) / 2;
  }
  return 3 * (1 - t) * t * t + t * t * t; // y1=0,y2=1
}
export function keyValue(keys, t, def) {
  if (!keys || !keys.length) return def;
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t0, v0] = keys[i - 1];
    const [t1, v1, mode] = keys[i];
    if (t <= t1) {
      const u = (t - t0) / (t1 - t0);
      if (mode === 'hold') return v0;
      return v0 + (v1 - v0) * (mode === 'linear' ? u : bezierEase(u));
    }
  }
  return keys[keys.length - 1][1];
}

// ---------- expression runtime ----------
const script = new Map();
const compile = (code) => {
  if (!script.has(code)) script.set(code, new vm.Script(code));
  return script.get(code);
};
const api = () => ({
  Math,
  createPath: (points, inT, outT, closed) => ({points, inT, outT, closed}),
  clamp: (v, a, b) => Math.max(a, Math.min(b, v)),
});

export class Evaluator {
  constructor(spec, keys = {}) {
    this.spec = spec;
    this.keys = keys;
    this.byName = Object.fromEntries(spec.layers.map((l) => [l.name, l]));
    this.ctrlDef = Object.fromEntries(spec.controls.map((c) => [c.name, c.def]));
    this.ctx = [];
    this.depth = 0;
    this.cache = new Map();
    this.fd = 1 / spec.comp.fps;
  }
  control(n, t) {
    if (!(n in this.ctrlDef)) throw new Error(`Unknown control "${n}"`);
    return keyValue(this.keys[n], t, this.ctrlDef[n]);
  }
  context() {
    if (!this.ctx[this.depth]) this.ctx[this.depth] = vm.createContext(api());
    return this.ctx[this.depth];
  }
  comp(t) {
    const ev = this;
    return {
      frameDuration: ev.fd,
      width: ev.spec.comp.width,
      height: ev.spec.comp.height,
      layer(name) {
        if (name === 'CTRL_Tilo')
          return {
            effect: (n) => () => ({value: ev.control(n, t), valueAtTime: (tt) => ev.control(n, tt)}),
          };
        if (!ev.byName[name]) throw new Error(`thisComp.layer("${name}") not found`);
        const prop = (p) => ({get value() { return ev.prop(name, p, t); }, valueAtTime: (tt) => ev.prop(name, p, tt)});
        return {transform: {rotation: prop('rotation'), position: prop('position'), scale: prop('scale'), opacity: prop('opacity')}};
      },
    };
  }
  run(code, t, value, thisProperty) {
    const ctx = this.context();
    ctx.time = t;
    ctx.value = value;
    ctx.thisComp = this.comp(t);
    ctx.thisProperty = thisProperty;
    this.depth++;
    try {
      return compile(code).runInContext(ctx);
    } finally {
      this.depth--;
    }
  }
  static base(l, p) {
    if (p === 'rotation') return l.rotation ?? 0;
    if (p === 'position') return l.position ?? [0, 0];
    if (p === 'scale') return l.scale ?? [100, 100];
    if (p === 'opacity') return 100;
    if (p === 'anchor') return l.anchor ?? [0, 0];
    throw new Error(p);
  }
  prop(name, p, t) {
    const key = `${name}|${p}|${t.toFixed(6)}`;
    if (this.cache.has(key)) return this.cache.get(key);
    const l = this.byName[name];
    const v0 = Evaluator.base(l, p);
    const code = l.expr?.[p];
    const v = code ? this.run(code, t, v0, null) : v0;
    if (typeof v === 'number' ? !Number.isFinite(v) : v.some((x) => !Number.isFinite(x))) throw new Error(`${name}.${p} -> ${v}`);
    this.cache.set(key, v);
    return v;
  }
  path(code, ring, t, closed = true) {
    const zeros = ring.map(() => [0, 0]);
    const tp = {points: () => ring, inTangents: () => zeros, outTangents: () => zeros, isClosed: () => closed};
    const r = this.run(code, t, null, tp);
    if (!r || !r.points) throw new Error('path expression did not return createPath()');
    return r.points;
  }
  effectValue(code, t) {
    return this.run(code, t, 0, null);
  }
}

// ---------- matrices ----------
const mul = (a, b) => [
  a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1],
  a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3],
  a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5],
];
const localM = (pos, rot, sc, anc) => {
  const r = (rot * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r);
  const sx = sc[0] / 100, sy = sc[1] / 100;
  // T(pos) R S T(-anc)
  const a = c * sx, b = s * sx, cc = -s * sy, d = c * sy;
  return [a, b, cc, d, pos[0] - (a * anc[0] + cc * anc[1]), pos[1] - (b * anc[0] + d * anc[1])];
};
const fmt = (m) => `matrix(${m.map((v) => +v.toFixed(5)).join(' ')})`;
const ringD = (r) => 'M' + r.map((p) => `${+p[0].toFixed(2)} ${+p[1].toFixed(2)}`).join('L') + 'Z';

// ---------- frame ----------
export function frameSVG(ev, t, {bg = '#E9EFF2', overlay = '', showPivots = false, motionBlurSamples = 8, tint = false} = {}) {
  let tintIx = 0;
  const spec = ev.spec;
  const W = spec.comp.width, H = spec.comp.height;
  const world = {};
  const worldAt = (name, tt) => {
    const l = ev.byName[name];
    const m = localM(ev.prop(name, 'position', tt), ev.prop(name, 'rotation', tt), ev.prop(name, 'scale', tt), Evaluator.base(l, 'anchor'));
    return l.parent ? mul(worldAt(l.parent, tt), m) : m;
  };
  const defs = [];
  const eyeD = ringD(spec.eyeOutline);
  defs.push(`<clipPath id="eye" clipPathUnits="userSpaceOnUse"><path d="${eyeD}"/></clipPath>`);
  const body = [];
  const layerContent = (l, tt) => {
    const out = [];
    if (l.lid) {
      const fill = ev.path(l.lidFill, [], tt, true);
      const edge = ev.path(l.lidEdge, [], tt, false);
      out.push(`<path d="${ringD(fill)}" fill="#FFFFFF"/>`);
      out.push(`<path d="M${edge.map((p) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join('L')}" fill="none" stroke="#111110" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`);
      return out.join('');
    }
    let gtr = '';
    if (l.groupExpr?.position) {
      const p = ev.run(l.groupExpr.position, tt, [0, 0], null);
      gtr = ` transform="translate(${p[0].toFixed(3)} ${p[1].toFixed(3)})"`;
    }
    const hue = (tintIx++ * 47) % 360;
    for (const g of l.groups || []) {
      const d = g.rings.map((r) => ringD(l.pathExpr ? ev.path(l.pathExpr, r, tt) : r)).join('');
      const col = tint && g.color !== '#111110' ? `hsl(${hue},70%,72%)` : g.color;
      out.push(`<path d="${d}" fill="${col}" fill-rule="evenodd"${gtr}/>`);
    }
    return out.join('');
  };
  for (const name of [...spec.layers.map((l) => l.name)].reverse()) {
    const l = ev.byName[name];
    if (l.type !== 'shape') continue;
    const op = ev.prop(name, 'opacity', t) / 100;
    if (op <= 0.001) continue;
    let filt = '';
    if (l.effects) {
      for (const e of l.effects) {
        if (e.type === 'directionalBlur') {
          const len = ev.effectValue(e.lengthExpr, t);
          const sd = Math.max(0, len) * 0.22;
          if (sd > 0.05) {
            const id = `blur_${name}`;
            defs.push(`<filter id="${id}" x="-20%" y="-30%" width="140%" height="160%"><feGaussianBlur stdDeviation="0 ${sd.toFixed(2)}"/></filter>`);
            filt = ` filter="url(#${id})"`;
          }
        }
      }
    }
    const clip = l.mask === 'eye' ? ` clip-path="url(#eye)"` : '';
    if (l.motionBlur && motionBlurSamples > 1) {
      // AE default shutter: 180 deg, phase -90 deg -> samples across [t - fd/4, t + fd/4]
      const parts = [];
      for (let s = 0; s < motionBlurSamples; s++) {
        const tt = t + ev.fd * (-0.25 + (0.5 * s) / (motionBlurSamples - 1));
        const m = worldAt(name, tt);
        parts.push(`<g transform="${fmt(m)}" opacity="${(1 / (s + 1)).toFixed(4)}"><g${clip}${filt}>${layerContent(l, tt)}</g></g>`);
      }
      body.push(`<g opacity="${op.toFixed(3)}" style="isolation:isolate">${parts.join('')}</g>`);
    } else {
      body.push(`<g transform="${fmt(worldAt(name, t))}" opacity="${op.toFixed(3)}"><g${clip}${filt}>${layerContent(l, t)}</g></g>`);
    }
  }
  if (showPivots) {
    for (const l of spec.layers) {
      if (l.type !== 'shape' && l.name !== 'Dog_Root') continue;
      const m = worldAt(l.name, t);
      const a = Evaluator.base(l, 'anchor');
      const x = m[0] * a[0] + m[2] * a[1] + m[4], y = m[1] * a[0] + m[3] * a[1] + m[5];
      body.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5" fill="#E2264D" stroke="#fff" stroke-width="1.5"/>`);
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${defs.join('')}</defs><rect width="${W}" height="${H}" fill="${bg}"/>${body.join('')}${overlay}</svg>`;
}

export function makeEvaluator(keys = {}, overrides = {}) {
  const spec = buildSpec();
  for (const [layer, props] of Object.entries(overrides)) Object.assign(spec.layers.find((l) => l.name === layer), props);
  return new Evaluator(spec, keys);
}
