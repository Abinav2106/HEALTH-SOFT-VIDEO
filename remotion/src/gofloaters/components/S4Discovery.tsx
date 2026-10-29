import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {ASSETS, BOLD, C, COPY, FONT} from '../constants';
import {EASE_IN_OUT, lerp, prog} from '../lib/motion';
import {Bone} from './Bone';
import {Tag} from './Tag';
import {Tilo} from './Tilo';

// 16–21 s. The meeting room as two depth layers — room/window plate and the foreground door —
// with restrained parallax. Tilo glides in behind the door frame and settles beside the Spark Bone
// on the far window ledge; "Found!" slides out from behind the door; one warm glint.

const PLATE = {w: 1328, h: 2376};
const BASE = 1080 / PLATE.w;
export const BONE_PLATE = {cx: 1054, cy: 1362, w: 250};
const TILO_PLATE = {x: 690, y: 1344, w: 430};
export const GLINT = {from: 536, peak: 543, to: 556};

const cam = (f: number) => {
  const t = prog(f, 436, 200, EASE_IN_OUT);
  return {
    bg: {k: lerp(1.1, 1.02, t), tx: lerp(10, -14, t)},
    fg: {k: lerp(1.16, 1.03, t), tx: lerp(30, -40, t)},
  };
};

const xform = (k: number, tx: number) =>
  `translate(${540 + tx}px, 960px) scale(${BASE * k}) translate(${-PLATE.w / 2}px, ${-PLATE.h / 2}px)`;

/** Screen position and width of the Spark Bone (for the match cut into the success seal). */
export const boneScreen = (f: number) => {
  const {k, tx} = cam(f).bg;
  const s = BASE * k;
  return {x: 540 + tx + (BONE_PLATE.cx - PLATE.w / 2) * s, y: 960 + (BONE_PLATE.cy - PLATE.h / 2) * s, w: BONE_PLATE.w * s};
};

export const S4Discovery: React.FC<{f: number; preview: boolean}> = ({f, preview}) => {
  const c = cam(f);
  const arrive = prog(f, 466, 40, EASE_IN_OUT);
  const tx = lerp(-160, TILO_PLATE.x, arrive);
  const ty = TILO_PLATE.y - Math.sin(arrive * Math.PI) * 26;
  const found = prog(f, 504, 22);
  const glint =
    f < GLINT.from || f > GLINT.to ? 0 : f <= GLINT.peak ? prog(f, GLINT.from, GLINT.peak - GLINT.from) : 1 - prog(f, GLINT.peak, GLINT.to - GLINT.peak);
  const bridge = f >= 606; // the bone hands over to S5 at the match cut

  return (
    <AbsoluteFill style={{backgroundColor: C.navy}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: PLATE.w, height: PLATE.h, transformOrigin: '0 0', transform: xform(c.bg.k, c.bg.tx)}}>
        <Img src={staticFile(ASSETS.roomBg)} style={{position: 'absolute', inset: 0, width: PLATE.w, height: PLATE.h}} />
        <div
          style={{
            position: 'absolute',
            left: 540,
            top: 330,
            fontFamily: FONT,
            fontWeight: BOLD,
            fontSize: 250,
            letterSpacing: '-0.03em',
            lineHeight: 1,
            color: C.navy,
            whiteSpace: 'nowrap',
            transform: `translateX(${lerp(-780, 0, found)}px) rotate(-4deg)`,
            opacity: Math.min(1, found * 2.5),
          }}
        >
          {COPY.found}
        </div>
        {!bridge && <Bone cx={BONE_PLATE.cx} cy={BONE_PLATE.cy} width={BONE_PLATE.w} rays={prog(f, GLINT.from + 2, 16)} glint={glint} />}
        <Tilo x={tx} y={ty} width={TILO_PLATE.w} rotate={lerp(-6, 0, arrive)} rest={prog(f, 506, 14)} />
      </div>
      {/* foreground door: moves more than the room — the parallax and the occluder for the reveals */}
      <div style={{position: 'absolute', left: 0, top: 0, width: PLATE.w, height: PLATE.h, transformOrigin: '0 0', transform: xform(c.fg.k, c.fg.tx)}}>
        <Img src={staticFile(ASSETS.roomDoor)} style={{position: 'absolute', inset: 0, width: PLATE.w, height: PLATE.h}} />
      </div>
      {preview && <Tag text="Room concept · storyboard plate" x={300} y={1830} dark />}
    </AbsoluteFill>
  );
};
