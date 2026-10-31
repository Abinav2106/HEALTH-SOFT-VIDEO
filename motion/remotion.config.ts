/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import {Config} from '@remotion/cli/config';
import fs from 'node:fs';
import path from 'node:path';

Config.setRspack(true);
Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setDefaultPremountInSeconds(2);

// MP4 defaults: H.264, high quality, yuv420p + BT.709 tags (standard "TV range" video players expect).
Config.setCodec('h264');
Config.setCrf(18);
Config.setPixelFormat('yuv420p');
Config.setColorSpace('bt709');

// Browser for rendering. Normally Remotion downloads its own Chrome Headless Shell on first render.
// In sandboxes/CI where that download is blocked, point it at an existing headless shell instead:
//   REMOTION_BROWSER_EXECUTABLE=/path/to/chrome-headless-shell
// A Playwright-installed headless shell under /opt/pw-browsers is picked up automatically.
const findPreinstalledShell = () => {
  const root = '/opt/pw-browsers';
  if (!fs.existsSync(root)) return null;
  for (const dir of fs.readdirSync(root).filter((d) => d.startsWith('chromium_headless_shell-')).sort().reverse()) {
    const bin = path.join(root, dir, 'chrome-headless-shell-linux64', 'chrome-headless-shell');
    if (fs.existsSync(bin)) return bin;
  }
  return null;
};
const browser = process.env.REMOTION_BROWSER_EXECUTABLE || findPreinstalledShell();
if (browser) {
  Config.setBrowserExecutable(browser);
}
