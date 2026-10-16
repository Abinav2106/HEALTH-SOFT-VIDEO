"""Render PATCH_Rig v1 turnaround stills for inspection."""
import sys
import time

from ecmcp import EC
from patch_rig import build_desk_set, build_patch

R = "/home/user/HEALTH-SOFT-VIDEO/CTRL_LAB_EP001/renders/tests/"
DESK = 700

with EC(autosave=False) as ec:
    ec.cmd("comp.new", name="PATCH_Rig_v1_ModelSheet", width=1920, height=1080, frameRate=30,
           duration=4, background="#17191C", renderer="advanced3D")
    build_desk_set(ec, DESK)
    t = time.time()
    rig = build_patch(ec, [960, DESK, 0])
    print("built", len(rig.names), "layers in", round(time.time() - t, 1), "s")
    ec.cmd("layer.newCamera", name="Cam", preset="50mm", position=[960, DESK - 380, -1500],
           poi=[960, DESK - 230, 0])
    for yaw in (0, -35, 90):
        ec.tool("set_property", layer="PATCH_CTRL", path="transform/rotationY", value=yaw)
        t = time.time()
        ec.tool("render_frame", time=0, path=R + f"patch_v1_yaw{yaw}.png", max_side=1920)
        print("yaw", yaw, "render", round(time.time() - t, 2), "s")
    ec.tool("save_project", path="/home/user/HEALTH-SOFT-VIDEO/CTRL_LAB_EP001/project/PATCH_Rig_v1_test.ecproj")
