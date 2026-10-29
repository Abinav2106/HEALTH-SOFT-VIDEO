// Bundle once and render review stills of "Find the Spark":
//   node scripts/gf-stills.mjs <outDir> <scale> <composition> <frame...>
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';

const [outDir, scale, id, ...frames] = process.argv.slice(2);
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE ?? null;
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const composition = await selectComposition({serveUrl, id, browserExecutable});
for (const f of frames.map(Number)) {
  const output = path.join(outDir, `f${String(f).padStart(3, '0')}.png`);
  await renderStill({serveUrl, composition, frame: f, output, scale: Number(scale), browserExecutable});
  console.log('rendered', output);
}
