import React from 'react';
import {Easing, interpolate} from 'remotion';
import {FONT_UI} from '../lib/fonts';
import {useConfig, useT} from '../lib/timeline';
import {useMarkerScreen} from './DestinationMarker';

// Compact native-style toast above the marker: ~8 px rise and a short fade.

export const DestinationToast: React.FC = () => {
  const config = useConfig();
  const t = useT();
  const m = useMarkerScreen();
  const {toastIn, toastOut} = config.timing;
  if (t < toastIn || t > toastOut + 10) return null;
  const enter = interpolate(t, [toastIn, toastIn + 8], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const exit = interpolate(t, [toastOut, toastOut + 8], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const H = 72;
  const top = Math.max(250, m.y - m.size * 0.5 - 40 - H - 18);
  return (
    <div
      style={{
        position: 'absolute',
        left: m.x,
        top: top + (1 - enter) * 8,
        transform: 'translateX(-50%)',
        opacity: enter * exit,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          height: H,
          padding: '0 34px',
          borderRadius: 22,
          background: config.colors.white,
          border: `3px solid ${config.colors.turquoise}`,
          boxShadow: '0 6px 18px rgba(5,5,6,0.12)',
          display: 'flex',
          alignItems: 'center',
          fontFamily: FONT_UI,
          fontWeight: 700,
          fontSize: 30,
          letterSpacing: '0.06em',
          color: config.colors.ink,
          whiteSpace: 'nowrap',
        }}
      >
        {config.copy.toast}
      </div>
      <svg width={30} height={16} style={{marginTop: -3}}>
        <polygon points="0,0 30,0 15,15" fill={config.colors.white} />
        <polyline points="0,1.5 15,15 30,1.5" fill="none" stroke={config.colors.turquoise} strokeWidth={3} />
      </svg>
    </div>
  );
};
