// Export rig states as standalone SVG (+ transparent PNG) files.
// usage: node tools/export_rig.js jobs.json
// job: {out: "path/base", state: {...}, vb: "x y w h", png: 2000 (width px, optional), anim: name, t: sec (optional: use a motion frame)}
const { chromium } = require('playwright');
const path = require('path'); const fs = require('fs');
(async () => {
  const jobs = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const stage = 'file://' + path.resolve(__dirname, '../03_CHARACTER_RIG/rig_source/stage.html');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1000, height: 1000 } });
  await page.goto(stage); await page.waitForFunction('window.READY');
  for (const j of jobs) {
    const [x, y, w, h] = j.vb.split(/\s+/).map(Number);
    const svg = await page.evaluate(([j]) => {
      rig.reset();
      const st = j.anim ? GFMotion.frame(j.anim, j.t || 0) : {};
      rig.set(Object.assign(st, j.state || {}));
      rig.decorBack.innerHTML = ''; rig.decorFront.innerHTML = '';
      const a = j.anim && GFMotion.ANIMS[j.anim];
      if (a && a.decor && j.decor) a.decor({ back: rig.decorBack, front: rig.decorFront, el: rig.el }, j.t || 0);
      const clone = rig.svg.cloneNode(true);
      clone.setAttribute('viewBox', j.vb);
      // drop hidden branches so the file only carries what is drawn
      const live = rig.svg.querySelectorAll('*'); const copy = clone.querySelectorAll('*');
      const kill = [];
      live.forEach((n, i) => { if (n.style && n.style.display === 'none') kill.push(copy[i]); });
      kill.forEach(n => n.remove());
      clone.removeAttribute('class');
      return clone.outerHTML;
    }, [j]);
    const pw = j.png || 2000, ph = Math.round(pw * h / w);
    const header = `<?xml version="1.0" encoding="UTF-8"?>\n<!-- GoFloaters brand system. Built from the vector RECONSTRUCTION of the supplied logo; elements tagged class="gf-reconstruction" are proposed hidden extensions, not original artwork. -->\n`;
    const file = svg.replace('<svg ', `<svg width="${pw}" height="${ph}" `);
    fs.mkdirSync(path.dirname(j.out), { recursive: true });
    if (!j.noSvg) fs.writeFileSync(j.out + '.svg', header + file);
    if (!j.noPng) {
      await page.setViewportSize({ width: pw, height: ph });
      await page.setContent(`<html><body style="margin:0;background:${j.bg || 'transparent'}">${file}</body></html>`);
      await page.screenshot({ path: j.out + '.png', omitBackground: !j.bg });
      await page.goto(stage); await page.waitForFunction('window.READY');
      await page.setViewportSize({ width: 1000, height: 1000 });
    }
    console.log('wrote', j.out);
  }
  await browser.close();
})();
