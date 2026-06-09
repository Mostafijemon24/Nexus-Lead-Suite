# Nexus Lead Suite v1.0.0

First stable release (updated package — same version tag).

## Highlights

- Version bumped to **1.0.0** across plugin header, readme, and admin bundle metadata.
- Admin sidebar flush with WordPress menu (no content gap).
- Sidebar uses transparent / WP admin color scheme sync (`--wp-admin-theme-color`).
- Plugin list links: Settings, Documentation, Support.
- Menu Items drag-and-drop reorder in admin.
- Bottom nav responsive layout and settings wiring improvements.
- Backup tab copy shortened; full export/import bundle support.

## v1.0.0 package update (June 2026)

This release replaces the previous `nexus-lead-suite-1.0.0.zip` asset with an updated build.

> **Tag:** Published at GitHub tag `1.0.0` because the prior immutable `v1.0.0` tag cannot be reused after deletion ([GitHub immutable releases](https://docs.github.com/en/code-security/concepts/supply-chain-security/immutable-releases)).

### Activities & tracking

- **Click labels:** Phone, email, footer, and button/link activities now record the **visible control text** the visitor tapped (not generic tag names like `A` or `BUTTON`).
- **Popup context:** Manual popup opens show the clicked label; auto-opens (timer, scroll, exit intent) show a clear source line in Activities.
- **Mail status:** Form, notify-trigger, and tap rows expose reliable `mailSent` / `mail_status` values in the admin grid (Sent, Send failed, No email, Unknown).
- **Notify dedupe:** Email-notify taps no longer create duplicate `click_phone` / `click_mailto` rows.

### Button Classes & Visual Editor

- **Flexible class syntax:** `eventId | class` = notify only; two or more classes = first opens popup, rest notify.
- **Explicit prefixes:** `popup:classname`, `mail:classname`, or `notify:classname` for fine-grained mapping.
- Visual Editor parser aligned with the PHP backend for the same rules.

### Popup bridge

- Notify triggers use the clicked element label when available.
- Real `tel:` / `mailto:` / `http(s)` links still navigate after notify fires.
- Auto popup opens pass `open_source` and `auto_trigger` into the activity log.

## WordPress.org package

The attached `nexus-lead-suite-1.0.0.zip` is a production build (dev sources, node_modules, and VCS files excluded via `.distignore`).
