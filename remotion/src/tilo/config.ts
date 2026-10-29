import {z} from 'zod';
import {zColor} from '@remotion/zod-types';

// Tilo — The Reward Flight. Every value a designer may want to change lives here and is
// exposed as composition props (editable in Remotion Studio's props panel).

export const WIDTH = 1080;
export const HEIGHT = 1920;
export const FPS = 30;
export const DURATION = 720; // 24 s master at normal playback speed

const key = z.object({frame: z.number(), value: z.number()});
const box = z.object({x: z.number(), y: z.number()});

export const tiloSchema = z.object({
  copy: z.object({
    headline: z.string(),
    holdCue: z.string(),
    toast: z.string(),
    sheetLabel: z.string(),
    sheetHeadline: z.string(),
    amount: z.string(),
    amountQualifier: z.string(),
    supporting: z.string(),
    cta: z.string(),
    closing: z.string(),
    terms: z.string(),
  }),
  colors: z.object({
    turquoise: zColor(),
    turquoiseText: zColor(),
    yellow: zColor(),
    paleYellow: zColor(),
    ink: zColor(),
    white: zColor(),
    // Environment (matched to the storyboard's game map, not forced into the brand palette)
    haze: zColor(),
    zenith: zColor(),
    road: zColor(),
    parcels: z.array(zColor()),
    building: zColor(),
    floorLine: zColor(),
    roof: zColor(),
    foundation: zColor(),
    rooftopBox: zColor(),
  }),
  // Narrative beats (global frames, inclusive start / exclusive end).
  shots: z.object({
    s01: z.tuple([z.number(), z.number()]),
    s02: z.tuple([z.number(), z.number()]),
    s03: z.tuple([z.number(), z.number()]),
    s04: z.tuple([z.number(), z.number()]),
    s05: z.tuple([z.number(), z.number()]),
    s06: z.tuple([z.number(), z.number()]),
  }),
  timing: z.object({
    headlineIn: z.number(),
    cueIn: z.number(),
    openingOutFrames: z.number(),
    markerFadeIn: z.number(),
    markerApproachPulse: z.number(),
    markerFound: z.number(),
    toastIn: z.number(),
    toastOut: z.number(),
    sheetRiseStart: z.number(),
    sheetSlideFrames: z.number(),
    cardRevealFrames: z.number(),
    ticketSettle: z.number(),
    ctaIn: z.number(),
    closingIn: z.number(),
    ctaEmphasis: z.number(),
  }),
  aircraft: z.object({
    widthFraction: z.number(), // of frame width at the cruise camera distance
    screenY: z.number(), // aircraft centre, fraction of frame height, straight flight
    bobPx: z.number(),
    bobPeriodFrames: z.number(),
    maxBankDeg: z.number(),
    bankPerTurnRate: z.number(), // degrees of bank per (deg/s) of turn rate
  }),
  // World-space flight path: one continuous global timeline, never reset per shot.
  path: z.object({
    speed: z.array(key), // metres / second
    turnRate: z.array(key), // degrees / second, + = right
    altitude: z.array(key), // metres
    destinationAhead: z.number(), // building centre this far beyond the hover point (m)
  }),
  camera: z.object({
    fovDeg: z.number(),
    back: z.number(),
    up: z.number(),
    headingLag: z.number(), // 0..1 per-frame follow factor for the camera position
    yawLag: z.number(), // 0..1 per-frame follow factor for where it looks
    rollFactor: z.number(),
    reframePullback: z.number(), // camera distance multiplier once the sheet is up
    reframeTiloScreenY: z.number(), // aircraft centre once the sheet is up
  }),
  city: z.object({
    seed: z.number(),
    block: z.number(),
    jitter: z.number(),
    roadHalfWidth: z.number(),
    lotGap: z.number(),
    buildingChance: z.number(),
    floorHeight: z.number(),
    maxFloors: z.number(),
    destinationFloors: z.number(),
    destinationSize: z.number(),
    rooftopBoxHeight: z.number(),
    markerAltitude: z.number(),
    rotationDeg: z.number(),
    radius: z.number(),
    fogNear: z.number(),
    fogFar: z.number(),
  }),
  ui: z.object({
    headline: box,
    headlineSize: z.number(),
    headlineMaxWidth: z.number(),
    cueRight: z.number(),
    cueTop: z.number(),
    compass: z.object({right: z.number(), top: z.number(), size: z.number()}),
    sheetPartialTop: z.number(),
    sheetFinalTop: z.number(),
    contentLeft: z.number(),
    contentRight: z.number(), // keeps reward content clear of the platform's right rail
    backgroundVeil: z.number(),
    backgroundBlurPx: z.number(),
  }),
  audio: z.object({
    enabled: z.boolean(),
    bed: z.number(),
    wind: z.number(),
    chime: z.number(),
    ui: z.number(),
  }),
  review: z.object({
    playbackSpeed: z.number(), // 1 = master. 2 = review the whole film at Instagram 2×
    burnIn: z.boolean(),
  }),
});

export type TiloConfig = z.infer<typeof tiloSchema>;

export const defaultConfig: TiloConfig = {
  copy: {
    headline: 'READY FOR TAKE-OFF?',
    holdCue: 'HOLD RIGHT → 2×',
    toast: 'DESTINATION FOUND',
    sheetLabel: 'GOFLOATERS • REWARD ZONE',
    sheetHeadline: 'YOUR NEXT FIND?',
    amount: '₹1,00,000',
    amountQualifier: 'TOTAL PRIZE POOL',
    supporting: 'Play for a chance to win.',
    cta: 'PLAY TO REVEAL →',
    closing: 'Don’t miss your chance.',
    terms: 'Terms apply.',
  },
  colors: {
    turquoise: '#6ED0E0',
    turquoiseText: '#1B8597',
    yellow: '#FCE162',
    paleYellow: '#FFF5CC',
    ink: '#050506',
    white: '#FFFFFF',
    haze: '#E4ECF1',
    zenith: '#BCD4E5',
    road: '#FCFCFD',
    parcels: ['#EAE3E5', '#EFEAE0', '#E7E4E1', '#E5E0E7', '#ECE6DE'],
    building: '#7C8DA4',
    floorLine: '#F4F6F8',
    roof: '#F2CF55',
    foundation: '#F7DB78',
    rooftopBox: '#9AA6B6',
  },
  shots: {
    s01: [0, 90],
    s02: [90, 180],
    s03: [180, 330],
    s04: [330, 480],
    s05: [480, 600],
    s06: [600, 720],
  },
  timing: {
    headlineIn: 3,
    cueIn: 16,
    openingOutFrames: 8,
    markerFadeIn: 330,
    markerApproachPulse: 420,
    markerFound: 492,
    toastIn: 496,
    toastOut: 592,
    sheetRiseStart: 548,
    sheetSlideFrames: 12,
    cardRevealFrames: 8,
    ticketSettle: 610,
    ctaIn: 612,
    closingIn: 616,
    ctaEmphasis: 650,
  },
  aircraft: {
    widthFraction: 0.43,
    screenY: 0.7,
    bobPx: 5,
    bobPeriodFrames: 54,
    maxBankDeg: 7,
    bankPerTurnRate: 0.75,
  },
  path: {
    speed: [
      {frame: 0, value: 46},
      {frame: 360, value: 46},
      {frame: 479, value: 15},
      {frame: 528, value: 0},
    ],
    turnRate: [
      {frame: 0, value: 0},
      {frame: 186, value: 0},
      {frame: 204, value: 9.5},
      {frame: 282, value: 9.5},
      {frame: 312, value: 0},
      {frame: 352, value: 0},
      {frame: 370, value: -4},
      {frame: 398, value: -4},
      {frame: 418, value: 0},
    ],
    altitude: [
      {frame: 0, value: 64},
      {frame: 340, value: 64},
      {frame: 520, value: 53},
    ],
    destinationAhead: 12,
  },
  camera: {
    fovDeg: 62,
    back: 46,
    up: 36,
    headingLag: 0.09,
    yawLag: 0.07,
    rollFactor: 0.3,
    reframePullback: 1.35,
    reframeTiloScreenY: 0.205,
  },
  city: {
    seed: 7,
    block: 66,
    jitter: 9,
    roadHalfWidth: 2.6,
    lotGap: 1.7,
    buildingChance: 0.3,
    floorHeight: 3.2,
    maxFloors: 10,
    destinationFloors: 11,
    destinationSize: 34,
    rooftopBoxHeight: 3.5,
    markerAltitude: 57,
    rotationDeg: 14,
    radius: 1300,
    fogNear: 380,
    fogFar: 1500,
  },
  ui: {
    headline: {x: 64, y: 252},
    headlineSize: 96,
    headlineMaxWidth: 600,
    cueRight: 60,
    cueTop: 372,
    compass: {right: 56, top: 236, size: 108},
    sheetPartialTop: 1464,
    sheetFinalTop: 612,
    contentLeft: 100,
    contentRight: 940,
    backgroundVeil: 0.3,
    backgroundBlurPx: 4,
  },
  audio: {
    enabled: true,
    bed: 0.5,
    wind: 0.35,
    chime: 0.45,
    ui: 0.4,
  },
  review: {
    playbackSpeed: 1,
    burnIn: false,
  },
};
