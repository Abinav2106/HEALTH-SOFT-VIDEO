#!/usr/bin/env bash
# Render every rig animation to 1080p H.264 (+ transparent WebM for the hero).
# usage: tools/render_all.sh [frames_tmp_dir] [anim ...]
set -e
cd "$(dirname "$0")/.."
TMP=${1:-/tmp/gf_frames}; shift || true
declare -A OUT=(
  [hero]=hero_motion/gofloaters_hero_signature [hero_reduced]=hero_motion/gofloaters_hero_reduced_motion
  [flying]=character_motion/action_01_flying [walking]=character_motion/action_02_walking [running]=character_motion/action_03_running
  [jumping]=character_motion/action_04_jumping [waving]=character_motion/action_05_waving [pointing]=character_motion/action_06_pointing
  [searching]=character_motion/action_07_searching [dancing]=character_motion/action_08_dancing [sleeping]=character_motion/action_09_sleeping
  [celebrating]=character_motion/action_10_celebrating [surprise]=character_motion/action_11_surprise [obstacle]=character_motion/action_12_obstacle
  [expressions]=character_motion/expression_transitions
  [aircraft_only]=aircraft_motion/aircraft_only_flight [propeller]=aircraft_motion/propeller_transition [trails]=aircraft_motion/speed_line_motion
  [rig_demo]=../03_CHARACTER_RIG/rig_preview/rig_proof_playback
  [logo_reveal]=logo_motion/logo_reveal_assembly [wordmark_entrance]=logo_motion/wordmark_entrance
)
LIST=("$@"); [ ${#LIST[@]} -eq 0 ] && LIST=("${!OUT[@]}")
for a in "${LIST[@]}"; do
  d="$TMP/$a"; rm -rf "$d"
  node tools/render_anim.js "$a" "$d" --w 1920 --h 1080
  ffmpeg -loglevel error -y -framerate 30 -i "$d/frame_%04d.png" -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -movflags +faststart "05_ANIMATION/${OUT[$a]}.mp4"
  echo "done $a"
done
