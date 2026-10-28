import React from 'react';
import {AbsoluteFill, Freeze, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {ClipId, CLIPS, COLORS, FONT_SANS, HEIGHT, WIDTH} from '../constants';
import {handheld} from '../lib/motion';
import {requireStatic, useRenderMode} from '../lib/renderMode';

type Props = {
  id: ClipId;
  from: number;
  to: number;
  /** Scale at absolute frame → used for push-ins and hard punch-ins. */
  scale?: (frame: number) => number;
  /** Handheld drift amplitude in px (0 = locked off). */
  shake?: number;
  /** Absolute frame at which the picture holds (pattern interruption). */
  freezeAt?: number;
  /** Absolute frame at which the picture resumes after a freeze. */
  resumeAt?: number;
  /** Source frame to resume from (a jump cut); default continues from the held frame. */
  resumeIn?: number;
  /** Transform origin (where punch-ins aim). */
  origin?: string;
  style?: React.CSSProperties;
};

// One live-action shot: generated clip, 1920x1080 cover, with commercial camera language added in post
// (handheld drift, punch-ins, freeze). Clips play at native speed; nothing is retimed or warped.
export const LiveShot: React.FC<Props> = ({id, from, to, scale, shake = 0, freezeAt, resumeAt, resumeIn, origin = '50% 45%', style}) => {
  const frame = useCurrentFrame();
  const {strict} = useRenderMode();
  const clip = CLIPS[id];
  const ready = requireStatic(clip.file, strict);
  if (frame < from || frame >= to) return null;

  // While frozen the camera stops too: hold the drift at its freeze value.
  const frozen = freezeAt !== undefined && frame >= freezeAt && (resumeAt === undefined || frame < resumeAt);
  const camFrame = frozen ? freezeAt! : frame;
  const h = handheld(camFrame, shake, from);
  const s = (scale ? scale(camFrame) : 1) * (shake > 0 ? 1.03 : 1); // overscan so drift never shows an edge
  const transform = `translate(${h.x}px, ${h.y}px) rotate(${h.r}deg) scale(${s})`;

  // After a resume the source continues from where it held (or jumps to `resumeIn`).
  const resumed = freezeAt !== undefined && resumeAt !== undefined && frame >= resumeAt;
  const seqFrom = resumed ? resumeAt! : from;
  const startFrom = resumed ? resumeIn ?? clip.in + (freezeAt! - from) : clip.in;

  const body = ready ? (
    <OffthreadVideo
      src={staticFile(clip.file)}
      startFrom={startFrom}
      muted
      style={{width: WIDTH, height: HEIGHT, objectFit: 'cover'}}
    />
  ) : (
    <ReviewPlate label={clip.label} />
  );

  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#000', ...style}}>
      <AbsoluteFill style={{transform, transformOrigin: origin}}>
        {frozen ? (
          <Sequence from={from} layout="none">
            <Freeze frame={freezeAt! - from}>{body}</Freeze>
          </Sequence>
        ) : (
          <Sequence from={seqFrom} layout="none">
            {body}
          </Sequence>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Review-only stand-in. Never rendered in master mode.
const ReviewPlate: React.FC<{label: string}> = ({label}) => (
  <AbsoluteFill style={{background: 'radial-gradient(120% 90% at 45% 40%, #3a3d40 0%, #17191a 100%)', width: WIDTH, height: HEIGHT}}>
    <div style={{position: 'absolute', top: 470, left: 0, right: 0, textAlign: 'center', fontFamily: FONT_SANS}}>
      <div style={{fontSize: 24, fontWeight: 700, letterSpacing: '0.2em', color: COLORS.cyan}}>CLIP PENDING</div>
      <div style={{fontSize: 34, fontWeight: 400, marginTop: 14, color: 'rgba(255,255,255,0.6)'}}>{label}</div>
    </div>
  </AbsoluteFill>
);
