=== Nexus Lead Suite ===
Contributors: nexusleadcontributors
Tags: leads, analytics, forms, crm, marketing
Requires at least: 6.2
Tested up to: 7.0
Requires PHP: 7.4
Stable tag: 1.0.7
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

This plugin can optionally connect to third-party anti-spam services when you enable them in the form builder or settings:

= Google reCAPTCHA =

When reCAPTCHA is enabled on a form, the visitor's browser loads Google's reCAPTCHA script and sends a response token to your WordPress site on form submit. Your server then sends that token (and your site/secret keys) to Google's verification API to confirm the submission is not automated spam.

* Service: Google reCAPTCHA (Google LLC)
* Data sent: reCAPTCHA response token, site key, secret key (server-side), and the visitor IP address as required by Google's API
* Terms of Service: https://policies.google.com/terms
* Privacy Policy: https://policies.google.com/privacy

= Cloudflare Turnstile =

When Turnstile is enabled on a form, the visitor's browser loads Cloudflare's Turnstile widget and sends a response token to your WordPress site on form submit. Your server then sends that token (and your site/secret keys) to Cloudflare's siteverify endpoint to validate the submission.

* Service: Cloudflare Turnstile (Cloudflare, Inc.)
* Data sent: Turnstile response token, site key, secret key (server-side), and the visitor IP address as required by Cloudflare's API
* Terms of Service: https://www.cloudflare.com/website-terms/
* Privacy Policy: https://www.cloudflare.com/privacypolicy/

No data is sent to these services unless you configure and enable them. Webhook URLs you add in settings are separate endpoints you control; the plugin POSTs sanitized form submission payloads only to URLs you provide.

== Source Code ==

The WordPress admin single-page app is distributed as a production build:

* `assets/admin/js/main.js` — JavaScript bundle (minified; built with Vite and React)
* `assets/admin/css/main.css` — compiled styles (built with Vite)

Human-readable source (JSX components, styles, and build configuration) is available in this public repository:

https://github.com/Mostafijemon24/Nexus-Lead-Suite/tree/main/admin/src

To rebuild the admin assets from source:

1. Clone the repository above.
2. `cd admin` then run `npm ci`
3. Build for production: `npm run build`
4. Output is written to `assets/admin/js/main.js` and `assets/admin/css/main.css` (see `admin/vite.config.js`).

For local development with hot reload, run `npm run dev` and add `define( 'NEXUS_LS_VITE_DEV', true );` to `wp-config.php` (see `admin/class-admin-app.php`).

== Installation ==

1. Upload the plugin files to the `/wp-content/plugins/nexus-lead-suite` directory, or install the plugin through the WordPress plugins screen directly.
2. Activate the plugin through the 'Plugins' screen in WordPress.
3. Use the Nexus Lead Suite menu in the admin area to configure the plugin.

== Frequently Asked Questions ==

= Does this plugin work with any theme? =

Yes. Public assets are loaded only where needed to reduce theme conflicts.

= How do I remove all plugin data when uninstalling? =

By default, uninstalling leaves the database tables and options in place so accidental deletes do not wipe leads.

To remove everything on uninstall:

1. While the plugin is still active, run: `wp option update nexus_ls_erase_on_uninstall 1` (or set the same option to `1` in the database), **or**
2. Add to `wp-config.php` before deleting the plugin: `define( 'NEXUS_LS_UNINSTALL_DELETE_DATA', true );`

Then delete the plugin from the Plugins screen. On multisite, if any site has the option set to `1`, all sites in the network are cleaned when the plugin is removed network-wide.

== Data removal ==

The optional uninstall cleanup removes custom tables (`wp_nexus_ls_interactions`, `wp_nexus_ls_submissions`), plugin options (forms, settings, SMTP, migrations, etc.), and transients whose names start with `nexus_ls_`. Uploaded media files are not deleted automatically.

== Screenshots ==

1. Dashboard (coming soon)

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
* Prefix cleanup: unified nexus_ls_* option keys with legacy migration; nexus_ls_form shortcode (smart_trigger_form alias retained).
* readme.txt: External services disclosure for Google reCAPTCHA and Cloudflare Turnstile.
* Plugin Check: removed disallowed hidden/compressed/markdown artifacts from distribution; Vite manifest at assets/admin/vite-manifest.json.

= 1.0.2 =
* Events: Email Template dropdown uses full available width in the admin UI (CSS fix).
* Activities: Visual Editor toggle restored so you can enable/disable front-end visual editing from the Activities screen.
* Admin sidebar: version label now reads dynamically as "Ver X.X.X Nexus" from the plugin version constant (`NEXUS_LS_VERSION`).
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
