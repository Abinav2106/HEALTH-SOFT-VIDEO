"""Check that a shot's 9:16 crop keeps faces whole and clear of the titles.

Reads the shot's file / sourceIn / focus / zoom from the stock manifest, samples frames across the
shot, detects faces on the full source frame, and reports faces cut by the crop edge or sitting
under a title zone. Writes a contact sheet with the crop, title-safe area, text zones and faces drawn.

  .venv-video06/bin/python -I video06/tools/crop_check.py --shot s04 [--samples 6] [--out out.png]
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import cv2
import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import FPS, SHOT_RANGES, STOCK_DIR, TEXT_ZONES, TITLE_SAFE, cover_layout, crop_window, load_manifest  # noqa: E402

CASCADES = [cv2.data.haarcascades + "haarcascade_frontalface_default.xml", cv2.data.haarcascades + "haarcascade_profileface.xml"]


def detect_faces(gray: np.ndarray) -> list[tuple[int, int, int, int]]:
    faces = []
    min_side = max(40, gray.shape[0] // 25)
    for path in CASCADES:
        det = cv2.CascadeClassifier(path)
        for flip in (False, True) if "profile" in path else (False,):
            g = cv2.flip(gray, 1) if flip else gray
            for x, y, w, h in det.detectMultiScale(g, 1.1, 6, minSize=(min_side, min_side)):
                if flip:
                    x = gray.shape[1] - x - w
                faces.append((int(x), int(y), int(w), int(h)))
    return faces


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--shot", required=True, choices=sorted(SHOT_RANGES))
    ap.add_argument("--samples", type=int, default=6)
    ap.add_argument("--out", type=Path)
    a = ap.parse_args()

    shot = load_manifest()["shots"][a.shot]
    if not shot.get("file"):
        print(f"{a.shot}: no clip in the manifest yet", file=sys.stderr)
        return 2
    path = STOCK_DIR / shot["file"]
    w, h = shot["width"], shot["height"]
    focus, zoom = tuple(shot["focus"]), shot.get("zoom", 1)
    x0, y0, x1, y1 = crop_window(w, h, focus, zoom)
    lay = cover_layout(w, h, focus, zoom)
    to_frame = lambda x, y: (lay["left"] + x * lay["s"], lay["top"] + y * lay["s"])  # noqa: E731

    n_frames = SHOT_RANGES[a.shot][1] - SHOT_RANGES[a.shot][0]
    cap = cv2.VideoCapture(str(path))
    tiles, issues = [], []
    for i in range(a.samples):
        t = shot["sourceIn"] + (i + 0.5) * n_frames / a.samples / FPS
        cap.set(cv2.CAP_PROP_POS_MSEC, t * 1000)
        ok, img = cap.read()
        if not ok:
            issues.append({"t": round(t, 2), "issue": "could not decode frame"})
            continue
        img = cv2.resize(img, (w, h))
        gray = cv2.equalizeHist(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY))
        for fx, fy, fw, fh in detect_faces(gray):
            inside_x = max(0, min(fx + fw, x1) - max(fx, x0)) / fw
            inside_y = max(0, min(fy + fh, y1) - max(fy, y0)) / fh
            frac = inside_x * inside_y
            fr = (*to_frame(fx, fy), *to_frame(fx + fw, fy + fh))
            if 0.05 < frac < 0.95:
                issues.append({"t": round(t, 2), "issue": "face cut by 9:16 crop edge", "inside": round(frac, 2)})
            for zx0, zy0, zx1, zy1 in TEXT_ZONES.get(a.shot, []):
                if frac > 0.5 and fr[0] < zx1 and fr[2] > zx0 and fr[1] < zy1 and fr[3] > zy0:
                    issues.append({"t": round(t, 2), "issue": "face under a title zone", "zone": [zx0, zy0, zx1, zy1]})
            colour = (0, 200, 0) if frac >= 0.95 else (0, 0, 255)
            cv2.rectangle(img, (fx, fy), (fx + fw, fy + fh), colour, max(2, w // 400))
        # The 9:16 frame as the composition will show it, with overlays.
        frame = cv2.resize(img[int(max(0, y0)):int(min(h, y1)), int(max(0, x0)):int(min(w, x1))], (1080, 1920))
        sx0, sy0, sx1, sy1 = TITLE_SAFE
        cv2.rectangle(frame, (sx0, sy0), (sx1, sy1), (255, 255, 0), 2)
        for zx0, zy0, zx1, zy1 in TEXT_ZONES.get(a.shot, []):
            cv2.rectangle(frame, (zx0, zy0), (zx1, zy1), (0, 140, 255), 3)
        cv2.putText(frame, f"{a.shot} t={t:.2f}s", (40, 80), cv2.FONT_HERSHEY_SIMPLEX, 1.6, (255, 255, 255), 3)
        tiles.append(cv2.resize(frame, (360, 640)))
    if not tiles:
        print(json.dumps({"shot": a.shot, "issues": issues}, indent=2))
        return 1
    sheet = np.hstack(tiles)
    out = a.out or Path(f"remotion/out/cropcheck_{a.shot}.png")
    out.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(out), sheet)
    report = {"shot": a.shot, "source": shot["file"], "crop_source_px": [round(v, 1) for v in (x0, y0, x1, y1)], "scale": round(lay["s"], 3), "issues": issues, "sheet": str(out)}
    print(json.dumps(report, indent=2))
    return 1 if issues else 0


if __name__ == "__main__":
    sys.exit(main())
