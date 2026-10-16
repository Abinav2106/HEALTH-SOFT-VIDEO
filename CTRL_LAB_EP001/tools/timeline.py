"""Shot manifest + timing validation + SRT captions (end-exclusive frame ranges, 30 fps).

  python -I tools/timeline.py scripts/prototype_manifest.json            # validate, print table
  python -I tools/timeline.py scripts/prototype_manifest.json --srt out.srt

Manifest JSON:
  {"total_frames": 720, "fps": 30, "vo_dir": "...", "vo_cues": {"P1a": 0.50, ...},
   "shots": [{"id", "chapter", "start", "end", ...}, ...]}       # start/end are frames, end exclusive
Rules enforced:
  - shots tile [0, total_frames) exactly: no gaps, no overlaps, first starts at 0, last ends at total
  - every VO line starts and ends inside the timeline and never overlaps the next line
  - (episode) total_frames == 28,800 when "episode": true
"""
from __future__ import annotations

import json
import math
import sys
import textwrap
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def tc(frames: int, fps: int = 30) -> str:
    s, f = divmod(frames, fps)
    m, s = divmod(s, 60)
    return f"{m:02d}:{s:02d}:{f:02d}"


def srt_tc(sec: float) -> str:
    ms = int(round(sec * 1000))
    h, ms = divmod(ms, 3600_000)
    m, ms = divmod(ms, 60_000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def load(path):
    man = json.loads(Path(path).read_text())
    vo_dir = ROOT / man["vo_dir"]
    lines = {l["id"]: l for l in json.loads((vo_dir / "lines.json").read_text())}
    return man, lines


def validate(man, lines) -> list[str]:
    errs = []
    fps, total = man["fps"], man["total_frames"]
    if man.get("episode") and total != 28_800:
        errs.append(f"episode total_frames {total} != 28800")
    shots = sorted(man["shots"], key=lambda s: s["start"])
    cursor = 0
    for s in shots:
        if s["start"] != cursor:
            errs.append(f"{s['id']}: starts at {s['start']}, expected {cursor} (gap/overlap)")
        if s["end"] <= s["start"]:
            errs.append(f"{s['id']}: empty or negative range")
        cursor = s["end"]
    if cursor != total:
        errs.append(f"shots end at frame {cursor}, timeline ends at {total}")
    cues = sorted(man["vo_cues"].items(), key=lambda kv: kv[1])
    for (a, ta), nxt in zip(cues, cues[1:] + [(None, None)]):
        if a not in lines:
            errs.append(f"VO {a}: no measured audio")
            continue
        end = ta + lines[a]["seconds"]
        if ta < 0 or end * fps > total:
            errs.append(f"VO {a}: {ta:.2f}–{end:.2f}s outside timeline")
        if nxt[0] and end > nxt[1]:
            errs.append(f"VO {a} ends {end:.2f}s after {nxt[0]} starts {nxt[1]:.2f}s")
    return errs


def captions(man, lines, max_chars=42) -> str:
    out, n = [], 0
    for cid, t in sorted(man["vo_cues"].items(), key=lambda kv: kv[1]):
        ln = lines[cid]
        text = ln["text"]
        if ln["speaker"] == "PATCH":
            text = "PATCH: " + text
        chunks = textwrap.wrap(text, max_chars)
        # at most two lines per caption; split long lines into timed parts by character share
        groups = [chunks[i:i + 2] for i in range(0, len(chunks), 2)]
        total_chars = sum(len(" ".join(g)) for g in groups)
        start = t
        for g in groups:
            share = len(" ".join(g)) / total_chars
            dur = ln["seconds"] * share
            n += 1
            out.append(f"{n}\n{srt_tc(start)} --> {srt_tc(start + dur)}\n" + "\n".join(g) + "\n")
            start += dur
    return "\n".join(out)


def main():
    man, lines = load(sys.argv[1])
    errs = validate(man, lines)
    fps = man["fps"]
    print(f"{'shot':<12}{'chapter':<10}{'start':>7}{'end':>7}  {'tc in':<9}{'tc out':<9}{'dur s':>6}")
    for s in sorted(man["shots"], key=lambda s: s["start"]):
        print(f"{s['id']:<12}{s.get('chapter',''):<10}{s['start']:>7}{s['end']:>7}  "
              f"{tc(s['start'], fps):<9}{tc(s['end'], fps):<9}{(s['end']-s['start'])/fps:>6.2f}")
    print(f"total {man['total_frames']} frames = {man['total_frames']/fps:.3f}s")
    vo = sum(lines[k]["seconds"] for k in man["vo_cues"])
    words = sum(len(lines[k]["text"].split()) for k in man["vo_cues"])
    print(f"narration {vo:.2f}s, {words} words ({words / (man['total_frames']/fps) * 60:.0f} wpm over runtime)")
    if "--srt" in sys.argv:
        p = Path(sys.argv[sys.argv.index("--srt") + 1])
        p.write_text(captions(man, lines))
        print("wrote", p)
    if errs:
        print("FAIL:\n  " + "\n  ".join(errs))
        sys.exit(1)
    print("TIMING OK")


if __name__ == "__main__":
    main()
