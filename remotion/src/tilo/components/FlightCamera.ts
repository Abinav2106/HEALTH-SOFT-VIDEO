import {createContext, useContext} from 'react';
import {PerspectiveCamera, Vector3} from 'three';
import {HEIGHT, WIDTH, type TiloConfig} from '../config';
import {fwd, sampleAt, type Flight, type FlightSample} from '../lib/flight';
import {sheetProgressAt} from '../lib/sheet';
import {useConfig, useT} from '../lib/timeline';

// Rear-follow camera: always behind and above Tilo's seat, looking along the (lagged) flight
// heading. It never orbits round to the front. Position, orientation and lens shift are pure
// functions of the master frame. The same camera feeds the WebGL city and every screen-space
// overlay (aircraft, marker, toast), so they stay locked together.

export const FlightContext = createContext<Flight | null>(null);

export const useFlight = (): Flight => {
  const f = useContext(FlightContext);
  if (!f) throw new Error('FlightContext missing');
  return f;
};

export type CameraFrame = {
  camera: PerspectiveCamera;
  sample: FlightSample;
  tilo: Vector3; // Tilo's implied world position
  focal: number; // px per unit at depth 1
  baseDepth: number; // camera→Tilo depth at cruise framing (sprite scale reference)
  project: (p: Vector3) => {x: number; y: number; depth: number};
};

const DEG = Math.PI / 180;

export const cameraAt = (config: TiloConfig, flight: Flight, t: number): CameraFrame => {
  const c = config.camera;
  const s = sampleAt(flight, t);
  const tilo = new Vector3(s.x, s.y, s.z);

  // Reframe while the reward sheet rises: pull back (Tilo gets smaller) and shift the lens so
  // Tilo moves up above the sheet. Same shot, same camera, no cut.
  const r = sheetProgressAt(config, t);
  const pull = 1 + (c.reframePullback - 1) * r;
  const targetY = config.aircraft.screenY + (c.reframeTiloScreenY - config.aircraft.screenY) * r;
  const shiftPx = (config.aircraft.screenY - targetY) * HEIGHT;

  const back = c.back * pull;
  const up = c.up * pull;
  const d = fwd(s.camHeading);
  const camera = new PerspectiveCamera(c.fovDeg, WIDTH / HEIGHT, 2, 4000);
  camera.position.set(s.x - d.x * back, s.y + up, s.z - d.z * back);

  // Pitch chosen so that, flying straight, Tilo's centre lands on aircraft.screenY.
  const halfFov = (c.fovDeg / 2) * DEG;
  const pitch = Math.atan2(c.up, c.back) - Math.atan((config.aircraft.screenY - 0.5) * 2 * Math.tan(halfFov));
  camera.rotation.order = 'YXZ';
  camera.rotation.set(-pitch, -s.camYaw, -s.bank * c.rollFactor * DEG);
  camera.setViewOffset(WIDTH, HEIGHT, 0, shiftPx, WIDTH, HEIGHT);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld(true);

  const focal = HEIGHT / 2 / Math.tan(halfFov);
  const baseDepth = Math.hypot(c.back, c.up) * Math.cos(Math.atan2(c.up, c.back) - pitch);

  const project = (p: Vector3) => {
    const v = p.clone().project(camera);
    const depth = -p.clone().applyMatrix4(camera.matrixWorldInverse).z;
    return {x: ((v.x + 1) / 2) * WIDTH, y: ((1 - v.y) / 2) * HEIGHT, depth};
  };

  return {camera, sample: s, tilo, focal, baseDepth, project};
};

export const useFlightCamera = (): CameraFrame => {
  const config = useConfig();
  const flight = useFlight();
  return cameraAt(config, flight, useT());
};
