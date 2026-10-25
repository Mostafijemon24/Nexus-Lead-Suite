# Progress checklist — DocMent clone in Nexus Lead Suite

Updated: 2026-10-25 (evidence pass, alignment of Phases 1–3 to the original, security review). Legend: ✅ completed and tested in this container · ⬜ not started · ⚠️ built but unverified against the original or a real WordPress install · 🚫 cannot be reproduced.

Two kinds of evidence are kept apart throughout this file:

- **Automated, in this container** — `php tests/run.php` (stubs + SQLite) and `node tests/e2e/run.mjs` (Playwright against the real REST API, real shortcode output and the real admin bundle served by `php -S`). These prove logic, authorization and the browser flows, not WordPress itself.
- **Real WordPress / original site** — only a staging install (`replica/staging.md`) or a direct look at the original can give these. Nothing in this section is claimed as done.

## Workflow steps

| step | status | evidence |
| --- | --- | --- |
| 1 Inspect the website | ⚠️ partial, improved | The vendor host now passes the environment's network policy but resets most TLS handshakes from the cloud egress range; codecanyon.net serves a Cloudflare challenge that was **not** bypassed. In the windows when the host answered, the manual and six public pages were captured (`replica/evidence.md`, 14 screenshots in `replica/screens/original/`). No screen behind a login (patient, doctor, admin) has been seen. |
| 2 Map the website | ✅ with gaps | `recon.md`: 50 screens, 9 flows, ~25 entities, every row tagged verified / inferred / unknown; rows re-tagged after the evidence pass. |
| 3 Investigate with evidence | ⚠️ partial | Public page structure, field names, labels, tab names and the booking cascade are verified from captured HTML. Scripts, network behaviour and all authenticated screens of the original remain unobserved. |
| 4 Specification | ✅ | `spec.md` incl. §7 security rules, §9 decisions and the "verified later" table. |
| 5 Implement Phases 1–3 | ✅ | 11 tables, 2 roles, 6 stores, 56 REST routes, 8 shortcodes, admin page (8 tabs, 5 appointment views), public JS app (auth with Patient/Doctor tabs, cascade booking, patient and doctor panels), printable prescription. |
| 6 Test | ✅ in this container | `php tests/run.php`: **39 passed, 0 failed** (3 files). `node tests/e2e/run.mjs`: **27 passed, 0 failed**, no console errors, no PHP notices. 20 clone screenshots in `replica/screens/clone/` (1280 / 768 / 375 px). |
| 7 Report | ✅ this file | |
| 8 Staging package | ✅ built and verified offline | `dist/nexus-lead-suite-1.2.18-513118e.zip` (2.4 MB, 195 files, `.sha256` alongside) built by `bin/build-zip.py`; `bin/verify-zip.sh … --e2e` → **24 checks passed, 0 failed** (structure, exclusions, secrets scan, `php -l` on 60 files, require targets, PHP suite 39/0 and e2e 27/0 against the packaged files). Real-WordPress smoke run (`replica/staging.md` §4) **not yet done**. |

## Phase results (automated evidence)

| phase | scope | PHP tests | e2e steps | status |
| --- | --- | --- | --- | --- |
| 1 Catalogue & availability | departments (+ sidebar on the department page), locations, doctors (designations, education, experience, qualification), schedules, leave days, medicines, availability engine (12-hour labels, overlap-safe), settings, admin tabs | 14 | 8 admin + 3 public | ✅ |
| 2 Booking & patient account | catalogue pages, Department → Doctor → Date → Schedule booking, registration (Patient / Doctor tabs) + e-mail verification, nonce- and origin-guarded login, profile-complete gate, patient panel (Dashboard, Appointment/Prescription List defaulting to Treated, Order List, Edit Profile, Change Password), admin appointments & patients | 18 | 9 | ✅ |
| 3 Doctor panel & prescriptions | doctor login, dashboard with monthly earnings chart, Today Appointments, Manage Appointment (New / Not treated / History), treatment + prescription editor, print, Manage Leave, Payment History, Time Schedule, Update Profile, Change Password, doctor self-registration pending approval | 7 (security file) + shared | 7 | ✅ |

## Audit of Phases 1–3 against `spec.md` / `features.csv`

`features.csv` clone column: **yes 42 · partial 1 · no 31 · skip 7**. All "no" rows are Phases 4–7 (payments, Zoom, chat, CMS, SEO, reCAPTCHA, multi-currency, languages) or explicitly out of scope; "partial" is password reset (delegated to WordPress).

| area | implemented | partial | missing (in scope) | unverified against the original |
| --- | --- | --- | --- | --- |
| Catalogue | departments, locations, doctors, medicines, schedules, leaves, department sidebar | — | — | `/doctors` listing layout (page not captured) |
| Availability | weekday grid − leave − booked (overlap-safe) − past/lead/window | — | — | the original's slot model and lead-time rules |
| Booking | cascade form, review + confirm, profile-complete gate, inline login/register | review step stands in for the payment page (Phase 4) | — | the payment page, confirmation copy |
| Patient account | register/verify/login, dashboard, lists, orders, profile, password | password reset via WordPress | — | every panel screen (behind login) |
| Doctor panel | all nine sidebar items of the original except Live Consultation, Withdraw, Messaging (Phases 4–5) | — | — | every panel screen (behind login); exact status vocabulary |
| Prescriptions | treatment notes + medicine rows, print view, ownership checks | — | — | the original's prescription layout |
| Admin | Appointments page with All / New / Pending / Prescription / Payment History, doctors, departments, locations, medicines, patients, settings | — | Schedule / Days / Habits admin lists (purpose of "Habits" undocumented) | admin screens (behind login) |

## Security review (2026-10-25) — findings and fixes

A fresh read of the API, stores, front end and JS found eight items; seven are fixed and covered by `tests/test-03-security-review.php`, one is an accepted decision.

| # | finding | fix | test |
| --- | --- | --- | --- |
| 1 | Bookings only blocked the slot with the same start time, so after a doctor changed the slot length or start time an overlapping slot could be booked | availability now blocks every slot a booking overlaps (`Availability::overlaps_booking`) | overlap after schedule change → 409 |
| 2 | An unapproved (inactive) doctor could log in by omitting `type=doctor`; a deactivated doctor kept prescription access | inactive check in every login branch; prescription access requires an active doctor/patient | login refused on both tabs; deactivated accounts lose print access |
| 3 | The logged-out `wp_rest` nonce is shared by all visitors and readable from `/appt/public/me`, so a cross-site form with `_wpnonce` could still log a victim into an attacker's account | nonce accepted from the `X-WP-Nonce` header only; `Origin`/`Referer`/`Sec-Fetch-Site` must be same-site when present | form-field nonce, foreign origin, null origin, cross-site all 403 |
| 4 | `?redirect_to=` on the auth page accepted any absolute URL (open redirect) | `wp_validate_redirect()` server-side and a same-origin check in the JS | foreign and protocol-relative URLs dropped, same-site kept |
| 5 | The verification link answered "verified" for any token once the user was verified (patient-id oracle) | token checked first; hash kept until expiry so the same link still works twice | wrong token is false regardless of account state |
| 6 | Register endpoints say whether an e-mail already exists | accepted (standard WordPress behaviour); resend-verification stays neutral | existing test |
| 7 | A doctor could attach any media-library attachment as their photo | must be an image attachment the doctor owns (admins unrestricted) | page / foreign / PDF / unknown ids → 422 |
| 8 | A logged-out visitor opening a print link was redirected with a freshly minted nonce that could never match after login | redirect back to the original URL | — (functional; smoke item 14 on staging) |

Verified OK and citable (see the audit notes in `spec.md` §7): permission callbacks per route, server-side identity on every patient/doctor write, 404 for foreign records, whitelisted mass assignment, prepared SQL everywhere, escaped output incl. the print view, no `innerHTML` in the JS, public payloads strip e-mail/phone/user ids.

## Responsiveness (evidence-based)

- Clone screenshots at 1280 / 768 / 375 px for the doctors page, doctor profile, booking form, patient panel and doctor appointments (`replica/screens/clone/*-768.png`, `*-375.png`); e2e asserts no horizontal overflow at 768 and 375 and that admin tables collapse to cards below 768 px.
- Original screenshots at the same widths exist for home, department, login and admin login (`replica/screens/original/`). Both stack to one column on phones and keep a two-column layout on tablets; no pixel comparison has been made and none is claimed.

## Unverified (needs a real WordPress site or the original)

- ⚠️ Rewrite rules, cookie login (`wp_signon`), REST nonces and the new same-site guard under a real WordPress request cycle; `dbDelta` on MySQL/MariaDB (schema 1.4.1 adds four doctor text columns); e-mail delivery; page creation on activation; the injected sidebar link on the other Nexus admin pages.
- ⚠️ Similarity to DocMent: public pages are aligned to captured HTML; every screen behind a login is still an assumption. **The 99 % target is not claimed.**
- ⚠️ Health-data compliance (HIPAA or similar): not assessed; no claim is made.

## Cannot be reproduced / needs the user

- 🚫 Vendor's design, copy, images, demo data (theirs; the clone uses its own assets and copy).
- 🚫 Tawk live chat widget, preloader toggle, one-click "clear database".
- 🚫 bKash gateway without a merchant account.
- ⚠️ Stripe / PayPal / Razorpay / Zoom (Phases 4–5): buildable against official APIs, untestable here without the user's sandbox credentials.
- ⚠️ Real-time chat (Phase 5): WordPress hosting has no socket server; polling would stand in.
- ❓ Doctor subscription plans: not evidenced for DocMent.

## Next

1. Upload `dist/nexus-lead-suite-1.2.18-513118e.zip` to a **staging** site (`replica/staging.md` §3, Option A) and run the 22 smoke checks in §4; 11 of them are staging-only and will be the project's first real-WordPress evidence. Never production first.
2. From an ordinary connection, capture the remaining original pages listed in `replica/screens/original/README.md` (doctors listing, booking modal, patient / doctor / admin screens with your own demo accounts) so the panels can be aligned with evidence.
3. Decide on Phases 4–7.
