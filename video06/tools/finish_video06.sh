#!/usr/bin/env bash
# Healthsoft Video 06 — one-command finish from the four original stock files.
#
#   video06/tools/finish_video06.sh            # uses assets/stock/video06/V06_Stock_0{1..4}.mp4
#   video06/tools/finish_video06.sh --dry-run  # pipeline self-test on synthetic test patterns (cleans up after)
#
# Clip → shot mapping (from the briefed content of each source):
#   V06_Stock_01  5486229  mother + daughter with laptop (portrait)  → s01 0–3 s (daughter browsing), s06 12–16 s (choosing together)
#   V06_Stock_02  5486219  mother + daughter having coffee (landscape) → s05 9–12 s (comfort)
#   V06_Stock_03  5495326  cooking / daily routine (landscape)         → s04 6–9 s (their day)
#   V06_Stock_04  5493998  mother + daughter emotional moment (portrait) → s03 3–6 s (mother), s11 27–30 s (closing)
# In-points are first-pass defaults; refine them (and focus) in remotion/src/video06/stock/manifest.json after review.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SRC="$ROOT/assets/stock/video06"
OUT="$ROOT/remotion/out"
DRY=0
[ "${1:-}" = "--dry-run" ] && DRY=1
PY="$ROOT/.venv-video06/bin/python"
[ -x "$PY" ] || { python3 -m venv "$ROOT/.venv-video06"; "$PY" -m pip install -q -r "$ROOT/video06/tools/requirements.txt"; }
export REMOTION_BROWSER_EXECUTABLE="${REMOTION_BROWSER_EXECUTABLE:-/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell}"
BROWSER=()
[ -x "$REMOTION_BROWSER_EXECUTABLE" ] && BROWSER=(--browser-executable="$REMOTION_BROWSER_EXECUTABLE")

if [ "$DRY" = 1 ]; then
  SRC="$(mktemp -d)"
  PREFIX="DRYRUN_"
  cp "$ROOT/remotion/src/video06/stock/manifest.json" "$SRC/manifest.backup.json"
  trap 'cp "$SRC/manifest.backup.json" "$ROOT/remotion/src/video06/stock/manifest.json"; rm -f "$ROOT"/remotion/public/stock/s0*__synthetic* "$ROOT"/remotion/public/stock/s1*__synthetic*; rm -rf "$SRC"' EXIT
  echo "Dry run: generating synthetic 25 fps test patterns (never used in the film)…"
  gen() {  # $1 name  $2 WxH ; frame index encoded as a 12-bit bar code at the top for frame-accuracy checks
    local w=${2%x*} h=${2#*x}
    ffmpeg -v error -y -f lavfi -i "testsrc2=size=${w}x${h}:rate=25:duration=12" \
      -vf "geq=lum='if(lt(Y,96),if(eq(mod(floor(N/pow(2,floor(X*12/W))),2),1),235,16),lum(X,Y))':cb='if(lt(Y,96),128,cb(X,Y))':cr='if(lt(Y,96),128,cr(X,Y))'" \
      -c:v libx264 -preset ultrafast -crf 18 -pix_fmt yuv420p "$SRC/$1"
  }
  gen V06_Stock_01.mp4 2160x4096; gen V06_Stock_02.mp4 4096x2160; gen V06_Stock_03.mp4 4096x2160; gen V06_Stock_04.mp4 2160x4096
else
  PREFIX="Healthsoft_V06_"
fi

for i in 1 2 3 4; do
  f="$SRC/V06_Stock_0$i.mp4"
  [ -s "$f" ] || { echo "missing $f" >&2; exit 1; }
  ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate:format=duration -of csv=p=0 "$f" | tr '\n' ' ' | sed "s|^|V06_Stock_0$i: |"; echo
done

dur() { ffprobe -v error -show_entries format=duration -of csv=p=0 "$1"; }
D1=$(dur "$SRC/V06_Stock_01.mp4"); D4=$(dur "$SRC/V06_Stock_04.mp4")
# Different moments from the same source: s06 starts mid-clip, s11 uses the last ~3 s of clip 04.
S06_IN=$(python3 -c "print(round(max(3.6, $D1/2 - 2.0), 2))")
S11_IN=$(python3 -c "print(round(max(2.8, $D4 - 3.4), 2))")

ingest() {  # shot clip pexelsId sourceIn
  local provider=Pexels id=$3 url="https://www.pexels.com/video/$3/" lic="Pexels License" st=free-licence
  [ "$DRY" = 1 ] && { provider=SYNTHETIC; id="TEST$2"; url="about:test-pattern"; lic="test pattern"; }
  "$PY" -I "$ROOT/video06/tools/ingest.py" --shot "$1" --file "$SRC/V06_Stock_0$2.mp4" --provider "$provider" \
    --asset-id "$id" --url "$url" --licence "$lic" --licence-status "$st" --source-in "$4" --confirm-original
}
ingest s01 1 5486229 0.5
ingest s06 1 5486229 "$S06_IN"
ingest s03 4 5493998 0.5
ingest s11 4 5493998 "$S11_IN"
ingest s04 3 5495326 0.5
ingest s05 2 5486219 0.5

for s in s01 s03 s04 s05 s06 s11; do "$PY" -I "$ROOT/video06/tools/auto_reframe.py" --shot "$s"; done
for s in s01 s03 s04 s05 s06 s11; do "$PY" -I "$ROOT/video06/tools/crop_check.py" --shot "$s" --out "$OUT/cropcheck_$s.png" > "$OUT/cropcheck_$s.json" || echo "  ↳ $s: review $OUT/cropcheck_$s.png"; done

cd "$ROOT/remotion"
npx remotion render src/index.ts V06-Opening "$OUT/${PREFIX}Stock_Integration_0-16s.mp4" --props='{"mode":"master"}' "${BROWSER[@]}" --concurrency=4 --overwrite --log=error
npx remotion render src/index.ts V06-Master "$OUT/${PREFIX}PictureLock_1080x1920.mp4" "${BROWSER[@]}" --concurrency=4 --overwrite --log=error
cd "$ROOT"
"$PY" -I video06/tools/qc_render.py "$OUT/${PREFIX}PictureLock_1080x1920.mp4" --json "$OUT/${PREFIX}PictureLock_QC.json" || true
echo "Done: $OUT/${PREFIX}Stock_Integration_0-16s.mp4  $OUT/${PREFIX}PictureLock_1080x1920.mp4"
