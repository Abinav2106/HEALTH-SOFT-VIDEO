// GoFloaters "the logo is the playground" — every timing, colour and layout value lives here.
// Frames at 30 fps. Coordinates are 1080x1920 screen pixels unless marked "logo units"
// (the supplied SVG's 600x170 viewBox).

export const WIDTH = 1080;
export const HEIGHT = 1920;
export const FPS = 30;
export const DURATION = 300; // 10 s

export const LOGO_FILE = 'brand/gofloaters_logo_original.svg';
export const RING_SAMPLES = 192;

export const C = {
  white: '#FFFFFF',
  cyan: '#6FC7D8', // the SVG's own cyan
  ink: '#111110', // the SVG's own ink
  gold: '#FBD76A', // the SVG's own yellow, used only for the Spark Bone
} as const;

// Final lock-up: the whole 600x170 SVG, centred, scaled uniformly (geometry and spacing untouched).
export const LOGO_SCALE = 1.6;
export const LOGO_ORIGIN: [number, number] = [WIDTH / 2 - 300 * LOGO_SCALE, HEIGHT / 2 - 85 * LOGO_SCALE];

// Act boundaries (brief): hunt 0–3 s, discovery + choice 3–5.4 s, plane + letters 5.4–8 s, logo 8–10 s.
export const ACT = {hunt: 0, discover: 90, plane: 162, logo: 240} as const;

export const T = {
  // Hunt
  ringPopA: 0,
  ringPopB: 4,
  lookLeft: 14,
  lookRight: 26,
  boneIn: 30,
  cursorIn: 36,
  dodge: 47, // bone leaves just before the cursor arrives
  cursorMiss: 54,
  pauseEnd: 66, // the comic pause: the cursor freezes, the rings glance at it, then at us
  catch: 76,
  park: 80,
  // Discovery + choice
  morphStart: 80,
  morphEnd: 102,
  deskIn: 98,
  choicesIn: 102,
  choose: 118,
  book: 138,
  check: 141,
  // Plane + assembly
  unmorph: 148,
  planeIn: 152,
  planeOut: 184,
  gulp: 172,
  whiteWipe: 176,
  zoomOut: 210,
  zoomOutEnd: 236,
  letters: 191, // first letter starts; one every LETTER_STEP frames
  planeLand: 214,
  planeSettle: 238,
  tagline: 228,
  exact: 248, // from here on every pixel is the supplied SVG
} as const;

export const LETTER_STEP = 3;
export const LETTER_DUR = 10;

// Hunt layout
export const EYES = {a: [400, 800] as [number, number], b: [684, 800] as [number, number], scale: 6};
export const BONE_HOME: [number, number] = [790, 1270];
export const BONE_DODGE: [number, number] = [300, 1190];
export const BONE_PARK: [number, number] = [904, 470];

// Discovery layout
export const PIN_AT: [number, number] = [540, 720]; // centre of the pin's head
export const PIN_SCALE = 8;
export const BUTTON_AT: [number, number] = [540, 1440];
export const BUTTON_SCALE = 4.4;
export const CHOICES: [number, number][] = [
  [196, 1080],
  [884, 1080],
];

// Assembly camera: letters land close-up on the wordmark, then the camera pulls back to the lock-up.
export const ZOOM = 1.9;
export const ZOOM_FOCUS_LOGO: [number, number] = [437.8, 72]; // wordmark centre, logo units
export const ZOOM_FOCUS_SCREEN: [number, number] = [540, 900];
