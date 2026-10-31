import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {AnimatedText} from '../../../components/AnimatedText';
import {Background} from '../../../components/Background';
import {ShapeBadge, ShapeKind} from '../../../components/ShapeBadge';
import {clamp, springIn, stagger, useScale} from '../../../lib/animation';
import {COLORS, FONT} from '../../../theme/theme';

type Feature = {readonly title: string; readonly caption: string};
type Props = {
  readonly features: readonly Feature[];
  readonly accent: string;
  readonly secondary: string;
};

const SHAPES: ShapeKind[] = ['circle', 'triangle', 'star'];

/** Card entrance times (seconds into the scene) — also used by Showcase to sync the "pop" sounds. */
export const FEATURE_CARD_TIMES = [0.55, 0.8, 1.05];

export const FeaturesScene: React.FC<Props> = ({features, accent, secondary}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = useScale();
  const colors = [secondary, accent, COLORS.amber];
  const heading = features.map((f) => `${f.title}.`).join(' ');

  return (
    <AbsoluteFill>
      <Background accent={secondary} secondary={accent} drift={1.2} />
      <AbsoluteFill style={{padding: `${130 * k}px ${160 * k}px`, fontFamily: FONT.family, color: COLORS.text}}>
        <div style={{fontSize: FONT.size.title * k, fontWeight: FONT.weight.black, letterSpacing: FONT.tracking.tight}}>
          <AnimatedText text={heading} delay={0} stagger={0.14 * fps} distance={50 * k} />
        </div>
        <div style={{display: 'flex', gap: 48 * k, marginTop: 90 * k, flex: 1, alignItems: 'stretch'}}>
          {features.map((f, i) => {
            const at = stagger(i, 0.25 * fps, FEATURE_CARD_TIMES[0] * fps);
            const t = springIn(frame, fps, at, {damping: 16, stiffness: 110});
            return (
              <div
                key={f.title}
                style={{
                  flex: 1,
                  borderRadius: 36 * k,
                  padding: `${56 * k}px ${48 * k}px`,
                  background: `linear-gradient(180deg, ${COLORS.surface}EE, ${COLORS.night}CC)`,
                  border: `2px solid ${colors[i]}33`,
                  boxShadow: `0 ${30 * k}px ${80 * k}px ${COLORS.ink}AA`,
                  opacity: interpolate(t, [0, 0.5], [0, 1], clamp),
                  translate: `0 ${interpolate(t, [0, 1], [120 * k, 0])}px`,
                }}
              >
                <ShapeBadge kind={SHAPES[i]} color={colors[i]} size={150 * k} delay={at + 0.1 * fps} />
                <div style={{marginTop: 44 * k, fontSize: FONT.size.heading * k, fontWeight: FONT.weight.bold, letterSpacing: FONT.tracking.normal}}>
                  {f.title}
                </div>
                <div style={{marginTop: 16 * k, fontSize: FONT.size.caption * k, color: COLORS.muted, lineHeight: 1.45}}>{f.caption}</div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
