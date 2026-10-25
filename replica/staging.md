# Installing branch `claude/lucid-gates-nnhorp` on a staging site, and rolling back

The automated tests ran against a simulated WordPress (stubs + SQLite). This guide covers
the checks that only a real site can give. Use a **staging** copy, never production.

## 0. Before you start

- Staging runs the same PHP (7.4+) and MySQL/MariaDB as production; WordPress 6.2+.
- Take a **full backup** (files + database) or a host snapshot. Note the current plugin version shown under *Plugins* (expected 1.2.18).
- Note the current site rewrite setting (*Settings → Permalinks*) so you can restore it.

## 1. Install the branch (keeps the current plugin folder as a fallback)

Via SFTP / SSH:

```bash
cd wp-content/plugins
mv nexus-lead-suite nexus-lead-suite.bak-$(date +%Y%m%d)      # keep the live copy
git clone --branch claude/lucid-gates-nnhorp --depth 1 \
  https://github.com/Mostafijemon24/Nexus-Lead-Suite.git nexus-lead-suite
```

Then in wp-admin: *Plugins → Nexus Lead Suite → Deactivate → Activate* (activation creates the
11 `wp_nexulesuite_appt_*` tables, the two roles, the eight shortcode pages and flushes rewrite rules).

With WP-CLI instead: `wp plugin deactivate nexus-lead-suite && wp plugin activate nexus-lead-suite && wp rewrite flush`.

Alternative without SSH: on GitHub open the branch, *Code → Download ZIP*, rename the folder
inside the zip to `nexus-lead-suite`, re-zip it, then *Plugins → Add New → Upload Plugin* with
"Replace current with uploaded" (WordPress 5.5+ offers this), then deactivate/activate.

## 2. Smoke checks (what the container could not prove)

Tick each one; stop and roll back on any fatal error.

| # | check | where | expected |
| --- | --- | --- | --- |
| 1 | No PHP fatal/notice on activation | *Plugins* page, `wp-content/debug.log` with `WP_DEBUG_LOG` on | nothing new in the log |
| 2 | Tables created | phpMyAdmin or `wp db query "SHOW TABLES LIKE '%nexulesuite_appt_%'"` | 11 tables |
| 3 | Roles exist | *Users → Add New → Role* dropdown | "Doctor (Nexus)", "Patient (Nexus)" |
| 4 | Pages created | *Pages* | Doctors, Doctor, Departments, Department, Book an Appointment, Login or Register, My Account, Doctor Panel (each holds one shortcode) |
| 5 | Admin page loads | *Nexus → Appointments* | 8 tabs, dashboard counters, no console errors |
| 6 | Other Nexus pages unaffected | *Nexus → Forms / Popups / Settings…* | work as before; an "Appointments" link appears in the Nexus sidebar |
| 7 | Catalogue | Appointments → Departments / Locations / Doctors / Medicines | create, edit, delete; in-use delete refused |
| 8 | Doctor login works | front page `/nexus-auth/?type=doctor` with the e-mail/password set in step 7 | redirected to Doctor Panel |
| 9 | Pretty URLs | `/doctor-details/<slug>/` and `/department-details/<slug>/` | profile renders (if 404: *Settings → Permalinks → Save*) |
| 10 | Registration e-mail | register on `/nexus-auth/`; check the mailbox (and *Nexus → Settings → SMTP* test) | confirmation mail arrives; link verifies and redirects to login |
| 11 | Booking | book from a doctor profile; try the same slot in a second browser | second booking is refused |
| 12 | Inline login during booking | start a booking logged out, log in in the review step, confirm | booking succeeds without a page reload (REST nonce after login) |
| 13 | Patient panel | appointments, cancel, profile, password | each action completes |
| 14 | Doctor panel | treat with medicines, Print prescription | status "treated", print page opens, no other patient's data visible |
| 15 | Cross-account access | as patient A open `/?nexulesuite_prescription=<id of patient B>&_wpnonce=…` | 404 |
| 16 | Theme compatibility | public pages at 375 / 768 / 1280 px | layout holds; note theme CSS conflicts |
| 18 | Login CSRF guard | open `/nexus-auth/`, wait, then log in; also submit the same form from a page left open for more than 24 h (or temporarily set a short nonce life with the `nonce_life` filter) | fresh page logs in; stale page shows "Your session has expired" and no login happens |
| 17 | Uninstall (optional, last) | set *Settings → erase on uninstall* then delete the plugin on a throw-away copy | tables, roles and options removed |

## 3. Roll back

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
- The stored schema version option `nexulesuite_db_version` will read `1.4.0`; the old version
  rewrites it to `1.3.0` on its next upgrade check. No data is lost.

## 4. Known limits on a real site

- E-mail depends on the site's mailer; registration cannot complete if `wp_mail` fails (set
  *Require e-mail verification* off under Appointments → Settings to bypass while testing).
- Doctor photos are set by media attachment ID (no upload widget yet).
- Payments, Zoom and chat are not implemented (Phases 4–5).
- Treatment notes are personal health data: restrict staging access accordingly. No HIPAA or
  equivalent compliance has been assessed.
