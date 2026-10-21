from common import *

N, NAME, TOTAL = "04", "Product &amp; SWOT Analysis", 4


def role_card(num, ic, title, does, items, occasion, accent):
    return f'''<div style="background:var(--tint);border-radius:2mm;border-left:5px solid {accent};padding:2.8mm 3.2mm;display:flex;flex-direction:column;gap:1.2mm">
      <div style="display:flex;align-items:center;gap:2mm">{icon(ic, "7mm", accent)}<div><div class="xs" style="font-weight:700;color:var(--brown);letter-spacing:.1em">ROLE {num}</div><h4 style="margin:0">{title}</h4></div></div>
      <div class="small"><b>Job:</b> {does}</div>
      <div class="small"><b>Listed:</b> {items}</div>
      <div class="small"><b>Serves:</b> {occasion}</div>
      <div class="xs" style="color:var(--red);font-weight:700">Price: not verified · confirm from the current menu</div>
    </div>'''


def table_svg():
    cup = lambda x, y: f'<g transform="translate({x} {y})"><path d="M-12 -8h20v9a10 10 0 0 1-20 0z" fill="#FFF2D4" stroke="#004C6A" stroke-width="2.2"/><path d="M8 -5h4a4 4 0 0 1 0 8h-4" fill="none" stroke="#004C6A" stroke-width="2.2"/></g>'
    plate = lambda x, y, r=20, fill="#FFF2D4": f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" stroke="#004C6A" stroke-width="2.2"/><circle cx="{x}" cy="{y}" r="{r-7}" fill="none" stroke="#004C6A" stroke-opacity=".35" stroke-width="1.4"/>'
    return f'''<svg viewBox="0 0 300 300" width="100%" style="display:block;max-height:86mm">
      <circle cx="150" cy="150" r="128" fill="#FBEBC9" stroke="#8A5D3B" stroke-width="3"/>
      <circle cx="150" cy="150" r="118" fill="none" stroke="#8A5D3B" stroke-opacity=".3" stroke-width="1.4"/>
      {cup(88, 92)}{cup(212, 92)}{cup(88, 214)}{cup(212, 214)}
      <text x="88" y="68" font-size="11" text-anchor="middle" fill="#004C6A" font-weight="700">1 · drinks</text>
      {plate(150, 112, 26)}<path d="M136 112h28M140 104h20a6 6 0 0 0-20 0M140 120h20" stroke="#8A5D3B" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <text x="150" y="152" font-size="11" text-anchor="middle" fill="#004C6A" font-weight="700">2 · meal anchor</text>
      {plate(150, 196, 30, "#F6DFAE")}<g fill="#D6A84A"><circle cx="140" cy="190" r="5"/><circle cx="154" cy="186" r="5"/><circle cx="160" cy="200" r="5"/><circle cx="144" cy="204" r="5"/></g>
      <text x="150" y="244" font-size="11" text-anchor="middle" fill="#004C6A" font-weight="700">3 · shareable</text>
      {plate(232, 152, 15)}<path d="M224 156h16l-3 6h-10z M226 156a6 6 0 0 1 12 0" fill="#BE1E2D" fill-opacity=".8"/>
      <text x="232" y="182" font-size="11" text-anchor="middle" fill="#004C6A" font-weight="700">4 · treat</text>
      <text x="150" y="296" font-size="10" text-anchor="middle" fill="#4e6b78">Illustrative table, not a photograph</text>
    </svg>'''


def p1():
    c1 = role_card(1, "cup", "Repeat-visit drinks", "a low-commitment reason to come back mid-week and to linger",
                   f"coffee and beverages{r('zom')}; hot and cold cups in the packaging system{r('manual')}", "friend groups and couples, every evening", "#004C6A")
    c2 = role_card(2, "burger", "Meal anchors", "turns a drinks visit into dinner and sets the size of the bill",
                   f"burgers, pizza{r('zom')}; sandwiches and wraps{r('manual')}; Continental, American, Mexican{r('district')}", "couples, groups eating together, gatherings", "#8A5D3B")
    c3 = role_card(3, "share", "Shareables", "lifts spend per table and keeps a group around one table",
                   f"fries{r('manual')}, momos{r('zom')}, pizza to share", "friend groups and hosted gatherings", "#D6A84A")
    c4 = role_card(4, "dessert", "Treats &amp; add-ons", "adds a small extra to each bill and closes the evening",
                   f"desserts{r('zom')}; PS5 time as an experience add-on, if offered {e('c')}", "couples; groups finishing the night", "#BE1E2D")
    centre = f'<div style="display:flex;flex-direction:column;justify-content:center">{table_svg()}</div>'
    gap = f'''<div class="card" style="padding:2.6mm 3.2mm;margin-top:3mm;display:grid;grid-template-columns:auto 1fr;gap:4mm;align-items:center">
      <h3 style="margin:0">What’s missing</h3>
      <div class="small">No accessible source names a <b>signature item</b> or shows <b>item prices</b>; the website menu could not be accessed{r('web')} and Zomato exposed only its section names (food, beverages, bar){r('zommenu')}. Cuisine tags conflict across platforms, and what the “bar” section contains needs confirming {e('h')}.</div></div>'''
    inner = (bar(N, NAME, 1, TOTAL)
             + title_block(N, NAME, "How the menu should work commercially, what the SWOT shows, and what to do first.",
                           ["Product architecture", "Pairings &amp; spend", "SWOT", "Action board"])
             + qhead("How should the menu support different occasions?",
                     "The menu has the right building blocks, but no hero item customers can name.")
             + f'<div style="display:grid;grid-template-columns:minmax(0,1fr) 62mm minmax(0,1fr);gap:4mm;align-items:stretch">'
               f'<div style="display:flex;flex-direction:column;gap:3mm">{c1}{c3}</div>{centre}<div style="display:flex;flex-direction:column;gap:3mm">{c2}{c4}</div></div>'
             + gap
             + impl("Name <b>three signatures, one drink, one shareable and one meal anchor</b>, and publish prices for every role before the first campaign.")
             + foot("Roles are a strategist framework; no sales or margin data was available"))
    return page(inner, pattern=True)


def pairing(title, guests, icons_html, spend_guest, total, note):
    return f'''<div style="background:var(--tint);border-radius:2mm;padding:3mm 3.4mm;display:flex;flex-direction:column;gap:1.6mm">
      <div style="display:flex;justify-content:space-between;align-items:baseline"><h4 style="margin:0">{title}</h4><span class="pill indirect">{guests}</span></div>
      <div style="display:flex;flex-wrap:wrap;gap:1.2mm;align-items:center;min-height:8mm">{icons_html}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:2mm;border-top:1px solid var(--line);padding-top:1.6mm">
        <div><div class="xs soft">Per guest {e("h")}</div><div style="font-family:Glyphs,EB Garamond,serif;font-weight:700;font-size:14pt;color:var(--blue)">{spend_guest}</div></div>
        <div><div class="xs soft">Table total</div><div style="font-family:Glyphs,EB Garamond,serif;font-weight:700;font-size:14pt;color:var(--brown)">{total}</div></div></div>
      <div class="xs">{note}</div></div>'''


def chart_svg():
    data = [(400, 33.3, 66.7), (500, 26.7, 53.3), (600, 22.2, 44.4), (700, 19.0, 38.1)]
    x0, y0, h, ymax = 54, 250, 210, 70
    Y = lambda v: y0 - v / ymax * h
    out = ""
    for v in range(0, 71, 10):
        out += f'<line x1="{x0}" x2="430" y1="{Y(v):.1f}" y2="{Y(v):.1f}" stroke="#004C6A" stroke-opacity=".1"/><text x="{x0-8}" y="{Y(v)+4:.1f}" font-size="11" text-anchor="end" fill="#4e6b78">{v}</text>'
    out += f'<rect x="{x0}" y="{Y(10):.1f}" width="{430-x0}" height="{Y(6.7)-Y(10):.1f}" fill="#BE1E2D" fill-opacity=".14"/>'
    out += f'<text x="438" y="{Y(10)+2:.1f}" font-size="11" fill="#BE1E2D" font-weight="700">today</text><text x="438" y="{Y(10)+15:.1f}" font-size="10.5" fill="#BE1E2D">≈ 7–10 a day</text>'
    for i, (sp, a, b) in enumerate(data):
        cx = x0 + 30 + i * 92
        out += f'<rect x="{cx}" y="{Y(a):.1f}" width="26" height="{y0-Y(a):.1f}" fill="#004C6A"/><text x="{cx+13}" y="{Y(a)-5:.1f}" font-size="11.5" text-anchor="middle" font-weight="700" fill="#004C6A">{a:.0f}</text>'
        out += f'<rect x="{cx+30}" y="{Y(b):.1f}" width="26" height="{y0-Y(b):.1f}" fill="#D6A84A"/><text x="{cx+43}" y="{Y(b)-5:.1f}" font-size="11.5" text-anchor="middle" font-weight="700" fill="#8A5D3B">{b:.0f}</text>'
        out += f'<text x="{cx+28}" y="{y0+17}" font-size="12" text-anchor="middle" font-weight="700" fill="#0d3a4f">₹{sp}</text>'
    out += f'<text x="{(x0+430)/2}" y="{y0+34}" font-size="11" text-anchor="middle" fill="#4e6b78">average spend per guest</text>'
    out += f'<text transform="translate(14 {y0-h/2}) rotate(-90)" font-size="11" text-anchor="middle" fill="#4e6b78">guests needed per day</text>'
    out += f'<rect x="{x0+6}" y="8" width="11" height="11" fill="#004C6A"/><text x="{x0+22}" y="18" font-size="11.5" fill="#0d3a4f">for ₹4 lakh a month</text>'
    out += f'<rect x="{x0+150}" y="8" width="11" height="11" fill="#D6A84A"/><text x="{x0+166}" y="18" font-size="11.5" fill="#0d3a4f">for ₹8 lakh a month</text>'
    return f'<svg viewBox="0 0 520 292" width="100%" style="display:block;font-family:Glyphs,Lato,sans-serif">{out}</svg>'


def p2():
    ic = lambda name, n, col="#004C6A": "".join(icon(name, "6.4mm", col) for _ in range(n))
    plus = '<span style="color:var(--gold);font-weight:700;font-size:12pt">+</span>'
    cards = [
        pairing("Friends’ table", "4 guests", ic("cup", 4) + plus + ic("share", 2, "#8A5D3B") + plus + ic("dessert", 1, "#BE1E2D"),
                "₹350–600", "₹1,400–2,400", "4 drinks, 2 shareables, 1 dessert to share. Built for long evenings."),
        pairing("Couple’s evening", "2 guests", ic("cup", 2) + plus + ic("burger", 1, "#8A5D3B") + plus + ic("dessert", 1, "#BE1E2D"),
                "₹500–750", "₹1,000–1,500", "2 drinks, 1 meal anchor (or 2), 1 dessert to share."),
        pairing("Hosted gathering", "8 guests (example)", ic("cup", 1) + plus + ic("share", 1, "#8A5D3B") + plus + ic("burger", 1, "#8A5D3B") + plus + ic("dessert", 1, "#BE1E2D") + '<span class="xs" style="margin-left:1mm">per guest</span>',
                "₹600–900", "₹4,800–7,200", "A set package per head with a reserved area. Needs costing."),
    ]
    checks = f'''<div class="card" style="padding:2.6mm 3.2mm;border-color:var(--red)">
      <h3 style="color:var(--red)">Suggested combinations, not approved offers. Check before use:</h3>
      <div class="small" style="display:grid;grid-template-columns:1fr 1fr;gap:.4mm 4mm"><span>✓ portion sizes for sharing</span><span>✓ current item prices</span><span>✓ availability at evening peak</span><span>✓ food cost and margin</span></div></div>'''
    inner = (bar(N, NAME, 2, TOTAL)
             + qhead("How can ordering combinations lift spend?",
                     "Spend per guest is as powerful a lever as footfall: ₹600 instead of ₹500 cuts the daily guests needed for ₹4 lakh from ≈ 27 to ≈ 22.")
             + f'<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:4mm">{"".join(cards)}</div>'
             + f'<div style="display:grid;grid-template-columns:150mm minmax(0,1fr);gap:7mm;align-items:start;margin-top:3.4mm">'
               f'<div><h3>Guests needed per day at different spend levels {e("s")}</h3>{chart_svg()}</div>'
               f'<div style="padding-top:5mm">{checks}<p class="xs soft" style="margin-top:2.4mm">Illustrative arithmetic: monthly revenue ÷ 30 days ÷ spend per guest. Revenue figures are client-reported and objectives{r("brief")}; ₹500 per guest is half the listed ₹1,000 for two{r("zom","district")}, not measured spend. Today’s band uses the same ₹500 assumption.</p>'
               f'<p class="small" style="margin-top:2mm"><b>Reading the chart:</b> at ₹500 per guest, ₹4 lakh needs ≈ 27 guests a day against ≈ 7–10 today. Lifting spend to ₹600 brings that to ≈ 22.</p></div></div>'
             + impl("Raise spend per table with <b>shareables and a dessert to finish</b>, and grow covers through repeat group evenings. Neither lever alone reaches ₹4 lakh comfortably.")
             + foot("Per-guest spend bands are hypotheses from the parent report; table totals = per-guest band × guests"))
    return page(inner)


def p3():
    def q(title, sub, color, items, bg):
        lis = "".join(f'<li style="padding:1.6mm 0;border-top:1px solid var(--line)"><b style="display:block;font-size:9.4pt">{t} {e(k)}</b><span class="small">{ev}</span><div class="xs" style="color:var(--brown);margin-top:.4mm"><b style="color:var(--brown)">So:</b> {so}</div></li>' for t, k, ev, so in items)
        return (f'<div style="background:{bg};border-radius:2mm;padding:3mm 3.6mm;border-top:4px solid {color}">'
                f'<div style="display:flex;align-items:baseline;gap:2mm;margin-bottom:.6mm"><span style="font-family:Glyphs,EB Garamond,serif;font-weight:700;font-size:16pt;color:var(--blue)">{title}</span><span class="xs" style="color:{color};font-weight:700;letter-spacing:.1em;text-transform:uppercase">{sub}</span></div>'
                f'<ul style="list-style:none">{lis}</ul></div>')
    S = [("Rooftop at a café price", "v", f"Rooftop seating at ≈ ₹1,000 for two, level with On De Roof and below The Living Room{r('district','odr_z')}.", "an accessible setting for repeat visits"),
         ("Multi-zone and latest close in the set", "v", "Rooftop, indoor and outdoor seating; open until 23:45.", "groups and couples side by side, and an indoor fallback"),
         ("A ready identity with an ownable idea", "c", f"Full brand manual and the tagline “Coffee · Community · Convo”{r('manual')}.", "no rebrand cost; build on “Convo”")]
    W = [("Almost no public proof", "v", "Ratings conflict (none, 1 or 16); website and Instagram unverified by this research.", "loses at the comparison stage"),
         ("No product identity", "v", "Conflicting cuisine tags; no named signature; no visible prices.", "no “you must order…” reason to return"),
         ("Unverified facilities and a scale gap", "h", "PS5, smoke zone and rain cover unconfirmed; ≈ 3× today’s guests needed for ₹4 lakh.", "risk of promising what can’t be delivered")]
    O = [("Proven rooftop demand nearby", "v", f"On De Roof alone carries 1,225 Zomato and 4,463 Justdial ratings{r('odr_jd')}.", "the category doesn’t need creating"),
         ("Appetite for social play", "v", f"Board-game and gaming cafés active nearby: The Board Room (≈ 1,300 reviews), VR Game Cafe, Gaming Garage{r('br_jd','vr','gg')}.", "light play can be a group icebreaker"),
         ("Room to win on hosting", "v", f"Some reviews of Double Roti and The Board Room mention waits at busy times{r('dr_jd','br_jd')}.", "a stated hosting standard can stand out")]
    T = [("Look-alike rooftops and discounting", "v", f"Ibiza Rooftop at ≈ ₹700 with 20% and 10% offers{r('ibz_d')}.", "“rooftop” drifts toward a price war"),
         ("Weather at launch", "h", "The 1 Nov start falls in Chennai’s north-east monsoon (Oct–Dec); summer heat follows.", "rooftop demand may swing week to week"),
         ("Regulatory and reputational risk", "s", "“Smoke-friendly” is in the manual; tobacco promotion is restricted in India (COTPA, 2003).", "take legal advice; keep it out of marketing")]
    grid = f'''<div style="display:grid;grid-template-columns:9mm minmax(0,1fr) minmax(0,1fr);grid-template-rows:auto auto auto;gap:3mm">
      <div></div><div class="xs" style="text-align:center;font-weight:700;letter-spacing:.14em;color:var(--blue)">HELPFUL</div><div class="xs" style="text-align:center;font-weight:700;letter-spacing:.14em;color:var(--red)">HARMFUL</div>
      <div style="writing-mode:vertical-rl;transform:rotate(180deg);text-align:center;font-size:7.4pt;font-weight:700;letter-spacing:.14em;color:var(--brown)">INSIDE THE CAFÉ · INTERNAL</div>
      {q("Strengths", "existing advantages", "#004C6A", S, "var(--tint)")}{q("Weaknesses", "internal limits", "#BE1E2D", W, "var(--tint)")}
      <div style="writing-mode:vertical-rl;transform:rotate(180deg);text-align:center;font-size:7.4pt;font-weight:700;letter-spacing:.14em;color:var(--brown)">OUTSIDE THE CAFÉ · EXTERNAL</div>
      {q("Opportunities", "external demand", "#D6A84A", O, "rgba(214,168,74,.13)")}{q("Threats", "external pressures", "#8A5D3B", T, "rgba(138,93,59,.09)")}
    </div>'''
    inner = (bar(N, NAME, 3, TOTAL)
             + qhead("What helps La Mirajh, and what holds it back?",
                     "A strong setting and weak proof, with a launch that coincides with the monsoon.")
             + grid
             + foot("COTPA = Cigarettes and Other Tobacco Products Act; seek qualified legal advice"))
    return page(inner)


def p4():
    def act(n, title, link, impact, feas, check):
        pip = lambda v, col: "".join(f'<span style="display:inline-block;width:2.2mm;height:2.2mm;border-radius:50%;margin-left:.5mm;background:{col if i < v else "rgba(0,76,106,.15)"}"></span>' for i in range(3))
        return f'''<div style="background:#fff8e8;border:1px solid var(--line);border-radius:1.8mm;padding:2mm 2.6mm;margin-bottom:2mm">
          <div style="display:flex;gap:2mm;align-items:flex-start"><span style="flex:none;width:5.4mm;height:5.4mm;border-radius:50%;background:var(--gold);color:#3b2a10;font-weight:700;font-size:8pt;display:flex;align-items:center;justify-content:center">{n}</span>
          <div><div style="font-weight:700;color:var(--blue);font-size:9.2pt;line-height:1.22">{title}</div><div class="xs" style="color:var(--brown);font-weight:700;margin-top:.4mm">{link}</div></div></div>
          <div class="xs" style="display:flex;gap:4mm;margin:1.2mm 0 .8mm 7.4mm"><span>Impact{pip(impact, "#004C6A")}</span><span>Feasibility{pip(feas, "#D6A84A")}</span></div>
          <div class="xs" style="margin-left:7.4mm"><b>Check:</b> {check}</div></div>'''
    cols = [
        ("Now", "before 1 November", "#BE1E2D", [
            act(1, "Proof audit: rain cover, PS5, booking route, prices", "W3 × T2, T3", 3, 3, "everything promoted is true on a wet Friday"),
            act(2, "Legal advice on smoking language; drop it from marketing", "T3", 2, 3, "legal confirmation on file"),
            act(3, "Align listings and publish the menu with prices", "W1, W2", 3, 3, "Zomato, District, Google, website and Instagram match")]),
        ("Next", "November–December", "#D6A84A", [
            act(4, "Choose three signatures: drink, shareable, meal anchor", "W2", 3, 2, "portions, food cost, peak-time availability"),
            act(5, "Launch a weekly group night with PS5 at the table", "S1, S2 → O1, O2", 3, 2, "share of 3+ tables; repeat groups"),
            act(6, "Hosting standard and a post-visit review routine", "W1 · O3 · T1", 3, 3, "new reviews per week; time to first order")]),
        ("Later", "after validation", "#004C6A", [
            act(7, "Hosted-gathering packages, capped and off-peak", "O1 · capacity", 2, 1, "costed package; no displacement of regulars"),
            act(8, "Revisit the ₹8 lakh path", "client objective", 2, 1, "covered capacity, staffing and margin validated")]),
    ]
    board = ""
    for name, when, col, cards in cols:
        board += (f'<div style="background:var(--tint);border-radius:2mm;padding:3mm 3.2mm;border-top:5px solid {col}">'
                  f'<div style="display:flex;align-items:baseline;gap:2mm;margin-bottom:2.2mm"><span style="font-family:Glyphs,EB Garamond,serif;font-weight:700;font-size:17pt;color:var(--blue)">{name}</span><span class="xs" style="font-weight:700;color:{col};letter-spacing:.08em;text-transform:uppercase">{when}</span></div>'
                  + "".join(cards) + "</div>")
    weekly = '''<div class="card blue" style="padding:3mm 3.6mm">
      <h3>Weekly scorecard</h3>
      <ul class="dots small" style="margin:0"><li>Guests per day</li><li>Average spend per guest (₹)</li><li>Share of tables with 3+ guests</li><li>New reviews</li><li>PS5 tables</li><li>Rooftop vs indoor on rainy nights</li></ul>
      <div class="rule" style="border-color:rgba(255,242,212,.25)"></div>
      <h3>Conclusion</h3><div class="small">Close the proof gap first, then build the weekly ritual. Scale only what the scorecard shows working.</div></div>'''
    inner = (bar(N, NAME, 4, TOTAL)
             + qhead("What should happen first?", "Close the proof gap first, build the weekly ritual second, and scale only what the numbers support.")
             + f'<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr)) 54mm;gap:4mm;align-items:start">{board}{weekly}</div>'
             + '<div class="srcblock" style="position:absolute;left:15mm;right:15mm;bottom:11mm"><div class="rule" style="margin:0 0 1.4mm"></div><h3 style="margin-bottom:1mm">Sources · observed ' + OBS + '</h3>{{SOURCES}}</div>'
             + foot("Impact and feasibility pips are strategist judgement, not measured data"))
    return page(inner)


def build():
    html = "".join([p1(), p2(), p3(), p4()])
    html, order = resolve_refs(html)
    html = html.replace("{{SOURCES}}", sources_list(order, extra=("report",), cls="c3"))
    return document("Café La Mirajh · Product and SWOT Analysis", [html])
