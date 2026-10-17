"""Healthsoft Polo Apparel System — 5-page guide. Writes index.html next to this file."""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
M = json.load(open(os.path.join(HERE, 'assets/measure.json')))
O = json.load(open(os.path.join(HERE, 'assets/origins.json')))
ASPECT = {'full': 1772 / 1328, 'symbol': 740 / 668, 'symword': 1628 / 1032}
DESIGNS = [('01', 'Guard Rail', 'Navy'), ('04', 'Health Guard', 'Navy'), ('06', 'One care system', 'Sand')]
TOTAL = 5
pages = []

# Garment grading used for the size diagram (typical polo grading; the vendor's spec sheet governs).
GRADE = {'M': (53, 72), 'L': (56, 74), 'XL': (59, 76)}  # half-chest cm, HPS-to-hem cm
COLLAR = 4  # cm of collar stand above HPS; measurements run from the top of the collar at centre


def page(n, title, body, cls=''):
    t = f'<div class="ptitle"><span class="pn">{n:02d} /</span> {title}</div>' if title else ''
    f = f'<div class="foot"><span>HEALTHSOFT / POLO APPAREL SYSTEM</span><span>{n:02d} / {TOTAL:02d}</span></div>'
    pages.append(f'<section class="page {cls}">{t}{body}{f}</section>')


def at(x, y, inner, w=None, h=None, style=''):
    wh = (f'width:{w}px;' if w is not None else '') + (f'height:{h}px;' if h is not None else '')
    return f'<div class="abs" style="left:{x:.1f}px;top:{y:.1f}px;{wh}{style}">{inner}</div>'


def logo(kind='full', color='orange', w=200, style=''):
    return f'<img src="assets/logo-{kind}-{color}.png" style="width:{w:.1f}px;height:{w / ASPECT[kind]:.1f}px;{style}">'


def garment(name, x, y, h):
    """Place a cut-out at (x, y) with height h; returns html and a sheet→page mapper."""
    ox, oy, cw, ch = O[name]
    k = h / ch
    html = f'<img class="abs" src="assets/{name}.png" style="left:{x:.1f}px;top:{y:.1f}px;width:{cw * k:.1f}px;height:{h:.1f}px">'
    return html, (lambda sx, sy: (x + (sx - ox) * k, y + (sy - oy) * k)), cw * k


def hl(x, y, w, color='var(--orange)', dash=False, wt=1):
    st = f'border-top:{wt}px {"dashed" if dash else "solid"} {color}'
    return at(x, y, '', w=w, h=0, style=st)


def vl(x, y, h, color='var(--orange)', dash=False, wt=1):
    st = f'border-left:{wt}px {"dashed" if dash else "solid"} {color}'
    return at(x, y, '', w=0, h=h, style=st)


def rect(x0, y0, x1, y1, color='var(--orange)', dash=False, wt=1, fill='none'):
    return at(x0, y0, '', w=x1 - x0, h=y1 - y0, style=f'border:{wt}px {"dashed" if dash else "solid"} {color};background:{fill}')


def tag(x, y, t, color='var(--orange)', align='left', w=None, size=8):
    return at(x, y, f'<div class="mono" style="font-size:{size}px;font-weight:600;letter-spacing:.08em;color:{color};text-align:{align};white-space:nowrap">{t}</div>', w=w)


# ------------------------------------------------------------------ 01 COLLECTION OVERVIEW
groups = ''
GH = 284
GW = GH * 0.83
# fronts sit in front; each covers <=25% of its own back (06 artwork starts at 29%) and <=35% of the
# previous back (01/04 artwork ends at 65%), so every logo and every back artwork stays visible
x0 = (1123 - 4.55 * GW) / 2
for i, (key, name, colour) in enumerate(DESIGNS):
    fx = x0 + i * 1.4 * GW
    bx_ = fx + 0.75 * GW
    fimg, _, fw = garment(f'polo{key}-front', fx, 262, GH)
    bimg, _, bw = garment(f'polo{key}-back', bx_, 262, GH)
    groups += f'<div style="position:absolute;z-index:{1};left:0;top:0">{bimg}</div><div style="position:absolute;z-index:2;left:0;top:0">{fimg}</div>'
    groups += at(fx + 8, 572, f'<div class="label" style="color:var(--grey);font-size:7.5px">{key}</div><div class="h-xs" style="margin-top:4px">{name}</div><div class="small" style="margin-top:1px">{colour} polo · front / back</div>', w=300)
sw = ''.join(f'<div style="display:flex;align-items:center;gap:8px"><div style="width:22px;height:22px;background:{c};{"box-shadow:inset 0 0 0 1px var(--hair)" if n == "Ivory" else ""}"></div><div class="mono" style="font-size:8px;line-height:1.4;color:var(--navy70)"><b style="color:var(--navy);font-weight:600">{n}</b><br>{h}</div></div>'
             for n, c, h in [('Orange', '#EC8D1F', '#EC8D1F'), ('Navy', '#0C2040', '#0C2040'), ('Ivory', '#F7F4ED', '#F7F4ED')])
strip = f'''<div style="display:flex;align-items:center;gap:44px">
{logo('full', 'orange', 66)}
<div style="display:flex;gap:26px">{sw}</div>
<div style="display:flex;gap:26px;align-items:center"><div><span style="font-family:Montserrat;font-weight:700;font-size:22px">Aa</span><div class="mono" style="font-size:8px;color:var(--navy70)">Montserrat</div></div><div><span style="font-family:Inter;font-weight:500;font-size:22px">Aa</span><div class="mono" style="font-size:8px;color:var(--navy70)">Inter</div></div></div></div>'''
page(1, '', f'''
{at(56, 52, '<div class="eyebrow">Apparel Collection V3 · Final</div>')}
{at(56, 82, '<div class="h-l" style="font-size:40px;text-transform:uppercase;line-height:1.05">Healthsoft<br>Polo apparel system</div>', w=640)}
{at(56, 184, '<div class="lead" style="color:var(--navy70)">Defined by Care. Driven by Love.</div>')}
{at(760, 98, '<div class="rule"></div><div class="body" style="color:var(--navy);font-size:12px;line-height:1.55;margin-top:12px">A consistent apparel system built around care, technology and human connection.</div>', w=300)}
{groups}
{at(56, 660, '', w=1011, h=1, style='background:var(--hair)')}
{at(56, 680, strip)}
''', 'ivory')

# ------------------------------------------------------------------ 02 BRAND DNA
swatches = ''
for i, (n, hx, rgb, dark) in enumerate([('Healthsoft Orange', '#EC8D1F', '236 / 141 / 31', False), ('Healthsoft Navy', '#0C2040', '12 / 32 / 64', True),
                                        ('Warm Ivory', '#F7F4ED', '247 / 244 / 237', False), ('White', '#FFFFFF', '255 / 255 / 255', False)]):
    x, y = 404 + (i % 2) * 168, 140 + (i // 2) * 196
    c = '#fff' if dark else 'var(--navy)'
    swatches += at(x, y, f'''<div style="height:118px;background:{hx};{"box-shadow:inset 0 0 0 1px var(--hair)" if hx in ("#FFFFFF", "#F7F4ED") else ""};padding:12px"><div class="label" style="font-size:7px;color:{c}">{n.split()[-1]}</div></div>
<div class="h-xs" style="margin-top:10px;text-transform:uppercase;font-size:10.5px;letter-spacing:.04em">{n}</div><div class="mono" style="font-size:9px;color:var(--navy70);margin-top:3px">{hx} &nbsp;·&nbsp; RGB {rgb}</div>''', w=152)
ratio = '''<div style="display:flex;height:34px"><div style="flex:65;background:var(--ivory);box-shadow:inset 0 0 0 1px var(--hair)"></div><div style="flex:25;background:var(--navy)"></div><div style="flex:10;background:var(--orange)"></div></div>
<div style="display:flex;margin-top:8px" class="mono"><div style="flex:65;font-size:8.5px;color:var(--navy70)"><b style="color:var(--navy);font-size:13px;font-family:Montserrat">60–70%</b><br>Ivory / White</div><div style="flex:25;font-size:8.5px;color:var(--navy70)"><b style="color:var(--navy);font-size:13px;font-family:Montserrat">20–30%</b><br>Navy</div><div style="flex:12;font-size:8.5px;color:var(--navy70);white-space:nowrap"><b style="color:var(--orange);font-size:13px;font-family:Montserrat">5–10%</b><br>Orange</div></div>'''
page(2, 'Brand DNA', f'''
{at(56, 112, '<div class="eyebrow">Official logo</div>')}
{at(56, 140, logo('full', 'orange', 190), w=300, h=314, style='background:var(--ivory);display:flex;align-items:center;justify-content:center')}
{at(56, 472, '<div class="h-xs" style="font-size:12px">Use only the approved Healthsoft logo.</div><div class="body" style="margin-top:4px">Never redraw, stretch or modify it. The wordmark and tagline bar are fixed artwork, not type.</div>', w=300)}
{at(404, 112, '<div class="eyebrow">Colour</div>')}
{swatches}
{at(404, 540, '<div class="label" style="color:var(--grey);font-size:7.5px;margin-bottom:10px">Visual balance</div>' + ratio, w=320)}
{at(780, 112, '<div class="eyebrow">Typography</div>')}
{at(780, 140, '<div style="font-family:Montserrat;font-weight:700;font-size:25px;line-height:1.1;letter-spacing:-.01em">THREE NEEDS.<br>ONE CARE SYSTEM.</div>', w=290)}
{at(780, 214, '<div class="mono" style="font-size:8.5px;color:var(--navy70)"><b style="color:var(--navy)">Montserrat</b> &nbsp;Bold / SemiBold &nbsp;—&nbsp; HEADLINES</div>')}
{at(780, 262, '', w=287, h=1, style='background:var(--hair)')}
{at(780, 288, '<div style="font-family:Inter;font-size:19px;line-height:1.3">Healthsoft apparel collection</div><div style="font-family:Inter;font-weight:500;font-size:9px;letter-spacing:.2em;margin-top:12px">GUARD RAIL / SAFETY</div>', w=290)}
{at(780, 352, '<div class="mono" style="font-size:8.5px;color:var(--navy70)"><b style="color:var(--navy)">Inter</b> &nbsp;Regular / Medium &nbsp;—&nbsp; BODY / LABELS</div>')}
{at(780, 388, '', w=287, h=1, style='background:var(--hair)')}
{at(780, 414, '<div style="display:flex;gap:28px;align-items:flex-end"><div style="font-family:Montserrat;font-weight:700;font-size:64px;line-height:.9">Aa</div><div style="font-family:Inter;font-weight:400;font-size:64px;line-height:.9">Aa</div></div>')}
''')

# ------------------------------------------------------------------ 03 T-SHIRT DESIGN SYSTEM
cols = ''
for i, (key, name, colour) in enumerate(DESIGNS):
    cx = 196 + i * 292
    cols += at(cx, 104, f'<div class="label" style="color:var(--grey);font-size:7.5px">{key}</div><div class="h-xs" style="margin-top:3px">{name} <span class="g" style="font-weight:500">· {colour}</span></div>', w=270)
    fr, bk = M[key]['front'], M[key]['back']
    # FRONT
    fh = 220
    img, mp, fw = garment(f'polo{key}-front', cx, 146, fh)
    lx0, ly0 = mp(fr['art'][0], fr['art'][1])
    lx1, ly1 = mp(fr['art'][2], fr['art'][3])
    cols += img + rect(lx0 - 3, ly0 - 3, lx1 + 3, ly1 + 3, wt=1)
    cols += hl(lx1 + 3, (ly0 + ly1) / 2, cx + fw + 8 - lx1 - 3, 'var(--orange)')
    cols += at(cx + fw + 12, (ly0 + ly1) / 2 - 16, f'<div style="font-family:Montserrat;font-weight:700;font-size:20px;color:var(--orange);line-height:1">{fr["occupancy"]}%</div><div class="mono" style="font-size:7.5px;color:var(--navy70);margin-top:3px">logo area</div>')
    cols += at(cx + fw + 12, 318, f'<div style="font-family:Montserrat;font-weight:700;font-size:20px;line-height:1">{round(100 - fr["occupancy"], 1)}%</div><div class="mono" style="font-size:7.5px;color:var(--navy70);margin-top:3px">clean garment</div>')
    # BACK
    bh = 250
    img, mp, bw = garment(f'polo{key}-back', cx, 420, bh)
    ax0, ay0 = mp(bk['art'][0], bk['art'][1])
    ax1, ay1 = mp(bk['art'][2], bk['art'][3])
    tx, ty = mp(bk['centre'], bk['top'])
    _, hy = mp(bk['centre'], bk['hem'])
    bx = cx + bw + 8
    cols += img + rect(ax0 - 3, ay0 - 3, ax1 + 3, ay1 + 3, wt=1)
    cols += vl(bx, ay0 - 3, ay1 - ay0 + 6) + hl(bx - 5, ay0 - 3, 5) + hl(bx - 5, ay1 + 3, 5)
    cols += at(bx + 8, (ay0 + ay1) / 2 - 30, f'<div style="font-family:Montserrat;font-weight:700;font-size:20px;color:var(--orange);line-height:1">{round(bk["occupancy"])}%</div><div class="mono" style="font-size:7.5px;color:var(--navy70);margin-top:3px;line-height:1.5">artwork zone<br>{bk["band"][0]}–{bk["band"][1]}% of length</div>')
    cols += at(bx + 8, hy - 34, f'<div style="font-family:Montserrat;font-weight:700;font-size:20px;line-height:1">{round(100 - bk["occupancy"])}%</div><div class="mono" style="font-size:7.5px;color:var(--navy70);margin-top:3px">clean garment</div>')
page(3, 'T-shirt design system', f'''
{at(56, 146, '<div class="label" style="color:var(--orange);font-weight:600">Front</div><div class="h-xs" style="margin-top:10px;line-height:1.4;font-size:11px">Small Healthsoft logo.<br>Maximum negative space.<br>Quiet premium branding.</div><div class="small" style="margin-top:10px">Keep the logo under 3% of the visible front.</div>', w=128)}
{at(56, 420, '<div class="label" style="color:var(--orange);font-weight:600">Back</div><div class="h-xs" style="margin-top:10px;line-height:1.4;font-size:11px">One focused product or ecosystem story.</div><div class="small" style="margin-top:10px">Artwork stays in the upper-middle, centre-back zone. Never edge to edge — the back is apparel, not a poster.</div>', w=128)}
{at(56, 396, '', w=1011, h=1, style='background:var(--hair)')}
{cols}
{at(56, 726, '<div class="small">Percentages measured on the approved mockups: artwork bounding box ÷ visible garment area.</div>', w=700)}
''')

# ------------------------------------------------------------------ 04 SIZE & SCALING
A1 = M['01']['back']['art_cm']
F1 = M['01']['front']['art_cm']
MB, MF = M['01']['back'], M['01']['front']
# lifted artwork: crop (940,282)-(1200,700); ink bounds measured inside it
ART_CROP = (940, 282, 260, 418)
ba = MB['art']
ink = (ba[0] - ART_CROP[0], ba[1] - ART_CROP[1], ba[2] - ba[0], ba[3] - ba[1])


def sized(side, sz, cx, top, pxcm):
    """Approved 01 base garment graded to size `sz`, collar top at (cx, top); px per cm `pxcm`."""
    m = MB if side == 'back' else MF
    ox, oy, cw, ch = O[f'polo01-{side}']
    chest, length = GRADE[sz]
    k = pxcm / m['pxcm']
    kx, ky = k * chest / GRADE['L'][0], k * (length + COLLAR) / (GRADE['L'][1] + COLLAR)
    left = cx - (m['centre'] - ox) * kx
    t = top - (m['top'] - oy) * ky
    img = at(left, t, f'<img src="assets/blank01-{side}.png" style="width:{cw * kx:.1f}px;height:{ch * ky:.1f}px">')
    return img, t + (m['hem'] - oy) * ky, cw * kx


def back_art(cx, top, pxcm, f=1.0):
    aw = A1['w'] * pxcm * f
    kk = aw / ink[2]
    return at(cx - aw / 2 - ink[0] * kk, top + A1['top'] * pxcm - ink[1] * kk,
              f'<img src="assets/art01-back.png" style="width:{ART_CROP[2] * kk:.1f}px;height:{ART_CROP[3] * kk:.1f}px">')


PXCM_B = 240 / (GRADE['L'][1] + COLLAR)
PXCM_F = 196 / (GRADE['L'][1] + COLLAR)
BT, FT = 214, 520
CX = [146, 374, 602]
size_html = ''
for i, sz in enumerate(('M', 'L', 'XL')):
    cx = CX[i]
    img, hem, w = sized('back', sz, cx, BT, PXCM_B)
    size_html += img + back_art(cx, BT, PXCM_B)
    size_html += vl(cx, BT - 10, hem - BT + 20, dash=True)
    size_html += at(cx - 40, BT - 40, f'<div style="font-family:Montserrat;font-weight:700;font-size:18px;text-align:center">{sz}</div>', w=80)
    size_html += at(cx - 80, hem + 8, f'<div class="mono" style="font-size:7.5px;color:var(--grey);text-align:center">chest {GRADE[sz][0]} · length {GRADE[sz][1]} cm</div>', w=160)
    img, hemf, wf = sized('front', sz, cx, FT, PXCM_F)
    size_html += img + vl(cx, FT - 10, hemf - FT + 20, dash=True)
    lw = F1['w'] * PXCM_F
    lcx, ly = cx + F1['off'] * PXCM_F, FT + F1['top'] * PXCM_F
    size_html += at(lcx - lw / 2, ly, logo('symbol', 'orange', lw))
    size_html += rect(lcx - lw / 2 - 4, ly - 4, lcx + lw / 2 + 4, ly + lw / ASPECT['symbol'] + 4, wt=1)
gx0, gx1 = 36, 722
yt = BT + A1['top'] * PXCM_B
yb = yt + A1['h'] * PXCM_B
size_html += hl(gx0, BT, gx1 - gx0, 'rgba(12,32,64,.22)') + hl(gx0, yt, gx1 - gx0, dash=True) + hl(gx0, yb, gx1 - gx0, 'rgba(236,141,31,.45)', dash=True)
size_html += tag(gx1 + 8, BT - 5, 'COLLAR TOP', 'var(--grey)')
size_html += tag(gx1 + 8, yt - 5, f'ART TOP  {A1["top"]} cm')
size_html += tag(gx1 + 8, yt + 9, f'W {A1["w"]} × H {A1["h"]} cm', 'var(--navy)')
size_html += tag(gx1 + 8, yb - 5, 'ART BOTTOM', 'rgba(236,141,31,.8)')
lyy = FT + F1['top'] * PXCM_F
size_html += hl(gx0, FT, gx1 - gx0, 'rgba(12,32,64,.22)') + hl(gx0, lyy - 4, gx1 - gx0, dash=True)
size_html += tag(gx1 + 8, FT - 5, 'COLLAR TOP', 'var(--grey)')
size_html += tag(gx1 + 8, lyy - 9, f'LOGO TOP  {F1["top"]} cm')
size_html += tag(gx1 + 8, lyy + 5, f'W {F1["w"]} cm · {F1["off"]} cm from CF', 'var(--navy)')
size_html += at(40, BT + 120, '<div class="label" style="color:var(--grey);font-size:7px;transform:rotate(-90deg);transform-origin:left top;white-space:nowrap">Back</div>')
size_html += at(40, FT + 100, '<div class="label" style="color:var(--grey);font-size:7px;transform:rotate(-90deg);transform-origin:left top;white-space:nowrap">Front</div>')


def mini_pair(f_xl=1.0):
    s = ''
    pxcm = 118 / (GRADE['L'][1] + COLLAR)
    for j, sz in enumerate(('M', 'XL')):
        cx = 52 + j * 116
        img, hem, _ = sized('back', sz, cx, 0, pxcm)
        s += img + back_art(cx, 0, pxcm, f_xl if sz == 'XL' else 1.0)
        s += at(cx - 20, hem + 4, f'<div class="mono" style="font-size:7.5px;text-align:center;color:var(--grey)">{sz}</div>', w=40)
    return s


page(4, 'Size &amp; scaling system', f'''
{at(56, 92, '<div style="font-family:Montserrat;font-weight:700;font-size:28px;line-height:1.08;text-transform:uppercase;letter-spacing:-.01em">The garment scales.<br><span class="o">The graphic doesn’t.</span></div>', w=620)}
{size_html}
{at(866, 92, '<div class="body" style="color:var(--navy)">Maintain identical artwork dimensions unless the print vendor requires a technical production adjustment.</div><div class="body" style="color:var(--navy);margin-top:8px">Keep artwork centred to the garment, not manually resized for each size.</div>', w=201)}
{at(866, 240, '', w=201, h=1, style='background:var(--hair)')}
{at(866, 256, '<div class="yes">Do</div><div class="small" style="margin-top:4px;color:var(--navy)">Same artwork dimensions across sizes.</div>', w=201)}
{at(866, 306, mini_pair(), w=201, h=150)}
{at(866, 480, '<div class="no">Don’t</div><div class="small" style="margin-top:4px;color:var(--navy)">Make XL artwork larger just because the shirt is larger.</div>', w=201)}
{at(866, 530, mini_pair(1.35), w=201, h=150)}
{at(866 + 168 - 36, 526, '<svg width="72" height="140"><line x1="6" y1="134" x2="66" y2="6" stroke="#B4472B" stroke-width="1.2"/></svg>')}
{at(866, 708, '<div class="small" style="font-size:7.5px">Approved design 01 shown. The same rule applies to 04 and 06.</div>', w=201)}
''', 'ivory')

# ------------------------------------------------------------------ 05 FINAL PRODUCTION STANDARD
SAFE_B = dict(top=12, w=30, h=48)   # proposed back safe print zone, cm (centred on centre back)
SAFE_F = 9                          # proposed front zone, cm square, centred on the logo
prod = ''
for i, (key, name, colour) in enumerate(DESIGNS):
    cx = 56 + i * 343
    fr, bk = M[key]['front'], M[key]['back']
    h = 204
    fimg, fmp, fw = garment(f'polo{key}-front', cx, 128, h)
    bimg, bmp, bw = garment(f'polo{key}-back', cx + fw - 10, 128, h)
    prod += fimg + bimg
    # front: centreline + logo box + front zone
    cfx, cft = fmp(fr['centre'], fr['top'])
    _, cfh = fmp(fr['centre'], fr['hem'])
    prod += vl(cfx, cft, cfh - cft, 'rgba(236,141,31,.85)', dash=True)
    l0 = fmp(fr['art'][0], fr['art'][1]); l1 = fmp(fr['art'][2], fr['art'][3])
    prod += rect(l0[0] - 1, l0[1] - 1, l1[0] + 1, l1[1] + 1, wt=1)
    kf = (l1[0] - l0[0]) / fr['art_cm']['w']
    zc = ((l0[0] + l1[0]) / 2, (l0[1] + l1[1]) / 2)
    prod += rect(zc[0] - SAFE_F * kf / 2, zc[1] - SAFE_F * kf / 2, zc[0] + SAFE_F * kf / 2, zc[1] + SAFE_F * kf / 2, '#5B6B85', dash=True)
    # back: centreline + artwork box + safe zone
    bcx, bct = bmp(bk['centre'], bk['top'])
    _, bch = bmp(bk['centre'], bk['hem'])
    prod += vl(bcx, bct, bch - bct, 'rgba(236,141,31,.85)', dash=True)
    a0 = bmp(bk['art'][0], bk['art'][1]); a1 = bmp(bk['art'][2], bk['art'][3])
    prod += rect(a0[0] - 1, a0[1] - 1, a1[0] + 1, a1[1] + 1, wt=1)
    kb = bk['pxcm'] * (a1[0] - a0[0]) / (bk['art'][2] - bk['art'][0])
    prod += rect(bcx - SAFE_B['w'] * kb / 2, bct + SAFE_B['top'] * kb, bcx + SAFE_B['w'] * kb / 2, bct + (SAFE_B['top'] + SAFE_B['h']) * kb, '#5B6B85', dash=True)
    ns = 'rgba(255,255,255,.75)' if colour == 'Navy' else 'var(--navy70)'
    _, ny = bmp(bk['centre'], bk['top'] + 0.86 * (bk['hem'] - bk['top']))
    prod += tag(bcx - 60, ny, 'NEGATIVE SPACE', ns, 'center', 120, 6.5)
    _, nyf = fmp(fr['centre'], fr['top'] + 0.7 * (fr['hem'] - fr['top']))
    prod += tag(cfx - 60, nyf, 'NEGATIVE SPACE', ns, 'center', 120, 6.5)
    a, f = bk['art_cm'], fr['art_cm']
    prod += at(cx, 356, f'''<div class="label" style="color:var(--grey);font-size:7px">{key}</div><div class="h-xs" style="margin-top:2px">{name} <span class="g" style="font-weight:500">· {colour}</span></div>
<table class="mono" style="margin-top:8px;font-size:8px;color:var(--navy70);border-collapse:collapse;line-height:1.55">
<tr><td style="padding-right:10px;color:var(--grey)">FRONT LOGO</td><td>{f["w"]} × {f["h"]} cm · {f["off"]} cm from CF · top {f["top"]} cm</td></tr>
<tr><td style="padding-right:10px;color:var(--grey)">BACK ART</td><td>{a["w"]} × {a["h"]} cm · centred · top {a["top"]} cm</td></tr>
<tr><td style="padding-right:10px;color:var(--grey)">CLEAN</td><td>{round(100 - fr["occupancy"], 1)}% front · {round(100 - bk["occupancy"])}% back</td></tr></table>''', w=330)
legend = ''.join(f'<div style="display:flex;align-items:center;gap:6px"><div style="width:18px;height:0;border-top:1px {st} {c}"></div><span class="mono" style="font-size:7.5px;color:var(--navy70)">{t}</span></div>' for t, c, st in [
    ('FRONT LOGO / BACK ARTWORK', 'var(--orange)', 'solid'), ('CENTRELINE', 'var(--orange)', 'dashed'), ('SAFE PRINT ZONE', '#5B6B85', 'dashed')])
legend += '<div style="display:flex;align-items:center;gap:6px"><div style="width:12px;height:12px;background:#fff;box-shadow:inset 0 0 0 1px var(--hair)"></div><span class="mono" style="font-size:7.5px;color:var(--navy70)">NEGATIVE SPACE — EVERYTHING OUTSIDE THE BOXES</span></div>'
checks = ['Use official Healthsoft artwork only.', 'Preserve logo proportions.', 'Keep front branding small.', 'Keep back artwork centred.',
          'Maintain fixed print dimensions across M / L / XL.', 'Match Healthsoft Orange and Navy accurately.', 'Produce one physical sample before bulk production.']
chk = ''.join(f'<div style="display:flex;gap:10px;margin-bottom:7px"><span class="mono" style="font-size:9px;color:var(--orange);font-weight:600;width:14px">{i + 1}</span><span style="font-size:10px;color:var(--navy)">{t}</span></div>' for i, t in enumerate(checks))
page(5, 'Final production standard', f'''
{at(56, 92, '<div style="display:flex;gap:26px">' + legend + '</div>')}
{prod}
{at(56, 474, '', w=1011, h=1, style='background:var(--hair)')}
{at(56, 498, '<div class="eyebrow">Vendor checklist</div>')}
{at(56, 528, chk, w=330)}
{at(440, 498, '<div class="eyebrow">Final approval rule</div>')}
{at(440, 528, '<div style="font-family:Montserrat;font-weight:700;font-size:19px;line-height:1.25">The T-shirt should feel like a premium Healthsoft brand object, not promotional merchandise.</div>', w=330)}
{at(440, 640, '<div class="small" style="font-size:7.5px;line-height:1.5">Sizes measured on the approved mockups, calibrated to a size L body length of 74 cm (HPS to hem) plus a 4 cm collar, ±1 cm. Safe print zones are proposed. Confirm against the vendor’s size spec and the physical sample.</div>', w=330)}
{at(834, 498, '', w=233, h=210, style='background:var(--ivory)')}
{at(834, 498, logo('full', 'orange', 150), w=233, h=210, style='display:flex;align-items:center;justify-content:center')}
''')

html = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Healthsoft Polo Apparel System</title>
<link rel="stylesheet" href="../style.css"></head><body>{''.join(pages)}</body></html>'''
open(os.path.join(HERE, 'index.html'), 'w').write(html)
print(len(pages), 'pages')
