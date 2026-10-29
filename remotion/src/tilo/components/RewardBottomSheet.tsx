import React from 'react';
import {Easing, interpolate} from 'remotion';
import {HEIGHT, WIDTH, type TiloConfig} from '../config';
import {FONT_HEAD, FONT_UI} from '../lib/fonts';
import {sheetTopAt} from '../lib/sheet';
import {useConfig, useT} from '../lib/timeline';
import {CopyText} from './CopyText';

// GoFloaters-style rounded white bottom sheet. Mounted once (from sheetRiseStart) and driven by
// the global frame, so the shot 05 → 06 continuation is the same element moving on.
// Shot 05 shows only the top: handle, label and the pale-yellow card in a loading state.

// Vertical layout, px from the sheet's top edge.
const L = {
  handle: 18,
  label: 54,
  headline: 94,
  card: 206,
  cardH: 392,
  supporting: 626,
  cta: 690,
  ctaH: 116,
  closing: 836,
  terms: 884,
};

const ramp = (t: number, a: number, frames: number, easing = Easing.out(Easing.cubic)) =>
  interpolate(t, [a, a + frames], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});

const Sparkle: React.FC<{size: number; color: string}> = ({size, color}) => (
  <svg width={size} height={size} viewBox="-10 -10 20 20">
    <path d="M0 -9 Q1.4 -1.4 9 0 Q1.4 1.4 0 9 Q-1.4 1.4 -9 0 Q-1.4 -1.4 0 -9 Z" fill={color} stroke="#18222C" strokeWidth={1.2} />
  </svg>
);

export const MysteryTicket: React.FC<{config: TiloConfig; rotate: number}> = ({config, rotate}) => {
  const W = 236;
  const H = 128;
  const n = 15; // notch radius
  const path = `M14 0 H${W - 14} Q${W} 0 ${W} 14 V${H / 2 - n} A${n} ${n} 0 0 0 ${W} ${H / 2 + n} V${H - 14} Q${W} ${H} ${W - 14} ${H} H14 Q0 ${H} 0 ${H - 14} V${H / 2 + n} A${n} ${n} 0 0 0 0 ${H / 2 - n} V14 Q0 0 14 0 Z`;
  return (
    <div style={{width: W, height: H, transform: `rotate(${rotate}deg)`, position: 'relative'}}>
      <svg width={W} height={H} viewBox={`-3 -3 ${W + 6} ${H + 6}`} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <path d={path} fill={config.colors.yellow} stroke="#18222C" strokeWidth={4} strokeLinejoin="round" />
        <rect x={26} y={16} width={W - 52} height={H - 32} rx={10} fill="none" stroke="#18222C" strokeOpacity={0.35} strokeWidth={2.5} strokeDasharray="7 7" />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: FONT_HEAD,
          fontWeight: 800,
          fontSize: 82,
          color: config.colors.ink,
          lineHeight: 1,
          paddingBottom: 6,
        }}
      >
        ?
      </div>
    </div>
  );
};

export const PrizePoolCard: React.FC<{t: number; config: TiloConfig}> = ({t, config}) => {
  const s06 = config.shots.s06[0];
  const revealAt = s06 + 4;
  const k = ramp(t, revealAt, config.timing.cardRevealFrames);
  const ts = config.timing.ticketSettle;
  const tilt = interpolate(t, [ts, ts + 7, ts + 14], [-9, 3, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.sin),
  });
  const width = config.ui.contentRight - config.ui.contentLeft;
  const bar = 'rgba(5,5,6,0.08)';
  return (
    <div
      style={{
        position: 'absolute',
        left: config.ui.contentLeft,
        top: L.card,
        width,
        height: L.cardH,
        borderRadius: 36,
        background: config.colors.paleYellow,
        border: `3px solid ${config.colors.yellow}`,
        boxSizing: 'border-box',
        transform: `scale(${0.98 + 0.02 * k})`,
        overflow: 'hidden',
      }}
    >
      {/* Loading state (shot 05): conceals the offer. */}
      <div style={{position: 'absolute', inset: 0, opacity: 1 - k}}>
        <div style={{position: 'absolute', left: 36, top: 38, width: 88, height: 88, borderRadius: 22, background: '#F7A54A'}} />
        <div style={{position: 'absolute', left: 150, top: 50, width: 440, height: 26, borderRadius: 13, background: bar}} />
        <div style={{position: 'absolute', left: 150, top: 96, width: 300, height: 22, borderRadius: 11, background: bar}} />
        <div style={{position: 'absolute', left: 36, top: 170, width: width - 78, height: 120, borderRadius: 22, background: bar}} />
      </div>
      {/* The offer. */}
      <div style={{position: 'absolute', inset: 0, opacity: k, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{display: 'flex', gap: 10, marginTop: 22}}>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} style={{width: 7, height: 7, borderRadius: 4, background: config.colors.yellow}} />
          ))}
        </div>
        <div
          style={{
            fontFamily: FONT_HEAD,
            fontWeight: 800,
            fontSize: 124,
            lineHeight: 1,
            letterSpacing: '-0.02em',
            color: config.colors.ink,
            marginTop: 8,
          }}
        >
          {config.copy.amount}
        </div>
        <div
          style={{
            fontFamily: FONT_UI,
            fontWeight: 800,
            fontSize: 32,
            letterSpacing: '0.14em',
            color: config.colors.ink,
            marginTop: 10,
          }}
        >
          {config.copy.amountQualifier}
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 26, marginTop: 22}}>
          <Sparkle size={34} color={config.colors.white} />
          <MysteryTicket config={config} rotate={tilt} />
          <Sparkle size={42} color={config.colors.white} />
        </div>
      </div>
    </div>
  );
};

export const RevealCTA: React.FC<{t: number; config: TiloConfig}> = ({t, config}) => {
  const k = ramp(t, config.timing.ctaIn, 8);
  const e = config.timing.ctaEmphasis;
  const pulse = t >= e && t <= e + 18 ? Math.sin(((t - e) / 18) * Math.PI) * 0.035 : 0;
  const width = config.ui.contentRight - config.ui.contentLeft - 60;
  return (
    <div
      style={{
        position: 'absolute',
        left: config.ui.contentLeft + 30,
        top: L.cta + (1 - k) * 14,
        width,
        height: L.ctaH,
        borderRadius: L.ctaH / 2,
        background: config.colors.turquoise,
        boxShadow: '0 10px 24px rgba(30,140,160,0.25)',
        opacity: k,
        transform: `scale(${1 + pulse})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: FONT_HEAD,
        fontWeight: 800,
        fontSize: 54,
        letterSpacing: '0.01em',
        color: config.colors.ink,
        whiteSpace: 'nowrap',
      }}
    >
      <CopyText text={config.copy.cta} />
    </div>
  );
};

export const RewardBottomSheet: React.FC = () => {
  const config = useConfig();
  const t = useT();
  if (t < config.timing.sheetRiseStart) return null;
  const top = sheetTopAt(config, t);
  const s06 = config.shots.s06[0];
  const headK = ramp(t, s06 + 2, 8);
  const supK = ramp(t, s06 + 6, 8);
  const closeK = ramp(t, config.timing.closingIn, 8);
  const colLeft = config.ui.contentLeft;
  const colW = config.ui.contentRight - config.ui.contentLeft;
  const centered: React.CSSProperties = {position: 'absolute', left: colLeft, width: colW, textAlign: 'center'};

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top,
        width: WIDTH,
        height: HEIGHT - config.ui.sheetFinalTop + 80,
        background: config.colors.white,
        borderRadius: '44px 44px 0 0',
        boxShadow: '0 -8px 36px rgba(5,5,6,0.14)',
      }}
    >
      <div style={{position: 'absolute', top: L.handle, left: WIDTH / 2 - 48, width: 96, height: 10, borderRadius: 5, background: '#D5D9DE'}} />
      <div
        style={{
          ...centered,
          top: L.label,
          fontFamily: FONT_UI,
          fontWeight: 700,
          fontSize: 25,
          letterSpacing: '0.16em',
          color: config.colors.turquoiseText,
        }}
      >
        {config.copy.sheetLabel}
      </div>
      {/* Headline: skeleton bar while loading, then the copy. */}
      <div style={{position: 'absolute', top: L.headline + 16, left: colLeft + (colW - 520) / 2, width: 520, height: 54, borderRadius: 27, background: '#ECEEF1', opacity: 1 - headK}} />
      <div
        style={{
          ...centered,
          top: L.headline + (1 - headK) * 8,
          opacity: headK,
          fontFamily: FONT_HEAD,
          fontWeight: 800,
          fontSize: 84,
          lineHeight: 1,
          letterSpacing: '-0.01em',
          color: config.colors.ink,
        }}
      >
        {config.copy.sheetHeadline}
      </div>
      <PrizePoolCard t={t} config={config} />
      <div
        style={{
          ...centered,
          top: L.supporting,
          opacity: supK,
          fontFamily: FONT_UI,
          fontWeight: 600,
          fontSize: 36,
          color: config.colors.ink,
        }}
      >
        {config.copy.supporting}
      </div>
      <RevealCTA t={t} config={config} />
      <div style={{...centered, top: L.closing, opacity: closeK, fontFamily: FONT_UI, fontWeight: 600, fontSize: 32, color: 'rgba(5,5,6,0.78)'}}>
        {config.copy.closing}
      </div>
      <div style={{...centered, top: L.terms, opacity: closeK, fontFamily: FONT_UI, fontWeight: 500, fontSize: 22, color: 'rgba(5,5,6,0.5)'}}>
        {config.copy.terms}
      </div>
    </div>
  );
};
