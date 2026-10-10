# Video 06 — Real-stock insertion: status, pipeline and procedure

Date: 2026-10-10.

## Status: blocked. No real footage has been inserted.

No stock clip can be downloaded into this session:
- The organisation egress gateway answers `403` (`connect_rejected`, policy denial) for every stock and media host tried. That includes Pexels (site, API, video CDN), Pixabay, Artlist, Adobe Stock, Shutterstock, Getty, Storyblocks, Mixkit, Coverr, Videvo, archive.org and Wikimedia.
- No stock API key is configured.
- No footage has been uploaded to the repository or the session.

The film therefore still has no live action, and **no master MP4 exists**. The master composition refuses to render until every shot has a licensed clip (proof below).

## Casting search this round

I made one more search for a **single production** covering every shot with the same older mother and adult daughter, on Pexels (free licence, so no purchase approval needed). Any ethnicity was accepted. It found none: no indexed Pexels video confirms an older mother and an adult daughter together.

| Lead | Status |
|---|---|
| Kindel Media 6994972 | Vertical 4K family at a laptop; ages unconfirmed |
| Kampus Production Portugal shoot | Right casting, but surfaced only as beach **photos** |

Both are now in the register (L46–L50; 50 leads, all unverified). The index is shallow, so the shoot may exist without being indexed. Settling it needs direct access to the library.

**Gap, per the brief:** no shot has been filled with unrelated actors.

## What changed this round

| Area | Change |
|---|---|
| Timeline | Retimed to the 0–3 / 3–6 / 6–9 / 9–12 / 12–16 / 16–25 / 25–27 / 27–30 / 30–32 s plan; see the table below. Products and guidance untouched. |
| Placeholder layers | `PendingPlate`, including the floating laptop silhouette, is **deleted**. Every live-action slot is now a `StockShot`: `<OffthreadVideo>`, native speed, cover-cropped to 9:16 on a focus point. |
| Screen replacement | The selection graphic is pinned **only to a tracked physical screen** (`stock/tracks/s01.json`, `s06.json`). It is never floated over the picture. The push into the product stage starts from the tracked quad. |
| Closing → end card | A white foreground rises over the mother's closing shot (the same gesture as the guidance rise) and lands on the logo's own white. End-card reveals were tightened, so the static brand hold is now 32 frames (1.33 s). |
| Bug fixed | The underline under "More good days ahead." was drawn beneath the closing picture and was invisible. The thread now sits above it. |
| Render modes | `V06-Master`: no burn-in or plates; **throws** if any shot lacks a clip, a cleared licence record or a screen track. `V06-Preview` / `V06-Opening` (0–16 s) / `V06-MotionSection`: review renders. |
| Tools (`video06/tools/`) | `ingest.py`, `crop_check.py`, `track_screen.py` (+ self-test), `qc_render.py` |

## Timeline placement (24 fps)

| Shot | Frames | Time | Picture (from `manifest.json`) | Type | Cut in |
|---|---|---|---|---|---|
| s01 | 0–72 | 0:00–3:00 | Daughter browsing on a laptop; selection graphic tracked into the screen | You / *buy it.* (6–46) · But… (52–84) | — |
| s02 | 72–92 | 3:00–3:20 | Daughter close-up: she pauses | "But…" holds across the cut | Hard cut on her pause |
| s03 | 92–144 | 3:20–6:00 | Mother close-up, matched eyeline/gesture | They / *live with it.* (96–137) | **Match cut** on eyeline/head turn |
| s04 | 144–216 | 6:00–9:00 | Mother's routine (gardening preferred), one continuous shot | Their day. · Simple routines · Things they love | Action cut |
| s05 | 216–288 | 9:00–12:00 | Same mother reading / tea | Their / *comfort.* | Action cut (cup lift / page turn) |
| s06 | 288–388 | 12:00–16:04 | Mother + daughter deciding on the laptop; push into the tracked screen at 352 | Their / *choice.* · Choose together. | Action cut |
| — | 384–600 | 16–25 s | **Preserved** original-product stage (Guard Rail → Health Guard → The Keeper) | — | Screen push + 6-frame settle |
| — | 600–664 | 25–27.7 s | **Preserved** guidance: Understand → Choose → Get started | — | Cream rise |
| s11 | 664–716 | 27.7–29.8 s | Same mother, ordinary confident moment | More good days ahead. | Hard cut |
| — | 716–768 | 29.8–32 s | **Preserved** end card: official logo · Care that fits real life. · Find your fit → | — | White rise |

The guidance keeps 64 frames instead of the requested 48. Shortening it to 25–27 s would leave the third step on screen for under 0.5 s. The closing shot therefore runs 27.7–29.8 s, and the end card takes 29.8–32 s so the CTA keeps a real hold. All three numbers are in `constants.ts`.

## Procedure once footage can be obtained

```bash
# 1. Register each licensed ORIGINAL (not a watermarked preview); this copies it into remotion/public/stock/
.venv-video06/bin/python -I video06/tools/ingest.py --shot s04 --file <clip.mp4> --provider Pexels \
    --asset-id <id> --url <clip page> --creator "<name>" --licence "Pexels License" \
    --licence-status free-licence --source-in <seconds> --confirm-original
# 2. Check the 9:16 crop: faces whole, clear of titles (adjust focus/zoom in manifest.json, re-run)
.venv-video06/bin/python -I video06/tools/crop_check.py --shot s04
# 3. Track the laptop screens (seed the 4 corners on the shot's first frame, source px)
.venv-video06/bin/python -I video06/tools/track_screen.py --shot s01 --corners X,Y X,Y X,Y X,Y --preview remotion/out/track_s01.png
.venv-video06/bin/python -I video06/tools/track_screen.py --shot s06 --corners X,Y X,Y X,Y X,Y --preview remotion/out/track_s06.png
# 4. Review 0–16 s, then the master, then QC
cd remotion && npx remotion render src/index.ts V06-Opening out/v06_opening_0-16s_review.mp4 --browser-executable=$REMOTION_BROWSER_EXECUTABLE
npx remotion render src/index.ts V06-Master out/v06_master_1080x1920_24p.mp4 --browser-executable=$REMOTION_BROWSER_EXECUTABLE
cd .. && .venv-video06/bin/python -I video06/tools/qc_render.py remotion/out/v06_master_1080x1920_24p.mp4
```

**Known compositing risk:** if the mother's hand crosses the screen in s06 (pointing), the pinned graphic would sit over her finger. Either pick a take where hands stay below the screen, or keep the real screen content in that shot and replace it only during the push. A roto matte is not built yet.

## Verification run this round

| Check | Result |
|---|---|
| `V06-Master` without licensed clips | **Refused** (exit 1, no file): `MissingStockError: s01 has no screen track`. |
| Tracker self-test (synthetic plane, known truth, x264-encoded, 96 frames) | Corner RMS **0.08 px**, max **0.48 px**: PASS. |
| Products + guidance (f388–663) vs. the previous render | 164/276 frames bit-identical; minimum 42.8 dB (encoder carry-over after the retimed push). **Preserved.** |
| `qc_render.py` on the review preview | Correctly **fails** it: placeholder plates in 412 frames, burn-in, frozen live-action slots, no audio. Product photo 33.2 dB and logo 30.1 dB pass. |
| Review renders | `v06_preview_1080x1920_24p.mp4` (768 f, 32.000 s), `v06_opening_0-16s_review_1080x1920_24p.mp4` (384 f, 16.000 s): 1080×1920, 24 fps, yuv420p BT.709. **These still contain the review plates and burn-in. They are not deliverables.** |
