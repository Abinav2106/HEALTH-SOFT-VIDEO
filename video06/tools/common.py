"""Shared constants and helpers for the Video 06 stock tools.

Shot lengths mirror remotion/src/video06/constants.ts (24 fps). Keep them in sync.
"""
from __future__ import annotations

import json
import subprocess
from fractions import Fraction
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
REMOTION = REPO / "remotion"
MANIFEST = REMOTION / "src/video06/stock/manifest.json"
STOCK_DIR = REMOTION / "public/stock"
TRACK_DIR = REMOTION / "src/video06/stock/tracks"

FPS = 24
FRAME_W, FRAME_H = 1080, 1920

# Composition frame ranges [from, to) of each live-action shot. s06 runs to the end of the screen push.
SHOT_RANGES = {
    "s01": (0, 72),
    "s02": (72, 92),
    "s03": (92, 144),
    "s04": (144, 216),
    "s05": (216, 288),
    "s06": (288, 388),
    "s11": (664, 716),
}

# Frame-space rectangles (x0, y0, x1, y1) where titles sit, per shot. Faces should stay clear of them.
TEXT_ZONES = {
    "s01": [(84, 1290, 720, 1610), (84, 890, 470, 1070)],
    "s02": [(84, 890, 470, 1070)],
    "s03": [(84, 1290, 760, 1610)],
    "s04": [(84, 1180, 780, 1540)],
    "s05": [(84, 1290, 720, 1610)],
    "s06": [(84, 1170, 700, 1580)],
    "s11": [(84, 1210, 640, 1610)],
}
TITLE_SAFE = (84, 250, 996, 1640)

MAX_UPSCALE_WARN = 1.15
MAX_UPSCALE_FAIL = 1.5


def load_manifest() -> dict:
    return json.loads(MANIFEST.read_text())


def save_manifest(m: dict) -> None:
    MANIFEST.write_text(json.dumps(m, indent=2) + "\n")


def ffprobe(path: Path) -> dict:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-print_format", "json", "-show_streams", "-show_format", str(path)],
        check=True, capture_output=True, text=True,
    ).stdout
    data = json.loads(out)
    v = next(s for s in data["streams"] if s["codec_type"] == "video")
    w, h = int(v["width"]), int(v["height"])
    rotation = 0
    for sd in v.get("side_data_list", []):
        if "rotation" in sd:
            rotation = int(sd["rotation"])
    if abs(rotation) in (90, 270):
        w, h = h, w  # phone footage stored sideways: display size is what the composition sees
    return {
        "width": w,
        "height": h,
        "fps": float(Fraction(v["r_frame_rate"])),
        "duration": float(data["format"]["duration"]),
        "codec": v["codec_name"],
        "rotation": rotation,
        "has_audio": any(s["codec_type"] == "audio" for s in data["streams"]),
    }


def cover_layout(width: int, height: int, focus: tuple[float, float], zoom: float) -> dict:
    """Same maths as coverLayout() in stock.ts."""
    s = max(FRAME_W / width, FRAME_H / height) * max(1.0, zoom)
    dw, dh = width * s, height * s
    return {"s": s, "dw": dw, "dh": dh, "left": (FRAME_W - dw) * focus[0], "top": (FRAME_H - dh) * focus[1]}


def crop_window(width: int, height: int, focus, zoom) -> tuple[float, float, float, float]:
    """The part of the source (x0, y0, x1, y1, source px) that ends up in the 1080x1920 frame."""
    l = cover_layout(width, height, focus, zoom)
    x0, y0 = -l["left"] / l["s"], -l["top"] / l["s"]
    return x0, y0, x0 + FRAME_W / l["s"], y0 + FRAME_H / l["s"]


def read_frames_gray(path: Path, start: float, count: int, width: int, height: int):
    """Decode `count` frames at the composition rate (24 fps) from `start` seconds, as uint8 gray arrays."""
    import numpy as np

    cmd = [
        "ffmpeg", "-v", "error", "-ss", f"{start:.4f}", "-i", str(path),
        "-vf", f"fps={FPS},scale={width}:{height}", "-frames:v", str(count),
        "-f", "rawvideo", "-pix_fmt", "gray", "-",
    ]
    raw = subprocess.run(cmd, check=True, capture_output=True).stdout
    n = len(raw) // (width * height)
    return np.frombuffer(raw[: n * width * height], np.uint8).reshape(n, height, width)
