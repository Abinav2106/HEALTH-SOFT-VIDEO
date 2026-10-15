import React from 'react';
import {Img, staticFile} from 'remotion';
import {ASSET, C} from '../constants';
import metrics from '../assetMetrics.json';

const LOGO_RATIO = metrics.logo.w / metrics.logo.h;
const Q_RATIO = metrics.qmark.w / metrics.qmark.h;

const maskStyle = (src: string, color: string): React.CSSProperties => ({
  backgroundColor: color,
  WebkitMaskImage: `url(${staticFile(src)})`,
  maskImage: `url(${staticFile(src)})`,
  WebkitMaskSize: '100% 100%',
  maskSize: '100% 100%',
  WebkitMaskRepeat: 'no-repeat',
  maskRepeat: 'no-repeat',
});

/** Official W&W wordmark: the supplied file as an alpha mask. Proportions locked to the source. */
export const Logo: React.FC<{width: number; color?: string; style?: React.CSSProperties}> = ({
  width,
  color = C.black,
  style,
}) => <div style={{width, height: width / LOGO_RATIO, ...maskStyle(ASSET.logoMask, color), ...style}} />;

/** Flat silhouette of Doubt's own question mark (from the approved render). Sized by height. */
export const QMark: React.FC<{height: number; color?: string; style?: React.CSSProperties}> = ({
  height,
  color = C.black,
  style,
}) => <div style={{width: height * Q_RATIO, height, ...maskStyle(ASSET.qmarkMask, color), ...style}} />;

export const qmarkWidth = (height: number) => height * Q_RATIO;

/** Doubt's approved right forearm + hand (2D cutout of the neutral render; provisional until a rig render exists).
 *  Anchor = fingertip (bottom-centre of the cutout). Rotation 0 = hanging down; 180 = reaching up. */
export const Hand: React.FC<{x: number; y: number; scale: number; rotate: number; style?: React.CSSProperties}> = ({
  x,
  y,
  scale,
  rotate,
  style,
}) => {
  const w = metrics.hand.w * scale;
  const h = metrics.hand.h * scale;
  return (
    <Img
      src={staticFile(ASSET.hand)}
      style={{
        position: 'absolute',
        left: x - w / 2,
        top: y - h,
        width: w,
        height: h,
        transformOrigin: '50% 100%',
        transform: `rotate(${rotate}deg)`,
        ...style,
      }}
    />
  );
};
