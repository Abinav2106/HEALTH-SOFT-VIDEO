import React from 'react';
import {useCurrentFrame} from 'remotion';
import {EASE_IN, EASE_OUT, progress} from '../lib/motion';

export type MaskedLine = {text: React.ReactNode; style?: React.CSSProperties};

// Line-by-line mask reveal. Each line rises inside its own clip box, then holds perfectly still
// until `outAt`, when it exits upward through the same mask. No drift while the copy is on screen.
export const MaskedLines: React.FC<{
  lines: MaskedLine[];
  inAt: number;
  outAt?: number;
  stagger?: number;
  dur?: number;
  outDur?: number;
  style?: React.CSSProperties;
  align?: 'left' | 'center';
}> = ({lines, inAt, outAt, stagger = 5, dur = 14, outDur = 7, style, align = 'left'}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: align === 'center' ? 'center' : 'flex-start', ...style}}>
      {lines.map((line, i) => {
        const pin = progress(frame, inAt + i * stagger, dur, EASE_OUT);
        const pout = outAt === undefined ? 0 : progress(frame, outAt + i * 2, outDur, EASE_IN);
        const y = (1 - pin) * 105 - pout * 105;
        return (
          // Padding gives italic overhang and descenders room inside the mask.
          <div key={i} style={{overflow: 'hidden', padding: '0.06em 0.16em 0.16em 0.02em', margin: '-0.06em -0.16em -0.16em -0.02em'}}>
            <div style={{transform: `translateY(${y}%)`, whiteSpace: 'nowrap', ...line.style}}>{line.text}</div>
          </div>
        );
      })}
    </div>
  );
};
