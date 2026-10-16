"""Feasibility test: desk floor, shadows, extruded+bevelled rounded box."""
import json
import re
import sys
import time

from ecmcp import EC

R = "/home/user/HEALTH-SOFT-VIDEO/CTRL_LAB_EP001/renders/tests/"

with EC(autosave=False) as ec:
    ec.cmd("comp.new", name="T3D", width=1920, height=1080, frameRate=30, duration=2,
           background="#17191C", renderer="advanced3D")
    ec.cmd("layer.new3dPrimitive", kind="plane", name="Desk", width=4000, height=4000,
           position=[960, 700, 0], baseColor="#D9D4CA", roughness=0.7)
    ec.tool("set_property", layer="Desk", path="transform/rotationX", value=90)
    ec.cmd("layer.new3dPrimitive", kind="sphere", name="Ball", radius=90,
           position=[1150, 610, 0], baseColor="#FF6938", roughness=0.4)
    # rounded box as extruded rounded-rect shape
    r = ec.cmd("layer.newShape", kind="rounded", name="RBox", size=[300, 240], fill="#F3F0E9",
               position=[820, 580])
    print("shape", r)
    lay = ec.tool("get_layer", layer="RBox", flat=True)
    paths = re.findall(r'"path": "([^"]+)"', json.dumps(lay))
    print([p for p in paths if "geometry" in p or "material" in p or "contents" in p][:60])
    ec.cmd("layer.setSwitch", layers=["RBox"], switch="threeD", value=True)
    ec.tool("set_property", layer="RBox", path="geometryOptions/extrusionDepth", value=200)
    ec.tool("set_property", layer="RBox", path="geometryOptions/bevelDepth", value=30)
    print(ec.tool("get_property", layer="RBox", path="geometryOptions/bevelStyle"))
    ec.tool("set_property", layer="RBox", path="transform/rotationY", value=-25)
    lay = ec.tool("get_layer", layer="RBox", flat=True)
    paths = re.findall(r'"path": "([^"]+)"', json.dumps(lay))
    print([p for p in paths if "geometry" in p or "material" in p][:60])
    ec.cmd("layer.newLight", kind="Spot", name="Key", intensity=120, castsShadows=True,
           shadowDarkness=60, shadowDiffusion=30, coneAngle=70, coneFeather=60,
           position=[200, -600, -700], poi=[960, 640, 0])
    ec.cmd("layer.newLight", kind="Ambient", name="Amb", intensity=30)
    ec.cmd("layer.newCamera", name="Cam", preset="50mm", position=[960, 300, -1700], poi=[960, 600, 0])
    t = time.time()
    ec.tool("render_frame", time=0, path=R + "t3d_b.png", max_side=1920)
    print("render s", round(time.time() - t, 2))
