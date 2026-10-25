// Print the brandbook HTML to PDF (selectable text, vector SVG artwork) and render page previews.
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => {
  const src = path.resolve(__dirname, '../07_BRAND_GUIDELINES/editable_source/brandbook.html');
  const out = path.resolve(__dirname, '../07_BRAND_GUIDELINES/GoFloaters_Brand_Guidelines.pdf');
  const prev = path.resolve(__dirname, '../07_BRAND_GUIDELINES/page_previews'); fs.mkdirSync(prev, { recursive: true });
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + src, { waitUntil: 'networkidle' });
  await p.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(i => i.decode().catch(() => {}))); });
  await p.emulateMedia({ media: 'print' });
  await p.pdf({ path: out, width: '1920px', height: '1080px', printBackground: true, preferCSSPageSize: true });
  // previews: screenshot each page in print media
  const n = await p.evaluate(() => document.querySelectorAll('.page').length);
  for (let i = 0; i < n; i++) {
    const el = (await p.$$('.page'))[i];
    await el.screenshot({ path: path.join(prev, `page_${String(i + 1).padStart(2, '0')}.jpg`), quality: 82, type: 'jpeg' });
  }
  console.log('pdf', out, 'pages', n);
  await b.close();
})();
