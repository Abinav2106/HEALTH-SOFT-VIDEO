"""Cut feathered product plates from the approved apparel artwork (geometry and colour untouched)."""
import sys, statistics
from PIL import Image, ImageDraw, ImageFilter
imgdir, out = sys.argv[1], sys.argv[2]
SPECS = {
  'guardrail-navy':     ('apparel_01_guard_rail.webp', (968, 400, 1150, 632), None),
  'healthguard-sand':   ('apparel_04_health_guard.webp', (968, 396, 1162, 628), None),
  'guardrail-ivory':    ('apparel_06_one_care_system.webp', (916, 358, 1016, 489), None),
  'healthguard-orange': ('apparel_06_one_care_system.webp', (1104, 354, 1236, 486), 'erase:1096,350,1113,400'),
  'keeper-ivory':       ('apparel_06_one_care_system.webp', (990, 512, 1150, 644), [(0.5, 0.5, 0.455, 0.49), 'erase:1135,580,1150,625']),
}
for name, (f, box, keep) in SPECS.items():
    im = Image.open(f'{imgdir}/{f}').convert('RGB').crop(box)
    w, h = im.size
    ring = [im.getpixel((x, y)) for x in range(w) for y in (0, h-1)] + [im.getpixel((x, y)) for y in range(h) for x in (0, w-1)]
    bg = tuple(int(statistics.median(c[i] for c in ring)) for i in range(3))
    for rect in [k for k in (keep if isinstance(keep, list) else [keep]) if isinstance(k, str)]:
        # erase stray connector-arc pixels inside an explicit source rect
        x0, y0, x1, y1 = map(int, rect.split(':')[1].split(','))
        px = im.load()
        for y in range(max(0, y0-box[1]), min(h, y1-box[1])):
            for x in range(max(0, x0-box[0]), min(w, x1-box[0])):
                r, g, b = px[x, y]
                if r - b > 30: px[x, y] = bg
    keep = next((k for k in (keep if isinstance(keep, list) else [keep]) if isinstance(k, tuple)), None)
    if keep:  # remove connector-arc strokes outside the device footprint
        cx, cy, rx, ry = keep[0]*w, keep[1]*h, keep[2]*w, keep[3]*h
        px = im.load()
        for y in range(h):
            for x in range(w):
                if ((x-cx)/rx)**2 + ((y-cy)/ry)**2 > 1:
                    r, g, b = px[x, y]
                    if r - b > 60: px[x, y] = bg
    S = 4
    big = im.resize((w*S, h*S), Image.LANCZOS)
    W, H = big.size
    mask = Image.new('L', big.size, 0)
    m = int(min(W, H)*0.04)
    ImageDraw.Draw(mask).rounded_rectangle((m, m, W-m, H-m), radius=m*3, fill=255)
    big.putalpha(mask.filter(ImageFilter.GaussianBlur(m*0.8)))
    big.save(f'{out}/{name}.png', optimize=True)
    print(name, '#%02X%02X%02X' % bg, big.size)
