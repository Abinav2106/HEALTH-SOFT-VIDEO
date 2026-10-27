/*!
 * GoFloaters Character + Aircraft Rig  v1.0
 * Layered SVG rig built from the colour-separated vector reconstruction of the
 * original GoFloaters logo (see gofloaters-rig-data.js).
 *
 * Coordinate space: source pixels of the 2000x667 master. Every part is a
 * clipped copy of the traced plates inside its own transform group, so the rest
 * pose renders exactly as the reconstructed master logo.
 *
 * Hierarchy (seated / logo pose):
 *   root
 *   ├─ trails            5 independent speed lines
 *   ├─ aircraft          bank / position
 *   │   ├─ base          turquoise + yellow plates, fuselage, tail fin, stabiliser
 *   │   ├─ wing          flex about wing root
 *   │   ├─ cockpitEmpty  (reconstruction) shown when the dog leaves
 *   │   ├─ behindLeg     (reconstruction) surface hidden by the near foreleg
 *   │   ├─ seat          dog's lower body in the cockpit (attached only)
 *   │   └─ propeller     disc + moving blade glints
 *   ├─ dog               (follows aircraft when attached) position / rotation
 *   │   ├─ lower         (reconstruction) haunch + tail root, detached only
 *   │   ├─ seatedBody
 *   │   │   └─ torso     lean + breathing about the hip
 *   │   │       ├─ tail, legFar(+paw underside), chest patch, torso plate, neck patch
 *   │   │       ├─ head  tilt about the neck
 *   │   │       │   ├─ earFar, earNear   follow-through about ear roots
 *   │   │       │   ├─ head plate (mouth region cut out)
 *   │   │       │   ├─ eye   white, pupil, upper/lower lids, happy arc
 *   │   │       │   └─ mouth traced smile  <->  procedural mouth
 *   │   │       └─ legNear  about the shoulder
 *   │   │           └─ pawNear about the wrist
 *   │   └─ freeBody      constructed full-body view (stand / walk / run / jump)
 *   ├─ wordmark          10 letters
 *   └─ tagline           5 words
 */
(function (global) {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  let INSTANCE = 0;

  const DEFAULTS = {
    // root
    x: 0, y: 0, rot: 0, scale: 1, masterLock: 0,
    showWordmark: 1, showTagline: 1, showTrails: 1, showAircraft: 1, showDog: 1,
    attached: 1, body: 'seated',           // 'seated' (logo pose) | 'free' (constructed full body)
    // aircraft
    acX: 0, acY: 0, acRot: 0, acScale: 1, propAngle: 0, propBlur: 0, wingFlex: 0,
    // trails
    trailPhase: 0, trailStretch: 1, trailOpacity: 1, trailDrift: 0,
    // dog root (relative to seat when attached, to canvas when detached)
    dogX: 0, dogY: 0, dogRot: 0, dogScale: 1, dogFlip: 0,
    // body
    lean: 0, breath: 0,
    // head
    headTilt: 0, headX: 0, headY: 0,
    earNear: 0, earFar: 0,
    // eyes
    lookX: 0, lookY: 0, blink: 0, lidUpper: 0, lidLower: 0, lidTilt: 0, pupil: 1, happyEyes: 0,
    // mouth
    mouthSmile: 0, mouthOpen: 0, mouthWidth: 1, mouthO: 0, mouthTongue: 0,
    // limbs (seated)
    legNear: 0, legNearBend: 0, pawNear: 0, legFar: 0, legFarBend: 0, pawFar: 0, tail: 0, tailCurl: 0,
    // free body (constructed view) - see freeBody section
    fbX: 0, fbY: 0, fbPitch: 0, fbHeadX: 0, fbHeadY: 0, fbHeadFollow: 0.35,
    fbFL: null, fbFR: null, fbHL: null, fbHR: null,   // [3 world angles] each; null = standing pose
    fbTail: 0, fbShadow: 1, fbGround: 513, fbGroundLock: 1, fbAir: 0,
    letters: null, words: null,
  };

  // ---------------------------------------------------------------- helpers
  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  const rotAbout = (a, p) => `rotate(${a.toFixed(3)} ${p[0]} ${p[1]})`;
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const f = n => (+n).toFixed(2);

  // ---------------------------------------------------------------- tubes
  // Limbs, tail and ears are redrawn as "tubes": a smoothed centreline with an
  // interior half-width per point. The outline is offset by (r + stroke/2) so
  // the black line sits exactly where the source line sits. Bends are computed
  // on the centreline, so joints never open gaps.
  function catmull(pts, sub) {
    const out = [];
    const n = pts.length;
    for (let i = 0; i < n - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n - 1, i + 2)];
      for (let k = 0; k < sub; k++) {
        const t = k / sub, t2 = t * t, t3 = t2 * t;
        const q = [0, 1, 2].map(j => 0.5 * ((2 * p1[j]) + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3));
        out.push(q);
      }
    }
    out.push(pts[n - 1].slice());
    return out;
  }
  function articulate(pts, joints) {
    // joints: [[index, angleDeg], ...] applied root -> tip; rotates every point after index
    const p = pts.map(q => q.slice());
    for (const [idx, ang] of joints) {
      if (!ang) continue;
      const a = ang * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
      const [ox, oy] = p[idx];
      for (let i = idx + 1; i < p.length; i++) {
        const dx = p[i][0] - ox, dy = p[i][1] - oy;
        p[i][0] = ox + dx * c - dy * s; p[i][1] = oy + dx * s + dy * c;
      }
    }
    return p;
  }
  // remove the "swallowtail" loops an offset curve forms on the inside of a tight bend
  function unloop(poly) {
    const out = poly.slice();
    const X = (a, b, c, d) => {
      const r = [b[0] - a[0], b[1] - a[1]], q = [d[0] - c[0], d[1] - c[1]];
      const den = r[0] * q[1] - r[1] * q[0]; if (Math.abs(den) < 1e-9) return null;
      const t = ((c[0] - a[0]) * q[1] - (c[1] - a[1]) * q[0]) / den, u = ((c[0] - a[0]) * r[1] - (c[1] - a[1]) * r[0]) / den;
      return t > 0 && t < 1 && u > 0 && u < 1 ? [a[0] + r[0] * t, a[1] + r[1] * t] : null;
    };
    for (let i = 0; i < out.length - 3; i++) {
      for (let j = Math.min(out.length - 2, i + 40); j > i + 1; j--) {
        const x = X(out[i], out[i + 1], out[j], out[j + 1]);
        if (x) { out.splice(i + 1, j - i, x); break; }
      }
    }
    return out;
  }
  function tubePaths(pts, stroke, opts) {
    const o = Object.assign({ capEnd: 'round', capStart: 'open', widthScale: 1, trimL: 0, trimR: 0 }, opts || {});
    const sm = catmull(pts, 6);
    const L = [], R = [];
    for (let i = 0; i < sm.length; i++) {
      const a = sm[Math.max(0, i - 1)], b = sm[Math.min(sm.length - 1, i + 1)];
      let tx = b[0] - a[0], ty = b[1] - a[1]; const len = Math.hypot(tx, ty) || 1; tx /= len; ty /= len;
      const w = sm[i][2] * o.widthScale + stroke / 2;
      L.push([sm[i][0] - ty * w, sm[i][1] + tx * w]); R.push([sm[i][0] + ty * w, sm[i][1] - tx * w]);
    }
    const cap = (center, from, to, steps) => {
      const pts2 = []; const a0 = Math.atan2(from[1] - center[1], from[0] - center[0]);
      let a1 = Math.atan2(to[1] - center[1], to[0] - center[0]);
      const r = Math.hypot(from[0] - center[0], from[1] - center[1]);
      let da = a1 - a0; while (da > 0) da -= 2 * Math.PI; // sweep clockwise-negative side
      if (Math.abs(da) < Math.PI * 0.5) da += 2 * Math.PI;
      for (let k = 1; k < steps; k++) { const a = a0 + da * k / steps; pts2.push([center[0] + Math.cos(a) * r, center[1] + Math.sin(a) * r]); }
      return pts2;
    };
    const nL = L.length;
    const L2 = unloop(L), R2 = unloop(R);
    // keep trim counts meaningful after loop removal
    const tl = Math.round((o.trimL || 0) * L2.length / nL), tr = Math.round((o.trimR || 0) * R2.length / nL);
    L.length = 0; L.push(...L2); R.length = 0; R.push(...R2); o.trimL = tl; o.trimR = tr;
    const e = sm[sm.length - 1], st = sm[0];
    const endCap = o.capEnd === 'round' ? cap(e, L[L.length - 1], R[R.length - 1], 14) : [];
    const startCap = o.capStart === 'round' ? cap(st, R[0], L[0], 14) : [];
    const ring = [...L, ...endCap, ...R.slice().reverse(), ...startCap];
    const P = q => q[0].toFixed(2) + ',' + q[1].toFixed(2);
    const fill = 'M' + ring.map(P).join('L') + 'Z';
    const line = o.capStart === 'round' ? fill : 'M' + [...L.slice(o.trimL), ...endCap, ...R.slice(o.trimR).reverse()].map(P).join('L');
    return { fill, line };
  }

  function create(target, options) {
    const D = global.GF_DATA;
    if (!D) throw new Error('GF_DATA missing: load gofloaters-rig-data.js first');
    const opt = Object.assign({ viewBox: '0 0 2000 667' }, options || {});
    const id = 'gf' + (++INSTANCE) + '-';
    const C = D.colors;
    const svg = target && target.tagName && target.tagName.toLowerCase() === 'svg'
      ? target : el('svg', { xmlns: NS }, target);
    svg.setAttribute('viewBox', opt.viewBox);
    svg.setAttribute('class', 'gf-rig');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'GoFloaters mascot and aircraft');

    // ------------------------------------------------------------ defs
    const defs = el('defs', null, svg);
    const plateWhite = el('path', { id: id + 'p-white', d: D.plates.white, fill: C.white, 'fill-rule': 'evenodd' }, defs);
    const plateDog = el('g', { id: id + 'p-ink' }, defs);
    el('use', { href: '#' + id + 'p-white' }, plateDog);
    el('path', { d: D.plates.orange, fill: C.orange, 'fill-rule': 'evenodd' }, plateDog);
    el('path', { d: D.plates.black, fill: C.ink, 'fill-rule': 'evenodd' }, plateDog);
    const plateLine = el('g', { id: id + 'p-line' }, defs);
    el('path', { d: D.plates.orange, fill: C.orange, 'fill-rule': 'evenodd' }, plateLine);
    el('path', { d: D.plates.black, fill: C.ink, 'fill-rule': 'evenodd' }, plateLine);
    el('path', { id: id + 'p-turq', d: D.plates.turq, fill: C.turquoise, 'fill-rule': 'evenodd' }, defs);
    el('path', { id: id + 'p-yellow', d: D.plates.yellow, fill: C.yellow, 'fill-rule': 'evenodd' }, defs);
    for (const k in D.clips) {
      const cp = el('clipPath', { id: id + 'c-' + k }, defs);
      el('path', { d: D.clips[k], 'clip-rule': 'evenodd' }, cp);
    }
    const propClip = el('clipPath', { id: id + 'c-propdisc' }, defs);
    el('path', { d: D.propYellow }, propClip);

    const clipped = (parent, plate, clip) => {
      const g = el('g', { 'clip-path': `url(#${id}c-${clip})` }, parent);
      el('use', { href: '#' + id + plate }, g);
      return g;
    };
    const patch = (parent, name, clip) => {
      const g = el('g', { 'data-patch': name, class: 'gf-reconstruction' }, parent);
      if (clip) g.setAttribute('clip-path', `url(#${id}c-${clip})`);
      g.innerHTML = D.patches[name];
      return g;
    };
    const P = D.pivots;

    // ------------------------------------------------------------ scene
    const decorBack = el('g', { class: 'gf-decor-back' }, svg);
    const root = el('g', { id: id + 'root', class: 'gf-root' }, svg);
    const trails = el('g', { class: 'gf-trails' }, root);
    const trailEls = D.speed.map((d, i) => {
      const g = el('g', { class: 'gf-trail' }, trails);
      el('path', { d, fill: C.ink }, g);
      return g;
    });

    // aircraft
    const aircraft = el('g', { class: 'gf-aircraft' }, root);
    const acBase = el('g', { class: 'gf-ac-base' }, aircraft);
    // reconstruction of the surface hidden by the near foreleg sits beneath the
    // source plates, so it only shows where the source has no artwork
    const behindLeg = patch(acBase, 'aircraft_behind_leg', 'nearlimb');
    const behindLegCockpit = patch(acBase, 'aircraft_behind_leg_cockpit', 'nearlimb');
    clipped(acBase, 'p-turq', 'turqBase');
    clipped(acBase, 'p-yellow', 'notprop');
    clipped(acBase, 'p-ink', 'airframe');                 // fuselage
    const tailfin = el('g', { class: 'gf-ac-tailfin' }, acBase); clipped(tailfin, 'p-ink', 'tailfin');
    const stab = el('g', { class: 'gf-ac-stabilizer' }, acBase); clipped(stab, 'p-ink', 'stabilizer');
    const wingUnder = patch(acBase, 'wing_under', 'wing');
    patch(acBase, 'fuselage_top');
    const wing = el('g', { class: 'gf-ac-wing' }, aircraft);
    clipped(wing, 'p-turq', 'wing'); clipped(wing, 'p-ink', 'wing');
    const cockpitEmpty = patch(aircraft, 'cockpit_empty');
    const seat = el('g', { class: 'gf-ac-seat' }, aircraft); clipped(seat, 'p-ink', 'seat');
    const prop = el('g', { class: 'gf-ac-propeller' }, aircraft);
    const propDisc = el('g', null, prop);
    clipped(propDisc, 'p-yellow', 'propeller'); clipped(propDisc, 'p-ink', 'propeller');
    const propFx = el('g', { 'clip-path': `url(#${id}c-propdisc)` }, prop);
    const blades = [0, 1].map(() => el('path', { fill: 'none', stroke: '#D9B53C', 'stroke-width': 7, 'stroke-linecap': 'round', opacity: 0 }, propFx));
    const blurArcs = [0, 1, 2].map(() => el('path', { fill: 'none', stroke: '#FFFFFF', 'stroke-width': 5, 'stroke-linecap': 'round', opacity: 0 }, propFx));

    // dog
    const dog = el('g', { class: 'gf-dog' }, root);
    const dogInner = el('g', null, dog);
    const lower = patch(dogInner, 'dog_lower');
    const seated = el('g', { class: 'gf-dog-seated' }, dogInner);
    const torso = el('g', { class: 'gf-torso' }, seated);
    const SW = D.stroke;
    const tube = (parent, cls) => {
      const g = el('g', { class: cls }, parent);
      return { g, fill: el('path', { fill: C.white }, g), line: el('path', { fill: 'none', stroke: C.ink, 'stroke-width': SW, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, g) };
    };
    const setTube = (t, pts, opts) => { const pp = tubePaths(pts, SW, opts); t.fill.setAttribute('d', pp.fill); t.line.setAttribute('d', pp.line); };
    const tail = tube(torso, 'gf-tail');
    const legFar = tube(torso, 'gf-leg-far');
    patch(torso, 'torso_behind_leg', 'nearlimb');
    // procedural neck section: white fill + two lines bridging head and torso
    const neckFill = el('path', { fill: C.white }, torso);
    const neckLines = el('path', { fill: 'none', stroke: C.ink, 'stroke-width': D.neck.w, 'stroke-linecap': 'round' }, torso);
    clipped(torso, 'p-ink', 'torso_body');
    patch(torso, 'chest_line');
    patch(torso, 'chest_fur');

    // head (shared by seated and free body)
    const headMount = el('g', null, torso);
    const head = el('g', { class: 'gf-head' }, headMount);
    const earFar = el('g', { class: 'gf-ear-far' }, head); patch(earFar, 'ear_far_root'); clipped(earFar, 'p-ink', 'ear_far');
    const earNear = el('g', { class: 'gf-ear-near' }, head); patch(earNear, 'ear_near_root'); clipped(earNear, 'p-ink', 'ear_near');
    clipped(head, 'p-white', 'head_white');
    clipped(head, 'p-line', 'head_ink');
    // eye
    const E = D.eye, PU = D.pupil;
    const eye = el('g', { class: 'gf-eye', 'clip-path': `url(#${id}c-eye)` }, head);
    el('ellipse', { cx: E.cx, cy: E.cy, rx: E.rx + 3, ry: E.ry + 3, fill: C.white }, eye);
    const pupil = el('circle', { cx: PU.cx, cy: PU.cy, r: PU.r, fill: C.ink }, eye);
    const lidU = el('path', { fill: C.white }, eye);
    const lidL = el('path', { fill: C.white }, eye);
    const lidUe = el('path', { fill: 'none', stroke: C.ink, 'stroke-width': 4.2, 'stroke-linecap': 'round' }, eye);
    const lidLe = el('path', { fill: 'none', stroke: C.ink, 'stroke-width': 3.6, 'stroke-linecap': 'round' }, eye);
    const happy = el('path', { fill: 'none', stroke: C.ink, 'stroke-width': 4.6, 'stroke-linecap': 'round' }, eye);
    // mouth
    const mouth = el('g', { class: 'gf-mouth' }, head);
    const mouthTraced = clipped(mouth, 'p-ink', 'mouth');
    const mouthDrawn = el('g', null, mouth);
    el('path', { d: 'M' + D.mouthPoly.map(p => p.join(',')).join('L') + 'Z', fill: C.white }, mouthDrawn);
    const mouthShape = el('path', { fill: C.ink, stroke: C.ink, 'stroke-width': 4.4, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, mouthDrawn);
    const tongue = el('path', { fill: C.orange }, mouthDrawn);

    const legNear = tube(torso, 'gf-leg-near');
    // shoulder cap: hides the open top of the near foreleg once it swings away from the chest
    const shoulder = el('circle', { cx: D.tubes.leg_near[0][0] - 1, cy: D.tubes.leg_near[0][1] - 2, r: 12, fill: C.white, opacity: 0 }, torso);
    const TB = D.tubes, TJ = D.tubeJoints;

    // free body (constructed full-body view) - built lazily by freeBody module
    const free = el('g', { class: 'gf-dog-free', style: 'display:none' }, dogInner);
    const fb = global.GoFloatersFreeBody ? global.GoFloatersFreeBody.build(free, D, { el, tube, setTube, articulate, C, SW }) : null;

    // brand type
    const wordmark = el('g', { class: 'gf-wordmark' }, root);
    const letterEls = {};
    D.letterOrder.forEach(k => { const g = el('g', { 'data-letter': k }, wordmark); el('path', { d: D.letters[k], fill: C.ink, 'fill-rule': 'evenodd' }, g); letterEls[k] = g; });
    const tagline = el('g', { class: 'gf-tagline' }, root);
    const wordEls = {};
    D.wordOrder.forEach(k => { const g = el('g', { 'data-word': k }, tagline); el('path', { d: D.words[k], fill: C.tagline, 'fill-rule': 'evenodd' }, g); wordEls[k] = g; });

    const decorFront = el('g', { class: 'gf-decor-front' }, svg);
    // master artwork lock-off: the static traced lockup, faded in for logo resolves
    const master = el('g', { class: 'gf-master', style: 'display:none' }, svg);
    el('use', { href: '#' + id + 'p-white' }, master);
    el('use', { href: '#' + id + 'p-turq' }, master);
    el('use', { href: '#' + id + 'p-yellow' }, master);
    el('use', { href: '#' + id + 'p-line' }, master);
    D.speed.forEach(d => el('path', { d, fill: C.ink }, master));
    el('path', { d: D.letterOrder.map(k => D.letters[k]).join(' '), fill: C.ink, 'fill-rule': 'evenodd' }, master);
    el('path', { d: D.wordOrder.map(k => D.words[k]).join(' '), fill: C.tagline, 'fill-rule': 'evenodd' }, master);

    // ------------------------------------------------------------ apply
    const state = Object.assign({}, DEFAULTS);
    const AC_PIVOT = [580, 430];
    const SEAT = [540, 400];

    // neck: cubic bridges whose top ends ride on the head transform
    function headPoint(s, p) {
      const a = s.headTilt * Math.PI / 180, c = Math.cos(a), sn = Math.sin(a), pv = P.head;
      const dx = p[0] - pv[0], dy = p[1] - pv[1];
      return [pv[0] + dx * c - dy * sn + s.headX, pv[1] + dx * sn + dy * c + s.headY];
    }
    function headDir(s, v) { const a = s.headTilt * Math.PI / 180; return [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)]; }
    function neckGeometry(s) {
      const N = D.neck;
      const side = (seg) => {
        const t = seg[0], b = seg[1];
        const v = [b[0] - t[0], b[1] - t[1]], len = Math.hypot(v[0], v[1]);
        const T = headPoint(s, t), dv = headDir(s, v);
        const c1 = [T[0] + dv[0] / 3, T[1] + dv[1] / 3], c2 = [b[0] - v[0] / 3, b[1] - v[1] / 3];
        return { T, c1, c2, B: b, len };
      };
      const k = side(N.back), fr = side(N.front);
      const seg = q => `M${f(q.T[0])},${f(q.T[1])}C${f(q.c1[0])},${f(q.c1[1])} ${f(q.c2[0])},${f(q.c2[1])} ${f(q.B[0])},${f(q.B[1])}`;
      neckLines.setAttribute('d', seg(k) + seg(fr));
      const up = headDir(s, [0, -14]);
      neckFill.setAttribute('d', `M${f(k.T[0] + up[0])},${f(k.T[1] + up[1])}L${f(fr.T[0] + up[0])},${f(fr.T[1] + up[1])}L${f(fr.T[0])},${f(fr.T[1])}C${f(fr.c1[0])},${f(fr.c1[1])} ${f(fr.c2[0])},${f(fr.c2[1])} ${f(fr.B[0])},${f(fr.B[1] + 3)}L${f(k.B[0])},${f(k.B[1] + 3)}C${f(k.c2[0])},${f(k.c2[1])} ${f(k.c1[0])},${f(k.c1[1])} ${f(k.T[0])},${f(k.T[1])}Z`);
    }

    function eyeGeometry(s) {
      const top = E.cy - E.ry - 4, bot = E.cy + E.ry + 4, meet = E.cy + 3;
      const u = clamp(Math.max(s.lidUpper, s.blink, s.happyEyes), 0, 1);
      const l = clamp(Math.max(s.lidLower, s.blink * 0.9, s.happyEyes), 0, 1);
      const yu = lerp(top, meet, u), yl = lerp(bot, meet + 1, l);
      const R = E.rx + 6, t = Math.tan(s.lidTilt * Math.PI / 180) * R;
      const sagU = lerp(2, 6, u), sagL = lerp(-2, -4, l);
      const x0 = E.cx - R, x1 = E.cx + R;
      lidU.setAttribute('d', `M${f(x0)},${f(top - 30)}L${f(x1)},${f(top - 30)}L${f(x1)},${f(yu - t)}Q${f(E.cx)},${f(yu + sagU)} ${f(x0)},${f(yu + t)}Z`);
      lidL.setAttribute('d', `M${f(x0)},${f(bot + 30)}L${f(x1)},${f(bot + 30)}L${f(x1)},${f(yl)}Q${f(E.cx)},${f(yl + sagL)} ${f(x0)},${f(yl)}Z`);
      lidUe.setAttribute('d', `M${f(x1)},${f(yu - t)}Q${f(E.cx)},${f(yu + sagU)} ${f(x0)},${f(yu + t)}`);
      lidLe.setAttribute('d', `M${f(x1)},${f(yl)}Q${f(E.cx)},${f(yl + sagL)} ${f(x0)},${f(yl)}`);
      lidUe.setAttribute('opacity', u > 0.04 && s.happyEyes < 0.5 ? 1 : 0);
      lidLe.setAttribute('opacity', l > 0.12 && s.happyEyes < 0.5 && !(s.blink > 0.9) ? 1 : 0);
      // pupil
      const mx = E.rx - PU.r - 4, my = E.ry - PU.r - 4;
      const pr = PU.r * s.pupil;
      pupil.setAttribute('cx', f(PU.cx + clamp(s.lookX, -1, 1) * mx));
      pupil.setAttribute('cy', f(PU.cy + clamp(s.lookY, -1, 1) * my));
      pupil.setAttribute('r', f(pr));
      // happy "smiling eye" arc
      const h = s.happyEyes;
      happy.setAttribute('opacity', h > 0.5 ? 1 : 0);
      happy.setAttribute('d', `M${f(E.cx - 13)},${f(E.cy + 6)}Q${f(E.cx)},${f(E.cy - 9)} ${f(E.cx + 13)},${f(E.cy + 6)}`);
    }

    const MOUTH_NEUTRAL = s => Math.abs(s.mouthSmile) < 1e-3 && s.mouthOpen < 1e-3 && Math.abs(s.mouthWidth - 1) < 1e-3 && s.mouthO < 1e-3;
    function mouthGeometry(s) {
      const neutral = MOUTH_NEUTRAL(s);
      mouthTraced.style.display = neutral ? '' : 'none';
      mouthDrawn.style.display = neutral ? 'none' : '';
      if (neutral) return;
      // corners & centre measured from the traced smile
      const cx = 694, cy = 186, hw = 19 * s.mouthWidth;
      let Lx = cx - hw, Ly = 180.5 - 3 * s.mouthSmile, Rx = cx + hw, Ry = 185.5 - 1.5 * s.mouthSmile;
      const sag = 9 + 6 * s.mouthSmile;               // middle drop of upper lip (smile curve)
      let Ux = cx - 4, Uy = cy + sag - 6;
      let Dx = cx - 2, Dy = Uy + 0.5 + 22 * s.mouthOpen + 6 * Math.max(0, s.mouthSmile) * s.mouthOpen;
      // O shape
      const o = s.mouthO, ocx = 690, ocy = 188, orx = 6.5, ory = 8.5;
      Lx = lerp(Lx, ocx - orx, o); Ly = lerp(Ly, ocy, o); Rx = lerp(Rx, ocx + orx, o); Ry = lerp(Ry, ocy, o);
      Ux = lerp(Ux, ocx, o); Uy = lerp(Uy, ocy - 2 * ory, o); Dx = lerp(Dx, ocx, o); Dy = lerp(Dy, ocy + 2 * ory, o);
      mouthShape.setAttribute('d', `M${f(Lx)},${f(Ly)}Q${f(Ux)},${f(Uy)} ${f(Rx)},${f(Ry)}Q${f(Dx)},${f(Dy)} ${f(Lx)},${f(Ly)}Z`);
      const open = Math.max(s.mouthOpen, o * 0.8);
      const tg = s.mouthTongue * open;
      tongue.setAttribute('opacity', tg > 0.05 ? 1 : 0);
      const lowMid = (Ly + Ry) / 4 + Dy / 2, upMid = (Ly + Ry) / 4 + Uy / 2;
      const tx = lerp(cx - 2, ocx, o), ty = lerp(lowMid - Math.min(4, (lowMid - upMid) * 0.35), ocy + 6, o);
      tongue.setAttribute('d', `M${f(tx - 8 * tg)},${f(ty + 2)}Q${f(tx)},${f(ty - 7 * tg)} ${f(tx + 8 * tg)},${f(ty + 2)}Q${f(tx)},${f(ty + 6 * tg)} ${f(tx - 8 * tg)},${f(ty + 2)}Z`);
    }

    function propGeometry(s) {
      const hub = [874, 405], R = 82;
      const a = s.propAngle * Math.PI / 180;
      const vis = clamp(1 - s.propBlur * 1.4, 0, 1);
      blades.forEach((b, i) => {
        const y = hub[1] + R * Math.cos(a + i * Math.PI);
        const near = Math.sin(a + i * Math.PI) > 0;
        b.setAttribute('d', `M${f(hub[0] - 22)},${f(y)}Q${f(hub[0])},${f(y + 5)} ${f(hub[0] + 24)},${f(y)}`);
        b.setAttribute('opacity', f(vis * (near ? 0.9 : 0.45) * (s.propAngle !== 0 || s.propBlur > 0 ? 1 : 0)));
      });
      blurArcs.forEach((b, i) => {
        const ph = a * 0.5 + i * 2.1;
        const y = hub[1] + (R - 10) * Math.sin(ph);
        b.setAttribute('d', `M${f(hub[0] - 16)},${f(y - 12)}Q${f(hub[0] + 6)},${f(y)} ${f(hub[0] - 16)},${f(y + 12)}`);
        b.setAttribute('opacity', f(clamp(s.propBlur, 0, 1) * 0.55));
      });
    }

    function set(patchState) {
      Object.assign(state, patchState || {});
      const s = state;
      master.style.display = s.masterLock > 0 ? '' : 'none';
      master.style.opacity = s.masterLock;
      root.setAttribute('transform', `translate(${f(s.x)} ${f(s.y)}) rotate(${f(s.rot)} 1000 333) scale(${s.scale})`);
      // visibility
      D.letterOrder.forEach((k, i) => { const v = (s.letters && s.letters[i]) || [0, 0, 1]; letterEls[k].setAttribute('transform', `translate(${f(v[0])} ${f(v[1])})`); letterEls[k].style.opacity = v[2]; });
      D.wordOrder.forEach((k, i) => { const v = (s.words && s.words[i]) || [0, 0, 1]; wordEls[k].setAttribute('transform', `translate(${f(v[0])} ${f(v[1])})`); wordEls[k].style.opacity = v[2]; });
      wordmark.style.opacity = s.showWordmark; wordmark.style.display = s.showWordmark > 0 ? '' : 'none';
      tagline.style.opacity = s.showTagline; tagline.style.display = s.showTagline > 0 ? '' : 'none';
      trails.style.display = s.showTrails > 0 ? '' : 'none';
      aircraft.style.display = s.showAircraft > 0 ? '' : 'none';
      dog.style.display = s.showDog > 0 ? '' : 'none';
      aircraft.style.opacity = s.showAircraft; dog.style.opacity = s.showDog;
      // trails: each line slides and stretches with its own phase
      trailEls.forEach((g, i) => {
        const b = D.speedBoxes[i];
        const ph = ((s.trailPhase + i * 0.37) % 1 + 1) % 1;
        const dx = -ph * 70 * s.trailDrift;
        const fade = s.trailDrift > 0 ? Math.sin(Math.PI * ph) : 1;
        g.setAttribute('transform', `translate(${f(dx + s.acX * 0.35)} ${f(s.acY * 0.8)}) translate(${b[2]} 0) scale(${f(s.trailStretch)} 1) translate(${-b[2]} 0)`);
        g.style.opacity = f(s.trailOpacity * fade * s.showTrails);
      });
      // aircraft
      const acT = `translate(${f(s.acX)} ${f(s.acY)}) rotate(${f(s.acRot)} ${AC_PIVOT[0]} ${AC_PIVOT[1]}) translate(${AC_PIVOT[0]} ${AC_PIVOT[1]}) scale(${s.acScale}) translate(${-AC_PIVOT[0]} ${-AC_PIVOT[1]})`;
      aircraft.setAttribute('transform', acT);
      wing.setAttribute('transform', rotAbout(s.wingFlex, P.wing));
      const attached = s.attached > 0.5 && s.body === 'seated';
      // the seat carries the dog's lower body; once the dog is hidden or gone the cockpit is shown empty
      const inSeat = attached && s.showDog > 0.5;
      seat.style.display = inSeat ? '' : 'none';
      cockpitEmpty.style.display = inSeat ? 'none' : '';
      behindLegCockpit.style.display = inSeat ? '' : 'none';
      lower.style.display = attached || s.body !== 'seated' ? 'none' : '';
      propGeometry(s);
      // dog
      const dogLocal = `translate(${f(s.dogX)} ${f(s.dogY)}) rotate(${f(s.dogRot)} ${SEAT[0]} ${SEAT[1]}) translate(${SEAT[0]} ${SEAT[1]}) scale(${f(s.dogScale * (s.dogFlip ? -1 : 1))} ${f(s.dogScale)}) translate(${-SEAT[0]} ${-SEAT[1]})`;
      dog.setAttribute('transform', attached ? acT : '');
      dogInner.setAttribute('transform', dogLocal);
      const isFree = s.body === 'free';
      seated.style.display = isFree ? 'none' : '';
      free.style.display = isFree ? '' : 'none';
      // torso
      const br = 1 + 0.018 * s.breath;
      // lean is a skew about the cockpit line, so the body never separates from the seat
      torso.setAttribute('transform', `translate(${P.torso[0]} ${P.torso[1]}) skewX(${f(-s.lean)}) scale(${1 + 0.006 * s.breath} ${f(br)}) translate(${-P.torso[0]} ${-P.torso[1]})`);
      setTube(legNear, articulate(TB.leg_near, [[0, s.legNear], [TJ.leg_near.elbow, s.legNearBend], [TJ.leg_near.wrist, s.pawNear]]), { trimR: D.tubeTrim.leg_near.R });
      shoulder.setAttribute('opacity', f(clamp(Math.abs(s.legNear) / 25 - 0.15, 0, 1)));
      setTube(legFar, articulate(TB.leg_far, [[0, s.legFar], [TJ.leg_far.elbow, s.legFarBend], [TJ.leg_far.wrist, s.pawFar]]));
      const tj = [[0, s.tail]]; for (let i = 2; i < TB.tail.length - 1; i++) tj.push([i, s.tailCurl * 2]);
      setTube(tail, articulate(TB.tail, tj));
      earFar.setAttribute('transform', rotAbout(s.earFar, P.ear_far));
      earNear.setAttribute('transform', rotAbout(s.earNear, P.ear_near));
      // head
      head.setAttribute('transform', `translate(${f(s.headX)} ${f(s.headY)}) ${rotAbout(s.headTilt, P.head)}`);
      neckGeometry(s);
      eyeGeometry(s);
      mouthGeometry(s);
      if (fb) {
        if (isFree) { fb.apply(s, head, headMount, torso); }
        else if (head.parentNode !== headMount) { headMount.appendChild(head); }
      }
      return api;
    }

    function reset() { return set(Object.assign({}, DEFAULTS)); }

    const api = {
      svg, state, set, reset, defaults: DEFAULTS, decorBack, decorFront, el,
      parts: { root, trails, trailEls, aircraft, wing, prop, seat, cockpitEmpty, dog, torso, head, earFar, earNear, eye, pupil, mouth, legNear: legNear.g, legFar: legFar.g, tail: tail.g, wordmark, tagline, letterEls, wordEls, free },
      pivots: Object.assign({ aircraft: AC_PIVOT, seat: SEAT }, P),
    };
    set({});
    return api;
  }

  global.GoFloatersRig = { create, DEFAULTS };
})(typeof window !== 'undefined' ? window : globalThis);
