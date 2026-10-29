import React from 'react';
import {useConfig, useT, smoothstep} from '../lib/timeline';
import {useFlight, useFlightCamera} from './FlightCamera';

// Compact non-text game UI (as in the storyboard): the arrow points to the destination relative
// to the camera's heading; the yellow ticks turn with the world.

export const GameCompass: React.FC = () => {
  const config = useConfig();
  const flight = useFlight();
  const t = useT();
  const cam = useFlightCamera();
  const {right, top, size} = config.ui.compass;
  const s06 = config.shots.s06[0];
  const opacity = config.ui.compassHideAtReveal ? 1 - smoothstep(s06 - 4, s06 + 8, t) : 1;
  if (opacity <= 0) return null;
  const s = cam.sample;
  const bearing = Math.atan2(flight.destination.x - s.x, -(flight.destination.z - s.z));
  const arrowDeg = ((bearing - s.camYaw) * 180) / Math.PI;
  const worldDeg = (-s.camYaw * 180) / Math.PI;
  const r = size / 2;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`${-r} ${-r} ${size} ${size}`}
      style={{position: 'absolute', right, top, opacity}}
    >
      <circle r={r - 2} fill="#1B2430" fillOpacity={0.9} stroke="#FFFFFF" strokeOpacity={0.35} strokeWidth={3} />
      <g transform={`rotate(${worldDeg})`}>
        {Array.from({length: 12}, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          const big = i % 3 === 0;
          return (
            <circle
              key={i}
              cx={Math.sin(a) * (r - 13)}
              cy={-Math.cos(a) * (r - 13)}
              r={big ? 4 : 2.4}
              fill={config.colors.yellow}
              opacity={big ? 1 : 0.7}
            />
          );
        })}
      </g>
      <g transform={`rotate(${arrowDeg})`}>
        <polygon points={`0,${-r * 0.5} ${r * 0.3},${r * 0.32} 0,${r * 0.16} ${-r * 0.3},${r * 0.32}`} fill="#FFFFFF" />
      </g>
    </svg>
  );
};
