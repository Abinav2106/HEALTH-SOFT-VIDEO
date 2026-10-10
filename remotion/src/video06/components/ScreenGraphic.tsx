import React from 'react';
import {Img, staticFile} from 'remotion';
import {COLORS, FONT_SANS, PRODUCTS, PRODUCT_ORDER, PRODUCT_PHOTO, Quad} from '../constants';
import {cornerPinMatrix} from '../lib/cornerPin';

// Editorial selection graphic for the laptop screen: the original product photograph on its own
// cream ground, with the approved product names. No basket, checkout or purchase state.
export const ScreenGraphic: React.FC<{w: number; h: number; chrome: number}> = ({w, h, chrome}) => {
  return (
    <div style={{width: w, height: h, background: COLORS.cream, position: 'relative', overflow: 'hidden'}}>
      <Img
        src={staticFile(PRODUCT_PHOTO.src)}
        style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain'}}
      />
      {chrome > 0 ? (
        <div
          style={{
            position: 'absolute',
            left: 110,
            top: h / 2 - 120,
            fontFamily: FONT_SANS,
            color: COLORS.ink,
            opacity: chrome,
            display: 'flex',
            flexDirection: 'column',
            gap: 26,
          }}
        >
          {PRODUCT_ORDER.map((k) => (
            <div key={k}>
              <div style={{fontSize: 22, fontWeight: 600, letterSpacing: '0.16em', color: COLORS.orange}}>
                {PRODUCTS[k].category.toUpperCase()}
              </div>
              <div style={{fontSize: 40, fontWeight: 500, marginTop: 4}}>{PRODUCTS[k].name}</div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

// Pins a w×h layer onto a quad, with a faint display falloff so it sits in the screen rather than on it.
export const PinnedScreen: React.FC<{quad: Quad; w: number; h: number; chrome: number; glare: number}> = ({quad, w, h, chrome, glare}) => {
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: w, height: h, transformOrigin: '0 0', transform: cornerPinMatrix(w, h, quad)}}>
      <ScreenGraphic w={w} h={h} chrome={chrome} />
      {glare > 0 ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: glare,
            background:
              'linear-gradient(115deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 38%), radial-gradient(140% 120% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.18) 100%)',
          }}
        />
      ) : null}
    </div>
  );
};
