<?php
/**
 * Fired during plugin activation.
 *
 * @package nexulesuite_
 */

declare(strict_types=1);

namespace nexulesuite_;

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
	public const SCHEMA_VERSION_OPTION = 'nexulesuite_db_version';

	/**
	 * Current database schema version (increment when tables change).
	 */
	public const SCHEMA_VERSION = '1.3.0';

	/**
	 * Runs on plugin activation.
	 *
	 * @return void
	 */
	public static function activate(): void {
		self::install_tables();
		update_option( self::SCHEMA_VERSION_OPTION, self::SCHEMA_VERSION, false );

		if ( ! wp_next_scheduled( 'nexulesuite_purge_form_submissions' ) ) {
			wp_schedule_event( time() + HOUR_IN_SECONDS, 'daily', 'nexulesuite_purge_form_submissions' );
		}
		if ( ! wp_next_scheduled( 'nexulesuite_purge_report_pdfs' ) ) {
			wp_schedule_event( time() + HOUR_IN_SECONDS, 'daily', 'nexulesuite_purge_report_pdfs' );
		}

		require_once nexulesuite_PLUGIN_DIR . 'public/class-client-access.php';
		\nexulesuite_\Public\Client_Access::activation_flush_rewrite_rules();
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

		$interactions = "{$prefix}nexulesuite_interactions";
		$submissions  = "{$prefix}nexulesuite_submissions";
		$chat_logs    = "{$prefix}nexulesuite_chat_logs";
		$ai_vectors   = "{$prefix}nexulesuite_ai_vectors";

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

		$sql_chat_logs = "CREATE TABLE {$chat_logs} (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			session_id varchar(64) NOT NULL DEFAULT '',
			question text NULL,
			answer longtext NULL,
			sources longtext NULL,
			has_image tinyint(1) NOT NULL DEFAULT 0,
			intent varchar(32) NOT NULL DEFAULT '',
			sentiment varchar(16) NOT NULL DEFAULT '',
			page_url text NULL,
			ip_hash char(64) NOT NULL DEFAULT '',
			ua_hash char(64) NOT NULL DEFAULT '',
			created_at datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
			PRIMARY KEY  (id),
			KEY session_id (session_id),
			KEY created_at (created_at)
		) {$charset_collate};";

		// Chatbot knowledge base when the assistant talks to a model API directly:
		// one row per content chunk, `embedding` is L2-normalized float32 (little endian).
		$sql_ai_vectors = "CREATE TABLE {$ai_vectors} (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			doc_id varchar(191) NOT NULL DEFAULT '',
			chunk_index smallint(5) unsigned NOT NULL DEFAULT 0,
			source_type varchar(32) NOT NULL DEFAULT '',
			source_ref varchar(191) NOT NULL DEFAULT '',
			title text NULL,
			url text NULL,
			content longtext NULL,
			embedding longblob NULL,
			dims smallint(5) unsigned NOT NULL DEFAULT 0,
			created_at datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
			PRIMARY KEY  (id),
			KEY doc_id (doc_id),
			KEY dims (dims)
		) {$charset_collate};";

		dbDelta( $sql_interactions );
		dbDelta( $sql_submissions );
		dbDelta( $sql_chat_logs );
		dbDelta( $sql_ai_vectors );
	}

	/**
	 * Runs {@see install_tables()} when the stored schema version is behind the
	 * current one, so existing installs pick up new tables without re-activating.
	 *
	 * @return void
	 */
	public static function maybe_upgrade(): void {
		$stored = (string) get_option( self::SCHEMA_VERSION_OPTION, '' );
		if ( $stored === self::SCHEMA_VERSION ) {
			return;
		}

		self::install_tables();
		update_option( self::SCHEMA_VERSION_OPTION, self::SCHEMA_VERSION, false );
	}
}
