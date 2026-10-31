"""Synthesise the sample's audio (original sounds, no third-party samples) into public/audio/.

  pad.wav     12 s warm chord bed (music)
  whoosh.wav  airy sweep for scene transitions
  pop.wav     soft pop for shapes landing
  chime.wav   bright two-note chime for the logo lock-up

Run from the project root:  python3 -I tools/make_audio.py   (needs numpy)
"""
from __future__ import annotations

import wave
from pathlib import Path

import numpy as np

SR = 48000
OUT = Path(__file__).resolve().parents[1] / "public" / "audio"
rng = np.random.default_rng(1920)


def t(sec: float) -> np.ndarray:
    return np.arange(int(SR * sec)) / SR


def norm(x: np.ndarray, peak_db: float) -> np.ndarray:
    return x / (np.max(np.abs(x)) + 1e-9) * 10 ** (peak_db / 20)


def edge_fade(x: np.ndarray, ms_in: float, ms_out: float) -> np.ndarray:
    x = x.copy()
    a, b = int(SR * ms_in / 1000), int(SR * ms_out / 1000)
    if a:
        x[:a] *= np.linspace(0, 1, a)
    if b:
        x[-b:] *= np.linspace(1, 0, b)
    return x


def write(name: str, left: np.ndarray, right: np.ndarray | None = None) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    st = np.stack([left, left if right is None else right], axis=1)
    pcm = (np.clip(st, -1, 1) * 32767).astype("<i2")
    with wave.open(str(OUT / name), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print("wrote", OUT / name)


def pad() -> None:
    sec = 12.0
    tt = t(sec)
    chord = [130.81, 196.0, 261.63, 329.63, 392.0]  # C3 G3 C4 E4 G4
    left = np.zeros_like(tt)
    right = np.zeros_like(tt)
    for i, f in enumerate(chord):
        lfo = 1 + 0.002 * np.sin(2 * np.pi * (0.13 + 0.05 * i) * tt)
        tone = np.sin(2 * np.pi * f * lfo * tt) + 0.25 * np.sin(2 * np.pi * 2 * f * tt)
        pan = 0.5 + 0.35 * np.sin(i * 1.7)
        left += tone * (1 - pan)
        right += tone * pan
    swell = 0.75 + 0.25 * np.sin(2 * np.pi * tt / 6.0 - np.pi / 2)
    env = np.minimum(1, tt / 1.5) * np.minimum(1, (sec - tt) / 2.0) * swell
    write("pad.wav", norm(left * env, -16), norm(right * env, -16))


def bandpassed_noise(sec: float, lo: float, hi: float) -> np.ndarray:
    n = int(SR * sec)
    spec = np.fft.rfft(rng.standard_normal(n))
    f = np.fft.rfftfreq(n, 1 / SR)
    spec[(f < lo) | (f > hi)] = 0
    return np.fft.irfft(spec, n)


def whoosh() -> None:
    sec = 0.7
    tt = t(sec)
    x = bandpassed_noise(sec, 300, 5000)
    sweep = np.sin(2 * np.pi * np.cumsum(400 + 2400 * (tt / sec) ** 2) / SR)
    env = np.sin(np.pi * np.clip(tt / sec, 0, 1)) ** 2
    x = (x * 0.8 + 0.15 * sweep) * env
    pan = tt / sec
    write("whoosh.wav", edge_fade(norm(x * (1 - 0.6 * pan), -12), 2, 40), edge_fade(norm(x * (0.4 + 0.6 * pan), -12), 2, 40))


def pop() -> None:
    sec = 0.25
    tt = t(sec)
    f = 520 * np.exp(-tt * 18) + 180
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 26)
    write("pop.wav", edge_fade(norm(x, -10), 0.5, 20))


def chime() -> None:
    sec = 1.6
    tt = t(sec)
    x = np.zeros_like(tt)
    for start, f0 in [(0.0, 1046.5), (0.11, 1568.0)]:
        tl = np.clip(tt - start, 0, None)
        on = (tt >= start).astype(float)
        for mult, amp in [(1, 1.0), (2.01, 0.35), (3.0, 0.12)]:
            x += on * amp * np.sin(2 * np.pi * f0 * mult * tl) * np.exp(-tl * (3.5 + mult))
    write("chime.wav", edge_fade(norm(x, -11), 0.5, 120))


if __name__ == "__main__":
    pad()
    whoosh()
    pop()
    chime()
