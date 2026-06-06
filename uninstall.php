<?php
/**
 * Uninstall handler.
 *
 * By default no data is removed (safe accidental delete). To erase plugin tables,
 * options, and related transients when the plugin is deleted:
 *
 * - Set option `nexus_ls_erase_on_uninstall` to `1` while the plugin is active, or
 * - Define `NEXUS_LS_UNINSTALL_DELETE_DATA` as true in wp-config.php before uninstalling.
 *
 * @package Nexus_Lead_Suite
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
function nexus_ls_uninstall_option_keys(): array {
	return array(
		'nexus_ls_db_version',
		'nexus_ls_ca_rw_ok',
		'nexus_ls_migrate_nav_client_off_v3',
		'nexus_ls_migrate_auto_popup_off_v1',
		'nexus_ls_migrate_livechat_off_v1',
		'nexus_ls_general_settings_v1',
		'step_forms_builder_v0',
		'step_recaptcha_keys_v0',
		'step_turnstile_keys_v0',
		'nexus_ls_menu_items_v1',
		'nexus_ls_popups_v1',
		'nexus_ls_email_templates_v1',
		'nexus_ls_email_templates',
		'nexus_ls_smtp_settings',
		'nexus_ls_erase_on_uninstall',
	);
}

/**
 * Whether this uninstall should delete all plugin data.
 *
 * For multisite, if any site has opted in, all sites are cleaned (tables use DROP IF EXISTS).
 *
 * @return bool
 */
function nexus_ls_uninstall_should_erase_data(): bool {
	if ( defined( 'NEXUS_LS_UNINSTALL_DELETE_DATA' ) && NEXUS_LS_UNINSTALL_DELETE_DATA ) {
		return true;
	}

	if ( ! is_multisite() ) {
		return get_option( 'nexus_ls_erase_on_uninstall' ) === '1';
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
		$erase = get_option( 'nexus_ls_erase_on_uninstall' ) === '1';
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
function nexus_ls_uninstall_delete_site_data(): void {
	global $wpdb;

	$interactions = $wpdb->prefix . 'nexus_ls_interactions';
	$submissions  = $wpdb->prefix . 'nexus_ls_submissions';

	// Table identifiers are built from $wpdb->prefix only.
	// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching,WordPress.DB.DirectDatabaseQuery.SchemaChange,WordPress.DB.PreparedSQL.InterpolatedNotPrepared,PluginCheck.Security.DirectDB.UnescapedDBParameter -- intentional uninstall cleanup.
	$wpdb->query( "DROP TABLE IF EXISTS `{$interactions}`" );
	// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching,WordPress.DB.DirectDatabaseQuery.SchemaChange,WordPress.DB.PreparedSQL.InterpolatedNotPrepared,PluginCheck.Security.DirectDB.UnescapedDBParameter -- intentional uninstall cleanup.
	$wpdb->query( "DROP TABLE IF EXISTS `{$submissions}`" );

	foreach ( nexus_ls_uninstall_option_keys() as $key ) {
		delete_option( $key );
	}

	$like_transient        = $wpdb->esc_like( '_transient_nexus_ls_' ) . '%';
	$like_timeout          = $wpdb->esc_like( '_transient_timeout_nexus_ls_' ) . '%';
	$like_site_transient   = $wpdb->esc_like( '_site_transient_nexus_ls_' ) . '%';
	$like_site_timeout     = $wpdb->esc_like( '_site_transient_timeout_nexus_ls_' ) . '%';

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

if ( ! nexus_ls_uninstall_should_erase_data() ) {
	return;
}

if ( ! is_multisite() ) {
	nexus_ls_uninstall_delete_site_data();
	return;
}

$nexus_ls_site_ids = get_sites(
	array(
		'fields' => 'ids',
		'number' => 0,
	)
);

if ( is_array( $nexus_ls_site_ids ) ) {
	foreach ( $nexus_ls_site_ids as $nexus_ls_site_id ) {
		switch_to_blog( (int) $nexus_ls_site_id );
		nexus_ls_uninstall_delete_site_data();
		restore_current_blog();
	}
}
