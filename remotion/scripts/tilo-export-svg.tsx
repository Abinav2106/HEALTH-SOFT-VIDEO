// Export Tilo's editable vector layers as standalone SVGs (every part keeps its named <g id>):
//   npm run tilo:svg   → ../tilo/assets/*.svg
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import fs from 'node:fs';
import path from 'node:path';
import {scene} from '../src/tilo/choreography';
import {CARD, COLORS, HEIGHT, PLANE_SCALE, WIDTH} from '../src/tilo/constants';
import {Plane} from '../src/tilo/components/Plane';
import {GoldenSpark} from '../src/tilo/components/GoldenSpark';
import {RewardCard, Sparkle} from '../src/tilo/components/Props';
import {restPose, Tilo} from '../src/tilo/components/Tilo';
import {Chair, Desk, DoorBack, DoorFront, Floor, Laptop, Plant, SHOWN} from '../src/tilo/components/Workspace';

const out = path.resolve('../tilo/assets');
fs.mkdirSync(out, {recursive: true});

const write = (name: string, vb: [number, number, number, number], node: React.ReactNode) => {
  const svg = renderToStaticMarkup(
    <svg xmlns="http://www.w3.org/2000/svg" viewBox={vb.join(' ')} width={vb[2]} height={vb[3]}>
      {node}
    </svg>,
  );
  fs.writeFileSync(path.join(out, name), `<?xml version="1.0" encoding="UTF-8"?>\n${svg}\n`);
  console.log('wrote', path.join(out, name));
};

const parked = {pitch: 0, roll: 0, compress: 0, propAngle: 0.35, propBlur: 0};

write('tilo-standing.svg', [-80, -200, 200, 290], <Tilo pose={{...restPose, x: 0, y: 0, s: 1}} id="tilo" />);
write(
  'tilo-delighted.svg',
  [-80, -200, 200, 290],
  <Tilo pose={{...restPose, x: 0, y: 0, s: 1, mouthOpen: 0.95, smile: 1, gazeX: 0.2, armNear: {upper: -60, lower: -150}}} id="tilo" />,
);
write(
  'plane.svg',
  [-170, -160, 340, 180],
  <g id="plane">
    <Plane state={parked} layer="back" />
    <Plane state={parked} layer="front" />
  </g>,
);
write('golden-spark.svg', [-60, -60, 120, 120], <GoldenSpark x={0} y={0} />);
write('golden-spark-card-icon.svg', [-34, -34, 68, 68], <GoldenSpark x={0} y={0} size={56} halo={0.7} outline={2.4} id="reward-card-spark" />);
write('sparkle.svg', [-20, -20, 40, 40], <Sparkle x={0} y={0} size={16} t={1} />);
write(
  'reward-card.svg',
  [CARD.cx - CARD.w / 2 - 12, CARD.cy - CARD.h / 2 - 12, CARD.w + 24, CARD.h + 34],
  <RewardCard rise={0} scale={1} opacity={1} check={1} />,
);
write(
  'workspace.svg',
  [0, 0, WIDTH, HEIGHT],
  <g id="workspace">
    <Floor e={SHOWN} />
    <DoorBack e={SHOWN} open={1} />
    <Plant e={SHOWN} />
    <Chair e={SHOWN} />
    <Desk e={SHOWN} />
    <Laptop e={SHOWN} />
    <DoorFront e={SHOWN} />
  </g>,
);

// The finished frame (f149), assembled from the same layers as the film.
const s = scene(149);
const p = s.plane;
write(
  'tilo-final-frame.svg',
  [0, 0, WIDTH, HEIGHT],
  <g>
    <rect width={WIDTH} height={HEIGHT} fill={COLORS.bg} />
    <Floor e={SHOWN} />
    <DoorBack e={SHOWN} open={1} />
    <Plant e={SHOWN} />
    <Chair e={SHOWN} />
    <Desk e={SHOWN} />
    <Laptop e={SHOWN} />
    <g id="plane" transform={`translate(${p.origin.x} ${p.origin.y}) scale(${PLANE_SCALE})`}>
      <Plane state={p.state} layer="back" />
      <Plane state={p.state} layer="front" />
    </g>
    <Tilo pose={s.tiloFree!} parts="body" />
    <Tilo pose={s.tiloFree!} parts="nearArm" />
    <GoldenSpark x={s.spark.x} y={s.spark.y} size={s.spark.size} glow={s.spark.glow} id="golden-spark" />
    <DoorFront e={SHOWN} />
    {s.sparkles.map((sp, i) => (
      <Sparkle key={i} id={`reward-sparkle-${i + 1}`} x={sp.x} y={sp.y} size={sp.size} t={1} rotate={sp.rotate} />
    ))}
    <RewardCard rise={0} scale={1} opacity={1} check={1} />
  </g>,
);
