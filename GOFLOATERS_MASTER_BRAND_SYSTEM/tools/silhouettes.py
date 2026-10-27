"""Single-colour silhouettes of the aircraft and mascot (alpha of the master exports), for pattern motifs."""
import json, os, sys, numpy as np
from PIL import Image
from scipy import ndimage as ndi
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import potrace
def sil(png, scale_to=100.0, close=4):
    a = np.array(Image.open(png).convert('RGBA'))[..., 3] > 40
    a = ndi.binary_fill_holes(ndi.binary_closing(a, iterations=close))
    ys, xs = np.where(a); a = a[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    h, w = a.shape; k = scale_to / w
    bm = potrace.Bitmap(~a)
    path = bm.trace(turdsize=50, alphamax=1.0, opttolerance=0.4)
    f = lambda p: f'{p.x * k:.2f},{p.y * k:.2f}'
    out = []
    for c in path:
        d = ['M' + f(c.start_point)]
        for s in c.segments:
            d.append(('L' + f(s.c) + 'L' + f(s.end_point)) if s.is_corner else ('C' + f(s.c1) + ' ' + f(s.c2) + ' ' + f(s.end_point)))
        out.append(''.join(d) + 'Z')
    return {'d': ' '.join(out), 'w': scale_to, 'h': round(h * k, 2)}
res = {'aircraft': sil(os.path.join(ROOT, '02_MASTER_IDENTITY/aircraft_only/gofloaters_aircraft.png')),
       'mascot': sil(os.path.join(ROOT, '02_MASTER_IDENTITY/mascot_only/gofloaters_mascot_seated.png'))}
json.dump(res, open(os.path.join(HERE, 'build/silhouettes.json'), 'w'))
print({k: (v['w'], v['h'], len(v['d'])) for k, v in res.items()})
