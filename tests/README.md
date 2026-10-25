# Tests for the appointment module

No WordPress install is needed: `tests/stubs/` provides the WordPress functions the module
uses, and `tests/stubs/class-wpdb.php` is a SQLite-backed `$wpdb` that translates the
`dbDelta` schema. Nothing here ships to the site.

## Unit and REST tests (PHP)

```bash
php tests/run.php                      # all test-*.php files
php tests/run.php tests/test-02-rest-booking.php
```

- `test-01-phase1-catalogue.php`: schema, roles, catalogue CRUD, doctors, schedules, leave days, the availability engine, settings.
- `test-02-rest-booking.php`: every REST route through its permission callback: admin CRUD, public catalogue and availability, registration with e-mail verification, login for patients and doctors, rate limiting, booking, double-booking, cancellation rules, tenant isolation (a patient or doctor can never read or change another's records), treatments and prescriptions, printable prescription.

## End-to-end (Playwright)

```bash
cd admin && npm ci && npx vite build --config vite.appointments.config.js && cd ..
node tests/e2e/run.mjs
```

`tests/e2e/server.php` is a `php -S` router that serves the real REST API, the real
shortcode output and the real admin bundle over the stubs with a persistent SQLite file,
plus a few `/__test/*` helpers (reset, seed, fixed clock, mail log). The script walks the
admin page, the public pages and the complete book → treat → print loop as guest, patient,
doctor and admin, checks responsive layouts, and writes screenshots to
`replica/screens/clone/`.

What these tests cannot prove: behaviour under a real WordPress request cycle (rewrite
rules, cookies, nonces, `dbDelta` on MySQL, e-mail delivery). Run the plugin on a staging
site for that.
