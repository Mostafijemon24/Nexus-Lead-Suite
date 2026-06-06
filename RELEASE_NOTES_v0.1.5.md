## Overview

This update addresses all issues reported by the **WordPress Plugin Check** tool. Changes focus on security hardening, WordPress Coding Standards (WPCS) compliance, and Plugin Directory requirements. No core plugin functionality, user-facing features, or database behavior was intentionally changed.

## Security Improvements

### Input handling
- Sanitized honeypot and form POST data using WordPress sanitization functions (`sanitize_text_field`, `wp_unslash`)
- Sanitized `$_SERVER['REQUEST_METHOD']` in the access gate
- REST API file uploads now use `$request->get_file_params()` instead of direct `$_FILES` access, with `is_uploaded_file()` validation retained

### Output escaping
- Escaped popup CSS numeric values with `absint()`
- Escaped form field inline styles and floating-label HTML attributes with `esc_attr()`
- Refactored form input rendering to use proper escaping helpers

### Nonce & authentication
- Documented nonce verification for POST data processed inside already-verified AJAX handlers
- REST endpoints continue to use `permission_callback` (`manage_options`) for authenticated admin operations

### Filesystem
- Replaced direct `is_writable()` with `WP_Filesystem()->is_writable()` for PDF upload directory checks

## WordPress Coding Standards & Plugin Check Fixes

### Script & style enqueuing
- Added version parameters (`NEXUS_LS_VERSION`) to enqueued scripts where missing
- reCAPTCHA and Cloudflare Turnstile scripts registered locally and resolved via the `script_loader_src` filter (required third-party CAPTCHA providers)
- Vite dev admin scripts use enqueued tags modified via `str_replace()` instead of raw `<script>` output

### Database queries
- All custom table queries use `$wpdb->prepare()` with documented exceptions for trusted table names from `$wpdb->prefix`
- Inline prepared queries replace intermediate SQL variables where flagged by Plugin Check

### Naming conventions
- Prefixed plugin global variables in bootstrap, uninstall, and client access template files with `nexus_ls_`

### Other standards
- `error_log()` calls restricted to when `WP_DEBUG` is enabled
- `load_plugin_textdomain()` retained with documented justification for non–WordPress.org installs
- Core WordPress hooks (`the_content`, `wp_enqueue_scripts`) used in popup preview with documented justification

## Plugin Directory Compliance

| Item | Change |
|------|--------|
| `readme.txt` | Updated **Tested up to: 7.0** |
| Hidden dev files | Removed `.cursorrules` and `cursorrules.md` from the plugin package |
| Release packaging | Added `.distignore` to exclude development-only files from distribution builds |
| Plugin headers | **Author URI** set to https://github.com/Mostafijemon24 (distinct from Plugin URI) |

## Files Modified

- `public/class-shortcodes.php`
- `api/class-rest-api.php`
- `admin/class-admin-app.php`
- `core/class-activities-store.php`
- `core/class-form-submissions-store.php`
- `core/class-data-bundle.php`
- `core/class-access-gate.php`
- `core/class-plugin.php`
- `core/popup-shortcode-expand.php`
- `public/partials/client-access-gateway.php`
- `nexus-lead-suite.php`
- `uninstall.php`
- `readme.txt`
- `.distignore` (new)

## Functional Impact

- Form submissions, email notifications, activity logging, popups, live chat, and client access reports work as before
- reCAPTCHA and Turnstile continue to load from their official provider CDNs
- Admin avatar/logo uploads behave the same; only the REST request file access method was updated
- Custom database tables, retention policies, and uninstall cleanup logic are unchanged

## Testing Checklist

- [ ] Submit a frontend form (with and without CAPTCHA enabled)
- [ ] Open and close popups with embedded forms
- [ ] Upload a live chat avatar and report logo in admin settings
- [ ] Export/import plugin data bundle
- [ ] Confirm admin SPA loads in production and Vite dev mode
- [ ] Run WordPress Plugin Check — expected clean pass
