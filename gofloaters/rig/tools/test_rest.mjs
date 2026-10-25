// Rest pose of the rig (defaults, t=0) vs the supplied SVG drawn with the same root transform.
import fs from 'node:fs';
import {makeEvaluator, frameSVG} from './preview.mjs';
import {openShooter} from './shoot.mjs';

const out = process.argv[2];
const ev = makeEvaluator();
const svg = frameSVG(ev, 0, {bg: '#FFFFFF', motionBlurSamples: 1});
const src = fs.readFileSync(new URL('../../../remotion/public/brand/gofloaters_logo_original.svg', import.meta.url), 'utf8');
const grab = (id) => src.match(new RegExp(`<g id="${id}"[^>]*>([\\s\\S]*?)</g>`))[1];
// mascot units: mascot group as is; speed-lines shifted (x-300, y+280)
const orig = `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080"><rect width="1920" height="1080" fill="#fff"/><g transform="translate(960 540) scale(1.6) translate(-320 -330)"><g>${grab('mascot-airplane')}</g><g transform="translate(-300 280)">${grab('speed-lines')}</g></g></svg>`;
const sh = await openShooter(1920, 1080);
await sh.shoot(svg, `${out}/rig_rest.png`);
await sh.shoot(orig, `${out}/orig_rest.png`);
await sh.close();
