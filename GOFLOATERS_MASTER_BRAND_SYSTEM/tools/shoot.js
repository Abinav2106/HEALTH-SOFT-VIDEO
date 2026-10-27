// Render rig states to PNG.  node tools/shoot.js jobs.json
// jobs: [{out, w, h, vb, state, bg, transparent}]
const { chromium } = require('playwright');
const path = require('path'); const fs = require('fs');
(async () => {
  const jobs = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const stage = 'file://' + path.resolve(__dirname, '../03_CHARACTER_RIG/rig_source/stage.html');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 2000, height: 667 } });
  let cur = null;
  for (const j of jobs) {
    const key = j.w + 'x' + j.h + (j.vb || '');
    if (key !== cur) {
      await page.setViewportSize({ width: j.w, height: j.h });
      await page.goto(stage + '?vb=' + encodeURIComponent(j.vb || '0 0 2000 667'));
      await page.waitForFunction('window.READY');
      cur = key;
    }
    await page.evaluate(([s, bg]) => { rig.reset(); rig.set(s); document.body.style.background = bg || 'transparent'; }, [j.state || {}, j.bg || (j.transparent ? 'transparent' : '#fff')]);
    await page.screenshot({ path: j.out, omitBackground: !!j.transparent });
  }
  await browser.close();
})();
