<?php
/**
 * Test bootstrap: stubs + module load + tiny assertion runner.
 * Run: php tests/run.php
 */

declare(strict_types=1);

require_once __DIR__ . '/stubs/wp-functions.php';
require_once __DIR__ . '/stubs/class-wpdb.php';

$GLOBALS['wpdb'] = new wpdb();

require_once dirname( __DIR__ ) . '/core/appointments/class-module.php';
\nexulesuite_\Appointments\Module::load();

final class T {
	public static $passed = 0;
	public static $failed = 0;
	public static $failures = array();
	public static $current = '';

	public static function test( string $name, callable $fn ): void {
		self::$current = $name;
		try {
			$fn();
			self::$passed++;
			echo "  ok   {$name}\n";
		} catch ( Throwable $e ) {
			self::$failed++;
			self::$failures[] = $name . ': ' . $e->getMessage() . ' @ ' . basename( $e->getFile() ) . ':' . $e->getLine();
			echo "  FAIL {$name}\n       " . $e->getMessage() . ' @ ' . basename( $e->getFile() ) . ':' . $e->getLine() . "\n";
		}
	}

	public static function eq( $expected, $actual, string $msg = '' ): void {
		if ( $expected !== $actual ) {
			throw new RuntimeException( ( $msg ? $msg . ' — ' : '' ) . 'expected ' . var_export( $expected, true ) . ', got ' . var_export( $actual, true ) );
		}
	}

	public static function ok( $cond, string $msg = 'expected truthy' ): void {
		if ( ! $cond ) {
			throw new RuntimeException( $msg );
		}
	}

	public static function err( $value, string $code = '', string $msg = '' ): void {
		if ( ! is_wp_error( $value ) ) {
			throw new RuntimeException( ( $msg ? $msg . ' — ' : '' ) . 'expected WP_Error, got ' . var_export( $value, true ) );
		}
		if ( '' !== $code && $value->get_error_code() !== $code ) {
			throw new RuntimeException( ( $msg ? $msg . ' — ' : '' ) . "expected error code {$code}, got " . $value->get_error_code() . ' (' . $value->get_error_message() . ')' );
		}
	}

	public static function not_err( $value, string $msg = '' ): void {
		if ( is_wp_error( $value ) ) {
			throw new RuntimeException( ( $msg ? $msg . ' — ' : '' ) . 'unexpected WP_Error ' . $value->get_error_code() . ': ' . $value->get_error_message() . ' ' . json_encode( $value->get_error_data() ) );
		}
	}

	public static function summary(): int {
		echo "\n" . self::$passed . ' passed, ' . self::$failed . " failed\n";
		foreach ( self::$failures as $f ) {
			echo "  - {$f}\n";
		}
		return self::$failed > 0 ? 1 : 0;
	}
}

/** Fresh database, users, options for each test. */
function reset_world(): void {
	global $wpdb;
	$wpdb = new wpdb();
	$GLOBALS['wpdb'] = $wpdb;
	WP_Test_State::reset();
	\nexulesuite_\Appointments\Availability::$now_override = null;
	\nexulesuite_\Appointments\Schema::install();
	\nexulesuite_\Appointments\Roles::install();
	$admin = wp_insert_user( array( 'user_login' => 'admin', 'user_email' => 'admin@example.test', 'user_pass' => 'adminpass123', 'role' => 'administrator' ) );
	wp_set_current_user( (int) $admin );
}

/** Seeds one department, one location, one active doctor (Mon–Fri 09:00–12:00, 30 min). */
function seed_doctor( array $overrides = array() ): array {
	$dep = \nexulesuite_\Appointments\Catalog_Store::create( 'departments', array( 'name' => 'Cardiology', 'description' => 'Heart' ) );
	$loc = \nexulesuite_\Appointments\Catalog_Store::create( 'locations', array( 'name' => 'New York' ) );
	$doc = \nexulesuite_\Appointments\Doctors_Store::create( array_merge( array(
		'name' => 'Dr. Jane Roe', 'email' => 'jane@example.test', 'password' => 'secret-pass-1',
		'departmentId' => $dep['id'], 'locationId' => $loc['id'], 'fee' => 25, 'experienceYears' => 10,
		'schedule' => array(
			array( 'weekday' => 1, 'enabled' => true, 'startTime' => '09:00', 'endTime' => '12:00', 'slotMinutes' => 30 ),
			array( 'weekday' => 2, 'enabled' => true, 'startTime' => '09:00', 'endTime' => '12:00', 'slotMinutes' => 30 ),
			array( 'weekday' => 3, 'enabled' => true, 'startTime' => '09:00', 'endTime' => '12:00', 'slotMinutes' => 30 ),
			array( 'weekday' => 4, 'enabled' => true, 'startTime' => '09:00', 'endTime' => '12:00', 'slotMinutes' => 30 ),
			array( 'weekday' => 5, 'enabled' => true, 'startTime' => '09:00', 'endTime' => '12:00', 'slotMinutes' => 30 ),
			array( 'weekday' => 6, 'enabled' => false ),
			array( 'weekday' => 0, 'enabled' => false ),
		),
	), $overrides ) );
	if ( is_wp_error( $doc ) ) { throw new RuntimeException( 'seed_doctor failed: ' . $doc->get_error_message() . ' ' . json_encode( $doc->get_error_data() ) ); }
	return array( 'department' => $dep, 'location' => $loc, 'doctor' => $doc );
}

/** Registers a verified patient and returns the patient row. */
function seed_patient( string $email = 'pat@example.test', string $name = 'Pat Smith' ): array {
	$p = \nexulesuite_\Appointments\Patients_Store::register( array( 'name' => $name, 'email' => $email, 'password' => 'patientpass1', 'passwordConfirm' => 'patientpass1', 'phone' => '555-0100' ) );
	if ( is_wp_error( $p ) ) { throw new RuntimeException( 'seed_patient failed: ' . $p->get_error_message() . ' ' . json_encode( $p->get_error_data() ) ); }
	update_user_meta( $p['userId'], \nexulesuite_\Appointments\Patients_Store::META_VERIFIED, '1' );
	// Booking requires a complete profile (phone + address), as on the original.
	$p = \nexulesuite_\Appointments\Patients_Store::update_profile( $p['id'], array( 'address' => '1 Test Street' ) );
	return $p;
}
