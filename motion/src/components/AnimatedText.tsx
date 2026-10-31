import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, mix, springIn} from '../lib/animation';

type Props = {
  readonly text: string;
  /** Animate word by word (default) or character by character. */
  readonly by?: 'word' | 'char';
  /** Frames before the first unit starts. */
  readonly delay?: number;
  /** Frames between consecutive units. */
  readonly stagger?: number;
  /** Rise distance in px. */
  readonly distance?: number;
  readonly style?: React.CSSProperties;
};

/**
 * Kinetic typography: each word (or character) rises, sharpens and fades in on a spring, staggered.
 * Words never break mid-word, so it wraps like normal text.
 */
export const AnimatedText: React.FC<Props> = ({text, by = 'word', delay = 0, stagger = 4, distance = 40, style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const words = text.split(' ');
  let unit = 0;

  const animated = (content: string, key: string) => {
    const t = springIn(frame, fps, delay + unit++ * stagger, {damping: 18, stiffness: 110});
    return (
      <span
        key={key}
        style={{
          display: 'inline-block',
          opacity: interpolate(t, [0, 0.6], [0, 1], clamp),
          translate: `0 ${mix(distance, 0, t)}px`,
          filter: `blur(${interpolate(t, [0, 1], [10, 0], clamp)}px)`,
          whiteSpace: 'pre',
        }}
      >
        {content}
      </span>
    );
  };

  return (
    <span style={style}>
      {words.map((word, w) => (
        // The space sits *between* the inline-block words; inside them it would collapse.
        <React.Fragment key={w}>
          <span style={{display: 'inline-block', whiteSpace: 'nowrap'}}>
            {by === 'word' ? animated(word, `w${w}`) : word.split('').map((ch, c) => animated(ch, `c${w}-${c}`))}
          </span>
          {w < words.length - 1 ? ' ' : null}
        </React.Fragment>
      ))}
    </span>
  );
};
