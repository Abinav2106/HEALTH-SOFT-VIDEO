# GoFloaters — Master Mascot, Motion and Brand Identity System

This package turns the supplied GoFloaters logo into a reconstructed vector master, a working character and aircraft rig, 12 expressions and 12 actions, a signature hero animation, a graphic and motion language, a 39-page brand guidelines PDF with an interactive animated edition, real-world mockups and a working local Brand Studio.

> **Source of truth:** `01_SOURCE_REFERENCE/original_logo/gofloaters_original_logo.webp` (2000×667).
> Everything is built from a **vector reconstruction** of that raster. Hidden areas that had to be invented for rigging are marked `class="gf-reconstruction"` in every SVG and shown in orange on guidelines p.7.
> Everything not in the supplied logo is labelled **Proposed**: creative territory, supporting colours, typography, patterns, logo variants, constructed body views, game and screen concepts.

## Quick start
```bash
cd GOFLOATERS_MASTER_BRAND_SYSTEM
python3 -m http.server 8765          # any static server works; needed for downloads + fetch
# Brand Studio:          http://localhost:8765/08_INTERACTIVE_BRAND_STUDIO/index.html
# Animated guidelines:   http://localhost:8765/07_BRAND_GUIDELINES/editable_source/brandbook.html
# Rig test scene:        http://localhost:8765/03_CHARACTER_RIG/rig_controls/rig_test_scene.html
```
The PDF is at `07_BRAND_GUIDELINES/GoFloaters_Brand_Guidelines.pdf`. The Studio and the brandbook also open straight from disk. Without a server, the Studio's download links open files instead of saving them, and the rig test scene falls back to auto-generated slider ranges.

## What is in each folder
| Folder | Contents |
|---|---|
| `01_SOURCE_REFERENCE` | Supplied logo; `source_audit/SOURCE_AUDIT.md` (what was inspected, verified characteristics, sampled colours, ambiguities); `visual_comparison/` (side-by-side, overlay, difference map, detail crops, `fidelity_metrics.json`) |
| `02_MASTER_IDENTITY` | Full-colour lock-up SVG + 4000 px PNG + light/dark previews; symbol, wordmark, tagline, wordmark+tagline, 5 individual speed lines + set (SVG + PNG); mascot-only (seated, head, waving, happy); aircraft-only (with/without speed lines); 8 logo variants (A original, B–G proposed) |
| `03_CHARACTER_RIG` | `rig_source/` (data, rig, free body, motion library, stage); `rig_controls/` (functional test scene + `controls.json`); `rig_preview/rig_proof_playback.mp4`; `RIG_DOCUMENTATION.md` (hierarchy, pivots, build method, limits) |
| `04_CHARACTER_LIBRARY` | 12 expressions, 12 action key poses, 6 character views (SVG + 1800 px PNG each) |
| `05_ANIMATION` | Hero (9 s 1080p MP4, reduced-motion MP4, transparent VP9 WebM, transparent 1080p PNG sequence zip, final still); 12 character actions + expression transitions; aircraft-only, propeller, speed lines; logo reveal, wordmark entrance; 7 pattern loops, campaign typography, application background; `media_verification.json` |
| `06_BRAND_IDENTITY` | Colour tokens (CSS/JSON) and sheets; typography (OFL font files + licences + hierarchy); 7 patterns (SVG/PNG) + pattern and scene generators; usage rules |
| `07_BRAND_GUIDELINES` | `GoFloaters_Brand_Guidelines.pdf` (39 pp, 1920×1080 landscape, selectable text, vector SVG artwork); `editable_source/brandbook.html` (the same document, animated, plays the real MP4s); `page_previews/` |
| `08_INTERACTIVE_BRAND_STUDIO` | `index.html` + `assets/` + `application_source/` (manifest builder, automated test results) |
| `09_BRAND_APPLICATIONS` | Poster (flat + in situ), billboard, leaderboard, MPU, Instagram post/story, LinkedIn, mobile and desktop concepts, game activation concept, white and dark tees, tote, bottle, event stall, large event display (+ `event_display_animated.mp4`); HTML sources in `source/` |
| `tools` | Every script used to build the package (see *Rebuild*) |

## Quality gates (each one tested)
**Gate A: identity fidelity. PASS.** The reconstruction was rendered at the same 2000×667 size as the source and compared pixel by pixel: mean difference 1.971/255; 0.507% of pixels differ by more than 40; 98.7% of outline pixels lie within 1 px of the source. The face, ears, body, propeller and lettering were checked visually in `04_detail_inspection_…png`.

**Gate B: rig functionality. PASS.** The rig proof video and the Studio tests show these parts moving independently: head, eyes, lids, ears, mouth, both forelegs (shoulder, elbow, wrist), tail, torso, aircraft, wing and propeller. The dog detaches without distortion, and the empty cockpit and lower body are reconstructed. The rest pose matches the traced master to 0.447/255. Limitation: the ears stay seamless only within about ±5°.

**Gate C: animation quality. PASS.** All 32 video files decode with ffmpeg and show frame-to-frame motion (table in `05_ANIMATION/media_verification.json`). The hero's final frame matches the master lock-up to 0.425/255, which is compression only. Joints were reviewed frame by frame on contact sheets during production.

**Gate D: brand consistency. PASS.** One rig and one traced head produce every expression, action, still and mockup. Colours and fonts come from shared tokens. Every pattern motif comes from a logo element. Original and proposed material is labelled.

**Gate E: editorial quality. PASS (reviewed).** All 39 PDF pages were rendered from the PDF and inspected. Overflow and collision issues found in review were fixed: expression grid, misuse grid, cover, captions on full-bleed pages, collage crop.

**Gate F: delivery verification. PASS.** The PDF opens (39 pages, text extractable with pypdf). In the interactive brandbook all 19 embedded videos load, with 0 HTTP errors and 0 console errors. The Brand Studio passed 22 of 22 automated browser checks, including: every asset link returns HTTP 200; a real download was saved; video play, pause, replay and speed; live rig playback; animated patterns; reduced-motion mode; mobile layout with no horizontal overflow; no console errors. The rig test scene loads 63 working sliders.

## Not produced, and limits
* **Navi by VNGGames reference: not inspected.** behance.net was blocked by this environment's network policy, and no PDF or screenshots were supplied. The guidelines make no claims about its content.
* **Front and three-quarter views of the mascot: not produced.** The source is profile-only, and an invented front face would risk identity drift. Recommended next step: an illustrator-led turnaround reviewed against this book.
* **Rich-media (animated) PDF: not produced.** The PDF is a standard PDF with stills and "plays in the interactive edition" labels; the animated edition is the HTML brandbook.
* **Native After Effects, Moho, Spine or Figma source files: not produced.** The rig is an editable SVG/JavaScript implementation and the animations are code (`gofloaters-motion.js`). No files were renamed to imitate proprietary formats.
* **Constructed full-body view (walk, run, jump, dance, sleep).** This is a proposed extension built in the source's line vocabulary. It is not part of the original artwork.
* **Wordmark typeface: not identified.** The wordmark is preserved as traced artwork. The recommended families (Bricolage Grotesque, Inter, JetBrains Mono) are proposals, under the SIL Open Font License.
* **Screen and game concepts.** All copy and listings are illustrative placeholders. They make no product, price or offer claims, and the game is a proposal.
* Nothing has been deployed publicly.

## Rebuild
Requires Python 3 (numpy, Pillow, scipy, scikit-image, networkx, shapely, potracer, pypdfium2, pypdf), Node 22, the pre-installed Playwright Chromium, and ffmpeg.
```bash
python3 tools/trace_logo.py            # colour-separated trace -> tools/build/trace_layers.json
python3 tools/build_lockup.py          # traced lock-up for comparison
python3 tools/build_rig_data.py        # rig regions, patches, tubes -> 03_CHARACTER_RIG/rig_source/gofloaters-rig-data.js
python3 tools/build_masters.py         # 02_MASTER_IDENTITY vectors + variants
node tools/export_rig.js <jobs.json>   # rig states -> SVG/PNG (mascot, aircraft, library stills)
tools/render_all.sh <tmp>              # all rig animations -> MP4
node tools/render_patterns.js <tmp>    # patterns SVG/PNG + loops
node tools/render_scenes.js <tmp>      # campaign typography + app background
python3 tools/build_applications.py && node tools/render_html.js tools/build/app_jobs.json
python3 tools/build_brandbook.py && node tools/make_pdf.js
python3 tools/verify_media.py          # gate C/F media checks
node tools/test_studio.js http://localhost:8765/08_INTERACTIVE_BRAND_STUDIO/index.html
```
