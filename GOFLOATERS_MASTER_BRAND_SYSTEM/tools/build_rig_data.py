"""Assemble rig data: traced plates, part clip regions, pivots, eye/mouth geometry
and the hand-authored hidden-extension patches. Writes
03_CHARACTER_RIG/rig_source/gofloaters-rig-data.js
"""
import json, os, re, sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from shapely.geometry import Polygon, box
from shapely.ops import unary_union
import potrace

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
from rig_parts import PARTS, EYE_SEED, MOUTH_POLY
from trace_logo import trace, S, SRC

T = json.load(open(os.path.join(HERE, 'build/trace_layers.json')))
L = T['layers']
NUM = re.compile(r'-?\d+\.?\d*')

def bbox(d):
    v = list(map(float, NUM.findall(d)))
    xs, ys = v[0::2], v[1::2]
    return min(xs), min(ys), max(xs), max(ys)

def poly_d(geom):
    """shapely (Multi)Polygon -> SVG path data (evenodd)."""
    geoms = getattr(geom, 'geoms', [geom])
    out = []
    for g in geoms:
        for ring in [g.exterior, *g.interiors]:
            pts = list(ring.coords)[:-1]
            out.append('M' + 'L'.join(f'{x:.2f},{y:.2f}' for x, y in pts) + 'Z')
    return ''.join(out)

# ---- split curves -------------------------------------------------------
symbol_black, speed = [], []
for d in L['black_symbol']:
    x0, y0, x1, y1 = bbox(d)
    (speed if x1 < 420 and (y1 - y0) < 14 else symbol_black).append(d)
speed.sort(key=lambda d: bbox(d)[1])

LETTERS = [('G', 960, 1108), ('o1', 1108, 1240), ('F', 1240, 1345), ('l', 1345, 1375), ('o2', 1375, 1495),
           ('a', 1495, 1595), ('t', 1595, 1668.5), ('e', 1668.5, 1780), ('r', 1780, 1859), ('s', 1859, 1960)]
letters = {k: [] for k, _, _ in LETTERS}
for d in L['black_wordmark']:
    x0, y0, x1, y1 = bbox(d); cx = (x0 + x1) / 2
    for k, a, b in LETTERS:
        if a <= cx < b:
            letters[k].append(d); break
WORDS = [('Spaces', 960, 1260), ('that', 1260, 1445), ('work', 1445, 1665), ('for', 1665, 1800), ('you', 1800, 1960)]
words = {k: [] for k, _, _ in WORDS}
for d in L['gray_tagline']:
    x0, y0, x1, y1 = bbox(d); cx = (x0 + x1) / 2
    for k, a, b in WORDS:
        if a <= cx < b:
            words[k].append(d); break

# ---- eye interior --------------------------------------------------------
src = Image.open(SRC).convert('RGB'); W, H = src.size
im = np.array(src.resize((W * S, H * S), Image.LANCZOS)).astype(float)
lum = im @ [0.299, 0.587, 0.114]
sat = im.max(-1) - im.min(-1)
light = (lum > 150) & (sat < 60)
lab, _ = ndi.label(light)
eye = lab == lab[EYE_SEED[1] * S, EYE_SEED[0] * S]
eye = ndi.binary_fill_holes(eye)
ys, xs = np.where(eye)
eye_c = (xs.mean() / S, ys.mean() / S); eye_r = ((xs.max() - xs.min()) / 2 / S, (ys.max() - ys.min()) / 2 / S)
eye_d = trace(ndi.binary_erosion(eye, iterations=1), turd=10)
pup = (lum < 80)
plab, _ = ndi.label(pup)
pm = plab == plab[int(152 * S), int(653 * S)]
pys, pxs = np.where(pm)
pupil = {'cx': pxs.mean() / S, 'cy': pys.mean() / S, 'r': np.sqrt(pm.sum() / np.pi) / S}

# ---- regions --------------------------------------------------------------
EPS = 0.9  # clip overlap so neighbouring parts never show conflation seams
polys = {k: Polygon(v['poly']) for k, v in PARTS.items()}
clips = {k: poly_d(p.buffer(EPS, join_style=2)) for k, p in polys.items()}
mouth = Polygon(MOUTH_POLY)
clips['head'] = poly_d(polys['head'].buffer(EPS, join_style=2).difference(mouth))
# head ink stops at the jaw corner / ear root (natural line junctions); head white
# continues down the neck interior only, so the torso's neck lines show through
# head/neck boundary runs from the back-line/ear junction to below the jaw corner
NECK_CUT = [(530, 211.5), (670, 216.5)]
slope = (NECK_CUT[1][1] - NECK_CUT[0][1]) / (NECK_CUT[1][0] - NECK_CUT[0][0])
above = Polygon([(0, 0), (2000, 0), (2000, NECK_CUT[0][1] + (2000 - NECK_CUT[0][0]) * slope), (0, NECK_CUT[0][1] - NECK_CUT[0][0] * slope)])
head_top = polys['head'].buffer(EPS, join_style=2).intersection(above)
clips['head_ink'] = poly_d(head_top.difference(mouth))
clips['head_white'] = poly_d(head_top)
# torso plate starts below the procedural neck section
clips['torso_body'] = poly_d(polys['torso'].buffer(EPS, join_style=2).intersection(box(0, 236, 2000, 667)))
assert 'torso_body' in clips
clips['mouth'] = poly_d(mouth.buffer(EPS, join_style=2))
speed_boxes = [box(*(lambda b: (b[0] - 3, b[1] - 3, b[2] + 3, b[3] + 3))(bbox(d))) for d in speed]
taken = unary_union([unary_union([p.buffer(0.01, join_style=2) for p in polys.values()]).buffer(-EPS, join_style=2)] + speed_boxes)
clips['airframe'] = poly_d(box(0, 0, 920, 667).difference(taken))
clips['notprop'] = poly_d(box(0, 0, 920, 667).difference(polys['propeller'].buffer(-EPS, join_style=2)))
clips['eye'] = ' '.join(eye_d)
clips['nearlimb'] = poly_d(unary_union([polys['leg_near'], polys['paw_near']]).buffer(-EPS, join_style=2))
clips['turqBase'] = poly_d(box(0, 0, 920, 667).difference(polys['wing'].buffer(-EPS, join_style=2)))
prop_yellow = [d for d in L['yellow'] if bbox(d)[0] > 830]

# ---- hand-authored hidden extensions (all clearly marked as reconstructions) ----
INK = '#050506'; TQ = '#6ED0E0'; YE = '#FCE162'; WH = '#FFFFFF'
SW = 8.5
def stroke(d, w=SW):
    return f'<path d="{d}" fill="none" stroke="{INK}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round"/>'
PATCH = {
    # neck continues under the head so head tilts never open a gap
    'neck_ext': f'<path d="M550,234 L561,212 L569,196 L653,196 L648,216 L646,234 Z" fill="{WH}"/>' +
                stroke('M549.5,233 L558,216 L561,211 L568,196', 7) + stroke('M646.5,233 L648.5,216 L650,207 L651,198', 7),
    # white ear roots tucked under the head so ear rotation never opens a gap
    'ear_far_root': f'<path d="M598,122 L614,120 L614,162 L586,164 L592,147 Z" fill="{WH}"/>',
    'ear_near_root': f'<path d="M585,160 L610,164 L624,190 L604,204 L578,212 L590,198 L604,188 L598,172 Z" fill="{WH}"/>',
    # hair line at the top of the near foreleg (static on the chest)
    'chest_fur': f'<path d="M597.6,299 C598.4,306 600.2,314 604.2,322.5 L600.6,323.5 C596.8,315 595.6,307 597.6,299 Z" fill="{INK}"/>',
    # chest front line where the traced far foreleg used to overlap it
    'chest_line': stroke('M647,246 L646.6,262 L644.6,278 L642,290 L640.4,301', 7.2),
    # chest behind the near foreleg (travels with torso); kept left of the leg pocket
    'torso_behind_leg': f'<path d="M594,294 L614,298 L630,302 L638,292 L632,312 L624,344 L598,344 L596,318 Z" fill="{WH}"/>' +
                        stroke('M638,292 C633,306 628,324 624,344', 7.5),
    # aircraft surface behind near foreleg & paw (travels with aircraft)
    'aircraft_behind_leg': f'<path d="M604,348 L686,346 L712,378 L708,404 L636,406 L618,360 Z" fill="{TQ}"/>',
    'aircraft_behind_leg_cockpit': f'<path d="M604,349 L639,349 C644,366 649,384 653,400 L642,402 C632,384 620,364 604,352 Z" fill="{YE}"/>' +
                                   stroke('M638.5,350 C643,367 648,384 652,398', 7),
    # clean fuselage top line under the forelegs (identical to the source line at rest)
    'fuselage_top': stroke('M600,346.5 C620,345.2 645,344.2 662,344 C676,344.1 690,344.8 704,345.9 C716,347.3 728,349.6 742,353.4', 7.6),
    # far paw underside: identical to the fuselage line at rest, closes the paw when lifted
    'farpaw_close': stroke('M686,344.6 C700,345.6 716,347.6 730,349.6', 7.5),
    # fuselage belly + bottom contour hidden behind the near wing (wing flex)
    'wing_under': f'<path d="M492,500 L562,452 L578,455 L562,480 L640,482 L700,452 L714,458 L702,494 L600,503 L500,503 Z" fill="{TQ}"/>' +
                  stroke('M500,494 C560,499 630,498 700,490', 7.5),
    # empty cockpit for aircraft-only use (replaces the static 'seat' region)
    'cockpit_empty': f'<path d="{clips["seat"]}" fill="{TQ}"/>' +
                     f'<path d="M402,360 C440,349 540,339 606,336 C640,334 655,352 650,376 C645,398 600,410 520,410 C462,410 420,396 402,360 Z" fill="{YE}" stroke="{INK}" stroke-width="{SW}" stroke-linejoin="round"/>' +
                     stroke('M420,370 C470,360 560,352 636,352', 5.5),
    # lower body + tail root, only shown when the dog leaves the aircraft
    'dog_lower': f'<path d="M474,340 C468,372 468,402 488,418 C516,436 592,438 636,430 C660,426 666,414 654,406 C640,398 620,400 606,402 L604,340 Z" fill="{WH}"/>' +
                 stroke('M478,338 C470,370 468,400 488,417 C516,436 592,438 634,430 C658,426 666,414 654,406 C642,398 622,400 606,402') +
                 stroke('M556,372 C584,366 604,382 610,404', 7.5) + stroke('M626,338 C623,360 617,384 609,402', 7.5) +
                 f'<path d="M420,360 C420,386 446,404 482,410 L486,392 C466,388 450,378 447,360 Z" fill="{WH}"/>' +
                 stroke('M422,360 C422,386 446,404 480,410') + stroke('M446,360 C449,376 462,387 482,392', 7.5),
}

data = {
    'size': [2000, 667], 'stroke': SW,
    'colors': {'ink': INK, 'white': WH, 'turquoise': TQ, 'yellow': YE, 'orange': '#F17B2A', 'tagline': '#6B6B6C'},
    'plates': {'white': ' '.join(L['white']), 'turq': ' '.join(L['turq']), 'yellow': ' '.join(L['yellow']),
               'orange': ' '.join(L['orange']), 'black': ' '.join(symbol_black), 'keyline': ' '.join(L['keyline'])},
    'speed': speed, 'speedBoxes': [list(bbox(d)) for d in speed],
    'letters': {k: ' '.join(v) for k, v in letters.items()}, 'letterOrder': [k for k, _, _ in LETTERS],
    'letterBoxes': {k: list((lambda bs: (min(b[0] for b in bs), min(b[1] for b in bs), max(b[2] for b in bs), max(b[3] for b in bs)))([bbox(d) for d in v])) for k, v in letters.items()},
    'words': {k: ' '.join(v) for k, v in words.items()}, 'wordOrder': [k for k, _, _ in WORDS],
    'clips': clips, 'pivots': {k: list(v['pivot']) for k, v in PARTS.items()},
    'eye': {'cx': eye_c[0], 'cy': eye_c[1], 'rx': eye_r[0], 'ry': eye_r[1]}, 'pupil': pupil,
    'mouthPoly': MOUTH_POLY,
    # redrawn limbs: centreline points [x, y, interior half-width]; root first
    'tubes': {
        'leg_near': [[604, 313, 6.6], [614, 321, 7.0], [625, 329, 7.4], [632, 341, 7.8], [639, 352, 7.4], [647, 363, 7.3], [655, 374, 7.4], [665, 383, 6.4], [679, 385, 5.4], [690, 387, 5.3]],
        'leg_far':  [[644, 260, 6.0], [650, 274, 6.0], [653, 288, 6.1], [660, 300, 6.6], [668, 311, 6.7], [677, 322, 6.2], [688, 332, 6.1], [701, 335, 5.5], [714, 338, 4.8], [721, 338, 4.6]],
        'tail':     [[434, 366, 5.5], [432, 352, 5.5], [430, 340, 5.5], [430, 327, 5.4], [431, 313, 5.0], [435, 301, 4.2], [440, 289, 3.3], [447, 278, 2.3], [455, 268, 1.5], [460, 262, 1.2]],
    },
    # procedural neck: line centres where head ink ends (top) and torso ink begins (bottom)
    'neck': {'back': [[560.2, 212.2], [547.6, 236.5]], 'front': [[648.6, 216.2], [646.5, 236.5]], 'w': 7.0},
    'tubeTrim': {'leg_near': {'R': 9}},
    'tubeJoints': {'leg_near': {'elbow': 3, 'wrist': 6}, 'leg_far': {'elbow': 4, 'wrist': 7}}, 'propYellow': ' '.join(prop_yellow), 'patches': PATCH,
}
out = os.path.join(ROOT, '03_CHARACTER_RIG/rig_source/gofloaters-rig-data.js')
open(out, 'w').write('// Generated by tools/build_rig_data.py - traced plates + rig regions (source px space 2000x667)\n'
                     'window.GF_DATA = ' + json.dumps(data, separators=(',', ':')) + ';\n')
print('speed', len(speed), 'letters', {k: len(v) for k, v in letters.items()}, 'words', {k: len(v) for k, v in words.items()})
print('eye', data['eye'], 'pupil', pupil, 'bytes', os.path.getsize(out))
