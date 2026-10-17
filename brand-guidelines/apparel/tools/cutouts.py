"""Cut garment fronts/backs out of the approved apparel sheets (pixels untouched; only the
sheet background becomes transparent), and make flat silhouettes for the size diagram."""
import json, sys
import numpy as np
from PIL import Image
from scipy import ndimage as nd

src, out = sys.argv[1], sys.argv[2]
SHEETS = {'01': 'apparel_01_guard_rail.webp', '04': 'apparel_04_health_guard.webp', '06': 'apparel_06_one_care_system.webp'}
BG = np.array([254, 253, 250])
SPLIT = 724  # front | back seam between the two garments on every sheet
origins = {}
for key, f in SHEETS.items():
    im = Image.open(f'{src}/{f}').convert('RGB')
    a = np.asarray(im).astype(int)
    d = np.abs(a - BG).max(2)
    core = nd.binary_fill_holes(nd.binary_opening(d > (60 if key != '06' else 16), iterations=2))
    lab, n = nd.label(core)
    sizes = nd.sum(core, lab, range(1, n + 1))
    garment = lab == (np.argmax(sizes) + 1)
    zone = nd.binary_dilation(garment, iterations=6)
    lo, hi = (8, 40) if key != '06' else (6, 22)
    alpha = np.clip((d - lo) / (hi - lo), 0, 1) * zone
    if key == '06':
        # sand is close to the sheet white: keep the cloth, drop the pale ground shadow under the hem
        cloth = nd.binary_fill_holes(nd.binary_opening(d > 24, iterations=2))
        cloth = nd.median_filter(cloth.astype('uint8'), size=9).astype(bool)
        keep = nd.gaussian_filter(nd.binary_dilation(cloth, iterations=1).astype(float), 1)
        keep[:880] = 1  # edges above the hem keep their soft render alpha
        alpha = alpha * keep
    alpha = np.maximum(alpha, garment * 1.0) if key != '06' else np.maximum(alpha, garment * keep)
    alpha[986:] = 0  # sheet captions (FRONT / BACK) start below the hem shadow
    rgba = np.dstack([a, (alpha * 255).astype(int)]).astype('uint8')
    for side, (x0, x1) in (('front', (0, SPLIT)), ('back', (SPLIT, 1448))):
        part = Image.fromarray(rgba[:, x0:x1])
        bb = part.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()
        part = part.crop(bb)
        part.save(f'{out}/polo{key}-{side}.png', optimize=True)
        origins[f'polo{key}-{side}'] = [bb[0] + x0, bb[1], part.size[0], part.size[1]]

# Flat silhouettes (from sheet 04, the cleanest navy render) for the M / L / XL diagram.
a = np.asarray(Image.open(f'{src}/{SHEETS["04"]}').convert('RGB')).astype(int)
core = nd.binary_fill_holes(nd.binary_opening(np.abs(a - BG).max(2) > 60, iterations=2))
lab, n = nd.label(core)
garment = lab == (np.argmax(nd.sum(core, lab, range(1, n + 1))) + 1)
garment = nd.median_filter(garment.astype('uint8'), size=17).astype(bool)  # smooth the rendered hem
for side, (x0, x1) in (('front', (0, SPLIT)), ('back', (SPLIT, 1448))):
    m = Image.fromarray((garment[:, x0:x1] * 255).astype('uint8'))
    bb = m.getbbox()
    m = m.crop(bb).resize(((bb[2] - bb[0]) * 2, (bb[3] - bb[1]) * 2), Image.LANCZOS)
    sil = Image.new('RGBA', m.size, (12, 32, 64, 0))
    sil.putalpha(m.point(lambda v: 255 if v > 127 else 0).filter(__import__('PIL.ImageFilter', fromlist=['x']).GaussianBlur(1.2)))
    sil.save(f'{out}/silhouette-{side}.png', optimize=True)
    origins[f'silhouette-{side}'] = [bb[0] + x0, bb[1], bb[2] - bb[0], bb[3] - bb[1]]
json.dump(origins, open(f'{out}/origins.json', 'w'), indent=1)
