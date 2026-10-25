# Source audit

## Inspected material
| Item | Status |
|---|---|
| Supplied GoFloaters logo (`original_logo/gofloaters_original_logo.webp`, 2000×667, converted to PNG losslessly for processing) | **Inspected**: highest-priority source of truth |
| Navi by VNGGames, Behance (InSpace Creative), https://www.behance.net/gallery/254917035/Navi-by-VNGGames | **Not inspected.** The production environment's network policy refused the connection (HTTP 403 on CONNECT to www.behance.net). A web search returned no indexed copy of the project. No PDF or screenshots were supplied. |
| Earlier AI-generated GoFloaters boards | Not supplied; not used |

Because the reference could not be opened, this package does **not** describe its panels, layouts, colours or animations. The editorial approach of the guidelines (large hero art, strong negative space, solid colour sections, a character-led system running from logo to merchandise and events) follows the brief's written description of the reference, not observed material. No Navi artwork, motifs or compositions were used.

## Verified characteristics of the supplied logo
**Dog**
* Slim white body with a hand-inked dark outline of variable weight: about 7.6 px at 2000 px width, heavier on lower and left edges.
* Elongated muzzle; small rounded black nose; closed smile line.
* Two swept-back ears: the far ear is upper, the near ear lower, both tucked behind the head.
* An orange ring around the single visible eye, with a strap running back past the ear. This is the only accessory.
* Long upright neck; seated posture inside the cockpit.
* Near and far forelegs reach forward and down; both paws rest on the fuselage.
* A curved tail rises behind, its root in the cockpit.
* Three short fur strokes on the haunch.

**Aircraft**
* Turquoise fuselage with tail fin and stabiliser; near wing at the lower front.
* Cockpit opening with yellow interior.
* Yellow propeller disc with a curled spinner mark, at the nose.

**Typography and motion details**
* Wordmark: "Go" in a bold weight and "Floaters" in a regular weight from the same sans family, set in ink. The typeface is not identified.
* Tagline "Spaces that work for you" in slate grey (#6B6B6C), set beneath the wordmark.
* Five rounded speed lines behind the aircraft, measuring 71, 82, 129, 83 and 147 px long at the 2000 px master.

## Sampled colours (median of eroded colour regions)
Turquoise #6ED0E0 · Yellow #FCE162 · Orange #F17B2A · Ink #040506 (published as #050506) · Tagline slate #6B6B6C · Background #FEFEFE

## Fidelity of the vector reconstruction
```
{
 "source": "01_SOURCE_REFERENCE/original_logo/gofloaters_original_logo.png (2000x667)",
 "reconstruction_vs_source": {
  "mean_abs_diff_0_255": 1.971,
  "pct_pixels_diff_gt_40": 0.507,
  "ink_iou": 0.9341,
  "ink_iou_tolerance_1px": 0.9868
 },
 "rig_rest_pose_vs_reconstruction": {
  "mean_abs_diff_0_255": 0.447,
  "pct_pixels_diff_gt_40": 0.256,
  "ink_iou": 0.9761,
  "ink_iou_tolerance_1px": 0.9896
 },
 "rig_rest_pose_vs_source": {
  "mean_abs_diff_0_255": 2.343,
  "pct_pixels_diff_gt_40": 0.734,
  "ink_iou": 0.9133,
  "ink_iou_tolerance_1px": 0.9766
 },
 "note": "Rendered at identical dimensions (2000x667). Ink = pixels with max channel < 110. The rig rest pose differs from the traced master only where limbs/tail were redrawn as articulated tubes; the hero animation locks off to the traced master in its final frames."
}
```
See `../visual_comparison/` for the side-by-side, overlay, difference map and detail crops of face, ears, body, propeller and lettering.

## Ambiguities in the source and how they were resolved
* **Cockpit and lower body.** The source merges the dog's haunch with the cockpit rim. For the logo pose, that whole region is kept static as the "seat" part. For detached use, the lower body is reconstructed (`dog_lower` patch) and so is the empty cockpit (`cockpit_empty`). Both are marked `class="gf-reconstruction"` in every SVG.
* **Background between the forelegs.** The enclosed gap above the fuselage is treated as background, so it shows as transparent on dark grounds.
* **Areas hidden behind the near foreleg and paws.** Reconstructed as a turquoise surface with the cockpit rim and fuselage line (`aircraft_behind_leg*`, `fuselage_top`).
