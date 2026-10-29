// Render Tilo review stills from one bundle:
//   node scripts/tilo-stills.mjs <outDir> [compositionId] [frame...]
// Defaults: Tilo-RewardFlight at the six storyboard moments.
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';

const [outDir = 'out/tilo-stills', id = 'Tilo-RewardFlight', ...rest] = process.argv.slice(2);
const MOMENTS = {'01_take-the-back-seat': 40, '02_clean-flight': 135, '03_city-traversal': 262, '04_final-building': 420, '05_destination-found': 586, '06_offer-reveal': 690};
const frames = rest.length ? Object.fromEntries(rest.map((f) => [`f${String(f).padStart(3, '0')}`, Number(f)])) : MOMENTS;
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE ?? null;
const chromiumOptions = {gl: process.env.REMOTION_GL ?? 'angle'};
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const composition = await selectComposition({serveUrl, id, browserExecutable, chromiumOptions});
for (const [name, frame] of Object.entries(frames)) {
  const output = path.join(outDir, `${id}_${name}.png`);
  await renderStill({serveUrl, composition, frame, output, browserExecutable, chromiumOptions});
  console.log('rendered', output);
}
