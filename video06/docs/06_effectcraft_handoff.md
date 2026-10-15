# Healthsoft Video 06 — Effectcraft build sheet (paste into the Claude Desktop + Chrome conversation)

You are operating Effectcraft in my Chrome tab. Build Healthsoft Video 06 inside my project, following this sheet exactly.

**How to work:**
- Use only Effectcraft's real controls. Take a screenshot after each step to confirm it.
- Ask me before deleting anything.
- Avoid actions that open browser dialogs.

## 0. Set up
1. Duplicate "Comp 2" and name the copy **HEALTHSOFT_V06_FINAL_EDIT**. Work only in the copy.
2. Composition settings: **1080 × 1920, 24 fps, duration 0:00:32:00** (768 frames).
   - The current comp is 29.97 fps and about 10 s; change both.
3. Import, if not already in the project:
   - the product photo (three products on plinths, 941×1672);
   - the official logo PNG (447×447).
4. Timecode below is `s:ff` at 24 fps (e.g. `16:04` = 16 s + 4 frames).

## 1. Brand
| Use | Value |
|---|---|
| Orange (accent line, CTA) | #EC8D1F |
| Navy (text on light backgrounds) | #0B1F3A |
| Ivory (stage / end card) | #FAF7F2 |
| White (text on footage) | #FFFFFF |
| Font | Inter: Bold for headlines, SemiBold for secondary lines |

Safe margins: text left edge at **x = 84**; keep all text between y 250 and y 1640.

## 2. Footage layers (trim each clip; do not stack them at 0:00)
- **Portrait clips** (5486229, 5493998, 2160×4096): Scale **50 %**, Position **(540, 960)**.
- **Landscape clips** (5486219, 5495326, 4096×2160): Scale **88.9 %**, Position y **960**.
  - Move Position x so the faces or hands sit in frame. 540 = centre of the source.
  - Valid range: x from −740 (shows the source's left edge) to 1820 (shows its right edge).
- **Never stretch.** Keep scale uniform.
- **Frame rate:** the clips are 25 fps; set each clip's speed to **96 %** if Effectcraft allows, so every frame plays once.

| Layer name | Clip | Timeline in → out | Source in | Notes |
|---|---|---|---|---|
| LA_01_Daughter_Laptop | 5486229 | 0:00 → 3:00 | 0.5 s | Daughter at the laptop |
| LA_02_Mother | 5493998 | 3:00 → 6:00 | 0.5 s | Mother's genuine expression, clean cut |
| LA_03_Their_Day | 5495326 | 6:00 → 9:00 | 0.5 s | Hands cooking; position x on the hands |
| LA_04_Comfort | 5486219 | 9:00 → 12:00 | 0.5 s | Relaxed coffee moment |
| LA_05_Choose_Together | 5486229 | 12:00 → 16:04 | mid-clip | A different moment from LA_01; both women engaged, mother participating |
| LA_06_Closing | 5493998 | 27:00 → 30:00 | last ~3.4 s | A different moment from LA_02; warm closing |

**Check:** these clips may show different performers. Do not cut between visibly different people as if they were one family. Tell me if they differ.

## 3. Headlines over footage
- **Style:** Inter Bold 112 px, white, tracking −35, left-aligned at x = 84, soft shadow.
- **Placement:** the bottom of the last line sits at about **y 1530**.
- **Reveal:** each line has a rectangular mask the size of the line. The text slides up 112 px into the mask over **13 frames** (ease out), then **holds still**.
- **Exit:** a 7-frame slide up out of the mask at the out time.
- Lines in the same title start **5 frames apart**.

| Text (line breaks as shown) | In | Out |
|---|---|---|
| You buy it. | 0:06 | 2:14 |
| They live / with it. | 3:06 | 5:17 |
| Their day. | 6:06 | 8:16 |
| Their / comfort. | 9:06 | 11:15 |
| Their choice. (top of text y 1290) | 12:06 | 14:02 |
| Choose together. (Inter SemiBold 64 px, top y 1478) | 13:06 | 14:04 |
| Care that / fits real life. | 27:06 | 29:06 |

## 4. The orange line (the only decorative element)
- **Shape:** a rectangle 110 × 6 px, fully rounded, #EC8D1F, left edge x 84, at **y 1600**.
- **Draw on:** animate Scale X 0 → 100 % from its left edge over 14 frames (ease out).
- **Retract:** right to left over 8 frames.

| Under | Draw | Retract |
|---|---|---|
| You buy it. | 0:22 | 2:12 |
| They live with it. | 3:22 | 5:16 |
| Their comfort. | 9:20 | 11:14 |
| Their choice. (at y 1440) | 12:20 | 13:06 |
| Choose together. (y 1600, the shared-selection marker) | 13:10 | 14:06 |
| Care that fits real life. | 27:22 | 29:06 |

## 5. Hand-over 12–16 s → products
- Layer **TR_Ivory_Rise_1**: an ivory solid, 1080×1920.
- Animate Position y from **2880 → 960** over **14:20 → 15:22**, easy ease, so it rises from the bottom over the footage.
- Give the top edge a soft 160 px feather if available.

## 6. Products 16:04 → 22:12
- **PR_Products:** the original product photo, unaltered. Scale **114.8 %**, Position (540, 960). Fade it in over **15:22 → 16:04** on top of the ivory.
- **Camera moves:** scale and position only, ≤ 110 %, never past the photo edges.
  - **16:08 → 16:22:** move toward the blue pendant (lower right), about 106 %.
  - **18:00 → 18:16:** move to the orange wristband (left).
  - **20:00 → 20:16:** move to the pill dispenser (top).
  - No rotation, no 3D.
- **Header** "Start with what they need.": Inter SemiBold 60 px, navy, x 84 / y 300.
  - In 16:08, out 19:16.
  - Put a soft ivory gradient behind the top of frame so it stays readable.
- **Product labels**, bottom-left at x 84:
  - category in Inter Bold 92 px, navy, top y 1418;
  - product name in Inter Regular 46 px, #4E5B70, top y 1522;
  - an orange 110 × 6 underline at y 1606.

| Category | Product (exact mapping) | In | Out |
|---|---|---|---|
| Safety | Guard Rail (blue SOS pendant) | 16:10 | 18:00 |
| Health | Health Guard (orange textile wristband) | 18:10 | 20:00 |
| Medication | Keeper (circular pill dispenser) | 20:10 | 21:22 |

Never label the wristband "Guard Rail" or the pendant "Health Guard".

## 7. Guidance 21:18 → 27:00
- **TR_Ivory_Rise_2:** an ivory solid rising over the products, 21:18 → 22:12.
- **Spine:** a vertical orange line, 6 px wide, at x 84 from y 744 to y 1224.
  - It draws downward 21:18 → 22:12.
  - Nodes: orange circles, 22 px across, at y 744, 984 and 1224.
- **Steps:** a small orange numeral in Inter SemiBold 24 px above each heading in Inter Bold 84 px navy, at x 146. Each node appears with its step.
  - When the next step arrives, dim the previous one to **40 %** opacity.

| Step | In | Out |
|---|---|---|
| 01 Understand (node y 744) | 22:16 | 26:12 |
| 02 Choose (node y 984) | 23:16 | 26:12 |
| 03 Get started (node y 1224) | 24:16 | 26:12 |
| "Guidance to get started." (Inter Medium 46 px, #4E5B70, x 84, y 1420) | 25:06 | 26:12 |

## 8. Closing → end card
- **TR_Ivory_Rise_3:** an ivory solid rising over LA_06_Closing, 29:12 → 30:00.
- **End card, 30:00 → 32:00:**
  - **Background:** an ivory solid.
  - **Logo:** the official logo PNG at **100 %** (447 px), centre **(540, 823)**, blend mode **Multiply** so its white ground becomes ivory. Do not redraw or recolour it. Reveal 30:00 → 30:14 with a bottom-to-top wipe and 14 px rise.
  - **CTA:** "Find your fit →" in Inter SemiBold 60 px, orange, centred at y ≈ 1150. In 30:06 (12-frame mask reveal).
  - **CTA underline:** orange, the width of the CTA, 16 px below it. Draws 30:10 → 30:22.
  - **Hold** still to 32:00.

## 9. Audio (if Effectcraft supports audio)
- **SFX (optional):** `tap.wav`, `tick.wav`, `swell.wav` and `bloom.wav` from `remotion/public/audio/sfx/` in GitHub `Abinav2106/HEALTH-SOFT-VIDEO`, branch `claude/gifted-tesla-4vq3cv`. Cue times are in `video06/audio/V06_audio_cue_sheet.csv`.
- **Voice-over and music:** keep on separate tracks. They are still to be supplied (narration timing: `video06/audio/V06_narration_timing.srt`).

## 10. Check and export
1. Play every scene. Confirm:
   - text holds still while read;
   - no faces are covered;
   - no black gaps;
   - product mapping is correct.
2. Export **H.264, 1080 × 1920, 24 fps, 32 s** as `HEALTHSOFT_VIDEO_06_PICTURELOCK_1080x1920.mp4`. Call it picture lock until the voice-over and music are in.
3. Tell me exactly which steps Effectcraft could not do.
