"""CTRL? LAB build helpers on top of the EffectCraft MCP client.

All times are COMP seconds unless a function says otherwise. Every helper passes
timeBase="comp" to the engine so offset layers never drift (agents.md, pitfalls).
"""
from __future__ import annotations

from pathlib import Path

from ecmcp import EC

ROOT = Path("/home/user/HEALTH-SOFT-VIDEO/CTRL_LAB_EP001")
FPS = 30

# palette
GRAPHITE = "#17191C"
CERAMIC = "#F3F0E9"
ORANGE = "#FF6938"
INK2 = "#5C5F66"       # secondary text on ceramic
CERAMIC2 = "#E6E1D7"   # panel shade on ceramic
GRAPHITE2 = "#24272B"  # panel shade on graphite
MUTED = "#9A9893"      # tertiary text on graphite

SANS = "Inter"
MONO = "JetBrains Mono"

# easing presets: (outInfluence of the segment's first key, inInfluence of its last key)
EASE = {
    "out": (6, 88),      # entrance: quick start, long settle
    "in": (88, 6),       # exit: gentle start, quick leave
    "inout": (65, 65),   # major move / camera
    "soft": (33, 33),    # easy ease
    "snap": (4, 70),     # small UI response
}


def f2s(frame: int) -> float:
    return frame / FPS


class Builder:
    def __init__(self, ec: EC):
        self.ec = ec
        self.comp: str | None = None

    # -- comps -----------------------------------------------------------
    def comp_new(self, name, duration, bg=GRAPHITE, w=1920, h=1080, renderer=None):
        kw = dict(name=name, width=w, height=h, frameRate=FPS, duration=duration, background=bg)
        if renderer:
            kw["renderer"] = renderer
        self.ec.cmd("comp.new", **kw)
        self.comp = name
        return name

    def use(self, name):
        self.ec.cmd("comp.open", comp=name)
        self.comp = name

    def add_item(self, item, start=0.0, name=None, index=None):
        kw = dict(item=item, time=start)
        if index:
            kw["index"] = index
        r = self.ec.cmd("layer.addItem", **kw)
        lid = r["layer"]
        if name:
            self.ec.cmd("layer.rename", layer=lid, name=name)
            return name
        return lid

    def timing(self, layer, start=None, in_=None, out=None):
        kw = {"layers": [layer]}
        if start is not None:
            kw["start"] = start
        if in_ is not None:
            kw["in"] = in_
        if out is not None:
            kw["out"] = out
        self.ec.cmd("layer.timing", **kw)

    # -- properties --------------------------------------------------------
    def set(self, layer, path, value):
        return self.ec.tool("set_property", layer=layer, path=path, value=value)

    def expr(self, layer, path, code):
        return self.ec.tool("set_property", layer=layer, path=path, expression=code)

    def key(self, layer, path, keys, ease="out", hold=False):
        """keys: [(t_comp, value), ...]; ease: preset name or list per segment."""
        ks = [{"time": t, "value": v} for t, v in keys]
        self.ec.tool("add_keyframe", layer=layer, path=path, keys=ks, timeBase="comp",
                     interpolation="hold" if hold else "bezier")
        if hold or len(keys) < 2:
            return
        if "position" in path or path.endswith("anchor") or path.endswith("poi"):
            self.ec.cmd("keys.select", keys=[{"layer": layer, "path": path, "time": t} for t, _ in keys],
                        timeBase="comp")
            self.ec.cmd("keys.interpolation", spatial="linear")
        eases = ease if isinstance(ease, list) else [ease] * (len(keys) - 1)
        for i, (t, _) in enumerate(keys):
            vel = {}
            if i < len(keys) - 1 and eases[i] != "linear":
                vel.update(outSpeed=0, outInfluence=EASE[eases[i]][0])
            if i > 0 and eases[i - 1] != "linear":
                vel.update(inSpeed=0, inInfluence=EASE[eases[i - 1]][1])
            if not vel:
                continue
            self.ec.cmd("keys.select", keys=[{"layer": layer, "path": path, "time": t}],
                        timeBase="comp")
            self.ec.cmd("keys.velocity", **vel)

    def fade(self, layer, t_in=None, t_out=None, dur=0.4, peak=100):
        ks = []
        if t_in is not None:
            ks += [(t_in, 0), (t_in + dur, peak)]
        if t_out is not None:
            ks += [(t_out - dur, peak), (t_out, 0)]
        self.key(layer, "transform/opacity", ks, ease="soft")

    # -- layers ------------------------------------------------------------
    def text(self, txt, name, pos, size=64, style="Bold", fill=CERAMIC, font=SANS,
             tracking=0, justify="left", leading=None):
        kw = dict(text=txt, name=name, position=pos, font=font, style=style, size=size,
                  fill=fill, tracking=tracking, justify=justify)
        if leading:
            kw["leading"] = leading
        self.ec.cmd("layer.newText", **kw)
        return name

    def rect(self, name, size, pos, fill=CERAMIC, radius=0, stroke=None, stroke_w=0,
             kind=None):
        kw = dict(kind=kind or ("rounded" if radius else "rect"), name=name, size=list(size),
                  fill=fill, position=list(pos))
        if stroke:
            kw.update(stroke=stroke, strokeWidth=stroke_w)
        self.ec.cmd("layer.newShape", **kw)
        if radius:
            self.set(name, "contents/group/contents/rect/roundness", radius)
        if stroke is None:
            pass
        return name

    def ellipse(self, name, size, pos, fill=ORANGE):
        self.ec.cmd("layer.newShape", kind="ellipse", name=name, size=list(size), fill=fill,
                    position=list(pos))
        return name

    def null(self, name, pos=None):
        self.ec.cmd("layer.newNull", name=name)
        if pos:
            self.set(name, "transform/position", pos)
        return name

    def parent(self, child, parent):
        self.ec.cmd("layer.setParent", layers=[child], parent=parent, compensate=True)

    def matte(self, layer, matte_layer, kind="alpha"):
        self.ec.cmd("layer.setTrackMatte", layer=layer, matte=matte_layer, kind=kind)

    def line_reveal(self, layer, box, t_in, t_out=None, rise=None, dur=13 / FPS, exit_dur=7 / FPS):
        """Text slides up into a rectangular mask (box = [cx, cy, w, h]); exits upward."""
        cx, cy, w, h = box
        m = layer + "_MATTE"
        self.rect(m, (w, h), (cx, cy), fill="#FFFFFF")
        self.matte(layer, m)
        rise = rise or h
        p = self.ec.tool("get_property", layer=layer, path="transform/position")["value"]
        x, y = p[0], p[1]
        ks = [(t_in, [x, y + rise]), (t_in + dur, [x, y])]
        eases = ["out"]
        if t_out is not None:
            ks += [(t_out - exit_dur, [x, y]), (t_out, [x, y - rise])]
            eases += ["linear", "in"]
        self.key(layer, "transform/position", ks, ease=eases)
        return m

    def audio(self, path, start, name=None, gain_db=0.0):
        imp = self.ec.cmd("file.import", paths=[str(path)])
        item = imp["items"][0]
        lid = self.ec.cmd("layer.addItem", item=item, time=start)["layer"]
        nm = name or Path(path).stem
        self.ec.cmd("layer.rename", layer=lid, name=nm)
        if gain_db:
            self.set(nm, "audio/levels", [gain_db, gain_db])
        return nm

    def render_frame(self, t, path, comp=None, max_side=1920):
        return self.ec.tool("render_frame", comp=comp or self.comp, time=t, path=str(path),
                            max_side=max_side)
