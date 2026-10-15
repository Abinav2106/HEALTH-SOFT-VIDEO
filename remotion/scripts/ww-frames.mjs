// Export the actual first and last rendered frame of every W&W section (clean, no burn-ins) plus a shot
// manifest: node scripts/ww-frames.mjs [outDir=out/ww_frames]
// Section times mirror T in src/ww/constants.ts. Stand-in character shots are rendered with allowStandIns.
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const FPS = 30;
const SHOTS = [
  {id: 'S01_R1_grid', from: 0, to: 3.93, camera: 'locked, full frame', mascot: 'none', phone: 'none', outgoing: 'selected mark centre (540,760), height 96 px → Doubt question-mark centre'},
  {id: 'S02_R2_reveal', from: 3.93, to: 5.5, camera: 'question-mark anchor (540,760) s=0.397 → push to s=0.62 (540,734)', mascot: '2D rig: startle hop 4.44, lifts phone 4.75–5.12', phone: 'right hand: hangs → raised in front (back to camera)', outgoing: 'hard cut into phone-camera view'},
  {id: 'S03_R2_call', from: 5.5, to: 11.85, camera: 'handheld s=1.5 (540,470) → 1.58 → 1.66 → punch 1.72', mascot: '2D rig: pop-in, wave, chest tap, open hand, scratch, twirl; selfie right arm', phone: 'is the camera (right arm reaches it, off-frame)', outgoing: 'pullback from s=1.72 (536,510)'},
  {id: 'S04_R2_pullback', from: 11.85, to: 12.6, camera: 's=1.72 → 0.75 (540,688)', mascot: '2D rig: lowers selfie arm', phone: 'none', outgoing: 'full figure centred'},
  {id: 'S05_R2_grid', from: 12.6, to: 13.35, camera: 's=0.75 → 0.36 (540,826)', mascot: '2D rig: both arms present the grid', phone: 'none', outgoing: 'Branding + Consulting panels released to R3 layers'},
  {id: 'S06_R3_layers', from: 13.35, to: 15.0, camera: 'lift: Doubt exits bottom (sy 826→2120)', mascot: 'approved hand cutout presses pill 14.26 s', phone: 'none', outgoing: 'device panel interior (black) scales to fill frame'},
  {id: 'S07_R3_A_consulting_branding', from: 15.0, to: 20.0, camera: 'locked', mascot: 'none', phone: 'none', outgoing: 'brand board interior → orange, expands 19.42–19.97 s'},
  {id: 'S08_R3_B_creative_marketing_ads', from: 20.0, to: 25.0, camera: 'locked', mascot: 'none', phone: 'none', outgoing: 'story frame interior (white) expands 24.42–24.97 s'},
  {id: 'S09_R3_C_meta_setup', from: 25.0, to: 31.0, camera: 'locked', mascot: 'approved hand cutout presses button 26.27 s', phone: '(530,1300) s=0.66 → (540,1062) s=1.0', outgoing: 'phone at R4 geometry, white screen, black bookmark'},
  {id: 'S10_R4_collection', from: 31.0, to: 38.5, camera: 'locked; phone fixed (540,1062) 600x1236', mascot: 'none', phone: 'R4 anchor', outgoing: 'single orange bookmark, screen centre'},
  {id: 'S11_R2_callback', from: 38.5, to: 40.5, camera: 'handheld s=1.5 → 1.58 (540,470→460)', mascot: '2D rig: shrug, hand up, open hand; selfie right arm', phone: 'is the camera', outgoing: 'pale circle wipe origin (540,980)'},
  {id: 'S12_R3_close', from: 40.5, to: 45.0, camera: 'locked', mascot: 'none', phone: 'none', outgoing: 'end of film (hold 41.0–45.0 s)'},
];

const outDir = path.resolve(process.argv[2] ?? 'out/ww_frames');
fs.mkdirSync(outDir, {recursive: true});
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE ?? null;
const inputProps = {mode: 'master', captions: false, allowStandIns: true};
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('public')});
const composition = await selectComposition({serveUrl, id: 'WW-Master', inputProps, browserExecutable});
const manifest = [];
for (const s of SHOTS) {
  const first = Math.max(0, Math.ceil(s.from * FPS - 1e-6));
  const last = Math.min(Math.ceil(s.to * FPS - 1e-6) - 1, composition.durationInFrames - 1);
  const files = {};
  for (const [k, frame] of [['first', first], ['last', last]]) {
    const output = path.join(outDir, `${s.id}_${k}_f${String(frame).padStart(4, '0')}.png`);
    await renderStill({serveUrl, composition, frame, output, inputProps, browserExecutable});
    files[k] = {frame, file: path.basename(output)};
  }
  manifest.push({...s, ...files});
  console.log(s.id, first, last);
}
fs.writeFileSync(path.join(outDir, 'shot_manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
