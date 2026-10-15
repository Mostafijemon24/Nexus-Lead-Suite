<?php
/**
 * Frontend shortcodes renderer for Nexus Lead Suite forms.
 *
 * @package nexulesuite_
 */

declare(strict_types=1);

namespace nexulesuite_\Frontend;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers and renders form shortcodes.
 *
 * The plugin skips loading this class on typical wp-admin HTML requests (see `nexulesuite_load_shortcodes_module` filter).
 */
final class Shortcodes {

	/**
	 * Allow-list used to escape HTML produced by nested shortcodes (forms, captcha,
	 * chat panels) at the point of output.
	 *
	 * Starts from wp_kses_allowed_html( 'post' ) and adds the form controls plus the
	 * data-/aria- hooks the front-end scripts rely on. Script and style elements are
	 * deliberately absent: assets are enqueued, never inlined through this path.
	 *
	 * @return array<string, array<string, bool>>
	 */
	public static function allowed_embed_html(): array {
		static $allowed = null;
		if ( null !== $allowed ) {
			return $allowed;
		}

		$allowed = wp_kses_allowed_html( 'post' );

		$common = array(
			'id'       => true,
			'class'    => true,
			'style'    => true,
			'title'    => true,
			'role'     => true,
			'hidden'   => true,
			'tabindex' => true,
			'data-*'   => true,
			'aria-*'   => true,
		);

		$controls = array(
			'form'     => array( 'action' => true, 'method' => true, 'enctype' => true, 'novalidate' => true, 'target' => true, 'name' => true, 'autocomplete' => true ),
			'input'    => array( 'type' => true, 'name' => true, 'value' => true, 'placeholder' => true, 'checked' => true, 'disabled' => true, 'readonly' => true, 'required' => true, 'min' => true, 'max' => true, 'step' => true, 'pattern' => true, 'maxlength' => true, 'minlength' => true, 'accept' => true, 'multiple' => true, 'autocomplete' => true, 'size' => true ),
			'textarea' => array( 'name' => true, 'rows' => true, 'cols' => true, 'placeholder' => true, 'disabled' => true, 'readonly' => true, 'required' => true, 'maxlength' => true, 'autocomplete' => true ),
			'select'   => array( 'name' => true, 'multiple' => true, 'disabled' => true, 'required' => true, 'size' => true, 'autocomplete' => true ),
			'option'   => array( 'value' => true, 'selected' => true, 'disabled' => true, 'label' => true ),
			'optgroup' => array( 'label' => true, 'disabled' => true ),
			'button'   => array( 'type' => true, 'name' => true, 'value' => true, 'disabled' => true ),
			'label'    => array( 'for' => true ),
			'fieldset' => array( 'disabled' => true, 'name' => true ),
			'legend'   => array(),
			'datalist' => array(),
			'progress' => array( 'value' => true, 'max' => true ),
			'template' => array(),
			'noscript' => array(),
			'svg'      => array( 'xmlns' => true, 'viewbox' => true, 'viewBox' => true, 'width' => true, 'height' => true, 'fill' => true, 'stroke' => true, 'stroke-width' => true, 'stroke-linecap' => true, 'stroke-linejoin' => true, 'focusable' => true ),
			'g'        => array( 'fill' => true, 'stroke' => true, 'transform' => true ),
			'path'     => array( 'd' => true, 'fill' => true, 'stroke' => true, 'stroke-width' => true, 'stroke-linecap' => true, 'stroke-linejoin' => true, 'fill-rule' => true, 'clip-rule' => true, 'opacity' => true ),
			'circle'   => array( 'cx' => true, 'cy' => true, 'r' => true, 'fill' => true, 'stroke' => true, 'stroke-width' => true ),
			'rect'     => array( 'x' => true, 'y' => true, 'width' => true, 'height' => true, 'rx' => true, 'ry' => true, 'fill' => true, 'stroke' => true ),
			'line'     => array( 'x1' => true, 'y1' => true, 'x2' => true, 'y2' => true, 'stroke' => true, 'stroke-width' => true, 'stroke-linecap' => true ),
			'polyline' => array( 'points' => true, 'fill' => true, 'stroke' => true, 'stroke-width' => true ),
			'polygon'  => array( 'points' => true, 'fill' => true, 'stroke' => true ),
			'iframe'   => array( 'src' => true, 'width' => true, 'height' => true, 'frameborder' => true, 'allow' => true, 'sandbox' => true, 'loading' => true, 'referrerpolicy' => true, 'name' => true, 'scrolling' => true, 'allowfullscreen' => true ),
		);

		foreach ( $controls as $tag => $attrs ) {
			$allowed[ $tag ] = array_merge( isset( $allowed[ $tag ] ) ? $allowed[ $tag ] : array(), $attrs );
		}

		foreach ( array_keys( $allowed ) as $tag ) {
			$allowed[ $tag ] = array_merge( $allowed[ $tag ], $common );
		}

		return $allowed;
	}


	/**
	 * Forms option key.
	 */
	private const FORMS_OPTION_KEY = 'nexulesuite_forms_builder_v0';

	/**
	 * General settings option key.
	 */
	private const GENERAL_SETTINGS_OPTION_KEY = 'nexulesuite_general_settings_v1';

	/**
	 * Anti-spam honeypot: text field hidden from users; bots often fill it.
	 * Name is stable for server check and JS draft exclusion.
	 */
	private const HONEYPOT_FIELD_NAME = 'nexulesuite_hp_website';

	/**
	 * Saved keys (same option names as REST API).
	 */
	private const RECAPTCHA_OPTION_KEY = 'nexulesuite_recaptcha_keys_v0';

	/**
	 * reCAPTCHA v3 action name (must match JS execute() and siteverify response).
	 */
	private const RECAPTCHA_V3_ACTION = 'nexulesuite_form_submit';

	private const TURNSTILE_OPTION_KEY = 'nexulesuite_turnstile_keys_v0';

	/**
	 * Whether current request rendered a form.
	 *
	 * @var bool
	 */
	private static $did_render = false;

	/**
	 * Query flag that serves the chat as a standalone framed document.
	 */
	private const CHAT_EMBED_QUERY_VAR = 'nexulesuite_chat_embed';

	/**
	 * Set by `[nexulesuite_chat]` when an inline chat is on the page, so the floating
	 * wp_footer widget stands down and the visitor does not get two chats at once.
	 *
	 * @var bool
	 */
	private static $suppress_floating_livechat = false;

	/**
	 * Whether an inline `[nexulesuite_chat]` already rendered on this request.
	 *
	 * @var bool
	 */
	private static $inline_chat_rendered = false;

	/**
	 * Forminator UI design keys queued for asset loading (per HTTP request).
	 *
	 * @var array<int, string>
	 */
	private static $forminator_design_queue = array();

	/**
	 * Whether any rendered/queued form on this response is multi-step.
	 *
	 * @var bool
	 */
	private static $forminator_multi_on_page = false;

	/**
	 * Menu items option key.
	 */
	private const MENU_ITEMS_OPTION_KEY = 'nexulesuite_menu_items_v1';

	/**
	 * Popups option key.
	 */
	private const POPUPS_OPTION_KEY = 'nexulesuite_popups_v1';

	/**
	 * Saved email templates (same key as REST / Emails admin).
	 */
	private const EMAIL_TEMPLATES_OPTION_KEY = 'nexulesuite_email_templates_v1';

	/**
	 * Hooks.
	 *
	 * @return void
	 */
	public function register_hooks(): void {
		// Register shortcodes immediately (safe to call at any point after plugins_loaded).
		$this->register_shortcodes();
		// Serves the standalone chat document that `[nexulesuite_chat]` frames. Before the theme takes over.
		add_action( 'template_redirect', array( $this, 'maybe_serve_chat_embed' ), 5 );
		add_action( 'wp', array( $this, 'scan_singular_for_form_shortcode' ), 4 );
		add_action( 'wp', array( $this, 'pre_check_popup_shortcodes' ), 1 );
		/*
		 * Early pass: expand popup shortcodes (output discarded) so Contact Form 7, WPForms, etc.
		 * can enqueue front-end assets. Those plugins usually only look at post content, not our option.
		 */
		add_action( 'wp_enqueue_scripts', array( $this, 'prime_popup_embedded_shortcodes' ), 5 );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_assets' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_global_font' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_bottom_nav_styles' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_popup_styles' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_activity_tracker' ), 30 );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_visual_editor' ), 99 );
		// After theme/page-builder scripts register handles (Divi, etc.), so patch runner can load late in footer.
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_visual_editor_dom_patches' ), 999 );
		/*
		 * Before wp_print_footer_scripts (priority ~20) so third-party form shortcodes
		 * (Contact Form 7, WPForms, etc.) can enqueue scripts/styles when expanded.
		 */
		add_action( 'wp_footer', array( $this, 'render_popups' ), 12 );
		/*
		 * After popups (inline popup targets) but before wp_print_footer_scripts (~20)
		 * so nexulesuite_livechat-widget inline CSS/JS are actually printed.
		 */
		add_action( 'wp_footer', array( $this, 'render_livechat_widget' ), 15 );
		add_action( 'wp_footer', array( $this, 'render_bottom_nav' ), 20 );
		// AJAX: notification email trigger (both logged-in and guest visitors).
		add_action( 'wp_ajax_nexulesuite_trigger_notify', array( $this, 'handle_trigger_notify' ) );
		add_action( 'wp_ajax_nopriv_nexulesuite_trigger_notify', array( $this, 'handle_trigger_notify' ) );
		// AJAX: Nexus form builder submissions (guest + logged-in).
		add_action( 'wp_ajax_nexulesuite_submit_form', array( $this, 'handle_form_submit_ajax' ) );
		add_action( 'wp_ajax_nopriv_nexulesuite_submit_form', array( $this, 'handle_form_submit_ajax' ) );
	}

	/**
	 * Enqueues the Visual Editor overlay (admin-only, opt-in via query string).
	 *
	 * Lightweight rule: only load when the admin Visual Editor toggle cookie is set and user can manage options.
	 *
	 * @return void
	 */
	public function enqueue_visual_editor(): void {
		if ( is_admin() || wp_doing_ajax() || wp_doing_cron() ) {
			return;
		}

		if ( ! is_user_logged_in() || ! current_user_can( 'manage_options' ) ) {
			return;
		}

		// Opt-in cookie set from the admin Visual Editor toggle.
		$cookie = isset( $_COOKIE['nexulesuite_ve'] ) ? sanitize_text_field( wp_unslash( (string) $_COOKIE['nexulesuite_ve'] ) ) : '';
		if ( '1' !== $cookie ) {
			return;
		}

		// Visual Editor must target the singular post/page that owns the main editor content.
		// get_queried_object_id() on archives returns a term/user ID, not a post — saves would fail.
		if ( ! is_singular() ) {
			return;
		}

		global $post;
		$post_id = ( isset( $post->ID ) && (int) $post->ID > 0 ) ? (int) $post->ID : (int) get_queried_object_id();
		if ( $post_id <= 0 ) {
			return;
		}

		$path = nexulesuite_PLUGIN_DIR . 'public/js/nexus-ls-visual-editor.js';
		$ver  = file_exists( $path ) ? (string) filemtime( $path ) : nexulesuite_VERSION;

		wp_enqueue_script(
			'nexulesuite_visual-editor',
			esc_url( nexulesuite_PLUGIN_URL . 'public/js/nexus-ls-visual-editor.js' ),
			array( 'wp-element' ),
			$ver,
			true
		);

		require_once nexulesuite_PLUGIN_DIR . 'core/class-global-font.php';
		\nexulesuite_\Core\Global_Font::enqueue( 'nexulesuite_global-font' );

		wp_localize_script(
			'nexulesuite_visual-editor',
			'nexulesuite_VeCfg',
			array(
				'restUrl'  => esc_url_raw( rest_url() ),
				'nonce'    => wp_create_nonce( 'wp_rest' ),
				'postId'   => $post_id,
				'endpoint' => esc_url_raw( rest_url( 'nexulesuite_/v1/visual-editor/update' ) ),
				'activityButtonClasses' => (string) ( ( get_option( self::GENERAL_SETTINGS_OPTION_KEY, array() )['activityButtonClasses'] ?? '' ) ),
				'globalFont' => \nexulesuite_\Core\Global_Font::get_saved_font(),
			)
		);
	}

	/**
	 * Applies Visual Editor DOM patches stored in post meta (elements outside post_content).
	 *
	 * @return void
	 */
	public function enqueue_visual_editor_dom_patches(): void {
		if ( is_admin() || wp_doing_ajax() || wp_doing_cron() ) {
			return;
		}

		if ( ! is_singular() ) {
			return;
		}

		global $post;
		$post_id = ( isset( $post->ID ) && (int) $post->ID > 0 ) ? (int) $post->ID : (int) get_queried_object_id();
		if ( $post_id <= 0 ) {
			return;
		}

		$patches = get_post_meta( $post_id, '_nexulesuite_ve_dom_patches', true );
		if ( ! is_array( $patches ) || array() === $patches ) {
			return;
		}

		$list = array_values( $patches );
		$path = nexulesuite_PLUGIN_DIR . 'public/js/nexus-ls-ve-apply-patches.js';
		$ver  = file_exists( $path ) ? (string) filemtime( $path ) : nexulesuite_VERSION;

		$bridge_path = nexulesuite_PLUGIN_DIR . 'public/js/nexus-ls-popup-bridge.js';
		$deps        = file_exists( $bridge_path ) ? array( 'nexulesuite_popup-bridge' ) : array();

		wp_enqueue_script(
			'nexulesuite_ve-apply-patches',
			esc_url( nexulesuite_PLUGIN_URL . 'public/js/nexus-ls-ve-apply-patches.js' ),
			$deps,
			$ver,
			true
		);

		wp_localize_script(
			'nexulesuite_ve-apply-patches',
			'nexulesuite_VePatches',
			$list
		);
	}

	/**
	 * AJAX handler: sends a notification email when a comma-trigger fires on the frontend.
	 * Trigger format: data-nexulesuite_trigger="popup-event-id, notify-label"
	 * The "notify-label" (second value after the comma) is used as the email subject tag.
	 *
	 * @return void
	 */
	public function handle_trigger_notify(): void {
		// Verify nonce sent from frontend.
		if ( ! check_ajax_referer( 'nexulesuite_trigger_notify', 'nonce', false ) ) {
			wp_send_json_error( array( 'message' => 'Invalid nonce.' ), 403 );
			return;
		}

		$trigger_id   = sanitize_text_field( wp_unslash( $_POST['trigger_id'] ?? '' ) );
		$notify_label = sanitize_text_field( wp_unslash( $_POST['notify_label'] ?? '' ) );
		$click_label  = sanitize_text_field( wp_unslash( $_POST['label'] ?? '' ) );
		$page_url     = esc_url_raw( wp_unslash( $_POST['page_url'] ?? '' ) );

		try {
			require_once nexulesuite_PLUGIN_DIR . 'core/class-activities-store.php';
			\nexulesuite_\Core\Activities_Store::record_and_notify(
				'trigger_notify',
				$trigger_id,
				$page_url,
				array(
					'notify_label' => $notify_label,
					'label'        => $click_label,
				),
				''
			);
		} catch ( \Throwable $e ) {
			// Never block or surface errors to visitors.
		}

		wp_send_json_success( array( 'message' => __( 'Notification sent.', 'nexus-lead-suite' ) ) );
	}

	/**
	 * AJAX handler for `[nexulesuite_form]` submissions from the frontend.
	 *
	 * @return void
	 */
	public function handle_form_submit_ajax(): void {
		if ( ! check_ajax_referer( 'nexulesuite_form_submit', 'nexulesuite_form_nonce', false ) ) {
			wp_send_json_error( array( 'message' => __( 'Invalid session. Please reload the page.', 'nexus-lead-suite' ) ), 403 );
			return;
		}

		$hp_val = isset( $_POST[ self::HONEYPOT_FIELD_NAME ] )
			? sanitize_text_field( wp_unslash( (string) $_POST[ self::HONEYPOT_FIELD_NAME ] ) )
			: '';
		if ( '' !== trim( $hp_val ) ) {
			wp_send_json_error( array( 'message' => __( 'Something went wrong. Please try again.', 'nexus-lead-suite' ) ), 400 );
			return;
		}

		if ( ! empty( $_FILES ) ) {
			foreach ( array_keys( $_FILES ) as $fk ) {
				if ( ! empty( $_FILES[ $fk ]['name'] ) ) {
					wp_send_json_error( array( 'message' => __( 'File uploads are not supported here yet.', 'nexus-lead-suite' ) ) );
					return;
				}
			}
		}

		$form_id = isset( $_POST['nexulesuite_form_id'] ) ? sanitize_text_field( wp_unslash( (string) $_POST['nexulesuite_form_id'] ) ) : '';
		if ( '' === $form_id ) {
			wp_send_json_error( array( 'message' => __( 'Missing form.', 'nexus-lead-suite' ) ) );
			return;
		}

		$form = $this->get_form_by_id( $form_id );
		if ( ! is_array( $form ) ) {
			wp_send_json_error( array( 'message' => __( 'Form not found.', 'nexus-lead-suite' ) ) );
			return;
		}

		if ( ! $this->is_form_published_for_frontend( $form ) ) {
			wp_send_json_error( array( 'message' => __( 'This form is not available.', 'nexus-lead-suite' ) ), 403 );
			return;
		}

		if ( ! $this->verify_form_captcha_tokens( $form ) ) {
			return;
		}

		$display_rows = $this->collect_form_submission_display_rows( $form );
		$field_values = $this->collect_form_values_by_field_id( $form );
		$confirmation = $this->resolve_form_confirmation( $form, $field_values );
		$lines        = array();
		foreach ( $display_rows as $r ) {
			$lines[] = $r['label'] . ': ' . $r['value'];
		}
		$form_name  = isset( $form['name'] ) ? sanitize_text_field( (string) $form['name'] ) : $form_id;
		$site_name  = get_bloginfo( 'name' );
		$subject    = sprintf( '[%s] %s', $site_name, $form_name );
		$page_url   = esc_url_raw( wp_unslash( (string) ( $_POST['_nexulesuite_page_url'] ?? '' ) ) );
		$body       = $this->build_form_submission_notice_html(
			(string) $site_name,
			$form_name,
			$form_id,
			$display_rows,
			(string) current_time( 'mysql' ),
			$page_url
		);

		$recipients = $this->parse_notification_emails( isset( $form['notificationEmail'] ) ? (string) $form['notificationEmail'] : '' );
		// Conditional email routing: fan out to extra recipients when a rule set matches.
		foreach ( ( isset( $form['emailRoutes'] ) && is_array( $form['emailRoutes'] ) ? $form['emailRoutes'] : array() ) as $route ) {
			if ( ! is_array( $route ) || ! $this->eval_conditional_set( isset( $route['conditional'] ) ? $route['conditional'] : array(), $field_values ) ) {
				continue;
			}
			foreach ( $this->parse_notification_emails( isset( $route['recipient'] ) ? (string) $route['recipient'] : '' ) as $rc ) {
				if ( ! in_array( $rc, $recipients, true ) ) {
					$recipients[] = $rc;
				}
			}
		}
		if ( empty( $recipients ) ) {
			$admin = (string) get_option( 'admin_email' );
			if ( $admin && is_email( $admin ) ) {
				$recipients[] = $admin;
			}
		}
		if ( empty( $recipients ) ) {
			wp_send_json_error( array( 'message' => __( 'No recipient email configured.', 'nexus-lead-suite' ) ) );
			return;
		}

		$reply = $this->guess_reply_to_email_from_post();

		$headers = array(
			'MIME-Version: 1.0',
			'Content-Type: text/html; charset=UTF-8',
		);
		if ( $reply ) {
			$headers[] = 'Reply-To: ' . $reply;
		}

		$popup_ev = '';
		if ( isset( $_POST['nexulesuite_form_context'] ) ) {
			$ctx_raw = sanitize_text_field( wp_unslash( (string) $_POST['nexulesuite_form_context'] ) );
			if ( preg_match( '/^popup:(.+)$/u', $ctx_raw, $mm ) ) {
				$popup_ev = sanitize_text_field( trim( $mm[1] ) );
				if ( strlen( $popup_ev ) > 120 ) {
					$popup_ev = substr( $popup_ev, 0, 120 );
				}
			}
		}

		$entry_fields = array();
		foreach ( $display_rows as $r ) {
			$entry_fields[ $r['label'] ] = $r['value'];
		}

		$payload_base = array(
			'event'                              => 'nexulesuite_ls.form_submission',
			'site'                               => array(
				'name' => $site_name,
				'url'  => home_url( '/' ),
			),
			'form'                               => array(
				'id'   => $form_id,
				'name' => $form_name,
			),
			'submitted_at_gmt'                   => current_time( 'mysql', true ),
			'page_url'                           => $page_url,
			'popup_event'                        => $popup_ev,
			\nexulesuite_\Core\Form_Submissions_Store::PAYLOAD_ENTRY_KEY => $entry_fields,
			'retention_days'                     => \nexulesuite_\Core\Form_Submissions_Store::retention_days(),
		);

		$sent = false;
		try {
			$sent = (bool) wp_mail( $recipients, $subject, $body, $headers );
		} catch ( \Throwable $e ) {
			$sent = false;
		}

		$db_payload = array_merge(
			$payload_base,
			array( 'mail_sent' => $sent )
		);
		try {
			require_once nexulesuite_PLUGIN_DIR . 'core/class-form-submissions-store.php';
			\nexulesuite_\Core\Form_Submissions_Store::insert( $form_id, $db_payload );
		} catch ( \Throwable $e ) {
			// Submission store must not block email UX.
		}

		$webhook_urls = $this->collect_submission_webhook_urls( $form );
		if ( ! empty( $webhook_urls ) ) {
			$hook_body = apply_filters( 'nexulesuite_form_webhook_payload', $db_payload, $form_id, $form );
			if ( is_array( $hook_body ) ) {
				$hook_body = $this->sanitize_webhook_payload( $hook_body );
				add_action(
					'shutdown',
					static function () use ( $webhook_urls, $hook_body ): void {
						\nexulesuite_\Core\Form_Submissions_Store::dispatch_webhooks( $webhook_urls, $hook_body );
					},
					9999
				);
			}
		}

		try {
			require_once nexulesuite_PLUGIN_DIR . 'core/class-activities-store.php';
			\nexulesuite_\Core\Activities_Store::record_form_submission(
				$form_id,
				$form_name,
				$page_url,
				$lines,
				$sent,
				$popup_ev
			);
		} catch ( \Throwable $e ) {
			// Activity log must not break submissions or visitor-facing responses.
		}

		if ( $sent ) {
			$conf_type = isset( $confirmation['type'] ) ? (string) $confirmation['type'] : 'message';
			$conf_url  = isset( $confirmation['redirectUrl'] ) ? esc_url_raw( (string) $confirmation['redirectUrl'] ) : '';
			if ( 'redirect' === $conf_type && '' !== $conf_url ) {
				wp_send_json_success( array(
					'redirect' => $conf_url,
					'message'  => __( 'Thank you! Redirecting…', 'nexus-lead-suite' ),
				) );
				return;
			}
			$conf_msg = isset( $confirmation['message'] ) ? trim( (string) $confirmation['message'] ) : '';
			$default_success = __(
				"Thanks for reaching out! We've received your request and are reviewing your details. We will follow up soon to confirm your insurance and finalize your appointment.\n\nNeed help right away? Please call us during our office hours. For all medical emergencies, please call 911 immediately.",
				'nexus-lead-suite'
			);
			wp_send_json_success( array(
				'message' => '' !== $conf_msg ? wp_kses_post( $conf_msg ) : $default_success,
				'html'    => '' !== $conf_msg,
			) );
			return;
		}

		wp_send_json_error(
			array(
				'message' => __( 'Please set up your SMTP properly.', 'nexus-lead-suite' ),
			)
		);
	}

	/**
	 * Builds a map of builder-field-id => submitted value (flattened + sanitized) for conditional rules.
	 *
	 * @param array<string,mixed> $form Form definition.
	 * @return array<string,string>
	 */
	private function collect_form_values_by_field_id( array $form ): array {
		$out   = array();
		$steps = isset( $form['steps'] ) && is_array( $form['steps'] ) ? $form['steps'] : array();
		foreach ( $steps as $step ) {
			$blocks = ( is_array( $step ) && isset( $step['fields'] ) && is_array( $step['fields'] ) ) ? $step['fields'] : array();
			$this->walk_blocks_for_field_values( $blocks, $out );
		}
		return $out;
	}

	/**
	 * @param array<int,mixed>     $blocks Blocks.
	 * @param array<string,string> $out    Output map (by reference).
	 * @return void
	 */
	private function walk_blocks_for_field_values( array $blocks, array &$out ): void {
		foreach ( $blocks as $block ) {
			if ( ! is_array( $block ) ) {
				continue;
			}
			if ( 'layout' === ( isset( $block['kind'] ) ? (string) $block['kind'] : '' ) ) {
				$items = isset( $block['layout']['items'] ) && is_array( $block['layout']['items'] ) ? $block['layout']['items'] : array();
				foreach ( $items as $col ) {
					if ( is_array( $col ) ) {
						$this->walk_blocks_for_field_values( $col, $out );
					}
				}
				continue;
			}
			$fid = isset( $block['id'] ) ? (string) $block['id'] : '';
			if ( '' === $fid ) {
				continue;
			}
			$name = $this->compute_st_input_name( $block );
			// map_deep keeps checkbox groups as arrays (flattened just below) while sanitizing every leaf.
			// phpcs:ignore WordPress.Security.NonceVerification.Missing -- resolved inside the nonce-verified submit handler.
			$raw  = isset( $_POST[ $name ] ) ? map_deep( wp_unslash( $_POST[ $name ] ), 'sanitize_text_field' ) : '';
			if ( is_array( $raw ) ) {
				$flat = array();
				array_walk_recursive( $raw, static function ( $v ) use ( &$flat ): void { $flat[] = is_scalar( $v ) ? (string) $v : ''; } );
				$val = implode( ' ', array_filter( array_map( 'trim', $flat ), 'strlen' ) );
			} else {
				$val = is_scalar( $raw ) ? (string) $raw : '';
			}
			$out[ $fid ] = sanitize_text_field( $val );
		}
	}

	/**
	 * Evaluates one conditional rule ({field,operator,value}) against the id=>value map.
	 *
	 * @param array<string,mixed>  $rule   Rule.
	 * @param array<string,string> $values Field values.
	 * @return bool
	 */
	private function eval_conditional_rule( array $rule, array $values ): bool {
		$op     = isset( $rule['operator'] ) ? (string) $rule['operator'] : 'is';
		$target = isset( $rule['value'] ) ? (string) $rule['value'] : '';
		$fid    = isset( $rule['field'] ) ? (string) $rule['field'] : '';
		$actual = isset( $values[ $fid ] ) ? (string) $values[ $fid ] : '';
		$a = trim( function_exists( 'mb_strtolower' ) ? mb_strtolower( $actual ) : strtolower( $actual ) );
		$t = trim( function_exists( 'mb_strtolower' ) ? mb_strtolower( $target ) : strtolower( $target ) );
		switch ( $op ) {
			case 'is':           return $a === $t;
			case 'is_not':       return $a !== $t;
			case 'contains':     return '' !== $t && false !== strpos( $a, $t );
			case 'starts_with':  return '' !== $t && 0 === strpos( $a, $t );
			case 'ends_with':    return '' !== $t && substr( $a, -strlen( $t ) ) === $t;
			case 'greater_than': return is_numeric( $actual ) && is_numeric( $target ) && (float) $actual > (float) $target;
			case 'less_than':    return is_numeric( $actual ) && is_numeric( $target ) && (float) $actual < (float) $target;
			case 'is_empty':     return '' === trim( $actual );
			case 'is_not_empty': return '' !== trim( $actual );
		}
		return false;
	}

	/**
	 * True when a conditional set (enabled + rules + match all/any) is satisfied.
	 *
	 * @param mixed                $cond   Conditional block.
	 * @param array<string,string> $values Field values.
	 * @return bool
	 */
	private function eval_conditional_set( $cond, array $values ): bool {
		if ( ! is_array( $cond ) || empty( $cond['enabled'] ) ) {
			return false;
		}
		$rules = isset( $cond['rules'] ) && is_array( $cond['rules'] ) ? $cond['rules'] : array();
		if ( empty( $rules ) ) {
			return false;
		}
		$any = ( isset( $cond['match'] ) && 'any' === $cond['match'] );
		foreach ( $rules as $rule ) {
			if ( ! is_array( $rule ) ) {
				continue;
			}
			$ok = $this->eval_conditional_rule( $rule, $values );
			if ( $any && $ok ) {
				return true;
			}
			if ( ! $any && ! $ok ) {
				return false;
			}
		}
		return ! $any;
	}

	/**
	 * Picks the confirmation for a submission: the first matching conditional one, else the default.
	 *
	 * @param array<string,mixed>  $form   Form definition.
	 * @param array<string,string> $values Field values.
	 * @return array<string,mixed>
	 */
	private function resolve_form_confirmation( array $form, array $values ): array {
		$confs   = isset( $form['confirmations'] ) && is_array( $form['confirmations'] ) ? $form['confirmations'] : array();
		$default = null;
		foreach ( $confs as $c ) {
			if ( ! is_array( $c ) ) {
				continue;
			}
			if ( ! empty( $c['isDefault'] ) ) {
				if ( null === $default ) {
					$default = $c;
				}
				continue;
			}
			if ( $this->eval_conditional_set( isset( $c['conditional'] ) ? $c['conditional'] : array(), $values ) ) {
				return $c;
			}
		}
		return is_array( $default ) ? $default : array( 'type' => 'message', 'message' => '' );
	}

	/**
	 * Verifies reCAPTCHA v2 / Turnstile tokens when the form includes those modules.
	 *
	 * @param array<string,mixed> $form Form definition.
	 * @return bool False when verification failed (JSON error already sent).
	 */
	private function verify_form_captcha_tokens( array $form ): bool {
		$needs_recaptcha = $this->form_uses_module( $form, 'recaptcha' );
		$needs_turnstile = $this->form_uses_module( $form, 'cloudflare' );

		if ( ! $needs_recaptcha && ! $needs_turnstile ) {
			return true;
		}

		$rec_keys = $this->get_recaptcha_integration_settings();
		$ts_keys  = $this->get_saved_captcha_keys( self::TURNSTILE_OPTION_KEY );

		if ( $needs_recaptcha ) {
			if ( '' === $rec_keys['secret'] ) {
				wp_send_json_error(
					array( 'message' => __( 'reCAPTCHA is not configured on this site.', 'nexus-lead-suite' ) ),
					400
				);
				return false;
			}
			// phpcs:ignore WordPress.Security.NonceVerification.Missing -- verified in handle_form_submit_ajax().
			$token = isset( $_POST['g-recaptcha-response'] ) ? sanitize_text_field( wp_unslash( (string) $_POST['g-recaptcha-response'] ) ) : '';
			if ( '' === $token || ! $this->verify_recaptcha_with_google(
				$token,
				$rec_keys['secret'],
				$rec_keys['apiVersion'],
				$rec_keys['scoreThreshold']
			) ) {
				wp_send_json_error(
					array( 'message' => __( 'reCAPTCHA verification failed. Please try again.', 'nexus-lead-suite' ) ),
					400
				);
				return false;
			}
		}

		if ( $needs_turnstile ) {
			if ( '' === $ts_keys['secret'] ) {
				wp_send_json_error(
					array( 'message' => __( 'Turnstile is not configured on this site.', 'nexus-lead-suite' ) ),
					400
				);
				return false;
			}
			// phpcs:ignore WordPress.Security.NonceVerification.Missing -- verified in handle_form_submit_ajax().
			$token = isset( $_POST['cf-turnstile-response'] ) ? sanitize_text_field( wp_unslash( (string) $_POST['cf-turnstile-response'] ) ) : '';
			if ( '' === $token || ! $this->verify_turnstile_with_cloudflare( $token, $ts_keys['secret'] ) ) {
				wp_send_json_error(
					array( 'message' => __( 'Turnstile verification failed. Please try again.', 'nexus-lead-suite' ) ),
					400
				);
				return false;
			}
		}

		return true;
	}

	/**
	 * @param array<string,mixed> $form Form.
	 * @param string              $module_id Field module id (e.g. recaptcha, cloudflare).
	 */
	private function form_uses_module( array $form, string $module_id ): bool {
		$steps = isset( $form['steps'] ) && is_array( $form['steps'] ) ? $form['steps'] : array();
		foreach ( $steps as $step ) {
			if ( ! is_array( $step ) ) {
				continue;
			}
			$blocks = isset( $step['fields'] ) && is_array( $step['fields'] ) ? $step['fields'] : array();
			if ( $this->walk_blocks_has_module( $blocks, $module_id ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * @param array<int,mixed> $blocks Blocks.
	 */
	private function walk_blocks_has_module( array $blocks, string $module_id ): bool {
		foreach ( $blocks as $block ) {
			if ( ! is_array( $block ) ) {
				continue;
			}
			$kind = isset( $block['kind'] ) ? sanitize_text_field( (string) $block['kind'] ) : 'field';
			if ( 'layout' === $kind ) {
				$layout = isset( $block['layout'] ) && is_array( $block['layout'] ) ? $block['layout'] : array();
				$items  = isset( $layout['items']     ) && is_array( $layout['items'] ) ? $layout['items'] : array();
				foreach ( $items as $col ) {
					if ( is_array( $col ) && $this->walk_blocks_has_module( $col, $module_id ) ) {
						return true;
					}
				}
				continue;
			}

			$mid = isset( $block['moduleId'] ) ? sanitize_text_field( (string) $block['moduleId'] ) : '';
			if ( $mid === $module_id ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Turnstile / generic key shape from option storage.
	 *
	 * @return array{siteKey:string,secret:string}
	 */
	private function get_saved_captcha_keys( string $option_key ): array {
		$opt = get_option( $option_key, array() );
		if ( ! is_array( $opt ) ) {
			$opt = array();
		}

		return array(
			'siteKey' => isset( $opt['siteKey'] ) ? sanitize_text_field( (string) $opt['siteKey'] ) : '',
			'secret'  => isset( $opt['secretKey'] ) ? trim( (string) $opt['secretKey'] ) : '',
		);
	}

	/**
	 * reCAPTCHA keys plus API mode (v2 checkbox vs v3 score).
	 *
	 * @return array{siteKey:string,secret:string,apiVersion:string,scoreThreshold:float}
	 */
	private function get_recaptcha_integration_settings(): array {
		static $cached = null;
		if ( null !== $cached ) {
			return $cached;
		}
		$opt = get_option( self::RECAPTCHA_OPTION_KEY, array() );
		if ( ! is_array( $opt ) ) {
			$opt = array();
		}
		$api = isset( $opt['apiVersion'] ) ? strtolower( sanitize_text_field( (string) $opt['apiVersion'] ) ) : 'v2';
		if ( 'v3' !== $api ) {
			$api = 'v2';
		}
		$score = isset( $opt['scoreThreshold'] ) ? (float) $opt['scoreThreshold'] : 0.5;
		$score = max( 0.0, min( 1.0, $score ) );

		$cached = array(
			'siteKey'          => isset( $opt['siteKey'] ) ? sanitize_text_field( (string) $opt['siteKey'] ) : '',
			'secret'           => isset( $opt['secretKey'] ) ? trim( (string) $opt['secretKey'] ) : '',
			'apiVersion'       => $api,
			'scoreThreshold'   => $score,
		);

		return $cached;
	}

	private function verify_recaptcha_with_google( string $token, string $secret, string $api_version, float $score_threshold ): bool {
		if ( strlen( $token ) < 10 ) {
			return false;
		}
		$response = wp_remote_post(
			'https://www.google.com/recaptcha/api/siteverify',
			array(
				'timeout' => 15,
				'body'    => array(
					'secret'   => $secret,
					'response' => $token,
					'remoteip' => $this->client_ip_for_captcha(),
				),
			)
		);

		if ( is_wp_error( $response ) ) {
			return false;
		}
		if ( 200 !== (int) wp_remote_retrieve_response_code( $response ) ) {
			return false;
		}

		$data = json_decode( (string) wp_remote_retrieve_body( $response ), true );
		if ( ! is_array( $data ) || empty( $data['success'] ) ) {
			return false;
		}

		if ( 'v3' === $api_version ) {
			if ( ! isset( $data['score'] ) || ! is_numeric( $data['score'] ) ) {
				return false;
			}
			if ( (float) $data['score'] < $score_threshold ) {
				return false;
			}
			$action = isset( $data['action'] ) ? sanitize_text_field( (string) $data['action'] ) : '';
			if ( $action !== self::RECAPTCHA_V3_ACTION ) {
				return false;
			}
		}

		return true;
	}

	private function verify_turnstile_with_cloudflare( string $token, string $secret ): bool {
		if ( strlen( $token ) < 10 ) {
			return false;
		}
		$response = wp_remote_post(
			// phpcs:ignore PluginCheck.CodeAnalysis.Offloading.OffloadedContent -- Server-side Cloudflare Turnstile token verification endpoint (not asset offloading); Turnstile is an opt-in, disclosed External Service and the secret is validated only against the provider.
			'https://challenges.cloudflare.com/turnstile/v0/siteverify',
			array(
				'timeout' => 15,
				'body'    => array(
					'secret'   => $secret,
					'response' => $token,
					'remoteip' => $this->client_ip_for_captcha(),
				),
			)
		);

		if ( is_wp_error( $response ) ) {
			return false;
		}
		if ( 200 !== (int) wp_remote_retrieve_response_code( $response ) ) {
			return false;
		}

		$data = json_decode( (string) wp_remote_retrieve_body( $response ), true );

		return is_array( $data ) && ! empty( $data['success'] );
	}

	private function client_ip_for_captcha(): string {
		if ( empty( $_SERVER['REMOTE_ADDR'] ) ) {
			return '';
		}

		return sanitize_text_field( wp_unslash( (string) $_SERVER['REMOTE_ADDR'] ) );
	}

	/**
	 * CRM / automation webhook URLs (global settings + per-form). HubSpot, Salesforce middleware, Zapier, etc.
	 *
	 * @param array<string,mixed> $form Sanitized form row from storage.
	 * @return array<int,string>
	 */
	private function collect_submission_webhook_urls( array $form ): array {
		$urls = array();
		$form_u = isset( $form['crmWebhookUrl'] ) ? esc_url_raw( trim( (string) $form['crmWebhookUrl'] ) ) : '';
		if ( $form_u && wp_http_validate_url( $form_u ) ) {
			$urls[] = $form_u;
		}

		$general = get_option( self::GENERAL_SETTINGS_OPTION_KEY, array() );
		if ( is_array( $general ) && ! empty( $general['submissionWebhookUrl'] ) ) {
			$g = esc_url_raw( trim( (string) $general['submissionWebhookUrl'] ) );
			if ( $g && wp_http_validate_url( $g ) ) {
				$urls[] = $g;
			}
		}

		return array_values( array_unique( $urls ) );
	}

	/**
	 * Parses comma / newline separated notification emails from form settings.
	 *
	 * @param string $raw Raw string.
	 * @return array<int,string>
	 */
	private function parse_notification_emails( string $raw ): array {
		$raw    = trim( $raw );
		$parts  = preg_split( '/[\s,;|]+/', $raw );
		$parts  = is_array( $parts ) ? $parts : array();
		$out    = array();
		foreach ( $parts as $p ) {
			$p = sanitize_email( trim( (string) $p ) );
			if ( $p && is_email( $p ) ) {
				$out[] = $p;
			}
		}
		return array_values( array_unique( $out ) );
	}

	/**
	 * Raw email templates array from options (v1 key, then legacy key).
	 *
	 * @return array<int,mixed>
	 */
	private function read_email_templates_from_storage(): array {
		$templates = get_option( self::EMAIL_TEMPLATES_OPTION_KEY, null );
		if ( null === $templates ) {
			$templates = get_option( 'nexulesuite_email_templates', array() );
		}

		return is_array( $templates ) ? $templates : array();
	}

	/**
	 * Valid recipients from a single email template row.
	 *
	 * @param array<string,mixed>|null $tpl Template or null.
	 * @return array<int,string>
	 */
	private function collect_recipients_from_template( ?array $tpl ): array {
		if ( ! is_array( $tpl ) ) {
			return array();
		}

		$list = array();
		if ( isset( $tpl['recipients'] ) && is_array( $tpl['recipients'] ) ) {
			$list = $tpl['recipients'];
		} elseif ( isset( $tpl['emails'] ) ) {
			$split = preg_split( '/[\r\n,]+/', (string) $tpl['emails'] );
			$list  = is_array( $split ) ? $split : array();
		}

		$seen = array();
		$out  = array();
		foreach ( $list as $email ) {
			$email = sanitize_email( trim( (string) $email ) );
			if ( $email && is_email( $email ) && ! isset( $seen[ $email ] ) ) {
				$seen[ $email ] = true;
				$out[]          = $email;
			}
		}

		return $out;
	}

	/**
	 * Every valid recipient from every template (union) for trigger notifications.
	 *
	 * @param array<int,mixed> $templates Templates payload.
	 * @return array<int,string>
	 */
	private function collect_union_recipients_from_templates( array $templates ): array {
		$seen = array();
		$out  = array();
		foreach ( $templates as $tpl ) {
			if ( ! is_array( $tpl ) ) {
				continue;
			}
			foreach ( $this->collect_recipients_from_template( $tpl ) as $email ) {
				if ( ! isset( $seen[ $email ] ) ) {
					$seen[ $email ] = true;
					$out[]          = $email;
				}
			}
		}

		return $out;
	}

	/**
	 * Finds a template by its admin id.
	 *
	 * @param array<int,mixed> $templates Templates.
	 * @param string           $id        Template id.
	 * @return array<string,mixed>|null
	 */
	private function find_email_template_by_id( array $templates, string $id ): ?array {
		if ( '' === $id ) {
			return null;
		}
		foreach ( $templates as $tpl ) {
			if ( ! is_array( $tpl ) ) {
				continue;
			}
			$tid = isset( $tpl['id'] ) ? (string) $tpl['id'] : '';
			if ( $tid === $id ) {
				return $tpl;
			}
		}

		return null;
	}

	/**
	 * HTML body from a template row (supports legacy `contents` key).
	 *
	 * @param array<string,mixed>|null $tpl Template or null.
	 * @return string
	 */
	private function get_email_template_html_body( ?array $tpl ): string {
		if ( ! is_array( $tpl ) ) {
			return '';
		}
		$html = isset( $tpl['content'] ) ? (string) $tpl['content'] : '';
		if ( '' === trim( $html ) && isset( $tpl['contents'] ) ) {
			$html = (string) $tpl['contents'];
		}

		return $html;
	}

	/**
	 * First template that has non-empty HTML content.
	 *
	 * @param array<int,mixed> $templates Templates.
	 * @return array<string,mixed>|null
	 */
	private function find_first_email_template_with_html( array $templates ): ?array {
		foreach ( $templates as $tpl ) {
			if ( ! is_array( $tpl ) ) {
				continue;
			}
			if ( '' !== trim( $this->get_email_template_html_body( $tpl ) ) ) {
				return $tpl;
			}
		}

		return null;
	}

	/**
	 * Replaces merge tags for activity / trigger notification sends.
	 *
	 * @param string $text         HTML or subject.
	 * @param string $trigger_id   Trigger id.
	 * @param string $notify_label Notify label.
	 * @param string $page_url     Page URL.
	 * @return string
	 */
	private function apply_trigger_notification_merge_tags( string $text, string $trigger_id, string $notify_label, string $page_url ): string {
		$site_name = wp_strip_all_tags( (string) get_bloginfo( 'name' ) );
		$btn       = $notify_label !== '' ? $notify_label : $trigger_id;
		$ts        = wp_date( 'M j, Y g:i A', current_time( 'timestamp' ) );
		$dash      = '—';
		$home      = home_url( '/' );

		$pairs = array(
			'{btnName}'          => esc_html( $btn ),
			'{eventId}'         => esc_html( $trigger_id ),
			'{purpose}'         => esc_html( $notify_label !== '' ? $notify_label : $trigger_id ),
			'{dateTime}'        => esc_html( $ts ),
			'{year}'            => esc_html( (string) gmdate( 'Y' ) ),
			'{siteName}'        => esc_html( $site_name ),
			'{siteUrl}'         => esc_url( $home ),
			'{pageUrl}'         => esc_url( $page_url !== '' ? $page_url : $home ),
			'{userName}'        => esc_html( $dash ),
			'{userEmail}'       => esc_html( $dash ),
			'{ipAddress}'       => esc_html( $dash ),
			'{userLocation}'    => esc_html( $dash ),
			'{formName}'        => esc_html( __( 'Trigger notification', 'nexus-lead-suite' ) ),
			'{stepNo}'          => esc_html( '1' ),
		);

		foreach ( $pairs as $needle => $repl ) {
			if ( false !== strpos( $text, $needle ) ) {
				$text = str_replace( $needle, $repl, $text );
			}
		}

		/* Deprecated tags: strip so older saved templates do not show raw placeholders. */
		$text = str_replace( array( '{appointmentDate}', '{reference}' ), '', $text );

		return $text;
	}

	/**
	 * Flattens a scalar or nested array POST value for plain-text email bodies.
	 *
	 * @param mixed $value Value (already unslashed).
	 * @return string
	 */
	private function flatten_post_value_for_email( $value ): string {
		if ( is_array( $value ) ) {
			$parts = array();
			foreach ( $value as $k => $v ) {
				$v = wp_unslash( $v );
				$parts[] = sanitize_text_field( (string) $k ) . ' → ' . $this->flatten_post_value_for_email( $v );
			}
			return implode( '; ', $parts );
		}
		$s = sanitize_textarea_field( (string) $value );
		if ( strlen( $s ) > 2000 ) {
			$s = substr( $s, 0, 2000 ) . '…';
		}
		return $s;
	}

	/**
	 * Stable input name for a saved field (must match {@see self::render_field_block()}).
	 *
	 * @param array<string,mixed> $field Field block.
	 * @return string
	 */
	private function compute_st_input_name( array $field ): string {
		$module_id = isset( $field['moduleId'] ) ? sanitize_text_field( (string) $field['moduleId'] ) : '';
		$name      = 'st_' . preg_replace( '/[^a-z0-9_]+/i', '_', $module_id . '_' . ( $field['id'] ?? '' ) );

		return strtolower( (string) $name );
	}

	/**
	 * Default heading when a field has no custom label.
	 *
	 * @param string $module_id Module id.
	 * @return string
	 */
	private function default_module_label( string $module_id ): string {
		switch ( $module_id ) {
			case 'name':
				return __( 'Name', 'nexus-lead-suite' );
			case 'email':
				return __( 'Email', 'nexus-lead-suite' );
			case 'phone':
				return __( 'Phone', 'nexus-lead-suite' );
			case 'textarea':
				return __( 'Message', 'nexus-lead-suite' );
			case 'dropdown':
				return __( 'Selection', 'nexus-lead-suite' );
			case 'radio':
				return __( 'Choice', 'nexus-lead-suite' );
			case 'checkbox':
				return __( 'Options', 'nexus-lead-suite' );
			case 'address':
				return __( 'Address', 'nexus-lead-suite' );
			case 'terms-conditions':
				return __( 'Terms & consent', 'nexus-lead-suite' );
			case 'date':
				return __( 'Date', 'nexus-lead-suite' );
			case 'time':
				return __( 'Time', 'nexus-lead-suite' );
			case 'datetime-local':
				return __( 'Date & time', 'nexus-lead-suite' );
			case 'number':
				return __( 'Number', 'nexus-lead-suite' );
			case 'url':
				return __( 'URL', 'nexus-lead-suite' );
			case 'password':
				return __( 'Password', 'nexus-lead-suite' );
			case 'file':
				return __( 'File', 'nexus-lead-suite' );
			default:
				return __( 'Field', 'nexus-lead-suite' );
		}
	}

	/**
	 * @param array<string,mixed> $settings Field settings.
	 * @return array<string,string> Sub-key => label.
	 */
	private function name_subpart_labels_from_settings( array $settings ): array {
		$parts   = isset( $settings['nameParts'] ) && is_array( $settings['nameParts'] ) ? $settings['nameParts'] : array();
		$order   = array( 'prefix', 'first', 'middle', 'last' );
		$default = array(
			'prefix' => __( 'Prefix', 'nexus-lead-suite' ),
			'first'  => __( 'First name', 'nexus-lead-suite' ),
			'middle' => __( 'Middle name', 'nexus-lead-suite' ),
			'last'   => __( 'Last name', 'nexus-lead-suite' ),
		);
		$out = array();
		foreach ( $order as $key ) {
			$part    = isset( $parts[ $key ] ) && is_array( $parts[ $key ] ) ? $parts[ $key ] : array();
			$enabled = isset( $part['enabled'] ) ? (bool) $part['enabled'] : ( 'first' === $key || 'last' === $key );
			if ( ! $enabled ) {
				continue;
			}
			$lbl          = isset( $part['label'] ) ? sanitize_text_field( (string) $part['label'] ) : '';
			$out[ $key ] = '' !== $lbl ? $lbl : $default[ $key ];
		}

		return $out;
	}

	/**
	 * @param array<string,mixed> $settings Field settings.
	 * @return array<string,string> Sub-key => label.
	 */
	private function address_subpart_labels_from_settings( array $settings ): array {
		$parts   = isset( $settings['addressParts'] ) && is_array( $settings['addressParts'] ) ? $settings['addressParts'] : array();
		$order   = array(
			'address1' => __( 'Street address', 'nexus-lead-suite' ),
			'address2' => __( 'Apartment, suite, etc.', 'nexus-lead-suite' ),
			'city'     => __( 'City', 'nexus-lead-suite' ),
			'state'    => __( 'State / province', 'nexus-lead-suite' ),
			'zip'      => __( 'ZIP / postal code', 'nexus-lead-suite' ),
			'country'  => __( 'Country', 'nexus-lead-suite' ),
		);
		$out = array();
		foreach ( $order as $key => $fallback ) {
			$part    = isset( $parts[ $key ] ) && is_array( $parts[ $key ] ) ? $parts[ $key ] : array();
			$enabled = isset( $part['enabled'] ) ? (bool) $part['enabled'] : true;
			if ( ! $enabled ) {
				continue;
			}
			$lbl          = isset( $part['label'] ) ? sanitize_text_field( (string) $part['label'] ) : '';
			$out[ $key ] = '' !== $lbl ? $lbl : $fallback;
		}

		return $out;
	}

	/**
	 * Maps POST input names to display metadata for notification emails.
	 *
	 * @param array<string,mixed> $form Form definition.
	 * @return array<string,array<string,mixed>>
	 */
	private function build_form_field_post_meta_map( array $form ): array {
		$map   = array();
		$steps = isset( $form['steps'] ) && is_array( $form['steps'] ) ? $form['steps'] : array();
		foreach ( $steps as $step ) {
			if ( ! is_array( $step ) ) {
				continue;
			}
			$blocks = isset( $step['fields'] ) && is_array( $step['fields'] ) ? $step['fields'] : array();
			$this->walk_blocks_for_field_post_meta( $blocks, $map );
		}

		return $map;
	}

	/**
	 * @param array<int,mixed>    $blocks Blocks.
	 * @param array<string,mixed> $map    Output map (by reference).
	 * @return void
	 */
	private function walk_blocks_for_field_post_meta( array $blocks, array &$map ): void {
		foreach ( $blocks as $block ) {
			if ( ! is_array( $block ) ) {
				continue;
			}
			$kind = isset( $block['kind'] ) ? sanitize_text_field( (string) $block['kind'] ) : 'field';
			if ( 'layout' === $kind ) {
				$layout = isset( $block['layout'] ) && is_array( $block['layout'] ) ? $block['layout'] : array();
				$items  = isset( $layout['items'] ) && is_array( $layout['items'] ) ? $layout['items'] : array();
				foreach ( $items as $col ) {
					if ( is_array( $col ) ) {
						$this->walk_blocks_for_field_post_meta( $col, $map );
					}
				}
				continue;
			}

			$this->register_field_post_meta( $block, $map );
		}
	}

	/**
	 * @param array<string,mixed> $field Field block.
	 * @param array<string,mixed> $map   Map reference.
	 * @return void
	 */
	private function register_field_post_meta( array $field, array &$map ): void {
		$module_id = isset( $field['moduleId'] ) ? sanitize_text_field( (string) $field['moduleId'] ) : '';
		if ( '' === $module_id || 'recaptcha' === $module_id || 'cloudflare' === $module_id ) {
			return;
		}

		$settings = isset( $field['settings'] ) && is_array( $field['settings'] ) ? $field['settings'] : array();
		$label    = isset( $settings['label'] ) ? sanitize_text_field( (string) $settings['label'] ) : '';
		if ( '' === $label && 'terms-conditions' !== $module_id ) {
			$label = $this->default_module_label( $module_id );
		}
		if ( 'terms-conditions' === $module_id ) {
			$label = __( 'Terms & consent', 'nexus-lead-suite' );
		}

		$name = $this->compute_st_input_name( $field );

		if ( 'name' === $module_id ) {
			$map[ $name ] = array(
				'type'    => 'compound_name',
				'label'   => $label,
				'parts'   => $this->name_subpart_labels_from_settings( $settings ),
			);
			return;
		}

		if ( 'address' === $module_id ) {
			$map[ $name ] = array(
				'type'    => 'compound_address',
				'label'   => $label,
				'parts'   => $this->address_subpart_labels_from_settings( $settings ),
			);
			return;
		}

		$map[ $name ] = array(
			'type'   => 'scalar',
			'label'  => $label,
			'module' => $module_id,
		);
	}

	/**
	 * @param string $post_key Raw POST key.
	 * @return string
	 */
	private function fallback_label_for_post_key( string $post_key ): string {
		if ( preg_match( '/^st_([a-z0-9]+)_/i', $post_key, $mm ) ) {
			return $this->default_module_label( strtolower( (string) $mm[1] ) );
		}

		return $post_key;
	}

	/**
	 * Formats a POST value for a display cell (single line where possible).
	 *
	 * @param mixed               $value Raw (unslashed).
	 * @param array<string,mixed> $meta  Field meta from map.
	 * @return string
	 */
	private function format_post_value_for_submission_cell( $value, array $meta ): string {
		$value = wp_unslash( $value );
		if ( is_array( $value ) ) {
			$bits = array();
			foreach ( $value as $k => $v ) {
				$v = wp_unslash( $v );
				if ( is_array( $v ) ) {
					$bits[] = sanitize_text_field( (string) $k ) . ': ' . $this->flatten_post_value_for_email( $v );
				} else {
					$bits[] = sanitize_text_field( (string) $k ) . ': ' . sanitize_textarea_field( (string) $v );
				}
			}

			return implode( '; ', $bits );
		}

		$s = sanitize_textarea_field( (string) $value );
		if ( strlen( $s ) > 4000 ) {
			$s = substr( $s, 0, 4000 ) . '…';
		}

		$mod = isset( $meta['module'] ) ? (string) $meta['module'] : '';
		if ( ( 'checkbox' === $mod || 'terms-conditions' === $mod ) && ( '1' === $s || 'on' === strtolower( $s ) ) ) {
			return __( 'Yes', 'nexus-lead-suite' );
		}

		return $s;
	}

	/**
	 * Rows for HTML email + activity log (label/value already human-oriented).
	 *
	 * @param array<string,mixed> $form Form.
	 * @return array<int,array{label:string,value:string}>
	 */
	private function collect_form_submission_display_rows( array $form ): array {
		$meta_map = $this->build_form_field_post_meta_map( $form );
		$skip      = array(
			'nexulesuite_form_nonce',
			'nexulesuite_form_id',
			'nexulesuite_form_context',
			'action',
			'_wp_http_referer',
			'_nexulesuite_page_url',
			self::HONEYPOT_FIELD_NAME,
		);
		$skip_like = array( 'g-recaptcha-response', 'h-captcha-response', 'cf-turnstile-response' );

		$rows = array();
		// phpcs:ignore WordPress.Security.NonceVerification.Missing -- called only from nonce-verified AJAX handler.
		foreach ( $_POST as $key => $value ) {
			if ( ! is_string( $key ) ) {
				continue;
			}
			$key = sanitize_text_field( $key );
			if ( '' === $key ) {
				continue;
			}
			if ( in_array( $key, $skip, true ) || str_starts_with( $key, '_' ) ) {
				continue;
			}
			if ( in_array( $key, $skip_like, true ) ) {
				continue;
			}

			if ( ! isset( $meta_map[ $key ] ) ) {
				$rows[] = array(
					'label' => $this->fallback_label_for_post_key( $key ),
					'value' => $this->format_post_value_for_submission_cell( $value, array( 'module' => '' ) ),
				);
				continue;
			}

			$meta = $meta_map[ $key ];
			$type = isset( $meta['type'] ) ? (string) $meta['type'] : 'scalar';

			if ( 'compound_name' === $type && is_array( $value ) ) {
				$value   = wp_unslash( $value );
				$enabled = isset( $meta['parts'] ) && is_array( $meta['parts'] ) ? $meta['parts'] : array();
				$bits    = array();
				foreach ( array( 'prefix', 'first', 'middle', 'last' ) as $subk ) {
					if ( ! isset( $enabled[ $subk ] ) ) {
						continue;
					}
					$vv = isset( $value[ $subk ] ) ? sanitize_text_field( (string) $value[ $subk ] ) : '';
					if ( '' !== $vv ) {
						$bits[] = $vv;
					}
				}
				$full = trim( preg_replace( '/\s+/u', ' ', implode( ' ', $bits ) ) );
				$rows[] = array(
					'label' => (string) ( $meta['label'] ?? __( 'Name', 'nexus-lead-suite' ) ),
					'value' => '' !== $full ? $full : '—',
				);
				continue;
			}

			if ( 'compound_address' === $type && is_array( $value ) ) {
				$value  = wp_unslash( $value );
				$parts  = isset( $meta['parts'] ) && is_array( $meta['parts'] ) ? $meta['parts'] : array();
				$chunks = array();
				foreach ( $parts as $subk => $sublabel ) {
					$vv = isset( $value[ $subk ] ) ? sanitize_text_field( (string) $value[ $subk ] ) : '';
					if ( '' !== $vv ) {
						$chunks[] = $sublabel . ': ' . $vv;
					}
				}
				$rows[] = array(
					'label' => (string) ( $meta['label'] ?? __( 'Address', 'nexus-lead-suite' ) ),
					'value' => ! empty( $chunks ) ? implode( '; ', $chunks ) : '—',
				);
				continue;
			}

			$disp = $this->format_post_value_for_submission_cell( $value, $meta );
			$rows[] = array(
				'label' => (string) ( $meta['label'] ?? $this->fallback_label_for_post_key( $key ) ),
				'value' => '' !== $disp ? $disp : '—',
			);
		}

		return $rows;
	}

	/**
	 * Lightweight HTML body for form notification (table + inline styles).
	 *
	 * @param string              $site_name Site title.
	 * @param string              $form_name Form title.
	 * @param string              $form_id   Form id.
	 * @param array<int,array{label:string,value:string}> $rows Field rows.
	 * @param string              $submitted_at Local mysql time.
	 * @param string              $page_url Page URL.
	 * @return string
	 */
	private function build_form_submission_notice_html(
		string $site_name,
		string $form_name,
		string $form_id,
		array $rows,
		string $submitted_at,
		string $page_url
	): string {
		$site_name = wp_strip_all_tags( $site_name );
		$form_name = wp_strip_all_tags( $form_name );
		$form_id   = wp_strip_all_tags( $form_id );
		$initial   = '' !== $site_name ? strtoupper( function_exists( 'mb_substr' ) ? mb_substr( $site_name, 0, 1 ) : substr( $site_name, 0, 1 ) ) : 'N';
		$home      = home_url( '/' );
		$year      = gmdate( 'Y' );

		ob_start();
		echo '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>';
		echo '<body style="margin:0;padding:0;background-color:#eef2ff;">';
		echo '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#eef2ff;padding:24px 10px;font-family:\'Segoe UI\',Roboto,Helvetica,Arial,sans-serif;"><tr><td align="center">';
		echo '<table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">';

		// Header: site initial badge + name (left), SUBMISSION pill (right), indigo accent line.
		echo '<tr><td style="background:#0f172a;border-bottom:3px solid #4f46e5;padding:22px 26px;">';
		echo '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr>';
		echo '<td align="left" style="vertical-align:middle;"><table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr>';
		echo '<td style="background:#4f46e5;border-radius:9px;width:40px;height:40px;text-align:center;vertical-align:middle;color:#ffffff;font:700 18px \'Segoe UI\',Arial,sans-serif;">' . esc_html( $initial ) . '</td>';
		echo '<td style="padding-left:12px;color:#f8fafc;font:700 17px \'Segoe UI\',Arial,sans-serif;vertical-align:middle;">' . esc_html( $site_name ) . '</td>';
		echo '</tr></table></td>';
		echo '<td align="right" style="vertical-align:middle;"><span style="display:inline-block;padding:6px 14px;border:1px solid #334155;border-radius:999px;color:#94a3b8;font:700 11px Arial,sans-serif;letter-spacing:0.1em;">' . esc_html__( 'SUBMISSION', 'nexus-lead-suite' ) . '</span></td>';
		echo '</tr></table></td></tr>';

		// Body: eyebrow, form name heading, intro, then the real submitted fields.
		echo '<tr><td style="padding:32px 28px 8px;color:#475569;font:15px/1.65 \'Segoe UI\',Arial,sans-serif;">';
		echo '<p style="margin:0 0 8px;font:700 12px Arial,sans-serif;letter-spacing:0.1em;text-transform:uppercase;color:#4f46e5;">' . esc_html__( 'New submission', 'nexus-lead-suite' ) . '</p>';
		echo '<p style="margin:0 0 14px;font:800 24px \'Segoe UI\',Arial,sans-serif;color:#0f172a;line-height:1.25;">' . esc_html( $form_name ) . '</p>';
		echo '<p style="margin:0 0 26px;">' . esc_html__( 'A new response was submitted on your site. The full details are below.', 'nexus-lead-suite' ) . '</p>';

		echo '<p style="margin:0 0 12px;font:700 12px Arial,sans-serif;letter-spacing:0.06em;color:#94a3b8;text-transform:uppercase;">' . esc_html__( 'Submission details', 'nexus-lead-suite' ) . '</p>';
		echo '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">';

		$n = count( $rows );
		foreach ( $rows as $i => $row ) {
			$lb = isset( $row['label'] ) ? (string) $row['label'] : '';
			$vl = isset( $row['value'] ) ? (string) $row['value'] : '';
			$br = ( $i < $n - 1 ) ? 'border-bottom:1px solid #e2e8f0;' : '';

			echo '<tr>';
			echo '<td valign="top" width="38%" style="padding:14px 16px;' . esc_attr( $br ) . 'background:#f8fafc;font:600 13px Arial,sans-serif;color:#64748b;">' . esc_html( $lb ) . '</td>';
			echo '<td valign="top" style="padding:14px 16px;' . esc_attr( $br ) . 'font:14px \'Segoe UI\',Arial,sans-serif;color:#0f172a;word-break:break-word;">' . nl2br( esc_html( $vl ), false ) . '</td>';
			echo '</tr>';
		}

		echo '</table>';

		if ( '' !== $page_url ) {
			echo '<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-top:26px;"><tr><td style="border-radius:10px;background:#4f46e5;">';
			echo '<a href="' . esc_url( $page_url ) . '" style="display:inline-block;padding:13px 24px;color:#ffffff;font:700 14px Arial,sans-serif;text-decoration:none;border-radius:10px;">' . esc_html__( 'View related page', 'nexus-lead-suite' ) . ' &#8594;</a>';
			echo '</td></tr></table>';
		}
		echo '</td></tr>';

		// Footer.
		echo '<tr><td style="padding:24px 28px 26px;">';
		echo '<div style="border-top:1px solid #e2e8f0;padding-top:20px;font:13px/1.6 Arial,sans-serif;color:#94a3b8;">';
		echo '<p style="margin:0 0 10px;">' . sprintf(
			/* translators: %s: linked site name */
			esc_html__( 'This response was submitted on %s.', 'nexus-lead-suite' ),
			'<a href="' . esc_url( $home ) . '" style="color:#4f46e5;text-decoration:none;font-weight:600;">' . esc_html( $site_name ) . '</a>'
		) . '</p>';
		echo '<p style="margin:0 0 8px;">' . esc_html( sprintf( /* translators: 1: form id, 2: datetime */ __( 'Form ID: %1$s · Submitted: %2$s', 'nexus-lead-suite' ), $form_id, $submitted_at ) ) . '</p>';
		echo '<p style="margin:0;color:#cbd5e1;font-size:12px;">&copy; ' . esc_html( $year ) . ' ' . esc_html( $site_name ) . '. ' . esc_html__( 'All rights reserved.', 'nexus-lead-suite' ) . '</p>';
		echo '</div></td></tr>';

		echo '</table></td></tr></table></body></html>';

		return (string) ob_get_clean();
	}

	/**
	 * Guesses Reply-To from the first plausible email field in POST data.
	 *
	 * @return string Empty or "Name <email>" fragment safe for header.
	 */
	private function guess_reply_to_email_from_post(): string {
		// phpcs:ignore WordPress.Security.NonceVerification.Missing -- called only from nonce-verified AJAX handler.
		foreach ( $_POST as $key => $value ) {
			if ( ! is_string( $key ) ) {
				continue;
			}
			$key = sanitize_text_field( $key );
			if ( '' === $key ) {
				continue;
			}
			$value = wp_unslash( $value );
			if ( ! is_string( $value ) ) {
				continue;
			}
			if ( stripos( $key, 'mail' ) === false && stripos( $key, 'email' ) === false ) {
				continue;
			}
			$e = sanitize_email( trim( $value ) );
			if ( $e && is_email( $e ) ) {
				return $e;
			}
		}
		// phpcs:ignore WordPress.Security.NonceVerification.Missing -- called only from nonce-verified AJAX handler.
		foreach ( $_POST as $value ) {
			$value = wp_unslash( $value );
			if ( ! is_string( $value ) ) {
				continue;
			}
			$e = sanitize_email( trim( $value ) );
			if ( $e && is_email( $e ) ) {
				return $e;
			}
		}
		return '';
	}

	/**
	 * Event name or popup ID configured for Livechat button 1 inline content.
	 *
	 * @return string
	 */
	private function get_livechat_inline_popup_ref(): string {
		$opt = get_option( self::GENERAL_SETTINGS_OPTION_KEY, array() );
		if ( ! is_array( $opt ) || empty( $opt['enableLivechat'] ?? false ) ) {
			return '';
		}
		$raw = trim( (string) ( $opt['chatFormButtonLink'] ?? '' ) );
		if ( str_starts_with( $raw, 'popup:' ) ) {
			return sanitize_text_field( substr( $raw, 6 ) );
		}
		if ( '#open-form' === $raw ) {
			return 'open-form';
		}
		return '';
	}

	/**
	 * Finds a popup row by eventName or id.
	 *
	 * @param string $needle Event name or popup id.
	 * @return array<string,mixed>|null
	 */
	private function find_popup_by_event_or_id( string $needle ): ?array {
		if ( '' === $needle ) {
			return null;
		}
		$popups = get_option( self::POPUPS_OPTION_KEY, array() );
		if ( ! is_array( $popups ) ) {
			return null;
		}
		foreach ( $popups as $popup ) {
			if ( ! is_array( $popup ) ) {
				continue;
			}
			$ev = (string) ( $popup['eventName'] ?? '' );
			$id = (string) ( $popup['id'] ?? '' );
			if ( $needle === $ev || $needle === $id ) {
				return $popup;
			}
		}
		return null;
	}

	/**
	 * Whether popup logic includes timer / scroll / exit triggers (auto-open when allowed globally).
	 *
	 * @param array<string,mixed> $popup Persisted popup row.
	 * @return bool
	 */
	private function popup_raw_has_auto_trigger( array $popup ): bool {
		$raw_logic = isset( $popup['logic'] ) && is_array( $popup['logic'] ) ? $popup['logic'] : array();
		foreach ( $raw_logic as $rule ) {
			if ( ! is_array( $rule ) ) {
				continue;
			}
			$t = sanitize_text_field( (string) ( $rule['trigger'] ?? 'click' ) );
			if ( in_array( $t, array( 'timer', 'scroll', 'exit' ), true ) ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * True when Popup Body has no user-supplied content (whitespace-only counts as empty).
	 * Only then may the global "Auto Popup Form" from Settings be prepended for timer/scroll/exit
	 * popups. If the merchant pastes any HTML or a shortcode (including `[nexulesuite_form …]`),
	 * that field is non-empty — we never prepend, so only the chosen shortcode/body is shown.
	 *
	 * @param string $content Raw popup body from storage.
	 * @return bool
	 */
	private function popup_body_is_whitespace_only( string $content ): bool {
		return '' === trim( $content );
	}

	/**
	 * Popup body is already sanitized when saved (REST). Strip script tags only so do_shortcode
	 * sees intact third-party shortcodes (wp_kses_post before do_shortcode can break some tags).
	 *
	 * @param string $content Stored popup body.
	 * @return string
	 */
	private function sanitize_popup_body_before_shortcode( string $content ): string {
		$content = (string) preg_replace( '#<\s*script\b[^>]*>.*?</\s*script\s*>#is', '', $content );

		return trim( $content );
	}

	/**
	 * Lets shortcode handlers enqueue styles/scripts during wp_enqueue_scripts (output discarded).
	 *
	 * @return void
	 */
	public function prime_popup_embedded_shortcodes(): void {
		if ( is_admin() && ! wp_doing_ajax() ) {
			return;
		}

		$popups = get_option( self::POPUPS_OPTION_KEY, array() );
		if ( ! is_array( $popups ) || empty( $popups ) ) {
			return;
		}

		foreach ( $popups as $popup ) {
			if ( ! is_array( $popup ) ) {
				continue;
			}
			$content = isset( $popup['content'] ) ? (string) $popup['content'] : '';
			if ( '' === $content || strpos( $content, '[' ) === false ) {
				continue;
			}
			$buf = $this->sanitize_popup_body_before_shortcode( $content );
			if ( '' === $buf ) {
				continue;
			}
			$discard = \nexulesuite_\expand_popup_body_shortcodes( $buf );
			unset( $discard );
		}
	}

	/**
	 * Ordered default Nexus form IDs for timer/scroll/exit popups when the popup body is empty.
	 *
	 * @param array<string, mixed> $general General settings option row.
	 * @return array<int, string>
	 */
	private function get_auto_popup_default_form_ids( array $general ): array {
		if ( isset( $general['autoPopupFormIds'] ) && is_array( $general['autoPopupFormIds'] ) ) {
			$list = array();
			foreach ( $general['autoPopupFormIds'] as $fid ) {
				$fid = sanitize_text_field( (string) $fid );
				if ( '' !== $fid ) {
					$list[] = $fid;
				}
			}
			$list = array_values( array_unique( $list, SORT_STRING ) );

			return $list;
		}

		if ( isset( $general['autoPopupFormId'] ) && '' !== trim( (string) $general['autoPopupFormId'] ) ) {
			return array( sanitize_text_field( (string) $general['autoPopupFormId'] ) );
		}

		return array();
	}

	/**
	 * Registers shortcodes.
	 *
	 * @return void
	 */
	public function register_shortcodes(): void {
		add_shortcode( 'nexulesuite_form', array( $this, 'render_form_shortcode' ) );
		add_shortcode( 'nexulesuite_chat', array( $this, 'render_chat_shortcode' ) );
	}

	/**
	 * Ensures form front assets enqueue when the shortcode lives in singular post content (before shortcode runs).
	 *
	 * @return void
	 */
	public function scan_singular_for_form_shortcode(): void {
		if ( is_admin() || wp_doing_ajax() || wp_doing_cron() ) {
			return;
		}

		if ( ! is_singular() ) {
			return;
		}

		global $post;
		if ( ! $post instanceof \WP_Post ) {
			return;
		}

		$content = (string) $post->post_content;
		if ( '' === $content || false === strpos( $content, 'nexulesuite_form' ) ) {
			return;
		}

		self::$did_render = true;
		$this->queue_forminator_meta_from_shortcode_content( $content );
	}

	/**
	 * Reads form rows for design + multi-step flags from shortcode attributes in raw content.
	 *
	 * @param string $content Post or popup body.
	 * @return void
	 */
	private function queue_forminator_meta_from_shortcode_content( string $content ): void {
		if ( ! preg_match_all( '/\\[\\s*nexulesuite_form\\b([^\\]]*)\\]/i', $content, $blocks, PREG_SET_ORDER ) ) {
			return;
		}

		$payload = $this->get_forms_payload();
		$forms   = isset( $payload['forms'] ) && is_array( $payload['forms'] ) ? $payload['forms'] : array();

		foreach ( $blocks as $block ) {
			$inner = isset( $block[1] ) ? (string) $block[1] : '';
			$fid   = '';
			if ( preg_match( '/id\s*=\s*"([^"]+)"/i', $inner, $im ) ) {
				$fid = sanitize_text_field( $im[1] );
			} elseif ( preg_match( "/id\\s*=\\s*'([^']+)'/i", $inner, $im2 ) ) {
				$fid = sanitize_text_field( $im2[1] );
			}
			if ( '' === $fid ) {
				continue;
			}

			foreach ( $forms as $form ) {
				if ( ! is_array( $form ) ) {
					continue;
				}
				$id = isset( $form['id'] ) ? (string) $form['id'] : '';
				if ( $id !== $fid ) {
					continue;
				}

				$styling = isset( $form['styling'] ) && is_array( $form['styling'] ) ? $form['styling'] : array();
				self::$forminator_design_queue[] = Forminator_UI_Bridge::normalize_design( (string) ( $styling['forminatorDesign'] ?? 'default' ) );
				if ( isset( $form['formType'] ) && 'multi' === (string) $form['formType'] ) {
					self::$forminator_multi_on_page = true;
				}
				break;
			}
		}
	}

	/**
	 * Runs on 'wp' hook (before wp_enqueue_scripts) to detect shortcodes inside popup content.
	 * If found, marks $did_render = true so form assets are enqueued.
	 *
	 * @return void
	 */
	public function pre_check_popup_shortcodes(): void {
		$popups = get_option( self::POPUPS_OPTION_KEY, array() );
		if ( ! is_array( $popups ) || empty( $popups ) ) {
			return;
		}
		foreach ( $popups as $popup ) {
			$content = isset( $popup['content'] ) ? (string) $popup['content'] : '';
			if ( strpos( $content, '[' ) !== false ) {
				self::$did_render = true;
				break;
			}
		}
		if ( self::$did_render ) {
			return;
		}

		/* Global “form for auto popup” prepends a shortcode for timer/scroll/exit popups — enqueue form assets. */
		$general = get_option( self::GENERAL_SETTINGS_OPTION_KEY, array() );
		$auto_on = is_array( $general ) ? (bool) ( $general['enableAutoPopup'] ?? false ) : false;
		$form_ids = is_array( $general ) ? $this->get_auto_popup_default_form_ids( $general ) : array();
		if ( $auto_on && ! empty( $form_ids ) ) {
			foreach ( $popups as $popup ) {
				if ( is_array( $popup ) && $this->popup_raw_has_auto_trigger( $popup ) ) {
					self::$did_render = true;
					break;
				}
			}
		}
		if ( self::$did_render ) {
			return;
		}

		/* Livechat inline popup may embed shortcodes without rendering the overlay duplicate. */
		$ref = $this->get_livechat_inline_popup_ref();
		if ( '' === $ref ) {
			return;
		}
		$p = $this->find_popup_by_event_or_id( $ref );
		if ( is_array( $p ) ) {
			$c = isset( $p['content'] ) ? (string) $p['content'] : '';
			if ( strpos( $c, '[' ) !== false ) {
				self::$did_render = true;
			}
		}
	}

	/**
	 * Formerly enqueued popup overlay CSS via wp_add_inline_style.
	 * Registers handles used by {@see render_popups()} and {@see render_livechat_widget()}.
	 *
	 * @return void
	 */
	public function enqueue_popup_styles(): void {
		wp_register_style( 'nexulesuite_popup-overlay', false, array(), nexulesuite_VERSION );
		wp_register_script( 'nexulesuite_popup-overlay', false, array(), nexulesuite_VERSION, true );
		wp_register_style( 'nexulesuite_livechat-widget', false, array(), nexulesuite_VERSION );
		wp_register_script( 'nexulesuite_livechat-widget', false, array(), nexulesuite_VERSION, true );
	}

	/**
	 * Renders all popups as hidden HTML modals in wp_footer.
	 * Outputs scoped CSS inline, processes shortcodes, and attaches a self-contained
	 * JS runtime that honours each popup's trigger rules (timer / scroll / exit / click).
	 *
	 * @return void
	 */
	public function render_popups(): void {
		$popups = get_option( self::POPUPS_OPTION_KEY, array() );
		if ( ! is_array( $popups ) || empty( $popups ) ) {
			return;
		}

		$popups = $this->filter_popups_for_current_request( $popups );
		if ( empty( $popups ) ) {
			return;
		}

		/* Read the global "Enable Auto Popup" setting.
		 * When false, timer / scroll / exit-intent triggers are suppressed;
		 * only Manual Click (data-nexulesuite_trigger button) still works. */
		$general       = get_option( self::GENERAL_SETTINGS_OPTION_KEY, array() );
		$auto_popup_on   = is_array( $general ) ? (bool) ( $general['enableAutoPopup'] ?? false ) : false;
		$auto_popup_forms = is_array( $general ) ? $this->get_auto_popup_default_form_ids( $general ) : array();

		require_once nexulesuite_PLUGIN_DIR . 'core/class-global-font.php';
		\nexulesuite_\Core\Global_Font::enqueue( 'nexulesuite_global-font' );
		$popup_font_stack = \nexulesuite_\Core\Global_Font::get_font_stack(
			\nexulesuite_\Core\Global_Font::get_saved_font()
		);

		/* ── Popup overlay CSS (wp_enqueue inline) ── */
		$popup_css = '/* Nexus Lead Suite – Popup Overlay */
		.nexulesuite_popup-overlay,.nexulesuite_popup-overlay .nexulesuite_popup,.nexulesuite_popup-overlay .nexulesuite_popup *{font-family:' . $popup_font_stack . '!important;}
		.nexulesuite_popup-overlay{display:none;position:fixed;inset:0;z-index:999999;align-items:center;justify-content:center;background:rgba(0,0,0,.55);padding:16px;overflow-y:auto;box-sizing:border-box;}
		.nexulesuite_popup-overlay.nexulesuite_popup--open{display:flex;}
		.nexulesuite_popup{position:relative;width:100%;overflow:visible;box-shadow:0 24px 80px rgba(0,0,0,.28);animation:nexulesuite_pop-in .22s ease;box-sizing:border-box;}
		@keyframes nexulesuite_pop-in{from{opacity:0;transform:translateY(20px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
		.nexulesuite_popup__close{position:absolute;top:10px;right:10px;display:flex;align-items:center;justify-content:center;border:none!important;cursor:pointer;line-height:1;z-index:2;border-radius:50%!important;padding:0!important;margin:0!important;box-sizing:border-box!important;min-width:0!important;min-height:0!important;aspect-ratio:1/1;flex:0 0 auto;box-shadow:none!important;transition:opacity .2s,transform .25s cubic-bezier(.34,1.56,.64,1);}
		.nexulesuite_popup__close:hover{opacity:.9;transform:rotate(90deg) scale(1.1);}
		.nexulesuite_popup__close:active{transform:rotate(90deg) scale(0.95);}
		.nexulesuite_popup__header{word-break:break-word;box-sizing:border-box;}
		.nexulesuite_popup__heading{margin:0;line-height:1.3;}
		.nexulesuite_popup__sub{margin-top:6px;opacity:.85;font-size:.875em;}
		.nexulesuite_popup__body{word-break:break-word;box-sizing:border-box;text-align:start;}
		.nexulesuite_popup__body *{max-width:100%;}
		.nexulesuite_popup-overlay .nexulesuite_popup__body .nexulesuite_st-form,
		.nexulesuite_popup__body .nexulesuite_st-form{border:none!important;box-shadow:none!important;outline:none!important;background:transparent!important;}
		.nexulesuite_popup-overlay .nexulesuite_popup__body .nexulesuite_st-form>form.nexulesuite_st-form__body,
		.nexulesuite_popup__body .nexulesuite_st-form>form.nexulesuite_st-form__body,
		.nexulesuite_popup__body form.nexulesuite_st-form__body{
			border:none!important;box-shadow:none!important;outline:none!important;background:transparent!important;
			padding:0!important;margin:0!important;border-radius:0!important;
		}
		.nexulesuite_popup-overlay.nexulesuite_popup-overlay--form-result .nexulesuite_popup__header,
		.nexulesuite_popup-overlay.nexulesuite_popup-overlay--form-result .nexulesuite_popup__close{display:none!important;}
		.nexulesuite_popup-overlay .nexulesuite_st-form .nexulesuite_st-actions{display:flex!important;flex-wrap:wrap!important;justify-content:center!important;gap:10px!important;box-sizing:border-box!important;}
		.nexulesuite_popup-overlay .nexulesuite_st-form .nexulesuite_st-actions .nexulesuite_st-btn{box-sizing:border-box!important;width:var(--nexulesuite_popup-form-btn-w,100%)!important;max-width:100%!important;flex:0 1 auto!important;min-width:0!important;}
		@media(max-width:480px){.nexulesuite_popup{border-radius:12px!important;}.nexulesuite_popup__header,.nexulesuite_popup__body{padding:18px!important;}}';
		$this->enqueue_footer_inline_style( 'nexulesuite_popup-overlay', $popup_css );

		/* ── Render each popup overlay ───────────────────────── */
		foreach ( $popups as $popup ) {
			if ( ! is_array( $popup ) ) {
				continue;
			}

			$popup_id   = isset( $popup['id'] ) ? sanitize_text_field( (string) $popup['id'] ) : '';
			$event_name = isset( $popup['eventName'] ) ? sanitize_text_field( (string) $popup['eventName'] ) : '';

			/* Manual click / menu trigger: prefer Event ID; otherwise popup UUID matches Menu dropdown fallback. */
			$trigger_key = '' !== $event_name ? $event_name : $popup_id;

			$heading    = isset( $popup['heading'] ) ? (string) $popup['heading'] : '';
			$sub        = isset( $popup['subHeading'] ) ? sanitize_text_field( (string) $popup['subHeading'] ) : '';
			$align      = isset( $popup['textAlign'] ) ? sanitize_text_field( (string) $popup['textAlign'] ) : 'left';
			$content    = isset( $popup['content'] ) ? (string) $popup['content'] : '';

			$style      = isset( $popup['style'] ) && is_array( $popup['style'] ) ? $popup['style'] : array();
			$width      = max( 240, min( 1200, (int) ( $style['width'] ?? 600 ) ) );
			$radius     = max( 0, min( 60, (int) ( $style['radius'] ?? 16 ) ) );
			$padding    = max( 0, min( 80, (int) ( $style['padding'] ?? 30 ) ) );
			$heading_bg = sanitize_hex_color( (string) ( $style['headingBgColor'] ?? '#1e3a8a' ) ) ?: '#1e3a8a';
			$heading_tc = sanitize_hex_color( (string) ( $style['headingTextColor'] ?? '#ffffff' ) ) ?: '#ffffff';
			$heading_fs = max( 12, min( 64, (int) ( $style['headingFontSize'] ?? 20 ) ) );
			$body_bg    = sanitize_hex_color( (string) ( $style['bodyBgColor'] ?? '#ffffff' ) ) ?: '#ffffff';
			$close_col  = sanitize_hex_color( (string) ( $style['closeIconColor'] ?? '#ffffff' ) ) ?: '#ffffff';
			$close_bg   = sanitize_hex_color( (string) ( $style['closeIconBg'] ?? '#ff4444' ) ) ?: '#ff4444';
			$close_size = max( 10, min( 48, (int) ( $style['closeIconSize'] ?? 20 ) ) );
			$btn_color  = sanitize_hex_color( (string) ( $style['buttonColor'] ?? '#2563eb' ) ) ?: '#2563eb';
			$btn_width  = max( 10, min( 100, (int) ( $style['buttonWidth'] ?? 100 ) ) );

			/* Sanitise trigger rules and serialize as JSON attribute. */
			$raw_logic = isset( $popup['logic'] ) && is_array( $popup['logic'] ) ? $popup['logic'] : array();
			$logic     = array();
			foreach ( $raw_logic as $rule ) {
				if ( ! is_array( $rule ) ) {
					continue;
				}
				$t = sanitize_text_field( (string) ( $rule['trigger'] ?? 'click' ) );
				if ( ! in_array( $t, array( 'click', 'timer', 'scroll', 'exit' ), true ) ) {
					$t = 'click';
				}
				$logic[] = array(
					'trigger'          => $t,
					'delay'            => max( 0, (int) ( $rule['delay'] ?? 0 ) ),
					'scrollPercentage' => max( 1, min( 100, (int) ( $rule['scrollPercentage'] ?? 50 ) ) ), // min 1 avoids "fire on load"
				);
			}
			if ( empty( $logic ) ) {
				$logic[] = array( 'trigger' => 'click', 'delay' => 0, 'scrollPercentage' => 50 );
			}
			$logic_json = wp_json_encode( $logic );

			/*
			 * Optional: prepend Settings → default Nexus forms (ordered list) only when Popup Body is completely empty.
			 * Any shortcode or HTML in the body wins exclusively — avoids duplicate prepends.
			 */
			$content_for_render = $content;
			if (
				$auto_popup_on
				&& ! empty( $auto_popup_forms )
				&& $this->popup_raw_has_auto_trigger( $popup )
				&& $this->popup_body_is_whitespace_only( $content )
			) {
				$prepend = '';
				foreach ( $auto_popup_forms as $fid ) {
					$fid = sanitize_text_field( (string) $fid );
					if ( '' === $fid ) {
						continue;
					}
					$prep_form = $this->get_form_by_id( $fid );
					if ( ! is_array( $prep_form ) || ! $this->is_form_published_for_frontend( $prep_form ) ) {
						continue;
					}
					$prepend .= sprintf( '[nexulesuite_form id="%s"]', esc_attr( $fid ) ) . "\n\n";
				}
				$content_for_render = $prepend . $content_for_render;
			}

			/* Render shortcodes so embedded forms display correctly (second pass for nested). */
			$body_for_codes   = $this->sanitize_popup_body_before_shortcode( $content_for_render );
			$rendered_content = \nexulesuite_\expand_popup_body_shortcodes( $body_for_codes );

			$overlay_css_vars = sprintf(
				'--nexulesuite_popup-form-btn-w:%d%%;--nexulesuite_popup-form-btn:%s;',
				$btn_width,
				$btn_color
			);

			printf(
				'<div class="nexulesuite_popup-overlay" id="nexulesuite_pop-%s" style="%s" data-popup-id="%s" data-event="%s" data-logic="%s" aria-hidden="true" aria-modal="true" role="dialog">',
				esc_attr( $popup_id ),
				esc_attr( $overlay_css_vars ),
				esc_attr( $popup_id ),
				esc_attr( $trigger_key ),
				esc_attr( $logic_json )
			);

			printf(
				'<div class="nexulesuite_popup" style="max-width:%dpx;border-radius:%dpx;">',
				absint( $width ),
				absint( $radius )
			);

			/* Close button */
			printf(
				'<button type="button" class="nexulesuite_popup__close" aria-label="%s" style="background:%s;color:%s;width:%dpx;height:%dpx;font-size:%dpx;">&#x2715;</button>',
				esc_attr__( 'Close', 'nexus-lead-suite' ),
				esc_attr( $close_bg ),
				esc_attr( $close_col ),
				absint( $close_size + 10 ),
				absint( $close_size + 10 ),
				absint( $close_size )
			);

			/* Header */
			printf(
				'<div class="nexulesuite_popup__header" style="background:%s;color:%s;padding:%dpx;text-align:%s;">',
				esc_attr( $heading_bg ),
				esc_attr( $heading_tc ),
				absint( $padding ),
				esc_attr( $align )
			);
			printf( '<div class="nexulesuite_popup__heading" style="font-size:%dpx;">', absint( $heading_fs ) );
			// Convert legacy <font color="..."> tags to <span style="color:..."> so inline-style
			// specificity [1,0,0,0] always beats any theme CSS color rules.
			$heading_html = preg_replace_callback(
				'/<font\b([^>]*)>/i',
				static function ( $m ) {
					$attrs      = $m[1];
					$style_bits = array();
					if ( preg_match( '/\bcolor=["\']?([^"\'> ]+)["\']?/i', $attrs, $c ) ) {
						$style_bits[] = 'color:' . esc_attr( $c[1] );
					}
					if ( preg_match( '/\bsize=["\']?([^"\'> ]+)["\']?/i', $attrs, $s ) ) {
						$style_bits[] = 'font-size:' . esc_attr( $s[1] );
					}
					// face="" is intentionally dropped — global font applies via popup CSS.
					return '<span' . ( $style_bits ? ' style="' . implode( ';', $style_bits ) . '"' : '' ) . '>';
				},
				wp_kses_post( $heading )
			);
			$heading_html = str_ireplace( '</font>', '</span>', (string) $heading_html );
			// Strip TinyMCE inline font-family so Settings → globalFont wins (livechat uses explicit stack).
			$heading_html = preg_replace( '/\s*font-family\s*:\s*[^;"\']+(!important)?\s*;?/i', '', (string) $heading_html );
			echo wp_kses_post( $heading_html );
			echo '</div>';
			if ( '' !== $sub ) {
				echo '<div class="nexulesuite_popup__sub">' . esc_html( $sub ) . '</div>';
			}
			echo '</div>';

			/* Body */
			/* Body: do not set text-align — it would inherit into embedded forms (labels/placeholders). */
			printf(
				'<div class="nexulesuite_popup__body" style="background:%s;padding:%dpx;--nexulesuite_popup-body-bg:%s;">',
				esc_attr( $body_bg ),
				absint( $padding ),
				esc_attr( $body_bg )
			);
			echo wp_kses( $rendered_content, self::allowed_embed_html() );
			echo '</div>';

			echo '</div>'; // .nexulesuite_popup
			echo '</div>'; // .nexulesuite_popup-overlay
		}

		/* ── Inline JS runtime ─────────────────────────────────
		 * Runs after all popup HTML is in the DOM (wp_footer priority 15).
		 * Wraps in a readyState guard so it works even if the browser
		 * hasn't fully parsed the document yet.
		 * ─────────────────────────────────────────────────────── */
		ob_start();
		?>
		(function(){
			'use strict';

			/* PHP-injected: when false, auto triggers (timer/scroll/exit) are blocked. */
			var nexulesuite_AutoPopupEnabled = <?php echo wp_json_encode( (bool) $auto_popup_on ); ?>;

			function nexulesuite_InitPopups(){

				/* Reset form result UI when closing popup (ESC, backdrop, X). */
				window.nexulesuite_ResetPopupFormResult = function(overlay){
					if(!overlay||!overlay.classList||!overlay.classList.contains('nexulesuite_popup-overlay')) return;
					overlay.classList.remove('nexulesuite_popup-overlay--form-result');
					var roots = overlay.querySelectorAll('.nexulesuite_st-form');
					roots.forEach(function(root){
						root.classList.remove('nexulesuite_st-form--sent');
						root.querySelectorAll('.nexulesuite_st-form-result-card').forEach(function(node){
							if(node.parentNode){ node.parentNode.removeChild(node); }
						});
					});
				};

				/* ── open / close (shared with site-wide bridge script) ── */
				function openPopup(el, autoTrigger){
					if(window.nexulesuite_PopupUi&&typeof window.nexulesuite_PopupUi.open==='function'){
						if(autoTrigger){
							window.nexulesuite_PopupUi.open(el,{source:'auto',autoTrigger:autoTrigger});
						}else{
							window.nexulesuite_PopupUi.open(el);
						}
						return;
					}
					if(el.classList.contains('nexulesuite_popup--open')) return;
					el.classList.add('nexulesuite_popup--open');
					el.setAttribute('aria-hidden','false');
					document.body.style.overflow='hidden';
				}
				function closePopup(el){
					if(window.nexulesuite_PopupUi&&typeof window.nexulesuite_PopupUi.close==='function'){
						window.nexulesuite_PopupUi.close(el);
						return;
					}
					el.classList.remove('nexulesuite_popup--open');
					el.setAttribute('aria-hidden','true');
					document.body.style.overflow='';
					if(typeof window.nexulesuite_ResetPopupFormResult==='function'){ window.nexulesuite_ResetPopupFormResult(el); }
				}

				/* ── attach triggers to every overlay ─────────── */
				var overlays = document.querySelectorAll('.nexulesuite_popup-overlay');
				overlays.forEach(function(overlay){

					/* close on backdrop click */
					overlay.addEventListener('click',function(e){
						if(e.target===overlay){ closePopup(overlay); }
					});

					/* close button */
					var closeBtn = overlay.querySelector('.nexulesuite_popup__close');
					if(closeBtn){
						closeBtn.addEventListener('click',function(){ closePopup(overlay); });
					}

					/* parse trigger rules — getAttribute avoids rare dataset/HTML entity edge cases */
					var logicRaw = overlay.getAttribute('data-logic');
					var rules=[];
					try{ rules = logicRaw ? JSON.parse(logicRaw) : []; }catch(err){ rules=[]; }

					rules.forEach(function(rule){
						var type  = (rule.trigger||'click');
						var delay = Math.max(0, parseInt(rule.delay||'0',10));
						var pct   = Math.max(1, Math.min(100, parseInt(rule.scrollPercentage||'50',10)));

						/* ── Time Delay trigger ──────────────────── */
						if(type==='timer'){
							/* Blocked when Enable Auto Popup is OFF in Settings */
							if(!nexulesuite_AutoPopupEnabled) return;
							setTimeout(function(){ openPopup(overlay,'timer'); }, delay * 1000);

						/* ── Scroll Depth trigger ────────────────── */
						} else if(type==='scroll'){
							/* Blocked when Enable Auto Popup is OFF in Settings */
							if(!nexulesuite_AutoPopupEnabled) return;
							(function(){
								var fired=false;
								function onScroll(){
									if(fired) return;
									var scrolled = window.scrollY || window.pageYOffset || 0;
									var total    = Math.max(1, document.body.scrollHeight - window.innerHeight);
									if((scrolled / total) * 100 >= pct){
										fired=true;
										window.removeEventListener('scroll', onScroll);
										openPopup(overlay,'scroll');
									}
								}
								window.addEventListener('scroll', onScroll, {passive:true});
							})();

						/* ── Exit Intent trigger ─────────────────── */
						} else if(type==='exit'){
							/* Blocked when Enable Auto Popup is OFF in Settings */
							if(!nexulesuite_AutoPopupEnabled) return;
							(function(){
								var fired=false;
								function onLeave(e){
									if(fired) return;
									if((e.clientY||0) <= 0){
										fired=true;
										if(document.documentElement){
											document.documentElement.removeEventListener('mouseleave', onLeave);
										}
										openPopup(overlay,'exit');
									}
								}
								if(document.documentElement){
									document.documentElement.addEventListener('mouseleave', onLeave);
								}
							})();
						}
						/* type==='click' → site-wide delegate in nexus-ls-popup-bridge.js */
					});
				});

				/* ── ESC key ─────────────────────────────────── */
				document.addEventListener('keydown',function(e){
					if(e.key==='Escape'){
						overlays.forEach(function(o){ closePopup(o); });
					}
				});
			}

			/* Run immediately if DOM is ready, otherwise wait. */
			if(document.readyState==='loading'){
				document.addEventListener('DOMContentLoaded', nexulesuite_InitPopups);
			} else {
				nexulesuite_InitPopups();
			}
		})();
		<?php
		$popup_js = (string) ob_get_clean();
		$this->enqueue_footer_inline_script( 'nexulesuite_popup-overlay', $popup_js );
	}

	/**
	 * Enqueues the Google Font selected in Settings and injects the CSS variable globally.
	 * Runs on every frontend page so popups, menu items, forms, and reports all inherit the font.
	 *
	 * @return void
	 */
	public function enqueue_global_font(): void {
		require_once nexulesuite_PLUGIN_DIR . 'core/class-global-font.php';
		\nexulesuite_\Core\Global_Font::enqueue( 'nexulesuite_global-font' );
	}

	/**
	 * Enqueues sticky bottom navigation CSS (globally, on every frontend page).
	 * Actual visibility is controlled by CSS media query (mobile/tablet only).
	 *
	 * @return void
	 */
	/**
	 * Returns popups whose display conditions match the current request.
	 *
	 * @param array<int,mixed> $popups Stored popups.
	 * @return array<int,array<string,mixed>>
	 */
	private function filter_popups_for_current_request( array $popups ): array {
		require_once nexulesuite_PLUGIN_DIR . 'core/class-menu-group-resolver.php';

		$resolver = new \nexulesuite_\Core\Menu_Group_Resolver();
		$out      = array();

		foreach ( $popups as $popup ) {
			if ( ! is_array( $popup ) ) {
				continue;
			}

			$conditions = isset( $popup['conditions'] ) && is_array( $popup['conditions'] )
				? $popup['conditions']
				: array();
			$rules      = isset( $conditions['rules'] ) && is_array( $conditions['rules'] )
				? $conditions['rules']
				: array();

			// Legacy popups without conditions: show on all pages (previous behaviour).
			if ( count( $rules ) === 0 ) {
				$out[] = $popup;
				continue;
			}

			if ( $resolver->group_matches( $conditions ) ) {
				$out[] = $popup;
			}
		}

		return $out;
	}

	/**
	 * Reads menu items payload from option (grouped format with legacy migration).
	 *
	 * @return array{ groups: array<int,mixed>, globalFontSize: int }
	 */
	private function get_menu_items_payload(): array {
		require_once nexulesuite_PLUGIN_DIR . 'core/class-menu-items-payload.php';

		$stored = get_option( self::MENU_ITEMS_OPTION_KEY, array() );
		return \nexulesuite_\Core\Menu_Items_Payload::normalize_stored( $stored );
	}

	/**
	 * Resolves buttons visible on the current front-end request.
	 *
	 * @return array<int,array<string,mixed>>
	 */
	private function get_active_menu_buttons(): array {
		require_once nexulesuite_PLUGIN_DIR . 'core/class-menu-group-resolver.php';

		$payload = $this->get_menu_items_payload();
		$groups  = isset( $payload['groups'] ) && is_array( $payload['groups'] )
			? $payload['groups']
			: array();

		$resolver = new \nexulesuite_\Core\Menu_Group_Resolver();
		return $resolver->get_buttons_for_request( $groups );
	}

	public function enqueue_bottom_nav_styles(): void {
		$opt = get_option( self::GENERAL_SETTINGS_OPTION_KEY, array() );
		if ( ! is_array( $opt ) || empty( $opt['enableNavigation'] ) ) {
			return;
		}

		$payload    = $this->get_menu_items_payload();
		$items      = $this->get_active_menu_buttons();
		$global_fs  = (int) $payload['globalFontSize'];
		if ( count( $items ) === 0 ) {
			return;
		}

		// Register a dummy handle so we can attach inline CSS cleanly.
		wp_register_style( 'nexulesuite_bottom-nav', false, array(), nexulesuite_VERSION ); // phpcs:ignore WordPress.WP.EnqueuedResourceParameters.MissingVersion
		wp_enqueue_style( 'nexulesuite_bottom-nav' );

		$css = '
/* Nexus Bottom Navigation Bar (mobile + tablet only) */
.nexulesuite_bottom-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 999990;
  background: #ffffff;
  border-top: 1px solid rgba(0,0,0,0.10);
  box-shadow: 0 -4px 24px rgba(0,0,0,0.10);
  padding: 8px 12px;
  padding-bottom: max(8px, env(safe-area-inset-bottom));
}
@media (max-width: 1023px) {
  .nexulesuite_bottom-nav { display: block; }
}
.nexulesuite_bottom-nav__inner {
  container-type: inline-size;
  --nexulesuite_nav-gap: 4px;
  --nexulesuite_nav-fs-min: 10px;
  --nexulesuite_nav-fs-max: ' . $global_fs . 'px;
  /* 280px viewport − 12px padding each side */
  --nexulesuite_nav-inner-min: 256px;
  --nexulesuite_nav-inner-max: 700px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: var(--nexulesuite_nav-gap);
  justify-content: flex-start;
  align-items: stretch;
  width: 100%;
  max-width: 100%;
}
.nexulesuite_bottom-nav__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35em;
  text-decoration: none !important;
  font-weight: 600;
  box-sizing: border-box;
  cursor: pointer;
  text-align: center;
  line-height: 1.2;
  white-space: nowrap;
  overflow: visible;
  font-size: clamp(
    var(--nexulesuite_nav-fs-min),
    calc(
      var(--nexulesuite_nav-fs-min)
      + (100cqw - var(--nexulesuite_nav-inner-min))
      * (var(--nexulesuite_nav-fs-max) - var(--nexulesuite_nav-fs-min))
      / (var(--nexulesuite_nav-inner-max) - var(--nexulesuite_nav-inner-min))
    ),
    var(--nexulesuite_nav-fs-max)
  );
  transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease, opacity 0.18s ease;
}
/* Inline: grow to fill each row; wrap only when content no longer fits */
.nexulesuite_bottom-nav__btn--inline {
  flex: 1 1 0%;
  min-width: max-content;
  max-width: 100%;
}
.nexulesuite_bottom-nav__btn--inline span {
  overflow: visible;
}
/* Block: always own full-width row */
.nexulesuite_bottom-nav__btn--block {
  flex: 0 0 100%;
  width: 100%;
  max-width: 100%;
}
.nexulesuite_bottom-nav__btn svg {
  flex-shrink: 0;
  width: 1.2em;
  height: 1.2em;
}
.nexulesuite_bottom-nav__btn--lift:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.18); }
.nexulesuite_bottom-nav__btn--scale:hover { transform: scale(1.05); }
.nexulesuite_bottom-nav__btn--glow:hover { box-shadow: 0 0 20px rgba(99,102,241,0.55); }
.nexulesuite_bottom-nav__btn--darken:hover { filter: brightness(0.88); }
.nexulesuite_bottom-nav__btn--shake:hover { animation: nexulesuite_nav-shake 0.4s ease; }
.nexulesuite_bottom-nav__btn--rotate:hover { transform: rotate(3deg); }
@keyframes nexulesuite_nav-shake {
  0%,100% { transform: translateX(0); }
  20% { transform: translateX(-4px); }
  40% { transform: translateX(4px); }
  60% { transform: translateX(-3px); }
  80% { transform: translateX(3px); }
}
';
		wp_add_inline_style( 'nexulesuite_bottom-nav', $css );
	}

	/**
	 * Renders the sticky bottom navigation bar in wp_footer.
	 * Only outputs HTML if enableNavigation is on and menu items exist.
	 *
	 * @return void
	 */
	public function render_bottom_nav(): void {
		$opt = get_option( self::GENERAL_SETTINGS_OPTION_KEY, array() );
		if ( ! is_array( $opt ) || empty( $opt['enableNavigation'] ) ) {
			return;
		}

		$payload    = $this->get_menu_items_payload();
		$items      = $this->get_active_menu_buttons();
		if ( count( $items ) === 0 ) {
			return;
		}

		echo '<nav class="nexulesuite_bottom-nav nexulesuite_menu-widget" aria-label="' . esc_attr__( 'Site Navigation', 'nexus-lead-suite' ) . '">';
		echo '<div class="nexulesuite_bottom-nav__inner">';

		foreach ( $items as $idx => $btn ) {
			if ( ! is_array( $btn ) ) {
				continue;
			}

			$label        = isset( $btn['label'] ) ? sanitize_text_field( (string) $btn['label'] ) : '';
			$url_raw      = isset( $btn['url'] ) ? trim( (string) $btn['url'] ) : '';
			$icon_key     = isset( $btn['icon'] ) ? sanitize_text_field( (string) $btn['icon'] ) : 'none';
			$css_id       = isset( $btn['cssId'] ) ? sanitize_html_class( (string) $btn['cssId'] ) : '';
			$css_class    = isset( $btn['cssClass'] ) ? sanitize_text_field( (string) $btn['cssClass'] ) : '';
			$hover_effect = isset( $btn['style']['hoverEffect'] ) ? sanitize_text_field( (string) $btn['style']['hoverEffect'] ) : 'none';
			$bg           = isset( $btn['style']['bg'] ) ? sanitize_hex_color( (string) $btn['style']['bg'] ) : '#2563eb';
			$text_color   = isset( $btn['style']['text'] ) ? sanitize_hex_color( (string) $btn['style']['text'] ) : '#ffffff';
			$pad_v        = isset( $btn['style']['paddingVertical'] ) ? (int) $btn['style']['paddingVertical'] : 12;
			$pad_h        = isset( $btn['style']['paddingHorizontal'] ) ? (int) $btn['style']['paddingHorizontal'] : 24;
			$radius       = isset( $btn['style']['radius'] ) ? (int) $btn['style']['radius'] : 8;
			$pad_v        = max( 0, min( 80, $pad_v ) );
			$pad_h        = max( 0, min( 120, $pad_h ) );
			$radius       = max( 0, min( 80, $radius ) );
			$display_mode = isset( $btn['displayMode'] ) ? sanitize_text_field( (string) $btn['displayMode'] ) : 'inline';
			if ( ! in_array( $display_mode, array( 'inline', 'block' ), true ) ) {
				$display_mode = 'inline';
			}
			$mode_class = 'block' === $display_mode ? ' nexulesuite_bottom-nav__btn--block' : ' nexulesuite_bottom-nav__btn--inline';

			$allowed_effects = array( 'lift', 'scale', 'glow', 'darken', 'shake', 'rotate' );
			$hover_class     = in_array( $hover_effect, $allowed_effects, true ) ? ' nexulesuite_bottom-nav__btn--' . $hover_effect : '';

			$inline_style = sprintf(
				'background-color:%s;color:%s;padding:%dpx %dpx;border-radius:%dpx;',
				esc_attr( $bg ?: '#2563eb' ),
				esc_attr( $text_color ?: '#ffffff' ),
				$pad_v,
				$pad_h,
				$radius
			);

			$event_name = isset( $btn['eventName'] ) ? trim( sanitize_text_field( (string) $btn['eventName'] ) ) : '';
			if ( '' === $event_name && '' !== $url_raw && str_starts_with( $url_raw, 'popup:' ) ) {
				$event_name = sanitize_text_field( substr( $url_raw, 6 ) );
			}

			$btn_row_id = isset( $btn['id'] ) ? sanitize_key( (string) $btn['id'] ) : '';
			if ( '' === $btn_row_id ) {
				$btn_row_id = 'item-' . (string) (int) $idx;
			}
			$notify_label = '' !== $label
				? $label
				: __( 'Menu item', 'nexus-lead-suite' );
			$trigger_first = '' !== $event_name ? $event_name : ( 'nav-' . $btn_row_id );
			$trigger_attr    = ' data-nexulesuite_trigger="' . esc_attr( $trigger_first . ',' . $notify_label ) . '"';

			/*
			 * esc_url() strips non-allowed schemes; "popup:id" becomes "" and breaks <a href=""> click handling.
			 * Any manual popup trigger uses a safe hash href so the bridge can intercept reliably.
			 */
			$href_attr = '#';
			if ( '' === $event_name && ! str_starts_with( $url_raw, 'popup:' ) ) {
				$href_attr = esc_url( $url_raw );
				if ( '' === $href_attr ) {
					$href_attr = '#';
				}
			}

			$nav_btn_open = sprintf(
				'<a href="%s"%s%s class="nexulesuite_bottom-nav__btn%s%s%s" style="%s">',
				esc_url( $href_attr ),
				$css_id ? ' id="' . esc_attr( $css_id ) . '"' : '',
				$trigger_attr,
				esc_attr( $mode_class ),
				esc_attr( $hover_class ),
				$css_class ? ' ' . esc_attr( $css_class ) : '',
				esc_attr( $inline_style )
			);
			echo wp_kses( $nav_btn_open, \nexulesuite_\allowed_form_html() );

			$svg = $this->get_nav_icon_svg( $icon_key );
			if ( '' !== $svg ) {
				echo wp_kses( $svg, \nexulesuite_\allowed_form_html() );
			}

			if ( '' !== $label ) {
				echo '<span>' . esc_html( $label ) . '</span>';
			}

			echo '</a>';
		}

		echo '</div>';
		echo '</nav>';
	}

	/**
	 * Returns a safe inline SVG string for a given icon key.
	 * All SVGs are hardcoded — not from user input.
	 *
	 * @param string $key Icon key.
	 * @return string
	 */
	private function get_nav_icon_svg( string $key ): string {
		$icons = array(
			'call'        => '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h2.28a1 1 0 01.95.68l1.06 3.18a1 1 0 01-.23 1.05l-1.38 1.38a16.06 16.06 0 006.93 6.93l1.38-1.38a1 1 0 011.05-.23l3.18 1.06A1 1 0 0121 16.72V19a2 2 0 01-2 2h-1C9.16 21 3 14.84 3 7V5z"/></svg>',
			'mail'        => '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>',
			'message'     => '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 16c0 1.1-.9 2-2 2H7l-4 4V6a2 2 0 012-2h14a2 2 0 012 2v10z"/></svg>',
			'location'    => '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1112 6.5a2.5 2.5 0 010 5z"/></svg>',
			'appointment' => '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
			'download'    => '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3"/></svg>',
			'popup'       => '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/></svg>',
			'cta'         => '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M15 15l-6 6m0 0l-3-9 9-3-6 6z"/></svg>',
			'event'       => '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>',
			'arrow'       => '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>',
		);

		return $icons[ $key ] ?? '';
	}

	/**
	 * Enqueues frontend assets only when shortcode is used.
	 *
	 * @return void
	 */
	public function enqueue_assets(): void {
		if ( ! self::$did_render ) {
			return;
		}

		$js_path  = nexulesuite_PLUGIN_DIR . 'public/js/forms-runtime.js';
		$css_path = nexulesuite_PLUGIN_DIR . 'public/css/forms-runtime.css';
		$js_ver   = file_exists( $js_path ) ? (string) filemtime( $js_path ) : nexulesuite_VERSION;
		$css_ver  = file_exists( $css_path ) ? (string) filemtime( $css_path ) : nexulesuite_VERSION;

		$rec       = $this->get_recaptcha_integration_settings();
		$ts_keys   = $this->get_saved_captcha_keys( self::TURNSTILE_OPTION_KEY );
		$rec_site  = $rec['siteKey'];
		$ts_site   = $ts_keys['siteKey'];

		$script_deps = array();

		if ( '' !== $rec_site ) {
			$recaptcha_js_url = ( 'v3' === $rec['apiVersion'] )
				? 'https://www.google.com/recaptcha/api.js?render=' . rawurlencode( $rec_site )
				: 'https://www.google.com/recaptcha/api.js?render=explicit';
			wp_register_script( 'nexulesuite_recaptcha', false, array(), nexulesuite_VERSION, true );
			wp_enqueue_script( 'nexulesuite_recaptcha' );
			add_filter(
				'script_loader_src',
				static function ( $src, $handle ) use ( $recaptcha_js_url ) {
					if ( 'nexulesuite_recaptcha' === $handle ) {
						return $recaptcha_js_url;
					}
					return $src;
				},
				10,
				2
			);
			wp_script_add_data( 'nexulesuite_recaptcha', 'strategy', 'defer' );
			$script_deps[] = 'nexulesuite_recaptcha';
		}

		if ( '' !== $ts_site ) {
			wp_register_script( 'nexulesuite_turnstile', false, array(), nexulesuite_VERSION, true );
			wp_enqueue_script( 'nexulesuite_turnstile' );
			add_filter(
				'script_loader_src',
				static function ( $src, $handle ) {
					if ( 'nexulesuite_turnstile' === $handle ) {
						// phpcs:ignore PluginCheck.CodeAnalysis.Offloading.OffloadedContent -- Cloudflare Turnstile widget script must be served from the provider to function; it is an opt-in, disclosed External Service and cannot be self-hosted.
						return 'https://challenges.cloudflare.com/turnstile/v0/api.js';
					}
					return $src;
				},
				10,
				2
			);
			wp_script_add_data( 'nexulesuite_turnstile', 'strategy', 'defer' );
			$script_deps[] = 'nexulesuite_turnstile';
		}

		wp_enqueue_style(
			'nexulesuite_forms-runtime',
			esc_url( nexulesuite_PLUGIN_URL . 'public/css/forms-runtime.css' ),
			array(),
			$css_ver
		);

		wp_enqueue_script(
			'nexulesuite_forms-runtime',
			esc_url( nexulesuite_PLUGIN_URL . 'public/js/forms-runtime.js' ),
			$script_deps,
			$js_ver,
			true
		);

		wp_localize_script(
			'nexulesuite_forms-runtime',
			'nexulesuite_Forms',
			array(
				'ajaxUrl'             => esc_url_raw( admin_url( 'admin-ajax.php' ) ),
				'action'              => 'nexulesuite_submit_form',
				'thankYouMessage'     => __(
					"Thanks for reaching out! We've received your request and are reviewing your details. We will follow up soon to confirm your insurance and finalize your appointment.\n\nNeed help right away? Please call us during our office hours. For all medical emergencies, please call 911 immediately.",
					'nexus-lead-suite'
				),
				'smtpSetupMessage'    => __( 'Please set up your SMTP properly.', 'nexus-lead-suite' ),
				'resultSuccessTitle'  => __( 'Success!', 'nexus-lead-suite' ),
				'resultErrorTitle'    => __( 'Error!', 'nexus-lead-suite' ),
				'dismissLabel'           => __( 'Dismiss', 'nexus-lead-suite' ),
				'recaptchaSiteKey'       => $rec_site,
				'recaptchaApiVersion'    => $rec['apiVersion'],
				'recaptchaV3Action'      => self::RECAPTCHA_V3_ACTION,
				'recaptchaV3FailMessage' => __( 'Security check could not be completed. Please reload the page and try again.', 'nexus-lead-suite' ),
				'turnstileSiteKey'       => $ts_site,
			)
		);

		$designs = array_values( array_unique( array_filter( self::$forminator_design_queue ) ) );
		if ( array() === $designs ) {
			$designs = array( 'default' );
		}
		Forminator_UI_Bridge::enqueue( $designs, self::$forminator_multi_on_page );
	}

	/**
	 * Front-end behaviour tracker (scroll %, exit intent, clicks); loads before popup runtime.
	 *
	 * @return void
	 */
	public function enqueue_activity_tracker(): void {
		if ( is_admin() ) {
			return;
		}

		$utils_path = nexulesuite_PLUGIN_DIR . 'public/js/nexus-ls-track-utils.js';
		if ( file_exists( $utils_path ) ) {
			wp_enqueue_script(
				'nexulesuite_track-utils',
				esc_url( nexulesuite_PLUGIN_URL . 'public/js/nexus-ls-track-utils.js' ),
				array(),
				(string) filemtime( $utils_path ),
				true
			);
		}

		$bridge_path = nexulesuite_PLUGIN_DIR . 'public/js/nexus-ls-popup-bridge.js';
		if ( file_exists( $bridge_path ) ) {
			$general = get_option( self::GENERAL_SETTINGS_OPTION_KEY, array() );
			$raw_map = is_array( $general ) ? (string) ( $general['activityButtonClasses'] ?? '' ) : '';
			$pair_maps = $this->parse_activity_button_classes_to_pair_maps( $raw_map );

			$bver = (string) filemtime( $bridge_path );
			wp_enqueue_script(
				'nexulesuite_popup-bridge',
				esc_url( nexulesuite_PLUGIN_URL . 'public/js/nexus-ls-popup-bridge.js' ),
				file_exists( $utils_path ) ? array( 'nexulesuite_track-utils' ) : array(),
				$bver,
				true
			);
			wp_localize_script(
				'nexulesuite_popup-bridge',
				'nexulesuite_PopupBridgeCfg',
				array(
					'ajaxUrl'     => esc_url_raw( admin_url( 'admin-ajax.php' ) ),
					'notifyNonce' => wp_create_nonce( 'nexulesuite_trigger_notify' ),
					'popupClassMap'  => $pair_maps['popup'] ?? array(),
					'notifyClassMap' => $pair_maps['notify'] ?? array(),
				)
			);
		}

		$path = nexulesuite_PLUGIN_DIR . 'public/js/nexus-ls-tracker.js';
		if ( ! file_exists( $path ) ) {
			return;
		}

		$ver = (string) filemtime( $path );
		$tracker_deps = array();
		if ( file_exists( $utils_path ) ) {
			$tracker_deps[] = 'nexulesuite_track-utils';
		}
		if ( file_exists( $bridge_path ) ) {
			$tracker_deps[] = 'nexulesuite_popup-bridge';
		}

		wp_enqueue_script(
			'nexulesuite_activity-tracker',
			esc_url( nexulesuite_PLUGIN_URL . 'public/js/nexus-ls-tracker.js' ),
			$tracker_deps,
			$ver,
			true
		);

		wp_localize_script(
			'nexulesuite_activity-tracker',
			'nexulesuite_TrackCfg',
			array(
				'endpoint'    => esc_url_raw( rest_url( 'nexulesuite_/v1/track/events' ) ),
				'nonce'       => wp_create_nonce( 'nexulesuite_track' ),
				// Logged-in visitors need wp_rest nonce header or WP returns 403 before our callback.
				'restNonce'   => wp_create_nonce( 'wp_rest' ),
				'scrollMarks' => array( 25, 50, 75, 90, 100 ),
			)
		);
	}

	/**
	 * Parses Settings → Button Classes into popup + notify class maps.
	 *
	 * Input format (per line): eventId | class-1, class-2
	 *
	 * - One class (e.g. ldd | ldd-alert) => notify/mail only.
	 * - Two or more => first popup, rest notify.
	 * - Prefixes: popup:classname (popup only), mail: or notify:classname (notify only).
	 *
	 * @param string $raw Raw textarea.
	 * @return array{popup: array<string,string>, notify: array<string,string>}
	 */
	private function parse_activity_button_classes_to_pair_maps( string $raw ): array {
		$raw = (string) $raw;
		if ( '' === trim( $raw ) ) {
			return array( 'popup' => array(), 'notify' => array() );
		}

		$lines = preg_split( '/\r\n|\r|\n/', $raw );
		if ( ! is_array( $lines ) ) {
			return array();
		}

		$out = array();
		$out_popup  = array();
		$out_notify = array();
		foreach ( $lines as $line ) {
			$line = trim( (string) $line );
			if ( '' === $line ) {
				continue;
			}

			$parts = explode( '|', $line, 2 );
			$event = sanitize_text_field( (string) ( $parts[0] ?? '' ) );
			$event = trim( $event );
			if ( '' === $event ) {
				continue;
			}
			if ( str_starts_with( $event, 'popup:' ) ) {
				$event = trim( substr( $event, 6 ) );
			}
			if ( str_starts_with( $event, '#' ) ) {
				$event = trim( substr( $event, 1 ) );
			}
			if ( '' === $event ) {
				continue;
			}

			$classes_raw = isset( $parts[1] ) ? (string) $parts[1] : '';
			$classes_raw = trim( $classes_raw );
			if ( '' === $classes_raw ) {
				continue;
			}

			$classes = preg_split( '/,/', $classes_raw );
			if ( ! is_array( $classes ) ) {
				continue;
			}

			$clean_classes = array();
			foreach ( $classes as $cls ) {
				$cls = trim( sanitize_text_field( (string) $cls ) );
				if ( '' === $cls ) {
					continue;
				}
				// Basic class token guard (optional popup:/mail:/notify: prefix + 1–80 char name).
				if ( ! preg_match( '/^(?:(?:popup|mail|notify):)?[A-Za-z0-9_-]{1,80}$/', $cls ) ) {
					continue;
				}
				$clean_classes[] = $cls;
			}

			if ( empty( $clean_classes ) ) {
				continue;
			}

			$explicit_popup  = array();
			$explicit_notify = array();
			$auto_classes    = array();

			foreach ( $clean_classes as $cls ) {
				if ( str_starts_with( $cls, 'popup:' ) ) {
					$name = trim( substr( $cls, 6 ) );
					if ( '' !== $name ) {
						$explicit_popup[] = $name;
					}
					continue;
				}
				if ( str_starts_with( $cls, 'mail:' ) || str_starts_with( $cls, 'notify:' ) ) {
					$prefix_len = str_starts_with( $cls, 'mail:' ) ? 5 : 7;
					$name       = trim( substr( $cls, $prefix_len ) );
					if ( '' !== $name ) {
						$explicit_notify[] = $name;
					}
					continue;
				}
				$auto_classes[] = $cls;
			}

			$register_popup = static function ( string $class_name ) use ( $event, &$out_popup ): void {
				$out_popup[ $class_name ] = $event;
				$out_popup[ strtolower( $class_name ) ] = $event;
			};

			$register_notify = static function ( string $class_name ) use ( $event, &$out_notify ): void {
				$out_notify[ $class_name ] = $event;
				$out_notify[ strtolower( $class_name ) ] = $event;
			};

			foreach ( $explicit_popup as $popup_cls ) {
				$register_popup( $popup_cls );
			}
			foreach ( $explicit_notify as $notify_cls ) {
				$register_notify( $notify_cls );
			}

			/*
			 * Auto classes (no popup:/mail:/notify: prefix):
			 * - one class  => mail/notify trigger (e.g. ldd | ldd-alert on a tel: button)
			 * - two or more => first popup, remaining notify (legacy multi-class lines)
			 */
			$auto_count = count( $auto_classes );
			if ( 1 === $auto_count ) {
				$register_notify( $auto_classes[0] );
			} elseif ( $auto_count > 1 ) {
				$register_popup( $auto_classes[0] );
				foreach ( array_slice( $auto_classes, 1 ) as $notify_cls ) {
					$register_notify( $notify_cls );
				}
			}
		}

		return array(
			'popup'  => $out_popup,
			'notify' => $out_notify,
		);
	}

	/**
	 * Renders the form shortcode.
	 *
	 * @param array<string,mixed> $atts Attributes.
	 * @return string
	 */
	public function render_form_shortcode( $atts, $content = '', $tag = '' ): string {
		$sc_tag = is_string( $tag ) && '' !== $tag ? $tag : 'nexulesuite_form';
		$atts   = shortcode_atts(
			array(
				'id' => '',
			),
			is_array( $atts ) ? $atts : array(),
			$sc_tag
		);

		$form_id = sanitize_text_field( (string) ( $atts['id'] ?? '' ) );
		if ( '' === $form_id ) {
			return '';
		}

		$form = $this->get_form_by_id( $form_id );
		if ( ! is_array( $form ) ) {
			return '';
		}

		if ( ! $this->is_form_published_for_frontend( $form ) ) {
			return '';
		}

		$styling_q = isset( $form['styling'] ) && is_array( $form['styling'] ) ? $form['styling'] : array();
		self::$forminator_design_queue[] = Forminator_UI_Bridge::normalize_design( (string) ( $styling_q['forminatorDesign'] ?? 'default' ) );
		if ( isset( $form['formType'] ) && 'multi' === (string) $form['formType'] ) {
			self::$forminator_multi_on_page = true;
		}

		self::$did_render = true;

		return $this->render_form_html( $form );
	}

	/**
	 * Returns decoded forms payload.
	 *
	 * @return array<string,mixed>
	 */
	private function get_forms_payload(): array {
		$raw = get_option( self::FORMS_OPTION_KEY, '' );
		if ( ! is_string( $raw ) || '' === trim( $raw ) ) {
			return array( 'forms' => array() );
		}

		$decoded = base64_decode( trim( $raw ), true );
		if ( false === $decoded ) {
			return array( 'forms' => array() );
		}

		$json = rawurldecode( (string) $decoded );
		$arr  = json_decode( $json, true );
		if ( ! is_array( $arr ) ) {
			return array( 'forms' => array() );
		}

		if ( empty( $arr['forms'] ) || ! is_array( $arr['forms'] ) ) {
			$arr['forms'] = array();
		}

		return $arr;
	}

	/**
	 * Gets a form by id.
	 *
	 * @param string $form_id Form id.
	 * @return array<string,mixed>|null
	 */
	private function get_form_by_id( string $form_id ) {
		$payload = $this->get_forms_payload();
		$forms   = isset( $payload['forms'] ) && is_array( $payload['forms'] ) ? $payload['forms'] : array();
		foreach ( $forms as $form ) {
			if ( ! is_array( $form ) ) {
				continue;
			}
			$id = isset( $form['id'] ) ? (string) $form['id'] : '';
			if ( $id === $form_id ) {
				return $form;
			}
		}
		return null;
	}

	/**
	 * Whether the form is allowed on the front (shortcode, popups, livechat embed).
	 * Unpublished (`published` === false) forms render nothing and reject AJAX submits.
	 *
	 * @param array<string,mixed> $form Form row.
	 */
	private function is_form_published_for_frontend( array $form ): bool {
		if ( array_key_exists( 'published', $form ) && empty( $form['published'] ) ) {
			return false;
		}

		return true;
	}

	/**
	 * Renders HTML for a form.
	 *
	 * @param array<string,mixed> $form Form.
	 * @return string
	 */
	private function render_form_html( array $form ): string {
		$form_id  = isset( $form['id'] ) ? sanitize_text_field( (string) $form['id'] ) : '';
		$type     = isset( $form['formType'] ) ? sanitize_text_field( (string) $form['formType'] ) : 'simple';
		$is_multi = ( 'multi' === $type );
		$styling  = isset( $form['styling'] ) && is_array( $form['styling'] ) ? $form['styling'] : array();
		$form_bg  = sanitize_hex_color( (string) ( $styling['backgroundColor'] ?? '#ffffff' ) ) ?: '#ffffff';
		$form_txt = sanitize_hex_color( (string) ( $styling['textColor'] ?? '#1e293b' ) ) ?: '#1e293b';
		$btn_col  = sanitize_hex_color( (string) ( $styling['buttonColor'] ?? '#7c3aed' ) ) ?: '#7c3aed';
		/* Stepper default: same as button color on pages; neutral when inside popup (button color comes from Popup Appearance). */
		$step_col = sanitize_hex_color( (string) ( $styling['stepperColor'] ?? '' ) ) ?: '';
		if ( '' === $step_col ) {
			$step_col = \nexulesuite_\Popup_Form_Render_Context::is_active() ? '#525252' : $btn_col;
		}

		// Global field appearance (single source of truth across all forms/modules).
		$general = get_option( self::GENERAL_SETTINGS_OPTION_KEY, array() );
		if ( ! is_array( $general ) ) {
			$general = array();
		}
		$field_text  = sanitize_hex_color( (string) ( $general['formFieldTextColor'] ?? '' ) ) ?: '';
		$ph_color    = sanitize_hex_color( (string) ( $general['formPlaceholderColor'] ?? '' ) ) ?: '';
		$border_col  = sanitize_hex_color( (string) ( $general['formFieldBorderColor'] ?? '' ) ) ?: '';
		$border_st   = sanitize_text_field( (string) ( $general['formFieldBorderStyle'] ?? 'solid' ) );
		$allowed_st  = array( 'solid', 'dashed', 'dotted', 'double', 'none' );
		if ( ! in_array( $border_st, $allowed_st, true ) ) {
			$border_st = 'solid';
		}
		$border_w = max( 0, min( 100, (int) ( $styling['fieldBorderWidth'] ?? $general['formFieldBorderWidth'] ?? 1 ) ) );
		$radius   = max( 0, min( 100, (int) ( $styling['fieldBorderRadius'] ?? $general['formFieldBorderRadius'] ?? 10 ) ) );
		// Per-form Customization tab; fall back to legacy general settings, then defaults.
		$field_fs = max( 10, min( 24, (int) ( $styling['fieldFontSize'] ?? $general['formFieldFontSize'] ?? 14 ) ) );
		$label_fs = max( 10, min( 22, (int) ( $styling['labelFontSize'] ?? $general['formLabelFontSize'] ?? 13 ) ) );
		$ph_fs    = max( 10, min( 22, (int) ( $styling['placeholderFontSize'] ?? $general['formPlaceholderFontSize'] ?? 14 ) ) );
		$field_gap = max( 0, min( 100, (int) ( $styling['rowGap'] ?? $styling['fieldGap'] ?? $general['formFieldGap'] ?? 16 ) ) );
		$field_pad = max( 0, min( 100, (int) ( $styling['fieldPadding'] ?? 12 ) ) );
		$label_sp  = max( 0, min( 100, (int) ( $styling['labelSpacing'] ?? 6 ) ) );
		$col_gap   = max( 0, min( 100, (int) ( $styling['columnGap'] ?? 16 ) ) );

		/*
		 * Button color: Form Builder value everywhere except inside popup body, where Popups → Appearance
		 * drives `--nexulesuite_popup-form-btn` on the overlay (see expand_popup_body_shortcodes + render_popups).
		 */
		$btn_var = \nexulesuite_\Popup_Form_Render_Context::is_active()
			? '--nexulesuite_st-btn: var(--nexulesuite_popup-form-btn,#2563eb);'
			: '--nexulesuite_st-btn:' . $btn_col . ';';

		$form_vars = '--nexulesuite_st-form-bg:' . $form_bg . ';'
			. '--nexulesuite_st-form-text:' . $form_txt . ';'
			. $btn_var
			. '--nexulesuite_st-stepper:' . $step_col . ';'
			. ( '' !== $field_text ? '--nexulesuite_st-form-field-text:' . $field_text . ';' : '' )
			. ( '' !== $ph_color ? '--nexulesuite_st-form-placeholder:' . $ph_color . ';' : '' )
			. ( '' !== $border_col ? '--nexulesuite_st-form-field-border-color:' . $border_col . ';' : '' )
			. '--nexulesuite_st-form-field-border-style:' . $border_st . ';'
			. '--nexulesuite_st-form-field-border-width:' . $border_w . 'px;'
			. '--nexulesuite_st-form-field-radius:' . $radius . 'px;'
			. '--nexulesuite_st-form-field-gap:' . $field_gap . 'px;'
			. '--nexulesuite_st-form-column-gap:' . $col_gap . 'px;'
			. '--nexulesuite_st-form-field-padding:' . $field_pad . 'px;'
			. '--nexulesuite_st-form-label-spacing:' . $label_sp . 'px;'
			. '--nexulesuite_st-form-label-font-size:' . $label_fs . 'px;'
			. '--nexulesuite_st-form-placeholder-font-size:' . $ph_fs . 'px;'
			. '--nexulesuite_st-form-field-font-size:' . $field_fs . 'px;';
		$steps    = isset( $form['steps'] ) && is_array( $form['steps'] ) ? $form['steps'] : array();
		if ( empty( $steps ) ) {
			$steps = array(
				array(
					'id'     => 'step-1',
					'title'  => '',
					'fields' => array(),
				),
			);
		}

		$fui_root = Forminator_UI_Bridge::root_classes( $form );

		$submit_method = isset( $form['submissionMethod'] ) ? sanitize_text_field( (string) $form['submissionMethod'] ) : 'ajax';
		if ( 'reload' !== $submit_method ) {
			$submit_method = 'ajax';
		}

		ob_start();
		$step_count = count( $steps );
		?>
		<div class="nexulesuite_st-form nexulesuite_st-form--minimal <?php echo esc_attr( $fui_root ); ?>" style="<?php echo esc_attr( $form_vars ); ?>" data-form-id="<?php echo esc_attr( $form_id ); ?>" data-form-type="<?php echo esc_attr( $is_multi ? 'multi' : 'simple' ); ?>" data-submit-text="<?php echo esc_attr( (string) ( $form['submitBtnText'] ?? 'Submit' ) ); ?>" data-submission-method="<?php echo esc_attr( $submit_method ); ?>">
			<form class="nexulesuite_st-form__body forminator-custom-form" method="post" enctype="multipart/form-data"<?php echo 'reload' === $submit_method ? '' : ' data-nexulesuite_ajax="1"'; ?>>
				<?php wp_nonce_field( 'nexulesuite_form_submit', 'nexulesuite_form_nonce' ); ?>
				<input type="hidden" name="nexulesuite_form_id" value="<?php echo esc_attr( $form_id ); ?>" />
				<?php
				$hp_id = 'nexulesuite_hp-' . substr( hash( 'sha256', $form_id . '|' . (string) wp_parse_url( home_url(), PHP_URL_HOST ) ), 0, 16 );
				?>
				<div class="nexulesuite_st-hp" aria-hidden="true">
					<label for="<?php echo esc_attr( $hp_id ); ?>"><?php esc_html_e( 'Website', 'nexus-lead-suite' ); ?></label>
					<input
						type="text"
						name="<?php echo esc_attr( self::HONEYPOT_FIELD_NAME ); ?>"
						id="<?php echo esc_attr( $hp_id ); ?>"
						value=""
						tabindex="-1"
						autocomplete="off"
					/>
				</div>

				<?php if ( $is_multi && $step_count > 1 ) : ?>
					<div
						class="nexulesuite_st-progress"
						data-total-steps="<?php echo esc_attr( (string) $step_count ); ?>"
						role="progressbar"
						aria-valuemin="1"
						aria-valuemax="<?php echo esc_attr( (string) $step_count ); ?>"
						aria-valuenow="1"
						aria-label="<?php echo esc_attr( sprintf( /* translators: 1: current step, 2: total steps */ __( 'Form step %1$d of %2$d', 'nexus-lead-suite' ), 1, $step_count ) ); ?>"
					>
						<div class="nexulesuite_st-progress__track" aria-hidden="true">
							<div class="nexulesuite_st-progress__fill" style="width: <?php echo esc_attr( (string) round( 100 / $step_count, 4 ) ); ?>%;"></div>
						</div>
						<div class="nexulesuite_st-progress__dots" aria-hidden="true">
							<?php foreach ( $steps as $didx => $_step ) : ?>
								<span class="nexulesuite_st-progress__dot<?php echo 0 === (int) $didx ? ' nexulesuite_st-progress__dot--active' : ''; ?>" data-step-dot="<?php echo esc_attr( (string) $didx ); ?>"></span>
							<?php endforeach; ?>
						</div>
					</div>
				<?php endif; ?>

				<?php foreach ( $steps as $idx => $step ) : ?>
					<?php
					$blocks = is_array( $step ) && isset( $step['fields'] ) && is_array( $step['fields'] ) ? $step['fields'] : array();
					?>
					<section class="nexulesuite_st-step" data-step-index="<?php echo esc_attr( (string) $idx ); ?>" <?php echo ( $idx === 0 ? '' : 'hidden' ); ?>>
						<div class="nexulesuite_st-grid forminator-row">
							<?php $this->render_blocks( $blocks ); ?>
						</div>
					</section>
				<?php endforeach; ?>

				<div class="nexulesuite_st-actions" <?php echo ( $is_multi ? '' : 'data-single="1"' ); ?>>
					<?php if ( $is_multi ) : ?>
						<button type="button" class="nexulesuite_st-btn nexulesuite_st-btn--secondary forminator-button" data-action="prev">Previous</button>
						<button type="button" class="nexulesuite_st-btn nexulesuite_st-btn--primary forminator-button" data-action="next">Next</button>
					<?php else : ?>
						<button type="submit" class="nexulesuite_st-btn nexulesuite_st-btn--primary forminator-button"><?php echo esc_html( (string) ( $form['submitBtnText'] ?? 'Submit' ) ); ?></button>
					<?php endif; ?>
				</div>
			</form>
		</div>
		<?php
		return (string) ob_get_clean();
	}

	/**
	 * Renders blocks (fields + layout containers).
	 *
	 * @param array<int,mixed> $blocks Blocks.
	 * @return void
	 */
	private function render_blocks( array $blocks ): void {
		foreach ( $blocks as $block ) {
			if ( ! is_array( $block ) ) {
				continue;
			}

			$kind = isset( $block['kind'] ) ? sanitize_text_field( (string) $block['kind'] ) : 'field';
			$is_layout = ( 'layout' === $kind );
			if ( ! $is_layout && isset( $block['layout'] ) && is_array( $block['layout'] ) ) {
				// Back-compat: tolerate stored layout blocks without `kind`.
				$is_layout = true;
			}

			if ( $is_layout ) {
				$this->render_layout_block( $block );
				continue;
			}

			$this->render_field_block( $block );
		}
	}

	/**
	 * Renders a layout block.
	 *
	 * @param array<string,mixed> $block Layout block.
	 * @return void
	 */
	private function render_layout_block( array $block ): void {
		$layout = isset( $block['layout'] ) && is_array( $block['layout'] ) ? $block['layout'] : array();
		$cols   = isset( $layout['columns'] ) ? (int) $layout['columns'] : 2;
		$cols   = max( 1, min( 4, $cols ) );
		$items  = isset( $layout['items'] ) && is_array( $layout['items'] ) ? $layout['items'] : array();

		echo '<div class="nexulesuite_st-layout nexulesuite_st-layout--cols-' . esc_attr( (string) $cols ) . ' forminator-row">';
		for ( $i = 0; $i < $cols; $i++ ) {
			$col_items = isset( $items[ $i ] ) && is_array( $items[ $i ] ) ? $items[ $i ] : array();
			echo '<div class="nexulesuite_st-layout__col">';
			$this->render_blocks( $col_items );
			echo '</div>';
		}
		echo '</div>';
	}

	/**
	 * Floating label text: prefer placeholder; if empty, use visible field label.
	 *
	 * @param string $placeholder Placeholder.
	 * @param string $label       Field label.
	 * @param bool   $show_label  Whether label is shown in settings.
	 * @return string
	 */
	private function floating_caption( string $placeholder, string $label, bool $show_label = false ): string {
		// Prefer placeholder as the float label (PrimeReact "on" — rests inside, floats on border when typing).
		unset( $show_label );
		$ph = trim( $placeholder );
		if ( '' !== $ph ) {
			return $ph;
		}
		return trim( $label );
	}

	/**
	 * Invisible placeholder so :placeholder-shown tracks empty vs filled for floating labels.
	 *
	 * @return string HTML attribute fragment including leading space.
	 */
	private function floating_nbsp_placeholder_attr(): string {
		return ' placeholder="' . esc_attr( "\u{00A0}" ) . '"';
	}

	/**
	 * Formats hardcoded extra HTML attributes from internal call sites (mask, inputmode, etc.).
	 *
	 * @param string $attrs Space-separated attribute string.
	 * @return string Leading space + attrs, or empty.
	 */
	private function format_trusted_input_attrs( string $attrs ): string {
		$attrs = trim( $attrs );
		if ( '' === $attrs ) {
			return '';
		}

		// Returned fragment is always assembled into a wp_kses()'d element by the caller.
		return ' ' . $attrs;
	}

	/**
	 * Stable unique id for floating-label inputs (wp_unique_id requires WP 6.4+).
	 *
	 * @return string
	 */
	private function floating_input_dom_id(): string {
		return 'nexulesuite_st-inp-' . str_replace( '.', '', uniqid( '', true ) );
	}

	/**
	 * Text-like input with animated floating label (caption from placeholder, else static label).
	 *
	 * @param string $name        Input name.
	 * @param string $type        Input type.
	 * @param string $placeholder Raw placeholder (used when floating is off).
	 * @param string $label       Field label.
	 * @param bool   $show_label  Label visibility setting.
	 * @param bool   $required    Required.
	 * @param string              $extra_attrs Optional raw HTML attributes (trusted; e.g. data-nexulesuite_mask).
	 * @return void
	 */
	private function render_float_text_input( string $name, string $type, string $placeholder, string $label, bool $show_label, bool $required, string $extra_attrs = '' ): void {
		$extra   = $this->format_trusted_input_attrs( $extra_attrs );
		$caption = $this->floating_caption( $placeholder, $label, $show_label );
		$req     = $required ? ' required' : '';
		if ( '' === $caption ) {
			$html = '<input class="nexulesuite_st-input forminator-input" type="' . esc_attr( $type ) . '" name="' . esc_attr( $name ) . '" placeholder="' . esc_attr( $placeholder ) . '"' . $req . $extra . ' />';
			echo wp_kses( $html, \nexulesuite_\allowed_form_html() );
			return;
		}

		$id    = $this->floating_input_dom_id();
		$html  = '<div class="nexulesuite_st-float-wrap">';
		$html .= '<input id="' . esc_attr( $id ) . '" class="nexulesuite_st-input forminator-input" type="' . esc_attr( $type ) . '" name="' . esc_attr( $name ) . '"' . $this->floating_nbsp_placeholder_attr() . $req . $extra . ' />';
		$html .= sprintf(
			'<label class="nexulesuite_st-float-label" for="%s">%s%s</label></div>',
			esc_attr( $id ),
			esc_html( $caption ),
			$required ? '<span class="nexulesuite_st-req">*</span>' : ''
		);
		echo wp_kses( $html, \nexulesuite_\allowed_form_html() );
	}

	/**
	 * Textarea with floating label.
	 *
	 * @param string $name        Field name.
	 * @param string $placeholder Placeholder.
	 * @param string $label       Field label.
	 * @param bool   $show_label  Label visibility.
	 * @param bool   $required    Required.
	 * @return void
	 */
	private function render_float_textarea( string $name, string $placeholder, string $label, bool $show_label, bool $required ): void {
		$caption = $this->floating_caption( $placeholder, $label, $show_label );
		$req     = $required ? ' required' : '';
		if ( '' === $caption ) {
			$html = '<textarea class="nexulesuite_st-textarea forminator-input" name="' . esc_attr( $name ) . '" placeholder="' . esc_attr( $placeholder ) . '"' . $req . '></textarea>';
			echo wp_kses( $html, \nexulesuite_\allowed_form_html() );
			return;
		}

		$id    = $this->floating_input_dom_id();
		$html  = '<div class="nexulesuite_st-float-wrap nexulesuite_st-float-wrap--textarea">';
		$html .= '<textarea id="' . esc_attr( $id ) . '" class="nexulesuite_st-textarea forminator-input" name="' . esc_attr( $name ) . '"' . $this->floating_nbsp_placeholder_attr() . $req . '></textarea>';
		$html .= sprintf(
			'<label class="nexulesuite_st-float-label" for="%s">%s%s</label></div>',
			esc_attr( $id ),
			esc_html( $caption ),
			$required ? '<span class="nexulesuite_st-req">*</span>' : ''
		);
		echo wp_kses( $html, \nexulesuite_\allowed_form_html() );
	}

	/**
	 * Per-field styling from the builder ("Styling" tab). CSS vars cascade to inputs/select inside the field wrapper.
	 * Only activates when settings differ from REST defaults — otherwise floating layout & form theme stay intact.
	 *
	 * @param array<string,mixed> $settings Field settings.
	 * @return array{class_suffix:string,inline_style:string}
	 */
	private function get_field_custom_appearance( array $settings ): array {
		$defaults = array(
			'backgroundColor' => '#ffffff',
			'textColor'       => '#000000',
			'borderColor'     => '#cbd5e1',
			'borderRadius'    => 6,
			'borderWidth'     => 1,
			'padding'         => 12,
			'fontSize'        => 14,
			'fontWeight'      => '500',
		);
		/* Legacy builder defaults — treat as untouched so wrappers stay borderless. */
		$legacy_border_colors = array( '#cbd5e1', '#b0b8c4', '#d1d5db', '#e2e8f0', '#d4d4d4', '#bdbdbd' );

		$bg = sanitize_hex_color( (string) ( $settings['backgroundColor'] ?? $defaults['backgroundColor'] ) );
		if ( '' === $bg ) {
			$bg = $defaults['backgroundColor'];
		}
		$tc = sanitize_hex_color( (string) ( $settings['textColor'] ?? $defaults['textColor'] ) );
		if ( '' === $tc ) {
			$tc = $defaults['textColor'];
		}
		$bc = sanitize_hex_color( (string) ( $settings['borderColor'] ?? $defaults['borderColor'] ) );
		if ( '' === $bc ) {
			$bc = $defaults['borderColor'];
		}

		$radius = max( 0, min( 100, (int) ( $settings['borderRadius'] ?? $defaults['borderRadius'] ) ) );
		$bwidth = max( 0, min( 100, (int) ( $settings['borderWidth'] ?? $defaults['borderWidth'] ) ) );
		$pad    = max( 0, min( 100, (int) ( $settings['padding'] ?? $defaults['padding'] ) ) );
		$fsize  = max( 10, (int) ( $settings['fontSize'] ?? $defaults['fontSize'] ) );

		$fweight_raw = sanitize_text_field( (string) ( $settings['fontWeight'] ?? $defaults['fontWeight'] ) );
		$fweight     = preg_match( '/^[1-9]00$/', $fweight_raw ) ? $fweight_raw : ( is_numeric( $fweight_raw ) ? $fweight_raw : $defaults['fontWeight'] );

		$bc_l        = strtolower( $bc );
		$border_stock = in_array( $bc_l, $legacy_border_colors, true );

		$touched =
			strtolower( $bg ) !== strtolower( $defaults['backgroundColor'] )
			|| strtolower( $tc ) !== strtolower( $defaults['textColor'] )
			|| ! $border_stock
			|| $radius !== (int) $defaults['borderRadius']
			|| $bwidth !== (int) $defaults['borderWidth']
			|| $pad !== (int) $defaults['padding']
			|| $fsize !== (int) $defaults['fontSize']
			|| (string) $fweight !== (string) $defaults['fontWeight'];

		if ( ! $touched ) {
			return array(
				'class_suffix' => '',
				'inline_style' => '',
			);
		}

		$decl = array(
			'--nexulesuite_st-form-field-bg:' . $bg,
			'--nexulesuite_st-form-field-text:' . $tc,
			'--nexulesuite_st-form-field-border-color:' . $bc,
			'--nexulesuite_st-form-field-border-width:' . $bwidth . 'px',
			'--nexulesuite_st-form-field-radius:' . $radius . 'px',
			'--nexulesuite_st-field-inner-pad:' . $pad . 'px',
			'--nexulesuite_st-field-inner-pad-x:' . $pad . 'px',
			'--nexulesuite_st-field-font-size:' . $fsize . 'px',
			'--nexulesuite_st-field-font-weight:' . $fweight,
		);

		return array(
			'class_suffix' => ' nexulesuite_st-field--custom-appearance',
			'inline_style' => implode( ';', $decl ),
		);
	}

	/**
	 * Renders a single field block.
	 *
	 * @param array<string,mixed> $field Field.
	 * @return void
	 */
	private function render_field_block( array $field ): void {
		$module_id = isset( $field['moduleId'] ) ? sanitize_text_field( (string) $field['moduleId'] ) : '';
		$settings  = isset( $field['settings'] ) && is_array( $field['settings'] ) ? $field['settings'] : array();
		$label     = isset( $settings['label'] ) ? sanitize_text_field( (string) $settings['label'] ) : '';
		$placeholder = isset( $settings['placeholder'] ) ? sanitize_text_field( (string) $settings['placeholder'] ) : '';
		$required  = ! empty( $settings['required'] );
		$show_label = ! isset( $settings['showLabel'] ) || ! empty( $settings['showLabel'] );

		/*
		 * If the builder hides labels and no placeholder is set, fields can render with no visible hint.
		 * Treat label as placeholder in that case so the input still communicates its meaning.
		 */
		if ( ! $show_label && '' === trim( $placeholder ) && '' !== trim( $label ) ) {
			$placeholder = $label;
		}

		$name = 'st_' . preg_replace( '/[^a-z0-9_]+/i', '_', $module_id . '_' . ( $field['id'] ?? '' ) );
		$name = strtolower( (string) $name );

		$float_caption = $this->floating_caption( $placeholder, $label, $show_label );
		$modules_never_single_float = array(
			'name',
			'dropdown',
			'radio',
			'checkbox',
			'time',
			'date-time',
			'file-upload',
			'address',
			'terms-conditions',
			'recaptcha',
			'cloudflare',
		);

		$use_floating_layout = in_array( $module_id, array( 'name', 'address' ), true )
			|| ( ! in_array( $module_id, $modules_never_single_float, true ) && '' !== $float_caption );

		$field_class = 'nexulesuite_st-field forminator-field' . ( $use_floating_layout ? ' nexulesuite_st-field--floating' : '' );
		/* show-label class is only for non-floating fields (float uses placeholder-as-label). */
		if ( $show_label && ! $use_floating_layout ) {
			$field_class .= ' nexulesuite_st-field--show-label';
		}

		$appearance   = $this->get_field_custom_appearance( $settings );
		$field_class .= $appearance['class_suffix'];

		$field_help = isset( $settings['helpText'] ) ? sanitize_text_field( (string) $settings['helpText'] ) : '';
		if ( '' === $field_help && isset( $settings['description'] ) ) {
			$field_help = sanitize_text_field( (string) $settings['description'] );
		}

		echo '<div class="' . esc_attr( $field_class ) . '" data-module="' . esc_attr( $module_id ) . '"';
		$field_uid = isset( $field['id'] ) ? (string) $field['id'] : '';
		if ( '' !== $field_uid ) {
			echo ' data-nexulesuite_field-id="' . esc_attr( $field_uid ) . '"';
		}
		$conditional_cfg = isset( $settings['conditional'] ) && is_array( $settings['conditional'] ) ? $settings['conditional'] : array();
		if ( ! empty( $conditional_cfg['enabled'] ) && ! empty( $conditional_cfg['rules'] ) && is_array( $conditional_cfg['rules'] ) ) {
			$cond_payload = array(
				'action' => ( isset( $conditional_cfg['action'] ) && 'hide' === $conditional_cfg['action'] ) ? 'hide' : 'show',
				'match'  => ( isset( $conditional_cfg['match'] ) && 'any' === $conditional_cfg['match'] ) ? 'any' : 'all',
				'rules'  => array(),
			);
			foreach ( $conditional_cfg['rules'] as $cond_rule ) {
				if ( ! is_array( $cond_rule ) || empty( $cond_rule['field'] ) ) {
					continue;
				}
				$cond_payload['rules'][] = array(
					'field'    => (string) $cond_rule['field'],
					'operator' => isset( $cond_rule['operator'] ) ? (string) $cond_rule['operator'] : 'is',
					'value'    => isset( $cond_rule['value'] ) ? (string) $cond_rule['value'] : '',
				);
			}
			if ( ! empty( $cond_payload['rules'] ) ) {
				echo ' data-nexulesuite_conditional="' . esc_attr( (string) wp_json_encode( $cond_payload ) ) . '"';
			}
		}
		if ( '' !== $appearance['inline_style'] ) {
			echo ' style="' . esc_attr( $appearance['inline_style'] ) . '"';
		}
		echo '>';

		/* Top static label only when not using float-from-placeholder layout. */
		if ( 'terms-conditions' !== $module_id && $show_label && '' !== $label && ! $use_floating_layout ) {
			echo '<label class="nexulesuite_st-field__label forminator-label">' . esc_html( $label ) . ( $required ? '<span class="nexulesuite_st-req">*</span>' : '' ) . '</label>';
		}

		if ( '' !== $field_help && ! in_array( $module_id, array( 'terms-conditions', 'section', 'html', 'hidden', 'postdata', 'stripe', 'paypal', 'esignature', 'field-group' ), true ) ) {
			echo '<p class="nexulesuite_st-field__help forminator-description">' . esc_html( $field_help ) . '</p>';
		}

		switch ( $module_id ) {
			case 'name':
				$parts = isset( $settings['nameParts'] ) && is_array( $settings['nameParts'] ) ? $settings['nameParts'] : array();
				$this->render_name_field( $name, $parts, $required );
				break;
			case 'email':
				$this->render_float_text_input( $name, 'email', $placeholder, $label, $show_label, $required );
				break;
			case 'phone':
				$this->render_float_text_input(
					$name,
					'tel',
					$placeholder,
					$label,
					$show_label,
					$required,
					'data-nexulesuite_mask="us-phone" inputmode="tel" autocomplete="tel"'
				);
				break;
			case 'textarea':
				$this->render_float_textarea( $name, $placeholder, $label, $show_label, $required );
				break;
			case 'dropdown':
				$options      = isset( $settings['options'] ) && is_array( $settings['options'] ) ? $settings['options'] : array();
				$ph_raw       = trim( $placeholder );
				$select_label = '' !== $ph_raw ? sanitize_text_field( $ph_raw ) : __( 'Select an option', 'nexus-lead-suite' );
				$built        = array();
				foreach ( $options as $opt ) {
					if ( ! is_array( $opt ) ) {
						continue;
					}
					$opt_label = isset( $opt['label'] ) ? sanitize_text_field( (string) $opt['label'] ) : '';
					$opt_value = isset( $opt['value'] ) ? sanitize_text_field( (string) $opt['value'] ) : $opt_label;
					$disp      = '' !== $opt_label ? $opt_label : $opt_value;
					if ( '' === $disp && '' === $opt_value ) {
						continue;
					}
					if ( '' === $disp ) {
						$disp = $opt_value;
					}
					if ( '' === $disp ) {
						$disp = __( 'Option', 'nexus-lead-suite' );
					}
					$built[] = array(
						'value' => $opt_value,
						'label' => $disp,
					);
				}
				echo '<select class="nexulesuite_st-select forminator-input" name="' . esc_attr( $name ) . '"' . ( $required ? ' required' : '' ) . '>';
				if ( array() === $built ) {
					echo '<option value="">' . esc_html__( 'No choices configured', 'nexus-lead-suite' ) . '</option>';
				} else {
					if ( $required ) {
						echo '<option value="" selected disabled>' . esc_html( $select_label ) . '</option>';
					} else {
						echo '<option value="" selected>' . esc_html( $select_label ) . '</option>';
					}
					foreach ( $built as $row ) {
						echo '<option value="' . esc_attr( $row['value'] ) . '">' . esc_html( $row['label'] ) . '</option>';
					}
				}
				echo '</select>';
				break;
			case 'radio':
			case 'checkbox':
				$options = isset( $settings['options'] ) && is_array( $settings['options'] ) ? $settings['options'] : array();
				$inline  = isset( $settings['optionLayout'] ) && 'inline' === (string) $settings['optionLayout'];
				echo '<div class="nexulesuite_st-options' . ( $inline ? ' nexulesuite_st-options--inline' : '' ) . '">';
				foreach ( $options as $idx => $opt ) {
					if ( ! is_array( $opt ) ) {
						continue;
					}
					$opt_label = isset( $opt['label'] ) ? sanitize_text_field( (string) $opt['label'] ) : '';
					$opt_value = isset( $opt['value'] ) ? sanitize_text_field( (string) $opt['value'] ) : $opt_label;
					$opt_id    = $name . '_' . (int) $idx;
					echo '<label class="nexulesuite_st-option" for="' . esc_attr( $opt_id ) . '">';
					echo '<input id="' . esc_attr( $opt_id ) . '" type="' . esc_attr( $module_id ) . '" name="' . esc_attr( $name ) . ( 'checkbox' === $module_id ? '[]' : '' ) . '" value="' . esc_attr( $opt_value ) . '"' . ( $required ? ' required' : '' ) . ' />';
					echo '<span>' . esc_html( $opt_label !== '' ? $opt_label : $opt_value ) . '</span>';
					echo '</label>';
				}
				echo '</div>';
				break;
			case 'password':
				$this->render_float_text_input( $name, 'password', $placeholder, $label, $show_label, $required );
				break;
			case 'website':
				$this->render_float_text_input( $name, 'url', $placeholder, $label, $show_label, $required );
				break;
			case 'number':
				$this->render_float_text_input( $name, 'number', $placeholder, $label, $show_label, $required );
				break;
			case 'date':
				$date_placeholder = '' !== trim( $placeholder ) ? $placeholder : 'MM/DD/YYYY';
				$this->render_float_text_input(
					$name,
					'text',
					$date_placeholder,
					$label,
					$show_label,
					$required,
					'data-nexulesuite_mask="date-mdy" inputmode="numeric" maxlength="10" autocomplete="bday"'
				);
				break;
			case 'time':
				printf(
					'<input class="nexulesuite_st-input forminator-input" type="time" name="%s"%s />',
					esc_attr( $name ),
					$required ? ' required' : ''
				);
				break;
			case 'date-time':
				printf(
					'<input class="nexulesuite_st-input forminator-input" type="datetime-local" name="%s"%s />',
					esc_attr( $name ),
					$required ? ' required' : ''
				);
				break;
		case 'file-upload':
			$file_label = '' !== $placeholder ? esc_html( $placeholder ) : esc_html__( 'Choose file…', 'nexus-lead-suite' );
			printf(
				'<div class="nexulesuite_st-file-wrap">
					<span class="nexulesuite_st-file-btn">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
						Upload
					</span>
					<span class="nexulesuite_st-file-name" data-default="%s">%s</span>
					<input class="nexulesuite_st-input forminator-input" type="file" name="%s"%s
						onchange="(function(i){var n=i.closest(\'.nexulesuite_st-file-wrap\').querySelector(\'.nexulesuite_st-file-name\');n.textContent=i.files[0]?i.files[0].name:n.dataset.default;})(this)" />
				</div>',
				esc_attr( $file_label ),
				esc_html( $file_label ),
				esc_attr( $name ),
				$required ? ' required' : ''
			);
			break;
			case 'address':
				$parts = isset( $settings['addressParts'] ) && is_array( $settings['addressParts'] ) ? $settings['addressParts'] : array();
				$this->render_address_field( $name, $parts, $required );
				break;
			case 'terms-conditions':
				$consent = isset( $settings['consent'] ) && is_array( $settings['consent'] ) ? $settings['consent'] : array();
				$html    = isset( $consent['html'] ) ? (string) $consent['html'] : '';
				if ( '' === $html ) {
					$html = 'Yes, I agree with the <a href="#" target="_blank" rel="noopener noreferrer">privacy policy</a> and <a href="#" target="_blank" rel="noopener noreferrer">terms and conditions</a>.';
				}
				echo '<label class="nexulesuite_st-consent">';
				echo '<input type="checkbox" name="' . esc_attr( $name ) . '" value="1"' . ( $required ? ' required' : '' ) . ' />';
				echo '<span>' . wp_kses_post( $html ) . '</span>';
				echo '</label>';
				break;
			case 'recaptcha':
				$rec_fb = $this->get_recaptcha_integration_settings();
				$v3_mod = ( 'v3' === $rec_fb['apiVersion'] ) ? ' nexulesuite_st-captcha--recaptcha-v3' : '';
				echo '<div class="nexulesuite_st-captcha nexulesuite_st-captcha--recaptcha' . esc_attr( $v3_mod ) . '" aria-label="reCAPTCHA"></div>';
				break;
			case 'cloudflare':
				echo '<div class="nexulesuite_st-captcha nexulesuite_st-captcha--turnstile" aria-label="Turnstile"></div>';
				break;
			case 'html':
				$html_block = isset( $settings['html'] ) ? (string) $settings['html'] : ( isset( $settings['content'] ) ? (string) $settings['content'] : '' );
				echo '<div class="nexulesuite_st-html">' . wp_kses_post( $html_block ) . '</div>';
				break;
			case 'hidden':
			case 'postdata':
				$hidden_val = isset( $settings['defaultValue'] ) ? sanitize_text_field( (string) $settings['defaultValue'] ) : '';
				echo '<input type="hidden" class="nexulesuite_st-input" name="' . esc_attr( $name ) . '" value="' . esc_attr( $hidden_val ) . '" />';
				break;
			case 'section':
				$sec_title = '' !== $label ? $label : __( 'Section', 'nexus-lead-suite' );
				echo '<div class="nexulesuite_st-section"><h3 class="nexulesuite_st-section__title">' . esc_html( $sec_title ) . '</h3>';
				if ( '' !== $field_help ) {
					echo '<p class="nexulesuite_st-section__desc">' . esc_html( $field_help ) . '</p>';
				}
				echo '</div>';
				break;
			case 'currency':
				$currency = isset( $settings['currency'] ) ? sanitize_text_field( (string) $settings['currency'] ) : '$';
				echo '<div class="nexulesuite_st-currency">';
				echo '<span class="nexulesuite_st-currency__sym" aria-hidden="true">' . esc_html( $currency ) . '</span>';
				$this->render_float_text_input( $name, 'number', $placeholder, $label, $show_label, $required, 'inputmode="decimal" step="0.01"' );
				echo '</div>';
				break;
			case 'slider':
				$min = isset( $settings['min'] ) ? (float) $settings['min'] : 0;
				$max = isset( $settings['max'] ) ? (float) $settings['max'] : 100;
				$step = isset( $settings['step'] ) ? (float) $settings['step'] : 1;
				$val = isset( $settings['defaultValue'] ) ? (float) $settings['defaultValue'] : $min;
				echo '<input class="nexulesuite_st-input nexulesuite_st-slider" type="range" name="' . esc_attr( $name ) . '" min="' . esc_attr( (string) $min ) . '" max="' . esc_attr( (string) $max ) . '" step="' . esc_attr( (string) $step ) . '" value="' . esc_attr( (string) $val ) . '"' . ( $required ? ' required' : '' ) . ' />';
				break;
			case 'rating':
				$max_stars = isset( $settings['max'] ) ? max( 1, min( 10, (int) $settings['max'] ) ) : 5;
				echo '<div class="nexulesuite_st-rating" role="radiogroup">';
				for ( $si = 1; $si <= $max_stars; $si++ ) {
					echo '<label class="nexulesuite_st-rating__star"><input type="radio" name="' . esc_attr( $name ) . '" value="' . esc_attr( (string) $si ) . '"' . ( $required && 1 === $si ? ' required' : '' ) . ' /> ' . esc_html( (string) $si ) . '</label>';
				}
				echo '</div>';
				break;
			case 'calculations':
				echo '<input class="nexulesuite_st-input forminator-input" type="text" name="' . esc_attr( $name ) . '" value="" readonly placeholder="' . esc_attr( $placeholder !== '' ? $placeholder : __( 'Calculated', 'nexus-lead-suite' ) ) . '" />';
				break;
			case 'stripe':
			case 'paypal':
			case 'esignature':
			case 'field-group':
				echo '<div class="nexulesuite_st-field-notice"><p>' . esc_html__( 'This field type requires additional setup and will be available in a future update.', 'nexus-lead-suite' ) . '</p></div>';
				break;
			default:
				$this->render_float_text_input( $name, 'text', $placeholder, $label, $show_label, $required );
				break;
		}

		echo '</div>';
	}

	/**
	 * Renders name compound field.
	 *
	 * @param string               $base_name Base name.
	 * @param array<string,mixed>  $parts Parts.
	 * @param bool                 $required Required.
	 * @return void
	 */
	private function render_name_field( string $base_name, array $parts, bool $required ): void {
		$order = array(
			'prefix' => 'Prefix',
			'first'  => 'First Name',
			'middle' => 'Middle Name',
			'last'   => 'Last Name',
		);

		$enabled_keys = array();
		foreach ( $order as $key => $fallback ) {
			$part = isset( $parts[ $key ] ) && is_array( $parts[ $key ] ) ? $parts[ $key ] : array();
			$enabled = isset( $part['enabled'] ) ? (bool) $part['enabled'] : ( 'first' === $key || 'last' === $key );
			if ( $enabled ) {
				$enabled_keys[] = $key;
			}
		}

		$cols = count( $enabled_keys ) === 2 ? 2 : 1;
		echo '<div class="nexulesuite_st-compound nexulesuite_st-compound--' . esc_attr( (string) $cols ) . '">';
		foreach ( $order as $key => $fallback ) {
			$part = isset( $parts[ $key ] ) && is_array( $parts[ $key ] ) ? $parts[ $key ] : array();
			$enabled = isset( $part['enabled'] ) ? (bool) $part['enabled'] : ( 'first' === $key || 'last' === $key );
			if ( ! $enabled ) {
				continue;
			}
			$part_label = isset( $part['label'] ) ? sanitize_text_field( (string) $part['label'] ) : $fallback;
			$sub_req    = $required && ( 'first' === $key || 'last' === $key );
			$caption    = trim( $part_label );
			if ( '' === $caption ) {
				continue;
			}
			$id    = $this->floating_input_dom_id();
			$html  = '<div class="nexulesuite_st-float-wrap">';
			$html .= '<input id="' . esc_attr( $id ) . '" class="nexulesuite_st-input forminator-input" type="text" name="' . esc_attr( $base_name ) . '[' . esc_attr( $key ) . ']"' . $this->floating_nbsp_placeholder_attr() . ( $sub_req ? ' required' : '' ) . ' />';
			$html .= sprintf(
				'<label class="nexulesuite_st-float-label" for="%s">%s%s</label></div>',
				esc_attr( $id ),
				esc_html( $caption ),
				$sub_req ? '<span class="nexulesuite_st-req">*</span>' : ''
			);
			echo wp_kses( $html, \nexulesuite_\allowed_form_html() );
		}
		echo '</div>';
	}

	/**
	 * US/NANP numbers → E.164 (+1…) for reliable click-to-call; other regions unchanged.
	 * Skips strings that use pause/wait dial symbols (*#,…).
	 *
	 * @param string $clean_dial Tel body after trimming to allowed dial characters.
	 * @return string Dial string for use after `tel:`.
	 */
	private function finalize_us_tel_dial_for_href( string $clean_dial ): string {
		if ( strpbrk( $clean_dial, '*#;,' ) !== false ) {
			return $clean_dial;
		}
		$has_plus = str_starts_with( $clean_dial, '+' );
		$d        = preg_replace( '/\D/', '', $clean_dial );
		if ( '' === $d ) {
			return $clean_dial;
		}
		/* 1 + 10-digit US (e.g. 15551234567). */
		if ( 11 === strlen( $d ) && str_starts_with( $d, '1' ) ) {
			return '+1' . substr( $d, 1 );
		}
		/* 10-digit NANP (area/exchange first digit not 0 or 1). */
		if ( 10 === strlen( $d ) && preg_match( '/^[2-9]\d{2}[2-9]\d{6}$/', $d ) ) {
			return '+1' . $d;
		}
		if ( $has_plus ) {
			return '+' . $d;
		}
		return $d;
	}

	/**
	 * Normalize livechat button target URLs so phone links work: plain numbers and spaced `tel:` are
	 * not discarded by esc_url() (which can return an empty string for invalid tel URIs).
	 *
	 * @param string $raw Raw URL or phone from settings.
	 * @return string Safe href, or empty string if unusable.
	 */
	private function sanitize_livechat_button_href( string $raw ): string {
		$raw = trim( $raw );
		if ( '' === $raw ) {
			return '';
		}

		$protocols = array( 'http', 'https', 'tel', 'mailto', 'sms', 'ftp', 'ftps' );
		$lower     = strtolower( $raw );

		if ( str_starts_with( $lower, 'tel:' ) ) {
			$body = trim( substr( $raw, 4 ) );
			$body = preg_replace( '/\s+/', '', $body );
			if ( ! is_string( $body ) ) {
				return '';
			}
			/* Dial characters per common tel: usage (pause/wait as punctuation). */
			$body = preg_replace( '/[^\d+*#.,;]/', '', $body );
			if ( '' === $body ) {
				return '';
			}
			$body = $this->finalize_us_tel_dial_for_href( $body );
			return 'tel:' . $body;
		}

		/* Schemes that esc_url handles reliably when explicitly allowed. */
		if (
			str_starts_with( $lower, 'mailto:' )
			|| str_starts_with( $lower, 'sms:' )
			|| str_starts_with( $lower, 'http:' )
			|| str_starts_with( $lower, 'https:' )
		) {
			$u = esc_url( $raw, $protocols );
			return is_string( $u ) ? $u : '';
		}

		/*
		 * Plain phone-like string (digits / separators only, no scheme).
		 * Includes `.` for US formats like 555.123.4567.
		 */
		if (
			preg_match( '/^\+?[\d\s()\-.\/]+$/u', $raw )
			&& ! str_contains( $raw, '://' )
			&& ! str_contains( $raw, ':' )
		) {
			$digits_only = preg_replace( '/\D/', '', $raw );
			if ( is_string( $digits_only ) && strlen( $digits_only ) >= 7 ) {
				$normalized = preg_replace( '/[^\d+]/', '', $raw );
				if ( is_string( $normalized ) && '' !== $normalized ) {
					$dial = $this->finalize_us_tel_dial_for_href( $normalized );
					return 'tel:' . $dial;
				}
			}
		}

		$u = esc_url( $raw, $protocols );
		if ( is_string( $u ) && '' !== $u ) {
			return $u;
		}

		if ( is_email( $raw ) ) {
			return 'mailto:' . $raw;
		}

		return '';
	}

	/**
	 * Icon set for AI quick-reply / action buttons. Key => inner SVG markup
	 * (24x24, stroke-based to inherit currentColor). Shared by widget + admin picker.
	 *
	 * @return array<string,string>
	 */
	public static function livechat_ai_icon_set(): array {
		return array(
			'stethoscope' => '<path d="M6 3v6a4 4 0 0 0 8 0V3"/><path d="M6 3H4M14 3h2M10 13v3a5 5 0 0 0 10 0v-1"/><circle cx="20" cy="12" r="2"/>',
			'dollar'      => '<path d="M12 1v22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
			'shield'      => '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
			'pin'         => '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
			'calendar'    => '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
			'phone'       => '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
			'directions'  => '<path d="M9 20l-6 3V6l6-3 6 3 6-3v17l-6 3-6-3z"/><path d="M9 3v17M15 6v17"/>',
			'chat'        => '<path d="M21 15a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z"/>',
			'question'    => '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 .9-1 1.7"/><path d="M12 17h.01"/>',
			'clock'       => '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
			'info'        => '<circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>',
			'heart'       => '<path d="M20.8 6.6a5 5 0 0 0-7.1 0L12 8.3l-1.7-1.7a5 5 0 1 0-7.1 7.1L12 22l8.8-8.3a5 5 0 0 0 0-7.1z"/>',
			'mail'        => '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
			'user'        => '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
		);
	}

	/**
	 * Renders the floating livechat widget in wp_footer.
	 *
	 * @return void
	 */
	public function render_livechat_widget(): void {
		// An inline [nexulesuite_chat] on this page already provides the chat; two would collide on element ids.
		if ( self::$suppress_floating_livechat ) {
			return;
		}

		/*
		 * Site-wide floating FAB is retired. Chat only appears in the Acc & Lang dock,
		 * and must honor that button's display conditions. If chat is not allowed on
		 * this page, skip the whole widget (no legacy corner bubble).
		 */
		if ( class_exists( '\\nexulesuite_\\Frontend\\Accessibility_Language' ) ) {
			$a11y_vis = \nexulesuite_\Frontend\Accessibility_Language::dock_button_visibility();
			if ( empty( $a11y_vis['chat'] ) ) {
				return;
			}
		}

		$parts = $this->build_livechat_parts( 'floating' );
		if ( null === $parts ) {
			return;
		}

		$this->enqueue_footer_inline_style( 'nexulesuite_livechat-widget', $parts['css'] );
		$this->enqueue_footer_inline_script( 'nexulesuite_livechat-widget', $parts['js'] );

		echo wp_kses( $parts['html'], self::allowed_embed_html() );
	}

	/**
	 * Builds the livechat widget's scoped CSS, HTML and JS.
	 *
	 * Every presentation runs through here so they cannot drift apart:
	 *   'floating' — the wp_footer bubble that expands into a panel.
	 *   'inline'   — the same panel dropped straight into the page DOM by `[nexulesuite_chat]`,
	 *                sitting in the flow like any other section.
	 *   'embed'    — the same panel as a standalone document, for the iframe HTML embed code.
	 *
	 * @param string $mode 'floating', 'inline' or 'embed'.
	 * @return array{css:string,html:string,js:string}|null Null when livechat is disabled in settings.
	 */
	private function build_livechat_parts( string $mode = 'floating' ): ?array {
		$is_embed  = ( 'embed' === $mode );
		$is_inline = ( 'inline' === $mode );
		// Both render the panel open and chrome-less; only their container differs.
		$is_panel  = ( $is_embed || $is_inline );

		$opt = get_option( self::GENERAL_SETTINGS_OPTION_KEY, array() );
		if ( ! is_array( $opt ) || empty( $opt['enableLivechat'] ?? false ) ) {
			return null;
		}

		/* ── Read settings with safe defaults ── */
		$chat_title   = sanitize_text_field( (string) ( $opt['chatTitle']       ?? 'Customer Support' ) );
		$chat_badge   = sanitize_text_field( (string) ( $opt['chatBadge']       ?? 'Online' ) );
		$chat_content = sanitize_textarea_field( (string) ( $opt['chatContent'] ?? '' ) );
		/* Avatar / bubble image: attachment URL or legacy data URI (must match sanitizer on save). */
		$btn_raw_img = trim( (string) ( $opt['chatButtonImage'] ?? '' ) );
		// Prefer Acc & Lang dock image when set (same photo on FAB + chat panel).
		if ( class_exists( '\\nexulesuite_\\Frontend\\Accessibility_Language' ) ) {
			$a11y_set = \nexulesuite_\Frontend\Accessibility_Language::get_settings();
			$a11y_img = trim( (string) ( $a11y_set['liveChatButtonImage'] ?? '' ) );
			if ( '' !== $a11y_img ) {
				$btn_raw_img = $a11y_img;
			}
		} else {
			$a11y_opt = get_option( 'nexulesuite_a11y_lang_v1', array() );
			if ( is_array( $a11y_opt ) ) {
				$a11y_img = trim( (string) ( $a11y_opt['liveChatButtonImage'] ?? '' ) );
				if ( '' !== $a11y_img ) {
					$btn_raw_img = $a11y_img;
				}
			}
		}
		// Raw value; escaped at output (esc_attr for data: image URIs, esc_url for normal URLs).
		$btn_image = $btn_raw_img;
		$chat_side = ( 'left' === sanitize_text_field( (string) ( $opt['chatAlign'] ?? 'right' ) ) ) ? 'left' : 'right';
		$chat_padding = max( 4, min( 40, (int) ( $opt['chatPadding']            ?? 12 ) ) );
		$chat_radius  = max( 0, min( 50, (int) ( $opt['chatBorderRadius']       ?? 12 ) ) );
		$btn_bg       = sanitize_hex_color( (string) ( $opt['primaryBtnBg']     ?? '#2563eb' ) ) ?: '#2563eb';
		$btn_text_col = sanitize_hex_color( (string) ( $opt['primaryBtnText']   ?? '#ffffff' ) ) ?: '#ffffff';
		$chat_bubble_bg = sanitize_hex_color( (string) ( $opt['chatBubbleBg'] ?? '#ffffff' ) ) ?: '#ffffff';
		$chat_online_dot = sanitize_hex_color( (string) ( $opt['chatOnlineDotColor'] ?? '#00ff6a' ) ) ?: '#00ff6a';
		$hover_effect = sanitize_text_field( (string) ( $opt['chatHoverEffect'] ?? 'lift' ) );
		$font         = sanitize_text_field( (string) ( $opt['globalFont']      ?? 'Inter' ) );

		/*
		 * Button labels: mirror the admin React preview which uses "|| fallback".
		 * If the user has left a field blank the default text shows — identical behaviour
		 * to the Real-time Preview panel in Settings → Livechat & Styling.
		 */
		$btn1_label = sanitize_text_field( (string) ( $opt['chatFormButton']  ?? '' ) ) ?: 'Start Conversation';
		$btn1_raw   = (string) ( $opt['chatFormButtonLink']                      ?? '' );
		$btn2_label = sanitize_text_field( (string) ( $opt['chatButtonTwo']   ?? '' ) ) ?: "What's App";
		$btn2_raw   = (string) ( $opt['chatButtonTwoLink']                       ?? '' );
		$btn3_label = sanitize_text_field( (string) ( $opt['chatButtonThird'] ?? '' ) ) ?: 'E-mail';
		$btn3_raw   = (string) ( $opt['chatButtonThirdLink']                     ?? '' );

		/*
		 * AI chat mode: match the REST backend (ai_resolve_mode / ai_settings).
		 * Direct (Model API) needs no server URL — only server mode does.
		 * The old gate required aiServerUrl for every install, so direct-mode
		 * sites rendered header + greeting with no composer at all.
		 */
		$ai_server_url = trim( (string) ( $opt['aiServerUrl'] ?? '' ) );
		$ai_conn_mode  = strtolower( trim( (string) ( $opt['aiConnMode'] ?? '' ) ) );
		if ( ! in_array( $ai_conn_mode, array( 'direct', 'server' ), true ) ) {
			$ai_conn_mode = ( '' !== $ai_server_url ) ? 'server' : 'direct';
		}
		$ai_enabled = ! empty( $opt['aiEnabled'] ) && (
			( 'direct' === $ai_conn_mode ) ||
			( 'server' === $ai_conn_mode && '' !== $ai_server_url )
		);
		$ai_welcome       = sanitize_text_field( (string) ( $opt['aiWelcomeMessage'] ?? '' ) );
		$ai_placeholder   = sanitize_text_field( (string) ( $opt['aiInputPlaceholder'] ?? '' ) );
		if ( '' === trim( $ai_placeholder ) ) {
			$ai_placeholder = __( 'Write a message…', 'nexus-lead-suite' );
		}
		$ai_launch_label  = $btn1_label; // reuse the primary "Start Conversation" label.
		$ai_allow_images  = $ai_enabled && ! empty( $opt['aiAllowImages'] );

		/* ── FAQ / conditional quick-reply buttons (deterministic, client-side) ── */
		$ai_icon_svgs = self::livechat_ai_icon_set();
		$ai_faq_items = array();
		if ( $ai_enabled && ! empty( $opt['aiFaqEnabled'] ) && ! empty( $opt['aiFaqFlows'] ) && is_array( $opt['aiFaqFlows'] ) ) {
			foreach ( $opt['aiFaqFlows'] as $faq ) {
				if ( ! is_array( $faq ) ) {
					continue;
				}
				$faq_label = trim( sanitize_text_field( (string) ( $faq['label'] ?? '' ) ) );
				if ( '' === $faq_label ) {
					continue;
				}
				$faq_follow = array();
				$raw_follow = isset( $faq['followups'] ) && is_array( $faq['followups'] ) ? $faq['followups'] : array();
				foreach ( $raw_follow as $fu ) {
					if ( ! is_array( $fu ) ) {
						continue;
					}
					$fu_label = trim( sanitize_text_field( (string) ( $fu['label'] ?? '' ) ) );
					if ( '' === $fu_label ) {
						continue;
					}
					$faq_follow[] = array(
						'label'  => $fu_label,
						'answer' => sanitize_textarea_field( (string) ( $fu['answer'] ?? '' ) ),
					);
				}
				$faq_icon = sanitize_key( (string) ( $faq['icon'] ?? '' ) );
				if ( ! isset( $ai_icon_svgs[ $faq_icon ] ) ) {
					$faq_icon = '';
				}
				$ai_faq_items[] = array(
					'label'     => $faq_label,
					'answer'    => sanitize_textarea_field( (string) ( $faq['answer'] ?? '' ) ),
					'icon'      => $faq_icon,
					'followups' => $faq_follow,
				);
			}
		}

		/* ── AI quick-action buttons (Book / Call / Directions, reference-style) ── */
		$ai_actions      = array();
		$ai_action_forms = array(); // idx => rendered shortcode HTML, opened inline in the chat on click.
		if ( $ai_enabled && ! empty( $opt['aiActions'] ) && is_array( $opt['aiActions'] ) ) {
			foreach ( $opt['aiActions'] as $act ) {
				if ( ! is_array( $act ) ) {
					continue;
				}
				$act_label = trim( sanitize_text_field( (string) ( $act['label'] ?? '' ) ) );
				if ( '' === $act_label ) {
					continue;
				}
				$act_icon = sanitize_key( (string) ( $act['icon'] ?? '' ) );
				if ( ! isset( $ai_icon_svgs[ $act_icon ] ) ) {
					$act_icon = '';
				}
				$act_url_raw = trim( (string) ( $act['url'] ?? '' ) );
				/*
				 * A form shortcode pasted directly into the link field (e.g. [nexulesuite_form id="5"])
				 * → render it once and open it inline inside the chat, instead of treating it as a link.
				 */
				if ( preg_match( '/^\[[a-z][a-z0-9_\-]*(\s[^\]]*)?\]$/is', $act_url_raw ) ) {
					$rendered = do_shortcode( $act_url_raw );
					if ( '' !== trim( (string) $rendered ) ) {
						$idx                     = count( $ai_action_forms );
						$ai_action_forms[ $idx ] = $rendered;
						$act_url                 = '#form-inline-' . $idx;
					} else {
						$act_url = ''; // shortcode produced nothing (form missing / plugin inactive) → no target.
					}
				} else {
					$act_url = $this->sanitize_livechat_button_href( $act_url_raw );
				}
				$ai_actions[] = array(
					'label' => $act_label,
					'icon'  => $act_icon,
					'url'   => $act_url,
				);
			}
		}

		$ai_disclaimer    = $ai_enabled ? sanitize_textarea_field( (string) ( $opt['aiDisclaimer'] ?? '' ) ) : '';
		$ai_trigger_label = sanitize_text_field( (string) ( $opt['aiTriggerLabel'] ?? '' ) );
		$ai_lead_enabled  = $ai_enabled && ! empty( $opt['aiLeadEnabled'] );
		$ai_lead_offer    = sanitize_text_field( (string) ( $opt['aiLeadOffer'] ?? '' ) );
		if ( '' === trim( $ai_lead_offer ) ) {
			$ai_lead_offer = __( 'Would you like our team to reach out to you?', 'nexus-lead-suite' );
		}

		/* ── Contact-form shortcode for the "Get in Touch" action (url = #form) ── */
		$ai_contact_shortcode = $ai_enabled ? trim( (string) ( $opt['aiContactShortcode'] ?? '' ) ) : '';
		$ai_contact_form_html = '';
		if ( '' !== $ai_contact_shortcode ) {
			$ai_contact_form_html = do_shortcode( $ai_contact_shortcode );
		}

		/*
		 * Parse a raw link value into type + resolved value:
		 *   'popup:{eventName}' → ['popup', 'eventName']
		 *   '#open-form'        → ['popup', 'open-form']   (backward compat)
		 *   anything else       → ['link',  sanitized href (tel/mailto/https)]
		 */
		$href_protocols = array( 'http', 'https', 'tel', 'mailto', 'sms', 'ftp', 'ftps' );
		$parse_link     = function ( string $raw ): array {
			$raw = trim( $raw );
			if ( str_starts_with( $raw, 'popup:' ) ) {
				return array( 'popup', sanitize_text_field( substr( $raw, 6 ) ) );
			}
			if ( '#open-form' === $raw ) {
				return array( 'popup', 'open-form' );
			}
			return array( 'link', $this->sanitize_livechat_button_href( $raw ) );
		};

		[ $btn1_type, $btn1_val ] = $parse_link( $btn1_raw );
		[ $btn2_type, $btn2_val ] = $parse_link( $btn2_raw );
		[ $btn3_type, $btn3_val ] = $parse_link( $btn3_raw );

		$btn1_raw_trim    = trim( $btn1_raw );
		$btn1_is_lead_entry = in_array(
			$btn1_raw_trim,
			array( '#lead', '#form', '#contact-form', '#contactform' ),
			true
		);

		$btn1_has_action = ( 'popup' === $btn1_type ) ? ( '' !== $btn1_val ) : ( '' !== $btn1_val );
		$btn2_has_action = ( 'popup' === $btn2_type ) ? ( '' !== $btn2_val ) : ( '' !== $btn2_val );
		$btn3_has_action = ( 'popup' === $btn3_type ) ? ( '' !== $btn3_val ) : ( '' !== $btn3_val );
		$has_any_action_btn = $btn1_has_action || $btn2_has_action || $btn3_has_action;
		$has_inline_popup_btn = ( 'popup' === $btn1_type && '' !== $btn1_val );

		/*
		 * Lead gate: collect contact details before the AI chat opens.
		 * Only when button 1 is explicitly #lead / #form / #contact-form (admin docs).
		 * An empty button-1 link used to force the gate and hide the composer; with
		 * AI enabled that left visitors on a blank greeting panel.
		 */
		$ai_lead_gate = $ai_enabled && $btn1_is_lead_entry;

		/* Floating bubble: skip the empty home screen and open the composer when AI is the only path. */
		$ai_open_on_launch = $ai_enabled && ! $ai_lead_gate && ! $btn1_has_action && ! $btn2_has_action && ! $btn3_has_action;

		/* ── Inline popup clone (button 1 + Popup): body only — header uses livechat avatar + title (no popup name/sub-heading). ── */
		$inline_popup_html = '';
		if ( $has_inline_popup_btn ) {
			// Special case: "popup:form:{formId}" opens the Form Builder form inline (no Popup required).
			if ( str_starts_with( $btn1_val, 'form:' ) ) {
				$form_id = sanitize_text_field( substr( $btn1_val, 5 ) );
				if ( '' !== $form_id ) {
					$inline_popup_html = do_shortcode( sprintf( '[nexulesuite_form id="%s"]', esc_attr( $form_id ) ) );
				}
				if ( '' === trim( (string) $inline_popup_html ) ) {
					$inline_popup_html = '<p class="nexulesuite_chat-inline-popup-missing">' . esc_html__( 'Selected form was not found. Pick another form under Settings → Livechat.', 'nexus-lead-suite' ) . '</p>';
				}
			} else {
				$p_inline = $this->find_popup_by_event_or_id( $btn1_val );
				if ( is_array( $p_inline ) ) {
					$c_in = isset( $p_inline['content'] ) ? (string) $p_inline['content'] : '';
					ob_start();
					if ( '' !== trim( $c_in ) ) {
						// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- do_shortcode() output; shortcode callbacks escape their own markup. Input is pre-sanitized with wp_kses_post().
						echo do_shortcode( wp_kses_post( $c_in ) );
					} else {
						echo '<p class="nexulesuite_chat-inline-popup-missing">' . esc_html__( 'This popup has no body content yet. Add content under Nexus → Popups.', 'nexus-lead-suite' ) . '</p>';
					}
					$inline_popup_html = (string) ob_get_clean();
				} else {
					$inline_popup_html = '<p class="nexulesuite_chat-inline-popup-missing">' . esc_html__( 'Selected popup was not found. Pick another popup under Settings → Livechat.', 'nexus-lead-suite' ) . '</p>';
				}
			}
		}

		/* ── Widget dock: left or right edge of the viewport ── */
		$float_css = ( 'left' === $chat_side ) ? 'left:20px;right:auto;' : 'right:20px;left:auto;';
		$align_cls = ( 'left' === $chat_side ) ? ' nexulesuite_chat--left' : '';
		/* Floating site bubble always lives in Acc & Lang dock — never a second corner FAB. */
		$dock_cls  = $is_panel ? '' : ' nexulesuite_chat-widget--dock';

		/* ── Hover CSS class ── */
		$allowed_hover = array( 'lift', 'scale', 'glow', 'shake', 'rotate', 'darken' );
		$hover_cls     = in_array( $hover_effect, $allowed_hover, true ) ? 'nexulesuite_chat-btn--' . $hover_effect : '';

		/* ── Shared inline style for action buttons ── */
		$btn_style      = sprintf(
			'background:%s;color:%s;padding:%dpx;border-radius:%dpx;',
			esc_attr( $btn_bg ),
			esc_attr( $btn_text_col ),
			$chat_padding,
			$chat_radius
		);
		$btn_style_muted = sprintf(
			'background:%s;color:%s;padding:%dpx;border-radius:%dpx;opacity:.9;',
			esc_attr( $btn_bg ),
			esc_attr( $btn_text_col ),
			$chat_padding,
			$chat_radius
		);
		ob_start();
		?>
		/* ── Nexus Lead Suite — Livechat Widget ── */
		.nexulesuite_chat-widget{position:fixed;bottom:24px;z-index:99997;display:flex;flex-direction:column;align-items:flex-end;gap:12px;<?php echo esc_attr( $float_css ); ?>font-family:'<?php echo esc_attr( $font ); ?>',sans-serif;}
		.nexulesuite_chat-widget.nexulesuite_chat--left{align-items:flex-start;}

		/* Design tokens — mirror the admin SPA (slate surfaces, 8/12/16px radii, sm/md shadows). */
		.nexulesuite_chat-widget{
			--nls-primary:<?php echo esc_attr( $btn_bg ); ?>;
			--nls-on-primary:<?php echo esc_attr( $btn_text_col ); ?>;
			--nls-primary-tint:#eff6ff;
			--nls-primary-tint:color-mix(in srgb, var(--nls-primary), #fff 90%);
			--nls-primary-ring:rgba(37,99,235,.18);
			--nls-primary-ring:color-mix(in srgb, var(--nls-primary), transparent 82%);
			/* Header chrome: deep navy derived from the brand colour (reference: Curative GI header). */
			--nls-head-bg:#16213c;
			--nls-head-bg:color-mix(in srgb, var(--nls-primary), #0b1220 80%);
			--nls-head-soft:rgba(255,255,255,.09);
			--nls-head-line:rgba(255,255,255,.16);
			/* Bot bubble: faint brand-tinted panel instead of a shadowed white card. */
			--nls-bot-bubble:#eef3fb;
			--nls-bot-bubble:color-mix(in srgb, var(--nls-primary), #f8fafc 94%);
			--nls-bot-border:#e2eaf7;
			--nls-bot-border:color-mix(in srgb, var(--nls-primary), #fff 87%);
			--nls-surface:#ffffff;
			--nls-canvas:#f6f8fc;
			--nls-border:#e2e8f0;
			--nls-border-soft:#f1f5f9;
			--nls-field-border:#cbd5e1;
			--nls-ink:#0f172a;
			--nls-ink-2:#1e293b;
			--nls-ink-3:#475569;
			--nls-muted:#94a3b8;
			/* Timestamp metrics, shared so the bot avatar can be centred on the bubble rather than the column. */
			--nls-time-size:10.5px;
			--nls-bubble-gap:4px;
			--nls-radius-xs:6px;
			--nls-radius-sm:8px;
			--nls-radius:12px;
			--nls-radius-lg:16px;
			--nls-shadow-sm:0 1px 2px 0 rgba(15,23,42,.05);
			--nls-shadow-md:0 4px 12px -2px rgba(15,23,42,.10);
			--nls-shadow-lg:0 12px 32px -8px rgba(15,23,42,.18);
		}

		/*
		 * Theme isolation. Themes style the bare `button` element — Astra ships
		 * `button{padding:16px 28px;text-transform:uppercase;letter-spacing:1px;line-height:1em}` —
		 * and every property the widget does not itself declare leaks in, which is what turned the
		 * quick-reply labels into ALL CAPS and stretched the icon-only buttons into ovals.
		 * :where() keeps this reset at plain class specificity, so the component rules below still
		 * win, while a theme's element selector never does. Matching on the class prefix leaves any
		 * form embedded in the chat (its own stylesheet) untouched.
		 */
		.nexulesuite_chat-widget :where([class*="nexulesuite_chat-"]){box-sizing:border-box;}

		/* Invisible scrollbars: the transcript and inline views scroll, but draw no scrollbar track. */
		.nexulesuite_chat-ai-messages,
		.nexulesuite_chat-panel__body,
		.nexulesuite_chat-inline-popup-body{scrollbar-width:none;-ms-overflow-style:none;}
		.nexulesuite_chat-ai-messages::-webkit-scrollbar,
		.nexulesuite_chat-panel__body::-webkit-scrollbar,
		.nexulesuite_chat-inline-popup-body::-webkit-scrollbar{display:none;width:0;height:0;}
		.nexulesuite_chat-widget :where(
			button[class*="nexulesuite_chat-"],
			input[class*="nexulesuite_chat-"],
			textarea[class*="nexulesuite_chat-"],
			a[class*="nexulesuite_chat-"]
		){margin:0;padding:0;border:0;border-radius:0;background:none;box-shadow:none;color:inherit;font-family:inherit;font-size:inherit;font-weight:inherit;line-height:1.45;letter-spacing:normal;text-transform:none;text-align:inherit;text-decoration:none;min-width:0;min-height:0;width:auto;height:auto;-webkit-appearance:none;appearance:none;}

		/* Panel — taller default home view; compact height when inline form is open (no dead space below short forms). */
		/* Explicit height (not only max-height) so AI column flex can reserve space for the composer. */
		.nexulesuite_chat-panel{display:none;width:320px;height:min(510px,calc(100vh - 130px));min-height:0;max-height:min(510px,calc(100vh - 130px));background:<?php echo esc_attr( $chat_bubble_bg ); ?>;border-radius:16px;box-shadow:0 16px 48px rgba(15,23,42,.18);overflow:hidden;flex-direction:column;box-sizing:border-box;}
		.nexulesuite_chat-panel.nexulesuite_chat-panel--inline-form{height:auto;min-height:0;max-height:min(510px,calc(100vh - 130px));}
		.nexulesuite_chat-panel.nexulesuite_chat--open{display:flex;animation:nexulesuite_chat-pop-in .22s ease;}
		/* When AI is open, the AI column is the only flex child that should grow. */
		.nexulesuite_chat-panel.nexulesuite_chat-panel--ai-active{display:flex;flex-direction:column;min-height:0;overflow:hidden;}
		@keyframes nexulesuite_chat-pop-in{from{opacity:0;transform:translateY(16px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}

		/* Header — deep navy bar with a squared avatar tile (reference: Curative GI header) */
		.nexulesuite_chat-panel__head{display:flex;align-items:center;gap:13px;padding:18px 18px 16px;background:var(--nls-head-bg);flex-shrink:0;}
		.nexulesuite_chat-panel__avatar{width:44px;height:44px;border-radius:50%;flex-shrink:0;background:var(--nls-head-soft);display:flex;align-items:center;justify-content:center;overflow:hidden;border:1px solid var(--nls-head-line);}
		.nexulesuite_chat-panel__avatar img{width:44px;height:44px;border-radius:50%;object-fit:cover;}
		.nexulesuite_chat-panel__avatar svg{width:22px;height:22px;fill:none;stroke:#fff;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}
		.nexulesuite_chat-panel__info{flex:1;min-width:0;}
		.nexulesuite_chat-panel__title{font-size:14.5px;font-weight:600;color:#fff;margin:0;padding:0;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
		.nexulesuite_chat-panel__badge{font-size:11px;font-weight:400;text-transform:none;letter-spacing:0;color:#fff;opacity:.8;margin:0;margin-top:5px;line-height:1.2;display:flex;align-items:center;gap:6px;}
		/* Online indicator dot (badge + trigger) */
		.nexulesuite_chat-online-dot{width:9px;height:9px;border-radius:999px;flex:0 0 auto;display:inline-block;background:<?php echo esc_attr( $chat_online_dot ); ?>;box-shadow:0 0 0 2px rgba(255,255,255,.22),0 0 16px color-mix(in srgb, <?php echo esc_attr( $chat_online_dot ); ?>, transparent 15%),0 0 36px color-mix(in srgb, <?php echo esc_attr( $chat_online_dot ); ?>, transparent 45%);animation:nexulesuite_chat-online-blink 1.05s ease-in-out infinite;position:relative;z-index:2;}
		@keyframes nexulesuite_chat-online-blink{0%,100%{transform:scale(.92);opacity:.75;filter:saturate(1.2) brightness(1.05)}50%{transform:scale(1.12);opacity:1;filter:saturate(1.55) brightness(1.25);box-shadow:0 0 0 2px rgba(255,255,255,.35),0 0 18px rgba(0,255,106,.95),0 0 44px rgba(0,255,106,.75)}}
		@media (prefers-reduced-motion: reduce){.nexulesuite_chat-online-dot{animation:none}}
		.nexulesuite_chat-panel__close{background:var(--nls-head-soft);border:1px solid var(--nls-head-line);color:#fff;width:30px;height:30px;border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:13px;line-height:1;flex-shrink:0;transition:background .2s,transform .25s cubic-bezier(.34,1.56,.64,1);}
		.nexulesuite_chat-panel__close:hover{background:rgba(255,255,255,.22);transform:rotate(90deg) scale(1.05);}

		/* Body — expanded content zone */
		.nexulesuite_chat-panel__body{flex:1 1 auto;padding:26px 24px;background:#f8fafc;font-size:14px;color:#475569;line-height:1.65;border-bottom:1px solid #f1f5f9;min-height:96px;}

		/* Buttons area */
		.nexulesuite_chat-panel__btns{padding:18px 22px 22px;display:flex;flex-direction:column;gap:10px;background:<?php echo esc_attr( $chat_bubble_bg ); ?>;flex-shrink:0;}
		.nexulesuite_chat-panel__btns a,
		.nexulesuite_chat-panel__btns button{display:block;width:100%;box-sizing:border-box;text-align:center;text-decoration:none !important;font-weight:500;font-size:13.5px;text-transform:none;letter-spacing:0;cursor:pointer;border:none;line-height:1.3;transition:transform .18s ease,box-shadow .18s ease,filter .18s ease;}
		.nexulesuite_chat-panel__btns-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
		.nexulesuite_chat-panel__btns-row a,
		.nexulesuite_chat-panel__btns-row button{display:flex;align-items:center;justify-content:center;}

		/* ── Inline Form View ── */
		.nexulesuite_chat-form-view{display:none;flex-direction:column;background:<?php echo esc_attr( $chat_bubble_bg ); ?>;flex:1 1 auto;min-height:0;}
		.nexulesuite_chat-panel.nexulesuite_chat-panel--inline-form .nexulesuite_chat-form-view{flex:0 1 auto;}
		.nexulesuite_chat-form-view.nexulesuite_chat-form--active{display:flex;animation:nexulesuite_chat-pop-in .2s ease;}
		.nexulesuite_chat-form-view__head{display:flex;align-items:center;gap:13px;padding:16px 18px;background:var(--nls-head-bg);border-bottom:1px solid var(--nls-head-line);flex-shrink:0;}
		.nexulesuite_chat-form-view__back{background:var(--nls-head-soft);border:1px solid var(--nls-head-line);color:#fff;width:30px;height:30px;border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;line-height:1;flex-shrink:0;transition:background .2s;}
		.nexulesuite_chat-form-view__back:hover{background:rgba(255,255,255,.22);}
		.nexulesuite_chat-form-view__avatar{width:40px;height:40px;border-radius:50%;flex-shrink:0;background:var(--nls-head-soft);display:flex;align-items:center;justify-content:center;overflow:hidden;border:1px solid var(--nls-head-line);}
		.nexulesuite_chat-form-view__avatar img{width:40px;height:40px;border-radius:50%;object-fit:cover;}
		.nexulesuite_chat-form-view__avatar svg{width:20px;height:20px;fill:none;stroke:#fff;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}
		.nexulesuite_chat-form-view__info{flex:1;min-width:0;}
		.nexulesuite_chat-form-view__heading{font-size:14.5px;font-weight:600;color:#fff;margin:0;padding:0;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
		.nexulesuite_chat-inline-popup-body{flex:1 1 auto;max-height:min(72vh,560px);overflow-y:auto;padding:18px 20px 22px;background:#fff;}
		.nexulesuite_chat-panel.nexulesuite_chat-panel--inline-form .nexulesuite_chat-inline-popup-body{flex:0 1 auto;}
		.nexulesuite_chat-inline-popup-body .nexulesuite_st-form{margin:0;border:none!important;box-shadow:none!important;background:transparent!important;}
		.nexulesuite_chat-inline-popup-body .nexulesuite_st-form>form.nexulesuite_st-form__body,
		.nexulesuite_chat-inline-popup-body form.nexulesuite_st-form__body{
			border:none!important;box-shadow:none!important;outline:none!important;background:transparent!important;
			padding:0!important;margin:0!important;border-radius:0!important;
		}
		.nexulesuite_chat-inline-popup-missing{font-size:12px;color:#b45309;margin:0;line-height:1.5;}

		/* Lead gate — contact form shown before the AI chat when button 1 has no link/popup. */
		.nexulesuite_chat-leadgate-view{display:none;flex-direction:column;flex:1 1 auto;min-height:0;background:var(--nls-canvas);}
		.nexulesuite_chat-panel.nexulesuite_chat-panel--lead-gate .nexulesuite_chat-leadgate-view{display:flex;}
		.nexulesuite_chat-panel.nexulesuite_chat-panel--lead-gate .nexulesuite_chat-panel__body,
		.nexulesuite_chat-panel.nexulesuite_chat-panel--lead-gate .nexulesuite_chat-panel__btns{display:none!important;}
		.nexulesuite_chat-leadgate-body{flex:1 1 auto;display:flex;flex-direction:column;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:14px 16px 16px;scrollbar-width:none;-ms-overflow-style:none;}
		.nexulesuite_chat-leadgate-body::-webkit-scrollbar{display:none;width:0;height:0;}
		.nexulesuite_chat-leadgate-foot{margin:0;padding:10px 4px 2px;font-size:11px;line-height:1.45;color:var(--nls-muted);text-align:center;flex:0 0 auto;}
		/* Card stretches to fill the panel so the body does not look hollow below the fields. */
		.nexulesuite_chat-leadgate-body .nexulesuite_chat-ai-leadcard{align-self:stretch;flex:0 1 auto;width:100%;max-width:100%;margin:0;box-sizing:border-box;padding:20px 18px 18px;border-radius:var(--nls-radius-lg);gap:0;background:var(--nls-surface);border:1px solid var(--nls-border);box-shadow:var(--nls-shadow-sm);display:flex;flex-direction:column;min-height:auto;overflow:visible;}
		.nexulesuite_chat-leadgate-card__head{flex:0 0 auto;margin:0 0 16px;padding-bottom:14px;border-bottom:1px solid var(--nls-border-soft);text-align:center;}
		.nexulesuite_chat-leadgate-card__title{margin:0;font-size:15px;font-weight:600;line-height:1.25;color:var(--nls-ink);text-align:center;}
		.nexulesuite_chat-leadgate-card__sub{margin:6px 0 0;font-size:13px;font-weight:400;line-height:1.5;color:var(--nls-ink-3);text-align:center;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;}
		.nexulesuite_chat-leadgate-card__fields{flex:0 0 auto;display:flex;flex-direction:column;gap:12px;min-height:auto;overflow:visible;}
		.nexulesuite_chat-leadgate-card__foot{flex:0 0 auto;margin-top:0;padding-top:14px;display:flex;flex-direction:column;gap:10px;}
		.nexulesuite_chat-leadgate-body input#nexulesuite_chat-leadgate-phone{display:block!important;visibility:visible!important;opacity:1!important;flex:0 0 auto!important;min-height:46px!important;}
		.nexulesuite_chat-leadgate-hint{margin:0;font-size:11.5px;line-height:1.45;color:var(--nls-muted);text-align:center;}
		.nexulesuite_chat-leadgate-body input.nexulesuite_chat-ai-leadinput{display:block;width:100%!important;box-sizing:border-box!important;background:var(--nls-canvas)!important;border:1px solid var(--nls-field-border)!important;border-radius:10px!important;padding:12px 14px!important;margin:0!important;min-height:46px!important;height:auto!important;font-size:14px!important;line-height:1.45!important;font-family:inherit!important;color:var(--nls-ink-2)!important;box-shadow:none!important;-webkit-appearance:none;appearance:none;}
		.nexulesuite_chat-leadgate-body input.nexulesuite_chat-ai-leadinput::placeholder{color:var(--nls-muted)!important;opacity:1;}
		.nexulesuite_chat-leadgate-body input.nexulesuite_chat-ai-leadinput:focus{outline:none!important;border-color:var(--nls-primary)!important;box-shadow:0 0 0 3px var(--nls-primary-ring)!important;background:var(--nls-surface)!important;}
		.nexulesuite_chat-leadgate-body .nexulesuite_chat-ai-leaderr{margin:0;}
		.nexulesuite_chat-leadgate-body button.nexulesuite_chat-ai-leadsend{display:flex!important;align-items:center!important;justify-content:center!important;align-self:stretch;width:100%;margin:0;padding:13px 20px!important;border:none!important;border-radius:10px!important;background:var(--nls-primary)!important;color:var(--nls-on-primary)!important;font-family:inherit!important;font-size:14px!important;font-weight:600!important;line-height:1.2!important;text-align:center!important;cursor:pointer!important;box-shadow:var(--nls-shadow-sm)!important;text-transform:none!important;letter-spacing:normal!important;}
		.nexulesuite_chat-leadgate-body button.nexulesuite_chat-ai-leadsend:hover{filter:brightness(.94);color:var(--nls-on-primary)!important;}
		.nexulesuite_chat-leadgate-body button.nexulesuite_chat-ai-leadsend:disabled{opacity:.6;cursor:default!important;}
		.nexulesuite_chat-leadgate-body .nexulesuite_st-form{flex:1 1 auto;display:flex;flex-direction:column;min-height:0;margin:0;border:none!important;box-shadow:none!important;background:var(--nls-surface)!important;border:1px solid var(--nls-border)!important;border-radius:var(--nls-radius-lg)!important;padding:18px!important;box-sizing:border-box!important;}
		.nexulesuite_chat-leadgate-body .nexulesuite_st-form>form.nexulesuite_st-form__body,
		.nexulesuite_chat-leadgate-body form.nexulesuite_st-form__body{
			border:none!important;box-shadow:none!important;outline:none!important;background:transparent!important;
			padding:0!important;margin:0!important;border-radius:0!important;
		}

		/* Floating trigger: dock-only — never show the legacy corner bubble outside Acc & Lang. */
		.nexulesuite_chat-widget--dock > .nexulesuite_chat-trigger{display:none!important;}
		.nexulesuite_a11y-dock .nexulesuite_chat-trigger,
		.nexulesuite_a11y-chat-slot .nexulesuite_chat-trigger{display:flex!important;}
		.nexulesuite_chat-trigger{--nls-online-dot:9px;width:66px;height:66px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 24px rgba(0,0,0,.2);background:<?php echo esc_attr( $btn_bg ); ?>;overflow:visible;position:relative;transition:transform .18s ease,box-shadow .18s ease,filter .18s ease;}
		.nexulesuite_chat-trigger svg{width:26px;height:26px;fill:none;stroke:<?php echo esc_attr( $btn_text_col ); ?>;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;position:relative;z-index:1;}
		.nexulesuite_chat-trigger img.nexulesuite_chat-trigger__img{width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;position:relative;z-index:1;}
		/*
		 * Online blink on the circle rim (NE): center of the dot sits on the edge
		 * so ~50% is outside the round — not at the square corner (that looks fully outside).
		 * 14.645% ≈ (1 - cos(45°)) / 2 of the button.
		 */
		.nexulesuite_chat-trigger .nexulesuite_chat-online-dot{position:absolute;z-index:3;width:var(--nls-online-dot);height:var(--nls-online-dot);top:calc(14.645% - (var(--nls-online-dot) / 2));right:calc(14.645% - (var(--nls-online-dot) / 2));left:auto;bottom:auto;margin:0;}
		button.nexulesuite_chat-trigger--labeled{width:auto;height:auto;min-height:58px;border-radius:32px;padding:0 22px 0 20px;gap:11px;overflow:visible;}
		button.nexulesuite_chat-trigger--labeled .nexulesuite_chat-online-dot{top:calc(14.645% - (var(--nls-online-dot) / 2));right:calc(14.645% - (var(--nls-online-dot) / 2));}
		.nexulesuite_chat-trigger__label{color:<?php echo esc_attr( $btn_text_col ); ?>;font-family:inherit;font-weight:600;font-size:15px;line-height:1;white-space:nowrap;position:relative;z-index:1;}

		/* Hover effects */
		.nexulesuite_chat-btn--lift:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(0,0,0,.22);}
		.nexulesuite_chat-btn--scale:hover{transform:scale(1.1);}
		.nexulesuite_chat-btn--glow:hover{box-shadow:0 0 24px <?php echo esc_attr( $btn_bg ); ?>,0 6px 24px rgba(0,0,0,.18);}
		.nexulesuite_chat-btn--darken:hover{filter:brightness(.85);}
		.nexulesuite_chat-btn--shake:hover{animation:nexulesuite_chat-shake .4s ease;}
		.nexulesuite_chat-btn--rotate:hover{transform:rotate(6deg) scale(1.05);}
		@keyframes nexulesuite_chat-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-4px)}40%{transform:translateX(4px)}60%{transform:translateX(-3px)}80%{transform:translateX(3px)}}
		.nexulesuite_chat-panel__btns a.nexulesuite_chat-btn--lift:hover,
		.nexulesuite_chat-panel__btns button.nexulesuite_chat-btn--lift:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,.18);}
		.nexulesuite_chat-panel__btns a.nexulesuite_chat-btn--scale:hover,
		.nexulesuite_chat-panel__btns button.nexulesuite_chat-btn--scale:hover{transform:scale(1.04);}
		.nexulesuite_chat-panel__btns a.nexulesuite_chat-btn--glow:hover,
		.nexulesuite_chat-panel__btns button.nexulesuite_chat-btn--glow:hover{box-shadow:0 0 18px <?php echo esc_attr( $btn_bg ); ?>;}
		.nexulesuite_chat-panel__btns a.nexulesuite_chat-btn--darken:hover,
		.nexulesuite_chat-panel__btns button.nexulesuite_chat-btn--darken:hover{filter:brightness(.88);}

		/* Mobile / tablet: responsive panel (min usable ~320px wide), viewport-capped height, internal scroll */
		@media (max-width: 1023px){
		.nexulesuite_chat-widget{bottom:calc(100px + env(safe-area-inset-bottom,0px));z-index:999998;}
		.nexulesuite_chat-widget:not(.nexulesuite_chat--left){right:max(14px,env(safe-area-inset-right,0px));left:auto;}
		.nexulesuite_chat-widget.nexulesuite_chat--left{left:max(14px,env(safe-area-inset-left,0px));right:auto;}
		.nexulesuite_chat-trigger{--nls-online-dot:8px;width:54px;height:54px;}
		.nexulesuite_chat-trigger svg{width:22px;height:22px;}
		.nexulesuite_chat-trigger .nexulesuite_chat-online-dot{top:calc(14.645% - (var(--nls-online-dot) / 2));right:calc(14.645% - (var(--nls-online-dot) / 2));}
		/* Panel fits narrow screens (320px+); height clears trigger + sticky nav + safe areas */
		.nexulesuite_chat-panel{
			box-sizing:border-box;width:min(320px,calc(100vw - 24px - env(safe-area-inset-left,0px) - env(safe-area-inset-right,0px)));min-width:0;
			height:min(510px,calc(100vh - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px) - 164px));
			height:min(510px,calc(100svh - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px) - 164px));
			min-height:0;
			max-height:min(510px,calc(100vh - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px) - 164px));
			max-height:min(510px,calc(100svh - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px) - 164px));
			overflow:hidden;
		}
		.nexulesuite_chat-panel.nexulesuite_chat-panel--inline-form{
			height:auto;
			max-height:min(510px,calc(100vh - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px) - 164px));
			max-height:min(510px,calc(100svh - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px) - 164px));
		}
		.nexulesuite_chat-panel.nexulesuite_chat-panel--inline-form .nexulesuite_chat-form-view.nexulesuite_chat-form--active{flex:1 1 auto;min-height:0;overflow:hidden;}
		.nexulesuite_chat-panel.nexulesuite_chat-panel--inline-form .nexulesuite_chat-inline-popup-body{
			flex:1 1 auto;min-height:0;max-height:none;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:14px 16px 16px;
		}
		.nexulesuite_chat-panel__head{padding:18px 16px 16px;gap:12px;}
		.nexulesuite_chat-panel__avatar,.nexulesuite_chat-panel__avatar img{width:46px;height:46px;}
		.nexulesuite_chat-panel__avatar svg{width:22px;height:22px;}
		.nexulesuite_chat-panel__title{font-size:14px;}
		.nexulesuite_chat-panel__body{min-height:0;flex:1 1 auto;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:18px 16px;}
		.nexulesuite_chat-panel__btns{padding:14px 16px 16px;}
		.nexulesuite_chat-form-view{min-height:0;}
		.nexulesuite_chat-form-view__head{padding:16px 14px;gap:12px;}
		.nexulesuite_chat-form-view__avatar,.nexulesuite_chat-form-view__avatar img{width:44px;height:44px;}
		.nexulesuite_chat-form-view__avatar svg{width:22px;height:22px;}
		.nexulesuite_chat-form-view__heading{font-size:14px;}
		}
		/* Very small phones: tighter chrome, keep ≥~296px content width at 320 CSS px viewport */
		@media (max-width: 360px){
		.nexulesuite_chat-panel{width:min(320px,calc(100vw - 16px - env(safe-area-inset-left,0px) - env(safe-area-inset-right,0px)));}
		.nexulesuite_chat-panel__head{padding:16px 12px 14px;}
		.nexulesuite_chat-panel__body,.nexulesuite_chat-panel__btns{padding-left:12px;padding-right:12px;}
		.nexulesuite_chat-inline-popup-body{padding-left:12px;padding-right:12px;}
		}

		/* ── AI chat view ── */
		/*
		 * Strict column: ONE scroll region (messages + FAQ chips), then optional action bar,
		 * then composer — all flex siblings. Composer is flex:0 0 auto so panel overflow:hidden
		 * + border-radius never slice the input. flex-basis:0 on the scroll region is required
		 * or a tall home transcript refuses to shrink and shoves the footer past the clip edge.
		 * (1.1.6 kept the action bar position:absolute inside the form; that still let the
		 * form’s box run past the panel foot when the host height was tight.)
		 */
		.nexulesuite_chat-ai-view{display:none;flex-direction:column;flex:1 1 0%;min-height:0;height:auto;max-height:100%;overflow:hidden;box-sizing:border-box;}
		.nexulesuite_chat-panel--ai-active .nexulesuite_chat-ai-view{display:flex;flex:1 1 0%;min-height:0;height:100%;max-height:100%;}
		/* Header — deep navy bar, squared avatar tile, quiet outlined tool buttons (reference style). */
		.nexulesuite_chat-ai-view__head{display:flex;align-items:center;gap:10px;padding:13px 14px;background:var(--nls-head-bg);color:#fff;flex:0 0 auto;}
		/* Back and reset are matching icon buttons, so the header reads as one row of controls. */
		.nexulesuite_chat-ai-view__back{flex:0 0 auto;width:30px;height:30px;display:flex;align-items:center;justify-content:center;background:var(--nls-head-soft);color:inherit;font-size:16px;line-height:1;border-radius:var(--nls-radius-sm);cursor:pointer;transition:background .15s;}
		.nexulesuite_chat-ai-view__back:hover{background:rgba(255,255,255,.22);}
		.nexulesuite_chat-ai-view__avatar{width:34px;height:34px;border-radius:9px;overflow:hidden;background:var(--nls-head-soft);border:1px solid var(--nls-head-line);display:flex;align-items:center;justify-content:center;flex:0 0 auto;}
		.nexulesuite_chat-ai-view__avatar img{width:100%;height:100%;object-fit:cover;}
		.nexulesuite_chat-ai-view__avatar svg{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}
		.nexulesuite_chat-ai-view__info{min-width:0;}
		.nexulesuite_chat-ai-view__heading{margin:0;font-weight:600;font-size:14px;line-height:1.2;letter-spacing:.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
		.nexulesuite_chat-ai-view__badge{margin:3px 0 0;font-size:11px;font-weight:400;opacity:.8;display:flex;align-items:center;gap:6px;text-transform:none;letter-spacing:0;}
		.nexulesuite_chat-ai-view__tools{margin-left:auto;flex:0 0 auto;display:flex;align-items:center;gap:6px;}
		.nexulesuite_chat-ai-view__tts,
		.nexulesuite_chat-ai-view__reset{flex:0 0 auto;background:var(--nls-head-soft);border:1px solid var(--nls-head-line);color:inherit;width:30px;height:30px;padding:0;border-radius:var(--nls-radius-sm);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .15s;}
		.nexulesuite_chat-ai-view__tts:hover,
		.nexulesuite_chat-ai-view__reset:hover{background:rgba(255,255,255,.22);}
		/* Higher specificity than the display:flex above, so JS can keep the button hidden where the browser has no speech synthesis. */
		.nexulesuite_chat-ai-view__tts[hidden]{display:none;}
		.nexulesuite_chat-ai-view__tts.is-on{background:rgba(255,255,255,.34);}
		.nexulesuite_chat-ai-view__tts.is-speaking{animation:nexulesuite_ai-tts-pulse 1.2s ease-in-out infinite;}
		@keyframes nexulesuite_ai-tts-pulse{0%,100%{box-shadow:0 0 0 0 rgba(255,255,255,.45)}50%{box-shadow:0 0 0 5px rgba(255,255,255,0)}}
		@media (prefers-reduced-motion: reduce){.nexulesuite_chat-ai-view__tts.is-speaking{animation:none}}
		.nexulesuite_chat-ai-view__tts svg,
		.nexulesuite_chat-ai-view__reset svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}
		.nexulesuite_chat-ai-view__tts .nexulesuite_chat-ai-tts__on{display:none;}
		.nexulesuite_chat-ai-view__tts.is-on .nexulesuite_chat-ai-tts__on{display:block;}
		.nexulesuite_chat-ai-view__tts.is-on .nexulesuite_chat-ai-tts__off{display:none;}
		.nexulesuite_chat-ai-messages{flex:1 1 0%;min-height:0;overflow-x:hidden;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;padding:20px 16px;display:flex;flex-direction:column;gap:12px;background:var(--nls-canvas);box-sizing:border-box;}
		/* Centred, not bottom-aligned: otherwise the bot avatar lines up with the timestamp, not the bubble. */
		.nexulesuite_chat-ai-row{display:flex;gap:8px;max-width:100%;align-items:center;}
		.nexulesuite_chat-ai-row--user{justify-content:flex-end;}
		.nexulesuite_chat-ai-row--bot{justify-content:flex-start;}
		/* Small squared navy tile, matching the header avatar (reference style). */
		.nexulesuite_chat-ai-bubavatar{width:28px;height:28px;border-radius:50%;flex:0 0 auto;background:var(--nls-head-bg);color:#fff;display:flex;align-items:center;justify-content:center;overflow:hidden;}
		/* The timestamp sits below the bubble in the same column; offsetting the avatar by its
		   full height makes the centred avatar line up with the bubble, not the column. */
		.nexulesuite_chat-ai-row--bot .nexulesuite_chat-ai-bubavatar{margin-bottom:calc(var(--nls-time-size) + var(--nls-bubble-gap));}
		.nexulesuite_chat-ai-bubavatar img{width:100%;height:100%;object-fit:cover;}
		.nexulesuite_chat-ai-bubavatar svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:2;}
		.nexulesuite_chat-ai-col{display:flex;flex-direction:column;gap:var(--nls-bubble-gap);max-width:80%;min-width:0;}
		.nexulesuite_chat-ai-row--bot .nexulesuite_chat-ai-col{align-items:flex-start;}
		.nexulesuite_chat-ai-row--user .nexulesuite_chat-ai-col{align-items:flex-end;}
		.nexulesuite_chat-ai-time{font-size:var(--nls-time-size);color:var(--nls-muted);padding:0 6px;line-height:1;}
		/* Soft flat bubbles — faint brand tint, no drop shadow (reference style). */
		.nexulesuite_chat-ai-msg{max-width:100%;padding:11px 15px;border-radius:var(--nls-radius);font-size:14px;line-height:1.6;white-space:pre-wrap;word-wrap:break-word;overflow-wrap:anywhere;box-shadow:none;}
		.nexulesuite_chat-ai-msg--bot{background:var(--nls-bot-bubble);color:var(--nls-ink-2);border:1px solid var(--nls-bot-border);border-bottom-left-radius:4px;}
		.nexulesuite_chat-ai-msg--bot strong{font-weight:600;color:var(--nls-ink);}
		.nexulesuite_chat-ai-msg--bot em{font-style:italic;}
		.nexulesuite_chat-ai-msg--bot code{background:var(--nls-border-soft);color:var(--nls-ink);padding:1px 5px;border-radius:var(--nls-radius-xs);font-size:.9em;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;}
		.nexulesuite_chat-ai-msg--bot a{color:var(--nls-primary);text-decoration:underline;word-break:break-word;}
		.nexulesuite_chat-ai-msg--bot ul,.nexulesuite_chat-ai-msg--bot ol{margin:6px 0;padding-left:20px;}
		.nexulesuite_chat-ai-msg--bot li{margin:3px 0;}
		.nexulesuite_chat-ai-msg--bot p{margin:6px 0;}
		.nexulesuite_chat-ai-msg--user{background:var(--nls-head-bg);color:#fff;border-bottom-right-radius:4px;}
		.nexulesuite_chat-ai-msg--error{background:#fef2f2;color:#991b1b;border:1px solid #fecaca;border-bottom-left-radius:4px;}
		.nexulesuite_chat-ai-sources{align-self:flex-start;display:flex;flex-wrap:wrap;gap:6px;margin:-2px 0 0 36px;}
		.nexulesuite_chat-ai-sources a{font-size:11px;font-weight:500;color:var(--nls-primary);text-decoration:none;border:1px solid var(--nls-border);border-radius:var(--nls-radius-xs);padding:3px 8px;background:var(--nls-surface);transition:border-color .15s;}
		.nexulesuite_chat-ai-sources a:hover{border-color:var(--nls-primary);}
		.nexulesuite_chat-ai-suggest{align-self:stretch;margin:2px 0 2px 6px;}
		.nexulesuite_chat-ai-suggest--followup{margin-top:0;}
		/* Section label: the admin's `text-xs font-bold uppercase tracking-wide text-slate-400`. */
		.nexulesuite_chat-ai-suggest__label{font-size:11px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;color:var(--nls-muted);margin:0 0 8px 2px;}
		/* Full-width white rows with a hairline border, stacked one per line (reference style). */
		.nexulesuite_chat-ai-chips{display:flex;flex-direction:column;gap:8px;}
		.nexulesuite_chat-ai-chip{display:flex;width:100%;align-items:center;gap:10px;text-align:left;max-width:100%;font-size:13.5px;font-weight:400;line-height:1.35;color:var(--nls-ink-2);background:var(--nls-surface);border:1px solid var(--nls-border);border-radius:10px;padding:11px 14px;cursor:pointer;transition:border-color .15s,background .15s,transform .05s;font-family:inherit;box-shadow:none;}
		/* Re-assert text colour on hover: theme `button:hover{color:#fff}` outranks the base rule otherwise. */
		.nexulesuite_chat-ai-chip:hover{border-color:var(--nls-primary);background:var(--nls-primary-tint);color:var(--nls-ink-2);}
		.nexulesuite_chat-ai-chip:hover .nexulesuite_chat-ai-chip__ic{color:var(--nls-primary);}
		.nexulesuite_chat-ai-chip:active{transform:translateY(1px);}
		.nexulesuite_chat-ai-chip:focus-visible{outline:none;border-color:var(--nls-primary);box-shadow:0 0 0 3px var(--nls-primary-ring);}
		/* Bare line icon, no tinted square behind it (reference style). */
		.nexulesuite_chat-ai-chip__ic{flex:0 0 auto;width:18px;height:18px;border-radius:0;display:flex;align-items:center;justify-content:center;background:transparent;color:var(--nls-primary);}
		.nexulesuite_chat-ai-chip__ic svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;}
		.nexulesuite_chat-ai-chip__tx{flex:0 1 auto;min-width:0;}
		/*
		 * Quick actions (Book / Call / Directions): flex sibling between the scroll region and
		 * the composer — never position:absolute inside the form (that stole layout height and
		 * let overflow:hidden clip the input). Stays put while messages scroll above.
		 */
		.nexulesuite_chat-ai-actionbar{position:relative;z-index:2;flex:0 0 auto;display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:8px 12px 6px;background:var(--nls-canvas);box-sizing:border-box;}
		.nexulesuite_chat-ai-actionbar[hidden]{display:none!important;}
		/* Theme button margins would stagger the pills up and down inside the bar — pin them flat. */
		.nexulesuite_chat-ai-actionbar .nexulesuite_chat-ai-action{margin:0!important;box-shadow:0 2px 8px rgba(15,23,42,.08);}
		.nexulesuite_chat-ai-action{flex:0 0 auto;min-width:0;display:inline-flex;align-items:center;justify-content:center;gap:7px;font-family:inherit;font-size:13px;font-weight:500;line-height:1.2;color:var(--nls-ink-2);background:var(--nls-surface);border:1px solid var(--nls-border);border-radius:999px;padding:9px 16px;cursor:pointer;box-shadow:none;transition:border-color .15s,background .15s,transform .12s;}
		.nexulesuite_chat-ai-action:hover{border-color:var(--nls-primary);background:var(--nls-primary-tint);transform:translateY(-1px);color:var(--nls-ink-2);}
		.nexulesuite_chat-ai-action:hover .nexulesuite_chat-ai-action__ic{color:var(--nls-ink-3);}
		.nexulesuite_chat-ai-action:active{transform:translateY(0);}
		.nexulesuite_chat-ai-action:focus-visible{outline:none;border-color:var(--nls-primary);box-shadow:0 0 0 3px var(--nls-primary-ring);}
		.nexulesuite_chat-ai-action--primary{background:var(--nls-primary-tint);color:var(--nls-ink-2);border-color:var(--nls-bot-border);box-shadow:none;}
		.nexulesuite_chat-ai-action--primary:hover{border-color:var(--nls-primary);background:var(--nls-primary-tint);color:var(--nls-ink-2);}
		.nexulesuite_chat-ai-action__ic{display:flex;flex:0 0 auto;color:var(--nls-ink-3);}
		.nexulesuite_chat-ai-action__ic svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;}
		.nexulesuite_chat-ai-typing{align-self:flex-start;display:inline-flex;gap:4px;padding:12px 14px;background:var(--nls-bot-bubble);border:1px solid var(--nls-bot-border);border-radius:var(--nls-radius);border-bottom-left-radius:4px;}
		.nexulesuite_chat-ai-typing span{width:7px;height:7px;border-radius:50%;background:var(--nls-muted);animation:nexulesuite_ai-bounce 1.2s infinite ease-in-out;}
		.nexulesuite_chat-ai-typing span:nth-child(2){animation-delay:.15s;}
		.nexulesuite_chat-ai-typing span:nth-child(3){animation-delay:.3s;}
		@keyframes nexulesuite_ai-bounce{0%,60%,100%{transform:translateY(0);opacity:.5;}30%{transform:translateY(-5px);opacity:1;}}
		/*
		 * Composer: pinned foot of the AI column. Never shrinks.
		 * Bottom padding must clear BOTH (a) panel overflow:hidden and (b) the embed host’s
		 * border-radius (~22px) + overflow:hidden — 1.1.7’s ~18–22px sat ON the clip curve so
		 * the pill’s bottom arc still looked shaved/flush against the footer. Use !important so
		 * theme `form{padding:0}` rules cannot wipe the inset.
		 */
		.nexulesuite_chat-ai-form{position:relative;z-index:3;margin:0;padding:10px 12px max(32px,calc(20px + env(safe-area-inset-bottom,0px)))!important;border-top:1px solid var(--nls-border);background:<?php echo esc_attr( $chat_bubble_bg ); ?>;flex:0 0 auto;flex-shrink:0;box-sizing:border-box;width:100%;overflow:visible;}
		.nexulesuite_chat-ai-disclaimer{margin:8px 6px 0;font-size:11px;line-height:1.45;color:var(--nls-muted);text-align:center;}
		.nexulesuite_chat-ai-leadcard{align-self:stretch;margin:2px 0 2px 36px;display:flex;flex-direction:column;gap:10px;background:var(--nls-surface);border:1px solid var(--nls-border);border-radius:var(--nls-radius-lg);padding:14px;box-shadow:var(--nls-shadow-sm);}
		.nexulesuite_chat-ai-leadinput{width:100%;border:1px solid var(--nls-field-border);border-radius:var(--nls-radius-sm);padding:10px 12px;font-size:14px;font-family:inherit;color:var(--nls-ink-2);transition:border-color .15s,box-shadow .15s;}
		.nexulesuite_chat-ai-leadinput:focus{outline:none;border-color:var(--nls-primary);box-shadow:0 0 0 3px var(--nls-primary-ring);}
		.nexulesuite_chat-ai-leaderr{display:none;font-size:12px;color:#b91c1c;}
		.nexulesuite_chat-ai-leadsend{align-self:flex-start;border-radius:var(--nls-radius);background:var(--nls-primary);color:var(--nls-on-primary);font-family:inherit;font-size:13.5px;font-weight:600;line-height:1.2;padding:11px 20px;cursor:pointer;box-shadow:var(--nls-shadow-sm);transition:filter .15s;}
		.nexulesuite_chat-ai-leadsend:hover{filter:brightness(.94);}
		.nexulesuite_chat-ai-leadsend:disabled{opacity:.6;cursor:default;}
		.nexulesuite_chat-ai-products{align-self:stretch;display:flex;gap:10px;overflow-x:auto;padding:2px 0 6px 36px;scrollbar-width:thin;-webkit-overflow-scrolling:touch;}
		.nexulesuite_chat-ai-pcard{flex:0 0 148px;width:148px;display:flex;flex-direction:column;text-decoration:none;border:1px solid var(--nls-border);border-radius:var(--nls-radius-lg);overflow:hidden;background:var(--nls-surface);box-shadow:var(--nls-shadow-sm);transition:box-shadow .15s,border-color .15s,transform .05s;}
		.nexulesuite_chat-ai-pcard:hover{border-color:var(--nls-primary);box-shadow:var(--nls-shadow-md);}
		.nexulesuite_chat-ai-pcard:active{transform:translateY(1px);}
		.nexulesuite_chat-ai-pcard__img{position:relative;display:block;height:110px;background:var(--nls-border-soft) center/cover no-repeat;}
		.nexulesuite_chat-ai-pcard__sale{position:absolute;top:6px;left:6px;background:#dc2626;color:#fff;font-size:10px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;padding:2px 7px;border-radius:var(--nls-radius-xs);}
		.nexulesuite_chat-ai-pcard__body{display:flex;flex-direction:column;gap:3px;padding:10px;}
		.nexulesuite_chat-ai-pcard__title{font-size:12.5px;font-weight:600;line-height:1.3;color:var(--nls-ink-2);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
		.nexulesuite_chat-ai-pcard__price{font-size:12.5px;font-weight:700;color:var(--nls-primary);}
		/* Pill composer with the send key inside its right edge (reference style). */
		.nexulesuite_chat-ai-inputbar{display:flex;align-items:center;gap:4px;background:var(--nls-surface);border:1px solid var(--nls-border);border-radius:999px;padding:5px 6px 5px 12px;box-shadow:none;transition:border-color .15s,box-shadow .15s;flex:0 0 auto;min-height:0;}
		/* Inset ring so overflow:hidden on ancestors cannot clip an outer focus halo at the panel foot. */
		.nexulesuite_chat-ai-inputbar:focus-within{border-color:var(--nls-primary);box-shadow:inset 0 0 0 2px var(--nls-primary-ring);}
		/*
		 * The pill is the only visible chrome; the input inside must be invisible. Themes style
		 * `input[type="text"]` (border, white background, inner shadow, min-height) at higher
		 * specificity than one class, so every box property is pinned with !important here —
		 * otherwise the field draws its own rectangle inside the pill.
		 */
		input.nexulesuite_chat-ai-input{flex:1 1 auto;min-width:0;width:auto!important;background:transparent!important;border:none!important;border-radius:0!important;box-shadow:none!important;outline:none!important;margin:0!important;padding:8px 4px!important;min-height:0!important;height:auto!important;font-size:14px!important;line-height:1.45!important;font-family:inherit!important;color:var(--nls-ink-2)!important;}
		input.nexulesuite_chat-ai-input::placeholder{color:var(--nls-muted)!important;opacity:1;}
		input.nexulesuite_chat-ai-input:focus{outline:none!important;border:none!important;box-shadow:none!important;background:transparent!important;}
		.nexulesuite_chat-ai-clip,.nexulesuite_chat-ai-emoji{flex:0 0 auto;cursor:pointer;width:34px;height:34px;border-radius:var(--nls-radius-sm);display:flex;align-items:center;justify-content:center;color:var(--nls-ink-3);padding:0;transition:background .15s,color .15s;}
		.nexulesuite_chat-ai-clip:hover,.nexulesuite_chat-ai-emoji:hover{background:var(--nls-border-soft);color:var(--nls-ink);}
		.nexulesuite_chat-ai-clip.is-armed{background:var(--nls-primary-tint);color:var(--nls-primary);}
		.nexulesuite_chat-ai-clip svg{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}
		.nexulesuite_chat-ai-emoji svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;}
		/* Rounded-square send key, grey until there is text, navy when armed (reference style). */
		.nexulesuite_chat-ai-send{flex:0 0 auto;cursor:pointer;background:var(--nls-border);color:var(--nls-ink-3);border-radius:10px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;padding:0;transition:background .15s,color .15s;}
		.nexulesuite_chat-ai-send:hover{background:var(--nls-border);color:var(--nls-ink-3);}
		.nexulesuite_chat-ai-send.is-active,
		.nexulesuite_chat-ai-send.is-active:hover{background:var(--nls-head-bg);color:#fff;}
		.nexulesuite_chat-ai-send svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}
		.nexulesuite_chat-ai-send:disabled{cursor:default;opacity:.7;}
		/* Emoji popover */
		.nexulesuite_chat-ai-emoji-wrap{position:relative;flex:0 0 auto;display:flex;}
		.nexulesuite_chat-ai-emoji-pop{position:absolute;bottom:calc(100% + 12px);right:0;width:238px;background:var(--nls-surface);border:1px solid var(--nls-border);border-radius:var(--nls-radius-lg);box-shadow:var(--nls-shadow-lg);padding:6px;display:none;z-index:6;}
		.nexulesuite_chat-ai-emoji-pop.is-open{display:grid;grid-template-columns:repeat(6,1fr);gap:2px;}
		.nexulesuite_chat-ai-emoji-pop button{border:0;background:transparent;cursor:pointer;font-size:20px;line-height:1;padding:6px;border-radius:var(--nls-radius-sm);text-transform:none;letter-spacing:normal;font-family:"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif;}
		.nexulesuite_chat-ai-emoji-pop button:hover{background:var(--nls-border-soft);}
		/* Attachment preview + in-bubble image */
		.nexulesuite_chat-ai-attach{position:relative;display:inline-block;margin:0 0 10px 6px;}
		/* Author display beats the UA [hidden] rule, so restate it or the empty preview's ✕ floats over the composer. */
		.nexulesuite_chat-ai-attach[hidden]{display:none;}
		.nexulesuite_chat-ai-attach img{max-width:120px;max-height:120px;border-radius:var(--nls-radius);border:1px solid var(--nls-border);display:block;}
		.nexulesuite_chat-ai-attach-x{position:absolute;top:-8px;right:-8px;width:22px;height:22px;border-radius:50%;border:2px solid var(--nls-surface);background:var(--nls-ink);color:#fff;cursor:pointer;font-size:11px;line-height:1;display:flex;align-items:center;justify-content:center;padding:0;box-shadow:var(--nls-shadow-md);}
		.nexulesuite_chat-ai-msg-img{max-width:200px;max-height:200px;border-radius:var(--nls-radius);margin-top:6px;display:block;}
		/* Document attachment: a card, since a PDF has no thumbnail to preview. */
		.nexulesuite_chat-ai-doc{display:flex;align-items:center;gap:10px;margin:0 6px 10px;padding:8px 10px;background:var(--nls-surface);border:1px solid var(--nls-border);border-radius:var(--nls-radius);box-shadow:var(--nls-shadow-sm);}
		.nexulesuite_chat-ai-doc[hidden]{display:none;}
		.nexulesuite_chat-ai-doc__ic{flex:0 0 auto;width:30px;height:30px;border-radius:var(--nls-radius-sm);display:flex;align-items:center;justify-content:center;background:var(--nls-primary-tint);color:var(--nls-primary);}
		.nexulesuite_chat-ai-doc__ic svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}
		.nexulesuite_chat-ai-doc__meta{display:flex;flex-direction:column;gap:1px;min-width:0;flex:1 1 auto;}
		.nexulesuite_chat-ai-doc__name{font-size:12.5px;font-weight:600;color:var(--nls-ink-2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
		.nexulesuite_chat-ai-doc__size{font-size:11px;color:var(--nls-muted);}
		.nexulesuite_chat-ai-doc__x{flex:0 0 auto;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;padding:0;cursor:pointer;color:var(--nls-muted);font-size:11px;line-height:1;transition:background .15s,color .15s;}
		.nexulesuite_chat-ai-doc__x:hover{background:var(--nls-border-soft);color:var(--nls-ink);}
		/* Same card, inside a sent bubble. */
		.nexulesuite_chat-ai-msg .nexulesuite_chat-ai-doc{margin:6px 0 0;background:rgba(255,255,255,.16);border-color:rgba(255,255,255,.28);box-shadow:none;}
		.nexulesuite_chat-ai-msg .nexulesuite_chat-ai-doc__ic{background:rgba(255,255,255,.22);color:inherit;}
		.nexulesuite_chat-ai-msg .nexulesuite_chat-ai-doc__name{color:inherit;}
		.nexulesuite_chat-ai-msg .nexulesuite_chat-ai-doc__size{color:inherit;opacity:.75;}
		<?php
		$chat_css = (string) ob_get_clean();

		/*
		 * Embed mode: the panel *is* the document. Drop the floating chrome (fixed position,
		 * bubble, close button) and let the panel fill the frame. Appended last so it wins over
		 * the base rules and the mobile media queries above.
		 */
		if ( $is_panel ) {
			/*
			 * Shared by both panel modes: strip the floating chrome (fixed position, bubble, close,
			 * back) and let the panel fill whatever box it is given.
			 *
			 * Liquid type + chrome: container query units scale titles, messages, inputs and
			 * controls with the chat box width (same pattern as the bottom nav). Floating mode
			 * never enters this branch, so the bubble stays at its fixed design sizes.
			 */
			$chat_css .= '
			.nexulesuite_chat-widget{
				position:static!important;inset:auto!important;height:100%;max-height:100%;width:100%;min-width:0;min-height:0;gap:0;align-items:stretch!important;z-index:auto;
				display:flex!important;flex-direction:column;box-sizing:border-box;
				container-type:inline-size;container-name:nls-chat;
			}
			/*
			 * Fluid tokens live on the panel (a descendant of the size container). cqw on the
			 * container element itself would not resolve against its own width.
			 */
			.nexulesuite_chat-panel{
				display:flex!important;width:100%!important;max-width:none!important;height:100%;min-height:0;max-height:100%;animation:none;flex:1 1 0%;overflow:hidden;box-sizing:border-box;
				--nls-fs:clamp(12px,4.4cqw,16px);
				--nls-fs-title:clamp(13px,4.55cqw,17px);
				--nls-fs-sm:clamp(10px,3.4cqw,12.5px);
				--nls-fs-xs:clamp(9.5px,3.2cqw,11.5px);
				--nls-pad:clamp(10px,4.2cqw,22px);
				--nls-pad-sm:clamp(8px,3.2cqw,16px);
				--nls-gap:clamp(6px,2.2cqw,13px);
				--nls-avatar:clamp(32px,11.5cqw,48px);
				--nls-avatar-sm:clamp(28px,10cqw,40px);
				--nls-ctrl:clamp(26px,8cqw,34px);
				--nls-icon:clamp(14px,4.2cqw,20px);
				--nls-time-size:var(--nls-fs-xs);
			}
			.nexulesuite_chat-trigger{display:none!important;}
			.nexulesuite_chat-panel__close{display:none!important;}
			.nexulesuite_chat-ai-view__back{display:none!important;}

			/* Chrome + type scale with the container (cqw → .nexulesuite_chat-widget). */
			.nexulesuite_chat-panel__head{padding:var(--nls-pad) var(--nls-pad) var(--nls-pad-sm);gap:var(--nls-gap);}
			.nexulesuite_chat-panel__avatar,.nexulesuite_chat-panel__avatar img{width:var(--nls-avatar);height:var(--nls-avatar);border-radius:clamp(8px,2.5cqw,12px);}
			.nexulesuite_chat-panel__avatar svg{width:var(--nls-icon);height:var(--nls-icon);}
			.nexulesuite_chat-panel__title{font-size:var(--nls-fs-title);}
			.nexulesuite_chat-panel__badge{font-size:var(--nls-fs-sm);margin-top:clamp(3px,.8cqw,6px);gap:clamp(4px,1.2cqw,6px);}
			.nexulesuite_chat-online-dot{width:clamp(7px,2.2cqw,10px);height:clamp(7px,2.2cqw,10px);}
			.nexulesuite_chat-panel__body{font-size:var(--nls-fs);padding:clamp(14px,5cqw,26px) var(--nls-pad);min-height:clamp(64px,18cqw,96px);}
			.nexulesuite_chat-panel__btns{padding:var(--nls-pad-sm) var(--nls-pad) var(--nls-pad);gap:clamp(8px,2cqw,12px);}
			.nexulesuite_chat-panel__btns a,
			.nexulesuite_chat-panel__btns button{font-size:var(--nls-fs);}
			.nexulesuite_chat-form-view__head{padding:var(--nls-pad-sm) var(--nls-pad);gap:var(--nls-gap);}
			.nexulesuite_chat-form-view__back{width:var(--nls-ctrl);height:var(--nls-ctrl);font-size:var(--nls-fs-title);}
			.nexulesuite_chat-form-view__avatar,.nexulesuite_chat-form-view__avatar img{width:var(--nls-avatar-sm);height:var(--nls-avatar-sm);}
			.nexulesuite_chat-form-view__avatar svg{width:var(--nls-icon);height:var(--nls-icon);}
			.nexulesuite_chat-form-view__heading{font-size:var(--nls-fs-title);}
			.nexulesuite_chat-inline-popup-body{padding:var(--nls-pad);}
			.nexulesuite_chat-inline-popup-missing{font-size:var(--nls-fs-sm);}
			.nexulesuite_chat-leadgate-body{padding:var(--nls-pad-sm) var(--nls-pad);}
			.nexulesuite_chat-leadgate-foot,.nexulesuite_chat-leadgate-hint,.nexulesuite_chat-ai-disclaimer{font-size:var(--nls-fs-xs);}
			.nexulesuite_chat-leadgate-card__title{font-size:var(--nls-fs-title);}
			.nexulesuite_chat-leadgate-card__sub{font-size:var(--nls-fs);}
			.nexulesuite_chat-leadgate-body input.nexulesuite_chat-ai-leadinput{font-size:var(--nls-fs)!important;padding:clamp(10px,2.8cqw,14px) clamp(10px,3cqw,14px)!important;min-height:clamp(40px,11cqw,48px)!important;}
			.nexulesuite_chat-leadgate-body button.nexulesuite_chat-ai-leadsend{font-size:var(--nls-fs)!important;padding:clamp(11px,3cqw,14px) clamp(14px,4cqw,20px)!important;}
			.nexulesuite_chat-ai-view__head{padding:var(--nls-pad-sm) var(--nls-pad);gap:var(--nls-gap);}
			.nexulesuite_chat-ai-view__avatar{width:var(--nls-avatar-sm);height:var(--nls-avatar-sm);}
			.nexulesuite_chat-ai-view__avatar svg{width:var(--nls-icon);height:var(--nls-icon);}
			.nexulesuite_chat-ai-view__heading{font-size:var(--nls-fs-title);}
			.nexulesuite_chat-ai-view__badge{font-size:var(--nls-fs-sm);}
			.nexulesuite_chat-ai-view__tts,
			.nexulesuite_chat-ai-view__reset{width:var(--nls-ctrl);height:var(--nls-ctrl);}
			.nexulesuite_chat-ai-view__tts svg,
			.nexulesuite_chat-ai-view__reset svg{width:var(--nls-icon);height:var(--nls-icon);}
			.nexulesuite_chat-ai-messages{padding:var(--nls-pad) var(--nls-pad-sm);gap:var(--nls-gap);}
			.nexulesuite_chat-ai-bubavatar{width:clamp(22px,7cqw,30px);height:clamp(22px,7cqw,30px);}
			.nexulesuite_chat-ai-msg{font-size:var(--nls-fs);padding:clamp(9px,2.8cqw,13px) clamp(11px,3.4cqw,16px);}
			.nexulesuite_chat-ai-chip{font-size:var(--nls-fs);padding:clamp(9px,2.8cqw,12px) clamp(11px,3.2cqw,15px);gap:clamp(8px,2cqw,12px);}
			.nexulesuite_chat-ai-chip__ic{width:clamp(15px,4.5cqw,20px);height:clamp(15px,4.5cqw,20px);}
			.nexulesuite_chat-ai-chip__ic svg{width:clamp(13px,4cqw,17px);height:clamp(13px,4cqw,17px);}
			.nexulesuite_chat-ai-suggest__label{font-size:var(--nls-fs-xs);}
			.nexulesuite_chat-ai-sources a{font-size:var(--nls-fs-xs);}
			.nexulesuite_chat-ai-action{font-size:var(--nls-fs-sm);padding:clamp(7px,2.2cqw,10px) clamp(12px,3.5cqw,18px);gap:clamp(5px,1.5cqw,8px);}
			.nexulesuite_chat-ai-action__ic svg{width:clamp(13px,3.8cqw,16px);height:clamp(13px,3.8cqw,16px);}
			/*
			 * Host paste uses border-radius:22px + overflow:hidden. Padding must exceed that curve
			 * so the pill (and its border) sits clearly inset — not flush/shaved at the foot.
			 */
			.nexulesuite_chat-ai-form{padding:var(--nls-pad-sm)!important;padding-bottom:max(36px,calc(var(--nls-pad) + 16px),calc(24px + env(safe-area-inset-bottom,0px)))!important;}
			.nexulesuite_chat-ai-leadinput{font-size:var(--nls-fs);padding:clamp(8px,2.5cqw,12px);}
			.nexulesuite_chat-ai-leadsend{font-size:var(--nls-fs);padding:clamp(9px,2.6cqw,12px) clamp(14px,4cqw,22px);}
			.nexulesuite_chat-ai-leaderr{font-size:var(--nls-fs-sm);}
			input.nexulesuite_chat-ai-input{font-size:var(--nls-fs)!important;padding:clamp(6px,2cqw,10px) clamp(3px,1cqw,6px)!important;}
			.nexulesuite_chat-ai-clip,.nexulesuite_chat-ai-emoji{width:var(--nls-ctrl);height:var(--nls-ctrl);}
			.nexulesuite_chat-ai-send{width:clamp(30px,9cqw,38px);height:clamp(30px,9cqw,38px);border-radius:clamp(8px,2.4cqw,12px);}
			.nexulesuite_chat-ai-send svg,.nexulesuite_chat-ai-clip svg{width:var(--nls-icon);height:var(--nls-icon);}
			.nexulesuite_chat-ai-emoji svg{width:clamp(16px,4.8cqw,22px);height:clamp(16px,4.8cqw,22px);}
			.nexulesuite_chat-ai-pcard{flex-basis:clamp(120px,38cqw,160px);width:clamp(120px,38cqw,160px);}
			.nexulesuite_chat-ai-pcard__title,.nexulesuite_chat-ai-pcard__price{font-size:var(--nls-fs-sm);}
			.nexulesuite_chat-ai-doc__name{font-size:var(--nls-fs-sm);}
			.nexulesuite_chat-ai-doc__size{font-size:var(--nls-fs-xs);}
			/*
			 * Layout at wider containers: chips stay stacked (readable), messages can breathe.
			 * Uses @container so a narrow column on a wide viewport still gets compact layout.
			 */
			@container nls-chat (min-width:560px){
				.nexulesuite_chat-ai-chips{flex-direction:column;}
				.nexulesuite_chat-ai-chip{width:100%;justify-content:flex-start;}
				.nexulesuite_chat-ai-action{flex:0 0 auto;min-width:0;}
				.nexulesuite_chat-ai-msg{max-width:min(760px,92%);}
			}
			';
		}

		if ( $is_embed ) {
			// The panel is the whole document: it owns the frame edge to edge; type scales with frame width.
			$chat_css .= '
			html{height:100%;max-height:100%;margin:0;padding:0;overflow:hidden;box-sizing:border-box;}
			html,body{margin:0;padding:0;height:100%;width:100%;max-height:100%;background:transparent;box-sizing:border-box;}
			body.nexulesuite_chat-embed-doc{overflow:hidden;min-width:0;min-height:0;max-height:100%;display:flex;flex-direction:column;}
			body.nexulesuite_chat-embed-doc>.nexulesuite_chat-widget{flex:1 1 0%;min-height:0;height:100%;max-height:100%;}
			body.nexulesuite_chat-embed-doc .nexulesuite_chat-panel{flex:1 1 0%;min-height:0;height:100%;max-height:100%;border-radius:0;box-shadow:none;}
			body.nexulesuite_chat-embed-doc .nexulesuite_chat-panel--ai-active .nexulesuite_chat-ai-view{flex:1 1 0%;min-height:0;height:100%;max-height:100%;}
			/* Extra foot inset inside the iframe so host radius clipping cannot shave the pill. */
			body.nexulesuite_chat-embed-doc .nexulesuite_chat-ai-form{padding-bottom:max(40px,calc(28px + env(safe-area-inset-bottom,0px)))!important;}
			';
		}

		if ( $is_inline ) {
			/*
			 * Inline mode sits in the page flow as a normal block, so it must read as part of the
			 * page — not as a card that floated in. No drop shadow, no popped-out corners.
			 *
			 * The outer wrapper is the size container: width follows the host row/column (100%),
			 * and the inner box height is fluid via cqw (capped by --nls-chat-h from the shortcode).
			 * Typography scales on .nexulesuite_chat-widget (see panel branch above).
			 *
			 * `is-bleed` escapes a narrow host container — a page builder often drops the shortcode
			 * into a column far narrower than the page, and CSS cannot widen an ancestor. The usual
			 * `margin-left:calc(50% - 50vw)` trick is no good here: its 50% resolves against the
			 * column, so it only lands correctly when that column is itself centred on the page. An
			 * off-centre column sends the chat off the side of the screen instead. The widths are
			 * therefore measured and applied in JS (see the bleed routine below), and the inner box
			 * re-centres at max_width so it settles at content width rather than edge to edge.
			 */
			$chat_css .= '
			.nexulesuite_chat-inline{display:block;width:100%;max-width:100%;min-width:0;container-type:inline-size;container-name:nls-chat-host;margin-bottom:36px;}
			.nexulesuite_chat-inline.is-bleed{max-width:none;}
			.nexulesuite_chat-inline__box{
				width:100%;max-width:100%;min-width:0;margin-left:auto;margin-right:auto;
				height:clamp(380px,145cqw,var(--nls-chat-h,680px));
				box-sizing:border-box;
				display:flex;flex-direction:column;min-height:0;overflow:hidden;
			}
			.nexulesuite_chat-inline .nexulesuite_chat-widget{font-family:inherit;flex:1 1 0%;min-height:0;height:100%;max-height:100%;}
			.nexulesuite_chat-inline .nexulesuite_chat-panel{border-radius:var(--nls-radius,12px);box-shadow:none;border:1px solid var(--nls-border,#e2e8f0);overflow:hidden;flex:1 1 0%;min-height:0;height:100%;max-height:100%;box-sizing:border-box;}
			';
		}

		ob_start();
		?>

		<div class="nexulesuite_chat-widget<?php echo esc_attr( $dock_cls . $align_cls ); ?>" id="nexulesuite_chat-widget" aria-live="polite">

			<?php /* ── Chat panel (hidden until bubble clicked) ── */ ?>
			<div class="nexulesuite_chat-panel" id="nexulesuite_chat-panel" role="dialog" aria-modal="true" aria-label="<?php echo esc_attr( $chat_title ); ?>">

				<?php /* ─ Header ─ */ ?>
				<div class="nexulesuite_chat-panel__head">
					<div class="nexulesuite_chat-panel__avatar">
						<?php if ( '' !== $btn_image ) : ?>
							<img src="<?php echo preg_match( '#^data:image/(jpeg|jpg|png|gif|webp);base64,#i', $btn_image ) ? esc_attr( $btn_image ) : esc_url( $btn_image ); ?>" alt="<?php echo esc_attr( $chat_title ); ?>" />
						<?php else : ?>
							<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 10h.01M12 10h.01M16 10h.01M21 16c0 1.1-.9 2-2 2H7l-4 4V6a2 2 0 012-2h14a2 2 0 012 2v10z"/></svg>
						<?php endif; ?>
					</div>
					<div class="nexulesuite_chat-panel__info">
						<p class="nexulesuite_chat-panel__title"><?php echo esc_html( $chat_title ); ?></p>
						<?php if ( '' !== $chat_badge ) : ?>
							<p class="nexulesuite_chat-panel__badge"><span class="nexulesuite_chat-online-dot" aria-hidden="true"></span><?php echo esc_html( $chat_badge ); ?></p>
						<?php endif; ?>
					</div>
					<button type="button" class="nexulesuite_chat-panel__close" id="nexulesuite_chat-close" aria-label="<?php esc_attr_e( 'Close chat', 'nexus-lead-suite' ); ?>">&#x2715;</button>
				</div>

				<?php /* ─ Greeting ─ */ ?>
				<?php if ( '' !== $chat_content ) : ?>
					<div class="nexulesuite_chat-panel__body"><?php echo esc_html( $chat_content ); ?></div>
				<?php endif; ?>

				<?php /* ─ Action Buttons ─ */ ?>
				<?php if ( $has_any_action_btn || ( $ai_enabled && ! $ai_lead_gate ) ) : ?>
					<div class="nexulesuite_chat-panel__btns">

						<?php /* AI launcher — hidden when lead gate is active (no link/popup on button 1). */ ?>
						<?php if ( $ai_enabled && ! $ai_lead_gate ) : ?>
							<button type="button"
								class="<?php echo esc_attr( $hover_cls ); ?>"
								style="<?php echo esc_attr( $btn_style ); ?>"
								data-nexulesuite_chat-open-ai="1">
								<?php echo esc_html( $ai_launch_label ); ?>
							</button>
						<?php endif; ?>

						<?php
						/*
						 * Button 1: If type = popup → "Open inline form" inside the chat widget.
						 *            Use data-nexulesuite_chat-open-form attribute to distinguish.
						 * Buttons 2 & 3: If type = popup → open external nexus popup overlay.
						 */
						?>

						<?php /* Button 1 — full width (skip when lead gate handles entry via #lead / #form or empty link) */ ?>
						<?php if ( $btn1_has_action && ! $ai_lead_gate ) : ?>
							<?php if ( $has_inline_popup_btn ) : ?>
								<button type="button"
									class="<?php echo esc_attr( $hover_cls ); ?>"
									style="<?php echo esc_attr( $btn_style ); ?>"
									data-nexulesuite_chat-open-form="1">
									<?php echo esc_html( $btn1_label ); ?>
								</button>
							<?php else : ?>
								<?php
								$chat_ntfy_1 = 'chat-b1,' . ( '' !== $btn1_label ? $btn1_label : __( 'Livechat button', 'nexus-lead-suite' ) );
								?>
								<a href="<?php echo esc_url( $btn1_val, $href_protocols ); ?>"
									class="<?php echo esc_attr( $hover_cls ); ?>"
									style="<?php echo esc_attr( $btn_style ); ?>"
									data-nexulesuite_trigger="<?php echo esc_attr( $chat_ntfy_1 ); ?>">
									<?php echo esc_html( $btn1_label ); ?>
								</a>
							<?php endif; ?>
						<?php endif; ?>

						<?php /* Buttons 2 + 3 — side-by-side grid (only render when at least one exists) */ ?>
						<?php if ( $btn2_has_action || $btn3_has_action ) : ?>
							<div class="nexulesuite_chat-panel__btns-row">
								<?php if ( $btn2_has_action ) : ?>
									<?php if ( 'popup' === $btn2_type ) : ?>
										<button type="button"
											class="<?php echo esc_attr( $hover_cls ); ?>"
											style="<?php echo esc_attr( $btn_style_muted ); ?>"
											data-nexulesuite_chat-popup="<?php echo esc_attr( $btn2_val ); ?>">
											<?php echo esc_html( $btn2_label ); ?>
										</button>
									<?php else : ?>
										<?php
										$chat_ntfy_2 = 'chat-b2,' . ( '' !== $btn2_label ? $btn2_label : __( 'Livechat button', 'nexus-lead-suite' ) );
										?>
										<a href="<?php echo esc_url( $btn2_val, $href_protocols ); ?>"
											class="<?php echo esc_attr( $hover_cls ); ?>"
											style="<?php echo esc_attr( $btn_style_muted ); ?>"
											data-nexulesuite_trigger="<?php echo esc_attr( $chat_ntfy_2 ); ?>">
											<?php echo esc_html( $btn2_label ); ?>
										</a>
									<?php endif; ?>
								<?php endif; ?>

								<?php if ( $btn3_has_action ) : ?>
									<?php if ( 'popup' === $btn3_type ) : ?>
										<button type="button"
											class="<?php echo esc_attr( $hover_cls ); ?>"
											style="<?php echo esc_attr( $btn_style_muted ); ?>"
											data-nexulesuite_chat-popup="<?php echo esc_attr( $btn3_val ); ?>">
											<?php echo esc_html( $btn3_label ); ?>
										</button>
									<?php else : ?>
										<?php
										$chat_ntfy_3 = 'chat-b3,' . ( '' !== $btn3_label ? $btn3_label : __( 'Livechat button', 'nexus-lead-suite' ) );
										?>
										<a href="<?php echo esc_url( $btn3_val, $href_protocols ); ?>"
											class="<?php echo esc_attr( $hover_cls ); ?>"
											style="<?php echo esc_attr( $btn_style_muted ); ?>"
											data-nexulesuite_trigger="<?php echo esc_attr( $chat_ntfy_3 ); ?>">
											<?php echo esc_html( $btn3_label ); ?>
										</a>
									<?php endif; ?>
								<?php endif; ?>
							</div>
						<?php endif; ?>

					</div>
				<?php endif; ?>

				<?php /* ── Lead gate: contact form before AI chat (button 1 has no link/popup) ── */ ?>
				<?php if ( $ai_lead_gate ) : ?>
					<div class="nexulesuite_chat-leadgate-view" id="nexulesuite_chat-leadgate-view" aria-label="<?php echo esc_attr( $chat_title ); ?>">
						<div class="nexulesuite_chat-leadgate-body" id="nexulesuite_chat-leadgate-body">
							<div class="nexulesuite_chat-ai-leadcard" id="nexulesuite_chat-leadgate-builtin">
								<div class="nexulesuite_chat-leadgate-card__head">
									<p class="nexulesuite_chat-leadgate-card__title"><?php echo esc_html( $btn1_label ); ?></p>
									<?php if ( '' !== $chat_content ) : ?>
										<p class="nexulesuite_chat-leadgate-card__sub"><?php echo esc_html( $chat_content ); ?></p>
									<?php else : ?>
										<p class="nexulesuite_chat-leadgate-card__sub"><?php esc_html_e( 'Share your details below and we will connect you with our team right away.', 'nexus-lead-suite' ); ?></p>
									<?php endif; ?>
								</div>
								<div class="nexulesuite_chat-leadgate-card__fields">
									<input type="text" id="nexulesuite_chat-leadgate-name" class="nexulesuite_chat-ai-leadinput" placeholder="<?php esc_attr_e( 'Your name', 'nexus-lead-suite' ); ?>" autocomplete="name" />
									<input type="tel" id="nexulesuite_chat-leadgate-phone" class="nexulesuite_chat-ai-leadinput" placeholder="<?php esc_attr_e( 'Phone', 'nexus-lead-suite' ); ?>" autocomplete="tel" inputmode="tel" />
									<input type="email" id="nexulesuite_chat-leadgate-email" class="nexulesuite_chat-ai-leadinput" placeholder="<?php esc_attr_e( 'Email', 'nexus-lead-suite' ); ?>" autocomplete="email" />
								</div>
								<div class="nexulesuite_chat-leadgate-card__foot">
									<div class="nexulesuite_chat-ai-leaderr" id="nexulesuite_chat-leadgate-err"></div>
									<button type="button" class="nexulesuite_chat-ai-leadsend" id="nexulesuite_chat-leadgate-send"><?php esc_html_e( 'Send', 'nexus-lead-suite' ); ?></button>
									<p class="nexulesuite_chat-leadgate-hint"><?php esc_html_e( 'We typically reply within a few minutes during business hours.', 'nexus-lead-suite' ); ?></p>
								</div>
							</div>
							<?php if ( '' !== trim( (string) $ai_disclaimer ) ) : ?>
								<p class="nexulesuite_chat-leadgate-foot"><?php echo esc_html( $ai_disclaimer ); ?></p>
							<?php endif; ?>
						</div>
					</div>
				<?php endif; ?>

				<?php /* ── Inline view: selected Popup content (shortcodes rendered), same as Popups builder ── */ ?>
				<?php if ( $has_inline_popup_btn ) : ?>
					<div class="nexulesuite_chat-form-view" id="nexulesuite_chat-form-view" aria-label="<?php echo esc_attr( $chat_title ); ?>">

					<div class="nexulesuite_chat-form-view__head">
						<button type="button" class="nexulesuite_chat-form-view__back" id="nexulesuite_chat-form-back" aria-label="<?php esc_attr_e( 'Back', 'nexus-lead-suite' ); ?>">&#8592;</button>
						<div class="nexulesuite_chat-form-view__avatar">
							<?php if ( '' !== $btn_image ) : ?>
								<img src="<?php echo preg_match( '#^data:image/(jpeg|jpg|png|gif|webp);base64,#i', $btn_image ) ? esc_attr( $btn_image ) : esc_url( $btn_image ); ?>" alt="" />
							<?php else : ?>
								<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 10h.01M12 10h.01M16 10h.01M21 16c0 1.1-.9 2-2 2H7l-4 4V6a2 2 0 012-2h14a2 2 0 012 2v10z"/></svg>
							<?php endif; ?>
						</div>
						<div class="nexulesuite_chat-form-view__info">
							<p class="nexulesuite_chat-form-view__heading"><?php echo esc_html( $chat_title ); ?></p>
						</div>
					</div>

					<div class="nexulesuite_chat-inline-popup-body" id="nexulesuite_chat-inline-popup-body">
						<?php
						echo wp_kses( $inline_popup_html, \nexulesuite_\allowed_form_html() );
						?>
					</div>

					</div>
				<?php endif; ?>

				<?php /* ── AI chat view: conversational RAG assistant ── */ ?>
				<?php if ( $ai_enabled ) : ?>
					<div class="nexulesuite_chat-ai-view" id="nexulesuite_chat-ai-view" aria-label="<?php echo esc_attr( $chat_title ); ?>">

						<div class="nexulesuite_chat-ai-view__head">
							<button type="button" class="nexulesuite_chat-ai-view__back" id="nexulesuite_chat-ai-back" aria-label="<?php esc_attr_e( 'Back', 'nexus-lead-suite' ); ?>">&#8592;</button>
							<div class="nexulesuite_chat-ai-view__avatar">
								<?php if ( '' !== $btn_image ) : ?>
									<img src="<?php echo preg_match( '#^data:image/(jpeg|jpg|png|gif|webp);base64,#i', $btn_image ) ? esc_attr( $btn_image ) : esc_url( $btn_image ); ?>" alt="" />
								<?php else : ?>
									<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 10h.01M12 10h.01M16 10h.01M21 16c0 1.1-.9 2-2 2H7l-4 4V6a2 2 0 012-2h14a2 2 0 012 2v10z"/></svg>
								<?php endif; ?>
							</div>
							<div class="nexulesuite_chat-ai-view__info">
								<p class="nexulesuite_chat-ai-view__heading"><?php echo esc_html( $chat_title ); ?></p>
								<?php if ( '' !== $chat_badge ) : ?>
									<p class="nexulesuite_chat-ai-view__badge"><span class="nexulesuite_chat-online-dot" aria-hidden="true"></span><?php echo esc_html( $chat_badge ); ?></p>
								<?php endif; ?>
							</div>
							<span class="nexulesuite_chat-ai-view__tools">
								<?php /* Unhidden by JS only where the browser exposes speech synthesis. */ ?>
								<button type="button" class="nexulesuite_chat-ai-view__tts" id="nexulesuite_chat-ai-tts" hidden aria-pressed="false" aria-label="<?php esc_attr_e( 'Read replies aloud', 'nexus-lead-suite' ); ?>" title="<?php esc_attr_e( 'Read replies aloud', 'nexus-lead-suite' ); ?>">
									<svg class="nexulesuite_chat-ai-tts__off" viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5L6 9H2v6h4l5 4z"/><path d="M22 9l-6 6M16 9l6 6"/></svg>
									<svg class="nexulesuite_chat-ai-tts__on" viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5L6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.7 5.3a9 9 0 0 1 0 13.4"/></svg>
								</button>
								<button type="button" class="nexulesuite_chat-ai-view__reset" id="nexulesuite_chat-ai-reset" aria-label="<?php esc_attr_e( 'Start a new chat', 'nexus-lead-suite' ); ?>" title="<?php esc_attr_e( 'New chat', 'nexus-lead-suite' ); ?>">
									<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>
								</button>
							</span>
						</div>

						<div class="nexulesuite_chat-ai-messages" id="nexulesuite_chat-ai-messages" role="log" aria-live="polite"></div>

						<?php if ( ! empty( $ai_actions ) ) : ?>
							<?php /* Quick actions pinned between transcript and composer (flex sibling, not absolute). */ ?>
							<div class="nexulesuite_chat-ai-actionbar" id="nexulesuite_chat-ai-actionbar" hidden></div>
						<?php endif; ?>

						<?php if ( '' !== trim( (string) $ai_contact_form_html ) ) : ?>
							<?php /* Rendered once (so form scripts init); moved into the chat on demand by aiShowContactForm(). */ ?>
							<div id="nexulesuite_chat-ai-contactsrc" style="display:none;">
								<?php echo wp_kses( $ai_contact_form_html, self::allowed_embed_html() ); ?>
							</div>
						<?php endif; ?>

						<?php /* Quick-action buttons whose link is a form shortcode: rendered once here, moved into the chat by aiShowInlineActionForm(). */ ?>
						<?php foreach ( $ai_action_forms as $af_idx => $af_html ) : ?>
							<?php if ( '' !== trim( (string) $af_html ) ) : ?>
								<div id="nexulesuite_chat-ai-actionform-<?php echo (int) $af_idx; ?>" class="nexulesuite_chat-ai-actionform-src" style="display:none;">
									<?php echo wp_kses( $af_html, self::allowed_embed_html() ); ?>
								</div>
							<?php endif; ?>
						<?php endforeach; ?>

						<form class="nexulesuite_chat-ai-form" id="nexulesuite_chat-ai-form">

							<?php if ( $ai_allow_images ) : ?>
								<input type="file" id="nexulesuite_chat-ai-file" accept="image/png,image/jpeg,image/gif,image/webp,application/pdf,text/plain,text/markdown,.md,text/csv,text/html,application/json" hidden />
								<div class="nexulesuite_chat-ai-attach" id="nexulesuite_chat-ai-attach" hidden>
									<img id="nexulesuite_chat-ai-attach-img" alt="" />
									<button type="button" class="nexulesuite_chat-ai-attach-x" id="nexulesuite_chat-ai-attach-x" aria-label="<?php esc_attr_e( 'Remove image', 'nexus-lead-suite' ); ?>">&#x2715;</button>
								</div>
								<div class="nexulesuite_chat-ai-doc" id="nexulesuite_chat-ai-doc" hidden>
									<span class="nexulesuite_chat-ai-doc__ic" aria-hidden="true">
										<svg viewBox="0 0 24 24"><path d="M13 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V9z"/><path d="M13 3v6h6"/></svg>
									</span>
									<span class="nexulesuite_chat-ai-doc__meta">
										<span class="nexulesuite_chat-ai-doc__name" id="nexulesuite_chat-ai-doc-name"></span>
										<span class="nexulesuite_chat-ai-doc__size" id="nexulesuite_chat-ai-doc-size"></span>
									</span>
									<button type="button" class="nexulesuite_chat-ai-doc__x" id="nexulesuite_chat-ai-doc-x" aria-label="<?php esc_attr_e( 'Remove file', 'nexus-lead-suite' ); ?>">&#x2715;</button>
								</div>
							<?php endif; ?>

							<div class="nexulesuite_chat-ai-inputbar">

								<?php if ( $ai_allow_images ) : ?>
									<button type="button" class="nexulesuite_chat-ai-clip" id="nexulesuite_chat-ai-clip" aria-label="<?php esc_attr_e( 'Attach an image for the assistant to read', 'nexus-lead-suite' ); ?>" title="<?php esc_attr_e( 'Attach an image', 'nexus-lead-suite' ); ?>">
										<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.4 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
									</button>
								<?php endif; ?>

								<input type="text" class="nexulesuite_chat-ai-input" id="nexulesuite_chat-ai-input" autocomplete="off"
									placeholder="<?php echo esc_attr( $ai_placeholder ); ?>"
									aria-label="<?php esc_attr_e( 'Message', 'nexus-lead-suite' ); ?>" maxlength="2000" />

								<span class="nexulesuite_chat-ai-emoji-wrap">
									<button type="button" class="nexulesuite_chat-ai-emoji" id="nexulesuite_chat-ai-emoji" aria-label="<?php esc_attr_e( 'Emoji', 'nexus-lead-suite' ); ?>" aria-haspopup="true" aria-expanded="false">
										<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8.5 14a4 4 0 007 0"/><path d="M9 9.5h.01M15 9.5h.01"/></svg>
									</button>
									<span class="nexulesuite_chat-ai-emoji-pop" id="nexulesuite_chat-ai-emoji-pop" role="menu"></span>
								</span>

							<button type="submit" class="nexulesuite_chat-ai-send" id="nexulesuite_chat-ai-send" aria-label="<?php esc_attr_e( 'Send', 'nexus-lead-suite' ); ?>">
								<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
							</button>

							</div>
							<?php if ( '' !== $ai_disclaimer ) : ?>
								<p class="nexulesuite_chat-ai-disclaimer"><?php echo esc_html( $ai_disclaimer ); ?></p>
							<?php endif; ?>
						</form>

					</div>
				<?php endif; ?>

			</div>

			<?php /* ── Floating trigger bubble ── */ ?>
			<button type="button"
				class="nexulesuite_chat-trigger <?php echo esc_attr( $hover_cls ); ?><?php echo '' !== $ai_trigger_label ? ' nexulesuite_chat-trigger--labeled' : ''; ?>"
				id="nexulesuite_chat-trigger"
				aria-expanded="false"
				aria-controls="nexulesuite_chat-panel"
				aria-label="<?php esc_attr_e( 'Open chat', 'nexus-lead-suite' ); ?>">
				<span class="nexulesuite_chat-online-dot" aria-hidden="true"></span>
				<?php if ( '' !== $btn_image ) : ?>
					<img
						class="nexulesuite_chat-trigger__img"
						src="<?php echo preg_match( '#^data:image/(jpeg|jpg|png|gif|webp);base64,#i', $btn_image ) ? esc_attr( $btn_image ) : esc_url( $btn_image ); ?>"
						alt=""
						decoding="async"
					/>
				<?php else : ?>
					<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 10h.01M12 10h.01M16 10h.01M21 16c0 1.1-.9 2-2 2H7l-4 4V6a2 2 0 012-2h14a2 2 0 012 2v10z"/></svg>
				<?php endif; ?>
				<?php if ( '' !== $ai_trigger_label ) : ?>
					<span class="nexulesuite_chat-trigger__label"><?php echo esc_html( $ai_trigger_label ); ?></span>
				<?php endif; ?>
			</button>

		</div>
		<?php
		$chat_html = (string) ob_get_clean();

		ob_start();
		?>
		(function(){
			'use strict';

			var trigger    = document.getElementById('nexulesuite_chat-trigger');
			var panel      = document.getElementById('nexulesuite_chat-panel');
			var closeBtn   = document.getElementById('nexulesuite_chat-close');
			var formView   = document.getElementById('nexulesuite_chat-form-view');
			var formBack   = document.getElementById('nexulesuite_chat-form-back');
			var leadGateView = document.getElementById('nexulesuite_chat-leadgate-view');

			var aiView     = document.getElementById('nexulesuite_chat-ai-view');
			var aiBack     = document.getElementById('nexulesuite_chat-ai-back');
			var aiResetBtn = document.getElementById('nexulesuite_chat-ai-reset');
			var aiMessages = document.getElementById('nexulesuite_chat-ai-messages');
			var aiForm     = document.getElementById('nexulesuite_chat-ai-form');
			var aiInput    = document.getElementById('nexulesuite_chat-ai-input');
			var aiSend     = document.getElementById('nexulesuite_chat-ai-send');
			var aiCfg      = {
				endpoint:  <?php echo wp_json_encode( esc_url_raw( rest_url( 'nexulesuite_/v1/ai/chat' ) ) ); ?>,
				nonce:     '<?php echo esc_js( wp_create_nonce( 'nexulesuite_ai' ) ); ?>',
				restNonce: '<?php echo esc_js( wp_create_nonce( 'wp_rest' ) ); ?>',
				welcome:   '<?php echo esc_js( $ai_welcome ); ?>',
				faq:       <?php echo wp_json_encode( array_values( $ai_faq_items ) ); ?>,
				actions:   <?php echo wp_json_encode( array_values( $ai_actions ) ); ?>,
				icons:     <?php echo wp_json_encode( $ai_icon_svgs ); ?>,
				suggestLabel: '<?php echo esc_js( __( 'Try asking', 'nexus-lead-suite' ) ); ?>',
				leadEndpoint: <?php echo wp_json_encode( esc_url_raw( rest_url( 'nexulesuite_/v1/ai/lead' ) ) ); ?>,
				lead:      { enabled: <?php echo $ai_lead_enabled ? 'true' : 'false'; ?>, offer: '<?php echo esc_js( $ai_lead_offer ); ?>' },
				leadGate:  <?php echo $ai_lead_gate ? 'true' : 'false'; ?>,
				openOnLaunch: <?php echo ! empty( $ai_open_on_launch ) ? 'true' : 'false'; ?>,
				i18n:      {
					lead_cta:  '<?php echo esc_js( __( 'Leave your contact', 'nexus-lead-suite' ) ); ?>',
					lead_name: '<?php echo esc_js( __( 'Your name', 'nexus-lead-suite' ) ); ?>',
					lead_email:'<?php echo esc_js( __( 'Email', 'nexus-lead-suite' ) ); ?>',
					lead_phone:'<?php echo esc_js( __( 'Phone', 'nexus-lead-suite' ) ); ?>',
					lead_send: '<?php echo esc_js( __( 'Send', 'nexus-lead-suite' ) ); ?>',
					lead_need: '<?php echo esc_js( __( 'Please add an email or phone.', 'nexus-lead-suite' ) ); ?>'
				}
			};
			/* Stable per-visitor conversation id so the admin report can group turns. */
			var aiSessionId = (function(){
				try {
					var k = 'nexulesuite_ai_sid';
					var v = window.localStorage.getItem(k);
					if(!v){
						v = 'sid-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
						window.localStorage.setItem(k, v);
					}
					return v;
				} catch(e){
					return 'sid-' + Date.now().toString(36) + '-' + Math.floor(Math.random()*1e6).toString(36);
				}
			})();
			var aiHistory  = [];
			var aiBusy     = false;
			var aiLeadDone = false;
			var aiLeadGatePassed = false;
			try { sessionStorage.removeItem('nexulesuite_lead_gate_ok'); } catch(e){}
			var aiLastQuestion = '';
			var aiLastBotText  = '';

			/* ── Read replies aloud (Web Speech API; absent on some browsers) ── */
			var aiTtsBtn = document.getElementById('nexulesuite_chat-ai-tts');
			var aiSpeech = (window.speechSynthesis && typeof window.SpeechSynthesisUtterance === 'function') ? window.speechSynthesis : null;
			var aiTtsOn  = false;
			var aiTtsLang = (document.documentElement.getAttribute('lang') || 'en-US').replace('_', '-');

			function aiStopSpeech(){
				if(!aiSpeech) return;
				try { aiSpeech.cancel(); } catch(e){}
				if(aiTtsBtn){ aiTtsBtn.classList.remove('is-speaking'); }
			}
			/* Speaks plain text — strip the markdown the bubble renders, or it gets read out as punctuation. */
			function aiSpeakableText(text){
				return String(text || '')
					.replace(/!\[[^\]]*\]\([^)]*\)/g, '')
					.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
					.replace(/[*_`#>]/g, '')
					.replace(/\s+/g, ' ')
					.trim();
			}
			function aiSpeak(text){
				if(!aiSpeech || !aiTtsOn) return;
				var say = aiSpeakableText(text);
				if(!say) return;
				aiStopSpeech();
				try {
					var u = new window.SpeechSynthesisUtterance(say);
					u.lang = aiTtsLang;
					u.onstart = function(){ if(aiTtsBtn){ aiTtsBtn.classList.add('is-speaking'); } };
					u.onend   = function(){ if(aiTtsBtn){ aiTtsBtn.classList.remove('is-speaking'); } };
					u.onerror = u.onend;
					aiSpeech.speak(u);
				} catch(e){}
			}
			/* Every bot line funnels through here, so the toggle can replay the latest one. */
			function aiBotSaid(text){
				aiLastBotText = String(text || '');
				aiSpeak(aiLastBotText);
			}
			if(aiTtsBtn && aiSpeech){
				aiTtsBtn.hidden = false;
				aiTtsBtn.addEventListener('click', function(ev){
					ev.preventDefault();
					aiTtsOn = !aiTtsOn;
					aiTtsBtn.classList.toggle('is-on', aiTtsOn);
					aiTtsBtn.setAttribute('aria-pressed', aiTtsOn ? 'true' : 'false');
					if(aiTtsOn){ aiSpeak(aiLastBotText); }
					else { aiStopSpeech(); }
				});
			}
			/* Browsers keep speaking after the tab goes away otherwise. */
			window.addEventListener('pagehide', aiStopSpeech);

			if(!trigger||!panel) return;

			/* ── Open / close chat panel ── */
			function markLeadGatePassed(){
				aiLeadGatePassed = true;
			}
			function showLeadGateView(){
				if(!leadGateView || aiLeadGatePassed) return;
				panel.classList.remove('nexulesuite_chat-panel--inline-form');
				panel.classList.remove('nexulesuite_chat-panel--ai-active');
				panel.classList.add('nexulesuite_chat-panel--lead-gate');
				if(formView){ formView.classList.remove('nexulesuite_chat-form--active'); }
				['.nexulesuite_chat-panel__body','.nexulesuite_chat-panel__btns'].forEach(function(sel){
					var el = panel.querySelector(sel);
					if(el) el.style.display='none';
				});
				var head = panel.querySelector('.nexulesuite_chat-panel__head');
				if(head) head.style.display='';
			}
			function onLeadGatePassed(){
				if(aiLeadGatePassed) return;
				markLeadGatePassed();
				openAiView();
			}
			function openChat(){
				panel.classList.add('nexulesuite_chat--open');
				trigger.setAttribute('aria-expanded','true');
				if(aiCfg.leadGate && !aiLeadGatePassed){
					showLeadGateView();
				} else if(aiView && (aiCfg.openOnLaunch || (aiCfg.leadGate && aiLeadGatePassed))){
					openAiView();
				}
			}
			function closeChat(){
				panel.classList.remove('nexulesuite_chat--open');
				trigger.setAttribute('aria-expanded','false');
				showMainView();
			}
			trigger.addEventListener('click', function(){
				panel.classList.contains('nexulesuite_chat--open') ? closeChat() : openChat();
			});
			if(closeBtn){ closeBtn.addEventListener('click', closeChat); }

			/* ── Main view ↔ Inline form view ── */
			var mainView = panel.querySelector('.nexulesuite_chat-panel__head') ? panel : null;

			function showFormView(){
				if(!formView) return;
				/* hide all sibling sections except formView */
				['.nexulesuite_chat-panel__head','.nexulesuite_chat-panel__body','.nexulesuite_chat-panel__btns'].forEach(function(sel){
					var el = panel.querySelector(sel);
					if(el) el.style.display='none';
				});
				panel.classList.add('nexulesuite_chat-panel--inline-form');
				formView.classList.add('nexulesuite_chat-form--active');
			}
			function showMainView(){
				aiStopSpeech();
				panel.classList.remove('nexulesuite_chat-panel--inline-form');
				panel.classList.remove('nexulesuite_chat-panel--ai-active');
				panel.classList.remove('nexulesuite_chat-panel--lead-gate');
				if(formView){ formView.classList.remove('nexulesuite_chat-form--active'); }
				if(aiCfg.leadGate && !aiLeadGatePassed){
					showLeadGateView();
					return;
				}
				if(aiCfg.leadGate && aiLeadGatePassed && aiView){
					openAiView();
					return;
				}
				['.nexulesuite_chat-panel__head','.nexulesuite_chat-panel__body','.nexulesuite_chat-panel__btns'].forEach(function(sel){
					var el = panel.querySelector(sel);
					if(el) el.style.display='';
				});
			}

			/* Back button inside form view */
			if(formBack){ formBack.addEventListener('click', showMainView); }

			/* ── Button 1: open inline form (data-nexulesuite_chat-open-form) ── */
			var openFormBtns = panel.querySelectorAll('[data-nexulesuite_chat-open-form]');
			openFormBtns.forEach(function(btn){
				btn.addEventListener('click', showFormView);
			});

			/* ── AI chat view (RAG assistant) ── */
			var AI_CHIP_ICON  = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z"/></svg>';
			var AI_CHIP_ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';
			var aiAvatarHtml  = (function(){
				var h = aiView ? aiView.querySelector('.nexulesuite_chat-ai-view__avatar') : null;
				return (h && h.innerHTML.trim()) ? h.innerHTML : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 10h.01M12 10h.01M16 10h.01M21 16c0 1.1-.9 2-2 2H7l-4 4V6a2 2 0 012-2h14a2 2 0 012 2v10z"/></svg>';
			})();
			function aiNow(){
				try { return new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }); }
				catch(e){ return ''; }
			}
			function aiBotAvatar(){
				var a = document.createElement('span');
				a.className = 'nexulesuite_chat-ai-bubavatar';
				a.innerHTML = aiAvatarHtml;
				return a;
			}
			function aiScrollToEnd(){ if(aiMessages){ aiMessages.scrollTop = aiMessages.scrollHeight; } }
			function aiAddBubble(role, text){
				if(!aiMessages) return null;
				var isUser = (role === 'user');
				var row = document.createElement('div');
				row.className = 'nexulesuite_chat-ai-row nexulesuite_chat-ai-row--' + (isUser ? 'user' : 'bot');
				if(!isUser){ row.appendChild(aiBotAvatar()); }
				var col = document.createElement('div');
				col.className = 'nexulesuite_chat-ai-col';
				var div = document.createElement('div');
				div.className = 'nexulesuite_chat-ai-msg nexulesuite_chat-ai-msg--' + role;
				/* Bot/FAQ answers may include URLs — render as clickable links (escaped + linkified). */
				if(!isUser && role !== 'error' && text){
					try { div.innerHTML = aiRenderMarkdown(text); } catch(e){ div.textContent = text; }
				} else {
					div.textContent = text;
				}
				col.appendChild(div);
				var time = document.createElement('span');
				time.className = 'nexulesuite_chat-ai-time';
				time.textContent = aiNow();
				col.appendChild(time);
				row.appendChild(col);
				aiMessages.appendChild(row);
				aiScrollToEnd();
				return div;
			}
			function aiAddSources(sources){
				if(!aiMessages || !sources || !sources.length) return;
				var wrap = document.createElement('div');
				wrap.className = 'nexulesuite_chat-ai-sources';
				sources.forEach(function(s){
					if(!s || !s.url) return;
					var a = document.createElement('a');
					a.href = s.url; a.target = '_blank'; a.rel = 'noopener nofollow';
					a.textContent = s.title || s.url;
					wrap.appendChild(a);
				});
				if(wrap.childNodes.length){ aiMessages.appendChild(wrap); aiScrollToEnd(); }
			}
			/* ── FAQ / conditional quick-reply buttons (card style) ── */
			function aiIconSvg(key){
				return (key && aiCfg.icons && aiCfg.icons[key]) ? '<svg viewBox="0 0 24 24" aria-hidden="true">' + aiCfg.icons[key] + '</svg>' : AI_CHIP_ICON;
			}
			function aiMakeChip(item, container){
				var b = document.createElement('button');
				b.type = 'button';
				b.className = 'nexulesuite_chat-ai-chip';
				var ic = document.createElement('span');
				ic.className = 'nexulesuite_chat-ai-chip__ic';
				ic.innerHTML = aiIconSvg(item.icon);
				var tx = document.createElement('span');
				tx.className = 'nexulesuite_chat-ai-chip__tx';
				tx.textContent = item.label;
				b.appendChild(ic); b.appendChild(tx);
				b.addEventListener('click', function(){
					if(aiBusy) return;
					aiHandleChip(item, container);
				});
				return b;
			}
			/* Quick actions live in a flex bar between the transcript and the composer (not absolute). */
			function aiAddActions(){
				var bar = document.getElementById('nexulesuite_chat-ai-actionbar');
				if(!bar || !aiCfg.actions || !aiCfg.actions.length) return;
				if(bar.childNodes.length){ bar.hidden = false; return; } /* already built (e.g. after a chat reset) */
				aiCfg.actions.forEach(function(act, i){
					if(!act || !act.label) return;
					var b = document.createElement('button');
					b.type = 'button';
					b.className = 'nexulesuite_chat-ai-action' + (i === 0 ? ' nexulesuite_chat-ai-action--primary' : '');
					var ic = document.createElement('span');
					ic.className = 'nexulesuite_chat-ai-action__ic';
					ic.innerHTML = aiIconSvg(act.icon);
					var tx = document.createElement('span');
					tx.textContent = act.label;
					b.appendChild(ic); b.appendChild(tx);
					b.addEventListener('click', function(){ aiRunAction(act); });
					bar.appendChild(b);
				});
				if(bar.childNodes.length){
					bar.hidden = false;
					if(aiView){ aiView.classList.add('nexulesuite_chat-ai-view--has-actions'); }
				}
			}
			function aiShowContactForm(){
				var src = document.getElementById('nexulesuite_chat-ai-contactsrc');
				if(!src || !src.innerHTML.trim()){ aiShowLeadForm(); return; } /* no shortcode → built-in lead form */
				if(document.getElementById('nexulesuite_chat-ai-embedform')) return; /* already shown */
				var card = document.createElement('div');
				card.className = 'nexulesuite_chat-ai-leadcard nexulesuite_chat-ai-embedform';
				card.id = 'nexulesuite_chat-ai-embedform';
				while(src.firstChild){ card.appendChild(src.firstChild); } /* move nodes → preserves the form's own JS bindings */
				aiMessages.appendChild(card);
				aiScrollToEnd();
			}
			function aiShowInlineActionForm(idx){
				var src = document.getElementById('nexulesuite_chat-ai-actionform-' + idx);
				if(!src || !src.innerHTML.trim()){ aiShowContactForm(); return; } /* nothing rendered → fall back */
				var embedId = 'nexulesuite_chat-ai-actionembed-' + idx;
				if(document.getElementById(embedId)){ aiScrollToEnd(); return; } /* already shown */
				var card = document.createElement('div');
				card.className = 'nexulesuite_chat-ai-leadcard nexulesuite_chat-ai-embedform';
				card.id = embedId;
				while(src.firstChild){ card.appendChild(src.firstChild); } /* move nodes → preserves the form's own JS bindings */
				aiMessages.appendChild(card);
				aiScrollToEnd();
			}
			function aiRunAction(act){
				var url = (act && act.url) ? String(act.url) : '';
				if(!url) return;
				if(url === '#lead' || url === '#contact'){ aiShowLeadForm(); return; }
				if(url === '#form' || url === '#contact-form' || url === '#contactform'){ aiShowContactForm(); return; }
				var mInline = url.match(/^#form-inline-(\d+)$/);
				if(mInline){ aiShowInlineActionForm(mInline[1]); return; }
				if(url.charAt(0) === '#' || url.indexOf('form') === 0){ if(typeof showFormView === 'function'){ showFormView(); } return; }
				if(/^tel:|^mailto:|^sms:/i.test(url)){ window.location.href = url; return; }
				window.open(url, '_blank', 'noopener');
			}
			function aiRenderHome(){
				if(!aiMessages) return;
				if(aiCfg.welcome){ aiAddBubble('bot', aiCfg.welcome); aiBotSaid(aiCfg.welcome); }
				if(aiCfg.faq && aiCfg.faq.length){ aiAddChips(aiCfg.faq); }
				aiAddActions();
			}
			function aiResetChat(){
				if(aiBusy) return;
				aiStopSpeech();
				aiHistory = [];
				aiLeadDone = false;
				aiLastBotText = '';
				if(aiMessages){ aiMessages.innerHTML = ''; }
				try {
					var nid = 'sid-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
					window.localStorage.setItem('nexulesuite_ai_sid', nid);
					aiSessionId = nid;
				} catch(e){}
				aiRenderHome();
			}

			/* ── Smart lead capture / human handoff ── */
			function aiOfferLead(){
				if(aiLeadDone || !aiMessages) return;
				if(document.getElementById('nexulesuite_chat-ai-leadform')) return;
				var offer = (aiCfg.lead && aiCfg.lead.offer) || 'Would you like our team to reach out to you?';
				aiAddBubble('bot', offer);
				aiBotSaid(offer);
				var block = document.createElement('div');
				block.className = 'nexulesuite_chat-ai-suggest';
				var wrap = document.createElement('div');
				wrap.className = 'nexulesuite_chat-ai-chips';
				var b = document.createElement('button');
				b.type = 'button';
				b.className = 'nexulesuite_chat-ai-chip';
				var ic = document.createElement('span');
				ic.className = 'nexulesuite_chat-ai-chip__ic';
				ic.innerHTML = aiIconSvg('mail');
				var tx = document.createElement('span');
				tx.className = 'nexulesuite_chat-ai-chip__tx';
				tx.textContent = aiCfg.i18n.lead_cta;
				b.appendChild(ic); b.appendChild(tx);
				b.addEventListener('click', function(){ if(block.parentNode){ block.parentNode.removeChild(block); } aiShowLeadForm(); });
				wrap.appendChild(b); block.appendChild(wrap);
				aiMessages.appendChild(block); aiScrollToEnd();
			}
			function aiShowLeadForm(){
				if(aiLeadDone || !aiMessages) return;
				if(document.getElementById('nexulesuite_chat-ai-leadform')) return;
				var card = document.createElement('div');
				card.className = 'nexulesuite_chat-ai-leadcard';
				card.id = 'nexulesuite_chat-ai-leadform';
				var n = document.createElement('input'); n.type='text'; n.placeholder=aiCfg.i18n.lead_name; n.className='nexulesuite_chat-ai-leadinput';
				var e = document.createElement('input'); e.type='email'; e.placeholder=aiCfg.i18n.lead_email; e.className='nexulesuite_chat-ai-leadinput';
				var p = document.createElement('input'); p.type='tel'; p.placeholder=aiCfg.i18n.lead_phone; p.className='nexulesuite_chat-ai-leadinput';
				var err = document.createElement('div'); err.className='nexulesuite_chat-ai-leaderr';
				var btn = document.createElement('button'); btn.type='button'; btn.className='nexulesuite_chat-ai-leadsend'; btn.textContent=aiCfg.i18n.lead_send;
				btn.addEventListener('click', function(){
					var email=(e.value||'').trim(), phone=(p.value||'').trim();
					if(!email && !phone){ err.textContent=aiCfg.i18n.lead_need; err.style.display='block'; return; }
					err.style.display='none'; btn.disabled=true; btn.textContent='…';
					aiSubmitLead({ name:(n.value||'').trim(), email:email, phone:phone }, card, btn);
				});
				card.appendChild(n); card.appendChild(p); card.appendChild(e); card.appendChild(err); card.appendChild(btn);
				aiMessages.appendChild(card); aiScrollToEnd();
				setTimeout(function(){ try{ n.focus(); }catch(x){} }, 60);
			}
			function aiSubmitLead(data, card, btn, onSuccess){
				fetch(aiCfg.leadEndpoint, {
					method: 'POST',
					headers: { 'Content-Type':'application/json', 'X-WP-Nonce': aiCfg.restNonce },
					credentials: 'same-origin',
					body: JSON.stringify({ nonce: aiCfg.nonce, name:data.name, email:data.email, phone:data.phone, message: aiLastQuestion, session_id: aiSessionId, page_url: (window.location ? window.location.href : '') })
				}).then(function(r){
					return r.json().then(function(j){ return { ok:r.ok, j:j }; }, function(){ return { ok:r.ok, j:null }; });
				}).then(function(res){
					var j = res.j || {};
					if(res.ok && j.success){
						if(card && card.parentNode){ card.parentNode.removeChild(card); }
						aiLeadDone = true;
						if(typeof onSuccess === 'function'){
							onSuccess(j.message || 'Thanks! Our team will reach out to you shortly.');
							return;
						}
						var thanks = j.message || 'Thanks! Our team will reach out to you shortly.';
						aiAddBubble('bot', thanks);
						aiBotSaid(thanks);
					} else {
						if(btn){ btn.disabled=false; btn.textContent=aiCfg.i18n.lead_send; }
						if(typeof onSuccess === 'function'){
							var errEl = document.getElementById('nexulesuite_chat-leadgate-err');
							if(errEl){
								errEl.textContent = (j && j.message) ? j.message : 'Something went wrong. Please try again.';
								errEl.style.display = 'block';
							}
							return;
						}
						aiAddBubble('error', (j && j.message) ? j.message : 'Something went wrong. Please try again.');
					}
				}).catch(function(){
					if(btn){ btn.disabled=false; btn.textContent=aiCfg.i18n.lead_send; }
					if(typeof onSuccess === 'function'){
						var errEl2 = document.getElementById('nexulesuite_chat-leadgate-err');
						if(errEl2){
							errEl2.textContent = 'Network error. Please try again.';
							errEl2.style.display = 'block';
						}
						return;
					}
					aiAddBubble('error', 'Network error. Please try again.');
				});
			}
			function aiBuildSuggestBlock(items, isFollowup, labelText){
				var block = document.createElement('div');
				block.className = 'nexulesuite_chat-ai-suggest' + (isFollowup ? ' nexulesuite_chat-ai-suggest--followup' : '');
				if(isFollowup){ block.setAttribute('data-nexulesuite_followup', '1'); }
				if(labelText){
					var lbl = document.createElement('div');
					lbl.className = 'nexulesuite_chat-ai-suggest__label';
					lbl.textContent = labelText;
					block.appendChild(lbl);
				}
				var wrap = document.createElement('div');
				wrap.className = 'nexulesuite_chat-ai-chips';
				items.forEach(function(item){
					if(!item || !item.label) return;
					wrap.appendChild(aiMakeChip(item, block));
				});
				block.appendChild(wrap);
				return wrap.childNodes.length ? block : null;
			}
			function aiAddChips(items){
				if(!aiMessages || !items || !items.length) return;
				var block = aiBuildSuggestBlock(items, false, aiCfg.suggestLabel || '');
				if(block){ aiMessages.appendChild(block); aiScrollToEnd(); }
			}
			function aiHandleChip(item, container){
				/* Follow-up chips are one-shot: remove the whole block once a choice is made. */
				if(container && container.getAttribute('data-nexulesuite_followup') === '1' && container.parentNode){
					container.parentNode.removeChild(container);
				}
				var answer = (item.answer || '').trim();
				var hasFollow = !!(item.followups && item.followups.length);
				/* No canned answer and no branch → send the question to the live AI. */
				if(!answer && !hasFollow){
					sendAiMessage(item.label);
					return;
				}
				aiAddBubble('user', item.label);
				aiHistory.push({ role:'user', content: item.label });
				if(answer){
					aiAddBubble('bot', answer);
					aiBotSaid(answer);
					aiHistory.push({ role:'assistant', content: answer });
					if(aiHistory.length > 16){ aiHistory = aiHistory.slice(-16); }
				}
				if(hasFollow){
					var fu = aiBuildSuggestBlock(item.followups, true, '');
					if(fu){ aiMessages.appendChild(fu); aiScrollToEnd(); }
				}
			}

			/* WooCommerce product cards (horizontal carousel under the answer). */
			function aiAddProducts(products){
					try{ console.log('%c[Nexus Lead Suite] product carousel v5', 'color:#fff;background:#4f46e5;padding:2px 6px;border-radius:4px', (products&&products.length)||0, 'product(s)', products); }catch(e){}
				if(!aiMessages || !products || !products.length) return;
				var row = document.createElement('div');
				row.className = 'nexulesuite_chat-ai-products';
					row.style.cssText = 'align-self:stretch;display:flex;align-items:flex-start;min-height:270px;gap:10px;overflow-x:auto;overflow-y:hidden;padding:2px 2px 16px;scrollbar-width:thin;';
				products.forEach(function(p){
						if(!p || !p.title) return;
						var card = document.createElement('div');
						card.className = 'nexulesuite_chat-ai-pcard';
						/* Inline styles + explicit min-height so cards never collapse, even if theme/cache strips the widget CSS. */
						card.style.cssText = 'flex:0 0 152px;width:152px;min-height:222px;display:flex;flex-direction:column;border:1px solid var(--nls-border,#e5e7eb);border-radius:14px;overflow:hidden;background:var(--nls-surface,#fff);box-shadow:0 1px 3px rgba(15,23,42,.08);';
						var link = document.createElement('a');
						link.href = p.url || '#'; link.target = '_blank'; link.rel = 'noopener nofollow';
						link.style.cssText = 'display:flex;flex-direction:column;flex:1 1 auto;text-decoration:none;color:inherit;';
						var im = document.createElement('span');
						im.className = 'nexulesuite_chat-ai-pcard__img';
						im.style.cssText = 'position:relative;flex:0 0 118px;display:flex;align-items:center;justify-content:center;height:118px;min-height:118px;background:var(--nls-border-soft,#f1f5f9);overflow:hidden;';
						if(p.image){
							var pic = document.createElement('img');
							pic.src = String(p.image); pic.alt = p.title; pic.loading = 'lazy';
							pic.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
							pic.onerror = function(){ if(pic.parentNode){ pic.parentNode.removeChild(pic); } im.textContent = '🛍'; im.style.fontSize = '30px'; im.style.opacity = '.5'; };
							im.appendChild(pic);
						} else { im.textContent = '🛍'; im.style.fontSize = '30px'; im.style.opacity = '.5'; }
						if(p.onSale){ var sb=document.createElement('span'); sb.textContent='Sale'; sb.style.cssText='position:absolute;top:6px;left:6px;background:#dc2626;color:#fff;font-size:10px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;padding:2px 7px;border-radius:6px;'; im.appendChild(sb); }
						link.appendChild(im);
						var body = document.createElement('span');
						body.className = 'nexulesuite_chat-ai-pcard__body';
						body.style.cssText = 'display:flex;flex-direction:column;gap:3px;padding:9px 10px 4px;flex:1 1 auto;';
						var t = document.createElement('span'); t.textContent=p.title;
						t.style.cssText = 'font-size:12.5px;font-weight:600;line-height:1.3;color:var(--nls-ink-2,#1e293b);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;';
						body.appendChild(t);
						if(p.price){ var pr=document.createElement('span'); pr.textContent=p.price; pr.style.cssText='font-size:12.5px;font-weight:700;color:var(--nls-primary,#4f46e5);margin-top:auto;padding-top:2px;'; body.appendChild(pr); }
						link.appendChild(body);
						card.appendChild(link);
						/* Woo-native add-to-cart button (separate <a> — a card-wrapping <a> would nest anchors). */
						if(p.addUrl){ var ac=document.createElement('a'); ac.href=p.addUrl; ac.target='_blank'; ac.rel='noopener nofollow'; ac.textContent=(p.addText||'Add to cart'); ac.style.cssText='margin:2px 10px 12px;display:block;text-align:center;text-decoration:none;background:var(--nls-primary,#4f46e5);color:#fff;font-size:11.5px;font-weight:700;padding:8px 6px;border-radius:9px;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;'; card.appendChild(ac); }
						row.appendChild(card);
					});
				if(row.childNodes.length){ aiMessages.appendChild(row); aiScrollToEnd(); }
			}

			/* Safe markdown → HTML (escape first, then a small whitelist): bold, italic,
			   inline code, markdown links, bare URLs, and bullet/numbered lists. */
			function aiEscHtml(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
			function aiRenderMarkdown(text){
				var esc = aiEscHtml(text);
				/* Markdown links first: [label](https://…) */
				esc = esc.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener nofollow">$1</a>');
				/* Bare http(s) URLs — skip ones already used as href="…" from the step above. */
				esc = esc.replace(/https?:\/\/[^\s<&]+/g, function(url, offset, full){
					if(offset >= 6 && full.slice(offset - 6, offset) === 'href="'){ return url; }
					var trail = '';
					var clean = url.replace(/([.,;:!?)\]}]+)$/, function(t){ trail = t; return ''; });
					if(!/^https?:\/\//i.test(clean)){ return url; }
					return '<a href="' + clean + '" target="_blank" rel="noopener nofollow">' + clean + '</a>' + trail;
				});
				esc = esc.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
				esc = esc.replace(/`([^`\n]+)`/g, '<code>$1</code>');
				esc = esc.replace(/(^|[\s(])\*([^*\s][^*\n]*?)\*(?=[\s.,!?)]|$)/g, '$1<em>$2</em>');
				var lines = esc.split('\n');
				var out = [];
				var i = 0;
				while(i < lines.length){
					if(/^\s*[-*•]\s+/.test(lines[i])){
						var ul = [];
						while(i < lines.length && /^\s*[-*•]\s+/.test(lines[i])){ ul.push('<li>' + lines[i].replace(/^\s*[-*•]\s+/, '') + '</li>'); i++; }
						out.push('<ul>' + ul.join('') + '</ul>');
					} else if(/^\s*\d+[.)]\s+/.test(lines[i])){
						var ol = [];
						while(i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])){ ol.push('<li>' + lines[i].replace(/^\s*\d+[.)]\s+/, '') + '</li>'); i++; }
						out.push('<ol>' + ol.join('') + '</ol>');
					} else { out.push({ t: lines[i] }); i++; }
				}
				var html = '';
				out.forEach(function(seg){
					if(typeof seg === 'string'){ html += seg; }
					else { html += (html && html.slice(-1) === '>' ? '' : (html ? '<br>' : '')) + seg.t; }
				});
				return html;
			}

			/* Progressive reveal — animates the answer word-by-word, then renders markdown. */
			function aiTypeOut(el, text, done){
				if(!el){ if(done){ done(); } return; }
				var reduce = false;
				try { reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch(e){}
				text = String(text || '');
				function finish(){ try { el.innerHTML = aiRenderMarkdown(text); } catch(e){ el.textContent = text; } aiScrollToEnd(); if(done){ done(); } }
				if(reduce || text.length > 1400){ finish(); return; }
				var tokens = text.split(/(\s+)/);
				var i = 0;
				el.textContent = '';
				(function step(){
					if(i >= tokens.length){ finish(); return; }
					el.textContent += tokens[i++];
					aiScrollToEnd();
					setTimeout(step, 16);
				})();
			}

			function aiShowTyping(){
				if(!aiMessages) return;
				var row = document.createElement('div');
				row.className = 'nexulesuite_chat-ai-row nexulesuite_chat-ai-row--bot';
				row.id = 'nexulesuite_chat-ai-typing';
				row.appendChild(aiBotAvatar());
				var t = document.createElement('div');
				t.className = 'nexulesuite_chat-ai-typing';
				t.appendChild(document.createElement('span'));
				t.appendChild(document.createElement('span'));
				t.appendChild(document.createElement('span'));
				row.appendChild(t);
				aiMessages.appendChild(row);
				aiScrollToEnd();
			}
			function aiRemoveTyping(){
				var t = document.getElementById('nexulesuite_chat-ai-typing');
				if(t && t.parentNode){ t.parentNode.removeChild(t); }
			}
			function openAiView(){
				if(!aiView) return;
				panel.classList.remove('nexulesuite_chat-panel--lead-gate');
				['.nexulesuite_chat-panel__head','.nexulesuite_chat-panel__body','.nexulesuite_chat-panel__btns'].forEach(function(sel){
					var el = panel.querySelector(sel);
					if(el) el.style.display='none';
				});
				if(formView){ formView.classList.remove('nexulesuite_chat-form--active'); }
				panel.classList.remove('nexulesuite_chat-panel--inline-form');
				panel.classList.add('nexulesuite_chat-panel--ai-active');
				/* Each add* helper scrolls to the end, so a long home screen would open scrolled past
				   the greeting. Replies should still land at the bottom — only the home screen starts at the top. */
				if(aiMessages && !aiMessages.childNodes.length){ aiRenderHome(); aiMessages.scrollTop = 0; }
				/* preventScroll: inside an embed iframe a plain focus() yanks the host page down to it. */
				if(aiInput){ setTimeout(function(){ try{ aiInput.focus({preventScroll:true}); }catch(e){ aiInput.focus(); } }, 60); }
			}
			/* Mirrors the composer's file card inside the sent bubble. */
			function aiDocChip(file){
				var chip = document.createElement('span');
				chip.className = 'nexulesuite_chat-ai-doc';
				var ic = document.createElement('span');
				ic.className = 'nexulesuite_chat-ai-doc__ic';
				ic.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V9z"/><path d="M13 3v6h6"/></svg>';
				var meta = document.createElement('span');
				meta.className = 'nexulesuite_chat-ai-doc__meta';
				var nm = document.createElement('span');
				nm.className = 'nexulesuite_chat-ai-doc__name';
				nm.textContent = file.name;
				var sz = document.createElement('span');
				sz.className = 'nexulesuite_chat-ai-doc__size';
				sz.textContent = aiHumanSize(file.size);
				meta.appendChild(nm); meta.appendChild(sz);
				chip.appendChild(ic); chip.appendChild(meta);
				return chip;
			}
			function sendAiMessage(text){
				text = (text||'').trim();
				var sendImage = aiPendingImage;
				var sendFile  = aiPendingFile;
				if((!text && !sendImage && !sendFile) || aiBusy) return;
				if(text){ aiLastQuestion = text; }
				aiBusy = true;
				if(aiSend){ aiSend.disabled = true; }
				var userBubble = aiAddBubble('user', text);
				if(sendImage && userBubble){
					var im = document.createElement('img');
					im.className = 'nexulesuite_chat-ai-msg-img';
					im.src = sendImage;
					userBubble.appendChild(im);
					aiScrollToEnd();
				}
				if(sendFile && userBubble){
					userBubble.appendChild(aiDocChip(sendFile));
					aiScrollToEnd();
				}
				aiHistory.push({ role:'user', content: text || (sendFile ? ('[file: ' + sendFile.name + ']') : '[image]') });
				if(aiInput){ aiInput.value = ''; }
				if(typeof aiClearImage === 'function'){ aiClearImage(); }
				else if(typeof aiUpdateSendState === 'function'){ aiUpdateSendState(); }
				aiShowTyping();

				fetch(aiCfg.endpoint, {
					method: 'POST',
					headers: { 'Content-Type':'application/json', 'X-WP-Nonce': aiCfg.restNonce },
					credentials: 'same-origin',
					body: JSON.stringify({ nonce: aiCfg.nonce, message: text, history: aiHistory.slice(0, -1), image: sendImage || '', file: sendFile ? { name: sendFile.name, mime: sendFile.mime, data: sendFile.data } : null, session_id: aiSessionId, page_url: (window.location ? window.location.href : '') })
				}).then(function(r){
					return r.json().then(function(j){ return { ok:r.ok, j:j }; }, function(){ return { ok:r.ok, j:null }; });
				}).then(function(res){
					aiRemoveTyping();
					var j = res.j || {};
					if(res.ok && j.success && j.data){
						var answer = (j.data.answer || '').trim() || '…';
						var wantsHuman = !!j.data.handoff;
						var srcs = j.data.sources;
						var prods = j.data.products;
						var botBubble = aiAddBubble('bot', '');
						aiHistory.push({ role:'assistant', content:answer });
						if(aiHistory.length > 16){ aiHistory = aiHistory.slice(-16); }
						/* Speak as soon as the answer lands — the type-out animation runs alongside it. */
						aiBotSaid(answer);
						aiTypeOut(botBubble, answer, function(){
							aiAddSources(srcs);
							aiAddProducts(prods);
							/* Only open the contact form when the visitor actually asks for a human/callback. */
							if(wantsHuman && aiCfg.lead && aiCfg.lead.enabled && !aiLeadDone){ setTimeout(aiShowLeadForm, 300); }
						});
					} else {
						aiAddBubble('error', (j && j.message) ? j.message : 'Sorry, something went wrong. Please try again.');
					}
				}).catch(function(){
					aiRemoveTyping();
					aiAddBubble('error', 'Network error. Please try again.');
				}).then(function(){
					aiBusy = false;
					if(aiSend){ aiSend.disabled = false; }
				});
			}

			var openAiBtns = panel.querySelectorAll('[data-nexulesuite_chat-open-ai]');
			openAiBtns.forEach(function(btn){ btn.addEventListener('click', openAiView); });
			if(aiBack){ aiBack.addEventListener('click', showMainView); }
			if(aiResetBtn){ aiResetBtn.addEventListener('click', aiResetChat); }

			/* Lead gate: built-in name/email/phone form (when no contact shortcode is set). */
			(function wireLeadGateBuiltin(){
				if(!aiCfg.leadGate) return;
				var card = document.getElementById('nexulesuite_chat-leadgate-builtin');
				if(!card) return;
				var n = document.getElementById('nexulesuite_chat-leadgate-name');
				var e = document.getElementById('nexulesuite_chat-leadgate-email');
				var p = document.getElementById('nexulesuite_chat-leadgate-phone');
				var err = document.getElementById('nexulesuite_chat-leadgate-err');
				var btn = document.getElementById('nexulesuite_chat-leadgate-send');
				if(!btn) return;
				btn.addEventListener('click', function(){
					var email = (e && e.value || '').trim();
					var phone = (p && p.value || '').trim();
					if(!email && !phone){
						if(err){ err.textContent = aiCfg.i18n.lead_need; err.style.display = 'block'; }
						return;
					}
					if(err) err.style.display = 'none';
					btn.disabled = true;
					btn.textContent = '…';
					aiSubmitLead({ name:(n && n.value || '').trim(), email:email, phone:phone }, card, btn, function(){
						onLeadGatePassed();
					});
				});
			})();

			/* Lead gate: Form Builder shortcode — open AI chat after a successful submit. */
			(function wireLeadGateForm(){
				if(!aiCfg.leadGate || !leadGateView) return;
				var stForm = leadGateView.querySelector('.nexulesuite_st-form');
				if(!stForm) return;
				var done = false;
				var obs = new MutationObserver(function(){
					if(done) return;
					if(stForm.classList.contains('nexulesuite_st-form--sent')){
						done = true;
						obs.disconnect();
						setTimeout(onLeadGatePassed, 500);
					}
				});
				obs.observe(stForm, { attributes:true, attributeFilter:['class'], subtree:true });
			})();

			<?php if ( $is_panel ) : ?>
			/*
			 * Panel modes: the chat is the box, not a bubble that opens one. There is nothing to
			 * click and no main view worth landing on, so open it and go straight into the
			 * conversation — or the lead gate when button 1 has no link/popup configured.
			 */
			panel.classList.add('nexulesuite_chat--open');
			trigger.setAttribute('aria-expanded','true');
			if(aiCfg.leadGate && !aiLeadGatePassed){ showLeadGateView(); }
			else if(aiView){ openAiView(); }
			<?php endif; ?>
			if(aiForm){
				aiForm.addEventListener('submit', function(ev){
					ev.preventDefault();
					sendAiMessage(aiInput ? aiInput.value : '');
				});
			}

			/* ── Input bar controls: send-state, emoji picker, image attachment ── */
			var aiClip     = document.getElementById('nexulesuite_chat-ai-clip');
			var aiEmojiBtn = document.getElementById('nexulesuite_chat-ai-emoji');
			var aiEmojiPop = document.getElementById('nexulesuite_chat-ai-emoji-pop');
			var aiPendingImage = null;
			var aiPendingFile  = null;

			function aiUpdateSendState(){
				if( ! aiSend || ! aiInput ) return;
				var armed = !! ( aiPendingImage || aiPendingFile );
				if( ! aiBusy && ( aiInput.value.trim() || armed ) ){ aiSend.classList.add('is-active'); }
				else { aiSend.classList.remove('is-active'); }
				if(aiClip){ aiClip.classList.toggle('is-armed', armed); }
			}
			function aiCloseMenus(){
				if(aiEmojiPop) aiEmojiPop.classList.remove('is-open');
				if(aiEmojiBtn) aiEmojiBtn.setAttribute('aria-expanded','false');
			}
			if(aiInput){ aiInput.addEventListener('input', aiUpdateSendState); }

			/* Emoji picker (functional) */
			if(aiEmojiPop){
				var EMOJIS = ['😀','😃','😄','😁','😊','🙂','😉','😍','😘','😎','🤩','🤔','🙌','👍','👎','👏','🙏','💪','🔥','✨','🎉','❤️','💯','✅','❓','⚠️','😅','😢','😮','🥳','🚀','📎'];
				EMOJIS.forEach(function(em){
					var b = document.createElement('button');
					b.type = 'button';
					b.textContent = em;
					b.addEventListener('click', function(ev){
						ev.preventDefault();
						if(aiInput){ aiInput.value += em; aiInput.focus(); aiUpdateSendState(); }
						aiCloseMenus();
					});
					aiEmojiPop.appendChild(b);
				});
			}
			if(aiEmojiBtn){
				aiEmojiBtn.addEventListener('click', function(ev){
					ev.preventDefault(); ev.stopPropagation();
					var open = aiEmojiPop.classList.toggle('is-open');
					aiEmojiBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
				});
			}

			/* Attachments: paperclip / clipboard paste. Images go to the vision model; documents are text-extracted server-side. */
			var aiFile      = document.getElementById('nexulesuite_chat-ai-file');
			var aiAttach    = document.getElementById('nexulesuite_chat-ai-attach');
			var aiAttachImg = document.getElementById('nexulesuite_chat-ai-attach-img');
			var aiAttachX   = document.getElementById('nexulesuite_chat-ai-attach-x');
			var aiDoc       = document.getElementById('nexulesuite_chat-ai-doc');
			var aiDocName   = document.getElementById('nexulesuite_chat-ai-doc-name');
			var aiDocSize   = document.getElementById('nexulesuite_chat-ai-doc-size');
			var aiDocX      = document.getElementById('nexulesuite_chat-ai-doc-x');

			/* Keep full 4K detail: only shrink what exceeds it, and never re-encode a small file. */
			var AI_IMAGE_MAX_EDGE   = 4096;
			var AI_IMAGE_REENCODE   = 6 * 1024 * 1024;  /* bytes above which we re-encode as JPEG */
			var AI_IMAGE_MAX_BASE64 = 20971520;         /* must match RestApi::AI_IMAGE_MAX_BASE64 */
			var AI_DOC_MAX_BYTES    = 10 * 1024 * 1024;
			var AI_DOC_MIMES = {
				'application/pdf': 1, 'text/plain': 1, 'text/markdown': 1,
				'text/csv': 1, 'text/html': 1, 'application/json': 1
			};

			function aiHumanSize(bytes){
				if(bytes < 1024){ return bytes + ' B'; }
				if(bytes < 1048576){ return Math.round(bytes/1024) + ' KB'; }
				return (bytes/1048576).toFixed(1) + ' MB';
			}
			function aiDocMime(file){
				var type = (file.type || '').toLowerCase();
				if(AI_DOC_MIMES[type]){ return type; }
				/* Browsers leave .md and some .csv files with an empty type. */
				var name = (file.name || '').toLowerCase();
				if(/\.md$|\.markdown$/.test(name)){ return 'text/markdown'; }
				if(/\.txt$/.test(name)){ return 'text/plain'; }
				if(/\.csv$/.test(name)){ return 'text/csv'; }
				if(/\.json$/.test(name)){ return 'application/json'; }
				if(/\.pdf$/.test(name)){ return 'application/pdf'; }
				return '';
			}
			function aiClearImage(){
				aiPendingImage = null;
				aiPendingFile  = null;
				if(aiFile){ aiFile.value = ''; }
				if(aiAttach){ aiAttach.hidden = true; }
				if(aiAttachImg){ aiAttachImg.removeAttribute('src'); }
				if(aiDoc){ aiDoc.hidden = true; }
				aiUpdateSendState();
			}
			function aiAttachError(text){
				aiAddBubble('error', text);
			}
			function aiLoadImageFile(file){
				if(!file || (file.type || '').indexOf('image/') !== 0){ return; }
				var reader = new FileReader();
				reader.onload = function(){
					var img = new Image();
					img.onload = function(){
						var w = img.width, h = img.height;
						var tooBig    = (w > AI_IMAGE_MAX_EDGE || h > AI_IMAGE_MAX_EDGE);
						var tooHeavy  = (file.size > AI_IMAGE_REENCODE);

						if(!tooBig && !tooHeavy){
							/* Small enough: send the original bytes, preserving PNG/WebP quality. */
							aiPendingImage = reader.result;
						} else {
							if(tooBig){ var r = Math.min(AI_IMAGE_MAX_EDGE/w, AI_IMAGE_MAX_EDGE/h); w = Math.round(w*r); h = Math.round(h*r); }
							var canvas = document.createElement('canvas');
							canvas.width = w; canvas.height = h;
							canvas.getContext('2d').drawImage(img, 0, 0, w, h);
							try { aiPendingImage = canvas.toDataURL('image/jpeg', 0.9); }
							catch(e){ aiPendingImage = reader.result; }
						}

						if(aiPendingImage.length > AI_IMAGE_MAX_BASE64){
							aiPendingImage = null;
							aiAttachError('That image is too large (max ~15 MB).');
							return;
						}
						aiPendingFile = null;
						if(aiDoc){ aiDoc.hidden = true; }
						if(aiAttachImg){ aiAttachImg.src = aiPendingImage; }
						if(aiAttach){ aiAttach.hidden = false; }
						aiUpdateSendState();
						if(aiInput){ aiInput.focus(); }
					};
					img.onerror = function(){ aiAttachError('That image could not be read.'); };
					img.src = reader.result;
				};
				reader.readAsDataURL(file);
			}
			function aiLoadDocFile(file, mime){
				if(file.size > AI_DOC_MAX_BYTES){
					aiAttachError('That file is too large (max 10 MB).');
					return;
				}
				var reader = new FileReader();
				reader.onload = function(){
					var result = String(reader.result || '');
					var comma  = result.indexOf(',');
					if(comma === -1){ aiAttachError('That file could not be read.'); return; }
					aiPendingImage = null;
					aiPendingFile  = { name: file.name || 'attachment', mime: mime, data: result.slice(comma + 1), size: file.size };
					if(aiAttach){ aiAttach.hidden = true; }
					if(aiDocName){ aiDocName.textContent = aiPendingFile.name; }
					if(aiDocSize){ aiDocSize.textContent = aiHumanSize(file.size); }
					if(aiDoc){ aiDoc.hidden = false; }
					aiUpdateSendState();
					if(aiInput){ aiInput.focus(); }
				};
				reader.onerror = function(){ aiAttachError('That file could not be read.'); };
				reader.readAsDataURL(file);
			}
			function aiLoadAttachment(file){
				if(!file){ return; }
				if((file.type || '').indexOf('image/') === 0){ aiLoadImageFile(file); return; }
				var mime = aiDocMime(file);
				if(mime){ aiLoadDocFile(file, mime); return; }
				aiAttachError('That file type is not supported. Attach an image, PDF, TXT, MD, CSV, HTML or JSON file.');
			}

			if(aiFile){
				aiFile.addEventListener('change', function(){
					if(aiFile.files && aiFile.files[0]){ aiLoadAttachment(aiFile.files[0]); }
				});
				if(aiAttachX){ aiAttachX.addEventListener('click', aiClearImage); }
				if(aiDocX){ aiDocX.addEventListener('click', aiClearImage); }
				if(aiClip){
					aiClip.addEventListener('click', function(ev){
						ev.preventDefault();
						aiCloseMenus();
						aiFile.click();
					});
				}
				if(aiInput){
					aiInput.addEventListener('paste', function(ev){
						var items = (ev.clipboardData && ev.clipboardData.items) || [];
						for(var i=0;i<items.length;i++){
							if(items[i].type && items[i].type.indexOf('image/') === 0){
								var f = items[i].getAsFile();
								if(f){ ev.preventDefault(); aiLoadImageFile(f); break; }
							}
						}
					});
				}
			}

			/* Close popovers when clicking outside the chat view */
			document.addEventListener('click', function(ev){
				if(aiView && ! aiView.contains(ev.target)){ aiCloseMenus(); }
			});

			/* ── Buttons 2 & 3: open external nexus popup (data-nexulesuite_chat-popup) ── */
			var popupBtns = panel.querySelectorAll('[data-nexulesuite_chat-popup]');
			popupBtns.forEach(function(btn){
				btn.addEventListener('click', function(ev){
					ev.preventDefault();
					var evName = (btn.getAttribute('data-nexulesuite_chat-popup') || '').trim();
					closeChat();
					if(!evName) return;
					var nexulesuite_Popup = (window.nexulesuite_PopupUi && typeof window.nexulesuite_PopupUi.findOverlayByEventId === 'function')
						? window.nexulesuite_PopupUi.findOverlayByEventId(evName)
						: null;
					if(!nexulesuite_Popup) return;
					if(window.nexulesuite_PopupUi && typeof window.nexulesuite_PopupUi.open === 'function'){
						window.nexulesuite_PopupUi.open(nexulesuite_Popup);
					} else {
						nexulesuite_Popup.classList.add('nexulesuite_popup--open');
						nexulesuite_Popup.setAttribute('aria-hidden','false');
						document.body.style.overflow='hidden';
					}
				});
			});

			/* ESC key */
			document.addEventListener('keydown', function(e){
				if(e.key==='Escape' && panel.classList.contains('nexulesuite_chat--open')){ closeChat(); }
			});
		})();
		<?php
		$chat_js = (string) ob_get_clean();

		if ( $is_embed ) {
			/*
			 * Pasted HTML hosts often omit/under-set margin-bottom, so the site footer sits flush
			 * under the rounded frame. Same-origin iframe can nudge the parent host spacing.
			 */
			$chat_js .= "\n" . <<<'EMBED_HOST_JS'
(function(){
	try {
		var frame = window.frameElement;
		if (!frame) return;
		var host = frame.closest ? frame.closest('.nexulesuite_chat-embed') : null;
		if (!host && frame.parentElement) {
			host = frame.parentElement.classList && frame.parentElement.classList.contains('nexulesuite_chat-embed')
				? frame.parentElement
				: frame.parentElement.parentElement;
		}
		if (!host) return;
		var mb = parseFloat(window.getComputedStyle(host).marginBottom) || 0;
		if (mb < 36) host.style.marginBottom = '36px';
	} catch (e) {}
})();
EMBED_HOST_JS;
			$chat_js .= "\n";
		}

		if ( $is_inline ) {
			/*
			 * full_width="yes": widen the wrapper to the viewport from wherever the page builder put
			 * it. CSS cannot express this (see the is-bleed note above), so measure it: the wrapper's
			 * own left edge gives the pull-back, and the negative right margin keeps its layout
			 * footprint equal to the parent's width, so nothing gains a horizontal scrollbar.
			 */
			$chat_js .= "\n" . <<<'BLEED_JS'
(function(){
	var el = document.querySelector('.nexulesuite_chat-inline.is-bleed');
	if(!el || !el.parentElement) return;
	function fit(){
		el.style.width = 'auto';
		el.style.marginLeft = '0px';
		el.style.marginRight = '0px';
		var vw     = document.documentElement.clientWidth;
		var left   = el.getBoundingClientRect().left;
		var parent = el.parentElement.clientWidth;
		el.style.width       = vw + 'px';
		el.style.marginLeft  = (-left) + 'px';
		el.style.marginRight = (parent + left - vw) + 'px';
	}
	fit();
	window.addEventListener('resize', fit);
	if(window.ResizeObserver){ new ResizeObserver(fit).observe(document.documentElement); }
})();
BLEED_JS;
			$chat_js .= "\n";
		}

		return array(
			'css'  => $chat_css,
			'html' => $chat_html,
			'js'   => $chat_js,
		);
	}

	/**
	 * URL of the standalone chat document that `[nexulesuite_chat]` frames.
	 *
	 * Uses a query arg rather than a rewrite rule so it works on plain permalinks and needs no flush.
	 *
	 * @return string
	 */
	private function chat_embed_url(): string {
		return add_query_arg( self::CHAT_EMBED_QUERY_VAR, '1', home_url( '/' ) );
	}

	/**
	 * Serves the chat as a bare, framable document (the iframe target of `[nexulesuite_chat]`).
	 *
	 * Runs the same builder as the floating widget, so the embedded chat is the same chat:
	 * same settings, same AI/FAQ/lead flows, same REST calls, same inline forms.
	 *
	 * @return void
	 */
	public function maybe_serve_chat_embed(): void {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- public, read-only route; no state is changed.
		if ( empty( $_GET[ self::CHAT_EMBED_QUERY_VAR ] ) ) {
			return;
		}

		nocache_headers();

		/*
		 * Built before the partial fires wp_enqueue_scripts, so that any form the chat renders via
		 * do_shortcode() has already flipped $did_render — otherwise enqueue_assets() would skip the
		 * forms runtime and inline forms would be inert inside the frame.
		 */
		$parts = $this->build_livechat_parts( 'embed' );

		if ( null === $parts ) {
			status_header( 404 );
			wp_die(
				esc_html__( 'Live chat is turned off. Enable it under Nexus → Settings → Livechat & Styling.', 'nexus-lead-suite' ),
				esc_html__( 'Chat unavailable', 'nexus-lead-suite' ),
				array( 'response' => 404 )
			);
		}

		add_action(
			'wp_enqueue_scripts',
			function () use ( $parts ): void {
				$this->enqueue_footer_inline_style( 'nexulesuite_livechat-widget', $parts['css'] );
				$this->enqueue_footer_inline_script( 'nexulesuite_livechat-widget', $parts['js'] );
			},
			20
		);

		$nexulesuite_chat_embed_html = $parts['html'];

		$partial = nexulesuite_PLUGIN_DIR . 'public/partials/chat-embed.php';
		if ( file_exists( $partial ) ) {
			require $partial;
		}

		exit;
	}

	/**
	 * `[nexulesuite_chat]` — drops the chat into any page, post, widget area or page builder.
	 *
	 * Renders straight into the page DOM by default, so the chat sits in the flow as an ordinary
	 * block that fills its container (Elementor column, block, template part) and inherits the
	 * page's width — not a floating bubble and not a popped-out card.
	 *
	 * mode="iframe" renders it in an iframe instead, which walls it off from the theme's CSS at
	 * the cost of a fixed box. That is the transport the copy-paste HTML embed code uses.
	 *
	 * Attributes:
	 *   height        Max chat height in px (default 680). Actual height is fluid with the
	 *                 container width (clamp) and never exceeds this value.
	 *   max_width     CSS max-width of the chat (default none — fills the space it is given).
	 *   full_width    "yes" breaks out of a narrow host column and spans the page; combine with
	 *                 max_width to land at content width. "no" (default) simply fills the container.
	 *   mode          "inline" (default) or "iframe".
	 *   hide_floating "yes" (default) hides the floating bubble on this page, "no" keeps both.
	 *
	 * @param array<string,mixed>|string $atts Shortcode attributes.
	 * @return string
	 */
	public function render_chat_shortcode( $atts ): string {
		$a = shortcode_atts(
			array(
				'height'        => 680,
				'width'         => '100%',
				'max_width'     => 'none',
				'full_width'    => 'no',
				'mode'          => 'inline',
				'hide_floating' => 'yes',
			),
			is_array( $atts ) ? $atts : array(),
			'nexulesuite_chat'
		);

		$opt = get_option( self::GENERAL_SETTINGS_OPTION_KEY, array() );
		if ( ! is_array( $opt ) || empty( $opt['enableLivechat'] ?? false ) ) {
			// Never dump an admin notice on a visitor-facing page.
			return current_user_can( 'manage_options' )
				? '<p class="nexulesuite_chat-embed-notice">' . esc_html__( 'Nexus Lead Suite: live chat is turned off. Enable it under Nexus → Settings → Livechat & Styling.', 'nexus-lead-suite' ) . '</p>'
				: '';
		}

		if ( 'no' !== strtolower( trim( (string) $a['hide_floating'] ) ) ) {
			// wp_footer runs after the content, so the floating widget still sees this.
			self::$suppress_floating_livechat = true;
		}

		$height    = max( 320, min( 1200, (int) $a['height'] ) );
		$width     = $this->sanitize_css_length( (string) $a['width'], '100%' );
		$max_width = $this->sanitize_css_length( (string) $a['max_width'], 'none' );
		$is_bleed  = ( 'no' !== strtolower( trim( (string) $a['full_width'] ) ) );
		/*
		 * Width follows the host; height is liquid via cqw (see inline/embed CSS) and capped by
		 * --nls-chat-h. A fixed height:Npx here would ignore the parent column as it shrinks.
		 */
		$box_style = sprintf(
			'width:%s;max-width:%s;--nls-chat-h:%dpx;',
			$width,
			$max_width,
			$height
		);

		if ( 'iframe' === strtolower( trim( (string) $a['mode'] ) ) ) {
			$title = sanitize_text_field( (string) ( $opt['chatTitle'] ?? __( 'Chat', 'nexus-lead-suite' ) ) );

			/*
			 * Iframe host: same fluid box as the shortcode. Outer element is the size container;
			 * the inner frame uses cqw for height (cqw cannot resolve on the container itself).
			 * Inner document scales type with frame width; no postMessage height sync.
			 */
			wp_enqueue_style(
				'nexulesuite_chat-embed',
				nexulesuite_PLUGIN_URL . 'public/css/chat-embed.css',
				array(),
				nexulesuite_VERSION
			);

			return sprintf(
				'<div class="nexulesuite_chat-embed" style="%1$s">'
					. '<div class="nexulesuite_chat-embed__frame">'
						. '<iframe src="%2$s" title="%3$s" loading="lazy" allow="microphone; clipboard-write"></iframe>'
					. '</div>'
				. '</div>',
				esc_attr( $box_style ),
				esc_url( $this->chat_embed_url() ),
				esc_attr( $title )
			);
		}

		/*
		 * The widget's markup is keyed by element id (#nexulesuite_chat-panel and friends) and its
		 * JS binds to those ids, so a second inline chat on the same page would silently drive the
		 * first one. Render one, and tell the admin why the rest are missing.
		 */
		if ( self::$inline_chat_rendered ) {
			return current_user_can( 'manage_options' )
				? '<p class="nexulesuite_chat-embed-notice">' . esc_html__( 'Nexus Lead Suite: only one inline chat can run per page.', 'nexus-lead-suite' ) . '</p>'
				: '';
		}

		$parts = $this->build_livechat_parts( 'inline' );
		if ( null === $parts ) {
			return '';
		}

		self::$inline_chat_rendered = true;

		/*
		 * The CSS ships with the markup rather than through wp_add_inline_style(): a shortcode runs
		 * long after wp_head() has printed, so a late-enqueued stylesheet lands in the footer and the
		 * chat flashes unstyled first. Page builders (Elementor stores content in post meta, not
		 * post_content) also defeat the usual "scan the content and enqueue early" trick.
		 * The JS has no such problem — the footer is exactly where it belongs.
		 */
		$this->enqueue_footer_inline_script( 'nexulesuite_livechat-widget', $parts['js'] );
		$this->enqueue_footer_inline_style( 'nexulesuite_livechat-widget', $parts['css'] );

		return sprintf(
			'<div class="nexulesuite_chat-inline%1$s">'
				. '<div class="nexulesuite_chat-inline__box" style="%2$s">%3$s</div>'
			. '</div>',
			$is_bleed ? ' is-bleed' : '',
			esc_attr( $box_style ),
			wp_kses( $parts['html'], self::allowed_embed_html() )
		);
	}

	/**
	 * Allows only simple CSS lengths (px/%/rem/em/vw/vh, `auto`, `none`) from shortcode attributes.
	 *
	 * @param string $raw      Raw attribute value.
	 * @param string $fallback Value to use when $raw is not a plain length.
	 * @return string
	 */
	private function sanitize_css_length( string $raw, string $fallback ): string {
		$raw = trim( $raw );
		if ( preg_match( '/^(auto|none|\d+(\.\d+)?(px|%|rem|em|vw|vh)?)$/i', $raw ) ) {
			return $raw;
		}

		return $fallback;
	}

	/**
	 * Renders address compound field.
	 *
	 * @param string              $base_name Base name.
	 * @param array<string,mixed> $parts Parts.
	 * @param bool                $required Required.
	 * @return void
	 */
	private function render_address_field( string $base_name, array $parts, bool $required ): void {
		$order = array(
			'address1' => 'Address',
			'address2' => 'Apartment, suite, etc.',
			'city'     => 'City',
			'state'    => 'State / Province',
			'zip'      => 'ZIP / Postal code',
			'country'  => 'Country',
		);

		echo '<div class="nexulesuite_st-compound nexulesuite_st-compound--2">';
		foreach ( $order as $key => $fallback ) {
			$part = isset( $parts[ $key ] ) && is_array( $parts[ $key ] ) ? $parts[ $key ] : array();
			$enabled = isset( $part['enabled'] ) ? (bool) $part['enabled'] : true;
			if ( ! $enabled ) {
				continue;
			}
			$label   = isset( $part['label'] ) ? sanitize_text_field( (string) $part['label'] ) : $fallback;
			$caption = trim( $label );
			if ( '' === $caption ) {
				continue;
			}
			$id      = $this->floating_input_dom_id();
			$sub_req = $required && 'address1' === $key;
			$html    = '<div class="nexulesuite_st-float-wrap">';
			$html   .= '<input id="' . esc_attr( $id ) . '" class="nexulesuite_st-input forminator-input" type="text" name="' . esc_attr( $base_name ) . '[' . esc_attr( $key ) . ']"' . $this->floating_nbsp_placeholder_attr() . ( $sub_req ? ' required' : '' ) . ' />';
			$html   .= sprintf(
				'<label class="nexulesuite_st-float-label" for="%s">%s%s</label></div>',
				esc_attr( $id ),
				esc_html( $caption ),
				$sub_req ? '<span class="nexulesuite_st-req">*</span>' : ''
			);
			echo wp_kses( $html, \nexulesuite_\allowed_form_html() );
		}
		echo '</div>';
	}

	/**
	 * Enqueues inline CSS in the footer via wp_add_inline_style().
	 *
	 * @param string $handle Registered style handle.
	 * @param string $css    CSS rules (no `<style>` wrapper).
	 * @return void
	 */
	private function enqueue_footer_inline_style( string $handle, string $css ): void {
		if ( ! wp_style_is( $handle, 'registered' ) ) {
			wp_register_style( $handle, false, array(), nexulesuite_VERSION );
		}
		wp_enqueue_style( $handle );
		wp_add_inline_style( $handle, $css );
	}

	/**
	 * Enqueues inline JS in the footer via wp_add_inline_script().
	 *
	 * @param string        $handle Registered script handle.
	 * @param string        $js     JavaScript source (no `<script>` wrapper).
	 * @param array<string> $deps   Optional script dependencies.
	 * @return void
	 */
	private function enqueue_footer_inline_script( string $handle, string $js, array $deps = array() ): void {
		if ( ! wp_script_is( $handle, 'registered' ) ) {
			wp_register_script( $handle, false, $deps, nexulesuite_VERSION, true );
		}
		wp_enqueue_script( $handle );
		wp_add_inline_script( $handle, $js );
	}

	/**
	 * Recursively sanitizes webhook JSON payloads before outbound HTTP POST.
	 *
	 * @param array<string,mixed> $payload Raw payload.
	 * @return array<string,mixed>
	 */
	private function sanitize_webhook_payload( array $payload ): array {
		$sanitized = array();
		foreach ( $payload as $key => $value ) {
			$safe_key = sanitize_text_field( (string) $key );
			if ( '' === $safe_key ) {
				continue;
			}
			if ( is_array( $value ) ) {
				$sanitized[ $safe_key ] = $this->sanitize_webhook_payload( $value );
			} elseif ( is_bool( $value ) ) {
				$sanitized[ $safe_key ] = $value;
			} elseif ( is_int( $value ) || is_float( $value ) ) {
				$sanitized[ $safe_key ] = $value;
			} else {
				$sanitized[ $safe_key ] = sanitize_textarea_field( (string) $value );
			}
		}

		return $sanitized;
	}
}

