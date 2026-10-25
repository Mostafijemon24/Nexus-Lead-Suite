<?php
/**
 * Treatments and prescription items written by doctors.
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
 * One treatment per appointment; saving it marks the appointment treated.
 */
final class Treatments_Store {

	public const MAX_ITEMS = 40;

	/**
	 * @param int $appointment_id Appointment id.
	 * @return array<string,mixed>|null
	 */
	public static function get_by_appointment( int $appointment_id ): ?array {
		global $wpdb;
		if ( $appointment_id <= 0 ) {
			return null;
		}
		$t = Schema::table( 'treatments' );
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- custom table.
		$row = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$t} WHERE appointment_id = %d", $appointment_id ), ARRAY_A );

		return $row ? self::normalize( (array) $row ) : null;
	}

	/**
	 * @param array<string,mixed> $row Row.
	 * @return array<string,mixed>
	 */
	private static function normalize( array $row ): array {
		global $wpdb;

		$pi = Schema::table( 'prescriptions' );
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- custom table.
		$items = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$pi} WHERE treatment_id = %d ORDER BY sort_order ASC, id ASC", (int) $row['id'] ), ARRAY_A );
		$list  = array();
		foreach ( (array) $items as $it ) {
			$list[] = array(
				'id'           => (int) $it['id'],
				'medicineId'   => (int) $it['medicine_id'],
				'medicineName' => (string) $it['medicine_name'],
				'dosage'       => (string) $it['dosage'],
				'duration'     => (string) $it['duration'],
				'instruction'  => (string) $it['instruction'],
			);
		}

		return array(
			'id'            => (int) $row['id'],
			'appointmentId' => (int) $row['appointment_id'],
			'doctorId'      => (int) $row['doctor_id'],
			'patientId'     => (int) $row['patient_id'],
			'notes'         => (string) ( $row['notes'] ?? '' ),
			'advice'        => (string) ( $row['advice'] ?? '' ),
			'followUpDate'  => (string) ( $row['follow_up_date'] ?? '' ),
			'items'         => $list,
			'createdAt'     => (string) $row['created_at'],
			'updatedAt'     => (string) $row['updated_at'],
		);
	}

	/**
	 * Creates or replaces the treatment for an appointment (doctor must own it).
	 *
	 * @param int                 $appointment_id Appointment id.
	 * @param int                 $doctor_id      Acting doctor id.
	 * @param array<string,mixed> $input          notes, advice, followUpDate, items[].
	 * @return array<string,mixed>|\WP_Error
	 */
	public static function save( int $appointment_id, int $doctor_id, array $input ) {
		global $wpdb;

		$appointment = Appointments_Store::get( $appointment_id );
		if ( null === $appointment ) {
			return new \WP_Error( 'not_found', __( 'Appointment not found.', 'nexus-lead-suite' ), array( 'status' => 404 ) );
		}
		if ( (int) $appointment['doctorId'] !== $doctor_id ) {
			return new \WP_Error( 'forbidden', __( 'You can only treat your own appointments.', 'nexus-lead-suite' ), array( 'status' => 403 ) );
		}
		if ( 'cancelled' === $appointment['status'] ) {
			return new \WP_Error( 'invalid_transition', __( 'A cancelled appointment cannot be treated.', 'nexus-lead-suite' ), array( 'status' => 409 ) );
		}

		$v         = new Validator();
		$notes     = $v->textarea( $input, 'notes', 10000 );
		$advice    = $v->textarea( $input, 'advice', 5000 );
		$follow_up = $v->date( $input, 'followUpDate', false );
		$items_in  = isset( $input['items'] ) && is_array( $input['items'] ) ? array_values( $input['items'] ) : array();
		if ( count( $items_in ) > self::MAX_ITEMS ) {
			/* translators: %d: maximum rows */
			$v->add( 'items', sprintf( __( 'At most %d medicines per prescription.', 'nexus-lead-suite' ), self::MAX_ITEMS ) );
			$items_in = array_slice( $items_in, 0, self::MAX_ITEMS );
		}

		$items = array();
		foreach ( $items_in as $i => $raw ) {
			if ( ! is_array( $raw ) ) {
				continue;
			}
			$medicine_id = $v->int( $raw, 'medicineId', 0, PHP_INT_MAX, 0 );
			$name        = $v->text( $raw, 'medicineName', 0, 160, false );
			if ( $medicine_id > 0 ) {
				$med = Catalog_Store::get( 'medicines', $medicine_id );
				if ( null === $med ) {
					$v->add( "items.{$i}.medicineId", __( 'Unknown medicine.', 'nexus-lead-suite' ) );
					continue;
				}
				$name = $med['name'];
			}
			if ( '' === $name ) {
				$v->add( "items.{$i}.medicineName", __( 'Choose a medicine or type its name.', 'nexus-lead-suite' ) );
				continue;
			}
			$items[] = array(
				'medicine_id'   => $medicine_id,
				'medicine_name' => $name,
				'dosage'        => $v->text( $raw, 'dosage', 0, 120, false ),
				'duration'      => $v->text( $raw, 'duration', 0, 120, false ),
				'instruction'   => $v->text( $raw, 'instruction', 0, 255, false ),
				'sort_order'    => count( $items ),
			);
		}
		if ( '' === $notes && array() === $items ) {
			$v->add( 'notes', __( 'Write treatment notes or add at least one medicine.', 'nexus-lead-suite' ) );
		}
		if ( $v->fails() ) {
			return Catalog_Store::validation_error( $v->errors() );
		}

		$t   = Schema::table( 'treatments' );
		$pi  = Schema::table( 'prescriptions' );
		$now = current_time( 'mysql' );
		$existing = self::get_by_appointment( $appointment_id );
		$data     = array(
			'appointment_id' => $appointment_id,
			'doctor_id'      => $doctor_id,
			'patient_id'     => (int) $appointment['patientId'],
			'notes'          => $notes,
			'advice'         => $advice,
			'follow_up_date' => $follow_up,
			'updated_at'     => $now,
		);
		// phpcs:disable WordPress.DB.DirectDatabaseQuery.DirectQuery -- custom tables.
		if ( $existing ) {
			$treatment_id = (int) $existing['id'];
			$wpdb->update( $t, $data, array( 'id' => $treatment_id ) );
			$wpdb->delete( $pi, array( 'treatment_id' => $treatment_id ), array( '%d' ) );
		} else {
			$data['created_at'] = $now;
			$ok = $wpdb->insert( $t, $data );
			if ( false === $ok ) {
				return new \WP_Error( 'db_error', __( 'Could not save the treatment.', 'nexus-lead-suite' ), array( 'status' => 500 ) );
			}
			$treatment_id = (int) $wpdb->insert_id;
		}
		foreach ( $items as $item ) {
			$item['treatment_id'] = $treatment_id;
			$wpdb->insert( $pi, $item );
		}
		// phpcs:enable

		Appointments_Store::mark_treated( $appointment_id );
		$treatment = self::get_by_appointment( $appointment_id );
		/**
		 * Fires after a treatment / prescription is saved.
		 *
		 * @param array<string,mixed> $treatment   Treatment.
		 * @param array<string,mixed> $appointment Appointment before the status change.
		 */
		do_action( 'nexulesuite_treatment_saved', $treatment, $appointment );

		return $treatment;
	}

	/**
	 * Everything needed to print a prescription (appointment, doctor, patient, treatment).
	 *
	 * @param int $appointment_id Appointment id.
	 * @return array<string,mixed>|null
	 */
	public static function prescription_bundle( int $appointment_id ): ?array {
		$appointment = Appointments_Store::get( $appointment_id );
		if ( null === $appointment ) {
			return null;
		}
		$treatment = self::get_by_appointment( $appointment_id );
		if ( null === $treatment ) {
			return null;
		}
		$doctor  = Doctors_Store::get( (int) $appointment['doctorId'] );
		$patient = Patients_Store::get( (int) $appointment['patientId'] );

		return array(
			'appointment' => $appointment,
			'treatment'   => $treatment,
			'doctor'      => $doctor ? array(
				'name'           => $doctor['name'],
				'departmentName' => $doctor['departmentName'],
				'locationName'   => $doctor['locationName'],
				'address'        => $doctor['address'],
				'experienceYears'=> $doctor['experienceYears'],
			) : null,
			'patient'     => $patient ? array(
				'name'  => $patient['name'],
				'email' => $patient['email'],
				'phone' => $patient['phone'],
			) : null,
		);
	}
}
