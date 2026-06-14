#!/bin/bash
# Restore working admin UI from Downloads release (form builder + icons).
DL="${1:-$HOME/Downloads/nexus-lead-suite}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cp "$DL/assets/admin/js/main.js" "$ROOT/assets/admin/js/main.js"
cp "$DL/assets/admin/css/main.css" "$ROOT/assets/admin/css/main.css"
cp "$DL/assets/admin/.vite/manifest.json" "$ROOT/assets/admin/.vite/manifest.json"
echo "Restored Downloads admin bundle to $ROOT/assets/admin/"
