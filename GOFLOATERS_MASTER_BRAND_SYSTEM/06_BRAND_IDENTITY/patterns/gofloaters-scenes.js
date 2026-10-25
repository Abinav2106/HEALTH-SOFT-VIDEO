/*!
 * GoFloaters motion scenes (PROPOSED): animated campaign typography and an
 * animated application background. scene(name, w, h, t) -> SVG string.
 * Requires gofloaters-patterns.js. Text uses the proposed display face
 * (Bricolage Grotesque); the original wordmark is never re-set in type.
 */
(function (g) {
  'use strict';
  const { C, aircraft, LINE_LENGTHS } = g.GFPatterns;
  const TAU = Math.PI * 2, f = n => (+n).toFixed(2);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const win = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
  const outCubic = t => 1 - Math.pow(1 - t, 3);
  const outBack = t => { const c1 = 1.2, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  const S = {};
  S.campaign = { label: 'Animated campaign typography', duration: 6,
    render(w, h, t) {
      const words = ['FREEDOM', 'IN', 'MOTION'];
      let b = `<rect width="${w}" height="${h}" fill="${C.tq}"/>`;
      // speed lines sweep across first, then settle as an underline rhythm
      for (let i = 0; i < 5; i++) {
        const u = outCubic(win(t, 0.1 + i * 0.06, 0.9 + i * 0.06));
        const y = h * 0.22 + i * h * 0.11, L = LINE_LENGTHS[i] * w / 1100;
        const x = -L - 50 + u * (w * 0.155 - 50) - win(t, 4.8, 5.8) * w * 0.4;
        b += `<line x1="${f(x)}" y1="${f(y)}" x2="${f(x + L)}" y2="${f(y)}" stroke="${C.ink}" stroke-width="${f(h / 60)}" stroke-linecap="round"/>`;
      }
      const fs = h * 0.17;
      words.forEach((wd, i) => {
        const u = outBack(win(t, 0.6 + i * 0.25, 1.3 + i * 0.25)), out = win(t, 5.0, 5.7);
        const x = w * 0.18 + (1 - u) * -w * 0.12 - out * w * 0.2;
        const y = h * 0.34 + i * fs * 0.98;
        b += `<text x="${f(x)}" y="${f(y)}" font-family="Bricolage Grotesque" font-weight="800" font-size="${f(fs)}" letter-spacing="${f(-fs * 0.02)}" fill="${i === 1 ? C.wh : C.ink}" opacity="${f(clamp(u, 0, 1) * (1 - out))}">${wd}</text>`;
      });
      const su = outCubic(win(t, 1.9, 2.6)) * (1 - win(t, 5.0, 5.6));
      b += `<text x="${f(w * 0.18)}" y="${f(h * 0.34 + 3 * fs * 0.98 - fs * 0.15)}" font-family="Inter" font-weight="600" font-size="${f(h * 0.045)}" fill="${C.ink}" opacity="${f(su)}">Spaces that work for you.</text>`;
      // aircraft crosses on a flight path
      const au = win(t, 2.2, 4.6), ax = -w * 0.15 + au * w * 1.3, ay = h * 0.935 - Math.sin(au * Math.PI) * h * 0.04;
      b += `<path d="M${f(-w * 0.15)},${f(h * 0.935)} Q${f(w * 0.5)},${f(h * 0.86)} ${f(w * 1.15)},${f(h * 0.935)}" fill="none" stroke="${C.ink}" stroke-width="${f(h / 160)}" stroke-dasharray="${f(h / 50)} ${f(h / 60)}" opacity="${f(0.5 * win(t, 2.0, 2.4) * (1 - win(t, 5.0, 5.6)))}"/>`;
      b += aircraft(ax, ay, w * 0.14, -10 * Math.cos(au * Math.PI), C.ye, C.ink);
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${b}</svg>`;
    } };
  S.appbg = { label: 'Animated application background', duration: 8,
    render(w, h, t) {
      let b = `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.tqt}"/><stop offset="1" stop-color="#FFFFFF"/></linearGradient></defs><rect width="${w}" height="${h}" fill="url(#sky)"/>`;
      // soft cloud bands built from rounded speed lines
      for (let r = 0; r < 7; r++) {
        const y = h * (0.12 + r * 0.12), sp = 20 + r * 8;
        for (let i = 0; i < 6; i++) {
          const L = LINE_LENGTHS[(i + r) % 5] * w / 600;
          const x = ((i * w / 3.2 + r * 140 - t * sp) % (w + L * 2) + (w + L * 2)) % (w + L * 2) - L;
          b += `<line x1="${f(x)}" y1="${f(y)}" x2="${f(x + L)}" y2="${f(y)}" stroke="#FFFFFF" stroke-width="${f(h / 34)}" stroke-linecap="round" opacity="0.9"/>`;
        }
      }
      // two aircraft on looping routes
      [[0, C.tq, 0.32], [0.5, C.ye, 0.66]].forEach(([ph, col, yy]) => {
        const u = ((t / 8 + ph) % 1), x = -w * 0.1 + u * w * 1.2, y = h * yy + Math.sin(u * TAU * 2) * h * 0.05;
        const rot = Math.atan(Math.cos(u * TAU * 2) * TAU * 2 * h * 0.05 / (w * 1.2)) * 180 / Math.PI;
        b += aircraft(x, y, w * 0.08, rot, col, C.ink);
      });
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${b}</svg>`;
    } };
  g.GFScenes = { S, list: Object.keys(S), render: (n, w, h, t) => S[n].render(w, h, t) };
})(typeof window !== 'undefined' ? window : globalThis);
