import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';
import {AnimatedText} from '../../components/AnimatedText';
import {Background} from '../../components/Background';
import {RevealLine} from '../../components/RevealLine';
import {clamp, EASE, progress, useScale} from '../../lib/animation';
import {COLORS, FONT} from '../../theme/theme';

// Minimal template: `npm run new -- MyVideo` copies this folder and registers the copy in Root.tsx.

export const starterSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
});

export type StarterProps = z.infer<typeof starterSchema>;

/** Length in seconds — Root.tsx multiplies by the fps. */
export const STARTER_SECONDS = 5;

export const Starter: React.FC<StarterProps> = ({title, subtitle}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const k = useScale();
  const subtitleIn = progress(frame, 0.9 * fps, 0.6 * fps);
  const exit = interpolate(frame, [durationInFrames - 0.5 * fps, durationInFrames - 1], [1, 0], {...clamp, easing: EASE.in});

  return (
    <AbsoluteFill style={{opacity: exit}}>
      <Background />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', fontFamily: FONT.family, color: COLORS.text, textAlign: 'center', gap: 36 * k}}>
        <div style={{fontSize: FONT.size.title * k, fontWeight: FONT.weight.black, letterSpacing: FONT.tracking.tight}}>
          <AnimatedText text={title} delay={0.2 * fps} stagger={0.1 * fps} distance={50 * k} />
        </div>
        <RevealLine width={280 * k} thickness={8 * k} delay={0.6 * fps} duration={0.6 * fps} />
        <div style={{fontSize: FONT.size.body * k, color: COLORS.muted, opacity: subtitleIn, translate: `0 ${(1 - subtitleIn) * 20 * k}px`}}>{subtitle}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
