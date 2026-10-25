<?php
/**
 * REST routes for the appointment module (admin, public, patient, doctor).
 *
 * @package nexulesuite_
 */

declare(strict_types=1);

namespace nexulesuite_\Api;

use nexulesuite_\Appointments\Appointments_Store;
use nexulesuite_\Appointments\Availability;
use nexulesuite_\Appointments\Catalog_Store;
use nexulesuite_\Appointments\Doctors_Store;
use nexulesuite_\Appointments\Patients_Store;
use nexulesuite_\Appointments\Roles;
use nexulesuite_\Appointments\Settings;
use nexulesuite_\Appointments\Treatments_Store;
use nexulesuite_\Appointments\Validator;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Namespace `nexulesuite_/v1`, prefix `/appt/`.
 *
 * Authorisation model:
 * - `/appt/admin/*`   manage_options
 * - `/appt/doctor/*`  doctor role + active doctor row; every record access is scoped to that doctor
 * - `/appt/patient/*` patient role + active patient row (+ verified e-mail when required); scoped to that patient
 * - `/appt/public/*`  anonymous, read-only or account creation, IP rate limited
 */
final class Appointments_Api {

	private const NS = 'nexulesuite_/v1';

	private const KIND_MAP = array(
		'departments'    => 'departments',
		'locations'      => 'locations',
		'medicine-types' => 'medicine_types',
		'medicines'      => 'medicines',
	);

	/**
	 * Registers every route.
	 *
	 * @return void
	 */
	public function register_routes(): void {
		$admin   = array( $this, 'can_admin' );
		$doctor  = array( $this, 'can_doctor' );
		$patient = array( $this, 'can_patient' );
		$pub     = array( $this, 'public_read_ok' );
		$pubw    = array( $this, 'public_write_ok' );
		$auth    = array( $this, 'is_logged_in' );

		/* ---------------- admin ---------------- */
		$this->route( '/appt/admin/dashboard', 'GET', 'admin_dashboard', $admin );
		$this->route( '/appt/admin/catalog/(?P<kind>departments|locations|medicine-types|medicines)', 'GET', 'admin_catalog_list', $admin );
		$this->route( '/appt/admin/catalog/(?P<kind>departments|locations|medicine-types|medicines)', 'POST', 'admin_catalog_create', $admin );
		$this->route( '/appt/admin/catalog/(?P<kind>departments|locations|medicine-types|medicines)/(?P<id>\d+)', 'PUT, PATCH', 'admin_catalog_update', $admin );
		$this->route( '/appt/admin/catalog/(?P<kind>departments|locations|medicine-types|medicines)/(?P<id>\d+)', 'DELETE', 'admin_catalog_delete', $admin );
		$this->route( '/appt/admin/doctors', 'GET', 'admin_doctors_list', $admin );
		$this->route( '/appt/admin/doctors', 'POST', 'admin_doctors_create', $admin );
		$this->route( '/appt/admin/doctors/(?P<id>\d+)', 'GET', 'admin_doctor_get', $admin );
		$this->route( '/appt/admin/doctors/(?P<id>\d+)', 'PUT, PATCH', 'admin_doctor_update', $admin );
		$this->route( '/appt/admin/doctors/(?P<id>\d+)', 'DELETE', 'admin_doctor_delete', $admin );
		$this->route( '/appt/admin/doctors/(?P<id>\d+)/schedule', 'PUT, PATCH', 'admin_doctor_schedule', $admin );
		$this->route( '/appt/admin/doctors/(?P<id>\d+)/leaves', 'GET', 'admin_doctor_leaves', $admin );
		$this->route( '/appt/admin/doctors/(?P<id>\d+)/leaves', 'POST', 'admin_doctor_leave_add', $admin );
		$this->route( '/appt/admin/doctors/(?P<id>\d+)/leaves/(?P<leaveId>\d+)', 'DELETE', 'admin_doctor_leave_delete', $admin );
		$this->route( '/appt/admin/appointments', 'GET', 'admin_appointments_list', $admin );
		$this->route( '/appt/admin/appointments/(?P<id>\d+)', 'GET', 'admin_appointment_get', $admin );
		$this->route( '/appt/admin/appointments/(?P<id>\d+)', 'PUT, PATCH', 'admin_appointment_update', $admin );
		$this->route( '/appt/admin/patients', 'GET', 'admin_patients_list', $admin );
		$this->route( '/appt/admin/patients/(?P<id>\d+)', 'PUT, PATCH', 'admin_patient_update', $admin );
		$this->route( '/appt/admin/settings', 'GET', 'admin_settings_get', $admin );
		$this->route( '/appt/admin/settings', 'PUT, PATCH, POST', 'admin_settings_save', $admin );

		/* ---------------- public ---------------- */
		$this->route( '/appt/public/doctors', 'GET', 'public_doctors', $pub );
		$this->route( '/appt/public/doctors/(?P<slug>[a-z0-9\-]+)', 'GET', 'public_doctor', $pub );
		$this->route( '/appt/public/departments', 'GET', 'public_departments', $pub );
		$this->route( '/appt/public/departments/(?P<slug>[a-z0-9\-]+)', 'GET', 'public_department', $pub );
		$this->route( '/appt/public/locations', 'GET', 'public_locations', $pub );
		$this->route( '/appt/public/availability', 'GET', 'public_availability', $pub );
		$this->route( '/appt/public/availability-month', 'GET', 'public_availability_month', $pub );
		$this->route( '/appt/public/register', 'POST', 'public_register', $pubw );
		$this->route( '/appt/public/login', 'POST', 'public_login', $pubw );
		$this->route( '/appt/public/resend-verification', 'POST', 'public_resend_verification', $pubw );
		$this->route( '/appt/public/logout', 'POST', 'public_logout', $auth );
		$this->route( '/appt/public/me', 'GET', 'public_me', '__return_true' );

		/* ---------------- patient ---------------- */
		$this->route( '/appt/patient/appointments', 'GET', 'patient_appointments', $patient );
		$this->route( '/appt/patient/appointments', 'POST', 'patient_book', $patient );
		$this->route( '/appt/patient/appointments/(?P<id>\d+)', 'GET', 'patient_appointment_get', $patient );
		$this->route( '/appt/patient/appointments/(?P<id>\d+)/cancel', 'POST', 'patient_appointment_cancel', $patient );
		$this->route( '/appt/patient/profile', 'GET', 'patient_profile_get', $patient );
		$this->route( '/appt/patient/profile', 'PUT, PATCH, POST', 'patient_profile_save', $patient );
		$this->route( '/appt/patient/password', 'POST', 'patient_password', $patient );

		/* ---------------- doctor ---------------- */
		$this->route( '/appt/doctor/dashboard', 'GET', 'doctor_dashboard', $doctor );
		$this->route( '/appt/doctor/appointments', 'GET', 'doctor_appointments', $doctor );
		$this->route( '/appt/doctor/appointments/(?P<id>\d+)', 'GET', 'doctor_appointment_get', $doctor );
		$this->route( '/appt/doctor/appointments/(?P<id>\d+)/treatment', 'POST, PUT', 'doctor_treatment_save', $doctor );
		$this->route( '/appt/doctor/appointments/(?P<id>\d+)/cancel', 'POST', 'doctor_appointment_cancel', $doctor );
		$this->route( '/appt/doctor/schedule', 'GET', 'doctor_schedule_get', $doctor );
		$this->route( '/appt/doctor/schedule', 'PUT, PATCH, POST', 'doctor_schedule_save', $doctor );
		$this->route( '/appt/doctor/leaves', 'GET', 'doctor_leaves', $doctor );
		$this->route( '/appt/doctor/leaves', 'POST', 'doctor_leave_add', $doctor );
		$this->route( '/appt/doctor/leaves/(?P<leaveId>\d+)', 'DELETE', 'doctor_leave_delete', $doctor );
		$this->route( '/appt/doctor/profile', 'GET', 'doctor_profile_get', $doctor );
		$this->route( '/appt/doctor/profile', 'PUT, PATCH, POST', 'doctor_profile_save', $doctor );
		$this->route( '/appt/doctor/password', 'POST', 'doctor_password', $doctor );
		$this->route( '/appt/doctor/medicines', 'GET', 'doctor_medicines', $doctor );

		/* ---------------- shared ---------------- */
		$this->route( '/appt/prescription/(?P<id>\d+)', 'GET', 'prescription_get', $auth );
	}

	/**
	 * @param string          $path       Route regex.
	 * @param string          $methods    HTTP methods.
	 * @param string          $method     Method name on this class.
	 * @param callable|string $permission Permission callback.
	 * @return void
	 */
	private function route( string $path, string $methods, string $method, $permission ): void {
		register_rest_route(
			self::NS,
			$path,
			array(
				'methods'             => $methods,
				'callback'            => array( $this, $method ),
				'permission_callback' => $permission,
			)
		);
	}

	/* ------------------------------------------------------------------ */
	/* Permissions                                                          */
	/* ------------------------------------------------------------------ */

	/**
	 * @return bool
	 */
	public function can_admin(): bool {
		return current_user_can( 'manage_options' );
	}

	/**
	 * @return bool
	 */
	public function is_logged_in(): bool {
		return is_user_logged_in();
	}

	/**
	 * Doctor role + active doctor row.
	 *
	 * @return bool|\WP_Error
	 */
	public function can_doctor() {
		$uid = get_current_user_id();
		if ( $uid <= 0 ) {
			return new \WP_Error( 'rest_not_logged_in', __( 'Please log in.', 'nexus-lead-suite' ), array( 'status' => 401 ) );
		}
		if ( ! Roles::is_doctor( $uid ) ) {
			return new \WP_Error( 'rest_forbidden', __( 'This area is for doctors.', 'nexus-lead-suite' ), array( 'status' => 403 ) );
		}
		$doctor = Doctors_Store::get_by_user( $uid );
		if ( null === $doctor ) {
			return new \WP_Error( 'rest_forbidden', __( 'No doctor profile is linked to this account.', 'nexus-lead-suite' ), array( 'status' => 403 ) );
		}
		if ( 'active' !== $doctor['status'] ) {
			return new \WP_Error( 'rest_forbidden', __( 'This doctor account is inactive.', 'nexus-lead-suite' ), array( 'status' => 403 ) );
		}

		return true;
	}

	/**
	 * Patient role + active patient row (+ verified e-mail).
	 *
	 * @return bool|\WP_Error
	 */
	public function can_patient() {
		$uid = get_current_user_id();
		if ( $uid <= 0 ) {
			return new \WP_Error( 'rest_not_logged_in', __( 'Please log in.', 'nexus-lead-suite' ), array( 'status' => 401 ) );
		}
		if ( ! Roles::is_patient( $uid ) ) {
			return new \WP_Error( 'rest_forbidden', __( 'This area is for patients.', 'nexus-lead-suite' ), array( 'status' => 403 ) );
		}
		$patient = Patients_Store::get_by_user( $uid );
		if ( null === $patient || 'active' !== $patient['status'] ) {
			return new \WP_Error( 'rest_forbidden', __( 'This patient account is inactive.', 'nexus-lead-suite' ), array( 'status' => 403 ) );
		}
		if ( Settings::get()['requireEmailVerification'] && ! Patients_Store::is_verified( $uid ) ) {
			return new \WP_Error( 'email_unverified', __( 'Please confirm your e-mail address first.', 'nexus-lead-suite' ), array( 'status' => 403 ) );
		}

		return true;
	}

	/**
	 * Anonymous read: 120 requests per minute per IP.
	 *
	 * @return bool|\WP_Error
	 */
	public function public_read_ok() {
		return $this->rate_limit( 'r', 120, MINUTE_IN_SECONDS );
	}

	/**
	 * Anonymous write (register / login / resend): 10 per 10 minutes per IP, and the request
	 * must carry a valid `wp_rest` nonce (sent by the front end as X-WP-Nonce). WordPress only
	 * checks that nonce for cookie-authenticated users; requiring it here blocks login CSRF
	 * (a cross-site form posting credentials to sign the victim into an attacker's account).
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return bool|\WP_Error
	 */
	public function public_write_ok( \WP_REST_Request $request ) {
		$nonce = (string) $request->get_header( 'X-WP-Nonce' );
		if ( '' === $nonce ) {
			$nonce = (string) $request->get_param( '_wpnonce' );
		}
		if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
			return new \WP_Error( 'rest_cookie_invalid_nonce', __( 'Your session has expired. Please reload the page and try again.', 'nexus-lead-suite' ), array( 'status' => 403 ) );
		}

		return $this->rate_limit( 'w', 10, 10 * MINUTE_IN_SECONDS );
	}

	/**
	 * Transient-backed counter per IP.
	 *
	 * @param string $bucket Bucket.
	 * @param int    $limit  Max hits.
	 * @param int    $window Seconds.
	 * @return bool|\WP_Error
	 */
	private function rate_limit( string $bucket, int $limit, int $window ) {
		$ip  = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( (string) $_SERVER['REMOTE_ADDR'] ) ) : '0.0.0.0';
		$key = 'nexulesuite_appt_rl_' . $bucket . '_' . substr( hash( 'sha256', $ip ), 0, 20 );
		$n   = (int) get_transient( $key );
		if ( $n >= $limit ) {
			return new \WP_Error( 'rate_limited', __( 'Too many requests. Please wait a moment.', 'nexus-lead-suite' ), array( 'status' => 429 ) );
		}
		set_transient( $key, $n + 1, $window );

		return true;
	}

	/* ------------------------------------------------------------------ */
	/* Helpers                                                              */
	/* ------------------------------------------------------------------ */

	/**
	 * Body (JSON) merged over query/url params.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return array<string,mixed>
	 */
	private function input( \WP_REST_Request $request ): array {
		$json = $request->get_json_params();
		$all  = $request->get_params();

		return array_merge( is_array( $all ) ? $all : array(), is_array( $json ) ? $json : array() );
	}

	/**
	 * Store result => response.
	 *
	 * @param mixed $result Result.
	 * @param int   $status Status when OK.
	 * @return \WP_REST_Response|\WP_Error
	 */
	private function out( $result, int $status = 200 ) {
		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return new \WP_REST_Response( $result, $status );
	}

	/**
	 * @return array<string,mixed>
	 */
	private function current_doctor(): array {
		return (array) Doctors_Store::get_by_user( get_current_user_id() );
	}

	/**
	 * @return array<string,mixed>
	 */
	private function current_patient(): array {
		return (array) Patients_Store::get_by_user( get_current_user_id() );
	}

	/**
	 * @param \WP_REST_Request $request Request.
	 * @return array<string,mixed>
	 */
	private function list_args( \WP_REST_Request $request ): array {
		$in = $this->input( $request );
		$out = array();
		foreach ( array( 'status', 'search', 'view', 'dateFrom', 'dateTo', 'order' ) as $k ) {
			if ( isset( $in[ $k ] ) && is_scalar( $in[ $k ] ) ) {
				$out[ $k ] = sanitize_text_field( (string) $in[ $k ] );
			}
		}
		foreach ( array( 'page', 'perPage', 'departmentId', 'locationId', 'typeId', 'doctorId', 'patientId' ) as $k ) {
			if ( isset( $in[ $k ] ) && is_numeric( $in[ $k ] ) ) {
				$out[ $k ] = (int) $in[ $k ];
			}
		}

		return $out;
	}

	/**
	 * Attaches treatment to an appointment array.
	 *
	 * @param array<string,mixed> $a Appointment.
	 * @return array<string,mixed>
	 */
	private function with_treatment( array $a ): array {
		$a['treatment'] = Treatments_Store::get_by_appointment( (int) $a['id'] );

		return self::with_print_url( $a );
	}

	/**
	 * Adds the printable prescription URL (nonce bound to the current user) when a treatment exists.
	 *
	 * @param array<string,mixed> $a Appointment.
	 * @return array<string,mixed>
	 */
	public static function with_print_url( array $a ): array {
		$a['printUrl'] = ! empty( $a['hasTreatment'] ) ? add_query_arg(
			array(
				'nexulesuite_prescription' => (int) $a['id'],
				'_wpnonce'                 => wp_create_nonce( 'nexulesuite_print_' . (int) $a['id'] ),
			),
			home_url( '/' )
		) : '';

		return $a;
	}

	/**
	 * @param array<int,array<string,mixed>> $items Appointments.
	 * @return array<int,array<string,mixed>>
	 */
	private static function with_print_urls( array $items ): array {
		return array_map( array( self::class, 'with_print_url' ), $items );
	}

	/* ------------------------------------------------------------------ */
	/* Admin                                                                */
	/* ------------------------------------------------------------------ */

	/**
	 * @return \WP_REST_Response
	 */
	public function admin_dashboard() {
		$stats = Appointments_Store::stats( 0 );
		$stats['doctors']     = Doctors_Store::all( array( 'perPage' => 1 ) )['total'];
		$stats['departments'] = Catalog_Store::all( 'departments', array( 'perPage' => 1 ) )['total'];
		$stats['patients']    = Patients_Store::all( array( 'perPage' => 1 ) )['total'];
		$recent               = Appointments_Store::all( array( 'perPage' => 10 ) );
		$today                = Appointments_Store::all( array( 'view' => 'today', 'order' => 'asc', 'perPage' => 50 ) );

		return new \WP_REST_Response(
			array(
				'stats'    => $stats,
				'recent'   => $recent['items'],
				'today'    => $today['items'],
				'settings' => Settings::get(),
			)
		);
	}

	/**
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response
	 */
	public function admin_catalog_list( \WP_REST_Request $request ) {
		$kind = self::KIND_MAP[ (string) $request->get_param( 'kind' ) ];
		$args = $this->list_args( $request );
		$args['withCounts'] = true;
		$args['perPage']    = $args['perPage'] ?? 100;

		return new \WP_REST_Response( Catalog_Store::all( $kind, $args ) );
	}

	/**
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function admin_catalog_create( \WP_REST_Request $request ) {
		$kind = self::KIND_MAP[ (string) $request->get_param( 'kind' ) ];

		return $this->out( Catalog_Store::create( $kind, $this->input( $request ) ), 201 );
	}

	/**
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function admin_catalog_update( \WP_REST_Request $request ) {
		$kind = self::KIND_MAP[ (string) $request->get_param( 'kind' ) ];
		$in   = $this->input( $request );
		unset( $in['kind'], $in['id'] );

		return $this->out( Catalog_Store::update( $kind, (int) $request->get_param( 'id' ), $in ) );
	}

	/**
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function admin_catalog_delete( \WP_REST_Request $request ) {
		$kind = self::KIND_MAP[ (string) $request->get_param( 'kind' ) ];
		$r    = Catalog_Store::delete( $kind, (int) $request->get_param( 'id' ) );

		return $this->out( is_wp_error( $r ) ? $r : array( 'deleted' => true ) );
	}

	/**
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response
	 */
	public function admin_doctors_list( \WP_REST_Request $request ) {
		return new \WP_REST_Response( Doctors_Store::all( $this->list_args( $request ) ) );
	}

	/**
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function admin_doctors_create( \WP_REST_Request $request ) {
		return $this->out( Doctors_Store::create( $this->input( $request ) ), 201 );
	}

	/**
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function admin_doctor_get( \WP_REST_Request $request ) {
		$d = Doctors_Store::get( (int) $request->get_param( 'id' ) );
		if ( null === $d ) {
			return new \WP_Error( 'not_found', __( 'Doctor not found.', 'nexus-lead-suite' ), array( 'status' => 404 ) );
		}
		$d['leaves'] = Doctors_Store::get_leaves( $d['id'] );

		return new \WP_REST_Response( $d );
	}

	/**
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function admin_doctor_update( \WP_REST_Request $request ) {
		$in = $this->input( $request );
		unset( $in['id'] );

		return $this->out( Doctors_Store::update( (int) $request->get_param( 'id' ), $in ) );
	}

	/**
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function admin_doctor_delete( \WP_REST_Request $request ) {
		$r = Doctors_Store::delete( (int) $request->get_param( 'id' ) );

		return $this->out( is_wp_error( $r ) ? $r : array( 'deleted' => true ) );
	}

	/**
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function admin_doctor_schedule( \WP_REST_Request $request ) {
		$id = (int) $request->get_param( 'id' );
		if ( null === Doctors_Store::get( $id ) ) {
			return new \WP_Error( 'not_found', __( 'Doctor not found.', 'nexus-lead-suite' ), array( 'status' => 404 ) );
		}
		$in   = $this->input( $request );
		$rows = isset( $in['schedule'] ) && is_array( $in['schedule'] ) ? $in['schedule'] : array();

		return $this->out( Doctors_Store::save_schedule( $id, $rows ) );
	}

	/**
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function admin_doctor_leaves( \WP_REST_Request $request ) {
		$id = (int) $request->get_param( 'id' );
		if ( null === Doctors_Store::get( $id ) ) {
			return new \WP_Error( 'not_found', __( 'Doctor not found.', 'nexus-lead-suite' ), array( 'status' => 404 ) );
		}

		return new \WP_REST_Response( Doctors_Store::get_leaves( $id ) );
	}

	/**
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function admin_doctor_leave_add( \WP_REST_Request $request ) {
		$id = (int) $request->get_param( 'id' );
		if ( null === Doctors_Store::get( $id ) ) {
			return new \WP_Error( 'not_found', __( 'Doctor not found.', 'nexus-lead-suite' ), array( 'status' => 404 ) );
		}

		return $this->out( Doctors_Store::add_leave( $id, $this->input( $request ) ), 201 );
	}

	/**
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function admin_doctor_leave_delete( \WP_REST_Request $request ) {
		$ok = Doctors_Store::delete_leave( (int) $request->get_param( 'id' ), (int) $request->get_param( 'leaveId' ) );
		if ( ! $ok ) {
			return new \WP_Error( 'not_found', __( 'Leave day not found.', 'nexus-lead-suite' ), array( 'status' => 404 ) );
		}

		return new \WP_REST_Response( array( 'deleted' => true ) );
	}

	/**
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response
	 */
	public function admin_appointments_list( \WP_REST_Request $request ) {
		$res          = Appointments_Store::all( $this->list_args( $request ) );
		$res['items'] = self::with_print_urls( $res['items'] );

		return new \WP_REST_Response( $res );
	}

	/**
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function admin_appointment_get( \WP_REST_Request $request ) {
		$a = Appointments_Store::get( (int) $request->get_param( 'id' ) );
		if ( null === $a ) {
			return new \WP_Error( 'not_found', __( 'Appointment not found.', 'nexus-lead-suite' ), array( 'status' => 404 ) );
		}

		return new \WP_REST_Response( $this->with_treatment( $a ) );
	}

	/**
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function admin_appointment_update( \WP_REST_Request $request ) {
		$in = $this->input( $request );
		unset( $in['id'] );
		$r = Appointments_Store::admin_update( (int) $request->get_param( 'id' ), $in );

		return $this->out( is_wp_error( $r ) ? $r : $this->with_treatment( $r ) );
	}

	/**
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response
	 */
	public function admin_patients_list( \WP_REST_Request $request ) {
		return new \WP_REST_Response( Patients_Store::all( $this->list_args( $request ) ) );
	}

	/**
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function admin_patient_update( \WP_REST_Request $request ) {
		$in     = $this->input( $request );
		$id     = (int) $request->get_param( 'id' );
		$result = null;
		if ( isset( $in['status'] ) ) {
			$result = Patients_Store::set_status( $id, sanitize_key( (string) $in['status'] ) );
			if ( is_wp_error( $result ) ) {
				return $result;
			}
		}
		$profile = array_intersect_key( $in, array_flip( array( 'name', 'phone', 'address' ) ) );
		if ( array() !== $profile ) {
			$result = Patients_Store::update_profile( $id, $profile );
		}
		if ( null === $result ) {
			$result = Patients_Store::get( $id );
			if ( null === $result ) {
				return new \WP_Error( 'not_found', __( 'Patient not found.', 'nexus-lead-suite' ), array( 'status' => 404 ) );
			}
		}

		return $this->out( $result );
	}

	/**
	 * @return \WP_REST_Response
	 */
	public function admin_settings_get() {
		return new \WP_REST_Response( $this->settings_payload() );
	}

	/**
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response
	 */
	public function admin_settings_save( \WP_REST_Request $request ) {
		Settings::save( $this->input( $request ) );

		return new \WP_REST_Response( $this->settings_payload() );
	}

	/**
	 * Settings plus page URLs.
	 *
	 * @return array<string,mixed>
	 */
	private function settings_payload(): array {
		$s        = Settings::get();
		$pages    = array();
		foreach ( Settings::PAGES as $key => $shortcode ) {
			$id            = isset( $s['pages'][ $key ] ) ? (int) $s['pages'][ $key ] : 0;
			$pages[ $key ] = array(
				'id'        => $id,
				'shortcode' => $shortcode,
				'url'       => $id > 0 ? (string) get_permalink( $id ) : '',
			);
		}
		$s['pageDetails'] = $pages;

		return $s;
	}

	/* ------------------------------------------------------------------ */
	/* Public                                                               */
	/* ------------------------------------------------------------------ */

	/**
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response
	 */
	public function public_doctors( \WP_REST_Request $request ) {
		$args               = $this->list_args( $request );
		$args['publicOnly'] = true;
		$args['perPage']    = min( 50, (int) ( $args['perPage'] ?? Settings::get()['perPage'] ) );
		$res                = Doctors_Store::all( $args );
		$res['items']       = array_map( array( Doctors_Store::class, 'public_shape' ), $res['items'] );

		return new \WP_REST_Response( $res );
	}

	/**
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function public_doctor( \WP_REST_Request $request ) {
		$d = Doctors_Store::get_by_slug( (string) $request->get_param( 'slug' ) );
		if ( null === $d || 'active' !== $d['status'] ) {
			return new \WP_Error( 'not_found', __( 'Doctor not found.', 'nexus-lead-suite' ), array( 'status' => 404 ) );
		}
		$d           = Doctors_Store::public_shape( $d );
		$d['leaves'] = array_keys( Doctors_Store::leave_dates( $d['id'] ) );

		return new \WP_REST_Response( $d );
	}

	/**
	 * @return \WP_REST_Response
	 */
	public function public_departments() {
		$r = Catalog_Store::all(
			'departments',
			array(
				'status'     => 'active',
				'withCounts' => true,
				'perPage'    => 200,
			)
		);

		return new \WP_REST_Response( $r );
	}

	/**
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function public_department( \WP_REST_Request $request ) {
		$dep = Catalog_Store::get_by_slug( 'departments', (string) $request->get_param( 'slug' ) );
		if ( null === $dep || 'active' !== $dep['status'] ) {
			return new \WP_Error( 'not_found', __( 'Department not found.', 'nexus-lead-suite' ), array( 'status' => 404 ) );
		}
		$docs           = Doctors_Store::all(
			array(
				'publicOnly'   => true,
				'departmentId' => $dep['id'],
				'perPage'      => 100,
			)
		);
		$dep['doctors'] = array_map( array( Doctors_Store::class, 'public_shape' ), $docs['items'] );

		return new \WP_REST_Response( $dep );
	}

	/**
	 * @return \WP_REST_Response
	 */
	public function public_locations() {
		return new \WP_REST_Response(
			Catalog_Store::all(
				'locations',
				array(
					'status'  => 'active',
					'perPage' => 200,
				)
			)
		);
	}

	/**
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function public_availability( \WP_REST_Request $request ) {
		$doctor_id = (int) $request->get_param( 'doctorId' );
		$date      = (string) $request->get_param( 'date' );
		$doctor    = Doctors_Store::get( $doctor_id );
		if ( null === $doctor || 'active' !== $doctor['status'] ) {
			return new \WP_Error( 'not_found', __( 'Doctor not found.', 'nexus-lead-suite' ), array( 'status' => 404 ) );
		}
		if ( ! Validator::is_valid_date( $date ) ) {
			return new \WP_Error( 'invalid_date', __( 'Enter a date as YYYY-MM-DD.', 'nexus-lead-suite' ), array( 'status' => 400 ) );
		}
		$day = Availability::for_date( $doctor_id, $date );
		$day['doctorId'] = $doctor_id;
		$day['date']     = $date;

		return new \WP_REST_Response( $day );
	}

	/**
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function public_availability_month( \WP_REST_Request $request ) {
		$doctor_id = (int) $request->get_param( 'doctorId' );
		$month     = (string) $request->get_param( 'month' );
		$doctor    = Doctors_Store::get( $doctor_id );
		if ( null === $doctor || 'active' !== $doctor['status'] ) {
			return new \WP_Error( 'not_found', __( 'Doctor not found.', 'nexus-lead-suite' ), array( 'status' => 404 ) );
		}
		if ( ! preg_match( '/^\d{4}-(0[1-9]|1[0-2])$/', $month ) ) {
			return new \WP_Error( 'invalid_month', __( 'Enter a month as YYYY-MM.', 'nexus-lead-suite' ), array( 'status' => 400 ) );
		}

		return new \WP_REST_Response(
			array(
				'doctorId' => $doctor_id,
				'month'    => $month,
				'days'     => Availability::month_overview( $doctor_id, $month ),
			)
		);
	}

	/**
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function public_register( \WP_REST_Request $request ) {
		if ( is_user_logged_in() ) {
			return new \WP_Error( 'already_logged_in', __( 'You are already logged in.', 'nexus-lead-suite' ), array( 'status' => 409 ) );
		}
		$p = Patients_Store::register( $this->input( $request ) );
		if ( is_wp_error( $p ) ) {
			return $p;
		}
		$require = (bool) Settings::get()['requireEmailVerification'];
		if ( ! $require ) {
			wp_set_current_user( $p['userId'] );
			wp_set_auth_cookie( $p['userId'], true );
		}

		return new \WP_REST_Response(
			array(
				'registered'           => true,
				'verificationRequired' => $require,
				'email'                => $p['email'],
				'redirect'             => $require ? '' : $this->panel_url( 'patient_panel' ),
			),
			201
		);
	}

	/**
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function public_login( \WP_REST_Request $request ) {
		$in    = $this->input( $request );
		$v     = new Validator();
		$email = $v->email( $in, 'email' );
		$pass  = isset( $in['password'] ) && is_scalar( $in['password'] ) ? (string) $in['password'] : '';
		$type  = $v->one_of( $in, 'type', array( 'patient', 'doctor' ), 'patient' );
		if ( '' === $pass ) {
			$v->add( 'password', __( 'Enter your password.', 'nexus-lead-suite' ) );
		}
		if ( $v->fails() ) {
			return Catalog_Store::validation_error( $v->errors() );
		}

		/*
		 * The nonce returned below must match the session the browser will use next. WordPress
		 * derives REST nonces from the logged-in cookie, which is only sent as a response header
		 * here, so mirror it into $_COOKIE before creating the nonce (same approach as WooCommerce).
		 */
		add_action(
			'set_logged_in_cookie',
			static function ( $cookie ): void {
				if ( defined( 'LOGGED_IN_COOKIE' ) ) {
					$_COOKIE[ LOGGED_IN_COOKIE ] = (string) $cookie;
				}
			}
		);
		$user = wp_signon(
			array(
				'user_login'    => $email,
				'user_password' => $pass,
				'remember'      => ! empty( $in['remember'] ),
			),
			is_ssl()
		);
		if ( is_wp_error( $user ) ) {
			return new \WP_Error( 'invalid_credentials', __( 'The e-mail or password is incorrect.', 'nexus-lead-suite' ), array( 'status' => 401 ) );
		}
		$uid = (int) $user->ID;

		if ( 'doctor' === $type ) {
			if ( ! Roles::is_doctor( $uid ) ) {
				wp_logout();
				return new \WP_Error( 'wrong_account_type', __( 'This account is not a doctor account.', 'nexus-lead-suite' ), array( 'status' => 403 ) );
			}
			$doctor = Doctors_Store::get_by_user( $uid );
			if ( null === $doctor || 'active' !== $doctor['status'] ) {
				wp_logout();
				return new \WP_Error( 'account_inactive', __( 'This doctor account is inactive.', 'nexus-lead-suite' ), array( 'status' => 403 ) );
			}
			$redirect = $this->panel_url( 'doctor_panel' );
		} else {
			if ( Roles::is_admin( $uid ) ) {
				$redirect = admin_url( 'admin.php?page=nexus-lead-suite-appointments' );
			} elseif ( Roles::is_doctor( $uid ) ) {
				$redirect = $this->panel_url( 'doctor_panel' );
			} else {
				if ( ! Roles::is_patient( $uid ) ) {
					wp_logout();
					return new \WP_Error( 'wrong_account_type', __( 'This account cannot use the patient area.', 'nexus-lead-suite' ), array( 'status' => 403 ) );
				}
				$patient = Patients_Store::get_by_user( $uid );
				if ( null === $patient || 'active' !== $patient['status'] ) {
					wp_logout();
					return new \WP_Error( 'account_inactive', __( 'This patient account is inactive.', 'nexus-lead-suite' ), array( 'status' => 403 ) );
				}
				if ( Settings::get()['requireEmailVerification'] && ! Patients_Store::is_verified( $uid ) ) {
					wp_logout();
					return new \WP_Error( 'email_unverified', __( 'Please confirm your e-mail address first. Check your inbox for the confirmation link.', 'nexus-lead-suite' ), array( 'status' => 403 ) );
				}
				$redirect = $this->panel_url( 'patient_panel' );
			}
		}
		wp_set_current_user( $uid );

		return new \WP_REST_Response(
			array(
				'loggedIn' => true,
				'userId'   => $uid,
				'redirect' => $redirect,
				'nonce'    => wp_create_nonce( 'wp_rest' ),
			)
		);
	}

	/**
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function public_resend_verification( \WP_REST_Request $request ) {
		$in    = $this->input( $request );
		$v     = new Validator();
		$email = $v->email( $in, 'email' );
		if ( $v->fails() ) {
			return Catalog_Store::validation_error( $v->errors() );
		}
		$user = get_user_by( 'email', $email );
		// Same answer whether or not the account exists, to avoid account enumeration.
		if ( $user && Roles::is_patient( (int) $user->ID ) && ! Patients_Store::is_verified( (int) $user->ID ) ) {
			Patients_Store::send_verification( (int) $user->ID );
		}

		return new \WP_REST_Response( array( 'sent' => true ) );
	}

	/**
	 * @return \WP_REST_Response
	 */
	public function public_logout() {
		wp_logout();

		return new \WP_REST_Response( array( 'loggedOut' => true, 'redirect' => $this->panel_url( 'auth' ) ) );
	}

	/**
	 * Who am I (for the front-end scripts).
	 *
	 * @return \WP_REST_Response
	 */
	public function public_me() {
		$uid  = get_current_user_id();
		$role = 'guest';
		if ( $uid > 0 ) {
			if ( Roles::is_admin( $uid ) ) {
				$role = 'admin';
			} elseif ( Roles::is_doctor( $uid ) ) {
				$role = 'doctor';
			} elseif ( Roles::is_patient( $uid ) ) {
				$role = 'patient';
			} else {
				$role = 'user';
			}
		}

		return new \WP_REST_Response(
			array(
				'loggedIn' => $uid > 0,
				'role'     => $role,
				'nonce'    => wp_create_nonce( 'wp_rest' ),
				'verified' => $uid > 0 ? Patients_Store::is_verified( $uid ) : false,
				'pages'    => array(
					'auth'         => $this->panel_url( 'auth' ),
					'patientPanel' => $this->panel_url( 'patient_panel' ),
					'doctorPanel'  => $this->panel_url( 'doctor_panel' ),
					'booking'      => $this->panel_url( 'booking' ),
				),
			)
		);
	}

	/**
	 * @param string $key Page key.
	 * @return string
	 */
	private function panel_url( string $key ): string {
		$id = Settings::page_id( $key );

		return $id > 0 ? (string) get_permalink( $id ) : home_url( '/' );
	}

	/* ------------------------------------------------------------------ */
	/* Patient                                                              */
	/* ------------------------------------------------------------------ */

	/**
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response
	 */
	public function patient_appointments( \WP_REST_Request $request ) {
		$args              = $this->list_args( $request );
		$args['patientId'] = (int) $this->current_patient()['id'];
		unset( $args['doctorId'], $args['search'] );
		$res          = Appointments_Store::all( $args );
		$res['items'] = self::with_print_urls( array_map( array( Appointments_Store::class, 'patient_shape' ), $res['items'] ) );

		return new \WP_REST_Response( $res );
	}

	/**
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function patient_book( \WP_REST_Request $request ) {
		$in              = $this->input( $request );
		$in['patientId'] = (int) $this->current_patient()['id'];
		$r               = Appointments_Store::book( $in );

		return $this->out( is_wp_error( $r ) ? $r : Appointments_Store::patient_shape( $r ), 201 );
	}

	/**
	 * Ownership check for the patient routes.
	 *
	 * @param int $id Appointment id.
	 * @return array<string,mixed>|\WP_Error
	 */
	private function own_patient_appointment( int $id ) {
		$a = Appointments_Store::get( $id );
		if ( null === $a || (int) $a['patientId'] !== (int) $this->current_patient()['id'] ) {
			// 404, not 403: do not reveal that another patient's appointment exists.
			return new \WP_Error( 'not_found', __( 'Appointment not found.', 'nexus-lead-suite' ), array( 'status' => 404 ) );
		}

		return $a;
	}

	/**
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function patient_appointment_get( \WP_REST_Request $request ) {
		$a = $this->own_patient_appointment( (int) $request->get_param( 'id' ) );
		if ( is_wp_error( $a ) ) {
			return $a;
		}

		return new \WP_REST_Response( Appointments_Store::patient_shape( $this->with_treatment( $a ) ) );
	}

	/**
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function patient_appointment_cancel( \WP_REST_Request $request ) {
		$a = $this->own_patient_appointment( (int) $request->get_param( 'id' ) );
		if ( is_wp_error( $a ) ) {
			return $a;
		}
		$r = Appointments_Store::cancel( (int) $a['id'], true );

		return $this->out( is_wp_error( $r ) ? $r : Appointments_Store::patient_shape( $r ) );
	}

	/**
	 * @return \WP_REST_Response
	 */
	public function patient_profile_get() {
		return new \WP_REST_Response( $this->current_patient() );
	}

	/**
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function patient_profile_save( \WP_REST_Request $request ) {
		$in = array_intersect_key( $this->input( $request ), array_flip( array( 'name', 'phone', 'address' ) ) );

		return $this->out( Patients_Store::update_profile( (int) $this->current_patient()['id'], $in ) );
	}

	/**
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function patient_password( \WP_REST_Request $request ) {
		$r = Patients_Store::change_password( get_current_user_id(), $this->input( $request ) );

		return $this->out( is_wp_error( $r ) ? $r : array( 'changed' => true ) );
	}

	/* ------------------------------------------------------------------ */
	/* Doctor                                                               */
	/* ------------------------------------------------------------------ */

	/**
	 * @return \WP_REST_Response
	 */
	public function doctor_dashboard() {
		$doctor = $this->current_doctor();
		$today  = Appointments_Store::all(
			array(
				'doctorId' => $doctor['id'],
				'view'     => 'today',
				'order'    => 'asc',
				'perPage'  => 100,
			)
		);
		$new    = Appointments_Store::all(
			array(
				'doctorId' => $doctor['id'],
				'view'     => 'new',
				'perPage'  => 10,
			)
		);

		return new \WP_REST_Response(
			array(
				'doctor' => Doctors_Store::public_shape( $doctor ),
				'stats'  => Appointments_Store::stats( (int) $doctor['id'] ),
				'today'  => $today['items'],
				'new'    => $new['items'],
			)
		);
	}

	/**
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response
	 */
	public function doctor_appointments( \WP_REST_Request $request ) {
		$args             = $this->list_args( $request );
		$args['doctorId'] = (int) $this->current_doctor()['id'];
		unset( $args['patientId'] );
		$res          = Appointments_Store::all( $args );
		$res['items'] = self::with_print_urls( $res['items'] );

		return new \WP_REST_Response( $res );
	}

	/**
	 * @param int $id Appointment id.
	 * @return array<string,mixed>|\WP_Error
	 */
	private function own_doctor_appointment( int $id ) {
		$a = Appointments_Store::get( $id );
		if ( null === $a || (int) $a['doctorId'] !== (int) $this->current_doctor()['id'] ) {
			return new \WP_Error( 'not_found', __( 'Appointment not found.', 'nexus-lead-suite' ), array( 'status' => 404 ) );
		}

		return $a;
	}

	/**
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function doctor_appointment_get( \WP_REST_Request $request ) {
		$a = $this->own_doctor_appointment( (int) $request->get_param( 'id' ) );
		if ( is_wp_error( $a ) ) {
			return $a;
		}
		$a = $this->with_treatment( $a );
		$a['patient'] = Patients_Store::get( (int) $a['patientId'] );
		if ( $a['patient'] ) {
			unset( $a['patient']['userId'] );
		}
		$history = Appointments_Store::all(
			array(
				'doctorId'  => $a['doctorId'],
				'patientId' => $a['patientId'],
				'view'      => 'treated',
				'perPage'   => 20,
			)
		);
		$a['patientHistory'] = array_values(
			array_filter(
				$history['items'],
				static function ( $h ) use ( $a ) {
					return (int) $h['id'] !== (int) $a['id'];
				}
			)
		);

		return new \WP_REST_Response( $a );
	}

	/**
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function doctor_treatment_save( \WP_REST_Request $request ) {
		$a = $this->own_doctor_appointment( (int) $request->get_param( 'id' ) );
		if ( is_wp_error( $a ) ) {
			return $a;
		}
		$in = $this->input( $request );
		unset( $in['id'] );
		$r = Treatments_Store::save( (int) $a['id'], (int) $this->current_doctor()['id'], $in );
		if ( is_wp_error( $r ) ) {
			return $r;
		}

		return new \WP_REST_Response(
			array(
				'treatment'   => $r,
				'appointment' => self::with_print_url( (array) Appointments_Store::get( (int) $a['id'] ) ),
			)
		);
	}

	/**
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function doctor_appointment_cancel( \WP_REST_Request $request ) {
		$a = $this->own_doctor_appointment( (int) $request->get_param( 'id' ) );
		if ( is_wp_error( $a ) ) {
			return $a;
		}

		return $this->out( Appointments_Store::cancel( (int) $a['id'], false ) );
	}

	/**
	 * @return \WP_REST_Response
	 */
	public function doctor_schedule_get() {
		return new \WP_REST_Response( Doctors_Store::get_schedule( (int) $this->current_doctor()['id'] ) );
	}

	/**
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function doctor_schedule_save( \WP_REST_Request $request ) {
		$in   = $this->input( $request );
		$rows = isset( $in['schedule'] ) && is_array( $in['schedule'] ) ? $in['schedule'] : array();

		return $this->out( Doctors_Store::save_schedule( (int) $this->current_doctor()['id'], $rows ) );
	}

	/**
	 * @return \WP_REST_Response
	 */
	public function doctor_leaves() {
		return new \WP_REST_Response( Doctors_Store::get_leaves( (int) $this->current_doctor()['id'] ) );
	}

	/**
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function doctor_leave_add( \WP_REST_Request $request ) {
		return $this->out( Doctors_Store::add_leave( (int) $this->current_doctor()['id'], $this->input( $request ) ), 201 );
	}

	/**
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function doctor_leave_delete( \WP_REST_Request $request ) {
		$ok = Doctors_Store::delete_leave( (int) $this->current_doctor()['id'], (int) $request->get_param( 'leaveId' ) );
		if ( ! $ok ) {
			return new \WP_Error( 'not_found', __( 'Leave day not found.', 'nexus-lead-suite' ), array( 'status' => 404 ) );
		}

		return new \WP_REST_Response( array( 'deleted' => true ) );
	}

	/**
	 * @return \WP_REST_Response
	 */
	public function doctor_profile_get() {
		$d = $this->current_doctor();
		unset( $d['userId'] );

		return new \WP_REST_Response( $d );
	}

	/**
	 * Doctors edit contact details and bio only; fee, department and status stay with the admin.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function doctor_profile_save( \WP_REST_Request $request ) {
		$in = array_intersect_key( $this->input( $request ), array_flip( array( 'name', 'phone', 'bio', 'address', 'photoId' ) ) );
		$r  = Doctors_Store::update( (int) $this->current_doctor()['id'], $in );
		if ( is_wp_error( $r ) ) {
			return $r;
		}
		unset( $r['userId'] );

		return new \WP_REST_Response( $r );
	}

	/**
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function doctor_password( \WP_REST_Request $request ) {
		$r = Patients_Store::change_password( get_current_user_id(), $this->input( $request ) );

		return $this->out( is_wp_error( $r ) ? $r : array( 'changed' => true ) );
	}

	/**
	 * Medicine lookup for the prescription editor.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response
	 */
	public function doctor_medicines( \WP_REST_Request $request ) {
		$args           = $this->list_args( $request );
		$args['status'] = 'active';
		$args['perPage'] = 50;
		$meds           = Catalog_Store::all( 'medicines', $args );
		$types          = Catalog_Store::all( 'medicine_types', array( 'status' => 'active', 'perPage' => 200 ) );

		return new \WP_REST_Response(
			array(
				'medicines' => $meds['items'],
				'types'     => $types['items'],
			)
		);
	}

	/* ------------------------------------------------------------------ */
	/* Shared                                                               */
	/* ------------------------------------------------------------------ */

	/**
	 * Prescription bundle for admin, owning doctor or owning patient.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function prescription_get( \WP_REST_Request $request ) {
		$id  = (int) $request->get_param( 'id' );
		$uid = get_current_user_id();
		if ( ! self::user_can_view_prescription( $uid, $id ) ) {
			return new \WP_Error( 'not_found', __( 'Prescription not found.', 'nexus-lead-suite' ), array( 'status' => 404 ) );
		}
		$bundle = Treatments_Store::prescription_bundle( $id );
		if ( null === $bundle ) {
			return new \WP_Error( 'not_found', __( 'Prescription not found.', 'nexus-lead-suite' ), array( 'status' => 404 ) );
		}

		return new \WP_REST_Response( $bundle );
	}

	/**
	 * Shared with the front-end print view.
	 *
	 * @param int $user_id        User id.
	 * @param int $appointment_id Appointment id.
	 * @return bool
	 */
	public static function user_can_view_prescription( int $user_id, int $appointment_id ): bool {
		if ( $user_id <= 0 ) {
			return false;
		}
		$a = Appointments_Store::get( $appointment_id );
		if ( null === $a ) {
			return false;
		}
		if ( Roles::is_admin( $user_id ) ) {
			return true;
		}
		if ( Roles::is_doctor( $user_id ) ) {
			$d = Doctors_Store::get_by_user( $user_id );
			if ( $d && (int) $d['id'] === (int) $a['doctorId'] ) {
				return true;
			}
		}
		if ( Roles::is_patient( $user_id ) ) {
			$p = Patients_Store::get_by_user( $user_id );
			if ( $p && (int) $p['id'] === (int) $a['patientId'] ) {
				return true;
			}
		}

		return false;
	}
}
