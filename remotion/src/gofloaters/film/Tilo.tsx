import React from 'react';
import {M, Pt, Rig, RigLayer, worldMatrix} from './rig';

// Draws the rig at time t (seconds). Same compositing as the rig preview: layer stack from the rig,
// parenting, eye mask, directional blur, and propeller motion blur from sub-frame samples (180°).
const fmt = (m: M) => `matrix(${m.map((v) => +v.toFixed(5)).join(' ')})`;
const ringD = (r: Pt[]) => 'M' + r.map((p) => `${+p[0].toFixed(2)} ${+p[1].toFixed(2)}`).join('L') + 'Z';

const Content: React.FC<{rig: Rig; l: RigLayer; t: number}> = ({rig, l, t}) => {
  if (l.lid) {
    const fill = rig.path(l.lidFill!, [], t, true);
    const edge = rig.path(l.lidEdge!, [], t, false);
    return (
      <>
        <path d={ringD(fill)} fill="#FFFFFF" />
        <path d={'M' + edge.map((p) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join('L')} fill="none" stroke="#111110" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" />
      </>
    );
  }
  let tr: string | undefined;
  if (l.groupExpr?.position) {
    const p = rig.run(l.groupExpr.position, t, [0, 0], null) as Pt;
    tr = `translate(${p[0].toFixed(3)} ${p[1].toFixed(3)})`;
  }
  return (
    <>
      {(l.groups || []).map((g, i) => (
        <path key={i} d={g.rings.map((r) => ringD(l.pathExpr ? rig.path(l.pathExpr, r, t) : r)).join('')} fill={g.color} fillRule="evenodd" transform={tr} />
      ))}
    </>
  );
};

export const Tilo: React.FC<{rig: Rig; t: number; id: string; blurSamples?: number}> = ({rig, t, id, blurSamples = 6}) => {
  const layers = [...rig.asset.layers].reverse().filter((l) => l.type === 'shape');
  const defs: React.ReactNode[] = [
    <clipPath key="eye" id={`${id}-eye`} clipPathUnits="userSpaceOnUse">
      <path d={ringD(rig.asset.eyeOutline)} />
    </clipPath>,
  ];
  const out: React.ReactNode[] = [];
  for (const l of layers) {
    const op = rig.prop(l.name, 'opacity', t) / 100;
    if (op <= 0.001) continue;
    let filter: string | undefined;
    for (const e of l.effects || []) {
      if (e.type !== 'directionalBlur') continue;
      const sd = Math.max(0, rig.run(e.lengthExpr, t, 0, null) as number) * 0.22;
      if (sd > 0.05) {
        const fid = `${id}-blur-${l.name}`;
        defs.push(
          <filter key={fid} id={fid} x="-20%" y="-30%" width="140%" height="160%">
            <feGaussianBlur stdDeviation={`0 ${sd.toFixed(2)}`} />
          </filter>,
        );
        filter = `url(#${fid})`;
      }
    }
    const clip = l.mask === 'eye' ? `url(#${id}-eye)` : undefined;
    if (l.motionBlur && blurSamples > 1) {
      const samples = [];
      for (let s = 0; s < blurSamples; s++) {
        const tt = t + rig.fd * (-0.25 + (0.5 * s) / (blurSamples - 1));
        samples.push(
          <g key={s} transform={fmt(worldMatrix(rig, l.name, tt))} opacity={1 / (s + 1)}>
            <g clipPath={clip} filter={filter}>
              <Content rig={rig} l={l} t={tt} />
            </g>
          </g>,
        );
      }
      out.push(
        <g key={l.name} opacity={op} style={{isolation: 'isolate'}}>
          {samples}
        </g>,
      );
    } else {
      out.push(
        <g key={l.name} transform={fmt(worldMatrix(rig, l.name, t))} opacity={op}>
          <g clipPath={clip} filter={filter}>
            <Content rig={rig} l={l} t={t} />
          </g>
        </g>,
      );
    }
  }
  return (
    <g>
      <defs>{defs}</defs>
      {out}
    </g>
  );
};
