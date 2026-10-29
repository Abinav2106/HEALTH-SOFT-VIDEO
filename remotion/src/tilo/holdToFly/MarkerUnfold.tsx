import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Vector3} from 'three';
import {useMarkerScreen} from '../components/DestinationMarker';
import {useFlight} from '../components/FlightCamera';
import {useT} from '../lib/timeline';
import {easeInOut, easeOut, prog, useHold} from './useHold';

// The golden rooftop marker, world-anchored to the destination building. In shot 05 it squeezes
// ~5 %, then its two faces part along the central seam (a clean geometric hinge at the bottom
// vertex) to release the ticket. One thin yellow ring crosses the rooftop.

const INK = '#18222C';

export const MarkerUnfold: React.FC = () => {
  const c = useHold();
  const t = useT();
  const flight = useFlight();
  const m = useMarkerScreen();
  const h = c.hold;

  const squeeze = 1 - 0.05 * prog(t, h.markerCompress, easeOut) * (1 - prog(t, [h.markerOpen[0], h.markerOpen[0] + 6], easeOut));
  const open = prog(t, h.markerOpen, easeInOut);
  const facesOut = 1 - prog(t, [h.ticketLift[0] + 6, h.ticketLift[0] + 22]);
  const opacity = m.opacity * facesOut;

  // Rooftop ring, drawn on the roof plane (projected centre, perspective-squashed ellipse).
  const roofY = c.city.destinationFloors * c.city.floorHeight + 0.7;
  const roof = m.cam.project(new Vector3(flight.destination.x, roofY, flight.destination.z));
  const ringK = prog(t, h.roofRing, easeOut);
  const ringOn = t >= h.roofRing[0] && t <= h.roofRing[1];
  const ringR = ((m.cam.focal * c.city.destinationSize * 0.8) / roof.depth) * ringK;

  const w = m.size * 0.62;
  const hh = m.size;
  const sw = Math.max(1.5, m.size * 0.03);
  const deg = h.markerOpenDeg * open;
  const shift = w * 0.22 * open;
  const glow = open * facesOut;

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {ringOn && (
        <div
          style={{
            position: 'absolute',
            left: roof.x - ringR,
            top: roof.y - ringR * 0.55,
            width: ringR * 2,
            height: ringR * 1.1,
            borderRadius: '50%',
            border: `3px solid ${c.colors.yellow}`,
            opacity: (1 - ringK) * 0.9 * m.opacity,
          }}
        />
      )}
      {opacity > 0.001 && (
        <div style={{position: 'absolute', left: m.x - w / 2, top: m.y - hh / 2, width: w, height: hh, opacity}}>
          {glow > 0 && (
            <div
              style={{
                position: 'absolute',
                left: -w * 0.9,
                top: -hh * 0.35,
                width: w * 2.8,
                height: hh * 1.7,
                borderRadius: '50%',
                background: 'radial-gradient(closest-side, rgba(252,225,98,0.45), rgba(252,225,98,0))',
                opacity: glow,
              }}
            />
          )}
          <svg
            width={w}
            height={hh}
            viewBox={`0 0 ${w} ${hh}`}
            style={{position: 'absolute', inset: 0, overflow: 'visible', transform: `scale(${squeeze})`, transformOrigin: '50% 100%'}}
          >
            {/* Left face: hinges outward around the bottom vertex. */}
            <g transform={`translate(${-shift} 0) rotate(${-deg} ${w / 2} ${hh})`}>
              <polygon points={`${w / 2},0 0,${hh * 0.5} ${w / 2},${hh}`} fill={c.colors.yellow} />
              <polygon points={`${w / 2},0 0,${hh * 0.5} ${w / 2},${hh * 0.5}`} fill="#FFF2B0" />
              <polygon points={`${w / 2},0 0,${hh * 0.5} ${w / 2},${hh}`} fill="none" stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
            </g>
            {/* Right face. */}
            <g transform={`translate(${shift} 0) rotate(${deg} ${w / 2} ${hh})`}>
              <polygon points={`${w / 2},0 ${w},${hh * 0.5} ${w / 2},${hh}`} fill="#EDBE3E" />
              <polygon points={`${w / 2},0 ${w},${hh * 0.5} ${w / 2},${hh}`} fill="none" stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
            </g>
          </svg>
        </div>
      )}
    </AbsoluteFill>
  );
};
