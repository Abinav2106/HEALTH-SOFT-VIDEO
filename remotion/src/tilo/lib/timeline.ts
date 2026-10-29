import {createContext, useContext} from 'react';
import {useCurrentFrame} from 'remotion';
import type {TiloConfig} from '../config';

// One global timeline for the whole film. Components read the master frame `t` from here
// instead of using <Sequence> offsets, so the world, camera and the reward sheet never reset
// at a shot boundary. The 2× review composition samples the same master at double rate.
export const ConfigContext = createContext<TiloConfig | null>(null);

export const useConfig = (): TiloConfig => {
  const c = useContext(ConfigContext);
  if (!c) throw new Error('Tilo components must be rendered inside <TiloRewardFlight>');
  return c;
};

/** Master-timeline frame (0–719), independent of the review playback speed. */
export const useT = (): number => {
  const frame = useCurrentFrame();
  return frame * useConfig().review.playbackSpeed;
};

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export const smoothstep = (a: number, b: number, v: number) => {
  const x = clamp01((v - a) / (b - a));
  return x * x * (3 - 2 * x);
};
