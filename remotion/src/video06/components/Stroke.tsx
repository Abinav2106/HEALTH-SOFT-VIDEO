import React from 'react';
import {COLORS, HEIGHT, WIDTH} from '../constants';

type Pt = [number, number];

// The single orange connecting line. Points are in frame space so the same element can underline a
// word, carry through the product beats and turn the corner into the guidance spine.
export const Stroke: React.FC<{points: Pt[]; width?: number; opacity?: number}> = ({points, width = 6, opacity = 1}) => {
  if (opacity <= 0 || points.length < 2) return null;
  return (
    <svg width={WIDTH} height={HEIGHT} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      <polyline
        points={points.map(([x, y]) => `${x},${y}`).join(' ')}
        fill="none"
        stroke={COLORS.orange}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={opacity}
      />
    </svg>
  );
};

/** Sub-path of a polyline between arc lengths s0 and s1 (s0 ≤ s1). */
export const slicePath = (path: Pt[], s0: number, s1: number): Pt[] => {
  const out: Pt[] = [];
  let acc = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const [ax, ay] = path[i];
    const [bx, by] = path[i + 1];
    const len = Math.hypot(bx - ax, by - ay);
    const segStart = acc;
    const segEnd = acc + len;
    const a = Math.max(s0, segStart);
    const b = Math.min(s1, segEnd);
    if (b >= a && len > 0) {
      const at = (s: number): Pt => [ax + ((bx - ax) * (s - segStart)) / len, ay + ((by - ay) * (s - segStart)) / len];
      if (out.length === 0) out.push(at(a));
      out.push(at(b));
    }
    acc = segEnd;
  }
  return out;
};
