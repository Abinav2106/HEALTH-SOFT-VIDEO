// GoFloaters "Find your space" — 16:9, 19 s. Single source of truth for timing, layout and brand values.
// Every animation is driven by these frame numbers (30 fps, matching the reference edit).

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const DURATION = 570; // 19.0 s

export const COLORS = {
  // Measured from the official dog-on-airplane artwork (2000x667 webp).
  cyan: '#6ED0E1', // airplane body
  yellow: '#FCE25E', // propeller / seat
  orange: '#E8742A', // goggles — sparing accent only
  paper: '#FEFEFE', // the artwork's own ground; the end frame matches it so the file sits seamlessly
  black: '#0A0A0A',
  ink: '#111111',
  inkSoft: '#5F6368', // tagline grey in the artwork
  cyanDeep: '#1E9BB0', // cyan darkened for text on white (contrast)
  cyanWash: '#E9F8FB',
  white: '#FFFFFF',
} as const;

export const FONT_SANS = 'GF Inter';

export const LOGO = {src: 'gofloaters/brand/gofloaters_logo_original.webp', width: 2000, height: 667};

// Shot plan → frame ranges [from, to). Live-action shots take their clip from CLIPS.
export const SHOTS = {
  s01: {from: 0, to: 90}, // 0:00–0:03  home table, mildly frustrated
  s02: {from: 90, to: 180}, // 0:03–0:06  loud cafe, punch-in
  s03a: {from: 180, to: 222}, // 0:06–0:10  montage: quiet focus
  s03b: {from: 222, to: 262}, //             private meeting
  s03c: {from: 262, to: 302}, //             room for the team
  s04: {from: 302, to: 390}, // 0:10–0:13  peak → looks at phone → stillness
  s05: {from: 390, to: 468}, // 0:13–0:15.6 phone hero: WORKSPACE MATCH
  s06: {from: 468, to: 515}, // 0:15.6–0:17.2 match → discover → book
  s07: {from: 515, to: DURATION}, // 0:17.2–0:19 end frame (fully readable from 524 = 1.53 s)
} as const;

// Live-action clips (public/gofloaters/clips, gitignored). `in` = first source frame used (30 fps).
export type ClipId = 's01' | 's02' | 's03a' | 's03b' | 's03c' | 's04' | 's07';
export const CLIPS: Record<ClipId, {file: string; in: number; label: string}> = {
  s01: {file: 'gofloaters/clips/s01.mp4', in: 6, label: 'S01 home table — mildly frustrated'},
  s02: {file: 'gofloaters/clips/s02.mp4', in: 12, label: 'S02 loud cafe — palm to ear'},
  s03a: {file: 'gofloaters/clips/s03a.mp4', in: 18, label: 'S03a quiet focus — earbud'},
  s03b: {file: 'gofloaters/clips/s03b.mp4', in: 15, label: 'S03b private meeting — whisper'},
  s03c: {file: 'gofloaters/clips/s03c.mp4', in: 15, label: 'S03c team — cramped table'},
  s04: {file: 'gofloaters/clips/s04.mp4', in: 24, label: 'S04 looks at phone — stillness'},
  s07: {file: 'gofloaters/clips/s07.mp4', in: 60, label: 'S07 calm workspace — relief'},
};

// S02 second punch-in (hard cut to a tighter frame inside the shot).
export const S02_PUNCH = 136;
// S04 pattern interruption: picture and camera freeze, the score cuts to silence; then a jump to the
// first hint of a smile (source 4.0 s) just before the phone takes over.
export const FREEZE = {at: 352, resume: 372, resumeIn: 120};

// Montage chips: the three needs that become the requirement cards on the phone.
export const NEEDS = [
  {shot: 's03a', text: 'Need quiet focus'},
  {shot: 's03b', text: 'Need a private meeting'},
  {shot: 's03c', text: 'Need room for the team'},
] as const;

// Phone hero (S05/S06), absolute frames.
export const PHONE = {
  x: 1236, // phone centre
  y: 540,
  w: 414,
  h: 880,
  enter: SHOTS.s05.from, // scales up out of S04 (where she holds her phone)
  settle: SHOTS.s05.from + 14,
};

export const MATCH = {
  headerIn: 398,
  reqIn: [402, 406, 410], // FOCUS / MEETING / TEAM
  spaceIn: [410, 414, 418], // workspace cards
  touchIn: 420,
  dragFrom: 424,
  snapAt: 441, // magnetic snap; UI snap SFX
  foundIn: 445, // MATCH FOUND ✓
  morph: SHOTS.s06.from, // match screen → discovery screen
  bookTap: 496,
};

// Left-hand headline in S05: the creative principle, CHAOS → ONE TAP → MATCH → (WORK, in S06).
export const BEATS = [
  {text: 'One tap.', inAt: 402},
  {text: 'Match.', inAt: 444},
] as const;

// S06 left side: the found workspace (S07 clip in a window) and the three-step flow.
export const FLOW = {
  windowIn: SHOTS.s06.from,
  steps: [
    {text: 'Select requirement', at: SHOTS.s06.from + 2},
    {text: 'Discover a space', at: SHOTS.s06.from + 12},
    {text: 'Book', at: 496},
  ],
} as const;

export const END = {
  wipe: {from: 507, to: 517},
  logoIn: 512,
  lineIn: 516,
  ctaIn: 520,
};
