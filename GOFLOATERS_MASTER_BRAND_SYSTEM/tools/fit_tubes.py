"""Fit tube centerlines + widths to the source limbs (medial axis of each limb's white interior)."""
import numpy as np, json, os, sys
from PIL import Image, ImageDraw
from scipy import ndimage as ndi
from skimage.morphology import medial_axis
import networkx as nx
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
S = 4
src = Image.open(os.path.join(ROOT, '01_SOURCE_REFERENCE/original_logo/gofloaters_original_logo.png')).convert('L')
W, H = src.size
g = np.array(src.resize((W * S, H * S), Image.LANCZOS)).astype(float)
ink = g < 128
def region(poly):
    im = Image.new('L', (W * S, H * S), 0); ImageDraw.Draw(im).polygon([(x * S, y * S) for x, y in poly], fill=1)
    return np.array(im).astype(bool)
LIMBS = {
  # polygon enclosing the limb interior (cut where it opens into the body), seed inside interior
  'leg_near': ([(600, 312), (630, 318), (648, 343), (668, 368), (700, 380), (705, 393), (660, 396), (645, 380), (625, 350), (604, 330)], (628, 336)),
  'leg_far':  ([(646, 270), (668, 280), (700, 316), (728, 324), (730, 342), (690, 342), (660, 316), (646, 300)], (676, 312)),
  'tail':     ([(420, 255), (470, 255), (455, 300), (448, 340), (452, 362), (412, 362), (414, 300)], (432, 320)),
  'ear_far':  ([(512, 104), (604, 112), (596, 150), (512, 158)], (550, 132)),
  'ear_near': ([(500, 160), (600, 162), (600, 205), (500, 214)], (540, 188)),
}
# stroke thickness estimate: median thickness of all ink (2*distance transform on ink skeleton)
dt_ink = ndi.distance_transform_edt(ink)
sk_ink = medial_axis(ink[100*S:420*S, 400*S:760*S])
th = 2 * np.median(dt_ink[100*S:420*S, 400*S:760*S][sk_ink]) / S
out = {'stroke': round(float(th), 2)}
for name, (poly, seed) in LIMBS.items():
    reg = region(poly) & ~ink
    lab, _ = ndi.label(reg)
    comp = lab == lab[seed[1] * S, seed[0] * S]
    comp = ndi.binary_opening(comp, iterations=2)
    skel, dist = medial_axis(comp, return_distance=True)
    ys, xs = np.where(skel)
    G = nx.Graph()
    pts = set(zip(ys, xs))
    for y, x in pts:
        for dy in (-1, 0, 1):
            for dx in (-1, 0, 1):
                if (dy or dx) and (y + dy, x + dx) in pts:
                    G.add_edge((y, x), (y + dy, x + dx), weight=np.hypot(dy, dx))
    # longest shortest path
    a = next(iter(G.nodes)); d = nx.single_source_dijkstra_path_length(G, a); b = max(d, key=d.get)
    d = nx.single_source_dijkstra_path_length(G, b); c = max(d, key=d.get)
    path = nx.dijkstra_path(G, b, c)
    arr = np.array([(x / S, y / S, dist[y, x] / S) for y, x in path])
    # resample by arc length
    seg = np.r_[0, np.cumsum(np.hypot(np.diff(arr[:, 0]), np.diff(arr[:, 1])))]
    n = max(6, int(seg[-1] / 12))
    t = np.linspace(0, seg[-1], n)
    res = np.c_[np.interp(t, seg, arr[:, 0]), np.interp(t, seg, arr[:, 1]), ndi.uniform_filter1d(np.interp(t, seg, arr[:, 2]), 3)]
    out[name] = [[round(float(v), 1) for v in r] for r in res]
    print(name, 'len', round(seg[-1]), 'pts', [(round(x), round(y), round(2 * r + 2 * th, 1)) for x, y, r in res])
json.dump(out, open(os.path.join(HERE, 'build/tube_fits.json'), 'w'), indent=1)
print('stroke', th)
