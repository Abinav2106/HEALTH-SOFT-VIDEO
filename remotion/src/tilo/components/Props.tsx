import React from 'react';
import {CARD, COLORS, FONT_CARD} from '../constants';
import {GoldenSpark, sparkPath} from './GoldenSpark';

const O = COLORS.navy;

/** Small decorative sparkle in the same four-point shape as the golden spark; `t` pops it in, `fade` out. */
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
  return (
    <g id={id} transform={`translate(${x} ${y}) rotate(${rotate})`} opacity={1 - fade}>
      <path d={sparkPath(size * 2 * t)} fill={COLORS.gold} stroke={O} strokeWidth={2.2} strokeLinejoin="round" />
    </g>
  );
};

/** Three tiny gold particles thrown out from the spark at the moment of contact. */
export const Particles: React.FC<{x: number; y: number; t: number}> = ({x, y, t}) => {
  if (t <= 0 || t >= 1) return null;
  const travel = 1 - Math.pow(1 - t, 3);
  return (
    <g id="contact-particles" transform={`translate(${x} ${y})`} opacity={1 - t * t}>
      {[-62, 18, 152].map((a, i) => {
        const r = (a * Math.PI) / 180;
        const dist = 26 + 22 * travel + i * 3;
        return (
          <circle
            key={a}
            cx={Math.cos(r) * dist}
            cy={Math.sin(r) * dist}
            r={3.6 * (1 - 0.4 * t)}
            fill={COLORS.gold}
            stroke={O}
            strokeWidth={1.4}
          />
        );
      })}
    </g>
  );
};

/** Glint: three short rays plus a tiny sparkle, used for the first "something golden ahead". */
export const Glint: React.FC<{x: number; y: number; t: number; fade: number; r?: number; id?: string}> = ({x, y, t, fade, r = 16, id = 'glint'}) => {
  if (t <= 0 || fade >= 1) return null;
  const len = (r > 20 ? 12 : 9) * t;
  return (
    <g id={id} transform={`translate(${x} ${y})`} opacity={1 - fade}>
      {[-50, 0, 50].map((a) => (
        <line
          key={a}
          x1={0}
          y1={-r}
          x2={0}
          y2={-r - len}
          stroke={COLORS.goldDeep}
          strokeWidth={3.2}
          strokeLinecap="round"
          transform={`rotate(${a})`}
        />
      ))}
      {r <= 20 ? <Sparkle x={0} y={0} size={8} t={t} /> : null}
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
        <GoldenSpark x={-w / 2 + 66} y={0} size={56} halo={0.7} outline={2.4} id="reward-card-spark" />
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
