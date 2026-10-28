import {
  CAMERA,
  DOORS,
  DRIFT,
  FLIGHT_SCALE,
  HEIGHT,
  HOLD_ORIGIN,
  LOCKUP_ORIGIN,
  LOCKUP_SCALE,
  PLAN,
  ROUTE_Y,
  SELECTED_CENTER,
  T,
  WIDTH,
} from '../constants';
import {EASE_IN_OUT, EASE_OUT, lerp, progress} from '../../video06/lib/motion';
import {Easing} from 'remotion';
import {Pt, buildRoute, cubic, gap, lengthAt, line} from './route';

// ── Route geometry (world px) ────────────────────────────────────────────────────────────────────
const {x0, x1, y0, y1, splitX, splitY} = PLAN;
const climb = cubic({x: -80, y: ROUTE_Y + 75}, {x: -10, y: ROUTE_Y + 75}, {x: 60, y: ROUTE_Y}, {x: 150, y: ROUTE_Y});
const level = line({x: 150, y: ROUTE_Y}, {x: 560, y: ROUTE_Y});
const descent = cubic({x: 560, y: ROUTE_Y}, {x: 770, y: ROUTE_Y}, {x: x1, y: ROUTE_Y + 70}, {x: x1, y: y0});
const E = DOORS.entrance;

// One continuous stroke: the flight line, then the outer walls clockwise from the top-right corner.
export const MAIN = buildRoute([
  climb,
  level,
  descent,
  line({x: x1, y: y0}, {x: x1, y: E.y0}),
  gap({x: x1, y: E.y0}, {x: x1, y: E.y1}),
  line({x: x1, y: E.y1}, {x: x1, y: y1}),
  line({x: x1, y: y1}, {x: x0, y: y1}),
  line({x: x0, y: y1}, {x: x0, y: y0}),
  line({x: x0, y: y0}, {x: x1, y: y0}),
]);
// Where the line pauses while Tilo flies in: the end of the level stretch.
export const MAIN_PAUSE = buildRoute([climb, level]).length;

// Partitions branch off the main stroke as the pen passes their junctions.
const CM = DOORS.cabinMeeting;
const DC = DOORS.deskCabin;
export const BRANCHES = [
  {
    at: lengthAt(MAIN, {x: x0, y: splitY}),
    route: buildRoute([
      line({x: x0, y: splitY}, {x: CM.x0, y: splitY}),
      gap({x: CM.x0, y: splitY}, {x: CM.x1, y: splitY}),
      line({x: CM.x1, y: splitY}, {x: x1, y: splitY}),
    ]),
  },
  {
    at: lengthAt(MAIN, {x: splitX, y: y0}),
    route: buildRoute([
      line({x: splitX, y: y0}, {x: splitX, y: DC.y0}),
      gap({x: splitX, y: DC.y0}, {x: splitX, y: DC.y1}),
      line({x: splitX, y: DC.y1}, {x: splitX, y: splitY}),
    ]),
  },
];

// The selection light: from just ahead of the propeller, along the drawn route, in through the door.
export const LIGHT = buildRoute([
  line({x: 450, y: ROUTE_Y}, {x: 560, y: ROUTE_Y}),
  descent,
  line({x: x1, y: y0}, {x: x1, y: SELECTED_CENTER.y}),
  line({x: x1, y: SELECTED_CENTER.y}, SELECTED_CENTER),
]);

/** Drawn length of the main stroke at a frame. */
export const mainLength = (f: number) =>
  f < T.planDraw.from
    ? MAIN_PAUSE * progress(f, T.routeIn.from, T.routeIn.to - T.routeIn.from, EASE_OUT)
    : lerp(MAIN_PAUSE, MAIN.length, progress(f, T.planDraw.from, T.planDraw.to - T.planDraw.from, EASE_IN_OUT));

// ── Camera ───────────────────────────────────────────────────────────────────────────────────────
export type Camera = {s: number; cx: number; cy: number};

export const cameraAt = (f: number): Camera => {
  const t = progress(f, CAMERA.from, CAMERA.to - CAMERA.from, EASE_IN_OUT);
  return {
    s: lerp(CAMERA.startScale, 1, t),
    cx: lerp(CAMERA.startCenter.x, CAMERA.endCenter.x, t),
    cy: lerp(CAMERA.startCenter.y, CAMERA.endCenter.y, t),
  };
};

export const toScreen = (c: Camera, p: Pt): Pt => ({x: (p.x - c.cx) * c.s + WIDTH / 2, y: (p.y - c.cy) * c.s + HEIGHT / 2});

export const cameraTransform = (c: Camera) => `translate(${WIDTH / 2} ${HEIGHT / 2}) scale(${c.s}) translate(${-c.cx} ${-c.cy})`;

// ── Tilo: a rigid layer — position, uniform scale, propeller only ───────────────────────────────
const ARRIVE = Easing.bezier(0.2, 0.75, 0.25, 1); // glide in, long settle, no overshoot
const ENTRY_OFFSET = 900;

/** World position of the logo canvas origin and its scale. */
export const tiloAt = (f: number): {o: Pt; k: number} => {
  const enter = progress(f, T.tiloIn.from, T.tiloIn.to - T.tiloIn.from, ARRIVE);
  const drift = DRIFT * progress(f, T.tiloIn.to, T.glide.from - T.tiloIn.to, EASE_IN_OUT);
  // Gentle bob while holding, faded in and out so the glide starts from rest.
  const env = Math.min(progress(f, T.tiloIn.to, 20, EASE_IN_OUT), 1 - progress(f, T.glide.from - 20, 20, EASE_IN_OUT));
  const bob = 3 * env * Math.sin(((f - T.tiloIn.to) / 48) * Math.PI * 2);
  const hold = {
    x: HOLD_ORIGIN.x - ENTRY_OFFSET * (1 - enter) + drift,
    y: HOLD_ORIGIN.y + 40 * (1 - enter) + bob,
  };
  const g = progress(f, T.glide.from, T.glide.to - T.glide.from, EASE_IN_OUT);
  return {
    o: {x: lerp(hold.x, LOCKUP_ORIGIN.x, g), y: lerp(hold.y, LOCKUP_ORIGIN.y, g)},
    k: lerp(FLIGHT_SCALE, LOCKUP_SCALE, g),
  };
};

/** Speed lines: they leave Tilo as the route takes over, and return as he lands on the logo. */
export const speedLinesAt = (f: number) => {
  const out = progress(f, T.speedLinesOut.from, T.speedLinesOut.to - T.speedLinesOut.from, EASE_IN_OUT);
  const back = progress(f, T.speedLinesIn.from, T.speedLinesIn.to - T.speedLinesIn.from, EASE_OUT);
  const opacity = f < T.speedLinesIn.from ? 1 - out : back;
  const dx = f < T.speedLinesIn.from ? -60 * out : -40 * (1 - back); // source px, trailing backwards
  return {opacity, dx};
};
