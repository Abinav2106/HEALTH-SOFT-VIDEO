const { chromium } = require('playwright-core');
const path = require('path');
(async () => {
  const exe = process.argv[2];
  const browser = await chromium.launch({ executablePath: exe, args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage({ viewport: { width: 1123, height: 794 } });
  await page.goto('file://' + path.resolve('doc.html'), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const report = await page.evaluate(() => {
    const mm = px => px * 25.4 / 96;
    const out = [];
    document.querySelectorAll('.page').forEach((pg, i) => {
      const top = pg.getBoundingClientRect().top;
      const footer = pg.querySelector('.pf').getBoundingClientRect().top;
      let worst = null;
      pg.querySelectorAll('*').forEach(el => {
        if (el.closest('.pf')) return;
        const r = el.getBoundingClientRect();
        if (r.height === 0) return;
        if (r.bottom > footer - 1.5 && (!worst || r.bottom > worst.b)) worst = { b: r.bottom, tag: el.tagName, txt: (el.textContent||'').slice(0,60) };
        if (el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflow !== 'visible') out.push(`p${i+1} hscroll ${el.tagName}`);
      });
      out.push(`p${i+1}: footerTop=${mm(footer-top).toFixed(1)}mm ` + (worst ? `OVERLAP by ${mm(worst.b-footer).toFixed(1)}mm ${worst.tag} "${worst.txt}"` : 'ok'));
    });
    const fams = new Set(); document.fonts.forEach(f => { if (f.status==='loaded') fams.add(f.family+' '+f.weight+' '+f.style); });
    out.push('fonts loaded: ' + [...fams].join(', '));
    return out;
  });
  console.log(report.join('\n'));
  await page.pdf({ path: 'out.pdf', width: '297mm', height: '210mm', printBackground: true, preferCSSPageSize: true });
  await browser.close();
})();
