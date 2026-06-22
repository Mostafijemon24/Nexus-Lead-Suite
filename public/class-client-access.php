<?php
/**
 * Temporary client reporting URL (token + rewrite / plain query fallback).
 *
 * @package nexulesuite_
 */

declare(strict_types=1);

namespace nexulesuite_\Public;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers rewrite rules and serves the lightweight gateway template.
 */
final class Client_Access {

	public const QUERY_VAR = 'nexulesuite_client_report';

	private const SETTINGS_OPTION = 'nexulesuite_general_settings_v1';

	private const TRANSIENT_PREFIX = 'nexulesuite_ca_';

	/**
	 * Registers hooks.
	 *
	 * @return void
	 */
	public function register_hooks(): void {
		add_action( 'init', array( self::class, 'sync_rewrite_rules' ), 20 );
		add_filter( 'query_vars', array( $this, 'register_query_var' ) );
		add_action( 'template_redirect', array( $this, 'maybe_serve_gateway' ), 5 );
	}

	/**
	 * Adds rewrite rule using saved slug when client access is enabled.
	 *
	 * @return void
	 */
	public static function sync_rewrite_rules(): void {
		if ( ! self::is_allowed_from_db() ) {
			return;
		}

		$slug = self::slug_from_db();
		add_rewrite_rule(
			'^' . preg_quote( $slug, '/' ) . '/?$',
			'index.php?' . self::QUERY_VAR . '=1',
			'top'
		);
	}

	/**
	 * Activation helper: register rule then persist rewrite stack.
	 *
	 * @return void
	 */
	public static function activation_flush_rewrite_rules(): void {
		self::sync_rewrite_rules();
		flush_rewrite_rules( true );
	}

	/**
	 * Valid URL slug for client gateway (pretty permalinks).
	 *
	 * @return string
	 */
	public static function slug_from_db(): string {
		$opt = get_option( self::SETTINGS_OPTION, array() );
		if ( ! is_array( $opt ) ) {
			$opt = array();
		}
		$slug = isset( $opt['clientAccessSlug'] ) ? sanitize_title( (string) $opt['clientAccessSlug'] ) : '';
		return '' !== $slug ? $slug : 'report-access';
	}

	/**
	 * Whether saved settings allow issuing tokens / gateway.
	 *
	 * @return bool
	 */
	public static function is_allowed_from_db(): bool {
		$opt = get_option( self::SETTINGS_OPTION, array() );
		return is_array( $opt ) && ! empty( $opt['allowClientAccess'] );
	}

	/**
	 * Transient key for a plaintext token.
	 *
	 * @param string $token Alphanumeric token.
	 * @return string
	 */
	public static function transient_key( string $token ): string {
		return self::TRANSIENT_PREFIX . $token;
	}

	/**
	 * Stores token metadata until TTL expires.
	 *
	 * @param string $token Plain token.
	 * @param int    $ttl_seconds TTL in seconds (already bounded).
	 * @return void
	 */
	public static function store_token( string $token, int $ttl_seconds ): void {
		set_transient(
			self::transient_key( $token ),
			array(
				'created' => time(),
			),
			$ttl_seconds
		);
	}

	/**
	 * Whether token matches a live transient.
	 *
	 * @param string $token Raw token from query/body.
	 * @return bool
	 */
	public static function is_token_valid( string $token ): bool {
		$token = preg_replace( '/[^a-zA-Z0-9]/', '', $token );
		if ( strlen( $token ) < 24 ) {
			return false;
		}

		return false !== get_transient( self::transient_key( $token ) );
	}

	/**
	 * Builds absolute URL containing token (pretty or plain permalink structure).
	 *
	 * @param string $token Token string.
	 * @return string
	 */
	public static function build_access_url( string $token ): string {
		$token_enc = rawurlencode( $token );

		if ( get_option( 'permalink_structure' ) ) {
			return add_query_arg( 'token', $token_enc, trailingslashit( home_url( self::slug_from_db() ) ) );
		}

		return add_query_arg(
			array(
				self::QUERY_VAR => '1',
				'token'         => $token_enc,
			),
			trailingslashit( home_url() )
		);
	}

	/**
	 * Registers public query var for rewrite resolution.
	 *
	 * @param array<string> $vars Vars.
	 * @return array<string>
	 */
	public function register_query_var( array $vars ): array {
		$vars[] = self::QUERY_VAR;

		return $vars;
	}

	/**
	 * Renders gateway HTML when route matches and token is valid.
	 *
	 * @return void
	 */
	public function maybe_serve_gateway(): void {
		if ( ! self::is_allowed_from_db() ) {
			return;
		}

		$from_rewrite = '1' === (string) get_query_var( self::QUERY_VAR );
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Public bookmark URL with opaque token.
		$from_plain = isset( $_GET[ self::QUERY_VAR ] ) && '1' === sanitize_text_field( wp_unslash( (string) $_GET[ self::QUERY_VAR ] ) );

		if ( ! $from_rewrite && ! $from_plain ) {
			return;
		}

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$token = isset( $_GET['token'] ) ? sanitize_text_field( wp_unslash( (string) $_GET['token'] ) ) : '';
		if ( '' === $token || ! self::is_token_valid( $token ) ) {
			status_header( 403 );
			nocache_headers();
			wp_die(
				esc_html__( 'This access link is invalid or has expired.', 'nexus-lead-suite' ),
				esc_html__( 'Access denied', 'nexus-lead-suite' ),
				array( 'response' => 403 )
			);
		}

		status_header( 200 );
		nocache_headers();

		require_once nexulesuite_PLUGIN_DIR . 'core/class-activities-store.php';

		// phpcs:disable WordPress.Security.NonceVerification.Recommended -- Filter-only GET params on token-gated URL.
		$tab = isset( $_GET['tab'] ) ? sanitize_text_field( wp_unslash( (string) $_GET['tab'] ) ) : 'all';
		if ( ! in_array( $tab, array( 'all', 'forms', 'calls', 'consultations', 'interactions' ), true ) ) {
			$tab = 'all';
		}

		$date_from = isset( $_GET['from'] ) ? sanitize_text_field( wp_unslash( (string) $_GET['from'] ) ) : '';
		$date_to   = isset( $_GET['to'] ) ? sanitize_text_field( wp_unslash( (string) $_GET['to'] ) ) : '';
		$search_q  = isset( $_GET['q'] ) ? sanitize_text_field( wp_unslash( (string) $_GET['q'] ) ) : '';

		if ( ! preg_match( '/^\d{4}-\d{2}-\d{2}$/', $date_from ) ) {
			$date_from = '';
		}
		if ( ! preg_match( '/^\d{4}-\d{2}-\d{2}$/', $date_to ) ) {
			$date_to = '';
		}
		// phpcs:enable WordPress.Security.NonceVerification.Recommended

		$db_rows = \nexulesuite_\Core\Activities_Store::fetch_report_rows( $tab, $date_from, $date_to, $search_q );
		$rows    = array();
		foreach ( $db_rows as $row ) {
			$rows[] = \nexulesuite_\Core\Activities_Store::map_db_row_to_activity( $row );
		}

		$nexulesuite_ca_token      = $token;
		$nexulesuite_ca_tab        = $tab;
		$nexulesuite_ca_date_from  = $date_from;
		$nexulesuite_ca_date_to    = $date_to;
		$nexulesuite_ca_search     = $search_q;
		$nexulesuite_ca_rows       = $rows;
		$nexulesuite_ca_site_title = get_bloginfo( 'name' );
		$nexulesuite_ca_rest_pdf   = esc_url_raw( rest_url( 'nexulesuite_/v1/reports/activities/pdf' ) );

		$nexulesuite_ca_report_logo = '';
		$gen_opt                 = get_option( self::SETTINGS_OPTION, array() );
		if ( is_array( $gen_opt ) && ! empty( $gen_opt['reportLogo'] ) ) {
			$nexulesuite_ca_report_logo = esc_url_raw( (string) $gen_opt['reportLogo'] );
		}
		if ( '' === $nexulesuite_ca_report_logo ) {
			$custom_logo_id = (int) get_theme_mod( 'custom_logo', 0 );
			if ( $custom_logo_id > 0 ) {
				$url = wp_get_attachment_image_url( $custom_logo_id, 'full' );
				if ( is_string( $url ) && '' !== $url ) {
					$nexulesuite_ca_report_logo = esc_url_raw( $url );
				}
			}
		}

		$nexulesuite_ca_report_logo_max_px = 400;
		if ( is_array( $gen_opt ) && isset( $gen_opt['reportLogoPdfMax'] ) ) {
			$nexulesuite_ca_report_logo_max_px = max( 100, min( 1000, (int) $gen_opt['reportLogoPdfMax'] ) );
		}

		self::enqueue_gateway_assets(
			$nexulesuite_ca_rest_pdf,
			$token,
			$tab,
			$date_from,
			$date_to,
			$search_q
		);

		$partial = nexulesuite_PLUGIN_DIR . 'public/partials/client-access-gateway.php';
		if ( file_exists( $partial ) ) {
			require $partial;
		} else {
			echo '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' . esc_html__( 'Report access', 'nexus-lead-suite' ) . '</title></head><body>';
			echo '<p>' . esc_html__( 'Temporary reporting access is active.', 'nexus-lead-suite' ) . '</p>';
			echo '</body></html>';
		}

		exit;
	}

	/**
	 * Enqueues styles/scripts for the token-gated client report gateway.
	 *
	 * @param string $rest_pdf REST PDF endpoint URL.
	 * @param string $token    Access token.
	 * @param string $tab      Active tab filter.
	 * @param string $date_from From date (Y-m-d).
	 * @param string $date_to   To date (Y-m-d).
	 * @param string $search    Search query.
	 * @return void
	 */
	public static function enqueue_gateway_assets(
		string $rest_pdf,
		string $token,
		string $tab,
		string $date_from,
		string $date_to,
		string $search
	): void {
		$css_path = nexulesuite_PLUGIN_DIR . 'public/css/client-access-gateway.css';
		$js_path  = nexulesuite_PLUGIN_DIR . 'public/js/client-access-gateway.js';
		$css_ver  = file_exists( $css_path ) ? (string) filemtime( $css_path ) : nexulesuite_VERSION;
		$js_ver   = file_exists( $js_path ) ? (string) filemtime( $js_path ) : nexulesuite_VERSION;

		require_once nexulesuite_PLUGIN_DIR . 'core/class-global-font.php';
		\nexulesuite_\Core\Global_Font::enqueue( 'nexulesuite_global-font' );

		wp_enqueue_style(
			'nexulesuite_client-access-gateway',
			esc_url( nexulesuite_PLUGIN_URL . 'public/css/client-access-gateway.css' ),
			array( 'nexulesuite_global-font' ),
			$css_ver
		);

		wp_enqueue_script(
			'nexulesuite_client-access-gateway',
			esc_url( nexulesuite_PLUGIN_URL . 'public/js/client-access-gateway.js' ),
			array(),
			$js_ver,
			true
		);

		wp_localize_script(
			'nexulesuite_client-access-gateway',
			'nexulesuite_ClientPdfCfg',
			array(
				'pdfUrl'   => esc_url_raw( $rest_pdf ),
				'token'    => sanitize_text_field( $token ),
				'tab'      => sanitize_text_field( $tab ),
				'dateFrom' => sanitize_text_field( $date_from ),
				'dateTo'   => sanitize_text_field( $date_to ),
				'search'   => sanitize_text_field( $search ),
				'errorMsg' => __( 'Could not generate PDF.', 'nexus-lead-suite' ),
			)
		);
	}
}
