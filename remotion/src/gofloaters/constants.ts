// "Find the Spark" — every timing, colour and copy string for the reel lives here.
export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const DURATION = 30 * FPS;

export const C = {
  blue: '#65CADA',
  yellow: '#FAD572',
  navy: '#071C38',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export const FONT = 'GF DM Sans';
export const REGULAR = 400;
export const MEDIUM = 500;
export const BOLD = 700;

// Narration (Kokoro-82M, voice af_heart — see data/voice.json for measured line lengths).
// Picture beats below are placed on these spoken phrases, measured from the generated audio.
export const VO = {
  s1: {at: 8, len: 66}, // "One hidden Spark. | Where will you look?"
  s2: {at: 100, len: 128}, // "Every hunt starts with a clue. | Read it closely, and follow where it leads."
  s3: {at: 252, len: 173}, // "Search the map. | Explore the workspaces. | Follow the clue until the right place comes into view."
  s4: {at: 492, len: 109}, // "There it is. Spark found. | Now see what your hunt could unlock."
  s5: {at: 627, len: 154}, // "Your next hunt could unlock an Amazon gift card. | Eligibility and terms apply."
  s6: {at: 786, len: 97}, // "Where's your Spark hiding? | Enter the hunt with GoFloaters."
} as const;

// Scene windows in frames [from, to). Neighbouring windows overlap where a transition hands over.
export const SCENES = {
  invitation: {from: 0, to: 100}, // 0–3 s
  clue: {from: 76, to: 252}, // 3–8 s
  explore: {from: 220, to: 462}, // 8–16 s (window fully open at 458)
  found: {from: 426, to: 632}, // 16–21 s (visible through the workspace window from 432)
  reward: {from: 598, to: 800}, // 21–26 s
  ending: {from: 766, to: DURATION}, // 26–30 s
} as const;

// Exact on-screen copy (the clue is the storyboard's illustrative sample — no approved clue supplied).
export const COPY = {
  title: ['Find', 'the', 'Spark'],
  clueLabel: 'Read the clue',
  clue: [
    {plain: 'Where ', marked: 'teams meet', after: ''},
    {plain: 'look ', marked: 'beside the window', after: ''},
  ],
  steps: ['Search', 'Explore', 'Discover'],
  found: 'Found!',
  huntComplete: 'Hunt complete',
  payoff: ['Your next hunt', 'could pay off'],
  rewardNote: 'Reward example / Eligibility and terms apply',
  gameTitle: 'Tilo’s Diwali Spark Hunt',
  question: 'Where’s your Spark hiding?',
  cta: 'Enter the hunt',
  ctaArrow: '→',
} as const;

// City-centre reference coordinates [lat, lon] — approximate centres, not workspace addresses.
export const CITIES = {
  Chennai: [13.0827, 80.2707],
  Bangalore: [12.9716, 77.5946],
  Hyderabad: [17.385, 78.4867],
  Pune: [18.5204, 73.8567],
  Mumbai: [19.076, 72.8777],
  'New Delhi': [28.6139, 77.209],
  Gurugram: [28.4595, 77.0266],
  Noida: [28.5355, 77.391],
} as const;
export type City = keyof typeof CITIES;

// Storyboard-derived stand-in layers (see gofloaters/docs/01_asset_audit.md).
export const ASSETS = {
  tilo: 'gofloaters/storyboard/tilo.png', // whole artwork, only inside the static logo lockup
  tiloBody: 'gofloaters/storyboard/tilo_body.png',
  tiloBodyNoLines: 'gofloaters/storyboard/tilo_body_nolines.png',
  tiloProp: 'gofloaters/storyboard/tilo_prop.png',
  wordmark: 'gofloaters/storyboard/logo_wordmark.png',
  aerial: 'gofloaters/storyboard/aerial.png',
  workspace: 'gofloaters/storyboard/workspace.png',
  roomBg: 'gofloaters/storyboard/room_bg.png',
  roomDoor: 'gofloaters/storyboard/room_door.png',
  gift: 'gofloaters/storyboard/gift.png',
} as const;
