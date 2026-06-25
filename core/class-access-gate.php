<?php
/**
 * Optional password gate when opening Nexus Lead Suite in wp-admin (cookie-based unlock).
 *
 * @package nexulesuite_
 */
declare(strict_types=1);

namespace nexulesuite_\Core;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Lightweight lock screen for Nexus admin screens only.
 *
 * Notes:
 * - Not a substitute for server-level access control; complements {@see manage_options}.
 * - Unlock state is stored in an HMAC-signed cookie.
 */
final class Access_Gate {
	/**
	 * Gate password (site requirement; replace or move to options if you need per-site secrets).
	 */
	private const PASSWORD = '2521';

	private const COOKIE_NAME = 'nexulesuite_unlock';

	/**
	 * Cookie lifetime in seconds.
	 */
	private const TTL = 43200; // 12 hours.

	/**
	 * Reads the cookie and verifies signature.
	 *
	 * @return bool
	 */
	public static function is_unlocked(): bool {
		if ( empty( $_COOKIE[ self::COOKIE_NAME ] ) ) {
			return false;
		}

		$raw = sanitize_text_field( wp_unslash( (string) $_COOKIE[ self::COOKIE_NAME ] ) );
		if ( '' === $raw ) {
			return false;
		}

		$parts = explode( '.', $raw );
		if ( 2 !== count( $parts ) ) {
			return false;
		}

		$ts  = (int) $parts[0];
		$sig = (string) $parts[1];
		if ( $ts <= 0 || '' === $sig ) {
			return false;
		}

		if ( time() - $ts > self::TTL ) {
			return false;
		}

		$expected = self::sign( (string) $ts );

		return hash_equals( $expected, $sig );
	}

	/**
	 * Attempts to unlock if a POSTed password matches.
	 *
	 * @return bool True when unlocked (now).
	 */
	public static function maybe_handle_unlock_post(): bool {
		if ( self::is_unlocked() ) {
			return true;
		}

		if ( ! self::is_unlock_post_request() ) {
			return false;
		}

		if ( ! current_user_can( 'manage_options' ) ) {
			return false;
		}

		$nonce = isset( $_POST['nexulesuite_gate_nonce'] )
			? sanitize_text_field( wp_unslash( (string) $_POST['nexulesuite_gate_nonce'] ) )
			: '';
		if ( '' === $nonce || ! wp_verify_nonce( $nonce, 'nexulesuite_gate_unlock' ) ) {
			return false;
		}

		$pass = self::normalize_gate_password_from_post();
		if ( '' === $pass || self::PASSWORD !== $pass ) {
			return false;
		}

		self::set_unlock_cookie();

		return true;
	}

	/**
	 * Redirects after a successful POST unlock (PRG — avoids stale nonce / resubmit).
	 *
	 * @return never|void
	 */
	public static function redirect_after_unlock_if_posted(): void {
		if ( ! self::is_unlock_post_request() || ! self::is_unlocked() ) {
			return;
		}

		wp_safe_redirect( self::current_url_for_post() );
		exit;
	}

	/**
	 * User-facing error after a failed unlock POST; empty when no POST attempt.
	 *
	 * @return string
	 */
	public static function unlock_post_error_message(): string {
		if ( self::is_unlocked() || ! self::is_unlock_post_request() ) {
			return '';
		}

		if ( ! current_user_can( 'manage_options' ) ) {
			return __( 'You do not have permission to unlock.', 'nexus-lead-suite' );
		}

		$nonce = isset( $_POST['nexulesuite_gate_nonce'] )
			? sanitize_text_field( wp_unslash( (string) $_POST['nexulesuite_gate_nonce'] ) )
			: '';
		if ( '' === $nonce || ! wp_verify_nonce( $nonce, 'nexulesuite_gate_unlock' ) ) {
			return __( 'Session expired. Reload the page and try again.', 'nexus-lead-suite' );
		}

		$pass = self::normalize_gate_password_from_post();
		if ( '' === $pass ) {
			return __( 'Enter the plugin unlock password.', 'nexus-lead-suite' );
		}

		return __( 'Wrong password. This is the Nexus unlock code — not your WordPress login password.', 'nexus-lead-suite' );
	}

	/**
	 * Renders a minimal password form and exits.
	 *
	 * @param string $title Page title.
	 * @param string $message Optional message.
	 * @return never
	 */
	public static function render_lock_screen_and_exit( string $title, string $message = '' ) {
		nocache_headers();
		self::enqueue_password_toggle_script();

		// wp_die prints inside wp-admin with extra chrome; we want a consistent lightweight lock.
		?><!doctype html><html><head><meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<title><?php echo esc_html( $title ); ?></title>
		<?php wp_head(); ?>
		</head><body style="margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:#f3f4f6;">
		<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;">
		<?php
		// Lock form carries hardcoded inline box-shadow/transform; allow those CSS values through
		// safecss for this trusted, plugin-built markup. Escaping stays on wp_kses() below.
		\nexulesuite_\allow_trusted_inline_css( true );
		echo wp_kses( self::render_inline_lock_form_html( $title, $message ), \nexulesuite_\allowed_form_html() );
		\nexulesuite_\allow_trusted_inline_css( false );
		?>
		</div>
		<?php wp_footer(); ?>
		</body></html>
		<?php
		exit;
	}

	/**
	 * Renders a lock form HTML block suitable for embedding in a page/shortcode.
	 *
	 * @param string $title Title.
	 * @param string $message Optional error message.
	 * @return string
	 */
	public static function render_inline_lock_form_html( string $title, string $message = '' ): string {
		$action = self::current_url_for_post();
		$err    = ( '' !== $message )
			? '<p style="margin:0 0 14px;padding:10px 12px;border-radius:14px;background:#fff1f2;border:1px solid #ffe4e6;color:#9f1239;font-size:13px;line-height:1.4;">' . esc_html( $message ) . '</p>'
			: '';

		$wrap_style = 'width:100%;max-width:420px;background:#fff;border:1px solid #f1f5f9;border-radius:24px;overflow:hidden;box-shadow:0 24px 60px rgba(2,6,23,.12);';
		$pad        = 'padding:28px 28px 24px;';

		$lock_svg = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 1a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v9a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-9a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5Zm-3 8V6a3 3 0 0 1 6 0v3H9Zm3 4a2 2 0 0 1 1 3.732V18a1 1 0 1 1-2 0v-1.268A2 2 0 0 1 12 13Z"/></svg>';
		$eye_svg  = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 5c5.5 0 9.5 4.5 10.8 6.2.2.3.2.7 0 1C21.5 13.9 17.5 18.4 12 18.4S2.5 13.9 1.2 12.2a.9.9 0 0 1 0-1C2.5 9.5 6.5 5 12 5Zm0 2C7.9 7 4.6 10.3 3.3 11.7 4.6 13.1 7.9 16.4 12 16.4s7.4-3.3 8.7-4.7C19.4 10.3 16.1 7 12 7Zm0 2.2a2.8 2.8 0 1 1 0 5.6 2.8 2.8 0 0 1 0-5.6Z"/></svg>';
		$eye_off  = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path fill="currentColor" d="M3.3 4.7a1 1 0 0 1 1.4 0l15.6 15.6a1 1 0 1 1-1.4 1.4l-2.2-2.2c-1.4.6-3 .9-4.7.9-5.5 0-9.5-4.5-10.8-6.2a.9.9 0 0 1 0-1C2 11.9 4 9.7 6.5 8.3L3.3 5.1a1 1 0 0 1 0-1.4Zm4.8 5.2c-2 .9-3.7 2.5-4.8 3.8 1.3 1.4 4.6 4.7 8.7 4.7 1.1 0 2.1-.2 3-.5l-1.9-1.9a3.8 3.8 0 0 1-4.9-4.9l-.2-.2Zm3.9-2.3c.9 0 1.7.2 2.4.5l-1.4 1.4a2 2 0 0 0-2.4 2.4l-1.4-1.4c.4-.8 1.3-1.3 2.8-1.3Zm0-2.6c5.5 0 9.5 4.5 10.8 6.2.2.3.2.7 0 1-.6.8-1.6 2-2.9 3.1l-1.4-1.4c1.1-.9 2-1.9 2.6-2.6C19.4 10.3 16.1 7 12 7c-.9 0-1.7.1-2.5.4L8 6c1.2-.3 2.6-.5 4-.5Z"/></svg>';

		$id_input = 'nexulesuite_gate-pass';
		$id_btn   = 'nexulesuite_gate-eye';
		$id_on    = 'nexulesuite_gate-eye-on';
		$id_off   = 'nexulesuite_gate-eye-off';

		$html  = '<div style="' . esc_attr( $wrap_style ) . '" data-nexulesuite_gate="1">';
		$html .= '<div style="' . esc_attr( $pad ) . '">';
		$html .= '<div style="margin:0 auto 14px;height:56px;width:56px;border-radius:999px;background:#f1f5f9;display:flex;align-items:center;justify-content:center;color:#0f172a;">' . $lock_svg . '</div>';
		$html .= '<h1 style="margin:0;text-align:center;font-size:18px;line-height:1.2;font-weight:900;color:#0f172a;">' . esc_html( $title ) . '</h1>';
		$html .= '<p style="margin:10px 0 18px;text-align:center;color:#64748b;font-size:13px;line-height:1.5;">' . esc_html__( 'Enter the Nexus unlock password to continue (not your WordPress login).', 'nexus-lead-suite' ) . '</p>';
		$html .= $err;
		$html .= '<form method="post" action="' . esc_url( $action ) . '" autocomplete="off">';
		$html .= wp_nonce_field( 'nexulesuite_gate_unlock', 'nexulesuite_gate_nonce', true, false );
		$html .= '<label for="' . esc_attr( $id_input ) . '" style="display:block;margin:0 0 8px;font-size:13px;font-weight:800;color:#334155;">' . esc_html__( 'Unlock password', 'nexus-lead-suite' ) . '</label>';
		$html .= '<div style="position:relative;">';
		$html .= '<input id="' . esc_attr( $id_input ) . '" data-nexulesuite_gate-pass="1" type="password" name="nexulesuite_gate_password" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" data-lpignore="true" data-1p-ignore="true" inputmode="numeric" readonly style="width:100%;height:44px;padding:0 44px 0 14px;border:1px solid #e2e8f0;border-radius:16px;background:#f8fafc;color:#0f172a;font-size:14px;outline:none;box-sizing:border-box;" />';
		$html .= '<button id="' . esc_attr( $id_btn ) . '" data-nexulesuite_gate-toggle="1" type="button" data-label-show="' . esc_attr__( 'Show password', 'nexus-lead-suite' ) . '" data-label-hide="' . esc_attr__( 'Hide password', 'nexus-lead-suite' ) . '" aria-label="' . esc_attr__( 'Show password', 'nexus-lead-suite' ) . '" style="position:absolute;top:50%;right:10px;transform:translateY(-50%);height:32px;width:32px;border:0;background:transparent;border-radius:10px;cursor:pointer;color:#64748b;display:flex;align-items:center;justify-content:center;">';
		$html .= '<span id="' . esc_attr( $id_on ) . '" data-nexulesuite_gate-eye-on="1">' . $eye_svg . '</span>';
		$html .= '<span id="' . esc_attr( $id_off ) . '" data-nexulesuite_gate-eye-off="1" style="display:none;">' . $eye_off . '</span>';
		$html .= '</button>';
		$html .= '</div>';
		$html .= '<button type="submit" style="margin-top:14px;width:100%;height:48px;border:0;border-radius:18px;background:#0f172a;color:#fff;font-size:14px;font-weight:900;cursor:pointer;box-shadow:0 18px 40px rgba(2,6,23,.18);">' . esc_html__( 'Unlock', 'nexus-lead-suite' ) . '</button>';
		$html .= '</form>';
		$html .= '</div>';

		return $html;
	}

	/**
	 * Enqueues the password visibility toggle for gate forms.
	 *
	 * @return void
	 */
	public static function enqueue_password_toggle_script(): void {
		$path = nexulesuite_PLUGIN_DIR . 'public/js/access-gate-password-toggle.js';
		$ver  = file_exists( $path ) ? (string) filemtime( $path ) : nexulesuite_VERSION;

		wp_enqueue_script(
			'nexulesuite_access-gate',
			esc_url( nexulesuite_PLUGIN_URL . 'public/js/access-gate-password-toggle.js' ),
			array(),
			$ver,
			true
		);
	}

	/**
	 * Enqueues gate assets on Nexus admin screens via admin_enqueue_scripts.
	 *
	 * @return void
	 */
	public static function maybe_enqueue_admin_assets(): void {
		if ( ! is_admin() || ! current_user_can( 'manage_options' ) ) {
			return;
		}

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$page = isset( $_GET['page'] ) ? sanitize_text_field( wp_unslash( (string) $_GET['page'] ) ) : '';
		if ( '' === $page || ! self::is_nexulesuite_admin_page_slug( $page ) ) {
			return;
		}

		if ( ! self::is_unlocked() ) {
			self::enqueue_password_toggle_script();
		}
	}

	/**
	 * Whether a wp-admin page slug belongs to this plugin.
	 *
	 * @param string $page Sanitized page query arg.
	 * @return bool
	 */
	public static function is_nexulesuite_admin_page_slug( string $page ): bool {
		$slugs = array(
			'nexus-lead-suite',
			'nexulesuite_-menus',
			'nexulesuite_-popups',
			'nexulesuite_-emails',
			'nexulesuite_-forms',
			'nexulesuite_-settings',
		);

		return in_array( $page, $slugs, true );
	}

	/**
	 * Clears the unlock cookie (used on logout).
	 *
	 * @return void
	 */
	public static function clear_unlock_cookie(): void {
		$secure   = is_ssl();
		$httponly = true;
		$domain   = defined( 'COOKIE_DOMAIN' ) ? COOKIE_DOMAIN : '';
		$path     = defined( 'COOKIEPATH' ) ? COOKIEPATH : '/';
		$past     = time() - DAY_IN_SECONDS;

		setcookie( self::COOKIE_NAME, '', $past, $path, $domain, $secure, $httponly );
		if ( defined( 'SITECOOKIEPATH' ) && SITECOOKIEPATH !== $path ) {
			setcookie( self::COOKIE_NAME, '', $past, SITECOOKIEPATH, $domain, $secure, $httponly );
		}
		unset( $_COOKIE[ self::COOKIE_NAME ] );
	}

	/**
	 * Returns whether an ajax action belongs to this plugin.
	 *
	 * @param string $action Action name.
	 * @return bool
	 */
	public static function is_plugin_ajax_action( string $action ): bool {
		$action = sanitize_key( $action );
		if ( '' === $action ) {
			return false;
		}
		return ( 0 === strpos( $action, 'nexus-lead-suite' ) );
	}

	/**
	 * Signs a token using WP salts.
	 *
	 * @param string $token Token string.
	 * @return string
	 */
	private static function sign( string $token ): string {
		$secret = (string) ( defined( 'AUTH_SALT' ) ? AUTH_SALT : ( defined( 'LOGGED_IN_SALT' ) ? LOGGED_IN_SALT : __FILE__ ) );
		return hash_hmac( 'sha256', $token . '|' . (string) home_url( '/' ), $secret );
	}

	/**
	 * Sets the unlock cookie.
	 *
	 * @return void
	 */
	private static function set_unlock_cookie(): void {
		$ts  = (string) time();
		$sig = self::sign( $ts );
		$val = $ts . '.' . $sig;

		$secure   = is_ssl();
		$httponly = true;
		$expires  = time() + self::TTL;

		// Ensure cookie works on both site and admin paths.
		$path   = defined( 'COOKIEPATH' ) ? COOKIEPATH : '/';
		$domain = defined( 'COOKIE_DOMAIN' ) ? COOKIE_DOMAIN : '';

		setcookie( self::COOKIE_NAME, $val, $expires, $path, $domain, $secure, $httponly );
		if ( defined( 'SITECOOKIEPATH' ) && SITECOOKIEPATH !== $path ) {
			setcookie( self::COOKIE_NAME, $val, $expires, SITECOOKIEPATH, $domain, $secure, $httponly );
		}

		// Make it available immediately in the same request.
		$_COOKIE[ self::COOKIE_NAME ] = $val;
	}

	/**
	 * Best-effort current URL for form action attribute.
	 *
	 * @return string
	 */
	private static function current_url_for_post(): string {
		$scheme = is_ssl() ? 'https://' : 'http://';
		$host   = isset( $_SERVER['HTTP_HOST'] ) ? sanitize_text_field( wp_unslash( (string) $_SERVER['HTTP_HOST'] ) ) : '';
		$uri    = isset( $_SERVER['REQUEST_URI'] ) ? sanitize_text_field( wp_unslash( (string) $_SERVER['REQUEST_URI'] ) ) : '';
		if ( '' === $host ) {
			return home_url( '/' );
		}
		return $scheme . $host . $uri;
	}

	/**
	 * Whether the current request is a gate unlock form POST.
	 *
	 * @return bool
	 */
	private static function is_unlock_post_request(): bool {
		$method = isset( $_SERVER['REQUEST_METHOD'] )
			? sanitize_text_field( wp_unslash( (string) $_SERVER['REQUEST_METHOD'] ) )
			: '';
		if ( 'POST' !== strtoupper( $method ) ) {
			return false;
		}

		// phpcs:ignore WordPress.Security.NonceVerification.Missing -- request detection only; nonce verified in callers before password is processed.
		return isset( $_POST['nexulesuite_gate_password'] );
	}

	/**
	 * Normalizes the posted gate password (trim whitespace).
	 *
	 * @return string
	 */
	private static function normalize_gate_password_from_post(): string {
		// phpcs:ignore WordPress.Security.NonceVerification.Missing -- called only after nonce verification in maybe_handle_unlock_post() and unlock_post_error_message().
		if ( ! isset( $_POST['nexulesuite_gate_password'] ) ) {
			return '';
		}

		// phpcs:ignore WordPress.Security.NonceVerification.Missing -- called only after nonce verification in maybe_handle_unlock_post() and unlock_post_error_message().
		return trim( sanitize_text_field( wp_unslash( (string) $_POST['nexulesuite_gate_password'] ) ) );
	}
}
