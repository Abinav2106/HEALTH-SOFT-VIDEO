#!/usr/bin/env bash
# Rebuild the 5-page Healthsoft Polo Apparel System PDF from the client files in ../source/.
# Usage: ./build.sh [--png]   (--png also writes page previews to out/png/ for QC)
set -euo pipefail
cd "$(dirname "$0")"
src=../source
for f in healthsoft_logo_original.png apparel_01_guard_rail.webp apparel_04_health_guard.webp apparel_06_one_care_system.webp; do
  [[ -f "$src/$f" ]] || { echo "missing $src/$f — see ../source/README.md" >&2; exit 1; }
done
mkdir -p assets out
python3 -W ignore ../tools/logo_variants.py "$src/healthsoft_logo_original.png" assets
python3 -W ignore tools/cutouts.py "$src" assets          # garment cut-outs + origins.json
python3 -W ignore tools/measure.py "$src" assets/measure.json >/dev/null
python3 -W ignore tools/artlift.py "$src" assets >/dev/null   # 01 back artwork, ink only
python3 -W ignore tools/blank_base.py assets assets/measure.json >/dev/null  # size-diagram bases
python3 build.py
export PLAYWRIGHT_MODULE="${PLAYWRIGHT_MODULE:-$(npm root -g)/playwright/index.mjs}"
png=""
if [[ "${1:-}" == "--png" ]]; then png=out/png; rm -rf "$png"; mkdir -p "$png"; fi
node ../tools/render.mjs . out/Healthsoft_Polo_Apparel_System.pdf $png
echo "wrote out/Healthsoft_Polo_Apparel_System.pdf"
