<?php
/**
 * SMTP mailer integration for wp_mail() (optional).
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
 * Configures PHPMailer to use SMTP when enabled.
 */
final class Mailer {

	/**
	 * Option key for SMTP settings.
	 */
	public const OPTION_KEY = 'nexus_ls_smtp_settings';

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
			'enabled'    => ! empty( $opt['enabled'] ),
			'host'       => isset( $opt['host'] ) ? (string) $opt['host'] : '',
			'port'       => isset( $opt['port'] ) ? (int) $opt['port'] : 587,
			'secure'     => isset( $opt['secure'] ) ? (string) $opt['secure'] : 'tls',
			'username'   => isset( $opt['username'] ) ? (string) $opt['username'] : '',
			'password'   => isset( $opt['password'] ) ? (string) $opt['password'] : '',
			'from_email' => isset( $opt['from_email'] ) ? (string) $opt['from_email'] : '',
			'from_name'  => isset( $opt['from_name'] ) ? (string) $opt['from_name'] : '',
		);

		if ( defined( 'NEXUS_LS_SMTP_ENABLED' ) ) {
			$settings['enabled'] = (bool) NEXUS_LS_SMTP_ENABLED;
		}
		if ( defined( 'NEXUS_LS_SMTP_HOST' ) ) {
			$settings['host'] = (string) NEXUS_LS_SMTP_HOST;
		}
		if ( defined( 'NEXUS_LS_SMTP_PORT' ) ) {
			$settings['port'] = (int) NEXUS_LS_SMTP_PORT;
		}
		if ( defined( 'NEXUS_LS_SMTP_SECURE' ) ) {
			$settings['secure'] = (string) NEXUS_LS_SMTP_SECURE;
		}
		if ( defined( 'NEXUS_LS_SMTP_USER' ) ) {
			$settings['username'] = (string) NEXUS_LS_SMTP_USER;
		}
		if ( defined( 'NEXUS_LS_SMTP_PASS' ) ) {
			$settings['password'] = (string) NEXUS_LS_SMTP_PASS;
		}
		if ( defined( 'NEXUS_LS_SMTP_FROM_EMAIL' ) ) {
			$settings['from_email'] = (string) NEXUS_LS_SMTP_FROM_EMAIL;
		}
		if ( defined( 'NEXUS_LS_SMTP_FROM_NAME' ) ) {
			$settings['from_name'] = (string) NEXUS_LS_SMTP_FROM_NAME;
		}

		$settings['host']       = sanitize_text_field( $settings['host'] );
		$settings['secure']    = sanitize_text_field( $settings['secure'] );
		$settings['username']  = sanitize_text_field( $settings['username'] );
		$settings['from_email'] = sanitize_email( $settings['from_email'] );
		$settings['from_name']  = sanitize_text_field( $settings['from_name'] );

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

		$fn = isset( $settings['from_name'] ) ? trim( (string) $settings['from_name'] ) : '';
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

		return '';
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

		try {
			$phpmailer->isSMTP();
			$phpmailer->Host       = (string) $settings['host'];
			$phpmailer->Port       = (int) $settings['port'];
			$phpmailer->SMTPAuth   = ! empty( $settings['username'] ) && ! empty( $settings['password'] );
			$phpmailer->Username   = (string) ( $settings['username'] ?? '' );
			$phpmailer->Password   = (string) ( $settings['password'] ?? '' );
			$phpmailer->SMTPSecure = (string) ( $settings['secure'] ?? '' );

			$phpmailer->CharSet     = 'UTF-8';
			$phpmailer->Timeout    = 30;
			$phpmailer->SMTPAutoTLS = ( 'ssl' !== strtolower( (string) ( $settings['secure'] ?? '' ) ) );

			$from_email = self::resolve_from_email( $settings );
			$from_name  = isset( $settings['from_name'] ) ? trim( (string) $settings['from_name'] ) : '';

			if ( '' !== $from_email && is_email( $from_email ) ) {
				$phpmailer->setFrom( $from_email, $from_name !== '' ? $from_name : get_bloginfo( 'name' ), false );
			}
		} catch ( \Throwable $e ) {
			try {
				$phpmailer->isMail();
			} catch ( \Throwable $inner ) {
				unset( $inner );
			}
		}
	}
}
