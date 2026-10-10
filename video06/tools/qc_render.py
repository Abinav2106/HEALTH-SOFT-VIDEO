"""QC a Video 06 render.

Checks format, temporary production labels (review plates and burn-in), black frames, frozen
pictures inside live-action shots (catches stills / animated photos / stalled decodes), product and
logo fidelity against the original brand files, and audio presence/loudness.

  .venv-video06/bin/python -I video06/tools/qc_render.py remotion/out/v06_master_1080x1920_24p.mp4 [--json out.json]

There is no OCR in this environment; label checks are pixel signatures backed by the composition's
master mode, which cannot render plates or burn-in at all.
"""
from __future__ import annotations

import argparse
import json
import math
import re
import subprocess
import sys
from pathlib import Path

import cv2
import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import FPS, REMOTION, SHOT_RANGES  # noqa: E402

EXPECT = {"width": 1080, "height": 1920, "fps": 24.0, "frames": 768, "duration": 32.0}
PLATE_RGB = np.array([[0x2B, 0x27, 0x23], [0x17, 0x15, 0x13]], float)  # review plate gradient ends
PHOTO = REMOTION / "public/brand/healthsoft_products_original.webp"
LOGO = REMOTION / "public/brand/healthsoft_logo_original.png"
STAGE_FRAME, END_FRAME, LOGO_XY = 396, 767, (317, 462)


def psnr(a, b):
    mse = float(((a.astype(float) - b.astype(float)) ** 2).mean())
    return 99.0 if mse == 0 else 10 * math.log10(255 ** 2 / mse)


def decode_all(path: Path, w: int, h: int, scale: int = 4) -> np.ndarray:
    sw, sh = w // scale, h // scale
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-vf", f"scale={sw}:{sh}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], check=True, capture_output=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, sh, sw, 3)


def frame_at(path: Path, n: int) -> np.ndarray:
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-vf", f"select=eq(n\\,{n})", "-vsync", "0", "-frames:v", "1", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], check=True, capture_output=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(1920, 1080, 3)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("video", type=Path)
    ap.add_argument("--json", type=Path)
    a = ap.parse_args()
    res: dict = {"file": str(a.video), "checks": []}

    def check(name, ok, detail, severity="fail"):
        res["checks"].append({"check": name, "result": "pass" if ok else severity, "detail": detail})

    probe = json.loads(subprocess.run(["ffprobe", "-v", "error", "-count_frames", "-print_format", "json", "-show_streams", "-show_format", str(a.video)], check=True, capture_output=True, text=True).stdout)
    v = next(s for s in probe["streams"] if s["codec_type"] == "video")
    aud = [s for s in probe["streams"] if s["codec_type"] == "audio"]
    num, den = map(int, v["r_frame_rate"].split("/"))
    fmt = {"width": v["width"], "height": v["height"], "fps": num / den, "frames": int(v["nb_read_frames"]), "duration": round(float(probe["format"]["duration"]), 3)}
    check("format", all(abs(fmt[k] - EXPECT[k]) < 1e-3 for k in EXPECT), fmt)
    check("pixel format / colour", v.get("pix_fmt") == "yuv420p" and v.get("color_space") == "bt709", {k: v.get(k) for k in ("pix_fmt", "color_space", "color_range")})

    small = decode_all(a.video, fmt["width"], fmt["height"])
    # Review plates: most of the frame within a few levels of the plate gradient.
    lo, hi = PLATE_RGB.min(0) - 4, PLATE_RGB.max(0) + 4
    inside = np.all((small >= lo) & (small <= hi), axis=3)
    plate_frames = [i for i in range(len(small)) if inside[i].mean() > 0.55]
    check("no review placeholder plates", not plate_frames, {"frames": plate_frames[:20], "count": len(plate_frames)})
    # Burn-in pills: a dark, flat rectangle at the top corners on most frames.
    pill = small[:, 10:18, 210:262].astype(float).mean(axis=(1, 2, 3))
    ring = small[:, 22:30, 210:262].astype(float).mean(axis=(1, 2, 3))
    flat = small[:, 10:18, 210:262].astype(float).std(axis=(1, 2, 3))
    burn = [i for i in range(len(small)) if pill[i] < 0.75 * ring[i] and flat[i] < 30 and ring[i] > 60]
    check("no review burn-in", len(burn) < 0.05 * len(small), {"suspect_frames": len(burn)})

    # Black frames.
    bd = subprocess.run(["ffmpeg", "-v", "info", "-i", str(a.video), "-vf", "blackdetect=d=0.04:pix_th=0.06", "-an", "-f", "null", "-"], capture_output=True, text=True).stderr
    blacks = re.findall(r"black_start:([\d.]+) black_end:([\d.]+)", bd)
    check("no black frames", not blacks, {"segments": blacks})

    # Live-action shots must move: a frozen picture means a still, an animated photo or a stalled decode.
    frozen = {}
    for shot, (f0, f1) in SHOT_RANGES.items():
        seg = small[f0:min(f1, len(small))].astype(float)
        if len(seg) < 2:
            continue
        diffs = np.abs(np.diff(seg, axis=0)).mean(axis=(1, 2, 3))
        still = float((diffs < 0.15).mean())
        if still > 0.5:
            frozen[shot] = round(still, 2)
    check("live-action shots are moving footage", not frozen, {"frozen_fraction_by_shot": frozen})

    # Brand fidelity.
    if PHOTO.exists():
        ref = cv2.cvtColor(cv2.imread(str(PHOTO)), cv2.COLOR_BGR2RGB)
        k = max(1080 / ref.shape[1], 1920 / ref.shape[0])
        ref = cv2.resize(ref, (round(ref.shape[1] * k), round(ref.shape[0] * k)), interpolation=cv2.INTER_LANCZOS4)
        ox = (ref.shape[1] - 1080) // 2
        stage = frame_at(a.video, STAGE_FRAME)
        p = psnr(stage[100:1350], ref[100:1350, ox:ox + 1080])
        check("product photo unaltered (f396 vs original)", p > 28, {"psnr_db": round(p, 2)})
    if LOGO.exists():
        lg = cv2.cvtColor(cv2.imread(str(LOGO)), cv2.COLOR_BGR2RGB)
        end = frame_at(a.video, END_FRAME)
        x, y = LOGO_XY
        p = psnr(end[y:y + lg.shape[0], x:x + lg.shape[1]], lg)
        check("official logo unaltered (f767 vs file)", p > 26, {"psnr_db": round(p, 2)})

    # Audio.
    if aud:
        lu = subprocess.run(["ffmpeg", "-v", "info", "-i", str(a.video), "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
        i_lufs = re.findall(r"I:\s+(-?[\d.]+) LUFS", lu)
        tp = re.findall(r"Peak:\s+(-?[\d.]+) dBFS", lu)
        check("audio present", True, {"integrated_lufs": i_lufs[-1] if i_lufs else None, "true_peak_dbfs": tp[-1] if tp else None})
    else:
        check("audio present", False, "no audio stream (VO / music / SFX not supplied)", severity="fail")

    failed = [c for c in res["checks"] if c["result"] != "pass"]
    res["verdict"] = "PASS" if not failed else "FAIL"
    for c in res["checks"]:
        print(f"[{c['result'].upper():4}] {c['check']}: {json.dumps(c['detail'])}")
    print("VERDICT:", res["verdict"])
    if a.json:
        a.json.write_text(json.dumps(res, indent=2) + "\n")
    return 0 if not failed else 1


if __name__ == "__main__":
    sys.exit(main())
