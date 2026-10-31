// Frame → complete scene state. Pure functions of the frame number, so scrubbing is deterministic.
import {PARK_X, PLANE_SCALE, PLANE_Z, ROOM, T, TILO_SCALE, TILO_Z} from './constants';
import {
  clamp01,
  EASE_IN_OUT,
  EASE_OUT,
  EASE_SOFT,
  ik2,
  keys,
  lerp,
  prog,
  project,
  spline,
  Vec,
  wobble,
} from './lib/motion';
import {PLANE, PlaneState} from './components/Plane';
import {Entrance} from './components/Workspace';
import {pawPoint, restPose, RIG, shoulder, TiloPose, toLocal, toScreen} from './components/Tilo';
import {SPARK} from './components/GoldenSpark';

const TS = TILO_SCALE; // seated, in plane units
const PS = PLANE_SCALE;
const FS = PS * TS; // free-standing Tilo, in screen units

// ── Plane flight ────────────────────────────────────────────────────────────
// World X/Y of the plane origin (ground point under the fuselage). One spline from off-screen left,
// through the doorway (nose stays outside the wall until the plane is below the header), to the park spot.
const PATH_F = [0, 20, 31, 42, 48, 54, 59, 63, 65, 69];
const PATH_X = [-560, -226, -212, -192, -152, -82, 8, 90, 124, PARK_X];
const PATH_Y = [330, 232, 202, 150, 110, 58, 22, 6, 0, 0];

const planeWorld = (f: number) => {
  const bounce = keys(f, [66, 68, 70], [0, 4, 0], EASE_SOFT);
  return {X: spline(f, PATH_F, PATH_X), Y: spline(f, PATH_F, PATH_Y) + bounce};
};
const planeScreen = (f: number): Vec => {
  const w = planeWorld(f);
  return project(w.X, w.Y, PLANE_Z);
};
const planeSpeed = (f: number) => {
  const a = planeScreen(f - 0.5);
  const b = planeScreen(f + 0.5);
  return Math.hypot(b.x - a.x, b.y - a.y);
};

const PITCH_F = [0, 12, 20, 30, 38, 48, 56, 61, 64, 66];
const PITCH_V = [7, 3, -3, 0, 4, 8, 4, -3, -1, 0];
const ROLL_F = [0, 18, 34, 42, 54, 62];
const ROLL_V = [0.7, 0.1, 0, 0.8, 0.3, 0];

/** Propeller: fast through the flight, slowing progressively after touchdown. */
const propOmega = (f: number) => 1.75 * (1 - prog(f, 62, 26, EASE_OUT)) + 0.0;
const propAngle = (f: number) => {
  let a = 0.4;
  for (let i = 0; i < Math.floor(f); i++) a += propOmega(i);
  return a + propOmega(Math.floor(f)) * (f - Math.floor(f));
};

const planeState = (f: number): PlaneState => ({
  pitch: f >= 66 ? 0 : spline(f, PITCH_F, PITCH_V),
  roll: spline(f, ROLL_F, ROLL_V),
  compress: keys(f, [64, 66, 68, 70, 73], [0, 1, 0, 0.35, 0], EASE_SOFT),
  propAngle: propAngle(f),
  propBlur: 1 - prog(f, 64, 18, EASE_IN_OUT),
});

// ── Helpers for Tilo ────────────────────────────────────────────────────────
const solveArm = (pose: TiloPose, which: 'near' | 'far', targetLocal: Vec) => {
  const sh = shoulder(pose, which);
  const r = ik2(sh, targetLocal, RIG.upperArm, RIG.foreArm + 6, -1);
  return {upper: r.upper, lower: r.lower};
};
const solveLeg = (pose: TiloPose, which: 'near' | 'far', ankleLocal: Vec) => {
  const hip = which === 'near' ? RIG.hipNear : RIG.hipFar;
  const r = ik2(hip, ankleLocal, RIG.thigh, RIG.shin, 1);
  return {upper: r.upper, lower: r.lower};
};
/** Paw centre in the pose's parent space. */
export const pawCenter = (pose: TiloPose, which: 'near' | 'far' = 'near'): Vec => toScreen(pose, pawPoint(pose, which));
const vlerp = (a: Vec, b: Vec, t: number): Vec => ({x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t)});
const add = (a: Vec, b: Vec): Vec => ({x: a.x + b.x, y: a.y + b.y});

const CK = PLANE.cockpit;
const SEAT = PLANE.seat;
const PARKED_ORIGIN = project(PARK_X, 0, PLANE_Z);
const groundY = (z: number) => project(0, 0, z).y;
const STAND_H = 69 * FS; // pelvis height when standing
const LAND = project(296, STAND_H, TILO_Z); // pelvis right after the hop
const STAND = project(338, STAND_H, TILO_Z); // pelvis after the short step
// ── The golden spark ────────────────────────────────────────────────────────
export const SPARK_HOME = project(ROOM.spark.x, ROOM.desk.height + ROOM.spark.lift, ROOM.spark.z);
/** Floating above the desk: a slow, gentle bob (deterministic). */
export const sparkFloat = (f: number): Vec => add(SPARK_HOME, {x: 0, y: -3.2 * Math.sin(((f - T.furniture.spark) / 42) * Math.PI * 2)});
// Where the paw meets the spark: its lower-left concave side, so the paw never hides the silhouette.
const CONTACT: Vec = {x: -20, y: 14};
// Cupped at the chest: spark centre relative to the near shoulder (below the chin and tongue), and each
// paw relative to the spark — under it, either side of its lower point, forearms clear of its outline.
const HOLD: Vec = {x: 38, y: 0};
const CUP_NEAR: Vec = {x: 10, y: 44};
const CUP_FAR: Vec = {x: -15, y: 41};

// ── Tilo's head, face and ears ──────────────────────────────────────────────
const face = (f: number, pose: TiloPose): TiloPose => {
  // gaze: ahead → the glint → down into the room → the spark → the viewer
  const g = [0, 10, 16, 27, 33, 60, 66, T.spot, T.toChest + 1, T.toChest + 9];
  const gazeX = keys(f, g, [0.5, 0.5, 0.95, 0.95, 0.85, 0.9, 1, 1, 0.95, -0.15]);
  const gazeY = keys(f, g, [0, 0, 0.45, 0.45, 0.8, 0.5, 0.6, 0.45, 0.6, 0.1]);
  const pupil = keys(f, [12, 16, 24, T.spot - 1, T.spot + 1, T.pause, T.pickup, T.pickup + 5], [1, 1.12, 1.04, 1.04, 1.2, 1.2, 1.08, 1.05]);
  // curious little "o" during the anticipation pause, delight on contact
  const mouthOpen = keys(f, [T.pause - 2, T.pause, T.pickup - 1, T.pickup, T.pickup + 3], [0, 0.22, 0.22, 0.3, 0.95], EASE_OUT);
  const smile = keys(f, [0, T.spot - 3, T.spot + 1, T.pickup - 2, T.pickup], [0.6, 0.6, 0.2, 0.2, 1]);
  return {...pose, gazeX, gazeY, pupil, mouthOpen, smile};
};

const speedEar = (f: number) => {
  const sp = clamp01(planeSpeed(f - 2) / 24);
  return 14 + 66 * sp + Math.sin(f * 1.7) * 6 * sp;
};

// ── Cockpit phase (plane-local coordinates) ─────────────────────────────────
const cockpitPose = (f: number): TiloPose => {
  const brace = prog(f, T.brace, T.lift - T.brace, EASE_IN_OUT);
  const lift = prog(f, T.lift, T.clearRim - T.lift, EASE_IN_OUT);
  let pose: TiloPose = {
    ...restPose,
    s: TS,
    x: SEAT.x + 4 * brace + 14 * lift,
    y: SEAT.y - 4 * brace - 66 * lift + keys(f, [0, 6, 12, 18, 24, 30, 36, 42], [0, -2, 0, -2, 0, -2, 0, 0]),
    torso:
      keys(f, [0, 16, 24, 38, 46, 62, 65, 68, 73], [-7, -4, 0, 0, 4, 2, 2, 9, 0], EASE_IN_OUT) +
      10 * brace -
      4 * lift,
    head: keys(f, [0, 20, 27, 34, 50, 62, 66, 72], [3, 0, 0, 10, 6, 2, 4, 10]) - 6 * lift,
    ear:
      f < 64
        ? speedEar(f)
        : lerp(speedEar(64), 14, prog(f, 64, 6)) - 30 * wobble(f - 64, 0.09, 0.13) + 16 * wobble(f - 76, 0.1, 0.18),
    farEar: -18 - 10 * clamp01(planeSpeed(f - 2) / 24),
    tail: 9 * wobble(f - 5, 0.1, 0.1) - 14 * lift,
    tailCurl: 1,
  };
  pose = face(f, pose);
  // paws on the cockpit rim; the near paw braces on the front lip and stays planted while he pushes up
  const restPaw: Vec = {x: CK.x + 22, y: CK.y - 3};
  const bracePaw: Vec = {x: CK.x + 30, y: CK.y + 1};
  // hand-off values match freePose() at T.clearRim exactly
  const freePaw: Vec = add({x: pose.x, y: pose.y}, {x: 46 * TS, y: -34 * TS});
  const nearTarget = vlerp(vlerp(restPaw, bracePaw, brace), freePaw, prog(f, T.clearRim - 3, 3, EASE_IN_OUT));
  const farTarget = vlerp({x: CK.x + 8, y: CK.y - 6}, add({x: pose.x, y: pose.y}, {x: 46 * TS - 14, y: -34 * TS}), lift);
  pose.armNear = solveArm(pose, 'near', toLocal(pose, nearTarget));
  pose.armFar = solveArm(pose, 'far', toLocal(pose, farTarget));
  // legs folded inside the fuselage, tucked tighter as he climbs out
  pose.legNear = solveLeg(pose, 'near', {x: 30 - 12 * lift, y: 22 + 6 * lift});
  pose.legFar = solveLeg(pose, 'far', {x: 18 - 12 * lift, y: 20 + 6 * lift});
  // (lift = 1 ⇒ near (18, 28), far (6, 26): the tucked feet freePose() starts from)
  return pose;
};

// ── Free phase (screen coordinates) ─────────────────────────────────────────
const freePose = (f: number): TiloPose => {
  const exitPelvis = add(PARKED_ORIGIN, {x: PS * (SEAT.x + 4 + 14), y: PS * (SEAT.y - 4 - 66)});
  // hop: horizontal ease, vertical gravity arc, landing squash
  const h = clamp01((f - T.hop) / (T.land - T.hop));
  const hx = lerp(h, EASE_SOFT(h), 0.35); // near-constant travel; gravity lives in the arc
  const hopArc = -24 * 4 * h * (1 - h);
  const squash = keys(f, [T.land, T.land + 2, T.land + 5], [0, 8, 0], EASE_SOFT);
  const step = prog(f, T.step, 8, EASE_IN_OUT);
  const reachLean = prog(f, T.reach - 2, 5, EASE_IN_OUT);
  const upright = prog(f, T.toChest, 10, EASE_IN_OUT);
  let pelvis: Vec = f < T.land ? add({x: lerp(exitPelvis.x, LAND.x, hx), y: lerp(exitPelvis.y, LAND.y, h)}, {x: 0, y: hopArc}) : vlerp(LAND, STAND, step);
  pelvis = add(pelvis, {x: 6 * reachLean * (1 - upright), y: squash - 3 * Math.sin(Math.PI * step) + 2 * reachLean * (1 - upright)});

  const hold = Math.max(0, f - T.settle);
  let pose: TiloPose = {
    ...restPose,
    s: FS,
    x: pelvis.x,
    y: pelvis.y,
    torso:
      keys(f, [T.hop, T.hop + 4, T.land, T.land + 3, T.land + 7], [6, 12, 4, 10, 2], EASE_IN_OUT) * (1 - reachLean) +
      8 * reachLean * (1 - upright) -
      2 * upright,
    breathe: 1 + 0.012 * Math.sin((hold / 30) * Math.PI * 2) * clamp01(hold / 6),
    head:
      // eyes lead, then the head follows — lifting slightly so the muzzle stays clear of the spark
      keys(f, [T.hop, T.land, T.land + 4, T.spot + 1, T.spot + 5], [4, 4, 6, 6, -4], EASE_IN_OUT) * (1 - upright) +
      lerp(0, -13, upright),
    ear:
      14 +
      28 * wobble(f - T.hop, 0.11, 0.15) -
      22 * wobble(f - T.land, 0.1, 0.14) +
      10 * wobble(f - T.step, 0.12, 0.2) -
      8 * prog(f, T.spot, 4) +
      8 * prog(f, T.toChest, 8) -
      6 * wobble(f - T.pickup, 0.12, 0.16),
    farEar: -18 - 8 * prog(f, T.spot, 4),
    tail:
      -14 +
      10 * prog(f, T.land, 6) +
      12 * wobble(f - T.pickup, 0.11, 0.12) +
      (f >= T.tailWag && f <= T.tailWag + 12 ? 10 * Math.sin(((f - T.tailWag) / 12) * Math.PI * 2) * Math.sin(((f - T.tailWag) / 12) * Math.PI) : 0),
    tailCurl: 1,
  };
  pose = face(f, pose);

  // feet: tucked → extended in the air, then planted on the floor (IK keeps them from sliding)
  const floorY = groundY(TILO_Z);
  const ankleFromSole = (sole: Vec): Vec => ({x: sole.x - 9 * FS, y: sole.y - 12 * FS});
  const footAir = (which: 'near' | 'far'): Vec => {
    const tuck = which === 'near' ? {x: 18, y: 28} : {x: 6, y: 26};
    const ext = which === 'near' ? {x: 14, y: 58} : {x: 0, y: 56};
    const local = vlerp(tuck, ext, EASE_OUT(clamp01((f - T.hop - 2) / 5)));
    const scr = toScreen(pose, local);
    return {x: scr.x, y: Math.min(scr.y, floorY - 12 * FS)};
  };
  const landNear = {x: LAND.x + 14 * FS, y: floorY};
  const landFar = {x: LAND.x - 2 * FS, y: floorY};
  const stepLen = STAND.x - LAND.x;
  const sN = prog(f, T.step, 5, EASE_IN_OUT);
  const sF = prog(f, T.step + 3, 5, EASE_IN_OUT); // far foot follows
  const soleNear = {x: landNear.x + stepLen * sN, y: floorY - 14 * Math.sin(Math.PI * sN)};
  const soleFar = {x: landFar.x + stepLen * sF, y: floorY - 10 * Math.sin(Math.PI * sF)};
  const ankleNear = f < T.land ? footAir('near') : ankleFromSole(soleNear);
  const ankleFar = f < T.land ? footAir('far') : ankleFromSole(soleFar);
  pose.legNear = solveLeg(pose, 'near', toLocal(pose, ankleNear));
  pose.legFar = solveLeg(pose, 'far', toLocal(pose, ankleFar));

  // arms: balance in the hop, relaxed, then the reach → anticipation → contact → cup at the chest
  const relaxed = add({x: pose.x, y: pose.y}, {x: 30 * FS, y: -14 * FS});
  const hopArms = add({x: pose.x, y: pose.y}, {x: 46 * FS, y: -34 * FS});
  const air = 1 - prog(f, T.land + 1, 6, EASE_IN_OUT);
  const spark = sparkFloat(f);
  const hover = add(spark, {x: CONTACT.x - 8, y: CONTACT.y + 12});
  const anticip = add(spark, {x: CONTACT.x - 12, y: CONTACT.y + 17});
  const contact = add(sparkFloat(T.pickup), CONTACT);
  const sh = toScreen(pose, shoulder(pose, 'near'));
  const chest = add(sh, {x: HOLD.x * FS, y: HOLD.y * FS});
  let near = vlerp(relaxed, hopArms, air);
  near = vlerp(near, hover, prog(f, T.reach, 4, EASE_IN_OUT));
  near = vlerp(near, anticip, prog(f, T.pause, 2, EASE_SOFT));
  near = vlerp(near, contact, prog(f, T.pause + 2, 1, EASE_IN_OUT));
  near = vlerp(near, add(contact, {x: 5, y: -3}), prog(f, T.pickup, 3, EASE_OUT)); // lifted forward, away from the face
  // carried to the chest on a low arc, so the spark passes well under the muzzle
  const carry = prog(f, T.toChest, T.settle - T.toChest, EASE_IN_OUT);
  near = vlerp(near, add(chest, {x: CUP_NEAR.x * FS, y: CUP_NEAR.y * FS}), carry);
  near = add(near, {x: 0, y: 16 * Math.sin(Math.PI * carry)});
  pose.armNear = solveArm(pose, 'near', toLocal(pose, near));
  const farRelaxed = add({x: pose.x, y: pose.y}, {x: 18 * FS, y: -12 * FS});
  const farCup = add(chest, {x: CUP_FAR.x * FS, y: CUP_FAR.y * FS});
  pose.armFar = solveArm(pose, 'far', toLocal(pose, vlerp(vlerp(farRelaxed, add(hopArms, {x: -14, y: 0}), air), farCup, prog(f, T.toChest + 1, T.settle - T.toChest - 1, EASE_IN_OUT))));
  return pose;
};

// ── Scene ───────────────────────────────────────────────────────────────────
const enter = (f: number, at: number, rise = 18, from = 0.96, dur = 10): Entrance => ({
  opacity: prog(f, at, 5, EASE_OUT),
  rise: rise * (1 - prog(f, at, dur, EASE_OUT)),
  scale: lerp(from, 1, prog(f, at, dur, EASE_OUT)),
});

export const scene = (f: number) => {
  const world = planeWorld(f);
  const origin = project(world.X, world.Y, PLANE_Z);
  const state = planeState(f);
  const cockpit = f < T.clearRim;
  const tiloLocal = cockpit ? cockpitPose(f) : null;
  const tiloFree = cockpit ? null : freePose(f);

  // the spark: floating above the desk until the paw meets it, then carried by the paws (one instance)
  let spark = sparkFloat(f);
  if (tiloFree && f >= T.pickup) {
    const paw = pawCenter(tiloFree, 'near');
    const cupped: Vec = {x: -CUP_NEAR.x * FS, y: -CUP_NEAR.y * FS};
    const offset = vlerp({x: -CONTACT.x, y: -CONTACT.y}, cupped, prog(f, T.toChest, T.settle - T.toChest, EASE_IN_OUT));
    const held = clamp01((f - T.pickup) / 4);
    spark = add(add(paw, offset), {x: 0, y: -1.4 * Math.sin(((f - T.pickup) / 36) * Math.PI * 2) * held});
  }
  const appear = keys(f, [T.furniture.spark, T.furniture.spark + 5, T.furniture.spark + 8], [0.4, 1.08, 1], EASE_OUT);
  const glow =
    keys(f, [T.spot - 1, T.spot + 2, T.spot + 8], [0, 0.55, 0], EASE_SOFT) + // noticed: one soft pulse
    keys(f, [T.pickup, T.pickup + 2, T.pickup + 9], [0, 1, 0.12], EASE_OUT); // contact: brief brightening

  const alt = clamp01(world.Y / 240);
  const speed = planeSpeed(f);
  const tiloAir = tiloFree ? clamp01((STAND.y - tiloFree.y) / 120) : 0;

  return {
    plane: {origin, state},
    shadow: {
      x: project(world.X - 6 * PS, 0, PLANE_Z).x,
      y: project(world.X - 6 * PS, 0, PLANE_Z).y + 4,
      w: 240 * PS * (1 - 0.32 * alt),
      opacity: (0.05 + 0.1 * (1 - alt)) * prog(f, 2, 8),
    },
    strokes: {
      x: origin.x - 168 * PS,
      y: origin.y - 70 * PS,
      opacity: clamp01((speed - 6) / 16) * (1 - prog(f, 14, 7)),
      stretch: 0.6 + clamp01(speed / 30),
    },
    tiloLocal,
    tiloFree,
    tiloShadow: tiloFree
      ? {x: tiloFree.x + 8, y: groundY(TILO_Z) + 2, w: 100 * (1 - 0.35 * tiloAir), opacity: 0.1 * (1 - 0.5 * tiloAir) * prog(f, T.hop + 2, 4)}
      : null,
    spark: {...spark, size: SPARK.height * appear, opacity: prog(f, T.furniture.spark, 3), glow, held: tiloFree !== null && f >= T.pickup},
    room: {
      floor: enter(f, T.floorIn, 20, 0.97, 10),
      door: enter(f, T.doorIn, 24, 0.97, 10),
      plant: enter(f, T.furniture.plant),
      desk: enter(f, T.furniture.desk),
      chair: enter(f, T.furniture.chair),
      laptop: enter(f, T.furniture.laptop, 14),
      doorOpen: prog(f, T.doorOpen, 11, EASE_IN_OUT),
    },
    // first glimpse during the arrival, exactly where the spark will appear
    glint: {
      ...SPARK_HOME,
      r: 16,
      t: keys(f, [T.glintIn, T.glintIn + 4, T.glintIn + 8], [0, 1.1, 1], EASE_OUT),
      fade: prog(f, 28, 8),
    },
    sparkGlint: {...SPARK_HOME, r: 42, t: keys(f, [T.sparkGlint, T.sparkGlint + 3, T.sparkGlint + 7], [0, 1, 1], EASE_OUT), fade: prog(f, T.sparkGlint + 5, 6)},
    particles: {...sparkFloat(T.pickup), t: clamp01((f - T.pickup) / 11)},
    sparkles: T.sparkles.map((at, i) => {
      const spots = [
        {x: -96, y: -238, size: 15},
        {x: 108, y: -262, size: 12},
        {x: 146, y: -178, size: 10},
      ];
      const anchor = STAND;
      return {
        x: anchor.x + spots[i].x,
        y: anchor.y + spots[i].y,
        size: spots[i].size,
        t: keys(f, [at, at + 4, at + 7], [0, 1.2, 1], EASE_OUT) * (1 + 0.06 * Math.sin(((f - at) / 18) * Math.PI * 2) * clamp01((f - at - 7) / 6)),
        rotate: 8 * i,
      };
    }),
    card: {
      rise: 20 * (1 - prog(f, T.cardIn, 10, EASE_OUT)),
      scale: keys(f, [T.cardIn, T.cardIn + 7, T.cardIn + 13], [0.88, 1.03, 1], EASE_IN_OUT),
      opacity: prog(f, T.cardIn, 4, EASE_OUT),
      check: prog(f, T.check, 8, EASE_IN_OUT),
    },
    camera: {scale: 1 + 0.024 * prog(f, 104, 22, EASE_IN_OUT), cx: 560, cy: 760},
  };
};

export type Scene = ReturnType<typeof scene>;
export {SEAT, PS};
