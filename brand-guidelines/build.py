"""Healthsoft Brand Guidelines — page source. Writes index.html next to this file."""
import base64, io, os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
VERSION = 'BRAND GUIDELINES V1.0'
DATE = 'OCTOBER 2026'

# Logo artwork pixel sizes (4x of the master raster, tight to ink + 2 px).
ASPECT = {'full': 1772 / 1328, 'symbol': 740 / 668, 'wordmark': 1628 / 324, 'symword': 1628 / 1032, 'tagline': 1772 / 260}
# Product plates and the ground they were photographed on.
PLATES = {
    'guardrail-navy': ('#0C1E3C', 728 / 928), 'healthguard-sand': ('#0C1D36', 776 / 928),
    'guardrail-ivory': ('#E8E1DA', 400 / 524), 'healthguard-orange': ('#E8E1DA', 528 / 528), 'keeper-ivory': ('#E8E1DA', 640 / 528),
}

pages = []


def page(title, body, cls='', foot=True):
    n = len(pages) + 1
    t = f'<div class="ptitle"><span class="pn">{n:02d} /</span> {title}</div>' if title else ''
    f = f'<div class="foot"><span>HEALTHSOFT / {VERSION}</span><span>{n:02d}</span></div>' if foot else ''
    pages.append(f'<section class="page {cls}">{t}{body}{f}</section>')


def logo(kind='full', color='orange', w=200, style=''):
    h = w / ASPECT[kind]
    return f'<img src="assets/logo-{kind}-{color}.png" style="width:{w:.1f}px;height:{h:.1f}px;{style}">'


_masks = {}


def mlogo(kind, css, w, style=''):
    """Logo silhouette filled with arbitrary CSS paint — used only to show misuse."""
    if kind not in _masks:
        im = Image.open(os.path.join(HERE, f'assets/logo-{kind}-black.png'))
        im.thumbnail((600, 600))
        buf = io.BytesIO()
        im.save(buf, 'PNG')
        _masks[kind] = 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode()
    h = w / ASPECT[kind]
    u = _masks[kind]
    return (f'<div style="width:{w}px;height:{h:.1f}px;background:{css};-webkit-mask:url({u}) center/contain no-repeat;'
            f'mask:url({u}) center/contain no-repeat;{style}"></div>')


def at(x, y, inner, w=None, h=None, style=''):
    wh = (f'width:{w}px;' if w is not None else '') + (f'height:{h}px;' if h is not None else '')
    return f'<div class="abs" style="left:{x}px;top:{y}px;{wh}{style}">{inner}</div>'


def plate(name, x, y, w, h, bg=None, pad=0, style=''):
    ground = bg or PLATES[name][0]
    return (f'<div class="plate" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px;background:{ground};padding:{pad}px;{style}">'
            f'<img src="assets/{name}.png"></div>')


def ph(x, y, w, h, code, desc, style='', small=False, zones=()):
    guides = ''.join(
        f'<div class="gl" style="left:{w * f:.0f}px;top:0;width:1px;height:100%"></div><div class="gl" style="top:{h * f:.0f}px;left:0;height:1px;width:100%"></div>'
        for f in (1 / 3, 2 / 3))
    crops = ''.join(f'<div class="crop" style="{a}"></div>' for a in (
        'left:6px;top:6px;border-left-width:1px;border-top-width:1px', 'right:6px;top:6px;border-right-width:1px;border-top-width:1px',
        'left:6px;bottom:6px;border-left-width:1px;border-bottom-width:1px', 'right:6px;bottom:6px;border-right-width:1px;border-bottom-width:1px'))
    d = f'<div class="desc" style="{"font-size:7px" if small else ""}">{desc}</div>' if desc else ''
    for zx, zy, zw, zh, zl, kind in zones:
        bd = 'border:1px dashed rgba(12,32,64,.4);background:rgba(255,255,255,.18)' if kind == 's' else 'background:repeating-linear-gradient(135deg,rgba(236,141,31,.10) 0 6px,rgba(236,141,31,0) 6px 12px);border:1px solid rgba(236,141,31,.45)'
        d += (f'<div style="position:absolute;left:{zx * w:.0f}px;top:{zy * h:.0f}px;width:{zw * w:.0f}px;height:{zh * h:.0f}px;{bd}">'
              f'<span style="position:absolute;left:6px;top:5px;font-size:6.5px;letter-spacing:.16em;font-weight:600;color:rgba(12,32,64,.6)">{zl}</span></div>')
    return f'<div class="ph" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px;{style}">{guides}{crops}<div class="code">{code}</div>{d}</div>'


def eyebrow(t, cls=''):
    return f'<div class="eyebrow {cls}">{t}</div>'


def ul(items, cls=''):
    return f'<ul class="list {cls}">' + ''.join(f'<li>{i}</li>' for i in items) + '</ul>'


def verdict(ok, text):
    return f'<div class="{"yes" if ok else "no"}" style="{"" if ok else ""}">{text}</div>'


# ---------------------------------------------------------------- 01 COVER
page('', f'''
{at(56, 52, logo('symword', 'orange', 132))}
{at(56, 360, '<div class="eyebrow">Master brand system</div>')}
{at(56, 392, '<div class="h-xl" style="font-size:76px">Brand<br>Guidelines</div>', w=640)}
{at(56, 586, '<div class="lead" style="max-width:430px;color:var(--navy70)">How Healthsoft looks, sounds and behaves — for designers, marketers, developers, social, photography, print, events, agencies and production partners.</div>')}
{at(700, 0, '', w=423, h=794, style='background:var(--sand)')}
{at(752, 300, plate('guardrail-ivory', 0, 6, 82, 108) + plate('healthguard-orange', 108, 6, 108, 108) + plate('keeper-ivory', 240, 0, 132, 112), w=372, h=120)}
{at(752, 436, '<div class="label" style="color:var(--navy70);line-height:2">Safety &nbsp;/&nbsp; Health &nbsp;/&nbsp; Medication</div>')}
{at(752, 472, '<div class="h-s" style="font-weight:600;font-size:17px">Three needs.<br>One care system.</div>')}
<div class="foot"><span>HEALTHSOFT / {VERSION}</span><span>{DATE}</span></div>
''', 'ivory', foot=False)

# ---------------------------------------------------------------- 02 BRAND IN ONE SENTENCE
page('Brand in one sentence', f'''
{at(56, 250, '<div class="h-l" style="font-size:46px;font-weight:600;line-height:1.16">Healthsoft is a care brand that uses technology to keep older adults and their families connected — to each other, and to what matters.</div>', w=900)}
{at(56, 520, '<div class="rule"></div>')}
{at(56, 540, '<div class="body" style="max-width:420px">Every decision in this document comes back to this sentence. If a layout, a photograph or a line of copy makes Healthsoft feel like a device company with care messaging, it is wrong — however good it looks.</div>')}
''')

# ---------------------------------------------------------------- 03 BRAND IDEA
page('Brand idea', f'''
{at(56, 200, '<div class="eyebrow">The organising idea</div>')}
{at(56, 236, '<div class="h-xl" style="font-size:70px;line-height:1.06">Care should keep<br>people connected,<br><span style="color:#8C97AA">not keep them<br>checking.</span></div>', w=760)}
{at(820, 236, '<div class="label" style="color:var(--orange);margin-bottom:14px">Human first. Technology second.</div><div class="body" style="color:#C5CCD8">Healthsoft exists to help people live with more independence while helping families stay close to what matters. Technology does the quiet work in the background — it is never the hero of the story.</div><div class="body" style="color:#C5CCD8;margin-top:12px">The test for anything we make: does it give someone more confidence and fewer reasons to worry, call or check?</div>', w=246)}
''', 'navy')

# ---------------------------------------------------------------- 04 BRAND PROMISE
page('Brand promise', f'''
{at(56, 150, '<div class="eyebrow">What every touchpoint should leave behind</div>')}
{at(56, 186, '<div class="h-xl" style="font-size:58px;line-height:1.12">Less checking.<br>More confidence.<br>More independence.<br>More human connection.</div>', w=700)}
{at(760, 186, '<div class="h-xs" style="margin-bottom:10px">We promise</div>' + ul(['Practical help with everyday care needs: safety, health visibility and medication routine.', 'Simple products that fit around a person’s life, not the other way round.', 'A calm, clear and respectful experience for the person and their family.']), w=300)}
{at(760, 430, '<div class="h-xs" style="margin-bottom:10px">We never promise</div>' + ul(['Clinical outcomes, diagnoses or medical guarantees.', 'Guaranteed safety, response times or performance figures.', 'Regulatory approvals — unless verified and supplied by Healthsoft.'], 'x'), w=300)}
{at(760, 610, '<div class="note">Claims of any kind must come from verified Healthsoft source material. When in doubt, describe the human benefit, not the technical result.</div>', w=300)}
''', 'ivory')

# ---------------------------------------------------------------- 05 BRAND PERSONALITY
traits = [
    ('Caring', 'Warm, attentive, generous with time.', 'Sentimental or syrupy.'),
    ('Clear', 'Plain words. One idea at a time.', 'Vague, technical or clever.'),
    ('Dependable', 'Consistent and considered, every time.', 'Boastful or over-promising.'),
    ('Modern', 'Current, well made, quietly confident.', 'Gadget-led or flashy.'),
    ('Human', 'Real people living real routines.', 'Stereotypes or stock clichés.'),
    ('Calm', 'Steady tone, quiet layouts, space to breathe.', 'Alarmist or urgent.'),
    ('Empowering', 'Independence first. The person is in charge.', 'Patronising or protective.'),
    ('Connected', 'Families and needs joined up — gently.', 'Surveillance or monitoring.'),
]
cells = ''
for i, (w_, is_, not_) in enumerate(traits):
    cx, cy = 56 + (i % 4) * 256, 180 + (i // 4) * 260
    cells += at(cx, cy, f'''<div class="mono" style="font-size:9px;color:var(--grey);font-weight:600;letter-spacing:.12em">{i + 1:02d}</div>
<div class="h-m" style="margin:18px 0 18px">{w_}</div><div class="hr" style="margin-bottom:12px"></div>
<div class="label" style="font-size:7.5px;color:var(--grey);margin-bottom:4px">We are</div><div class="body" style="color:var(--navy);margin-bottom:12px">{is_}</div>
<div class="label" style="font-size:7.5px;color:var(--grey);margin-bottom:4px">Never</div><div class="body">{not_}</div>''', w=216)
page('Brand personality', cells)

# ---------------------------------------------------------------- 06 AUDIENCE & HUMAN CONTEXT
page('Audience &amp; human context', f'''
{ph(56, 120, 330, 420, 'PH-A1', 'The person living with it. Approx. 65–80. At home, in their own routine, in charge of their day.')}
{ph(402, 120, 250, 420, 'PH-A2', 'The family who cares. Approx. 30–50. Close, but not hovering.')}
{at(700, 120, '<div class="eyebrow">The human insight</div>')}
{at(700, 152, '<div class="h-l" style="font-size:40px">You buy it.<br><span class="g">They live with it.</span></div>', w=360)}
{at(700, 290, '<div class="h-xs" style="margin-bottom:6px">The person living with it</div><div class="body">Wants to keep their independence, their routine and their dignity. Does not want to be fussed over, watched or reminded that they are getting older.</div>', w=360)}
{at(700, 388, '<div class="h-xs" style="margin-bottom:6px">The family who cares</div><div class="body">Wants reassurance without hovering — fewer anxious calls, fewer “did you take it?” conversations, more time simply talking.</div>', w=360)}
{at(700, 486, '<div class="h-xs" style="margin-bottom:6px">Design implication</div>' + ul(['The older adult is the protagonist, never the problem.', 'Show both generations as equals — side by side, not one looking after the other.', 'Products appear in life, not in place of it.']), w=360)}
{at(56, 556, '<div class="small">Frames marked PH are photography direction, not photographs. No approved human photography was supplied; commission or license imagery to these briefs (see pages 23–24).</div>', w=600)}
''')

# ---------------------------------------------------------------- 07 PRODUCT ECOSYSTEM
eco = ''
for i, (role, name, pl, pw) in enumerate([('Safety', 'Guard Rail', 'guardrail-ivory', 96), ('Health', 'Health Guard', 'healthguard-orange', 126), ('Medication', 'The Keeper', 'keeper-ivory', 150)]):
    cx = 132 + i * 300
    eco += plate(pl, cx, 400, 260, 196, pad=36)
    eco += at(cx, 612, f'<div class="label" style="color:var(--grey)">{role}</div><div class="h-s" style="margin-top:6px">{name}</div>', w=260)
page('Product ecosystem', f'''
{at(0, 116, logo('symword', 'orange', 120), w=1123, style='display:flex;justify-content:center')}
{at(0, 210, '<div style="width:1px;height:38px;background:var(--navy);margin:0 auto"></div>', w=1123)}
{at(0, 262, '<div class="h-m" style="text-align:center">Three needs. One care system.</div>', w=1123)}
{at(262, 330, '', w=600, h=1, style='background:var(--navy)')}
{''.join(at(262 + k * 300, 330, '', w=1, h=70, style='background:var(--navy)') for k in range(3))}
{eco}
{at(132, 676, '<div class="body" style="max-width:860px">Healthsoft connects everyday care needs — safety, health visibility and medication routine — into one coherent brand ecosystem. Each product has one role and one name. Together they are always presented in this order: Safety, Health, Medication.</div>')}
''')

# ---------------------------------------------------------------- 08 LOGO INTRODUCTION
page('Logo', f'''
{at(0, 150, logo('full', 'orange', 430), w=1123, style='display:flex;justify-content:center')}
{at(56, 650, '<div class="h-xs">The primary logo</div><div class="body" style="margin-top:6px">Symbol, wordmark and tagline bar form one fixed unit. Always reproduce it from the master artwork supplied by Healthsoft.</div>', w=300)}
{at(400, 650, '<div class="h-xs">The wordmark</div><div class="body" style="margin-top:6px">Existing proprietary logo artwork. It is not set in a typeface and must never be retyped, redrawn or substituted with Montserrat or Inter.</div>', w=300)}
{at(744, 650, '<div class="h-xs">Source artwork</div><div class="body" style="margin-top:6px">This edition was built from the official logo raster (447 × 447 px). Request the vector master (SVG / AI / EPS) before any print or signage production.</div>', w=322)}
''', 'ivory')

# ---------------------------------------------------------------- 09 LOGO CONSTRUCTION
K = 1.25  # display px per master px
LX, LY = 120, 130
Xs = 61 * K


def hline(x, y, w, c='var(--orange)'):
    return at(x, y, '', w=w, h=1, style=f'background:{c}')


def vline(x, y, h, c='var(--orange)'):
    return at(x, y, '', w=1, h=h, style=f'background:{c}')


def tag(x, y, t, align='left'):
    return at(x, y, f'<div class="mono" style="font-size:8.5px;font-weight:600;color:var(--orange);letter-spacing:.06em;text-align:{align}">{t}</div>', w=90 if align != 'left' else None)


con = at(LX, LY, logo('full', 'orange', 443 * K))
ink_top, sym_b, wm_t, wm_b, bar_t, bar_b = (2, 165, 179, 256, 269, 330)
for yy in (ink_top, sym_b, wm_t, wm_b, bar_t, bar_b):
    con += hline(LX - 30, LY + yy * K, 443 * K + 60, 'rgba(236,141,31,.55)')
right = LX + 443 * K + 40
con += tag(right, LY + (ink_top + sym_b) / 2 * K - 6, 'SYMBOL  2.67X')
con += tag(right, LY + (wm_t + wm_b) / 2 * K - 6, 'WORDMARK  1.26X')
con += tag(right, LY + (bar_t + bar_b) / 2 * K - 6, 'TAGLINE BAR  1X')
con += tag(right, LY + (sym_b + wm_t) / 2 * K - 6, '0.23X')
con += tag(right, LY + (wm_b + bar_t) / 2 * K - 6, '0.21X')
con += vline(LX + 2 * K, LY + bar_b * K + 18, 14) + vline(LX + 441 * K, LY + bar_b * K + 18, 14)
con += hline(LX + 2 * K, LY + bar_b * K + 25, 439 * K)
con += at(LX, LY + bar_b * K + 36, '<div class="mono" style="font-size:8.5px;font-weight:600;color:var(--orange);letter-spacing:.06em;text-align:center">TAGLINE BAR WIDTH = 7.2X = OVERALL WIDTH</div>', w=443 * K)
page('Logo construction', con + f'''
{at(790, 130, '<div class="eyebrow">Anatomy</div>')}
{at(790, 160, '<div class="h-s">One unit, three parts.</div>')}
{at(790, 196, '<div class="body"><b style="color:var(--navy)">1 &nbsp;Symbol.</b> A single-line elephant — memory, family, gentleness. The eye and the open curl of the trunk are part of its character.<br><br><b style="color:var(--navy)">2 &nbsp;Wordmark.</b> Proprietary lettering, centred under the symbol.<br><br><b style="color:var(--navy)">3 &nbsp;Tagline bar.</b> “Defined by Care. Driven by Love.” reversed out of a solid bar. It defines the overall width of the logo.</div>', w=270)}
{at(790, 470, '<div class="note">X = height of the tagline bar. All proportions are measured from the master artwork and are for checking reproductions only. Never rebuild the logo from these figures.</div>', w=270)}
''')

# ---------------------------------------------------------------- 10 CLEAR SPACE
def clear_box(x, y, kind, w, xunit, label):
    h = w / ASPECT[kind]
    pad = xunit
    s = at(x - pad, y - pad, '', w=w + 2 * pad, h=h + 2 * pad, style='border:1px dashed rgba(236,141,31,.9);background:rgba(236,141,31,.06)')
    s += at(x, y, logo(kind, 'orange', w), style='background:var(--white)')
    s += at(x, y, '', w=w, h=h, style='outline:1px solid rgba(12,32,64,.25)')
    for (bx, by) in ((x - pad, y + h / 2 - pad / 2), (x + w, y + h / 2 - pad / 2), (x + w / 2 - pad / 2, y - pad), (x + w / 2 - pad / 2, y + h)):
        s += at(bx, by, f'<div style="width:{pad}px;height:{pad}px;background:rgba(236,141,31,.35);display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:var(--navy)">X</div>')
    s += at(x - pad, y + h + pad + 18, f'<div class="small" style="color:var(--navy70)">{label}</div>', w=w + 2 * pad)
    return s


cw = 300
page('Logo clear space', f'''
{clear_box(150, 210, 'full', cw, 61 * cw / 443, '<b style="color:var(--navy)">Primary logo.</b> Clear space = X on all sides, where X is the height of the tagline bar.')}
{clear_box(660, 230, 'symbol', 130, 167 * 130 / 185 / 2.67, '<b style="color:var(--navy)">Symbol.</b> Clear space = 3/8 of symbol height.')}
{at(660, 560, '<div class="body">Clear space is the minimum. In editorial layouts, give the logo far more room — the approved apparel places the symbol alone on a large field of colour.</div><div class="body" style="margin-top:10px">Nothing — type, image edges, folds, trims or other logos — may enter the clear-space zone.</div>', w=380)}
''')

# ---------------------------------------------------------------- 11 MINIMUM SIZE
def minrow(x, kind, wpx, mm, px, title, note):
    h = wpx / ASPECT[kind]
    return (at(x, 380 - h, logo(kind, 'orange', wpx)) +
            at(x, 410, f'<div class="h-xs">{title}</div><div class="mono" style="font-size:22px;font-family:Montserrat;font-weight:700;margin:10px 0 2px">{mm}</div>'
                       f'<div class="small">print width</div><div class="mono" style="font-size:22px;font-family:Montserrat;font-weight:700;margin:10px 0 2px">{px}</div><div class="small">digital width</div>'
                       f'<div class="body" style="margin-top:14px">{note}</div>', w=220))


page('Logo minimum size', f'''
{at(56, 118, '<div class="body" style="max-width:520px">Shown at minimum print size. Below these sizes the tagline and the elephant’s eye stop reading. If space is smaller, change lockup — never shrink further.</div>')}
{minrow(56, 'full', 121, '32 mm', '180 px', 'Primary logo', 'With tagline bar. Below 32 mm, use the logo without tagline.')}
{minrow(316, 'symword', 76, '20 mm', '96 px', 'Logo without tagline', 'Symbol and wordmark. For small digital placements, app bars and narrow print.')}
{minrow(576, 'symbol', 30, '8 mm', '24 px', 'Symbol', 'App icon, favicon, social avatar. A dedicated small-size cut must be made from the vector master.')}
{minrow(836, 'symbol', 95, '25 mm', '—', 'Symbol — embroidery', 'Garments and textiles. Confirm thread weight and minimum line thickness with a sew-out sample.')}
''')

# ---------------------------------------------------------------- 12 LOGO VERSIONS (LOCKUPS)
hz_s = 92
hz_w = 250
page('Logo versions', f'''
{at(56, 116, '', w=320, h=290, style='background:var(--ivory)')}
{at(56, 116, logo('full', 'orange', 190), w=320, h=290, style='display:flex;align-items:center;justify-content:center')}
{at(56, 420, '<div class="h-xs">1 &nbsp;Primary — vertical</div><div class="small" style="margin-top:4px">Default. Use wherever space allows.</div>')}
{at(400, 116, '', w=320, h=290, style='background:var(--ivory)')}
{at(400, 116, logo('symword', 'orange', 170), w=320, h=290, style='display:flex;align-items:center;justify-content:center')}
{at(400, 420, '<div class="h-xs">2 &nbsp;Vertical — without tagline</div><div class="small" style="margin-top:4px">Small sizes, digital headers, merchandise.</div>')}
{at(744, 116, '', w=323, h=290, style='background:var(--ivory)')}
{at(744, 116, logo('symbol', 'orange', 112), w=323, h=290, style='display:flex;align-items:center;justify-content:center')}
{at(744, 420, '<div class="h-xs">3 &nbsp;Symbol</div><div class="small" style="margin-top:4px">Avatars, app icon, apparel chest mark. Only where Healthsoft is already identified.</div>', w=300)}
{at(56, 486, '', w=664, h=190, style='background:var(--ivory)')}
{at(56, 486, f'<div style="display:flex;align-items:center;gap:{hz_s * 0.32:.0f}px">{logo("symbol", "orange", hz_s * ASPECT["symbol"] * 0.98)}{logo("wordmark", "orange", hz_w)}</div>', w=664, h=190, style='display:flex;align-items:center;justify-content:center')}
{at(56, 690, '<div class="h-xs">4 &nbsp;Horizontal</div><div class="small" style="margin-top:4px">Wide, shallow spaces: web headers, email signatures, signage fascias. Tagline is set separately as copy, not attached.</div>', w=600)}
{at(744, 486, '<div class="note" style="margin-top:4px">The horizontal lockup is assembled from the master symbol and wordmark without altering either. It is <b>proposed for approval</b>: once approved, have it built as a single vector master file and use only that file.</div><div class="body" style="margin-top:16px">Never create other lockups. Never set the symbol beside the full logo with tagline, or stack the tagline under the horizontal version.</div>', w=323)}
''')

# ---------------------------------------------------------------- 13 COLOUR VERSIONS
cv = [
    ('var(--white)', logo('full', 'orange', 150), 'Orange on white', 'Primary. First choice for every application.', True),
    ('var(--ivory)', logo('full', 'orange', 150), 'Orange on warm ivory', 'Primary on brand backgrounds.', True),
    ('var(--white)', logo('full', 'navy', 150), 'Navy one-colour', 'One-colour print, engraving, forms, low-cost print.', True),
    ('var(--navy)', logo('full', 'white', 150), 'White reverse', 'On Healthsoft navy and calm, dark photography.', True),
    ('var(--navy)', logo('symbol', 'orange', 70), 'Orange symbol on navy', 'As approved on Apparel Collection V3.', True),
    ('var(--sand)', logo('symbol', 'orange', 70), 'Orange symbol on sand', 'As approved on Apparel Collection V3.', True),
    ('var(--white)', logo('full', 'black', 150), 'Black', 'Only where navy cannot be printed — newspapers, fax, laser etch.', True),
    ('var(--orange)', logo('symword', 'white', 120), 'White on orange', 'Rare. Small promotional items only — never the default.', True),
]
cvh = ''
for i, (bg, lg, t, d, ok) in enumerate(cv):
    cx, cy = 56 + (i % 4) * 256, 116 + (i // 4) * 300
    cvh += at(cx, cy, '', w=236, h=200, style=f'background:{bg};{"outline:1px solid var(--hair);outline-offset:-1px" if bg == "var(--white)" else ""}')
    cvh += at(cx, cy, lg, w=236, h=200, style='display:flex;align-items:center;justify-content:center')
    cvh += at(cx, cy + 212, f'<div class="h-xs">{t}</div><div class="small" style="margin-top:3px">{d}</div>', w=236)
page('Logo colour versions', cvh)

# ---------------------------------------------------------------- 14 BACKGROUND CONTROL
bgs = [
    ('var(--white)', logo('symword', 'orange', 104), True, 'White', 'Orange logo'),
    ('var(--ivory)', logo('symword', 'orange', 104), True, 'Warm ivory', 'Orange logo'),
    ('var(--sand)', logo('symword', 'orange', 104), True, 'Sand', 'Orange logo'),
    ('var(--navy)', logo('symword', 'white', 104), True, 'Healthsoft navy', 'White or orange'),
    ('linear-gradient(155deg,#EFE8DE,#D3C6B6)', logo('symword', 'navy', 104), True, 'Calm, light photography', 'Navy or orange, in a quiet area'),
    ('var(--grey)', logo('symword', 'orange', 104), False, 'Mid grey', 'Too little contrast'),
    ('#0473FB', logo('symword', 'white', 104), False, 'Product colours', 'Never sit the logo on device colours'),
    ('linear-gradient(120deg,#EC8D1F,#C2185B,#0C2040)', logo('symword', 'white', 104), False, 'Gradients', 'No gradient grounds'),
    ('repeating-linear-gradient(45deg,#C9B9A6 0 10px,#7A6A5A 10px 20px,#E2D4C0 20px 28px)', logo('symword', 'orange', 104), False, 'Busy image areas', 'Move the logo or the crop'),
    ('var(--orange)', logo('symword', 'navy', 104), False, 'Orange field + navy logo', 'Use white, or change ground'),
]
bh = ''
for i, (bg, lg, ok, t, d) in enumerate(bgs):
    cx, cy = 56 + (i % 5) * 204, 116 + (i // 5) * 300
    bh += at(cx, cy, '', w=190, h=200, style=f'background:{bg};{"outline:1px solid var(--hair);outline-offset:-1px" if bg == "var(--white)" else ""}')
    bh += at(cx, cy, lg, w=190, h=200, style='display:flex;align-items:center;justify-content:center')
    bh += at(cx, cy + 212, f'{verdict(ok, "Use" if ok else "Avoid")}<div class="h-xs" style="margin-top:8px">{t}</div><div class="small" style="margin-top:2px">{d}</div>', w=190)
page('Background control', bh)

# ---------------------------------------------------------------- 15 INCORRECT USAGE
W0 = 128
bad = [
    (f'<div style="transform:scaleX(1.45)">{logo("full", "orange", 100)}</div>', 'Do not stretch or squash.'),
    (f'<div style="transform:rotate(-14deg)">{logo("full", "orange", W0)}</div>', 'Do not rotate.'),
    (mlogo('full', '#2F6FE4', W0), 'Do not recolour.'),
    (mlogo('full', 'linear-gradient(90deg,#EC8D1F,#E0457B)', W0), 'Do not apply gradients.'),
    (f'<div style="filter:drop-shadow(4px 6px 4px rgba(0,0,0,.45))">{logo("full", "orange", W0)}</div>', 'Do not add shadows or effects.'),
    (f'<div style="filter:drop-shadow(0 0 6px #FFB347) drop-shadow(0 0 12px #FF8C00)">{logo("full", "orange", W0)}</div>', 'Do not add glow.'),
    (f'<div style="display:flex;align-items:center;gap:10px">{logo("wordmark", "orange", 96)}{logo("symbol", "orange", 34)}</div>', 'Do not rearrange elements.'),
    (f'<div style="display:flex;flex-direction:column;align-items:center;gap:4px">{logo("symbol", "orange", 50)}<span style="font-family:Montserrat;font-weight:700;font-size:22px;color:var(--orange)">Healthsoft</span></div>', 'Do not retype the wordmark.'),
    (f'<div style="width:110px;height:120px;overflow:hidden;position:relative"><div style="position:absolute;left:-40px;top:-10px">{logo("full", "orange", 180)}</div></div>', 'Do not crop the logo.'),
    (f'<div style="display:flex;flex-direction:column;align-items:center">{logo("symword", "orange", 108)}<div style="margin-top:6px;font-family:Montserrat;font-weight:600;font-size:9px;color:var(--navy)">Smart Health Monitoring</div></div>', 'Do not add or replace the tagline.'),
    (f'<div style="opacity:.35">{logo("full", "orange", W0)}</div>', 'Do not use as a faint watermark.'),
    (f'{logo("full", "orange", W0)}', 'Do not place on low-contrast grounds.'),
]
bdh = ''
for i, (inner, cap) in enumerate(bad):
    cx, cy = 56 + (i % 6) * 170, 120 + (i // 6) * 300
    bgc = 'var(--grey)' if i == 11 else 'var(--ivory)'
    bdh += at(cx, cy, inner, w=156, h=200, style=f'background:{bgc};display:flex;align-items:center;justify-content:center;overflow:hidden')
    bdh += at(cx, cy, '<svg width="156" height="200"><line x1="8" y1="192" x2="148" y2="8" stroke="#B4472B" stroke-width="1"/></svg>', w=156, h=200)
    bdh += at(cx, cy + 212, f'<div class="no">Incorrect</div><div class="small" style="margin-top:6px;color:var(--navy70)">{cap}</div>', w=156)
page('Incorrect logo usage', bdh)

# ---------------------------------------------------------------- 16 PRIMARY COLOUR
def sw_meta(name, hexv, rgb, cmyk, use, never, dark=True):
    c = '#FFFFFF' if dark else 'var(--navy)'
    sub = '#C5CCD8' if dark else 'var(--navy70)'
    return f'''<div class="h-m" style="color:{c}">{name}</div>
<table style="margin-top:22px;border-collapse:collapse;font-size:10px;color:{c}" class="mono">
<tr><td style="padding:3px 22px 3px 0;color:{sub};letter-spacing:.14em;font-size:8px">HEX</td><td style="font-weight:600">{hexv}</td></tr>
<tr><td style="padding:3px 22px 3px 0;color:{sub};letter-spacing:.14em;font-size:8px">RGB</td><td style="font-weight:600">{rgb}</td></tr>
<tr><td style="padding:3px 22px 3px 0;color:{sub};letter-spacing:.14em;font-size:8px">CMYK</td><td style="font-weight:600">{cmyk}</td></tr></table>
<div style="margin-top:22px;font-size:8px;letter-spacing:.16em;color:{sub};font-weight:600">USE</div><div style="font-size:10px;line-height:1.55;color:{c};margin-top:4px">{use}</div>
<div style="margin-top:14px;font-size:8px;letter-spacing:.16em;color:{sub};font-weight:600">NEVER</div><div style="font-size:10px;line-height:1.55;color:{c};margin-top:4px">{never}</div>'''


page('Primary colour', f'''
{at(56, 108, '', w=500, h=560, style='background:var(--orange)')}
{at(84, 136, '<div class="label" style="color:var(--navy)">Signal colour</div>')}
{at(84, 340, sw_meta('Healthsoft Orange', '#EC8D1F', '236 / 141 / 31', '0 / 40 / 87 / 7', 'Logo. Small signals: rules, active states, key numbers, connection lines, one highlighted word or button per view.', 'Large backgrounds, body text, warnings or alerts.', dark=False), w=440)}
{at(567, 108, '', w=500, h=560, style='background:var(--navy)')}
{at(595, 136, '<div class="label" style="color:#A9B2C2">Voice colour</div>')}
{at(595, 340, sw_meta('Healthsoft Navy', '#0C2040', '12 / 32 / 64', '81 / 50 / 0 / 75', 'All important messaging and headlines. Body text. Dark grounds for apparel, events and campaign posters.', 'Tinted below 70% for text, or combined with black.'), w=440)}
{at(56, 690, '<div class="note">Working production values: orange is measured from the official logo artwork; navy from the approved visual system. CMYK figures are mathematical conversions — verify all values against the vector master and a physical proof before manufacturing. Pantone references to be set from that proof; none are assumed here.</div>', w=1011)}
''')

# ---------------------------------------------------------------- 17 SECONDARY & NEUTRAL
sec = [
    ('Sand', '#E8E1DA', '232 / 225 / 218', '0 / 3 / 6 / 9', 'Product photography ground; apparel; quiet panels.', 'Text colour.', 'Secondary'),
    ('Navy 70', '#3D4D66', '61 / 77 / 102', '40 / 25 / 0 / 60', 'Secondary text and captions on light grounds.', 'Headlines.', 'Secondary'),
    ('Orange Tint', '#FBE8D2', '251 / 232 / 210', '0 / 8 / 16 / 2', 'Highlight fields behind small UI states.', 'Large areas or text.', 'Secondary'),
    ('Warm Ivory', '#F7F4ED', '247 / 244 / 237', '0 / 1 / 4 / 3', 'Main page and screen ground with white.', 'Text.', 'Neutral'),
    ('White', '#FFFFFF', '255 / 255 / 255', '0 / 0 / 0 / 0', 'Main ground. Reversed type on navy.', '—', 'Neutral'),
    ('Soft Grey', '#74777B', '116 / 119 / 123', '6 / 3 / 0 / 52', 'Annotations, metadata, disabled states.', 'Important messaging; small text on ivory.', 'Neutral'),
    ('Hairline', '#DDD8CF', '221 / 216 / 207', '0 / 2 / 6 / 13', 'Dividers, table rules, input borders.', 'Text or fills.', 'Neutral'),
]
sh = ''
for i, (n_, hx, rgb, cmyk, use, never, grp) in enumerate(sec):
    cx = 56 + i * 146
    sh += at(cx, 108, '', w=134, h=190, style=f'background:{hx};{"outline:1px solid var(--hair);outline-offset:-1px" if hx in ("#FFFFFF",) else ""}')
    sh += at(cx + 10, 118, f'<div class="label" style="font-size:7px;color:{"#fff" if hx in ("#3D4D66", "#74777B") else "var(--navy70)"}">{grp}</div>')
    sh += at(cx, 312, f'''<div class="h-xs" style="font-size:12.5px">{n_}</div>
<div class="mono" style="font-size:9px;line-height:1.7;margin-top:8px;color:var(--navy)"><span class="g">HEX</span> {hx}<br><span class="g">RGB</span> {rgb}<br><span class="g">CMYK</span> {cmyk}</div>
<div class="small" style="margin-top:10px;color:var(--navy70)"><b style="color:var(--navy)">Use.</b> {use}</div>
<div class="small" style="margin-top:6px;color:var(--navy70)"><b style="color:var(--navy)">Never.</b> {never}</div>''', w=134)
contrast = '''<table class="tbl" style="width:560px"><tr><th>Pairing</th><th>Contrast</th><th>Rule</th></tr>
<tr><td>Navy on white / ivory</td><td class="mono">16.2 / 14.8 : 1</td><td>All text sizes</td></tr>
<tr><td>White on navy</td><td class="mono">16.2 : 1</td><td>All text sizes</td></tr>
<tr><td>Orange on navy</td><td class="mono">6.5 : 1</td><td>Labels and short accents</td></tr>
<tr><td>Orange on white</td><td class="mono">2.5 : 1</td><td>Logo and graphics only — never text</td></tr>
<tr><td>Soft Grey on white</td><td class="mono">4.5 : 1</td><td>Captions; on ivory only at 14 pt / 18 px and above</td></tr></table>'''
page('Secondary &amp; neutral colour', sh + at(56, 520, contrast) + at(680, 524, '<div class="note">Secondary colours are proposed for approval. Sand is measured from the approved ivory polo (Apparel Collection V3). Product colours — Guard Rail blue, Health Guard band colours, Keeper pill colours — belong to the products and are never brand colours.</div>', w=387))

# ---------------------------------------------------------------- 18 COLOUR RATIOS
def mini(x, y, content, bg, w=230, h=160, outline=True):
    return at(x, y, content, w=w, h=h, style=f'background:{bg};position:absolute;overflow:hidden;{"outline:1px solid var(--hair);outline-offset:-1px" if outline else ""}')


page('Colour ratios', f'''
{at(56, 120, '<div class="flex" style="height:84px"><div style="flex:65;background:var(--ivory);outline:1px solid var(--hair);outline-offset:-1px;padding:12px"><div class="label" style="color:var(--navy70)">60–70% White / ivory</div></div><div style="flex:25;background:var(--navy);padding:12px"><div class="label" style="color:#fff">20–30% Navy</div></div><div style="flex:10;background:var(--orange);padding:12px"><div class="label" style="color:var(--navy)">5–10%</div></div></div>', w=1011)}
{at(56, 214, '<div class="body" style="max-width:640px">Healthsoft feels premium because of light and space. White and ivory carry most of every layout, navy carries the message, and orange appears only as a signal — the thing your eye should find first.</div>')}
{mini(56, 300, at(20, 26, '<div class="rule"></div>') + at(20, 40, '<div class="h-s" style="font-size:14px">Stay<br>connected<br>to what<br>matters.</div>') + at(20, 128, logo('symword', 'orange', 34)) + plate('keeper-ivory', 120, 34, 96, 92, bg='var(--ivory)'), 'var(--ivory)', w=230, h=160)}
{mini(302, 300, at(20, 26, '<div class="h-s" style="font-size:15px;color:#fff">Freedom to go.</div>') + plate('guardrail-navy', 140, 18, 72, 92, bg='var(--navy)') + at(20, 128, logo('symbol', 'orange', 22)), 'var(--navy)', w=230, h=160, outline=False)}
{mini(548, 300, at(20, 26, '<div class="h-s" style="font-size:15px">One less thing<br>to keep asking.</div>') + at(20, 120, '<span class="btn" style="background:var(--navy);color:#fff;font-size:8px;padding:6px 12px">Find your fit</span>'), 'var(--white)', w=230, h=160)}
{at(56, 474, verdict(True, 'Balanced'))}
{mini(810, 300, at(16, 22, '<div class="h-s" style="font-size:16px;color:#fff">FREEDOM TO GO!</div>') + at(16, 60, '<div style="font-size:9px;color:var(--navy);font-weight:700">ORDER NOW</div>') + at(16, 110, '<div style="width:120px;height:26px;background:var(--navy)"></div>'), 'var(--orange)', w=257, h=160, outline=False)}
{at(810, 474, verdict(False, 'Orange overload'))}
{at(810, 498, '<div class="small" style="width:257px">Orange as a background turns a signal into noise and pushes the brand towards retail promotion.</div>')}
{at(56, 560, '<div class="hr" style="width:1011px"></div>')}
{at(56, 584, '<div class="h-xs" style="margin-bottom:10px">Orange as signal — where it belongs</div>' + ul(['The logo.', 'A 24 × 3 unit rule before an eyebrow label.', 'Connection lines between products.', 'One active state, key number or highlighted word per view.']), w=480)}
{at(560, 584, '<div class="h-xs" style="margin-bottom:10px">Navy as voice</div>' + ul(['Every headline and body text.', 'Dark grounds for apparel, events and campaign posters.', 'Primary buttons (white label).']), w=480)}
''')

# ---------------------------------------------------------------- 19 TYPOGRAPHY
page('Typography', f'''
{at(56, 112, '<div class="eyebrow">Display</div>')}
{at(56, 140, '<div style="font-family:Montserrat;font-weight:700;font-size:200px;line-height:.9;letter-spacing:-.04em">Aa</div>')}
{at(56, 340, '<div class="h-m">Montserrat</div><div class="body" style="margin-top:6px">SemiBold 600 &nbsp;·&nbsp; Bold 700</div>')}
{at(56, 410, '<div style="font-family:Montserrat;font-weight:600;font-size:14px;line-height:1.5;letter-spacing:.01em">ABCDEFGHIJKLMNOPQRSTUVWXYZ<br>abcdefghijklmnopqrstuvwxyz<br>0123456789 .,:;!?&amp;—/</div>', w=440)}
{at(56, 500, '<div class="body" style="max-width:420px">Headlines, campaign lines, product names, page titles. Geometric, open and friendly — it shares the rounded, generous character of the Healthsoft wordmark without imitating it.</div>')}
{at(580, 112, '<div class="eyebrow">Functional</div>')}
{at(580, 140, '<div style="font-family:Inter;font-weight:500;font-size:200px;line-height:.9;letter-spacing:-.04em">Aa</div>')}
{at(580, 340, '<div class="h-m" style="font-family:Inter;font-weight:600">Inter</div><div class="body" style="margin-top:6px">Regular 400 &nbsp;·&nbsp; Medium 500 &nbsp;·&nbsp; SemiBold 600</div>')}
{at(580, 410, '<div style="font-family:Inter;font-weight:400;font-size:14px;line-height:1.5">ABCDEFGHIJKLMNOPQRSTUVWXYZ<br>abcdefghijklmnopqrstuvwxyz<br>0123456789 .,:;!?&amp;—/</div>', w=440)}
{at(580, 500, '<div class="body" style="max-width:420px">Body copy, interfaces, labels, captions, data and forms. Built for screens, highly legible at small sizes, with tabular figures for times and doses.</div>')}
{at(56, 600, '<div class="hr" style="width:1011px"></div>')}
{at(56, 624, '<div class="h-xs">Pairing</div><div class="body" style="margin-top:6px">Montserrat speaks, Inter explains. Never set body text in Montserrat or long headlines in Inter Regular.</div>', w=300)}
{at(400, 624, '<div class="h-xs">Licensing</div><div class="body" style="margin-top:6px">Both families are free under the SIL Open Font License (Google Fonts). Fallback: Arial / Helvetica only where web fonts cannot load.</div>', w=300)}
{at(744, 624, '<div class="h-xs">The logo is not type</div><div class="body" style="margin-top:6px">Neither family is used in the logo. The wordmark and tagline bar are fixed artwork.</div>', w=300)}
''')

# ---------------------------------------------------------------- 20 TYPE HIERARCHY
rows = [
    ('H1', '<span style="font-family:Montserrat;font-weight:700;font-size:40px;letter-spacing:-.02em;line-height:1">Freedom to go.</span>', 'Montserrat Bold', '40/44 pt', '56/60 px', '−2%'),
    ('H2', '<span style="font-family:Montserrat;font-weight:700;font-size:28px;letter-spacing:-.01em">One care system.</span>', 'Montserrat Bold', '28/32 pt', '40/46 px', '−1%'),
    ('H3', '<span style="font-family:Montserrat;font-weight:600;font-size:19px">See the change.</span>', 'Montserrat SemiBold', '18/24 pt', '24/32 px', '0'),
    ('Subhead', '<span style="font-weight:500;font-size:14px">Care around their life. Confidence around yours.</span>', 'Inter Medium', '13/20 pt', '18/28 px', '0'),
    ('Body', '<span style="font-size:11px;color:var(--navy70)">Simple support that fits around the day they already have.</span>', 'Inter Regular', '10/15 pt', '16/26 px', '0'),
    ('Caption', '<span style="font-size:8.5px;color:var(--grey)">Photography: at home, morning light.</span>', 'Inter Regular', '7.5/11 pt', '13/18 px', '+1%'),
    ('UI label', '<span style="font-size:11px;font-weight:600">Morning reminder</span>', 'Inter SemiBold', '—', '13/16 px', '+1%'),
    ('Button', '<span class="btn" style="background:var(--navy);color:#fff;font-size:10px;padding:7px 16px">Find your fit</span>', 'Inter SemiBold', '10 pt', '16/20 px', '0'),
    ('Product label', '<span class="label" style="color:var(--navy)">Guard Rail / Safety</span>', 'Inter Medium, caps', '7.5 pt', '12 px', '+18%'),
]
tr = ''.join(f'<tr><td style="width:90px;font-weight:600;color:var(--navy)">{a}</td><td style="width:420px;color:var(--navy);vertical-align:middle">{b}</td><td>{c}</td><td class="mono">{d}</td><td class="mono">{e}</td><td class="mono">{f}</td></tr>' for a, b, c, d, e, f in rows)
page('Type hierarchy', f'''
{at(56, 106, f'<table class="tbl"><tr><th>Level</th><th>Example</th><th>Typeface</th><th>Print</th><th>Digital</th><th>Tracking</th></tr>{tr}</table>', w=1011)}
{at(56, 606, '<div class="h-xs">Leading</div><div class="small" style="color:var(--navy70);margin-top:4px">Headlines 1.0–1.15. Body 1.5–1.6. Never tighter on two-line headlines than the cap height allows.</div>', w=230)}
{at(312, 606, '<div class="h-xs">Paragraph width</div><div class="small" style="color:var(--navy70);margin-top:4px">45–75 characters. Headlines ideally 2 lines, max 22 characters per line.</div>', w=230)}
{at(568, 606, '<div class="h-xs">Mobile &amp; print</div><div class="small" style="color:var(--navy70);margin-top:4px">Body never below 16 px on screen or 9 pt in print. For older readers, prefer 18 px / 11 pt.</div>', w=230)}
{at(824, 606, '<div class="h-xs">Capitals</div><div class="small" style="color:var(--navy70);margin-top:4px">Only for labels of four words or fewer, tracked +12–18%. Never for headlines or sentences.</div>', w=243)}
''')

# ---------------------------------------------------------------- 21 TONE OF VOICE
voice = [('Calm', 'We lower the temperature.'), ('Simple', 'Short words. Short sentences.'), ('Human', 'We talk to people, not users.'), ('Supportive', 'We stand beside, not over.'), ('Confident', 'We say what we do — no more.'), ('Non-alarmist', 'No fear, no urgency, no drama.')]
vh = ''.join(at(56 + i * 170, 108, f'<div class="h-s">{a}</div><div class="small" style="margin-top:6px;color:var(--navy70)">{b}</div>', w=156) for i, (a, b) in enumerate(voice))
gb = [
    ('Freedom to go. Support when it matters.', 'Never worry about a fall again.', 'Guarantees safety'),
    ('Stay connected to what matters.', 'Monitor your parent 24/7.', 'Surveillance'),
    ('One less thing to keep asking.', 'Clinically proven to stop missed doses.', 'Invented clinical claim'),
    ('See the change, not just the moment.', 'Detect illness before it’s too late.', 'Diagnostic + fear'),
    ('Mum’s morning reminder is set.', 'Elderly patient compliance alert.', 'Clinical, dehumanising'),
    ('Care around their life. Confidence around yours.', 'Don’t wait for an emergency. Act now!', 'Alarmist urgency'),
]
gbh = '<table class="tbl roomy"><tr><th style="width:44%">Healthsoft says</th><th style="width:36%">Healthsoft never says</th><th>Why not</th></tr>' + ''.join(
    f'<tr><td style="color:var(--navy);font-weight:600;font-size:11px">{a}</td><td style="text-decoration:line-through;text-decoration-color:#B4472B">{b}</td><td>{c}</td></tr>' for a, b, c in gb) + '</table>'
page('Tone of voice', vh + at(56, 220, gbh, w=640) + at(744, 220, '''<div class="h-xs" style="margin-bottom:10px">Words we use</div><div class="body" style="color:var(--navy)">parent, Mum, Dad, older adult, family, routine, day, support, reminder, connected, check in, together, independence, confidence</div>
<div class="h-xs" style="margin:22px 0 10px">Words we avoid</div><div class="body">elderly, senior citizen, patient, user (in marketing), monitor, track, surveillance, compliance, alert (in headlines), emergency (as a hook), risk, decline, frail</div>
<div class="note" style="margin-top:24px">No clinical outcomes, diagnostic claims, regulatory approvals, statistics, medical or safety guarantees — unless supplied by Healthsoft as verified source material, with the reference recorded.</div>''', w=323))

# ---------------------------------------------------------------- 22 MESSAGING ARCHITECTURE
def mcell(tag_, line, sub=''):
    return f'<div class="label" style="color:var(--grey);font-size:7.5px">{tag_}</div><div class="h-s" style="font-size:19px;margin-top:6px">{line}</div>' + (f'<div class="small" style="margin-top:3px">{sub}</div>' if sub else '')


page('Messaging architecture', f'''
{at(56, 108, mcell('Master brand', 'Healthsoft — Defined by Care. Driven by Love.'), w=500)}
{at(56, 182, '', w=1011, h=1, style='background:var(--navy)')}
{at(56, 202, mcell('Ecosystem', 'Three needs. One care system.'), w=500)}
{at(56, 276, '', w=1011, h=1, style='background:var(--hair)')}
{at(56, 296, mcell('Guard Rail / Safety', 'Freedom to go.<br>Support when it matters.'), w=320)}
{at(402, 296, mcell('Health Guard / Health', 'See the change.<br>Not just the moment.'), w=320)}
{at(748, 296, mcell('The Keeper / Medication', 'One less thing<br>to keep asking.'), w=320)}
{at(56, 392, '', w=1011, h=1, style='background:var(--hair)')}
{at(56, 412, mcell('Human / brand territory', 'Stay connected to what matters.'), w=320)}
{at(402, 412, mcell('&nbsp;', 'Care around their life.<br>Confidence around yours.'), w=320)}
{at(748, 412, mcell('&nbsp;', 'A safer, brighter tomorrow.'), w=320)}
{at(56, 506, '', w=1011, h=1, style='background:var(--navy)')}
{at(56, 526, '<table class="tbl"><tr><th>Brand</th><th>Product</th><th>Campaign</th><th>CTA</th><th>Microcopy</th></tr><tr>'
     '<td>Defined by Care. Driven by Love.<br>Three needs. One care system.<br>Human first. Technology second.</td>'
     '<td>Freedom to go.<br>See the change.<br>One less thing to keep asking.</td>'
     '<td>Your day. Your way. <span class="g">(V3)</span><br>Small signals. Closer care. <span class="g">(V3)</span><br>Care, Connected. <span class="g">(V3)</span><br>You buy it. They live with it.</td>'
     '<td>Find your fit<br>Explore Guard Rail<br>See how it works<br>Talk to our team</td>'
     '<td>You’re all set.<br>Reminder set for 8:00 am.<br>We couldn’t connect just now. Try again in a moment.</td></tr></table>', w=1011)}
{at(56, 690, '<div class="note">(V3) = line already approved on Healthsoft Apparel Collection V3. “Care, Connected.” is the campaign sign-off. Use one product line per product; never mix two product lines in one headline.</div>', w=700)}
''')

# ---------------------------------------------------------------- 23 PHOTOGRAPHY
page('Photography', f'''
{ph(56, 108, 600, 400, 'PH-01', 'Hero. Mother (70s) and daughter (40s) at the kitchen table, morning light from the side. Mid-conversation, both laughing. Guard Rail worn naturally, not presented.', zones=[(0.06, 0.12, 0.36, 0.42, 'TYPE ZONE', 't'), (0.46, 0.14, 0.48, 0.7, 'SUBJECTS — EYE LINE ON UPPER THIRD', 's')])}
{at(690, 108, '<div class="eyebrow">How it should feel</div>')}
{at(690, 140, '<div class="h-m">Real. Warm. Natural.<br>Premium. Editorial.<br>Human.</div>', w=380)}
{at(690, 270, ul(['Daylight first. Soft window light, warm but neutral — never orange-tinted.', 'Real homes, real routines: tea, walking, reading, cooking, conversation.', 'Moments between people, not people looking at devices.', 'Products present but secondary — worn, used, in reach.', 'Editorial crops with room for type. Eye-level or slightly below.']), w=376)}
{at(690, 470, '<div class="h-xs" style="margin-bottom:8px">Grade</div><div class="body">Natural skin, gentle contrast, lifted shadows, true whites. No heavy filters, no teal-and-orange, no orange cast. Retouch blemishes only — never wrinkles or age.</div>', w=376)}
{ph(56, 524, 290, 160, 'PH-02', 'Walking. Father (70s) on a morning walk, mid-stride, unhurried.', small=True, zones=[(0.1, 0.2, 0.3, 0.55, 'SUBJECT', 's')])}
{ph(366, 524, 290, 160, 'PH-03', 'Routine. Hands at the counter, The Keeper beside the kettle.', small=True, zones=[(0.5, 0.25, 0.4, 0.45, 'HANDS + PRODUCT', 's')])}
{at(690, 584, '<div class="note">No approved human photography was supplied for this edition. PH frames are composition briefs for commissioning or licensing. Use camera-recorded imagery only — no AI-generated people.</div>', w=376)}
''')

# ---------------------------------------------------------------- 24 HUMAN PHOTOGRAPHY
shots = [
    ('PH-04', 'Independence', 'Mother (70s) leaving home with a bag, door open, daylight.'),
    ('PH-05', 'Family connection', 'Daughter (40s) and father (70s) on a video call, both at home, both smiling.'),
    ('PH-06', 'Ordinary life', 'Couple (70s) cooking together, one tasting from the spoon.'),
    ('PH-07', 'Quiet care', 'Son (30s) and mother (80) sitting on a step in the sun, talking.'),
]
ZN = [[(0.12, 0.3, 0.5, 0.55, 'SUBJECT', 's')], [(0.08, 0.3, 0.84, 0.42, 'TWO FACES, EQUAL', 's')], [(0.1, 0.28, 0.8, 0.5, 'COUPLE + ACTION', 's')], [(0.15, 0.45, 0.7, 0.4, 'SEATED, SIDE BY SIDE', 's')]]
shh = ''.join(ph(56 + i * 256, 108, 236, 300, c, '', small=True, zones=ZN[i]) + at(56 + i * 256, 420, f'<div class="h-xs">{t}</div><div class="small" style="margin-top:3px;color:var(--navy70)">{d}</div>', w=236) for i, (c, t, d) in enumerate(shots))
page('Human photography', shh + f'''
{at(56, 500, '<div class="hr" style="width:1011px"></div>')}
{at(56, 520, '<div class="h-xs" style="margin-bottom:10px">Casting</div>' + ul(['Older adults approx. 65–80; family approx. 30–50.', 'Real, diverse, contemporary people — styled as themselves.', 'Healthy, active, capable. Age shown honestly.']), w=300)}
{at(400, 520, '<div class="h-xs" style="margin-bottom:10px">Show</div>' + ul(['Independence, confidence, warm interaction.', 'Natural homes, walking, daily routines, conversation.', 'Two generations as equals.']), w=300)}
{at(744, 520, '<div class="h-xs" style="margin-bottom:10px">Never show</div>' + ul(['Helpless or lonely older people. Hospital beds.', 'Fake doctors, nurses or lab coats.', 'Falls, emergencies, distress, staged drama.', 'Over-posed stock, AI-looking skin, orange light.'], 'x'), w=323)}
''')

# ---------------------------------------------------------------- 25 PRODUCT PHOTOGRAPHY
page('Product photography', f'''
{plate('guardrail-ivory', 56, 108, 300, 330, pad=60)}
{plate('healthguard-orange', 372, 108, 300, 330, pad=56)}
{plate('keeper-ivory', 688, 108, 379, 330, pad=60)}
{at(56, 448, '<div class="small">Reference: approved product renders from Apparel Collection V3. Master product photography to be supplied by Healthsoft.</div>', w=800)}
{at(56, 490, '<div class="h-xs" style="margin-bottom:8px">Hero &amp; family</div>' + ul(['Premium consumer technology, not medical equipment.', 'Family shots: same light, same camera height, same ground. Order: Safety, Health, Medication.', 'Equal visual weight; align products on one baseline.']), w=230)}
{at(312, 490, '<div class="h-xs" style="margin-bottom:8px">Light &amp; shadow</div>' + ul(['One soft key from upper left, large source, gentle fill.', 'Soft contact shadow under every product. No floating, no reflections.', 'No glow, rim-light halos or neon.']), w=230)}
{at(568, 490, '<div class="h-xs" style="margin-bottom:8px">Perspective &amp; ground</div>' + ul(['Front or three-quarter, camera slightly above, 10–20° turn.', 'Grounds: Sand, Ivory, White or Navy only.', 'Macro: SOS button, band weave, Keeper display — sharp and clean.']), w=230)}
{at(824, 490, '<div class="h-xs" style="margin-bottom:8px">Accuracy</div>' + ul(['Never change geometry, colourway, display content or proportions.', 'Show true scale beside a hand or everyday object.', 'No rendered “concept” variants without approval.']), w=243)}
''')

# ---------------------------------------------------------------- 26 GRAPHIC LANGUAGE
arc = '<svg width="236" height="80" viewBox="0 0 236 80"><path d="M62 70 Q118 6 174 70" fill="none" stroke="#EC8D1F" stroke-width="2"/></svg>'
page('Graphic language', f'''
{at(56, 108, '<div class="body" style="max-width:600px">The Healthsoft graphic language is deliberately small. Space, type and photography do the work; these five elements only organise and connect.</div>')}
{at(56, 180, '', w=236, h=200, style='background:var(--ivory)')}
{at(80, 266, '<div class="eyebrow">Guard Rail</div>')}
{at(56, 392, '<div class="h-xs">1 &nbsp;Signal rule</div><div class="small" style="margin-top:4px;color:var(--navy70)">24 × 3 orange bar before an eyebrow or above a headline. One per group.</div>', w=236)}
{at(312, 180, '', w=236, h=200, style='background:var(--sand)')}
{at(312, 196, arc)}{plate('guardrail-ivory', 330, 270, 64, 80)}{plate('healthguard-orange', 466, 270, 80, 80)}
{at(312, 392, '<div class="h-xs">2 &nbsp;Connection line</div><div class="small" style="margin-top:4px;color:var(--navy70)">A thin orange arc joining products, as approved on polo 06. Only when it shows a real connection.</div>', w=236)}
{at(568, 180, '<div style="height:200px;background:var(--navy);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px"><div class="label" style="color:#fff">Health Guard / Health</div><div style="color:#fff;font-size:12px">Care, Connected.</div></div>', w=236)}
{at(568, 392, '<div class="h-xs">3 &nbsp;Label system</div><div class="small" style="margin-top:4px;color:var(--navy70)">PRODUCT / ROLE in tracked capitals. Fixed format, as on the approved apparel.</div>', w=236)}
{at(824, 180, '<div style="height:200px;background:var(--ivory);padding:24px"><div style="font-family:Montserrat;font-weight:700;font-size:24px"><span class="g" style="font-weight:600">04 /</span> SAND</div><div class="hr" style="margin-top:58px"></div><div class="small mono" style="margin-top:8px">01 &nbsp; Understand<br>02 &nbsp; Choose<br>03 &nbsp; Get started</div></div>', w=243)}
{at(824, 392, '<div class="h-xs">4 &nbsp;Numbers &amp; hairlines</div><div class="small" style="margin-top:4px;color:var(--navy70)">“04 /” section numbers, numbered steps, 1 px hairlines in Hairline grey.</div>', w=243)}
{at(56, 480, '<div class="hr" style="width:1011px"></div>')}
{at(56, 504, '<div class="h-xs" style="margin-bottom:10px">5 &nbsp;Space — the main element</div><div class="body" style="max-width:420px">Large negative space is not empty; it is how Healthsoft shows calm. If a layout feels unfinished, remove something rather than adding decoration.</div>', w=440)}
{at(560, 504, '<div class="h-xs" style="margin-bottom:10px">Not part of the language</div>' + ul(['Random circles, blobs, waves or decorative curves.', 'Floating UI cards and glass panels.', 'Healthcare icons (hearts, crosses, pulses) as decoration.', 'Neon glow, AI gradients, heavy infographics.'], 'x'), w=507)}
''')

# ---------------------------------------------------------------- 27 LAYOUT GRID
gx, gy, gw, gh = 56, 108, 560, 396
cols = ''.join(at(gx + 30 + i * ((gw - 60 - 11 * 10) / 12 + 10), gy + 24, '', w=(gw - 60 - 110) / 12, h=gh - 48, style='background:rgba(236,141,31,.08)') for i in range(12))
page('Layout grid', f'''
{at(gx, gy, '', w=gw, h=gh, style='background:var(--ivory)')}
{cols}
{at(gx + 30, gy + 24, '', w=gw - 60, h=gh - 48, style='outline:1px dashed rgba(236,141,31,.7)')}
{at(gx + 30, gy + 60, '<div class="rule"></div><div class="h-s" style="margin-top:8px;font-size:22px">Message first.</div>', w=250)}
{plate('keeper-ivory', gx + 300, gy + 60, 200, 170)}
{at(gx + 30, gy + 260, '<div class="small" style="color:var(--navy70);width:200px">Supporting information sits on the grid, below the hero, never competing with it.</div>')}
{at(gx + 30, gy + 336, logo('symword', 'orange', 54))}
{at(gx + gw + 8, gy + 60, '<div class="mono" style="font-size:8px;color:var(--orange);font-weight:600">MESSAGE</div>')}
{at(gx + gw + 8, gy + 140, '<div class="mono" style="font-size:8px;color:var(--orange);font-weight:600">HERO</div>')}
{at(gx + gw + 8, gy + 262, '<div class="mono" style="font-size:8px;color:var(--orange);font-weight:600">SUPPORT</div>')}
{at(gx + gw + 8, gy + 340, '<div class="mono" style="font-size:8px;color:var(--orange);font-weight:600">CLOSE</div>')}
{at(700, 108, '<div class="eyebrow">The Healthsoft sequence</div>')}
{at(700, 138, '<div style="font-family:Montserrat;font-weight:700;font-size:20px;line-height:1.7">Message<br><span class="o">↓</span> Human or product hero<br><span class="o">↓</span> Supporting information<br><span class="o">↓</span> Brand close</div>', w=360)}
{at(700, 300, '<table class="tbl"><tr><th>Format</th><th>Columns</th><th>Margin</th><th>Gutter</th></tr><tr><td>A4 / A3 landscape</td><td>12</td><td class="mono">15 mm</td><td class="mono">5 mm</td></tr><tr><td>A-series portrait</td><td>6</td><td class="mono">7% of width</td><td class="mono">4 mm</td></tr><tr><td>Desktop 1440</td><td>12</td><td class="mono">80 px</td><td class="mono">24 px</td></tr><tr><td>Mobile 390</td><td>4</td><td class="mono">20 px</td><td class="mono">16 px</td></tr><tr><td>Social 1080</td><td>6</td><td class="mono">80 px</td><td class="mono">24 px</td></tr></table>', w=367)}
{at(56, 530, '<div class="h-xs" style="margin-bottom:10px">Spacing scale (8-unit base)</div>' + '<div style="display:flex;align-items:flex-end;gap:14px">' + ''.join(f'<div style="display:flex;flex-direction:column;align-items:center;gap:6px"><div style="width:{v}px;height:{v}px;background:var(--navy)"></div><div class="mono small">{v}</div></div>' for v in (4, 8, 16, 24, 40, 64, 104)) + '</div>', w=560)}
{at(700, 540, ul(['Headlines: max 60% of the format width, two lines preferred.', 'Products sit on a shared baseline; never touch the trim.', 'Crop people at natural joints; leave look-room in front of faces.', 'At least 30% of any layout is empty space.']), w=367)}
''')

# ---------------------------------------------------------------- 28–30 PRODUCTS
def product_page(name, role, line, pl, sec_pl, talk, visual, cls_):
    page(name, f'''
{plate(pl, 0, 0, 520, 794, pad=150 if 'keeper' not in pl else 90)}
{(plate(sec_pl, 396, 620, 96, 96, pad=6) + at(396, 724, '<div class="label" style="font-size:7px;color:#A9B2C2;width:96px;text-align:center">Orange band</div>')) if sec_pl else ''}
{at(580, 120, f'<div class="label" style="color:var(--grey)">{name} / {role}</div>')}
{at(580, 150, f'<div class="h-l" style="font-size:38px">{line}</div>', w=487)}
{at(580, 300, '<div class="hr" style="width:487px"></div>')}
{at(580, 322, '<div class="h-xs" style="margin-bottom:8px">How we talk about it</div>' + ul(talk), w=230)}
{at(836, 322, '<div class="h-xs" style="margin-bottom:8px">How we show it</div>' + ul(visual), w=230)}
{at(580, 600, f'<div class="note">Product description, features and specifications: insert only from Healthsoft’s verified product data. None are stated in this document, and none may be inferred from imagery.</div>', w=487)}
''', cls_)


product_page('Guard Rail', 'Safety', 'Freedom to go.<br>Support when it matters.', 'guardrail-navy', None,
             ['Lead with freedom and getting on with the day.', 'Support is “there when it matters” — never “saves lives”.', 'Never open with emergencies, falls or fear.'],
             ['Approved colourway: blue body, light-grey SOS button.', 'SOS button faces camera; loop at top right.', 'Worn or in hand in life shots — not dramatised.'], '')
pages[-1] = pages[-1].replace('class="ptitle"', 'class="ptitle" style="left:580px;color:var(--navy)"')
product_page('Health Guard', 'Health', 'See the change.<br>Not just the moment.', 'healthguard-sand', 'healthguard-orange',
             ['Health visibility over time — for the person and, if they choose, their family.', 'No diagnosis, no detection, no clinical numbers in headlines.', 'Pair with “Small signals. Closer care.” (V3).'],
             ['Approved band colourways: Sand, Orange.', 'Module facing camera, band in a soft curve.', 'On the wrist in daily life: walking, cooking, reading.'], '')
pages[-1] = pages[-1].replace('class="ptitle"', 'class="ptitle" style="left:580px"')
product_page('The Keeper', 'Medication', 'One less thing<br>to keep asking.', 'keeper-ivory', None,
             ['Medication routine made simple for the household.', 'The benefit is fewer reminders between people, not “compliance”.', 'Never imply dosing advice or clinical supervision.'],
             ['Display readable and facing camera.', 'Show in a home setting: kitchen counter, bedside.', 'Never alter compartments, pill colours or display.'], '')
pages[-1] = pages[-1].replace('class="ptitle"', 'class="ptitle" style="left:580px"')

# ---------------------------------------------------------------- 31 ONE CARE SYSTEM
trio = f'''<svg class="abs" style="left:0;top:0" width="560" height="460" viewBox="0 0 560 460">
<path d="M190 92 Q280 40 370 92" fill="none" stroke="#EC8D1F" stroke-width="2"/>
<path d="M110 250 Q120 340 200 372" fill="none" stroke="#EC8D1F" stroke-width="2"/>
<path d="M450 250 Q440 340 360 372" fill="none" stroke="#EC8D1F" stroke-width="2"/></svg>
{plate('guardrail-ivory', 60, 40, 120, 150)}{plate('healthguard-orange', 380, 40, 150, 150)}{plate('keeper-ivory', 190, 280, 180, 150)}
{at(40, 200, '<div style="text-align:center"><div class="h-xs" style="font-size:11px;letter-spacing:.08em">GUARD RAIL</div><div class="label" style="font-size:7.5px;color:var(--navy70);margin-top:2px">Safety</div></div>', w=160)}
{at(375, 200, '<div style="text-align:center"><div class="h-xs" style="font-size:11px;letter-spacing:.08em">HEALTH GUARD</div><div class="label" style="font-size:7.5px;color:var(--navy70);margin-top:2px">Health</div></div>', w=160)}
{at(200, 436, '<div style="text-align:center"><div class="h-xs" style="font-size:11px;letter-spacing:.08em">THE KEEPER</div><div class="label" style="font-size:7.5px;color:var(--navy70);margin-top:2px">Medication</div></div>', w=160)}'''
page('One care system', f'''
{at(56, 108, '', w=600, h=600, style='background:var(--sand)')}
{at(76, 130, '<div class="h-m" style="text-align:center">Three needs.<br>One care system.</div>', w=560)}
{at(76, 220, trio, w=560, h=480)}
{at(700, 108, '<div class="eyebrow">The ecosystem graphic</div>')}
{at(700, 140, '<div class="body" style="color:var(--navy)">Rebuilt from the approved polo 06 artwork. Use it whenever the three products appear together.</div>', w=360)}
{at(700, 210, ul(['Always Safety top left, Health top right, Medication below.', 'Connection arcs: 2 pt Healthsoft Orange, never closed into a circle.', 'Labels: PRODUCT in Montserrat SemiBold caps, role in tracked Inter.', 'Headline above, sign-off below. Nothing else inside the system.', 'Same scale relationship as photographed; never resize one product to dominate.']), w=360)}
{at(700, 460, '<div class="hr" style="width:367px"></div>')}
{at(700, 480, '<div class="h-xs">Why it matters</div><div class="body" style="margin-top:6px">Families rarely need just one thing. The system shows that each need is covered by a simple product, and that Healthsoft holds them together as one care brand.</div>', w=360)}
''')

# ---------------------------------------------------------------- 32 WEBSITE
def browser(x, y, w, h, inner):
    return at(x, y, f'''<div class="shadow" style="width:{w}px;height:{h}px;background:#fff;border-radius:8px;overflow:hidden;position:relative">
<div style="height:22px;background:#F1EEE8;display:flex;align-items:center;gap:5px;padding-left:10px"><i style="width:7px;height:7px;border-radius:50%;background:#DDD8CF;display:block"></i><i style="width:7px;height:7px;border-radius:50%;background:#DDD8CF;display:block"></i><i style="width:7px;height:7px;border-radius:50%;background:#DDD8CF;display:block"></i>
<div style="margin-left:14px;width:220px;height:12px;border-radius:6px;background:#fff"></div></div>
<div style="position:absolute;left:0;top:22px;right:0;bottom:0">{inner}</div></div>''')


nav = f'''<div style="position:absolute;left:36px;right:36px;top:16px;display:flex;align-items:center;justify-content:space-between">
{logo('symbol', 'orange', 22)}<div style="display:flex;gap:22px;font-size:8.5px;font-weight:500">
<span>Guard Rail</span><span>Health Guard</span><span>The Keeper</span><span>How it works</span><span>Support</span></div>
<span class="btn" style="background:var(--navy);color:#fff;font-size:8px;padding:6px 14px">Find your fit</span></div>'''
home = nav + f'''
{at(36, 74, '<div class="eyebrow" style="font-size:7px">Healthsoft</div><div style="font-family:Montserrat;font-weight:700;font-size:34px;line-height:1.08;letter-spacing:-.02em;margin-top:10px">Stay connected<br>to what matters.</div><div style="font-size:10px;line-height:1.55;color:var(--navy70);margin-top:12px;width:250px">Safety, health and medication routines in one care system — so the people you love keep living their way.</div><div style="display:flex;gap:10px;margin-top:18px;align-items:center"><span class="btn" style="background:var(--navy);color:#fff;font-size:8.5px;padding:8px 16px">Find your fit</span><span style="font-size:8.5px;font-weight:600;border-bottom:1.5px solid var(--orange);padding-bottom:2px">See the three needs</span></div>', w=320)}
{ph(380, 60, 284, 230, 'PH-01', '')}
{at(0, 318, '', w=700, h=200, style='background:var(--ivory)')}
{at(36, 334, '<div style="font-family:Montserrat;font-weight:700;font-size:15px">Three needs. One care system.</div>')}
{''.join(plate(p, 36 + i * 212, 366, 196, 106, pad=12) + at(36 + i * 212, 478, f'<div class="label" style="font-size:6.5px;color:var(--grey)">{r}</div><div style="font-family:Montserrat;font-weight:600;font-size:10px;margin-top:3px">{n}</div>') for i, (p, r, n) in enumerate([('guardrail-ivory', 'Safety', 'Guard Rail'), ('healthguard-orange', 'Health', 'Health Guard'), ('keeper-ivory', 'Medication', 'The Keeper')]))}'''
page('Website', browser(56, 108, 700, 540, home) + f'''
{at(800, 108, '<div class="eyebrow">Homepage</div>')}
{at(800, 140, '<div class="body" style="color:var(--navy)">The homepage follows the Healthsoft sequence: one message, one human hero, the three needs, then a single next step.</div>', w=267)}
{at(800, 220, ul(['Navigation in Inter Medium; one navy primary button.', 'Hero photography is human; product appears in the second band.', 'Ivory bands separate sections — no cards, no drop-shadowed tiles.', 'Orange only for the logo, underline links and focus states.', 'Max content width 1200 px; body 18 px for older readers.']), w=267)}
{at(800, 480, '<div class="note">Interface content is illustrative. Product features shown in any interface must match verified product capability.</div>', w=267)}
''')

# ---------------------------------------------------------------- 33 PRODUCT PAGE + MOBILE
pdp = nav + f'''
{plate('guardrail-navy', 36, 60, 300, 300, bg='var(--navy)', pad=50)}
{at(370, 74, '<div class="label" style="color:var(--grey);font-size:7px">Guard Rail / Safety</div><div style="font-family:Montserrat;font-weight:700;font-size:24px;line-height:1.1;letter-spacing:-.015em;margin-top:10px">Freedom to go.<br>Support when it matters.</div><div style="font-size:9.5px;line-height:1.55;color:var(--navy70);margin-top:12px;width:220px">[Verified product description from Healthsoft product data.]</div><div class="hr" style="margin:16px 0;width:280px"></div><div style="font-size:8px;color:var(--grey);letter-spacing:.14em;font-weight:600">COLOURWAY</div><div style="display:flex;gap:6px;margin-top:6px"><i style="display:block;width:16px;height:16px;border-radius:50%;background:#0473FB;box-shadow:0 0 0 2px #fff,0 0 0 3px var(--navy)"></i></div><div style="display:flex;gap:10px;margin-top:20px"><span class="btn" style="background:var(--navy);color:#fff;font-size:8.5px;padding:8px 16px">Find your fit</span><span class="btn" style="border:1px solid var(--navy);font-size:8.5px;padding:7px 15px">Talk to our team</span></div>', w=300)}'''


def phone(x, y, inner, w=200, h=410):
    return at(x, y, f'<div class="shadow" style="width:{w}px;height:{h}px;border-radius:30px;background:#fff;border:6px solid var(--navy);position:relative;overflow:hidden">{inner}</div>')


def row(role, name, state, y):
    return at(16, y, f'<div style="display:flex;justify-content:space-between;align-items:center;width:156px;padding:10px 0;border-bottom:1px solid var(--hair)"><div><div class="label" style="font-size:6px;color:var(--grey)">{role}</div><div style="font-weight:600;font-size:10px;margin-top:2px">{name}</div></div><div style="font-size:8px;color:var(--navy70)">{state}</div></div>')


m1 = f'''{at(16, 22, logo('symbol', 'orange', 18))}{at(16, 58, '<div style="font-family:Montserrat;font-weight:700;font-size:19px;line-height:1.15">Good morning.<br>Mum’s day</div><div style="font-size:8.5px;color:var(--navy70);margin-top:6px">Thursday 17 October</div>')}
{row('Safety', 'Guard Rail', 'Connected', 140)}{row('Health', 'Health Guard', 'Updated 9:40', 188)}{row('Medication', 'The Keeper', 'Morning done <span class="o">●</span>', 236)}
{at(16, 330, '<span class="btn" style="background:var(--navy);color:#fff;font-size:9px;padding:9px 0;width:156px">Call Mum</span>')}'''
m2 = f'''{at(16, 22, '<div style="font-size:9px;font-weight:600">‹ &nbsp;The Keeper</div>')}{at(16, 70, '<div class="label" style="font-size:6.5px;color:var(--grey)">Next reminder</div><div style="font-family:Montserrat;font-weight:700;font-size:44px;letter-spacing:-.02em;margin-top:6px" class="mono">8:00<span style="font-size:16px"> pm</span></div><div style="font-size:9px;color:var(--navy70);margin-top:4px;line-height:1.5">Evening routine.<br>We’ll let you know when it’s done.</div>')}
{at(16, 220, '<div style="background:var(--tint);padding:10px 12px;border-radius:8px;font-size:8.5px;width:136px">Reminder set for 8:00 pm.</div>')}
{at(16, 330, '<span class="btn" style="border:1px solid var(--navy);font-size:9px;padding:8px 0;width:136px">Edit routine</span>')}'''
page('Product page &amp; mobile', browser(56, 108, 600, 420, pdp) + phone(682, 108, m1, w=190) + phone(890, 140, m2, w=176, h=380) + f'''
{at(56, 560, '<div class="h-xs">Product detail page</div><div class="small" style="margin-top:4px;color:var(--navy70)">Product on its native ground, product line as H1, verified description, one primary action.</div>', w=300)}
{at(400, 560, '<div class="h-xs">Mobile interface</div><div class="small" style="margin-top:4px;color:var(--navy70)">Large type, plain lists, one action per screen. The person’s name comes before any device. Orange marks only the one state that changed.</div>', w=300)}
{at(744, 560, '<div class="h-xs">Not a dashboard</div><div class="small" style="margin-top:4px;color:var(--navy70)">No charts on the home screen, no red alerts, no streaks or scores. Reassurance first, detail on request.</div>', w=300)}
{at(56, 650, '<div class="note">Interface states are illustrative only. Every status shown must reflect a real, verified product capability before release.</div>', w=600)}
''')

# ---------------------------------------------------------------- 34 EMAIL & PRESENTATION (digital)
sig = f'''<div style="font-size:10px;line-height:1.55;color:var(--navy70);margin-bottom:22px">Thank you — I’ll send the details over this afternoon.<br><br>Warm regards,</div>
<div style="display:flex;gap:18px;align-items:flex-start"><div style="width:2px;height:74px;background:var(--orange)"></div><div><div style="font-family:Montserrat;font-weight:700;font-size:13px">Meera Iyer</div><div style="font-size:9px;color:var(--navy70);margin-top:2px">Customer Care Lead</div>
<div style="font-size:9px;color:var(--navy70);margin-top:10px;line-height:1.6" class="mono">+91 00000 00000<br>meera@[healthsoft-domain]</div></div><div style="margin-left:22px;margin-top:4px">{logo('symword', 'orange', 70)}</div></div>'''
mail = f'''{at(0, 0, '', w=420, h=110, style='background:var(--ivory)')}{at(28, 30, logo('symword', 'orange', 54))}
{at(28, 136, '<div class="label" style="font-size:7px;color:var(--grey)">The Keeper / Medication</div><div style="font-family:Montserrat;font-weight:700;font-size:22px;line-height:1.12;margin-top:8px">One less thing<br>to keep asking.</div><div style="font-size:9.5px;line-height:1.6;color:var(--navy70);margin-top:10px;width:300px">A simpler medication routine for the household — and fewer “did you take it?” calls.</div><div style="margin-top:16px"><span class="btn" style="background:var(--navy);color:#fff;font-size:8.5px;padding:8px 16px">See how it works</span></div>')}
{plate('keeper-ivory', 28, 312, 364, 150, pad=18)}'''
page('Email', f'''
{at(56, 108, '<div class="eyebrow">Email signature</div>')}
{at(56, 140, sig, w=460, h=230, style='background:#fff;padding:28px;outline:1px solid var(--hair)')}
{at(56, 400, ul(['Name in Montserrat Bold 13 px, everything else Inter.', 'Logo without tagline, max 70 px wide, linked to the website.', 'One orange rule. No banners, quotes, social icon rows or disclaimers in colour.', 'Plain-text fallback: name, role, phone, email.']), w=460)}
{at(600, 108, '<div class="eyebrow">Email newsletter</div>')}
{at(600, 140, mail, w=420, h=480, style='background:#fff;outline:1px solid var(--hair);position:absolute;overflow:hidden')}
{at(600, 640, '<div class="small" style="color:var(--navy70)">600 px wide. One story per email, live text for headlines, alt text on every image.</div>', w=420)}
''', 'ivory')

# ---------------------------------------------------------------- 35 SOCIAL MEDIA
ig1 = f'''<div style="width:300px;height:300px;background:var(--navy);position:relative">{at(26, 28, '<div style="font-family:Montserrat;font-weight:700;font-size:22px;line-height:1.1;color:#fff">Freedom to go.<br>Support when<br>it matters.</div>')}{plate('guardrail-navy', 160, 110, 120, 150, bg='var(--navy)')}{at(26, 258, '<div class="label" style="font-size:6.5px;color:#C5CCD8">Guard Rail / Safety</div>')}</div>'''
ig2 = f'''<div style="width:300px;height:300px;position:relative">{ph(0, 0, 300, 222, 'PH-05', '')}{at(0, 222, '', w=300, h=78, style='background:var(--ivory)')}{at(22, 238, '<div style="font-family:Montserrat;font-weight:700;font-size:15px;line-height:1.15">Stay connected<br>to what matters.</div>')}{at(244, 248, logo('symbol', 'orange', 30))}</div>'''
car = [
    f'''<div style="font-family:Montserrat;font-weight:700;font-size:14px;line-height:1.12">Three needs.<br>One care system.</div><div style="position:absolute;left:14px;bottom:14px;font-size:7px;color:var(--grey);letter-spacing:.14em">SWIPE →</div>''',
    plate('guardrail-ivory', 34, 26, 92, 92) + at(14, 132, '<div class="label" style="font-size:5.5px;color:var(--grey)">Safety</div><div style="font-family:Montserrat;font-weight:600;font-size:9.5px">Freedom to go.</div>'),
    plate('healthguard-orange', 34, 26, 92, 92) + at(14, 132, '<div class="label" style="font-size:5.5px;color:var(--grey)">Health</div><div style="font-family:Montserrat;font-weight:600;font-size:9.5px">See the change.</div>'),
    plate('keeper-ivory', 24, 26, 112, 92) + at(14, 132, '<div class="label" style="font-size:5.5px;color:var(--grey)">Medication</div><div style="font-family:Montserrat;font-weight:600;font-size:9.5px">One less thing to ask.</div>'),
    at(0, 0, logo('symword', 'white', 60), w=160, h=120, style='display:flex;align-items:center;justify-content:center') + at(0, 128, '<div style="text-align:center;font-size:8px;color:#fff;font-weight:600">Find your fit →</div>', w=160),
]
carh = ''.join(at(56 + i * 168, 470, c, w=160, h=160, style=f'background:{"var(--navy)" if i == 4 else ("var(--sand)" if 0 < i < 4 else "var(--ivory)")};position:absolute;overflow:hidden;padding:{"16px" if i == 0 else "0"}') for i, c in enumerate(car))
page('Social media', f'''
{at(56, 108, '<div class="eyebrow">Instagram posts — 1080 × 1080</div>')}
{at(56, 134, ig1)}
{at(372, 134, ig2)}
{at(56, 448, '<div class="eyebrow">Carousel — one idea per frame</div>')}
{carh}
{at(720, 134, '<div class="h-s">Social rules</div>' + '<div style="height:12px"></div>' + ul(['One message per post; headline under 8 words.', 'Alternate product posts (navy) with human posts (photography + ivory band).', 'Logo: symbol only, bottom right, 6% of frame width. The profile already says Healthsoft.', 'Text safe area: 80 px inside every edge.', 'Captions follow tone of voice. No fear hooks, no hashtag walls.', 'Carousels: cover → one frame per need → close with CTA.']), w=347)}
{at(56, 650, '<div class="note">Product claims in captions and comments follow the same verification rule as advertising.</div>', w=600)}
''')

# ---------------------------------------------------------------- 36 CAMPAIGN POSTERS
P_W, P_H = 300, 424
poster1 = f'''<div class="shadow" style="width:{P_W}px;height:{P_H}px;background:var(--navy);position:relative;overflow:hidden">
{at(30, 34, '<div style="font-family:Montserrat;font-weight:700;font-size:30px;line-height:1.08;color:#fff;letter-spacing:-.015em">Your day.<br>Your way.</div>')}
{plate('guardrail-navy', 70, 130, 160, 200, bg='var(--navy)')}
{at(0, 342, '<div class="label" style="color:#C5CCD8;text-align:center;font-size:7px">Guard Rail / Safety</div><div style="text-align:center;color:#fff;font-size:10px;margin-top:6px;font-weight:500">Freedom to go. Support when it matters.</div>', w=P_W)}
{at(128, 372, logo('symbol', 'orange', 44))}</div>'''
poster2 = f'''<div class="shadow" style="width:{P_W}px;height:{P_H}px;background:var(--sand);position:relative;overflow:hidden">
{at(0, 34, '<div style="font-family:Montserrat;font-weight:700;font-size:24px;line-height:1.1;text-align:center;letter-spacing:-.01em">Three needs.<br>One care system.</div>', w=P_W)}
<div class="abs" style="left:20px;top:100px;width:260px;height:240px;transform-origin:0 0;transform:scale(.464);"><div style="position:relative;width:560px;height:480px">{trio}</div></div>
{at(0, 334, '<div style="font-family:Montserrat;font-weight:700;font-size:13px;text-align:center;line-height:1.25">Defined by Care.<br>Driven by Love.</div>', w=P_W)}
{at(0, 384, logo('symword', 'orange', 46), w=P_W, style='display:flex;justify-content:center')}</div>'''
page('Campaign posters', f'''
{at(56, 108, poster1)}
{at(386, 108, poster2)}
{at(56, 548, '<div class="h-xs">Product campaign poster</div><div class="small" style="margin-top:4px;color:var(--navy70)">Approved V3 line, one product, label, product line, symbol. Navy ground.</div>', w=300)}
{at(386, 548, '<div class="h-xs">Ecosystem poster</div><div class="small" style="margin-top:4px;color:var(--navy70)">The one care system graphic on Sand, closed by the brand line and logo.</div>', w=300)}
{at(740, 108, '<div class="eyebrow">Poster build</div>')}
{at(740, 140, '<table class="tbl"><tr><th>Zone</th><th>Content</th></tr><tr><td>Top 25%</td><td>Headline, Montserrat Bold, max 2–3 lines</td></tr><tr><td>Middle 50%</td><td>One hero: product or person</td></tr><tr><td>Lower 15%</td><td>Label and product line</td></tr><tr><td>Base 10%</td><td>Logo / symbol, centred</td></tr></table>', w=327)}
{at(740, 330, ul(['Formats: A-series portrait; build at A2, scale proportionally for A3 / A1.', 'Margins 7% of width; minimum headline 5% of poster height.', 'Never more than one headline, one hero, one CTA.', 'Print: 300 ppi images at final size; CMYK from proofed values.']), w=327)}
''')

# ---------------------------------------------------------------- 37 EVENT / EXHIBITION
stall = f'''<div style="position:relative;width:560px;height:420px">
<div class="abs" style="left:0;top:0;width:560px;height:420px;background:#EFECE6"></div>
<div class="abs" style="left:0;top:330px;width:560px;height:90px;background:#E2DDD4;clip-path:polygon(90px 0,470px 0,560px 90px,0 90px)"></div>
<div class="abs" style="left:0;top:0;width:90px;height:420px;background:var(--ivory);clip-path:polygon(0 0,90px 40px,90px 330px,0 420px)"></div>
<div class="abs" style="left:470px;top:0;width:90px;height:420px;background:#E8E1DA;clip-path:polygon(0 40px,90px 0,90px 420px,0 330px)"></div>
<div class="abs" style="left:90px;top:40px;width:380px;height:290px;background:var(--navy)"></div>
{at(118, 66, '<div style="font-family:Montserrat;font-weight:700;font-size:22px;line-height:1.08;color:#fff">Three needs.<br>One care system.</div>')}
<div class="abs" style="left:118px;top:146px;width:240px;height:100px;background:var(--sand)"></div>{plate('guardrail-ivory', 130, 156, 60, 80)}{plate('healthguard-orange', 196, 156, 80, 80)}{plate('keeper-ivory', 270, 156, 82, 80)}
{at(118, 256, '<div class="label" style="color:#C5CCD8;font-size:6px">Safety · Health · Medication</div>')}
{at(394, 66, logo('symword', 'white', 52))}
<div class="abs" style="left:180px;top:268px;width:200px;height:82px;background:var(--ivory);box-shadow:0 8px 14px rgba(12,32,64,.15)"></div>
{at(180, 284, logo('symword', 'orange', 46), w=200, style='display:flex;justify-content:center')}
<div class="abs" style="left:30px;top:120px;width:40px;height:150px;"><div style="width:40px;height:150px;background:linear-gradient(155deg,#EFE8DE,#D3C6B6);transform:skewY(15deg)"></div></div>
</div>'''
wall = ''.join([
    at(0, 0, logo('full', 'orange', 70), w=110, h=150, style='background:var(--ivory);display:flex;align-items:center;justify-content:center'),
    at(110, 0, '<div style="font-family:Montserrat;font-weight:700;font-size:15px;line-height:1.12;color:#fff;padding:16px">Stay connected<br>to what matters.</div>', w=170, h=150, style='background:var(--navy)'),
    plate('guardrail-ivory', 280, 0, 100, 150, pad=24), plate('healthguard-orange', 380, 0, 100, 150, pad=18), plate('keeper-ivory', 480, 0, 120, 150, pad=18),
    ph(600, 0, 200, 150, 'PH-07', ''),
    at(800, 0, '<div style="padding:16px;font-family:Montserrat;font-weight:700;font-size:13px">Find your fit</div><div style="margin:0 16px;width:44px;height:44px;border:1px solid var(--navy)"></div><div class="small" style="padding:6px 16px 0">QR / URL</div>', w=150, h=150, style='background:#fff;outline:1px solid var(--hair);outline-offset:-1px'),
])
page('Event &amp; exhibition', f'''
{at(56, 108, stall, style='transform:scale(.8);transform-origin:0 0')}
{at(56, 456, '<div class="h-xs">Event stall — 3 × 3 m</div><div class="small" style="margin-top:4px;color:var(--navy70)">Navy back wall carries the message and products at eye level (1.2–1.8 m). Ivory counter with the logo. Sand side wall for product demonstration; ivory side wall for one human photograph.</div>', w=520)}
{at(660, 108, '<div class="eyebrow">Event rules</div>')}
{at(660, 140, ul(['Logo above 2.0 m only on the fascia; never below the counter line.', 'One headline per wall, readable from 5 m (min. 120 mm cap height).', 'Real products on the counter, at hand height, with clear touch space.', 'Staff in approved polos; lanyards in navy.', 'Lighting: warm-neutral 3500–4000 K. No coloured LEDs or glow.']), w=407)}
{at(56, 556, wall, w=950, h=150)}
{at(56, 716, '<div class="small">Exhibition wall — 6 m run, 1.5 m high panel band: logo · message · three needs · human photograph · call to action.</div>', w=900)}
''')

# ---------------------------------------------------------------- 38 APPAREL (approved)
page('Apparel', f'''
{at(56, 108, '<img src="source/apparel_01_guard_rail.webp" style="width:330px">')}
{at(397, 108, '<img src="source/apparel_04_health_guard.webp" style="width:330px">')}
{at(738, 108, '<img src="source/apparel_06_one_care_system.webp" style="width:330px">')}
{at(56, 362, '<div class="small">01 &nbsp;Guard Rail — navy</div>')}
{at(397, 362, '<div class="small">04 &nbsp;Health Guard — navy (Sand band)</div>')}
{at(738, 362, '<div class="small">06 &nbsp;One care system — sand</div>')}
{at(56, 420, '<div class="eyebrow">Front</div><div class="h-m" style="margin-top:12px">Small symbol.<br>High negative space.</div><div class="body" style="margin-top:12px;max-width:420px">Orange symbol only, embroidered on the wearer’s left chest. No wordmark, no tagline, no sleeve prints. The restraint is the premium.</div>', w=460)}
{at(600, 420, '<div class="eyebrow">Back</div><div class="h-m" style="margin-top:12px">One message.<br>One product story.</div><div class="body" style="margin-top:12px;max-width:420px">Headline, a single product (or the one care system), label, sign-off. Screen print or DTF. Garment colours: Healthsoft Navy, Sand.</div>', w=467)}
{at(56, 640, '<div class="note">Source: Healthsoft Apparel Collection V3 (approved). Reproduce from the approved production files — this page shows the logic, not production artwork.</div>', w=700)}
''')

# ---------------------------------------------------------------- 39 APPAREL SIZING
def shirt(x, scale, label, chest):
    # Simplified polo back silhouette; artwork block stays the same physical size at every garment size.
    s = scale
    path = f'M{60 * s} {0} L{120 * s} {0} Q{150 * s} {14 * s} {180 * s} {0} L{240 * s} 0 L{300 * s} {40 * s} L{272 * s} {110 * s} L{240 * s} {96 * s} L{240 * s} {330 * s} L{60 * s} {330 * s} L{60 * s} {96 * s} L{28 * s} {110 * s} L0 {40 * s} Z'
    W_, H_ = 300 * s, 330 * s
    art_w, art_top = 120, 60  # fixed: 260 mm wide block, 120 mm below collar seam (drawing scale)
    return at(x, 560 - H_, f'''<div style="position:relative;width:{W_}px;height:{H_}px">
<svg width="{W_}" height="{H_}" style="position:absolute;left:0;top:0"><path d="{path}" fill="#0C2040"/><path d="M{112 * s} 0 Q{150 * s} {22 * s} {188 * s} 0 L{180 * s} {-2 * s} Q{150 * s} {10 * s} {120 * s} {-2 * s} Z" fill="#1A3058"/></svg>
<div style="position:absolute;left:{W_ / 2 - art_w / 2}px;top:{art_top}px;width:{art_w}px;height:96px;outline:1px dashed #EC8D1F;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px">
<div style="font-family:Montserrat;font-weight:700;font-size:11px;color:#fff;text-align:center;line-height:1.1">Small signals.<br>Closer care.</div>
<img src="assets/healthguard-sand.png" style="width:30px;height:36px"><div style="font-size:5px;color:#C5CCD8;letter-spacing:.14em">HEALTH GUARD / HEALTH</div></div>
<div style="position:absolute;left:{W_ / 2 - 0.5}px;top:0;width:1px;height:{art_top}px;background:#EC8D1F"></div>
</div>''') + at(x, 576, f'<div class="h-s">{label}</div><div class="small mono" style="margin-top:2px">Chest width {chest}</div>', w=W_)


page('Apparel sizing', f'''
{shirt(56, 0.92, 'M', '~53 cm')}
{shirt(366, 1.0, 'L', '~56 cm')}
{shirt(692, 1.08, 'XL', '~59 cm')}
{at(56, 108, '<div class="h-m">The garment gets larger.<br><span class="o">The graphic does not.</span></div>', w=700)}
{at(56, 640, '<table class="tbl" style="width:620px"><tr><th>Placement</th><th>Artwork size</th><th>Anchor point</th></tr><tr><td>Front symbol</td><td class="mono">50 mm wide (embroidery)</td><td>Centre 95 mm left of centre-front, top 190 mm below high-point shoulder</td></tr><tr><td>Back artwork block</td><td class="mono">260 mm wide, fixed</td><td>Centred, top edge 120 mm below back collar seam</td></tr></table>', w=620)}
{at(720, 640, '<div class="note">Artwork dimensions are identical for M, L and XL and keep the same anchor points. Change them only if production sew-out or print testing requires it, and record the change. Figures are starting specifications; confirm on a physical sample per garment supplier. Chest widths are typical, not supplier data.</div>', w=347)}
''')

# ---------------------------------------------------------------- 40 PRINT APPLICATIONS
bc_front = f'''<div class="shadow" style="width:255px;height:165px;background:#fff;position:relative">{at(20, 20, logo('symword', 'orange', 54))}
{at(20, 98, '<div style="font-family:Montserrat;font-weight:700;font-size:11px">Meera Iyer</div><div style="font-size:7px;color:var(--navy70);margin-top:2px">Customer Care Lead</div><div style="font-size:6.5px;color:var(--navy70);margin-top:8px;line-height:1.55" class="mono">+91 00000 00000<br>meera@[healthsoft-domain]</div>')}</div>'''
bc_back = f'''<div class="shadow" style="width:255px;height:165px;background:var(--navy);display:flex;align-items:center;justify-content:center">{logo('full', 'white', 100)}</div>'''
letter = f'''<div class="shadow" style="width:250px;height:354px;background:#fff;position:relative">{at(22, 24, logo('symword', 'orange', 44))}
{at(22, 104, '<div style="font-size:5.5px;color:var(--navy70);line-height:1.6">17 October 2026<br><br>Dear Mrs Rao,<br><br>' + '<span style="display:block;height:4px;background:#ECE8E1;margin:4px 0;width:200px"></span>' * 6 + '<span style="display:block;height:4px;background:#ECE8E1;margin:4px 0;width:140px"></span><br>' + '<span style="display:block;height:4px;background:#ECE8E1;margin:4px 0;width:200px"></span>' * 4 + '<br>Warm regards,<br><b style="color:var(--navy)">Meera Iyer</b></div>')}
{at(22, 324, '<div style="width:206px;border-top:1px solid var(--hair);padding-top:5px;font-size:4.5px;color:var(--grey);letter-spacing:.1em;display:flex;justify-content:space-between"><span>HEALTHSOFT · [REGISTERED ADDRESS]</span><span>[HEALTHSOFT-DOMAIN]</span></div>')}</div>'''
env = f'''<div class="shadow" style="width:330px;height:165px;background:#fff;position:relative">{at(18, 16, logo('symword', 'orange', 38))}
{at(18, 70, '<div style="font-size:5px;color:var(--grey);line-height:1.6">Healthsoft<br>[Return address]</div>')}
{at(170, 82, '<div style="width:140px;height:52px;border:1px solid var(--hair);border-radius:3px"></div>')}
{at(0, 157, '', w=330, h=8, style='background:var(--navy)')}</div>'''
page('Print applications', f'''
{at(56, 108, bc_front)}{at(56, 290, bc_back)}
{at(56, 470, '<div class="h-xs">Business card</div><div class="small" style="margin-top:4px;color:var(--navy70)">85 × 55 mm, 400 gsm uncoated white. Front: logo without tagline, name, role, contacts. Back: navy with white primary logo.</div>', w=255)}
{at(360, 108, letter)}
{at(360, 476, '<div class="h-xs">Letterhead</div><div class="small" style="margin-top:4px;color:var(--navy70)">A4, 120 gsm uncoated. Logo 30 mm wide at 15 mm margins. Body Inter 10/15 pt.</div>', w=250)}
{at(660, 108, env)}
{at(660, 290, '<div class="h-xs">Envelope — DL</div><div class="small" style="margin-top:4px;color:var(--navy70)">220 × 110 mm. Logo top left, return address beneath, navy band on the flap edge only.</div>', w=330)}
{at(660, 370, '<div class="note">Contact details shown are template placeholders. Insert verified company name, address and registration details before printing.</div>', w=330)}
''')

# ---------------------------------------------------------------- 41 IDENTITY & PACKAGING
lanyard = f'''<div style="position:relative;width:60px;height:470px"><div style="position:absolute;left:18px;top:0;width:24px;height:400px;background:var(--navy);display:flex;flex-direction:column;align-items:center;justify-content:space-around;padding:20px 0">
{''.join(f'<div style="transform:rotate(90deg)">{logo("symword", "white", 18)}</div>' for _ in range(4))}</div>
<div style="position:absolute;left:22px;top:398px;width:16px;height:22px;border:2px solid #9AA0A8;border-radius:4px"></div></div>'''
idcard = f'''<div class="shadow" style="width:170px;height:270px;background:#fff;position:relative;overflow:hidden">
<div style="position:absolute;left:69px;top:10px;width:32px;height:5px;border-radius:3px;background:#E3DED6"></div>
{at(18, 30, logo('symbol', 'orange', 30))}
{ph(18, 76, 76, 92, '', '', style='')}
{at(18, 180, '<div style="font-family:Montserrat;font-weight:700;font-size:12px">Meera Iyer</div><div style="font-size:7.5px;color:var(--navy70);margin-top:3px">Customer Care Lead</div>')}
{at(0, 236, '<div style="display:flex;justify-content:space-between;align-items:center;padding:0 18px;height:34px;background:var(--navy)"><span style="font-size:6px;letter-spacing:.16em;color:#C5CCD8">STAFF</span><span class="mono" style="font-size:6px;color:#C5CCD8">ID 0000</span></div>', w=170)}</div>'''
box = f'''<div style="position:relative;width:300px;height:330px">
<div class="abs" style="left:0;top:40px;width:220px;height:280px;background:var(--ivory);box-shadow:0 14px 30px rgba(12,32,64,.14)"></div>
<div class="abs" style="left:220px;top:40px;width:60px;height:280px;background:#E9E3D7;transform-origin:0 0;transform:skewY(-20deg)"></div>
<div class="abs" style="left:0;top:40px;width:220px;height:22px;background:#FBF9F4;transform-origin:0 100%;transform:translateY(-22px) skewX(-70deg) scaleY(1)"></div>
{at(18, 58, logo('symword', 'orange', 42))}
{plate('guardrail-ivory', 40, 116, 140, 130, bg='var(--ivory)')}
{at(18, 262, '<div class="label" style="font-size:6px;color:var(--grey)">Safety</div><div style="font-family:Montserrat;font-weight:700;font-size:14px;margin-top:3px">Guard Rail</div>')}
{at(226, 120, '<div style="transform:skewY(-20deg);font-size:6px;letter-spacing:.14em;color:var(--navy70);width:50px;line-height:1.6">FREEDOM TO GO.</div>')}</div>'''
pcard = f'''<div class="shadow" style="width:200px;height:280px;background:#fff;position:relative">{at(18, 20, '<div class="label" style="font-size:6px;color:var(--grey)">Welcome</div><div style="font-family:Montserrat;font-weight:700;font-size:15px;line-height:1.15;margin-top:6px">Your day.<br>Your way.</div>')}
{at(18, 100, '<div class="small mono" style="line-height:1.9;color:var(--navy)">01 &nbsp;Charge<br>02 &nbsp;Connect<br>03 &nbsp;Get started</div><div style="font-size:6px;color:var(--grey);margin-top:6px">[Steps from verified product manual]</div>')}
{at(18, 236, logo('symword', 'orange', 34))}{at(120, 246, '<div style="font-size:6.5px;font-weight:600">Care, Connected.</div>')}</div>'''
page('Identity &amp; packaging', f'''
{at(80, 108, lanyard)}
{at(160, 300, idcard)}
{at(56, 598, '<div class="h-xs">Lanyard &amp; ID card</div><div class="small" style="margin-top:4px;color:var(--navy70)">20 mm navy strap, white logo without tagline repeated every 100 mm. CR80 card, white, navy footer band, photo to the shared photography standard.</div>', w=300)}
{at(420, 140, box)}
{at(420, 500, '<div class="h-xs">Product packaging</div><div class="small" style="margin-top:4px;color:var(--navy70)">Ivory pack, product on its native ground, label PRODUCT / ROLE. One product line on the side panel. Regulatory and safety marks per product data, black or navy only.</div>', w=280)}
{at(790, 140, pcard)}
{at(790, 440, '<div class="h-xs">Product card / insert</div><div class="small" style="margin-top:4px;color:var(--navy70)">105 × 148 mm. Welcome line, three numbered steps, sign-off. Steps must come from the verified manual.</div>', w=250)}
''')

# ---------------------------------------------------------------- 42 PRESENTATION & BROCHURE
cover = f'''<div class="shadow" style="width:480px;height:270px;background:var(--navy);position:relative">{at(34, 34, logo('symword', 'white', 50))}
{at(34, 136, '<div style="font-family:Montserrat;font-weight:700;font-size:28px;line-height:1.08;color:#fff">Three needs.<br>One care system.</div><div style="font-size:9px;color:#C5CCD8;margin-top:10px">Partner briefing · October 2026</div>')}
{at(410, 236, '<div class="rule"></div>')}</div>'''
content = f'''<div class="shadow" style="width:480px;height:270px;background:#fff;position:relative">{at(30, 26, '<div style="font-family:Montserrat;font-weight:700;font-size:11px"><span class="g" style="font-weight:600">02 /</span> HOW IT FITS TOGETHER</div>')}
{''.join(plate(p, 30 + i * 146, 70, 130, 100, pad=10) + at(30 + i * 146, 180, f'<div class="label" style="font-size:5.5px;color:var(--grey)">{r}</div><div style="font-family:Montserrat;font-weight:600;font-size:9px;margin-top:3px">{n}</div><div style="font-size:6.5px;color:var(--navy70);margin-top:3px;line-height:1.5;width:120px">{l}</div>') for i, (p, r, n, l) in enumerate([('guardrail-ivory', 'Safety', 'Guard Rail', 'Freedom to go. Support when it matters.'), ('healthguard-orange', 'Health', 'Health Guard', 'See the change. Not just the moment.'), ('keeper-ivory', 'Medication', 'The Keeper', 'One less thing to keep asking.')]))}
{at(30, 250, '<div style="font-size:5px;letter-spacing:.14em;color:var(--grey)">HEALTHSOFT</div>')}</div>'''
broch = f'''<div style="display:flex;gap:0" class="shadow"><div style="width:170px;height:240px;background:var(--ivory);position:relative">{at(16, 18, logo('symword', 'orange', 36))}{at(16, 150, '<div style="font-family:Montserrat;font-weight:700;font-size:14px;line-height:1.12">Care around<br>their life.</div><div style="font-size:7px;color:var(--navy70);margin-top:5px">Confidence around yours.</div>')}</div>
<div style="width:170px;height:240px;background:#fff;position:relative;border-left:1px solid var(--hair)">{ph(0, 0, 170, 130, 'PH-06', '')}{at(14, 142, '<div class="rule"></div><div style="font-family:Montserrat;font-weight:700;font-size:10px;margin-top:6px">Stay connected<br>to what matters.</div><div style="font-size:6px;color:var(--navy70);margin-top:6px;line-height:1.55;width:140px">Healthsoft brings safety, health visibility and medication routine together in one care system.</div>')}</div>
<div style="width:170px;height:240px;background:var(--sand);position:relative">{plate('keeper-ivory', 20, 30, 130, 110)}{at(14, 156, '<div class="label" style="font-size:5.5px;color:var(--grey)">The Keeper / Medication</div><div style="font-family:Montserrat;font-weight:700;font-size:10px;margin-top:4px">One less thing<br>to keep asking.</div>')}</div></div>'''
page('Presentation &amp; brochure', f'''
{at(56, 108, cover)}
{at(56, 390, content)}
{at(56, 672, '<div class="small" style="color:var(--navy70)">Presentation 16:9 — navy cover, white content slides. Montserrat titles, Inter body min. 18 pt, one idea per slide.</div>', w=480)}
{at(580, 108, '<div class="eyebrow">Brochure — A5 tri-fold, outside</div>')}
{at(580, 140, broch)}
{at(580, 400, ul(['Cover: ivory, one human line, logo without tagline.', 'Inside: human story first, then the three needs, then how to get started.', 'Uncoated 150 gsm; images at 300 ppi; CMYK from proofed values.', 'Back panel: brand line, contact, website — no product claims.']), w=480)}
''')

# ---------------------------------------------------------------- 43 DO / DON'T
good = f'''<div style="width:440px;height:330px;background:var(--ivory);position:relative">{at(36, 40, '<div class="rule"></div><div style="font-family:Montserrat;font-weight:700;font-size:24px;line-height:1.1;margin-top:12px">One less thing<br>to keep asking.</div><div style="font-size:9.5px;color:var(--navy70);margin-top:12px;width:180px;line-height:1.55">A simpler medication routine for the whole household.</div>')}
{plate('keeper-ivory', 262, 70, 150, 140, bg='var(--ivory)')}{at(36, 274, logo('symword', 'orange', 50))}{at(252, 230, '<div class="label" style="font-size:6.5px;color:var(--grey);text-align:center;width:170px">The Keeper / Medication</div>')}</div>'''
bad_ = f'''<div style="width:440px;height:330px;background:linear-gradient(135deg,#FF3B30,#EC8D1F 60%,#7B2CBF);position:relative;overflow:hidden">
{at(20, 16, '<div style="font-family:Montserrat;font-weight:700;font-size:30px;color:#fff;text-shadow:0 0 12px #FFD60A;letter-spacing:.02em">⚠ EMERGENCY?<br>DON’T WAIT!</div>')}
{at(20, 112, '<div style="font-size:10px;color:#fff;font-weight:700;width:200px;line-height:1.3">CLINICALLY PROVEN 24/7 MONITORING OF YOUR ELDERLY PARENT. 99.9% ACCURATE!*</div>')}
{at(260, 50, '<div style="transform:rotate(-12deg) scaleX(1.3);filter:drop-shadow(0 0 10px #fff)">' + logo('full', 'white', 120) + '</div>')}
{at(20, 196, '<div style="display:flex;gap:6px;font-size:20px">❤️ ➕ 📡 🚑 ⏰ 📊 🔔</div>')}
{at(20, 240, '<div style="font-size:5.5px;color:#fff;width:300px">*tiny small print nobody can read at any distance whatsoever on any device</div>')}
{at(250, 220, '<div style="background:#FFD60A;color:#C00;font-weight:800;font-size:13px;padding:8px 14px;border-radius:30px;box-shadow:0 0 18px #FFD60A">BUY NOW!!!</div>')}</div>'''
page('Do / don’t', f'''
{at(56, 108, good)}{at(567, 108, bad_)}
{at(56, 454, verdict(True, 'Do'))}{at(567, 454, verdict(False, 'Don’t'))}
{at(56, 484, ul(['Clean — one message, one hero.', 'Human — benefit to a person, in plain words.', 'Spacious — at least 30% empty.', 'Consistent — approved type, colour and label system.', 'Accurate — real product, unaltered.', 'Restrained — orange as a signal.', 'Product-first when selling a product; human-first everywhere else.']), w=440)}
{at(567, 484, ul(['Crowded layouts and competing messages.', 'Fear-based or emergency-led copy.', 'Over-medical language and imagery.', 'Logo distortion, effects or glow.', 'Orange overload and gradients.', 'Too many icons; fake product imagery.', 'Tiny text and unverified claims or statistics.'], 'x'), w=440)}
''')

# ---------------------------------------------------------------- 44 BRAND QA CHECKLIST
qa = [
    ('Logo', ['Official master artwork, unaltered and in an approved colour version?', 'Clear space and minimum size respected?']),
    ('Colour', ['Healthsoft Orange used as a signal only — about 5–10% of the layout?', 'Navy for all important messaging; contrast rules met?']),
    ('Type', ['Montserrat for headlines, Inter for everything else, hierarchy consistent?', 'No body text below 16 px / 9 pt; capitals only for short labels?']),
    ('Imagery', ['Feels human before technological?', 'Older adults portrayed with dignity and independence?', 'Products accurate — geometry, colourway, display unchanged?']),
    ('Copy', ['No invented medical, clinical, safety, regulatory or performance claims?', 'Calm, simple, non-alarmist; words-we-avoid list checked?']),
    ('Layout', ['Enough negative space; nothing crowded?', 'Nothing that looks like generic AI or SaaS design — no glow, gradients, floating cards?', 'Recognisably Healthsoft without the logo?']),
    ('Production', ['Works in both digital and physical form?', 'Could a vendor execute this from the guidelines alone?', 'Colours proofed against the vector master?']),
]
qh = ''
for i, (grp, items) in enumerate(qa):
    cx, cy = 56 + (i % 4) * 256, 110 + (i // 4) * 270
    qh += at(cx, cy, f'<div class="label" style="color:var(--orange);font-weight:600">{grp}</div><div class="hr" style="margin:10px 0 12px"></div>' + ''.join(
        f'<div style="display:flex;gap:10px;margin-bottom:10px"><div class="chk"></div><div style="font-size:10px;line-height:1.5;color:var(--navy)">{t}</div></div>' for t in items), w=232)
qh += at(824, 380, '<div class="label" style="color:var(--orange);font-weight:600">Open items before production</div><div class="hr" style="margin:10px 0 12px"></div>' + ul([
    'Vector logo master (SVG / AI / EPS).', 'Final colour values and Pantone from proof.', 'Master product photography (all colourways).',
    'Verified product descriptions and claims.', 'Visual scaling PDF, campaign files, web/UI screens — not supplied for this edition.',
    'Approval of horizontal lockup and secondary colours.']), w=243)
page('Brand QA checklist', qh)

# ---------------------------------------------------------------- 45 CLOSING
page('', f'''
{at(0, 150, logo('full', 'white', 230), w=1123, style='display:flex;justify-content:center')}
{at(0, 470, '<div style="font-family:Montserrat;font-weight:700;font-size:30px;line-height:1.3;text-align:center;color:#fff">Less checking. More confidence.<br><span style="color:#8C97AA">More independence. More human connection.</span></div>', w=1123)}
{at(0, 600, '<div style="width:24px;height:3px;background:var(--orange);margin:0 auto"></div>', w=1123)}
{at(0, 624, '<div class="small" style="text-align:center;color:#A9B2C2">Healthsoft is a care brand that uses technology to keep people connected.<br>Questions about this document: Healthsoft brand owner · [brand contact]</div>', w=1123)}
<div class="foot"><span>HEALTHSOFT / {VERSION}</span><span>{DATE}</span></div>
''', 'navy', foot=False)

html = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Healthsoft Brand Guidelines</title>
<link rel="stylesheet" href="style.css"></head><body>{''.join(pages)}</body></html>'''
open(os.path.join(HERE, 'index.html'), 'w').write(html)
print(len(pages), 'pages')
