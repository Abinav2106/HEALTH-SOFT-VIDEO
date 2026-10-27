/* GoFloaters Brand Studio — every control drives the real rig, real files and real patterns. */
(function () {
  'use strict';
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const M = window.GF_MANIFEST, V = GFMotion.VIEWS;
  const ROOT = '../';
  let reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  $('#reduced').checked = reduced;

  // ------------------------------------------------------------ tabs
  const onTab = {};
  $$('#tabs button').forEach(b => b.onclick = () => {
    $$('#tabs button').forEach(x => x.classList.toggle('on', x === b));
    $$('.tab').forEach(t => t.classList.toggle('on', t.id === b.dataset.tab));
    $('#tabs').classList.remove('open');
    location.hash = b.dataset.tab;
    (onTab[b.dataset.tab] || (() => {}))();
  });
  $('#menuBtn').onclick = () => $('#tabs').classList.toggle('open');

  // ------------------------------------------------------------ identity
  $$('#idSeg button').forEach(b => b.onclick = () => { $$('#idSeg button').forEach(x => x.classList.toggle('on', x === b)); $('#idImg').src = b.dataset.src; });
  $$('#idBg button').forEach(b => b.onclick = () => { $$('#idBg button').forEach(x => x.classList.toggle('on', x === b)); $('#idStage').className = 'stage ' + b.dataset.bg; });

  // ------------------------------------------------------------ rig viewer
  const rig = GoFloatersRig.create($('#rigStage'), { viewBox: V.lockup });
  const CTL = [
    ['Head & face', [['headTilt', 'Head tilt', -14, 14, .5], ['earNear', 'Near ear', -8, 8, .5], ['earFar', 'Far ear', -8, 8, .5], ['lookX', 'Eyes ←→', -1, 1, .05], ['lookY', 'Eyes ↑↓', -1, 1, .05], ['blink', 'Blink', 0, 1, .02], ['lidUpper', 'Upper lid', 0, 1, .02], ['lidLower', 'Lower lid', 0, 1, .02], ['lidTilt', 'Lid angle', -15, 15, .5], ['pupil', 'Pupil size', .6, 1.4, .02], ['happyEyes', 'Smiling eyes', 0, 1, 1]]],
    ['Mouth', [['mouthSmile', 'Smile', -1, 1, .05], ['mouthOpen', 'Open', 0, 1, .02], ['mouthWidth', 'Width', .6, 1.3, .02], ['mouthO', '“O” shape', 0, 1, .02], ['mouthTongue', 'Tongue', 0, 1, .05]]],
    ['Body & limbs', [['lean', 'Torso lean', -5, 5, .1], ['breath', 'Breathing', 0, 1, .02], ['legNear', 'Near shoulder', -120, 20, 1], ['legNearBend', 'Near elbow', -80, 20, 1], ['pawNear', 'Near wrist', -60, 40, 1], ['legFar', 'Far shoulder', -60, 15, 1], ['legFarBend', 'Far elbow', -40, 20, 1], ['pawFar', 'Far wrist', -40, 30, 1], ['tail', 'Tail root', -12, 12, .5], ['tailCurl', 'Tail curl', -4, 4, .1]]],
    ['Aircraft', [['acRot', 'Bank', -15, 15, .5], ['acX', 'Position X', -250, 250, 1], ['acY', 'Position Y', -150, 150, 1], ['propAngle', 'Propeller angle', 0, 360, 1], ['propBlur', 'Propeller blur', 0, 1, .02], ['wingFlex', 'Wing flex', -3, 3, .1], ['trailStretch', 'Trail stretch', 0, 2, .02], ['trailDrift', 'Trail drift', 0, 1, .02], ['trailPhase', 'Trail phase', 0, 1, .01]]],
    ['Dog placement', [['attached', 'Attached to seat', 0, 1, 1], ['dogX', 'Dog X', -300, 300, 1], ['dogY', 'Dog Y', -200, 200, 1], ['dogRot', 'Dog rotation', -30, 30, .5]]],
    ['Brand', [['showWordmark', 'Wordmark', 0, 1, .05], ['showTagline', 'Tagline', 0, 1, .05], ['showTrails', 'Speed lines', 0, 1, 1]]],
    ['Full body (constructed view)', [['fbSpine', 'Spine pitch', -75, 15, 1], ['fbNeck', 'Neck angle', -20, 80, 1], ['fbTail', 'Tail', -40, 80, 1], ['fbFLu', 'Fore leg', -60, 160, 1], ['fbFLl', 'Fore paw', -90, 160, 1], ['fbHLu', 'Hind leg', -80, 80, 1], ['fbHLl', 'Hind paw', -90, 90, 1]]],
  ];
  const MODES = {
    full: { vb: V.lockup, s: { body: 'seated', attached: 1, showAircraft: 1, showDog: 1, showTrails: 1, showWordmark: 1, showTagline: 1 } },
    symbol: { vb: V.symbol, s: { body: 'seated', attached: 1, showAircraft: 1, showDog: 1, showTrails: 1, showWordmark: 0, showTagline: 0 } },
    dog: { vb: V.dog, s: { body: 'seated', attached: 0, showAircraft: 0, showDog: 1, showTrails: 0, showWordmark: 0, showTagline: 0 } },
    aircraft: { vb: V.symbol, s: { body: 'seated', attached: 0, showAircraft: 1, showDog: 0, showTrails: 1, showWordmark: 0, showTagline: 0 } },
    free: { vb: V.stage, s: { body: 'free', attached: 0, showAircraft: 0, showDog: 1, showTrails: 0, showWordmark: 0, showTagline: 0, fbHipX: 520, fbHipY: 470, fbGround: 600, fbGroundLock: 1, fbNeck: 18, headTilt: -6 } },
  };
  const extra = { fbFLu: 4, fbFLl: 0, fbHLu: -6, fbHLl: 8 };
  function applyFb(s) { s.fbFL = [extra.fbFLu, extra.fbFLl]; s.fbFR = [extra.fbFLu - 8, extra.fbFLl - 2]; s.fbHL = [extra.fbHLu, extra.fbHLl]; s.fbHR = [extra.fbHLu + 10, extra.fbHLl + 2]; return s; }
  const sliders = $('#sliders'); const inputs = {};
  CTL.forEach(([g, list]) => {
    const h = document.createElement('h4'); h.textContent = g; sliders.appendChild(h);
    list.forEach(([k, label, min, max, step]) => {
      const row = document.createElement('label'); row.className = 'ctl';
      row.innerHTML = `<span>${label}</span><input type="range" min="${min}" max="${max}" step="${step}" data-k="${k}"><output></output>`;
      const inp = row.querySelector('input'), out = row.querySelector('output');
      inp.oninput = () => { const v = +inp.value; out.textContent = (Math.round(v * 100) / 100); if (k in extra) { extra[k] = v; rig.set(applyFb({})); } else rig.set({ [k]: v }); };
      inputs[k] = inp; sliders.appendChild(row);
    });
  });
  function syncSliders() { for (const k in inputs) { const v = k in extra ? extra[k] : rig.state[k]; inputs[k].value = v; inputs[k].nextElementSibling.textContent = Math.round(v * 100) / 100; } }
  let mode = 'full';
  function setMode(m) { mode = m; rig.reset(); rig.set(applyFb(Object.assign({}, MODES[m].s))); rig.svg.setAttribute('viewBox', MODES[m].vb); syncSliders(); $$('#modeSeg button').forEach(b => b.classList.toggle('on', b.dataset.mode === m)); }
  $$('#modeSeg button').forEach(b => b.onclick = () => setMode(b.dataset.mode));
  $('#rigReset').onclick = () => setMode(mode);
  $('#rigBlink').onclick = () => tween(rig, { blink: 1 }, 90, () => tween(rig, { blink: 0 }, 110));
  setMode('full');

  // simple tween helper
  function tween(r, to, ms, done) {
    const from = {}; for (const k in to) from[k] = typeof r.state[k] === 'number' ? r.state[k] : 0;
    if (reduced || !ms) { r.set(to); done && done(); return; }
    const t0 = performance.now();
    (function step(now) {
      const u = Math.min(1, (now - t0) / ms), e = GFMotion.E.inOutCubic(u), p = {};
      for (const k in to) p[k] = typeof to[k] === 'number' ? from[k] + (to[k] - from[k]) * e : to[k];
      r.set(p); if (u < 1) requestAnimationFrame(step); else done && done();
    })(t0);
  }

  // ------------------------------------------------------------ expressions
  const exRig = GoFloatersRig.create($('#exStage'), { viewBox: V.dog });
  exRig.set(MODES.dog.s);
  const EX = GFMotion.EXPRESSIONS, ORDER = GFMotion.EXPR_ORDER;
  let curEx = 'neutral';
  function targetFor(name) {
    const base = Object.assign({}, GoFloatersRig.DEFAULTS, MODES.dog.s);
    const keys = new Set(); ORDER.forEach(n => Object.keys(EX[n].s).forEach(k => keys.add(k)));
    const t = {}; keys.forEach(k => t[k] = base[k]);
    return Object.assign(t, EX[name].s);
  }
  ORDER.forEach((n, i) => {
    const b = document.createElement('button'); b.dataset.ex = n;
    b.innerHTML = `<img src="../04_CHARACTER_LIBRARY/expressions/expression_${String(i + 1).padStart(2, '0')}_${n}.svg" alt="">${EX[n].label}`;
    b.onclick = () => selectEx(n); $('#exGrid').appendChild(b);
  });
  function selectEx(n) {
    curEx = n; $$('#exGrid button').forEach(b => b.classList.toggle('on', b.dataset.ex === n));
    tween(exRig, targetFor(n), 450);
    $('#exNote').innerHTML = `<b>${EX[n].label}</b> — ${EX[n].meaning} <br>Use: ${EX[n].use}`;
  }
  selectEx('neutral');
  setInterval(() => { if (!reduced && $('#expressions').classList.contains('on') && !['relieved', 'happy', 'celebrating'].includes(curEx)) tween(exRig, { blink: 1 }, 80, () => tween(exRig, { blink: 0 }, 110)); }, 3800);

  // ------------------------------------------------------------ animations
  const vid = $('#vid'); let src = 'video', current = null, live = null, liveT = 0, liveRaf = 0, lastNow = 0, playing = true;
  const liveRig = GoFloatersRig.create($('#liveStage'), { viewBox: V.lockup });
  function nice(p) { return p.split('/').pop().replace('.mp4', '').replace(/_/g, ' '); }
  function buildList() {
    const ul = $('#animList'); ul.innerHTML = '';
    const items = src === 'video' ? M.videos.map(v => ({ id: v.path, title: nice(v.path), sub: v.path.split('/').slice(0, -1).join('/') }))
      : Object.values(GFMotion.ANIMS).map(a => ({ id: a.name, title: a.label || a.name, sub: `live rig · ${a.duration.toFixed(1)} s${a.loop ? ' · loop' : ''}` }));
    items.forEach((it, i) => { const li = document.createElement('li'); li.innerHTML = `${it.title}<small>${it.sub}</small>`; li.onclick = () => choose(it, li); ul.appendChild(li); if (i === 0) choose(it, li); });
  }
  function choose(it, li) {
    $$('#animList li').forEach(x => x.classList.toggle('on', x === li)); current = it; $('#animTitle').textContent = it.title;
    if (src === 'video') { $('#liveStage').style.display = 'none'; vid.style.display = ''; vid.src = ROOT + it.id; vid.playbackRate = +$('#speed').value; if (!reduced) vid.play().catch(() => {}); setPlaying(!reduced); }
    else { vid.pause(); vid.style.display = 'none'; $('#liveStage').style.display = 'block'; live = GFMotion.ANIMS[it.id]; liveT = 0; liveRig.svg.setAttribute('viewBox', V[live.view] || live.view); drawLive(); setPlaying(!reduced); }
  }
  function drawLive() {
    liveRig.reset(); liveRig.set(GFMotion.frame(live.name, liveT));
    liveRig.decorBack.innerHTML = ''; liveRig.decorFront.innerHTML = '';
    if (live.decor) live.decor({ back: liveRig.decorBack, front: liveRig.decorFront, el: liveRig.el }, live.loop ? liveT % live.duration : Math.min(liveT, live.duration));
    $('#time').textContent = (live.loop ? liveT % live.duration : Math.min(liveT, live.duration)).toFixed(2) + ' s';
  }
  function loop(now) {
    const dt = lastNow ? (now - lastNow) / 1000 : 0; lastNow = now;
    if (src === 'live' && live && playing) { liveT += dt * +$('#speed').value; if (!live.loop && liveT > live.duration) { liveT = live.duration; setPlaying(false); } drawLive(); }
    if (src === 'video') $('#time').textContent = (vid.currentTime || 0).toFixed(2) + ' s';
    liveRaf = requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  function setPlaying(p) { playing = p; $('#play').textContent = p ? 'Pause' : 'Play'; if (src === 'video') { p ? vid.play().catch(() => {}) : vid.pause(); } }
  $('#play').onclick = () => setPlaying(!playing);
  $('#replay').onclick = () => { if (src === 'video') { vid.currentTime = 0; setPlaying(true); } else { liveT = 0; setPlaying(true); } };
  $('#speed').onchange = () => { vid.playbackRate = +$('#speed').value; };
  $$('#animSrc button').forEach(b => b.onclick = () => { $$('#animSrc button').forEach(x => x.classList.toggle('on', x === b)); src = b.dataset.src; buildList(); });
  let animBuilt = false; onTab.animations = () => { if (!animBuilt) { buildList(); animBuilt = true; } };

  // ------------------------------------------------------------ variants
  const vars = M.files.filter(f => f.path.startsWith('02_MASTER_IDENTITY/logo_variants/') && f.path.endsWith('.png'));
  vars.forEach((f, i) => {
    const b = document.createElement('button'); const n = f.path.split('/').pop().replace('.png', '');
    b.textContent = n.replace(/^[A-Z]_/, '').replace(/_/g, ' ').replace('proposed ', '');
    b.onclick = () => { $$('#varSeg button').forEach(x => x.classList.toggle('on', x === b)); $('#varImg').src = ROOT + f.path; $('#varNote').textContent = n.includes('proposed') ? 'Proposed variant — not part of the supplied identity.' : 'Original full-colour lock-up (vector reconstruction).'; };
    $('#varSeg').appendChild(b); if (i === 0) b.click();
  });

  // ------------------------------------------------------------ patterns
  let pat = GFPatterns.list[0], patAnimated = true, patT = 0, patLast = 0;
  GFPatterns.list.forEach((n, i) => {
    const b = document.createElement('button'); b.textContent = GFPatterns.P[n].label; b.onclick = () => { pat = n; $$('#patSeg button').forEach(x => x.classList.toggle('on', x === b)); drawPat(); };
    $('#patSeg').appendChild(b); if (i === 0) b.classList.add('on');
  });
  function drawPat() {
    const st = $('#patStage'), w = Math.max(320, st.clientWidth), h = Math.max(240, st.clientHeight);
    if (!patAnimated || reduced) { st.innerHTML = `<img src="../06_BRAND_IDENTITY/patterns/pattern_${pat}.svg" style="width:100%;height:100%;object-fit:cover;max-width:none;max-height:none">`; }
    else st.innerHTML = GFPatterns.render(pat, Math.round(w), Math.round(h), patT);
    $('#patNote').textContent = 'Source: ' + GFPatterns.P[pat].source + (patAnimated && !reduced ? ' · animated, ' + GFPatterns.P[pat].period + ' s seamless loop' : ' · static file');
  }
  $('#patAnim').onclick = () => { patAnimated = true; $('#patAnim').classList.add('on'); $('#patStatic').classList.remove('on'); drawPat(); };
  $('#patStatic').onclick = () => { patAnimated = false; $('#patStatic').classList.add('on'); $('#patAnim').classList.remove('on'); drawPat(); };
  (function patLoop(now) {
    if ($('#patterns').classList.contains('on') && patAnimated && !reduced) { const dt = patLast ? (now - patLast) / 1000 : 0; patT += dt; drawPat(); }
    patLast = now; requestAnimationFrame(patLoop);
  })(0);
  onTab.patterns = drawPat;

  // ------------------------------------------------------------ gallery
  M.gallery.forEach(f => {
    const fig = document.createElement('figure');
    fig.innerHTML = `<img loading="lazy" src="${ROOT + f.path}" alt=""><figcaption>${f.path.split('/').pop().replace('.png', '').replace(/_/g, ' ')}</figcaption>`;
    fig.onclick = () => { $('#lbImg').src = ROOT + f.path; $('#lb').classList.add('on'); };
    $('#gal').appendChild(fig);
  });
  $('#lbClose').onclick = () => $('#lb').classList.remove('on');
  $('#lb').onclick = e => { if (e.target.id === 'lb') $('#lb').classList.remove('on'); };

  // ------------------------------------------------------------ assets
  const kinds = [...new Set(M.files.map(f => f.kind))].sort();
  kinds.forEach(k => { const o = document.createElement('option'); o.value = k; o.textContent = k; $('#kind').appendChild(o); });
  const fmt = b => b > 1e6 ? (b / 1e6).toFixed(1) + ' MB' : (b / 1e3).toFixed(0) + ' KB';
  function rows() {
    const q = $('#q').value.toLowerCase(), k = $('#kind').value;
    const list = M.files.filter(f => (!k || f.kind === k) && f.path.toLowerCase().includes(q));
    $('#assetRows').innerHTML = list.map(f => `<tr><td>${f.path}</td><td>${f.kind}</td><td>${fmt(f.bytes)}</td><td><a href="${ROOT + f.path}" download>Download</a></td></tr>`).join('');
    $('#count').textContent = list.length + ' files';
  }
  $('#q').oninput = rows; $('#kind').onchange = rows; rows();

  // ------------------------------------------------------------ reduced motion
  $('#reduced').onchange = e => { reduced = e.target.checked; if (reduced) { vid.pause(); setPlaying(false); } drawPat(); };
  const h = location.hash.slice(1); if (h) { const b = $(`#tabs button[data-tab="${h}"]`); b && b.click(); }
  window.STUDIO_READY = true;
})();
