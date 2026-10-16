"""PATCH performance helpers (expressions, gaze, blinks, gestures) for PATCH_Rig v1."""
from __future__ import annotations

from ecbuild import FPS, Builder
from patch_rig import U

F = 1 / FPS
EYES = {
    "neutral": ((0.9, 1.3), (0.9, 1.3)),
    "inspect": ((0.9, 0.4), (0.9, 1.3)),
    "skeptical": ((0.95, 0.55), (0.95, 0.55)),
    "interested": ((1.0, 1.5), (1.0, 1.5)),
    "error": ((1.15, 0.22), (1.15, 0.22)),
}


class Patch:
    def __init__(self, b: Builder, prefix: str = ""):
        self.b, self.p = b, prefix
        self.eye_keys = {"L": [], "R": []}
        self.gaze_keys = []  # (t, dx, dy) in rig units
        base = {}
        for s in ("L", "R"):
            base[s] = b.ec.tool("get_property", layer=prefix + "Eye" + s,
                                path="transform/position")["value"]
        self.eye_base = base

    def L(self, n):
        return self.p + n

    # -- face -------------------------------------------------------------
    def expr(self, t, state, dur=4):
        """Eyes change to `state` over `dur` frames ending at t + dur/FPS."""
        (lw, lh), (rw, rh) = EYES[state]
        for s, (w, h) in (("L", (lw, lh)), ("R", (rw, rh))):
            ks = self.eye_keys[s]
            prev = ks[-1][1] if ks else [EYES["neutral"][0][0] * U, EYES["neutral"][0][1] * U]
            ks.append((t, prev))
            ks.append((t + dur * F, [w * U, h * U]))
        self._state = state

    def blink(self, t):
        for s in ("L", "R"):
            ks = self.eye_keys[s]
            prev = ks[-1][1] if ks else [0.9 * U, 1.3 * U]
            ks += [(t, prev), (t + 3 * F, [prev[0], 0.1 * U]), (t + 7 * F, prev)]

    def gaze(self, t, dx, dy=0.0, dur=4):
        prev = self.gaze_keys[-1][1:] if self.gaze_keys else (0.0, 0.0)
        self.gaze_keys += [(t, *prev), (t + dur * F, dx, dy)]

    def commit_face(self):
        b = self.b
        for s in ("L", "R"):
            ks = sorted(self.eye_keys[s], key=lambda k: k[0])
            ks = _dedupe(ks)
            if ks:
                b.key(self.L("Eye" + s), "contents/group/contents/rect/size", ks, ease="snap")
        if self.gaze_keys:
            for s in ("L", "R"):
                x0, y0, z0 = self.eye_base[s]
                ks = _dedupe([(t, [x0 + dx * U, y0 + dy * U, z0]) for t, dx, dy in self.gaze_keys])
                b.key(self.L("Eye" + s), "transform/position", ks, ease="snap")

    # -- body -------------------------------------------------------------
    def move(self, ctrl, path, keys, ease="inout"):
        self.b.key(self.L(ctrl), path, keys, ease=ease)

    def status_pulse(self, t, peak=1.0, rest=0.3):
        self.b.key(self.L("Status"), "materialOptions/emissive",
                   [(t, rest), (t + 4 * F, peak), (t + 22 * F, 0.65)], ease=["snap", "soft"])


def _dedupe(ks):
    out = []
    for t, v in ks:
        if out and abs(out[-1][0] - t) < 1e-6:
            out[-1] = (t, v)
        else:
            out.append((t, v))
    return out
