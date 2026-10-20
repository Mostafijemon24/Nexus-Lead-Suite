# Nexus Lead Suite — Redesign Changelog

Branch `claude/determined-heisenberg-3v6hrp`, commits `3a911ef` … `7747208` on top of `b88315e` (plugin 1.2.18, DB schema 1.3.0). Companion documents: `REDESIGN-FUNCTIONALITY-MAP.md` (what had to be preserved), `REDESIGN-TEST-REPORT.md` (what was verified), `REDESIGN-RELEASE-CHECKLIST.md` (what to do before shipping).

## Scope statement

This is a presentation-layer redesign of the WordPress **admin** application only.

* **No PHP file changed.** `git diff b88315e..HEAD -- '*.php'` is empty. REST routes, admin-ajax handlers, shortcodes, options, tables, capabilities, nonces, sanitisation and the front-end (public) assets are untouched.
* **No plugin metadata changed.** Slug, text domain, `nexulesuite_` prefix, plugin header, `readme.txt`, version constants and the DB schema version are as they were.
* **No stored data touched.** Nothing resets, migrates or deletes options or rows; all saved values round-trip unchanged (see test report T-07 … T-12).
* **No new runtime dependencies.** The bundle still ships React 18, lucide-react and the same Vite/Tailwind toolchain. Tailwind's global preflight is now disabled and replaced by a scoped reset.

## 1. Admin source reconstructed (`6752967`)

The repository's `admin/src` did not correspond to the shipped bundle (a scratch build of it produced a visibly different, broken UI). The shipped `assets/admin/js/main.js` and `css/main.css` were de-minified and split into a buildable source tree:

* `admin/src/main.jsx`, `shell/App.js` (router + mount), `shared/common.js` (navigation, primitives, display-conditions widget, REST helper), `pages/*.js` (one module per admin page).
* `admin/tailwind.config.js`, `postcss.config.js`, `scripts/patch-manifest.mjs` (writes `assets/admin/vite-manifest.json`), `admin/.gitignore`.
* Parity was verified before any restyling: the rebuilt bundle produced identical DOM on all nine pages. The only computed-style deltas were Tailwind utilities that the old build had never emitted (`md:p-6`, `lg:grid-cols-4`, `from-white/to-slate-50`, `ml-4`, `pl-2`, `text-[12.5px]`, `overflow-x-hidden`, `hover:bg-slate-800`) and which now apply.

Consequence for WordPress.org: the "Source Code" section of `readme.txt`, which points at `admin/src` as the human-readable source of the minified bundle, is now accurate.

## 2. Design system (`9d28367`)

New stylesheets under `admin/src/styles/`, compiled into `assets/admin/css/main.css`:

| File | Purpose |
|---|---|
| `tokens.css` | `--nls-*` custom properties on the app root: one indigo primary (`#4f46e5`), slate neutrals, semantic success/warning/danger, type scale 20/15/14/13/12 px, radii 6/10/12 px, shadows, focus ring, layout sizes, z-indices. |
| `base.css` | Scoped reset (`:where(#nexulesuite_admin-root) …`) replacing Tailwind preflight so wp-admin outside the app is no longer reset. Styles bare `input/select/textarea` at (0,1,1) to beat wp-admin forms.css; button reset at zero specificity so utilities still win. |
| `components.css` | The `nls-*` component library: sidebar, header/breadcrumb, page frame, sticky action bar, split (list + editor) layout, list rows, buttons, icon buttons, toolbars, fields, input groups, switches, toggle cards, segmented controls, tabs, pills, tables, badges, notices, empty states, spinners, stats, modal shell, result dialog, tooltip, helpers. |
| `pages.css`, `pages/*.css` | Page-specific layout (accordion, bars, chat transcript, per-page grids). |
| `legacy-pages.css` | The legacy per-page CSS that complex widgets still rely on (colour pickers, sliders, condition cards, TinyMCE wrap, dock preview). Pruned, see §5. |
| `overrides.css` | Maps the remaining legacy palette variables (`--nexulesuite_gd/pop/be/sg-*`) to the tokens and normalises leftover utilities (no text below 12 px, no text lighter than the muted token, unified radii/shadows). |

Shell (`shared/common.js`): sticky collapsible sidebar (horizontal strip ≤ 782 px, auto-collapsed 783–1100 px), breadcrumb header with global search, `PageFrame` (title, subtitle, icon, actions, body width variants) and `StickyFooter` (actions + status, keeps the "Developed by Mostafij Emon" credit). `ModalShell` / `useModalA11y` give every dialog `role="dialog"`, `aria-modal`, labelled title, initial focus, Tab trap, Escape to close, body scroll lock and focus return.

`assets/admin/css/wp-admin-chrome.css` (`62c1b02`, `7747208`) is reduced to the rules that must reach outside the app root. Its body-class selectors used the prefix `nexulesuite_` while the real page classes are `toplevel_page_nexus-lead-suite` / `nexus_page_nexus-lead-suite-*`, so the `#wpcontent` padding reset had never applied; the selectors are corrected and dead rules (field-picker hooks, heading-TinyMCE hooks that no bundle, old or new, ever emitted) are removed.

## 3. Page-by-page

Every page keeps its component export, hooks, handlers, fetch calls, payloads, confirm/alert texts, element ids, `name`/`data-*` attributes and option values. Only JSX structure, class names and presentational attributes changed. Where a legacy class is still queried by JavaScript it was kept.

| Page (slug) | Commit | What changed |
|---|---|---|
| Analytics (`-analytics`) | `9d28367` | Page frame + cards; filter pills, date range as labelled fields, report/clear actions; `nls-table`; chatbot-report list and transcript modal through `ModalShell`; legacy `-24px/-40px` negative margins removed (fixed horizontal overflow). |
| Form Builder (`nexus-lead-suite`) | `c487a44`, `e6abe51` | Form cards with accessible expand/collapse and eight labelled icon actions; shortcode row with Copy (`aria-live`); canvas and field cards; field picker and add-form modals in `ModalShell`; field settings, conditional logic, behaviour, notifications, styling tabs and presets on `nls-*` fields/segments; multi-step tabs with `role="tablist"`. `form-builder-fui.css` rewritten on tokens and scoped to the app root (150 `!important` → 0); `range-slider.css` colours mapped to tokens. Shared `FormPreviewModal` moved into `ModalShell`. |
| Form Templates (`-templates`) | `97b7d46` | Template tiles as cards with field-chip badges and ghost Preview; preview modal shared with the builder. |
| Form Submissions (`-submissions`) | `97b7d46` | Stat tiles, labelled filter toolbar, table + detail aside (split layout), CSV export/refresh actions in the header. The per-row "View" control is now icon-only with `aria-label` and `title`. |
| Popups (`-popups`) | `de3307e` | Split layout (layer list + editor); sections as cards; triggers/conditions/styling fields on the system; TinyMCE heading editor wrap and colour/slider widgets keep their legacy classes. |
| Smart Buttons (`-menus`) | `b0362bd` | Group list + button editor split; group/button cards; quick preview revealed on hover/focus; condition cards and colour widgets keep legacy classes. The visible page heading changed from "Menu Items" to "Smart Buttons", matching the sidebar and the PHP menu label; no identifier changed. |
| Email Automation (`-emails`) | `5ad8f7f` | Template list + editor split; recipients, subject, data-injection tag library as chips, HTML source panel; status chip replaced by footer status. |
| Accessibility & Language (`-accessibility`) | `3ee5c8b` | Accessibility / Language / Custom button / Live chat cards with toggle cards; dock preview, nudge controls and order list keep their `nls-a11y-*` widget classes; display-conditions widget shared with Smart Buttons. |
| Settings (`-settings`) | `952259d` | Tabs with `role="tablist"`; AI sub-tabs as pills; General / Auto PopUp / AI / SMTP / Export rebuilt as card stacks with labelled fields, check grids, input groups, notices, badges, dashed add buttons, mode/mailer tiles with `aria-pressed`; confirm dialog in `ModalShell`; footer status shows the plugin version. |

Visible copy that was removed because it was decorative status text, not state: "System Ready & Synchronized", "System Active", "Workflow Ready", " Ver " (replaced by a real version string in the Settings footer). Analytics date labels read "From" / "To" instead of "From:" / "To:". The "Developed by Mostafij Emon" credit is kept on every page.

## 4. Accessibility

* Every page exposes `nav`, `header`, `main`, `footer` landmarks and an `h1`.
* Keyboard: all controls reachable; visible 2 px focus outline from the token; inputs show a border + ring on focus.
* Dialogs: role, label, focus management and Escape across Analytics report modal, result dialogs, confirm dialogs, field picker, add-form, form preview (verified in T-25 and the agent flow tests).
* Icon-only buttons carry `aria-label`; decorative icons `aria-hidden`.
* Switches use `role="switch"` + `aria-checked`; tabs `role="tab"` + `aria-selected`; pressed pills `aria-pressed`.
* Type and contrast: no text below 12 px; muted text token darkened to `#5b6778` (5.7:1 on white, 5.2:1 on grey cards) so 12 px captions meet WCAG AA. Probe results per page are in the test report.
* `prefers-reduced-motion` disables transitions inside the app.

## 5. CSS pruning and build output

* `legacy-pages.css`: 491 rules / 244 class names removed because no admin JavaScript or PHP emits them (tool: reference-based prune, `scratchpad/tools/css-prune-unref.mjs`). Computed-style fingerprints of all nine pages were identical before and after, except the shared display-conditions summary whose "success" colour now resolves on every page (it only resolved inside the Smart Buttons wrapper before).
* Legacy palette remaps reduced from nine families to the four still consumed (`gd`, `pop`, `be`, `sg`), defined once on the app root.
* Output: `assets/admin/css/main.css` 237 KB → 199 KB; `assets/admin/js/main.js` 680 KB → 611 KB (esbuild also dropped an unreferenced Settings image-upload handler that was dead code in the original bundle; the live upload handler is present). `vite-manifest.json` content unchanged.

## 6. Repository housekeeping

* `.gitignore`: build cache (`assets/admin/.vite/`), `admin/node_modules/`, local `.claude/` worktrees.
* Audit documents: `REDESIGN-FUNCTIONALITY-MAP.md`, `docs/redesign-audit/A-admin-ui-inventory.md`, `B-backend-contract-map.md`, `C-css-and-frontend-map.md`, and this set of redesign reports. Exclude `docs/` and the `REDESIGN-*.md` files from the WordPress.org zip (see release checklist).

## 7. Known limitations / not changed

* The PHP-injected `MutationObserver` in `admin/class-admin-app.php` that looks for a "select a popup" / "button 01" `<select>` matches nothing in the current UI (it already matched nothing in the shipped bundle). Left as is: PHP is out of scope.
* Deletes that had no confirmation before still have none (behaviour preserved by rule).
* Email HTML editor "Cancel" does not revert the draft (preserved).
* Version drift: header 1.2.18 while git history reached 1.2.26. Not changed; decide at release time.
