// Export the Tilo rig (geometry + expressions) as a JSON asset for the Remotion film.
// Written into remotion/public/brand/ (gitignored: it contains the client's mascot artwork).
// node export_film_rig.mjs [out.json]
import fs from 'node:fs';
import {buildSpec} from './rig_spec.mjs';

const out = process.argv[2] || new URL('../../../remotion/public/brand/tilo_rig.json', import.meta.url).pathname;
const spec = buildSpec();
const keep = ['name', 'type', 'parent', 'anchor', 'position', 'scale', 'expr', 'pathExpr', 'groupExpr', 'lid', 'lidFill', 'lidEdge', 'mask', 'effects', 'motionBlur', 'groups'];
const layers = spec.layers.map((l) => Object.fromEntries(keep.filter((k) => l[k] !== undefined).map((k) => [k, l[k]])));
fs.writeFileSync(out, JSON.stringify({comp: spec.comp, controls: spec.controls.map(({name, type, def}) => ({name, type, def})), layers, eyeOutline: spec.eyeOutline}));
console.log(`wrote ${out} (${(fs.statSync(out).size / 1024).toFixed(0)} KB, ${layers.length} layers)`);
