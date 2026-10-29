import {Easing, interpolate} from 'remotion';
import {HEIGHT, type TiloConfig} from '../config';

// The reward sheet is ONE element on the global timeline: it rises to a partial reveal in
// shot 05 and continues from that exact position in shot 06 — never remounted or restarted.
// The camera reframe (FlightCamera) is driven by the same curve so Tilo always stays above it.

const OFFSCREEN = HEIGHT + 40;

export const sheetTopAt = (c: TiloConfig, t: number): number => {
  const {sheetRiseStart, sheetSlideFrames} = c.timing;
  const s06 = c.shots.s06[0];
  if (t < sheetRiseStart) return OFFSCREEN;
  if (t < s06) {
    return interpolate(t, [sheetRiseStart, s06], [OFFSCREEN, c.ui.sheetPartialTop], {
      easing: Easing.out(Easing.cubic),
    });
  }
  // Controlled ease-out from the partial position; no bounce.
  return interpolate(t, [s06, s06 + sheetSlideFrames], [c.ui.sheetPartialTop, c.ui.sheetFinalTop], {
    easing: Easing.bezier(0.33, 0, 0.15, 1),
    extrapolateRight: 'clamp',
  });
};

/** 0 = sheet off-screen, 1 = fully up. */
export const sheetProgressAt = (c: TiloConfig, t: number): number =>
  interpolate(sheetTopAt(c, t), [c.ui.sheetFinalTop, OFFSCREEN], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
