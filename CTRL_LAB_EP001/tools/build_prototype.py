"""Build the CTRL? LAB EP001 prototype ("The claim check", 24 s) inside EffectCraft.

Every precomp runs on the master's clock (placed at t=0, trimmed with in/out), so a time
in this file is the same in every comp. Narration timings come from the measured
lines.json written by tools/narrate.py.

  /home/user/tts/.venv/bin/python build_prototype.py [--stills] [--render]
"""
from __future__ import annotations

import json
import sys
import time

from ecbuild import (CERAMIC, CERAMIC2, GRAPHITE, GRAPHITE2, INK2, MONO, MUTED, ORANGE, ROOT,
                     SANS, Builder, f2s)
from ecmcp import EC
from patch_anim import Patch
from patch_rig import U, build_desk_set, build_patch, contact_shadow

DUR = 24.0
PROJECT = ROOT / "project/CTRL_LAB_EP001_PROTO_v004.ecproj"
VO = ROOT / "assets/voiceover/prototype"
SFX = ROOT / "assets/sfx"
LINES = {l["id"]: l for l in json.loads((VO / "lines.json").read_text())}

# --- narration cue sheet (master seconds) -------------------------------
CUE = {"P1a": 0.50, "P1b": 3.25, "P1c": 4.70, "P2": 6.40, "P3": 10.10,
       "P4a": 13.00, "P4b": 14.50, "P4c": 15.90, "P5": 18.30}
for k, t in CUE.items():  # no line may run into the next
    pass
ORDER = list(CUE)
for a, b_ in zip(ORDER, ORDER[1:]):
    end = CUE[a] + LINES[a]["seconds"]
    assert end + 0.15 <= CUE[b_], f"{a} ends {end:.2f}s, overlaps {b_} at {CUE[b_]}"

SFX_CUES = [
    ("servo", 2.30, -4), ("tap", 2.72, -6), ("tick", 3.27, -4), ("tick", 4.72, -6),
    ("servo_long", 6.30, -4), ("tick", 7.86, -3), ("servo", 8.00, -6), ("key", 8.52, -4),
    ("key", 8.60, -6), ("air", 10.05, -2), ("tick", 10.78, -6),
    ("tick", 13.47, -4), ("tick", 14.97, -4), ("tick", 16.37, -4), ("air", 17.52, -2),
    ("key", 18.55, -2), ("tick", 18.76, -8), ("tick", 18.96, -8), ("error", 19.16, -2),
    ("servo", 19.32, -5), ("found", 20.40, -2), ("air", 21.00, -2), ("tap", 21.55, -3),
]

T_CARD_IN, T_XFORM, T_CHECK_OUT, T_DEMO, T_TITLE = 2.20, 10.10, 17.95, 17.75, 21.00


def build_sh01(b: Builder):
    """3D desk: PATCH meets the glossy promise."""
    b.comp_new("SH01_PATCH_Desk", DUR, renderer="advanced3D")
    ec = b.ec
    build_desk_set(ec, 700)
    build_patch(ec, [960, 700, 0])
    ec.cmd("layer.newCamera", name="CAM_SH01", preset="50mm", position=[1120, 330, -1350],
           poi=[1120, 480, 0])
    b.key("CAM_SH01", "transform/position", [(0, [1120, 330, -1350]), (10.8, [1110, 335, -1290])],
          ease="soft")
    p = Patch(b)
    p.blink(1.40)
    p.gaze(2.12, 0.55, -0.05)                      # eyes lead…
    p.move("Head_CTRL", "transform/rotationY", [(2.25, 0), (2.70, -16)], ease="out")  # …head follows
    p.move("Head_CTRL", "transform/rotation", [(3.20, 0), (3.60, -4)], ease="out")
    p.blink(4.95)
    # P2 "That sounds impressive." — lean in and inspect
    p.move("Torso_CTRL", "transform/rotationX", [(6.30, 0), (6.95, 6), (9.55, 6), (10.25, 0)],
           ease=["inout", "linear", "inout"])
    p.move("Head_CTRL", "transform/rotationX", [(6.40, 0), (7.00, 4)], ease="inout")
    p.expr(6.50, "inspect")
    p.gaze(6.50, 0.65, 0.05)
    # "Let's see whether it actually works." — skeptical, point at the card
    p.expr(7.80, "skeptical")
    p.move("ShoulderR_CTRL", "transform/rotation", [(8.00, 0), (8.50, -52), (9.30, -52), (9.85, 0)],
           ease=["out", "linear", "inout"])
    p.move("ElbowR_CTRL", "transform/rotationY", [(8.05, 0), (8.55, -28), (9.30, -28), (9.85, 0)],
           ease=["out", "linear", "inout"])
    p.expr(9.60, "neutral")
    p.blink(10.05)
    p.commit_face()


def build_card(b: Builder):
    """2D: glossy promise card that unfolds into the claim-check checklist."""
    b.comp_new("GFX_PromiseToChecklist", DUR, bg=GRAPHITE)
    ec = b.ec
    cx, cy, cw, ch = 1400, 470, 700, 420
    b.null("CardCTRL", [cx, cy])
    # soft shadow, card, gloss
    b.rect("CardShadow", (cw, ch), (cx + 8, cy + 26), fill="#000000", radius=30)
    b.set("CardShadow", "transform/opacity", 35)
    ec.tool("add_effect", layer="CardShadow", effect="Gaussian Blur", values={"blurriness": 40})
    b.rect("Card", (cw, ch), (cx, cy), fill=CERAMIC, radius=28)
    b.rect("CardGlossMatte", (cw, ch), (cx, cy), fill="#FFFFFF", radius=28)
    b.rect("CardGloss", (140, 900), (cx - 600, cy), fill="#FFFFFF")
    b.set("CardGloss", "transform/rotation", 24)
    b.set("CardGloss", "transform/opacity", 55)
    b.matte("CardGloss", "CardGlossMatte")
    for n in ("CardShadow", "Card", "CardGlossMatte", "CardGloss"):
        b.parent(n, "CardCTRL")
    # card copy (left edge x = cx - 300)
    lx = cx - 300
    b.text("THE PROMISE", "TX_PromiseKicker", [lx, cy - 140], size=26, style="Regular",
           fill=INK2, font=MONO, tracking=200)
    b.text("10× faster", "TX_10x", [lx, cy + 30], size=118, style="Black", fill=GRAPHITE,
           tracking=-30)
    b.text("*", "TX_Asterisk", [lx + 588, cy - 22], size=96, style="Black", fill=ORANGE)
    b.text("Works every time.", "TX_EveryTime", [lx, cy + 104], size=50, style="SemiBold",
           fill=INK2, tracking=-10)
    b.text("* CLAIM, NOT YET TESTED", "TX_Untested", [lx, cy + 172], size=26, style="Regular",
           fill=ORANGE, font=MONO, tracking=120)
    for n in ("TX_PromiseKicker", "TX_10x", "TX_Asterisk", "TX_EveryTime", "TX_Untested"):
        b.parent(n, "CardCTRL")

    # entrance: slides in from the right with a small rotation settle
    b.key("CardCTRL", "transform/position", [(T_CARD_IN, [cx + 900, cy + 30]), (T_CARD_IN + 0.52, [cx, cy])],
          ease="out")
    b.key("CardCTRL", "transform/rotation", [(T_CARD_IN, 5), (T_CARD_IN + 0.62, 0)], ease="out")
    b.key("CardGloss", "transform/position", [(2.95, [cx - 600, cy]), (3.55, [cx + 600, cy])], ease="inout")
    b.fade("TX_PromiseKicker", t_in=2.62, dur=0.25)
    b.key("TX_10x", "transform/scale", [(3.25, [86, 86]), (3.25 + 10 / 30, [100, 100])], ease="out")
    b.fade("TX_10x", t_in=3.25, dur=4 / 30)
    ev = ec.tool("get_property", layer="TX_EveryTime", path="transform/position")["value"]
    b.key("TX_EveryTime", "transform/position",
          [(4.70, [ev[0], ev[1] + 36]), (4.70 + 12 / 30, [ev[0], ev[1]])], ease="out")
    b.fade("TX_EveryTime", t_in=4.70, dur=6 / 30)
    b.key("TX_Asterisk", "transform/scale", [(7.85, [0, 0]), (7.85 + 7 / 30, [118, 118]), (7.85 + 12 / 30, [100, 100])],
          ease=["snap", "soft"])
    b.fade("TX_Untested", t_in=8.52, dur=4 / 30)
    # copy clears before the card unfolds
    for n in ("TX_PromiseKicker", "TX_10x", "TX_Asterisk", "TX_EveryTime", "TX_Untested"):
        b.key(n, "transform/opacity", [(9.92, 100), (10.12, 0)], ease="in")

    # object-continuity transform: the card becomes the checklist panel
    b.key("CardCTRL", "transform/position", [(T_XFORM, [cx, cy]), (T_XFORM + 0.70, [960, 540])], ease="inout")
    for n in ("Card", "CardGlossMatte", "CardShadow"):
        b.key(n, "contents/group/contents/rect/size", [(T_XFORM, [cw, ch]), (T_XFORM + 0.70, [1240, 720])],
              ease="inout")

    # checklist content (absolute layout inside the 1240×720 panel: x 340–1580, y 180–900)
    X0 = 430
    b.text("THE CLAIM CHECK", "TX_CheckKicker", [X0, 292], size=28, style="Regular", fill=ORANGE,
           font=MONO, tracking=220)
    b.text("Three checks. Every trick.", "TX_CheckTitle", [X0, 378], size=66, style="Bold",
           fill=GRAPHITE, tracking=-25)
    b.rect("CheckRule", (1060, 3), (X0 + 530, 432), fill="#D3CDC1")
    b.set("CheckRule", "transform/anchor", [-530, 0])
    b.set("CheckRule", "transform/position", [X0, 432])
    b.fade("TX_CheckKicker", t_in=10.78, dur=0.2)
    b.line_reveal("TX_CheckTitle", [X0 + 540, 356, 1100, 90], 11.15)
    b.key("CheckRule", "transform/scale", [(11.55, [0, 100]), (12.10, [100, 100])], ease="out")

    rows = [("01", "Where the feature lives", 13.00), ("02", "What you actually do", 14.50),
            ("03", "What our test produced", 15.90)]
    for i, (num, label, t) in enumerate(rows):
        y = 540 + i * 118
        nm = f"Row{num}"
        box = b.rect(f"{nm}_Box", (54, 54), (X0 + 27, y - 19), fill=CERAMIC, radius=12,
                     stroke=GRAPHITE, stroke_w=3)
        b.key(box, "transform/scale", [(t, [0, 0]), (t + 8 / 30, [100, 100])], ease="snap")
        b.text(num, f"{nm}_Num", [X0 + 92, y], size=26, style="Regular", fill=INK2, font=MONO)
        b.fade(f"{nm}_Num", t_in=t + 2 / 30, dur=6 / 30)
        b.text(label, f"{nm}_Label", [X0 + 150, y], size=54, style="SemiBold", fill=GRAPHITE,
               tracking=-15)
        b.line_reveal(f"{nm}_Label", [X0 + 150 + 520, y - 18, 1060, 76], t + 2 / 30)
        tick_t = t + 0.47
        # tick: two rounded strokes drawn from the joint outward
        jx, jy = X0 + 22, y - 10
        a1, a2 = f"{nm}_TickA", f"{nm}_TickB"
        b.rect(a1, (20, 8), (0, 0), fill=ORANGE, radius=4)
        b.set(a1, "contents/group/contents/rect/position", [10, 0])
        b.set(a1, "transform/position", [jx, jy])
        b.set(a1, "transform/rotation", 225)
        b.rect(a2, (40, 8), (0, 0), fill=ORANGE, radius=4)
        b.set(a2, "contents/group/contents/rect/position", [20, 0])
        b.set(a2, "transform/position", [jx, jy])
        b.set(a2, "transform/rotation", -50)
        b.key(a1, "transform/scale", [(tick_t, [0, 100]), (tick_t + 3 / 30, [100, 100])], ease="snap")
        b.key(a2, "transform/scale", [(tick_t + 3 / 30, [0, 100]), (tick_t + 9 / 30, [100, 100])], ease="out")
    # the one that matters: an orange underline under row 03
    b.rect("Row03_Emphasis", (560, 6), (X0 + 150 + 280, 540 + 2 * 118 + 22), fill=ORANGE, radius=3)
    b.set("Row03_Emphasis", "transform/anchor", [-280, 0])
    b.set("Row03_Emphasis", "transform/position", [X0 + 150, 540 + 2 * 118 + 22])
    b.key("Row03_Emphasis", "transform/scale", [(16.85, [0, 100]), (17.30, [100, 100])], ease="out")


def build_demo_ui(b: Builder):
    """2D illustrative interface (1280×800) shown on the monitor in SH02."""
    b.comp_new("GFX_DemoUI_Illustrative", DUR, bg=CERAMIC, w=1280, h=800)
    b.rect("UI_TopBar", (1280, 72), (640, 36), fill=GRAPHITE)
    b.text("notes-helper", "UI_AppName", [40, 47], size=24, style="Regular", fill=CERAMIC, font=MONO)
    b.text("ILLUSTRATIVE", "UI_Tag", [1080, 47], size=20, style="Regular", fill=ORANGE, font=MONO,
           tracking=160)
    b.text("INPUT", "UI_InputLbl", [40, 140], size=20, style="Regular", fill=INK2, font=MONO, tracking=160)
    b.rect("UI_InputBox", (760, 96), (420, 210), fill="#FFFFFF", radius=14, stroke="#D3CDC1", stroke_w=2)
    b.text("meeting_notes_TEST.txt", "UI_InputFile", [70, 222], size=30, style="Regular", fill=GRAPHITE, font=MONO)
    b.rect("UI_RunBtn", (220, 96), (1000, 210), fill=ORANGE, radius=14)
    b.text("Run", "UI_RunLbl", [1000, 222], size=34, style="SemiBold", fill=CERAMIC, justify="center")
    b.text("OUTPUT", "UI_OutputLbl", [40, 330], size=20, style="Regular", fill=INK2, font=MONO, tracking=160)
    b.rect("UI_OutputBox", (1200, 380), (640, 545), fill="#FFFFFF", radius=14, stroke="#D3CDC1", stroke_w=2)
    steps = [("Step 1   read input", "done", 18.76), ("Step 2   draft summary", "done", 18.96),
             ("Step 3   cite sources", "failed", 19.16)]
    for i, (lbl, status, t) in enumerate(steps):
        y = 430 + i * 96
        n = f"UI_Step{i + 1}"
        if status == "failed":
            b.rect(n + "_Flag", (1160, 80), (640, y - 12), fill="#FFF1EB", radius=10, stroke=ORANGE, stroke_w=3)
            b.fade(n + "_Flag", t_in=t, dur=3 / 30)
        b.text(lbl, n, [80, y], size=32, style="Regular", fill=GRAPHITE, font=MONO)
        b.text(status.upper() if status == "failed" else status, n + "_Status", [1080, y], size=30,
               style="SemiBold", fill=ORANGE if status == "failed" else INK2, justify="right")
        b.fade(n, t_in=t, dur=3 / 30)
        b.fade(n + "_Status", t_in=t + 2 / 30, dur=3 / 30)
    b.text("no sources returned", "UI_Step3_Detail", [80, y + 34], size=22, style="Regular",
           fill=ORANGE, font=MONO)
    b.fade("UI_Step3_Detail", t_in=19.30, dur=4 / 30)
    # cursor: ring pointer, moves to Run, clicks
    b.ellipse("UI_Cursor", (34, 34), (520, 640), fill=GRAPHITE)
    b.ellipse("UI_CursorDot", (12, 12), (520, 640), fill=CERAMIC)
    b.parent("UI_CursorDot", "UI_Cursor")
    b.key("UI_Cursor", "transform/position", [(18.00, [520, 640]), (18.50, [1062, 238])], ease="inout")
    b.key("UI_Cursor", "transform/scale", [(18.55, [100, 100]), (18.60, [78, 78]), (18.72, [100, 100])],
          ease=["snap", "out"])
    b.key("UI_RunBtn", "transform/scale", [(18.55, [100, 100]), (18.60, [96, 96]), (18.72, [100, 100])],
          ease=["snap", "out"])


def build_sh02(b: Builder):
    """3D desk: PATCH watches the illustrative interface fail, then finds the reason."""
    b.comp_new("SH02_PATCH_Demo", DUR, renderer="advanced3D")
    ec = b.ec
    build_desk_set(ec, 700)
    build_patch(ec, [600, 700, -40])
    # monitor
    mon_c, rotY = [1215, 430, 160], 14
    from patch_rig import Rig
    r = Rig(ec, [0, 0, 0], "")
    r.rbox("MonitorBody", (660, 430, 36), mon_c, GRAPHITE, rough=0.5, roundness=22, bevel=6)
    r.prim("cylinder", "MonitorNeck", [mon_c[0], 700 - 95, mon_c[2] + 30], radius=16, height=190,
           baseColor="#3A3D42", metallic=0.9, roughness=0.3)
    r.rbox("MonitorFoot", (220, 16, 150), [mon_c[0], 700 - 8, mon_c[2] + 30], GRAPHITE, rough=0.5,
           roundness=8, bevel=3)
    contact_shadow(ec, mon_c[0], 700, mon_c[2] + 30, 170, name="MonitorShadow", opacity=45)
    for n in ("MonitorBody",):
        b.set(n, "transform/rotationY", rotY)
    scr = b.add_item("GFX_DemoUI_Illustrative", 0, name="MonitorScreen")
    ec.cmd("layer.setSwitch", layers=["MonitorScreen"], switch="threeD", value=True)
    b.set("MonitorScreen", "transform/scale", [48, 48, 48])
    import math
    off = 19  # in front of the body's front face
    b.set("MonitorScreen", "transform/position",
          [mon_c[0] - off * math.sin(math.radians(rotY)), mon_c[1], mon_c[2] - 18 - off * math.cos(math.radians(rotY)) + 18])
    b.set("MonitorScreen", "transform/rotationY", rotY)
    b.set("MonitorScreen", "materialOptions/acceptsLights", 0)
    b.set("MonitorScreen", "materialOptions/castsShadows", 0)
    ec.cmd("layer.newCamera", name="CAM_SH02", preset="50mm", position=[920, 290, -1720],
           poi=[920, 450, 60])
    b.key("CAM_SH02", "transform/position", [(T_DEMO, [920, 290, -1720]), (T_TITLE + 0.5, [915, 295, -1650])],
          ease="soft")
    p = Patch(b)
    b.set("Head_CTRL", "transform/rotationY", -30)
    b.set("PATCH_CTRL", "transform/rotationY", -12)
    p.gaze(T_DEMO, 0.55, -0.15, dur=1)
    p.blink(18.10)
    p.move("Torso_CTRL", "transform/rotationX", [(18.55, 0), (18.95, 4)], ease="out")
    p.expr(19.18, "error", dur=3)
    p.move("Head_CTRL", "transform/rotationX", [(19.20, 0), (19.32, -5), (19.75, 0)], ease=["snap", "inout"])
    p.expr(19.95, "inspect")
    p.status_pulse(20.40)
    p.expr(20.42, "interested")
    p.move("Head_CTRL", "transform/rotationY", [(20.55, -30), (20.95, -12)], ease="out")
    p.gaze(20.55, 0.1, 0.0)
    p.commit_face()


def build_title(b: Builder):
    b.comp_new("GFX_Title", DUR, bg=GRAPHITE)
    b.text("CTRL? LAB", "TX_Wordmark", [960, 600], size=196, style="Black", fill=CERAMIC,
           tracking=-40, justify="center")
    b.ec.cmd("layer.setText", layer="TX_Wordmark", range=[4, 5], fill=ORANGE)
    b.line_reveal("TX_Wordmark", [960, 530, 1300, 230], 21.45, rise=200, dur=16 / 30)
    b.text("EPISODE 001  ·  PROTOTYPE SEQUENCE  ·  NOT FOR PUBLICATION", "TX_TitleSub",
           [960, 700], size=26, style="Regular", fill=MUTED, font=MONO, tracking=160, justify="center")
    b.fade("TX_TitleSub", t_in=21.95, dur=0.35)


def build_master(b: Builder):
    b.comp_new("PROTO_Master", DUR)
    ec = b.ec
    b.add_item("SH01_PATCH_Desk", 0, name="SH01")
    b.timing("SH01", out=10.85)
    b.rect("BG_Graphite", (1920, 1080), (960, 540), fill=GRAPHITE)
    b.key("BG_Graphite", "transform/opacity", [(T_XFORM, 0), (T_XFORM + 0.55, 100)], ease="soft")
    b.timing("BG_Graphite", in_=T_XFORM, out=T_CHECK_OUT)
    b.add_item("GFX_PromiseToChecklist", 0, name="GFX_Card")
    b.timing("GFX_Card", in_=T_CARD_IN, out=T_CHECK_OUT)
    b.add_item("SH02_PATCH_Demo", 0, name="SH02")
    b.timing("SH02", in_=T_DEMO, out=T_TITLE + 0.5)
    # push-wipe 1: a graphite panel crosses right→left, uncovering SH02
    b.rect("WIPE_1", (1920, 1080), (960, 540), fill=GRAPHITE2)
    b.key("WIPE_1", "transform/position", [(17.50, [960 + 1920, 540]), (17.92, [960, 540]), (18.00, [960, 540]), (18.36, [960 - 1920, 540])],
          ease=["inout", "linear", "out"])
    b.timing("WIPE_1", in_=17.45, out=18.40)
    # label for the reconstruction
    b.rect("LBL_Illustrative_Bg", (500, 50), (120 + 250, 93), fill=GRAPHITE, radius=23)
    b.text("ILLUSTRATIVE RECONSTRUCTION", "LBL_Illustrative", [120 + 250, 101], size=22,
           style="Regular", fill=CERAMIC, font=MONO, tracking=140, justify="center")
    for n in ("LBL_Illustrative_Bg", "LBL_Illustrative"):
        b.fade(n, t_in=18.25, t_out=T_TITLE, dur=0.25)
        b.timing(n, in_=18.2, out=T_TITLE)
    b.add_item("GFX_Title", 0, name="GFX_Title")
    b.timing("GFX_Title", in_=T_TITLE)
    b.set("GFX_Title", "transform/position", [960, 540])
    b.key("GFX_Title", "transform/position", [(T_TITLE, [960 + 1920, 540]), (T_TITLE + 0.45, [960, 540])],
          ease="inout")
    # audio: narration then SFX
    for k, t in CUE.items():
        b.audio(VO / f"{k}.wav", t, name=f"VO_{k}", gain_db=-1.6)
    for i, (snd, t, g) in enumerate(SFX_CUES):
        b.audio(SFX / f"{snd}.wav", t, name=f"SFX_{i:02d}_{snd}", gain_db=g)


def main():
    stills = "--stills" in sys.argv
    render = "--render" in sys.argv
    t0 = time.time()
    with EC(autosave=True, log=ROOT / "project/proto_build_mcp.log") as ec:
        b = Builder(ec)
        build_sh01(b)
        build_card(b)
        build_demo_ui(b)
        build_sh02(b)
        build_title(b)
        build_master(b)
        ec.tool("save_project", path=str(PROJECT))
        print("built + saved", PROJECT, round(time.time() - t0, 1), "s")
        if stills:
            for t in (1.0, 3.0, 4.2, 5.6, 7.2, 8.9, 10.4, 11.9, 13.8, 16.6, 17.4, 17.95, 18.7, 19.5, 20.7, 21.25, 22.5, 23.9):
                b.render_frame(t, ROOT / f"renders/tests/proto_v004_{t:05.2f}.png", comp="PROTO_Master",
                               max_side=1280)
            print("stills", round(time.time() - t0, 1), "s")
        if render:
            out = ROOT / "renders/tests/CTRL_LAB_EP001_prototype_v004.mp4"
            ec.cmd("renderQueue.add", comp="PROTO_Master", format="h264", output=str(out),
                   bitrate=20000, timeSpan="comp")
            r = ec.cmd("renderQueue.render", wait=True)
            print("render", r.get("failed"), round(time.time() - t0, 1), "s")


if __name__ == "__main__":
    main()
