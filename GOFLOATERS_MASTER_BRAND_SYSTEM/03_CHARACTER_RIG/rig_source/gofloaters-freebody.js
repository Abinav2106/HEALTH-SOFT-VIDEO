/*!
 * GoFloaters rig - constructed full-body view ("free body")  v2.0
 *
 * PROPOSED EXTENSION of the original seated mascot. Built in the logo's own
 * coordinate frame: at rest the traced head sits exactly where it sits in the
 * logo, the neck descends with the logo's long upright curve, and the hidden
 * anatomy is reconstructed below it - one continuous torso (withers, level
 * back, rump, deep chest, tucked belly) and four canine legs:
 *   forelegs : shoulder -> elbow -> wrist -> paw   (upper arm, forearm, pastern)
 *   hind legs: hip -> knee (stifle) -> hock -> paw  (thigh, shank, hock)
 * Near legs are drawn over the body, far legs behind it. Every limb is a
 * smoothed centre-line with an anatomical width profile, so joints bend
 * without gaps; paws are separate oval shapes planted on the ground line.
 *
 * Controls (degrees are WORLD angles: 0 = straight down, + = toward the nose):
 *   fbX, fbY        whole-body offset (px)          fbPitch   body pitch about the hip (- = chest up)
 *   fbFL, fbFR      near / far foreleg  [upperArm, forearm, pastern]
 *   fbHL, fbHR      near / far hind leg [thigh, shank, hock]
 *                   ...or a foot target {x, y, end, paw} (world px, before ground lock):
 *                   the last segment takes angle `end`, the first two are solved by
 *                   two-bone IK (elbow bends toward the tail, stifle toward the nose),
 *                   and the paw pad keeps angle `paw` (0 = flat on the ground).
 *   fbTail, tailCurl, fbHeadX, fbHeadY, headTilt, fbHeadFollow
 *   fbGround, fbGroundLock, fbAir, fbShadow
 */
(function (global) {
  'use strict';
  const rad = d => d * Math.PI / 180;
  const f = n => (+n).toFixed(2);

  // ---------------- rest-pose construction (logo coordinates) ----------------
  const HIP = [448, 330];                   // pitch pivot
  const SHOULDER_N = [618, 344], SHOULDER_F = [588, 350];
  const HIPJ_N = [444, 338], HIPJ_F = [470, 334];
  const LEN = { upper: 46, fore: 82, pastern: 20, thigh: 72, shank: 56, hock: 40 };
  const STAND = {
    fbFL: [-14, 3, 14], fbFR: [-10, 6, 16],
    fbHL: [32, -48, -4], fbHR: [20, -38, 6],
  };
  // leg width profiles: interior half-widths along each chain
  const PROF_F = [11, 8.6, 6.8, 5.8, 5.4];   // top, elbow, mid-forearm, wrist, pastern end
  const PROF_H = [26, 25, 13, 8.2, 6.2, 5.6]; // hip, mid-thigh, stifle, mid-shank, hock, foot

  function build(group, D, kit) {
    const { el, tube, setTube, articulate, C, SW } = kit;
    const shadow = el('ellipse', { fill: '#0B2A33', opacity: 0.1 }, group);
    const tail = tube(group, 'gf-fb-tail');
    const farHind = tube(group, 'gf-fb-leg-hind-far');
    const farFore = tube(group, 'gf-fb-leg-fore-far');
    const farPawH = el('path', { fill: C.white, stroke: C.ink, 'stroke-width': SW, 'stroke-linejoin': 'round' }, group);
    const farPawF = el('path', { fill: C.white, stroke: C.ink, 'stroke-width': SW, 'stroke-linejoin': 'round' }, group);
    const bodyFill = el('path', { fill: C.white }, group);
    const body = el('path', { fill: 'none', stroke: C.ink, 'stroke-width': SW, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, group);
    const nearHind = tube(group, 'gf-fb-leg-hind-near');
    const fur = el('path', { fill: 'none', stroke: C.ink, 'stroke-width': 4.4, 'stroke-linecap': 'round' }, group);
    const nearFore = tube(group, 'gf-fb-leg-fore-near');
    const nearPawH = el('path', { fill: C.white, stroke: C.ink, 'stroke-width': SW, 'stroke-linejoin': 'round' }, group);
    const nearPawF = el('path', { fill: C.white, stroke: C.ink, 'stroke-width': SW, 'stroke-linejoin': 'round' }, group);
    const headSlot = el('g', { class: 'gf-fb-head' }, group);
    const TAIL = D.tubes.tail;

    function apply(s, head) {
      if (head.parentNode !== headSlot) headSlot.appendChild(head);
      const pitch = s.fbPitch || 0, a = rad(pitch), ca = Math.cos(a), sa = Math.sin(a);
      // body-frame -> world (rotation about HIP, then translation)
      const off = [s.fbX || 0, s.fbY || 0];
      const W = p => [HIP[0] + (p[0] - HIP[0]) * ca - (p[1] - HIP[1]) * sa + off[0], HIP[1] + (p[0] - HIP[0]) * sa + (p[1] - HIP[1]) * ca + off[1]];
      // head: logo head rides the body; follows a fraction of the pitch
      const hp = D.pivots.head;
      const hw = W(hp);
      const hRot = (s.headTilt || 0) + pitch * (s.fbHeadFollow != null ? s.fbHeadFollow : 0.35);
      const hx = hw[0] - hp[0] + (s.fbHeadX || 0), hy = hw[1] - hp[1] + (s.fbHeadY || 0);
      head.setAttribute('transform', `translate(${f(hx)} ${f(hy)}) rotate(${f(hRot)} ${hp[0]} ${hp[1]})`);
      const hr = rad(hRot), ch = Math.cos(hr), sh = Math.sin(hr);
      const HW = p => [hp[0] + (p[0] - hp[0]) * ch - (p[1] - hp[1]) * sh + hx, hp[1] + (p[0] - hp[0]) * sh + (p[1] - hp[1]) * ch + hy];
      const nb = HW(D.neck.back[0]), nf = HW(D.neck.front[0]);
      const ndn = [-sh, ch];                  // head's "down" direction
      // ---------- torso outline (body frame points, then world) ----------
      const P = (x, y) => W([x, y]);
      const seg = (...pts) => pts.map(p => f(p[0]) + ',' + f(p[1])).join(' ');
      const nbc = [nb[0] + ndn[0] * 22, nb[1] + ndn[1] * 22], nfc = [nf[0] + ndn[0] * 22, nf[1] + ndn[1] * 22];
      const d = [
        'M', seg(nb),
        'C', seg(nbc, P(536, 252), P(518, 274)),            // back of the long neck
        'C', seg(P(500, 292), P(480, 300), P(458, 300)),    // withers into a level back
        'C', seg(P(438, 300), P(420, 302), P(408, 310)),    // loin
        'C', seg(P(390, 320), P(382, 342), P(390, 362)),    // rump
        'C', seg(P(398, 378), P(422, 382), P(446, 376)),    // seat into the stifle fold
        'C', seg(P(472, 370), P(494, 360), P(522, 366)),    // tucked belly
        'C', seg(P(548, 374), P(578, 392), P(612, 394)),    // ribcage
        'C', seg(P(644, 395), P(664, 372), P(664, 340)),    // brisket / chest front
        'C', seg(P(664, 300), P(650, 266), P(648, 246)),    // front of neck
        'C', seg(nfc, nfc, nf)];
      bodyFill.setAttribute('d', d.join(' ') + ' Z');
      fur.setAttribute('d', [[[432, 342], [438, 328]], [[444, 350], [450, 336]], [[420, 352], [426, 340]]]
        .map(([p, q]) => { const A = P(...p), B = P(...q); return `M${f(A[0])},${f(A[1])}L${f(B[0])},${f(B[1])}`; }).join(''));
      // ---------- legs ----------
      const chain = (root, angles, lens) => {
        const pts = [root]; let cur = root;
        angles.forEach((ang, i) => { const r = rad(ang); cur = [cur[0] + Math.sin(r) * lens[i], cur[1] + Math.cos(r) * lens[i]]; pts.push(cur); });
        return pts;
      };
      // two-bone IK: returns world angles [a0, a1, end] that put the leg's end at (x, y)
      const ik = (root, tgt, lens, side) => {
        const e = rad(tgt.end || 0);
        const T = [tgt.x - Math.sin(e) * lens[2], tgt.y - Math.cos(e) * lens[2]];
        const dx = T[0] - root[0], dy = T[1] - root[1];
        const a = lens[0], b = lens[1];
        const dd = Math.min(a + b - 0.5, Math.max(Math.abs(a - b) + 0.5, Math.hypot(dx, dy)));
        const th = Math.atan2(dx, dy);
        const al = Math.acos(Math.max(-1, Math.min(1, (a * a + dd * dd - b * b) / (2 * a * dd))));
        const a0 = th + side * al;
        const J = [root[0] + Math.sin(a0) * a, root[1] + Math.cos(a0) * a];
        const a1 = Math.atan2(T[0] - J[0], T[1] - J[1]);
        return [a0 * 180 / Math.PI, a1 * 180 / Math.PI, tgt.end || 0];
      };
      const mid = (p, q, t) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
      const fore = (shoulder, ang, near) => {
        const pawDir = ang && !Array.isArray(ang) && ang.paw != null ? ang.paw : null;
        if (ang && !Array.isArray(ang)) ang = ik(W(shoulder), ang, [LEN.upper, LEN.fore, LEN.pastern], -1);
        const j = chain(W(shoulder), ang, [LEN.upper, LEN.fore, LEN.pastern]);
        const top = [j[0][0] + Math.sin(rad(ang[0])) * -14, j[0][1] - Math.cos(rad(ang[0])) * 14];
        const pr = near ? 1 : 0.94;
        return { pts: [[...top, PROF_F[0] * pr], [...j[0], PROF_F[0] * pr], [...j[1], PROF_F[1] * pr], [...mid(j[1], j[2], 0.5), PROF_F[2] * pr], [...j[2], PROF_F[3] * pr], [...j[3], PROF_F[4] * pr]], foot: j[3], dir: pawDir != null ? pawDir : ang[2] };
      };
      const hind = (hip, ang, near) => {
        const pawDir = ang && !Array.isArray(ang) && ang.paw != null ? ang.paw : null;
        if (ang && !Array.isArray(ang)) ang = ik(W(hip), ang, [LEN.thigh, LEN.shank, LEN.hock], 1);
        const j = chain(W(hip), ang, [LEN.thigh, LEN.shank, LEN.hock]);
        const top = [j[0][0] - Math.sin(rad(ang[0])) * 10, j[0][1] - Math.cos(rad(ang[0])) * 10];
        const pr = near ? 1 : 0.92;
        return { pts: [[...top, PROF_H[0] * pr], [...j[0], PROF_H[0] * pr], [...mid(j[0], j[1], 0.5), PROF_H[1] * pr], [...j[1], PROF_H[2] * pr], [...mid(j[1], j[2], 0.5), PROF_H[3] * pr], [...j[2], PROF_H[4] * pr], [...j[3], PROF_H[5] * pr]], foot: j[3], dir: pawDir != null ? pawDir : ang[2] };
      };
      const fl = fore(SHOULDER_N, s.fbFL || STAND.fbFL, true), fr = fore(SHOULDER_F, s.fbFR || STAND.fbFR, false);
      const hl = hind(HIPJ_N, s.fbHL || STAND.fbHL, true), hrr = hind(HIPJ_F, s.fbHR || STAND.fbHR, false);
      // body outline: the rump flows into the back of the near thigh; the belly line
      // starts again under the thigh's front edge (the thigh is drawn over it)
      {
        const j0 = hl.pts[1], j1 = hl.pts[3];
        const tx = j1[0] - j0[0], ty = j1[1] - j0[1], tl = Math.hypot(tx, ty) || 1;
        const w = hl.pts[2][2] + SW / 2;
        const m = hl.pts[2];
        const TB = [m[0] - ty / tl * w, m[1] + tx / tl * w];
        const tan = [tx / tl, ty / tl];
        const line = d.slice(0, 10).concat(['C', seg(P(388, 376), [TB[0] - tan[0] * 18, TB[1] - tan[1] * 18], TB),
          'M', seg(P(446, 376))]).concat(d.slice(12));
        body.setAttribute('d', line.join(' '));
      }
      setTube(nearFore, fl.pts, { capEnd: 'round', trimR: 14, trimL: 6 }); setTube(farFore, fr.pts, { capEnd: 'round' });
      setTube(nearHind, hl.pts, { capEnd: 'round', trimL: 12, trimR: 4 }); setTube(farHind, hrr.pts, { capEnd: 'round' });
      // paws: an oval pad pointing along the ground with a small toe line; follows the last segment when lifted
      // paws: capsules like the logo's own paws - length ~2x the leg, height ~ the leg,
      // back edge aligned with the back of the leg, toes forward
      const paw = (pathEl, leg, scale) => {
        const fx = Math.sin(rad(leg.dir)), fy = Math.cos(rad(leg.dir));
        const fwd = [fy, -fx], up = [-fwd[1], fwd[0]];       // fwd: toward the nose along the ground
        // bean outline in paw space (x toward the toes, y toward the ground): heel, pad, toes, instep
        const L = ([x, y]) => [leg.foot[0] + (fwd[0] * x + up[0] * y) * scale, leg.foot[1] + (fwd[1] * x + up[1] * y) * scale];
        const ring = [[-10, -1], [-5, 9.5], [16, 10.5], [28, 6.5], [31, -2], [21, -9], [6, -11.5], [-6, -10.5]].map(L);
        const n = ring.length, q = ['M', seg(ring[0])];
        for (let i = 0; i < n; i++) {
          const p0 = ring[(i - 1 + n) % n], p1 = ring[i], p2 = ring[(i + 1) % n], p3 = ring[(i + 2) % n];
          q.push('C', seg([p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6], p2));
        }
        pathEl.setAttribute('d', q.join(' ') + ' Z');
        return [ring[2], ring[1]];
      };
      const pk = [paw(nearPawF, fl, 1), paw(farPawF, fr, 0.95), paw(nearPawH, hl, 1.04), paw(farPawH, hrr, 0.98)];
      // tail: the logo's sickle tail, re-rooted on the rump
      const tb = W([398, 316]);
      const dx = tb[0] - TAIL[0][0], dy = tb[1] - TAIL[0][1];
      const moved = TAIL.map(p => [p[0] + dx, p[1] + dy, p[2]]);
      const tj = [[0, (s.fbTail || 0) - 58 + pitch]]; for (let i = 2; i < moved.length - 1; i++) tj.push([i, (s.tailCurl || 0) * 2 + 8]);
      setTube(tail, articulate(moved, tj));
      // ---------- ground contact ----------
      const lowest = Math.max(...pk.map(([a, b]) => Math.max(a[1], b[1])), ...[fl, fr, hl, hrr].map(l => l.foot[1] + 9));
      const ground = s.fbGround || 513;
      let dyG = 0;
      if (s.fbGroundLock) dyG = ground - lowest - (s.fbAir || 0);
      group.setAttribute('transform', `translate(0 ${f(dyG)})`);
      const cx = (W([400, 0])[0] + W([660, 0])[0]) / 2;
      const k = Math.max(0.35, 1 - (s.fbAir || 0) / 260);
      shadow.setAttribute('cx', f(cx)); shadow.setAttribute('cy', f(ground + 4 - dyG));
      shadow.setAttribute('rx', f(170 * k)); shadow.setAttribute('ry', f(8));
      shadow.setAttribute('opacity', f(0.1 * (s.fbShadow != null ? s.fbShadow : 1) * k));
    }
    return { apply, STAND };
  }
  global.GoFloatersFreeBody = { build, STAND, HIP, SHOULDER_N, SHOULDER_F, HIPJ_N, HIPJ_F, LEN };
})(typeof window !== 'undefined' ? window : globalThis);
