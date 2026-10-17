"""Blank base garments for the size diagram: the approved 01 navy polo with its artwork lifted
(fabric filled from the surrounding cloth). Used only under the fixed-size artwork on page 04."""
import json, sys
import numpy as np
from PIL import Image
from scipy import ndimage as nd

assets, measure = sys.argv[1], json.load(open(sys.argv[2]))
O = json.load(open(f'{assets}/origins.json'))


def fill(rgba, box, pad, sigma, tex_from):
    a = rgba[..., :3].astype(float)
    hole = np.zeros(a.shape[:2], bool)
    x0, y0, x1, y1 = box
    hole[max(0, y0 - pad):y1 + pad, max(0, x0 - pad):x1 + pad] = True
    w = (~hole & (rgba[..., 3] > 250)).astype(float)
    smooth = np.zeros_like(a)
    done = np.zeros(a.shape[:2], bool)
    for sg in (sigma, sigma * 2, sigma * 4, sigma * 8):  # widen until every hole pixel has support
        den = nd.gaussian_filter(w, sg)
        est = np.dstack([nd.gaussian_filter(a[..., i] * w, sg) for i in range(3)]) / np.maximum(den, 1e-6)[..., None]
        ok = (den > 0.15) & ~done
        smooth[ok] = est[ok]
        done |= ok
    smooth[~done] = est[~done]
    # fabric grain: high-pass of a clean patch, tiled over the hole
    tx0, ty0 = tex_from
    hh, ww = hole.sum(0).max(), hole.sum(1).max()
    patch = a[ty0:ty0 + 120, tx0:tx0 + 120]
    grain = patch - np.dstack([nd.gaussian_filter(patch[..., i], 4) for i in range(3)])
    reps = (int(np.ceil(a.shape[0] / 120)), int(np.ceil(a.shape[1] / 120)), 1)
    grain = np.tile(grain, reps)[:a.shape[0], :a.shape[1]]
    soft = nd.gaussian_filter(hole.astype(float), 3)
    out = a * (1 - soft[..., None]) + (smooth + grain) * soft[..., None]
    rgba[..., :3] = np.clip(out, 0, 255).astype('uint8')
    return rgba


for side, pad, sigma, tex in (('back', 14, 30, (200, 600)), ('front', 6, 8, (220, 480))):
    ox, oy, _, _ = O[f'polo01-{side}']
    rgba = np.asarray(Image.open(f'{assets}/polo01-{side}.png')).copy()
    x0, y0, x1, y1 = measure['01'][side]['art']
    rgba = fill(rgba, (x0 - ox, y0 - oy, x1 - ox, y1 - oy), pad, sigma, tex)
    Image.fromarray(rgba).save(f'{assets}/blank01-{side}.png', optimize=True)
    print('blank', side)
