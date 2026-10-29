import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {ASSETS, BOLD, C, COPY, FONT, MEDIUM} from '../constants';
import {EASE_IN_OUT, lerp, prog} from '../lib/motion';
import {Logo} from './Logo';
import {Tilo} from './Tilo';

// G · 24–27 s. "Pick a city. Discover your next workspace."
// The white workspace-discovery interface rises over the reward as one panel. The photographic
// preview slides into place, the city choices reveal row by row, and Chennai gives one subtle
// selection response. Then the preview card becomes H's mystery card (S7Mystery).

export const PANEL = {from: 690, dur: 28};
const WHERE_AT = 712;
export const PREVIEW = {x: 60, y: 420, w: 960, h: 500, r: 40};
const PREVIEW_IN = {from: 722, dur: 20};
const ROWS_AT = 732; // on "Pick a city", one row every 5 frames
const SELECT = {from: 764, dur: 14}; // Chennai
const EXPLORE_AT = 752;
export const HANDOFF = 796; // H takes the preview card and Tilo from here

// Preview crop of the room plate (1328x2376): the window band, framed to 960x500.
const CROP = {x: 290, y: 650, w: 1038};
const CROP_S = PREVIEW.w / CROP.w;

const CHIP = {w: 450, h: 112, x: [70, 560], y0: 1012, gap: 140};

export const PreviewPhoto: React.FC = () => (
  <Img
    src={staticFile(ASSETS.roomBg)}
    style={{position: 'absolute', left: -CROP.x * CROP_S, top: -CROP.y * CROP_S, width: 1328 * CROP_S, height: 2376 * CROP_S}}
  />
);

/** Where G leaves Tilo — H picks the hero up from exactly here. */
export const TILO_G = {x: 830, y: 860, w: 290};

const Chip: React.FC<{label: string; r: number; c: number; f: number}> = ({label, r, c, f}) => {
  const p = prog(f, ROWS_AT + r * 5, 12);
  const sel = label === 'Chennai' ? prog(f, SELECT.from, SELECT.dur, EASE_IN_OUT) : 0;
  const pulse = label === 'Chennai' ? Math.sin(prog(f, SELECT.from, SELECT.dur) * Math.PI) * 0.035 : 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: CHIP.x[c],
        top: CHIP.y0 + r * CHIP.gap + lerp(26, 0, p),
        width: CHIP.w,
        height: CHIP.h,
        borderRadius: 26,
        border: `${lerp(3, 4, sel)}px solid ${C.blue}`,
        boxSizing: 'border-box',
        backgroundColor: `rgba(101, 202, 218, ${0.28 * sel})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: FONT,
        fontWeight: MEDIUM,
        fontSize: 42,
        color: C.navy,
        opacity: p,
        transform: `scale(${1 + pulse})`,
      }}
    >
      {label}
    </div>
  );
};

export const S6Next: React.FC<{f: number}> = ({f}) => {
  const panel = prog(f, PANEL.from, PANEL.dur, EASE_IN_OUT);
  const top = lerp(1920, 0, panel);
  const where = prog(f, WHERE_AT, 16);
  const pv = prog(f, PREVIEW_IN.from, PREVIEW_IN.dur);
  const tiloIn = prog(f, PREVIEW_IN.from + 4, 24, EASE_IN_OUT);

  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, top, width: 1080, height: 1920, backgroundColor: C.white, borderRadius: `${lerp(56, 0, panel)}px ${lerp(56, 0, panel)}px 0 0`, overflow: 'hidden'}}>
        <div>{/* stays solid: H's navy wipe covers it */}
          <Logo opacity={prog(f, PANEL.from + 10, 14)} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 246, height: 130, overflow: 'hidden', textAlign: 'center'}}>
            <div style={{fontFamily: FONT, fontWeight: BOLD, fontSize: 112, lineHeight: '130px', letterSpacing: '-0.035em', color: C.navy, transform: `translateY(${lerp(100, 0, where)}%)`}}>
              {COPY.whereNext}
            </div>
          </div>
          {/* carousel position */}
          <div style={{position: 'absolute', left: 540 - 50, top: 952, display: 'flex', gap: 12, opacity: pv}}>
            <div style={{width: 44, height: 14, borderRadius: 7, backgroundColor: C.blue}} />
            <div style={{width: 14, height: 14, borderRadius: 7, backgroundColor: '#D3E3E9'}} />
            <div style={{width: 14, height: 14, borderRadius: 7, backgroundColor: '#D3E3E9'}} />
          </div>
          {COPY.cities.map((row, r) => row.map((label, c) => <Chip key={label} label={label} r={r} c={c} f={f} />))}
          <div style={{position: 'absolute', left: 0, right: 0, top: 1590, textAlign: 'center', fontFamily: FONT, fontWeight: MEDIUM, fontSize: 42, color: C.navy, opacity: prog(f, EXPLORE_AT, 14)}}>
            {COPY.explore}
          </div>
        </div>
        {/* the photographic preview slides in; at the hand-off H takes it over */}
        {f < HANDOFF && (
          <div
            style={{
              position: 'absolute',
              left: PREVIEW.x + lerp(1080, 0, pv),
              top: PREVIEW.y,
              width: PREVIEW.w,
              height: PREVIEW.h,
              borderRadius: PREVIEW.r,
              overflow: 'hidden',
            }}
          >
            <PreviewPhoto />
          </div>
        )}
      </div>
      {f < HANDOFF && tiloIn > 0 && (
        <Tilo f={f} x={lerp(1300, TILO_G.x, tiloIn)} y={TILO_G.y + Math.sin(((f - 726) / 30) * Math.PI * 0.6) * 4} width={TILO_G.w} rotate={-2} />
      )}
    </AbsoluteFill>
  );
};
