# GoFloaters — Diwali Spark Hunt (40 s, 9:16)

A Claude-built motion composition. Tilo grabs the camera, hunts across India, and hands over to the real GoFloaters game. There he finds the Spark in the fog, which lights up Diwali and opens a scratch-card reward. The film ends on **FIND THE SPARK. LIGHT UP DIWALI. → PLAY NOW**.

Everything is authored here in code (Canvas 2D). It renders frame-exactly in the container's own headless Chromium and is encoded with ffmpeg. No third-party editing or AI-generation tools are used, and no credits are spent.

## Status

| Item | State |
|---|---|
| Full 40 s timeline, 10 scenes, transitions, copy | Done (`motion/scenes.js`, EDL in `docs/01_edit_decision_list.md`) |
| Tilo rig from the official logo | Done (`tools/extract_tilo.py`, `motion/lib/tilo.js`) |
| Temp score + SFX, −14 LUFS | Done (`tools/make_audio.py`) |
| Preview masters | Rendered: `out/…_9x16_PREVIEW.mp4`, `out/…_Muted_PREVIEW.mp4` |
| Real gameplay recording, workspace photo | **Missing**: the slots are labelled in the preview (`assets/README.md`) |
| Final masters | Written automatically once both slots are filled |

## Run

```bash
pip install numpy scipy fonttools brotli          # audio + player build
python3 tools/extract_tilo.py                      # once, from assets/brand/gofloaters_logo_original.webp
python3 tools/make_audio.py                        # temp mix -> out/audio/
node tools/render.mjs --preview                    # labelled preview masters
node tools/render.mjs                              # final masters (refuses while slots are empty)
node tools/render.mjs --stills 1.3,30.2            # QC stills -> out/stills/
python3 tools/build_player.py                      # standalone scrub/play page -> out/player/
```

The renderer serves the project locally, so to scrub in a browser, open `motion/index.html` through any static server. Brand files, footage and renders are git-ignored because this repository is public.

## Dropping in the real footage

1. Put the recording at `assets/gameplay/gameplay.mp4` and the photo at `assets/workspaces/workspace_01.jpg`.
2. In `motion/config.js`, set the recording in-points (`gameplay.segments`), trace `gameRoute` over the in-game route, and set `workspaceCard` to where the card sits. Set `overlayTilo: false` if the recording already shows Tilo flying the route.
3. Run `node tools/render.mjs`. It writes `GoFloaters_Diwali_Spark_Hunt_40s_9x16.mp4` and `GoFloaters_Diwali_Spark_Hunt_40s_Muted.mp4`.
