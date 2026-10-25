// Images for the control guide: exploded parts sheet, pivot/hierarchy map, propeller cycle strip and a
// control pose sheet. node guide_images.mjs <outDir>
import fs from 'node:fs';
import {buildSpec} from './rig_spec.mjs';
import {Evaluator, frameSVG} from './preview.mjs';
import {openShooter} from './shoot.mjs';

const out = process.argv[2];
fs.mkdirSync(out, {recursive: true});
const spec = buildSpec();
const ringD = (r) => 'M' + r.map((p) => `${p[0]} ${p[1]}`).join('L') + 'Z';
const sh = await openShooter(1920, 1080);

// 1. exploded parts sheet: every art layer on its own, with its pivot
{
  const ev = new Evaluator(spec, {Blink: [[0, 55]]});
  const art = spec.layers.filter((l) => l.type === 'shape');
  const cols = 6, cw = 1920 / cols, ch = 1080 / Math.ceil(art.length / cols);
  const cells = art.map((l, i) => {
    let rings = [], paths = '';
    if (l.lid) {
      const f = ev.path(l.lidFill, [], 0, true), e = ev.path(l.lidEdge, [], 0, false);
      rings = [f];
      paths = `<path d="${ringD(f)}" fill="#fff" stroke="#c9d3d8" stroke-width="0.6"/><path d="M${e.map((p) => p.join(' ')).join('L')}" fill="none" stroke="#111110" stroke-width="3.2" stroke-linecap="round"/>`;
    } else {
      rings = l.groups.flatMap((g) => g.rings);
      paths = l.groups.map((g) => `<path d="${g.rings.map(ringD).join('')}" fill="${g.color}" fill-rule="evenodd"/>`).join('');
    }
    const xs = rings.flat().map((p) => p[0]).concat([l.anchor[0]]), ys = rings.flat().map((p) => p[1]).concat([l.anchor[1]]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const s = Math.min((cw - 40) / Math.max(8, x1 - x0), (ch - 70) / Math.max(8, y1 - y0), 4);
    const cx = (i % cols) * cw, cy = Math.floor(i / cols) * ch;
    const tx = cx + cw / 2 - s * (x0 + x1) / 2, ty = cy + 22 + (ch - 50) / 2 - s * (y0 + y1) / 2;
    return `<g><rect x="${cx + 4}" y="${cy + 4}" width="${cw - 8}" height="${ch - 8}" rx="10" fill="#E9EFF2"/><g transform="translate(${tx} ${ty}) scale(${s})">${paths}<circle cx="${l.anchor[0]}" cy="${l.anchor[1]}" r="${4 / s}" fill="#E2264D" stroke="#fff" stroke-width="${1.2 / s}"/></g><text x="${cx + 16}" y="${cy + 30}" font-family="Arial" font-size="19" font-weight="700" fill="#111110">${l.name}</text></g>`;
  }).join('');
  await sh.shoot(`<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080"><rect width="1920" height="1080" fill="#fff"/>${cells}</svg>`, `${out}/layered_parts.png`);
}

// 2. pivots + hierarchy map on the rest pose
{
  const ev = new Evaluator(spec, {});
  const rows = [];
  const kids = (p) => spec.layers.filter((l) => l.parent === p);
  const walk = (n, d) => { rows.push([n, d]); for (const k of kids(n)) walk(k.name, d + 1); };
  walk('Tilo_Root', 0);
  rows.push(['CTRL_Tilo', 0]);
  const tree = rows.map(([n, d], i) => `<text x="${1350 + d * 26}" y="${70 + i * 27.5}" font-family="Arial" font-size="19" fill="${spec.layers.find((l) => l.name === n).type === 'null' ? '#1F6FEB' : '#111110'}" font-weight="${d < 2 ? 700 : 400}">${d ? '└ ' : ''}${n}</text>`).join('');
  const svg = frameSVG(ev, 0, {showPivots: true, bg: '#FFFFFF', motionBlurSamples: 1}).replace('viewBox="0 0 1920 1080"', 'viewBox="80 40 1500 950"');
  await sh.shoot(`<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080"><rect width="1920" height="1080" fill="#fff"/><svg x="0" y="150" width="1320" height="722">${svg.replace(/^<svg[^>]*>/, '<svg viewBox="30 90 1700 930">')}</svg><text x="40" y="44" font-family="Arial" font-size="26" font-weight="700" fill="#111110">Pivots (red) and parent hierarchy</text>${tree}</svg>`, `${out}/pivots_hierarchy.png`);
}

// 3. propeller compression cycle (side view) at slow speed, 8 consecutive frames
{
  const ev = new Evaluator(spec, {'Propeller Speed': [[0, 6]]});
  const crop = (svg) => svg;
  const cells = [];
  for (let i = 0; i < 8; i++) {
    const t = i * 0.067;
    cells.push(`<svg x="${i * 240}" y="40" width="240" height="480" preserveAspectRatio="xMidYMid meet">${crop(frameSVG(ev, t, {motionBlurSamples: 6})).replace(/^<svg[^>]*>/, '<svg viewBox="1585 515 150 345">')}</svg><text x="${i * 240 + 18}" y="30" font-family="Arial" font-size="18" fill="#111110">t = ${t.toFixed(2)} s</text>`);
    ev.cache.clear();
  }
  const fast = new Evaluator(spec, {'Propeller Speed': [[0, 100]]});
  for (let i = 0; i < 4; i++) {
    const t = 1 + i * 0.033;
    cells.push(`<svg x="${i * 480}" y="580" width="480" height="480" preserveAspectRatio="xMidYMid meet">${crop(frameSVG(fast, t, {motionBlurSamples: 8})).replace(/^<svg[^>]*>/, '<svg viewBox="1500 515 300 345">')}</svg><text x="${i * 480 + 18}" y="566" font-family="Arial" font-size="18" fill="#111110">Propeller Speed 100, frame ${i + 1}</text>`);
  }
  await sh.shoot(`<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080"><rect width="1920" height="1080" fill="#fff"/>${cells.join('')}</svg>`, `${out}/propeller_cycle.png`);
}
await sh.close();
console.log('guide images written to', out);
