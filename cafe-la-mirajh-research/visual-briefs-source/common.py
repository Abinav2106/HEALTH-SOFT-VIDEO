"""Shared building blocks for the five Café La Mirajh visual research briefs."""
import re

OBS = "21 Oct 2026"

SOURCES = {
    "manual": ("Café La Mirajh Brand Guidelines (client brand manual, 36 pp.)", "https://drive.google.com/file/d/1vDv6sP4myUIB99LaGe39bNbXJYZTIJqR/view", "client document"),
    "logo": ("Café La Mirajh logo pack (Google Drive)", "https://drive.google.com/drive/folders/1PzuZ5YMsOgiGwDWjxW0ukcz2CA0lNeWz", "client asset"),
    "report": ("W&W · Café La Mirajh Brand Research & Positioning (parent report, Oct 2026)", None, "source of the synthesised findings"),
    "brief": ("Client brief to W&W: revenue context and objectives", None, "client-reported"),
    "zom": ("Zomato · Cafe la Mirajh, Anna Nagar East", "https://www.zomato.com/chennai/cafe-la-mirajh-anna-nagar-east", None),
    "zommenu": ("Zomato · Cafe la Mirajh menu (section names only)", "https://www.zomato.com/chennai/cafe-la-mirajh-anna-nagar-east/menu", "item prices not retrievable"),
    "district": ("District · Cafe la Mirajh", "https://www.district.in/dining/chennai/cafe-la-mirajh-anna-nagar-east", None),
    "superch": ("Superchennai · Restaurants in Chennai (mentions gaming zones)", "https://www.superchennai.com/visit/restaurants-in-chennai", "low confidence"),
    "web": ("lamirajh.in · website and menu", "https://www.lamirajh.in/", "NOT ACCESSIBLE"),
    "insta": ("Instagram · @cafe_la_mirajh_", "https://www.instagram.com/cafe_la_mirajh_/", "NOT ACCESSIBLE"),
    "gbp": ("Google Business Profile (share link)", "https://share.google/JqZsHD68KvKeSnacR", "NOT ACCESSIBLE"),
    "odr_z": ("Zomato · On De Roof, Anna Nagar East", "https://www.zomato.com/chennai/on-de-roof-anna-nagar-east", None),
    "odr_jd": ("Justdial · On D Roof, Shanthi Colony", "https://www.justdial.com/Chennai/On-D-Roof-Restaurant-Shanthi-Colony-Anna-Nagar/044PXX44-XX44-211214165940-Q8N2_BZDET", None),
    "odr_ez": ("EazyDiner · On D Roof", "https://www.eazydiner.com/chennai/on-d-roof-anna-nagar-east-chennai-686312", None),
    "ibz_z": ("Zomato · Ibiza Rooftop Lounge & Bistro Cafe", "https://www.zomato.com/chennai/ibiza-rooftop-lounge-bistro-cafe-anna-nagar-east", None),
    "ibz_d": ("District · Ibiza Rooftop Lounge & Bistro Cafe", "https://www.district.in/dining/chennai/ibiza-rooftop-lounge-bistro-cafe-anna-nagar-east", None),
    "br_z": ("Zomato · The Board Room, Anna Nagar East", "https://www.zomato.com/chennai/the-board-room-anna-nagar-east", None),
    "br_jd": ("Justdial · The Board Room, Anna Nagar", "https://www.justdial.com/Chennai/The-Board-Room-Anna-Nagar/044PXX44-XX44-230803181114-G4I3_BZDET", None),
    "br_d": ("District · The Board Room, Anna Nagar East", "https://www.district.in/dining/chennai/the-board-room-anna-nagar-east", None),
    "br_lfc": ("Laptop Friendly Cafe · The Board Room", "https://laptopfriendlycafe.com/cafes/chennai/the-board-room", "may be dated"),
    "br_sf": ("South First · Chennai board-game cafés", "https://thesouthfirst.com/featured/board-games-are-back-these-cosy-cafes-in-chennai-are-reviving-the-offline-play/", None),
    "dr_z": ("Zomato · Double Roti, Anna Nagar East", "https://www.zomato.com/chennai/double-roti-anna-nagar-east", None),
    "dr_mp": ("magicpin · Double Roti, Anna Nagar East", "https://magicpin.in/Chennai/Anna-Nagar-East/Restaurant/Double-Roti/store/89170/", None),
    "dr_ez": ("EazyDiner · Double Roti, Anna Nagar East", "https://www.eazydiner.com/chennai/double-roti-anna-nagar-east-chennai-658779", None),
    "dr_jd": ("Justdial · Double Roti, Anna Nagar East", "https://www.justdial.com/Chennai/Double-Roti-Near-Shree-Mittai-Marry-Brown-Family-Restaurant-Anna-Nagar-East/044PXX44-XX44-160128175711-D5H3_BZDET", None),
    "dr_d": ("District · Double Roti, Anna Nagar East", "https://www.district.in/dining/chennai/double-roti-anna-nagar-east", None),
    "lbb": ("LBB · Best burgers in Chennai", "https://lbb.in/chennai/best-burgers-chennai", None),
    "vr": ("VR Game Cafe · official site", "https://vrgamecafe.in/", None),
    "vr_ez": ("EazyDiner · VR Game Cafe, Anna Nagar East", "https://www.eazydiner.com/chennai/vr-game-cafe-anna-nagar-east-chennai-700710", None),
    "ibh_z": ("Zomato · India Brew House, Anna Nagar East", "https://www.zomato.com/chennai/india-brew-house-anna-nagar-east", None),
    "ibh_sw": ("Swiggy Dineout · India Brew House, Anna Nagar", "https://www.swiggy.com/restaurants/chennai/anna-nagar/india-brew-house-837695/dineout", None),
    "lr_ez": ("EazyDiner · The Living Room, Anna Nagar East", "https://www.eazydiner.com/chennai/the-living-room-anna-nagar-east-chennai-673240", None),
    "lr_site": ("The Living Room · terrace page", "https://www.thelivingroomchennai.com/terrace/", None),
    "gg": ("Gaming Garage, Anna Nagar · official site", "https://gaminggaragechennai.com/", "considered, not selected"),
    "midgard": ("Midgard E-sports Gaming Cafe · official site", "https://midgardesportss.com/", "considered, not selected"),
}


def e(kind):
    """Evidence chip: v observed, c client-stated, s interpretation, h hypothesis."""
    label = {"v": "V", "c": "C", "s": "S", "h": "H"}[kind]
    return f'<span class="e {kind}">{label}</span>'


def r(*keys):
    return "[[" + ",".join(keys) + "]]"


def resolve_refs(html):
    """Number sources in order of first use; return html and ordered keys."""
    order = []

    def sub(m):
        nums = []
        for k in m.group(1).split(","):
            k = k.strip()
            if k not in order:
                order.append(k)
            n = order.index(k) + 1
            url = SOURCES[k][1]
            nums.append(f'<a href="{url}">{n}</a>' if url else str(n))
        return '<sup class="ref">' + ",".join(nums) + "</sup>"

    html = re.sub(r"\[\[([a-z_,\s]+)\]\]", sub, html)
    return html, order


def sources_list(order, extra=(), cls=""):
    keys = list(order) + [k for k in extra if k not in order]
    items = []
    for i, k in enumerate(keys, 1):
        title, url, note = SOURCES[k]
        t = f'<a href="{url}">{title}</a>' if url else title
        if note == "NOT ACCESSIBLE":
            n = ' <span class="na">· could not be accessed; not reviewed</span>'
        elif note:
            n = f" · {note}"
        else:
            n = ""
        items.append(f'<li><span class="n">{i}</span>{t}{n}</li>')
    return f'<ol class="sources {cls}">' + "".join(items) + "</ol>"


def bar(doc_no, doc_name, page, total):
    return (f'<div class="bar"><img src="assets/logo-mark.png" alt="">'
            f'<span class="coll">Café La Mirajh · Visual research briefs</span>'
            f'<span class="doc"><span><b>{doc_no}</b> · {doc_name}</span><span class="pg">{page} / {total}</span></span></div>')


KEY = (f'<span class="key">{e("v")}Observed in public listings ({OBS}) {e("c")}Client-stated '
       f'{e("s")}Strategist interpretation {e("h")}Hypothesis to validate</span>')


def foot(note=""):
    return f'<div class="foot">{KEY}<span>{note}</span></div>'


def impl(text, label="Implication"):
    return f'<div class="impl"><span class="lab">{label} →</span><span>{text}</span></div>'


def title_block(num, name, sub, toc):
    t = "".join(f"<span><i>{i+1}</i>{x}</span>" for i, x in enumerate(toc))
    return (f'<div class="title"><img src="assets/logo-primary.png" alt="Café La Mirajh primary logo">'
            f'<div><div class="num">Brief {num} of 05</div><h1>{name}</h1><div class="sub">{sub}</div>'
            f'<div class="toc">{t}</div>'
            f'<div class="meta">Café La Mirajh, Anna Nagar East · W&amp;W brand development programme from 1 Nov 2026 · Evidence observed {OBS}</div></div></div>')


def page(inner, pattern=False):
    cls = "page withpattern" if pattern else "page"
    pat = '<div class="pattern"></div>' if pattern else ""
    return f'<section class="{cls}">{pat}{inner}</section>'


def qhead(q, head, n=None):
    return f'<div class="q"><b>Q</b>{q}</div><h2 class="head">{head}</h2>'


def document(title, pages_html):
    return ('<!doctype html><html lang="en"><head><meta charset="utf-8">'
            f'<title>{title}</title><link rel="stylesheet" href="brief.css"></head><body>'
            + "".join(pages_html) + "</body></html>")


# ---------- small line icons (SVG fragments drawn in a 24x24 box) ----------
ICONS = {
    "cup": '<path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16"/><path d="M8 3c-1 1.5 1 2.5 0 4M12 3c-1 1.5 1 2.5 0 4"/>',
    "burger": '<path d="M4 10a8 5 0 0 1 16 0z"/><path d="M3.5 13h17"/><path d="M4 16h16a0 0 0 0 1 0 0 3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z"/>',
    "pizza": '<path d="M12 21 3.5 6a14 9 0 0 1 17 0z"/><circle cx="10" cy="10" r="1.2"/><circle cx="14" cy="13" r="1.2"/>',
    "share": '<ellipse cx="12" cy="15" rx="9" ry="3.5"/><path d="M7 14c1-3 3-5 5-5s4 2 5 5"/>',
    "dessert": '<path d="M5 13h14l-2 7H7z"/><path d="M6 13a6 6 0 0 1 12 0"/><circle cx="12" cy="5.5" r="1.5"/>',
    "game": '<rect x="2.5" y="8" width="19" height="9" rx="4.5"/><path d="M7 11v3M5.5 12.5h3"/><circle cx="16" cy="11.5" r=".9"/><circle cx="18" cy="13.5" r=".9"/>',
    "dice": '<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1.1"/><circle cx="15" cy="15" r="1.1"/><circle cx="15" cy="9" r="1.1"/><circle cx="9" cy="15" r="1.1"/>',
    "moon": '<path d="M15 3a8 8 0 1 0 6 12A7 7 0 0 1 15 3z"/>',
    "clock": '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.5 2"/>',
    "pin": '<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0C18.5 15 12 21 12 21z"/><circle cx="12" cy="10" r="2.3"/>',
    "tag": '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8" r="1.4"/>',
    "star": '<path d="M12 3.5l2.4 5.2 5.6.6-4.2 3.8 1.2 5.6L12 15.9 7 18.7l1.2-5.6L4 9.3l5.6-.6z"/>',
    "rain": '<path d="M7 15a4 4 0 0 1 0-8 5 5 0 0 1 9.6-1A3.5 3.5 0 0 1 17 15z"/><path d="M8 18l-1 2.5M12 18l-1 2.5M16 18l-1 2.5"/>',
    "search": '<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5.5 5.5"/>',
    "compare": '<path d="M5 20V9M12 20V4M19 20v-7"/>',
    "calendar": '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    "chat": '<path d="M4 5h16v10H9l-5 4z"/>',
    "repeat": '<path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3"/><path d="M18 3v4h-4M6 21v-4h4"/>',
    "camera": '<rect x="3" y="7" width="18" height="13" rx="2"/><circle cx="12" cy="13.5" r="3.6"/><path d="M8.5 7l1.5-2.5h4L15.5 7"/>',
    "host": '<circle cx="12" cy="7" r="3.2"/><path d="M5.5 20a6.5 6.5 0 0 1 13 0"/><path d="M9.5 13.5 12 16l2.5-2.5"/>',
    "check": '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    "lamp": '<path d="M12 3v4"/><path d="M7 12a5 5 0 0 1 10 0z"/><path d="M10.5 15.5h3"/>',
}


def icon(name, size="6mm", color="#004C6A", sw=1.6):
    return (f'<svg viewBox="0 0 24 24" width="{size}" height="{size}" fill="none" stroke="{color}" '
            f'stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;flex:none">{ICONS[name]}</svg>')


def person_svg(x, y, s=1.0, fill="#004C6A"):
    """Simple abstract person figure (head + shoulders) for SVG canvases; origin at feet centre."""
    return (f'<g transform="translate({x} {y}) scale({s})" fill="{fill}">'
            f'<circle cx="0" cy="-30" r="7"/><path d="M-11 0 v-10 a11 11 0 0 1 22 0 v10 z"/></g>')
