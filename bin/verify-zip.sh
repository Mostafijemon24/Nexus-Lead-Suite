#!/usr/bin/env bash
# Verifies a plugin ZIP built by bin/build-zip.py without touching any WordPress site.
#
#   bash bin/verify-zip.sh dist/nexus-lead-suite-<version>-<sha>.zip [--e2e]
#
# Checks (all offline, in a temporary folder):
#   1. the archive is valid and unpacks to a single nexus-lead-suite/ folder
#   2. nothing that must stay out is inside (git data, node_modules, tests, replica, docs, env/keys)
#   3. every file the plugin bootstrap and the appointment module require is present
#   4. every PHP file passes `php -l`; no PHP 8-only syntax in shipped code (plugin says PHP 7.4+)
#   5. every `require_once nexulesuite_PLUGIN_DIR . '...'` target exists inside the package
#   6. the PHP test-suite passes when run against the packaged files (tests copied in from the repo)
#   7. with --e2e: the Playwright click-through passes against the packaged files
# Exit code 0 only when every check passes. This does NOT prove behaviour under a real WordPress.
set -u
ZIP="${1:-}"; E2E="${2:-}"
[ -f "$ZIP" ] || { echo "usage: $0 <zip> [--e2e]"; exit 2; }
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORK="$(mktemp -d "${TMPDIR:-/tmp}/nxls-verify.XXXXXX")"
trap 'rm -rf "$WORK"' EXIT
fail=0; pass=0
ok()  { pass=$((pass+1)); echo "  ok   $1"; }
bad() { fail=$((fail+1)); echo "  FAIL $1"; }

echo "== 1. archive =="
if unzip -tqq "$ZIP" >/dev/null 2>&1; then ok "zip integrity (unzip -t)"; else bad "zip integrity"; exit 1; fi
if [ -f "$ZIP.sha256" ]; then
  if (cd "$(dirname "$ZIP")" && sha256sum -c --quiet "$(basename "$ZIP").sha256" 2>/dev/null); then ok "sha256 matches $(basename "$ZIP").sha256"; else bad "sha256 mismatch"; fi
fi
unzip -q "$ZIP" -d "$WORK"
tops="$(ls -A "$WORK" | tr '\n' ' ')"
if [ "$tops" = "nexus-lead-suite " ]; then ok "single top-level folder nexus-lead-suite/"; else bad "top-level entries: $tops"; fi
P="$WORK/nexus-lead-suite"
[ -f "$P/nexus-lead-suite.php" ] && ok "main plugin file present" || bad "main plugin file missing"
grep -q "^ \* Plugin Name:" "$P/nexus-lead-suite.php" && ok "plugin header found ($(grep -m1 '^ \* Version:' "$P/nexus-lead-suite.php" | sed 's/^ \* //'))" || bad "plugin header missing"

echo "== 2. forbidden content =="
for bad_path in .git node_modules tests replica docs dist bin; do   # must not appear anywhere
  if find "$P" -name "$bad_path" -print -quit | grep -q .; then bad "contains $bad_path"; else ok "no $bad_path"; fi
done
for bad_root in .gitignore .distignore README.md; do                 # must not appear at the plugin root (sub-folder READMEs are fine)
  if [ -e "$P/$bad_root" ]; then bad "root contains $bad_root"; else ok "no root $bad_root"; fi
done
if find "$P" \( -name '.env*' -o -name '*.pem' -o -name '*.key' -o -name '*.log' -o -name '*.map' -o -name '.DS_Store' \) -print -quit | grep -q .; then bad "env/key/log/map files inside"; else ok "no env, key, log or source-map files"; fi
secrets="$(grep -rIlE 'sk_live_[0-9A-Za-z]{8,}|AKIA[0-9A-Z]{16}|-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----|xox[baprs]-[0-9A-Za-z-]{10,}' "$P" 2>/dev/null | head -5)"
[ -z "$secrets" ] && ok "no credential patterns" || bad "credential-looking strings in: $secrets"

echo "== 3. required files =="
req="nexus-lead-suite.php uninstall.php readme.txt LICENSE core/class-activator.php core/class-plugin.php core/class-deactivator.php core/appointments/class-module.php core/appointments/class-schema.php api/class-appointments-api.php api/class-rest-api.php admin/class-admin-app.php public/class-appointments-frontend.php public/js/appointments.js public/css/appointments.css assets/admin/js/main.js assets/admin/css/main.css assets/admin/js/appointments.js assets/admin/css/appointments.css admin/src/App.jsx admin/package.json admin/vite.config.js admin/vite.appointments.config.js languages/index.php"
miss=""; for f in $req; do [ -f "$P/$f" ] || miss="$miss $f"; done
[ -z "$miss" ] && ok "all $(echo $req | wc -w) required files present" || bad "missing:$miss"
cmp -s "$P/assets/admin/js/main.js" "$ROOT/assets/admin/js/main.js" && ok "shipped main.js identical to the repository copy" || bad "main.js differs from the repository"

echo "== 4. PHP syntax =="
n=0; errs=""
while IFS= read -r -d '' f; do n=$((n+1)); out="$(php -l "$f" 2>&1)" || errs="$errs\n$out"; done < <(find "$P" -name '*.php' -print0)
[ -z "$errs" ] && ok "php -l clean on $n files ($(php -v | head -1 | cut -d' ' -f1-2))" || bad "php -l errors:$(printf "$errs")"
p8="$(grep -rnE '\?->|[^_a-zA-Z.]match\s*\(|^\s*enum\s+[A-Z]|\breadonly\s+(public|private|protected|int|string|array)|\bfn\s*\(' --include=*.php "$P" | grep -vE 'preg_match|\.match\(|//|\* ' | head -5)"
[ -z "$p8" ] && ok "no PHP 8-only syntax in shipped PHP" || bad "PHP 8-only syntax: $p8"

echo "== 5. internal requires resolve =="
missing_req=""
while IFS= read -r rel; do [ -e "$P/$rel" ] || missing_req="$missing_req $rel"; done   # files or directories (assets/admin/, languages) < <(grep -rhoE "nexulesuite_PLUGIN_DIR \. '[^']+'" --include=*.php "$P" | sed -E "s/.*'([^']+)'/\1/" | sort -u)
[ -z "$missing_req" ] && ok "every nexulesuite_PLUGIN_DIR require target exists" || bad "require targets missing:$missing_req"

echo "== 6. PHP test-suite against the packaged files =="
cp -r "$ROOT/tests" "$P/tests"
if (cd "$P" && php tests/run.php > "$WORK/php-tests.log" 2>&1); then ok "$(tail -1 "$WORK/php-tests.log")"; else bad "php tests: $(grep -E 'FAIL|passed' "$WORK/php-tests.log" | head -3 | tr '\n' ' ')"; fi

if [ "$E2E" = "--e2e" ]; then
  echo "== 7. Playwright e2e against the packaged files =="
  if (cd "$P" && NODE_PATH="/opt/node-tools/node_modules:${NODE_PATH:-}" timeout 580 node tests/e2e/run.mjs > "$WORK/e2e.log" 2>&1); then ok "$(grep -E '^[0-9]+ passed' "$WORK/e2e.log" | head -1)"; else bad "e2e: $(grep -E 'FAIL|passed' "$WORK/e2e.log" | head -3 | tr '\n' ' ')"; fi
fi

echo
echo "$pass checks passed, $fail failed — $(basename "$ZIP")"
[ "$fail" -eq 0 ]
