# Video 06 — Input audit and conflict flags

Inputs received in the session (not committed — see §6):

| Input | File | Format | Notes |
|---|---|---|---|
| Storyboard "STORYBOARD – FINAL (9:16)" | `1.webp` | 1205×1305 WebP | Concept board. Generated people/environments: **casting and intent only, not production footage**. |
| Product reference | `2.webp` | 941×1672 WebP, lossy (4:2:0), no alpha | One composite photo of all three devices on plinths. |
| Official logo | `3.png` | 447×447 palette PNG, no alpha (white background) | Line-art elephant, orange "Healthsoft" wordmark, white tagline on orange bar. |

## 1. Storyboard conflicts — decisions needed

| # | Conflict | Where | Proposed handling (pending approval) |
|---|---|---|---|
| C1 | **Duration:** header and format bar say "30 SECONDS", but the panel timecodes run 0:00–0:32 (panel 12 = 0:30–0:32). The brief says "approximately 32 seconds". | Header, footer, panel 12 | Need a call: deliver a 32 s cut, or a 30 s cut for 30 s ad slots (trim ~1 s from the montage and ~1 s from the guidance beat). Default until told: **32 s**. |
| C2 | **No separate approved script.** The only copy source is the on-screen text in this board. No VO script was supplied. | — | Treat the board copy (§2) as provisional until confirmed. If another approved script or storyboard version exists, it wins, and its copy is not merged with this one. |
| C3 | **Possibly another storyboard version.** The brief asks to replace a "glowing virtual gallery", "holographic portraits" and "floating sci-fi UI". This board has none of those. Its panel 06 is already a real mother-and-daughter tablet interaction. Only the product light trails (07–09) and glowing icon nodes (10) are present. | Brief vs panel 06/10 | Following the attached FINAL board. Please confirm there is no newer version. |
| C4 | **Second tagline on the laptop screen:** "Care for a brighter tomorrow" + "Add to cart". This competes with the end line "Care that fits real life", and "Add to cart" leans towards implying a purchase. | Panel 01 | Not carried over. Corner-pin a neutral, editorial *selection* graphic (product options, no basket/checkout state). Its copy needs approval. |
| C5 | **Wrong hardware in the board:** a black/orange **ring**, a white **disc/puck**, and a dark-buttoned pendant on a lanyard. The product reference shows an **orange woven wristband with a heart plate**, a **clear-lid round pill dispenser with LCD**, and a **blue teardrop SOS pendant**. | Panels 01, 07, 08, 09, 12 | Board product renders are ignored. Only the original product files are used. |
| C6 | **Wrong logo treatment:** a filled orange elephant with a **navy** bold wordmark and navy tagline. The official logo is a **line-art** elephant with an **orange** wordmark and a **white tagline on an orange bar**. | Panel 12 | Official logo only, unaltered. |
| C7 | **Motion notes call for "subtle rotation" / "3D product animation".** The brief forbids invented rotations and hidden product surfaces. | Panels 07–09 | 2D reveals of the original cutouts: position/scale/opacity, line-mask reveals, contact shadow. No turntables. |
| C8 | **Decorative effects to remove:** orange light-trail orbits around products, glowing circular icon UI. | Panels 07–10 | Removed. One orange connecting line carries the decision thread instead. |
| C9 | **Montage readability:** panel 04 puts three text lines ("Their day.", "Simple routines", "Things they love") over three shots in 3 s, about 1 s each. Text must be still while read. | Panel 04 | Options: (a) keep three shots but hold one line ("Their day.") across them, or (b) extend to ~4 s. Needs a call. |
| C10 | **Claim check:** "Get started with support" implies Healthsoft provides setup support. "Understand your needs" implies a needs-assessment step. | Panel 10 | Confirm both are real services before they go on screen. |
| C11 | **Product names assumed from board labels:** Safety → *Guard Rail*, Health → *Health Guard*, Medication → *The Keeper*. The device mapping is inferred (pendant / band / dispenser). | Panels 07–09 | Confirm exact names, casing and mapping. |

## 2. Provisional on-screen copy (from the FINAL board, unchanged)

| Panel | Board time | Copy |
|---|---|---|
| 01 | 0:00–0:02 | You / *buy it.* |
| 02 | 0:02–0:04 | But… |
| 03 | 0:04–0:06 | They / *live with it.* |
| 04 | 0:06–0:09 | Their day. · Simple routines · Things they love |
| 05 | 0:09–0:12 | Their / *comfort.* |
| 06 | 0:12–0:16 | Their / *choice.* · Choose together. |
| 07 | 0:16–0:19 | Safety / Guard Rail |
| 08 | 0:19–0:22 | Health / Health Guard |
| 09 | 0:22–0:25 | Medication / The Keeper |
| 10 | 0:25–0:28 | Understand your needs · Choose the right fit · Get started with support |
| 11 | 0:28–0:30 | More good days ahead. |
| 12 | 0:30–0:32 | [official logo] · Care that fits real life. · Find your fit → |

No medical, outcome or customer claims appear in this copy. Keep it that way; the guidance beat must not show dashboards, readings, records or completed onboarding.

## 3. Asset gaps — needed before graphics finishing

| Need | Why the current file is not enough |
|---|---|
| **Original product PNGs, one per device, with alpha**, ideally ≥ 2000 px on the long edge | The reference is one 941 px-wide lossy composite with no alpha. The wristband overlaps a plinth, so a clean cutout would need hand-masking and would carry the plinth shadows. Large solo reveals at 1080×1920 would need ~2× upscaling. The brief says the *original PNGs* define the hardware, and these were not received. |
| **Vector logo (SVG/AI/EPS) or ≥ 2000 px transparent PNG** | The supplied logo is 447 px with a white background, too small for a clean end frame at 1080 px wide, and not keyable without edge fringing. |
| Brand typefaces (or approval of a substitute) | The board uses a serif italic + sans pairing. Live typography needs the real font files or a licensed substitute. |

## 4. Stock role plan (what the footage must cover)

| Role | Story beat | Board panel |
|---|---|---|
| R1 | Daughter browsing on a laptop (screen visible enough to corner-pin) | 01 |
| R2 | Natural pause / listening close-up of the daughter | 02 |
| R3 | Mother engaged in an everyday activity (e.g. watering plants) | 03, 04 |
| R4 | Comfortable home detail: tea, reading or a familiar hobby | 04, 05 |
| R5 | **Anchor:** mother and daughter discussing a tablet together | 06 |
| R6 | Natural closing interaction from the same shoot | 11 |

Products (07–09), guidance (10) and end frame (12) are graphics built from the original brand files.

## 5. Audio

Status: **pending.** No approved voice-over, music licence or SFX was supplied. Any temporary guide track will be labelled as such and not presented as final.

## 6. Repository note

The input files are not committed: this repository is **public**. Committing the internal storyboard, client brand files or licensed stock originals here would publish them. Please confirm where source media should live (private repo or private storage). Until then this branch tracks documentation and edit metadata only.
