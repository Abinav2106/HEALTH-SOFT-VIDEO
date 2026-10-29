# GoFloaters — "Find the Spark" (Remotion)

Narrated 30 s reel, 1080×1920, 30 fps, H.264 + AAC, built in Remotion (`remotion/src/gofloaters/`)
from the final production storyboard (seven scenes, eight keyframes). No After Effects project
exists; the Remotion source is the editable composition.

| Key | Time | Narration | Component |
|---|---|---|---|
| A Invitation | 0–3 s | "One hidden Spark. Where would you look?" | `components/S1Invitation.tsx` |
| B Clue | 3–8 s | "Every hunt starts with a clue. Read it closely." | `components/S2Clue.tsx` |
| C Follow the signal | 8–14 s | "Follow the signal. Explore the workspaces. Get closer." | `components/S3Signal.tsx` |
| D Spark found | 14–18 s | "Found it. What could your hunt unlock?" | `components/S4Discovery.tsx` |
| E–F Reward | 18–24 s | "Your hunt could unlock an Amazon gift card. Eligibility and terms apply." | `components/S5Payoff.tsx`, `components/GiftBox.tsx` |
| G Where next | 24–27 s | "Pick a city. Discover your next workspace." | `components/S6Next.tsx` |
| H Mystery invitation | 27–30 s | "Where's your Spark hiding? Enter the hunt." | `components/S7Mystery.tsx` |

The narration was generated first and measured. Every picture beat sits on its spoken phrase
(`VO` and the per-scene constants in `constants.ts`; measured lengths in `data/voice.json`).

Hand-overs: clue card → white page → the "beside the window" highlight as the one rectangular
matte into the map → the selected workspace crop as a window into the room → the Spark Bone into
the success check · the closed box opens in place → the interface panel rises over the reward →
G's photo preview becomes H's mystery card while navy wipes out from it.

C's acceleration has three background-only glitch bursts (4, 5 and 3 frames): the aerial plate is
cut into horizontal slices displaced sideways with a horizontal blur, with deterministic per-frame
offsets. Tilo, the route, the pin and the text sit above it and stay sharp. Everything is clear
before the target settles.

E–F is one box rig (`GiftBox.tsx`): interior, card, body walls, ribbon and lid with bow are
separate vector layers sharing one geometry, so the closed and open states are the same box. The lid
moves rigidly and the supplied Amazon card artwork slides up inside, hidden by the front walls until
it clears the rim.

## Tilo's propeller

`extract_storyboard.py` splits the supplied artwork into an aircraft/dog layer (`tilo_body.png`, with
the propeller removed, so there is no stationary copy) and a propeller layer (`tilo_prop.png`). The
two recompose to the original alpha exactly, and the propeller layer overlaps the nose by a few px so
no seam shows. `components/Tilo.tsx` keeps both in one group and animates only the blades inside the
narrow elliptical disc. Each blade is drawn as its side-view projection (length r·cos φ), with five
translucent sub-samples across a half-frame shutter for restrained motion blur. The spin rate is
integrated from the frame number (`lib/propeller.ts`), so seeking and rendering always agree. Tilo
flies at 6.3 rev/s, winds down to a slow idle sweep when settling, and never freezes.

## Rebuild from scratch

```bash
pip install opencv-contrib-python-headless numpy pillow shapely kokoro-onnx soundfile pyloudnorm sherpa-onnx
# 1. Working layers from the flattened storyboard (gitignored output)
python3 -I gofloaters/tools/extract_storyboard.py path/to/final_storyboard.webp path/to/production_storyboard.webp
# 2. Narration — Kokoro-82M (Apache-2.0), files from the kokoro-onnx GitHub release "model-files-v1.0"
python3 -I gofloaters/tools/make_voice.py path/to/dir/with/kokoro-v1.0.onnx+voices-v1.0.bin
# 3. Sound effects
python3 -I gofloaters/tools/make_sfx.py
# 4. (optional) verify the narration with Whisper base.en (sherpa-onnx release "asr-models")
python3 -I gofloaters/tools/check_speech.py path/to/sherpa-onnx-whisper-base.en remotion/public/gofloaters/voice/s*.wav
```

```bash
cd remotion && npm install
export REMOTION_BROWSER_EXECUTABLE=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
npm run render:gf:master -- --browser-executable=$REMOTION_BROWSER_EXECUTABLE
npm run render:gf:stems
npm run stills:gf
```

Compositions: `GF-FindTheSpark` (the film), plus `GF-Stem-Narration` and `GF-Stem-SFX` (the same
timeline with one audio group muted, rendered to WAV by `scripts/gf-stems.mjs`).

Asset status and every stand-in: [`docs/01_asset_audit.md`](docs/01_asset_audit.md).
