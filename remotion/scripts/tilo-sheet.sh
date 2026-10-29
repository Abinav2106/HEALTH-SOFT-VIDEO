#!/usr/bin/env bash
# Render labelled review stills and tile them: [CROP=w:h:x:y] scripts/tilo-sheet.sh <out.png> <cols> <frame...>
set -euo pipefail
out=$1; cols=$2; shift 2
dir=$(mktemp -d out/tilo/sheet.XXXX)
node scripts/tilo-stills.mjs "$dir" "$@" > /dev/null 2>&1
for f in "$dir"/f*.png; do
  n=$(basename "$f" .png | sed 's/^f0*//'); n=${n:-0}
  ffmpeg -v error -y -i "$f" -vf "${CROP:+crop=$CROP,}scale=360:-1,drawbox=x=0:y=0:w=iw:h=ih:color=0xCCCCCC:t=1,drawtext=text='f$n':x=8:y=8:fontsize=22:fontcolor=0xD03030" "$f.lab.png"
done
ffmpeg -v error -y -pattern_type glob -i "$dir/*.lab.png" -vf "tile=${cols}x$(( ($# + cols - 1) / cols ))" "$out"
echo "$dir"
