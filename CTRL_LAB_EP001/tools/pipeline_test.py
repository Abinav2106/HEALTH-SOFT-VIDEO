"""Pipeline test: nested Advanced 3D comp + WAV audio layer → H.264/AAC MP4."""
import json
import time

from ecmcp import EC
from patch_rig import build_desk_set, build_patch

ROOT = "/home/user/HEALTH-SOFT-VIDEO/CTRL_LAB_EP001/"
OUT = ROOT + "renders/tests/pipeline_test.mp4"

with EC(autosave=False) as ec:
    ec.cmd("comp.new", name="SH_Test3D", width=1920, height=1080, frameRate=30, duration=2,
           background="#17191C", renderer="advanced3D")
    build_desk_set(ec, 700)
    build_patch(ec, [960, 700, 0])
    ec.cmd("layer.newCamera", name="Cam", preset="50mm", position=[960, 320, -1500], poi=[960, 470, 0])
    ec.tool("add_keyframe", layer="Head_CTRL", path="transform/rotationY",
            keys=[{"time": 0.3, "value": 0}, {"time": 0.9, "value": -20}], interpolation="easyEase")
    ec.cmd("comp.new", name="Master_Test", width=1920, height=1080, frameRate=30, duration=2,
           background="#17191C")
    imp = ec.cmd("file.import", paths=[ROOT + "assets/voiceover/prototype/P2.wav"])
    print("import", json.dumps(imp)[:300])
    print(ec.cmd("layer.addItem", item="SH_Test3D", time=0))
    print(ec.cmd("layer.addItem", item="P2.wav", time=0.2))
    print(ec.cmd("layer.newText", text="Pipeline test", name="T", font="Inter", style="Bold",
                 size=64, fill="#F3F0E9", position=[120, 140]))
    print(json.dumps(ec.tool("get_comp", comp="Master_Test"))[:600])
    q = ec.cmd("renderQueue.add", comp="Master_Test", format="h264", output=OUT, bitrate=16000)
    print("queue", q)
    t = time.time()
    print(ec.cmd("renderQueue.render", wait=True))
    print("render s", round(time.time() - t, 1))
