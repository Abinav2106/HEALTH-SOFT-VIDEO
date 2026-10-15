import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, COPY, FONT, FPS, T} from '../constants';
import {EASE_EXPAND, EASE_IN, EASE_IN_OUT, EASE_OUT, EASE_RISE, keys, lerp, prog} from '../lib/motion';
import {Hand, Logo, QMark} from './Brand';
import {CallControls, IncomingChip} from './CallUI';
import {Cam, Doubt, DoubtPose} from './Doubt';
import {GRID_PANELS, PANEL, PanelArt} from './Panels';
import {GRID} from './QuestionGrid';

// 03.93–15.00: match-cut reveal → incoming question → (blocked pickup) → R2 call close-up →
// R2 pullback → R2 wider grid (W&W panels around the same Doubt) → R3 layered cards, hand press,
// central panel expands into the first service scene.

const Q_S0 = GRID.markH / 242; // scale at which Doubt's question mark equals a grid mark (242 = qmark px height)

// Camera keyframes [t, s, sx, sy]; Doubt's question-mark centre is the anchor.
const CAM: [number, number, number, number][] = [
  [T.cut, Q_S0, GRID.sel.x, GRID.sel.y], // match-cut: same position, same size
  [4.3, Q_S0, GRID.sel.x, GRID.sel.y],
  [5.5, 0.62, 540, 734], // stage push-in toward the call
  // cut → phone-camera view (R2 close conversational framing)
  [5.5001, 1.75, 540, 520],
  [7.15, 1.75, 540, 520],
  [7.6, 1.86, 550, 498], // small reframe on Doubt's first line
  [9.15, 1.86, 550, 498],
  [9.6, 1.7, 532, 540], // listening
  [11.85, 1.7, 534, 536],
  [12.6, 0.75, 540, 688], // R2 pullback to the full figure
  [12.75, 0.75, 540, 688],
  [13.3, 0.36, 540, 826], // R2 wider-grid reveal
  [13.4, 0.36, 540, 826],
  [14.0, 0.36, 540, 2120], // camera lifts to the cards; Doubt leaves frame at the bottom
];

const camAt = (frame: number): Cam => {
  const times = CAM.map((k) => k[0]);
  const ease = CAM.slice(1).map((k, i) => (k[0] - CAM[i][0] < 0.01 ? () => 1 : EASE_IN_OUT));
  return {
    s: keys(frame, times, CAM.map((k) => k[1]), ease),
    sx: keys(frame, times, CAM.map((k) => k[2]), ease),
    sy: keys(frame, times, CAM.map((k) => k[3]), ease),
  };
};

// Expression without a face: question-mark tilt / lift, torso lean, pauses.
const poseAt = (frame: number): DoubtPose => ({
  glow: keys(frame, [T.cut, 4.45], [1, 0], EASE_OUT),
  qLift: keys(frame, [4.35, 4.55, 4.85, 7.2, 7.4, 7.8, 11.0, 11.2, 11.6], [0, 26, 0, 0, 12, 0, 0, 16, 0], EASE_IN_OUT),
  qTilt: keys(frame, [5.95, 6.45, 7.2, 7.55, 9.55, 10.05, 11.0, 11.35], [0, -8, -8, 0, 0, 10, 10, 0], EASE_IN_OUT),
  lean: keys(frame, [7.2, 7.7, 8.8, 9.3, 11.0, 11.4, 11.85, 12.3], [0, 1.6, 1.6, 0, 0, -1.2, -1.2, 0], EASE_IN_OUT),
});

// ── R2 grid → R3 layered composition ─────────────────────────────────────────
const CELL = {dx: 1000, dy: 1700, w: 820}; // render units around Doubt's figure centre
const FIG = {x: 563, y: 650};
const LAYERED: Record<string, {x: number; y: number; rot: number; k: number}> = {
  branding: {x: 296, y: 780, rot: -8, k: 1.38},
  consulting: {x: 800, y: 1050, rot: 9, k: 1.3},
};

const DEVICE = {cx: 540, cy: 1010, w: 540, h: 720, inset: 30, innerH: 560};
const PILL = {x: 540, y: DEVICE.cy + DEVICE.h / 2 - 92};

const DevicePanel: React.FC<{frame: number}> = ({frame}) => {
  const rise = prog(frame, 13.5, 0.42, EASE_RISE);
  const press = keys(frame, [14.18, 14.26, 14.4], [0, 1, 0], EASE_IN_OUT);
  const cleared = prog(frame, 14.28, 0.14, EASE_IN);
  const black = prog(frame, 14.3, 0.1, EASE_OUT);
  const expand = prog(frame, 14.42, 0.53, EASE_EXPAND);
  const innerW = DEVICE.w - DEVICE.inset * 2;
  const innerCy = DEVICE.cy - DEVICE.h / 2 + DEVICE.inset + DEVICE.innerH / 2;
  const S = Math.max(1080 / innerW, 1920 / DEVICE.innerH) * 1.06;
  const scale = lerp(1, S, expand);
  const tx = (540 - DEVICE.cx) * expand;
  const ty = (960 - innerCy) * expand + (1 - rise) * 1100;
  return (
    <div
      style={{
        position: 'absolute',
        left: DEVICE.cx - DEVICE.w / 2,
        top: DEVICE.cy - DEVICE.h / 2,
        width: DEVICE.w,
        height: DEVICE.h,
        transformOrigin: `${DEVICE.w / 2}px ${innerCy - (DEVICE.cy - DEVICE.h / 2)}px`,
        transform: `translate(${tx}px, ${ty}px) rotate(${(1 - rise) * 6}deg) scale(${scale})`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 56,
          background: C.white,
          boxShadow: `0 ${24 * (1 - expand)}px ${50 * (1 - expand)}px rgba(0,0,0,${0.14 * (1 - expand)})`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: DEVICE.inset,
          top: DEVICE.inset,
          width: innerW,
          height: DEVICE.innerH,
          borderRadius: 34,
          overflow: 'hidden',
          background: `rgb(${lerp(242, 0, black)}, ${lerp(242, 0, black)}, ${lerp(240, 0, black)})`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 44,
            transform: `translateY(${cleared * 260}px)`,
            opacity: 1 - cleared,
          }}
        >
          <QMark height={150} color={C.orange} />
          <Logo width={300} />
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: PILL.y - (DEVICE.cy - DEVICE.h / 2) - 38,
          transform: `translateX(-50%) scale(${1 - press * 0.06})`,
          padding: '0 36px',
          height: 76,
          borderRadius: 38,
          display: 'flex',
          alignItems: 'center',
          background: press > 0.05 || frame / FPS > 14.26 ? C.orange : C.black,
          color: press > 0.05 || frame / FPS > 14.26 ? C.black : C.white,
          fontFamily: FONT,
          fontWeight: 500,
          fontSize: 32,
          whiteSpace: 'nowrap',
          opacity: 1 - expand,
        }}
      >
        {COPY.brandName}
      </div>
    </div>
  );
};

export const DoubtSequence: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  if (t < T.cut || t >= T.a.from) return null;
  const cam = camAt(frame);
  const pose = poseAt(frame);
  const inCall = t >= T.call.from;
  const bg = inCall ? C.callBg : C.white;

  // Grid panels (world-attached around Doubt), two of which gather into the R3 layered composition.
  const gather = prog(frame, 13.38, 0.5, EASE_RISE);
  const gridVisible = t >= T.pull.from + 0.4;
  const panels = gridVisible
    ? GRID_PANELS.map((p, i) => {
        const wx = FIG.x + p.col * CELL.dx;
        const wy = FIG.y + p.row * CELL.dy;
        const sx = cam.sx + (wx - 569.5) * cam.s;
        const sy = cam.sy + (wy - 221) * cam.s;
        const k = (CELL.w * cam.s) / PANEL.w;
        const wobble = Math.sin((t - 12.9) * 5 + i * 1.7) * prog(frame, 13.0, 0.3) * (1 - gather);
        const target = LAYERED[p.id];
        // After the grid hold every panel is released from the camera: two gather into the R3 layers,
        // the rest drop out of frame (staggered), leaving the stage to the central panel.
        const hold = {sx: 540 + (wx - 569.5) * 0.36, sy: 826 + (wy - 221) * 0.36, k: (CELL.w * 0.36) / PANEL.w};
        const released = t >= 13.38;
        const drop = target ? 0 : prog(frame, 13.38 + (i % 4) * 0.04, 0.42, EASE_IN) * 2200;
        const x = released ? (target ? lerp(hold.sx, target.x, gather) : hold.sx) : sx;
        const y = released ? (target ? lerp(hold.sy, target.y, gather) : hold.sy + drop) : sy;
        const kk = released ? (target ? lerp(hold.k, target.k, gather) : hold.k) : k;
        const rot = target ? target.rot * gather : 0;
        return (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: x - PANEL.w / 2,
              top: y - PANEL.h / 2,
              width: PANEL.w,
              height: PANEL.h,
              transform: `rotate(${rot}deg) scale(${kk})`,
              boxShadow: target ? `0 ${18 * gather}px ${40 * gather}px rgba(0,0,0,${0.12 * gather})` : undefined,
              borderRadius: PANEL.r,
              zIndex: target ? 2 : 1,
            }}
          >
            <PanelArt id={p.id} wobble={wobble} />
          </div>
        );
      })
    : null;

  // Doubt's approved hand enters from below (he is just under frame after the camera lift) and presses the pill.
  const handIn = prog(frame, 13.86, 0.34, EASE_OUT);
  const handPress = keys(frame, [14.18, 14.26, 14.4], [0, 1, 0], EASE_IN_OUT);
  const handOut = prog(frame, 14.42, 0.3, EASE_IN);
  const tip = {
    x: lerp(980, PILL.x + 40, handIn) + handOut * 260,
    y: lerp(2150, PILL.y + 14, handIn) + handPress * 12 + handOut * 900,
  };

  return (
    <div style={{position: 'absolute', inset: 0, background: bg, overflow: 'hidden'}}>
      {panels}
      <div style={{position: 'absolute', inset: 0, zIndex: 1}}>
        <Doubt cam={cam} pose={pose} />
      </div>
      {t >= T.layer.from ? (
        <div style={{position: 'absolute', inset: 0, zIndex: 3}}>
          <DevicePanel frame={frame} />
          {t >= 13.86 && t < 14.8 ? <Hand x={tip.x} y={tip.y} scale={1.15} rotate={152} /> : null}
        </div>
      ) : null}
      {/* Call furniture: label from the first ring, controls only inside the call. */}
      <div style={{position: 'absolute', inset: 0, zIndex: 4}}>
        <IncomingChip
          opacity={keys(frame, [4.3, 4.5, 11.7, 11.95], [0, 1, 1, 0], EASE_IN_OUT)}
          ring={t < T.call.from + 0.6 ? ((t * 1.6) % 1) : 0}
        />
        {inCall && t < T.pull.from + 0.3 ? (
          <CallControls connectAt={T.call.from + 0.45} opacity={keys(frame, [11.85, 12.1], [1, 0])} />
        ) : null}
      </div>
    </div>
  );
};

/** 38.5–40.5: return to the same call set-up (same framing, same furniture). */
export const CallbackShot: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  if (t < T.callback.from || t >= T.close.from + 0.6) return null;
  const cam: Cam = {s: 1.86, sx: 550, sy: 498};
  const pose: DoubtPose = {
    qTilt: keys(frame, [38.75, 39.2, 39.5, 39.85], [0, -7, -7, 0], EASE_IN_OUT),
    qLift: keys(frame, [39.5, 39.7, 40.05], [0, 10, 0], EASE_IN_OUT),
  };
  return (
    <div style={{position: 'absolute', inset: 0, background: C.callBg, overflow: 'hidden'}}>
      <Doubt cam={cam} pose={pose} />
      <CallControls connectAt={0} opacity={1} />
    </div>
  );
};
