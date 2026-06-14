=== Nexus Lead Suite ===
Contributors: nexusleadcontributors
Tags: leads, analytics, forms, crm, marketing
Requires at least: 6.2
Tested up to: 7.0
Requires PHP: 7.4
Stable tag: 1.0.1
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

All-in-one lead generation and user analytics for WordPress, with a fast admin experience and a lightweight public footprint.

== Description ==

Nexus Lead Suite helps you capture Leads, record Interactions, manage Submissions, and review Analytics from one place.

* Modular architecture designed for performance and security.
* Admin tools built as a modern single-page experience.
* Public-facing scripts use vanilla JavaScript only (no front-end framework bloat).

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

== Changelog ==

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

== Upgrade Notice ==

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
