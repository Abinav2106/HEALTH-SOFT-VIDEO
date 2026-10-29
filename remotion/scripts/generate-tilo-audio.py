"""Synthesise the Tilo sound design from code (original material, no third-party samples).

    python3 -I scripts/generate-tilo-audio.py

Writes 48 kHz mono 16-bit WAVs to public/tilo/audio/. Deterministic (fixed seeds).
Requires: numpy
"""
import wave
from pathlib import Path

import numpy as np

SR = 48000
OUT = Path(__file__).resolve().parent.parent / 'public' / 'tilo' / 'audio'


def band(noise: np.ndarray, lo: float, hi: float, slope: float = 2.0) -> np.ndarray:
    """Soft band-pass in the frequency domain (smooth skirts, no ringing)."""
    spec = np.fft.rfft(noise)
    f = np.fft.rfftfreq(len(noise), 1 / SR)
    resp = 1 / (1 + (lo / np.maximum(f, 1)) ** (2 * slope)) / (1 + (f / hi) ** (2 * slope))
    return np.fft.irfft(spec * resp, len(noise))


def norm(x: np.ndarray, peak: float) -> np.ndarray:
    return x / (np.abs(x).max() + 1e-9) * peak


def fade(x: np.ndarray, a: float, r: float) -> np.ndarray:
    n = len(x)
    env = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    if na:
        env[:na] = np.sin(np.linspace(0, np.pi / 2, na)) ** 2
    if nr:
        env[-nr:] = np.cos(np.linspace(0, np.pi / 2, nr)) ** 2
    return x * env


def write(name: str, x: np.ndarray) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    data = (np.clip(x, -1, 1) * 32767).astype('<i2')
    with wave.open(str(OUT / name), 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())
    print('wrote', OUT / name, f'{len(x) / SR:.2f}s')


def propeller_bed(seconds: float = 24.5) -> np.ndarray:
    rng = np.random.default_rng(11)
    t = np.arange(int(seconds * SR)) / SR
    f0 = 72 * (1 + 0.004 * np.sin(2 * np.pi * 0.23 * t))
    phase = 2 * np.pi * np.cumsum(f0) / SR
    engine = sum(np.sin(n * phase + n) / n**1.3 for n in range(1, 7))
    blade = 1 - 0.28 * (0.5 + 0.5 * np.sin(2 * np.pi * 24 * t))  # blade-pass flutter
    air = band(rng.standard_normal(len(t)), 120, 900)
    x = norm(engine, 0.5) * blade + norm(air, 0.35) * (0.85 + 0.15 * np.sin(2 * np.pi * 0.11 * t))
    return fade(norm(x, 0.7), 0.25, 0.6)


def wind(seconds: float = 6.0) -> np.ndarray:
    rng = np.random.default_rng(23)
    t = np.arange(int(seconds * SR)) / SR
    x = band(rng.standard_normal(len(t)), 350, 2200, 1.5)
    gust = 0.6 + 0.4 * np.sin(2 * np.pi * 0.35 * t - 1.2) ** 2
    swell = np.sin(np.pi * t / seconds) ** 1.5
    return norm(x * gust * swell, 0.6)


def chime(seconds: float = 2.6) -> np.ndarray:
    t = np.arange(int(seconds * SR)) / SR
    partials = [(1318.5, 1.0, 2.2), (1975.5, 0.55, 1.6), (2637.0, 0.25, 1.1), (659.25, 0.3, 2.6)]
    x = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t * (3.2 / d)) for f, a, d in partials)
    x2 = np.zeros_like(x)  # soft second strike a fifth up, 90 ms later
    off = int(0.09 * SR)
    x2[off:] = 0.6 * sum(a * np.sin(2 * np.pi * f * 1.5 * t[: len(t) - off]) * np.exp(-t[: len(t) - off] * (3.6 / d)) for f, a, d in partials[:2])
    attack = np.minimum(1, t / 0.006)
    return norm((x + x2) * attack, 0.55)


def slide(seconds: float = 0.55) -> np.ndarray:
    rng = np.random.default_rng(5)
    t = np.arange(int(seconds * SR)) / SR
    x = band(rng.standard_normal(len(t)), 500, 3500, 1.5)
    env = np.sin(np.pi * np.clip(t / seconds, 0, 1)) ** 2 * np.exp(-t * 1.5)
    return norm(x * env, 0.5)


def click(seconds: float = 0.12) -> np.ndarray:
    rng = np.random.default_rng(3)
    t = np.arange(int(seconds * SR)) / SR
    tone = np.sin(2 * np.pi * 1750 * t) * np.exp(-t * 70) + 0.5 * np.sin(2 * np.pi * 2600 * t) * np.exp(-t * 110)
    tick = band(rng.standard_normal(len(t)), 2000, 7000) * np.exp(-t * 180)
    return norm(tone + 0.3 * norm(tick, 1), 0.5)


def unfold(seconds: float = 0.7) -> np.ndarray:
    """Short paper / air movement for the marker opening: a soft flutter plus a breathy lift."""
    rng = np.random.default_rng(17)
    t = np.arange(int(seconds * SR)) / SR
    flutter = band(rng.standard_normal(len(t)), 1200, 6000, 1.5) * (0.55 + 0.45 * np.sin(2 * np.pi * 31 * t) ** 2)
    air = band(rng.standard_normal(len(t)), 250, 1400, 1.5)
    env = np.minimum(1, t / 0.02) * np.exp(-t * 5.5)
    return norm((0.6 * norm(flutter, 1) + 0.5 * norm(air, 1)) * env, 0.45)


if __name__ == '__main__':
    write('propeller_bed.wav', propeller_bed())
    write('wind.wav', wind())
    write('marker_chime.wav', chime())
    write('sheet_slide.wav', slide())
    write('ui_click.wav', click())
    write('marker_unfold.wav', unfold())
