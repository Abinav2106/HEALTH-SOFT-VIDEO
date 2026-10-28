#!/usr/bin/env python3
"""Render the GoFloaters 19 s score + SFX as one original, fully synthesised stereo WAV.

    python3 scripts/make_gf_score.py [out.wav]      (default public/gofloaters/audio/score.wav)

Timing comes from src/gofloaters/audio/cues.json. Arc: energetic groove → tension (café bed, 16th hats,
riser) → hard stop at the freeze → shimmer → bright reveal with one clean UI snap and a match chime →
short optimistic resolve on the end frame. No samples, no third-party music. Needs numpy.
"""
import json
import sys
import wave
from pathlib import Path

import numpy as np

SR = 48000
ROOT = Path(__file__).resolve().parent.parent
CUES = json.loads((ROOT / 'src/gofloaters/audio/cues.json').read_text())
FPS = CUES['fps']
N = int(CUES['duration'] / FPS * SR)
BEAT = 60 / CUES['bpm']
rng = np.random.default_rng(7)


def t_of(frame):
    return frame / FPS


def idx(sec):
    return int(round(sec * SR))


def env(n, a=0.002, d=0.2, shape=4.0):
    """Attack then exponential-ish decay over n samples."""
    t = np.arange(n) / SR
    att = np.clip(t / max(a, 1e-4), 0, 1)
    return att * np.exp(-shape * t / max(d, 1e-4))


def onepole_lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc = (1 - a) * v + a * acc
        y[i] = acc
    return y


def bandnoise(n, lo, hi):
    """Band-limited noise via FFT masking (fast, no scipy)."""
    spec = np.fft.rfft(rng.standard_normal(n))
    f = np.fft.rfftfreq(n, 1 / SR)
    spec[(f < lo) | (f > hi)] = 0
    y = np.fft.irfft(spec, n)
    return y / (np.max(np.abs(y)) + 1e-9)


def sweepnoise(n, f0, f1, width=0.5):
    """Noise through a band that sweeps f0→f1 (chunked FFT bands)."""
    out = np.zeros(n)
    chunk = 1024
    base = rng.standard_normal(n + chunk)
    for s in range(0, n, chunk):
        k = s / max(n - 1, 1)
        fc = f0 * (f1 / f0) ** k
        seg = base[s:s + chunk * 2]
        spec = np.fft.rfft(seg)
        f = np.fft.rfftfreq(len(seg), 1 / SR)
        spec[(f < fc * (1 - width)) | (f > fc * (1 + width))] = 0
        y = np.fft.irfft(spec, len(seg))[:chunk]
        out[s:s + chunk] = y[: min(chunk, n - s)]
    return out / (np.max(np.abs(out)) + 1e-9)


def add(buf, sig, at_sec, gain=1.0, pan=0.0):
    i = idx(at_sec)
    if i >= N:
        return
    sig = sig[: N - i]
    l, r = np.sqrt(0.5 * (1 - pan)), np.sqrt(0.5 * (1 + pan))
    buf[0, i:i + len(sig)] += sig * gain * l * 1.414
    buf[1, i:i + len(sig)] += sig * gain * r * 1.414


def db(x):
    return 10 ** (x / 20)


# ---- instruments -------------------------------------------------------------------------------------------
def kick(level=1.0):
    n = idx(0.32)
    t = np.arange(n) / SR
    f = 48 + 110 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return level * np.sin(ph) * env(n, 0.001, 0.32, 5) + 0.15 * level * bandnoise(n, 2000, 6000) * env(n, 0.0005, 0.01, 6)


def clap():
    n = idx(0.22)
    e = np.zeros(n)
    for o in (0, 0.009, 0.019):
        e[idx(o):] += env(n - idx(o), 0.0005, 0.12, 6)
    return bandnoise(n, 900, 5200) * e * 0.6


def hat(open_=False):
    n = idx(0.12 if open_ else 0.04)
    return bandnoise(n, 7000, 15000) * env(n, 0.0005, n / SR, 5) * 0.35


def pluck(freq, dur=0.35, bright=1.0, saw=False):
    n = idx(dur)
    t = np.arange(n) / SR
    if saw:
        x = sum(np.sin(2 * np.pi * freq * k * t) / k * np.exp(-t * (4 + k * 3 / bright)) for k in range(1, 9))
    else:
        x = np.sin(2 * np.pi * freq * t) + 0.35 * np.sin(4 * np.pi * freq * t) * np.exp(-t * 12) + 0.12 * np.sin(6 * np.pi * freq * t) * np.exp(-t * 20)
    return x * env(n, 0.002, dur, 5)


def pad(freqs, dur, attack=0.25):
    n = idx(dur)
    t = np.arange(n) / SR
    x = np.zeros(n)
    for f in freqs:
        for det in (-0.004, 0.0, 0.004):
            x += np.sin(2 * np.pi * f * (1 + det) * t + rng.uniform(0, 6.28))
    x /= len(freqs) * 3
    a = np.clip(t / attack, 0, 1)
    rel = np.clip((dur - t) / 0.5, 0, 1)
    return onepole_lp(x * a * rel, 2600)


def bell(freq, dur=0.9):
    n = idx(dur)
    t = np.arange(n) / SR
    x = np.sin(2 * np.pi * freq * t) * np.exp(-t * 5) + 0.4 * np.sin(2 * np.pi * freq * 2.76 * t) * np.exp(-t * 11) + 0.2 * np.sin(2 * np.pi * freq * 5.4 * t) * np.exp(-t * 18)
    return x * np.clip(t / 0.002, 0, 1)


def whoosh(dur, f0, f1, level=1.0):
    n = idx(dur)
    t = np.arange(n) / SR
    e = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 1.6
    return sweepnoise(n, f0, f1, 0.45) * e * level


def delay(x, sec=0.375, fb=0.35, mix=0.3):
    d = idx(sec)
    y = np.concatenate([x, np.zeros(d * 4)])
    for k in range(1, 5):
        y[d * k:d * k + len(x)] += x * (fb ** k) * mix / fb
    return y


def note(n):  # MIDI → Hz
    return 440 * 2 ** ((n - 69) / 12)


# ---- arrangement -------------------------------------------------------------------------------------------
music = np.zeros((2, N))
sfx = np.zeros((2, N))
amb = np.zeros((2, N))

groove_end = t_of(CUES['grooveEnd'])
tension = t_of(CUES['tensionFrom'])

# A: energetic groove, 0 → freeze (A minor, pumping eighths).
bass_line = [45, 45, 48, 45, 50, 45, 48, 52]  # A1 A1 C2 A1 D2 A1 C2 E2
b = 0
while b * BEAT < groove_end - 1e-6:
    t0 = b * BEAT
    add(music, kick(1.0 if t0 >= 0.01 else 0.8), t0, db(-7))
    if b % 2 == 1:
        add(music, clap(), t0, db(-12), pan=0.05)
    for h in range(4 if t0 >= tension else 2):
        th = t0 + h * BEAT / (4 if t0 >= tension else 2)
        if th < groove_end:
            add(music, hat(open_=(h == 1 and t0 < tension)), th, db(-20 if t0 < tension else -18), pan=0.35 if h % 2 else -0.25)
    for e8 in range(2):
        te = t0 + e8 * BEAT / 2
        if te < groove_end:
            add(music, pluck(note(bass_line[(b * 2 + e8) % 8]), 0.24, 0.6, saw=True), te, db(-10))
    if b % 8 == 0:
        add(music, pad([note(57), note(60), note(64), note(67)], min(4 * BEAT, groove_end - t0), 0.05), t0, db(-24))
    b += 1

# Tension: riser into the freeze, then a hard stop.
r0 = t_of(CUES['riserFrom'])
rn = idx(groove_end - r0)
rt = np.arange(rn) / SR
riser = sweepnoise(rn, 400, 6000, 0.35) * (rt / rt[-1]) ** 2 * 0.6 + np.sin(2 * np.pi * np.cumsum(220 * 2 ** (2 * rt / rt[-1])) / SR) * (rt / rt[-1]) ** 3 * 0.12
add(music, riser, r0, db(-14))

# Ambience: washing-machine hum under S01, café chatter + clinks S02–S03.
hum_n = idx(t_of(CUES['cafe']['from']))
ht = np.arange(hum_n) / SR
add(amb, (np.sin(2 * np.pi * 58 * ht) * 0.5 + bandnoise(hum_n, 80, 400) * 0.5) * (0.7 + 0.3 * np.sin(2 * np.pi * 1.3 * ht)), 0, db(-30))
c0, c1 = t_of(CUES['cafe']['from']), t_of(CUES['cafe']['to'])
cn = idx(c1 - c0)
chatter = bandnoise(cn, 250, 3200)
ct = np.arange(cn) / SR
mod = np.zeros(cn)
for _ in range(60):
    s = rng.uniform(0, c1 - c0)
    d = rng.uniform(0.15, 0.6)
    i0, i1 = idx(s), min(cn, idx(s + d))
    mod[i0:i1] += np.sin(np.linspace(0, np.pi, i1 - i0)) * rng.uniform(0.4, 1.0)
cafe = chatter * (0.35 + mod * 0.5) * np.clip(ct / 0.2, 0, 1) * np.clip((c1 - c0 - ct) / 0.1, 0, 1)
add(amb, cafe, c0, db(-21), pan=-0.1)
for _ in range(9):
    add(amb, bell(rng.uniform(2400, 3600), 0.25), c0 + rng.uniform(0.2, c1 - c0 - 0.3), db(-30), pan=rng.uniform(-0.6, 0.6))

# Punch-in / cut hits.
for f in CUES['hits']:
    add(sfx, whoosh(0.16, 3000, 600, 1.0), t_of(f) - 0.12, db(-17))
    add(sfx, kick(0.7), t_of(f), db(-13))

# Freeze: everything stops. A single low heartbeat, then a shimmer rising into the reveal.
fz, rs, rv = t_of(CUES['freeze']['at']), t_of(CUES['freeze']['resume']), t_of(CUES['reveal'])
add(sfx, kick(0.5), fz + 0.12, db(-20))
sn = idx(rv - rs)
st = np.arange(sn) / SR
shimmer = (bandnoise(sn, 5000, 14000) * 0.5 + sum(np.sin(2 * np.pi * note(m) * st) for m in (81, 85, 88)) / 3 * 0.5) * (st / st[-1]) ** 2.5
add(sfx, shimmer, rs, db(-16))

# B: reveal — bright, lighter groove in A major with plucked arpeggio.
add(sfx, whoosh(0.32, 500, 5000, 1.0), rv - 0.2, db(-14))
end_b = t_of(CUES['endWhoosh'])
add(music, pad([note(57), note(61), note(64), note(71)], end_b - rv + 0.3, 0.12), rv, db(-17))
arp = [69, 73, 76, 81, 76, 73, 71, 76]
k = 0
tb = rv
while tb < end_b:
    add(music, delay(pluck(note(arp[k % 8]), 0.3)), tb, db(-17), pan=0.25 if k % 2 else -0.25)
    if k % 2 == 0:
        add(music, kick(0.55), tb, db(-15))
        add(music, pluck(note([45, 45, 50, 52][(k // 4) % 4]), 0.4, 0.5, saw=True), tb, db(-15))
    add(music, hat(), tb + BEAT / 4, db(-26), pan=0.4)
    tb += BEAT / 2
    k += 1

# UI: card landings, touch, the one clean snap, the match chime, morph, book tap.
for f in CUES['ticks']:
    n = idx(0.03)
    add(sfx, bandnoise(n, 2500, 7000) * env(n, 0.0005, 0.03, 6) + pluck(note(93), 0.03) * 0.3, t_of(f), db(-26))
add(sfx, bandnoise(idx(0.02), 3000, 8000) * env(idx(0.02), 0.0005, 0.02, 6), t_of(CUES['touch']), db(-25))
sn_ = idx(0.09)
snap = bandnoise(sn_, 2500, 9000) * env(sn_, 0.0003, 0.015, 6) * 0.9 + np.sin(2 * np.pi * 1320 * np.arange(sn_) / SR) * env(sn_, 0.0005, 0.05, 6) * 0.5 + kick(0.6)[:sn_] * 0.5
add(sfx, snap, t_of(CUES['snap']), db(-9))
add(sfx, bell(note(88)), t_of(CUES['chime']), db(-15), pan=-0.1)
add(sfx, bell(note(93)), t_of(CUES['chime']) + 0.08, db(-15), pan=0.1)
add(sfx, whoosh(0.25, 1200, 3500, 0.7), t_of(CUES['morph']) - 0.05, db(-22))
add(sfx, bandnoise(idx(0.03), 2000, 6000) * env(idx(0.03), 0.0005, 0.03, 6), t_of(CUES['bookTap']), db(-17))

# End: airplane-ish swoosh across the wipe, then a short optimistic resolve.
add(sfx, whoosh(0.5, 300, 4200, 1.0), t_of(CUES['endWhoosh']), db(-13), pan=-0.3)
res = t_of(CUES['resolve'])
tail = N / SR - res
add(music, pad([note(45), note(52), note(57), note(61), note(64), note(71)], tail, 0.04), res, db(-12))
for i, m in enumerate((69, 73, 76, 81)):
    add(music, delay(pluck(note(m), 0.9)), res + i * 0.07, db(-15), pan=(-0.3, 0.3)[i % 2])
add(music, kick(0.8), res, db(-10))

# ---- mix ------------------------------------------------------------------------------------------------------
# Hard silence during the freeze (except the SFX heartbeat/shimmer that live in `sfx`).
i0, i1 = idx(fz), idx(rv - 0.2)
fade = np.ones(N)
fade[i0:i0 + idx(0.012)] = np.linspace(1, 0, idx(0.012))
fade[i0 + idx(0.012):i1] = 0
mix = (music + amb) * fade + sfx * db(-1)
# Gentle tail fade over the last 0.35 s.
fo = idx(0.35)
mix[:, -fo:] *= np.linspace(1, 0, fo) ** 1.5
mix = np.tanh(mix * 1.2) / np.tanh(1.2)
mix *= db(-1) / (np.max(np.abs(mix)) + 1e-9)

out = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / 'public/gofloaters/audio/score.wav'
out.parent.mkdir(parents=True, exist_ok=True)
pcm = (np.clip(mix.T, -1, 1) * 32767).astype('<i2')
with wave.open(str(out), 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print(f'wrote {out} ({N / SR:.2f} s)')
