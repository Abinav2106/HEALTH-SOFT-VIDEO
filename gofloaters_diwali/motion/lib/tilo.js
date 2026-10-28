// Tilo rig. The artwork is the official logo mascot cut out by
// tools/extract_tilo.py; nothing here redraws him. The rig only moves the whole
// cut-out (position, scale, rotation) and adds three overlays that keep to the
// source line style: the blink lid, the propeller spin shimmer and the logo's
// own speed dashes.
(function () {
  const { canvas, clamp, images } = GF;

  // measured by tools/extract_tilo.py (assets/brand/tilo_rig.json), source px
  const RIG = {
    scale: 6,
    size: [872, 465],
    eye: { c: [617.0, 50.0], r: 20.0 },
    pupil: { c: [615.0, 51.5], r: 4.5 },
    prop: { cx: 834.0, cy: 303.5, rx: 24.0, ry: 82.5 },
    nose: [674.5, 75.0],
    center: [545, 233], // middle of mascot + aircraft
    neck: [600, 160],
  };

  let propMask = null, propTmp = null, propRect = null;

  function init() {
    const img = images.tilo;
    const S = RIG.scale, p = RIG.prop;
    const x0 = Math.floor((p.cx - p.rx - 4) * S), y0 = Math.floor((p.cy - p.ry - 4) * S);
    const w = Math.ceil((p.rx * 2 + 8) * S), h = Math.ceil((p.ry * 2 + 8) * S);
    propRect = [x0 / S, y0 / S, w / S, h / S];
    const c = canvas(w, h), g = c.getContext("2d");
    g.drawImage(img, -x0, -y0);
    const d = g.getImageData(0, 0, w, h);
    for (let i = 0; i < d.data.length; i += 4) {
      const r = d.data[i], gg = d.data[i + 1], b = d.data[i + 2], a = d.data[i + 3];
      const yellow = a > 200 && r > 200 && gg > 170 && b < 170;
      d.data[i] = d.data[i + 1] = d.data[i + 2] = 255;
      d.data[i + 3] = yellow ? 255 : 0;
    }
    g.putImageData(d, 0, 0);
    propMask = c;
    propTmp = canvas(w, h);
  }

  function drawProp(ctx, phase, speed) {
    if (speed <= 0.01) return;
    const S = RIG.scale, p = RIG.prop;
    const [rx0, ry0, rw, rh] = propRect;
    const g = propTmp.getContext("2d");
    const w = propTmp.width, h = propTmp.height;
    g.globalCompositeOperation = "source-over";
    g.clearRect(0, 0, w, h);
    // two light + one shade band sweeping round the edge-on disc
    const bands = [
      ["rgba(255,246,200,0.95)", 0.0, 0.16],
      ["rgba(236,190,60,0.55)", 0.33, 0.12],
      ["rgba(255,246,200,0.8)", 0.62, 0.1],
    ];
    for (const [col, off, hgt] of bands) {
      const u = (((phase + off) % 1) + 1) % 1;
      const yc = u * h * 1.3 - h * 0.15;
      const bh = hgt * h;
      const grd = g.createLinearGradient(0, yc - bh, 0, yc + bh);
      grd.addColorStop(0, "rgba(255,255,255,0)");
      grd.addColorStop(0.5, col);
      grd.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = grd;
      g.globalAlpha = clamp(speed * 1.4);
      g.fillRect(0, yc - bh, w, bh * 2);
    }
    g.globalAlpha = 1;
    g.globalCompositeOperation = "destination-in";
    g.drawImage(propMask, 0, 0);
    ctx.drawImage(propTmp, rx0, ry0, rw, rh);
    // motion-blur halo of the disc rim at speed
    if (speed > 0.45) {
      ctx.save();
      ctx.globalAlpha = (speed - 0.45) * 0.35;
      ctx.strokeStyle = "rgba(255,226,96,1)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(p.cx + 2, p.cy, p.rx * 1.18, p.ry * 1.06, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawBlink(ctx, k) {
    if (k <= 0.001) return;
    const { c, r } = RIG.eye;
    ctx.save();
    ctx.beginPath();
    ctx.arc(c[0], c[1], r * 1.02, 0, Math.PI * 2);
    ctx.clip();
    const edge = c[1] - r * 1.05 + r * 1.2 * k;
    ctx.fillStyle = "#FEFEFE";
    ctx.fillRect(c[0] - r * 1.2, c[1] - r * 1.2, r * 2.4, edge - (c[1] - r * 1.2));
    ctx.restore();
    // lid line in the logo's inner-detail weight
    ctx.save();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 3.4;
    ctx.lineCap = "round";
    const half = Math.sqrt(Math.max(0, r * r - (edge - c[1]) ** 2)) * 0.98;
    ctx.beginPath();
    ctx.moveTo(c[0] - half, edge);
    ctx.quadraticCurveTo(c[0], edge + 3.5 * k, c[0] + half, edge);
    ctx.stroke();
    ctx.restore();
  }

  // o: {x, y, s, anchor:[ax,ay], rot, alpha, blink, propPhase, propSpeed,
  //     dashes (0..1), dashPhase}
  function draw(ctx, o) {
    const img = images.tilo;
    if (!img || (o.alpha != null && o.alpha <= 0)) return;
    const [ax, ay] = o.anchor || RIG.center;
    ctx.save();
    ctx.translate(o.x, o.y);
    if (o.rot) ctx.rotate(o.rot);
    ctx.scale(o.s, o.s);
    ctx.translate(-ax, -ay);
    if (o.alpha != null) ctx.globalAlpha = o.alpha;
    if (o.dashes > 0 && images.speedlines) {
      ctx.save();
      ctx.globalAlpha *= clamp(o.dashes);
      const wob = Math.sin((o.dashPhase || 0) * Math.PI * 2) * 10;
      const pull = (1 - clamp(o.dashes)) * 60;
      ctx.drawImage(images.speedlines, wob + pull, 0, RIG.size[0], RIG.size[1]);
      ctx.restore();
    }
    ctx.drawImage(img, 0, 0, RIG.size[0], RIG.size[1]);
    drawProp(ctx, o.propPhase || 0, o.propSpeed || 0);
    drawBlink(ctx, o.blink || 0);
    ctx.restore();
  }

  // screen position of a rig point for a given draw call
  function toScreen(o, pt) {
    const [ax, ay] = o.anchor || RIG.center;
    const dx = (pt[0] - ax) * o.s, dy = (pt[1] - ay) * o.s;
    const c = Math.cos(o.rot || 0), s = Math.sin(o.rot || 0);
    return [o.x + dx * c - dy * s, o.y + dx * s + dy * c];
  }

  GF.Tilo = { RIG, init, draw, toScreen };
})();
