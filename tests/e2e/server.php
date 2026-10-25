<?php
/**
 * End-to-end harness: serves the real REST API, shortcode pages and the admin SPA
 * over the WordPress stubs with a SQLite database, so Playwright can drive the plugin
 * without a WordPress install.
 *
 * Run from the plugin root:
 *   php -S 127.0.0.1:8787 -t . tests/e2e/server.php
 */

declare(strict_types=1);

$root  = dirname( __DIR__, 2 );
$state = getenv( 'NXA_E2E_STATE' ) ?: sys_get_temp_dir() . '/nxa-e2e';
if ( ! is_dir( $state ) ) {
	mkdir( $state, 0777, true );
}
$db_file    = $state . '/db.sqlite';
$state_file = $state . '/state.json';

$uri  = parse_url( $_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH ) ?: '/';
$path = rtrim( $uri, '/' );

// Static files are served by the built-in server itself.
if ( ( str_starts_with( $uri, '/assets/' ) || str_starts_with( $uri, '/public/' ) ) && is_file( $root . $uri ) ) {
	return false;
}

require_once $root . '/tests/stubs/wp-functions.php';
require_once $root . '/tests/stubs/class-wpdb.php';
require_once $root . '/core/appointments/class-module.php';
require_once $root . '/api/class-appointments-api.php';
require_once $root . '/public/class-appointments-frontend.php';

use nexulesuite_\Appointments\Availability;
use nexulesuite_\Appointments\Catalog_Store;
use nexulesuite_\Appointments\Doctors_Store;
use nexulesuite_\Appointments\Module;
use nexulesuite_\Appointments\Roles;
use nexulesuite_\Appointments\Schema;
use nexulesuite_\Appointments\Settings;
use nexulesuite_\Frontend\Appointments_Frontend;

Module::load();
$GLOBALS['wpdb'] = new wpdb( 'sqlite:' . $db_file );
$origin          = 'http://' . ( $_SERVER['HTTP_HOST'] ?? '127.0.0.1:8787' );
WP_Test_State::$home = $origin;

function nxa_boot_state( string $state_file ): void {
	if ( is_file( $state_file ) ) {
		WP_Test_State::import( (array) json_decode( (string) file_get_contents( $state_file ), true ) );
		return;
	}
	WP_Test_State::reset();
	Schema::install();
	Roles::install();
	wp_insert_user( array( 'user_login' => 'admin', 'user_email' => 'admin@example.test', 'user_pass' => 'adminpass123', 'role' => 'administrator', 'display_name' => 'Site Admin' ) );
	update_option( 'permalink_structure', '/%postname%/' );
	Module::ensure_pages();
}
function nxa_save_state( string $state_file ): void {
	file_put_contents( $state_file, json_encode( WP_Test_State::export() ) );
}
function nxa_json( $data, int $status = 200 ): void {
	http_response_code( $status );
	header( 'Content-Type: application/json; charset=utf-8' );
	echo json_encode( $data );
}

nxa_boot_state( $state_file );
if ( ! empty( WP_Test_State::$extra['now'] ) ) {
	Availability::$now_override = (string) WP_Test_State::$extra['now'];
	WP_Test_State::$now         = Availability::$now_override . ':00';
}

// Cookie session.
$uid = isset( $_COOKIE['nxa_uid'] ) ? (int) $_COOKIE['nxa_uid'] : 0;
if ( $uid > 0 && get_userdata( $uid ) ) {
	wp_set_current_user( $uid );
}
$before_uid = get_current_user_id();

register_shutdown_function(
	static function () use ( $state_file, $before_uid ) {
		$after = get_current_user_id();
		if ( $after !== $before_uid && ! headers_sent() ) {
			if ( $after > 0 ) {
				setcookie( 'nxa_uid', (string) $after, 0, '/' );
			} else {
				setcookie( 'nxa_uid', '', time() - 3600, '/' );
			}
		}
		nxa_save_state( $state_file );
	}
);

/* ---------------- test helpers ---------------- */
if ( '/__test/reset' === $path ) {
	$GLOBALS['wpdb'] = null;
	@unlink( $db_file );
	@unlink( $state_file );
	$GLOBALS['wpdb'] = new wpdb( 'sqlite:' . $db_file );
	nxa_boot_state( $state_file );
	setcookie( 'nxa_uid', '', time() - 3600, '/' );
	nxa_json( array( 'reset' => true ) );
	return;
}
if ( '/__test/now' === $path ) {
	WP_Test_State::$extra['now'] = isset( $_GET['set'] ) ? (string) $_GET['set'] : '';
	nxa_json( array( 'now' => WP_Test_State::$extra['now'] ) );
	return;
}
if ( '/__test/mails' === $path ) {
	nxa_json( WP_Test_State::$mails );
	return;
}
if ( '/__test/login-as' === $path ) {
	$u = get_user_by( 'email', (string) ( $_GET['email'] ?? '' ) );
	if ( $u ) {
		wp_set_current_user( (int) $u->ID );
	}
	nxa_json( array( 'uid' => get_current_user_id() ) );
	return;
}
if ( '/__test/logout' === $path ) {
	wp_set_current_user( 0 );
	setcookie( 'nxa_uid', '', time() - 3600, '/' );
	header( 'Location: ' . ( isset( $_GET['redirect_to'] ) && '' !== $_GET['redirect_to'] ? (string) $_GET['redirect_to'] : $origin . '/nexus-auth/' ), true, 302 );
	return;
}
if ( '/__test/seed' === $path ) {
	wp_set_current_user( 1 );
	$card = Catalog_Store::create( 'departments', array( 'name' => 'Cardiology', 'description' => 'Heart and vascular care for every age.' ) );
	$ped  = Catalog_Store::create( 'departments', array( 'name' => 'Pediatric', 'description' => 'Care for infants, children and teenagers.' ) );
	$loc  = Catalog_Store::create( 'locations', array( 'name' => 'New York', 'address' => '123 Health Ave, New York' ) );
	$sched = array();
	foreach ( array( 1, 2, 3, 4, 5 ) as $wd ) {
		$sched[] = array( 'weekday' => $wd, 'enabled' => true, 'startTime' => '09:00', 'endTime' => '12:00', 'slotMinutes' => 30 );
	}
	$sched[] = array( 'weekday' => 6, 'enabled' => false );
	$sched[] = array( 'weekday' => 0, 'enabled' => false );
	$jane = Doctors_Store::create( array( 'name' => 'Dr. Jane Roe', 'email' => 'jane@example.test', 'password' => 'doctorpass123', 'departmentId' => $card['id'], 'locationId' => $loc['id'], 'fee' => 25, 'experienceYears' => 12, 'bio' => 'Consultant cardiologist.', 'address' => '123 Health Ave', 'schedule' => $sched ) );
	$miguel = Doctors_Store::create( array( 'name' => 'Dr. Miguel Silva', 'email' => 'miguel@example.test', 'password' => 'doctorpass123', 'departmentId' => $ped['id'], 'locationId' => $loc['id'], 'fee' => 9, 'experienceYears' => 7, 'schedule' => $sched ) );
	$tab  = Catalog_Store::create( 'medicine_types', array( 'name' => 'Tablet' ) );
	Catalog_Store::create( 'medicines', array( 'name' => 'Aspirin 75 mg', 'typeId' => $tab['id'] ) );
	Catalog_Store::create( 'medicines', array( 'name' => 'Paracetamol 500 mg', 'typeId' => $tab['id'] ) );
	wp_set_current_user( $uid );
	nxa_json( array( 'departments' => array( $card, $ped ), 'location' => $loc, 'doctors' => array( $jane, $miguel ) ) );
	return;
}

/* ---------------- REST ---------------- */
if ( str_starts_with( $path, '/wp-json/' ) ) {
	$api = new \nexulesuite_\Api\Appointments_Api();
	$api->register_routes();
	$route  = substr( $path, strlen( '/wp-json' ) );
	$method = $_SERVER['REQUEST_METHOD'];
	$query  = $_GET;
	$json   = array();
	$raw    = file_get_contents( 'php://input' );
	if ( '' !== $raw ) {
		$decoded = json_decode( $raw, true );
		if ( is_array( $decoded ) ) {
			$json = $decoded;
		}
	}
	$res = wp_test_rest_dispatch( $method, $route, $query, $json );
	nxa_json( $res->get_data(), (int) $res->get_status() );
	return;
}

/* ---------------- front-end & admin pages ---------------- */
$frontend = new Appointments_Frontend();
$frontend->register_hooks();

if ( isset( $_GET['nexulesuite_verify'] ) ) {
	try {
		$frontend->maybe_verify_email();
	} catch ( RuntimeException $e ) {
		header( 'Location: ' . substr( $e->getMessage(), strlen( 'redirect:' ) ), true, 302 );
	}
	return;
}
if ( isset( $_GET['nexulesuite_prescription'] ) ) {
	try {
		$frontend->maybe_print_prescription();
	} catch ( RuntimeException $e ) {
		$m = $e->getMessage();
		if ( str_starts_with( $m, 'redirect:' ) ) {
			header( 'Location: ' . substr( $m, 9 ), true, 302 );
		} else {
			http_response_code( 403 );
			echo htmlspecialchars( $m );
		}
	}
	return;
}

function nxa_shell( string $title, string $body, bool $admin = false ): string {
	$cfg = WP_Test_State::$localized['nexulesuite_Appt'] ?? null;
	$head = '<link rel="stylesheet" href="/public/css/appointments.css">';
	$foot = '';
	if ( $admin ) {
		$pages = array();
		foreach ( array( 'activities', 'menu-items', 'popups', 'emails', 'form-builder', 'appointments', 'settings' ) as $r ) {
			$pages[ $r ] = WP_Test_State::$home . '/wp-admin/?page=' . $r;
		}
		$admin_cfg = array( 'restUrl' => WP_Test_State::$home . '/wp-json/', 'nonce' => 'test', 'adminAjaxUrl' => WP_Test_State::$home . '/wp-admin/admin-ajax.php', 'pluginUrl' => WP_Test_State::$home . '/', 'pluginVersion' => 'e2e', 'siteUrl' => WP_Test_State::$home . '/', 'siteTitle' => 'Test Clinic', 'formsPayload' => array(), 'initialRoute' => (string) ( $_GET['page'] ?? 'appointments' ), 'adminPages' => $pages, 'globalFont' => '', 'globalFontWeights' => array(), 'globalAppearance' => array( 'styling' => array(), 'updatedAt' => '' ) );
		$head = '<link rel="stylesheet" href="/assets/admin/css/wp-admin-chrome.css"><link rel="stylesheet" href="/assets/admin/css/appointments.css"><script>window.nexulesuite_Admin=' . json_encode( $admin_cfg ) . ';window.wp={};</script>';
		$foot = '<script src="/assets/admin/js/appointments.js"></script>';
	} else {
		$foot = '<script>window.nexulesuite_Appt=' . json_encode( $cfg ) . ';</script><script src="/public/js/appointments.js"></script>';
	}
	return '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>' . htmlspecialchars( $title ) . '</title>' . $head . '<style>body{margin:0;font-family:Inter,system-ui,sans-serif;background:#fff}.site{max-width:1140px;margin:0 auto;padding:24px 16px}header.site-head{border-bottom:1px solid #e2e8f0;padding:12px 16px;font-weight:700}</style></head><body>' . ( $admin ? $body : '<header class="site-head">Test Clinic</header><main class="site">' . $body . '</main>' ) . $foot . '</body></html>';
}

if ( '/wp-admin' === $path ) {
	if ( get_current_user_id() <= 0 ) {
		wp_set_current_user( 1 ); // harness logs the admin in
	}
	echo nxa_shell( 'Admin', '<div id="nexulesuite_admin-root"></div>', true );
	return;
}

$page_map = array(
	'/nexus-doctors'       => 'sc_doctors',
	'/nexus-doctor'        => 'sc_doctor',
	'/nexus-departments'   => 'sc_departments',
	'/nexus-department'    => 'sc_department',
	'/nexus-booking'       => 'sc_booking',
	'/nexus-auth'          => 'sc_auth',
	'/nexus-patient-panel' => 'sc_patient_panel',
	'/nexus-doctor-panel'  => 'sc_doctor_panel',
);
if ( preg_match( '#^/doctor-details/([^/]+)$#', $path, $m ) ) {
	$_GET[ Appointments_Frontend::QV_DOCTOR ] = $m[1];
	$path = '/nexus-doctor';
}
if ( preg_match( '#^/department-details/([^/]+)$#', $path, $m ) ) {
	$_GET[ Appointments_Frontend::QV_DEPARTMENT ] = $m[1];
	$path = '/nexus-department';
}
if ( isset( $page_map[ $path ] ) ) {
	$fn = $page_map[ $path ];
	echo nxa_shell( ucfirst( str_replace( array( '/nexus-', '-' ), array( '', ' ' ), $path ) ), $frontend->$fn( array() ) );
	return;
}
if ( '' === $path ) {
	echo nxa_shell( 'Home', '<h1>Test Clinic</h1><p><a href="/nexus-doctors/">Doctors</a> · <a href="/nexus-departments/">Departments</a> · <a href="/nexus-booking/">Book</a> · <a href="/nexus-auth/">Login</a> · <a href="/wp-admin/">Admin</a></p>' );
	return;
}
http_response_code( 404 );
echo 'Not found: ' . htmlspecialchars( $path );
