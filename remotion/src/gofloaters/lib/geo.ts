import india from '../data/india.json';
import {CITIES, City} from '../constants';

// One Web-Mercator projection fitted to India's boundary; the city markers go through the same
// function, so they cannot drift from the outline.
const rad = (d: number) => (d * Math.PI) / 180;
const mercY = (lat: number) => Math.log(Math.tan(Math.PI / 4 + rad(lat) / 2));

const rings = india.rings as number[][][];
const lons = rings.flat().map((p) => p[0]);
const lats = rings.flat().map((p) => p[1]);
const LON0 = Math.min(...lons);
const LON1 = Math.max(...lons);
const Y_TOP = mercY(Math.max(...lats));
const Y_BOT = mercY(Math.min(...lats));

export type MapFrame = {x: number; y: number; height: number};

export const makeProjection = ({x, y, height}: MapFrame) => {
  const s = height / (Y_TOP - Y_BOT); // px per radian
  const width = rad(LON1 - LON0) * s;
  const project = (lat: number, lon: number): [number, number] => [x + rad(lon - LON0) * s, y + (Y_TOP - mercY(lat)) * s];
  const path = rings
    .map((ring) => ring.map(([lon, lat], i) => `${i ? 'L' : 'M'}${project(lat, lon).map((v) => v.toFixed(1)).join(' ')}`).join('') + 'Z')
    .join('');
  const city = (name: City) => project(CITIES[name][0], CITIES[name][1]);
  return {project, path, city, width, scale: s};
};

/** The same projection magnified by `zoom` about a geographic centre, re-centred at (cx, cy). */
export const makeInset = (base: ReturnType<typeof makeProjection>, centre: [number, number], zoom: number, cx: number, cy: number) => {
  const [ox, oy] = base.project(centre[0], centre[1]);
  return (lat: number, lon: number): [number, number] => {
    const [px, py] = base.project(lat, lon);
    return [cx + (px - ox) * zoom, cy + (py - oy) * zoom];
  };
};
