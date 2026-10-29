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
export const MEDIUM = 500;
export const BOLD = 700;

// Scene windows in frames [from, to). Neighbouring windows overlap where a transition hands over.
export const SCENES = {
  invitation: {from: 0, to: 96}, // 0–3 s
  clue: {from: 72, to: 246}, // 3–8 s
  signal: {from: 196, to: 492}, // 8–16 s
  discovery: {from: 430, to: 646}, // 16–21 s
  payoff: {from: 600, to: 790}, // 21–26 s
  ending: {from: 752, to: DURATION}, // 26–30 s
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
  cta: 'Enter the hunt →',
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
  tilo: 'gofloaters/storyboard/tilo.png',
  tiloNoLines: 'gofloaters/storyboard/tilo_nolines.png',
  wordmark: 'gofloaters/storyboard/logo_wordmark.png',
  aerial: 'gofloaters/storyboard/aerial.png',
  workspace: 'gofloaters/storyboard/workspace.png',
  room: 'gofloaters/storyboard/room.png',
  roomBg: 'gofloaters/storyboard/room_bg.png',
  roomDoor: 'gofloaters/storyboard/room_door.png',
  gift: 'gofloaters/storyboard/gift.png',
} as const;
