import {continueRender, delayRender, staticFile} from 'remotion';
import {FONT_SANS, FONT_SERIF} from '../constants';

// Substitute typefaces (SIL OFL) bundled locally until the brand fonts are supplied:
// Inter (sans) and Newsreader Italic (serif accent).
let loaded = false;

export const loadFonts = () => {
  if (loaded) return;
  loaded = true;
  const handle = delayRender('Loading Video 06 fonts');
  const faces = [
    new FontFace(FONT_SANS, `url(${staticFile('fonts/Inter-latin-var.woff2')}) format('woff2')`, {
      weight: '100 900',
      style: 'normal',
    }),
    new FontFace(FONT_SERIF, `url(${staticFile('fonts/Newsreader-italic-latin-var.woff2')}) format('woff2')`, {
      weight: '200 800',
      style: 'italic',
    }),
  ];
  Promise.all(faces.map((f) => f.load()))
    .then((ready) => {
      ready.forEach((f) => document.fonts.add(f));
      continueRender(handle);
    })
    .catch((err) => {
      console.error(err);
      continueRender(handle);
    });
};
