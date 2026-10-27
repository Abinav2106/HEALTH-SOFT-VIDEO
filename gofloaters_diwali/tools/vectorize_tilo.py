"""Trace the GoFloaters mascot (Tilo + aircraft) from the supplied logo into layered SVG.
Colour layers are traced separately and stacked, so the art scales without redrawing."""
import sys, numpy as np, cv2, potrace
from PIL import Image

src, out_dir = sys.argv[1], sys.argv[2]
SCALE = 3
im = np.asarray(Image.open(src).convert('RGB'))[80:600, 0:950].copy()  # mascot area of the lockup
H, W = im.shape[:2]
big = cv2.resize(im, (W*SCALE, H*SCALE), interpolation=cv2.INTER_CUBIC).astype(int)
h, w = big.shape[:2]

PAL = {'white': (255,255,255), 'black': (12,12,12), 'turq': (110,208,224),
       'yellow': (251,225,99), 'orange': (234,121,48)}
names = list(PAL); P = np.array([PAL[n] for n in names])
d = ((big[:, :, None, :] - P[None, None]) ** 2).sum(-1)
lab = d.argmin(-1)
# low-saturation pixels are line anti-aliasing: split them between black and white only
satv = big.max(-1) - big.min(-1)
grey = satv < 60
lab[grey & (big.mean(-1) < 128)] = names.index('black')
lab[grey & (big.mean(-1) >= 128)] = names.index('white')
# background = near-white connected to the border
light = (big.min(-1) > 200).astype(np.uint8)
ff = light.copy(); mask = np.zeros((h+2, w+2), np.uint8)
for seed in [(0,0),(w-1,0),(0,h-1),(w-1,h-1)]:
    cv2.floodFill(ff, mask, seed, 2)
fig = (ff != 2).astype(np.uint8)
fig = cv2.morphologyEx(fig, cv2.MORPH_CLOSE, np.ones((5,5),np.uint8))
# keep the largest component (dog + aircraft); speed lines are separate components
n, cc, stats, _ = cv2.connectedComponentsWithStats(fig, 8)
main = 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA])
body = (cc == main)
speed = fig.astype(bool) & ~body
# fill internal holes of the silhouette so the white fill is solid
cnts, _ = cv2.findContours(body.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
sil = np.zeros_like(fig); cv2.drawContours(sil, cnts, -1, 1, -1)

def trace(bm, color, turd=8):
    bm = cv2.GaussianBlur(bm.astype(np.float32), (0,0), 1.2) > 0.5
    bmp = potrace.Bitmap(~bm)
    path = bmp.trace(turdsize=turd, alphamax=1.0, opticurve=True, opttolerance=0.3)
    parts = []
    for curve in path:
        s = curve.start_point; seg = [f'M{s.x:.1f},{s.y:.1f}']
        for c in curve:
            if c.is_corner:
                seg.append(f'L{c.c.x:.1f},{c.c.y:.1f}L{c.end_point.x:.1f},{c.end_point.y:.1f}')
            else:
                seg.append(f'C{c.c1.x:.1f},{c.c1.y:.1f} {c.c2.x:.1f},{c.c2.y:.1f} {c.end_point.x:.1f},{c.end_point.y:.1f}')
        parts.append(''.join(seg) + 'Z')
    return f'<path fill="{color}" fill-rule="evenodd" d="{"".join(parts)}"/>'

def hexc(n): return '#%02X%02X%02X' % PAL[n]
layers = [trace(cv2.erode(sil, np.ones((7,7),np.uint8)).astype(bool), '#FFFFFF', 2)]
for nm in ['turq', 'yellow', 'orange']:
    m = ((lab == names.index(nm)) & sil.astype(bool)).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((5,5),np.uint8))
    layers.append(trace(m.astype(bool), hexc(nm), 150))
layers.append(trace((lab == names.index('black')) & sil.astype(bool), '#111111', 4))
ys, xs = np.where(sil); x0, x1, y0, y1 = xs.min()-6, xs.max()+6, ys.min()-6, ys.max()+6
vb = f'{x0} {y0} {x1-x0} {y1-y0}'
svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}">\n<g id="tilo">' + '\n'.join(layers) + '</g></svg>'
open(f'{out_dir}/tilo_aircraft.svg', 'w').write(svg)
spd = trace(speed & (lab == names.index('black')), '#111111', 4)
ys2, xs2 = np.where(fig); X0, X1, Y0, Y1 = xs2.min()-6, xs2.max()+6, ys2.min()-6, ys2.max()+6
open(f'{out_dir}/tilo_aircraft_speedlines.svg', 'w').write(
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{X0} {Y0} {X1-X0} {Y1-Y0}">' + '\n'.join(layers) + spd + '</svg>')
print('viewBox', vb, 'components', n-1)
