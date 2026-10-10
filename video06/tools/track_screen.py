"""Planar-track a laptop/tablet screen through a Video 06 shot.

Seed the four screen corners (TL TR BR BL, source pixels) on the shot's first frame; the tracker
follows features on the screen plane with pyramidal Lucas–Kanade, rejects drifting points with a
forward–backward check, fits a RANSAC homography from the seed frame to every later frame, and
re-seeds features from the current estimate when too few survive. Output corners are in SOURCE
pixels, so the composition can change crop/zoom without re-tracking.

  .venv-video06/bin/python -I video06/tools/track_screen.py --shot s01 \
      --corners 812,402 1690,388 1702,930 820,952 [--out path.json] [--preview out.png]
  (or --file/--source-in/--frames to track an arbitrary clip, used by the self-test)
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import cv2
import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import SHOT_RANGES, STOCK_DIR, TRACK_DIR, ffprobe, load_manifest, read_frames_gray  # noqa: E402

LK = dict(winSize=(21, 21), maxLevel=4, criteria=(cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 30, 0.01))


def plane_mask(shape, quad: np.ndarray, grow: float) -> np.ndarray:
    """Mask of the screen quad grown about its centre (grow=0.06 → 6 %), so the bezel contributes too."""
    c = quad.mean(axis=0)
    poly = (c + (quad - c) * (1 + grow)).astype(np.int32)
    m = np.zeros(shape, np.uint8)
    cv2.fillConvexPoly(m, poly, 255)
    return m


def seed(gray, quad, grow, n=500):
    pts = cv2.goodFeaturesToTrack(gray, maxCorners=n, qualityLevel=0.005, minDistance=6, mask=plane_mask(gray.shape, quad, grow), blockSize=5)
    return np.empty((0, 1, 2), np.float32) if pts is None else pts.astype(np.float32)


def track(frames: np.ndarray, corners0: np.ndarray, grow: float = 0.06, min_pts: int = 40):
    quad0 = corners0.reshape(4, 2).astype(np.float32)
    ref_pts = seed(frames[0], quad0, grow)  # positions in the seed frame
    cur_pts = ref_pts.copy()
    H = np.eye(3)
    quads, inliers = [quad0.tolist()], [len(ref_pts)]
    for i in range(1, len(frames)):
        prev, cur = frames[i - 1], frames[i]
        if len(cur_pts) >= 8:
            nxt, st, _ = cv2.calcOpticalFlowPyrLK(prev, cur, cur_pts, None, **LK)
            back, st2, _ = cv2.calcOpticalFlowPyrLK(cur, prev, nxt, None, **LK)
            fb = np.linalg.norm((back - cur_pts).reshape(-1, 2), axis=1)
            keep = (st.ravel() == 1) & (st2.ravel() == 1) & (fb < 0.8)
            ref_pts, cur_pts = ref_pts[keep], nxt[keep]
        if len(cur_pts) >= 8:
            Hn, mask = cv2.findHomography(ref_pts, cur_pts, cv2.RANSAC, 1.5, maxIters=4000, confidence=0.999)
            if Hn is not None:
                H = Hn
                good = mask.ravel() == 1
                ref_pts, cur_pts = ref_pts[good], cur_pts[good]
        q = cv2.perspectiveTransform(quad0.reshape(-1, 1, 2), H).reshape(4, 2)
        quads.append(q.tolist())
        inliers.append(int(len(cur_pts)))
        if len(cur_pts) < min_pts:
            # Re-seed on the current frame and map the new points back to seed-frame coordinates.
            fresh = seed(cur, q.astype(np.float32), grow)
            if len(fresh):
                back_ref = cv2.perspectiveTransform(fresh.reshape(-1, 1, 2).astype(np.float64), np.linalg.inv(H)).astype(np.float32)
                ref_pts = np.concatenate([ref_pts, back_ref])
                cur_pts = np.concatenate([cur_pts, fresh])
    return np.array(quads), inliers


def smooth(quads: np.ndarray, sigma: float) -> np.ndarray:
    """Light temporal Gaussian per corner coordinate; removes sub-pixel jitter, keeps real motion."""
    if sigma <= 0 or len(quads) < 3:
        return quads
    r = max(1, int(3 * sigma))
    k = np.exp(-0.5 * (np.arange(-r, r + 1) / sigma) ** 2)
    k /= k.sum()
    flat = quads.reshape(len(quads), -1)
    padded = np.pad(flat, ((r, r), (0, 0)), mode="edge")
    out = np.stack([np.convolve(padded[:, j], k, mode="valid") for j in range(flat.shape[1])], axis=1)
    return out.reshape(quads.shape)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--shot", choices=sorted(SHOT_RANGES))
    ap.add_argument("--file", type=Path)
    ap.add_argument("--source-in", type=float)
    ap.add_argument("--frames", type=int)
    ap.add_argument("--corners", nargs=4, required=True, metavar="X,Y", help="TL TR BR BL in source px on the first frame")
    ap.add_argument("--smooth", type=float, default=0.8)
    ap.add_argument("--out", type=Path)
    ap.add_argument("--preview", type=Path, help="write a contact sheet with the tracked quad drawn")
    a = ap.parse_args()

    if a.shot:
        shot = load_manifest()["shots"][a.shot]
        if not shot.get("file"):
            print(f"{a.shot}: no clip in the manifest yet", file=sys.stderr)
            return 2
        path = STOCK_DIR / shot["file"]
        start = shot["sourceIn"] if a.source_in is None else a.source_in
        count = a.frames or (SHOT_RANGES[a.shot][1] - SHOT_RANGES[a.shot][0])
    else:
        path, start, count = a.file, a.source_in or 0.0, a.frames
        if not (path and count):
            ap.error("--file and --frames are required without --shot")
    info = ffprobe(path)
    frames = read_frames_gray(path, start, count, info["width"], info["height"])
    corners = np.array([[float(v) for v in c.split(",")] for c in a.corners], np.float32)
    quads, inl = track(frames, corners)
    quads = smooth(quads, a.smooth)

    out = a.out or (TRACK_DIR / f"{a.shot}.json")
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps({
        "shot": a.shot or "adhoc",
        "source": path.name,
        "sourceIn": start,
        "fps": 24,
        "width": info["width"],
        "height": info["height"],
        "method": "KLT + forward-backward check + RANSAC homography from seed frame; gaussian sigma=%.2f" % a.smooth,
        "inliers": inl,
        "frames": [[[round(x, 2), round(y, 2)] for x, y in q] for q in quads],
    }) + "\n")
    print(f"tracked {len(quads)} frames -> {out} (min inliers {min(inl)})")

    if a.preview:
        idx = np.linspace(0, len(frames) - 1, min(6, len(frames))).astype(int)
        tiles = []
        for i in idx:
            img = cv2.cvtColor(frames[i], cv2.COLOR_GRAY2BGR)
            cv2.polylines(img, [quads[i].astype(np.int32)], True, (0, 140, 255), max(2, info["width"] // 500))
            tiles.append(cv2.resize(img, (480, int(480 * info["height"] / info["width"]))))
        cv2.imwrite(str(a.preview), np.hstack(tiles))
    return 0


if __name__ == "__main__":
    sys.exit(main())
