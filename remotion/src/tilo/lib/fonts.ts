import {continueRender, delayRender, staticFile} from 'remotion';
import {FONT_CARD} from '../constants';

// DM Sans (SIL OFL), bundled locally: public/fonts/DMSans-latin-var.woff2.
let loaded = false;

export const loadCardFont = () => {
  if (loaded) return;
  loaded = true;
  const handle = delayRender('Loading DM Sans');
  const face = new FontFace(FONT_CARD, `url(${staticFile('fonts/DMSans-latin-var.woff2')}) format('woff2')`, {
    weight: '100 1000',
    style: 'normal',
  });
  face
    .load()
    .then((ready) => {
      document.fonts.add(ready);
      continueRender(handle);
    })
    .catch((err) => {
      console.error(err);
      continueRender(handle);
    });
};
