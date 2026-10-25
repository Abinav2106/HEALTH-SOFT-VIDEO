// Bundle once, render GoFloaters review stills: node scripts/gf-stills.mjs <outDir> <frame...>
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';

const [outDir, ...frames] = process.argv.slice(2);
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE ?? null;
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const composition = await selectComposition({serveUrl, id: process.env.COMP ?? 'GF-LogoPlayground', browserExecutable});
for (const f of frames.map(Number)) {
  const output = path.join(outDir, `gf_f${String(f).padStart(3, '0')}.png`);
  await renderStill({serveUrl, composition, frame: f, output, browserExecutable, imageFormat: 'png', scale: Number(process.env.SCALE ?? 1)});
  console.log('rendered', output);
}
