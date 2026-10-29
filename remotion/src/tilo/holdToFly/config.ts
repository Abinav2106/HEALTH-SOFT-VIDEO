import {z} from 'zod';
import {defaultConfig, tiloSchema, type TiloConfig} from '../config';

// Tilo — Hold to Fly. 16 s / 480 frames. Shares the Reward Flight engine (city, flight camera,
// rear-view Tilo) and adds the marker → ticket reveal.
//
// Two clocks:
//  • World/flight: path.speed keys are the ORIGINAL normal flight speed; path.worldRate = 2 authors
//    the whole city journey at double that rate, held constant until the arrival.
//  • Overlay/UI: every value in `hold` and `timing` is in normal output frames, so the reveal and
//    the reading hold are not shortened.
// No numeric speed label is drawn anywhere: Instagram's own 2× playback is the viewer's.

export const HOLD_DURATION = 480;

const span = z.tuple([z.number(), z.number()]);

export const holdSchema = tiloSchema.extend({
  hold: z.object({
    copyIn: z.number(),
    copyOut: span, // fade window; everything gone by the end frame
    ringIn: z.number(),
    ringFrames: z.number(),
    edgeStreaks: z.object({opacity: z.number(), count: z.number(), until: z.number()}),
    markerCompress: span, // ~5 % squeeze before it opens
    markerOpen: span, // two faces part along the central seam
    markerOpenDeg: z.number(),
    roofRing: span,
    ticketEmerge: span, // ticket rises out from between the faces
    ticketLift: span, // ticket travels toward the centre of the screen
    ticketLiftY: z.number(), // screen y of the ticket centre at the end of the lift
    ticketLiftScale: z.number(),
    ticketSettle: span, // into its final card slot in the sheet
    ticketStartRotateDeg: z.number(),
    amountReveal: span, // one clean mask reveal, digits together
    qualifierIn: z.number(),
    copyBlockIn: z.number(), // label + headline
    supportingIn: z.number(),
    ctaIn: z.number(),
    ctaRisePx: z.number(),
    closingIn: z.number(),
    highlight: span, // one sheen across the ticket edge during the hold
    ticketWidth: z.number(),
    ticketHeight: z.number(),
  }),
});

export type HoldConfig = z.infer<typeof holdSchema>;

const base: TiloConfig = defaultConfig;

export const holdDefaults: HoldConfig = {
  ...base,
  copy: {
    ...base.copy,
    headline: 'HOLD RIGHT.\nFLY FASTER.',
    holdCue: '',
    toast: '',
    sheetLabel: 'GOFLOATERS / SPARK HUNT',
    sheetHeadline: 'YOUR GOLDEN FIND?',
    amount: '₹1,00,000',
    amountQualifier: 'TOTAL PRIZE POOL',
    supporting: 'Play for a chance to win.',
    cta: 'FIND YOUR SPARK →',
    closing: 'Don’t miss your chance.',
    terms: 'Terms apply.',
  },
  shots: {
    s01: [0, 45],
    s02: [45, 120],
    s03: [120, 195],
    s04: [195, 270],
    s05: [270, 315],
    s06: [315, 480],
  },
  timing: {
    ...base.timing,
    headlineIn: 2,
    openingOutFrames: 8,
    markerFadeIn: 146,
    markerApproachPulse: 100000, // unused here
    markerFound: 100000,
    toastIn: 100000,
    toastOut: 100000,
    sheetRiseStart: 294,
    sheetSlideFrames: 11, // 315 → 326 (10.85 s)
    ctaIn: 334,
    closingIn: 336,
    ctaEmphasis: 100000, // no button pulse in this cut
  },
  aircraft: {...base.aircraft, bobPx: 4, maxBankDeg: 6},
  path: {
    // ORIGINAL normal speed (m/s); worldRate doubles it. Constant until the controlled arrival.
    speed: [
      {frame: 0, value: 46},
      {frame: 222, value: 46},
      {frame: 266, value: 0},
    ],
    turnRate: [
      {frame: 0, value: 0},
      {frame: 124, value: 0},
      {frame: 142, value: 8},
      {frame: 170, value: 8},
      {frame: 190, value: 0},
      {frame: 200, value: 0},
      {frame: 212, value: -3},
      {frame: 226, value: -3},
      {frame: 238, value: 0},
    ],
    altitude: [
      {frame: 0, value: 64},
      {frame: 200, value: 64},
      {frame: 266, value: 58},
    ],
    destinationAhead: 17,
    worldRate: 2,
  },
  camera: {...base.camera, reframeTiloScreenY: 0.205},
  city: {...base.city, markerAltitude: 59},
  ui: {
    ...base.ui,
    headline: {x: 64, y: 250},
    headlineSize: 108,
    headlineMaxWidth: 760,
    sheetPartialTop: 1540,
    sheetFinalTop: 640,
    compassHideAtReveal: false,
    backgroundVeil: 0.22,
    backgroundBlurPx: 3,
  },
  audio: {...base.audio, chime: 0.4},
  review: {playbackSpeed: 1, burnIn: false},
  hold: {
    copyIn: 2,
    copyOut: [37, 44],
    ringIn: 10,
    ringFrames: 26,
    edgeStreaks: {opacity: 0.32, count: 5, until: 250},
    markerCompress: [270, 275],
    markerOpen: [275, 290],
    markerOpenDeg: 38,
    roofRing: [278, 306],
    ticketEmerge: [277, 291],
    ticketLift: [289, 315],
    ticketLiftY: 700,
    ticketLiftScale: 0.56,
    ticketSettle: [315, 326],
    ticketStartRotateDeg: -5,
    amountReveal: [326, 334],
    qualifierIn: 331,
    copyBlockIn: 324,
    supportingIn: 332,
    ctaIn: 334,
    ctaRisePx: 12,
    closingIn: 336,
    highlight: [384, 410],
    ticketWidth: 800,
    ticketHeight: 320,
  },
};
