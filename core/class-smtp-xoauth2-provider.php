<?php
/**
 * PHPMailer XOAUTH2 token provider backed by {@see Smtp_OAuth}.
 *
 * Loaded lazily from Mailer::configure_phpmailer() — only during phpmailer_init,
 * when the PHPMailer OAuthTokenProvider interface is guaranteed to be available.
 * The guard `return` below keeps this file safe to include on very old cores.
 *
 * @package nexulesuite_
 */

declare(strict_types=1);

namespace nexulesuite_;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Only declare the class when PHPMailer's OAuth interface exists (PHPMailer 6.5+).
if ( ! interface_exists( '\\PHPMailer\\PHPMailer\\OAuthTokenProvider' ) ) {
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
