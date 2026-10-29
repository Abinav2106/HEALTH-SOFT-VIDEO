import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BOLD, C, COPY, FONT} from '../constants';
import {EASE_IN_OUT, lerp, prog} from '../lib/motion';
import {Bone} from './Bone';
import {Tilo} from './Tilo';

// A · 0–3 s. "One hidden Spark. Where would you look?"
// Navy, the white headline revealed through line masks, one golden Spark Bone, Tilo gliding low,
// and one clean clue card rising from the bottom. The card then expands into scene two's page.

const LINE_TOP = [214, 462, 710];
const TITLE_SIZE = 262;

// Clue card at rest, and its expansion into the full frame (kept moving upward across the cut).
export const CARD = {x: 90, y: 1452, w: 900, h: 420, r: 44};
export const CARD_RISE = {from: 44, dur: 32};
export const CARD_GROW = {from: 78, dur: 20};

export const cardRect = (f: number) => {
  const rise = prog(f, CARD_RISE.from, CARD_RISE.dur);
  const grow = prog(f, CARD_GROW.from, CARD_GROW.dur, EASE_IN_OUT);
  return {
    x: lerp(CARD.x, 0, grow),
    y: lerp(lerp(1990, CARD.y, rise), 0, grow),
    w: lerp(CARD.w, 1080, grow),
    h: lerp(CARD.h, 1920, grow),
    r: lerp(CARD.r, 0, grow),
    rot: lerp(lerp(-5, -2.5, rise), 0, grow),
    grow,
  };
};

const TitleLine: React.FC<{text: string; i: number; f: number}> = ({text, i, f}) => {
  const p = prog(f, -16 + i * 3, 22); // mostly in at frame 0: readable immediately
  return (
    <div style={{position: 'absolute', left: 64, top: LINE_TOP[i], height: 272, width: 1000, overflow: 'hidden'}}>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: BOLD,
          fontSize: TITLE_SIZE,
          lineHeight: '272px',
          letterSpacing: '-0.04em',
          color: C.white,
          transform: `translateY(${lerp(100, 0, p)}%)`,
        }}
      >
        {text}
      </div>
    </div>
  );
};

export const S1Invitation: React.FC<{f: number}> = ({f}) => {
  // Tilo glides into position under the title, then holds there (propeller still spinning).
  const fly = prog(f, 2, 50);
  const tx = lerp(-300, 520, fly);
  const ty = lerp(1290, 1196, fly) + Math.sin((f / 30) * Math.PI * 0.8) * 4 * fly;
  const card = cardRect(f);
  const bone = prog(f, 26, 16);
  const out = prog(f, CARD_GROW.from + 8, 10);

  return (
    <AbsoluteFill style={{backgroundColor: C.navy}}>
      <AbsoluteFill style={{opacity: 1 - out}}>
        {COPY.title.map((t, i) => (
          <TitleLine key={t} text={t} i={i} f={f} />
        ))}
        {/* the Spark arrives on "Spark" */}
        <Bone cx={812} cy={612} width={lerp(150, 214, bone)} rotate={-8} opacity={bone} rays={prog(f, 34, 14)} />
        <Tilo f={f} x={tx} y={ty} width={330} rotate={lerp(-6, -1.5, fly)} />
      </AbsoluteFill>

      {/* the clue card — expands into the next composition */}
      <div
        style={{
          position: 'absolute',
          left: card.x,
          top: card.y,
          width: card.w,
          height: card.h,
          borderRadius: card.r,
          backgroundColor: C.white,
          transform: `rotate(${card.rot}deg)`,
          transformOrigin: '50% 0%',
        }}
      >
        <div style={{opacity: 1 - prog(f, CARD_GROW.from, 8)}}>
          <Bone cx={card.w / 2} cy={card.h * 0.46} width={230} rotate={-4} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
