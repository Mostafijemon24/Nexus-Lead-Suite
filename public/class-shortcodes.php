<?php
/**
 * Frontend shortcodes renderer for Nexus Lead Suite forms.
 *
 * @package Nexus_Lead_Suite
 */

declare(strict_types=1);

namespace Nexus_Lead_Suite\Public;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers and renders form shortcodes.
 *
 * The plugin skips loading this class on typical wp-admin HTML requests (see `nexus_ls_load_shortcodes_module` filter).
 */
final class Shortcodes {

	/**
	 * Forms option key.
	 */
	private const FORMS_OPTION_KEY = 'step_forms_builder_v0';

	/**
	 * General settings option key.
	 */
	private const GENERAL_SETTINGS_OPTION_KEY = 'nexus_ls_general_settings_v1';

	/**
	 * Anti-spam honeypot: text field hidden from users; bots often fill it.
	 * Name is stable for server check and JS draft exclusion.
	 */
	private const HONEYPOT_FIELD_NAME = 'nexus_ls_hp_website';

	/**
	 * Saved keys (same option names as REST API).
	 */
	private const RECAPTCHA_OPTION_KEY = 'step_recaptcha_keys_v0';

	/**
	 * reCAPTCHA v3 action name (must match JS execute() and siteverify response).
	 */
	private const RECAPTCHA_V3_ACTION = 'nexus_ls_form_submit';

	private const TURNSTILE_OPTION_KEY = 'step_turnstile_keys_v0';

	/**
	 * Whether current request rendered a form.
	 *
	 * @var bool
	 */
	private static $did_render = false;

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
	private const MENU_ITEMS_OPTION_KEY = 'nexus_ls_menu_items_v1';

	/**
	 * Popups option key.
	 */
	private const POPUPS_OPTION_KEY = 'nexus_ls_popups_v1';

	/**
	 * Saved email templates (same key as REST / Emails admin).
	 */
	private const EMAIL_TEMPLATES_OPTION_KEY = 'nexus_ls_email_templates_v1';

	/**
	 * Hooks.
	 *
	 * @return void
	 */
	public function register_hooks(): void {
		// Register shortcodes immediately (safe to call at any point after plugins_loaded).
		$this->register_shortcodes();
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
		add_action( 'wp_footer', array( $this, 'render_bottom_nav' ), 20 );
		add_action( 'wp_footer', array( $this, 'render_livechat_widget' ), 25 );
		// AJAX: notification email trigger (both logged-in and guest visitors).
		add_action( 'wp_ajax_nexus_trigger_notify', array( $this, 'handle_trigger_notify' ) );
		add_action( 'wp_ajax_nopriv_nexus_trigger_notify', array( $this, 'handle_trigger_notify' ) );
		// AJAX: Nexus form builder submissions (guest + logged-in).
		add_action( 'wp_ajax_nexus_ls_submit_form', array( $this, 'handle_form_submit_ajax' ) );
		add_action( 'wp_ajax_nopriv_nexus_ls_submit_form', array( $this, 'handle_form_submit_ajax' ) );
	}

	/**
	 * Enqueues the Visual Editor overlay (admin-only, opt-in via query string).
	 *
	 * Lightweight rule: only load when `?nexus-ve=1` and user can manage options.
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
		$cookie = isset( $_COOKIE['nexus_ls_ve'] ) ? sanitize_text_field( wp_unslash( (string) $_COOKIE['nexus_ls_ve'] ) ) : '';
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

		$path = NEXUS_LS_PLUGIN_DIR . 'public/js/nexus-ls-visual-editor.js';
		$ver  = file_exists( $path ) ? (string) filemtime( $path ) : NEXUS_LS_VERSION;

		wp_enqueue_script(
			'nexus-ls-visual-editor',
			esc_url( NEXUS_LS_PLUGIN_URL . 'public/js/nexus-ls-visual-editor.js' ),
			array( 'wp-element' ),
			$ver,
			true
		);

		wp_localize_script(
			'nexus-ls-visual-editor',
			'nexusLsVeCfg',
			array(
				'restUrl'  => esc_url_raw( rest_url() ),
				'nonce'    => wp_create_nonce( 'wp_rest' ),
				'postId'   => $post_id,
				'endpoint' => esc_url_raw( rest_url( 'nexus-lead-suite/v1/visual-editor/update' ) ),
				'activityButtonClasses' => (string) ( ( get_option( self::GENERAL_SETTINGS_OPTION_KEY, array() )['activityButtonClasses'] ?? '' ) ),
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

		$patches = get_post_meta( $post_id, '_nexus_ls_ve_dom_patches', true );
		if ( ! is_array( $patches ) || array() === $patches ) {
			return;
		}

		$list = array_values( $patches );
		$path = NEXUS_LS_PLUGIN_DIR . 'public/js/nexus-ls-ve-apply-patches.js';
		$ver  = file_exists( $path ) ? (string) filemtime( $path ) : NEXUS_LS_VERSION;

		$bridge_path = NEXUS_LS_PLUGIN_DIR . 'public/js/nexus-ls-popup-bridge.js';
		$deps        = file_exists( $bridge_path ) ? array( 'nexus-ls-popup-bridge' ) : array();

		wp_enqueue_script(
			'nexus-ls-ve-apply-patches',
			esc_url( NEXUS_LS_PLUGIN_URL . 'public/js/nexus-ls-ve-apply-patches.js' ),
			$deps,
			$ver,
			true
		);

		wp_localize_script(
			'nexus-ls-ve-apply-patches',
			'nexusLsVePatches',
			$list
		);
	}

	/**
	 * AJAX handler: sends a notification email when a comma-trigger fires on the frontend.
	 * Trigger format: data-nexas-trigger="popup-event-id, notify-label"
	 * The "notify-label" (second value after the comma) is used as the email subject tag.
	 *
	 * @return void
	 */
	public function handle_trigger_notify(): void {
		// Verify nonce sent from frontend.
		if ( ! check_ajax_referer( 'nexus_trigger_notify', 'nonce', false ) ) {
			wp_send_json_error( array( 'message' => 'Invalid nonce.' ), 403 );
			return;
		}

		$trigger_id   = sanitize_text_field( wp_unslash( $_POST['trigger_id'] ?? '' ) );
		$notify_label = sanitize_text_field( wp_unslash( $_POST['notify_label'] ?? '' ) );
		$page_url     = esc_url_raw( wp_unslash( $_POST['page_url'] ?? '' ) );

		$templates  = $this->read_email_templates_from_storage();
		$recipients = $this->collect_union_recipients_from_templates( $templates );
		if ( empty( $recipients ) ) {
			$admin = (string) get_option( 'admin_email' );
			if ( $admin && is_email( $admin ) ) {
				$recipients[] = $admin;
			}
		}

		$site_name = (string) get_bloginfo( 'name' );
		$sent      = false;

		if ( ! empty( $recipients ) ) {
			$general   = get_option( self::GENERAL_SETTINGS_OPTION_KEY, array() );
			$sel_id    = is_array( $general ) ? sanitize_text_field( (string) ( $general['selectedEmailTemplate'] ?? '' ) ) : '';
			$event_tpl = $this->find_email_template_by_id( $templates, $sel_id );
			$html_body = $this->get_email_template_html_body( $event_tpl );
			if ( '' === trim( $html_body ) ) {
				$event_tpl = $this->find_first_email_template_with_html( $templates );
				$html_body = $this->get_email_template_html_body( $event_tpl );
			}

			try {
				if ( is_array( $event_tpl ) && '' !== trim( $html_body ) ) {
					$subject = isset( $event_tpl['subject'] ) ? (string) $event_tpl['subject'] : '';
					if ( '' === trim( $subject ) ) {
						$subject = sprintf( '[%s] %s', $site_name, $notify_label !== '' ? $notify_label : $trigger_id );
					}
					$subject   = $this->apply_trigger_notification_merge_tags( $subject, $trigger_id, $notify_label, $page_url );
					$html_body = $this->apply_trigger_notification_merge_tags( $html_body, $trigger_id, $notify_label, $page_url );
					$headers   = array(
						'MIME-Version: 1.0',
						'Content-Type: text/html; charset=UTF-8',
					);
					$sent = (bool) wp_mail( $recipients, $subject, $html_body, $headers );
				} else {
					$subject = sprintf( '[%s] Trigger Notification: %s', $site_name, $notify_label !== '' ? $notify_label : $trigger_id );
					$message = sprintf(
						"A trigger was fired on your website.\n\nTrigger ID: %s\nNotify Label: %s\nPage: %s\nTime: %s\n",
						$trigger_id,
						$notify_label,
						$page_url,
						current_time( 'mysql' )
					);
					$sent = (bool) wp_mail( $recipients, $subject, $message );
				}
			} catch ( \Throwable $e ) {
				$sent = false;
			}
		}

		try {
			require_once NEXUS_LS_PLUGIN_DIR . 'core/class-activities-store.php';
			\Nexus_Lead_Suite\Core\Activities_Store::record_interaction(
				'trigger_notify',
				$trigger_id,
				$page_url,
				array(
					'notify_label' => $notify_label,
					'mail_sent'    => $sent ? 1 : 0,
				),
				''
			);
		} catch ( \Throwable $e ) {
			// Never block or surface errors to visitors.
		}

		wp_send_json_success( array( 'message' => __( 'Notification sent.', 'nexus-lead-suite' ) ) );
	}

	/**
	 * AJAX handler for `[smart_trigger_form]` submissions from the frontend.
	 *
	 * @return void
	 */
	public function handle_form_submit_ajax(): void {
		if ( ! check_ajax_referer( 'nexus_ls_form_submit', 'nexus_ls_form_nonce', false ) ) {
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

		$form_id = isset( $_POST['nexus_ls_form_id'] ) ? sanitize_text_field( wp_unslash( (string) $_POST['nexus_ls_form_id'] ) ) : '';
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
		$lines        = array();
		foreach ( $display_rows as $r ) {
			$lines[] = $r['label'] . ': ' . $r['value'];
		}
		$form_name  = isset( $form['name'] ) ? sanitize_text_field( (string) $form['name'] ) : $form_id;
		$site_name  = get_bloginfo( 'name' );
		$subject    = sprintf( '[%s] %s', $site_name, $form_name );
		$page_url   = esc_url_raw( wp_unslash( (string) ( $_POST['_nexus_page_url'] ?? '' ) ) );
		$body       = $this->build_form_submission_notice_html(
			(string) $site_name,
			$form_name,
			$form_id,
			$display_rows,
			(string) current_time( 'mysql' ),
			$page_url
		);

		$recipients = $this->parse_notification_emails( isset( $form['notificationEmail'] ) ? (string) $form['notificationEmail'] : '' );
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
		if ( isset( $_POST['nexus_ls_form_context'] ) ) {
			$ctx_raw = sanitize_text_field( wp_unslash( (string) $_POST['nexus_ls_form_context'] ) );
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
			'event'                              => 'nexus_ls.form_submission',
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
			\Nexus_Lead_Suite\Core\Form_Submissions_Store::PAYLOAD_ENTRY_KEY => $entry_fields,
			'retention_days'                     => \Nexus_Lead_Suite\Core\Form_Submissions_Store::retention_days(),
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
			require_once NEXUS_LS_PLUGIN_DIR . 'core/class-form-submissions-store.php';
			\Nexus_Lead_Suite\Core\Form_Submissions_Store::insert( $form_id, $db_payload );
		} catch ( \Throwable $e ) {
			// Submission store must not block email UX.
		}

		$webhook_urls = $this->collect_submission_webhook_urls( $form );
		if ( ! empty( $webhook_urls ) ) {
			$hook_body = apply_filters( 'nexus_ls_form_webhook_payload', $db_payload, $form_id, $form );
			if ( is_array( $hook_body ) ) {
				add_action(
					'shutdown',
					static function () use ( $webhook_urls, $hook_body ): void {
						\Nexus_Lead_Suite\Core\Form_Submissions_Store::dispatch_webhooks( $webhook_urls, $hook_body );
					},
					9999
				);
			}
		}

		try {
			require_once NEXUS_LS_PLUGIN_DIR . 'core/class-activities-store.php';
			\Nexus_Lead_Suite\Core\Activities_Store::record_form_submission(
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
			wp_send_json_success(
				array(
					'message' => __( 'Thank you! Your message has been sent.', 'nexus-lead-suite' ),
				)
			);
			return;
		}

		wp_send_json_error(
			array(
				'message' => __( 'Please set up your SMTP properly.', 'nexus-lead-suite' ),
			)
		);
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
			$templates = get_option( 'nexus_ls_email_templates', array() );
		}

		return is_array( $templates ) ? $templates : array();
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
			$list = array();
			if ( isset( $tpl['recipients'] ) && is_array( $tpl['recipients'] ) ) {
				$list = $tpl['recipients'];
			} elseif ( isset( $tpl['emails'] ) ) {
				$split = preg_split( '/[\r\n,]+/', (string) $tpl['emails'] );
				$list  = is_array( $split ) ? $split : array();
			}
			foreach ( $list as $email ) {
				$email = sanitize_email( trim( (string) $email ) );
				if ( $email && is_email( $email ) && ! isset( $seen[ $email ] ) ) {
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
			'nexus_ls_form_nonce',
			'nexus_ls_form_id',
			'nexus_ls_form_context',
			'action',
			'_wp_http_referer',
			'_nexus_page_url',
			self::HONEYPOT_FIELD_NAME,
		);
		$skip_like = array( 'g-recaptcha-response', 'h-captcha-response', 'cf-turnstile-response' );

		$rows = array();
		// phpcs:ignore WordPress.Security.NonceVerification.Missing -- called only from nonce-verified AJAX handler.
		foreach ( $_POST as $key => $value ) {
			if ( ! is_string( $key ) ) {
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

		ob_start();
		echo '<!DOCTYPE html><html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /></head><body style="margin:0;padding:0;background:#f1f5f9;">';
		echo '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f1f5f9;padding:20px 10px;"><tr><td align="center">';
		echo '<table role="presentation" width="640" cellspacing="0" cellpadding="0" border="0" style="max-width:640px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">';

		echo '<tr><td style="background:#0f172a;padding:20px 22px;">';
		echo '<p style="margin:0 0 6px;font:600 10px Arial,Helvetica,sans-serif;color:#94a3b8;letter-spacing:.1em;text-transform:uppercase;">' . esc_html__( 'New form submission', 'nexus-lead-suite' ) . '</p>';
		echo '<p style="margin:0;font:700 20px Arial,Helvetica,sans-serif;color:#ffffff;">' . esc_html( $site_name ) . '</p>';
		echo '</td></tr>';

		echo '<tr><td style="padding:22px 22px 26px;font:15px/1.55 Arial,Helvetica,sans-serif;color:#334155;">';
		echo '<p style="margin:0 0 18px;"><strong style="color:#0f172a;">' . esc_html( $form_name ) . '</strong> — ' . esc_html__( 'responses are listed in the table below.', 'nexus-lead-suite' ) . '</p>';
		echo '<p style="margin:0 0 8px;font:600 10px Arial,Helvetica,sans-serif;color:#64748b;letter-spacing:.08em;text-transform:uppercase;">' . esc_html__( 'Responses', 'nexus-lead-suite' ) . '</p>';

		echo '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">';

		$n = count( $rows );
		foreach ( $rows as $i => $row ) {
			$lb = isset( $row['label'] ) ? (string) $row['label'] : '';
			$vl = isset( $row['value'] ) ? (string) $row['value'] : '';
			$br = ( $i < $n - 1 ) ? 'border-bottom:1px solid #e2e8f0;' : '';

			echo '<tr>';
			echo '<td valign="top" style="padding:11px 14px;width:34%;' . esc_attr( $br ) . 'background:#f8fafc;font:600 13px Arial,Helvetica,sans-serif;color:#475569;">' . esc_html( $lb ) . '</td>';
			echo '<td valign="top" style="padding:11px 14px;' . esc_attr( $br ) . 'font:14px Arial,Helvetica,sans-serif;color:#0f172a;word-break:break-word;">' . nl2br( esc_html( $vl ), false ) . '</td>';
			echo '</tr>';
		}

		echo '</table>';

		echo '<p style="margin:18px 0 0;font:12px Arial,Helvetica,sans-serif;color:#64748b;line-height:1.5;">';
		echo esc_html( sprintf( /* translators: %s: form id */ __( 'Form ID: %s', 'nexus-lead-suite' ), $form_id ) );
		echo '<br />';
		echo esc_html( sprintf( /* translators: %s: datetime */ __( 'Submitted: %s', 'nexus-lead-suite' ), $submitted_at ) );
		if ( '' !== $page_url ) {
			echo '<br />';
			echo esc_html__( 'Page:', 'nexus-lead-suite' ) . ' ';
			echo '<a href="' . esc_url( $page_url ) . '" style="color:#2563eb;">' . esc_html( $page_url ) . '</a>';
		}
		echo '</p>';

		echo '</td></tr></table></td></tr></table></body></html>';

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
	 * popups. If the merchant pastes any HTML or a shortcode (including `[smart_trigger_form …]`),
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
			$discard = \Nexus_Lead_Suite\expand_popup_body_shortcodes( $buf );
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
		add_shortcode( 'smart_trigger_form', array( $this, 'render_form_shortcode' ) );
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
		if ( '' === $content || false === strpos( $content, 'smart_trigger_form' ) ) {
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
		if ( ! preg_match_all( '/\\[\\s*smart_trigger_form\\b([^\\]]*)\\]/i', $content, $blocks, PREG_SET_ORDER ) ) {
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
	 * CSS is now output directly inside render_popups() as a <style> tag
	 * to guarantee delivery on all themes/setups.
	 *
	 * @return void
	 */
	public function enqueue_popup_styles(): void {
		// No-op: CSS is now bundled directly in render_popups().
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

		/* Read the global "Enable Auto Popup" setting.
		 * When false, timer / scroll / exit-intent triggers are suppressed;
		 * only Manual Click (data-nexas-trigger button) still works. */
		$general       = get_option( self::GENERAL_SETTINGS_OPTION_KEY, array() );
		$auto_popup_on   = is_array( $general ) ? (bool) ( $general['enableAutoPopup'] ?? false ) : false;
		$auto_popup_forms = is_array( $general ) ? $this->get_auto_popup_default_form_ids( $general ) : array();

		/* ── Output CSS directly so it is guaranteed to reach the browser ── */
		?>
		<style id="nexus-popup-css">
		/* Nexus Lead Suite – Popup Overlay */
		.nexus-popup-overlay{display:none;position:fixed;inset:0;z-index:999999;align-items:center;justify-content:center;background:rgba(0,0,0,.55);padding:16px;overflow-y:auto;box-sizing:border-box;}
		.nexus-popup-overlay.nexus-popup--open{display:flex;}
		.nexus-popup{position:relative;width:100%;overflow:hidden;box-shadow:0 24px 80px rgba(0,0,0,.28);animation:nexus-pop-in .22s ease;box-sizing:border-box;}
		@keyframes nexus-pop-in{from{opacity:0;transform:translateY(20px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
		.nexus-popup__close{position:absolute;top:10px;right:10px;display:flex;align-items:center;justify-content:center;border:none;cursor:pointer;line-height:1;z-index:2;border-radius:50%;transition:opacity .2s,transform .25s cubic-bezier(.34,1.56,.64,1);}
		.nexus-popup__close:hover{opacity:.9;transform:rotate(90deg) scale(1.1);}
		.nexus-popup__close:active{transform:rotate(90deg) scale(0.95);}
		.nexus-popup__header{word-break:break-word;box-sizing:border-box;}
		.nexus-popup__heading{margin:0;line-height:1.3;}
		.nexus-popup__sub{margin-top:6px;opacity:.85;font-size:.875em;}
		.nexus-popup__body{word-break:break-word;box-sizing:border-box;text-align:start;}
		.nexus-popup__body *{max-width:100%;}
		/* Shortcode form inside modal: strip inner "card" (theme form rules + ultra-wide shadow). */
		.nexus-popup-overlay .nexus-popup__body .nexus-st-form,
		.nexus-popup__body .nexus-st-form{border:none!important;box-shadow:none!important;outline:none!important;background:transparent!important;}
		.nexus-popup-overlay .nexus-popup__body .nexus-st-form>form.nexus-st-form__body,
		.nexus-popup__body .nexus-st-form>form.nexus-st-form__body,
		.nexus-popup__body form.nexus-st-form__body{
			border:none!important;box-shadow:none!important;outline:none!important;background:transparent!important;
			padding:0!important;margin:0!important;border-radius:0!important;
		}
		/* Form success/error card: hide title bar + floating close so only the message card shows */
		.nexus-popup-overlay.nexus-popup-overlay--form-result .nexus-popup__header,
		.nexus-popup-overlay.nexus-popup-overlay--form-result .nexus-popup__close{display:none!important;}
		/* Embedded Smart Trigger forms: Popup Appearance → button width (%). Colour comes from --nexus-st-btn (mapped in PHP). */
		.nexus-popup-overlay .nexus-st-form .nexus-st-actions{display:flex!important;flex-wrap:wrap!important;justify-content:center!important;gap:10px!important;box-sizing:border-box!important;}
		.nexus-popup-overlay .nexus-st-form .nexus-st-actions .nexus-st-btn{box-sizing:border-box!important;width:var(--nexus-popup-form-btn-w,100%)!important;max-width:100%!important;flex:0 1 auto!important;min-width:0!important;}
		@media(max-width:480px){.nexus-popup{border-radius:12px!important;}.nexus-popup__header,.nexus-popup__body{padding:18px!important;}}
		</style>
		<?php

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
					$prepend .= sprintf( '[smart_trigger_form id="%s"]', esc_attr( $fid ) ) . "\n\n";
				}
				$content_for_render = $prepend . $content_for_render;
			}

			/* Render shortcodes so embedded forms display correctly (second pass for nested). */
			$body_for_codes   = $this->sanitize_popup_body_before_shortcode( $content_for_render );
			$rendered_content = \Nexus_Lead_Suite\expand_popup_body_shortcodes( $body_for_codes );

			$overlay_css_vars = sprintf(
				'--nexus-popup-form-btn-w:%d%%;--nexus-popup-form-btn:%s;',
				$btn_width,
				$btn_color
			);

			printf(
				'<div class="nexus-popup-overlay" id="nexus-pop-%s" style="%s" data-popup-id="%s" data-event="%s" data-logic="%s" aria-hidden="true" aria-modal="true" role="dialog">',
				esc_attr( $popup_id ),
				esc_attr( $overlay_css_vars ),
				esc_attr( $popup_id ),
				esc_attr( $trigger_key ),
				esc_attr( $logic_json )
			);

			printf(
				'<div class="nexus-popup" style="max-width:%dpx;border-radius:%dpx;">',
				absint( $width ),
				absint( $radius )
			);

			/* Close button */
			printf(
				'<button type="button" class="nexus-popup__close" aria-label="%s" style="background:%s;color:%s;width:%dpx;height:%dpx;font-size:%dpx;">&#x2715;</button>',
				esc_attr__( 'Close', 'nexus-lead-suite' ),
				esc_attr( $close_bg ),
				esc_attr( $close_col ),
				absint( $close_size + 10 ),
				absint( $close_size + 10 ),
				absint( $close_size )
			);

			/* Header */
			printf(
				'<div class="nexus-popup__header" style="background:%s;color:%s;padding:%dpx;text-align:%s;">',
				esc_attr( $heading_bg ),
				esc_attr( $heading_tc ),
				absint( $padding ),
				esc_attr( $align )
			);
			printf( '<div class="nexus-popup__heading" style="font-size:%dpx;">', absint( $heading_fs ) );
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
					return '<span' . ( $style_bits ? ' style="' . implode( ';', $style_bits ) . '"' : '' ) . '>';
				},
				wp_kses_post( $heading )
			);
			$heading_html = str_ireplace( '</font>', '</span>', (string) $heading_html );
			echo $heading_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- sanitized above via wp_kses_post + controlled regex
			echo '</div>';
			if ( '' !== $sub ) {
				echo '<div class="nexus-popup__sub">' . esc_html( $sub ) . '</div>';
			}
			echo '</div>';

			/* Body */
			/* Body: do not set text-align — it would inherit into embedded forms (labels/placeholders). */
			printf(
				'<div class="nexus-popup__body" style="background:%s;padding:%dpx;">',
				esc_attr( $body_bg ),
				absint( $padding )
			);
			echo $rendered_content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			echo '</div>';

			echo '</div>'; // .nexus-popup
			echo '</div>'; // .nexus-popup-overlay
		}

		/* ── Inline JS runtime ─────────────────────────────────
		 * Runs after all popup HTML is in the DOM (wp_footer priority 15).
		 * Wraps in a readyState guard so it works even if the browser
		 * hasn't fully parsed the document yet.
		 * ─────────────────────────────────────────────────────── */
		$auto_popup_js = $auto_popup_on ? 'true' : 'false';
		?>
		<script id="nexus-popup-js">
		(function(){
			'use strict';

			/* PHP-injected: when false, auto triggers (timer/scroll/exit) are blocked. */
			var nexusAutoPopupEnabled = <?php echo $auto_popup_js; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- boolean literal. ?>;

			function nexusInitPopups(){

				/* Reset form result UI when closing popup (ESC, backdrop, X). */
				window.nexusLsResetPopupFormResult = function(overlay){
					if(!overlay||!overlay.classList||!overlay.classList.contains('nexus-popup-overlay')) return;
					overlay.classList.remove('nexus-popup-overlay--form-result');
					var roots = overlay.querySelectorAll('.nexus-st-form');
					roots.forEach(function(root){
						root.classList.remove('nexus-st-form--sent');
						root.querySelectorAll('.nexus-st-form-result-card').forEach(function(node){
							if(node.parentNode){ node.parentNode.removeChild(node); }
						});
					});
				};

				/* ── open / close (shared with site-wide bridge script) ── */
				function openPopup(el){
					if(window.NexusLsPopupUi&&typeof window.NexusLsPopupUi.open==='function'){window.NexusLsPopupUi.open(el);return;}
					if(el.classList.contains('nexus-popup--open')) return;
					el.classList.add('nexus-popup--open');
					el.setAttribute('aria-hidden','false');
					document.body.style.overflow='hidden';
				}
				function closePopup(el){
					if(window.NexusLsPopupUi&&typeof window.NexusLsPopupUi.close==='function'){
						window.NexusLsPopupUi.close(el);
						return;
					}
					el.classList.remove('nexus-popup--open');
					el.setAttribute('aria-hidden','true');
					document.body.style.overflow='';
					if(typeof window.nexusLsResetPopupFormResult==='function'){ window.nexusLsResetPopupFormResult(el); }
				}

				/* ── attach triggers to every overlay ─────────── */
				var overlays = document.querySelectorAll('.nexus-popup-overlay');
				overlays.forEach(function(overlay){

					/* close on backdrop click */
					overlay.addEventListener('click',function(e){
						if(e.target===overlay){ closePopup(overlay); }
					});

					/* close button */
					var closeBtn = overlay.querySelector('.nexus-popup__close');
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
							if(!nexusAutoPopupEnabled) return;
							setTimeout(function(){ openPopup(overlay); }, delay * 1000);

						/* ── Scroll Depth trigger ────────────────── */
						} else if(type==='scroll'){
							/* Blocked when Enable Auto Popup is OFF in Settings */
							if(!nexusAutoPopupEnabled) return;
							(function(){
								var fired=false;
								function onScroll(){
									if(fired) return;
									var scrolled = window.scrollY || window.pageYOffset || 0;
									var total    = Math.max(1, document.body.scrollHeight - window.innerHeight);
									if((scrolled / total) * 100 >= pct){
										fired=true;
										window.removeEventListener('scroll', onScroll);
										openPopup(overlay);
									}
								}
								window.addEventListener('scroll', onScroll, {passive:true});
							})();

						/* ── Exit Intent trigger ─────────────────── */
						} else if(type==='exit'){
							/* Blocked when Enable Auto Popup is OFF in Settings */
							if(!nexusAutoPopupEnabled) return;
							(function(){
								var fired=false;
								function onLeave(e){
									if(fired) return;
									if((e.clientY||0) <= 0){
										fired=true;
										if(document.documentElement){
											document.documentElement.removeEventListener('mouseleave', onLeave);
										}
										openPopup(overlay);
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
				document.addEventListener('DOMContentLoaded', nexusInitPopups);
			} else {
				nexusInitPopups();
			}
		})();
		</script>
		<?php
	}

	/**
	 * Enqueues the Google Font selected in Settings and injects the CSS variable globally.
	 * Runs on every frontend page so popups, menu items, forms, and reports all inherit the font.
	 *
	 * @return void
	 */
	public function enqueue_global_font(): void {
		$opt = get_option( self::GENERAL_SETTINGS_OPTION_KEY, array() );
		if ( ! is_array( $opt ) ) {
			$opt = array();
		}

		$font = isset( $opt['globalFont'] ) ? sanitize_text_field( (string) $opt['globalFont'] ) : 'Inter';
		if ( '' === $font ) {
			$font = 'Inter';
		}

		// Build weights string for Google Fonts URL.
		$weights_map = array(
			'Inter'               => '400;500;600;700',
			'Roboto'              => '400;500;700',
			'Open Sans'           => '400;600;700',
			'Lato'                => '400;700',
			'Montserrat'          => '400;500;600;700',
			'Poppins'             => '400;500;600;700',
			'Raleway'             => '400;600;700',
			'Nunito'              => '400;600;700',
			'Ubuntu'              => '400;500;700',
			'Rubik'               => '400;500;600;700',
			'Work Sans'           => '400;500;600;700',
			'DM Sans'             => '400;500;700',
			'Figtree'             => '400;500;600;700',
			'Plus Jakarta Sans'   => '400;500;600;700',
			'Outfit'              => '400;500;600;700',
			'Barlow'              => '400;500;600;700',
			'Manrope'             => '400;500;600;700',
			'Mulish'              => '400;600;700',
			'Quicksand'           => '400;500;600;700',
			'Cabin'               => '400;500;600;700',
			'Karla'               => '400;500;700',
			'Josefin Sans'        => '400;600;700',
			'Exo 2'               => '400;500;600;700',
			'Space Grotesk'       => '400;500;600;700',
			'Noto Sans'           => '400;700',
			'IBM Plex Sans'       => '400;500;600;700',
			'Syne'                => '400;500;600;700;800',
			'Oswald'              => '400;500;600;700',
			'Bebas Neue'          => '400',
			'Anton'               => '400',
			'Fjalla One'          => '400',
			'Righteous'           => '400',
			'Titan One'           => '400',
			'Secular One'         => '400',
			'Abril Fatface'       => '400',
			'Playfair Display'    => '400;600;700',
			'Merriweather'        => '400;700',
			'Lora'                => '400;500;600;700',
			'PT Serif'            => '400;700',
			'Libre Baskerville'   => '400;700',
			'Cormorant Garamond'  => '400;500;600;700',
			'EB Garamond'         => '400;500;600;700',
			'Spectral'            => '400;500;600;700',
			'Cinzel'              => '400;600;700',
			'Crimson Text'        => '400;600;700',
			'Dancing Script'      => '400;600;700',
			'Pacifico'            => '400',
			'Caveat'              => '400;600;700',
			'Satisfy'             => '400',
			'Permanent Marker'    => '400',
			'Inconsolata'         => '400;600;700',
			'Source Code Pro'     => '400;600;700',
			'JetBrains Mono'      => '400;500;700',
			'Fira Code'           => '400;500;700',
		);

		$weights = isset( $weights_map[ $font ] ) ? $weights_map[ $font ] : '400;700';

		// Build italic:wght@... axes string.
		$font_query = str_replace( ' ', '+', $font );
		$gf_url     = 'https://fonts.googleapis.com/css2?family=' . rawurlencode( $font ) . ':wght@' . $weights . '&display=swap';

		wp_enqueue_style(
			'nexus-ls-global-font',
			esc_url( $gf_url ),
			array(),
			null // phpcs:ignore WordPress.WP.EnqueuedResourceParameters.MissingVersion
		);

		// Inject CSS variable so all plugin elements inherit the selected font.
		$css_var = ':root { --nexus-ls-font: \'' . esc_attr( $font ) . '\', sans-serif; }' . "\n"
			. '.nexus-st-form, .nexus-st-form * { font-family: var(--nexus-ls-font) !important; }' . "\n"
			. '.nexus-popup, .nexus-popup * { font-family: var(--nexus-ls-font) !important; }' . "\n"
			. '.nexus-menu-widget, .nexus-menu-widget * { font-family: var(--nexus-ls-font) !important; }' . "\n"
			. '.nexus-chat-widget, .nexus-chat-widget * { font-family: var(--nexus-ls-font) !important; }';

		wp_add_inline_style( 'nexus-ls-global-font', $css_var );
	}

	/**
	 * Enqueues sticky bottom navigation CSS (globally, on every frontend page).
	 * Actual visibility is controlled by CSS media query (mobile/tablet only).
	 *
	 * @return void
	 */
	/**
	 * Reads menu items payload from option (supports both legacy and new format).
	 *
	 * @return array{ items: array<int,mixed>, globalFontSize: int }
	 */
	private function get_menu_items_payload(): array {
		$stored = get_option( self::MENU_ITEMS_OPTION_KEY, array() );
		if ( ! is_array( $stored ) ) {
			return array( 'items' => array(), 'globalFontSize' => 14 );
		}

		// New format: ['items' => [...], 'globalFontSize' => 14]
		if ( isset( $stored['items'] ) ) {
			$items     = is_array( $stored['items'] ) ? $stored['items'] : array();
			$font_size = isset( $stored['globalFontSize'] ) ? max( 10, min( 32, (int) $stored['globalFontSize'] ) ) : 14;
		} else {
			// Legacy format: plain array of item objects.
			$items     = array_values( $stored );
			$font_size = 14;
		}

		return array( 'items' => $items, 'globalFontSize' => $font_size );
	}

	public function enqueue_bottom_nav_styles(): void {
		$opt = get_option( self::GENERAL_SETTINGS_OPTION_KEY, array() );
		if ( ! is_array( $opt ) || empty( $opt['enableNavigation'] ) ) {
			return;
		}

		$payload = $this->get_menu_items_payload();
		$items   = $payload['items'];
		if ( count( $items ) === 0 ) {
			return;
		}

		// Register a dummy handle so we can attach inline CSS cleanly.
		wp_register_style( 'nexus-ls-bottom-nav', false, array(), NEXUS_LS_VERSION ); // phpcs:ignore WordPress.WP.EnqueuedResourceParameters.MissingVersion
		wp_enqueue_style( 'nexus-ls-bottom-nav' );

		$css = '
/* Nexus Bottom Navigation Bar (mobile + tablet only) */
.nexus-bottom-nav {
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
  .nexus-bottom-nav { display: flex; }
}
.nexus-bottom-nav__inner {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  gap: 8px;
  justify-content: center;
  align-items: stretch;
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.nexus-bottom-nav__inner::-webkit-scrollbar { display: none; }
.nexus-bottom-nav__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  text-decoration: none !important;
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
  flex-shrink: 0;
  flex: 1 1 0;
  min-width: 0;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease, opacity 0.18s ease;
}
.nexus-bottom-nav__btn svg {
  flex-shrink: 0;
  width: 1.2em;
  height: 1.2em;
}
.nexus-bottom-nav__btn--lift:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.18); }
.nexus-bottom-nav__btn--scale:hover { transform: scale(1.05); }
.nexus-bottom-nav__btn--glow:hover { box-shadow: 0 0 20px rgba(99,102,241,0.55); }
.nexus-bottom-nav__btn--darken:hover { filter: brightness(0.88); }
.nexus-bottom-nav__btn--shake:hover { animation: nexus-nav-shake 0.4s ease; }
.nexus-bottom-nav__btn--rotate:hover { transform: rotate(3deg); }
@keyframes nexus-nav-shake {
  0%,100% { transform: translateX(0); }
  20% { transform: translateX(-4px); }
  40% { transform: translateX(4px); }
  60% { transform: translateX(-3px); }
  80% { transform: translateX(3px); }
}
';
		wp_add_inline_style( 'nexus-ls-bottom-nav', $css );
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
		$items      = $payload['items'];
		$global_fs  = $payload['globalFontSize'];
		if ( count( $items ) === 0 ) {
			return;
		}

		echo '<nav class="nexus-bottom-nav nexus-menu-widget" aria-label="' . esc_attr__( 'Site Navigation', 'nexus-lead-suite' ) . '">';
		echo '<div class="nexus-bottom-nav__inner">';

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
			$pad_v        = max( 4, min( 40, (int) ( $btn['style']['paddingVertical'] ?? 12 ) ) );
			$pad_h        = max( 8, min( 60, (int) ( $btn['style']['paddingHorizontal'] ?? 20 ) ) );
			$radius       = max( 0, min( 50, (int) ( $btn['style']['radius'] ?? 8 ) ) );

			$allowed_effects = array( 'lift', 'scale', 'glow', 'darken', 'shake', 'rotate' );
			$hover_class     = in_array( $hover_effect, $allowed_effects, true ) ? ' nexus-bottom-nav__btn--' . $hover_effect : '';

			$inline_style = sprintf(
				'background-color:%s;color:%s;padding:%dpx %dpx;border-radius:%dpx;font-size:%dpx;',
				esc_attr( $bg ?: '#2563eb' ),
				esc_attr( $text_color ?: '#ffffff' ),
				$pad_v,
				$pad_h,
				$radius,
				$global_fs
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
			$trigger_attr    = ' data-nexas-trigger="' . esc_attr( $trigger_first . ',' . $notify_label ) . '"';

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

			printf(
				'<a href="%s"%s%s class="nexus-bottom-nav__btn%s%s" style="%s">',
				esc_url( $href_attr ),
				$css_id ? ' id="' . esc_attr( $css_id ) . '"' : '',
				$trigger_attr, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- already escaped above.
				esc_attr( $hover_class ),
				$css_class ? ' ' . esc_attr( $css_class ) : '',
				esc_attr( $inline_style )
			);

			$svg = $this->get_nav_icon_svg( $icon_key );
			if ( '' !== $svg ) {
				echo $svg; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG is hardcoded, not user input.
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

		$js_path  = NEXUS_LS_PLUGIN_DIR . 'public/js/forms-runtime.js';
		$css_path = NEXUS_LS_PLUGIN_DIR . 'public/css/forms-runtime.css';
		$js_ver   = file_exists( $js_path ) ? (string) filemtime( $js_path ) : NEXUS_LS_VERSION;
		$css_ver  = file_exists( $css_path ) ? (string) filemtime( $css_path ) : NEXUS_LS_VERSION;

		$rec       = $this->get_recaptcha_integration_settings();
		$ts_keys   = $this->get_saved_captcha_keys( self::TURNSTILE_OPTION_KEY );
		$rec_site  = $rec['siteKey'];
		$ts_site   = $ts_keys['siteKey'];

		$script_deps = array();

		if ( '' !== $rec_site ) {
			$recaptcha_js_url = ( 'v3' === $rec['apiVersion'] )
				? 'https://www.google.com/recaptcha/api.js?render=' . rawurlencode( $rec_site )
				: 'https://www.google.com/recaptcha/api.js?render=explicit';
			wp_register_script( 'nexus-ls-recaptcha', false, array(), NEXUS_LS_VERSION, true );
			wp_enqueue_script( 'nexus-ls-recaptcha' );
			add_filter(
				'script_loader_src',
				static function ( $src, $handle ) use ( $recaptcha_js_url ) {
					if ( 'nexus-ls-recaptcha' === $handle ) {
						return $recaptcha_js_url;
					}
					return $src;
				},
				10,
				2
			);
			wp_script_add_data( 'nexus-ls-recaptcha', 'strategy', 'defer' );
			$script_deps[] = 'nexus-ls-recaptcha';
		}

		if ( '' !== $ts_site ) {
			wp_register_script( 'nexus-ls-turnstile', false, array(), NEXUS_LS_VERSION, true );
			wp_enqueue_script( 'nexus-ls-turnstile' );
			add_filter(
				'script_loader_src',
				static function ( $src, $handle ) {
					if ( 'nexus-ls-turnstile' === $handle ) {
						return 'https://challenges.cloudflare.com/turnstile/v0/api.js';
					}
					return $src;
				},
				10,
				2
			);
			wp_script_add_data( 'nexus-ls-turnstile', 'strategy', 'defer' );
			$script_deps[] = 'nexus-ls-turnstile';
		}

		wp_enqueue_style(
			'nexus-ls-forms-runtime',
			esc_url( NEXUS_LS_PLUGIN_URL . 'public/css/forms-runtime.css' ),
			array(),
			$css_ver
		);

		wp_enqueue_script(
			'nexus-ls-forms-runtime',
			esc_url( NEXUS_LS_PLUGIN_URL . 'public/js/forms-runtime.js' ),
			$script_deps,
			$js_ver,
			true
		);

		wp_localize_script(
			'nexus-ls-forms-runtime',
			'nexusLsForms',
			array(
				'ajaxUrl'             => esc_url_raw( admin_url( 'admin-ajax.php' ) ),
				'action'              => 'nexus_ls_submit_form',
				'thankYouMessage'     => __( 'Thank you! Your message has been sent.', 'nexus-lead-suite' ),
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

		$bridge_path = NEXUS_LS_PLUGIN_DIR . 'public/js/nexus-ls-popup-bridge.js';
		if ( file_exists( $bridge_path ) ) {
			$general = get_option( self::GENERAL_SETTINGS_OPTION_KEY, array() );
			$raw_map = is_array( $general ) ? (string) ( $general['activityButtonClasses'] ?? '' ) : '';
			$pair_maps = $this->parse_activity_button_classes_to_pair_maps( $raw_map );

			$bver = (string) filemtime( $bridge_path );
			wp_enqueue_script(
				'nexus-ls-popup-bridge',
				esc_url( NEXUS_LS_PLUGIN_URL . 'public/js/nexus-ls-popup-bridge.js' ),
				array(),
				$bver,
				true
			);
			wp_localize_script(
				'nexus-ls-popup-bridge',
				'nexusLsPopupBridgeCfg',
				array(
					'ajaxUrl'     => esc_url_raw( admin_url( 'admin-ajax.php' ) ),
					'notifyNonce' => wp_create_nonce( 'nexus_trigger_notify' ),
					'popupClassMap'  => $pair_maps['popup'] ?? array(),
					'notifyClassMap' => $pair_maps['notify'] ?? array(),
				)
			);
		}

		$path = NEXUS_LS_PLUGIN_DIR . 'public/js/nexus-ls-tracker.js';
		if ( ! file_exists( $path ) ) {
			return;
		}

		$ver = (string) filemtime( $path );

		wp_enqueue_script(
			'nexus-ls-activity-tracker',
			esc_url( NEXUS_LS_PLUGIN_URL . 'public/js/nexus-ls-tracker.js' ),
			file_exists( $bridge_path ) ? array( 'nexus-ls-popup-bridge' ) : array(),
			$ver,
			true
		);

		wp_localize_script(
			'nexus-ls-activity-tracker',
			'nexusLsTrackCfg',
			array(
				'endpoint'    => esc_url_raw( rest_url( 'nexus-lead-suite/v1/track/events' ) ),
				'nonce'       => wp_create_nonce( 'nexus_ls_track' ),
				// Logged-in visitors need wp_rest nonce header or WP returns 403 before our callback.
				'restNonce'   => wp_create_nonce( 'wp_rest' ),
				'scrollMarks' => array( 25, 50, 75, 90, 100 ),
			)
		);
	}

	/**
	 * Parses Settings → Button Classes textarea into a class => eventId map.
	 *
	 * Input format (per line):
	 *   eventId | class-1, class-2
	 *
	 * @param string $raw Raw textarea.
	 * @return array<string,string> class => eventId
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
				// Basic class token guard (avoid spaces and weird separators).
				if ( ! preg_match( '/^[A-Za-z0-9_-]{1,80}$/', $cls ) ) {
					continue;
				}
				$clean_classes[] = $cls;
			}

			if ( empty( $clean_classes ) ) {
				continue;
			}

			/*
			 * Semantics:
			 * - first class  => popup trigger
			 * - remaining    => notify-only triggers
			 */
			$popup_cls = $clean_classes[0];
			$out_popup[ $popup_cls ] = $event;
			$out_popup[ strtolower( $popup_cls ) ] = $event;

			if ( count( $clean_classes ) > 1 ) {
				foreach ( array_slice( $clean_classes, 1 ) as $notify_cls ) {
					$out_notify[ $notify_cls ] = $event;
					$out_notify[ strtolower( $notify_cls ) ] = $event;
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
	public function render_form_shortcode( $atts ): string {
		$atts = shortcode_atts(
			array(
				'id' => '',
			),
			is_array( $atts ) ? $atts : array(),
			'smart_trigger_form'
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
			$step_col = \Nexus_Lead_Suite\Popup_Form_Render_Context::is_active() ? '#525252' : $btn_col;
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
		$border_w = max( 0, min( 10, (int) ( $general['formFieldBorderWidth'] ?? 2 ) ) );
		$radius   = max( 0, min( 30, (int) ( $general['formFieldBorderRadius'] ?? 10 ) ) );

		/*
		 * Button color: Form Builder value everywhere except inside popup body, where Popups → Appearance
		 * drives `--nexus-popup-form-btn` on the overlay (see expand_popup_body_shortcodes + render_popups).
		 */
		$btn_var = \Nexus_Lead_Suite\Popup_Form_Render_Context::is_active()
			? '--nexus-st-btn: var(--nexus-popup-form-btn,#2563eb);'
			: '--nexus-st-btn:' . $btn_col . ';';

		$form_vars = '--nexus-st-form-bg:' . $form_bg . ';'
			. '--nexus-st-form-text:' . $form_txt . ';'
			. $btn_var
			. '--nexus-st-stepper:' . $step_col . ';'
			. ( '' !== $field_text ? '--nexus-st-form-field-text:' . $field_text . ';' : '' )
			. ( '' !== $ph_color ? '--nexus-st-form-placeholder:' . $ph_color . ';' : '' )
			. ( '' !== $border_col ? '--nexus-st-form-field-border-color:' . $border_col . ';' : '' )
			. '--nexus-st-form-field-border-style:' . $border_st . ';'
			. '--nexus-st-form-field-border-width:' . $border_w . 'px;'
			. '--nexus-st-form-field-radius:' . $radius . 'px;';
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

		ob_start();
		$step_count = count( $steps );
		?>
		<div class="nexus-st-form nexus-st-form--minimal <?php echo esc_attr( $fui_root ); ?>" style="<?php echo esc_attr( $form_vars ); ?>" data-form-id="<?php echo esc_attr( $form_id ); ?>" data-form-type="<?php echo esc_attr( $is_multi ? 'multi' : 'simple' ); ?>" data-submit-text="<?php echo esc_attr( (string) ( $form['submitBtnText'] ?? 'Submit' ) ); ?>">
			<form class="nexus-st-form__body forminator-custom-form" method="post" enctype="multipart/form-data">
				<?php wp_nonce_field( 'nexus_ls_form_submit', 'nexus_ls_form_nonce' ); ?>
				<input type="hidden" name="nexus_ls_form_id" value="<?php echo esc_attr( $form_id ); ?>" />
				<?php
				$hp_id = 'nexus-ls-hp-' . substr( hash( 'sha256', $form_id . '|' . (string) wp_parse_url( home_url(), PHP_URL_HOST ) ), 0, 16 );
				?>
				<div class="nexus-st-hp" aria-hidden="true">
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
						class="nexus-st-progress"
						data-total-steps="<?php echo esc_attr( (string) $step_count ); ?>"
						role="progressbar"
						aria-valuemin="1"
						aria-valuemax="<?php echo esc_attr( (string) $step_count ); ?>"
						aria-valuenow="1"
						aria-label="<?php echo esc_attr( sprintf( /* translators: 1: current step, 2: total steps */ __( 'Form step %1$d of %2$d', 'nexus-lead-suite' ), 1, $step_count ) ); ?>"
					>
						<div class="nexus-st-progress__track" aria-hidden="true">
							<div class="nexus-st-progress__fill" style="width: <?php echo esc_attr( (string) round( 100 / $step_count, 4 ) ); ?>%;"></div>
						</div>
						<div class="nexus-st-progress__dots" aria-hidden="true">
							<?php foreach ( $steps as $didx => $_step ) : ?>
								<span class="nexus-st-progress__dot<?php echo 0 === (int) $didx ? ' nexus-st-progress__dot--active' : ''; ?>" data-step-dot="<?php echo esc_attr( (string) $didx ); ?>"></span>
							<?php endforeach; ?>
						</div>
					</div>
				<?php endif; ?>

				<?php foreach ( $steps as $idx => $step ) : ?>
					<?php
					$blocks = is_array( $step ) && isset( $step['fields'] ) && is_array( $step['fields'] ) ? $step['fields'] : array();
					?>
					<section class="nexus-st-step" data-step-index="<?php echo esc_attr( (string) $idx ); ?>" <?php echo ( $idx === 0 ? '' : 'hidden' ); ?>>
						<div class="nexus-st-grid forminator-row">
							<?php $this->render_blocks( $blocks ); ?>
						</div>
					</section>
				<?php endforeach; ?>

				<div class="nexus-st-actions" <?php echo ( $is_multi ? '' : 'data-single="1"' ); ?>>
					<?php if ( $is_multi ) : ?>
						<button type="button" class="nexus-st-btn nexus-st-btn--secondary forminator-button" data-action="prev">Previous</button>
						<button type="button" class="nexus-st-btn nexus-st-btn--primary forminator-button" data-action="next">Next</button>
					<?php else : ?>
						<button type="submit" class="nexus-st-btn nexus-st-btn--primary forminator-button"><?php echo esc_html( (string) ( $form['submitBtnText'] ?? 'Submit' ) ); ?></button>
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

		echo '<div class="nexus-st-layout nexus-st-layout--cols-' . esc_attr( (string) $cols ) . ' forminator-row">';
		for ( $i = 0; $i < $cols; $i++ ) {
			$col_items = isset( $items[ $i ] ) && is_array( $items[ $i ] ) ? $items[ $i ] : array();
			echo '<div class="nexus-st-layout__col">';
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
	private function floating_caption( string $placeholder, string $label, bool $show_label ): string {
		if ( $show_label ) {
			$lb = trim( $label );
			if ( '' !== $lb ) {
				return $lb;
			}
		}
		$ph = trim( $placeholder );
		if ( '' !== $ph ) {
			return $ph;
		}
		return '';
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

		return ' ' . $attrs; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- hardcoded at internal call sites only.
	}

	/**
	 * Stable unique id for floating-label inputs (wp_unique_id requires WP 6.4+).
	 *
	 * @return string
	 */
	private function floating_input_dom_id(): string {
		return 'nexus-st-inp-' . str_replace( '.', '', uniqid( '', true ) );
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
	 * @param string              $extra_attrs Optional raw HTML attributes (trusted; e.g. data-nexus-mask).
	 * @return void
	 */
	private function render_float_text_input( string $name, string $type, string $placeholder, string $label, bool $show_label, bool $required, string $extra_attrs = '' ): void {
		$extra   = $this->format_trusted_input_attrs( $extra_attrs );
		$caption = $this->floating_caption( $placeholder, $label, $show_label );
		if ( '' === $caption ) {
			echo '<input class="nexus-st-input forminator-input" type="' . esc_attr( $type ) . '" name="' . esc_attr( $name ) . '" placeholder="' . esc_attr( $placeholder ) . '"';
			if ( $required ) {
				echo ' required';
			}
			echo $extra . ' />'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $extra from format_trusted_input_attrs().
			return;
		}

		$id = $this->floating_input_dom_id();
		echo '<div class="nexus-st-float-wrap">';
		echo '<input id="' . esc_attr( $id ) . '" class="nexus-st-input forminator-input" type="' . esc_attr( $type ) . '" name="' . esc_attr( $name ) . '"';
		echo $this->floating_nbsp_placeholder_attr(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- esc_attr applied in method.
		if ( $required ) {
			echo ' required';
		}
		echo $extra . ' />'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $extra from format_trusted_input_attrs().
		printf(
			'<label class="nexus-st-float-label" for="%s">%s%s</label></div>',
			esc_attr( $id ),
			esc_html( $caption ),
			$required ? '<span class="nexus-st-req">*</span>' : ''
		);
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
		if ( '' === $caption ) {
			echo '<textarea class="nexus-st-textarea forminator-input" name="' . esc_attr( $name ) . '" placeholder="' . esc_attr( $placeholder ) . '"';
			if ( $required ) {
				echo ' required';
			}
			echo '></textarea>';
			return;
		}

		$id = $this->floating_input_dom_id();
		echo '<div class="nexus-st-float-wrap nexus-st-float-wrap--textarea">';
		echo '<textarea id="' . esc_attr( $id ) . '" class="nexus-st-textarea forminator-input" name="' . esc_attr( $name ) . '"';
		echo $this->floating_nbsp_placeholder_attr(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- esc_attr applied in method.
		if ( $required ) {
			echo ' required';
		}
		echo '></textarea>';
		printf(
			'<label class="nexus-st-float-label" for="%s">%s%s</label></div>',
			esc_attr( $id ),
			esc_html( $caption ),
			$required ? '<span class="nexus-st-req">*</span>' : ''
		);
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
			'borderColor'     => '#d1d5db',
			'borderRadius'    => 6,
			'borderWidth'     => 1,
			'padding'         => 12,
			'fontSize'        => 14,
			'fontWeight'      => '500',
		);

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

		$radius = max( 0, (int) ( $settings['borderRadius'] ?? $defaults['borderRadius'] ) );
		$bwidth = max( 0, (int) ( $settings['borderWidth'] ?? $defaults['borderWidth'] ) );
		$pad    = max( 0, (int) ( $settings['padding'] ?? $defaults['padding'] ) );
		$fsize  = max( 10, (int) ( $settings['fontSize'] ?? $defaults['fontSize'] ) );

		$fweight_raw = sanitize_text_field( (string) ( $settings['fontWeight'] ?? $defaults['fontWeight'] ) );
		$fweight     = preg_match( '/^[1-9]00$/', $fweight_raw ) ? $fweight_raw : ( is_numeric( $fweight_raw ) ? $fweight_raw : $defaults['fontWeight'] );

		$touched =
			strtolower( $bg ) !== strtolower( $defaults['backgroundColor'] )
			|| strtolower( $tc ) !== strtolower( $defaults['textColor'] )
			|| strtolower( $bc ) !== strtolower( $defaults['borderColor'] )
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
			'--nexus-st-form-field-bg:' . $bg,
			'--nexus-st-form-field-text:' . $tc,
			'--nexus-st-form-field-border-color:' . $bc,
			'--nexus-st-form-field-border-width:' . $bwidth . 'px',
			'--nexus-st-form-field-radius:' . $radius . 'px',
			'--nexus-st-field-inner-pad:' . $pad . 'px',
			'--nexus-st-field-inner-pad-x:' . $pad . 'px',
			'--nexus-st-field-font-size:' . $fsize . 'px',
			'--nexus-st-field-font-weight:' . $fweight,
		);

		return array(
			'class_suffix' => ' nexus-st-field--custom-appearance',
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

		$field_class = 'nexus-st-field forminator-field' . ( $use_floating_layout ? ' nexus-st-field--floating' : '' );
		if ( $show_label ) {
			$field_class .= ' nexus-st-field--show-label';
		}

		$appearance   = $this->get_field_custom_appearance( $settings );
		$field_class .= $appearance['class_suffix'];

		$field_help = isset( $settings['helpText'] ) ? sanitize_text_field( (string) $settings['helpText'] ) : '';
		if ( '' === $field_help && isset( $settings['description'] ) ) {
			$field_help = sanitize_text_field( (string) $settings['description'] );
		}

		echo '<div class="' . esc_attr( $field_class ) . '" data-module="' . esc_attr( $module_id ) . '"';
		if ( '' !== $appearance['inline_style'] ) {
			echo ' style="' . esc_attr( $appearance['inline_style'] ) . '"';
		}
		echo '>';

		if ( 'terms-conditions' !== $module_id && $show_label && '' !== $label ) {
			echo '<label class="nexus-st-field__label forminator-label">' . esc_html( $label ) . ( $required ? '<span class="nexus-st-req">*</span>' : '' ) . '</label>';
		}

		if ( '' !== $field_help && 'terms-conditions' !== $module_id ) {
			echo '<p class="nexus-st-field__help forminator-description">' . esc_html( $field_help ) . '</p>';
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
					'data-nexus-mask="us-phone" inputmode="tel" autocomplete="tel"'
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
				echo '<select class="nexus-st-select forminator-input" name="' . esc_attr( $name ) . '"' . ( $required ? ' required' : '' ) . '>';
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
				echo '<div class="nexus-st-options' . ( $inline ? ' nexus-st-options--inline' : '' ) . '">';
				foreach ( $options as $idx => $opt ) {
					if ( ! is_array( $opt ) ) {
						continue;
					}
					$opt_label = isset( $opt['label'] ) ? sanitize_text_field( (string) $opt['label'] ) : '';
					$opt_value = isset( $opt['value'] ) ? sanitize_text_field( (string) $opt['value'] ) : $opt_label;
					$opt_id    = $name . '_' . (int) $idx;
					echo '<label class="nexus-st-option" for="' . esc_attr( $opt_id ) . '">';
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
					'data-nexus-mask="date-mdy" inputmode="numeric" maxlength="10" autocomplete="bday"'
				);
				break;
			case 'time':
				printf(
					'<input class="nexus-st-input forminator-input" type="time" name="%s"%s />',
					esc_attr( $name ),
					$required ? ' required' : ''
				);
				break;
			case 'date-time':
				printf(
					'<input class="nexus-st-input forminator-input" type="datetime-local" name="%s"%s />',
					esc_attr( $name ),
					$required ? ' required' : ''
				);
				break;
		case 'file-upload':
			$file_label = '' !== $placeholder ? esc_html( $placeholder ) : esc_html__( 'Choose file…', 'nexus-lead-suite' );
			printf(
				'<div class="nexus-st-file-wrap">
					<span class="nexus-st-file-btn">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
						Upload
					</span>
					<span class="nexus-st-file-name" data-default="%s">%s</span>
					<input class="nexus-st-input forminator-input" type="file" name="%s"%s
						onchange="(function(i){var n=i.closest(\'.nexus-st-file-wrap\').querySelector(\'.nexus-st-file-name\');n.textContent=i.files[0]?i.files[0].name:n.dataset.default;})(this)" />
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
				echo '<label class="nexus-st-consent">';
				echo '<input type="checkbox" name="' . esc_attr( $name ) . '" value="1"' . ( $required ? ' required' : '' ) . ' />';
				echo '<span>' . wp_kses_post( $html ) . '</span>';
				echo '</label>';
				break;
			case 'recaptcha':
				$rec_fb = $this->get_recaptcha_integration_settings();
				$v3_mod = ( 'v3' === $rec_fb['apiVersion'] ) ? ' nexus-st-captcha--recaptcha-v3' : '';
				echo '<div class="nexus-st-captcha nexus-st-captcha--recaptcha' . esc_attr( $v3_mod ) . '" aria-label="reCAPTCHA"></div>';
				break;
			case 'cloudflare':
				echo '<div class="nexus-st-captcha nexus-st-captcha--turnstile" aria-label="Turnstile"></div>';
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
		echo '<div class="nexus-st-compound nexus-st-compound--' . esc_attr( (string) $cols ) . '">';
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
			$id = $this->floating_input_dom_id();
			echo '<div class="nexus-st-float-wrap">';
			echo '<input id="' . esc_attr( $id ) . '" class="nexus-st-input forminator-input" type="text" name="' . esc_attr( $base_name ) . '[' . esc_attr( $key ) . ']"';
			echo $this->floating_nbsp_placeholder_attr(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- esc_attr applied in method.
			if ( $sub_req ) {
				echo ' required';
			}
			echo ' />';
			printf(
				'<label class="nexus-st-float-label" for="%s">%s%s</label></div>',
				esc_attr( $id ),
				esc_html( $caption ),
				$sub_req ? '<span class="nexus-st-req">*</span>' : ''
			);
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
	 * Renders the floating livechat widget in wp_footer.
	 * Reads general settings to build the widget; outputs scoped CSS + HTML + JS inline.
	 *
	 * @return void
	 */
	public function render_livechat_widget(): void {
		$opt = get_option( self::GENERAL_SETTINGS_OPTION_KEY, array() );
		if ( ! is_array( $opt ) || empty( $opt['enableLivechat'] ?? false ) ) {
			return;
		}

		/* ── Read settings with safe defaults ── */
		$chat_title   = sanitize_text_field( (string) ( $opt['chatTitle']       ?? 'Customer Support' ) );
		$chat_badge   = sanitize_text_field( (string) ( $opt['chatBadge']       ?? 'Online' ) );
		$chat_content = sanitize_textarea_field( (string) ( $opt['chatContent'] ?? '' ) );
		/* Avatar / bubble image: attachment URL or legacy data URI (must match sanitizer on save). */
		$btn_raw_img = trim( (string) ( $opt['chatButtonImage'] ?? '' ) );
		$btn_image   = '';
		if ( '' !== $btn_raw_img ) {
			if ( preg_match( '#^data:image/(jpeg|jpg|png|gif|webp);base64,#i', $btn_raw_img ) ) {
				$btn_image = esc_attr( $btn_raw_img );
			} else {
				$btn_image = esc_url( $btn_raw_img );
			}
		}
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

		$btn1_has_action = ( 'popup' === $btn1_type ) ? ( '' !== $btn1_val ) : ( '' !== $btn1_val );
		$btn2_has_action = ( 'popup' === $btn2_type ) ? ( '' !== $btn2_val ) : ( '' !== $btn2_val );
		$btn3_has_action = ( 'popup' === $btn3_type ) ? ( '' !== $btn3_val ) : ( '' !== $btn3_val );
		$has_any_action_btn = $btn1_has_action || $btn2_has_action || $btn3_has_action;
		$has_inline_popup_btn = ( 'popup' === $btn1_type && '' !== $btn1_val );

		/* ── Inline popup clone (button 1 + Popup): body only — header uses livechat avatar + title (no popup name/sub-heading). ── */
		$inline_popup_html = '';
		if ( $has_inline_popup_btn ) {
			// Special case: "popup:form:{formId}" opens the Form Builder form inline (no Popup required).
			if ( str_starts_with( $btn1_val, 'form:' ) ) {
				$form_id = sanitize_text_field( substr( $btn1_val, 5 ) );
				if ( '' !== $form_id ) {
					$inline_popup_html = do_shortcode( sprintf( '[smart_trigger_form id="%s"]', esc_attr( $form_id ) ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
				}
				if ( '' === trim( (string) $inline_popup_html ) ) {
					$inline_popup_html = '<p class="nexus-chat-inline-popup-missing">' . esc_html__( 'Selected form was not found. Pick another form under Settings → Livechat.', 'nexus-lead-suite' ) . '</p>';
				}
			} else {
				$p_inline = $this->find_popup_by_event_or_id( $btn1_val );
				if ( is_array( $p_inline ) ) {
					$c_in = isset( $p_inline['content'] ) ? (string) $p_inline['content'] : '';
					ob_start();
					if ( '' !== trim( $c_in ) ) {
						echo do_shortcode( wp_kses_post( $c_in ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
					} else {
						echo '<p class="nexus-chat-inline-popup-missing">' . esc_html__( 'This popup has no body content yet. Add content under Nexus → Popups.', 'nexus-lead-suite' ) . '</p>';
					}
					$inline_popup_html = (string) ob_get_clean();
				} else {
					$inline_popup_html = '<p class="nexus-chat-inline-popup-missing">' . esc_html__( 'Selected popup was not found. Pick another popup under Settings → Livechat.', 'nexus-lead-suite' ) . '</p>';
				}
			}
		}

		/* ── Widget dock: left or right edge of the viewport ── */
		$float_css = ( 'left' === $chat_side ) ? 'left:20px;right:auto;' : 'right:20px;left:auto;';
		$align_cls = ( 'left' === $chat_side ) ? ' nexus-chat--left' : '';

		/* ── Hover CSS class ── */
		$allowed_hover = array( 'lift', 'scale', 'glow', 'shake', 'rotate', 'darken' );
		$hover_cls     = in_array( $hover_effect, $allowed_hover, true ) ? 'nexus-chat-btn--' . $hover_effect : '';

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
		?>
		<style id="nexus-chat-css">
		/* ── Nexus Lead Suite — Livechat Widget ── */
		.nexus-chat-widget{position:fixed;bottom:24px;z-index:99997;display:flex;flex-direction:column;align-items:flex-end;gap:12px;<?php echo esc_attr( $float_css ); ?>font-family:'<?php echo esc_attr( $font ); ?>',sans-serif;}
		.nexus-chat-widget.nexus-chat--left{align-items:flex-start;}

		/* Panel — taller default home view; compact height when inline form is open (no dead space below short forms). */
		.nexus-chat-panel{display:none;width:420px;min-height:560px;background:<?php echo esc_attr( $chat_bubble_bg ); ?>;border-radius:22px;box-shadow:0 24px 70px rgba(0,0,0,.2);overflow:hidden;flex-direction:column;}
		.nexus-chat-panel.nexus-chat-panel--inline-form{min-height:0;}
		.nexus-chat-panel.nexus-chat--open{display:flex;animation:nexus-chat-pop-in .22s ease;}
		@keyframes nexus-chat-pop-in{from{opacity:0;transform:translateY(16px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}

		/* Header — extra vertical padding reads as taller chrome */
		.nexus-chat-panel__head{display:flex;align-items:center;gap:14px;padding:26px 22px 22px;background:<?php echo esc_attr( $btn_bg ); ?>;flex-shrink:0;}
		.nexus-chat-panel__avatar{width:54px;height:54px;border-radius:50%;flex-shrink:0;background:rgba(255,255,255,.22);display:flex;align-items:center;justify-content:center;overflow:hidden;border:2px solid rgba(255,255,255,.35);}
		.nexus-chat-panel__avatar img{width:54px;height:54px;border-radius:50%;object-fit:cover;display:block;}
		.nexus-chat-panel__avatar svg{width:26px;height:26px;fill:none;stroke:<?php echo esc_attr( $btn_text_col ); ?>;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}
		.nexus-chat-panel__info{flex:1;min-width:0;}
		.nexus-chat-panel__title{font-size:15px;font-weight:700;color:<?php echo esc_attr( $btn_text_col ); ?>;margin:0;padding:0;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
		.nexus-chat-panel__badge{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:<?php echo esc_attr( $btn_text_col ); ?>;opacity:.85;margin:0;margin-top:5px;line-height:1.2;display:flex;align-items:center;gap:6px;}
		/* Online indicator dot (badge + trigger) */
		.nexus-chat-online-dot{width:9px;height:9px;border-radius:999px;flex:0 0 auto;display:inline-block;background:<?php echo esc_attr( $chat_online_dot ); ?>;box-shadow:0 0 0 2px rgba(255,255,255,.22),0 0 16px color-mix(in srgb, <?php echo esc_attr( $chat_online_dot ); ?>, transparent 15%),0 0 36px color-mix(in srgb, <?php echo esc_attr( $chat_online_dot ); ?>, transparent 45%);animation:nexus-chat-online-blink 1.05s ease-in-out infinite;position:relative;z-index:2;}
		@keyframes nexus-chat-online-blink{0%,100%{transform:scale(.92);opacity:.75;filter:saturate(1.2) brightness(1.05)}50%{transform:scale(1.12);opacity:1;filter:saturate(1.55) brightness(1.25);box-shadow:0 0 0 2px rgba(255,255,255,.35),0 0 18px rgba(0,255,106,.95),0 0 44px rgba(0,255,106,.75)}}
		@media (prefers-reduced-motion: reduce){.nexus-chat-online-dot{animation:none}}
		.nexus-chat-panel__close{background:rgba(0,0,0,.15);border:none;color:<?php echo esc_attr( $btn_text_col ); ?>;width:30px;height:30px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px;line-height:1;flex-shrink:0;transition:background .2s,transform .25s cubic-bezier(.34,1.56,.64,1);}
		.nexus-chat-panel__close:hover{background:rgba(0,0,0,.28);transform:rotate(90deg) scale(1.1);}

		/* Body — expanded content zone */
		.nexus-chat-panel__body{flex:1 1 auto;padding:26px 24px;background:#f8fafc;font-size:14px;color:#475569;line-height:1.65;border-bottom:1px solid #f1f5f9;min-height:96px;}

		/* Buttons area */
		.nexus-chat-panel__btns{padding:18px 22px 22px;display:flex;flex-direction:column;gap:10px;background:<?php echo esc_attr( $chat_bubble_bg ); ?>;flex-shrink:0;}
		.nexus-chat-panel__btns a,
		.nexus-chat-panel__btns button{display:block;width:100%;box-sizing:border-box;text-align:center;text-decoration:none !important;font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:.06em;cursor:pointer;border:none;line-height:1.3;transition:transform .18s ease,box-shadow .18s ease,filter .18s ease;}
		.nexus-chat-panel__btns-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
		.nexus-chat-panel__btns-row a,
		.nexus-chat-panel__btns-row button{display:flex;align-items:center;justify-content:center;}

		/* ── Inline Form View ── */
		.nexus-chat-form-view{display:none;flex-direction:column;background:<?php echo esc_attr( $chat_bubble_bg ); ?>;flex:1 1 auto;min-height:0;}
		.nexus-chat-panel.nexus-chat-panel--inline-form .nexus-chat-form-view{flex:0 1 auto;}
		.nexus-chat-form-view.nexus-chat-form--active{display:flex;animation:nexus-chat-pop-in .2s ease;}
		.nexus-chat-form-view__head{display:flex;align-items:center;gap:14px;padding:22px 20px;background:<?php echo esc_attr( $btn_bg ); ?>;border-bottom:1px solid rgba(255,255,255,.15);flex-shrink:0;}
		.nexus-chat-form-view__back{background:rgba(0,0,0,.15);border:none;color:<?php echo esc_attr( $btn_text_col ); ?>;width:30px;height:30px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;line-height:1;flex-shrink:0;transition:background .2s;}
		.nexus-chat-form-view__back:hover{background:rgba(0,0,0,.28);}
		.nexus-chat-form-view__avatar{width:48px;height:48px;border-radius:50%;flex-shrink:0;background:rgba(255,255,255,.22);display:flex;align-items:center;justify-content:center;overflow:hidden;border:2px solid rgba(255,255,255,.35);}
		.nexus-chat-form-view__avatar img{width:48px;height:48px;border-radius:50%;object-fit:cover;display:block;}
		.nexus-chat-form-view__avatar svg{width:24px;height:24px;fill:none;stroke:<?php echo esc_attr( $btn_text_col ); ?>;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}
		.nexus-chat-form-view__info{flex:1;min-width:0;}
		.nexus-chat-form-view__heading{font-size:15px;font-weight:700;color:<?php echo esc_attr( $btn_text_col ); ?>;margin:0;padding:0;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
		.nexus-chat-inline-popup-body{flex:1 1 auto;max-height:min(72vh,560px);overflow-y:auto;padding:18px 20px 22px;background:#fff;}
		.nexus-chat-panel.nexus-chat-panel--inline-form .nexus-chat-inline-popup-body{flex:0 1 auto;}
		.nexus-chat-inline-popup-body .nexus-st-form{margin:0;border:none!important;box-shadow:none!important;background:transparent!important;}
		.nexus-chat-inline-popup-body .nexus-st-form>form.nexus-st-form__body,
		.nexus-chat-inline-popup-body form.nexus-st-form__body{
			border:none!important;box-shadow:none!important;outline:none!important;background:transparent!important;
			padding:0!important;margin:0!important;border-radius:0!important;
		}
		.nexus-chat-inline-popup-missing{font-size:12px;color:#b45309;margin:0;line-height:1.5;}

		/* Floating trigger bubble — matches larger panel presence */
		.nexus-chat-trigger{width:66px;height:66px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 24px rgba(0,0,0,.2);background:<?php echo esc_attr( $btn_bg ); ?>;overflow:hidden;position:relative;transition:transform .18s ease,box-shadow .18s ease,filter .18s ease;}
		.nexus-chat-trigger svg{width:26px;height:26px;fill:none;stroke:<?php echo esc_attr( $btn_text_col ); ?>;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;position:relative;z-index:1;}
		.nexus-chat-trigger .nexus-chat-online-dot{position:absolute;right:10px;top:10px;z-index:3;}

		/* Hover effects */
		.nexus-chat-btn--lift:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(0,0,0,.22);}
		.nexus-chat-btn--scale:hover{transform:scale(1.1);}
		.nexus-chat-btn--glow:hover{box-shadow:0 0 24px <?php echo esc_attr( $btn_bg ); ?>,0 6px 24px rgba(0,0,0,.18);}
		.nexus-chat-btn--darken:hover{filter:brightness(.85);}
		.nexus-chat-btn--shake:hover{animation:nexus-chat-shake .4s ease;}
		.nexus-chat-btn--rotate:hover{transform:rotate(6deg) scale(1.05);}
		@keyframes nexus-chat-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-4px)}40%{transform:translateX(4px)}60%{transform:translateX(-3px)}80%{transform:translateX(3px)}}
		.nexus-chat-panel__btns a.nexus-chat-btn--lift:hover,
		.nexus-chat-panel__btns button.nexus-chat-btn--lift:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,.18);}
		.nexus-chat-panel__btns a.nexus-chat-btn--scale:hover,
		.nexus-chat-panel__btns button.nexus-chat-btn--scale:hover{transform:scale(1.04);}
		.nexus-chat-panel__btns a.nexus-chat-btn--glow:hover,
		.nexus-chat-panel__btns button.nexus-chat-btn--glow:hover{box-shadow:0 0 18px <?php echo esc_attr( $btn_bg ); ?>;}
		.nexus-chat-panel__btns a.nexus-chat-btn--darken:hover,
		.nexus-chat-panel__btns button.nexus-chat-btn--darken:hover{filter:brightness(.88);}

		/* Mobile / tablet: responsive panel (min usable ~320px wide), viewport-capped height, internal scroll */
		@media (max-width: 1023px){
		.nexus-chat-widget{bottom:calc(100px + env(safe-area-inset-bottom,0px));z-index:999998;}
		.nexus-chat-widget:not(.nexus-chat--left){right:max(14px,env(safe-area-inset-right,0px));left:auto;}
		.nexus-chat-widget.nexus-chat--left{left:max(14px,env(safe-area-inset-left,0px));right:auto;}
		.nexus-chat-trigger{width:54px;height:54px;}
		.nexus-chat-trigger svg{width:22px;height:22px;}
		.nexus-chat-trigger .nexus-chat-online-dot{right:8px;top:8px;width:8px;height:8px;}
		/* Panel fits narrow screens (320px+); max height clears trigger + sticky nav + safe areas */
		.nexus-chat-panel{
			box-sizing:border-box;width:min(420px,calc(100vw - 24px - env(safe-area-inset-left,0px) - env(safe-area-inset-right,0px)));min-width:0;
			min-height:0;
			max-height:min(640px,calc(100vh - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px) - 164px));
			max-height:min(640px,calc(100svh - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px) - 164px));
			overflow:hidden;
		}
		.nexus-chat-panel.nexus-chat-panel--inline-form .nexus-chat-form-view.nexus-chat-form--active{flex:1 1 auto;min-height:0;overflow:hidden;}
		.nexus-chat-panel.nexus-chat-panel--inline-form .nexus-chat-inline-popup-body{
			flex:1 1 auto;min-height:0;max-height:none;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:14px 16px 16px;
		}
		.nexus-chat-panel__head{padding:18px 16px 16px;gap:12px;}
		.nexus-chat-panel__avatar,.nexus-chat-panel__avatar img{width:46px;height:46px;}
		.nexus-chat-panel__avatar svg{width:22px;height:22px;}
		.nexus-chat-panel__title{font-size:14px;}
		.nexus-chat-panel__body{min-height:0;flex:1 1 auto;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:18px 16px;}
		.nexus-chat-panel__btns{padding:14px 16px 16px;}
		.nexus-chat-form-view{min-height:0;}
		.nexus-chat-form-view__head{padding:16px 14px;gap:12px;}
		.nexus-chat-form-view__avatar,.nexus-chat-form-view__avatar img{width:44px;height:44px;}
		.nexus-chat-form-view__avatar svg{width:22px;height:22px;}
		.nexus-chat-form-view__heading{font-size:14px;}
		}
		/* Very small phones: tighter chrome, keep ≥~296px content width at 320 CSS px viewport */
		@media (max-width: 360px){
		.nexus-chat-panel{width:min(420px,calc(100vw - 16px - env(safe-area-inset-left,0px) - env(safe-area-inset-right,0px)));}
		.nexus-chat-panel__head{padding:16px 12px 14px;}
		.nexus-chat-panel__body,.nexus-chat-panel__btns{padding-left:12px;padding-right:12px;}
		.nexus-chat-inline-popup-body{padding-left:12px;padding-right:12px;}
		}
		</style>

		<div class="nexus-chat-widget<?php echo esc_attr( $align_cls ); ?>" id="nexus-chat-widget" aria-live="polite">

			<?php /* ── Chat panel (hidden until bubble clicked) ── */ ?>
			<div class="nexus-chat-panel" id="nexus-chat-panel" role="dialog" aria-modal="true" aria-label="<?php echo esc_attr( $chat_title ); ?>">

				<?php /* ─ Header ─ */ ?>
				<div class="nexus-chat-panel__head">
					<div class="nexus-chat-panel__avatar">
						<?php if ( '' !== $btn_image ) : ?>
							<img src="<?php echo $btn_image; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- esc_url() or esc_attr() applied above. ?>" alt="<?php echo esc_attr( $chat_title ); ?>" />
						<?php else : ?>
							<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 10h.01M12 10h.01M16 10h.01M21 16c0 1.1-.9 2-2 2H7l-4 4V6a2 2 0 012-2h14a2 2 0 012 2v10z"/></svg>
						<?php endif; ?>
					</div>
					<div class="nexus-chat-panel__info">
						<p class="nexus-chat-panel__title"><?php echo esc_html( $chat_title ); ?></p>
						<?php if ( '' !== $chat_badge ) : ?>
							<p class="nexus-chat-panel__badge"><span class="nexus-chat-online-dot" aria-hidden="true"></span><?php echo esc_html( $chat_badge ); ?></p>
						<?php endif; ?>
					</div>
					<button type="button" class="nexus-chat-panel__close" id="nexus-chat-close" aria-label="<?php esc_attr_e( 'Close chat', 'nexus-lead-suite' ); ?>">&#x2715;</button>
				</div>

				<?php /* ─ Greeting ─ */ ?>
				<?php if ( '' !== $chat_content ) : ?>
					<div class="nexus-chat-panel__body"><?php echo esc_html( $chat_content ); ?></div>
				<?php endif; ?>

				<?php /* ─ Action Buttons ─ */ ?>
				<?php if ( $has_any_action_btn ) : ?>
					<div class="nexus-chat-panel__btns">

						<?php
						/*
						 * Button 1: If type = popup → "Open inline form" inside the chat widget.
						 *            Use data-nexus-chat-open-form attribute to distinguish.
						 * Buttons 2 & 3: If type = popup → open external nexus popup overlay.
						 */
						?>

						<?php /* Button 1 — full width (only when action exists) */ ?>
						<?php if ( $btn1_has_action ) : ?>
							<?php if ( $has_inline_popup_btn ) : ?>
								<button type="button"
									class="<?php echo esc_attr( $hover_cls ); ?>"
									style="<?php echo esc_attr( $btn_style ); ?>"
									data-nexus-chat-open-form="1">
									<?php echo esc_html( $btn1_label ); ?>
								</button>
							<?php else : ?>
								<?php
								$chat_ntfy_1 = 'chat-b1,' . ( '' !== $btn1_label ? $btn1_label : __( 'Livechat button', 'nexus-lead-suite' ) );
								?>
								<a href="<?php echo esc_url( $btn1_val, $href_protocols ); ?>"
									class="<?php echo esc_attr( $hover_cls ); ?>"
									style="<?php echo esc_attr( $btn_style ); ?>"
									data-nexas-trigger="<?php echo esc_attr( $chat_ntfy_1 ); ?>">
									<?php echo esc_html( $btn1_label ); ?>
								</a>
							<?php endif; ?>
						<?php endif; ?>

						<?php /* Buttons 2 + 3 — side-by-side grid (only render when at least one exists) */ ?>
						<?php if ( $btn2_has_action || $btn3_has_action ) : ?>
							<div class="nexus-chat-panel__btns-row">
								<?php if ( $btn2_has_action ) : ?>
									<?php if ( 'popup' === $btn2_type ) : ?>
										<button type="button"
											class="<?php echo esc_attr( $hover_cls ); ?>"
											style="<?php echo esc_attr( $btn_style_muted ); ?>"
											data-nexus-chat-popup="<?php echo esc_attr( $btn2_val ); ?>">
											<?php echo esc_html( $btn2_label ); ?>
										</button>
									<?php else : ?>
										<?php
										$chat_ntfy_2 = 'chat-b2,' . ( '' !== $btn2_label ? $btn2_label : __( 'Livechat button', 'nexus-lead-suite' ) );
										?>
										<a href="<?php echo esc_url( $btn2_val, $href_protocols ); ?>"
											class="<?php echo esc_attr( $hover_cls ); ?>"
											style="<?php echo esc_attr( $btn_style_muted ); ?>"
											data-nexas-trigger="<?php echo esc_attr( $chat_ntfy_2 ); ?>">
											<?php echo esc_html( $btn2_label ); ?>
										</a>
									<?php endif; ?>
								<?php endif; ?>

								<?php if ( $btn3_has_action ) : ?>
									<?php if ( 'popup' === $btn3_type ) : ?>
										<button type="button"
											class="<?php echo esc_attr( $hover_cls ); ?>"
											style="<?php echo esc_attr( $btn_style_muted ); ?>"
											data-nexus-chat-popup="<?php echo esc_attr( $btn3_val ); ?>">
											<?php echo esc_html( $btn3_label ); ?>
										</button>
									<?php else : ?>
										<?php
										$chat_ntfy_3 = 'chat-b3,' . ( '' !== $btn3_label ? $btn3_label : __( 'Livechat button', 'nexus-lead-suite' ) );
										?>
										<a href="<?php echo esc_url( $btn3_val, $href_protocols ); ?>"
											class="<?php echo esc_attr( $hover_cls ); ?>"
											style="<?php echo esc_attr( $btn_style_muted ); ?>"
											data-nexas-trigger="<?php echo esc_attr( $chat_ntfy_3 ); ?>">
											<?php echo esc_html( $btn3_label ); ?>
										</a>
									<?php endif; ?>
								<?php endif; ?>
							</div>
						<?php endif; ?>

					</div>
				<?php endif; ?>

				<?php /* ── Inline view: selected Popup content (shortcodes rendered), same as Popups builder ── */ ?>
				<?php if ( $has_inline_popup_btn ) : ?>
					<div class="nexus-chat-form-view" id="nexus-chat-form-view" aria-label="<?php echo esc_attr( $chat_title ); ?>">

					<div class="nexus-chat-form-view__head">
						<button type="button" class="nexus-chat-form-view__back" id="nexus-chat-form-back" aria-label="<?php esc_attr_e( 'Back', 'nexus-lead-suite' ); ?>">&#8592;</button>
						<div class="nexus-chat-form-view__avatar">
							<?php if ( '' !== $btn_image ) : ?>
								<img src="<?php echo $btn_image; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- esc_url() or esc_attr() applied above. ?>" alt="" />
							<?php else : ?>
								<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 10h.01M12 10h.01M16 10h.01M21 16c0 1.1-.9 2-2 2H7l-4 4V6a2 2 0 012-2h14a2 2 0 012 2v10z"/></svg>
							<?php endif; ?>
						</div>
						<div class="nexus-chat-form-view__info">
							<p class="nexus-chat-form-view__heading"><?php echo esc_html( $chat_title ); ?></p>
						</div>
					</div>

					<div class="nexus-chat-inline-popup-body" id="nexus-chat-inline-popup-body">
						<?php
						echo $inline_popup_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built via esc_html / shortcodes above.
						?>
					</div>

					</div>
				<?php endif; ?>

			</div>

			<?php /* ── Floating trigger bubble ── */ ?>
			<button type="button"
				class="nexus-chat-trigger <?php echo esc_attr( $hover_cls ); ?>"
				id="nexus-chat-trigger"
				aria-expanded="false"
				aria-controls="nexus-chat-panel"
				aria-label="<?php esc_attr_e( 'Open chat', 'nexus-lead-suite' ); ?>">
				<span class="nexus-chat-online-dot" aria-hidden="true"></span>
				<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 10h.01M12 10h.01M16 10h.01M21 16c0 1.1-.9 2-2 2H7l-4 4V6a2 2 0 012-2h14a2 2 0 012 2v10z"/></svg>
			</button>

		</div>
		<script id="nexus-chat-js">
		(function(){
			'use strict';

			var trigger    = document.getElementById('nexus-chat-trigger');
			var panel      = document.getElementById('nexus-chat-panel');
			var closeBtn   = document.getElementById('nexus-chat-close');
			var formView   = document.getElementById('nexus-chat-form-view');
			var formBack   = document.getElementById('nexus-chat-form-back');

			if(!trigger||!panel) return;

			/* ── Open / close chat panel ── */
			function openChat(){
				panel.classList.add('nexus-chat--open');
				trigger.setAttribute('aria-expanded','true');
			}
			function closeChat(){
				panel.classList.remove('nexus-chat--open');
				trigger.setAttribute('aria-expanded','false');
				/* also reset to main view when closing */
				showMainView();
			}
			trigger.addEventListener('click', function(){
				panel.classList.contains('nexus-chat--open') ? closeChat() : openChat();
			});
			if(closeBtn){ closeBtn.addEventListener('click', closeChat); }

			/* ── Main view ↔ Inline form view ── */
			var mainView = panel.querySelector('.nexus-chat-panel__head') ? panel : null;

			function showFormView(){
				if(!formView) return;
				/* hide all sibling sections except formView */
				['.nexus-chat-panel__head','.nexus-chat-panel__body','.nexus-chat-panel__btns'].forEach(function(sel){
					var el = panel.querySelector(sel);
					if(el) el.style.display='none';
				});
				panel.classList.add('nexus-chat-panel--inline-form');
				formView.classList.add('nexus-chat-form--active');
			}
			function showMainView(){
				if(!formView) return;
				panel.classList.remove('nexus-chat-panel--inline-form');
				formView.classList.remove('nexus-chat-form--active');
				['.nexus-chat-panel__head','.nexus-chat-panel__body','.nexus-chat-panel__btns'].forEach(function(sel){
					var el = panel.querySelector(sel);
					if(el) el.style.display='';
				});
			}

			/* Back button inside form view */
			if(formBack){ formBack.addEventListener('click', showMainView); }

			/* ── Button 1: open inline form (data-nexus-chat-open-form) ── */
			var openFormBtns = panel.querySelectorAll('[data-nexus-chat-open-form]');
			openFormBtns.forEach(function(btn){
				btn.addEventListener('click', showFormView);
			});

			/* ── Buttons 2 & 3: open external nexus popup (data-nexus-chat-popup) ── */
			var popupBtns = panel.querySelectorAll('[data-nexus-chat-popup]');
			popupBtns.forEach(function(btn){
				btn.addEventListener('click', function(ev){
					ev.preventDefault();
					var evName = (btn.getAttribute('data-nexus-chat-popup') || '').trim();
					closeChat();
					if(!evName) return;
					var nexusPopup = (window.NexusLsPopupUi && typeof window.NexusLsPopupUi.findOverlayByEventId === 'function')
						? window.NexusLsPopupUi.findOverlayByEventId(evName)
						: null;
					if(!nexusPopup) return;
					if(window.NexusLsPopupUi && typeof window.NexusLsPopupUi.open === 'function'){
						window.NexusLsPopupUi.open(nexusPopup);
					} else {
						nexusPopup.classList.add('nexus-popup--open');
						nexusPopup.setAttribute('aria-hidden','false');
						document.body.style.overflow='hidden';
					}
				});
			});

			/* ESC key */
			document.addEventListener('keydown', function(e){
				if(e.key==='Escape' && panel.classList.contains('nexus-chat--open')){ closeChat(); }
			});
		})();
		</script>
		<?php
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

		echo '<div class="nexus-st-compound nexus-st-compound--2">';
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
			echo '<div class="nexus-st-float-wrap">';
			echo '<input id="' . esc_attr( $id ) . '" class="nexus-st-input forminator-input" type="text" name="' . esc_attr( $base_name ) . '[' . esc_attr( $key ) . ']"';
			echo $this->floating_nbsp_placeholder_attr(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- esc_attr applied in method.
			if ( $sub_req ) {
				echo ' required';
			}
			echo ' />';
			printf(
				'<label class="nexus-st-float-label" for="%s">%s%s</label></div>',
				esc_attr( $id ),
				esc_html( $caption ),
				$sub_req ? '<span class="nexus-st-req">*</span>' : ''
			);
		}
		echo '</div>';
	}
}

