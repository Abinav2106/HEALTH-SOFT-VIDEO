// Render the narration and SFX stems of "Find the Spark" as 48 kHz WAV from the same timeline:
//   node scripts/gf-stems.mjs <outDir>
// (The project config's video CRF doesn't apply to audio-only codecs, so this uses the API.)
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import path from 'node:path';

const [outDir] = process.argv.slice(2);
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE ?? null;
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
for (const [id, file] of [
  ['GF-Stem-Narration', 'stem_narration_48k.wav'],
  ['GF-Stem-SFX', 'stem_sfx_48k.wav'],
]) {
  const composition = await selectComposition({serveUrl, id, browserExecutable});
  await renderMedia({serveUrl, composition, codec: 'wav', outputLocation: path.join(outDir, file), browserExecutable});
  console.log('rendered', file);
}
