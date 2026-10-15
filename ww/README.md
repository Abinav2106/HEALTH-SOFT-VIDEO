# W&W — "Start with why." (45 s, 9:16, 1080×1920, 30 fps)

One continuous film that rebuilds the four reference mechanics from `WW_Animation_Reference_Study.pdf`
with W&W identity: **R1** grid resolves to one → **R2** video call, close-up, pullback, wider grid →
**R3** layered cards, hand press, panel-to-scene expansion (×4), pale-shape close → **R4** phone cascade,
hold, accelerating stream, bookmark.

Code-driven (Remotion). Source: `remotion/src/ww/`. All timing, copy, colour tokens and asset paths:
`remotion/src/ww/constants.ts`; dialogue cues: `remotion/src/ww/dialogue.json`.

## Status

| Part | State |
|---|---|
| R1 grid (0–3.93 s) | Built. 7×13 fixed matrix of Doubt's own question-mark silhouette; intensity-only changes on the measured R1 density curve (×0.8); survivor turns orange; one pulse peaks on the match-cut. |
| R2 reveal / call / pullback / grid (3.93–13.35 s) | **Performed on a 2D cut-out rig of the approved render** (provisional). Phone buzzes in his hand, startle hop, lifts it; phone-camera view with selfie arm and handheld drift; wave, chest tap, open hand, question-mark scratch, twirl on "Good question."; pullback into a two-armed presentation of the panel grid. |
| R3 layers + Business consulting / Branding / Creative / Marketing / Advertising / Meta setup (13.35–31 s) | Built. Every resting card drifts (R3 never freezes); cards jolt on the press; swatches drop one at a time with a rebound; brief lines write in; story progress, banner slide, "Ad" tag drop; pulse rings, checks and filling rows on the setup phone. Hand presses: **provisional 2D cutout of the approved hand**. |
| R4 collection (31–38.5 s) | Built. Exact 7.5 s structure; stack recedes in depth as each card arrives (R4); float during the hold; anticipation swell; 8-sample sub-frame motion blur, clipped to the screen. Cards are **concept stills from this film**. |
| R2 callback (38.5–40.5 s) | Performed on the 2D rig: shrug, hand up, open hand; same selfie grip and framing. |
| R3 close (40.5–45 s) | Built. Wipe resolves at 41.0 s; hold to 45.0 s. |
| Audio | **Scratch only**: synthesised SFX + robotic espeak-ng dialogue for timing. No music. |
| Clean master (`WW-Master`) | Refuses to render until the 3D rig replaces the 2D stand-in (`RIG_READY` in constants). |

## The 2D rig (`remotion/src/ww/rig/`)

Cut from the approved neutral render by `ww/tools/prep_assets.py` — nothing redrawn: torso (+trousers, feet),
two arms with mittens (cut along the render's own shading crease; the torso gets the render's contour weight on
the newly exposed edge), the question mark, the contact shadow. The rest pose reproduces the render (17 px differ,
all near-black). Arms bend along their length by mesh deformation (shoulder / elbow / wrist angles); the body leans,
hops and squashes about the feet; the question mark tilts, lifts, squashes and twirls. Pose keys: `rig/perf.ts`
+ `components/DoubtSequence.tsx`. Pose library check: composition `WW-RigTest`.

Limits: no turns, no depth (arms cannot reach toward camera — the selfie arm exits frame instead), no finger
articulation. These need the 3D model.

## Model file needed to replace the 2D rig

**`doubt_rig.blend`** (Blender 3.6+ / 4.x, all textures packed — File › External Data › Pack Resources), or an
equivalent **`doubt_rig.glb`** (glTF 2.0 binary, skinned):
- the approved Doubt mesh exactly as in the neutral render (white upper body, black trousers/feet, black
  contour treatment or the shader that produces it, the separate floating question-mark curve + dot);
- an armature: root, hips/torso, L/R shoulder–upper arm–forearm–hand (mitten; no extra fingers), question-mark
  bone (curve + dot follow it);
- actions (or permission to author them): idle, startle hop, phone lift + video-call grip, selfie hold, wave,
  chest tap, open-hand present, head-scratch at the question mark, shrug, two-arm present, button press,
  optional turn;
- units in metres, Z-up, front view on −Y, so renders can match this film's framings.

A PNG, the pose sheet or a turnaround image is not a substitute: none of them carry geometry or weights.

## Blockers and provisional items

- **Orange `#FF6A00` is a provisional token** — no approved orange came with the brand files (the logo is black/white).
- **Hand presses** (`doubt_hand.png`) use the approved render's forearm + hand, rotated. Replace with rig renders.
- **R4 cards** are clean hero stills of this film's own compositions (concept material, not client campaigns).
  Replace with 6–8 cleared W&W work assets in `remotion/src/ww/constants.ts → HEROES` / `public/ww/hero/`.
- **R3 closing wipe shape is unverified**: the supplied R3 re-recording stops before the end card, and the PDF
  shows only the resolved card. Built as a pale circle from frame centre with a soft contact edge.
- **R3 original** (`Screen Recording … 2.02.37 PM.mov`) was not attached; R3 timing comes from the PDF plus a
  5.3 s partial re-recording (4.13.41 PM). R4 timing comes from the PDF plus a 12.1 s re-recording (4.15.09 PM).
  No claim of frame-perfect replication.
- Brand files used are the chat-upload copies (render = webp re-encode). A vector logo is still needed.
- Scratch VO in the callback slots is very fast (0.8 s / 0.95 s); real reads will need those slots checked.

## Run

```bash
# once
python3 -m venv .venv-ww && .venv-ww/bin/pip install numpy pillow scipy
apt-get install espeak-ng                     # scratch dialogue only
cd remotion && npm install
export REMOTION_BROWSER_EXECUTABLE=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell

# brand files → ww/source/ (see ww/source/README.md), then
.venv-ww/bin/python -I ww/tools/prep_assets.py   # cut approved layers (no redrawing)
.venv-ww/bin/python -I ww/tools/make_audio.py    # scratch SFX + timing dialogue
cd remotion
npm run ww:heroes                                # clean hero stills for the R4 cards
npm run ww:render:review                         # → out/ww_start-with-why_review_1080x1920_30p.mp4
node scripts/ww-frames.mjs                       # first/last frame of every section + shot_manifest.json
npx remotion studio src/index.ts                 # live, editable timeline (WW-Review / WW-Opening)
../.venv-ww/bin/python -I ../ww/tools/qc_ww.py out/ww_start-with-why_review_1080x1920_30p.mp4
```

Compositions: `WW-Review` (45 s, burn-ins + scratch captions), `WW-Preview12` (0–12 s opening + call), `WW-Opening` (0–15 s),
`WW-Master` (clean; blocked until the 3D rig), `WW-Hero-*` (1080² stills for R4), `WW-RigTest` (pose library).

## Structure (`remotion/src/ww/`)

| File | Role |
|---|---|
| `WW.tsx` | Layer order / master assembly |
| `components/QuestionGrid.tsx` | R1 |
| `rig/DoubtRig.tsx`, `rig/perf.ts`, `rig/affine.ts` | 2D cut-out rig (canvas mesh deformation), pose keyframes |
| `components/Doubt.tsx` | Earlier unrigged layer stack (kept; no longer used in the film) |
| `components/DoubtSequence.tsx` | Reveal, call, pullback, panel grid, R3 layered cards + hand + expansion; callback |
| `components/CallUI.tsx` | "Incoming question" label, connect spinner, mic / end controls |
| `components/Panels.tsx` | W&W service panels for the R2 wider-grid reveal |
| `components/R3Kit.tsx` | Card rise, word-by-word copy, `ExpandingPanel` (panel-to-scene) |
| `components/Scenes.tsx` | Service scenes A / B / C; C carries the phone into R4 |
| `components/Phone.tsx`, `PhoneCascade.tsx` | Neutral phone, bookmark, R4 |
| `components/Closing.tsx` | Pale-shape wipe, official logo, "Start with why.", "Let's talk." |
| `components/Review.tsx` | Review burn-ins: timecode, BLOCKED / PROVISIONAL flags, scratch captions |
| `Heroes.tsx` | Clean square stills for the R4 cards |
| `audio/` | Scratch SFX + dialogue placement (manifest written by `make_audio.py`) |

QC notes: `ww/docs/qc.md`.
