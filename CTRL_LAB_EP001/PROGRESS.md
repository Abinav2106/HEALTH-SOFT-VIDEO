# CTRL? LAB EP001 — PROGRESS

Checkpoint: 2026-10-16. **State: prototype gate PASSED; full episode BLOCKED on the reference subject.**

## Completion state

| Step | State | Evidence |
|---|---|---|
| Workspace + EffectCraft control | Done | EffectCraft 0.10.0 built from source (`/home/user/storytold/effectcraft`, commit 853a1b6, `cargo build --release -p effectcraft-cli`, 15 m 47 s). Driven through its real MCP server (`effectcraft-cli mcp --autosave`, protocol 2025-06-18) by `tools/ecmcp.py`. Headless, CPU renderer (no GPU adapter in this container). No desktop window, so no live bridge/screenshot mode. |
| Fonts | Done | `list_fonts`: Inter (all weights) and JetBrains Mono Regular, both bundled with EffectCraft (OFL-1.1). |
| Reference analysis | **Blocked** | YouTube unreachable from this environment (proxy `CONNECT 403`; no transcript or index entry). See `reference/reference_analysis.md`. Subject is **not** known; the "seven AI tricks" outline is not used. |
| PATCH character | Done (v1) | `assets/patch/PATCH_character_spec.md`; rig built natively in EffectCraft Advanced 3D by `tools/patch_rig.py` (29 layers: primitives + bevelled extrusions on 3D control nulls); performance helpers `tools/patch_anim.py`. Turnaround stills: `renders/tests/patch_v1_yaw*.png`. |
| Visual system | Done (v1) | `assets/graphics/visual_system.md`; easing presets in `tools/ecbuild.py`. |
| Narration pipeline | Done | Kokoro-82M local TTS (`tools/narrate.py`), per-line −17 LUFS, ceiling −1.5 dBFS, durations measured into `lines.json`. Voices: narrator `af_heart`, PATCH `am_puck`. Not verified by ear or by speech-to-text (no STT model reachable). |
| SFX | Done | 8 original synthesised sounds, `assets/sfx/` (`tools/make_sfx.py`). |
| Prototype (24 s) | **Done, passed gate** | Native project `project/CTRL_LAB_EP001_PROTO_v004.ecproj`. Render `renders/tests/CTRL_LAB_EP001_prototype_v004.mp4`. QC: `delivery/QC_prototype.md`. Manifest `scripts/prototype_manifest.json`, captions `captions/prototype_v004.srt`. |
| Full script (1,900–2,200 words) | Not started | Needs the verified subject. |
| Chapters 01–07, master 28,800 frames | Not started | Needs the script. Tooling ready: `tools/timeline.py` enforces exact tiling of [0, 28800) and VO non-overlap. |
| Final MP4, SRT, YouTube package | Not started | — |

## Measured facts for planning

- EffectCraft H.264 + AAC export: 1920×1080, constant 30/1, frame count exact (720/720 on the prototype).
- Render speed (CPU): ≈ 0.9 s per frame on mixed 3D/2D content → ≈ 7–8 h for 28,800 frames. Render chapter by chapter in the background.
- Build speed: the whole prototype project is generated in ≈ 8 s from `tools/build_prototype.py`.

## Blockers (owner input needed)

1. **Reference subject.** Provide the video's title + transcript (paste into `reference/transcript.txt`), or a local copy, or allow `www.youtube.com`, `i.ytimg.com`, `*.googlevideo.com` in the environment's network settings.
2. **Approval of the PATCH v1 design and the two synthetic voices** (reversible; production continues with them unless changed).

## Resume from this checkpoint

```sh
cd /home/user/HEALTH-SOFT-VIDEO/CTRL_LAB_EP001/tools
# EffectCraft binary (rebuild if the container was recycled):
#   git clone https://github.com/storytold/effectcraft /home/user/storytold/effectcraft
#   (cd /home/user/storytold/effectcraft && cargo build --release -p effectcraft-cli)
# TTS env (if recycled): python3 -m venv /home/user/tts/.venv && /home/user/tts/.venv/bin/pip install kokoro-onnx soundfile pyloudnorm numpy
#   + model files from github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0 into /home/user/tts/models
/home/user/tts/.venv/bin/python build_prototype.py --stills --render   # rebuilds the prototype end to end
```

Next actions once the subject arrives: fill `reference/reference_analysis.md` → write `scripts/EP001_script.md` (chapter by chapter, recurring example) → `narrate.py` per chapter → chapter builders reusing `ecbuild` / `patch_rig` / `patch_anim` → render + inspect each chapter → `EP001_Master` (28,800 frames) → final export + QC.
