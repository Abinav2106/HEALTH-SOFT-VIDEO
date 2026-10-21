from common import *

N, NAME, TOTAL = "03", "Customer Analysis", 4


def people(n, cols=None, fill="#004C6A", w=None, extra=""):
    cols = cols or n
    rows = (n + cols - 1) // cols
    W, H = cols * 26 + 10, rows * 40 + 6
    g = ""
    for i in range(n):
        cx = 18 + (i % cols) * 26 + (10 if (i // cols) % 2 else 0)
        cy = 42 + (i // cols) * 40
        col = fill if i % 3 != 1 else ("#8A5D3B" if fill == "#004C6A" else fill)
        g += person_svg(cx, cy, 1.0, col)
    return f'<svg viewBox="0 0 {W + 10} {H}" height="{w or "16mm"}" style="display:block">{g}{extra}</svg>'


def scores(vals, faded=False):
    labels = ["Fit", "Reach", "Spend", "Repeat", "Ops"]
    tot = sum(vals)
    parts = " · ".join(f"{l} {v}" for l, v in zip(labels, vals))
    col = "#9fb3bc" if faded else "#004C6A"
    return (f'<div style="display:flex;justify-content:space-between;align-items:baseline" class="xs"><b style="color:{col}">Priority score</b><b style="color:{col}">{tot} / 25</b></div>'
            f'<div style="height:2.6mm;background:rgba(0,76,106,.1);border-radius:1mm;margin:.6mm 0"><div style="width:{tot/25*100:.0f}%;height:100%;background:{col};border-radius:1mm"></div></div>'
            f'<div class="xs soft">{parts}</div>')


def acard(rank, title, figure, color, facts, why, vals):
    rows = "".join(f'<div style="display:grid;grid-template-columns:17mm 1fr;gap:1.6mm;padding:.9mm 0;border-bottom:1px solid var(--line)" class="small"><span class="xs" style="font-weight:700;color:var(--brown);text-transform:uppercase;letter-spacing:.06em;padding-top:.3mm">{k}</span><span>{v}</span></div>' for k, v in facts)
    return f'''<div style="background:var(--tint);border-radius:2mm;border-top:5px solid {color};padding:3mm 3.4mm;display:flex;flex-direction:column;gap:1.6mm">
      <div style="display:flex;justify-content:space-between;align-items:flex-start"><div><div class="xs" style="font-weight:700;color:{color};letter-spacing:.1em;text-transform:uppercase">{rank}</div><h4 style="font-size:13.5pt;margin:.4mm 0 0">{title}</h4></div>{figure}</div>
      <div>{rows}</div>
      <div class="xs"><b>Why:</b> {why}</div>
      <div style="margin-top:auto;background:rgba(255,255,255,.4);border-radius:1.4mm;padding:1.6mm 2mm">{scores(vals)}</div>
    </div>'''


def p1():
    cards = [
        acard("Primary", "Local friend groups", people(4, 4, w="13mm"), "#004C6A",
              [("Who " + e("h"), "About 20–30: final-year students, early-career professionals"),
               ("Where " + e("h"), "Anna Nagar E/W, Shanthi Colony + a 15–20 min ring"),
               ("Group · when", "3–5 friends · 18:00–23:45, all week"),
               ("Spend " + e("h"), "≈ ₹350–600 per guest (estimate)")],
              "more seats per table, they use rooftop, PS5 and shared food together, and can return weekly.", [5, 5, 3, 5, 4]),
        acard("Secondary", "Couples", people(2, 2, w="13mm"), "#8A5D3B",
              [("Who " + e("h"), "About 22–35: dating, engaged or young married"),
               ("Where " + e("h"), "Same catchment; a little further for a known spot"),
               ("Group · when", "2 · 19:00–23:00, mostly Fri–Sun"),
               ("Spend " + e("h"), "≈ ₹1,000–1,500 per couple, i.e. ₹500–750 per guest")],
              "higher spend per guest and a strong cosy-rooftop fit, but fewer visits and a need for quiet corners.", [4, 4, 4, 3, 4]),
        acard("Selective opportunity", "Hosted small gatherings", people(8, 4, w="13mm"), "#D6A84A",
              [("Who " + e("h"), "An organiser, about 20–35, booking for a group"),
               ("Where " + e("h"), "Residents, offices and colleges within ≈ 20 minutes"),
               ("Group · when", "6–15, pre-booked · Mon–Thu evenings"),
               ("Spend " + e("h"), "≈ ₹600–900 per guest as a set package (to be costed)")],
              "highest spend per booking and fills quiet nights, but repeats less and can crowd out regulars.", [4, 3, 5, 2, 2]),
    ]
    low = f'''<div style="background:rgba(0,76,106,.05);border:1px dashed var(--line);border-radius:2mm;padding:3mm 3.2mm;display:flex;flex-direction:column;gap:1.6mm">
      <div class="xs" style="font-weight:700;color:var(--soft);letter-spacing:.1em;text-transform:uppercase">Deprioritised</div>
      <h4 style="color:var(--soft);margin:0">Daytime laptop workers</h4>
      {people(1, 1, fill="#9fb3bc", w="11mm")}
      <div class="small soft">India Brew House and The Board Room already serve daytime work{r("ibh_sw","br_lfc")}. A daytime rooftop in Chennai heat is a weak setting {e("h")}.</div>
      <div style="margin-top:auto">{scores([2, 4, 2, 4, 3], faded=True)}</div></div>'''
    inner = (bar(N, NAME, 1, TOTAL)
             + title_block(N, NAME, "Who to prioritise, when they visit, why they choose La Mirajh, and how to prove it.",
                           ["Audience priorities", "Occasion map", "Customer journey", "Validation panel"])
             + qhead("Who should La Mirajh prioritise?", "Friend groups first, couples second, hosted gatherings only selectively.")
             + '<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr)) 40mm;gap:3.6mm">' + "".join(cards) + low + "</div>"
             + impl(f"Design the evening around the <b>friend-group table</b>, protect couples’ corners, keep gatherings to quiet nights. The manual’s wider audience list becomes secondary{r('manual')}.")
             + foot("Scores and audience details are strategist hypotheses"))
    return page(inner, pattern=True)


def occasion_svg():
    x0, x1, t0, t1 = 150, 900, 10, 24
    X = lambda h: x0 + (h - t0) / (t1 - t0) * (x1 - x0)
    rows = [
        ("Local friend groups", "3–5 guests", [(18, 23.75, 1.0, "Shareable food · drinks rounds · PS5 at the table"), (15, 18, 0.35, "")], 4),
        ("Couples", "2 guests", [(19, 23, 0.9, "Quiet corner · evening coffee · dessert"), ], 2),
        ("Hosted gatherings", "6–15 guests", [(18, 21.5, 0.75, "Set package · Mon–Thu")], 8),
        ("Daytime workers", "1–2 guests", [(10, 17, 0.25, "Coffee · Wi-Fi (deprioritised)")], 1),
    ]
    out = ""
    for h in range(10, 25, 2):
        out += f'<line x1="{X(h):.1f}" y1="34" x2="{X(h):.1f}" y2="262" stroke="#004C6A" stroke-opacity=".12"/>'
        out += f'<text x="{X(h):.1f}" y="26" font-size="12" fill="#4e6b78" text-anchor="middle">{h:02d}:00</text>'
    bands = [(10, 12, "Morning"), (12, 17, "Afternoon"), (17, 20, "Early evening"), (20, 22, "Evening"), (22, 23.75, "Late")]
    for a, b, lab in bands:
        out += f'<text x="{(X(a)+X(b))/2:.1f}" y="10" font-size="11" fill="#8A5D3B" font-weight="700" text-anchor="middle" letter-spacing="1">{lab.upper()}</text>'
    y = 52
    for name, grp, segs, n in rows:
        faded = name.startswith("Daytime")
        col = "#9fb3bc" if faded else "#004C6A"
        out += f'<text x="0" y="{y+4}" font-size="14" font-weight="700" fill="{col}">{name}</text><text x="0" y="{y+20}" font-size="11.5" fill="#4e6b78">{grp}</text>'
        for a, b, op, lab in segs:
            out += f'<rect x="{X(a):.1f}" y="{y-12}" width="{X(b)-X(a):.1f}" height="34" rx="6" fill="{col}" fill-opacity="{op}"/>'
            if lab:
                tc = "#FFF2D4" if op >= 0.7 else "#0d3a4f"
                out += f'<text x="{X(a)+10:.1f}" y="{y+9}" font-size="12" fill="{tc}" font-weight="700">{lab}</text>'
        if name == "Local friend groups":
            out += f'<text x="{X(15)+6:.1f}" y="{y+9}" font-size="11" fill="#0d3a4f">weekends</text>'
        y += 56
    closes = [(21, "India Brew House 21:00"), (22, "Board Room 22:00"), (23, "Double Roti · Ibiza 23:00"), (23.75, "La Mirajh 23:45")]
    for i, (h, lab) in enumerate(closes):
        mir = "Mirajh" in lab
        col = "#BE1E2D" if mir else "#8A5D3B"
        ly = 276 + i * 15
        out += f'<line x1="{X(h):.1f}" y1="34" x2="{X(h):.1f}" y2="{ly-10}" stroke="{col}" stroke-width="{2.2 if mir else 1.2}" stroke-dasharray="{"" if mir else "4 3"}"/>'
        out += f'<text x="{X(h)-5:.1f}" y="{ly}" font-size="11.5" fill="{col}" font-weight="700" text-anchor="end">{lab}</text>'
    return f'<svg viewBox="0 0 935 336" style="display:block;height:80mm;width:auto;font-family:Glyphs,Lato,sans-serif">{out}<text x="0" y="300" font-size="11.5" font-weight="700" fill="#8A5D3B">LISTED CLOSING TIMES</text></svg>'


def p2():
    mot = [
        ("Local friend groups", "Space to sit for hours; enough seats together; a setting worth sharing; something to do when talk dips",
         "Few reviews; no visible prices; worry about rain or heat on a roof", "A standing weekly night and a host who remembers them"),
        ("Couples", "Privacy, soft light, a corner table, feeling looked after; “premium but not intimidating”",
         "Noise from groups or gaming; smoke near tables; no way to book", "Anniversaries and “our place”: a reserved corner and a small surprise"),
        ("Hosted gatherings", "A reserved area, a fixed price per head, decoration allowed, one person in charge",
         "Capacity doubts, weather risk, no package on offer", "Guests who later return on their own; each event is a sample"),
    ]
    trs = "".join(f'<tr><td class="nm" style="width:38mm">{a}</td><td class="small">{m}</td><td class="small">{o}</td><td class="small">{t}</td></tr>' for a, m, o, t in mot)
    inner = (bar(N, NAME, 2, TOTAL)
             + qhead("When, why and with whom do they visit?",
                     "Evenings carry the plan, and the 23:45 close makes late conversation a slot La Mirajh can own.")
             + f'<div style="display:grid;grid-template-columns:minmax(0,1fr);gap:2mm">{occasion_svg()}</div>'
             + '<div style="margin-top:1mm"><table><thead><tr><th>Audience</th><th>Motivations ' + e("h") + '</th><th>Objections ' + e("h") + '</th><th>Return trigger ' + e("s") + '</th></tr></thead><tbody>' + trs + '</tbody></table></div>'
             + impl("Plan staffing, menu and lighting around <b>18:00–23:45</b>. Treat mornings and afternoons as secondary until trading data says otherwise.")
             + foot(f"Visit windows are hypotheses. Closing times from listings{r('ibh_z','br_z','dr_ez','ibz_z','district')}; On De Roof and Living Room hours not found"))
    return page(inner)


def p3():
    stages = [
        ("search", "Discovery", "“Where can we go tonight?”", "Reels, friends’ stories, searches for “rooftop café Anna Nagar”",
         "Website and Instagram could not be verified from our research environment; few indexed results", "Consistent listings and real venue photography", "High"),
        ("compare", "Comparison", "“Is it better than On De Roof or Double Roti?”", "Ratings, photos, menu prices side by side",
         "0–16 ratings against rivals’ thousands; conflicting cuisine tags; no item prices visible", "A post-visit review routine and a published menu", "High"),
        ("calendar", "Booking", "“Can we get a table? Will it rain? Is the PS5 free?”", "Booking options, hours, weather",
         "Booking route and PS5 status unconfirmed; the Oct–Dec monsoon", "A visible booking route and a rain plan", "Medium"),
        ("host", "Experience", "“Are we looked after? Can we stay?”", "Seating, ordering, food, play, being able to linger",
         "Unknown: needs an on-site audit", "A hosting standard with a named host", "Unknown"),
        ("repeat", "Return", "“Why come back next week?”", "A reason, a ritual, a person",
         "No known loyalty mechanic or regular night", "A weekly group night; ask for a review", "High"),
    ]
    risk_col = {"High": "#BE1E2D", "Medium": "#D6A84A", "Unknown": "#4e6b78"}
    cols = ""
    for i, (ic, name, ask, check, barrier, fix, risk) in enumerate(stages):
        cols += f'''<div style="display:flex;flex-direction:column;gap:2.6mm">
          <div style="display:flex;align-items:center;gap:2mm"><div style="width:11mm;height:11mm;border-radius:50%;background:var(--blue);display:flex;align-items:center;justify-content:center">{icon(ic, "6mm", "#FFF2D4")}</div>
          <div><div class="xs" style="font-weight:700;color:var(--brown)">STAGE {i+1}</div><h4 style="margin:0">{name}</h4></div></div>
          <div style="font-family:Glyphs,EB Garamond,serif;font-size:14.5pt;color:var(--blue);line-height:1.18;min-height:17mm">{ask}</div>
          <div style="font-size:9.6pt;min-height:13mm"><b>Checks:</b> {check}</div>
          <div style="font-size:9.6pt;border-left:3px solid var(--red);padding-left:2mm;color:#6b1a22;min-height:22mm"><b style="color:var(--red)">Barrier today:</b> {barrier}</div>
          <div style="font-size:9.6pt;background:var(--tint2);border-radius:1.4mm;padding:2mm 2.4mm;min-height:13mm"><b>Fix:</b> {fix}</div>
          <div class="small" style="display:flex;align-items:center;gap:1.4mm"><span style="width:2.6mm;height:2.6mm;border-radius:50%;background:{risk_col[risk]}"></span><b style="color:{risk_col[risk]}">Drop-off risk: {risk}</b></div>
        </div>'''
    path = '''<svg viewBox="0 0 1000 40" width="100%" height="9mm" style="display:block"><path d="M10 20 C 120 0, 180 40, 300 20 S 480 0, 600 20 S 780 40, 900 20 L 985 20" fill="none" stroke="#D6A84A" stroke-width="3" stroke-dasharray="7 6"/><path d="M975 12 L992 20 L975 28 z" fill="#D6A84A"/></svg>'''
    inner = (bar(N, NAME, 3, TOTAL)
             + qhead("Where do potential guests drop out?",
                     "Most potential guests are lost before they arrive, at discovery and comparison.")
             + path
             + f'<div style="display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:5mm;margin-top:1mm">{cols}</div>'
             + impl("Fix proof before paying for reach: <b>reviews, real photos, a published menu and matching listings</b> convert the people already searching.")
             + foot(f"Drop-off risk is a strategist assessment. Listing evidence{r('zom','district')}; monsoon timing is general seasonal knowledge"))
    return page(inner)


def p4():
    hyps = [
        ("H1", "Groups of 3+ make up most evening tables", "Tally party size for every table", "Share of evening tables with 3+ guests", "If low, rebalance messaging toward couples"),
        ("H2", "Spend per guest is near the ≈ ₹500 listing assumption", "Average bill ÷ guests, by daypart", "₹ per guest, weekly", "If well below, push shareables and add-ons"),
        ("H3", "Most guests come from within 15–20 minutes", "Ask the area travelled from (area only)", "Share from the core catchment", "Sets the radius for local reach"),
        ("H4", "PS5 is an icebreaker, not the main reason to visit", "Note PS5 use per table; ask the main reason", "PS5 tables; stated reasons", "Decides how prominently to show PS5"),
        ("H5", "Guests prefer the rooftop unless it rains", "Record seating choice and weather", "Rooftop share, dry vs wet nights", "Sizes rain cover and indoor fallback"),
        ("H6", "Discovery happens mainly via Instagram and friends", "Ask “How did you hear about us?”", "Share by channel", "Where to put the first marketing effort"),
    ]
    td = 'style="font-size:9.3pt;padding:2.1mm 1.8mm"'
    trs = "".join(f'<tr><td class="nm" {td}>{a}</td><td {td}><b style="color:var(--ink);font-weight:700">{b}</b></td><td {td}>{c}</td><td {td}>{d}</td><td {td}>{f}</td></tr>' for a, b, c, d, f in hyps)
    table = '<table><thead><tr><th style="width:8mm"></th><th>Hypothesis ' + e("h") + '</th><th>Test</th><th>Measure</th><th>What it decides</th></tr></thead><tbody>' + trs + '</tbody></table>'
    guide = f'''<div class="card" style="padding:3mm 3.4mm">
      <h3>Short conversation guide · planned, not yet conducted</h3>
      <div class="xs soft" style="margin-bottom:1.4mm">30 conversations over two weeks · 2–3 minutes each · at the end of the visit · consent first · no names or contact details</div>
      <ol class="small" style="padding-left:4.4mm;margin:0">
        <li>What brought you here tonight?</li><li>How did you hear about us?</li><li>Which area did you travel from?</li>
        <li>Where else did you consider going?</li><li>What would bring you back next week?</li></ol>
    </div>'''
    sheet_cols = ["Date", "Time", "Party", "Area", "Heard via", "Seat", "PS5", "Bill ₹"]
    head = "".join(f'<th style="padding:1mm 1.2mm;font-size:6.6pt">{c}</th>' for c in sheet_cols)
    blank = "".join("<tr>" + "".join('<td style="height:4.4mm;padding:0;border-bottom:1px solid var(--line);border-right:1px dotted var(--line)"></td>' for _ in sheet_cols) + "</tr>" for _ in range(3))
    sheet = f'''<div class="card" style="padding:3mm 3.4mm;margin-top:3mm">
      <h3>Trading tally sheet · template</h3>
      <table>{"<thead><tr>" + head + "</tr></thead>"}<tbody>{blank}</tbody></table>
      <div class="xs soft" style="margin-top:1mm">One line per table. No data has been collected yet.</div></div>'''
    inner = (bar(N, NAME, 4, TOTAL)
             + qhead("How will we know whether these audiences are right?",
                     "Two weeks of simple table tallies and 30 short conversations will confirm or correct the audience hypotheses.")
             + f'<div style="display:grid;grid-template-columns:minmax(0,1fr) 86mm;gap:6mm;align-items:start"><div>{table}'
               '<div class="card blue" style="margin-top:3mm;padding:2.6mm 3.6mm"><h3 style="margin-bottom:.8mm">Conclusion</h3><div class="small">Lead with local friend groups and protect couples’ evenings, then let six simple measures decide what to keep, scale or drop. Nothing here is a finding about customers until the tallies come in.</div></div>'
               f'</div><div>{guide}{sheet}</div></div>'
             + '<div class="srcblock" style="position:absolute;left:15mm;right:15mm;bottom:11mm"><div class="rule" style="margin:0 0 1.4mm"></div><h3 style="margin-bottom:1mm">Sources · observed ' + OBS + '</h3>{{SOURCES}}</div>'
             + foot("No customer interviews, surveys or trading data were available to this research"))
    return page(inner)


def build():
    html = "".join([p1(), p2(), p3(), p4()])
    html, order = resolve_refs(html)
    html = html.replace("{{SOURCES}}", sources_list(order, extra=("report",), cls="c3"))
    return document("Café La Mirajh · Customer Analysis", [html])
