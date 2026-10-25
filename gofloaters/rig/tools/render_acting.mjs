// Render the acting test through the preview evaluator: node render_acting.mjs <framesDir> [start] [end] [step]
import fs from 'node:fs';
import {makeEvaluator, frameSVG} from './preview.mjs';
import {openShooter} from './shoot.mjs';
import {ACTING} from './acting.mjs';

const [dir, start = '0', end = String(ACTING.duration), step = '1'] = process.argv.slice(2);
fs.mkdirSync(dir, {recursive: true});
const ev = makeEvaluator(ACTING.keys, {Tilo_Root: {position: ACTING.rootPosition, scale: ACTING.rootScale}});
const fps = ev.spec.comp.fps;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const caption = (t) => {
  let c = ACTING.captions[0];
  for (const k of ACTING.captions) if (t >= k[0]) c = k;
  return c;
};
const sh = await openShooter(1920, 1080);
const f0 = Math.round(+start * fps), f1 = Math.round(+end * fps);
for (let f = f0; f < f1; f += +step) {
  const t = f / fps;
  const [, title, desc] = caption(t);
  const overlay = `<rect x="0" y="968" width="1920" height="112" fill="#FFFFFF" opacity="0.92"/>
<text x="70" y="1012" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="700" fill="#111110">${esc(title)}</text>
<text x="70" y="1054" font-family="Arial, Helvetica, sans-serif" font-size="27" fill="#3A3F44">${esc(desc)}</text>
<text x="1850" y="1054" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="24" fill="#8A9298">${t.toFixed(1)} s</text>`;
  await sh.shoot(frameSVG(ev, t, {overlay}), `${dir}/f${String(f).padStart(4, '0')}.png`);
  ev.cache.clear();
}
await sh.close();
console.log('frames', f0, f1);
