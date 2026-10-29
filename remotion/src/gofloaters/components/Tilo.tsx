import React from 'react';
import {Img, staticFile} from 'remotion';
import {ASSETS} from '../constants';

// The supplied Tilo-and-aircraft artwork as one rigid piece (dog and aircraft never separate).
// Only whole-artwork translation and rotation are applied; the image is never redrawn, mirrored or
// distorted. The source file is 900x480; (ax, ay) is the anchor on the fuselage under the dog.
export const TILO_W = 900;
export const TILO_H = 480;
const AX = 0.56;
const AY = 0.74;

type Props = {
  x: number; // anchor position in the parent's px
  y: number;
  width: number;
  rotate?: number; // degrees, kept small
  opacity?: number;
  /** 0 = with the artwork's own speed lines, 1 = the same artwork with its speed lines removed. */
  rest?: number;
};

export const Tilo: React.FC<Props> = ({x, y, width, rotate = 0, opacity = 1, rest = 0}) => {
  const h = (width * TILO_H) / TILO_W;
  const style: React.CSSProperties = {
    position: 'absolute',
    left: x - width * AX,
    top: y - h * AY,
    width,
    height: h,
    transform: `rotate(${rotate}deg)`,
    transformOrigin: `${AX * 100}% ${AY * 100}%`,
    opacity,
  };
  return (
    <div style={style}>
      <Img src={staticFile(ASSETS.tilo)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 1 - rest}} />
      {rest > 0 && <Img src={staticFile(ASSETS.tiloNoLines)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: rest}} />}
    </div>
  );
};
