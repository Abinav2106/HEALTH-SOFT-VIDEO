# Assets (not committed — public repository)

| Folder | What goes here | Status |
|---|---|---|
| `brand/` | `gofloaters_logo_original.webp` (official logo, 2000×667, sha256 `e3e08661…0e7dfb`) and `storyboard_reference.webp`. Run `python3 tools/extract_tilo.py` to cut `tilo_full.png`, `speedlines.png` and `tilo_rig.json` from the logo. | Supplied |
| `gameplay/` | `gameplay.mp4`, the **real GoFloaters game screen recording** (Tilo Tour). It is shown cover-fit and never stretched, from 14.0 s to 35.3 s. Map film time to recording time in `motion/config.js → gameplay.segments`. | **Missing** |
| `workspaces/` | `workspace_01.jpg`, a **genuine listing photograph** for the workspace card in scene 06. | **Missing** |
| `plates/` | Optional. Not wired in yet. The city plates in scene 04 are built in code. | — |

When `gameplay/` and `workspaces/` are filled, `node tools/render.mjs` writes the final masters. Until then it refuses, and `--preview` writes `_PREVIEW` files with labelled slot panels.
