"""Subject-aware 9:16 reframing for a Video 06 shot.

Samples frames across the shot, detects faces on the full source frame, and sets the manifest
`focus` so the 1080×1920 crop window is centred on the people (median face centre, area-weighted).
Never stretches: the crop is a pure cover-fit window; only its position changes. If no faces are
found the existing focus is kept and a warning is printed.

  .venv-video06/bin/python -I video06/tools/auto_reframe.py --shot s05 [--samples 8]
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

import cv2
import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import FPS, SHOT_RANGES, STOCK_DIR, crop_window, load_manifest, save_manifest  # noqa: E402
from crop_check import detect_faces  # noqa: E402


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--shot", required=True, choices=sorted(SHOT_RANGES))
    ap.add_argument("--samples", type=int, default=8)
    a = ap.parse_args()

    m = load_manifest()
    shot = m["shots"][a.shot]
    if not shot.get("file"):
        print(f"{a.shot}: no clip in the manifest yet", file=sys.stderr)
        return 2
    w, h = shot["width"], shot["height"]
    n_frames = SHOT_RANGES[a.shot][1] - SHOT_RANGES[a.shot][0]
    rate = shot.get("playbackRate", 1.0)
    det_w = 1280  # detect on a downscaled frame for speed, map back to source px
    k = w / det_w
    cap = cv2.VideoCapture(str(STOCK_DIR / shot["file"]))
    cx, cy, wt = [], [], []
    for i in range(a.samples):
        t = shot["sourceIn"] + (i + 0.5) * n_frames / a.samples / FPS * rate
        cap.set(cv2.CAP_PROP_POS_MSEC, t * 1000)
        ok, img = cap.read()
        if not ok:
            continue
        small = cv2.resize(img, (det_w, int(h / k)))
        gray = cv2.equalizeHist(cv2.cvtColor(small, cv2.COLOR_BGR2GRAY))
        for fx, fy, fw, fh in detect_faces(gray):
            cx.append((fx + fw / 2) * k)
            cy.append((fy + fh / 2) * k)
            wt.append(fw * fh)
    if not cx:
        print(f"{a.shot}: no faces found; focus kept at {shot['focus']}")
        return 0
    order = np.argsort(cx)
    cum = np.cumsum(np.array(wt)[order])
    mx = float(np.array(cx)[order][np.searchsorted(cum, cum[-1] / 2)])  # area-weighted median
    my = float(np.median(cy))
    x0, y0, x1, y1 = crop_window(w, h, (0.5, 0.5), shot.get("zoom", 1))
    win_w, win_h = x1 - x0, y1 - y0
    # Faces sit slightly above centre (titles live in the lower third of every shot).
    fx = 0.5 if w - win_w < 1 else float(np.clip((mx - win_w / 2) / (w - win_w), 0, 1))
    fy = 0.5 if h - win_h < 1 else float(np.clip((my - win_h * 0.38) / (h - win_h), 0, 1))
    shot["focus"] = [round(fx, 3), round(fy, 3)]
    save_manifest(m)
    print(f"{a.shot}: {len(cx)} face detections, centre ≈ ({mx:.0f}, {my:.0f}) src px → focus {shot['focus']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
