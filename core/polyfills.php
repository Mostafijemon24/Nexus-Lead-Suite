<?php
/**
 * Polyfills for older PHP versions supported by the plugin.
 *
 * @package Nexus_Lead_Suite
 */

declare(strict_types=1);

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'str_starts_with' ) ) {
	/**
	 * PHP 8 polyfill: checks whether a string starts with a given substring.
	 *
	 * @param string $haystack Full string.
	 * @param string $needle Prefix to check.
	 * @return bool
	 */
	function str_starts_with( string $haystack, string $needle ): bool {
		if ( '' === $needle ) {
			return true;
		}
		return 0 === strncmp( $haystack, $needle, strlen( $needle ) );
	}
}

if ( ! function_exists( 'str_contains' ) ) {
	/**
	 * PHP 8 polyfill: checks whether a string contains a given substring.
	 *
	 * @param string $haystack Full string.
	 * @param string $needle Substring to check.
	 * @return bool
	 */
	function str_contains( string $haystack, string $needle ): bool {
		if ( '' === $needle ) {
			return true;
		}
		return strpos( $haystack, $needle ) !== false;
	}
}

if ( ! function_exists( 'str_ends_with' ) ) {
	/**
	 * PHP 8 polyfill: checks whether a string ends with a given substring.
	 *
	 * @param string $haystack Full string.
	 * @param string $needle Suffix to check.
	 * @return bool
	 */
	function str_ends_with( string $haystack, string $needle ): bool {
		if ( '' === $needle ) {
			return true;
		}
		$len = strlen( $needle );
		if ( $len === 0 ) {
			return true;
		}
		return substr( $haystack, -$len ) === $needle;
	}
}

