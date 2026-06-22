<?php
/**
 * Uninstall handler.
 *
 * By default no data is removed (safe accidental delete). To erase plugin tables,
 * options, and related transients when the plugin is deleted:
 *
 * - Set option `nexulesuite_erase_on_uninstall` to `1` while the plugin is active, or
 * - Define `nexulesuite_UNINSTALL_DELETE_DATA` as true in wp-config.php before uninstalling.
 *
 * @package nexulesuite_
 */

// Exit if uninstall not called from WordPress.
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

/**
 * Option keys stored by Nexus Lead Suite (wp_options / per-site).
 *
 * @return array<int, string>
 */
function nexulesuite_uninstall_option_keys(): array {
	return array(
		'nexulesuite_db_version',
		'nexulesuite_ca_rw_ok',
		'nexulesuite_migrate_nav_client_off_v3',
		'nexulesuite_migrate_auto_popup_off_v1',
		'nexulesuite_migrate_livechat_off_v1',
		'nexulesuite_general_settings_v1',
		'step_forms_builder_v0',
		'step_recaptcha_keys_v0',
		'step_turnstile_keys_v0',
		'nexulesuite_forms_builder_v0',
		'nexulesuite_recaptcha_keys_v0',
		'nexulesuite_turnstile_keys_v0',
		'nexulesuite_menu_items_v1',
		'nexulesuite_popups_v1',
		'nexulesuite_email_templates_v1',
		'nexulesuite_email_templates',
		'nexulesuite_smtp_settings',
		'nexulesuite_erase_on_uninstall',
	);
}

/**
 * Whether this uninstall should delete all plugin data.
 *
 * For multisite, if any site has opted in, all sites are cleaned (tables use DROP IF EXISTS).
 *
 * @return bool
 */
function nexulesuite_uninstall_should_erase_data(): bool {
	if ( defined( 'nexulesuite_UNINSTALL_DELETE_DATA' ) && nexulesuite_UNINSTALL_DELETE_DATA ) {
		return true;
	}

	if ( ! is_multisite() ) {
		return get_option( 'nexulesuite_erase_on_uninstall' ) === '1';
	}

	$site_ids = get_sites(
		array(
			'fields' => 'ids',
			'number' => 0,
		)
	);

	if ( ! is_array( $site_ids ) ) {
		return false;
	}

	foreach ( $site_ids as $site_id ) {
		switch_to_blog( (int) $site_id );
		$erase = get_option( 'nexulesuite_erase_on_uninstall' ) === '1';
		restore_current_blog();
		if ( $erase ) {
			return true;
		}
	}

	return false;
}

/**
 * Drops custom tables, options, and transients for the current blog.
 *
 * @global \wpdb $wpdb WordPress database abstraction object.
 * @return void
 */
function nexulesuite_uninstall_delete_site_data(): void {
	global $wpdb;

	$interactions = $wpdb->prefix . 'nexulesuite_interactions';
	$submissions  = $wpdb->prefix . 'nexulesuite_submissions';

	// Table identifiers are built from $wpdb->prefix only.
	// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching,WordPress.DB.DirectDatabaseQuery.SchemaChange,WordPress.DB.PreparedSQL.InterpolatedNotPrepared,PluginCheck.Security.DirectDB.UnescapedDBParameter -- intentional uninstall cleanup.
	$wpdb->query( "DROP TABLE IF EXISTS `{$interactions}`" );
	// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching,WordPress.DB.DirectDatabaseQuery.SchemaChange,WordPress.DB.PreparedSQL.InterpolatedNotPrepared,PluginCheck.Security.DirectDB.UnescapedDBParameter -- intentional uninstall cleanup.
	$wpdb->query( "DROP TABLE IF EXISTS `{$submissions}`" );

	foreach ( nexulesuite_uninstall_option_keys() as $key ) {
		delete_option( $key );
	}

	$like_transient        = $wpdb->esc_like( '_transient_nexulesuite_' ) . '%';
	$like_timeout          = $wpdb->esc_like( '_transient_timeout_nexulesuite_' ) . '%';
	$like_site_transient   = $wpdb->esc_like( '_site_transient_nexulesuite_' ) . '%';
	$like_site_timeout     = $wpdb->esc_like( '_site_transient_timeout_nexulesuite_' ) . '%';

	// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- intentional uninstall cleanup.
	$wpdb->query(
		$wpdb->prepare(
			"DELETE FROM {$wpdb->options} WHERE option_name LIKE %s OR option_name LIKE %s OR option_name LIKE %s OR option_name LIKE %s",
			$like_transient,
			$like_timeout,
			$like_site_transient,
			$like_site_timeout
		)
	);
}

if ( ! nexulesuite_uninstall_should_erase_data() ) {
	return;
}

if ( ! is_multisite() ) {
	nexulesuite_uninstall_delete_site_data();
	return;
}

$nexulesuite_site_ids = get_sites(
	array(
		'fields' => 'ids',
		'number' => 0,
	)
);

if ( is_array( $nexulesuite_site_ids ) ) {
	foreach ( $nexulesuite_site_ids as $nexulesuite_site_id ) {
		switch_to_blog( (int) $nexulesuite_site_id );
		nexulesuite_uninstall_delete_site_data();
		restore_current_blog();
	}
}
