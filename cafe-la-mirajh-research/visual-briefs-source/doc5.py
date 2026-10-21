import math
from common import *

N, NAME, TOTAL = "05", "Positioning Graph", 4

# Strategist coordinates (0–10), re-checked against the October evidence.
PTS = [
    # key, label, kind, x, y, label anchor, dx, dy
    ("dr", "Double Roti", "direct", 2.0, 5.6, "start", 16, 6),
    ("ibh", "India Brew House", "indirect", 2.4, 2.0, "start", 16, 6),
    ("ibz", "Ibiza Rooftop", "low", 5.2, 4.3, "end", -16, 22),
    ("odr", "On De Roof", "direct", 5.8, 6.3, "end", -16, -8),
    ("lr", "The Living Room", "bench", 7.2, 7.4, "start", 16, 6),
    ("br", "The Board Room", "direct", 7.8, 8.5, "end", -16, 6),
    ("vr", "VR Game Cafe", "indirect", 9.1, 9.2, "end", -16, 6),
]
NOW = (6.6, 5.5)
TARGET = (7.8, 3.2)


def marker(kind, x, y, s=1.0):
    if kind == "direct":
        return f'<circle cx="{x}" cy="{y}" r="{9*s}" fill="#004C6A"/>'
    if kind == "indirect":
        return f'<circle cx="{x}" cy="{y}" r="{8.5*s}" fill="#FFF2D4" stroke="#004C6A" stroke-width="{3*s}"/>'
    if kind == "bench":
        a = 8 * s
        return f'<rect x="{x-a}" y="{y-a}" width="{2*a}" height="{2*a}" transform="rotate(45 {x} {y})" fill="#D6A84A" stroke="#8A5D3B" stroke-width="{1.6*s}"/>'
    if kind == "low":
        return f'<circle cx="{x}" cy="{y}" r="{9*s}" fill="#FFF2D4" stroke="#004C6A" stroke-width="{2.4*s}" stroke-dasharray="4 3"/><circle cx="{x}" cy="{y}" r="{3.5*s}" fill="#004C6A"/>'


def star(x, y, ro=16, ri=6.8, fill="#BE1E2D"):
    pts = []
    for i in range(10):
        rr = ro if i % 2 == 0 else ri
        a = -math.pi / 2 + i * math.pi / 5
        pts.append(f"{x + rr*math.cos(a):.1f},{y + rr*math.sin(a):.1f}")
    return f'<polygon points="{" ".join(pts)}" fill="{fill}"/>'


def big_graph():
    X = lambda v: 110 + 85 * v
    Y = lambda v: 500 - 47 * v
    g = f'<rect x="110" y="30" width="850" height="470" fill="#FBEBC9" stroke="#004C6A" stroke-opacity=".35"/>'
    for v in range(1, 10):
        g += f'<line x1="{X(v)}" y1="30" x2="{X(v)}" y2="500" stroke="#004C6A" stroke-opacity=".06"/><line x1="110" y1="{Y(v)}" x2="960" y2="{Y(v)}" stroke="#004C6A" stroke-opacity=".06"/>'
    g += f'<line x1="{X(5)}" y1="30" x2="{X(5)}" y2="500" stroke="#004C6A" stroke-opacity=".35" stroke-dasharray="6 5"/><line x1="110" y1="{Y(5)}" x2="960" y2="{Y(5)}" stroke="#004C6A" stroke-opacity=".35" stroke-dasharray="6 5"/>'
    q = 'font-size="13" fill="#8A5D3B" font-weight="700" letter-spacing="1.4"'
    g += f'<text x="124" y="52" {q}>FOOD-LED · LIVELY</text><text x="946" y="52" {q} text-anchor="end">ACTIVITY &amp; PARTY VENUES</text>'
    g += f'<text x="124" y="488" {q}>COFFEE &amp; FOOD · QUIET</text><text x="946" y="488" {q} text-anchor="end">SETTING-LED · CALM EVENINGS</text>'
    for v in (0, 5, 10):
        g += f'<text x="{X(v)}" y="522" font-size="13" fill="#4e6b78" text-anchor="middle">{v}</text><text x="98" y="{Y(v)+5}" font-size="13" fill="#4e6b78" text-anchor="end">{v}</text>'
    g += '<text x="110" y="546" font-size="15" font-weight="700" fill="#004C6A">← Food-and-drink-led visit</text>'
    g += '<text x="960" y="546" font-size="15" font-weight="700" fill="#004C6A" text-anchor="end">Venue-and-experience-led visit →</text>'
    g += '<text x="535" y="546" font-size="13" fill="#4e6b78" text-anchor="middle">X · what the guest goes for</text>'
    g += '<text transform="translate(40 265) rotate(-90)" font-size="15" font-weight="700" fill="#004C6A" text-anchor="middle">Quiet conversation ↔ Active group interaction</text>'
    g += '<text transform="translate(64 265) rotate(-90)" font-size="13" fill="#4e6b78" text-anchor="middle">Y · how the table behaves</text>'
    for key, lab, kind, x, y, anc, dx, dy in PTS:
        g += marker(kind, X(x), Y(y)) + f'<text x="{X(x)+dx}" y="{Y(y)+dy}" font-size="16" font-weight="700" fill="#0d3a4f" text-anchor="{anc}">{lab}</text>'
    nx, ny = X(NOW[0]), Y(NOW[1])
    g += f'<ellipse cx="{nx}" cy="{ny}" rx="60" ry="47" fill="#BE1E2D" fill-opacity=".07" stroke="#BE1E2D" stroke-width="2.4" stroke-dasharray="7 5"/><circle cx="{nx}" cy="{ny}" r="4.5" fill="#BE1E2D"/>'
    g += f'<text x="{nx+70}" y="{ny-6}" font-size="16" font-weight="700" fill="#BE1E2D">La Mirajh · provisional today</text><text x="{nx+70}" y="{ny+12}" font-size="13" fill="#BE1E2D">a zone, not a point: signals conflict</text>'
    tx, ty = X(TARGET[0]), Y(TARGET[1])
    g += '<defs><marker id="ah" markerWidth="10" markerHeight="10" refX="7" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#BE1E2D"/></marker></defs>'
    g += f'<path d="M{nx+30} {ny+40} Q {nx+70} {ny+80} {tx-14} {ty-18}" fill="none" stroke="#BE1E2D" stroke-width="2.6" marker-end="url(#ah)"/>'
    g += star(tx, ty, 19, 8)
    g += f'<text x="{tx}" y="{ty+42}" font-size="16" font-weight="700" fill="#BE1E2D" text-anchor="middle">La Mirajh · recommended target</text><text x="{tx}" y="{ty+60}" font-size="13" fill="#BE1E2D" text-anchor="middle">the rooftop café made for conversation</text>'
    return f'<svg viewBox="0 0 1000 556" style="display:block;height:133mm;width:auto;margin:0 auto;font-family:Glyphs,Lato,sans-serif">{g}</svg>'


def legend():
    item = lambda svg, txt: f'<span style="display:inline-flex;align-items:center;gap:1.4mm"><svg viewBox="0 0 30 30" width="4.6mm" height="4.6mm">{svg}</svg>{txt}</span>'
    return ('<div style="display:flex;flex-wrap:wrap;gap:5mm;font-size:8.4pt;align-items:center">'
            + item(marker("direct", 15, 15, 1.1), "Direct competitor")
            + item(marker("indirect", 15, 15, 1.1), "Indirect alternative")
            + item(marker("bench", 15, 15, 1.0), "Aspirational benchmark")
            + item(marker("low", 15, 15, 1.1), "Low-evidence placement")
            + item('<ellipse cx="15" cy="15" rx="13" ry="10" fill="#BE1E2D" fill-opacity=".08" stroke="#BE1E2D" stroke-width="2" stroke-dasharray="4 3"/><circle cx="15" cy="15" r="3" fill="#BE1E2D"/>', "La Mirajh provisional current zone")
            + item(star(15, 15, 13, 5.5), "La Mirajh recommended target")
            + "</div>")


def p1():
    head = f'''<div style="display:grid;grid-template-columns:24mm 1fr auto;gap:5mm;align-items:center;margin-bottom:2mm">
      <img src="assets/logo-primary.png" style="width:24mm" alt="Café La Mirajh primary logo">
      <div><div class="title" style="display:block;margin:0"><div class="num" style="font-size:10.5pt">Brief 05 of 05 · Positioning Graph</div></div>
      <div style="font-family:Glyphs,EB Garamond,serif;font-weight:700;font-size:19pt;color:var(--blue);line-height:1.08">La Mirajh should move from an unclear middle toward calm, setting-led evenings.</div></div>
      <div class="xs soft" style="text-align:right;max-width:62mm">Where La Mirajh sits among the alternatives, where it should move, and what it must prove.<br><b>1</b> Graph · <b>2</b> Placements · <b>3</b> Interpretation · <b>4</b> Proof</div></div>'''
    inner = (bar(N, NAME, 1, TOTAL) + head + big_graph()
             + f'<div style="display:flex;justify-content:center;margin-top:1mm">{legend()}</div>'
             + f'<div class="xs soft" style="margin-top:1.4mm">{e("s")}Coordinates are W&amp;W strategist assessments of public listing evidence ({OBS}), not consumer-perception research. Price is off the axes because platform figures conflict.</div>'
             + foot("Scale 0–10 on both axes"))
    return page(inner)


def p2():
    rows = [
        ("Double Roti", "Direct", 2.0, 5.6, "950–2,000", f"Named signature burgers; crowds and waits in reviews{r('lbb','dr_jd')}", "High"),
        ("India Brew House", "Indirect", 2.4, 2.0, "450–700", f"Coffee, work and hangouts; closes 21:00{r('ibh_sw','ibh_z')}", "Medium"),
        ("Ibiza Rooftop", "Direct", 5.2, 4.3, "700", f"Rooftop with a generic café menu; no activity or review base{r('ibz_z','ibz_d')}", "Low"),
        ("On De Roof", "Direct", 5.8, 6.3, "800–1,100", f"Rooftop dinners, celebrations, live sport (one guide){r('odr_jd','odr_z')}", "Medium"),
        ("The Living Room", "Benchmark", 7.2, 7.4, "≈ 2,100", f"Rooftop restobar with DJ and live sport{r('lr_ez','lr_site')}", "Medium"),
        ("The Board Room", "Direct", 7.8, 8.5, "1,000–1,200", f"500+ games and game guides are the reason to visit{r('br_jd')}", "High"),
        ("VR Game Cafe", "Indirect", 9.1, 9.2, "PS5 ≈ ₹150/hr", f"PS5 and VR sessions, birthdays{r('vr','vr_ez')}", "Medium"),
        ("La Mirajh · today", "Subject", 6.6, 5.5, "1,000", f"Rooftop and gaming zone listed; mixed menu; intended cosy mood{r('district','superch','manual')}", "Low"),
        ("La Mirajh · target", "Proposed", 7.8, 3.2, "≈ 1,000*", "Recommended direction; not yet earned", "—"),
    ]
    cc = {"High": "#004C6A", "Medium": "#D6A84A", "Low": "#BE1E2D", "—": "#4e6b78"}
    trs = ""
    for n, role, x, y, pr, ev, cf in rows:
        hl = ' class="hl"' if n.startswith("La Mirajh") else ""
        trs += (f'<tr{hl}><td class="nm" style="{"color:var(--red)" if hl else ""}">{n}</td><td class="xs">{role}</td><td style="text-align:center;font-weight:700">{x}</td><td style="text-align:center;font-weight:700">{y}</td>'
                f'<td class="small" style="white-space:nowrap">{pr}</td><td class="small">{ev}</td><td class="xs" style="font-weight:700;color:{cc[cf]}">{cf}</td></tr>')
    table = ('<table><thead><tr><th>Outlet</th><th>Role</th><th style="text-align:center">X</th><th style="text-align:center">Y</th><th>₹ for two</th><th>Evidence behind the placement</th><th>Confidence</th></tr></thead>'
             f'<tbody>{trs}</tbody></table><div class="xs soft" style="margin-top:1mm">*Target assumes today’s price frame, with spend lifted through shareables. Price bands are indicative platform figures.</div>')
    table = f'<div>{table}</div>'
    side = f'''<div style="display:flex;flex-direction:column;gap:3mm">
      <div class="card" style="padding:2.8mm 3.2mm"><h3>Scoring rubric</h3>
        <div class="small"><b>X · 0</b> a dish or coffee is the reason to visit · <b>5</b> setting and food matter equally · <b>10</b> the activity or venue is the reason.</div>
        <div class="small" style="margin-top:1mm"><b>Y · 0</b> work, study or quiet talk · <b>5</b> mixed · <b>10</b> games, parties, live sport, group packages.</div></div>
      <div class="card" style="padding:2.8mm 3.2mm"><h3>What changed since the October report</h3>
        <ul class="dots small" style="margin:0"><li>Coordinates re-checked against the same evidence: meanings unchanged, values kept.</li>
        <li>La Mirajh today is shown as a <b>zone</b>: its signals conflict.</li><li>Confidence ratings added for every placement.</li></ul></div>
      <div class="card" style="padding:2.8mm 3.2mm"><h3>Limitations</h3>
        <div class="small">Listings were read from search-indexed content; the website, Instagram and Google profile were not accessible{r('web','insta','gbp')}. No customer survey exists. Treat positions as hypotheses to test, not facts.</div></div></div>'''
    inner = (bar(N, NAME, 2, TOTAL)
             + qhead("How was each brand placed, and how much weight can each placement bear?",
                     "Placements rest on public listing evidence. Rivals with large review bases are placed with more confidence than new venues.")
             + f'<div style="display:grid;grid-template-columns:minmax(0,1fr) 66mm;gap:6mm;align-items:start">{table}{side}</div>'
             + impl("Use the graph to decide direction, not to claim leadership. <b>La Mirajh’s own position is the least certain point on the map.</b>")
             + foot("Coordinates are strategist assessments, not consumer-perception research"))
    return page(inner, pattern=True)


def mini(kind):
    X = lambda v: 20 + 26 * v
    Y = lambda v: 280 - 26 * v
    g = '<rect x="20" y="20" width="260" height="260" fill="#FBEBC9" stroke="#004C6A" stroke-opacity=".3"/>'
    g += f'<line x1="{X(5)}" y1="20" x2="{X(5)}" y2="280" stroke="#004C6A" stroke-opacity=".25" stroke-dasharray="4 4"/><line x1="20" y1="{Y(5)}" x2="280" y2="{Y(5)}" stroke="#004C6A" stroke-opacity=".25" stroke-dasharray="4 4"/>'
    dots = "".join(marker(k, X(x), Y(y), .7) for _, _, k, x, y, *_ in PTS)
    if kind == "clusters":
        g += f'<ellipse cx="{X(2.2)}" cy="{Y(3.8)}" rx="32" ry="66" fill="#8A5D3B" fill-opacity=".14"/>'
        g += f'<ellipse cx="{X(6.1)}" cy="{Y(6.0)}" rx="54" ry="66" transform="rotate(-35 {X(6.1)} {Y(6.0)})" fill="#004C6A" fill-opacity=".1"/>'
        g += f'<ellipse cx="{X(8.5)}" cy="{Y(8.85)}" rx="34" ry="22" transform="rotate(-25 {X(8.5)} {Y(8.85)})" fill="#D6A84A" fill-opacity=".3"/>'
        g += dots
        g += f'<text x="{X(2.2)}" y="{Y(0.9)}" font-size="11" text-anchor="middle" fill="#8A5D3B" font-weight="700">food &amp; coffee</text>'
        g += f'<text x="{X(4.4)}" y="{Y(8.2)}" font-size="11" text-anchor="middle" fill="#004C6A" font-weight="700">rooftop venues</text>'
        g += f'<text x="{X(7.5)}" y="{Y(9.35)}" font-size="11" text-anchor="end" fill="#8A5D3B" font-weight="700">activity-led</text>'
    elif kind == "tradeoff":
        g += dots
        g += f'<line x1="{X(1)}" y1="{Y(2)}" x2="{X(9.6)}" y2="{Y(9.8)}" stroke="#8A5D3B" stroke-width="3" stroke-dasharray="8 5"/>'
        g += f'<text x="{X(1.2)}" y="{Y(9.2)}" font-size="11.5" fill="#8A5D3B" font-weight="700">more setting, more noise</text>'
        g += f'<rect x="{X(6.4)}" y="{Y(4.6)}" width="{26*3.4}" height="{26*3.6}" rx="6" fill="#BE1E2D" fill-opacity=".08" stroke="#BE1E2D" stroke-dasharray="5 4"/>'
        g += f'<text x="{X(8.1)}" y="{Y(0.55)}" font-size="11.5" text-anchor="middle" fill="#BE1E2D" font-weight="700">setting + calm</text>'
    else:
        g += dots
        nx, ny, tx, ty = X(NOW[0]), Y(NOW[1]), X(TARGET[0]), Y(TARGET[1])
        g += f'<ellipse cx="{nx}" cy="{ny}" rx="19" ry="15" fill="none" stroke="#BE1E2D" stroke-width="2" stroke-dasharray="5 4"/>'
        g += '<defs><marker id="ah2" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#BE1E2D"/></marker></defs>'
        g += f'<path d="M{nx+8} {ny+14} L{tx-8} {ty-12}" stroke="#BE1E2D" stroke-width="2.6" marker-end="url(#ah2)"/>' + star(tx, ty, 13, 5.5)
        g += f'<text x="{X(5.2)-12}" y="{Y(4.3)+26}" font-size="11" text-anchor="middle" fill="#0d3a4f" font-weight="700">Ibiza nearby</text>'
    return f'<svg viewBox="0 0 300 300" width="100%" style="display:block;max-height:74mm;font-family:Glyphs,Lato,sans-serif">{g}</svg>'


def p3():
    panel = lambda n, title, svg, pts: (f'<div style="display:flex;flex-direction:column;gap:2mm"><div style="display:flex;align-items:baseline;gap:2mm"><span style="font-family:Glyphs,EB Garamond,serif;font-weight:700;font-size:20pt;color:var(--gold)">{n}</span>'
                                        f'<span style="font-family:Glyphs,EB Garamond,serif;font-weight:700;font-size:15pt;color:var(--blue)">{title}</span></div>{svg}<ul class="dots small">{pts}</ul></div>')
    a = panel("1", "Where competition clusters", mini("clusters"),
              "<li><b>Food and coffee</b> venues sit left: the dish is the reason.</li><li><b>Rooftops</b> cluster mid-right and lean lively: dinners, celebrations, sport.</li><li><b>Activity venues</b> sit top-right: the game is the reason.</li>")
    b = panel("2", "The trade-off customers face", mini("tradeoff"),
              "<li>Across this set, a more memorable setting tends to come with more noise.</li><li>A calm table usually means an ordinary room.</li><li>Few options combine <b>setting with calm</b>, but Ibiza shows the space is contested, not empty.</li>")
    c = panel("3", "The proposed direction", mini("direction"),
              "<li>Move <b>down and right</b>: keep the rooftop as the reason, lower the noise.</li><li>Use PS5 as light play, so it doesn’t pull the brand up into “activity venue”.</li><li>Leadership is not claimed; the position has to be earned.</li>")
    inner = (bar(N, NAME, 3, TOTAL)
             + qhead("What does the map tell us?",
                     "Memorable settings tend to be loud and calm tables tend to be ordinary. La Mirajh can aim to combine setting with calm.")
             + f'<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9mm">{a}{b}{c}</div>'
             + impl("Emphasise <b>setting + calm + hosting</b>. Don’t chase the loud corner where The Board Room, VR Game Cafe and The Living Room already have clear reasons to visit.")
             + foot("Mini-maps reuse the coordinates on page 2"))
    return page(inner)


def p4():
    cols = [
        ("Product", "cup", [("Three named signatures, priced and published", "Guests name them in reviews"),
                            ("An evening coffee and dessert pairing list", "Share of tables ordering a dessert"),
                            ("Shareables sized for 3–5 guests", "Spend per table on group nights")]),
        ("Setting", "moon", [("Rain cover and a visible wet-night plan", "Rooftop use on rainy nights"),
                             ("A quiet zone kept apart from PS5 and groups", "Couples rebooking"),
                             ("Soft light, low music after 20:00", "Guest photos showing the evening mood")]),
        ("Service", "host", [("A named table host each evening", "Reviews that mention being looked after"),
                             ("A set time to first order, and no rush to leave", "Average stay vs order timing"),
                             ("A review request at the end of the visit", "New reviews per week")]),
    ]
    blocks = ""
    for name, ic, reqs in cols:
        rows = "".join(f'<div style="display:grid;grid-template-columns:1fr 1fr;gap:3mm;padding:1.8mm 0;border-top:1px solid var(--line)"><span class="small"><b>{a}</b></span><span class="small" style="color:var(--brown)">{b}</span></div>' for a, b in reqs)
        blocks += (f'<div style="background:var(--tint);border-radius:2mm;padding:3mm 3.4mm"><div style="display:flex;align-items:center;gap:2mm;margin-bottom:1.4mm">{icon(ic, "7mm")}<h4 style="margin:0;font-size:15pt">{name}</h4></div>'
                   f'<div style="display:grid;grid-template-columns:1fr 1fr;gap:3mm" class="xs"><b style="color:var(--blue);font-weight:700">CHANGE</b><b style="color:var(--brown);font-weight:700">PROOF SIGNAL</b></div>{rows}</div>')
    statement = f'''<div class="card blue" style="padding:3.4mm 4mm">
      <h3>Positioning statement {e("s")}</h3>
      <div style="font-family:Glyphs,EB Garamond,serif;font-size:12.5pt;line-height:1.24;margin-bottom:2mm">For friends and couples around Anna Nagar who want an evening that feels special without a restobar’s noise or bill, Café La Mirajh is the rooftop café made for conversation: good coffee, shareable comfort food and an easy game keep the table together, with hosts who let you stay.</div>
      <h3>Brand promise</h3><div style="font-family:Glyphs,EB Garamond,serif;font-weight:700;font-size:14pt;line-height:1.15">“Your table on the rooftop, for as long as the conversation lasts.”</div></div>'''
    concl = '''<div class="card" style="padding:2.8mm 3.4mm"><h3>Conclusion</h3><div class="small">The target sits in a contested, not empty, part of the map. La Mirajh earns it only when guests can see the product, trust the setting in any weather and describe the hosting in their own reviews. Re-plot the map after 90 days of trading data and reviews.</div></div>'''
    inner = (bar(N, NAME, 4, TOTAL)
             + qhead("What must La Mirajh prove to earn the target position?",
                     "The target is earned through product, setting and service, each with a signal that shows it is working.")
             + f'<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:4mm">{blocks}</div>'
             + f'<div style="display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:5mm;margin-top:3.4mm;align-items:start">{statement}{concl}</div>'
             + '<div class="srcblock" style="position:absolute;left:15mm;right:15mm;bottom:11mm"><div class="rule" style="margin:0 0 1.4mm"></div><h3 style="margin-bottom:1mm">Sources · observed ' + OBS + '</h3>{{SOURCES}}</div>'
             + foot("Proof signals are proposed measures; no data has been collected yet"))
    return page(inner)


def build():
    html = "".join([p1(), p2(), p3(), p4()])
    html, order = resolve_refs(html)
    html = html.replace("{{SOURCES}}", sources_list(order, extra=("report",), cls="c3"))
    return document("Café La Mirajh · Positioning Graph", [html])
