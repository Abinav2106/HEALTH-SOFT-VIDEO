import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {COLORS, HEIGHT, PLANE_SCALE, T, WIDTH} from './constants';
import {scene} from './choreography';
import {loadCardFont} from './lib/fonts';
import {Plane} from './components/Plane';
import {GoldenSpark} from './components/GoldenSpark';
import {Glint, MotionStrokes, Particles, RewardCard, Shadow, Sparkle} from './components/Props';
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
  // Exactly one collectible spark. Until Tilo steps out it sits on the desk layer; from then on it is
  // drawn in front of both arms, so his paws cup it without ever covering its silhouette.
  const inFront = s.tiloFree !== null;
  const spark = <GoldenSpark x={s.spark.x} y={s.spark.y} size={s.spark.size} glow={s.spark.glow} opacity={s.spark.opacity} id="golden-spark" />;
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
          {!inFront ? spark : null}
          <Glint {...s.glint} />
          <Glint {...s.sparkGlint} id="spark-glint" />
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
              <Tilo pose={s.tiloFree} parts="nearArm" />
              {spark}
            </g>
          ) : null}

          <DoorFront e={room.door} />
          <Particles {...s.particles} />
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
