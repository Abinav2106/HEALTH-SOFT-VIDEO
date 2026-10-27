/*!
 * GoFloaters motion library v1.0
 * Expressions, actions and brand animations authored as functions of time that
 * return rig control states. One master character; every animation drives the
 * same rig (gofloaters-rig.js).
 *
 * Timing language ("Freedom in Motion"):
 *   - eyes lead, head follows 3-5 frames later, ears follow the head 3-4 frames later
 *   - ease-out arrivals with a small overshoot on the aircraft only; the dog settles softly
 *   - nothing on the character moves on the same frame as everything else
 */
(function (global) {
  'use strict';
  // ------------------------------------------------------------ easing
  const E = {
    linear: t => t,
    inQuad: t => t * t, outQuad: t => t * (2 - t), inOutQuad: t => t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    inCubic: t => t * t * t, outCubic: t => (--t) * t * t + 1,
    inOutCubic: t => t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
    inOutSine: t => -(Math.cos(Math.PI * t) - 1) / 2, outSine: t => Math.sin(t * Math.PI / 2),
    outBack: t => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
    outBackSoft: t => { const c1 = 0.8, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
    inBack: t => { const c1 = 1.2, c3 = c1 + 1; return c3 * t * t * t - c1 * t * t; },
  };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const mix = (a, b, t) => Array.isArray(a) ? a.map((v, i) => mix(v, b[i], t)) : (typeof a === 'number' ? lerp(a, b, t) : (t < 0.5 ? a : b));
  // keys: [[time, value, easeIntoThisKey?], ...]
  function K(keys) {
    return t => {
      if (t <= keys[0][0]) return keys[0][1];
      for (let i = 1; i < keys.length; i++) {
        if (t <= keys[i][0]) {
          const [t0, v0] = keys[i - 1], [t1, v1, e] = keys[i];
          const u = (t - t0) / (t1 - t0 || 1);
          return mix(v0, v1, (E[e || 'inOutCubic'])(u));
        }
      }
      return keys[keys.length - 1][1];
    };
  }
  const win = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
  const TAU = Math.PI * 2;

  // ------------------------------------------------------------ views (16:9 viewBoxes in source px)
  const VIEWS = {
    lockup: '-100 -265 2200 1237.5',
    symbol: '-30 52 1000 562.5',
    dog: '218 66 720 405',
    dogWide: '150 30 900 506.25',
    stage: '120 150 960 540',
    stageWide: '20 110 1160 652.5',
    prop: '720 300 330 185.6',
    stageTall: '60 -50 1100 618.75',
    stageUp: '80 44 1040 585',
  };

  // ------------------------------------------------------------ expressions (seated pose)
  const NEUTRAL = {};
  const EXPRESSIONS = {
    neutral:     { label: 'Neutral',     meaning: 'Calm, attentive default. The logo face.', use: 'Logo lock-ups, navigation, neutral UI states.', s: {} },
    happy:       { label: 'Happy',       meaning: 'Warm welcome, a booking confirmed.', use: 'Confirmation screens, welcome messages, social replies.', s: { happyEyes: 1, mouthSmile: 1, mouthOpen: 0.35, mouthTongue: 0.7, headTilt: -4, earNear: 2.5, earFar: 3 } },
    curious:     { label: 'Curious',     meaning: 'Exploring options, “what’s around here?”', use: 'Search, discovery, map exploration.', s: { headTilt: 7, lookX: 0.7, lookY: -0.35, pupil: 1.12, mouthSmile: -0.15, mouthWidth: 0.8, mouthO: 0.2, earNear: 3.5, earFar: -3 } },
    excited:     { label: 'Excited',     meaning: 'Something great just appeared.', use: 'New spaces, offers you have verified, launches.', s: { pupil: 1.25, mouthSmile: 1, mouthOpen: 0.75, mouthTongue: 1, headTilt: -8, earNear: 4.5, earFar: 5, legNear: -28, pawNear: -18, lean: -1.5 } },
    thinking:    { label: 'Thinking',    meaning: 'Weighing a choice.', use: 'Loading, comparison tools, empty states that need input.', s: { lookX: -0.2, lookY: -0.95, lidUpper: 0.24, lidTilt: -4, mouthSmile: -0.3, mouthWidth: 0.6, mouthO: 0.22, headTilt: -7, lean: -1, earFar: -2, earNear: 1.5, legFar: -6 } },
    focused:     { label: 'Focused',     meaning: 'Heads-down, getting work done.', use: 'Productivity content, workspace features, dashboards.', s: { lidUpper: 0.36, lidTilt: 7, lookX: 0.65, lookY: 0.15, mouthSmile: -0.25, mouthWidth: 0.78, headTilt: 3, lean: 2.2, earNear: -2, earFar: -2 } },
    surprised:   { label: 'Surprised',   meaning: 'Unexpected news.', use: 'Alerts, notifications, “did you know?” facts.', s: { pupil: 0.72, mouthO: 1, headTilt: -6, earNear: 5.5, earFar: 6.5, lean: -2, legNear: -16, legFar: -6 } },
    confused:    { label: 'Confused',    meaning: 'Something doesn’t add up.', use: 'Errors, not-found states, form validation.', s: { lookX: -0.55, lookY: -0.4, lidUpper: 0.18, lidTilt: -9, mouthSmile: -0.65, mouthWidth: 0.68, mouthOpen: 0.06, headTilt: 10, earFar: -5, earNear: 4 } },
    determined:  { label: 'Determined',  meaning: 'Ready to go, let’s do this.', use: 'Calls to action, onboarding steps, campaign headlines.', s: { lidUpper: 0.3, lidTilt: 11, pupil: 0.95, lookX: 0.85, mouthSmile: 0.35, mouthWidth: 0.88, headTilt: 4, lean: 3, legNear: -10, earNear: -2.5, earFar: -2.5 } },
    sleepy:      { label: 'Sleepy',      meaning: 'Winding down, quiet hours.', use: 'Closed/after-hours states, night mode, idle timeouts.', s: { lidUpper: 0.74, lidLower: 0.24, lookY: 0.45, mouthSmile: 0.15, mouthWidth: 0.72, mouthO: 0.18, headTilt: 9, earNear: -4, earFar: -4.5, breath: 1, lean: -1 } },
    relieved:    { label: 'Relieved',    meaning: 'Problem solved, all good.', use: 'Success after error, saved, refunded, resolved.', s: { blink: 1, mouthSmile: 0.75, mouthWidth: 1.05, headTilt: -3, lean: -2, earNear: -2.5, earFar: -2.5 } },
    celebrating: { label: 'Celebrating', meaning: 'A big win.', use: 'Milestones, completed bookings, event moments.', s: { happyEyes: 1, mouthSmile: 1, mouthOpen: 0.8, mouthTongue: 1, headTilt: -10, earNear: 5, earFar: 6, legNear: -112, legNearBend: -42, pawNear: -28, legFar: -46, lean: -2 } },
  };
  const EXPR_ORDER = Object.keys(EXPRESSIONS);

  // blend an expression pose over a base
  function expr(name, w, base) {
    const out = Object.assign({}, base || {});
    const e = EXPRESSIONS[name].s;
    for (const k in e) out[k] = lerp(out[k] != null ? out[k] : 0, e[k], w);
    if (e.pupil != null) out.pupil = lerp(base && base.pupil != null ? base.pupil : 1, e.pupil, w);
    if (e.mouthWidth != null) out.mouthWidth = lerp(base && base.mouthWidth != null ? base.mouthWidth : 1, e.mouthWidth, w);
    return out;
  }
  function blendExpr(a, b, t, base) {
    const A = expr(a, 1, base), B = expr(b, 1, base), out = Object.assign({}, base || {});
    const keys = new Set([...Object.keys(A), ...Object.keys(B)]);
    const def = global.GoFloatersRig.DEFAULTS;
    keys.forEach(k => { const va = A[k] != null ? A[k] : def[k], vb = B[k] != null ? B[k] : def[k]; out[k] = mix(va, vb, t); });
    return out;
  }

  // automatic secondary motion: ears trail the head by ~0.12s
  function earFollow(fnHead, t, gain) {
    const g = gain == null ? 0.5 : gain;
    return g * (fnHead(Math.max(0, t - 0.12)) - fnHead(t));
  }
  function blinkAt(t, times, dur) {
    const d = dur || 0.16;
    let v = 0;
    for (const b of times) { const u = (t - b) / d; if (u > 0 && u < 1) v = Math.max(v, Math.sin(Math.PI * u)); }
    return v;
  }

  // ------------------------------------------------------------ base states
  const DOG_ONLY = { showAircraft: 0, showTrails: 0, showWordmark: 0, showTagline: 0, attached: 0 };
  const AIRCRAFT_ONLY = { showDog: 0, showWordmark: 0, showTagline: 0, attached: 0 };
  const SYMBOL = { showWordmark: 0, showTagline: 0 };

  // ---- full-body (v2) helpers: legs are planted with foot-target IK, so paws stay on the ground
  const G0 = 600, PAW = 10.5;
  const FREE_VIEW = '290 150 520 520';                   // stage ground line; pad depth below the foot point
  const FREE = Object.assign({}, DOG_ONLY, { body: 'free', fbGround: G0, fbGroundLock: 0, fbY: 101, headTilt: -4 });
  const HOME = { FL: 618, FR: 594, HL: 432, HR: 462 };   // standing foot x per leg (logo frame)
  const STAND_END = { FL: 8, FR: 10, HL: -2, HR: 4 };
  const plant = (leg, dx, o) => Object.assign({ x: HOME[leg] + (dx || 0), y: G0 - PAW, end: STAND_END[leg], paw: 0 }, o || {});
  const STANDING = { fbFL: plant('FL'), fbFR: plant('FR'), fbHL: plant('HL'), fbHR: plant('HR') };
  const lerpN = (a, b, k) => a + (b - a) * k;
  const lerpFoot = (a, b, k) => ({ x: lerpN(a.x, b.x, k), y: lerpN(a.y, b.y, k), end: lerpN(a.end, b.end, k), paw: lerpN(a.paw, b.paw, k) });
  // one leg of a gait cycle. u = phase 0..1; stance (0..duty) slides the planted foot back at ground
  // speed, the heel peels at push-off; swing arcs the foot forward with the pastern / hock folded.
  function step(leg, u, o) {
    u = ((u % 1) + 1) % 1;
    const fore = leg[0] === 'F', S = o.stride, home = HOME[leg] + (o.reach || 0);
    const endC = fore ? 12 : 6, endO = fore ? -28 : -34, endS = fore ? -78 : -52;
    if (u < o.duty) {
      const k = u / o.duty, peel = Math.max(0, (k - 0.72) / 0.28);
      return { x: home + S * (0.5 - k), y: G0 - PAW - 13 * Math.sin(peel * Math.PI / 2) * 0.9, end: lerpN(endC, endO, k), paw: -28 * peel };
    }
    const k = (u - o.duty) / (1 - o.duty), sk = E.inOutSine(k);
    return { x: home + S * (-0.5 + sk), y: G0 - PAW - 12 * (1 - k) * 0.9 - o.lift * Math.sin(Math.PI * k), end: k < 0.5 ? lerpN(endO, endS, k * 2) : lerpN(endS, endC, (k - 0.5) * 2),
      paw: k < 0.8 ? -28 * (1 - k) - 18 * Math.sin(Math.PI * k) : 0 };
  }

  // ------------------------------------------------------------ decor helpers (ground, props)
  function groundDecor(ctx, t, speed, y, x0, x1) {
    const g = ctx.back; const el = ctx.el;
    g.innerHTML = '';
    const off = ((t * speed) % 120 + 120) % 120;
    for (let x = x0 - 120; x < x1 + 120; x += 120) {
      const xx = x - off;
      el('line', { x1: xx, y1: y + 14, x2: xx + 54, y2: y + 14, stroke: '#050506', 'stroke-width': 6, 'stroke-linecap': 'round', opacity: 0.85 }, g);
    }
  }

  // ------------------------------------------------------------ animations
  const A = {};
  const def = (name, o) => { A[name] = Object.assign({ name, fps: 30, loop: false, view: 'lockup' }, o); };

  // ===== SIGNATURE HERO (9.0s) =====
  (function () {
    const acX = K([[0, -1500], [0.35, -1500], [2.3, 26, 'outCubic'], [3.0, -6, 'inOutSine'], [3.5, 0, 'inOutSine']]);
    const acY = K([[0, 40], [0.35, 40], [2.3, -10, 'outCubic'], [3.1, 4, 'inOutSine'], [3.8, 0, 'inOutSine']]);
    const acRot = K([[0, -7], [0.35, -7], [1.8, -3, 'outQuad'], [2.5, 2.6, 'inOutSine'], [3.2, -0.8, 'inOutSine'], [3.8, 0, 'inOutSine']]);
    const lookX = K([[0, 0.25], [3.25, 0.25], [3.55, 0.95, 'outCubic'], [4.6, 0.95], [5.0, -0.1, 'inOutCubic'], [6.0, -0.1], [6.5, 0, 'inOutCubic']]);
    const lookY = K([[0, 0], [3.25, 0], [3.55, -0.25, 'outCubic'], [4.6, -0.25], [5.0, 0.05, 'inOutCubic'], [6.5, 0, 'inOutCubic']]);
    const head = K([[0, 0], [3.42, 0], [3.95, -7, 'outBackSoft'], [5.0, -7], [5.6, -2, 'inOutCubic'], [6.6, 0, 'inOutSine']]);
    const legN = K([[0, 0], [4.05, 0], [4.45, -80, 'outCubic'], [5.55, -80], [6.05, 0, 'inOutCubic']]);
    const bendN = K([[0, 0], [4.05, 0], [4.45, -50, 'outCubic'], [5.55, -50], [6.05, 0, 'inOutCubic']]);
    const smile = K([[0, 0], [3.9, 0], [4.25, 1, 'outCubic'], [5.6, 1], [6.3, 0, 'inOutCubic']]);
    const open = K([[0, 0], [4.0, 0], [4.3, 0.35, 'outCubic'], [5.4, 0.35], [5.9, 0, 'inOutCubic']]);
    const squint = K([[0, 0.18], [2.6, 0.18], [3.2, 0, 'inOutSine']]);
    const prop = K([[0, 0], [6.6, 4200, 'linear'], [8.0, 4560, 'outCubic']]);
    const blur = K([[0, 1], [3.0, 1], [4.2, 0.5, 'inOutSine'], [6.4, 0.5], [7.6, 0, 'inOutSine']]);
    const trailDrift = K([[0, 1], [3.2, 1], [6.8, 0.25, 'inOutSine'], [7.8, 0, 'inOutSine']]);
    const trailStretch = K([[0, 0.2], [0.4, 0.2], [1.6, 1.7, 'outCubic'], [3.4, 1.25, 'inOutSine'], [7.8, 1, 'inOutSine']]);
    const trailOp = K([[0, 0], [0.3, 0], [0.8, 1, 'outQuad']]);
    def('hero', {
      duration: 9.0, view: 'lockup', label: 'Signature hero — Freedom in Motion',
      fn(t) {
        const s = { attached: 1, showWordmark: 1, showTagline: 1 };
        s.acX = acX(t); s.acY = acY(t) + (t > 3.8 && t < 7 ? 2.2 * Math.sin((t - 3.8) * 2.4) * (1 - win(t, 5.5, 7)) : 0); s.acRot = acRot(t);
        s.propAngle = prop(t); s.propBlur = blur(t);
        s.trailDrift = trailDrift(t); s.trailPhase = t * 0.9; s.trailStretch = trailStretch(t); s.trailOpacity = trailOp(t);
        s.lookX = lookX(t); s.lookY = lookY(t); s.headTilt = head(t);
        const e = earFollow(head, t, 0.55);
        const wind = (1 - win(t, 2.4, 3.6)) * 1.6 * Math.sin(t * 19);
        s.earNear = e + wind; s.earFar = e * 1.15 + wind * 1.2;
        s.lidUpper = squint(t);
        s.legNear = legN(t); s.legNearBend = bendN(t);
        // greeting: two soft waves of the paw while raised
        const w = win(t, 4.45, 5.55);
        s.pawNear = -18 + (w > 0 && w < 1 ? 22 * Math.sin(w * TAU * 2) : 0) * Math.sin(Math.PI * w);
        if (t < 4.05 || t > 6.05) s.pawNear = 0; else if (t < 4.45) s.pawNear = -18 * win(t, 4.05, 4.45); else if (t > 5.55) s.pawNear = -18 * (1 - win(t, 5.55, 6.05));
        s.mouthSmile = smile(t); s.mouthOpen = open(t); s.mouthTongue = 0.6;
        s.happyEyes = 0;
        s.blink = blinkAt(t, [1.9, 6.75]);
        s.tailCurl = 1.6 * Math.sin(t * 3.1) * (1 - win(t, 7.2, 8.2));
        s.lean = -0.8 * (1 - win(t, 2.5, 3.5));
        s.breath = 0.5 + 0.5 * Math.sin(t * 2.2);
        // wordmark: letters rise in sequence, tagline words follow
        s.letters = []; for (let i = 0; i < 10; i++) { const u = E.outBackSoft(win(t, 6.0 + i * 0.07, 6.55 + i * 0.07)); s.letters.push([0, (1 - u) * 46, clamp(win(t, 6.0 + i * 0.07, 6.35 + i * 0.07), 0, 1)]); }
        s.words = []; for (let i = 0; i < 5; i++) { const u = E.outCubic(win(t, 6.9 + i * 0.09, 7.4 + i * 0.09)); s.words.push([(1 - u) * -24, 0, u]); }
        s.masterLock = win(t, 8.55, 8.85);
        if (t >= 8.85) return { masterLock: 1, showWordmark: 1, showTagline: 1 };
        return s;
      }
    });
  })();
  def('hero_reduced', {
    duration: 4.0, view: 'lockup', label: 'Signature hero — reduced motion',
    // no travel, no rotation: the finished lock-up fades in and the mascot blinks once
    fn(t) {
      const o = E.inOutSine(win(t, 0, 1.0));
      return { showDog: o, showAircraft: o, showTrails: 1, trailOpacity: o, showWordmark: o, showTagline: o, blink: blinkAt(t, [2.4], 0.2) };
    }
  });

  // ===== CHARACTER ACTIONS =====
  def('flying', {
    duration: 4, loop: true, view: 'symbol', label: 'Flying',
    fn(t) {
      const p = t / 4 * TAU;
      return Object.assign({}, SYMBOL, { attached: 1, acRot: 3.2 * Math.sin(p), acY: -10 * Math.sin(p + 0.6), acX: 6 * Math.sin(p * 0.5),
        propAngle: t * 1440, propBlur: 1, trailDrift: 1, trailPhase: t * 1.1, trailStretch: 1.35 + 0.15 * Math.sin(p * 2),
        earNear: 1.8 * Math.sin(t * 17) - 2, earFar: 2.2 * Math.sin(t * 17 + 0.7) - 2.2, lidUpper: 0.16, mouthSmile: 0.55, tailCurl: 1.5 * Math.sin(p * 2 + 1),
        headTilt: -2 + 1.5 * Math.sin(p - 0.4), lean: -0.6 + 0.6 * Math.sin(p), lookX: 0.4, blink: blinkAt(t, [1.3]) });
    }
  });
  def('standing', {
    duration: 4, loop: true, view: 'stage', label: 'Standing (constructed full body)',
    fn(t) {
      const br = Math.sin(t / 4 * TAU * 2);
      return Object.assign({}, FREE, STANDING, { fbY: 101 + 0.8 * br, breath: 0.5 + 0.5 * br, tailCurl: 1.2 * Math.sin(t / 4 * TAU), blink: blinkAt(t, [1.6]), mouthSmile: 0.45 });
    },
    decor(ctx, t) { groundDecor(ctx, 0, 0, G0, 100, 1100); }
  });
  // walk: lateral sequence (LH, LF, RH, RF), 1 s cycle, 62 % duty, ground speed = stride / (duty * T)
  const WALK = { T: 1.0, duty: 0.62, stride: 72, lift: 16 };
  def('walking', {
    duration: 2, loop: true, view: 'stage', label: 'Walking', groundSpeed: WALK.stride / (WALK.duty * WALK.T),
    fn(t) {
      const u = t / WALK.T, p = u * TAU;
      return Object.assign({}, FREE, {
        fbY: 108 + 2 * Math.sin(2 * p + 0.5), fbPitch: 0.8 * Math.sin(2 * p),
        fbHL: step('HL', u, WALK), fbFL: step('FL', u - 0.25, WALK), fbHR: step('HR', u - 0.5, WALK), fbFR: step('FR', u - 0.75, WALK),
        headTilt: -4 + 1.6 * Math.sin(2 * p + 0.9), fbHeadY: 1.5 * Math.sin(2 * p + 1.2),
        fbTail: 8 * Math.sin(p), tailCurl: 1.2 * Math.sin(p - 0.8), earNear: 2 * Math.sin(2 * p - 0.4), earFar: 2.4 * Math.sin(2 * p - 0.2),
        mouthSmile: 0.5, lookX: 0.5, blink: blinkAt(t, [1.2]) });
    },
    decor(ctx, t) { groundDecor(ctx, t, WALK.stride / (WALK.duty * WALK.T), G0, 100, 1100); }
  });
  // run: rotary gallop, 0.5 s cycle, short stance, suspension phase with the body rising and pitching
  const RUN = { T: 0.5, duty: 0.36, stride: 104, lift: 34, reach: 8 };
  const runPose = (t, slow) => {
    const u = t / RUN.T, p = u * TAU, o = Object.assign({}, RUN, { stride: RUN.stride * slow, lift: RUN.lift * slow });
    return {
      fbY: 112 - 7 * Math.max(0, Math.sin(p * 1 - 2.2)) * slow, fbPitch: 5 * Math.sin(p + 0.6) * slow, fbX: -10 * slow,
      fbHL: step('HL', u, o), fbHR: step('HR', u - 0.1, o), fbFL: step('FL', u - 0.48, o), fbFR: step('FR', u - 0.58, o),
      fbHeadFollow: 0.6, headTilt: -2 + 2 * Math.sin(p + 0.8), fbTail: 30 + 6 * Math.sin(p * 2), tailCurl: -1.5,
      earNear: -4 + 4 * Math.sin(p - 0.8), earFar: -4 + 4.5 * Math.sin(p - 0.6) };
  };
  def('running', {
    duration: 1.5, loop: true, view: 'stage', label: 'Running', groundSpeed: RUN.stride / (RUN.duty * RUN.T),
    fn(t) { return Object.assign({}, FREE, runPose(t, 1), { lidUpper: 0.12, mouthSmile: 0.8, mouthOpen: 0.4, mouthTongue: 1, lookX: 0.7 }); },
    decor(ctx, t) { groundDecor(ctx, t, RUN.stride / (RUN.duty * RUN.T), G0, 100, 1100); }
  });
  // jump & land: anticipation crouch (paws stay planted), push-off, tucked flight, landing absorb, settle
  const jumpPose = (t, k) => {
    const air = k.air(t), crouch = k.crouch(t), inAir = k.inAir(t);
    const tuck = (leg, dx, dy, end) => ({ x: HOME[leg] + dx, y: G0 - PAW - air + dy, end, paw: -30 });
    const legs = {};
    [['FL', 34, -44, -70], ['FR', 22, -40, -64], ['HL', -16, -30, -40], ['HR', -6, -26, -36]].forEach(([leg, dx, dy, end]) => {
      legs['fb' + leg] = lerpFoot(plant(leg), tuck(leg, dx, dy, end), inAir);
    });
    return Object.assign(legs, { fbY: 101 + 22 * crouch - air, fbPitch: k.pitch(t), fbHeadFollow: 0.5, fbShadow: 1 });
  };
  const JUMP = {
    air: K([[0, 0], [0.62, 0], [0.8, 45, 'outQuad'], [1.1, 96, 'outQuad'], [1.4, 45, 'inQuad'], [1.55, 0, 'inQuad'], [2.4, 0]]),
    crouch: K([[0, 0], [0.45, 1, 'inOutCubic'], [0.66, -0.15, 'outCubic'], [1.4, 0], [1.56, 0], [1.7, 0.9, 'outCubic'], [2.1, 0, 'inOutCubic']]),
    inAir: K([[0, 0], [0.64, 0], [0.82, 1, 'outCubic'], [1.3, 1], [1.5, 0, 'inOutSine'], [2.4, 0]]),
    pitch: K([[0, 0], [0.45, 4], [0.7, -14, 'outCubic'], [1.1, 0], [1.45, 8, 'inOutSine'], [1.75, 3], [2.1, 0]]),
  };
  def('jumping', {
    duration: 2.4, view: 'stage', label: 'Jump and land',
    fn(t) {
      const tk = JUMP.inAir(t);
      return Object.assign({}, FREE, jumpPose(t, JUMP), {
        headTilt: -4 + 5 * JUMP.crouch(t) - 4 * tk, fbTail: 15 * tk + 6 * Math.sin(t * 6),
        earNear: -6 * tk + 4 * Math.max(0, JUMP.crouch(t)), earFar: -7 * tk + 4.5 * Math.max(0, JUMP.crouch(t)),
        pupil: 1 + 0.15 * tk, mouthSmile: 0.6 + 0.4 * tk, mouthOpen: 0.5 * tk, mouthTongue: 1, lookX: 0.6 });
    },
    decor(ctx, t) { groundDecor(ctx, 0, 0, G0, 100, 1100); }
  });
  def('landing', {
    duration: 1.4, view: 'stage', label: 'Landing (absorb and settle)',
    fn(t) {
      const tt = 1.12 + t;                      // the landing half of the jump curve
      const tk = JUMP.inAir(tt);
      return Object.assign({}, FREE, jumpPose(tt, JUMP), { headTilt: -4 + 5 * JUMP.crouch(tt), fbTail: 15 * tk,
        earNear: 6 * Math.sin(Math.PI * win(t, 0.4, 1.0)) - 3 * tk, earFar: 7 * Math.sin(Math.PI * win(t, 0.42, 1.05)) - 3 * tk, mouthSmile: 0.7, blink: blinkAt(t, [0.45], 0.14) });
    },
    decor(ctx, t) { groundDecor(ctx, 0, 0, G0, 100, 1100); }
  });
  // upright on the hind legs (hind paws planted), forelegs free
  const upright = (pitch, airY) => ({ fbPitch: pitch, fbY: 101 - (airY || 0), fbX: 40, fbHeadFollow: 0.25,
    fbHL: plant('HL', 30, { y: G0 - PAW - (airY || 0), end: 10 }), fbHR: plant('HR', 18, { y: G0 - PAW - (airY || 0), end: 14 }) });
  def('dancing', {
    duration: 4, loop: true, view: 'stageUp', label: 'Dancing',
    fn(t) {
      const p = t / 0.5 * Math.PI;              // 120 bpm
      const sway = Math.sin(p), bounce = Math.abs(Math.sin(p));
      return Object.assign({}, FREE, expr('happy', 1), upright(-50 + 5 * sway, 8 * bounce), {
        fbFL: [70 + 40 * Math.sin(p), 40 + 50 * Math.sin(p + 0.6), 20 + 40 * Math.sin(p + 1)], fbFR: [110 - 40 * Math.sin(p), 80 - 40 * Math.sin(p + 0.6), 60 - 30 * Math.sin(p + 1)],
        headTilt: 8 * Math.sin(p + 0.5), fbTail: 20 + 25 * Math.sin(p * 2), earNear: 5 * Math.sin(p - 0.6), earFar: 6 * Math.sin(p - 0.4), mouthOpen: 0.4 + 0.2 * bounce });
    },
    decor(ctx, t) { groundDecor(ctx, 0, 0, G0, 100, 1100); }
  });
  (function () {
    const air = K([[0, 0], [0.35, 0], [0.6, 50, 'outQuad'], [0.95, 70, 'outQuad'], [1.3, 0, 'inQuad'], [1.9, 0], [2.15, 34, 'outQuad'], [2.5, 0, 'inQuad'], [3, 0]]);
    def('celebrating', {
      duration: 3, loop: true, view: 'stageUp', label: 'Small celebration',
      fn(t) {
        const up = win(t, 0.3, 0.55) * (1 - win(t, 1.25, 1.5)) + win(t, 2.0, 2.15) * (1 - win(t, 2.4, 2.55));
        const a = air(t), tuck = Math.min(1, a / 60);
        const s = Object.assign({}, FREE, expr('celebrating', 1), upright(-46 - 8 * up, a), {
          fbFL: [120 + 20 * up, 150 + 12 * Math.sin(t * 18) * up, 160], fbFR: [140 + 15 * up, 165, 170],
          headTilt: -8 * up + 4, fbTail: 30 + 30 * Math.sin(t * 14), earNear: 6 * up - 2, earFar: 7 * up - 2 });
        s.fbHL.end = 10 - 50 * tuck; s.fbHL.paw = -30 * tuck; s.fbHL.x -= 14 * tuck;
        s.fbHR.end = 14 - 46 * tuck; s.fbHR.paw = -30 * tuck; s.fbHR.x -= 10 * tuck;
        return s;
      },
      decor(ctx, t) {
        groundDecor(ctx, 0, 0, G0, 0, 1200);
        const g = ctx.front; g.innerHTML = ''; const el = ctx.el;
        [0.35, 2.0].forEach(t0 => {
          const u = win(t, t0, t0 + 0.6); if (u <= 0 || u >= 1) return;
          for (let i = 0; i < 8; i++) {
            const a = i / 8 * TAU, r0 = 150 + 120 * E.outCubic(u), r1 = r0 + 40 * (1 - u);
            el('line', { x1: 600 + Math.cos(a) * r0, y1: 300 + Math.sin(a) * r0 * 0.8, x2: 600 + Math.cos(a) * r1, y2: 300 + Math.sin(a) * r1 * 0.8, stroke: i % 2 ? '#6ED0E0' : '#FCE162', 'stroke-width': 9, 'stroke-linecap': 'round', opacity: 1 - u }, g);
          }
        });
      }
    });
  })();
  // sleeping: lying down, forelegs folded forward on the ground, hind legs tucked, slow breathing
  def('sleeping', {
    duration: 4, loop: true, view: 'stage', label: 'Sleeping',
    fn(t) {
      const br = Math.sin(t / 4 * TAU * 2);
      return Object.assign({}, FREE, {
        fbY: 206 + 1.2 * br, fbPitch: 0, fbHeadX: 70, fbHeadY: 96 + 1.5 * br, headTilt: 20 + 1.2 * br, fbHeadFollow: 0,
        fbFL: { x: 760, y: G0 - PAW, end: 92, paw: 0 }, fbFR: { x: 740, y: G0 - PAW - 4, end: 92, paw: 0 }, fbHL: { x: 528, y: G0 - PAW, end: 92, paw: 0 }, fbHR: { x: 548, y: G0 - PAW - 4, end: 92, paw: 0 }, fbTail: 96, tailCurl: 1.6,
        blink: 1, mouthSmile: 0.3, mouthWidth: 0.7, earNear: -6, earFar: -7, fbShadow: 1.4, breath: 0.5 + 0.5 * br });
    },
    decor(ctx, t) {
      groundDecor(ctx, 0, 0, G0, 100, 1100);
      const g = ctx.front; g.innerHTML = ''; const el = ctx.el;
      for (let i = 0; i < 3; i++) {
        const u = ((t / 4) + i / 3) % 1;
        const tx = el('text', { x: 860 + u * 60 + i * 6, y: 420 - u * 120, 'font-family': 'Inter, sans-serif', 'font-weight': 800, 'font-size': 26 + u * 22, fill: '#050506', opacity: Math.sin(Math.PI * u) }, g);
        tx.textContent = 'z';
      }
    }
  });
  // stretching: play-bow - chest lowered, forelegs reaching forward along the ground, hips held high
  def('stretching', {
    duration: 3.6, loop: true, view: 'stage', label: 'Stretching (play bow)',
    fn(t) {
      const k = E.inOutCubic(win(t, 0.3, 1.2)) * (1 - E.inOutCubic(win(t, 2.6, 3.4)));
      const s = Object.assign({}, FREE, STANDING, {
        fbPitch: 22 * k, fbY: 101 - 4 * k, fbHeadFollow: 0.15, headTilt: -10 * k, fbHeadY: -6 * k,
        fbTail: 30 * k + 6 * Math.sin(t * 5) * k, tailCurl: -1 * k, blink: Math.sin(Math.PI * win(t, 1.4, 2.4)),
        mouthOpen: 0.7 * Math.sin(Math.PI * win(t, 1.5, 2.3)), mouthSmile: 0.4, earNear: -4 * k, earFar: -5 * k });
      s.fbFL = lerpFoot(plant('FL'), plant('FL', 70, { end: 76, paw: 0 }), k);
      s.fbFR = lerpFoot(plant('FR'), plant('FR', 64, { end: 74, paw: 0 }), k);
      return s;
    },
    decor(ctx, t) { groundDecor(ctx, 0, 0, G0, 100, 1100); }
  });
  // looking around: eyes lead, head follows, ears trail; the body stays planted
  def('looking_around', {
    duration: 4.4, loop: true, view: 'stage', label: 'Looking around',
    fn(t) {
      const look = K([[0, 0.2], [0.3, 0.95, 'inOutCubic'], [1.2, 0.95], [1.5, -0.9, 'inOutCubic'], [2.5, -0.9], [2.8, 0.1, 'inOutCubic'], [3.4, 0.1, ''], [3.7, 0.2]]);
      const ly = K([[0, 0], [0.3, -0.5], [1.5, 0.2], [2.8, -0.7], [3.4, -0.7], [3.8, 0]]);
      const head = K([[0, 0], [0.45, -7, 'inOutCubic'], [1.3, -7], [1.7, 6, 'inOutCubic'], [2.6, 6], [3.0, -4, 'inOutCubic'], [3.6, -4], [4.1, 0, 'inOutCubic']]);
      const hd = x => head(Math.max(0, x - 0.12));
      return Object.assign({}, FREE, STANDING, expr('curious', 0.6), {
        lookX: look(t), lookY: ly(t), headTilt: -4 + hd(t), fbHeadY: -0.4 * hd(t),
        earNear: earFollow(hd, t) + 1, earFar: earFollow(hd, t) * 1.2 - 1, fbTail: 6 * Math.sin(t * 2), blink: blinkAt(t, [1.4, 3.1]) });
    },
    decor(ctx, t) { groundDecor(ctx, 0, 0, G0, 100, 1100); }
  });
  // pointing (standing): near foreleg lifts and extends toward the target, weight shifts back
  def('pointing_standing', {
    duration: 3.4, loop: true, view: 'stage', label: 'Pointing (standing)',
    fn(t) {
      const up = E.outBackSoft(win(t, 0.4, 0.95)) * (1 - E.inOutCubic(win(t, 2.7, 3.2)));
      const head = x => -5 * E.inOutCubic(win(x, 0.3, 0.75)) * (1 - win(x, 2.75, 3.2));
      const s = Object.assign({}, FREE, STANDING, expr('determined', 0.6 * up), {
        fbPitch: -3 * up, fbX: -6 * up, lookX: 0.95 * up, headTilt: -4 + head(t), earNear: earFollow(head, t) - 1, earFar: earFollow(head, t) - 1.2,
        mouthSmile: 0.5 + 0.3 * up, fbTail: 10 * up + 4 * Math.sin(t * 4) });
      const lifted = { x: HOME.FL + 30, y: G0 - PAW - 44, end: -30, paw: -20 }, point = { x: HOME.FL + 128, y: G0 - PAW - 112, end: 92, paw: 30 };
      s.fbFL = up < 0.4 ? lerpFoot(plant('FL'), lifted, Math.max(0, up) / 0.4) : lerpFoot(lifted, point, (up - 0.4) / 0.6);
      s.fbFR = plant('FR', -4); s.fbHL = plant('HL', 4); s.fbHR = plant('HR', 4);
      return s;
    },
    decor(ctx, t) { groundDecor(ctx, 0, 0, G0, 100, 1100); }
  });
  def('waving', {
    duration: 3, loop: true, view: 'dog', label: 'Waving',
    fn(t) {
      const up = E.outCubic(win(t, 0.1, 0.5)) * (1 - E.inOutCubic(win(t, 2.4, 2.9)));
      const w = win(t, 0.5, 2.4);
      const head = x => -5 * E.inOutCubic(win(x, 0.25, 0.6)) * (1 - win(x, 2.4, 2.9));
      return Object.assign({}, DOG_ONLY, expr('happy', E.inOutCubic(win(t, 0.2, 0.55)) * (1 - win(t, 2.5, 2.95))), {
        legNear: -82 * up, legNearBend: -52 * up, pawNear: up * (-14 + 26 * Math.sin(w * TAU * 3)),
        headTilt: head(t), earNear: earFollow(head, t) + 2, earFar: earFollow(head, t) * 1.2 + 2.5, lookX: 0.9 * up, tailCurl: 2 * Math.sin(t * 6), breath: 0.5 + 0.5 * Math.sin(t * 2) });
    }
  });
  def('pointing', {
    duration: 3.2, loop: true, view: 'dogWide', label: 'Pointing',
    fn(t) {
      const up = E.outBackSoft(win(t, 0.35, 0.8)) * (1 - E.inOutCubic(win(t, 2.6, 3.1)));
      const look = K([[0, 0], [0.15, 1, 'outCubic'], [1.6, 1], [1.85, 0.15, 'inOutCubic'], [2.4, 0.15], [2.6, 1, 'inOutCubic'], [3.2, 0]]);
      const head = x => -4 * E.inOutCubic(win(x, 0.25, 0.7)) * (1 - win(x, 2.7, 3.1)) + 3 * Math.sin(Math.PI * win(x, 1.8, 2.5));
      return Object.assign({}, DOG_ONLY, expr('determined', 0.7 * up), {
        legNear: -50 * up, legNearBend: 4 * up, pawNear: 10 * up, lookX: look(t) * 0.95, lookY: -0.1,
        headTilt: head(t), earNear: earFollow(head, t) - 1, earFar: earFollow(head, t) - 1.2, mouthSmile: 0.5 * up, lean: 2.5 * up });
    },
    decor(ctx, t) {
      const g = ctx.front; g.innerHTML = '';
      const o = E.outCubic(win(t, 0.75, 1.1)) * (1 - win(t, 2.6, 2.9));
      if (o <= 0) return;
      // proposed motif: dashed flight path pointing at a destination pin
      const el = ctx.el; const x0 = 760, y0 = 300;
      el('path', { d: `M${x0},${y0} C ${x0 + 60},${y0 - 40} ${x0 + 120},${y0 - 30} ${x0 + 150},${y0 - 70}`, fill: 'none', stroke: '#050506', 'stroke-width': 5, 'stroke-dasharray': '14 12', 'stroke-linecap': 'round', opacity: o }, g);
      el('circle', { cx: x0 + 160, cy: y0 - 84, r: 14 * o, fill: '#6ED0E0', stroke: '#050506', 'stroke-width': 5 }, g);
    }
  });
  def('searching', {
    duration: 4, loop: true, view: 'dog', label: 'Searching',
    fn(t) {
      const look = K([[0, 0.2], [0.4, -0.9, 'inOutCubic'], [1.1, -0.9], [1.5, 0.95, 'inOutCubic'], [2.3, 0.95], [2.6, 0.3, 'inOutCubic'], [3.2, 0.3], [3.6, 0.2]]);
      const head = K([[0, 0], [0.5, -7, 'inOutCubic'], [1.2, -7], [1.6, 6, 'inOutCubic'], [2.4, 6], [2.8, -3, 'inOutCubic'], [3.6, 0]]);
      const ly = K([[0, 0], [0.4, -0.6], [1.5, 0.3], [2.6, -0.2], [4, 0]]);
      const hd = x => head(Math.max(0, x - 0.1));
      return Object.assign({}, DOG_ONLY, expr('curious', 0.6), {
        lookX: look(t), lookY: ly(t), headTilt: hd(t), lean: 2 + 2 * Math.sin(t * 1.6),
        earNear: earFollow(hd, t) + 3, earFar: earFollow(hd, t) * 1.2 - 2, legFar: -8 * Math.sin(Math.PI * win(t, 2.6, 3.4)), blink: blinkAt(t, [1.35, 3.0]) });
    }
  });
  def('surprise', {
    duration: 2.6, loop: true, view: 'dog', label: 'Reacting to surprise',
    fn(t) {
      const hit = E.outBack(win(t, 0.3, 0.5)) * (1 - E.inOutCubic(win(t, 1.7, 2.3)));
      const hop = Math.sin(Math.PI * win(t, 0.3, 0.62));
      const head = x => -7 * E.outBack(win(x, 0.32, 0.5)) * (1 - E.inOutCubic(win(x, 1.7, 2.3)));
      return Object.assign({}, DOG_ONLY, expr('surprised', hit), {
        dogY: -22 * hop, headTilt: head(t), earNear: 6 * hit + earFollow(head, t, 0.8), earFar: 7 * hit + earFollow(head, t, 0.9),
        blink: blinkAt(t, [0.22], 0.12), legNear: -20 * hit, legFar: -10 * hit, tailCurl: -2 * hit });
    }
  });
  // ===== WEBSITE HERO (standing dog beside the search field) =====
  // heroPose(t, point): t drives the idle loop, point (0..1) blends the point-toward-search gesture.
  // Idle order per brief: eyes move first, then a small head tilt, ears follow through, back to neutral.
  const heroLook = K([[0, 0.15], [0.5, 0.15], [0.8, 0.95, 'inOutCubic'], [2.9, 0.95], [3.3, 0.15, 'inOutCubic'], [6, 0.15]]);
  const heroLookY = K([[0, 0], [0.5, 0], [0.8, 0.35, 'inOutCubic'], [2.9, 0.35], [3.3, 0, 'inOutCubic'], [6, 0]]);
  const heroHead = K([[0, 0], [1.0, 0], [1.5, 5, 'inOutCubic'], [2.8, 5], [3.5, 0, 'inOutCubic'], [6, 0]]);
  function heroPose(t, point) {
    t = ((t % 6) + 6) % 6; point = clamp(point || 0, 0, 1.15);
    const hd = x => heroHead(((x % 6) + 6) % 6);
    const br = Math.sin(t / 6 * TAU * 3);
    const s = Object.assign({}, FREE, STANDING, {
      fbY: 101 + 0.7 * br, breath: 0.5 + 0.5 * br, mouthSmile: 0.45,
      lookX: lerp(heroLook(t), 0.95, Math.min(1, point)), lookY: lerp(heroLookY(t), 0.25, Math.min(1, point)),
      headTilt: -4 + hd(t) * (1 - Math.min(1, point)) - 3 * point,
      earNear: earFollow(hd, t, 0.7) * (1 - Math.min(1, point)), earFar: earFollow(hd, t, 0.8) * (1 - Math.min(1, point)),
      fbTail: 4 * Math.sin(t / 6 * TAU) + 12 * point, tailCurl: 0.8 * Math.sin(t / 6 * TAU * 2), blink: blinkAt(t, [4.4]),
    });
    if (point > 0.001) {
      Object.assign(s, { fbPitch: -3 * point, fbX: -6 * point, mouthSmile: 0.45 + 0.35 * point });
      const lifted = { x: HOME.FL + 30, y: G0 - PAW - 44, end: -30, paw: -20 }, aim = { x: HOME.FL + 128, y: G0 - PAW - 112, end: 92, paw: 30 };
      s.fbFL = point < 0.4 ? lerpFoot(plant('FL'), lifted, point / 0.4) : lerpFoot(lifted, aim, (point - 0.4) / 0.6);
      s.fbFR = plant('FR', -4 * point); s.fbHL = plant('HL', 4 * point); s.fbHR = plant('HR', 4 * point);
    }
    return s;
  }
  def('hero_idle', {
    duration: 6, loop: true, view: FREE_VIEW, label: 'Website hero idle (eyes, head tilt, ear follow-through)',
    fn(t) { return heroPose(t, 0); },
    decor(ctx, t) { }
  });
  def('hero_point', {
    duration: 3.6, view: FREE_VIEW, label: 'Website hero: point toward the search result',
    fn(t) {
      const p = E.outBackSoft(win(t, 0.3, 0.9)) * (1 - E.inOutCubic(win(t, 2.8, 3.4)));
      return heroPose(1.0 + t, p);
    }
  });

  // ===== RIG PROOF (first proof of completion) =====
  def('rig_demo', {
    duration: 14, view: 'lockup', label: 'Rig proof: controls, independence, modes',
    fn(t) {
      const s = { attached: 1 };
      // 0-4.5s: face + limbs on the attached dog
      const head = K([[0, 0], [0.9, 0], [1.3, -9, 'outBackSoft'], [2.0, -9], [2.4, 7, 'inOutCubic'], [3.0, 7], [3.4, 0, 'inOutCubic']]);
      s.headTilt = head(t);
      s.earNear = earFollow(head, t, 0.6) + 4 * Math.sin(Math.PI * win(t, 3.4, 4.0));
      s.earFar = earFollow(head, t, 0.7) + 5 * Math.sin(Math.PI * win(t, 3.45, 4.05));
      s.blink = blinkAt(t, [0.4, 0.75, 4.4], 0.18);
      s.lookX = K([[0, 0], [0.8, 0], [1.0, 0.9], [2.0, 0.9], [2.2, -0.6], [3.0, -0.6], [3.3, 0]])(t);
      const paw = Math.sin(Math.PI * win(t, 2.6, 4.2));
      s.legNear = -55 * paw; s.legNearBend = -30 * paw; s.pawNear = -25 * paw;
      s.tailCurl = 2 * Math.sin(t * 5) * (1 - win(t, 4, 4.5));
      // 4.5-8.5s: aircraft moves on its own path, propeller spins (dog hidden to prove independence)
      const ac = win(t, 4.5, 8.5);
      if (ac > 0 && ac < 1) {
        s.showDog = t < 4.8 ? 1 - win(t, 4.5, 4.8) : (t > 8.2 ? win(t, 8.2, 8.5) : 0);
        s.acRot = 8 * Math.sin(ac * TAU); s.acY = -40 * Math.sin(ac * TAU * 2) * Math.sin(Math.PI * ac); s.acX = 60 * Math.sin(ac * TAU);
        s.propAngle = (t - 4.5) * 1600; s.propBlur = Math.sin(Math.PI * ac); s.trailDrift = Math.sin(Math.PI * ac); s.trailPhase = t;
      }
      // 8.5-14s: modes
      if (t >= 8.5) {
        const m = t < 10.3 ? 'dog' : t < 12.1 ? 'aircraft' : 'full';
        if (m === 'dog') Object.assign(s, { showAircraft: 0, showTrails: 0, showWordmark: 0, showTagline: 0, attached: 0, blink: blinkAt(t, [9.4]) });
        if (m === 'aircraft') Object.assign(s, { showDog: 0, showWordmark: 0, showTagline: 0, attached: 0, propAngle: t * 900, propBlur: 0.6 });
        if (m === 'full') Object.assign(s, { masterLock: win(t, 13.5, 13.8) });
      }
      return s;
    },
    decor(ctx, t) {
      const g = ctx.front; g.innerHTML = '';
      const lab = t < 4.5 ? 'BLINK · EYES · HEAD TILT · EAR FOLLOW-THROUGH · PAW LIFT' : t < 8.5 ? 'AIRCRAFT INDEPENDENT · PROPELLER ROTATION · SPEED LINES' : t < 10.3 ? 'MODE: DOG ONLY (DETACHED)' : t < 12.1 ? 'MODE: AIRCRAFT ONLY' : 'MODE: FULL LOGO (ATTACHED)';
      const tx = ctx.el('text', { x: 1000, y: 880, 'text-anchor': 'middle', 'font-family': 'JetBrains Mono, monospace', 'font-size': 30, 'font-weight': 600, fill: '#050506', 'letter-spacing': 3 }, g);
      tx.textContent = lab;
    }
  });

  // ===== EXPRESSION TRANSITIONS (12 x 1.2s) =====
  def('expressions', {
    duration: EXPR_ORDER.length * 1.2, loop: true, view: 'dog', label: 'Expression transitions',
    fn(t) {
      const i = Math.floor(t / 1.2) % EXPR_ORDER.length, u = (t % 1.2) / 1.2;
      const a = EXPR_ORDER[(i + EXPR_ORDER.length - 1) % EXPR_ORDER.length], b = EXPR_ORDER[i];
      // eyes lead (first 30%), body follows (until 55%)
      const k = E.inOutCubic(clamp(u / 0.45, 0, 1));
      const s = blendExpr(a, b, k, DOG_ONLY);
      s.breath = 0.5 + 0.5 * Math.sin(t * 2.2);
      return s;
    },
    caption(t) { return EXPRESSIONS[EXPR_ORDER[Math.floor(t / 1.2) % EXPR_ORDER.length]].label; }
  });

  // ===== BRAND ELEMENT MOTION =====
  def('aircraft_only', {
    duration: 4, loop: true, view: 'symbol', label: 'Aircraft-only movement',
    fn(t) {
      const p = t / 4 * TAU;
      return Object.assign({}, AIRCRAFT_ONLY, { acRot: -4 * Math.sin(p), acY: 14 * Math.sin(p + 0.5), acX: 10 * Math.sin(p * 0.5 + 0.3),
        propAngle: t * 1800, propBlur: 1, trailDrift: 1, trailPhase: t, trailStretch: 1.3 + 0.2 * Math.sin(p * 2) });
    }
  });
  def('logo_reveal', {
    duration: 4.2, view: 'lockup', label: 'Full logo reveal (assembly)',
    fn(t) {
      const ac = E.outBackSoft(win(t, 0.1, 1.0));
      const dog = E.outBack(win(t, 0.75, 1.15));
      const s = { attached: 1, acX: (1 - ac) * -220, acScale: 0.6 + 0.4 * ac, showAircraft: win(t, 0.1, 0.35), dogScale: Math.max(0.001, dog), showDog: dog > 0.01 ? 1 : 0,
        propAngle: t * 900 * (1 - win(t, 2.6, 3.6)) + 2400 * win(t, 2.6, 3.6), propBlur: 1 - win(t, 2.4, 3.4), trailOpacity: win(t, 0.5, 0.9), trailStretch: 0.3 + 0.7 * E.outCubic(win(t, 0.5, 1.2)),
        headTilt: -6 * Math.sin(Math.PI * win(t, 1.1, 1.8)), earNear: 4 * Math.sin(Math.PI * win(t, 1.2, 1.95)), earFar: 5 * Math.sin(Math.PI * win(t, 1.22, 2.0)),
        blink: blinkAt(t, [2.1]) };
      s.letters = []; for (let i = 0; i < 10; i++) { const u = E.outBackSoft(win(t, 1.4 + i * 0.06, 1.9 + i * 0.06)); s.letters.push([0, (1 - u) * 40, win(t, 1.4 + i * 0.06, 1.7 + i * 0.06)]); }
      s.words = []; for (let i = 0; i < 5; i++) { const u = E.outCubic(win(t, 2.2 + i * 0.08, 2.6 + i * 0.08)); s.words.push([(1 - u) * -20, 0, u]); }
      s.masterLock = win(t, 3.85, 4.1);
      return s;
    }
  });
  def('wordmark_entrance', {
    duration: 3, view: 'lockup', label: 'Wordmark entrance',
    fn(t) {
      const s = { showDog: 0, showAircraft: 0, showTrails: 0 };
      s.letters = []; for (let i = 0; i < 10; i++) { const u = E.outBackSoft(win(t, 0.2 + i * 0.08, 0.8 + i * 0.08)); s.letters.push([-(1 - u) * 60, 0, win(t, 0.2 + i * 0.08, 0.5 + i * 0.08)]); }
      s.words = []; for (let i = 0; i < 5; i++) { const u = E.outCubic(win(t, 1.3 + i * 0.1, 1.8 + i * 0.1)); s.words.push([0, (1 - u) * 18, u]); }
      return s;
    }
  });
  def('propeller', {
    duration: 3.5, view: 'prop', label: 'Propeller transition (spin-up / settle)',
    fn(t) {
      const sp = K([[0, 0], [0.3, 0], [1.4, 1, 'inQuad'], [2.2, 1], [3.3, 0, 'outCubic']]);
      const ang = K([[0, 0], [0.3, 0], [1.4, 500, 'inQuad'], [2.2, 1900, 'linear'], [3.3, 2520, 'outCubic']]);
      return Object.assign({}, SYMBOL, { propAngle: ang(t), propBlur: sp(t) });
    }
  });
  def('trails', {
    duration: 3, loop: true, view: 'symbol', label: 'Speed-line motion',
    fn(t) { return Object.assign({}, SYMBOL, { trailDrift: 1, trailPhase: t / 3, trailStretch: 1.2 + 0.3 * Math.sin(t / 3 * TAU), propAngle: t * 1200, propBlur: 1 }); }
  });

  // ------------------------------------------------------------ API
  function frame(name, t) {
    const a = A[name]; if (!a) throw new Error('unknown animation ' + name);
    const tt = a.loop ? ((t % a.duration) + a.duration) % a.duration : clamp(t, 0, a.duration);
    return a.fn(tt);
  }
  global.GFMotion = { E, K, VIEWS, EXPRESSIONS, EXPR_ORDER, ANIMS: A, frame, expr, blendExpr, win, heroPose };
})(typeof window !== 'undefined' ? window : globalThis);
