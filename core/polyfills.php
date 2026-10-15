<?php
/**
 * Polyfills for older PHP versions supported by the plugin.
 *
 * @package nexulesuite_
 */

declare(strict_types=1);

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/*
 * No polyfills are required.
 *
 * The plugin only uses str_starts_with(), str_contains() and str_ends_with(),
 * which WordPress core has provided in wp-includes/compat.php since WordPress
 * 5.9. This plugin requires WordPress 6.2+ (see the readme/header), so those
 * functions are always available before this plugin loads. Defining our own
 * copies here would be redundant and would declare non-prefixed functions in
 * the global namespace, so this file intentionally defines nothing.
 */

