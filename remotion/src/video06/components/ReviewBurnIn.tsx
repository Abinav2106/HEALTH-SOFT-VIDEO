import React from 'react';
import {useCurrentFrame} from 'remotion';
import {FONT_SANS, FPS} from '../constants';

const tc = (f: number) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  const s = Math.floor(f / FPS);
  return `00:${pad(Math.floor(s / 60))}:${pad(s % 60)}:${pad(f % FPS)}`;
};

// Review-only overlay. Disabled for the final master.
export const ReviewBurnIn: React.FC = () => {
  const frame = useCurrentFrame();
  const pill: React.CSSProperties = {
    position: 'absolute',
    top: 36,
    padding: '8px 14px',
    borderRadius: 8,
    background: 'rgba(0,0,0,0.55)',
    color: 'rgba(255,255,255,0.9)',
    fontFamily: FONT_SANS,
    fontSize: 20,
    fontWeight: 500,
    letterSpacing: '0.06em',
    fontVariantNumeric: 'tabular-nums',
  };
  return (
    <>
      <div style={{...pill, left: 36}}>HEALTHSOFT V06 · REVIEW PREVIEW · NOT FOR RELEASE</div>
      <div style={{...pill, right: 36}}>
        {tc(frame)} · f{frame}
      </div>
    </>
  );
};
