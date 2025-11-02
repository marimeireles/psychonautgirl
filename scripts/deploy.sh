#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
REPO_URL="$(git config --get remote.origin.url)"
TMP="$ROOT/.deploy-tmp"

# 1) Build the site
npm run build

# 2) Fresh temp clone of gh-pages (or create it)
rm -rf "$TMP"
if git ls-remote --exit-code --heads origin gh-pages >/dev/null 2>&1; then
  git clone --branch gh-pages --single-branch "$REPO_URL" "$TMP"
else
  git clone "$REPO_URL" "$TMP"
  git -C "$TMP" checkout -B gh-pages
fi

# 3) Copy build output, including dotfiles; delete removed files
if command -v rsync >/dev/null 2>&1; then
  rsync -a --delete --exclude ".git" "$ROOT/dist/" "$TMP/"
else
  rm -rf "$TMP"/*
  (cd "$ROOT/dist" && tar cf - .) | (cd "$TMP" && tar xf -)
fi

# 4) Commit only if there are changes
git -C "$TMP" add -A
if ! git -C "$TMP" diff --cached --quiet; then
  git -C "$TMP" commit -m "Deploy $(date -u +%Y-%m-%dT%H:%M:%SZ) from $(git rev-parse --short HEAD)"
fi

# 5) Push (replace the site contents safely)
git -C "$TMP" push --force-with-lease origin gh-pages

# 6) Cleanup
rm -rf "$TMP"
echo "✅ Deployed to gh-pages."
