<?php
/**
 * Appointments: booking, listing, status changes.
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
 * Status machine: pending -> confirmed -> treated; pending|confirmed -> cancelled.
 * `slot_key` (doctor:date:start) is UNIQUE and is rewritten on cancel so the slot frees up.
 */
final class Appointments_Store {

	public const STATUSES = array( 'pending', 'confirmed', 'treated', 'cancelled' );

	public const PAYMENT_METHODS = array( 'bank_transfer', 'pay_at_clinic', 'none' );

	/**
	 * Books a slot for a patient.
	 *
	 * @param array<string,mixed> $input doctorId, patientId, date, startTime, reason, paymentMethod.
	 * @return array<string,mixed>|\WP_Error
	 */
	public static function book( array $input ) {
		global $wpdb;

		$v          = new Validator();
		$doctor_id  = $v->int( $input, 'doctorId', 1, PHP_INT_MAX, 0, true );
		$patient_id = $v->int( $input, 'patientId', 1, PHP_INT_MAX, 0, true );
		$date       = $v->date( $input, 'date' );
		$start      = $v->time( $input, 'startTime', '' );
		$reason     = $v->textarea( $input, 'reason', 2000 );
		$method     = $v->one_of( $input, 'paymentMethod', self::PAYMENT_METHODS, 'pay_at_clinic' );
		if ( '' === $start ) {
			$v->add( 'startTime', __( 'Pick a time slot.', 'nexus-lead-suite' ) );
		}
		if ( $v->fails() ) {
			return Catalog_Store::validation_error( $v->errors() );
		}

		$doctor = Doctors_Store::get( $doctor_id );
		if ( null === $doctor || 'active' !== $doctor['status'] ) {
			return new \WP_Error( 'doctor_unavailable', __( 'This doctor is not available for booking.', 'nexus-lead-suite' ), array( 'status' => 422 ) );
		}
		$patient = Patients_Store::get( $patient_id );
		if ( null === $patient || 'active' !== $patient['status'] ) {
			return new \WP_Error( 'patient_inactive', __( 'This patient account cannot book appointments.', 'nexus-lead-suite' ), array( 'status' => 403 ) );
		}

		$day = Availability::for_date( $doctor_id, $date );
		if ( Availability::STATUS_LEAVE === $day['status'] ) {
			return new \WP_Error( 'doctor_on_leave', __( 'The doctor is on leave that day.', 'nexus-lead-suite' ), array( 'status' => 422 ) );
		}
		if ( Availability::STATUS_PAST === $day['status'] ) {
			return new \WP_Error( 'date_in_past', __( 'That date has already passed.', 'nexus-lead-suite' ), array( 'status' => 422 ) );
		}
		if ( Availability::STATUS_BEYOND === $day['status'] ) {
			return new \WP_Error( 'date_too_far', __( 'That date is beyond the booking window.', 'nexus-lead-suite' ), array( 'status' => 422 ) );
		}
		if ( Availability::STATUS_CLOSED === $day['status'] ) {
			return new \WP_Error( 'doctor_closed', __( 'The doctor has no schedule on that day.', 'nexus-lead-suite' ), array( 'status' => 422 ) );
		}
		$slot = null;
		foreach ( $day['slots'] as $s ) {
			if ( $s['start'] === $start ) {
				$slot = $s;
				break;
			}
		}
		if ( null === $slot ) {
			return new \WP_Error( 'invalid_slot', __( 'That time is not a bookable slot.', 'nexus-lead-suite' ), array( 'status' => 422 ) );
		}
		if ( ! $slot['available'] ) {
			return new \WP_Error( 'slot_taken', __( 'That time slot has just been taken. Please choose another.', 'nexus-lead-suite' ), array( 'status' => 409 ) );
		}

		$fee            = (float) $doctor['fee'];
		$payment_status = $fee <= 0 ? 'paid' : 'unpaid';
		if ( $fee <= 0 ) {
			$method = 'none';
		}
		$now  = current_time( 'mysql' );
		$data = array(
			'code'             => self::new_code(),
			'doctor_id'        => $doctor_id,
			'patient_id'       => $patient_id,
			'appointment_date' => $date,
			'start_time'       => $start,
			'end_time'         => $slot['end'],
			'slot_key'         => self::slot_key( $doctor_id, $date, $start ),
			'status'           => 'pending',
			'fee'              => $fee,
			'payment_status'   => $payment_status,
			'payment_method'   => $method,
			'reason'           => $reason,
			'created_at'       => $now,
			'updated_at'       => $now,
		);

		$ok = $wpdb->insert( Schema::table( 'appointments' ), $data ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery -- custom table.
		if ( false === $ok ) {
			// The UNIQUE slot_key index catches a race between two bookings for the same slot.
			return new \WP_Error( 'slot_taken', __( 'That time slot has just been taken. Please choose another.', 'nexus-lead-suite' ), array( 'status' => 409 ) );
		}

		$appointment = self::get( (int) $wpdb->insert_id );
		/**
		 * Fires after an appointment is booked.
		 *
		 * @param array<string,mixed> $appointment Appointment.
		 */
		do_action( 'nexulesuite_appointment_booked', $appointment );

		return $appointment;
	}

	/**
	 * @param int    $doctor_id Doctor id.
	 * @param string $date      Date.
	 * @param string $start     Start.
	 * @return string
	 */
	public static function slot_key( int $doctor_id, string $date, string $start ): string {
		return $doctor_id . ':' . $date . ':' . $start;
	}

	/**
	 * Short, unique, human-readable code.
	 *
	 * @return string
	 */
	private static function new_code(): string {
		global $wpdb;

		$t = Schema::table( 'appointments' );
		for ( $i = 0; $i < 10; $i++ ) {
			$code = 'AP' . strtoupper( substr( str_replace( array( '0', 'O', 'I', '1' ), array( 'Z', 'X', 'Y', 'W' ), wp_generate_password( 8, false, false ) ), 0, 8 ) );
			// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- custom table.
			if ( 0 === (int) $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM {$t} WHERE code = %s", $code ) ) ) {
				return $code;
			}
		}

		return 'AP' . strtoupper( substr( md5( uniqid( '', true ) ), 0, 8 ) );
	}

	/**
	 * Booked (non-cancelled) start times for a doctor on a date.
	 *
	 * @param int    $doctor_id Doctor id.
	 * @param string $date      Date.
	 * @return array<string,bool>
	 */
	public static function booked_starts( int $doctor_id, string $date ): array {
		global $wpdb;

		$t = Schema::table( 'appointments' );
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- custom table.
		$rows = $wpdb->get_results( $wpdb->prepare( "SELECT start_time, end_time FROM {$t} WHERE doctor_id = %d AND appointment_date = %s AND status <> 'cancelled'", $doctor_id, $date ), ARRAY_A );
		$set  = array();
		foreach ( (array) $rows as $r ) {
			// start => end, so the availability engine can detect overlaps after a schedule change (not only identical starts).
			$set[ substr( (string) $r['start_time'], 0, 5 ) ] = substr( (string) $r['end_time'], 0, 5 );
		}

		return $set;
	}

	/**
	 * Booked starts grouped by date for a `YYYY-MM` month.
	 *
	 * @param int    $doctor_id Doctor id.
	 * @param string $month     Month.
	 * @return array<string,array<string,bool>>
	 */
	public static function booked_starts_for_month( int $doctor_id, string $month ): array {
		global $wpdb;

		$t = Schema::table( 'appointments' );
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- custom table.
		$rows = $wpdb->get_results( $wpdb->prepare( "SELECT appointment_date, start_time, end_time FROM {$t} WHERE doctor_id = %d AND appointment_date LIKE %s AND status <> 'cancelled'", $doctor_id, $wpdb->esc_like( $month ) . '-%' ), ARRAY_A );
		$out  = array();
		foreach ( (array) $rows as $r ) {
			$out[ (string) $r['appointment_date'] ][ substr( (string) $r['start_time'], 0, 5 ) ] = substr( (string) $r['end_time'], 0, 5 );
		}

		return $out;
	}

	/**
	 * Lists appointments with doctor and patient names.
	 *
	 * @param array<string,mixed> $args doctorId, patientId, status, view (new|pending|history|upcoming), dateFrom, dateTo, search, page, perPage.
	 * @return array{items:array<int,array<string,mixed>>,total:int,page:int,perPage:int}
	 */
	public static function all( array $args = array() ): array {
		global $wpdb;

		$a  = Schema::table( 'appointments' );
		$d  = Schema::table( 'doctors' );
		$p  = Schema::table( 'patients' );
		$dp = Schema::table( 'departments' );
		$tr = Schema::table( 'treatments' );

		$where  = array( '1=1' );
		$params = array();
		$today  = Availability::today();

		if ( ! empty( $args['doctorId'] ) ) {
			$where[]  = 'a.doctor_id = %d';
			$params[] = (int) $args['doctorId'];
		}
		if ( ! empty( $args['patientId'] ) ) {
			$where[]  = 'a.patient_id = %d';
			$params[] = (int) $args['patientId'];
		}
		$status = isset( $args['status'] ) ? sanitize_key( (string) $args['status'] ) : '';
		if ( '' !== $status && 'all' !== $status && in_array( $status, self::STATUSES, true ) ) {
			$where[]  = 'a.status = %s';
			$params[] = $status;
		}
		$pay = isset( $args['paymentStatus'] ) ? sanitize_key( (string) $args['paymentStatus'] ) : '';
		if ( in_array( $pay, array( 'paid', 'unpaid', 'refunded' ), true ) ) {
			$where[]  = 'a.payment_status = %s';
			$params[] = $pay;
		}
		$view = isset( $args['view'] ) ? sanitize_key( (string) $args['view'] ) : '';
		if ( 'new' === $view ) {
			// Booked in the last 7 days and not yet treated or cancelled (doctor "new appointments").
			$where[]  = "a.status IN ('pending','confirmed') AND a.created_at >= %s";
			$params[] = gmdate( 'Y-m-d H:i:s', (int) strtotime( $today . ' 00:00:00 UTC' ) - 7 * DAY_IN_SECONDS );
		} elseif ( 'pending' === $view ) {
			$where[] = "a.status IN ('pending','confirmed')";
		} elseif ( 'history' === $view ) {
			$where[] = "a.status IN ('treated','cancelled')";
		} elseif ( 'upcoming' === $view ) {
			$where[]  = "a.status IN ('pending','confirmed') AND a.appointment_date >= %s";
			$params[] = $today;
		} elseif ( 'today' === $view ) {
			$where[]  = "a.appointment_date = %s AND a.status <> 'cancelled'";
			$params[] = $today;
		} elseif ( 'treated' === $view ) {
			$where[] = "a.status = 'treated'";
		}
		if ( ! empty( $args['dateFrom'] ) && Validator::is_valid_date( (string) $args['dateFrom'] ) ) {
			$where[]  = 'a.appointment_date >= %s';
			$params[] = (string) $args['dateFrom'];
		}
		if ( ! empty( $args['dateTo'] ) && Validator::is_valid_date( (string) $args['dateTo'] ) ) {
			$where[]  = 'a.appointment_date <= %s';
			$params[] = (string) $args['dateTo'];
		}
		$search = isset( $args['search'] ) ? trim( (string) $args['search'] ) : '';
		if ( '' !== $search ) {
			$like     = '%' . $wpdb->esc_like( $search ) . '%';
			$where[]  = '(a.code LIKE %s OR d.name LIKE %s OR p.name LIKE %s OR p.email LIKE %s)';
			$params[] = $like;
			$params[] = $like;
			$params[] = $like;
			$params[] = $like;
		}

		$page     = max( 1, (int) ( $args['page'] ?? 1 ) );
		$per_page = max( 1, min( 200, (int) ( $args['perPage'] ?? 20 ) ) );
		$offset   = ( $page - 1 ) * $per_page;
		$order    = ( isset( $args['order'] ) && 'asc' === $args['order'] ) ? 'ASC' : 'DESC';

		$where_sql = implode( ' AND ', $where );
		$from_sql  = "FROM {$a} a LEFT JOIN {$d} d ON d.id = a.doctor_id LEFT JOIN {$dp} dp ON dp.id = d.department_id LEFT JOIN {$p} p ON p.id = a.patient_id LEFT JOIN {$tr} tr ON tr.appointment_id = a.id WHERE {$where_sql}";

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- custom tables; clauses prepared above.
		$count_sql = "SELECT COUNT(*) {$from_sql}";
		$total     = (int) ( $params ? $wpdb->get_var( $wpdb->prepare( $count_sql, $params ) ) : $wpdb->get_var( $count_sql ) );
		$list_sql  = "SELECT a.*, d.name AS doctor_name, d.slug AS doctor_slug, dp.name AS department_name, p.name AS patient_name, p.email AS patient_email, p.phone AS patient_phone, tr.id AS treatment_id {$from_sql} ORDER BY a.appointment_date {$order}, a.start_time {$order}, a.id {$order} LIMIT %d OFFSET %d";
		$rows      = $wpdb->get_results( $wpdb->prepare( $list_sql, array_merge( $params, array( $per_page, $offset ) ) ), ARRAY_A );
		// phpcs:enable

		$items = array();
		foreach ( (array) $rows as $r ) {
			$items[] = self::normalize( (array) $r );
		}

		return array(
			'items'   => $items,
			'total'   => $total,
			'page'    => $page,
			'perPage' => $per_page,
		);
	}

	/**
	 * @param int $id Appointment id.
	 * @return array<string,mixed>|null
	 */
	public static function get( int $id ): ?array {
		global $wpdb;
		if ( $id <= 0 ) {
			return null;
		}
		$a  = Schema::table( 'appointments' );
		$d  = Schema::table( 'doctors' );
		$p  = Schema::table( 'patients' );
		$dp = Schema::table( 'departments' );
		$tr = Schema::table( 'treatments' );
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- custom tables.
		$row = $wpdb->get_row( $wpdb->prepare( "SELECT a.*, d.name AS doctor_name, d.slug AS doctor_slug, dp.name AS department_name, p.name AS patient_name, p.email AS patient_email, p.phone AS patient_phone, tr.id AS treatment_id FROM {$a} a LEFT JOIN {$d} d ON d.id = a.doctor_id LEFT JOIN {$dp} dp ON dp.id = d.department_id LEFT JOIN {$p} p ON p.id = a.patient_id LEFT JOIN {$tr} tr ON tr.appointment_id = a.id WHERE a.id = %d", $id ), ARRAY_A );

		return $row ? self::normalize( (array) $row ) : null;
	}

	/**
	 * @param array<string,mixed> $row Row.
	 * @return array<string,mixed>
	 */
	public static function normalize( array $row ): array {
		return array(
			'id'             => (int) $row['id'],
			'code'           => (string) $row['code'],
			'doctorId'       => (int) $row['doctor_id'],
			'doctorName'     => (string) ( $row['doctor_name'] ?? '' ),
			'doctorSlug'     => (string) ( $row['doctor_slug'] ?? '' ),
			'departmentName' => (string) ( $row['department_name'] ?? '' ),
			'patientId'      => (int) $row['patient_id'],
			'patientName'    => (string) ( $row['patient_name'] ?? '' ),
			'patientEmail'   => (string) ( $row['patient_email'] ?? '' ),
			'patientPhone'   => (string) ( $row['patient_phone'] ?? '' ),
			'date'           => (string) $row['appointment_date'],
			'startTime'      => (string) $row['start_time'],
			'endTime'        => (string) $row['end_time'],
			'status'         => (string) $row['status'],
			'fee'            => (float) $row['fee'],
			'paymentStatus'  => (string) $row['payment_status'],
			'paymentMethod'  => (string) $row['payment_method'],
			'reason'         => (string) ( $row['reason'] ?? '' ),
			'hasTreatment'   => (int) ( $row['treatment_id'] ?? 0 ) > 0,
			'createdAt'      => (string) $row['created_at'],
			'updatedAt'      => (string) $row['updated_at'],
		);
	}

	/**
	 * Patient-facing shape: hides the other patient fields that are redundant anyway.
	 *
	 * @param array<string,mixed> $a Appointment.
	 * @return array<string,mixed>
	 */
	public static function patient_shape( array $a ): array {
		unset( $a['patientEmail'], $a['patientPhone'] );

		return $a;
	}

	/**
	 * Cancels (patient, doctor or admin). `$enforce_lead` applies the patient cancel lead time.
	 *
	 * @param int  $id           Appointment id.
	 * @param bool $enforce_lead Whether to enforce the cancel lead time.
	 * @return array<string,mixed>|\WP_Error
	 */
	public static function cancel( int $id, bool $enforce_lead = false ) {
		global $wpdb;

		$a = self::get( $id );
		if ( null === $a ) {
			return new \WP_Error( 'not_found', __( 'Appointment not found.', 'nexus-lead-suite' ), array( 'status' => 404 ) );
		}
		if ( ! in_array( $a['status'], array( 'pending', 'confirmed' ), true ) ) {
			return new \WP_Error( 'invalid_transition', __( 'Only pending or confirmed appointments can be cancelled.', 'nexus-lead-suite' ), array( 'status' => 409 ) );
		}
		if ( $enforce_lead ) {
			$lead  = (int) Settings::get()['cancelLeadMinutes'];
			$start = (int) strtotime( $a['date'] . ' ' . $a['startTime'] . ':00 UTC' );
			$now   = (int) strtotime( Availability::now() . ':00 UTC' );
			if ( $start - $now < $lead * MINUTE_IN_SECONDS ) {
				return new \WP_Error( 'too_late', __( 'This appointment can no longer be cancelled online. Please contact the clinic.', 'nexus-lead-suite' ), array( 'status' => 409 ) );
			}
		}

		$wpdb->update( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery -- custom table.
			Schema::table( 'appointments' ),
			array(
				'status'     => 'cancelled',
				'slot_key'   => 'cancelled:' . $id,
				'updated_at' => current_time( 'mysql' ),
			),
			array( 'id' => $id )
		);
		$updated = self::get( $id );
		do_action( 'nexulesuite_appointment_cancelled', $updated );

		return $updated;
	}

	/**
	 * Admin status / payment update.
	 *
	 * @param int                 $id    Appointment id.
	 * @param array<string,mixed> $input status, paymentStatus, paymentMethod.
	 * @return array<string,mixed>|\WP_Error
	 */
	public static function admin_update( int $id, array $input ) {
		global $wpdb;

		$a = self::get( $id );
		if ( null === $a ) {
			return new \WP_Error( 'not_found', __( 'Appointment not found.', 'nexus-lead-suite' ), array( 'status' => 404 ) );
		}
		$v      = new Validator();
		$status = $v->one_of( $input, 'status', array( 'pending', 'confirmed', 'cancelled' ), $a['status'] );
		$pay    = $v->one_of( $input, 'paymentStatus', array( 'unpaid', 'paid', 'refunded' ), $a['paymentStatus'] );
		$method = $v->one_of( $input, 'paymentMethod', self::PAYMENT_METHODS, $a['paymentMethod'] );
		if ( $v->fails() ) {
			return Catalog_Store::validation_error( $v->errors() );
		}
		if ( 'treated' === $a['status'] && 'treated' !== $status ) {
			return new \WP_Error( 'invalid_transition', __( 'A treated appointment cannot change status.', 'nexus-lead-suite' ), array( 'status' => 409 ) );
		}
		if ( 'cancelled' === $status && 'cancelled' !== $a['status'] ) {
			return self::cancel( $id, false );
		}
		if ( 'cancelled' === $a['status'] && 'cancelled' !== $status ) {
			return new \WP_Error( 'invalid_transition', __( 'A cancelled appointment cannot be reopened. Book a new one.', 'nexus-lead-suite' ), array( 'status' => 409 ) );
		}

		$wpdb->update( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery -- custom table.
			Schema::table( 'appointments' ),
			array(
				'status'         => 'treated' === $a['status'] ? 'treated' : $status,
				'payment_status' => $pay,
				'payment_method' => $method,
				'updated_at'     => current_time( 'mysql' ),
			),
			array( 'id' => $id )
		);

		return self::get( $id );
	}

	/**
	 * Called by Treatments_Store once a treatment is saved.
	 *
	 * @param int $id Appointment id.
	 * @return void
	 */
	public static function mark_treated( int $id ): void {
		global $wpdb;

		$wpdb->update( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery -- custom table.
			Schema::table( 'appointments' ),
			array(
				'status'     => 'treated',
				'updated_at' => current_time( 'mysql' ),
			),
			array( 'id' => $id )
		);
	}

	/**
	 * Dashboard counters for the admin or one doctor.
	 *
	 * @param int $doctor_id 0 for all doctors.
	 * @return array<string,mixed>
	 */
	public static function stats( int $doctor_id = 0 ): array {
		global $wpdb;

		$a     = Schema::table( 'appointments' );
		$today = Availability::today();
		$month = substr( $today, 0, 7 );
		$scope = $doctor_id > 0 ? $wpdb->prepare( ' AND doctor_id = %d', $doctor_id ) : '';

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- custom table; scope prepared.
		$total      = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$a} WHERE 1=1{$scope}" );
		$today_cnt  = (int) $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM {$a} WHERE appointment_date = %s AND status <> 'cancelled'{$scope}", $today ) );
		$pending    = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$a} WHERE status IN ('pending','confirmed'){$scope}" );
		$treated    = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$a} WHERE status = 'treated'{$scope}" );
		$new_week   = (int) $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM {$a} WHERE status IN ('pending','confirmed') AND created_at >= %s{$scope}", gmdate( 'Y-m-d 00:00:00', (int) strtotime( $today . ' 00:00:00 UTC' ) - 7 * DAY_IN_SECONDS ) ) );
		$earn_month = (float) $wpdb->get_var( $wpdb->prepare( "SELECT COALESCE(SUM(fee),0) FROM {$a} WHERE payment_status = 'paid' AND appointment_date LIKE %s{$scope}", $wpdb->esc_like( $month ) . '-%' ) );
		$earn_total = (float) $wpdb->get_var( "SELECT COALESCE(SUM(fee),0) FROM {$a} WHERE payment_status = 'paid'{$scope}" );
		$patients   = (int) $wpdb->get_var( "SELECT COUNT(DISTINCT patient_id) FROM {$a} WHERE 1=1{$scope}" );
		// phpcs:enable

		// Daily paid earnings for the current month (the original's dashboard shows a monthly earnings chart).
		$by_day_rows = $wpdb->get_results( $wpdb->prepare( "SELECT appointment_date AS d, COALESCE(SUM(fee),0) AS s FROM {$a} WHERE payment_status = 'paid' AND appointment_date LIKE %s{$scope} GROUP BY appointment_date ORDER BY appointment_date ASC", $wpdb->esc_like( $month ) . '-%' ), ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- custom table; scope prepared.
		$by_day = array();
		foreach ( (array) $by_day_rows as $r ) {
			$by_day[] = array(
				'date'   => (string) $r['d'],
				'amount' => (float) $r['s'],
			);
		}

		return array(
			'total'          => $total,
			'today'          => $today_cnt,
			'earningsByDay'  => $by_day,
			'month'          => $month,
			'pending'        => $pending,
			'treated'        => $treated,
			'newThisWeek'    => $new_week,
			'earningsMonth'  => $earn_month,
			'earningsTotal'  => $earn_total,
			'patients'       => $patients,
		);
	}
}
