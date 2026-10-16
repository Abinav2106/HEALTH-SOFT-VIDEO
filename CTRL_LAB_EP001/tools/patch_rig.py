"""PATCH_Rig v1 — builds PATCH inside an Advanced 3D EffectCraft comp.

Every shot calls build_patch() so the construction never drifts. Numbers come from
assets/patch/PATCH_character_spec.md (1 u = U px). Comp space: x right, y down, z away from camera.

Controls (3D nulls), all keyable:
  {p}PATCH_CTRL   root on the desk (position, rotationY = turn on the spot)
  {p}Torso_CTRL   lean (rotationX forward/back, rotation side)
  {p}Head_CTRL    yaw rotationY, tilt rotation (z), nod rotationX
  {p}ShoulderL_CTRL / ShoulderR_CTRL   arm swing (rotationX forward, rotation sideways)
  {p}ElbowL_CTRL / ElbowR_CTRL         forearm bend (rotationX)
  {p}EyeL / EyeR   flat face-display shapes: animate contents/group/contents/rect/size
                    and transform/position (gaze) for expressions
  {p}Status        orange indicator: animate materialOptions/emissive for "found it"
"""
from __future__ import annotations

U = 25.0  # px per rig unit

GRAPHITE = "#17191C"
CERAMIC = "#F3F0E9"
JOINT = "#3A3D42"
GLASS = "#0E0F11"
ORANGE = "#FF6938"

# eye geometry (px) — neutral
EYE_W, EYE_H, EYE_GAP = 0.9 * U, 1.3 * U, 2.2 * U


def _add(v, o):
    return [v[0] + o[0], v[1] + o[1], v[2] + o[2]]


class Rig:
    def __init__(self, ec, origin, prefix=""):
        self.ec, self.o, self.p = ec, origin, prefix
        self.names: list[str] = []

    # -- primitives ------------------------------------------------------
    def prim(self, kind, name, rel, parent=None, shadows=True, **kw):
        n = self.p + name
        self.ec.cmd("layer.new3dPrimitive", kind=kind, name=n, position=_add(self.o, rel),
                    castsShadows=shadows, acceptsShadows=True, **kw)
        self.names.append(n)
        if parent:
            self.parent(n, parent)
        return n

    def rbox(self, name, size, rel, color, parent=None, roundness=None, bevel=None,
             rough=None, metal=None, shadows=True, flat=False, lights=True):
        """Rounded box: an extruded, bevelled rounded-rectangle shape layer.

        size = (w, h, d) px. The shape's front face sits at rel z - d/2.
        """
        n = self.p + name
        w, h, d = size
        rel_front = [rel[0], rel[1], rel[2] - d / 2]
        self.ec.cmd("layer.newShape", kind="rounded", name=n, size=[w, h], fill=color,
                    position=[0, 0])
        ec = self.ec
        ec.cmd("layer.setSwitch", layers=[n], switch="threeD", value=True)
        ec.tool("set_property", layer=n, path="contents/group/contents/rect/roundness",
                value=roundness if roundness is not None else min(w, h) * 0.28)
        ec.tool("set_property", layer=n, path="transform/position", value=_add(self.o, rel_front))
        if not flat:
            ec.tool("set_property", layer=n, path="geometryOptions/extrusionDepth", value=d)
            ec.tool("set_property", layer=n, path="geometryOptions/bevelStyle", value=2)
            ec.tool("set_property", layer=n, path="geometryOptions/bevelDepth",
                    value=bevel if bevel is not None else min(w, h, d) * 0.08)
        ec.tool("set_property", layer=n, path="materialOptions/castsShadows", value=1 if shadows else 0)
        if not lights:
            ec.tool("set_property", layer=n, path="materialOptions/acceptsLights", value=0)
        if rough is not None:
            ec.tool("set_property", layer=n, path="materialOptions/specularShininess",
                    value=max(1.0, (1 - rough) * 100))
            ec.tool("set_property", layer=n, path="materialOptions/specularIntensity",
                    value=max(5.0, (1 - rough) * 60))
        if metal is not None:
            ec.tool("set_property", layer=n, path="materialOptions/metal", value=metal)
        self.names.append(n)
        if parent:
            self.parent(n, parent)
        return n

    def null(self, name, rel, parent=None):
        n = self.p + name
        self.ec.cmd("layer.newNull", name=n)
        self.ec.cmd("layer.setSwitch", layers=[n], switch="threeD", value=True)
        self.ec.tool("set_property", layer=n, path="transform/position", value=_add(self.o, rel))
        self.ec.cmd("layer.setSwitch", layers=[n], switch="video", value=False) if False else None
        self.names.append(n)
        if parent:
            self.parent(n, parent)
        return n

    def parent(self, child, parent):
        self.ec.cmd("layer.setParent", layers=[child], parent=parent, compensate=True)


def build_patch(ec, origin, prefix="", scale=1.0):
    """Build PATCH with the base centre on the desk at `origin` [x, y_desk, z]."""
    r = Rig(ec, origin, prefix)
    u = U
    root = r.null("PATCH_CTRL", [0, 0, 0])
    contact_shadow(ec, origin[0], origin[1], origin[2], 5.6 * u, name=prefix + "PATCH_ContactShadow",
                   parent=root)
    r.names.append(prefix + "PATCH_ContactShadow")

    # base disc
    r.prim("cylinder", "Base", [0, -0.8 * u, 0], parent=root, radius=4.5 * u, height=1.6 * u,
           baseColor=GRAPHITE, roughness=0.55, metallic=0.0, segments=48)

    torso_ctrl = r.null("Torso_CTRL", [0, -1.6 * u, 0], parent=root)
    r.rbox("Torso", (6.4 * u, 5.2 * u, 4.6 * u), [0, -1.6 * u - 2.6 * u, 0], GRAPHITE,
           parent=torso_ctrl, rough=0.55)
    r.rbox("ChestPanel", (4.2 * u, 3.0 * u, 0.35 * u), [0, -4.2 * u, -2.3 * u - 0.1 * u], CERAMIC,
           parent=torso_ctrl, rough=0.35, roundness=0.7 * u)
    r.prim("sphere", "Status", [1.4 * u, -5.1 * u, -2.75 * u], parent=torso_ctrl,
           radius=0.28 * u, baseColor=ORANGE, roughness=0.4, emissive=0.3, shadows=False)

    neck_ctrl = r.null("Neck_CTRL", [0, -6.8 * u, 0], parent=torso_ctrl)
    r.prim("cylinder", "Neck", [0, -7.4 * u, 0], parent=neck_ctrl, radius=0.7 * u,
           height=1.2 * u, baseColor=JOINT, metallic=0.9, roughness=0.3, segments=32)

    head_ctrl = r.null("Head_CTRL", [0, -8.0 * u, 0], parent=neck_ctrl)
    head_c = [0, -8.0 * u - 2.8 * u, 0]
    r.rbox("Head", (8.0 * u, 5.6 * u, 5.0 * u), head_c, CERAMIC, parent=head_ctrl, rough=0.35)
    r.rbox("HeadRearCap", (6.6 * u, 4.4 * u, 0.8 * u), [0, head_c[1], 2.5 * u + 0.3 * u], GRAPHITE,
           parent=head_ctrl, rough=0.55)
    r.rbox("FaceDisplay", (6.4 * u, 3.8 * u, 0.25 * u), [0, head_c[1], -2.5 * u - 0.1 * u], GLASS,
           parent=head_ctrl, rough=0.08, roundness=1.0 * u)
    eye_z = -2.5 * u - 0.24 * u - 1.0
    for side, sx in (("EyeL", -1), ("EyeR", 1)):
        r.rbox(side, (EYE_W, EYE_H, 1), [sx * EYE_GAP / 2, head_c[1] - 0.1 * u, eye_z], CERAMIC,
               parent=head_ctrl, roundness=0.4 * u, flat=True, shadows=False, lights=False)

    for side, sx in (("L", -1), ("R", 1)):
        sh = r.null(f"Shoulder{side}_CTRL", [sx * 3.75 * u, -5.9 * u, 0], parent=torso_ctrl)
        r.prim("sphere", f"ShoulderJoint{side}", [sx * 3.75 * u, -5.9 * u, 0], parent=sh,
               radius=0.65 * u, baseColor=JOINT, metallic=0.9, roughness=0.3)
        r.prim("cylinder", f"UpperArm{side}", [sx * 3.9 * u, -5.9 * u + 1.6 * u, 0], parent=sh,
               radius=0.5 * u, height=2.6 * u, baseColor=CERAMIC, roughness=0.35, segments=24)
        el = r.null(f"Elbow{side}_CTRL", [sx * 3.9 * u, -5.9 * u + 3.1 * u, 0], parent=sh)
        r.prim("sphere", f"ElbowJoint{side}", [sx * 3.9 * u, -2.8 * u, 0], parent=el,
               radius=0.48 * u, baseColor=JOINT, metallic=0.9, roughness=0.3)
        # forearm points forward (toward camera, -z) from the elbow
        r.prim("cylinder", f"Forearm{side}", [sx * 3.9 * u, -2.8 * u, -1.4 * u], parent=el,
               radius=0.45 * u, height=2.4 * u, baseColor=CERAMIC, roughness=0.35, segments=24)
        fa = r.p + f"Forearm{side}"
        ec.tool("set_property", layer=fa, path="transform/rotationX", value=90)
        r.rbox(f"Hand{side}", (1.3 * u, 1.0 * u, 0.9 * u), [sx * 3.9 * u, -2.8 * u, -2.9 * u],
               GRAPHITE, parent=el, rough=0.5, roundness=0.4 * u)

    if scale != 1.0:
        ec.tool("set_property", layer=root, path="transform/scale", value=[scale * 100] * 3)
    return r


def build_desk_set(ec, desk_y=700, prefix=""):
    """Desk surface, back wall, and the standard light rig (spec §5)."""
    p = prefix
    ec.cmd("layer.new3dPrimitive", kind="plane", name=p + "Desk", width=6000, height=4000,
           position=[960, desk_y, 600], baseColor="#CFC8BC", roughness=0.75,
           castsShadows=False, acceptsShadows=True)
    ec.tool("set_property", layer=p + "Desk", path="transform/rotationX", value=90)
    ec.cmd("layer.new3dPrimitive", kind="plane", name=p + "BackWall", width=8000, height=4000,
           position=[960, desk_y - 1200, 2400], baseColor="#2A2C30", roughness=0.9,
           castsShadows=False, acceptsShadows=True)
    ec.cmd("layer.newLight", kind="Spot", name=p + "Key", color="#FFF3E2", intensity=115,
           castsShadows=True, shadowDarkness=45, shadowDiffusion=35, coneAngle=80, coneFeather=70,
           position=[260, desk_y - 1700, -1100], poi=[960, desk_y - 250, 0])
    # fill sits behind and above camera-right, outside every framing we use
    ec.cmd("layer.newLight", kind="Parallel", name=p + "Fill", color="#DDE6F0", intensity=20,
           position=[3000, desk_y - 900, -3000], poi=[960, desk_y - 250, 0])
    ec.cmd("layer.newLight", kind="Ambient", name=p + "Ambient", intensity=20)


def contact_shadow(ec, x, desk_y, z, radius, name="ContactShadow", parent=None, opacity=55):
    """Soft radial contact shadow lying on the desk under an object."""
    ec.cmd("layer.newShape", kind="ellipse", name=name, size=[radius * 2, radius * 2],
           fill="#000000", position=[0, 0])
    ec.cmd("layer.setSwitch", layers=[name], switch="threeD", value=True)
    g = ec.cmd("layer.addShapeItem", layer=name, kind="gfill", group="contents/group")
    ec.tool("set_property", layer=name, path=g["path"] + "/type", value=2)
    ec.tool("set_property", layer=name, path=g["path"] + "/start", value=[0, 0])
    ec.tool("set_property", layer=name, path=g["path"] + "/end", value=[radius, 0])
    ec.tool("set_property", layer=name, path=g["path"] + "/colors",
            value={"colors": [[0, "#000000"], [1, "#000000"]], "opacities": [[0, 1], [0.55, 0.6], [1, 0]]})
    ec.tool("set_property", layer=name, path="contents/group/contents/fill/opacity", value=0)
    ec.tool("set_property", layer=name, path="transform/rotationX", value=90)
    ec.tool("set_property", layer=name, path="transform/position", value=[x, desk_y - 0.6, z])
    ec.tool("set_property", layer=name, path="transform/opacity", value=opacity)
    ec.tool("set_property", layer=name, path="materialOptions/acceptsLights", value=0)
    ec.tool("set_property", layer=name, path="materialOptions/castsShadows", value=0)
    if parent:
        ec.cmd("layer.setParent", layers=[name], parent=parent, compensate=True)
    return name
