"""Scratch audio for the W&W film: synthesised SFX + robotic scratch dialogue for timing only.

  .venv-ww/bin/python -I ww/tools/make_audio.py

Writes remotion/public/ww/audio/{sfx,vo}/*.wav and remotion/src/ww/audio/audioManifest.json.
Dialogue uses espeak-ng formant voices (no recorded or imitated person). Each line is sped up until it
fits its slot in remotion/src/ww/dialogue.json. Replace with recorded VO before delivery.
"""
from __future__ import annotations

import json
import subprocess
import tempfile
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[2]
PUB = ROOT / "remotion/public"
OUT = PUB / "ww/audio"
DIALOGUE = ROOT / "remotion/src/ww/dialogue.json"
MANIFEST = ROOT / "remotion/src/ww/audio/audioManifest.json"
SR = 48000
rng = np.random.default_rng(45)

VOICES = {  # espeak-ng voice, base words-per-minute, pitch
    "caller": ("en-us+f3", 168, 55),
    "doubt": ("en-gb+m3", 150, 38),
    "voice": ("en-gb+m3", 138, 34),
}


def write(path: Path, x: np.ndarray) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    x = np.clip(x, -1, 1)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((x * 32767).astype("<i2").tobytes())


def t(sec: float) -> np.ndarray:
    return np.arange(int(SR * sec)) / SR


def env(n: int, a: float, d: float) -> np.ndarray:
    x = np.arange(n) / SR
    return np.minimum(1, x / max(a, 1e-4)) * np.exp(-x / d)


def band(noise: np.ndarray, lo: float, hi: float) -> np.ndarray:
    spec = np.fft.rfft(noise)
    fr = np.fft.rfftfreq(len(noise), 1 / SR)
    spec[(fr < lo) | (fr > hi)] = 0
    return np.fft.irfft(spec, len(noise))


def norm(x: np.ndarray, peak: float) -> np.ndarray:
    return x / (np.abs(x).max() + 1e-9) * peak


def sfx() -> dict[str, Path]:
    files = {}

    def mk(name: str, x: np.ndarray, peak: float) -> None:
        p = OUT / "sfx" / f"{name}.wav"
        write(p, norm(x, peak))
        files[name] = p

    # soft grid pulse: short sine blip with a little body
    tt = t(0.12)
    mk("pulse", (np.sin(2 * np.pi * 880 * tt) * 0.6 + np.sin(2 * np.pi * 1320 * tt) * 0.2) * env(len(tt), 0.002, 0.03), 0.35)
    # activation: two partials, gentle
    tt = t(0.6)
    mk("activate", (np.sin(2 * np.pi * 660 * tt) + 0.5 * np.sin(2 * np.pi * 990 * tt)) * env(len(tt), 0.004, 0.18), 0.5)
    # light swell into the cut
    tt = t(0.6)
    sw = band(rng.standard_normal(len(tt)), 300, 3000) * np.linspace(0, 1, len(tt)) ** 2.2
    sw[-int(0.03 * SR):] *= np.linspace(1, 0, int(0.03 * SR))
    mk("swell", sw, 0.3)
    # ring: two-tone soft phone ring (one burst)
    tt = t(0.42)
    r = np.sin(2 * np.pi * 740 * tt) * (tt < 0.18) + np.sin(2 * np.pi * 988 * tt) * (tt >= 0.22)
    r *= 0.5 + 0.5 * np.sin(2 * np.pi * 22 * tt)
    mk("ring", r * np.minimum(1, (0.42 - tt) / 0.04), 0.32)
    # connect / ui tap
    tt = t(0.08)
    mk("tap", band(rng.standard_normal(len(tt)), 900, 5000) * env(len(tt), 0.001, 0.012), 0.45)
    tt = t(0.25)
    mk("tick", np.sin(2 * np.pi * 1500 * tt) * env(len(tt), 0.001, 0.02), 0.3)
    # card rise: low air thock
    tt = t(0.35)
    th = band(rng.standard_normal(len(tt)), 80, 900) * env(len(tt), 0.01, 0.07) + np.sin(2 * np.pi * 110 * tt) * env(len(tt), 0.005, 0.06)
    mk("rise", th, 0.45)
    # panel expansion: rising filtered air
    tt = t(0.6)
    ex = band(rng.standard_normal(len(tt)), 200, 2400) * np.sin(np.pi * np.linspace(0, 1, len(tt))) ** 1.5
    mk("expand", ex, 0.4)
    # image stream: accelerating whoosh ~2.4 s
    tt = t(2.4)
    n = band(rng.standard_normal(len(tt)), 250, 6000)
    e = np.linspace(0, 1, len(tt)) ** 2.5 * np.minimum(1, (2.4 - tt) / 0.12)
    mk("stream", n * e, 0.42)
    # bookmark save: warm short chord
    tt = t(0.9)
    ch = sum(np.sin(2 * np.pi * fq * tt) for fq in (523.25, 659.25, 783.99)) * env(len(tt), 0.006, 0.3)
    mk("save", ch, 0.4)
    # closing wipe
    tt = t(0.7)
    wp = band(rng.standard_normal(len(tt)), 150, 1800) * np.sin(np.pi * np.linspace(0, 1, len(tt)))
    mk("wipe", wp, 0.35)
    return files


def speak(text: str, speaker: str, slot: float, path: Path) -> float:
    voice, wpm, pitch = VOICES[speaker]
    speed = wpm
    for _ in range(12):
        with tempfile.NamedTemporaryFile(suffix=".wav") as tmp:
            subprocess.run(["espeak-ng", "-v", voice, "-s", str(speed), "-p", str(pitch), "-w", tmp.name, text], check=True)
            with wave.open(tmp.name) as w:
                sr = w.getframerate()
                x = np.frombuffer(w.readframes(w.getnframes()), "<i2").astype(np.float32) / 32767
        # trim espeak's leading/trailing silence
        nz = np.where(np.abs(x) > 0.01)[0]
        x = x[max(nz[0] - int(0.01 * sr), 0): nz[-1] + int(0.04 * sr)]
        dur = len(x) / sr
        if dur <= slot or speed > 320:
            break
        speed = int(speed * min(1.25, dur / slot + 0.03))
    # resample to 48 kHz (linear is fine for scratch)
    xi = np.interp(np.arange(int(len(x) * SR / sr)) * sr / SR, np.arange(len(x)), x)
    write(path, norm(xi, 0.8))
    return len(xi) / SR


def main() -> None:
    files = sfx()
    rel = lambda p: str(p.relative_to(PUB))
    cues = []
    add = lambda name, at, vol: cues.append({"file": rel(files[name]), "at": round(at, 3), "volume": vol})
    # R1: restrained pulses that thin out with the field
    for at in (0.1, 0.42, 0.7, 0.95, 1.25, 1.5, 1.9, 2.35):
        add("pulse", at, 0.35)
    add("activate", 2.86, 0.55)
    add("swell", 3.33, 0.5)
    add("activate", 3.93, 0.35)
    add("ring", 4.38, 0.6)
    add("ring", 4.95, 0.45)
    add("tap", 5.5, 0.5)
    add("tick", 5.95, 0.35)
    add("rise", 12.62, 0.4)
    add("rise", 13.4, 0.55)
    add("tap", 14.26, 0.7)
    add("expand", 14.4, 0.6)
    add("rise", 15.28, 0.55)
    for at in (16.7, 16.9, 17.1):
        add("tick", at + 0.35, 0.4)
    add("expand", 19.4, 0.6)
    add("rise", 20.28, 0.55)
    add("tick", 21.75 + 0.3, 0.45)
    add("expand", 24.4, 0.6)
    add("rise", 25.25, 0.55)
    add("tap", 26.27, 0.7)
    for at in (26.45, 26.65, 26.85):
        add("tick", at, 0.4)
    add("expand", 29.75, 0.35)
    add("tap", 31.22, 0.5)
    for at in (31.3, 32.3, 32.5, 32.7, 32.9, 33.1, 33.3, 33.5):
        add("tick", at, 0.22)
    add("stream", 35.1, 0.6)
    add("save", 37.45, 0.5)
    add("wipe", 40.45, 0.55)
    add("tick", 41.3, 0.4)

    report = []
    for line in json.loads(DIALOGUE.read_text()):
        p = OUT / "vo" / f"{line['id']}.wav"
        slot = line["end"] - line["at"]
        dur = speak(line["text"], line["speaker"], slot, p)
        cues.append({"file": rel(p), "at": line["at"], "volume": 1.0})
        report.append((line["id"], line["speaker"], round(slot, 2), round(dur, 2), dur <= slot + 0.05))
    MANIFEST.write_text(json.dumps({"note": "scratch audio — generated by ww/tools/make_audio.py", "cues": cues}, indent=2) + "\n")
    for r in report:
        print("VO", *r)


if __name__ == "__main__":
    main()
