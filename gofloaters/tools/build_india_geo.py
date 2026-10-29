"""Simplify Natural Earth's India boundary (India point-of-view edition) into a small lon/lat
GeoJSON for the ending map. Projection happens in the composition (src/gofloaters/lib/geo.ts),
with the same function for the boundary and the city markers.

Source: Natural Earth 1:10m admin-0 countries, India POV (public domain)
  https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_0_countries_ind.geojson

  python3 -I gofloaters/tools/build_india_geo.py ne_10m_admin_0_countries_ind.geojson
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

from shapely.geometry import mapping, shape
from shapely.geometry.polygon import orient

OUT = Path(__file__).resolve().parents[2] / "remotion/src/gofloaters/data/india.json"


def main(src: str) -> None:
    data = json.loads(Path(src).read_text())
    feat = next(f for f in data["features"] if f["properties"]["ADM0_A3"] == "IND")
    geom = shape(feat["geometry"])
    polys = [orient(p.simplify(0.03, preserve_topology=True)) for p in geom.geoms]
    # Keep the mainland and every island group large enough to read at 1080 px wide
    # (Andaman & Nicobar, Lakshadweep's largest atolls drop below a pixel and are omitted).
    polys = [p for p in polys if p.area > 0.004]
    rings = [[[round(x, 3), round(y, 3)] for x, y in p.exterior.coords] for p in polys]
    OUT.write_text(json.dumps({
        "source": "Natural Earth 1:10m admin-0 countries, India point of view (ne_10m_admin_0_countries_ind), simplified 0.03 deg",
        "rings": rings,
    }, separators=(",", ":")) + "\n")
    print(f"{len(rings)} rings, {sum(len(r) for r in rings)} points -> {OUT}")


if __name__ == "__main__":
    main(sys.argv[1])
