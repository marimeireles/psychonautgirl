#!/usr/bin/env bash
# Build the UKIEPC Team Reference Document PDF.
# Pipeline: trd.md --(pandoc)--> trd.html --(headless Chrome)--> ../public/ukiepc-trd.pdf
set -e
cd "$(dirname "$0")"

pandoc trd.md -s --no-highlight \
  --metadata pagetitle="UKIEPC Team Reference Document" \
  -c trd.css -o trd.html

"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --no-pdf-header-footer \
  --print-to-pdf="../public/ukiepc-trd.pdf" \
  "file://$PWD/trd.html" 2>/dev/null

echo "Page count:"
mdls -name kMDItemNumberOfPages ../public/ukiepc-trd.pdf
