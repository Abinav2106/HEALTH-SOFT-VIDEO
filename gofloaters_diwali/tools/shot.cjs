const { chromium } = require('playwright');
(async () => {
  const [,, inp, out, w='1080', h='1920'] = process.argv;
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: +w, height: +h } });
  await p.goto('file://' + require('path').resolve(inp)); await p.waitForTimeout(400);
  await p.screenshot({ path: out }); await b.close();
})();
