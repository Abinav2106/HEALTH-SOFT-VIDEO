# Remotion motion-graphics project — agent guide

Videos here are React components rendered frame by frame by [Remotion](https://www.remotion.dev/docs) **4.0.539**
(React 19, TypeScript, Rspack bundler, npm). Read this file before changing anything, then use the official
Remotion Agent Skills in `.agents/skills/` (symlinked to `.claude/skills/`) for API details:
`remotion-best-practices` (router), `remotion-create`, `remotion-markup`, `remotion-studio`, `remotion-render`,
`remotion-captions`, `remotion-docs` (look up current docs), `remotion-upgrade`.

## Commands (run in this folder)

| Task | Command |
|---|---|
| Install dependencies | `npm install` |
| Preview in Remotion Studio | `npm run dev` → http://localhost:3000 (a composition: `/Showcase`) |
| New composition from template | `npm run new -- PromoVideo --seconds 8` |
| Render the sample to MP4 | `npm run render` → `out/showcase.mp4` |
| Render any composition | `npx remotion render <CompositionId> out/<name>.mp4` |
| Render one frame (visual check) | `npx remotion still <CompositionId> out/frame.png --frame=60` |
| Lint + typecheck | `npm run lint` |
| Add a Remotion package (version-matched) | `npx remotion add @remotion/<package>` |
| Upgrade Remotion + skills | `npm run upgrade` and `npx remotion skills update` |

Never `npm install` an `@remotion/*` package at a different version — always use `npx remotion add`.

## Layout

```
src/
  index.ts                 registerRoot — do not change
  Root.tsx                 registers every <Composition>; @new-composition markers used by `npm run new`
  config/video.ts          VIDEO {width, height, fps}, FORMATS presets, sec(seconds, fps)
  theme/theme.ts           COLORS, FONT (sizes for a 1920-wide frame), local Inter font loading
  lib/animation.ts         EASE, progress(), springIn(), mix(), stagger(), useScale(), clamp
  components/              reusable pieces: AnimatedText, Background, RevealLine, ShapeBadge, Counter
  compositions/
    Showcase/              sample: Showcase.tsx (TransitionSeries + sound), timeline.ts, schema.ts, scenes/
    Starter/               minimal template copied by `npm run new`
public/                    assets referenced with staticFile('…'): fonts/, audio/
tools/make_audio.py        regenerates the sample's original audio (`npm run audio`)
scripts/new-composition.mjs
out/                       render output (git-ignored)
```

## Golden rules (renders break or flicker if you ignore these)

1. **Animate only from the frame.** Use `useCurrentFrame()` with `interpolate()`, `spring()` or the helpers in
   `src/lib/animation.ts`. CSS `transition`/`animation`, Tailwind `animate-*`, `setTimeout`, `Date.now()` and
   `Math.random()` do not render correctly. For randomness use `random('seed')` from `remotion`.
2. **Time in seconds × fps.** Get `fps` from `useVideoConfig()` and write `1.2 * fps`, never hard-coded frame
   counts — then changing the frame rate keeps the timing. Use `sec(seconds, fps)` where an integer is needed.
3. **Size relative to the frame.** Design at 1920×1080 and multiply pixel sizes by `useScale()`, so the same
   scene works at 720p, 4K, square or vertical. Keep key content ≥ 80 px from the sides and ≥ 100 px from the top
   and bottom (at 1080 px). Minimum text sizes at 1920 wide: headline 96, supporting text 40 (`FONT.size`).
4. **Prefer the `scale`, `translate`, `rotate`, `opacity` and `filter` style properties** over building `transform`
   strings, and clamp interpolations (`clamp` from `lib/animation`).
5. **Assets live in `public/`** and are referenced with `staticFile('path')`. Fonts load through `@remotion/fonts`
   (see `theme/theme.ts`) so rendering waits for them; renders must not depend on a font CDN.
6. **Keep `useCurrentFrame()` in the smallest component that needs it** (see `SoundTrack`/`Bookends` in
   Showcase) so the rest of the tree doesn't re-render every frame.
7. Props must be JSON-serialisable. Use `type`, not `interface`, for props. Add a Zod `schema` so props are
   editable in the Studio and overridable with `--props`.
8. Users may edit files between prompts. If something changed unexpectedly, keep it — don't overwrite.

## Changing resolution, frame rate and duration

- **Everything at once:** edit `VIDEO` in `src/config/video.ts`.
- **One composition:** override `width`/`height`/`fps` on its `<Composition>` in `Root.tsx`, e.g.
  `width={FORMATS.vertical.width} height={FORMATS.vertical.height}`.
- **Duration:** the sample's scene lengths are in seconds in `compositions/Showcase/timeline.ts`
  (`showcaseDurationInFrames` derives the total, minus transition overlap). Template compositions use the
  `<NAME>_SECONDS` constant in their own file.
- After changing any of these, check the Studio and render a still — layouts scale through `useScale()`.

## Creating a new video or scene

1. `npm run new -- MyVideo --seconds 10` → edit `src/compositions/MyVideo/MyVideo.tsx`. It's already registered in
   `Root.tsx` and visible in the Studio at `/MyVideo`.
2. For multi-scene videos, give each scene its own component in `compositions/MyVideo/scenes/` and arrange them
   with `<TransitionSeries>` (see `Showcase.tsx`). Keep scene lengths (seconds) in a `timeline.ts` so the total
   duration and audio cues are computed from one place.
3. Inside a scene, frame 0 is the scene's own start — `<Sequence>`/`<TransitionSeries.Sequence>` shift time for
   their children. Note `useVideoConfig().durationInFrames` inside a sequence reports the *sequence* length; pass
   the full video length down as a prop if a scene needs it (see `StatsScene`).
4. Register stand-alone compositions directly in `Root.tsx` with inline `id`, `component`, `schema`,
   `width`, `height`, `fps`, `durationInFrames` and an inline `defaultProps` object literal (Studio can write
   edits back to it). Group with `<Folder name="…">`.

## Typography

- `<AnimatedText text="…" by="word" | "char" delay={0.2 * fps} stagger={0.1 * fps} />` — words rise, sharpen and
  fade in on springs; words never break mid-word. Put font size/weight on the parent element.
- Font: Inter variable (100–900) via `FONT.family`. To add a font, put the `.woff2` in `public/fonts/` and
  `loadFont({family, url: staticFile('fonts/…'), weight})` from `@remotion/fonts` (see the
  `remotion-markup` skill: `local-fonts.md`, `google-fonts.md`, `measuring-text.md`, `text-highlights.md`).
- Use `fontVariantNumeric: 'tabular-nums'` for changing numbers (`<Counter>` does this).
- Hierarchy: one thing to notice per scene; eyebrow → headline → supporting line; tight tracking on big text
  (`FONT.tracking.tight`), wide tracking on small caps (`FONT.tracking.wide`).

## Graphics and motion

- Vector shapes: `@remotion/shapes` (`Circle`, `Rect`, `Triangle`, `Star`, `Polygon`, `Pie`, …) — see
  `ShapeBadge` and `OutroScene`.
- Entrances: `springIn(frame, fps, delay, {damping, stiffness})` for organic motion (low damping = bouncier),
  `progress(frame, start, duration, EASE.out)` for precise eased moves; `EASE.inOut` between two rests,
  `EASE.in` for exits. Stagger groups with `stagger(i, 0.1 * fps, start)`.
- Keep backgrounds alive with slow continuous motion (`<Background drift={…}>`), but give the foreground the
  strongest movement.
- Scene transitions: `@remotion/transitions` — `fade()`, `slide({direction})`, `wipe()`, `flip()`,
  `clockWipe()` with `linearTiming({durationInFrames, easing})` or `springTiming()`. Each transition overlaps
  the two scenes, so subtract it from the total duration.

## Audio and synchronisation

- Use `<Audio>` from `@remotion/media` with `staticFile('audio/…')` (WAV/MP3/AAC). Put `name`, `from`,
  `volume`, `trimBefore`, `durationInFrames`, `loop` directly on it.
- **Sync by computing cue frames from the same constants the visuals use** — never type frame numbers by
  hand. In Showcase: whooshes land on `sceneStart(scene, fps)`, pops on the card entrance times exported by
  `FeaturesScene` (`FEATURE_CARD_TIMES`), the chime on `OUTRO_LOCK_TIME`. Change the timeline and the sound
  follows.
- Volume envelopes: `volume={interpolate(frame, [0, fps, end - 1.5 * fps, end - 1], [0, 0.55, 0.55, 0], clamp)}`.
- For music-driven cuts, place beats as seconds and convert with `sec()`; for audio-reactive visuals,
  captions or voiceover see the `remotion-markup` skill (`audio-visualization.md`, `sfx.md`, `voiceover.md`)
  and `remotion-captions`.
- The sample's sounds are generated by `tools/make_audio.py` (`npm run audio`, needs Python + numpy).

## Preview

- `npm run dev` starts the Studio at http://localhost:3000; open `/<CompositionId>` directly. Keep it running
  while you work — it hot-reloads. Press `s` in its terminal to reopen the browser.
- Props with a schema are editable in the right-hand panel; the Render button there renders with those props.

## Render

- `npx remotion render <id> out/<id>.mp4` (H.264, CRF 18, yuv420p — defaults in `remotion.config.ts`).
- Useful flags: `--props='{"title":"Hi"}'` (or a JSON file path), `--frames=0-89`, `--scale=0.5` (quick
  draft), `--codec=prores --prores-profile=4444` (alpha), `--muted`, `--concurrency=50%`.
- Stills for checks: `npx remotion still <id> out/f.png --frame=90`.
- Verify an export: `ffprobe -v error -show_entries stream=codec_type,width,height,r_frame_rate,nb_frames out/<id>.mp4`.
- Rendering uses Chrome Headless Shell, which Remotion downloads on first render. Where that download is
  blocked (sandboxes/CI), set `REMOTION_BROWSER_EXECUTABLE=/path/to/chrome-headless-shell`;
  `remotion.config.ts` picks it up (and auto-detects a Playwright headless shell in `/opt/pw-browsers`).

## Before you say "done"

1. `npm run lint` passes (ESLint with `@remotion/eslint-config-flat` + `tsc`).
2. The composition loads in the Studio and plays without errors.
3. Render stills at the key moments (each scene start, transitions, the last frame) and look at them.
4. If asked for a video file, render the MP4 and confirm resolution, fps and frame count with `ffprobe`.
