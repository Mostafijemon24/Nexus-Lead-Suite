# Nexus Lead Suite — Redesign Test Report

Tested build: branch `claude/determined-heisenberg-3v6hrp` at `7747208` (assets rebuilt at `ed96e97`; chrome CSS fix at `7747208`), against baseline `b88315e`.

Environment: WordPress trunk (7.2-alpha) + SQLite drop-in, PHP built-in server, Chromium 1194 via Playwright, admin user. OAuth providers, AI model APIs, SMTP relays and captcha services are not reachable from this sandbox, so everything that needs them is **NOT TESTED** (handlers unchanged, see diff audit).

Status values: **PASS** (executed and passed), **FAIL** (executed and failed), **BLOCKED** (could not execute here), **NOT TESTED** (not executed).

## 1. Automated regression suite (28 checks, run after the final build)

Script: `scratchpad/pw/regress.mjs`. Result: `SUMMARY { PASS: 28 }`.

| ID | Check | Status | Evidence |
|---|---|---|---|
| T-03 | Each of the 9 admin pages renders its expected controls (buttons, inputs, tabs) | PASS ×9 | DOM assertions per page |
| T-06 | No horizontal page scroll at 1440 px on each page | PASS ×9 | `scrollWidth == clientWidth` |
| T-07 | `settings/general` GET → POST (unchanged payload) → GET returns canonically equal JSON | PASS | 75 keys round-trip |
| T-08 | `forms` GET → POST → GET round trip (encoded forms payload) | PASS | |
| T-09 | `popups` GET → POST → GET round trip | PASS | |
| T-10 | `menu-items` GET → POST → GET round trip | PASS | |
| T-11 | `emails/templates` GET → POST → GET round trip (base64 fetch patch still applied) | PASS | |
| T-12 | `accessibility-language` GET → POST → GET round trip | PASS | |
| T-13 | `ai/faq` GET → POST accepted | PASS | |
| T-14 | `smtp/settings` GET responds | PASS | |
| T-23 | Unauthenticated GET `settings/general` rejected | PASS | HTTP 401 |
| T-25 | Activities report modal: `role=dialog`, initial focus inside, Escape closes, focus returns | PASS | |

Additional unauthenticated checks (curl): `forms`, `popups`, `emails/templates`, `settings/general` → 401; `admin.php?page=nexus-lead-suite` → 302 to login. PASS.

## 2. Parity of behaviour (diff audit, Phase 9)

| Check | Status | Evidence |
|---|---|---|
| No PHP changed | PASS | `git diff b88315e..HEAD -- '*.php'` empty; `php -l admin/class-admin-app.php` clean |
| Reconstructed source reproduces the shipped bundle | PASS | Identical DOM on 9 pages before restyling (Phase 6a) |
| REST route strings in old vs new bundle | PASS | 37 distinct route strings, identical set |
| Logic lines per page (`fetch(`, `useState(`, `useEffect(`, `JSON.stringify`, `window.confirm`, `alert(`, drag handlers) | PASS | Equal counts and equal trimmed line sets for every page file at merge time |
| Removed `nexulesuite_*` identifiers | PASS | 231 removed, all CSS class names of replaced wrappers; none referenced by PHP; none are option keys, ids or `data-*` hooks |
| Removed human-readable strings | PASS (reviewed) | Only decorative status chips, "Menu Items" heading → "Smart Buttons", "From:"/"To:" → "From"/"To"; an unreferenced duplicate upload handler dropped by the minifier (dead in the original too) |
| Front-end (public) page DOM | PASS | `front.mjs`: desktop and phone `nexulesuite_*` node lists identical to baseline after masking per-request `uniqid` input ids; 0 page errors |
| Computed-style fingerprint before/after CSS prune | PASS | 9 pages × 22 properties per element: 0 differences except a fresh UUID text width and the display-conditions summary colour (intended) |
| Stored data | PASS | Round trips above; no option/table touched |

## 3. Visual / responsive (final build)

Screenshots: `scratchpad/shots-final/` (9 pages × desktop 1440, laptop 1280, tablet 820, phone 390) and `docs/redesign-audit/screenshots/contact-desktop.jpg`, `contact-phone.jpg`.

| Check | Status | Notes |
|---|---|---|
| 40 page/viewport captures, `hscroll false` on all | PASS | Only console noise is the sandbox blocking gravatar / admin-ajax |
| Overflow finder, 9 pages × 1440/820/390 | PASS | Page `scrollWidth == viewport` everywhere. Two elements wider than the viewport are inside intentional horizontal scroll containers: the Analytics table in its `nls-table-wrap` at 820 px, and the phone sidebar strip (`nav`) |
| Consistency review of contact sheets | PASS (visual) | Same frame, spacing, type scale, primary colour and footer on all pages |

## 4. Accessibility probe (final build, 1440 px)

Script: `scratchpad/pw/probe.mjs`.

| Page | Text < 12 px | Contrast < 4.5:1 | Unlabelled inputs | Unnamed controls | Landmarks / h1 |
|---|---|---|---|---|---|
| Analytics | 0 | 0 | 0 | 0 | yes |
| Form Builder | 0 | 0 | 0 | 0 | yes |
| Popups | 0 | 0 | 0 | 0 | yes |
| Smart Buttons | 0 | 0 | 0 | 0 | yes |
| Email | 0 | 0 | 0 | 0 | yes |
| Acc & Lang | 0 | 1 (probe false positive: white "Any rule" on the indigo glider, verified visually) | 0 | 2 (number inputs wrapped in `<label>`; false positive) | yes |
| Settings | 0 | 0 | 1 (hidden `file` input triggered by the Upload button) | 5 (checkboxes wrapped in `<label>`; false positives) | yes |
| Templates | 0 | 0 | 0 | 0 | yes |
| Submissions | 0 | 0 | 0 | 0 | yes |

Focus ring: `outline: solid 2px` on the first button of every page. Status: PASS, with the noted false positives.

Modal accessibility (role, label, initial focus, Tab trap, Escape, focus return): Activities report modal (T-25, PASS); Form preview modal (`preview-modal.mjs`: dialog present, labelled, focus inside, Escape closes, focus returns to the Preview button, PASS); field picker, add-form, Settings confirm/success dialogs, Popups/Email/Smart Buttons/Acc & Lang dialogs (agent flow tests below, PASS).

## 5. Page interaction flows

The page agents executed these on isolated per-page builds (ports 8091–8097) before merge, following the playbook requirement "every control still present at 1440/820/390, modals open/close with Escape, Save/Discard still work (watch the network response)". The merged build then passed the suite in §1. Flows marked "agent-reported" were not re-executed after the final merge.

| Page | Flow | Status |
|---|---|---|
| Analytics | Filter pills, date range, chatbot-report transcript modal (T-25), no overflow at 3 widths | PASS (re-run on final build) |
| Form Builder | Add Form → template → expand → field picker (autofocus, Escape) → add field → Field Settings → Appearance/Colors/Fonts/Style/Presets → Behavior (+ add) → Notifications → Settings → Conditional Logic → Preview → Save (`POST /forms` 200 + success dialog) → Page Break → multi-step tabs → Add Step → synthetic drag reorder; 0 console errors at desktop/tablet/phone | PASS (agent-reported) |
| Form Templates | Preview modal opens, is labelled, closes on Escape, focus returns | PASS (re-run on final build) |
| Form Submissions / Templates | Controls present at 3 widths, modals Escape, no console errors | PASS (agent-reported) |
| Popups | Editor controls present at 3 widths, Save/Discard round trip, modals Escape | PASS (agent-reported) |
| Smart Buttons | Group/button editor at 3 widths, Save All round trip, quick preview on hover/focus | PASS (agent-reported) |
| Email | Template editor at 3 widths, Save & Deploy round trip (base64 patch), HTML panel | PASS (agent-reported) |
| Acc & Lang | Toggles, dock preview, nudges, order list, Save round trip at 3 widths | PASS (agent-reported) |
| Settings | Every tab and AI sub-tab at 1440/820/390; Discard dialog (Escape); Save Configuration (`POST /settings/general` 200, 75 settings echoed, success dialog); FAQ Save (`POST /ai/faq` 200) | PASS (agent-reported) |

## 6. Not testable in this sandbox

| Area | Status | Reason |
|---|---|---|
| Google / Microsoft OAuth authorise, connect, disconnect, token refresh | BLOCKED | No outbound access to providers; handlers unchanged |
| SMTP test email, report e-mail delivery | BLOCKED | No mail relay |
| AI provider calls, knowledge-base training, auto-setup, embeddings | BLOCKED | No model API access |
| Captcha (reCAPTCHA / Turnstile) verification | BLOCKED | External service |
| Settings image/logo upload to the media library, client share-link generation, Train/Test/Clear | NOT TESTED | Handlers unchanged; UI rendered and inspected only |
| Front-end popups/buttons/chat widget behaviour | NOT TESTED beyond DOM parity | Public assets untouched |
| PDF report generation content | NOT TESTED | Request issued (200) in Analytics flow; PDF not inspected |
| Multisite, RTL, Windows/Safari rendering | NOT TESTED | Not available here |
| Real TinyMCE icon glyphs | NOT TESTED | Headless Chromium lacks the icon font (glyphs show as boxes in screenshots) |

## 7. Failures

None open. Issues found and fixed during the run: horizontal overflow on Analytics (legacy negative margins); Tailwind utilities on buttons overridden by the base reset (specificity lowered); tooltip bubbles widening the page (removed from layout until shown); 12 px muted text below AA on grey cards (token darkened); sub-12 px text in the display-conditions widget; wp-admin chrome selectors that never matched.
