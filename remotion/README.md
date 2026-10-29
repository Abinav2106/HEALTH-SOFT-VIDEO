# Healthsoft video compositions (Remotion)

Video 06 lives in `src/video06/`. All timing, colour, copy and layout values are in `src/video06/constants.ts`.

## Setup

```bash
npm install
# Brand files are not in git (public repo). Place the client originals, byte-identical:
#   public/brand/healthsoft_products_original.webp
#   public/brand/healthsoft_logo_original.png
```

In the cloud container Remotion cannot download its own browser. Point it at the pre-installed one:

```bash
export REMOTION_BROWSER_EXECUTABLE=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
```

## Render

```bash
npx remotion render src/index.ts V06-Preview out/v06_preview_1080x1920_24p.mp4 --browser-executable=$REMOTION_BROWSER_EXECUTABLE
npx remotion render src/index.ts V06-MotionSection out/v06_motion_section_1080x1920_24p.mp4 --browser-executable=$REMOTION_BROWSER_EXECUTABLE
node scripts/stills.mjs out/stills 30 400 650 760   # review stills, one bundle
npx tsc --noEmit                                    # typecheck
```

Compositions: `V06-Preview` (32 s), `V06-Opening` (0–16 s) and `V06-MotionSection` (12–32 s) are review renders (burn-in; stand-in plates where a clip is missing). `V06-Master` has no overlays and **throws** if any live-action shot lacks a licensed clip, licence record or screen track.

Live action comes from `src/video06/stock/manifest.json` (written by `video06/tools/ingest.py`); clip files live in `public/stock/` (gitignored). Screen tracks: `src/video06/stock/tracks/`.

## Structure

| File | Role |
|---|---|
| `Video06.tsx` | Layer order and assembly |
| `components/Opening.tsx` | Panels 01–05 (live-action StockShots + titles) |
| `components/SharedChoice.tsx` | Panel 06 and the push through the laptop screen |
| `components/ProductStage.tsx` | Original product photo, virtual camera, rack focus, labels |
| `components/Guidance.tsx` | Understand → Choose → Get started |
| `components/Thread.tsx` | Every appearance of the orange line |
| `components/Closing.tsx` | Panel 11 line, end card (official logo, CTA) |
| `components/StockShot.tsx` | One live-action shot: licensed clip, 9:16 cover crop on a focus point, native speed |
| `stock/stock.ts` | Manifest access, crop maths shared with the tracker, strict-mode assertions |
| `lib/cornerPin.ts` | Homography → CSS `matrix3d` for screen compositing |

---

# Tilo — The Reward Flight (GoFloaters Reel)

`src/tilo/` · 1080×1920 · 30 fps · 24 s (720 frames). One continuous rear-follow flight on a single
global timeline; the six storyboard beats are timings in `src/tilo/config.ts`, not separate scenes.

Compositions (Studio folder `Tilo-RewardFlight`):
- `Tilo-RewardFlight` — the master, normal playback speed. Deliverable.
- `Tilo-RewardFlight-2xReview` — the same master sampled at 2× (what a viewer holding Instagram's 2× sees), with a red burn-in. Review only. Studio's own playback-rate menu also works.

All copy, colours, shot timings, aircraft size/position, flight-path keys (speed, turn rate, altitude),
camera, city generation and UI positions are props (zod schema) — edit live in Studio's props panel,
or permanently in `src/tilo/config.ts`.

## Assets

Client artwork stays out of git (public repo). Place the originals, then derive:

```bash
# public/brand/gofloaters/tilo_aircraft_sheet_original.jpg   (1600x900 Tilo aircraft sheet)
pip install pillow numpy vtracer
npm run assets:tilo   # traces rear-view Tilo -> public/brand/gofloaters/tilo_rear.svg; regenerates audio
```

`tilo_rear.svg` is traced from the sheet's row 2 / column 5 cell (behind-and-above view) — upscaled,
snapped to the sheet's own flat colours and vectorised; nothing is redrawn. Audio in
`public/tilo/audio/` is synthesised by `scripts/generate-tilo-audio.py` (original, no samples).
Fonts: Bricolage Grotesque + Inter (OFL substitutes; brand fonts not supplied).

## Render

```bash
npm run render:tilo
npm run render:tilo:2x-review
npm run stills:tilo          # the six storyboard moments
```

In the cloud container there is no GPU and only SwiftShader WebGL works. The headless shell also
ghosts HTML layers across frames there, so render with full Chromium:

```bash
npx remotion render src/index.ts Tilo-RewardFlight out/tilo_reward_flight_1080x1920_30p.mp4 \
  --gl=swangle --chrome-mode=chrome-for-testing \
  --browser-executable=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome
```

## Structure

| File | Role |
|---|---|
| `TiloRewardFlight.tsx` | Layer order, config + flight contexts |
| `config.ts` | Schema and defaults for every editable value |
| `lib/flight.ts` | Integrates the world-space flight path once (heading, bank, camera lag) |
| `lib/sheet.ts` | Reward-sheet curve; also drives the camera reframe |
| `lib/city.ts` | Seeded city layout (parcels, buildings, destination) |
| `components/FlightCamera.ts` | Rear-follow camera + projection shared by WebGL and overlays |
| `components/GameplayEnvironment.tsx` | three.js city (visual approximation of the game map) |
| `components/RearViewTiloAircraft.tsx` | Traced rear-view Tilo: bob, bank, propeller blur |
| `components/DestinationMarker.tsx` / `DestinationToast.tsx` / `GameCompass.tsx` | World-anchored marker, toast, compass |
| `components/OpeningOverlays.tsx` | Shot 01 headline and 2× hold cue |
| `components/RewardBottomSheet.tsx` | Sheet, PrizePoolCard, MysteryTicket, RevealCTA |
| `components/AudioBed.tsx` | Sound cues (speed-aware for the 2× review) |
