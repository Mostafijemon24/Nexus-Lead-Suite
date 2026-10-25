<?php
/**
 * Slot generation: weekday schedule minus leave days minus booked slots minus the past.
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
 * Pure functions where possible so the engine is unit-testable without a database.
 */
final class Availability {

	public const STATUS_OPEN   = 'open';
	public const STATUS_CLOSED = 'closed';
	public const STATUS_LEAVE  = 'leave';
	public const STATUS_PAST   = 'past';
	public const STATUS_FULL   = 'full';
	public const STATUS_BEYOND = 'beyond';

	/**
	 * Overridable "now" for tests (`Y-m-d H:i`).
	 *
	 * @var string|null
	 */
	public static $now_override = null;

	/**
	 * Site-local current time as `Y-m-d H:i`.
	 *
	 * @return string
	 */
	public static function now(): string {
		if ( null !== self::$now_override ) {
			return self::$now_override;
		}

		return substr( (string) current_time( 'mysql' ), 0, 16 );
	}

	/**
	 * @return string `Y-m-d`
	 */
	public static function today(): string {
		return substr( self::now(), 0, 10 );
	}

	/**
	 * `HH:MM` => minutes since midnight.
	 *
	 * @param string $hhmm Time.
	 * @return int
	 */
	public static function minutes( string $hhmm ): int {
		if ( ! preg_match( '/^(\d{1,2}):(\d{2})$/', $hhmm, $m ) ) {
			return 0;
		}

		return (int) $m[1] * 60 + (int) $m[2];
	}

	/**
	 * Minutes since midnight => `HH:MM`.
	 *
	 * @param int $minutes Minutes.
	 * @return string
	 */
	public static function hhmm( int $minutes ): string {
		$minutes = max( 0, min( 24 * 60, $minutes ) );

		return sprintf( '%02d:%02d', intdiv( $minutes, 60 ), $minutes % 60 );
	}

	/**
	 * Weekday (0 = Sunday) for a `Y-m-d` date.
	 *
	 * @param string $date Date.
	 * @return int
	 */
	public static function weekday( string $date ): int {
		$ts = strtotime( $date . ' 12:00:00 UTC' );

		return false === $ts ? -1 : (int) gmdate( 'w', $ts );
	}

	/**
	 * Generates [start, end] pairs for one schedule row (no leave / booking logic).
	 *
	 * @param array{enabled:bool,startTime:string,endTime:string,slotMinutes:int} $row Row.
	 * @return array<int,array{start:string,end:string}>
	 */
	public static function generate( array $row ): array {
		if ( empty( $row['enabled'] ) ) {
			return array();
		}
		$start = self::minutes( (string) $row['startTime'] );
		$end   = self::minutes( (string) $row['endTime'] );
		$step  = max( 5, (int) ( $row['slotMinutes'] ?? 30 ) );
		$out   = array();
		for ( $t = $start; $t + $step <= $end; $t += $step ) {
			$out[] = array(
				'start' => self::hhmm( $t ),
				'end'   => self::hhmm( $t + $step ),
			);
		}

		return $out;
	}

	/**
	 * Pure computation of a day's availability.
	 *
	 * @param string                                    $date      `Y-m-d`.
	 * @param array<int,array<string,mixed>>            $schedule  7 rows keyed by position (from Doctors_Store::get_schedule).
	 * @param array<string,bool>                        $leaves    Set of leave dates.
	 * @param array<string,bool>                        $booked    Set of booked `HH:MM` starts for that date.
	 * @param array{now?:string,leadMinutes?:int,windowDays?:int} $opts Options.
	 * @return array{status:string,slots:array<int,array{start:string,end:string,available:bool}>}
	 */
	public static function compute_day( string $date, array $schedule, array $leaves, array $booked, array $opts = array() ): array {
		$now        = $opts['now'] ?? self::now();
		$today      = substr( $now, 0, 10 );
		$lead       = isset( $opts['leadMinutes'] ) ? (int) $opts['leadMinutes'] : (int) Settings::get()['leadTimeMinutes'];
		$window     = isset( $opts['windowDays'] ) ? (int) $opts['windowDays'] : (int) Settings::get()['bookingWindowDays'];
		$empty      = array(
			'status' => self::STATUS_CLOSED,
			'slots'  => array(),
		);

		if ( ! Validator::is_valid_date( $date ) ) {
			return $empty;
		}
		if ( $date < $today ) {
			$empty['status'] = self::STATUS_PAST;
			return $empty;
		}
		$last_day = gmdate( 'Y-m-d', (int) strtotime( $today . ' 12:00:00 UTC' ) + $window * DAY_IN_SECONDS );
		if ( $date > $last_day ) {
			$empty['status'] = self::STATUS_BEYOND;
			return $empty;
		}
		if ( isset( $leaves[ $date ] ) ) {
			$empty['status'] = self::STATUS_LEAVE;
			return $empty;
		}

		$wd  = self::weekday( $date );
		$row = null;
		foreach ( $schedule as $r ) {
			if ( (int) $r['weekday'] === $wd ) {
				$row = $r;
				break;
			}
		}
		if ( null === $row || empty( $row['enabled'] ) ) {
			return $empty;
		}

		$cutoff = -1;
		if ( $date === $today ) {
			$cutoff = self::minutes( substr( $now, 11, 5 ) ) + $lead;
		}

		$slots     = array();
		$any_open  = false;
		foreach ( self::generate( $row ) as $s ) {
			$available = ! isset( $booked[ $s['start'] ] ) && self::minutes( $s['start'] ) >= $cutoff;
			$any_open  = $any_open || $available;
			$slots[]   = array(
				'start'     => $s['start'],
				'end'       => $s['end'],
				'available' => $available,
			);
		}

		if ( array() === $slots ) {
			return $empty;
		}

		return array(
			'status' => $any_open ? self::STATUS_OPEN : self::STATUS_FULL,
			'slots'  => $slots,
		);
	}

	/**
	 * Database-backed availability for a doctor and date.
	 *
	 * @param int    $doctor_id Doctor id.
	 * @param string $date      `Y-m-d`.
	 * @return array{status:string,slots:array<int,array{start:string,end:string,available:bool}>}
	 */
	public static function for_date( int $doctor_id, string $date ): array {
		$schedule = Doctors_Store::get_schedule( $doctor_id );
		$leaves   = Doctors_Store::leave_dates( $doctor_id );
		$booked   = Appointments_Store::booked_starts( $doctor_id, $date );

		return self::compute_day( $date, $schedule, $leaves, $booked );
	}

	/**
	 * Per-day status for a month (`YYYY-MM`), used by the calendar.
	 *
	 * @param int    $doctor_id Doctor id.
	 * @param string $month     `YYYY-MM`.
	 * @return array<string,string> date => status
	 */
	public static function month_overview( int $doctor_id, string $month ): array {
		if ( ! preg_match( '/^(\d{4})-(\d{2})$/', $month, $m ) ) {
			return array();
		}
		$year  = (int) $m[1];
		$mon   = (int) $m[2];
		if ( $mon < 1 || $mon > 12 ) {
			return array();
		}
		$days     = (int) gmdate( 't', (int) gmmktime( 12, 0, 0, $mon, 1, $year ) );
		$schedule = Doctors_Store::get_schedule( $doctor_id );
		$leaves   = Doctors_Store::leave_dates( $doctor_id );
		$booked   = Appointments_Store::booked_starts_for_month( $doctor_id, $month );

		$out = array();
		for ( $d = 1; $d <= $days; $d++ ) {
			$date         = sprintf( '%04d-%02d-%02d', $year, $mon, $d );
			$res          = self::compute_day( $date, $schedule, $leaves, $booked[ $date ] ?? array() );
			$out[ $date ] = $res['status'];
		}

		return $out;
	}

	/**
	 * Finds the slot end for a given start on a date; null if the start is not a valid slot.
	 *
	 * @param array<int,array<string,mixed>> $schedule Schedule rows.
	 * @param string                         $date     Date.
	 * @param string                         $start    `HH:MM`.
	 * @return string|null
	 */
	public static function slot_end( array $schedule, string $date, string $start ): ?string {
		$wd = self::weekday( $date );
		foreach ( $schedule as $r ) {
			if ( (int) $r['weekday'] === $wd ) {
				foreach ( self::generate( $r ) as $s ) {
					if ( $s['start'] === $start ) {
						return $s['end'];
					}
				}
			}
		}

		return null;
	}
}
