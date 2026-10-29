"""Transcribe narration WAVs (or an MP4's audio) with Whisper base.en via sherpa-onnx and compare
with the script — an objective check that no word is clipped, rushed or mispronounced past
recognition.

  python3 -I gofloaters/tools/check_speech.py <whisper model dir> <wav...>
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

import numpy as np
import sherpa_onnx
import soundfile as sf


def main(model_dir: str, files: list[str]) -> None:
    d = Path(model_dir)
    rec = sherpa_onnx.OfflineRecognizer.from_whisper(
        encoder=str(d / "base.en-encoder.onnx"), decoder=str(d / "base.en-decoder.onnx"),
        tokens=str(d / "base.en-tokens.txt"), language="en", task="transcribe", num_threads=4,
    )
    for f in files:
        a, sr = sf.read(f, dtype="float32", always_2d=True)
        a = a.mean(axis=1)
        if sr != 16000:
            n = int(len(a) * 16000 / sr)
            a = np.interp(np.linspace(0, len(a) - 1, n), np.arange(len(a)), a).astype(np.float32)
        out = []
        for i in range(0, len(a), 16000 * 28):  # whisper window
            s = rec.create_stream()
            s.accept_waveform(16000, a[i : i + 16000 * 28])
            rec.decode_stream(s)
            out.append(s.result.text.strip())
        print(f"{Path(f).name}: {' '.join(out)}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2:])
