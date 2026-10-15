import {cancelRender, continueRender, delayRender, staticFile} from 'remotion';
import {FONT} from '../constants';

// DM Sans (SIL OFL), bundled locally so every render uses the real face. Rendering is held until
// all three weights are loaded AND document.fonts confirms them; a missing weight fails the render.
const WEIGHTS = [400, 500, 700] as const;
let started = false;

export const loadWWFonts = () => {
  if (started) return;
  started = true;
  const handle = delayRender('Loading DM Sans');
  const faces = WEIGHTS.map(
    (w) =>
      new FontFace(FONT, `url(${staticFile(`fonts/dm-sans-latin-${w}-normal.woff2`)}) format('woff2')`, {
        weight: String(w),
        style: 'normal',
      }),
  );
  Promise.all(faces.map((face) => face.load()))
    .then((ready) => {
      ready.forEach((face) => document.fonts.add(face));
      const missing = WEIGHTS.filter((w) => !document.fonts.check(`${w} 40px "${FONT}"`));
      if (missing.length) throw new Error(`DM Sans weights not available: ${missing.join(', ')}`);
      continueRender(handle);
    })
    // Do not silently fall back to a system face.
    .catch((err) => cancelRender(err));
};
