import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BOLD, C, COPY, FONT, MEDIUM} from '../constants';
import {EASE_IN_OUT, lerp, prog} from '../lib/motion';
import {Tag} from './Tag';
import {Tilo} from './Tilo';
import {Canvas, Trim} from './Trim';

// 3–8 s. White page, the sample clue, two yellow painted highlights revealed left→right. The last
// highlight thins into a cyan route that leads the aerial map in (the matte lives in S3Signal).

const BLOCK = {left: 72, top: 760, rotate: -3};
const SIZE = 90;
const LINE_H = 130;
export const HL = [
  {from: 116, dur: 16},
  {from: 138, dur: 18},
];
// Where the second highlight ends on screen (measured from the rendered layout).
export const HL2_END = {x: 994, y: 938};
// The route the last highlight resolves into: from its end, down and across into the map.
export const S2_ROUTE = `M ${HL2_END.x} ${HL2_END.y} C 1100 1000 1010 1170 780 1240 C 520 1320 330 1400 400 1580 C 450 1700 640 1770 1140 1800`;
export const THIN = {from: 196, dur: 12}; // highlight → thin cyan line
export const ROUTE = {from: 204, dur: 30};

const enter = (f: number) => prog(f, 84, 26); // continues the card's upward travel

const Highlight: React.FC<{f: number; i: number}> = ({f, i}) => {
  const reveal = prog(f, HL[i].from, HL[i].dur, EASE_IN_OUT);
  const thin = i === 1 ? prog(f, THIN.from, THIN.dur, EASE_IN_OUT) : 0;
  const fade = i === 0 ? prog(f, THIN.from, 14) : 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: '-0.14em',
        right: '-0.14em',
        top: '0.16em',
        bottom: '0.02em',
        borderRadius: '0.14em 0.22em 0.16em 0.26em',
        backgroundColor: thin > 0.5 ? C.blue : C.yellow,
        clipPath: `inset(0 ${(1 - reveal) * 100}% 0 0)`,
        transform: `scaleY(${lerp(1, 0.08, thin)}) skewX(-4deg)`,
        transformOrigin: '50% 100%',
        opacity: 1 - fade,
        zIndex: -1,
      }}
    />
  );
};

export const S2Clue: React.FC<{f: number; preview: boolean}> = ({f, preview}) => {
  const e = enter(f);
  const textOut = prog(f, 200, 16);
  const thin = prog(f, THIN.from, THIN.dur);
  return (
    <AbsoluteFill style={{backgroundColor: f >= 92 ? C.white : 'transparent'}}>
      <div style={{position: 'absolute', inset: 0, transform: `translateY(${lerp(110, 0, e)}px)`, opacity: e}}>
        <div style={{position: 'absolute', left: BLOCK.left + 4, top: BLOCK.top - 96, fontFamily: FONT, fontWeight: MEDIUM, fontSize: 44, color: C.navy, opacity: 1 - textOut}}>
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
            letterSpacing: '-0.025em',
            color: C.navy,
            whiteSpace: 'nowrap',
          }}
        >
          {COPY.clue.map((l, i) => (
            <div key={i} style={{position: 'relative'}}>
              <span style={{opacity: 1 - textOut}}>{l.plain}</span>
              <span style={{position: 'relative', display: 'inline-block', zIndex: 0, isolation: 'isolate'}}>
                <Highlight f={f} i={i} />
                <span style={{color: C.black, opacity: 1 - (i === 1 ? thin : textOut)}}>{l.marked}</span>
              </span>
            </div>
          ))}
        </div>
        {preview && <Tag text="Illustrative clue" x={BLOCK.left + 4} y={BLOCK.top + 320} opacity={1 - textOut} />}
      </div>
    </AbsoluteFill>
  );
};

// Tilo's small flight across the clue, then away along the new route.
const tiloS2 = (f: number) => {
  const inT = prog(f, 98, 52, EASE_IN_OUT);
  const x = lerp(-280, 330, inT) + prog(f, 150, 50) * 70;
  const y = lerp(1330, 1290, inT) - Math.sin(inT * Math.PI) * 20;
  const out = prog(f, 206, 34, EASE_IN_OUT);
  return {x: lerp(x, 1360, out), y: lerp(y, 1080, out), rot: lerp(-3, -6, out)};
};

/** Rendered above the incoming map matte so the route and Tilo stay on top across the handover. */
export const S2Route: React.FC<{f: number}> = ({f}) => {
  const t = tiloS2(f);
  const route = prog(f, ROUTE.from, ROUTE.dur, EASE_IN_OUT);
  const routeOut = prog(f, 236, 10);
  return (
    <AbsoluteFill>
      <Canvas>
        <Trim d={S2_ROUTE} end={route} width={8} opacity={1 - routeOut} />
      </Canvas>
      <Tilo x={t.x} y={t.y} width={250} rotate={t.rot} />
    </AbsoluteFill>
  );
};
