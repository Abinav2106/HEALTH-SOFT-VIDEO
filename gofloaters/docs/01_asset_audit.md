# Asset audit — what was supplied, what the reel uses

**Supplied:** one flattened storyboard raster (1024×1536 WebP, "GoFloaters / Final storyboard",
six keyframes). Nothing else: no layered files, no original Tilo artwork, no logo file, no game
clue, no gameplay map, no room or gift photography, no audio.

The storyboard has no editable layers. Every image layer below is a crop of it, matted and cleaned
by `gofloaters/tools/extract_storyboard.py`. Nothing was regenerated or redrawn by AI; the cleanup
uses frequency-selective inpainting and Poisson-blended copies of neighbouring pixels.

| Layer | Source in storyboard | Status | Notes |
|---|---|---|---|
| Tilo + aircraft | header lockup (~140 px wide) | **Stand-in, needs original** | Matted without touching the art. Upscaled about 6×, so slightly soft at the larger sizes. Used rigid (translate/rotate only); the propeller is not animated separately because no clean propeller layer exists. |
| Logo wordmark | header lockup | **Stand-in, needs vector** | Unmixed from the page colour; static, fade only. |
| Aerial map | panel 3 | **Illustrative ("Map concept")** | Baked route, nodes, mascot, captions and inset removed. Upscaled about 3.4×. Some patched texture is visible on close inspection. Not a real location. |
| Selected workspace | panel 3 inset | **Illustrative** | Perspective-rectified, pin removed. Not a verified GoFloaters workspace. |
| Meeting room + door | panel 4 | **Illustrative** | "Found!", mascot and bone removed and rebuilt as live layers. The door is split off for parallax. Not a verified GoFloaters location. |
| Gift box + Amazon gift card | panel 5 | **Illustrative ("Reward example")** | One intact matted asset. No separate lid/card layers exist, so it gets a matte reveal and a gentle rise, with no lid opening. The storyboard's own Tilo is part of this artwork, and the right ribbon tail is cut by the crop. |
| Game clue | panel 2 sample text | **Illustrative sample** | "Where teams meet / look beside the window". Marked "Illustrative clue" in the preview render. Replace with the approved clue in `COPY.clue`. |

Built from scratch (no storyboard pixels): all typography (DM Sans, live text), the Spark Bone, flight
lines/routes, pin, check badge, success seal, India map and markers, sound.

## Other sources

- **DM Sans**: Google Fonts variable file (opsz 9–40, wght 100–1000), SIL OFL 1.1,
  `remotion/public/gofloaters/fonts/`. Weights used: 500 and 700.
- **India boundary**: Natural Earth 1:10m admin-0, India point-of-view edition (public domain),
  simplified to 0.03°. Have it checked against your legal requirements for depicting India's boundary
  before publishing.
- **City markers**: the eight city-centre coordinates from the brief, projected through the same
  Web-Mercator function as the boundary (`lib/geo.ts`). They are approximate city centres, not
  workspace addresses. New Delhi, Gurugram and Noida sit in an NCR inset at 16.5× magnification of
  the same projection.
- **Sound**: synthesised by `gofloaters/tools/make_sfx.py` (seeded, deterministic). Cues: aircraft passes,
  highlight swipes, pin click, one discovery chime, gift lift, closing accent, low pad bed. No ticking
  and no narration. Master loudness is about −19 LUFS integrated, −4 dBFS peak.

## Needed for production

1. Original Tilo-and-aircraft artwork (PNG with alpha at ≥1200 px wide, or vector), ideally with the propeller on its own layer.
2. Corporate logo (vector).
3. The approved game clue text.
4. Approved gameplay map or aerial image (≥1080×1920), and the real selected-workspace image.
5. Approved meeting-room photograph (≥1080×1920), ideally with the door/foreground separable.
6. Approved reward artwork, ideally gift-box body, lid and card as separate layers. Also confirm use of the Amazon gift-card mark.
7. Approved audio, if any.
