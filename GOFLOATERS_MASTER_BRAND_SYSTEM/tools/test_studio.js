// End-to-end test of the Brand Studio: tabs, rig controls, expressions, video playback, patterns, downloads.
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const BASE = process.argv[2] || 'http://127.0.0.1:8765/08_INTERACTIVE_BRAND_STUDIO/index.html';
const SHOTS = process.argv[3] || '/tmp/studio_shots'; fs.mkdirSync(SHOTS, { recursive: true });
const results = []; const ok = (name, cond, info = '') => { results.push({ name, pass: !!cond, info }); };
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  const p = await ctx.newPage(); const errors = [];
  p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await p.goto(BASE); await p.waitForFunction('window.STUDIO_READY');
  ok('studio loads', true);
  await p.screenshot({ path: path.join(SHOTS, '01_identity.png') });
  // identity: switch to mascot
  await p.click('#idSeg button:nth-child(3)'); ok('identity switch', (await p.getAttribute('#idImg', 'src')).includes('mascot'));
  // rig: move head slider and check transform changes
  await p.click('button[data-tab=rig]');
  const before = await p.evaluate(() => document.querySelector('#rigStage .gf-head').getAttribute('transform'));
  await p.evaluate(() => { const i = document.querySelector('input[data-k=headTilt]'); i.value = 10; i.dispatchEvent(new Event('input')); });
  const after = await p.evaluate(() => document.querySelector('#rigStage .gf-head').getAttribute('transform'));
  ok('rig head slider moves head group', before !== after, after);
  await p.evaluate(() => { const i = document.querySelector('input[data-k=legNear]'); i.value = -80; i.dispatchEvent(new Event('input')); });
  ok('rig paw slider changes leg path', await p.evaluate(() => document.querySelector('#rigStage .gf-leg-near path').getAttribute('d').length > 100));
  await p.click('#modeSeg button[data-mode=dog]'); ok('dog-only mode hides aircraft', await p.evaluate(() => getComputedStyle(document.querySelector('#rigStage .gf-aircraft')).display === 'none'));
  await p.click('#modeSeg button[data-mode=aircraft]'); ok('aircraft-only mode hides dog', await p.evaluate(() => getComputedStyle(document.querySelector('#rigStage .gf-dog')).display === 'none'));
  await p.click('#modeSeg button[data-mode=free]'); ok('full-body mode shows free body', await p.evaluate(() => getComputedStyle(document.querySelector('#rigStage .gf-dog-free')).display !== 'none'));
  await p.screenshot({ path: path.join(SHOTS, '02_rig.png') });
  // expressions
  await p.click('button[data-tab=expressions]'); await p.click('#exGrid button[data-ex=surprised]'); await p.waitForTimeout(700);
  ok('expression applies to rig', await p.evaluate(() => document.querySelector('#exStage .gf-mouth g:last-child').style.display !== 'none'));
  await p.screenshot({ path: path.join(SHOTS, '03_expressions.png') });
  // animations
  await p.click('button[data-tab=animations]'); await p.waitForTimeout(1500);
  const t1 = await p.evaluate(() => document.getElementById('vid').currentTime); await p.waitForTimeout(1000);
  const t2 = await p.evaluate(() => document.getElementById('vid').currentTime);
  ok('video plays', t2 > t1, `${t1.toFixed(2)} -> ${t2.toFixed(2)}`);
  await p.selectOption('#speed', '2'); ok('playback speed', await p.evaluate(() => document.getElementById('vid').playbackRate === 2));
  await p.click('#play'); const tp = await p.evaluate(() => document.getElementById('vid').paused); ok('pause', tp);
  await p.click('#replay'); ok('replay resets', await p.evaluate(() => document.getElementById('vid').currentTime < 1.5));
  await p.screenshot({ path: path.join(SHOTS, '04_animations_video.png') });
  await p.click('#animSrc button[data-src=live]'); await p.waitForTimeout(800);
  const live1 = await p.textContent('#time'); await p.waitForTimeout(600); const live2 = await p.textContent('#time');
  ok('live rig playback advances', live1 !== live2, live1 + ' -> ' + live2);
  await p.screenshot({ path: path.join(SHOTS, '05_animations_live.png') });
  // variants + patterns + gallery
  await p.click('button[data-tab=variants]'); await p.click('#varSeg button:nth-child(2)'); ok('variant switch', (await p.getAttribute('#varImg', 'src')).includes('B_'));
  await p.screenshot({ path: path.join(SHOTS, '06_variants.png') });
  await p.click('button[data-tab=patterns]'); await p.waitForTimeout(500);
  const s1 = await p.evaluate(() => document.querySelector('#patStage').innerHTML.length); await p.waitForTimeout(300);
  const h1 = await p.evaluate(() => document.querySelector('#patStage').innerHTML); await p.waitForTimeout(400); const h2 = await p.evaluate(() => document.querySelector('#patStage').innerHTML);
  ok('animated pattern updates', s1 > 1000 && h1 !== h2);
  await p.screenshot({ path: path.join(SHOTS, '07_patterns.png') });
  await p.click('button[data-tab=gallery]'); await p.waitForTimeout(800);
  ok('gallery images load', await p.evaluate(() => [...document.querySelectorAll('#gal img')].filter(i => i.complete && i.naturalWidth > 0).length), '');
  await p.screenshot({ path: path.join(SHOTS, '08_gallery.png') });
  // assets: check all links resolve, then download one
  await p.click('button[data-tab=assets]');
  const links = await p.evaluate(() => [...document.querySelectorAll('#assetRows a')].map(a => a.href));
  let bad = 0; for (const l of links) { const r = await p.request.head(l); if (r.status() !== 200) bad++; }
  ok('all asset links resolve (HTTP 200)', bad === 0, `${links.length} links, ${bad} broken`);
  await p.fill('#q', 'lockup_full_colour.svg');
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('#assetRows a')]);
  const dp = path.join(SHOTS, 'downloaded_' + dl.suggestedFilename()); await dl.saveAs(dp);
  ok('download delivers a real file', fs.statSync(dp).size > 10000, dl.suggestedFilename() + ' ' + fs.statSync(dp).size + ' bytes');
  await p.fill('#q', ''); await p.screenshot({ path: path.join(SHOTS, '09_assets.png') });
  // reduced motion
  await p.click('button[data-tab=animations]'); await p.check('#reduced');
  ok('reduced motion pauses media', await p.evaluate(() => document.getElementById('vid').paused));
  // mobile layout
  const m = await b.newPage({ viewport: { width: 390, height: 844 } }); await m.goto(BASE); await m.waitForFunction('window.STUDIO_READY');
  ok('mobile: menu button visible', await m.isVisible('#menuBtn'));
  ok('mobile: no horizontal overflow', await m.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  await m.screenshot({ path: path.join(SHOTS, '10_mobile_identity.png') });
  await m.click('#menuBtn'); await m.click('button[data-tab=rig]'); await m.waitForTimeout(300); await m.screenshot({ path: path.join(SHOTS, '11_mobile_rig.png'), fullPage: false });
  ok('no console errors', errors.length === 0, errors.slice(0, 5).join(' | '));
  await b.close();
  fs.writeFileSync(path.join(SHOTS, 'results.json'), JSON.stringify(results, null, 1));
  results.forEach(r => console.log((r.pass ? 'PASS ' : 'FAIL ') + r.name + (r.info ? '  [' + r.info + ']' : '')));
})();
