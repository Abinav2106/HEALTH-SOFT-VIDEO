# Tilo rig control guide

Tilo is the GoFloaters dog on his airplane. Every control lives on one null, **`CTRL_Tilo`**, as Expression Controls (Effects Controls panel). The defaults reproduce the supplied logo pose exactly. Animate by keyframing these controls; the art layers carry expressions and are not keyframed directly.

![Pivots and hierarchy](guide/pivots_hierarchy.png)

## Controls

| Control | Type | Default | Useful range | What it does |
|---|---|---|---|---|
| **Blink** | Slider | 0 | 0 to 100 | Both lids close. The upper lid travels to just below centre and the lower lid meets it. Masked to the eye white, so nothing leaves the goggles. |
| **Auto Blink** | Checkbox | off | | Adds a 0.24 s blink every *Blink Interval* seconds, on top of keyframed blinks. |
| **Blink Interval** | Slider | 3.2 | 0.8 to 10 s | Spacing of automatic blinks. |
| **Upper Lid Rest** | Slider | 0 | 0 to 70 | Resting droop of the upper lid, for sleepy or sceptical looks. Blinks still close fully. |
| **Pupil X / Pupil Y** | Sliders | 0 / 0 | -100 to 100 | Look direction. ±100 reaches the lens edge, and travel is clamped to an ellipse inside the eye white. 0/0 is the logo's own gaze. |
| **Head Tilt** | Angle | 0° | -20° to +18° | Head rotates at the top of the neck. The torso's neck vertices follow with a smooth falloff, so there is no seam. |
| **Head Counter** | Slider | 60 | 0 to 100 % | Share of the upper-body lean the head cancels, which keeps the eyes level during balance and banking. |
| **Ear Follow Through** | Slider | 100 | 0 to 200 % | How far the ears drag behind head, chest and flight rotation (overlapping action). |
| **Ear Lag** | Slider | 3 | 0 to 12 frames | Delay of that drag. The far ear trails one frame more than the near ear. |
| **Ear Lift** | Angle | 0° | -20° to +25° | Manual ear pose. Positive lifts the tips. Ears bend along their length; the roots never move. |
| **Ear Flutter** | Slider | 0 | 0 to 100 | Wind flutter that runs root to tip. Amplitude and frequency grow with *Flight Speed*. |
| **Point** | Slider | 0 | 0 to 100 | Far foreleg lifts off the plane's nose and points ahead. Shoulder, elbow and wrist blend together. |
| **Point Angle** | Angle | 0° | -10° to +25° | Aim of the point, in degrees above the default 25° elevation. |
| **Near Paw Lift** | Slider | 0 | 0 to 100 | Near foreleg lifts its paw off the rim (taps, waves). Keyframe 0→100→0 for a tap. |
| **Far Paw Curl** | Angle | 0° | -30° to +10° | Bends the far paw at the wrist; negative lifts the toes. Positive values push a resting paw into the fuselage, so use them only while pointing. |
| **Tail Wag** | Slider | 0 | 0 to 45° | Wag amplitude. A wave travels from the rump to the tip. |
| **Tail Wag Speed** | Slider | 2.2 | 0 to 6 Hz | Wags per second. |
| **Tail Curl** | Angle | 0° | -30° to +30° | Static curl of the whole tail. |
| **Body Balance** | Angle | 0° | -12° to +12° | Upper body leans from the waist (`Dog_Chest`). The seat stays in the cockpit and the torso bends between them. Head and forelegs ride along. |
| **Flight Bank** | Angle | 0° | -30° to +30° | Roll: the plane tilts 0.3× the angle and dips slightly, the near wing (±1.1 % per degree) and tailplane (±0.8 %) foreshorten about their roots, and the dog leans into the turn 4 frames late. |
| **Flight Speed** | Slider | 50 | 0 to 100 | Airflow: length (scale from the plane end, 0.35× to 1.65×), spacing (strokes spread from the tail, 0.55× to 1.45×) and opacity (fades out below 25). 50 = logo. Also scales flutter and bob. |
| **Propeller Speed** | Slider | 0 | 0 to 100 | Blade spin, integrated over time so ramps stay smooth (0 to 22 rev/s). See *Propeller* below. 0 = logo. |
| **Bob Amount** | Slider | 0 | 0 to 100 | Flight float: vertical bob plus a little pitch, stronger at higher speed. |
| **Airflow Travel** | Checkbox | off | | Airflow strokes stream backwards and fade at the ends instead of holding their logo positions. |

### Propeller

![Propeller compression and blur](guide/propeller_cycle.png)

The blade is a side view, so it is never rotated like a card. Its height follows |cos θ| about the hub (never below 7 %) and its width eases slightly as the face turns. Three things take over as speed rises:

- **Motion blur:** the layer's motion blur switch is on (180° shutter).
- **Directional Blur:** a vertical *Blade Blur* effect, 0 to 38 px.
- **Blur disc:** the *Propeller_Blur* layer fades in from Propeller Speed 18 while the solid blade fades out from 30.

The nose cone behind the blade is rebuilt, so the compressed blade reveals a finished nose.

## Layers

![Layered parts](guide/layered_parts.png)

Front to back: `Propeller`, `Propeller_Blur`, `Paw_Near`, `Arm_Near_Fore`, `Arm_Near_Upper`, `Goggles`, `Eyelid_Upper`, `Eyelid_Lower`, `Pupil`, `Eye_White`, `Face`, `Ear_Near`, `Head`, `Ear_Far`, `Wing`, `Stabilizer`, `Plane_Body`, `Dog_Body`, `Tail`, `Paw_Far`, `Arm_Far_Fore`, `Arm_Far_Upper`, `Cockpit`, `Airflow_01` to `Airflow_07`.

Nulls:

- **`Tilo_Root`:** move and scale the whole character here.
- **`Flight`:** bank and bob.
- **`Dog_Root`:** the seat.
- **`Dog_Chest`:** the waist pivot for leaning.
- **`CTRL_Tilo`:** all the controls.

Layer colour labels:

- Red: the control null.
- Yellow: rig nulls.
- Blue: plane parts.
- Purple: face parts.
- Teal: dog body parts.
- Lilac: airflow strokes.

Each layer's pivot (anchor point) sits on its anatomical joint: shoulder, elbow, wrist, neck, ear root, tail root, propeller hub, wing root.

## How each part is rigged (as built)

| Part | Method |
|---|---|
| Head on body | FK parenting to `Dog_Chest`, plus **local deformation** of the torso's neck vertices (path expression; full follow at y ≤ 198, smooth falloff to y = 272). |
| Upper-body lean | `Dog_Chest` null, plus a **waist bend** of the torso path (follow above y = 318, none below the seat line at y = 396). |
| Ears | **Path-expression bend deformer**: 4-segment skeleton from a fixed root. Rotation blends across each joint, so the outline never cracks. |
| Tail | Same bend deformer with 7 segments and a travelling wave. Root fixed under the rump. |
| Forelegs | **Overlapping cutouts** (upper arm, forearm and paw are separate layers in an FK parent chain) plus a **skinned joint blend**: within 11 to 13 units of each elbow and wrist cut, both pieces turn by half the joint angle against the same cut line, so outlines stay continuous. |
| Shoulders | Overlapping cutouts. The far arm's root is rebuilt as a closed tube tucked behind the chest and near arm. The near arm's top blends into the chest, and a rebuilt chest contour sits behind it. |
| Eyes | Eye white, pupil and two new eyelid layers, all **masked by the eye-white outline** inside the original goggles. The pupil moves inside its own shape group, and the lids are generated by path expressions. |
| Goggles, face | Rigid children of `Head`. |
| Plane | Rigid hierarchy. Banking uses rotation plus Y-scale of the wing and stabiliser about their roots, over a rebuilt fuselage underside. |
| Propeller | Compression, motion blur, Directional Blur and a blur-disc crossfade. |
| Airflow | The 7 original strokes. Length is X-scale anchored at the plane end, spacing is position spread from the tail, and opacity is driven by speed. |

The Puppet tool is **not** used: puppet pins cannot be created reliably by script. All deformation is done with path expressions on native shape layers. The deformers work out their weights from the geometry each frame, so you can edit, add or remove vertices in After Effects and the edited shape stays rigged.

## Hidden artwork that was rebuilt

The source is a raster trace: one ink silhouette with colour fills on top. Areas that moving parts uncover were redrawn in the same ink weight and colours:

- Chest and belly contour behind the near foreleg.
- Far foreleg root, tucked behind the chest.
- Back of the skull under the near ear.
- The seat cushion and cockpit edge behind the near paw.
- Fuselage top under the paws.
- Torso below the cockpit rim.
- Fuselage underside behind the wing and tailplane.
- Nose cone behind the propeller.
- The far paw's sole, which was fused to the fuselage edge in the trace.

At rest all of this sits behind other artwork. The rest pose differs from the original only by anti-aliasing and the trace's pin-holes, which are now closed.

## Range check

Every control at its documented limit, on a tinted background so any hole or detached piece would show:

![Stress poses](guide/stress_poses.png)

## Working with the rig

- **Pose by controls only.** If you must hand-key a layer, add the keys on top of its expression with `value +`, or disable that expression.
- **Keep the rig layers together.** Expressions find `CTRL_Tilo` by name in the same comp. To use Tilo as a precomp in the main animation, open `Tilo_Rig`, add the `CTRL_Tilo` effects to the Essential Graphics panel and drive them per instance with Essential Properties. Alternatively, copy every layer, including `CTRL_Tilo`, into the shot comp.
- **Several Tilos in one comp:** duplicate the layer set into its own precomp. The layer names must stay unique within a comp.
- **Ranges:** the useful ranges above are the tested ones. Beyond them, joints can show their overlaps; for example, above Point Angle +25° the raised paw passes behind the head and goggles.
- **Cost:** the propeller expression integrates speed frame by frame, which is negligible for shots of a few minutes.
