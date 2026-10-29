import React from 'react';
import {C, FONT, MEDIUM} from '../constants';

// Working-preview marker for illustrative/stand-in material. Never rendered in the master.
export const Tag: React.FC<{text: string; x: number; y: number; dark?: boolean; opacity?: number}> = ({text, x, y, dark, opacity = 1}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      fontFamily: FONT,
      fontWeight: MEDIUM,
      fontSize: 26,
      letterSpacing: '0.01em',
      color: dark ? C.white : C.navy,
      opacity: 0.72 * opacity,
    }}
  >
    {text}
  </div>
);
