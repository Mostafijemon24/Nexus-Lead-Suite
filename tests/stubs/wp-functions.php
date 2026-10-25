<?php
/**
 * Minimal WordPress function stubs for running the appointment module tests without WordPress.
 * In-memory options, users, roles, meta, hooks, transients and mail log.
 */

declare(strict_types=1);

if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}
define( 'MINUTE_IN_SECONDS', 60 );
define( 'HOUR_IN_SECONDS', 3600 );
define( 'DAY_IN_SECONDS', 86400 );
define( 'ARRAY_A', 'ARRAY_A' );
define( 'ARRAY_N', 'ARRAY_N' );
define( 'OBJECT', 'OBJECT' );
define( 'nexulesuite_PLUGIN_DIR', dirname( __DIR__, 2 ) . '/' );
define( 'nexulesuite_PLUGIN_URL', 'https://example.test/wp-content/plugins/nexus-lead-suite/' );
define( 'nexulesuite_VERSION', 'test' );

final class WP_Test_State {
	public static $options     = array();
	public static $users       = array();
	public static $usermeta    = array();
	public static $roles       = array();
	public static $current     = 0;
	public static $mails       = array();
	public static $transients  = array();
	public static $hooks       = array();
	public static $fired       = array();
	public static $next_uid    = 1;
	public static $posts       = array();
	public static $next_post   = 100;
	public static $now         = '2026-10-26 09:00:00';
	public static $rest_routes = array();
	public static $home        = 'https://example.test';
	public static $localized   = array();
	public static $extra       = array();

	/** Snapshot of the mutable world for the e2e server (persisted between requests). */
	public static function export(): array {
		return array( 'options' => self::$options, 'users' => self::$users, 'usermeta' => self::$usermeta, 'roles' => self::$roles, 'mails' => self::$mails, 'transients' => self::$transients, 'next_uid' => self::$next_uid, 'posts' => self::$posts, 'next_post' => self::$next_post, 'now' => self::$now, 'extra' => self::$extra );
	}
	public static function import( array $d ): void {
		foreach ( $d as $k => $v ) { if ( property_exists( self::class, $k ) ) { self::$$k = $v; } }
	}

	public static function reset(): void {
		self::$options    = array();
		self::$users      = array();
		self::$usermeta   = array();
		self::$current    = 0;
		self::$mails      = array();
		self::$transients = array();
		self::$hooks      = array();
		self::$fired      = array();
		self::$next_uid   = 1;
		self::$posts      = array();
		self::$next_post  = 100;
		self::$rest_routes = array();
		self::$roles      = array(
			'administrator' => array( 'read' => true, 'manage_options' => true ),
			'subscriber'    => array( 'read' => true ),
		);
	}
}
WP_Test_State::reset();

// ---- i18n / escaping -------------------------------------------------------
function __( $t, $d = null ) { return $t; }
function _e( $t, $d = null ) { echo $t; }
function esc_html__( $t, $d = null ) { return $t; }
function esc_attr__( $t, $d = null ) { return $t; }
function esc_html( $t ) { return htmlspecialchars( (string) $t, ENT_QUOTES, 'UTF-8' ); }
function esc_attr( $t ) { return htmlspecialchars( (string) $t, ENT_QUOTES, 'UTF-8' ); }
function esc_url( $u ) { return (string) $u; }
function esc_url_raw( $u ) { return (string) $u; }
function esc_textarea( $t ) { return htmlspecialchars( (string) $t, ENT_QUOTES, 'UTF-8' ); }
function esc_js( $t ) { return addslashes( (string) $t ); }
function wp_kses_post( $t ) { return strip_tags( (string) $t, '<p><br><strong><em><ul><ol><li><a><h2><h3><h4>' ); }
function wp_kses( $t, $allowed ) { return strip_tags( (string) $t ); }
function wp_kses_allowed_html( $c ) { return array(); }
function wp_strip_all_tags( $t ) { return trim( strip_tags( (string) $t ) ); }
function wp_specialchars_decode( $t, $q = ENT_NOQUOTES ) { return htmlspecialchars_decode( (string) $t, $q ); }
function wp_unslash( $v ) { return is_array( $v ) ? array_map( 'wp_unslash', $v ) : stripslashes( (string) $v ); }
function wp_json_encode( $v, $f = 0, $d = 512 ) { return json_encode( $v, $f, $d ); }
function number_format_i18n( $n, $d = 0 ) { return number_format( (float) $n, $d ); }
function date_i18n( $f, $ts = null ) { return gmdate( $f, null === $ts ? time() : (int) $ts ); }
function wp_date( $f, $ts = null ) { return gmdate( $f, null === $ts ? time() : (int) $ts ); }

// ---- sanitizers ------------------------------------------------------------
function sanitize_text_field( $s ) {
	$s = (string) $s;
	$s = strip_tags( $s );
	$s = preg_replace( '/[\r\n\t ]+/', ' ', $s );
	return trim( $s );
}
function sanitize_textarea_field( $s ) { return trim( strip_tags( (string) $s ) ); }
function sanitize_email( $e ) { $e = trim( (string) $e ); return preg_match( '/^[^@\s]+@[^@\s]+\.[^@\s]+$/', $e ) ? $e : ''; }
function is_email( $e ) { return (bool) preg_match( '/^[^@\s]+@[^@\s]+\.[^@\s]+$/', (string) $e ); }
function sanitize_key( $k ) { return preg_replace( '/[^a-z0-9_\-]/', '', strtolower( (string) $k ) ); }
function sanitize_title( $t ) {
	$t = strtolower( trim( strip_tags( (string) $t ) ) );
	$t = preg_replace( '/[^a-z0-9]+/', '-', $t );
	return trim( $t, '-' );
}
function sanitize_user( $u, $strict = false ) { return preg_replace( '/[^a-z0-9_.\-]/i', '', (string) $u ); }
function sanitize_file_name( $f ) { return preg_replace( '/[^A-Za-z0-9._-]/', '', (string) $f ); }
function absint( $v ) { return abs( (int) $v ); }
function wp_parse_args( $a, $d = array() ) { return array_merge( $d, (array) $a ); }

// ---- time ------------------------------------------------------------------
function current_time( $type, $gmt = 0 ) {
	if ( 'mysql' === $type ) { return WP_Test_State::$now; }
	if ( 'timestamp' === $type ) { return strtotime( WP_Test_State::$now . ' UTC' ); }
	return gmdate( $type, strtotime( WP_Test_State::$now . ' UTC' ) );
}

// ---- options / transients --------------------------------------------------
function get_option( $k, $d = false ) { return array_key_exists( $k, WP_Test_State::$options ) ? WP_Test_State::$options[ $k ] : $d; }
function update_option( $k, $v, $a = null ) { WP_Test_State::$options[ $k ] = $v; return true; }
function add_option( $k, $v, $x = '', $a = 'yes' ) { if ( ! array_key_exists( $k, WP_Test_State::$options ) ) { WP_Test_State::$options[ $k ] = $v; return true; } return false; }
function delete_option( $k ) { unset( WP_Test_State::$options[ $k ] ); return true; }
function get_transient( $k ) { if ( ! isset( WP_Test_State::$transients[ $k ] ) ) { return false; } list( $v, $exp ) = WP_Test_State::$transients[ $k ]; if ( $exp && $exp < time() ) { unset( WP_Test_State::$transients[ $k ] ); return false; } return $v; }
function set_transient( $k, $v, $ttl = 0 ) { WP_Test_State::$transients[ $k ] = array( $v, $ttl ? time() + $ttl : 0 ); return true; }
function delete_transient( $k ) { unset( WP_Test_State::$transients[ $k ] ); return true; }

// ---- hooks -----------------------------------------------------------------
function add_action( $h, $cb, $p = 10, $a = 1 ) { WP_Test_State::$hooks[ $h ][] = $cb; return true; }
function add_filter( $h, $cb, $p = 10, $a = 1 ) { WP_Test_State::$hooks[ $h ][] = $cb; return true; }
function do_action( $h, ...$args ) { WP_Test_State::$fired[] = $h; foreach ( WP_Test_State::$hooks[ $h ] ?? array() as $cb ) { call_user_func_array( $cb, $args ); } }
function apply_filters( $h, $v, ...$args ) { foreach ( WP_Test_State::$hooks[ $h ] ?? array() as $cb ) { $v = call_user_func_array( $cb, array_merge( array( $v ), $args ) ); } return $v; }
function has_action( $h ) { return ! empty( WP_Test_State::$hooks[ $h ] ); }
function wp_doing_cron() { return false; }
function wp_doing_ajax() { return false; }
function is_admin() { return false; }
function add_shortcode( $t, $cb ) { WP_Test_State::$hooks[ 'shortcode_' . $t ][] = $cb; }
function do_shortcode( $c ) { return $c; }
function shortcode_atts( $d, $a, $s = '' ) { return array_merge( $d, (array) $a ); }
function add_rewrite_rule( $r, $q, $a = 'bottom' ) {}
function flush_rewrite_rules( $h = true ) {}
function wp_enqueue_script( ...$a ) {}
function wp_enqueue_style( ...$a ) {}
function wp_register_script( ...$a ) {}
function wp_register_style( ...$a ) {}
function wp_localize_script( $handle, $name, $data ) { WP_Test_State::$localized[ $name ] = $data; }
function wp_add_inline_script( ...$a ) {}
function wp_script_is( ...$a ) { return false; }
function wp_style_is( ...$a ) { return false; }
function wp_set_script_translations( ...$a ) {}
function get_query_var( $v, $d = '' ) { return $d; }
function wp_safe_redirect( $u, $s = 302 ) { throw new RuntimeException( 'redirect:' . $u ); }
function status_header( $c ) {}
function nocache_headers() {}
function get_stylesheet_directory_uri() { return ''; }
function is_singular() { return false; }
function get_the_ID() { return 0; }
function get_queried_object_id() { return 0; }

// ---- urls ------------------------------------------------------------------
function home_url( $p = '', $s = null ) { return WP_Test_State::$home . $p; }
function site_url( $p = '', $s = null ) { return WP_Test_State::$home . $p; }
function admin_url( $p = '' ) { return WP_Test_State::$home . '/wp-admin/' . $p; }
function rest_url( $p = '' ) { return WP_Test_State::$home . '/wp-json/' . $p; }
function get_permalink( $id = 0 ) { return isset( WP_Test_State::$posts[ $id ] ) ? WP_Test_State::$home . '/' . WP_Test_State::$posts[ $id ]['post_name'] . '/' : ''; }
function add_query_arg( ...$args ) {
	if ( is_array( $args[0] ) ) { $params = $args[0]; $url = $args[1] ?? ''; } else { $params = array( $args[0] => $args[1] ); $url = $args[2] ?? ''; }
	$sep = false === strpos( $url, '?' ) ? '?' : '&';
	return $url . $sep . http_build_query( $params );
}
function remove_query_arg( $k, $u = '' ) { return $u; }
function get_bloginfo( $k = '' ) { return 'name' === $k ? 'Test Clinic' : ''; }
function wp_get_attachment_image_url( $id, $size = 'thumbnail' ) { return $id > 0 ? 'https://example.test/uploads/' . $id . '.jpg' : false; }
function wp_get_attachment_url( $id ) { return $id > 0 ? 'https://example.test/uploads/' . $id . '.jpg' : false; }
function get_post( $id ) { return WP_Test_State::$posts[ (int) $id ] ?? null; }
function get_post_status( $id ) { return isset( WP_Test_State::$posts[ (int) $id ] ) ? WP_Test_State::$posts[ (int) $id ]['post_status'] : false; }
function wp_insert_post( $a, $wp_error = false ) { $id = WP_Test_State::$next_post++; $a['ID'] = $id; WP_Test_State::$posts[ $id ] = $a; return $id; }
function get_page_by_path( $p ) { foreach ( WP_Test_State::$posts as $post ) { if ( $post['post_name'] === $p ) { return (object) $post; } } return null; }

// ---- WP_Error ----------------------------------------------------------------
class WP_Error {
	public $errors = array();
	public $error_data = array();
	public function __construct( $code = '', $message = '', $data = '' ) { if ( '' !== $code ) { $this->errors[ $code ][] = $message; if ( '' !== $data ) { $this->error_data[ $code ] = $data; } } }
	public function get_error_code() { $k = array_keys( $this->errors ); return $k[0] ?? ''; }
	public function get_error_message( $code = '' ) { if ( '' === $code ) { $code = $this->get_error_code(); } return $this->errors[ $code ][0] ?? ''; }
	public function get_error_data( $code = '' ) { if ( '' === $code ) { $code = $this->get_error_code(); } return $this->error_data[ $code ] ?? null; }
	public function add( $code, $message, $data = '' ) { $this->errors[ $code ][] = $message; if ( '' !== $data ) { $this->error_data[ $code ] = $data; } }
}
function is_wp_error( $t ) { return $t instanceof WP_Error; }

// ---- users / roles / caps -------------------------------------------------
class WP_Role { public $name; public $capabilities; public function __construct( $n, $c ) { $this->name = $n; $this->capabilities = $c; } public function has_cap( $c ) { return ! empty( $this->capabilities[ $c ] ); } }
function add_role( $r, $n, $caps = array() ) { if ( isset( WP_Test_State::$roles[ $r ] ) ) { return null; } WP_Test_State::$roles[ $r ] = $caps; return new WP_Role( $r, $caps ); }
function get_role( $r ) { return isset( WP_Test_State::$roles[ $r ] ) ? new WP_Role( $r, WP_Test_State::$roles[ $r ] ) : null; }
function remove_role( $r ) { unset( WP_Test_State::$roles[ $r ] ); }

class WP_User {
	public $ID = 0; public $user_login = ''; public $user_email = ''; public $user_pass = ''; public $display_name = ''; public $roles = array(); public $data;
	public function __construct( array $row = array() ) { foreach ( $row as $k => $v ) { $this->$k = $v; } $this->data = (object) $row; }
	public function exists() { return $this->ID > 0; }
	public function has_cap( $cap ) { return user_can( $this->ID, $cap ); }
	public function set_role( $r ) { $this->roles = array( $r ); WP_Test_State::$users[ $this->ID ]['roles'] = array( $r ); }
}
function wp_insert_user( $a ) {
	$a = (array) $a;
	if ( ! empty( $a['ID'] ) ) { return wp_update_user( $a ); }
	if ( empty( $a['user_login'] ) ) { return new WP_Error( 'empty_user_login', 'Cannot create a user with an empty login name.' ); }
	if ( username_exists( $a['user_login'] ) ) { return new WP_Error( 'existing_user_login', 'Sorry, that username already exists!' ); }
	if ( ! empty( $a['user_email'] ) && email_exists( $a['user_email'] ) ) { return new WP_Error( 'existing_user_email', 'Sorry, that email address is already used!' ); }
	$id = WP_Test_State::$next_uid++;
	WP_Test_State::$users[ $id ] = array(
		'ID' => $id,
		'user_login' => $a['user_login'],
		'user_email' => $a['user_email'] ?? '',
		'user_pass' => password_hash( (string) ( $a['user_pass'] ?? '' ), PASSWORD_DEFAULT ),
		'display_name' => $a['display_name'] ?? $a['user_login'],
		'roles' => isset( $a['role'] ) ? array( $a['role'] ) : array( 'subscriber' ),
	);
	return $id;
}
function wp_create_user( $l, $p, $e = '' ) { return wp_insert_user( array( 'user_login' => $l, 'user_pass' => $p, 'user_email' => $e ) ); }
function wp_update_user( $a ) {
	$a = (array) $a; $id = (int) ( $a['ID'] ?? 0 );
	if ( ! isset( WP_Test_State::$users[ $id ] ) ) { return new WP_Error( 'invalid_user_id', 'Invalid user ID.' ); }
	if ( ! empty( $a['user_email'] ) ) { $other = get_user_by( 'email', $a['user_email'] ); if ( $other && (int) $other->ID !== $id ) { return new WP_Error( 'existing_user_email', 'Sorry, that email address is already used!' ); } WP_Test_State::$users[ $id ]['user_email'] = $a['user_email']; }
	if ( isset( $a['display_name'] ) ) { WP_Test_State::$users[ $id ]['display_name'] = $a['display_name']; }
	if ( ! empty( $a['user_pass'] ) ) { WP_Test_State::$users[ $id ]['user_pass'] = password_hash( (string) $a['user_pass'], PASSWORD_DEFAULT ); }
	if ( ! empty( $a['role'] ) ) { WP_Test_State::$users[ $id ]['roles'] = array( $a['role'] ); }
	return $id;
}
function wp_delete_user( $id, $r = null ) { unset( WP_Test_State::$users[ (int) $id ], WP_Test_State::$usermeta[ (int) $id ] ); return true; }
function get_userdata( $id ) { return isset( WP_Test_State::$users[ (int) $id ] ) ? new WP_User( WP_Test_State::$users[ (int) $id ] ) : false; }
function get_user_by( $field, $value ) {
	foreach ( WP_Test_State::$users as $u ) {
		if ( 'email' === $field && strcasecmp( $u['user_email'], (string) $value ) === 0 ) { return new WP_User( $u ); }
		if ( 'login' === $field && $u['user_login'] === $value ) { return new WP_User( $u ); }
		if ( ( 'id' === $field || 'ID' === $field ) && (int) $u['ID'] === (int) $value ) { return new WP_User( $u ); }
	}
	return false;
}
function username_exists( $l ) { $u = get_user_by( 'login', $l ); return $u ? $u->ID : false; }
function email_exists( $e ) { $u = get_user_by( 'email', $e ); return $u ? $u->ID : false; }
function wp_set_password( $p, $id ) { WP_Test_State::$users[ (int) $id ]['user_pass'] = password_hash( (string) $p, PASSWORD_DEFAULT ); }
function wp_check_password( $p, $hash, $id = '' ) { return password_verify( (string) $p, (string) $hash ); }
function wp_hash_password( $p ) { return password_hash( (string) $p, PASSWORD_DEFAULT ); }
function wp_generate_password( $len = 12, $sc = true, $esc = false ) { $c = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; $o = ''; for ( $i = 0; $i < $len; $i++ ) { $o .= $c[ random_int( 0, strlen( $c ) - 1 ) ]; } return $o; }
function wp_hash( $d, $s = 'auth' ) { return hash_hmac( 'md5', (string) $d, 'test-salt' ); }
function wp_rand( $a = 0, $b = 0 ) { return random_int( (int) $a, (int) ( $b ?: PHP_INT_MAX ) ); }
function get_user_meta( $id, $k = '', $single = false ) { $v = WP_Test_State::$usermeta[ (int) $id ][ $k ] ?? ( $single ? '' : array() ); return $v; }
function update_user_meta( $id, $k, $v, $p = '' ) { WP_Test_State::$usermeta[ (int) $id ][ $k ] = $v; return true; }
function delete_user_meta( $id, $k, $v = '' ) { unset( WP_Test_State::$usermeta[ (int) $id ][ $k ] ); return true; }
function user_can( $user, $cap ) {
	$id = $user instanceof WP_User ? (int) $user->ID : (int) $user;
	if ( ! isset( WP_Test_State::$users[ $id ] ) ) { return false; }
	foreach ( WP_Test_State::$users[ $id ]['roles'] as $r ) { if ( ! empty( WP_Test_State::$roles[ $r ][ $cap ] ) ) { return true; } }
	return false;
}
function current_user_can( $cap ) { return user_can( WP_Test_State::$current, $cap ); }
function get_current_user_id() { return WP_Test_State::$current; }
function wp_get_current_user() { return get_userdata( WP_Test_State::$current ) ?: new WP_User(); }
function wp_set_current_user( $id ) { WP_Test_State::$current = (int) $id; return wp_get_current_user(); }
function is_user_logged_in() { return WP_Test_State::$current > 0; }
function wp_signon( $creds, $secure = '' ) {
	$u = get_user_by( 'email', $creds['user_login'] ?? '' ) ?: get_user_by( 'login', $creds['user_login'] ?? '' );
	if ( ! $u || ! wp_check_password( $creds['user_password'] ?? '', $u->user_pass ) ) { return new WP_Error( 'incorrect_password', 'The password you entered is incorrect.' ); }
	WP_Test_State::$current = (int) $u->ID;
	return $u;
}
function wp_set_auth_cookie( ...$a ) {}
function wp_logout() { WP_Test_State::$current = 0; }
function wp_lostpassword_url( $r = '' ) { return WP_Test_State::$home . '/wp-login.php?action=lostpassword'; }
function wp_logout_url( $r = '' ) { return WP_Test_State::$home . '/__test/logout?redirect_to=' . rawurlencode( (string) $r ); }
function wp_login_url( $r = '' ) { return WP_Test_State::$home . '/wp-login.php'; }
function wp_create_nonce( $a = -1 ) { return 'nonce-' . md5( (string) $a . WP_Test_State::$current ); }
function wp_verify_nonce( $n, $a = -1 ) { return $n === wp_create_nonce( $a ) ? 1 : false; }
function check_ajax_referer( ...$a ) { return true; }
function wp_mail( $to, $subject, $message, $headers = '', $attachments = array() ) { WP_Test_State::$mails[] = compact( 'to', 'subject', 'message', 'headers' ); return true; }
function wp_privacy_anonymize_data( $t, $d = '' ) { return ''; }

// ---- REST -----------------------------------------------------------------------
class WP_REST_Request implements ArrayAccess {
	private $method; private $route; private $params = array(); private $headers = array(); private $json = null;
	public function __construct( $method = 'GET', $route = '' ) { $this->method = $method; $this->route = $route; }
	public function set_param( $k, $v ) { $this->params[ $k ] = $v; }
	public function set_params( array $p ) { $this->params = array_merge( $this->params, $p ); }
	public function set_json( array $p ) { $this->json = $p; $this->params = array_merge( $this->params, $p ); }
	public function get_param( $k ) { return $this->params[ $k ] ?? null; }
	public function get_params() { return $this->params; }
	public function get_json_params() { return $this->json ?? array(); }
	public function get_query_params() { return $this->params; }
	public function get_body_params() { return $this->json ?? array(); }
	public function get_url_params() { return $this->params; }
	public function get_method() { return $this->method; }
	public function get_route() { return $this->route; }
	public function get_header( $k ) { return $this->headers[ strtolower( $k ) ] ?? null; }
	public function set_header( $k, $v ) { $this->headers[ strtolower( $k ) ] = $v; }
	public function offsetExists( $o ): bool { return isset( $this->params[ $o ] ); }
	#[\ReturnTypeWillChange]
	public function offsetGet( $o ) { return $this->params[ $o ] ?? null; }
	public function offsetSet( $o, $v ): void { $this->params[ $o ] = $v; }
	public function offsetUnset( $o ): void { unset( $this->params[ $o ] ); }
}
class WP_REST_Response {
	public $data; public $status; public $headers = array();
	public function __construct( $data = null, $status = 200, $headers = array() ) { $this->data = $data; $this->status = $status; $this->headers = $headers; }
	public function get_data() { return $this->data; }
	public function get_status() { return $this->status; }
	public function set_status( $s ) { $this->status = $s; }
	public function header( $k, $v ) { $this->headers[ $k ] = $v; }
}
function rest_ensure_response( $r ) { return $r instanceof WP_REST_Response || $r instanceof WP_Error ? $r : new WP_REST_Response( $r ); }
function register_rest_route( $ns, $route, $args = array(), $override = false ) {
	$handlers = isset( $args['callback'] ) ? array( $args ) : $args;
	foreach ( $handlers as $h ) {
		$methods = is_array( $h['methods'] ) ? $h['methods'] : explode( ',', (string) $h['methods'] );
		foreach ( $methods as $m ) {
			WP_Test_State::$rest_routes[] = array( 'ns' => $ns, 'route' => $route, 'method' => trim( $m ), 'handler' => $h );
		}
	}
	return true;
}
function rest_authorization_required_code() { return WP_Test_State::$current > 0 ? 403 : 401; }
function rest_sanitize_boolean( $v ) { return filter_var( $v, FILTER_VALIDATE_BOOLEAN ); }
class WP_REST_Server { const READABLE = 'GET'; const CREATABLE = 'POST'; const EDITABLE = 'POST, PUT, PATCH'; const DELETABLE = 'DELETE'; const ALLMETHODS = 'GET, POST, PUT, PATCH, DELETE'; }

/**
 * Dispatches a request through the stub route table (permission callback + callback).
 */
function wp_test_rest_dispatch( string $method, string $path, array $params = array(), array $json = array() ) {
	$method = strtoupper( $method );
	foreach ( WP_Test_State::$rest_routes as $r ) {
		if ( $r['method'] !== $method ) { continue; }
		$full  = '/' . trim( $r['ns'], '/' ) . $r['route'];
		$regex = '#^' . preg_replace( '/\(\?P<(\w+)>[^)]*\)/', '(?P<$1>[^/]+)', $full ) . '$#';
		if ( preg_match( $regex, $path, $m ) ) {
			$req = new WP_REST_Request( $method, $path );
			foreach ( $m as $k => $v ) { if ( ! is_int( $k ) ) { $req->set_param( $k, $v ); } }
			$req->set_params( $params );
			if ( $json ) { $req->set_json( $json ); }
			if ( isset( $r['handler']['args'] ) ) {
				foreach ( $r['handler']['args'] as $name => $spec ) {
					$val = $req->get_param( $name );
					if ( null !== $val && isset( $spec['sanitize_callback'] ) && is_callable( $spec['sanitize_callback'] ) ) { $req->set_param( $name, call_user_func( $spec['sanitize_callback'], $val, $req, $name ) ); }
					if ( null !== $val && isset( $spec['validate_callback'] ) && is_callable( $spec['validate_callback'] ) ) { $ok = call_user_func( $spec['validate_callback'], $val, $req, $name ); if ( false === $ok || is_wp_error( $ok ) ) { return new WP_REST_Response( array( 'code' => 'rest_invalid_param', 'message' => 'Invalid parameter: ' . $name ), 400 ); } }
					if ( null === $val && isset( $spec['default'] ) ) { $req->set_param( $name, $spec['default'] ); }
					if ( null === $val && ! empty( $spec['required'] ) ) { return new WP_REST_Response( array( 'code' => 'rest_missing_callback_param', 'message' => 'Missing parameter(s): ' . $name ), 400 ); }
				}
			}
			$perm = $r['handler']['permission_callback'] ?? '__return_true';
			$allowed = call_user_func( $perm, $req );
			if ( is_wp_error( $allowed ) ) { $d = $allowed->get_error_data(); return new WP_REST_Response( array( 'code' => $allowed->get_error_code(), 'message' => $allowed->get_error_message() ), is_array( $d ) && isset( $d['status'] ) ? (int) $d['status'] : 403 ); }
			if ( ! $allowed ) { return new WP_REST_Response( array( 'code' => 'rest_forbidden', 'message' => 'Forbidden' ), rest_authorization_required_code() ); }
			$res = call_user_func( $r['handler']['callback'], $req );
			if ( is_wp_error( $res ) ) { $d = $res->get_error_data(); return new WP_REST_Response( array( 'code' => $res->get_error_code(), 'message' => $res->get_error_message(), 'data' => $d ), is_array( $d ) && isset( $d['status'] ) ? (int) $d['status'] : 500 ); }
			return rest_ensure_response( $res );
		}
	}
	return new WP_REST_Response( array( 'code' => 'rest_no_route', 'message' => 'No route for ' . $method . ' ' . $path ), 404 );
}
function __return_true() { return true; }
function __return_false() { return false; }

// ---- additions for REST / front-end tests ----------------------------------
function is_ssl() { return true; }
function _n( $s, $p, $n, $d = null ) { return 1 === (int) $n ? $s : $p; }
function esc_html_e( $t, $d = null ) { echo htmlspecialchars( (string) $t, ENT_QUOTES, 'UTF-8' ); }
function esc_attr_e( $t, $d = null ) { echo htmlspecialchars( (string) $t, ENT_QUOTES, 'UTF-8' ); }
function language_attributes() { echo 'lang="en-US"'; }
function selected( $a, $b = true, $echo = true ) { $s = (string) $a === (string) $b ? ' selected="selected"' : ''; if ( $echo ) { echo $s; } return $s; }
function wpautop( $t ) { return '<p>' . str_replace( "\n\n", '</p><p>', (string) $t ) . '</p>'; }
function wp_trim_words( $t, $n = 55, $m = '…' ) { $w = preg_split( '/\s+/', trim( (string) $t ) ); return count( $w ) > $n ? implode( ' ', array_slice( $w, 0, $n ) ) . $m : implode( ' ', $w ); }
function wp_die( $m = '', $t = '', $a = array() ) { throw new RuntimeException( 'wp_die:' . $m ); }
function _x( $t, $c, $d = null ) { return $t; }
