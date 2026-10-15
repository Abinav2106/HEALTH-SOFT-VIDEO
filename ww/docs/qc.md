# W&W "Start with why." — QC (review render, 15 Oct 2026)

File checked: `remotion/out/ww_start-with-why_review_1080x1920_30p.mp4` (`ww/tools/qc_ww.py`).

| Check | Result |
|---|---|
| Resolution / aspect | 1080×1920, 9:16 — PASS |
| Frame rate / frames / duration | 30 fps, 1350 frames, 45.01 s — PASS |
| Audio | AAC 48 kHz stereo present — scratch only (mean −25.6 dB, peak −4.9 dB) |
| Final hold | Wipe resolved 41.0 s; mean frame change 41–45 s = 0.11 (static apart from edge drift) — PASS |
| Solid-colour frames | Only the intended post-expansion holds (14.8–15.0 black, 19.83–20.0 orange, 24.83–25.0 white) |
| Fonts | DM Sans 400/500/700 bundled; render is held until `document.fonts.check` passes, fails otherwise |
| Logo | Official file as an alpha mask; aspect locked to source (1794:515 crop); never retyped |
| Missing assets | None at render time. Rigged Doubt absent → stand-ins flagged in the burn-in |

## Source vs reconstruction (action start / peak / hold / transition end)

| Ref | Source evidence | Reconstruction | Notes |
|---|---|---|---|
| R1 | Activity measured from the video: lit area ≈ constant 0.6–2.7 s, thins 2.7–4.3 s, one dot 4.3–5.8 s; marks never move | Same curve ×0.8: busy 0–1.55, thinning 1.55–2.85, one orange mark 2.85–3.93; 3-frame intensity changes, no travel | Player controls (0–0.6 s) excluded. Pulse + mascot connection are W&W bridges, not R1. Match-cut verified: grid mark and Doubt's question mark share centre (540,760) and height (96 px) |
| R2 | Close-up greeting → small reframes → pullback ≈1 s → turn → front presentation → zoom-out to 3×3 grid, hold | Close-up s=1.75 with two small reframes on line changes; 0.75 s pullback; 0.7 s zoom-out to 3×3 grid of W&W panels around the same Doubt | Turn omitted (needs the real 3D asset). Gestures/pickup BLOCKED. No other mascots |
| R3 | Cards rise 1.0–1.5 s; hand presses 1.5–3.0; interior turns next colour, frame scales to fill 3.0–3.5; hold ≈0.3 s; object rises, copy word by word, coins drop | Same order in all four transitions: rise 0.55 s, press, interior swap 0.1 s, expansion 0.55 s, 0.17 s hold, object rise, word-by-word headline, swatches/tag/checks as the secondary motion | Hand = provisional cutout. End-card wipe shape not in evidence → circle, UNVERIFIED |
| R4 | 0–0.3 bookmark/light → black · 0.3–1.3 lead · 1.3–2.8 cascade · 2.8–4.1 hold + bookmark · 4.1–6.5 stream · 6.5–7.5 bookmark | Identical local times. Stream: 54 cards on converging accelerating paths, scale → 4 %, clipped to the screen, 8-sample 180° motion blur; bookmark rises to centre and turns orange (selection) | Stream density approximate; cards are concept stills from this film |

## Continuity

- One Doubt throughout: approved render layers only; question mark stays black (orange glow only on the opening pulse).
- Phone: never at an ear; in the call the viewer IS the phone camera. The pickup itself is BLOCKED.
- Scene C phone → R4 phone: same component, position/scale interpolated to the R4 geometry before the cut.
- First/last frame of every section + shot manifest: `node scripts/ww-frames.mjs` → `remotion/out/ww_frames/`.
  Hero stills (clean, separate from any blurred frame): `remotion/public/ww/hero/`.

## Open

Rigged Doubt; approved orange; vector logo; cleared portfolio assets for R4; recorded VO; music; CTA destination (none invented).
