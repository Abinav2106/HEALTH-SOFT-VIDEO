import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BOLD, C, COPY, FONT, MEDIUM} from '../constants';
import {EASE_IN_OUT, lerp, prog} from '../lib/motion';
import {Bone} from './Bone';
import {Logo} from './Logo';
import {HANDOFF, PREVIEW, PreviewPhoto, TILO_G} from './S6Next';
import {Tilo} from './Tilo';

// H · 27–30 s. "Where's your Spark hiding? Enter the hunt."
// Navy opens out from behind G's preview card, which turns into the mystery card (photo → white face
// with the question mark, its dot resting on the Spark Bone). Title, question and CTA resolve by
// ~27.5 s and the finished composition holds to the end. Tilo carries over from G.

const MORPH = {from: HANDOFF, dur: 24};
const CARD = {cx: 540, cy: 1040, w: 560, h: 580, r: 52, rot: -6};
const TILO_H = {x: 860, y: 1210, w: 260};
const CTA = {x: 190, y: 1468, w: 700, h: 132};

export const S7Mystery: React.FC<{f: number}> = ({f}) => {
  const bg = prog(f, HANDOFF, 16, EASE_IN_OUT);
  const m = prog(f, MORPH.from, MORPH.dur, EASE_IN_OUT);
  const face = prog(f, MORPH.from + 8, 12);
  const title = prog(f, 806, 14);
  const q = (i: number) => prog(f, 806 + i * 4, 16);
  const cta = prog(f, 812, 13);
  const tilo = prog(f, HANDOFF, 26, EASE_IN_OUT);

  // preview rect (G) → mystery card rect (H)
  const pcx = PREVIEW.x + PREVIEW.w / 2;
  const pcy = PREVIEW.y + PREVIEW.h / 2;
  const w = lerp(PREVIEW.w, CARD.w, m);
  const h = lerp(PREVIEW.h, CARD.h, m);
  const cx = lerp(pcx, CARD.cx, m);
  const cy = lerp(pcy, CARD.cy, m);

  return (
    <AbsoluteFill>
      {/* navy opens out from the card as a circular wipe — no white/navy crossfade */}
      <AbsoluteFill style={{backgroundColor: C.navy, clipPath: `circle(${lerp(0, 2300, bg)}px at ${pcx}px ${pcy}px)`}}>
        <Logo reversed={1} />
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 268, textAlign: 'center', fontFamily: FONT, fontWeight: MEDIUM, fontSize: 46, color: C.white, opacity: title}}>
        {COPY.gameTitle}
      </div>
      {COPY.question.map((line, i) => (
        <div key={line} style={{position: 'absolute', left: 0, right: 0, top: 350 + i * 124, height: 132, overflow: 'hidden', textAlign: 'center'}}>
          <div style={{fontFamily: FONT, fontWeight: BOLD, fontSize: 112, lineHeight: '132px', letterSpacing: '-0.035em', color: C.white, transform: `translateY(${lerp(100, 0, q(i))}%)`}}>
            {line}
          </div>
        </div>
      ))}

      {/* G's preview card becoming the mystery card */}
      <div
        style={{
          position: 'absolute',
          left: cx - w / 2,
          top: cy - h / 2,
          width: w,
          height: h,
          borderRadius: lerp(PREVIEW.r, CARD.r, m),
          overflow: 'hidden',
          backgroundColor: C.white,
          transform: `rotate(${lerp(0, CARD.rot, m)}deg)`,
          boxShadow: `0 0 0 ${lerp(0, 8, m)}px ${C.blue}`,
        }}
      >
        <div style={{position: 'absolute', left: (w - PREVIEW.w) / 2, top: (h - PREVIEW.h) / 2, width: PREVIEW.w, height: PREVIEW.h, opacity: 1 - face}}>
          <PreviewPhoto />
        </div>
        <div style={{position: 'absolute', inset: 0, opacity: face}}>
          <Bone cx={w / 2 - 6} cy={h / 2 + 168} width={190} rotate={-4} />
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: h / 2 - 300,
              textAlign: 'center',
              fontFamily: FONT,
              fontWeight: BOLD,
              fontSize: 470,
              lineHeight: '560px',
              color: C.navy,
            }}
          >
            ?
          </div>
        </div>
      </div>

      <Tilo
        f={f}
        x={lerp(TILO_G.x, TILO_H.x, tilo)}
        y={lerp(TILO_G.y, TILO_H.y, tilo) + Math.sin(((f - 820) / 30) * Math.PI * 0.6) * 3 * tilo}
        width={lerp(TILO_G.w, TILO_H.w, tilo)}
        rotate={lerp(-2, -4, tilo)}
        spin={[{f: 0, rps: 6.3}, {f: 822, rps: 6.3}, {f: 850, rps: 2.4}]}
      />

      <div
        style={{
          position: 'absolute',
          left: CTA.x,
          top: CTA.y + lerp(18, 0, cta),
          width: CTA.w,
          height: CTA.h,
          borderRadius: CTA.h / 2,
          backgroundColor: C.blue,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: FONT,
          fontWeight: BOLD,
          fontSize: 58,
          letterSpacing: '-0.01em',
          color: C.navy,
          opacity: cta,
        }}
      >
        {COPY.cta}
        <span style={{marginLeft: 22}}>{COPY.ctaArrow}</span>
      </div>
    </AbsoluteFill>
  );
};
