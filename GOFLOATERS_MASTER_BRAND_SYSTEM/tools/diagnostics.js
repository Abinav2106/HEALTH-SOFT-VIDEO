// Diagnostic renders for the guidelines: reconstruction areas highlighted, rig pivots.
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const OUT = path.resolve(__dirname, '../07_BRAND_GUIDELINES/editable_source/diagrams'); fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1600, height: 1000 } });
  await p.goto('file://' + path.resolve(__dirname, '../03_CHARACTER_RIG/rig_source/stage.html')); await p.waitForFunction('window.READY');
  await p.addStyleTag({ content: `.hl .gf-reconstruction *{fill:#F17B2A !important;stroke:#F17B2A !important;opacity:.85} body{background:#fff}` });
  const shots = [
    ['mascot_reconstruction', '395 90 360 360', { showAircraft: 0, showTrails: 0, showWordmark: 0, showTagline: 0, attached: 0 }],
    ['aircraft_reconstruction', '240 290 690 280', { showDog: 0, showTrails: 0, showWordmark: 0, showTagline: 0, attached: 0 }],
  ];
  for (const [n, vb, st] of shots) {
    await p.evaluate(([vb, st]) => { rig.reset(); rig.set(st); rig.svg.setAttribute('viewBox', vb); rig.svg.classList.add('hl'); }, [vb, st]);
    const [x, y, w, h] = vb.split(' ').map(Number); await p.setViewportSize({ width: 1600, height: Math.round(1600 * h / w) });
    await p.screenshot({ path: path.join(OUT, n + '.png') });
  }
  // pivots overlay
  await p.evaluate(() => rig.svg.classList.remove('hl'));
  const vb = '380 90 560 380';
  await p.setViewportSize({ width: 1600, height: Math.round(1600 * 380 / 560) });
  const piv = await p.evaluate((vb) => {
    rig.reset(); rig.set({ showWordmark: 0, showTagline: 0, showTrails: 0 }); rig.svg.setAttribute('viewBox', vb);
    const P = rig.pivots, D = GF_DATA, g = rig.el('g', {}, rig.decorFront);
    const list = { 'Head': P.head, 'Far ear': P.ear_far, 'Near ear': P.ear_near, 'Hip / lean': P.torso, 'Tail root': D.tubes.tail[0], 'Near shoulder': D.tubes.leg_near[0], 'Near wrist': D.tubes.leg_near[6], 'Far shoulder': D.tubes.leg_far[0], 'Propeller hub': P.propeller, 'Wing root': P.wing, 'Seat anchor': rig.pivots.seat };
    for (const k in list) { const [x, y] = list[k]; rig.el('circle', { cx: x, cy: y, r: 5, fill: '#F17B2A', stroke: '#050506', 'stroke-width': 2 }, g); }
    return list;
  }, vb);
  await p.screenshot({ path: path.join(OUT, 'rig_pivots.png') });
  fs.writeFileSync(path.join(OUT, 'rig_pivots.json'), JSON.stringify({ viewBox: vb, pivots: piv }, null, 1));
  await b.close();
})();
