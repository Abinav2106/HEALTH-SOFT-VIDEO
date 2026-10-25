"""Shared geometry helpers for the Tilo rig: source parsing, polygon ops, SVG/AE output."""
from __future__ import annotations

import json
import re
from pathlib import Path

import numpy as np
from shapely import affinity
from shapely.geometry import GeometryCollection, LineString, MultiPolygon, Point, Polygon
from shapely.ops import unary_union
from svgelements import Path as SvgPath

ROOT = Path(__file__).resolve().parents[3]
SRC_SVG = ROOT / "remotion/public/brand/gofloaters_logo_original.svg"

# Everything in the rig is in "mascot units": the mascot-airplane group's own space
# (logo = translate(75 0) scale(0.25) * mascot). Speed-lines group: mascot = (x - 300, y + 280).
MASCOT_TO_LOGO = (75.0, 0.0, 0.25)


def load_source() -> dict[str, list[dict]]:
    s = SRC_SVG.read_text()
    out = {}
    for gid in ("mascot-airplane", "speed-lines"):
        body = re.search(r'<g id="%s"[^>]*>(.*?)</g>' % gid, s, re.S).group(1)
        rows = []
        for d, fill, tx, ty, pid in re.findall(
            r'<path d="([^"]+)" fill="([^"]+)" transform="translate\(([^,]+),([^)]+)\)" id="([^"]+)"', body
        ):
            tx, ty = float(tx), float(ty)
            if gid == "speed-lines":
                tx, ty = tx - 300, ty + 280
            rows.append({"id": pid, "d": d, "fill": fill.upper(), "tx": tx, "ty": ty})
        out[gid] = rows
    return out


def path_to_geom(d: str, tx: float, ty: float, step: float = 0.35) -> Polygon | MultiPolygon:
    """Flatten an SVG path (nonzero fill) into shapely geometry, in mascot units."""
    p = SvgPath(d)
    rings = []
    for sub in p.as_subpaths():
        sp = SvgPath(sub)
        L = sp.length(error=1e-3)
        if L < 0.5:
            continue
        n = max(8, int(L / step))
        pts = [sp.point(i / n) for i in range(n)]
        ring = [(pt.x + tx, pt.y + ty) for pt in pts]
        if len(ring) >= 3:
            rings.append(ring)
    # nonzero winding: sum of signed rings; approximate with orientation-aware union/difference
    polys = []
    for r in rings:
        poly = Polygon(r).buffer(0)
        a = 0.0
        for i in range(len(r)):
            x0, y0 = r[i]
            x1, y1 = r[(i + 1) % len(r)]
            a += x0 * y1 - x1 * y0
        polys.append((poly, np.sign(a)))
    if not polys:
        return Polygon()
    # Rings with the dominant orientation add, opposite ones subtract (traced compound paths).
    main = max(polys, key=lambda t: t[0].area)[1]
    geom = unary_union([g for g, s in polys if s == main])
    holes = [g for g, s in polys if s != main]
    if holes:
        geom = geom.difference(unary_union(holes))
    return geom.buffer(0)


def polys_of(g) -> list[Polygon]:
    if g.is_empty:
        return []
    if isinstance(g, Polygon):
        return [g]
    if isinstance(g, (MultiPolygon, GeometryCollection)):
        out = []
        for x in g.geoms:
            out += polys_of(x)
        return out
    return []


def clean(g, min_area: float = 0.4):
    return unary_union([p for p in polys_of(g.buffer(0)) if p.area >= min_area])


def ring_d(coords, prec=2) -> str:
    c = list(coords)[:-1] if list(coords)[0] == list(coords)[-1] else list(coords)
    return "M" + "L".join(f"{x:.{prec}f} {y:.{prec}f}" for x, y in c) + "Z"


def geom_d(g, prec=2) -> str:
    out = []
    for p in polys_of(g):
        out.append(ring_d(p.exterior.coords, prec))
        for h in p.interiors:
            out.append(ring_d(h.coords, prec))
    return "".join(out)


def simplify(g, tol=0.12):
    return clean(g.simplify(tol, preserve_topology=True))


def stroke(points, width, cap="round"):
    """A hand-made ink line (for reconstructed hidden edges): a buffered polyline."""
    return LineString(points).buffer(width / 2, cap_style={"round": 1, "flat": 2, "square": 3}[cap], join_style=1)


def smooth_line(points, n=40):
    """Catmull-Rom through points -> dense polyline."""
    P = np.array(points, float)
    if len(P) < 3:
        return [tuple(p) for p in P]
    P = np.vstack([P[0], P, P[-1]])
    out = []
    for i in range(1, len(P) - 2):
        p0, p1, p2, p3 = P[i - 1], P[i], P[i + 1], P[i + 2]
        for t in np.linspace(0, 1, n, endpoint=False):
            t2, t3 = t * t, t * t * t
            out.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3))
    out.append(P[-2])
    return [tuple(map(float, p)) for p in out]


def smooth_poly(points, n=24):
    """Closed Catmull-Rom polygon through points."""
    P = np.array(points, float)
    m = len(P)
    out = []
    for i in range(m):
        p0, p1, p2, p3 = P[(i - 1) % m], P[i], P[(i + 1) % m], P[(i + 2) % m]
        for t in np.linspace(0, 1, n, endpoint=False):
            t2, t3 = t * t, t * t * t
            out.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3))
    return Polygon(out).buffer(0)
