"""Self-test for track_screen.py on a synthetic clip with known ground truth.

A textured "screen" plane is warped through a known homography path (handheld drift, slow push,
perspective change) over a background that moves differently, encoded with x264, then tracked.
This is tooling verification only — the synthetic clip is never used in the film.

  .venv-video06/bin/python -I video06/tools/tests/test_track_screen.py
"""
from __future__ import annotations

import subprocess
import sys
import tempfile
from pathlib import Path

import cv2
import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from common import read_frames_gray  # noqa: E402
from track_screen import smooth, track  # noqa: E402

W, H, N = 1920, 1080, 96
rng = np.random.default_rng(6)


def texture(h, w, scale):
    t = cv2.resize(rng.integers(0, 255, (h // scale, w // scale), dtype=np.uint8), (w, h), interpolation=cv2.INTER_CUBIC)
    return cv2.GaussianBlur(t, (0, 0), 1.2)


def main() -> int:
    screen = texture(800, 1280, 6)
    cv2.rectangle(screen, (60, 60), (1220, 140), 30, -1)
    for k in range(6):
        cv2.rectangle(screen, (80 + k * 200, 260), (220 + k * 200, 520), int(40 + 30 * k), -1)
    bezel = cv2.copyMakeBorder(screen, 40, 40, 40, 40, cv2.BORDER_CONSTANT, value=15)
    bg = texture(H + 200, W + 200, 10)
    src_quad = np.float32([[40, 40], [1320, 40], [1320, 840], [40, 840]])  # screen corners inside `bezel`

    truth, frames = [], []
    for i in range(N):
        t = i / (N - 1)
        base = np.float32([[600, 260], [1400, 230], [1430, 760], [610, 800]])
        drift = np.float32([8 * np.sin(i / 7), 6 * np.cos(i / 9)])
        c = base.mean(0)
        scale = 1 + 0.12 * t  # slow push
        dst = (base - c) * scale + c + drift
        dst[1, 1] -= 25 * t  # perspective change
        dst[2, 1] += 20 * t
        Hm = cv2.getPerspectiveTransform(src_quad, dst)
        Hfull = Hm
        frame = bg[100 + int(4 * np.sin(i / 5)) : 100 + int(4 * np.sin(i / 5)) + H, 100 + i : 100 + i + W].copy()
        warped = cv2.warpPerspective(bezel, Hfull, (W, H))
        mask = cv2.warpPerspective(np.full(bezel.shape, 255, np.uint8), Hfull, (W, H))
        frame[mask > 0] = warped[mask > 0]
        frames.append(frame)
        truth.append(dst)

    with tempfile.TemporaryDirectory() as d:
        clip = Path(d) / "synthetic.mp4"
        p = subprocess.Popen(
            ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "gray", "-s", f"{W}x{H}", "-r", "24", "-i", "-",
             "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p", str(clip)],
            stdin=subprocess.PIPE,
        )
        for f in frames:
            p.stdin.write(f.tobytes())
        p.stdin.close()
        p.wait()
        decoded = read_frames_gray(clip, 0.0, N, W, H)

    quads, inliers = track(decoded, truth[0])
    quads = smooth(quads, 0.8)
    err = np.linalg.norm(quads - np.array(truth), axis=2)
    rms, worst = float(np.sqrt((err ** 2).mean())), float(err.max())
    print(f"frames {len(quads)}  corner RMS {rms:.2f}px  max {worst:.2f}px  min inliers {min(inliers)}")
    ok = len(quads) == N and rms < 1.5 and worst < 4.0
    print("PASS" if ok else "FAIL")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
