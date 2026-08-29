<?php
/**
 * PHPMailer XOAUTH2 token provider backed by {@see Smtp_OAuth}.
 *
 * Loaded lazily from Mailer::configure_phpmailer() — only during phpmailer_init,
 * when PHPMailer itself is available. WordPress does not autoload
 * OAuthTokenProvider.php, so we require it explicitly before declaring this class.
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
 * Ensures PHPMailer's OAuthTokenProvider interface is loaded.
 *
 * wp_mail() loads PHPMailer.php + SMTP.php but not OAuthTokenProvider.php.
 * Without this, interface_exists() is false and this file previously returned
 * early — so setOAuth() never ran and SMTP auth failed with a bare
 * "Could not authenticate" followed by 221 closing connection.
 *
 * @return bool
 */
function ensure_phpmailer_oauth_interface(): bool {
	if ( interface_exists( '\\PHPMailer\\PHPMailer\\OAuthTokenProvider' ) ) {
		return true;
	}
	$path = ABSPATH . WPINC . '/PHPMailer/OAuthTokenProvider.php';
	if ( is_readable( $path ) ) {
		require_once $path;
	}
	return interface_exists( '\\PHPMailer\\PHPMailer\\OAuthTokenProvider' );
}

if ( ! ensure_phpmailer_oauth_interface() ) {
	return;
}

// Avoid redeclare if this file was first included before the interface existed
// (require_once would skip a second pass). Callers must load the interface first.
if ( class_exists( __NAMESPACE__ . '\\Smtp_XOAuth2_Provider', false ) ) {
	return;
}

require_once __DIR__ . '/class-smtp-oauth.php';

/**
 * Supplies the base64 XOAUTH2 auth string PHPMailer needs for SMTP authentication.
 */
final class Smtp_XOAuth2_Provider implements \PHPMailer\PHPMailer\OAuthTokenProvider {

	/**
	 * Authenticated account email.
	 *
	 * @var string
	 */
	private $email;

	/**
	 * @param string $email Account email address.
	 */
	public function __construct( string $email ) {
		$this->email = $email;
	}

	/**
	 * Builds "user=<email>\1auth=Bearer <token>\1\1" base64-encoded, refreshing the
	 * access token first when needed. Returns '' when no valid token is available,
	 * which makes SMTP auth fail loudly rather than sending unauthenticated.
	 *
	 * @return string
	 */
	public function getOauth64() {
		$token = Smtp_OAuth::get_access_token();
		if ( '' === $token || '' === $this->email ) {
			return '';
		}
		return base64_encode( 'user=' . $this->email . "\1" . 'auth=Bearer ' . $token . "\1\1" ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode
	}
}
