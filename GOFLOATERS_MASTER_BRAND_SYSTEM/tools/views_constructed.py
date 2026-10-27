"""Hand-constructed character views the logo never shows (front, 3/4 front, rear, 3/4 rear).
PROPOSED EXTENSIONS drawn in the logo's vocabulary: 7.6 px ink line, white body,
orange eye ring, narrow muzzle, swept-back ears, slim body, sickle tail.
Writes SVGs to 04_CHARACTER_LIBRARY/character_views/constructed_views/."""
import os, sys, re
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
OUT = os.path.join(ROOT, '04_CHARACTER_LIBRARY/character_views/constructed_views')
INK, WH, OR = '#050506', '#FFFFFF', '#F17B2A'
SW = 7.6
def P(d, fill=WH, sw=SW, extra=''):
    return f'<path d="{d}" fill="{fill}" stroke="{INK}" stroke-width="{sw}" stroke-linejoin="round" stroke-linecap="round" {extra}/>'
def L(d, sw=SW):
    return f'<path d="{d}" fill="none" stroke="{INK}" stroke-width="{sw}" stroke-linejoin="round" stroke-linecap="round"/>'
def mirror(d, cx=300):
    # mirror an absolute path string about x = cx (numbers come in x,y pairs)
    import re
    toks = re.findall(r'[A-Za-z]|-?\d+\.?\d*', d); out = []; xy = 0
    for t in toks:
        if t.isalpha(): out.append(t); xy = 0
        else:
            v = float(t)
            out.append(f'{2 * cx - v:.1f}' if xy % 2 == 0 else f'{v:.1f}'); xy += 1
    return ' '.join(out)
def eye(cx, cy, r=29, look=(0, 0), ring_tilt=0):
    """Orange eye ring as in the logo: ink outer line, orange band, ink inner line, white eye, black pupil."""
    return (f'<ellipse cx="{cx}" cy="{cy}" rx="{r}" ry="{r * 0.94}" transform="rotate({ring_tilt} {cx} {cy})" fill="{OR}" stroke="{INK}" stroke-width="{SW * 0.75}"/>'
            f'<ellipse cx="{cx}" cy="{cy}" rx="{r * 0.6}" ry="{r * 0.57}" transform="rotate({ring_tilt} {cx} {cy})" fill="{WH}" stroke="{INK}" stroke-width="{SW * 0.62}"/>'
            f'<circle cx="{cx + look[0]}" cy="{cy + look[1]}" r="{r * 0.2}" fill="{INK}"/>')

import math
def smooth(pts, k=8):
    """Catmull-Rom resample of an [(x, y, r)] centre-line so bends read as curves, not elbows."""
    if len(pts) < 3: return pts
    out = []; n = len(pts)
    for i in range(n - 1):
        p0, p1, p2, p3 = pts[max(0, i - 1)], pts[i], pts[i + 1], pts[min(n - 1, i + 2)]
        for j in range(k):
            t = j / k; t2, t3 = t * t, t * t * t
            out.append(tuple(0.5 * (2 * p1[c] + (-p0[c] + p2[c]) * t + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t2
                                    + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * t3) for c in range(3)))
    out.append(pts[-1]); return out
def tube(pts, open_top=True, cap=True):
    """pts: [(x, y, r)] centre-line with interior half-widths -> (fill, line) path strings."""
    pts = smooth(pts)
    Lp, Rp = [], []
    n = len(pts)
    for i, (x, y, r) in enumerate(pts):
        a = pts[max(0, i - 1)]; b = pts[min(n - 1, i + 1)]
        tx, ty = b[0] - a[0], b[1] - a[1]; l = math.hypot(tx, ty) or 1; tx /= l; ty /= l
        w = r + SW / 2
        Lp.append((x - ty * w, y + tx * w)); Rp.append((x + ty * w, y - tx * w))
    ex, ey, er = pts[-1]; w = er + SW / 2
    a0 = math.atan2(Lp[-1][1] - ey, Lp[-1][0] - ex)
    capp = [(ex + math.cos(a0 - math.pi * k / 10) * w, ey + math.sin(a0 - math.pi * k / 10) * w) for k in range(1, 10)] if cap else []
    ring = Lp + capp + Rp[::-1]
    f = lambda q: f'{q[0]:.1f},{q[1]:.1f}'
    fill = 'M' + 'L'.join(map(f, ring)) + 'Z'
    line = 'M' + 'L'.join(map(f, ring))
    return fill, line
def limb(pts):
    fl, ln = tube(pts)
    return f'<path d="{fl}" fill="{WH}"/>' + L(ln)

LEG_TOP, LEG_K = 470, 0.66   # legs are compressed below this line to match the rigged body's proportions
def _ymap(y): return y if y <= LEG_TOP else LEG_TOP + (y - LEG_TOP) * LEG_K
def _remap_d(d):
    if re.search(r'[a-z]', d): return d          # relative paths (small marks) are left alone
    toks = re.findall(r'[A-Za-z]|-?\d+\.?\d*', d); out = []; k = 0
    for t in toks:
        if t.isalpha(): out.append(t); k = 0
        else:
            v = float(t); out.append(f'{(_ymap(v) if k % 2 else v):.1f}'); k += 1
    return ' '.join(out)
def svg(body, w=600, h=760, title=''):
    body = re.sub(r' d="([^"]+)"', lambda m: f' d="{_remap_d(m.group(1))}"', body)
    body = re.sub(r' cy="([\d.]+)" rx="(\d+)" ry="(9|10)"', lambda m: f' cy="{_ymap(float(m.group(1))):.1f}" rx="{m.group(2)}" ry="{m.group(3)}"', body)
    h = int(_ymap(h)) + 10
    return (f'<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">'
            f'<title>{title}</title><desc>PROPOSED constructed view of the GoFloaters mascot (not part of the original logo).</desc>{body}</svg>\n')

# ------------------------------------------------------------------ FRONT
def front():
    b = ['<ellipse cx="300" cy="711" rx="110" ry="9" fill="#0B2A33" opacity="0.1"/>']
    # hind legs seen through the gap between the forelegs (behind the body)
    for s_ in (1, -1):
        x = 300 - s_ * 14
        b.append(limb([(x, 520, 6.5), (x, 600, 5.6), (x - s_ * 1, 680, 5.2)]))
        b.append(P(f'M{x - 15},700 C{x - 15},688 {x + 15},688 {x + 15},700 C{x + 15},709 {x - 15},709 {x - 15},700 Z'))
    # tail tip arcing up behind the right flank
    b.append(limb([(356, 452, 5), (378, 420, 4.4), (394, 380, 3.6), (396, 344, 2.6), (390, 326, 1.8)]))
    # ears: swept back, so from the front only their rounded backs flare past the skull
    ear = 'M248,126 C224,108 186,104 166,116 C152,126 160,146 182,150 C206,154 230,150 250,146 Z'
    b.append(P(ear)); b.append(P(mirror(ear)))
    # neck, shoulders and forelegs as ONE silhouette: the forelegs are the outer columns of the chest
    body = ('M262,232 C258,270 254,300 250,322 C246,340 232,352 226,372 C220,392 222,430 228,470 '
            'C234,540 238,620 240,690 L272,690 C272,630 272,570 276,520 '
            'C280,500 290,494 300,494 C310,494 320,500 324,520 '
            'C328,570 328,630 328,690 L360,690 C362,620 366,540 372,470 '
            'C378,430 380,392 374,372 C368,352 354,340 350,322 C346,300 342,270 338,232 Z')
    b.append(P(body))
    b.append(L('M240,470 C246,430 254,404 266,392', 4.2)); b.append(L(mirror('M240,470 C246,430 254,404 266,392'), 4.2))
    for s_ in (1, -1):
        x = 300 - s_ * 44
        b.append(P(f'M{x - 25},699 C{x - 26},680 {x + 26},680 {x + 25},699 C{x + 25},712 {x - 25},712 {x - 25},699 Z'))
        b.append(L(f'M{x - 7},688 L{x - 7},698 M{x + 7},688 L{x + 7},698', 3.6))
    # head: flat-topped skull, cheeks, and the long narrow muzzle seen end-on
    b.append('<g transform="translate(300 196) scale(1.12) translate(-300 -196)">')
    head = ('M300,92 C334,92 360,104 368,130 C376,158 368,186 352,206 C338,224 330,248 322,270 '
            'C316,288 310,294 300,294 C290,294 284,288 278,270 C270,248 262,224 248,206 '
            'C232,186 224,158 232,130 C240,104 266,92 300,92 Z')
    b.append(P(head))
    # orange ring strap: a slim band wrapping back over each temple (as in the logo)
    for s_ in ():
        b.append(f'<path d="{mirror("M240,150 C246,140 254,134 262,132 L262,146 C256,148 250,154 246,160 Z") if s_ < 0 else "M240,150 C246,140 254,134 262,132 L262,146 C256,148 250,154 246,160 Z"}" fill="{OR}" stroke="{INK}" stroke-width="{SW * 0.55}" stroke-linejoin="round"/>')
    b.append(eye(264, 164, r=26, look=(3, 2))); b.append(eye(336, 164, r=26, look=(-3, 2)))
    # muzzle bridge, nose and closed smile
    b.append(L('M300,196 C300,220 300,240 300,250', 3.6))
    b.append(f'<path d="M284,262 C284,250 316,250 316,262 C316,274 306,280 300,280 C294,280 284,274 284,262 Z" fill="{INK}"/>')
    b.append('<ellipse cx="294" cy="257" rx="4.5" ry="2.6" fill="#ffffff" opacity="0.5"/>')
    b.append(L('M286,286 C292,292 308,292 314,286', 4))
    b.append('</g>')
    return svg(''.join(b), title='Front view (constructed)')

# ------------------------------------------------------------------ helpers for the traced head
import re as _re
def traced_head(x, y, w, flip=False, extra=''):
    """Embed the exact traced logo head (rig export, cropped at the neck cut) as a nested SVG.
    (x, y) is the top-left in view space, w the width; source crop is 260x126 logo px."""
    src = open(os.path.join(HERE, 'build/head_only.svg')).read()
    src = _re.sub(r'<\?xml[^>]*>\s*', '', src); src = _re.sub(r'<!--.*?-->\s*', '', src, flags=_re.S)
    h = w * 126 / 260
    src = _re.sub(r'<svg width="[^"]*" height="[^"]*"', f'<svg x="0" y="0" width="{w:.1f}" height="{h:.1f}" preserveAspectRatio="none"', src, count=1)
    t = f'translate({x + (w if flip else 0):.1f} {y:.1f})' + (' scale(-1 1)' if flip else '')
    return f'<g transform="{t}" {extra}>{src}</g>'
K = lambda w: w / 260.0   # px per logo px for an embedded head of width w

# ------------------------------------------------------------------ 3/4 FRONT
def three_quarter_front():
    b = ['<ellipse cx="330" cy="712" rx="190" ry="10" fill="#0B2A33" opacity="0.1"/>']
    # body recedes to the upper left; chest faces the viewer on the right
    b.append(limb([(150, 380, 4.8), (128, 346, 4.2), (118, 300, 3.4), (124, 262, 2.4), (136, 246, 1.8)]))   # tail
    b.append(limb([(214, 470, 12), (222, 560, 7.2), (206, 610, 5.8), (206, 676, 5.2)]))                      # far hind
    b.append(P('M206,690 C204,678 238,676 242,690 C244,702 206,704 206,690 Z'))
    b.append(limb([(330, 470, 9.5), (334, 560, 7.2), (334, 640, 6.0), (338, 680, 5.6)]))                     # far fore
    b.append(P('M326,692 C324,678 366,676 368,692 C370,704 326,706 326,692 Z'))
    body = ('M332,222 C326,270 306,318 270,338 C236,354 196,352 176,362 C152,376 146,410 158,444 '
            'C168,472 194,482 230,476 C262,470 292,488 330,498 C368,508 412,500 432,470 '
            'C452,440 452,392 446,350 C442,300 444,256 446,224 Z')
    b.append(P(body))
    b.append(L('M198,450 C210,430 222,412 238,404', 4.2))
    for p_ in ([200, 402], [212, 414], [190, 418]):
        b.append(L(f'M{p_[0]},{p_[1]} l6,-14', 4.2))
    b.append(limb([(232, 432, 22), (250, 500, 13), (234, 560, 7.6), (226, 610, 6.0), (228, 676, 5.4)]))     # near hind (thigh)
    b.append(P('M224,690 C222,676 262,674 266,690 C268,704 224,706 224,690 Z'))
    b.append(limb([(392, 470, 11), (396, 540, 8.6), (396, 620, 6.8), (400, 680, 6.0)]))                      # near fore
    b.append(P('M390,692 C388,676 436,674 438,692 C440,706 390,708 390,692 Z'))
    b.append(L('M372,486 C382,470 392,462 402,460', 4.2))
    # the far eye is hidden behind the bridge of the muzzle at this angle (no second ring is invented)
    hx, hy, w = 250, 70, 330
    b.append(traced_head(hx, hy, w))
    return svg(''.join(b), w=600, h=760, title='Three-quarter front view (constructed)')

# ------------------------------------------------------------------ REAR
def rear():
    b = ['<ellipse cx="300" cy="711" rx="120" ry="9" fill="#0B2A33" opacity="0.1"/>']
    # forelegs barely visible between the hind legs
    for s_ in (1, -1):
        x = 300 - s_ * 16
        b.append(limb([(x, 540, 6.5), (x, 620, 5.6), (x, 680, 5.4)]))
        b.append(P(f'M{x - 14},698 C{x - 14},686 {x + 14},686 {x + 14},698 C{x + 14},707 {x - 14},707 {x - 14},698 Z'))
    # ears: swept back, so from behind they point toward the viewer and flare at the sides
    ear = 'M250,128 C226,116 192,120 176,136 C164,150 174,170 196,170 C220,170 238,160 252,150 Z'
    b.append(P(ear)); b.append(P(mirror(ear)))
    # neck + back + rump as one silhouette, with the hind legs as its outer columns
    body = ('M262,226 C258,262 252,292 246,316 C238,346 220,372 212,410 C204,452 210,494 222,528 '
            'C230,560 232,620 234,690 L266,690 C266,640 268,590 276,556 '
            'C282,540 290,534 300,534 C310,534 318,540 324,556 '
            'C332,590 334,640 334,690 L366,690 C368,620 370,560 378,528 '
            'C390,494 396,452 388,410 C380,372 362,346 354,316 C348,292 342,262 338,226 Z')
    b.append(P(body))
    # hock bends and the thigh contours
    b.append(L('M226,470 C232,440 246,420 262,412', 4.2)); b.append(L(mirror('M226,470 C232,440 246,420 262,412'), 4.2))
    b.append(L('M236,612 C240,600 244,594 250,592', 4)); b.append(L(mirror('M236,612 C240,600 244,594 250,592'), 4))
    for s_ in (1, -1):
        x = 300 - s_ * 50
        b.append(P(f'M{x - 23},699 C{x - 24},681 {x + 24},681 {x + 23},699 C{x + 23},711 {x - 23},711 {x - 23},699 Z'))
    # the sickle tail, rising from the top of the rump and curling over
    b.append(limb([(300, 426, 6.2), (296, 386, 5.6), (300, 348, 4.8), (316, 318, 3.8), (338, 304, 2.8), (356, 308, 1.9)]))
    # back of the skull; the orange eye rings are face markings, so from behind only their outer rims peek past the cheeks
    for s_ in (1, -1):
        cx = 300 - s_ * 62
        b.append(f'<path d="M{cx - s_ * 4},150 C{cx - s_ * 16},158 {cx - s_ * 16},186 {cx - s_ * 2},194 Z" fill="{OR}" stroke="{INK}" stroke-width="{SW}" stroke-linejoin="round"/>')
    headb = ('M300,104 C328,104 352,118 360,142 C366,162 362,186 350,204 C338,222 320,232 300,232 '
             'C280,232 262,222 250,204 C238,186 234,162 240,142 C248,118 272,104 300,104 Z')
    b.append(P(headb))
    b.append(L('M300,118 C302,136 302,150 300,160', 3.6))
    return svg(''.join(b), title='Rear view (constructed)')

# ------------------------------------------------------------------ 3/4 REAR
def three_quarter_rear():
    b = ['<ellipse cx="290" cy="712" rx="180" ry="10" fill="#0B2A33" opacity="0.1"/>']
    # far legs (behind)
    b.append(limb([(392, 470, 9), (396, 560, 7), (394, 630, 6), (392, 680, 5.6)]))
    b.append(P('M372,692 C372,678 410,678 412,692 C412,704 372,704 372,692 Z'))
    b.append(limb([(232, 470, 10), (240, 540, 7.6), (226, 600, 6), (226, 680, 5.4)]))
    b.append(P('M206,692 C206,678 244,678 246,692 C246,704 206,704 206,692 Z'))
    # ears swept back toward the viewer
    b.append(P('M362,176 C380,150 420,140 446,150 C466,160 460,184 436,188 C410,192 384,188 364,190 Z'))
    # body: rump nearest to the viewer (lower left), chest receding up to the right
    body = ('M398,220 C404,262 412,300 420,330 C430,370 434,420 420,460 C408,494 380,506 350,500 '
            'C318,494 300,470 270,476 C236,482 196,488 176,460 C156,430 158,380 182,350 '
            'C206,322 248,318 286,316 C320,314 344,290 352,258 C356,244 356,232 354,222 Z')
    b.append(P(body))
    b.append(limb([(198, 360, 5.4), (178, 326, 4.8), (172, 286, 3.8), (182, 252, 2.8), (198, 238, 2)]))   # tail
    b.append(limb([(232, 430, 24), (252, 500, 13), (238, 560, 7.6), (234, 620, 6.2), (238, 680, 5.6)]))  # near hind
    b.append(P('M222,692 C220,676 262,674 266,692 C268,706 222,708 222,692 Z'))
    for p_ in ([214, 400], [226, 410], [204, 414]): b.append(L(f'M{p_[0]},{p_[1]} l6,-14', 4.2))
    b.append(limb([(366, 470, 10.5), (370, 540, 8.4), (372, 620, 6.8), (374, 680, 6)]))                   # near fore
    b.append(P('M362,692 C360,676 404,674 408,692 C410,706 362,708 362,692 Z'))
    # lost-profile head: back of the skull, the near ear, a sliver of muzzle and only the rim of the near eye ring
    b.append(P('M422,146 C448,146 474,152 494,164 C502,170 498,180 488,180 C466,180 446,178 428,176 Z'))   # muzzle sliver
    b.append('<ellipse cx="496" cy="170" rx="9" ry="8" fill="#050506"/>')
    b.append(f'<path d="M430,138 C446,146 450,170 440,186 L428,178 C434,166 432,150 424,144 Z" fill="{OR}" stroke="{INK}" stroke-width="{SW}" stroke-linejoin="round"/>')
    headb = 'M352,112 C380,98 418,104 432,130 C446,156 440,190 420,208 C400,226 366,228 346,212 C326,196 320,160 330,136 C336,124 342,116 352,112 Z'
    b.append(P(headb))
    b.append(P('M360,138 C334,118 292,116 270,130 C254,142 262,164 286,166 C310,168 334,162 352,160 Z'))    # near ear, swept back
    return svg(''.join(b), title='Three-quarter rear view (constructed)')

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    open(os.path.join(OUT, 'view_front_constructed.svg'), 'w').write(front())
    open(os.path.join(OUT, 'view_three_quarter_front_constructed.svg'), 'w').write(three_quarter_front())
    open(os.path.join(OUT, 'view_rear_constructed.svg'), 'w').write(rear())
    open(os.path.join(OUT, 'view_three_quarter_rear_constructed.svg'), 'w').write(three_quarter_rear())
    print('ok')
