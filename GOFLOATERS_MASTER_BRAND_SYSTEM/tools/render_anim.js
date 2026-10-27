// Render a GFMotion animation to a PNG frame sequence with the real rig.
// usage: node tools/render_anim.js <anim> <outDir> [--w 1920] [--h 1080] [--fps 30] [--transparent] [--start 0] [--end dur] [--step 1]
const { chromium } = require('playwright');
const path = require('path'); const fs = require('fs');
const args = process.argv.slice(2);
const name = args[0], outDir = args[1];
const opt = k => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : null; };
const W = +(opt('w') || 1920), H = +(opt('h') || 1080), FPS = +(opt('fps') || 30);
const transparent = args.includes('--transparent');
(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const stage = 'file://' + path.resolve(__dirname, '../03_CHARACTER_RIG/rig_source/stage.html');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  await page.goto(stage);
  await page.waitForFunction('window.READY');
  const info = await page.evaluate(n => { const a = GFMotion.ANIMS[n]; rig.svg.setAttribute('viewBox', opt_vb(a)); function opt_vb(a) { return GFMotion.VIEWS[a.view] || a.view; } return { duration: a.duration, view: a.view }; }, name);
  if (opt('vb')) await page.evaluate(vb => rig.svg.setAttribute('viewBox', vb), opt('vb'));
  await page.evaluate(bg => { document.body.style.background = bg; }, transparent ? 'transparent' : '#ffffff');
  const start = +(opt('start') || 0), end = opt('end') != null ? +opt('end') : info.duration;
  const n = Math.round((end - start) * FPS);
  const step = +(opt('step') || 1);
  for (let i = 0; i < n; i += step) {
    const t = start + i / FPS;
    await page.evaluate(([nm, tt]) => {
      const a = GFMotion.ANIMS[nm];
      rig.reset(); rig.set(GFMotion.frame(nm, tt));
      rig.decorBack.innerHTML = ''; rig.decorFront.innerHTML = '';
      if (a.decor) a.decor({ back: rig.decorBack, front: rig.decorFront, el: rig.el }, a.loop ? tt % a.duration : tt);
    }, [name, t]);
    await page.screenshot({ path: path.join(outDir, `frame_${String(i).padStart(4, '0')}.png`), omitBackground: transparent });
  }
  await browser.close();
  console.log(name, 'frames', Math.ceil(n / step), 'duration', info.duration);
})();
