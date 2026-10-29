import React from 'react';
import {getLength} from '@remotion/paths';
import {C} from '../constants';

// A flat stroke drawn on with a trim (dash offset), like an After Effects trim path.
type Props = {
  d: string;
  start?: number; // 0–1
  end: number; // 0–1
  width?: number;
  color?: string;
  opacity?: number;
};

export const Trim: React.FC<Props> = ({d, start = 0, end, width = 6, color = C.blue, opacity = 1}) => {
  const len = getLength(d);
  const a = Math.max(0, Math.min(start, end)) * len;
  const b = Math.max(0, end) * len;
  if (b - a < 0.5) return null;
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={`0 ${a} ${b - a} ${len + 10}`}
      opacity={opacity}
    />
  );
};

/** Full-frame SVG canvas in composition px. */
export const Canvas: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0, overflow: 'visible', ...style}}>
    {children}
  </svg>
);
