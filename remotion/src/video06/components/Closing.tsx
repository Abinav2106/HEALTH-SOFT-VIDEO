import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {COLORS, FONT_SANS, FONT_SERIF, HEIGHT, SHOTS, WIDTH} from '../constants';
import {EASE_IN_OUT, EASE_OUT, progress} from '../lib/motion';
import {MaskedLines} from './MaskedLines';
import {StockShot} from './StockShot';

const LOGO = {src: 'brand/healthsoft_logo_original.png', size: 447};
// The closing shot hands over to the end card through a white foreground that rises from the bottom,
// the same gesture as the guidance foreground, landing on the logo's own white.
const WHITE_RISE = {from: 704, to: SHOTS.s12.from};

export const Closing: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < SHOTS.s11.from) return null;

  if (frame < SHOTS.s12.from) {
    const rise = progress(frame, WHITE_RISE.from, WHITE_RISE.to - WHITE_RISE.from, EASE_IN_OUT);
    const top = (1 - rise) * (HEIGHT + 160);
    return (
      <AbsoluteFill>
        <StockShot id="s11" from={SHOTS.s11.from} to={SHOTS.s11.to} />
        <MaskedLines
          inAt={668}
          outAt={700}
          stagger={5}
          style={{left: 84, top: 1218}}
          lines={['More', 'good days', 'ahead.'].map((t) => ({
            text: t,
            style: {fontFamily: FONT_SERIF, fontStyle: 'italic', fontSize: 112, fontWeight: 500, color: COLORS.white, lineHeight: 1.02, textShadow: '0 2px 28px rgba(0,0,0,0.38)'},
          }))}
        />
        {rise > 0 ? (
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: top - 160,
              height: HEIGHT + 160,
              background: `linear-gradient(to bottom, rgba(255,255,255,0) 0px, ${COLORS.white} 160px)`,
            }}
          />
        ) : null}
      </AbsoluteFill>
    );
  }

  const logo = progress(frame, SHOTS.s12.from, 14, EASE_OUT);
  const underline = progress(frame, 724, 12, EASE_OUT);

  return (
    <AbsoluteFill style={{background: COLORS.white}}>
      {/* Official logo file, unaltered, on the same pure white as its own background; drawn 1:1. */}
      <div
        style={{
          position: 'absolute',
          left: Math.round((WIDTH - LOGO.size) / 2),
          top: 462,
          width: LOGO.size,
          height: LOGO.size,
          clipPath: `inset(${(1 - logo) * 100}% 0 0 0)`,
          opacity: Math.min(1, logo * 1.6),
          transform: `translateY(${(1 - logo) * 14}px)`,
        }}
      >
        <Img src={staticFile(LOGO.src)} style={{width: LOGO.size, height: LOGO.size, display: 'block'}} />
      </div>
      <MaskedLines
        inAt={718}
        stagger={4}
        dur={12}
        align="center"
        style={{left: 0, width: WIDTH, top: 1010, fontFamily: FONT_SANS}}
        lines={[
          {text: 'Care that', style: {fontSize: 82, fontWeight: 600, letterSpacing: '-0.03em', color: COLORS.ink, lineHeight: 1.04}},
          {text: 'fits real life.', style: {fontSize: 82, fontWeight: 600, letterSpacing: '-0.03em', color: COLORS.ink, lineHeight: 1.04}},
        ]}
      />
      <MaskedLines
        inAt={722}
        dur={12}
        align="center"
        style={{left: 0, width: WIDTH, top: 1252, fontFamily: FONT_SANS}}
        lines={[
          {
            text: (
              <span style={{display: 'inline-flex', flexDirection: 'column', alignItems: 'stretch'}}>
                <span style={{display: 'inline-flex', alignItems: 'center', gap: 18, fontSize: 54, fontWeight: 600, letterSpacing: '-0.015em', color: COLORS.orange}}>
                  Find your fit
                  <svg width="46" height="30" viewBox="0 0 46 30" style={{marginTop: 4}}>
                    <path d="M2 15 H42 M29 3 L42 15 L29 27" fill="none" stroke={COLORS.orange} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                {/* The thread resolves here, under the call to action. */}
                <span style={{height: 6, borderRadius: 3, background: COLORS.orange, marginTop: 16, transformOrigin: '0 50%', transform: `scaleX(${underline})`}} />
              </span>
            ),
          },
        ]}
      />
    </AbsoluteFill>
  );
};
