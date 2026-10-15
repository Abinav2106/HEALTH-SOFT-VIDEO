"""Check a rendered W&W file itself: format, duration, frame rate, audio, blank frames, final hold.

  .venv-ww/bin/python -I ww/tools/qc_ww.py remotion/out/ww_start-with-why_review_1080x1920_30p.mp4
"""
from __future__ import annotations

import json
import subprocess
import sys

import numpy as np

EXPECT = {"width": 1080, "height": 1920, "fps": 30.0, "duration": 45.0, "frames": 1350}


def probe(path: str) -> dict:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_streams", "-show_format", "-count_frames", "-of", "json", path],
        check=True,
        capture_output=True,
        text=True,
    ).stdout
    return json.loads(out)


def frames(path: str, w: int = 108, h: int = 192) -> np.ndarray:
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", path, "-vf", f"scale={w}:{h}", "-f", "rawvideo", "-pix_fmt", "gray", "-"],
        check=True,
        capture_output=True,
    ).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, h, w).astype(np.float32)


def main(path: str) -> int:
    info = probe(path)
    v = next(s for s in info["streams"] if s["codec_type"] == "video")
    a = [s for s in info["streams"] if s["codec_type"] == "audio"]
    num, den = map(int, v["r_frame_rate"].split("/"))
    fps = num / den
    n = int(v.get("nb_read_frames") or v.get("nb_frames"))
    dur = float(info["format"]["duration"])
    checks = {
        "resolution 1080x1920": (v["width"], v["height"]) == (EXPECT["width"], EXPECT["height"]),
        "aspect 9:16": abs(v["width"] / v["height"] - 9 / 16) < 1e-3,
        "30 fps": abs(fps - EXPECT["fps"]) < 1e-3,
        "1350 frames": n == EXPECT["frames"],
        "duration 45.0 s": abs(dur - EXPECT["duration"]) < 0.08,
        "audio stream present": bool(a),
    }
    fr = frames(path)
    # Blank / stuck frames: a frame that is flat (no detail) outside intended solid-colour holds.
    flat = [i for i, f in enumerate(fr) if f.std() < 1.0]
    # Final hold: last 4 s (41.0 → 45.0) must be resolved — very small frame-to-frame change.
    tail = fr[EXPECT["frames"] - 120 :]
    tail_motion = float(np.abs(np.diff(tail, axis=0)).mean()) if len(tail) > 1 else 0
    checks["final hold resolved (41–45 s, low motion)"] = tail_motion < 1.5
    for k, ok in checks.items():
        print(("PASS " if ok else "FAIL ") + k)
    print(f"info: {v['width']}x{v['height']} {fps:.3f} fps, {n} frames, {dur:.3f} s, audio streams: {len(a)}")
    if a:
        print(f"info: audio {a[0]['codec_name']} {a[0].get('sample_rate')} Hz, {a[0].get('channels')} ch")
    print(f"info: solid-colour frames (std<1): {len(flat)} → {flat[:12]}{' …' if len(flat) > 12 else ''}")
    print(f"info: mean frame change over final 4 s: {tail_motion:.3f}")
    return 0 if all(checks.values()) else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1]))
