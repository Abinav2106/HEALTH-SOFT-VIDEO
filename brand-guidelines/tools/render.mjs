// Render the brand book: PDF via Chromium print, plus per-page PNG previews for QC.
import path from 'node:path';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const [dir, pdfOut, pngDir] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1123, height: 794 }, deviceScaleFactor: 1.5 });
await page.goto('file://' + path.resolve(dir, 'index.html'), { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
if (pngDir) {
  const els = await page.$$('section.page');
  for (let i = 0; i < els.length; i++) await els[i].screenshot({ path: `${pngDir}/p${String(i + 1).padStart(2, '0')}.png` });
}
await page.pdf({ path: pdfOut, preferCSSPageSize: true, printBackground: true });
await browser.close();
