import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, DIALOGUE, FONT, FPS, T} from '../constants';

// Internal-preview burn-ins only (never in the master): timecode, section, blocked shots, scratch captions.

type Flag = {from: number; to: number; text: string; kind: 'blocked' | 'provisional'};
const RIG = 'PROVISIONAL · 2D cut-out rig of the approved render (no turns/depth) — replace with 3D rig renders';
export const FLAGS: Flag[] = [
  {from: T.stage.from, to: T.layer.from, kind: 'provisional', text: RIG},
  {from: 13.86, to: 14.6, kind: 'provisional', text: 'PROVISIONAL · 2D cutout of the approved hand; replace with rig render'},
  {from: 25.9, to: 26.9, kind: 'provisional', text: 'PROVISIONAL · 2D cutout of the approved hand; replace with rig render'},
  {from: T.r4.from + 0.3, to: T.r4.to, kind: 'provisional', text: 'CONCEPT MATERIAL · cards are stills from this film, not client campaigns'},
  {from: T.callback.from, to: T.callback.to, kind: 'provisional', text: RIG},
];

const SECTIONS: [number, string][] = [
  [T.r1.from, 'R1 questions resolve'],
  [T.stage.from, 'R2 reveal / incoming'],
  [T.call.from, 'R2 the call'],
  [T.pull.from, 'R2 pullback + grid'],
  [T.layer.from, 'R3 layered cards'],
  [T.a.from, 'R3 consulting + branding'],
  [T.b.from, 'R3 creative + marketing + ads'],
  [T.c.from, 'R3 Meta setup'],
  [T.r4.from, 'R4 the work collects'],
  [T.callback.from, 'R2 callback'],
  [T.close.from, 'R3 close'],
];

const tc = (frame: number) => {
  const s = Math.floor(frame / FPS);
  const ff = frame % FPS;
  return `00:${String(s).padStart(2, '0')}:${String(ff).padStart(2, '0')}`;
};

export const ReviewBurnIn: React.FC<{captions: boolean}> = ({captions}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const section = [...SECTIONS].reverse().find(([s]) => t >= s)?.[1] ?? '';
  const flags = FLAGS.filter((x) => t >= x.from && t < x.to);
  const line = DIALOGUE.find((l) => t >= l.at && t < l.end + 0.15);
  const mono: React.CSSProperties = {fontFamily: FONT, fontWeight: 500, fontSize: 22, letterSpacing: 0.4};
  return (
    <div style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
      <div
        style={{
          ...mono,
          position: 'absolute',
          top: 22,
          left: 22,
          padding: '6px 12px',
          borderRadius: 8,
          background: 'rgba(0,0,0,0.55)',
          color: C.white,
        }}
      >
        REVIEW · {tc(frame)} · f{frame} · {section}
      </div>
      {flags.map((fl, i) => (
        <div
          key={fl.text}
          style={{
            ...mono,
            position: 'absolute',
            top: 66 + i * 44,
            left: 22,
            right: 22,
            padding: '6px 12px',
            borderRadius: 8,
            background: fl.kind === 'blocked' ? 'rgba(200,0,0,0.85)' : 'rgba(0,0,0,0.55)',
            color: C.white,
            fontSize: 20,
          }}
        >
          {fl.text}
        </div>
      ))}
      {captions && line ? (
        <div
          style={{
            position: 'absolute',
            left: 60,
            right: 60,
            bottom: 70,
            textAlign: 'center',
            fontFamily: FONT,
            fontWeight: 500,
            fontSize: 36,
            lineHeight: 1.25,
            color: C.white,
          }}
        >
          <span style={{background: 'rgba(0,0,0,0.72)', padding: '6px 14px', borderRadius: 8, boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone'}}>
            <span style={{opacity: 0.6}}>{line.speaker === 'caller' ? 'CALLER  ' : line.speaker === 'doubt' ? 'DOUBT  ' : 'VOICE  '}</span>
            {line.text}
          </span>
        </div>
      ) : null}
    </div>
  );
};
