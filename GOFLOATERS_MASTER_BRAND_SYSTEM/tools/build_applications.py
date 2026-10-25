"""Brand application mockups: HTML/SVG compositions built from the master assets,
rendered to PNG by tools/render_html.js. Sources land in 09_BRAND_APPLICATIONS/source/.
Screens are CONCEPTS: copy is illustrative and makes no product, price or offer claims.
"""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
SRC = os.path.join(ROOT, '09_BRAND_APPLICATIONS/source')
MI = '../../02_MASTER_IDENTITY/'
A = 'assets/'
EX = '../../04_CHARACTER_LIBRARY/expressions/'
PAT = '../../06_BRAND_IDENTITY/patterns/'
LOCKUP = MI + 'original_lockup/gofloaters_lockup_full_colour.svg'
LOCKUP_DARK = MI + 'logo_variants/B_proposed_dark_ground_keyline_transparent.svg'
WORD = MI + 'vectors/gofloaters_wordmark.svg'
WORDTAG = MI + 'vectors/gofloaters_wordmark_tagline.svg'
SYMBOL = MI + 'vectors/gofloaters_symbol_dog_aircraft.svg'
AIRCRAFT = MI + 'aircraft_only/gofloaters_aircraft.svg'
MASCOT = MI + 'mascot_only/gofloaters_mascot_seated.svg'
HEAD = MI + 'mascot_only/gofloaters_mascot_head.svg'
WAVE = MI + 'mascot_only/gofloaters_mascot_waving.svg'
HAPPY = MI + 'mascot_only/gofloaters_mascot_happy.svg'

BASE = """<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="../../06_BRAND_IDENTITY/tokens/gofloaters-tokens.css">
<style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:%(w)dpx;height:%(h)dpx;overflow:hidden;background:%(bg)s}
body{font-family:var(--gf-font-text);color:var(--gf-ink)}
.d{font-family:var(--gf-font-display);font-weight:800;letter-spacing:-0.02em;line-height:.92}
.m{font-family:var(--gf-font-mono);letter-spacing:.08em;text-transform:uppercase}
.abs{position:absolute}
img{display:block}
.tag{font-family:var(--gf-font-mono);font-size:13px;letter-spacing:.12em;text-transform:uppercase;opacity:.6}
%(css)s
</style></head><body>%(body)s</body></html>"""

def page(name, w, h, body, css='', bg='#fff', out=None):
    html = BASE % dict(w=w, h=h, body=body, css=css, bg=bg)
    p = os.path.join(SRC, name + '.html')
    open(p, 'w').write(html)
    return {'html': p, 'out': os.path.join(ROOT, '09_BRAND_APPLICATIONS', out), 'w': w, 'h': h}

SL = lambda x, y, lens, sw, col='#050506', gap=None: ''.join(
    f'<div class="abs" style="left:{x + (i % 2) * 0.0 - L}px;top:{y + i * (gap or sw * 2.6)}px;width:{L}px;height:{sw}px;border-radius:{sw}px;background:{col}"></div>' for i, L in enumerate(lens))

jobs = []
# ---------------------------------------------------------------- POSTER (A-series, 3:4.24)
poster = f"""
<div class="abs" style="inset:0;background:var(--gf-turquoise)"></div>
<img class="abs" src="{PAT}pattern_speedlines.svg" style="left:0;top:0;width:1414px;opacity:.12">
<div class="abs m" style="left:90px;top:90px;font-size:22px">GoFloaters · Freedom in motion</div>
<div class="abs d" style="left:86px;top:170px;font-size:230px">Work<br>takes<br>flight.</div>
<img class="abs" src="{A}hero_symbol_flying.svg" style="left:120px;top:930px;width:1300px">
<div class="abs" style="left:90px;bottom:120px;width:1234px;height:4px;background:#050506"></div>
<img class="abs" src="{WORDTAG}" style="left:90px;bottom:170px;width:620px">
<div class="abs" style="right:90px;bottom:180px;text-align:right;font-size:28px;line-height:1.35;font-weight:600">Find a space that fits the day.<br><span style="opacity:.65;font-weight:500">gofloaters.com</span></div>
"""
jobs.append(page('poster_A2', 1414, 2000, poster, out='posters/poster_A2_work_takes_flight.png'))
# poster in situ (wall + frame)
insitu = f"""
<div class="abs" style="inset:0;background:linear-gradient(#ECEFF0,#DADFE1)"></div>
<div class="abs" style="left:0;right:0;bottom:0;height:260px;background:linear-gradient(#C9CFD2,#B8BFC3)"></div>
<div class="abs" style="left:610px;top:90px;width:700px;height:990px;background:#fff;padding:22px;box-shadow:0 30px 60px rgba(0,0,0,.22),0 4px 10px rgba(0,0,0,.15)">
  <img src="../posters/poster_A2_work_takes_flight.png" style="width:656px;height:946px;object-fit:cover"></div>
<div class="abs tag" style="left:40px;bottom:30px">Mockup · A2 poster in situ</div>
"""
jobs.append(page('poster_insitu', 1920, 1200, insitu, out='posters/poster_A2_in_situ.png'))
# ---------------------------------------------------------------- BANNERS
billboard = f"""
<div class="abs" style="inset:0;background:var(--gf-deep-sky)"></div>
<img class="abs" src="{PAT}pattern_flightpaths.svg" style="left:0;top:-200px;width:1920px;opacity:.10;filter:invert(1)">
<img class="abs" src="{A}hero_symbol_flying.svg" style="left:40px;top:40px;width:900px">
<div class="abs d" style="left:1000px;top:150px;font-size:120px;color:#fff">Spaces that<br>work for you.</div>
<div class="abs" style="left:1004px;top:430px;display:flex;gap:18px;align-items:center">
  <span style="background:var(--gf-yellow);color:#050506;font-weight:700;font-size:28px;padding:18px 34px;border-radius:999px">Find your space</span>
  <span class="m" style="color:#BFE7EE;font-size:18px">Day passes · Meeting rooms · Desks</span></div>
"""
jobs.append(page('banner_billboard', 1920, 600, billboard, out='banners/digital_billboard_1920x600.png'))
leader = f"""
<div class="abs" style="inset:0;background:var(--gf-yellow)"></div>
<img class="abs" src="{AIRCRAFT}" style="left:18px;top:14px;height:62px">
{SL(16, 30, [30, 22, 38], 4)}
<div class="abs d" style="left:190px;top:28px;font-size:34px">Freedom in motion.</div>
<img class="abs" src="{WORD}" style="right:22px;top:30px;height:30px">
"""
jobs.append(page('banner_leaderboard', 728, 90, leader, out='banners/leaderboard_728x90.png'))
mpu = f"""
<div class="abs" style="inset:0;background:var(--gf-turquoise)"></div>
<img class="abs" src="{WAVE}" style="left:40px;top:80px;width:260px">
<div class="abs d" style="left:22px;top:22px;font-size:42px">Hello,<br>new desk.</div>
<img class="abs" src="{WORD}" style="left:22px;bottom:22px;height:30px">
"""
jobs.append(page('banner_mpu', 300, 250, mpu, out='banners/mpu_300x250.png'))
# ---------------------------------------------------------------- SOCIAL
ig = f"""
<div class="abs" style="inset:0;background:var(--gf-yellow-tint)"></div>
<img class="abs" src="{PAT}pattern_propellers.svg" style="left:0;top:0;width:1080px;height:1080px;object-fit:cover;opacity:.35">
<div class="abs" style="left:60px;top:60px;width:960px;height:960px;border-radius:48px;background:var(--gf-turquoise);overflow:hidden">
  <img class="abs" src="{A}dog_celebrating.svg" style="left:430px;top:120px;width:620px">
  <div class="abs d" style="left:56px;top:70px;font-size:120px">Booked.<br>Bliss.</div>
  <div class="abs" style="left:60px;top:360px;font-size:32px;font-weight:600;width:400px;line-height:1.3">Every day can feel like<br>this one.</div>
  <img class="abs" src="{WORD}" style="left:56px;bottom:56px;height:60px">
</div>"""
jobs.append(page('social_instagram_post', 1080, 1080, ig, out='digital/instagram_post_1080.png'))
story = f"""
<div class="abs" style="inset:0;background:var(--gf-deep-sky)"></div>
<img class="abs" src="{PAT}pattern_aircraft.svg" style="left:0;top:420px;width:1080px;height:640px;object-fit:cover;opacity:.22">
<div class="abs" style="left:0;right:0;top:760px;height:400px;background:linear-gradient(transparent,var(--gf-deep-sky))"></div>
<img class="abs" src="{LOCKUP_DARK}" style="left:70px;top:110px;width:620px">
<img class="abs" src="{A}dog_running.svg" style="left:120px;top:560px;width:860px">
<div class="abs d" style="left:80px;top:1220px;font-size:150px;color:#fff">Out of<br>office?<br><span style="color:var(--gf-yellow)">Into one.</span></div>
"""
jobs.append(page('social_instagram_story', 1080, 1920, story, out='digital/instagram_story_1080x1920.png'))
li = f"""
<div class="abs" style="inset:0;background:#fff"></div>
<div class="abs" style="left:0;top:0;width:560px;height:627px;background:var(--gf-turquoise)"></div>
<img class="abs" src="{A}dog_focused.svg" style="left:60px;top:90px;width:470px">
<div class="abs m" style="left:620px;top:80px;font-size:16px">Focused · Workspace stories</div>
<div class="abs d" style="left:616px;top:130px;font-size:84px">Heads down.<br>Spirits up.</div>
<div class="abs" style="left:620px;top:360px;font-size:24px;line-height:1.45;width:520px;opacity:.8">A quiet desk, a good chair and a door that closes. Some days that is the whole plan.</div>
<img class="abs" src="{WORDTAG}" style="left:620px;bottom:60px;width:330px">
"""
jobs.append(page('social_linkedin', 1200, 627, li, out='digital/linkedin_post_1200x627.png'))
# ---------------------------------------------------------------- MOBILE (concept)
phone_css = """.phone{position:absolute;width:430px;height:900px;border-radius:64px;background:#050506;padding:14px;box-shadow:0 40px 80px rgba(0,0,0,.25)}
.screen{width:100%;height:100%;border-radius:52px;overflow:hidden;background:#fff;position:relative}
.chip{display:inline-block;padding:10px 16px;border-radius:999px;border:2px solid #050506;font-weight:600;font-size:15px;margin:0 6px 8px 0}
.card{border:2px solid #E4EAEC;border-radius:22px;padding:14px;margin-bottom:14px;display:flex;gap:14px;align-items:center}
.thumb{width:84px;height:84px;border-radius:16px;flex:none}"""
def phone_screen(x):
    return f"""<div class="phone" style="left:{x}px;top:70px"><div class="screen">
  <div style="background:var(--gf-turquoise);height:330px;position:relative">
    <img class="abs" src="{WORD}" style="left:26px;top:58px;height:34px">
    <img class="abs" src="{A}dog_searching.svg" style="right:-10px;top:96px;width:230px">
    <div class="abs d" style="left:26px;top:120px;font-size:44px">Where to<br>today?</div>
    <div class="abs" style="left:22px;right:22px;bottom:-26px;height:58px;border-radius:999px;background:#fff;border:3px solid #050506;display:flex;align-items:center;padding:0 22px;font-size:17px;color:#6B6B6C">Search a city or area</div>
  </div>
  <div style="padding:52px 22px 0">
    <span class="chip" style="background:var(--gf-yellow)">Day pass</span><span class="chip">Meeting room</span><span class="chip">Desk</span>
    <div class="m" style="font-size:12px;margin:14px 0 12px;opacity:.6">Illustrative listings</div>
    <div class="card"><div class="thumb" style="background:linear-gradient(135deg,#DCF3F7,#6ED0E0)"></div><div><b style="font-size:17px">Quiet corner desk</b><div style="font-size:14px;opacity:.6;margin-top:4px">Sample workspace · Placeholder</div></div></div>
    <div class="card"><div class="thumb" style="background:linear-gradient(135deg,#FFF5CC,#FCE162)"></div><div><b style="font-size:17px">Rooftop meeting room</b><div style="font-size:14px;opacity:.6;margin-top:4px">Sample workspace · Placeholder</div></div></div>
  </div>
  <div class="abs" style="left:0;right:0;bottom:0;height:86px;border-top:2px solid #E4EAEC;display:flex;justify-content:space-around;align-items:center;font-size:13px;font-weight:600">
    <span style="color:var(--gf-turquoise-deep)">● Explore</span><span style="opacity:.5">Saved</span><span style="opacity:.5">Bookings</span><span style="opacity:.5">Profile</span></div>
</div></div>"""
def phone_confirm(x):
    return f"""<div class="phone" style="left:{x}px;top:70px"><div class="screen" style="background:var(--gf-yellow-tint)">
  <img class="abs" src="{A}dog_celebrating.svg" style="left:20px;top:90px;width:390px">
  <div class="abs d" style="left:30px;top:520px;font-size:54px;text-align:left">You’re all set.</div>
  <div class="abs" style="left:30px;top:590px;width:350px;font-size:17px;line-height:1.5;opacity:.75">Confirmation state concept. Shows the Celebrating expression in a success moment.</div>
  <div class="abs" style="left:30px;right:30px;bottom:60px;height:62px;border-radius:999px;background:#050506;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:18px">View details</div>
</div></div>"""
mob = f"""<div class="abs" style="inset:0;background:var(--gf-cloud)"></div>
<img class="abs" src="{PAT}pattern_flightpaths.svg" style="left:0;top:0;width:1600px;opacity:.6">
{phone_screen(260)}{phone_confirm(910)}
<div class="abs tag" style="left:40px;bottom:30px">Concept UI · workspace booking · illustrative content, not a live product</div>"""
jobs.append(page('digital_mobile', 1600, 1040, mob, css=phone_css, out='digital/mobile_booking_concept.png'))
# ---------------------------------------------------------------- DESKTOP (concept)
desk = f"""<div class="abs" style="inset:0;background:var(--gf-cloud)"></div>
<div class="abs" style="left:80px;top:60px;right:80px;bottom:80px;border-radius:18px;background:#fff;box-shadow:0 40px 90px rgba(0,0,0,.18);overflow:hidden">
 <div style="height:44px;background:#EEF2F3;display:flex;align-items:center;gap:8px;padding:0 18px"><i style="width:12px;height:12px;border-radius:9px;background:#F17B2A;display:block"></i><i style="width:12px;height:12px;border-radius:9px;background:#FCE162;display:block"></i><i style="width:12px;height:12px;border-radius:9px;background:#6ED0E0;display:block"></i>
   <div style="margin-left:30px;background:#fff;border-radius:8px;padding:5px 16px;font-size:13px;color:#6B6B6C;width:420px">gofloaters.com — concept</div></div>
 <div style="position:relative;height:620px;background:var(--gf-turquoise)">
   <img class="abs" src="{PAT}pattern_speedlines.svg" style="left:0;top:0;width:1760px;opacity:.1">
   <img class="abs" src="{LOCKUP}" style="left:60px;top:30px;width:330px">
   <div class="abs" style="right:60px;top:56px;display:flex;gap:34px;font-weight:600;font-size:16px"><span>Spaces</span><span>Meeting rooms</span><span>For teams</span><span style="background:#050506;color:#fff;padding:8px 18px;border-radius:999px;margin-top:-8px">Sign in</span></div>
   <div class="abs d" style="left:60px;top:170px;font-size:104px">Spaces that<br>work for you.</div>
   <div class="abs" style="left:64px;top:420px;width:640px;height:76px;border-radius:999px;background:#fff;border:3px solid #050506;display:flex;align-items:center;justify-content:space-between;padding:0 10px 0 30px;font-size:19px;color:#6B6B6C">Search a city, area or venue
     <span style="background:var(--gf-yellow);color:#050506;font-weight:700;padding:16px 26px;border-radius:999px">Search</span></div>
   <img class="abs" src="{A}hero_symbol_flying.svg" style="right:30px;top:120px;width:860px">
 </div>
 <div style="padding:34px 60px;display:grid;grid-template-columns:repeat(3,1fr);gap:28px">
  {''.join(f'<div style="border:2px solid #E4EAEC;border-radius:22px;padding:22px;display:flex;gap:18px;align-items:center"><img src="{p}" style="width:110px;background:{c};border-radius:18px"><div><b style="font-size:20px">{t}</b><div style="opacity:.6;font-size:15px;margin-top:6px">{d}</div></div></div>' for p, c, t, d in [(EX + 'expression_05_thinking.svg', '#FFF5CC', 'Plan the week', 'Explore spaces near you'), (EX + 'expression_06_focused.svg', '#DCF3F7', 'Get in the zone', 'Quiet desks and cabins'), (EX + 'expression_02_happy.svg', '#FFF5CC', 'Meet in person', 'Rooms for small teams')])}
 </div>
</div>
<div class="abs tag" style="left:80px;bottom:30px">Concept UI · desktop website · illustrative content, not a live product</div>"""
jobs.append(page('digital_desktop', 1920, 1200, desk, out='digital/desktop_website_concept.png'))
# ---------------------------------------------------------------- GAME (concept)
game = f"""<div class="abs" style="inset:0;background:var(--gf-deep-sky)"></div>
<img class="abs" src="{PAT}pattern_flightpaths.svg" style="left:0;top:0;width:1920px;opacity:.12;filter:invert(1)">
<div class="abs m" style="left:60px;top:46px;color:#BFE7EE;font-size:16px">Proposed engagement game · separate from the booking platform</div>
<img class="abs" src="{LOCKUP_DARK}" style="right:50px;top:30px;width:330px">
<div class="abs d" style="left:120px;top:220px;font-size:150px;color:#fff">FLOATER<br><span style="color:var(--gf-yellow)">FLIGHT</span></div>
<div class="abs" style="left:126px;top:560px;color:#DCF3F7;font-size:26px;width:640px;line-height:1.45">Steer the aircraft through the city, collect speed lines and discover neighbourhoods along the way.</div>
<div class="abs" style="left:126px;top:720px;display:flex;gap:20px">
  <span style="background:var(--gf-yellow);color:#050506;font-weight:800;font-size:30px;padding:22px 54px;border-radius:999px;box-shadow:0 8px 0 #B89A2E">PLAY</span>
  <span style="border:3px solid #fff;color:#fff;font-weight:700;font-size:26px;padding:20px 40px;border-radius:999px">How to play</span></div>
<div class="abs" style="left:900px;top:200px;width:900px;height:640px;border-radius:40px;background:linear-gradient(#123744,#0E2A33);border:4px solid #6ED0E0;overflow:hidden">
  <img class="abs" src="{PAT}pattern_wings.svg" style="left:0;top:0;width:900px;opacity:.15">
  <img class="abs" src="{A}hero_symbol_flying.svg" style="left:60px;top:150px;width:780px">
  {''.join(f'<div class="abs" style="left:{x}px;top:{y}px;width:{L}px;height:12px;border-radius:9px;background:var(--gf-yellow)"></div>' for x, y, L in [(720, 120, 90), (780, 470, 60), (600, 540, 120)])}
  <div class="abs m" style="left:30px;bottom:24px;color:#fff;font-size:18px">Score 0 · Concept frame</div></div>
<div class="abs tag" style="left:60px;bottom:30px;color:#BFE7EE;opacity:.8">Game concept · name, mechanics and screens are proposals only</div>"""
jobs.append(page('digital_game', 1920, 1080, game, out='digital/game_activation_concept.png'))
# ---------------------------------------------------------------- MERCHANDISE
TEE = "M210,80 C250,60 290,48 330,40 C350,80 410,96 450,96 C490,96 550,80 570,40 C610,48 650,60 690,80 L820,190 L740,300 L680,250 L680,860 C560,880 340,880 220,860 L220,250 L160,300 L80,190 Z"
def tee(color, art, label, art_w=300, art_top=250, dark=False):
    sh = 'rgba(255,255,255,.035)' if dark else 'rgba(0,0,0,.045)'
    return f"""<div class="abs" style="inset:0;background:{'#E9EDEF' if not dark else '#DDE3E5'}"></div>
<svg class="abs" style="left:110px;top:60px" width="900" height="920" viewBox="0 0 900 920">
 <defs><filter id="s" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="18" stdDeviation="18" flood-opacity=".18"/></filter></defs>
 <path d="{TEE}" fill="{color}" filter="url(#s)"/>
 <path d="M330,40 C350,80 410,96 450,96 C490,96 550,80 570,40" fill="none" stroke="{sh}" stroke-width="14"/>
 <path d="M300,300 C330,500 300,700 320,860 M600,300 C570,520 600,700 580,860" fill="none" stroke="{sh}" stroke-width="22"/>
</svg>
<img class="abs" src="{art}" style="left:{560 - art_w / 2}px;top:{art_top}px;width:{art_w}px">
<div class="abs tag" style="left:40px;bottom:30px">{label}</div>"""
jobs.append(page('merch_tee_white', 1120, 1040, tee('#FFFFFF', SYMBOL, 'Mockup · white T-shirt · full symbol, chest print 30 cm', 440, 300), out='merchandise/tshirt_white.png'))
jobs.append(page('merch_tee_dark', 1120, 1040, tee('#0E2A33', LOCKUP_DARK, 'Mockup · dark T-shirt · keyline lockup (proposed dark-ground variant)', 470, 330, True), out='merchandise/tshirt_dark.png'))
tote = f"""<div class="abs" style="inset:0;background:#E9EDEF"></div>
<svg class="abs" style="left:250px;top:40px" width="640" height="980" viewBox="0 0 640 980">
 <defs><filter id="s"><feDropShadow dx="0" dy="16" stdDeviation="16" flood-opacity=".18"/></filter></defs>
 <path d="M190,330 C190,120 450,120 450,330" fill="none" stroke="#D8CDB6" stroke-width="34"/>
 <path d="M60,320 L580,320 L600,950 L40,950 Z" fill="#EFE6D2" filter="url(#s)"/>
 <path d="M60,320 L580,320 L582,350 L58,350 Z" fill="#E2D7BE"/>
</svg>
<img class="abs" src="{WAVE}" style="left:400px;top:440px;width:330px">
<img class="abs" src="{WORD}" style="left:385px;top:810px;width:360px">
<div class="abs tag" style="left:40px;bottom:30px">Mockup · canvas tote · independent mascot (waving) + wordmark, 1-side screen print</div>"""
jobs.append(page('merch_tote', 1140, 1040, tote, out='merchandise/tote_bag.png'))
bottle = f"""<div class="abs" style="inset:0;background:var(--gf-yellow-tint)"></div>
<svg class="abs" style="left:380px;top:60px" width="380" height="940" viewBox="0 0 380 940">
 <defs><linearGradient id="b" x1="0" x2="1"><stop offset="0" stop-color="#5BBFCF"/><stop offset=".35" stop-color="#7FD9E7"/><stop offset=".7" stop-color="#6ED0E0"/><stop offset="1" stop-color="#4FB2C2"/></linearGradient>
 <linearGradient id="l" x1="0" x2="1"><stop offset="0" stop-color="#E6ECEE"/><stop offset=".4" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E1E8EA"/></linearGradient>
 <filter id="s"><feDropShadow dx="0" dy="16" stdDeviation="14" flood-opacity=".18"/></filter></defs>
 <rect x="120" y="10" width="140" height="90" rx="20" fill="#050506" filter="url(#s)"/>
 <path d="M110,100 L270,100 C300,140 330,170 330,240 L330,880 C330,915 300,930 190,930 C80,930 50,915 50,880 L50,240 C50,170 80,140 110,100 Z" fill="url(#b)" filter="url(#s)"/>
 <rect x="50" y="420" width="280" height="230" fill="url(#l)"/>
 <rect x="70" y="250" width="16" height="560" rx="8" fill="#fff" opacity=".35"/>
</svg>
<img class="abs" src="{MI}aircraft_only/gofloaters_aircraft_with_speed_lines.svg" style="left:440px;top:500px;width:260px">
<img class="abs" src="{WORD}" style="left:478px;top:600px;width:184px">
<div class="abs tag" style="left:40px;bottom:30px">Mockup · water bottle · independent aircraft mark on a wrap label</div>"""
jobs.append(page('merch_bottle', 1140, 1040, bottle, out='merchandise/water_bottle.png'))
# ---------------------------------------------------------------- EVENTS
booth = f"""<div class="abs" style="inset:0;background:linear-gradient(#F4F7F8,#E3E8EA)"></div>
<div class="abs" style="left:0;right:0;bottom:0;height:300px;background:linear-gradient(#D5DBDE,#C4CBCF)"></div>
<svg class="abs" style="left:0;top:0" width="1920" height="1200" viewBox="0 0 1920 1200">
 <defs><filter id="s"><feDropShadow dx="0" dy="20" stdDeviation="20" flood-opacity=".2"/></filter></defs>
 <polygon points="360,140 1560,140 1560,880 360,880" fill="#6ED0E0" filter="url(#s)"/>
 <polygon points="360,140 240,240 240,960 360,880" fill="#4FB2C2"/>
 <polygon points="1560,140 1680,240 1680,960 1560,880" fill="#4FB2C2"/>
 <polygon points="240,960 1680,960 1560,880 360,880" fill="#B7C0C4"/>
 <rect x="700" y="760" width="520" height="200" rx="10" fill="#fff" filter="url(#s)"/>
 <rect x="700" y="760" width="520" height="40" fill="#FCE162"/>
</svg>
<img class="abs" src="{PAT}pattern_speedlines.svg" style="left:360px;top:140px;width:1200px;height:740px;object-fit:cover;opacity:.12">
<img class="abs" src="{LOCKUP}" style="left:420px;top:180px;width:620px">
<img class="abs" src="{A}dog_celebrating.svg" style="left:1110px;top:150px;width:470px">
<div class="abs" style="left:430px;top:420px;width:620px;height:340px;background:#050506;border-radius:14px;border:10px solid #050506;overflow:hidden"><img src="../events/event_display_still.png" style="width:100%;height:100%;object-fit:cover"></div>
<img class="abs" src="{WORDTAG}" style="left:770px;top:840px;width:380px">
<div class="abs tag" style="left:40px;bottom:30px">Mockup · 4 m event stall · back wall, display screen and counter</div>"""
display_still = f"""<div class="abs" style="inset:0;background:#fff"></div><img class="abs" src="{LOCKUP}" style="left:160px;top:330px;width:1600px">"""
jobs.append(page('event_display_still', 1920, 1080, display_still, out='events/event_display_still.png'))
jobs.append(page('event_booth', 1920, 1200, booth, out='events/event_stall_booth.png'))
led = f"""<div class="abs" style="inset:0;background:#1B2226"></div>
<div class="abs" style="left:0;right:0;bottom:0;height:330px;background:linear-gradient(#2A3237,#14191C)"></div>
<div class="abs" style="left:210px;top:110px;width:1500px;height:844px;background:#000;border:18px solid #0B0F11;box-shadow:0 0 120px rgba(110,208,224,.35)"><img src="../events/event_display_still.png" style="width:100%;height:100%"></div>
<div class="abs" style="left:900px;top:972px;width:120px;height:120px;background:#0B0F11"></div>
<div class="abs tag" style="left:40px;bottom:30px;color:#fff">Mockup · large event display (see events/event_display_animated.mp4 for the playing loop)</div>"""
jobs.append(page('event_led', 1920, 1200, led, out='events/event_display_large.png'))
json.dump(jobs, open(os.path.join(HERE, 'build/app_jobs.json'), 'w'), indent=1)
print(len(jobs), 'mockups')
