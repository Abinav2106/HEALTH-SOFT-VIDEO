// Core of the motion composition: timing, easing, randomness, assets, text.
// Everything is a pure function of time so any frame can be rendered alone.
(function () {
  const W = 1080, H = 1920, FPS = 30, DURATION = 40;

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  // progress of t through [a, b], clamped to 0..1
  const prog = (t, a, b) => clamp((t - a) / (b - a));
  const smooth = (t) => t * t * (3 - 2 * t);

  const ease = {
    linear: (t) => t,
    inCubic: (t) => t * t * t,
    outCubic: (t) => 1 - Math.pow(1 - t, 3),
    inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    outQuint: (t) => 1 - Math.pow(1 - t, 5),
    inQuint: (t) => t * t * t * t * t,
    inOutQuint: (t) => (t < 0.5 ? 16 * t ** 5 : 1 - Math.pow(-2 * t + 2, 5) / 2),
    outExpo: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    inExpo: (t) => (t === 0 ? 0 : Math.pow(2, 10 * t - 10)),
    inOutExpo: (t) =>
      t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2,
    // subtle overshoot only; s = 1.2 reads as designed rather than bouncy
    outBack: (t, s = 1.2) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2),
  };

  // damped spring impulse: 0 at t<=0, peaks then settles to 0
  const spring = (t, freq = 18, damp = 9) => (t <= 0 ? 0 : Math.exp(-damp * t) * Math.sin(freq * t));

  // deterministic PRNG (mulberry32)
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // smooth 1D value noise
  function noise1(x, seed = 1) {
    const i = Math.floor(x), f = x - i;
    const h = (n) => {
      const s = Math.sin((n + seed * 101.3) * 127.1) * 43758.5453;
      return s - Math.floor(s);
    };
    return lerp(h(i), h(i + 1), smooth(f));
  }

  function canvas(w, h) {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    return c;
  }

  // ------------------------------------------------------------------ assets
  const images = {};
  function loadImage(name, src) {
    return new Promise((res) => {
      const im = new Image();
      im.onload = () => { images[name] = im; res(im); };
      im.onerror = () => { images[name] = null; res(null); };
      im.src = src;
    });
  }

  // Frame-accurate footage: a clip is a folder of numbered JPEG frames
  // extracted by the renderer. Missing clips return null -> slot is drawn.
  const clips = {}; // name -> {dir, count, fps, cache: Map}
  const pending = new Set();
  function registerClip(name, info) {
    clips[name] = Object.assign({ cache: new Map() }, info);
  }
  function clipFrame(name, time) {
    const c = clips[name];
    if (!c || !c.count) return null;
    const idx = clamp(Math.round(time * c.fps), 0, c.count - 1);
    const hit = c.cache.get(idx);
    if (hit) return hit;
    pending.add(name + ":" + idx);
    // nearest already-loaded frame keeps preview playback smooth
    let best = null, bd = 1e9;
    for (const [k, v] of c.cache) if (Math.abs(k - idx) < bd) { bd = Math.abs(k - idx); best = v; }
    return best;
  }
  async function flushPending() {
    const jobs = [...pending].map((key) => {
      pending.delete(key);
      const [name, idxs] = key.split(":");
      const c = clips[name], idx = +idxs;
      return new Promise((res) => {
        const im = new Image();
        im.onload = () => { c.cache.set(idx, im); res(); };
        im.onerror = () => res();
        im.src = `${c.dir}/${String(idx + 1).padStart(5, "0")}.jpg`;
      });
    });
    await Promise.all(jobs);
    // keep memory bounded during long renders
    for (const c of Object.values(clips)) {
      if (c.cache.size > 90) {
        const keys = [...c.cache.keys()].sort((a, b) => a - b);
        for (const k of keys.slice(0, c.cache.size - 90)) c.cache.delete(k);
      }
    }
    return jobs.length;
  }

  // -------------------------------------------------------------------- text
  const FONT = {
    black: "GF Display Black",
    xbold: "GF Display ExtraBold",
    bold: "GF Bold",
    semi: "GF SemiBold",
  };

  // Draw one line of copy with a mask reveal (rises from its baseline).
  // p: 0..1 reveal progress, q: 0..1 exit progress
  function copyLine(ctx, text, x, y, opt = {}) {
    const size = opt.size || 96;
    const font = opt.font || FONT.black;
    const align = opt.align || "left";
    const p = opt.p == null ? 1 : opt.p;
    const q = opt.q || 0;
    if (p <= 0 || q >= 1) return;
    ctx.save();
    ctx.font = `${size}px "${font}"`;
    ctx.textAlign = align;
    ctx.textBaseline = "alphabetic";
    if (opt.tracking) ctx.letterSpacing = `${opt.tracking}px`;
    const m = ctx.measureText(text);
    const w = m.width;
    const left = align === "center" ? x - w / 2 : align === "right" ? x - w : x;
    const asc = size * 0.82, desc = size * 0.24;
    // clip box for the rise-in mask
    ctx.beginPath();
    ctx.rect(left - size, y - asc - size * 0.12, w + size * 2, asc + desc + size * 0.24);
    ctx.clip();
    const rise = (1 - ease.outQuint(p)) * (asc + desc) * 1.05 - ease.inCubic(q) * (asc + desc) * 1.05;
    ctx.globalAlpha = (opt.alpha == null ? 1 : opt.alpha) * (1 - ease.inCubic(q) * 0.6);
    if (opt.shadow !== false) {
      ctx.shadowColor = opt.shadowColor || "rgba(8,22,40,0.45)";
      ctx.shadowBlur = opt.shadowBlur == null ? size * 0.28 : opt.shadowBlur;
      ctx.shadowOffsetY = size * 0.05;
    }
    ctx.fillStyle = opt.color || "#FFFFFF";
    ctx.fillText(text, x, y + rise);
    ctx.restore();
    return w;
  }

  // Pop-in variant for short exclamations (scale with subtle overshoot)
  function copyPop(ctx, text, x, y, opt = {}) {
    const p = opt.p == null ? 1 : opt.p;
    const q = opt.q || 0;
    if (p <= 0 || q >= 1) return;
    const s = p < 1 ? lerp(0.82, 1, ease.outBack(p, 1.6)) : 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((opt.rot || 0) * (1 - ease.outCubic(p)));
    ctx.scale(s * (1 - q * 0.08), s * (1 - q * 0.08));
    copyLine(ctx, text, 0, 0, Object.assign({}, opt, { p: 1, q: 0, alpha: (opt.alpha ?? 1) * clamp(p * 3) * (1 - q) }));
    ctx.restore();
  }

  window.GF = window.GF || {};
  Object.assign(window.GF, {
    W, H, FPS, DURATION, clamp, lerp, prog, smooth, ease, spring, rng, noise1, canvas,
    images, loadImage, registerClip, clipFrame, flushPending, pending, clips,
    FONT, copyLine, copyPop,
  });
})();
