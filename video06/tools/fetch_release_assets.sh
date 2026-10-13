#!/usr/bin/env bash
# Download the Video 06 stock MP4s from the private release in Abinav2106/healthsoft-video06-assets.
# REST only (GraphQL is unavailable in Claude Code sessions). Files are kept out of git.
#
#   video06/tools/fetch_release_assets.sh [owner/repo]
#
# Assets are saved in release order as assets/stock/video06/V06_Stock_01.mp4 … _04.mp4, and the
# original asset names are recorded in assets/stock/video06/SOURCE_NAMES.tsv.
set -euo pipefail

REPO="${1:-Abinav2106/healthsoft-video06-assets}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
DEST="$ROOT/assets/stock/video06"
mkdir -p "$DEST"

echo "Releases in $REPO:"
gh api "repos/$REPO/releases" --jq '.[] | "\(.id)\t\(.tag_name)\t\(.name)\t\(.assets | length) assets"'

# All .mp4 assets across releases, newest release first, in the order they were uploaded.
gh api "repos/$REPO/releases" --jq '[.[] | .assets[] | select(.name | test("\\.mp4$"; "i"))] | sort_by(.name) | .[] | "\(.id)\t\(.name)\t\(.size)"' > "$DEST/.assets.tsv"
n=$(wc -l < "$DEST/.assets.tsv")
if [ "$n" -eq 0 ]; then echo "No .mp4 release assets found in $REPO" >&2; exit 1; fi
echo "Found $n MP4 asset(s)."

: > "$DEST/SOURCE_NAMES.tsv"
i=0
while IFS=$'\t' read -r id name size; do
  i=$((i + 1))
  out="$DEST/$(printf 'V06_Stock_%02d.mp4' "$i")"
  echo "→ $name ($size bytes) → $(basename "$out")"
  gh api -H "Accept: application/octet-stream" "repos/$REPO/releases/assets/$id" > "$out.part"
  got=$(stat -c %s "$out.part")
  if [ "$got" != "$size" ]; then echo "size mismatch for $name: got $got, expected $size" >&2; exit 1; fi
  ffprobe -v error -show_entries stream=codec_type -of csv=p=0 "$out.part" | grep -q video || { echo "$name is not a readable video" >&2; exit 1; }
  mv "$out.part" "$out"
  printf '%s\t%s\t%s\t%s\n' "$(basename "$out")" "$name" "$size" "$(sha256sum "$out" | cut -c1-64)" >> "$DEST/SOURCE_NAMES.tsv"
done < "$DEST/.assets.tsv"
rm -f "$DEST/.assets.tsv"
echo "Saved:"; cat "$DEST/SOURCE_NAMES.tsv"
