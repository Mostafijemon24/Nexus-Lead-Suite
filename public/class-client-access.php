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
	 * Option holding the named, revocable share links. Tokens are stored hashed.
	 */
	public const LINKS_OPTION = 'nexulesuite_client_links_v1';

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
	 * @deprecated Superseded by {@see create_link()}; kept so links minted by an older
	 *             release keep working until their transient lapses.
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
	 * Normalises a token from a URL or request body.
	 *
	 * @param string $token Raw token.
	 * @return string '' when it cannot be a token at all.
	 */
	private static function clean_token( string $token ): string {
		$token = (string) preg_replace( '/[^a-zA-Z0-9]/', '', $token );

		return strlen( $token ) >= 24 ? $token : '';
	}

	/**
	 * Keyed hash of a token. The raw token is never stored, so a database leak does not
	 * hand out working report links.
	 *
	 * @param string $token Plain token.
	 * @return string
	 */
	private static function token_hash( string $token ): string {
		return hash_hmac( 'sha256', $token, wp_salt( 'auth' ) );
	}

	/**
	 * All stored links.
	 *
	 * @return array<int, array<string,mixed>>
	 */
	public static function all_links(): array {
		$links = get_option( self::LINKS_OPTION, array() );

		return is_array( $links ) ? array_values( $links ) : array();
	}

	/**
	 * Creates a share link and returns it once, with its plaintext token.
	 *
	 * @param string   $label        Human name for the client.
	 * @param int      $expires_days 0 for a link that never expires.
	 * @param string[] $sections     Report sections this link may see.
	 * @return array{id:string, token:string, url:string, link:array<string,mixed>}
	 */
	public static function create_link( string $label, int $expires_days, array $sections ): array {
		$token = wp_generate_password( 48, false, false );
		$id    = wp_generate_password( 12, false, false );

		$link = array(
			'id'         => $id,
			'label'      => $label,
			'token_hash' => self::token_hash( $token ),
			'created'    => time(),
			'expires'    => $expires_days > 0 ? time() + ( $expires_days * DAY_IN_SECONDS ) : 0,
			'sections'   => $sections,
			'uses'       => 0,
			'last_used'  => 0,
		);

		$links   = self::all_links();
		$links[] = $link;
		update_option( self::LINKS_OPTION, $links, false );

		return array(
			'id'    => $id,
			'token' => $token,
			'url'   => self::build_access_url( $token ),
			'link'  => $link,
		);
	}

	/**
	 * Deletes a link, immediately invalidating its URL.
	 *
	 * @param string $id Link id.
	 * @return bool Whether a link was removed.
	 */
	public static function revoke_link( string $id ): bool {
		$links = self::all_links();
		$kept  = array();
		foreach ( $links as $link ) {
			if ( (string) ( $link['id'] ?? '' ) !== $id ) {
				$kept[] = $link;
			}
		}

		if ( count( $kept ) === count( $links ) ) {
			return false;
		}

		update_option( self::LINKS_OPTION, $kept, false );

		return true;
	}

	/**
	 * Finds the live link a token belongs to.
	 *
	 * Expired links are treated as absent and swept on the way past, so a stale record
	 * can never grant access.
	 *
	 * @param string $token Raw token.
	 * @return array<string,mixed>|null
	 */
	public static function resolve_link( string $token ): ?array {
		$token = self::clean_token( $token );
		if ( '' === $token ) {
			return null;
		}

		$hash    = self::token_hash( $token );
		$links   = self::all_links();
		$now     = time();
		$found   = null;
		$changed = false;
		$kept    = array();

		foreach ( $links as $link ) {
			$expires = (int) ( $link['expires'] ?? 0 );
			if ( $expires > 0 && $expires < $now ) {
				$changed = true;
				continue;
			}
			if ( hash_equals( (string) ( $link['token_hash'] ?? '' ), $hash ) ) {
				$found = $link;
			}
			$kept[] = $link;
		}

		if ( $changed ) {
			update_option( self::LINKS_OPTION, $kept, false );
		}

		return $found;
	}

	/**
	 * Report sections a token may see.
	 *
	 * Legacy transient tokens predate per-link sections, so they get the safe default.
	 *
	 * @param string $token Raw token.
	 * @return string[] Empty when the token is not valid.
	 */
	public static function token_sections( string $token ): array {
		require_once nexulesuite_PLUGIN_DIR . 'core/class-report-source.php';

		$link = self::resolve_link( $token );
		if ( null !== $link ) {
			return \nexulesuite_\Core\Report_Source::sanitize_sections( $link['sections'] ?? array() );
		}

		if ( self::is_legacy_token_valid( $token ) ) {
			return \nexulesuite_\Core\Report_Source::DEFAULT_SHARED_SECTIONS;
		}

		return array();
	}

	/**
	 * Records that a link was opened. Best effort; never blocks the page.
	 *
	 * @param string $token Raw token.
	 * @return void
	 */
	public static function touch_link( string $token ): void {
		$token = self::clean_token( $token );
		if ( '' === $token ) {
			return;
		}

		$hash  = self::token_hash( $token );
		$links = self::all_links();
		$hit   = false;

		foreach ( $links as &$link ) {
			if ( hash_equals( (string) ( $link['token_hash'] ?? '' ), $hash ) ) {
				$link['uses']      = (int) ( $link['uses'] ?? 0 ) + 1;
				$link['last_used'] = time();
				$hit               = true;
				break;
			}
		}
		unset( $link );

		if ( $hit ) {
			update_option( self::LINKS_OPTION, $links, false );
		}
	}

	/**
	 * Whether a token minted by the pre-link release is still live.
	 *
	 * @param string $token Raw token.
	 * @return bool
	 */
	private static function is_legacy_token_valid( string $token ): bool {
		$token = self::clean_token( $token );

		return '' !== $token && false !== get_transient( self::transient_key( $token ) );
	}

	/**
	 * Whether a token grants access at all.
	 *
	 * @param string $token Raw token from query/body.
	 * @return bool
	 */
	public static function is_token_valid( string $token ): bool {
		if ( '' === self::clean_token( $token ) ) {
			return false;
		}

		return null !== self::resolve_link( $token ) || self::is_legacy_token_valid( $token );
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

		$sections = self::token_sections( $token );
		if ( empty( $sections ) ) {
			status_header( 403 );
			nocache_headers();
			wp_die(
				esc_html__( 'This access link no longer grants access to any report.', 'nexus-lead-suite' ),
				esc_html__( 'Access denied', 'nexus-lead-suite' ),
				array( 'response' => 403 )
			);
		}

		status_header( 200 );
		nocache_headers();
		self::touch_link( $token );
		self::suppress_site_widgets();

		require_once nexulesuite_PLUGIN_DIR . 'core/class-report-source.php';

		// phpcs:disable WordPress.Security.NonceVerification.Recommended -- Filter-only GET params on token-gated URL.
		$tab = isset( $_GET['tab'] ) ? sanitize_text_field( wp_unslash( (string) $_GET['tab'] ) ) : 'all';
		if ( ! in_array( $tab, array( 'all', 'forms', 'calls', 'consultations', 'interactions' ), true ) ) {
			$tab = 'all';
		}

		$date_from = isset( $_GET['from'] ) ? sanitize_text_field( wp_unslash( (string) $_GET['from'] ) ) : '';
		$date_to   = isset( $_GET['to'] ) ? sanitize_text_field( wp_unslash( (string) $_GET['to'] ) ) : '';
		$search_q  = isset( $_GET['q'] ) ? sanitize_text_field( wp_unslash( (string) $_GET['q'] ) ) : '';
		$print     = isset( $_GET['print'] ) && '1' === sanitize_text_field( wp_unslash( (string) $_GET['print'] ) );

		if ( ! preg_match( '/^\d{4}-\d{2}-\d{2}$/', $date_from ) ) {
			$date_from = '';
		}
		if ( ! preg_match( '/^\d{4}-\d{2}-\d{2}$/', $date_to ) ) {
			$date_to = '';
		}
		// phpcs:enable WordPress.Security.NonceVerification.Recommended

		$report = \nexulesuite_\Core\Report_Source::fetch(
			array(
				'tab'      => $tab,
				'from'     => $date_from,
				'to'       => $date_to,
				'search'   => $search_q,
				'sections' => $sections,
				'limit'    => 500,
			)
		);

		$nexulesuite_ca_token      = $token;
		$nexulesuite_ca_tab        = $tab;
		$nexulesuite_ca_date_from  = $date_from;
		$nexulesuite_ca_date_to    = $date_to;
		$nexulesuite_ca_search     = $search_q;
		$nexulesuite_ca_print      = $print;
		$nexulesuite_ca_sections   = $sections;
		$nexulesuite_ca_report     = $report;
		$nexulesuite_ca_rows       = is_array( $report['activities'] ?? null ) ? $report['activities'] : array();
		$nexulesuite_ca_site_title = get_bloginfo( 'name' );
		$nexulesuite_ca_rest_pdf   = esc_url_raw( rest_url( 'nexulesuite_/v1/reports/combined/pdf' ) );

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
			$search_q,
			$sections
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
	 * Keeps the site's own front-end furniture off the report page.
	 *
	 * The gateway calls wp_footer(), which otherwise drops the live-chat bubble, popups
	 * and bottom nav on top of a client's report — and would log the client's own chats.
	 *
	 * @return void
	 */
	private static function suppress_site_widgets(): void {
		global $wp_filter;

		if ( ! isset( $wp_filter['wp_footer'] ) ) {
			return;
		}

		$ours = array( 'render_livechat_widget', 'render_popups', 'render_bottom_nav' );
		foreach ( $wp_filter['wp_footer']->callbacks as $priority => $callbacks ) {
			foreach ( $callbacks as $callback ) {
				$fn = $callback['function'] ?? null;
				if ( ! is_array( $fn ) || ! is_object( $fn[0] ) || ! in_array( $fn[1], $ours, true ) ) {
					continue;
				}
				if ( $fn[0] instanceof \nexulesuite_\Public\Shortcodes ) {
					remove_action( 'wp_footer', $fn, $priority );
				}
			}
		}
	}

	/**
	 * Enqueues styles/scripts for the token-gated client report gateway.
	 *
	 * @param string   $rest_pdf  REST PDF endpoint URL.
	 * @param string   $token     Access token.
	 * @param string   $tab       Active tab filter.
	 * @param string   $date_from From date (Y-m-d).
	 * @param string   $date_to   To date (Y-m-d).
	 * @param string   $search    Search query.
	 * @param string[] $sections  Report sections this link may export.
	 * @return void
	 */
	public static function enqueue_gateway_assets(
		string $rest_pdf,
		string $token,
		string $tab,
		string $date_from,
		string $date_to,
		string $search,
		array $sections = array()
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

		// Auto-print view: attached to the enqueued handle instead of an inline <script> tag.
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only view flag.
		if ( isset( $_GET['print'] ) && '1' === sanitize_text_field( wp_unslash( (string) $_GET['print'] ) ) ) {
			wp_add_inline_script(
				'nexulesuite_client-access-gateway',
				"window.addEventListener('load', function () { window.print(); });"
			);
		}

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
				'sections' => array_map( 'sanitize_key', $sections ),
				'errorMsg' => __( 'Could not generate PDF.', 'nexus-lead-suite' ),
			)
		);
	}
}
