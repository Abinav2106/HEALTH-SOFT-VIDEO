import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C} from '../constants';
import {loadWWFonts} from '../lib/fonts';
import {DoubtRig, REST, RigPose} from './DoubtRig';

// Pose library check: frame N shows POSES[N] on the call background (internal tool, not in the film).
loadWWFonts();

export const POSES: Record<string, Partial<RigPose>> = {
  selfieRest: {armR: {s: 32, e: -4, w: 0}, armL: {s: 10, e: 4, w: 0}},
  waveA: {armR: {s: 32, e: -4, w: 0}, armL: {s: 165, e: 55, w: 10}},
  waveB: {armR: {s: 32, e: -4, w: 0}, armL: {s: 165, e: 75, w: 25}},
  chestTap: {armR: {s: 32, e: -4, w: 0}, armL: {s: -25, e: -77, w: 0}},
  openHand: {armR: {s: 32, e: -4, w: 0}, armL: {s: 60, e: 25, w: -20}, lean: 2.5},
  thinkA: {armR: {s: 32, e: -4, w: 0}, armL: {s: 175, e: 85, w: 10}, qTilt: 10, lean: -2},
  thinkB: {armR: {s: 32, e: -4, w: 0}, armL: {s: 170, e: 95, w: 20}, qTilt: 10, lean: -2},
  fistUp: {armR: {s: 32, e: -4, w: 0}, armL: {s: 150, e: 25, w: -10}, hop: 22, qLift: 34},
  shrug: {armR: {s: 32, e: -4, w: 0}, armL: {s: 38, e: -58, w: 0}, squash: -0.03, qTilt: -7},
  handUp: {armR: {s: 32, e: -4, w: 0}, armL: {s: 125, e: 52, w: -8}},
  present: {armL: {s: 62, e: 18, w: -18}, armR: {s: 62, e: 18, w: -18}},
  phoneUp: {armR: {s: -35, e: -100, w: 0}, phone: {hand: 'r', show: 1, up: 1, buzz: 0}, qTilt: 8, lean: 2},
};
const NAMES = Object.keys(POSES);

export const RigTest: React.FC = () => {
  const frame = useCurrentFrame();
  const name = NAMES[frame % NAMES.length];
  const pose: RigPose = {...REST, ...POSES[name]} as RigPose;
  return (
    <AbsoluteFill style={{background: C.callBg}}>
      <DoubtRig cam={{s: 1.5, sx: 540, sy: 470}} pose={pose} frame={frame} />
      <div style={{position: 'absolute', left: 30, top: 30, fontSize: 48, fontFamily: 'DM Sans'}}>{name}</div>
    </AbsoluteFill>
  );
};
export const RIG_TEST_FRAMES = NAMES.length;
