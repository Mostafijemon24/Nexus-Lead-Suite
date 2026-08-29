<?php
/**
 * SMTP mailer integration for wp_mail() (optional).
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
 * Configures PHPMailer to use SMTP when enabled.
 */
final class Mailer {

	/**
	 * Option key for SMTP settings.
	 */
	public const OPTION_KEY = 'nexulesuite_smtp_settings';

	/**
	 * Registers hooks.
	 *
	 * @return void
	 */
	public function register_hooks(): void {
		add_action( 'phpmailer_init', array( $this, 'configure_phpmailer' ) );
		add_filter( 'wp_mail_from', array( $this, 'filter_wp_mail_from' ), 998 );
		add_filter( 'wp_mail_from_name', array( $this, 'filter_wp_mail_from_name' ), 998 );
	}

	/**
	 * Prefix marking an AES-256-GCM encrypted secret produced by {@see encrypt_secret()}.
	 */
	private const SECRET_PREFIX = 'enc:v1:';

	/**
	 * Derives a 32-byte encryption key from the site's auth salt.
	 *
	 * The key never leaves the server and rotates automatically if the salts in
	 * wp-config.php change (which invalidates any stored secret — expected).
	 *
	 * @return string Raw 32-byte key.
	 */
	private static function secret_key(): string {
		return hash( 'sha256', wp_salt( 'auth' ), true );
	}

	/**
	 * Encrypts a secret (e.g. SMTP password) for at-rest storage.
	 *
	 * Falls back to returning the plaintext unchanged when OpenSSL is unavailable,
	 * so mail delivery keeps working on minimal hosts.
	 *
	 * @param string $plain Plaintext secret.
	 * @return string Encrypted, prefixed token — or the original string on fallback.
	 */
	public static function encrypt_secret( string $plain ): string {
		if ( '' === $plain ) {
			return '';
		}
		if ( ! function_exists( 'openssl_encrypt' ) || ! function_exists( 'openssl_random_pseudo_bytes' ) ) {
			return $plain;
		}

		$iv  = openssl_random_pseudo_bytes( 12 );
		$tag = '';
		$cipher = openssl_encrypt( $plain, 'aes-256-gcm', self::secret_key(), OPENSSL_RAW_DATA, $iv, $tag );
		if ( false === $cipher || '' === $tag ) {
			return $plain;
		}

		return self::SECRET_PREFIX . base64_encode( $iv . $tag . $cipher );
	}

	/**
	 * Decrypts a secret previously stored with {@see encrypt_secret()}.
	 *
	 * Values without the encryption prefix (legacy plaintext, or secrets defined
	 * via constants) are returned unchanged.
	 *
	 * @param string $stored Stored value.
	 * @return string Plaintext secret ('' if decryption fails).
	 */
	public static function decrypt_secret( string $stored ): string {
		if ( '' === $stored || 0 !== strpos( $stored, self::SECRET_PREFIX ) ) {
			return $stored;
		}
		if ( ! function_exists( 'openssl_decrypt' ) ) {
			return '';
		}

		$raw = base64_decode( substr( $stored, strlen( self::SECRET_PREFIX ) ), true );
		if ( false === $raw || strlen( $raw ) < 29 ) {
			return '';
		}

		$iv     = substr( $raw, 0, 12 );
		$tag    = substr( $raw, 12, 16 );
		$cipher = substr( $raw, 28 );
		$plain  = openssl_decrypt( $cipher, 'aes-256-gcm', self::secret_key(), OPENSSL_RAW_DATA, $iv, $tag );

		return false === $plain ? '' : $plain;
	}

	/**
	 * Provider presets that map a mailer id to its official SMTP relay endpoint.
	 *
	 * Selecting one of these auto-configures host/port/encryption; the admin only
	 * supplies the account email (username) and an App Password. This keeps the
	 * plugin lightweight — every provider reuses the same PHPMailer SMTP path.
	 *
	 * @return array<string,array<string,mixed>>
	 */
	public static function mailer_presets(): array {
		return array(
			'gmail'   => array(
				/*
				 * Prefer 587/TLS — many shared hosts block outbound 465/SSL while
				 * still allowing submission on 587.
				 */
				'host'   => 'smtp.gmail.com',
				'port'   => 587,
				'secure' => 'tls',
			),
			'outlook' => array(
				'host'   => 'smtp.office365.com',
				'port'   => 587,
				'secure' => 'tls',
			),
		);
	}

	/**
	 * Reads SMTP settings (constants override options).
	 *
	 * @return array<string,mixed>
	 */
	public static function get_effective_settings(): array {
		$opt = get_option( self::OPTION_KEY, array() );
		if ( ! is_array( $opt ) ) {
			$opt = array();
		}

		$settings = array(
			'enabled'         => ! empty( $opt['enabled'] ),
			'mailer'          => isset( $opt['mailer'] ) ? (string) $opt['mailer'] : 'other',
			'host'            => isset( $opt['host'] ) ? (string) $opt['host'] : '',
			'port'            => isset( $opt['port'] ) ? (int) $opt['port'] : 587,
			'secure'          => isset( $opt['secure'] ) ? (string) $opt['secure'] : 'tls',
			'username'        => isset( $opt['username'] ) ? (string) $opt['username'] : '',
			'password'        => isset( $opt['password'] ) ? self::decrypt_secret( (string) $opt['password'] ) : '',
			'from_email'      => isset( $opt['from_email'] ) ? (string) $opt['from_email'] : '',
			'from_name'       => isset( $opt['from_name'] ) ? (string) $opt['from_name'] : '',
			'force_from_name' => ! empty( $opt['force_from_name'] ),
			'oauth_email'     => isset( $opt['oauth_email'] ) ? (string) $opt['oauth_email'] : '',
			// Must decrypt successfully — a non-empty ciphertext after salt rotation still looks "connected".
			'oauth_connected' => '' !== self::decrypt_secret( (string) ( $opt['oauth_refresh_token'] ?? '' ) ),
		);

		// Provider preset (Gmail / Outlook): auto-configure the SMTP relay host/port/encryption.
		// Applied before constants so a wp-config.php override still wins.
		$presets = self::mailer_presets();
		if ( isset( $presets[ $settings['mailer'] ] ) ) {
			$settings['host']   = $presets[ $settings['mailer'] ]['host'];
			$settings['port']   = $presets[ $settings['mailer'] ]['port'];
			$settings['secure'] = $presets[ $settings['mailer'] ]['secure'];
		}

		if ( defined( 'nexulesuite_SMTP_ENABLED' ) ) {
			$settings['enabled'] = (bool) nexulesuite_SMTP_ENABLED;
		}
		if ( defined( 'nexulesuite_SMTP_HOST' ) ) {
			$settings['host'] = (string) nexulesuite_SMTP_HOST;
		}
		if ( defined( 'nexulesuite_SMTP_PORT' ) ) {
			$settings['port'] = (int) nexulesuite_SMTP_PORT;
		}
		if ( defined( 'nexulesuite_SMTP_SECURE' ) ) {
			$settings['secure'] = (string) nexulesuite_SMTP_SECURE;
		}
		if ( defined( 'nexulesuite_SMTP_USER' ) ) {
			$settings['username'] = (string) nexulesuite_SMTP_USER;
		}
		if ( defined( 'nexulesuite_SMTP_PASS' ) ) {
			$settings['password'] = (string) nexulesuite_SMTP_PASS;
		}
		if ( defined( 'nexulesuite_SMTP_FROM_EMAIL' ) ) {
			$settings['from_email'] = (string) nexulesuite_SMTP_FROM_EMAIL;
		}
		if ( defined( 'nexulesuite_SMTP_FROM_NAME' ) ) {
			$settings['from_name'] = (string) nexulesuite_SMTP_FROM_NAME;
		}

		$settings['host']       = sanitize_text_field( $settings['host'] );
		$settings['secure']    = sanitize_text_field( $settings['secure'] );
		$settings['username']  = sanitize_text_field( $settings['username'] );
		$settings['from_email'] = sanitize_email( $settings['from_email'] );
		$settings['from_name']  = sanitize_text_field( $settings['from_name'] );
		$settings['oauth_email'] = sanitize_email( $settings['oauth_email'] );

		$allowed_secure = array( '', 'tls', 'ssl' );
		if ( ! in_array( $settings['secure'], $allowed_secure, true ) ) {
			$settings['secure'] = 'tls';
		}

		if ( $settings['port'] <= 0 || $settings['port'] > 65535 ) {
			$settings['port'] = 587;
		}

		return $settings;
	}

	/**
	 * Must accept mixed: other filters may pass non-strings; strict `string` hints cause TypeError → HTTP 500.
	 *
	 * @param mixed $from Default from WordPress.
	 * @return string
	 */
	public function filter_wp_mail_from( $from ): string {
		$from = is_string( $from ) ? $from : '';
		$settings = self::get_effective_settings();
		if ( empty( $settings['enabled'] ) || empty( $settings['host'] ) ) {
			return $from;
		}

		// Gmail/Outlook selected but not authorized — do not rewrite From while still using PHP mail().
		$mailer = (string) ( $settings['mailer'] ?? 'other' );
		if ( self::is_oauth_mailer( $mailer ) && empty( $settings['oauth_connected'] ) ) {
			return $from;
		}

		$candidate = self::resolve_from_email( $settings );
		if ( '' !== $candidate && is_email( $candidate ) ) {
			return $candidate;
		}

		return $from;
	}

	/**
	 * @param mixed $name Default name from WordPress.
	 * @return string
	 */
	public function filter_wp_mail_from_name( $name ): string {
		$name = is_string( $name ) ? $name : '';
		$settings = self::get_effective_settings();
		if ( empty( $settings['enabled'] ) || empty( $settings['host'] ) ) {
			return $name;
		}

		$mailer = (string) ( $settings['mailer'] ?? 'other' );
		if ( self::is_oauth_mailer( $mailer ) && empty( $settings['oauth_connected'] ) ) {
			return $name;
		}

		$fn = isset( $settings['from_name'] ) ? trim( (string) $settings['from_name'] ) : '';

		// When "Force From Name" is off, keep a name supplied by the caller (theme /
		// other plugin) and only fall back to our configured name when none is set.
		if ( empty( $settings['force_from_name'] ) && '' !== $name ) {
			return $name;
		}

		if ( '' !== $fn ) {
			return $fn;
		}

		return $name;
	}

	/**
	 * @param array<string,mixed> $settings Effective settings.
	 */
	private static function resolve_from_email( array $settings ): string {
		$from_email = isset( $settings['from_email'] ) ? trim( (string) $settings['from_email'] ) : '';
		if ( '' !== $from_email && is_email( $from_email ) ) {
			return $from_email;
		}

		$user = isset( $settings['username'] ) ? trim( (string) $settings['username'] ) : '';
		if ( '' !== $user && is_email( $user ) ) {
			return $user;
		}

		$oauth = isset( $settings['oauth_email'] ) ? trim( (string) $settings['oauth_email'] ) : '';
		if ( '' !== $oauth && is_email( $oauth ) ) {
			return $oauth;
		}

		return '';
	}

	/**
	 * @param string $mailer Mailer id (kept in sync with Smtp_OAuth::providers()).
	 * @return bool
	 */
	private static function is_oauth_mailer( string $mailer ): bool {
		return 'gmail' === $mailer || 'outlook' === $mailer;
	}

	/**
	 * Builds the XOAUTH2 token provider for a connected OAuth mailer.
	 *
	 * @param array<string,mixed> $settings Effective settings.
	 * @return \nexulesuite_\Smtp_XOAuth2_Provider|null Null when unavailable (old PHPMailer / no email).
	 */
	private static function make_oauth_provider( array $settings ) {
		require_once nexulesuite_PLUGIN_DIR . 'core/class-smtp-oauth.php';
		// Must load OAuthTokenProvider before the provider file (WP does not autoload it).
		require_once nexulesuite_PLUGIN_DIR . 'core/class-smtp-xoauth2-provider.php';
		if ( ! class_exists( '\\nexulesuite_\\Smtp_XOAuth2_Provider' ) ) {
			return null;
		}
		$email = '' !== (string) ( $settings['oauth_email'] ?? '' )
			? (string) $settings['oauth_email']
			: self::resolve_from_email( $settings );
		if ( '' === $email ) {
			return null;
		}
		return new Smtp_XOAuth2_Provider( $email );
	}

	/**
	 * Configure PHPMailer from constants or saved options.
	 *
	 * @param \PHPMailer\PHPMailer\PHPMailer $phpmailer PHPMailer instance.
	 * @return void
	 */
	public function configure_phpmailer( $phpmailer ): void {
		if ( ! $phpmailer instanceof \PHPMailer\PHPMailer\PHPMailer ) {
			return;
		}

		$settings = self::get_effective_settings();
		if ( empty( $settings['enabled'] ) ) {
			return;
		}

		if ( empty( $settings['host'] ) || empty( $settings['port'] ) ) {
			return;
		}

		$mailer      = (string) ( $settings['mailer'] ?? 'other' );
		$is_oauth    = self::is_oauth_mailer( $mailer );

		// OAuth mailers must be connected before we hijack delivery — otherwise fall
		// back to WordPress default so mail is not silently dropped.
		if ( $is_oauth && empty( $settings['oauth_connected'] ) ) {
			return;
		}

		try {
			$phpmailer->isSMTP();
			$phpmailer->Host       = (string) $settings['host'];
			$phpmailer->Port       = (int) $settings['port'];
			$phpmailer->SMTPSecure = (string) ( $settings['secure'] ?? '' );

			if ( $is_oauth ) {
				$provider = self::make_oauth_provider( $settings );
				if ( null === $provider ) {
					/*
					 * Never fall back to isMail()/mail() here. On many hosts mail() is disabled and
					 * PHPMailer then fatals as "Call to undefined function PHPMailer\PHPMailer\mail()".
					 * Keep SMTP mode so the send fails with a normal auth error instead.
					 * Do NOT set AuthType=XOAUTH2 without setOAuth() — PHPMailer then fails
					 * immediately with a misleading "Could not authenticate" + 221 quit.
					 */
					$phpmailer->SMTPAuth = true;
					$phpmailer->Password = '';
					return;
				}
				$oauth_email = '' !== (string) ( $settings['oauth_email'] ?? '' )
					? (string) $settings['oauth_email']
					: self::resolve_from_email( $settings );
				$phpmailer->SMTPAuth = true;
				$phpmailer->AuthType = 'XOAUTH2';
				$phpmailer->Username = $oauth_email;
				$phpmailer->Password = '';
				$phpmailer->setOAuth( $provider );
				// Gmail/Outlook reject mismatched From; pin to the authorized account.
				if ( '' !== $oauth_email && is_email( $oauth_email ) ) {
					$from_name = isset( $settings['from_name'] ) ? trim( (string) $settings['from_name'] ) : '';
					$phpmailer->setFrom( $oauth_email, $from_name !== '' ? $from_name : get_bloginfo( 'name' ), false );
				}
			} else {
				$phpmailer->SMTPAuth = ! empty( $settings['username'] ) && ! empty( $settings['password'] );
				$phpmailer->Username = (string) ( $settings['username'] ?? '' );
				$phpmailer->Password = (string) ( $settings['password'] ?? '' );
			}

			$phpmailer->CharSet     = 'UTF-8';
			$phpmailer->Timeout    = 30;
			$phpmailer->SMTPAutoTLS = ( 'ssl' !== strtolower( (string) ( $settings['secure'] ?? '' ) ) );

			if ( ! $is_oauth ) {
				$from_email = self::resolve_from_email( $settings );
				$from_name  = isset( $settings['from_name'] ) ? trim( (string) $settings['from_name'] ) : '';

				if ( '' !== $from_email && is_email( $from_email ) ) {
					$phpmailer->setFrom( $from_email, $from_name !== '' ? $from_name : get_bloginfo( 'name' ), false );
				}
			}
		} catch ( \Throwable $e ) {
			// Do not switch to mail() — same disabled-mail() fatal risk as above.
			unset( $e );
		}
	}
}
