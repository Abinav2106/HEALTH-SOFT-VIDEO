import React from 'react';
import {interpolate} from 'remotion';
import {useMarkerScreen} from '../components/DestinationMarker';
import {FONT_BODY, FONT_HEAD} from '../lib/fonts';
import {sheetTopAt} from '../lib/sheet';
import {useT} from '../lib/timeline';
import type {HoldConfig} from './config';
import {SHEET} from './TicketRewardSheet';
import {easeInOut, easeOut, prog, useHold} from './useHold';

// ONE continuous hero ticket: it emerges from the opened marker, lifts toward the centre, then
// settles (−5° → level) into its card slot in the reward sheet, where it stays. The art is drawn
// at final size and scaled, so it is crisp at rest. Amount and qualifier stay hidden until the
// ticket has landed; the amount is revealed by one mask wipe with all digits together.

const INK = '#18222C';
const FOLD = 50;
const NOTCH = 20;

const ticketPath = (w: number, h: number, r = 26) =>
  [
    `M${r} 0`,
    `H${w - FOLD}`,
    `L${w} ${FOLD}`,
    `V${h / 2 - NOTCH}`,
    `A${NOTCH} ${NOTCH} 0 0 0 ${w} ${h / 2 + NOTCH}`,
    `V${h - r}`,
    `Q${w} ${h} ${w - r} ${h}`,
    `H${r}`,
    `Q0 ${h} 0 ${h - r}`,
    `V${h / 2 + NOTCH}`,
    `A${NOTCH} ${NOTCH} 0 0 0 0 ${h / 2 - NOTCH}`,
    `V${r}`,
    `Q0 0 ${r} 0`,
    'Z',
  ].join(' ');

const Seal: React.FC<{c: HoldConfig}> = ({c}) => (
  <svg width={34} height={52} viewBox="-2 -2 34 52" style={{overflow: 'visible'}}>
    <polygon points="15,0 30,24 15,48 0,24" fill={c.colors.yellow} />
    <polygon points="15,0 30,24 15,48" fill="#EDBE3E" />
    <polygon points="15,0 0,24 15,24" fill="#FFF2B0" />
    <polygon points="15,0 30,24 15,48 0,24" fill="none" stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
  </svg>
);

export const TicketArt: React.FC<{c: HoldConfig; amount: number; qualifier: number; sheen: number}> = ({
  c,
  amount,
  qualifier,
  sheen,
}) => {
  const w = c.hold.ticketWidth;
  const h = c.hold.ticketHeight;
  const d = ticketPath(w, h);
  return (
    <div style={{position: 'relative', width: w, height: h}}>
      <svg width={w} height={h} viewBox={`-3 -3 ${w + 6} ${h + 6}`} style={{position: 'absolute', left: -3, top: -3, width: w + 6, height: h + 6, overflow: 'visible'}}>
        <defs>
          <clipPath id="tilo-ticket-clip">
            <path d={d} />
          </clipPath>
          <linearGradient id="tilo-ticket-sheen" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity={0} />
            <stop offset="0.5" stopColor="#FFFFFF" stopOpacity={0.75} />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
          </linearGradient>
        </defs>
        <path d={d} fill={c.colors.paleYellow} stroke="#E9C547" strokeWidth={3.5} strokeLinejoin="round" />
        {/* Fine perforation just inside the edge. */}
        <rect x={22} y={22} width={w - 44} height={h - 44} rx={14} fill="none" stroke="#D9B43A" strokeOpacity={0.75} strokeWidth={3} strokeDasharray="0.1 11" strokeLinecap="round" />
        {/* Folded corner. */}
        <polygon points={`${w - FOLD},0 ${w - FOLD},${FOLD - 8} ${w - 8},${FOLD}`} fill="#F4DB7E" stroke="#E9C547" strokeWidth={3} strokeLinejoin="round" />
        <polygon points={`${w - FOLD},${FOLD - 8} ${w - 8},${FOLD} ${w - FOLD + 6},${FOLD + 6}`} fill="rgba(5,5,6,0.06)" />
        {sheen > 0 && sheen < 1 && (
          <g clipPath="url(#tilo-ticket-clip)">
            <rect x={-w * 0.35 + sheen * w * 1.7} y={-h} width={w * 0.22} height={h * 3} fill="url(#tilo-ticket-sheen)" transform={`rotate(18 ${w / 2} ${h / 2})`} />
          </g>
        )}
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 26, display: 'flex', justifyContent: 'center'}}>
        <Seal c={c} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 86,
          textAlign: 'center',
          fontFamily: FONT_HEAD,
          fontWeight: 800,
          fontSize: 128,
          lineHeight: 1,
          letterSpacing: '-0.02em',
          color: c.colors.ink,
          clipPath: `inset(-10% ${(1 - amount) * 100}% -10% 0)`,
        }}
      >
        {c.copy.amount}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 232 + (1 - qualifier) * 8,
          textAlign: 'center',
          fontFamily: FONT_BODY,
          fontWeight: 800,
          fontSize: 34,
          letterSpacing: '0.14em',
          color: c.colors.ink,
          opacity: qualifier,
        }}
      >
        {c.copy.amountQualifier}
      </div>
    </div>
  );
};

export const HeroTicket: React.FC = () => {
  const c = useHold();
  const t = useT();
  const m = useMarkerScreen();
  const h = c.hold;
  if (t < h.ticketEmerge[0]) return null;

  const W = h.ticketWidth;
  const H = h.ticketHeight;
  // Emerge: small, between the opening faces, rising just out of the marker.
  const e = prog(t, h.ticketEmerge, easeOut);
  const s0 = (m.size * 1.5) / W;
  const p0 = {x: m.x, y: m.y - m.size * 0.2 - m.size * 0.55 * e, s: s0 * (0.4 + 0.6 * e), r: 0};
  // Lift toward the centre of the screen, tilting to the start angle.
  const l = prog(t, h.ticketLift, easeInOut);
  const p1 = {
    x: interpolate(l, [0, 1], [p0.x, 540]),
    y: interpolate(l, [0, 1], [p0.y, h.ticketLiftY]),
    s: interpolate(l, [0, 1], [p0.s, h.ticketLiftScale]),
    r: interpolate(l, [0, 1], [0, h.ticketStartRotateDeg]),
  };
  // Settle into the slot in the sheet (follows the sheet while it finishes rising).
  const st = prog(t, h.ticketSettle, easeOut);
  const slot = {
    x: c.ui.contentLeft + (c.ui.contentRight - c.ui.contentLeft) / 2,
    y: sheetTopAt(c, t) + SHEET.slot + H / 2,
  };
  const x = interpolate(st, [0, 1], [p1.x, slot.x]);
  const y = interpolate(st, [0, 1], [p1.y, slot.y]);
  const s = interpolate(st, [0, 1], [p1.s, 1]);
  const r = interpolate(st, [0, 1], [p1.r, 0]);
  const opacity = prog(t, [h.ticketEmerge[0], h.ticketEmerge[0] + 5]);

  return (
    <div
      style={{
        position: 'absolute',
        left: x - W / 2,
        top: y - H / 2,
        width: W,
        height: H,
        opacity,
        transform: `rotate(${r}deg) scale(${s})`,
        transformOrigin: '50% 50%',
        filter: st < 1 ? `drop-shadow(0 ${10 * (1 - st) + 4}px ${16 * (1 - st) + 8}px rgba(5,5,6,0.16))` : 'drop-shadow(0 4px 8px rgba(5,5,6,0.10))',
      }}
    >
      <TicketArt
        c={c}
        amount={prog(t, h.amountReveal, easeInOut)}
        qualifier={prog(t, [h.qualifierIn, h.qualifierIn + 7], easeOut)}
        sheen={prog(t, h.highlight, easeInOut)}
      />
    </div>
  );
};
