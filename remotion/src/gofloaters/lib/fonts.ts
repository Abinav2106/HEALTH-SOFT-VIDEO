import {continueRender, delayRender, staticFile} from 'remotion';
import {FONT_SANS} from '../constants';

// Inter (SIL OFL, already bundled for Video 06) for all UI and campaign type. The GoFloaters wordmark
// itself is only ever the supplied artwork — never re-set in a font.
let loaded = false;

export const loadFonts = () => {
  if (loaded) return;
  loaded = true;
  const handle = delayRender('Loading GoFloaters fonts');
  new FontFace(FONT_SANS, `url(${staticFile('fonts/Inter-latin-var.woff2')}) format('woff2')`, {weight: '100 900', style: 'normal'})
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
