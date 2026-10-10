import React from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, staticFile} from 'remotion';
import {COLORS, FONT_SANS, FPS} from '../constants';
import {assertStock, coverLayout, isReady, ShotId, stockClip} from '../stock/stock';
import {useRenderMode} from '../lib/renderMode';

// One live-action shot: the licensed source clip, cover-cropped to 9:16 on its focus point, playing at
// its native speed from `sourceIn`. Review renders show a neutral plate if the clip is not in yet;
// master renders throw instead, so a placeholder can never reach a deliverable.
export const StockShot: React.FC<{id: ShotId; from: number; to: number; style?: React.CSSProperties}> = ({id, from, to, style}) => {
  const {strict} = useRenderMode();
  const clip = strict ? assertStock(id) : stockClip(id);

  if (!isReady(clip)) {
    return <ReviewPlate role={clip.role} id={id} style={style} />;
  }
  const l = coverLayout(clip);
  return (
    <Sequence from={from} durationInFrames={to - from} layout="none">
      <AbsoluteFill style={{overflow: 'hidden', background: '#000', ...style}}>
        <OffthreadVideo
          src={staticFile(`stock/${clip.file}`)}
          startFrom={Math.round(clip.sourceIn * FPS)}
          muted
          style={{position: 'absolute', left: l.left, top: l.top, width: l.dw, height: l.dh}}
        />
      </AbsoluteFill>
    </Sequence>
  );
};

// Review-only stand-in. Never rendered in master mode.
const ReviewPlate: React.FC<{role: string; id: ShotId; style?: React.CSSProperties}> = ({role, id, style}) => (
  <AbsoluteFill style={{background: `radial-gradient(120% 80% at 50% 38%, ${COLORS.plateA} 0%, ${COLORS.plateB} 100%)`, ...style}}>
    <div style={{position: 'absolute', top: 300, left: 0, right: 0, textAlign: 'center', fontFamily: FONT_SANS}}>
      <div style={{fontSize: 22, fontWeight: 600, letterSpacing: '0.22em', color: COLORS.orange}}>STOCK PENDING · {id.toUpperCase()}</div>
      <div style={{fontSize: 28, fontWeight: 400, marginTop: 14, color: 'rgba(255,255,255,0.55)', padding: '0 80px'}}>{role}</div>
    </div>
  </AbsoluteFill>
);
