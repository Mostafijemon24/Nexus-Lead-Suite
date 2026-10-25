<?php
/**
 * Field validation helpers shared by the appointment stores and REST layer.
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
 * Collects field => message errors. Every check returns the sanitized value.
 */
final class Validator {

	/**
	 * Errors keyed by field.
	 *
	 * @var array<string,string>
	 */
	private $errors = array();

	/**
	 * Adds an error.
	 *
	 * @param string $field   Field key.
	 * @param string $message Message (already translated).
	 * @return void
	 */
	public function add( string $field, string $message ): void {
		if ( ! isset( $this->errors[ $field ] ) ) {
			$this->errors[ $field ] = $message;
		}
	}

	/**
	 * Whether any error was recorded.
	 *
	 * @return bool
	 */
	public function fails(): bool {
		return array() !== $this->errors;
	}

	/**
	 * @return array<string,string>
	 */
	public function errors(): array {
		return $this->errors;
	}

	/**
	 * Required trimmed text within a length range.
	 *
	 * @param array<string,mixed> $in    Input.
	 * @param string              $field Field.
	 * @param int                 $min   Min length.
	 * @param int                 $max   Max length.
	 * @param bool                $required Whether required.
	 * @return string
	 */
	public function text( array $in, string $field, int $min, int $max, bool $required = true ): string {
		$v = isset( $in[ $field ] ) && is_scalar( $in[ $field ] ) ? sanitize_text_field( (string) $in[ $field ] ) : '';
		$v = trim( $v );
		$len = function_exists( 'mb_strlen' ) ? mb_strlen( $v ) : strlen( $v );
		if ( '' === $v ) {
			if ( $required ) {
				$this->add( $field, __( 'This field is required.', 'nexus-lead-suite' ) );
			}
			return '';
		}
		if ( $len < $min ) {
			/* translators: %d: minimum length */
			$this->add( $field, sprintf( __( 'Must be at least %d characters.', 'nexus-lead-suite' ), $min ) );
		}
		if ( $len > $max ) {
			/* translators: %d: maximum length */
			$this->add( $field, sprintf( __( 'Must be at most %d characters.', 'nexus-lead-suite' ), $max ) );
			$v = function_exists( 'mb_substr' ) ? mb_substr( $v, 0, $max ) : substr( $v, 0, $max );
		}

		return $v;
	}

	/**
	 * Multi-line text (HTML stripped).
	 *
	 * @param array<string,mixed> $in    Input.
	 * @param string              $field Field.
	 * @param int                 $max   Max length.
	 * @return string
	 */
	public function textarea( array $in, string $field, int $max ): string {
		$v = isset( $in[ $field ] ) && is_scalar( $in[ $field ] ) ? (string) $in[ $field ] : '';
		$v = trim( wp_strip_all_tags( $v ) );
		$len = function_exists( 'mb_strlen' ) ? mb_strlen( $v ) : strlen( $v );
		if ( $len > $max ) {
			/* translators: %d: maximum length */
			$this->add( $field, sprintf( __( 'Must be at most %d characters.', 'nexus-lead-suite' ), $max ) );
			$v = function_exists( 'mb_substr' ) ? mb_substr( $v, 0, $max ) : substr( $v, 0, $max );
		}

		return $v;
	}

	/**
	 * E-mail address.
	 *
	 * @param array<string,mixed> $in       Input.
	 * @param string              $field    Field.
	 * @param bool                $required Required.
	 * @return string
	 */
	public function email( array $in, string $field, bool $required = true ): string {
		$v = isset( $in[ $field ] ) && is_scalar( $in[ $field ] ) ? sanitize_email( (string) $in[ $field ] ) : '';
		if ( '' === $v ) {
			if ( $required ) {
				$this->add( $field, __( 'A valid e-mail address is required.', 'nexus-lead-suite' ) );
			}
			return '';
		}
		if ( ! is_email( $v ) ) {
			$this->add( $field, __( 'Enter a valid e-mail address.', 'nexus-lead-suite' ) );
		}

		return strtolower( $v );
	}

	/**
	 * Integer in range.
	 *
	 * @param array<string,mixed> $in       Input.
	 * @param string              $field    Field.
	 * @param int                 $min      Min.
	 * @param int                 $max      Max.
	 * @param int                 $default  Default when missing.
	 * @param bool                $required Required.
	 * @return int
	 */
	public function int( array $in, string $field, int $min, int $max, int $default = 0, bool $required = false ): int {
		if ( ! isset( $in[ $field ] ) || '' === $in[ $field ] || null === $in[ $field ] ) {
			if ( $required ) {
				$this->add( $field, __( 'This field is required.', 'nexus-lead-suite' ) );
			}
			return $default;
		}
		if ( ! is_numeric( $in[ $field ] ) ) {
			$this->add( $field, __( 'Must be a number.', 'nexus-lead-suite' ) );
			return $default;
		}
		$v = (int) $in[ $field ];
		if ( $v < $min || $v > $max ) {
			/* translators: 1: min, 2: max */
			$this->add( $field, sprintf( __( 'Must be between %1$d and %2$d.', 'nexus-lead-suite' ), $min, $max ) );
			return max( $min, min( $max, $v ) );
		}

		return $v;
	}

	/**
	 * Money amount (>= 0, two decimals).
	 *
	 * @param array<string,mixed> $in      Input.
	 * @param string              $field   Field.
	 * @param float               $default Default.
	 * @return float
	 */
	public function money( array $in, string $field, float $default = 0.0 ): float {
		if ( ! isset( $in[ $field ] ) || '' === $in[ $field ] || null === $in[ $field ] ) {
			return $default;
		}
		if ( ! is_numeric( $in[ $field ] ) ) {
			$this->add( $field, __( 'Must be a number.', 'nexus-lead-suite' ) );
			return $default;
		}
		$v = round( (float) $in[ $field ], 2 );
		if ( $v < 0 || $v > 999999.99 ) {
			$this->add( $field, __( 'Must be between 0 and 999999.99.', 'nexus-lead-suite' ) );
			return $default;
		}

		return $v;
	}

	/**
	 * Status enum.
	 *
	 * @param array<string,mixed> $in      Input.
	 * @param string              $field   Field.
	 * @param array<int,string>   $allowed Allowed values.
	 * @param string              $default Default.
	 * @return string
	 */
	public function one_of( array $in, string $field, array $allowed, string $default ): string {
		if ( ! isset( $in[ $field ] ) || ! is_scalar( $in[ $field ] ) || '' === (string) $in[ $field ] ) {
			return $default;
		}
		$v = sanitize_key( (string) $in[ $field ] );
		if ( ! in_array( $v, $allowed, true ) ) {
			$this->add( $field, __( 'Invalid value.', 'nexus-lead-suite' ) );
			return $default;
		}

		return $v;
	}

	/**
	 * `Y-m-d` date string. Returns '' when missing/invalid.
	 *
	 * @param array<string,mixed> $in       Input.
	 * @param string              $field    Field.
	 * @param bool                $required Required.
	 * @return string
	 */
	public function date( array $in, string $field, bool $required = true ): string {
		$v = isset( $in[ $field ] ) && is_scalar( $in[ $field ] ) ? trim( (string) $in[ $field ] ) : '';
		if ( '' === $v ) {
			if ( $required ) {
				$this->add( $field, __( 'A date is required.', 'nexus-lead-suite' ) );
			}
			return '';
		}
		if ( ! self::is_valid_date( $v ) ) {
			$this->add( $field, __( 'Enter a date as YYYY-MM-DD.', 'nexus-lead-suite' ) );
			return '';
		}

		return $v;
	}

	/**
	 * `HH:MM` 24-hour time.
	 *
	 * @param array<string,mixed> $in      Input.
	 * @param string              $field   Field.
	 * @param string              $default Default.
	 * @return string
	 */
	public function time( array $in, string $field, string $default ): string {
		$v = isset( $in[ $field ] ) && is_scalar( $in[ $field ] ) ? trim( (string) $in[ $field ] ) : '';
		if ( '' === $v ) {
			return $default;
		}
		if ( ! self::is_valid_time( $v ) ) {
			$this->add( $field, __( 'Enter a time as HH:MM.', 'nexus-lead-suite' ) );
			return $default;
		}

		return $v;
	}

	/**
	 * @param string $v Candidate.
	 * @return bool
	 */
	public static function is_valid_date( string $v ): bool {
		if ( ! preg_match( '/^(\d{4})-(\d{2})-(\d{2})$/', $v, $m ) ) {
			return false;
		}

		return checkdate( (int) $m[2], (int) $m[3], (int) $m[1] );
	}

	/**
	 * @param string $v Candidate.
	 * @return bool
	 */
	public static function is_valid_time( string $v ): bool {
		return (bool) preg_match( '/^([01]\d|2[0-3]):[0-5]\d$/', $v );
	}
}
