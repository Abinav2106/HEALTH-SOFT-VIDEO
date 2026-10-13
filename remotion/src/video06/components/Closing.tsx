import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {COLORS, FONT_SANS, HEIGHT, SHOTS, WIDTH} from '../constants';
import {EASE_IN_OUT, EASE_OUT, progress} from '../lib/motion';
import {Headline} from './Headline';
import {MaskedLines} from './MaskedLines';
import {StockShot} from './StockShot';

const LOGO = {src: 'brand/healthsoft_logo_original.png', size: 447};
// The closing shot hands over to the end card through an ivory foreground that rises from the bottom,
// the same gesture as the guidance foreground, landing on the ivory end card.
const WHITE_RISE = {from: 708, to: SHOTS.s12.from};

// 27–30 s: closing human moment with the tagline. 30–32 s: official logo and the single CTA.
export const Closing: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < SHOTS.s11.from) return null;

  if (frame < SHOTS.s12.from) {
    const rise = progress(frame, WHITE_RISE.from, WHITE_RISE.to - WHITE_RISE.from, EASE_IN_OUT);
    const top = (1 - rise) * (HEIGHT + 160);
    return (
      <AbsoluteFill>
        <StockShot id="s11" from={SHOTS.s11.from} to={SHOTS.s11.to} />
        <Headline lines={['Care that', 'fits real life.']} inAt={654} outAt={702} />
        {rise > 0 ? (
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: top - 160,
              height: HEIGHT + 160,
              background: `linear-gradient(to bottom, rgba(250,247,242,0) 0px, ${COLORS.ivory} 160px)`,
            }}
          />
        ) : null}
      </AbsoluteFill>
    );
  }

  const logo = progress(frame, SHOTS.s12.from, 14, EASE_OUT);
  const underline = progress(frame, 730, 12, EASE_OUT);

  return (
    <AbsoluteFill style={{background: COLORS.ivory}}>
      {/* Official logo file, unaltered, drawn 1:1; multiply lets its white ground take the ivory card. */}
      <div
        style={{
          position: 'absolute',
          left: Math.round((WIDTH - LOGO.size) / 2),
          top: 600,
          width: LOGO.size,
          height: LOGO.size,
          clipPath: `inset(${(1 - logo) * 100}% 0 0 0)`,
          opacity: Math.min(1, logo * 1.6),
          transform: `translateY(${(1 - logo) * 14}px)`,
          mixBlendMode: 'multiply',
        }}
      >
        <Img src={staticFile(LOGO.src)} style={{width: LOGO.size, height: LOGO.size, display: 'block'}} />
      </div>
      <MaskedLines
        inAt={726}
        dur={12}
        align="center"
        style={{left: 0, width: WIDTH, top: 1120, fontFamily: FONT_SANS}}
        lines={[
          {
            text: (
              <span style={{display: 'inline-flex', flexDirection: 'column', alignItems: 'stretch'}}>
                <span style={{display: 'inline-flex', alignItems: 'center', gap: 18, fontSize: 60, fontWeight: 600, letterSpacing: '-0.015em', color: COLORS.orange}}>
                  Find your fit
                  <svg width="50" height="32" viewBox="0 0 46 30" style={{marginTop: 4}}>
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
