// Bundle once, render review stills for the given frames: node scripts/stills.mjs <outDir> <frame...>
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';

const [outDir, ...frames] = process.argv.slice(2);
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE ?? null;
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const composition = await selectComposition({serveUrl, id: 'V06-Preview', inputProps: {burnIn: true}, browserExecutable});
for (const f of frames.map(Number)) {
  const output = path.join(outDir, `f${String(f).padStart(3, '0')}.png`);
  await renderStill({serveUrl, composition, frame: f, output, inputProps: {burnIn: true}, browserExecutable});
  console.log('rendered', output);
}
