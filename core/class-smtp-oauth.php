<?php
/**
 * OAuth2 (Authorization Code) flow for Google & Microsoft SMTP mailers.
 *
 * Lightweight: no third-party OAuth library. Tokens are exchanged/refreshed with
 * plain wp_remote_post() and mail is sent over the provider's SMTP relay using
 * PHPMailer's XOAUTH2 auth type (see class-smtp-xoauth2-provider.php).
 *
 * All secrets (client secret, refresh/access tokens) are encrypted at rest via
 * Mailer::encrypt_secret() and are never sent to the browser.
 *
 * @package nexulesuite_
 */

declare(strict_types=1);

namespace nexulesuite_;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/class-mailer.php';

/**
 * Handles the OAuth connect / disconnect flow and token lifecycle.
 */
final class Smtp_OAuth {

	public const START_ACTION      = 'nexulesuite_smtp_oauth_start';
	public const CB_ACTION         = 'nexulesuite_smtp_oauth_cb';
	public const DISCONNECT_ACTION = 'nexulesuite_smtp_oauth_disconnect';

	private const STATE_PREFIX   = 'nexulesuite_smtp_oauth_';
	private const SETTINGS_SLUG  = 'nexus-lead-suite-settings';

	/**
	 * Registers the admin-post handlers used by the browser redirect flow.
	 *
	 * @return void
	 */
	public function register_hooks(): void {
		add_action( 'admin_post_' . self::START_ACTION, array( $this, 'handle_start' ) );
		add_action( 'admin_post_' . self::CB_ACTION, array( $this, 'handle_callback' ) );
		/*
		 * Google/Microsoft redirect back as a cross-site top-level GET. Some browsers
		 * (or Local SSL setups) omit the WP auth cookie on that hop, so admin_post_
		 * never runs and the user lands on wp-login with the OAuth code stripped.
		 * The nopriv handler still validates the one-time state transient + capability.
		 */
		add_action( 'admin_post_nopriv_' . self::CB_ACTION, array( $this, 'handle_callback' ) );
		add_action( 'admin_post_' . self::DISCONNECT_ACTION, array( $this, 'handle_disconnect' ) );
	}

	/**
	 * Provider metadata (endpoints, scopes).
	 *
	 * @return array<string,array<string,mixed>>
	 */
	public static function providers(): array {
		return array(
			'gmail'   => array(
				'label'      => 'Google / Gmail',
				'auth_url'   => 'https://accounts.google.com/o/oauth2/v2/auth',
				'token_url'  => 'https://oauth2.googleapis.com/token',
				'scope'      => 'https://mail.google.com/ openid email',
				'auth_extra' => array(
					'access_type'            => 'offline',
					'prompt'                 => 'consent',
					'include_granted_scopes' => 'true',
				),
			),
			'outlook' => array(
				'label'      => 'Microsoft / Outlook',
				'auth_url'   => 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
				'token_url'  => 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
				'scope'      => 'https://outlook.office.com/SMTP.Send offline_access openid email',
				'auth_extra' => array(
					'prompt' => 'consent',
				),
			),
		);
	}

	/**
	 * @param string $mailer Mailer id.
	 * @return bool
	 */
	public static function is_oauth_mailer( string $mailer ): bool {
		return isset( self::providers()[ $mailer ] );
	}

	/**
	 * The redirect URI the provider calls back — must be registered in the provider console.
	 *
	 * @return string
	 */
	public static function redirect_uri(): string {
		if ( defined( 'nexulesuite_SMTP_OAUTH_REDIRECT_URI' ) ) {
			$override = trim( (string) nexulesuite_SMTP_OAUTH_REDIRECT_URI );
			if ( '' !== $override ) {
				/**
				 * Allows a public tunnel / Live Link URL when the site host is not a public TLD
				 * (e.g. *.local). Must still end at admin-post.php?action=nexulesuite_smtp_oauth_cb.
				 */
				return $override;
			}
		}

		$uri = admin_url( 'admin-post.php?action=' . self::CB_ACTION );

		/**
		 * Filters the SMTP OAuth redirect URI registered with Google/Microsoft.
		 *
		 * @param string $uri Absolute callback URL.
		 */
		return (string) apply_filters( 'nexulesuite_smtp_oauth_redirect_uri', $uri );
	}

	/**
	 * Signed URL that starts the consent flow for a provider (used as a link href).
	 *
	 * @param string $provider Provider id.
	 * @return string
	 */
	public static function authorize_url( string $provider ): string {
		return wp_nonce_url(
			admin_url( 'admin-post.php?action=' . self::START_ACTION . '&provider=' . rawurlencode( $provider ) ),
			self::START_ACTION . '_' . $provider
		);
	}

	/**
	 * Signed URL that disconnects the current OAuth account.
	 *
	 * @return string
	 */
	public static function disconnect_url(): string {
		return wp_nonce_url(
			admin_url( 'admin-post.php?action=' . self::DISCONNECT_ACTION ),
			self::DISCONNECT_ACTION
		);
	}

	/**
	 * The connected account email, if any.
	 *
	 * @return string
	 */
	public static function account_email(): string {
		$opt = self::read_option();
		return isset( $opt['oauth_email'] ) ? (string) $opt['oauth_email'] : '';
	}

	/**
	 * @return bool True when a refresh token is stored (i.e. the account is connected).
	 */
	public static function is_connected(): bool {
		$opt = self::read_option();
		return '' !== Mailer::decrypt_secret( (string) ( $opt['oauth_refresh_token'] ?? '' ) );
	}

	/**
	 * @return array<string,mixed>
	 */
	private static function read_option(): array {
		$opt = get_option( Mailer::OPTION_KEY, array() );
		return is_array( $opt ) ? $opt : array();
	}

	/**
	 * Builds the provider consent URL (creates a one-time `state` transient).
	 *
	 * Used by the REST start endpoint so the SPA does not rely on a long-lived
	 * admin-post nonce that shows “The link you followed has expired.”
	 *
	 * @param string $provider Provider id (gmail|outlook).
	 * @return string|\WP_Error Absolute consent URL or error.
	 */
	public static function build_consent_url( string $provider ) {
		$provider  = sanitize_key( $provider );
		$providers = self::providers();
		if ( ! isset( $providers[ $provider ] ) ) {
			return new \WP_Error( 'nexulesuite_oauth', __( 'Unknown mailer.', 'nexus-lead-suite' ) );
		}

		$opt           = self::read_option();
		$client_id     = isset( $opt['oauth_client_id'] ) ? (string) $opt['oauth_client_id'] : '';
		$client_secret = isset( $opt['oauth_client_secret'] ) ? Mailer::decrypt_secret( (string) $opt['oauth_client_secret'] ) : '';
		if ( '' === $client_id || '' === $client_secret ) {
			return new \WP_Error(
				'nexulesuite_oauth',
				__( 'Enter and Save the Client ID & Client Secret before authorizing.', 'nexus-lead-suite' )
			);
		}

		$state = wp_generate_password( 24, false );
		set_transient(
			self::STATE_PREFIX . $state,
			array(
				'provider' => $provider,
				'user'     => get_current_user_id(),
			),
			15 * MINUTE_IN_SECONDS
		);

		$args = array_merge(
			array(
				'client_id'     => $client_id,
				'redirect_uri'  => self::redirect_uri(),
				'response_type' => 'code',
				'scope'         => $providers[ $provider ]['scope'],
				'state'         => $state,
			),
			$providers[ $provider ]['auth_extra']
		);

		return $providers[ $provider ]['auth_url'] . '?' . http_build_query( $args );
	}

	/**
	 * admin-post: build the consent URL and redirect the browser to the provider.
	 *
	 * @return void
	 */
	public function handle_start(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'You are not allowed to do this.', 'nexus-lead-suite' ), 403 );
		}
		$provider = isset( $_GET['provider'] ) ? sanitize_key( wp_unslash( $_GET['provider'] ) ) : '';
		check_admin_referer( self::START_ACTION . '_' . $provider );

		$url = self::build_consent_url( $provider );
		if ( is_wp_error( $url ) ) {
			$this->redirect_back( 'error', $url->get_error_message() );
		}

		// phpcs:ignore WordPress.Security.SafeRedirect.wp_redirect_wp_redirect -- deliberate off-site hop to a hardcoded provider endpoint from self::providers(); wp_safe_redirect() would strip it and break the OAuth handshake.
		wp_redirect( $url );
		exit;
	}

	/**
	 * admin-post: provider callback — exchange the code for tokens and store them.
	 *
	 * @return void
	 */
	public function handle_callback(): void {
		// The provider issues this request, so no nonce can ride along. CSRF is bound instead by the
		// single-use `state` transient minted in connect() and consumed below, which is the OAuth 2.0
		// mechanism for exactly this (RFC 6749 §10.12); the capability check follows it.
		// phpcs:disable WordPress.Security.NonceVerification.Recommended -- see above; `state` transient is the CSRF token.
		$state = isset( $_GET['state'] ) ? sanitize_text_field( wp_unslash( $_GET['state'] ) ) : '';
		$data  = '' !== $state ? get_transient( self::STATE_PREFIX . $state ) : false;
		if ( ! is_array( $data ) ) {
			$this->redirect_back( 'error', __( 'The authorization link expired. Please try again.', 'nexus-lead-suite' ) );
		}
		delete_transient( self::STATE_PREFIX . $state );

		$provider = (string) ( $data['provider'] ?? '' );
		$user_id  = (int) ( $data['user'] ?? 0 );
		if ( ! user_can( $user_id, 'manage_options' ) ) {
			$this->redirect_back( 'error', __( 'Permission denied.', 'nexus-lead-suite' ) );
		}

		$providers = self::providers();
		$err       = isset( $_GET['error'] ) ? sanitize_text_field( wp_unslash( $_GET['error'] ) ) : '';
		$code      = isset( $_GET['code'] ) ? sanitize_text_field( wp_unslash( $_GET['code'] ) ) : '';
		// phpcs:enable WordPress.Security.NonceVerification.Recommended
		if ( '' !== $err ) {
			$this->redirect_back( 'error', sprintf( /* translators: %s: provider error code */ __( 'Authorization was declined (%s).', 'nexus-lead-suite' ), $err ) );
		}
		if ( ! isset( $providers[ $provider ] ) || '' === $code ) {
			$this->redirect_back( 'error', __( 'Authorization failed — no code returned.', 'nexus-lead-suite' ) );
		}

		$opt           = self::read_option();
		$client_id     = (string) ( $opt['oauth_client_id'] ?? '' );
		$client_secret = Mailer::decrypt_secret( (string) ( $opt['oauth_client_secret'] ?? '' ) );

		$tokens = self::request_tokens(
			$provider,
			array(
				'grant_type'   => 'authorization_code',
				'code'         => $code,
				'redirect_uri' => self::redirect_uri(),
			),
			$client_id,
			$client_secret
		);
		if ( is_wp_error( $tokens ) ) {
			$this->redirect_back( 'error', $tokens->get_error_message() );
		}

		$refresh = (string) ( $tokens['refresh_token'] ?? '' );
		$access  = (string) ( $tokens['access_token'] ?? '' );
		if ( '' === $refresh ) {
			$this->redirect_back( 'error', __( 'No refresh token returned. Remove this app under your account security settings and authorize again.', 'nexus-lead-suite' ) );
		}

		$email = self::email_from_tokens( $tokens );

		$opt['mailer']              = $provider;
		$opt['enabled']             = true;
		$opt['oauth_refresh_token'] = Mailer::encrypt_secret( $refresh );
		$opt['oauth_access_token']  = '' !== $access ? Mailer::encrypt_secret( $access ) : '';
		$opt['oauth_expires']       = time() + max( 60, (int) ( $tokens['expires_in'] ?? 3600 ) ) - 60;
		$opt['oauth_email']         = $email;
		if ( '' !== $email && empty( $opt['from_email'] ) ) {
			$opt['from_email'] = $email;
		}
		update_option( Mailer::OPTION_KEY, $opt, false );

		$this->redirect_back( 'connected', '' );
	}

	/**
	 * admin-post: clear the connected account (keeps the client id/secret).
	 *
	 * @return void
	 */
	public function handle_disconnect(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'You are not allowed to do this.', 'nexus-lead-suite' ), 403 );
		}
		check_admin_referer( self::DISCONNECT_ACTION );

		$opt = self::read_option();
		unset( $opt['oauth_refresh_token'], $opt['oauth_access_token'], $opt['oauth_expires'], $opt['oauth_email'] );
		$opt['enabled'] = false;
		update_option( Mailer::OPTION_KEY, $opt, false );

		$this->redirect_back( 'disconnected', '' );
	}

	/**
	 * Returns a valid access token, refreshing it if expired. Updates the cached token.
	 * Used by the XOAUTH2 provider at send time.
	 *
	 * @return string Access token, or '' when unavailable.
	 */
	public static function get_access_token(): string {
		$token = self::acquire_access_token();
		return is_wp_error( $token ) ? '' : $token;
	}

	/**
	 * Like {@see get_access_token()} but returns a WP_Error with the failure reason.
	 *
	 * @return string|\WP_Error Access token or error.
	 */
	public static function acquire_access_token() {
		$opt    = self::read_option();
		$mailer = (string) ( $opt['mailer'] ?? '' );
		if ( ! self::is_oauth_mailer( $mailer ) ) {
			return new \WP_Error( 'nexulesuite_oauth', __( 'OAuth mailer is not selected.', 'nexus-lead-suite' ) );
		}

		$expires = (int) ( $opt['oauth_expires'] ?? 0 );
		$access  = Mailer::decrypt_secret( (string) ( $opt['oauth_access_token'] ?? '' ) );
		if ( '' !== $access && time() < $expires ) {
			return $access;
		}

		$refresh = Mailer::decrypt_secret( (string) ( $opt['oauth_refresh_token'] ?? '' ) );
		if ( '' === $refresh ) {
			if ( ! empty( $opt['oauth_refresh_token'] ) ) {
				return new \WP_Error(
					'nexulesuite_oauth_decrypt',
					__( 'Saved OAuth tokens cannot be read (site keys may have changed). Disconnect, then Authorize again.', 'nexus-lead-suite' )
				);
			}
			return new \WP_Error(
				'nexulesuite_oauth',
				__( 'No OAuth refresh token. Click Authorize to connect the account.', 'nexus-lead-suite' )
			);
		}

		$tokens = self::request_tokens(
			$mailer,
			array(
				'grant_type'    => 'refresh_token',
				'refresh_token' => $refresh,
			),
			(string) ( $opt['oauth_client_id'] ?? '' ),
			Mailer::decrypt_secret( (string) ( $opt['oauth_client_secret'] ?? '' ) )
		);
		if ( is_wp_error( $tokens ) ) {
			return $tokens;
		}

		$access = (string) ( $tokens['access_token'] ?? '' );
		if ( '' === $access ) {
			return new \WP_Error( 'nexulesuite_oauth', __( 'Provider returned an empty access token. Disconnect and Authorize again.', 'nexus-lead-suite' ) );
		}

		$opt['oauth_access_token'] = Mailer::encrypt_secret( $access );
		$opt['oauth_expires']      = time() + max( 60, (int) ( $tokens['expires_in'] ?? 3600 ) ) - 60;
		if ( ! empty( $tokens['refresh_token'] ) ) {
			$opt['oauth_refresh_token'] = Mailer::encrypt_secret( (string) $tokens['refresh_token'] );
		}
		update_option( Mailer::OPTION_KEY, $opt, false );

		return $access;
	}

	/**
	 * POSTs to the provider token endpoint.
	 *
	 * @param string               $provider      Provider id.
	 * @param array<string,string> $body          Grant-specific body params.
	 * @param string               $client_id     OAuth client id.
	 * @param string               $client_secret OAuth client secret.
	 * @return array<string,mixed>|\WP_Error Decoded token payload or error.
	 */
	public static function request_tokens( string $provider, array $body, string $client_id, string $client_secret ) {
		$providers = self::providers();
		if ( ! isset( $providers[ $provider ] ) ) {
			return new \WP_Error( 'nexulesuite_oauth', __( 'Unknown mailer.', 'nexus-lead-suite' ) );
		}
		if ( '' === $client_id || '' === $client_secret ) {
			return new \WP_Error( 'nexulesuite_oauth', __( 'Missing OAuth client credentials.', 'nexus-lead-suite' ) );
		}

		$body['client_id']     = $client_id;
		$body['client_secret'] = $client_secret;

		$res = wp_remote_post(
			$providers[ $provider ]['token_url'],
			array(
				'timeout' => 20,
				'headers' => array(
					'Accept'       => 'application/json',
					'Content-Type' => 'application/x-www-form-urlencoded',
				),
				'body'    => $body,
			)
		);
		if ( is_wp_error( $res ) ) {
			return $res;
		}

		$status = (int) wp_remote_retrieve_response_code( $res );
		$json   = json_decode( wp_remote_retrieve_body( $res ), true );
		if ( $status < 200 || $status >= 300 || ! is_array( $json ) ) {
			$detail = is_array( $json ) ? (string) ( $json['error_description'] ?? $json['error'] ?? '' ) : '';
			return new \WP_Error(
				'nexulesuite_oauth_token',
				'' !== $detail ? $detail : sprintf( /* translators: %d: HTTP status */ __( 'Token request failed (HTTP %d).', 'nexus-lead-suite' ), $status )
			);
		}

		return $json;
	}

	/**
	 * Reads the account email from the id_token (JWT) returned by the token endpoint.
	 *
	 * @param array<string,mixed> $tokens Token payload.
	 * @return string Email or ''.
	 */
	public static function email_from_tokens( array $tokens ): string {
		$id_token = (string) ( $tokens['id_token'] ?? '' );
		if ( '' === $id_token ) {
			return '';
		}
		$parts = explode( '.', $id_token );
		if ( ! isset( $parts[1] ) ) {
			return '';
		}
		$payload = json_decode( self::base64url_decode( $parts[1] ), true );
		if ( ! is_array( $payload ) ) {
			return '';
		}
		foreach ( array( 'email', 'preferred_username', 'upn' ) as $claim ) {
			if ( ! empty( $payload[ $claim ] ) && is_email( (string) $payload[ $claim ] ) ) {
				return sanitize_email( (string) $payload[ $claim ] );
			}
		}
		return '';
	}

	/**
	 * @param string $data Base64url string.
	 * @return string
	 */
	private static function base64url_decode( string $data ): string {
		$data = strtr( $data, '-_', '+/' );
		$pad  = strlen( $data ) % 4;
		if ( $pad > 0 ) {
			$data .= str_repeat( '=', 4 - $pad );
		}
		return (string) base64_decode( $data ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_decode
	}

	/**
	 * Redirects back to the Settings SMTP tab with a status flag.
	 *
	 * @param string $status connected|disconnected|error.
	 * @param string $message Optional human message.
	 * @return void
	 */
	private function redirect_back( string $status, string $message ): void {
		$args = array(
			'page'     => self::SETTINGS_SLUG,
			'nls_smtp' => $status,
		);
		// add_query_arg() already encodes values — do not rawurlencode() here.
		if ( '' !== $message ) {
			$args['nls_smtp_msg'] = $message;
		}
		wp_safe_redirect( add_query_arg( $args, admin_url( 'admin.php' ) ) );
		exit;
	}
}
