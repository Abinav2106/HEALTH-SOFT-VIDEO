import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {ASSETS, BOLD, C, COPY, FONT, MEDIUM, REGULAR} from '../constants';
import {EASE_IN_OUT, lerp, prog} from '../lib/motion';
import {IDLE_RPS} from '../lib/propeller';
import {Bone} from './Bone';
import {BRIDGE_AT, boneScreen} from './S4Discovery';
import {MAP, MARKER_R} from './S6Ending';
import {Tilo} from './Tilo';
import {Trim} from './Trim';

// 21–26 s. "Your next hunt could unlock an Amazon gift card. Eligibility and terms apply."
// Navy, balanced white type, a small success check, and the supplied gift artwork revealed by a
// clean bottom-up matte (one intact asset — no separate lid/card layers exist, so nothing is
// opened or deformed). The Spark Bone travels from the room into the success check; the check
// later becomes the Mumbai marker on the ending map.

export const ICON = {x: 330, y: 352, r: 44};
const BONE_TO_ICON = {from: BRIDGE_AT + 2, dur: 22};
const ICON_IN = BRIDGE_AT + 18;
const CHECK = {from: BRIDGE_AT + 26, dur: 14};
export const TO_MARKER = {from: 768, dur: 22};
const GIFT = {x: 130, y: 760, w: 820};
const GIFT_H = (GIFT.w * 1332) / 1208;
const GIFT_REVEAL = {from: 668, dur: 30}; // on "…an Amazon gift card"
const NOTE_AT = 720; // on "Eligibility and terms apply"

export const S5Payoff: React.FC<{f: number}> = ({f}) => {
  if (f < BRIDGE_AT) return null;
  const b0 = boneScreen(BRIDGE_AT);
  const t = prog(f, BONE_TO_ICON.from, BONE_TO_ICON.dur, EASE_IN_OUT);
  const boneFade = 1 - prog(f, ICON_IN, 8);
  const out = 1 - prog(f, TO_MARKER.from - 8, 12);
  const gift = prog(f, GIFT_REVEAL.from, GIFT_REVEAL.dur, EASE_IN_OUT);
  const lift = prog(f, GIFT_REVEAL.from + GIFT_REVEAL.dur, 36, EASE_IN_OUT);
  const line = (i: number) => prog(f, 626 + i * 6, 18);
  const tiloIn = prog(f, 646, 34, EASE_IN_OUT);

  return (
    <AbsoluteFill style={{backgroundColor: C.navy, opacity: prog(f, BRIDGE_AT, 6)}}>
      <div style={{position: 'absolute', inset: 0, opacity: out}}>
        <div style={{position: 'absolute', left: ICON.x + ICON.r + 28, top: ICON.y - 40, height: 80, overflow: 'hidden'}}>
          <div style={{fontFamily: FONT, fontWeight: MEDIUM, fontSize: 58, lineHeight: '80px', color: C.white, transform: `translateY(${lerp(100, 0, line(0))}%)`}}>
            {COPY.huntComplete}
          </div>
        </div>
        {COPY.payoff.map((tx, i) => (
          <div key={tx} style={{position: 'absolute', left: 0, right: 0, top: 432 + i * 124, height: 132, overflow: 'hidden', textAlign: 'center'}}>
            <div
              style={{
                fontFamily: FONT,
                fontWeight: BOLD,
                fontSize: 112,
                lineHeight: '132px',
                letterSpacing: '-0.035em',
                color: C.white,
                transform: `translateY(${lerp(100, 0, line(i + 1))}%)`,
              }}
            >
              {tx}
            </div>
          </div>
        ))}
        <div
          style={{
            position: 'absolute',
            left: GIFT.x,
            top: GIFT.y + lerp(80, 0, gift) - lift * 16,
            width: GIFT.w,
            height: GIFT_H,
            clipPath: `inset(${(1 - gift) * 100}% -10% -10% -10%)`,
          }}
        >
          {/* soft right edge: the storyboard crop cuts through a ribbon tail there */}
          <Img src={staticFile(ASSETS.gift)} style={{width: GIFT.w, height: GIFT_H, WebkitMaskImage: 'linear-gradient(90deg, #000 92%, transparent 100%)'}} />
        </div>
        {tiloIn > 0 && (
          <Tilo
            f={f}
            x={lerp(-200, 300, tiloIn)}
            y={1508 - lift * 16 + Math.sin(((f - 646) / 30) * Math.PI * 0.5) * 3 * tiloIn}
            width={300}
            rotate={lerp(-6, -2, tiloIn)}
            rest={prog(f, 682, 14)}
            spin={[{f: 0, rps: 6.3}, {f: 676, rps: 6.3}, {f: 712, rps: IDLE_RPS * 1.6}]}
          />
        )}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 1800,
            textAlign: 'center',
            fontFamily: FONT,
            fontWeight: REGULAR,
            fontSize: 34,
            color: C.white,
            opacity: prog(f, NOTE_AT, 14) * 0.92,
          }}
        >
          {COPY.rewardNote}
        </div>
      </div>
      {boneFade > 0 && (
        <Bone cx={lerp(b0.x, ICON.x, t)} cy={lerp(b0.y, ICON.y, t)} width={lerp(b0.w, ICON.r * 2.2, t)} opacity={boneFade} />
      )}
    </AbsoluteFill>
  );
};

/** The success check, above every scene: revealed once, then shrinks into the Mumbai marker. */
export const S5Icon: React.FC<{f: number}> = ({f}) => {
  if (f < ICON_IN || f > TO_MARKER.from + TO_MARKER.dur + 2) return null;
  const inP = prog(f, ICON_IN, 10);
  const m = prog(f, TO_MARKER.from, TO_MARKER.dur, EASE_IN_OUT);
  const [mx, my] = MAP.city('Mumbai');
  const x = lerp(ICON.x, mx, m);
  const y = lerp(ICON.y, my, m);
  const r = lerp(ICON.r * lerp(0.7, 1, inP), MARKER_R, m);
  const check = prog(f, CHECK.from, CHECK.dur, EASE_IN_OUT);
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      <circle cx={x} cy={y} r={r} fill={C.blue} stroke={C.navy} strokeWidth={lerp(0, 3.5, m)} opacity={inP} />
      {check > 0 && (
        <Trim d={`M ${x - r * 0.42} ${y + r * 0.02} L ${x - r * 0.1} ${y + r * 0.32} L ${x + r * 0.44} ${y - r * 0.3}`} end={check} width={r * 0.2} color={C.white} opacity={1 - prog(f, TO_MARKER.from, 8)} />
      )}
    </svg>
  );
};
