"""Synthesise the GoFloaters logo animation's SFX (original sounds, no samples, no music).

Writes 48 kHz / 24-bit stereo WAVs to remotion/public/audio/gofloaters/:
  pop      soft rising bloop for the rings popping in
  sparkle  three quiet glints for the Spark Bone
  swish    short airy swish (cursor, ring morph, white wipe)
  dodge    quick bright whoosh for the bone's dodge
  boop     little falling boop when the bone lands
  snap     the catch: tight click plus a rising blip
  thump    soft low landing for the pin
  click    small UI click (choice, booking)
  ding     two-partial check chime
  swoosh   the plane's big left-to-right sweep
  tick     rhythmic letter landing
  land     plane landing / logo settle

"There's a workspace hiding in our name" (GF-HidingInOurName) adds:
  roll     the giant "o" rolling in: low rumble with a soft per-turn knock
  thock    its sudden stop
  squeak   Tilo's air-brake
  flop     ears catching up
  tink     the "6 seats" clue
  whoosh   the "o" pivoting edge-on / folding back
  whump    the doorway opening
  seat1-6  six rising chair ticks (countable)
  bump     the late "o" bumping over letter tops
  clunk    the late "o" dropping into its slot, crooked
  bonk     Tilo nose-first into the G

  python3 -I gofloaters/tools/make_sfx.py [out_dir]      (needs numpy only)
"""
from __future__ import annotations

import sys
import wave
from pathlib import Path

import numpy as np

SR = 48000
OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parents[2] / "remotion/public/audio/gofloaters"
rng = np.random.default_rng(2026)


def t(sec: float) -> np.ndarray:
    return np.arange(int(SR * sec)) / SR


def band(x: np.ndarray, lo: float, hi: float) -> np.ndarray:
    spec = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    spec[(f < lo) | (f > hi)] = 0
    return np.fft.irfft(spec, len(x))


def sweep_noise(dur: float, f_lo: np.ndarray, f_hi: np.ndarray, hop: int = 512) -> np.ndarray:
    """Noise through a band that moves over time (overlap-added windowed FFT bands)."""
    n = int(SR * dur)
    out = np.zeros(n + 2 * hop)
    win = np.hanning(2 * hop)
    src = rng.standard_normal(n + 2 * hop)
    frames = range(0, n, hop)
    for i, s in enumerate(frames):
        k = i / max(1, len(frames) - 1)
        lo = np.interp(k, np.linspace(0, 1, len(f_lo)), f_lo)
        hi = np.interp(k, np.linspace(0, 1, len(f_hi)), f_hi)
        out[s:s + 2 * hop] += band(src[s:s + 2 * hop] * win, lo, hi) * win
    return out[:n]


def tone(tt: np.ndarray, f: np.ndarray | float) -> np.ndarray:
    f = np.broadcast_to(f, tt.shape)
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def fade(x: np.ndarray, ms_in=1.0, ms_out=8.0) -> np.ndarray:
    n_in, n_out = max(1, int(SR * ms_in / 1000)), max(1, int(SR * ms_out / 1000))
    x = x.copy()
    x[:n_in] *= np.linspace(0, 1, n_in)
    x[-n_out:] *= np.linspace(1, 0, n_out)
    return x


def stereo(l: np.ndarray, r: np.ndarray | None = None) -> np.ndarray:
    return np.stack([l, l if r is None else r], axis=1)


def pan(x: np.ndarray, p: np.ndarray) -> np.ndarray:
    """Equal-power pan, p from -1 (left) to 1 (right), per sample."""
    a = (p + 1) * np.pi / 4
    return np.stack([x * np.cos(a), x * np.sin(a)], axis=1)


def norm(x: np.ndarray, peak_db: float) -> np.ndarray:
    return x / np.max(np.abs(x)) * 10 ** (peak_db / 20)


def write(name: str, x: np.ndarray) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    data = (np.clip(x, -1, 1) * (2 ** 23 - 1)).astype("<i4")
    raw = np.frombuffer(data.tobytes(), dtype=np.uint8).reshape(-1, 4)[:, :3].tobytes()
    with wave.open(str(OUT / f"{name}.wav"), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(3)
        w.setframerate(SR)
        w.writeframes(raw)
    print(f"{name}.wav: {len(x) / SR:.2f}s")


def pop() -> np.ndarray:
    tt = t(0.14)
    f = 260 + 520 * (1 - np.exp(-tt / 0.03))
    x = tone(tt, f) * np.sin(np.pi * np.clip(tt / 0.14, 0, 1)) ** 0.6 * np.exp(-tt / 0.06)
    return stereo(norm(fade(x, 2, 20), -3))


def sparkle() -> np.ndarray:
    tt = t(0.6)
    x = np.zeros_like(tt)
    for at, f in [(0.0, 3520), (0.09, 4186), (0.2, 4699)]:
        m = tt >= at
        u = tt[m] - at
        x[m] += np.sin(2 * np.pi * f * u) * np.exp(-u / 0.07) * 0.5
    return norm(stereo(x, np.roll(x, 240)), -6)


def swish() -> np.ndarray:
    dur = 0.32
    tt = t(dur)
    x = sweep_noise(dur, np.array([500, 1400, 900]), np.array([1800, 5200, 3000]))
    env = np.sin(np.pi * tt / dur) ** 2
    return norm(pan(x * env, np.linspace(-0.4, 0.4, len(tt))), -4)


def dodge() -> np.ndarray:
    dur = 0.22
    tt = t(dur)
    x = sweep_noise(dur, np.array([1200, 2600]), np.array([4000, 8000]))
    env = (tt / dur) ** 0.5 * np.exp(-((tt / dur) ** 3) * 4)
    whistle = tone(tt, 900 + 1400 * tt / dur) * env * 0.25
    return norm(pan(fade(x * env + whistle, 1, 30), np.linspace(0.3, -0.5, len(tt))), -3)


def boop() -> np.ndarray:
    tt = t(0.12)
    x = tone(tt, 420 - 220 * tt / 0.12) * np.exp(-tt / 0.04)
    return stereo(norm(fade(x, 1, 20), -3))


def snap() -> np.ndarray:
    tt = t(0.16)
    click = band(rng.standard_normal(len(tt)), 2500, 9000) * np.exp(-tt / 0.0025)
    blip = tone(tt, 1100 + 900 * (1 - np.exp(-tt / 0.015))) * np.exp(-tt / 0.035) * 0.55
    body = tone(tt, 180) * np.exp(-tt / 0.02) * 0.4
    return stereo(norm(fade(click + blip + body, 0.2, 20), -1))


def thump() -> np.ndarray:
    tt = t(0.22)
    body = tone(tt, 70 + 110 * np.exp(-tt / 0.03)) * np.exp(-tt / 0.06)
    air = band(rng.standard_normal(len(tt)), 200, 1200) * np.exp(-tt / 0.015) * 0.3
    return stereo(norm(fade(body + air, 0.5, 30), -2))


def click() -> np.ndarray:
    tt = t(0.07)
    tick_ = band(rng.standard_normal(len(tt)), 3000, 9000) * np.exp(-tt / 0.0018)
    blip = np.sin(2 * np.pi * 1850 * tt) * np.exp(-tt / 0.012) * 0.5
    return stereo(norm(fade(tick_ + blip, 0.2, 10), -2))


def ding() -> np.ndarray:
    tt = t(0.7)
    env = (1 - np.exp(-tt / 0.004)) * np.exp(-tt / 0.18)
    l = (np.sin(2 * np.pi * 1318.5 * tt) + 0.45 * np.sin(2 * np.pi * 1975.5 * tt)) * env
    r = (np.sin(2 * np.pi * 1319.5 * tt + 0.4) + 0.45 * np.sin(2 * np.pi * 1977 * tt)) * env
    return norm(stereo(l, r), -5)


def swoosh() -> np.ndarray:
    dur = 1.05
    tt = t(dur)
    u = tt / dur
    x = sweep_noise(dur, np.array([150, 400, 900, 500]), np.array([900, 2600, 5200, 2200]))
    env = np.sin(np.pi * np.clip(u / 0.55, 0, 1) / 2) ** 2 * np.exp(-np.clip(u - 0.55, 0, None) * 5)
    rumble = band(rng.standard_normal(len(tt)), 50, 160) * env * 0.5
    return norm(pan(x * env + rumble, np.clip(-1 + 2.2 * u, -1, 1)), -2)


def tick() -> np.ndarray:
    tt = t(0.08)
    x = np.sin(2 * np.pi * 1250 * tt) * np.exp(-tt / 0.014) + tone(tt, 260) * np.exp(-tt / 0.01) * 0.6
    return stereo(norm(fade(x, 0.3, 12), -3))


def land() -> np.ndarray:
    tt = t(0.5)
    body = tone(tt, 60 + 90 * np.exp(-tt / 0.04)) * np.exp(-tt / 0.09)
    air = sweep_noise(0.5, np.array([300, 150]), np.array([2400, 800])) * np.exp(-tt / 0.05) * 0.35
    shine = np.sin(2 * np.pi * 1568 * tt) * (1 - np.exp(-tt / 0.01)) * np.exp(-tt / 0.16) * 0.12
    return stereo(norm(fade(body + air + shine, 0.5, 40), -1))


def roll() -> np.ndarray:
    dur = 1.75
    tt = t(dur)
    u = tt / dur
    rumble = band(rng.standard_normal(len(tt)), 60, 380) * (0.35 + 0.65 * u)
    knocks = np.zeros_like(tt)
    for at in np.cumsum(np.full(6, 0.28)) - 0.2:
        m = tt >= at
        v = tt[m] - at
        knocks[m] += tone(v, 140 + 40 * np.exp(-v / 0.02)) * np.exp(-v / 0.03) * 0.5
    x = (rumble + knocks) * np.clip(u / 0.15, 0, 1)
    return norm(pan(fade(x, 5, 15), np.linspace(-0.7, 0.0, len(tt))), -6)


def thock() -> np.ndarray:
    tt = t(0.25)
    body = tone(tt, 95 + 160 * np.exp(-tt / 0.012)) * np.exp(-tt / 0.05)
    wood = np.sin(2 * np.pi * 620 * tt) * np.exp(-tt / 0.018) * 0.45
    air = band(rng.standard_normal(len(tt)), 400, 3000) * np.exp(-tt / 0.006) * 0.4
    return stereo(norm(fade(body + wood + air, 0.3, 30), -1))


def squeak() -> np.ndarray:
    dur = 0.3
    tt = t(dur)
    u = tt / dur
    f = 1500 + 700 * np.sin(np.pi * u) - 500 * u
    x = (tone(tt, f) + 0.3 * tone(tt, 2 * f)) * np.sin(np.pi * u) ** 0.7
    air = sweep_noise(dur, np.array([800, 400]), np.array([4000, 1800])) * np.sin(np.pi * u) * 0.6
    return norm(pan(fade(x * 0.5 + air, 2, 30), np.linspace(0.5, 0.2, len(tt))), -5)


def flop() -> np.ndarray:
    tt = t(0.16)
    x = tone(tt, 320 - 180 * tt / 0.16) * np.exp(-tt / 0.035)
    flap = band(rng.standard_normal(len(tt)), 300, 1600) * np.exp(-tt / 0.01) * 0.5
    return stereo(norm(fade(x + flap, 0.5, 20), -4))


def tink() -> np.ndarray:
    tt = t(0.35)
    x = (np.sin(2 * np.pi * 2093 * tt) + 0.3 * np.sin(2 * np.pi * 3136 * tt)) * np.exp(-tt / 0.07)
    return norm(stereo(x, np.roll(x, 120)), -6)


def whoosh() -> np.ndarray:
    dur = 0.4
    tt = t(dur)
    x = sweep_noise(dur, np.array([300, 900, 500]), np.array([1400, 4200, 2000]))
    env = np.sin(np.pi * tt / dur) ** 1.5
    return norm(pan(x * env, np.linspace(-0.2, 0.3, len(tt))), -4)


def whump() -> np.ndarray:
    tt = t(0.45)
    body = tone(tt, 55 + 70 * np.exp(-tt / 0.05)) * np.exp(-tt / 0.12)
    air = sweep_noise(0.45, np.array([200, 120]), np.array([1600, 600])) * np.exp(-tt / 0.08) * 0.5
    return stereo(norm(fade(body + air, 3, 40), -2))


def seat(k: int) -> np.ndarray:
    tt = t(0.1)
    f = 660 * 2 ** (k * 2 / 12)
    x = np.sin(2 * np.pi * f * tt) * np.exp(-tt / 0.02) + tone(tt, 240) * np.exp(-tt / 0.008) * 0.5
    p = np.full(len(tt), -0.35 if k < 3 else 0.35)
    return norm(pan(fade(x, 0.3, 12), p), -4)


def bump() -> np.ndarray:
    tt = t(0.1)
    x = tone(tt, 300 + 120 * np.exp(-tt / 0.01)) * np.exp(-tt / 0.025)
    return stereo(norm(fade(x, 0.3, 15), -5))


def clunk() -> np.ndarray:
    tt = t(0.22)
    body = tone(tt, 150 + 120 * np.exp(-tt / 0.01)) * np.exp(-tt / 0.04)
    rattle = np.sin(2 * np.pi * 880 * tt) * np.exp(-tt / 0.02) * 0.3 * (1 + np.sign(np.sin(2 * np.pi * 38 * tt))) / 2
    return stereo(norm(fade(body + rattle, 0.3, 25), -2))


def bonk() -> np.ndarray:
    tt = t(0.3)
    f = 520 * np.exp(-tt / 0.12) + 180
    x = tone(tt, f) * np.exp(-tt / 0.07)
    hit = band(rng.standard_normal(len(tt)), 600, 5000) * np.exp(-tt / 0.004) * 0.6
    return stereo(norm(fade(x + hit, 0.2, 30), -1))


if __name__ == "__main__":
    for fn in [pop, sparkle, swish, dodge, boop, snap, thump, click, ding, swoosh, tick, land,
               roll, thock, squeak, flop, tink, whoosh, whump, bump, clunk, bonk]:
        write(fn.__name__, fn())
    for k in range(6):
        write(f"seat{k + 1}", seat(k))
