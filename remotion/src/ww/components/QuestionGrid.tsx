import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, FPS, HEIGHT, T, WIDTH} from '../constants';
import {keys, prog, rand} from '../lib/motion';
import {QMark, qmarkWidth} from './Brand';

// R1 — fixed matrix resolving to one selected element.
// Reference behaviour kept: marks never move; each position switches between pale / mid / active
// intensity on its own short cadence; overall activity holds, then thins out until one remains.
// W&W change: dots → Doubt's question-mark silhouette; black/grey intensities; the survivor turns orange.

export const GRID = {
  cols: 7,
  rows: 13,
  pitch: 160,
  markH: 96,
  sel: {x: WIDTH / 2, y: 760}, // matches Doubt's question-mark centre in the next shot
};

const ALPHA = [0.09, 0.36, 1]; // pale, mid, active

// Fraction of marks that are lit (mid or active), by seconds — R1's measured curve, retimed ×0.8.
const density = (t: number) => {
  if (t < 0.15) return 0.25 + (0.45 - 0.25) * (t / 0.15);
  if (t < 1.55) return 0.45 + 0.05 * Math.sin(t * 5.1);
  if (t < 2.85) return 0.45 * Math.pow(1 - (t - 1.55) / 1.3, 1.6);
  return 0;
};

const levelAt = (i: number, slot: number, slotStartT: number) => {
  const d = density(slotStartT);
  const r = rand(i, slot);
  if (r < d * 0.45) return 2;
  if (r < d) return 1;
  return 0;
};

export const QuestionGrid: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  if (t >= T.cut) return null;

  const marks: React.ReactNode[] = [];
  const w = qmarkWidth(GRID.markH);
  const selCol = Math.floor(GRID.cols / 2);
  const selRow = 5;
  for (let r = 0; r < GRID.rows; r++) {
    for (let c = 0; c < GRID.cols; c++) {
      const i = r * GRID.cols + c;
      const x = GRID.sel.x + (c - selCol) * GRID.pitch;
      const y = GRID.sel.y + (r - selRow) * GRID.pitch;
      const isSel = r === selRow && c === selCol;
      const period = 7 + Math.floor(rand(i, 0.5) * 6); // 7–12 frames per state
      const phase = Math.floor(rand(i, 0.7) * period);
      const slot = Math.floor((frame + phase) / period);
      const slotStart = slot * period - phase;
      const cur = levelAt(i, slot, slotStart / FPS);
      const prev = levelAt(i, slot - 1, (slotStart - period) / FPS);
      const k = Math.min(1, (frame - slotStart) / 3); // 3-frame intensity change, no travel
      let alpha = ALPHA[prev] + (ALPHA[cur] - ALPHA[prev]) * k;
      let color: string = C.black;
      if (isSel) {
        // Held lit while the field thins, then becomes the selected (orange) state.
        const hold = prog(frame, 2.2, 0.25);
        alpha = alpha + (1 - alpha) * hold;
        const sel = prog(frame, 2.85, 0.2);
        color = sel > 0 ? `rgb(${Math.round(255 * sel)}, ${Math.round(106 * sel)}, 0)` : C.black;
      }
      marks.push(
        <QMark
          key={i}
          height={GRID.markH}
          color={color}
          style={{position: 'absolute', left: x - w / 2, top: y - GRID.markH / 2, opacity: alpha}}
        />,
      );
    }
  }

  // One restrained light pulse on the selected mark; it peaks at the match-cut.
  const pulse = keys(frame, [3.45, T.cut], [0, 1], (x) => x * x);
  return (
    <div style={{position: 'absolute', inset: 0, width: WIDTH, height: HEIGHT, background: C.white}}>
      {pulse > 0 ? (
        <div
          style={{
            position: 'absolute',
            left: GRID.sel.x - 140,
            top: GRID.sel.y - 140,
            width: 280,
            height: 280,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(255,106,0,${0.5 * pulse}) 0%, rgba(255,106,0,${0.16 * pulse}) 40%, rgba(255,255,255,0) 70%)`,
          }}
        />
      ) : null}
      {marks}
    </div>
  );
};
