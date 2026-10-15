# Video 06 — Finishing from the four original clips

## Why the edit is not inside Effectcraft / "Comp 2"

This cloud session cannot operate Effectcraft:
- No Chrome browser-control tools are attached.
- The Effectcraft hosts are refused by the environment's network policy.
- The Higgsfield link to After Effects / Premiere reports no connected host.

The same four originals are finished here instead, from the existing Remotion project.

## One command

```bash
# Put the four originals here (they are gitignored):
#   assets/stock/video06/V06_Stock_01.mp4  5486229  mother + daughter with laptop (portrait 2160×4096, 25 fps)
#   assets/stock/video06/V06_Stock_02.mp4  5486219  mother + daughter having coffee (landscape 4096×2160, 25 fps)
#   assets/stock/video06/V06_Stock_03.mp4  5495326  cooking / daily routine (landscape 4096×2160, 25 fps)
#   assets/stock/video06/V06_Stock_04.mp4  5493998  mother + daughter emotional moment (portrait 2160×4096, 25 fps)
video06/tools/finish_video06.sh
```

| Step | What happens |
|---|---|
| Ingest | Each original is hard-linked into `remotion/public/stock/` (no second copy, no re-encode), probed, hashed and recorded in `stock/manifest.json` with its Pexels ID and licence. |
| Frame rate | 25 fps sources are **conformed** to the 24 fps timeline (`playbackRate` 0.96): every source frame is shown once. No dropped-frame judder; 4 % slower, imperceptible. |
| Mapping | 01 → 0–3 s and 12–16 s (different moments); 04 → 3–6 s and 27–30 s (different moments); 03 → 6–9 s; 02 → 9–12 s. |
| Reframe | `auto_reframe.py` detects faces across each shot and positions the cover-fit 9:16 window on them. Portrait 2160×4096 sources need only a 128 px vertical trim; landscape 4096×2160 sources keep a 1215 px-wide window. Nothing is stretched. |
| Crop check | `crop_check.py` writes a contact sheet per shot and flags faces cut by the crop or sitting under a title. |
| Screen graphic | Pinned only if a laptop screen is tracked convincingly (`track_screen.py`). Otherwise none: no fabricated shopping UI. The 12–16 s shot hands over to the products with an ivory foreground rise. |
| Renders | `Healthsoft_V06_Stock_Integration_0-16s.mp4`, then `Healthsoft_V06_PictureLock_1080x1920.mp4` (master mode: no review labels, fails if any clip is missing). |
| QC | `qc_render.py`: format, no placeholder plates or review burn-in, no black frames, no frozen live action, product photo and logo fidelity, audio presence and loudness. |

In-points are first-pass defaults. After reviewing the 0–16 s render, adjust `sourceIn` / `focus` per shot in `manifest.json` and re-run the two renders.

## Audio still to supply

- **Voice-over:** an approved recording; timing is in `video06/audio/V06_narration_timing.srt`.
- **Music:** a licensed track.

Both stems stay silent until the files exist. The synthesised SFX stem is in place.
