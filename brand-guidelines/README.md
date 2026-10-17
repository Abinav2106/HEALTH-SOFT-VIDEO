# Healthsoft — Master Brand Guidelines v1.0

45-page landscape A4 brand book: strategy, logo system, colour, typography, voice, messaging,
photography, graphic language, grid, the three products, the one-care-system graphic,
20 applications and a QA checklist.

The PDF is generated from `build.py` (page source) and `style.css`, rendered by headless Chromium.
Client artwork and the rendered PDF are not committed (public repository) — see `source/README.md`.

## Build

```bash
./build.sh          # → out/Healthsoft_Brand_Guidelines_v1.0.pdf
./build.sh --png    # also writes out/png/pNN.png page previews for QC
```

Needs Python 3 + Pillow, Node with Playwright (Chromium). Set `PLAYWRIGHT_MODULE` if Playwright
is not installed globally.

## What the build does with client artwork

- `tools/logo_variants.py` — makes the orange, navy, white and black versions and the symbol /
  wordmark / tagline crops by remapping ink coverage of the official logo raster. Nothing is redrawn.
- `tools/product_plates.py` — cuts feathered product images from the approved Apparel Collection V3
  sheets. Product geometry and colour are untouched; only stray connector-arc pixels next to two
  products are painted out.

## Working assumptions flagged inside the document

- Orange `#EC8D1F` is measured from the logo; navy `#0C2040` comes from the brief. CMYK values are
  mathematical conversions. All values need a proof against the vector master before manufacture.
- The horizontal lockup and the secondary colours (Sand, Navy 70, Orange Tint) are proposed for approval.
- Human photography frames (PH-xx) are composition briefs: no approved human photography was supplied.
- Apparel placement figures (50 mm front symbol, 260 mm back block) are starting specifications for
  a sew-out / print test.
- Contact details on stationery are placeholders.
