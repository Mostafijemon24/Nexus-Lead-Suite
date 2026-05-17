# Nexus Lead Suite

> A high-performance, all-in-one lead generation and user analytics suite with a modern admin experience.

## Description

Nexus Lead Suite helps you capture leads, record interactions, manage submissions, and review analytics from one place—built for performance and a clean admin experience.

**Key highlights**
- Modular architecture designed for performance and security
- Modern single-page admin UI
- Lightweight public scripts (vanilla JS, no front-end bloat)

## Requirements

- WordPress 6.2+
- PHP 7.4+

## Installation

1. Upload the plugin files to the `/wp-content/plugins/nexus-lead-suite` directory, or install the plugin through the WordPress plugins screen directly.
2. Activate the plugin through the **Plugins** screen in WordPress.
3. Use the **Nexus Lead Suite** menu in the admin area to configure the plugin.

## Admin App (Source & Build)

The WordPress admin single-page app is distributed as a production build:

- `assets/admin/js/main.js` — JavaScript bundle (minified; built with Vite + React)
- `assets/admin/css/main.css` — compiled styles (built with Vite)

Human-readable source (JSX components, styles, and build configuration) is available in this repository:

- `admin/src`

### Build Steps

1. `cd admin`
2. `npm ci`
3. `npm run build`

Output is written to:

- `assets/admin/js/main.js`
- `assets/admin/css/main.css`

### Dev Mode (Hot Reload)

Run `npm run dev` and add this to `wp-config.php`:

```php
define( 'NEXUS_LS_VITE_DEV', true );
```

## Data Removal (Optional)

By default, uninstalling leaves database tables and options intact.

To fully remove data on uninstall:

1. While the plugin is still active, run:  
   `wp option update nexus_ls_erase_on_uninstall 1`  
   **or**
2. Add to `wp-config.php` before deleting the plugin:  
   `define( 'NEXUS_LS_UNINSTALL_DELETE_DATA', true );`

On multisite, if any site has the option set to `1`, all sites in the network are cleaned when removed network-wide.

## Changelog

See `readme.txt` for the full changelog and upgrade notes.

## Support

If you find issues, please open a GitHub issue with steps to reproduce.
