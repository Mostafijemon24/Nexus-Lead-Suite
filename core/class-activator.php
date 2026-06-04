<?php
/**
 * Fired during plugin activation.
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
 * Handles schema creation and versioned options on activation.
 */
final class Activator {

	/**
	 * Option key storing the database schema version.
	 */
	public const SCHEMA_VERSION_OPTION = 'nexus_ls_db_version';

	/**
	 * Current database schema version (increment when tables change).
	 */
	public const SCHEMA_VERSION = '1.0.0';

	/**
	 * Runs on plugin activation.
	 *
	 * @return void
	 */
	public static function activate(): void {
		self::install_tables();
		update_option( self::SCHEMA_VERSION_OPTION, self::SCHEMA_VERSION, false );

		if ( ! wp_next_scheduled( 'nexus_ls_purge_form_submissions' ) ) {
			wp_schedule_event( time() + HOUR_IN_SECONDS, 'daily', 'nexus_ls_purge_form_submissions' );
		}

		require_once NEXUS_LS_PLUGIN_DIR . 'public/class-client-access.php';
		\Nexus_Lead_Suite\Public\Client_Access::activation_flush_rewrite_rules();
	}

	/**
	 * Creates or updates custom tables using dbDelta.
	 *
	 * @return void
	 */
	public static function install_tables(): void {
		global $wpdb;

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';

		$charset_collate = $wpdb->get_charset_collate();
		$prefix          = $wpdb->prefix;

		$interactions = "{$prefix}nexus_ls_interactions";
		$submissions  = "{$prefix}nexus_ls_submissions";

		$sql_interactions = "CREATE TABLE {$interactions} (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			session_key varchar(64) NOT NULL DEFAULT '',
			event_type varchar(64) NOT NULL DEFAULT '',
			target_key varchar(191) NOT NULL DEFAULT '',
			page_url text NULL,
			referrer_url text NULL,
			meta longtext NULL,
			ip_hash char(64) NOT NULL DEFAULT '',
			ua_hash char(64) NOT NULL DEFAULT '',
			created_at datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
			PRIMARY KEY  (id),
			KEY session_key (session_key),
			KEY event_type (event_type),
			KEY created_at (created_at)
		) {$charset_collate};";

		$sql_submissions = "CREATE TABLE {$submissions} (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			form_key varchar(64) NOT NULL DEFAULT '',
			status varchar(20) NOT NULL DEFAULT 'new',
			payload longtext NULL,
			ip_hash char(64) NOT NULL DEFAULT '',
			ua_hash char(64) NOT NULL DEFAULT '',
			created_at datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
			updated_at datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
			PRIMARY KEY  (id),
			KEY form_key (form_key),
			KEY status (status),
			KEY created_at (created_at)
		) {$charset_collate};";

		dbDelta( $sql_interactions );
		dbDelta( $sql_submissions );
	}
}
