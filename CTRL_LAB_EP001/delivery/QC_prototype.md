# QC report — prototype sequence v004 ("The claim check")

File: `renders/tests/CTRL_LAB_EP001_prototype_v004.mp4` (rendered by EffectCraft 0.10.0, Render Queue, H.264 + AAC)
Source: `project/CTRL_LAB_EP001_PROTO_v004.ecproj`. Date: 2026-10-16. **Internal quality gate only; not publishable.**

## Technical (measured with ffprobe/ffmpeg 6.1.1)

| Check | Result |
|---|---|
| Video codec | H.264 High, yuv420p |
| Resolution / rate | 1920×1080, r_frame_rate 30/1 = avg_frame_rate 30/1 (constant) |
| Frame count | 720 in the header, **720 decoded** (`-count_frames`) = 24.000 s |
| Audio | AAC-LC 48 kHz stereo, 24.000 s |
| Decode check | `ffmpeg -v error -f null`: no errors |
| Black frames | `blackdetect d=0.05 pix_th=0.03`: none |
| Loudness | **−16.0 LUFS integrated**, LRA 3.8 LU, true peak **−2.5 dBTP** (target −16 / ≤ −1) |
| Silence | Only 21.85–24.00 s (title hold, intended) |
| Project reopen | v003 reopened by `open_project`; `footage.check`: 32 checked, 0 missing; 6 comps intact |
| Timing | `tools/timeline.py`: 7 shots tile [0, 720) exactly; 9 VO lines, no overlaps |

## Visual inspection (frames extracted from the MP4, 18 points incl. every transition)

Passed: PATCH identical in both 3D scenes (same rig); contact shadows present; eyes lead and head follows; inspect, skeptical, error and interested expressions read clearly; the card → checklist object transform is continuous; the push-wipe fully covers for 2 frames at the cut; the illustrative label is visible for the whole reconstruction; type is crisp at 1080p.

Fixed during the gate (v001 → v004):
1. "Works every time." keyed in comp space after parenting → was off-card / overlapping. Now keyed relative to its parented position.
2. Check-mark short arm extended the wrong way (drew a slash).
3. Monitor and UI ran off the right edge; reframed camera and set.
4. Cursor covered the "Run" label.
5. Mono kickers raised from 19–24 px to 22–28 px for small-screen readability.
6. Wipe left a sliver of the next shot at the cut; now holds full cover for 2 frames.
7. Mix −15.4 → −16.0 LUFS (narration −0.6 dB).

## Not verified

- Narration naturalness and pronunciation **by ear** (no listening is possible in this environment) and by speech-to-text (no STT model is reachable). Durations and loudness are measured.
- Viewing on a real player at full speed. The frame-by-frame checks above were done instead; no claim of a real-time watch-through is made.
- Content claims: the prototype deliberately makes none about real products; the UI is a labelled reconstruction.
