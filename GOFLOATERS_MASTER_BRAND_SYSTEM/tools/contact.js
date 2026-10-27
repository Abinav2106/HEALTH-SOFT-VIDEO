// Contact sheet of an animation's frames: node tools/contact.js <anim> <out.png> [n=8] [w=480]
const { chromium } = require('playwright');
const path = require('path');
const [name, out, nArg, wArg] = process.argv.slice(2);
const N = +(nArg || 8), W = +(wArg || 480), H = Math.round(W * 9 / 16);
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W * Math.min(N, 4), height: H * Math.ceil(N / 4) } });
  await page.goto('file://' + path.resolve(__dirname, '../03_CHARACTER_RIG/rig_source/stage.html'));
  await page.waitForFunction('window.READY');
  const shots = [];
  for (let i = 0; i < N; i++) {
    const d = await page.evaluate(([nm, i, N]) => {
      const a = GFMotion.ANIMS[nm]; const t = a.duration * i / N;
      rig.svg.setAttribute('viewBox', GFMotion.VIEWS[a.view] || a.view);
      rig.reset(); rig.set(GFMotion.frame(nm, t));
      rig.decorBack.innerHTML = ''; rig.decorFront.innerHTML = '';
      if (a.decor) a.decor({ back: rig.decorBack, front: rig.decorFront, el: rig.el }, t);
      return t;
    }, [name, i, N]);
    await page.setViewportSize({ width: W, height: H });
    shots.push(await page.screenshot({ type: 'png' }));
  }
  await browser.close();
  const sharpless = require('child_process');
  const fs = require('fs'); const tmp = out + '_parts'; fs.mkdirSync(tmp, { recursive: true });
  shots.forEach((b, i) => fs.writeFileSync(`${tmp}/${String(i).padStart(2, '0')}.png`, b));
  sharpless.execSync(`montage ${tmp}/*.png -tile 4x -geometry +2+2 -background '#ccc' ${out} && rm -r ${tmp}`);
})();
