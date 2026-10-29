import React from 'react';
import {AbsoluteFill, Easing} from 'remotion';
import {BOLD, C, COPY, FONT, MEDIUM} from '../constants';
import {EASE_IN_OUT, lerp, prog} from '../lib/motion';
import {IDLE_RPS} from '../lib/propeller';
import {Bone} from './Bone';
import {GIFT_BOX, GiftBox} from './GiftBox';
import {BRIDGE_AT, boneScreen} from './S4Discovery';
import {Tilo} from './Tilo';
import {Trim} from './Trim';

// E–F · 18–24 s. "Your hunt could unlock an Amazon gift card. Eligibility and terms apply."
// One continuous physical action on one box: the closed box rises into view, settles, the lid
// lifts, the Amazon gift card rises out of it, hold with the disclaimer, then the interface panel
// rises over it (G). The Spark Bone from the room travels into the success check.

export const ICON = {x: 330, y: 300, r: 44};
const BONE_TO_ICON = {from: BRIDGE_AT + 2, dur: 18};
const ICON_IN = BRIDGE_AT + 14;
const CHECK = {from: BRIDGE_AT + 20, dur: 14};
// The box beats, in frames (18.0 s = 540).
export const BOX = {
  rise: {from: 540, dur: 18}, // 18.0–18.6 s: the complete closed box rises into view
  settle: {from: 558, dur: 18}, // 18.6–19.2 s
  lid: {from: 576, dur: 30}, // 19.2–20.2 s
  card: {from: 606, dur: 36}, // 20.2–21.4 s, on "…an Amazon gift card"
};
const NOTE_AT = 648; // on "Eligibility and terms apply"
const RISE = Easing.bezier(0.2, 0.9, 0.3, 1);
const SCALE = 1.1;
// Front-face top-left of the box on screen.
const AT = {x: 236, y: 1236};

export const S5Payoff: React.FC<{f: number}> = ({f}) => {
  if (f < BRIDGE_AT) return null;
  const b0 = boneScreen(BRIDGE_AT);
  const t = prog(f, BONE_TO_ICON.from, BONE_TO_ICON.dur, EASE_IN_OUT);
  const boneFade = 1 - prog(f, ICON_IN, 8);
  const iconIn = prog(f, ICON_IN, 8);
  const check = prog(f, CHECK.from, CHECK.dur, EASE_IN_OUT);
  const line = (i: number) => prog(f, 546 + i * 6, 16);

  // Rise overshoots slightly upward, then settles down onto its resting line (no squash, no bounce loop).
  const rise = prog(f, BOX.rise.from, BOX.rise.dur, RISE);
  const settle = prog(f, BOX.settle.from, BOX.settle.dur, EASE_IN_OUT);
  const boxY = lerp(980, -18, rise) + 18 * settle;
  const lid = prog(f, BOX.lid.from, BOX.lid.dur, EASE_IN_OUT);
  const card = prog(f, BOX.card.from, BOX.card.dur, EASE_IN_OUT);
  const tilo = prog(f, 552, 30, EASE_IN_OUT);

  return (
    <AbsoluteFill style={{backgroundColor: C.navy, opacity: prog(f, BRIDGE_AT, 6)}}>
      <div style={{position: 'absolute', left: ICON.x + ICON.r + 26, top: ICON.y - 40, height: 80, overflow: 'hidden'}}>
        <div style={{fontFamily: FONT, fontWeight: MEDIUM, fontSize: 58, lineHeight: '80px', color: C.white, transform: `translateY(${lerp(100, 0, line(0))}%)`}}>
          {COPY.huntComplete}
        </div>
      </div>
      {COPY.payoff.map((tx, i) => (
        <div key={tx} style={{position: 'absolute', left: 0, right: 0, top: 384 + i * 124, height: 132, overflow: 'hidden', textAlign: 'center'}}>
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

      {/* the box: one rig, closed → open */}
      <div
        style={{
          position: 'absolute',
          left: AT.x + GIFT_BOX.left * SCALE,
          top: AT.y + GIFT_BOX.top * SCALE + boxY,
          width: GIFT_BOX.width * SCALE,
          height: GIFT_BOX.height * SCALE,
        }}
      >
        <div style={{transform: `scale(${SCALE})`, transformOrigin: '0 0'}}>
          <GiftBox lid={lid} card={card} />
        </div>
      </div>

      {tilo > 0 && (
        <Tilo
          f={f}
          x={lerp(-220, 150, tilo)}
          y={lerp(1200, 1150, tilo) + Math.sin(((f - 552) / 30) * Math.PI * 0.6) * 4 * tilo}
          width={240}
          rotate={lerp(-6, -2, tilo)}
          rest={prog(f, 584, 14)}
          spin={[{f: 0, rps: 6.3}, {f: 580, rps: 6.3}, {f: 616, rps: IDLE_RPS * 1.8}]}
        />
      )}

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 1806,
          textAlign: 'center',
          fontFamily: FONT,
          fontWeight: MEDIUM,
          fontSize: 34,
          color: C.white,
          opacity: prog(f, NOTE_AT, 12) * 0.92,
        }}
      >
        {COPY.rewardNote}
      </div>

      {boneFade > 0 && (
        <Bone cx={lerp(b0.x, ICON.x, t)} cy={lerp(b0.y, ICON.y, t)} width={lerp(b0.w, ICON.r * 2.2, t)} opacity={boneFade} />
      )}
      {iconIn > 0 && (
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
          <circle cx={ICON.x} cy={ICON.y} r={ICON.r * lerp(0.7, 1, iconIn)} fill={C.blue} opacity={iconIn} />
          <Trim d={`M ${ICON.x - 18} ${ICON.y + 1} L ${ICON.x - 4} ${ICON.y + 14} L ${ICON.x + 19} ${ICON.y - 13}`} end={check} width={9} color={C.white} />
        </svg>
      )}
    </AbsoluteFill>
  );
};
