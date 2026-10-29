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

// Narration (Kokoro-82M, voice af_heart — data/voice.json holds the measured line lengths).
// The voice was generated first; every picture beat below sits on these measured phrases.
export const VO = {
  a: {at: 6, len: 66}, // "One hidden Spark. | Where would you look?"
  b: {at: 100, len: 84}, // "Every hunt starts with a clue. | Read it closely."
  c: {at: 246, len: 102}, // "Follow the signal. | Explore the workspaces. | Get closer."
  d: {at: 430, len: 59}, // "Found it. What could your hunt unlock?"
  ef: {at: 560, len: 146}, // "Your hunt could unlock an Amazon gift card. | Eligibility and terms apply."
  g: {at: 724, len: 76}, // "Pick a city. | Discover your next workspace."
  h: {at: 812, len: 69}, // "Where's your Spark hiding? | Enter the hunt."
} as const;

// Scene windows in frames [from, to). Neighbouring windows overlap where a transition hands over.
export const SCENES = {
  invitation: {from: 0, to: 100}, // A 0–3 s
  clue: {from: 76, to: 246}, // B 3–8 s
  signal: {from: 196, to: 420}, // C 8–14 s (workspace window fully open at 414)
  found: {from: 372, to: 556}, // D 14–18 s (seen through the workspace window from 380)
  reward: {from: 528, to: 724}, // E–F 18–24 s
  next: {from: 688, to: 822}, // G 24–27 s
  mystery: {from: 790, to: DURATION}, // H 27–30 s
} as const;

// On-screen copy. The clue is the storyboard's illustrative sample (no approved clue supplied).
export const COPY = {
  title: ['Find', 'the', 'Spark'],
  clueLabel: 'Read the clue',
  clue: [
    {plain: 'Where ', marked: 'teams meet'},
    {plain: 'look ', marked: 'beside the window'},
  ],
  signal: 'Follow the signal',
  found: 'Found!',
  huntComplete: 'Hunt complete',
  payoff: ['Your next hunt', 'could pay off'],
  rewardNote: 'Reward example / Eligibility and terms apply',
  whereNext: 'Where next?',
  explore: 'Explore workspaces',
  cities: [
    ['Chennai', 'Bangalore'],
    ['Hyderabad', 'Pune'],
    ['Mumbai', 'New Delhi'],
    ['Gurugram', 'Noida'],
  ],
  gameTitle: 'Tilo’s Diwali Spark Hunt',
  question: ['Where’s your', 'Spark hiding?'],
  cta: 'Enter the hunt',
  ctaArrow: '→',
} as const;

// Storyboard-derived stand-in layers (see gofloaters/docs/01_asset_audit.md).
export const ASSETS = {
  tilo: 'gofloaters/storyboard/tilo.png', // whole artwork — only inside the static logo lockup
  tiloBody: 'gofloaters/storyboard/tilo_body.png',
  tiloBodyNoLines: 'gofloaters/storyboard/tilo_body_nolines.png',
  tiloProp: 'gofloaters/storyboard/tilo_prop.png',
  wordmark: 'gofloaters/storyboard/logo_wordmark.png',
  wordmarkWhite: 'gofloaters/storyboard/logo_wordmark_white.png',
  aerial: 'gofloaters/storyboard/aerial.png',
  workspace: 'gofloaters/storyboard/workspace.png',
  roomBg: 'gofloaters/storyboard/room_bg.png',
  roomDoor: 'gofloaters/storyboard/room_door.png',
  giftCard: 'gofloaters/storyboard/gift_card.png',
} as const;
