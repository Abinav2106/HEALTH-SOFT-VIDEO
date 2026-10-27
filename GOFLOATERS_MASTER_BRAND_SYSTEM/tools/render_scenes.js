// Render GFScenes to MP4 (1080p) + a poster still.
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs'); const { execSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
global.window = global;
require(path.join(ROOT, '06_BRAND_IDENTITY/patterns/gofloaters-patterns.js'));
require(path.join(ROOT, '06_BRAND_IDENTITY/patterns/gofloaters-scenes.js'));
const HOST = path.join(ROOT, '06_BRAND_IDENTITY/tokens/_scene_host.html');
fs.writeFileSync(HOST, '<html><head><link rel="stylesheet" href="gofloaters-tokens.css"><style>body{margin:0}</style></head><body><div id=s></div></body></html>');
const TMP = process.argv[2] || '/tmp/gf_scn';
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  const out = path.join(ROOT, '05_ANIMATION/pattern_motion');
  for (const n of GFScenes.list) {
    const dur = GFScenes.S[n].duration, dir = path.join(TMP, n); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
    await page.goto('file://' + HOST);
    await page.evaluate(async () => { await document.fonts.load('800 40px "Bricolage Grotesque"'); await document.fonts.load('600 40px Inter'); });
    for (let i = 0; i < dur * 30; i++) {
      const s = GFScenes.render(n, 1920, 1080, i / 30);
      await page.evaluate(s => { document.getElementById('s').innerHTML = s; }, s);
      if (i === 0) await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: path.join(dir, `f_${String(i).padStart(4, '0')}.png`) });
    }
    execSync(`ffmpeg -loglevel error -y -framerate 30 -i ${dir}/f_%04d.png -c:v libx264 -crf 19 -pix_fmt yuv420p -movflags +faststart ${out}/${n === 'campaign' ? 'campaign_typography_freedom_in_motion' : 'application_background_loop'}.mp4`);
    console.log('scene', n);
  }
  await b.close(); fs.unlinkSync(HOST);
})();
