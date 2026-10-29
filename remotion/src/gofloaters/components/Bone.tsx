import React from 'react';
import {C} from '../constants';

// The golden Spark Bone: one flat shape in the campaign yellow. Optional rays and one glint.
type Props = {
  cx: number;
  cy: number;
  width: number;
  rotate?: number;
  opacity?: number;
  rays?: number; // 0–1 draw-on of the three short spark rays
  glint?: number; // 0–1–0 brief warm flash
};

export const BONE_RATIO = 0.42; // height / width

export const Bone: React.FC<Props> = ({cx, cy, width, rotate = 0, opacity = 1, rays = 0, glint = 0}) => {
  const h = width * BONE_RATIO;
  const pad = width * 0.5;
  const rayLen = 26; // in the bone's 200-unit design space
  return (
    <svg
      width={width + pad * 2}
      height={h + pad * 2}
      style={{position: 'absolute', left: cx - width / 2 - pad, top: cy - h / 2 - pad, transform: `rotate(${rotate}deg)`, opacity, overflow: 'visible'}}
    >
      <g transform={`translate(${pad} ${pad}) scale(${width / 200})`}>
      <g fill={C.yellow}>
        <circle cx={26} cy={22} r={22} />
        <circle cx={26} cy={62} r={22} />
        <circle cx={174} cy={22} r={22} />
        <circle cx={174} cy={62} r={22} />
        <rect x={26} y={20} width={148} height={44} rx={6} />
      </g>
      {glint > 0 && (
        <g opacity={glint}>
          <g fill={C.white} opacity={0.55}>
            <circle cx={26} cy={22} r={22} />
            <circle cx={26} cy={62} r={22} />
            <circle cx={174} cy={22} r={22} />
            <circle cx={174} cy={62} r={22} />
            <rect x={26} y={20} width={148} height={44} rx={6} />
          </g>
          <path
            transform={`translate(176 -6) scale(${0.6 + glint * 0.6})`}
            d="M0 -30 C3 -8 8 -3 30 0 C8 3 3 8 0 30 C-3 8 -8 3 -30 0 C-8 -3 -3 -8 0 -30Z"
            fill={C.white}
          />
        </g>
      )}
      {rays > 0 && (
        <g stroke={C.yellow} strokeWidth={7} strokeLinecap="round" fill="none">
          {[
            [100, -14, 100, -14 - rayLen],
            [62, -8, 46, -8 - rayLen * 0.8],
            [138, -8, 154, -8 - rayLen * 0.8],
          ].map(([x1, y1, x2, y2], i) => {
            const t = Math.min(1, Math.max(0, rays * 1.6 - i * 0.3));
            return <line key={i} x1={x1} y1={y1} x2={x1 + (x2 - x1) * t} y2={y1 + (y2 - y1) * t} opacity={t > 0 ? 1 : 0} />;
          })}
        </g>
      )}
      </g>
    </svg>
  );
};
