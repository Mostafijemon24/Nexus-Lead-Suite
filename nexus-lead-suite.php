<?php
/**
 * Plugin Name:       Nexus Lead Suite
 * Plugin URI:        https://wordpress.org/plugins/nexus-lead-suite/
 * Description:       A high-performance, all-in-one lead generation and user analytics suite with a modern admin experience.
 * Version:           0.1.1
 * Requires at least: 6.2
 * Requires PHP:      7.4
 * Author:            Nexus Lead Suite Contributors
 * Author URI:        https://wordpress.org/plugins/nexus-lead-suite/
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       nexus-lead-suite
 * Domain Path:       /languages
 *
 * @package Nexus_Lead_Suite
 */

declare(strict_types=1);

namespace Nexus_Lead_Suite;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Hard requirement: PHP 7.4+ (avoid fatals on older hosts).
if ( defined( 'PHP_VERSION_ID' ) && PHP_VERSION_ID < 70400 ) {
	if ( is_admin() ) {
		add_action(
			'admin_notices',
			static function (): void {
				echo '<div class="notice notice-error"><p>' .
					esc_html__( 'Nexus Lead Suite requires PHP 7.4 or newer. Please upgrade PHP, then activate the plugin again.', 'nexus-lead-suite' ) .
				'</p></div>';
			}
		);
	}

	// If this is an activation attempt, rollback activation and show a clear error.
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended
	if ( is_admin() && isset( $_GET['activate'] ) ) {
		deactivate_plugins( plugin_basename( __FILE__ ) );
		wp_die(
			esc_html__( 'Plugin activation failed: Nexus Lead Suite requires PHP 7.4 or newer.', 'nexus-lead-suite' ),
			esc_html__( 'Activation error', 'nexus-lead-suite' ),
			array( 'back_link' => true )
		);
	}

	return;
}

define( 'NEXUS_LS_VERSION', '0.1.1' );
define( 'NEXUS_LS_PLUGIN_FILE', __FILE__ );
define( 'NEXUS_LS_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'NEXUS_LS_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'NEXUS_LS_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );

// Minimal polyfills in entry file (in case host/plugin uploader skips new files).
if ( ! function_exists( 'str_starts_with' ) ) {
	function str_starts_with( string $haystack, string $needle ): bool {
		if ( '' === $needle ) {
			return true;
		}
		return 0 === strncmp( $haystack, $needle, strlen( $needle ) );
	}
}
if ( ! function_exists( 'str_contains' ) ) {
	function str_contains( string $haystack, string $needle ): bool {
		if ( '' === $needle ) {
			return true;
		}
		return strpos( $haystack, $needle ) !== false;
	}
}
if ( ! function_exists( 'str_ends_with' ) ) {
	function str_ends_with( string $haystack, string $needle ): bool {
		if ( '' === $needle ) {
			return true;
		}
		$len = strlen( $needle );
		return $len === 0 ? true : substr( $haystack, -$len ) === $needle;
	}
}

try {
	$polyfills = NEXUS_LS_PLUGIN_DIR . 'core/polyfills.php';
	if ( file_exists( $polyfills ) ) {
		require_once $polyfills;
	}

	$required = array(
		NEXUS_LS_PLUGIN_DIR . 'core/class-activator.php',
		NEXUS_LS_PLUGIN_DIR . 'core/class-forms-payload-codec.php',
		NEXUS_LS_PLUGIN_DIR . 'core/class-form-submissions-store.php',
		NEXUS_LS_PLUGIN_DIR . 'core/class-activities-store.php',
		NEXUS_LS_PLUGIN_DIR . 'core/class-data-bundle.php',
		NEXUS_LS_PLUGIN_DIR . 'core/class-deactivator.php',
		NEXUS_LS_PLUGIN_DIR . 'core/popup-shortcode-expand.php',
		NEXUS_LS_PLUGIN_DIR . 'core/class-plugin.php',
	);

	$missing = array();
	foreach ( $required as $path ) {
		if ( ! file_exists( $path ) ) {
			$missing[] = $path;
		}
	}

	if ( ! empty( $missing ) ) {
		if ( is_admin() ) {
			add_action(
				'admin_notices',
				static function () use ( $missing ): void {
					echo '<div class="notice notice-error"><p><strong>' .
						esc_html__( 'Nexus Lead Suite installation is incomplete.', 'nexus-lead-suite' ) .
						'</strong></p><p>' .
						esc_html__( 'Some required plugin files are missing. Re-upload the full plugin folder (do not upload only a single PHP file). Missing:', 'nexus-lead-suite' ) .
						'</p><ul style="margin-left:16px;list-style:disc;">';
					foreach ( $missing as $p ) {
						echo '<li><code>' . esc_html( (string) $p ) . '</code></li>';
					}
					echo '</ul></div>';
				}
			);
		}

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		if ( is_admin() && isset( $_GET['activate'] ) ) {
			if ( function_exists( 'deactivate_plugins' ) ) {
				deactivate_plugins( plugin_basename( __FILE__ ) );
			}
			wp_die(
				esc_html__( 'Plugin activation failed because the installation is incomplete. Missing files:', 'nexus-lead-suite' ) .
					'<br /><br /><code>' . esc_html( implode( "\n", $missing ) ) . '</code>',
				esc_html__( 'Activation error', 'nexus-lead-suite' ),
				array( 'back_link' => true )
			);
		}
		return;
	}

	require_once NEXUS_LS_PLUGIN_DIR . 'core/class-activator.php';
	require_once NEXUS_LS_PLUGIN_DIR . 'core/class-forms-payload-codec.php';
	require_once NEXUS_LS_PLUGIN_DIR . 'core/class-form-submissions-store.php';
	require_once NEXUS_LS_PLUGIN_DIR . 'core/class-activities-store.php';
	require_once NEXUS_LS_PLUGIN_DIR . 'core/class-data-bundle.php';
	require_once NEXUS_LS_PLUGIN_DIR . 'core/class-deactivator.php';
	require_once NEXUS_LS_PLUGIN_DIR . 'core/popup-shortcode-expand.php';
	require_once NEXUS_LS_PLUGIN_DIR . 'core/class-plugin.php';
} catch ( \Throwable $e ) {
	if ( is_admin() ) {
		add_action(
			'admin_notices',
			static function () use ( $e ): void {
				echo '<div class="notice notice-error"><p><strong>' .
					esc_html__( 'Nexus Lead Suite could not load due to a fatal error.', 'nexus-lead-suite' ) .
					'</strong></p><p><code>' .
					esc_html( $e->getMessage() ) .
					'</code></p><p><code>' .
					esc_html( $e->getFile() . ':' . $e->getLine() ) .
					'</code></p></div>';
			}
		);
	}

	// phpcs:ignore WordPress.Security.NonceVerification.Recommended
	if ( is_admin() && isset( $_GET['activate'] ) ) {
		if ( function_exists( 'deactivate_plugins' ) ) {
			deactivate_plugins( plugin_basename( __FILE__ ) );
		}
		if ( function_exists( 'error_log' ) ) {
			error_log( '[Nexus Lead Suite] Activation load error: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine() );
		}
		wp_die(
			esc_html__( 'Plugin activation failed due to a fatal error:', 'nexus-lead-suite' ) .
				'<br /><br /><code>' . esc_html( $e->getMessage() ) . '</code>' .
				'<br /><code>' . esc_html( $e->getFile() . ':' . $e->getLine() ) . '</code>',
			esc_html__( 'Activation error', 'nexus-lead-suite' ),
			array( 'back_link' => true )
		);
	}
	return;
}

/**
 * Registers activation hook.
 */
register_activation_hook( __FILE__, array( Activator::class, 'activate' ) );

/**
 * Registers deactivation hook.
 */
register_deactivation_hook( __FILE__, array( Deactivator::class, 'deactivate' ) );

/**
 * Begins plugin execution.
 *
 * @return void
 */
function nexus_ls_run(): void {
	$plugin = new Plugin();
	$plugin->run();
}

try {
	nexus_ls_run();
} catch ( \Throwable $e ) {
	if ( is_admin() ) {
		add_action(
			'admin_notices',
			static function () use ( $e ): void {
				echo '<div class="notice notice-error"><p><strong>' .
					esc_html__( 'Nexus Lead Suite encountered a fatal error during boot.', 'nexus-lead-suite' ) .
					'</strong></p><p><code>' .
					esc_html( $e->getMessage() ) .
					'</code></p></div>';
			}
		);
	}

	// phpcs:ignore WordPress.Security.NonceVerification.Recommended
	if ( is_admin() && isset( $_GET['activate'] ) ) {
		if ( function_exists( 'deactivate_plugins' ) ) {
			deactivate_plugins( plugin_basename( __FILE__ ) );
		}
		if ( function_exists( 'error_log' ) ) {
			error_log( '[Nexus Lead Suite] Activation boot error: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine() );
		}
		wp_die(
			esc_html__( 'Plugin activation failed due to a fatal error:', 'nexus-lead-suite' ) .
				'<br /><br /><code>' . esc_html( $e->getMessage() ) . '</code>' .
				'<br /><code>' . esc_html( $e->getFile() . ':' . $e->getLine() ) . '</code>',
			esc_html__( 'Activation error', 'nexus-lead-suite' ),
			array( 'back_link' => true )
		);
	}
}
