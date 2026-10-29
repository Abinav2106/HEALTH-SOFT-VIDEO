"""Generate the "Find the Spark" narration, one WAV per scene, with Kokoro-82M (Apache-2.0,
open-weight TTS, run locally through kokoro-onnx). Voice: af_heart (a stock Kokoro voice — no
cloning, no imitation of any real person). Writes remotion/public/gofloaters/voice/ and
remotion/src/gofloaters/data/voice.json with the measured duration of every line.

Model files (GitHub release of kokoro-onnx, model-files-v1.0): kokoro-v1.0.onnx, voices-v1.0.bin

  python3 -I gofloaters/tools/make_voice.py <dir with kokoro-v1.0.onnx and voices-v1.0.bin>
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
import pyloudnorm as pyln
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "remotion/public/gofloaters/voice"
META = ROOT / "remotion/src/gofloaters/data/voice.json"
VOICE = "af_heart"
SPEED = 0.96  # a touch under default: conversational, never rushed
SR_OUT = 48000
LUFS = -16.0  # per line; the effects sit underneath

# Exact script. A line given as phonemes pins brand pronunciation (GO-floaters, clear "t").
LINES = {
    "s1": "One hidden Spark. Where will you look?",
    "s2": "Every hunt starts with a clue. Read it closely, and follow where it leads.",
    "s3": "Search the map. Explore the workspaces. Follow the clue until the right place comes into view.",
    "s4": "There it is. Spark found. Now see what your hunt could unlock.",
    "s5": "Your next hunt could unlock an Amazon gift card. Eligibility and terms apply.",
    "s6": "Where’s your Spark hiding? Enter the hunt with GoFloaters.",
}
OVERRIDES = {"GoFloaters": "ɡˈoʊflˌoʊtɚz"}


def phonemes(k: Kokoro, text: str) -> str:
    ph = k.tokenizer.phonemize(text, "en-us")
    for word, ipa in OVERRIDES.items():
        if word in text:
            auto = k.tokenizer.phonemize(word, "en-us").strip(" .")
            ph = ph.replace(auto, ipa)
    return ph


def compress(x: np.ndarray, sr: int, thresh_db=-26.0, ratio=3.0, attack=0.004, release=0.08) -> np.ndarray:
    """Gentle feed-forward compressor, then every line loudness-normalised to the same target
    (BS.1770) with a short look-ahead peak limiter, so the voice carries on a phone speaker."""
    a_att = np.exp(-1 / (attack * sr))
    a_rel = np.exp(-1 / (release * sr))
    env = np.zeros_like(x)
    e = 0.0
    for i, v in enumerate(np.abs(x)):
        e = a_att * e + (1 - a_att) * v if v > e else a_rel * e + (1 - a_rel) * v
        env[i] = e
    lvl = 20 * np.log10(env + 1e-9)
    over = np.maximum(0, lvl - thresh_db)
    y = x * 10 ** (-over * (1 - 1 / ratio) / 20)
    y *= 10 ** ((LUFS - pyln.Meter(sr).integrated_loudness(y)) / 20)
    return limit(y, sr)


def limit(x: np.ndarray, sr: int, ceiling_db=-1.0, look=0.002, release=0.05) -> np.ndarray:
    """Look-ahead brick-wall limiter: gain follows the windowed peak, released smoothly."""
    c = 10 ** (ceiling_db / 20)
    n = max(1, int(look * sr))
    peak = np.array([np.abs(x[max(0, i - n) : i + n + 1]).max() for i in range(len(x))])
    g = np.minimum(1.0, c / np.maximum(peak, 1e-9))
    a = np.exp(-1 / (release * sr))
    out = np.empty_like(g)
    cur = 1.0
    for i, v in enumerate(g):
        cur = v if v < cur else a * cur + (1 - a) * v
        out[i] = cur
    return np.clip(x * out, -c, c)


def main(model_dir: str) -> None:
    k = Kokoro(str(Path(model_dir) / "kokoro-v1.0.onnx"), str(Path(model_dir) / "voices-v1.0.bin"))
    OUT.mkdir(parents=True, exist_ok=True)
    meta = {"voice": VOICE, "speed": SPEED, "engine": "Kokoro-82M v1.0 (kokoro-onnx)", "lines": {}}
    for key, text in LINES.items():
        ph = phonemes(k, text)
        audio, sr = k.create(ph, voice=VOICE, speed=SPEED, is_phonemes=True, sentence_pause=0.32, clause_pause=0.12)
        # 24 kHz → 48 kHz (linear is plenty for speech this band-limited), 40 ms of air each side.
        n = int(len(audio) * SR_OUT / sr)
        audio = np.interp(np.linspace(0, len(audio) - 1, n), np.arange(len(audio)), audio).astype(np.float32)
        pad = np.zeros(int(0.04 * SR_OUT), np.float32)
        audio = np.concatenate([pad, audio, pad])
        audio = compress(audio, SR_OUT)
        sf.write(OUT / f"{key}.wav", audio, SR_OUT, subtype="PCM_16")
        meta["lines"][key] = {"text": text, "phonemes": ph, "seconds": round(len(audio) / SR_OUT, 3)}
        print(f"  {key}: {len(audio) / SR_OUT:.2f}s  {ph}")
    META.write_text(json.dumps(meta, indent=2, ensure_ascii=False) + "\n")


if __name__ == "__main__":
    main(sys.argv[1])
