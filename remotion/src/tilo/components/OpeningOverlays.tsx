import React from 'react';
import {Easing, interpolate} from 'remotion';
import {FONT_HEAD, FONT_UI} from '../lib/fonts';
import {useConfig, useT} from '../lib/timeline';
import {CopyText} from './CopyText';

// Shot 01 only. Everything here has faded to zero by the first frame of shot 02.

const useOpeningOut = () => {
  const config = useConfig();
  const t = useT();
  const end = config.shots.s01[1];
  return {
    t,
    config,
    visible: t < end,
    out: interpolate(t, [end - config.timing.openingOutFrames, end - 1], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  };
};

export const OpeningHeadline: React.FC = () => {
  const {t, config, visible, out} = useOpeningOut();
  if (!visible) return null;
  const k = interpolate(t, [config.timing.headlineIn, config.timing.headlineIn + 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  return (
    <div
      style={{
        position: 'absolute',
        left: config.ui.headline.x,
        top: config.ui.headline.y + (1 - k) * 16,
        maxWidth: config.ui.headlineMaxWidth,
        opacity: k * out,
        fontFamily: FONT_HEAD,
        fontWeight: 800,
        fontSize: config.ui.headlineSize,
        lineHeight: 0.94,
        letterSpacing: '-0.015em',
        color: config.colors.ink,
        textShadow: '0 0 22px rgba(255,255,255,0.9), 0 0 6px rgba(255,255,255,0.8)',
      }}
    >
      {config.copy.headline}
    </div>
  );
};

export const HoldSpeedCue: React.FC = () => {
  const {t, config, visible, out} = useOpeningOut();
  if (!visible || t < config.timing.cueIn) return null;
  const local = t - config.timing.cueIn;
  const k = interpolate(local, [0, 10], [0, 1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const PERIOD = 36;
  const rings = [0, PERIOD / 2]
    .map((off) => local - off)
    .filter((l) => l >= 0)
    .map((l) => (l % PERIOD) / PERIOD);
  return (
    <div
      style={{
        position: 'absolute',
        right: config.ui.cueRight,
        top: config.ui.cueTop,
        opacity: k * out,
        transform: `translateX(${(1 - k) * 12}px)`,
        display: 'flex',
        alignItems: 'center',
        gap: 22,
      }}
    >
      {/* A hint label, deliberately not styled like a game button. */}
      <div
        style={{
          padding: '14px 24px',
          borderRadius: 999,
          background: 'rgba(5,5,6,0.62)',
          color: config.colors.white,
          fontFamily: FONT_UI,
          fontWeight: 700,
          fontSize: 30,
          letterSpacing: '0.05em',
          whiteSpace: 'nowrap',
        }}
      >
        <CopyText text={config.copy.holdCue} />
      </div>
      <div style={{position: 'relative', width: 30, height: 30}}>
        {rings.map((p, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: `3px solid ${config.colors.turquoise}`,
              transform: `scale(${1 + p * 1.7})`,
              opacity: 0.8 * (1 - p),
            }}
          />
        ))}
        <div
          style={{
            position: 'absolute',
            inset: 4,
            borderRadius: '50%',
            background: config.colors.white,
            border: `4px solid ${config.colors.turquoise}`,
          }}
        />
      </div>
    </div>
  );
};
