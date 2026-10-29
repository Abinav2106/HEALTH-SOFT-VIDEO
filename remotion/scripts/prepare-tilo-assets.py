"""Derive the rear-view Tilo vector from the client's original aircraft sheet.

    python3 -I scripts/prepare-tilo-assets.py <tilo_aircraft_sheet.jpg>

The sheet is an 8 x 5 grid of 200 x 180 cells (1600 x 900). Row 2, column 5 is the
behind-and-above view (back of head, goggle strap, tail, full wings, propeller ahead).
The cell is only ~200 px and JPEG-compressed, so it is upscaled, snapped to the sheet's
own flat colours, keyed off its cream background and traced with vtracer. Nothing is
redrawn: shapes, proportions and colours come from the original pixels.

Writes (gitignored, client artwork): public/brand/gofloaters/tilo_rear.svg and .png
Requires: pip install pillow numpy vtracer
"""
import re
import sys
from collections import deque
from pathlib import Path

import numpy as np
import vtracer
from PIL import Image, ImageFilter

ROW, COL, CELL_W, CELL_H, INSET = 1, 4, 200, 180, 5
SCALE = 5

# Flat colours sampled from the sheet (index 0 is the background).
PALETTE = np.array(
    [
        (252, 245, 223),  # cream background
        (255, 255, 255),  # Tilo white
        (110, 196, 211),  # aircraft turquoise
        (247, 207, 102),  # propeller / seat yellow
        (232, 162, 52),  # goggle strap orange
        (24, 34, 44),  # outline ink
    ],
    dtype=float,
)


def classify(px: np.ndarray) -> np.ndarray:
    """Neutral pixels split by luminance (anti-aliased outline edges must not drift to
    turquoise); saturated pixels go to the nearest flat colour."""
    r, g, b = px[..., 0], px[..., 1], px[..., 2]
    sat = px.max(-1) - px.min(-1)
    lum = 0.299 * r + 0.587 * g + 0.114 * b
    dist = ((px[:, :, None, :] - PALETTE[None, None, :, :]) ** 2).sum(-1)
    dist[..., 1] = np.inf  # white is only reached through the neutral branch
    label = dist.argmin(-1)
    neutral = sat < 40
    label = np.where(neutral & (lum < 135), 5, label)
    label = np.where(neutral & (lum >= 135), np.where((b < 236) & (r > 238), 0, 1), label)
    return label.astype(np.uint8)


def snap_svg_fills(svg_path: Path) -> None:
    """vtracer averages colours per region; snap every fill back to the flat palette."""
    def snap(m: re.Match) -> str:
        c = np.array([int(m.group(1)[i : i + 2], 16) for i in (0, 2, 4)], dtype=float)
        best = PALETTE[1:][((PALETTE[1:] - c) ** 2).sum(-1).argmin()].astype(int)
        return 'fill="#%02X%02X%02X"' % tuple(best)

    svg_path.write_text(re.sub(r'fill="#([0-9A-Fa-f]{6})"', snap, svg_path.read_text()))


def main(sheet_path: str) -> None:
    out_dir = Path(__file__).resolve().parent.parent / 'public' / 'brand' / 'gofloaters'
    out_dir.mkdir(parents=True, exist_ok=True)

    sheet = Image.open(sheet_path).convert('RGB')
    if sheet.size != (1600, 900):
        raise SystemExit(f'expected the 1600x900 aircraft sheet, got {sheet.size}')
    x0, y0 = COL * CELL_W + INSET, ROW * CELL_H + INSET
    cell = sheet.crop((x0, y0, x0 + CELL_W - 2 * INSET, y0 + CELL_H - 2 * INSET))
    big = cell.resize((cell.width * SCALE, cell.height * SCALE), Image.LANCZOS)
    big = big.filter(ImageFilter.MedianFilter(5))

    px = np.asarray(big).astype(float)
    label = classify(px)
    label = np.asarray(Image.fromarray(label).filter(ImageFilter.ModeFilter(7)))

    # Background = cream (and the light anti-aliased rim, classified white) connected to the
    # border. Tilo's whites are enclosed by the ink outline, so the fill stops there.
    h, w = label.shape
    bg = np.zeros_like(label, dtype=bool)
    q = deque([(y, x) for y in (0, h - 1) for x in range(w)] + [(y, x) for x in (0, w - 1) for y in range(h)])
    while q:
        y, x = q.popleft()
        if bg[y, x] or label[y, x] > 1:
            continue
        bg[y, x] = True
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and not bg[ny, nx]:
                q.append((ny, nx))
    label = np.where((label == 0) & ~bg, 1, label)

    rgba = np.zeros((h, w, 4), dtype=np.uint8)
    rgba[:, :, :3] = PALETTE[label].astype(np.uint8)
    rgba[:, :, 3] = np.where(bg, 0, 255)

    # Trim to the artwork's bounding box with a small margin.
    ys, xs = np.where(~bg)
    m = 6
    rgba = rgba[max(ys.min() - m, 0) : ys.max() + m, max(xs.min() - m, 0) : xs.max() + m]
    png_path = out_dir / 'tilo_rear.png'
    Image.fromarray(rgba).save(png_path)

    svg_path = out_dir / 'tilo_rear.svg'
    vtracer.convert_image_to_svg_py(
        str(png_path),
        str(svg_path),
        colormode='color',
        hierarchical='stacked',
        mode='spline',
        filter_speckle=24,
        color_precision=8,
        layer_difference=8,
        corner_threshold=60,
        length_threshold=4.0,
        max_iterations=10,
        splice_threshold=45,
        path_precision=2,
    )
    snap_svg_fills(svg_path)
    print(f'wrote {svg_path} and {png_path} ({rgba.shape[1]}x{rgba.shape[0]})')


if __name__ == '__main__':
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    main(sys.argv[1])
