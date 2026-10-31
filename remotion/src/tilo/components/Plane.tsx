import React from 'react';
import {COLORS, PROJ, STROKE} from '../constants';

// Tilo's plane, side view facing right. Local frame: origin on the ground under the fuselage,
// SVG axes. Split into a back layer and a front layer so Tilo can sit *inside* the cockpit.

export const PLANE = {
  cockpit: {x: 22, y: -99, rx: 35, ry: 9},
  hub: {x: 132, y: -64},
  seat: {x: 20, y: -80}, // Tilo's pelvis when seated
  bladeLen: 48,
} as const;

export type PlaneState = {
  pitch: number; // degrees, nose-down positive
  roll: number; // −1…1, banking cue on the wings
  compress: number; // 0…1 landing-gear compression
  propAngle: number; // radians
  propBlur: number; // 0…1, how much the blades read as a spinning disc
};

const O = COLORS.navy;
const SW = STROKE.prop;

const FUSELAGE =
  'M -150 -72 C -110 -82 -50 -100 10 -101 C 70 -101 108 -92 118 -77 C 126 -62 120 -46 104 -40 C 60 -28 -40 -34 -100 -50 C -130 -58 -150 -62 -150 -72 Z';
const FIN = 'M -114 -80 C -124 -104 -142 -134 -133 -141 C -124 -147 -100 -118 -82 -92 Z';
const STAB_NEAR = 'M -108 -56 C -124 -44 -146 -32 -150 -25 C -153 -17 -141 -15 -129 -23 C -113 -33 -100 -45 -95 -51 Z';
const STAB_FAR = 'M -122 -74 C -112 -86 -98 -96 -91 -97 C -84 -97 -86 -89 -94 -83 Z';
const WING_NEAR = 'M 36 -46 C 18 -30 -14 -4 -42 12 C -56 20 -48 35 -31 29 C 4 13 48 -16 64 -40 Z';
const WING_FAR = 'M 58 -96 C 68 -112 82 -121 92 -123 C 101 -124 101 -115 93 -109 C 86 -103 80 -99 78 -96 Z';

const Wheel: React.FC<{x: number; y: number; r: number; top: number; id: string}> = ({x, y, r, top, id}) => (
  <g id={id}>
    <line x1={x - 4} y1={top} x2={x} y2={y} stroke={O} strokeWidth={6} strokeLinecap="round" />
    <circle cx={x} cy={y} r={r} fill={O} />
    <circle cx={x} cy={y} r={r * 0.42} fill={COLORS.metal} />
  </g>
);

/** Propeller blades in the Y–Z plane, drawn with the scene's oblique projection so the disc reads in 3/4. */
const Propeller: React.FC<{angle: number; blur: number}> = ({angle, blur}) => {
  const {x: hx, y: hy} = PLANE.hub;
  const L = PLANE.bladeLen;
  const disc: string[] = [];
  for (let i = 0; i <= 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    const px = hx + PROJ.kx * Math.sin(a) * L;
    const py = hy - Math.cos(a) * L - PROJ.ky * Math.sin(a) * L;
    disc.push(`${px.toFixed(2)},${py.toFixed(2)}`);
  }
  const blades = [0, Math.PI].map((off) => {
    const a = angle + off;
    const tip = {x: PROJ.kx * Math.sin(a) * L, y: -Math.cos(a) * L - PROJ.ky * Math.sin(a) * L};
    const len = Math.hypot(tip.x, tip.y);
    const ux = tip.x / len;
    const uy = tip.y / len;
    const w = 7.5;
    const nx = -uy * w;
    const ny = ux * w;
    // lens-shaped blade, wide at 60 % of its length
    return `M ${hx} ${hy} Q ${hx + tip.x * 0.6 + nx} ${hy + tip.y * 0.6 + ny} ${hx + tip.x} ${hy + tip.y} Q ${hx + tip.x * 0.6 - nx} ${hy + tip.y * 0.6 - ny} ${hx} ${hy} Z`;
  });
  return (
    <g id="plane-propeller">
      <polygon points={disc.join(' ')} fill={COLORS.gold} opacity={0.42 * blur} />
      <polygon points={disc.join(' ')} fill="none" stroke={O} strokeWidth={1.6} opacity={0.35 * blur} />
      <g opacity={1 - 0.55 * blur}>
        {blades.map((d, i) => (
          <path key={i} d={d} fill={COLORS.gold} stroke={O} strokeWidth={2.6} strokeLinejoin="round" />
        ))}
      </g>
    </g>
  );
};

export const Plane: React.FC<{state: PlaneState; layer: 'back' | 'front'}> = ({state, layer}) => {
  const c = state.compress * 5;
  const {cockpit: ck} = PLANE;
  // Region below the cockpit's front lip: the fuselage is repainted there so Tilo sits inside it.
  const lip = `M ${ck.x - ck.rx - 260} ${ck.y} L ${ck.x - ck.rx} ${ck.y} A ${ck.rx} ${ck.ry} 0 0 0 ${ck.x + ck.rx} ${ck.y} L ${ck.x + ck.rx + 260} ${ck.y} L ${ck.x + ck.rx + 260} 200 L ${ck.x - ck.rx - 260} 200 Z`;
  if (layer === 'back') {
    return (
      <g id="plane-back">
        <Wheel id="plane-wheel-far" x={58} y={-17} r={11} top={-38 + c} />
        <g transform={`translate(0 ${c})`}>
          <path id="plane-wing-far" d={WING_FAR} fill={COLORS.cyanDeep} stroke={O} strokeWidth={SW} strokeLinejoin="round" transform={`translate(0 ${-state.roll * 6})`} />
          <path id="plane-stabilizer-far" d={STAB_FAR} fill={COLORS.cyanDeep} stroke={O} strokeWidth={SW} strokeLinejoin="round" />
          <path id="plane-fin" d={FIN} fill={COLORS.cyan} stroke={O} strokeWidth={SW} strokeLinejoin="round" />
          <path id="plane-body" d={FUSELAGE} fill={COLORS.cyan} stroke={O} strokeWidth={SW} strokeLinejoin="round" />
          <g id="plane-cockpit-back">
            <ellipse cx={ck.x} cy={ck.y} rx={ck.rx + 4} ry={ck.ry + 4} fill={COLORS.gold} stroke={O} strokeWidth={SW} />
            <ellipse cx={ck.x} cy={ck.y} rx={ck.rx - 4} ry={ck.ry - 2.5} fill={O} />
          </g>
        </g>
      </g>
    );
  }
  return (
    <g id="plane-front">
      <g transform={`translate(0 ${c})`}>
        <defs>
          <clipPath id="plane-lip-clip">
            <path d={lip} />
          </clipPath>
        </defs>
        <g clipPath="url(#plane-lip-clip)">
          <path d={FUSELAGE} fill={COLORS.cyan} stroke={O} strokeWidth={SW} strokeLinejoin="round" />
        </g>
        {/* front half of the gold cockpit rim */}
        <path
          id="plane-cockpit-lip"
          d={`M ${ck.x - ck.rx - 4} ${ck.y} A ${ck.rx + 4} ${ck.ry + 4} 0 0 0 ${ck.x + ck.rx + 4} ${ck.y} L ${ck.x + ck.rx - 4} ${ck.y} A ${ck.rx - 4} ${ck.ry - 2.5} 0 0 1 ${ck.x - ck.rx + 4} ${ck.y} Z`}
          fill={COLORS.gold}
          stroke={O}
          strokeWidth={SW}
          strokeLinejoin="round"
        />
        <path d="M 98 -95 C 106 -78 106 -52 96 -38" stroke={O} strokeWidth={2.6} fill="none" strokeLinecap="round" />
        <path d="M -40 -76 l 26 -4 M -52 -70 l 12 -2" stroke={COLORS.white} strokeWidth={4} strokeLinecap="round" opacity={0.7} />
        <path id="plane-stabilizer-near" d={STAB_NEAR} fill={COLORS.cyan} stroke={O} strokeWidth={SW} strokeLinejoin="round" />
        <g transform={`rotate(${state.roll * 5} 50 -42)`}>
          <path id="plane-wing-near" d={WING_NEAR} fill={COLORS.cyan} stroke={O} strokeWidth={SW} strokeLinejoin="round" />
          <path d="M 30 -26 C 10 -10 -14 6 -30 16" stroke={O} strokeWidth={2.4} fill="none" strokeLinecap="round" opacity={0.55} />
        </g>
        <ellipse id="plane-spinner" cx={124} cy={-64} rx={9} ry={14} fill={COLORS.gold} stroke={O} strokeWidth={SW} />
      </g>
      <Wheel id="plane-wheel-near" x={44} y={-13} r={13} top={-36 + c} />
      <Wheel id="plane-wheel-rear" x={-86} y={-10} r={10} top={-46 + c} />
      <g transform={`translate(0 ${c})`}>
        <Propeller angle={state.propAngle} blur={state.propBlur} />
        <circle cx={PLANE.hub.x} cy={PLANE.hub.y} r={5} fill={COLORS.goldDeep} stroke={O} strokeWidth={2.6} />
      </g>
    </g>
  );
};
