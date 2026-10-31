import React from 'react';
import {useCurrentFrame} from 'remotion';
import {EASE, progress} from '../lib/animation';

type Props = {
  readonly value: number;
  readonly delay?: number;
  readonly duration?: number;
  readonly decimals?: number;
  readonly suffix?: string;
  readonly style?: React.CSSProperties;
};

/** Counts up from 0 to `value`, easing out. Uses tabular figures so digits don't jitter. */
export const Counter: React.FC<Props> = ({value, delay = 0, duration = 30, decimals = 0, suffix = '', style}) => {
  const frame = useCurrentFrame();
  const shown = value * progress(frame, delay, duration, EASE.out);
  return (
    <span style={{fontVariantNumeric: 'tabular-nums', ...style}}>
      {shown.toFixed(decimals)}
      {suffix}
    </span>
  );
};
