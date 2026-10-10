// Healthsoft Video 06 — single source of truth for timing, layout and brand values.
// Every animation in the composition is driven by these frame numbers (24 fps).

export const FPS = 24;
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const DURATION = 32 * FPS; // 768 frames — storyboard panel timecodes run 0:00–0:32

export const COLORS = {
  // Measured from the official logo file (median of orange pixels).
  orange: '#EC8D1F',
  // Measured from the product photograph's background.
  cream: '#FCF6EF',
  white: '#FFFFFF',
  ink: '#1D1F24',
  inkSoft: '#62656D',
  plateA: '#2B2723',
  plateB: '#171513',
} as const;

export const FONT_SANS = 'HS Inter';
export const FONT_SERIF = 'HS Newsreader';

// Storyboard panels → frame ranges [from, to). Stock panels are placeholders until footage is approved.
export const SHOTS = {
  s01: {from: 0, to: 48}, // You buy it.            — R1 daughter browsing on laptop
  s02: {from: 48, to: 96}, // But…                  — R2 pause close-up
  s03: {from: 96, to: 144}, // They live with it.   — R3 mother's everyday activity
  s04: {from: 144, to: 216}, // Their day. montage  — R3/R4 (3 × 1 s)
  s05: {from: 216, to: 288}, // Their comfort.      — R4 tea / reading
  s06: {from: 288, to: 384}, // Their choice.       — R5 mother + daughter at laptop
  s07: {from: 384, to: 456}, // Safety — Guard Rail
  s08: {from: 456, to: 528}, // Health — Health Guard
  s09: {from: 528, to: 600}, // Medication — The Keeper
  s10: {from: 600, to: 664}, // Understand → Choose → Get started
  s11: {from: 664, to: 708}, // More good days ahead. — R6 closing moment
  s12: {from: 708, to: 768}, // End card: logo, line, CTA
} as const;

// Push-in through the shared laptop screen into the product stage.
export const SCREEN_PUSH = {from: 352, to: 388};
// The pinned screen is rasterised softer than the 2D stage; finish the push early and dissolve once aligned.
export const SCREEN_SETTLE = 6;
// Product stage (continuous virtual camera across the three products).
export const STAGE = {from: 388, to: 612};
// Stage → guidance: cream foreground rises from the label scrim.
export const GUIDANCE_RISE = {from: 588, to: 608};

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
  guardRail: {category: 'Safety', name: 'Guard Rail', box: [555, 920, 892, 1382], labelIn: 404, labelOut: 452},
  healthGuard: {category: 'Health', name: 'Health Guard', box: [22, 715, 440, 1245], labelIn: 466, labelOut: 516},
  keeper: {category: 'Medication', name: 'The Keeper', box: [235, 195, 910, 905], labelIn: 530, labelOut: 584},
};

export const PRODUCT_ORDER: ProductKey[] = ['guardRail', 'healthGuard', 'keeper'];

// Guidance copy exactly as on the approved storyboard (panel 10).
export const GUIDANCE_STEPS = [
  {num: '01', a: 'Understand', b: 'your needs', at: 608},
  {num: '02', a: 'Choose', b: 'the right fit', at: 622},
  {num: '03', a: 'Get started', b: 'with support', at: 636},
] as const;

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
