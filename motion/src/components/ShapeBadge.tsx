import {Circle, Rect, Star, Triangle} from '@remotion/shapes';
import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, springIn} from '../lib/animation';

export type ShapeKind = 'circle' | 'triangle' | 'star' | 'square';

type Props = {
  readonly kind: ShapeKind;
  readonly color: string;
  /** Badge diameter in px. */
  readonly size: number;
  readonly delay?: number;
};

/** A vector shape (from @remotion/shapes) that pops in on a spring inside a soft glow. */
export const ShapeBadge: React.FC<Props> = ({kind, color, size, delay = 0}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = springIn(frame, fps, delay, {damping: 11, stiffness: 140});
  const s = size * 0.5;
  const shape = (() => {
    switch (kind) {
      case 'circle':
        return <Circle radius={s * 0.48} fill={color} />;
      case 'triangle':
        return <Triangle length={s * 1.25} direction="up" cornerRadius={s * 0.12} fill={color} />;
      case 'star':
        return <Star points={5} innerRadius={s * 0.28} outerRadius={s * 0.58} edgeRoundness={0.3} fill={color} />;
      case 'square':
        return <Rect width={s} height={s} cornerRadius={s * 0.22} fill={color} />;
    }
  })();

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `radial-gradient(circle, ${color}33 0%, ${color}0A 65%, transparent 70%)`,
        border: `2px solid ${color}55`,
        opacity: interpolate(pop, [0, 0.4], [0, 1], clamp),
        scale: interpolate(pop, [0, 1], [0.4, 1]),
        rotate: `${interpolate(pop, [0, 1], [-35, 0])}deg`,
      }}
    >
      {shape}
    </div>
  );
};
