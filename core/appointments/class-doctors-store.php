<?php
/**
 * Doctors, their weekday schedules and leave days.
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
 * Doctor records are paired 1:1 with a WordPress user carrying the doctor role.
 */
final class Doctors_Store {

	/**
	 * Lists doctors with department / location names.
	 *
	 * @param array<string,mixed> $args status, search, departmentId, locationId, page, perPage, publicOnly.
	 * @return array{items:array<int,array<string,mixed>>,total:int,page:int,perPage:int}
	 */
	public static function all( array $args = array() ): array {
		global $wpdb;

		$d  = Schema::table( 'doctors' );
		$dp = Schema::table( 'departments' );
		$lc = Schema::table( 'locations' );

		$where  = array( '1=1' );
		$params = array();

		$status = isset( $args['status'] ) ? sanitize_key( (string) $args['status'] ) : '';
		if ( ! empty( $args['publicOnly'] ) ) {
			$status = 'active';
		}
		if ( '' !== $status && 'all' !== $status ) {
			$where[]  = 'd.status = %s';
			$params[] = $status;
		}
		if ( ! empty( $args['departmentId'] ) ) {
			$where[]  = 'd.department_id = %d';
			$params[] = (int) $args['departmentId'];
		}
		if ( ! empty( $args['locationId'] ) ) {
			$where[]  = 'd.location_id = %d';
			$params[] = (int) $args['locationId'];
		}
		$search = isset( $args['search'] ) ? trim( (string) $args['search'] ) : '';
		if ( '' !== $search ) {
			$like     = '%' . $wpdb->esc_like( $search ) . '%';
			$where[]  = '(d.name LIKE %s OR d.email LIKE %s OR dp.name LIKE %s)';
			$params[] = $like;
			$params[] = $like;
			$params[] = $like;
		}

		$page     = max( 1, (int) ( $args['page'] ?? 1 ) );
		$per_page = max( 1, min( 200, (int) ( $args['perPage'] ?? 20 ) ) );
		$offset   = ( $page - 1 ) * $per_page;

		$where_sql = implode( ' AND ', $where );
		$from_sql  = "FROM {$d} d LEFT JOIN {$dp} dp ON dp.id = d.department_id LEFT JOIN {$lc} lc ON lc.id = d.location_id WHERE {$where_sql}";

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- custom tables; clauses prepared above.
		$count_sql = "SELECT COUNT(*) {$from_sql}";
		$total     = (int) ( $params ? $wpdb->get_var( $wpdb->prepare( $count_sql, $params ) ) : $wpdb->get_var( $count_sql ) );
		$list_sql  = "SELECT d.*, dp.name AS department_name, dp.slug AS department_slug, lc.name AS location_name {$from_sql} ORDER BY d.name ASC LIMIT %d OFFSET %d";
		$rows      = $wpdb->get_results( $wpdb->prepare( $list_sql, array_merge( $params, array( $per_page, $offset ) ) ), ARRAY_A );
		// phpcs:enable

		$items = array();
		foreach ( (array) $rows as $row ) {
			$items[] = self::normalize( (array) $row );
		}

		return array(
			'items'   => $items,
			'total'   => $total,
			'page'    => $page,
			'perPage' => $per_page,
		);
	}

	/**
	 * @param int $id Doctor id.
	 * @return array<string,mixed>|null
	 */
	public static function get( int $id ): ?array {
		return self::get_where( 'd.id = %d', $id );
	}

	/**
	 * @param string $slug Slug.
	 * @return array<string,mixed>|null
	 */
	public static function get_by_slug( string $slug ): ?array {
		$slug = sanitize_title( $slug );

		return '' === $slug ? null : self::get_where( 'd.slug = %s', $slug );
	}

	/**
	 * @param int $user_id WP user id.
	 * @return array<string,mixed>|null
	 */
	public static function get_by_user( int $user_id ): ?array {
		return $user_id > 0 ? self::get_where( 'd.user_id = %d', $user_id ) : null;
	}

	/**
	 * @param string     $clause Prepared where clause.
	 * @param int|string $value  Value.
	 * @return array<string,mixed>|null
	 */
	private static function get_where( string $clause, $value ): ?array {
		global $wpdb;

		$d  = Schema::table( 'doctors' );
		$dp = Schema::table( 'departments' );
		$lc = Schema::table( 'locations' );
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- custom tables.
		$row = $wpdb->get_row( $wpdb->prepare( "SELECT d.*, dp.name AS department_name, dp.slug AS department_slug, lc.name AS location_name FROM {$d} d LEFT JOIN {$dp} dp ON dp.id = d.department_id LEFT JOIN {$lc} lc ON lc.id = d.location_id WHERE {$clause}", $value ), ARRAY_A );

		return $row ? self::normalize( (array) $row ) : null;
	}

	/**
	 * Row => API shape (schedule included).
	 *
	 * @param array<string,mixed> $row Row.
	 * @return array<string,mixed>
	 */
	public static function normalize( array $row ): array {
		$id       = (int) $row['id'];
		$photo_id = (int) ( $row['photo_id'] ?? 0 );

		return array(
			'id'              => $id,
			'userId'          => (int) ( $row['user_id'] ?? 0 ),
			'slug'            => (string) $row['slug'],
			'name'            => (string) $row['name'],
			'email'           => (string) $row['email'],
			'phone'           => (string) ( $row['phone'] ?? '' ),
			'photoId'         => $photo_id,
			'photoUrl'        => $photo_id > 0 ? (string) wp_get_attachment_image_url( $photo_id, 'medium' ) : '',
			'departmentId'    => (int) ( $row['department_id'] ?? 0 ),
			'departmentName'  => (string) ( $row['department_name'] ?? '' ),
			'departmentSlug'  => (string) ( $row['department_slug'] ?? '' ),
			'locationId'      => (int) ( $row['location_id'] ?? 0 ),
			'locationName'    => (string) ( $row['location_name'] ?? '' ),
			'fee'             => (float) ( $row['fee'] ?? 0 ),
			'experienceYears' => (int) ( $row['experience_years'] ?? 0 ),
			'designations'    => (string) ( $row['designations'] ?? '' ),
			'bio'             => (string) ( $row['bio'] ?? '' ),
			'education'       => (string) ( $row['education'] ?? '' ),
			'experience'      => (string) ( $row['experience'] ?? '' ),
			'qualification'   => (string) ( $row['qualification'] ?? '' ),
			'address'         => (string) ( $row['address'] ?? '' ),
			'status'          => (string) ( $row['status'] ?? 'active' ),
			'schedule'        => self::get_schedule( $id ),
			'createdAt'       => (string) ( $row['created_at'] ?? '' ),
		);
	}

	/**
	 * Public shape: no e-mail / phone / user id.
	 *
	 * @param array<string,mixed> $doctor Normalised doctor.
	 * @return array<string,mixed>
	 */
	public static function public_shape( array $doctor ): array {
		unset( $doctor['email'], $doctor['phone'], $doctor['userId'], $doctor['photoId'] );

		return $doctor;
	}

	/**
	 * Validates doctor input.
	 *
	 * @param array<string,mixed> $input Input.
	 * @param int                 $id    Existing id (0 on create).
	 * @return array{data:array<string,mixed>,password:string,errors:array<string,string>}
	 */
	private static function validate( array $input, int $id ): array {
		$v    = new Validator();
		$data = array();

		$data['name']             = $v->text( $input, 'name', 2, 160 );
		$data['email']            = $v->email( $input, 'email' );
		$data['phone']            = $v->text( $input, 'phone', 0, 40, false );
		$data['department_id']    = $v->int( $input, 'departmentId', 1, PHP_INT_MAX, 0, true );
		$data['location_id']      = $v->int( $input, 'locationId', 0, PHP_INT_MAX, 0 );
		$data['fee']              = $v->money( $input, 'fee' );
		$data['experience_years'] = $v->int( $input, 'experienceYears', 0, 80, 0 );
		$data['designations']     = $v->text( $input, 'designations', 0, 190, false );
		$data['bio']              = isset( $input['bio'] ) && is_scalar( $input['bio'] ) ? wp_kses_post( (string) $input['bio'] ) : '';
		$data['education']        = $v->textarea( $input, 'education', 3000 );
		$data['experience']       = $v->textarea( $input, 'experience', 3000 );
		$data['qualification']    = $v->textarea( $input, 'qualification', 3000 );
		$data['address']          = $v->textarea( $input, 'address', 1000 );
		$data['photo_id']         = $v->int( $input, 'photoId', 0, PHP_INT_MAX, 0 );
		$data['status']           = $v->one_of( $input, 'status', array( 'active', 'inactive' ), 'active' );

		if ( $data['department_id'] > 0 && null === Catalog_Store::get( 'departments', $data['department_id'] ) ) {
			$v->add( 'departmentId', __( 'Select an existing department.', 'nexus-lead-suite' ) );
		}
		if ( $data['location_id'] > 0 && null === Catalog_Store::get( 'locations', $data['location_id'] ) ) {
			$v->add( 'locationId', __( 'Select an existing location.', 'nexus-lead-suite' ) );
		}

		$password = isset( $input['password'] ) && is_scalar( $input['password'] ) ? (string) $input['password'] : '';
		if ( 0 === $id ) {
			if ( strlen( $password ) < 8 ) {
				$v->add( 'password', __( 'Password must be at least 8 characters.', 'nexus-lead-suite' ) );
			}
		} elseif ( '' !== $password && strlen( $password ) < 8 ) {
			$v->add( 'password', __( 'Password must be at least 8 characters.', 'nexus-lead-suite' ) );
		}

		if ( '' !== $data['email'] ) {
			$existing_user = get_user_by( 'email', $data['email'] );
			if ( $existing_user ) {
				$owner = self::get_by_user( (int) $existing_user->ID );
				if ( 0 === $id || null === $owner || (int) $owner['id'] !== $id ) {
					$v->add( 'email', __( 'A user with this e-mail already exists.', 'nexus-lead-suite' ) );
				}
			}
		}

		if ( '' !== $data['name'] ) {
			$data['slug'] = self::unique_slug( isset( $input['slug'] ) && '' !== trim( (string) $input['slug'] ) ? (string) $input['slug'] : $data['name'], $id );
		}

		return array(
			'data'     => $data,
			'password' => $password,
			'errors'   => $v->errors(),
		);
	}

	/**
	 * @param string $source     Name or slug.
	 * @param int    $exclude_id Id to ignore.
	 * @return string
	 */
	public static function unique_slug( string $source, int $exclude_id = 0 ): string {
		global $wpdb;

		$base = sanitize_title( $source );
		if ( '' === $base ) {
			$base = 'doctor';
		}
		$base  = substr( $base, 0, 140 );
		$table = Schema::table( 'doctors' );
		$slug  = $base;
		$n     = 2;
		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- custom table.
		while ( (int) $wpdb->get_var( $wpdb->prepare( "SELECT id FROM {$table} WHERE slug = %s AND id <> %d", $slug, $exclude_id ) ) > 0 ) {
			$slug = $base . '-' . $n;
			++$n;
		}
		// phpcs:enable

		return $slug;
	}

	/**
	 * Creates the WP user and the doctor row.
	 *
	 * @param array<string,mixed> $input Input.
	 * @return array<string,mixed>|\WP_Error
	 */
	public static function create( array $input ) {
		global $wpdb;

		$r = self::validate( $input, 0 );
		if ( array() !== $r['errors'] ) {
			return Catalog_Store::validation_error( $r['errors'] );
		}

		$login = self::unique_login( $r['data']['email'] );
		$uid   = wp_insert_user(
			array(
				'user_login'   => $login,
				'user_email'   => $r['data']['email'],
				'user_pass'    => $r['password'],
				'display_name' => $r['data']['name'],
				'role'         => Roles::DOCTOR,
			)
		);
		if ( is_wp_error( $uid ) ) {
			return new \WP_Error( 'user_error', $uid->get_error_message(), array( 'status' => 422 ) );
		}

		$now = current_time( 'mysql' );
		$row = array_merge(
			$r['data'],
			array(
				'user_id'    => (int) $uid,
				'created_at' => $now,
				'updated_at' => $now,
			)
		);
		$ok  = $wpdb->insert( Schema::table( 'doctors' ), $row ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery -- custom table.
		if ( false === $ok ) {
			self::delete_wp_user( (int) $uid );
			return new \WP_Error( 'db_error', __( 'Could not save the doctor.', 'nexus-lead-suite' ), array( 'status' => 500 ) );
		}
		$id = (int) $wpdb->insert_id;

		if ( isset( $input['schedule'] ) && is_array( $input['schedule'] ) ) {
			self::save_schedule( $id, $input['schedule'] );
		} else {
			self::save_schedule( $id, self::default_schedule_input() );
		}

		return self::get( $id );
	}

	/**
	 * Doctor self-registration (the original's Register page has a Doctor tab). The account is
	 * created inactive: it is hidden from the public catalogue and cannot log in until an admin
	 * activates it from Nexus → Appointments → Doctors. Whether the original activates
	 * immediately is undocumented; this is the conservative choice (see spec §9).
	 *
	 * @param array<string,mixed> $input name, designations, email, phone, password, passwordConfirm, departmentId, locationId.
	 * @return array<string,mixed>|\WP_Error
	 */
	public static function register( array $input ) {
		$password = isset( $input['password'] ) && is_scalar( $input['password'] ) ? (string) $input['password'] : '';
		$confirm  = isset( $input['passwordConfirm'] ) && is_scalar( $input['passwordConfirm'] ) ? (string) $input['passwordConfirm'] : $password;
		if ( strlen( $password ) >= 8 && $password !== $confirm ) {
			return Catalog_Store::validation_error( array( 'passwordConfirm' => __( 'Passwords do not match.', 'nexus-lead-suite' ) ) );
		}
		$allowed = array_intersect_key( $input, array_flip( array( 'name', 'designations', 'email', 'phone', 'password', 'departmentId', 'locationId' ) ) );
		$allowed['status'] = 'inactive';
		$allowed['fee']    = 0;
		unset( $allowed['schedule'] );

		$doctor = self::create( $allowed );
		if ( is_wp_error( $doctor ) ) {
			return $doctor;
		}
		/**
		 * Fires after a doctor registered from the front end (account inactive until approved).
		 *
		 * @param array<string,mixed> $doctor Doctor.
		 */
		do_action( 'nexulesuite_doctor_registered', $doctor );

		return $doctor;
	}

	/**
	 * Updates doctor row (and user e-mail / password / name).
	 *
	 * @param int                 $id    Doctor id.
	 * @param array<string,mixed> $input Input.
	 * @return array<string,mixed>|\WP_Error
	 */
	public static function update( int $id, array $input ) {
		global $wpdb;

		$existing = self::get( $id );
		if ( null === $existing ) {
			return new \WP_Error( 'not_found', __( 'Doctor not found.', 'nexus-lead-suite' ), array( 'status' => 404 ) );
		}

		$merged = array_merge( $existing, $input );
		$r      = self::validate( $merged, $id );
		if ( array() !== $r['errors'] ) {
			return Catalog_Store::validation_error( $r['errors'] );
		}

		$user_update = array(
			'ID'           => $existing['userId'],
			'user_email'   => $r['data']['email'],
			'display_name' => $r['data']['name'],
		);
		if ( '' !== $r['password'] ) {
			$user_update['user_pass'] = $r['password'];
		}
		if ( $existing['userId'] > 0 ) {
			$res = wp_update_user( $user_update );
			if ( is_wp_error( $res ) ) {
				return new \WP_Error( 'user_error', $res->get_error_message(), array( 'status' => 422 ) );
			}
		}

		$r['data']['updated_at'] = current_time( 'mysql' );
		$ok = $wpdb->update( Schema::table( 'doctors' ), $r['data'], array( 'id' => $id ) ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery -- custom table.
		if ( false === $ok ) {
			return new \WP_Error( 'db_error', __( 'Could not save the doctor.', 'nexus-lead-suite' ), array( 'status' => 500 ) );
		}

		if ( isset( $input['schedule'] ) && is_array( $input['schedule'] ) ) {
			self::save_schedule( $id, $input['schedule'] );
		}

		return self::get( $id );
	}

	/**
	 * Deletes a doctor that has no appointments; otherwise refuses (deactivate instead).
	 *
	 * @param int $id Doctor id.
	 * @return true|\WP_Error
	 */
	public static function delete( int $id ) {
		global $wpdb;

		$existing = self::get( $id );
		if ( null === $existing ) {
			return new \WP_Error( 'not_found', __( 'Doctor not found.', 'nexus-lead-suite' ), array( 'status' => 404 ) );
		}

		$ap = Schema::table( 'appointments' );
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- custom table.
		$count = (int) $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM {$ap} WHERE doctor_id = %d", $id ) );
		if ( $count > 0 ) {
			return new \WP_Error( 'in_use', __( 'This doctor has appointments. Set the doctor inactive instead of deleting.', 'nexus-lead-suite' ), array( 'status' => 409 ) );
		}

		// phpcs:disable WordPress.DB.DirectDatabaseQuery.DirectQuery -- custom tables.
		$wpdb->delete( Schema::table( 'schedules' ), array( 'doctor_id' => $id ), array( '%d' ) );
		$wpdb->delete( Schema::table( 'leaves' ), array( 'doctor_id' => $id ), array( '%d' ) );
		$wpdb->delete( Schema::table( 'doctors' ), array( 'id' => $id ), array( '%d' ) );
		// phpcs:enable
		if ( $existing['userId'] > 0 ) {
			self::delete_wp_user( (int) $existing['userId'] );
		}

		return true;
	}

	/**
	 * Unique user_login derived from the e-mail.
	 *
	 * @param string $email E-mail.
	 * @return string
	 */
	public static function unique_login( string $email ): string {
		$base = sanitize_user( strstr( $email, '@', true ) ?: $email, true );
		if ( '' === $base ) {
			$base = 'user';
		}
		$login = $base;
		$n     = 2;
		while ( username_exists( $login ) ) {
			$login = $base . $n;
			++$n;
		}

		return $login;
	}

	/* ------------------------------------------------------------------ */
	/* Schedules                                                            */
	/* ------------------------------------------------------------------ */

	/**
	 * Seven rows, Monday..Sunday as weekday 1..6,0 (ISO-like order, 0 = Sunday).
	 *
	 * @return array<int,array<string,mixed>>
	 */
	public static function default_schedule_input(): array {
		$rows = array();
		foreach ( array( 1, 2, 3, 4, 5, 6, 0 ) as $wd ) {
			$rows[] = array(
				'weekday'     => $wd,
				'enabled'     => in_array( $wd, array( 1, 2, 3, 4, 5 ), true ),
				'startTime'   => '09:00',
				'endTime'     => '17:00',
				'slotMinutes' => (int) Settings::get()['slotMinutes'],
			);
		}

		return $rows;
	}

	/**
	 * Returns 7 schedule rows ordered Mon..Sun (missing rows are disabled defaults).
	 *
	 * @param int $doctor_id Doctor id.
	 * @return array<int,array{weekday:int,enabled:bool,startTime:string,endTime:string,slotMinutes:int}>
	 */
	public static function get_schedule( int $doctor_id ): array {
		global $wpdb;

		$t = Schema::table( 'schedules' );
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- custom table.
		$rows = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$t} WHERE doctor_id = %d", $doctor_id ), ARRAY_A );
		$by   = array();
		foreach ( (array) $rows as $r ) {
			$by[ (int) $r['weekday'] ] = $r;
		}

		$out = array();
		foreach ( array( 1, 2, 3, 4, 5, 6, 0 ) as $wd ) {
			$r     = $by[ $wd ] ?? null;
			$out[] = array(
				'weekday'     => $wd,
				'enabled'     => $r ? (bool) (int) $r['enabled'] : false,
				'startTime'   => $r ? (string) $r['start_time'] : '09:00',
				'endTime'     => $r ? (string) $r['end_time'] : '17:00',
				'slotMinutes' => $r ? (int) $r['slot_minutes'] : (int) Settings::get()['slotMinutes'],
			);
		}

		return $out;
	}

	/**
	 * Validates and persists schedule rows.
	 *
	 * @param int                             $doctor_id Doctor id.
	 * @param array<int,array<string,mixed>>  $rows      Rows with weekday, enabled, startTime, endTime, slotMinutes.
	 * @return array<int,array<string,mixed>>|\WP_Error
	 */
	public static function save_schedule( int $doctor_id, array $rows ) {
		global $wpdb;

		$v     = new Validator();
		$clean = array();
		foreach ( $rows as $i => $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}
			$wd = isset( $row['weekday'] ) ? (int) $row['weekday'] : -1;
			if ( $wd < 0 || $wd > 6 ) {
				$v->add( "schedule.{$i}.weekday", __( 'Weekday must be 0 (Sunday) to 6 (Saturday).', 'nexus-lead-suite' ) );
				continue;
			}
			$enabled = ! empty( $row['enabled'] ) && 'false' !== $row['enabled'];
			$start   = $v->time( $row, 'startTime', '09:00' );
			$end     = $v->time( $row, 'endTime', '17:00' );
			$slot    = $v->int( $row, 'slotMinutes', 5, 240, (int) Settings::get()['slotMinutes'] );
			if ( $enabled && Availability::minutes( $start ) >= Availability::minutes( $end ) ) {
				$v->add( "schedule.{$wd}.endTime", __( 'End time must be after start time.', 'nexus-lead-suite' ) );
			}
			$clean[ $wd ] = array(
				'doctor_id'    => $doctor_id,
				'weekday'      => $wd,
				'enabled'      => $enabled ? 1 : 0,
				'start_time'   => $start,
				'end_time'     => $end,
				'slot_minutes' => $slot,
			);
		}
		if ( $v->fails() ) {
			return Catalog_Store::validation_error( $v->errors() );
		}

		$t = Schema::table( 'schedules' );
		foreach ( $clean as $wd => $data ) {
			// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- custom table.
			$existing_id = (int) $wpdb->get_var( $wpdb->prepare( "SELECT id FROM {$t} WHERE doctor_id = %d AND weekday = %d", $doctor_id, $wd ) );
			if ( $existing_id > 0 ) {
				$wpdb->update( $t, $data, array( 'id' => $existing_id ) );
			} else {
				$wpdb->insert( $t, $data );
			}
			// phpcs:enable
		}

		return self::get_schedule( $doctor_id );
	}

	/* ------------------------------------------------------------------ */
	/* Leave days                                                           */
	/* ------------------------------------------------------------------ */

	/**
	 * @param int  $doctor_id     Doctor id.
	 * @param bool $upcoming_only Only today and later.
	 * @return array<int,array{id:int,date:string,note:string}>
	 */
	public static function get_leaves( int $doctor_id, bool $upcoming_only = false ): array {
		global $wpdb;

		$t   = Schema::table( 'leaves' );
		$sql = "SELECT * FROM {$t} WHERE doctor_id = %d";
		$p   = array( $doctor_id );
		if ( $upcoming_only ) {
			$sql .= ' AND leave_date >= %s';
			$p[]  = Availability::today();
		}
		$sql .= ' ORDER BY leave_date ASC';
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- custom table.
		$rows = $wpdb->get_results( $wpdb->prepare( $sql, $p ), ARRAY_A );
		$out  = array();
		foreach ( (array) $rows as $r ) {
			$out[] = array(
				'id'   => (int) $r['id'],
				'date' => (string) $r['leave_date'],
				'note' => (string) $r['note'],
			);
		}

		return $out;
	}

	/**
	 * Set of leave dates for quick lookup.
	 *
	 * @param int $doctor_id Doctor id.
	 * @return array<string,bool>
	 */
	public static function leave_dates( int $doctor_id ): array {
		$set = array();
		foreach ( self::get_leaves( $doctor_id ) as $l ) {
			$set[ $l['date'] ] = true;
		}

		return $set;
	}

	/**
	 * Adds a leave day.
	 *
	 * @param int                 $doctor_id Doctor id.
	 * @param array<string,mixed> $input     date, note.
	 * @return array{id:int,date:string,note:string}|\WP_Error
	 */
	public static function add_leave( int $doctor_id, array $input ) {
		global $wpdb;

		$v    = new Validator();
		$date = $v->date( $input, 'date' );
		$note = $v->text( $input, 'note', 0, 190, false );
		if ( '' !== $date && $date < Availability::today() ) {
			$v->add( 'date', __( 'Leave days cannot be in the past.', 'nexus-lead-suite' ) );
		}
		if ( $v->fails() ) {
			return Catalog_Store::validation_error( $v->errors() );
		}
		if ( isset( self::leave_dates( $doctor_id )[ $date ] ) ) {
			return Catalog_Store::validation_error( array( 'date' => __( 'This date is already a leave day.', 'nexus-lead-suite' ) ) );
		}

		$ok = $wpdb->insert( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery -- custom table.
			Schema::table( 'leaves' ),
			array(
				'doctor_id'  => $doctor_id,
				'leave_date' => $date,
				'note'       => $note,
				'created_at' => current_time( 'mysql' ),
			)
		);
		if ( false === $ok ) {
			return new \WP_Error( 'db_error', __( 'Could not save the leave day.', 'nexus-lead-suite' ), array( 'status' => 500 ) );
		}

		return array(
			'id'   => (int) $wpdb->insert_id,
			'date' => $date,
			'note' => $note,
		);
	}

	/**
	 * Removes a leave day owned by the doctor.
	 *
	 * @param int $doctor_id Doctor id.
	 * @param int $leave_id  Leave id.
	 * @return bool
	 */
	public static function delete_leave( int $doctor_id, int $leave_id ): bool {
		global $wpdb;

		$n = $wpdb->delete( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery -- custom table.
			Schema::table( 'leaves' ),
			array(
				'id'        => $leave_id,
				'doctor_id' => $doctor_id,
			),
			array( '%d', '%d' )
		);

		return is_int( $n ) && $n > 0;
	}

	/**
	 * wp_delete_user() lives in wp-admin/includes/user.php, which is not loaded on REST or
	 * front-end requests.
	 *
	 * @param int $user_id User id.
	 * @return void
	 */
	private static function delete_wp_user( int $user_id ): void {
		if ( ! function_exists( 'wp_delete_user' ) ) {
			require_once ABSPATH . 'wp-admin/includes/user.php';
		}
		wp_delete_user( $user_id );
	}
}
