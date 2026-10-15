import React, {useLayoutEffect, useRef, useState} from 'react';
import {cancelRender, continueRender, delayRender, staticFile} from 'remotion';
import {HEIGHT, WIDTH} from '../constants';
import metrics from '../assetMetrics.json';
import {M, R, S, T, about, apply, chain, mul, triAffine} from './affine';

// Doubt as a 2D cut-out rig built ONLY from the approved neutral render's own pixels
// (ww/tools/prep_assets.py): torso (+trousers/feet), two arms with mittens, the floating question mark,
// the render's contact shadow. Arms bend along their length (mesh deformation driven by shoulder /
// elbow / wrist angles), the body leans / hops / squashes about the feet, the question mark tilts /
// lifts / squashes. Everything is a pure function of the pose passed in for the current frame.
//
// This is a stand-in for the 3D rig: no turns, no depth. See ww/README.md for the model file needed.

const rig = metrics.rig;
const Q = metrics.qmark;
export const Q_CENTER = {x: Q.x + Q.w / 2, y: Q.y + Q.h / 2};
const Q_PIVOT = {x: Q_CENTER.x - 6, y: Q.y + Q.h - 10};
const FEET = {x: rig.feet[0], y: rig.feet[1]};

export type Cam = {s: number; sx: number; sy: number; rot?: number}; // Q_CENTER at screen (sx, sy)
export type Arm = {s: number; e: number; w: number}; // degrees; + = away from the body
export type Phone = {hand: 'l' | 'r'; show: number; up: number; buzz: number; tilt?: number};
export type RigPose = {
  lean: number; // deg about the feet (+ = top to screen right)
  hop: number; // render px up
  squash: number; // +0.06 = taller/thinner, −0.06 = shorter/wider (about the feet)
  qTilt: number;
  qLift: number;
  qSquash: number;
  qSpin?: number; // deg about the question mark's own centre (twirl)
  glow: number;
  armL: Arm;
  armR: Arm;
  phone?: Phone;
};

export const REST: RigPose = {
  lean: 0,
  hop: 0,
  squash: 0,
  qTilt: 0,
  qLift: 0,
  qSquash: 0,
  glow: 0,
  armL: {s: 0, e: 0, w: 0},
  armR: {s: 0, e: 0, w: 0},
};

// ── image loading (once per tab) ──────────────────────────────────────────────
const FILES = {
  torso: 'ww/brand/doubt_torso.png',
  armL: 'ww/brand/doubt_arm_l.png',
  armR: 'ww/brand/doubt_arm_r.png',
  qmark: 'ww/brand/doubt_qmark.png',
  shadow: 'ww/brand/doubt_shadow.png',
} as const;
type Key = keyof typeof FILES;
type Loaded = Record<Key, HTMLImageElement> & {quads: Record<'l' | 'r', Uint8Array>};
let loaded: Loaded | null = null;
let loading: Promise<Loaded> | null = null;

const ROW_STEP = 6;
const COLS = 6;

const loadAll = () => {
  if (!loading) {
    loading = Promise.all(
      (Object.keys(FILES) as Key[]).map(
        (k) =>
          new Promise<[Key, HTMLImageElement]>((res, rej) => {
            const im = new Image();
            im.onload = () => res([k, im]);
            im.onerror = () => rej(new Error(`Rig layer missing: ${FILES[k]} (run ww/tools/prep_assets.py)`));
            im.src = staticFile(FILES[k]);
          }),
      ),
    ).then((pairs) => {
      const imgs = Object.fromEntries(pairs) as Record<Key, HTMLImageElement>;
      // Pre-compute which mesh quads carry any pixels, so empty ones are skipped every frame.
      const quads = {l: emptyMap(imgs.armL), r: emptyMap(imgs.armR)};
      loaded = {...imgs, quads};
      return loaded;
    });
  }
  return loading;
};

const rowsOf = (h: number) => {
  const ys: number[] = [];
  for (let y = 0; y < h; y += ROW_STEP) ys.push(y);
  if (ys[ys.length - 1] !== h) ys.push(h);
  return ys;
};

const emptyMap = (img: HTMLImageElement) => {
  const c = document.createElement('canvas');
  c.width = img.width;
  c.height = img.height;
  const ctx = c.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, img.width, img.height).data;
  const ys = rowsOf(img.height);
  const map = new Uint8Array((ys.length - 1) * COLS);
  for (let i = 0; i < ys.length - 1; i++) {
    for (let j = 0; j < COLS; j++) {
      const x0 = Math.floor((j * img.width) / COLS);
      const x1 = Math.ceil(((j + 1) * img.width) / COLS);
      let any = 0;
      for (let y = ys[i]; y < ys[i + 1] && !any; y++) {
        for (let x = x0; x < x1; x++) {
          if (data[(y * img.width + x) * 4 + 3] > 2) {
            any = 1;
            break;
          }
        }
      }
      map[i * COLS + j] = any;
    }
  }
  return map;
};

// ── deformation ───────────────────────────────────────────────────────────────
const ss = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const rad = (d: number) => (d * Math.PI) / 180;

type ArmGeo = (typeof rig)['l'];

/** Returns a function mapping a render-space point of the arm to its posed render-space point. */
const armMapper = (geo: ArmGeo, pose: Arm, side: 'l' | 'r') => {
  const sign = side === 'l' ? 1 : -1;
  const [px, py] = geo.pivot;
  const angle = (y: number) =>
    sign * (pose.s * ss(py - 25, py + 40, y) + pose.e * ss(geo.elbow - 30, geo.elbow + 30, y) + pose.w * ss(geo.wrist - 12, geo.wrist + 22, y));
  // Centre-line integrated from the top of the arm (rows above the shoulder blend stay put).
  const y0 = geo.y;
  const n = geo.h + 1;
  const cx = new Float64Array(n);
  const cy = new Float64Array(n);
  const th = new Float64Array(n);
  cx[0] = px;
  cy[0] = y0;
  th[0] = rad(angle(y0));
  for (let i = 1; i < n; i++) {
    const a = rad(angle(y0 + i - 0.5));
    cx[i] = cx[i - 1] - Math.sin(a);
    cy[i] = cy[i - 1] + Math.cos(a);
    th[i] = rad(angle(y0 + i));
  }
  const at = (x: number, y: number): [number, number] => {
    const i = Math.max(0, Math.min(n - 1, Math.round(y - y0)));
    const d = x - px;
    return [cx[i] + d * Math.cos(th[i]), cy[i] + d * Math.sin(th[i])];
  };
  const angleAt = (y: number) => angle(y);
  return {at, angleAt};
};

const drawArm = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, quads: Uint8Array, geo: ArmGeo, pose: Arm, side: 'l' | 'r', Mb: M) => {
  const map = armMapper(geo, pose, side);
  const ys = rowsOf(geo.h);
  const xs = Array.from({length: COLS + 1}, (_, j) => (j * geo.w) / COLS);
  // Posed screen positions of every mesh vertex.
  const V: [number, number][][] = ys.map((v) => xs.map((u) => apply(Mb, ...map.at(geo.x + u, geo.y + v))));
  const tri = (s: number[], d: [number, number][]) => {
    const cxm = (d[0][0] + d[1][0] + d[2][0]) / 3;
    const cym = (d[0][1] + d[1][1] + d[2][1]) / 3;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0); // clip path is in screen space
    ctx.beginPath();
    d.forEach(([x, y], k) => {
      const dx = x - cxm;
      const dy = y - cym;
      const len = Math.hypot(dx, dy) || 1;
      const g = 1 + 0.9 / len; // overlap neighbours by ~0.9 px to hide seams
      if (k === 0) ctx.moveTo(cxm + dx * g, cym + dy * g);
      else ctx.lineTo(cxm + dx * g, cym + dy * g);
    });
    ctx.closePath();
    ctx.clip();
    const m = triAffine(s, [d[0][0], d[0][1], d[1][0], d[1][1], d[2][0], d[2][1]]);
    ctx.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]);
    ctx.drawImage(img, 0, 0);
    ctx.restore();
  };
  for (let i = 0; i < ys.length - 1; i++) {
    for (let j = 0; j < COLS; j++) {
      if (!quads[i * COLS + j]) continue;
      const u0 = xs[j];
      const u1 = xs[j + 1];
      const v0 = ys[i];
      const v1 = ys[i + 1];
      tri([u0, v0, u1, v0, u1, v1], [V[i][j], V[i][j + 1], V[i + 1][j + 1]]);
      tri([u0, v0, u1, v1, u0, v1], [V[i][j], V[i + 1][j + 1], V[i + 1][j]]);
    }
  }
  return map;
};

// ── phone (neutral, original; back faces the viewer) ─────────────────────────
const PHONE = {w: 92, h: 186, r: 20};
const drawPhone = (ctx: CanvasRenderingContext2D, m: M, buzz: number, frame: number) => {
  ctx.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]);
  const jx = buzz * 3.2 * Math.sin(frame * 2.9);
  const jr = buzz * 0.05 * Math.sin(frame * 3.7 + 1);
  ctx.translate(jx, 0);
  ctx.rotate(jr);
  const {w, h, r} = PHONE;
  if (buzz > 0) {
    ctx.shadowColor = `rgba(255,106,0,${0.55 * buzz})`;
    ctx.shadowBlur = 26;
  }
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, r);
  ctx.fillStyle = '#111111';
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#3A3A3A';
  ctx.stroke();
  // camera bump
  ctx.beginPath();
  ctx.roundRect(-w / 2 + 10, -h / 2 + 10, 34, 52, 10);
  ctx.fillStyle = '#1E1E1E';
  ctx.fill();
  for (const cy of [-h / 2 + 24, -h / 2 + 48]) {
    ctx.beginPath();
    ctx.arc(-w / 2 + 27, cy, 9, 0, Math.PI * 2);
    ctx.fillStyle = '#050505';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#444';
    ctx.stroke();
  }
};

// ── composition ───────────────────────────────────────────────────────────────
export const camMatrix = (cam: Cam): M =>
  chain(about(WIDTH / 2, HEIGHT / 2, R(cam.rot ?? 0)), T(cam.sx, cam.sy), S(cam.s), T(-Q_CENTER.x, -Q_CENTER.y));

export const bodyMatrix = (cam: Cam, p: RigPose): M =>
  chain(camMatrix(cam), T(0, -p.hop), about(FEET.x, FEET.y, mul(R(p.lean), S(1 - p.squash * 0.5, 1 + p.squash))));

const draw = (ctx: CanvasRenderingContext2D, L: Loaded, cam: Cam, p: RigPose, frame: number, shadow: number) => {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ctx.imageSmoothingQuality = 'high';
  const Mc = camMatrix(cam);
  const Mb = bodyMatrix(cam, p);
  const set = (m: M) => ctx.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]);

  // contact shadow stays on the floor: shrinks and fades as Doubt leaves it
  const lift = Math.min(1, Math.max(0, p.hop / 160));
  set(chain(Mc, about(FEET.x, FEET.y, S(1 - lift * 0.3, 1))));
  ctx.globalAlpha = shadow * (1 - lift * 0.6);
  ctx.drawImage(L.shadow, metrics.shadow.x, metrics.shadow.y);
  ctx.globalAlpha = 1;

  set(Mb);
  ctx.drawImage(L.torso, rig.torso.x, rig.torso.y);

  const holding = p.phone && p.phone.show > 0 ? p.phone.hand : null;
  const free: ('l' | 'r')[] = holding === 'l' ? ['r'] : holding === 'r' ? ['l'] : ['l', 'r'];
  for (const side of free) drawArm(ctx, side === 'l' ? L.armL : L.armR, L.quads[side], rig[side], side === 'l' ? p.armL : p.armR, side, Mb);

  if (holding && p.phone) {
    const geo = rig[holding];
    const arm = holding === 'l' ? p.armL : p.armR;
    const map = armMapper(geo, arm, holding);
    const [hx, hy] = map.at(geo.palm[0], geo.palm[1]);
    const off = 58 + (-74 - 58) * p.phone.up; // hangs below the mitten → stands above it when raised
    drawPhone(ctx, chain(Mb, T(hx, hy + off), R(p.phone.tilt ?? 0), S(p.phone.show)), p.phone.buzz, frame);
    drawArm(ctx, holding === 'l' ? L.armL : L.armR, L.quads[holding], geo, arm, holding, Mb);
  }

  // question mark (+ the brief opening light effect)
  const Mq = chain(
    Mb,
    T(0, -p.qLift),
    about(Q_PIVOT.x, Q_PIVOT.y, mul(R(p.qTilt), S(1 - p.qSquash * 0.4, 1 + p.qSquash))),
    about(Q_CENTER.x, Q_CENTER.y, R(p.qSpin ?? 0)),
  );
  set(Mq);
  if (p.glow > 0) {
    const g = ctx.createRadialGradient(Q_CENTER.x, Q_CENTER.y, 0, Q_CENTER.x, Q_CENTER.y, 330);
    g.addColorStop(0, `rgba(255,106,0,${0.55 * p.glow})`);
    g.addColorStop(0.38, `rgba(255,106,0,${0.18 * p.glow})`);
    g.addColorStop(0.7, 'rgba(255,106,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(Q_CENTER.x - 330, Q_CENTER.y - 330, 660, 660);
  }
  ctx.drawImage(L.qmark, Q.x, Q.y);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
};

/** Screen position of a render-space point on the posed body (for UI / props anchored to Doubt). */
export const rigPoint = (cam: Cam, p: RigPose, x: number, y: number) => apply(bodyMatrix(cam, p), x, y);

export const DoubtRig: React.FC<{cam: Cam; pose: RigPose; frame: number; shadow?: number; style?: React.CSSProperties}> = ({
  cam,
  pose,
  frame,
  shadow = 1,
  style,
}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const [handle] = useState(() => (loaded ? null : delayRender('Loading Doubt rig layers')));
  const [ready, setReady] = useState(Boolean(loaded));
  const released = useRef(false);
  useLayoutEffect(() => {
    if (ready) return;
    loadAll()
      .then(() => setReady(true))
      .catch((e) => cancelRender(e));
  }, [ready]);
  useLayoutEffect(() => {
    if (!ready || !loaded || !ref.current) return;
    const ctx = ref.current.getContext('2d');
    if (!ctx) return;
    draw(ctx, loaded, cam, pose, frame, shadow);
    if (handle !== null && !released.current) {
      released.current = true;
      continueRender(handle);
    }
  });
  return <canvas ref={ref} width={WIDTH} height={HEIGHT} style={{position: 'absolute', left: 0, top: 0, width: WIDTH, height: HEIGHT, ...style}} />;
};
