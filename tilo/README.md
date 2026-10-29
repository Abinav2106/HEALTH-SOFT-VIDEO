# Tilo — "A little exploration. A golden reward."

GoFloaters mascot animation, built in Remotion as frame-driven SVG.

**Format:** 1080 × 1350 (4:5), 30 fps, 150 frames (exactly 5 s). White background.
**Colours:** cyan `#65CADA`, gold `#FAD572`, navy outlines `#1E2A44`.
**Card type:** DM Sans, loaded from a local file.

| Where | What |
|---|---|
| `remotion/src/tilo/TiloReward.tsx` | Composition `Tilo-Reward`, which sets the layer order |
| `remotion/src/tilo/choreography.ts` | Every pose and position as a pure function of the frame (plane spline, IK, bone hand-off, card) |
| `remotion/src/tilo/constants.ts` | Timeline (`T`), palette, room layout, projection, card copy |
| `remotion/src/tilo/components/Tilo.tsx` | Tilo rig (separate groups for head, eye, goggles, ears, torso, arms and paws, legs, tail) |
| `remotion/src/tilo/components/Plane.tsx` | Plane: body, wings, fin, wheels, cockpit lip and propeller (pivots on the hub). It has back and front layers so Tilo sits inside the cockpit. |
| `remotion/src/tilo/components/Workspace.tsx` | Floor, glass doorway (far side and leaf behind the plane, near jamb in front), plant, chair, desk, laptop |
| `remotion/src/tilo/components/Props.tsx` | Bone, sparkle, glint, shadow, motion strokes, reward card |
| `tilo/assets/*.svg` | Standalone editable SVG layers, exported from the same components |
| `tilo/tools/make_sfx.py` | Generates the four quiet SFX: whoosh, landing tap, pickup chime, reward confirm |

## Timeline

| Beat | Time | Frames |
|---|---|---|
| 01 Arrive | 0.00–0.65 s | 0–20 |
| 02 Reveal | 0.65–1.40 s | 20–42 |
| 03 Touch down | 1.40–2.35 s | 42–70 |
| 04 Discover and collect | 2.35–3.65 s | 70–110 |
| 05 Reward | 3.65–5.00 s | 110–150 |

What happens in each beat:
- **Arrive:** the plane flies in from fully off-screen left and slows. A gold glint appears ahead.
- **Reveal:** the floor appears, then the doorway rises, then the furniture settles in a stagger. The glass door opens and the bone gets one glint.
- **Touch down:** the plane passes the doorway behind the near jamb and in front of the open leaf, then lands: contact, gear compression, one small bounce. It parks at f69 and the propeller winds down over about 26 frames.
- **Discover and collect:** Tilo braces a paw on the rim, pushes up, hops down and takes one step. Then eyes → head → lean → reach, an anticipation pause, and pickup at f108.
- **Reward:** the bone comes to the chest and three sparkles appear in a stagger. The card rises 20 px and scales 88% → 103% → 100%, then the check draws on. All motion settles by f126 (4.20 s), and the last 0.8 s holds with breathing and one tail wag.

## Commands (run in `remotion/`)

```bash
npm install
```

```bash
export REMOTION_BROWSER_EXECUTABLE=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell   # cloud container only
```

```bash
npm run studio          # open Remotion Studio, then pick "Tilo-Reward"
```

```bash
npm run render:tilo     # → out/tilo/tilo_reward_1080x1350_30p.mp4 (H.264, CRF 16, with SFX)
```

```bash
npm run render:tilo:silent
```

```bash
npm run tilo:check      # contact & continuity checks (paw↔bone, hand-off, feet on floor, doorway clearance)
```

```bash
npm run tilo:svg        # re-export tilo/assets/*.svg
```

```bash
node scripts/tilo-stills.mjs out/tilo/stills 64 81 108 126 149   # review stills
```

To export other formats:

```bash
npx remotion render src/index.ts Tilo-Reward out/tilo/tilo.mov --codec=prores --prores-profile=4444
```

```bash
npx remotion render src/index.ts Tilo-Reward out/tilo/tilo.gif --codec=gif --every-nth-frame=2
```

To regenerate the SFX (needs numpy only), run this from the repo root:

```bash
python3 -I tilo/tools/make_sfx.py
```

## Editing notes

- **Retiming:** change `T` in `constants.ts`. Beats are derived from it.
- **Flight path:** edit `PATH_F/PATH_X/PATH_Y` in `choreography.ts`. It is a monotone cubic spline, so it never overshoots. Run `npm run tilo:check` afterwards; it fails if the plane would clip the door header.
- **Furniture:** positions live in `ROOM` (world units). The scene uses one fixed oblique projection (`PROJ`), so perspective stays consistent.
- **Card copy:** `CARD.text`.
