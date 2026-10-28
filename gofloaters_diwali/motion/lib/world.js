// World layers: sky, clouds, urban plates, fog, the Spark, Diwali light,
// and the footage slots for the real GoFloaters game and workspace photos.
(function () {
  const { W, H, canvas, rng, clamp, lerp, ease, prog, noise1, images, clipFrame, FONT } = GF;
  const TAU = Math.PI * 2;

  // ---------------------------------------------------------------- sky
  function sky(ctx, stops) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    stops.forEach(([o, c]) => g.addColorStop(o, c));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  // -------------------------------------------------------------- clouds
  const cloudSprites = [];
  function buildClouds() {
    for (let k = 0; k < 7; k++) {
      const r = rng(100 + k);
      const w = 900, h = 520;
      const c = canvas(w, h), g = c.getContext("2d");
      const puffs = 34 + Math.floor(r() * 18);
      for (let i = 0; i < puffs; i++) {
        const u = r();
        const x = w * (0.18 + 0.64 * u);
        const top = Math.sin(u * Math.PI);
        const y = h * (0.62 - 0.32 * top * r());
        const rad = (60 + r() * 120) * (0.55 + 0.45 * top);
        const gr = g.createRadialGradient(x, y - rad * 0.2, 0, x, y, rad);
        gr.addColorStop(0, "rgba(255,255,255,0.95)");
        gr.addColorStop(0.55, "rgba(250,252,255,0.75)");
        gr.addColorStop(1, "rgba(235,242,250,0)");
        g.fillStyle = gr;
        g.beginPath(); g.arc(x, y, rad, 0, TAU); g.fill();
      }
      // cool shade on the underside
      g.globalCompositeOperation = "source-atop";
      const sh = g.createLinearGradient(0, h * 0.35, 0, h);
      sh.addColorStop(0, "rgba(160,185,215,0)");
      sh.addColorStop(1, "rgba(140,165,200,0.55)");
      g.fillStyle = sh;
      g.fillRect(0, 0, w, h);
      cloudSprites.push(c);
    }
  }
  function cloud(ctx, k, x, y, s, a = 1) {
    if (!cloudSprites.length) buildClouds();
    const c = cloudSprites[k % cloudSprites.length];
    ctx.save();
    ctx.globalAlpha = a;
    ctx.drawImage(c, x - (c.width * s) / 2, y - (c.height * s) / 2, c.width * s, c.height * s);
    ctx.restore();
  }

  // -------------------------------------------------------- urban plates
  // Three procedurally built Indian urban environments, each pre-rendered as
  // depth layers (far / mid / near) wider than the frame for parallax travel.
  const PW = 3000;
  const plates = {};

  function towerGlass(g, x, base, w, h, r, tint) {
    const gr = g.createLinearGradient(x, base - h, x + w, base);
    gr.addColorStop(0, tint[0]); gr.addColorStop(1, tint[1]);
    g.fillStyle = gr;
    const cap = r() < 0.3 ? h * 0.06 : 0;
    g.beginPath();
    g.moveTo(x, base); g.lineTo(x, base - h + cap); g.lineTo(x + w * 0.5, base - h); g.lineTo(x + w, base - h + cap * (r() < 0.5 ? 1 : 0)); g.lineTo(x + w, base);
    g.fill();
    // mullions and floor bands
    g.strokeStyle = "rgba(255,255,255,0.10)"; g.lineWidth = 2;
    for (let fx = x + 14; fx < x + w; fx += 16 + Math.floor(r() * 8)) { g.beginPath(); g.moveTo(fx, base - h + cap + 6); g.lineTo(fx, base); g.stroke(); }
    g.strokeStyle = "rgba(20,40,60,0.18)";
    for (let fy = base - h + cap + 20; fy < base; fy += 22) { g.beginPath(); g.moveTo(x, fy); g.lineTo(x + w, fy); g.stroke(); }
    // sky reflection sheen
    const sh = g.createLinearGradient(x, 0, x + w, 0);
    sh.addColorStop(0, "rgba(255,255,255,0)"); sh.addColorStop(0.65, "rgba(255,255,255,0.16)"); sh.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = sh; g.fillRect(x, base - h + cap, w, h - cap);
  }

  function blockBuilding(g, x, base, w, h, r, facade, lit) {
    g.fillStyle = facade;
    g.fillRect(x, base - h, w, h);
    // parapet + shade
    g.fillStyle = "rgba(0,0,0,0.12)"; g.fillRect(x, base - h, w, 10);
    g.fillStyle = "rgba(0,0,0,0.10)"; g.fillRect(x + w * 0.82, base - h, w * 0.18, h);
    const cols = Math.max(2, Math.floor(w / 46)), rows = Math.max(2, Math.floor(h / 70));
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
      const wx = x + 14 + i * ((w - 28) / cols), wy = base - h + 30 + j * ((h - 50) / rows);
      const on = lit && r() < lit;
      g.fillStyle = on ? `rgba(255,236,196,${0.65 + r() * 0.3})` : "rgba(40,30,30,0.35)";
      g.fillRect(wx, wy, (w - 28) / cols - 14, 28);
      if (!lit && r() < 0.5) { g.fillStyle = "rgba(0,0,0,0.18)"; g.fillRect(wx - 4, wy + 30, (w - 28) / cols - 6, 5); }
    }
    // rooftop water tanks and a stair head
    if (r() < 0.75) {
      const n = 1 + Math.floor(r() * 3);
      for (let k = 0; k < n; k++) {
        const tx = x + 16 + r() * (w - 60), tw = 26 + r() * 10, th = 30 + r() * 10;
        g.fillStyle = lit ? "#151821" : "#2a2a2c";
        g.fillRect(tx, base - h - th, tw, th);
        g.beginPath(); g.ellipse(tx + tw / 2, base - h - th, tw / 2, 5, 0, 0, TAU); g.fill();
      }
    }
    if (r() < 0.4) { g.fillStyle = facade; g.fillRect(x + w * 0.15, base - h - 44, w * 0.25, 44); }
  }

  function trees(g, x0, x1, base, r, col) {
    for (let x = x0; x < x1; x += 30 + r() * 50) {
      const rad = 30 + r() * 46;
      g.fillStyle = col;
      g.beginPath(); g.arc(x, base - rad * 0.6, rad, 0, TAU); g.fill();
      g.beginPath(); g.arc(x + rad * 0.6, base - rad * 0.4, rad * 0.8, 0, TAU); g.fill();
    }
  }

  function buildPlate(kind) {
    const r = rng({ day: 11, street: 23, work: 37, dusk: 51 }[kind]);
    const L = { far: canvas(PW, H), mid: canvas(PW, H), near: canvas(PW, H) };
    const f = L.far.getContext("2d"), m = L.mid.getContext("2d"), n = L.near.getContext("2d");
    if (kind === "day") {
      const hz = 1380;
      for (let x = -40; x < PW; x += 50 + r() * 70) {
        const w = 60 + r() * 90, h = 220 + r() * 480;
        f.fillStyle = `rgba(150,180,200,${0.55 + r() * 0.2})`; f.fillRect(x, hz - h, w, h + 20);
      }
      for (let x = -40; x < PW; x += 120 + r() * 160) {
        const w = 130 + r() * 120, h = 520 + r() * 640;
        towerGlass(m, x, hz + 60, w, h, r, r() < 0.5 ? ["#5f86a6", "#a8c6da"] : ["#6c8c9a", "#bcd2dc"]);
      }
      trees(m, 0, PW, hz + 110, r, "#4c6e45");
      m.fillStyle = "#6d7378"; m.fillRect(0, hz + 100, PW, H);
      for (let x = 0; x < PW; x += 420 + r() * 380) {
        const w = 190 + r() * 120, h = 1100 + r() * 420;
        towerGlass(n, x, H + 40, w, h, r, ["#2f4a60", "#5d7f98"]);
      }
    } else if (kind === "street") {
      const hz = 1300;
      for (let x = -40; x < PW; x += 40 + r() * 60) {
        const w = 70 + r() * 80, h = 140 + r() * 300;
        f.fillStyle = `rgba(190,140,110,${0.45 + r() * 0.2})`; f.fillRect(x, hz - h, w, h + 40);
      }
      const facades = ["#c98f6b", "#d9b48a", "#b97a63", "#e1c9a2", "#a7836b", "#c7a27c", "#d39c7a"];
      for (let x = -20; x < PW; x += 150 + r() * 70) {
        const w = 140 + r() * 80, h = 300 + r() * 420;
        blockBuilding(m, x, hz + 140, w, h, r, facades[Math.floor(r() * facades.length)], 0);
      }
      m.fillStyle = "#5b4e48"; m.fillRect(0, hz + 140, PW, H);
      // elevated metro viaduct
      n.fillStyle = "#8c8781"; n.fillRect(0, 1180, PW, 70);
      n.fillStyle = "rgba(0,0,0,0.22)"; n.fillRect(0, 1240, PW, 14);
      n.fillStyle = "#a29d96"; n.fillRect(0, 1170, PW, 14);
      for (let x = 120; x < PW; x += 420) {
        n.fillStyle = "#8f8a83"; n.fillRect(x, 1250, 64, H - 1250);
        n.fillStyle = "#7e7972"; n.beginPath(); n.moveTo(x - 50, 1250); n.lineTo(x + 114, 1250); n.lineTo(x + 64, 1300); n.lineTo(x, 1300); n.fill();
      }
      // overhead wires
      n.strokeStyle = "rgba(30,24,22,0.55)"; n.lineWidth = 2.5;
      for (let k = 0; k < 3; k++) {
        n.beginPath();
        for (let x = 0; x <= PW; x += 20) n.lineTo(x, 420 + k * 34 + Math.pow(Math.sin(((x % 700) / 700) * Math.PI), 1) * 70);
        n.stroke();
      }
    } else if (kind === "work") {
      const hz = 1250;
      for (let x = -40; x < PW; x += 60 + r() * 80) {
        const w = 70 + r() * 110, h = 260 + r() * 640;
        f.fillStyle = "#1e2742"; f.fillRect(x, hz - h, w, h + 400);
        for (let wy = hz - h + 16; wy < hz; wy += 22) for (let wx = x + 8; wx < x + w - 10; wx += 18)
          if (r() < 0.35) { f.fillStyle = `rgba(255,232,190,${0.4 + r() * 0.5})`; f.fillRect(wx, wy, 8, 10); }
      }
      // interior: window mullions, ceiling, floor, desks, pendants
      m.fillStyle = "#16181f"; m.fillRect(0, 0, PW, 300);
      m.fillStyle = "#1c1b20"; m.fillRect(0, 1460, PW, H);
      const fl = m.createLinearGradient(0, 1460, 0, H);
      fl.addColorStop(0, "rgba(255,190,140,0.10)"); fl.addColorStop(1, "rgba(0,0,0,0)");
      m.fillStyle = fl; m.fillRect(0, 1460, PW, H);
      for (let x = 0; x < PW; x += 300) { m.fillStyle = "#12141a"; m.fillRect(x, 300, 24, 1160); }
      m.fillStyle = "#12141a"; m.fillRect(0, 430, PW, 14); m.fillRect(0, 1440, PW, 26);
      for (let x = 80; x < PW; x += 520) {
        n.fillStyle = "#24232a"; n.fillRect(x, 1560, 380, 30);
        n.fillStyle = "#1b1a20"; n.fillRect(x + 20, 1590, 16, 200); n.fillRect(x + 344, 1590, 16, 200);
        for (const lx of [x + 70, x + 250]) {
          n.fillStyle = "#2f2e36"; n.fillRect(lx, 1506, 80, 54);
          n.fillStyle = "rgba(200,225,255,0.55)"; n.fillRect(lx + 6, 1512, 68, 40);
          n.fillStyle = "#17161b"; n.beginPath(); n.ellipse(lx + 40, 1700, 46, 70, 0, 0, TAU); n.fill();
        }
        const px = x + 190;
        n.strokeStyle = "#0e0e12"; n.lineWidth = 3; n.beginPath(); n.moveTo(px, 300); n.lineTo(px, 560); n.stroke();
        n.fillStyle = "#0e0e12"; n.beginPath(); n.moveTo(px - 50, 600); n.lineTo(px + 50, 600); n.lineTo(px + 18, 560); n.lineTo(px - 18, 560); n.fill();
        const gl = n.createRadialGradient(px, 610, 0, px, 610, 170);
        gl.addColorStop(0, "rgba(255,236,205,0.55)"); gl.addColorStop(1, "rgba(255,236,205,0)");
        n.fillStyle = gl; n.fillRect(px - 170, 440, 340, 340);
      }
      for (let x = 400; x < PW; x += 1040) {
        n.fillStyle = "#16201a";
        for (let k = 0; k < 9; k++) { n.beginPath(); n.ellipse(x + Math.sin(k) * 40, 1380 + k * 12, 70, 22, -0.6 + k * 0.15, 0, TAU); n.fill(); }
        n.fillStyle = "#2a2522"; n.fillRect(x - 40, 1440, 80, 130);
      }
    } else if (kind === "dusk") {
      const hz = 1520;
      for (let x = -40; x < PW; x += 60 + r() * 90) {
        const w = 80 + r() * 120, h = 240 + r() * 620;
        f.fillStyle = "#22284a"; f.fillRect(x, hz - h, w, h + 500);
        for (let wy = hz - h + 18; wy < hz; wy += 24) for (let wx = x + 8; wx < x + w - 10; wx += 20)
          if (r() < 0.28) { f.fillStyle = `rgba(255,236,200,${0.35 + r() * 0.45})`; f.fillRect(wx, wy, 8, 11); }
      }
      for (let x = -20; x < PW; x += 170 + r() * 90) {
        const w = 150 + r() * 90, h = 260 + r() * 330;
        blockBuilding(m, x, H, w, h + (H - hz), r, "#1a1e36", 0.32);
      }
    }
    plates[kind] = L;
    return L;
  }

  // scroll: px of travel (camera moving right), depth parallax far .25 / mid .6 / near 1.1
  function urbanPlate(ctx, kind, scroll, t) {
    const L = plates[kind] || buildPlate(kind);
    if (kind === "day") sky(ctx, [[0, "#6fb3e6"], [0.55, "#bfe0f2"], [0.72, "#e5f1f4"], [1, "#e0e6e2"]]);
    if (kind === "street") sky(ctx, [[0, "#d98e5c"], [0.45, "#f4c08a"], [0.68, "#fbe2b8"], [1, "#e9c9a0"]]);
    if (kind === "work") sky(ctx, [[0, "#253766"], [0.4, "#5a5f92"], [0.62, "#e38c6c"], [0.7, "#f2b07c"], [1, "#2a2230"]]);
    if (kind === "dusk") sky(ctx, [[0, "#141a3f"], [0.38, "#2b2f66"], [0.66, "#7b4a78"], [0.8, "#e0866a"], [1, "#2a1f2e"]]);
    const off = (k) => -((scroll * k) % (PW - W));
    ctx.drawImage(L.far, off(0.25), 0);
    // atmospheric haze between depth layers
    const hz = ctx.createLinearGradient(0, 600, 0, 1500);
    const hazeCol = { day: "220,236,244", street: "251,220,175", work: "230,140,110", dusk: "160,90,120" }[kind];
    hz.addColorStop(0, `rgba(${hazeCol},0)`); hz.addColorStop(1, `rgba(${hazeCol},0.35)`);
    ctx.fillStyle = hz; ctx.fillRect(0, 0, W, H);
    ctx.drawImage(L.mid, off(0.6), 0);
    ctx.drawImage(L.near, off(1.1), 0);
    if (kind === "street") {
      // low golden sun wash
      const g = ctx.createRadialGradient(W * 0.85, 760, 0, W * 0.85, 760, 900);
      g.addColorStop(0, "rgba(255,214,150,0.45)"); g.addColorStop(1, "rgba(255,214,150,0)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
  }

  // ------------------------------------------------------------------ fog
  let fogTex = null;
  function buildFog() {
    const w = 320, h = 560, c = canvas(w, h), g = c.getContext("2d");
    const d = g.createImageData(w, h);
    const r = rng(77);
    const grid = (n) => Array.from({ length: (n + 2) * (n + 2) }, () => r());
    const octaves = [[6, 0.5], [12, 0.25], [24, 0.15], [48, 0.1]].map(([n, a]) => [n, a, grid(n)]);
    const sample = (gr, n, x, y) => {
      const gx = x * n, gy = y * n, i = Math.floor(gx), j = Math.floor(gy), fx = gx - i, fy = gy - j;
      const v = (a, b) => gr[(b % n) * (n + 2) + (a % n)]; // period n: the texture tiles seamlessly
      const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
      return lerp(lerp(v(i, j), v(i + 1, j), sx), lerp(v(i, j + 1), v(i + 1, j + 1), sx), sy);
    };
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      let v = 0;
      for (const [n, a, gr] of octaves) v += a * sample(gr, n, x / w, y / h);
      v = clamp((v - 0.32) * 1.9);
      const i = (y * w + x) * 4;
      d.data[i] = 214; d.data[i + 1] = 222; d.data[i + 2] = 230; d.data[i + 3] = Math.round(v * 255);
    }
    g.putImageData(d, 0, 0);
    fogTex = c;
  }
  const fogBuf = { c: null };
  // density 0..1, edge: 0 = only edges fogged, 1 = whole frame;
  // clear: {x, y, r} radial hole for the reveal
  function fog(ctx, t, density, edge, clear) {
    if (density <= 0) return;
    if (!fogTex) buildFog();
    if (!fogBuf.c) fogBuf.c = canvas(W / 2, H / 2);
    const g = fogBuf.c.getContext("2d"), w = W / 2, h = H / 2;
    g.globalCompositeOperation = "source-over";
    g.clearRect(0, 0, w, h);
    const layer = (sx, sy, sc, a) => {
      g.globalAlpha = a;
      const tw = w * sc, th = h * sc;
      const ox = ((sx % tw) + tw) % tw, oy = ((sy % th) + th) % th;
      for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) g.drawImage(fogTex, ox + i * tw - tw / 2, oy + j * th - th / 2, tw, th);
    };
    layer(t * 14, t * 4, 1.25, 1);
    layer(-t * 22 + 140, t * -6 + 300, 0.85, 0.85);
    g.globalAlpha = 1;
    // edge-in mask: clear ellipse in the middle that closes as `edge` rises
    g.globalCompositeOperation = "destination-in";
    const inner = lerp(0.62, 0.0, edge), outer = lerp(1.05, 0.55, edge);
    const m = g.createRadialGradient(w / 2, h * 0.5, Math.max(1, inner * h * 0.6), w / 2, h * 0.5, outer * h * 0.6 + 1);
    m.addColorStop(0, "rgba(0,0,0,0)");
    m.addColorStop(1, "rgba(0,0,0,1)");
    g.fillStyle = m; g.fillRect(0, 0, w, h);
    if (clear && clear.r > 0) {
      g.globalCompositeOperation = "destination-out";
      const cx = clear.x / 2, cy = clear.y / 2, cr = clear.r / 2;
      const cm = g.createRadialGradient(cx, cy, cr * 0.55, cx, cy, cr);
      cm.addColorStop(0, "rgba(0,0,0,1)"); cm.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = cm; g.fillRect(0, 0, w, h);
    }
    ctx.save();
    ctx.globalAlpha = density;
    ctx.drawImage(fogBuf.c, 0, 0, W, H);
    ctx.restore();
  }

  // ----------------------------------------------------------------- Spark
  const GOLD = "#F4B740", GOLD_LIGHT = "#FFE3A1";
  function spark(ctx, x, y, size, intensity, t) {
    if (intensity <= 0) return;
    ctx.save();
    ctx.translate(x, y);
    const glowR = size * (3.2 + intensity * 2.2);
    const gl = ctx.createRadialGradient(0, 0, 0, 0, 0, glowR);
    gl.addColorStop(0, `rgba(255,227,161,${0.55 * intensity})`);
    gl.addColorStop(0.35, `rgba(244,183,64,${0.22 * intensity})`);
    gl.addColorStop(1, "rgba(244,183,64,0)");
    ctx.fillStyle = gl;
    ctx.fillRect(-glowR, -glowR, glowR * 2, glowR * 2);
    const tw = 1 + 0.08 * Math.sin(t * 9) + 0.05 * Math.sin(t * 23);
    ctx.rotate(Math.sin(t * 1.3) * 0.12);
    ctx.scale(tw, tw);
    // cross flares
    ctx.globalAlpha = clamp(intensity);
    for (const [a, len] of [[0, 2.6], [Math.PI / 2, 2.6], [Math.PI / 4, 1.3], [-Math.PI / 4, 1.3]]) {
      ctx.save(); ctx.rotate(a);
      const fg = ctx.createLinearGradient(-size * len, 0, size * len, 0);
      fg.addColorStop(0, "rgba(255,227,161,0)"); fg.addColorStop(0.5, "rgba(255,248,225,0.9)"); fg.addColorStop(1, "rgba(255,227,161,0)");
      ctx.fillStyle = fg; ctx.fillRect(-size * len, -size * 0.035, size * len * 2, size * 0.07);
      ctx.restore();
    }
    // four-point star core
    const s = size;
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.quadraticCurveTo(s * 0.12, -s * 0.12, s, 0);
    ctx.quadraticCurveTo(s * 0.12, s * 0.12, 0, s);
    ctx.quadraticCurveTo(-s * 0.12, s * 0.12, -s, 0);
    ctx.quadraticCurveTo(-s * 0.12, -s * 0.12, 0, -s);
    const cg = ctx.createRadialGradient(0, 0, 0, 0, 0, s);
    cg.addColorStop(0, "#FFFDF4"); cg.addColorStop(0.35, GOLD_LIGHT); cg.addColorStop(1, GOLD);
    ctx.fillStyle = cg;
    ctx.shadowColor = "rgba(244,183,64,0.9)"; ctx.shadowBlur = s * 0.6;
    ctx.fill();
    ctx.restore();
  }

  // ------------------------------------------------------- Diwali warmth
  function bokeh(ctx, t, amount, seed = 5, n = 12) {
    if (amount <= 0) return;
    const r = rng(seed);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < n; i++) {
      const edge = r() < 0.5 ? r() * 0.22 : 0.78 + r() * 0.22;
      const x = (r() < 0.5 ? edge : r()) * W;
      const y0 = (0.25 + r() * 0.75) * H, sp = 18 + r() * 30;
      const y = y0 - t * sp;
      const rad = 18 + r() * 44;
      const a = amount * (0.1 + r() * 0.18) * (0.75 + 0.25 * Math.sin(t * 2 + i));
      const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
      g.addColorStop(0, `rgba(255,227,161,${a})`); g.addColorStop(0.7, `rgba(244,183,64,${a * 0.5})`); g.addColorStop(1, "rgba(244,183,64,0)");
      ctx.fillStyle = g; ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    ctx.restore();
  }

  function warmth(ctx, a) {
    if (a <= 0) return;
    ctx.save();
    const g = ctx.createRadialGradient(W / 2, H * 0.55, H * 0.2, W / 2, H * 0.55, H * 0.8);
    g.addColorStop(0, `rgba(255,214,140,${0.06 * a})`); g.addColorStop(1, `rgba(214,120,40,${0.28 * a})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  // string lights along a sagging curve (Diwali payoff only)
  function stringLights(ctx, x0, y0, x1, y1, sag, n, t, a, seed = 1) {
    if (a <= 0) return;
    ctx.save();
    ctx.strokeStyle = `rgba(20,16,24,${0.7 * a})`; ctx.lineWidth = 2;
    ctx.beginPath();
    const pt = (u) => [lerp(x0, x1, u), lerp(y0, y1, u) + Math.sin(u * Math.PI) * sag];
    for (let i = 0; i <= 40; i++) { const [x, y] = pt(i / 40); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke();
    ctx.globalCompositeOperation = "lighter";
    for (let i = 1; i < n; i++) {
      const [x, y] = pt(i / n);
      const tw = 0.75 + 0.25 * Math.sin(t * 3 + i * 1.7 + seed);
      const g = ctx.createRadialGradient(x, y + 4, 0, x, y + 4, 22);
      g.addColorStop(0, `rgba(255,240,200,${a * tw})`); g.addColorStop(0.25, `rgba(255,227,161,${0.6 * a * tw})`); g.addColorStop(1, "rgba(244,183,64,0)");
      ctx.fillStyle = g; ctx.fillRect(x - 22, y - 18, 44, 44);
    }
    ctx.restore();
  }

  function diya(ctx, x, y, s, t, a, seed) {
    if (a <= 0) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = `rgba(30,20,22,${a})`;
    ctx.beginPath(); ctx.ellipse(0, 0, 16 * s, 7 * s, 0, 0, Math.PI); ctx.fill();
    const fl = 1 + 0.12 * Math.sin(t * 11 + seed) + 0.06 * Math.sin(t * 27 + seed);
    ctx.globalCompositeOperation = "lighter";
    const g = ctx.createRadialGradient(0, -10 * s, 0, 0, -10 * s, 60 * s);
    g.addColorStop(0, `rgba(255,227,161,${0.55 * a})`); g.addColorStop(1, "rgba(244,183,64,0)");
    ctx.fillStyle = g; ctx.fillRect(-60 * s, -70 * s, 120 * s, 120 * s);
    ctx.fillStyle = `rgba(255,240,205,${a})`;
    ctx.beginPath();
    ctx.moveTo(0, -24 * s * fl); ctx.quadraticCurveTo(6 * s, -8 * s, 0, -2 * s); ctx.quadraticCurveTo(-6 * s, -8 * s, 0, -24 * s * fl);
    ctx.fill();
    ctx.restore();
  }

  function firework(ctx, x, y, p, a, seed = 3) {
    if (p <= 0 || p >= 1 || a <= 0) return;
    const r = rng(seed);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const n = 36, R = 150 * ease.outCubic(p);
    for (let i = 0; i < n; i++) {
      const th = (i / n) * TAU + r() * 0.1, rr = R * (0.85 + r() * 0.15);
      const px = x + Math.cos(th) * rr, py = y + Math.sin(th) * rr + p * p * 40;
      const al = a * (1 - p) * 0.9;
      ctx.fillStyle = `rgba(255,227,161,${al})`;
      ctx.beginPath(); ctx.arc(px, py, 3, 0, TAU); ctx.fill();
      ctx.strokeStyle = `rgba(244,183,64,${al * 0.45})`; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x + Math.cos(th) * rr * 0.72, y + Math.sin(th) * rr * 0.72 + p * p * 30); ctx.stroke();
    }
    ctx.restore();
  }

  // -------------------------------------------------------------- footage
  // cover-fit a frame without distortion (native proportions preserved)
  function drawCover(ctx, img, zoom = 1, fx = 0.5, fy = 0.5) {
    const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
    const s = Math.max(W / iw, H / ih) * zoom;
    const dw = iw * s, dh = ih * s;
    ctx.drawImage(img, (W - dw) * fx, (H - dh) * fy, dw, dh);
  }

  function slotPanel(ctx, title, lines, accent = "#7a8a94") {
    ctx.save();
    ctx.fillStyle = "#dfe5e8";
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(90,110,120,0.10)";
    ctx.lineWidth = 2;
    for (let k = -H; k < W + H; k += 46) { ctx.beginPath(); ctx.moveTo(k, 0); ctx.lineTo(k + H, H); ctx.stroke(); }
    ctx.setLineDash([22, 16]);
    ctx.strokeStyle = accent; ctx.lineWidth = 4;
    ctx.strokeRect(36, 36, W - 72, H - 72);
    ctx.setLineDash([]);
    ctx.fillStyle = "#53636c";
    ctx.textAlign = "center";
    ctx.font = `44px "${FONT.bold}"`;
    ctx.fillText(title, W / 2, H * 0.80);
    ctx.font = `30px "${FONT.semi}"`;
    lines.forEach((l, i) => ctx.fillText(l, W / 2, H * 0.80 + 56 + i * 42));
    ctx.restore();
  }

  // the real game: recording mapped through film-time segments
  let gameBuf = null;
  function game(ctx, filmT, cfg, opt = {}) {
    const seg = cfg.segments.find((s) => filmT >= s.film[0] && filmT < s.film[1]) || cfg.segments[cfg.segments.length - 1];
    const srcT = seg.src + (Math.min(filmT, seg.film[1]) - seg.film[0]) * (seg.rate || 1);
    const img = clipFrame("gameplay", srcT);
    // composite once into a buffer so a filter costs one pass, not one per stroke
    if (!gameBuf) gameBuf = canvas(W, H);
    const g = gameBuf.getContext("2d");
    g.clearRect(0, 0, W, H);
    if (img) drawCover(g, img, opt.zoom || 1);
    else {
      slotPanel(g, "SLOT · REAL GOFLOATERS GAMEPLAY", [
        "Tilo Tour screen recording — not recreated",
        `assets/gameplay/${cfg.file}`,
        `source ${srcT.toFixed(2)} s`,
      ]);
    }
    ctx.save();
    if (opt.filter) ctx.filter = opt.filter;
    ctx.drawImage(gameBuf, 0, 0);
    ctx.restore();
    return !!img;
  }

  function workspacePhoto(ctx, cfg, x, y, w, h, radius, zoom) {
    const img = images.workspace;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
    ctx.clip();
    if (img) {
      const iw = img.naturalWidth, ih = img.naturalHeight;
      const s = Math.max(w / iw, h / ih) * zoom;
      ctx.drawImage(img, x + (w - iw * s) / 2, y + (h - ih * s) / 2, iw * s, ih * s);
    } else {
      ctx.translate(x, y);
      ctx.scale(w / W, h / H);
      slotPanel(ctx, "SLOT · REAL WORKSPACE PHOTO", [
        "genuine listing photograph — no invented details",
        `assets/workspaces/${cfg.file}`,
      ], "#18B36A");
    }
    ctx.restore();
  }

  GF.World = {
    sky, cloud, buildClouds, urbanPlate, buildPlate, fog, buildFog, spark, bokeh, warmth,
    stringLights, diya, firework, game, workspacePhoto, drawCover, slotPanel, GOLD, GOLD_LIGHT,
  };
})();
