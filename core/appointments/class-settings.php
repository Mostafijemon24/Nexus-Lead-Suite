<?php
/**
 * Appointment module settings (option-backed).
 *
 * @package nexulesuite_
 */

declare(strict_types=1);

namespace nexulesuite_\Appointments;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Reads and writes the module settings with defaults.
 */
final class Settings {

	public const OPTION = 'nexulesuite_appointments_settings_v1';

	/** Pages created on activation; key => shortcode. */
	public const PAGES = array(
		'doctors'       => '[nexulesuite_doctors]',
		'doctor'        => '[nexulesuite_doctor]',
		'departments'   => '[nexulesuite_departments]',
		'department'    => '[nexulesuite_department]',
		'booking'       => '[nexulesuite_appointment]',
		'auth'          => '[nexulesuite_auth]',
		'patient_panel' => '[nexulesuite_patient_panel]',
		'doctor_panel'  => '[nexulesuite_doctor_panel]',
	);

	/**
	 * Defaults.
	 *
	 * @return array<string,mixed>
	 */
	public static function defaults(): array {
		return array(
			'slotMinutes'              => 30,
			'bookingWindowDays'        => 30,
			'leadTimeMinutes'          => 60,
			'cancelLeadMinutes'        => 120,
			'currency'                 => 'USD',
			'currencySymbol'           => '$',
			'requireEmailVerification' => true,
			'perPage'                  => 12,
			'pages'                    => array(),
		);
	}

	/**
	 * Current settings merged with defaults.
	 *
	 * @return array<string,mixed>
	 */
	public static function get(): array {
		$stored = get_option( self::OPTION, array() );
		if ( ! is_array( $stored ) ) {
			$stored = array();
		}

		$merged = array_merge( self::defaults(), $stored );
		if ( ! is_array( $merged['pages'] ) ) {
			$merged['pages'] = array();
		}

		return $merged;
	}

	/**
	 * Sanitizes and saves a partial settings payload. Returns the saved settings.
	 *
	 * @param array<string,mixed> $input Raw input (camelCase keys).
	 * @return array<string,mixed>
	 */
	public static function save( array $input ): array {
		$current = self::get();

		if ( isset( $input['slotMinutes'] ) ) {
			$current['slotMinutes'] = max( 5, min( 240, (int) $input['slotMinutes'] ) );
		}
		if ( isset( $input['bookingWindowDays'] ) ) {
			$current['bookingWindowDays'] = max( 1, min( 365, (int) $input['bookingWindowDays'] ) );
		}
		if ( isset( $input['leadTimeMinutes'] ) ) {
			$current['leadTimeMinutes'] = max( 0, min( 10080, (int) $input['leadTimeMinutes'] ) );
		}
		if ( isset( $input['cancelLeadMinutes'] ) ) {
			$current['cancelLeadMinutes'] = max( 0, min( 10080, (int) $input['cancelLeadMinutes'] ) );
		}
		if ( isset( $input['currency'] ) ) {
			$cur = strtoupper( preg_replace( '/[^A-Za-z]/', '', (string) $input['currency'] ) );
			$current['currency'] = '' === $cur ? 'USD' : substr( $cur, 0, 3 );
		}
		if ( isset( $input['currencySymbol'] ) ) {
			$current['currencySymbol'] = substr( sanitize_text_field( (string) $input['currencySymbol'] ), 0, 5 );
		}
		if ( isset( $input['requireEmailVerification'] ) ) {
			$current['requireEmailVerification'] = (bool) $input['requireEmailVerification'];
		}
		if ( isset( $input['perPage'] ) ) {
			$current['perPage'] = max( 1, min( 100, (int) $input['perPage'] ) );
		}
		if ( isset( $input['pages'] ) && is_array( $input['pages'] ) ) {
			$pages = array();
			foreach ( self::PAGES as $key => $_sc ) {
				if ( isset( $input['pages'][ $key ] ) ) {
					$pages[ $key ] = absint( $input['pages'][ $key ] );
				} elseif ( isset( $current['pages'][ $key ] ) ) {
					$pages[ $key ] = (int) $current['pages'][ $key ];
				}
			}
			$current['pages'] = $pages;
		}

		update_option( self::OPTION, $current, false );

		return $current;
	}

	/**
	 * Page id configured for a key (0 when unset).
	 *
	 * @param string $key Page key.
	 * @return int
	 */
	public static function page_id( string $key ): int {
		$s = self::get();

		return isset( $s['pages'][ $key ] ) ? (int) $s['pages'][ $key ] : 0;
	}

	/**
	 * Formats a fee with the configured symbol.
	 *
	 * @param float $amount Amount.
	 * @return string
	 */
	public static function format_money( float $amount ): string {
		$s = self::get();

		return $s['currencySymbol'] . number_format( $amount, 2, '.', ',' );
	}
}
