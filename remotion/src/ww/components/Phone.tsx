import React from 'react';
import {C} from '../constants';

// Neutral front-facing phone (no brand cues). Geometry is the R4 master size; scenes scale it down.
export const PHONE = {cx: 540, cy: 1062, w: 600, h: 1236, r: 96, bezel: 18};
export const SCREEN = {w: PHONE.w - PHONE.bezel * 2, h: PHONE.h - PHONE.bezel * 2, r: 80};

export const Phone: React.FC<{
  cx: number;
  cy: number;
  scale: number;
  rot?: number;
  screenBg: string;
  shadow?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({cx, cy, scale, rot = 0, screenBg, shadow = 1, style, children}) => (
  <div
    style={{
      position: 'absolute',
      left: cx - PHONE.w / 2,
      top: cy - PHONE.h / 2,
      width: PHONE.w,
      height: PHONE.h,
      transform: `rotate(${rot}deg) scale(${scale})`,
      ...style,
    }}
  >
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: PHONE.r,
        background: '#0B0B0B',
        boxShadow: `0 0 0 3px #2A2A2A inset, ${34 * shadow}px ${30 * shadow}px ${70 * shadow}px rgba(0,0,0,${0.2 * shadow})`,
      }}
    />
    <div
      style={{
        position: 'absolute',
        left: PHONE.bezel,
        top: PHONE.bezel,
        width: SCREEN.w,
        height: SCREEN.h,
        borderRadius: SCREEN.r,
        overflow: 'hidden',
        background: screenBg,
        isolation: 'isolate',
      }}
    >
      {children}
      {/* sensor island */}
      <div style={{position: 'absolute', top: 22, left: '50%', width: 150, height: 40, marginLeft: -75, borderRadius: 20, background: C.black}} />
    </div>
  </div>
);

/** Original bookmark shape: rounded top, notched base. */
export const Bookmark: React.FC<{size: number; color: string; style?: React.CSSProperties}> = ({size, color, style}) => (
  <svg width={size} height={size * 1.3} viewBox="0 0 100 130" style={style}>
    <path d="M10 14 Q10 0 24 0 H76 Q90 0 90 14 V122 Q90 130 82 125 L50 100 L18 125 Q10 130 10 122 Z" fill={color} />
  </svg>
);
