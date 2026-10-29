// Contact & continuity checks for the Tilo choreography: npm run tilo:check
import {scene, pawCenter, BONE_REST} from '../src/tilo/choreography';
import {legJoints, toScreen} from '../src/tilo/components/Tilo';
import {PLANE_SCALE, PLANE_Z, ROOM, T, TILO_Z} from '../src/tilo/constants';
import {project} from '../src/tilo/lib/motion';

const issues: string[] = [];
const ok = (cond: boolean, msg: string) => {
  if (!cond) issues.push(msg);
};
const pelvisScreen = (f: number) => {
  const s = scene(f);
  if (s.tiloFree) return {x: s.tiloFree.x, y: s.tiloFree.y};
  const p = s.tiloLocal!;
  return {x: s.plane.origin.x + p.x * PLANE_SCALE, y: s.plane.origin.y + (p.y + s.plane.state.compress * 5) * PLANE_SCALE};
};

// 1. paw meets the bone exactly at pickup, and the bone never jumps
const contact = scene(T.pickup);
const paw = pawCenter(contact.tiloFree!);
const gap = Math.hypot(paw.x - BONE_REST.x, paw.y - BONE_REST.y);
console.log(`paw→bone gap at pickup (f${T.pickup}): ${gap.toFixed(2)} px`);
ok(gap < 1.5, `paw misses the bone by ${gap.toFixed(1)} px`);
for (let f = 1; f < 150; f++) {
  const a = scene(f - 1).bone;
  const b = scene(f).bone;
  const d = Math.hypot(a.x - b.x, a.y - b.y);
  ok(d < 14, `bone jumps ${d.toFixed(1)} px at f${f}`);
}
// 2. pelvis continuity across the cockpit → free hand-off and everywhere else
let maxStep = 0;
for (let f = 1; f < 150; f++) {
  const a = pelvisScreen(f - 1);
  const b = pelvisScreen(f);
  const d = Math.hypot(a.x - b.x, a.y - b.y);
  if (f >= 66) maxStep = Math.max(maxStep, d);
  if (f === T.clearRim) console.log(`hand-off step f${f}: ${d.toFixed(2)} px`);
}
console.log(`max pelvis step after landing: ${maxStep.toFixed(1)} px/frame`);
// 3. feet on the floor once landed (no floating, no sinking)
const floorY = project(0, 0, TILO_Z).y;
for (let f = T.land; f < 150; f++) {
  const p = scene(f).tiloFree!;
  for (const w of ['near', 'far'] as const) {
    const sole = toScreen(p, {x: 0, y: legJoints(p, w).ankle.y + 12}).y;
    const stepping = f >= T.step && f <= T.step + 9;
    if (!stepping) ok(Math.abs(sole - floorY) < 1.5, `${w} foot ${(sole - floorY).toFixed(1)} px off the floor at f${f}`);
  }
}
// 4. doorway clearance: while the plane straddles the wall (X=0), its top stays under the header
for (let f = 0; f < 70; f++) {
  const s = scene(f);
  const X = s.plane.origin.x - project(0, 0, PLANE_Z).x;
  const nose = X + 140 * PLANE_SCALE;
  const tail = X - 150 * PLANE_SCALE;
  if (nose > 0 && tail < 0) {
    const ground = project(0, 0, PLANE_Z).y;
    const p = s.tiloLocal!;
    const headTop = s.plane.origin.y + (p.y - 0.9 * 1.16 * 104 * p.s - 72 * p.s) * PLANE_SCALE; // generous estimate
    const height = ground - headTop;
    ok(height < ROOM.door.height - 8, `f${f}: plane+Tilo ${height.toFixed(0)} px tall inside the doorway (header ${ROOM.door.height})`);
  }
}
console.log(issues.length ? `\n${issues.length} issue(s):\n` + issues.slice(0, 40).join('\n') : '\nall checks passed');
process.exitCode = issues.length ? 1 : 0;
