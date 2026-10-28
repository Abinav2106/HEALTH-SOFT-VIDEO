import React from 'react';
import {interpolateColors, useCurrentFrame} from 'remotion';
import {COLORS, DOORS, FONT_LABEL, FURNITURE_WEIGHT, HEIGHT, PLAN, ROUTE_WEIGHT, SELECTED, SELECTED_CENTER, T, WIDTH} from '../constants';
import {EASE_IN_OUT, EASE_OUT, lerp, mix, progress} from '../../video06/lib/motion';
import {pathUpTo, pointAt} from '../lib/route';
import {BRANCHES, Camera, LIGHT, MAIN, cameraTransform, mainLength} from '../lib/scene';

// Furniture is drawn on with pathLength=1 dashes; each room has its own window.
type Room = 'desk' | 'cabin' | 'meeting';
const DRAW: Record<Room, {from: number; to: number}> = {
  desk: {from: T.furniture.from, to: T.furniture.from + 24},
  meeting: {from: T.furniture.from + 6, to: T.furniture.from + 30},
  cabin: {from: T.furniture.from + 14, to: T.furniture.to},
};

const Draw: React.FC<{t: number; children: React.ReactElement<React.SVGProps<SVGElement>>}> = ({t, children}) =>
  t <= 0
    ? null
    : React.cloneElement(children, {pathLength: 1, strokeDasharray: '1 1', strokeDashoffset: 1 - t} as React.SVGProps<SVGElement>);

const Furniture: React.FC<{room: Room; frame: number}> = ({room, frame}) => {
  const w = DRAW[room];
  const t = (i: number) => progress(frame, w.from + i * 3, w.to - w.from - 6, EASE_IN_OUT);
  if (room === 'desk') {
    return (
      <>
        <Draw t={t(0)}><rect x={245} y={830} width={160} height={62} rx={6} /></Draw>
        <Draw t={t(1)}><rect x={295} y={842} width={60} height={10} rx={3} /></Draw>
        <Draw t={t(2)}><circle cx={325} cy={932} r={24} /></Draw>
        <Draw t={t(3)}><circle cx={468} cy={1072} r={18} /></Draw>
        <Draw t={t(4)}><circle cx={468} cy={1072} r={8} /></Draw>
      </>
    );
  }
  if (room === 'cabin') {
    return (
      <>
        <Draw t={t(0)}><rect x={690} y={830} width={150} height={62} rx={6} /></Draw>
        <Draw t={t(1)}><rect x={735} y={842} width={60} height={10} rx={3} /></Draw>
        <Draw t={t(2)}><circle cx={765} cy={932} r={24} /></Draw>
        <Draw t={t(3)}><rect x={580} y={1020} width={84} height={72} rx={14} /></Draw>
        <Draw t={t(4)}><path d="M592 1036 H652" /></Draw>
      </>
    );
  }
  const chairs = [410, 495, 585, 670];
  return (
    <>
      <Draw t={t(0)}><rect x={360} y={SELECTED_CENTER.y - 55} width={360} height={110} rx={55} /></Draw>
      {chairs.map((x, i) => (
        <Draw key={`t${x}`} t={t(1 + i * 0.4)}><circle cx={x} cy={SELECTED_CENTER.y - 90} r={19} /></Draw>
      ))}
      {chairs.map((x, i) => (
        <Draw key={`b${x}`} t={t(1.2 + i * 0.4)}><circle cx={x} cy={SELECTED_CENTER.y + 90} r={19} /></Draw>
      ))}
      <Draw t={t(2.8)}><circle cx={322} cy={SELECTED_CENTER.y} r={19} /></Draw>
      <Draw t={t(3)}><circle cx={758} cy={SELECTED_CENTER.y} r={19} /></Draw>
    </>
  );
};

// Door leaves and swings, the architectural signifier of each opening.
const Doors: React.FC<{frame: number}> = ({frame}) => {
  const t = (i: number) => progress(frame, 136 + i * 4, 16, EASE_IN_OUT);
  const E = DOORS.entrance;
  const DC = DOORS.deskCabin;
  const CM = DOORS.cabinMeeting;
  const r = E.y1 - E.y0;
  return (
    <>
      <Draw t={t(0)}><path d={`M${E.x} ${E.y1} H${E.x - r} A${r} ${r} 0 0 1 ${E.x} ${E.y0}`} /></Draw>
      <Draw t={t(1)}><path d={`M${DC.x} ${DC.y1} H${DC.x + r} A${r} ${r} 0 0 0 ${DC.x} ${DC.y0}`} /></Draw>
      <Draw t={t(2)}><path d={`M${CM.x1} ${CM.y} V${CM.y + r} A${r} ${r} 0 0 1 ${CM.x0} ${CM.y}`} /></Draw>
    </>
  );
};

const Label: React.FC<{x: number; y: number; text: string; t: number}> = ({x, y, text, t}) => (
  <text
    x={x}
    y={y + 8 * (1 - t)}
    opacity={t}
    textAnchor="middle"
    fontFamily={FONT_LABEL}
    fontWeight={600}
    fontSize={19}
    letterSpacing={3}
    fill={COLORS.turquoiseDeep}
    stroke="none"
  >
    {text}
  </text>
);

// 0–6.6 s: the route, the plan it draws, the selection light. 6.6–7.5 s: the chosen room becomes the stage.
export const FloorPlan: React.FC<{camera: Camera}> = ({camera}) => {
  const frame = useCurrentFrame();
  const L = mainLength(frame);

  // After selection: the rest steps back, then everything but the chosen room leaves.
  const dim = mix(frame, [T.othersFade.from, T.othersFade.to], [1, 0.18]);
  const gone = 1 - progress(frame, T.expand.from, 14, EASE_IN_OUT);
  const others = dim * gone;
  const routeOpacity = mix(frame, [T.othersFade.from, T.othersFade.to], [1, 0.5]) * gone;
  const meetingFurniture = 1 - progress(frame, T.expand.from, 12, EASE_IN_OUT);

  // Light: appears at the propeller, travels the route, enters the meeting room.
  const lt = progress(frame, T.light.from, T.light.to - T.light.from, EASE_IN_OUT);
  const lp = pointAt(LIGHT, lt * LIGHT.length);
  const lightIn = progress(frame, T.light.from, 6, EASE_OUT);
  const lightOut = 1 - progress(frame, T.light.to, 12, EASE_IN_OUT);
  const pulse = progress(frame, T.light.to - 2, 22, EASE_OUT);

  // Selected room: warm fill on arrival, then it opens out to the full frame as the stage.
  const fill = progress(frame, T.light.to - 4, 14, EASE_IN_OUT);
  const ex = progress(frame, T.expand.from, T.expand.to - T.expand.from, EASE_IN_OUT);
  const pad = 40;
  const room = {
    x0: lerp(SELECTED.x0, -pad, ex),
    y0: lerp(SELECTED.y0, -pad, ex),
    x1: lerp(SELECTED.x1, WIDTH + pad, ex),
    y1: lerp(SELECTED.y1, HEIGHT + pad, ex),
  };
  const roomFill = interpolateColors(ex, [0, 1], [COLORS.yellowTint, COLORS.stage]);
  const selected = frame >= T.light.to - 4;
  const labelT = (i: number) => progress(frame, 142 + i * 5, 14, EASE_OUT);

  return (
    <svg width={WIDTH} height={HEIGHT} style={{position: 'absolute', inset: 0}}>
      <defs>
        <radialGradient id="gf-glow">
          <stop offset="0%" stopColor={COLORS.yellow} stopOpacity={0.75} />
          <stop offset="45%" stopColor={COLORS.yellow} stopOpacity={0.3} />
          <stop offset="100%" stopColor={COLORS.yellow} stopOpacity={0} />
        </radialGradient>
      </defs>
      <g transform={cameraTransform(camera)} fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* Selected room fill sits under the linework. */}
        {selected ? <rect x={room.x0} y={room.y0} width={room.x1 - room.x0} height={room.y1 - room.y0} fill={roomFill} opacity={fill} /> : null}

        {/* Walls: partitions and the main stroke (route + outer walls). */}
        <g stroke={COLORS.turquoise} strokeWidth={ROUTE_WEIGHT} opacity={others}>
          {BRANCHES.map((b, i) => (
            <path key={i} d={pathUpTo(b.route, L - b.at)} />
          ))}
        </g>
        <g stroke={COLORS.turquoise} strokeWidth={ROUTE_WEIGHT} opacity={routeOpacity}>
          <path d={pathUpTo(MAIN, L)} />
        </g>

        {/* Furniture, doors and labels in deep turquoise, finer. */}
        <g stroke={COLORS.turquoiseDeep} strokeWidth={FURNITURE_WEIGHT}>
          <g opacity={others}>
            <Furniture room="desk" frame={frame} />
            <Furniture room="cabin" frame={frame} />
            <Doors frame={frame} />
            <Label x={(PLAN.x0 + PLAN.splitX) / 2} y={1100} text="DESK" t={labelT(0)} />
            <Label x={(PLAN.splitX + PLAN.x1) / 2} y={1100} text="PRIVATE CABIN" t={labelT(2)} />
          </g>
          <g opacity={meetingFurniture}>
            <Furniture room="meeting" frame={frame} />
            <Label x={SELECTED_CENTER.x} y={1487} text="MEETING ROOM" t={labelT(1)} />
          </g>
        </g>

        {/* The chosen room's own outline: it carries the walls outward as the room becomes the stage. */}
        {selected ? (
          <rect
            x={room.x0}
            y={room.y0}
            width={room.x1 - room.x0}
            height={room.y1 - room.y0}
            stroke={COLORS.turquoise}
            strokeWidth={ROUTE_WEIGHT}
            opacity={progress(frame, T.light.to - 4, 8, EASE_OUT)}
          />
        ) : null}

        {/* The warm pulse as the light settles — the single quiet Diwali note. */}
        {pulse > 0 && pulse < 1 ? (
          <circle cx={SELECTED_CENTER.x} cy={SELECTED_CENTER.y} r={lerp(40, 300, pulse)} fill="url(#gf-glow)" opacity={0.9 * (1 - pulse)} />
        ) : null}

        {frame >= T.light.from && lightOut > 0 ? (
          <g opacity={lightIn * lightOut} transform={`translate(${lp.x} ${lp.y})`}>
            <circle r={78} fill="url(#gf-glow)" />
            <circle r={11} fill={COLORS.yellow} />
            <circle r={4.5} fill="#FFFFFF" opacity={0.9} />
          </g>
        ) : null}
      </g>
    </svg>
  );
};
