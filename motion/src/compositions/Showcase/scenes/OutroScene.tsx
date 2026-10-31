import {Circle, Star, Triangle} from '@remotion/shapes';
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Background} from '../../../components/Background';
import {clamp, EASE, progress, springIn, useScale} from '../../../lib/animation';
import {COLORS, FONT} from '../../../theme/theme';

type Props = {
  readonly accent: string;
  readonly secondary: string;
};

/** Seconds into the scene when the mark locks together — Showcase syncs the chime to this. */
export const OUTRO_LOCK_TIME = 0.75;

export const OutroScene: React.FC<Props> = ({accent, secondary}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = useScale();
  const gather = progress(frame, 0, OUTRO_LOCK_TIME * fps, EASE.inOut);
  const lock = springIn(frame, fps, OUTRO_LOCK_TIME * fps, {damping: 9, stiffness: 160});
  const textIn = progress(frame, 0.9 * fps, 0.7 * fps);
  const spin = interpolate(frame, [0, 3 * fps], [-120, 0], {...clamp, easing: EASE.out});

  // Three shapes fly in from the corners and settle into one mark.
  const parts = [
    {from: [-520, -260], to: [-70, 20], el: <Circle radius={58 * k} fill={secondary} />},
    {from: [560, -220], to: [70, 20], el: <Triangle length={138 * k} direction="up" cornerRadius={14 * k} fill={accent} />},
    {from: [0, 360], to: [0, -78], el: <Star points={5} innerRadius={30 * k} outerRadius={64 * k} edgeRoundness={0.3} fill={COLORS.amber} />},
  ];

  return (
    <AbsoluteFill>
      <Background accent={accent} secondary={secondary} drift={0.6} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', fontFamily: FONT.family, color: COLORS.text}}>
        <div style={{position: 'relative', width: 360 * k, height: 300 * k, scale: interpolate(lock, [0, 1], [0.9, 1])}}>
          {parts.map((p, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                translate: `calc(-50% + ${interpolate(gather, [0, 1], [p.from[0], p.to[0]]) * k}px) calc(-50% + ${interpolate(gather, [0, 1], [p.from[1], p.to[1]]) * k}px)`,
                rotate: `${spin * (i % 2 ? 1 : -1)}deg`,
                opacity: interpolate(gather, [0, 0.3], [0, 1], clamp),
              }}
            >
              {p.el}
            </div>
          ))}
        </div>
        <div
          style={{
            marginTop: 50 * k,
            fontSize: FONT.size.title * k,
            fontWeight: FONT.weight.black,
            letterSpacing: FONT.tracking.tight,
            opacity: textIn,
            translate: `0 ${interpolate(textIn, [0, 1], [30 * k, 0])}px`,
          }}
        >
          Made with Remotion
        </div>
        <div style={{marginTop: 18 * k, fontSize: FONT.size.caption * k, color: COLORS.muted, letterSpacing: FONT.tracking.wide, textTransform: 'uppercase', opacity: progress(frame, 1.3 * fps, 0.6 * fps)}}>
          Programmatic motion graphics
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
