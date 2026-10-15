"""Register a licensed, original stock clip for a Video 06 shot.

The source file is copied (never modified) into remotion/public/stock/, probed, hashed and checked
for 9:16 suitability, and its licence record is written into the stock manifest.

Example:
  .venv-video06/bin/python -I video06/tools/ingest.py --shot s01 --file ~/Downloads/pexels-1234.mp4 \
      --provider Pexels --asset-id 1234 --url https://www.pexels.com/video/...-1234/ --creator "Name" \
      --licence "Pexels License" --licence-status free-licence --source-in 2.5 --confirm-original
"""
from __future__ import annotations

import argparse
import hashlib
import os
import shutil
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import FPS, MAX_UPSCALE_FAIL, MAX_UPSCALE_WARN, SHOT_RANGES, STOCK_DIR, ffprobe, load_manifest, save_manifest  # noqa: E402


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--shot", required=True, choices=sorted(SHOT_RANGES))
    ap.add_argument("--file", required=True, type=Path)
    ap.add_argument("--provider", required=True)
    ap.add_argument("--asset-id", required=True)
    ap.add_argument("--url", required=True)
    ap.add_argument("--creator")
    ap.add_argument("--licence", required=True, help='e.g. "Pexels License", "Adobe Stock Standard"')
    ap.add_argument("--licence-status", required=True, choices=["free-licence", "purchased", "pending-approval"])
    ap.add_argument("--source-in", type=float, default=0.0, help="seconds into the source at the shot's first frame")
    ap.add_argument("--focus", type=float, nargs=2, default=None, metavar=("X", "Y"))
    ap.add_argument("--zoom", type=float, default=None)
    ap.add_argument("--confirm-original", action="store_true", help="assert this is the licensed original download, not a watermarked preview")
    ap.add_argument("--allow-upscale", action="store_true")
    a = ap.parse_args()

    if not a.confirm_original:
        print("Refusing: pass --confirm-original to assert this is the licensed, unwatermarked original.", file=sys.stderr)
        return 2
    src = a.file.expanduser().resolve()
    info = ffprobe(src)
    shot_frames = SHOT_RANGES[a.shot][1] - SHOT_RANGES[a.shot][0]
    # 25 fps sources are conformed (every source frame used once): plays at 24/25 = 0.96x.
    rate = round(FPS / info["fps"], 6) if abs(info["fps"] - 25) < 0.01 else 1.0
    need = a.source_in + shot_frames / FPS * rate
    upscale = max(1080 / info["width"], 1920 / info["height"])
    problems = []
    if need > info["duration"] + 1e-3:
        problems.append(f"clip is {info['duration']:.2f}s; shot needs sourceIn {a.source_in:.2f}s + {shot_frames / FPS:.2f}s")
    if upscale > MAX_UPSCALE_FAIL and not a.allow_upscale:
        problems.append(f"9:16 cover needs {upscale:.2f}x upscale of {info['width']}x{info['height']} (limit {MAX_UPSCALE_FAIL}x)")
    if problems:
        print("Refusing:\n  " + "\n  ".join(problems), file=sys.stderr)
        return 1
    if upscale > MAX_UPSCALE_WARN:
        print(f"warning: {upscale:.2f}x upscale for 9:16 — expect softness", file=sys.stderr)
    if rate != 1.0:
        print(f"note: {info['fps']:.0f} fps source conformed to 24 fps (playbackRate {rate})", file=sys.stderr)
    elif abs(info["fps"] - FPS) > 0.01 and abs(info["fps"] - 2 * FPS) > 0.01:
        print(f"note: source is {info['fps']:.3f} fps; it plays at native speed, sampled at 24 fps", file=sys.stderr)

    sha = hashlib.sha256(src.read_bytes()).hexdigest()
    STOCK_DIR.mkdir(parents=True, exist_ok=True)
    safe_id = "".join(ch if ch.isalnum() or ch in "-_" else "-" for ch in a.asset_id)
    dest = STOCK_DIR / f"{a.shot}__{a.provider.lower().replace(' ', '-')}_{safe_id}{src.suffix.lower()}"
    if dest.resolve() != src:
        dest.unlink(missing_ok=True)
        try:
            os.link(src, dest)  # same bytes, no second copy of a 100+ MB original
        except OSError:
            shutil.copy2(src, dest)

    m = load_manifest()
    shot = m["shots"][a.shot]
    shot.update({
        "file": dest.name,
        "width": info["width"],
        "height": info["height"],
        "fps": round(info["fps"], 3),
        "sourceIn": a.source_in,
        "playbackRate": rate,
        "source": {
            "provider": a.provider,
            "assetId": a.asset_id,
            "url": a.url,
            "creator": a.creator,
            "licence": a.licence,
            "licenceStatus": a.licence_status,
            "sha256": sha,
        },
    })
    if a.focus:
        shot["focus"] = list(a.focus)
    if a.zoom:
        shot["zoom"] = a.zoom
    save_manifest(m)
    print(f"{a.shot}: {dest.name} {info['width']}x{info['height']} @ {info['fps']:.3f} fps, {info['duration']:.2f}s, upscale {upscale:.2f}x, sha256 {sha[:16]}…")
    return 0


if __name__ == "__main__":
    sys.exit(main())
