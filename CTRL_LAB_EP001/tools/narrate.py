"""Generate narration lines with Kokoro-82M (local, Apache-2.0) and measure them.

Input: a JSON list of {"id", "speaker": "NARRATOR"|"PATCH", "text"}.
Output: one 48 kHz mono WAV per line in OUT_DIR, plus lines.json with exact durations.

  /home/user/tts/.venv/bin/python -I tools/narrate.py scripts/prototype_lines.json assets/voiceover/prototype
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

MODELS = Path("/home/user/tts/models")
VOICES = {
    "NARRATOR": dict(voice="af_heart", speed=1.0, lang="en-us"),
    "PATCH": dict(voice="am_puck", speed=0.97, lang="en-us"),
}
SR_OUT = 48000


def resample(x: np.ndarray, sr_in: int, sr_out: int) -> np.ndarray:
    n = int(round(len(x) * sr_out / sr_in))
    return np.interp(np.linspace(0, len(x) - 1, n), np.arange(len(x)), x).astype(np.float32)


def trim(x: np.ndarray, sr: int, thresh_db=-45.0, pad=0.04) -> np.ndarray:
    a = np.abs(x)
    th = 10 ** (thresh_db / 20) * a.max()
    idx = np.where(a > th)[0]
    if not len(idx):
        return x
    s = max(idx[0] - int(pad * sr), 0)
    e = min(idx[-1] + int(pad * sr * 2), len(x))
    return x[s:e]


LINE_LUFS = -17.0  # every line at the same loudness; the mix sets the final level
CEIL = 10 ** (-1.5 / 20)


def level(x: np.ndarray, sr: int) -> np.ndarray:
    import pyloudnorm as pyln

    x = x - x.mean()
    lufs = pyln.Meter(sr).integrated_loudness(x)
    x = x * 10 ** ((LINE_LUFS - lufs) / 20)
    # soft knee above -6 dBFS keeps peaks under the ceiling without audible pumping
    knee = 10 ** (-6 / 20)
    a = np.abs(x)
    over = a > knee
    a[over] = knee + (CEIL - knee) * np.tanh((a[over] - knee) / (CEIL - knee))
    return (np.sign(x) * a).astype(np.float32)


def main(src: str, out_dir: str) -> None:
    k = Kokoro(str(MODELS / "kokoro-v1.0.onnx"), str(MODELS / "voices-v1.0.bin"))
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    lines = json.loads(Path(src).read_text())
    results = []
    for ln in lines:
        v = VOICES[ln["speaker"]]
        samples, sr = k.create(ln["text"], voice=v["voice"], speed=v["speed"], lang=v["lang"])
        x = trim(np.asarray(samples, dtype=np.float32), sr)
        x = resample(x, sr, SR_OUT)
        x = level(x, SR_OUT)
        path = out / f"{ln['id']}.wav"
        sf.write(path, x, SR_OUT, subtype="PCM_24")
        dur = len(x) / SR_OUT
        results.append({**ln, "file": str(path), "seconds": round(dur, 4),
                        "frames30": int(np.ceil(dur * 30)), "voice": v["voice"]})
        print(f"{ln['id']:>8} {ln['speaker']:<8} {dur:6.2f}s  {ln['text'][:60]}")
    (out / "lines.json").write_text(json.dumps(results, indent=2))


if __name__ == "__main__":
    main(*sys.argv[1:3])
