"""Synthesise the restrained original sound effects for "Find the Spark".

No samples, no music (no approved music supplied), no ticking. Seeded, so every run writes identical files.
Writes 48 kHz / 16-bit stereo WAVs to remotion/public/gofloaters/audio/:

  hum.wav        soft aircraft hum, faded and ducked under narration in the composition
  swipe.wav      short brush swipe (highlight reveals, card expand)
  click.wav      small rounded map-selection click (pin drop)
  chime.wav      one warm discovery chime (the Spark glint)
  lift.wav       airy rising lift (gift asset reveal)
  accent.wav     quiet closing accent (ending settles)

  python3 -I gofloaters/tools/make_sfx.py
"""
from __future__ import annotations

import wave
from pathlib import Path

import numpy as np

SR = 48000
OUT = Path(__file__).resolve().parents[2] / "remotion/public/gofloaters/audio"
rng = np.random.default_rng(2610)


def t(sec: float) -> np.ndarray:
    return np.arange(int(SR * sec)) / SR


def band(x: np.ndarray, lo: float, hi: float) -> np.ndarray:
    spec = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    spec[(f < lo) | (f > hi)] = 0
    return np.fft.irfft(spec, len(x))


def env(n: int, attack: float, release: float) -> np.ndarray:
    """Raised-cosine attack/release envelope over n samples (seconds for the two ramps)."""
    e = np.ones(n)
    a, r = max(1, int(SR * attack)), max(1, int(SR * release))
    e[:a] = 0.5 - 0.5 * np.cos(np.linspace(0, np.pi, a))
    e[-r:] *= 0.5 + 0.5 * np.cos(np.linspace(0, np.pi, r))
    return e


def norm(x: np.ndarray, peak_db: float) -> np.ndarray:
    return x / (np.abs(x).max() + 1e-9) * 10 ** (peak_db / 20)


def stereo(x: np.ndarray, pan: np.ndarray | float = 0.0) -> np.ndarray:
    p = np.broadcast_to(np.asarray(pan, float), x.shape)
    return np.stack([x * np.sqrt(0.5 * (1 - p)), x * np.sqrt(0.5 * (1 + p))], axis=1)


def write(name: str, st: np.ndarray) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    data = (np.clip(st, -1, 1) * 32767).astype("<i2")
    with wave.open(str(OUT / name), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())
    print(f"  {name}: {len(st) / SR:.2f}s")


def hum() -> np.ndarray:
    """Soft aircraft hum: low filtered air and a faint engine tone, steady (envelope set in the
    composition), with slow drift so a long pass never sounds looped."""
    d = 6.0
    tt = t(d)
    air = band(rng.standard_normal(len(tt)), 120, 900)
    tone = 0.35 * np.sin(2 * np.pi * (118 + 4 * np.sin(2 * np.pi * 0.3 * tt)) * tt)
    tone += 0.12 * np.sin(2 * np.pi * 236 * tt)
    x = (air + tone) * (0.85 + 0.15 * np.sin(2 * np.pi * 0.4 * tt))
    return stereo(norm(x * env(len(tt), 0.05, 0.05), -6))


def swipe() -> np.ndarray:
    d = 0.42
    tt = t(d)
    x = band(rng.standard_normal(len(tt)), 900, 7000) * np.exp(-((tt - 0.12) ** 2) / 0.006)
    return stereo(norm(x * env(len(tt), 0.01, 0.12), -6), np.linspace(-0.3, 0.3, len(tt)))


def click() -> np.ndarray:
    d = 0.22
    tt = t(d)
    x = np.sin(2 * np.pi * 1350 * tt) * np.exp(-tt * 55) + 0.5 * np.sin(2 * np.pi * 680 * tt) * np.exp(-tt * 40)
    return stereo(norm(x * env(len(tt), 0.001, 0.05), -5))


def chime() -> np.ndarray:
    d = 2.4
    tt = t(d)
    x = np.zeros_like(tt)
    for f, a, dec in ((1046.5, 1.0, 2.2), (1568.0, 0.55, 2.8), (2093.0, 0.28, 3.6), (2637.0, 0.12, 4.5)):
        x += a * np.sin(2 * np.pi * f * tt) * np.exp(-tt * dec)
    return stereo(norm(x * env(len(tt), 0.004, 0.4), -3))


def lift() -> np.ndarray:
    d = 1.1
    tt = t(d)
    noise = rng.standard_normal(len(tt))
    lo = band(noise, 500, 1800) * (1 - tt / d)
    hi = band(noise, 1800, 6000) * (tt / d)
    tone = 0.25 * np.sin(2 * np.pi * (330 + 220 * tt / d) * tt)
    x = (lo + hi + tone) * np.sin(np.pi * tt / d) ** 1.5
    return stereo(norm(x, -5))


def accent() -> np.ndarray:
    d = 2.6
    tt = t(d)
    x = np.zeros_like(tt)
    for f, a in ((392.0, 1.0), (493.9, 0.7), (587.3, 0.6), (784.0, 0.3)):
        x += a * np.sin(2 * np.pi * f * tt) * np.exp(-tt * 1.6)
    return stereo(norm(x * env(len(tt), 0.02, 0.6), -5))


def main() -> None:
    for name, fn in (("hum.wav", hum), ("swipe.wav", swipe), ("click.wav", click),
                     ("chime.wav", chime), ("lift.wav", lift), ("accent.wav", accent)):
        write(name, fn())


if __name__ == "__main__":
    main()
