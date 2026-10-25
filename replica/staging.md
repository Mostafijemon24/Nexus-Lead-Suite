# Staging validation package — branch `claude/lucid-gates-nnhorp`

Status of the project: **under test**. Everything below the "automated" line has been proven
only in this container (PHP stubs + SQLite + Playwright). Nothing has been run on a real
WordPress/MySQL site yet, so no WordPress compatibility, production readiness or health-data
(HIPAA or similar) compliance is claimed. Use a **staging copy of the site, never production.**

## 0. What is in the package

| item | where | how it was verified |
| --- | --- | --- |
| Plugin ZIP | `dist/nexus-lead-suite-1.2.18-<commit>.zip` (+ `.sha256`) | built by `python3 bin/build-zip.py` from the git-tracked files minus `.distignore`; checked by `bash bin/verify-zip.sh <zip> --e2e` (see §1) |
| Source | this branch | PHP suite `php tests/run.php`, e2e `node tests/e2e/run.mjs` |
| Smoke checklist | §4 below (22 checks) | split into what the container already proved and what only a real site can prove |
| Rollback | §6 | file-level and database-level, both reversible |

The ZIP contains the plugin folder `nexus-lead-suite/` only: plugin PHP, the built admin bundles,
public JS/CSS, fonts and vendor assets, `readme.txt`, `LICENSE`, and the human-readable admin
source (`admin/src`, `package.json`, Vite configs) that `readme.txt` promises. It excludes
`tests/`, `replica/`, `docs/`, `bin/`, `dist/`, git metadata and `node_modules`. It contains no
credentials: the plugin reads every key from WordPress options set in wp-admin.

To rebuild and re-verify the ZIP yourself (needs PHP 7.4+, Python 3, unzip; Node + the
pre-installed Playwright only for `--e2e`):

```bash
python3 bin/build-zip.py                      # writes dist/nexus-lead-suite-<version>-<sha>.zip and .sha256
bash bin/verify-zip.sh dist/nexus-lead-suite-*.zip --e2e
```

## 1. What `verify-zip.sh` proves (automated, offline)

1. The archive is valid, its SHA-256 matches, and it unpacks to a single `nexus-lead-suite/` folder (the name WordPress expects; "Replace current with uploaded" works only with this name).
2. Nothing that must stay out is inside (git data, `node_modules`, tests, recon docs, env/key/log/source-map files, credential-looking strings).
3. The 24 files the bootstrap and the appointment module need are present; the shipped `assets/admin/js/main.js` is byte-identical to the repository copy (the pre-existing admin SPA is untouched).
4. Every PHP file passes `php -l`; no PHP 8-only syntax in shipped code (the plugin declares PHP 7.4+; the container runs PHP 8.3, so 7.4 itself is **not** exercised).
5. Every `require_once nexulesuite_PLUGIN_DIR . '…'` target exists inside the package (no "missing file" fatals on activation caused by packaging).
6. The PHP test-suite (39 tests) passes when run against the **packaged** files.
7. With `--e2e`: the 27-step Playwright click-through passes against the packaged files.

What it cannot prove: behaviour under a real WordPress request cycle (rewrite rules, cookies,
nonces, `dbDelta` on MySQL/MariaDB, `wp_mail`, theme CSS, other plugins, PHP 7.4 itself).

## 2. Prerequisites on the staging site

| # | prerequisite | why |
| --- | --- | --- |
| P1 | A **staging copy** (same PHP 7.4+ and MySQL/MariaDB as production, WordPress 6.2+), reachable by you only | nothing here may touch live data |
| P2 | Full backup or host snapshot taken **before** step 3 (files + database) | rollback point |
| P3 | `WP_DEBUG` and `WP_DEBUG_LOG` on in `wp-config.php` (`define( 'WP_DEBUG', true ); define( 'WP_DEBUG_LOG', true );`) | fatals and notices land in `wp-content/debug.log` instead of a white screen |
| P4 | Note the current plugin version shown under *Plugins* (expected 1.2.18) and the *Settings → Permalinks* setting | restore reference |
| P5 | A working mailer on staging (*Nexus → Settings → SMTP* test) or the plan to switch *Require e-mail verification* off under *Appointments → Settings* | registration needs one e-mail |
| P6 | Two browsers or one normal + one private window | double-booking and cross-account checks |
| P7 | One throw-away e-mail address you can read | patient registration |

## 3. Install on staging (two options; keep the old folder either way)

**Option A — upload the ZIP (no SSH needed).** wp-admin → *Plugins → Add New → Upload Plugin* →
choose `dist/nexus-lead-suite-1.2.18-<commit>.zip` → *Install Now*. WordPress detects the existing
plugin and offers **Replace current with uploaded**: accept it. Then *Plugins → Nexus Lead Suite →
Deactivate → Activate* so the activation hook runs (tables, roles, pages, rewrite flush).
Before uploading, confirm the checksum: `sha256sum -c dist/nexus-lead-suite-1.2.18-<commit>.zip.sha256`.

**Option B — from git (SSH).**

```bash
cd wp-content/plugins
mv nexus-lead-suite nexus-lead-suite.bak-$(date +%Y%m%d)      # keep the live copy
git clone --branch claude/lucid-gates-nnhorp --depth 1 \
  https://github.com/Mostafijemon24/Nexus-Lead-Suite.git nexus-lead-suite
```

Then *Plugins → Nexus Lead Suite → Deactivate → Activate*, or with WP-CLI:
`wp plugin deactivate nexus-lead-suite && wp plugin activate nexus-lead-suite && wp rewrite flush`.

With Option A WordPress keeps no copy of the old folder; your backup from P2 (or the previous
release ZIP) is the rollback. With Option B the `.bak-` folder is.

## 4. Smoke checks — 22 items, split by what can prove them

Legend: **container ✅** = already proven by the automated suites on the packaged files, re-check
on staging only to confirm the real environment agrees · **staging only** = no automated
equivalent exists; the staging run is the first evidence.

| # | check | where | expected | container | staging |
| --- | --- | --- | --- | --- | --- |
| 1 | No PHP fatal/notice on activation | *Plugins*, `wp-content/debug.log` | nothing new in the log | php -l + require targets only | **staging only** (real WP bootstrap) |
| 2 | Tables created | phpMyAdmin or `wp db query "SHOW TABLES LIKE '%nexulesuite_appt_%'"` | 11 tables | ✅ on SQLite | **staging only** (`dbDelta` on MySQL) |
| 3 | Roles exist | *Users → Add New → Role* | "Doctor (Nexus)", "Patient (Nexus)" | ✅ | confirm |
| 4 | Pages created | *Pages* | Doctors, Doctor, Departments, Department, Book an Appointment, Login or Register, My Account, Doctor Panel | ✅ | confirm |
| 5 | Admin page loads | *Nexus → Appointments* | 8 tabs, dashboard counters, no console errors | ✅ | confirm (real wp-admin, theme, other plugins) |
| 6 | Other Nexus pages unaffected | *Nexus → Forms / Popups / Settings…* | work as before; "Appointments" link in the Nexus sidebar | main.js byte-identical | **staging only** (injected sidebar link) |
| 7 | Catalogue CRUD | Appointments → Departments / Locations / Doctors / Medicines | create, edit, delete; in-use delete refused | ✅ | confirm |
| 8 | Doctor login | `/nexus-auth/?type=doctor` | redirected to Doctor Panel | ✅ (stub cookies) | **staging only** (`wp_signon` cookies) |
| 9 | Pretty URLs | `/doctor-details/<slug>/`, `/department-details/<slug>/` | profile renders (if 404: *Settings → Permalinks → Save*) | router only | **staging only** (rewrite rules) |
| 10 | Registration e-mail | register on `/nexus-auth/`; read the mailbox | mail arrives; link verifies and redirects to login | ✅ (mail captured in memory) | **staging only** (`wp_mail`) |
| 11 | Booking + double booking | book from a doctor profile; same slot in a second browser | second booking refused | ✅ | confirm |
| 12 | Inline login during booking | start logged out, log in in the review step, confirm | booking succeeds without reload | ✅ | **staging only** (real REST nonce after login) |
| 13 | Patient panel | appointments, cancel, profile, password | each action completes | ✅ | confirm |
| 14 | Doctor panel + print | treat with medicines, Print prescription; also open the print link while logged out, then log in | status "treated", print page opens, no other patient's data; logged-out link works after login | ✅ (except the logged-out redirect) | confirm |
| 15 | Cross-account access | as patient A open `/?nexulesuite_prescription=<id of B>&_wpnonce=…` | 404 | ✅ | confirm |
| 16 | Theme compatibility | public pages at 375 / 768 / 1280 px | layout holds; note theme CSS conflicts | ✅ without a theme | **staging only** (real theme) |
| 17 | Uninstall (optional, last) | set *erase on uninstall*, delete the plugin on a throw-away copy | tables, roles, options removed | code review only | **staging only** |
| 18 | Login CSRF / stale nonce | log in from a fresh page; then from a page left open > 24 h (or a short `nonce_life`) | fresh page logs in; stale page shows "Your session has expired" | ✅ | **staging only** (real nonce lifetime) |
| 19 | Cross-site guard | from another host auto-submit a form to `/wp-json/nexulesuite_/v1/appt/public/login` with the nonce from `/appt/public/me` as a field | 403 `rest_cross_site` or `rest_cookie_invalid_nonce`; nobody logged in | ✅ | confirm |
| 20 | Open-redirect guard | `/nexus-auth/?redirect_to=https://example.org/` then log in | you land on your own panel | ✅ | confirm |
| 21 | Slot overlap after a schedule change | book 10:00 on a 30-min day; doctor switches that weekday to 20-min slots; reload the booking page | 10:00 and 10:20 disabled, 10:40 free; REST booking of 10:20 → 409 | ✅ | confirm |
| 22 | Unapproved doctor | register on the Doctor tab, then log in on both tabs | both refused with "This doctor account is inactive." until an admin activates | ✅ | confirm |

Summary: 11 checks are **staging only** (1, 2, 6, 8, 9, 10, 12, 16, 17, 18 and the logged-out
part of 14); the other 11 are already proven by the automated suites and need only confirmation
that the real environment agrees.

Stop and roll back (§6) on any fatal error in check 1 or 5. Record every result (pass / fail /
not run, with the `debug.log` line if any) — that record is the first real-WordPress evidence
the project has.

## 5. After the smoke run

- All 22 pass → the branch can be treated as *validated on staging*; it is still not a
  production decision (traffic, backups, data-protection review for health data are separate).
- Any failure → keep the staging site as is (do not reset), copy the `debug.log` lines and the
  check number, and hand them back; the fix is made on this branch and a new ZIP is built.

## 6. Roll back

**Option A (ZIP) rollback:** *Plugins → Add New → Upload Plugin* with the previous release ZIP
(1.2.18 without the appointment module) and *Replace current with uploaded*, then
Deactivate → Activate. Or restore the P2 snapshot.

**Option B (git) rollback:**

```bash
cd wp-content/plugins
rm -rf nexus-lead-suite
mv nexus-lead-suite.bak-YYYYMMDD nexus-lead-suite
```

Then *Plugins → Nexus Lead Suite → Deactivate → Activate* (or restore the host snapshot).

What the rollback does **not** remove, and why that is safe:

- The `wp_nexulesuite_appt_*` tables, the two roles, the eight pages and the option
  `nexulesuite_appointments_settings_v1` stay. The old plugin version ignores them.
- To remove them anyway: delete the eight pages, run `wp role delete nexulesuite_doctor` and
  `wp role delete nexulesuite_patient`, and drop the eleven tables with `DROP TABLE IF EXISTS`.
- The stored schema version option `nexulesuite_db_version` will read `1.4.1`; the old version
  rewrites it to `1.3.0` on its next upgrade check. No data is lost.

## 7. Known limits on a real site

- E-mail depends on the site's mailer; registration cannot complete if `wp_mail` fails (set
  *Require e-mail verification* off under Appointments → Settings to bypass while testing).
- Doctor photos are set by media attachment ID (no upload widget yet); a doctor may only pick an image attachment they own.
- Payments, Zoom and chat are not implemented (Phases 4–5).
- Treatment notes are personal health data: restrict staging access accordingly. No HIPAA or
  equivalent compliance has been assessed.
