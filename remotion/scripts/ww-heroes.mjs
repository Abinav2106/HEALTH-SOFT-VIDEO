// Render the clean hero stills used inside R4's phone cards → public/ww/hero/<id>.png
//   node scripts/ww-heroes.mjs
import {bundle} from '@remotion/bundler';
import {getCompositions, renderStill} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE ?? null;
const outDir = path.resolve('public/ww/hero');
fs.mkdirSync(outDir, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('public')});
const comps = (await getCompositions(serveUrl, {browserExecutable})).filter((c) => c.id.startsWith('WW-Hero-'));
for (const composition of comps) {
  const output = path.join(outDir, `${composition.id.replace('WW-Hero-', '')}.png`);
  await renderStill({serveUrl, composition, frame: 0, output, inputProps: composition.defaultProps, browserExecutable});
  console.log('hero', output);
}
