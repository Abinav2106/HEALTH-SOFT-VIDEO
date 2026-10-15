"""Cut the supplied W&W brand files into compositing layers (no redrawing).

Inputs (client files, not committed — see ww/README.md):
  ww/source/doubt_3d_neutral.webp   neutral 3D appearance render (1122x1402)
  ww/source/ww_logo.jpg             official W&W wordmark, black on white (2000x2000)

Outputs to remotion/public/ww/brand/ (gitignored):
  doubt_body.png      approved render, background removed, question mark removed
  doubt_qmark.png     the render's own question mark (curve + dot), alpha
  doubt_shadow.png    the render's own contact shadow as a black alpha layer
  qmark_mask.png      flat silhouette of that same question mark (for the R1 grid)
  doubt_hand.png      right forearm + hand of the approved render (2D cutout, provisional)
  ww_logo_mask.png    official wordmark as an alpha mask (exact letterforms, tight crop)
  metrics.json        source-pixel geometry so every layer re-registers exactly

Every layer keeps source pixel scale; positions are recorded in render coordinates.

  .venv-ww/bin/python -I ww/tools/prep_assets.py
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage as nd

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "ww/source"
OUT = ROOT / "remotion/public/ww/brand"

LIGHT = 190  # background / white-body threshold; the black contour separates them
Q_BOTTOM = 350  # rows above this belong to the floating question mark (curve 105-272, dot 289-337)
SHADOW_ROWS = (1080, 1300)


def sha(p: Path) -> str:
    return hashlib.sha256(p.read_bytes()).hexdigest()


def save(arr: np.ndarray, name: str) -> None:
    Image.fromarray(arr.astype(np.uint8), "RGBA").save(OUT / name, optimize=True)


def bbox(mask: np.ndarray, pad: int = 0) -> tuple[int, int, int, int]:
    ys, xs = np.where(mask)
    return (int(max(xs.min() - pad, 0)), int(max(ys.min() - pad, 0)), int(xs.max() + 1 + pad), int(ys.max() + 1 + pad))


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    render_p = SRC / "doubt_3d_neutral.webp"
    logo_p = SRC / "ww_logo.jpg"
    rgb = np.asarray(Image.open(render_p).convert("RGB")).astype(np.float32)
    h, w, _ = rgb.shape
    g = rgb.mean(2)
    bg_level = float(np.median(g[:40, :40]))

    # Background = light pixels connected to the frame edge. The render's black contour closes the figure.
    lab, _ = nd.label(g > LIGHT)
    edge_labels = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(edge_labels))
    # Small enclosed light pocket between the feet is floor, not body.
    for i, sl in enumerate(nd.find_objects(lab), start=1):
        if sl is None or i in edge_labels:
            continue
        if sl[0].start > 1030 and (lab[sl] == i).sum() < 4000:
            bg |= lab == i
    fig = ~bg
    # 1px anti-aliased edge: soften the binary matte slightly, keep the interior solid.
    alpha = nd.gaussian_filter(fig.astype(np.float32), 0.7)
    alpha = np.where(fig, np.maximum(alpha, 0.5), alpha * 0.0)
    alpha = np.clip(alpha * 1.0, 0, 1)

    q = fig.copy()
    q[Q_BOTTOM:] = False
    body = fig.copy()
    body[:Q_BOTTOM] = False

    def layer(mask: np.ndarray) -> np.ndarray:
        a = np.where(mask, alpha, 0)
        return np.dstack([rgb, a * 255])

    bx = bbox(body, 4)
    qx = bbox(q, 4)
    save(layer(body)[bx[1]:bx[3], bx[0]:bx[2]], "doubt_body.png")
    save(layer(q)[qx[1]:qx[3], qx[0]:qx[2]], "doubt_qmark.png")

    # Flat silhouette of the same question mark: alpha only, solid fill (tinted in CSS via mask-image).
    sil = np.zeros((h, w, 4), np.float32)
    sil[..., :3] = 0
    sil[..., 3] = np.where(q, alpha, 0) * 255
    # Resampled ×4 (bicubic → light blur → contrast) so large uses keep clean edges; same shape, no redraw.
    # Edge coverage comes from the render's own anti-aliasing (darkness vs background); interior is solid.
    cover = np.clip((bg_level - g) / (bg_level - 40), 0, 1)
    interior = nd.binary_erosion(q, iterations=2)
    qa = np.where(interior, 1.0, np.where(nd.binary_dilation(q, iterations=2), cover, 0))
    qa[Q_BOTTOM:] = 0
    a_small = Image.fromarray((qa[qx[1]:qx[3], qx[0]:qx[2]] * 255).astype(np.uint8), "L")
    big = a_small.resize((a_small.width * 4, a_small.height * 4), Image.BICUBIC)
    b = nd.gaussian_filter(np.asarray(big).astype(np.float32) / 255, 2.2)
    b = np.clip((b - 0.5) * 2.4 + 0.5, 0, 1)
    sil4 = np.zeros((big.height, big.width, 4), np.float32)
    sil4[..., 3] = b * 255
    save(sil4, "qmark_mask.png")

    # The render's own floor shadow, as black with alpha (multiplies cleanly onto any light stage).
    shadow = np.zeros((h, w, 4), np.float32)
    dark = np.clip((bg_level - g) / bg_level, 0, 1) * bg
    dark[: SHADOW_ROWS[0]] = 0
    dark[SHADOW_ROWS[1]:] = 0
    shadow[..., 3] = np.clip(dark * 1.15, 0, 1) * 255
    sx = (0, SHADOW_ROWS[0], w, SHADOW_ROWS[1])
    save(shadow[sx[1]:sx[3], sx[0]:sx[2]], "doubt_shadow.png")

    # Right forearm + hand (viewer's right). Cut along the arm crease (x >= 783) from the elbow down.
    hand_mask = fig.copy()
    hand_mask[:700] = False
    hand_mask[1040:] = False
    hand_mask[:, :783] = False
    hx = bbox(hand_mask, 2)
    save(layer(hand_mask)[hx[1]:hx[3], hx[0]:hx[2]], "doubt_hand.png")

    # Official wordmark → alpha mask (exact letterforms; luminance inverted, tight crop, no resampling).
    lg = np.asarray(Image.open(logo_p).convert("L")).astype(np.float32)
    la = np.clip((255 - lg) / 255, 0, 1)
    la[la < 0.03] = 0
    lx = bbox(la > 0.5, 6)
    logo = np.zeros((lg.shape[0], lg.shape[1], 4), np.float32)
    logo[..., 3] = la * 255
    save(logo[lx[1]:lx[3], lx[0]:lx[2]], "ww_logo_mask.png")

    metrics = {
        "render": {"w": w, "h": h, "file": render_p.name, "sha256": sha(render_p), "bgLevel": bg_level},
        "body": {"x": bx[0], "y": bx[1], "w": bx[2] - bx[0], "h": bx[3] - bx[1]},
        "qmark": {"x": qx[0], "y": qx[1], "w": qx[2] - qx[0], "h": qx[3] - qx[1]},
        "shadow": {"x": sx[0], "y": sx[1], "w": sx[2] - sx[0], "h": sx[3] - sx[1]},
        "hand": {"x": hx[0], "y": hx[1], "w": hx[2] - hx[0], "h": hx[3] - hx[1]},
        "logo": {
            "file": logo_p.name,
            "sha256": sha(logo_p),
            "w": lx[2] - lx[0],
            "h": lx[3] - lx[1],
        },
    }
    (OUT / "metrics.json").write_text(json.dumps(metrics, indent=2))
    # Same numbers for the TypeScript side (committed; contains geometry only, no artwork).
    ts = ROOT / "remotion/src/ww/assetMetrics.json"
    ts.write_text(json.dumps(metrics, indent=2) + "\n")
    print(json.dumps(metrics, indent=2))


if __name__ == "__main__":
    main()
