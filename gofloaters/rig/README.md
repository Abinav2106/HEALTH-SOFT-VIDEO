# Tilo mascot rig (GoFloaters) for Adobe After Effects

This is a production rig of the GoFloaters dog-and-airplane mascot, built from the supplied `GoFloaters_Logo_Vector.svg`. The rig itself, and how to animate it, are covered in [CONTROL_GUIDE.md](CONTROL_GUIDE.md).

## Deliverables

| Path | What it is |
|---|---|
| `ae/GoFloaters_Tilo_Rig_Builder.jsx` | Self-contained After Effects builder (ExtendScript). Run it with **File › Scripts › Run Script File…** and keep the `assets` folder next to it. It creates the project folders, the clean `Tilo_Rig` comp and the `Tilo_Acting_Test` comp with every control keyframed and captioned. All artwork comes in as native, editable shape layers. |
| `ae/assets/Tilo_reference.png` | The original logo artwork, imported by the builder as a hidden guide layer that registers with the rig. |
| `vectors/parts/NN_<Layer>.svg` | One SVG per rig layer, all on the same frame so they register. `NN` is the paint order (01 = back). |
| `vectors/Tilo_layered.svg` | All layers in one file, one named group (Inkscape layer) per rig layer. Opens in Illustrator and Inkscape. |
| `vectors/Tilo_pivots_guide.svg`, `vectors/manifest.json` | Pivot positions, parents and paint order. |
| `guide/*.png`, `Tilo_Control_Guide.pdf` | Images and PDF of the control guide. |
| `Tilo_Acting_Test_preview.mp4` | 33 s acting test (1920×1080, 30 fps). Each control in turn, then all together. |

The builder, vectors, guide images and video contain the client's artwork, so they are **not committed** (this repository is public). `build_rig.sh` regenerates all of them from the supplied SVG in `remotion/public/brand/`.

## Rebuild

```bash
pip install shapely svgpathtools svgelements numpy markdown  # Python 3.11+
cd gofloaters/rig && ./build_rig.sh                          # needs Node 22 + the pre-installed Chromium/Playwright
```

The pipeline:

1. `tools/parts.py` flattens the trace, cuts it into parts, rebuilds hidden artwork and writes `build/rig_parts.json`.
2. `tools/rig_spec.mjs` is the single source for controls, hierarchy, pivots and every expression.
3. `tools/make_jsx.mjs` writes the builder.
4. `tools/preview.mjs` evaluates the same expressions to render the acting test and pose sheets.
5. `tools/test_jsx.mjs` dry-runs the builder.

## What was tested, and what was not

After Effects was **not available** in this environment: the Higgsfield After Effects bridge reported no connected host. So no native `.aep` was produced, and the builder has **not been run inside After Effects**. What was verified:

1. **ES3 syntax:** the builder parses as ECMAScript 3, the dialect ExtendScript runs (acorn).
2. **Dry run against a strict mock of the After Effects scripting DOM** (`tools/test_jsx.mjs`):
   - Every `property()` and `addProperty()` match name is checked against the parent it is called on.
   - Enum and colour values, shapes and keyframe and ease arguments are validated, and parenting cycles are rejected.
   - The run completed with no errors and no alerts. It created both comps, 35 layers in `Tilo_Rig` and 110 control keyframes plus 13 captions in `Tilo_Acting_Test`.
3. **Every expression compiles** as JavaScript. The builder switches the project to the JavaScript expression engine.
4. **Round trip:** the rig was rebuilt from what the mock project contains and rendered with the preview evaluator. It is pixel-identical (0 differing pixels) to the spec render at rest, while pointing, and while banking with the propeller spinning and the tail wagging.
5. **Rest pose matches the logo:** at default settings the full rig, with all expressions, renders against the supplied SVG at 1.6× scale with only about 1.6k pixels above a 60-level difference, out of 2.07M. Those are anti-aliasing and the trace pin-holes the rig closes.
6. **Stress poses** at the documented range limits, on a tinted background so holes show. See `guide/` and the acting test.

The preview runtime implements the subset of the expression API the rig uses: `thisComp.layer().effect()(1)` with `.value`/`.valueAtTime()`, `transform.*` with `valueAtTime`, `thisProperty.points()/inTangents()/outTangents()/isClosed()`, `createPath()`, `time` and `thisComp.frameDuration`. **The acting-test video comes from that preview runtime, not from After Effects.** Its motion blur (8 sub-frame samples, 180° shutter) and its Directional Blur approximation will differ slightly from After Effects' own. Not verified in After Effects:

- How the Directional Blur and motion blur actually look.
- The default font of the caption text layer.
- Expression evaluation speed.
- Behaviour on versions older than After Effects 2019 (16.0).

## Notes on the source

- The supplied SVG says it is a raster-derived reconstruction, not the brand master. Its outlines are gaps between colour fills over one ink silhouette. The rig keeps that artwork, rebuilds what joints uncover, and closes the trace's pin-holes; on non-white backgrounds those showed as specks.
- The eyelids are new artwork (the logo has none), drawn in the dog's white with an ink edge and kept inside the goggles.
