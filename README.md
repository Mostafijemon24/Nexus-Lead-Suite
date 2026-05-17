# Nexus Lead Suite

![Version](https://img.shields.io/badge/version-0.1.1-blue) ![WordPress](https://img.shields.io/badge/WordPress-6.2%2B-0073aa) ![Tested Up To](https://img.shields.io/badge/Tested%20Up%20To-6.8-46b450) ![PHP](https://img.shields.io/badge/PHP-7.4%2B-777bb4) ![License](https://img.shields.io/github/license/Mostafijemon24/Nexus-Lead-Suite)

> A high-performance, all-in-one lead generation and user analytics suite with a modern admin experience.

## Description

Nexus Lead Suite helps you capture leads, record interactions, manage submissions, and review analytics from one place—built for performance and a clean admin experience.

## Features

- Lead capture tools with structured submissions
- Interaction tracking and activity history
- Analytics views and summary insights
- Modular architecture designed for performance and security
- Modern single-page admin UI
- Lightweight public scripts (vanilla JS, no front-end bloat)

## Demo

Demo is not available yet.

## Screenshots

Screenshots are not included yet. Add images under `assets/screenshots/` and update this section with previews.

## Requirements

- WordPress 6.2+
- PHP 7.4+

## Installation

### Option A — WordPress Admin (Upload)

1. Download the ZIP for this repository.
2. In WordPress, go to **Plugins → Add New → Upload Plugin**.
3. Upload the ZIP, then click **Activate**.
4. Open the **Nexus Lead Suite** menu in the admin to configure settings.

### Option B — Manual (SFTP)

1. Upload the plugin folder to: `/wp-content/plugins/nexus-lead-suite`.
2. Activate the plugin from **Plugins** in WordPress.
3. Open the **Nexus Lead Suite** menu in the admin to configure settings.

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
