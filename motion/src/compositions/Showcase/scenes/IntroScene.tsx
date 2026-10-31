import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {AnimatedText} from '../../../components/AnimatedText';
import {Background} from '../../../components/Background';
import {RevealLine} from '../../../components/RevealLine';
import {clamp, EASE, progress, useScale} from '../../../lib/animation';
import {COLORS, FONT} from '../../../theme/theme';

type Props = {
  readonly eyebrow: string;
  readonly title: string;
  readonly subtitle: string;
  readonly accent: string;
  readonly secondary: string;
};

export const IntroScene: React.FC<Props> = ({eyebrow, title, subtitle, accent, secondary}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = useScale();
  const eyebrowIn = progress(frame, 0, 0.6 * fps);
  const subtitleIn = progress(frame, 1.1 * fps, 0.7 * fps);

  return (
    <AbsoluteFill>
      <Background accent={accent} secondary={secondary} />
      <AbsoluteFill style={{justifyContent: 'center', padding: `0 ${180 * k}px`, fontFamily: FONT.family, color: COLORS.text}}>
        <div
          style={{
            alignSelf: 'flex-start',
            padding: `${10 * k}px ${22 * k}px`,
            borderRadius: 999,
            border: `2px solid ${secondary}66`,
            color: secondary,
            fontSize: FONT.size.eyebrow * k,
            fontWeight: FONT.weight.semibold,
            letterSpacing: FONT.tracking.wide,
            textTransform: 'uppercase',
            opacity: eyebrowIn,
            translate: `${interpolate(eyebrowIn, [0, 1], [-30 * k, 0])}px 0`,
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            marginTop: 36 * k,
            fontSize: FONT.size.hero * k,
            fontWeight: FONT.weight.black,
            letterSpacing: FONT.tracking.tight,
            lineHeight: 1.02,
            maxWidth: 1400 * k,
          }}
        >
          <AnimatedText text={title} delay={0.25 * fps} stagger={0.12 * fps} distance={60 * k} />
        </div>
        <div style={{marginTop: 40 * k}}>
          <RevealLine width={360 * k} thickness={10 * k} delay={0.8 * fps} duration={0.7 * fps} from={secondary} to={accent} />
        </div>
        <div
          style={{
            marginTop: 40 * k,
            fontSize: FONT.size.body * k,
            fontWeight: FONT.weight.regular,
            color: COLORS.muted,
            maxWidth: 1100 * k,
            lineHeight: 1.4,
            opacity: subtitleIn,
            translate: `0 ${interpolate(subtitleIn, [0, 1], [24 * k, 0], {...clamp, easing: EASE.out})}px`,
          }}
        >
          {subtitle}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
