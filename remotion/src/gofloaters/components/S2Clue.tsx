import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BOLD, C, COPY, FONT, MEDIUM} from '../constants';
import {EASE_IN_OUT, lerp, prog} from '../lib/motion';
import {Tilo} from './Tilo';

// B · 3–8 s. "Every hunt starts with a clue. Read it closely."
// White page (the expanded clue card), the clue large and central, two yellow highlights revealed
// left→right behind their words. The second highlight's rectangle then becomes the one matte the
// aerial map opens through (S3Signal draws the map inside it).

const BLOCK = {left: 70, top: 690, rotate: -2};
const SIZE = 92;
const LINE_H = 134;
export const HL = [
  {from: 130, dur: 14}, // "teams meet" first, on "…with a clue"
  {from: 154, dur: 18}, // then "beside the window", on "Read it closely"
];
// Screen rectangle of the second highlight (measured from the rendered layout): the matte starts here.
// Second highlight on screen at MATTE.from (measured from the rendered layout, clue drift included):
// centre, unrotated size and the clue's tilt. The matte starts as exactly this quad.
export const HL2 = {cx: 617.5, cy: 852, w: 753, h: 116, rot: BLOCK.rotate};
export const MATTE = {from: 210, dur: 30}; // after a reading hold; the map is full-frame at 8 s

const enter = (f: number) => prog(f, 86, 24); // continues the card's upward travel

const Highlight: React.FC<{f: number; i: number}> = ({f, i}) => {
  const reveal = prog(f, HL[i].from, HL[i].dur, EASE_IN_OUT);
  return (
    <div
      style={{
        position: 'absolute',
        left: '-0.12em',
        right: '-0.12em',
        top: '0.14em',
        bottom: '0.02em',
        borderRadius: '0.12em 0.2em 0.14em 0.22em',
        backgroundColor: C.yellow,
        clipPath: `inset(0 ${(1 - reveal) * 100}% 0 0)`,
        zIndex: -1,
      }}
    />
  );
};

export const S2Clue: React.FC<{f: number}> = ({f}) => {
  const e = enter(f);
  const out = prog(f, MATTE.from + 6, 14);
  const drift = prog(f, 110, MATTE.from - 110, EASE_IN_OUT) * -26; // slow rise while the clue is read
  return (
    <AbsoluteFill style={{backgroundColor: f >= 96 ? C.white : 'transparent'}}>
      <div style={{position: 'absolute', inset: 0, transform: `translateY(${lerp(120, 0, e) + drift}px)`, opacity: e * (1 - out)}}>
        <div style={{position: 'absolute', left: BLOCK.left + 4, top: BLOCK.top - 104, fontFamily: FONT, fontWeight: MEDIUM, fontSize: 46, color: C.navy}}>
          {COPY.clueLabel}
        </div>
        <div
          style={{
            position: 'absolute',
            left: BLOCK.left,
            top: BLOCK.top,
            transform: `rotate(${BLOCK.rotate}deg)`,
            transformOrigin: '0% 50%',
            fontFamily: FONT,
            fontWeight: BOLD,
            fontSize: SIZE,
            lineHeight: `${LINE_H}px`,
            letterSpacing: '-0.03em',
            color: C.navy,
            whiteSpace: 'nowrap',
          }}
        >
          {COPY.clue.map((l, i) => (
            <div key={i}>
              <span>{l.plain}</span>
              <span style={{position: 'relative', display: 'inline-block', zIndex: 0, isolation: 'isolate', color: C.black}}>
                <Highlight f={f} i={i} />
                {l.marked}
              </span>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Tilo stays above the incoming map so it carries straight across the hand-over. */
export const S2Tilo: React.FC<{f: number}> = ({f}) => {
  const inT = prog(f, 100, 56, EASE_IN_OUT);
  const x = lerp(-260, 420, inT) + prog(f, 156, 66) * 60;
  const y = lerp(1330, 1290, inT) - Math.sin(inT * Math.PI) * 18;
  const away = prog(f, MATTE.from, 32, EASE_IN_OUT);
  return <Tilo f={f} x={lerp(x, 1340, away)} y={lerp(y, 1150, away)} width={250} rotate={lerp(-2, -7, away)} />;
};
