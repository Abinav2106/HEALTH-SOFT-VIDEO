"""Synthesise Tilo's four quiet SFX (original sounds, no third-party samples).

Writes 48 kHz / 16-bit stereo WAVs to remotion/public/tilo/sfx/:
  whoosh.wav   soft flight pass for the entrance (band-passed noise sweep, left → right)
  tap.wav      soft landing tap for wheel contact
  chime.wav    delicate pickup chime
  confirm.wav  short two-note reward confirmation

  python3 -I tilo/tools/make_sfx.py      (needs numpy only)
"""
from __future__ import annotations

import wave
from pathlib import Path

import numpy as np

SR = 48000
OUT = Path(__file__).resolve().parents[2] / "remotion/public/tilo/sfx"
rng = np.random.default_rng(5150)


def t(sec: float) -> np.ndarray:
    return np.arange(int(SR * sec)) / SR


def fade(x: np.ndarray, ms_in: float = 2.0, ms_out: float = 20.0) -> np.ndarray:
    x = x.copy()
    n_in, n_out = int(SR * ms_in / 1000), int(SR * ms_out / 1000)
    x[:n_in] *= np.linspace(0, 1, n_in)
    x[-n_out:] *= np.linspace(1, 0, n_out)
    return x


def norm(x: np.ndarray, peak_db: float) -> np.ndarray:
    return x / np.max(np.abs(x)) * 10 ** (peak_db / 20)


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


def sweep_noise(sec: float, f_lo: float, f_hi: float, q: float = 0.35) -> np.ndarray:
    """Noise through a band-pass whose centre glides f_lo → f_hi (short-time FFT filtering)."""
    n = int(SR * sec)
    noise = rng.standard_normal(n)
    hop, win = 512, 2048
    out = np.zeros(n + win)
    window = np.hanning(win)
    freqs = np.fft.rfftfreq(win, 1 / SR)
    for i, start in enumerate(range(0, n - win, hop)):
        c = f_lo * (f_hi / f_lo) ** (start / max(1, n - win))
        bw = c * q
        gain = np.exp(-0.5 * ((freqs - c) / bw) ** 2)
        seg = np.fft.irfft(np.fft.rfft(noise[start : start + win] * window) * gain, win)
        out[start : start + win] += seg * window
    return out[:n]


def whoosh() -> None:
    sec = 0.75
    x = sweep_noise(sec, 380, 1500)
    tt = t(sec)
    env = np.sin(np.pi * np.clip(tt / sec, 0, 1)) ** 1.6 * np.exp(-tt * 1.2)
    x = fade(x * env, 4, 60)
    pan = np.clip(tt / sec, 0, 1)  # travels left → right with the plane
    write("whoosh.wav", norm(x * np.cos(pan * np.pi / 2), -9), norm(x * np.sin(pan * np.pi / 2 + 0.25), -9))


def tap() -> None:
    sec = 0.22
    tt = t(sec)
    body = np.sin(2 * np.pi * (150 - 50 * tt / sec) * tt) * np.exp(-tt * 34)
    click = sweep_noise(sec, 1800, 900, 0.6) * np.exp(-tt * 140)
    write("tap.wav", fade(norm(body + 0.35 * norm(click, 0), -8), 0.5, 30))


def chime() -> None:
    sec = 0.9
    tt = t(sec)
    x = np.zeros_like(tt)
    for f0, a, d in [(1568.0, 1.0, 5.5), (2349.3, 0.45, 7.0), (3136.0, 0.22, 9.0), (4186.0, 0.08, 12.0)]:
        x += a * np.sin(2 * np.pi * f0 * tt) * np.exp(-tt * d)
    x *= 1 - np.exp(-tt * 600)
    write("chime.wav", fade(norm(x, -12), 0.5, 80))


def confirm() -> None:
    sec = 0.6
    tt = t(sec)
    x = np.zeros_like(tt)
    for start, f0 in [(0.0, 880.0), (0.09, 1318.5)]:
        tl = np.clip(tt - start, 0, None)
        on = (tt >= start).astype(float)
        tone = np.sin(2 * np.pi * f0 * tl) + 0.3 * np.sin(2 * np.pi * f0 * 2 * tl)
        x += on * tone * np.exp(-tl * 7.5) * (1 - np.exp(-tl * 900))
    write("confirm.wav", fade(norm(x, -11), 0.5, 60))


if __name__ == "__main__":
    whoosh()
    tap()
    chime()
    confirm()
