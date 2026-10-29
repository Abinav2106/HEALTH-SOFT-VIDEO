# Asset audit — what was supplied, what the reel uses

**Supplied:** two flattened storyboard rasters (1024×1536 WebP): the "Final storyboard" and the
"Clean motion storyboard", which is the layout authority for the narrated cut. Nothing else: no
layered files, no original Tilo artwork, no logo file, no game clue, no gameplay map, no room or gift
photography, no audio. Image layers are cut from the first sheet, the larger and cleaner of the two
for those crops.

The storyboard has no editable layers. Every image layer below is a crop of it, matted and cleaned
by `gofloaters/tools/extract_storyboard.py`. Nothing was regenerated or redrawn by AI; the cleanup
uses frequency-selective inpainting and Poisson-blended copies of neighbouring pixels.

| Layer | Source in storyboard | Status | Notes |
|---|---|---|---|
| Tilo + aircraft | header lockup (~140 px wide) | **Stand-in, needs original** | Matted without touching the art. Upscaled about 6×, so slightly soft at the larger sizes. The propeller is isolated onto its own layer and removed from the aircraft layer; only the blades inside its disc animate. |
| Logo wordmark | header lockup | **Stand-in, needs vector** | Unmixed from the page colour; static, fade only. |
| Aerial map | panel 3 | **Illustrative ("Map concept")** | Baked route, nodes, mascot, captions and inset removed. Upscaled about 3.4×. Some patched texture is visible on close inspection. Not a real location. |
| Selected workspace | panel 3 inset | **Illustrative** | Perspective-rectified, pin removed. Not a verified GoFloaters workspace. |
| Meeting room + door | panel 4 | **Illustrative** | "Found!", mascot and bone removed and rebuilt as live layers. The door is split off for parallax. Not a verified GoFloaters location. |
| Gift box + Amazon gift card | panel 5 | **Illustrative ("Reward example")** | One intact matted asset. No separate lid/card layers exist, so it gets a bottom-up matte reveal and a gentle rise, with no lid opening. The storyboard's own static Tilo (a different drawing from the header one) was removed by copying the box face down; that patch sits under the hovering Tilo layer. The right ribbon tail is cut by the crop (soft edge). |
| Game clue | panel 2 sample text | **Illustrative sample** | "Where teams meet / look beside the window". No approved clue was supplied. It is not labelled inside the reel, so treat it as a placeholder. Replace in `COPY.clue`. |

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
- **Narration**: Kokoro-82M v1.0 (Apache-2.0 open-weight TTS, run locally with kokoro-onnx), stock
  voice `af_heart`. This is a licensed synthetic voice: no cloning, and no imitation of any real
  person. The script is used verbatim. "GoFloaters" is pinned phonetically as GO-floaters. Each line
  goes through gentle compression and is normalised to −16 LUFS (BS.1770) with a −1 dBFS look-ahead
  limiter. An independent Whisper base.en pass transcribes all six lines exactly, both in isolation
  and in the final mix.
- **Sound effects**: synthesised by `gofloaters/tools/make_sfx.py` (seeded, deterministic): soft
  aircraft hum (only while Tilo flies), two highlight swipes, map-selection click, one discovery chime,
  check click, gift lift, quiet closing accent. No ticking. The hum and effects duck about 8 dB under
  narration. There is no music, because none was supplied; this is the narration-and-effects version.
  The final mix measures −16.3 LUFS integrated, −2.8 dBFS peak.

## Needed for production

1. Original Tilo-and-aircraft artwork (PNG with alpha at ≥1200 px wide, or vector), ideally with the propeller on its own layer.
2. Corporate logo (vector).
3. The approved game clue text.
4. Approved gameplay map or aerial image (≥1080×1920), and the real selected-workspace image.
5. Approved meeting-room photograph (≥1080×1920), ideally with the door/foreground separable.
6. Approved reward artwork, ideally gift-box body, lid and card as separate layers. Also confirm use of the Amazon gift-card mark.
7. Approved music, if any (the current mix is narration and effects only).
