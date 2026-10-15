// Bundle once, render stills of a W&W composition: node scripts/ww-stills.mjs <compId> <outDir> <frame...>
// Props via WW_PROPS='{"mode":"master","captions":false}'.
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const [id, outDir, ...frames] = process.argv.slice(2);
const inputProps = JSON.parse(process.env.WW_PROPS ?? '{"mode":"review","captions":true}');
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE ?? null;
fs.mkdirSync(outDir, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('public')});
const composition = await selectComposition({serveUrl, id, inputProps, browserExecutable});
for (const f of frames.map(Number)) {
  const output = path.join(outDir, `${id}_f${String(f).padStart(4, '0')}.png`);
  await renderStill({serveUrl, composition, frame: f, output, inputProps, browserExecutable});
  console.log('rendered', output);
}
