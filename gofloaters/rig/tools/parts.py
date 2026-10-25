"""Cut the supplied GoFloaters mascot into rig parts and rebuild the artwork hidden behind joints.

Source construction (traced): one solid ink silhouette (mascot-airplane-path-1) with colour fills
laid over it; outlines are the gaps between fills. We first flatten the stack into *visible*
pieces (each path minus everything drawn after it), then hand each piece to a part by region and
priority, then add reconstruction geometry (hidden fills and ink) where joints will open.

All coordinates are mascot units (the SVG's mascot-airplane group space).
Run: python3 -I gofloaters/rig/tools/parts.py  ->  gofloaters/rig/build/parts.json
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from geom import *  # noqa: E402,F401
from shapely.geometry import LineString, Point, Polygon  # noqa: E402
import numpy as np  # noqa: E402
from shapely.ops import unary_union  # noqa: E402

OUT = Path(__file__).resolve().parents[1] / "build"

INK = {"#111110", "#121210"}
WHITE = {"#FFFFFF"}
CYAN = {"#6EC6D7", "#6FC7D8"}
CYAN_HI = {"#E9F6F9"}
YELLOW = {"#FAD669", "#F9D76D", "#FAD66B", "#FBDB78"}
ORANGE = {"#DA8F62", "#DC966C", "#DB9469", "#DD9662"}

C_INK, C_WHITE, C_CYAN, C_YELLOW, C_ORANGE = "#111110", "#FFFFFF", "#6FC7D8", "#FAD669", "#DA8F62"


def P(*pts):
    return Polygon(pts).buffer(0)


# ---------------------------------------------------------------------------------------------
# Regions (priority order: earlier wins). Each part: region, the source colours it may take, the
# colour of its base silhouette fill (closes the trace's pin-holes), optional explicit source ids.
# ---------------------------------------------------------------------------------------------

PARTS: list[dict] = [
    # ---- airflow: each stroke is its own part, taken by source id ----
    {"name": "Airflow_01", "ids": ["speed-lines-path-4"]},
    {"name": "Airflow_02", "ids": ["speed-lines-path-2"]},
    {"name": "Airflow_03", "ids": ["mascot-airplane-path-21"]},
    {"name": "Airflow_04", "ids": ["speed-lines-path-1"]},
    {"name": "Airflow_05", "ids": ["speed-lines-path-3"]},
    {"name": "Airflow_06", "ids": ["speed-lines-path-5"]},
    {"name": "Airflow_07", "ids": ["mascot-airplane-path-12"]},
    # ---- face details ----
    {"name": "Pupil", "ids": ["mascot-airplane-path-31"]},
    {"name": "Eye_White", "ids": ["mascot-airplane-path-9"], "fill_holes": True},
    {
        "name": "Face",  # nose + smile line
        "region": unary_union([
            P((530, 108), (560, 108), (562, 152), (531, 150)),
            P((501, 150), (511, 150), (519, 156), (535, 157.5), (547, 153), (548, 161), (539, 165), (537, 174), (529, 174), (530, 166), (515, 164), (502, 158)),
        ]),
        "colors": INK,
    },
    {
        "name": "Goggles",
        "region": P((442, 90), (470, 84), (502, 82), (522, 85), (533, 99), (533, 124), (517, 150), (497, 160), (470, 162),
                    (454, 160), (444, 176), (424, 190), (404, 187), (414, 168), (430, 150), (438, 132), (442, 110)),
        "colors": INK | ORANGE,
        "extra_ids": ["mascot-airplane-path-20"],  # white glint on the far lens rim
        "base": None,
    },
    # ---- ears (bend-deformed, roots stay put) ----
    {"name": "Ear_Far", "region": P((318, 64), (414, 78), (419, 97), (407, 133.5), (360, 133.5), (318, 133.5)), "colors": INK | WHITE, "base": C_WHITE},
    {"name": "Ear_Near", "region": P((314, 131), (402, 134), (424, 139), (431, 160), (423, 186), (398, 194), (314, 194)), "colors": INK | WHITE, "base": C_WHITE},
    # ---- head (skull, muzzle); bottom edge is the neck cut at y=198 ----
    {"name": "Head", "region": P((396, 78), (470, 76), (540, 92), (568, 108), (568, 182), (520, 184), (490, 192), (486, 198), (356, 198), (372, 186), (398, 170), (404, 140), (401, 100)),
     "colors": INK | WHITE | ORANGE, "base": C_WHITE},
    # ---- near foreleg: upper arm, forearm, paw (cutout joints) ----
    {"name": "Paw_Near", "region": P((469, 393), (504, 370), (545, 380), (545, 412), (500, 414), (470, 413), (462, 399)), "colors": INK | WHITE, "base": C_WHITE},
    {"name": "Arm_Near_Fore", "region": P((424, 347), (470, 324), (486, 334), (504, 370), (469, 393), (462, 399), (448, 388), (440, 372), (432, 360)), "colors": INK | WHITE, "base": C_WHITE},
    {"name": "Arm_Near_Upper", "region": P((416, 292), (440, 266), (478.6, 262), (478.2, 276), (477, 288), (474.5, 296), (468.5, 306), (465, 316), (470, 324), (424, 347), (414, 322)), "colors": INK | WHITE, "base": C_WHITE,
     "exclude_white": P((475.6, 258), (492, 258), (492, 306), (469, 309), (472.6, 296.5), (474.6, 288.5), (475.5, 276))},
    # ---- far foreleg ----
    {"name": "Paw_Far", "region": P((524.1, 348.3), (541, 318), (585, 318), (575, 341), (571.5, 349.8)), "colors": INK | WHITE, "base": C_WHITE},
    {"name": "Arm_Far_Fore", "region": P((480, 316), (512, 283.1), (541, 318), (524.1, 348.3), (512, 348.3)), "colors": INK | WHITE, "base": C_WHITE},
    {"name": "Arm_Far_Upper", "region": P((476, 262), (496, 262), (512, 283.1), (484, 311.9), (476, 313), (474, 300)), "colors": INK | WHITE, "base": C_WHITE},
    # ---- tail (bend-deformed from the rump) ----
    {"name": "Tail", "region": P((190, 238), (270, 238), (268, 262), (246, 290), (236, 330), (238, 362), (247, 371), (268, 371), (272, 380),
                                 (273, 396), (282, 404), (284, 412), (282, 423), (262, 423), (238, 405), (205, 378), (190, 330)),
     "colors": INK | WHITE, "base": C_WHITE},
    # ---- propeller ----
    {"name": "Propeller", "region": P((714, 300), (800, 300), (800, 535), (716.5, 535), (716.5, 460), (714, 400)), "colors": INK | YELLOW | ORANGE, "base": C_YELLOW},
    # ---- wing, stabiliser (banking foreshortens them about their roots) ----
    {"name": "Wing", "region": P((371, 482.5), (300, 521), (229, 577), (224, 615), (285, 615), (348, 597), (447, 563), (476, 543), (479, 533),
                                 (499, 516), (540, 487.5), (470, 482.5)), "colors": INK | CYAN, "base": C_CYAN},
    {"name": "Stabilizer", "region": P((12, 500), (28, 514), (82, 502), (121, 489), (141, 484), (176, 464), (173, 455.5), (121, 461), (86, 449),
                                       (61, 459), (34, 479)), "colors": INK | CYAN, "base": C_CYAN},
    # ---- cockpit cushions (inside the opening, behind the dog) ----
    {"name": "Cockpit", "region": unary_union([
        P((186, 380), (212, 382), (222, 388), (238, 402), (262, 418), (272, 434), (186, 434)),  # left cushion
        P((242, 372), (270, 373), (282, 375), (284, 396), (262, 400), (244, 392)),  # small cushion between tail and rump
        P((380, 356), (440, 352), (470, 356), (478, 404), (474, 419), (452, 424), (396, 420), (378, 398)),  # right cushion
    ]), "colors": YELLOW | ORANGE | INK, "base": None},
    # ---- dog body: torso, neck (deformed to follow the head), haunch, fur marks ----
    {"name": "Dog_Body", "region": P((356, 198), (486, 198), (481, 262), (479, 262), (440, 266), (416, 292), (414, 322), (424, 347), (436, 359),
                                     (448, 371), (460, 395), (466, 420), (440, 431), (300, 438), (276, 437), (273, 404), (270, 379), (265, 372),
                                     (272, 330), (300, 262), (340, 214)),
     "colors": INK | WHITE, "base": C_WHITE},
    # ---- plane body: fuselage + fin + cockpit rim; everything plane that is left ----
    {"name": "Plane_Body", "region": P((-30, 280), (180, 280), (192, 368), (215, 375), (240, 404), (262, 418), (290, 424.5), (380, 421), (440, 418),
                                       (452, 404), (470, 400), (480, 349), (600, 349), (714, 370), (714, 400), (719, 410), (719, 440), (716.5, 460), (716.5, 640), (-30, 640)),
     "colors": INK | CYAN | CYAN_HI, "base": C_CYAN},
]


def visible_pieces(src):
    """Each source path minus everything drawn after it (flattens the trace's paint order)."""
    rows = src["speed-lines"] + src["mascot-airplane"]  # speed lines never overlap the mascot
    order = src["mascot-airplane"]
    geos = {r["id"]: path_to_geom(r["d"], r["tx"], r["ty"]) for r in rows}
    pieces = []
    for i, r in enumerate(order):
        later = unary_union([geos[o["id"]] for o in order[i + 1:]]) if i + 1 < len(order) else Polygon()
        vis = clean(geos[r["id"]].difference(later))
        if not vis.is_empty:
            pieces.append({"id": r["id"], "fill": r["fill"], "geo": vis, "full": geos[r["id"]]})
    for r in src["speed-lines"]:
        pieces.append({"id": r["id"], "fill": r["fill"], "geo": geos[r["id"]], "full": geos[r["id"]]})
    return pieces


def assign(pieces):
    taken_ids = {i for p in PARTS for i in p.get("ids", []) + p.get("extra_ids", [])}
    claimed: dict[str, Polygon] = {}  # per source colour: union of higher-priority regions that take it
    parts = {}
    for spec in PARTS:
        groups: dict[str, list] = {}
        if "ids" in spec:
            for pc in pieces:
                if pc["id"] in spec["ids"]:
                    g = pc["full"] if spec.get("fill_holes") else pc["geo"]
                    if spec.get("fill_holes"):
                        g = unary_union([Polygon(p.exterior) for p in polys_of(g)])
                    groups.setdefault(pc["fill"] if pc["fill"] not in INK else C_INK, []).append(g)
        else:
            for pc in pieces:
                if pc["id"] in spec.get("extra_ids", []):
                    groups.setdefault(pc["fill"], []).append(pc["geo"])
                    continue
                if pc["id"] in taken_ids or pc["fill"] not in spec["colors"]:
                    continue
                # Lower-priority parts reach 0.6 units under their neighbours: the shared source
                # artwork overlaps across every cut, so abutting layers never show a hairline seam.
                region = spec["region"].buffer(0.6, join_style=2).difference(claimed.get(pc["fill"], Polygon()).buffer(-0.6, join_style=2))
                if pc["fill"] in WHITE and "exclude_white" in spec:
                    region = region.difference(spec["exclude_white"])
                g = clean(pc["geo"].intersection(region))
                nominal = spec["region"].difference(claimed.get(pc["fill"], Polygon()))
                # keep overlap-band pieces only when they continue artwork inside the nominal region
                g = unary_union([q for q in polys_of(g) if q.intersection(nominal).area > 0.25 * q.area or q.intersection(nominal).area > 4])
                if not g.is_empty:
                    key = C_INK if pc["fill"] in INK else pc["fill"]
                    groups.setdefault(key, []).append(g)
            for c in spec["colors"]:
                reg = spec["region"].difference(spec["exclude_white"]) if (c in WHITE and "exclude_white" in spec) else spec["region"]
                claimed[c] = unary_union([claimed.get(c, Polygon()), reg])
        parts[spec["name"]] = {"groups": {k: clean(unary_union(v)) for k, v in groups.items()}, "spec": spec}
    return parts


if __name__ == "__main__" and "--rig" not in sys.argv:
    src = load_source()
    pieces = visible_pieces(src)
    parts = assign(pieces)
    OUT.mkdir(parents=True, exist_ok=True)
    dump = {n: {k: geom_d(g) for k, g in p["groups"].items()} for n, p in parts.items()}
    (OUT / "parts_raw.json").write_text(json.dumps(dump))
    for n, p in parts.items():
        print(f"{n:16s}", {k: round(g.area, 1) for k, g in p["groups"].items()})


# ---------------------------------------------------------------------------------------------
# Reconstruction: hidden artwork, joint caps, pivots
# ---------------------------------------------------------------------------------------------

INK_W = 4.4  # typical outline weight of the trace, mascot units


def disc(c, r):
    return Point(c).buffer(r, resolution=48)


def half_plane(p, q, toward, size=400):
    """Half-plane bounded by line pq containing point `toward`."""
    p, q, t = np.array(p, float), np.array(q, float), np.array(toward, float)
    d = (q - p) / np.linalg.norm(q - p)
    n = np.array([-d[1], d[0]])
    if np.dot(t - p, n) < 0:
        n = -n
    a, b = p - d * size, q + d * size
    return Polygon([tuple(a), tuple(b), tuple(b + n * size), tuple(a + n * size)])


def ink_intervals(ink, p, q):
    inter = ink.intersection(LineString([p, q]))
    segs = []
    for g in getattr(inter, "geoms", [inter]):
        if not g.is_empty and g.length > 0.5:
            cs = list(g.coords)
            segs.append((np.array(cs[0]), np.array(cs[-1])))
    segs.sort(key=lambda s: np.linalg.norm(s[0] - np.array(p)))
    return segs


def fill_small_holes(g, max_area=60.0):
    """Close the trace's pin-holes (background showing between fill and ink) but keep real gaps."""
    out = []
    for p in polys_of(g):
        keep = [h for h in p.interiors if Polygon(h).area > max_area]
        out.append(Polygon(p.exterior, keep))
    return unary_union(out)


def orphans(pieces, parts):
    allv = unary_union([pc["geo"] for pc in pieces])
    got = unary_union([g for p in parts.values() for g in p["groups"].values()])
    return clean(allv.difference(got), 0.8)


class Rig:
    def __init__(self, parts):
        self.layers = {}
        for n, p in parts.items():
            spec = p["spec"]
            self.layers[n] = {
                "base": spec.get("base", None),
                "fills": {k: g for k, g in p["groups"].items() if k != C_INK},
                "ink": p["groups"].get(C_INK, Polygon()),
                "add_fill": [],  # (color, geom) drawn over colour fills, under ink
                "add_ink": [],
                "erase": [],
                "pivot": None,
            }

    def silhouette(self, name, interior=False):
        """Rest silhouette from the assigned source artwork only (no reconstruction)."""
        L = self.layers[name]
        sil = unary_union([L["ink"]] + list(L["fills"].values()))
        if L["base"]:
            sil = fill_small_holes(sil)
        return sil.difference(L["ink"]) if interior else sil

    def under(self, names, shrink=0.4):
        return unary_union([self.silhouette(n) for n in names]).buffer(-shrink)

    def fill(self, name, geom, color=C_WHITE):
        self.layers[name]["add_fill"].append((color, geom))

    def ink(self, name, geom):
        self.layers[name]["add_ink"].append(geom)

    def line(self, name, pts, w=INK_W, smooth=True):
        self.ink(name, stroke(smooth_line(pts) if smooth and len(pts) > 2 else pts, w))

    def joint_centre(self, parent, child, p, q):
        """Centre and radius of a limb joint: midpoint of the two outlines crossing the cut pq."""
        ink = unary_union([self.layers[parent]["ink"], self.layers[child]["ink"]])
        segs = ink_intervals(ink, p, q)
        assert len(segs) >= 2, (parent, child, len(segs))
        a = (segs[0][0] + segs[0][1]) / 2
        b = (segs[-1][0] + segs[-1][1]) / 2
        c = (a + b) / 2
        # normal of the cut, pointing into the child: both pieces blend against this same line
        d = np.array(q, float) - np.array(p, float)
        n = np.array([-d[1], d[0]]) / np.linalg.norm(d)
        if np.dot(np.array(self._centroid(child)) - c, n) < 0:
            n = -n
        return {"center": [float(c[0]), float(c[1])], "radius": float(np.linalg.norm(b - a) / 2), "ink": INK_W,
                "cut": [list(map(float, p)), list(map(float, q))], "normal": [float(n[0]), float(n[1])]}

    def joint(self, parent, child, p, q):
        """Overlapping round joint. Child sits above parent; both share a joint circle at the
        centre of the two outlines crossing the cut pq. Parent gets a ringed half-disc on the
        child side; child gets a fill-only half-disc on the parent side."""
        ink = unary_union([self.layers[parent]["ink"], self.layers[child]["ink"]])
        segs = ink_intervals(ink, p, q)
        assert len(segs) >= 2, (parent, child, len(segs))
        a = (segs[0][0] + segs[0][1]) / 2
        b = (segs[-1][0] + segs[-1][1]) / 2
        w = INK_W  # crossings are slanted, so their length overstates the line weight
        c = (a + b) / 2
        r = float(np.linalg.norm(b - a) / 2)
        child_pt = self._centroid(child)
        parent_pt = self._centroid(parent)
        hp_child = half_plane(a, b, child_pt)
        hp_parent = half_plane(a, b, parent_pt)
        # At rest the parent's cap must sit entirely under the child, and the child's cap entirely
        # inside the parent's white: clip both so the rest pose is untouched.
        child_cover = self.silhouette(child).buffer(-0.3)
        parent_inside = self.silhouette(parent, interior=True).buffer(-0.2)
        self.fill(parent, disc(c, r).intersection(hp_child).intersection(child_cover))
        self.ink(parent, disc(c, r + w / 2).difference(disc(c, r - w / 2)).intersection(hp_child).intersection(child_cover))
        self.fill(child, disc(c, r - w / 2 - 0.25).intersection(hp_parent).intersection(parent_inside))
        return {"center": [float(c[0]), float(c[1])], "radius": r, "ink": w}

    def _centroid(self, name):
        L = self.layers[name]
        g = unary_union([L["ink"]] + list(L["fills"].values()))
        c = g.centroid
        return (c.x, c.y)

    def final_groups(self, name):
        """Draw order inside the layer (bottom -> top): base silhouette, colour fills, added fills, ink."""
        L = self.layers[name]
        out = []
        fills = L["fills"]
        sil = unary_union([L["ink"]] + list(fills.values()) + [g for _, g in L["add_fill"]] + L["add_ink"])
        if L["base"]:
            out.append(("fill", L["base"], fill_small_holes(sil)))
        main = L["base"]
        if L.get("under"):
            for col, g in L["add_fill"]:
                out.append(("fill", col, g))
        for col, g in fills.items():
            if col == main:
                continue  # covered by the base silhouette
            out.append(("fill", col, g))
        if not L.get("under"):
            for col, g in L["add_fill"]:
                out.append(("fill", col, g))
        ink = unary_union([L["ink"]] + L["add_ink"])
        for e in L["erase"]:
            ink = ink.difference(e)
        if not ink.is_empty:
            out.append(("ink", C_INK, ink))
        # merge consecutive groups of the same colour/kind
        merged = []
        for kind, col, g in out:
            if merged and merged[-1][0] == kind and merged[-1][1] == col:
                merged[-1] = (kind, col, unary_union([merged[-1][2], g]))
            else:
                merged.append((kind, col, g))
        return merged


def reconstruct(rig: Rig) -> dict:
    piv = {}
    J = {}

    # --- limbs: round overlapping joints ---------------------------------------------------
    J["near_elbow"] = rig.joint_centre("Arm_Near_Upper", "Arm_Near_Fore", (420, 349), (474, 322))
    J["near_wrist"] = rig.joint_centre("Arm_Near_Fore", "Paw_Near", (466, 395), (507, 368))
    J["far_elbow"] = rig.joint_centre("Arm_Far_Upper", "Arm_Far_Fore", (480, 316), (516, 279))
    J["far_wrist"] = rig.joint_centre("Arm_Far_Fore", "Paw_Far", (522, 352), (540, 320))

    # Near shoulder: the upper arm's top blends into the chest. Behind it, rebuild the body's
    # chest/belly contour and fill so a swing never shows a hole.
    arm = rig.under(["Arm_Near_Upper", "Arm_Near_Fore"])
    rig.fill("Dog_Body", P((414, 290), (440, 262), (480, 258), (478, 290), (470, 318), (458, 338), (446, 354), (434, 362), (422, 348), (412, 322)).intersection(arm))
    rig.ink("Dog_Body", stroke(smooth_line([(476.5, 256), (475.5, 282), (470, 306), (459, 328), (446, 347), (436, 360)]), INK_W).intersection(arm))
    piv["Arm_Near_Upper"] = (466.0, 272.0)

    # Far shoulder: the far arm continues behind the near arm and the body. Rebuild its hidden
    # root as one closed, inked tube ending in a round shoulder, drawn to sit inside the near arm /
    # chest at rest (checked by the rest-pose diff), so a raised arm never shows fragments.
    sh = (463.0, 276.0)
    upper = [(476.6, 262.4), (470.5, 259.2), (463, 259.6)]
    lower = [(477.0, 295.4), (472.5, 291.6), (466.5, 289.6), (459, 287.5)]
    tube = Polygon(upper + [(450, 270), (452, 284)] + lower[::-1] + [(486, 300), (490, 280)]).buffer(0)
    rig.fill("Arm_Far_Upper", unary_union([tube, disc(sh, 13.0)]))
    rig.line("Arm_Far_Upper", upper, w=4.2)
    rig.line("Arm_Far_Upper", lower, w=4.2)
    piv["Arm_Far_Upper"] = sh

    # Far paw: its sole is fused with the fuselage edge in the trace. Give the paw its own sole and
    # the fuselage its own top edge back.
    rig.line("Paw_Far", [(525.5, 349.2), (538, 350.2), (552, 350.6), (563, 349.2), (569, 345)], w=4.0)
    rig.fill("Paw_Far", P((520, 343), (566, 336), (568, 348), (520, 349)))
    rig.line("Plane_Body", [(474, 355.5), (500, 354.4), (530, 354.0), (560, 355.2), (584, 357.4)], w=5.0)

    # Behind the near forearm and paw: the seat cushion continues right to a cockpit edge, and the
    # fuselage top (cyan, with that edge inked) runs under the paw. Behind the haunch and rump the
    # seat continues too, so body balance never reveals empty sky inside the cockpit.
    seat = P((276, 384), (330, 381), (400, 377), (440, 368), (456, 356), (470, 356), (474, 372), (482, 388), (486, 402), (476, 414), (452, 424), (300, 438), (276, 436))
    rig.layers["Cockpit"]["base"] = None
    rig.fill("Cockpit", seat, C_YELLOW)
    rig.layers["Cockpit"]["under"] = True  # seat goes under the original cushion pieces
    edge = [(470.5, 352.5), (475, 368), (481, 383), (487, 397), (490.5, 410)]
    rig.fill("Cockpit", stroke(smooth_line([(p[0] - 3.6, p[1]) for p in edge]), 3.2), C_ORANGE)
    deck = Polygon([(470.5, 352.5), (540, 351), (548, 420), (452, 424), (490.5, 410), (487, 397), (481, 383), (475, 368)]).buffer(0)
    rig.fill("Plane_Body", deck, C_CYAN)
    rig.line("Plane_Body", edge, w=4.4)

    # --- head --------------------------------------------------------------------------------
    # Back of the skull and top of the neck, hidden by the near ear: fill + contour so the ear can
    # swing without opening a hole.
    ear = rig.under(["Ear_Near", "Goggles"])
    rig.fill("Head", P((370, 198), (380, 181), (394, 163), (402, 141), (426, 138), (432, 160), (424, 187), (400, 198)).intersection(ear))
    rig.ink("Head", stroke(smooth_line([(366.5, 197.5), (377, 186), (389, 172), (398, 156), (403, 140)]), 4.6).intersection(ear))
    piv["Head"] = (430.0, 204.0)
    piv["Ear_Far"] = (411.0, 114.0)
    piv["Ear_Near"] = (420.0, 162.0)
    piv["Face"] = (530.0, 140.0)
    piv["Goggles"] = (470.0, 125.0)

    # --- body ----------------------------------------------------------------------------------
    # The body sinks below the cockpit rim; extend it so balance moves never lift its bottom edge.
    rig.fill("Dog_Body", P((286, 421), (330, 423), (398, 420), (404, 452), (286, 452)).intersection(rig.under(["Plane_Body"])))
    piv["Dog_Body"] = (380.0, 422.0)
    piv["Dog_Chest"] = (378.0, 392.0)  # waist: the upper body leans from here
    piv["Tail"] = (284.0, 412.0)

    # --- plane ---------------------------------------------------------------------------------
    # Fuselage behind the wing: cyan + the lower edge the wing hides.
    # Hidden cyan may fill anything inside the fuselage+wing silhouette (same colour, under the ink);
    # hidden ink is kept under the wing but allowed to overlap the visible fuselage edge it continues.
    wing = rig.under(["Wing"])
    hull = rig.under(["Wing", "Plane_Body"], shrink=0.0)
    edge_ink = rig.layers["Plane_Body"]["ink"].buffer(0.4)
    rig.fill("Plane_Body", P((300, 520), (371, 480), (540, 485), (499, 516), (478, 534), (420, 538), (360, 534), (300, 527)).intersection(hull), C_CYAN)
    rig.ink("Plane_Body", stroke(smooth_line([(296, 524.5), (340, 531), (390, 535.5), (440, 537.5), (478, 537)]), 4.8).intersection(wing.union(edge_ink)))
    # Fuselage behind the stabiliser.
    stab = rig.under(["Stabilizer"])
    hull_s = rig.under(["Stabilizer", "Plane_Body"], shrink=0.0)
    rig.fill("Plane_Body", P((70, 450), (120, 459), (174, 454), (178, 466), (150, 484), (110, 474), (78, 460)).intersection(hull_s), C_CYAN)
    rig.ink("Plane_Body", stroke(smooth_line([(68, 451), (92, 462), (118, 473), (148, 483), (160, 486)]), 4.6).intersection(stab.union(edge_ink)))
    # Nose cone behind the propeller blade.
    blade = rig.under(["Propeller"])
    nose = smooth_poly([(706, 410), (724, 414), (737, 424), (741, 438), (737, 452), (723, 462), (706, 466)])
    rig.fill("Plane_Body", nose.intersection(blade.union(rig.under(["Plane_Body"], shrink=0.0))), C_CYAN)
    rig.ink("Plane_Body", nose.buffer(2.3).difference(nose.buffer(-2.3)).intersection(half_plane((712, 380), (712, 500), (760, 440))).intersection(blade))
    piv["Propeller"] = (748.0, 436.0)
    piv["Propeller_Blur"] = piv["Propeller"]
    piv["Wing"] = (455.0, 498.0)
    piv["Stabilizer"] = (150.0, 468.0)
    piv["Plane_Body"] = (400.0, 470.0)
    piv["Cockpit"] = (400.0, 470.0)

    # Eyes: pupil / lids live in the eye white's space.
    e = rig.layers["Eye_White"]["fills"][C_WHITE]
    ec = e.centroid
    piv["Eye_White"] = (ec.x, ec.y)
    piv["Pupil"] = (ec.x, ec.y)

    for k, j in J.items():
        pass
    piv["Arm_Near_Fore"] = tuple(J["near_elbow"]["center"])
    piv["Paw_Near"] = tuple(J["near_wrist"]["center"])
    piv["Arm_Far_Fore"] = tuple(J["far_elbow"]["center"])
    piv["Paw_Far"] = tuple(J["far_wrist"]["center"])
    for n in rig.layers:
        if n.startswith("Airflow"):
            b = unary_union([rig.layers[n]["ink"]]).bounds
            piv[n] = (b[2], (b[1] + b[3]) / 2)  # stretch from the end nearest the plane
    return {"pivots": piv, "joints": J}


def export(rig: Rig, info: dict) -> dict:
    layers = {}
    for n in rig.layers:
        groups = []
        for kind, col, g in rig.final_groups(n):
            g = simplify(g, 0.1)
            rings = []
            for p in polys_of(g):
                rings.append([[round(x, 2), round(y, 2)] for x, y in list(p.exterior.coords)[:-1]])
                for h in p.interiors:
                    rings.append([[round(x, 2), round(y, 2)] for x, y in list(h.coords)[:-1]])
            groups.append({"kind": kind, "color": col, "rings": rings})
        layers[n] = {"groups": groups, "pivot": [round(v, 3) for v in info["pivots"].get(n, (0, 0))]}
    # Blur disc for the spinning blade: the blade's silhouette in yellow with a soft orange rim.
    blade = unary_union([rig.layers["Propeller"]["ink"]] + list(rig.layers["Propeller"]["fills"].values()))
    blade = simplify(fill_small_holes(blade).buffer(1.5).buffer(-1.5), 0.2)
    rim = blade.difference(blade.buffer(-3.0))
    groups = []
    for kind, col, g in (("fill", C_YELLOW, blade), ("fill", C_ORANGE, rim)):
        rings = []
        for pp in polys_of(g):
            rings.append([[round(x, 2), round(y, 2)] for x, y in list(pp.exterior.coords)[:-1]])
            for h in pp.interiors:
                rings.append([[round(x, 2), round(y, 2)] for x, y in list(h.coords)[:-1]])
        groups.append({"kind": kind, "color": col, "rings": rings})
    layers["Propeller_Blur"] = {"groups": groups, "pivot": [round(v, 3) for v in info["pivots"]["Propeller_Blur"]]}
    eye = rig.layers["Eye_White"]["fills"][C_WHITE]
    eye_ring = [[round(x, 2), round(y, 2)] for x, y in list(simplify(eye, 0.25).exterior.coords)[:-1]]
    return {"units": "mascot", "layers": layers, "joints": info["joints"], "eye_outline": eye_ring,
            "eye_bounds": [round(v, 2) for v in eye.bounds]}


if __name__ == "__main__" and "--rig" in sys.argv:
    src = load_source()
    pieces = visible_pieces(src)
    parts = assign(pieces)
    orph = orphans(pieces, parts)
    print("unassigned artwork:", round(orph.area, 2), [tuple(round(v) for v in p.centroid.coords[0]) for p in polys_of(orph)][:12])
    rig = Rig(parts)
    info = reconstruct(rig)
    data = export(rig, info)
    (OUT / "rig_parts.json").write_text(json.dumps(data))
    nv = sum(len(r) for L in data["layers"].values() for g in L["groups"] for r in g["rings"])
    print("layers", len(data["layers"]), "vertices", nv)
    for k, j in info["joints"].items():
        print(k, j)
