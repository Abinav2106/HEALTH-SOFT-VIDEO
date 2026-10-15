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
| R2 reveal / call / pullback / grid (3.93–13.35 s) | **Stand-in.** Uses the approved neutral render split into its own layers (body, question mark, contact shadow). Question-mark tilt/lift, ±1.6° lean and framing only. **Phone pickup (4.8–5.5 s) is BLOCKED.** |
| R3 layers + Business consulting / Branding / Creative / Marketing / Advertising / Meta setup (13.35–31 s) | Built. Hand interactions use a **provisional 2D cutout of the approved hand**. |
| R4 collection (31–38.5 s) | Built. Exact 7.5 s local structure; 8-sample sub-frame motion blur, clipped to the screen. Cards are **concept stills from this film**. |
| R2 callback (38.5–40.5 s) | **Stand-in** (same limits as R2). |
| R3 close (40.5–45 s) | Built. Wipe resolves at 41.0 s; hold to 45.0 s. |
| Audio | **Scratch only**: synthesised SFX + robotic espeak-ng dialogue for timing. No music. |
| Clean master (`WW-Master`) | Refuses to render until a rigged Doubt replaces the stand-ins (`RIG_READY` in constants). |

## Blockers and provisional items

- **Missing: editable rigged Doubt** (.blend with packed dependencies, or rigged .glb) with actions for: phone
  pickup and video-call grip, open-hand gesture, presentation lean, optional turn, button press (reach + tap).
  Without it the pickup is blocked and every character beat is a stand-in. No Blender / After Effects host
  was connected in this session, and no mesh was supplied, so no rig work was attempted.
- **Orange `#FF6A00` is a provisional token** — no approved orange came with the brand files (the logo is black/white).
- **Hand cutout** (`doubt_hand.png`) is the approved render's forearm + hand, rotated. Replace with rig renders.
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

Compositions: `WW-Review` (45 s, burn-ins + scratch captions), `WW-Opening` (0–15 s test),
`WW-Master` (clean; blocked until rig), `WW-Hero-*` (1080² stills for R4).

## Structure (`remotion/src/ww/`)

| File | Role |
|---|---|
| `WW.tsx` | Layer order / master assembly |
| `components/QuestionGrid.tsx` | R1 |
| `components/Doubt.tsx` | Approved render as layers; camera anchored on the question-mark centre |
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
