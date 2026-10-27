// GoFloaters Diwali Spark Hunt: deterministic storyboard frame renderer (1080x1920, 9:16).
// Inputs (all git-ignored; see README):
//   assets/tilo_aircraft.svg, assets/tilo_aircraft_speedlines.svg  (traced from the supplied logo)
//   assets/gofloaters_logo.png                                      (supplied logo, unaltered)
//   plates/p01.png p02.png p04.png p10.png                          (Higgsfield background plates, no characters)
//   game/05_map.png game/06_space.png                               (real GoFloaters captures, unaltered)
// Missing plates fall back to a labelled preview background. Missing game captures render as labelled slots.
const fs = require('fs'), path = require('path');
const d3 = require('d3-geo'), topo = require('topojson-client');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'out', 'frames');
const FONT = path.resolve(ROOT, '../remotion/public/fonts/Inter-latin-var.woff2');
const W = 1080, H = 1920;
const C = {
  route: '#18B36A', routeEdge: '#0B6B3F',           // green = navigation
  gold: '#F4B740', goldHi: '#FFE3A1', goldCore: '#FFF8E8', // gold = Spark / reward
  turq: '#6ED0E0', yellow: '#FBE163', ink: '#111111', navy: '#0A1A2B',
};
const exists = p => fs.existsSync(path.join(ROOT, p));
const url = p => 'file://' + path.join(ROOT, p);

// ---------- Tilo (vector trace of the supplied mascot; never redrawn) ----------
const vbOf = f => fs.readFileSync(path.join(ROOT, f), 'utf8').match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
const TILO = { plain: 'assets/tilo_aircraft.svg', lines: 'assets/tilo_aircraft_speedlines.svg' };
const A = { pupil: [1956, 214], centre: [1748, 760], nose: [2150, 270] }; // anchor points in trace units
function tilo({ anchor = A.centre, at, scale, rotate = 0, variant = 'plain', extra = '' }) {
  const f = TILO[variant], vb = vbOf(f);
  const ox = (anchor[0] - vb[0]) * scale, oy = (anchor[1] - vb[1]) * scale;
  return `<img class="tilo" src="${url(f)}" style="position:absolute;left:${at[0] - ox}px;top:${at[1] - oy}px;width:${vb[2] * scale}px;transform-origin:${ox}px ${oy}px;transform:rotate(${rotate}deg);${extra}">`;
}

// ---------- Spark (one design, used everywhere) ----------
let uid = 0;
function spark(cx, cy, r, { glow = 1, ring = 0 } = {}) {
  const id = 'sg' + (uid++), w = r * 0.11, d = r * 0.42, dw = r * 0.07;
  const star = (R, ww) => `M0,${-R} L${ww},${-ww} L${R},0 L${ww},${ww} L0,${R} L${-ww},${ww} L${-R},0 L${-ww},${-ww}Z`;
  return `<g transform="translate(${cx},${cy})">
  <defs><radialGradient id="${id}"><stop offset="0" stop-color="${C.goldHi}" stop-opacity="${0.85 * glow}"/><stop offset=".35" stop-color="${C.gold}" stop-opacity="${0.38 * glow}"/><stop offset="1" stop-color="${C.gold}" stop-opacity="0"/></radialGradient></defs>
  <circle r="${r * 1.25}" fill="url(#${id})"/>
  ${ring ? `<circle r="${ring}" fill="none" stroke="${C.gold}" stroke-width="${Math.max(2, r * 0.05)}" opacity=".75"/>` : ''}
  <path d="${star(r, w)}" fill="${C.goldHi}"/>
  <path d="${star(d, dw)}" transform="rotate(45)" fill="${C.goldHi}" opacity=".85"/>
  <circle r="${r * 0.16}" fill="${C.goldCore}"/></g>`;
}

// ---------- Route (one style, solid green) ----------
const qpt = (a, c, b, t) => [(1 - t) ** 2 * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0], (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1]];
function ctrl(a, b, bend) { const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1]; return [mx - dy * bend, my + dx * bend]; }
function route(a, b, { bend = 0.12, width = 9, opacity = 1 } = {}) {
  const c = ctrl(a, b, bend), d = `M${a[0]},${a[1]} Q${c[0]},${c[1]} ${b[0]},${b[1]}`;
  return `<g opacity="${opacity}"><path d="${d}" fill="none" stroke="${C.routeEdge}" stroke-width="${width + 5}" stroke-linecap="round" opacity=".55"/>
  <path d="${d}" fill="none" stroke="${C.route}" stroke-width="${width}" stroke-linecap="round"/></g>`;
}
// tapered route for perspective shots (wide near camera, thin at destination)
function taper(a, b, { bend = 0.18, w0 = 30, w1 = 9, opacity = 1 } = {}) {
  const c = ctrl(a, b, bend), L = [], R = [];
  for (let i = 0; i <= 60; i++) {
    const t = i / 60, p = qpt(a, c, b, t), q = qpt(a, c, b, Math.min(1, t + 0.01)), p0 = qpt(a, c, b, Math.max(0, t - 0.01));
    let nx = -(q[1] - p0[1]), ny = q[0] - p0[0]; const n = Math.hypot(nx, ny); nx /= n; ny /= n;
    const w = (w0 + (w1 - w0) * t) / 2; L.push([p[0] + nx * w, p[1] + ny * w]); R.unshift([p[0] - nx * w, p[1] - ny * w]);
  }
  const poly = [...L, ...R].map(p => p.map(v => v.toFixed(1)).join(',')).join(' ');
  return `<polygon points="${poly}" fill="${C.route}" stroke="${C.routeEdge}" stroke-width="2.5" stroke-linejoin="round" opacity="${opacity}"/>`;
}
function marker(x, y, s = 1, label = '') {
  return `<g transform="translate(${x},${y}) scale(${s})"><circle r="30" fill="${C.route}" opacity=".18"/><circle r="17" fill="#fff" stroke="${C.route}" stroke-width="7"/><circle r="5" fill="${C.route}"/></g>${label}`;
}

// ---------- shared page chrome ----------
function page(body, { bg = C.navy } = {}) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Inter;src:url('file://${FONT}') format('woff2');font-weight:100 900;font-style:normal}
html,body{margin:0;width:${W}px;height:${H}px;overflow:hidden;background:${bg};font-family:Inter,sans-serif;-webkit-font-smoothing:antialiased}
.f{position:relative;width:${W}px;height:${H}px;overflow:hidden}
.abs{position:absolute;inset:0}
.plate{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.scrim{position:absolute;left:0;top:0;width:100%;height:780px;background:linear-gradient(rgba(5,12,22,.62),rgba(5,12,22,.28) 45%,rgba(5,12,22,0))}
.copy{position:absolute;left:80px;top:236px;right:150px;color:#fff;text-shadow:0 2px 20px rgba(0,0,0,.35)}
.h{font-weight:800;font-size:84px;line-height:1.02;letter-spacing:-.025em}
.sub{font-weight:600;font-size:46px;line-height:1.1;margin-top:18px;letter-spacing:-.01em;color:rgba(255,255,255,.9)}
.tag{position:absolute;right:24px;bottom:24px;font:600 20px Inter;color:#fff;background:rgba(0,0,0,.55);padding:8px 14px;border-radius:8px;letter-spacing:.04em}
svg{position:absolute;left:0;top:0}
.card{position:absolute;left:190px;top:420px;width:700px;height:1244px;border-radius:44px;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,.45),0 0 0 2px rgba(255,255,255,.18)}
.slot{position:absolute;inset:0;background:#E3E6E9 repeating-linear-gradient(135deg,rgba(0,0,0,.035) 0 14px,transparent 14px 28px);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:#3B434B}
.slot .b{border:3px dashed #9AA3AB;border-radius:24px;padding:34px 30px;width:520px;background:rgba(255,255,255,.6)}
.slot .t{font:800 30px Inter;letter-spacing:.08em}
.slot .s{font:600 26px Inter;margin-top:14px;color:#55606A}
.slot .m{font:500 21px 'DejaVu Sans Mono',monospace;margin-top:18px;color:#7A848D}
.cap{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;background:#000}
</style></head><body><div class="f">${body}</div></body></html>`;
}
const copy = (h, sub) => `<div class="scrim"></div><div class="copy"><div class="h">${h}</div>${sub ? `<div class="sub">${sub}</div>` : ''}</div>`;
function plate(name, fallback) {
  const f = `plates/${name}.png`;
  return exists(f) ? { html: `<img class="plate" src="${url(f)}">`, real: true } : { html: fallback, real: false };
}
const previewTag = p => p.real ? '' : `<div class="tag">PREVIEW BACKGROUND · final plate in Higgsfield</div>`;
function gameSlot(file, title, sub) {
  return exists(`game/${file}`) ? `<img class="cap" src="${url('game/' + file)}">`
    : `<div class="slot"><div class="b"><div class="t">${title}</div><div class="s">${sub}</div><div class="m">game/${file}</div></div></div>`;
}

// ---------- fallback backgrounds (only when a plate file is absent) ----------
const fb01 = `<div class="abs" style="background:linear-gradient(180deg,#86B3C2 0%,#CFD8C6 30%,#F1D7A3 55%,#D9AE82 78%,#8F8486 100%)"></div>
<div class="abs" style="filter:blur(60px)"><div style="position:absolute;left:-200px;top:1100px;width:900px;height:500px;border-radius:50%;background:#F7E2BC"></div><div style="position:absolute;left:500px;top:1350px;width:900px;height:600px;border-radius:50%;background:#B9A79E"></div><div style="position:absolute;left:700px;top:500px;width:500px;height:400px;border-radius:50%;background:#FFE7B8"></div></div>`;
const fb02 = `<div class="abs" style="background:linear-gradient(180deg,#01040A 0%,#06142E 35%,#123E78 52%)"></div>
<div style="position:absolute;left:-1300px;top:1000px;width:3680px;height:3680px;border-radius:50%;background:radial-gradient(circle at 50% 8%,#2C6FA8,#0D3561 30%,#071D38 60%);box-shadow:0 -6px 40px 10px rgba(120,180,255,.75),0 -30px 120px 30px rgba(70,130,230,.35)"></div>`;
const fb10 = (() => { let s = 7, r = () => (s = (s * 9301 + 49297) % 233280) / 233280, b = '';
  for (let x = -20; x < W; x += 60 + r() * 50) { const h = 140 + r() * (r() > .8 ? 420 : 200), w = 70 + r() * 60;
    b += `<div style="position:absolute;left:${x}px;bottom:0;width:${w}px;height:${h}px;background:#0C1024"></div>`;
    for (let k = 0; k < 6; k++) if (r() > .55) b += `<div style="position:absolute;left:${x + 10 + r() * (w - 20)}px;bottom:${20 + r() * (h - 40)}px;width:8px;height:8px;border-radius:2px;background:#FFB45A;box-shadow:0 0 10px 3px rgba(255,170,80,.6)"></div>`; }
  return `<div class="abs" style="background:linear-gradient(180deg,#070B26 0%,#121A4A 45%,#2B2D63 72%,#5B3E66 86%)"></div>${b}`; })();

// ---------- geography (Natural Earth via world-atlas: land only, no political boundaries) ----------
const world = require('world-atlas/land-10m.json');
const LAND_ALL = topo.feature(world, world.objects.land);
// keep real land polygons only (drops Antarctica and degenerate slivers that d3 reads as the whole sphere)
const LAND = { type: 'MultiPolygon', coordinates: (LAND_ALL.features ? LAND_ALL.features.flatMap(f => f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates) : LAND_ALL.geometry.coordinates).filter(poly => {
  const g = { type: 'Polygon', coordinates: poly }; return d3.geoArea(g) < 2 * Math.PI && d3.geoBounds(g)[1][1] > -55; }) };
const CITY = { // [lon, lat]
  'New Delhi': [77.2090, 28.6139], Gurugram: [77.0266, 28.4595], Noida: [77.3910, 28.5355],
  Mumbai: [72.8777, 19.0760], Pune: [73.8567, 18.5204], Hyderabad: [78.4867, 17.3850],
  Bengaluru: [77.5946, 12.9716], Chennai: [80.2707, 13.0827],
};
function indiaMap() {
  const proj = d3.geoMercator().fitExtent([[0, 300], [W, 1760]], { type: 'MultiPoint', coordinates: [[68.6, 6.6], [89.6, 31.2]] })
    .clipExtent([[-20, -20], [W + 20, H + 20]]);
  const gp = d3.geoPath(proj), P = n => proj(CITY[n]);
  const land = gp(LAND);
  // three branches, all converging on Chennai: NCR -> Hyderabad, Mumbai -> Pune -> Hyderabad, Hyderabad -> Chennai, Bengaluru -> Chennai
  const legs = [['New Delhi', 'Hyderabad', 0.08], ['Mumbai', 'Pune', 0.2], ['Pune', 'Hyderabad', -0.08], ['Hyderabad', 'Chennai', -0.08], ['Bengaluru', 'Chennai', 0.16]];
  let routes = '';
  for (const [a, b, bend] of legs) routes += route(P(a), P(b), { bend, width: 9 });
  const lab = (n, dx, dy, anchor = 'start', size = 30, weight = 600) => { const [x, y] = P(n);
    return `<text x="${x + dx}" y="${y + dy}" text-anchor="${anchor}" font-family="Inter" font-weight="${weight}" font-size="${size}" fill="#fff" stroke="${C.navy}" stroke-width="7" paint-order="stroke" stroke-linejoin="round">${n}</text>`; };
  const dot = n => { const [x, y] = P(n); return `<circle cx="${x}" cy="${y}" r="11" fill="#fff" stroke="${C.navy}" stroke-width="4"/>`; };
  // NCR cluster: three cities ~25 km apart, shown in a magnified inset so none overlap
  const [dx, dy] = P('New Delhi'), ins = { x: 790, y: 600, r: 170, k: 7 };
  const ang = Math.atan2(dy - ins.y, dx - ins.x), ex = ins.x + Math.cos(ang) * ins.r, ey = ins.y + Math.sin(ang) * ins.r;
  const ip = n => { const [x, y] = P(n); return [ins.x + (x - dx) * ins.k, ins.y + (y - dy) * ins.k]; };
  const iDot = n => { const [x, y] = ip(n); return `<circle cx="${x}" cy="${y}" r="10" fill="#fff" stroke="${C.navy}" stroke-width="4"/>`; };
  const iLab = (n, ox, oy, a) => { const [x, y] = ip(n); return `<text x="${x + ox}" y="${y + oy}" text-anchor="${a}" font-family="Inter" font-weight="600" font-size="25" fill="#fff" stroke="${C.navy}" stroke-width="6" paint-order="stroke">${n}</text>`; };
  const inset = `<line x1="${dx}" y1="${dy}" x2="${ex}" y2="${ey}" stroke="#fff" stroke-width="2" opacity=".7"/>
  <circle cx="${dx}" cy="${dy}" r="16" fill="none" stroke="#fff" stroke-width="2.5"/>
  <circle cx="${ins.x}" cy="${ins.y}" r="${ins.r}" fill="#2C5168" stroke="#fff" stroke-width="2.5"/>
  ${route(ip('Gurugram'), ip('New Delhi'), { bend: 0.1, width: 6 })}${route(ip('New Delhi'), ip('Noida'), { bend: 0.1, width: 6 })}
  ${iDot('Gurugram')}${iDot('New Delhi')}${iDot('Noida')}
  ${iLab('New Delhi', 0, -24, 'middle')}${iLab('Gurugram', -6, 40, 'middle')}${iLab('Noida', 6, 40, 'middle')}
  <text x="${ins.x}" y="${ins.y - ins.r - 16}" text-anchor="middle" font-family="Inter" font-weight="700" font-size="20" letter-spacing="3" fill="#9FC0D3">DELHI NCR</text>`;
  const [cx, cy] = P('Chennai'), [bx, by] = P('Bengaluru');
  const c = ctrl(P('Hyderabad'), P('Chennai'), -0.08), tp = qpt(P('Hyderabad'), c, P('Chennai'), 0.3);
  const svg = `<svg width="${W}" height="${H}">
  <defs><linearGradient id="topfade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.navy}"/><stop offset=".5" stop-color="${C.navy}" stop-opacity=".9"/><stop offset="1" stop-color="${C.navy}" stop-opacity="0"/></linearGradient>
  <radialGradient id="sea" cx=".55" cy=".55" r=".8"><stop offset="0" stop-color="#103250"/><stop offset="1" stop-color="#081526"/></radialGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#sea)"/>
  <path d="${land}" fill="#2C5168" stroke="#8DB4C8" stroke-width="1.6" stroke-linejoin="round"/>
  <rect width="${W}" height="420" fill="url(#topfade)"/>
  ${routes}
  ${['Mumbai', 'Pune', 'Hyderabad', 'Bengaluru'].map(dot).join('')}
  ${lab('Mumbai', -22, -14, 'end')}${lab('Pune', -22, 40, 'end')}${lab('Hyderabad', 24, -16)}${lab('Bengaluru', -22, 34, 'end')}
  ${inset}
  <circle cx="${cx}" cy="${cy}" r="88" fill="none" stroke="${C.route}" stroke-width="3" opacity=".25"/>
  <circle cx="${cx}" cy="${cy}" r="60" fill="none" stroke="${C.route}" stroke-width="4" opacity=".5"/>
  <circle cx="${cx}" cy="${cy}" r="34" fill="none" stroke="${C.route}" stroke-width="5" opacity=".9"/>
  ${spark(cx, cy, 30)}
  ${lab('Chennai', 46, 56, 'start', 38, 800)}
  </svg>`;
  return { svg, tilo: tilo({ at: tp, scale: 0.075, rotate: 30 }) };
}
function chennaiFallback() { // stand-in only: warm aerial tones, beach and sea on the right as in the plate
  return `<div class="abs" style="background:linear-gradient(90deg,#7C7A63 0%,#8F8A70 55%,#9C8F6E 66%,#E2C58E 67%,#E8CD97 77%,#F3F1EA 78.5%,#3F8C99 80%,#2B6E82 100%)"></div>
  <div class="abs" style="background:repeating-linear-gradient(0deg,rgba(255,255,255,.05) 0 22px,transparent 22px 60px),repeating-linear-gradient(90deg,rgba(0,0,0,.06) 0 30px,transparent 30px 74px);width:66%"></div>`;
}
// ---------- the ten shots ----------
const BG_CHENNAI_SOFT = (warm = 0) => { const p = plate('p04', `<div class="abs" style="background:linear-gradient(#1A2A33,#0E1A22)"></div>`);
  return `<div class="abs" style="filter:blur(26px) brightness(.5) saturate(.9);transform:scale(1.08)">${p.html}</div>${warm ? `<div class="abs" style="background:radial-gradient(circle at 50% 45%,rgba(255,170,60,${0.22 * warm}),rgba(40,20,10,${0.25 * warm}) 75%)"></div>` : ''}`; };

const shots = {
  '01': clean => { const p = plate('p01', fb01);
    return page(`${p.html}
      ${tilo({ anchor: A.pupil, at: [430, 930], scale: 3.1 })}
      <svg width="${W}" height="${H}">${spark(457, 905, 18, { glow: 1.3 })}${spark(1040, 820, 9, { glow: .6 })}</svg>
      <div class="abs" style="background:radial-gradient(circle at 45% 55%,transparent 55%,rgba(20,15,10,.28))"></div>
      ${clean ? '' : copy('Something’s hiding.')}${previewTag(p)}`); },
  '02': clean => { const p = plate('p02', fb02);
    return page(`${p.html}${tilo({ at: [560, 640], scale: 0.36, variant: 'lines', rotate: -3 })}
      ${clean ? '' : copy('Tilo’s on the trail.')}${previewTag(p)}`); },
  '03': () => { const m = indiaMap(); return page(`${m.svg}${m.tilo}${copy('8 cities. One Spark.')}`); },
  '04': clean => { const p = plate('p04', chennaiFallback());
    return page(`${p.html}<div class="abs" style="background:radial-gradient(circle at 50% 56%,transparent 30%,rgba(10,14,20,.35) 85%)"></div>
      <svg width="${W}" height="${H}">${taper([-40, 1960], [540, 1080], { bend: -0.16, w0: 46, w1: 10 })}${marker(540, 1080, 1.5)}</svg>
      ${tilo({ at: [300, 760], scale: 0.2, rotate: 14 })}
      ${clean ? '' : copy('Let’s go to Chennai.')}${previewTag(p)}`); },
  '05': () => page(`${BG_CHENNAI_SOFT()}<div class="card">${gameSlot('05_map.png', 'ORIGINAL GAME CAPTURE', 'Tilo Tour · Chennai map<br>supplied screenshot, unaltered')}
      <svg width="700" height="1244">${route([350, 700], [500, 360], { bend: -0.22, width: 8 })}<circle cx="500" cy="360" r="26" fill="none" stroke="${C.route}" stroke-width="5"/></svg>
      ${tilo({ at: [330, 720], scale: 0.075, rotate: -28 })}</div>${copy('Explore with Tilo.')}`),
  '06': () => page(`${BG_CHENNAI_SOFT()}
      <div class="card" style="transform:scale(.9) translateY(-40px);opacity:.45;filter:blur(2px)">${gameSlot('05_map.png', 'ORIGINAL GAME CAPTURE', 'map (receding)')}</div>
      <div class="card">${gameSlot('06_space.png', 'ORIGINAL GAME UI', 'Workspace detail card + photo<br>supplied capture, unaltered<br>no added copy or claims')}</div>
      ${copy('Real spaces.<br>Real possibilities.')}`),
  '07': () => page(`${BG_CHENNAI_SOFT()}<div class="card">${gameSlot('05_map.png', 'ORIGINAL GAME CAPTURE', 'Tilo Tour · Chennai map')}
      <svg width="700" height="1244"><defs>
        <filter id="fog" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".0045 .007" numOctaves="5" seed="11"/>
          <feColorMatrix values="0 0 0 0 .9  0 0 0 0 .92  0 0 0 0 .94  0 0 0 1.6 -.32"/></filter>
        <radialGradient id="fogmask"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff"/></radialGradient>
        <mask id="m7"><rect width="700" height="1244" fill="url(#fogmask)"/></mask></defs>
        ${route([350, 700], [500, 360], { bend: -0.22, width: 8 })}
        <rect width="700" height="1244" fill="#DDE2E6" opacity=".42"/>
        <rect width="700" height="1244" filter="url(#fog)" mask="url(#m7)"/>
        ${route([350, 700], [500, 360], { bend: -0.22, width: 8, opacity: .28 })}
        ${spark(500, 360, 44, { glow: 1.4 })}</svg>
      ${tilo({ at: [380, 600], scale: 0.075, rotate: -28 })}</div>${copy('The Spark is close.')}`),
  '08': () => page(`${BG_CHENNAI_SOFT(1)}<div class="card">${gameSlot('05_map.png', 'ORIGINAL GAME CAPTURE', 'Tilo Tour · Chennai map')}
      <svg width="700" height="1244"><defs>
        <filter id="fog8"><feTurbulence type="fractalNoise" baseFrequency=".0045 .007" numOctaves="5" seed="11"/><feColorMatrix values="0 0 0 0 .9  0 0 0 0 .92  0 0 0 0 .94  0 0 0 1.6 -.32"/></filter>
        <radialGradient id="clear" cx="500" cy="360" r="900" gradientUnits="userSpaceOnUse"><stop offset=".55" stop-color="#000"/><stop offset=".85" stop-color="#fff"/></radialGradient>
        <mask id="m8"><rect width="700" height="1244" fill="url(#clear)"/></mask>
        <radialGradient id="warm" cx="500" cy="360" r="1000" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFB547" stop-opacity=".22"/><stop offset="1" stop-color="#7A3A10" stop-opacity=".18"/></radialGradient></defs>
        ${route([350, 700], [500, 360], { bend: -0.22, width: 8 })}
        <rect width="700" height="1244" fill="url(#warm)"/>
        <rect width="700" height="1244" filter="url(#fog8)" mask="url(#m8)"/>
        ${spark(500, 360, 70, { glow: 1.6, ring: 150 })}</svg>
      ${tilo({ at: [400, 430], scale: 0.075, rotate: -10 })}</div>${copy('Found it.', 'Light up Diwali.')}`),
  '09': () => page(`${BG_CHENNAI_SOFT(1)}<div class="card" style="filter:blur(10px);opacity:.6">${gameSlot('05_map.png', '', '')}</div>
      <div class="abs" style="background:rgba(6,10,18,.55)"></div>
      <div style="position:absolute;left:90px;top:470px;width:900px;height:1090px;border-radius:48px;background:#fff;box-shadow:0 40px 100px rgba(0,0,0,.5)"></div>
      ${tilo({ at: [540, 470], scale: 0.17 })}
      <div style="position:absolute;left:90px;top:640px;width:900px;text-align:center;color:${C.ink}">
        <div style="font:900 64px Inter;letter-spacing:-.02em">YOU FOUND THE SPARK!</div>
        <div style="font:500 36px Inter;color:#59626B;margin-top:14px">Scratch to reveal.</div></div>
      <svg width="${W}" height="${H}"><defs>
        <linearGradient id="gp" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFE08A"/><stop offset=".45" stop-color="#F4B740"/><stop offset="1" stop-color="#D99522"/></linearGradient>
        <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="3"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .22 0"/></filter>
        <clipPath id="panel"><rect x="160" y="850" width="760" height="420" rx="30"/></clipPath>
        <mask id="scratch"><rect x="160" y="850" width="760" height="420" fill="#fff"/>
          <path d="M300,1150 C380,1060 470,1150 560,1040 S700,1010 760,960" fill="none" stroke="#000" stroke-width="78" stroke-linecap="round"/></mask></defs>
        <rect x="160" y="850" width="760" height="420" rx="30" fill="#FFF7E6"/>
        <g clip-path="url(#panel)" mask="url(#scratch)">
          <rect x="160" y="850" width="760" height="420" fill="url(#gp)"/><rect x="160" y="850" width="760" height="420" filter="url(#grain)"/>
          <g opacity=".22">${spark(540, 1060, 120, { glow: 0 })}</g></g>
        <rect x="160" y="850" width="760" height="420" rx="30" fill="none" stroke="#C88A1E" stroke-width="3"/>
        <circle cx="760" cy="960" r="40" fill="#fff" opacity=".85" stroke="#ccc" stroke-width="2"/><circle cx="760" cy="960" r="54" fill="none" stroke="#fff" stroke-width="3" opacity=".5"/></svg>
      <div style="position:absolute;left:90px;top:1300px;width:900px;text-align:center;font:600 34px Inter;color:#2A3138">Amazon voucher · ₹500–₹5,000</div>
      <img src="${url('assets/gofloaters_logo.png')}" style="position:absolute;left:345px;top:1400px;width:390px">`),
  '10': () => { const p = plate('p10', fb10);
    return page(`${p.html}<div class="abs" style="background:linear-gradient(rgba(4,8,24,.35),rgba(4,8,24,0) 60%)"></div>
      <div style="position:absolute;left:90px;top:240px;width:900px;height:330px;border-radius:40px;background:#fff;box-shadow:0 24px 70px rgba(0,0,0,.4)"></div>
      <img src="${url('assets/gofloaters_logo.png')}" style="position:absolute;left:115px;top:265px;width:850px">
      <div style="position:absolute;left:0;top:660px;width:${W}px;text-align:center;color:#fff;text-shadow:0 2px 24px rgba(0,0,0,.4)">
        <div style="font:900 96px Inter;line-height:1.02;letter-spacing:-.02em">FIND THE <span style="color:${C.gold}">SPARK.</span><br>LIGHT UP DIWALI.</div>
        <div style="font:700 40px Inter;letter-spacing:.14em;margin-top:34px;opacity:.88">3 GAME DAYS · 8 CITIES</div></div>
      <div style="position:absolute;left:260px;top:1150px;width:560px;height:124px;border-radius:62px;background:${C.route};box-shadow:0 14px 40px rgba(24,179,106,.35);display:flex;align-items:center;justify-content:center;font:800 50px Inter;letter-spacing:.06em;color:#fff">PLAY NOW</div>
      ${previewTag(p)}`); },
};

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const only = process.argv.slice(2);
  const b = await chromium.launch(), pg = await b.newPage({ viewport: { width: W, height: H } });
  const jobs = [];
  for (const k of Object.keys(shots)) { jobs.push([k, false]); if (['01', '02', '04'].includes(k)) jobs.push([k, true]); }
  for (const [k, clean] of jobs) {
    if (only.length && !only.includes(k)) continue;
    const name = `shot${k}${clean ? '_higgsfield_source_clean' : ''}`, html = path.join(OUT, name + '.html');
    fs.writeFileSync(html, shots[k](clean));
    await pg.goto('file://' + html); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(250);
    await pg.screenshot({ path: path.join(OUT, name + '.png') }); console.log('rendered', name);
  }
  await b.close();
})();
