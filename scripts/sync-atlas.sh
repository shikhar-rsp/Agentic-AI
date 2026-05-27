#!/usr/bin/env bash
# =============================================================================
# sync-atlas.sh — rebuild the design-system bundles and re-vendor them here.
#
# bajaj-ekyc is a plain static site that uses the Atlas design system via two
# vendored files (assets/atlas/atlas.css + atlas.js). When the design system
# repo changes, run this to refresh them.
#
# Usage:
#   scripts/sync-atlas.sh [path-to-bigil-library-repo]
#
# If no path is given, it defaults to a sibling checkout named "bigil-library".
# =============================================================================
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DS_REPO="${1:-$(cd "$HERE/.." && pwd)/bigil-library}"

if [ ! -f "$DS_REPO/package.json" ]; then
  echo "ERROR: design-system repo not found at: $DS_REPO" >&2
  echo "Pass the path explicitly: scripts/sync-atlas.sh /path/to/bigil-library" >&2
  exit 1
fi

echo "==> Design system: $DS_REPO"
echo "==> Installing deps (pnpm)…"
( cd "$DS_REPO" && pnpm install --prefer-offline )

echo "==> Building @atlas-ds/css and @atlas-ds/js…"
( cd "$DS_REPO" && pnpm --filter @atlas-ds/css build && pnpm --filter @atlas-ds/js build )

echo "==> Vendoring bundles into assets/atlas/…"
cp "$DS_REPO/packages/css/dist/index.css" "$HERE/assets/atlas/atlas.css"
cp "$DS_REPO/packages/js/dist/index.js"  "$HERE/assets/atlas/atlas.js"

echo "==> Done. Updated:"
ls -la "$HERE/assets/atlas/"
