import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {COLORS, FONT_SANS, HEIGHT, PRODUCTS, PRODUCT_PHOTO, ProductKey, WIDTH} from '../constants';
import {EASE_IN_OUT, lerp} from '../lib/motion';
import {MaskedLines} from './MaskedLines';

// The original photograph fills the 9:16 frame (its aspect is 941:1672 ≈ 9:16), scaled to cover.
const K = Math.max(WIDTH / PRODUCT_PHOTO.width, HEIGHT / PRODUCT_PHOTO.height);
const DW = PRODUCT_PHOTO.width * K;
const DH = PRODUCT_PHOTO.height * K;

type Focus = {cx: number; cy: number; rx: number; ry: number};
const ALL_SHARP: Focus = {cx: DW / 2, cy: DH / 2, rx: 2600, ry: 3600};

// Rack-focus ellipse per product, in displayed-photo coordinates, from the measured source bounds.
const focusFor = (k: ProductKey): Focus => {
  const [x0, y0, x1, y1] = PRODUCTS[k].box;
  return {cx: ((x0 + x1) / 2) * K, cy: ((y0 + y1) / 2) * K, rx: ((x1 - x0) / 2) * K * 1.32, ry: ((y1 - y0) / 2) * K * 1.32};
};

type Key = {f: number; z: number; tx: number; ty: number; focus: Focus; ease: 'move' | 'drift'};

// Camera keys: z is zoom over the cover fit; (tx,ty) is the point of the photo placed at frame centre.
// Pans stay inside the photo so the frame is always fully covered (no invented edges).
const clampCam = (z: number, tx: number, ty: number) => {
  const hw = WIDTH / 2 / z;
  const hh = HEIGHT / 2 / z;
  return {tx: Math.min(Math.max(tx, hw), DW - hw), ty: Math.min(Math.max(ty, hh), DH - hh)};
};
const key = (f: number, z: number, k: ProductKey | null, ease: Key['ease']): Key => {
  const focus = k ? focusFor(k) : ALL_SHARP;
  const {tx, ty} = clampCam(z, k ? focus.cx : DW / 2, k ? focus.cy : DH / 2);
  return {f, z, tx, ty, focus, ease};
};

const KEYS: Key[] = [
  key(388, 1.0, null, 'drift'), // lands from the screen push: all three options, all sharp
  key(392, 1.0, null, 'move'),
  key(406, 1.06, 'guardRail', 'drift'), // "safety" (VO ~17.0 s)
  key(432, 1.08, 'guardRail', 'move'),
  key(448, 1.06, 'healthGuard', 'drift'), // "health" (VO ~19.0 s)
  key(480, 1.08, 'healthGuard', 'move'),
  key(496, 1.06, 'keeper', 'drift'), // "or medication" (VO ~20.9 s)
  key(540, 1.09, 'keeper', 'drift'),
];

const sample = (frame: number) => {
  if (frame <= KEYS[0].f) return KEYS[0];
  for (let i = 0; i < KEYS.length - 1; i++) {
    const a = KEYS[i];
    const b = KEYS[i + 1];
    if (frame <= b.f) {
      const raw = (frame - a.f) / (b.f - a.f);
      const t = a.ease === 'move' ? EASE_IN_OUT(raw) : raw;
      return {
        z: lerp(a.z, b.z, t),
        tx: lerp(a.tx, b.tx, t),
        ty: lerp(a.ty, b.ty, t),
        focus: {
          cx: lerp(a.focus.cx, b.focus.cx, t),
          cy: lerp(a.focus.cy, b.focus.cy, t),
          rx: lerp(a.focus.rx, b.focus.rx, t),
          ry: lerp(a.focus.ry, b.focus.ry, t),
        },
      };
    }
  }
  return KEYS[KEYS.length - 1];
};

// Label block position (title-safe, bottom-left). Shared with the thread so they stay aligned.
export const LABEL = {x: 84, categoryTop: 1418, nameTop: 1522, lineY: 1606, lineLen: 96};

export const ProductStage: React.FC<{opacity?: number}> = ({opacity = 1}) => {
  const frame = useCurrentFrame();
  const cam = sample(frame);
  const {focus} = cam;
  const camTransform = `translate(${WIDTH / 2}px, ${HEIGHT / 2}px) scale(${cam.z}) translate(${-cam.tx}px, ${-cam.ty}px)`;
  const mask = `radial-gradient(${focus.rx}px ${focus.ry}px at ${focus.cx}px ${focus.cy}px, #000 58%, transparent 100%)`;
  const photo = staticFile(PRODUCT_PHOTO.src);

  return (
    <AbsoluteFill style={{background: COLORS.cream, overflow: 'hidden', opacity}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: DW, height: DH, transformOrigin: '0 0', transform: camTransform}}>
        {/* Out-of-focus plate: same photograph, softened. */}
        <Img src={photo} style={{position: 'absolute', inset: 0, width: DW, height: DH, filter: 'blur(9px) saturate(0.92) brightness(0.985)'}} />
        {/* In-focus plate, revealed through the moving focus ellipse. */}
        <Img src={photo} style={{position: 'absolute', inset: 0, width: DW, height: DH, WebkitMaskImage: mask, maskImage: mask}} />
      </div>
      {/* Keeps the label legible over whatever sits bottom-left; weighted away from the products. */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(1040px 700px at 0% 100%, rgba(252,246,239,0.97) 0%, rgba(252,246,239,0.90) 48%, rgba(252,246,239,0) 100%)`,
          opacity: Math.min(1, Math.max(0, (frame - 390) / 8)),
        }}
      />
      {(Object.keys(PRODUCTS) as ProductKey[]).map((k) => {
        const p = PRODUCTS[k];
        if (frame < p.labelIn - 1 || frame > p.labelOut + 12) return null;
        return (
          <MaskedLines
            key={k}
            inAt={p.labelIn}
            outAt={p.labelOut}
            stagger={5}
            dur={14}
            style={{left: LABEL.x, top: LABEL.categoryTop, fontFamily: FONT_SANS, color: COLORS.ink}}
            lines={[
              {text: p.category, style: {fontSize: 92, fontWeight: 600, letterSpacing: '-0.025em', lineHeight: 1.0}},
              {text: p.name, style: {fontSize: 46, fontWeight: 400, letterSpacing: '-0.005em', color: COLORS.inkSoft, lineHeight: 1.0, marginTop: 22}},
            ]}
          />
        );
      })}
    </AbsoluteFill>
  );
};
