# GoFloaters — "The Flight Path Finds Your Space" (10 s, 9:16 logo animation)

Tilo's flight line becomes aqua architectural linework, draws a floor plan (desk, private cabin, meeting room), a warm-yellow light selects the meeting room, the room opens out into the white brand stage and Tilo glides into his logo position. The original logo file is held perfectly still for the final 2 s.

Composition: `GF-FlightPath` in `../remotion/src/gofloaters/` (1080x1920, 30 fps, 300 frames). All timing, colour and layout values are in `constants.ts`.

## Timeline

| Time | Frames | Beat |
|---|---|---|
| 0.2–1.5 s | 6–45 | Warm-white field, subtle paper grain. One aqua line draws in from the left. |
| 1.5–3.0 s | 45–90 | Tilo flies in along it with his original black speed lines, which then dissolve into the aqua route. |
| 2.7–5.0 s | 80–150 | One camera pull-back while the route draws the outer walls; partitions branch off as the pen passes, then doors, furniture and labels. |
| 5.0–6.2 s | 150–186 | A single yellow light leaves the propeller, travels the route and enters the meeting room. Warm fill + one soft pulse (the Diwali note). The other rooms recede. |
| 6.5–7.6 s | 196–228 | The room opens out to the full frame as the stage; Tilo glides into the lock-up position; speed lines return; propeller settles. |
| 7.3–7.9 s | 218–238 | Wordmark, then tagline, resolve with a soft wipe. |
| 8.0–10 s | 240–299 | The supplied logo file itself, untouched and static. |

## Mascot and logo fidelity

- Nothing is redrawn or regenerated. `tools/extract_layers.py` splits the supplied 2000x667 raster into registered layers (symbol, speed lines, wordmark, tagline, propeller mask) by removing only the flat `#FEFEFE` background. The layers re-composite to the source within 0.17/255 mean.
- Tilo is a rigid layer: position and uniform scale only. No rotation, deformation or recolouring. The "propeller rotation" is a blade glint masked to the disc's own pixels, faded out before the lock.
- From 8.0 s on, the original file replaces the layers (the swap measures 0.03/255 mean difference) on a stage the same colour as the logo's own background.
- Yellow is used only for the selection light, the selected room's tint (Yellow Tint) and the existing propeller.

## Build

```bash
# Client files are not committed (public repo). Place the supplied logo byte-identical:
#   remotion/public/brand/gofloaters/gofloaters_logo_original.webp   (2000x667, sha256 e3e0866129f6b1a5…)
python3 -I gofloaters/tools/extract_layers.py remotion/public/brand/gofloaters/gofloaters_logo_original.webp remotion/public/brand/gofloaters/layers
cd remotion && npm run render:gf:flightpath -- --browser-executable=$REMOTION_BROWSER_EXECUTABLE
```

The extractor needs numpy, Pillow and scipy.

## Open points

- The brief has two versions of the ending: the table resolves the wordmark across 8–10 s, but the final prompt asks for a static hold over the last 2 s. This build follows the prompt: the type resolves by 7.9 s and 8–10 s is static.
- Room labels are set in Inter (the book's text/UI face, bundled locally). JetBrains Mono, the book's label face, isn't in the repo.
- No audio was briefed.
