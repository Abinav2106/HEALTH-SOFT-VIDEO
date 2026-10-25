// Render HTML compositions to PNG at their native size. usage: node tools/render_html.js jobs.json
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
(async () => {
  const jobs = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const b = await chromium.launch(); const p = await b.newPage();
  for (const j of jobs) {
    await p.setViewportSize({ width: j.w, height: j.h });
    await p.goto('file://' + j.html, { waitUntil: 'networkidle' });
    await p.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(i => i.decode().catch(() => {}))); });
    fs.mkdirSync(path.dirname(j.out), { recursive: true });
    await p.screenshot({ path: j.out });
    console.log(path.basename(j.out));
  }
  await b.close();
})();
