<?php
declare(strict_types=1);

use nexulesuite_\Appointments\Appointments_Store;
use nexulesuite_\Appointments\Availability;
use nexulesuite_\Appointments\Catalog_Store;
use nexulesuite_\Appointments\Doctors_Store;
use nexulesuite_\Appointments\Patients_Store;
use nexulesuite_\Appointments\Settings;
use nexulesuite_\Appointments\Treatments_Store;

require_once dirname( __DIR__ ) . '/api/class-appointments-api.php';
require_once dirname( __DIR__ ) . '/public/class-appointments-frontend.php';

function rest_world(): void {
	reset_world();
	$_SERVER['REMOTE_ADDR'] = '203.0.113.5';
	$api = new \nexulesuite_\Api\Appointments_Api();
	$api->register_routes();
}
function R( string $m, string $p, array $q = array(), array $json = array() ) { return wp_test_rest_dispatch( $m, '/nexulesuite_/v1' . $p, $q, $json ); }
function as_user( int $uid ): void { wp_set_current_user( $uid ); }
function as_guest(): void { wp_set_current_user( 0 ); }

T::test( 'REST: admin routes refuse guests and non-admins', function () {
	rest_world();
	as_guest();
	T::eq( 401, R( 'GET', '/appt/admin/doctors' )->get_status() );
	$p = seed_patient();
	as_user( $p['userId'] );
	T::eq( 403, R( 'GET', '/appt/admin/doctors' )->get_status() );
	T::eq( 403, R( 'POST', '/appt/admin/catalog/departments', array(), array( 'name' => 'X-ray' ) )->get_status() );
	as_user( 1 );
	T::eq( 200, R( 'GET', '/appt/admin/doctors' )->get_status() );
} );

T::test( 'REST: admin catalogue CRUD returns 201/422/409 and field errors', function () {
	rest_world();
	$r = R( 'POST', '/appt/admin/catalog/departments', array(), array( 'name' => 'Dermatology', 'description' => 'Skin' ) );
	T::eq( 201, $r->get_status() );
	$id = $r->get_data()['id'];
	$bad = R( 'POST', '/appt/admin/catalog/departments', array(), array( 'name' => '' ) );
	T::eq( 422, $bad->get_status() );
	T::eq( 'validation_failed', $bad->get_data()['code'] );
	T::ok( isset( $bad->get_data()['data']['errors']['name'] ) );
	$u = R( 'PUT', "/appt/admin/catalog/departments/{$id}", array(), array( 'status' => 'inactive' ) );
	T::eq( 'inactive', $u->get_data()['status'] );
	T::eq( 200, R( 'GET', '/appt/admin/catalog/departments' )->get_status() );
	T::eq( 1, R( 'GET', '/appt/admin/catalog/departments' )->get_data()['total'] );
	$type = R( 'POST', '/appt/admin/catalog/medicine-types', array(), array( 'name' => 'Syrup' ) )->get_data();
	R( 'POST', '/appt/admin/catalog/medicines', array(), array( 'name' => 'Cough syrup', 'typeId' => $type['id'] ) );
	T::eq( 409, R( 'DELETE', "/appt/admin/catalog/medicine-types/{$type['id']}" )->get_status() );
	T::eq( 404, R( 'DELETE', '/appt/admin/catalog/locations/999' )->get_status() );
	T::eq( true, R( 'DELETE', "/appt/admin/catalog/departments/{$id}" )->get_data()['deleted'] );
} );

T::test( 'REST: admin doctor create, schedule, leaves, dashboard and settings', function () {
	rest_world();
	Availability::$now_override = '2026-10-26 09:00';
	$dep = R( 'POST', '/appt/admin/catalog/departments', array(), array( 'name' => 'Cardiology' ) )->get_data();
	$r   = R( 'POST', '/appt/admin/doctors', array(), array( 'name' => 'Dr. Jesse Moran', 'email' => 'jesse@example.test', 'password' => 'password123', 'departmentId' => $dep['id'], 'fee' => 30 ) );
	T::eq( 201, $r->get_status() );
	$doc = $r->get_data();
	T::eq( 'dr-jesse-moran', $doc['slug'] );
	$s = R( 'PUT', "/appt/admin/doctors/{$doc['id']}/schedule", array(), array( 'schedule' => array( array( 'weekday' => 0, 'enabled' => true, 'startTime' => '08:00', 'endTime' => '11:00', 'slotMinutes' => 15 ) ) ) );
	T::eq( 200, $s->get_status() );
	T::eq( true, $s->get_data()[6]['enabled'] );
	T::eq( 422, R( 'PUT', "/appt/admin/doctors/{$doc['id']}/schedule", array(), array( 'schedule' => array( array( 'weekday' => 1, 'enabled' => true, 'startTime' => '12:00', 'endTime' => '09:00' ) ) ) )->get_status() );
	T::eq( 404, R( 'PUT', '/appt/admin/doctors/999/schedule', array(), array( 'schedule' => array() ) )->get_status() );
	$l = R( 'POST', "/appt/admin/doctors/{$doc['id']}/leaves", array(), array( 'date' => '2026-11-02', 'note' => 'Away' ) );
	T::eq( 201, $l->get_status() );
	T::eq( 1, count( R( 'GET', "/appt/admin/doctors/{$doc['id']}/leaves" )->get_data() ) );
	T::eq( 200, R( 'DELETE', "/appt/admin/doctors/{$doc['id']}/leaves/{$l->get_data()['id']}" )->get_status() );
	T::eq( 404, R( 'DELETE', "/appt/admin/doctors/{$doc['id']}/leaves/{$l->get_data()['id']}" )->get_status() );
	$g = R( 'GET', "/appt/admin/doctors/{$doc['id']}" )->get_data();
	T::eq( array(), $g['leaves'] );
	$dash = R( 'GET', '/appt/admin/dashboard' )->get_data();
	T::eq( 1, $dash['stats']['doctors'] );
	T::eq( 0, $dash['stats']['patients'] );
	$set = R( 'POST', '/appt/admin/settings', array(), array( 'slotMinutes' => 20, 'currencySymbol' => '৳' ) )->get_data();
	T::eq( 20, $set['slotMinutes'] );
	T::eq( '৳', $set['currencySymbol'] );
	T::ok( isset( $set['pageDetails']['booking']['shortcode'] ) );
	T::eq( true, R( 'DELETE', "/appt/admin/doctors/{$doc['id']}" )->get_data()['deleted'] );
	T::eq( false, get_userdata( $doc['userId'] ) );
} );

T::test( 'REST: public catalogue hides private doctor fields and inactive records', function () {
	rest_world();
	$s = seed_doctor();
	Doctors_Store::create( array( 'name' => 'Dr. Off', 'email' => 'off@example.test', 'password' => 'password123', 'departmentId' => $s['department']['id'], 'status' => 'inactive' ) );
	as_guest();
	$list = R( 'GET', '/appt/public/doctors' )->get_data();
	T::eq( 1, $list['total'] );
	T::ok( ! isset( $list['items'][0]['email'] ) && ! isset( $list['items'][0]['userId'] ) );
	T::eq( 404, R( 'GET', '/appt/public/doctors/dr-off' )->get_status() );
	$one = R( 'GET', '/appt/public/doctors/dr-jane-roe' )->get_data();
	T::eq( 'Cardiology', $one['departmentName'] );
	T::ok( ! isset( $one['email'] ) );
	T::eq( 7, count( $one['schedule'] ) );
	T::eq( 1, R( 'GET', '/appt/public/departments' )->get_data()['total'] );
	$dep = R( 'GET', '/appt/public/departments/cardiology' )->get_data();
	T::eq( 1, count( $dep['doctors'] ) );
	T::eq( 404, R( 'GET', '/appt/public/departments/nope' )->get_status() );
	T::eq( 1, R( 'GET', '/appt/public/locations' )->get_data()['total'] );
} );

T::test( 'REST: public availability endpoints validate input', function () {
	rest_world();
	Availability::$now_override = '2026-10-26 08:00';
	$d = seed_doctor()['doctor'];
	as_guest();
	T::eq( 400, R( 'GET', '/appt/public/availability', array( 'doctorId' => $d['id'], 'date' => '26/10/2026' ) )->get_status() );
	T::eq( 404, R( 'GET', '/appt/public/availability', array( 'doctorId' => 999, 'date' => '2026-10-26' ) )->get_status() );
	$day = R( 'GET', '/appt/public/availability', array( 'doctorId' => $d['id'], 'date' => '2026-10-27' ) )->get_data();
	T::eq( 'open', $day['status'] );
	T::eq( 6, count( $day['slots'] ) );
	T::eq( 400, R( 'GET', '/appt/public/availability-month', array( 'doctorId' => $d['id'], 'month' => '2026-1' ) )->get_status() );
	$m = R( 'GET', '/appt/public/availability-month', array( 'doctorId' => $d['id'], 'month' => '2026-10' ) )->get_data();
	T::eq( 31, count( $m['days'] ) );
} );

T::test( 'REST: registration sends verification; login blocked until verified; resend never reveals accounts', function () {
	rest_world();
	as_guest();
	$bad = R( 'POST', '/appt/public/register', array(), array( 'name' => 'P', 'email' => 'x', 'password' => '123', 'passwordConfirm' => '456' ) );
	T::eq( 422, $bad->get_status() );
	$errs = $bad->get_data()['data']['errors'];
	foreach ( array( 'name', 'email', 'password' ) as $f ) { T::ok( isset( $errs[ $f ] ), "error on {$f}" ); }
	$r = R( 'POST', '/appt/public/register', array(), array( 'name' => 'Pat Smith', 'email' => 'pat@example.test', 'password' => 'patientpass1', 'passwordConfirm' => 'patientpass1' ) );
	T::eq( 201, $r->get_status() );
	T::eq( true, $r->get_data()['verificationRequired'] );
	T::eq( 1, count( WP_Test_State::$mails ) );
	T::eq( 'pat@example.test', WP_Test_State::$mails[0]['to'] );
	preg_match( '/nexulesuite_verify=([A-Za-z0-9]+)&uid=(\d+)/', WP_Test_State::$mails[0]['message'], $m );
	T::ok( isset( $m[1] ), 'verification link present' );
	T::eq( 'An account with this e-mail already exists. Please log in.', R( 'POST', '/appt/public/register', array(), array( 'name' => 'Pat Smith', 'email' => 'pat@example.test', 'password' => 'patientpass1' ) )->get_data()['data']['errors']['email'] ?? '', 'duplicate e-mail' );

	as_guest();
	$login = R( 'POST', '/appt/public/login', array(), array( 'email' => 'pat@example.test', 'password' => 'patientpass1' ) );
	T::eq( 403, $login->get_status() );
	T::eq( 'email_unverified', $login->get_data()['code'] );
	T::eq( 0, get_current_user_id(), 'logged out again' );
	T::eq( 401, R( 'POST', '/appt/public/login', array(), array( 'email' => 'pat@example.test', 'password' => 'wrong' ) )->get_status() );

	T::eq( false, Patients_Store::verify( (int) $m[2], 'bogus' ) );
	T::eq( true, Patients_Store::verify( (int) $m[2], $m[1] ) );
	T::eq( true, Patients_Store::verify( (int) $m[2], 'anything-after-verified' ), 'already verified stays verified' );
	$login = R( 'POST', '/appt/public/login', array(), array( 'email' => 'pat@example.test', 'password' => 'patientpass1' ) );
	T::eq( 200, $login->get_status() );
	T::eq( (int) $m[2], $login->get_data()['userId'] );
	T::ok( '' !== $login->get_data()['nonce'] );
	T::eq( (int) $m[2], get_current_user_id() );
	as_guest();
	$count = count( WP_Test_State::$mails );
	T::eq( 200, R( 'POST', '/appt/public/resend-verification', array(), array( 'email' => 'nobody@example.test' ) )->get_status() );
	T::eq( 200, R( 'POST', '/appt/public/resend-verification', array(), array( 'email' => 'pat@example.test' ) )->get_status() );
	T::eq( $count, count( WP_Test_State::$mails ), 'no mail for unknown or already verified accounts' );
	$me = R( 'GET', '/appt/public/me' )->get_data();
	T::eq( 'guest', $me['role'] );
} );

T::test( 'REST: doctor login via type=doctor, patients rejected from doctor login', function () {
	rest_world();
	$d = seed_doctor()['doctor'];
	$p = seed_patient();
	as_guest();
	T::eq( 403, R( 'POST', '/appt/public/login', array(), array( 'email' => 'pat@example.test', 'password' => 'patientpass1', 'type' => 'doctor' ) )->get_status() );
	T::eq( 0, get_current_user_id() );
	$ok = R( 'POST', '/appt/public/login', array(), array( 'email' => 'jane@example.test', 'password' => 'secret-pass-1', 'type' => 'doctor' ) );
	T::eq( 200, $ok->get_status() );
	T::eq( 'doctor', R( 'GET', '/appt/public/me' )->get_data()['role'] );
	Doctors_Store::update( $d['id'], array( 'status' => 'inactive' ) );
	as_guest();
	T::eq( 'account_inactive', R( 'POST', '/appt/public/login', array(), array( 'email' => 'jane@example.test', 'password' => 'secret-pass-1', 'type' => 'doctor' ) )->get_data()['code'] );
} );

T::test( 'REST: public write routes are rate limited per IP', function () {
	rest_world();
	as_guest();
	for ( $i = 0; $i < 10; $i++ ) { R( 'POST', '/appt/public/login', array(), array( 'email' => 'x@example.test', 'password' => 'nope' ) ); }
	T::eq( 429, R( 'POST', '/appt/public/login', array(), array( 'email' => 'x@example.test', 'password' => 'nope' ) )->get_status() );
	$_SERVER['REMOTE_ADDR'] = '198.51.100.9';
	T::eq( 401, R( 'POST', '/appt/public/login', array(), array( 'email' => 'x@example.test', 'password' => 'nope' ) )->get_status(), 'other IP unaffected' );
} );

T::test( 'REST: patient books, cannot double book, sees only own appointments, cancels with lead time', function () {
	rest_world();
	Availability::$now_override = '2026-10-26 08:00';
	$d  = seed_doctor()['doctor'];
	$p1 = seed_patient( 'p1@example.test', 'Patient One' );
	$p2 = seed_patient( 'p2@example.test', 'Patient Two' );

	as_guest();
	T::eq( 401, R( 'POST', '/appt/patient/appointments', array(), array( 'doctorId' => $d['id'], 'date' => '2026-10-27', 'startTime' => '09:00' ) )->get_status() );
	as_user( $p1['userId'] );
	T::eq( 422, R( 'POST', '/appt/patient/appointments', array(), array( 'doctorId' => $d['id'], 'date' => '2026-10-27' ) )->get_status(), 'missing slot' );
	T::eq( 'doctor_closed', R( 'POST', '/appt/patient/appointments', array(), array( 'doctorId' => $d['id'], 'date' => '2026-10-31', 'startTime' => '09:00' ) )->get_data()['code'] );
	T::eq( 'invalid_slot', R( 'POST', '/appt/patient/appointments', array(), array( 'doctorId' => $d['id'], 'date' => '2026-10-27', 'startTime' => '09:10' ) )->get_data()['code'] );
	T::eq( 'date_in_past', R( 'POST', '/appt/patient/appointments', array(), array( 'doctorId' => $d['id'], 'date' => '2026-10-20', 'startTime' => '09:00' ) )->get_data()['code'] );

	// patientId in the body is ignored: the session decides.
	$b = R( 'POST', '/appt/patient/appointments', array(), array( 'doctorId' => $d['id'], 'patientId' => $p2['id'], 'date' => '2026-10-27', 'startTime' => '09:00', 'reason' => 'Chest pain', 'paymentMethod' => 'bank_transfer' ) );
	T::eq( 201, $b->get_status() );
	$a = $b->get_data();
	T::eq( $p1['id'], $a['patientId'] );
	T::eq( 'pending', $a['status'] );
	T::eq( 'unpaid', $a['paymentStatus'] );
	T::eq( 25.0, $a['fee'] );
	T::eq( '09:30', $a['endTime'] );
	T::ok( preg_match( '/^AP[A-Z0-9]{8}$/', $a['code'] ) === 1, 'code format ' . $a['code'] );
	T::ok( in_array( 'nexulesuite_appointment_booked', WP_Test_State::$fired, true ) );
	T::ok( ! isset( $a['patientEmail'] ), 'patient shape' );

	as_user( $p2['userId'] );
	T::eq( 'slot_taken', R( 'POST', '/appt/patient/appointments', array(), array( 'doctorId' => $d['id'], 'date' => '2026-10-27', 'startTime' => '09:00' ) )->get_data()['code'] );
	T::eq( 0, R( 'GET', '/appt/patient/appointments' )->get_data()['total'], 'p2 sees nothing' );
	T::eq( 404, R( 'GET', "/appt/patient/appointments/{$a['id']}" )->get_status(), 'other patient appointment hidden' );
	T::eq( 404, R( 'POST', "/appt/patient/appointments/{$a['id']}/cancel" )->get_status() );
	T::eq( 0, R( 'GET', '/appt/patient/appointments', array( 'patientId' => $p1['id'] ) )->get_data()['total'], 'patientId filter cannot be spoofed' );

	as_user( $p1['userId'] );
	T::eq( 1, R( 'GET', '/appt/patient/appointments' )->get_data()['total'] );
	T::eq( 'pending', R( 'GET', "/appt/patient/appointments/{$a['id']}" )->get_data()['status'] );
	$avail = R( 'GET', '/appt/public/availability', array( 'doctorId' => $d['id'], 'date' => '2026-10-27' ) )->get_data();
	T::eq( false, $avail['slots'][0]['available'], 'slot now shown as taken' );

	Availability::$now_override = '2026-10-27 08:00'; // 60 min before, cancel lead is 120 min.
	T::eq( 'too_late', R( 'POST', "/appt/patient/appointments/{$a['id']}/cancel" )->get_data()['code'] );
	Availability::$now_override = '2026-10-26 08:00';
	$c = R( 'POST', "/appt/patient/appointments/{$a['id']}/cancel" );
	T::eq( 'cancelled', $c->get_data()['status'] );
	T::eq( 'invalid_transition', R( 'POST', "/appt/patient/appointments/{$a['id']}/cancel" )->get_data()['code'] );
	$avail = R( 'GET', '/appt/public/availability', array( 'doctorId' => $d['id'], 'date' => '2026-10-27' ) )->get_data();
	T::eq( true, $avail['slots'][0]['available'], 'slot freed after cancel' );
	as_user( $p2['userId'] );
	T::eq( 201, R( 'POST', '/appt/patient/appointments', array(), array( 'doctorId' => $d['id'], 'date' => '2026-10-27', 'startTime' => '09:00' ) )->get_status(), 'slot can be rebooked after cancel' );
} );

T::test( 'REST: free doctor => paid/none; inactive patient and unverified patient blocked', function () {
	rest_world();
	Availability::$now_override = '2026-10-26 08:00';
	$s = seed_doctor( array( 'fee' => 0 ) );
	$p = seed_patient();
	as_user( $p['userId'] );
	$a = R( 'POST', '/appt/patient/appointments', array(), array( 'doctorId' => $s['doctor']['id'], 'date' => '2026-10-27', 'startTime' => '10:00' ) )->get_data();
	T::eq( 'paid', $a['paymentStatus'] );
	T::eq( 'none', $a['paymentMethod'] );
	Patients_Store::set_status( $p['id'], 'inactive' );
	T::eq( 403, R( 'GET', '/appt/patient/appointments' )->get_status() );
	Patients_Store::set_status( $p['id'], 'active' );
	update_user_meta( $p['userId'], Patients_Store::META_VERIFIED, '0' );
	T::eq( 'email_unverified', R( 'GET', '/appt/patient/appointments' )->get_data()['code'] );
	Settings::save( array( 'requireEmailVerification' => false ) );
	T::eq( 200, R( 'GET', '/appt/patient/appointments' )->get_status() );
} );

T::test( 'REST: patient profile and password', function () {
	rest_world();
	$p = seed_patient();
	as_user( $p['userId'] );
	$u = R( 'PUT', '/appt/patient/profile', array(), array( 'name' => 'Pat Updated', 'phone' => '555-1', 'address' => '1 St', 'email' => 'hack@example.test', 'status' => 'inactive' ) )->get_data();
	T::eq( 'Pat Updated', $u['name'] );
	T::eq( 'pat@example.test', $u['email'], 'e-mail not editable here' );
	T::eq( 'active', $u['status'] );
	T::eq( 422, R( 'PUT', '/appt/patient/profile', array(), array( 'name' => 'x' ) )->get_status() );
	T::eq( 'currentPassword', array_keys( R( 'POST', '/appt/patient/password', array(), array( 'currentPassword' => 'wrong', 'newPassword' => 'newpassword9', 'newPasswordConfirm' => 'newpassword9' ) )->get_data()['data']['errors'] )[0] );
	T::eq( 200, R( 'POST', '/appt/patient/password', array(), array( 'currentPassword' => 'patientpass1', 'newPassword' => 'newpassword9', 'newPasswordConfirm' => 'newpassword9' ) )->get_status() );
	T::ok( wp_check_password( 'newpassword9', get_userdata( $p['userId'] )->user_pass ) );
} );

T::test( 'REST: doctor panel is scoped to the doctor; treatment marks treated; other doctor gets 404', function () {
	rest_world();
	Availability::$now_override = '2026-10-26 08:00';
	$s   = seed_doctor();
	$d1  = $s['doctor'];
	$d2  = Doctors_Store::create( array( 'name' => 'Dr. Two', 'email' => 'two@example.test', 'password' => 'password123', 'departmentId' => $s['department']['id'] ) );
	$p   = seed_patient();
	$type = Catalog_Store::create( 'medicine_types', array( 'name' => 'Tablet' ) );
	$med  = Catalog_Store::create( 'medicines', array( 'name' => 'Aspirin', 'typeId' => $type['id'] ) );
	$a   = Appointments_Store::book( array( 'doctorId' => $d1['id'], 'patientId' => $p['id'], 'date' => '2026-10-27', 'startTime' => '09:00' ) );

	as_user( $p['userId'] );
	T::eq( 403, R( 'GET', '/appt/doctor/dashboard' )->get_status() );
	as_user( $d2['userId'] );
	T::eq( 0, R( 'GET', '/appt/doctor/appointments' )->get_data()['total'] );
	T::eq( 0, R( 'GET', '/appt/doctor/appointments', array( 'doctorId' => $d1['id'] ) )->get_data()['total'], 'doctorId filter cannot be spoofed' );
	T::eq( 404, R( 'GET', "/appt/doctor/appointments/{$a['id']}" )->get_status() );
	T::eq( 404, R( 'POST', "/appt/doctor/appointments/{$a['id']}/treatment", array(), array( 'notes' => 'hijack' ) )->get_status() );
	T::eq( 'pending', Appointments_Store::get( $a['id'] )['status'] );

	as_user( $d1['userId'] );
	$dash = R( 'GET', '/appt/doctor/dashboard' )->get_data();
	T::eq( 1, $dash['stats']['newThisWeek'] );
	T::eq( 1, $dash['stats']['pending'] );
	T::eq( 'Dr. Jane Roe', $dash['doctor']['name'] );
	T::ok( ! isset( $dash['doctor']['email'] ) );
	T::eq( 1, R( 'GET', '/appt/doctor/appointments', array( 'view' => 'new' ) )->get_data()['total'] );
	T::eq( 0, R( 'GET', '/appt/doctor/appointments', array( 'view' => 'history' ) )->get_data()['total'] );
	$detail = R( 'GET', "/appt/doctor/appointments/{$a['id']}" )->get_data();
	T::eq( 'Pat Smith', $detail['patient']['name'] );
	T::eq( null, $detail['treatment'] );
	T::eq( 422, R( 'POST', "/appt/doctor/appointments/{$a['id']}/treatment", array(), array( 'notes' => '', 'items' => array() ) )->get_status(), 'notes or medicine required' );
	$bad = R( 'POST', "/appt/doctor/appointments/{$a['id']}/treatment", array(), array( 'items' => array( array( 'medicineId' => 999 ) ) ) );
	T::ok( isset( $bad->get_data()['data']['errors']['items.0.medicineId'] ) );
	$t = R( 'POST', "/appt/doctor/appointments/{$a['id']}/treatment", array(), array(
		'notes' => "Mild hypertension.\nRest.", 'advice' => 'Less salt', 'followUpDate' => '2026-11-10',
		'items' => array( array( 'medicineId' => $med['id'], 'dosage' => '1-0-1', 'duration' => '7 days', 'instruction' => 'After food' ), array( 'medicineName' => 'Vitamin D', 'dosage' => '1-0-0', 'duration' => '30 days' ) ),
	) );
	T::eq( 200, $t->get_status() );
	T::eq( 'treated', $t->get_data()['appointment']['status'] );
	T::eq( 2, count( $t->get_data()['treatment']['items'] ) );
	T::eq( 'Aspirin', $t->get_data()['treatment']['items'][0]['medicineName'] );
	T::ok( in_array( 'nexulesuite_treatment_saved', WP_Test_State::$fired, true ) );
	// Re-saving replaces items (no duplicates).
	$t2 = R( 'POST', "/appt/doctor/appointments/{$a['id']}/treatment", array(), array( 'notes' => 'Updated', 'items' => array( array( 'medicineName' => 'Only one' ) ) ) )->get_data();
	T::eq( 1, count( $t2['treatment']['items'] ) );
	T::eq( 1, R( 'GET', '/appt/doctor/appointments', array( 'view' => 'history' ) )->get_data()['total'] );
	T::eq( 'invalid_transition', R( 'POST', "/appt/doctor/appointments/{$a['id']}/cancel" )->get_data()['code'], 'treated cannot be cancelled' );
	$meds = R( 'GET', '/appt/doctor/medicines', array( 'search' => 'asp' ) )->get_data();
	T::eq( 1, count( $meds['medicines'] ) );
	T::eq( 1, count( $meds['types'] ) );
	// Doctor self-service schedule / leaves / profile.
	T::eq( 7, count( R( 'GET', '/appt/doctor/schedule' )->get_data() ) );
	T::eq( 200, R( 'PUT', '/appt/doctor/schedule', array(), array( 'schedule' => array( array( 'weekday' => 6, 'enabled' => true, 'startTime' => '10:00', 'endTime' => '12:00' ) ) ) )->get_status() );
	T::eq( 201, R( 'POST', '/appt/doctor/leaves', array(), array( 'date' => '2026-11-03' ) )->get_status() );
	$leaves = R( 'GET', '/appt/doctor/leaves' )->get_data();
	T::eq( 1, count( $leaves ) );
	as_user( $d2['userId'] );
	T::eq( 404, R( 'DELETE', "/appt/doctor/leaves/{$leaves[0]['id']}" )->get_status(), 'other doctor cannot delete leave' );
	as_user( $d1['userId'] );
	T::eq( 200, R( 'DELETE', "/appt/doctor/leaves/{$leaves[0]['id']}" )->get_status() );
	$prof = R( 'PUT', '/appt/doctor/profile', array(), array( 'phone' => '555-9', 'fee' => 999, 'status' => 'inactive', 'departmentId' => 42 ) )->get_data();
	T::eq( '555-9', $prof['phone'] );
	T::eq( 25.0, $prof['fee'], 'doctor cannot change own fee' );
	T::eq( 'active', $prof['status'] );
	T::ok( ! isset( $prof['userId'] ) );
} );

T::test( 'REST + print: prescription visible to admin, owning doctor and owning patient only', function () {
	rest_world();
	Availability::$now_override = '2026-10-26 08:00';
	$s   = seed_doctor();
	$d1  = $s['doctor'];
	$d2  = Doctors_Store::create( array( 'name' => 'Dr. Two', 'email' => 'two@example.test', 'password' => 'password123', 'departmentId' => $s['department']['id'] ) );
	$p1  = seed_patient( 'p1@example.test', 'One' );
	$p2  = seed_patient( 'p2@example.test', 'Two' );
	$a   = Appointments_Store::book( array( 'doctorId' => $d1['id'], 'patientId' => $p1['id'], 'date' => '2026-10-27', 'startTime' => '09:00' ) );
	as_guest();
	T::eq( 401, R( 'GET', "/appt/prescription/{$a['id']}" )->get_status() );
	as_user( $p1['userId'] );
	T::eq( 404, R( 'GET', "/appt/prescription/{$a['id']}" )->get_status(), 'no treatment yet' );
	Treatments_Store::save( $a['id'], $d1['id'], array( 'notes' => 'Rest', 'items' => array( array( 'medicineName' => 'Paracetamol', 'dosage' => '500 mg' ) ) ) );
	T::eq( 200, R( 'GET', "/appt/prescription/{$a['id']}" )->get_status() );
	T::eq( 'Paracetamol', R( 'GET', "/appt/prescription/{$a['id']}" )->get_data()['treatment']['items'][0]['medicineName'] );
	T::ok( ! isset( R( 'GET', "/appt/prescription/{$a['id']}" )->get_data()['doctor']['email'] ) );
	as_user( $p2['userId'] );
	T::eq( 404, R( 'GET', "/appt/prescription/{$a['id']}" )->get_status() );
	as_user( $d2['userId'] );
	T::eq( 404, R( 'GET', "/appt/prescription/{$a['id']}" )->get_status() );
	as_user( $d1['userId'] );
	T::eq( 200, R( 'GET', "/appt/prescription/{$a['id']}" )->get_status() );
	as_user( 1 );
	T::eq( 200, R( 'GET', "/appt/prescription/{$a['id']}" )->get_status() );
	$admin_view = R( 'GET', "/appt/admin/appointments/{$a['id']}" )->get_data();
	T::eq( 'Rest', $admin_view['treatment']['notes'] );
	T::eq( 'invalid_transition', R( 'PUT', "/appt/admin/appointments/{$a['id']}", array(), array( 'status' => 'cancelled' ) )->get_data()['code'], 'treated cannot be cancelled by admin' );
	T::eq( 'paid', R( 'PUT', "/appt/admin/appointments/{$a['id']}", array(), array( 'paymentStatus' => 'paid' ) )->get_data()['paymentStatus'] );

	$html = \nexulesuite_\Frontend\Appointments_Frontend::render_prescription( Treatments_Store::prescription_bundle( $a['id'] ) );
	T::ok( false !== strpos( $html, 'Paracetamol' ) && false !== strpos( $html, 'Dr. Jane Roe' ) && false !== strpos( $html, 'window.print()' ) );
	T::ok( false !== strpos( $html, 'noindex' ) );
	T::ok( false === strpos( $html, '<script' ) );
} );

T::test( 'REST: admin appointment list filters and patient admin update', function () {
	rest_world();
	Availability::$now_override = '2026-10-26 08:00';
	$d  = seed_doctor()['doctor'];
	$p  = seed_patient();
	Appointments_Store::book( array( 'doctorId' => $d['id'], 'patientId' => $p['id'], 'date' => '2026-10-27', 'startTime' => '09:00' ) );
	Appointments_Store::book( array( 'doctorId' => $d['id'], 'patientId' => $p['id'], 'date' => '2026-10-28', 'startTime' => '09:00' ) );
	as_user( 1 );
	T::eq( 2, R( 'GET', '/appt/admin/appointments' )->get_data()['total'] );
	T::eq( 1, R( 'GET', '/appt/admin/appointments', array( 'dateFrom' => '2026-10-28' ) )->get_data()['total'] );
	T::eq( 2, R( 'GET', '/appt/admin/appointments', array( 'search' => 'pat smith' ) )->get_data()['total'] );
	T::eq( 0, R( 'GET', '/appt/admin/appointments', array( 'status' => 'treated' ) )->get_data()['total'] );
	$pl = R( 'GET', '/appt/admin/patients' )->get_data();
	T::eq( 1, $pl['total'] );
	T::eq( 2, $pl['items'][0]['appointmentCount'] );
	T::eq( true, $pl['items'][0]['emailVerified'] );
	T::eq( 'inactive', R( 'PUT', "/appt/admin/patients/{$p['id']}", array(), array( 'status' => 'inactive' ) )->get_data()['status'] );
	T::eq( 404, R( 'PUT', '/appt/admin/patients/999', array(), array( 'status' => 'active' ) )->get_status() );
} );
