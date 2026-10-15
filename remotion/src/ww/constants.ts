import dialogue from './dialogue.json';

// W&W "Start with why." — single source of truth for format, colour, copy, timing and asset paths.
// Times are in seconds on the master timeline; `f()` converts to frames.

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const DURATION_S = 45;
export const DURATION = DURATION_S * FPS; // 1350

export const f = (s: number) => Math.round(s * FPS);

// ── Colour tokens ─────────────────────────────────────────────────────────────
// Black primary, white secondary, orange accent. ORANGE IS PROVISIONAL (#FF6A00):
// no approved orange value was supplied with the brand files.
export const C = {
  black: '#000000',
  white: '#FFFFFF',
  orange: '#FF6A00',
  callBg: '#EDEDEB', // pale neutral behind the video call (grey only as neutral shading)
  ink60: 'rgba(0,0,0,0.6)',
  ink35: 'rgba(0,0,0,0.35)',
  ink10: 'rgba(0,0,0,0.09)',
  paper60: 'rgba(255,255,255,0.6)',
  shadow: 'rgba(0,0,0,0.16)',
} as const;

export const FONT = 'DM Sans';

// No editable/rigged Doubt model was supplied. Until one is, character performance shots are stand-ins
// built from the approved neutral render's own layers, and the clean master refuses to render.
export const RIG_READY = false;

// ── Copy (locked by the brief) ────────────────────────────────────────────────
export const COPY = {
  incoming: 'Incoming question',
  brandName: 'Why & Whatever',
  a: {headline: 'First, the why.', label: 'Business consulting + Branding'},
  b: {headline: 'Make attention count.', label: 'Creative + Marketing + Advertising'},
  c: {headline: 'Set up. Not stuck.', label: 'Meta business setup', items: ['Business', 'Access', 'Ads']},
  r4: {headline: 'One clear direction.'},
  close: {line: 'Start with why.', cta: "Let's talk."},
} as const;

// ── Dialogue (scratch timing; new copy, not a transcription) ─────────────────
export type Speaker = 'caller' | 'doubt' | 'voice';
export type Line = {id: string; speaker: Speaker; text: string; at: number; end: number};
// Edit lines and cue times in dialogue.json (also read by ww/tools/make_audio.py).
export const DIALOGUE = dialogue as Line[];

// ── Section boundaries (master seconds) ──────────────────────────────────────
export const T = {
  r1: {from: 0, to: 4.0}, // grid resolves to one; pulse peaks at the cut
  cut: 3.93, // match-cut: flat orange mark → Doubt's question mark (pulse peak hides the cut)
  stage: {from: 3.93, to: 5.5}, // Doubt revealed on the white stage; incoming question
  pickup: {from: 4.8, to: 5.5}, // BLOCKED: phone pickup needs a rigged Doubt
  call: {from: 5.5, to: 11.85}, // R2 close conversational framing (phone-camera view)
  pull: {from: 11.85, to: 12.6}, // R2 pullback to full figure
  grid: {from: 12.6, to: 13.35}, // R2 wider-grid reveal → W&W panels around the same Doubt
  layer: {from: 13.35, to: 15.0}, // R3 layered cards + hand press + panel expansion
  a: {from: 15.0, to: 20.0},
  b: {from: 20.0, to: 25.0},
  c: {from: 25.0, to: 31.0},
  r4: {from: 31.0, to: 38.5},
  callback: {from: 38.5, to: 40.5},
  close: {from: 40.5, to: 45.0},
} as const;

// ── Assets ───────────────────────────────────────────────────────────────────
// Client brand files are not committed. Run ww/tools/prep_assets.py to cut them into these layers.
export const ASSET = {
  body: 'ww/brand/doubt_body.png',
  qmark: 'ww/brand/doubt_qmark.png',
  shadow: 'ww/brand/doubt_shadow.png',
  qmarkMask: 'ww/brand/qmark_mask.png',
  hand: 'ww/brand/doubt_hand.png',
  logoMask: 'ww/brand/ww_logo_mask.png',
} as const;

// Clean hero stills re-used as the R4 phone cards (rendered from this film by `npm run ww:heroes`).
// Concept material made in this film, not completed client campaigns.
export const HEROES = ['identity', 'grid', 'formats', 'doubt', 'setup', 'poster', 'logo', 'mark'] as const;
export type HeroId = (typeof HEROES)[number];
export const heroPath = (id: HeroId) => `ww/hero/${id}.png`;
