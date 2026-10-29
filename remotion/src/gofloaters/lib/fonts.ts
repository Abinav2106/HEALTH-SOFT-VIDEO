import {cancelRender, continueRender, delayRender, staticFile} from 'remotion';
import {FONT} from '../constants';

// DM Sans (Google Fonts variable file, opsz 9–40 × wght 100–1000, SIL OFL), bundled locally and
// loaded before any frame is captured. Weights used: 500 Medium and 700 Bold.
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
      // Resolve both weights so no frame renders with a fallback face.
      return Promise.all([document.fonts.load(`500 40px "${FONT}"`), document.fonts.load(`700 40px "${FONT}"`)]);
    })
    .then(() => continueRender(handle))
    .catch((err) => {
      // Fail the render rather than silently fall back to another typeface.
      cancelRender(new Error(`DM Sans failed to load: ${err}`));
    });
};
