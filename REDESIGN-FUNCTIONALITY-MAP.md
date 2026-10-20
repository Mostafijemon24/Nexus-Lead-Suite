# Nexus Lead Suite — Redesign Functionality Map

Audit baseline: branch `claude/determined-heisenberg-3v6hrp` at commit `b88315e` (plugin header version 1.2.18, readme stable tag 1.2.18, DB schema 1.3.0). Audit date: 2026-10-20.

This document inventories every admin page, control, handler, backend contract, stored key, security check and expected state that a presentation-layer redesign must preserve. It is the Phase 2 deliverable. No source file was modified while producing it.

Evidence legend used throughout:

| Tag | Meaning |
|---|---|
| **[CODE]** | Verified by reading the PHP / JS / CSS in this repository (line numbers refer to the file named). |
| **[BROWSER]** | Verified by running the plugin on a local WordPress 7.2-alpha + SQLite test site with Playwright (see §13). |
| **[GIT]** | Verified from git history. |
| **UNVERIFIED** | Stated by code reading but not exercised; treat as an assumption until tested. |

Detailed appendices (produced during this audit, kept verbatim for reference):

* `docs/redesign-audit/A-admin-ui-inventory.md` — control-by-control inventory of the shipped admin bundle (`assets/admin/js/main.js`), with the minified component names and beautified-bundle line numbers.
* `docs/redesign-audit/B-backend-contract-map.md` — all 54 REST routes, AJAX/admin-post handlers, shortcodes and core classes: args, sanitization, options, tables, responses, error codes.
* `docs/redesign-audit/C-css-and-frontend-map.md` — admin CSS layers (tokens, class families, preflight leak, breakpoints, contrast), and the public front-end asset/selector inventory that the redesign must not touch.

---

## 1. What the plugin does

Nexus Lead Suite (`nexus-lead-suite`, text domain `nexus-lead-suite`, PHP namespace `nexulesuite_`, constants prefixed `nexulesuite_`) is a lead-generation and engagement suite with:

* **Form Builder** — simple and multi-step forms with a 33-type field catalog, conditional logic, confirmations, conditional email routing, captcha (reCAPTCHA / Turnstile), styling presets ("Forminator UI" bridge), import/export, templates. Rendered on the front end via `[nexulesuite_form id="…"]`. **[CODE]**
* **Form Submissions** — short-retention submission store (`*_nexulesuite_submissions`) with filters, detail view, CSV export, deletion, daily purge cron. **[CODE][BROWSER]**
* **Popups** — popup campaigns with TinyMCE heading editor, triggers (scroll / delay / exit / manual click), display conditions, simulator. **[CODE][BROWSER]**
* **Smart Buttons ("Menu Items")** — grouped front-end action buttons (call, mail, popup trigger, link…) with priority, display conditions, styling. **[CODE][BROWSER]**
* **Email Automation** — HTML email templates with merge tags and recipients, used by the activity notifier and report mailer; SMTP with password or Google/Microsoft OAuth 2.0 (XOAUTH2). **[CODE]**
* **Analytics / Activities** — unified interaction log (`*_nexulesuite_interactions`), PDF report generation (bundled PDF writer + fonts), report e-mailing, chatbot transcript reports, Visual Editor toggle. **[CODE][BROWSER]**
* **AI Chatbot** — live chat widget (`[nexulesuite_chat]`), direct model-API or self-hosted server modes, knowledge-base training into `*_nexulesuite_ai_vectors`, FAQ/quick replies, lead capture, auto-setup. **[CODE]**
* **Accessibility & Language dock** — floating accessibility widget, Google Website Translator switcher, live-chat and custom dock buttons with offsets, order and display conditions. **[CODE][BROWSER]**
* **Client report links** — expiring tokenised report URLs (`/report-access/…`, rewrite rules) with section permissions. **[CODE]**
* **Global settings** — navigation/footer stack, auto-popup logic, report logo, global font (23 bundled font files), full data export/import (REST), uninstall erase opt-in. **[CODE]**

---

## 2. Architecture and directory structure **[CODE]**

| Path | Role | Layer |
|---|---|---|
| `nexus-lead-suite.php` (217 lines) | Plugin header, PHP 7.4 guard, required-file check, constants, activation/deactivation hooks, boot | Bootstrap |
| `core/class-plugin.php` | Orchestrator: hooks, one-time option migrations, cron scheduling, lazy REST bootstrap, admin/public module loading | Business logic |
| `core/class-activator.php` / `class-deactivator.php` | dbDelta schema (4 tables), schema version `1.3.0`, cron scheduling, rewrite flush | Business logic |
| `core/class-*-store.php` (activities, form submissions, chat, vector) | Table access layer | Business logic |
| `core/class-mailer.php`, `class-smtp-oauth.php`, `class-smtp-xoauth2-provider.php` | wp_mail/PHPMailer SMTP + OAuth | Business logic |
| `core/class-activity-notifier.php` | Sends email templates on events | Business logic |
| `core/class-data-bundle.php` | Full export/import bundle | Business logic |
| `core/class-report-pdf.php`, `class-simple-pdf.php`, `class-pdf-font.php`, `class-report-source.php` | PDF generation | Business logic |
| `core/class-global-font.php` | Bundled font registry + CSS, enqueued in admin and front end | Presentation helper (shared) |
| `core/class-menu-items-payload.php`, `class-menu-group-resolver.php` | Smart Buttons storage format + page matching | Business logic |
| `core/class-forms-payload-codec.php` | Forms option encode/decode | Business logic |
| `core/popup-shortcode-expand.php` | Popup body shortcode expansion + kses allowlists | Business logic |
| `core/polyfills.php` | Small polyfills | Infrastructure |
| `api/class-rest-api.php` (7,977 lines) | All 54 REST routes under `nexulesuite_/v1` | Business logic |
| `ai/class-llm-client.php`, `class-file-text.php`, `class-pdf-text.php`, `ai/prompts/*` | LLM/embedding client, document text extraction | Business logic |
| `admin/class-admin-app.php` (712 lines) | Admin menu, asset enqueue, `wp_localize_script`, inline scripts, `nexulesuite_popup_preview` AJAX | **Presentation (PHP side of admin)** |
| `admin/class-plugin-list-links.php` | Plugins-screen action/meta links | Presentation |
| `admin/src/**` (React/JSX, 17 files) | **Stale partial source** — does not match the shipped bundle (see §3) | Presentation (not buildable to parity) |
| `admin/package.json`, `vite.config.js` | Vite 6 + React 18 + Tailwind 3 build config (Tailwind/PostCSS configs absent) | Build |
| `assets/admin/js/main.js` (680 KB, IIFE) | **Shipped admin SPA bundle — source of truth for admin behaviour** | Presentation |
| `assets/admin/css/main.css` (237 KB) | Built Tailwind + component CSS, includes unscoped Tailwind preflight | Presentation |
| `assets/admin/css/wp-admin-chrome.css`, `form-builder-fui.css`, `range-slider.css` | Hand-maintained admin CSS | Presentation |
| `assets/admin/vite-manifest.json` | Maps `src/main.jsx` → `js/main.js` + `css/main.css` | Build output |
| `assets/fonts/*` | 23 bundled font faces (OFL) | Shared |
| `assets/vendor/forminator-ui/*` | Vendored Forminator UI CSS/JS for form rendering | Front end |
| `public/class-shortcodes.php` (6,627 lines) | Shortcodes, front-end enqueues, AJAX form submit / notify, popup bridge, visual editor, tracker | Business logic + front-end presentation |
| `public/class-accessibility-language.php`, `class-client-access.php`, `class-forminator-ui-bridge.php` | Dock widget, client report gateway, Forminator bridge | Business logic + front-end presentation |
| `public/js/*`, `public/css/*`, `public/partials/*.php` | Front-end runtime (vanilla JS) | Front-end presentation (**out of scope**) |
| `uninstall.php` | Opt-in data erase | Business logic |
| `readme.txt`, `README.md`, `LICENSE` | WordPress.org metadata | Metadata |

No tests, no `composer.json`, no `phpcs.xml`, no CI workflow exist at HEAD. **[CODE]** (A Node CI workflow and release tooling were deleted in commit `1c2ede8`. **[GIT]**)

---

## 3. Build pipeline reality — the single most important finding

The shipped admin UI cannot be rebuilt from the React source in this repository. Evidence:

| Check | `admin/src` (source) | `assets/admin` (shipped bundle) | Method |
|---|---|---|---|
| Routes in router | 6 (`activities, menu-items, popups, emails, form-builder, settings`) | 9 (adds `form-templates`, `form-submissions`, `accessibility`) | **[CODE]** `admin/src/App.jsx` vs bundle route table |
| Sidebar labels | "Activities, Menu Items, Popups, Emails, Form Builder, Settings" | "Analytics, Forms (Templates, Submissions), Popups, Smart Buttons, Email, Acc & Lang, Settings" | **[CODE][BROWSER]** |
| "Accessibility & Language" page | absent | present | **[CODE][BROWSER]** |
| `--nls-*` design tokens in CSS | 0 | 100+ in `main.css` | **[CODE]** |
| `tailwind.config.js`, `postcss.config.js`, `scripts/patch-manifest.mjs` | absent (deleted in `1c2ede8`; `npm run build` references the missing script) | — | **[GIT]** |
| Scratch rebuild of `admin/src` with the configs recovered from git `f2da56b` (built outside the repo) | produces 536 KB JS / 173 KB CSS with 0 `--nls-` tokens and 0 "Acc & Lang" strings | 680 KB JS / 237 KB CSS | **[BROWSER-side build]** |
| Bundle commits without matching source commits | `5d1c2fc`, `7720e46`, `6559082`, `9d5a660`, `a09a013` changed only the bundle | — | **[GIT]** |
| Maintainer workflow | `admin/scripts/use-downloads-bundle.sh` (deleted) copied the bundle from `~/Downloads/nexus-lead-suite`; `extract-form-builder.mjs` extracted `form-builder/core.js` from a beautified bundle | — | **[GIT]** |

Consequences for the redesign:

1. **Any JSX change is impossible without first obtaining the real source** of the shipped bundle (it is not in this repository). Rebuilding from `admin/src` would delete the Acc & Lang page, Templates/Submissions pages and later features (a catastrophic regression).
2. A behaviour-preserving redesign in this repository is therefore limited to: hand-maintained CSS (new and existing files), PHP-side presentation in `admin/class-admin-app.php` (menu labels/titles, enqueue order), and non-invasive JS that does not alter React-managed DOM.
3. `readme.txt` §"Source Code" states the included source "is sufficient to rebuild every compiled asset" — this is currently not true and is a WordPress.org compliance risk independent of this redesign.

---

## 4. Admin menu, routing and asset contract **[CODE][BROWSER]**

### 4.1 Menu registration (`admin/class-admin-app.php`)

| WP page slug (`?page=`) | WP submenu label | React route | Visible in WP menu |
|---|---|---|---|
| `nexus-lead-suite` (parent, position 56, icon `dashicons-screenoptions`, cap `manage_options`) | Forms | `form-builder` | yes |
| `nexus-lead-suite-analytics` | Analytics | `activities` | yes (reordered first) |
| `nexus-lead-suite-popups` | Popups | `popups` | yes |
| `nexus-lead-suite-menus` | Smart Buttons | `menu-items` | yes |
| `nexus-lead-suite-emails` | Email | `emails` | yes |
| `nexus-lead-suite-accessibility` | Acc & Lang | `accessibility` | yes |
| `nexus-lead-suite-settings` | Settings | `settings` | yes |
| `nexus-lead-suite-forms` | Forms | `form-builder` | hidden (parent `null`) |
| `nexus-lead-suite-templates` | Templates | `form-templates` | hidden |
| `nexus-lead-suite-submissions` | Submissions | `form-submissions` | hidden |

`reorder_submenu()` forces the order Analytics, Forms, Popups, Smart Buttons, Email, Acc & Lang, Settings. `render_app()` checks `manage_options` and prints `<div id="nexulesuite_admin-root"></div>`. The hidden pages trigger a core PHP 8 deprecation (`strip_tags(null)` in `wp-admin/admin-header.php:41`) because their parent is `null` — pre-existing, logged in `debug.log`. **[BROWSER]**

### 4.2 Enqueue order on plugin pages (only when `?page=` is in the route map and user can `manage_options`)

1. `dashicons`
2. `nexulesuite_admin-chrome` → `assets/admin/css/wp-admin-chrome.css`
3. `nexulesuite_global-font` (saved global font) + inline `@font-face` for all 23 bundled fonts
4. `nexulesuite_forms-runtime-preview` → `public/css/forms-runtime.css` (**Popups page only**)
5. `style_loader_tag` filter makes Google Fonts links non-blocking (`media=print` + onload)
6. `wp-tinymce` script (+ `wp-commands` when registered)
7. Manifest path: `nexulesuite_admin-0` → `assets/admin/css/main.css`; `nexulesuite_admin-form-builder-fui`; `nexulesuite_admin-range-slider`; script `nexulesuite_admin` → `assets/admin/js/main.js` (footer). Fallback handles `nexulesuite_admin-fallback` when the manifest is missing/invalid.
8. `wp_set_script_translations( 'nexulesuite_admin', … )`
9. `wp_localize_script` → `window.nexulesuite_Admin = { restUrl, nonce (wp_rest), adminAjaxUrl, popupPreviewNonce, pluginUrl, pluginVersion, siteUrl, siteTitle, formsPayload, initialRoute, adminPages{route→URL}, globalFont, globalFontWeights, globalAppearance{styling, updatedAt} }`
10. Inline script **before** `nexulesuite_admin`: `window.fetch` monkey-patch that rewrites any URL containing `emails/templates` to the canonical REST URL and base64-encodes template `content` on POST (`contentEncoding:"base64"`). **Must keep working.**
11. Inline script **after**: MutationObserver that finds a native `<select>` whose first `<option>` text contains "select a popup", inside `div.p-5` whose `<label>` text contains "button 01", and appends form options (`form:{id}`) under a disabled separator `— Forms —`. **Fragile DOM contract: depends on Tailwind class `p-5`, label text and option text.** (The bundle inventory did not find a matching select in the current UI; this feature is **UNVERIFIED** in the browser and must be tested before and after any change.)
12. Dev mode: `define('nexulesuite_VITE_DEV', true)` switches to `http://localhost:5173` module scripts.

### 4.3 Bundle globals and DOM contracts (must survive unchanged) **[CODE]**

* Mount point `#nexulesuite_admin-root`; root class `.nexulesuite_admin-app`; nav `#nexulesuite_sidebar-nav`.
* `textarea#nexus-heading-mce` (TinyMCE selector), `#nexulesuite_act-report-title`, `#nexulesuite_act-custom-message`, `#nexulesuite_act-custom-emails`, `#nexulesuite_group-name-{id}`, `#nexulesuite_group-priority-{id}`, `#nls-acc-trigger-{key}` / `#nls-acc-panel-{key}`, `datalist#nexulesuite_ai-model-suggestions`, `datalist#nexulesuite_ai-embed-suggestions`.
* Data attributes `[data-field-id]`, `[data-nexulesuite_conditional]`; `.glider` spans measured by JS inside `.seg` / `.nexulesuite_gd-seg`.
* `localStorage["nexus_ls_ve"]`; window event `nexulesuite-ai-config-applied`; URL params `?nls_smtp=`, `?nls_smtp_msg=`; wp-commands `nexus/open-{route}`.
* Globals read: `nexulesuite_Admin.{restUrl, nonce, pluginUrl, pluginVersion, siteUrl, siteTitle, formsPayload, initialRoute, adminPages, globalAppearance}`, `window.tinymce`, `wp.data`. `adminAjaxUrl` and `popupPreviewNonce` are localized but **never read by the bundle**.
* ~300 `nexulesuite_*` and ~60 `nls-*` class names (full list: Appendix A §10.2–10.3). 133 `nexulesuite_*` families were observed in the rendered DOM. **[BROWSER]**

---

## 5. Shared admin shell **[CODE][BROWSER]**

| Component | Behaviour to preserve |
|---|---|
| Sidebar (`<aside aria-label="Nexus Lead Suite navigation">`) | 240 px / 72 px collapsed; auto-collapses below 782 px (not persisted); search box filters items (Escape clears, `<mark>` highlights); nav links are real `<a href>` to the WP admin URLs (modifier/middle click navigates normally, plain click uses `pushState`); `aria-current="page"`; collapse button with aria-label. |
| Header | Sticky; breadcrumb `Nexus › {Group} › {Page}`; "Search ⌘K" button opens the WP core command palette (only when `core/commands` exists). |
| Page frame (`Ba`) | White card, `<h1>` title, subtitle, header-right slot, **inner scroll container** `overflow-y-auto` with the page footer sticky inside the card. |
| Footer (`Ai`) | Dark bar "Developed by Mostafij Emon" + page actions (Save / Discard). Used by Analytics, Forms, Settings, Acc & Lang. Popups, Smart Buttons and Email render their own light footers. |
| Modal primitive (`gd`) | `role="dialog" aria-modal="true"`, closes on backdrop mousedown; **no focus trap, no Escape, no focus return**. |
| Result modal (`Ua`) | The app has **no toast system**; every save/error result is a centered modal with a "Dismiss" button. Default success copy: "Your settings have been successfully updated. All changes are now live." |
| Confirm modal (`Um`) | Used for "Discard Changes" on Settings; all other confirms are native `window.confirm`. |
| Error boundary | Inline-styled crash panel with "Reload page". |
| Toggles | `role="switch" aria-checked`; several are `div`/`button` with inline pill styles. |

---

## 6. Page-by-page inventory

Each table lists the control, what it does, and the backend contract. Full detail (labels, placeholders, confirm texts, payload shapes, minified component names) is in Appendix A.

### 6.1 Analytics (`activities`) — "Activities" **[CODE][BROWSER]**

Loads: `GET reports/activities/list?tab&dateFrom&dateTo&search` (debounced search 400 ms). No polling, no pagination, no sorting.

| Control | Handler / contract |
|---|---|
| Visual Editor switch (header) | `localStorage nexus_ls_ve` + `POST visual-editor/toggle {enabled}`; reverts on failure |
| Header search | query param `search` |
| "Chatbot Reports" accordion | `GET ai/logs?dateFrom&dateTo&search`, `GET ai/logs/detail?session`, "Clear all" → `window.confirm` → `POST ai/logs/clear` |
| Activity Log section head | `div role=button tabIndex=0` collapses toolbar+table |
| Tabs All / Forms / Calls / Consultations / Interactions | `tab` param |
| From / To dates, Clear | params; Clear resets tab to `all` |
| Report PDF | opens Activities Report modal (Escape closes; `GET emails/templates` for recipients) → "Preview PDF Report" `POST reports/combined/pdf {tab,dateFrom,dateTo,search,sections[]}` → opens `data.pdf_url`; "Send Email" `POST reports/activities/email {…, recipients[], customMessage}` |
| Clear All | `window.confirm("Clear all activities? This cannot be undone.")` → `POST reports/activities/clear` → result modal |
| Table | columns Action Name, Page URL, Purpose, Interaction, Date/Time, Mail Status, Reference; badges by category and mail status; empty "No activities found." |

States: "Updating…", "Loading activities…", error text in table, result modals.
Regression tests: load with/without rows; each tab/date/search combination changes the request; PDF opens a URL; e-mail validation message when no recipient; Clear All confirm → table empty; Visual Editor toggle persists after reload.

### 6.2 Forms (`form-builder`) — "Form Builder" **[CODE][BROWSER]**

Loads: boot from `nexulesuite_Admin.formsPayload`, then `GET forms` (`data.payload.forms`). Save: `POST forms {payload:{forms}}`. Immediate saves: Show/Hide form, Import form, Apply-to-all-forms. Global appearance `GET/POST forms/global-appearance {styling}`. Captcha keys `GET/POST captcha/recaptcha`, `GET/POST captcha/turnstile` (secret write-only; Turnstile blank secret erases **[CODE]** Appendix B).

| Area | Controls |
|---|---|
| List | search (name + id), empty state, "Add Form / Template" → "Add a Form" modal (scratch + 5 templates with preview) |
| Form card header | expand toggle, badges Simple / Multi-Step / Hidden; icon buttons Preview, Show/Hide on website (**saves immediately**), Copy shortcode (clipboard), Duplicate, Delete (**no confirm**, local until Save), Export form (downloads JSON), Import form (file input; `window.alert` on invalid; **saves immediately**) |
| Simple-form workspace | Form Name, Shortcode copy; canvas with step bar ("Add Step" switches to multi-step), "Insert Form Fields" modal (33 field types, search, autofocus); field cards with drag-and-drop (HTML5 DnD, edge detection), "Required" tag, remove |
| Right accordion "Customize form" | Form Fields; Appearance (Global presets: Save global style / Apply to this form / Apply to all forms; Style: Design default/flat/bold/material, Theme; Colors; Fonts with Desktop/Tablet/Mobile device switcher; Layout and Spacing; per-field design); Behavior (submission method Ajax/Page Reload, confirmations list with reorder/type/redirect/message/conditions, conditional email routing); Notifications & Integrations (Admin Email, CRM/Webhook URL); Settings (Show form on website switch, Terms text) |
| Field Settings panel | Label, Show label, Placeholder, Help, Required; options editor (Radio/Checkbox/Select); Address/Name part toggles; Consent editor; Phone validation; captcha key forms with "Save Keys"; Conditional Logic builder (operators list in Appendix A §5.6) |
| Multi-step workspace | tabs Fields / Styling / Customization / Confirmations / Advanced (older Tailwind UI) |
| Form Preview modal | client-side render with conditional evaluation; Previous / Next / Submit (no network) |
| Footer | Save ("Saving…") |

States: "Loading saved forms…", success modal, error modal, "Saved." inline for keys, copied states 1.5 s.
Regression tests: create from scratch and from each template; add/reorder/remove fields incl. columns; required + conditional logic in preview; save → reload → identical payload; hide/show persists without pressing Save; export then import round-trip; duplicate; delete then Save; captcha keys masked after save; global appearance apply paths; multi-step conversion; shortcode copy text `[nexulesuite_form id="…"]`.

### 6.3 Forms › Templates (`form-templates`) **[CODE][BROWSER]**

Grid of 4 template cards (Contact Form, Consultation One/Two/Three) with Preview. Clicking a card: `GET forms` → append → `POST forms` → navigate to Form Builder. Notice "Creating form…" / error "Could not create form from template.". No footer.
Regression tests: each card creates exactly one new form and lands on Form Builder expanded; preview modal opens/closes.

### 6.4 Forms › Submissions (`form-submissions`) **[CODE][BROWSER]**

Loads `GET form-submissions?search&from&to&limit=500` (search debounced 300 ms). Header: Refresh, Export CSV (client-side Blob). Stat cards Total shown / Email sent / Email failed / Forms. Filter **menubar** (`role=menubar`, popups close on outside click and Escape): Search, Form, Email status (client-side), From, To. Table with select-all / row checkboxes, View (detail panel), Delete (`window.confirm`) → `POST form-submissions/delete {ids}`; bulk "Delete selected". Footer text with counts. No pagination.
Regression tests: filters change request/rows; CSV contains loaded rows; single and bulk delete; detail panel shows field/value table; Escape closes filter popups.

### 6.5 Popups (`popups`) **[CODE][BROWSER]**

Own layout (no shared frame). Loads `GET popups` + `GET menu-items/condition-meta`. Save `POST popups {popups}`; Discard restores snapshot; dirty = JSON compare.

| Area | Controls |
|---|---|
| Header | "Add New PopUp" |
| Left "PopUp Layers" | select, hover Preview (simulator), Delete (**no confirm**) |
| Identity & Core Structure | Internal name, Event name (unique id), text-alignment segmented control (`role=tablist`, animated `.glider`) |
| Main Heading Editor | TinyMCE on `textarea#nexus-heading-mce` (polls for `window.tinymce`), Visual / Code tabs |
| Sub Heading | text |
| Visual Styling & Area Controls | 5 color fields (Header, Body, Button, Icon color, Icon bg) + sliders Button width 40–100, Radius 0–40, Close icon 14–36, Heading font 14–40, Body font 10–24 |
| Display Conditions | shared conditions editor (`popup-reference` variant) |
| Advanced Automation Logic | trigger rows: Event (scroll / timer / exit / click), Delay, Scroll depth, Fires on event name; Add trigger; Remove (not last) |
| Popup Body | raw HTML/shortcode textarea |
| Footer | static "SYSTEM READY & SYNCHRONIZED", Discard, Save Popup Configuration |
| Simulator modal | desktop/tablet/mobile widths, client-side render, **no `role=dialog`** |

Preserve model fields without UI: `style.width`, `style.padding`, `style.headingTextColor`. The `nexulesuite_popup_preview` admin-ajax endpoint exists but the bundle does not call it. **[CODE]**
Regression tests: create/edit/delete/save/reload; TinyMCE initialises and Visual↔Code round-trips; every slider/color persists as string values; triggers add/remove; conditions save; Discard reverts; simulator opens at three widths; a Smart Button "Trigger Pop-up" can select the popup's event name.

### 6.6 Smart Buttons (`menu-items`) — page title "Menu Items" **[CODE][BROWSER]**

Own layout. Loads `GET menu-items` (`groups[]`, `globalFontSize`), `GET popups`, `GET menu-items/condition-meta`. Content search `GET menu-items/content-search?search&types`. Save `POST menu-items {groups, globalFontSize}` → success modal; error inline.

| Area | Controls |
|---|---|
| Header | Add Group; Add New Button (disabled without group) |
| Left panel, group mode | list with drag-to-reorder (handle button), priority/count line, hover Delete (`window.confirm`) |
| Left panel, button mode | Back to groups; rows with drag handle, Quick Preview, Duplicate, Delete (`window.confirm`) |
| Group Details | Group name, Priority 0–999, "Group enabled" switch (`div role=switch`, Space/Enter), Manage buttons, Add button; Display Conditions (reference variant: Match mode OR/AND tablist with glider; rule cards homepage / page / post / post_type / category / tag / custom_link; search inputs; summary sentence) |
| Button editor | Button text, Action icon select (11 options), Link URL, Popup event id (select of popups or text input), Background / Text color, Hover animation (7), sliders Vertical padding, Border radius, Horizontal padding, Font size (global) |
| Footer | Discard, Save All Buttons |
| Quick Preview modal | `role=dialog`; Close Preview |

Preserve model fields without UI: `displayMode`, `cssId`, `cssClass`. Stored value for a form target is `popup:form:{id}` (PHP inline script, §4.2 item 11, **UNVERIFIED in browser**).
Regression tests: group CRUD + reorder + priority; button CRUD + duplicate + reorder; each condition type incl. content search; save → reload; Discard; preview; front-end rendering of a saved group on a matching page (`nexulesuite_bottom-nav` handle) unchanged.

### 6.7 Email (`emails`) — "Email Automation Builder" **[CODE][BROWSER]**

Own layout. Loads `GET emails/templates` (HTML-response detection with user-facing messages). Seeds one local default template if none. Save `POST emails/templates {contentEncoding:"base64", templates[]}` (base64 also enforced by the PHP fetch patch). Discard restores snapshot.

| Area | Controls |
|---|---|
| Header | Create New Template |
| Left "Template Layers" | select; hover Preview (Render Preview modal), Delete (**no confirm**) |
| Editor | Template Name; UUID badge + copy; Recipients chips (Enter/comma adds, regex-validated, remove); Email Subject; Data Injection Library (20 merge tags, click appends to subject); "Open Source Code Editor" → HTML Code Editor modal (live-bound textarea; **Cancel does not revert**) |
| Footer | static "WORKFLOW READY", Discard, Save & Deploy Template |

Regression tests: create/edit/delete/save/reload; recipients validation; merge-tag insertion; HTML editor edits persist; base64 save path works with HTML content containing `<style>`/`<script>` (server sanitises via `Mailer::sanitize_email_template_html`); Activities report modal lists these recipients; Settings "Events Email Template" select lists templates.

### 6.8 Acc & Lang (`accessibility`) — "Accessibility & Language" **[CODE][BROWSER]**

Shared frame. Loads `GET settings/accessibility-language` + `GET menu-items/condition-meta`. Save `POST settings/accessibility-language {settings}` (whole state). Footer "Save Configuration" (gradient inline style).

| Section | Controls |
|---|---|
| Accessibility | Enable Accessibility; Enable Live Chat (dock only); Button position (Left center / Right center / Bottom center); Button offset tabs Default / Accessibility / Language / Custom / Live chat with nudge control (unit px/em, ▲▼◀▶, X/Y inputs, Reset); sliders Button size / Icon size / Button gap; Button colors (Background, Icon/text) + live preview; Custom button toggle + link, label, colors, Open in new tab; Dock button order (Move up/down); dock live preview panel; Custom button icon listbox (20 icons); Display conditions tabs (same 5) → conditions editor; feature info text |
| Language | Enable Language Switcher; Default language; Button colors; Languages to show (checkbox list, never empty) |

State keys: see Appendix A §7. Front-end counterpart: `public/class-accessibility-language.php` (`wp_enqueue_scripts`, `wp_footer`).
Regression tests: every toggle/select/slider/color/offset/order/condition persists and re-loads; the front-end dock reflects position/offset/order/conditions; translator loads only when enabled.

### 6.9 Settings (`settings`) **[CODE][BROWSER]**

Shared frame; tabs General & Navigation / Auto PopUp Logic / AI Chatbot (sub-tabs Model & Knowledge, Live Chat, FAQ & Buttons, Auto-Setup) / SMTP / Email / Export Settings. Tabs are plain buttons with inline accent colors. Mount: `GET settings/general`, `GET emails/templates`, `GET wp/v2/posts`, `GET wp/v2/pages`, `GET popups`, `GET forms`, `GET smtp/settings`, `GET settings/client-links`; consumes `?nls_smtp=…` after OAuth round-trip. Footer: Discard Changes (confirm modal → local defaults), Save Configuration → `POST settings/general {settings}` (minus FAQ keys; **not sparse-safe for ~25 keys**, Appendix B §7) — on the SMTP tab the button becomes "Save SMTP Settings" → `POST smtp/settings`.

| Tab | Controls → contracts |
|---|---|
| General & Navigation | Enable Navigation (`enableNavigation`); Events Email Template select; Allow Client Access (`allowClientAccess`) with panel: Report URL slug, Link name, Expires in days, Sections checkboxes, Create share link → `POST settings/client-links` (URL shown once + copy), links table with Revoke → `window.confirm` → `DELETE settings/client-links/{id}`; Report & PDF Logo: URL input, Upload (`POST settings/upload-report-logo`, multipart `file`, ≤3 MB image), Remove, logo size range + number (pt), PDF header preview; Global Font Settings: search, 23-font list, live preview card |
| Auto PopUp Logic | Enable Auto POPUP; Button Classes; Exclusion Rules (Exclude Posts / Pages: title search via `menu-items/content-search`, chips with remove); Default Nexus forms slots (`autoPopupFormIds[]`) |
| AI Chatbot › Model & Knowledge | Enable AI chat mode; mode cards Model API / Self-hosted server; Server URL + Server API Key; provider select, model (+datalist), provider API key (write-only); Test Connection → `POST ai/test`; Embedding provider/model/key; Extra notes; Train Now → looped `POST ai/train {offset, reset}` until `done`; Clear Memory → `POST ai/reset` (no confirm); Welcome message, Input placeholder, System prompt, Ollama model override, Context snippets; Attachments switch + Vision model |
| AI Chatbot › Live Chat | Chat title / Status badge / Greeting; button image (URL or upload `POST settings/upload-chat-image`), Background / Icon colors, preview; Embed code (shortcode + iframe copy); "Save Live Chat Settings" → parallel `POST settings/accessibility-language` + `POST settings/general` |
| AI Chatbot › FAQ & Buttons | `GET/POST ai/faq`: Store chat transcripts, Show quick-reply buttons, quick-reply items with follow-ups, quick-action buttons, contact-form shortcode, response examples, disclaimer, launcher label, Smart lead capture (offer, notify email), extra URLs, WooCommerce cards (conditional); own sticky Save; native `alert` on failure |
| AI Chatbot › Auto-Setup | Analyze my website → `POST ai/autogen`; Apply selected → `POST ai/autogen/apply` → dispatches `nexulesuite-ai-config-applied` |
| SMTP / Email | From Email / From Name / Force From Name; mailer cards Default (PHP) / Google / Microsoft / Other SMTP (`aria-pressed`); host/port/encryption/username/password (password write-only); OAuth Client ID/Secret, Redirect URI copy, Authorize → `POST smtp/oauth/start` → redirect, Disconnect → `POST smtp/oauth/disconnect`; Send a Test Email (`POST smtp/test {to, html}`) |
| Export Settings | "Export Settings JSON" / "Import Settings JSON" — **client-side only, Settings-page state only** despite "full backup" copy; the real full backup endpoints `GET settings/full-export` / `POST settings/full-import` exist in PHP but are not called by this bundle **[CODE]** |

Regression tests: every tab's fields round-trip through save/reload; secrets stay masked and blank-keeps-saved semantics hold; Discard restores defaults only locally; client link create/copy/revoke; logo upload size/type validation; font selection changes admin + front-end font; exclusion search + chips; AI test/train/reset paths with and without provider; SMTP save per mailer, test e-mail, OAuth start redirect and return handling (`?nls_smtp=`); FAQ save; Auto-Setup apply updates FAQ state; export/import JSON of Settings state.

---

## 7. Backend contracts **[CODE]** (details: Appendix B)

### 7.1 REST API — namespace `nexulesuite_/v1` (54 registrations, `api/class-rest-api.php` lines 60–1110)

Permission callbacks: `can_manage_settings` = `current_user_can('manage_options')` (cookie auth requires `X-WP-Nonce`); `can_access_reports_rest` = manage_options **or** a valid client-access token; `__return_true` for public endpoints protected by their own nonces/rate limits.

| Path | Methods | Handler | Permission |
|---|---|---|---|
| `/render-shortcode` | POST | `render_shortcode_preview` | manage |
| `/settings/general` | GET, POST | `get_general_settings`, `save_general_settings` | manage |
| `/settings/accessibility-language` | GET, POST | `get_/save_accessibility_language_settings` | manage |
| `/form-submissions` | GET | `get_form_submissions` | manage |
| `/form-submissions/delete` | POST | `delete_form_submissions` | manage |
| `/settings/upload-chat-image` | POST | `upload_livechat_avatar` | manage |
| `/settings/upload-report-logo` | POST | `upload_report_logo` | manage |
| `/settings/generate-client-access-link` | POST | `generate_client_access_link` (legacy) | manage |
| `/settings/client-links` | GET, POST | `list_client_links`, `create_client_link` | manage |
| `/settings/client-links/(?P<id>[A-Za-z0-9]+)` | DELETE | `revoke_client_link` | manage |
| `/settings/full-export` | GET | `export_full_data_bundle` | manage |
| `/settings/full-import` | POST | `import_full_data_bundle` | manage |
| `/captcha/recaptcha` | GET, POST | `get_/save_recaptcha_keys` | manage |
| `/captcha/turnstile` | GET, POST | `get_/save_turnstile_keys` | manage |
| `/forms` | GET, POST | `get_forms`, `save_forms` | manage |
| `/forms/global-appearance` | GET, POST | `get_/save_global_appearance` | manage |
| `/smtp/settings` | GET, POST | `get_/save_smtp_settings` | manage |
| `/smtp/test` | POST | `smtp_send_test_email` | manage |
| `/smtp/oauth/start` | POST | `smtp_oauth_start` | manage |
| `/smtp/oauth/disconnect` | POST | `smtp_oauth_disconnect` | manage |
| `/emails/templates` | GET, POST | `get_/save_email_templates` | manage |
| `/menu-items` | GET, POST | `get_/save_menu_items` | manage |
| `/menu-items/content-search` | GET | `search_menu_content` | manage |
| `/menu-items/condition-meta` | GET | `get_menu_condition_meta` | manage |
| `/popups` | GET, POST | `get_/save_popups` | manage |
| `/reports/activities/list` | GET | `list_activities_report` | reports |
| `/reports/activities/clear` | POST | `clear_activities_report` | manage |
| `/reports/activities/pdf`, `/reports/combined/pdf` | POST | `generate_activities_pdf` | reports |
| `/reports/activities/email` | POST | `send_activities_email` | reports |
| `/track/events` | POST | `receive_track_events` | public (nonce + rate limit) |
| `/ai/test` | POST | `ai_test_connection` | manage |
| `/ai/train` | POST | `ai_train` | manage |
| `/ai/reset` | POST | `ai_reset` | manage |
| `/ai/chat` | POST | `ai_chat` | public (nonce + session) |
| `/ai/lead` | POST | `ai_lead` | public |
| `/ai/logs`, `/ai/logs/detail` | GET | `ai_logs_report`, `ai_logs_detail` | manage |
| `/ai/logs/clear` | POST | `ai_logs_clear` | manage |
| `/ai/faq` | GET, POST | `get_/save_ai_faq` | manage |
| `/ai/autogen`, `/ai/autogen/apply` | POST | `ai_autogen`, `ai_autogen_apply` | manage |
| `/visual-editor/toggle`, `/visual-editor/update` | POST | `visual_editor_toggle`, `visual_editor_update_post_content` | manage |

Response envelopes are inconsistent across routes (`{success, data}` vs raw arrays; some AI routes return `success:false` with HTTP 200; some `WP_Error`s lack a status). The UI already copes with each; a redesign must not change how responses are parsed.

### 7.2 admin-ajax and admin-post

| Action | Where | Auth |
|---|---|---|
| `wp_ajax_nexulesuite_popup_preview` | `admin/class-admin-app.php` | `manage_options` + nonce `nexulesuite_popup_preview`; `wp_kses_post` content; **not called by the bundle** |
| `wp_ajax(_nopriv)_nexulesuite_trigger_notify` | `public/class-shortcodes.php` | front-end nonce |
| `wp_ajax(_nopriv)_nexulesuite_submit_form` | `public/class-shortcodes.php` | form nonce, honeypot, captcha |
| `admin_post(_nopriv)_…` SMTP OAuth start/callback | `core/class-smtp-oauth.php` | state token + capability |

### 7.3 Shortcodes

`[nexulesuite_form id="…"]` and `[nexulesuite_chat full_width="yes" max_width="…"]` (`public/class-shortcodes.php:1837–1838`). Attributes, markup and enqueues: Appendix B.

### 7.4 Hooks offered to third parties (must remain)

Filters: `nexulesuite_load_shortcodes_module`, `nexulesuite_submission_retention_days`, `nexulesuite_smtp_oauth_redirect_uri`, `nexulesuite_form_webhook_payload`, `nexulesuite_ai_trainable_post_types`. Cron actions: `nexulesuite_purge_form_submissions`, `nexulesuite_purge_report_pdfs` (daily). Core filters used: `rest_json_encode_options`, `phpmailer_init`, `wp_mail_from(_name)`, `safe_style_css`, `safecss_filter_attr_allow_css`, `forminator_render_shortcode_is_preview`, `plugin_action_links_*`, `plugin_row_meta`, `query_vars`, `template_redirect`.

### 7.5 Stored data

Options (all autoload-false unless noted): `nexulesuite_general_settings_v1`, `nexulesuite_forms_builder_v0` (legacy `step_forms_builder_v0`), `nexulesuite_global_appearance_v1`, `nexulesuite_recaptcha_keys_v0`, `nexulesuite_turnstile_keys_v0` (legacy `step_*`), `nexulesuite_menu_items_v1`, `nexulesuite_popups_v1`, `nexulesuite_email_templates_v1`, `nexulesuite_email_templates`, `nexulesuite_smtp_settings`, `nexulesuite_client_links_v1`, `nexulesuite_a11y_lang_v1`, `nexulesuite_db_version`, `nexulesuite_ca_rw_ok`, `nexulesuite_erase_on_uninstall`, migration flags `nexulesuite_migrate_step_option_keys_v1`, `_nav_client_off_v3`, `_auto_popup_off_v1`, `_livechat_off_v1`, `_menu_groups_v1`.
Post meta: `_nexulesuite_ve_dom_patches`. Transients: `nexulesuite_*` (rate limits, OAuth state, uploads flags).
Tables: `{prefix}nexulesuite_interactions`, `_submissions`, `_chat_logs`, `_ai_vectors` (schema in `core/class-activator.php`).
Files: `uploads/Nexus-Lead-Suite/*.pdf` (purged daily), uploaded logos/avatars via the media uploader.
External services (opt-in only): Google reCAPTCHA, Cloudflare Turnstile, Google Website Translator, AI providers, Google/Microsoft OAuth SMTP, user SMTP/webhooks (readme "External services").

---

## 8. Security requirements the redesign must not weaken **[CODE]**

* Admin pages and all management REST routes require `manage_options`; REST cookie auth requires the `wp_rest` nonce localized as `nexulesuite_Admin.nonce` — any new JS must send `X-WP-Nonce`.
* `render_app()` dies for unauthorised users; asset enqueue is gated by page allowlist + capability.
* Secrets (API keys, SMTP password, client secret, captcha secrets) are write-only: blank keeps the stored value (Turnstile secret: blank erases).
* Email template HTML is sanitised server-side; popup body passes through kses allowlists (`core/popup-shortcode-expand.php`) — new `data-*`/`aria-*` attributes added to stored HTML would be stripped.
* Public endpoints (`/track/events`, `/ai/chat`, `/ai/lead`, form submit AJAX) rely on their own nonces, rate limits (`nexulesuite_trkrl_*`), honeypot and captcha verification.
* Uploads validated by MIME/size; PDF output stored under uploads with purge.
* Uninstall never deletes data unless `nexulesuite_erase_on_uninstall === '1'` or `nexulesuite_UNINSTALL_DELETE_DATA`.

---

## 9. Public front end — explicitly out of scope **[CODE]**

Handles that must remain untouched (full list Appendix C §2.2): `nexulesuite_forms-runtime`, `nexulesuite_recaptcha`, `nexulesuite_turnstile`, `nexulesuite_fui-*`, `nexulesuite_forminator-fui`, `nexulesuite_forminator-bridge`, `nexulesuite_global-font`, `nexulesuite_bottom-nav`, `nexulesuite_popup-overlay`, `nexulesuite_livechat-widget`, `nexulesuite_chat-embed`, `nexulesuite_track-utils`, `nexulesuite_popup-bridge`, `nexulesuite_activity-tracker`, `nexulesuite_visual-editor`, `nexulesuite_ve-apply-patches`, `nexulesuite_a11y-anti-flicker`, `nexulesuite_a11y-lang`, `nexulesuite_google-translate`, `nexulesuite_client-access-gateway`. Front-end JS binds to ~45 fixed live-chat ids and `.nexulesuite_st-*` / popup / bottom-nav structures.

Admin-side exception: `public/css/forms-runtime.css` is also loaded on the Popups admin page (handle `nexulesuite_forms-runtime-preview`) for the simulator — admin CSS must not override its selectors.

---

## 10. Behaviours and quirks to preserve consciously (not "fix" silently) **[CODE]**

1. Delete without confirmation: Forms (card Delete, local until Save), Popups layers, Email templates. Confirms exist for Smart Buttons group/button, Activities Clear All, chat logs, submissions, client-link revoke.
2. Email HTML Code Editor "Cancel" does not revert (textarea is live-bound).
3. Settings "Export/Import Settings JSON" are client-side and cover only Settings-page state, although the copy says "full backup"; the REST full export/import exists but is not wired to any control.
4. Static status chips: "SYSTEM READY & SYNCHRONIZED" (Popups), "WORKFLOW READY" (Email), "System Active" + version (Settings).
5. "Coming soon" router fallback (unreachable with the shipped route map).
6. Smart Buttons page `<h1>` says "Menu Items" while navigation says "Smart Buttons".
7. Numeric style values are stored as strings; `POST settings/general` resets ~25 keys when omitted — any new save path must send the whole settings object as today.
8. Google Fonts `<link>` injected by the bundle (`Sora`, `Inter`, `JetBrains Mono`) and by Settings when the global font changes; the PHP global-font inline style forces `font-family` on `.nexulesuite_admin-app *` with `!important`.
9. Tailwind preflight in `main.css` is unscoped and resets WP admin chrome; `wp-admin-chrome.css` exists mainly to repair that.
10. Nested scroll: page content scrolls inside the white card (`overflow-y-auto`) while the document also scrolls; the sticky footer lives inside the card.

---

## 11. Unknowns and high-risk areas

| Item | Risk | Status |
|---|---|---|
| Shipped bundle has no buildable source in the repo | Any JSX/markup change requires the maintainer's real source; otherwise CSS-only | **Blocking decision for the user** (§3) |
| PHP inline MutationObserver for "Button 01 → form" select (`admin/class-admin-app.php:378`) | Depends on `div.p-5`, label "button 01", option text "select a popup"; no matching select found in bundle inventory | UNVERIFIED — must be tested on a site with popups + forms before/after |
| `wp-admin-chrome.css` targets Tailwind utility classes that may no longer exist | Dead/fragile rules | Verified partially (Appendix C §1.4) |
| Contrast: muted text `#94a3b8` (2.56:1), `#64748b` on white (4.37:1), 9–11 px labels | Accessibility; fixing is CSS-only but changes look | **[BROWSER]** measured on every page |
| Modals without focus trap / Escape / `role=dialog` | Accessibility; fixing requires JS inside React trees — **not possible without source** | Known limitation |
| Live third-party flows (OAuth, AI providers, captcha, SMTP) | Cannot be exercised in the sandbox (no outbound access to those services) | NOT TESTABLE here |
| Front-end Forminator bridge, visual editor, tracker | Out of scope; only indirectly affected via `forms-runtime.css` on Popups page | Must be regression-checked after CSS changes |
| readme "Source Code" claim | WordPress.org compliance (not a redesign task) | Flagged |
| Version drift: header 1.2.18 while git history reached 1.2.26 | Release metadata ambiguity | Flagged; do not change without approval |

---

## 12. Regression test matrix (to be executed in Phase 8; status recorded in REDESIGN-TEST-REPORT.md)

| ID | Area | Test | Expected |
|---|---|---|---|
| T-01 | Baseline | `php -l` on all 42 PHP files | 0 errors (**PASS at baseline**) |
| T-02 | Boot | Activate on WP 7.x; tables + `nexulesuite_db_version=1.3.0` | created (**PASS at baseline**) |
| T-03 | Navigation | Each of 10 `?page=` slugs renders the SPA root with content, correct breadcrumb and active sidebar item | **PASS at baseline** |
| T-04 | Navigation | WP submenu order, hidden pages reachable by URL, pushState/back button | as §4.1 |
| T-05 | Console | No JS errors / failed plugin requests on each page (ignoring gravatar/network) | **PASS at baseline** |
| T-06 | Responsive | 1440 / 1280 / 820 / 390 px: no horizontal page scroll; controls reachable | no h-scroll at baseline; Settings/Acc&Lang content collapses at ≤820 px (baseline defect) |
| T-07..T-15 | Per page | Save/reload round-trips for Forms, Popups, Smart Buttons, Email, Acc & Lang, Settings (each tab), FAQ, Live Chat | stored option equals pre-change option for identical input |
| T-16 | Forms | Template → form → fields → conditional logic → preview → shortcode copy → front-end render + submit | submission row + e-mail attempt logged |
| T-17 | Submissions | filter / view / delete / bulk / CSV | as §6.4 |
| T-18 | Analytics | list filters, PDF generation (local), e-mail send attempt, Clear All | as §6.1 |
| T-19 | Popups | TinyMCE init, Visual/Code, triggers, simulator | as §6.5 |
| T-20 | Smart Buttons | "Trigger Pop-up" select incl. PHP-injected form options | options present (UNVERIFIED baseline) |
| T-21 | Settings | client link create/revoke; logo upload validation; font change applies to admin and front end | as §6.9 |
| T-22 | Settings | secrets masked; blank keeps value; Turnstile blank erases | as Appendix B |
| T-23 | REST | unauthenticated calls to manage routes → 401/403; public routes unaffected | unchanged |
| T-24 | Front end | form, popup, bottom nav, dock, chat widget render identically before/after (screenshots) | pixel-identical |
| T-25 | A11y | keyboard reach of every control; visible focus; switches announce state; contrast of body/muted text ≥ 4.5:1 after redesign | targets |
| T-26 | Visual | screenshot comparison per page/viewport before vs after | reviewed |
| T-27 | Build | if the CSS-only route is chosen: no change to `assets/admin/js/main.js`; manifest unchanged | diff-verified |
| T-28 | Third-party | OAuth, AI providers, captcha, SMTP send | NOT TESTABLE in sandbox |

---

## 13. Baseline established (Phase 3) **[BROWSER][GIT]**

* Git: working tree clean at `b88315e`; branch `claude/determined-heisenberg-3v6hrp` tracks origin. No uncommitted user changes to preserve.
* Versions: plugin 1.2.18 (header + readme), schema 1.3.0, Requires WP 6.2 / PHP 7.4, Tested up to 7.1. Vite 6.0.3, React 18.3.1, Tailwind 3.4.17, lucide-react 0.542.0 (`admin/package.json`).
* Tooling in sandbox: PHP 8.3.6, Node 22.22, npm 10.9, prettier 3.8, eslint 10.1, Playwright + Chromium. No phpcs/phpunit (none configured in the repo either).
* `php -l` over all PHP files: no syntax errors.
* Local test site: WordPress trunk (7.2-alpha) + SQLite Database Integration drop-in, PHP built-in server with router, pretty permalinks, plugin activated, 5 pages + 4 posts seeded, admin user. All 10 admin pages captured at four viewports (41 screenshots) with a console/network report; the only non-network errors at baseline were the 404s caused by plain permalinks (REST URL built as `?rest_route=…?per_page=` — pre-existing behaviour on sites without pretty permalinks, not introduced here).
* Measured at baseline (desktop, per page): low-contrast text elements 2–31; text under 12 px 0–45 (Email 45, Settings 40, Acc & Lang 29); inner scroll containers on Email, Acc & Lang, Settings, Templates; unlabeled inputs 0–7; icon buttons without accessible name 0–9.
