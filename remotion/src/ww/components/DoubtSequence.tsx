import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, COPY, FONT, FPS, T} from '../constants';
import {EASE_EXPAND, EASE_IN, EASE_IN_OUT, EASE_OUT, EASE_RISE, keys, lerp, prog} from '../lib/motion';
import {Hand, Logo, QMark} from './Brand';
import {CallControls, IncomingChip} from './CallUI';
import {Cam, DoubtRig, RigPose} from '../rig/DoubtRig';
import {E, makeTrack, win, wobble} from '../rig/perf';
import {GRID_PANELS, PANEL, PanelArt} from './Panels';
import {GRID} from './QuestionGrid';

// 03.93–15.00: match-cut reveal → incoming question, Doubt lifts the phone → R2 call (phone-camera
// view, selfie arm, gestures) → R2 pullback → R2 wider grid (W&W panels around the same Doubt) → R3
// layered cards, hand press, central panel expands into the first service scene.
// Character performance runs on the 2D cut-out rig of the approved render (rig/DoubtRig.tsx).

const Q_S0 = GRID.markH / 242; // scale at which Doubt's question mark equals a grid mark (242 = qmark px height)

// Camera keyframes [t, s, sx, sy, ease?]; Doubt's question-mark centre is the anchor.
const CAM: [number, number, number, number, ((x: number) => number)?][] = [
  [T.cut, Q_S0, GRID.sel.x, GRID.sel.y], // match-cut: same position, same size
  [4.5, Q_S0, GRID.sel.x, GRID.sel.y], // hold wide through the ring and the startle
  [5.42, 1.0, 540, 560], // follow the phone up: medium on Doubt + phone
  [5.48, 1.0, 540, 560],
  // cut → phone-camera view (R2: close, conversational, handheld)
  [T.call.from, 1.5, 540, 470, () => 1],
  [7.85, 1.5, 540, 470],
  [8.9, 1.58, 548, 462], // lean in on "Good place to start."
  [9.35, 1.58, 548, 462],
  [10.95, 1.66, 532, 480], // slow push while he listens
  [11.0, 1.66, 532, 480],
  [11.12, 1.72, 536, 510, E.out], // punch-in on "Good question."
  [11.85, 1.72, 536, 510],
  [12.6, 0.75, 540, 688], // R2 pullback to the full figure
  [12.75, 0.75, 540, 688],
  [13.3, 0.36, 540, 826], // R2 wider-grid reveal
  [13.4, 0.36, 540, 826],
  [14.0, 0.36, 540, 2120], // camera lifts to the cards; Doubt leaves frame at the bottom
];

const camAt = (frame: number): Cam => {
  const t = frame / FPS;
  const times = CAM.map((k) => k[0]);
  const ease = CAM.slice(1).map((k, i) => (k[0] - CAM[i][0] < 0.01 ? () => 1 : (k[4] ?? EASE_IN_OUT)));
  // Handheld phone-camera drift inside the call only; settles out over the pullback.
  const hh = win(t, T.call.from, 12.3, 0.35);
  return {
    s: keys(frame, times, CAM.map((k) => k[1]), ease),
    sx: keys(frame, times, CAM.map((k) => k[2]), ease) + 9 * wobble(t, 1) * hh,
    sy: keys(frame, times, CAM.map((k) => k[3]), ease) + 7 * wobble(t, 2) * hh,
    rot: 0.6 * wobble(t, 3) * hh,
  };
};

// Performance (pose keys). Expression without a face: question mark, hands, body, timing.
const PERF = makeTrack([
  [T.cut, {glow: 1, phone: {hand: 'r', show: 1, up: 0, buzz: 0}}],
  [4.34, {glow: 0.15}, E.out],
  // ring → startle: hop, question mark jumps, arms flick
  [4.44, {glow: 0, hop: 28, squash: 0.05, qLift: 34, qSquash: 0.12, armL: {s: 18, e: 6, w: 0}, armR: {s: 12, e: 4, w: 0}}, E.out],
  [4.62, {hop: 0, squash: -0.045, qLift: 6, qSquash: -0.06, armL: {s: 4, e: 0, w: 0}, armR: {s: 2, e: 0, w: 0}}, E.in],
  [4.74, {squash: 0, qSquash: 0, qLift: 0}, E.out],
  // lifts the phone up in front of himself, looks at it
  [5.12, {armR: {s: -35, e: -100, w: 0}, phone: {up: 1, tilt: -4}, lean: 2.2, qTilt: 9}],
  [5.3, {qTilt: 5, lean: 1.5}],
  [5.48, {qTilt: 6}],
  // cut: phone-camera view. He pops up into frame, selfie arm holding the camera (off-frame right).
  [T.call.from, {phone: {show: 0}, armR: {s: 32, e: -4, w: 0}, armL: {s: 10, e: 4, w: 0}, hop: -320, lean: 0, qTilt: 0, squash: 0.04}, E.lin],
  [5.78, {hop: 14, squash: 0.05, qLift: 10}, E.out],
  [5.95, {hop: 0, squash: -0.02, qLift: 0}],
  [6.05, {squash: 0}],
  // "Hello. Who's this?" — greets with a wave near the question mark
  [6.2, {armL: {s: 165, e: 55, w: 10}, qTilt: -6, lean: -1.5}, E.out],
  [6.85, {}],
  [7.12, {armL: {s: 18, e: 10, w: 0}, qTilt: -3, lean: 0}],
  // "Doubt." — taps own chest; "Good place to start." — open hand, leans in
  [7.38, {armL: {s: -25, e: -77, w: 0}, qLift: 16, qTilt: 0}, E.out],
  [7.6, {qLift: 0}],
  [7.78, {}],
  [8.05, {armL: {s: 60, e: 25, w: -20}, lean: 2.5, qTilt: 6}, E.out],
  [8.9, {armL: {s: 62, e: 22, w: -24}}],
  [9.2, {armL: {s: 12, e: 8, w: 0}, lean: 0, qTilt: 0}],
  // "What does Why & Whatever do?" — thinking: scratches the side of his question mark, which tilts
  [9.75, {armL: {s: 170, e: 88, w: 0}, qTilt: 10, lean: -2}],
  [10.85, {qTilt: 8}],
  [11.0, {armL: {s: 30, e: 10, w: 0}, qTilt: 0}],
  // "Good question." — hops, the question mark twirls (overlay below), hand opens out
  [11.14, {hop: 22, squash: 0.05, qLift: 22, qSquash: 0.1, armL: {s: 52, e: 30, w: -20}, lean: 0}, E.out],
  [11.36, {hop: 0, squash: -0.035, qLift: 2, qSquash: -0.05}, E.in],
  [11.5, {squash: 0, qSquash: 0, qLift: 0}],
  [11.85, {}],
  // pullback: puts the camera down, then presents the wider grid with both arms
  [12.3, {armL: {s: 12, e: 4, w: 0}, armR: {s: 8, e: 0, w: 0}}],
  [12.75, {armL: {s: 8, e: 4, w: 0}, armR: {s: 8, e: 0, w: 0}}],
  [12.88, {hop: 14, squash: 0.03}, E.out],
  [13.05, {hop: 0, squash: 0, armL: {s: 62, e: 18, w: -18}, armR: {s: 62, e: 18, w: -18}}, E.out],
  [13.35, {}],
]);

// Layered on top of the keys: ring buzz, wave, taps, idle float, talking nods.
const poseAt = (frame: number): RigPose => {
  const t = frame / FPS;
  const p = PERF(t);
  const ring = t >= 4.3 && t < 5.02 && (t - 4.3) % 0.42 < 0.3 ? 1 : 0;
  const wave = win(t, 6.2, 6.9, 0.1);
  const tap = win(t, 7.38, 7.78, 0.08);
  const scratch = win(t, 9.8, 10.7, 0.15);
  const talk = win(t, 7.2, 9.0, 0.2) + win(t, 11.0, 11.85, 0.15);
  return {
    ...p,
    phone: {...p.phone, buzz: ring * p.phone.show},
    armL: {
      s: p.armL.s,
      e: p.armL.e + 16 * Math.sin(2 * Math.PI * 3.0 * (t - 6.2)) * wave + 7 * Math.sin(2 * Math.PI * 5 * (t - 7.38)) * tap + 4 * Math.sin(2 * Math.PI * 3.2 * t) * scratch,
      w: p.armL.w + 12 * Math.sin(2 * Math.PI * 3.0 * (t - 6.2) + 0.6) * wave + 10 * Math.sin(2 * Math.PI * 3.2 * t + 1) * scratch,
    },
    squash: p.squash + 0.008 * Math.sin(2 * Math.PI * 0.55 * t),
    qLift: p.qLift + 5 * Math.sin(2 * Math.PI * 0.8 * t + 1),
    qTilt: p.qTilt + 1.2 * Math.sin(2 * Math.PI * 0.4 * t) + 3 * Math.sin(2 * Math.PI * 2.2 * t) * talk,
    qSpin: 360 * E.io(Math.min(1, Math.max(0, (t - 11.02) / 0.4))),
  };
};

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
        <DoubtRig cam={cam} pose={pose} frame={frame} />
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

/** 38.5–40.5: return to the same call set-up (same framing, same selfie grip, same furniture). */
const CALLBACK = makeTrack([
  [T.callback.from, {armR: {s: 32, e: -4, w: 0}, armL: {s: 10, e: 4, w: 0}}],
  [38.62, {}],
  // "So… whatever?" — shrug, question mark tilts
  [38.9, {armL: {s: 38, e: -58, w: 0}, squash: -0.03, qTilt: -7, lean: -1.5}, E.out],
  [39.35, {armL: {s: 36, e: -56, w: 0}}],
  // "Whatever. Never random." — hand up, then out, calm
  [39.62, {armL: {s: 160, e: 52, w: -8}, squash: 0.02, qTilt: 0, qLift: 12, lean: 0}, E.out],
  [39.8, {qLift: 0, squash: 0}],
  [40.05, {}],
  [40.3, {armL: {s: 62, e: 14, w: -14}, lean: 2, qTilt: 4}, E.out],
  [41.1, {}],
]);

export const CallbackShot: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  if (t < T.callback.from || t >= T.close.from + 0.6) return null;
  const k = keys(frame, [T.callback.from, 40.4], [0, 1], EASE_IN_OUT);
  const cam: Cam = {
    s: lerp(1.5, 1.58, k),
    sx: 540 + 9 * wobble(t, 4),
    sy: lerp(470, 460, k) + 7 * wobble(t, 5),
    rot: 0.6 * wobble(t, 6),
  };
  const p = CALLBACK(t);
  const talk = win(t, 39.5, 40.45, 0.15);
  const pose: RigPose = {
    ...p,
    squash: p.squash + 0.008 * Math.sin(2 * Math.PI * 0.55 * t),
    qLift: p.qLift + 5 * Math.sin(2 * Math.PI * 0.8 * t + 1),
    qTilt: p.qTilt + 3 * Math.sin(2 * Math.PI * 2.2 * t) * talk,
  };
  return (
    <div style={{position: 'absolute', inset: 0, background: C.callBg, overflow: 'hidden'}}>
      <DoubtRig cam={cam} pose={pose} frame={frame} />
      <CallControls connectAt={0} opacity={1} />
    </div>
  );
};
