"""Static master identity files built from the traced colour plates (+ rig exports)."""
import json, os, re
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
T = json.load(open(os.path.join(HERE, 'build/trace_layers.json')))['layers']
txt = open(os.path.join(ROOT, '03_CHARACTER_RIG/rig_source/gofloaters-rig-data.js')).read()
D = json.loads(txt[txt.index('{'):txt.rindex('}') + 1])
INK, WH, TQ, YE, OR, GR = '#050506', '#FFFFFF', '#6ED0E0', '#FCE162', '#F17B2A', '#6B6B6C'
MI = os.path.join(ROOT, '02_MASTER_IDENTITY')
NOTE = '<desc>GoFloaters — VECTOR RECONSTRUCTION traced from the supplied 2000x667 raster logo (colour-separated). Not the original source file. {extra}</desc>'

def P(d, fill, extra=''):
    return f'<path fill="{fill}" fill-rule="evenodd" d="{d}" {extra}/>'
def symbol(white=WH, turq=TQ, yellow=YE, orange=OR, ink=INK, speed=True, keyline=None):
    parts = []
    if keyline: parts.append(P(max(T['keyline'], key=len), keyline))  # symbol keyline only (no speed-line blobs)
    if white: parts.append(P(D['plates']['white'], white))
    if turq: parts.append(P(D['plates']['turq'], turq))
    if yellow: parts.append(P(D['plates']['yellow'], yellow))
    if orange: parts.append(P(D['plates']['orange'], orange))
    parts.append(P(D['plates']['black'], ink))
    if speed: parts.append(P(' '.join(D['speed']), ink))
    return '<g id="symbol">' + ''.join(parts) + '</g>'
def wordmark(c=INK): return '<g id="wordmark">' + P(' '.join(D['letters'][k] for k in D['letterOrder']), c) + '</g>'
def tagline(c=GR): return '<g id="tagline">' + P(' '.join(D['words'][k] for k in D['wordOrder']), c) + '</g>'
def svg(body, vb, title, extra='', bg=None, w=None):
    x, y, ww, hh = vb
    W = w or ww; H = round(W * hh / ww, 2)
    b = f'<rect x="{x}" y="{y}" width="{ww}" height="{hh}" fill="{bg}"/>' if bg else ''
    return f'<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x} {y} {ww} {hh}" width="{W}" height="{H}">\n<title>{title}</title>\n{NOTE.format(extra=extra)}\n{b}{body}\n</svg>\n'
def write(rel, s):
    p = os.path.join(MI, rel); os.makedirs(os.path.dirname(p), exist_ok=True); open(p, 'w').write(s); return p

FULL = (0, 0, 2000, 667)
SYM = (30, 90, 890, 485)
outs = []
outs.append(write('original_lockup/gofloaters_lockup_full_colour.svg', svg(symbol() + wordmark() + tagline(), FULL, 'GoFloaters full lockup')))
outs.append(write('vectors/gofloaters_symbol_dog_aircraft.svg', svg(symbol(), SYM, 'GoFloaters brand symbol (dog + aircraft + speed lines)')))
outs.append(write('vectors/gofloaters_symbol_keyline_for_dark.svg', svg(symbol(keyline=WH, speed=False) + P(' '.join(D['speed']), WH), (10, 70, 930, 525), 'Symbol with white keyline for dark grounds', 'PROPOSED VARIANT.')))
outs.append(write('vectors/gofloaters_symbol_no_speedlines.svg', svg(symbol(speed=False), (250, 90, 670, 485), 'GoFloaters brand symbol without speed lines')))
outs.append(write('vectors/gofloaters_wordmark_tagline.svg', svg(wordmark() + tagline(), (950, 195, 1020, 300), 'GoFloaters wordmark + tagline (original lettering, traced)')))
outs.append(write('vectors/gofloaters_wordmark.svg', svg(wordmark(), (950, 195, 1020, 200), 'GoFloaters wordmark (traced)')))
outs.append(write('vectors/gofloaters_tagline.svg', svg(tagline(), (965, 392, 1000, 92), 'Spaces that work for you (traced)')))
for i, d in enumerate(D['speed']):
    x0, y0, x1, y1 = D['speedBoxes'][i]
    outs.append(write(f'vectors/speed_lines/speed_line_{i + 1:02d}.svg', svg(P(d, INK), (x0 - 6, y0 - 6, x1 - x0 + 12, y1 - y0 + 12), f'Original speed line {i + 1}')))
outs.append(write('vectors/speed_lines/speed_lines_set.svg', svg(P(' '.join(D['speed']), INK), (40, 330, 370, 205), 'Original speed lines (set, original positions)')))
# --- proposed variants -------------------------------------------------------
V = 'logo_variants/'
PROP = 'PROPOSED VARIANT (not part of the supplied identity).'
outs.append(write(V + 'A_original_full_colour_on_light.svg', svg(symbol() + wordmark() + tagline(), (-60, -40, 2120, 747), 'Original full colour on light', bg='#FFFFFF')))
outs.append(write(V + 'B_proposed_dark_ground_keyline.svg', svg(symbol(keyline=WH, speed=False) + P(' '.join(D['speed']), WH) + wordmark(WH) + tagline('#BFE7EE'), (-60, -40, 2120, 747), 'Dark ground with white keyline', PROP, bg='#0E2A33')))
outs.append(write(V + 'B_proposed_dark_ground_keyline_transparent.svg', svg(symbol(keyline=WH, speed=False) + P(' '.join(D['speed']), WH) + wordmark(WH) + tagline('#BFE7EE'), (-60, -40, 2120, 747), 'Dark ground keyline lockup (transparent, for placement on dark grounds)', PROP)))
outs.append(write(V + 'C_proposed_on_turquoise_keyline.svg', svg(symbol(keyline=WH, speed=False) + P(' '.join(D['speed']), INK) + wordmark(INK) + tagline(INK), (-60, -40, 2120, 747), 'Turquoise ground with white keyline', PROP, bg=TQ)))
outs.append(write(V + 'D_proposed_mono_lineart_black.svg', svg(symbol(white=WH, turq=WH, yellow=WH, orange=WH) + wordmark() + tagline(INK), (-60, -40, 2120, 747), 'One-colour line art (black)', PROP, bg='#FFFFFF')))
outs.append(write(V + 'E_proposed_mono_reverse_white.svg', svg(symbol(white=None, turq=None, yellow=None, orange=WH, ink=WH) + wordmark(WH) + tagline(WH), (-60, -40, 2120, 747), 'One-colour reverse (white line art)', PROP, bg='#050506')))
outs.append(write(V + 'F_proposed_horizontal_no_tagline.svg', svg(symbol() + wordmark(), (-60, 40, 2120, 560), 'Horizontal lockup without tagline', PROP, bg='#FFFFFF')))
# stacked: symbol centred above wordmark/tagline
sym_cx, sym_y0 = 475, 100
word_cx = (968 + 1952) / 2
dx, dy = word_cx - sym_cx, -470 + 0
stack = f'<g transform="translate({dx - 1460 + 960:.1f} 0)">{symbol()}</g>' if False else ''
body = f'<g transform="translate({word_cx - sym_cx:.1f} -60)">{symbol()}</g><g transform="translate(0 460)">{wordmark()}{tagline()}</g>'
outs.append(write(V + 'G_proposed_stacked.svg', svg(body, (900, -10, 1120, 970), 'Stacked lockup', PROP, bg='#FFFFFF')))
print('\n'.join(os.path.relpath(o, ROOT) for o in outs))
