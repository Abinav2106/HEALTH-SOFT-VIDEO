# GoFloaters — Diwali Spark Hunt, 40 s hero Reel storyboard (9:16)

Deterministic renderer for the ten storyboard frames and the storyboard PDF.
Tilo, routes, the Spark, map, UI and type are built in code, so every frame shares one design system.
Higgsfield is used for background plates (no characters, no text) and for animating Shots 01, 02 and 04.

## Shots

| Shot | Time | Method |
|---|---|---|
| 01 Tilo sees the Spark | 0–3 s | HIGGSFIELD |
| 02 The world opens | 3–6 s | HIGGSFIELD |
| 03 India route reveal | 6–10 s | CLAUDE / MOTION GRAPHICS |
| 04 Dive into Chennai | 10–13 s | HIGGSFIELD |
| 05 Enter the real game | 13–18 s | ORIGINAL GAME + VFX |
| 06 Choose a real space | 18–22 s | ORIGINAL GAME |
| 07 The fog | 22–27 s | ORIGINAL GAME + VFX |
| 08 Find the Spark | 27–31 s | ORIGINAL GAME + VFX |
| 09 Scratch to reveal | 31–36 s | CLAUDE / MOTION GRAPHICS |
| 10 Final CTA | 36–40 s | CLAUDE / MOTION GRAPHICS |

Full shot fields (camera, Tilo position, foreground, background, motion, transition, copy, sound, method) live in `tools/storyboard.cjs`.

## Inputs (git-ignored — client brand files stay out of this public repo)

| Path | What |
|---|---|
| `assets/gofloaters_logo.png` | Supplied logo, unaltered |
| `assets/tilo_aircraft*.svg` | Vector trace of the logo's Tilo + aircraft: `python3 tools/vectorize_tilo.py <logo> assets` |
| `plates/p01.png p02.png p04.png p10.png` | Higgsfield background plates: `tools/fetch_plates.sh` |
| `game/05_map.png`, `game/06_space.png` | Real GoFloaters captures (Tilo Tour map, workspace detail). Missing → labelled slot |

## Build

```
npm install
npm run frames   # out/frames/shotNN.png (+ clean Higgsfield source frames for 01, 02, 04)
npm run board    # out/GoFloaters_SparkHunt_HeroReel_Storyboard.pdf
```

Needs Playwright with Chromium and the Inter font at `../remotion/public/fonts/`.
Frames without their plate show a "PREVIEW BACKGROUND" tag.
