import React from 'react';
import {useCurrentFrame} from 'remotion';
import {EASE, progress} from '../lib/animation';

type Props = {
  readonly width: number;
  readonly thickness?: number;
  readonly delay?: number;
  readonly duration?: number;
  readonly from?: string;
  readonly to?: string;
};

/** A gradient rule that draws on from the left. */
export const RevealLine: React.FC<Props> = ({width, thickness = 8, delay = 0, duration = 18, from = '#4FE3D3', to = '#8C6CFF'}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        width,
        height: thickness,
        borderRadius: thickness,
        background: `linear-gradient(90deg, ${from}, ${to})`,
        transformOrigin: 'left center',
        scale: `${progress(frame, delay, duration, EASE.out)} 1`,
      }}
    />
  );
};
