<?php
/**
 * Plugins list screen: Settings, Documentation, Support links.
 *
 * @package nexulesuite_
 */

declare(strict_types=1);

namespace nexulesuite_\Admin;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Adds action / meta links on the WordPress Plugins screen.
 */
final class Plugin_List_Links {

	private const DOCS_URL    = 'https://github.com/Mostafijemon24/Nexus-Lead-Suite';
	private const SUPPORT_URL = 'https://mostafijemon.com';

	/**
	 * @return void
	 */
	public function register_hooks(): void {
		add_filter( 'plugin_action_links_' . nexulesuite_PLUGIN_BASENAME, array( $this, 'filter_action_links' ) );
		add_filter( 'plugin_row_meta', array( $this, 'filter_row_meta' ), 10, 2 );
	}

	/**
	 * Prepends Settings (opens plugin settings; {@see Access_Gate} runs on that admin page).
	 *
	 * @param array<int, string> $links Existing action links.
	 * @return array<int, string>
	 */
	public function filter_action_links( array $links ): array {
		if ( ! current_user_can( 'manage_options' ) ) {
			return $links;
		}

		$settings_url = admin_url( 'admin.php?page=' . Admin_App::MENU_SLUG . '-settings' );

		array_unshift(
			$links,
			sprintf(
				'<a href="%s">%s</a>',
				esc_url( $settings_url ),
				esc_html__( 'Settings', 'nexus-lead-suite' )
			)
		);

		return $links;
	}

	/**
	 * Appends Documentation and Support to the plugin meta row.
	 *
	 * @param array<int, string> $links Existing meta links.
	 * @param string             $file  Plugin basename.
	 * @return array<int, string>
	 */
	public function filter_row_meta( array $links, string $file ): array {
		if ( nexulesuite_PLUGIN_BASENAME !== $file ) {
			return $links;
		}

		if ( ! current_user_can( 'manage_options' ) ) {
			return $links;
		}

		$links[] = sprintf(
			'<a href="%s" target="_blank" rel="noopener noreferrer">%s</a>',
			esc_url( self::DOCS_URL ),
			esc_html__( 'Documentation', 'nexus-lead-suite' )
		);

		$links[] = sprintf(
			'<a href="%s" target="_blank" rel="noopener noreferrer">%s</a>',
			esc_url( self::SUPPORT_URL ),
			esc_html__( 'Support', 'nexus-lead-suite' )
		);

		return $links;
	}
}
