"""Synthesise CTRL? LAB's original SFX (no third-party samples).

Writes 48 kHz / 24-bit stereo WAVs to assets/sfx/:
  tick.wav      small bright click: a label or node arrives
  tap.wav       soft low "thock": a title lands, PATCH taps the desk
  servo.wav     short servo whir: PATCH turns its head (0.35 s)
  servo_long.wav  longer whir: PATCH leans or points (0.7 s)
  air.wav       restrained air pass: a major transition
  found.wav     two-note warm chime: a useful discovery (orange indicator)
  error.wav     low double blip: a failure is isolated
  key.wav       mechanical key press: typing in a demo

  python -I tools/make_sfx.py
"""
from __future__ import annotations

import wave
from pathlib import Path

import numpy as np

SR = 48000
OUT = Path(__file__).resolve().parents[1] / "assets/sfx"
rng = np.random.default_rng(1)


def t(sec):
    return np.arange(int(SR * sec)) / SR


def band(x, lo, hi):
    s = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    s[(f < lo) | (f > hi)] = 0
    return np.fft.irfft(s, len(x))


def env(n, a, d):
    """Attack (s) then exponential decay with time-constant d (s)."""
    tt = np.arange(n) / SR
    e = np.exp(-np.maximum(tt - a, 0) / d)
    na = max(int(a * SR), 1)
    e[:na] *= np.linspace(0, 1, na)
    return e


def fade(x, ms_out=10.0):
    n = int(SR * ms_out / 1000)
    x = x.copy()
    x[-n:] *= np.linspace(1, 0, n)
    return x


def norm(x, peak_db):
    return x / np.max(np.abs(x)) * 10 ** (peak_db / 20)


def write(name, l, r=None):
    OUT.mkdir(parents=True, exist_ok=True)
    x = np.stack([l, l if r is None else r], axis=1)
    data = (np.clip(x, -1, 1) * (2**23 - 1)).astype("<i4")
    raw = data.astype("<i4").tobytes()
    b = np.frombuffer(raw, dtype=np.uint8).reshape(-1, 4)[:, :3].tobytes()
    with wave.open(str(OUT / name), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(3)
        w.setframerate(SR)
        w.writeframes(b)
    print(name, round(len(l) / SR, 3), "s")


def tick():
    n = int(SR * 0.08)
    x = band(rng.standard_normal(n), 2500, 9000) * env(n, 0.0005, 0.006)
    x += 0.4 * np.sin(2 * np.pi * 3100 * t(0.08)) * env(n, 0.0005, 0.01)
    return fade(norm(x, -9))


def tap():
    n = int(SR * 0.25)
    tt = t(0.25)
    f = 140 * np.exp(-tt * 18) + 70
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.001, 0.05)
    click = band(rng.standard_normal(n), 800, 4000) * env(n, 0.0005, 0.004) * 0.5
    return fade(norm(body + click, -8))


def servo(sec):
    n = int(SR * sec)
    tt = t(sec)
    shape = np.sin(np.pi * np.clip(tt / sec, 0, 1)) ** 0.7
    f = 520 + 160 * np.sin(np.pi * tt / sec)  # pitch rises then settles
    ph = 2 * np.pi * np.cumsum(f) / SR
    tone = 0.5 * np.sign(np.sin(ph)) * 0.3 + 0.6 * np.sin(ph) + 0.25 * np.sin(2 * ph)
    grit = band(rng.standard_normal(n), 1500, 6000) * 0.25
    x = band((tone + grit) * shape, 200, 7000)
    return fade(norm(x, -18), 30)


def air():
    sec = 0.9
    n = int(SR * sec)
    tt = t(sec)
    shape = np.sin(np.pi * tt / sec) ** 2
    noise = rng.standard_normal(n)
    # a band that sweeps upward: two crossfaded bands
    lo = band(noise, 300, 1500)
    hi = band(noise, 1500, 6000)
    mix = lo * (1 - tt / sec) + hi * (tt / sec) * 0.6
    l = mix * shape
    r = np.roll(mix, 240) * shape
    return fade(norm(l, -20), 40), fade(norm(r, -20), 40)


def found():
    sec = 1.2
    n = int(SR * sec)
    tt = t(sec)

    def note(f0, start):
        e = env(n, 0.004, 0.35) * (tt >= start)
        e = np.roll(env(n, 0.004, 0.35), int(start * SR))
        e[: int(start * SR)] = 0
        return (np.sin(2 * np.pi * f0 * tt) + 0.3 * np.sin(2 * np.pi * 2 * f0 * tt)) * e

    x = note(659.25, 0.0) + note(987.77, 0.11)  # E5 → B5, a fifth
    return fade(norm(x, -14), 60)


def error():
    sec = 0.45
    n = int(SR * sec)
    tt = t(sec)
    g = ((tt < 0.12) | ((tt > 0.18) & (tt < 0.30))).astype(float)
    g = np.convolve(g, np.ones(200) / 200, mode="same")
    x = (np.sin(2 * np.pi * 220 * tt) + 0.3 * np.sin(2 * np.pi * 330 * tt)) * g
    return fade(norm(x, -16), 20)


def key():
    n = int(SR * 0.06)
    x = band(rng.standard_normal(n), 1200, 7000) * env(n, 0.0003, 0.005)
    x += band(rng.standard_normal(n), 200, 900) * env(n, 0.0003, 0.012) * 0.6
    return fade(norm(x, -14), 5)


if __name__ == "__main__":
    write("tick.wav", tick())
    write("tap.wav", tap())
    write("servo.wav", servo(0.35))
    write("servo_long.wav", servo(0.7))
    write("air.wav", *air())
    write("found.wav", found())
    write("error.wav", error())
    write("key.wav", key())
