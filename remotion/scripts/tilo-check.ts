// Contact & continuity checks for the Tilo choreography: npm run tilo:check
import {pawCenter, scene, sparkFloat} from '../src/tilo/choreography';
import {sparkPath} from '../src/tilo/components/GoldenSpark';
import {legJoints, RIG, toScreen, TiloPose} from '../src/tilo/components/Tilo';
import {PLANE_SCALE, PLANE_Z, ROOM, T, TILO_Z} from '../src/tilo/constants';
import {project, rotateVec, Vec} from '../src/tilo/lib/motion';

const issues: string[] = [];
const ok = (cond: boolean, msg: string) => {
  if (!cond) issues.push(msg);
};
const dist = (a: Vec, b: Vec) => Math.hypot(a.x - b.x, a.y - b.y);
const pelvisScreen = (f: number) => {
  const s = scene(f);
  if (s.tiloFree) return {x: s.tiloFree.x, y: s.tiloFree.y};
  const p = s.tiloLocal!;
  return {x: s.plane.origin.x + p.x * PLANE_SCALE, y: s.plane.origin.y + (p.y + s.plane.state.compress * 5) * PLANE_SCALE};
};

/** Sampled outline of the spark (from its own path data) at a position. */
const sparkOutline = (c: Vec, size: number): Vec[] => {
  const nums = sparkPath(size).match(/-?\d+(\.\d+)?/g)!.map(Number);
  const out: Vec[] = [];
  for (let i = 0; i + 1 < nums.length; i += 2) out.push({x: c.x + nums[i], y: c.y + nums[i + 1]});
  return out;
};
/** Head silhouette sample points (skull, muzzle, nose, jaw) in screen space. */
const headPoints = (p: TiloPose): Vec[] => {
  const neck = rotateVec({x: RIG.neck.x, y: RIG.neck.y * p.breathe}, p.torso);
  const pts: Vec[] = [
    {x: 38, y: -64}, {x: 46, y: -60}, {x: 60, y: -56}, {x: 64, y: -47}, {x: 66, y: -38}, {x: 62, y: -28},
    {x: 50, y: -26}, {x: 38, y: -24}, {x: 28, y: -18}, {x: 22, y: -10}, {x: 70, y: -46},
  ];
  return pts.map((q) => {
    const r = rotateVec({x: q.x * RIG.headScale, y: q.y * RIG.headScale}, p.torso + p.head);
    return toScreen(p, {x: neck.x + r.x, y: neck.y + r.y});
  });
};
const minGap = (a: Vec[], b: Vec[]) => Math.min(...a.flatMap((p) => b.map((q) => dist(p, q))));

// 1. paw meets the spark at pickup; the spark never jumps
const c = scene(T.pickup);
const paw = pawCenter(c.tiloFree!);
const want = {x: sparkFloat(T.pickup).x - 20, y: sparkFloat(T.pickup).y + 14};
console.log(`paw→contact point at pickup (f${T.pickup}): ${dist(paw, want).toFixed(2)} px`);
ok(dist(paw, want) < 1.5, `paw misses the spark by ${dist(paw, want).toFixed(1)} px`);
let maxSpark = 0;
for (let f = T.furniture.spark + 1; f < 150; f++) {
  const d = dist(scene(f - 1).spark, scene(f).spark);
  maxSpark = Math.max(maxSpark, d);
  ok(d < 14, `spark jumps ${d.toFixed(1)} px at f${f}`);
}
console.log(`max spark step: ${maxSpark.toFixed(1)} px/frame`);

// 2. face stays clear of the spark; paws never cover its points once it is cupped
let face = Infinity;
let faceAt = 0;
for (let f = T.spot; f < 150; f++) {
  const s = scene(f);
  const g = minGap(headPoints(s.tiloFree!), sparkOutline(s.spark, s.spark.size));
  if (g < face) [face, faceAt] = [g, f];
}
console.log(`closest muzzle/skull → spark outline: ${face.toFixed(1)} px (f${faceAt})`);
ok(face > 10, `spark comes within ${face.toFixed(1)} px of Tilo's face at f${faceAt}`);
for (const f of [T.settle, 149]) {
  const s = scene(f);
  const outline = sparkOutline(s.spark, s.spark.size);
  for (const w of ['near', 'far'] as const) {
    const gap = minGap([pawCenter(s.tiloFree!, w)], outline) - 9.5 * s.tiloFree!.s - 2.3;
    console.log(`f${f} ${w} paw ↔ spark gap: ${gap.toFixed(1)} px`);
    ok(gap > 4, `${w} paw touches the cupped spark at f${f} (gap ${gap.toFixed(1)} px)`);
  }
}

// 3. pelvis continuity across the cockpit → free hand-off and everywhere else
let maxStep = 0;
for (let f = 1; f < 150; f++) {
  const d = dist(pelvisScreen(f - 1), pelvisScreen(f));
  if (f >= 66) maxStep = Math.max(maxStep, d);
  if (f === T.clearRim) console.log(`hand-off step f${f}: ${d.toFixed(2)} px`);
}
console.log(`max pelvis step after landing: ${maxStep.toFixed(1)} px/frame`);
ok(maxStep < 25, `pelvis moves ${maxStep.toFixed(1)} px in one frame`);

// 4. feet on the floor once landed (no floating, no sinking)
const floorY = project(0, 0, TILO_Z).y;
for (let f = T.land; f < 150; f++) {
  const p = scene(f).tiloFree!;
  for (const w of ['near', 'far'] as const) {
    const sole = toScreen(p, {x: 0, y: legJoints(p, w).ankle.y + 12}).y;
    const stepping = f >= T.step && f <= T.step + 9;
    if (!stepping) ok(Math.abs(sole - floorY) < 1.5, `${w} foot ${(sole - floorY).toFixed(1)} px off the floor at f${f}`);
  }
}

// 5. doorway clearance: while the plane straddles the wall (X=0), its top stays under the header
for (let f = 0; f < 70; f++) {
  const s = scene(f);
  const X = s.plane.origin.x - project(0, 0, PLANE_Z).x;
  if (X + 140 * PLANE_SCALE > 0 && X - 150 * PLANE_SCALE < 0) {
    const p = s.tiloLocal!;
    const headTop = s.plane.origin.y + (p.y - 0.9 * 1.16 * 104 * p.s - 72 * p.s) * PLANE_SCALE; // generous estimate
    const height = project(0, 0, PLANE_Z).y - headTop;
    ok(height < ROOM.door.height - 8, `f${f}: plane+Tilo ${height.toFixed(0)} px tall inside the doorway (header ${ROOM.door.height})`);
  }
}
console.log(issues.length ? `\n${issues.length} issue(s):\n` + issues.slice(0, 40).join('\n') : '\nall checks passed');
process.exitCode = issues.length ? 1 : 0;
