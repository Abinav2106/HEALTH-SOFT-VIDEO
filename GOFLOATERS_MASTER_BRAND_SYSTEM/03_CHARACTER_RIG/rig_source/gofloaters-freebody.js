/*!
 * GoFloaters rig - constructed full-body view ("free body")  v1.0
 *
 * PROPOSED EXTENSION. The original logo only shows the dog seated in the
 * cockpit; walking, running and jumping need hind legs and a horizontal body
 * the source never shows. This module constructs them from the source's own
 * vocabulary: the same traced head, the same 7.6px line weight, slim white tube
 * limbs with rounded paws (measured from the source forelegs) and the source's
 * tapered tail. Everything is computed per frame from a small set of controls,
 * so limbs bend without joints opening.
 *
 * Controls (degrees unless noted):
 *   fbHipX, fbHipY   hip position (px)
 *   fbSpine          torso pitch, 0 = level, negative = chest up (-70 = standing on hind legs)
 *   fbStretch        torso length factor
 *   fbNeck           neck angle from vertical, positive = leaning forward
 *   fbFL / fbFR      near / far foreleg [upper, lower] absolute angles, 0 = straight down, + = forward
 *   fbHL / fbHR      near / far hind leg [upper, lower]
 *   fbTail, tailCurl tail root angle and curl
 *   headTilt         head rotation (shared with the seated rig)
 *   fbShadow         ground shadow opacity
 */
(function (global) {
  'use strict';
  const rad = d => d * Math.PI / 180;
  const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
  const mul = (a, k) => [a[0] * k, a[1] * k];
  const f = n => (+n).toFixed(2);

  function build(group, D, kit) {
    const { el, tube, setTube, articulate, C, SW } = kit;
    const shadow = el('ellipse', { fill: '#0B2A33', opacity: 0.12 }, group);
    const tail = tube(group, 'gf-fb-tail');
    const legHR = tube(group, 'gf-fb-leg-hind-far');
    const legFR = tube(group, 'gf-fb-leg-fore-far');
    const legHL = tube(group, 'gf-fb-leg-hind-near');
    const legFL = tube(group, 'gf-fb-leg-fore-near');
    const neckFill = el('path', { fill: C.white }, group);
    const body = el('path', { fill: C.white, stroke: C.ink, 'stroke-width': SW, 'stroke-linejoin': 'round' }, group);
    const fur = el('path', { fill: 'none', stroke: C.ink, 'stroke-width': 4.6, 'stroke-linecap': 'round' }, group);
    const neckLines = el('path', { fill: 'none', stroke: C.ink, 'stroke-width': D.neck.w, 'stroke-linecap': 'round' }, group);
    const headSlot = el('g', { class: 'gf-fb-head' }, group);
    const thigh = el('path', { fill: 'none', stroke: C.ink, 'stroke-width': 6.4, 'stroke-linecap': 'round' }, group);

    // head-local anchor points (source px): neck cut line under the traced head
    const NB = D.neck.back[0], NF = D.neck.front[0];
    const M0 = [(NB[0] + NF[0]) / 2, (NB[1] + NF[1]) / 2];
    const TAIL = D.tubes.tail; // base first

    function leg(top, root, a1, l1, a2, l2, rTop, rMid, rEnd, toeDir) {
      const k = add(root, [Math.sin(rad(a1)) * l1, Math.cos(rad(a1)) * l1]);
      const ft = add(k, [Math.sin(rad(a2)) * l2, Math.cos(rad(a2)) * l2]);
      const toe = add(ft, toeDir);
      const mid1 = add(root, mul([k[0] - root[0], k[1] - root[1]], 0.5));
      const mid2 = add(k, mul([ft[0] - k[0], ft[1] - k[1]], 0.5));
      return { pts: [[top[0], top[1], rTop], [root[0], root[1], rTop], [mid1[0], mid1[1], (rTop + rMid) / 2], [k[0], k[1], rMid], [mid2[0], mid2[1], rMid], [ft[0], ft[1], rEnd], [toe[0], toe[1], rEnd]], foot: toe };
    }

    function apply(s, head, headMount) {
      if (head.parentNode !== headSlot) headSlot.appendChild(head);
      const a = rad(s.fbSpine), u = [Math.cos(a), Math.sin(a)], n = [-Math.sin(a), Math.cos(a)];
      const H = [s.fbHipX, s.fbHipY];
      const Lt = 132 * s.fbStretch, Rc = 45, Rh = 35;
      const Cc = add(H, mul(u, Lt));
      const P = (o, du, dn) => add(add(o, mul(u, du)), mul(n, dn));
      // torso outline: rump -> back -> chest -> belly
      const Ht = P(H, 0, -Rh), Ct = P(Cc, -6, -Rc), Cf = P(Cc, Rc * 0.98, -4), Cb = P(Cc, -4, Rc * 0.92), Hb = P(H, 6, Rh);
      const back1 = P(H, Lt * 0.35, -Rh * 0.9), back2 = P(H, Lt * 0.66, -Rc * 0.84);
      const bel1 = P(H, Lt * 0.62, Rc * 0.5), bel2 = P(H, Lt * 0.3, Rh * 0.55);
      // hand-shaped bean in local (along-spine, below-spine) units: level back,
      // deep rounded chest, tucked belly, compact rump
      const B = (x, y) => P(H, x, y);
      const d = [
        'M', B(-4, -30),
        'C', B(Lt * 0.3, -33), B(Lt * 0.65, -37), B(Lt * 0.95, -40),
        'C', B(Lt * 1.12, -42), B(Lt + 46, -16), B(Lt + 43, 8),
        'C', B(Lt + 40, 38), B(Lt + 14, 54), B(Lt - 16, 50),
        'C', B(Lt * 0.62, 44), B(Lt * 0.4, 16), B(22, 22),
        'C', B(2, 30), B(-30, 25), B(-34, 0),
        'C', B(-36, -20), B(-22, -31), B(-4, -30), 'Z'
      ].map(v => Array.isArray(v) ? f(v[0]) + ',' + f(v[1]) : v).join(' ');
      body.setAttribute('d', d);
      // source fur marks, placed on the haunch
      const fm = [[P(H, 4, -8), P(H, 12, -20)], [P(H, 14, -2), P(H, 20, -13)], [P(H, -6, 6), P(H, 4, -6)]];
      fur.setAttribute('d', fm.map(([p, q]) => `M${f(p[0])},${f(p[1])}L${f(q[0])},${f(q[1])}`).join(''));

      // neck + head
      const baseB = P(Cc, -4, -40), baseF = P(Cc, 40, -10);
      const baseM = mul(add(baseB, baseF), 0.5);
      const na = rad(s.fbNeck), Ln = 74;
      const T = add(baseM, [Math.sin(na) * Ln, -Math.cos(na) * Ln]);
      const hr = rad(s.headTilt), c = Math.cos(hr), sn = Math.sin(hr);
      const hp = p => { const dx = p[0] - M0[0], dy = p[1] - M0[1]; return [T[0] + dx * c - dy * sn, T[1] + dx * sn + dy * c]; };
      head.setAttribute('transform', `translate(${f(T[0] - M0[0])} ${f(T[1] - M0[1])}) rotate(${f(s.headTilt)} ${f(M0[0])} ${f(M0[1])})`);
      const hb = hp(NB), hf = hp(NF), down = [-sn, c];
      const nv = [T[0] - baseM[0], T[1] - baseM[1]], nl = Math.hypot(nv[0], nv[1]) || 1, upN = [nv[0] / nl, nv[1] / nl];
      const br = (top, base) => {
        const L = Math.hypot(base[0] - top[0], base[1] - top[1]);
        return { c1: add(top, mul(down, L * 0.38)), c2: add(base, mul(upN, L * 0.34)) };
      };
      const cb = br(hb, baseB), cf = br(hf, baseF);
      const seg = (t, q, b) => `M${f(t[0])},${f(t[1])}C${f(q.c1[0])},${f(q.c1[1])} ${f(q.c2[0])},${f(q.c2[1])} ${f(b[0])},${f(b[1])}`;
      neckLines.setAttribute('d', seg(hb, cb, baseB) + seg(hf, cf, baseF));
      const up = [sn * 14, -c * 14];
      neckFill.setAttribute('d', `M${f(hb[0] + up[0])},${f(hb[1] + up[1])}L${f(hf[0] + up[0])},${f(hf[1] + up[1])}L${f(hf[0])},${f(hf[1])}C${f(cf.c1[0])},${f(cf.c1[1])} ${f(cf.c2[0])},${f(cf.c2[1])} ${f(baseF[0])},${f(baseF[1])}L${f(Cc[0])},${f(Cc[1])}L${f(baseB[0])},${f(baseB[1])}C${f(cb.c2[0])},${f(cb.c2[1])} ${f(cb.c1[0])},${f(cb.c1[1])} ${f(hb[0])},${f(hb[1])}Z`);

      // legs
      const toe = mul(u, 6);
      const sh = P(Cc, 4, 14), hip = P(H, 6, 6);
      const fl = leg(P(Cc, -10, Rc * 0.05), sh, s.fbFL[0], 66, s.fbFL[1], 60, 6.6, 6.4, 5.6, toe);
      const fr = leg(P(Cc, -18, Rc * 0.05), add(sh, mul(u, -9)), s.fbFR[0], 66, s.fbFR[1], 60, 6.4, 6.2, 5.4, toe);
      const hl = leg(P(H, 14, -Rh * 0.2), hip, s.fbHL[0], 62, s.fbHL[1], 64, 13.5, 6.6, 5.6, toe);
      const hrL = leg(P(H, 4, -Rh * 0.2), add(hip, mul(u, -8)), s.fbHR[0], 62, s.fbHR[1], 64, 12.5, 6.4, 5.4, toe);
      setTube(legFL, fl.pts); setTube(legFR, fr.pts); setTube(legHL, hl.pts); setTube(legHR, hrL.pts);
      // contour lines on the body: haunch (from the source's seated haunch) and shoulder
      const th0 = P(H, 30, -10), th1 = P(H, 38, 6), th2 = P(H, 28, 18);
      const s0 = P(Cc, 8, -6), s1 = P(Cc, 14, 24);
      thigh.setAttribute('d', `M${f(th0[0])},${f(th0[1])}Q${f(th1[0])},${f(th1[1])} ${f(th2[0])},${f(th2[1])}`);
      // tail: source tail shape re-rooted on the rump
      const tb = P(H, -24, -22);
      const dx = tb[0] - TAIL[0][0], dy = tb[1] - TAIL[0][1];
      const moved = TAIL.map(p => [p[0] + dx, p[1] + dy, p[2]]);
      const tj = [[0, s.fbTail - 28 + s.fbSpine * 0.6]]; for (let i = 2; i < moved.length - 1; i++) tj.push([i, s.tailCurl * 2]);
      setTube(tail, articulate(moved, tj));
      // ground shadow under the lowest paw
      const ground = Math.max(fl.foot[1], fr.foot[1], hl.foot[1], hrL.foot[1]);
      const cx = (H[0] + Cc[0]) / 2;
      shadow.setAttribute('cx', f(cx)); shadow.setAttribute('cy', f(Math.max(ground, s.fbGround || 0) + 8));
      shadow.setAttribute('rx', f(Lt * 0.75)); shadow.setAttribute('ry', 9);
      shadow.setAttribute('opacity', f(0.12 * s.fbShadow));
      // keep the lowest paw planted on the ground line when requested
      if (s.fbGroundLock) {
        const air = s.fbAir || 0;
        const dy = s.fbGround - ground - 2 - air;
        group.setAttribute('transform', `translate(0 ${f(dy)})`);
        shadow.setAttribute('cy', f(s.fbGround + 8 - dy));
        const k = Math.max(0.35, 1 - air / 260);
        shadow.setAttribute('rx', f(Lt * 0.75 * k));
        shadow.setAttribute('opacity', f(0.12 * s.fbShadow * k));
      } else group.setAttribute('transform', '');
    }
    return { apply };
  }
  global.GoFloatersFreeBody = { build };
})(typeof window !== 'undefined' ? window : globalThis);
