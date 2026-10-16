# CTRL? LAB — visual system (v1, built and tested in EffectCraft 0.10.0)

## Palette (working channel colours)

| Token | Hex | Use |
|---|---|---|
| Graphite | #17191C | Backgrounds, primary type on ceramic, PATCH shell |
| Ceramic | #F3F0E9 | Panels, cards, primary type on graphite, PATCH panels |
| Signal Orange | #FF6938 | **Actions, discoveries and the one detail that matters.** Never decorative. |
| Ink 2 | #5C5F66 | Secondary type on ceramic |
| Muted | #9A9893 | Tertiary type on graphite |
| Graphite 2 | #24272B | Wipe panels, layered dark surfaces |
| Rule | #D3CDC1 | Dividers and input borders on ceramic |
| Desk | #CFC8BC (3D, lit) | Desk surface; reads warm beige under the key light |

Ratio guide per frame: graphite and ceramic ≈ 90 %+, orange ≤ 5 % of the area.

## Type (fonts verified with `list_fonts`: both bundled with EffectCraft)

| Role | Font | Size @1080p | Tracking |
|---|---|---|---|
| Idea headline | Inter Black / Bold | 110–196 | −25 to −40 |
| Section title | Inter Bold | 64–66 | −25 |
| Row / label | Inter SemiBold | 50–54 | −10 to −15 |
| Kicker / evidence / technical label | JetBrains Mono Regular | 26–28 (min 22) | +120 to +220, caps |
| Code / file names | JetBrains Mono Regular | 30–32 | 0 |

Text stays live: every word on screen is an EffectCraft text layer.
Text is left-aligned at a shared x edge; centred only for the wordmark and title sub-lines.

## Motion (frames at 30 fps)

| Motion | Duration | Ease preset (`tools/ecbuild.py`) |
|---|---|---|
| Small UI response (click, tick) | 6–9 | `snap` (4 % out / 70 % in) |
| Element entrance | 10–16 | `out` (6 % / 88 %): fast start, long settle |
| Line reveal (mask) | 13 in / 7 out | `out` / `in` |
| Major transition / object transform | 15–24 | `inout` (65 % / 65 %) |
| Camera drift | whole shot | `soft`, ≤ 4 % push |

Recurring behaviours:
1. **PATCH inspects a claim**: eyes lead, head follows 4–6 frames later, then one eye narrows.
2. **Promise → checklist**: a glossy card unfolds into a ruled checklist (object continuity, no cut).
3. **Orange indicator**: PATCH's status light pulses when something useful is found; a matching orange underline marks the line to remember.

Spatial interpolation is forced to linear for position keys (prevents drift on holds).

## Transitions

- Object transform (card → panel) for a change of idea within one chapter.
- Graphite push-wipe (right → left, 2-frame full cover at the cut) between scene types.
- Hard cut between two PATCH angles of the same scene.
- No spins, no glow, no particle bursts.

## Evidence labels

- `ILLUSTRATIVE RECONSTRUCTION`: mono pill, top-left, on any recreated interface.
- `CLAIM, NOT YET TESTED`: orange mono under any claim before it is checked.
- `TESTED <date>`, `SOURCE: <doc>`: to be added once the subject is verified.
