"""Measure placement on the approved apparel sheets (source px) and write measure.json."""
import json, sys
import numpy as np
from PIL import Image
from scipy import ndimage as nd

src, out = sys.argv[1], sys.argv[2]
SHEETS = {'01': 'apparel_01_guard_rail.webp', '04': 'apparel_04_health_guard.webp', '06': 'apparel_06_one_care_system.webp'}
BG = np.array([254, 253, 250])
COLLAR_TO_HEM_CM = 78  # size L: ~74 cm HPS-to-hem + ~4 cm collar stand (typical; vendor spec governs)
res = {}
for key, f in SHEETS.items():
    a = np.asarray(Image.open(f'{src}/{f}').convert('RGB')).astype(int)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    lum = (3 * r + 6 * g + b) / 10
    core = nd.binary_opening(np.abs(a - BG).max(2) > (60 if key != '06' else 28), iterations=2)
    core[986:] = False
    m = {}
    for side, (x0, x1) in (('front', (0, 724)), ('back', (724, 1448))):
        c = core[:, x0:x1]
        xs = np.where(c[600])[0]
        mid = (xs.min() + xs.max()) / 2 + x0
        top = int(np.where(core[100:, int(mid)])[0][0] + 100)
        hem = int(np.where(core[:, int(mid)])[0][-1])
        rows = np.where(c[100:986].any(1))[0]
        area = int(nd.binary_fill_holes(c).sum())
        m[side] = dict(centre=float(mid), top=top, hem=hem, area=area)
    orange = (r > 170) & (g > 90) & (g < 180) & (b < 110) & (r - b > 100)
    orange[:200] = False
    orange[:, 724:] = False
    ys, xs = np.where(orange)
    m['front']['art'] = [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())]
    if key != '06':
        art = (lum > 120) | ((b - r > 80) & (b > 150))
    else:
        art = (lum < 140) | (r - b > 90) | (b - r > 60)
    y0, y1 = 250, 800
    sub = art[y0:y1, 880:1270]
    cols = np.where(sub.sum(0) > 2)[0] + 880
    rws = np.where(sub.sum(1) > 2)[0] + y0
    m['back']['art'] = [int(cols.min()), int(rws.min()), int(cols.max()), int(rws.max())]
    for side in ('front', 'back'):
        s = m[side]
        pxcm = (s['hem'] - s['top']) / COLLAR_TO_HEM_CM
        x0_, y0_, x1_, y1_ = s['art']
        s['pxcm'] = pxcm
        s['art_cm'] = dict(w=round((x1_ - x0_) / pxcm, 1), h=round((y1_ - y0_) / pxcm, 1),
                           top=round((y0_ - s['top']) / pxcm, 1), off=round(((x0_ + x1_) / 2 - s['centre']) / pxcm, 1))
        s['occupancy'] = round(100 * (x1_ - x0_) * (y1_ - y0_) / s['area'], 1)
        s['band'] = [round(100 * (y0_ - s['top']) / (s['hem'] - s['top'])), round(100 * (y1_ - s['top']) / (s['hem'] - s['top']))]
    res[key] = m
    print(key, {k: (v['art_cm'], v['occupancy'], v['band'], round(v['pxcm'], 2), v['centre']) for k, v in m.items()})
json.dump(res, open(out, 'w'), indent=1)
