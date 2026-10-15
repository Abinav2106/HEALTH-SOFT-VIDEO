import React from 'react';
import {Img, staticFile} from 'remotion';
import {ASSET, C} from '../constants';
import metrics from '../assetMetrics.json';

// Doubt = the approved neutral render, split into its own layers (body, question mark, contact shadow).
// Nothing is redrawn. Performance available without a rig: question-mark tilt / lift, a small torso lean
// about the feet, framing. Hand gestures, pickup and turns need the rigged model (see BLOCKED shots).

/** Render-pixel centre of the question mark — the anchor every camera keyframe is written against. */
export const Q_CENTER = {x: metrics.qmark.x + metrics.qmark.w / 2, y: metrics.qmark.y + metrics.qmark.h / 2};
export const Q_HEIGHT = metrics.qmark.h;
const FEET = {x: metrics.body.x + metrics.body.w / 2, y: metrics.body.y + metrics.body.h - 6};
const Q_PIVOT = {x: Q_CENTER.x - 6, y: metrics.qmark.y + metrics.qmark.h - 10}; // under the dot

export type Cam = {s: number; sx: number; sy: number}; // Q_CENTER sits at screen (sx, sy) at scale s

export type DoubtPose = {
  qTilt?: number; // degrees about the dot
  qLift?: number; // render px, up
  lean?: number; // degrees about the feet
  glow?: number; // 0..1, the brief opening light effect only
};

export const Doubt: React.FC<{cam: Cam; pose?: DoubtPose; shadow?: number}> = ({cam, pose = {}, shadow = 1}) => {
  const {qTilt = 0, qLift = 0, lean = 0, glow = 0} = pose;
  const tx = cam.sx - Q_CENTER.x * cam.s;
  const ty = cam.sy - Q_CENTER.y * cam.s;
  const abs = (b: {x: number; y: number; w: number; h: number}): React.CSSProperties => ({
    position: 'absolute',
    left: b.x,
    top: b.y,
    width: b.w,
    height: b.h,
  });
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: metrics.render.w,
        height: metrics.render.h,
        transformOrigin: '0 0',
        transform: `translate(${tx}px, ${ty}px) scale(${cam.s})`,
      }}
    >
      <Img src={staticFile(ASSET.shadow)} style={{...abs(metrics.shadow), opacity: shadow}} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transformOrigin: `${FEET.x}px ${FEET.y}px`,
          transform: `rotate(${lean}deg)`,
        }}
      >
        <Img src={staticFile(ASSET.body)} style={abs(metrics.body)} />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transformOrigin: `${Q_PIVOT.x}px ${Q_PIVOT.y}px`,
            transform: `translateY(${-qLift}px) rotate(${qTilt}deg)`,
          }}
        >
          {glow > 0 ? (
            <div
              style={{
                position: 'absolute',
                left: Q_CENTER.x - 330,
                top: Q_CENTER.y - 330,
                width: 660,
                height: 660,
                borderRadius: '50%',
                background: `radial-gradient(circle, rgba(255,106,0,${0.55 * glow}) 0%, rgba(255,106,0,${0.18 * glow}) 38%, rgba(255,255,255,0) 70%)`,
              }}
            />
          ) : null}
          <Img src={staticFile(ASSET.qmark)} style={abs(metrics.qmark)} />
        </div>
      </div>
    </div>
  );
};

/** Screen position of a render-space point under a camera (for anchoring props/graphics to Doubt). */
export const toScreen = (cam: Cam, x: number, y: number) => ({
  x: cam.sx + (x - Q_CENTER.x) * cam.s,
  y: cam.sy + (y - Q_CENTER.y) * cam.s,
});

export const Stage: React.FC<{color?: string; children?: React.ReactNode}> = ({color = C.white, children}) => (
  <div style={{position: 'absolute', inset: 0, background: color, overflow: 'hidden'}}>{children}</div>
);
