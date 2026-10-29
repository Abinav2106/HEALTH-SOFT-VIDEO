import React from 'react';
import {staticFile} from 'remotion';
import {ASSETS} from '../constants';

// One gift box as separate vector layers sharing one geometry — interior, card, body walls, ribbon,
// lid and bow — so the closed and the open box are the same box at the same scale, position and
// perspective. Nothing is a deformed photo: the lid moves rigidly and the card slides up inside the
// box, hidden by the front walls until it clears the rim. The Amazon card is the supplied artwork.

// Box geometry in local px: front face is W×H with its top-left at (0, 0); D is the depth vector.
const W = 430;
const H = 300;
const D = {x: 140, y: -80};
const LID = {over: 14, h: 72, sink: 10}; // overhang, band height, overlap onto the walls
const RIB = 64; // ribbon width
const CARD = {w: 336, h: 212}; // card artwork 909x573 → same ID-1 proportions

const G = {
  side: '#D79A2C', // inner side wall seen through the opening
  interior: '#A8731F',
  innerWall: '#C98E2E',
  lidFront: '#F7C752', // bow knot
  lidSide: '#DB9F35',
  ribbon: '#FFE6A3',
  ribbonShade: '#EFC86A',
  edge: '#C4862A',
  shadow: 'rgba(2, 10, 24, 0.45)',
};

const pts = (p: number[][]) => p.map(([x, y]) => `${x},${y}`).join(' ');
const side = (x0: number, y0: number, h: number, s0: number, s1: number) =>
  pts([
    [x0 + D.x * s0, y0 + D.y * s0],
    [x0 + D.x * s1, y0 + D.y * s1],
    [x0 + D.x * s1, y0 + h + D.y * s1],
    [x0 + D.x * s0, y0 + h + D.y * s0],
  ]);

type Props = {
  lid: number; // 0 closed → 1 lifted clear
  card: number; // 0 inside the box → 1 risen
  cardOpacity?: number;
};

/** Size of the drawing's viewBox and the point that sits on the floor (for placement). */
export const GIFT_BOX = {left: -60, top: -420, width: W + D.x + 120, height: H + 520};

export const GiftBox: React.FC<Props> = ({lid, card, cardOpacity = 1}) => {
  const lidY = -LID.h + LID.sink;
  const lidDx = 26 * lid;
  const lidDy = -270 * lid;
  const lidRot = 9 * lid;
  // Card plane sits mid-depth; its top starts below the front rim (hidden) and rises clear.
  const cx = W / 2 + D.x * 0.5;
  const cardTop = 26 - 236 * card;
  const opening = pts([
    [0, 0],
    [W, 0],
    [W + D.x, D.y],
    [D.x, D.y],
  ]);

  return (
    <svg
      viewBox={`${GIFT_BOX.left} ${GIFT_BOX.top} ${GIFT_BOX.width} ${GIFT_BOX.height}`}
      width={GIFT_BOX.width}
      height={GIFT_BOX.height}
      style={{overflow: 'visible'}}
    >
      <defs>
        {/* restrained depth: each face a gentle two-stop gradient of the same gold */}
        <linearGradient id="gf-front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F9CC5C" />
          <stop offset="1" stopColor="#E8AC3B" />
        </linearGradient>
        <linearGradient id="gf-side" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E0A436" />
          <stop offset="1" stopColor="#C68724" />
        </linearGradient>
        <linearGradient id="gf-lidtop" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#FCE193" />
          <stop offset="1" stopColor="#F4C95E" />
        </linearGradient>
        <linearGradient id="gf-lidfront" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FAD368" />
          <stop offset="1" stopColor="#EDB646" />
        </linearGradient>
        <linearGradient id="gf-ribbon" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFF0C4" />
          <stop offset="1" stopColor="#F6D687" />
        </linearGradient>
        <clipPath id="gf-box-opening">
          <polygon points={opening} />
        </clipPath>
      </defs>
      {/* floor shadow */}
      <ellipse cx={(W + D.x) / 2} cy={H + D.y / 2 + 6} rx={(W + D.x) * 0.58} ry={46} fill={G.shadow} />

      {/* interior — only ever seen through the opening once the lid lifts */}
      <polygon points={opening} fill={G.interior} />
      <g clipPath="url(#gf-box-opening)">
        <polygon points={pts([[D.x, D.y], [W + D.x, D.y], [W + D.x, D.y + 90], [D.x, D.y + 90]])} fill={G.innerWall} />
        <polygon points={pts([[W + D.x, D.y], [W + D.x, D.y + 90], [W, 90], [W, 0]])} fill={G.side} opacity={0.6} />
      </g>

      {/* the gift card, sliding up inside the box */}
      <g opacity={cardOpacity}>
        <g transform={`translate(${cx} ${cardTop + CARD.h / 2}) rotate(-4)`}>
          <image href={staticFile(ASSETS.giftCard)} x={-CARD.w / 2} y={-CARD.h / 2} width={CARD.w} height={CARD.h} />
        </g>
      </g>

      {/* body walls (drawn over the card) */}
      <rect x={0} y={0} width={W} height={H} fill="url(#gf-front)" />
      <polygon points={side(W, 0, H, 0, 1)} fill="url(#gf-side)" />
      {/* ribbon: front band and side band */}
      <rect x={W / 2 - RIB / 2} y={0} width={RIB} height={H} fill="url(#gf-ribbon)" />
      <rect x={W / 2 + RIB / 2 - 8} y={0} width={8} height={H} fill={G.ribbonShade} />
      <polygon points={side(W, 0, H, 0.42, 0.58)} fill={G.ribbonShade} />
      <polyline points={pts([[0, 0], [W, 0], [W + D.x, D.y], [W + D.x, H + D.y], [W, H], [0, H], [0, 0]])} fill="none" stroke={G.edge} strokeWidth={2} />
      <line x1={W} y1={0} x2={W} y2={H} stroke={G.edge} strokeWidth={2} />
      <line x1={2} y1={3} x2={W - 2} y2={3} stroke="#FFE7A0" strokeWidth={3} />

      {/* lid: one rigid group — lifts, drifts and tips back, never deforms */}
      <g transform={`translate(${lidDx} ${lidDy}) rotate(${lidRot} ${W + D.x} ${lidY + D.y})`}>
        <rect x={-LID.over} y={lidY} width={W + LID.over * 2} height={LID.h} fill="url(#gf-lidfront)" />
        <polygon points={side(W + LID.over, lidY, LID.h, 0, 1)} fill={G.lidSide} />
        <polygon
          points={pts([
            [-LID.over, lidY],
            [W + LID.over, lidY],
            [W + LID.over + D.x, lidY + D.y],
            [-LID.over + D.x, lidY + D.y],
          ])}
          fill="url(#gf-lidtop)"
        />
        {/* ribbon over the lid: front, top (both directions) and side */}
        <rect x={W / 2 - RIB / 2} y={lidY} width={RIB} height={LID.h} fill={G.ribbon} />
        <polygon
          points={pts([
            [W / 2 - RIB / 2, lidY],
            [W / 2 + RIB / 2, lidY],
            [W / 2 + RIB / 2 + D.x, lidY + D.y],
            [W / 2 - RIB / 2 + D.x, lidY + D.y],
          ])}
          fill={G.ribbon}
        />
        <polygon
          points={pts([
            [-LID.over + D.x * 0.42, lidY + D.y * 0.42],
            [W + LID.over + D.x * 0.42, lidY + D.y * 0.42],
            [W + LID.over + D.x * 0.58, lidY + D.y * 0.58],
            [-LID.over + D.x * 0.58, lidY + D.y * 0.58],
          ])}
          fill={G.ribbon}
        />
        <polygon points={side(W + LID.over, lidY, LID.h, 0.42, 0.58)} fill={G.ribbonShade} />
        <polyline
          points={pts([
            [-LID.over, lidY + LID.h],
            [-LID.over, lidY],
            [-LID.over + D.x, lidY + D.y],
            [W + LID.over + D.x, lidY + D.y],
            [W + LID.over + D.x, lidY + LID.h + D.y],
            [W + LID.over, lidY + LID.h],
            [-LID.over, lidY + LID.h],
          ])}
          fill="none"
          stroke={G.edge}
          strokeWidth={2}
        />
        <line x1={W + LID.over} y1={lidY} x2={W + LID.over} y2={lidY + LID.h} stroke={G.edge} strokeWidth={2} />
        <line x1={-LID.over} y1={lidY} x2={W + LID.over} y2={lidY} stroke={G.edge} strokeWidth={2} />
        {/* bow, centred on the lid top */}
        <g transform={`translate(${W / 2 + D.x / 2} ${lidY + D.y / 2})`}>
          <path d="M0 0 C -40 -70 -130 -70 -120 -18 C -112 18 -40 14 0 0Z" fill={G.ribbon} stroke={G.ribbonShade} strokeWidth={4} />
          <path d="M0 0 C 40 -70 130 -70 120 -18 C 112 18 40 14 0 0Z" fill={G.ribbon} stroke={G.ribbonShade} strokeWidth={4} />
          <path d="M-6 4 L -46 62 L -24 58 L -14 76 L 2 10Z" fill={G.ribbonShade} />
          <path d="M6 4 L 46 62 L 24 58 L 14 76 L -2 10Z" fill={G.ribbonShade} />
          <ellipse cx={0} cy={0} rx={22} ry={18} fill={G.lidFront} stroke={G.ribbonShade} strokeWidth={4} />
        </g>
      </g>
    </svg>
  );
};
