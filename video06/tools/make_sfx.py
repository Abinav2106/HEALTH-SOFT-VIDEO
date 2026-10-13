"""Synthesise Video 06's tactile SFX (original sounds, no third-party samples).

Writes 48 kHz / 24-bit stereo WAVs to remotion/public/audio/sfx/:
  tap.wav    soft low "thock" for title landings
  tick.wav   small bright click for label / node / CTA arrivals
  swell.wav  restrained air swell for the screen push and foreground rises
  bloom.wav  warm, short chord for the logo reveal

  .venv-video06/bin/python -I video06/tools/make_sfx.py
"""
from __future__ import annotations

import sys
import wave
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import REMOTION  # noqa: E402

SR = 48000
OUT = REMOTION / "public/audio/sfx"
rng = np.random.default_rng(606)


def t(sec: float) -> np.ndarray:
    return np.arange(int(SR * sec)) / SR


def band(noise: np.ndarray, lo: float, hi: float) -> np.ndarray:
    spec = np.fft.rfft(noise)
    f = np.fft.rfftfreq(len(noise), 1 / SR)
    spec[(f < lo) | (f > hi)] = 0
    return np.fft.irfft(spec, len(noise))


def fade(x: np.ndarray, ms_in=1.0, ms_out=8.0) -> np.ndarray:
    n_in, n_out = int(SR * ms_in / 1000), int(SR * ms_out / 1000)
    x = x.copy()
    x[:n_in] *= np.linspace(0, 1, n_in)
    x[-n_out:] *= np.linspace(1, 0, n_out)
    return x


def stereo(l: np.ndarray, r: np.ndarray | None = None) -> np.ndarray:
    return np.stack([l, l if r is None else r], axis=1)


def norm(x: np.ndarray, peak_db: float) -> np.ndarray:
    return x / np.max(np.abs(x)) * 10 ** (peak_db / 20)


def write(name: str, x: np.ndarray) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    pcm = np.clip(x, -1, 1)
    data = (pcm * (2 ** 23 - 1)).astype(np.int32)
    raw = b"".join(int(v).to_bytes(3, "little", signed=True) for v in data.reshape(-1))
    with wave.open(str(OUT / name), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(3)
        w.setframerate(SR)
        w.writeframes(raw)
    print(f"{name}: {len(x) / SR:.2f}s peak {20 * np.log10(np.max(np.abs(x))):.1f} dBFS")


def tap() -> np.ndarray:
    tt = t(0.18)
    f = 200 * np.exp(-tt / 0.05) + 120  # pitch falls 320→120 Hz
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.032)
    click = band(rng.standard_normal(len(tt)), 600, 2400) * np.exp(-tt / 0.004) * 0.35
    return stereo(norm(fade(body + click, 0.5, 20), -3))


def tick() -> np.ndarray:
    tt = t(0.09)
    tone = np.sin(2 * np.pi * 2350 * tt) * np.exp(-tt / 0.012) * 0.6
    grit = band(rng.standard_normal(len(tt)), 2500, 7000) * np.exp(-tt / 0.003)
    return stereo(norm(fade(tone + grit, 0.3, 10), -3))


def swell() -> np.ndarray:
    dur = 1.5
    tt = t(dur)
    env = np.where(tt < 0.95, np.sin(np.pi / 2 * tt / 0.95) ** 2, np.cos(np.pi / 2 * (tt - 0.95) / (dur - 0.95)) ** 2)
    chans = []
    for _ in range(2):  # decorrelated L/R for width without movement
        n = rng.standard_normal(len(tt))
        low = band(n, 180, 900)
        high = band(n, 900, 3200)
        mix = low + high * (tt / dur) * 0.6  # opens up slightly as it rises
        chans.append(mix * env)
    return norm(np.stack(chans, axis=1), -6)


def bloom() -> np.ndarray:
    tt = t(1.6)
    env = (1 - np.exp(-tt / 0.03)) * np.exp(-tt / 0.55)
    notes = [(196.0, 0.35), (392.0, 0.6), (587.33, 0.45), (783.99, 0.25)]
    l = sum(a * np.sin(2 * np.pi * f * tt) for f, a in notes)
    r = sum(a * np.sin(2 * np.pi * f * 1.0015 * tt + 0.3) for f, a in notes)
    return norm(stereo(l * env, r * env), -6)


if __name__ == "__main__":
    write("tap.wav", tap())
    write("tick.wav", tick())
    write("swell.wav", swell())
    write("bloom.wav", bloom())
