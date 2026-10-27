#!/usr/bin/env bash
# Pull the four Higgsfield background plates (no characters, no text) into plates/.
# Needs network access to d8j0ntlcm91z4.cloudfront.net. Then run: npm run frames && npm run board
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p plates
B=https://d8j0ntlcm91z4.cloudfront.net/user_3Js9m8RtJh0p9xJozTIXJ4KLjRx
curl -fsS -o plates/p01.png "$B/hf_20261027_141624_cfbb5e02-5419-4084-bf85-26f69c65484e.png"  # defocused golden-hour sky
curl -fsS -o plates/p02.png "$B/hf_20261027_141624_448f4b25-94b0-4560-ad51-f59297d1fbd3.png"  # Earth over southern India
curl -fsS -o plates/p04.png "$B/hf_20261027_141624_61682e4c-54e1-42de-8e1d-85503b874290.png"  # Chennai, Marina Beach aerial
curl -fsS -o plates/p10.png "$B/hf_20261027_141625_44c7e59a-9212-47fd-a3ae-d1f0faabcfd7.png"  # blue-hour city, Diwali lights
ls -la plates
