<?php
/**
 * Core plugin orchestrator.
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
 * Loads modules and registers hooks.
 */
final class Plugin {

	/**
	 * Bootstraps the plugin.
	 *
	 * @return void
	 */
	public function run(): void {
		require_once NEXUS_LS_PLUGIN_DIR . 'core/class-access-gate.php';

		add_filter( 'rest_json_encode_options', array( $this, 'rest_json_encode_options' ), 10, 2 );
		add_action( 'plugins_loaded', array( $this, 'load_textdomain' ) );
		add_action( 'plugins_loaded', array( $this, 'init_mailer' ) );
		add_action( 'wp_logout', array( $this, 'clear_gate_on_logout' ) );
		add_action( 'plugins_loaded', array( $this, 'migrate_legacy_nav_client_toggle_defaults_once' ), 30 );
		add_action( 'plugins_loaded', array( $this, 'migrate_enable_auto_popup_off_once' ), 35 );
		add_action( 'plugins_loaded', array( $this, 'migrate_enable_livechat_off_once' ), 36 );
		add_action( 'plugins_loaded', array( $this, 'migrate_menu_items_groups_once' ), 37 );
		/*
		 * Priority 0: load routes before other rest_api_init listeners (core defaults to 10).
		 * Defers parsing api/class-rest-api.php until a REST request or wp-json discovery runs.
		 */
		add_action( 'rest_api_init', array( $this, 'bootstrap_rest_api' ), 0 );
		add_action( 'init', array( $this, 'init' ) );
		add_action( 'init', array( $this, 'schedule_form_submissions_purge' ), 25 );
		add_action( 'nexus_ls_purge_form_submissions', array( \Nexus_Lead_Suite\Core\Form_Submissions_Store::class, 'purge_expired' ) );
		add_action( 'admin_init', array( $this, 'maybe_gate_admin_pages' ), 0 );
		add_action( 'init', array( $this, 'init_admin' ) );
		add_action( 'init', array( $this, 'init_public' ) );
	}

	/**
	 * Clears Nexus unlock cookie on WordPress user logout (next Nexus visit may prompt again).
	 *
	 * @return void
	 */
	public function clear_gate_on_logout(): void {
		\Nexus_Lead_Suite\Core\Access_Gate::clear_unlock_cookie();
	}

	/**
	 * Shows the Nexus gate only when opening this plugin's wp-admin pages (matching `page=` slug).
	 *
	 * @return void
	 */
	public function maybe_gate_admin_pages(): void {
		if ( ! is_admin() || wp_doing_ajax() ) {
			return;
		}

		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$page = isset( $_GET['page'] ) ? sanitize_text_field( wp_unslash( (string) $_GET['page'] ) ) : '';
		if ( '' === $page ) {
			return;
		}

		$slugs = array(
			'nexus-lead-suite',
			'nexus-lead-suite-menus',
			'nexus-lead-suite-popups',
			'nexus-lead-suite-emails',
			'nexus-lead-suite-forms',
			'nexus-lead-suite-settings',
		);
		if ( ! in_array( $page, $slugs, true ) ) {
			return;
		}

		if ( \Nexus_Lead_Suite\Core\Access_Gate::maybe_handle_unlock_post() ) {
			return;
		}

		if ( ! \Nexus_Lead_Suite\Core\Access_Gate::is_unlocked() ) {
			\Nexus_Lead_Suite\Core\Access_Gate::render_lock_screen_and_exit(
				__( 'Nexus Lead Suite — Locked', 'nexus-lead-suite' ),
				// phpcs:ignore WordPress.Security.NonceVerification.Missing -- display-only wrong-password hint; Access_Gate validates POST.
				isset( $_POST['nexus_ls_gate_password'] ) ? __( 'Wrong password.', 'nexus-lead-suite' ) : ''
			);
		}
	}

	/**
	 * Makes REST JSON responses encode reliably for this plugin (invalid UTF-8 in stored options).
	 *
	 * @param int                   $options Bitmask for json_encode().
	 * @param \WP_REST_Request|null $request Request (may be null on older WP).
	 * @return int
	 */
	public function rest_json_encode_options( int $options, $request ): int {
		if ( $request instanceof \WP_REST_Request ) {
			$route = (string) $request->get_route();
			if ( strpos( $route, '/nexus-lead-suite/v1/' ) !== 0 ) {
				return $options;
			}
		}

		if ( defined( 'JSON_INVALID_UTF8_SUBSTITUTE' ) ) {
			$options |= JSON_INVALID_UTF8_SUBSTITUTE;
		}

		return $options;
	}

	/**
	 * Loads translations.
	 *
	 * @return void
	 */
	public function load_textdomain(): void {
		// phpcs:ignore PluginCheck.CodeAnalysis.DiscouragedFunctions.load_plugin_textdomainFound -- required for non–WordPress.org installs and bundled language packs.
		load_plugin_textdomain(
			'nexus-lead-suite',
			false,
			dirname( NEXUS_LS_PLUGIN_BASENAME ) . '/languages'
		);
	}

	/**
	 * Initializes runtime modules.
	 *
	 * @return void
	 */
	public function init(): void {
		$this->bootstrap_client_access_rewrites_once();
	}

	/**
	 * Daily cleanup for short-retention form submission rows (`*_nexus_ls_submissions`).
	 *
	 * @return void
	 */
	public function schedule_form_submissions_purge(): void {
		if ( wp_installing() ) {
			return;
		}
		if ( ! wp_next_scheduled( 'nexus_ls_purge_form_submissions' ) ) {
			wp_schedule_event( time() + HOUR_IN_SECONDS, 'daily', 'nexus_ls_purge_form_submissions' );
		}
	}

	/**
	 * Loads REST controllers only when the REST API boots (skips heavy parse on normal frontend hits).
	 *
	 * @return void
	 */
	public function bootstrap_rest_api(): void {
		static $did = false;
		if ( $did ) {
			return;
		}
		$did = true;

		require_once NEXUS_LS_PLUGIN_DIR . 'api/class-rest-api.php';
		$rest = new \Nexus_Lead_Suite\Api\Rest_Api();
		$rest->register_routes();
	}

	/**
	 * Ensures rewrite rules pick up client report URL after upgrade (runs once per site).
	 *
	 * @return void
	 */
	private function bootstrap_client_access_rewrites_once(): void {
		if ( '1' === get_option( 'nexus_ls_ca_rw_ok', '' ) ) {
			return;
		}

		require_once NEXUS_LS_PLUGIN_DIR . 'public/class-client-access.php';
		\Nexus_Lead_Suite\Public\Client_Access::sync_rewrite_rules();
		flush_rewrite_rules( false );
		update_option( 'nexus_ls_ca_rw_ok', '1', false );
	}

	/**
	 * One-time: flip legacy installs that still stored both toggles ON to OFF (matches new defaults).
	 *
	 * Runs only when both keys existed and were true; leaves mixed/custom setups unchanged.
	 *
	 * @return void
	 */
	public function migrate_legacy_nav_client_toggle_defaults_once(): void {
		if ( '1' === get_option( 'nexus_ls_migrate_nav_client_off_v3', '' ) ) {
			return;
		}

		$key          = 'nexus_ls_general_settings_v1';
		$data         = get_option( $key, null );
		$looks_legacy = false;

		if ( is_array( $data )
			&& array_key_exists( 'enableNavigation', $data )
			&& array_key_exists( 'allowClientAccess', $data )
			&& ! empty( $data['enableNavigation'] )
			&& ! empty( $data['allowClientAccess'] ) ) {
			$looks_legacy = true;
		}

		if ( ! $looks_legacy ) {
			update_option( 'nexus_ls_migrate_nav_client_off_v3', '1', false );
			return;
		}

		$had_client = ! empty( $data['allowClientAccess'] );
		$data['enableNavigation']  = false;
		$data['allowClientAccess'] = false;
		update_option( $key, $data, false );

		if ( $had_client ) {
			require_once NEXUS_LS_PLUGIN_DIR . 'public/class-client-access.php';
			\Nexus_Lead_Suite\Public\Client_Access::sync_rewrite_rules();
			flush_rewrite_rules( false );
		}

		update_option( 'nexus_ls_migrate_nav_client_off_v3', '1', false );
	}

	/**
	 * One-time: turn stored “Enable Auto Popup” OFF for legacy installs still saving the old default.
	 *
	 * @return void
	 */
	public function migrate_enable_auto_popup_off_once(): void {
		if ( '1' === get_option( 'nexus_ls_migrate_auto_popup_off_v1', '' ) ) {
			return;
		}

		$key = 'nexus_ls_general_settings_v1';
		$row = get_option( $key, null );

		if ( ! is_array( $row ) ) {
			update_option( 'nexus_ls_migrate_auto_popup_off_v1', '1', false );
			return;
		}

		if ( array_key_exists( 'enableAutoPopup', $row ) && ! empty( $row['enableAutoPopup'] ) ) {
			$row['enableAutoPopup'] = false;
			update_option( $key, $row, false );
		}

		update_option( 'nexus_ls_migrate_auto_popup_off_v1', '1', false );
	}

	/**
	 * One-time: turn stored “Enable Livechat Widget” OFF for legacy installs still saving the old default.
	 *
	 * @return void
	 */
	public function migrate_enable_livechat_off_once(): void {
		if ( '1' === get_option( 'nexus_ls_migrate_livechat_off_v1', '' ) ) {
			return;
		}

		$key = 'nexus_ls_general_settings_v1';
		$row = get_option( $key, null );

		if ( ! is_array( $row ) ) {
			update_option( 'nexus_ls_migrate_livechat_off_v1', '1', false );
			return;
		}

		if ( array_key_exists( 'enableLivechat', $row ) && ! empty( $row['enableLivechat'] ) ) {
			$row['enableLivechat'] = false;
			update_option( $key, $row, false );
		}

		update_option( 'nexus_ls_migrate_livechat_off_v1', '1', false );
	}

	/**
	 * One-time: migrate flat menu buttons into grouped storage format.
	 *
	 * @return void
	 */
	public function migrate_menu_items_groups_once(): void {
		require_once NEXUS_LS_PLUGIN_DIR . 'core/class-menu-items-payload.php';
		\Nexus_Lead_Suite\Core\Menu_Items_Payload::maybe_migrate_legacy_option();
	}

	/**
	 * Initializes SMTP mailer integration.
	 *
	 * @return void
	 */
	public function init_mailer(): void {
		require_once NEXUS_LS_PLUGIN_DIR . 'core/class-mailer.php';
		$mailer = new \Nexus_Lead_Suite\Mailer();
		$mailer->register_hooks();
	}

	/**
	 * Initializes admin modules.
	 *
	 * @return void
	 */
	public function init_admin(): void {
		if ( ! is_admin() ) {
			return;
		}

		require_once NEXUS_LS_PLUGIN_DIR . 'admin/class-admin-app.php';
		require_once NEXUS_LS_PLUGIN_DIR . 'admin/class-plugin-list-links.php';
		$admin = new \Nexus_Lead_Suite\Admin\Admin_App();
		$admin->register_hooks();
		$plugin_links = new \Nexus_Lead_Suite\Admin\Plugin_List_Links();
		$plugin_links->register_hooks();
	}

	/**
	 * Initializes public modules (shortcodes, runtime).
	 *
	 * @return void
	 */
	public function init_public(): void {
		require_once NEXUS_LS_PLUGIN_DIR . 'public/class-client-access.php';
		$client_access = new \Nexus_Lead_Suite\Public\Client_Access();
		$client_access->register_hooks();

		if ( $this->should_load_shortcodes_module() ) {
			require_once NEXUS_LS_PLUGIN_DIR . 'public/class-forminator-ui-bridge.php';
			require_once NEXUS_LS_PLUGIN_DIR . 'public/class-shortcodes.php';
			$shortcodes = new \Nexus_Lead_Suite\Public\Shortcodes();
			$shortcodes->register_hooks();
		}
	}

	/**
	 * Whether to load the shortcodes / frontend runtime (large file; skip pure admin screens).
	 *
	 * @return bool
	 */
	private function should_load_shortcodes_module(): bool {
		if ( wp_doing_cron() ) {
			return false;
		}

		if ( defined( 'WP_CLI' ) && WP_CLI ) {
			return false;
		}

		// Front + admin-ajax (form actions, previews); omit typical wp-admin HTML requests.
		$load = ( ! is_admin() || wp_doing_ajax() );

		/**
		 * Filters whether the shortcodes module loads for this request.
		 *
		 * Hosts or add-ons can force true if shortcodes must run in a custom admin context.
		 *
		 * @param bool $load Default heuristic result.
		 */
		return (bool) apply_filters( 'nexus_ls_load_shortcodes_module', $load );
	}
}
