import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COLORS, FONT_SANS, Quad} from '../constants';

// Stand-in for a stock shot that has not been approved yet. Deliberately reads as a slate, not as footage.
export const PendingPlate: React.FC<{role: string; description: string; device?: Quad; children?: React.ReactNode}> = ({
  role,
  description,
  device,
  children,
}) => {
  return (
    <AbsoluteFill style={{background: `radial-gradient(120% 80% at 50% 38%, ${COLORS.plateA} 0%, ${COLORS.plateB} 100%)`}}>
      <AbsoluteFill style={{border: '1px solid rgba(255,255,255,0.10)', margin: 28}} />
      {device ? <DeviceBezel quad={device} /> : null}
      {children}
      <div
        style={{
          position: 'absolute',
          top: 300,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: FONT_SANS,
          color: 'rgba(255,255,255,0.55)',
        }}
      >
        <div style={{fontSize: 22, fontWeight: 600, letterSpacing: '0.22em', color: COLORS.orange}}>STOCK PENDING · {role}</div>
        <div style={{fontSize: 30, fontWeight: 400, marginTop: 14}}>{description}</div>
        <div style={{fontSize: 20, fontWeight: 400, marginTop: 10, color: 'rgba(255,255,255,0.35)'}}>
          Real camera footage replaces this plate after approval
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Simple laptop silhouette around the placeholder screen corners, so the corner-pin can be judged in context.
const DeviceBezel: React.FC<{quad: Quad}> = ({quad}) => {
  const [tl, tr, br, bl] = quad;
  const grow = (p: [number, number], dx: number, dy: number): string => `${p[0] + dx},${p[1] + dy}`;
  const bezel = [grow(tl, -16, -16), grow(tr, 16, -16), grow(br, 16, 14), grow(bl, -16, 14)].join(' ');
  const base = [grow(bl, -16, 14), grow(br, 16, 14), grow(br, 70, 64), grow(bl, -70, 64)].join(' ');
  return (
    <svg width="100%" height="100%" style={{position: 'absolute', inset: 0}}>
      <polygon points={base} fill="#26292E" stroke="#3B3F46" strokeWidth={2} />
      <polygon points={bezel} fill="#0E0F11" stroke="#3B3F46" strokeWidth={2} />
    </svg>
  );
};
