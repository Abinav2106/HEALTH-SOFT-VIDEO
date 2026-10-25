// Export every pattern as static SVG + PNG and an animated MP4 loop.
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs'); const { execSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
global.window = global; require(path.join(ROOT, '06_BRAND_IDENTITY/patterns/gofloaters-patterns.js'));
const TMP = process.argv[2] || '/tmp/gf_pat';
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  const outS = path.join(ROOT, '06_BRAND_IDENTITY/patterns'); const outA = path.join(ROOT, '05_ANIMATION/pattern_motion');
  for (const n of GFPatterns.list) {
    const s = GFPatterns.render(n, 1600, 1000, 0);
    fs.writeFileSync(path.join(outS, `pattern_${n}.svg`), s);
    await page.setViewportSize({ width: 1600, height: 1000 }); await page.setContent(`<body style="margin:0">${s}</body>`);
    await page.screenshot({ path: path.join(outS, `pattern_${n}.png`) });
    if (process.argv.includes('--no-anim')) continue;
    const per = GFPatterns.P[n].period, dir = path.join(TMP, n); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
    await page.setViewportSize({ width: 1920, height: 1080 });
    const N = Math.round(per * 30);
    for (let i = 0; i < N; i++) {
      await page.setContent(`<body style="margin:0">${GFPatterns.render(n, 1920, 1080, i / 30)}</body>`);
      await page.screenshot({ path: path.join(dir, `f_${String(i).padStart(4, '0')}.png`) });
    }
    execSync(`ffmpeg -loglevel error -y -framerate 30 -i ${dir}/f_%04d.png -c:v libx264 -crf 20 -pix_fmt yuv420p -movflags +faststart ${outA}/pattern_${n}_loop.mp4`);
    console.log('pattern', n);
  }
  await b.close();
})();
