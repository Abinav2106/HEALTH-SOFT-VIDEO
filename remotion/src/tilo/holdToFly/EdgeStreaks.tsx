import React from 'react';
import {AbsoluteFill} from 'remotion';
import {HEIGHT, WIDTH} from '../config';
import {smoothstep, useT} from '../lib/timeline';
import {useFlightCamera} from '../components/FlightCamera';
import {useHold} from './useHold';

// Restrained speed cue confined to the outer ~60 px of each side. Opacity follows the actual
// flight speed, so it settles away on arrival. Deterministic (hashed per streak).

const h = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export const EdgeStreaks: React.FC = () => {
  const c = useHold();
  const t = useT();
  const cam = useFlightCamera();
  const {opacity, count, until} = c.hold.edgeStreaks;
  const cruise = Math.max(...c.path.speed.map((k) => k.value)) * c.path.worldRate;
  const fade = (cam.sample.speed / cruise) * (1 - smoothstep(until - 20, until, t));
  if (fade <= 0.01) return null;
  const streaks = [];
  for (const side of [0, 1]) {
    for (let i = 0; i < count; i++) {
      const id = side * 100 + i;
      const period = 16 + h(id) * 10;
      const len = 150 + h(id + 7) * 120;
      const p = ((t + h(id + 3) * period) % period) / period;
      const inset = 8 + h(id + 11) * 50 + p * 18; // drifts outward as it falls
      streaks.push(
        <div
          key={id}
          style={{
            position: 'absolute',
            [side ? 'right' : 'left']: inset,
            top: -len + p * (HEIGHT * 0.75 + len) + HEIGHT * 0.2,
            width: 3,
            height: len,
            borderRadius: 2,
            background: 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0.95))',
            opacity: opacity * fade * Math.sin(p * Math.PI),
          }}
        />,
      );
    }
  }
  return <AbsoluteFill style={{width: WIDTH, height: HEIGHT, pointerEvents: 'none'}}>{streaks}</AbsoluteFill>;
};
