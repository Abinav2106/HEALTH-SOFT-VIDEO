import React from 'react';
import {COLORS, ROOM, STROKE} from '../constants';
import {project, pts, Vec} from '../lib/motion';

// One coherent workspace in a fixed oblique projection. Each element is an editable <g> and takes an
// entrance (opacity, rise, scale settle about its own floor anchor) so the room can assemble.

export type Entrance = {opacity: number; rise: number; scale: number};
export const SHOWN: Entrance = {opacity: 1, rise: 0, scale: 1};

const O = COLORS.navy;
const SW = STROKE.room;

const Settle: React.FC<{e: Entrance; anchor: Vec; id: string; children: React.ReactNode}> = ({e, anchor, id, children}) =>
  e.opacity <= 0 ? null : (
    <g
      id={id}
      opacity={e.opacity}
      transform={`translate(${anchor.x} ${anchor.y + e.rise}) scale(${e.scale}) translate(${-anchor.x} ${-anchor.y})`}
    >
      {children}
    </g>
  );

/** Visible faces (front, top, right) of an axis-aligned box. */
export const Box: React.FC<{
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  z0: number;
  z1: number;
  front: string;
  top: string;
  side: string;
  sw?: number;
}> = ({x0, x1, y0, y1, z0, z1, front, top, side, sw = SW}) => {
  const P = project;
  return (
    <g strokeLinejoin="round">
      <polygon points={pts([P(x0, y1, z0), P(x1, y1, z0), P(x1, y0, z0), P(x0, y0, z0)])} fill={front} stroke={O} strokeWidth={sw} />
      <polygon points={pts([P(x1, y1, z0), P(x1, y1, z1), P(x1, y0, z1), P(x1, y0, z0)])} fill={side} stroke={O} strokeWidth={sw} />
      <polygon points={pts([P(x0, y1, z0), P(x0, y1, z1), P(x1, y1, z1), P(x1, y1, z0)])} fill={top} stroke={O} strokeWidth={sw} />
    </g>
  );
};

export const Floor: React.FC<{e: Entrance}> = ({e}) => {
  const {x0, x1, z0, z1, thickness: t} = ROOM.floor;
  return (
    <Settle e={e} id="room-floor" anchor={project((x0 + x1) / 2, 0, (z0 + z1) / 2)}>
      <Box x0={x0} x1={x1} y0={-t} y1={0} z0={z0} z1={z1} front={COLORS.floorEdge} top={COLORS.floorTop} side={COLORS.floorEdge} />
    </Settle>
  );
};

// ── Doorway: far jamb, header, threshold and glass leaf behind the plane; near jamb in front ──
const Jamb: React.FC<{z: number; h: number}> = ({z, h}) => {
  const a = project(0, 0, z);
  const b = project(0, h, z);
  return (
    <>
      <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={O} strokeWidth={ROOM.door.jamb + SW * 2} strokeLinecap="round" />
      <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={COLORS.cyanPale} strokeWidth={ROOM.door.jamb} strokeLinecap="round" />
    </>
  );
};

/** Glass leaf hinged on the far jamb, swinging outward (−X) by `open` (0 closed … 1 = 84°). */
const Leaf: React.FC<{open: number}> = ({open}) => {
  const {z0, z1, height} = ROOM.door;
  const w = z1 - z0 - 10;
  const th = (open * 84 * Math.PI) / 180;
  const hz = z1 - 5;
  const fx = -Math.sin(th) * w;
  const fz = hz - Math.cos(th) * w;
  const bot = 8;
  const top = height - 10;
  const P = project;
  const corners = [P(0, bot, hz), P(0, top, hz), P(fx, top, fz), P(fx, bot, fz)];
  const handleA = P(fx * 0.86, height * 0.42, hz + (fz - hz) * 0.86);
  const handleB = P(fx * 0.86, height * 0.58, hz + (fz - hz) * 0.86);
  const sheenA = P(fx * 0.3, top * 0.82, hz + (fz - hz) * 0.3);
  const sheenB = P(fx * 0.62, top * 0.58, hz + (fz - hz) * 0.62);
  return (
    <g id="room-door-leaf">
      <polygon points={pts(corners)} fill={COLORS.glass} stroke={O} strokeWidth={SW} strokeLinejoin="round" />
      <line x1={sheenA.x} y1={sheenA.y} x2={sheenB.x} y2={sheenB.y} stroke={COLORS.white} strokeWidth={6} strokeLinecap="round" opacity={0.9} />
      <line x1={handleA.x} y1={handleA.y} x2={handleB.x} y2={handleB.y} stroke={O} strokeWidth={5} strokeLinecap="round" />
    </g>
  );
};

export const DoorBack: React.FC<{e: Entrance; open: number}> = ({e, open}) => {
  const {z0, z1, height} = ROOM.door;
  const h0 = project(0, height, z0);
  const h1 = project(0, height, z1);
  return (
    <Settle e={e} id="room-door-back" anchor={project(0, 0, (z0 + z1) / 2)}>
      <Leaf open={open} />
      <Jamb z={z1} h={height} />
      <line x1={h0.x} y1={h0.y} x2={h1.x} y2={h1.y} stroke={O} strokeWidth={ROOM.door.jamb + SW * 2} strokeLinecap="round" />
      <line x1={h0.x} y1={h0.y} x2={h1.x} y2={h1.y} stroke={COLORS.cyanPale} strokeWidth={ROOM.door.jamb} strokeLinecap="round" />
    </Settle>
  );
};

export const DoorFront: React.FC<{e: Entrance}> = ({e}) => {
  const {z0, z1, height} = ROOM.door;
  const h0 = project(0, height, z0);
  return (
    <Settle e={e} id="room-door-front" anchor={project(0, 0, (z0 + z1) / 2)}>
      <Jamb z={z0} h={height} />
      {/* repaint the header's near end so the joint reads as one frame */}
      <circle cx={h0.x} cy={h0.y} r={ROOM.door.jamb / 2} fill={COLORS.cyanPale} />
    </Settle>
  );
};

export const Plant: React.FC<{e: Entrance}> = ({e}) => {
  const {x, z} = ROOM.plant;
  const base = project(x, 0, z);
  const leaf = (rot: number, len: number, fill: string, key: string) => (
    <path
      key={key}
      d={`M 0 0 C ${-len * 0.34} ${-len * 0.3} ${-len * 0.26} ${-len * 0.8} 0 ${-len} C ${len * 0.26} ${-len * 0.8} ${len * 0.34} ${-len * 0.3} 0 0 Z`}
      transform={`rotate(${rot})`}
      fill={fill}
      stroke={O}
      strokeWidth={SW}
      strokeLinejoin="round"
    />
  );
  return (
    <Settle e={e} id="room-plant" anchor={base}>
      <g transform={`translate(${base.x} ${base.y})`}>
        <ellipse cx={0} cy={-2} rx={34} ry={9} fill={COLORS.shadow} opacity={0.06} />
        <g id="room-plant-leaves" transform="translate(0 -62)">
          {leaf(-44, 98, COLORS.leafDeep, 'a')}
          {leaf(40, 102, COLORS.leafDeep, 'b')}
          {leaf(-20, 128, COLORS.leaf, 'c')}
          {leaf(18, 124, COLORS.leaf, 'd')}
          {leaf(0, 146, COLORS.leaf, 'e')}
        </g>
        <path id="room-plant-pot" d="M -30 -70 L 30 -70 L 24 -2 C 24 2 -24 2 -24 -2 Z" fill={COLORS.pot} stroke={O} strokeWidth={SW} strokeLinejoin="round" />
        <rect x={-34} y={-78} width={68} height={14} rx={4} fill={COLORS.pot} stroke={O} strokeWidth={SW} />
      </g>
    </Settle>
  );
};

export const Chair: React.FC<{e: Entrance}> = ({e}) => {
  const {x, z} = ROOM.chair;
  const P = project;
  const base = P(x, 0, z);
  const seatY = 84;
  const hub = P(x, 16, z);
  const post = P(x, seatY - 6, z);
  const feet = [-1, 1].map((s) => P(x + s * 34, 6, z));
  const feetZ = [-1, 1].map((s) => P(x, 6, z + s * 30));
  return (
    <Settle e={e} id="room-chair" anchor={base}>
      <g id="room-chair-base" stroke={O} strokeLinecap="round">
        {[...feet, ...feetZ].map((f, i) => (
          <line key={i} x1={hub.x} y1={hub.y} x2={f.x} y2={f.y} strokeWidth={6} />
        ))}
        <line x1={hub.x} y1={hub.y} x2={post.x} y2={post.y} strokeWidth={8} />
        {[...feet, ...feetZ].map((f, i) => (
          <circle key={`w${i}`} cx={f.x} cy={f.y + 3} r={5} fill={O} strokeWidth={0} />
        ))}
      </g>
      <g id="room-chair-back">
        <Box x0={x - 30} x1={x + 30} y0={seatY + 18} y1={seatY + 92} z0={z + 22} z1={z + 30} front={COLORS.cyan} top={COLORS.cyan} side={COLORS.cyanDeep} />
      </g>
      <g id="room-chair-seat">
        <Box x0={x - 32} x1={x + 32} y0={seatY - 8} y1={seatY + 6} z0={z - 28} z1={z + 26} front={COLORS.cyanDeep} top={COLORS.cyan} side={COLORS.cyanDeep} />
      </g>
    </Settle>
  );
};

export const Desk: React.FC<{e: Entrance}> = ({e}) => {
  const {x0, x1, z0, z1, height: h, top: t} = ROOM.desk;
  const leg = (x: number, z: number, key: string) => (
    <Box key={key} x0={x} x1={x + 9} y0={0} y1={h - t} z0={z} z1={z + 9} front={COLORS.metal} top={COLORS.metal} side="#AEB9C4" sw={2.5} />
  );
  return (
    <Settle e={e} id="room-desk" anchor={project((x0 + x1) / 2, 0, (z0 + z1) / 2)}>
      <ellipse cx={project((x0 + x1) / 2, 0, (z0 + z1) / 2).x} cy={project((x0 + x1) / 2, 0, (z0 + z1) / 2).y} rx={130} ry={22} fill={COLORS.shadow} opacity={0.05} />
      {leg(x0 + 8, z1 - 18, 'bl')}
      {leg(x1 - 17, z1 - 18, 'br')}
      <g id="room-desk-drawer">
        <Box x0={x1 - 74} x1={x1 - 10} y0={h - t - 56} y1={h - t} z0={z0 + 10} z1={z1 - 12} front={COLORS.wood} top={COLORS.wood} side={COLORS.woodSide} />
      </g>
      {leg(x0 + 8, z0 + 8, 'fl')}
      {leg(x1 - 17, z0 + 8, 'fr')}
      <g id="room-desk-top">
        <Box x0={x0} x1={x1} y0={h - t} y1={h} z0={z0} z1={z1} front={COLORS.woodSide} top={COLORS.wood} side={COLORS.woodSide} />
      </g>
    </Settle>
  );
};

export const Laptop: React.FC<{e: Entrance}> = ({e}) => {
  const {x, z, w, d, screenH} = ROOM.laptop;
  const y = ROOM.desk.height;
  const P = project;
  const x0 = x - w / 2;
  const x1 = x + w / 2;
  const back = z + d / 2;
  const lean = 10; // screen leans back
  const scr = [P(x0, y + 3, back), P(x0, y + screenH, back + lean), P(x1, y + screenH, back + lean), P(x1, y + 3, back)];
  const inset = (p: Vec, q: Vec, t: number): Vec => ({x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t});
  const disp = [inset(scr[0], scr[2], 0.12), inset(scr[1], scr[3], 0.12), inset(scr[2], scr[0], 0.12), inset(scr[3], scr[1], 0.12)];
  const l1 = [P(x0 + 12, y + 34, back + 6), P(x0 + 44, y + 34, back + 6)];
  const l2 = [P(x0 + 12, y + 25, back + 4.5), P(x0 + 34, y + 25, back + 4.5)];
  return (
    <Settle e={e} id="room-laptop" anchor={P(x, y, z)}>
      <polygon points={pts(scr)} fill={COLORS.metal} stroke={O} strokeWidth={SW} strokeLinejoin="round" />
      <polygon points={pts(disp)} fill={COLORS.cyanPale} stroke={O} strokeWidth={1.8} strokeLinejoin="round" />
      {[l1, l2].map((l, i) => (
        <line key={i} x1={l[0].x} y1={l[0].y} x2={l[1].x} y2={l[1].y} stroke={COLORS.cyan} strokeWidth={4} strokeLinecap="round" />
      ))}
      <Box x0={x0 - 4} x1={x1 + 4} y0={y} y1={y + 4} z0={z - d / 2} z1={back + 2} front="#AEB9C4" top={COLORS.metal} side="#AEB9C4" sw={2.5} />
    </Settle>
  );
};
