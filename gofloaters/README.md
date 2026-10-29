# GoFloaters — "Find the Spark" (Remotion)

30 s, 1080×1920, 30 fps, H.264 reel built from the final six-keyframe storyboard. Engine: Remotion
(`remotion/src/gofloaters/`). No After Effects project exists; the Remotion source is the editable composition.

Story: invitation → clue → map exploration → Spark discovery → reward → invitation to play.

| Scene | Time | Component |
|---|---|---|
| Invitation | 0–3 s | `components/S1Invitation.tsx` |
| Decode the clue | 3–8 s | `components/S2Clue.tsx` |
| Follow the signal | 8–16 s | `components/S3Signal.tsx` |
| Discovery | 16–21 s | `components/S4Discovery.tsx` |
| Payoff | 21–26 s | `components/S5Payoff.tsx` |
| Where is your Spark? | 26–30 s | `components/S6Ending.tsx` |

Copy, palette, scene windows and city coordinates: `remotion/src/gofloaters/constants.ts`.
Asset status and every stand-in: [`docs/01_asset_audit.md`](docs/01_asset_audit.md).

## Rebuild from scratch

```bash
pip install opencv-contrib-python-headless numpy pillow shapely
# 1. Cut the working layers out of the flattened storyboard (writes remotion/public/gofloaters/storyboard/, gitignored)
python3 -I gofloaters/tools/extract_storyboard.py path/to/final_storyboard.webp
# 2. Original sound treatment (writes remotion/public/gofloaters/audio/, gitignored)
python3 -I gofloaters/tools/make_sfx.py
# 3. (Only if the boundary changes) India boundary from Natural Earth, India point of view
python3 -I gofloaters/tools/build_india_geo.py ne_10m_admin_0_countries_ind.geojson
```

```bash
cd remotion && npm install
export REMOTION_BROWSER_EXECUTABLE=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
npm run render:gf:master -- --browser-executable=$REMOTION_BROWSER_EXECUTABLE
npm run render:gf:preview -- --browser-executable=$REMOTION_BROWSER_EXECUTABLE
npm run stills:gf
```

Compositions: `GF-FindTheSpark` (master, clean) and `GF-FindTheSpark-Preview` (same film, with small
tags marking the illustrative clue and the storyboard stand-in plates).

## Swapping in approved assets

Drop the originals into `remotion/public/gofloaters/storyboard/` under the same names (or change
`ASSETS` in `constants.ts`). Tilo is 900×480 with its anchor on the fuselage (`components/Tilo.tsx`);
a higher-resolution original at the same aspect drops straight in. The room's Tilo/bone positions and
the gift's baked Tilo are in plate pixels (`S4Discovery.tsx`, `extract_storyboard.py`). With separate
gift-box lid and card layers, the matte reveal in `S5Payoff.tsx` can become a real lid lift.
