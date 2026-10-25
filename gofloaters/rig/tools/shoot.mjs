// Rasterise SVG strings with the pre-installed Chromium (one browser, many frames).
import {createRequire} from 'node:module';

const {chromium} = createRequire(import.meta.url)('playwright'); // pre-installed, resolved via NODE_PATH

export async function openShooter(width, height) {
  const browser = await chromium.launch();
  const page = await browser.newPage({viewport: {width, height}});
  await page.setContent(`<html><body style="margin:0;overflow:hidden"><div id="s"></div></body></html>`);
  return {
    async shoot(svg, file, {transparent = false} = {}) {
      await page.evaluate((s) => { document.getElementById('s').innerHTML = s; }, svg);
      await page.screenshot({path: file, clip: {x: 0, y: 0, width, height}, omitBackground: transparent});
    },
    close: () => browser.close(),
  };
}
