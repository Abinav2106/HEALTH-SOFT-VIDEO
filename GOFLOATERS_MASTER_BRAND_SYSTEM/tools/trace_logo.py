"""Colour-separated vector reconstruction of the GoFloaters logo.

Reads the supplied 2000x667 PNG, upsamples 2x, classifies every pixel into one of
the logo's source colours, and traces each colour plate with potrace
(potracer, a pure-Python port). Output: tools/build/trace_layers.json holding
SVG path data in the ORIGINAL 2000x667 coordinate space.
"""
import json, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
import potrace

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SRC = os.path.join(ROOT, '01_SOURCE_REFERENCE/original_logo/gofloaters_original_logo.png')
OUT = os.path.join(HERE, 'build'); os.makedirs(OUT, exist_ok=True)
S = 2  # supersample factor

# Source-sampled colours (median of eroded colour regions, see source_audit)
PROTO = {
    'black':  (4, 5, 6),
    'white':  (254, 254, 254),
    'turq':   (110, 208, 224),
    'yellow': (252, 225, 98),
    'orange': (241, 123, 42),
    'gray':   (107, 107, 108),
}

def classify(im):
    """Antialias-aware classification.

    Every edge pixel is modelled as a blend of black ink and one light colour
    (p = a*C + (1-a)*K). The light colour with the smallest blend residual wins;
    the pixel is ink when the blend weight a < 0.5. This stops grey edge pixels
    being mistaken for turquoise or orange specks.
    """
    H, W, _ = im.shape
    yy, xx = np.mgrid[0:H, 0:W]
    K = np.array(PROTO['black'], float)
    lights = ['white', 'turq', 'yellow', 'orange', 'gray']
    tag = (xx > 960 * S) & (yy > 395 * S)
    sym = xx < 920 * S
    allowed = {'white': np.ones((H, W), bool), 'gray': tag,
               'turq': sym, 'yellow': sym, 'orange': sym}
    best_r = np.full((H, W), 1e12); best_i = np.zeros((H, W), int); best_a = np.zeros((H, W))
    q = im - K
    for i, n in enumerate(lights):
        v = np.array(PROTO[n], float) - K
        a = np.clip((q @ v) / (v @ v), 0, 1)
        r = ((q - a[..., None] * v) ** 2).sum(-1)
        r = np.where(allowed[n], r, 1e12)
        upd = r < best_r
        best_r[upd] = r[upd]; best_i[upd] = i; best_a[upd] = a[upd]
    ink = best_a < 0.5
    # in the tagline band the grey type is the ink: grey vs white decided by blend
    out = {'black': ink & ~tag}
    for i, n in enumerate(lights):
        out[n] = (best_i == i) & ~ink
    g = np.array(PROTO['gray'], float); w = np.array(PROTO['white'], float)
    t = np.clip(((im - w) @ (g - w)) / ((g - w) @ (g - w)), 0, 1)
    out['gray'] = tag & (t >= 0.5)
    out['white'] = out['white'] & ~out['gray']
    return out

def clean(mask, min_area):
    lab, n = ndi.label(mask)
    if n == 0:
        return mask
    sizes = ndi.sum(mask, lab, range(1, n + 1))
    keep = np.zeros(n + 1, bool); keep[1:] = sizes >= min_area
    return keep[lab]

def trace(mask, turd=6, alpha=1.0, opt=0.25):
    bm = potrace.Bitmap(~mask.astype(bool))  # potracer inverts its input
    path = bm.trace(turdsize=turd, turnpolicy=potrace.POTRACE_TURNPOLICY_MINORITY,
                    alphamax=alpha, opticurve=True, opttolerance=opt)
    f = lambda p: f'{p.x / S:.2f},{p.y / S:.2f}'
    out = []
    for curve in path:
        d = ['M' + f(curve.start_point)]
        for seg in curve.segments:
            if seg.is_corner:
                d.append('L' + f(seg.c) + 'L' + f(seg.end_point))
            else:
                d.append('C' + f(seg.c1) + ' ' + f(seg.c2) + ' ' + f(seg.end_point))
        d.append('Z')
        out.append(''.join(d))
    return out

def main():
    src = Image.open(SRC).convert('RGB')
    W, H = src.size
    im = np.array(src.resize((W * S, H * S), Image.LANCZOS)).astype(float)
    m = classify(im)
    ink = m['black'] | m['turq'] | m['yellow'] | m['orange']
    # background = non-ink region connected to the canvas border
    lab, n = ndi.label(~ink)
    border = set(np.unique(np.r_[lab[0], lab[-1], lab[:, 0], lab[:, -1]])) - {0}
    bg = np.isin(lab, list(border))
    yy, xx = np.mgrid[0:H * S, 0:W * S]
    symbol = xx < 920 * S
    # enclosed white inside the symbol = mascot / artwork white; in the wordmark
    # region enclosed white are letter counters, i.e. background
    silhouette = symbol & ~bg
    # Enclosed background pockets: the gap between the two forelegs above the
    # fuselage reads as background, so it stays transparent on dark grounds.
    for px, py in [(651, 325)]:
        pocket = lab == lab[py * S, px * S]
        silhouette &= ~pocket
    layers = {}
    # Underlay plates are dilated by 1px so they meet the outline without hairline gaps
    dil = lambda a, k=2: ndi.binary_dilation(a, iterations=k)
    # white plate = white-only interior; colour plates sit beside it, all meeting under the ink
    interior = silhouette & ~m['black'] & ~clean(m['turq'], 400) & ~clean(m['yellow'], 400) & ~clean(m['orange'], 400)
    layers['white'] = trace(dil(interior, 2) & silhouette)
    # proposed extension: sticker keyline for dark grounds (12px at source scale)
    layers['keyline'] = trace(ndi.binary_closing(dil(silhouette, 12 * S), iterations=6 * S) & symbol, turd=50, opt=0.5)
    layers['turq'] = trace(dil(clean(m['turq'], 400), 2) & silhouette)
    layers['yellow'] = trace(dil(clean(m['yellow'], 400), 2) & silhouette)
    layers['orange'] = trace(dil(clean(m['orange'], 400), 1) & silhouette)
    blk = m['black']
    layers['black_symbol'] = trace(blk & symbol, turd=4)
    word = (~symbol) & (yy < 395 * S)
    layers['black_wordmark'] = trace(blk & word, turd=4)
    layers['gray_tagline'] = trace(m['gray'] & (~symbol), turd=4)
    meta = {'width': W, 'height': H, 'colors': {k: '#%02X%02X%02X' % v for k, v in PROTO.items()},
            'counts': {k: len(v) for k, v in layers.items()}}
    json.dump({'meta': meta, 'layers': layers}, open(os.path.join(OUT, 'trace_layers.json'), 'w'))
    print(meta)

if __name__ == '__main__':
    main()
