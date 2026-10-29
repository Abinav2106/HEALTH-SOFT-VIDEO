import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COLORS, ROOM} from './constants';
import {project} from './lib/motion';
import {Plane, PLANE, PlaneState} from './components/Plane';
import {Bone} from './components/Props';
import {restPose, Tilo, TiloPose} from './components/Tilo';
import {Chair, Desk, DoorBack, DoorFront, Floor, Laptop, Plant, SHOWN} from './components/Workspace';

// Static turnaround of every editable layer at rest — a review sheet, not part of the film.

const parked: PlaneState = {pitch: 0, roll: 0, compress: 0, propAngle: 0.5, propBlur: 0};

const seated = (x: number, y: number): TiloPose => ({
  ...restPose,
  x,
  y,
  armNear: {upper: -50, lower: -95},
  armFar: {upper: -60, lower: -90},
  legNear: {upper: -95, lower: 25},
  legFar: {upper: -95, lower: 25},
});

export const ModelSheet: React.FC = () => {
  const b = project(ROOM.bone.x, ROOM.desk.height + 5, ROOM.bone.z);
  return (
    <AbsoluteFill style={{background: COLORS.bg}}>
      <svg width={1080} height={1350} viewBox="0 0 1080 1350">
        <g transform="translate(40 -20) scale(0.62)">
          <g transform="translate(-120 -420)">
            <Floor e={SHOWN} />
            <DoorBack e={SHOWN} open={1} />
            <Plant e={SHOWN} />
            <Chair e={SHOWN} />
            <Desk e={SHOWN} />
            <Laptop e={SHOWN} />
            <Bone x={b.x} y={b.y} rotate={-8} />
            <DoorFront e={SHOWN} />
          </g>
        </g>
        <g transform="translate(160 1180)">
          <Plane state={parked} layer="back" />
          <g transform={`translate(${PLANE.seat.x} ${PLANE.seat.y})`}>
            <Tilo pose={seated(0, 0)} parts="body" id="sheet-seated" />
          </g>
          <Plane state={{...parked, propBlur: 0}} layer="front" />
          <g transform={`translate(${PLANE.seat.x} ${PLANE.seat.y})`}>
            <Tilo pose={seated(0, 0)} parts="nearArm" id="sheet-seated" />
          </g>
        </g>
        <g transform="translate(480 1180)">
          <Plane state={{...parked, propBlur: 1, propAngle: 1.2}} layer="back" />
          <Plane state={{...parked, propBlur: 1, propAngle: 1.2}} layer="front" />
        </g>
        <g transform="translate(300 960) scale(2.6)">
          <Tilo pose={{...restPose}} id="sheet-standing" />
        </g>
        <g transform="translate(760 960) scale(2.6)">
          <Tilo pose={{...restPose, mouthOpen: 1, smile: 1, pupil: 1.1, gazeX: 0, armNear: {upper: -100, lower: -150}, grip: 1}} id="sheet-delight" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
