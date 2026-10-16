#!/bin/zsh
# Renders every mockup page to PNG (2x) in ../images using headless Chrome.
# Usage: ./render.sh            (all pages)
#        ./render.sh desktop-1-dashboard   (one page)
set -e
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
DIR="${0:A:h}"
OUT="$DIR/../images"
PROFILE="$(mktemp -d)"
mkdir -p "$OUT"

# page name → viewport (width,height)
typeset -A SIZES=(
  desktop-1-dashboard   1440,1340
  desktop-2-registry    1440,1135
  desktop-3-patient     1440,1080
  desktop-4-admit       1440,1640
  desktop-5-reports     1440,1150
  mobile-1-beds         390,844
  mobile-2-patient      390,844
  mobile-3-trband       390,844
  mobile-4-discharge    390,844
  mobile-overview       1840,1060
)

shot() {
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --user-data-dir="$PROFILE" \
    --force-device-scale-factor=2 --window-size="$2" --virtual-time-budget=6000 \
    --screenshot="$OUT/$1.png" "file://$DIR/$1.html" 2>/dev/null
  echo "✓ $1.png ($2)"
}

if [[ -n "$1" ]]; then
  shot "$1" "${SIZES[$1]}"
else
  # mobile-overview embeds the mobile PNGs, so render it last
  for p in ${(ko)SIZES}; do [[ $p == mobile-overview ]] || shot "$p" "${SIZES[$p]}"; done
  shot mobile-overview "${SIZES[mobile-overview]}"
fi
rm -rf "$PROFILE"
