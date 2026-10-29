import React from 'react';
import {COLORS, STROKE} from '../constants';
import {rad, Vec} from '../lib/motion';

// Tilo, facing right. Every part is its own named <g> so the rig stays editable.
// Local frame: origin at the pelvis, SVG axes (y down), unscaled units.

export const RIG = {
  hipNear: {x: 8, y: 0},
  hipFar: {x: -6, y: -2},
  thigh: 30,
  shin: 31,
  shoulderNear: {x: 16, y: -54}, // torso frame
  shoulderFar: {x: 4, y: -56},
  neck: {x: 13, y: -72},
  headScale: 1.16,
  tailBase: {x: -25, y: -6},
  upperArm: 24,
  foreArm: 23,
  footDrop: 9, // ankle → sole
} as const;

export type Limb = {upper: number; lower: number}; // absolute rotate() degrees, bone hangs along +y at 0

export type TiloPose = {
  x: number;
  y: number;
  s: number;
  torso: number;
  breathe: number; // torso scaleY around the pelvis
  head: number; // relative to torso
  ear: number;
  farEar: number;
  gazeX: number;
  gazeY: number;
  pupil: number;
  blink: number;
  mouthOpen: number;
  smile: number;
  armNear: Limb;
  armFar: Limb;
  grip: number;
  legNear: Limb;
  legFar: Limb;
  tail: number;
  tailCurl: number;
};

export const restPose: TiloPose = {
  x: 0,
  y: 0,
  s: 1,
  torso: 0,
  breathe: 1,
  head: 0,
  ear: 14,
  farEar: -18,
  gazeX: 0.3,
  gazeY: 0,
  pupil: 1,
  blink: 0,
  mouthOpen: 0,
  smile: 0.6,
  armNear: {upper: -10, lower: -30},
  armFar: {upper: -4, lower: -24},
  grip: 0,
  legNear: {upper: -8, lower: 6},
  legFar: {upper: 2, lower: 8},
  tail: 0,
  tailCurl: 1,
};

const rot = (p: Vec, d: number): Vec => {
  const r = rad(d);
  return {x: p.x * Math.cos(r) - p.y * Math.sin(r), y: p.x * Math.sin(r) + p.y * Math.cos(r)};
};
const along = (from: Vec, angle: number, len: number): Vec => ({
  x: from.x - Math.sin(rad(angle)) * len,
  y: from.y + Math.cos(rad(angle)) * len,
});

// ── Forward kinematics (local frame), shared by the renderer and the choreography ──
export const shoulder = (pose: TiloPose, which: 'near' | 'far'): Vec => {
  const s = which === 'near' ? RIG.shoulderNear : RIG.shoulderFar;
  return rot({x: s.x, y: s.y * pose.breathe}, pose.torso);
};
export const armJoints = (pose: TiloPose, which: 'near' | 'far') => {
  const limb = which === 'near' ? pose.armNear : pose.armFar;
  const sh = shoulder(pose, which);
  const elbow = along(sh, limb.upper, RIG.upperArm);
  const wrist = along(elbow, limb.lower, RIG.foreArm);
  return {sh, elbow, wrist};
};
export const legJoints = (pose: TiloPose, which: 'near' | 'far') => {
  const limb = which === 'near' ? pose.legNear : pose.legFar;
  const hip = which === 'near' ? RIG.hipNear : RIG.hipFar;
  const knee = along(hip, limb.upper, RIG.thigh);
  const ankle = along(knee, limb.lower, RIG.shin);
  return {hip, knee, ankle};
};
export const toScreen = (pose: TiloPose, p: Vec): Vec => ({x: pose.x + p.x * pose.s, y: pose.y + p.y * pose.s});
export const toLocal = (pose: TiloPose, p: Vec): Vec => ({x: (p.x - pose.x) / pose.s, y: (p.y - pose.y) / pose.s});

const O = COLORS.navy;
const SW = STROKE.character;

/** Outlined tube through points: outline pass then fill pass, so joints merge into one silhouette. */
const Tube: React.FC<{segs: {a: Vec; b: Vec; w: number}[]; fill: string}> = ({segs, fill}) => (
  <>
    {segs.map((s, i) => (
      <line key={`o${i}`} x1={s.a.x} y1={s.a.y} x2={s.b.x} y2={s.b.y} stroke={O} strokeWidth={s.w + SW * 2} strokeLinecap="round" />
    ))}
    {segs.map((s, i) => (
      <line key={`f${i}`} x1={s.a.x} y1={s.a.y} x2={s.b.x} y2={s.b.y} stroke={fill} strokeWidth={s.w} strokeLinecap="round" />
    ))}
  </>
);

const Leg: React.FC<{pose: TiloPose; which: 'near' | 'far'}> = ({pose, which}) => {
  const {hip, knee, ankle} = legJoints(pose, which);
  const fill = which === 'near' ? COLORS.fur : COLORS.furShade;
  const foot = {cx: ankle.x + 9, cy: ankle.y + RIG.footDrop - 6};
  const limb = which === 'near' ? pose.legNear : pose.legFar;
  const haunch = along(hip, limb.upper, 9);
  return (
    <g id={`tilo-leg-${which}`}>
      {/* haunch, thigh, shin and foot share one outline pass */}
      <ellipse cx={haunch.x} cy={haunch.y} rx={16 + SW} ry={21 + SW} fill={O} transform={`rotate(${limb.upper} ${haunch.x} ${haunch.y})`} />
      <line x1={hip.x} y1={hip.y} x2={knee.x} y2={knee.y} stroke={O} strokeWidth={22 + SW * 2} strokeLinecap="round" />
      <line x1={knee.x} y1={knee.y} x2={ankle.x} y2={ankle.y} stroke={O} strokeWidth={15 + SW * 2} strokeLinecap="round" />
      <ellipse cx={foot.cx} cy={foot.cy} rx={17 + SW} ry={9 + SW} fill={O} />
      <ellipse cx={haunch.x} cy={haunch.y} rx={16} ry={21} fill={fill} transform={`rotate(${limb.upper} ${haunch.x} ${haunch.y})`} />
      <line x1={hip.x} y1={hip.y} x2={knee.x} y2={knee.y} stroke={fill} strokeWidth={22} strokeLinecap="round" />
      <line x1={knee.x} y1={knee.y} x2={ankle.x} y2={ankle.y} stroke={fill} strokeWidth={15} strokeLinecap="round" />
      <ellipse cx={foot.cx} cy={foot.cy} rx={17} ry={9} fill={fill} />
      <path
        d={`M ${foot.cx + 9} ${foot.cy - 4} q 2 4 0 8 M ${foot.cx + 2} ${foot.cy - 5} q 2 5 0 10`}
        stroke={O}
        strokeWidth={2.4}
        strokeLinecap="round"
        fill="none"
      />
    </g>
  );
};

const Arm: React.FC<{pose: TiloPose; which: 'near' | 'far'}> = ({pose, which}) => {
  const {sh, elbow, wrist} = armJoints(pose, which);
  const fill = which === 'near' ? COLORS.fur : COLORS.furShade;
  const limb = which === 'near' ? pose.armNear : pose.armFar;
  const paw = along(wrist, limb.lower, 4);
  const grip = which === 'near' ? pose.grip : 0;
  const rx = 10.5 - grip * 1;
  const ry = 9 + grip * 1.5;
  return (
    <g id={`tilo-arm-${which}`}>
      <Tube
        fill={fill}
        segs={[
          {a: sh, b: elbow, w: 15},
          {a: elbow, b: wrist, w: 13},
        ]}
      />
      <g id={`tilo-paw-${which}`} transform={`translate(${paw.x} ${paw.y}) rotate(${limb.lower})`}>
        <ellipse cx={0} cy={2} rx={rx} ry={ry} fill={fill} stroke={O} strokeWidth={SW} />
        {/* toe creases: open = short ticks at the tip, grip = curled toes */}
        <path
          d={
            grip > 0.5
              ? `M -6 ${4 + ry - 6} q 3 -6 6 -9 M 0 ${6 + ry - 6} q 3 -6 7 -8`
              : `M -4 ${ry - 1} l 0.5 -4 M 3 ${ry - 1} l -0.5 -4`
          }
          stroke={O}
          strokeWidth={2.4}
          strokeLinecap="round"
          fill="none"
        />
      </g>
    </g>
  );
};

const Tail: React.FC<{pose: TiloPose}> = ({pose}) => {
  const c = pose.tailCurl;
  const d = `M 0 0 C ${-16 * c} ${-4} ${-30 * c} ${-20} ${-26 * c} ${-40} C ${-23 * c} ${-52} ${-14 * c} ${-58} ${-8 * c} ${-56}`;
  return (
    <g id="tilo-tail" transform={`translate(${RIG.tailBase.x} ${RIG.tailBase.y}) rotate(${pose.tail})`}>
      <path d={d} stroke={O} strokeWidth={12 + SW * 2} strokeLinecap="round" fill="none" />
      <path d={d} stroke={COLORS.fur} strokeWidth={12} strokeLinecap="round" fill="none" />
    </g>
  );
};

const TORSO = 'M -28 4 C -40 -18 -30 -52 -12 -70 C -2 -80 18 -80 28 -68 C 37 -48 37 -20 26 2 C 16 16 -16 18 -28 4 Z';

const Torso: React.FC<{pose: TiloPose}> = ({pose}) => (
  <g id="tilo-torso" transform={`rotate(${pose.torso}) scale(1 ${pose.breathe})`}>
    <path d={TORSO} fill={COLORS.fur} stroke={O} strokeWidth={SW} strokeLinejoin="round" />
    {/* fur ticks, as in the approved sheet */}
    <path d="M -8 -32 l -3 8 M 0 -27 l -3 8" stroke={O} strokeWidth={2.4} strokeLinecap="round" />
  </g>
);

const HEAD =
  'M -24 -6 C -44 -24 -40 -70 -10 -82 C 12 -90 32 -80 38 -64 C 46 -60 60 -56 64 -47 C 68 -38 62 -28 50 -26 C 38 -24 28 -18 22 -10 C 14 -2 -12 2 -24 -6 Z';
const EAR = 'M -4 -6 C 10 -8 16 14 14 38 C 13 54 6 66 -4 66 C -15 66 -18 50 -15 32 C -12 14 -16 -4 -4 -6 Z';
const EYE = {x: 26, y: -55};

const Head: React.FC<{pose: TiloPose; clipId: string}> = ({pose, clipId}) => {
  const neck = rot({x: RIG.neck.x, y: RIG.neck.y * pose.breathe}, pose.torso);
  const open = pose.mouthOpen;
  const lid = 1 - pose.blink;
  return (
    <g id="tilo-head" transform={`translate(${neck.x} ${neck.y}) rotate(${pose.torso + pose.head}) scale(${RIG.headScale})`}>
      <defs>
        <clipPath id={clipId}>
          <path d={HEAD} />
        </clipPath>
      </defs>
      <g id="tilo-ear-far" transform={`translate(10 -78) rotate(${pose.farEar})`}>
        <path d={EAR} transform="scale(0.62)" fill={COLORS.furShade} stroke={O} strokeWidth={SW / 0.62} strokeLinejoin="round" />
      </g>
      <path id="tilo-skull" d={HEAD} fill={COLORS.fur} stroke={O} strokeWidth={SW} strokeLinejoin="round" />
      {/* goggle strap, clipped to the skull */}
      <g clipPath={`url(#${clipId})`}>
        <path d="M 16 -66 C -2 -76 -26 -72 -46 -54" stroke={O} strokeWidth={14} fill="none" />
        <path d="M 16 -66 C -2 -76 -26 -72 -46 -54" stroke={COLORS.gold} strokeWidth={8} fill="none" />
      </g>
      {/* mouth */}
      <g id="tilo-mouth">
        {open > 0.02 ? (
          <>
            <path
              d={`M 56 -31 Q 46 -25 33 -27 Q ${38} ${-27 + 26 * open} ${56} -31 Z`}
              fill="#7C3446"
              stroke={O}
              strokeWidth={3}
              strokeLinejoin="round"
            />
            <ellipse cx={42} cy={-27 + 14 * open} rx={8 * open} ry={5 * open} fill={COLORS.tongue} />
          </>
        ) : null}
        <path
          d={`M 55 -31 Q 47 ${-24 + 2 * pose.smile} 37 ${-27 - 1.5 * pose.smile}`}
          stroke={O}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>
      <g id="tilo-nose">
        <ellipse cx={63} cy={-46} rx={7.5} ry={6.5} fill={O} />
        <ellipse cx={61} cy={-48.5} rx={2.2} ry={1.5} fill={COLORS.white} opacity={0.85} />
      </g>
      {/* goggles: gold lens ring around the eye */}
      <g id="tilo-goggles">
        <circle cx={EYE.x} cy={EYE.y} r={17} fill={COLORS.gold} stroke={O} strokeWidth={3.5} />
        <circle cx={EYE.x} cy={EYE.y} r={11} fill={COLORS.white} stroke={O} strokeWidth={2.6} />
      </g>
      <g id="tilo-eye" transform={`translate(${EYE.x} ${EYE.y}) scale(1 ${Math.max(0.08, lid)})`}>
        <circle cx={pose.gazeX * 3.6} cy={pose.gazeY * 3.4} r={5.4 * pose.pupil} fill={O} />
        <circle cx={pose.gazeX * 3.6 + 1.8} cy={pose.gazeY * 3.4 - 2} r={1.7} fill={COLORS.white} />
      </g>
      <g id="tilo-ear-near" transform={`translate(-12 -67) rotate(${pose.ear})`}>
        <path d={EAR} fill={COLORS.fur} stroke={O} strokeWidth={SW} strokeLinejoin="round" />
      </g>
    </g>
  );
};

export type TiloParts = 'all' | 'body' | 'nearArm';

export const Tilo: React.FC<{pose: TiloPose; parts?: TiloParts; id?: string}> = ({pose, parts = 'all', id = 'tilo'}) => {
  const body = parts !== 'nearArm';
  const arm = parts !== 'body';
  return (
    <g id={`${id}-${parts}`} transform={`translate(${pose.x} ${pose.y}) scale(${pose.s})`}>
      {body ? (
        <>
          <Arm pose={pose} which="far" />
          <Leg pose={pose} which="far" />
          <Tail pose={pose} />
          <Torso pose={pose} />
          <Leg pose={pose} which="near" />
          <Head pose={pose} clipId={`${id}-skull-clip`} />
        </>
      ) : null}
      {arm ? <Arm pose={pose} which="near" /> : null}
    </g>
  );
};
