#!/usr/bin/env bash
# Builds the static export and packages it with the staging PHP endpoint into dist/staging.zip.
# Upload the zip to the staging docroot and extract it there (see docs/deployment.md).
set -euo pipefail
cd "$(dirname "$0")/.."
export STATIC_EXPORT=1
npm run build:static
rm -rf dist && mkdir -p dist/stage
cp -r out/. dist/stage/
mkdir -p dist/stage/api/consultation
cp deploy/staging/api/consultation/index.php dist/stage/api/consultation/index.php
cp deploy/staging/htaccess-staging.txt dist/stage/htaccess-staging.txt
( cd dist/stage && zip -qr ../staging.zip . )
echo "dist/staging.zip: $(du -h dist/staging.zip | cut -f1)"
