"""Round-2 character library: 10 views + action poses, exported from the live rig (layered SVG + PNG).
usage: python3 tools/build_character_library.py"""
import json, os, re, shutil, subprocess
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
CV = os.path.join(ROOT, '04_CHARACTER_LIBRARY/character_views'); AP = os.path.join(ROOT, '04_CHARACTER_LIBRARY/action_poses')
CON = os.path.join(CV, 'constructed_views')
DOG = {'showAircraft': 0, 'showTrails': 0, 'showWordmark': 0, 'showTagline': 0, 'attached': 0}
FREE_VB = '290 150 520 520'
for d in (CV, AP):
    for f in os.listdir(d):
        if f.endswith(('.svg', '.png')): os.remove(os.path.join(d, f))
jobs = [
    dict(out=f'{CV}/view_01_original_seated_profile', state=DOG, vb='330 60 500 500'),
    dict(out=f'{CV}/view_02_standing_profile', anim='standing', t=0, vb=FREE_VB),
    dict(out=f'{CV}/view_08_walking', anim='walking', t=0.3, vb=FREE_VB),
    dict(out=f'{CV}/view_09_running', anim='running', t=0.1, vb=FREE_VB),
    dict(out=f'{CV}/view_10_flying_in_aircraft', anim='flying', t=1.0, vb='300 20 860 560'),
]
ACTIONS = [('waving', 'waving', 1.3, None), ('pointing', 'pointing_standing', 1.6, FREE_VB), ('searching', 'looking_around', 0.9, FREE_VB),
           ('walking', 'walking', 0.3, FREE_VB), ('running', 'running', 0.1, FREE_VB), ('jumping', 'jumping', 1.05, '290 60 520 610'),
           ('landing', 'landing', 0.5, FREE_VB), ('dancing', 'dancing', 0.25, '300 30 640 640'), ('sleeping', 'sleeping', 0, '330 300 620 330'),
           ('stretching', 'stretching', 1.6, '290 150 600 520'), ('looking_around', 'looking_around', 2.0, FREE_VB), ('flying', 'flying', 1.0, '190 30 1060 600'),
           ('celebrating', 'celebrating', 0.9, '300 30 640 640'), ('surprise', 'surprise', 0.6, None)]
for i, (name, anim, t, vb) in enumerate(ACTIONS, 1):
    jobs.append(dict(out=f'{AP}/action_{i:02d}_{name}', anim=anim, t=t, vb=vb or '218 66 720 405'))
for j in jobs: j['png'] = 1600
jp = os.path.join(HERE, 'build/character_jobs.json'); json.dump(jobs, open(jp, 'w'), indent=1)
subprocess.run(['node', os.path.join(HERE, 'export_rig.js'), jp], check=True)

# opposite side: the standing profile mirrored as a whole (never a re-draw)
src = open(f'{CV}/view_02_standing_profile.svg').read()
vb = list(map(float, re.search(r'viewBox="([^"]+)"', src).group(1).split()))
body = src[src.index('>', src.index('<svg')) + 1: src.rindex('</svg>')]
cx2 = 2 * vb[0] + vb[2]
out = src[:src.index('>', src.index('<svg')) + 1] + f'<g transform="translate({cx2} 0) scale(-1 1)">' + body + '</g></svg>\n'
open(f'{CV}/view_03_opposite_side.svg', 'w').write(out)
# constructed angles (hand-built, labelled as extensions)
subprocess.run(['python3', os.path.join(HERE, 'views_constructed.py')], check=True)
for n, f in [('04', 'three_quarter_front'), ('05', 'front'), ('06', 'three_quarter_rear'), ('07', 'rear')]:
    shutil.copy(f'{CON}/view_{f}_constructed.svg', f'{CV}/view_{n}_{f}_constructed.svg')
subprocess.run(['node', os.path.join(HERE, 'render.js'), f'{CV}/view_03_opposite_side.svg', f'{CV}/view_03_opposite_side.png', '1600', '1600'], check=True)
for n, f in [('04', 'three_quarter_front'), ('05', 'front'), ('06', 'three_quarter_rear'), ('07', 'rear')]:
    subprocess.run(['node', os.path.join(HERE, 'render.js'), f'{CV}/view_{n}_{f}_constructed.svg', f'{CV}/view_{n}_{f}_constructed.png', '1200', '1380'], check=True)
print('character library built')

# ---------------- multi-view sheet (labelled; constructed angles marked as extensions)
VIEWS = [('01', 'original_seated_profile', 'Original seated profile', 'ORIGINAL — from the logo'),
         ('02', 'standing_profile', 'Standing, four legs', 'Constructed extension · rigged'),
         ('03', 'opposite_side', 'Opposite side', 'Mirror of 02 · rigged'),
         ('04', 'three_quarter_front_constructed', '3/4 front', 'Constructed extension · traced logo head'),
         ('05', 'front_constructed', 'Front', 'Constructed extension'),
         ('06', 'three_quarter_rear_constructed', '3/4 rear', 'Constructed extension'),
         ('07', 'rear_constructed', 'Rear', 'Constructed extension'),
         ('08', 'walking', 'Walking', 'Rigged · IK-planted paws'),
         ('09', 'running', 'Running', 'Rigged · gallop suspension'),
         ('10', 'flying_in_aircraft', 'Flying in the aircraft', 'ORIGINAL pose · rigged')]
cells = ''.join(f'''<figure class="{'orig' if 'ORIGINAL' in tag else ''}"><div class="im"><img src="view_{n}_{f}.png"></div>
<figcaption><b>{n}</b> {lab}<span>{tag}</span></figcaption></figure>''' for n, f, lab, tag in VIEWS)
html = f'''<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="../../06_BRAND_IDENTITY/tokens/gofloaters-tokens.css">
<style>body{{margin:0;width:3000px;height:1900px;background:#fff;font-family:var(--gf-font-text);color:#050506}}
header{{display:flex;align-items:baseline;gap:28px;padding:56px 72px 20px}} h1{{font:800 64px var(--gf-font-display);margin:0;letter-spacing:-.02em}}
header p{{margin:0;font-size:24px;opacity:.7}} .grid{{display:grid;grid-template-columns:repeat(5,1fr);gap:22px;padding:24px 72px}}
figure{{margin:0;border:3px solid #E4EAEC;border-radius:26px;overflow:hidden;background:#fff}} figure.orig{{border-color:#6ED0E0}}
.im{{height:640px;display:flex;align-items:center;justify-content:center;padding:18px}} .im img{{max-width:100%;max-height:100%}}
figcaption{{border-top:3px solid #E4EAEC;padding:14px 20px;font-size:26px;font-weight:600}} figcaption b{{font-family:var(--gf-font-mono);margin-right:8px}}
figcaption span{{display:block;font:500 17px var(--gf-font-mono);letter-spacing:.06em;text-transform:uppercase;color:#167A8C;margin-top:4px}}
footer{{padding:6px 72px;font-size:19px;opacity:.65}}</style></head><body>
<header><h1>Mascot · multi-view sheet</h1><p>One character, ten views. Profile and 3/4-front views carry the exact traced logo head; front and rear heads are constructed in its vocabulary. No horizontal stretching. Constructed angles are proposed extensions.</p></header>
<div class="grid">{cells}</div>
<footer>Turquoise frame = original logo pose. Anatomy QC per view: head matches logo · continuous neck/torso · limbs attached at shoulder/hip · recognisable paws · weight on the ground line · small, slim silhouette.</footer></body></html>'''
open(f'{CV}/gofloaters_multi_view_sheet.html', 'w').write(html)
jp2 = os.path.join(HERE, 'build/sheet_job.json')
json.dump([dict(html=f'{CV}/gofloaters_multi_view_sheet.html', out=f'{CV}/gofloaters_multi_view_sheet.png', w=3000, h=1900)], open(jp2, 'w'))
subprocess.run(['node', os.path.join(HERE, 'render_html.js'), jp2], check=True)
