#!/usr/bin/env node
// Create a new composition from the Starter template and register it in src/Root.tsx.
//
//   npm run new -- PromoVideo                 # 5 s, format from src/config/video.ts
//   npm run new -- PromoVideo --seconds 12
//
// Creates src/compositions/PromoVideo/PromoVideo.tsx, then adds the import and a <Composition>
// to src/Root.tsx at the @new-composition markers. Open the Studio to see it.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const name = args.find((a) => !a.startsWith('--'));
const secondsFlag = args.indexOf('--seconds');
const seconds = secondsFlag >= 0 ? Number(args[secondsFlag + 1]) : 5;

const fail = (msg) => {
  console.error(`✖ ${msg}`);
  process.exit(1);
};
if (!name || !/^[A-Z][A-Za-z0-9]*$/.test(name)) fail('Pass a PascalCase name, e.g. npm run new -- PromoVideo');
if (!(seconds > 0)) fail('--seconds must be a positive number');

const dir = path.join(root, 'src', 'compositions', name);
if (fs.existsSync(dir)) fail(`src/compositions/${name} already exists`);

const rootFile = path.join(root, 'src', 'Root.tsx');
let rootSrc = fs.readFileSync(rootFile, 'utf8');
if (new RegExp(`id="${name}"`).test(rootSrc)) fail(`A composition with id "${name}" is already registered`);

const importMarker = '// @new-composition-imports';
const regMarker = '{/* @new-composition-registrations';
if (!rootSrc.includes(importMarker) || !rootSrc.includes(regMarker)) fail('src/Root.tsx is missing the @new-composition markers');

// 1. Copy the template, renaming identifiers.
const template = fs.readFileSync(path.join(root, 'src', 'compositions', 'Starter', 'Starter.tsx'), 'utf8');
const upper = name.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toUpperCase();
const source = template
  .replace(/^\/\/ Minimal template:.*$/m, `// ${name} — created from the Starter template. Edit freely.`)
  .replace(/starterSchema/g, `${name.charAt(0).toLowerCase()}${name.slice(1)}Schema`)
  .replace(/StarterProps/g, `${name}Props`)
  .replace(/STARTER_SECONDS = 5/g, `${upper}_SECONDS = ${seconds}`)
  .replace(/STARTER_SECONDS/g, `${upper}_SECONDS`)
  .replace(/\bStarter\b/g, name);
fs.mkdirSync(dir, {recursive: true});
fs.writeFileSync(path.join(dir, `${name}.tsx`), source);

// 2. Register it in Root.tsx.
const schema = `${name.charAt(0).toLowerCase()}${name.slice(1)}Schema`;
rootSrc = rootSrc.replace(
  importMarker,
  `import {${name}, ${upper}_SECONDS, ${schema}} from './compositions/${name}/${name}';\n${importMarker}`,
);
const indent = rootSrc.slice(0, rootSrc.indexOf(regMarker)).split('\n').pop();
const registration = [
  `<Composition`,
  `  id="${name}"`,
  `  component={${name}}`,
  `  schema={${schema}}`,
  `  width={VIDEO.width}`,
  `  height={VIDEO.height}`,
  `  fps={VIDEO.fps}`,
  `  durationInFrames={sec(${upper}_SECONDS, VIDEO.fps)}`,
  `  defaultProps={{title: '${name}', subtitle: 'Edit src/compositions/${name}/${name}.tsx'}}`,
  `/>`,
]
  .map((l) => indent + l)
  .join('\n');
rootSrc = rootSrc.replace(`${indent}${regMarker}`, `${registration}\n${indent}${regMarker}`);
fs.writeFileSync(rootFile, rootSrc);

console.log(`✔ Created src/compositions/${name}/${name}.tsx (${seconds} s) and registered "${name}" in src/Root.tsx`);
console.log(`  Preview: npm run dev  →  http://localhost:3000/${name}`);
console.log(`  Render:  npx remotion render ${name} out/${name}.mp4`);
