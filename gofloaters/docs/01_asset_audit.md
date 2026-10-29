# Asset audit — what was supplied, what the reel uses

**Supplied:** three flattened storyboard rasters (1024×1536 WebP): the "Final storyboard", the
"Clean motion storyboard" and the "Final production storyboard" (seven scenes / eight keyframes),
which is the layout authority for this cut. Nothing else: no
layered files, no original Tilo artwork, no logo file, no game clue, no gameplay map, no room or gift
photography, no audio. Most image layers are cut from the first sheet, the larger and cleaner source
for those crops. The Amazon gift card and the reversed (white) wordmark come from the production
sheet.

The storyboard has no editable layers. Every image layer below is a crop of it, matted and cleaned
by `gofloaters/tools/extract_storyboard.py`. Nothing was regenerated or redrawn by AI; the cleanup
uses frequency-selective inpainting and Poisson-blended copies of neighbouring pixels.

| Layer | Source in storyboard | Status | Notes |
|---|---|---|---|
| Tilo + aircraft | header lockup (~140 px wide) | **Stand-in, needs original** | Matted without touching the art. Upscaled about 6×, so slightly soft at the larger sizes. The propeller is isolated onto its own layer and removed from the aircraft layer; only the blades inside its disc animate. |
| Logo wordmark | header lockup | **Stand-in, needs vector** | Unmixed from the page colour; static, fade only. The lockup's Tilo is the same supplied artwork and stays part of the logo. |
| Aerial map | panel 3 | **Illustrative ("Map concept")** | Baked route, nodes, mascot, captions and inset removed. Upscaled about 3.4×. Some patched texture is visible on close inspection. Not a real location. |
| Selected workspace | panel 3 inset | **Illustrative** | Perspective-rectified, pin removed. Not a verified GoFloaters workspace. |
| Meeting room + door | panel 4 | **Illustrative** (also cropped as G's workspace preview, H's card photo) | "Found!", mascot and bone removed and rebuilt as live layers. The door is split off for parallax. Not a verified GoFloaters location. |
| Gift box | built in code (`GiftBox.tsx`) | **Original vector rig** | A closed box with ribbon and bow, drawn as separate layers so it can open without deforming anything. It follows the storyboard's gold box and bow but is a simpler, flat-shaded drawing, not the storyboard's photoreal render. Replace with approved layered box art (body, lid, ribbon) when available. |
| Amazon gift card | production storyboard keyframe F | **Illustrative ('Reward example'), needs approved artwork** | Perspective-rectified to a flat card. The bottom strip hidden by the box in the storyboard was filled with the card's own black; no artwork was invented. Confirm use of the Amazon gift-card mark. |
| Reversed wordmark | production storyboard keyframe H | **Stand-in, needs vector** | White wordmark and tagline unmixed from navy; static. |
| Game clue | panel 2 sample text | **Illustrative sample** | "Where teams meet / look beside the window". No approved clue was supplied. It is not labelled inside the reel, so treat it as a placeholder. Replace in `COPY.clue`. |

Built from scratch (no storyboard pixels): all typography (DM Sans, live text), the Spark Bone, the
route, pin and target ring, check badge, gift-box rig, city chips, mystery card, CTA, and the sound.
G's city list is the campaign's city names only. No workspace names, addresses or gameplay screens
were created.

## Other sources

- **DM Sans**: Google Fonts variable file (opsz 9–40, wght 100–1000), SIL OFL 1.1,
  `remotion/public/gofloaters/fonts/`. Weights used: 700 Bold (headlines) and 500 Medium (labels, supporting copy).
- **Narration**: Kokoro-82M v1.0 (Apache-2.0 open-weight TTS, run locally with kokoro-onnx), stock
  voice `af_heart`. This is a licensed synthetic voice: no cloning, and no imitation of any real
  person. The script is used verbatim. "GoFloaters" is pinned phonetically as GO-floaters. Each line
  goes through gentle compression and is normalised to −16 LUFS (BS.1770) with a −1 dBFS look-ahead
  limiter. An independent Whisper base.en pass transcribes all seven lines correctly, both in isolation
  and in the final mix.
- **Sound effects**: synthesised by `gofloaters/tools/make_sfx.py` (seeded, deterministic): soft
  aircraft hum (only while Tilo flies), card-movement swells, two highlight swipes, one short
  signal-glitch accent, target-lock click, one discovery chime, box settle, lid and card lifts, and the
  Chennai selection click. No ticking, and no continuous glitch noise. The hum and effects duck about
  8 dB under narration. There is no music, because none was supplied; this is the
  narration-and-effects version. The final mix measures −16.4 LUFS integrated, −3.2 dBFS peak.

## Needed for production

1. Original Tilo-and-aircraft artwork (PNG with alpha at ≥1200 px wide, or vector), ideally with the propeller on its own layer.
2. Corporate logo (vector).
3. The approved game clue text.
4. Approved gameplay map or aerial image (≥1080×1920), and the real selected-workspace image.
5. Approved meeting-room photograph (≥1080×1920), ideally with the door/foreground separable.
6. Approved reward artwork: gift-box body, lid and ribbon as separate layers, and the Amazon gift-card artwork, with confirmation that the mark may be used.
7. Approved music, if any (the current mix is narration and effects only).
