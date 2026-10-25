// Render named poses (constant control values, optional time) and tile them into a contact sheet.
// node pose_sheet.mjs <outDir> <name> [cols] [crop x,y,w,h]   poses come from POSES below
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {makeEvaluator, frameSVG} from './preview.mjs';
import {openShooter} from './shoot.mjs';

export const POSES = {
  ranges: [
    ['Point 100, Angle +35', {Point: 100, 'Point Angle': 35}],
    ['Point 100, Angle +45', {Point: 100, 'Point Angle': 45}],
    ['Point 100, Angle -10', {Point: 100, 'Point Angle': -10}],
    ['Far Paw Curl +20', {'Far Paw Curl': 20}],
    ['Far Paw Curl -30', {'Far Paw Curl': -30}],
    ['Flight Bank -30', {'Flight Bank': -30}],
    ['Flight Bank +30', {'Flight Bank': 30}],
    ['Point 100 + Balance -12', {Point: 100, 'Body Balance': -12}],
  ],
  stress: [
    ['Rest (logo)', {}],
    ['Head Tilt -20', {'Head Tilt': -20}],
    ['Head Tilt +18', {'Head Tilt': 18}],
    ['Blink 100', {Blink: 100}],
    ['Blink 55 + Lid Rest 30', {Blink: 55, 'Upper Lid Rest': 30}],
    ['Pupils +100, 0', {'Pupil X': 100}],
    ['Pupils -100, -100', {'Pupil X': -100, 'Pupil Y': -100}],
    ['Point 100', {Point: 100}],
    ['Point 100, Angle +20', {Point: 100, 'Point Angle': 20}],
    ['Point 50', {Point: 50}],
    ['Near Paw Lift 100', {'Near Paw Lift': 100}],
    ['Far Paw Curl +30', {'Far Paw Curl': 30}],
    ['Tail Curl +30', {'Tail Curl': 30}],
    ['Tail Curl -30', {'Tail Curl': -30}],
    ['Tail Wag 40 (t=0.11)', {'Tail Wag': 40}, 0.11],
    ['Body Balance -12', {'Body Balance': -12}],
    ['Body Balance +12', {'Body Balance': 12}],
    ['Flight Bank -28', {'Flight Bank': -28}],
    ['Flight Bank +28', {'Flight Bank': 28}],
    ['Ear Lift +25', {'Ear Lift': 25}],
    ['Ear Lift -20', {'Ear Lift': -20}],
    ['Propeller 12 (t=0.3)', {'Propeller Speed': 12}, 0.3],
    ['Propeller 100', {'Propeller Speed': 100}, 0.5],
    ['Flight Speed 0', {'Flight Speed': 0}],
    ['Flight Speed 100', {'Flight Speed': 100}],
  ],
};

const [out, name = 'stress', cols = '5', crop = '300,120,1360,840'] = process.argv.slice(2);
if (out) {
  const [cx, cy, cw, ch] = crop.split(',').map(Number);
  fs.mkdirSync(out, {recursive: true});
  const sh = await openShooter(1920, 1080);
  const files = [];
  for (const [i, [label, vals, t = 0]] of POSES[name].entries()) {
    const keys = Object.fromEntries(Object.entries(vals).map(([k, v]) => [k, [[0, v]]]));
    const ev = makeEvaluator(keys);
    const overlay = `<text x="${cx + 18}" y="${cy + 46}" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="#111110">${label}</text>`;
    const f = `${out}/${name}_${String(i).padStart(2, '0')}.png`;
    await sh.shoot(frameSVG(ev, t, {overlay}), f);
    files.push(f);
  }
  await sh.close();
  const n = files.length, c = +cols, r = Math.ceil(n / c);
  const inputs = files.flatMap((f) => ['-i', f]);
  const fc = files.map((_, i) => `[${i}]crop=${cw}:${ch}:${cx}:${cy},scale=${Math.round(cw / 2)}:${Math.round(ch / 2)},pad=iw+4:ih+4:2:2:white[v${i}]`).join(';');
  const pads = Array.from({length: r * c - n}, (_, i) => `color=white:s=${Math.round(cw / 2) + 4}x${Math.round(ch / 2) + 4}:d=1[e${i}]`).join(';');
  const all = [...files.map((_, i) => `[v${i}]`), ...Array.from({length: r * c - n}, (_, i) => `[e${i}]`)].join('');
  execFileSync('ffmpeg', ['-v', 'error', '-y', ...inputs, '-filter_complex', `${fc}${pads ? ';' + pads : ''};${all}xstack=inputs=${r * c}:layout=${Array.from({length: r * c}, (_, i) => `${(i % c) === 0 ? '0' : Array.from({length: i % c}, () => 'w0').join('+')}_${Math.floor(i / c) === 0 ? '0' : Array.from({length: Math.floor(i / c)}, () => 'h0').join('+')}`).join('|')}`, '-frames:v', '1', `${out}/${name}_sheet.png`]);
  console.log(`${out}/${name}_sheet.png`);
}
