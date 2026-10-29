import React from 'react';
import {Img, staticFile} from 'remotion';
import {ASSETS, C} from '../constants';
import {FLIGHT_RPS, SpinKey, constantSpin, spinAt} from '../lib/propeller';

// The supplied Tilo-and-aircraft artwork as one rig: the aircraft/dog layer and the propeller
// layer were split from the same source (alphas add back exactly), so there is no stationary
// propeller under the spinning one. The group moves and tilts as a whole; only the blades inside
// the propeller disc animate. Source space is 900x480; (AX, AY) is the anchor on the fuselage.
export const TILO_W = 900;
export const TILO_H = 480;
const AX = 0.56;
const AY = 0.74;
// Yellow propeller disc in source px (measured by extract_storyboard.py).
const PROP = {cx: 810.2, cy: 322.3, w: 43.8, h: 182.6};
const BLADE_W = PROP.w * 0.7;
const SAMPLES = 5; // motion-blur sub-samples across a half-frame shutter

type Props = {
  f: number; // composition frame (drives the spin)
  x: number;
  y: number;
  width: number;
  rotate?: number; // degrees, small — the whole aircraft group, never used to fake the spin
  opacity?: number;
  /** 0 = artwork with its own speed lines, 1 = the same artwork without them (at rest). */
  rest?: number;
  spin?: SpinKey[];
};

const Blades: React.FC<{f: number; spin: SpinKey[]}> = ({f, spin}) => {
  const {angle, rps} = spinAt(spin, f);
  const step = (rps / 30) * Math.PI * 2 * 0.5; // half-frame shutter
  const r = PROP.h / 2 - 6;
  // Faster spin → softer, more translucent blades (restrained blur); slow spin → crisper blades.
  const k = Math.min(1, rps / FLIGHT_RPS);
  // Per-sample opacity: the sub-samples overlap near the hub, so the blurred blade still reads.
  const alpha = (0.95 - 0.2 * k) / (1 + 2.2 * k);
  const blades: React.ReactNode[] = [];
  for (let s = 0; s < SAMPLES; s++) {
    const a = angle - (step * s) / (SAMPLES - 1);
    for (const phase of [0, Math.PI]) {
      // Side view: each blade projects to a vertical bar from the hub, length r·cos(φ).
      const len = r * Math.cos(a + phase);
      const top = len > 0 ? PROP.cy - len : PROP.cy;
      const hgt = Math.abs(len);
      blades.push(
        <g key={`${s}-${phase}`} opacity={alpha}>
          <rect x={PROP.cx - BLADE_W / 2} y={top} width={BLADE_W} height={hgt} rx={BLADE_W / 2} fill="#B87A0C" />
          <rect x={PROP.cx - BLADE_W * 0.12} y={top + 4} width={BLADE_W * 0.16} height={Math.max(0, hgt - 8)} rx={BLADE_W * 0.08} fill={C.white} opacity={0.55} />
        </g>,
      );
    }
  }
  return (
    <svg viewBox={`0 0 ${TILO_W} ${TILO_H}`} style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}>
      <defs>
        <clipPath id="tilo-prop-disc">
          <ellipse cx={PROP.cx} cy={PROP.cy} rx={PROP.w / 2 - 3} ry={PROP.h / 2 - 3} />
        </clipPath>
      </defs>
      <g clipPath="url(#tilo-prop-disc)">
        {blades}
      </g>
    </svg>
  );
};

export const Tilo: React.FC<Props> = ({f, x, y, width, rotate = 0, opacity = 1, rest = 0, spin = constantSpin(FLIGHT_RPS)}) => {
  const h = (width * TILO_H) / TILO_W;
  const fill: React.CSSProperties = {position: 'absolute', inset: 0, width: '100%', height: '100%'};
  return (
    <div
      style={{
        position: 'absolute',
        left: x - width * AX,
        top: y - h * AY,
        width,
        height: h,
        transform: `rotate(${rotate}deg)`,
        transformOrigin: `${AX * 100}% ${AY * 100}%`,
        opacity,
      }}
    >
      <Img src={staticFile(ASSETS.tiloBody)} style={{...fill, opacity: 1 - rest}} />
      {rest > 0 && <Img src={staticFile(ASSETS.tiloBodyNoLines)} style={{...fill, opacity: rest}} />}
      <Img src={staticFile(ASSETS.tiloProp)} style={fill} />
      <Blades f={f} spin={spin} />
    </div>
  );
};
