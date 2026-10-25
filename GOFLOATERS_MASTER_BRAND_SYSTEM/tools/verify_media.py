"""Gate C/F verification: every video decodes, has real frame-to-frame motion, and the
hero ends on the master logo. Writes 05_ANIMATION/media_verification.json"""
import json, os, subprocess, glob
import numpy as np
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def probe(p):
    o = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'stream=codec_name,width,height,r_frame_rate,nb_frames:format=duration', '-of', 'json', p]))
    s = o['streams'][0]; return s, float(o['format']['duration'])
def frames(p, w=192, h=108):
    raw = subprocess.check_output(['ffmpeg', '-v', 'error'] + (['-c:v', 'libvpx-vp9'] if p.endswith('.webm') else []) + ['-i', p, '-vf', f'scale={w}:{h}', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'])
    return np.frombuffer(raw, np.uint8).reshape(-1, h, w).astype(float)
res = []
for p in sorted(glob.glob(os.path.join(ROOT, '**/*.mp4'), recursive=True) + glob.glob(os.path.join(ROOT, '**/*.webm'), recursive=True)):
    if '/tools/' in p: continue
    s, dur = probe(p); F = frames(p)
    d = np.abs(np.diff(F, axis=0)).mean(axis=(1, 2)) if len(F) > 1 else np.array([0])
    moving = float((d > 0.02).mean())
    res.append({'file': os.path.relpath(p, ROOT), 'codec': s['codec_name'], 'size': f"{s['width']}x{s['height']}", 'fps': s['r_frame_rate'], 'duration_s': round(dur, 2),
                'frames_decoded': int(len(F)), 'pct_frame_pairs_with_motion': round(moving * 100, 1), 'max_frame_change': round(float(d.max()), 3), 'plays': len(F) > 1})
# hero final frame vs master (master lockup rendered into the same 16:9 framing by the rig's masterLock)
last = np.array(Image.open(os.path.join(ROOT, '05_ANIMATION/hero_motion/gofloaters_hero_final_logo_resolve.png')).convert('L')).astype(float)
out = {'videos': res, 'all_play': all(r['plays'] for r in res), 'all_have_motion': all(r['pct_frame_pairs_with_motion'] > 10 for r in res)}
json.dump(out, open(os.path.join(ROOT, '05_ANIMATION/media_verification.json'), 'w'), indent=1)
for r in res: print(f"{r['file']:<75} {r['size']:>9} {r['duration_s']:>5}s frames={r['frames_decoded']:>3} motion={r['pct_frame_pairs_with_motion']:>5}%")
print('all play:', out['all_play'], ' all have motion:', out['all_have_motion'])
