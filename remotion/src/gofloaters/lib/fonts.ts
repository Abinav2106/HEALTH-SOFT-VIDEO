import {cancelRender, continueRender, delayRender, staticFile} from 'remotion';
import {FONT} from '../constants';

// DM Sans (Google Fonts variable file, opsz 9–40 × wght 100–1000, SIL OFL), bundled locally and
// loaded before any frame is captured. Weights used: 700 Bold (headlines), 500 Medium (labels),
// 400 Regular (supporting copy).
let loaded = false;

export const loadFonts = () => {
  if (loaded) return;
  loaded = true;
  const handle = delayRender('Loading DM Sans');
  const face = new FontFace(FONT, `url(${staticFile('gofloaters/fonts/DMSans-opsz-wght-var.woff2')}) format('woff2')`, {
    weight: '100 1000',
    style: 'normal',
  });
  face
    .load()
    .then((f) => {
      document.fonts.add(f);
      // Resolve every weight in use so no frame renders with a fallback face.
      return Promise.all([400, 500, 700].map((w) => document.fonts.load(`${w} 40px "${FONT}"`)));
    })
    .then(() => continueRender(handle))
    .catch((err) => {
      // Fail the render rather than silently fall back to another typeface.
      cancelRender(new Error(`DM Sans failed to load: ${err}`));
    });
};
