import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

// Inter (SIL OFL, public/fonts) is bundled locally so renders never depend on a font CDN.
// loadFont() blocks rendering until the face is ready — no flash of fallback text in frames.
export const FONT_FAMILY = 'Inter';

loadFont({
  family: FONT_FAMILY,
  url: staticFile('fonts/Inter-var.woff2'),
  weight: '100 900',
  display: 'block',
});

export const COLORS = {
  ink: '#070B1A',
  night: '#0E1430',
  surface: '#161E3F',
  text: '#F5F7FF',
  muted: '#A8B0D6',
  cyan: '#4FE3D3',
  violet: '#8C6CFF',
  amber: '#FFC857',
  pink: '#FF6FA8',
} as const;

export const FONT = {
  family: `'${FONT_FAMILY}', system-ui, sans-serif`,
  // Sizes are for a 1920-wide frame; multiply by useScale() so they track the composition size.
  size: {hero: 132, title: 96, heading: 64, body: 40, caption: 30, eyebrow: 26},
  weight: {regular: 400, medium: 500, semibold: 600, bold: 700, black: 800},
  tracking: {tight: '-0.035em', normal: '-0.01em', wide: '0.18em'},
} as const;
