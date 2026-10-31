import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS} from '../theme/theme';

type Props = {
  readonly accent?: string;
  readonly secondary?: string;
  /** Drift speed multiplier for the light blobs. */
  readonly drift?: number;
};

/**
 * Deep gradient backdrop with two slowly drifting light blobs and a faint grid.
 * Continuous motion keeps static moments alive without distracting from the foreground.
 */
export const Background: React.FC<Props> = ({accent = COLORS.violet, secondary = COLORS.cyan, drift = 1}) => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const t = (frame / fps) * drift;
  const ax = 30 + 8 * Math.sin(t * 0.6);
  const ay = 35 + 6 * Math.cos(t * 0.5);
  const bx = 72 + 7 * Math.cos(t * 0.45);
  const by = 68 + 8 * Math.sin(t * 0.55);
  const grid = Math.round(Math.min(width, height) / 12);

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.ink}}>
      <AbsoluteFill
        style={{
          background: [
            `radial-gradient(circle at ${ax}% ${ay}%, ${accent}55 0%, transparent 42%)`,
            `radial-gradient(circle at ${bx}% ${by}%, ${secondary}40 0%, transparent 38%)`,
            `linear-gradient(160deg, ${COLORS.night} 0%, ${COLORS.ink} 70%)`,
          ].join(', '),
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${COLORS.text}0D 1px, transparent 1px), linear-gradient(90deg, ${COLORS.text}0D 1px, transparent 1px)`,
          backgroundSize: `${grid}px ${grid}px`,
          backgroundPosition: `${(-t * 6) % grid}px ${(-t * 4) % grid}px`,
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
        }}
      />
    </AbsoluteFill>
  );
};
