"""Debug views of parts_raw.json / parts.json: colour-coded map and exploded sheet."""
import colorsys
import json
import sys
from pathlib import Path

B = Path(__file__).resolve().parents[1] / "build"
name = sys.argv[1] if len(sys.argv) > 1 else "parts_raw.json"
out = Path(sys.argv[2])
data = json.loads((B / name).read_text())
parts = data["parts"] if "parts" in data else data
html = []
for i, (n, groups) in enumerate(parts.items()):
    gs = groups["groups"] if isinstance(groups, dict) and "groups" in groups else groups
    h = (i * 0.137) % 1
    r, g, b = colorsys.hsv_to_rgb(h, 0.55, 0.95)
    col = f"rgb({int(r*255)},{int(g*255)},{int(b*255)})"
    for k, d in gs.items():
        fill = "#000" if k == "#111110" else col
        html.append(f'<path d="{d}" fill="{fill}" fill-rule="evenodd" opacity="{1 if k=="#111110" else 0.85}"><title>{n}</title></path>')
labels = []
(out).write_text(f'<body style="margin:0;background:#fff"><svg width="1880" height="1300" viewBox="-160 0 940 650">{"".join(html)}</svg></body>')
