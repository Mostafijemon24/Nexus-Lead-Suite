# Progress checklist — DocMent clone in Nexus Lead Suite

Updated: 2026-10-25 (after Phases 1–3). Legend: ✅ completed and tested · ⬜ not started · ⚠️ built but unverified against the original or a real WordPress install · 🚫 cannot be reproduced.

## Workflow steps

| step | status | evidence |
| --- | --- | --- |
| 1 Inspect the website | ⚠️ partial | Live demo and vendor hosts are blocked by the environment's network policy. Evidence is limited to search-indexed text of the docs, the CodeCanyon listing and six public demo pages. No panel page of the original was ever seen. |
| 2 Map the website | ✅ with gaps | `recon.md`: 50 screens, 9 flows, ~25 entities, every row tagged verified / inferred / unknown. |
| 3 Investigate with evidence | ⚠️ | No scripts or network behaviour of the original could be observed. |
| 4 Specification | ✅ | `spec.md` incl. §9 clone decisions and open questions. |
| 5 Implement Phases 1–3 | ✅ | 11 tables, 2 roles, 6 stores, 50 REST routes, 8 shortcodes, admin page (8 tabs), public JS app (booking, auth, patient and doctor panels), printable prescription. |
| 6 Test | ✅ in this container | `php tests/run.php`: 28 passed, 0 failed. `node tests/e2e/run.mjs`: 24 passed, 0 failed (Playwright against the real PHP API + real pages + real admin bundle on SQLite). Screenshots in `replica/screens/clone/` (12 files, 1280 px and 375 px). |
| 7 Report | ✅ this file | |

## Phase results

| phase | scope | unit/REST tests | e2e steps | status |
| --- | --- | --- | --- | --- |
| 1 Catalogue & availability | departments, locations, doctors, schedules, leave days, medicines, availability engine, settings, admin tabs | 14 | 8 admin + 3 public | ✅ |
| 2 Booking & patient account | public listing/profile/departments, five-step booking, registration + e-mail verification, login, patient panel, admin appointments & patients | 10 | 7 | ✅ |
| 3 Doctor panel & prescriptions | doctor login, dashboard, new/not-treated/history, treatment + prescription editor, print, schedule, leave days, profile, password | 4 | 5 | ✅ |

## Feature matrix (`features.csv`, clone column)

- ✅ yes: 35 · ⬜ no: 27 (Phases 4–7: payments, Zoom, chat, CMS, SEO, reCAPTCHA, multi-currency, languages) · partial: 1 (reset password delegates to WordPress) · 🚫 skip: 6.

## Verified in this container (what the tests prove)

- Validation: every form rejects bad input with field-level messages (name length, e-mail, password ≥ 8, confirm match, times, weekdays, dates, fee range, unknown references).
- Authorization: admin routes 401/403 for guests and patients; doctor and patient routes require the role plus an active record (plus verified e-mail for patients); every record read or write is scoped to the session's own doctor or patient; foreign records answer 404 so their existence is not revealed; `patientId`/`doctorId` in requests cannot override the session.
- Booking integrity: leave days, closed weekdays, past dates, window and lead time are enforced server-side; a slot can be booked once (UNIQUE index) and is freed on cancel; cancel lead time enforced for patients.
- Prescription data: visible to admin, the treating doctor and the owning patient only, via REST and via the nonce-protected print URL; print page is `noindex` and contains no scripts.
- Rate limiting: anonymous write routes 10 / 10 min / IP, read routes 120 / min / IP.
- Responsive: admin tables collapse to cards below 768 px; public panels and booking verified at 375 px.
- No console errors and no PHP notices during the whole e2e run.

## Unverified (needs a real WordPress site or the original)

- ⚠️ Rewrite rules, cookie login (`wp_signon`) and REST nonces under a real WordPress request cycle; `dbDelta` on MySQL/MariaDB; e-mail delivery through the configured mailer; page creation on activation; the injected sidebar link on the other Nexus admin pages (the shipped main bundle could not be rebuilt, see `spec.md` §9).
- ⚠️ Visual and behavioural similarity to DocMent: **no direct comparison was possible**. The 99 % target is therefore **not claimed**. Every `[I]`/`[U]` row in `recon.md` is still an assumption.
- ⚠️ Health-data compliance (HIPAA or similar): not assessed; no claim is made.

## Cannot be reproduced / needs the user

- 🚫 Vendor's design, copy, images, demo data (theirs; clean-room clone uses its own).
- 🚫 Tawk live chat widget, preloader toggle, one-click "clear database".
- 🚫 bKash gateway without a merchant account.
- ⚠️ Stripe / PayPal / Razorpay / Zoom (Phases 4–5): buildable against official APIs, untestable here without the user's sandbox credentials and outbound network.
- ⚠️ Real-time chat (Phase 5): WordPress hosting has no socket server; polling would stand in.
- ❓ Doctor subscription plans: not evidenced for DocMent; verify on the demo.

## Next

1. Allow `docment.websolutionus.com`, `doc.websolutionus.com`, `codecanyon.net`, `websolutionus.com` in the environment's network settings, then rerun Steps 1–3 with Playwright to replace assumptions with evidence and score parity with `/replica-diff`.
2. Install the branch on a staging WordPress site and run the smoke list in `tests/README.md` ("what these tests cannot prove").
3. Decide on Phases 4–7.
