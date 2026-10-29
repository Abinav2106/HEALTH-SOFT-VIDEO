import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {ASSETS, BOLD, C, COPY, FONT, MEDIUM} from '../constants';
import {EASE_IN_OUT, lerp, prog} from '../lib/motion';
import {Bone} from './Bone';
import {boneScreen} from './S4Discovery';
import {MAP, MARKER_R} from './S6Ending';
import {Canvas, Trim} from './Trim';

// 21–26 s. Match cut: the Spark Bone keeps its screen position and size as the room cuts to navy,
// then rises while the white success seal grows out of it. One check reveal, the copy, and the
// supplied gift artwork revealed by a clean bottom-up matte (one intact asset: no separate lid or
// card layer exists, so nothing is opened or deformed). Then the seal expands to white and the
// check badge shrinks into the first city marker.

const CUT = 606;
const SEAL = {cx: 540, cy: 640, r: 500};
const BONE_END = {x: 540, y: 302, w: 230};
const BADGE = {x: 196, y: 292, r: 64};
const GIFT = {x: 110, y: 828, w: 860};
const GIFT_H = (GIFT.w * 1332) / 1208;
export const T5 = {from: 756, dur: 24};

export const S5Payoff: React.FC<{f: number}> = ({f}) => {
  if (f < CUT) return null;
  const b0 = boneScreen(CUT);
  const rise = prog(f, CUT + 2, 26, EASE_IN_OUT);
  const seal = prog(f, CUT + 4, 26, EASE_IN_OUT);
  const out = prog(f, T5.from, T5.dur, EASE_IN_OUT);
  const fade = 1 - prog(f, T5.from - 6, 12);
  const mumbai = MAP.city('Mumbai');

  const sealC = {x: lerp(lerp(b0.x, SEAL.cx, seal), 540, out), y: lerp(lerp(b0.y, SEAL.cy, seal), 960, out)};
  const sealR = lerp(SEAL.r * seal, 1250, out);
  const badgeIn = prog(f, 640, 12);
  const check = prog(f, 648, 14, EASE_IN_OUT);
  const bx = lerp(BADGE.x, mumbai[0], out);
  const by = lerp(BADGE.y, mumbai[1], out);
  const br = lerp(BADGE.r * badgeIn, MARKER_R, out);
  const gift = prog(f, 662, 30, EASE_IN_OUT);
  const lift = prog(f, 694, 34, EASE_IN_OUT);

  const textLine = (i: number) => prog(f, 648 + i * 5, 18);

  return (
    <AbsoluteFill style={{backgroundColor: C.navy, opacity: prog(f, CUT, 4)}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
        <circle cx={sealC.x} cy={sealC.y} r={sealR} fill={C.white} />
      </svg>
      <div style={{position: 'absolute', inset: 0, opacity: fade}}>
        <Canvas>
          <Trim d="M -30 600 C 30 500 90 380 150 330" end={prog(f, 632, 16)} width={6} opacity={badgeIn} />
        </Canvas>
        <Bone cx={lerp(b0.x, BONE_END.x, rise)} cy={lerp(b0.y, BONE_END.y, rise)} width={lerp(b0.w, BONE_END.w, rise)} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 380, height: 74, overflow: 'hidden', textAlign: 'center'}}>
          <div style={{fontFamily: FONT, fontWeight: MEDIUM, fontSize: 54, lineHeight: '74px', color: C.navy, transform: `translateY(${lerp(100, 0, textLine(0))}%)`}}>
            {COPY.huntComplete}
          </div>
        </div>
        {COPY.payoff.map((t, i) => (
          <div key={t} style={{position: 'absolute', left: 0, right: 0, top: 462 + i * 110, height: 118, overflow: 'hidden', textAlign: 'center'}}>
            <div
              style={{
                fontFamily: FONT,
                fontWeight: BOLD,
                fontSize: 100,
                lineHeight: '118px',
                letterSpacing: '-0.035em',
                color: C.navy,
                transform: `translateY(${lerp(100, 0, textLine(i + 1))}%)`,
              }}
            >
              {t}
            </div>
          </div>
        ))}
        <div
          style={{
            position: 'absolute',
            left: GIFT.x,
            top: GIFT.y + lerp(70, 0, gift) - lift * 14,
            width: GIFT.w,
            height: GIFT_H,
            clipPath: `inset(${(1 - gift) * 100}% -20% -20% -20%)`,
          }}
        >
          {/* soft right edge: the storyboard crop cuts through a ribbon tail there */}
          <Img src={staticFile(ASSETS.gift)} style={{width: GIFT.w, height: GIFT_H, WebkitMaskImage: 'linear-gradient(90deg, #000 92%, transparent 100%)'}} />
        </div>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 1808,
            textAlign: 'center',
            fontFamily: FONT,
            fontWeight: MEDIUM,
            fontSize: 31,
            color: C.white,
            opacity: prog(f, 690, 14) * 0.9,
          }}
        >
          {COPY.rewardNote}
        </div>
      </div>
      {/* success check: revealed once, later becomes the Mumbai marker */}
      {badgeIn > 0 && (
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          <circle cx={bx} cy={by} r={br} fill={C.blue} stroke={out > 0.5 ? C.navy : C.white} strokeWidth={lerp(12, 3.5, out)} />
          <g opacity={1 - prog(f, T5.from, 8)}>
            <Trim d={`M ${bx - br * 0.42} ${by + br * 0.02} L ${bx - br * 0.1} ${by + br * 0.32} L ${bx + br * 0.44} ${by - br * 0.3}`} end={check} width={12} color={C.white} />
          </g>
        </svg>
      )}
    </AbsoluteFill>
  );
};
