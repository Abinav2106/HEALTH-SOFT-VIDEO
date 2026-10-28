import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COLORS, HEIGHT, T, WIDTH} from './constants';
import {FloorPlan} from './components/FloorPlan';
import {OriginalLogo, Tilo, Wordmark} from './components/Tilo';
import {loadFonts} from './lib/fonts';
import {cameraAt} from './lib/scene';

// Warm-white field with an extremely subtle paper grain (screen-fixed, static, so it never shimmers).
const Paper: React.FC = () => (
  <svg width={WIDTH} height={HEIGHT} style={{position: 'absolute', inset: 0}}>
    <filter id="gf-paper" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={11} stitchTiles="stitch" />
      <feColorMatrix type="matrix" values="0 0 0 0 0.42  0 0 0 0 0.36  0 0 0 0 0.26  0 0 0 1 0" />
    </filter>
    <filter id="gf-fibre" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.004 0.012" numOctaves={3} seed={3} />
      <feColorMatrix type="matrix" values="0 0 0 0 0.55  0 0 0 0 0.48  0 0 0 0 0.36  0 0 0 1.4 -0.45" />
    </filter>
    <rect width={WIDTH} height={HEIGHT} filter="url(#gf-paper)" opacity={0.045} />
    <rect width={WIDTH} height={HEIGHT} filter="url(#gf-fibre)" opacity={0.06} />
  </svg>
);

// GoFloaters — "The Flight Path Finds Your Space" (10 s, 1080x1920, 30 fps).
export const FlightPath: React.FC = () => {
  loadFonts();
  const frame = useCurrentFrame();

  if (frame >= T.lock) {
    return (
      <AbsoluteFill style={{background: COLORS.stage}}>
        <OriginalLogo />
      </AbsoluteFill>
    );
  }

  const camera = cameraAt(frame);
  return (
    <AbsoluteFill style={{background: COLORS.warmWhite}}>
      <Paper />
      <FloorPlan camera={camera} />
      <Wordmark />
      <Tilo camera={camera} />
    </AbsoluteFill>
  );
};
