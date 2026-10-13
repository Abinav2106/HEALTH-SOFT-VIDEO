import React from 'react';
import {COLORS, FONT_SANS} from '../constants';
import {MaskedLines} from './MaskedLines';

// One headline style for every live-action title: Inter Bold, white over footage, line-masked in,
// still while read. Text sits on a shared baseline (last line ends ≈ y 1530) so the orange underline
// at y 1600 lands the same distance below every phrase.
export const HEADLINE_SIZE = 112;
const LAST_LINE_BOTTOM = 1530;

export const headlineStyle = (size = HEADLINE_SIZE): React.CSSProperties => ({
  fontFamily: FONT_SANS,
  fontSize: size,
  fontWeight: 700,
  color: COLORS.white,
  letterSpacing: '-0.035em',
  lineHeight: 1,
  textShadow: '0 2px 30px rgba(0,0,0,0.35)',
});

export const Headline: React.FC<{lines: string[]; inAt: number; outAt?: number; top?: number; size?: number}> = ({lines, inAt, outAt, top, size = HEADLINE_SIZE}) => {
  const gap = 8;
  const y = top ?? LAST_LINE_BOTTOM - lines.length * size - (lines.length - 1) * gap;
  return (
    <MaskedLines
      inAt={inAt}
      outAt={outAt}
      stagger={5}
      dur={13}
      style={{left: 84, top: y}}
      lines={lines.map((t, i) => ({text: t, style: {...headlineStyle(size), marginTop: i === 0 ? 0 : gap}}))}
    />
  );
};
