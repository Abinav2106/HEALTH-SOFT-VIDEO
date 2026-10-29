import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {COLORS, HEIGHT, PLANE_SCALE, T, WIDTH} from './constants';
import {scene} from './choreography';
import {loadCardFont} from './lib/fonts';
import {Plane} from './components/Plane';
import {Bone, Glint, MotionStrokes, RewardCard, Shadow, Sparkle} from './components/Props';
import {Tilo} from './components/Tilo';
import {Chair, Desk, DoorBack, DoorFront, Floor, Laptop, Plant} from './components/Workspace';

loadCardFont();

export type TiloRewardProps = {sound: boolean};

// Quiet, optional sound layer; the film reads completely without it.
const SFX: {file: string; at: number; volume: number}[] = [
  {file: 'whoosh', at: 0, volume: 0.32},
  {file: 'tap', at: T.contact, volume: 0.42},
  {file: 'chime', at: T.pickup, volume: 0.3},
  {file: 'confirm', at: T.check, volume: 0.32},
];

export const TiloReward: React.FC<TiloRewardProps> = ({sound}) => {
  const f = useCurrentFrame();
  const s = scene(f);
  const {plane, room} = s;
  const held = s.tiloFree !== null && f >= T.pickup;
  const bone = <Bone x={s.bone.x} y={s.bone.y} rotate={s.bone.rot} scale={s.bone.scale} />;
  const cam = s.camera;

  return (
    <AbsoluteFill style={{background: COLORS.bg}}>
      <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        <g id="camera" transform={`translate(${cam.cx} ${cam.cy}) scale(${cam.scale}) translate(${-cam.cx} ${-cam.cy})`}>
          <g id="workspace-back">
            <Floor e={room.floor} />
            <Shadow {...s.shadow} />
            <DoorBack e={room.door} open={room.doorOpen} />
            <Plant e={room.plant} />
            <Chair e={room.chair} />
            <Desk e={room.desk} />
            <Laptop e={room.laptop} />
          </g>
          {!held ? <g opacity={s.bone.opacity}>{bone}</g> : null}
          <Glint {...s.glint} />
          <Glint {...s.boneGlint} />
          <MotionStrokes {...s.strokes} />
          {s.tiloShadow ? <Shadow {...s.tiloShadow} /> : null}

          <g id="plane" transform={`translate(${plane.origin.x} ${plane.origin.y}) scale(${PLANE_SCALE}) rotate(${plane.state.pitch} 0 -64)`}>
            <Plane state={plane.state} layer="back" />
            {s.tiloLocal ? (
              <g transform={`translate(0 ${plane.state.compress * 5})`}>
                <Tilo pose={s.tiloLocal} parts="body" />
              </g>
            ) : null}
            <Plane state={plane.state} layer="front" />
            {s.tiloLocal ? (
              <g transform={`translate(0 ${plane.state.compress * 5})`}>
                <Tilo pose={s.tiloLocal} parts="nearArm" />
              </g>
            ) : null}
          </g>

          {s.tiloFree ? (
            <g id="tilo-free">
              <Tilo pose={s.tiloFree} parts="body" />
              {held ? bone : null}
              <Tilo pose={s.tiloFree} parts="nearArm" />
            </g>
          ) : null}

          <DoorFront e={room.door} />
          <Sparkle id="pickup-sparkle" {...s.pickupSparkle} size={11} />
          {s.sparkles.map((sp, i) => (
            <Sparkle key={i} id={`reward-sparkle-${i + 1}`} x={sp.x} y={sp.y} size={sp.size} t={sp.t} rotate={sp.rotate} />
          ))}
        </g>
        <RewardCard {...s.card} />
      </svg>
      {sound
        ? SFX.map((c) => (
            <Sequence key={c.file} from={c.at} layout="none">
              <Audio src={staticFile(`tilo/sfx/${c.file}.wav`)} volume={c.volume} />
            </Sequence>
          ))
        : null}
    </AbsoluteFill>
  );
};
