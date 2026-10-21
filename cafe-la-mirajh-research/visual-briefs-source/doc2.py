from common import *

N, NAME, TOTAL = "02", "Competitor Analysis", 4


def marker(kind, x, y):
    if kind == "direct":
        return f'<circle cx="{x}" cy="{y}" r="8" fill="#004C6A"/>'
    if kind == "indirect":
        return f'<circle cx="{x}" cy="{y}" r="7.5" fill="#FFF2D4" stroke="#004C6A" stroke-width="2.6"/>'
    if kind == "bench":
        return f'<rect x="{x-7}" y="{y-7}" width="14" height="14" transform="rotate(45 {x} {y})" fill="#D6A84A" stroke="#8A5D3B" stroke-width="1.4"/>'
    if kind == "low":
        return f'<circle cx="{x}" cy="{y}" r="8" fill="#FFF2D4" stroke="#004C6A" stroke-width="2.2" stroke-dasharray="3 2"/><circle cx="{x}" cy="{y}" r="3.2" fill="#004C6A"/>'
    if kind == "subject":
        pts = []
        import math
        for i in range(10):
            rr = 13 if i % 2 == 0 else 5.6
            a = -math.pi / 2 + i * math.pi / 5
            pts.append(f"{x + rr*math.cos(a):.1f},{y + rr*math.sin(a):.1f}")
        return f'<polygon points="{" ".join(pts)}" fill="#BE1E2D"/>'


def venn():
    pts = [
        ("direct", 120, 112, "On De Roof", "start", 14, 5),
        ("bench", 110, 168, "The Living Room", "start", 14, 5),
        ("low", 196, 246, "Ibiza Rooftop", "end", -14, 5),
        ("direct", 412, 248, "The Board Room", "start", 14, 5),
        ("indirect", 470, 112, "VR Game Cafe", "middle", 0, 26),
        ("direct", 240, 352, "Double Roti", "end", -14, 5),
        ("indirect", 362, 352, "India Brew House", "start", 14, 5),
    ]
    marks = ""
    for k, x, y, lab, anc, dx, dy in pts:
        marks += marker(k, x, y) + f'<text x="{x+dx}" y="{y+dy}" font-size="15" font-weight="700" fill="#0d3a4f" text-anchor="{anc}">{lab}</text>'
    return f'''<svg viewBox="0 0 600 430" height="76mm" style="display:block;font-family:Glyphs,Lato,sans-serif">
  <circle cx="215" cy="160" r="138" fill="#004C6A" fill-opacity=".07" stroke="#004C6A" stroke-width="1.6"/>
  <circle cx="385" cy="160" r="138" fill="#D6A84A" fill-opacity=".12" stroke="#8A5D3B" stroke-width="1.6"/>
  <circle cx="300" cy="275" r="138" fill="#8A5D3B" fill-opacity=".07" stroke="#8A5D3B" stroke-width="1.6" stroke-dasharray="5 3"/>
  <text x="120" y="16" font-size="14" font-weight="700" fill="#004C6A" letter-spacing="1.5" text-anchor="middle">ROOFTOP EVENING OUT</text>
  <text x="480" y="16" font-size="14" font-weight="700" fill="#8A5D3B" letter-spacing="1.5" text-anchor="middle">GROUP PLAY &amp; ACTIVITY</text>
  <text x="300" y="428" font-size="14" font-weight="700" fill="#8A5D3B" letter-spacing="1.5" text-anchor="middle">CASUAL CAFÉ MEAL &amp; COFFEE</text>
  {marks}
  {marker("subject", 300, 196)}
  <text x="300" y="228" font-size="16" font-weight="700" fill="#BE1E2D" text-anchor="middle">Café La Mirajh</text>
  <text x="300" y="245" font-size="12" fill="#BE1E2D" text-anchor="middle">(intended offer)</text>
</svg>'''


def p1():
    rows = [
        ("direct", "On De Roof", "AA Block 2nd St, Shanthi Colony", "Same rooftop occasion and price band", r("odr_z")),
        ("direct", "Ibiza Rooftop Lounge &amp; Bistro Café", "148, 3rd St, AB Block", "Closest look-alike: new rooftop café, burgers and pizza", r("ibz_z")),
        ("direct", "The Board Room", "30, 4th Ave, AG Block", "Group-play occasion, same price band", r("br_z")),
        ("direct", "Double Roti", "AH 177, 4th Avenue", "Same burger and comfort-food category", r("dr_z")),
        ("indirect", "VR Game Cafe", "3rd floor, AS Towers, B Block", "Competes for the gaming outing (PS5, VR)", r("vr")),
        ("indirect", "India Brew House", "6th Main Road", "Competes for everyday coffee spend", r("ibh_z")),
        ("bench", "The Living Room", "AG Block, 4th Ave, Shanthi Colony", "Premium rooftop restobar: a lesson, not a rival", r("lr_ez")),
    ]
    lab = {"direct": "Direct", "indirect": "Indirect", "bench": "Benchmark"}
    body = "".join(f'<tr><td style="width:21mm;padding-top:2mm"><span class="pill {k}">{lab[k]}</span></td><td style="padding:1.3mm 1.6mm"><b>{n}</b>{ref} <span class="xs soft">· {a}</span><div class="xs" style="margin-top:.3mm">{why}</div></td></tr>' for k, n, a, why, ref in rows)
    rule = f'''<p class="xs soft" style="margin-top:1mm;max-width:118mm"><b>Selection rule.</b> Direct rivals overlap on at least three of four: the same Anna Nagar micro-market, ≈ ₹700–1,200 for two, café or comfort food, and an evening group or rooftop occasion. Considered but not selected: Gaming Garage and Midgard (gaming-first){r("gg","midgard")}, and Flamingo Rooftop Lounge (too little evidence).</p>'''
    side = f'''<div>
      <h3>Why each brand is in the comparison</h3>
      <table><tbody>{body}</tbody></table>

    </div>'''
    inner = (bar(N, NAME, 1, TOTAL)
             + title_block(N, NAME, "Who customers weigh La Mirajh against, what wins their choice, and where La Mirajh can stand apart.",
                           ["Competitive landscape", "Side-by-side comparison", "Priority profiles", "Strategic implications"])
             + qhead("Who does La Mirajh actually compete with?",
                     "La Mirajh competes for three different outings at once: rooftop evenings, group play and casual café meals.")
             + f'<div class="grid" style="grid-template-columns:auto minmax(0,1fr);gap:7mm;align-items:start"><div>{venn()}{rule}</div>{side}</div>'
             + impl("Sitting in all three occasions spreads the brand thin. <b>Lead with one occasion, the calm rooftop evening, and let play and food support it.</b>")
             + foot("Outlets are exact Anna Nagar branches; placement in circles is a strategist judgement"))
    return page(inner, pattern=True)


def pricebar(lo, hi, note=None, maxv=2200):
    if lo is None:
        return f'<div class="xs soft" style="font-style:italic">{note}</div>'
    l, w = lo / maxv * 100, max((hi - lo) / maxv * 100, 2.2)
    txt = f"₹{lo:,}" if lo == hi else f"₹{lo:,}–{hi:,}"
    return (f'<div style="position:relative;height:3mm;background:rgba(0,76,106,.07);border-radius:1mm;margin-top:.8mm">'
            f'<div style="position:absolute;left:{l:.1f}%;width:{w:.1f}%;top:0;bottom:0;background:#004C6A;border-radius:1mm"></div></div>'
            f'<div class="xs" style="margin-top:.6mm">{txt}{" · " + note if note else ""}</div>')


def proofbar(n, label, maxv=9216):
    if n is None:
        return f'<div class="xs">{label}</div>'
    w = n / maxv * 100
    return (f'<div style="height:3mm;background:rgba(0,76,106,.07);border-radius:1mm;margin-top:.8mm"><div style="width:{max(w,1.2):.1f}%;height:100%;background:#D6A84A;border-radius:1mm"></div></div>'
            f'<div class="xs" style="margin-top:.6mm">{label}</div>')


def p2():
    acts = lambda *names: " ".join(icon(n, "4.6mm") for n in names)
    rows = [
        ("subject", "Café La Mirajh", r("zom", "district"), "Mixed menu: coffee, burgers, pizza, momos, desserts", acts("moon"), "Rooftop · indoor · outdoor",
         pricebar(1000, 1000), acts("game") + ' <span class="xs">PS5 (client-stated)</span>', proofbar(None, "District: too few to score · Zomato: 1 or 16 (conflict)"), "District listing · 10:00–23:45"),
        ("direct", "On De Roof", r("odr_z", "odr_jd", "odr_ez"), "Biryani, Chinese, North Indian, kebabs", acts("moon"), "3rd-floor rooftop",
         pricebar(800, 1100), '<span class="xs">Cabanas and live sport (one guide)</span>', proofbar(4463, "4.1 · 1,225 Zomato · 4,463 Justdial"), "Aggregator-led · hours not found"),
        ("direct", "Ibiza Rooftop", r("ibz_z", "ibz_d"), "Burgers, pizza, pasta, sandwiches", acts("moon"), "Rooftop · indoor",
         pricebar(700, 700), '<span class="xs soft">None found</span>', proofbar(None, "3.7 Zomato (count not shown) · District 0.0"), "20% and 10% offers · 11:00–23:00"),
        ("direct", "The Board Room", r("br_z", "br_jd"), "500+ board games, teas, pasta, paninis", "", "Indoor café",
         pricebar(1000, 1200), acts("dice") + ' <span class="xs">Game guides</span>', proofbar(1300, "4.5 · ≈ 1,300 Justdial"), "Aggregators · 11:00–22:00"),
        ("direct", "Double Roti", r("dr_jd", "dr_ez", "lbb"), "Named burgers (Illegal Burger, Double Trouble), tacos", "", "Indoor",
         pricebar(950, 2000, "six listings disagree"), '<span class="xs soft">None found</span>', proofbar(9216, "4.4 · 9,216 Justdial"), "Walk-in, waits reported · 12:00–23:00"),
        ("indirect", "VR Game Cafe", r("vr", "vr_ez"), "PS5 and VR, with burgers, pizza, shakes", "", "3rd-floor gaming café",
         pricebar(None, None, "PS5 ≈ ₹150 per hour: not comparable"), acts("game") + ' <span class="xs">Gaming, birthdays</span>', proofbar(None, "Not assessed"), "Own site · weekday 11:30–20:30"),
        ("indirect", "India Brew House", r("ibh_z", "ibh_sw"), "Coffee, pasta, sandwiches, burgers", "", "Indoor café",
         pricebar(450, 700), '<span class="xs soft">Work-friendly</span>', proofbar(None, "Not assessed"), "Listings · 10:30–21:00"),
        ("bench", "The Living Room", r("lr_ez", "lr_site"), "Cocktails, Italian–Indian, seafood", acts("moon"), "Rooftop terrace",
         pricebar(2100, 2100, "one list"), '<span class="xs">DJ, live sport</span>', proofbar(None, "4.4 (one list)"), "Booking advised on Fridays"),
    ]
    lab = {"direct": "Direct", "indirect": "Indirect", "bench": "Benchmark", "subject": "Subject"}
    trs = ""
    for k, name, ref, prod, ic, setting, price, act, proof, book in rows:
        cls = ' class="hl"' if k == "subject" else ""
        trs += (f'<tr{cls}><td style="width:31mm"><b>{name}</b>{ref}<br><span class="pill {k}" style="margin-top:.8mm">{lab[k]}</span></td>'
                f'<td class="small">{prod}</td><td class="small">{ic} {setting}</td><td style="width:34mm">{price}</td>'
                f'<td>{act}</td><td style="width:38mm">{proof}</td><td class="xs">{book}</td></tr>')
    table = ('<table><thead><tr><th>Outlet</th><th>Products and signatures</th><th>Setting</th><th>Price evidence · ₹ for two</th><th>Activities</th><th>Public proof (ratings)</th><th>Booking · hours</th></tr></thead>'
             f'<tbody>{trs}</tbody></table>')
    inner = (bar(N, NAME, 2, TOTAL)
             + qhead("How do they compare on what customers weigh?",
                     "Established rivals each have one clear reason to visit, backed by 1,000+ ratings. La Mirajh has neither yet.")
             + table
             + '<p class="xs soft" style="margin-top:1.4mm">Price bars show each outlet’s reported “cost for two” range on a ₹0–2,200 scale. Platforms disagree, so these are indicative bands, not a measured basket. Rating bars scale review counts to the largest base (9,216). Where counts differ by platform, the largest is drawn.</p>'
             + impl("La Mirajh already sits mid-band on price. <b>It should compete on a clear reason to visit and visible proof, not on discounts.</b>")
             + foot(f"Observed in platform listings, {OBS}"))
    return page(inner)


def dossier(color, ic, name, addr, role, why, wins, proof_big, proof_small, friction, lesson, refs):
    return f'''<div style="border-top:5px solid {color};background:var(--tint);border-radius:0 0 2mm 2mm;padding:3.2mm 3.4mm;display:flex;flex-direction:column;gap:2mm">
      <div style="display:flex;align-items:center;gap:2mm">{icon(ic, "8mm", color)}<div><h4 style="margin:0">{name}</h4><div class="xs soft">{addr}{refs}</div></div></div>
      <div><span class="pill direct">{role}</span></div>
      <div><h3 style="margin-bottom:.6mm">Why it matters</h3><div style="font-size:9.3pt">{why}</div></div>
      <div><h3 style="margin-bottom:.6mm">What wins customers</h3><div style="font-size:9.3pt">{wins}</div></div>
      <div style="display:flex;align-items:baseline;gap:2mm;border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:1.4mm 0">
        <span style="font-family:Glyphs,EB Garamond,serif;font-weight:700;font-size:20pt;color:var(--blue);line-height:1">{proof_big}</span><span class="xs">{proof_small}</span></div>
      <div><h3 style="margin-bottom:.6mm">Friction reported <span style="text-transform:none;letter-spacing:0;font-weight:400;color:var(--soft)">(directional)</span></h3><div style="font-size:9.3pt">{friction}</div></div>
      <div style="margin-top:auto;background:var(--blue);color:var(--cream);border-radius:1.4mm;padding:2.4mm 2.8mm;font-size:9.3pt"><b style="color:var(--gold)">Lesson · </b>{lesson}</div>
    </div>'''


def p3():
    cards = [
        dossier("#004C6A", "moon", "On De Roof", "AA Block 2nd St, Shanthi Colony", "Direct · rooftop",
                "Same rooftop occasion and price band (₹800–1,100 for two).",
                "Rooftop dinners and celebrations; Chinese, North Indian and biryani.",
                "4.1", "from 1,225 Zomato ratings; 4,463 Justdial reviews",
                "Justdial’s review summary notes some comments on food consistency and upkeep.",
                "Don’t fight it on “rooftop dinner”. Own the café-format evening.", r("odr_z", "odr_jd")),
        dossier("#D6A84A", "pizza", "Ibiza Rooftop Lounge &amp; Bistro Café", "148, 3rd Street, AB Block", "Direct · look-alike",
                "A new rooftop café with burgers and pizza, the closest copy of La Mirajh’s format.",
                "Lowest listed rooftop price (≈ ₹700) and visible 20% and 10% offers.",
                "New", "District 0.0; Zomato 3.7 with no count shown",
                "Too little review evidence to judge. Re-check within 60 days.",
                "Avoid a discount race. Whoever builds proof first wins this pair.", r("ibz_z", "ibz_d")),
        dossier("#8A5D3B", "dice", "The Board Room", "30, 4th Avenue, AG Block", "Direct · play café",
                "Its group-play occasion is the nearest match to La Mirajh’s PS5 corner.",
                "A 500+ game library and guides who explain the games well.",
                "4.5", "from ≈ 1,300 Justdial reviews",
                "Justdial’s summary says a few reviewers waited for game guides at busy times; one District review describes a 30-minute wait.",
                "Hosted activities strain staff. Keep PS5 simple, self-serve and part of the table.", r("br_jd", "br_d")),
        dossier("#BE1E2D", "burger", "Double Roti", "AH 177, 4th Avenue", "Direct · food-led",
                "The same burger and comfort-food category, in the same neighbourhood.",
                "Named signature burgers and staff often praised by name.",
                "4.4", "across Zomato, District and Justdial (9,216 ratings)",
                "Some reviewers mention crowds and long waits.",
                "You can’t out-burger a specialist. Offer its overflow a calmer, bookable seat.", r("dr_jd", "dr_d", "lbb")),
    ]
    inner = (bar(N, NAME, 3, TOTAL)
             + qhead("What should La Mirajh know about each priority rival?",
                     "Four direct rivals, four different lessons, and each one is known for a single thing.")
             + '<div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:4mm">' + "".join(cards) + "</div>"
             + impl("Each rival is known for one thing. <b>La Mirajh needs its own one thing, and “rooftop” alone isn’t it.</b>")
             + foot("Friction notes summarise platform review summaries and individual reviews; they are not systematic samples"))
    return page(inner)


def vchain(title, color, ev, imp, resp):
    st = lambda lab, txt, bg: (f'<div style="background:{bg};border:1px solid var(--line);border-radius:1.6mm;padding:2.2mm 2.8mm" class="small">'
                               f'<div style="font-weight:700;font-size:6.8pt;letter-spacing:.1em;text-transform:uppercase;color:var(--brown);margin-bottom:.5mm">{lab}</div>{txt}</div>')
    arrow = '<div style="text-align:center;color:var(--gold);font-weight:700;font-size:11pt;line-height:1;margin:.6mm 0">↓</div>'
    return (f'<div><div style="display:flex;align-items:center;gap:2mm;margin-bottom:2mm"><span style="width:3mm;height:3mm;border-radius:50%;background:{color}"></span>'
            f'<span style="font-family:Glyphs,EB Garamond,serif;font-weight:700;font-size:15pt;color:var(--blue)">{title}</span></div>'
            + st("Evidence", ev, "var(--tint)") + arrow + st("Customer implication", imp, "var(--tint)") + arrow + st("La Mirajh response", resp, "var(--tint2)") + "</div>")


def p4():
    cols = [
        vchain("Learn: focus", "#004C6A",
               f"Rivals with 1,000+ ratings are each known for one idea: burgers, a game library, rooftop celebrations{r('dr_jd','br_jd','odr_jd')}.",
               "Customers shortlist places they can describe in one line.",
               "Choose one line and three named signatures, and repeat them everywhere."),
        vchain("Differentiate: calm", "#D6A84A",
               f"Nearby rooftops are restaurant or restobar-led: biryani, kebabs, cocktails, DJ, live sport{r('odr_z','lr_ez')}.",
               "People wanting a calm, café-priced rooftop evening have few clearly defined options.",
               "Become the rooftop café for conversation: evening coffee, soft light, low music, no rush."),
        vchain("Differentiate: light play", "#8A5D3B",
               f"Play venues are activity-first: game guides, PS5 sold at ≈ ₹150 an hour{r('br_jd','vr_ez')}.",
               "Groups who want a little play inside a hangout must choose between a session and a setting.",
               "Present PS5 as a table extra in group bookings, never as an arcade."),
    ]
    validate = f'''<div class="card" style="padding:3mm 3.4mm">
      <div style="display:flex;align-items:center;gap:2mm;margin-bottom:1.6mm"><span style="width:3mm;height:3mm;border-radius:50%;background:#BE1E2D"></span>
      <span style="font-family:Glyphs,EB Garamond,serif;font-weight:700;font-size:15pt;color:var(--blue)">Validate before claiming</span></div>
      <ul class="dots small" style="margin:0">
        <li>PS5 operating, with set hours {e("h")}</li><li>Rooftop rain cover for the Oct–Dec monsoon {e("h")}</li>
        <li>A working table-booking route {e("h")}</li><li>Current menu prices, published</li>
        <li>Ibiza Rooftop’s review momentum within 60 days</li><li>On De Roof and Living Room hours (not found)</li></ul>
      <div class="rule"></div>
      <h3 style="margin-bottom:.8mm">Indirect and benchmark lessons</h3>
      <div class="xs"><b>VR Game Cafe</b> sets a public price for gaming. <b>India Brew House</b> anchors casual coffee at ₹450–700 and closes at 21:00. <b>The Living Room</b> shows that “book ahead” signals desirability{r("lr_ez")}.</div>
    </div>'''
    inner = (bar(N, NAME, 4, TOTAL)
             + qhead("What should La Mirajh learn, differentiate on and validate?",
                     "Learn from rivals’ focus, differentiate on calm hosting and light play, and validate before claiming.")
             + f'<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr)) 74mm;gap:5mm;align-items:start">{"".join(cols)}{validate}</div>'
             + '<div class="card blue" style="margin-top:4mm;padding:2.6mm 4mm;display:flex;gap:4mm;align-items:center"><h3 style="margin:0;white-space:nowrap">Conclusion</h3>'
               '<span class="small">The rooftop puts La Mirajh on the shortlist; a single clear reason to visit, visible proof and calm hosting are what will win the choice.</span></div>'
             + '<div class="srcblock" style="position:absolute;left:15mm;right:15mm;bottom:11mm"><div class="rule" style="margin:0 0 1.4mm"></div><h3 style="margin-bottom:1mm">Sources · observed ' + OBS + '</h3>{{SOURCES}}</div>'
             + foot("Interpretive statements are W&amp;W strategist judgement"))
    return page(inner)


def build():
    html = "".join([p1(), p2(), p3(), p4()])
    html, order = resolve_refs(html)
    html = html.replace("{{SOURCES}}", sources_list(order, extra=("report",), cls="c3"))
    return document("Café La Mirajh · Competitor Analysis", [html])
