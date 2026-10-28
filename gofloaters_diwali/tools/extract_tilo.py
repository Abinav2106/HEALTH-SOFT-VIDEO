"""Cut Tilo, the aircraft and the speed lines out of the official GoFloaters logo.

Nothing is redrawn. Every pixel keeps the colour class it has in the source logo;
the only processing is a palette-aware upscale (soft class masks -> bicubic ->
light smoothing -> argmax) so the outline stays crisp in the extreme close-up.

Outputs (assets/brand/, not committed):
  tilo_full.png      mascot + aircraft, transparent, SCALE x source pixels
  speedlines.png     the four logo speed dashes, same scale and origin
  tilo_rig.json      measured pivots: eye, pupil, nose, propeller disc, seat
"""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "assets/brand/gofloaters_logo_original.webp"
OUT = ROOT / "assets/brand"
SCALE = 6

# Ink + flat fills, sampled from the source logo. The art is black outline over
# flat fills, so every pixel is unmixed as  t * fill + (1 - t) * black.
PALETTE = {
    "black": (0, 0, 0),
    "white": (254, 254, 254),
    "orange": (232, 122, 44),
    "turquoise": (100, 200, 220),
    "yellow": (254, 226, 96),
}
FILLS = np.array(list(PALETTE.values())[1:], float)


def unmix(rgb, fg, bg):
    """Soft class memberships (H x W x 5) and coverage alpha for ink art."""
    p = rgb.astype(float)
    dot = (p[:, :, None, :] * FILLS[None, None]).sum(-1)
    t = np.clip(dot / (FILLS**2).sum(-1)[None, None], 0, 1)
    res = ((p[:, :, None, :] - t[..., None] * FILLS[None, None]) ** 2).sum(-1)
    best = res.argmin(-1)
    tb = np.take_along_axis(t, best[..., None], -1)[..., 0]
    memb = np.zeros(p.shape[:2] + (len(PALETTE),))
    memb[..., 0] = 1 - tb
    np.put_along_axis(memb[..., 1:], best[..., None], tb[..., None], -1)
    # silhouette band: pixels touching the background are ink over paper
    band = fg & ndimage.binary_dilation(bg, iterations=2)
    t_white = t[..., 0]
    alpha = fg.astype(float)
    alpha[band] = 1 - t_white[band]
    memb[band] = 0
    memb[band, 0] = 1
    memb[~fg] = 0
    return memb, alpha


def upscale_layers(rgb, fg, bg, scale):
    """Return (labels, alpha) at `scale` x resolution."""
    memb, alpha = unmix(rgb, fg, bg)
    h, w = fg.shape

    def up(a):
        im = Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8))
        a = np.asarray(im.resize((w * scale, h * scale), Image.BICUBIC), float) / 255
        return ndimage.gaussian_filter(a, scale * 0.4)

    labels = np.stack([up(memb[..., k]) for k in range(memb.shape[-1])], -1).argmax(-1)
    # Unmixing slivers (e.g. yellow where orange meets ink) -> nearest real neighbour
    min_area = (scale * 4) ** 2
    for k in range(2, len(PALETTE)):
        comp, n = ndimage.label(labels == k)
        if n == 0:
            continue
        areas = ndimage.sum(np.ones_like(comp), comp, range(1, n + 1))
        for i in np.where(areas < min_area)[0] + 1:
            blob = comp == i
            ring = ndimage.binary_dilation(blob, iterations=2) & ~blob
            labels[blob] = np.bincount(labels[ring], minlength=len(PALETTE)).argmax()
    # anti-aliased silhouette: narrow smoothstep around the half-coverage contour
    alpha = np.clip((up(alpha) - 0.5) / 0.14 + 0.5, 0, 1)
    return labels, alpha


def render(labels, alpha):
    cols = np.array(list(PALETTE.values()), np.uint8)
    return Image.fromarray(np.dstack([cols[labels], (alpha * 255).astype(np.uint8)]), "RGBA")


def main():
    src = np.asarray(Image.open(SRC).convert("RGB")).astype(int)
    H, W, _ = src.shape
    light = src.min(-1) > 225
    # background = light pixels connected to the image border
    lab, _ = ndimage.label(light)
    border = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    bg = np.isin(lab, border[border > 0])
    fg = ~bg

    comp, n = ndimage.label(fg)
    sizes = ndimage.sum(np.ones_like(comp), comp, range(1, n + 1))
    # mascot = the largest component left of the wordmark
    left = comp.copy()
    left[:, 950:] = 0
    lsizes = ndimage.sum(np.ones_like(left), left, range(1, n + 1))
    mascot_id = int(np.argmax(lsizes)) + 1
    mascot = comp == mascot_id
    ys, xs = np.where(mascot)
    mx0, mx1, my0, my1 = xs.min(), xs.max(), ys.min(), ys.max()

    speed = np.zeros_like(fg)
    for i in range(1, n + 1):
        if i == mascot_id or sizes[i - 1] < 40:
            continue
        cy, cx = ndimage.center_of_mass(comp == i)
        if cx < mx0 + 160 and cy > my0 + 150:
            speed |= comp == i

    pad = 8
    # common origin for mascot + speed lines
    sys_ = np.where(speed)
    ox0 = min(mx0, sys_[1].min()) - pad
    ox1, oy0 = mx1 + pad, my0 - pad
    oy1 = max(my1, sys_[0].max()) + pad
    crop = (slice(oy0, oy1), slice(ox0, ox1))

    for name, mask in (("tilo_full", mascot), ("speedlines", speed)):
        labels, alpha = upscale_layers(src[crop], mask[crop], bg[crop], SCALE)
        render(labels, alpha).save(OUT / f"{name}.png", optimize=True)

    # The end card uses the untouched logo file on a white plate, so only its
    # bounding box is measured here.
    fys, fxs = np.where(fg)

    # ---- rig measurements (source px, relative to the tilo_full origin) ----
    def rel(x, y):
        return [round(float(x - ox0), 2), round(float(y - oy0), 2)]

    yellow = (np.abs(src - np.array(PALETTE["yellow"])).sum(-1) < 90) & mascot
    ylab, yn = ndimage.label(yellow)
    ysz = ndimage.sum(np.ones_like(ylab), ylab, range(1, yn + 1))
    # propeller disc = the yellow blob furthest right
    cands = [(ndimage.center_of_mass(ylab == i)[1], i) for i in range(1, yn + 1) if ysz[i - 1] > 300]
    prop_id = max(cands)[1]
    pys, pxs = np.where(ndimage.binary_dilation(ylab == prop_id, iterations=4))
    prop = {
        "cx": rel((pxs.min() + pxs.max()) / 2, 0)[0],
        "cy": rel(0, (pys.min() + pys.max()) / 2)[1],
        "rx": float(pxs.max() - pxs.min()) / 2,
        "ry": float(pys.max() - pys.min()) / 2,
    }

    # eye: white blob enclosed by the orange goggle ring, near the head
    orange = (np.abs(src - np.array(PALETTE["orange"])).sum(-1) < 120) & mascot
    oys, oxs = np.where(orange[:260])
    white_in = (src.min(-1) > 225) & ~bg
    wl, wn = ndimage.label(white_in)
    best = None
    for i in range(1, wn + 1):
        cy, cx = ndimage.center_of_mass(wl == i)
        if abs(cx - 653) < 25 and abs(cy - 152) < 25:
            size = (wl == i).sum()
            if best is None or size > best[0]:
                best = (size, i)
    eye = wl == best[1]
    eys, exs = np.where(ndimage.binary_fill_holes(eye))
    eye_c = ((exs.min() + exs.max()) / 2, (eys.min() + eys.max()) / 2)
    eye_r = max(exs.max() - exs.min(), eys.max() - eys.min()) / 2
    dark = (src.max(-1) < 90) & ndimage.binary_fill_holes(eye) & ~eye
    dys, dxs = np.where(dark)
    pupil = ((dxs.min() + dxs.max()) / 2, (dys.min() + dys.max()) / 2,
             max(dxs.max() - dxs.min(), dys.max() - dys.min()) / 2)

    rig = {
        "source": SRC.name,
        "scale": SCALE,
        "origin_in_logo": [int(ox0), int(oy0)],
        "size_src": [int(ox1 - ox0), int(oy1 - oy0)],
        "mascot_bbox_src": [int(mx0 - ox0), int(my0 - oy0), int(mx1 - ox0), int(my1 - oy0)],
        "eye": {"c": rel(*eye_c), "r": round(float(eye_r), 2)},
        "pupil": {"c": rel(pupil[0], pupil[1]), "r": round(float(pupil[2]), 2)},
        "propeller": prop,
        "nose": rel(*(lambda b: ((b[1].min() + b[1].max()) / 2, (b[0].min() + b[0].max()) / 2))(
            np.where((src.max(-1) < 70) & mascot & (np.arange(W)[None, :] > 700) & (np.arange(H)[:, None] < 200)))),
        "seat": rel(560, 420),
        "logo_full_bbox_src": [int(fxs.min() - pad), int(fys.min() - pad), int(fxs.max() + pad), int(fys.max() + pad)],
        "orange_bbox_src": [int(oxs.min() - ox0), int(oys.min() - oy0), int(oxs.max() - ox0), int(oys.max() - oy0)],
    }
    (OUT / "tilo_rig.json").write_text(json.dumps(rig, indent=2))
    print(json.dumps(rig, indent=2))


if __name__ == "__main__":
    sys.exit(main())
