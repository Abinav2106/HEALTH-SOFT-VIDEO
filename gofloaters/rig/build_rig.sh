#!/usr/bin/env bash
# Regenerate every rig deliverable from the supplied SVG (remotion/public/brand/gofloaters_logo_original.svg).
set -euo pipefail
cd "$(dirname "$0")"
python3 -I tools/parts.py --rig                                   # parts, hidden artwork, pivots -> build/rig_parts.json
node tools/make_jsx.mjs ae/GoFloaters_Tilo_Rig_Builder.jsx         # After Effects builder
node tools/export_vectors.mjs .                                    # vectors/ + ae/assets/Tilo_reference.png
node tools/test_jsx.mjs ae/GoFloaters_Tilo_Rig_Builder.jsx build/jsx_test   # dry run + round trip
node tools/guide_images.mjs guide                                  # guide images
node tools/pose_sheet.mjs guide stress 5 230,60,1480,920 >/dev/null && mv guide/stress_sheet.png guide/stress_poses.png && rm -f guide/stress_[0-9]*.png
python3 -I tools/guide_pdf.py                                      # Tilo_Control_Guide.pdf
node tools/render_acting.mjs build/acting 0 33 1                   # acting test frames
ffmpeg -v error -y -framerate 30 -i build/acting/f%04d.png -c:v libx264 -crf 17 -preset slow -pix_fmt yuv420p -movflags +faststart Tilo_Acting_Test_preview.mp4
echo "done"
