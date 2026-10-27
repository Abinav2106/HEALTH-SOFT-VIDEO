// Builds the storyboard document (HTML + PDF) from out/frames/*.png and tools/storyboard.cjs.
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const SB = require('./storyboard.cjs');
const ROOT = path.resolve(__dirname, '..'), OUT = path.join(ROOT, 'out');
const FONT = path.resolve(ROOT, '../remotion/public/fonts/Inter-latin-var.woff2');
const fr = id => 'frames/shot' + id + '.png';
const METHOD = { 'HIGGSFIELD': '#7B5CF0', 'CLAUDE / MOTION GRAPHICS': '#1F7AE0', 'ORIGINAL GAME': '#18B36A', 'ORIGINAL GAME + VFX': '#0E8C8C' };
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const chip = m => `<span class="chip" style="background:${METHOD[m]}">${m}</span>`;
const FIELDS = [['Timecode', 'tc'], ['Camera position', 'camera'], ['Tilo position', 'tilo'], ['Foreground', 'fg'], ['Background', 'bg'], ['Motion direction', 'motion'], ['Transition into next shot', 'transition'], ['Screen copy', 'copy'], ['Sound cue', 'sound'], ['Production method', 'method']];
const css = `@font-face{font-family:Inter;src:url('file://${FONT}') format('woff2');font-weight:100 900}
@page{size:1600px 1000px;margin:0}
*{box-sizing:border-box}body{margin:0;font-family:Inter,sans-serif;color:#1A1F24;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pg{width:1600px;height:1000px;padding:48px 56px;position:relative;page-break-after:always;overflow:hidden}
.top{display:flex;justify-content:space-between;align-items:baseline;border-bottom:2px solid #1A1F24;padding-bottom:12px;margin-bottom:24px}
.top b{font-size:15px;letter-spacing:.12em}.top span{font-size:14px;color:#6B747D}
h1{font-size:54px;margin:0 0 6px;letter-spacing:-.02em}h2{font-size:38px;margin:0;letter-spacing:-.02em}
.chip{display:inline-block;color:#fff;font:700 13px Inter;letter-spacing:.08em;padding:6px 10px;border-radius:6px}
.shot{display:grid;grid-template-columns:480px 1fr;gap:40px}
.shot img{width:480px;height:853px;border-radius:14px;box-shadow:0 0 0 1px #D5DADF}
.fields{display:grid;grid-template-columns:1fr 1fr;gap:12px 28px;margin-top:14px}
.fd{border-top:1px solid #DDE2E6;padding-top:7px}.fd .k{font:700 11.5px Inter;letter-spacing:.1em;text-transform:uppercase;color:#6B747D}
.fd .v{font-size:15px;line-height:1.38;margin-top:3px}.wide{grid-column:1 / span 2}
.strip{display:grid;grid-template-columns:repeat(10,1fr);gap:10px}.strip img{width:100%;border-radius:8px;box-shadow:0 0 0 1px #D5DADF}
.strip .l{font:700 12px Inter;margin-top:6px}.strip .t{font-size:11px;color:#6B747D}
.bar{display:flex;height:16px;border-radius:4px;overflow:hidden;margin:6px 0 4px}
table{border-collapse:collapse;width:100%}td{padding:9px 10px;border-top:1px solid #DDE2E6;font-size:15px;vertical-align:top;line-height:1.38}
td.k{font-weight:700;width:240px}.ok{color:#0E8A4F;font-weight:800}.pend{color:#B26A00;font-weight:800}
.bible{display:grid;grid-template-columns:1fr 1fr;gap:10px 30px}.bible .fd .v{font-size:14px}
ol{margin:8px 0 0 20px;padding:0}li{font-size:16px;line-height:1.45;margin-bottom:8px}`;
const head = (r) => `<div class="top"><b>${SB.title.toUpperCase()}</b><span>${r}</span></div>`;
let pages = '';
// cover: film strip, timeline, continuity bible
pages += `<div class="pg">${head(SB.subtitle)}
  <h1>One continuous journey, eye to end card</h1>
  <div style="font-size:17px;color:#4B545C;margin-bottom:20px">Tilo spots a Spark, the world opens, India lights up and the Reel dives into Chennai and the real GoFloaters game. It closes on the reward and the call to play.</div>
  <div class="strip">${SB.shots.map(s => `<div><img src="${fr(s.id)}"><div class="l">${s.id} · ${esc(s.name)}</div><div class="t">${s.tc}</div><div style="height:4px;border-radius:2px;margin-top:5px;background:${METHOD[s.method]}"></div></div>`).join('')}</div>
  <div style="display:flex;gap:18px;margin:14px 0 18px">${Object.keys(METHOD).map(chip).join('')}</div>
  <div class="bible">${SB.bible.map(([k, v]) => `<div class="fd"><div class="k">${k}</div><div class="v">${esc(v)}</div></div>`).join('')}</div></div>`;
for (const s of SB.shots) {
  pages += `<div class="pg">${head(`Shot ${s.id} of 10 · ${s.tc}`)}<div class="shot"><img src="${fr(s.id)}"><div>
  <div style="display:flex;justify-content:space-between;align-items:center"><h2>Shot ${s.id} · ${esc(s.name)}</h2>${chip(s.method)}</div>
  <div class="fields">${FIELDS.map(([k, f]) => `<div class="fd${['transition', 'copy'].includes(f) ? '' : ''}"><div class="k">${k}</div><div class="v">${esc(s[f])}</div></div>`).join('')}
  <div class="fd wide"><div class="k">Production notes</div><div class="v">${esc(s.notes)}</div></div></div></div></div></div>`;
}
pages += `<div class="pg">${head('Final check · open items')}<h2 style="margin-bottom:14px">Final check</h2>
  <table>${SB.check.map(([k, st, v]) => `<tr><td class="k">${k}</td><td style="width:110px" class="${st === 'yes' ? 'ok' : 'pend'}">${st === 'yes' ? 'CONFIRMED' : 'PENDING'}</td><td>${esc(v)}</td></tr>`).join('')}</table>
  <h2 style="margin:26px 0 4px">Needed to lock the final</h2><ol>${SB.open.map(o => `<li>${esc(o)}</li>`).join('')}</ol></div>`;
const html = `<!doctype html><html><head><meta charset="utf-8"><title>Spark Hunt Storyboard</title><style>${css}</style></head><body>${pages}</body></html>`;
fs.writeFileSync(path.join(OUT, 'storyboard.html'), html);
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1600, height: 1000 } });
  await p.goto('file://' + path.join(OUT, 'storyboard.html')); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(500);
  await p.pdf({ path: path.join(OUT, 'GoFloaters_SparkHunt_HeroReel_Storyboard.pdf'), width: '1600px', height: '1000px', printBackground: true });
  // page previews for review
  const n = await p.evaluate(() => document.querySelectorAll('.pg').length);
  for (let i = 0; i < n; i++) { const el = (await p.$$('.pg'))[i]; await el.screenshot({ path: path.join(OUT, `board_${String(i).padStart(2, '0')}.png`) }); }
  await b.close(); console.log('board pages', n);
})();
