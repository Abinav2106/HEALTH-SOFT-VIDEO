// Tilo / "A little exploration. A golden reward." — every timing, colour and layout value.

export const WIDTH = 1080;
export const HEIGHT = 1350;
export const FPS = 30;
export const DURATION = 150; // exactly 5 s

export const COLORS = {
  bg: '#FFFFFF',
  cyan: '#65CADA',
  cyanDeep: '#3FA9BC',
  cyanPale: '#DDF2F6',
  gold: '#FAD572',
  goldDeep: '#E9B949',
  navy: '#1E2A44',
  white: '#FFFFFF',
  fur: '#FFFFFF',
  furShade: '#E9EEF3', // far-side limbs, so they separate from the near ones
  tongue: '#F08A8A',
  floorTop: '#F5F7F9',
  floorEdge: '#E4E9EE',
  wood: '#F3E6D3',
  woodSide: '#E5D2B7',
  metal: '#C9D2DB',
  glass: 'rgba(101, 202, 218, 0.16)',
  glassEdge: '#9FDCE7',
  leaf: '#4FA88F',
  leafDeep: '#3B8C76',
  pot: '#E8DCCB',
  shadow: '#1E2A44',
} as const;

export const STROKE = {
  character: 4.5,
  prop: 3.5,
  room: 3,
} as const;

export const FONT_CARD = 'DM Sans';

// ── Oblique projection ──────────────────────────────────────────────────────
// World: X → right, Y → up, Z → into the room. One world unit = one pixel.
export const PROJ = {ox: 260, oy: 1010, kx: 0.6, ky: 0.32} as const;

// ── Room layout (world units) ───────────────────────────────────────────────
export const ROOM = {
  floor: {x0: 0, x1: 530, z0: 0, z1: 360, thickness: 16},
  door: {x: 0, z0: 62, z1: 286, height: 350, jamb: 16},
  desk: {x0: 362, x1: 528, z0: 166, z1: 262, height: 68, top: 12},
  laptop: {x: 476, z: 220, w: 70, d: 42, screenH: 54},
  chair: {x: 452, z: 312},
  plant: {x: 40, z: 326},
  spark: {x: 420, z: 182, lift: 40}, // golden spark floats `lift` above the desk top
} as const;

export const PLANE_Z = 178; // flight lane: between the door jambs
export const TILO_Z = 140; // Tilo steps out toward the viewer, in front of the desk
export const PLANE_SCALE = 0.85; // plane group (and seated Tilo) in world units
export const TILO_SCALE = 1.18; // Tilo inside the plane group ⇒ 1.0 once he steps out
export const PARK_X = 150; // plane origin once parked (world X)

// ── Timeline (frames @ 30 fps) ──────────────────────────────────────────────
export const T = {
  // 01 ARRIVE 0.00–0.65
  arriveEnd: 20,
  glintIn: 9,
  // 02 REVEAL 0.65–1.40
  floorIn: 20,
  doorIn: 24,
  furniture: {plant: 28, desk: 30, chair: 32, laptop: 34, spark: 36},
  sparkGlint: 39,
  doorOpen: 31,
  headTurnRoom: 27,
  bankIn: 36,
  revealEnd: 42,
  // 03 TOUCH DOWN 1.40–2.35
  contact: 64,
  park: 69,
  landEnd: 70,
  // 04 DISCOVER + COLLECT 2.35–3.65
  brace: 70,
  lift: 74,
  clearRim: 81,
  hop: 82,
  land: 91,
  step: 93,
  spot: 97,
  reach: 101,
  pause: 105,
  pickup: 108,
  discoverEnd: 110,
  // 05 REWARD 3.65–5.00
  toChest: 111,
  cardIn: 112,
  check: 119,
  sparkles: [115, 118, 121],
  settle: 126, // all main movement complete (4.20 s)
  tailWag: 132,
} as const;

export const CARD = {
  text: 'Reward unlocked!',
  cx: 540,
  cy: 420,
  w: 620,
  h: 124,
  radius: 34,
} as const;
