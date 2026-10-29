import React from 'react';
import {CARD, COLORS, FONT_CARD, STROKE} from '../constants';

const O = COLORS.navy;

export const BONE_PATH =
  'M -22 -5 L 22 -5 C 24 -15 38 -16 39 -7 C 46 -7 46 7 39 7 C 38 16 24 15 22 5 L -22 5 C -24 15 -38 16 -39 7 C -46 7 -46 -7 -39 -7 C -38 -16 -24 -15 -22 -5 Z';

/** The one collectible bone (also used, smaller, as the card icon). */
export const Bone: React.FC<{x: number; y: number; rotate?: number; scale?: number; id?: string; sw?: number}> = ({
  x,
  y,
  rotate = 0,
  scale = 1,
  id = 'bone',
  sw = STROKE.prop,
}) => (
  <g id={id} transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
    <path d={BONE_PATH} fill={COLORS.gold} stroke={O} strokeWidth={sw / scale} strokeLinejoin="round" />
    <path d="M -16 -1 L 14 -1" stroke={COLORS.white} strokeWidth={3 / scale} strokeLinecap="round" opacity={0.75} />
  </g>
);

/** Four-point sparkle; `t` 0→1 pops it in, `fade` takes it back out. */
export const Sparkle: React.FC<{x: number; y: number; size: number; t: number; fade?: number; rotate?: number; id?: string}> = ({
  x,
  y,
  size,
  t,
  fade = 0,
  rotate = 0,
  id,
}) => {
  if (t <= 0 || fade >= 1) return null;
  const s = size * t;
  const d = `M 0 ${-s} C ${s * 0.12} ${-s * 0.24} ${s * 0.24} ${-s * 0.12} ${s} 0 C ${s * 0.24} ${s * 0.12} ${s * 0.12} ${s * 0.24} 0 ${s} C ${-s * 0.12} ${s * 0.24} ${-s * 0.24} ${s * 0.12} ${-s} 0 C ${-s * 0.24} ${-s * 0.12} ${-s * 0.12} ${-s * 0.24} 0 ${-s} Z`;
  return (
    <g id={id} transform={`translate(${x} ${y}) rotate(${rotate})`} opacity={1 - fade}>
      <path d={d} fill={COLORS.gold} stroke={O} strokeWidth={2.4} strokeLinejoin="round" />
    </g>
  );
};

/** Glint: three short rays plus a tiny sparkle, used for the first "something golden ahead". */
export const Glint: React.FC<{x: number; y: number; t: number; fade: number}> = ({x, y, t, fade}) => {
  if (t <= 0 || fade >= 1) return null;
  const len = 9 * t;
  return (
    <g id="glint" transform={`translate(${x} ${y})`} opacity={1 - fade}>
      {[-50, 0, 50].map((a) => (
        <line
          key={a}
          x1={0}
          y1={-16}
          x2={0}
          y2={-16 - len}
          stroke={COLORS.goldDeep}
          strokeWidth={3.2}
          strokeLinecap="round"
          transform={`rotate(${a})`}
        />
      ))}
      <Sparkle x={0} y={0} size={9} t={t} />
    </g>
  );
};

export const Shadow: React.FC<{x: number; y: number; w: number; opacity: number}> = ({x, y, w, opacity}) =>
  opacity <= 0 ? null : <ellipse id="plane-shadow" cx={x} cy={y} rx={w / 2} ry={w * 0.07} fill={COLORS.shadow} opacity={opacity} />;

export const MotionStrokes: React.FC<{x: number; y: number; opacity: number; stretch: number}> = ({x, y, opacity, stretch}) =>
  opacity <= 0 ? null : (
    <g id="motion-strokes" opacity={opacity} stroke={COLORS.cyan} strokeWidth={6} strokeLinecap="round">
      <line x1={x - 40 * stretch} y1={y - 14} x2={x} y2={y - 14} />
      <line x1={x - 18 - 30 * stretch} y1={y + 14} x2={x - 18} y2={y + 14} />
    </g>
  );

/** Reward card: rises ~20 px, scales 88 % → 103 % → 100 %, then the check draws on. */
export const RewardCard: React.FC<{rise: number; scale: number; opacity: number; check: number}> = ({rise, scale, opacity, check}) => {
  if (opacity <= 0) return null;
  const {cx, cy, w, h, radius} = CARD;
  const checkLen = 36;
  return (
    <g id="reward-card" opacity={opacity} transform={`translate(${cx} ${cy + rise}) scale(${scale})`}>
      <rect x={-w / 2 + 2} y={-h / 2 + 10} width={w} height={h} rx={radius} fill={O} opacity={0.07} />
      <rect id="reward-card-panel" x={-w / 2} y={-h / 2} width={w} height={h} rx={radius} fill={COLORS.white} stroke={COLORS.cyan} strokeWidth={4} />
      <g id="reward-card-icon">
        <Bone x={-w / 2 + 66} y={0} rotate={-24} scale={0.86} id="reward-card-bone" sw={3.2} />
      </g>
      <text
        id="reward-card-text"
        x={-w / 2 + 122}
        y={1}
        dominantBaseline="middle"
        fontFamily={`'${FONT_CARD}', sans-serif`}
        fontWeight={700}
        fontSize={40}
        letterSpacing={-0.6}
        fill={O}
      >
        {CARD.text}
      </text>
      <g id="reward-card-check" transform={`translate(${w / 2 - 58} 0)`}>
        <circle r={27 * Math.min(1, check * 2.2)} fill={COLORS.cyan} />
        <path
          d="M -11 1 L -3 9 L 12 -8"
          fill="none"
          stroke={COLORS.white}
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={checkLen}
          strokeDashoffset={checkLen * (1 - Math.max(0, (check - 0.3) / 0.7))}
        />
      </g>
    </g>
  );
};
