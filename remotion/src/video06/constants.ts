// Healthsoft Video 06 — single source of truth for timing, layout and brand values.
// Every animation in the composition is driven by these frame numbers (24 fps).

export const FPS = 24;
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const DURATION = 32 * FPS; // 768 frames — storyboard panel timecodes run 0:00–0:32

export const COLORS = {
  // Measured from the official logo file (median of orange pixels).
  orange: '#EC8D1F',
  // Measured from the product photograph's background (the stage keeps the photo's own ground).
  cream: '#FCF6EF',
  // Approved brand palette.
  ivory: '#FAF7F2',
  navy: '#0B1F3A',
  white: '#FFFFFF',
  ink: '#0B1F3A', // important messaging = navy
  inkSoft: '#4E5B70', // navy-tinted secondary text
  plateA: '#2B2723',
  plateB: '#171513',
} as const;

export const FONT_SANS = 'HS Inter';
export const FONT_SERIF = 'HS Newsreader';

// Storyboard panels → frame ranges [from, to), retimed to the 0–3 / 3–6 / … / 27–30 / 30–32 s segment plan.
// Live-action panels take their clip from stock/manifest.json.
export const SHOTS = {
  s01: {from: 0, to: 72}, // You buy it.            — R1 daughter browsing on laptop (0–3 s)
  s02: {from: 72, to: 92}, //                       — R2 close-up, match cut out (3.0–3.8 s)
  s03: {from: 92, to: 144}, // They live with it.   — mother close-up, matched eyeline (3.8–6 s)
  s04: {from: 144, to: 216}, // Their day.          — R3 mother's routine, one continuous shot
  s05: {from: 216, to: 288}, // Their comfort.      — R4 tea / reading
  s06: {from: 288, to: 384}, // Their choice.       — R5 mother + daughter at laptop
  s07: {from: 384, to: 432}, // Safety — Guard Rail            (16–18 s)
  s08: {from: 432, to: 480}, // Health — Health Guard          (18–20 s)
  s09: {from: 480, to: 528}, // Medication — The Keeper        (20–22 s)
  s10: {from: 528, to: 648}, // Understand · Choose · Get started (22–27 s)
  s11: {from: 648, to: 720}, // Care that fits real life.      — R6 closing human moment (27–30 s)
  s12: {from: 720, to: 768}, // Official logo + Find your fit → (30–32 s)
} as const;

// Push-in through the shared laptop screen into the product stage.
export const SCREEN_PUSH = {from: 352, to: 388};
// The pinned screen is rasterised softer than the 2D stage; finish the push early and dissolve once aligned.
export const SCREEN_SETTLE = 6;
// Product stage (continuous virtual camera across the three products).
export const STAGE = {from: 388, to: 540};
// Stage → guidance: cream foreground rises from the label scrim.
export const GUIDANCE_RISE = {from: 522, to: 540};

// Product photograph (original, unmodified). Source pixel space.
export const PRODUCT_PHOTO = {
  src: 'brand/healthsoft_products_original.webp',
  width: 941,
  height: 1672,
};

export type ProductKey = 'guardRail' | 'healthGuard' | 'keeper';

// Bounds measured on the original photo (source px). Names/categories as approved by the client.
export const PRODUCTS: Record<
  ProductKey,
  {category: string; name: string; box: [number, number, number, number]; labelIn: number; labelOut: number}
> = {
  guardRail: {category: 'Safety', name: 'Guard Rail', box: [555, 920, 892, 1382], labelIn: 394, labelOut: 432},
  healthGuard: {category: 'Health', name: 'Health Guard', box: [22, 715, 440, 1245], labelIn: 442, labelOut: 480},
  keeper: {category: 'Medication', name: 'The Keeper', box: [235, 195, 910, 905], labelIn: 490, labelOut: 526},
};

export const PRODUCT_ORDER: ProductKey[] = ['guardRail', 'healthGuard', 'keeper'];

// Guidance copy as locked by the client: "Understand. Choose. Get started."
export const GUIDANCE_STEPS = [
  {num: '01', a: 'Understand', at: 544},
  {num: '02', a: 'Choose', at: 568},
  {num: '03', a: 'Get started', at: 592},
] as const;
export const GUIDANCE_OUT = 636;

// Placeholder corner-pin targets for the laptop screen (frame px, TL TR BR BL).
// Replace with per-frame tracked corners once the real clips are approved.
export type Quad = [[number, number], [number, number], [number, number], [number, number]];
export const SCREEN_QUAD_S01: Quad = [
  [318, 560],
  [952, 488],
  [972, 896],
  [336, 934],
];
export const SCREEN_QUAD_S06: Quad = [
  [250, 760],
  [830, 706],
  [846, 1074],
  [266, 1110],
];
// Virtual screen canvas (16:10) that the selection graphic is laid out on before pinning.
export const SCREEN_CANVAS = {w: 1600, h: 1000};

// Title-safe area for 9:16 social placements (keeps copy clear of platform UI).
export const SAFE = {top: 250, bottom: 1640, left: 84, right: 996};
