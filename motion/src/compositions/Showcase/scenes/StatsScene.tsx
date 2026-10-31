import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {AnimatedText} from '../../../components/AnimatedText';
import {Background} from '../../../components/Background';
import {Counter} from '../../../components/Counter';
import {clamp, progress, springIn, useScale} from '../../../lib/animation';
import {COLORS, FONT} from '../../../theme/theme';

type Props = {
  readonly accent: string;
  readonly secondary: string;
  /** Length of the whole video (a Sequence's own useVideoConfig() would report the scene length). */
  readonly videoSeconds: number;
};

/** Kinetic numbers read straight from the composition config — proof that the format is live. */
export const StatsScene: React.FC<Props> = ({accent, secondary, videoSeconds}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const k = useScale();
  const stats = [
    {label: 'Resolution', node: (d: number) => (<><Counter value={width} delay={d} duration={0.9 * fps} />×<Counter value={height} delay={d} duration={0.9 * fps} /></>), color: secondary},
    {label: 'Frame rate', node: (d: number) => <Counter value={fps} delay={d} duration={0.9 * fps} suffix=" fps" />, color: accent},
    {label: 'Duration', node: (d: number) => <Counter value={videoSeconds} delay={d} duration={0.9 * fps} decimals={1} suffix=" s" />, color: COLORS.amber},
  ];
  const noteIn = progress(frame, 1.6 * fps, 0.6 * fps);

  return (
    <AbsoluteFill>
      <Background accent={accent} secondary={COLORS.pink} drift={0.8} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', fontFamily: FONT.family, color: COLORS.text, gap: 70 * k}}>
        <div style={{fontSize: FONT.size.heading * k, fontWeight: FONT.weight.bold, letterSpacing: FONT.tracking.normal, color: COLORS.muted}}>
          <AnimatedText text="Every frame is code." by="char" stagger={0.025 * fps} distance={30 * k} />
        </div>
        <div style={{display: 'flex', gap: 110 * k}}>
          {stats.map((s, i) => {
            const d = 0.35 * fps + i * 0.18 * fps;
            const t = springIn(frame, fps, d, {damping: 15, stiffness: 120});
            return (
              <div key={s.label} style={{textAlign: 'center', opacity: interpolate(t, [0, 0.5], [0, 1], clamp), scale: interpolate(t, [0, 1], [0.85, 1])}}>
                <div style={{fontSize: 104 * k, fontWeight: FONT.weight.black, letterSpacing: FONT.tracking.tight, color: s.color}}>{s.node(d)}</div>
                <div style={{marginTop: 10 * k, fontSize: FONT.size.caption * k, color: COLORS.muted, letterSpacing: FONT.tracking.wide, textTransform: 'uppercase'}}>{s.label}</div>
              </div>
            );
          })}
        </div>
        <div style={{fontSize: FONT.size.caption * k, color: COLORS.muted, opacity: noteIn}}>
          Change them in <span style={{color: COLORS.text, fontFamily: 'ui-monospace, monospace'}}>src/config/video.ts</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
