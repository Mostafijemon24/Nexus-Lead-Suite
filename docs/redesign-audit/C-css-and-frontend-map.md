> Appendix C of REDESIGN-FUNCTIONALITY-MAP.md. Produced by reading the admin CSS layers and public front-end sources during the 2026-10-20 audit. "Beautified" line numbers refer to a prettier-formatted copy of assets/admin/css/main.css.

# Nexus Lead Suite — CSS layers & public front-end map

Read-only audit for a presentation-only admin redesign. All paths are relative to `/home/user/Nexus-Lead-Suite`. Line numbers for `main.css` refer to the prettier-beautified copy at `/tmp/claude-0/-home-user-Nexus-Lead-Suite/2cfe5b95-f6aa-5891-8022-3732fbc71e2a/scratchpad/bundle/main.beautified.css` (11,315 lines).

---

## Part 1 — Admin CSS

### 1.0 Structure of the built `assets/admin/css/main.css` (237 KB minified)

The beautified bundle is laid out in six regions (byte share of the beautified file):

| Region | Lines | Share | What it is |
|---|---|---|---|
| A. `.nls-*` design-system layer | 1–1539 | 12.8 % | `:root` tokens, dark-theme override, `.nls-tone-*`, `.nls-card`, `.nls-btn`, `.nls-table`, drawer, tabs, forms … — fully tokenised, **zero hard-coded colours** |
| B. Tailwind **preflight** | 1540–1859 | 2.0 % | `*, :before, :after`, `html, :host`, `body`, `h1–h6`, `button`, `input`… global reset — **unscoped** |
| C. Tailwind utilities (base) | 1860–3908 | 15.2 % | `.container`, `.flex`, `.bg-slate-50`, `.text-…`, `.transition-transform`, `@keyframes pulse/spin` |
| D. Page-specific custom CSS #1 | 3909–9186 | 50.7 % | second `:root` (`--nexus-sidebar-*`), `.nexulesuite_admin-app`, sidebar, and the per-page `*-wrap` sections (group-details, popups editor, button editor, emails, form builder, settings-general, smtp, tooltip, settings-livechat, activities) |
| E. Tailwind variant utilities | 9187–9787 | 6.1 % | `.hover\:…`, `.focus\:…`, `.group…`, `@keyframes bounce`, `@media (min-width: 640/768/1024px)` responsive variants |
| F. Page-specific custom CSS #2 | 9788–11315 | 13.2 % | `.nexulesuite_nls-color` / `_nls-icolor` colour pickers, a11y FAB preview, livechat preview, AI livechat toolbar, dock-display cards, a11y nudge, custom-button card |

So roughly **23 % Tailwind (preflight + utilities + variants)** and **77 % custom component CSS**, of which the reusable `.nls-*` layer is only ~13 % and page-specific `.nexulesuite_*` sections are ~64 %.

Provenance note: `admin/src/index.css` (5,570 lines) is stale — it does not contain the `.nls-*` layer at all (`grep nls-tone-neutral admin/src` → nothing), there is no `tailwind.config.*` or `postcss.config.*` in `admin/` (only `admin/vite.config.js`; `package.json` lists `tailwindcss ^3.4.17`, `postcss`, `autoprefixer`). The built bundle was produced from a source tree that is not in the repo. Google Fonts (Sora / Inter / JetBrains Mono) are injected at runtime from `admin/src/main.jsx:10-19` as `<link id="nexulesuite_hub-fonts">`.

**Dead-CSS signal:** the built `assets/admin/js/main.js` references only 41 `nls-*` families; 32 families present in `main.css` are never referenced by the JS (no `"nls-"` string-concatenation pattern either): `nls-badge nls-btn nls-caps nls-card nls-check nls-checkbox nls-cluster nls-convo-row nls-detail nls-drawer nls-drawer-overlay nls-drawer-root nls-empty nls-field nls-filterbar nls-form-grid nls-grid-health nls-grid-stats nls-health nls-input nls-keyfield nls-list nls-msg nls-notice nls-page nls-page-header nls-pagination nls-progress nls-search nls-section nls-section-label nls-select nls-skel* nls-stack nls-stat nls-table nls-table-wrap nls-tabs nls-textarea nls-thread nls-tone-* nls-vlist`. In other words, the entire Region A design system appears to be **unused by the shipped SPA** (the UI is rendered with Tailwind utilities + page-specific `.nexulesuite_*` classes). Verify in the browser before relying on it as the redesign base.

### 1.1 Complete `:root` token block (lines 1–100)

```css
:root {
  --nls-white: #ffffff;  --nls-black: #000000;
  --nls-gray-0: #ffffff; --nls-gray-50: #f6f7f7; --nls-gray-100: #f0f0f1; --nls-gray-200: #dcdcde;
  --nls-gray-300: #c3c4c7; --nls-gray-400: #a7aaad; --nls-gray-500: #8c8f94; --nls-gray-600: #646970;
  --nls-gray-700: #3c434a; --nls-gray-800: #2c3338; --nls-gray-900: #1d2327; --nls-gray-950: #101517;
  --nls-blue-50: #eef6fb; --nls-blue-300: #72aee6; --nls-blue-500: #2271b1; --nls-blue-600: #135e96;
  --nls-violet-50: #f1ebfe; --nls-violet-300: #a78bfa; --nls-violet-500: #7c3aed; --nls-violet-600: #6d28d9; --nls-violet-950: #2b1064;
  --nls-green-50: #edfaef; --nls-green-300: #68de7c; --nls-green-500: #00a32a; --nls-green-950: #0a2e16;
  --nls-amber-50: #fcf9e8; --nls-amber-300: #f2d675; --nls-amber-500: #dba617; --nls-amber-950: #3a2f0a;
  --nls-red-50: #fcf0f1; --nls-red-300: #f0a1a2; --nls-red-500: #d63638; --nls-red-950: #3a1416;
  --nls-font-sans: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif;
  --nls-font-mono: ui-monospace, "SFMono-Regular", "JetBrains Mono", monospace;
  --nls-fs-page: 20px; --nls-fs-section: 15px; --nls-fs-card: 14px; --nls-fs-body: 13px;
  --nls-fs-caption: 12px; --nls-fs-helper: 11px; --nls-fs-stat: 26px;
  --nls-fw-normal: 400; --nls-fw-medium: 500; --nls-fw-semibold: 600; --nls-fw-stat: 650;
  --nls-space-1: 4px; --nls-space-2: 8px; --nls-space-3: 12px; --nls-space-4: 16px;
  --nls-space-5: 24px; --nls-space-6: 32px; --nls-space-7: 40px; --nls-space-8: 48px;
  --nls-radius-card: 10px; --nls-radius-control: 6px; --nls-radius-dialog: 12px; --nls-radius-badge: 999px;
  --nls-transition: 0.16s ease;
  --nls-z-header: 30; --nls-z-drawer: 100000; --nls-z-toast: 100001;
  --nls-canvas: var(--nls-gray-100); --nls-surface: var(--nls-gray-0); --nls-surface-2: var(--nls-gray-50); --nls-surface-3: var(--nls-gray-100);
  --nls-ink: var(--nls-gray-900); --nls-ink-2: var(--nls-gray-700); --nls-muted: var(--nls-gray-600); --nls-faint: var(--nls-gray-500);
  --nls-border: var(--nls-gray-200); --nls-border-strong: var(--nls-gray-500);
  --nls-primary: var(--nls-blue-500); --nls-primary-hover: var(--nls-blue-600); --nls-primary-ink: var(--nls-white);
  --nls-accent: var(--nls-violet-500); --nls-accent-hover: var(--nls-violet-600); --nls-accent-soft: var(--nls-violet-50); --nls-accent-ink: var(--nls-white);
  --nls-success: var(--nls-green-500); --nls-success-soft: var(--nls-green-50);
  --nls-warning: var(--nls-amber-500); --nls-warning-soft: var(--nls-amber-50);
  --nls-danger: var(--nls-red-500); --nls-danger-soft: var(--nls-red-50);
  --nls-info: var(--nls-blue-500); --nls-info-soft: var(--nls-blue-50);
  --nls-shadow-card: 0 1px 2px rgba(16,19,34,.05); --nls-shadow-pop: 0 4px 16px rgba(16,19,34,.12); --nls-shadow-dialog: 0 12px 40px rgba(16,19,34,.18);
  --nls-focus-ring: 0 0 0 1px var(--nls-surface), 0 0 0 3px var(--nls-accent);
  --nls-overlay: rgba(16,19,34,.35);
  --nls-skel-base: var(--nls-surface-2); --nls-skel-sheen: var(--nls-border);
}
```

Dark override `:root[data-theme="dark"]` (lines 101–131) remaps canvas→gray-950, surface→gray-900, surface-2→gray-800, surface-3→gray-700, ink→gray-50, ink-2→gray-200, muted→gray-400, faint→gray-500, border→gray-700, primary→blue-300 (`--nls-primary-hover: #9ec7ea`), accent→violet-300 (`--nls-accent-hover: #c4b5fd`), accent-soft→violet-950, *-soft→*-950, `--nls-info-soft: #0c2a3d`, shadows → `rgba(0,0,0,.5/.6/.7)`, overlay → `rgba(0,0,0,.6)`. `@media (prefers-reduced-motion: reduce) { :root { --nls-transition: 0ms } }` (line 132). Nothing in the PHP sets `data-theme`, so dark mode is currently unreachable unless JS toggles it.

Tone helpers (lines 137–166): `.nls-tone-neutral|success|warning|danger|info|accent` set `--nls-tone-fg/--nls-tone-bg/--nls-tone-bd`, consumed by `.nls-badge`, `.nls-health`.

**Second `:root` block (line 3911)** — sidebar tokens, hard-coded Tailwind slate/indigo values: `--nexus-sidebar-bg: transparent; --nexus-sidebar-border: #dcdcde; --nexus-sidebar-text: #50575e; --nexus-sidebar-link: #334155; --nexus-sidebar-hover-bg: #f8fafc; --nexus-sidebar-hover-border: #e2e8f0; --nexus-sidebar-hover-accent: #a5b4fc; --nexus-sidebar-hover-text: #1e293b; --nexus-sidebar-active-bg: #eef2ff; --nexus-sidebar-active-border: #c7d2fe; --nexus-sidebar-active-accent: #4f46e5; --nexus-sidebar-active-text: #4338ca;`

**Per-page local token sets** (not on `:root`, scoped on each wrap, ~15–22 vars each, all hard-coded): `.nexulesuite_group-details-wrap { --nexulesuite_gd-* }`, `.nexulesuite_popup-sections-wrap { --nexulesuite_pop-* }`, `.nexulesuite_btn-editor-wrap { --nexulesuite_be-* }`, `.nexulesuite_emails-editor-wrap { --nexulesuite_em-* }`, `.nexulesuite_form-builder-wrap { --nexulesuite_fb-* }`, `.nexulesuite_settings-general-wrap { --nexulesuite_sg-* }`, `.nexulesuite_settings-autopopup-exclusion-wrap { --nexulesuite_sap-* }`, `.nexulesuite_settings-livechat-wrap { --nexulesuite_lc-* }`, `.nexulesuite_activities-wrap { --nexulesuite_act-* }`, `.nls-dock-display-body` (8). Typical set (gd, line 4023): `ink #0f172a, ink-2 #334155, muted #64748b, faint #94a3b8, line #e6e8ee, line-soft #eef0f5, paper #fff, primary #4f46e5, primary-d #4338ca, primary-soft #eef2ff, primary-ring rgba(79,70,229,.18), success #10b981, shadow 0 1px 2px rgba(15,23,42,.04), 0 8px 24px -12px rgba(15,23,42,.12)`. These nine palettes are **parallel, not derived from `--nls-*`**: the page sections use an indigo/slate (Tailwind) palette while the `.nls-*` layer uses the WP blue/violet palette.

### 1.2 Custom component class families

**Region A — `.nls-*` design-system layer (tokenised; lines 137–1539)**

| Family | Styles |
|---|---|
| `.nls-tone-*` | tone variable sets (fg/bg/bd) for badges & health rows |
| `.nls-card` | surface card: `background var(--nls-surface)`, 1px border, `radius-card`, `shadow-card` |
| `.nls-section` (`__header/__heading/__title/__desc/__actions/__body/__footer`) | card section header/body/footer with 16px padding, footer top border |
| `.nls-stat` (`__top/__label/__icon/__row/__value/__trend(--up/--down)/__desc/__action/__value-skel`) | KPI tile, 26px/650 value, accent icon |
| `.nls-health` (`__icon/__main/__top/__title/__desc/__action`) | status row with 3px tone-coloured left border |
| `.nls-badge` (`__dot`) | pill badge using tone vars, `color-mix` border |
| `.nls-btn` (`--sm/--primary/--secondary/--ghost/--danger/--success/--icon`, `__spinner`, `.is-loading`) | button system, 8×14 padding, `focus-visible` ring, `nls-spin` spinner |
| `.nls-empty` (`__icon/__headline/__desc/__actions/__help`) | dashed empty-state block |
| `.nls-page-header` (`__breadcrumb/__crumbs/__crumb/__crumb-link/__crumb-current/__sep/__bar/__lead/__icon/__title/__desc/__actions`) | page title bar with breadcrumbs |
| `.nls-skel`, `.nls-skel-text/-line/-card/-table` | shimmer skeletons (`nls-skel-shimmer` 1.4s) |
| `.nls-page` (`__body`) | page canvas, 24/32px padding, `@media (max-width:782px)` → 16/12px |
| `.nls-section-label`, `.nls-grid-stats(--2/--3)`, `.nls-grid-health(--2)`, `.nls-stack(--tight)`, `.nls-list`, `.nls-cluster` | layout primitives (grid breakpoints 640px / 900px) |
| `.nls-check` (`__box/__main/__title/__hint/__end`, `--done`) | checklist row |
| `.nls-tabs` (`__tab`, `.is-active`, `__badge`) | underline tabs, accent active colour |
| `.nls-search` (`__icon/__input/__clear`) | 32px search box |
| `.nls-input`, `.nls-select`, `.nls-textarea`, `.nls-field` (`__label/__req/__helper/__error`, `--invalid`) | form controls with focus ring |
| `.nls-keyfield` (`__row/__input/__btn/__saved/__mask`) | API-key field with reveal button, mono mask |
| `.nls-notice` (`__icon/__body/__title/__msg/__action/__dismiss`) | inline notice |
| `.nls-progress` (`__top/__label/__pct/__track/__bar`, `--indeterminate`) | progress bar (`nls-indeterminate` 1.2s) |
| `.nls-checkbox` (`__native/__box/__label`) | custom checkbox |
| `.nls-form-grid` (720px breakpoint), `.nls-caps` | form layout helpers |
| `.nls-filterbar` (`__row/__search/__bulk/__count/__clear/__actions`) | list filter bar |
| `.nls-table-wrap`, `.nls-table` (`__col--right/--center`, `__th-label`, `__sort`, `__row(--clickable,.is-selected)`, `__cell--primary`, `__checkbox-col`, `__actions-col`, `__actions`) | data table |
| `.nls-drawer-root(--right/--left)`, `.nls-drawer-overlay`, `.nls-drawer(--lg)` (`__header/__title/__close/__body/__footer`) | fixed side drawer, `z-index: var(--nls-z-drawer)` = 100000 |
| `.nls-pagination` (`__info/__controls/__btn(.is-current)/__ellipsis`) | pager |
| `.nls-detail` (`__row/__key/__val`) | key/value list |
| `.nls-vlist` (`__sizer`), `.nls-convo-row` (`__main/__q/__meta/__aside/__count`) | virtual list + conversation rows |
| `.nls-thread`, `.nls-msg` (`--user/--assistant`, `__avatar/__col/__bubble/__role/__content/__attachments/__attachment/__attach-link/__attach-name/__sources/__sources-label/__source/__meta/__ctx/__time`) | chat transcript |

**Regions D & F — page-specific `.nexulesuite_*` / `.nls-*` sections (hard-coded colours)**

| Family (first line) | Styles |
|---|---|
| `.nexulesuite_admin-app` (3925), `.nexulesuite_admin-sidebar`, `_sidebar-divider/-logo/-brand/-link(.is-active,[aria-current])/-collapse/-search/-group/-soon`, `.nexulesuite_header-cmdk` (3928–4022) | SPA shell + left nav using `--nexus-sidebar-*`; `focus-visible` 2px outline |
| `.nexulesuite_group-details-wrap` / `_gd-*` (4023–4458) | menu-group editor: card, sections, 2-col grid, toggle (`.track/.knob`), buttons, segmented control (`_gd-seg .glider`), condition cards (`_gd-cond`, `_gd-cbox`, `_gd-cond-panel .pick-list`), summary |
| `.nexulesuite_popup-sections-wrap`, `.nexulesuite_popups-editor-wrap`, `_pop-*` (4464–5411) | popup builder: `.inp/.sel/.chex/.seg/.rte-code/.content-code/.slide-field`, logic grid, section cards, icon buttons |
| `.nexulesuite_btn-editor-wrap` / `_be-*` (5417–5810) | menu-button editor fields/rows/sections |
| `.nexulesuite_emails-editor-wrap` / `_em-*` (5815–6203) | email template editor: recipients chips, tags, HTML panel, uuid badge |
| `.nexulesuite_form-builder-wrap` / `_fb-*` (6208–6726) | classic form builder card: head, tabs, fields, colour grid, toggles, icon buttons, shortcode row |
| `.nexulesuite_settings-general-wrap` / `_sg-*` (6731–7641), `.nexulesuite_smtp-wrap` (6790) | settings: cards, sections, toggles, link-copy boxes, font picker list/preview, logo preview, alerts, client-access panel |
| `.nexulesuite_tip`, `_tip-bubble` (6877) | tooltip trigger + bubble, `z-index: 60` |
| `.nexulesuite_settings-autopopup-exclusion-wrap` / `_sap-excl-*` (7645–7812) | auto-popup exclusion rules chips/fields |
| `.nexulesuite_settings-livechat-wrap` / `_lc-*` (7816–8518) | livechat settings incl. sticky preview panel (`position: sticky`), `nexulesuite_lc-pulse` keyframes, range fields |
| `.nexulesuite_activities-wrap` / `_act-*` (8524–9088) | activities report: filters, tabs, table, badges, fixed modal (`_act-modal` `z-index: 50`), recipient list, PDF buttons |
| `.nexulesuite_fp-*` (9093) | font-picker input/icon tweaks (`!important`) |
| `.nexulesuite_nls-color`, `_nls-color-grid/__row`, `_nls-icolor*` (9788–10100) | PrimeReact-like colour input + HSV picker (`_nls-icolor__hue` rainbow gradient, `__native` `position: fixed !important`) |
| `.nexulesuite_nls-icon-row/-grid/-opt`, `_nls-order-row/-btn/-list`, `_nls-chat-preview-row` | icon/ordering pickers |
| `.nexulesuite_a11y-fab-preview(-wrap)` (9844) | a11y FAB preview bubbles |
| `.nexulesuite_ai-livechat`, `.nls-ai-livechat-toolbar/-infile/-embed-col/-embed-row` (10478) | AI livechat settings toolbar grid |
| `.nls-button-colors-inline` (10736), `.nls-a11y-dock-preview(-card)`, `.nls-dock-display-*` (10913), `.nls-dock-offset-*`, `.nls-a11y-nudge*`, `.nls-btn-position-card`, `.nls-custom-btn-card/-row/-toggle` (11057–11315) | accessibility-dock settings widgets (mostly `!important`) |
| `#nexulesuite_admin-root .overflow-y-auto { overflow-x: hidden }` (11045) | **only selector in main.css that targets a Tailwind utility class** |
| `.slide-field`, `.cswatch`, `.group`, `.active`, `.disabled` | un-prefixed helper classes used inside the wraps (collision risk with WP core `.active`/`.disabled`) |

### 1.3 Tailwind preflight: present and **unscoped**

Lines 1648–1859 are the standard Tailwind v3 preflight with no parent selector, no `important:` option and no `@layer` scoping:

```css
*, :before, :after { box-sizing: border-box; border-width: 0; border-style: solid; border-color: #e5e7eb; }
html, :host { line-height: 1.5; -webkit-text-size-adjust: 100%; tab-size: 4; font-family: Inter, system-ui, sans-serif; … }
body { margin: 0; line-height: inherit; }
hr { height: 0; color: inherit; border-top-width: 1px; }
h1,h2,h3,h4,h5,h6 { font-size: inherit; font-weight: inherit; }
a { color: inherit; text-decoration: inherit; }
code,kbd,samp,pre { font-family: JetBrains Mono, ui-monospace, monospace; font-size: 1em; }
table { text-indent: 0; border-color: inherit; border-collapse: collapse; }
button,input,optgroup,select,textarea { font-family: inherit; font-size: 100%; font-weight: inherit; line-height: inherit; color: inherit; margin: 0; padding: 0; }
button, input:where([type=button|reset|submit]) { -webkit-appearance: button; background-color: transparent; background-image: none; }
blockquote,dl,dd,h1…h6,hr,figure,p,pre { margin: 0; }  fieldset { margin:0; padding:0 }  ol,ul,menu { list-style:none; margin:0; padding:0 }
input::placeholder, textarea::placeholder { opacity: 1; color: #9ca3af; }
button,[role=button] { cursor: pointer }  :disabled { cursor: default }
img,svg,video,canvas,audio,iframe,embed,object { display: block; vertical-align: middle; }  img,video { max-width:100%; height:auto }
[hidden]:where(:not([hidden=until-found])) { display: none }
```

Because `main.css` is enqueued on every plugin admin page as a normal stylesheet, this reset applies to the **entire WP admin document**: `#wpadminbar`, `#adminmenu`, `#wpfooter`, core notices, `.button`/`.button-primary` (padding/background reset → WP core re-applies its own, but specificity ties resolve by order: core `wp-admin.css` loads earlier, so Tailwind's `button { background-color: transparent; padding: 0 }` wins over core's element-level rules; core `.button` class rules still win because they are class selectors). Known visible effects: `html { font-family: Inter… ; line-height: 1.5 }` changes admin-bar/menu typography, `h1–h6 { font-size: inherit }` flattens any WP-rendered heading outside the SPA (e.g. core notices injected above `#nexulesuite_admin-root`), `ol,ul { list-style:none }` and `img { display:block }` affect admin-menu and notices, `*{border-color:#e5e7eb}` changes any element that only sets `border-width` (e.g. WP `.notice` left border colour is set explicitly so it survives, but generic separators do not). `wp-admin-chrome.css` lines 225–278 and 280–334 exist specifically to repair fallout from this reset (field-picker SVGs hidden, button text-transform, TinyMCE chrome).

### 1.4 Hand-maintained files

#### `assets/admin/css/wp-admin-chrome.css` (576 lines, handle `nexulesuite_admin-chrome`, loaded **before** `main.css`)

Purpose: (a) flush the SPA against the WP admin menu, (b) restyle the SPA sidebar from the legacy dark Tailwind look to a transparent, WP-colour-scheme-aware look, (c) repair preflight damage inside the field picker / TinyMCE, (d) style the Settings → Auto-Popup exclusion URL picker and the Submissions-report menubar.

Selectors reaching outside the plugin root (WP core chrome):

```css
body.toplevel_page_nexulesuite_ #wpcontent, body[class*="page_nexulesuite_"] #wpcontent { padding-left: 0; }        /* L4 */
body.toplevel_page_nexulesuite_ #wpbody-content, body[class*="page_nexulesuite_"] #wpbody-content { padding: 0; }     /* L9 */
body.toplevel_page_nexulesuite_ .wrap, body[class*="page_nexulesuite_"] .wrap { margin: 0; }                           /* L14 */
#nexulesuite_admin-root { margin:0; padding:0; width:100%; max-width:none; }                                            /* L19 */
body[class*="nexulesuite_"]:not(.nexulesuite_mce-dialog-open) #mce-modal-blocker, … .mce-blocker, … .tox-dialog__backdrop
  { display:none !important; pointer-events:none !important; visibility:hidden !important; }                           /* L281 */
.nexulesuite_sap-excl-link-row, .nexulesuite_sap-excl-link-btn, .nexulesuite_sap-excl-hint, .nexulesuite_sap-excl-results,
.nexulesuite_sap-excl-result, .nexulesuite_sap-excl-field .inp[type="search"]                                            /* L337–411: not prefixed with #nexulesuite_admin-root */
```

No rules touch `#adminmenu`, `#wpadminbar`, `#wpfooter` or `.notice`. `!important` is used only in L238–248 (field-picker SVG forced visible/sized), L272 (`padding-left: 2.5rem !important`), L284–286 (MCE blocker hide) and L299–323 (TinyMCE chrome removal inside `.nexulesuite_heading-mce-wrap`).

Selectors that depend on **Tailwind utility class names** (fragile — the referenced utilities `bg-sidebar`, `bg-sidebar-active`, `bg-\[\#070b14\]`, `border-sidebar-border`, `hover:bg-white/5`, `hover:bg-white/[0.06]` no longer exist in the built `main.css`; `min-h-screen`, `rounded-xl`, `rounded-lg`, `text-white`, `text-slate-400`, `text-slate-200` do):

```css
#nexulesuite_admin-root > .flex.min-h-screen, #nexulesuite_admin-root .bg-\[\#070b14\]           /* L30–31 */
#nexulesuite_admin-root aside[aria-label="Nexus Lead Suite navigation"]                            /* L36 */
#nexulesuite_admin-root aside .border-sidebar-border                                              /* L43 */
#nexulesuite_admin-root aside [aria-hidden="true"].rounded-xl                                     /* L48 */
#nexulesuite_admin-root aside button.rounded-lg:hover                                             /* L60 */
#nexulesuite_admin-root aside > div:last-child (button, button svg)                               /* L76, 83, 183, 188 */
#nexulesuite_admin-root aside nav a, a:hover, a[aria-current="page"], a[aria-current="page"] svg   /* L88–130 */
#nexulesuite_admin-root .bg-sidebar, .bg-sidebar-active                                           /* L194, 198 */
#nexulesuite_admin-root aside .text-white, aside nav a.text-white                                 /* L202–208 */
#nexulesuite_admin-root aside .text-slate-400, .text-slate-200, .hover\:text-slate-200:hover      /* L211–217 */
#nexulesuite_admin-root aside .hover\:bg-white\/\[0\.06\]:hover, .hover\:bg-white\/5:hover         /* L220–221 */
#nexulesuite_admin-root .nexulesuite_field-picker-modal > div:first-child button svg              /* L237 */
```

Also uses `var(--wp-admin-theme-color, #2271b1)` (L49, L199) — the only place the WP colour scheme is honoured. No media queries. Hard-coded colours: `#fff ×8, #4338ca ×7, #1d2327 ×7, #eef2ff ×5, #e2e8f0 ×5, #f0f0f1 ×4, #334155 ×4, #dcdcde ×3, #c7d2fe ×3, #64748b ×3, #646970 ×3, #f8fafc, #f1f5f9, #a5b4fc, #4f46e5, #475569, #2271b1, #0f172a ×2, #f6f7f7, #c3c4c7, #9ca3af, #94a3b8, #8c8f94, #6366f1, #50575e, #1e293b, #070b14, rgba(99,102,241,.15), rgba(15,23,42,.04/.12/.06)`. z-index: 2 (sidebar footer, search icon), 1 (search input), 20 (`.nls-sub-menubar-wrap`), 40 (`.nls-sub-menubar__popup`). Transitions: `background-color/color/border-color 0.18s ease` (sidebar links), `0.15s ease` (menubar trigger). Note: `.nls-sub-menubar__input { outline: none }` with `:focus { border-color:#a5b4fc; box-shadow: 0 0 0 3px rgba(99,102,241,.15) }` — low-contrast focus indicator.

#### `assets/admin/css/form-builder-fui.css` (944 lines, handle `nexulesuite_admin-fui`, after `main.css`)

Purpose: Forminator-like form-builder workspace — two-column grid (`.nexulesuite_fui-workspace`: `minmax(0,1fr) minmax(280px,400px)`), canvas card, sticky side panel bar, accordion nav (`_fui-acc*`, `_fui-nav*`), toggles (`_fui-toggle__track` `#17a2b8` on-colour), customization cards (`_cust*`), device toggles, "apply" buttons, sidebar typography shrink (10–12px labels), global-style box.

Outside-root selectors: none are prefixed with `#nexulesuite_admin-root`; everything is `.nexulesuite_fui-*` / `.nexulesuite_cust*` / `.nexulesuite_fb-*` so it is scoped by class only. It overrides **WP core button classes** inside its wrappers: `.nexulesuite_fui-panel__body .button-primary`, `.nexulesuite_fui-side .button-primary`, `.nexulesuite_cust .button-primary`, `.nexulesuite_fui-side .button`, `.nexulesuite_fui-method .button-primary` (L753–794, L847–859). No `#wpcontent/#wpbody/.wrap/.notice/body.*` rules.

`!important` density is very high (≈150 declarations): e.g. `.nexulesuite_fui-insert-btn { background:#2271b1 !important; … padding:8px 14px !important }`, `.nexulesuite_fui-acc__head { display:flex !important; width:100% !important; … box-sizing:border-box !important }`, `.nexulesuite_fui-side .lbl { font-size:10px !important; color:#646970 !important }`. Any redesign must out-specify these or edit the file.

Media queries: `@media (min-width:1101px)` (side column fixed 400px), `@media (max-width:1100px)` (stack to 1 column), `@media (min-width:360px)` (`_cust-row` 2 cols), `@media (max-width:700px)` (`_cust-row` 1 col). Un-prefixed helper selectors: `.inp`, `.ta`, `.lbl`, `.hint`, `select.inp`, `textarea`, `input[type=range]`, `.nls-slider` inside the wrappers.

Focus: `.nexulesuite_fui-acc__trigger:focus { outline:none !important; box-shadow:none !important }` then `:focus-visible { outline: 2px solid #2271b1 !important; outline-offset:-2px }` (OK). `.nexulesuite_cust__device.is-active:focus` and `.button-primary:focus` only change colour (no visible ring). Transitions: `background 0.2s/0.15s ease-out`, `transform 0.2s ease-out` (plus icon), `background/transform 0.15s ease` (toggle). z-index: 2 (`_fui-panel__bar` sticky). Colours: `#2271b1 ×22, #fff ×20, #1d2327 ×13, #e2e8f0 ×9, #dcdcde ×7, #135e96 ×6, #f0f0f1 ×5, #646970 ×5, #ffffff ×4, #c3c4c7 ×4, #f8fafc ×2, #f6f7f7 ×2, #64748b ×2, #f1f5f9, #f0f6fc, #f0f6fb, #e6e6e6, #a7aaad, #94a3b8, #8c8f94, #17a2b8, #0f766e, rgba(0,0,0,.04), rgba(0,0,0,.2)`.

#### `assets/admin/css/range-slider.css` (240 lines, handle `nexulesuite_admin-range-slider`, last)

Purpose: PrimeReact-like `<input type=range>` skin for `.nls-slider` / `.nls-slider__input` (3px track, 14px radial-gradient thumb, WebKit + Firefox pseudo-elements) plus a fallback skin for any bare `input[type="range"]:not(.nls-slider__input)` under `.nexulesuite_admin`, `.nexulesuite_form-builder-wrap`, `.nexulesuite_fui-side`, `.nexulesuite_popups-editor-wrap`, and a compact `.slide-field` variant (12px, all `!important`, L234–240).

Uses tokens with fallbacks: `--nls-slider-primary: var(--nls-blue-500, #2271b1)`, `--nls-slider-track: var(--nls-gray-200, #dcdcde)`, `--nls-slider-handle: var(--nls-gray-100, #f0f0f1)`, `--nls-slider-handle-inner: var(--nls-white, #ffffff)`, fill percentage via `--nls-pct` (set by JS). Fallback skin (L161–232) hard-codes `#dcdcde`, `#2271b1`, `#fff`, `#f0f0f1`, `rgba(0,0,0,.08/.14)`.

Outside-root: none (`.nexulesuite_admin` is a class on the app). No WP core overrides, no media queries, no Tailwind-class dependencies. Focus: `.nls-slider__input:focus-visible { outline:none }` then `::-webkit-slider-thumb { outline: 1px solid var(--nls-slider-primary); outline-offset: 2px }` (1px ring — thin). Transition: `transform 0.12s ease`, thumb `scale(1.06)` on hover/active.

### 1.5 Cross-file inventories

**Breakpoints used (all admin CSS):**

- `main.css` Tailwind: `min-width: 640 / 768 / 1024 / 1280 / 1536px` (container + `sm:/md:/lg:` variants at 9607, 9681, 9775)
- `main.css` nls layer: `max-width: 782px` (`.nls-page`, WP's own mobile breakpoint), `min-width: 640px` (stat grids), `min-width: 900px` (health grid), `min-width: 720px` (form grid)
- `main.css` page sections: `max-width: 560px ×6, 760px ×4, 900px ×3, 640px ×3, 860px, 767px, 600px, 1100px, 1099px`; `min-width: 1100px`
- `form-builder-fui.css`: `min-width: 1101px`, `max-width: 1100px`, `min-width: 360px`, `max-width: 700px`
- `wp-admin-chrome.css`, `range-slider.css`: none
- `prefers-reduced-motion: reduce` ×11 in main.css (see 1.6)

Total of 18 distinct width breakpoints with no shared scale; `782px` is the only one aligned with WP admin.

**Hard-coded colours (not tokens):** `main.css` Region A: **0**. `main.css` Regions D/F: **210 distinct** values; top: `#fff ×106, #f8fafc ×25, #0f172a ×21, #e6e8ee ×20, #4f46e5 ×20, #334155 ×19, #94a3b8 ×17, #64748b ×14, #0000 ×13, #eef2ff ×12, #2271b1 ×11, rgba(79,70,229,.18) ×9, #4338ca ×9, #eef0f5 ×8, rgba(15,23,42,.12) ×7, rgba(15,23,42,.04) ×7, #f4f5f8 ×7, #f1f5f9 ×7, #cbd5e1 ×7, rgb(0 0 0/.1) ×6, #dcdcde ×6, #cfd4de ×6, #7c3aed ×6, #2563eb ×6, #10b981 ×6, rgba(0,0,0,.12) ×5, #fafbfc ×5, #e2e8f0 ×5, #ddd6fe ×5, #646970 ×5, #1e293b ×5, #1d2327 ×5`, plus the full Tailwind slate/indigo/rose/amber/emerald ramps as `rgb(r g b / var(--tw-*-opacity))`, the HSV picker rainbow (`#f00 #ff0 #0f0 #0ff #00f #f0f`), brand oranges `#f38020 #f6a45c #db6e0a`, and hex-alpha variants (`#0f172a0d…#0f172a8c`, `#4f46e52e/59/80`, `#8b5cf659/80`, `#ffffff1a/26/2e/b8`). Preflight adds `#e5e7eb` (border) and `#9ca3af` (placeholder). Other files: see 1.4.

**Font-family declarations:**

- Preflight: `html { font-family: Inter, system-ui, sans-serif }`, `code,kbd,samp,pre { JetBrains Mono, ui-monospace, monospace }`
- Utilities: `.font-sans → Inter, system-ui, sans-serif`, `.font-display → Sora, Inter, sans-serif`, `.font-mono → JetBrains Mono, ui-monospace, monospace` (3299–3308)
- Custom sections: `JetBrains Mono, ui-monospace, monospace ×32`, `inherit ×9`, `Plus Jakarta Sans, system-ui, sans-serif ×7` (settings/activities), `Inter, system-ui, sans-serif ×4`, `Sora, Inter, sans-serif ×3`, `var(--nls-font-mono) ×1`, `ui-monospace, SFMono-Regular, Menlo, monospace`, `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`
- Tokens: `--nls-font-sans`, `--nls-font-mono` (defined, almost unused)
- Hand files: none (chrome/fui/range use inherit)
- **Overriding everything:** the "global font" inline style (handle `nexulesuite_global-font`, `core/class-global-font.php:240`) prints `.nexulesuite_admin-app, .nexulesuite_admin-app *:not(.dashicons):not([class*="dashicons"]) { font-family: var(--nexulesuite_font) !important; }` with `--nexulesuite_font: 'Inter', <fallback>` by default. Every font-family above inside the app (including mono code blocks) is therefore defeated; only Google-Fonts-injected `Sora`/`JetBrains Mono` survive outside `.nexulesuite_admin-app`. "Plus Jakarta Sans" is never loaded anywhere.

**z-index inventory:** tokens `--nls-z-header 30`, `--nls-z-drawer 100000`, `--nls-z-toast 100001`; `.nls-drawer-root` uses the drawer token; `.nexulesuite_gd-seg button / .seg button` 1; `.nexulesuite_tip-bubble` 60; `.nexulesuite_act-modal` 50 (fixed); chrome: 1, 2, 20, 40; fui: 2. Fixed/sticky elements: `.nls-drawer-root` (fixed), `.nexulesuite_act-modal` (fixed), `.nexulesuite_settings-livechat-wrap .nexulesuite_lc-preview` (sticky), `.nexulesuite_nls-icolor__native` (fixed !important), `.nexulesuite_nls-icon-row .nexulesuite_a11y-fab-preview-wrap` (sticky), `.nexulesuite_fui-panel__bar` (sticky). WP admin bar is `z-index: 99999` and `#adminmenuwrap` 9990 — the modal (50) and tooltip (60) sit **below** the admin menu/bar when overlapping; the drawer (100000) sits above the admin bar.

**Animations / transitions:** keyframes `nls-spin 0.7s linear infinite` (btn spinner), `nls-skel-shimmer 1.4s ease-in-out infinite`, `nls-indeterminate 1.2s ease-in-out infinite`, Tailwind `pulse`, `spin`, `bounce 1s infinite`, `nexulesuite_lc-pulse 1.6s ease-in-out infinite`. Transitions: token `var(--nls-transition)` (0.16s) in Region A; page sections use literal `0.15s` (≈60 declarations, mostly `border-color, box-shadow` or `background, border-color, color`), `0.18s` (sidebar, `transform/background/color`), `0.12s`, `0.14s`, `0.2s`, `0.1s`, plus `transition: none !important` ×10 inside reduced-motion blocks; fui `0.15–0.2s ease-out`; range `0.12s`.

### 1.6 Accessibility-relevant CSS

**Focus-visible:** Region A consistently uses `:focus-visible { outline: none; box-shadow: var(--nls-focus-ring) }` (btn, tabs, input/select/textarea, keyfield btn, pagination btn, convo-row, checkbox) — the ring is 3px accent violet on 1px surface halo: adequate. Sidebar: `.nexulesuite_sidebar-link:focus-visible, .nexulesuite_header-cmdk:focus-visible { outline: 2px solid var(--nexus-sidebar-active-accent); outline-offset: 1px }`. Page sections mostly use plain `:focus` (not `:focus-visible`) with `outline: none` and a `box-shadow: 0 0 0 4px <primary-ring rgba(79,70,229,.18)>` substitute (gd 4113, pop 4526, be 5593, fb 6367, act 8681/8865/8991 …) — visible but low-contrast (18 % alpha indigo on white ≈ 1.3:1 against the page). **Outline removed with no replacement**: `.nls-search__input` (790; relies on parent `:focus-within` border colour), `.nls-drawer` (1218; container), `.nexulesuite_popups-editor-wrap .rte-code`, `.content-code` (4642, 4885), `.nexulesuite_popups-editor-wrap .slide-field input[type="range"]` (4805) and `.nexulesuite_btn-editor-wrap .slide-field input[type="range"]` (5725), `.nexulesuite_nls-icolor__hue/__sat` (9991, 10001), `.nexulesuite_em-recipients-inp` (6054), `.nexulesuite_sg-link-inp` (7263), chrome `.nls-sub-menubar__input` (only 3px 15 % ring), range-slider thumb (1px outline only). Tailwind preflight removes `button { background }` but keeps `:-moz-focusring { outline: auto }`; Tailwind's default `outline` utilities are present but focus styling of utility-built buttons depends on JSX classes (not auditable here).

**Reduced motion:** handled 11 times: `:root { --nls-transition: 0ms }` (132), `.nls-skel, .nls-btn__spinner { animation: none }` (1534), and `<wrap> * { transition: none !important }` for group-details (4458), popups (5411), btn-editor (5810), emails (6203), form-builder (6726), settings-general (7641), autopopup-exclusion (7812), livechat (8518, also `animation: none !important`), activities (9088). Not covered: sidebar transitions, tooltip, `nls-indeterminate`, Tailwind `pulse/spin/bounce`, fui/chrome/range transitions, Region F sections.

**Contrast (WCAG 2.x, light theme, computed):**

| Token | on canvas `#f0f0f1` | on surface `#fff` | on surface-2 `#f6f7f7` | Verdict |
|---|---|---|---|---|
| `--nls-ink #1d2327` | 13.95 | 15.89 | 14.80 | AAA |
| `--nls-ink-2 #3c434a` | 8.81 | 10.03 | 9.34 | AAA |
| `--nls-muted #646970` | 4.86 | 5.53 | 5.15 | AA (fails AAA; used at 11–12px for captions/helpers → AA requires 4.5 and passes, but 11px helper text at 4.86 is marginal) |
| `--nls-faint #8c8f94` | 2.85 | 3.24 | 3.02 | **Fails AA for text** (used for `.nls-page-header__sep`, placeholders); OK only for large text/UI graphics (3:1) on white |
| `--nls-primary #2271b1` | 4.54 | 5.17 | 4.81 | AA |
| `--nls-accent #7c3aed` | 5.00 | 5.70 | 5.31 | AA |
| `--nls-success #00a32a` | 2.94 | 3.35 | 3.12 | **Fails AA as text** (`.nls-stat__trend--up`, success badge text 3.11 on `#edfaef`) |
| `--nls-warning #dba617` | 1.95 | 2.22 | 2.06 | **Fails** (warning badge text 2.09 on `#fcf9e8`; white on warning 2.22) |
| `--nls-danger #d63638` | 4.15 | 4.73 | 4.40 | AA on white only; danger badge 4.25 on `#fcf0f1` fails AA small text; white on danger 4.73 AA |
| `--nls-border-strong #8c8f94` | 2.85 | 3.24 | 3.02 | ≥3:1 on white only (UI component minimum) |
| white on primary / accent / success / warning / danger | — | 5.17 / 5.70 / 3.35 / 2.22 / 4.73 | — | success & warning buttons fail AA |

Dark theme: all text tokens pass AA (muted 5.49–7.88, faint 3.95–5.67; faint on surface-2 fails 4.5). Tone badges in dark pass (5.67–9.21).

Page-local palettes (light): ink `#0f172a` 17.85, ink-2 `#334155` 10.35, muted `#64748b` 4.76 (AA), **faint `#94a3b8` 2.56 (fails)**, **success `#10b981` 2.54 (fails)**, primary `#4f46e5` 6.29. Sidebar: text `#50575e` 7.33, link `#334155` 10.35, active `#4338ca` on `#eef2ff` 7.07, sub-link `#64748b` 4.76, chrome muted `#94a3b8` 2.56 (fails, used for panel titles), preflight placeholder `#9ca3af` 2.54 (fails).

---

## Part 2 — Public front end (must NOT be touched by the admin redesign)

### 2.1 `public/class-shortcodes.php::register_hooks()` (line 180)

```
register_shortcodes()                       → add_shortcode('nexulesuite_form'), add_shortcode('nexulesuite_chat')
template_redirect @5  maybe_serve_chat_embed       (?nexulesuite_chat_embed=1 → standalone chat document, exit)
wp @4                 scan_singular_for_form_shortcode  (post_content contains 'nexulesuite_form' → $did_render=true)
wp @1                 pre_check_popup_shortcodes   (popups option content contains '[' → $did_render=true)
wp_enqueue_scripts @5   prime_popup_embedded_shortcodes (expands popup shortcodes, output discarded, so CF7/WPForms enqueue)
wp_enqueue_scripts @10  enqueue_assets
wp_enqueue_scripts @10  enqueue_global_font
wp_enqueue_scripts @10  enqueue_bottom_nav_styles
wp_enqueue_scripts @10  enqueue_popup_styles  (registers dummy handles only)
wp_enqueue_scripts @30  enqueue_activity_tracker
wp_enqueue_scripts @99  enqueue_visual_editor
wp_enqueue_scripts @999 enqueue_visual_editor_dom_patches
wp_footer @12  render_popups        wp_footer @15  render_livechat_widget        wp_footer @20  render_bottom_nav
wp_ajax(_nopriv)_nexulesuite_trigger_notify → handle_trigger_notify
wp_ajax(_nopriv)_nexulesuite_submit_form    → handle_form_submit_ajax
```

### 2.2 Every public script/style handle

| Handle | Type | File / source | Loads when | Deps | Localized object |
|---|---|---|---|---|---|
| `nexulesuite_forms-runtime` | style | `public/css/forms-runtime.css` (ver = filemtime) | `enqueue_assets()` only if `$did_render` (form shortcode in singular content, in a popup, or rendered) | — | — |
| `nexulesuite_forms-runtime` | script (footer) | `public/js/forms-runtime.js` | same | `nexulesuite_recaptcha` and/or `nexulesuite_turnstile` when site keys saved | `nexulesuite_Forms` {ajaxUrl, action, thankYouMessage, smtpSetupMessage, result titles, dismissLabel, recaptchaSiteKey/ApiVersion/V3Action/V3FailMessage, turnstileSiteKey} |
| `nexulesuite_recaptcha` | script (footer, defer) | dummy handle, `script_loader_src` → `https://www.google.com/recaptcha/api.js?render=…` | reCAPTCHA site key set | — | — |
| `nexulesuite_turnstile` | script (footer, defer) | dummy → `https://challenges.cloudflare.com/turnstile/v0/api.js` | Turnstile site key set | — | — |
| `nexulesuite_fui-base/-global/-grid/-forms/-icons/-shell` | styles (chained deps) | `assets/vendor/forminator-ui/css/forminator-*.min.css` | `Forminator_UI_Bridge::enqueue()` from `enqueue_assets()` when vendor `js/forminator-form.min.js` exists | each on previous | — |
| `nexulesuite_fui-design-{default,flat,bold,material}` | style | `assets/vendor/forminator-ui/css/src/form/forminator-form-{d}.full.min.css` | per design used by rendered/queued forms | `nexulesuite_fui-shell` chain | — |
| `nexulesuite_fui-pag-{design}` | style | `…forminator-form-{d}.pagination.min.css` | multi-step form on page | design handle | — |
| `nexulesuite_fui-form` | script (footer) | `assets/vendor/forminator-ui/js/forminator-form.min.js` | with bridge | `jquery` | — |
| `nexulesuite_forminator-fui` | script (footer) | `public/js/nexus-ls-forminator-fui.js` | with bridge | `jquery`, `nexulesuite_fui-form`, `nexulesuite_forms-runtime` | — |
| `nexulesuite_forminator-bridge` | style | `public/css/nexus-ls-forminator-bridge.css` | with bridge | `nexulesuite_forms-runtime` | — |
| `nexulesuite_global-font` | style (inline only) | `core/class-global-font.php::enqueue()` → `@font-face` + `:root{--nexulesuite_font}` + front-end `!important` font rules | every front-end page (`enqueue_global_font`), also VE, client gateway, and admin (`admin/class-admin-app.php:409`) | — | — |
| `nexulesuite_bottom-nav` | style (inline only) | CSS string in `enqueue_bottom_nav_styles()` (`.nexulesuite_bottom-nav` fixed bar, `z-index: 999990`, shake keyframes) | general `enableNavigation` and ≥1 active menu button for request | — | — |
| `nexulesuite_popup-overlay` | style + script (inline only) | registered in `enqueue_popup_styles()`, filled by `render_popups()` via `enqueue_footer_inline_style/script` (lines 2038, 2353) | popups option non-empty | — | — |
| `nexulesuite_livechat-widget` | style + script (inline only) | filled by `render_livechat_widget()` (4044–4045) and `maybe_serve_chat_embed()` | livechat enabled | — | — |
| `nexulesuite_chat-embed` | style | `public/css/chat-embed.css` | `[nexulesuite_chat mode="iframe"]` | — | — |
| `nexulesuite_track-utils` | script (footer) | `public/js/nexus-ls-track-utils.js` | every front-end page (`!is_admin()`) | — | — |
| `nexulesuite_popup-bridge` | script (footer) | `public/js/nexus-ls-popup-bridge.js` | every front-end page | `nexulesuite_track-utils` | `nexulesuite_PopupBridgeCfg` {ajaxUrl, notifyNonce, popupClassMap, notifyClassMap} |
| `nexulesuite_activity-tracker` | script (footer) | `public/js/nexus-ls-tracker.js` | every front-end page | `nexulesuite_track-utils`, `nexulesuite_popup-bridge` | `nexulesuite_TrackCfg` {endpoint `nexulesuite_/v1/track/events`, nonce, restNonce, scrollMarks [25,50,75,90,100]} |
| `nexulesuite_visual-editor` | script (footer) | `public/js/nexus-ls-visual-editor.js` | logged-in `manage_options` + cookie `nexulesuite_ve=1` + singular | `wp-element` | `nexulesuite_VeCfg` {restUrl, nonce, postId, endpoint `nexulesuite_/v1/visual-editor/update`, activityButtonClasses, globalFont} |
| `nexulesuite_ve-apply-patches` | script (footer) | `public/js/nexus-ls-ve-apply-patches.js` | singular with `_nexulesuite_ve_dom_patches` post meta | `nexulesuite_popup-bridge` (if file exists) | `nexulesuite_VePatches` (array) |
| `nexulesuite_a11y-anti-flicker` | style (inline only) | `class-accessibility-language.php:55-58` | `languageEnabled` (priority 1) | — | — |
| `nexulesuite_a11y-lang` | style | `public/css/accessibility-language.css` (+ inline Lexend `@font-face` when accessibility enabled) | a11y or language enabled, or livechat enabled (dock hosts the chat FAB) | — | — |
| `nexulesuite_a11y-lang` | script (footer) | `public/js/accessibility-language.js` | same | — | `nexulesuite_A11yLang` {flags, button colours/sizes/offsets, dockButtonOrder/Conditions/Offsets/Visible, languages[], icons{accessibility,translate}, i18n{…}} |
| `nexulesuite_google-translate` | script (footer, no ver) | `https://translate.google.com/translate_a/element.js?cb=nexulesuite_googleTranslateInit` | `languageEnabled` | `nexulesuite_a11y-lang` | — |
| `nexulesuite_client-access-gateway` | style | `public/css/client-access-gateway.css` | token-gated report page only (`Client_Access::enqueue_gateway_assets`, called from `maybe_serve_gateway` L484) | `nexulesuite_global-font` | — |
| `nexulesuite_client-access-gateway` | script (footer) | `public/js/client-access-gateway.js` (+ inline `window.print()` when `?print=1`) | same | — | `nexulesuite_ClientPdfCfg` {pdfUrl, token, tab, dateFrom, dateTo, search, sections[], errorMsg} |
| `nexulesuite_forms-runtime-preview` | style (**admin**) | `public/css/forms-runtime.css` | `admin/class-admin-app.php:576-583`, popups admin route only (Pop-Up Simulator) | — | — |

Not enqueued by any PHP: `public/js/access-gate-password-toggle.js` (its `data-nexulesuite_gate*` attributes are whitelisted in `core/popup-shortcode-expand.php:73-77`, so it is probably inlined elsewhere or orphaned).

### 2.3 `public/js` — one line each + DOM contracts

| File | Does | Relies on |
|---|---|---|
| `forms-runtime.js` (1680 l.) | Enhances `.nexulesuite_st-form` forms: multi-step drafts, conditional logic, input masks, AJAX submit to `nexulesuite_submit_form`, result panels inside popups, reCAPTCHA/Turnstile | `window.nexulesuite_Forms`; `.nexulesuite_st-form`; `data-nexulesuite_widget-id`, `data-nexulesuite_draft-step`, `data-nexulesuite_field-id`, `data-nexulesuite_conditional`, `data-nexulesuite_cond-hidden/-disabled`, `data-nexulesuite_submit-gate`, `data-nexulesuite_mask`, `data-form-id`, `data-submit-text`, `data-submission-method`, `data-action`, `dataset.formType/event/nexulesuite_submitLabel/nexulesuite_enhanced`; exposes `window.nexulesuite_PopupUi`, `window.nexulesuite_ResetPopupFormResult` |
| `nexus-ls-popup-bridge.js` (536 l.) | Opens popups on manual clicks matched by class map / `data-popup-id` / `data-event`, fires notify-email triggers via `data-nexulesuite_trigger` | `window.nexulesuite_PopupBridgeCfg`, `window.nexulesuite_PopupUi`, `window.nexulesuite_Track(Utils)`, `data-nexulesuite_ve-wrap` |
| `nexus-ls-track-utils.js` (266 l.) | Click lock / debounce helpers (`window.nexulesuite_TrackUtils`) | `data-nexulesuite_trigger`, `data-nexulesuite_ve-wrap` |
| `nexus-ls-tracker.js` (266 l.) | Site-wide behaviour tracker (scroll marks, exit intent, clicks) → REST `track/events`; defines `window.nexulesuite_Track` | `window.nexulesuite_TrackCfg`, `nexulesuite_PopupBridgeCfg`, `data-nexulesuite_trigger` |
| `nexus-ls-visual-editor.js` (1055 l.) | Admin-only in-page visual editor overlay (React via `wp.element`) that saves DOM patches through REST | `window.nexulesuite_VeCfg`, `data-nexulesuite_ve-hover`, `data-nexulesuite_ve-wrap`, `data-nexulesuite_ve-stop-prop`, `#nexulesuite_ve-root` |
| `nexus-ls-ve-apply-patches.js` (121 l.) | Replays stored DOM patches on page load | `nexulesuite_VePatches`, `data-nexulesuite_ve-wrap`, `data-nexulesuite_ve-stop-prop` |
| `accessibility-language.js` (1239 l.) | Accessibility panel (text size, contrast, dyslexia font, TTS, reading mask…) + GTranslate-style language switcher + dock that hosts the chat FAB; persists to `localStorage nexulesuite_a11y_prefs_v1`; toggles `html.nexulesuite_a11y-*` classes | `window.nexulesuite_A11yLang`, `#nexulesuite_a11y-root`, `#nexulesuite_chat-trigger`, `.nexulesuite_a11y-lang-btn`, `.nexulesuite_a11y-chat-slot`, `.nexulesuite_a11y-flag`, `data-nls-dock-btn`, `data-lang`, `data-key`, `data-nls-keep`, `.goog-te-combo`, `window.nexulesuite_googleTranslateInit` |
| `nexus-ls-forminator-fui.js` (61 l.) | Boots `window.FUI` helpers on `.nexulesuite_st-form.forminator-ui` | jQuery, `window.FUI` |
| `client-access-gateway.js` (73 l.) | PDF download / print buttons on the token-gated report | `#nexulesuite_client-pdf`, `#nexulesuite_client-print`, `#nexulesuite_client-pdf-msg`, `nexulesuite_ClientPdfCfg` |
| `access-gate-password-toggle.js` (32 l.) | Show/hide password eye toggle | `[data-nexulesuite_gate]`, `[data-nexulesuite_gate-pass/-toggle/-eye-on/-eye-off]`, `data-label-show/-hide` |

### 2.4 `public/css` — one line each

| File | Does | Root selectors / notes |
|---|---|---|
| `forms-runtime.css` (1612 l.) | Complete scoped form skin (`.nexulesuite_st-form` ×216 rules, select menus, popup/inline-chat form variants); container queries (`container-name: nexulesuite-form`), `font-family: var(--nexulesuite_font, …) !important`, `--nexulesuite_st-*` size vars | Scoped: `.nexulesuite_st-form`, `.nexulesuite_st-select-menu/-opt`, `.nexulesuite_popup-overlay`, `.nexulesuite_popup`, `.nexulesuite_chat-inline-popup-body`; `@media (max-width:600/640px)`, `(min-width:601px) and (max-width:768px)`, `(min-width:1200/1800px)`, `prefers-reduced-motion`; `z-index: 2147483000 !important` (select menu) |
| `accessibility-language.css` (1063 l.) | A11y dock/FAB/panel/cards, language fly-out & flags, reading mask, Google-Translate banner suppression, and the `html.nexulesuite_a11y-{spacing,invert,dark,pause,dyslexia,focus,big-cursor,text-lg/xl/xxl,links,high-contrast,grayscale,hosts-chat}` global modifiers | **Unscoped** `html`, `body`, `body > .skiptranslate`, `html.translated-ltr/rtl font`; z-index 2147482980–2147483002 |
| `client-access-gateway.css` (362 l.) | Standalone report page (own `:root`, `body`, `table/th/td`, `.wrap`, `.toolbar`, `.tabs`, `.nexulesuite_ca-*`, `.btn-pdf/.btn-print`, `@media print`) | Unscoped `:root { font-family: var(--nexulesuite_font,…); color:#0f172a; background:#f1f5f9 }`, `body`, `table`, `th`, `td`, `.wrap` — safe only because the page is served standalone |
| `chat-embed.css` (24 l.) | Fluid iframe host box (`container-type: inline-size`) for `[nexulesuite_chat mode="iframe"]` | `.nexulesuite_chat-embed(__frame)` |
| `nexus-ls-forminator-bridge.css` (65 l.) | Maps `.nexulesuite_st-form.forminator-ui` structure to Forminator field semantics | scoped |

### 2.5 `public/class-accessibility-language.php::register_hooks()` (line 24)

- `wp_enqueue_scripts @40 enqueue_assets` — see handles above; bails on `is_admin()` or when accessibility, language and livechat are all off.
- `wp_enqueue_scripts @1 print_early_translate_css` — inline anti-flicker CSS on `nexulesuite_a11y-anti-flicker` (hides `.goog-te-banner-frame`, forces `body{top:0;position:static}`, forces `#nexulesuite_a11y-root`, `.nexulesuite_a11y-dock/-fab/-lang-btn` visible with `!important`).
- `wp_footer @40 render_markup` — prints `#nexulesuite_a11y-root` markup (dock, FAB, panel). Option key `nexulesuite_a11y_lang_v1`.
- No partial templates.

### 2.6 `public/class-client-access.php::register_hooks()` (line 38)

- `init @20 Client_Access::sync_rewrite_rules` — `^{slug}/?$ → index.php?<QUERY_VAR>=1` when allowed in DB.
- `query_vars` filter `register_query_var`.
- `template_redirect @5 maybe_serve_gateway` — validates `?token=`, 403 via `wp_die` otherwise; `suppress_site_widgets()` removes the Shortcodes `render_livechat_widget`, `render_popups`, `render_bottom_nav` `wp_footer` callbacks; fetches `Report_Source`; calls `enqueue_gateway_assets()` (L484) then `require public/partials/client-access-gateway.php` (L494) and exits.
- Template `public/partials/client-access-gateway.php`: full HTML document that **does** call `wp_head()` (L89) and `wp_footer()` (L304); `<body class="nexulesuite_client-gateway[ is-print]">`; buttons `#nexulesuite_client-pdf`, `#nexulesuite_client-print`, status `#nexulesuite_client-pdf-msg`; expects `$nexulesuite_ca_token/_tab/_date_from/_date_to/_search/_rows/_site_title/_rest_pdf/_report_logo/_report_logo_max_px`.

### 2.7 Other partial

`public/partials/chat-embed.php` (served by `Shortcodes::maybe_serve_chat_embed()` on `?nexulesuite_chat_embed=1`): deliberately **no** `wp_head()/wp_footer()`; fires `do_action('wp_enqueue_scripts')` then `wp_print_styles()`, `wp_print_head_scripts()`, `wp_print_footer_scripts()`; `<body class="nexulesuite_chat-embed-doc">`; echoes `$nexulesuite_chat_embed_html` through `Shortcodes::allowed_embed_html()`.

`core/popup-shortcode-expand.php::build_popup_preview_payload()` (L268) also fires `do_action('wp_enqueue_scripts')` and captures `wp_print_styles()` / `wp_print_footer_scripts()` to build the admin Pop-Up Simulator payload — so every public `wp_enqueue_scripts` callback above can run inside an admin REST request; the admin redesign must not assume those handles are front-end-only.

### 2.8 Front-end selectors that any admin CSS change must keep clear of

`.nexulesuite_st-form*`, `.nexulesuite_popup-overlay*`, `.nexulesuite_popup*`, `.nexulesuite_chat-widget`, `#nexulesuite_chat-*`, `.nexulesuite_chat-panel*`, `.nexulesuite_chat-btn--*`, `.nexulesuite_menu-widget`, `.nexulesuite_bottom-nav`, `#nexulesuite_a11y-root`, `.nexulesuite_a11y-*`, `.nexulesuite_lang-*`, `.nexulesuite_gt-host`, `html.nexulesuite_a11y-*`, `#nexulesuite_ve-root`, `.nexulesuite_ve*`, `.nexulesuite_client-gateway`, `.nexulesuite_ca-*`, `.nexulesuite_chat-embed*`, `--nexulesuite_font`, `--nexulesuite_st-*`. Note the admin bundle already contains look-alike names (`.nexulesuite_a11y-fab-preview`, `.nls-a11y-dock-preview`, `.nexulesuite_nls-chat-preview-row`) — keep admin preview classes distinct from the live widget classes, and remember `forms-runtime.css` is loaded on the admin popups page (`nexulesuite_forms-runtime-preview`), so admin selectors must not collide with `.nexulesuite_st-form`.
