# Video 06 — Motion-graphics preview: build notes and QC

Render date: 2026-10-10. Source: `remotion/src/video06/` (Remotion 4.0.534, frame-driven; no browser-timed animation).

## Deliverables in this round

| File (not committed — renders stay out of the public repo) | Spec | Content |
|---|---|---|
| `remotion/out/v06_preview_1080x1920_24p.mp4` | H.264, 1080×1920, 24 fps, 768 frames, 32.000 s, yuv420p BT.709, **no audio** | Full timeline. Finished graphics; **labelled placeholder plates** where stock goes; review burn-in |
| `remotion/out/v06_motion_section_1080x1920_24p.mp4` | Same spec, 480 frames, 20.000 s | 0:12–0:32: shared choice → screen push → products → guidance → close → end card |
| `remotion/out/v06_preview_contact_1fps.png` | 33 frames | One frame per second, for review |

These are **review previews, not the film**. Every human shot is a slate reading "STOCK PENDING". There is no voice-over, music or SFX.

## No existing Remotion project was found

Neither this repository nor any other repository on the account contained the earlier Healthsoft Remotion project. A new project was created at `remotion/` with Video 06 as its own compositions (`V06-Preview`, `V06-MotionSection`). If the earlier project exists elsewhere, Video 06 can be moved into it unchanged: it only depends on `remotion`, two font files and the two brand files.

## Design decisions (all editable in `constants.ts`)

| Element | Decision |
|---|---|
| Typography | Live text, line-by-line masks; **no movement while on screen** (each line settles in 14 frames, then holds until its exit). Substitute fonts: Inter + Newsreader Italic (SIL OFL), bundled locally, until brand fonts arrive. |
| Orange thread | One 6 px line in the logo orange (`#EC8D1F`, measured from the logo). Its path: it underlines the orange words, carries under the product labels, turns the corner up the left margin to become the guidance spine, then resolves under "Find your fit". No other decorative effect. |
| Decision → products | The camera pushes into the shared laptop screen. The corner-pinned selection graphic rectifies to full frame and becomes the product stage. The push finishes 6 frames early and dissolves to the sharp stage, so there is no softness snap. |
| Products | The **original photograph, unaltered**, fills the frame. Its aspect is 941:1672 ≈ 9:16. A virtual camera (≤ 1.10× zoom, pans clamped inside the photo) plus a rack-focus mask moves attention Guard Rail → Health Guard → The Keeper. No cut-outs, so products keep their real plinth contact and shadows: no floating, no rotation, no invented surfaces. |
| Guidance | A cream foreground rises from the label scrim, using the photo's own background colour. Three numbered steps hang off the spine. No icons, dashboards, readings or onboarding states. |
| End card | Official logo file drawn 1:1 on pure white, which equals its own background, so it is never keyed or recoloured. Then the line, the CTA, and a 26-frame (≈ 1.1 s) static hold. |
| Title safety | All copy sits between y 250 and y 1640, clear of 9:16 platform UI. |

## QC measurements

| Check | Method | Result |
|---|---|---|
| Format | ffprobe | 1080×1920, 24/1 fps, 768 frames, 32.000 s, yuv420p, BT.709 tags. ✅ |
| Product colour fidelity | Stage frame f396 vs. original photo resized only | Mean RGB within 1.7 levels; PSNR 33.2 dB (H.264 + WebP decode). Geometry unchanged. ✅ |
| Logo fidelity | f767 logo region vs. official PNG at 1:1 | Best match at zero offset; PSNR 30.1 dB (thin line-art through 4:2:0); orange (235,140,31) vs. file (236,141,31). ✅ |
| Screen-push continuity | Frame-to-frame PSNR across f376–392 | Handover steps 45–49 dB (vs. a 20–34 dB moving push); no snap. A 32 dB snap found in the first render was fixed. ✅ |
| Frame coverage after push | Darkest edge pixel per frame | Fully covered from f387. Earlier frames show the receding plate, as designed. ✅ |
| Text still while read | Code path: `MaskedLines` translate = 0 between settle and exit | ✅ by construction. Shortest reading holds: end card 26 frames (≈ 1.1 s); "Things they love" ≈ 0.7 s (C9 still open). |
| Product names/categories | Visual | Safety — Guard Rail · Health — Health Guard · Medication — The Keeper, as approved. ✅ |
| Audio sync | — | **Not testable: no audio exists yet.** |

## Known gaps — not complete

1. **All human shots are placeholders.** The corner-pin quads are placeholders too. Real clips need per-frame tracked screen corners. The planar track would be done in Python/OpenCV and fed in as data.
2. **Audio pending:** approved VO, licensed music and SFX cue sheet.
3. **Product resolution:** the only product file is the 941 px composite. At ≤ 1.10× zoom it is upscaled ~1.26×, acceptable for review but soft for a master. Separate high-resolution product PNGs would remove this limit.
4. **Logo resolution:** 447 px raster. A vector logo is needed for a crisp master.
5. **Brand fonts** not supplied. Substitutes are in use.
6. **Copy items still open:** C9 (montage reading time) and C10 ("Get started with support" must describe a real service).
