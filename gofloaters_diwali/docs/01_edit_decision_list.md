# Diwali Spark Hunt — edit decision list

40.0 s · 1080×1920 · 30 fps · 1,200 frames. The source of truth is `motion/scenes.js`; the times below are taken from it.

## Picture

| # | Time | Scene | What happens | Copy (live text) | Hand-off to next |
|---|---|---|---|---|---|
| 01 | 0.00–2.00 | Funny hook | Tilo enters far too close (eye-anchored extreme close-up, small overshoot). Curious head tilt (0.55 s), one blink (0.96 s), then a lunge: his **nose taps the lens** at 1.32 s. A white ripple runs on the "glass" and the whole frame takes one damped bump. No paw pose is used, because the logo has none. No GoFloaters logo. | YOU / COMING? (0.50 s) | The bump settles into the pull-back. |
| 02 | 2.00–5.00 | Takeoff | Propeller spins up from 1.95 s. The camera pulls back from the eye to the full aircraft (log-scale zoom, ease in-out quint). Clouds open out in parallax depth, travel speed ramps up, and the logo's own speed dashes appear. From 4.35 s Tilo banks up and out. | TOO LATE! (2.30 s, pop) | The camera tilts down: clouds rush up past the lens, and a veil at 4.9 s covers the cross-over. |
| 03 | 5.00–9.00 | All-India hunt | A national map arrives from altitude, then a slow push. 17 unlabelled location points pulse in sequence. Five green routes draw one after another. Tilo crosses India diagonally (6.3–8.9 s). No city names. | THE SPARK / COULD BE / ANYWHERE. (5.55 s) | The camera dives exponentially into the western route (8.45 s). The route becomes the travel line. |
| 04 | 9.00–14.00 | Tilo checks everywhere | Three urban environments: business district (day), dense street with an elevated metro and rooftop tanks (golden hour), and a workspace interior over a dusk skyline. Each change is a **diagonal wipe led by the green route**. Tilo always flies left→right. | TILO'S CHECKING / EVERYWHERE. (9.35 s) | From 13.05 s the route swings round as a road toward camera. Tilo flies off along it, and the camera rushes along it until the frame is solid green (14.0 s). |
| 05 | 14.00–18.00 | Enter the real game | The full-frame green collapses (stroke width 4200 → 14 px) onto the route over the **real game recording**, then fades so the in-game route carries on (15.15–15.8 s). The game settles from 1.07× to 1×. | YOUR TURN. (14.75 s, pop) | Native game interaction continues. |
| 06 | 18.00–23.00 | Explore real spaces | Real gameplay. The real workspace card opens out of its on-screen rectangle into a near-full-frame **genuine workspace photo** (20.2–20.75 s) and holds about 1.5 s with a 7% push. It closes back into the card at 22.2–22.75 s. | EXPLORE. / FOLLOW. / DISCOVER. (18.2 s, 0.5 s stagger) | The card closes back into the game while fog starts at the edges. |
| 07 | 23.00–28.00 | Fog | Fog is a separate layer (two drifting noise layers with an edge-in mask), and the game stays readable in the centre. The green route resurfaces and is part-hidden. Tilo slows (ease-out to 25.4 s) and searches. A small gold Spark appears ahead at 24.8 s with a pocket of clear air round it. Tilo notices it at 25.55 s (spring tilt). | WAIT... (23.45 s) · WHAT'S / THAT? (25.7 s) | Tilo launches along the visible route. |
| 08 | 28.00–32.00 | Chase the Spark | Tilo accelerates (ease-in) along the route, the camera follows (up to 1.18×, clamped to the footage edge) and the Spark brightens. **Contact at 30.0 s, then a 0.2 s freeze** (picture and sound). One gold pulse ring follows, the fog clears radially, and gentle Diwali warmth and soft gold bokeh come in. | GET IT! (28.2 s) · FOUND IT. (30.32 s) · LIGHT UP DIWALI. (30.7 s, gold) | The Spark collapses into the centre of the frame (31.85–32.25 s). |
| 09 | 32.00–35.00 | Scratch reward | A GoFloaters-branded card (untouched logo, white card) pops out of the Spark. Gold foil gets a sheen pass, then **one continuous finger swipe** (touch indicator, no drawn hand) scratches through it. The rest of the foil clears, with a gold completion ring. Reveals the voucher **range only**: no won amount. | YOU FOUND THE SPARK! · SCRATCH TO REVEAL · AMAZON VOUCHER · ₹500 – ₹5,000 | The card lifts and fades (34.7–35.2 s) as the dusk end card comes up. |
| 10 | 35.00–40.00 | Final CTA | A dusk city with restrained Diwali light: three light strings, six diyas and one small distant burst. Tilo flies in from bottom-left and lands **exactly** on the mascot position of the real logo, which then takes over (37.15 s). The wordmark wipes on. Copy and CTA settle by 38.15 s. **Everything is static from 38.2 s to 40.0 s (1.8 s hold).** | FIND THE SPARK. / LIGHT UP DIWALI. (gold) · 3 GAME DAYS · ALL INDIA · [PLAY NOW →] (green) | — |

## Safe zones

All copy sits inside x 84–996 and y 220–1240. The CTA is at y 1100–1232, well above the Reels caption and CTA strip at the bottom (about the last 420 px). Nothing important sits in the right-hand control column (x > 960, y 1100–1700).

## Colour use

- Route and navigation: `#18B36A` only: solid, round caps, a minimal 14 px glow.
- Gold `#F4B740` / `#FFE3A1`: used only for the Spark, the pulse, the reward foil, "LIGHT UP DIWALI." and the end-card Diwali lights.

## Sound (temporary, original synthesis — `tools/make_audio.py`)

| Time | Cue |
|---|---|
| 0.00–1.42 | Soft propeller idle |
| 1.32 | Camera tap: click, thump and glass ping |
| 1.42–1.60 | **Micro-silence** (digital zero) |
| 1.62–5.00 | Propeller spin-up, then banks away (pans right) |
| 2.00 | Music enters: 120 BPM, D major, kick/clap/tabla/plucked string |
| 2.05, 4.45 | Whooshes: pull-back, clouds |
| 5.25–6.20 | Location points light up as a pentatonic bell run |
| 5.00–14.00 | Full travel groove; whooshes on the dive and the route wipes; long riser into the game |
| 14.00–23.00 | Lighter groove; UI pop, taps, card open/close |
| 23.00–28.00 | Music ducked and low-passed; drone, heartbeat pulse, wind; Spark chimes at 24.8 / 26.4 |
| 28.00–30.00 | Engine wind-up, snare roll, riser, reverse swell |
| 30.00–30.20 | **Silence** (digital zero) |
| 30.20 | Spark discovery chime (four-bell chord), warm sub, Diwali pad swell |
| 32.22–34.17 | Card pop, foil sheen, six scratch strokes, two-note completion |
| 35.00–36.60 | Propeller fly-by (doppler and pan) |
| 36.90 | Logo chime |
| 38.00–40.00 | Final resolving chord; fades out over the last 0.8 s |

Mix: −14 LUFS integrated, −1 dBTP. Stems are in `out/audio/stems/`.
