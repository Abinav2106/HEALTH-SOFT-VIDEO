import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {WIDTH} from '../config';
import {useConfig, useT} from '../lib/timeline';
import {useFlightCamera} from './FlightCamera';

// Rear-view Tilo traced from the original aircraft sheet (row 2, column 5: behind-and-above).
// It is one flat illustration, so motion is limited to bob, small bank and scale from the
// camera distance. No rotateY, no invented limb or ear animation (no separate layers exist).

export const TILO_REAR_SRC = 'brand/gofloaters/tilo_rear.svg';
const ASPECT = 580 / 738; // traced artwork height / width

// Propeller disc in the artwork, as fractions of the artwork box.
const PROP = {cx: 0.5, cy: 0.1, rx: 0.115, ry: 0.092};

export const RearViewTiloAircraft: React.FC = () => {
  const config = useConfig();
  const t = useT();
  const cam = useFlightCamera();
  const p = cam.project(cam.tilo);
  const scale = cam.baseDepth / p.depth;
  const w = config.aircraft.widthFraction * WIDTH * scale;
  const h = w * ASPECT;
  const bob = Math.sin((t / config.aircraft.bobPeriodFrames) * Math.PI * 2) * config.aircraft.bobPx;

  // Propeller: fast rotation reads as a soft blur ring around the hub (deterministic angle).
  const spin = t * 1.9;
  const blades = [0, Math.PI].map((o) => {
    const a = spin + o;
    return {x: Math.cos(a), y: Math.sin(a)};
  });

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: p.x - w / 2,
          top: p.y - h / 2 + bob,
          width: w,
          height: h,
          transform: `rotate(${cam.sample.bank}deg)`,
          transformOrigin: '50% 55%',
        }}
      >
        <svg
          width={w}
          height={h}
          viewBox="0 0 1 1"
          preserveAspectRatio="none"
          style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}
        >
          <ellipse cx={PROP.cx} cy={PROP.cy} rx={PROP.rx * 1.45} ry={PROP.ry * 1.42} fill="#FFFFFF" opacity={0.28} />
          {blades.map((b, i) => (
            <line
              key={i}
              x1={PROP.cx}
              y1={PROP.cy}
              x2={PROP.cx + b.x * PROP.rx * 1.45}
              y2={PROP.cy + b.y * PROP.ry * 1.42}
              stroke="#18222C"
              strokeOpacity={0.12}
              strokeWidth={0.018}
              strokeLinecap="round"
            />
          ))}
        </svg>
        <Img src={staticFile(TILO_REAR_SRC)} style={{position: 'absolute', left: 0, top: 0, width: w, height: h}} />
      </div>
    </AbsoluteFill>
  );
};
