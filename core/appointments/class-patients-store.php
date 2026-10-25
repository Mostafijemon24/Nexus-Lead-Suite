<?php
/**
 * Patients: registration with e-mail verification, profiles, admin listing.
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
 * Patient rows pair 1:1 with WordPress users carrying the patient role.
 */
final class Patients_Store {

	public const META_VERIFIED   = 'nexulesuite_email_verified';
	public const META_TOKEN_HASH = 'nexulesuite_verify_token';
	public const META_TOKEN_EXP  = 'nexulesuite_verify_expires';

	/**
	 * Lists patients.
	 *
	 * @param array<string,mixed> $args search, status, page, perPage.
	 * @return array{items:array<int,array<string,mixed>>,total:int,page:int,perPage:int}
	 */
	public static function all( array $args = array() ): array {
		global $wpdb;

		$t      = Schema::table( 'patients' );
		$ap     = Schema::table( 'appointments' );
		$where  = array( '1=1' );
		$params = array();

		$status = isset( $args['status'] ) ? sanitize_key( (string) $args['status'] ) : '';
		if ( '' !== $status && 'all' !== $status ) {
			$where[]  = 'p.status = %s';
			$params[] = $status;
		}
		$search = isset( $args['search'] ) ? trim( (string) $args['search'] ) : '';
		if ( '' !== $search ) {
			$like     = '%' . $wpdb->esc_like( $search ) . '%';
			$where[]  = '(p.name LIKE %s OR p.email LIKE %s OR p.phone LIKE %s)';
			$params[] = $like;
			$params[] = $like;
			$params[] = $like;
		}
		$page     = max( 1, (int) ( $args['page'] ?? 1 ) );
		$per_page = max( 1, min( 200, (int) ( $args['perPage'] ?? 20 ) ) );
		$offset   = ( $page - 1 ) * $per_page;
		$where_sql = implode( ' AND ', $where );

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- custom tables.
		$count_sql = "SELECT COUNT(*) FROM {$t} p WHERE {$where_sql}";
		$total     = (int) ( $params ? $wpdb->get_var( $wpdb->prepare( $count_sql, $params ) ) : $wpdb->get_var( $count_sql ) );
		$list_sql  = "SELECT p.*, (SELECT COUNT(*) FROM {$ap} a WHERE a.patient_id = p.id) AS appointment_count FROM {$t} p WHERE {$where_sql} ORDER BY p.created_at DESC, p.id DESC LIMIT %d OFFSET %d";
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
	 * @param int $id Patient id.
	 * @return array<string,mixed>|null
	 */
	public static function get( int $id ): ?array {
		global $wpdb;
		if ( $id <= 0 ) {
			return null;
		}
		$t = Schema::table( 'patients' );
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- custom table.
		$row = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$t} WHERE id = %d", $id ), ARRAY_A );

		return $row ? self::normalize( (array) $row ) : null;
	}

	/**
	 * @param int $user_id WP user id.
	 * @return array<string,mixed>|null
	 */
	public static function get_by_user( int $user_id ): ?array {
		global $wpdb;
		if ( $user_id <= 0 ) {
			return null;
		}
		$t = Schema::table( 'patients' );
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- custom table.
		$row = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$t} WHERE user_id = %d", $user_id ), ARRAY_A );

		return $row ? self::normalize( (array) $row ) : null;
	}

	/**
	 * @param array<string,mixed> $row Row.
	 * @return array<string,mixed>
	 */
	public static function normalize( array $row ): array {
		$uid = (int) ( $row['user_id'] ?? 0 );

		return array(
			'id'               => (int) $row['id'],
			'userId'           => $uid,
			'name'             => (string) $row['name'],
			'email'            => (string) $row['email'],
			'phone'            => (string) ( $row['phone'] ?? '' ),
			'address'          => (string) ( $row['address'] ?? '' ),
			'status'           => (string) ( $row['status'] ?? 'active' ),
			'emailVerified'    => $uid > 0 ? '1' === (string) get_user_meta( $uid, self::META_VERIFIED, true ) : false,
			'appointmentCount' => (int) ( $row['appointment_count'] ?? 0 ),
			'createdAt'        => (string) ( $row['created_at'] ?? '' ),
		);
	}

	/**
	 * Registers a patient: WP user + patient row + verification e-mail.
	 *
	 * @param array<string,mixed> $input name, email, phone, password, passwordConfirm.
	 * @return array<string,mixed>|\WP_Error
	 */
	public static function register( array $input ) {
		global $wpdb;

		$v        = new Validator();
		$name     = $v->text( $input, 'name', 2, 160 );
		$email    = $v->email( $input, 'email' );
		$phone    = $v->text( $input, 'phone', 0, 40, false );
		$password = isset( $input['password'] ) && is_scalar( $input['password'] ) ? (string) $input['password'] : '';
		$confirm  = isset( $input['passwordConfirm'] ) && is_scalar( $input['passwordConfirm'] ) ? (string) $input['passwordConfirm'] : $password;
		if ( strlen( $password ) < 8 ) {
			$v->add( 'password', __( 'Password must be at least 8 characters.', 'nexus-lead-suite' ) );
		} elseif ( $password !== $confirm ) {
			$v->add( 'passwordConfirm', __( 'Passwords do not match.', 'nexus-lead-suite' ) );
		}
		if ( '' !== $email && email_exists( $email ) ) {
			$v->add( 'email', __( 'An account with this e-mail already exists. Please log in.', 'nexus-lead-suite' ) );
		}
		if ( $v->fails() ) {
			return Catalog_Store::validation_error( $v->errors() );
		}

		$uid = wp_insert_user(
			array(
				'user_login'   => Doctors_Store::unique_login( $email ),
				'user_email'   => $email,
				'user_pass'    => $password,
				'display_name' => $name,
				'role'         => Roles::PATIENT,
			)
		);
		if ( is_wp_error( $uid ) ) {
			return new \WP_Error( 'user_error', $uid->get_error_message(), array( 'status' => 422 ) );
		}

		$now = current_time( 'mysql' );
		$ok  = $wpdb->insert( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery -- custom table.
			Schema::table( 'patients' ),
			array(
				'user_id'    => (int) $uid,
				'name'       => $name,
				'email'      => $email,
				'phone'      => $phone,
				'address'    => '',
				'status'     => 'active',
				'created_at' => $now,
				'updated_at' => $now,
			)
		);
		if ( false === $ok ) {
			wp_delete_user( (int) $uid );
			return new \WP_Error( 'db_error', __( 'Could not create the account.', 'nexus-lead-suite' ), array( 'status' => 500 ) );
		}

		$require = (bool) Settings::get()['requireEmailVerification'];
		update_user_meta( (int) $uid, self::META_VERIFIED, $require ? '0' : '1' );
		if ( $require ) {
			self::send_verification( (int) $uid );
		}

		return self::get( (int) $wpdb->insert_id );
	}

	/**
	 * Generates a token, stores its hash and e-mails the link.
	 *
	 * @param int $user_id User id.
	 * @return bool Whether the mail was handed to wp_mail.
	 */
	public static function send_verification( int $user_id ): bool {
		$user = get_userdata( $user_id );
		if ( ! $user ) {
			return false;
		}
		$token = wp_generate_password( 32, false, false );
		update_user_meta( $user_id, self::META_TOKEN_HASH, wp_hash( $token ) );
		update_user_meta( $user_id, self::META_TOKEN_EXP, (string) ( time() + DAY_IN_SECONDS ) );

		$url = add_query_arg(
			array(
				'nexulesuite_verify' => $token,
				'uid'                => $user_id,
			),
			home_url( '/' )
		);

		$subject = sprintf(
			/* translators: %s: site name */
			__( 'Confirm your e-mail for %s', 'nexus-lead-suite' ),
			wp_specialchars_decode( (string) get_bloginfo( 'name' ), ENT_QUOTES )
		);
		$body = sprintf(
			/* translators: 1: name, 2: verification URL */
			__( "Hi %1\$s,\n\nPlease confirm your e-mail address to activate your patient account:\n%2\$s\n\nThe link is valid for 24 hours.", 'nexus-lead-suite' ),
			$user->display_name,
			$url
		);

		return (bool) wp_mail( $user->user_email, $subject, $body );
	}

	/**
	 * Validates a verification token.
	 *
	 * @param int    $user_id User id.
	 * @param string $token   Token from the link.
	 * @return bool
	 */
	public static function verify( int $user_id, string $token ): bool {
		if ( $user_id <= 0 || '' === $token ) {
			return false;
		}
		if ( '1' === (string) get_user_meta( $user_id, self::META_VERIFIED, true ) ) {
			return true;
		}
		$hash = (string) get_user_meta( $user_id, self::META_TOKEN_HASH, true );
		$exp  = (int) get_user_meta( $user_id, self::META_TOKEN_EXP, true );
		if ( '' === $hash || $exp < time() || ! hash_equals( $hash, wp_hash( $token ) ) ) {
			return false;
		}
		update_user_meta( $user_id, self::META_VERIFIED, '1' );
		delete_user_meta( $user_id, self::META_TOKEN_HASH );
		delete_user_meta( $user_id, self::META_TOKEN_EXP );

		return true;
	}

	/**
	 * @param int $user_id User id.
	 * @return bool
	 */
	public static function is_verified( int $user_id ): bool {
		return '1' === (string) get_user_meta( $user_id, self::META_VERIFIED, true );
	}

	/**
	 * Patient edits own profile.
	 *
	 * @param int                 $patient_id Patient id.
	 * @param array<string,mixed> $input      name, phone, address.
	 * @return array<string,mixed>|\WP_Error
	 */
	public static function update_profile( int $patient_id, array $input ) {
		global $wpdb;

		$existing = self::get( $patient_id );
		if ( null === $existing ) {
			return new \WP_Error( 'not_found', __( 'Patient not found.', 'nexus-lead-suite' ), array( 'status' => 404 ) );
		}
		$merged  = array_merge( $existing, $input );
		$v       = new Validator();
		$name    = $v->text( $merged, 'name', 2, 160 );
		$phone   = $v->text( $merged, 'phone', 0, 40, false );
		$address = $v->textarea( $merged, 'address', 1000 );
		if ( $v->fails() ) {
			return Catalog_Store::validation_error( $v->errors() );
		}

		$wpdb->update( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery -- custom table.
			Schema::table( 'patients' ),
			array(
				'name'       => $name,
				'phone'      => $phone,
				'address'    => $address,
				'updated_at' => current_time( 'mysql' ),
			),
			array( 'id' => $patient_id )
		);
		if ( $existing['userId'] > 0 ) {
			wp_update_user(
				array(
					'ID'           => $existing['userId'],
					'display_name' => $name,
				)
			);
		}

		return self::get( $patient_id );
	}

	/**
	 * Admin sets status.
	 *
	 * @param int    $patient_id Patient id.
	 * @param string $status     active | inactive.
	 * @return array<string,mixed>|\WP_Error
	 */
	public static function set_status( int $patient_id, string $status ) {
		global $wpdb;

		if ( ! in_array( $status, array( 'active', 'inactive' ), true ) ) {
			return Catalog_Store::validation_error( array( 'status' => __( 'Invalid status.', 'nexus-lead-suite' ) ) );
		}
		if ( null === self::get( $patient_id ) ) {
			return new \WP_Error( 'not_found', __( 'Patient not found.', 'nexus-lead-suite' ), array( 'status' => 404 ) );
		}
		$wpdb->update( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery -- custom table.
			Schema::table( 'patients' ),
			array(
				'status'     => $status,
				'updated_at' => current_time( 'mysql' ),
			),
			array( 'id' => $patient_id )
		);

		return self::get( $patient_id );
	}

	/**
	 * Changes the password after checking the current one.
	 *
	 * @param int                 $user_id User id.
	 * @param array<string,mixed> $input   currentPassword, newPassword, newPasswordConfirm.
	 * @return true|\WP_Error
	 */
	public static function change_password( int $user_id, array $input ) {
		$user = get_userdata( $user_id );
		if ( ! $user ) {
			return new \WP_Error( 'not_found', __( 'User not found.', 'nexus-lead-suite' ), array( 'status' => 404 ) );
		}
		$v       = new Validator();
		$current = isset( $input['currentPassword'] ) && is_scalar( $input['currentPassword'] ) ? (string) $input['currentPassword'] : '';
		$new     = isset( $input['newPassword'] ) && is_scalar( $input['newPassword'] ) ? (string) $input['newPassword'] : '';
		$confirm = isset( $input['newPasswordConfirm'] ) && is_scalar( $input['newPasswordConfirm'] ) ? (string) $input['newPasswordConfirm'] : '';
		if ( ! wp_check_password( $current, $user->user_pass, $user_id ) ) {
			$v->add( 'currentPassword', __( 'The current password is incorrect.', 'nexus-lead-suite' ) );
		}
		if ( strlen( $new ) < 8 ) {
			$v->add( 'newPassword', __( 'Password must be at least 8 characters.', 'nexus-lead-suite' ) );
		} elseif ( $new !== $confirm ) {
			$v->add( 'newPasswordConfirm', __( 'Passwords do not match.', 'nexus-lead-suite' ) );
		}
		if ( $v->fails() ) {
			return Catalog_Store::validation_error( $v->errors() );
		}
		wp_set_password( $new, $user_id );

		return true;
	}
}
