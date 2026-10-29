"""Cut the working layers for "Find the Spark" out of the flattened final storyboard.

The storyboard (1024x1536, one flattened raster) is the only supplied visual. Nothing here
redraws or regenerates artwork: every layer is a crop of the storyboard, matted, cleaned of
baked-in storyboard graphics (routes, captions, the baked mascot) and upscaled for 1080x1920.
They are stand-ins until the original files arrive (see gofloaters/docs/01_asset_audit.md).

  python3 -I gofloaters/tools/extract_storyboard.py <storyboard.webp|png> [--debug DIR]

Writes PNGs to remotion/public/gofloaters/storyboard/ (gitignored: client artwork).
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "remotion/public/gofloaters/storyboard"

# Storyboard panel rectangles (x0, y0, x1, y1), inset a few px from the rounded borders.
P3_MAP = (679, 127, 1009, 701)
P4_ROOM = (17, 781, 349, 1375)
P5_REWARD = (361, 781, 663, 1375)
HEADER_TILO = (696, 28, 846, 108)
HEADER_WORDMARK = (850, 40, 1008, 98)
PAGE_BG = np.array([240, 251, 254], np.float32)


def up(img: np.ndarray, k: float, sharpen: float = 0.35) -> np.ndarray:
    """Lanczos upscale plus an unsharp mask (no AI upscaling, no invented detail). Photographic
    plates use a light touch: the storyboard's compression blocks posterise under a strong one."""
    h, w = img.shape[:2]
    if sharpen < 0.3:
        img = cv2.bilateralFilter(img, 5, 18, 3)  # calm the codec blocking before enlarging
    big = cv2.resize(img, (round(w * k), round(h * k)), interpolation=cv2.INTER_CUBIC if sharpen < 0.3 else cv2.INTER_LANCZOS4)
    blur = cv2.GaussianBlur(big, (0, 0), k * 0.6)
    return np.clip(big.astype(np.float32) * (1 + sharpen) - blur.astype(np.float32) * sharpen, 0, 255).astype(np.uint8)


def save_rgba(name: str, rgb: np.ndarray, alpha: np.ndarray | None = None) -> None:
    if alpha is None:
        Image.fromarray(rgb).save(OUT / name, optimize=True)
    else:
        Image.fromarray(np.dstack([rgb, alpha])).save(OUT / name, optimize=True)
    print(f"  {name}: {rgb.shape[1]}x{rgb.shape[0]}")


# --- Tilo and aircraft ------------------------------------------------------------------

def tilo(sb: np.ndarray, k: int = 6) -> dict:
    """Matte the header Tilo (cleanest instance, flat light background) without touching the art.

    Background = pixels connected to the crop border that are close to the page colour. The white
    dog is enclosed by its outline, so it never joins the background region.
    """
    x0, y0, x1, y1 = HEADER_TILO
    crop = sb[y0:y1, x0:x1]
    big = up(crop, k)
    f = big.astype(np.float32)
    dist = np.abs(f - PAGE_BG).max(axis=2)
    near_bg = (dist < 34).astype(np.uint8)
    # Seal hairline gaps in the outline before flooding so the white body cannot leak.
    outline = (dist >= 34).astype(np.uint8)
    outline = cv2.morphologyEx(outline, cv2.MORPH_CLOSE, np.ones((k // 2 + 1, k // 2 + 1), np.uint8))
    candidate = (near_bg & (1 - outline)).astype(np.uint8)
    n, lab = cv2.connectedComponents(candidate, connectivity=4)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(border))
    # Soft edge: inside the background band, unmix luminance against the dark outline.
    lum = f.mean(axis=2)
    lum_bg, lum_line = PAGE_BG.mean(), 40.0
    edge_alpha = np.clip((lum_bg - lum) / (lum_bg - lum_line), 0, 1)
    # The unmix also covers the outer half of the outline's anti-aliasing (object side of the
    # flood boundary), otherwise a pale rim survives on dark plates.
    rim = cv2.dilate(bg.astype(np.uint8), np.ones((k - 1, k - 1), np.uint8)).astype(bool)
    alpha = np.where(bg, edge_alpha, np.where(rim, np.maximum(edge_alpha, 0.0), 1.0))
    alpha = cv2.GaussianBlur(alpha.astype(np.float32), (0, 0), 0.6)
    alpha[~cv2.dilate(rim.astype(np.uint8), np.ones((3, 3))).astype(bool)] = 1.0
    rgb = big.copy()
    # Edge pixels are un-premultiplied against the page colour so they carry the outline colour.
    band = rim & (alpha > 0.02)
    rgb[band] = np.clip((f[band] - (1 - alpha[band, None]) * PAGE_BG) / np.maximum(alpha[band, None], 0.25), 0, 255).astype(np.uint8)
    a8 = (alpha * 255).astype(np.uint8)
    save_rgba("tilo.png", rgb, a8)

    # Same artwork without its three speed lines (separate components left of the tail).
    comp_n, comp, stats, _ = cv2.connectedComponentsWithStats((a8 > 40).astype(np.uint8), connectivity=8)
    main = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
    keep = cv2.dilate((comp == main).astype(np.uint8), np.ones((5, 5))).astype(bool)
    a_nl = np.where(keep, a8, 0).astype(np.uint8)
    save_rgba("tilo_nolines.png", rgb, a_nl)

    ys, xs = np.nonzero(a_nl > 40)
    # Propeller hub (yellow, right edge) and nose direction, in normalised image coordinates.
    return {"w": rgb.shape[1], "h": rgb.shape[0], "bodyBox": [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())]}


def wordmark(sb: np.ndarray, k: int = 4) -> dict:
    """Unmix the dark wordmark and tagline from the flat page background (colour preserved)."""
    x0, y0, x1, y1 = HEADER_WORDMARK
    big = up(sb[y0:y1, x0:x1], k).astype(np.float32)
    a = np.clip(((PAGE_BG - big) / PAGE_BG).max(axis=2) * 1.08, 0, 1)
    a[a < 0.06] = 0
    fg = np.clip((big - (1 - a[..., None]) * PAGE_BG) / np.maximum(a[..., None], 1e-3), 0, 255)
    save_rgba("logo_wordmark.png", fg.astype(np.uint8), (a * 255).astype(np.uint8))
    return {"w": big.shape[1], "h": big.shape[0]}


# --- photographic plates -----------------------------------------------------------------

def _fsr(rgb: np.ndarray, mask: np.ndarray) -> np.ndarray:
    """Frequency-selective reconstruction (opencv-contrib xphoto) for thin or small holes."""
    src = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
    out = src.copy()
    cv2.xphoto.inpaint(src, 255 - mask, out, cv2.xphoto.INPAINT_FSR_FAST)
    return cv2.cvtColor(out, cv2.COLOR_BGR2RGB)


def _clone_from(img: np.ndarray, mask: np.ndarray, dx: float, dy: float) -> np.ndarray:
    """Fill `mask` with the same image offset by (dx, dy) (content comes from (x-dx, y-dy)),
    Poisson-blended so the patch inherits the surrounding light."""
    h, w = img.shape[:2]
    src = cv2.warpAffine(img, np.float32([[1, 0, dx], [0, 1, dy]]), (w, h), borderMode=cv2.BORDER_REFLECT)
    ys, xs = np.nonzero(mask)
    p = 4
    pad = lambda im: cv2.copyMakeBorder(im, p, p, p, p, cv2.BORDER_REFLECT)  # noqa: E731
    m = mask.copy()
    m[[0, -1], :] = 0
    m[:, [0, -1]] = 0
    ctr = ((xs.min() + xs.max()) // 2 + p, (ys.min() + ys.max()) // 2 + p)
    return cv2.seamlessClone(pad(src), pad(img), pad(m), ctr, cv2.NORMAL_CLONE)[p:-p, p:-p]


def _rect(img: np.ndarray, x0: int, y0: int, x1: int, y1: int) -> np.ndarray:
    m = np.zeros(img.shape[:2], np.uint8)
    cv2.rectangle(m, (x0, y0), (x1, y1), 255, -1)
    return m


def _cyan(rgb: np.ndarray, loose: bool = False) -> np.ndarray:
    f = rgb.astype(int)
    r, g, b = f[..., 0], f[..., 1], f[..., 2]
    if loose:
        hit = (b > 110) & (b - r > 35) & (g - r > 15) & (b >= g - 10)
    else:
        hit = ((b > 120) & (b - r > 45) & (g - r > 20) & (b >= g - 10)) | ((r > 215) & (g > 215) & (b > 215))
    return cv2.dilate(hit.astype(np.uint8) * 255, np.ones((7, 7), np.uint8))


def aerial(sb: np.ndarray, k: int = 4) -> dict:
    """Panel 3 aerial without the baked route, nodes, mascot, light cone, captions and inset."""
    x0, y0, x1, y1 = P3_MAP
    c = sb[y0:y1, x0:x1].copy()
    h, w = c.shape[:2]
    slope = 0.257  # the street grid runs at this dx/dy; copies along it keep streets continuous
    regions = [
        (_rect(c, 62, 202, 199, 281) | cv2.fillPoly(np.zeros((h, w), np.uint8), [np.array([(110, 258), (168, 256), (232, 300), (232, 334), (148, 348)])], 255), 110),
        (_rect(c, 111, 282, w - 1, 550), 270),
        (_rect(c, 15, 418, 110, h - 1), 170),
    ]
    big = np.zeros((h, w), np.uint8)
    for m, _ in regions:
        big |= m
    out = _fsr(c, _cyan(c) & ~big)
    for m, d in regions:
        out = _clone_from(out, m, slope * d, d)
    out = _fsr(out, _cyan(out, loose=True))
    f = out.astype(int)
    teal = ((f[..., 1] - f[..., 0] > 80) & (f[..., 2] - f[..., 0] > 50)).astype(np.uint8) * 255
    spots = np.zeros((h, w), np.uint8)
    for (sx, sy, r) in ((75, 288, 14), (210, 240, 12), (272, 510, 12), (327, 145, 8)):
        cv2.circle(spots, (sx, sy), r, 255, -1)
    out = _fsr(out, cv2.dilate(teal, np.ones((5, 5), np.uint8)) | spots)
    out = out[: h - 10]
    big_img = up(out, k, 0.15)
    save_rgba("aerial.png", big_img)
    return {"w": big_img.shape[1], "h": big_img.shape[0]}


def workspace(sb: np.ndarray, k: int = 5) -> dict:
    """The selected building from the panel 3 inset, pin removed, rectified to an upright card."""
    img = sb.copy()
    pin = np.zeros(img.shape[:2], np.uint8)
    cv2.rectangle(pin, (880, 410), (926, 462), 255, -1)
    cv2.rectangle(pin, (897, 455), (912, 512), 255, -1)
    img = _fsr(img, pin)
    # Inner photo corners of the tilted white frame (TL, TR, BR, BL), measured on the storyboard.
    quad = np.float32([(800, 466), (953, 428), (1003, 617), (837, 662)])
    W, H = 160, 204
    M = cv2.getPerspectiveTransform(quad, np.float32([(0, 0), (W, 0), (W, H), (0, H)]))
    flat = cv2.warpPerspective(img, M, (W, H), flags=cv2.INTER_CUBIC)
    big_img = up(flat, k, 0.15)
    save_rgba("workspace.png", big_img)
    return {"w": big_img.shape[1], "h": big_img.shape[0]}


def room(sb: np.ndarray, k: int = 4) -> dict:
    """Panel 4 meeting room without the baked "Found!", mascot and bone; plus the foreground
    door frame as its own layer and a background plate with the door filled for parallax."""
    x0, y0, x1, y1 = P4_ROOM
    c = sb[y0:y1, x0:x1].copy()
    h, w = c.shape[:2]
    txt = _rect(c, 128, 84, 322, 172)
    dark = (c.max(axis=2) < 110).astype(np.uint8) * 255
    m = cv2.dilate(dark & txt, np.ones((7, 7), np.uint8))
    m |= _rect(c, 120, 296, 222, 362) | _rect(c, 225, 294, 300, 364)
    clean = _fsr(c, m)
    # Trees behind the baked mascot/bone: copies of the tree band above, in two strips so the
    # second strip copies from rows the first one already cleaned.
    for top, bot in ((298, 330), (328, 346)):
        clean = _clone_from(clean, _rect(c, 124, top, 302, bot), 0, 32)
    # Foreground door: glass leaf + dark frame on the left, and the handle.
    door = np.zeros((h, w), np.uint8)
    cv2.rectangle(door, (0, 0), (80, h - 1), 255, -1)
    cv2.rectangle(door, (80, 292), (100, 446), 255, -1)
    door_a = cv2.GaussianBlur(door, (0, 0), 1.2)
    behind = _fsr(clean, cv2.dilate(door, np.ones((9, 9), np.uint8)))
    plate, plate_bg = up(clean, k, 0.12), up(behind, k, 0.12)
    save_rgba("room.png", plate)
    save_rgba("room_bg.png", plate_bg)
    save_rgba("room_door.png", plate, cv2.resize(door_a, (plate.shape[1], plate.shape[0]), interpolation=cv2.INTER_CUBIC))
    return {"w": plate.shape[1], "h": plate.shape[0], "k": k, "doorRight": 80 * k,
            "tiloBox": [120 * k, 296 * k, 222 * k, 362 * k], "boneBox": [227 * k, 300 * k, 297 * k, 362 * k]}


def gift(sb: np.ndarray, k: int = 4) -> dict:
    """Panel 5 gift box + Amazon gift-card artwork as one intact matted asset (no hidden surfaces
    invented). The baked flight line is removed; the baked Tilo stays and is covered exactly by
    the Tilo layer in the composition."""
    X0, Y0, X1, Y1 = 361, 985, 663, 1318
    c = sb[Y0:Y1, X0:X1].copy()
    h, w = c.shape[:2]
    f = c.astype(int)
    r, g, b = f[..., 0], f[..., 1], f[..., 2]
    line = np.zeros((h, w), np.uint8)
    line[(b > 150) & (b - r > 60) & (g > 120)] = 255
    line = cv2.dilate(line, np.ones((9, 9), np.uint8))
    line[226:297, 0:117] = 0
    clean = _fsr(c, line)
    hsv = cv2.cvtColor(c, cv2.COLOR_RGB2HSV)
    H, Sa, V = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    gm = np.full((h, w), cv2.GC_PR_BGD, np.uint8)
    navy = (f.max(axis=2) < 70) & (b > r + 20)
    gm[navy] = cv2.GC_BGD
    gm[f.min(axis=2) > 235] = cv2.GC_BGD
    gold = (H >= 8) & (H <= 34) & (Sa > 80) & (V > 110)
    gm[gold] = cv2.GC_PR_FGD
    core = np.zeros((h, w), bool)
    core[150:300, 40:260] = True
    gm[core & gold] = cv2.GC_FGD
    gm[105:205, 70:230] = cv2.GC_FGD
    t = np.zeros((h, w), bool)
    t[228:294, 2:117] = True
    gm[t & ~navy] = cv2.GC_FGD
    bgm, fgm = np.zeros((1, 65)), np.zeros((1, 65))
    cv2.grabCut(cv2.cvtColor(clean, cv2.COLOR_RGB2BGR), gm, None, bgm, fgm, 6, cv2.GC_INIT_WITH_MASK)
    a = np.where((gm == cv2.GC_FGD) | (gm == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(a)
    a = np.where(lab == 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA])), 255, 0).astype(np.uint8)
    a = cv2.morphologyEx(a, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
    big_img = up(clean, k, 0.2)
    big_a = cv2.GaussianBlur(cv2.resize(a, (big_img.shape[1], big_img.shape[0]), interpolation=cv2.INTER_LINEAR), (0, 0), 1.0)
    save_rgba("gift.png", big_img, big_a)
    # Where the baked Tilo sits inside the gift asset (px in gift.png) so the layer can cover it.
    return {"w": big_img.shape[1], "h": big_img.shape[0], "tiloBox": [0, 226 * k, 117 * k, 297 * k]}


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("storyboard")
    args = ap.parse_args()
    sb = np.asarray(Image.open(args.storyboard).convert("RGB"))
    if sb.shape[:2] != (1536, 1024):
        raise SystemExit(f"expected the 1024x1536 final storyboard, got {sb.shape[1]}x{sb.shape[0]}")
    OUT.mkdir(parents=True, exist_ok=True)
    meta = {
        "tilo": tilo(sb),
        "wordmark": wordmark(sb),
        "aerial": aerial(sb),
        "workspace": workspace(sb),
        "room": room(sb),
        "gift": gift(sb),
    }
    (OUT / "layers.json").write_text(json.dumps(meta, indent=2) + "\n")
    print(json.dumps(meta))


if __name__ == "__main__":
    main()
