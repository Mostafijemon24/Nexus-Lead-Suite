<?php
/**
 * Core plugin orchestrator.
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
 * Loads modules and registers hooks.
 */
final class Plugin {

	/**
	 * Bootstraps the plugin.
	 *
	 * @return void
	 */
	public function run(): void {

		add_filter( 'rest_json_encode_options', array( $this, 'rest_json_encode_options' ), 10, 2 );
		add_action( 'plugins_loaded', array( $this, 'load_textdomain' ) );
		add_action( 'plugins_loaded', array( $this, 'init_mailer' ) );
		add_action( 'plugins_loaded', array( $this, 'migrate_legacy_step_option_keys_once' ), 25 );
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
		add_action( 'nexulesuite_purge_form_submissions', array( \nexulesuite_\Core\Form_Submissions_Store::class, 'purge_expired' ) );
		add_action( 'nexulesuite_purge_report_pdfs', array( $this, 'purge_report_pdfs' ) );
		add_action( 'admin_init', array( $this, 'maybe_upgrade_db' ), -10 );
		add_action( 'init', array( $this, 'init_admin' ) );
		add_action( 'init', array( $this, 'init_public' ) );
	}

	/**
	 * Runs pending DB schema upgrades for already-active installs (activation hook
	 * only fires on (re)activation, so new tables need a version-gated check here).
	 *
	 * Admin-only by design: Activator::install_tables() pulls in
	 * wp-admin/includes/upgrade.php, which loads the whole wp-admin include tree.
	 * Running that on front-end and REST requests would issue DDL on public traffic.
	 *
	 * Failures are swallowed: a schema upgrade must never take wp-admin down, or the
	 * user loses the screen they'd use to fix it.
	 *
	 * @return void
	 */
	public function maybe_upgrade_db(): void {
		try {
			require_once nexulesuite_PLUGIN_DIR . 'core/class-activator.php';
			Activator::maybe_upgrade();
		} catch ( \Throwable $e ) {
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
				error_log( '[Nexus Lead Suite] Schema upgrade failed: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine() ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log -- logged only when WP_DEBUG is enabled.
			}
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
			if ( strpos( $route, '/nexulesuite_/v1/' ) !== 0 ) {
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
			dirname( nexulesuite_PLUGIN_BASENAME ) . '/languages'
		);
	}

	/**
	 * Initializes runtime modules.
	 *
	 * @return void
	 */
	public function init(): void {
		require_once nexulesuite_PLUGIN_DIR . 'core/class-activity-notifier.php';
		$this->bootstrap_client_access_rewrites_once();
	}

	/**
	 * Daily cleanup for short-retention form submission rows (`*_nexulesuite_submissions`).
	 *
	 * @return void
	 */
	public function schedule_form_submissions_purge(): void {
		if ( wp_installing() ) {
			return;
		}
		if ( ! wp_next_scheduled( 'nexulesuite_purge_form_submissions' ) ) {
			wp_schedule_event( time() + HOUR_IN_SECONDS, 'daily', 'nexulesuite_purge_form_submissions' );
		}
		if ( ! wp_next_scheduled( 'nexulesuite_purge_report_pdfs' ) ) {
			wp_schedule_event( time() + HOUR_IN_SECONDS, 'daily', 'nexulesuite_purge_report_pdfs' );
		}
	}

	/**
	 * Sweeps the report PDFs written into uploads, which nothing used to clean up.
	 *
	 * @return void
	 */
	public function purge_report_pdfs(): void {
		require_once nexulesuite_PLUGIN_DIR . 'core/class-report-pdf.php';
		\nexulesuite_\Core\Report_Pdf::purge_generated_files();
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

		require_once nexulesuite_PLUGIN_DIR . 'api/class-rest-api.php';
		$rest = new \nexulesuite_\Api\Rest_Api();
		$rest->register_routes();
	}

	/**
	 * Ensures rewrite rules pick up client report URL after upgrade (runs once per site).
	 *
	 * @return void
	 */
	private function bootstrap_client_access_rewrites_once(): void {
		if ( '1' === get_option( 'nexulesuite_ca_rw_ok', '' ) ) {
			return;
		}

		require_once nexulesuite_PLUGIN_DIR . 'public/class-client-access.php';
		\nexulesuite_\Frontend\Client_Access::sync_rewrite_rules();
		flush_rewrite_rules( false );
		update_option( 'nexulesuite_ca_rw_ok', '1', false );
	}

	/**
	 * One-time: rename legacy `step_*` option keys to the `nexulesuite_*` prefix.
	 *
	 * @return void
	 */
	public function migrate_legacy_step_option_keys_once(): void {
		if ( '1' === get_option( 'nexulesuite_migrate_step_option_keys_v1', '' ) ) {
			return;
		}

		$map = array(
			'step_forms_builder_v0'   => 'nexulesuite_forms_builder_v0',
			'step_recaptcha_keys_v0'  => 'nexulesuite_recaptcha_keys_v0',
			'step_turnstile_keys_v0'  => 'nexulesuite_turnstile_keys_v0',
		);

		foreach ( $map as $legacy_key => $new_key ) {
			if ( null !== get_option( $new_key, null ) ) {
				continue;
			}
			$legacy_val = get_option( $legacy_key, null );
			if ( null !== $legacy_val ) {
				update_option( $new_key, $legacy_val, false );
			}
		}

		update_option( 'nexulesuite_migrate_step_option_keys_v1', '1', false );
	}

	/**
	 * One-time: flip legacy installs that still stored both toggles ON to OFF (matches new defaults).
	 *
	 * Runs only when both keys existed and were true; leaves mixed/custom setups unchanged.
	 *
	 * @return void
	 */
	public function migrate_legacy_nav_client_toggle_defaults_once(): void {
		if ( '1' === get_option( 'nexulesuite_migrate_nav_client_off_v3', '' ) ) {
			return;
		}

		$key          = 'nexulesuite_general_settings_v1';
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
			update_option( 'nexulesuite_migrate_nav_client_off_v3', '1', false );
			return;
		}

		$had_client = ! empty( $data['allowClientAccess'] );
		$data['enableNavigation']  = false;
		$data['allowClientAccess'] = false;
		update_option( $key, $data, false );

		if ( $had_client ) {
			require_once nexulesuite_PLUGIN_DIR . 'public/class-client-access.php';
			\nexulesuite_\Frontend\Client_Access::sync_rewrite_rules();
			flush_rewrite_rules( false );
		}

		update_option( 'nexulesuite_migrate_nav_client_off_v3', '1', false );
	}

	/**
	 * One-time: turn stored “Enable Auto Popup” OFF for legacy installs still saving the old default.
	 *
	 * @return void
	 */
	public function migrate_enable_auto_popup_off_once(): void {
		if ( '1' === get_option( 'nexulesuite_migrate_auto_popup_off_v1', '' ) ) {
			return;
		}

		$key = 'nexulesuite_general_settings_v1';
		$row = get_option( $key, null );

		if ( ! is_array( $row ) ) {
			update_option( 'nexulesuite_migrate_auto_popup_off_v1', '1', false );
			return;
		}

		if ( array_key_exists( 'enableAutoPopup', $row ) && ! empty( $row['enableAutoPopup'] ) ) {
			$row['enableAutoPopup'] = false;
			update_option( $key, $row, false );
		}

		update_option( 'nexulesuite_migrate_auto_popup_off_v1', '1', false );
	}

	/**
	 * One-time: turn stored “Enable Livechat Widget” OFF for legacy installs still saving the old default.
	 *
	 * @return void
	 */
	public function migrate_enable_livechat_off_once(): void {
		if ( '1' === get_option( 'nexulesuite_migrate_livechat_off_v1', '' ) ) {
			return;
		}

		$key = 'nexulesuite_general_settings_v1';
		$row = get_option( $key, null );

		if ( ! is_array( $row ) ) {
			update_option( 'nexulesuite_migrate_livechat_off_v1', '1', false );
			return;
		}

		if ( array_key_exists( 'enableLivechat', $row ) && ! empty( $row['enableLivechat'] ) ) {
			$row['enableLivechat'] = false;
			update_option( $key, $row, false );
		}

		update_option( 'nexulesuite_migrate_livechat_off_v1', '1', false );
	}

	/**
	 * One-time: migrate flat menu buttons into grouped storage format.
	 *
	 * @return void
	 */
	public function migrate_menu_items_groups_once(): void {
		require_once nexulesuite_PLUGIN_DIR . 'core/class-menu-items-payload.php';
		\nexulesuite_\Core\Menu_Items_Payload::maybe_migrate_legacy_option();
	}

	/**
	 * Initializes SMTP mailer integration.
	 *
	 * @return void
	 */
	public function init_mailer(): void {
		require_once nexulesuite_PLUGIN_DIR . 'core/class-mailer.php';
		$mailer = new \nexulesuite_\Mailer();
		$mailer->register_hooks();

		require_once nexulesuite_PLUGIN_DIR . 'core/class-smtp-oauth.php';
		$smtp_oauth = new \nexulesuite_\Smtp_OAuth();
		$smtp_oauth->register_hooks();
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

		require_once nexulesuite_PLUGIN_DIR . 'admin/class-admin-app.php';
		require_once nexulesuite_PLUGIN_DIR . 'admin/class-plugin-list-links.php';
		$admin = new \nexulesuite_\Admin\Admin_App();
		$admin->register_hooks();
		$plugin_links = new \nexulesuite_\Admin\Plugin_List_Links();
		$plugin_links->register_hooks();
	}

	/**
	 * Initializes public modules (shortcodes, runtime).
	 *
	 * @return void
	 */
	public function init_public(): void {
		require_once nexulesuite_PLUGIN_DIR . 'public/class-client-access.php';
		$client_access = new \nexulesuite_\Frontend\Client_Access();
		$client_access->register_hooks();

		require_once nexulesuite_PLUGIN_DIR . 'public/class-accessibility-language.php';
		$a11y_lang = new \nexulesuite_\Frontend\Accessibility_Language();
		$a11y_lang->register_hooks();

		if ( $this->should_load_shortcodes_module() ) {
			require_once nexulesuite_PLUGIN_DIR . 'public/class-forminator-ui-bridge.php';
			require_once nexulesuite_PLUGIN_DIR . 'public/class-shortcodes.php';
			$shortcodes = new \nexulesuite_\Frontend\Shortcodes();
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
		return (bool) apply_filters( 'nexulesuite_load_shortcodes_module', $load );
	}
}
