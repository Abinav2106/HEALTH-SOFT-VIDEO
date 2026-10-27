// Rasterise master SVGs: transparent PNG at a target width (+ optional light/dark previews).
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const jobs = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  for (const j of jobs) {
    let svg = fs.readFileSync(j.in, 'utf8').replace(/<\?xml[^>]*>/, '');
    const vb = svg.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
    const w = j.w, h = Math.round(w * vb[3] / vb[2]);
    svg = svg.replace(/width="[^"]+" height="[^"]+"/, `width="${w}" height="${h}"`);
    const pad = j.pad || 0;
    await p.setViewportSize({ width: w + pad * 2, height: h + pad * 2 });
    await p.setContent(`<body style="margin:0;padding:${pad}px;background:${j.bg || 'transparent'}">${svg}</body>`);
    await p.screenshot({ path: j.out, omitBackground: !j.bg });
    console.log(j.out);
  }
  await b.close();
})();
