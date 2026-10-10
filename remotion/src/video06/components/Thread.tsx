import React from 'react';
import {useCurrentFrame} from 'remotion';
import {GUIDANCE_RISE} from '../constants';
import {EASE_IN, EASE_IN_OUT, EASE_OUT, lerp, progress} from '../lib/motion';
import {slicePath, Stroke} from './Stroke';
import {LABEL} from './ProductStage';

// One orange line, one behaviour: it underlines what matters, carries through the product options,
// then turns the corner up the left margin to become the guidance spine. Every appearance is listed
// here so its path can be edited in one place.
export const LINE_LEN = 110;
export const SPINE_X = LABEL.x; // spine sits on the same left margin as all type
export const NODE_Y = [744, 984, 1224];

type Underline = {x: number; y: number; drawAt: number; retractAt?: number};
const UNDERLINES: Underline[] = [
  {x: 84, y: 1600, drawAt: 20, retractAt: 40}, // You buy it.
  {x: 84, y: 1600, drawAt: 116, retractAt: 136}, // They live with it.
  {x: 84, y: 1600, drawAt: 236, retractAt: 278}, // Their comfort.
  {x: 84, y: 1466, drawAt: 310, retractAt: 340}, // Their choice.
  {x: 84, y: 1600, drawAt: 686}, // More good days ahead.
];

const UnderlineAt: React.FC<{u: Underline; frame: number}> = ({u, frame}) => {
  if (frame < u.drawAt) return null;
  const grow = progress(frame, u.drawAt, 14, EASE_OUT);
  const shrink = u.retractAt === undefined ? 0 : progress(frame, u.retractAt, 8, EASE_IN);
  if (shrink >= 1) return null;
  return (
    <Stroke
      points={[
        [u.x + LINE_LEN * shrink, u.y],
        [u.x + LINE_LEN * grow, u.y],
      ]}
    />
  );
};

// Path the product underline travels: right end → left end → up the margin to node 1.
const RIGHT = LABEL.x + LINE_LEN;
const PATH: [number, number][] = [
  [RIGHT, LABEL.lineY],
  [SPINE_X, LABEL.lineY],
  [SPINE_X, NODE_Y[0]],
];
const CORNER = RIGHT - SPINE_X;
const TO_NODE3 = CORNER + (LABEL.lineY - NODE_Y[2]);
const TO_NODE1 = CORNER + (LABEL.lineY - NODE_Y[0]);

export const Thread: React.FC = () => {
  const frame = useCurrentFrame();
  const parts: React.ReactNode[] = UNDERLINES.map((u, i) => <UnderlineAt key={i} u={u} frame={frame} />);

  if (frame >= 410 && frame < 664) {
    const draw = progress(frame, 410, 14, EASE_OUT);
    const d = GUIDANCE_RISE.to - GUIDANCE_RISE.from;
    const head = progress(frame, GUIDANCE_RISE.from, d, EASE_IN_OUT);
    const tail = progress(frame, GUIDANCE_RISE.from + 2, d, EASE_IN_OUT);
    // Before the rise: the underline draws in from the left (arc length runs right→left, so draw from the far end).
    const s0 = lerp(CORNER * (1 - draw), TO_NODE3, tail);
    const s1 = lerp(CORNER, TO_NODE1, head);
    parts.push(<Stroke key="spine" points={slicePath(PATH, s0, s1)} />);
  }
  return <>{parts}</>;
};
