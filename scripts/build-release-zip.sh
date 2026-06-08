#!/usr/bin/env bash
# Build a WordPress.org-ready production ZIP using .distignore exclusions.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PLUGIN_SLUG="nexus-lead-suite"
VERSION="$(grep -E "^\s*\*\s*Version:" "$ROOT_DIR/$PLUGIN_SLUG.php" | head -1 | sed -E 's/.*Version:[[:space:]]*//' | tr -d '[:space:]')"
DISTIGNORE="$ROOT_DIR/.distignore"
BUILD_DIR="$(mktemp -d)"
STAGE_DIR="$BUILD_DIR/$PLUGIN_SLUG"
OUTPUT_DIR="${1:-$ROOT_DIR/release}"
ZIP_PATH="$OUTPUT_DIR/${PLUGIN_SLUG}-${VERSION}.zip"

if [[ -z "$VERSION" ]]; then
	echo "Could not read plugin version from $PLUGIN_SLUG.php" >&2
	exit 1
fi

if [[ ! -f "$DISTIGNORE" ]]; then
	echo "Missing .distignore at $DISTIGNORE" >&2
	exit 1
fi

mkdir -p "$STAGE_DIR" "$OUTPUT_DIR"

RSYNC_EXCLUDES=()
while IFS= read -r line || [[ -n "$line" ]]; do
	line="${line%%#*}"
	line="$(echo "$line" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"
	[[ -z "$line" ]] && continue
	RSYNC_EXCLUDES+=(--exclude "$line")
done < "$DISTIGNORE"

rsync -a "${RSYNC_EXCLUDES[@]}" "$ROOT_DIR/" "$STAGE_DIR/"

(
	cd "$BUILD_DIR"
	zip -rq "$ZIP_PATH" "$PLUGIN_SLUG"
)

rm -rf "$BUILD_DIR"

echo "Built: $ZIP_PATH"
echo "Version: $VERSION"
