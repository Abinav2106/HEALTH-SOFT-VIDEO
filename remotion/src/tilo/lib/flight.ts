import {Easing, interpolate} from 'remotion';
import {FPS, type TiloConfig} from '../config';

// The flight is integrated once, frame by frame, from the speed / turn-rate / altitude keys:
// a single world-space path for all six beats. Everything is a pure function of the config,
// so preview and render produce identical frames.

export type FlightSample = {
  x: number;
  z: number;
  y: number; // altitude
  heading: number; // radians, 0 = north (−z), + = clockwise (right)
  speed: number;
  bank: number; // degrees, + = right wing down
  camHeading: number; // lagged heading used to place the camera
  camYaw: number; // further-lagged heading the camera looks along (follow-through)
};

export type Flight = {
  samples: FlightSample[];
  destination: {x: number; z: number};
};

type Key = {frame: number; value: number};

const keyed = (keys: Key[], f: number, smooth: boolean) =>
  interpolate(
    f,
    keys.map((k) => k.frame),
    keys.map((k) => k.value),
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: smooth ? Easing.inOut(Easing.sin) : undefined,
    },
  );

export const fwd = (h: number) => ({x: Math.sin(h), z: -Math.cos(h)});

export const computeFlight = (config: TiloConfig): Flight => {
  const {path, aircraft, camera} = config;
  const deg = Math.PI / 180;
  const samples: FlightSample[] = [];
  let x = 0;
  let z = 0;
  let heading = 0;
  let camHeading = 0;
  let camYaw = 0;
  const lastFrame = config.shots.s06[1];
  for (let f = 0; f <= lastFrame; f++) {
    const speed = keyed(path.speed, f, true) * path.worldRate;
    const turn = keyed(path.turnRate, f, false); // linear ramps: bank eases in over the ramp length
    const y = keyed(path.altitude, f, true);
    if (f > 0) {
      heading += (turn * deg) / FPS;
      const d = fwd(heading);
      x += (d.x * speed) / FPS;
      z += (d.z * speed) / FPS;
      camHeading += (heading - camHeading) * camera.headingLag;
      camYaw += (camHeading - camYaw) * camera.yawLag;
    }
    const bank = Math.max(-aircraft.maxBankDeg, Math.min(aircraft.maxBankDeg, turn * aircraft.bankPerTurnRate));
    samples.push({x, z, y, heading, speed, bank, camHeading, camYaw});
  }
  const end = samples[samples.length - 1];
  const d = fwd(end.heading);
  return {
    samples,
    destination: {x: end.x + d.x * path.destinationAhead, z: end.z + d.z * path.destinationAhead},
  };
};

/** Sample at a fractional master frame (linear between integrated frames). */
export const sampleAt = (flight: Flight, t: number): FlightSample => {
  const s = flight.samples;
  const i = Math.max(0, Math.min(s.length - 1, Math.floor(t)));
  const j = Math.min(s.length - 1, i + 1);
  const a = Math.max(0, Math.min(1, t - i));
  if (a === 0 || i === j) return s[i];
  const A = s[i];
  const B = s[j];
  const mix = (p: number, q: number) => p + (q - p) * a;
  return {
    x: mix(A.x, B.x),
    z: mix(A.z, B.z),
    y: mix(A.y, B.y),
    heading: mix(A.heading, B.heading),
    speed: mix(A.speed, B.speed),
    bank: mix(A.bank, B.bank),
    camHeading: mix(A.camHeading, B.camHeading),
    camYaw: mix(A.camYaw, B.camYaw),
  };
};
