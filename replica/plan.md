# Implementation plan: appointment system in Nexus Lead Suite

Status: **proposed, awaiting approval**. Nothing in `admin/`, `api/`, `core/` or `public/` has been changed yet. Only `replica/` was added.

## 0. Two decisions before any code

1. **Scope.** DocMent is a multi-doctor appointment SaaS; Nexus Lead Suite is a lead-generation plugin. Reproducing DocMent's observable features means adding a full appointment vertical (three user roles, ~13 tables, ~40 REST routes, ~10 admin tabs, 6 shortcodes, payments, Zoom, chat). Recommended slice: **Phases 1–3 below (the core loop)** first, then decide on Phases 4–7 with the live demo in hand. The whole thing is size XL; the core loop is L.
2. **Network access.** Allow `docment.websolutionus.com`, `doc.websolutionus.com`, `codecanyon.net` and `websolutionus.com` for this environment so Steps 1–3 can be done for real (screenshots, forms, validation copy, responsive breakpoints). Without it every layout detail stays inferred and the 99 % target cannot be evidenced.

## 1. Where it fits in the existing stack (no stack change)

| layer | existing pattern reused | new files |
| --- | --- | --- |
| DB | `core/class-activator.php::install_tables()` with `dbDelta`, schema-version gate in `Plugin::maybe_upgrade_db()` | tables `{prefix}nexulesuite_departments`, `_locations`, `_doctors`, `_schedules`, `_leave_days`, `_appointments`, `_payments`, `_treatments`, `_prescription_items`, `_medicine_types`, `_medicines`, `_withdrawals`, `_messages`, `_zoom_meetings` |
| Data access | `core/class-form-submissions-store.php` style static store classes | `core/appointments/class-*-store.php` (one per aggregate), `core/appointments/class-availability.php` (slot engine) |
| Roles | — | `core/appointments/class-roles.php` adds `nexulesuite_doctor`, `nexulesuite_patient` roles + capabilities on activation; removed on uninstall when data removal is opted in |
| REST | `api/class-rest-api.php` namespace `nexulesuite_/v1`, `permission_callback` per route, nonce header | new `api/class-appointments-api.php` registered from `Rest_Api::register_routes()` to keep the 8 k-line file from growing: `/appointments/*` (admin), `/doctor/*`, `/patient/*`, `/public/doctors|departments|locations|availability|book` |
| Admin UI | React SPA, `PageShell`, `NexusModal`, lucide icons, Tailwind, `window.nexulesuite_Admin` bootstrap, submenu registration in `admin/class-admin-app.php` | `admin/src/pages/AppointmentsPage.jsx` + `admin/src/appointments/*` (tabs, forms, table, schedule editor); route id `appointments`; sidebar item |
| Public UI | vanilla JS runtimes in `public/js/*.js`, CSS in `public/css`, shortcodes in `public/class-shortcodes.php`, gateway template pattern in `public/class-client-access.php` | `public/js/appointments-public.js`, `public/js/appointments-panel.js`, `public/css/appointments.css`, `public/partials/appointments-*.php`, rewrite rules for `/doctor-details/{slug}` and `/department-details/{slug}` |
| E-mail | `core/class-mailer.php`, Email templates | new events: booking confirmed, treatment ready, withdrawal decided, e-mail verification |
| Payments / Zoom | encrypted option helper used for AI keys | `core/appointments/gateways/class-stripe.php`, `class-paypal.php`, `class-razorpay.php`, `class-bank-transfer.php`, `core/appointments/class-zoom.php` (official REST APIs only) |
| Build | `cd admin && npm ci && npm run build` → `assets/admin/js/main.js` (IIFE) | commit the rebuilt bundle as the repo does today |

## 2. Phases

### Phase 1 — Catalogue and availability (admin only) · size M
Tables + stores for departments, locations, doctors, schedules, leave days, medicine types, medicines. Roles. Admin tabs Doctors · Departments · Locations · Schedules · Medicines with list / create / edit / delete, search, status, empty/loading/error states. REST with full validation (spec §4). Availability engine with unit tests (pure PHP, runs with `php` in this container).
Exit: an admin can create a department, a location, a doctor with a weekday schedule and leave days; `GET /public/availability?doctor=…&date=…` returns the right slots.

### Phase 2 — Public booking and patient account · size M
Shortcodes `[nexulesuite_doctors]`, `[nexulesuite_doctor]`, `[nexulesuite_departments]`, `[nexulesuite_department]`, `[nexulesuite_appointment]`, `[nexulesuite_auth]`, `[nexulesuite_patient_panel]`; rewrite rules; register with e-mail verification; login (patient/doctor toggle); booking stepper with date and slot pickers; bank-transfer (manual) payment so bookings work without gateways; patient appointments / payments / profile / password; admin Appointments and Patients tabs.
Exit: a visitor registers, verifies, books a free slot; the admin sees the appointment.

### Phase 3 — Doctor panel, treatment, prescription · size M
`[nexulesuite_doctor_panel]`: dashboard, appointments (new / not treated / history), treatment + prescription editor, print view, time schedule, leave days, profile, password. Admin Appointments gains View + Print. E-mails for booking confirmed and treatment ready.
Exit: the core loop (book → treat → print) works end to end. **Milestone to compare against the demo.**

### Phase 4 — Money · size S–M
Stripe, PayPal, Razorpay through official APIs with the user's keys; doctor payments history; withdraw requests; admin approvals; e-mail on decision. Testable only with sandbox keys from the user.

### Phase 5 — Messaging and Zoom · size S–M
Polling chat thread (doctor ↔ patient per appointment); Zoom meeting create / list / join via Zoom Server-to-Server OAuth. Testable only with the user's Zoom app.

### Phase 6 — Marketing content · size S
Admin Content tab (FAQs, Testimonials, Slider, Services, Home-section toggles), public home shortcode `[nexulesuite_home]` with those sections, newsletter list + send, SEO fields. Blog/pages/contact stay on WordPress core + Form Builder.

### Phase 7 — Verification against the live demo · size S
Playwright click-through of the demo (needs network), side-by-side feature matrix scoring with `/replica-diff`, fix list, retest, final checklist. This is the only phase that can turn `[I]`/`[U]` into evidence.

## 3. Testing strategy available in this container

- PHP: `php -l` on every file; PHPUnit-free unit tests for the availability engine and validators run as plain `php` scripts (no WordPress install can be downloaded here; `wp_*` functions are stubbed in the test bootstrap).
- JS: `npm run build` must pass; React pages exercised with Playwright against a static harness page that loads the built bundle with a mocked `window.nexulesuite_Admin` and a mocked `fetch`; screenshots at 375 / 768 / 1280 px go to `replica/screens/clone/`.
- Public runtimes: Playwright against static partial fixtures with mocked REST.
- What cannot be tested here: a real WordPress request cycle, MySQL `dbDelta`, e-mail delivery, payment gateways, Zoom. These stay "unverified" in `checklist.md` until run on a WordPress install (the user's staging site via the Novamira connector would do).

## 4. Risks

- **Health data in a marketing plugin.** Prescriptions are sensitive; the plan adds privacy-tool hooks, but the user should decide whether this plugin is the right home for it.
- **Role sprawl.** Two new roles on a WordPress site interact with other plugins' capability checks; the roles get only `read` plus plugin-specific capabilities.
- **Bundle size.** The admin bundle is one IIFE; adding ~10 tabs grows it; keep the appointments code lazy-initialised inside the chunk.
- **Inference debt.** ~40 % of the spec is `[I]`/`[U]`. Each phase ends with a "compare to demo" step once access exists.
