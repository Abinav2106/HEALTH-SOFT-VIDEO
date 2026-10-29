# Healthsoft video compositions (Remotion)

Video 06 lives in `src/video06/`. All timing, colour, copy and layout values are in `src/video06/constants.ts`.

GoFloaters "Find the Spark" lives in `src/gofloaters/` — see `../gofloaters/README.md`.

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
