// "There's a workspace hiding in our name": every timing, position and colour of the film.
// Frames at 30 fps unless a value is in seconds (rig control keys use seconds).
export const W = 1080;
export const H = 1920;
export const FPS = 30;
export const DURATION = 300;

export const COL = {
  cream: '#F6F1E4',
  ink: '#111110',
  cyan: '#6FC7D8',
  gold: '#FBD76A',
  white: '#FFFFFF',
  orange: '#DA8F62',
} as const;

// Final lock-up: the whole 600x170 SVG, uniform 1.6x, centred (identical to GF-LogoPlayground).
export const LOCK = {s: 1.6, ox: 60, oy: 824};
export const lockPt = (x: number, y: number): [number, number] => [LOCK.ox + LOCK.s * x, LOCK.oy + LOCK.s * y];

// The hero: the lowercase "o" in "Floaters" (wordmark glyph 5), oversized for acts 1-2.
export const HERO = {s: 16, floorY: 1300, stopX: 540};

// Story beats (frames)
export const B = {
  // act 1: the chase
  rollStop: 52,
  tiloStop: 62,
  earsCatch: 66, // ears flop forward 4 frames after Tilo stops
  pauseFrom: 70,
  blink: 78,
  pauseTo: 86,
  // act 2: the clue and the room
  clueIn: 88,
  zipOut: 96,
  zipIn: 100,
  boop: 110,
  pivotTo: 116, // edge-on
  doorOpen: 126,
  tableIn: 118,
  chairs: 120, // one chair every 2 frames -> 6 chairs by 130
  bone: 131,
  book: 146,
  // act 3: fold, sweep, assemble
  fold: 195,
  foldEnd: 207,
  charge: 200,
  sweepFrom: 203,
  sweepTo: 226,
  lettersFrom: 205,
  lettersTo: 224,
  lateOFrom: 219,
  lateODrop: 230,
  lateOLand: 233,
  tiloIn: 222,
  bonk: 234,
  click: 242,
  settled: 247,
  // act 4: hold
  holdBlink: 270,
} as const;

// Door (the opened "o"), screen px
export const DOOR = {cx: 540, cy: 1040, w: 560, h: 800, frame: 54};
