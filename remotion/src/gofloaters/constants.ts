// GoFloaters — "The Flight Path Finds Your Space". 10 s, 9:16, 30 fps.
// Single source of truth for timing, colour and layout. World units = output pixels once the camera has
// pulled back (frame CAMERA.to onwards); before that the camera is pushed in on Tilo.

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const DURATION = 10 * FPS; // 300 frames

// Brand book p.23: colours sampled from the supplied logo, plus the proposed supporting tints.
export const COLORS = {
  turquoise: '#6ED0E0', // aircraft body — the route and walls
  turquoiseDeep: '#167A8C', // turquoise for small type on light grounds (AA)
  yellow: '#FCE162', // propeller — the selection light only
  yellowTint: '#FFF5CC', // the selected room
  warmWhite: '#FBF8F1', // opening field
  stage: '#FEFEFE', // the supplied logo's own background (measured), so the original file sits on it seamlessly
} as const;

export const FONT_LABEL = 'GF Inter';

// Logo source and its registered layers (written by gofloaters/tools/extract_layers.py).
// Every layer keeps the full 2000x667 source canvas, so one transform places them all.
export const LOGO = {
  original: 'brand/gofloaters/gofloaters_logo_original.webp',
  symbol: 'brand/gofloaters/layers/symbol.png',
  speedLines: 'brand/gofloaters/layers/speedlines.png',
  wordmark: 'brand/gofloaters/layers/wordmark.png',
  tagline: 'brand/gofloaters/layers/tagline.png',
  propellerMask: 'brand/gofloaters/layers/propeller_mask.png',
  width: 2000,
  height: 667,
  // Measurements from layers.json (source px).
  artBox: [46, 108, 1953, 559],
  symbolBox: [263, 108, 903, 559],
  wordmarkBox: [967, 212, 1953, 378],
  taglineBox: [976, 399, 1952, 477],
  propellerBox: [852, 325, 893, 483],
  routeRowY: 444.5, // the rearmost speed line: the one that becomes the route
  tailX: 279, // aircraft tail on that row
  noseX: 902,
  lineWeight: 9,
} as const;

// Final lock-up: the original logo, art fitted to 920 px wide (80 px side margins), centred on the frame.
const ART_W = LOGO.artBox[2] - LOGO.artBox[0];
const ART_CX = (LOGO.artBox[0] + LOGO.artBox[2]) / 2;
const ART_CY = (LOGO.artBox[1] + LOGO.artBox[3]) / 2;
export const LOCKUP_SCALE = 920 / ART_W;
export const LOCKUP_ORIGIN = {x: WIDTH / 2 - ART_CX * LOCKUP_SCALE, y: HEIGHT / 2 - ART_CY * LOCKUP_SCALE};

// Tilo in flight: a touch larger than the lock-up, so the final glide is mostly a translation.
export const FLIGHT_SCALE = 0.5;
const SYM_CX = (LOGO.symbolBox[0] + LOGO.symbolBox[2]) / 2;
const SYM_CY = (LOGO.symbolBox[1] + LOGO.symbolBox[3]) / 2;
export const HOLD_CENTER = {x: 250, y: 520}; // symbol centre while the plan forms
export const HOLD_ORIGIN = {x: HOLD_CENTER.x - SYM_CX * FLIGHT_SCALE, y: HOLD_CENTER.y - SYM_CY * FLIGHT_SCALE};
export const DRIFT = 10; // slow forward drift while holding (world px)
export const ROUTE_Y = HOLD_ORIGIN.y + LOGO.routeRowY * FLIGHT_SCALE;
export const ROUTE_WEIGHT = LOGO.lineWeight * FLIGHT_SCALE; // same weight as the speed lines it continues
export const FURNITURE_WEIGHT = 2.5;

// Floor plan (world px). Three rooms: desk (top left), private cabin (top right), meeting room (bottom).
export const PLAN = {x0: 190, x1: 890, y0: 780, y1: 1520, splitY: 1130, splitX: 520} as const;
export const DOORS = {
  entrance: {x: PLAN.x1, y0: 1290, y1: 1360}, // outer wall → meeting room
  deskCabin: {x: PLAN.splitX, y0: 900, y1: 970},
  cabinMeeting: {y: PLAN.splitY, x0: 640, x1: 710},
} as const;
export const SELECTED = {x0: PLAN.x0, y0: PLAN.splitY, x1: PLAN.x1, y1: PLAN.y1}; // the meeting room
export const SELECTED_CENTER = {x: (SELECTED.x0 + SELECTED.x1) / 2, y: (DOORS.entrance.y0 + DOORS.entrance.y1) / 2};

// Camera: pushed in on the flight line, one pull-back while the plan forms, then locked.
export const CAMERA = {
  from: 80,
  to: 150,
  startScale: 1.55,
  startCenter: {x: 330, y: ROUTE_Y},
  endCenter: {x: WIDTH / 2, y: HEIGHT / 2},
} as const;

// Timeline (frames @ 30 fps).
export const T = {
  routeIn: {from: 6, to: 45}, // 0.2–1.5 s  aqua line draws in from the left
  tiloIn: {from: 45, to: 90}, // 1.5–3.0 s  Tilo flies in along it
  speedLinesOut: {from: 72, to: 96}, //       his speed lines dissolve into the route
  planDraw: {from: 84, to: 150}, // 2.8–5.0 s  the route draws the floor plan
  furniture: {from: 122, to: 162},
  light: {from: 150, to: 186}, // 5.0–6.2 s  yellow light travels and selects the meeting room
  othersFade: {from: 184, to: 200},
  expand: {from: 198, to: 224}, // 6.6–7.5 s  the room becomes the brand stage
  glide: {from: 196, to: 228}, // 6.5–7.6 s  Tilo glides into his logo position
  speedLinesIn: {from: 206, to: 228},
  propellerSettle: {from: 214, to: 230},
  wordmark: {from: 218, to: 234},
  tagline: {from: 224, to: 238},
  lock: 240, // 8.0 s  the original logo file, static to the end
} as const;
