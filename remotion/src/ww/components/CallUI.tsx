import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, COPY, FONT, FPS} from '../constants';

// Minimal call furniture in W&W style (R2's composition keeps a label at the top and two controls
// at the bottom; no social-media chrome, status bar or recording interface).

export const IncomingChip: React.FC<{opacity: number; ring: number}> = ({opacity, ring}) => (
  <div
    style={{
      position: 'absolute',
      top: 128,
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      padding: '16px 30px 16px 24px',
      borderRadius: 999,
      background: C.white,
      boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
      fontFamily: FONT,
      fontWeight: 500,
      fontSize: 34,
      letterSpacing: -0.2,
      color: C.black,
      opacity,
      whiteSpace: 'nowrap',
    }}
  >
    <span style={{position: 'relative', width: 18, height: 18}}>
      <span style={{position: 'absolute', inset: 0, borderRadius: '50%', background: C.orange}} />
      <span
        style={{
          position: 'absolute',
          inset: -12 * ring,
          borderRadius: '50%',
          border: `3px solid ${C.orange}`,
          opacity: 1 - ring,
        }}
      />
    </span>
    {COPY.incoming}
  </div>
);

const Mic: React.FC = () => (
  <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke={C.black} strokeWidth="2" strokeLinecap="round">
    <rect x="9" y="3" width="6" height="11" rx="3" fill={C.black} />
    <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" />
  </svg>
);

const Close: React.FC = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" stroke={C.white} strokeWidth="2.6" strokeLinecap="round">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

const circle = (bg: string): React.CSSProperties => ({
  width: 128,
  height: 128,
  borderRadius: '50%',
  background: bg,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 8px 22px rgba(0,0,0,0.10)',
});

/** Connecting spinner, then mic + end controls (R2 3.0 s → 4.0 s). */
export const CallControls: React.FC<{connectAt: number; opacity: number}> = ({connectAt, opacity}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const connecting = t < connectAt;
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 250,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        gap: 72,
        opacity,
      }}
    >
      {connecting ? (
        <div style={circle(C.white)}>
          <svg width="56" height="56" viewBox="0 0 24 24" style={{transform: `rotate(${frame * 18}deg)`}}>
            <path d="M12 3a9 9 0 1 1-8.5 6" fill="none" stroke={C.black} strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </div>
      ) : (
        <>
          <div style={circle(C.white)}>
            <Mic />
          </div>
          <div style={circle(C.orange)}>
            <Close />
          </div>
        </>
      )}
    </div>
  );
};
