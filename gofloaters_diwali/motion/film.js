// Runtime: loads the assets, exposes frame-exact rendering for the renderer
// (window.renderFrame) and a scrub/play preview with the audio track.
(async function () {
  const { FPS, DURATION, loadImage, registerClip, flushPending, Film, Tilo, FONT } = GF;
  const q = new URLSearchParams(location.search);
  const RENDER = q.has("render");
  if (RENDER) document.body.classList.add("render");
  const base = q.get("assets") || "../assets";
  const cfg = GF.CONFIG;
  // the standalone player inlines its assets; the project reads them from disk
  const A = window.GF_ASSETS || {};

  await Promise.all(Object.values(FONT).map((f) => document.fonts.load(`64px "${f}"`, "AZ₹→·")));
  await Promise.all([
    loadImage("tilo", A.tilo || `${base}/brand/tilo_full.png`),
    loadImage("speedlines", A.speedlines || `${base}/brand/speedlines.png`),
    loadImage("logo", A.logo || `${base}/brand/gofloaters_logo_original.webp`),
    A.tilo ? Promise.resolve(null) : loadImage("workspace", `${base}/workspaces/${cfg.workspace.file}`),
  ]);
  // footage manifest written by tools/render.mjs (frames extracted from the recording)
  const clipDir = q.get("clips");
  if (clipDir) {
    try {
      const m = await (await fetch(`${clipDir}/manifest.json`)).json();
      for (const [name, info] of Object.entries(m)) registerClip(name, { dir: `${clipDir}/${name}`, count: info.count, fps: info.fps });
    } catch (e) { /* no footage yet: slots are drawn */ }
  }
  Tilo.init();

  const cv = document.getElementById("c");
  const ctx = cv.getContext("2d");
  const N = Math.round(FPS * DURATION);

  async function renderFrame(f) {
    const t = f / FPS;
    Film.render(ctx, t);
    for (let k = 0; k < 3 && GF.pending.size; k++) {
      await flushPending();
      Film.render(ctx, t);
    }
    return true;
  }
  window.renderFrame = renderFrame;
  window.FILM_INFO = {
    frames: N, fps: FPS,
    slots: { gameplay: !!(GF.clips.gameplay && GF.clips.gameplay.count), workspace: !!GF.images.workspace },
  };

  if (RENDER) { window.FILM_READY = true; return; }

  // ------------------------------------------------------------ preview
  const play = document.getElementById("play");
  const scrub = document.getElementById("scrub");
  const tc = document.getElementById("tc");
  scrub.max = N - 1;
  const audio = new Audio(A.audio || q.get("audio") || "../out/audio/GoFloaters_Diwali_temp_mix.wav");
  const mute = document.getElementById("mute");
  if (mute) mute.onclick = () => { audio.muted = !audio.muted; mute.setAttribute("aria-pressed", String(audio.muted)); mute.textContent = audio.muted ? "Sound off" : "Sound on"; };
  let playing = false, t0 = 0, f0 = 0, busy = false;
  const show = (f) => { scrub.value = f; tc.textContent = `${(f / FPS).toFixed(2).padStart(5, "0")} / ${DURATION.toFixed(2)}`; };
  async function draw(f) {
    if (busy) return;
    busy = true;
    Film.render(ctx, f / FPS);
    if (GF.pending.size) flushPending();
    busy = false;
    show(f);
    if (window.GF_onFrame) window.GF_onFrame(f);
  }
  function tick() {
    if (!playing) return;
    const f = Math.floor(f0 + ((performance.now() - t0) / 1000) * FPS);
    if (f >= N) { playing = false; play.textContent = "Play"; audio.pause(); draw(N - 1); return; }
    draw(f);
    requestAnimationFrame(tick);
  }
  play.onclick = () => {
    playing = !playing;
    play.textContent = playing ? "Pause" : "Play";
    if (playing) {
      f0 = +scrub.value >= N - 1 ? 0 : +scrub.value;
      t0 = performance.now();
      audio.currentTime = f0 / FPS;
      audio.play().catch(() => {});
      tick();
    } else audio.pause();
  };
  scrub.oninput = () => { playing = false; play.textContent = "Play"; audio.pause(); draw(+scrub.value); };
  window.GF_seek = (f) => { scrub.value = f; scrub.oninput(); };
  draw(+(q.get("f") || 0));
})();
