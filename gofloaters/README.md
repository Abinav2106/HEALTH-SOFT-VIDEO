# GoFloaters: "the logo is the playground" (10 s, 9:16)

A 1080x1920, 30 fps logo animation built in Remotion. The source is `remotion/src/gofloaters/` and the composition id is `GF-LogoPlayground`.

## Inputs

- **Logo**: the supplied `GoFloaters_Logo_Vector.svg`. Copy it, byte-identical, to `remotion/public/brand/gofloaters_logo_original.svg`. It is not committed, because this is a public repository (the same rule as the other brand files). The SVG's own metadata says it is a raster-derived reconstruction, not the original brand master.
- **References studied**: Oreo (sweeping swooshes and wipes), Blinkit (comic pauses, eyes, letter assembly), Coca-Cola (one shape flowing into the next) and Tutto Ciak (rhythmic, rotating letters landing on a beat).
- **Game video: not received.** Only the four reference videos were uploaded. The game's actual interactions were never visible, so the only game beats are the ones written in the brief: the rings search, the Spark Bone dodges the cursor once, and the cursor catches it. Nothing else from the game is shown.

## Beat sheet

| Time | Frames | What happens |
|---|---|---|
| 0–3 s | 0–90 | Two aqua rings, sampled from the wordmark's two "o" glyphs, pop in as eyes and look around. The golden Spark Bone appears. The cursor sweeps in, and the bone hops away just before it arrives. **The joke:** the cursor freezes, the eyes look at it, then at us, and blink. The cursor zips over and catches the bone with a snap. The bone parks top-right. |
| 3–5.4 s | 90–162 | The discovery ring flows into a location pin (its hole becomes the pin's window) and drops with a squash. A desk appears in the window. Two other pins pop up as options. The cursor hovers one, then chooses the desk pin. The second ring flows into a round button with a calendar. A **separate booking click** turns the calendar into a check. The bone stays off to the side the whole time, so the booking is clearly its own action. |
| 5.4–8 s | 162–240 | Tilo's original airplane (the SVG's own mascot group) sweeps up through the frame. An aqua ribbon rides behind it and floods the screen, and Tilo snaps up the bone on the way past. A white slipstream line swells into a white wipe. The rings turn white, then ink, spin, and land as the two "o"s. The other letters, which are the SVG's own paths, fly in one every 3 frames, each with a staggered rotation and one small overshoot. The camera pulls back from the wordmark, Tilo lands with one small overshoot, the speed lines draw on, and the tagline words rise in rhythm. |
| 8–10 s | 240–300 | From frame 248 on, the picture is only the supplied SVG at one uniform scale: 960x272 at (60, 824). |

Final-frame check: frame 270, compared against Chromium's own render of the untouched SVG at the same size and position, differs in 3 of 2,073,600 pixels (edge anti-aliasing).

Palette: white, the SVG's cyan `#6FC7D8` and ink `#111110`, and its yellow `#FBD76A` for the bone only. There is no text apart from the SVG's own wordmark and tagline.

## Sound

Original synthesised SFX only, with no music and no narration. `gofloaters/tools/make_sfx.py` (numpy only) writes the WAVs to `remotion/public/audio/gofloaters/`, and `remotion/src/gofloaters/cues.json` places each one on a frame. Integrated loudness is about −27 LUFS, which is deliberately subtle.

## Editing

- All timings, positions, scales and colours are in `constants.ts`. The beats are named (`T.dodge`, `T.catch`, `T.book`, …).
- `GoFloatersLogo.tsx` holds the actors: the rings, bone, cursor, pin, button, wipes, camera and letters.
- `shapes.ts` holds the keyframe helpers, the pin outline and the small drawings (bone, cursor, desk, check).
- `logo.ts` loads and parses the SVG at render time and samples the two "o"s into matching contours for the morphs.

## Render

```bash
cd remotion
npm ci
python3 -I ../gofloaters/tools/make_sfx.py      # only after changing the SFX
export REMOTION_BROWSER_EXECUTABLE=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
npx remotion render src/index.ts GF-LogoPlayground out/gofloaters_logo_playground_1080x1920_30p.mp4 --browser-executable=$REMOTION_BROWSER_EXECUTABLE
node scripts/gf-stills.mjs out/stills 66 135 270    # review stills
npx remotion studio src/index.ts                    # scrub and edit live
```

Outside this container, leave out the browser flag.
