<?php
/**
 * Regression tests for the defects found in the 2026-10-25 security review
 * (slot overlap after a schedule change, inactive-doctor login, cross-site nonce bypass,
 * open redirect, verification oracle, deactivated-account prescription access, doctor photo).
 */
declare(strict_types=1);

use nexulesuite_\Appointments\Appointments_Store;
use nexulesuite_\Appointments\Availability;
use nexulesuite_\Appointments\Doctors_Store;
use nexulesuite_\Appointments\Patients_Store;
use nexulesuite_\Appointments\Treatments_Store;

require_once dirname( __DIR__ ) . '/api/class-appointments-api.php';
require_once dirname( __DIR__ ) . '/public/class-appointments-frontend.php';

T::test( 'Slots: a booking made under an earlier schedule blocks every slot it overlaps (direct REST)', function () {
	rest_world();
	Availability::$now_override = '2026-10-26 08:00';
	$s = seed_doctor();
	$d = $s['doctor'];
	$p = seed_patient();
	as_user( $p['userId'] );
	T::eq( 201, R( 'POST', '/appt/patient/appointments', array(), array( 'doctorId' => $d['id'], 'date' => '2026-10-27', 'startTime' => '10:00' ) )->get_status(), '10:00-10:30 booked on the 30-minute grid' );

	// The doctor moves Tuesday to a 20-minute grid; 10:00-10:20 and 10:20-10:40 both intersect the existing booking.
	as_user( $d['userId'] );
	T::eq( 200, R( 'PUT', '/appt/doctor/schedule', array(), array( 'schedule' => array( array( 'weekday' => 2, 'enabled' => true, 'startTime' => '09:00', 'endTime' => '12:00', 'slotMinutes' => 20 ) ) ) )->get_status() );
	as_guest();
	$day = R( 'GET', '/appt/public/availability', array( 'doctorId' => $d['id'], 'date' => '2026-10-27' ), array(), array() )->get_data();
	$by  = array();
	foreach ( $day['slots'] as $slot ) { $by[ $slot['start'] ] = $slot['available']; }
	T::eq( false, $by['10:00'], '10:00-10:20 overlaps' );
	T::eq( false, $by['10:20'], '10:20-10:40 overlaps' );
	T::eq( true, $by['10:40'], '10:40-11:00 is free' );
	T::eq( true, $by['09:40'], '09:40-10:00 is free (touching, not overlapping)' );

	$p2 = seed_patient( 'two@example.test', 'Second Patient' );
	as_user( $p2['userId'] );
	T::eq( 409, R( 'POST', '/appt/patient/appointments', array(), array( 'doctorId' => $d['id'], 'date' => '2026-10-27', 'startTime' => '10:20' ) )->get_status(), 'overlapping slot refused' );
	T::eq( 201, R( 'POST', '/appt/patient/appointments', array(), array( 'doctorId' => $d['id'], 'date' => '2026-10-27', 'startTime' => '10:40' ) )->get_status() );

	// Shifted start (09:15) under a 30-minute grid: 09:45-10:15 overlaps 10:00-10:30 too.
	T::ok( Availability::overlaps_booking( '09:45', '10:15', array( '10:00' => '10:30' ) ) );
	T::ok( ! Availability::overlaps_booking( '09:30', '10:00', array( '10:00' => '10:30' ) ) );
	T::ok( Availability::overlaps_booking( '10:00', '10:30', array( '10:00' => true ) ), 'legacy start-only entries still match exactly' );
	T::eq( 'full', Availability::compute_day( '2026-10-27', array( array( 'weekday' => 2, 'enabled' => true, 'startTime' => '10:00', 'endTime' => '10:30', 'slotMinutes' => 30 ) ), array(), array( '09:45' => '10:15' ), array( 'now' => '2026-10-26 08:00' ) )['status'] );
} );

T::test( 'Login: an unapproved doctor is refused whichever account tab is used', function () {
	rest_world();
	$s = seed_doctor();
	as_guest();
	T::eq( 201, R( 'POST', '/appt/public/register', array(), array( 'type' => 'doctor', 'name' => 'Dr. New', 'email' => 'new@example.test', 'password' => 'password123', 'passwordConfirm' => 'password123', 'departmentId' => $s['department']['id'] ) )->get_status() );
	foreach ( array( array(), array( 'type' => 'patient' ), array( 'type' => 'doctor' ) ) as $extra ) {
		$r = R( 'POST', '/appt/public/login', array(), array_merge( array( 'email' => 'new@example.test', 'password' => 'password123' ), $extra ) );
		T::eq( 403, $r->get_status(), 'type=' . ( $extra['type'] ?? '(none)' ) );
		T::eq( 'account_inactive', $r->get_data()['code'] );
		T::eq( 0, get_current_user_id(), 'session not kept' );
	}
} );

T::test( 'CSRF: anonymous writes accept the nonce from the header only and refuse foreign origins', function () {
	rest_world();
	seed_patient();
	as_guest();
	$nonce = wp_create_nonce( 'wp_rest' );
	$creds = array( 'email' => 'pat@example.test', 'password' => 'patientpass1' );
	// The public nonce is readable by anyone, so it must not be accepted from a form field.
	T::eq( 403, R( 'POST', '/appt/public/login', array( '_wpnonce' => $nonce ), $creds, array() )->get_status(), 'nonce as a query/body field is ignored' );
	T::eq( 403, R( 'POST', '/appt/public/login', array(), $creds, array( 'X-WP-Nonce' => $nonce, 'Origin' => 'https://evil.example' ) )->get_status(), 'foreign Origin' );
	T::eq( 'rest_cross_site', R( 'POST', '/appt/public/login', array(), $creds, array( 'X-WP-Nonce' => $nonce, 'Referer' => 'https://evil.example/form.html' ) )->get_data()['code'], 'foreign Referer' );
	T::eq( 403, R( 'POST', '/appt/public/login', array(), $creds, array( 'X-WP-Nonce' => $nonce, 'Origin' => 'null' ) )->get_status(), 'opaque origin' );
	T::eq( 403, R( 'POST', '/appt/public/login', array(), $creds, array( 'X-WP-Nonce' => $nonce, 'Sec-Fetch-Site' => 'cross-site' ) )->get_status(), 'Sec-Fetch-Site: cross-site' );
	T::eq( 0, get_current_user_id(), 'none of the above logged anyone in' );
	$home = wp_parse_url( home_url( '/' ), PHP_URL_HOST );
	T::eq( 200, R( 'POST', '/appt/public/login', array(), $creds, array( 'X-WP-Nonce' => $nonce, 'Origin' => 'http://' . $home, 'Sec-Fetch-Site' => 'same-origin' ) )->get_status(), 'same-origin browser request' );
	wp_logout();
	T::eq( 200, R( 'POST', '/appt/public/login', array(), $creds, array( 'X-WP-Nonce' => $nonce ) )->get_status(), 'no origin headers at all (non-browser client) still works' );
} );

T::test( 'Auth page: ?redirect_to= only follows same-site targets (open redirect guard)', function () {
	rest_world();
	as_guest();
	$fe = new \nexulesuite_\Frontend\Appointments_Frontend();
	$_GET['redirect_to'] = 'https://evil.example/phish';
	T::ok( str_contains( $fe->sc_auth(), 'data-redirect=""' ), 'foreign absolute URL dropped' );
	$_GET['redirect_to'] = '//evil.example/phish';
	T::ok( str_contains( $fe->sc_auth(), 'data-redirect=""' ), 'protocol-relative URL dropped' );
	$_GET['redirect_to'] = '/nexus-patient-panel/#appointments';
	T::ok( str_contains( $fe->sc_auth(), 'data-redirect="/nexus-patient-panel/#appointments"' ), 'relative path kept' );
	$_GET['redirect_to'] = home_url( '/nexus-booking/?doctor=1' );
	T::ok( str_contains( $fe->sc_auth(), 'data-redirect="' . esc_attr( home_url( '/nexus-booking/?doctor=1' ) ) . '"' ), 'same-site absolute URL kept' );
	unset( $_GET['redirect_to'] );
	// The JS side has the same guard.
	T::ok( str_contains( (string) file_get_contents( dirname( __DIR__ ) . '/public/js/appointments.js' ), 'function sameOrigin( url )' ) );
} );

T::test( 'Verification link: wrong token never reveals whether a user id is a verified patient', function () {
	rest_world();
	as_guest();
	$r = R( 'POST', '/appt/public/register', array(), array( 'name' => 'New One', 'email' => 'new@example.test', 'password' => 'password123', 'passwordConfirm' => 'password123' ) );
	T::eq( 201, $r->get_status() );
	$mail = end( WP_Test_State::$mails );
	T::ok( (bool) preg_match( '/nexulesuite_verify=([A-Za-z0-9]+)&(?:amp;)?uid=(\d+)/', $mail['message'], $m ), 'verification link mailed' );
	$uid = (int) $m[2];
	T::eq( false, Patients_Store::verify( $uid, 'bogus' ), 'unverified + wrong token' );
	T::eq( true, Patients_Store::verify( $uid, $m[1] ), 'right token verifies' );
	T::eq( true, Patients_Store::is_verified( $uid ) );
	T::eq( false, Patients_Store::verify( $uid, 'bogus' ), 'verified + wrong token: still false, so the result does not depend on the account state' );
	T::eq( false, Patients_Store::verify( 999999, 'bogus' ), 'unknown user: false' );
	T::eq( true, Patients_Store::verify( $uid, $m[1] ), 'same link again: still fine for the user' );
} );

T::test( 'Prescriptions: a deactivated doctor or patient loses access to the printable prescription', function () {
	rest_world();
	Availability::$now_override = '2026-10-26 08:00';
	$s = seed_doctor();
	$d = $s['doctor'];
	$p = seed_patient();
	$a = Appointments_Store::book( array( 'doctorId' => $d['id'], 'patientId' => $p['id'], 'date' => '2026-10-27', 'startTime' => '09:00' ) );
	T::not_err( Treatments_Store::save( (int) $a['id'], (int) $d['id'], array( 'notes' => 'Rest.' ) ) );
	$api = \nexulesuite_\Api\Appointments_Api::class;
	T::ok( $api::user_can_view_prescription( (int) $d['userId'], (int) $a['id'] ), 'active doctor' );
	T::ok( $api::user_can_view_prescription( (int) $p['userId'], (int) $a['id'] ), 'active patient' );
	as_user( 1 );
	T::eq( 200, R( 'PUT', "/appt/admin/doctors/{$d['id']}", array(), array( 'status' => 'inactive' ) )->get_status() );
	T::eq( 200, R( 'PUT', "/appt/admin/patients/{$p['id']}", array(), array( 'status' => 'inactive' ) )->get_status() );
	T::ok( ! $api::user_can_view_prescription( (int) $d['userId'], (int) $a['id'] ), 'deactivated doctor' );
	T::ok( ! $api::user_can_view_prescription( (int) $p['userId'], (int) $a['id'] ), 'deactivated patient' );
	as_user( $d['userId'] );
	T::eq( 404, R( 'GET', "/appt/prescription/{$a['id']}" )->get_status(), 'REST prescription route for a deactivated doctor' );
} );

T::test( 'Doctor photo: only an image attachment owned by the doctor can be set from the doctor panel', function () {
	rest_world();
	$s = seed_doctor();
	$d = $s['doctor'];
	as_user( $d['userId'] );
	$page  = wp_insert_post( array( 'post_type' => 'page', 'post_name' => 'secret', 'post_author' => 1, 'post_mime_type' => '' ) );
	$other = wp_insert_post( array( 'post_type' => 'attachment', 'post_name' => 'someone-elses', 'post_author' => 1, 'post_mime_type' => 'image/png' ) );
	$pdf   = wp_insert_post( array( 'post_type' => 'attachment', 'post_name' => 'report', 'post_author' => $d['userId'], 'post_mime_type' => 'application/pdf' ) );
	$mine  = wp_insert_post( array( 'post_type' => 'attachment', 'post_name' => 'portrait', 'post_author' => $d['userId'], 'post_mime_type' => 'image/jpeg' ) );
	foreach ( array( $page, $other, $pdf, 424242 ) as $bad ) {
		$r = R( 'PUT', '/appt/doctor/profile', array(), array( 'photoId' => $bad ) );
		T::eq( 422, $r->get_status(), 'photoId ' . $bad );
		T::ok( isset( $r->get_data()['data']['errors']['photoId'] ) );
	}
	T::eq( 200, R( 'PUT', '/appt/doctor/profile', array(), array( 'photoId' => $mine ) )->get_status() );
	T::eq( $mine, Doctors_Store::get( (int) $d['id'] )['photoId'] );
	as_user( 1 );
	T::eq( 200, R( 'PUT', "/appt/admin/doctors/{$d['id']}", array(), array( 'photoId' => $other ) )->get_status(), 'admins keep the free choice' );
} );
