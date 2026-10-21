from common import *

N, NAME, TOTAL = "01", "Brand Research", 4


def chip(x, y, kind):
    fill = {"v": "#004C6A", "c": "#8A5D3B", "s": "#D6A84A", "h": "none"}[kind]
    tc = {"v": "#FFF2D4", "c": "#FFF2D4", "s": "#3b2a10", "h": "#BE1E2D"}[kind]
    st = ' stroke="#BE1E2D" stroke-width="1"' if kind == "h" else ""
    return (f'<rect x="{x}" y="{y-9}" width="12" height="11" rx="2" fill="{fill}"{st}/>'
            f'<text x="{x+6}" y="{y-0.5}" font-size="8" font-weight="700" fill="{tc}" text-anchor="middle">{kind.upper()}</text>')


def building_svg():
    lights = "".join(f'<circle cx="{x}" cy="{58 + 0.0016*(x-260)**2 * -1 + 16:.1f}" r="3" fill="#D6A84A"/>' for x in range(178, 350, 17))
    tables = ""
    for cx in (200, 260, 320):
        tables += (f'<ellipse cx="{cx}" cy="100" rx="13" ry="4" fill="#004C6A"/><rect x="{cx-1.5}" y="100" width="3" height="10" fill="#004C6A"/>'
                   f'<rect x="{cx-24}" y="96" width="6" height="14" rx="2" fill="#8A5D3B"/><rect x="{cx+18}" y="96" width="6" height="14" rx="2" fill="#8A5D3B"/>')
    windows = "".join(f'<rect x="{x}" y="{y}" width="26" height="22" rx="2" fill="#F6DFAE" stroke="#004C6A" stroke-width="1.2"/>'
                      for y in (132, 190) for x in (172, 212, 278, 318))
    return f'''<svg viewBox="0 0 560 268" width="100%" style="display:block;font-family:Glyphs,Lato,sans-serif">
  <path d="M410 20a16 16 0 1 0 14 24 13 13 0 0 1-14-24z" fill="#004C6A"/>
  <g fill="#D6A84A"><circle cx="380" cy="30" r="2"/><circle cx="455" cy="62" r="1.6"/><circle cx="150" cy="26" r="1.6"/><circle cx="118" cy="52" r="2"/></g>
  <line x1="165" y1="112" x2="165" y2="52" stroke="#004C6A" stroke-width="2"/><line x1="355" y1="112" x2="355" y2="52" stroke="#004C6A" stroke-width="2"/>
  <path d="M165 56 Q260 98 355 56" fill="none" stroke="#004C6A" stroke-width="1.2"/>
  {lights}
  {tables}
  <rect x="150" y="112" width="220" height="6" fill="#004C6A"/>
  <rect x="155" y="118" width="210" height="140" fill="#FBEBC9" stroke="#004C6A" stroke-width="1.6"/>
  <line x1="155" y1="176" x2="365" y2="176" stroke="#004C6A" stroke-width="1.2"/>
  {windows}
  <rect x="246" y="214" width="28" height="44" fill="#004C6A"/>
  <g transform="translate(212 128) scale(1.05)" fill="none" stroke="#8A5D3B" stroke-width="1.6"><rect x="0" y="0" width="0" height="0"/></g>
  <line x1="120" y1="258" x2="400" y2="258" stroke="#004C6A" stroke-width="1.6"/>
  <!-- leaders -->
  <g stroke="#8A5D3B" stroke-width="1" fill="none" stroke-dasharray="2 2">
    <path d="M182 100 L120 86"/><path d="M172 150 L120 150"/><path d="M172 206 L120 214"/>
    <path d="M392 36 L410 36"/><path d="M340 140 L405 120"/><path d="M345 200 L405 190"/><path d="M274 248 L405 246"/>
  </g>
  <g fill="#0d3a4f">
    {chip(0, 74, "v")}<text x="16" y="74" font-size="12" font-weight="700" fill="#004C6A">Rooftop seating</text>
    <text x="0" y="88" font-size="10">Listed on Zomato and District</text>
    {chip(0, 138, "v")}<text x="16" y="138" font-size="12" font-weight="700" fill="#004C6A">Indoor &amp; outdoor</text>
    <text x="0" y="152" font-size="10">seating below the roof</text>
    {chip(0, 200, "c")}<text x="16" y="200" font-size="12" font-weight="700" fill="#004C6A">PS5 gaming lounge</text>
    <text x="0" y="214" font-size="10">In the brand manual; a city guide</text>
    <text x="0" y="227" font-size="10">mentions “gaming zones”.</text>
    {chip(0, 242, "h")}<text x="16" y="242" font-size="10">Current status unconfirmed</text>
    {chip(412, 30, "v")}<text x="428" y="30" font-size="12" font-weight="700" fill="#004C6A">10:00 – 23:45</text>
    <text x="412" y="44" font-size="10">Listed opening hours</text>
    {chip(412, 108, "v")}<text x="428" y="108" font-size="12" font-weight="700" fill="#004C6A">Mixed café menu</text>
    <text x="412" y="122" font-size="10">Coffee, beverages, burgers,</text>
    <text x="412" y="135" font-size="10">pizza, momos, desserts…</text>
    <text x="412" y="148" font-size="10" fill="#BE1E2D">Listings disagree on cuisines</text>
    {chip(412, 186, "v")}<text x="428" y="186" font-size="12" font-weight="700" fill="#004C6A">≈ ₹1,000 for two</text>
    <text x="412" y="200" font-size="10">Same on Zomato and District;</text>
    <text x="412" y="213" font-size="10">item prices not retrievable</text>
    {chip(412, 242, "v")}<text x="428" y="242" font-size="12" font-weight="700" fill="#004C6A">Anna Nagar East</text>
    <text x="412" y="256" font-size="10">Plot 273, 2nd Main Road</text>
  </g>
  <text x="260" y="266" font-size="8.5" fill="#4e6b78" text-anchor="middle">Illustration, not a drawing of the actual building</text>
</svg>'''


def revenue_bars():
    rows = [("Today", 1.0, 1.5, "₹1–1.5 lakh / month", "c"), ("Within 3 months", 4, 4, "₹4 lakh / month", "c"), ("Later ambition", 8, 8, "₹8 lakh / month", "c")]
    out = ""
    for lab, lo, hi, txt, k in rows:
        w_lo, w_hi = lo / 8 * 100, hi / 8 * 100
        rng = f'<div style="position:absolute;left:0;top:0;height:100%;width:{w_hi:.1f}%;background:{"#D6A84A" if lab=="Today" else "#004C6A"};opacity:{0.45 if lab=="Today" else (0.75 if lab.startswith("Within") else 0.45)};border-radius:1mm"></div>'
        solid = f'<div style="position:absolute;left:0;top:0;height:100%;width:{w_lo:.1f}%;background:{"#D6A84A" if lab=="Today" else "#004C6A"};border-radius:1mm"></div>'
        out += (f'<div style="display:grid;grid-template-columns:22mm 1fr;gap:2mm;align-items:center;margin-bottom:1.6mm;">'
                f'<span class="xs" style="font-weight:700;color:var(--brown)">{lab}</span>'
                f'<div><div style="position:relative;height:3.4mm;background:rgba(0,76,106,.07);border-radius:1mm">{rng}{solid}</div>'
                f'<div class="xs" style="margin-top:.5mm">{txt}</div></div></div>')
    return out


def p1():
    side = f'''
    <div>
      <h3>Business context {e("c")}</h3>
      <p class="small" style="margin-bottom:2mm">An <b>existing, operating café</b>. W&amp;W's programme develops the brand from 1 November 2026.</p>
      {revenue_bars()}
      <p class="xs soft" style="margin-top:1mm">Client-reported revenue and management objectives{r("brief")}, not verified results. The ₹8 lakh step depends on demand, capacity and profitability.</p>
      <div class="rule"></div>
      <h3>Not yet visible to customers</h3>
      <ul class="dots small">
        <li>Item names and prices{r("zommenu")}</li>
        <li>A signature dish or drink</li>
        <li>Photographs of the actual venue</li>
        <li>A body of reviews: District shows too few ratings to score{r("district")}</li>
      </ul>
    </div>'''
    inner = (bar(N, NAME, 1, TOTAL)
             + title_block(N, NAME, "What the café offers today, what its identity stands for, and what customers should remember.",
                           ["The offer today", "Brand foundation", "Evidence ladder", "Brand expression &amp; direction"])
             + qhead("What does Café La Mirajh offer today?",
                     "The café already has a rooftop, late hours and a play corner, but customers can't yet see a clear offer.")
             + f'<div class="grid" style="grid-template-columns:1fr 62mm;gap:7mm;align-items:start">{building_svg()}{side}</div>'
             + impl("Before adding new promises, make the existing offer legible: <b>published prices, named signatures, real photographs and listings that agree.</b>")
             + foot(f"Listing facts{r('zom','district')} · gaming mention{r('superch')} · manual{r('manual')}"))
    return page(inner, pattern=True)


def p2():
    steps = [
        ("1", "Customer need", "An unhurried evening out with friends or a partner that feels special, without restobar noise or bill.", "s"),
        ("2", "Café experience", "Open-sky tables, cosy corners, a late close and light play for groups.", "v"),
        ("3", "Products", "Coffee and beverages to linger over, comfort food to share, desserts to finish.", "v"),
        ("4", "Promise", "“Your table on the rooftop, for as long as the conversation lasts.”", "s"),
    ]
    cols = ""
    for i, (n, lab, txt, k) in enumerate(steps):
        last = i == len(steps) - 1
        style = "background:var(--blue);color:var(--cream);border:none" if last else ""
        hstyle = "color:var(--gold)" if last else ""
        tstyle = "font-family:Glyphs,'EB Garamond',serif;font-size:15pt !important;line-height:1.2;color:#fff" if last else ""
        cols += (f'<div class="card" style="{style};padding:4mm 4.2mm;min-height:40mm">'
                 f'<div style="display:flex;justify-content:space-between;align-items:center"><h3 style="{hstyle};margin:0">{n} · {lab}</h3>{e(k)}</div>'
                 f'<div style="margin-top:2mm;font-size:10.4pt;line-height:1.38;{tstyle}">{txt}</div></div>')
        if not last:
            cols += '<div style="display:flex;align-items:center;justify-content:center;color:var(--gold);font-size:16pt;font-weight:700">→</div>'
    arch = '''<svg viewBox="0 0 1000 150" width="100%" height="34mm" style="display:block">
      <path d="M30 146 Q500 -112 970 146" fill="none" stroke="#004C6A" stroke-width="2.4"/>
      <path d="M492 6a13 13 0 1 0 11 19.5 10 10 0 0 1-11-19.5z" fill="#D6A84A"/>
      <text x="500" y="76" text-anchor="middle" font-family="Glyphs,Lato,sans-serif" font-weight="700" font-size="15" fill="#8A5D3B" letter-spacing="3">WHAT CUSTOMERS SHOULD REMEMBER</text>
      <text x="500" y="122" text-anchor="middle" font-family="Glyphs,EB Garamond,serif" font-weight="700" font-size="36" fill="#004C6A">The rooftop table you can keep all evening</text>
    </svg>'''
    pillars = [
        ("Premium", "Stylish · Elegant · High-quality", "Claim only", "#BE1E2D", "Price is mid-market and there are no reviews yet. Let guests say “premium”."),
        ("Cozy", "Warm · Intimate · Comfortable", "Partly supported", "#D6A84A", "Rooftop, indoor and outdoor seating are listed; the mood itself is not yet shown in real photos."),
        ("Friendly &amp; welcoming", "Approachable · Inclusive · Inviting", "Needs proof", "#D6A84A", "Depends on hosting. Make it a visible service standard."),
    ]
    pil = ""
    for name, words, status, col, note in pillars:
        pil += (f'<div style="border-top:2.5px solid var(--blue);padding-top:2mm">'
                f'<div style="display:flex;justify-content:space-between;align-items:baseline"><h4 style="margin:0">{name}</h4>'
                f'<span class="pill" style="border:.3mm solid {col};color:{col}">{status}</span></div>'
                f'<div class="xs" style="color:var(--brown);font-weight:700;margin:.8mm 0 1mm">{words} {e("c")}</div>'
                f'<div style="font-size:9.8pt">{note} {e("s")}</div></div>')
    inner = (bar(N, NAME, 2, TOTAL)
             + qhead("What should customers remember?",
                     "The logo already says “Coffee · Community · Convo”. Conversation should be the one thing people remember.")
             + arch
             + f'<div style="display:grid;grid-template-columns:1fr 7mm 1fr 7mm 1fr 7mm 1.15fr;margin:1mm 0 8mm">{cols}</div>'
             + '<div style="display:grid;grid-template-columns:52mm 1fr 1fr 1fr;gap:7mm;align-items:start">'
             + f'<div><h3>What the existing identity stands for</h3><p class="small">The manual defines three personality pillars, a cup inside a crescent (comfort and the night-time rooftop) and the tagline <i>Coffee · Community · Convo</i>{r("manual")}.</p>'
               f'<p class="xs soft">The status shows how far today’s public evidence supports each pillar.</p></div>'
             + pil + '</div>'
             + impl("Lead with <b>“Convo”</b>. It is already in the logo, it is ownable, and it is credible at ≈ ₹1,000 for two. “Premium” should be earned through guests' words, not headlines.")
             + foot(f"Identity{r('manual')} · listings{r('zom','district')}"))
    return page(inner)


def p3():
    rungs = [
        ("4", "Earned reputation", "Not yet", "#BE1E2D", None,
         ["A steady flow of recent reviews", "Guest photos and stories", "Signature items people name", "Regulars who return weekly"]),
        ("3", "Operational promises that need verification", "Verify before promoting", "#BE1E2D", "h",
         ["PS5 lounge operating, with hours", "Rain cover on the rooftop", "Table-booking route", "“Smoke-friendly” zone (legal advice first)", "“Panoramic views”", "Attentive hosting"]),
        ("2", "Observable digital evidence", f"Observed {OBS}", "#004C6A", "v",
         ["Address in Anna Nagar East", "Rooftop, indoor, outdoor seating", "≈ ₹1,000 for two", "Hours 10:00–23:45", "Menu categories (conflicting)", "Listed on Zomato and District"]),
        ("1", "Documented identity", "Client-stated", "#8A5D3B", "c",
         ["Logo suite and usage rules", "Palette and typography", "Brand voice", "Packaging system", "Tagline “Coffee · Community · Convo”", "Positioning: “premium yet accessible rooftop café”"]),
    ]
    ladder = ""
    for n, name, status, col, k, items in rungs:
        chips = "".join(f'<span style="display:inline-block;border:1px solid {col};color:{"#0d3a4f"};background:{"rgba(190,30,45,.05)" if col=="#BE1E2D" else "rgba(255,255,255,.35)"};border-radius:4mm;padding:1.3mm 3mm;margin:0 1.8mm 2mm 0;font-size:9.2pt">{it}</span>' for it in items)
        ladder += (f'<div style="display:grid;grid-template-columns:9mm 50mm 1fr;align-items:stretch;border-bottom:1px solid var(--line)">'
                   f'<div style="display:flex;align-items:center;justify-content:center;font-family:Glyphs,EB Garamond,serif;font-weight:700;font-size:20pt;color:{col}">{n}</div>'
                   f'<div style="padding:3.6mm 3mm 3.6mm 0;border-right:3px solid {col}"><div style="font-family:Glyphs,EB Garamond,serif;font-weight:700;font-size:12.5pt;color:var(--blue);line-height:1.1">{name}</div>'
                   f'<div class="xs" style="color:{col};font-weight:700;margin-top:.8mm">{e(k) if k else ""}{status}</div></div>'
                   f'<div style="padding:3.4mm 0 1.4mm 4mm">{chips}</div></div>')
    side = f'''<div>
      <div class="card" style="margin-bottom:3mm">
        <h3>Contradictions disclosed</h3>
        <p class="small"><b>Cuisines.</b> Zomato lists coffee, beverages, Chinese, South Indian, pizza, burgers, momos and desserts{r("zom")}. District lists Continental, American and Mexican{r("district")}.</p>
        <p class="small" style="margin:0"><b>Ratings.</b> District: “new”, too few ratings to score. Zomato snapshots showed either one rating or 3.7 from 16. Neither could be resolved because the live pages were inaccessible.</p>
      </div>
      <div class="card">
        <h3>Inaccessible is not absent</h3>
        <p class="small" style="margin:0">The website{r("web")}, Instagram{r("insta")} and Google profile{r("gbp")} could not be loaded from our research environment. That is a limit of this research, <b>not evidence that La Mirajh lacks a digital presence</b>. These should be reviewed first-hand before launch.</p>
      </div></div>'''
    inner = (bar(N, NAME, 3, TOTAL)
             + qhead("Which promises are documented, and which still need proof?",
                     "The identity is well documented; the experience behind it is not yet proven in public.")
             + f'<div class="grid" style="grid-template-columns:1fr 74mm;gap:8mm;align-items:start">'
               f'<div><div class="xs soft" style="margin-bottom:1mm;font-weight:700;letter-spacing:.1em;text-transform:uppercase">↑ Climb in order: each rung needs the one below it</div>{ladder}</div>{side}</div>'
             + impl("Climb the ladder in order: <b>verify operations, publish them consistently, then earn reviews</b>, before amplifying “premium”.")
             + foot(f"Identity{r('manual')} · listings{r('zom','district')}"))
    return page(inner)


def p4():
    sw = [("#FFF2D4", "Cream", "Base", "#3b2a10"), ("#004C6A", "Deep blue", "Brand", "#FFF2D4"), ("#8A5D3B", "Brown", "Warmth", "#FFF2D4"),
          ("#D6A84A", "Gold", "Accents", "#3b2a10"), ("#BE1E2D", "Red", "Rare pop", "#FFF2D4")]
    swatches = "".join(f'<div style="background:{c};color:{t};border:1px solid var(--line);border-radius:1.4mm;padding:1.6mm 1.8mm;height:19mm;display:flex;flex-direction:column;justify-content:space-between">'
                       f'<b style="color:{t};font-size:8pt">{n}</b><span style="font-size:7pt">{c}<br>{role}</span></div>' for c, n, role, t in sw)
    tile = lambda ic, t, body: (f'<div class="card" style="padding:3mm 3.4mm;display:flex;flex-direction:column;gap:1.4mm">'
                                f'<div style="display:flex;align-items:center;gap:2mm">{icon(ic, "6mm")}<h4 style="margin:0;font-size:12pt">{t}</h4></div>{body}</div>')
    colour_body = (f'<div style="display:grid;grid-template-columns:repeat(5,minmax(0,1fr)) 30mm;gap:1.6mm">{swatches}'
                   f'<div style="border-radius:1.4mm;border:1px solid var(--line);background:url(assets/pattern.png) center 32%/150% auto"></div></div>'
                   f'<div class="xs">Cream and deep blue lead; gold for stars; red used sparingly. The line-art pattern (right) belongs on packaging, menus and social backgrounds, never behind text or on main signage{r("manual")}.</div>')
    tiles = [
        tile("star", "Colour &amp; pattern", colour_body).replace('class="card"', 'class="card" style="grid-column:span 2"', 1).replace('style="grid-column:span 2" style="', 'style="grid-column:span 2;', 1),
        tile("chat", "Typography &amp; logo", f'<div style="display:flex;gap:3mm;align-items:center"><div><div style="font-family:Glyphs,EB Garamond,serif;font-weight:700;font-size:17pt;color:var(--blue);line-height:1">Garamond</div><div class="xs">headlines</div>'
             f'<div style="font-family:Glyphs,Lato;font-size:12pt;color:var(--blue);margin-top:1mm">Lato</div><div class="xs">body, menus, captions</div></div>'
             f'<img src="assets/logo-primary.png" style="height:21mm;margin-left:auto" alt=""></div><div class="xs">Use the supplied logo files only. Never stretch, recolour, outline or retype them{r("manual","logo")}.</div>'),
        tile("camera", "Photography", f'<div style="border:1.4px dashed var(--brown);border-radius:1.4mm;height:15mm;display:flex;align-items:center;justify-content:center;text-align:center" class="xs"><span><b>To commission:</b> the real rooftop at dusk,<br>groups mid-conversation, hands and cups</span></div>'
             f'<div class="xs">No verified venue photographs were available to this research. Several manual images appear illustrative. Never present stock or generated scenes as La Mirajh.</div>'),
        tile("chat", "Voice", f'<div style="font-family:Glyphs,EB Garamond,serif;font-size:13pt;color:var(--blue);line-height:1.25">“Pull up a chair. Stay a while.”<br>“Your table’s ready when you are.”</div>'
             f'<div class="xs">Warm, calm and conversational, never flashy{r("manual")}. Lines are illustrative direction, not approved copy.</div>'),
        tile("host", "Hosting", f'<ul class="dots small" style="margin:0"><li>A named table host each evening</li><li>A set time to first order</li><li>No pressure to leave</li><li>A review request at the end</li></ul><div class="xs">Turns “friendly &amp; welcoming” into something guests can describe. {e("s")}</div>'),
    ]
    board = '<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:3.4mm">' + "".join(tiles) + "</div>"
    right = f'''<div style="display:flex;flex-direction:column;gap:3mm">
      <div class="card blue" style="padding:4mm">
        <h3>Recommended direction {e("s")}</h3>
        <div style="font-family:Glyphs,EB Garamond,serif;font-weight:700;font-size:16pt;line-height:1.08;margin-bottom:2mm">The rooftop café made for conversation</div>
        <div style="font-family:Glyphs,EB Garamond,serif;font-size:12.5pt;line-height:1.2;border-top:1px solid rgba(255,242,212,.3);padding-top:2mm">Promise: “Your table on the rooftop, for as long as the conversation lasts.”</div>
      </div>
      <div><h3>Avoid claiming, for now</h3><ul class="dots small">
        <li>“Best” or “most-loved” rooftop</li><li>“Luxury” or “premium” as a headline</li><li>“Smoke-friendly” in marketing</li><li>“Gaming lounge” or “panoramic views” until confirmed</li></ul></div>
      <div class="card" style="padding:2.8mm 3.2mm"><h3>Conclusion</h3><p class="small" style="margin:0">The brand is designed; the experience is not yet visible. Make <b>conversation</b> the memory, prove the rooftop evening works, and let reviews carry “premium”.</p></div>
    </div>'''
    inner = (bar(N, NAME, 4, TOTAL)
             + qhead("How should every touchpoint express one experience?",
                     "One recognisable evening: cream and deep blue, real dusk photography, a calm voice and hosts who let guests stay.")
             + f'<div class="grid" style="grid-template-columns:minmax(0,1fr) 68mm;gap:6mm;align-items:start">{board}{right}</div>'
             + '<div class="srcblock" style="position:absolute;left:15mm;right:15mm;bottom:11mm"><div class="rule" style="margin:0 0 1.6mm"></div><h3 style="margin-bottom:1mm">Sources · observed ' + OBS + '</h3>{{SOURCES}}</div>'
             + foot("Interpretive statements are W&amp;W strategist judgement"))
    return page(inner)


def build():
    html = "".join([p1(), p2(), p3(), p4()])
    html, order = resolve_refs(html)
    html = html.replace("{{SOURCES}}", sources_list(order, extra=("report",), cls="c3"))
    return document("Café La Mirajh · Brand Research", [html])
