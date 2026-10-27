// Render SVG/HTML files to PNG with the pre-installed Chromium.
// usage: node tools/render.js in.svg out.png width height [--transparent] [--bg=#fff]
const { chromium } = require('playwright');
const fs = require('fs'); const path = require('path');
(async () => {
  const [inp, out, w, h, ...flags] = process.argv.slice(2);
  const transparent = flags.includes('--transparent');
  const bgFlag = flags.find(f => f.startsWith('--bg='));
  const bg = bgFlag ? bgFlag.slice(5) : (transparent ? 'transparent' : '#ffffff');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: +w, height: +h } });
  const abs = path.resolve(inp);
  if (abs.endsWith('.svg')) {
    const svg = fs.readFileSync(abs, 'utf8');
    await page.setContent(`<html><body style="margin:0;background:${bg}">
      <div style="width:${w}px;height:${h}px">${svg.replace(/<\?xml[^>]*>/, '')}</div>
      <style>svg{width:100%;height:100%;display:block}</style></body></html>`);
  } else {
    await page.goto('file://' + abs);
  }
  await page.waitForTimeout(150);
  await page.screenshot({ path: out, omitBackground: transparent });
  await browser.close();
})();
