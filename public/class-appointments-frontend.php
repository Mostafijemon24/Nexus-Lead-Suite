<?php
/**
 * Front end of the appointment module: shortcodes, pretty URLs, e-mail verification,
 * printable prescriptions and asset loading.
 *
 * @package nexulesuite_
 */

declare(strict_types=1);

namespace nexulesuite_\Frontend;

use nexulesuite_\Appointments\Appointments_Store;
use nexulesuite_\Appointments\Catalog_Store;
use nexulesuite_\Appointments\Doctors_Store;
use nexulesuite_\Appointments\Patients_Store;
use nexulesuite_\Appointments\Roles;
use nexulesuite_\Appointments\Settings;
use nexulesuite_\Appointments\Treatments_Store;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Server-renders the catalogue pages (SEO) and mounts the JS apps for booking, auth and panels.
 */
final class Appointments_Frontend {

	public const QV_DOCTOR     = 'nexulesuite_doctor';
	public const QV_DEPARTMENT = 'nexulesuite_department';
	public const QV_PRINT      = 'nexulesuite_prescription';

	private const HANDLE = 'nexulesuite_appointments';

	/**
	 * Whether assets were already enqueued for this request.
	 *
	 * @var bool
	 */
	private $assets_done = false;

	/**
	 * Registers hooks.
	 *
	 * @return void
	 */
	public function register_hooks(): void {
		add_shortcode( 'nexulesuite_doctors', array( $this, 'sc_doctors' ) );
		add_shortcode( 'nexulesuite_doctor', array( $this, 'sc_doctor' ) );
		add_shortcode( 'nexulesuite_departments', array( $this, 'sc_departments' ) );
		add_shortcode( 'nexulesuite_department', array( $this, 'sc_department' ) );
		add_shortcode( 'nexulesuite_appointment', array( $this, 'sc_booking' ) );
		add_shortcode( 'nexulesuite_auth', array( $this, 'sc_auth' ) );
		add_shortcode( 'nexulesuite_patient_panel', array( $this, 'sc_patient_panel' ) );
		add_shortcode( 'nexulesuite_doctor_panel', array( $this, 'sc_doctor_panel' ) );

		add_action( 'init', array( self::class, 'register_rewrites' ), 15 );
		add_filter( 'query_vars', array( $this, 'query_vars' ) );
		add_action( 'template_redirect', array( $this, 'maybe_verify_email' ), 4 );
		add_action( 'template_redirect', array( $this, 'maybe_print_prescription' ), 4 );
		add_filter( 'document_title_parts', array( $this, 'document_title' ) );
	}

	/**
	 * `/doctor-details/{slug}` and `/department-details/{slug}` map to the configured pages.
	 *
	 * @return void
	 */
	public static function register_rewrites(): void {
		$doctor_page = Settings::page_id( 'doctor' );
		if ( $doctor_page > 0 ) {
			add_rewrite_rule( '^doctor-details/([^/]+)/?$', 'index.php?page_id=' . $doctor_page . '&' . self::QV_DOCTOR . '=$matches[1]', 'top' );
		}
		$dep_page = Settings::page_id( 'department' );
		if ( $dep_page > 0 ) {
			add_rewrite_rule( '^department-details/([^/]+)/?$', 'index.php?page_id=' . $dep_page . '&' . self::QV_DEPARTMENT . '=$matches[1]', 'top' );
		}
		if ( '1' === (string) get_option( 'nexulesuite_appt_flush_rewrites', '' ) ) {
			delete_option( 'nexulesuite_appt_flush_rewrites' );
			// After every plugin has registered its rules for this request.
			add_action(
				'wp_loaded',
				static function (): void {
					flush_rewrite_rules( false );
				}
			);
		}
	}

	/**
	 * @param array<int,string> $vars Query vars.
	 * @return array<int,string>
	 */
	public function query_vars( array $vars ): array {
		$vars[] = self::QV_DOCTOR;
		$vars[] = self::QV_DEPARTMENT;

		return $vars;
	}

	/**
	 * Doctor / department pages get a proper <title>.
	 *
	 * @param array<string,string> $parts Title parts.
	 * @return array<string,string>
	 */
	public function document_title( array $parts ): array {
		$slug = (string) get_query_var( self::QV_DOCTOR, '' );
		if ( '' !== $slug ) {
			$d = Doctors_Store::get_by_slug( $slug );
			if ( $d ) {
				$parts['title'] = $d['name'];
			}
		}
		$slug = (string) get_query_var( self::QV_DEPARTMENT, '' );
		if ( '' !== $slug ) {
			$dep = Catalog_Store::get_by_slug( 'departments', $slug );
			if ( $dep ) {
				$parts['title'] = $dep['name'];
			}
		}

		return $parts;
	}

	/* ------------------------------------------------------------------ */
	/* URLs                                                                 */
	/* ------------------------------------------------------------------ */

	/**
	 * @param string $key Page key.
	 * @return string
	 */
	public static function page_url( string $key ): string {
		$id = Settings::page_id( $key );

		return $id > 0 ? (string) get_permalink( $id ) : home_url( '/' );
	}

	/**
	 * @param string $slug Doctor slug.
	 * @return string
	 */
	public static function doctor_url( string $slug ): string {
		if ( Settings::page_id( 'doctor' ) > 0 && '' !== (string) get_option( 'permalink_structure', '' ) ) {
			return home_url( '/doctor-details/' . rawurlencode( $slug ) . '/' );
		}

		return add_query_arg( self::QV_DOCTOR, rawurlencode( $slug ), self::page_url( 'doctor' ) );
	}

	/**
	 * @param string $slug Department slug.
	 * @return string
	 */
	public static function department_url( string $slug ): string {
		if ( Settings::page_id( 'department' ) > 0 && '' !== (string) get_option( 'permalink_structure', '' ) ) {
			return home_url( '/department-details/' . rawurlencode( $slug ) . '/' );
		}

		return add_query_arg( self::QV_DEPARTMENT, rawurlencode( $slug ), self::page_url( 'department' ) );
	}

	/**
	 * @param int $doctor_id Doctor id.
	 * @return string
	 */
	public static function booking_url( int $doctor_id = 0 ): string {
		$url = self::page_url( 'booking' );

		return $doctor_id > 0 ? add_query_arg( 'doctor', $doctor_id, $url ) : $url;
	}

	/**
	 * @param int $appointment_id Appointment id.
	 * @return string
	 */
	public static function print_url( int $appointment_id ): string {
		return add_query_arg(
			array(
				self::QV_PRINT => $appointment_id,
				'_wpnonce'     => wp_create_nonce( 'nexulesuite_print_' . $appointment_id ),
			),
			home_url( '/' )
		);
	}

	/* ------------------------------------------------------------------ */
	/* Assets                                                               */
	/* ------------------------------------------------------------------ */

	/**
	 * Enqueues CSS/JS once and localises config.
	 *
	 * @return void
	 */
	private function assets(): void {
		if ( $this->assets_done ) {
			return;
		}
		$this->assets_done = true;

		$css = nexulesuite_PLUGIN_DIR . 'public/css/appointments.css';
		$js  = nexulesuite_PLUGIN_DIR . 'public/js/appointments.js';
		wp_enqueue_style( self::HANDLE, nexulesuite_PLUGIN_URL . 'public/css/appointments.css', array(), file_exists( $css ) ? (string) filemtime( $css ) : nexulesuite_VERSION );
		wp_enqueue_script( self::HANDLE, nexulesuite_PLUGIN_URL . 'public/js/appointments.js', array(), file_exists( $js ) ? (string) filemtime( $js ) : nexulesuite_VERSION, true );

		$uid  = get_current_user_id();
		$role = 'guest';
		if ( $uid > 0 ) {
			$role = Roles::is_admin( $uid ) ? 'admin' : ( Roles::is_doctor( $uid ) ? 'doctor' : ( Roles::is_patient( $uid ) ? 'patient' : 'user' ) );
		}
		$s = Settings::get();
		wp_localize_script(
			self::HANDLE,
			'nexulesuite_Appt',
			array(
				'restUrl'        => esc_url_raw( rest_url( 'nexulesuite_/v1/appt/' ) ),
				'nonce'          => wp_create_nonce( 'wp_rest' ),
				'loggedIn'       => $uid > 0,
				'role'           => $role,
				'currencySymbol' => (string) $s['currencySymbol'],
				'slotMinutes'    => (int) $s['slotMinutes'],
				'bookingWindowDays' => (int) $s['bookingWindowDays'],
				'today'          => \nexulesuite_\Appointments\Availability::today(),
				'pages'          => array(
					'doctors'      => self::page_url( 'doctors' ),
					'booking'      => self::page_url( 'booking' ),
					'auth'         => self::page_url( 'auth' ),
					'patientPanel' => self::page_url( 'patient_panel' ),
					'doctorPanel'  => self::page_url( 'doctor_panel' ),
				),
				'printUrlBase'   => esc_url_raw( home_url( '/' ) ),
				'logoutUrl'      => esc_url_raw( wp_logout_url( self::page_url( 'auth' ) ) ),
				'lostPasswordUrl'=> esc_url_raw( wp_lostpassword_url( self::page_url( 'auth' ) ) ),
				'weekdays'       => array( __( 'Sunday', 'nexus-lead-suite' ), __( 'Monday', 'nexus-lead-suite' ), __( 'Tuesday', 'nexus-lead-suite' ), __( 'Wednesday', 'nexus-lead-suite' ), __( 'Thursday', 'nexus-lead-suite' ), __( 'Friday', 'nexus-lead-suite' ), __( 'Saturday', 'nexus-lead-suite' ) ),
				'i18n'           => $this->i18n(),
			)
		);
	}

	/**
	 * Strings for the JS apps.
	 *
	 * @return array<string,string>
	 */
	private function i18n(): array {
		return array(
			'loading'          => __( 'Loading…', 'nexus-lead-suite' ),
			'retry'            => __( 'Retry', 'nexus-lead-suite' ),
			'networkError'     => __( 'Could not reach the server. Please try again.', 'nexus-lead-suite' ),
			'sessionExpired'   => __( 'Your session has expired. Please reload the page and try again.', 'nexus-lead-suite' ),
			'department'       => __( 'Department', 'nexus-lead-suite' ),
			'doctor'           => __( 'Doctor', 'nexus-lead-suite' ),
			'date'             => __( 'Date', 'nexus-lead-suite' ),
			'time'             => __( 'Time', 'nexus-lead-suite' ),
			'confirm'          => __( 'Confirm', 'nexus-lead-suite' ),
			'back'             => __( 'Back', 'nexus-lead-suite' ),
			'next'             => __( 'Next', 'nexus-lead-suite' ),
			'chooseDepartment' => __( 'Choose a department', 'nexus-lead-suite' ),
			'chooseDoctor'     => __( 'Choose a doctor', 'nexus-lead-suite' ),
			'chooseDate'       => __( 'Choose a date', 'nexus-lead-suite' ),
			'chooseTime'       => __( 'Choose a time slot', 'nexus-lead-suite' ),
			'review'           => __( 'Review and confirm', 'nexus-lead-suite' ),
			'noDoctors'        => __( 'No doctors in this department yet.', 'nexus-lead-suite' ),
			'noSlots'          => __( 'No free slots on this day. Pick another date.', 'nexus-lead-suite' ),
			'onLeave'          => __( 'The doctor is on leave this day.', 'nexus-lead-suite' ),
			'closed'           => __( 'The doctor has no hours this day.', 'nexus-lead-suite' ),
			'fee'              => __( 'Fee', 'nexus-lead-suite' ),
			'reason'           => __( 'Reason for visit (optional)', 'nexus-lead-suite' ),
			'paymentMethod'    => __( 'Payment', 'nexus-lead-suite' ),
			'payAtClinic'      => __( 'Pay at the clinic', 'nexus-lead-suite' ),
			'bankTransfer'     => __( 'Bank transfer', 'nexus-lead-suite' ),
			'free'             => __( 'Free', 'nexus-lead-suite' ),
			'loginToBook'      => __( 'Log in or create a patient account to confirm this appointment.', 'nexus-lead-suite' ),
			'booked'           => __( 'Your appointment is booked.', 'nexus-lead-suite' ),
			'bookingCode'      => __( 'Appointment code', 'nexus-lead-suite' ),
			'viewAppointments' => __( 'View my appointments', 'nexus-lead-suite' ),
			'bookAnother'      => __( 'Book another appointment', 'nexus-lead-suite' ),
			'login'            => __( 'Log in', 'nexus-lead-suite' ),
			'register'         => __( 'Register', 'nexus-lead-suite' ),
			'email'            => __( 'E-mail', 'nexus-lead-suite' ),
			'password'         => __( 'Password', 'nexus-lead-suite' ),
			'passwordConfirm'  => __( 'Confirm password', 'nexus-lead-suite' ),
			'fullName'         => __( 'Full name', 'nexus-lead-suite' ),
			'phone'            => __( 'Phone', 'nexus-lead-suite' ),
			'address'          => __( 'Address', 'nexus-lead-suite' ),
			'forgot'           => __( 'Forgot your password?', 'nexus-lead-suite' ),
			'doctorLogin'      => __( 'Doctor login', 'nexus-lead-suite' ),
			'patientLogin'     => __( 'Patient login', 'nexus-lead-suite' ),
			'checkInbox'       => __( 'Almost done. We sent a confirmation link to your e-mail. Open it to activate your account.', 'nexus-lead-suite' ),
			'resend'           => __( 'Resend the e-mail', 'nexus-lead-suite' ),
			'resent'           => __( 'If an unverified account exists for that address, a new link has been sent.', 'nexus-lead-suite' ),
			'verifiedOk'       => __( 'Your e-mail is confirmed. You can log in now.', 'nexus-lead-suite' ),
			'verifiedFail'     => __( 'That confirmation link is invalid or has expired. Request a new one below.', 'nexus-lead-suite' ),
			'dashboard'        => __( 'Dashboard', 'nexus-lead-suite' ),
			'appointments'     => __( 'Appointments', 'nexus-lead-suite' ),
			'payments'         => __( 'Payments', 'nexus-lead-suite' ),
			'profile'          => __( 'Profile', 'nexus-lead-suite' ),
			'changePassword'   => __( 'Change password', 'nexus-lead-suite' ),
			'logout'           => __( 'Log out', 'nexus-lead-suite' ),
			'timeSchedule'     => __( 'Time schedule', 'nexus-lead-suite' ),
			'leaveDays'        => __( 'Leave days', 'nexus-lead-suite' ),
			'prescriptions'    => __( 'Prescriptions', 'nexus-lead-suite' ),
			'status'           => __( 'Status', 'nexus-lead-suite' ),
			'actions'          => __( 'Actions', 'nexus-lead-suite' ),
			'patient'          => __( 'Patient', 'nexus-lead-suite' ),
			'print'            => __( 'Print prescription', 'nexus-lead-suite' ),
			'cancel'           => __( 'Cancel appointment', 'nexus-lead-suite' ),
			'cancelConfirm'    => __( 'Cancel this appointment?', 'nexus-lead-suite' ),
			'treat'            => __( 'Treat', 'nexus-lead-suite' ),
			'view'             => __( 'View', 'nexus-lead-suite' ),
			'empty'            => __( 'Nothing here yet.', 'nexus-lead-suite' ),
			'save'             => __( 'Save', 'nexus-lead-suite' ),
			'saved'            => __( 'Saved.', 'nexus-lead-suite' ),
			'all'              => __( 'All', 'nexus-lead-suite' ),
			'treated'          => __( 'Treated', 'nexus-lead-suite' ),
			'upcoming'         => __( 'Upcoming', 'nexus-lead-suite' ),
			'cancelled'        => __( 'Cancelled', 'nexus-lead-suite' ),
			'pending'          => __( 'Pending', 'nexus-lead-suite' ),
			'confirmed'        => __( 'Confirmed', 'nexus-lead-suite' ),
			'paid'             => __( 'Paid', 'nexus-lead-suite' ),
			'unpaid'           => __( 'Unpaid', 'nexus-lead-suite' ),
			'new'              => __( 'New', 'nexus-lead-suite' ),
			'notTreated'       => __( 'Not treated', 'nexus-lead-suite' ),
			'history'          => __( 'History', 'nexus-lead-suite' ),
			'today'            => __( "Today's appointments", 'nexus-lead-suite' ),
			'earningsMonth'    => __( 'Earnings this month', 'nexus-lead-suite' ),
			'newThisWeek'      => __( 'New this week', 'nexus-lead-suite' ),
			'totalPatients'    => __( 'Patients', 'nexus-lead-suite' ),
			'treatmentNotes'   => __( 'Treatment notes', 'nexus-lead-suite' ),
			'advice'           => __( 'Advice', 'nexus-lead-suite' ),
			'followUp'         => __( 'Follow-up date', 'nexus-lead-suite' ),
			'medicines'        => __( 'Medicines', 'nexus-lead-suite' ),
			'medicine'         => __( 'Medicine', 'nexus-lead-suite' ),
			'dosage'           => __( 'Dosage', 'nexus-lead-suite' ),
			'duration'         => __( 'Duration', 'nexus-lead-suite' ),
			'instruction'      => __( 'Instruction', 'nexus-lead-suite' ),
			'addMedicine'      => __( 'Add medicine', 'nexus-lead-suite' ),
			'remove'           => __( 'Remove', 'nexus-lead-suite' ),
			'saveTreatment'    => __( 'Save treatment and prescription', 'nexus-lead-suite' ),
			'enabled'          => __( 'Open', 'nexus-lead-suite' ),
			'from'             => __( 'From', 'nexus-lead-suite' ),
			'to'               => __( 'To', 'nexus-lead-suite' ),
			'slotLength'       => __( 'Slot (min)', 'nexus-lead-suite' ),
			'addLeave'         => __( 'Add leave day', 'nexus-lead-suite' ),
			'note'             => __( 'Note', 'nexus-lead-suite' ),
			'currentPassword'  => __( 'Current password', 'nexus-lead-suite' ),
			'newPassword'      => __( 'New password', 'nexus-lead-suite' ),
			'fixFields'        => __( 'Please correct the highlighted fields.', 'nexus-lead-suite' ),
			'previousHistory'  => __( 'Previous treatments for this patient', 'nexus-lead-suite' ),
			'about'            => __( 'About', 'nexus-lead-suite' ),
			'patientTab'       => __( 'Patient', 'nexus-lead-suite' ),
			'doctorTab'        => __( 'Doctor', 'nexus-lead-suite' ),
			'rememberMe'       => __( 'Remember Me', 'nexus-lead-suite' ),
			'noAccount'        => __( "Don't have an account?", 'nexus-lead-suite' ),
			'signUp'           => __( 'Sign up', 'nexus-lead-suite' ),
			'haveAccount'      => __( 'Already have an account?', 'nexus-lead-suite' ),
			'name'             => __( 'Name', 'nexus-lead-suite' ),
			'designations'     => __( 'Designations', 'nexus-lead-suite' ),
			'selectDepartment' => __( 'Select Department', 'nexus-lead-suite' ),
			'selectDoctor'     => __( 'Select Doctor', 'nexus-lead-suite' ),
			'selectLocation'   => __( 'Select Location', 'nexus-lead-suite' ),
			'selectDate'       => __( 'Select Date', 'nexus-lead-suite' ),
			'selectSchedule'   => __( 'Select Schedule', 'nexus-lead-suite' ),
			'createAppointment'=> __( 'Create Appointment', 'nexus-lead-suite' ),
			'submit'           => __( 'Submit', 'nexus-lead-suite' ),
			'doctorPending'    => __( 'Thank you for registering. Your doctor account will be reviewed and activated by the clinic administrator before you can log in.', 'nexus-lead-suite' ),
			'makeAppointment'  => __( 'Make Appointment', 'nexus-lead-suite' ),
			'appointmentList'  => __( 'Appointment/Prescription List', 'nexus-lead-suite' ),
			'orderList'        => __( 'Order List', 'nexus-lead-suite' ),
			'editProfile'      => __( 'Edit Profile', 'nexus-lead-suite' ),
			'updateProfile'    => __( 'Update Profile', 'nexus-lead-suite' ),
			'todayAppointments'=> __( 'Today Appointments', 'nexus-lead-suite' ),
			'manageAppointment'=> __( 'Manage Appointment', 'nexus-lead-suite' ),
			'newAppointment'   => __( 'New Appointment', 'nexus-lead-suite' ),
			'notTreatedLabel'  => __( 'Not treated Appointments', 'nexus-lead-suite' ),
			'historyLabel'     => __( 'Appointments History', 'nexus-lead-suite' ),
			'manageLeave'      => __( 'Manage Leave', 'nexus-lead-suite' ),
			'paymentHistory'   => __( 'Payment History', 'nexus-lead-suite' ),
			'totalEarnings'    => __( 'Total earnings', 'nexus-lead-suite' ),
			'search'           => __( 'Search', 'nexus-lead-suite' ),
			'noEarnings'       => __( 'No paid appointments this month yet.', 'nexus-lead-suite' ),
			'profileIncomplete'=> __( 'Your profile is incomplete. Add your phone number and address to book appointments.', 'nexus-lead-suite' ),
			'completeProfile'  => __( 'Complete profile', 'nexus-lead-suite' ),
			'order'            => __( 'Order', 'nexus-lead-suite' ),
			'total'            => __( 'Total', 'nexus-lead-suite' ),
			'noAvailability'   => __( 'Pick a date to see the available schedule.', 'nexus-lead-suite' ),
			'loadingSchedule'  => __( 'Checking availability…', 'nexus-lead-suite' ),
		);
	}

	/* ------------------------------------------------------------------ */
	/* Shortcodes: server rendered                                          */
	/* ------------------------------------------------------------------ */

	/**
	 * [nexulesuite_doctors] with GET filters: q, department, location, page.
	 *
	 * @param array<string,mixed>|string $atts Attributes.
	 * @return string
	 */
	public function sc_doctors( $atts = array() ): string {
		$this->assets();
		$atts = shortcode_atts( array( 'per_page' => (int) Settings::get()['perPage'] ), (array) $atts, 'nexulesuite_doctors' );

		// phpcs:disable WordPress.Security.NonceVerification.Recommended -- public read-only filters.
		$q    = isset( $_GET['q'] ) ? sanitize_text_field( wp_unslash( (string) $_GET['q'] ) ) : '';
		$dep  = isset( $_GET['department'] ) ? absint( $_GET['department'] ) : 0;
		$loc  = isset( $_GET['location'] ) ? absint( $_GET['location'] ) : 0;
		$page = isset( $_GET['pg'] ) ? max( 1, absint( $_GET['pg'] ) ) : 1;
		// phpcs:enable

		$res  = Doctors_Store::all(
			array(
				'publicOnly'   => true,
				'search'       => $q,
				'departmentId' => $dep,
				'locationId'   => $loc,
				'page'         => $page,
				'perPage'      => max( 1, (int) $atts['per_page'] ),
			)
		);
		$deps = Catalog_Store::all( 'departments', array( 'status' => 'active', 'perPage' => 200 ) )['items'];
		$locs = Catalog_Store::all( 'locations', array( 'status' => 'active', 'perPage' => 200 ) )['items'];

		ob_start();
		?>
		<div class="nxa nxa-doctors" data-nxa="doctors">
			<form class="nxa-search" method="get" action="<?php echo esc_url( self::page_url( 'doctors' ) ); ?>" role="search">
				<label class="nxa-field"><span><?php esc_html_e( 'Location', 'nexus-lead-suite' ); ?></span>
					<select name="location"><option value="0"><?php esc_html_e( 'Any location', 'nexus-lead-suite' ); ?></option>
					<?php foreach ( $locs as $l ) : ?><option value="<?php echo (int) $l['id']; ?>" <?php selected( $loc, (int) $l['id'] ); ?>><?php echo esc_html( $l['name'] ); ?></option><?php endforeach; ?>
					</select></label>
				<label class="nxa-field"><span><?php esc_html_e( 'Department', 'nexus-lead-suite' ); ?></span>
					<select name="department"><option value="0"><?php esc_html_e( 'Any department', 'nexus-lead-suite' ); ?></option>
					<?php foreach ( $deps as $d ) : ?><option value="<?php echo (int) $d['id']; ?>" <?php selected( $dep, (int) $d['id'] ); ?>><?php echo esc_html( $d['name'] ); ?></option><?php endforeach; ?>
					</select></label>
				<label class="nxa-field"><span><?php esc_html_e( 'Doctor', 'nexus-lead-suite' ); ?></span>
					<input type="search" name="q" value="<?php echo esc_attr( $q ); ?>" placeholder="<?php esc_attr_e( 'Doctor name', 'nexus-lead-suite' ); ?>"></label>
				<button type="submit" class="nxa-btn nxa-btn-primary"><?php esc_html_e( 'Search', 'nexus-lead-suite' ); ?></button>
			</form>
			<?php if ( array() === $res['items'] ) : ?>
				<div class="nxa-empty"><p><?php esc_html_e( 'No doctors match your search.', 'nexus-lead-suite' ); ?></p><a class="nxa-btn" href="<?php echo esc_url( self::page_url( 'doctors' ) ); ?>"><?php esc_html_e( 'Clear filters', 'nexus-lead-suite' ); ?></a></div>
			<?php else : ?>
				<div class="nxa-grid">
					<?php foreach ( $res['items'] as $d ) { $this->doctor_card( $d ); } ?>
				</div>
				<?php $this->pagination( $res['total'], $res['perPage'], $res['page'] ); ?>
			<?php endif; ?>
		</div>
		<?php
		return (string) ob_get_clean();
	}

	/**
	 * One doctor card.
	 *
	 * @param array<string,mixed> $d Doctor.
	 * @return void
	 */
	private function doctor_card( array $d ): void {
		?>
		<article class="nxa-card nxa-doctor-card">
			<a class="nxa-doctor-photo" href="<?php echo esc_url( self::doctor_url( $d['slug'] ) ); ?>">
				<?php if ( '' !== $d['photoUrl'] ) : ?><img src="<?php echo esc_url( $d['photoUrl'] ); ?>" alt="<?php echo esc_attr( $d['name'] ); ?>" loading="lazy"><?php else : ?><span class="nxa-avatar" aria-hidden="true"><?php echo esc_html( self::initials( $d['name'] ) ); ?></span><?php endif; ?>
			</a>
			<div class="nxa-doctor-body">
				<h3 class="nxa-doctor-name"><a href="<?php echo esc_url( self::doctor_url( $d['slug'] ) ); ?>"><?php echo esc_html( $d['name'] ); ?></a></h3>
				<p class="nxa-doctor-meta"><?php echo esc_html( $d['departmentName'] ); ?></p>
				<?php if ( '' !== $d['designations'] ) : ?><p class="nxa-doctor-designations"><?php echo esc_html( $d['designations'] ); ?></p><?php endif; ?>
				<?php if ( '' !== $d['locationName'] ) : ?><p class="nxa-doctor-location"><?php echo esc_html( $d['locationName'] ); ?></p><?php endif; ?>
				<div class="nxa-doctor-actions">
					<a class="nxa-btn" href="<?php echo esc_url( self::doctor_url( $d['slug'] ) ); ?>"><?php esc_html_e( 'View profile', 'nexus-lead-suite' ); ?></a>
					<a class="nxa-btn nxa-btn-primary" href="<?php echo esc_url( self::booking_url( (int) $d['id'] ) ); ?>"><?php esc_html_e( 'Book now', 'nexus-lead-suite' ); ?></a>
				</div>
			</div>
		</article>
		<?php
	}

	/**
	 * @param string $name Name.
	 * @return string
	 */
	public static function initials( string $name ): string {
		$parts = preg_split( '/\s+/', trim( preg_replace( '/^Dr\.?\s+/i', '', $name ) ) );
		$out   = '';
		foreach ( array_slice( (array) $parts, 0, 2 ) as $p ) {
			$out .= function_exists( 'mb_substr' ) ? mb_substr( (string) $p, 0, 1 ) : substr( (string) $p, 0, 1 );
		}

		return strtoupper( $out );
	}

	/**
	 * @param int $total    Total rows.
	 * @param int $per_page Per page.
	 * @param int $page     Current page.
	 * @return void
	 */
	private function pagination( int $total, int $per_page, int $page ): void {
		$pages = (int) ceil( $total / max( 1, $per_page ) );
		if ( $pages <= 1 ) {
			return;
		}
		echo '<nav class="nxa-pagination" aria-label="' . esc_attr__( 'Pagination', 'nexus-lead-suite' ) . '">';
		for ( $i = 1; $i <= $pages; $i++ ) {
			$url = add_query_arg( 'pg', $i );
			if ( $i === $page ) {
				echo '<span class="is-current" aria-current="page">' . (int) $i . '</span>';
			} else {
				echo '<a href="' . esc_url( $url ) . '">' . (int) $i . '</a>';
			}
		}
		echo '</nav>';
	}

	/**
	 * [nexulesuite_doctor slug=""] — defaults to the query var.
	 *
	 * @param array<string,mixed>|string $atts Attributes.
	 * @return string
	 */
	public function sc_doctor( $atts = array() ): string {
		$this->assets();
		$atts = shortcode_atts( array( 'slug' => '' ), (array) $atts, 'nexulesuite_doctor' );
		$slug = '' !== $atts['slug'] ? (string) $atts['slug'] : (string) get_query_var( self::QV_DOCTOR, '' );
		if ( '' === $slug && isset( $_GET[ self::QV_DOCTOR ] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			$slug = sanitize_title( wp_unslash( (string) $_GET[ self::QV_DOCTOR ] ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		}
		$d = '' !== $slug ? Doctors_Store::get_by_slug( $slug ) : null;
		if ( null === $d || 'active' !== $d['status'] ) {
			return '<div class="nxa nxa-empty"><p>' . esc_html__( 'This doctor profile is not available.', 'nexus-lead-suite' ) . '</p><a class="nxa-btn" href="' . esc_url( self::page_url( 'doctors' ) ) . '">' . esc_html__( 'All doctors', 'nexus-lead-suite' ) . '</a></div>';
		}
		$days = array( __( 'Sunday', 'nexus-lead-suite' ), __( 'Monday', 'nexus-lead-suite' ), __( 'Tuesday', 'nexus-lead-suite' ), __( 'Wednesday', 'nexus-lead-suite' ), __( 'Thursday', 'nexus-lead-suite' ), __( 'Friday', 'nexus-lead-suite' ), __( 'Saturday', 'nexus-lead-suite' ) );

		$open_days = array_values( array_filter( $d['schedule'], static function ( $row ) { return ! empty( $row['enabled'] ); } ) );
		$tabs = array(
			'info'          => __( 'Doctor Info', 'nexus-lead-suite' ),
			'hours'         => __( 'Working Hours', 'nexus-lead-suite' ),
			'address'       => __( 'Address', 'nexus-lead-suite' ),
			'education'     => __( 'Education', 'nexus-lead-suite' ),
			'experience'    => __( 'Experience', 'nexus-lead-suite' ),
			'qualification' => __( 'Qualification', 'nexus-lead-suite' ),
			'appointment'   => __( 'Appointment', 'nexus-lead-suite' ),
		);
		ob_start();
		?>
		<div class="nxa nxa-doctor-profile" data-nxa="doctor-profile" data-doctor-id="<?php echo (int) $d['id']; ?>">
			<div class="nxa-profile-head nxa-card">
				<div class="nxa-profile-photo"><?php if ( '' !== $d['photoUrl'] ) : ?><img src="<?php echo esc_url( $d['photoUrl'] ); ?>" alt="<?php echo esc_attr( $d['name'] ); ?>"><?php else : ?><span class="nxa-avatar nxa-avatar-lg" aria-hidden="true"><?php echo esc_html( self::initials( $d['name'] ) ); ?></span><?php endif; ?></div>
				<div class="nxa-profile-headtext">
					<h2 class="nxa-profile-name"><?php echo esc_html( $d['name'] ); ?></h2>
					<p class="nxa-profile-dept"><a href="<?php echo esc_url( self::department_url( $d['departmentSlug'] ) ); ?>"><?php echo esc_html( $d['departmentName'] ); ?></a><?php if ( '' !== $d['designations'] ) : ?> <span class="nxa-muted">(<?php echo esc_html( $d['designations'] ); ?>)</span><?php endif; ?></p>
					<ul class="nxa-profile-facts">
						<li><?php esc_html_e( 'Years of experience', 'nexus-lead-suite' ); ?>: <strong><?php echo (int) $d['experienceYears']; ?></strong></li>
						<li><?php esc_html_e( 'Fee', 'nexus-lead-suite' ); ?>: <strong><?php echo esc_html( $d['fee'] > 0 ? Settings::format_money( (float) $d['fee'] ) : __( 'Free', 'nexus-lead-suite' ) ); ?></strong></li>
						<?php if ( '' !== $d['locationName'] ) : ?><li><?php echo esc_html( $d['locationName'] ); ?></li><?php endif; ?>
					</ul>
					<?php if ( '' !== $d['bio'] ) : ?><div class="nxa-profile-bio"><?php echo wp_kses_post( wpautop( $d['bio'] ) ); ?></div><?php endif; ?>
					<p><a class="nxa-btn nxa-btn-primary" href="#nxa-tab-appointment" data-nxa-tab-link="appointment"><?php esc_html_e( 'Book now', 'nexus-lead-suite' ); ?></a></p>
				</div>
			</div>
			<div class="nxa-card nxa-profile-tabs" data-nxa="tabs">
				<div class="nxa-tabs-bar" role="tablist">
					<?php $first = true; foreach ( $tabs as $key => $label ) : ?>
						<button type="button" role="tab" id="nxa-tabbtn-<?php echo esc_attr( $key ); ?>" aria-controls="nxa-tab-<?php echo esc_attr( $key ); ?>" aria-selected="<?php echo $first ? 'true' : 'false'; ?>" class="nxa-tab<?php echo $first ? ' is-active' : ''; ?>" data-nxa-tab="<?php echo esc_attr( $key ); ?>"><?php echo esc_html( $label ); ?></button>
					<?php $first = false; endforeach; ?>
				</div>
				<section id="nxa-tab-info" role="tabpanel" class="nxa-tabpanel is-active" data-nxa-panel="info">
					<h3><?php esc_html_e( 'Doctor Info', 'nexus-lead-suite' ); ?></h3>
					<?php if ( '' !== $d['bio'] ) : ?><?php echo wp_kses_post( wpautop( $d['bio'] ) ); ?><?php else : ?><p class="nxa-muted"><?php esc_html_e( 'No information added yet.', 'nexus-lead-suite' ); ?></p><?php endif; ?>
				</section>
				<section id="nxa-tab-hours" role="tabpanel" class="nxa-tabpanel" data-nxa-panel="hours" hidden>
					<h3><?php esc_html_e( 'Working Hours', 'nexus-lead-suite' ); ?></h3>
					<?php if ( array() === $open_days ) : ?><p class="nxa-muted"><?php esc_html_e( 'No working hours published yet.', 'nexus-lead-suite' ); ?></p><?php else : ?>
					<table class="nxa-table nxa-profile-schedule"><thead><tr><th><?php esc_html_e( 'Week Day', 'nexus-lead-suite' ); ?></th><th><?php esc_html_e( 'Schedule', 'nexus-lead-suite' ); ?></th></tr></thead><tbody>
					<?php foreach ( $open_days as $row ) : ?>
						<tr><td><?php echo esc_html( $days[ (int) $row['weekday'] ] ); ?></td><td><?php echo esc_html( \nexulesuite_\Appointments\Availability::label12( $row['startTime'] ) . ' - ' . \nexulesuite_\Appointments\Availability::label12( $row['endTime'] ) ); ?></td></tr>
					<?php endforeach; ?>
					</tbody></table>
					<?php endif; ?>
				</section>
				<section id="nxa-tab-address" role="tabpanel" class="nxa-tabpanel" data-nxa-panel="address" hidden>
					<h3><?php esc_html_e( 'Address', 'nexus-lead-suite' ); ?></h3>
					<p><?php echo '' !== $d['address'] ? nl2br( esc_html( $d['address'] ) ) : '<span class="nxa-muted">' . esc_html__( 'No address added yet.', 'nexus-lead-suite' ) . '</span>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped above. ?></p>
				</section>
				<?php foreach ( array( 'education' => __( 'Education', 'nexus-lead-suite' ), 'experience' => __( 'Experience', 'nexus-lead-suite' ), 'qualification' => __( 'Qualification', 'nexus-lead-suite' ) ) as $key => $label ) : ?>
				<section id="nxa-tab-<?php echo esc_attr( $key ); ?>" role="tabpanel" class="nxa-tabpanel" data-nxa-panel="<?php echo esc_attr( $key ); ?>" hidden>
					<h3><?php echo esc_html( $label ); ?></h3>
					<?php if ( '' !== $d[ $key ] ) : ?><ul class="nxa-profile-list"><?php foreach ( preg_split( '/\r\n|\r|\n/', $d[ $key ] ) as $line ) : if ( '' === trim( $line ) ) { continue; } ?><li><?php echo esc_html( trim( $line ) ); ?></li><?php endforeach; ?></ul><?php else : ?><p class="nxa-muted"><?php esc_html_e( 'Nothing added yet.', 'nexus-lead-suite' ); ?></p><?php endif; ?>
				</section>
				<?php endforeach; ?>
				<section id="nxa-tab-appointment" role="tabpanel" class="nxa-tabpanel" data-nxa-panel="appointment" hidden>
					<h3><?php esc_html_e( 'Create Appointment', 'nexus-lead-suite' ); ?></h3>
					<div class="nxa-booking" data-nxa="booking" data-doctor-id="<?php echo (int) $d['id']; ?>" data-compact="1"><p class="nxa-muted"><?php esc_html_e( 'Loading…', 'nexus-lead-suite' ); ?></p></div>
					<noscript><a class="nxa-btn nxa-btn-primary" href="<?php echo esc_url( self::booking_url( (int) $d['id'] ) ); ?>"><?php esc_html_e( 'Book now', 'nexus-lead-suite' ); ?></a></noscript>
				</section>
			</div>
		</div>
		<?php
		return (string) ob_get_clean();
	}

	/**
	 * [nexulesuite_departments]
	 *
	 * @return string
	 */
	public function sc_departments(): string {
		$this->assets();
		$deps = Catalog_Store::all( 'departments', array( 'status' => 'active', 'withCounts' => true, 'perPage' => 200 ) )['items'];
		ob_start();
		?>
		<div class="nxa nxa-departments">
			<?php if ( array() === $deps ) : ?><div class="nxa-empty"><p><?php esc_html_e( 'No departments yet.', 'nexus-lead-suite' ); ?></p></div><?php else : ?>
			<div class="nxa-grid">
				<?php foreach ( $deps as $dep ) : ?>
					<a class="nxa-card nxa-dept-card" href="<?php echo esc_url( self::department_url( $dep['slug'] ) ); ?>">
						<span class="nxa-dept-icon" aria-hidden="true"><?php echo esc_html( self::initials( $dep['name'] ) ); ?></span>
						<h3><?php echo esc_html( $dep['name'] ); ?></h3>
						<?php if ( '' !== $dep['description'] ) : ?><p><?php echo esc_html( wp_trim_words( $dep['description'], 20 ) ); ?></p><?php endif; ?>
						<span class="nxa-muted"><?php echo esc_html( sprintf( /* translators: %d: doctors */ _n( '%d doctor', '%d doctors', (int) $dep['doctorCount'], 'nexus-lead-suite' ), (int) $dep['doctorCount'] ) ); ?></span>
					</a>
				<?php endforeach; ?>
			</div>
			<?php endif; ?>
		</div>
		<?php
		return (string) ob_get_clean();
	}

	/**
	 * [nexulesuite_department slug=""]
	 *
	 * @param array<string,mixed>|string $atts Attributes.
	 * @return string
	 */
	public function sc_department( $atts = array() ): string {
		$this->assets();
		$atts = shortcode_atts( array( 'slug' => '' ), (array) $atts, 'nexulesuite_department' );
		$slug = '' !== $atts['slug'] ? (string) $atts['slug'] : (string) get_query_var( self::QV_DEPARTMENT, '' );
		if ( '' === $slug && isset( $_GET[ self::QV_DEPARTMENT ] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			$slug = sanitize_title( wp_unslash( (string) $_GET[ self::QV_DEPARTMENT ] ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		}
		$dep = '' !== $slug ? Catalog_Store::get_by_slug( 'departments', $slug ) : null;
		if ( null === $dep || 'active' !== $dep['status'] ) {
			return '<div class="nxa nxa-empty"><p>' . esc_html__( 'This department is not available.', 'nexus-lead-suite' ) . '</p><a class="nxa-btn" href="' . esc_url( self::page_url( 'departments' ) ) . '">' . esc_html__( 'All departments', 'nexus-lead-suite' ) . '</a></div>';
		}
		$docs = Doctors_Store::all( array( 'publicOnly' => true, 'departmentId' => $dep['id'], 'perPage' => 100 ) )['items'];
		$all  = Catalog_Store::all( 'departments', array( 'status' => 'active', 'perPage' => 200 ) )['items'];
		ob_start();
		?>
		<div class="nxa nxa-department">
			<header class="nxa-dept-head"><h2><?php echo esc_html( $dep['name'] ); ?></h2><?php if ( '' !== $dep['description'] ) : ?><?php echo wp_kses_post( wpautop( esc_html( $dep['description'] ) ) ); ?><?php endif; ?></header>
			<div class="nxa-dept-layout">
				<div class="nxa-dept-main">
					<h3><?php esc_html_e( 'Department Doctor', 'nexus-lead-suite' ); ?></h3>
					<?php if ( array() === $docs ) : ?><div class="nxa-empty"><p><?php esc_html_e( 'No doctors in this department yet.', 'nexus-lead-suite' ); ?></p></div><?php else : ?>
					<div class="nxa-grid nxa-grid-2"><?php foreach ( $docs as $d ) { $this->doctor_card( $d ); } ?></div>
					<?php endif; ?>
				</div>
				<aside class="nxa-dept-side" aria-label="<?php esc_attr_e( 'Departments', 'nexus-lead-suite' ); ?>">
					<h3><?php esc_html_e( 'Departments', 'nexus-lead-suite' ); ?></h3>
					<ul class="nxa-dept-list">
						<?php foreach ( $all as $other ) : ?>
						<li><a class="<?php echo (int) $other['id'] === (int) $dep['id'] ? 'is-active' : ''; ?>" href="<?php echo esc_url( self::department_url( $other['slug'] ) ); ?>"<?php echo (int) $other['id'] === (int) $dep['id'] ? ' aria-current="page"' : ''; ?>><?php echo esc_html( $other['name'] ); ?></a></li>
						<?php endforeach; ?>
					</ul>
					<a class="nxa-btn nxa-btn-primary nxa-btn-block" href="<?php echo esc_url( add_query_arg( 'department', (int) $dep['id'], self::page_url( 'booking' ) ) ); ?>"><?php esc_html_e( 'Make an Appointment', 'nexus-lead-suite' ); ?></a>
				</aside>
			</div>
		</div>
		<?php
		return (string) ob_get_clean();
	}

	/* ------------------------------------------------------------------ */
	/* Shortcodes: JS mounts                                                */
	/* ------------------------------------------------------------------ */

	/**
	 * [nexulesuite_appointment] — the five-step booking flow.
	 *
	 * @return string
	 */
	public function sc_booking(): string {
		$this->assets();
		$doctor = isset( $_GET['doctor'] ) ? absint( $_GET['doctor'] ) : 0; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$dep    = isset( $_GET['department'] ) ? absint( $_GET['department'] ) : 0; // phpcs:ignore WordPress.Security.NonceVerification.Recommended

		return '<div class="nxa nxa-booking" data-nxa="booking" data-doctor-id="' . (int) $doctor . '" data-department-id="' . (int) $dep . '"><p class="nxa-muted">' . esc_html__( 'Loading…', 'nexus-lead-suite' ) . '</p><noscript>' . esc_html__( 'Enable JavaScript to book an appointment.', 'nexus-lead-suite' ) . '</noscript></div>';
	}

	/**
	 * [nexulesuite_auth] — login / register, patient or doctor (?type=doctor).
	 *
	 * @return string
	 */
	public function sc_auth(): string {
		$this->assets();
		// phpcs:disable WordPress.Security.NonceVerification.Recommended -- display state only.
		$type     = isset( $_GET['type'] ) && 'doctor' === $_GET['type'] ? 'doctor' : 'patient';
		$verified = isset( $_GET['verified'] ) ? ( '1' === $_GET['verified'] ? 'ok' : 'fail' ) : '';
		$redirect = isset( $_GET['redirect_to'] ) ? wp_validate_redirect( esc_url_raw( wp_unslash( (string) $_GET['redirect_to'] ) ), '' ) : ''; // same-site targets only (open-redirect guard).
		// phpcs:enable
		if ( is_user_logged_in() ) {
			$uid = get_current_user_id();
			$to  = Roles::is_doctor( $uid ) ? self::page_url( 'doctor_panel' ) : ( Roles::is_patient( $uid ) ? self::page_url( 'patient_panel' ) : admin_url() );

			return '<div class="nxa nxa-card nxa-logged-in"><p>' . esc_html__( 'You are already logged in.', 'nexus-lead-suite' ) . '</p><p><a class="nxa-btn nxa-btn-primary" href="' . esc_url( $to ) . '">' . esc_html__( 'Go to my account', 'nexus-lead-suite' ) . '</a> <a class="nxa-btn" href="' . esc_url( wp_logout_url( self::page_url( 'auth' ) ) ) . '">' . esc_html__( 'Log out', 'nexus-lead-suite' ) . '</a></p></div>';
		}

		$mode = isset( $_GET['mode'] ) && 'register' === $_GET['mode'] ? 'register' : 'login'; // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- display state only.

		return '<div class="nxa nxa-auth" data-nxa="auth" data-type="' . esc_attr( $type ) . '" data-mode="' . esc_attr( $mode ) . '" data-verified="' . esc_attr( $verified ) . '" data-redirect="' . esc_attr( $redirect ) . '"><p class="nxa-muted">' . esc_html__( 'Loading…', 'nexus-lead-suite' ) . '</p></div>';
	}

	/**
	 * [nexulesuite_patient_panel]
	 *
	 * @return string
	 */
	public function sc_patient_panel(): string {
		$this->assets();

		return $this->panel_mount( 'patient' );
	}

	/**
	 * [nexulesuite_doctor_panel]
	 *
	 * @return string
	 */
	public function sc_doctor_panel(): string {
		$this->assets();

		return $this->panel_mount( 'doctor' );
	}

	/**
	 * Role gate + mount point.
	 *
	 * @param string $role patient | doctor.
	 * @return string
	 */
	private function panel_mount( string $role ): string {
		$uid = get_current_user_id();
		if ( $uid <= 0 ) {
			$login = add_query_arg( array( 'type' => $role, 'redirect_to' => rawurlencode( self::page_url( 'doctor' === $role ? 'doctor_panel' : 'patient_panel' ) ) ), self::page_url( 'auth' ) );

			return '<div class="nxa nxa-card nxa-gate"><p>' . esc_html__( 'Please log in to continue.', 'nexus-lead-suite' ) . '</p><a class="nxa-btn nxa-btn-primary" href="' . esc_url( $login ) . '">' . esc_html__( 'Log in', 'nexus-lead-suite' ) . '</a></div>';
		}
		$ok = 'doctor' === $role ? Roles::is_doctor( $uid ) : Roles::is_patient( $uid );
		if ( ! $ok ) {
			$msg = 'doctor' === $role ? __( 'This area is for doctors.', 'nexus-lead-suite' ) : __( 'This area is for patients.', 'nexus-lead-suite' );

			return '<div class="nxa nxa-card nxa-gate"><p>' . esc_html( $msg ) . '</p><a class="nxa-btn" href="' . esc_url( wp_logout_url( self::page_url( 'auth' ) ) ) . '">' . esc_html__( 'Log out', 'nexus-lead-suite' ) . '</a></div>';
		}

		return '<div class="nxa nxa-panel" data-nxa="panel" data-role="' . esc_attr( $role ) . '"><p class="nxa-muted">' . esc_html__( 'Loading…', 'nexus-lead-suite' ) . '</p></div>';
	}

	/* ------------------------------------------------------------------ */
	/* Request handlers                                                     */
	/* ------------------------------------------------------------------ */

	/**
	 * `/?nexulesuite_verify=TOKEN&uid=ID`
	 *
	 * @return void
	 */
	public function maybe_verify_email(): void {
		// phpcs:disable WordPress.Security.NonceVerification.Recommended -- the token itself is the secret.
		if ( ! isset( $_GET['nexulesuite_verify'], $_GET['uid'] ) ) {
			return;
		}
		$token = sanitize_text_field( wp_unslash( (string) $_GET['nexulesuite_verify'] ) );
		$uid   = absint( $_GET['uid'] );
		// phpcs:enable
		$ok = Patients_Store::verify( $uid, $token );
		wp_safe_redirect( add_query_arg( 'verified', $ok ? '1' : '0', self::page_url( 'auth' ) ) );
		exit;
	}

	/**
	 * `/?nexulesuite_prescription=ID&_wpnonce=…` — printable prescription for admin / owning doctor / owning patient.
	 *
	 * @return void
	 */
	public function maybe_print_prescription(): void {
		if ( ! isset( $_GET[ self::QV_PRINT ] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- verified below.
			return;
		}
		$id    = absint( $_GET[ self::QV_PRINT ] ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$nonce = isset( $_GET['_wpnonce'] ) ? sanitize_text_field( wp_unslash( (string) $_GET['_wpnonce'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		if ( ! is_user_logged_in() ) {
			// Send the visitor back to the very URL they opened: its nonce belongs to their own session, a freshly minted one would not.
			$back = isset( $_SERVER['REQUEST_URI'] ) ? home_url( wp_unslash( (string) $_SERVER['REQUEST_URI'] ) ) : self::print_url( $id ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- passed through esc_url_raw below.
			wp_safe_redirect( add_query_arg( 'redirect_to', rawurlencode( esc_url_raw( $back ) ), self::page_url( 'auth' ) ) );
			exit;
		}
		if ( ! wp_verify_nonce( $nonce, 'nexulesuite_print_' . $id ) ) {
			wp_die( esc_html__( 'This print link has expired. Open the appointment again and click Print.', 'nexus-lead-suite' ), '', array( 'response' => 403 ) );
		}
		require_once nexulesuite_PLUGIN_DIR . 'api/class-appointments-api.php';
		if ( ! \nexulesuite_\Api\Appointments_Api::user_can_view_prescription( get_current_user_id(), $id ) ) {
			wp_die( esc_html__( 'Prescription not found.', 'nexus-lead-suite' ), '', array( 'response' => 404 ) );
		}
		$bundle = Treatments_Store::prescription_bundle( $id );
		if ( null === $bundle ) {
			wp_die( esc_html__( 'Prescription not found.', 'nexus-lead-suite' ), '', array( 'response' => 404 ) );
		}
		nocache_headers();
		status_header( 200 );
		header( 'Content-Type: text/html; charset=utf-8' );
		echo self::render_prescription( $bundle ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped inside.
		exit;
	}

	/**
	 * Standalone printable document.
	 *
	 * @param array<string,mixed> $b Bundle from Treatments_Store::prescription_bundle().
	 * @return string
	 */
	public static function render_prescription( array $b ): string {
		$a  = $b['appointment'];
		$t  = $b['treatment'];
		$d  = $b['doctor'] ?? array();
		$p  = $b['patient'] ?? array();
		$site = wp_specialchars_decode( (string) get_bloginfo( 'name' ), ENT_QUOTES );
		ob_start();
		?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title><?php echo esc_html( sprintf( /* translators: %s: appointment code */ __( 'Prescription %s', 'nexus-lead-suite' ), $a['code'] ) ); ?></title>
<style>
body{font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;color:#111;margin:0;background:#f3f4f6}
.sheet{max-width:800px;margin:24px auto;background:#fff;padding:40px;box-shadow:0 1px 4px rgba(0,0,0,.1)}
header{display:flex;justify-content:space-between;gap:24px;border-bottom:2px solid #111;padding-bottom:16px;margin-bottom:24px}
h1{font-size:22px;margin:0 0 4px}h2{font-size:15px;margin:24px 0 8px;text-transform:uppercase;letter-spacing:.04em}
.meta{display:grid;grid-template-columns:1fr 1fr;gap:12px 24px;margin:0;padding:0;list-style:none}.meta li span{display:block;font-size:12px;color:#555;text-transform:uppercase}
table{width:100%;border-collapse:collapse;margin-top:8px}th,td{text-align:left;padding:8px 10px;border-bottom:1px solid #ddd;vertical-align:top}th{background:#f3f4f6;font-size:12px;text-transform:uppercase}
.notes{white-space:pre-wrap}.sign{margin-top:48px;display:flex;justify-content:flex-end}.sign div{border-top:1px solid #111;padding-top:6px;min-width:220px;text-align:center}
.toolbar{max-width:800px;margin:16px auto 0;display:flex;gap:8px;justify-content:flex-end}.toolbar button,.toolbar a{font:inherit;padding:8px 14px;border:1px solid #111;background:#111;color:#fff;border-radius:6px;cursor:pointer;text-decoration:none}.toolbar a{background:#fff;color:#111}
@media print{body{background:#fff}.sheet{box-shadow:none;margin:0;max-width:none}.toolbar{display:none}}
</style>
</head>
<body>
<div class="toolbar"><a href="javascript:history.back()"><?php esc_html_e( 'Back', 'nexus-lead-suite' ); ?></a><button type="button" onclick="window.print()"><?php esc_html_e( 'Print', 'nexus-lead-suite' ); ?></button></div>
<div class="sheet">
<header>
	<div><h1><?php echo esc_html( $site ); ?></h1><div><?php echo esc_html( $d['departmentName'] ?? '' ); ?></div><div><?php echo esc_html( $d['address'] ?? '' ); ?></div></div>
	<div style="text-align:right"><strong><?php esc_html_e( 'Prescription', 'nexus-lead-suite' ); ?></strong><div><?php echo esc_html( $a['code'] ); ?></div><div><?php echo esc_html( $a['date'] . ' ' . $a['startTime'] ); ?></div></div>
</header>
<ul class="meta">
	<li><span><?php esc_html_e( 'Doctor', 'nexus-lead-suite' ); ?></span><?php echo esc_html( $d['name'] ?? $a['doctorName'] ); ?></li>
	<li><span><?php esc_html_e( 'Patient', 'nexus-lead-suite' ); ?></span><?php echo esc_html( $p['name'] ?? $a['patientName'] ); ?></li>
	<li><span><?php esc_html_e( 'Department', 'nexus-lead-suite' ); ?></span><?php echo esc_html( $d['departmentName'] ?? $a['departmentName'] ); ?></li>
	<li><span><?php esc_html_e( 'Contact', 'nexus-lead-suite' ); ?></span><?php echo esc_html( trim( ( $p['phone'] ?? '' ) . ' ' . ( $p['email'] ?? '' ) ) ); ?></li>
</ul>
<?php if ( '' !== $t['notes'] ) : ?><h2><?php esc_html_e( 'Treatment notes', 'nexus-lead-suite' ); ?></h2><p class="notes"><?php echo esc_html( $t['notes'] ); ?></p><?php endif; ?>
<?php if ( array() !== $t['items'] ) : ?>
<h2>℞ <?php esc_html_e( 'Medicines', 'nexus-lead-suite' ); ?></h2>
<table><thead><tr><th>#</th><th><?php esc_html_e( 'Medicine', 'nexus-lead-suite' ); ?></th><th><?php esc_html_e( 'Dosage', 'nexus-lead-suite' ); ?></th><th><?php esc_html_e( 'Duration', 'nexus-lead-suite' ); ?></th><th><?php esc_html_e( 'Instruction', 'nexus-lead-suite' ); ?></th></tr></thead><tbody>
<?php foreach ( $t['items'] as $i => $it ) : ?>
<tr><td><?php echo (int) $i + 1; ?></td><td><?php echo esc_html( $it['medicineName'] ); ?></td><td><?php echo esc_html( $it['dosage'] ); ?></td><td><?php echo esc_html( $it['duration'] ); ?></td><td><?php echo esc_html( $it['instruction'] ); ?></td></tr>
<?php endforeach; ?>
</tbody></table>
<?php endif; ?>
<?php if ( '' !== $t['advice'] ) : ?><h2><?php esc_html_e( 'Advice', 'nexus-lead-suite' ); ?></h2><p class="notes"><?php echo esc_html( $t['advice'] ); ?></p><?php endif; ?>
<?php if ( '' !== $t['followUpDate'] ) : ?><p><strong><?php esc_html_e( 'Follow-up', 'nexus-lead-suite' ); ?>:</strong> <?php echo esc_html( $t['followUpDate'] ); ?></p><?php endif; ?>
<div class="sign"><div><?php echo esc_html( $d['name'] ?? $a['doctorName'] ); ?><br><small><?php esc_html_e( 'Signature', 'nexus-lead-suite' ); ?></small></div></div>
</div>
</body>
</html>
		<?php
		return (string) ob_get_clean();
	}
}
