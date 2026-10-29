import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {Vector3} from 'three';
import type {TiloConfig} from '../config';
import {smoothstep, useConfig, useT} from '../lib/timeline';
import {useFlight, useFlightCamera, type CameraFrame} from './FlightCamera';

// Golden diamond above the destination roof. Anchored in world space (projected through the
// flight camera), floating ~7 px, with one approach pulse and two thin rings on arrival.

const DIAMOND_METRES = 4.6;

export const useMarkerScreen = (): {x: number; y: number; size: number; opacity: number; cam: CameraFrame} => {
  const config = useConfig();
  const flight = useFlight();
  const t = useT();
  const cam = useFlightCamera();
  const p = cam.project(new Vector3(flight.destination.x, config.city.markerAltitude, flight.destination.z));
  const float = Math.sin((t / 60) * Math.PI * 2) * 7;
  const size = (cam.focal * DIAMOND_METRES) / p.depth;
  const s06 = config.shots.s06[0];
  const opacity =
    smoothstep(config.timing.markerFadeIn, config.timing.markerFadeIn + 24, t) *
    (1 - smoothstep(s06, s06 + config.timing.sheetSlideFrames, t)) *
    (1 - smoothstep(config.city.fogNear, config.city.fogFar, p.depth));
  return {x: p.x, y: p.y + float, size, opacity: p.depth > 0 ? opacity : 0, cam};
};

const ring = (t: number, start: number, frames: number) => {
  const k = (t - start) / frames;
  if (k < 0 || k > 1) return null;
  const e = 1 - Math.pow(1 - k, 2);
  return {scale: 1 + e * 1.6, opacity: (1 - k) * 0.85};
};

const Diamond: React.FC<{size: number; config: TiloConfig}> = ({size, config}) => {
  const w = size * 0.62;
  const h = size;
  const sw = Math.max(1.5, size * 0.03);
  return (
    <svg width={w + sw * 2} height={h + sw * 2} viewBox={`${-sw} ${-sw} ${w + sw * 2} ${h + sw * 2}`} style={{overflow: 'visible'}}>
      <polygon points={`${w / 2},0 ${w},${h * 0.5} ${w / 2},${h} 0,${h * 0.5}`} fill={config.colors.yellow} />
      <polygon points={`${w / 2},0 ${w},${h * 0.5} ${w / 2},${h}`} fill="#EDBE3E" />
      <polygon points={`${w / 2},0 ${w * 0.5},${h * 0.5} 0,${h * 0.5}`} fill="#FFF2B0" />
      <polygon
        points={`${w / 2},0 ${w},${h * 0.5} ${w / 2},${h} 0,${h * 0.5}`}
        fill="none"
        stroke="#18222C"
        strokeWidth={sw}
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const DestinationMarker: React.FC = () => {
  const config = useConfig();
  const t = useT();
  const m = useMarkerScreen();
  if (m.opacity <= 0.001) return null;
  const rings = [
    ring(t, config.timing.markerApproachPulse, 30),
    ring(t, config.timing.markerFound, 26),
    ring(t, config.timing.markerFound + 8, 26),
  ].filter(Boolean) as {scale: number; opacity: number}[];
  const r0 = m.size * 0.62;
  return (
    <AbsoluteFill style={{opacity: m.opacity, pointerEvents: 'none'}}>
      {rings.map((r, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: m.x - r0 * r.scale,
            top: m.y - r0 * r.scale,
            width: r0 * 2 * r.scale,
            height: r0 * 2 * r.scale,
            borderRadius: '50%',
            border: `${interpolate(r.scale, [1, 2.6], [3.5, 2])}px solid ${config.colors.yellow}`,
            opacity: r.opacity,
          }}
        />
      ))}
      <div style={{position: 'absolute', left: m.x - (m.size * 0.62) / 2, top: m.y - m.size / 2}}>
        <Diamond size={m.size} config={config} />
      </div>
    </AbsoluteFill>
  );
};
