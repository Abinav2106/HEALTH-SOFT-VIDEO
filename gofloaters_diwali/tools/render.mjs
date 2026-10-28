// Render the motion composition frame-by-frame in headless Chromium and
// encode it. Usage (from gofloaters_diwali/):
//   node tools/render.mjs                 final masters (refuses while slots are empty)
//   node tools/render.mjs --preview       masters with labelled slot panels (_PREVIEW names)
//   node tools/render.mjs --stills 0.4,1.3,20   QC stills only -> out/stills/
//   node tools/render.mjs --workers 4 --range 0:300
import { createRequire } from "node:module";
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

// resolved like require() so a globally installed Playwright is found
const { chromium } = createRequire(import.meta.url)("playwright");

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "out");
const NAME = "GoFloaters_Diwali_Spark_Hunt_40s";
const args = process.argv.slice(2);
const flag = (k) => args.includes(k);
const opt = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);

const MIME = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".otf": "font/otf", ".wav": "audio/wav" };
function serve() {
  return new Promise((res) => {
    const srv = http.createServer((req, rsp) => {
      const p = path.join(ROOT, decodeURIComponent(new URL(req.url, "http://x").pathname));
      if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { rsp.writeHead(404); rsp.end(); return; }
      rsp.writeHead(200, { "content-type": MIME[path.extname(p)] || "application/octet-stream" });
      fs.createReadStream(p).pipe(rsp);
    });
    srv.listen(0, "127.0.0.1", () => res(srv));
  });
}

function run(cmd, a) {
  const r = spawnSync(cmd, a, { stdio: ["ignore", "inherit", "inherit"] });
  if (r.status !== 0) throw new Error(`${cmd} failed`);
}

// Extract the real gameplay recording to frames (cover-fit size, no stretch).
function prepareClips() {
  const cfg = fs.readFileSync(path.join(ROOT, "motion/config.js"), "utf8");
  const file = (cfg.match(/gameplay:\s*{\s*file:\s*"([^"]+)"/) || [])[1];
  const src = file && path.join(ROOT, "assets/gameplay", file);
  const dir = path.join(OUT, "cache/clips");
  const manifest = {};
  if (src && fs.existsSync(src)) {
    const fdir = path.join(dir, "gameplay");
    const stamp = path.join(fdir, ".source");
    const sig = `${src}:${fs.statSync(src).size}:${fs.statSync(src).mtimeMs}`;
    if (!fs.existsSync(stamp) || fs.readFileSync(stamp, "utf8") !== sig) {
      fs.rmSync(fdir, { recursive: true, force: true });
      fs.mkdirSync(fdir, { recursive: true });
      console.log("extracting gameplay frames…");
      run("ffmpeg", ["-v", "error", "-i", src, "-vf",
        "fps=30,scale='if(gt(a,9/16),-2,1080)':'if(gt(a,9/16),1920,-2)':flags=lanczos", "-q:v", "2", path.join(fdir, "%05d.jpg")]);
      fs.writeFileSync(stamp, sig);
    }
    manifest.gameplay = { count: fs.readdirSync(fdir).filter((f) => f.endsWith(".jpg")).length, fps: 30 };
  }
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "manifest.json"), JSON.stringify(manifest));
}

async function openPage(browser, port) {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on("pageerror", (e) => console.error("page error:", e.message));
  await page.goto(`http://127.0.0.1:${port}/motion/index.html?render=1&clips=/out/cache/clips`);
  await page.waitForFunction(() => window.FILM_READY === true, null, { timeout: 120000 });
  return page;
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  prepareClips();
  const srv = await serve();
  const port = srv.address().port;
  const browser = await chromium.launch({ args: ["--disable-gpu-vsync", "--force-color-profile=srgb"] });
  try {
    const probe = await openPage(browser, port);
    const info = await probe.evaluate(() => window.FILM_INFO);
    const missing = Object.entries(info.slots).filter(([, ok]) => !ok).map(([k]) => k);

    if (flag("--stills")) {
      const dir = path.join(OUT, "stills");
      fs.mkdirSync(dir, { recursive: true });
      for (const s of opt("--stills").split(",")) {
        const f = Math.round(parseFloat(s) * info.fps);
        await probe.evaluate((f) => window.renderFrame(f), f);
        await probe.locator("#c").screenshot({ path: path.join(dir, `t${parseFloat(s).toFixed(2).padStart(5, "0")}.png`) });
      }
      console.log(`stills -> ${dir}`);
      return;
    }

    const preview = flag("--preview");
    if (missing.length && !preview) {
      console.error(`Refusing to write final masters: empty slots -> ${missing.join(", ")}.\n` +
        "Add the real files (see assets/README.md) or pass --preview for a labelled preview.");
      process.exitCode = 2;
      return;
    }
    const suffix = missing.length ? "_PREVIEW" : "";
    const [a, b] = (opt("--range", `0:${info.frames}`)).split(":").map(Number);
    const workers = Number(opt("--workers", 4));
    const segDir = path.join(OUT, "segments");
    fs.rmSync(segDir, { recursive: true, force: true });
    fs.mkdirSync(segDir, { recursive: true });
    const per = Math.ceil((b - a) / workers);
    const t0 = Date.now();
    let done = 0;
    await Promise.all(Array.from({ length: workers }, async (_, w) => {
      const s = a + w * per, e = Math.min(b, s + per);
      if (s >= e) return;
      const page = w === 0 ? probe : await openPage(browser, port);
      const seg = path.join(segDir, `seg_${String(w).padStart(2, "0")}.mp4`);
      const ff = spawn("ffmpeg", ["-v", "error", "-y", "-f", "image2pipe", "-framerate", "30", "-c:v", "mjpeg", "-i", "-",
        "-c:v", "libx264", "-preset", "slow", "-crf", "15", "-pix_fmt", "yuv420p", "-r", "30", "-movflags", "+faststart", seg],
      { stdio: ["pipe", "inherit", "inherit"] });
      for (let f = s; f < e; f++) {
        await page.evaluate((f) => window.renderFrame(f), f);
        const buf = await page.locator("#c").screenshot({ type: "jpeg", quality: 96 });
        if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
        done++;
        if (done % 60 === 0) console.log(`${done}/${b - a} frames  ${((Date.now() - t0) / 1000).toFixed(0)} s`);
      }
      ff.stdin.end();
      await new Promise((r) => ff.on("close", r));
    }));
    const list = path.join(segDir, "list.txt");
    fs.writeFileSync(list, fs.readdirSync(segDir).filter((f) => f.endsWith(".mp4")).sort().map((f) => `file '${path.join(segDir, f)}'`).join("\n"));
    const silent = path.join(OUT, `${NAME}_Muted${suffix}.mp4`);
    run("ffmpeg", ["-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", list, "-c", "copy", "-movflags", "+faststart", silent]);
    const mix = path.join(OUT, "audio/GoFloaters_Diwali_temp_mix.wav");
    const master = path.join(OUT, `${NAME}_9x16${suffix}.mp4`);
    if (fs.existsSync(mix)) {
      run("ffmpeg", ["-v", "error", "-y", "-i", silent, "-i", mix, "-map", "0:v", "-map", "1:a", "-c:v", "copy",
        "-c:a", "aac", "-b:a", "256k", "-ar", "48000", "-shortest", "-movflags", "+faststart", master]);
    } else {
      console.warn("no audio mix found (run tools/make_audio.py); master written without sound");
      fs.copyFileSync(silent, master);
    }
    console.log(`done in ${((Date.now() - t0) / 1000).toFixed(0)} s\n  ${master}\n  ${silent}`);
    if (missing.length) console.log(`PREVIEW: slots still empty -> ${missing.join(", ")}`);
  } finally {
    await browser.close();
    srv.close();
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
