# PATCH — character specification (v1)

CTRL? LAB's recurring mascot. A compact robotic desk companion, about the size of a coffee mug (≈ 14 cm tall).
This is the single source of truth: every shot uses the same EffectCraft rig built from these numbers.

## 1. Construction

Units are rig units: 1 u = 1 cm at desk scale. Y is up in the description; in EffectCraft comp space Y points down (see §5).

| Part | Primitive | Size (u) | Material | Notes |
|---|---|---|---|---|
| Base | rounded cylinder (disc) | Ø 9.0 × 1.6 | Graphite shell | Rests on the desk and casts the contact shadow |
| Torso | rounded box | 6.4 w × 5.2 h × 4.6 d | Graphite shell | Ceramic chest panel inset on the front |
| Chest panel | rounded box | 4.2 × 3.0 × 0.3 | Ceramic | Holds the **orange status indicator** at upper right |
| Status indicator | sphere | Ø 0.55 | Signal Orange, faint emissive | The only orange on PATCH. Brightens on a discovery |
| Neck | cylinder | Ø 1.4 × 1.2 | Graphite, satin metal ring | Visible joint; pivot for head tilt |
| Head | rounded box | 8.0 w × 5.6 h × 5.0 d | Ceramic shell, graphite rear cap | Proportion: the head is wider than the torso (curious, readable) |
| Face display | rounded box, inset | 6.4 × 3.8 × 0.2 | Near-black glass (#0E0F11), low roughness | Shows the eyes; slightly recessed |
| Shoulder joints | sphere | Ø 1.3 | Satin graphite metal | Visible mechanical joints |
| Upper arm | capsule/cylinder | Ø 1.0 × 3.0 | Ceramic | |
| Elbow | sphere | Ø 0.95 | Satin graphite | |
| Forearm | capsule/cylinder | Ø 0.9 × 2.8 | Ceramic | |
| Hand | rounded box (mitten) | 1.3 × 1.0 × 0.8 | Graphite | No fingers. Points or taps |

Silhouette rules: the head is the largest mass. Arms are short (they reach the chest panel, not above the head). No antenna, no wheels, no legs.

## 2. Materials (PBR)

| Name | Base colour | Roughness | Metallic |
|---|---|---|---|
| Graphite shell | #17191C | 0.55 | 0.0 |
| Ceramic | #F3F0E9 | 0.35 | 0.0 |
| Satin joint metal | #3A3D42 | 0.30 | 0.9 |
| Face glass | #0E0F11 | 0.08 | 0.0 |
| Status indicator | #FF6938 | 0.40 | 0.0 (emission 0.3–1.0) |

No glow halos, no neon. Reflections are restrained: the face glass picks up only one soft highlight.

## 3. Face display (the main expression channel)

Eyes are two ceramic-white (#F3F0E9) rounded rectangles on the dark glass. No mouth. **No lip-sync.**

| Expression | Eye shape | Use |
|---|---|---|
| Neutral | 0.9 × 1.3 rounded rects, 2.2 apart | Default, listening |
| Inspect | One eye narrowed to 0.4 h, the other normal | Examining a claim |
| Skeptical | Both 0.55 h, flat tops (lids lowered) | "Let's check that." |
| Interested | 1.0 × 1.5, slightly raised | A result looks good |
| Blink | Height → 0.1 over 3 frames, back over 4 | Every 3–6 s, irregular |
| Found it | Neutral eyes + status indicator pulses orange | A useful discovery |
| Error | Eyes become two short horizontal bars | A failure |

Gaze: the eyes translate inside the display (max ±1.0 u horizontally, ±0.6 u vertically) before the head turns. Eyes lead, head follows 4–6 frames later.

## 4. Performance

- **Personality:** curious, observant, technically capable, mildly skeptical of exaggerated claims, dry humour, helpful.
- **Acting comes from:** gaze → head angle (±18° yaw, ±10° tilt) → small arm gestures → posture (torso lean ±6°) → precisely held pauses.
- **Gestures:** point (one forearm raises, hand aims), tap (hand dips 0.5 u and returns, 6 frames), shrug (both shoulders rise 0.4 u), lean in (torso +6°, head +4°).
- **Timing:** settle every move with an ease-out. Do not give every move the same overshoot. Hold still while the narrator explains something.
- **Voice:** Kokoro `am_puck`, speed 1.0, no robot filter. A light high-pass (120 Hz) and a little presence are the only processing.
- **Never:** human mouth shapes, dancing, constant idle bobbing, sitting permanently in a corner.

## 5. Rig in EffectCraft

- One precomp, **`PATCH_Rig`**, in Advanced 3D, built from parametric primitives parented to nulls:
  `PATCH_CTRL` (root: position/rotation on the desk) → `Torso_CTRL` → `Neck_CTRL` → `Head_CTRL` → face layers.
  Each shoulder has its own `ShoulderL_CTRL` / `ShoulderR_CTRL` → `ElbowL_CTRL` / `ElbowR_CTRL`.
- The face display is a separate 2D precomp, **`PATCH_Face`**, mapped onto the display. Expressions are keyframed on its eye shape layers.
- Lighting standard for close shots: a soft key from camera-left at about 60° side angle (warm, 1.0); a cool, dim fill from the right (0.25); an overhead ambient (0.15); contact shadow on the desk plane.
- Camera standard: 55 mm equivalent, head height, stable. Slow push-ins only (≤ 4 % over a shot).

## 6. Continuity checklist (each shot)

- [ ] Same rig version (`PATCH_Rig v1`)
- [ ] Head wider than torso; one orange indicator only
- [ ] Contact shadow present when on the desk
- [ ] No text baked into PATCH
- [ ] Expression matches the narration beat
