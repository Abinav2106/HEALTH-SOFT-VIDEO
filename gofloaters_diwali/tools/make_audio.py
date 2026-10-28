"""Temporary audio for the Diwali Spark Hunt film: an original synthesized
score and sound effects, timed to the motion composition. Nothing is sampled
or licensed; replace the music stem once licensed music exists.

Writes out/audio/stems/{music,sfx}.wav and out/audio/GoFloaters_Diwali_temp_mix.wav
(48 kHz stereo, loudness-normalised to -14 LUFS, true peak -1 dBTP).
"""
import subprocess
import wave
from pathlib import Path

import numpy as np
from scipy import signal

SR = 48000
DUR = 40.0
N = int(SR * DUR)
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "out/audio"
rng = np.random.default_rng(2024)

BPM = 120
BEAT = 60 / BPM
BAR = 4 * BEAT
T0 = 2.0  # music enters with the takeoff

# ---------------------------------------------------------------- helpers
def buf():
    return np.zeros((2, N))


def place(dst, x, t, gain=1.0, pan=0.0):
    """Add mono x at time t (s) with equal-power pan (-1..1)."""
    i = int(round(t * SR))
    if i >= N:
        return
    if i < 0:
        x, i = x[-i:], 0
    x = x[: N - i]
    a = (pan + 1) * np.pi / 4
    dst[0, i : i + len(x)] += x * gain * np.cos(a)
    dst[1, i : i + len(x)] += x * gain * np.sin(a)


def env(n, a=0.005, d=0.2, curve=4.0):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-curve * np.maximum(0, t - a) / max(d, 1e-4))
    return e


def noise(dur):
    return rng.standard_normal(int(dur * SR))


def bp(x, lo, hi, order=2):
    sos = signal.butter(order, [lo, hi], "bandpass", fs=SR, output="sos")
    return signal.sosfilt(sos, x)


def lp(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, "lowpass", fs=SR, output="sos"), x)


def hp(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, "highpass", fs=SR, output="sos"), x)


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def tone(f, dur, partials=((1, 1.0),), phase_noise=0.0):
    t = np.arange(int(dur * SR)) / SR
    out = np.zeros_like(t)
    for k, a in partials:
        out += a * np.sin(2 * np.pi * f * k * t + phase_noise * rng.standard_normal())
    return out


def sweep(f0, f1, dur, shape=1.0):
    n = int(dur * SR)
    u = np.linspace(0, 1, n) ** shape
    f = f0 * (f1 / f0) ** u
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


# ------------------------------------------------------------ instruments
def kick(g=1.0):
    d = 0.42
    n = int(d * SR)
    t = np.arange(n) / SR
    f = 46 + 90 * np.exp(-t * 28)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7)
    x[:200] += np.linspace(1, 0, 200) * 0.5
    return x * g


def clap():
    x = bp(noise(0.25), 900, 3200) * env(int(0.25 * SR), 0.002, 0.12)
    return x / np.abs(x).max() * 0.6


def hat(open_=False):
    d = 0.18 if open_ else 0.05
    x = hp(noise(d), 7000) * env(int(d * SR), 0.001, d * 0.5)
    return x / (np.abs(x).max() + 1e-9) * 0.35


def tabla(f=180, g=1.0):
    """Membrane strike with the characteristic falling pitch (dha/na-like)."""
    d = 0.5
    n = int(d * SR)
    t = np.arange(n) / SR
    fr = f * (1 + 0.35 * np.exp(-t * 30))
    x = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t * 9)
    x += 0.4 * np.sin(2 * np.pi * np.cumsum(fr * 2.01) / SR) * np.exp(-t * 16)
    x[: int(0.004 * SR)] += bp(noise(0.004), 2000, 6000) * 0.6
    return x * g


def pluck(f, dur=0.9, bright=0.6):
    """Karplus-Strong string with a light buzzing bridge (sitar-ish colour)."""
    n = int(dur * SR)
    p = max(2, int(SR / f))
    line = rng.uniform(-1, 1, p) * bright + rng.uniform(-1, 1, p) * (1 - bright) * 0.3
    out = np.empty(n)
    idx = 0
    for i in range(n):
        v = line[idx]
        nxt = line[(idx + 1) % p]
        line[idx] = 0.996 * 0.5 * (v + nxt)
        out[i] = v
        idx = (idx + 1) % p
    out = out + 0.18 * np.tanh(4 * out)  # bridge buzz
    return out * env(n, 0.001, dur * 0.6, 3) * 0.6


def pad(notes, dur, g=0.18, cutoff=2400):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = np.zeros(n)
    for m in notes:
        for det in (-0.07, 0.0, 0.07):
            f = midi(m + det)
            ph = rng.uniform(0, 2 * np.pi)
            for k in range(1, 7):
                x += np.sin(2 * np.pi * f * k * t + ph * k) / k
    x = lp(x, cutoff)
    a = np.minimum(1, t / 0.35) * np.minimum(1, (dur - t) / 0.4).clip(0)
    return x / (np.abs(x).max() + 1e-9) * a * g


def bass(m, dur, g=0.5):
    f = midi(m)
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) + 0.12 * np.sin(2 * np.pi * 3 * f * t)
    return lp(x, 900) * env(n, 0.005, dur * 0.7, 2.5) * g


def bell(f, dur=2.0, g=0.4):
    parts = ((1, 1.0), (2.76, 0.45), (5.4, 0.25), (8.93, 0.12))
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = sum(a * np.sin(2 * np.pi * f * k * t) * np.exp(-t * (2.2 + k * 0.9)) for k, a in parts)
    x[: int(0.003 * SR)] *= np.linspace(0, 1, int(0.003 * SR))
    return x * g


def whoosh(dur, f0=300, f1=3000, g=0.5, rise=0.6):
    n = int(dur * SR)
    x = noise(dur)
    u = np.linspace(0, 1, n)
    out = np.zeros(n)
    hop = 1024
    for s in range(0, n, hop):
        fc = f0 * (f1 / f0) ** u[s]
        seg = x[max(0, s - 2048) : s + hop]
        out[s : s + hop] = bp(seg, fc * 0.6, min(fc * 1.6, SR / 2 - 100))[-len(out[s : s + hop]) :]
    shape = np.where(u < rise, (u / rise) ** 2, ((1 - u) / (1 - rise)) ** 1.5)
    return out / (np.abs(out).max() + 1e-9) * shape * g


def propeller(t0, t1, rate, gain, pan=lambda u: 0.0):
    """Engine buzz: a pulse train at the blade rate through a body resonance."""
    n = int((t1 - t0) * SR)
    u = np.linspace(0, 1, n)
    tt = t0 + u * (t1 - t0)
    r = np.array([rate(x) for x in tt[::64]])
    r = np.interp(np.arange(n), np.arange(0, n, 64)[: len(r)], r)
    ph = np.cumsum(r) / SR
    pulses = (np.sin(2 * np.pi * ph) ** 16) - 0.1
    body = bp(pulses + 0.08 * rng.standard_normal(n), 70, 1600)
    gg = np.array([gain(x) for x in tt[::64]])
    gg = np.interp(np.arange(n), np.arange(0, n, 64)[: len(gg)], gg)
    pp = np.array([pan(x) for x in tt[::64]])
    pp = np.interp(np.arange(n), np.arange(0, n, 64)[: len(pp)], pp)
    a = (pp + 1) * np.pi / 4
    x = body / (np.abs(body).max() + 1e-9)
    return np.stack([x * gg * np.cos(a), x * gg * np.sin(a)]), int(t0 * SR)


def reverb(x, secs=1.8, mix=0.25):
    n = int(secs * SR)
    ir = rng.standard_normal((2, n)) * np.exp(-np.arange(n) / SR * 3.2)
    ir = lp(ir, 6000)
    ir /= np.sqrt((ir**2).sum(1, keepdims=True))
    wet = np.stack([signal.fftconvolve(x[c], ir[c])[:N] for c in range(2)])
    return x + wet * mix


def ramp(t, pts):
    """Piecewise-linear gain automation, pts = [(time, gain), ...]."""
    xs, ys = zip(*pts)
    return np.interp(t, xs, ys)


# ------------------------------------------------------------------ score
def music():
    m = buf()
    # D major: D A Bm G, one chord per bar
    prog = [(50, [62, 66, 69]), (45, [61, 64, 69]), (47, [62, 66, 71]), (43, [62, 67, 71])]
    motif = [74, 76, 78, 81, 78, 76, 74, 69]  # pentatonic phrase
    bars = int((DUR - T0) / BAR) + 1
    for b in range(bars):
        tb = T0 + b * BAR
        root, chord = prog[b % 4]
        m_pad = pad(chord, BAR + 0.4, 0.13)
        place(m, m_pad, tb, 1.0, 0.0)
        for i in range(8):  # eighth-note bass
            place(m, bass(root if i % 4 != 3 else root + 7, BEAT / 2 * 0.9), tb + i * BEAT / 2, 0.55)
        for i in range(4):
            tk = tb + i * BEAT
            place(m, kick(), tk, 0.9)
            if i in (1, 3):
                place(m, clap(), tk, 0.45, 0.05)
            place(m, hat(), tk + BEAT / 2, 0.5, 0.3)
            place(m, tabla(200 if i % 2 else 150, 0.35), tk + BEAT * 0.75, 1.0, -0.25)
        for i in range(16):
            place(m, hat() * 0.4, tb + i * BEAT / 4, 0.35, -0.35)
        if b % 2 == 0:
            for i, n in enumerate(motif):
                place(m, pluck(midi(n), 0.7), tb + i * BEAT / 2, 0.42, 0.2)
        else:
            for i, n in enumerate(motif[:4][::-1]):
                place(m, pluck(midi(n - 12), 0.8), tb + i * BEAT, 0.38, -0.15)
    t = np.arange(N) / SR
    # section dynamics: enter, travel, game (lighter), suspense (filtered + ducked),
    # chase build, silence at contact, warm return, resolution
    g = ramp(t, [(0, 0), (1.99, 0), (2.0, 0.55), (4.8, 0.75), (5.0, 1.0), (13.9, 1.0), (14.2, 0.72),
                 (22.8, 0.72), (23.4, 0.12), (27.8, 0.12), (28.2, 0.6), (29.95, 0.9), (30.0, 0.0),
                 (30.2, 0.0), (30.25, 0.55), (32.0, 0.6), (34.8, 0.65), (35.2, 1.0), (37.9, 1.0), (38.05, 0.0), (40, 0)])
    dry = m * g
    muffled = np.stack([lp(m[c], 500) for c in range(2)]) * ramp(t, [(0, 0), (23.0, 0), (23.4, 0.5), (27.8, 0.5), (28.3, 0), (40, 0)])
    m = dry + muffled
    # build into the contact: snare roll + riser
    for i in range(16):
        place(m, clap() * (0.2 + i / 20), 28.0 + i * BEAT / 4 + (i >= 8) * 0, 0.6)
    for i in range(8):
        place(m, clap() * (0.4 + i / 14), 29.0 + i * BEAT / 8 * 2, 0.6)
    place(m, sweep(180, 1400, 2.0, 1.6) * np.linspace(0, 0.18, int(2.0 * SR)), 28.0, 1.0)
    # suspense bed: drone + heartbeat
    place(m, pad([38, 45, 50], 5.6, 0.11, 900), 23.0, 1.0)
    for k in range(5):
        place(m, kick(0.32), 23.4 + k * 1.0, 0.8)
        place(m, kick(0.2), 23.62 + k * 1.0, 0.8)
    # Diwali swell after contact
    place(m, pad([62, 66, 69, 76], 2.2, 0.2, 3800), 30.2, 1.0)
    # resolution: final chord rings to the end
    place(m, pad([50, 57, 62, 66, 69, 74], 2.4, 0.26, 3200), 38.0, 1.0)
    place(m, kick(1.0), 38.0, 1.0)
    place(m, bass(38, 2.0, 0.7), 38.0, 1.0)
    for i, n in enumerate([74, 78, 81, 86]):
        place(m, pluck(midi(n), 1.6), 38.0 + i * 0.06, 0.32, -0.2 + i * 0.13)
    m *= ramp(t, [(0, 1), (39.2, 1), (40, 0)])
    m[:, (t >= 30.0) & (t < 30.2)] = 0  # the beat of silence
    return reverb(m, 1.6, 0.18)


# -------------------------------------------------------------------- sfx
def sfx():
    s = buf()
    t = np.arange(N) / SR

    # 01 propeller idle, cut for the micro-silence after the tap
    def idle_gain(x):
        if 1.32 <= x < 1.62:
            return 0.0
        return 0.10 * min(1, x / 0.4)

    x, i0 = propeller(0.0, 2.0, lambda x: 22, idle_gain)
    s[:, i0 : i0 + x.shape[1]] += x
    # camera tap: click + thump + glassy ping
    tap = hp(noise(0.006), 2500) * 0.9
    place(s, tap, 1.32, 0.9)
    place(s, tone(140, 0.08) * env(int(0.08 * SR), 0.001, 0.04), 1.32, 0.7)
    place(s, bell(2800, 0.25, 0.15), 1.322, 1.0, 0.2)

    # 02 takeoff: propeller spins up, carries the climb, banks away
    def rate(x):
        return 22 + 52 * np.clip((x - 2.0) / 1.3, 0, 1) ** 1.6 + 12 * np.clip((x - 4.3) / 0.7, 0, 1)

    def gain(x):
        g = 0.12 + 0.3 * np.clip((x - 2.0) / 0.9, 0, 1)
        return g * (1 - np.clip((x - 4.4) / 0.6, 0, 1)) * 0.9

    x, i0 = propeller(1.62, 5.0, rate, gain, lambda x: 0.6 * np.clip((x - 4.3) / 0.7, 0, 1))
    s[:, i0 : i0 + x.shape[1]] += x
    place(s, whoosh(1.3, 200, 2400, 0.55, 0.45), 2.05, 1.0)
    place(s, whoosh(0.9, 400, 5000, 0.6, 0.55), 4.45, 1.0)

    # 03 location pulses light up as a soft pentatonic run
    notes = [74, 76, 78, 81, 83, 86, 88, 90, 93, 95, 98, 100, 102, 105, 107, 110, 112]
    for i, n in enumerate(notes):
        place(s, bell(midi(n - 12), 0.5, 0.05), 5.25 + i * 0.055, 1.0, -0.6 + i * 0.075)
    place(s, whoosh(0.7, 300, 2600, 0.3, 0.5), 7.2, 1.0, -0.3)
    # 04 montage: dive, route wipes, rush into the game
    place(s, whoosh(0.6, 500, 6000, 0.5, 0.7), 8.55, 1.0)
    place(s, whoosh(0.45, 600, 4000, 0.4, 0.4), 10.55, 1.0, 0.4)
    place(s, whoosh(0.45, 600, 4000, 0.4, 0.4), 12.15, 1.0, 0.4)
    place(s, whoosh(0.9, 200, 7000, 0.55, 0.9), 13.15, 1.0)

    # 05-06 game UI: enter, taps, copy ticks, card open / close
    def ui_tap(g=0.35):
        click = bp(noise(0.05), 1800, 5000) * env(int(0.05 * SR), 0.001, 0.01)
        return (click + tone(1800, 0.05) * env(int(0.05 * SR), 0.001, 0.02) * 0.3) * g

    def pop(f=600, g=0.4):
        return sweep(f, f * 2.2, 0.09) * env(int(0.09 * SR), 0.002, 0.05) * g

    place(s, pop(400, 0.35), 14.02)
    for tt in (15.3, 16.6, 19.6, 22.7):
        place(s, ui_tap(), tt, 1.0, 0.1)
    for i, tt in enumerate((18.25, 18.75, 19.25)):
        place(s, ui_tap(0.22), tt, 1.0, -0.2 + i * 0.2)
    place(s, pop(500, 0.45), 20.2)
    place(s, whoosh(0.35, 800, 3000, 0.18, 0.5), 20.2)
    place(s, pop(900, 0.3)[::-1], 22.25)

    # 07 fog: wind bed, Spark chimes, Tilo notices
    wind = lp(noise(8.2), 700) * (1 + 0.5 * np.sin(2 * np.pi * 0.23 * np.arange(int(8.2 * SR)) / SR))
    wind = wind / np.abs(wind).max() * ramp(np.arange(len(wind)) / SR, [(0, 0), (1.2, 0.22), (7.2, 0.22), (8.2, 0)])
    place(s, wind, 23.0, 1.0, -0.2)
    place(s, bell(midi(93), 1.4, 0.18), 24.8, 1.0, 0.35)
    place(s, bell(midi(97), 1.0, 0.08), 26.4, 1.0, 0.35)
    place(s, ui_tap(0.25), 25.55, 1.0, -0.1)

    # 08 chase: engine winds up, reverse swell into a beat of silence, discovery
    def chase_rate(x):
        return 30 + 60 * np.clip((x - 28.0) / 2.0, 0, 1) ** 1.5

    x, i0 = propeller(27.9, 30.0, chase_rate, lambda x: 0.25 * np.clip((x - 27.9) / 0.3, 0, 1))
    s[:, i0 : i0 + x.shape[1]] += x
    rev = whoosh(0.6, 300, 5000, 0.5, 0.95)
    place(s, rev, 29.4, 1.0)
    s[:, (t >= 30.0) & (t < 30.2)] = 0
    for k, n in enumerate([86, 90, 93, 98]):
        place(s, bell(midi(n), 2.6, 0.32 - k * 0.05), 30.2 + k * 0.02, 1.0, -0.3 + k * 0.2)
    place(s, tone(55, 1.2) * env(int(1.2 * SR), 0.01, 0.6, 3) * 0.6, 30.2)
    place(s, whoosh(1.0, 2000, 300, 0.35, 0.15), 30.3)

    # 09 reward: card pop, sheen, foil scratch strokes, completion
    place(s, pop(500, 0.5), 32.22)
    place(s, bell(midi(98), 0.6, 0.06), 32.55, 1.0, 0.3)
    strokes = 6
    for k in range(strokes):
        d = (33.95 - 32.95) / strokes
        sc = bp(noise(d), 2500, 7500) * (0.6 + 0.4 * np.abs(np.sin(np.linspace(0, 9 * np.pi, int(d * SR)))))
        sc *= np.hanning(len(sc))
        place(s, sc * 0.5, 32.95 + k * d, 1.0, -0.3 + 0.12 * k)
    place(s, bell(midi(86), 1.2, 0.22), 34.05, 1.0)
    place(s, bell(midi(93), 1.4, 0.2), 34.17, 1.0)
    place(s, whoosh(0.5, 400, 2500, 0.2, 0.4), 34.7)

    # 10 fly-by with doppler + pan, logo chime, CTA
    def fb_rate(x):
        u = np.clip((x - 35.0) / 1.5, 0, 1)
        return 78 - 26 * u

    def fb_gain(x):
        u = np.clip((x - 35.0) / 1.5, 0, 1)
        return 0.35 * np.sin(np.pi * u) ** 0.8

    x, i0 = propeller(35.0, 36.6, fb_rate, fb_gain, lambda x: -0.8 + 1.4 * np.clip((x - 35.0) / 1.5, 0, 1))
    s[:, i0 : i0 + x.shape[1]] += x
    place(s, bell(midi(81), 2.4, 0.22), 36.9, 1.0, -0.1)
    place(s, bell(midi(88), 2.4, 0.18), 37.02, 1.0, 0.1)
    place(s, pop(600, 0.3), 37.75)
    return reverb(s, 1.2, 0.12)


def silence_gate():
    """True silence for the Spark-contact beat and the micro-silence after the
    tap (tails included), with 6 ms fades so nothing clicks."""
    t = np.arange(N) / SR
    g = np.ones(N)
    for a, b, keep in ((30.0, 30.2, 0.0), (1.42, 1.6, 0.0)):
        f = 0.006
        g = np.minimum(g, np.clip(np.maximum((a - t) / f, (t - b) / f), keep, 1))
    return g


def write(path, x):
    path.parent.mkdir(parents=True, exist_ok=True)
    y = np.clip(x, -1, 1)
    pcm = (y.T * 32767).astype(np.int16)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def main():
    mus = music()
    fx = sfx()
    peak = max(np.abs(mus).max(), np.abs(fx).max(), 1e-9)
    write(OUT / "stems/music.wav", mus / peak * 0.5)
    write(OUT / "stems/sfx.wav", fx / peak * 0.5)
    mix = mus * 0.62 + fx * 0.9
    mix = np.tanh(mix / np.abs(mix).max() * 1.2) * 0.9
    mix *= silence_gate()
    raw = OUT / "stems/mix_raw.wav"
    write(raw, mix)
    final = OUT / "GoFloaters_Diwali_temp_mix.wav"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-af", "loudnorm=I=-14:TP=-1:LRA=11",
                    "-ar", str(SR), str(final)], check=True)
    print(final)


if __name__ == "__main__":
    main()
