"""Split the supplied GoFloaters logo raster into registered animation layers.

Nothing is redrawn: every layer is the source's own pixels, with the flat
background removed (colour-to-alpha against the measured background value).
All layers keep the full 2000x667 source canvas so they stay in register.

    python3 -I gofloaters/tools/extract_layers.py <logo.webp> <out_dir>

Writes symbol.png (dog + aircraft), speedlines.png, wordmark.png,
tagline.png, propeller_mask.png and layers.json (measurements used by the
Remotion composition). Checks that the layers re-composite to the source.
"""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

src_path, out_dir = Path(sys.argv[1]), Path(sys.argv[2])
out_dir.mkdir(parents=True, exist_ok=True)

rgb = np.asarray(Image.open(src_path).convert("RGB")).astype(np.float64)
H, W, _ = rgb.shape

# Flat background value, measured on the border.
border = np.concatenate([rgb[:8].reshape(-1, 3), rgb[-8:].reshape(-1, 3), rgb[:, :8].reshape(-1, 3), rgb[:, -8:].reshape(-1, 3)])
BG = float(np.median(border))

# Background = near-white region connected to the image border. The dog's white
# body is enclosed by its outline, so it is not connected and stays opaque.
near_white = rgb.min(axis=2) >= BG - 14
lab, _ = ndimage.label(near_white)
edge_labels = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
bg = np.isin(lab, edge_labels[edge_labels > 0])
# Letter counters (o, a, e, p ...) are enclosed too, but in the type they are background.
TEXT_X = 950
text_labels = np.unique(lab[:, TEXT_X:])
bg |= np.isin(lab, text_labels[text_labels > 0]) & (np.arange(W)[None, :] >= TEXT_X)

# Colour-to-alpha (against BG) on the background and a thin band into the ink,
# which carries the anti-aliased edges. Everything else stays fully opaque.
band = ndimage.binary_dilation(bg, iterations=3)
a_ctoa = np.clip(((BG - rgb) / BG).max(axis=2), 0.0, 1.0)
alpha = np.where(band, a_ctoa, 1.0)
alpha[alpha < 0.02] = 0.0
with np.errstate(divide="ignore", invalid="ignore"):
    unmixed = BG - (BG - rgb) / alpha[..., None]
color = np.where(band[..., None], np.nan_to_num(unmixed), rgb)
color = np.clip(color, 0, 255)

# Group pixels into parts: label solid ink, then give soft edge pixels to the
# nearest solid component.
solid = alpha > 0.5
comp, n = ndimage.label(solid, structure=np.ones((3, 3)))
_, (iy, ix) = ndimage.distance_transform_edt(~solid, return_indices=True)
comp_all = np.where(alpha > 0, comp[iy, ix], 0)

objs = ndimage.find_objects(comp)
part_of = {}
for i, sl in enumerate(objs, start=1):
    y0, y1, x0, x1 = sl[0].start, sl[0].stop, sl[1].start, sl[1].stop
    h, w = y1 - y0, x1 - x0
    if x1 <= 430 and h <= 30 and w >= 40:
        part_of[i] = "speedlines"
    elif x0 >= 950 and y1 <= 395:
        part_of[i] = "wordmark"
    elif x0 >= 950:
        part_of[i] = "tagline"
    elif x1 < 950:
        part_of[i] = "symbol"
    else:
        raise SystemExit(f"unclassified component {i}: x {x0}-{x1} y {y0}-{y1}")

parts = {}
for name in ["symbol", "speedlines", "wordmark", "tagline"]:
    ids = [i for i, p in part_of.items() if p == name]
    m = np.isin(comp_all, ids)
    parts[name] = m
    rgba = np.zeros((H, W, 4), np.uint8)
    rgba[..., :3] = np.round(color).astype(np.uint8)
    rgba[..., 3] = np.round(np.where(m, alpha, 0) * 255).astype(np.uint8)
    rgba[~m] = 0
    Image.fromarray(rgba, "RGBA").save(out_dir / f"{name}.png", optimize=True)

n_lines = len([1 for p in part_of.values() if p == "speedlines"])
if n_lines != 5:
    raise SystemExit(f"expected five speed lines, found {n_lines}")


def bbox(mask):
    ys, xs = np.nonzero(mask)
    return [int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1]


# Speed lines, top to bottom, with their centre rows.
lines = []
for i, p in part_of.items():
    if p == "speedlines":
        x0, y0, x1, y1 = bbox(comp == i)
        lines.append({"x0": x0, "x1": x1, "y": (y0 + y1) / 2, "h": y1 - y0})
lines.sort(key=lambda d: d["y"])
# The route continues the line that trails furthest behind the aircraft.
lead = min(lines, key=lambda d: d["x0"])

# Where the route attaches: the tail of the aircraft on that line's row.
sym = parts["symbol"] & (alpha > 0.5)
row = int(round(lead["y"]))
tail_x = int(np.nonzero(sym[row - 2 : row + 3].any(axis=0))[0].min())
nose_x = bbox(sym)[2]

# Propeller disc: the yellow pixels at the nose.
yellow = (rgb[..., 0] > 200) & (rgb[..., 1] > 180) & (rgb[..., 2] < 160)
yellow[:, : nose_x - 120] = False
yellow = ndimage.binary_opening(yellow, iterations=1)
plab, _ = ndimage.label(yellow)
sizes = ndimage.sum(yellow, plab, range(1, plab.max() + 1))
prop = plab == (int(np.argmax(sizes)) + 1)
prop = ndimage.binary_fill_holes(prop)
pm = np.zeros((H, W, 4), np.uint8)
pm[..., :3] = 255
pm[..., 3] = (ndimage.gaussian_filter(prop.astype(float), 0.7) * 255).astype(np.uint8)
Image.fromarray(pm, "RGBA").save(out_dir / "propeller_mask.png", optimize=True)

# Round trip: the layers over the measured background must give back the source.
comp_rgb = np.full((H, W, 3), BG)
for name in parts:
    lay = np.asarray(Image.open(out_dir / f"{name}.png")).astype(np.float64)
    a = lay[..., 3:4] / 255
    comp_rgb = comp_rgb * (1 - a) + lay[..., :3] * a
err = np.abs(comp_rgb - rgb)

meta = {
    "source": src_path.name,
    "width": W,
    "height": H,
    "background": round(BG),
    "symbolBox": bbox(parts["symbol"] & (alpha > 0.1)),
    "speedLinesBox": bbox(parts["speedlines"] & (alpha > 0.1)),
    "wordmarkBox": bbox(parts["wordmark"] & (alpha > 0.1)),
    "taglineBox": bbox(parts["tagline"] & (alpha > 0.1)),
    "artBox": bbox(alpha > 0.1),
    "propellerBox": bbox(prop),
    "speedLines": lines,
    "routeRowY": lead["y"],
    "lineWeight": float(np.median([l["h"] for l in lines])),
    "tailX": tail_x,
    "noseX": nose_x,
    "roundTrip": {"meanAbs": round(float(err.mean()), 4), "max": round(float(err.max()), 2)},
}
(out_dir / "layers.json").write_text(json.dumps(meta, indent=2) + "\n")
print(json.dumps(meta, indent=2))
