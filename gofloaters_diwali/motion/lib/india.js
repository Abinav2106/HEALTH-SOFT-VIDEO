// All-India map plate: hand-plotted national outline (lon, lat), no labels.
// The outline follows the Government of India depiction (all of Jammu &
// Kashmir and Ladakh). It is plotted by hand at about 0.3 degree accuracy, so
// it MUST be checked against the Survey of India outline before media spend
// (see docs/04_qc_checklist.md).
(function () {
  const { canvas, rng, clamp, lerp, ease, prog } = GF;

  const OUTLINE = [
    [68.18, 23.69], [68.75, 23.95], [69.4, 24.27], [70.0, 24.17], [70.6, 24.35], [71.05, 24.6],
    [70.85, 25.15], [70.3, 25.6], [70.1, 25.85], [69.55, 26.6], [69.6, 27.15], [70.15, 27.75],
    [70.65, 27.95], [71.4, 27.9], [72.2, 28.35], [72.95, 29.0], [73.4, 29.95], [73.95, 30.3],
    [74.6, 31.0], [74.55, 31.65], [75.0, 32.05], [74.7, 32.5], [74.35, 32.75], [73.95, 32.85],
    [73.65, 32.95], [73.55, 33.3], [73.4, 33.9], [73.45, 34.4], [73.6, 34.85], [73.3, 35.2],
    [72.95, 35.45], [72.55, 35.85], [72.5, 36.2], [73.0, 36.5], [73.6, 36.85], [74.5, 37.05],
    [75.15, 37.05], [75.6, 36.85], [76.2, 36.7], [77.0, 36.2], [77.8, 35.65], [78.2, 35.75],
    [79.0, 35.95], [79.9, 35.55], [80.3, 35.25], [80.25, 34.75], [79.5, 34.35], [78.95, 34.05],
    [78.75, 33.3], [79.45, 32.7], [78.75, 32.55], [78.45, 32.25], [78.75, 31.85], [78.7, 31.25],
    [79.05, 31.15], [79.7, 30.9], [80.25, 30.45], [80.85, 30.2], [80.55, 29.65], [80.15, 29.15],
    [80.06, 28.84], [80.65, 28.65], [81.2, 28.35], [81.9, 27.95], [82.7, 27.5], [83.35, 27.35],
    [84.0, 27.45], [84.6, 27.05], [85.2, 26.75], [86.0, 26.6], [86.9, 26.45], [87.6, 26.4],
    [88.15, 26.5], [88.05, 26.95], [88.15, 27.35], [88.05, 27.9], [88.45, 28.1], [88.8, 28.05],
    [88.9, 27.75], [88.75, 27.35], [88.85, 27.1], [89.0, 26.95], [89.6, 26.75], [90.4, 26.85],
    [91.2, 26.8], [92.05, 26.85], [92.1, 27.3], [91.65, 27.75], [91.65, 27.95], [92.3, 27.85],
    [93.0, 28.2], [93.9, 28.7], [94.6, 29.15], [95.4, 29.05], [96.1, 29.45], [96.6, 28.95],
    [97.15, 28.4], [97.4, 27.9], [97.1, 27.6], [96.3, 27.2], [95.9, 27.0], [95.2, 26.6],
    [95.0, 26.0], [94.6, 25.5], [94.65, 25.0], [94.15, 23.9], [93.45, 23.95], [93.4, 23.6],
    [93.35, 22.4], [93.1, 22.05], [92.65, 21.95], [92.45, 22.6], [92.3, 23.3], [91.95, 23.6],
    [91.7, 22.95], [91.2, 23.25], [91.4, 24.0], [91.95, 24.3], [92.25, 24.8], [92.4, 25.05],
    [91.8, 25.15], [91.0, 25.2], [90.4, 25.15], [89.85, 25.3], [89.85, 25.95], [89.3, 26.1],
    [89.1, 26.35], [88.75, 26.3], [88.45, 26.45], [88.35, 26.2], [88.1, 25.95], [88.15, 25.45],
    [88.45, 25.2], [88.1, 24.85], [88.7, 24.3], [88.75, 23.9], [88.6, 23.6], [88.85, 23.3],
    [88.95, 22.85], [89.05, 22.2], [89.1, 21.65], [88.6, 21.6], [88.2, 21.7], [87.8, 21.65],
    [87.2, 21.5], [86.85, 21.0], [86.95, 20.6], [86.4, 19.95], [85.5, 19.65], [85.0, 19.35],
    [84.5, 18.9], [84.1, 18.35], [83.45, 17.8], [82.4, 16.95], [82.3, 16.55], [81.6, 16.3],
    [81.1, 15.85], [80.4, 15.55], [80.1, 14.8], [80.2, 13.95], [80.35, 13.25], [80.2, 12.6],
    [79.85, 11.9], [79.85, 11.0], [79.85, 10.3], [79.3, 10.25], [78.95, 9.5], [78.6, 8.9],
    [78.15, 8.4], [77.55, 8.08], [77.0, 8.4], [76.55, 8.95], [76.25, 9.75], [75.85, 10.9],
    [75.55, 11.7], [75.0, 12.6], [74.7, 13.4], [74.4, 14.4], [74.05, 15.1], [73.65, 15.9],
    [73.3, 17.0], [73.05, 18.0], [72.85, 19.0], [72.75, 20.1], [72.85, 20.8], [72.6, 21.4],
    [72.75, 21.9], [72.55, 22.3], [72.15, 21.55], [71.9, 21.05], [71.2, 20.75], [70.6, 20.75],
    [70.0, 21.15], [69.5, 21.65], [69.0, 22.25], [69.1, 22.45], [69.7, 22.4], [70.3, 22.55],
    [70.5, 22.9], [69.9, 22.85], [69.2, 22.85], [68.6, 23.15], [68.4, 23.45],
  ];
  const ISLANDS = [
    [[92.9, 13.6], [93.05, 12.8], [92.85, 11.9], [92.75, 11.55], [92.55, 11.6], [92.6, 12.8], [92.72, 13.6]],
    [[92.6, 10.85], [92.62, 10.45], [92.45, 10.5], [92.48, 10.85]],
    [[93.9, 7.25], [93.95, 6.8], [93.75, 6.85], [93.7, 7.2]],
    [[92.8, 8.25], [92.85, 7.95], [92.7, 8.0]],
  ];
  const DOTS = [[72.6, 10.55], [72.18, 11.2], [73.05, 10.05], [72.75, 11.6]];

  // location points: spread across the country, never labelled
  const CITY = {
    del: [77.21, 28.61], mum: [72.88, 19.08], blr: [77.59, 12.97], maa: [80.27, 13.08],
    hyd: [78.49, 17.39], ccu: [88.36, 22.57], pnq: [73.86, 18.52], amd: [72.57, 23.02],
    jai: [75.79, 26.91], cok: [76.27, 9.93], ixc: [76.78, 30.73], lko: [80.95, 26.85],
    gau: [91.74, 26.14], bbi: [85.82, 20.3], vtz: [83.22, 17.69], nag: [79.09, 21.15],
    idr: [75.86, 22.72],
  };
  const ROUTES = [
    ["ixc", "del", "jai", "amd", "mum"],
    ["del", "lko", "ccu", "gau"],
    ["mum", "pnq", "hyd", "maa", "blr", "cok"],
    ["ccu", "bbi", "vtz", "hyd"],
    ["del", "idr", "nag", "hyd"],
  ];

  const LON0 = 82.6, LAT0 = 22.3, KX = Math.cos((22.5 * Math.PI) / 180);
  // map units: 1 degree latitude = 1 unit
  const proj = ([lon, lat]) => [(lon - LON0) * KX, -(lat - LAT0)];

  function path(g, pts, k, ox, oy) {
    g.beginPath();
    pts.forEach((p, i) => {
      const [x, y] = proj(p);
      i ? g.lineTo(ox + x * k, oy + y * k) : g.moveTo(ox + x * k, oy + y * k);
    });
    g.closePath();
  }

  // ------------------------------------------------------------- land plate
  const PK = 90; // pixels per degree in the cached plate
  let plate = null, plateOrigin = null;

  function buildPlate() {
    const r = rng(7);
    const wDeg = 32, hDeg = 32;
    const w = Math.ceil(wDeg * PK), h = Math.ceil(hDeg * PK);
    const ox = w / 2, oy = h / 2 + 0.3 * PK;
    plateOrigin = [ox, oy];
    const c = canvas(w, h), g = c.getContext("2d");
    const P = (lon, lat) => { const [x, y] = proj([lon, lat]); return [ox + x * PK, oy + y * PK]; };

    g.save();
    path(g, OUTLINE, PK, ox, oy);
    g.clip();
    // base: muted evening earth tones
    const base = g.createLinearGradient(0, oy - 15 * PK, 0, oy + 14 * PK);
    base.addColorStop(0, "#5b5a4a");
    base.addColorStop(0.35, "#4f5a43");
    base.addColorStop(0.7, "#4a523c");
    base.addColorStop(1, "#3e4a37");
    g.fillStyle = base;
    g.fillRect(0, 0, w, h);
    const blob = (lon, lat, rad, col, a) => {
      const [x, y] = P(lon, lat);
      const gr = g.createRadialGradient(x, y, 0, x, y, rad * PK);
      gr.addColorStop(0, col.replace("A", a));
      gr.addColorStop(1, col.replace("A", 0));
      g.fillStyle = gr;
      g.fillRect(x - rad * PK, y - rad * PK, rad * 2 * PK, rad * 2 * PK);
    };
    // Thar (sand), Gangetic plain (fertile), Western Ghats + north-east (forest),
    // Deccan (ochre), Himalaya + Karakoram (snow line)
    blob(71.6, 26.8, 4.2, "rgba(150,128,88,A)", 0.75);
    blob(70.6, 23.4, 2.4, "rgba(132,120,90,A)", 0.5);
    for (let lon = 76; lon <= 88; lon += 2) blob(lon, 26.2 - (lon - 76) * 0.05, 2.4, "rgba(96,116,70,A)", 0.45);
    for (let lat = 9; lat <= 20; lat += 1.2) blob(74.6 + (lat - 9) * -0.12 + 0.6, lat, 1.2, "rgba(40,74,48,A)", 0.6);
    blob(93.5, 26.3, 3.2, "rgba(36,72,46,A)", 0.7);
    blob(78, 18, 4.5, "rgba(120,104,72,A)", 0.4);
    blob(81.5, 21.8, 3.0, "rgba(50,80,52,A)", 0.45);
    for (const [lon, lat, rad] of [[75.5, 35.5, 2.2], [77.8, 34.8, 2.2], [79.4, 34.6, 1.6], [78.6, 31.6, 1.2], [80.6, 30.0, 0.8], [88.6, 27.9, 0.7], [93.5, 28.3, 1.4], [95.8, 28.8, 0.9], [73.8, 36.0, 1.4]]) {
      blob(lon, lat, rad * 0.7, "rgba(214,224,232,A)", 0.22);
    }
    // fine terrain grain
    for (let i = 0; i < 2600; i++) {
      const x = r() * w, y = r() * h, s = (0.04 + r() * 0.22) * PK;
      g.fillStyle = r() < 0.5 ? `rgba(20,30,20,${0.04 + r() * 0.06})` : `rgba(200,190,150,${0.02 + r() * 0.04})`;
      g.beginPath(); g.arc(x, y, s, 0, Math.PI * 2); g.fill();
    }
    // settlement lights: soft warm-white specks, densest around metros
    g.globalCompositeOperation = "lighter";
    const cities = Object.values(CITY);
    for (let i = 0; i < 2600; i++) {
      let lon, lat, a;
      if (r() < 0.55) {
        const c0 = cities[Math.floor(r() * cities.length)];
        const rr = Math.pow(r(), 2) * 1.1, th = r() * Math.PI * 2;
        lon = c0[0] + Math.cos(th) * rr; lat = c0[1] + Math.sin(th) * rr * 0.8; a = 0.5;
      } else {
        lon = 68 + r() * 29; lat = 8 + r() * 25; a = 0.22;
      }
      const [x, y] = P(lon, lat);
      const s = (0.012 + r() * 0.03) * PK;
      g.fillStyle = `rgba(255,236,200,${a * (0.4 + r() * 0.6)})`;
      g.beginPath(); g.arc(x, y, s, 0, Math.PI * 2); g.fill();
    }
    g.globalCompositeOperation = "source-over";
    g.restore();

    // coastline / border edge
    g.lineJoin = "round";
    g.strokeStyle = "rgba(225,240,245,0.55)";
    g.lineWidth = 0.07 * PK;
    path(g, OUTLINE, PK, ox, oy);
    g.stroke();
    for (const isl of ISLANDS) {
      path(g, isl, PK, ox, oy);
      g.fillStyle = "#3e5038"; g.fill(); g.stroke();
    }
    for (const d of DOTS) {
      const [x, y] = P(...d);
      g.fillStyle = "#3e5038";
      g.beginPath(); g.arc(x, y, 0.1 * PK, 0, Math.PI * 2); g.fill(); g.stroke();
    }
    plate = c;
  }

  // cam: {cx, cy (map units at screen centre), k (px per degree), x, y (screen centre)}
  function toScreen(cam, lonlat) {
    const [x, y] = proj(lonlat);
    return [cam.x + (x - cam.cx) * cam.k, cam.y + (y - cam.cy) * cam.k];
  }

  function drawLand(ctx, cam, alpha = 1) {
    if (!plate) buildPlate();
    const s = cam.k / PK;
    ctx.save();
    ctx.globalAlpha *= alpha;
    // soft atmospheric glow under the landmass
    ctx.translate(cam.x - cam.cx * cam.k - plateOrigin[0] * s, cam.y - cam.cy * cam.k - plateOrigin[1] * s);
    ctx.scale(s, s);
    ctx.shadowColor = "rgba(120,200,255,0.35)";
    ctx.shadowBlur = 40;
    ctx.drawImage(plate, 0, 0);
    ctx.restore();
  }

  // ------------------------------------------------------------------ routes
  // each route segment as a gentle arc between two points
  function segPoints(a, b, bend = 0.14, n = 40) {
    const [x0, y0] = proj(a), [x1, y1] = proj(b);
    const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
    const dx = x1 - x0, dy = y1 - y0;
    const cx = mx - dy * bend, cy = my + dx * bend;
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      pts.push([
        (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * cx + t * t * x1,
        (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * cy + t * t * y1,
      ]);
    }
    return pts;
  }
  let routeCache = null;
  function routes() {
    if (routeCache) return routeCache;
    routeCache = ROUTES.map((chain) => {
      let pts = [];
      for (let i = 0; i < chain.length - 1; i++) {
        const seg = segPoints(CITY[chain[i]], CITY[chain[i + 1]], i % 2 ? -0.12 : 0.12);
        pts = pts.concat(i ? seg.slice(1) : seg);
      }
      let len = 0;
      const cum = [0];
      for (let i = 1; i < pts.length; i++) {
        len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
        cum.push(len);
      }
      return { pts, cum, len };
    });
    return routeCache;
  }

  GF.India = { OUTLINE, CITY, ROUTES, proj, toScreen, drawLand, routes, buildPlate };
})();
