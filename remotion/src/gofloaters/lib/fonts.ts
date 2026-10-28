import {continueRender, delayRender, staticFile} from 'remotion';
import {FONT_LABEL} from '../constants';

// Inter (SIL OFL) — the brand book's text/UI face — bundled locally, used only for the plan's room labels.
let loaded = false;

export const loadFonts = () => {
  if (loaded) return;
  loaded = true;
  const handle = delayRender('Loading GoFloaters fonts');
  const face = new FontFace(FONT_LABEL, `url(${staticFile('fonts/Inter-latin-var.woff2')}) format('woff2')`, {weight: '100 900'});
  face
    .load()
    .then((f) => {
      document.fonts.add(f);
      continueRender(handle);
    })
    .catch((err) => {
      console.error(err);
      continueRender(handle);
    });
};
