import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {COLORS, END, FONT_SANS, LOGO, WIDTH} from '../constants';
import {EASE_IN_OUT, EASE_OUT, progress} from '../lib/motion';
import {requireStatic, useRenderMode} from '../lib/renderMode';

const LOGO_W = 1080;
const LOGO_H = Math.round((LOGO_W * LOGO.height) / LOGO.width);

// Cyan panel crosses the frame left→right (the airplane's direction of travel) and uncovers the end frame.
export const EndWipe: React.FC = () => {
  const frame = useCurrentFrame();
  const {from, to} = END.wipe;
  if (frame < from || frame >= to) return null;
  const mid = (from + to) / 2;
  const inP = progress(frame, from, mid - from, EASE_IN_OUT);
  const outP = progress(frame, mid, to - mid, EASE_IN_OUT);
  const left = frame < mid ? -WIDTH + inP * WIDTH : outP * WIDTH;
  return <div style={{position: 'absolute', top: 0, bottom: 0, left, width: WIDTH, background: COLORS.cyan}} />;
};

// Clean brand end frame: the supplied artwork (wordmark and tagline included) drawn unaltered on its own white,
// the campaign line, and a small CTA. Settles by frame 524 and holds to the end (≥ 1.5 s readable).
export const EndFrame: React.FC = () => {
  const frame = useCurrentFrame();
  const {strict} = useRenderMode();
  if (frame < (END.wipe.from + END.wipe.to) / 2) return null;
  const ok = requireStatic(LOGO.src, strict);
  const logo = progress(frame, END.logoIn, 12, EASE_OUT);
  const line = progress(frame, END.lineIn, 10, EASE_OUT);
  const cta = progress(frame, END.ctaIn, 10, EASE_OUT);
  const mark = progress(frame, END.lineIn + 6, 10, EASE_OUT);

  return (
    <AbsoluteFill style={{background: COLORS.paper, fontFamily: FONT_SANS}}>
      <div
        style={{
          position: 'absolute',
          left: (WIDTH - LOGO_W) / 2,
          top: 150,
          width: LOGO_W,
          height: LOGO_H,
          opacity: logo,
          transform: `translateX(${(1 - logo) * -40}px)`,
        }}
      >
        {ok ? (
          <Img src={staticFile(LOGO.src)} style={{width: LOGO_W, height: LOGO_H, display: 'block'}} />
        ) : (
          <div style={{width: '100%', height: '100%', border: `2px dashed ${COLORS.cyan}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, color: COLORS.inkSoft}}>
            OFFICIAL LOGO PENDING — public/{LOGO.src}
          </div>
        )}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 150 + LOGO_H + 56,
          display: 'flex',
          justifyContent: 'center',
          gap: 26,
          fontSize: 76,
          fontWeight: 850,
          letterSpacing: '-0.025em',
          color: COLORS.ink,
          opacity: line,
          transform: `translateY(${(1 - line) * 20}px)`,
        }}
      >
        <span>FIND YOUR SPACE.</span>
        <span style={{position: 'relative'}}>
          <span
            style={{
              position: 'absolute',
              left: -8,
              right: -8,
              bottom: 8,
              height: 30,
              borderRadius: 6,
              background: COLORS.yellow,
              transformOrigin: 'left center',
              transform: `scaleX(${mark})`,
            }}
          />
          <span style={{position: 'relative'}}>GET TO WORK.</span>
        </span>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 150 + LOGO_H + 196, display: 'flex', justifyContent: 'center', opacity: cta, transform: `translateY(${(1 - cta) * 14}px)`}}>
        <div style={{padding: '16px 36px', borderRadius: 999, background: COLORS.cyan, fontSize: 30, fontWeight: 750, color: COLORS.ink, letterSpacing: '-0.005em'}}>
          Find your workspace&nbsp;&nbsp;→
        </div>
      </div>
    </AbsoluteFill>
  );
};
