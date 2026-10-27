// Render the live hero page at several sizes, in idle and pointing states.
// usage: node tools/shoot_website.js outDir
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const out = process.argv[2]; fs.mkdirSync(out, { recursive: true });
const url = 'file://' + path.resolve(__dirname, '../09_BRAND_APPLICATIONS/website/index.html');
const SIZES = [['desktop_1920x1080', 1920, 1080, 1], ['laptop_1440x900', 1440, 900, 1], ['tablet_1024x768', 1024, 768, 1], ['mobile_390x844', 390, 844, 3]];
(async () => {
  const b = await chromium.launch();
  for (const [name, w, h, dpr] of SIZES) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: dpr });
    await p.goto(url); await p.waitForFunction('window.READY'); await p.evaluate(() => document.fonts.ready);
    await p.evaluate(() => { window.HERO_PAUSED = true; heroSet(0.2, 0); });
    await p.screenshot({ path: `${out}/website_hero_${name}_idle.png` });
    await p.fill('#q', 'Indiranagar'); await p.evaluate(() => { window.HERO_PAUSED = true; heroSet(1.2, 1); });
    await p.screenshot({ path: `${out}/website_hero_${name}_search_point.png` });
    await p.close(); console.log(name);
  }
  // reduced-motion proof: the page renders a static pose and never starts the idle loop
  const p = await b.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  await p.goto(url); await p.waitForFunction('window.READY');
  const a = await p.evaluate(() => document.querySelector('#stage svg').innerHTML.length);
  await p.waitForTimeout(1500);
  const s1 = await p.evaluate(() => document.querySelector('#stage svg').innerHTML);
  await p.waitForTimeout(700);
  const s2 = await p.evaluate(() => document.querySelector('#stage svg').innerHTML);
  console.log('reduced-motion static:', s1 === s2);
  // and the full-motion page really animates (rig parts move)
  const m = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await m.goto(url); await m.waitForFunction('window.READY'); await m.waitForTimeout(600);
  const m1 = await m.evaluate(() => document.querySelector('#stage svg').innerHTML); await m.waitForTimeout(500);
  const m2 = await m.evaluate(() => document.querySelector('#stage svg').innerHTML);
  console.log('full-motion animates:', m1 !== m2);
  await b.close();
})();
