"""Lift the approved back artwork off the navy fabric (ink kept as-is, fabric made transparent)
so it can be placed at one fixed size on the M / L / XL silhouettes."""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage as nd

src, out = sys.argv[1], sys.argv[2]
box = (940, 282, 1200, 700)  # around the measured artwork bounds of sheet 01
a = np.asarray(Image.open(f'{src}/apparel_01_guard_rail.webp').convert('RGB').crop(box)).astype(float)
r, g, b = a[..., 0], a[..., 1], a[..., 2]
lum = (3 * r + 6 * g + b) / 10
ink = nd.binary_dilation((lum > 70) | ((b - r > 60) & (b > 120)), iterations=6)
w = (~ink).astype(float)
# fabric estimate under the ink: normalised convolution of the surrounding fabric
fab = np.dstack([nd.gaussian_filter(a[..., i] * w, 18) / np.maximum(nd.gaussian_filter(w, 18), 1e-3) for i in range(3)])
d = np.abs(a - fab).max(2)
alpha = np.clip((d - 10) / 35, 0, 1)
# un-premultiply against the fabric so edges carry ink colour, not fabric colour
rgb = np.clip(fab + (a - fab) / np.maximum(alpha[..., None], 1e-3), 0, 255)
rgb = np.where(alpha[..., None] > 0.02, rgb, 0)
img = Image.fromarray(np.dstack([rgb, alpha * 255]).astype('uint8'))
S = 3
img = img.resize((img.width * S, img.height * S), Image.LANCZOS)
img.save(f'{out}/art01-back.png', optimize=True)
print('art crop', box, img.size)
