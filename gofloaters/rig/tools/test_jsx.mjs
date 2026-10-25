// Dry-run the generated After Effects builder against a strict mock of the AE scripting DOM.
// 1. parses the JSX as ES3 (ExtendScript), 2. runs it with matchName/argument validation,
// 3. compiles every expression, 4. rebuilds a rig spec from the mock project and renders it with
//    the preview evaluator to prove the JSX recreates exactly the rig that was previewed.
// node test_jsx.mjs <builder.jsx> <outDir>   (needs `acorn` on NODE_PATH for the ES3 check)
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {buildSpec, CONTROLS} from './rig_spec.mjs';
import {Evaluator, frameSVG} from './preview.mjs';
import {openShooter} from './shoot.mjs';
import {ACTING} from './acting.mjs';

const [jsxPath, outDir] = process.argv.slice(2);
const src = fs.readFileSync(jsxPath, 'utf8');
const problems = [];
const fail = (m) => problems.push(m);

// ---- 1. ES3 syntax ----
try {
  const acorn = createRequire(import.meta.url)('acorn');
  acorn.parse(src, {ecmaVersion: 3, allowReserved: true});
  console.log('ES3 parse: ok');
} catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') console.log('ES3 parse: skipped (acorn not installed)');
  else fail(`ES3 parse: ${e.message}`);
}

// ---- 2. mock DOM ----
const FIXED = {
  layer: ['ADBE Transform Group', 'ADBE Effect Parade', 'ADBE Mask Parade'],
  'ADBE Transform Group': ['ADBE Anchor Point', 'ADBE Position', 'ADBE Scale', 'ADBE Rotate Z', 'ADBE Opacity'],
  'ADBE Vector Group': ['ADBE Vectors Group', 'ADBE Vector Transform Group'],
  'ADBE Vector Transform Group': ['ADBE Vector Anchor', 'ADBE Vector Position', 'ADBE Vector Scale', 'ADBE Vector Rotation', 'ADBE Vector Group Opacity'],
  'ADBE Vector Shape - Group': ['ADBE Vector Shape'],
  'ADBE Vector Graphic - Fill': ['ADBE Vector Fill Color', 'ADBE Vector Fill Rule', 'ADBE Vector Fill Opacity'],
  'ADBE Vector Graphic - Stroke': ['ADBE Vector Stroke Color', 'ADBE Vector Stroke Width', 'ADBE Vector Stroke Line Cap', 'ADBE Vector Stroke Line Join'],
  'ADBE Slider Control': ['ADBE Slider Control-0001'],
  'ADBE Angle Control': ['ADBE Angle Control-0001'],
  'ADBE Checkbox Control': ['ADBE Checkbox Control-0001'],
  'ADBE Motion Blur': ['ADBE Motion Blur-0001', 'ADBE Motion Blur-0002'],
  'ADBE Mask Atom': ['ADBE Mask Shape', 'ADBE Mask Feather', 'ADBE Mask Opacity', 'ADBE Mask Expansion'],
  'ADBE Text Properties': ['ADBE Text Document'],
};
const ADDABLE = {
  'ADBE Root Vectors Group': ['ADBE Vector Group'],
  'ADBE Vectors Group': ['ADBE Vector Shape - Group', 'ADBE Vector Graphic - Fill', 'ADBE Vector Graphic - Stroke', 'ADBE Vector Group'],
  'ADBE Effect Parade': ['ADBE Slider Control', 'ADBE Angle Control', 'ADBE Checkbox Control', 'ADBE Motion Blur'],
  'ADBE Mask Parade': ['ADBE Mask Atom'],
};
const ENUMS = {'ADBE Vector Fill Rule': [1, 2], 'ADBE Vector Stroke Line Cap': [1, 2, 3], 'ADBE Vector Stroke Line Join': [1, 2, 3]};
const COLOR = ['ADBE Vector Fill Color', 'ADBE Vector Stroke Color'];

class Shape {
  constructor() { this.vertices = []; this.inTangents = []; this.outTangents = []; this.closed = true; }
}
class KeyframeEase {
  constructor(speed, influence) {
    if (!(influence >= 0.1 && influence <= 100)) fail(`KeyframeEase influence ${influence}`);
    this.speed = speed; this.influence = influence;
  }
}
const KeyframeInterpolationType = {LINEAR: 6612, BEZIER: 6613, HOLD: 6614};
const ParagraphJustification = {LEFT_JUSTIFY: 7413, CENTER_JUSTIFY: 7415};

class Prop {
  constructor(matchName, owner) {
    this.matchName = matchName; this.name = matchName; this.owner = owner;
    this.kids = []; this.keys = []; this._expr = ''; this.value = undefined;
  }
  property(k) {
    if (typeof k === 'number') {
      if (this.kids[k - 1]) return this.kids[k - 1];
      const fixed = FIXED[this.matchName];
      if (fixed && fixed[k - 1]) return this.property(fixed[k - 1]);
      fail(`${this.path()}.property(${k}) does not exist`);
      return new Prop('?', this);
    }
    let c = this.kids.find((p) => p.matchName === k || p.name === k);
    if (c) return c;
    const fixed = FIXED[this.matchName] || [];
    if (fixed.includes(k)) {
      c = new Prop(k, this);
      if (k === 'ADBE Text Document') c.value = new TextDocument('');
      this.kids.push(c);
      return c;
    }
    fail(`${this.path()}.property("${k}") is not a valid child`);
    return new Prop('?', this);
  }
  addProperty(m) {
    if (!(ADDABLE[this.matchName] || []).includes(m)) fail(`${this.path()}.addProperty("${m}") not allowed`);
    const c = new Prop(m, this);
    this.kids.push(c);
    return c;
  }
  check(v) {
    if (ENUMS[this.matchName] && !ENUMS[this.matchName].includes(v)) fail(`${this.path()} = ${v} (invalid enum)`);
    if (COLOR.includes(this.matchName) && !(Array.isArray(v) && v.length >= 3 && v.every((x) => x >= 0 && x <= 1))) fail(`${this.path()} bad colour ${v}`);
    if (['ADBE Vector Shape', 'ADBE Mask Shape'].includes(this.matchName)) {
      if (!(v instanceof Shape)) fail(`${this.path()} needs a Shape`);
      else if (v.vertices.length < 2 || v.inTangents.length !== v.vertices.length || v.outTangents.length !== v.vertices.length) fail(`${this.path()} malformed Shape`);
    }
    if (['ADBE Anchor Point', 'ADBE Position', 'ADBE Scale'].includes(this.matchName) && !(Array.isArray(v) && v.length >= 2 && v.every(Number.isFinite))) fail(`${this.path()} bad value ${v}`);
  }
  setValue(v) { this.check(v); this.value = v; }
  setValueAtTime(t, v) {
    if (!(t >= 0)) fail(`${this.path()} key at ${t}`);
    this.check(v);
    this.keys.push([t, v]);
    this.keys.sort((a, b) => a[0] - b[0]);
  }
  get numKeys() { return this.keys.length; }
  setInterpolationTypeAtKey(i, a, b) {
    if (i < 1 || i > this.keys.length) fail(`${this.path()} interp key ${i}/${this.keys.length}`);
    if (!Object.values(KeyframeInterpolationType).includes(a)) fail(`${this.path()} interp type ${a}`);
    this.keys[i - 1].interp = a;
  }
  setTemporalEaseAtKey(i, inE, outE) {
    if (i < 1 || i > this.keys.length) fail(`${this.path()} ease key ${i}`);
    if (!Array.isArray(inE) || !Array.isArray(outE) || inE.length !== 1 || outE.length !== 1) fail(`${this.path()} ease arrays must have 1 entry for a 1D property`);
  }
  set expression(s) {
    try { new vm.Script(s); } catch (e) { fail(`${this.path()} expression syntax: ${e.message}`); }
    this._expr = s;
  }
  get expression() { return this._expr; }
  path() { return (this.owner ? this.owner.path() + ' > ' : '') + this.name; }
}
class TextDocument {
  constructor(t) { this.text = t; this.fontSize = 36; this.applyFill = true; this.fillColor = [1, 1, 1]; this.justification = 0; }
}
class Layer extends Prop {
  constructor(comp, kind, name) {
    super('layer', null);
    this.comp = comp; this.kind = kind; this.name = name;
    this.label = 0; this.comment = ''; this._parent = null; this.motionBlur = false; this.guideLayer = false; this.enabled = true;
    if (kind === 'shape') this.kids.push(new Prop('ADBE Root Vectors Group', this));
    if (kind === 'text') {
      const tp = new Prop('ADBE Text Properties', this);
      this.kids.push(tp);
      tp.property('ADBE Text Document').value = new TextDocument(name);
    }
  }
  property(k) {
    if (k === 'ADBE Root Vectors Group' && this.kind !== 'shape') fail(`${this.name}: no Contents on a ${this.kind} layer`);
    if (k === 'ADBE Text Properties' && this.kind !== 'text') fail(`${this.name}: not a text layer`);
    let c = this.kids.find((p) => p.matchName === k);
    if (c) return c;
    if (FIXED.layer.includes(k) || k === 'ADBE Root Vectors Group' || k === 'ADBE Text Properties') {
      c = new Prop(k, this);
      this.kids.push(c);
      return c;
    }
    fail(`layer ${this.name}.property("${k}") invalid`);
    return new Prop('?', this);
  }
  set parent(p) {
    if (p && p.comp !== this.comp) fail(`${this.name}: parent from another comp`);
    for (let q = p; q; q = q._parent) if (q === this) fail(`${this.name}: parenting cycle`);
    this._parent = p;
  }
  get parent() { return this._parent; }
  set label(v) { if (!(v >= 0 && v <= 16)) fail(`label ${v}`); this._label = v; }
  get label() { return this._label; }
  moveToEnd() { const a = this.comp._layers; a.splice(a.indexOf(this), 1); a.push(this); }
  path() { return `[${this.comp.name}] ${this.name}`; }
}
class Comp {
  constructor(name, w, h, par, dur, fps) {
    if (!(Number.isInteger(w) && Number.isInteger(h) && w >= 4 && h >= 4 && dur > 0 && fps > 0 && par === 1)) fail(`addComp args ${[w, h, par, dur, fps]}`);
    Object.assign(this, {name, width: w, height: h, duration: dur, frameRate: fps, _layers: [], motionBlur: false});
    const self = this;
    this.layers = {
      addShape: () => self._add(new Layer(self, 'shape', 'Shape Layer')),
      addNull: () => self._add(new Layer(self, 'null', 'Null')),
      addText: (s) => self._add(new Layer(self, 'text', String(s))),
      add: (item) => self._add(new Layer(self, 'footage', item.name)),
    };
  }
  _add(l) { this._layers.unshift(l); return l; }
  openInViewer() {}
}
const project = {
  _items: [],
  expressionEngine: 'extendscript',
  items: {
    addFolder: (n) => { const f = {name: n, type: 'folder'}; project._items.push(f); return f; },
    addComp: (...a) => { const c = new Comp(...a); project._items.push(c); return c; },
  },
  importFile: (opts) => { const it = {name: opts.file.name, type: 'footage'}; project._items.push(it); return it; },
};
const alerts = [];
const sandbox = {
  app: {project, beginUndoGroup() {}, endUndoGroup() {}},
  Shape, KeyframeEase, KeyframeInterpolationType, ParagraphJustification,
  File: class { constructor(p) { this.fsName = p; this.name = p.split('/').pop(); this.parent = {fsName: p.split('/').slice(0, -1).join('/') || '.'}; this.exists = fs.existsSync(p); } },
  ImportOptions: class { constructor(f) { this.file = f; } },
  $: {fileName: jsxPath},
  alert: (m) => alerts.push(m),
  confirm: () => true,
};
vm.runInNewContext(src, sandbox, {filename: jsxPath});
for (const a of alerts) fail(`alert: ${a}`);
console.log(`ran builder: ${project._items.length} project items, expression engine "${project.expressionEngine}"`);

// ---- 3. compare with the spec ----
const spec = buildSpec();
const comps = Object.fromEntries(project._items.filter((i) => i instanceof Comp).map((c) => [c.name, c]));
for (const n of ['Tilo_Rig', 'Tilo_Acting_Test']) if (!comps[n]) fail(`missing comp ${n}`);
const rig = comps.Tilo_Rig;
const names = rig._layers.map((l) => l.name).filter((n) => !n.startsWith('REFERENCE'));
if (names.join() !== spec.layers.map((l) => l.name).join()) fail(`layer order differs:\n${names.join()}\n${spec.layers.map((l) => l.name).join()}`);
let nExpr = 0;
const tr = (l, m) => l.property('ADBE Transform Group').property(m);
const rebuilt = {comp: spec.comp, controls: [], layers: [], eyeOutline: null, meta: spec.meta};
const ctrl = rig._layers.find((l) => l.name === 'CTRL_Tilo');
for (const c of CONTROLS) {
  const fx = ctrl.property('ADBE Effect Parade').kids.find((k) => k.name === c.name);
  if (!fx) fail(`control ${c.name} missing`);
  else rebuilt.controls.push({...c, def: fx.property(1).value});
}
const toHex = (c) => '#' + c.slice(0, 3).map((v) => Math.round(v * 255).toString(16).padStart(2, '0').toUpperCase()).join('');
for (const l of rig._layers) {
  if (l.name.startsWith('REFERENCE')) continue;
  const s = spec.layers.find((x) => x.name === l.name);
  const R = {name: l.name, type: l.kind, parent: l.parent ? l.parent.name : null, expr: {}};
  R.anchor = tr(l, 'ADBE Anchor Point').value;
  R.position = tr(l, 'ADBE Position').value;
  R.scale = tr(l, 'ADBE Scale').value;
  for (const [k, m] of Object.entries({rotation: 'ADBE Rotate Z', position: 'ADBE Position', scale: 'ADBE Scale', opacity: 'ADBE Opacity'})) {
    const e = tr(l, m).expression;
    if (e) { R.expr[k] = e; nExpr++; }
    if ((s.expr?.[k] || '') !== e) fail(`${l.name}.${k} expression differs`);
  }
  if ((s.parent || null) !== R.parent) fail(`${l.name} parent ${R.parent} != ${s.parent}`);
  if (JSON.stringify(s.anchor) !== JSON.stringify(R.anchor) || JSON.stringify(s.position) !== JSON.stringify(R.position)) fail(`${l.name} anchor/position differ`);
  if (l.kind === 'shape') {
    const groups = l.property('ADBE Root Vectors Group').kids;
    if (s.lid) {
      R.lid = s.lid;
      R.lidEdge = groups[0].property('ADBE Vectors Group').kids[0].property('ADBE Vector Shape').expression;
      R.lidFill = groups[1].property('ADBE Vectors Group').kids[0].property('ADBE Vector Shape').expression;
      nExpr += 2;
      if (R.lidEdge !== s.lidEdge || R.lidFill !== s.lidFill) fail(`${l.name} lid expressions differ`);
    } else {
      R.groups = [];
      for (const g of [...groups].reverse()) {
        const vecs = g.property('ADBE Vectors Group').kids;
        const fill = vecs.find((v) => v.matchName === 'ADBE Vector Graphic - Fill');
        const paths = vecs.filter((v) => v.matchName === 'ADBE Vector Shape - Group').map((v) => v.property('ADBE Vector Shape'));
        R.groups.push({kind: g.name.startsWith('Ink') ? 'ink' : 'fill', color: toHex(fill.property('ADBE Vector Fill Color').value), rings: paths.map((p) => p.value.vertices)});
        const pe = paths.map((p) => p.expression);
        if (pe.some((e) => e !== (s.pathExpr || ''))) fail(`${l.name} path expressions differ`);
        if (s.pathExpr) { R.pathExpr = s.pathExpr; nExpr += pe.length; }
        const ge = g.property('ADBE Vector Transform Group').property('ADBE Vector Position').expression;
        if (ge) { R.groupExpr = {position: ge}; nExpr++; }
      }
      if (R.groups.length !== s.groups.length) fail(`${l.name} group count`);
      R.groups.forEach((g, i) => { if (g.rings.length !== s.groups[i].rings.length || g.color !== s.groups[i].color) fail(`${l.name} group ${i} differs`); });
    }
    const masks = l.property('ADBE Mask Parade').kids;
    if (masks.length) { R.mask = 'eye'; rebuilt.eyeOutline = masks[0].property('ADBE Mask Shape').value.vertices; }
    if (!!s.mask !== !!masks.length) fail(`${l.name} mask`);
    const fxs = l.property('ADBE Effect Parade').kids.filter((k) => k.matchName === 'ADBE Motion Blur');
    if (fxs.length) { R.effects = [{type: 'directionalBlur', direction: fxs[0].property('ADBE Motion Blur-0001').value, lengthExpr: fxs[0].property('ADBE Motion Blur-0002').expression}]; nExpr++; }
    if ((s.effects || []).length !== fxs.length) fail(`${l.name} effects`);
    R.motionBlur = l.motionBlur;
  }
  rebuilt.layers.push(R);
}
const act = comps.Tilo_Acting_Test;
const actCtrl = act._layers.find((l) => l.name === 'CTRL_Tilo').property('ADBE Effect Parade');
let nKeys = 0;
for (const [n, keys] of Object.entries(ACTING.keys)) {
  const p = actCtrl.kids.find((k) => k.name === n)?.property(1);
  if (!p || p.keys.length !== keys.length) fail(`acting keys for ${n}`);
  nKeys += keys.length;
}
const cap = act._layers.find((l) => l.name === 'CAPTION');
if (!cap || cap.property('ADBE Text Properties').property('ADBE Text Document').keys.length !== ACTING.captions.length) fail('captions');
console.log(`Tilo_Rig: ${rig._layers.length} layers, ${nExpr} expressions compiled; acting test: ${nKeys} control keys, ${ACTING.captions.length} captions`);

// ---- 4. render the rebuilt rig vs the spec ----
const poses = [['rest', {}, 0], ['point', {Point: 100, 'Head Tilt': -10}, 0], ['bank', {'Flight Bank': 20, 'Propeller Speed': 60, 'Tail Wag': 30}, 0.4]];
const sh = await openShooter(1920, 1080);
fs.mkdirSync(outDir, {recursive: true});
for (const [n, vals, t] of poses) {
  const keys = Object.fromEntries(Object.entries(vals).map(([k, v]) => [k, [[0, v]]]));
  await sh.shoot(frameSVG(new Evaluator(spec, keys), t, {motionBlurSamples: 1}), `${outDir}/spec_${n}.png`);
  await sh.shoot(frameSVG(new Evaluator(rebuilt, keys), t, {motionBlurSamples: 1}), `${outDir}/jsx_${n}.png`);
}
await sh.close();
console.log(problems.length ? `PROBLEMS (${problems.length}):\n- ${problems.slice(0, 40).join('\n- ')}` : 'no problems found');
process.exitCode = problems.length ? 1 : 0;
