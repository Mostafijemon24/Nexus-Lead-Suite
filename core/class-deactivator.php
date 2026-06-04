<?php
/**
 * Fired during plugin deactivation.
 *
 * @package Nexus_Lead_Suite
 */

declare(strict_types=1);

namespace Nexus_Lead_Suite;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Handles deactivation-time cleanup (no data removal by default).
 */
final class Deactivator {

	/**
	 * Runs on plugin deactivation.
	 *
	 * @return void
	 */
	public static function deactivate(): void {
		wp_clear_scheduled_hook( 'nexus_ls_purge_form_submissions' );
		flush_rewrite_rules();
	}
}
