# GoFloaters: "There's a workspace hiding in our name" (10 s, 9:16)

A typography-led 1080x1920, 30 fps logo film built in Remotion. The hero is the lowercase "o" in "Floaters". The source is `remotion/src/gofloaters/film/` and the composition id is `GF-HidingInOurName`.

## Inputs

- **Logo:** the supplied SVG at `remotion/public/brand/gofloaters_logo_original.svg`. It is loaded and parsed at render time; every letter, the tagline and the final mascot are the SVG's own paths, never redrawn. Like the other brand files, it is not committed.
- **Tilo:** the After Effects rig from `gofloaters/rig`, used as an asset. `gofloaters/rig/tools/export_film_rig.mjs` writes its layers, geometry and the rig's own expression strings to `remotion/public/brand/tilo_rig.json` (gitignored: it contains the mascot artwork). `film/rig.ts` evaluates those same expressions in the browser, so the film is driven by the same `CTRL_Tilo` controls the AE rig has: blink, pupils, lids, ear lift and flutter, balance, bank, flight speed, propeller and tail.
- **Font for the two new words** ("6 seats", "Book a space"): Ubuntu Medium, which matches the wordmark and tagline. The licence is in `remotion/public/fonts/Ubuntu-UFL.txt`.
- **Reference principles:**
  - Blinkit: still holds of about 0.3 s that let a joke land, a 6-frame blink, a letter that lands wrong and is corrected a beat later, and a late arrival as the payoff.
  - Coca-Cola: one continuous shape that turns into the next thing and then draws the logo in.

## Beat sheet

| Time | Frames | What happens |
|---|---|---|
| 0–3 s | 0–90 | **The chase.** The giant "o" (16x the lockup scale) rolls across cream, framed by giant crops of the original F, r, t, G and s. Tilo flies after it with his pupils locked on it. The "o" **stops dead** at frame 52 and rocks. Tilo overshoots, air-brakes (bank, lean, propeller and airflow drop), and his pupils snap back to the letter. His **ears catch up 4 frames later**. Then comes a silent **readable pause** (frames 70–86): a deadpan droop of the lids and a slow blink. |
| 3–6.5 s | 90–195 | **The room.** The small clue "6 seats" types in. Tilo zips off, comes back and **taps the "o"** with his nose. It squashes, pivots edge-on, then swings open while its own contours morph into an arched doorway. Inside are a cyan table and **six top-view chairs that pop in one every 2 frames** (six rising ticks, easy to count). Only when this matching room is open does the **Spark Bone** pop onto the table, and the clue's underline pulses. Then a **separate "Book a space" pill** appears below the doorway. It is an option for the viewer, not a reward: no price, no "free", and nothing connects it to the bone. |
| 6.5–8 s | 195–247 | **The fold and the sweep.** The room folds back into the original "o" in one continuous morph. Tilo winds up and dives. His accelerating airflow **becomes one cyan sweep** that carries the giant crops down into their exact lockup positions; the letters the crops never showed pop out of the ribbon in place. The giant "o" is carried off-frame, and the tagline rises in word by word. Then the **small "o" rolls in late**: it bumps over the tops of "s r e t a" (they dip under it) and drops into its slot crooked. Tilo re-enters at lockup scale, **bonks nose-first into the G**, the bump ripples G-o-F-l, and the "o" **clicks into alignment**. Tilo recoils into his exact spot and his ears catch up. |
| 8–10 s | 247–300 | **The hold.** The complete original logo and "Spaces that work for you". Restrained life: one blink, ear flutter that settles, the airflow breathing around its logo length, and a gentle propeller spin. |

The final frames are exact:

- **The propeller.** Its hold speed is solved so the spin ends on the drawn blade.
- **Every control at rest.** From frame 296 every rig control is back at its default, where the rig matches the logo artwork to anti-aliasing.
- **The supplied SVG.** Frames 297–299 show the supplied SVG mascot itself.

Frame 299 is identical to the untouched SVG rendered at the same size and position (0 pixels differ by more than 40 levels, measured against the logo-playground film's final frame). The only difference is that the background is cream.

Palette: cream `#F6F1E4` background, and the SVG's ink `#111110`, cyan `#6FC7D8` and yellow `#FBD76A` (the bone only), plus white inside the doorway.

## Sound

Original synthesised SFX only, with no music and no narration.

- `gofloaters/tools/make_sfx.py` (numpy only) writes the WAVs to `remotion/public/audio/gofloaters/`. The film adds these sounds: roll, thock, squeak, flop, tink, whoosh, whump, seat1–6, bump, clunk and bonk.
- `remotion/src/gofloaters/film/cues.json` places each sound on a frame.
- Frames 70–86 are silent, so the joke can land.

## Editing

- **`film/timeline.ts`:** every story beat (`B.rollStop`, `B.boop`, `B.bone`, `B.book`, `B.bonk`, `B.click`, …), the colours, the lockup transform and the doorway size.
- **`film/HidingFilm.tsx`:** the actors.
  - The hero "o": rolling, the pivot, the ring-to-door morph, the room contents and the fold.
  - Tilo's screen path (`tiloRoot`) and gaze targets (`lookTarget`, which drives Pupil X/Y).
  - Tilo's rig control keys (`CONTROLS`), keyed in seconds as in After Effects.
  - The fragment layout (`FRAGMENTS`), the sweep, the letter assembly, and the late "o".
- **`film/rig.ts`:** the rig runtime (expression evaluator and matrices). `film/Tilo.tsx` draws it, with the eye mask, the directional blur on the blade and sub-frame propeller motion blur.

## Render

```bash
cd remotion
npm ci
node ../gofloaters/rig/tools/export_film_rig.mjs     # after any rig change
python3 -I ../gofloaters/tools/make_sfx.py            # after changing the SFX
export REMOTION_BROWSER_EXECUTABLE=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
npx remotion render GF-HidingInOurName out/GoFloaters_HidingInOurName_1080x1920_30p.mp4 --browser-executable=$REMOTION_BROWSER_EXECUTABLE
COMP=GF-HidingInOurName node scripts/gf-stills.mjs out/stills 60 135 270   # the three style frames
npx remotion studio src/index.ts                                         # scrub and edit live
```

Outside this container, leave out the browser flag.
