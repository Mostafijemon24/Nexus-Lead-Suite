<?php
/**
 * Doctor and patient roles for the appointment module.
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
 * Registers the two front-end roles. Admins keep `manage_options`.
 */
final class Roles {

	public const DOCTOR  = 'nexulesuite_doctor';
	public const PATIENT = 'nexulesuite_patient';

	/** Capability granted to doctors (ownership is checked separately). */
	public const CAP_DOCTOR = 'nexulesuite_doctor_panel';

	/** Capability granted to patients. */
	public const CAP_PATIENT = 'nexulesuite_patient_panel';

	/**
	 * Adds the roles (idempotent).
	 *
	 * @return void
	 */
	public static function install(): void {
		if ( ! get_role( self::DOCTOR ) ) {
			add_role(
				self::DOCTOR,
				__( 'Doctor (Nexus)', 'nexus-lead-suite' ),
				array(
					'read'          => true,
					self::CAP_DOCTOR => true,
				)
			);
		}
		if ( ! get_role( self::PATIENT ) ) {
			add_role(
				self::PATIENT,
				__( 'Patient (Nexus)', 'nexus-lead-suite' ),
				array(
					'read'           => true,
					self::CAP_PATIENT => true,
				)
			);
		}
	}

	/**
	 * Removes the roles (uninstall with data erase only).
	 *
	 * @return void
	 */
	public static function remove(): void {
		remove_role( self::DOCTOR );
		remove_role( self::PATIENT );
	}

	/**
	 * Whether the given user id has the doctor role.
	 *
	 * @param int $user_id User id.
	 * @return bool
	 */
	public static function is_doctor( int $user_id ): bool {
		return $user_id > 0 && user_can( $user_id, self::CAP_DOCTOR );
	}

	/**
	 * Whether the given user id has the patient role.
	 *
	 * @param int $user_id User id.
	 * @return bool
	 */
	public static function is_patient( int $user_id ): bool {
		return $user_id > 0 && user_can( $user_id, self::CAP_PATIENT );
	}

	/**
	 * Whether the given user id is a site admin for this module.
	 *
	 * @param int $user_id User id.
	 * @return bool
	 */
	public static function is_admin( int $user_id ): bool {
		return $user_id > 0 && user_can( $user_id, 'manage_options' );
	}
}
