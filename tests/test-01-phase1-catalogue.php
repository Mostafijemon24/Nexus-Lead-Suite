<?php
declare(strict_types=1);

use nexulesuite_\Appointments\Schema;
use nexulesuite_\Appointments\Roles;
use nexulesuite_\Appointments\Catalog_Store;
use nexulesuite_\Appointments\Doctors_Store;
use nexulesuite_\Appointments\Availability;
use nexulesuite_\Appointments\Settings;

T::test( 'schema creates all 11 appointment tables', function () {
	reset_world();
	global $wpdb;
	$tables = $wpdb->get_col( "SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'wp_nexulesuite_appt_%'" );
	T::eq( 11, count( $tables ) );
	foreach ( Schema::all_tables() as $t ) { T::ok( in_array( $t, $tables, true ), "missing table {$t}" ); }
} );

T::test( 'roles are installed with their capabilities', function () {
	reset_world();
	T::ok( get_role( Roles::DOCTOR ) instanceof WP_Role );
	T::ok( get_role( Roles::PATIENT ) instanceof WP_Role );
	T::ok( get_role( Roles::DOCTOR )->has_cap( Roles::CAP_DOCTOR ) );
	T::ok( ! get_role( Roles::PATIENT )->has_cap( Roles::CAP_DOCTOR ) );
	Roles::install(); // idempotent
	T::ok( get_role( Roles::DOCTOR ) instanceof WP_Role );
} );

T::test( 'department create validates name and builds unique slugs', function () {
	reset_world();
	$r = Catalog_Store::create( 'departments', array( 'name' => 'A' ) );
	T::err( $r, 'validation_failed' );
	T::ok( isset( $r->get_error_data()['errors']['name'] ) );
	T::eq( 422, $r->get_error_data()['status'] );

	$a = Catalog_Store::create( 'departments', array( 'name' => 'Cardiology', 'description' => '<b>Heart</b> care', 'icon' => 'heart-pulse' ) );
	T::not_err( $a );
	T::eq( 'cardiology', $a['slug'] );
	T::eq( 'Heart care', $a['description'] );
	T::eq( 'heart-pulse', $a['icon'] );
	T::eq( 'active', $a['status'] );

	$b = Catalog_Store::create( 'departments', array( 'name' => 'Cardiology' ) );
	T::not_err( $b );
	T::eq( 'cardiology-2', $b['slug'] );
	T::eq( $b, Catalog_Store::get_by_slug( 'departments', 'cardiology-2' ) );
} );

T::test( 'department update keeps slug stable, status enum enforced, delete blocked while in use', function () {
	reset_world();
	$a = Catalog_Store::create( 'departments', array( 'name' => 'Neurology' ) );
	$u = Catalog_Store::update( 'departments', $a['id'], array( 'name' => 'Neurology & Brain' ) );
	T::not_err( $u );
	T::eq( 'Neurology & Brain', $u['name'] );
	T::eq( 'neurology', $u['slug'], 'slug not regenerated when not supplied' );
	T::err( Catalog_Store::update( 'departments', $a['id'], array( 'status' => 'bogus' ) ), 'validation_failed' );
	T::err( Catalog_Store::update( 'departments', 999, array( 'name' => 'X' ) ), 'not_found' );

	$loc = Catalog_Store::create( 'locations', array( 'name' => 'Boston', 'address' => "1 Main St\nBoston" ) );
	$doc = Doctors_Store::create( array( 'name' => 'Dr. Who', 'email' => 'who@example.test', 'password' => 'password123', 'departmentId' => $a['id'], 'locationId' => $loc['id'] ) );
	T::not_err( $doc );
	T::err( Catalog_Store::delete( 'departments', $a['id'] ), 'in_use' );
	T::err( Catalog_Store::delete( 'locations', $loc['id'] ), 'in_use' );
	T::not_err( Doctors_Store::delete( $doc['id'] ) );
	T::eq( true, Catalog_Store::delete( 'departments', $a['id'] ) );
	T::eq( true, Catalog_Store::delete( 'locations', $loc['id'] ) );
	T::eq( null, Catalog_Store::get( 'departments', $a['id'] ) );
} );

T::test( 'catalogue listing filters, searches, paginates and counts doctors', function () {
	reset_world();
	foreach ( array( 'Cardiology', 'Dermatology', 'Neurology', 'Pediatric' ) as $n ) { Catalog_Store::create( 'departments', array( 'name' => $n ) ); }
	Catalog_Store::create( 'departments', array( 'name' => 'Old Dept', 'status' => 'inactive' ) );
	$all = Catalog_Store::all( 'departments' );
	T::eq( 5, $all['total'] );
	T::eq( 4, Catalog_Store::all( 'departments', array( 'status' => 'active' ) )['total'] );
	T::eq( 1, Catalog_Store::all( 'departments', array( 'search' => 'derma' ) )['total'] );
	$p = Catalog_Store::all( 'departments', array( 'perPage' => 2, 'page' => 2 ) );
	T::eq( 2, count( $p['items'] ) );
	T::eq( 'Neurology', $p['items'][0]['name'] );
	$dep = Catalog_Store::get_by_slug( 'departments', 'cardiology' );
	$loc = Catalog_Store::create( 'locations', array( 'name' => 'NYC' ) );
	Doctors_Store::create( array( 'name' => 'Dr. A', 'email' => 'a@example.test', 'password' => 'password123', 'departmentId' => $dep['id'], 'locationId' => $loc['id'] ) );
	Doctors_Store::create( array( 'name' => 'Dr. B', 'email' => 'b@example.test', 'password' => 'password123', 'departmentId' => $dep['id'] ) );
	$with = Catalog_Store::all( 'departments', array( 'withCounts' => true ) );
	$card = array_values( array_filter( $with['items'], function ( $i ) { return 'Cardiology' === $i['name']; } ) )[0];
	T::eq( 2, $card['doctorCount'] );
} );

T::test( 'medicine types and medicines: unique type name, type must exist, delete rules', function () {
	reset_world();
	$t = Catalog_Store::create( 'medicine_types', array( 'name' => 'Tablet' ) );
	T::not_err( $t );
	T::err( Catalog_Store::create( 'medicine_types', array( 'name' => 'Tablet' ) ), 'validation_failed' );
	T::err( Catalog_Store::create( 'medicines', array( 'name' => 'Paracetamol', 'typeId' => 99 ) ), 'validation_failed' );
	$m = Catalog_Store::create( 'medicines', array( 'name' => 'Paracetamol', 'typeId' => $t['id'], 'note' => '500 mg' ) );
	T::not_err( $m );
	T::eq( 'Tablet', $m['typeName'] );
	T::eq( 1, Catalog_Store::all( 'medicines', array( 'typeId' => $t['id'] ) )['total'] );
	T::err( Catalog_Store::delete( 'medicine_types', $t['id'] ), 'in_use' );
	T::eq( true, Catalog_Store::delete( 'medicines', $m['id'] ) );
	T::eq( true, Catalog_Store::delete( 'medicine_types', $t['id'] ) );
} );

T::test( 'doctor create: validation, WP user with doctor role, default schedule', function () {
	reset_world();
	$r = Doctors_Store::create( array( 'name' => 'X', 'email' => 'bad', 'password' => 'short' ) );
	T::err( $r, 'validation_failed' );
	$errs = $r->get_error_data()['errors'];
	foreach ( array( 'name', 'email', 'password', 'departmentId' ) as $f ) { T::ok( isset( $errs[ $f ] ), "expected error on {$f}" ); }

	$dep = Catalog_Store::create( 'departments', array( 'name' => 'Cardiology' ) );
	$d   = Doctors_Store::create( array( 'name' => 'Dr. Miguel Silva', 'email' => 'Miguel@Example.test', 'password' => 'password123', 'departmentId' => $dep['id'], 'fee' => '9', 'experienceYears' => 12, 'bio' => '<p>Hello</p><script>x</script>' ) );
	T::not_err( $d );
	T::eq( 'dr-miguel-silva', $d['slug'] );
	T::eq( 'miguel@example.test', $d['email'] );
	T::eq( 9.0, $d['fee'] );
	T::eq( 'Cardiology', $d['departmentName'] );
	T::ok( false === strpos( $d['bio'], '<script' ) );
	$user = get_userdata( $d['userId'] );
	T::ok( $user && in_array( Roles::DOCTOR, $user->roles, true ), 'WP user has doctor role' );
	T::ok( user_can( $d['userId'], Roles::CAP_DOCTOR ) );
	T::eq( 7, count( $d['schedule'] ) );
	T::eq( array( 1, 2, 3, 4, 5, 6, 0 ), array_column( $d['schedule'], 'weekday' ) );
	T::eq( true, $d['schedule'][0]['enabled'], 'Monday enabled by default' );
	T::eq( false, $d['schedule'][6]['enabled'], 'Sunday disabled by default' );
	T::eq( $d, Doctors_Store::get_by_user( $d['userId'] ) );
	T::eq( $d, Doctors_Store::get_by_slug( 'dr-miguel-silva' ) );

	T::err( Doctors_Store::create( array( 'name' => 'Dup', 'email' => 'miguel@example.test', 'password' => 'password123', 'departmentId' => $dep['id'] ) ), 'validation_failed', 'duplicate e-mail rejected' );
	$second = Doctors_Store::create( array( 'name' => 'Dr. Miguel Silva', 'email' => 'm2@example.test', 'password' => 'password123', 'departmentId' => $dep['id'] ) );
	T::eq( 'dr-miguel-silva-2', $second['slug'] );
	$pub = Doctors_Store::public_shape( $d );
	T::ok( ! isset( $pub['email'] ) && ! isset( $pub['userId'] ) && ! isset( $pub['phone'] ) );
} );

T::test( 'doctor update changes user e-mail and password; delete refuses when appointments exist', function () {
	reset_world();
	$s = seed_doctor();
	$d = $s['doctor'];
	$u = Doctors_Store::update( $d['id'], array( 'email' => 'new@example.test', 'password' => 'newpassword9', 'fee' => 40, 'status' => 'inactive' ) );
	T::not_err( $u );
	T::eq( 'new@example.test', $u['email'] );
	T::eq( 40.0, $u['fee'] );
	T::eq( 'inactive', $u['status'] );
	T::eq( 'new@example.test', get_userdata( $d['userId'] )->user_email );
	T::ok( wp_check_password( 'newpassword9', get_userdata( $d['userId'] )->user_pass ) );
	T::err( Doctors_Store::update( $d['id'], array( 'password' => 'abc' ) ), 'validation_failed' );
	T::err( Doctors_Store::update( 999, array( 'name' => 'x' ) ), 'not_found' );

	Doctors_Store::update( $d['id'], array( 'status' => 'active' ) );
	$p = seed_patient();
	Availability::$now_override = '2026-10-26 08:00';
	$a = \nexulesuite_\Appointments\Appointments_Store::book( array( 'doctorId' => $d['id'], 'patientId' => $p['id'], 'date' => '2026-10-27', 'startTime' => '09:00' ) );
	T::not_err( $a );
	T::err( Doctors_Store::delete( $d['id'] ), 'in_use' );
} );

T::test( 'doctor listing: public only, department/location filters, search', function () {
	reset_world();
	$s = seed_doctor();
	Doctors_Store::create( array( 'name' => 'Dr. Hidden', 'email' => 'h@example.test', 'password' => 'password123', 'departmentId' => $s['department']['id'], 'status' => 'inactive' ) );
	$loc2 = Catalog_Store::create( 'locations', array( 'name' => 'Boston' ) );
	Doctors_Store::create( array( 'name' => 'Dr. Boston', 'email' => 'b@example.test', 'password' => 'password123', 'departmentId' => $s['department']['id'], 'locationId' => $loc2['id'] ) );
	T::eq( 3, Doctors_Store::all()['total'] );
	T::eq( 2, Doctors_Store::all( array( 'publicOnly' => true ) )['total'] );
	T::eq( 1, Doctors_Store::all( array( 'locationId' => $loc2['id'] ) )['total'] );
	T::eq( 3, Doctors_Store::all( array( 'departmentId' => $s['department']['id'] ) )['total'] );
	T::eq( 1, Doctors_Store::all( array( 'search' => 'jane' ) )['total'] );
	T::eq( 3, Doctors_Store::all( array( 'search' => 'cardio' ) )['total'], 'search matches department name' );
} );

T::test( 'schedule save validates times and weekdays', function () {
	reset_world();
	$d = seed_doctor()['doctor'];
	$r = Doctors_Store::save_schedule( $d['id'], array( array( 'weekday' => 1, 'enabled' => true, 'startTime' => '10:00', 'endTime' => '09:00' ) ) );
	T::err( $r, 'validation_failed' );
	T::ok( isset( $r->get_error_data()['errors']['schedule.1.endTime'] ) );
	T::err( Doctors_Store::save_schedule( $d['id'], array( array( 'weekday' => 7, 'enabled' => true ) ) ), 'validation_failed' );
	T::err( Doctors_Store::save_schedule( $d['id'], array( array( 'weekday' => 1, 'enabled' => true, 'startTime' => '9am' ) ) ), 'validation_failed' );
	T::err( Doctors_Store::save_schedule( $d['id'], array( array( 'weekday' => 1, 'enabled' => true, 'slotMinutes' => 3 ) ) ), 'validation_failed' );
	$ok = Doctors_Store::save_schedule( $d['id'], array( array( 'weekday' => 6, 'enabled' => true, 'startTime' => '10:00', 'endTime' => '13:00', 'slotMinutes' => 20 ) ) );
	T::not_err( $ok );
	$sat = $ok[5];
	T::eq( 6, $sat['weekday'] );
	T::eq( true, $sat['enabled'] );
	T::eq( 20, $sat['slotMinutes'] );
	T::eq( true, $ok[0]['enabled'], 'other weekdays untouched' );
} );

T::test( 'leave days: future only, no duplicates, delete scoped to owner', function () {
	reset_world();
	Availability::$now_override = '2026-10-26 09:00';
	$d  = seed_doctor()['doctor'];
	$d2 = Doctors_Store::create( array( 'name' => 'Dr. Two', 'email' => 't@example.test', 'password' => 'password123', 'departmentId' => Catalog_Store::get_by_slug( 'departments', 'cardiology' )['id'] ) );
	T::err( Doctors_Store::add_leave( $d['id'], array( 'date' => '2026-10-25' ) ), 'validation_failed', 'past leave' );
	T::err( Doctors_Store::add_leave( $d['id'], array( 'date' => '2026-13-01' ) ), 'validation_failed', 'invalid date' );
	$l = Doctors_Store::add_leave( $d['id'], array( 'date' => '2026-10-30', 'note' => 'Conference' ) );
	T::not_err( $l );
	T::err( Doctors_Store::add_leave( $d['id'], array( 'date' => '2026-10-30' ) ), 'validation_failed', 'duplicate' );
	T::eq( array( '2026-10-30' => true ), Doctors_Store::leave_dates( $d['id'] ) );
	T::eq( false, Doctors_Store::delete_leave( $d2['id'], $l['id'] ), 'another doctor cannot delete it' );
	T::eq( true, Doctors_Store::delete_leave( $d['id'], $l['id'] ) );
	T::eq( array(), Doctors_Store::get_leaves( $d['id'] ) );
} );

T::test( 'availability engine: pure day computation', function () {
	$schedule = array(
		array( 'weekday' => 1, 'enabled' => true, 'startTime' => '09:00', 'endTime' => '10:30', 'slotMinutes' => 30 ),
		array( 'weekday' => 2, 'enabled' => false, 'startTime' => '09:00', 'endTime' => '17:00', 'slotMinutes' => 30 ),
	);
	$opts = array( 'now' => '2026-10-26 08:00', 'leadMinutes' => 60, 'windowDays' => 30 );
	// 2026-10-26 is a Monday.
	T::eq( 1, Availability::weekday( '2026-10-26' ) );
	$mon = Availability::compute_day( '2026-10-26', $schedule, array(), array(), $opts );
	T::eq( 'open', $mon['status'] );
	T::eq( array( '09:00', '09:30', '10:00' ), array_column( $mon['slots'], 'start' ), 'slots never exceed end time' );
	T::eq( '10:30', $mon['slots'][2]['end'] );

	$tue = Availability::compute_day( '2026-10-27', $schedule, array(), array(), $opts );
	T::eq( 'closed', $tue['status'] );
	T::eq( 'closed', Availability::compute_day( '2026-10-28', $schedule, array(), array(), $opts )['status'], 'weekday without a row' );
	T::eq( 'leave', Availability::compute_day( '2026-10-26', $schedule, array( '2026-10-26' => true ), array(), $opts )['status'] );
	T::eq( 'past', Availability::compute_day( '2026-10-19', $schedule, array(), array(), $opts )['status'] );
	T::eq( 'beyond', Availability::compute_day( '2026-12-28', $schedule, array(), array(), $opts )['status'] );
	T::eq( 'closed', Availability::compute_day( 'not-a-date', $schedule, array(), array(), $opts )['status'] );

	// Lead time: now 08:00 + 60 min => 09:00 is still bookable; at 08:29 the cutoff is 09:29 so 09:00 is gone and 09:30 stays.
	$late = Availability::compute_day( '2026-10-26', $schedule, array(), array(), array_merge( $opts, array( 'now' => '2026-10-26 08:29' ) ) );
	T::eq( array( false, true, true ), array_column( $late['slots'], 'available' ) );
	$later = Availability::compute_day( '2026-10-26', $schedule, array(), array(), array_merge( $opts, array( 'now' => '2026-10-26 08:31' ) ) );
	T::eq( array( false, false, true ), array_column( $later['slots'], 'available' ), '09:30 is only 59 minutes away' );
	// Booked slot unavailable; all booked => full.
	$b = Availability::compute_day( '2026-10-26', $schedule, array(), array( '09:30' => true ), $opts );
	T::eq( array( true, false, true ), array_column( $b['slots'], 'available' ) );
	$full = Availability::compute_day( '2026-10-26', $schedule, array(), array( '09:00' => true, '09:30' => true, '10:00' => true ), $opts );
	T::eq( 'full', $full['status'] );
	// Helpers.
	T::eq( 570, Availability::minutes( '09:30' ) );
	T::eq( '09:05', Availability::hhmm( 545 ) );
	T::eq( '09:30', Availability::slot_end( $schedule, '2026-10-26', '09:00' ) );
	T::eq( null, Availability::slot_end( $schedule, '2026-10-26', '09:10' ) );
} );

T::test( 'availability engine: database-backed month overview respects schedule, leaves and bookings', function () {
	reset_world();
	Availability::$now_override = '2026-10-26 08:00';
	Settings::save( array( 'bookingWindowDays' => 10 ) );
	$d = seed_doctor()['doctor'];
	Doctors_Store::add_leave( $d['id'], array( 'date' => '2026-10-28' ) );
	$m = Availability::month_overview( $d['id'], '2026-10' );
	T::eq( 31, count( $m ) );
	T::eq( 'past', $m['2026-10-25'] );
	T::eq( 'open', $m['2026-10-26'] );
	T::eq( 'leave', $m['2026-10-28'] );
	T::eq( 'closed', $m['2026-10-31'], 'Saturday closed' );
	T::eq( 'open', Availability::compute_day( '2026-11-05', $d['schedule'], array(), array() )['status'], 'window boundary day (today + 10) is inclusive' );
	T::eq( 'beyond', Availability::compute_day( '2026-11-06', $d['schedule'], array(), array() )['status'] );
	T::eq( array(), Availability::month_overview( $d['id'], '2026-13' ) );
	$day = Availability::for_date( $d['id'], '2026-10-27' );
	T::eq( 6, count( $day['slots'] ) );
} );

T::test( 'settings: defaults, clamping and page map', function () {
	reset_world();
	$s = Settings::get();
	T::eq( 30, $s['slotMinutes'] );
	T::eq( 'USD', $s['currency'] );
	$saved = Settings::save( array( 'slotMinutes' => 1, 'bookingWindowDays' => 9999, 'currency' => 'eur!', 'currencySymbol' => '€', 'pages' => array( 'doctors' => '12', 'bogus' => 3 ) ) );
	T::eq( 5, $saved['slotMinutes'] );
	T::eq( 365, $saved['bookingWindowDays'] );
	T::eq( 'EUR', $saved['currency'] );
	T::eq( array( 'doctors' => 12 ), $saved['pages'] );
	T::eq( 12, Settings::page_id( 'doctors' ) );
	T::eq( 0, Settings::page_id( 'auth' ) );
	T::eq( '€1,250.50', Settings::format_money( 1250.5 ) );
} );
