"""Rest-pose SVG of rig_parts.json in stacking order (for QA against the original)."""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from stack import ORDER  # noqa: E402

B = Path(__file__).resolve().parents[1] / "build"


def layer_svg(L, transform=""):
    out = [f'<g transform="{transform}">' if transform else "<g>"]
    for g in L["groups"]:
        d = "".join("M" + "L".join(f"{x} {y}" for x, y in r) + "Z" for r in g["rings"])
        out.append(f'<path d="{d}" fill="{g["color"]}" fill-rule="evenodd"/>')
    out.append("</g>")
    return "".join(out)


def svg(data, transforms=None, bg="#fff", vb="-160 0 940 650", w=1880, h=1300, only=None):
    body = []
    for n in reversed(ORDER):
        if n in data["layers"] and (only is None or n in only):
            body.append(layer_svg(data["layers"][n], (transforms or {}).get(n, "")))
    return f'<body style="margin:0;background:{bg}"><svg width="{w}" height="{h}" viewBox="{vb}">{"".join(body)}</svg></body>'


if __name__ == "__main__":
    data = json.loads((B / "rig_parts.json").read_text())
    Path(sys.argv[1]).write_text(svg(data, bg=sys.argv[2] if len(sys.argv) > 2 else "#fff"))
