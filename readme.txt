=== Nexus Lead Suite ===
Contributors: nexusleadcontributors
Tags: leads, analytics, forms, crm, marketing
Requires at least: 6.2
Tested up to: 7.0
Requires PHP: 7.4
Stable tag: 1.2.19
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

All-in-one lead generation and user analytics for WordPress, with a fast admin experience and a lightweight public footprint.

== Description ==

Nexus Lead Suite is a high-performance WordPress plugin for agencies and site owners who need lead capture, on-site engagement, and actionable analytics without slowing down the front end.

From a single admin hub you can:

* Build and manage lead forms, popup campaigns, and automated email templates tied to visitor events.
* Review the Activities timeline—clicks, submissions, mail status, and popup triggers—with export to PDF for reporting.
* Configure button-class rules (`popup:`, `mail:`, `notify:`) and use the Visual Editor on Activities to inspect and tune front-end behavior safely.
* Track interactions in custom database tables while keeping public scripts lightweight (vanilla JavaScript only on the front end).

The admin experience is a modern single-page app (React + Vite, shipped as compiled assets) with modular PHP under the hood for REST APIs, mail delivery, and secure data storage.

* Modular architecture designed for performance and security.
* Admin tools built as a modern single-page experience.
* Public-facing scripts use vanilla JavaScript only (no front-end framework bloat).

== External services ==

This plugin can connect to the third-party services listed below. **None of them are contacted unless you explicitly enable the matching feature and enter your own credentials.** With a default installation the plugin makes no outbound requests at all.

= Google reCAPTCHA =

When reCAPTCHA is enabled on a form, the visitor's browser loads Google's reCAPTCHA script and sends a response token to your WordPress site on form submit. Your server then sends that token (and your site/secret keys) to Google's verification API to confirm the submission is not automated spam.

* Service: Google reCAPTCHA (Google LLC)
* Endpoints: https://www.google.com/recaptcha/
* Data sent: reCAPTCHA response token, site key, secret key (server-side), and the visitor IP address as required by Google's API
* When: on page load and on form submit, only on forms where you enabled reCAPTCHA
* Terms of Service: https://policies.google.com/terms
* Privacy Policy: https://policies.google.com/privacy

= Cloudflare Turnstile =

When Turnstile is enabled on a form, the visitor's browser loads Cloudflare's Turnstile widget and sends a response token to your WordPress site on form submit. Your server then sends that token (and your site/secret keys) to Cloudflare's siteverify endpoint to validate the submission.

* Service: Cloudflare Turnstile (Cloudflare, Inc.)
* Endpoints: https://challenges.cloudflare.com/
* Data sent: Turnstile response token, site key, secret key (server-side), and the visitor IP address as required by Cloudflare's API
* When: on page load and on form submit, only on forms where you enabled Turnstile
* Terms of Service: https://www.cloudflare.com/website-terms/
* Privacy Policy: https://www.cloudflare.com/privacypolicy/

= Google Website Translator =

If you turn on the language switcher in Accessibility & Language settings, the visitor's browser loads Google's Website Translator widget so page text can be machine-translated. Translation is performed on Google's servers and cannot be done locally by the plugin.

* Service: Google Website Translator (Google LLC)
* Endpoints: https://translate.google.com/translate_a/element.js
* Data sent: the page text the visitor asks to translate, plus the request metadata Google's widget collects (IP address, user agent)
* When: only on front-end page views, and only while the language switcher setting is enabled
* Terms of Service: https://policies.google.com/terms
* Privacy Policy: https://policies.google.com/privacy

= AI chat providers (optional AI Chatbot feature) =

The AI Chatbot is disabled by default. If you enable it and choose a provider in Settings -> AI Chatbot, your server sends chat requests to that provider's API using the API key you supply. The provider generates the reply and, where supported, the embedding vectors used to search your own site content; this processing cannot be performed locally by the plugin.

Data sent on each request: the visitor's message, recent conversation turns, the system prompt you configured, and matching excerpts of your own published content. When training the knowledge base, the text of your published posts, pages and products is sent to the selected embedding provider. Requests are made only while the AI Chatbot is enabled and a provider and key are configured. No data is sent to any provider you have not selected.

You select exactly one chat provider (and optionally one embedding provider) from:

* OpenAI (OpenAI, L.L.C.) - https://api.openai.com/v1 - Terms: https://openai.com/policies/terms-of-use - Privacy: https://openai.com/policies/privacy-policy
* Anthropic Claude (Anthropic PBC) - https://api.anthropic.com/v1 - Terms: https://www.anthropic.com/legal/consumer-terms - Privacy: https://www.anthropic.com/legal/privacy
* Google Gemini (Google LLC) - https://generativelanguage.googleapis.com/v1beta - Terms: https://ai.google.dev/gemini-api/terms - Privacy: https://policies.google.com/privacy
* Groq (Groq, Inc.) - https://api.groq.com/openai/v1 - Terms: https://groq.com/terms-of-use - Privacy: https://groq.com/privacy-policy
* DeepSeek (Hangzhou DeepSeek Artificial Intelligence Co., Ltd.) - https://api.deepseek.com/v1 - Terms: https://cdn.deepseek.com/policies/en-US/deepseek-open-platform-terms-of-service.html - Privacy: https://cdn.deepseek.com/policies/en-US/deepseek-privacy-policy.html
* Mistral AI (Mistral AI SAS) - https://api.mistral.ai/v1 - Terms: https://legal.mistral.ai/terms - Privacy: https://legal.mistral.ai/terms/privacy-policy
* Together AI (Together Computer, Inc.) - https://api.together.xyz/v1 - Terms: https://www.together.ai/terms-of-service - Privacy: https://www.together.ai/privacy
* OpenRouter (OpenRouter, Inc.) - https://openrouter.ai/api/v1 - Terms: https://openrouter.ai/terms - Privacy: https://openrouter.ai/privacy
* xAI Grok (X.AI LLC) - https://api.x.ai/v1 - Terms: https://x.ai/legal/terms-of-service-enterprise - Privacy: https://x.ai/legal/privacy-policy
* Voyage AI (Voyage AI Innovations, Inc., embeddings only) - https://api.voyageai.com/v1 - Terms: https://www.voyageai.com/tos - Privacy: https://www.voyageai.com/privacy

Alternatively you may point the AI Chatbot at a self-hosted Nexus AI Server (FastAPI + Ollama) running on infrastructure you control. In that mode the plugin sends the same data only to the base URL you enter; no third party is involved.

= Google Gmail / Workspace SMTP (OAuth 2.0) =

If you choose the Gmail mailer in Settings -> SMTP, the plugin sends outbound site email through Google's servers and uses Google's OAuth 2.0 endpoints to obtain and refresh an access token with the client ID and secret you supply.

* Service: Google Gmail API / OAuth 2.0 (Google LLC)
* Endpoints: https://accounts.google.com/o/oauth2/v2/auth, https://oauth2.googleapis.com/token, https://mail.google.com/
* Data sent: your OAuth client ID and secret, authorization and refresh tokens, and the contents of the emails your site sends
* When: only while the Gmail mailer is enabled and connected
* Terms of Service: https://policies.google.com/terms
* Privacy Policy: https://policies.google.com/privacy

= Microsoft 365 / Outlook SMTP (OAuth 2.0) =

If you choose the Outlook mailer in Settings -> SMTP, the plugin sends outbound site email through Microsoft's servers and uses Microsoft's OAuth 2.0 endpoints to obtain and refresh an access token with the client ID and secret you supply.

* Service: Microsoft 365 / Outlook (Microsoft Corporation)
* Endpoints: https://login.microsoftonline.com/common/oauth2/v2.0/authorize, https://login.microsoftonline.com/common/oauth2/v2.0/token, https://outlook.office.com/
* Data sent: your OAuth client ID and secret, authorization and refresh tokens, and the contents of the emails your site sends
* When: only while the Outlook mailer is enabled and connected
* Terms of Service: https://www.microsoft.com/en-us/servicesagreement
* Privacy Policy: https://privacy.microsoft.com/privacystatement

= Your own SMTP server and webhook endpoints =

Any custom SMTP host, or any CRM / webhook URL you enter in the form or global settings, is an endpoint you choose and control. The plugin POSTs the sanitized form submission payload only to URLs you have entered yourself. It is your responsibility to ensure those destinations comply with your privacy policy.

The plugin does not contact the author's servers, does not include analytics or telemetry, and does not load fonts or flag images from third-party CDNs. Language-switcher flags use local Unicode emoji. All webfonts ship inside the plugin (assets/fonts/) under the SIL Open Font License 1.1 and are served from your own site.

== Source Code ==

The WordPress admin single-page app is distributed as a production build:

* `assets/admin/js/main.js` — JavaScript bundle (minified; built with Vite and React)
* `assets/admin/css/main.css` — compiled styles (built with Vite)

Human-readable source (JSX components, styles, and build configuration) is available in this public repository:

https://github.com/Mostafijemon24/Nexus-Lead-Suite/tree/main/admin/src

Full repository root: https://github.com/Mostafijemon24/Nexus-Lead-Suite

The same `admin/src` tree (and `admin/package.json` / `admin/vite.config.js`) is also included in the plugin package. Public front-end scripts under `public/js/` are already unminified.

To rebuild the admin assets from source:

1. Clone https://github.com/Mostafijemon24/Nexus-Lead-Suite
2. `cd admin` then run `npm ci`
3. Build for production: `npm run build`
4. Output is written to `assets/admin/js/main.js` and `assets/admin/css/main.css` (see `admin/vite.config.js`).

For local development with hot reload, run `npm run dev` and add `define( 'nexulesuite_VITE_DEV', true );` to `wp-config.php` (see `admin/class-admin-app.php`).

== Installation ==

1. Upload the plugin files to the `/wp-content/plugins/nexulesuite_` directory, or install the plugin through the WordPress plugins screen directly.
2. Activate the plugin through the 'Plugins' screen in WordPress.
3. Use the Nexus Lead Suite menu in the admin area to configure the plugin.

== Frequently Asked Questions ==

= Does this plugin work with any theme? =

Yes. Public assets are loaded only where needed to reduce theme conflicts.

= How do I remove all plugin data when uninstalling? =

By default, uninstalling leaves the database tables and options in place so accidental deletes do not wipe leads.

To remove everything on uninstall:

1. While the plugin is still active, run: `wp option update nexulesuite_erase_on_uninstall 1` (or set the same option to `1` in the database), **or**
2. Add to `wp-config.php` before deleting the plugin: `define( 'nexulesuite_UNINSTALL_DELETE_DATA', true );`

Then delete the plugin from the Plugins screen. On multisite, if any site has the option set to `1`, all sites in the network are cleaned when the plugin is removed network-wide.

== Data removal ==

The optional uninstall cleanup removes custom tables (`wp_nexulesuite_interactions`, `wp_nexulesuite_submissions`), plugin options (forms, settings, SMTP, migrations, etc.), and transients whose names start with `nexulesuite_`. Uploaded media files are not deleted automatically.

== Screenshots ==

1. Dashboard (coming soon)

= 1.2.19 =
* Settings → Exclusion Rules: paste a live page/post URL (or search by title) instead of only picking from a 50-item dropdown.

= 1.2.18 =
* Auto popup: Exclusion Rules now actually suppress timer/scroll/exit popups on selected posts and pages.
* Display conditions: more reliable page/post matching (static homepage, posts page, numeric IDs).

= 1.2.17 =
* WordPress.org review: made the Source Code GitHub repository public and confirmed admin/src is reachable.
* WordPress.org review: fixed Voyage AI Terms/Privacy URLs (now /tos and /privacy).
* readme.txt: refreshed AI provider legal links (DeepSeek, Groq, Mistral, xAI) to current working URLs.
* Language switcher: use local Unicode flag emoji instead of loading images from flagcdn.com.

= 1.2.16 =
* Admin: Visual Editor toggle knob now slides when enabled (inline switch styles).
* Visual Editor: ignore WP admin bar, open popups, chat/a11y docks; only target page content.

= 1.2.15 =
* Admin Analytics: restore Visual Editor toggle (enable front-end visual editing from the Activities screen).

= 1.2.14 =
* SMTP OAuth: load PHPMailer’s OAuthTokenProvider (WordPress does not) so Gmail XOAUTH2 actually runs — fixes “Could not authenticate” + misleading 221 reply.
* SMTP test: prefer real auth error lines over connection-close chatter.

= 1.2.13 =
* SMTP test: clearer OAuth auth-failure hints; capture sanitized Gmail server reply when login is rejected.

= 1.2.12 =
* SMTP Gmail preset uses port 587/TLS (hosts often block 465); clearer “could not connect” host-firewall hint.
* SMTP admin: .local OAuth warning only when redirect URI host is actually private.

= 1.2.11 =
* SMTP: never fall back to PHP mail() on OAuth/SMTP errors (fixes “Call to undefined function PHPMailer\\PHPMailer\\mail()”).
* SMTP: Disconnect via REST (fixes “The link you followed has expired”).
* SMTP test: clear error when Default mail() is disabled on the host.

= 1.2.10 =
* SMTP OAuth: treat Connected only when refresh token decrypts; clearer test errors (token/salt/auth/host).
* SMTP OAuth: pin From/Username to the authorized account; probe access token before test send.
* SMTP test: richer PHPMailer failure details in the admin UI.

= 1.2.9 =
* Form Builder: Submit Button Text editable under Appearance → Colors → Submit Button (simple forms).
* SMTP OAuth: Authorize starts via REST with a fresh consent URL (fixes “The link you followed has expired”).
* SMTP OAuth: warn when redirect URI uses .local / private hosts; optional `nexulesuite_SMTP_OAUTH_REDIRECT_URI` override.

= 1.2.8 =
* Acc & Lang: dock layout controls (position, offset, size, icon size, gap, order, display conditions, live preview) stay available when Accessibility is off, for Live Chat / Language / Custom buttons.
* Live Chat: removed the legacy corner floating bubble — chat FAB lives only in the Acc & Lang dock and respects Display conditions.
* Live Chat: dock Icon size uses Acc & Lang `buttonIconSize` on the frontend (preview and site stay in sync).
* AI chat: custom FAQ answers and bot replies turn bare http(s) URLs into clickable links.
* AI → Live Chat: Chat header fields (title, status badge, greeting); Icon size removed from Button style (use Acc & Lang).

= 1.2.7 =
* AI → Live Chat: restored Chat header fields (title, status badge, greeting text).
* General settings API: chat header / styling keys support partial updates.

= 1.2.6 =
* Acc & Lang: single “Enable Live Chat” toggle (default off); chat can show in the Acc & Lang dock without enabling Accessibility.
* AI Live Chat page: removed Enable/Dock toggles; keeps button style and embed codes.
* Includes 1.2.5 live-chat master-switch wiring (default off) via Acc & Lang / Live Chat API.

= 1.2.5 =
* Live Chat: admin master switch “Enable Live Chat widget” (default off) so the floating chat is not shown until you turn it on.
* Live Chat: clearer dock-placement labels (placement only — does not enable the widget).
* Live Chat settings save/load the master switch with Acc & Lang / Live Chat API.

= 1.2.4 =
* Global fonts are now bundled with the plugin (23 families, SIL OFL 1.1, WOFF2 latin subset) and served from your own server — the feature works again with no third-party request.
* Accessibility reading mode gets its Lexend typeface back, also from the bundled file.
* Embedded-media import stops with a clear message on hosts that cannot write directly, instead of failing silently.
* Clearer error when a bundle contains a file type the site does not allow uploads for.

= 1.2.3 =
* Removed the admin unlock/password gate entirely; every feature is available with no restriction.
* Removed all Google Fonts requests from the admin and front end; the global font feature now uses locally available fonts only.
* Removed the per-form Custom CSS and Custom Header/Footer HTML fields; use the theme Customizer's Additional CSS and the block editor instead.
* readme.txt: full External services disclosure for every AI provider, Google Translate, and the Gmail/Outlook OAuth mailers.
* Bundle import now writes only to a plugin-owned uploads folder, rejects file types WordPress would not accept, and uses WP_Filesystem.
* Share links are now checked against their granted sections before activity rows are returned.
* Late-escaped all embedded shortcode markup with wp_kses() and sanitized preview input with wp_kses_post().
* Replaced every inline <style>/<script> tag with wp_add_inline_style() / wp_add_inline_script() or an enqueued stylesheet.

= 1.2.2 =
* Display conditions: Default tab applies the same rules to all four dock buttons at once.
* Sanitize REQUEST_URI / HTTP_HOST in custom-link condition matching (Plugin Check).

= 1.2.1 =
* Accessibility dock: per-button display conditions (including custom link) and per-button Button offset.
* Button offset Default tab applies the same X/Y to every dock button; individual tabs for one-off positions.
* Dock size/icon/gap live preview (0–100); admin layout polish for offset and position controls.

= 1.2.0 =
* Accessibility dock: live chat + custom button in the same stack; custom icon picker; desktop hover labels.
* Live chat dock image (round avatar on FAB + chat panel), working icon size control, online blink on rim.
* Dock button order: move Accessibility / Language / Live chat / Custom up or down in admin.

= 1.1.9 =
* Forms: Templates & Submissions submenus; modern submissions report (filters menubar, CSV export, bulk delete).
* Forms: export/import form configuration; dual success-message presets; success card without Success title.
* Admin: sidebar reorder (Analytics, Chat & AI, Forms…); Acc & Lang label; nested Forms submenu styling.

= 1.1.8 =
* Chat AI composer: generous bottom padding so the pill input (including border) sits clearly inset above panel/host overflow:hidden + border-radius; stronger embed/inline host margin-bottom; embed iframe nudges parent host spacing when same-origin.

= 1.1.7 =
* Chat AI composer: pin action bar + form as flex siblings under a single scrolling messages region so overflow:hidden no longer clips the input (embed/inline/floating); strengthen iframe height chain.

= 1.1.6 =
* Chat AI composer: fix footer/input bar clipped by overflow:hidden — messages area scrolls; composer stays fully visible (embed, shortcode/inline, and floating).

= 1.1.5 =
* Chat HTML embed / shortcode: add 24px bottom spacing under the embed and inline panel hosts so content below has breathing room (floating bubble unchanged).

= 1.1.4 =
* Settings → AI Chatbot: Model & Knowledge, FAQ & Buttons, and Auto-Setup saves now persist correctly (FAQ/actions no longer wiped by a later Model save; sparse AI payloads keep prior keys).
* Access gate: unlock works on all `nexus-lead-suite-*` admin pages (Settings, Chat & AI, etc.), not only the Dashboard.
* Chat shortcode / inline embed: liquid container-responsive sizing and typography (`container-type` + `cqw` / `clamp()`), so the widget and text scale with the parent column.

= 1.1.3 =
* Chat shortcode / embed: liquid responsive foundation for inline chat panels.

= 1.0.14 =
* Form builder: remove individual options from select/radio fields in the visual editor.
* Settings: configurable report logo max size for PDF exports with live preview.
* Admin: plugin version shown on the Settings page.

= 1.0.13 =
* Activities: improved tracking with conditional popup filtering so unrelated popup events are not logged.
* Notifications: email alerts when tracked elements receive clicks (Activity Notifier).
* Labels: clearer Action Name and Interaction labels in the admin timeline.
* Visual Editor: click tracking reliability fixes on the front end.
* Access gate: PHPCS compliance and password-toggle script hardening.

= 1.0.12 =
* Security: all dynamic output is escaped via wp_kses() with a form-aware allowlist, so forms, popups, SVG icons and data-* attributes keep working while scripts are stripped; removed an unused wp-admin core-file include.
* i18n: restored the text domain to the plugin slug (nexus-lead-suite) as required by WordPress.
* Internal: unified all plugin-owned identifiers (functions, hooks, options, REST namespace, CSS classes/variables, JS objects, data attributes) under a single prefix; admin app updated to match.
* Plugin Check / WordPress.org: resolved TextDomainMismatch and EscapeOutput.OutputNotEscaped findings.

= 1.0.10 =
* Popups: Pop-Up Simulator preview (React portal, live heading/body sync, desktop/tablet/mobile frame).
* Settings: full site backup export via REST (`/settings/full-export`) — menu items, popups, emails, forms, settings, activities, and optional embedded media.
* Settings: full restore import via REST (`/settings/full-import`) with loading overlay and success confirmation card.
* Settings: fix import loader crash (`Cannot read properties of null (reading 'key')`).
* Data bundle: export manifest (`bundle_manifest`) summarizing included sections and counts.

= 1.0.9 =
* Visual Editor: fix save reliability (hover outline / snapshotOuterHtml).
* Visual Editor: save success card modal after successful publish.
* Live chat: frontend output fix (wp_footer priority 15).
* Settings: global font applied across admin and public surfaces (`core/class-global-font.php`).
* Global font: popup heading/button, Visual Editor panel, and success card styling gaps fixed.

= 1.0.8 =
* Email Automation Builder: fix save crash (use latest templates ref instead of stale state; avoids "Cannot read properties of undefined (reading 'map')").

= 1.0.7 =
* Menu Items: Popup event id (manual click) dropdown selection now saves (eventName + popup:url sync, save ref fix).

= 1.0.6 =
* Menu Items: empty Display Conditions now show on all pages.
* Popups: fix Popup Body shortcode save (`sanitize_popup_body_for_storage`).
* Emails: default Activity notification HTML template for new templates.
* Form Builder: fix 1-4 column layout buttons in Insert Form Fields.

= 1.0.5 =
* Popups: fix Advanced Automation Logic settings not saving.
* Email Automation: fix Automation Builder settings save behavior.

= 1.0.4 =
* Popups & Email Automation: fix admin screens freezing after navigation (SPA route guards and modal overlay cleanup).
* Popups Main Heading Editor: reliable TinyMCE loading via wp-tinymce dependency; purge stray #mce-modal-blocker overlays.
* Settings toggles: glider animation and layout fixes in compiled admin assets.
* Activities store and public tracker/popup scripts: stability improvements aligned with admin fixes.

= 1.0.3 =
* WordPress.org Plugin Review: load scripts/styles via wp_enqueue (popup, livechat, client gateway, access gate).
* Security: access gate nonce verification, webhook payload sanitization, PDF writes under uploads plugin subfolder.
* Prefix cleanup: unified nexulesuite_* option keys with legacy migration; nexulesuite_form shortcode (nexulesuite_form alias retained).
* readme.txt: External services disclosure for Google reCAPTCHA and Cloudflare Turnstile.
* Plugin Check: removed disallowed hidden/compressed/markdown artifacts from distribution; Vite manifest at assets/admin/vite-manifest.json.

= 1.0.2 =
* Events: Email Template dropdown uses full available width in the admin UI (CSS fix).
* Activities: Visual Editor toggle restored so you can enable/disable front-end visual editing from the Activities screen.
* Admin sidebar: version label now reads dynamically as "Ver X.X.X Nexus" from the plugin version constant (`nexulesuite_VERSION`).
* Includes compiled admin bundle updates for the above UI fixes.

= 1.0.1 =
* Admin UI redesign across dashboard, settings, popups, emails, and sidebar navigation.
* Save confirmation and settings polish; delete actions persist correctly for popups and emails.
* Activities PDF export restored; assorted admin UX fixes.

= 1.0.0 =
* First stable release.
* Activities: visible click labels on phone/email/footer/link rows; auto-popup source context (timer, scroll, exit intent); reliable mail status in admin grid.
* Button Classes: single-class notify-only lines; `popup:` / `mail:` / `notify:` prefixes; Visual Editor parser aligned with backend.
* Tracker & popup bridge: notify dedupe, click-label capture, real-link navigation preserved after notify.

= 0.1.5 =
* WordPress Plugin Check compliance: security hardening, WPCS fixes, and Plugin Directory requirements.
* Sanitized form inputs, escaped outputs, REST file uploads via get_file_params(), WP_Filesystem for writable checks.
* Updated Tested up to: 7.0; Author URI set to GitHub profile; added .distignore for release packaging.

= 0.1.1 =
* Optional full data removal on uninstall (opt-in via option or wp-config constant).
* Performance: REST API PHP loads only when the REST API runs; shortcodes module skips typical wp-admin requests.

= 0.1.0 =
* Initial scaffold: custom database tables, REST bootstrap, admin build tooling.

= 1.0.10 =
Pop-Up Simulator preview, full REST export/import with import UX fixes, and bundle export manifest.

= 1.0.9 =
Visual Editor save fixes, success card modal, live chat footer priority, and global font coverage improvements.

= 1.0.8 =
Email Automation Builder save fix (map error on save).

= 1.0.7 =
Menu Items: manual click popup event dropdown now saves correctly.

= 1.0.6 =
Menu Items display conditions, Popup Body save, default email template, and Form Builder column layout fixes.

= 1.0.5 =
Fixes Popups Advanced Automation Logic and Email Automation Builder settings save issues.

= 1.0.4 =
Fixes Popups and Email Automation screen freezes, TinyMCE heading editor issues, and settings toggle glider behavior.

= 1.0.3 =
WordPress.org review compliance, security hardening, and Plugin Check packaging fixes.

= 1.0.2 =
Fixes Events email template dropdown layout, restores the Activities Visual Editor toggle, and shows an accurate dynamic version label in the admin sidebar.

= 1.0.1 =
Admin UI refresh, save/delete reliability improvements, and Activities PDF export fix.

= 1.0.0 =
First stable release of Nexus Lead Suite.

= 0.1.5 =
Security and coding standards update for WordPress.org Plugin Check compliance. No intentional changes to core functionality.

= 0.1.1 =
Adds documented uninstall data removal and loading optimizations.

= 0.1.0 =
Initial release scaffold.
