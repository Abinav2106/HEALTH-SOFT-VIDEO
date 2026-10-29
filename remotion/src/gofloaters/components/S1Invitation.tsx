import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, COPY, FONT, BOLD} from '../constants';
import {EASE_IN_OUT, lerp, prog} from '../lib/motion';
import {Bone} from './Bone';
import {Tilo} from './Tilo';
import {Canvas, Trim} from './Trim';

// 0–3 s. Navy kinetic type, one flight line woven through the words, Tilo gliding low, and the
// clue card pulled up by the line. The card then expands into the white of scene two.

const LINE_TOP = [250, 492, 734]; // top of each title line box
const TITLE_SIZE = 252;

// Flight line: in from the left under "Spark", up behind its right side, back across "the".
export const S1_LOOP =
  'M -30 1110 C 230 1100 520 1050 760 975 C 985 905 1045 760 935 690 C 825 622 560 660 335 718 C 205 752 118 742 80 702';
// Band in which the line passes IN FRONT of the type (the "the" line); elsewhere it runs behind.
const FRONT_BAND = {y0: 640, y1: 770};

// Clue card resting rectangle.
export const CARD = {x: 96, y: 1446, w: 888, h: 372, r: 40};

export const cardRect = (f: number) => {
  const rise = prog(f, 38, 34);
  const grow = prog(f, 74, 22, EASE_IN_OUT);
  const y = lerp(1960, CARD.y, rise);
  return {
    x: lerp(CARD.x, 0, grow),
    y: lerp(y, 0, grow),
    w: lerp(CARD.w, 1080, grow),
    h: lerp(CARD.h, 1920, grow),
    r: lerp(CARD.r, 0, grow),
    grow,
  };
};

const tiloPos = (f: number) => {
  const t = prog(f, 4, 60, EASE_IN_OUT);
  const x = lerp(-260, 600, t) + prog(f, 64, 40) * 30;
  const y = lerp(1300, 1238, t) - Math.sin(t * Math.PI) * 18;
  return {x, y, rot: lerp(-5, -2, t)};
};

const TitleLine: React.FC<{text: string; i: number; f: number}> = ({text, i, f}) => {
  const p = prog(f, -16 + i * 3, 22); // already mostly in at frame 0: readable immediately
  return (
    <div style={{position: 'absolute', left: 70, top: LINE_TOP[i], height: 262, width: 1000, overflow: 'hidden'}}>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: BOLD,
          fontSize: TITLE_SIZE,
          lineHeight: '262px',
          letterSpacing: '-0.035em',
          color: C.white,
          transform: `translateY(${lerp(105, 0, p)}%)`,
          opacity: lerp(0.2, 1, p),
        }}
      >
        {text}
      </div>
    </div>
  );
};

export const S1Invitation: React.FC<{f: number}> = ({f}) => {
  const loop = prog(f, 2, 34, EASE_IN_OUT);
  const tilo = tiloPos(f);
  const card = cardRect(f);
  const tail = {x: tilo.x - 150, y: tilo.y + 22};
  const trail = `M -40 ${1318} Q ${(tail.x - 40) / 2} ${tail.y + 26} ${tail.x} ${tail.y}`;
  // Tether from the trail down to the card: the line is what pulls the card into view.
  const anchor = {x: card.x + card.w * 0.46, y: card.y + 2};
  const tether = `M ${tail.x - 60} ${tail.y + 8} C ${tail.x - 20} ${tail.y + 120} ${anchor.x - 60} ${anchor.y - 140} ${anchor.x} ${anchor.y}`;
  const tetherOn = prog(f, 34, 18);
  const boneIn = prog(f, 12, 18);
  const sceneOut = prog(f, 88, 8);

  return (
    <AbsoluteFill style={{backgroundColor: C.navy}}>
      <AbsoluteFill style={{opacity: 1 - sceneOut}}>
        {/* line behind the type */}
        <Canvas>
          <Trim d={S1_LOOP} end={loop} width={7} />
        </Canvas>
        {COPY.title.map((t, i) => (
          <TitleLine key={t} text={t} i={i} f={f} />
        ))}
        {/* the same line again, in front of the type only inside the "the" band */}
        <Canvas>
          <defs>
            <clipPath id="s1front">
              <rect x={0} y={FRONT_BAND.y0} width={1080} height={FRONT_BAND.y1 - FRONT_BAND.y0} />
            </clipPath>
          </defs>
          <g clipPath="url(#s1front)">
            <Trim d={S1_LOOP} end={loop} width={7} />
          </g>
        </Canvas>
        <Bone cx={850} cy={392} width={210} rotate={-6} opacity={boneIn} rays={prog(f, 22, 16)} />
        <Canvas>
          <Trim d={trail} end={prog(f, 6, 30)} width={6} />
          {tetherOn > 0 && card.grow < 0.5 && <Trim d={tether} end={tetherOn} width={5} opacity={1 - card.grow * 2} />}
        </Canvas>
        <Tilo x={tilo.x} y={tilo.y} width={300} rotate={tilo.rot} />
      </AbsoluteFill>

      {/* clue card → expands into the white of the next scene */}
      <div
        style={{
          position: 'absolute',
          left: card.x,
          top: card.y,
          width: card.w,
          height: card.h,
          borderRadius: card.r,
          backgroundColor: C.white,
          overflow: 'hidden',
        }}
      >
        <div style={{position: 'absolute', left: 64, top: 70, opacity: 1 - prog(f, 74, 10)}}>
          {[560, 470, 330].map((w, i) => (
            <div key={i} style={{width: w, height: 30, borderRadius: 15, backgroundColor: '#DCE3EA', marginBottom: 34}} />
          ))}
        </div>
        <div style={{opacity: 1 - prog(f, 74, 10)}}>
          <Bone cx={card.w - 120} cy={96} width={130} rotate={-8} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
