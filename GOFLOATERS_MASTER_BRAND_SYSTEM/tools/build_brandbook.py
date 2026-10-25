"""GoFloaters Brand Guidelines — single HTML source for both the interactive
(animated) brandbook and the print PDF. Pages are 1920x1080 landscape.
Output: 07_BRAND_GUIDELINES/editable_source/brandbook.html
"""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
OUTDIR = os.path.join(ROOT, '07_BRAND_GUIDELINES/editable_source')
R = '../../'
MI, CL, AN, BI, AP = R + '02_MASTER_IDENTITY/', R + '04_CHARACTER_LIBRARY/', R + '05_ANIMATION/', R + '06_BRAND_IDENTITY/', R + '09_BRAND_APPLICATIONS/'
ST = 'stills/'
DG = 'diagrams/'
TOK = json.load(open(os.path.join(ROOT, '06_BRAND_IDENTITY/tokens/gofloaters-tokens.json')))
FID = json.load(open(os.path.join(ROOT, '01_SOURCE_REFERENCE/visual_comparison/fidelity_metrics.json')))
LOCK = MI + 'original_lockup/gofloaters_lockup_full_colour.svg'
LOCKD = MI + 'logo_variants/B_proposed_dark_ground_keyline_transparent.svg'
SYM = MI + 'vectors/gofloaters_symbol_dog_aircraft.svg'
WORD = MI + 'vectors/gofloaters_wordmark.svg'
WT = MI + 'vectors/gofloaters_wordmark_tagline.svg'
MASC = MI + 'mascot_only/gofloaters_mascot_seated.svg'
AIR = MI + 'aircraft_only/gofloaters_aircraft.svg'
AIRS = MI + 'aircraft_only/gofloaters_aircraft_with_speed_lines.svg'
EXN = ['neutral', 'happy', 'curious', 'excited', 'thinking', 'focused', 'surprised', 'confused', 'determined', 'sleepy', 'relieved', 'celebrating']
EXMEAN = {
 'neutral': ('Calm, attentive default.', 'Logo, navigation'), 'happy': ('Warm welcome.', 'Confirmations, replies'),
 'curious': ('“What’s around here?”', 'Search, discovery'), 'excited': ('Something great appeared.', 'New spaces, launches'),
 'thinking': ('Weighing a choice.', 'Loading, comparisons'), 'focused': ('Heads-down work.', 'Productivity content'),
 'surprised': ('Unexpected news.', 'Alerts, notifications'), 'confused': ('Something doesn’t add up.', 'Errors, not-found'),
 'determined': ('Let’s do this.', 'CTAs, onboarding'), 'sleepy': ('Winding down.', 'After-hours, idle'),
 'relieved': ('Problem solved.', 'Resolved, saved'), 'celebrating': ('A big win.', 'Milestones, events')}

def ex(i, n): return CL + f'expressions/expression_{i:02d}_{n}.svg'
def act(i, n): return CL + f'action_poses/action_{i:02d}_{n}.svg'
def vid(path, still, cls='', style=''):
    return f'<div class="vid {cls}" style="{style}"><video src="{path}" muted loop playsinline preload="metadata" poster="{still}"></video><img class="poster" src="{still}" alt=""><span class="play m">▶ Motion · plays in the interactive edition</span></div>'
def tag(t='Proposed'): return f'<span class="pill">{t}</span>'

pages = []
def page(title, part, body, cls='', bg=''):
    n = len(pages) + 1
    pages.append(f'<section class="page {cls}" style="{bg}" data-title="{title}"><div class="folio m"><span>{part}</span><span>{n:02d} · {title}</span></div>{body}</section>')

# ============================================================ PART I — THE BRAND
page('Cover', 'GoFloaters', f'''
<img class="abs" src="{BI}patterns/pattern_speedlines.svg" style="left:0;top:0;width:1920px;height:1080px;object-fit:cover;opacity:.07;filter:invert(1)">
<div class="abs m" style="left:120px;top:120px;color:#BFE7EE;font-size:20px">Brand identity · Mascot · Motion system · v1.0</div>
<div class="abs d" style="left:112px;top:190px;font-size:170px;color:#fff">Freedom<br>in <span style="color:var(--gf-yellow)">motion.</span></div>
<img class="abs" src="{LOCKD}" style="left:100px;bottom:110px;width:700px">
<img class="abs" src="{MI}vectors/gofloaters_symbol_keyline_for_dark.svg" style="right:40px;top:300px;width:1000px">
''', 'dark', 'background:var(--gf-deep-sky)')
page('Brand idea', 'Part I · The brand', f'''
<div class="abs d" style="left:120px;top:150px;font-size:150px">Work is no longer<br>a place you go.<br><span style="color:var(--gf-turquoise-deep)">It’s a place you choose.</span></div>
<div class="abs" style="left:126px;top:720px;width:760px" ><p class="lead">GoFloaters helps people find flexible spaces to work from. The brand’s job is to make that freedom feel light, friendly and dependable — a dog who knows where the good desks are, and an aircraft that gets you there.</p></div>
<div class="abs" style="left:1000px;top:720px;width:780px"><p class="lead"><b>Tagline (unchanged):</b> Spaces that work for you.<br><b>Creative territory {tag()}</b> Freedom in Motion — an organising idea for campaigns and motion, never a replacement for the tagline.</p></div>
''')
page('Existing identity', 'Part I · The brand', f'''
<div class="abs h2" style="left:120px;top:110px">The identity we start from</div>
<p class="abs lead" style="left:120px;top:190px;width:820px">The supplied logo is the source of truth. Everything in this book is built from a vector reconstruction of it.</p>
<div class="abs card" style="left:120px;top:330px;width:1680px;height:600px;display:flex;align-items:center;justify-content:center;background:#fff"><img src="{R}01_SOURCE_REFERENCE/original_logo/gofloaters_original_logo.png" style="width:1560px"></div>
<div class="abs cap" style="left:120px;top:950px;width:500px"><b>1 · The dog.</b> Slim, white, hand-inked; long muzzle, small black nose, swept-back ears, orange eye ring.</div>
<div class="abs cap" style="left:700px;top:950px;width:500px"><b>2 · The aircraft.</b> Turquoise single-prop plane with a yellow propeller disc and a cockpit seat.</div>
<div class="abs cap" style="left:1280px;top:950px;width:520px"><b>3 · Wordmark + speed lines.</b> “Go” bold, “Floaters” regular, grey tagline; five rounded speed lines.</div>
''')
page('Creative direction', 'Part I · The brand', f'''
<div class="abs h2" style="left:120px;top:110px">Proposed direction: Freedom in Motion {tag()}</div>
<div class="abs grid3" style="left:120px;top:250px;width:1680px">
 <div><div class="tile" style="background:var(--gf-cloud)"><img src="{SYM}" style="width:90%"></div><h3>Faithful</h3><p>One master character, one aircraft, one logo — reconstructed, never redrawn into something new.</p></div>
 <div><div class="tile" style="background:var(--gf-yellow-tint)"><img src="{ex(2,'happy')}" style="height:92%"></div><h3>Expressive</h3><p>Twelve expressions and twelve actions from the same rig, so the dog can speak in every channel.</p></div>
 <div><div class="tile" style="background:var(--gf-turquoise-tint)"><img src="{BI}patterns/pattern_flightpaths.png" style="width:100%;height:100%;object-fit:cover"></div><h3>In motion</h3><p>Speed lines, flight paths and propeller discs become a graphic language that moves even without the mascot.</p></div>
</div>
''')
# ============================================================ PART II — THE LOGO
page('Original logo', 'Part II · The logo', f'''
<img class="abs" src="{LOCK}" style="left:160px;top:250px;width:1600px">
<div class="abs m small" style="left:160px;top:120px">Master lock-up · vector reconstruction</div>
<div class="abs cap" style="left:160px;top:880px;width:1100px">Traced from the supplied 2000×667 raster, colour-separated into six plates (white, turquoise, yellow, orange, ink, slate). Verified at identical size against the source: mean pixel difference {FID["reconstruction_vs_source"]["mean_abs_diff_0_255"]}/255, ink overlap {FID["reconstruction_vs_source"]["ink_iou_tolerance_1px"]*100:.1f}% within 1 px. It is a reconstruction, not the original source file.</div>
''')
page('Logo anatomy', 'Part II · The logo', f'''
<div class="abs h2" style="left:120px;top:100px">Anatomy</div>
<div class="abs" style="left:120px;top:210px;width:1680px;height:560px"><img src="{LOCK}" style="width:1680px">
 <svg class="abs" style="left:0;top:0" width="1680" height="560" viewBox="0 0 2000 667">
  {''.join(f'<circle cx="{x}" cy="{y}" r="10" fill="#F17B2A" stroke="#050506" stroke-width="3"/><line x1="{x}" y1="{y}" x2="{tx}" y2="{ty}" stroke="#050506" stroke-width="2.5"/><circle cx="{tx}" cy="{ty}" r="22" fill="#050506"/><text x="{tx}" y="{ty + 8}" text-anchor="middle" font-family="JetBrains Mono" font-size="22" fill="#fff">{i}</text>' for i, (x, y, tx, ty) in enumerate([(655, 150, 760, 40), (560, 135, 470, 40), (580, 300, 360, 220), (450, 300, 300, 300), (620, 470, 520, 640), (875, 405, 960, 560), (530, 380, 420, 640), (150, 440, 120, 600), (1300, 300, 1300, 40), (1400, 440, 1450, 610)], 1))}
 </svg></div>
<div class="abs grid5 cap" style="left:120px;top:800px;width:1680px">
 <div><b>1</b> Eye + orange ring</div><div><b>2</b> Swept-back ears</div><div><b>3</b> Slim upright body</div><div><b>4</b> Curved tail</div><div><b>5</b> Turquoise aircraft</div>
 <div><b>6</b> Yellow propeller disc</div><div><b>7</b> Cockpit seat</div><div><b>8</b> Five speed lines</div><div><b>9</b> Wordmark: <i>Go</i> bold + <i>Floaters</i></div><div><b>10</b> Tagline in slate</div>
</div>''')
page('Two brand elements', 'Part II · The logo', f'''
<div class="abs h2" style="left:120px;top:100px">Dog and aircraft, separately</div>
<div class="abs card" style="left:120px;top:220px;width:820px;height:620px;background:var(--gf-yellow-tint)"><img src="{MASC}" style="height:560px;margin:30px auto"></div>
<div class="abs card" style="left:980px;top:220px;width:820px;height:620px;background:var(--gf-turquoise-tint);display:flex;align-items:center"><img src="{AIR}" style="width:760px;margin:auto"></div>
<div class="abs card" style="left:780px;top:640px;width:200px;height:200px;background:#fff;padding:8px"><img src="{DG}mascot_reconstruction.png" style="width:100%"></div>
<div class="abs card" style="left:1600px;top:700px;width:200px;height:140px;background:#fff;padding:8px"><img src="{DG}aircraft_reconstruction.png" style="width:100%"></div>
<div class="abs cap" style="left:120px;top:870px;width:820px"><b>Mascot only.</b> Extracted from the logo. Areas hidden by the aircraft (lower body, tail root) are reconstructions, shown in orange in the inset.</div>
<div class="abs cap" style="left:980px;top:870px;width:820px"><b>Aircraft only.</b> The empty cockpit and the surface under the paws are reconstructions (inset). Neither element replaces the corporate logo.</div>
''')
VAR = [('A_original_full_colour_on_light', 'Original · light'), ('B_proposed_dark_ground_keyline', 'Dark ground + keyline'), ('C_proposed_on_turquoise_keyline', 'Turquoise ground'), ('D_proposed_mono_lineart_black', 'One-colour black'),
       ('E_proposed_mono_reverse_white', 'One-colour reverse'), ('F_proposed_horizontal_no_tagline', 'Without tagline'), ('G_proposed_stacked', 'Stacked')]
page('Variants', 'Part II · The logo', f'''
<div class="abs h2" style="left:120px;top:100px">Variants and grounds</div>
<div class="abs" style="left:120px;top:210px;width:1680px;display:grid;grid-template-columns:repeat(4,1fr);gap:24px">
{''.join(f'<div><div class="tile sm" style="padding:0;overflow:hidden;background:#eee"><img src="{MI}logo_variants/{f}.png" style="width:100%;height:100%;object-fit:contain"></div><div class="cap">{t} {"" if f.startswith("A") else tag()}</div></div>' for f, t in VAR)}
<div><div class="tile sm" style="background:var(--gf-cloud)"><img src="{MI}original_lockup/preview_on_dark_UNMODIFIED_shows_why_keyline_needed.png" style="width:100%"></div><div class="cap">Why: the unmodified art loses its outline on dark</div></div>
</div>''')
DONTS = [('transform:scaleX(1.5)', 'Don’t stretch or squash'), ('filter:hue-rotate(150deg)', 'Don’t recolour the dog or aircraft'), ('transform:rotate(-14deg)', 'Don’t rotate the lock-up'),
         ('filter:drop-shadow(10px 14px 6px rgba(0,0,0,.5))', 'Don’t add effects or shadows'), ('opacity:.35', 'Don’t place on low contrast'), ('font', 'Don’t re-set the wordmark in another typeface')]
def dont(s, t):
    inner = f'<div style="font-family:var(--gf-font-display);font-weight:800;font-size:30px;display:flex;align-items:center;gap:8px"><img src="{SYM}" style="width:90px">GoFloaters</div>' if s == 'font' else f'<img src="{LOCK}" style="width:88%;{s}">'
    bg = 'var(--gf-turquoise)' if 'opacity' in s else '#fff'
    return f'<div><div class="tile sm" style="background:{bg};position:relative;overflow:hidden">{inner}<span class="x">✕</span></div><div class="cap">{t}</div></div>'
page('Spacing and misuse', 'Part II · The logo', f'''
<div class="abs h2" style="left:120px;top:100px">Clear space, minimum size, misuse</div>
<div class="abs" style="left:120px;top:210px;width:820px;height:400px;background:var(--gf-cloud);border-radius:24px">
 <div class="abs" style="left:90px;top:95px;width:640px;height:214px;outline:3px dashed #F17B2A;outline-offset:0"></div>
 <img class="abs" src="{LOCK}" style="left:140px;top:120px;width:540px">
 <div class="abs m small" style="left:90px;top:60px;color:#F17B2A">X = height of the “o” in Go · keep 1X clear on all sides</div>
</div>
<div class="abs cap" style="left:120px;top:630px;width:820px"><b>Minimum size</b> {tag()} — Lock-up 160 px / 40 mm wide · symbol 48 px / 12 mm · mascot alone 32 px / 8 mm. Below these, use the symbol without speed lines.</div>
<div class="abs" style="left:1000px;top:210px;width:800px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px">{''.join(dont(s, t) for s, t in DONTS)}</div>
''')
# ============================================================ PART III — THE CHARACTER
page('The mascot', 'Part III · The character', f'''
<div class="abs" style="left:0;top:0;width:1060px;height:1080px;background:var(--gf-yellow-tint)"></div>
<img class="abs" src="{MASC}" style="left:110px;top:150px;width:840px">
<div class="abs h2" style="left:1140px;top:150px">The original mascot</div>
<div class="abs" style="left:1140px;top:250px;width:660px">
<p class="lead" style="margin-bottom:28px">Verified from the supplied logo — preserve all of these.</p>
<ul class="checks"><li>Slim white body, hand-inked dark outline (~0.9% of symbol width)</li><li>Elongated muzzle, small rounded black nose</li><li>Two swept-back ears, near ear lower</li><li>Orange ring around the eye (the only accessory)</li><li>Long upright neck, seated posture</li><li>Forelegs reaching forward, paws resting</li><li>Curved tail rising behind</li><li>Small three-stroke fur marks on the haunch</li></ul>
<p class="cap" style="margin-top:28px">Never: puppy proportions, fluffy fur, big goggles, clothing, scarves or shoes.</p></div>
''')
page('Anatomy and construction', 'Part III · The character', f'''
<div class="abs h2" style="left:120px;top:100px">Construction</div>
<img class="abs card" src="{DG}rig_pivots.png" style="left:120px;top:210px;width:1100px;background:#fff">
<div class="abs" style="left:1280px;top:210px;width:520px">
<h3>Layered parts</h3><p class="cap">Head (traced) · two ears (traced, hidden white roots) · procedural neck · torso (traced) · near and far forelegs, tail (redrawn as centre-line “tubes” matched to the source) · eye (white, pupil, two lids) · mouth (traced smile ↔ procedural shapes).</p>
<h3 style="margin-top:30px">Pivots</h3><p class="cap">Orange dots mark every joint: head, ears, hip/lean, shoulders, wrist, tail root, propeller hub, wing root and the seat anchor that keeps the dog in the cockpit.</p>
<h3 style="margin-top:30px">Line weight</h3><p class="cap">7.6 px at master scale (2000 px wide lock-up). Redrawn limbs use the same weight so joints never thicken.</p></div>
''')
VIEWS = [('view_01_profile_logo_pose', 'Profile · logo pose', 'Source'), ('view_02_profile_seated_detached', 'Profile · seated, detached', 'Reconstruction'), ('view_03_constructed_standing_profile', 'Standing profile', 'Proposed view'),
         ('view_04_constructed_upright', 'Upright (dance, celebrate)', 'Proposed view'), ('view_05_constructed_lying', 'Lying (sleep)', 'Proposed view'), ('view_06_head_closeup', 'Head detail', 'Source')]
page('Views', 'Part III · The character', f'''
<div class="abs h2" style="left:120px;top:100px">Profile and constructed views</div>
<div class="abs" style="left:120px;top:200px;width:1680px;display:grid;grid-template-columns:repeat(3,1fr);gap:26px">
{''.join(f'<div><div class="tile" style="height:310px;background:var(--gf-cloud)"><img src="{CL}character_views/{f}.svg" style="max-width:92%;max-height:92%"></div><div class="cap"><b>{t}</b> · {k}</div></div>' for f, t, k in VIEWS)}
</div>
<p class="abs cap" style="left:120px;top:950px;width:1680px">A frontal view is not supplied here: the source shows only a profile, and inventing a front face would risk identity drift. Recommended next step: an illustrator-led front and three-quarter turnaround approved against this book.</p>
''')
page('Personality', 'Part III · The character', f'''
<div class="abs" style="left:0;top:0;width:1920px;height:1080px;background:var(--gf-turquoise)"></div>
<img class="abs" src="{MI}mascot_only/gofloaters_mascot_head.svg" style="left:60px;top:120px;width:1080px">
<div class="abs" style="left:1180px;top:170px;width:640px">
<div class="m small">Core personality {tag()}</div>
<div class="d" style="font-size:96px;margin:16px 0 30px">Easy-going.<br>Curious.<br>Dependable.</div>
<p class="lead">The hero expression is the logo face: calm eyes, a closed smile, chin up and looking ahead. Every other expression starts and returns here.</p></div>
''')
page('Expression library', 'Part III · The character', f'''
<div class="abs h2" style="left:120px;top:80px">Twelve expressions · one character</div>
<div class="abs" style="left:120px;top:170px;width:1680px;display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:16px 18px">
{''.join(f'<div><div class="tile" style="height:300px;background:{["var(--gf-cloud)", "var(--gf-yellow-tint)", "var(--gf-turquoise-tint)"][i % 3]}"><img src="{ex(i + 1, n)}" style="height:96%;max-width:100%;object-fit:contain"></div><div class="cap"><b>{n.capitalize()}</b><br>{EXMEAN[n][0]} <span style="opacity:.6">· {EXMEAN[n][1]}</span></div></div>' for i, n in enumerate(EXN))}
</div>''')
POSE6 = [(5, 'waving', 'Waving', 'Greeting, welcome'), (6, 'pointing', 'Pointing', 'Directing to a CTA or place'), (7, 'searching', 'Searching', 'Search, empty results'),
         (11, 'surprise', 'Reacting to surprise', 'Alerts, reveals'), (10, 'celebrating', 'Celebrating', 'Success, milestones'), (9, 'sleeping', 'Sleeping', 'Closed hours, idle')]
page('Expressive poses', 'Part III · The character', f'''
<div class="abs h2" style="left:120px;top:80px">Expressive poses</div>
<div class="abs" style="left:120px;top:180px;width:1680px;display:grid;grid-template-columns:repeat(3,1fr);gap:22px 26px">
{''.join(f'<div><div class="tile" style="height:330px;background:var(--gf-cloud)"><img src="{act(i, n)}" style="max-width:94%;max-height:94%"></div><div class="cap"><b>{t}</b> · {u}</div></div>' for i, n, t, u in POSE6)}
</div>''')
page('Motion-ready rig', 'Part III · The character', f'''
<div class="abs h2" style="left:120px;top:100px">A working rig, not a drawing</div>
<pre class="abs tree m" style="left:120px;top:210px">root
├─ trails ×5
├─ aircraft  bank · position · scale
│  ├─ fuselage · tail fin · stabiliser
│  ├─ wing      flex
│  ├─ cockpit   seat / empty
│  └─ propeller disc · blade glints · blur
├─ dog       attach ↔ detach · flip
│  ├─ torso   lean · breath
│  │  ├─ tail       wag · curl
│  │  ├─ far leg    shoulder · elbow · wrist
│  │  ├─ head       tilt
│  │  │  ├─ ears    follow-through
│  │  │  ├─ eye     look · blink · lids · pupil
│  │  │  └─ mouth   smile · open · O · tongue
│  │  └─ near leg   shoulder · elbow · wrist
│  └─ free body  stand · walk · run · jump
├─ wordmark ×10 letters
└─ tagline  ×5 words</pre>
{vid(R + '03_CHARACTER_RIG/rig_preview/rig_proof_playback.mp4', ST + 'rig_proof_playback_15.jpg', '', 'position:absolute;left:820px;top:210px;width:980px;height:551px')}
<p class="abs cap" style="left:820px;top:790px;width:980px">Rig proof: blink, eyes, head tilt, ear follow-through and paw lift; the aircraft flying on its own while the propeller spins; then dog-only, aircraft-only and full-logo modes. Source: <span class="m small">03_CHARACTER_RIG/rig_source</span>.</p>
''')
# ============================================================ PART IV — MOTION
page('Motion principles', 'Part IV · Motion', f'''
<div class="abs h2" style="left:120px;top:100px">Motion principles</div>
<div class="abs grid5" style="left:120px;top:220px;width:1680px">
 <div class="pr"><b>01</b><h3>Eyes lead</h3><p>Pupils move first; the head follows 3–5 frames later.</p></div>
 <div class="pr"><b>02</b><h3>Ears follow</h3><p>Ears trail the head by ~4 frames, small amplitude (±5°).</p></div>
 <div class="pr"><b>03</b><h3>Never all at once</h3><p>Aircraft, dog, propeller and trails start and settle on different frames.</p></div>
 <div class="pr"><b>04</b><h3>Glide, then settle</h3><p>Ease-out arrivals; a soft overshoot on the aircraft only.</p></div>
 <div class="pr"><b>05</b><h3>Land on the logo</h3><p>Every brand sequence resolves to the master lock-up.</p></div>
</div>
<svg class="abs" style="left:120px;top:560px" width="1680" height="380" viewBox="0 0 1680 380">
 <text x="0" y="24" font-family="JetBrains Mono" font-size="20" fill="#050506">STAGGER · signature hero, 3.2 s → 4.4 s</text>
 {''.join(f'<text x="0" y="{80 + i * 62}" font-family="Inter" font-weight="600" font-size="22" fill="#050506">{n}</text><rect x="{220 + a}" y="{58 + i * 62}" width="{w}" height="30" rx="15" fill="{c}" stroke="#050506" stroke-width="3"/>' for i, (n, a, w, c) in enumerate([('Eyes', 40, 300, '#F17B2A'), ('Head', 220, 520, '#6ED0E0'), ('Ears', 330, 560, '#FCE162'), ('Paw', 620, 880, '#FFFFFF'), ('Propeller', 0, 1440, '#DCF3F7')]))}
 <line x1="220" y1="360" x2="1660" y2="360" stroke="#050506" stroke-width="2"/>
</svg>''')
page('Signature hero animation', 'Part IV · Motion', f'''
<div class="abs h2" style="left:120px;top:90px">Signature hero · 9 s</div>
{vid(AN + 'hero_motion/gofloaters_hero_signature.mp4', ST + 'gofloaters_hero_signature_50.jpg', '', 'position:absolute;left:120px;top:190px;width:1120px;height:630px')}
<div class="abs" style="left:1290px;top:190px;width:510px">
<p class="cap"><b>0.3 s</b> speed lines streak in · <b>0.4–2.3 s</b> aircraft glides in, banking, propeller blurred · <b>3.2 s</b> eyes find the viewer · <b>3.4 s</b> head lifts, ears trail · <b>4.0–6.0 s</b> paw greeting · <b>6.0 s</b> wordmark rises letter by letter · <b>6.9 s</b> tagline · <b>7–8 s</b> propeller and trails settle · <b>8.85 s</b> locks to the master logo.</p>
<p class="cap" style="margin-top:20px">Deliverables: 1080p H.264, reduced-motion version, transparent WebM, final still.</p></div>
<div class="abs" style="left:120px;top:850px;width:1680px;display:grid;grid-template-columns:repeat(5,1fr);gap:14px">
{''.join(f'<img src="{ST}gofloaters_hero_signature_{k}.jpg" style="width:100%;border-radius:12px;border:2px solid #E4EAEC">' for k in (15, 35, 50, 65, 85))}
</div>''')
page('Flying and aircraft', 'Part IV · Motion', f'''
<div class="abs h2" style="left:120px;top:90px">Flying and aircraft actions</div>
{vid(AN + 'character_motion/action_01_flying.mp4', ST + 'action_01_flying_35.jpg', '', 'position:absolute;left:120px;top:190px;width:1100px;height:619px')}
{vid(AN + 'aircraft_motion/aircraft_only_flight.mp4', ST + 'aircraft_only_flight_35.jpg', '', 'position:absolute;left:1260px;top:190px;width:540px;height:304px')}
{vid(AN + 'aircraft_motion/propeller_transition.mp4', ST + 'propeller_transition_50.jpg', '', 'position:absolute;left:1260px;top:505px;width:540px;height:304px')}
<p class="abs cap" style="left:120px;top:840px;width:1680px"><b>Flying</b> — bank ±3°, gentle bob, wind on the ears, squint, propeller blurred. <b>Aircraft only</b> — the plane travels without the dog; the cockpit shows empty. <b>Propeller</b> — spin-up and settle: blade glints sweep the disc, then a white blur takes over.</p>
''')
page('Dog-only movement', 'Part IV · Motion', f'''
<div class="abs h2" style="left:120px;top:90px">Dog-only movement and gestures</div>
<div class="abs" style="left:120px;top:190px;width:1680px;display:grid;grid-template-columns:repeat(3,1fr);gap:20px">
{''.join('<div>' + vid(AN + f'character_motion/{f}.mp4', ST + f'{f}_35.jpg', '', 'width:100%;height:306px') + f'<div class="cap"><b>{t}</b></div></div>' for f, t in [('action_02_walking', 'Walking — 1 s cycle'), ('action_03_running', 'Running — 0.55 s cycle'), ('action_04_jumping', 'Jumping'), ('action_12_obstacle', 'Overcoming an obstacle'), ('action_08_dancing', 'Dancing — 120 bpm'), ('action_05_waving', 'Waving')])}
</div>
<p class="abs cap" style="left:120px;top:990px;width:1680px">Walking, running and jumping use the constructed full-body view {tag('Proposed view')}: same head, same line weight, legs bend on their centre-lines and paws stay planted on the ground line.</p>
''')
page('Expression transitions', 'Part IV · Motion', f'''
<div class="abs h2" style="left:120px;top:90px">Expression transitions</div>
{vid(AN + 'character_motion/expression_transitions.mp4', ST + 'expression_transitions_50.jpg', '', 'position:absolute;left:120px;top:190px;width:1100px;height:619px')}
<div class="abs" style="left:1260px;top:190px;width:540px"><p class="lead">Each change takes about 0.5 s: eyes and lids first, mouth next, head and ears last — then a hold. The basic geometry never changes, only the face controls and the head.</p></div>
<div class="abs" style="left:120px;top:840px;width:1680px;display:grid;grid-template-columns:repeat(5,1fr);gap:14px">
{''.join(f'<img src="{ST}expression_transitions_{k}.jpg" style="width:100%;border-radius:12px;border:2px solid #E4EAEC">' for k in (15, 35, 50, 65, 85))}</div>
''')
page('Logo assembly and graphics', 'Part IV · Motion', f'''
<div class="abs h2" style="left:120px;top:90px">Logo assembly and animated graphics</div>
<div class="abs" style="left:120px;top:190px;width:1680px;display:grid;grid-template-columns:repeat(3,1fr);gap:20px">
{''.join('<div>' + vid(p, ST + s, '', 'width:100%;height:306px') + f'<div class="cap"><b>{t}</b></div></div>' for p, s, t in [(AN + 'logo_motion/logo_reveal_assembly.mp4', 'logo_reveal_assembly_50.jpg', 'Logo reveal (assembly)'), (AN + 'logo_motion/wordmark_entrance.mp4', 'wordmark_entrance_65.jpg', 'Wordmark entrance'), (AN + 'aircraft_motion/speed_line_motion.mp4', 'speed_line_motion_50.jpg', 'Speed-line motion'), (AN + 'pattern_motion/campaign_typography_freedom_in_motion.mp4', 'campaign_typography_freedom_in_motion_65.jpg', 'Campaign typography'), (AN + 'pattern_motion/application_background_loop.mp4', 'application_background_loop_50.jpg', 'Application background'), (AN + 'pattern_motion/pattern_speedlines_loop.mp4', 'pattern_speedlines_loop_50.jpg', 'Animated pattern')])}
</div>''')
# ============================================================ PART V — VISUAL LANGUAGE
C = TOK['colors']
def sw(k, big=False):
    v = C[k]; dark = v['contrast_on_white'] > 4 and k != 'gf-slate' or k in ('gf-ink', 'gf-deep-sky')
    h = v['value'].lstrip('#'); rgb = ','.join(str(int(h[i:i + 2], 16)) for i in (0, 2, 4))
    return f'<div class="swatch {"big" if big else ""}" style="background:{v["value"]};color:{"#fff" if dark else "#050506"};{"border:2px solid #E4EAEC" if v["value"] in ("#FFFFFF",) else ""}"><b>{k.replace("gf-", "").replace("-", " ").title()}</b><span class="m">{v["value"]} · RGB {rgb}</span><span>{v["role"]}</span><span class="m">AA on white {v["contrast_on_white"]}:1</span></div>'
page('Colour', 'Part V · Visual language', f'''
<div class="abs h2" style="left:120px;top:90px">Colour</div>
<div class="abs m small" style="left:120px;top:180px">Sampled from the supplied logo (median of each colour region)</div>
<div class="abs" style="left:120px;top:220px;width:1680px;display:grid;grid-template-columns:repeat(6,1fr);gap:14px">{''.join(sw(k, True) for k in ['gf-turquoise', 'gf-yellow', 'gf-orange', 'gf-ink', 'gf-white', 'gf-slate'])}</div>
<div class="abs m small" style="left:120px;top:640px">Proposed supporting colours {tag()}</div>
<div class="abs" style="left:120px;top:680px;width:1680px;display:grid;grid-template-columns:repeat(5,1fr);gap:14px">{''.join(sw(k) for k in ['gf-deep-sky', 'gf-turquoise-deep', 'gf-turquoise-tint', 'gf-yellow-tint', 'gf-cloud'])}</div>
<p class="abs cap" style="left:120px;top:950px;width:1680px">Turquoise and yellow are fills, never text colours on white. Use Turquoise Deep for links and small turquoise text (5.0:1).</p>
''')
page('Typography', 'Part V · Visual language', f'''
<div class="abs h2" style="left:120px;top:90px">Typography</div>
<div class="abs" style="left:120px;top:200px;width:1100px">
 <div class="m small">Hero heading · Bricolage Grotesque ExtraBold · 160/146</div><div class="d" style="font-size:160px">Fly by.</div>
 <div class="m small" style="margin-top:26px">Section title · Bricolage Grotesque ExtraBold · 72/72</div><div class="d" style="font-size:72px">Spaces that work for you</div>
 <div class="m small" style="margin-top:26px">Subheading · Inter SemiBold · 36/44</div><div style="font-size:36px;font-weight:600">Find a desk in minutes, not meetings.</div>
 <div class="m small" style="margin-top:26px">Campaign copy · Bricolage Grotesque SemiBold · 44/48</div><div style="font-family:var(--gf-font-display);font-weight:600;font-size:44px">Out of office? Into one.</div>
 <div class="m small" style="margin-top:26px">Interface label · JetBrains Mono SemiBold · 16 · +8% tracking · caps</div><div class="m" style="font-size:22px;font-weight:600">DAY PASS · MEETING ROOM · DESK</div>
 <div class="m small" style="margin-top:26px">Supporting text · Inter Regular · 20/30</div><div style="font-size:20px;line-height:1.5;width:900px">Body copy stays short and warm. Explain once, then get out of the way.</div>
</div>
<div class="abs card" style="left:1260px;top:200px;width:540px;padding:34px;background:var(--gf-cloud)">
 <h3>The wordmark is artwork</h3><p class="cap">“GoFloaters” is preserved exactly as traced from the supplied logo. Its typeface is not identified here and the wordmark is never re-typed.</p>
 <img src="{WT}" style="width:100%;margin-top:26px">
 <h3 style="margin-top:34px">Recommended families {tag()}</h3><p class="cap">Bricolage Grotesque (display), Inter (text, UI), JetBrains Mono (labels). All SIL Open Font License; files in 06_BRAND_IDENTITY/typography/fonts.</p></div>
''')
page('Aircraft-derived patterns', 'Part V · Visual language', f'''
<div class="abs h2" style="left:120px;top:90px">Patterns from the aircraft {tag()}</div>
<div class="abs" style="left:120px;top:200px;width:1680px;display:grid;grid-template-columns:repeat(2,1fr);gap:24px">
{''.join(f'<div><img src="{BI}patterns/pattern_{n}.png" style="width:100%;height:340px;object-fit:cover;border-radius:22px"><div class="cap"><b>{t}</b> · {s}</div></div>' for n, t, s in [('flightpaths', 'Flight paths', 'aircraft silhouette on dashed routes'), ('aircraft', 'Tossed aircraft', 'silhouette + trailing speed lines'), ('speedlines', 'Speed lines', 'the five original line lengths as rhythm'), ('wings', 'Wing formation', 'the near-wing outline as a chevron')])}
</div>''')
page('Mascot-derived patterns', 'Part V · Visual language', f'''
<div class="abs h2" style="left:120px;top:90px">Patterns from the mascot and propeller {tag()}</div>
<div class="abs" style="left:120px;top:200px;width:1680px;display:grid;grid-template-columns:repeat(3,1fr);gap:24px">
{''.join(f'<div><img src="{BI}patterns/pattern_{n}.png" style="width:100%;height:560px;object-fit:cover;border-radius:22px"><div class="cap"><b>{t}</b> · {s}</div></div>' for n, t, s in [('mascot', 'Mascot silhouettes', 'tone-on-tone seated dog'), ('ears', 'Ear curves', 'the swept-back ear contour'), ('propellers', 'Propeller discs', 'disc + spinner curl, animated squash')])}
</div>
<p class="abs cap" style="left:120px;top:900px;width:1680px">Static SVG/PNG in 06_BRAND_IDENTITY/patterns; seamless animated loops in 05_ANIMATION/pattern_motion. No generic stars, sparkles or icons — every motif traces back to the logo.</p>
''')
GR = [('linear-gradient(180deg,#DCF3F7,#FFFFFF)', 'Sky', LOCK), ('linear-gradient(135deg,#6ED0E0,#DCF3F7)', 'Turquoise lift', LOCK), ('linear-gradient(180deg,#FFF5CC,#FFFFFF)', 'Morning', LOCK), ('linear-gradient(160deg,#0E2A33,#163E4A)', 'Night flight', LOCKD)]
page('Gradients and backgrounds', 'Part V · Visual language', f'''
<div class="abs h2" style="left:120px;top:90px">Gradients and backgrounds {tag()}</div>
<div class="abs" style="left:120px;top:200px;width:1680px;display:grid;grid-template-columns:repeat(4,1fr);gap:22px">
{''.join(f'<div><div class="tile" style="height:560px;background:{g}"><img src="{l}" style="width:88%"></div><div class="cap"><b>{t}</b> · <span class="m small">{g.replace("linear-gradient", "")}</span></div></div>' for g, t, l in GR)}
</div>
<p class="abs cap" style="left:120px;top:900px;width:1680px">Gradients stay restrained: two neighbouring brand colours, vertical or a gentle diagonal. Never gradient the dog or the aircraft themselves.</p>
''')
page('Composition', 'Part V · Visual language', f'''
<div class="abs h2" style="left:120px;top:90px">Composition principles</div>
<div class="abs" style="left:120px;top:200px;width:1680px;display:grid;grid-template-columns:repeat(3,1fr);gap:30px">
 <div><div class="tile" style="height:420px;background:var(--gf-turquoise);position:relative;justify-content:flex-start;align-items:flex-start;padding:30px"><div class="d" style="font-size:64px">Big type,<br>left.</div><img class="abs" src="{SYM}" style="right:10px;bottom:20px;width:62%"></div><h3>Headline left, flight right</h3><p class="cap">The aircraft always travels towards the open side of the layout.</p></div>
 <div><div class="tile" style="height:420px;background:var(--gf-yellow-tint);position:relative"><img class="abs" src="{act(6, 'pointing')}" style="left:10px;bottom:10px;width:62%"><div class="abs" style="right:30px;top:120px;background:#050506;color:#fff;border-radius:999px;padding:16px 26px;font-weight:700">Call to action</div></div><h3>The mascot directs attention</h3><p class="cap">Eyes and paw point at the message; never at the edge of the page.</p></div>
 <div><div class="tile" style="height:420px;background:var(--gf-cloud);position:relative;overflow:hidden"><img src="{BI}patterns/pattern_flightpaths.png" style="width:100%;height:100%;object-fit:cover;opacity:.7"><img class="abs" src="{WORD}" style="left:30px;bottom:30px;width:50%"></div><h3>Air to breathe</h3><p class="cap">Keep at least 40% negative space. Patterns sit back; the logo sits forward.</p></div>
</div>''')
# ============================================================ PART VI — APPLICATIONS
def full(img, title, cap, part='Part VI · Applications', bg='var(--gf-cloud)', pos='right:60px;bottom:70px;left:auto'):
    page(title, part, f'<img class="abs" src="{img}" style="left:0;top:0;width:1920px;height:1080px;object-fit:cover"><div class="abs capbox" style="{pos}">{cap}</div>', 'fb', 'background:' + bg)
page('Campaign posters', 'Part VI · Applications', f'''
<div class="abs" style="left:0;top:0;width:1920px;height:1080px;background:var(--gf-cloud)"></div>
<img class="abs" src="{AP}posters/poster_A2_work_takes_flight.png" style="left:150px;top:80px;height:920px;box-shadow:0 30px 60px rgba(0,0,0,.18)">
<img class="abs" src="{AP}posters/poster_A2_in_situ.png" style="left:860px;top:80px;width:920px;border-radius:22px">
<div class="abs capbox" style="left:860px;top:700px;width:920px">A2 campaign poster: full identity, headline in the display face, aircraft flying into open space.</div>''')
page('Social and digital ads', 'Part VI · Applications', f'''
<div class="abs" style="left:0;top:0;width:1920px;height:1080px;background:var(--gf-cloud)"></div>
<img class="abs" src="{AP}digital/instagram_post_1080.png" style="left:100px;top:90px;width:560px;border-radius:18px">
<img class="abs" src="{AP}digital/instagram_story_1080x1920.png" style="left:700px;top:90px;height:900px;border-radius:18px">
<img class="abs" src="{AP}digital/linkedin_post_1200x627.png" style="left:1250px;top:90px;width:580px;border-radius:12px">
<img class="abs" src="{AP}banners/mpu_300x250.png" style="left:1250px;top:430px;width:300px">
<img class="abs" src="{AP}banners/leaderboard_728x90.png" style="left:100px;top:700px;width:560px">
<img class="abs" src="{AP}banners/digital_billboard_1920x600.png" style="left:1250px;top:720px;width:580px;border-radius:12px">
<div class="abs capbox" style="left:100px;top:820px;width:560px">Social posts use single expressions or actions; banners use the aircraft alone when space is tight.</div>''')
full(AP + 'digital/game_activation_concept.png', 'Game-entry concept', 'Proposed engagement game. Deep Sky ground and arcade energy keep it visibly separate from the booking product.')
full(AP + 'digital/mobile_booking_concept.png', 'Booking platform concept', 'Booking concept: turquoise header, searching mascot, a celebrating success state. Listings are illustrative placeholders.', pos='left:30px;bottom:90px;width:250px;font-size:16px')
full(AP + 'digital/desktop_website_concept.png', 'Mobile and desktop', 'Desktop concept: the full lock-up stays in the header; expressions illustrate three ways to use a space. Not a live product.')
page('T-shirts', 'Part VI · Applications', f'''
<img class="abs" src="{AP}merchandise/tshirt_white.png" style="left:0;top:0;width:960px;height:1080px;object-fit:cover">
<img class="abs" src="{AP}merchandise/tshirt_dark.png" style="left:960px;top:0;width:960px;height:1080px;object-fit:cover">
<div class="abs capbox" style="right:60px;bottom:70px;left:auto">White tee: full-colour symbol, 30 cm chest print. Dark tee: proposed keyline lock-up.</div>''', 'fb')
page('Tote and merchandise', 'Part VI · Applications', f'''
<img class="abs" src="{AP}merchandise/tote_bag.png" style="left:0;top:0;width:960px;height:1080px;object-fit:cover">
<img class="abs" src="{AP}merchandise/water_bottle.png" style="left:960px;top:0;width:960px;height:1080px;object-fit:cover">
<div class="abs capbox" style="right:60px;bottom:70px;left:auto">Tote: the waving mascot on its own. Bottle: the aircraft on its own. Each element is used differently.</div>''', 'fb')
full(AP + 'events/event_stall_booth.png', 'Event stall', 'Event stall: pattern back wall, full lock-up, a celebrating mascot and a playing screen.')
page('Animated event display', 'Part VI · Applications', f'''
<div class="abs" style="left:0;top:0;width:1920px;height:1080px;background:#1B2226"></div>
{vid(AP + 'events/event_display_animated.mp4', ST + 'event_display_animated_85.jpg', 'bare', 'position:absolute;left:0;top:0;width:1920px;height:1080px;border-radius:0')}
<div class="abs capbox" style="right:60px;bottom:70px;left:auto">Large event display playing the signature hero loop (1080p).</div>''', 'dark fb')
page('Integrated presentation', 'Part VI · Applications', f'''
<div class="abs" style="left:0;top:0;width:1920px;height:1080px;background:var(--gf-turquoise)"></div>
<div class="abs" style="left:60px;top:60px;width:1800px;height:760px;display:grid;grid-template-columns:repeat(7,minmax(0,1fr));grid-template-rows:repeat(3,minmax(0,1fr));gap:14px">
 <img src="{AP}posters/poster_A2_work_takes_flight.png" style="grid-column:span 2;grid-row:span 3;width:100%;height:100%;object-fit:cover;border-radius:16px">
 <img src="{AP}digital/desktop_website_concept.png" style="grid-column:span 3;grid-row:span 2;width:100%;height:100%;object-fit:cover;border-radius:16px">
 <img src="{AP}digital/instagram_post_1080.png" style="width:100%;height:100%;object-fit:cover;border-radius:16px">
 <img src="{AP}merchandise/tote_bag.png" style="width:100%;height:100%;object-fit:cover;border-radius:16px">
 <img src="{BI}patterns/pattern_flightpaths.png" style="width:100%;height:100%;object-fit:cover;border-radius:16px">
 <img src="{AP}merchandise/tshirt_white.png" style="width:100%;height:100%;object-fit:cover;border-radius:16px">
 <img src="{AP}events/event_stall_booth.png" style="grid-column:span 2;width:100%;height:100%;object-fit:cover;border-radius:16px">
 <img src="{AP}merchandise/water_bottle.png" style="width:100%;height:100%;object-fit:cover;border-radius:16px">
 <img src="{AP}digital/game_activation_concept.png" style="grid-column:span 2;width:100%;height:100%;object-fit:cover;border-radius:16px">
</div>
<img class="abs" src="{LOCK}" style="left:560px;top:850px;width:800px">''')
page('Source notes', 'Production record', f'''
<div class="abs h2" style="left:120px;top:100px">Source notes and production record</div>
<div class="abs" style="left:120px;top:210px;width:800px">
<h3>What was inspected</h3><p class="cap">The supplied 2000×667 GoFloaters logo (PNG/WebP). The Navi by VNGGames Behance project could not be opened from this production environment (network policy blocked behance.net), and no PDF or screenshots of it were supplied. No description of its panels is given here, and nothing in this book copies it.</p>
<h3 style="margin-top:30px">Original vs proposed</h3><p class="cap">Original: the logo, its colours, the dog, the aircraft, the wordmark, tagline and speed lines (reconstructed in vector). Proposed: everything tagged <span class="pill">Proposed</span> — the creative territory, supporting colours, typography, patterns, logo variants, constructed body views, the game and screen concepts.</p></div>
<div class="abs" style="left:1000px;top:210px;width:800px">
<h3>Fidelity</h3><p class="cap">Reconstruction vs source at identical size: mean difference {FID["reconstruction_vs_source"]["mean_abs_diff_0_255"]}/255; {FID["reconstruction_vs_source"]["ink_iou_tolerance_1px"]*100:.1f}% of outline pixels within 1 px. The rig’s rest pose matches the master to {FID["rig_rest_pose_vs_reconstruction"]["mean_abs_diff_0_255"]}/255; the limbs and tail are redrawn as centre-line tubes so they can bend.</p>
<h3 style="margin-top:30px">Where things live</h3><p class="cap m small" style="line-height:1.8">01 source + comparison · 02 master identity · 03 rig · 04 character library · 05 animation · 06 identity system · 07 this book · 08 brand studio · 09 applications</p></div>
''')

CSS = open(os.path.join(HERE, 'brandbook.css')).read()
JS = """
const pages=[...document.querySelectorAll('.page')];
const io=new IntersectionObserver(es=>es.forEach(e=>e.target.querySelectorAll('video').forEach(v=>{if(e.isIntersecting&&!matchMedia('(prefers-reduced-motion: reduce)').matches){v.play().catch(()=>{})}else v.pause()})),{threshold:.5});
pages.forEach(p=>io.observe(p));
document.addEventListener('keydown',e=>{const i=pages.findIndex(p=>p.getBoundingClientRect().top>=-10);if(e.key==='ArrowDown'||e.key==='PageDown'||e.key==='ArrowRight'){pages[Math.min(pages.length-1,i+1)]?.scrollIntoView({behavior:'smooth'});e.preventDefault()}if(e.key==='ArrowUp'||e.key==='PageUp'||e.key==='ArrowLeft'){pages[Math.max(0,i-1)]?.scrollIntoView({behavior:'smooth'});e.preventDefault()}});
const toc=document.getElementById('toc');pages.forEach((p,i)=>{const a=document.createElement('a');a.textContent=String(i+1).padStart(2,'0')+'  '+p.dataset.title;a.href='#';a.onclick=ev=>{ev.preventDefault();p.scrollIntoView()};toc.appendChild(a)});
function fit(){const s=Math.min(innerWidth/1920,1);document.documentElement.style.setProperty('--s',s)}addEventListener('resize',fit);fit();
"""
html = f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>GoFloaters Brand Guidelines</title>
<link rel="stylesheet" href="{BI}tokens/gofloaters-tokens.css"><style>{CSS}</style></head>
<body><nav id="toc" class="m"><b>GoFloaters · Brand Guidelines</b></nav><main>{''.join(pages)}</main><script>{JS}</script></body></html>"""
os.makedirs(OUTDIR, exist_ok=True)
open(os.path.join(OUTDIR, 'brandbook.html'), 'w').write(html)
print(len(pages), 'pages')
