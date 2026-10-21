const { chromium } = require('playwright-core');
const path = require('path');
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--allow-file-access-from-files'] });
  for (const d of process.argv.slice(2)) {
    const page = await browser.newPage({ viewport: { width: 1123, height: 794 } });
    await page.goto('file://' + path.resolve(d + '.html'), { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const rep = await page.evaluate(() => {
      const mm = px => (px * 25.4 / 96).toFixed(1);
      const out = [];
      document.querySelectorAll('.page').forEach((pg, i) => {
        const P = pg.getBoundingClientRect();
        const impl = pg.querySelector('.impl');
        const foot = pg.querySelector('.foot');
        const sb = pg.querySelector('.srcblock');
        const limit = (sb || impl || foot).getBoundingClientRect().top - 2;
        const rightLimit = P.right - 4;
        let worst = null, wide = null;
        pg.querySelectorAll('*').forEach(el => {
          if (el.closest('.impl') || el.closest('.foot') || el.closest('.pattern')) return;
          if (el.closest('.srcblock') || el.closest('.abs')) return;
          const r = el.getBoundingClientRect();
          if (!r.height || !r.width) return;
          if (r.bottom > limit && (!worst || r.bottom > worst.b)) worst = { b: r.bottom, t: el.tagName + ' ' + (el.textContent || '').trim().slice(0, 50) };
          if (r.right > rightLimit && (!wide || r.right > wide.r)) wide = { r: r.right, t: el.tagName + ' ' + (el.textContent || '').trim().slice(0, 40) };
        });
        // absolute blocks (sources) vs footer
        pg.querySelectorAll('[style*="position:absolute"]').forEach(el => {
          const r = el.getBoundingClientRect(); const f = foot.getBoundingClientRect();
          if (r.bottom > f.top + 1) out.push(`  p${i+1} absolute block overlaps footer by ${mm(r.bottom - f.top)}mm`);
        });
        out.push(`  p${i+1}: ` + (worst ? `OVERFLOW ${mm(worst.b - limit)}mm ${worst.t}` : 'ok') + (wide ? ` | WIDE ${mm(wide.r - rightLimit)}mm ${wide.t}` : ''));
      });
      return out;
    });
    console.log(d + '\n' + rep.join('\n'));
    await page.pdf({ path: d + '.pdf', width: '297mm', height: '210mm', printBackground: true, preferCSSPageSize: true });
    await page.close();
  }
  await browser.close();
})();
