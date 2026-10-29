import {continueRender, delayRender, staticFile} from 'remotion';

// Brand fonts were not supplied. Substitutes per the brief (SIL OFL, bundled locally so preview
// and render never depend on the network): Bricolage Grotesque for headlines, Inter for UI.
// Bricolage's latin-ext subset carries the ₹ glyph, so both subsets are registered.
export const FONT_HEAD = 'Tilo Bricolage Grotesque';
export const FONT_UI = 'Tilo Inter';

let loaded = false;

export const loadTiloFonts = () => {
  if (loaded) return;
  loaded = true;
  const handle = delayRender('Loading Tilo fonts');
  const faces = [
    new FontFace(FONT_HEAD, `url(${staticFile('fonts/BricolageGrotesque-latin-var.woff2')}) format('woff2')`, {
      weight: '200 800',
      unicodeRange: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
    }),
    new FontFace(FONT_HEAD, `url(${staticFile('fonts/BricolageGrotesque-latin-ext-var.woff2')}) format('woff2')`, {
      weight: '200 800',
      unicodeRange: 'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
    }),
    new FontFace(FONT_UI, `url(${staticFile('fonts/Inter-latin-var.woff2')}) format('woff2')`, {weight: '100 900'}),
  ];
  Promise.all(faces.map((f) => f.load()))
    .then((ready) => {
      ready.forEach((f) => document.fonts.add(f));
      return document.fonts.ready;
    })
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error(err);
      continueRender(handle);
    });
};
