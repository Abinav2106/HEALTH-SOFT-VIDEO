// GoFloaters — Diwali Spark Hunt. 40 s, 1080x1920, 30 fps.
// One continuous journey; every scene hands its last motion to the next.
(function () {
  const { W, H, clamp, lerp, prog, ease, spring, rng, images, copyLine, copyPop, FONT, Tilo, India, World } = GF;
  const C = () => GF.CONFIG;
  const GREEN = "#18B36A", GREEN_DARK = "#0E8A50", GOLD = World.GOLD, GOLD_LIGHT = World.GOLD_LIGHT;
  const NAVY = "#0F2A3D";
  const COPY_X = 84;

  // ------------------------------------------------------------ helpers
  // integrate a speed curve so the propeller shimmer never jumps
  function integrate(f, t, dt = 1 / 120) {
    let s = 0;
    for (let x = 0; x < t; x += dt) s += f(x) * Math.min(dt, t - x);
    return s;
  }
  const cubic = (p0, p1, p2, p3, u) => {
    const v = 1 - u;
    return v * v * v * p0 + 3 * v * v * u * p1 + 3 * v * u * u * p2 + u * u * u * p3;
  };
  const cubicD = (p0, p1, p2, p3, u) => {
    const v = 1 - u;
    return 3 * v * v * (p1 - p0) + 6 * v * u * (p2 - p1) + 3 * u * u * (p3 - p2);
  };

  // polyline helpers (screen space)
  function polyMeasure(pts) {
    const cum = [0];
    for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    return cum;
  }
  // Catmull-Rom smoothing so the overlay route reads as one rounded path
  function smoothPath(pts, n = 12) {
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      for (let k = 0; k < n; k++) {
        const t = k / n, t2 = t * t, t3 = t2 * t;
        out.push([0, 1].map((d) => 0.5 * (2 * p1[d] + (-p0[d] + p2[d]) * t + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * t2 + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * t3)));
      }
    }
    out.push(pts[pts.length - 1]);
    return out;
  }
  function polyAt(pts, cum, u) {
    const L = cum[cum.length - 1] * clamp(u);
    let i = 1;
    while (i < cum.length - 1 && cum[i] < L) i++;
    const f = (L - cum[i - 1]) / Math.max(1e-6, cum[i] - cum[i - 1]);
    const a = pts[i - 1], b = pts[i];
    return { x: lerp(a[0], b[0], f), y: lerp(a[1], b[1], f), ang: Math.atan2(b[1] - a[1], b[0] - a[0]) };
  }
  function strokePartial(ctx, pts, cum, u0, u1) {
    const L0 = cum[cum.length - 1] * u0, L1 = cum[cum.length - 1] * u1;
    ctx.beginPath();
    let started = false;
    for (let i = 0; i < pts.length; i++) {
      if (cum[i] < L0) continue;
      if (cum[i] > L1) {
        const p = polyAt(pts, cum, u1);
        started ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y);
        break;
      }
      if (!started) {
        const p = polyAt(pts, cum, u0);
        ctx.moveTo(p.x, p.y);
        started = true;
      }
      ctx.lineTo(pts[i][0], pts[i][1]);
    }
    ctx.stroke();
  }
  function routeStroke(ctx, width, alpha = 1) {
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = GREEN;
    ctx.lineWidth = width;
    ctx.globalAlpha = alpha;
    ctx.shadowColor = "rgba(24,179,106,0.45)";
    ctx.shadowBlur = Math.min(14, width * 0.9);
  }

  function scrim(ctx, a, h = 760) {
    if (a <= 0) return;
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, `rgba(6,18,32,${0.55 * a})`);
    g.addColorStop(1, "rgba(6,18,32,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, h);
  }
  function vignette(ctx, a) {
    const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.32, W / 2, H / 2, H * 0.72);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, `rgba(0,0,0,${a})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  // a stacked copy block: lines rise in with a stagger, leave together
  function copyBlock(ctx, t, lines, opt) {
    const { x = COPY_X, y, size = 104, lead = 1.02, t0, stagger = 0.12, dur = 0.55, out, outDur = 0.35, align = "left" } = opt;
    lines.forEach((ln, i) => {
      const text = typeof ln === "string" ? ln : ln.text;
      const extra = typeof ln === "string" ? {} : ln;
      const s = extra.size || size;
      copyLine(ctx, text, x, y + i * size * lead, Object.assign({
        size: fit(ctx, text, s, extra.font || FONT.black, opt.maxW || 860),
        p: prog(t, t0 + i * stagger, t0 + i * stagger + dur),
        q: out ? prog(t, out, out + outDur) : 0,
        align,
      }, extra));
    });
  }
  function fit(ctx, text, size, font, maxW) {
    ctx.save();
    ctx.font = `${size}px "${font}"`;
    const w = ctx.measureText(text).width;
    ctx.restore();
    return w > maxW ? Math.floor((size * maxW) / w) : size;
  }

  // ===================================================== S01-S02: sky
  const EYE = Tilo.RIG.eye.c, CENTER = Tilo.RIG.center;
  const TAP_T = 1.32;

  function propSpeedSky(t) {
    if (t < 1.95) return 0.18;
    return lerp(0.18, 1, ease.inOutCubic(prog(t, 1.95, 3.0)));
  }

  function tiloSky(t) {
    const o = { anchor: EYE.slice(), x: 560, y: 900, s: 6.2, rot: 0, blink: 0, dashes: 0 };
    // 01 — enters far too close, lands with a small overshoot
    const pin = prog(t, 0, 0.5);
    o.x = lerp(1320, 560, ease.outCubic(pin));
    o.y = lerp(1320, 900, ease.outCubic(pin));
    o.s = lerp(8.2, 6.2, ease.outBack(pin, 1.1));
    // curious head tilt, one blink
    o.rot = -0.065 * ease.inOutCubic(prog(t, 0.55, 0.9)) * (1 - ease.inOutCubic(prog(t, 1.62, 2.1)));
    const bp = prog(t, 0.96, 1.14);
    o.blink = bp > 0 && bp < 1 ? Math.pow(Math.sin(bp * Math.PI), 0.7) : 0;
    // lunges at the lens: nose taps the camera
    const lunge = ease.inCubic(prog(t, 1.18, TAP_T)) * (1 - ease.outCubic(prog(t, TAP_T, 1.62)));
    o.s *= 1 + 0.1 * lunge;
    o.x += 30 * lunge;
    // 02 — turns to the flight line and the camera pulls all the way back
    const u = ease.inOutQuint(prog(t, 2.0, 3.45));
    if (u > 0) {
      o.anchor = [lerp(EYE[0], CENTER[0], u), lerp(EYE[1], CENTER[1], u)];
      o.s = Math.exp(lerp(Math.log(6.2), Math.log(0.98), u));
      o.x = lerp(560, 500, u);
      o.y = lerp(900, 1060, u);
      o.rot = lerp(0, 0.035, ease.outCubic(prog(t, 2.0, 2.5))) * (1 - u) - 0.03 * u;
    }
    // cruising
    const cruise = prog(t, 3.2, 4.4);
    o.x += 70 * ease.inOutCubic(cruise);
    o.y += 12 * Math.sin(t * 3.1) * cruise - 40 * ease.inOutCubic(cruise);
    o.rot += 0.018 * Math.sin(t * 2.3) * cruise;
    // banks up and out of frame as the camera tilts down to India
    const ex = ease.inCubic(prog(t, 4.35, 5.0));
    o.x = lerp(o.x, 1380, ex);
    o.y = lerp(o.y, 420, ex);
    o.s *= 1 - 0.35 * ex;
    o.rot -= 0.22 * ex;
    o.dashes = ease.outCubic(prog(t, 2.55, 3.1));
    o.dashPhase = t * 3;
    o.propSpeed = propSpeedSky(t);
    o.propPhase = integrate((x) => 1.2 + propSpeedSky(x) * 9, t);
    return o;
  }

  const SKY_CLOUDS = (() => {
    const r = rng(41);
    return Array.from({ length: 16 }, (_, i) => ({
      k: i, x: r() * 2600 - 400, y: 120 + r() * 1700, s: 0.6 + r() * 1.0, d: 0.25 + r() * 0.85, a: 0.65 + r() * 0.35,
    }));
  })();

  function skyScroll(t) {
    // px of travel: hover drift, then the takeoff speed ramp
    return integrate((x) => (x < 2 ? 40 : lerp(40, 1700, ease.inOutCubic(prog(x, 2.0, 3.3)))), t, 1 / 60);
  }

  function sceneSky(ctx, t) {
    const tilt = ease.inCubic(prog(t, 4.35, 5.05)); // camera tilts down to earth
    World.sky(ctx, [[0, "#3f93d8"], [0.5, "#86c3ee"], [0.85, "#cfe8f6"], [1, "#e8f3f6"]]);
    if (tilt > 0) { ctx.fillStyle = `rgba(30,80,140,${0.5 * tilt})`; ctx.fillRect(0, 0, W, H); }
    const zoomU = ease.inOutQuint(prog(t, 2.0, 3.45));
    const Z = lerp(2.3, 1, zoomU);
    const scroll = skyScroll(t);
    for (const c of SKY_CLOUDS) {
      const z = Math.pow(Z, c.d);
      let x = ((c.x - scroll * c.d * 0.6) % 2600 + 2600) % 2600 - 400;
      const y = c.y - tilt * 2600 * c.d;
      const sx = W / 2 + (x - W / 2) * z, sy = H / 2 + (y - H / 2) * z;
      World.cloud(ctx, c.k, sx, sy, c.s * z, c.a);
    }
  }

  // near clouds that rush past the lens and hide the hand-over to the map
  function rushClouds(ctx, t, t0, t1) {
    const p = prog(t, t0, t1);
    if (p <= 0 || p >= 1) return;
    const r = rng(9);
    for (let i = 0; i < 12; i++) {
      const x = W * (-0.1 + (i % 4) * 0.4 + r() * 0.15), y0 = H * (1.25 + Math.floor(i / 4) * 0.35 + r() * 0.1);
      const y = lerp(y0, -H * 0.9, ease.inOutCubic(p));
      World.cloud(ctx, i, x, y, 3.0 + r() * 1.0, 1);
    }
    // veil at the crossing so no frame shows both worlds half-made
    const v = Math.sin(Math.PI * prog(t, t0 + 0.12, t1 - 0.12));
    ctx.fillStyle = `rgba(236,244,250,${0.92 * Math.pow(v, 0.6)})`;
    ctx.fillRect(0, 0, W, H);
  }

  function tapRipple(ctx, t, x, y) {
    const p = prog(t, TAP_T, TAP_T + 0.42);
    if (p <= 0 || p >= 1) return;
    ctx.save();
    const rad = 30 + 230 * ease.outCubic(p);
    ctx.strokeStyle = `rgba(15,42,61,${0.25 * (1 - p)})`;
    ctx.lineWidth = 14 * (1 - p) + 2;
    ctx.beginPath(); ctx.arc(x, y, rad + 6, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = `rgba(255,255,255,${0.95 * (1 - p)})`;
    ctx.lineWidth = 10 * (1 - p) + 2;
    ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = `rgba(255,255,255,${0.22 * (1 - p)})`;
    ctx.beginPath();
    ctx.arc(x, y, 40 * (1 - p * 0.5), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ===================================================== S03: all India
  const MAP_PT = [-0.1, -0.4];
  function mapCam(t) {
    // arrives from altitude, then a slow push for scale
    const arrive = ease.outQuint(prog(t, 4.55, 5.9));
    const k0 = 36 * (1 + 0.1 * ease.inOutCubic(prog(t, 5.0, 9.0)));
    let k = lerp(110, k0, arrive);
    let cx = MAP_PT[0], cy = lerp(MAP_PT[1] + 9, MAP_PT[1], arrive);
    let y = 1140;
    // dive into the western route at the end
    const dive = ease.inExpo(prog(t, 8.45, 9.15));
    if (dive > 0) {
      const [tx, ty] = India.proj([73.25, 19.6]);
      cx = lerp(cx, tx, ease.outCubic(prog(t, 8.3, 9.0)));
      cy = lerp(cy, ty, ease.outCubic(prog(t, 8.3, 9.0)));
      y = lerp(y, 1150, dive);
      k *= Math.exp(Math.log(26) * dive);
    }
    return { cx, cy, k, x: W / 2, y };
  }

  const CITY_ORDER = ["del", "mum", "blr", "ccu", "hyd", "maa", "amd", "jai", "pnq", "lko", "gau", "cok", "ixc", "bbi", "vtz", "nag", "idr"];

  function sceneIndia(ctx, t) {
    const cam = mapCam(t);
    // ocean seen from altitude
    const g = ctx.createRadialGradient(W / 2, 1100, 100, W / 2, 1100, 1400);
    g.addColorStop(0, "#123a5c"); g.addColorStop(0.6, "#0b2742"); g.addColorStop(1, "#06152a");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    India.drawLand(ctx, cam);
    // high wisps for depth
    const r = rng(12);
    for (let i = 0; i < 5; i++) {
      const x = ((r() * 1600 - t * (20 + r() * 25) * 3) % 1600 + 1600) % 1600 - 260;
      const y = 300 + r() * 1500;
      World.cloud(ctx, i, x, y, 0.9 + r() * 0.6, 0.1);
    }
    // location points
    const kScale = clamp(cam.k / 36, 0.6, 4);
    CITY_ORDER.forEach((id, i) => {
      const t0 = 5.25 + i * 0.055;
      const p = prog(t, t0, t0 + 0.35);
      if (p <= 0) return;
      const [x, y] = India.toScreen(cam, India.CITY[id]);
      const s = ease.outBack(p, 1.8) * kScale;
      // pulse rings
      for (let k = 0; k < 2; k++) {
        const pp = ((t - t0 - k * 0.8) / 1.6) % 1;
        if (t - t0 - k * 0.8 < 0) continue;
        ctx.strokeStyle = `rgba(24,179,106,${0.6 * (1 - pp)})`;
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(x, y, (10 + 40 * ease.outCubic(pp)) * kScale, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.fillStyle = "#fff";
      ctx.beginPath(); ctx.arc(x, y, 7 * s, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = GREEN; ctx.lineWidth = 4 * s;
      ctx.beginPath(); ctx.arc(x, y, 12 * s, 0, Math.PI * 2); ctx.stroke();
    });
    // routes draw one after another
    const routes = India.routes();
    routes.forEach((rt, i) => {
      const p = ease.inOutCubic(prog(t, 5.75 + i * 0.32, 5.75 + i * 0.32 + 1.25));
      if (p <= 0) return;
      const pts = rt.pts.map((q) => [cam.x + (q[0] - cam.cx) * cam.k, cam.y + (q[1] - cam.cy) * cam.k]);
      const cum = polyMeasure(pts);
      ctx.save();
      routeStroke(ctx, 7 * kScale);
      strokePartial(ctx, pts, cum, 0, p);
      ctx.restore();
      if (p < 1) {
        const h = polyAt(pts, cum, p);
        ctx.fillStyle = "#fff";
        ctx.beginPath(); ctx.arc(h.x, h.y, 6 * kScale, 0, Math.PI * 2); ctx.fill();
      }
    });
    vignette(ctx, 0.45);
  }

  function tiloIndia(t) {
    const u = prog(t, 6.3, 8.9);
    if (u <= 0 || u >= 1) return null;
    const e = ease.inOutCubic(u);
    const P = [[-260, 1560], [260, 1240], [760, 980], [1340, 620]];
    const x = cubic(P[0][0], P[1][0], P[2][0], P[3][0], e), y = cubic(P[0][1], P[1][1], P[2][1], P[3][1], e);
    const dx = cubicD(P[0][0], P[1][0], P[2][0], P[3][0], e), dy = cubicD(P[0][1], P[1][1], P[2][1], P[3][1], e);
    return {
      x, y, s: 0.44, rot: clamp(Math.atan2(dy, dx), -0.5, 0.5) * 0.7, dashes: 1, dashPhase: t * 3,
      propSpeed: 1, propPhase: t * 10, alpha: 1,
    };
  }

  // ================================================ S04: checks everywhere
  const PLATES = [["day", 8.95, 10.75], ["street", 10.6, 12.35], ["work", 12.2, 14.1]];
  const ribbonY = (x, scroll) => 1250 + 60 * Math.sin((x + scroll * 1.1) / 380) + 26 * Math.sin((x + scroll * 1.1) / 157);

  function sceneMontage(ctx, t) {
    const scroll = 1150 * (t - 8.9);
    // plates with route-led wipes (the route sweeps through and reveals the next city)
    for (let i = 0; i < PLATES.length; i++) {
      const [kind, a] = PLATES[i];
      if (t < a) continue;
      const next = PLATES[i + 1];
      if (next && t > next[1] + 0.32) continue;
      ctx.save();
      if (i > 0) {
        const p = ease.inOutCubic(prog(t, a, a + 0.32));
        if (p < 1) {
          const ex = lerp(W + 500, -500, p);
          ctx.beginPath();
          ctx.moveTo(ex + 0.35 * (0 - H / 2), 0);
          ctx.lineTo(W + 600, 0);
          ctx.lineTo(W + 600, H);
          ctx.lineTo(ex + 0.35 * (H - H / 2), H);
          ctx.closePath();
          ctx.clip();
        }
      }
      World.urbanPlate(ctx, kind, scroll + i * 900, t);
      ctx.restore();
      if (i > 0) {
        const p = ease.inOutCubic(prog(t, a, a + 0.32));
        if (p > 0 && p < 1) {
          const ex = lerp(W + 500, -500, p);
          ctx.save();
          routeStroke(ctx, 16);
          ctx.beginPath();
          ctx.moveTo(ex - 0.35 * H / 2, 0);
          ctx.lineTo(ex + 0.35 * H / 2, H);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
    vignette(ctx, 0.3);
  }

  // the travel route that threads the montage; expands into the game at the end
  // perspective route: a road on the ground plane, projected to screen
  const ROAD = { vx: 600, hy: 1190, f: 760, h: 1, half: 0.42, zNear: 0.55, zFar: 46 };
  const roadX = (z) => 0.9 * Math.sin(z * 0.22 + 0.6) - 0.5;
  const roadPt = (x, z) => [ROAD.vx + (ROAD.f * x) / z, ROAD.hy + (ROAD.f * ROAD.h) / z];
  const PR = { F: roadPt(roadX(ROAD.zFar), ROAD.zFar) };
  const prPoint = (s) => { const z = Math.exp(lerp(Math.log(ROAD.zFar), Math.log(ROAD.zNear), s)); return roadPt(roadX(z), z); };
  function montageRibbon(ctx, t) {
    const scroll = 1150 * (t - 8.9);
    const intro = 1 - ease.outCubic(prog(t, 8.95, 9.45)); // thick from the dive, settles
    const flatA = 1 - ease.inOutCubic(prog(t, 13.1, 13.35));
    if (flatA > 0) {
      ctx.save();
      routeStroke(ctx, lerp(12, 54, intro), flatA);
      ctx.beginPath();
      for (let x = -60; x <= W + 60; x += 12) x === -60 ? ctx.moveTo(x, ribbonY(x, scroll)) : ctx.lineTo(x, ribbonY(x, scroll));
      ctx.stroke();
      ctx.restore();
    }
    // the route swings round toward camera, then the camera rushes along it
    const draw = ease.outCubic(prog(t, 13.05, 13.4));
    if (draw <= 0) return;
    const rush = ease.inExpo(prog(t, 13.55, 14.0));
    ctx.save();
    ctx.translate(PR.F[0], PR.F[1]);
    ctx.scale(Math.exp(Math.log(40) * rush), Math.exp(Math.log(40) * rush));
    ctx.translate(-PR.F[0], -PR.F[1]);
    const n = 60, left = [], right = [];
    const zMax = Math.exp(lerp(Math.log(ROAD.zNear), Math.log(ROAD.zFar), draw)); // drawn from the lens outward
    for (let i = 0; i <= n; i++) {
      const z = Math.exp(lerp(Math.log(ROAD.zNear), Math.log(zMax), i / n));
      left.push(roadPt(roadX(z) - ROAD.half, z));
      right.push(roadPt(roadX(z) + ROAD.half, z));
    }
    ctx.fillStyle = GREEN;
    ctx.shadowColor = "rgba(24,179,106,0.45)"; ctx.shadowBlur = 14;
    ctx.beginPath();
    left.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    for (let i = right.length - 1; i >= 0; i--) ctx.lineTo(right[i][0], right[i][1]);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    const fill = ease.inCubic(prog(t, 13.8, 14.0));
    if (fill > 0) { ctx.fillStyle = GREEN; ctx.globalAlpha = fill; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  }

  function tiloMontage(t) {
    const scroll = 1150 * (t - 8.9);
    const enter = ease.outCubic(prog(t, 8.95, 9.5));
    let x = lerp(-300, 400, enter), y = ribbonY(400, scroll) - 190 + 10 * Math.sin(t * 3.4);
    let s = 0.6, rot = -0.04 + 0.03 * Math.sin(t * 2.1);
    // flies off along the route into the distance as it turns toward camera
    const dive = ease.inOutCubic(prog(t, 13.15, 13.75));
    const [fx, fy] = prPoint(0.04);
    x = lerp(x, fx, dive); y = lerp(y, fy - 40, dive); s *= 1 - 0.8 * dive; rot -= 0.25 * dive;
    return { x, y, s, rot, dashes: 1, dashPhase: t * 3, propSpeed: 1, propPhase: t * 10, alpha: 1 - prog(t, 13.7, 13.8) };
  }

  // ================================================== S05-S08: the game
  let routeCache = null;
  function gameRoute() {
    if (routeCache) return routeCache;
    const pts = smoothPath(C().gameRoute.map(([x, y]) => [x * W, y * H]));
    routeCache = { pts, cum: polyMeasure(pts) };
    return routeCache;
  }

  // film time inside the game; frozen for the Spark contact beat
  const FREEZE = [30.0, 30.2];
  const gameTime = (t) => (t < FREEZE[0] ? t : t < FREEZE[1] ? FREEZE[0] : t - (FREEZE[1] - FREEZE[0]));

  function tiloU(tg) {
    // slows into the fog, searches, then chases the Spark
    if (tg < 23) return 0.12;
    if (tg < 25.4) return lerp(0.12, 0.34, ease.outCubic(prog(tg, 23, 25.4)));
    if (tg < 28) return lerp(0.34, 0.37, ease.inOutCubic(prog(tg, 25.4, 28)));
    if (tg <= 30) return lerp(0.37, C().sparkAt, ease.inCubic(prog(tg, 28, 30)) * 0.85 + prog(tg, 28, 30) * 0.15);
    return lerp(C().sparkAt, Math.min(0.97, C().sparkAt + 0.07), ease.outCubic(prog(tg, 30, 31.5)));
  }

  function gameCam(t) {
    const tg = gameTime(t);
    const { pts, cum } = gameRoute();
    const p = polyAt(pts, cum, tiloU(tg));
    const follow = ease.inOutCubic(prog(tg, 27.9, 29.6)) * (1 - ease.inOutCubic(prog(tg, 30.2, 31.6)));
    // settle-in after the hand-off from the route
    const settle = 1 + 0.07 * (1 - ease.outCubic(prog(t, 14.0, 15.2)));
    const zoom = (1 + 0.18 * follow) * settle;
    // follow Tilo, but never pan past the edge of the footage
    const mx = ((zoom - 1) * W) / 2, my = ((zoom - 1) * H) / 2;
    const ox = clamp((W / 2 - p.x) * zoom * follow, -mx, mx), oy = clamp((H * 0.55 - p.y) * zoom * follow, -my, my);
    return { zoom, ox, oy };
  }
  function applyCam(ctx, cam) {
    ctx.translate(W / 2 + cam.ox, H / 2 + cam.oy);
    ctx.scale(cam.zoom, cam.zoom);
    ctx.translate(-W / 2, -H / 2);
  }

  function sparkState(t) {
    const tg = gameTime(t);
    const { pts, cum } = gameRoute();
    const p = polyAt(pts, cum, C().sparkAt);
    const appear = ease.outBack(prog(tg, 24.75, 25.2), 1.6);
    const intensity = 0.7 * appear + 0.3 * ease.inCubic(prog(tg, 28.2, 30));
    const size = lerp(0, 34, appear) + 16 * ease.inCubic(prog(tg, 28.2, 30));
    return { x: p.x, y: p.y, intensity, size };
  }

  function sceneGame(ctx, t) {
    const tg = gameTime(t);
    const cam = gameCam(t);
    const cfg = C();
    const reward = prog(t, 31.85, 32.3); // background softens for the card
    ctx.save();
    applyCam(ctx, cam);
    const blur = 16 * ease.inOutCubic(reward);
    World.game(ctx, tg, cfg.gameplay, { filter: blur > 0.5 ? `blur(${blur.toFixed(1)}px) brightness(${(1 - 0.4 * reward).toFixed(3)})` : "none" });
    // the green route arrives from the montage and lands on the game route
    const hand = prog(t, 14.0, 14.75);
    const { pts, cum } = gameRoute();
    let routeA = 0;
    if (t < 15.8 || cfg.keepRouteOverlay) routeA = 1 - (cfg.keepRouteOverlay ? 0 : ease.inOutCubic(prog(t, 15.15, 15.8)));
    // re-surfaces under the fog for the chase
    routeA = Math.max(routeA, ease.inOutCubic(prog(tg, 23.2, 24.0)) * (1 - ease.inOutCubic(prog(tg, 30.6, 31.4))) * 0.95);
    if (routeA > 0) {
      ctx.save();
      routeStroke(ctx, lerp(4200, 14, ease.outExpo(hand)), routeA);
      strokePartial(ctx, pts, cum, 0, 1);
      ctx.restore();
    }
    // dim under the fog
    const fogD = ease.inOutCubic(prog(tg, 23.0, 24.4)) * (1 - ease.outCubic(prog(t, 30.25, 31.2)));
    if (fogD > 0) {
      ctx.fillStyle = `rgba(30,40,52,${0.18 * fogD})`;
      ctx.fillRect(-W, -H, W * 3, H * 3);
    }
    // Spark
    const sp = sparkState(t);
    if (t < 32.3) {
      const toCard = ease.inCubic(prog(t, 31.85, 32.25));
      // Spark rides with Tilo after contact, then collapses into the card centre
      ctx.restore();
      ctx.save();
      const [sx, sy] = camPoint(cam, sp.x, sp.y);
      const x = lerp(sx, W / 2, toCard), y = lerp(sy, 1040, toCard);
      World.spark(ctx, x, y, sp.size * (1 + 0.25 * ease.outCubic(prog(t, 30.2, 30.6))) * (1 - 0.7 * toCard), sp.intensity + toCard, t);
    }
    ctx.restore();
  }
  const camPoint = (cam, x, y) => [W / 2 + cam.ox + (x - W / 2) * cam.zoom, H / 2 + cam.oy + (y - H / 2) * cam.zoom];

  function sceneFog(ctx, t) {
    const tg = gameTime(t);
    const dens = ease.inOutCubic(prog(tg, 23.0, 24.4));
    const edge = lerp(0.1, 0.72, ease.inOutCubic(prog(tg, 23.0, 26.5)));
    const sp = sparkState(t);
    const cam = gameCam(t);
    const [cx, cy] = camPoint(cam, sp.x, sp.y);
    // keep a little pocket of clear air round the Spark so it can be seen
    const clearR = t >= 30.2 ? 2600 * ease.outCubic(prog(t, 30.2, 31.15)) : 190 * ease.outCubic(prog(tg, 24.8, 25.4));
    World.fog(ctx, tg, dens * (1 - ease.inCubic(prog(t, 30.9, 31.3))), edge, { x: cx, y: cy, r: clearR });
  }

  function tiloGame(t) {
    if (!C().overlayTilo) return null;
    const tg = gameTime(t);
    const vis = ease.outCubic(prog(tg, 22.9, 23.4)) * (1 - ease.inCubic(prog(t, 31.75, 32.1)));
    if (vis <= 0) return null;
    const { pts, cum } = gameRoute();
    const cam = gameCam(t);
    const u = tiloU(tg);
    const p = polyAt(pts, cum, u);
    const [x, y] = camPoint(cam, p.x, p.y - 80);
    const search = 0.05 * Math.sin(tg * 3.2) * prog(tg, 23.3, 23.8) * (1 - prog(tg, 25.3, 25.6));
    const notice = spring(tg - 25.55, 16, 6);
    const chase = prog(tg, 28.0, 30.0);
    const rot = clamp(p.ang, -0.6, 0.6) * 0.45 + search - 0.16 * notice - 0.08 * ease.inCubic(chase) * (tg < 30 ? 1 : 0);
    const s = 0.44 * cam.zoom * (1 + 0.08 * notice) * vis;
    const speed = tg < 25.4 ? lerp(0.8, 0.35, prog(tg, 23, 25.4)) : tg < 28 ? 0.35 : lerp(0.35, 1, prog(tg, 28, 28.6));
    return {
      x, y, s, rot, alpha: vis,
      dashes: tg >= 28 && tg < 30.6 ? ease.outCubic(prog(tg, 28, 28.4)) : 0, dashPhase: tg * 4,
      propSpeed: speed, propPhase: tg * 6 + integrate((q) => (q < 28 ? 0 : 6), tg - 20),
    };
  }

  function sparkPulse(ctx, t) {
    const p = prog(t, 30.2, 30.95);
    if (p <= 0 || p >= 1) return;
    const sp = sparkState(t);
    const [x, y] = camPoint(gameCam(t), sp.x, sp.y);
    ctx.save();
    ctx.strokeStyle = `rgba(255,227,161,${1 - p})`;
    ctx.lineWidth = lerp(14, 2, p);
    ctx.shadowColor = "rgba(244,183,64,0.8)";
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.arc(x, y, 30 + 900 * ease.outCubic(p), 0, Math.PI * 2);
    ctx.stroke();
    // brief flash at contact
    const f = 1 - prog(t, 30.2, 30.45);
    const g = ctx.createRadialGradient(x, y, 0, x, y, 320);
    g.addColorStop(0, `rgba(255,248,225,${0.85 * f})`);
    g.addColorStop(1, "rgba(255,227,161,0)");
    ctx.fillStyle = g;
    ctx.fillRect(x - 320, y - 320, 640, 640);
    ctx.restore();
  }

  function workspaceOpen(ctx, t) {
    const open = ease.inOutQuint(prog(t, 20.2, 20.75));
    const close = ease.inOutQuint(prog(t, 22.2, 22.75));
    const k = open * (1 - close);
    if (k <= 0) return;
    const cfg = C();
    const c = cfg.workspaceCard;
    const card = [c.x * W, c.y * H, c.w * W, c.h * H];
    const full = [48, 250, W - 96, 1380];
    const r = (i) => lerp(card[i], full[i], k);
    ctx.save();
    ctx.fillStyle = `rgba(6,16,26,${0.45 * k})`;
    ctx.fillRect(0, 0, W, H);
    ctx.shadowColor = "rgba(0,0,0,0.35)";
    ctx.shadowBlur = 40 * k;
    ctx.shadowOffsetY = 18 * k;
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.roundRect(r(0), r(1), r(2), r(3), lerp(24, 40, k)); ctx.fill();
    ctx.restore();
    World.workspacePhoto(ctx, cfg.workspace, r(0) + 10 * k, r(1) + 10 * k, r(2) - 20 * k, r(3) - 20 * k, lerp(18, 32, k), 1 + 0.07 * prog(t, 20.2, 22.75));
    ctx.globalAlpha = 1;
  }

  // ================================================== S09: scratch reward
  const CARD = { x: 110, y: 450, w: 860, h: 900 };
  const PANEL = { x: 170, y: 450 + 365, w: 740, h: 390 };
  let foilBase = null, foilTmp = null;
  function buildFoil() {
    const { w, h } = PANEL;
    foilBase = GF.canvas(w, h);
    const g = foilBase.getContext("2d");
    const lg = g.createLinearGradient(0, 0, w, h);
    lg.addColorStop(0, "#F4B740"); lg.addColorStop(0.35, "#FFE3A1"); lg.addColorStop(0.55, "#F4B740"); lg.addColorStop(0.8, "#FFE3A1"); lg.addColorStop(1, "#E9A92F");
    g.fillStyle = lg;
    g.fillRect(0, 0, w, h);
    const r = rng(19);
    for (let i = 0; i < 2600; i++) {
      g.fillStyle = r() < 0.5 ? `rgba(255,255,255,${r() * 0.18})` : `rgba(160,100,10,${r() * 0.12})`;
      g.fillRect(r() * w, r() * h, 2, 2);
    }
    // faint spark motif embossed into the foil
    g.globalAlpha = 0.16;
    for (let y = 40; y < h; y += 90) for (let x = (y / 90) % 2 ? 60 : 15; x < w; x += 90) {
      g.fillStyle = "#fff";
      g.beginPath();
      g.moveTo(x, y - 14); g.quadraticCurveTo(x + 2, y - 2, x + 14, y); g.quadraticCurveTo(x + 2, y + 2, x, y + 14);
      g.quadraticCurveTo(x - 2, y + 2, x - 14, y); g.quadraticCurveTo(x - 2, y - 2, x, y - 14); g.fill();
    }
    foilTmp = GF.canvas(w, h);
  }
  const SCRATCH = [[70, 90], [640, 70], [110, 170], [670, 190], [90, 270], [650, 300], [180, 340]];
  const SCRATCH_T = [32.95, 33.95];

  function sceneReward(ctx, t) {
    const pop = prog(t, 32.22, 32.62);
    const leave = ease.inOutCubic(prog(t, 34.7, 35.2));
    if (pop <= 0 || leave >= 1) return;
    const s = lerp(0.6, 1, ease.outBack(pop, 1.5)) * (1 - 0.06 * leave);
    ctx.save();
    ctx.globalAlpha = clamp(pop * 4) * (1 - leave);
    ctx.translate(W / 2, CARD.y + CARD.h / 2 - 170 * leave);
    ctx.scale(s, s);
    ctx.translate(-W / 2, -(CARD.y + CARD.h / 2));
    // card
    ctx.save();
    ctx.shadowColor = "rgba(40,20,0,0.45)"; ctx.shadowBlur = 60; ctx.shadowOffsetY = 24;
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath(); ctx.roundRect(CARD.x, CARD.y, CARD.w, CARD.h, 48); ctx.fill();
    ctx.restore();
    // completion glow
    const done = prog(t, 34.05, 34.7);
    if (done > 0 && done < 1) {
      ctx.save();
      ctx.strokeStyle = `rgba(244,183,64,${0.9 * (1 - done)})`;
      ctx.lineWidth = 10 * (1 - done) + 2;
      ctx.beginPath(); ctx.roundRect(CARD.x - 14 * done, CARD.y - 14 * done, CARD.w + 28 * done, CARD.h + 28 * done, 52); ctx.stroke();
      ctx.restore();
    }
    // exact logo on the card
    drawLogo(ctx, W / 2 - 200, CARD.y + 56, 400, 1);
    ctx.textAlign = "center";
    ctx.fillStyle = NAVY;
    ctx.font = `${fit(ctx, "YOU FOUND THE SPARK!", 64, FONT.black, 760)}px "${FONT.black}"`;
    ctx.fillText("YOU FOUND THE SPARK!", W / 2, CARD.y + 262);
    ctx.fillStyle = GREEN_DARK;
    ctx.font = `34px "${FONT.bold}"`;
    ctx.letterSpacing = "5px";
    ctx.fillText("SCRATCH TO REVEAL", W / 2, CARD.y + 322);
    ctx.letterSpacing = "0px";
    // prize panel under the foil
    const P = PANEL;
    ctx.save();
    ctx.beginPath(); ctx.roundRect(P.x, P.y, P.w, P.h, 30); ctx.clip();
    ctx.fillStyle = "#FFF6E0"; ctx.fillRect(P.x, P.y, P.w, P.h);
    ctx.fillStyle = NAVY;
    ctx.font = `40px "${FONT.xbold}"`;
    ctx.letterSpacing = "3px";
    ctx.fillText("AMAZON VOUCHER", W / 2, P.y + 150);
    ctx.letterSpacing = "0px";
    ctx.font = `${fit(ctx, "₹500 – ₹5,000", 100, FONT.black, 660)}px "${FONT.black}"`;
    ctx.fillText("₹500 – ₹5,000", W / 2, P.y + 272);
    // foil with the scratch path cut through it
    if (!foilBase) buildFoil();
    const g = foilTmp.getContext("2d");
    g.globalCompositeOperation = "source-over";
    g.clearRect(0, 0, P.w, P.h);
    g.drawImage(foilBase, 0, 0);
    // sheen sweep while the card settles
    const sh = prog(t, 32.5, 33.0);
    if (sh > 0 && sh < 1) {
      const sx = lerp(-300, P.w + 300, sh);
      const sg = g.createLinearGradient(sx - 140, 0, sx + 140, 0);
      sg.addColorStop(0, "rgba(255,255,255,0)"); sg.addColorStop(0.5, "rgba(255,255,255,0.55)"); sg.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = sg; g.fillRect(0, 0, P.w, P.h);
    }
    const sp = ease.inOutCubic(prog(t, SCRATCH_T[0], SCRATCH_T[1]));
    const sc = polyMeasure(SCRATCH);
    if (sp > 0) {
      g.globalCompositeOperation = "destination-out";
      g.lineCap = "round"; g.lineJoin = "round"; g.lineWidth = 120; g.strokeStyle = "#000";
      strokePartial(g, SCRATCH, sc, 0, sp);
    }
    ctx.globalAlpha *= 1 - ease.inCubic(prog(t, 33.95, 34.3));
    ctx.drawImage(foilTmp, P.x, P.y);
    ctx.restore();
    // fingertip touch indicator (UI motion vocabulary, no hand drawn)
    const on = prog(t, 32.75, 32.95) * (1 - prog(t, 33.95, 34.15));
    if (on > 0) {
      const h = polyAt(SCRATCH, sc, sp);
      const press = 1 - 0.12 * prog(t, 32.85, 32.95) * (1 - prog(t, 33.95, 34.05));
      ctx.save();
      ctx.globalAlpha = on;
      ctx.translate(P.x + h.x, P.y + h.y);
      ctx.scale(press, press);
      ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8;
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.beginPath(); ctx.arc(0, 0, 40, 0, Math.PI * 2); ctx.fill();
      ctx.shadowColor = "transparent";
      ctx.strokeStyle = "rgba(15,42,61,0.55)"; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.arc(0, 0, 54, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = "rgba(15,42,61,0.35)";
      ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }

  // the untouched logo file on a white plate, optionally wiping in from the mascot
  const LOGO_BOX = [37, 99, 1961, 566]; // measured by tools/extract_tilo.py
  function drawLogo(ctx, x, y, w, alpha, wordWipe = 1, mascot = true) {
    const img = images.logo;
    if (!img) return;
    const sw = LOGO_BOX[2] - LOGO_BOX[0], sh = LOGO_BOX[3] - LOGO_BOX[1];
    const h = (w * sh) / sw, k = w / sw;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.beginPath();
    const split = x + (905 - LOGO_BOX[0]) * k; // wordmark starts right of the propeller
    if (mascot) ctx.rect(x - 10, y - 10, split - x + 10, h + 20);
    ctx.rect(split, y - 10, (x + w - split + 10) * wordWipe, h + 20);
    ctx.clip();
    ctx.drawImage(img, LOGO_BOX[0], LOGO_BOX[1], sw, sh, x, y, w, h);
    ctx.restore();
    return { k, h };
  }

  // ===================================================== S10: end card
  const HOLD = 38.2; // everything is still from here: clean final frame
  const END_LOGO = { x: 140, y: 330, w: 800 };
  function endTiloTarget() {
    const k = END_LOGO.w / (LOGO_BOX[2] - LOGO_BOX[0]);
    // Tilo cut-out origin sits at logo (38,100); the logo crop starts at (37,99)
    return { x: END_LOGO.x + (38 - LOGO_BOX[0] + CENTER[0]) * k, y: END_LOGO.y + (100 - LOGO_BOX[1] + CENTER[1]) * k, s: k };
  }

  function sceneEnd(ctx, t) {
    const a = ease.inOutCubic(prog(t, 34.75, 35.35));
    if (a <= 0) return;
    const th = Math.min(t, HOLD);
    ctx.save();
    ctx.globalAlpha = a;
    World.urbanPlate(ctx, "dusk", 40 * (th - 34.75), th);
    // restrained Diwali light: three strings, a row of diyas, one distant burst
    const la = ease.inOutCubic(prog(t, 35.4, 36.6));
    World.stringLights(ctx, -40, 1460, 560, 1420, 70, 14, th, la, 1);
    World.stringLights(ctx, 520, 1420, 1120, 1480, 80, 14, th, la, 2);
    World.stringLights(ctx, -40, 1640, 1120, 1600, 110, 24, th, la * 0.85, 3);
    for (let i = 0; i < 6; i++) World.diya(ctx, 120 + i * 168, 1820, 1.1, th, la, i);
    World.firework(ctx, 880, 1290, prog(th, 36.3, 37.9), 0.7, 4);
    ctx.restore();
    scrim(ctx, a * 0.5, 1150);
    // logo plate
    const plate = ease.outBack(prog(t, 35.95, 36.4), 1.3);
    if (plate > 0) {
      const pw = 900, ph = 300, px = W / 2 - pw / 2, py = END_LOGO.y - 52;
      ctx.save();
      ctx.globalAlpha = clamp(plate * 3);
      ctx.translate(W / 2, py + ph / 2);
      ctx.scale(lerp(0.9, 1, plate), lerp(0.9, 1, plate));
      ctx.translate(-W / 2, -(py + ph / 2));
      ctx.shadowColor = "rgba(0,0,0,0.35)"; ctx.shadowBlur = 50; ctx.shadowOffsetY = 18;
      ctx.fillStyle = "#fff";
      ctx.beginPath(); ctx.roundRect(px, py, pw, ph, 44); ctx.fill();
      ctx.restore();
      const wipe = ease.inOutCubic(prog(t, 36.45, 37.0));
      const settled = prog(t, 36.95, 37.15);
      drawLogo(ctx, END_LOGO.x, END_LOGO.y, END_LOGO.w, 1, wipe, false);
      if (settled > 0) drawLogo(ctx, END_LOGO.x, END_LOGO.y, END_LOGO.w, settled, 1, true);
    }
    // headline, support, CTA
    copyBlock(ctx, t, ["FIND THE SPARK.", { text: "LIGHT UP DIWALI.", color: GOLD_LIGHT }], {
      x: W / 2, y: 790, size: 100, lead: 1.08, t0: 36.95, stagger: 0.16, align: "center", maxW: 900,
    });
    copyLine(ctx, "3 GAME DAYS · ALL INDIA", W / 2, 1010, {
      size: 38, font: FONT.bold, tracking: 6, align: "center", p: prog(t, 37.45, 37.95), color: "rgba(255,255,255,0.92)",
    });
    const cta = prog(t, 37.7, 38.15);
    if (cta > 0) {
      const s = lerp(0.7, 1, ease.outBack(cta, 1.7));
      const bw = 540, bh = 132, by = 1100;
      ctx.save();
      ctx.globalAlpha = clamp(cta * 3);
      ctx.translate(W / 2, by + bh / 2);
      ctx.scale(s, s);
      ctx.shadowColor = "rgba(14,138,80,0.55)"; ctx.shadowBlur = 36; ctx.shadowOffsetY = 12;
      ctx.fillStyle = GREEN;
      ctx.beginPath(); ctx.roundRect(-bw / 2, -bh / 2, bw, bh, bh / 2); ctx.fill();
      ctx.shadowColor = "transparent";
      ctx.fillStyle = "#fff";
      ctx.font = `58px "${FONT.black}"`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.letterSpacing = "2px";
      ctx.fillText("PLAY NOW  →", 0, 4);
      ctx.restore();
    }
  }

  function tiloEnd(t) {
    const u = prog(t, 34.95, 36.5);
    if (u <= 0) return null;
    if (t >= 37.15) return null; // the logo's own mascot takes over
    const e = ease.inOutCubic(u);
    const T = endTiloTarget();
    const P = [[-460, 1500], [120, 1300], [200, 560], [T.x, T.y]];
    const x = cubic(P[0][0], P[1][0], P[2][0], P[3][0], e), y = cubic(P[0][1], P[1][1], P[2][1], P[3][1], e);
    const dx = cubicD(P[0][0], P[1][0], P[2][0], P[3][0], e), dy = cubicD(P[0][1], P[1][1], P[2][1], P[3][1], e);
    const land = ease.inOutCubic(prog(t, 36.1, 36.5));
    return {
      x, y, s: lerp(0.66, T.s, ease.inOutCubic(prog(t, 35.6, 36.5))),
      rot: clamp(Math.atan2(dy, dx), -0.6, 0.4) * 0.6 * (1 - land),
      dashes: 1, dashPhase: (t - 35) * 4 * (1 - land), propSpeed: lerp(1, 0, land), propPhase: t * 10,
      alpha: 1 - prog(t, 36.95, 37.15),
    };
  }

  // ======================================================== copy track
  function copyTrack(ctx, t) {
    // 01
    copyBlock(ctx, t, ["YOU", "COMING?"], { y: 330, size: 150, lead: 0.98, t0: 0.5, stagger: 0.1, out: 1.9, outDur: 0.25 });
    // 02
    const tl = prog(t, 2.3, 2.55);
    copyPop(ctx, "TOO LATE!", W / 2, 470, { size: 150, p: tl, q: prog(t, 4.2, 4.45), align: "center", rot: -0.06 });
    // 03
    copyBlock(ctx, t, ["THE SPARK", "COULD BE", "ANYWHERE."], { y: 300, size: 112, lead: 1.0, t0: 5.55, out: 8.45 });
    // 04
    copyBlock(ctx, t, ["TILO'S CHECKING", "EVERYWHERE."], { y: 330, size: 104, t0: 9.35, out: 13.1, maxW: 880 });
    // 05
    copyPop(ctx, "YOUR TURN.", W / 2, 420, { size: 150, p: prog(t, 14.75, 15.1), q: prog(t, 17.55, 17.9), align: "center" });
    // 06
    copyBlock(ctx, t, ["EXPLORE.", "FOLLOW.", "DISCOVER."], { y: 330, size: 120, lead: 1.0, t0: 18.2, stagger: 0.5, dur: 0.45, out: 20.0, outDur: 0.3 });
    // 07
    copyBlock(ctx, t, ["WAIT..."], { y: 360, size: 140, t0: 23.45, out: 25.2, outDur: 0.3 });
    copyBlock(ctx, t, ["WHAT'S", "THAT?"], { y: 330, size: 140, lead: 0.98, t0: 25.7, out: 27.8, outDur: 0.3 });
    // 08
    copyPop(ctx, "GET IT!", W / 2, 440, { size: 170, p: prog(t, 28.2, 28.5), q: prog(t, 29.75, 29.95), align: "center", rot: -0.05 });
    copyPop(ctx, "FOUND IT.", W / 2, 400, { size: 150, p: prog(t, 30.32, 30.6), q: prog(t, 31.7, 31.95), align: "center" });
    copyLine(ctx, "LIGHT UP DIWALI.", W / 2, 520, { size: 84, align: "center", color: GOLD_LIGHT, p: prog(t, 30.7, 31.2), q: prog(t, 31.7, 31.95) });
  }
  // where copy sits over busy or bright pictures, a soft scrim keeps it readable
  function scrimTrack(ctx, t) {
    const a = Math.max(
      prog(t, 0.4, 0.7) * (1 - prog(t, 1.9, 2.2)) * 0.55,
      prog(t, 2.2, 2.4) * (1 - prog(t, 4.2, 4.5)) * 0.5,
      prog(t, 9.2, 9.5) * (1 - prog(t, 13.1, 13.4)) * 0.8,
      prog(t, 14.6, 14.9) * (1 - prog(t, 17.6, 17.9)) * 0.85,
      prog(t, 18.1, 18.3) * (1 - prog(t, 20.0, 20.3)) * 0.85,
      prog(t, 23.3, 23.6) * (1 - prog(t, 31.8, 32.1)) * 0.85,
    );
    scrim(ctx, a, 900);
  }

  // ========================================================= compositor
  function render(ctx, t) {
    ctx.save();
    ctx.clearRect(0, 0, W, H);
    // camera bump from the nose tap, applied to the whole frame
    const b = spring(t - TAP_T, 34, 11);
    ctx.translate(W / 2 + 10 * b, H / 2 + 7 * b);
    ctx.scale(1 + 0.014 * Math.abs(b), 1 + 0.014 * Math.abs(b));
    ctx.translate(-W / 2, -H / 2);

    if (t < 5.4) {
      sceneSky(ctx, t);
    }
    if (t >= 4.55 && t < 9.4) {
      ctx.save();
      // the map rises into view as the camera tilts down past the clouds
      const reveal = ease.inOutCubic(prog(t, 4.8, 5.0));
      ctx.globalAlpha = reveal;
      sceneIndia(ctx, t);
      ctx.restore();
    }
    if (t >= 8.95 && t < 14.05) {
      // the montage opens out of the dive along the route
      const open = ease.outCubic(prog(t, 8.95, 9.35));
      ctx.save();
      if (open < 1) {
        const yc = 1150, hh = open * H;
        ctx.beginPath(); ctx.rect(0, yc - hh, W, hh * 2); ctx.clip();
      }
      sceneMontage(ctx, t);
      ctx.restore();
      montageRibbon(ctx, t);
    }
    if (t >= 14.0 && t < 35.4) {
      sceneGame(ctx, t);
      workspaceOpen(ctx, t);
      sceneFog(ctx, t);
      const tg = tiloGame(t);
      if (tg) Tilo.draw(ctx, tg);
      sparkPulse(ctx, t);
      const warm = ease.inOutCubic(prog(t, 30.3, 31.3)) * (1 - ease.inOutCubic(prog(t, 34.8, 35.4)));
      World.warmth(ctx, warm);
      World.bokeh(ctx, t, warm * 0.9, 5, 12);
    }
    if (t >= 32.2 && t < 35.3) sceneReward(ctx, t);
    if (t >= 34.75) sceneEnd(ctx, t);

    // Tilo layers that live above their scenes
    if (t < 5.1) {
      const o = tiloSky(t);
      Tilo.draw(ctx, o);
      if (t > TAP_T - 0.02 && t < TAP_T + 0.45) {
        const [nx, ny] = Tilo.toScreen(o, Tilo.RIG.nose);
        tapRipple(ctx, t, nx + 30, ny);
      }
    }
    rushClouds(ctx, t, 4.45, 5.35);
    const ti = tiloIndia(t);
    if (ti) Tilo.draw(ctx, ti);
    if (t >= 8.95 && t < 13.9) Tilo.draw(ctx, tiloMontage(t));
    const te = tiloEnd(t);
    if (te) Tilo.draw(ctx, te);

    if (t >= 34.75 || t < 32) {
      if (t < 32) scrimTrack(ctx, t);
      copyTrack(ctx, t);
    }
    if (t >= 34.75) {
      // end-card copy draws in sceneEnd; nothing else on top
    }
    ctx.restore();
  }

  // timing table for docs / QC
  const SCENES = [
    ["01", "Funny hook", 0, 2], ["02", "Takeoff", 2, 5], ["03", "All-India hunt", 5, 9],
    ["04", "Tilo checks everywhere", 9, 14], ["05", "Enter the real game", 14, 18],
    ["06", "Explore real spaces", 18, 23], ["07", "Fog", 23, 28], ["08", "Chase the Spark", 28, 32],
    ["09", "Scratch reward", 32, 35], ["10", "Final CTA", 35, 40],
  ];

  GF.Film = { render, SCENES, HOLD };
})();
