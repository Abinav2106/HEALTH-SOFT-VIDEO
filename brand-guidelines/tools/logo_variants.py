"""Derive one-colour logo versions from the official raster by remapping ink coverage.
No redrawing: every output pixel's coverage comes from the original artwork."""
import sys
from PIL import Image
src, out = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGB')
W, H = im.size
SCALE = 4
big = im.resize((W*SCALE, H*SCALE), Image.LANCZOS)
ORANGE = (236, 141, 31)
def coverage(p):
    # 0 = white paper, 1 = full Healthsoft orange; use the blue channel (orange 31 vs white 255)
    return max(0.0, min(1.0, (255 - p[2]) / (255 - ORANGE[2])))
cov = Image.new('L', big.size)
cov.putdata([int(round(coverage(p)*255)) for p in big.getdata()])
def colour(rgb, name, box=None):
    layer = Image.new('RGBA', big.size, rgb + (0,))
    layer.putalpha(cov)
    if box:
        layer = layer.crop(tuple(v*SCALE for v in box))
    layer.save(f'{out}/{name}.png', optimize=True)
regions = {  # ink bounds measured on the master raster, padded 2 px
  'full': (2, 61, 445, 393),
  'symbol': (121, 61, 306, 228),
  'wordmark': (26, 238, 433, 319),
  'symword': (26, 61, 433, 319),
  'tagline': (2, 328, 445, 393),
}
for cname, rgb in {'orange': ORANGE, 'navy': (12, 32, 64), 'white': (255, 255, 255), 'black': (0,0,0)}.items():
    for rname, box in regions.items():
        colour(rgb, f'logo-{rname}-{cname}', box)
# original, untouched
Image.open(src).save(f'{out}/logo-original.png')
