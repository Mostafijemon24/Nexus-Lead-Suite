<?php
/**
 * Appointment module tables (departments, locations, doctors, schedules, leaves,
 * medicines, patients, appointments, treatments, prescription items).
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
 * Table names and dbDelta definitions for the appointment module.
 */
final class Schema {

	/**
	 * Short table keys => suffix after the WP prefix.
	 *
	 * @var array<string,string>
	 */
	private const TABLES = array(
		'departments'   => 'nexulesuite_appt_departments',
		'locations'     => 'nexulesuite_appt_locations',
		'doctors'       => 'nexulesuite_appt_doctors',
		'schedules'     => 'nexulesuite_appt_schedules',
		'leaves'        => 'nexulesuite_appt_leaves',
		'medicine_types'=> 'nexulesuite_appt_medicine_types',
		'medicines'     => 'nexulesuite_appt_medicines',
		'patients'      => 'nexulesuite_appt_patients',
		'appointments'  => 'nexulesuite_appt_appointments',
		'treatments'    => 'nexulesuite_appt_treatments',
		'prescriptions' => 'nexulesuite_appt_prescription_items',
	);

	/**
	 * Qualified table name.
	 *
	 * @param string $key One of the keys of {@see self::TABLES}.
	 * @return string
	 */
	public static function table( string $key ): string {
		global $wpdb;

		if ( ! isset( self::TABLES[ $key ] ) ) {
			throw new \InvalidArgumentException( 'Unknown appointment table: ' . $key );
		}

		return $wpdb->prefix . self::TABLES[ $key ];
	}

	/**
	 * All qualified table names (used by uninstall).
	 *
	 * @return array<int,string>
	 */
	public static function all_tables(): array {
		$out = array();
		foreach ( array_keys( self::TABLES ) as $key ) {
			$out[] = self::table( $key );
		}

		return $out;
	}

	/**
	 * CREATE TABLE statements in dbDelta format (two spaces after PRIMARY KEY, one column per line).
	 *
	 * @return array<int,string>
	 */
	public static function create_statements(): array {
		global $wpdb;

		$c = $wpdb->get_charset_collate();
		$t = array();
		foreach ( array_keys( self::TABLES ) as $key ) {
			$t[ $key ] = self::table( $key );
		}

		return array(
			"CREATE TABLE {$t['departments']} (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			name varchar(120) NOT NULL DEFAULT '',
			slug varchar(140) NOT NULL DEFAULT '',
			description text NULL,
			icon varchar(64) NOT NULL DEFAULT '',
			status varchar(16) NOT NULL DEFAULT 'active',
			created_at datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
			updated_at datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
			PRIMARY KEY  (id),
			UNIQUE KEY slug (slug),
			KEY status (status)
		) {$c};",

			"CREATE TABLE {$t['locations']} (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			name varchar(120) NOT NULL DEFAULT '',
			slug varchar(140) NOT NULL DEFAULT '',
			address text NULL,
			status varchar(16) NOT NULL DEFAULT 'active',
			created_at datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
			updated_at datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
			PRIMARY KEY  (id),
			UNIQUE KEY slug (slug),
			KEY status (status)
		) {$c};",

			"CREATE TABLE {$t['doctors']} (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			user_id bigint(20) unsigned NOT NULL DEFAULT 0,
			slug varchar(160) NOT NULL DEFAULT '',
			name varchar(160) NOT NULL DEFAULT '',
			email varchar(190) NOT NULL DEFAULT '',
			phone varchar(40) NOT NULL DEFAULT '',
			photo_id bigint(20) unsigned NOT NULL DEFAULT 0,
			department_id bigint(20) unsigned NOT NULL DEFAULT 0,
			location_id bigint(20) unsigned NOT NULL DEFAULT 0,
			fee decimal(10,2) NOT NULL DEFAULT 0.00,
			experience_years smallint(5) unsigned NOT NULL DEFAULT 0,
			bio longtext NULL,
			address text NULL,
			status varchar(16) NOT NULL DEFAULT 'active',
			created_at datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
			updated_at datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
			PRIMARY KEY  (id),
			UNIQUE KEY slug (slug),
			UNIQUE KEY user_id (user_id),
			KEY department_id (department_id),
			KEY location_id (location_id),
			KEY status (status)
		) {$c};",

			"CREATE TABLE {$t['schedules']} (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			doctor_id bigint(20) unsigned NOT NULL DEFAULT 0,
			weekday tinyint(1) unsigned NOT NULL DEFAULT 0,
			enabled tinyint(1) unsigned NOT NULL DEFAULT 0,
			start_time varchar(5) NOT NULL DEFAULT '09:00',
			end_time varchar(5) NOT NULL DEFAULT '17:00',
			slot_minutes smallint(5) unsigned NOT NULL DEFAULT 30,
			PRIMARY KEY  (id),
			UNIQUE KEY doctor_weekday (doctor_id,weekday)
		) {$c};",

			"CREATE TABLE {$t['leaves']} (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			doctor_id bigint(20) unsigned NOT NULL DEFAULT 0,
			leave_date varchar(10) NOT NULL DEFAULT '',
			note varchar(190) NOT NULL DEFAULT '',
			created_at datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
			PRIMARY KEY  (id),
			UNIQUE KEY doctor_date (doctor_id,leave_date)
		) {$c};",

			"CREATE TABLE {$t['medicine_types']} (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			name varchar(120) NOT NULL DEFAULT '',
			status varchar(16) NOT NULL DEFAULT 'active',
			created_at datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
			updated_at datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
			PRIMARY KEY  (id),
			UNIQUE KEY name (name)
		) {$c};",

			"CREATE TABLE {$t['medicines']} (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			type_id bigint(20) unsigned NOT NULL DEFAULT 0,
			name varchar(160) NOT NULL DEFAULT '',
			note varchar(255) NOT NULL DEFAULT '',
			status varchar(16) NOT NULL DEFAULT 'active',
			created_at datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
			updated_at datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
			PRIMARY KEY  (id),
			KEY type_id (type_id),
			KEY name (name)
		) {$c};",

			"CREATE TABLE {$t['patients']} (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			user_id bigint(20) unsigned NOT NULL DEFAULT 0,
			name varchar(160) NOT NULL DEFAULT '',
			email varchar(190) NOT NULL DEFAULT '',
			phone varchar(40) NOT NULL DEFAULT '',
			address text NULL,
			status varchar(16) NOT NULL DEFAULT 'active',
			created_at datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
			updated_at datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
			PRIMARY KEY  (id),
			UNIQUE KEY user_id (user_id),
			KEY email (email)
		) {$c};",

			"CREATE TABLE {$t['appointments']} (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			code varchar(20) NOT NULL DEFAULT '',
			doctor_id bigint(20) unsigned NOT NULL DEFAULT 0,
			patient_id bigint(20) unsigned NOT NULL DEFAULT 0,
			appointment_date varchar(10) NOT NULL DEFAULT '',
			start_time varchar(5) NOT NULL DEFAULT '',
			end_time varchar(5) NOT NULL DEFAULT '',
			slot_key varchar(64) NOT NULL DEFAULT '',
			status varchar(16) NOT NULL DEFAULT 'pending',
			fee decimal(10,2) NOT NULL DEFAULT 0.00,
			payment_status varchar(16) NOT NULL DEFAULT 'unpaid',
			payment_method varchar(32) NOT NULL DEFAULT '',
			reason text NULL,
			created_at datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
			updated_at datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
			PRIMARY KEY  (id),
			UNIQUE KEY slot_key (slot_key),
			UNIQUE KEY code (code),
			KEY doctor_date (doctor_id,appointment_date),
			KEY patient_id (patient_id),
			KEY status (status)
		) {$c};",

			"CREATE TABLE {$t['treatments']} (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			appointment_id bigint(20) unsigned NOT NULL DEFAULT 0,
			doctor_id bigint(20) unsigned NOT NULL DEFAULT 0,
			patient_id bigint(20) unsigned NOT NULL DEFAULT 0,
			notes longtext NULL,
			advice text NULL,
			follow_up_date varchar(10) NOT NULL DEFAULT '',
			created_at datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
			updated_at datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
			PRIMARY KEY  (id),
			UNIQUE KEY appointment_id (appointment_id),
			KEY doctor_id (doctor_id),
			KEY patient_id (patient_id)
		) {$c};",

			"CREATE TABLE {$t['prescriptions']} (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			treatment_id bigint(20) unsigned NOT NULL DEFAULT 0,
			medicine_id bigint(20) unsigned NOT NULL DEFAULT 0,
			medicine_name varchar(160) NOT NULL DEFAULT '',
			dosage varchar(120) NOT NULL DEFAULT '',
			duration varchar(120) NOT NULL DEFAULT '',
			instruction varchar(255) NOT NULL DEFAULT '',
			sort_order smallint(5) unsigned NOT NULL DEFAULT 0,
			PRIMARY KEY  (id),
			KEY treatment_id (treatment_id)
		) {$c};",
		);
	}

	/**
	 * Creates / upgrades the tables. Caller must have loaded wp-admin/includes/upgrade.php.
	 *
	 * @return void
	 */
	public static function install(): void {
		foreach ( self::create_statements() as $sql ) {
			dbDelta( $sql );
		}
	}
}
