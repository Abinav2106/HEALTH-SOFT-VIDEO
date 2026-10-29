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
  shoulderNear: {x: 20, y: -52}, // torso frame
  shoulderFar: {x: 8, y: -54},
  neck: {x: 13, y: -72},
  headScale: 1.16,
  tailBase: {x: -25, y: -6},
  upperArm: 30,
  foreArm: 29,
  footDrop: 9, // ankle → sole
} as const;

export type Limb = {upper: number; lower: number}; // absolute rotate() degrees, segment hangs along +y at 0

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

/**
 * One smooth, tapered limb outline through root → joint → end. The sides are cubic curves that pass
 * the joint with a shared tangent, so there is no exposed joint circle; the root and end are
 * rounded. Widths taper from root to end.
 */
const limbPath = (a: Vec, b: Vec, c: Vec, wa: number, wb: number, wc: number) => {
  const unit = (v: Vec) => {
    const l = Math.hypot(v.x, v.y) || 1;
    return {x: v.x / l, y: v.y / l};
  };
  const d1 = unit({x: b.x - a.x, y: b.y - a.y});
  const d2 = unit({x: c.x - b.x, y: c.y - b.y});
  const db = unit({x: d1.x + d2.x, y: d1.y + d2.y});
  const n = (d: Vec) => ({x: -d.y, y: d.x});
  const off = (p: Vec, d: Vec, w: number, side: 1 | -1) => ({x: p.x + n(d).x * (w / 2) * side, y: p.y + n(d).y * (w / 2) * side});
  const l1 = Math.hypot(b.x - a.x, b.y - a.y);
  const l2 = Math.hypot(c.x - b.x, c.y - b.y);
  const f = (v: number) => v.toFixed(2);
  const side = (s: 1 | -1) => {
    const pa = off(a, d1, wa, s);
    const pb = off(b, db, wb, s);
    const pc = off(c, d2, wc, s);
    return {pa, pb, pc};
  };
  const L = side(1);
  const R = side(-1);
  const seg = (p: Vec, dp: Vec, q: Vec, dq: Vec, len: number) =>
    `C ${f(p.x + dp.x * len * 0.4)} ${f(p.y + dp.y * len * 0.4)} ${f(q.x - dq.x * len * 0.4)} ${f(q.y - dq.y * len * 0.4)} ${f(q.x)} ${f(q.y)}`;
  const back = (d: Vec) => ({x: -d.x, y: -d.y});
  return [
    `M ${f(L.pa.x)} ${f(L.pa.y)}`,
    seg(L.pa, d1, L.pb, db, l1),
    seg(L.pb, db, L.pc, d2, l2),
    `A ${f(wc / 2)} ${f(wc / 2)} 0 0 0 ${f(R.pc.x)} ${f(R.pc.y)}`,
    seg(R.pc, back(d2), R.pb, back(db), l2),
    seg(R.pb, back(db), R.pa, back(d1), l1),
    `A ${f(wa / 2)} ${f(wa / 2)} 0 0 0 ${f(L.pa.x)} ${f(L.pa.y)}`,
    'Z',
  ].join(' ');
};

/** Limb + paw/foot merged into one silhouette: outline pass, then fill pass. */
const Merged: React.FC<{limb: string; end: React.ReactElement<React.SVGProps<SVGElement>>; fill: string}> = ({limb, end, fill}) => (
  <>
    <path d={limb} fill="none" stroke={O} strokeWidth={SW * 2} strokeLinejoin="round" />
    {React.cloneElement(end, {fill: 'none', stroke: O, strokeWidth: SW * 2})}
    <path d={limb} fill={fill} />
    {React.cloneElement(end, {fill})}
  </>
);

const Leg: React.FC<{pose: TiloPose; which: 'near' | 'far'}> = ({pose, which}) => {
  const {hip, knee, ankle} = legJoints(pose, which);
  const fill = which === 'near' ? COLORS.fur : COLORS.furShade;
  const foot = {cx: ankle.x + 8, cy: ankle.y + RIG.footDrop - 6};
  return (
    <g id={`tilo-leg-${which}`}>
      {/* thigh tapers into the shin and a rounded foot; the root hides under the torso */}
      <Merged fill={fill} limb={limbPath(hip, knee, ankle, 30, 17, 13)} end={<ellipse cx={foot.cx} cy={foot.cy} rx={15.5} ry={8.5} />} />
      <path
        d={`M ${foot.cx + 8} ${foot.cy - 3} q 1.6 3 0 6`}
        stroke={O}
        strokeWidth={2.2}
        strokeLinecap="round"
        fill="none"
      />
    </g>
  );
};

/** Paw centre for a given arm (local frame) — the point the IK aims at. */
export const pawPoint = (pose: TiloPose, which: 'near' | 'far'): Vec => {
  const {wrist} = armJoints(pose, which);
  const limb = which === 'near' ? pose.armNear : pose.armFar;
  return along(wrist, limb.lower, 6);
};

const Arm: React.FC<{pose: TiloPose; which: 'near' | 'far'}> = ({pose, which}) => {
  const {sh, elbow, wrist} = armJoints(pose, which);
  const fill = which === 'near' ? COLORS.fur : COLORS.furShade;
  const paw = pawPoint(pose, which);
  return (
    <g id={`tilo-arm-${which}`}>
      {/* upper arm → forearm → rounded paw, one outline; the shoulder overlaps the chest softly */}
      <Merged fill={fill} limb={limbPath(sh, elbow, wrist, 16, 13.5, 11.5)} end={<circle cx={paw.x} cy={paw.y} r={9.5} />} />
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
          <Leg pose={pose} which="near" />
          <Torso pose={pose} />
          <Head pose={pose} clipId={`${id}-skull-clip`} />
        </>
      ) : null}
      {arm ? <Arm pose={pose} which="near" /> : null}
    </g>
  );
};
