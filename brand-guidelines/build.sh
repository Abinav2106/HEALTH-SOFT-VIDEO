#!/usr/bin/env bash
# Rebuild the Healthsoft Brand Guidelines PDF from the client source files in source/.
# Usage: ./build.sh [--png]   (--png also writes page previews to out/png/ for QC)
set -euo pipefail
cd "$(dirname "$0")"
for f in healthsoft_logo_original.png apparel_01_guard_rail.webp apparel_04_health_guard.webp apparel_06_one_care_system.webp; do
  [[ -f "source/$f" ]] || { echo "missing source/$f — see source/README.md" >&2; exit 1; }
done
mkdir -p assets out
python3 -W ignore tools/logo_variants.py source/healthsoft_logo_original.png assets
python3 tools/product_plates.py source assets >/dev/null
python3 build.py
export PLAYWRIGHT_MODULE="${PLAYWRIGHT_MODULE:-$(npm root -g)/playwright/index.mjs}"
png=""
if [[ "${1:-}" == "--png" ]]; then png=out/png; rm -rf "$png"; mkdir -p "$png"; fi
node tools/render.mjs . out/Healthsoft_Brand_Guidelines_v1.0.pdf $png
echo "wrote out/Healthsoft_Brand_Guidelines_v1.0.pdf"
