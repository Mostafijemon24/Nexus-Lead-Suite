<?php
/**
 * Appointment module loader.
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
 * Requires the module classes and runs activation tasks.
 */
final class Module {

	/**
	 * Loads every class file (cheap: no side effects on include).
	 *
	 * @return void
	 */
	public static function load(): void {
		static $loaded = false;
		if ( $loaded ) {
			return;
		}
		$loaded = true;

		$dir = __DIR__ . '/';
		require_once $dir . 'class-schema.php';
		require_once $dir . 'class-roles.php';
		require_once $dir . 'class-settings.php';
		require_once $dir . 'class-validator.php';
		require_once $dir . 'class-catalog-store.php';
		require_once $dir . 'class-availability.php';
		require_once $dir . 'class-doctors-store.php';
		require_once $dir . 'class-patients-store.php';
		require_once $dir . 'class-appointments-store.php';
		require_once $dir . 'class-treatments-store.php';
	}

	/**
	 * Activation: tables, roles, front-end pages.
	 *
	 * @return void
	 */
	public static function activate(): void {
		self::load();
		Schema::install();
		Roles::install();
		self::ensure_pages();
	}

	/**
	 * Creates the shortcode pages once and remembers their ids in settings.
	 *
	 * @return void
	 */
	public static function ensure_pages(): void {
		if ( ! function_exists( 'wp_insert_post' ) ) {
			return;
		}
		$settings = Settings::get();
		$pages    = is_array( $settings['pages'] ) ? $settings['pages'] : array();
		$titles   = array(
			'doctors'       => __( 'Doctors', 'nexus-lead-suite' ),
			'doctor'        => __( 'Doctor', 'nexus-lead-suite' ),
			'departments'   => __( 'Departments', 'nexus-lead-suite' ),
			'department'    => __( 'Department', 'nexus-lead-suite' ),
			'booking'       => __( 'Book an Appointment', 'nexus-lead-suite' ),
			'auth'          => __( 'Login or Register', 'nexus-lead-suite' ),
			'patient_panel' => __( 'My Account', 'nexus-lead-suite' ),
			'doctor_panel'  => __( 'Doctor Panel', 'nexus-lead-suite' ),
		);
		$changed = false;
		foreach ( Settings::PAGES as $key => $shortcode ) {
			$existing = isset( $pages[ $key ] ) ? (int) $pages[ $key ] : 0;
			if ( $existing > 0 && get_post( $existing ) && 'trash' !== get_post_status( $existing ) ) {
				continue;
			}
			$id = wp_insert_post(
				array(
					'post_title'   => $titles[ $key ],
					'post_name'    => 'nexus-' . str_replace( '_', '-', $key ),
					'post_content' => $shortcode,
					'post_status'  => 'publish',
					'post_type'    => 'page',
					'comment_status' => 'closed',
				),
				true
			);
			if ( ! is_wp_error( $id ) && (int) $id > 0 ) {
				$pages[ $key ] = (int) $id;
				$changed       = true;
			}
		}
		if ( $changed ) {
			Settings::save( array( 'pages' => $pages ) );
			// Pretty URLs depend on the page ids: ask the front end to flush rewrite rules once.
			update_option( 'nexulesuite_appt_flush_rewrites', '1', false );
		}
	}
}
