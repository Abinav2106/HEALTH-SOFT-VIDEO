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

`burnIn` (default `true`) adds the review timecode overlay. Set it to `false` for the master.

## Structure

| File | Role |
|---|---|
| `Video06.tsx` | Layer order and assembly |
| `components/Opening.tsx` | Panels 01–05 (stock placeholders + titles) |
| `components/SharedChoice.tsx` | Panel 06 and the push through the laptop screen |
| `components/ProductStage.tsx` | Original product photo, virtual camera, rack focus, labels |
| `components/Guidance.tsx` | Understand → Choose → Get started |
| `components/Thread.tsx` | Every appearance of the orange line |
| `components/Closing.tsx` | Panel 11 line, end card (official logo, CTA) |
| `components/PendingPlate.tsx` | Labelled slate for unapproved stock (replace with `<OffthreadVideo>` per shot) |
| `lib/cornerPin.ts` | Homography → CSS `matrix3d` for screen compositing |
