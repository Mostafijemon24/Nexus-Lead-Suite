<?php
/**
 * REST API bootstrap (routes registered here in future milestones).
 *
 * @package nexulesuite_
 */

declare(strict_types=1);

namespace nexulesuite_\Api;

use nexulesuite_\Data_Bundle;
use nexulesuite_\Forms_Payload_Codec;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers REST API integration.
 *
 * Loaded from {@see \nexulesuite_\Plugin::bootstrap_rest_api()} on {@see 'rest_api_init'} (priority 0)
 * so this file is not parsed on ordinary frontend page views.
 */
final class Rest_Api {
	/**
	 * Forms option key (base64 + rawurlencode JSON).
	 */
	private const FORMS_OPTION_KEY = 'nexulesuite_forms_builder_v0';
	private const GLOBAL_APPEARANCE_OPTION_KEY = 'nexulesuite_global_appearance_v1';
	private const RECAPTCHA_OPTION_KEY = 'nexulesuite_recaptcha_keys_v0';
	private const TURNSTILE_OPTION_KEY = 'nexulesuite_turnstile_keys_v0';
	private const MENU_ITEMS_OPTION_KEY = 'nexulesuite_menu_items_v1';
	private const POPUPS_OPTION_KEY = 'nexulesuite_popups_v1';
	private const EMAIL_TEMPLATES_OPTION_KEY = 'nexulesuite_email_templates_v1';
	private const GENERAL_SETTINGS_OPTION_KEY = 'nexulesuite_general_settings_v1';

	/**
	 * How the chatbot reaches a model: straight to the vendor's HTTPS API (`direct`,
	 * the default) or through a self-hosted Nexus AI Server (`server`, the legacy path).
	 */
	private const AI_MODES = array( 'direct', 'server' );

	/**
	 * Base64 length ceiling for an attached image, sized so a 4096px (4K) photo fits.
	 * Base64 inflates by 4/3, so this is roughly a 15 MB file.
	 */
	private const AI_IMAGE_MAX_BASE64 = 20971520;

	/**
	 * Retrieval thresholds for `direct` mode. Cosine similarity from hosted embedding
	 * models runs lower than the scores ChromaDB reported, so these are NOT the 0.4/0.5
	 * cut-offs the server path uses — a relevant page typically lands around 0.35-0.60.
	 *
	 * MIN gates what reaches the model at all; CITE (higher) gates what gets a source chip.
	 * RELATIVE additionally drops chunks far weaker than the best one, so a single strong
	 * match never drags its neighbours into the prompt.
	 */
	private const AI_DIRECT_MIN_SCORE  = 0.30;
	private const AI_DIRECT_CITE_SCORE = 0.34;
	private const AI_DIRECT_RELATIVE   = 0.75;

	/**
	 * Chunks embedded per request while training.
	 */
	private const AI_EMBED_BATCH = 32;

	/**
	 * Post meta: Visual Editor DOM patches when markup is not in post_content (theme/header/builders).
	 */
	private const VE_DOM_PATCHES_META_KEY = '_nexulesuite_ve_dom_patches';

	/**
	 * Hooks REST registration on the next rest_api_init (eager bootstrap).
	 *
	 * Prefer instantiating this class only inside a `rest_api_init` callback and calling {@see self::register_routes()}
	 * directly (see Plugin::bootstrap_rest_api) to avoid loading this file on non-REST requests.
	 *
	 * @return void
	 */
	public function register_hooks(): void {
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	/**
	 * Registers REST routes (placeholder for controllers).
	 *
	 * @return void
	 */
	public function register_routes(): void {
		register_rest_route(
			'nexulesuite_/v1',
			'/render-shortcode',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'render_shortcode_preview' ),
				'permission_callback' => array( $this, 'can_manage_settings' ),
				'args'                => array(
					'content' => array(
						'type'     => 'string',
						'required' => true,
					),
				),
			)
		);

		register_rest_route(
			'nexulesuite_/v1',
			'/settings/general',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_general_settings' ),
				'permission_callback' => array( $this, 'can_manage_settings' ),
			)
		);

		register_rest_route(
			'nexulesuite_/v1',
			'/settings/general',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'save_general_settings' ),
				'permission_callback' => array( $this, 'can_manage_settings' ),
				'args'                => array(
					'settings' => array(
						'type'     => 'object',
						'required' => true,
					),
				),
			)
		);

		register_rest_route(
			'nexulesuite_/v1',
			'/settings/accessibility-language',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_accessibility_language_settings' ),
				'permission_callback' => array( $this, 'can_manage_settings' ),
			)
		);

		register_rest_route(
			'nexulesuite_/v1',
			'/settings/accessibility-language',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'save_accessibility_language_settings' ),
				'permission_callback' => array( $this, 'can_manage_settings' ),
				'args'                => array(
					'settings' => array(
						'type'     => 'object',
						'required' => true,
					),
				),
			)
		);

		register_rest_route(
			'nexulesuite_/v1',
			'/form-submissions',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_form_submissions' ),
				'permission_callback' => array( $this, 'can_manage_settings' ),
			)
		);

		register_rest_route(
			'nexulesuite_/v1',
			'/form-submissions/delete',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'delete_form_submissions' ),
				'permission_callback' => array( $this, 'can_manage_settings' ),
			)
		);

		register_rest_route(
			'nexulesuite_/v1',
			'/settings/upload-chat-image',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'upload_livechat_avatar' ),
				'permission_callback' => array( $this, 'can_manage_settings' ),
			)
		);

		register_rest_route(
			'nexulesuite_/v1',
			'/settings/upload-report-logo',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'upload_report_logo' ),
				'permission_callback' => array( $this, 'can_manage_settings' ),
			)
		);

		register_rest_route(
			'nexulesuite_/v1',
			'/settings/generate-client-access-link',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'generate_client_access_link' ),
				'permission_callback' => array( $this, 'can_manage_settings' ),
				'args'                => array(
					'tokenTTL' => array(
						'type'              => 'integer',
						'required'          => false,
						'sanitize_callback' => 'absint',
					),
				),
			)
		);

		register_rest_route(
			'nexulesuite_/v1',
			'/settings/client-links',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( $this, 'list_client_links' ),
					'permission_callback' => array( $this, 'can_manage_settings' ),
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( $this, 'create_client_link' ),
					'permission_callback' => array( $this, 'can_manage_settings' ),
					'args'                => array(
						'label'        => array(
							'type'              => 'string',
							'required'          => false,
							'sanitize_callback' => 'sanitize_text_field',
						),
						'expiresDays'  => array(
							'type'              => 'integer',
							'required'          => false,
							'sanitize_callback' => 'absint',
						),
						'sections'     => array(
							'type'     => 'array',
							'required' => false,
						),
					),
				),
			)
		);

		register_rest_route(
			'nexulesuite_/v1',
			'/settings/client-links/(?P<id>[A-Za-z0-9]+)',
			array(
				'methods'             => 'DELETE',
				'callback'            => array( $this, 'revoke_client_link' ),
				'permission_callback' => array( $this, 'can_manage_settings' ),
				'args'                => array(
					'id' => array(
						'type'              => 'string',
						'required'          => true,
						'sanitize_callback' => 'sanitize_text_field',
					),
				),
			)
		);

		register_rest_route(
			'nexulesuite_/v1',
			'/settings/full-export',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'export_full_data_bundle' ),
				'permission_callback' => array( $this, 'can_manage_settings' ),
				'args'                => array(
					'embed_media' => array(
						'type'              => 'string',
						'required'          => false,
						'default'           => '1',
						'enum'              => array( '0', '1' ),
						'sanitize_callback' => static function ( $v ) {
							return ( '0' === (string) $v || 0 === $v || false === $v ) ? '0' : '1';
						},
					),
				),
			)
		);

		register_rest_route(
			'nexulesuite_/v1',
			'/settings/full-import',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'import_full_data_bundle' ),
				'permission_callback' => array( $this, 'can_manage_settings' ),
				'args'                => array(
					'bundle' => array(
						'type'     => 'object',
						'required' => true,
					),
				),
			)
		);

		register_rest_route(
			'nexulesuite_/v1',
			'/captcha/recaptcha',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_recaptcha_keys' ),
				'permission_callback' => array( $this, 'can_manage_settings' ),
			)
		);

		register_rest_route(
			'nexulesuite_/v1',
			'/captcha/recaptcha',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'save_recaptcha_keys' ),
				'permission_callback' => array( $this, 'can_manage_settings' ),
				'args'                => array(
					'siteKey'   => array(
						'type'              => 'string',
						'required'          => false,
						'sanitize_callback' => 'sanitize_text_field',
					),
					'secretKey' => array(
						'type'     => 'string',
						'required' => false,
					),
				),
			)
		);

		register_rest_route(
			'nexulesuite_/v1',
			'/captcha/turnstile',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_turnstile_keys' ),
				'permission_callback' => array( $this, 'can_manage_settings' ),
			)
		);

		register_rest_route(
			'nexulesuite_/v1',
			'/captcha/turnstile',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'save_turnstile_keys' ),
				'permission_callback' => array( $this, 'can_manage_settings' ),
				'args'                => array(
					'siteKey'   => array(
						'type'              => 'string',
						'required'          => false,
						'sanitize_callback' => 'sanitize_text_field',
					),
					'secretKey' => array(
						'type'     => 'string',
						'required' => false,
					),
				),
			)
		);

		register_rest_route(
			'nexulesuite_/v1',
			'/forms',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_forms' ),
				'permission_callback' => array( $this, 'can_manage_settings' ),
			)
		);

		register_rest_route(
			'nexulesuite_/v1',
			'/forms',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'save_forms' ),
				'permission_callback' => array( $this, 'can_manage_settings' ),
				'args'                => array(
					'payload' => array(
						'type'     => 'object',
						'required' => true,
					),
				),
			)
		);

		register_rest_route(
			'nexulesuite_/v1',
			'/forms/global-appearance',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_global_appearance' ),
				'permission_callback' => array( $this, 'can_manage_settings' ),
			)
		);

		register_rest_route(
			'nexulesuite_/v1',
			'/forms/global-appearance',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'save_global_appearance' ),
				'permission_callback' => array( $this, 'can_manage_settings' ),
				'args'                => array(
					'styling' => array(
						'type'     => 'object',
						'required' => true,
					),
				),
			)
		);

		register_rest_route(
			'nexulesuite_/v1',
			'/smtp/settings',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_smtp_settings' ),
				'permission_callback' => array( $this, 'can_manage_settings' ),
			)
		);

		register_rest_route(
			'nexulesuite_/v1',
			'/smtp/settings',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'save_smtp_settings' ),
				'permission_callback' => array( $this, 'can_manage_settings' ),
				'args'                => array(
					'settings' => array(
						'type'     => 'object',
						'required' => true,
					),
				),
			)
		);

		register_rest_route(
			'nexulesuite_/v1',
			'/smtp/test',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'smtp_send_test_email' ),
				'permission_callback' => array( $this, 'can_manage_settings' ),
				'args'                => array(
					'to'   => array(
						'type'              => 'string',
						'required'          => true,
						'sanitize_callback' => 'sanitize_email',
					),
					'html' => array(
						'type'     => 'boolean',
						'required' => false,
						'default'  => true,
					),
				),
			)
		);

		register_rest_route(
			'nexulesuite_/v1',
			'/emails/templates',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_email_templates' ),
				'permission_callback' => array( $this, 'can_manage_settings' ),
			)
		);

		register_rest_route(
			'nexulesuite_/v1',
			'/emails/templates',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'save_email_templates' ),
				'permission_callback' => array( $this, 'can_manage_settings' ),
				'args'                => array(
					'templates' => array(
						'type'     => 'array',
						'required' => true,
					),
					'contentEncoding' => array(
						'type'              => 'string',
						'required'          => false,
						'sanitize_callback' => 'sanitize_text_field',
					),
				),
			)
		);

		register_rest_route(
			'nexulesuite_/v1',
			'/menu-items',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_menu_items' ),
				'permission_callback' => array( $this, 'can_manage_settings' ),
			)
		);

		register_rest_route(
			'nexulesuite_/v1',
			'/menu-items',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'save_menu_items' ),
				'permission_callback' => array( $this, 'can_manage_settings' ),
				'args'                => array(
					'groups' => array(
						'type'     => 'array',
						'required' => false,
					),
					'items' => array(
						'type'     => 'array',
						'required' => false,
					),
					'globalFontSize' => array(
						'type'              => 'integer',
						'required'          => false,
						'sanitize_callback' => 'absint',
					),
				),
			)
		);

		register_rest_route(
			'nexulesuite_/v1',
			'/menu-items/content-search',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'search_menu_content' ),
				'permission_callback' => array( $this, 'can_manage_settings' ),
				'args'                => array(
					'search' => array(
						'type'              => 'string',
						'required'          => false,
						'sanitize_callback' => 'sanitize_text_field',
					),
					'types' => array(
						'type'              => 'string',
						'required'          => false,
						'sanitize_callback' => 'sanitize_text_field',
					),
				),
			)
		);

		register_rest_route(
			'nexulesuite_/v1',
			'/menu-items/condition-meta',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_menu_condition_meta' ),
				'permission_callback' => array( $this, 'can_manage_settings' ),
			)
		);

		register_rest_route(
			'nexulesuite_/v1',
			'/popups',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_popups' ),
				'permission_callback' => array( $this, 'can_manage_settings' ),
			)
		);

		register_rest_route(
			'nexulesuite_/v1',
			'/popups',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'save_popups' ),
				'permission_callback' => array( $this, 'can_manage_settings' ),
				'args'                => array(
					'popups' => array(
						'type'     => 'array',
						'required' => true,
					),
				),
			)
		);

		register_rest_route(
			'nexulesuite_/v1',
			'/reports/activities/list',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'list_activities_report' ),
				'permission_callback' => array( $this, 'can_access_reports_rest' ),
				'args'                => array(
					'token'    => array(
						'type'              => 'string',
						'required'          => false,
						'sanitize_callback' => 'sanitize_text_field',
					),
					'tab'      => array(
						'type'              => 'string',
						'required'          => false,
						'sanitize_callback' => 'sanitize_text_field',
					),
					'dateFrom' => array(
						'type'              => 'string',
						'required'          => false,
						'sanitize_callback' => 'sanitize_text_field',
					),
					'dateTo'   => array(
						'type'              => 'string',
						'required'          => false,
						'sanitize_callback' => 'sanitize_text_field',
					),
					'search'   => array(
						'type'              => 'string',
						'required'          => false,
						'sanitize_callback' => 'sanitize_text_field',
					),
				),
			)
		);

		register_rest_route(
			'nexulesuite_/v1',
			'/reports/activities/clear',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'clear_activities_report' ),
				'permission_callback' => array( $this, 'can_manage_settings' ),
			)
		);

		register_rest_route(
			'nexulesuite_/v1',
			'/reports/activities/pdf',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'generate_activities_pdf' ),
				'permission_callback' => array( $this, 'can_access_reports_rest' ),
				'args'                => array(
					'token'    => array(
						'type'              => 'string',
						'required'          => false,
						'sanitize_callback' => 'sanitize_text_field',
					),
					'tab'      => array(
						'type'              => 'string',
						'required'          => false,
						'sanitize_callback' => 'sanitize_text_field',
					),
					'dateFrom'  => array(
						'type'              => 'string',
						'required'          => false,
						'sanitize_callback' => 'sanitize_text_field',
					),
					'dateTo'    => array(
						'type'              => 'string',
						'required'          => false,
						'sanitize_callback' => 'sanitize_text_field',
					),
					'search'   => array(
						'type'              => 'string',
						'required'          => false,
						'sanitize_callback' => 'sanitize_text_field',
					),
					'rows'     => array(
						'type'     => 'array',
						'required' => false,
					),
					'sections' => array(
						'type'     => 'array',
						'required' => false,
					),
				),
			)
		);

		register_rest_route(
			'nexulesuite_/v1',
			'/reports/combined/pdf',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'generate_activities_pdf' ),
				'permission_callback' => array( $this, 'can_access_reports_rest' ),
				'args'                => array(
					'token'    => array(
						'type'              => 'string',
						'required'          => false,
						'sanitize_callback' => 'sanitize_text_field',
					),
					'tab'      => array(
						'type'              => 'string',
						'required'          => false,
						'sanitize_callback' => 'sanitize_text_field',
					),
					'dateFrom' => array(
						'type'              => 'string',
						'required'          => false,
						'sanitize_callback' => 'sanitize_text_field',
					),
					'dateTo'   => array(
						'type'              => 'string',
						'required'          => false,
						'sanitize_callback' => 'sanitize_text_field',
					),
					'search'   => array(
						'type'              => 'string',
						'required'          => false,
						'sanitize_callback' => 'sanitize_text_field',
					),
					'sections' => array(
						'type'     => 'array',
						'required' => false,
					),
				),
			)
		);

		register_rest_route(
			'nexulesuite_/v1',
			'/reports/activities/email',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'send_activities_email' ),
				'permission_callback' => array( $this, 'can_access_reports_rest' ),
				'args'                => array(
					'token'      => array(
						'type'              => 'string',
						'required'          => false,
						'sanitize_callback' => 'sanitize_text_field',
					),
					'tab'        => array(
						'type'              => 'string',
						'required'          => false,
						'sanitize_callback' => 'sanitize_text_field',
					),
					'dateFrom'    => array(
						'type'              => 'string',
						'required'          => false,
						'sanitize_callback' => 'sanitize_text_field',
					),
					'dateTo'      => array(
						'type'              => 'string',
						'required'          => false,
						'sanitize_callback' => 'sanitize_text_field',
					),
					'search'      => array(
						'type'              => 'string',
						'required'          => false,
						'sanitize_callback' => 'sanitize_text_field',
					),
					'rows'        => array(
						'type'     => 'array',
						'required' => false,
					),
					'recipients'  => array(
						'type'     => 'array',
						'required' => false,
					),
					'customMessage' => array(
						'type'              => 'string',
						'required'          => false,
						'sanitize_callback' => 'sanitize_textarea_field',
					),
				),
			)
		);

		register_rest_route(
			'nexulesuite_/v1',
			'/track/events',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'receive_track_events' ),
				'permission_callback' => '__return_true',
				'args'                => array(
					'nonce'  => array(
						'type'              => 'string',
						'required'          => false,
						'sanitize_callback' => 'sanitize_text_field',
					),
					'events' => array(
						'type'     => 'array',
						'required' => false,
					),
				),
			)
		);

		/* ── AI Chatbot (RAG) ── */
		register_rest_route(
			'nexulesuite_/v1',
			'/ai/test',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'ai_test_connection' ),
				'permission_callback' => array( $this, 'can_manage_settings' ),
			)
		);

		register_rest_route(
			'nexulesuite_/v1',
			'/ai/train',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'ai_train' ),
				'permission_callback' => array( $this, 'can_manage_settings' ),
				'args'                => array(
					'offset' => array(
						'type'              => 'integer',
						'required'          => false,
						'sanitize_callback' => 'absint',
					),
					'limit'  => array(
						'type'              => 'integer',
						'required'          => false,
						'sanitize_callback' => 'absint',
					),
					'reset'  => array(
						'type'     => 'boolean',
						'required' => false,
					),
				),
			)
		);

		register_rest_route(
			'nexulesuite_/v1',
			'/ai/reset',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'ai_reset' ),
				'permission_callback' => array( $this, 'can_manage_settings' ),
			)
		);

		register_rest_route(
			'nexulesuite_/v1',
			'/ai/chat',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'ai_chat' ),
				'permission_callback' => '__return_true',
				'args'                => array(
					'nonce'   => array(
						'type'              => 'string',
						'required'          => false,
						'sanitize_callback' => 'sanitize_text_field',
					),
					'message' => array(
						'type'     => 'string',
						'required' => false,
					),
					'history' => array(
						'type'     => 'array',
						'required' => false,
					),
					'image'   => array(
						'type'     => 'string',
						'required' => false,
					),
				),
			)
		);

		register_rest_route(
			'nexulesuite_/v1',
			'/ai/lead',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'ai_lead' ),
				'permission_callback' => '__return_true',
				'args'                => array(
					'nonce'      => array( 'type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_text_field' ),
					'name'       => array( 'type' => 'string', 'required' => false ),
					'email'      => array( 'type' => 'string', 'required' => false ),
					'phone'      => array( 'type' => 'string', 'required' => false ),
					'message'    => array( 'type' => 'string', 'required' => false ),
					'page_url'   => array( 'type' => 'string', 'required' => false ),
					'session_id' => array( 'type' => 'string', 'required' => false ),
				),
			)
		);

		register_rest_route(
			'nexulesuite_/v1',
			'/ai/logs',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'ai_logs_report' ),
				'permission_callback' => array( $this, 'can_manage_settings' ),
				'args'                => array(
					'dateFrom' => array(
						'type'              => 'string',
						'required'          => false,
						'sanitize_callback' => 'sanitize_text_field',
					),
					'dateTo'   => array(
						'type'              => 'string',
						'required'          => false,
						'sanitize_callback' => 'sanitize_text_field',
					),
					'search'   => array(
						'type'              => 'string',
						'required'          => false,
						'sanitize_callback' => 'sanitize_text_field',
					),
				),
			)
		);

		register_rest_route(
			'nexulesuite_/v1',
			'/ai/logs/detail',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'ai_logs_detail' ),
				'permission_callback' => array( $this, 'can_manage_settings' ),
				'args'                => array(
					'session' => array(
						'type'              => 'string',
						'required'          => true,
						'sanitize_callback' => 'sanitize_text_field',
					),
				),
			)
		);

		register_rest_route(
			'nexulesuite_/v1',
			'/ai/logs/clear',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'ai_logs_clear' ),
				'permission_callback' => array( $this, 'can_manage_settings' ),
			)
		);

		register_rest_route(
			'nexulesuite_/v1',
			'/ai/faq',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( $this, 'get_ai_faq' ),
					'permission_callback' => array( $this, 'can_manage_settings' ),
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( $this, 'save_ai_faq' ),
					'permission_callback' => array( $this, 'can_manage_settings' ),
					'args'                => array(
						'enabled'      => array(
							'type'     => 'boolean',
							'required' => false,
						),
						'logChats'     => array(
							'type'     => 'boolean',
							'required' => false,
						),
						'items'        => array(
							'type'     => 'array',
							'required' => false,
						),
						'actions'      => array(
							'type'     => 'array',
							'required' => false,
						),
						'disclaimer'    => array(
							'type'              => 'string',
							'required'          => false,
							'sanitize_callback' => 'sanitize_textarea_field',
						),
						'triggerLabel'  => array(
							'type'              => 'string',
							'required'          => false,
							'sanitize_callback' => 'sanitize_text_field',
						),
						'leadEnabled'   => array( 'type' => 'boolean', 'required' => false ),
						'leadOffer'     => array( 'type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_text_field' ),
						'leadRecipient' => array( 'type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_text_field' ),
						'wooCards'         => array( 'type' => 'boolean', 'required' => false ),
						'extraUrls'        => array( 'type' => 'string', 'required' => false ),
						'contactShortcode' => array( 'type' => 'string', 'required' => false ),
						'examples'         => array( 'type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_textarea_field' ),
					),
				),
			)
		);

		register_rest_route(
			'nexulesuite_/v1',
			'/ai/autogen',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'ai_autogen' ),
				'permission_callback' => array( $this, 'can_manage_settings' ),
			)
		);

		register_rest_route(
			'nexulesuite_/v1',
			'/ai/autogen/apply',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'ai_autogen_apply' ),
				'permission_callback' => array( $this, 'can_manage_settings' ),
				'args'                => array(
					'applyPrompt'    => array( 'type' => 'boolean', 'required' => false ),
					'applyQuestions' => array( 'type' => 'boolean', 'required' => false ),
					'applyActions'   => array( 'type' => 'boolean', 'required' => false ),
					'systemPrompt'   => array( 'type' => 'string', 'required' => false ),
					'questions'      => array( 'type' => 'array', 'required' => false ),
					'actions'        => array( 'type' => 'array', 'required' => false ),
				),
			)
		);

		register_rest_route(
			'nexulesuite_/v1',
			'/visual-editor/toggle',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'visual_editor_toggle' ),
				'permission_callback' => array( $this, 'can_manage_settings' ),
				'args'                => array(
					'enabled' => array(
						'type'              => 'boolean',
						'required'          => true,
						'sanitize_callback' => static function ( $v ) {
							return (bool) $v;
						},
					),
				),
			)
		);

		register_rest_route(
			'nexulesuite_/v1',
			'/visual-editor/update',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'visual_editor_update_post_content' ),
				'permission_callback' => array( $this, 'can_manage_settings' ),
				'args'                => array(
					'postId'       => array(
						'type'              => 'integer',
						'required'          => true,
						'sanitize_callback' => 'absint',
					),
					'originalHtml' => array(
						'type'     => 'string',
						'required' => true,
					),
					'attributes'   => array(
						'type'     => 'object',
						'required' => false,
					),
					'wrapWithLink' => array(
						'type'              => 'boolean',
						'required'          => false,
						'sanitize_callback' => static function ( $v ) {
							return (bool) $v;
						},
					),
					'selectorPath' => array(
						'type'              => 'string',
						'required'          => false,
						'sanitize_callback' => static function ( $v ) {
							$s = is_string( $v ) ? $v : '';
							$s = preg_replace( '/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $s );
							$s = trim( $s );
							if ( strlen( $s ) > 3000 ) {
								$s = substr( $s, 0, 3000 );
							}
							return $s;
						},
					),
					'tagName'      => array(
						'type'              => 'string',
						'required'          => false,
						'sanitize_callback' => static function ( $v ) {
							$t = strtolower( preg_replace( '/[^a-z0-9]/i', '', is_string( $v ) ? $v : '' ) );
							return strlen( $t ) > 20 ? substr( $t, 0, 20 ) : $t;
						},
					),
				),
			)
		);
	}

	/**
	 * Visual Editor: toggles the frontend overlay via cookie.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response
	 */
	public function visual_editor_toggle( \WP_REST_Request $request ): \WP_REST_Response {
		$enabled = (bool) $request->get_param( 'enabled' );

		$secure   = is_ssl();
		$httponly = true;
		$domain   = defined( 'COOKIE_DOMAIN' ) ? COOKIE_DOMAIN : '';
		$path     = defined( 'COOKIEPATH' ) ? COOKIEPATH : '/';

		$name    = 'nexulesuite_ve';
		$value   = $enabled ? '1' : '';
		$expires = $enabled ? ( time() + DAY_IN_SECONDS ) : ( time() - DAY_IN_SECONDS );

		setcookie( $name, $value, $expires, $path, $domain, $secure, $httponly );
		if ( defined( 'SITECOOKIEPATH' ) && SITECOOKIEPATH !== $path ) {
			setcookie( $name, $value, $expires, SITECOOKIEPATH, $domain, $secure, $httponly );
		}
		if ( $enabled ) {
			$_COOKIE[ $name ] = '1';
		} else {
			unset( $_COOKIE[ $name ] );
		}

		return rest_ensure_response(
			array(
				'success' => true,
				'data'    => array(
					'enabled' => $enabled,
				),
			)
		);
	}

	/**
	 * Parses a snippet of HTML and returns the first element child (client outerHTML).
	 *
	 * @param string $html Raw HTML fragment.
	 * @return \DOMElement|null
	 */
	private function ve_parse_client_fragment_root( string $html ): ?\DOMElement {
		$libxml = libxml_use_internal_errors( true );
		$frag   = new \DOMDocument();
		$rid    = 'nexulesuite_ve-' . preg_replace( '/[^a-z0-9]/i', '', (string) wp_generate_password( 10, false, false ) );
		if ( '' === $rid ) {
			$rid = 'nexulesuite_ve-root';
		}
		$wrapped = '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><div id="' . esc_attr( $rid ) . '">' . $html . '</div></body></html>';
		if ( ! $frag->loadHTML( $wrapped, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD ) ) {
			libxml_clear_errors();
			libxml_use_internal_errors( $libxml );
			return null;
		}
		$xp = new \DOMXPath( $frag );
		$w  = $xp->query( '//*[@id="' . $rid . '"]' )->item( 0 );
		if ( ! ( $w instanceof \DOMElement ) ) {
			libxml_clear_errors();
			libxml_use_internal_errors( $libxml );
			return null;
		}
		foreach ( $w->childNodes as $child ) {
			if ( $child instanceof \DOMElement ) {
				libxml_clear_errors();
				libxml_use_internal_errors( $libxml );
				return $child;
			}
		}
		libxml_clear_errors();
		libxml_use_internal_errors( $libxml );
		return null;
	}

	/**
	 * Normalized attribute map (lowercase names, trimmed values).
	 *
	 * @param \DOMElement $el Element.
	 * @return array<string, string>
	 */
	private function ve_attrs_array( \DOMElement $el ): array {
		$attrs = array();
		if ( $el->hasAttributes() ) {
			foreach ( $el->attributes as $attr ) {
				if ( ! ( $attr instanceof \DOMAttr ) ) {
					continue;
				}
				$n = strtolower( $attr->name );
				$attrs[ $n ] = trim( preg_replace( '/\s+/u', ' ', (string) $attr->value ) );
			}
		}
		ksort( $attrs, SORT_STRING );
		return $attrs;
	}

	/**
	 * Normalized serialized inner markup (child nodes only).
	 *
	 * @param \DOMDocument $owner Owner document.
	 * @param \DOMElement  $el    Element.
	 * @return string
	 */
	private function ve_inner_savehtml_normalized( \DOMDocument $owner, \DOMElement $el ): string {
		$inner = '';
		foreach ( $el->childNodes as $child ) {
			$inner .= $owner->saveHTML( $child );
		}
		$inner = trim( (string) $inner );
		$inner = preg_replace( '/\x{00A0}/u', ' ', $inner );
		$inner = is_string( $inner ) ? preg_replace( '#>\s+<#u', '><', $inner ) : '';
		$inner = is_string( $inner ) ? trim( preg_replace( '/\s+/u', ' ', $inner ) ) : '';
		return (string) $inner;
	}

	/**
	 * Strict signature: tag + attrs + inner saveHTML (libxml) — fails when browser vs libxml inner differs (e.g. SVG).
	 *
	 * @param \DOMElement $el Element (from any document).
	 * @return string
	 */
	private function ve_element_signature( \DOMElement $el ): string {
		$owner = $el->ownerDocument;
		if ( ! ( $owner instanceof \DOMDocument ) ) {
			return '';
		}
		$tag   = strtolower( $el->tagName );
		$attrs = $this->ve_attrs_array( $el );
		$inner = $this->ve_inner_savehtml_normalized( $owner, $el );
		return $tag . "\0" . wp_json_encode( $attrs, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES ) . "\0" . $inner;
	}

	/**
	 * Loose signature: tag + attrs + visible text only (ignores inner HTML shape).
	 *
	 * @param \DOMElement $el Element.
	 * @return string
	 */
	private function ve_element_loose_signature( \DOMElement $el ): string {
		$tag   = strtolower( $el->tagName );
		$attrs = $this->ve_attrs_array( $el );
		$text  = $el->textContent;
		$text  = is_string( $text ) ? trim( preg_replace( '/\s+/u', ' ', $text ) ) : '';
		return $tag . "\0" . wp_json_encode( $attrs, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES ) . "\0" . $text;
	}

	/**
	 * Tag + attributes only (no inner), for unique-element fallback.
	 *
	 * @param \DOMElement $el Element.
	 * @return string
	 */
	private function ve_element_attrs_only_signature( \DOMElement $el ): string {
		$tag   = strtolower( $el->tagName );
		$attrs = $this->ve_attrs_array( $el );
		return $tag . "\0" . wp_json_encode( $attrs, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES );
	}

	/**
	 * Finds the first post_content node that matches the client's original outerHTML.
	 *
	 * @param \DOMDocument $doc Parsed post content document.
	 * @param \DOMXPath    $xpath XPath bound to $doc.
	 * @param \DOMElement  $content_root Wrapper containing post HTML.
	 * @param string       $original_html Client outerHTML (before edits).
	 * @return \DOMElement|null
	 */
	private function ve_find_element_for_original_html( \DOMDocument $doc, \DOMXPath $xpath, \DOMElement $content_root, string $original_html ): ?\DOMElement {
		$needle = preg_replace( '/\s+/', ' ', trim( $original_html ) );
		$needle = is_string( $needle ) ? trim( $needle ) : trim( $original_html );

		$nodes = $xpath->query( './/*', $content_root );
		if ( ! ( $nodes instanceof \DOMNodeList ) ) {
			return null;
		}

		// 1) Exact string match after whitespace collapse (legacy).
		foreach ( $nodes as $node ) {
			if ( ! ( $node instanceof \DOMElement ) ) {
				continue;
			}
			$node_html = $doc->saveHTML( $node );
			if ( ! is_string( $node_html ) || '' === $node_html ) {
				continue;
			}
			$hay = preg_replace( '/\s+/', ' ', trim( $node_html ) );
			if ( $hay === $needle ) {
				return $node;
			}
		}

		// 2) Structural signature (browser outerHTML vs libxml saveHTML differences).
		$client_el = $this->ve_parse_client_fragment_root( $original_html );
		if ( ! ( $client_el instanceof \DOMElement ) ) {
			return null;
		}
		$want_sig = $this->ve_element_signature( $client_el );
		if ( '' !== $want_sig ) {
			foreach ( $nodes as $node ) {
				if ( ! ( $node instanceof \DOMElement ) ) {
					continue;
				}
				if ( $this->ve_element_signature( $node ) === $want_sig ) {
					return $node;
				}
			}
		}

		// 3) Loose: same tag + attrs + textContent (inner HTML shape may differ, e.g. SVG icons).
		$want_loose = $this->ve_element_loose_signature( $client_el );
		if ( '' !== $want_loose ) {
			foreach ( $nodes as $node ) {
				if ( ! ( $node instanceof \DOMElement ) ) {
					continue;
				}
				if ( $this->ve_element_loose_signature( $node ) === $want_loose ) {
					return $node;
				}
			}
		}

		// 4) Unique tag+attrs only (single candidate in this post_content tree).
		$want_attrs = $this->ve_element_attrs_only_signature( $client_el );
		if ( '' !== $want_attrs ) {
			$hit = null;
			$n   = 0;
			foreach ( $nodes as $node ) {
				if ( ! ( $node instanceof \DOMElement ) ) {
					continue;
				}
				if ( $this->ve_element_attrs_only_signature( $node ) === $want_attrs ) {
					++$n;
					$hit = $node;
				}
			}
			if ( 1 === $n && $hit instanceof \DOMElement ) {
				return $hit;
			}
		}

		return null;
	}

	/**
	 * Sanitize HTML id attribute (not the same rules as CSS classes).
	 *
	 * @param string $id Raw id.
	 * @return string
	 */
	private function ve_sanitize_dom_id( string $id ): string {
		$id = trim( wp_strip_all_tags( $id ) );
		$id = preg_replace( '/\s+/', '', $id );
		if ( strlen( $id ) > 200 ) {
			return substr( $id, 0, 200 );
		}
		return $id;
	}

	/**
	 * Saves a DOM patch for elements outside post_content (applied on the frontend via JS).
	 *
	 * @param int    $post_id         Post ID.
	 * @param string $selector_path CSS selector path from the client.
	 * @param string $tag_name        Lowercase tag name.
	 * @param string $class           Final class string (empty removes).
	 * @param string $id              Final id (empty removes).
	 * @param string $href            Final href (empty removes on anchors).
	 * @param bool   $wrap_with_link  Whether to wrap non-anchor with <a href>.
	 * @return void
	 */
	private function ve_persist_dom_patch( int $post_id, string $selector_path, string $tag_name, string $class, string $id, string $href, bool $wrap_with_link ): void {
		$patches = get_post_meta( $post_id, self::VE_DOM_PATCHES_META_KEY, true );
		if ( ! is_array( $patches ) ) {
			$patches = array();
		}
		$key            = md5( $selector_path . "\n" . $tag_name );
		$patches[ $key ] = array(
			'selector' => $selector_path,
			'tag'      => $tag_name,
			'class'    => $class,
			'idAttr'   => $id,
			'href'     => $href,
			'wrap'     => $wrap_with_link ? 1 : 0,
			't'        => time(),
		);
		update_post_meta( $post_id, self::VE_DOM_PATCHES_META_KEY, $patches );
	}

	/**
	 * Removes stored DOM patches targeting the same selector (after a successful post_content save).
	 *
	 * @param int    $post_id         Post ID.
	 * @param string $selector_path Selector path.
	 * @return void
	 */
	private function ve_clear_dom_patches_for_selector( int $post_id, string $selector_path ): void {
		$selector_path = trim( $selector_path );
		if ( '' === $selector_path ) {
			return;
		}
		$patches = get_post_meta( $post_id, self::VE_DOM_PATCHES_META_KEY, true );
		if ( ! is_array( $patches ) ) {
			return;
		}
		foreach ( $patches as $k => $row ) {
			if ( is_array( $row ) && isset( $row['selector'] ) && (string) $row['selector'] === $selector_path ) {
				unset( $patches[ $k ] );
			}
		}
		if ( array() === $patches ) {
			delete_post_meta( $post_id, self::VE_DOM_PATCHES_META_KEY );
		} else {
			update_post_meta( $post_id, self::VE_DOM_PATCHES_META_KEY, $patches );
		}
	}

	/**
	 * Strips Visual Editor hover artifacts from client outerHTML before post_content matching.
	 *
	 * @param string $html Client outerHTML snapshot.
	 * @return string
	 */
	private function ve_normalize_client_outer_html( string $html ): string {
		$html = trim( $html );
		if ( '' === $html ) {
			return '';
		}

		$el = $this->ve_parse_client_fragment_root( $html );
		if ( ! ( $el instanceof \DOMElement ) ) {
			$html = preg_replace( '/\sdata-nexulesuite_ve-hover=(["\'])1\1/i', '', $html );
			$html = is_string( $html ) ? preg_replace( '/\soutline(-offset)?:\s*[^;"\']+;?/i', '', $html ) : '';
			return is_string( $html ) ? trim( $html ) : '';
		}

		$el->removeAttribute( 'data-nexulesuite_ve-hover' );
		if ( $el->hasAttribute( 'style' ) ) {
			$style = (string) $el->getAttribute( 'style' );
			$style = preg_replace( '/\s*outline(-offset)?:\s*[^;]+;?/i', '', $style );
			$style = trim( preg_replace( '/\s+/', ' ', (string) $style ) );
			if ( '' === $style ) {
				$el->removeAttribute( 'style' );
			} else {
				$el->setAttribute( 'style', $style );
			}
		}

		$owner = $el->ownerDocument;
		if ( $owner instanceof \DOMDocument ) {
			$out = $owner->saveHTML( $el );
			return is_string( $out ) ? trim( $out ) : $html;
		}

		return $html;
	}

	/**
	 * Visual Editor: updates a matching element in post_content using DOMDocument.
	 *
	 * Match strategy:
	 * - Client submits the element's original outerHTML (before edits).
	 * - Server finds the first matching node: exact serialized HTML (legacy), then canonical
	 *   tag+attributes+inner signature so browser outerHTML matches libxml saveHTML output.
	 * - If not found but selectorPath + tagName are sent, stores a per-post DOM patch (theme/header/builders).
	 *
	 * Editor values for class, id, and href always replace prior values on the matched element.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function visual_editor_update_post_content( \WP_REST_Request $request ) {
		$post_id = absint( $request->get_param( 'postId' ) );
		if ( $post_id <= 0 ) {
			return new \WP_Error( 'nexulesuite_ve_bad_post', 'Invalid postId.', array( 'status' => 400 ) );
		}

		$post = get_post( $post_id );
		if ( ! $post || ! isset( $post->post_content ) ) {
			return new \WP_Error( 'nexulesuite_ve_missing_post', 'Post not found.', array( 'status' => 404 ) );
		}

		$original_html = (string) $request->get_param( 'originalHtml' );
		$original_html = trim( $original_html );
		if ( '' === $original_html ) {
			return new \WP_Error( 'nexulesuite_ve_bad_html', 'Missing originalHtml.', array( 'status' => 400 ) );
		}
		$original_html = $this->ve_normalize_client_outer_html( $original_html );

		$attrs = $request->get_param( 'attributes' );
		$attrs = is_array( $attrs ) ? $attrs : array();

		$class = isset( $attrs['class'] ) ? sanitize_text_field( (string) $attrs['class'] ) : '';
		$id    = isset( $attrs['id'] ) ? $this->ve_sanitize_dom_id( (string) $attrs['id'] ) : '';
		$href  = isset( $attrs['href'] ) ? esc_url_raw( (string) $attrs['href'] ) : '';

		$wrap_with_link = (bool) $request->get_param( 'wrapWithLink' );

		$selector_path = (string) $request->get_param( 'selectorPath' );
		$selector_path = trim( $selector_path );
		if ( strlen( $selector_path ) > 3000 ) {
			$selector_path = substr( $selector_path, 0, 3000 );
		}

		$tag_name = (string) $request->get_param( 'tagName' );
		$tag_name = strtolower( preg_replace( '/[^a-z0-9]/i', '', $tag_name ) );
		if ( strlen( $tag_name ) > 20 ) {
			$tag_name = substr( $tag_name, 0, 20 );
		}

		$content     = (string) $post->post_content;
		$has_content = '' !== trim( $content );

		if ( ! $has_content && ( '' === $selector_path || '' === $tag_name ) ) {
			return new \WP_Error( 'nexulesuite_ve_empty', 'Post content is empty and no selector was provided.', array( 'status' => 400 ) );
		}

		$libxml_prev = libxml_use_internal_errors( true );
		$found       = null;
		$doc         = null;
		$xpath       = null;
		$root        = null;

		if ( $has_content ) {
			$doc = new \DOMDocument();
			$wrapper_id = 'nexulesuite_ve-wrapper';
			$html       = '<!doctype html><html><head><meta charset="utf-8"></head><body><div id="' . esc_attr( $wrapper_id ) . '">' . $content . '</div></body></html>';

			$loaded = $doc->loadHTML( $html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD );
			if ( false === $loaded ) {
				libxml_clear_errors();
				libxml_use_internal_errors( $libxml_prev );
				return new \WP_Error( 'nexulesuite_ve_parse_failed', 'Failed to parse HTML.', array( 'status' => 500 ) );
			}

			$xpath = new \DOMXPath( $doc );
			$root  = $xpath->query( '//*[@id="' . $wrapper_id . '"]' );
			$root  = ( $root instanceof \DOMNodeList && $root->length > 0 ) ? $root->item( 0 ) : null;
			if ( ! ( $root instanceof \DOMElement ) ) {
				libxml_clear_errors();
				libxml_use_internal_errors( $libxml_prev );
				return new \WP_Error( 'nexulesuite_ve_root_missing', 'Root wrapper missing.', array( 'status' => 500 ) );
			}

			$found = $this->ve_find_element_for_original_html( $doc, $xpath, $root, $original_html );
		}

		if ( ! ( $found instanceof \DOMElement ) ) {
			libxml_clear_errors();
			libxml_use_internal_errors( $libxml_prev );
			if ( '' !== $selector_path && '' !== $tag_name ) {
				$this->ve_persist_dom_patch( $post_id, $selector_path, $tag_name, $class, $id, $href, $wrap_with_link );
				return rest_ensure_response(
					array(
						'success' => true,
						'data'    => array(
							'postId' => $post_id,
							'mode'   => 'post_meta',
						),
					)
				);
			}
			return new \WP_Error(
				'nexulesuite_ve_not_found',
				'Could not locate the selected element in this page\'s editor HTML (post_content). Send a valid selectorPath + tagName to save theme/header elements as a page-level patch, or edit inside the post body.',
				array( 'status' => 409 )
			);
		}

		// Final values from the editor replace any previous class / id / link on this node.
		if ( '' !== $class ) {
			$found->setAttribute( 'class', $class );
		} else {
			$found->removeAttribute( 'class' );
		}
		if ( '' !== $id ) {
			$found->setAttribute( 'id', $id );
		} else {
			$found->removeAttribute( 'id' );
		}

		$tag = strtolower( $found->tagName );
		if ( '' !== $href ) {
			if ( 'a' === $tag ) {
				$found->setAttribute( 'href', $href );
			} elseif ( $wrap_with_link ) {
				$a = $doc->createElement( 'a' );
				$a->setAttribute( 'href', $href );
				$a->setAttribute( 'rel', 'noopener' );
				$a->setAttribute( 'target', '_self' );
				$found->parentNode->replaceChild( $a, $found );
				$a->appendChild( $found );
			}
		} else {
			if ( 'a' === $tag ) {
				$found->removeAttribute( 'href' );
			}
		}

		$out = '';
		foreach ( $root->childNodes as $child ) {
			$out .= $doc->saveHTML( $child );
		}

		libxml_clear_errors();
		libxml_use_internal_errors( $libxml_prev );

		$updated = wp_update_post(
			array(
				'ID'           => $post_id,
				'post_content' => $out,
			),
			true
		);

		if ( is_wp_error( $updated ) ) {
			return $updated;
		}

		if ( '' !== $selector_path ) {
			$this->ve_clear_dom_patches_for_selector( $post_id, $selector_path );
		}

		return rest_ensure_response(
			array(
				'success' => true,
				'data'    => array(
					'postId' => $post_id,
					'mode'   => 'post_content',
				),
			)
		);
	}

	/**
	 * Returns Accessibility & Language settings.
	 *
	 * @return \WP_REST_Response
	 */
	public function get_accessibility_language_settings(): \WP_REST_Response {
		require_once nexulesuite_PLUGIN_DIR . 'public/class-accessibility-language.php';
		$settings = \nexulesuite_\Public\Accessibility_Language::get_settings();
		$catalog  = \nexulesuite_\Public\Accessibility_Language::language_catalog();
		$langs    = array();
		foreach ( $catalog as $code => $meta ) {
			$langs[] = array(
				'code'  => $code,
				'label' => $meta['label'],
				'flag'  => $meta['flag'],
			);
		}

		/* Live Chat master switch lives in general settings (default off). */
		$general = get_option( self::GENERAL_SETTINGS_OPTION_KEY, array() );
		if ( ! is_array( $general ) ) {
			$general = array();
		}
		$settings['enableLivechat'] = ! empty( $general['enableLivechat'] );

		return new \WP_REST_Response(
			array(
				'settings'  => $settings,
				'catalog'   => $langs,
			),
			200
		);
	}

	/**
	 * Saves Accessibility & Language settings.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function save_accessibility_language_settings( \WP_REST_Request $request ) {
		require_once nexulesuite_PLUGIN_DIR . 'public/class-accessibility-language.php';
		$input = $request->get_param( 'settings' );
		if ( ! is_array( $input ) ) {
			return new \WP_Error( 'invalid_settings', __( 'Invalid settings payload.', 'nexus-lead-suite' ), array( 'status' => 400 ) );
		}

		$clean = \nexulesuite_\Public\Accessibility_Language::sanitize( $input );
		update_option( \nexulesuite_\Public\Accessibility_Language::OPTION_KEY, $clean, false );

		$general = get_option( self::GENERAL_SETTINGS_OPTION_KEY, array() );
		if ( ! is_array( $general ) ) {
			$general = array();
		}

		/* Master livechat switch (default off) — only when the Live Chat UI sends the key. */
		if ( array_key_exists( 'enableLivechat', $input ) ) {
			$general['enableLivechat'] = ! empty( $input['enableLivechat'] );
		}

		/* Keep livechat panel/trigger avatar in sync with dock button image. */
		if ( ! empty( $clean['liveChatButtonImage'] ) ) {
			$general['chatButtonImage'] = (string) $clean['liveChatButtonImage'];
		}

		update_option( self::GENERAL_SETTINGS_OPTION_KEY, $general, false );

		$clean['enableLivechat'] = ! empty( $general['enableLivechat'] );

		return new \WP_REST_Response(
			array(
				'success'  => true,
				'settings' => $clean,
			),
			200
		);
	}

	/**
	 * Returns persisted general plugin settings.
	 *
	 * @return \WP_REST_Response
	 */
	public function get_general_settings(): \WP_REST_Response {
		$opt = get_option( self::GENERAL_SETTINGS_OPTION_KEY, array() );
		if ( ! is_array( $opt ) ) {
			$opt = array();
		}

		$defaults = array(
			'enableNavigation'      => false,
			'selectedEmailTemplate' => '',
			'allowClientAccess'     => false,
			'tokenTTL'              => '5',
			'globalFont'            => 'Inter',
			'enableAutoPopup'       => false,
			'activityButtonClasses' => '',
			'excludePosts'          => array(),
			'excludePages'          => array(),
			'enableLivechat'        => false,
			'chatButtonImage'       => '',
			'chatTitle'             => 'Customer Support',
			'chatBadge'             => 'Online',
			'chatContent'           => 'Hello! How can we help you today?',
			'chatFormButton'        => '',
			'chatFormButtonLink'    => '',
			'chatButtonTwo'         => '',
			'chatButtonTwoLink'     => '',
			'chatButtonThird'       => '',
			'chatButtonThirdLink'   => '',
			'chatAlign'             => 'right',
			'chatPadding'           => '12',
			'chatBorderRadius'      => '12',
			'primaryBtnBg'          => '#2563eb',
			'primaryBtnText'        => '#ffffff',
			'chatBubbleBg'          => '#ffffff',
			'chatOnlineDotColor'    => '#00ff6a',
			'chatHoverEffect'       => 'lift',
			'reportLogo'            => '',
			'reportLogoPdfMax'      => 400,
			'clientAccessSlug'      => 'report-access',
			'autoPopupFormId'       => '',
			'autoPopupFormIds'      => array(),
			'formFieldTextColor'    => '',
			'formPlaceholderColor'  => '',
			'formFieldBorderColor'  => '',
			'formFieldBorderStyle'  => 'solid',
			'formFieldBorderWidth'  => 1,
			'formFieldBorderRadius' => 10,
			'formFieldFontSize'     => 14,
			'formLabelFontSize'     => 13,
			'formPlaceholderFontSize' => 14,
			'formFieldGap'          => 16,
			'submissionWebhookUrl'  => '',
			'aiEnabled'             => false,
			'aiConnMode'            => 'direct',
			'aiServerUrl'           => '',
			'aiSystemPrompt'        => '',
			'aiWelcomeMessage'      => 'Hi! Ask me anything about our site and I\'ll help right away.',
			'aiInputPlaceholder'    => '',
			'aiChatModel'           => '',
			'aiVisionModel'         => 'llava',
			'aiMaxChunks'           => 4,
			'aiManualQa'            => '',
			'aiAllowImages'         => false,
			'aiLlmProvider'         => '',
			'aiLlmModel'            => '',
			'aiEmbedProvider'       => '',
			'aiEmbedModel'          => '',
		);

		$merged = array_merge( $defaults, $opt );
		$merged['reportLogoPdfMax'] = max( 100, min( 1000, (int) ( $merged['reportLogoPdfMax'] ?? 400 ) ) );
		$merged['autoPopupFormIds'] = $this->normalize_stored_auto_popup_form_ids_for_output( $merged );
		if ( ! empty( $merged['autoPopupFormIds'] ) ) {
			$merged['autoPopupFormId'] = $merged['autoPopupFormIds'][0];
		} else {
			$merged['autoPopupFormId'] = sanitize_text_field( (string) ( $merged['autoPopupFormId'] ?? '' ) );
		}
		$merged['chatAlign'] = $this->normalize_livechat_widget_side( (string) ( $merged['chatAlign'] ?? 'right' ) );
		$merged['formFieldBorderWidth']  = max( 0, min( 100, (int) ( $merged['formFieldBorderWidth'] ?? 1 ) ) );
		$merged['formFieldBorderRadius'] = max( 0, min( 100, (int) ( $merged['formFieldBorderRadius'] ?? 10 ) ) );
		$merged['formFieldFontSize']       = max( 10, min( 24, (int) ( $merged['formFieldFontSize'] ?? 14 ) ) );
		$merged['formLabelFontSize']       = max( 10, min( 22, (int) ( $merged['formLabelFontSize'] ?? 13 ) ) );
		$merged['formPlaceholderFontSize'] = max( 10, min( 22, (int) ( $merged['formPlaceholderFontSize'] ?? 14 ) ) );
		$merged['formFieldGap']            = max( 0, min( 100, (int) ( $merged['formFieldGap'] ?? 16 ) ) );
		unset( $merged['chatHeaderTagline'], $merged['popupShowDuration'], $merged['popupDisappearTime'] );

		/* AI: never expose a stored API key to the browser — return a boolean instead. */
		self::ai_load_llm_client();
		self::ai_load_vector_store();
		$stored_ai_key         = isset( $opt['aiApiKey'] ) ? trim( (string) $opt['aiApiKey'] ) : '';
		$merged['hasAiKey']    = ( '' !== $stored_ai_key );
		unset( $merged['aiApiKey'] );
		$stored_llm_key        = isset( $opt['aiLlmApiKey'] ) ? trim( (string) $opt['aiLlmApiKey'] ) : '';
		$merged['hasLlmKey']   = ( '' !== $stored_llm_key );
		unset( $merged['aiLlmApiKey'] );
		$stored_embed_key      = isset( $opt['aiEmbedApiKey'] ) ? trim( (string) $opt['aiEmbedApiKey'] ) : '';
		$merged['hasEmbedKey'] = ( '' !== $stored_embed_key );
		unset( $merged['aiEmbedApiKey'] );
		$merged['aiProviders']    = \nexulesuite_\AI\Llm_Client::ui_registry();
		$merged['aiLlmProviders'] = \nexulesuite_\AI\Llm_Client::provider_ids();
		$merged['aiConnMode']     = self::ai_resolve_mode( $opt );
		$merged['aiEnabled']      = ! empty( $merged['aiEnabled'] );
		$merged['aiAllowImages']  = ! empty( $merged['aiAllowImages'] );
		$merged['aiMaxChunks']    = max( 1, min( 10, (int) ( $merged['aiMaxChunks'] ?? 4 ) ) );
		$merged['aiIndex']        = array(
			'chunks'    => \nexulesuite_\Core\Vector_Store::count(),
			'documents' => \nexulesuite_\Core\Vector_Store::documents(),
			'dims'      => \nexulesuite_\Core\Vector_Store::dims(),
		);

		$forms_list = $this->get_forms_list_for_dropdown();

		return rest_ensure_response(
			array(
				'success' => true,
				'data'    => array(
					'settings' => $merged,
					'forms'    => $forms_list,
				),
			)
		);
	}

	/**
	 * Recent stored form submissions (short retention table) for the Submissions report UI.
	 *
	 * @param \WP_REST_Request $request Request (optional from/to/search/limit).
	 * @return \WP_REST_Response
	 */
	public function get_form_submissions( \WP_REST_Request $request ): \WP_REST_Response {
		require_once nexulesuite_PLUGIN_DIR . 'core/class-form-submissions-store.php';

		$from   = sanitize_text_field( (string) $request->get_param( 'from' ) );
		$to     = sanitize_text_field( (string) $request->get_param( 'to' ) );
		$search = sanitize_text_field( (string) $request->get_param( 'search' ) );
		$limit  = (int) $request->get_param( 'limit' );
		if ( $limit <= 0 ) {
			$limit = 500;
		}

		$items = \nexulesuite_\Core\Form_Submissions_Store::list_submissions( $from, $to, $search, $limit );

		return rest_ensure_response(
			array(
				'success' => true,
				'data'    => array(
					'items' => $items,
					'count' => count( $items ),
				),
			)
		);
	}

	/**
	 * Deletes one or more stored form submissions.
	 *
	 * @param \WP_REST_Request $request Request with `ids` array.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function delete_form_submissions( \WP_REST_Request $request ) {
		require_once nexulesuite_PLUGIN_DIR . 'core/class-form-submissions-store.php';

		$ids = $request->get_param( 'ids' );
		if ( ! is_array( $ids ) ) {
			$one = (int) $request->get_param( 'id' );
			$ids = $one > 0 ? array( $one ) : array();
		}

		$deleted = \nexulesuite_\Core\Form_Submissions_Store::delete_ids( $ids );

		return rest_ensure_response(
			array(
				'success' => true,
				'data'    => array(
					'deleted' => $deleted,
				),
			)
		);
	}

	/**
	 * Returns a compact list of builder forms for dropdowns (id + name).
	 *
	 * @return array<int, array{id:string,name:string}>
	 */
	private function get_forms_list_for_dropdown(): array {
		$stored = get_option( self::FORMS_OPTION_KEY, '' );
		$decoded = $this->decode_payload( is_string( $stored ) ? $stored : '' );
		if ( ! is_array( $decoded ) || empty( $decoded['forms'] ) || ! is_array( $decoded['forms'] ) ) {
			return array();
		}

		$out = array();
		foreach ( $decoded['forms'] as $form ) {
			if ( ! is_array( $form ) ) {
				continue;
			}
			$id = isset( $form['id'] ) ? sanitize_text_field( (string) $form['id'] ) : '';
			if ( '' === $id ) {
				continue;
			}
			$name = isset( $form['name'] ) ? sanitize_text_field( (string) $form['name'] ) : '';
			if ( '' === $name ) {
				$name = $id;
			}
			$out[] = array(
				'id'   => $id,
				'name' => $name,
			);
		}

		return $out;
	}

	/**
	 * Livechat widget dock: left or right edge only (legacy center maps to right).
	 *
	 * @param string $raw Stored or incoming align value.
	 * @return string 'left'|'right'
	 */
	private function normalize_livechat_widget_side( string $raw ): string {
		$raw = sanitize_text_field( $raw );
		return ( 'left' === $raw ) ? 'left' : 'right';
	}

	/**
	 * Validates auto-popup form selection against persisted builder forms (empty allowed).
	 *
	 * @param string $raw Raw form id from client.
	 * @return string Sanitized existing id or empty string.
	 */
	private function sanitize_saved_auto_popup_form_id( string $raw ): string {
		$id = sanitize_text_field( $raw );
		if ( '' === $id ) {
			return '';
		}

		$stored = get_option( self::FORMS_OPTION_KEY, '' );
		$decoded = $this->decode_payload( is_string( $stored ) ? trim( $stored ) : '' );
		if ( ! is_array( $decoded ) ) {
			return '';
		}
		if ( empty( $decoded['forms'] ) || ! is_array( $decoded['forms'] ) ) {
			return '';
		}

		foreach ( $decoded['forms'] as $form ) {
			if ( ! is_array( $form ) ) {
				continue;
			}
			$fid = isset( $form['id'] ) ? sanitize_text_field( (string) $form['id'] ) : '';
			if ( $fid !== '' && $fid === $id ) {
				return $id;
			}
		}

		return '';
	}

	/**
	 * Validates and uniquifies persisted default auto-popup form ids (max 25, Form Builder IDs only).
	 *
	 * @param mixed $raw Incoming list from REST (strings or `{ formId?: string }` rows).
	 * @return array<int, string>
	 */
	private function sanitize_saved_auto_popup_form_ids( $raw ): array {
		$out   = array();
		$limit = 25;
		if ( is_array( $raw ) ) {
			foreach ( $raw as $item ) {
				if ( count( $out ) >= $limit ) {
					break;
				}
				$candidate = '';
				if ( is_string( $item ) ) {
					$candidate = $item;
				} elseif ( is_array( $item ) ) {
					$candidate = (string) ( $item['formId'] ?? $item['id'] ?? '' );
				}
				$sanitized = $this->sanitize_saved_auto_popup_form_id( $candidate );
				if ( '' !== $sanitized ) {
					$out[] = $sanitized;
				}
			}
		}

		return array_values( array_unique( $out, SORT_STRING ) );
	}

	/**
	 * Builds the ordered unique id list exposed in GET settings (handles legacy single-key storage).
	 *
	 * @param array<string,mixed> $merged Merged saved + default settings row.
	 * @return array<int, string>
	 */
	private function normalize_stored_auto_popup_form_ids_for_output( array $merged ): array {
		$list = isset( $merged['autoPopupFormIds'] ) && is_array( $merged['autoPopupFormIds'] )
			? $merged['autoPopupFormIds']
			: array();

		$filtered = array();
		foreach ( $list as $fid ) {
			$fid = sanitize_text_field( (string) $fid );
			if ( '' !== $fid ) {
				$filtered[] = $fid;
			}
		}
		$filtered = array_values( array_unique( $filtered, SORT_STRING ) );

		if ( ! empty( $filtered ) ) {
			return $filtered;
		}

		$legacy = isset( $merged['autoPopupFormId'] ) ? sanitize_text_field( (string) $merged['autoPopupFormId'] ) : '';
		if ( '' !== $legacy && '' !== $this->sanitize_saved_auto_popup_form_id( $legacy ) ) {
			return array( $legacy );
		}

		return array();
	}

	/**
	 * Sanitizes livechat bubble / header image: HTTPS URL or legacy compact data URI.
	 *
	 * @param string $raw Raw value from settings payload.
	 * @return string
	 */
	private function sanitize_chat_button_image( string $raw ): string {
		$raw = trim( $raw );
		if ( '' === $raw ) {
			return '';
		}
		// Legacy: admin used readAsDataURL() — esc_url_raw strips data:; allow small inline images only.
		if ( preg_match( '#^data:image/(jpeg|jpg|png|gif|webp);base64,#i', $raw ) ) {
			if ( strlen( $raw ) > 524288 ) {
				return '';
			}
			return $raw;
		}

		return esc_url_raw( $raw );
	}

	/**
	 * Single HTTPS webhook URL for CRM / automation (max length enforced).
	 *
	 * @param string $raw Raw URL.
	 * @return string Empty when invalid.
	 */
	private function sanitize_integration_webhook_url( string $raw ): string {
		$raw = trim( $raw );
		if ( strlen( $raw ) > 2048 ) {
			$raw = substr( $raw, 0, 2048 );
		}
		$url = esc_url_raw( $raw );
		if ( '' === $url || ! wp_http_validate_url( $url ) ) {
			return '';
		}
		$scheme = wp_parse_url( $url, PHP_URL_SCHEME );
		if ( ! is_string( $scheme ) || ! in_array( strtolower( $scheme ), array( 'https', 'http' ), true ) ) {
			return '';
		}

		return $url;
	}

	/**
	 * Saves general plugin settings.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function save_general_settings( \WP_REST_Request $request ) {
		$prev = get_option( self::GENERAL_SETTINGS_OPTION_KEY, array() );
		if ( ! is_array( $prev ) ) {
			$prev = array();
		}

		$input = $request->get_param( 'settings' );
		if ( ! is_array( $input ) ) {
			return new \WP_Error( 'nexulesuite_invalid_settings', 'Invalid settings payload.' );
		}

		$allowed_hover = array( 'none', 'lift', 'scale', 'glow', 'shake', 'rotate', 'darken' );

		// Allowed Google Font families (whitelist for security).
		$allowed_fonts = array(
			'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Raleway', 'Nunito',
			'Ubuntu', 'Rubik', 'Work Sans', 'DM Sans', 'Figtree', 'Plus Jakarta Sans', 'Outfit',
			'Barlow', 'Manrope', 'Mulish', 'Quicksand', 'Cabin', 'Karla', 'Josefin Sans', 'Exo 2',
			'Space Grotesk', 'Noto Sans', 'IBM Plex Sans', 'Syne', 'Oswald', 'Bebas Neue', 'Anton',
			'Fjalla One', 'Righteous', 'Titan One', 'Secular One', 'Abril Fatface',
			'Playfair Display', 'Merriweather', 'Lora', 'PT Serif', 'Libre Baskerville',
			'Cormorant Garamond', 'EB Garamond', 'Spectral', 'Cinzel', 'Crimson Text',
			'Dancing Script', 'Pacifico', 'Caveat', 'Satisfy', 'Permanent Marker',
			'Inconsolata', 'Source Code Pro', 'JetBrains Mono', 'Fira Code',
		);
		$global_font = isset( $input['globalFont'] ) ? sanitize_text_field( (string) $input['globalFont'] ) : 'Inter';
		if ( ! in_array( $global_font, $allowed_fonts, true ) ) {
			$global_font = 'Inter';
		}

		$chat_align_in = isset( $input['chatAlign'] ) ? sanitize_text_field( (string) $input['chatAlign'] ) : 'right';
		$chat_align    = $this->normalize_livechat_widget_side( $chat_align_in );

		$chat_hover = isset( $input['chatHoverEffect'] ) ? sanitize_text_field( (string) $input['chatHoverEffect'] ) : 'lift';
		if ( ! in_array( $chat_hover, $allowed_hover, true ) ) {
			$chat_hover = 'lift';
		}

		$token_ttl = max( 1, min( 10080, (int) ( $input['tokenTTL'] ?? 5 ) ) );
		$chat_padding = max( 4, min( 40, (int) ( $input['chatPadding'] ?? 12 ) ) );
		$chat_radius  = max( 0, min( 50, (int) ( $input['chatBorderRadius'] ?? 12 ) ) );

		$slug_raw = isset( $input['clientAccessSlug'] ) ? sanitize_title( (string) $input['clientAccessSlug'] ) : '';
		if ( '' === $slug_raw ) {
			$slug_raw = 'report-access';
		}

		$primary_bg   = sanitize_hex_color( (string) ( $input['primaryBtnBg'] ?? '#2563eb' ) ) ?: '#2563eb';
		$primary_text = sanitize_hex_color( (string) ( $input['primaryBtnText'] ?? '#ffffff' ) ) ?: '#ffffff';
		$chat_bubble_bg = sanitize_hex_color( (string) ( $input['chatBubbleBg'] ?? '#ffffff' ) ) ?: '#ffffff';
		$chat_online_dot = sanitize_hex_color( (string) ( $input['chatOnlineDotColor'] ?? '#00ff6a' ) ) ?: '#00ff6a';

		$form_field_text   = sanitize_hex_color( (string) ( $input['formFieldTextColor'] ?? '' ) ) ?: '';
		$form_placeholder  = sanitize_hex_color( (string) ( $input['formPlaceholderColor'] ?? '' ) ) ?: '';
		$form_border_color = sanitize_hex_color( (string) ( $input['formFieldBorderColor'] ?? '' ) ) ?: '';
		$form_border_style = isset( $input['formFieldBorderStyle'] ) ? sanitize_text_field( (string) $input['formFieldBorderStyle'] ) : 'solid';
		$allowed_border_styles = array( 'solid', 'dashed', 'dotted', 'double', 'none' );
		if ( ! in_array( $form_border_style, $allowed_border_styles, true ) ) {
			$form_border_style = 'solid';
		}
		$form_border_width  = max( 0, min( 100, (int) ( $input['formFieldBorderWidth'] ?? 1 ) ) );
		$form_border_radius = max( 0, min( 100, (int) ( $input['formFieldBorderRadius'] ?? 10 ) ) );
		$form_field_fs      = max( 10, min( 24, (int) ( $input['formFieldFontSize'] ?? 14 ) ) );
		$form_label_fs      = max( 10, min( 22, (int) ( $input['formLabelFontSize'] ?? 13 ) ) );
		$form_ph_fs         = max( 10, min( 22, (int) ( $input['formPlaceholderFontSize'] ?? 14 ) ) );
		$form_field_gap     = max( 0, min( 100, (int) ( $input['formFieldGap'] ?? 16 ) ) );

		$exclude_posts_raw = isset( $input['excludePosts'] ) && is_array( $input['excludePosts'] ) ? $input['excludePosts'] : array();
		$exclude_posts = array();
		foreach ( $exclude_posts_raw as $item ) {
			if ( ! is_array( $item ) ) {
				continue;
			}
			$exclude_posts[] = array(
				'id'    => (int) ( $item['id'] ?? 0 ),
				'title' => sanitize_text_field( (string) ( $item['title'] ?? '' ) ),
			);
		}

		$exclude_pages_raw = isset( $input['excludePages'] ) && is_array( $input['excludePages'] ) ? $input['excludePages'] : array();
		$exclude_pages = array();
		foreach ( $exclude_pages_raw as $item ) {
			if ( ! is_array( $item ) ) {
				continue;
			}
			$exclude_pages[] = array(
				'id'    => (int) ( $item['id'] ?? 0 ),
				'title' => sanitize_text_field( (string) ( $item['title'] ?? '' ) ),
			);
		}

		$auto_popup_form_ids = $this->sanitize_saved_auto_popup_form_ids( $input['autoPopupFormIds'] ?? null );
		if ( empty( $auto_popup_form_ids ) && isset( $input['autoPopupFormId'] ) ) {
			$fallback_one = $this->sanitize_saved_auto_popup_form_id( (string) $input['autoPopupFormId'] );
			if ( '' !== $fallback_one ) {
				$auto_popup_form_ids = array( $fallback_one );
			}
		}

		$submission_webhook = array_key_exists( 'submissionWebhookUrl', $input )
			? $this->sanitize_integration_webhook_url( (string) ( $input['submissionWebhookUrl'] ?? '' ) )
			: ( isset( $prev['submissionWebhookUrl'] ) ? $this->sanitize_integration_webhook_url( (string) $prev['submissionWebhookUrl'] ) : '' );

		/* AI API keys: blank incoming => keep the previously stored (encrypted) value; a new value is encrypted at rest. */
		require_once nexulesuite_PLUGIN_DIR . 'core/class-mailer.php';
		$prev_ai_key = isset( $prev['aiApiKey'] ) ? (string) $prev['aiApiKey'] : '';
		$new_ai_key  = array_key_exists( 'aiApiKey', $input ) ? trim( (string) $input['aiApiKey'] ) : '';
		$ai_key_store = ( '' === $new_ai_key ) ? $prev_ai_key : \nexulesuite_\Mailer::encrypt_secret( $new_ai_key );
		$ai_server_url = array_key_exists( 'aiServerUrl', $input )
			? esc_url_raw( trim( (string) $input['aiServerUrl'] ) )
			: esc_url_raw( trim( (string) ( $prev['aiServerUrl'] ?? '' ) ) );
		$ai_max_chunks = max(
			1,
			min(
				10,
				(int) ( array_key_exists( 'aiMaxChunks', $input ) ? ( $input['aiMaxChunks'] ?? 4 ) : ( $prev['aiMaxChunks'] ?? 4 ) )
			)
		);

		/* Provider (LLM) credentials — same masked/encrypted contract as the AI-server key. */
		self::ai_load_llm_client();
		$prev_llm_provider = strtolower( trim( (string) ( $prev['aiLlmProvider'] ?? '' ) ) );
		/* Sparse payloads (save before GET finishes) must not clear a saved provider. */
		if ( array_key_exists( 'aiLlmProvider', $input ) ) {
			$llm_provider = strtolower( sanitize_text_field( (string) ( $input['aiLlmProvider'] ?? '' ) ) );
			if ( null === \nexulesuite_\AI\Llm_Client::provider( $llm_provider ) ) {
				$llm_provider = '';
			}
		} else {
			$llm_provider = $prev_llm_provider;
			if ( null === \nexulesuite_\AI\Llm_Client::provider( $llm_provider ) ) {
				$llm_provider = '';
			}
		}
		$prev_llm_key  = isset( $prev['aiLlmApiKey'] ) ? (string) $prev['aiLlmApiKey'] : '';
		$new_llm_key   = array_key_exists( 'aiLlmApiKey', $input ) ? trim( (string) $input['aiLlmApiKey'] ) : '';
		$llm_key_store = self::carry_provider_key( $new_llm_key, $prev_llm_key, $llm_provider, $prev_llm_provider );
		$llm_model     = array_key_exists( 'aiLlmModel', $input )
			? mb_substr( trim( sanitize_text_field( (string) $input['aiLlmModel'] ) ), 0, 128 )
			: mb_substr( trim( (string) ( $prev['aiLlmModel'] ?? '' ) ), 0, 128 );

		/* Embedding provider — only vendors with a real embeddings endpoint are accepted. */
		$prev_embed_provider = strtolower( trim( (string) ( $prev['aiEmbedProvider'] ?? '' ) ) );
		if ( array_key_exists( 'aiEmbedProvider', $input ) ) {
			$embed_provider = strtolower( sanitize_text_field( (string) ( $input['aiEmbedProvider'] ?? '' ) ) );
			if ( ! \nexulesuite_\AI\Llm_Client::supports_embeddings( $embed_provider ) ) {
				$embed_provider = '';
			}
		} else {
			$embed_provider = $prev_embed_provider;
			if ( ! \nexulesuite_\AI\Llm_Client::supports_embeddings( $embed_provider ) ) {
				$embed_provider = '';
			}
		}
		$prev_embed_key  = isset( $prev['aiEmbedApiKey'] ) ? (string) $prev['aiEmbedApiKey'] : '';
		$new_embed_key   = array_key_exists( 'aiEmbedApiKey', $input ) ? trim( (string) $input['aiEmbedApiKey'] ) : '';
		$embed_key_store = self::carry_provider_key( $new_embed_key, $prev_embed_key, $embed_provider, $prev_embed_provider );
		$embed_model     = array_key_exists( 'aiEmbedModel', $input )
			? mb_substr( trim( sanitize_text_field( (string) $input['aiEmbedModel'] ) ), 0, 128 )
			: mb_substr( trim( (string) ( $prev['aiEmbedModel'] ?? '' ) ), 0, 128 );

		// An older client that omits the field must not flip a working server install to direct.
		$conn_mode = strtolower( sanitize_text_field( (string) ( $input['aiConnMode'] ?? '' ) ) );
		if ( ! in_array( $conn_mode, self::AI_MODES, true ) ) {
			$conn_mode = self::ai_resolve_mode( $prev );
		}

		$clean = array(
			'enableNavigation'      => ! empty( $input['enableNavigation'] ),
			'selectedEmailTemplate' => sanitize_text_field( (string) ( $input['selectedEmailTemplate'] ?? '' ) ),
			'allowClientAccess'     => ! empty( $input['allowClientAccess'] ),
			'tokenTTL'              => (string) $token_ttl,
			'globalFont'            => $global_font,
			'enableAutoPopup'       => ! empty( $input['enableAutoPopup'] ),
			'autoPopupFormIds'      => $auto_popup_form_ids,
			'autoPopupFormId'       => $auto_popup_form_ids[0] ?? '',
			'activityButtonClasses' => sanitize_textarea_field( (string) ( $input['activityButtonClasses'] ?? '' ) ),
			'excludePosts'          => $exclude_posts,
			'excludePages'          => $exclude_pages,
			'enableLivechat'        => array_key_exists( 'enableLivechat', $input ) ? ! empty( $input['enableLivechat'] ) : ! empty( $prev['enableLivechat'] ),
			'chatButtonImage'       => array_key_exists( 'chatButtonImage', $input )
				? $this->sanitize_chat_button_image( (string) $input['chatButtonImage'] )
				: $this->sanitize_chat_button_image( (string) ( $prev['chatButtonImage'] ?? '' ) ),
			'chatTitle'             => array_key_exists( 'chatTitle', $input )
				? sanitize_text_field( (string) $input['chatTitle'] )
				: sanitize_text_field( (string) ( $prev['chatTitle'] ?? 'Customer Support' ) ),
			'chatBadge'             => array_key_exists( 'chatBadge', $input )
				? sanitize_text_field( (string) $input['chatBadge'] )
				: sanitize_text_field( (string) ( $prev['chatBadge'] ?? 'Online' ) ),
			'chatContent'           => array_key_exists( 'chatContent', $input )
				? sanitize_textarea_field( (string) $input['chatContent'] )
				: sanitize_textarea_field( (string) ( $prev['chatContent'] ?? '' ) ),
			'chatFormButton'        => array_key_exists( 'chatFormButton', $input )
				? sanitize_text_field( (string) $input['chatFormButton'] )
				: sanitize_text_field( (string) ( $prev['chatFormButton'] ?? '' ) ),
			'chatFormButtonLink'    => array_key_exists( 'chatFormButtonLink', $input )
				? sanitize_text_field( (string) $input['chatFormButtonLink'] )
				: sanitize_text_field( (string) ( $prev['chatFormButtonLink'] ?? '' ) ),
			'chatButtonTwo'         => array_key_exists( 'chatButtonTwo', $input )
				? sanitize_text_field( (string) $input['chatButtonTwo'] )
				: sanitize_text_field( (string) ( $prev['chatButtonTwo'] ?? '' ) ),
			'chatButtonTwoLink'     => array_key_exists( 'chatButtonTwoLink', $input )
				? esc_url_raw( (string) $input['chatButtonTwoLink'] )
				: esc_url_raw( (string) ( $prev['chatButtonTwoLink'] ?? '' ) ),
			'chatButtonThird'       => array_key_exists( 'chatButtonThird', $input )
				? sanitize_text_field( (string) $input['chatButtonThird'] )
				: sanitize_text_field( (string) ( $prev['chatButtonThird'] ?? '' ) ),
			'chatButtonThirdLink'   => array_key_exists( 'chatButtonThirdLink', $input )
				? sanitize_text_field( (string) $input['chatButtonThirdLink'] )
				: sanitize_text_field( (string) ( $prev['chatButtonThirdLink'] ?? '' ) ),
			'chatAlign'             => array_key_exists( 'chatAlign', $input ) ? $chat_align : $this->normalize_livechat_widget_side( (string) ( $prev['chatAlign'] ?? 'right' ) ),
			'chatPadding'           => (string) ( array_key_exists( 'chatPadding', $input ) ? $chat_padding : max( 4, min( 40, (int) ( $prev['chatPadding'] ?? 12 ) ) ) ),
			'chatBorderRadius'      => (string) ( array_key_exists( 'chatBorderRadius', $input ) ? $chat_radius : max( 0, min( 50, (int) ( $prev['chatBorderRadius'] ?? 12 ) ) ) ),
			'primaryBtnBg'          => array_key_exists( 'primaryBtnBg', $input ) ? $primary_bg : ( sanitize_hex_color( (string) ( $prev['primaryBtnBg'] ?? '#2563eb' ) ) ?: '#2563eb' ),
			'primaryBtnText'        => array_key_exists( 'primaryBtnText', $input ) ? $primary_text : ( sanitize_hex_color( (string) ( $prev['primaryBtnText'] ?? '#ffffff' ) ) ?: '#ffffff' ),
			'chatBubbleBg'          => array_key_exists( 'chatBubbleBg', $input ) ? $chat_bubble_bg : ( sanitize_hex_color( (string) ( $prev['chatBubbleBg'] ?? '#ffffff' ) ) ?: '#ffffff' ),
			'chatOnlineDotColor'    => array_key_exists( 'chatOnlineDotColor', $input ) ? $chat_online_dot : ( sanitize_hex_color( (string) ( $prev['chatOnlineDotColor'] ?? '#00ff6a' ) ) ?: '#00ff6a' ),
			'chatHoverEffect'       => array_key_exists( 'chatHoverEffect', $input ) ? $chat_hover : ( in_array( (string) ( $prev['chatHoverEffect'] ?? 'lift' ), $allowed_hover, true ) ? (string) $prev['chatHoverEffect'] : 'lift' ),
			'reportLogo'            => esc_url_raw( (string) ( $input['reportLogo'] ?? '' ) ),
			'reportLogoPdfMax'      => max( 100, min( 1000, (int) ( $input['reportLogoPdfMax'] ?? 400 ) ) ),
			'clientAccessSlug'      => $slug_raw,
			'formFieldTextColor'       => $form_field_text,
			'formPlaceholderColor'     => $form_placeholder,
			'formFieldBorderColor'     => $form_border_color,
			'formFieldBorderStyle'     => $form_border_style,
			'formFieldBorderWidth'     => (int) $form_border_width,
			'formFieldBorderRadius'    => (int) $form_border_radius,
			'formFieldFontSize'        => (int) $form_field_fs,
			'formLabelFontSize'        => (int) $form_label_fs,
			'formPlaceholderFontSize'  => (int) $form_ph_fs,
			'formFieldGap'             => (int) $form_field_gap,
			'submissionWebhookUrl'  => $submission_webhook,
			'aiEnabled'             => array_key_exists( 'aiEnabled', $input ) ? ! empty( $input['aiEnabled'] ) : ! empty( $prev['aiEnabled'] ),
			'aiConnMode'            => $conn_mode,
			'aiServerUrl'           => $ai_server_url,
			'aiApiKey'              => $ai_key_store,
			'aiLlmProvider'         => $llm_provider,
			'aiLlmModel'            => $llm_model,
			'aiLlmApiKey'           => $llm_key_store,
			'aiEmbedProvider'       => $embed_provider,
			'aiEmbedModel'          => $embed_model,
			'aiEmbedApiKey'         => $embed_key_store,
			'aiSystemPrompt'        => array_key_exists( 'aiSystemPrompt', $input )
				? sanitize_textarea_field( (string) $input['aiSystemPrompt'] )
				: sanitize_textarea_field( (string) ( $prev['aiSystemPrompt'] ?? '' ) ),
			'aiWelcomeMessage'      => array_key_exists( 'aiWelcomeMessage', $input )
				? sanitize_text_field( (string) $input['aiWelcomeMessage'] )
				: sanitize_text_field( (string) ( $prev['aiWelcomeMessage'] ?? '' ) ),
			'aiInputPlaceholder'    => array_key_exists( 'aiInputPlaceholder', $input ) ? mb_substr( sanitize_text_field( (string) $input['aiInputPlaceholder'] ), 0, 120 ) : (string) ( $prev['aiInputPlaceholder'] ?? '' ),
			'aiChatModel'           => array_key_exists( 'aiChatModel', $input )
				? sanitize_text_field( (string) $input['aiChatModel'] )
				: sanitize_text_field( (string) ( $prev['aiChatModel'] ?? '' ) ),
			'aiVisionModel'         => array_key_exists( 'aiVisionModel', $input )
				? sanitize_text_field( (string) ( $input['aiVisionModel'] ?? 'llava' ) )
				: sanitize_text_field( (string) ( $prev['aiVisionModel'] ?? 'llava' ) ),
			'aiMaxChunks'           => $ai_max_chunks,
			'aiManualQa'            => array_key_exists( 'aiManualQa', $input )
				? sanitize_textarea_field( (string) $input['aiManualQa'] )
				: sanitize_textarea_field( (string) ( $prev['aiManualQa'] ?? '' ) ),
			'aiAllowImages'         => array_key_exists( 'aiAllowImages', $input ) ? ! empty( $input['aiAllowImages'] ) : ! empty( $prev['aiAllowImages'] ),
			/*
			 * FAQ & Buttons (+ Auto-Setup apply for questions/actions) own these keys via
			 * /ai/faq and /ai/autogen/apply. The Settings SPA still echoes them in the
			 * general-settings payload from a possibly stale in-memory snapshot, which used
			 * to wipe FAQ/actions after a Model & Knowledge save. Always keep the DB copy.
			 */
			'aiLogChats'            => ! empty( $prev['aiLogChats'] ),
			'aiFaqEnabled'          => ! empty( $prev['aiFaqEnabled'] ),
			'aiFaqFlows'            => $this->sanitize_ai_faq_items( $prev['aiFaqFlows'] ?? array() ),
			'aiActions'             => $this->sanitize_ai_actions( $prev['aiActions'] ?? array() ),
			'aiDisclaimer'          => mb_substr( sanitize_textarea_field( (string) ( $prev['aiDisclaimer'] ?? '' ) ), 0, 300 ),
			'aiTriggerLabel'        => mb_substr( sanitize_text_field( (string) ( $prev['aiTriggerLabel'] ?? '' ) ), 0, 40 ),
			'aiLeadEnabled'         => ! empty( $prev['aiLeadEnabled'] ),
			'aiLeadOffer'           => mb_substr( sanitize_text_field( (string) ( $prev['aiLeadOffer'] ?? '' ) ), 0, 200 ),
			'aiLeadRecipient'       => (string) ( $prev['aiLeadRecipient'] ?? '' ),
			'aiWooCards'            => ! isset( $prev['aiWooCards'] ) || ! empty( $prev['aiWooCards'] ),
			'aiExtraUrls'           => $this->sanitize_ai_urls( $prev['aiExtraUrls'] ?? array() ),
			'aiContactShortcode'    => mb_substr( sanitize_text_field( (string) ( $prev['aiContactShortcode'] ?? '' ) ), 0, 500 ),
			'aiExamples'            => mb_substr( sanitize_textarea_field( (string) ( $prev['aiExamples'] ?? '' ) ), 0, 20000 ),
		);

		update_option( self::GENERAL_SETTINGS_OPTION_KEY, $clean, false );

		$prev_slug = isset( $prev['clientAccessSlug'] ) ? sanitize_title( (string) $prev['clientAccessSlug'] ) : '';
		if ( '' === $prev_slug ) {
			$prev_slug = 'report-access';
		}
		$need_rewrite_flush = ( $prev_slug !== $slug_raw )
			|| ( ! empty( $prev['allowClientAccess'] ) !== ! empty( $clean['allowClientAccess'] ) );

		if ( $need_rewrite_flush ) {
			require_once nexulesuite_PLUGIN_DIR . 'public/class-client-access.php';
			\nexulesuite_\Public\Client_Access::sync_rewrite_rules();
			flush_rewrite_rules( false );
		}

		/* Mask every secret before echoing settings back to the browser. */
		$public_settings                = $clean;
		$public_settings['hasAiKey']    = ( '' !== trim( (string) $ai_key_store ) );
		$public_settings['hasLlmKey']   = ( '' !== trim( (string) $llm_key_store ) );
		$public_settings['hasEmbedKey'] = ( '' !== trim( (string) $embed_key_store ) );
		unset( $public_settings['aiApiKey'], $public_settings['aiLlmApiKey'], $public_settings['aiEmbedApiKey'] );

		return rest_ensure_response(
			array(
				'success' => true,
				'data'    => array(
					'settings' => $public_settings,
				),
			)
		);
	}

	/**
	 * Stable per-site collection id sent to the AI server (one ChromaDB collection per site).
	 *
	 * @return string
	 */
	private function ai_site_id(): string {
		return substr( md5( home_url() ), 0, 16 );
	}

	/**
	 * Loads the direct-to-provider LLM adapter on demand.
	 *
	 * @return void
	 */
	private static function ai_load_llm_client(): void {
		require_once nexulesuite_PLUGIN_DIR . 'ai/class-llm-client.php';
	}

	/**
	 * Which connection mode a stored settings array means.
	 *
	 * `aiConnMode` did not exist before direct-to-provider support, so an install that
	 * predates it has no value. Those sites were, by definition, pointed at a self-hosted
	 * AI server — infer that from the saved URL rather than silently moving a working
	 * chatbot onto the direct path on upgrade. Genuinely fresh installs get `direct`.
	 *
	 * @param array<string,mixed> $opt Stored general settings.
	 * @return string 'direct'|'server'
	 */
	private static function ai_resolve_mode( array $opt ): string {
		$mode = strtolower( trim( (string) ( $opt['aiConnMode'] ?? '' ) ) );
		if ( in_array( $mode, self::AI_MODES, true ) ) {
			return $mode;
		}

		return '' !== trim( (string) ( $opt['aiServerUrl'] ?? '' ) ) ? 'server' : 'direct';
	}

	/**
	 * Loads the WP-database vector store on demand.
	 *
	 * @return void
	 */
	private static function ai_load_vector_store(): void {
		require_once nexulesuite_PLUGIN_DIR . 'core/class-vector-store.php';
	}

	/**
	 * Decides what to store for a provider API key on save.
	 *
	 * A blank key field means "keep the saved one" — but only while the provider is
	 * unchanged. Keys are vendor-scoped, so carrying one across a provider switch would
	 * send, say, an OpenRouter key to `api.openai.com` and the admin would see the other
	 * vendor rejecting it. A switch without a fresh key therefore clears the old one.
	 *
	 * @param string $new_key       Key typed in this request ('' when the field was left blank).
	 * @param string $stored_key    Encrypted key currently on file.
	 * @param string $provider      Provider being saved now.
	 * @param string $prev_provider Provider the stored key was saved under.
	 * @return string Encrypted key to store ('' clears it).
	 */
	private static function carry_provider_key( string $new_key, string $stored_key, string $provider, string $prev_provider ): string {
		if ( '' !== $new_key ) {
			return \nexulesuite_\Mailer::encrypt_secret( $new_key );
		}

		return $provider === $prev_provider ? $stored_key : '';
	}

	/**
	 * Resolves which provider/model/key embeds text in `direct` mode.
	 *
	 * When no dedicated embedding provider is chosen, the chat provider is reused if it
	 * can embed (OpenAI, Gemini, Mistral) — Claude and Groq have no embeddings API, so
	 * those installs must pick one explicitly. Returns null when nothing is usable, which
	 * is a soft failure: the assistant still answers, just without site context.
	 *
	 * @param array<string,mixed> $s Pre-read AI settings.
	 * @return array{provider:string,model:string,key:string}|null
	 */
	private function ai_embed_config( array $s ): ?array {
		self::ai_load_llm_client();

		$provider = (string) $s['embed_provider'];
		$key      = (string) $s['embed_key'];

		if ( '' === $provider ) {
			$chat_provider = (string) $s['llm_provider'];
			if ( '' === $chat_provider || ! \nexulesuite_\AI\Llm_Client::supports_embeddings( $chat_provider ) ) {
				return null;
			}
			$provider = $chat_provider;
			$key      = '' !== $key ? $key : (string) $s['llm_key'];
		} elseif ( '' === $key && $provider === (string) $s['llm_provider'] ) {
			// Same vendor for chat and embeddings — one key covers both.
			$key = (string) $s['llm_key'];
		}

		if ( '' === trim( $key ) ) {
			return null;
		}

		$model = (string) $s['embed_model'];
		if ( '' === $model ) {
			$model = \nexulesuite_\AI\Llm_Client::default_embed_model( $provider );
		}

		return array( 'provider' => $provider, 'model' => $model, 'key' => $key );
	}

	/**
	 * Reads AI settings from the general option, decrypting the stored API key.
	 *
	 * @return array<string,mixed>
	 */
	private function ai_settings(): array {
		$opt = get_option( self::GENERAL_SETTINGS_OPTION_KEY, array() );
		if ( ! is_array( $opt ) ) {
			$opt = array();
		}
		require_once nexulesuite_PLUGIN_DIR . 'core/class-mailer.php';
		self::ai_load_llm_client();
		$key_stored       = isset( $opt['aiApiKey'] ) ? (string) $opt['aiApiKey'] : '';
		$llm_key_stored   = isset( $opt['aiLlmApiKey'] ) ? (string) $opt['aiLlmApiKey'] : '';
		$embed_key_stored = isset( $opt['aiEmbedApiKey'] ) ? (string) $opt['aiEmbedApiKey'] : '';
		$llm_provider     = strtolower( trim( (string) ( $opt['aiLlmProvider'] ?? '' ) ) );
		$embed_provider   = strtolower( trim( (string) ( $opt['aiEmbedProvider'] ?? '' ) ) );

		return array(
			'enabled'    => ! empty( $opt['aiEnabled'] ),
			'mode'       => self::ai_resolve_mode( $opt ),
			'url'        => isset( $opt['aiServerUrl'] ) ? untrailingslashit( trim( (string) $opt['aiServerUrl'] ) ) : '',
			'key'        => \nexulesuite_\Mailer::decrypt_secret( $key_stored ),
			'llm_provider' => null !== \nexulesuite_\AI\Llm_Client::provider( $llm_provider ) ? $llm_provider : '',
			'llm_model'    => trim( (string) ( $opt['aiLlmModel'] ?? '' ) ),
			'llm_key'      => \nexulesuite_\Mailer::decrypt_secret( $llm_key_stored ),
			'embed_provider' => \nexulesuite_\AI\Llm_Client::supports_embeddings( $embed_provider ) ? $embed_provider : '',
			'embed_model'    => trim( (string) ( $opt['aiEmbedModel'] ?? '' ) ),
			'embed_key'      => \nexulesuite_\Mailer::decrypt_secret( $embed_key_stored ),
			'system'     => (string) ( $opt['aiSystemPrompt'] ?? '' ),
			'welcome'      => (string) ( $opt['aiWelcomeMessage'] ?? '' ),
			'model'        => trim( (string) ( $opt['aiChatModel'] ?? '' ) ),
			'vision_model' => trim( (string) ( $opt['aiVisionModel'] ?? '' ) ),
			'allow_images' => ! empty( $opt['aiAllowImages'] ),
			'max_chunks'   => max( 1, min( 10, (int) ( $opt['aiMaxChunks'] ?? 4 ) ) ),
			'manual_qa'    => (string) ( $opt['aiManualQa'] ?? '' ),
			'log_chats'    => ! empty( $opt['aiLogChats'] ),
			'faq_enabled'  => ! empty( $opt['aiFaqEnabled'] ),
			'faq_items'    => $this->sanitize_ai_faq_items( $opt['aiFaqFlows'] ?? array() ),
			'faq_actions'  => $this->sanitize_ai_actions( $opt['aiActions'] ?? array() ),
			'disclaimer'   => (string) ( $opt['aiDisclaimer'] ?? '' ),
			'trigger_label' => (string) ( $opt['aiTriggerLabel'] ?? '' ),
			'lead_enabled' => ! empty( $opt['aiLeadEnabled'] ),
			'lead_offer'   => (string) ( $opt['aiLeadOffer'] ?? '' ),
			'lead_recipient' => (string) ( $opt['aiLeadRecipient'] ?? '' ),
			// Product cards default ON when WooCommerce is active; only an explicit false disables.
			'woo_cards'    => ! isset( $opt['aiWooCards'] ) || ! empty( $opt['aiWooCards'] ),
			'extra_urls'   => isset( $opt['aiExtraUrls'] ) && is_array( $opt['aiExtraUrls'] ) ? $opt['aiExtraUrls'] : array(),
			'contact_shortcode' => (string) ( $opt['aiContactShortcode'] ?? '' ),
			'examples'     => (string) ( $opt['aiExamples'] ?? '' ),
		);
	}

	/**
	 * Parses admin few-shot examples ("User: …" / "Assistant: …" blocks, optional
	 * "---" separators) into `[{role, content}]` turns for the AI server.
	 *
	 * @param string $raw Raw textarea value.
	 * @return array<int,array<string,string>>
	 */
	private function ai_parse_examples( string $raw ): array {
		$raw = trim( $raw );
		if ( '' === $raw ) {
			return array();
		}

		$out  = array();
		$role = '';
		$buf  = '';
		$push = static function ( array &$out, string $role, string $buf ): void {
			$buf = trim( $buf );
			if ( '' !== $role && '' !== $buf ) {
				$out[] = array( 'role' => $role, 'content' => mb_substr( $buf, 0, 1000 ) );
			}
		};

		foreach ( preg_split( '/\r\n|\r|\n/', $raw ) as $line ) {
			$t = trim( (string) $line );
			if ( '' !== $t && preg_match( '/^-{3,}$/', $t ) ) {
				$push( $out, $role, $buf );
				$role = '';
				$buf  = '';
				continue;
			}
			if ( preg_match( '/^\s*user\s*:\s*(.*)$/i', (string) $line, $m ) ) {
				$push( $out, $role, $buf );
				$role = 'user';
				$buf  = $m[1];
				continue;
			}
			if ( preg_match( '/^\s*(?:assistant|bot|ai)\s*:\s*(.*)$/i', (string) $line, $m ) ) {
				$push( $out, $role, $buf );
				$role = 'assistant';
				$buf  = $m[1];
				continue;
			}
			if ( '' !== $role ) {
				$buf .= "\n" . $line;
			}
		}
		$push( $out, $role, $buf );

		return array_slice( $out, 0, 100 );
	}

	/**
	 * Sanitizes a list of external "learn from" URLs (newline string or array).
	 *
	 * @param mixed $raw URLs.
	 * @return array<int,string>
	 */
	private function sanitize_ai_urls( $raw ): array {
		if ( is_string( $raw ) ) {
			$raw = preg_split( '/[\r\n]+/', $raw );
		}
		if ( ! is_array( $raw ) ) {
			return array();
		}
		$urls = array();
		foreach ( $raw as $u ) {
			$u = esc_url_raw( trim( (string) $u ), array( 'http', 'https' ) );
			if ( '' !== $u && wp_http_validate_url( $u ) ) {
				$urls[] = $u;
			}
			if ( count( $urls ) >= 10 ) {
				break;
			}
		}
		return array_values( array_unique( $urls ) );
	}

	/**
	 * Extracts readable text from an HTML document (drops scripts/nav/footer chrome).
	 *
	 * @param string $html Raw HTML.
	 * @return string
	 */
	private function ai_html_to_text( string $html ): string {
		$html = (string) preg_replace( '#<(script|style|noscript|template|svg)\b[^>]*>.*?</\1>#is', ' ', $html );
		$html = (string) preg_replace( '#<(nav|footer|header|aside|form)\b[^>]*>.*?</\1>#is', ' ', $html );
		$text = wp_strip_all_tags( $html );
		$text = (string) preg_replace( '/\s+/u', ' ', html_entity_decode( $text, ENT_QUOTES, 'UTF-8' ) );
		return trim( $text );
	}

	/**
	 * Fetches the admin's extra "learn from" URLs and returns ingest documents.
	 *
	 * @return array<int,array<string,string>>
	 */
	private function ai_fetch_url_docs(): array {
		$docs = array();
		foreach ( $this->ai_settings()['extra_urls'] as $url ) {
			$resp = wp_remote_get( $url, array( 'timeout' => 15, 'redirection' => 3 ) );
			if ( is_wp_error( $resp ) || (int) wp_remote_retrieve_response_code( $resp ) >= 400 ) {
				continue;
			}
			$text = $this->ai_html_to_text( (string) wp_remote_retrieve_body( $resp ) );
			if ( '' === $text ) {
				continue;
			}
			$docs[] = array(
				'id'          => 'url-' . md5( $url ),
				'source_type' => 'url',
				'source_ref'  => $url,
				'title'       => $url,
				'url'         => $url,
				'text'        => mb_substr( $text, 0, 20000 ),
			);
		}
		return $docs;
	}

	/**
	 * Searches WooCommerce products matching a visitor message and returns compact
	 * card data. Empty when Woo is inactive, disabled, or the message isn't product-y.
	 *
	 * @param string $message Visitor message.
	 * @return array<int,array<string,mixed>>
	 */
	private function ai_woo_product_cards( string $message ): array {
		$message = trim( $message );
		if ( '' === $message || ! function_exists( 'wc_get_products' ) || ! post_type_exists( 'product' ) ) {
			return array();
		}
		if ( empty( $this->ai_settings()['woo_cards'] ) ) {
			return array();
		}

		$limit = 8;
		$args  = array(
			'status' => 'publish',
			'limit'  => $limit,
		);

		$is_new  = (bool) preg_match( '/\b(new\s*arrivals?|newest|latest|recently\s*(?:added|arrived)|just\s*(?:in|arrived))\b/i', $message );
		$is_best = (bool) preg_match( '/\b(best[\s-]?sell\w*|top[\s-]?(?:rated|selling)|most\s*(?:popular|viewed)|popular|trending|hot|featured|recommend\w*|suggest\w*)\b/i', $message );
		// Generic "browse" terms (product, products, catalog, shop, deals, bundle, sale…) — user's product vocabulary.
		$is_browse = (bool) preg_match( '/\b(products?|items?|catalog\w*|shop|store|browse|collection|listing|goods|merchandise|inventory|buy|purchase|order|deals?|clearance|bundle|combo|package|sale|checkout|cart)\b/i', $message );
		// A specific product query (price/stock/size or a short product name like "organic honey").
		$word_count  = str_word_count( $message );
		$is_specific = (bool) preg_match( '/\b(price|pricing|cost|cheap|expensive|afford|available|stock|size|colou?r|model|do you (?:have|sell|carry)|show me|looking for)\b/i', $message );
		$is_shortname = $word_count >= 1 && $word_count <= 3
			&& ! preg_match( '/^\s*(?:hi|hey+|hello|thanks?|thank you|ok(?:ay)?|yes|no|bye|help|support|agent|live|human|price)\b/i', $message );

		if ( $is_new ) {
			$args['orderby'] = 'date';
			$args['order']   = 'DESC';
		} elseif ( $is_best || $is_browse ) {
			$args['orderby'] = 'popularity';
		} elseif ( $is_specific || $is_shortname ) {
			$args['s'] = $message;
		} else {
			return array();
		}

		$products = wc_get_products( $args );

		$cards = array();
		foreach ( (array) $products as $product ) {
			if ( ! is_object( $product ) || ! method_exists( $product, 'is_visible' ) || ! $product->is_visible() ) {
				continue;
			}
			$img_id  = $product->get_image_id();
			$img     = $img_id ? (string) wp_get_attachment_image_url( $img_id, 'woocommerce_thumbnail' ) : '';
			// Clean the price: drop the "screen-reader-text" span, strip tags, decode entities ($, –).
			$price_html = (string) $product->get_price_html();
			$price_html = (string) preg_replace( '#<span class="screen-reader-text">.*?</span>#is', '', $price_html );
			$price      = trim( html_entity_decode( wp_strip_all_tags( $price_html ), ENT_QUOTES, 'UTF-8' ) );
			$cards[] = array(
				'title'   => wp_strip_all_tags( (string) $product->get_name() ),
				'url'     => (string) $product->get_permalink(),
				'image'   => esc_url_raw( $img ),
				'price'   => $price,
				'onSale'  => (bool) $product->is_on_sale(),
				'inStock' => (bool) $product->is_in_stock(),
				// Woo-native add-to-cart, always an ABSOLUTE url (add_to_cart_url() is relative to the
				// current request, which is the REST route here). Simple+buyable → `permalink?add-to-cart=id`;
				// variable/grouped/out-of-stock → the product page ("Select options" / "Read more").
				'addUrl'  => esc_url_raw(
					( 'simple' === $product->get_type() && $product->is_purchasable() && $product->is_in_stock() )
						? add_query_arg( 'add-to-cart', $product->get_id(), $product->get_permalink() )
						: (string) $product->get_permalink()
				),
				'addText' => wp_strip_all_tags( (string) $product->add_to_cart_text() ),
			);
			if ( count( $cards ) >= $limit ) {
				break;
			}
		}

		return $cards;
	}

	/**
	 * Resolves the lead-notification recipient (falls back to the site admin email).
	 *
	 * @return string
	 */
	private function ai_lead_recipient(): string {
		$to = trim( (string) $this->ai_settings()['lead_recipient'] );
		if ( '' === $to || ! is_email( $to ) ) {
			$to = (string) get_option( 'admin_email' );
		}
		return $to;
	}

	/**
	 * Allowed icon keys for FAQ / action buttons (mirrors
	 * {@see \nexulesuite_\Public\Shortcodes::livechat_ai_icon_set()} keys).
	 *
	 * @return array<int,string>
	 */
	private function ai_allowed_icon_keys(): array {
		return array(
			'stethoscope', 'dollar', 'shield', 'pin', 'calendar', 'phone',
			'directions', 'chat', 'question', 'clock', 'info', 'heart', 'mail', 'user',
		);
	}

	/**
	 * Sanitizes AI quick-action buttons (Book / Call / Directions, reference-style).
	 *
	 * Shape: array of `{ label, icon, url }`.
	 *
	 * @param mixed $raw Raw actions array.
	 * @return array<int,array<string,string>>
	 */
	private function sanitize_ai_actions( $raw ): array {
		if ( ! is_array( $raw ) ) {
			return array();
		}

		$allowed = $this->ai_allowed_icon_keys();
		$out     = array();
		foreach ( $raw as $act ) {
			if ( ! is_array( $act ) ) {
				continue;
			}
			$label = trim( sanitize_text_field( (string) ( $act['label'] ?? '' ) ) );
			if ( '' === $label ) {
				continue;
			}
			$icon = sanitize_key( (string) ( $act['icon'] ?? '' ) );
			if ( ! in_array( $icon, $allowed, true ) ) {
				$icon = '';
			}
			$out[] = array(
				'label' => mb_substr( $label, 0, 60 ),
				'icon'  => $icon,
				'url'   => $this->sanitize_ai_action_url( (string) ( $act['url'] ?? '' ) ),
			);
			if ( count( $out ) >= 5 ) {
				break;
			}
		}

		return $out;
	}

	/**
	 * Sanitizes a single quick-action button target.
	 *
	 * Accepts three shapes:
	 *   - A form shortcode pasted directly, e.g. `[nexulesuite_form id="5"]` — kept verbatim so the
	 *     widget can render it inline in the chat. `esc_url_raw()` would otherwise strip the brackets
	 *     and quotes and turn it into a broken link.
	 *   - Built-in inline tokens (`#lead`, `#form`, …) — leading-`#` fragments survive esc_url_raw.
	 *   - Ordinary links (tel:/mailto:/sms:/http(s):).
	 *
	 * @param string $raw Raw URL / shortcode from the editor.
	 * @return string Sanitized target.
	 */
	private function sanitize_ai_action_url( string $raw ): string {
		$raw = trim( $raw );
		if ( '' === $raw ) {
			return '';
		}
		if ( $this->is_form_shortcode( $raw ) ) {
			return mb_substr( $raw, 0, 500 );
		}
		return esc_url_raw( $raw, array( 'http', 'https', 'tel', 'mailto', 'sms' ) );
	}

	/**
	 * Whether a string is a single form/embed shortcode (e.g. `[nexulesuite_form id="5"]`,
	 * `[contact-form-7 id="12"]`). Used to route pasted shortcodes to inline rendering rather
	 * than URL sanitization.
	 *
	 * @param string $raw Raw value.
	 * @return bool
	 */
	private function is_form_shortcode( string $raw ): bool {
		return (bool) preg_match( '/^\[[a-z][a-z0-9_\-]*(\s[^\]]*)?\]$/is', trim( $raw ) );
	}

	/**
	 * Sanitizes the two-level FAQ / conditional-button config.
	 *
	 * Shape: array of items, each `{ id, label, answer, followups:[{label, answer}] }`.
	 * Used both when reading settings and before persisting from the editor.
	 *
	 * @param mixed $raw Raw items array (or anything).
	 * @return array<int,array<string,mixed>>
	 */
	private function sanitize_ai_faq_items( $raw ): array {
		if ( ! is_array( $raw ) ) {
			return array();
		}

		$items = array();
		$index = 0;
		foreach ( $raw as $item ) {
			if ( ! is_array( $item ) ) {
				continue;
			}
			$label = trim( sanitize_text_field( (string) ( $item['label'] ?? '' ) ) );
			if ( '' === $label ) {
				continue;
			}
			++$index;

			$followups = array();
			$raw_follow = isset( $item['followups'] ) && is_array( $item['followups'] ) ? $item['followups'] : array();
			foreach ( array_slice( $raw_follow, 0, 8 ) as $fu ) {
				if ( ! is_array( $fu ) ) {
					continue;
				}
				$fu_label = trim( sanitize_text_field( (string) ( $fu['label'] ?? '' ) ) );
				if ( '' === $fu_label ) {
					continue;
				}
				$followups[] = array(
					'label'  => mb_substr( $fu_label, 0, 120 ),
					'answer' => mb_substr( sanitize_textarea_field( (string) ( $fu['answer'] ?? '' ) ), 0, 2000 ),
				);
			}

			$id = sanitize_key( (string) ( $item['id'] ?? '' ) );
			if ( '' === $id ) {
				$id = 'faq' . $index;
			}

			$icon = sanitize_key( (string) ( $item['icon'] ?? '' ) );
			if ( ! in_array( $icon, $this->ai_allowed_icon_keys(), true ) ) {
				$icon = '';
			}

			$items[] = array(
				'id'        => substr( $id, 0, 40 ),
				'label'     => mb_substr( $label, 0, 120 ),
				'answer'    => mb_substr( sanitize_textarea_field( (string) ( $item['answer'] ?? '' ) ), 0, 2000 ),
				'icon'      => $icon,
				'followups' => $followups,
			);

			if ( count( $items ) >= 20 ) {
				break;
			}
		}

		return $items;
	}

	/**
	 * Lightweight heuristic intent + sentiment classifier (no LLM call — fast/free).
	 * Used to tag logged conversations for the Reports analytics.
	 *
	 * @param string $text Visitor message.
	 * @return array{intent:string,sentiment:string}
	 */
	private function ai_classify( string $text ): array {
		$t = ' ' . strtolower( $text ) . ' ';

		$intent = 'question';
		if ( preg_match( '/\b(hi|hello|hey|good morning|good afternoon|good evening|salam|assalam)\b/', $t ) ) {
			$intent = 'greeting';
		} elseif ( preg_match( '/\b(price|prices|pricing|cost|costs|how much|quote|fee|fees|charge|charges)\b/', $t ) ) {
			$intent = 'pricing';
		} elseif ( preg_match( '/\b(book|booking|appointment|appointments|schedule|reserve|reservation|availability|slot|slots)\b/', $t ) ) {
			$intent = 'booking';
		} elseif ( preg_match( '/\b(buy|order|orders|product|products|purchase|shop|cart|checkout|stock|delivery|shipping)\b/', $t ) ) {
			$intent = 'product';
		} elseif ( preg_match( '/\b(refund|complaint|complain|broken|not working|doesn.?t work|cancel|cancellation|disappointed)\b/', $t ) ) {
			$intent = 'complaint';
		} elseif ( preg_match( '/\b(contact|call|phone|email|reach|talk to|human|agent|representative|support)\b/', $t ) ) {
			$intent = 'contact';
		}

		$sentiment = 'neutral';
		if ( preg_match( '/\b(thanks|thank you|great|awesome|love|excellent|perfect|helpful|amazing|wonderful|good)\b/', $t ) ) {
			$sentiment = 'positive';
		}
		if ( preg_match( '/\b(angry|terrible|worst|hate|awful|useless|disappointed|frustrated|not working|broken|bad)\b/', $t ) ) {
			$sentiment = 'negative';
		}
		if ( preg_match( '/\b(urgent|asap|emergency|immediately|right now|as soon as possible)\b/', $t ) || substr_count( $text, '!' ) >= 2 ) {
			$sentiment = 'urgent';
		}

		return array( 'intent' => $intent, 'sentiment' => $sentiment );
	}

	/**
	 * Default grounding system prompt (used when the admin leaves it blank).
	 *
	 * @return string
	 */
	private function ai_default_system_prompt(): string {
		$name = trim( wp_strip_all_tags( (string) get_bloginfo( 'name' ) ) );
		if ( '' === $name ) {
			$name = 'our company';
		}
		return sprintf(
			/* translators: %1$s: site name (repeated). */
			'You are the AI Support Specialist for %1$s. Always speak on behalf of %1$s using "we" and "our" — you represent this business, not a generic tool. When a visitor greets you (e.g. "hi", "hello") or asks who you are or your name, introduce yourself as "%1$s Support Specialist" and briefly offer to help; never call yourself a generic AI/chatbot and never mention the platform or CMS the website is built on (e.g. WordPress). Answer using the provided context about our services, products, pricing, booking, appointments, consultations, location, hours and contact details. If a visitor asks what we do or what services we offer, summarise our actual services and offerings from the context — never say we do not provide services. Match the answer length to the question: a simple question gets 1-2 short sentences; a normal question gets one concise paragraph; only a genuinely complex question gets a short structured answer with bullet points. Use bullet points for any list (multiple services, steps, options). Never write long paragraphs, never repeat yourself, and never add information the visitor did not ask for. Be specific and factual: state only services, prices and details actually present in the context, and never pad with marketing filler, vague reassurances, or invented offerings. If a specific detail is genuinely not in the context, briefly say you do not have that particular detail and offer to connect a human or take the visitor\'s contact details. Stay warm and professional, and always reply in the same language the visitor used.',
			$name
		);
	}

	/**
	 * Low-level request to the configured AI server (adds the Bearer key server-side).
	 *
	 * @param string             $method HTTP method.
	 * @param string             $path   Path (e.g. '/chat').
	 * @param array<string,mixed>|null $body Optional JSON body.
	 * @param int                $timeout Request timeout in seconds.
	 * @return array<string,mixed>|\WP_Error Decoded JSON, or WP_Error.
	 */
	/**
	 * Per-request LLM provider override for the AI server.
	 *
	 * Returns null when nothing is configured here, in which case the AI server
	 * falls back to its own `.env`. Only the provider *name* is sent — the server
	 * resolves the base URL itself, so this can never point it at another host.
	 * The decrypted key leaves WordPress only on this server-to-server hop.
	 *
	 * @param array<string,mixed>|null $s Pre-read AI settings, to avoid re-decrypting.
	 * @return array<string,string>|null
	 */
	private function ai_llm_override( ?array $s = null ): ?array {
		$s = $s ?? $this->ai_settings();
		if ( '' === (string) $s['llm_provider'] ) {
			return null;
		}

		/*
		 * The AI server only knows a subset of the providers offered in `direct` mode.
		 * Switching direct→server with, say, Gemini selected would make it raise on an
		 * unknown provider; fall back to the server's own credential instead.
		 */
		self::ai_load_llm_client();
		$definition = \nexulesuite_\AI\Llm_Client::provider( (string) $s['llm_provider'] );
		if ( null === $definition || empty( $definition['server'] ) ) {
			return null;
		}

		$override = array( 'provider' => (string) $s['llm_provider'] );
		if ( '' !== (string) $s['llm_model'] ) {
			$override['model'] = (string) $s['llm_model'];
		}
		if ( '' !== (string) $s['llm_key'] ) {
			$override['api_key'] = (string) $s['llm_key'];
		}
		return $override;
	}

	private function ai_server_request( string $method, string $path, ?array $body = null, int $timeout = 45 ) {
		$s    = $this->ai_settings();
		$base = $s['url'];
		if ( '' === $base ) {
			return new \WP_Error( 'nexulesuite_ai_noserver', __( 'AI server URL is not configured.', 'nexus-lead-suite' ), array( 'status' => 400 ) );
		}

		/*
		 * The admin's AI server may be on localhost / a private IP and/or a non-standard
		 * port (e.g. http://localhost:8000) during local development. WordPress blocks
		 * loopback/private hosts and ports outside {80,443,8080} in wp_http_validate_url()
		 * as an SSRF guard. Since only `manage_options` users set this URL and it targets
		 * their own infrastructure, whitelist JUST the configured host + port for this one
		 * request, then restore the defaults.
		 */
		$parsed    = wp_parse_url( $base );
		$ai_host   = isset( $parsed['host'] ) ? (string) $parsed['host'] : '';
		$ai_port   = isset( $parsed['port'] ) ? (int) $parsed['port'] : 0;
		$allow_host = static function ( $is_external, $check_host ) use ( $ai_host ) {
			return ( '' !== $ai_host && $check_host === $ai_host ) ? true : $is_external;
		};
		$allow_port = static function ( $ports ) use ( $ai_port ) {
			if ( $ai_port > 0 && is_array( $ports ) && ! in_array( $ai_port, $ports, true ) ) {
				$ports[] = $ai_port;
			}
			return $ports;
		};
		add_filter( 'http_request_host_is_external', $allow_host, 10, 2 );
		add_filter( 'http_allowed_safe_ports', $allow_port, 10, 1 );

		$restore = static function () use ( $allow_host, $allow_port ) {
			remove_filter( 'http_request_host_is_external', $allow_host, 10 );
			remove_filter( 'http_allowed_safe_ports', $allow_port, 10 );
		};

		if ( ! wp_http_validate_url( $base ) ) {
			$restore();
			return new \WP_Error( 'nexulesuite_ai_badurl', __( 'AI server URL is invalid.', 'nexus-lead-suite' ), array( 'status' => 400 ) );
		}

		$args = array(
			'method'  => $method,
			'timeout' => $timeout,
			'headers' => array(
				'Content-Type'  => 'application/json',
				'Authorization' => 'Bearer ' . $s['key'],
			),
		);
		if ( null !== $body ) {
			$args['body'] = wp_json_encode( $body );
		}

		$res = wp_remote_request( $base . '/' . ltrim( $path, '/' ), $args );
		$restore();
		if ( is_wp_error( $res ) ) {
			return new \WP_Error( 'nexulesuite_ai_unreachable', $res->get_error_message(), array( 'status' => 502 ) );
		}

		$code = (int) wp_remote_retrieve_response_code( $res );
		$json = json_decode( (string) wp_remote_retrieve_body( $res ), true );
		if ( $code < 200 || $code >= 300 ) {
			$msg = ( is_array( $json ) && isset( $json['detail'] ) ) ? (string) $json['detail'] : sprintf(
				/* translators: %d: HTTP status code. */
				__( 'AI server returned an error (%d).', 'nexus-lead-suite' ),
				$code
			);
			return new \WP_Error( 'nexulesuite_ai_http', $msg, array( 'status' => $code > 0 ? $code : 502 ) );
		}

		return is_array( $json ) ? $json : array();
	}

	/**
	 * Admin: test connectivity to the AI server (`GET /health`).
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response
	 */
	public function ai_test_connection( \WP_REST_Request $request ): \WP_REST_Response {
		unset( $request );
		$s = $this->ai_settings();

		if ( 'direct' === $s['mode'] ) {
			return rest_ensure_response( $this->ai_test_direct( $s ) );
		}

		/* Ask the server about the provider+model configured HERE, not its own default. */
		$path = '/health';
		if ( '' !== (string) $s['llm_provider'] || '' !== (string) $s['llm_model'] ) {
			$path = add_query_arg(
				array_filter(
					array(
						'provider' => (string) $s['llm_provider'],
						'model'    => (string) $s['llm_model'],
					)
				),
				$path
			);
		}

		$res = $this->ai_server_request( 'GET', $path, null, 20 );
		if ( is_wp_error( $res ) ) {
			return rest_ensure_response( array( 'success' => false, 'message' => $res->get_error_message() ) );
		}

		/*
		 * A reachable server proves nothing about the model provider's key. When a
		 * provider is configured here, make one tiny real completion so a bad key
		 * surfaces now instead of on a visitor's first message.
		 */
		$llm_override = $this->ai_llm_override( $s );
		if ( null !== $llm_override ) {
			$probe = $this->ai_server_request( 'POST', '/provider/test', array( 'llm' => $llm_override ), 45 );
			if ( is_wp_error( $probe ) ) {
				$res['providerTest'] = array( 'ok' => false, 'error' => $probe->get_error_message() );
			} else {
				$res['providerTest'] = $probe;
			}
			if ( empty( $res['providerTest']['ok'] ) ) {
				return rest_ensure_response(
					array(
						'success' => false,
						'message' => sprintf(
							/* translators: 1: provider name, 2: upstream error message. */
							__( 'Server reachable, but the %1$s key was rejected: %2$s', 'nexus-lead-suite' ),
							(string) $s['llm_provider'],
							(string) ( $res['providerTest']['error'] ?? __( 'unknown error', 'nexus-lead-suite' ) )
						),
						'data'    => $res,
					)
				);
			}
		}

		return rest_ensure_response( array( 'success' => true, 'data' => $res ) );
	}

	/**
	 * Admin: verify the direct provider connection.
	 *
	 * Runs one real 8-token completion so a bad key fails here rather than on a visitor's
	 * first message, then embeds one short string to prove the retrieval half works too.
	 *
	 * @param array<string,mixed> $s Pre-read AI settings.
	 * @return array<string,mixed>
	 */
	private function ai_test_direct( array $s ): array {
		self::ai_load_llm_client();
		self::ai_load_vector_store();

		$provider = (string) $s['llm_provider'];
		if ( '' === $provider || ! \nexulesuite_\AI\Llm_Client::supports_direct_chat( $provider ) ) {
			return array(
				'success' => false,
				'message' => __( 'Choose an AI provider (e.g. OpenAI, Claude, Gemini) and click Save Configuration first.', 'nexus-lead-suite' ),
			);
		}

		/* Without this the vendor answers with its own "bad key" text, which reads as a key problem rather than a missing one. */
		if ( '' === trim( (string) $s['llm_key'] ) ) {
			return array(
				'success' => false,
				'message' => sprintf(
					/* translators: %s: provider label. */
					__( 'No %s API key is saved. Paste the key for this provider, then click Save Configuration.', 'nexus-lead-suite' ),
					\nexulesuite_\AI\Llm_Client::label( $provider )
				),
			);
		}

		$model = '' !== (string) $s['llm_model'] ? (string) $s['llm_model'] : \nexulesuite_\AI\Llm_Client::default_chat_model( $provider );
		$probe = \nexulesuite_\AI\Llm_Client::test_chat( $provider, $model, (string) $s['llm_key'] );
		if ( is_wp_error( $probe ) ) {
			return array(
				'success' => false,
				'message' => sprintf(
					/* translators: 1: provider label, 2: upstream error message. */
					__( '%1$s rejected the request: %2$s', 'nexus-lead-suite' ),
					\nexulesuite_\AI\Llm_Client::label( $provider ),
					$probe->get_error_message()
				),
			);
		}

		$data = array(
			'mode'         => 'direct',
			'provider'     => \nexulesuite_\AI\Llm_Client::label( $provider ),
			'chat_model'   => $model,
			'capabilities' => array( 'vision' => \nexulesuite_\AI\Llm_Client::supports_vision( $provider ) ),
			'providerTest' => array( 'ok' => true, 'latency_ms' => (int) $probe['latency_ms'] ),
			'chunks'       => \nexulesuite_\Core\Vector_Store::count(),
			'documents'    => \nexulesuite_\Core\Vector_Store::documents(),
		);

		$embed = $this->ai_embed_config( $s );
		if ( null === $embed ) {
			$data['embed'] = array(
				'ok'      => false,
				'message' => __( 'No embedding provider is configured, so the chatbot cannot search your site content. Pick one under Knowledge Base.', 'nexus-lead-suite' ),
			);

			return array( 'success' => false, 'message' => (string) $data['embed']['message'], 'data' => $data );
		}

		$vectors = \nexulesuite_\AI\Llm_Client::embed( $embed['provider'], $embed['model'], $embed['key'], array( 'connection test' ) );
		if ( is_wp_error( $vectors ) || empty( $vectors[0] ) ) {
			$reason        = is_wp_error( $vectors ) ? $vectors->get_error_message() : __( 'the provider returned no vector', 'nexus-lead-suite' );
			$data['embed'] = array( 'ok' => false, 'message' => $reason );

			return array(
				'success' => false,
				'message' => sprintf(
					/* translators: 1: provider label, 2: upstream error message. */
					__( 'Chat works, but embeddings failed on %1$s: %2$s', 'nexus-lead-suite' ),
					\nexulesuite_\AI\Llm_Client::label( $embed['provider'] ),
					$reason
				),
				'data'    => $data,
			);
		}

		$dims          = count( $vectors[0] );
		$indexed_dims  = \nexulesuite_\Core\Vector_Store::dims();
		$data['embed'] = array(
			'ok'       => true,
			'provider' => \nexulesuite_\AI\Llm_Client::label( $embed['provider'] ),
			'model'    => $embed['model'],
			'dims'     => $dims,
		);

		// A vector is only comparable with vectors of the same width — swapping the
		// embedding model silently orphans everything already indexed.
		if ( $indexed_dims > 0 && $indexed_dims !== $dims ) {
			return array(
				'success' => false,
				'message' => sprintf(
					/* translators: 1: dimensions of the indexed vectors, 2: dimensions the current model produces. */
					__( 'Chat and embeddings both work, but your knowledge base was built with %1$d-dimension vectors and this model produces %2$d. Click Train Now to rebuild it.', 'nexus-lead-suite' ),
					$indexed_dims,
					$dims
				),
				'data'    => $data,
			);
		}

		return array( 'success' => true, 'data' => $data );
	}

	/**
	 * Admin: push a batch of site content to the AI server for training (`POST /ingest`).
	 *
	 * Batches published posts + pages by offset/limit so large sites don't time out.
	 * Manual Q&A / notes are included on the first batch only. `reset` wipes the
	 * collection before the first batch.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response
	 */
	/**
	 * Post types eligible for AI training: pages + posts, WooCommerce products
	 * (when active), and other public custom post types. Filterable.
	 *
	 * @return array<int,string>
	 */
	private function ai_trainable_post_types(): array {
		$types = array( 'page', 'post' );

		if ( post_type_exists( 'product' ) ) {
			$types[] = 'product';
		}

		$exclude = array( 'attachment', 'nav_menu_item', 'elementor_library', 'e-landing-page', 'wp_block', 'wp_template', 'wp_template_part', 'wp_navigation', 'shop_order', 'shop_coupon', 'product_variation' );
		$cpts    = get_post_types( array( 'public' => true, '_builtin' => false ), 'names' );
		foreach ( (array) $cpts as $cpt ) {
			if ( ! in_array( $cpt, $types, true ) && ! in_array( $cpt, $exclude, true ) ) {
				$types[] = $cpt;
			}
		}

		/**
		 * Filters the post types the AI trainer ingests.
		 *
		 * @param array<int,string> $types Post type slugs.
		 */
		$filtered = apply_filters( 'nexulesuite_ai_trainable_post_types', $types );
		return is_array( $filtered ) && ! empty( $filtered ) ? array_values( array_unique( array_map( 'strval', $filtered ) ) ) : $types;
	}

	/**
	 * Appends WooCommerce product facts (price, SKU, stock, short description) to
	 * a product's training text. Returns '' for non-products or when Woo is absent.
	 *
	 * @param \WP_Post $post Post object.
	 * @return string
	 */
	private function ai_product_extra_text( \WP_Post $post ): string {
		if ( 'product' !== $post->post_type || ! function_exists( 'wc_get_product' ) ) {
			return '';
		}
		$product = wc_get_product( $post->ID );
		if ( ! $product ) {
			return '';
		}

		$bits  = array();
		$price = wp_strip_all_tags( (string) $product->get_price_html() );
		if ( '' !== trim( $price ) ) {
			$bits[] = 'Price: ' . $price;
		}
		$sku = (string) $product->get_sku();
		if ( '' !== $sku ) {
			$bits[] = 'SKU: ' . $sku;
		}
		$bits[] = $product->is_in_stock() ? 'Availability: in stock' : 'Availability: out of stock';
		$short  = trim( wp_strip_all_tags( (string) $product->get_short_description() ) );
		if ( '' !== $short ) {
			$bits[] = $short;
		}

		return $bits ? "\n\n" . implode( ' | ', $bits ) : '';
	}

	public function ai_train( \WP_REST_Request $request ): \WP_REST_Response {
		$offset = max( 0, (int) $request->get_param( 'offset' ) );
		$limit  = (int) $request->get_param( 'limit' );
		if ( $limit <= 0 || $limit > 50 ) {
			$limit = 20;
		}
		$reset = ! empty( $request->get_param( 'reset' ) ) && 0 === $offset;

		$s    = $this->ai_settings();
		$docs = array();

		// Manual Q&A / notes + external "learn from" URLs — first batch only.
		if ( 0 === $offset ) {
			$manual = trim( (string) $s['manual_qa'] );
			if ( '' !== $manual ) {
				$docs[] = array(
					'id'          => 'manual-qa',
					'source_type' => 'qa',
					'source_ref'  => 'manual',
					'title'       => __( 'Manual notes', 'nexus-lead-suite' ),
					'url'         => '',
					'text'        => $manual,
				);
			}
			foreach ( $this->ai_fetch_url_docs() as $url_doc ) {
				$docs[] = $url_doc;
			}
		}

		$query = new \WP_Query(
			array(
				'post_type'           => $this->ai_trainable_post_types(),
				'post_status'         => 'publish',
				'posts_per_page'      => $limit,
				'offset'              => $offset,
				'orderby'             => 'ID',
				'order'               => 'ASC',
				'ignore_sticky_posts' => true,
			)
		);

		$total = (int) $query->found_posts;
		foreach ( $query->posts as $post ) {
			// Products can trigger heavy Woo loops via the_content — use raw content for them.
			// phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound -- WordPress core filter; applied deliberately so shortcodes/blocks render before indexing.
			$content = ( 'product' === $post->post_type ) ? $post->post_content : apply_filters( 'the_content', $post->post_content );
			$body    = trim( wp_strip_all_tags( (string) $content ) );
			$extra   = $this->ai_product_extra_text( $post );
			if ( '' === $body && '' === $extra ) {
				continue;
			}
			$title = (string) get_the_title( $post );
			$docs[] = array(
				'id'          => 'post-' . (int) $post->ID,
				'source_type' => (string) $post->post_type,
				'source_ref'  => (string) $post->ID,
				'title'       => $title,
				'url'         => (string) get_permalink( $post ),
				'text'        => trim( $title . "\n\n" . $body . $extra ),
			);
		}
		wp_reset_postdata();

		$next_offset = $offset + $limit;
		$done        = $next_offset >= $total;

		if ( 'direct' === $s['mode'] ) {
			$indexed = $this->ai_index_documents_direct( $s, $docs, $reset );
			if ( is_wp_error( $indexed ) ) {
				return rest_ensure_response( array( 'success' => false, 'message' => $indexed->get_error_message() ) );
			}
			$chunks       = (int) $indexed;
			$total_chunks = \nexulesuite_\Core\Vector_Store::count();
		} else {
			$res = $this->ai_server_request(
				'POST',
				'/ingest',
				array(
					'site_id'   => $this->ai_site_id(),
					'reset'     => $reset,
					'documents' => $docs,
				),
				90
			);
			if ( is_wp_error( $res ) ) {
				return rest_ensure_response( array( 'success' => false, 'message' => $res->get_error_message() ) );
			}
			$chunks       = (int) ( $res['chunks'] ?? 0 );
			$total_chunks = (int) ( $res['total_chunks'] ?? 0 );
		}

		return rest_ensure_response(
			array(
				'success' => true,
				'data'    => array(
					'processed'   => count( $query->posts ),
					'offset'      => $offset,
					'nextOffset'  => $done ? null : $next_offset,
					'total'       => $total,
					'done'        => $done,
					'chunks'      => $chunks,
					'totalChunks' => $total_chunks,
				),
			)
		);
	}

	/**
	 * Chunks + embeds a batch of documents into the WordPress vector store.
	 *
	 * Each document replaces its own previous chunks, so re-training one batch never
	 * blanks the rest of the knowledge base. `$reset` wipes everything up front.
	 *
	 * @param array<string,mixed>            $s     Pre-read AI settings.
	 * @param array<int,array<string,mixed>> $docs  Documents from {@see ai_train()}.
	 * @param bool                           $reset Wipe the index before writing.
	 * @return int|\WP_Error Chunks written, or the first embedding failure.
	 */
	private function ai_index_documents_direct( array $s, array $docs, bool $reset ) {
		self::ai_load_llm_client();
		self::ai_load_vector_store();

		$embed = $this->ai_embed_config( $s );
		if ( null === $embed ) {
			return new \WP_Error(
				'nexulesuite_ai_noembed',
				__( 'Pick an embedding provider and save its API key (Settings → AI Chatbot → Knowledge Base) before training.', 'nexus-lead-suite' ),
				array( 'status' => 400 )
			);
		}

		if ( $reset ) {
			\nexulesuite_\Core\Vector_Store::delete_all();
		}

		$written = 0;
		foreach ( $docs as $doc ) {
			$chunks = \nexulesuite_\Core\Vector_Store::chunk_text( (string) ( $doc['text'] ?? '' ) );
			if ( empty( $chunks ) ) {
				continue;
			}

			$vectors = array();
			foreach ( array_chunk( $chunks, self::AI_EMBED_BATCH ) as $batch ) {
				$embedded = \nexulesuite_\AI\Llm_Client::embed( $embed['provider'], $embed['model'], $embed['key'], $batch );
				if ( is_wp_error( $embedded ) ) {
					return $embedded;
				}
				if ( count( $embedded ) !== count( $batch ) ) {
					return new \WP_Error(
						'nexulesuite_ai_embedcount',
						__( 'The embedding provider returned fewer vectors than chunks sent. Try again.', 'nexus-lead-suite' ),
						array( 'status' => 502 )
					);
				}
				$vectors = array_merge( $vectors, $embedded );
			}

			$written += \nexulesuite_\Core\Vector_Store::replace_document(
				(string) ( $doc['id'] ?? '' ),
				array(
					'source_type' => (string) ( $doc['source_type'] ?? '' ),
					'source_ref'  => (string) ( $doc['source_ref'] ?? '' ),
					'title'       => (string) ( $doc['title'] ?? '' ),
					'url'         => (string) ( $doc['url'] ?? '' ),
				),
				$chunks,
				$vectors
			);
		}

		return $written;
	}

	/**
	 * Admin: wipe this site's trained memory on the AI server (`POST /reset`).
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response
	 */
	public function ai_reset( \WP_REST_Request $request ): \WP_REST_Response {
		unset( $request );
		$s = $this->ai_settings();

		if ( 'direct' === $s['mode'] ) {
			self::ai_load_vector_store();
			$removed = \nexulesuite_\Core\Vector_Store::delete_all();

			return rest_ensure_response( array( 'success' => true, 'data' => array( 'removed' => $removed ) ) );
		}

		$res = $this->ai_server_request( 'POST', '/reset', array( 'site_id' => $this->ai_site_id() ), 20 );
		if ( is_wp_error( $res ) ) {
			return rest_ensure_response( array( 'success' => false, 'message' => $res->get_error_message() ) );
		}
		return rest_ensure_response( array( 'success' => true, 'data' => $res ) );
	}

	/**
	 * Public: answer a visitor's question (`POST /ai/chat`).
	 *
	 * Guarded by the custom `nexulesuite_ai` nonce + a per-IP rate limit, mirroring
	 * {@see receive_track_events()}. The AI server URL, Bearer key and system prompt
	 * are injected server-side; the browser never sees them.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function ai_chat( \WP_REST_Request $request ) {
		$nonce      = sanitize_text_field( (string) $request->get_param( 'nonce' ) );
		$message    = (string) $request->get_param( 'message' );
		$history    = $request->get_param( 'history' );
		$image      = (string) $request->get_param( 'image' );
		$file       = $request->get_param( 'file' );
		$session_id = sanitize_text_field( (string) $request->get_param( 'session_id' ) );

		$json = $request->get_json_params();
		if ( is_array( $json ) ) {
			if ( '' === $nonce && isset( $json['nonce'] ) ) {
				$nonce = sanitize_text_field( (string) $json['nonce'] );
			}
			if ( '' === $message && isset( $json['message'] ) ) {
				$message = (string) $json['message'];
			}
			if ( ! is_array( $history ) && isset( $json['history'] ) && is_array( $json['history'] ) ) {
				$history = $json['history'];
			}
			if ( '' === $image && isset( $json['image'] ) ) {
				$image = (string) $json['image'];
			}
			if ( ! is_array( $file ) && isset( $json['file'] ) && is_array( $json['file'] ) ) {
				$file = $json['file'];
			}
			if ( '' === $session_id && isset( $json['session_id'] ) ) {
				$session_id = sanitize_text_field( (string) $json['session_id'] );
			}
		}

		if ( ! wp_verify_nonce( $nonce, 'nexulesuite_ai' ) ) {
			return new \WP_Error(
				'nexulesuite_ai_nonce',
				__( 'Your session expired. Please refresh the page and try again.', 'nexus-lead-suite' ),
				array( 'status' => 403 )
			);
		}

		$s = $this->ai_settings();
		if ( empty( $s['enabled'] ) ) {
			return new \WP_Error( 'nexulesuite_ai_disabled', __( 'AI chat is not available.', 'nexus-lead-suite' ), array( 'status' => 403 ) );
		}

		$message = trim( wp_strip_all_tags( $message ) );
		if ( strlen( $message ) > 2000 ) {
			$message = substr( $message, 0, 2000 );
		}

		/* Validate an optional attached image (base64 data URI). Only allowed when the admin enabled it. */
		$image = trim( $image );
		if ( '' !== $image ) {
			if ( empty( $s['allow_images'] ) ) {
				$image = '';
			} elseif ( ! preg_match( '#^data:image/(png|jpe?g|gif|webp);base64,[A-Za-z0-9+/=\r\n]+$#', $image ) ) {
				return new \WP_Error( 'nexulesuite_ai_badimage', __( 'Unsupported image format.', 'nexus-lead-suite' ), array( 'status' => 400 ) );
			} elseif ( strlen( $image ) > self::AI_IMAGE_MAX_BASE64 ) {
				return new \WP_Error( 'nexulesuite_ai_bigimage', __( 'Image is too large (max ~15 MB).', 'nexus-lead-suite' ), array( 'status' => 413 ) );
			}
		}

		/*
		 * Vision has no memory: the chat history carries text only, so a visitor who shares
		 * an image and then asks a follow-up ("do you see it?", "what is this?") would get
		 * "I can't see images" because that turn has no image. Keep the last image for the
		 * session (short TTL) and re-attach it to a follow-up that clearly refers to a
		 * picture, so the image stays in context across turns.
		 */
		if ( '' !== $session_id && ! empty( $s['allow_images'] ) ) {
			$img_cache_key = 'nexulesuite_ai_img_' . md5( $session_id );
			if ( '' !== $image ) {
				set_transient( $img_cache_key, $image, 15 * MINUTE_IN_SECONDS );
			} elseif ( preg_match( '/\b(images?|pictures?|pics?|photos?|screenshots?)\b|\b(?:do|can|could|did)\s+you\s+see\b|\bwhat\s+(?:is|are|do)\s+(?:this|that|these|those|you\s+see)\b/i', $message ) ) {
				$stored = get_transient( $img_cache_key );
				if ( is_string( $stored ) && '' !== $stored ) {
					$image = $stored;
				}
			}
		}

		/* Validate an optional attached document and read its text (same admin gate as images). */
		$document = null;
		if ( is_array( $file ) && empty( $s['allow_images'] ) ) {
			$file = null;
		}
		if ( is_array( $file ) ) {
			$document = $this->ai_read_attached_file( $file );
			if ( is_wp_error( $document ) ) {
				return $document;
			}
		}

		if ( '' === $message && '' === $image && null === $document ) {
			return new \WP_Error( 'nexulesuite_ai_empty', __( 'Please type a message or attach a file.', 'nexus-lead-suite' ), array( 'status' => 400 ) );
		}

		// Per-IP rate limit (mirror the tracking endpoint).
		$ip     = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( (string) $_SERVER['REMOTE_ADDR'] ) ) : '';
		$rl_key = 'nexulesuite_airl_' . md5( $ip );
		$burst  = (int) get_transient( $rl_key );
		if ( $burst >= 30 ) {
			return new \WP_Error( 'nexulesuite_ai_ratelimit', __( 'Too many messages. Please wait a moment.', 'nexus-lead-suite' ), array( 'status' => 429 ) );
		}
		set_transient( $rl_key, $burst + 1, MINUTE_IN_SECONDS );

		// Sanitize the incoming short conversation history.
		$clean_history = array();
		if ( is_array( $history ) ) {
			foreach ( array_slice( $history, -8 ) as $turn ) {
				if ( ! is_array( $turn ) ) {
					continue;
				}
				$role    = ( isset( $turn['role'] ) && 'assistant' === $turn['role'] ) ? 'assistant' : 'user';
				$content = trim( wp_strip_all_tags( (string) ( $turn['content'] ?? '' ) ) );
				if ( '' === $content ) {
					continue;
				}
				$clean_history[] = array( 'role' => $role, 'content' => substr( $content, 0, 2000 ) );
			}
		}

		$system  = trim( (string) $s['system'] );
		if ( '' === $system ) {
			$system = $this->ai_default_system_prompt();
		}

		/*
		 * Attached-document text rides in the prompt rather than a separate field, so both
		 * transports carry it without the AI server needing to know about attachments.
		 */
		$prompt = $message;
		if ( null !== $document ) {
			$prompt = sprintf(
				/* translators: 1: file name, 2: extracted text, 3: the visitor's own message. */
				__( "The visitor attached a file named \"%1\$s\". Its text is between the markers below. Answer using it.\n\n<<<FILE>>>\n%2\$s\n<<<END FILE>>>\n\n%3\$s", 'nexus-lead-suite' ),
				$document['name'],
				$document['text'],
				'' !== $message ? $message : __( 'Summarise this file and list its key points.', 'nexus-lead-suite' )
			);
		}

		if ( 'direct' === $s['mode'] ) {
			$res      = $this->ai_chat_direct( $s, $prompt, $clean_history, $image, $system );
			$cite_min = self::AI_DIRECT_CITE_SCORE;
		} else {
			$payload = array(
				'site_id'       => $this->ai_site_id(),
				'message'       => $prompt,
				'history'       => $clean_history,
				'system_prompt' => $system,
				'max_chunks'    => (int) $s['max_chunks'],
			);
			$examples = $this->ai_parse_examples( (string) $s['examples'] );
			if ( ! empty( $examples ) ) {
				$payload['examples'] = $examples;
			}
			if ( '' !== $s['model'] ) {
				$payload['chat_model'] = $s['model'];
			}
			$llm_override = $this->ai_llm_override( $s );
			if ( null !== $llm_override ) {
				$payload['llm'] = $llm_override;
			}
			if ( '' !== $image ) {
				$payload['image'] = $image;
				if ( '' !== $s['vision_model'] ) {
					$payload['vision_model'] = $s['vision_model'];
				}
			}

			$res      = $this->ai_server_request( 'POST', '/chat', $payload, ( '' !== $image || null !== $document ) ? 120 : 60 );
			$cite_min = 0.5;
		}

		if ( is_wp_error( $res ) ) {
			// This endpoint is public: never surface the provider's error text to a visitor.
			return rest_ensure_response(
				array(
					'success' => false,
					'message' => __( 'Sorry, the assistant is unavailable right now. Please try again shortly.', 'nexus-lead-suite' ),
				)
			);
		}

		$answer   = (string) ( $res['answer'] ?? '' );
		$sources  = array();
		$seen_src = array();
		if ( isset( $res['sources'] ) && is_array( $res['sources'] ) ) {
			foreach ( $res['sources'] as $src ) {
				if ( ! is_array( $src ) ) {
					continue;
				}
				// Only cite genuinely relevant pages — hides "Hello world!"/"Sample Page"
				// noise on greetings and weak matches; deduped and capped at 3. The floor
				// differs per mode because the two retrieval stacks score on different scales.
				if ( (float) ( $src['score'] ?? 0 ) < $cite_min ) {
					continue;
				}
				$url = esc_url_raw( (string) ( $src['url'] ?? '' ) );
				if ( '' === $url || isset( $seen_src[ $url ] ) ) {
					continue;
				}
				$seen_src[ $url ] = true;
				$sources[]        = array(
					'title' => sanitize_text_field( (string) ( $src['title'] ?? '' ) ),
					'url'   => $url,
				);
				if ( count( $sources ) >= 3 ) {
					break;
				}
			}
		}

		// Classify the turn (intent + sentiment) for analytics.
		$tags = $this->ai_classify( $message );

		// Human-handoff intent: open the lead form when the visitor wants a person /
		// callback / to book a call — NOT on generic low confidence. Three signals:
		//  (a) the message matches a handoff phrase,
		//  (b) a short message is a strong handoff keyword (agent / live / support…),
		//  (c) the AI's own answer decided to escalate ("connect you with a human…").
		$handoff_user = (bool) preg_match(
			'/\b(?:talk|speak|chat|connect)\s+(?:to|with)\s+(?:a\s+|an\s+|the\s+)?(?:human|person|someone|somebody|agent|representative|rep|staff|team|advisor|expert|specialist|consultant|doctor|lawyer)\b'
			. '|\b(?:live|human|real)\s+(?:support|agent|person|chat|help|assistance|rep|representative)\b'
			. '|\b(?:human|agent|representative|advisor)\b'
			. '|\breal\s+person\b'
			. '|\b(?:call|contact|email|phone|text|reach)\s+me\b'
			. '|\breach\s+out\s+to\s+me\b|\bget\s+in\s+touch\b|\bcall\s?back\b|\bcallback\b'
			. '|\bbook\s+(?:an?\s+)?(?:call|meeting|consultation|demo|appointment)\b|\bschedule\s+(?:an?\s+)?(?:call|meeting|consultation|appointment)\b'
			. '|\bhave\s+(?:someone|somebody)\s+(?:call|contact|email|reach)\b'
			. '|\bi\s+(?:want|need|would\s+like|wanna)\s+(?:to\s+)?(?:talk|speak|chat|be\s+contacted|a\s+callback)\b/i',
			$message
		);
		// A short message that is a support/live/agent/booking keyword — but NOT an
		// informational question ("what services do you provide?" must be answered, not a form).
		$word_count  = str_word_count( $message );
		$is_question = (bool) preg_match( '/^\s*(?:what|what\'?s|how|where|when|which|who|why|do you|does|is there|are there|can i|could you|would you|tell me|explain|list|show me)\b/i', $message );
		$handoff_short = ! $is_question && $word_count > 0 && $word_count <= 4 && (bool) preg_match(
			'/\b(?:live\s*chat|live\s*support|live\s*agent|live\s*help|live|human|real\s+person|agent|representative|rep|advisor|consultant|specialist|receptionist|concierge|operator|executive|coordinator|technician'
			. '|escalate|escalation|handoff|hand-?off|callback|call\s?back|help\s*desk|helpdesk|service\s*desk'
			. '|support(?:\s*(?:agent|team|desk|staff|rep))?|customer\s+(?:support|service|care)|customer\s+care'
			. '|ticket|complaint|talk\s+to|speak\s+to|contact\s+(?:me|us|support|agent|sales|team)'
			. '|sales\s+(?:agent|rep|representative|consultant|team|executive)|booking|appointment|reservation|consultation)\b/i',
			$message
		);
		$handoff_answer = (bool) preg_match(
			'/\bconnect\s+you\s+(?:with|to)\b|\bescalat\w+|\bhuman\s+(?:representative|agent|colleague|being)\b'
			. '|\bput\s+you\s+in\s+touch\b|\bhold\s+(?:on\s+)?for\s+(?:a|just\s+a)\s+(?:moment|second)\b'
			. '|\bour\s+team\s+will\s+(?:reach|contact|get\s+back|be\s+in\s+touch)\b'
			. '|\b(?:someone|a\s+(?:team\s+member|colleague|specialist|representative))\s+(?:will|can)\s+(?:reach|contact|call|assist|help)\b'
			. '|\breach\s+out\s+to\s+you\s+(?:shortly|soon)\b/i',
			$answer
		);
		$handoff = $handoff_user || $handoff_short || $handoff_answer;

		// Store the transcript when the admin opted in (for the Chatbot report dashboard).
		if ( ! empty( $s['log_chats'] ) && '' !== trim( $answer ) ) {
			require_once nexulesuite_PLUGIN_DIR . 'core/class-chat-store.php';
			$page_url = '';
			if ( is_array( $json ) && isset( $json['page_url'] ) ) {
				$page_url = esc_url_raw( (string) $json['page_url'] );
			}
			// Log what the visitor typed, not the prompt with the whole document inlined.
			$logged = $message;
			if ( null !== $document ) {
				/* translators: %s: attached file name. */
				$logged = trim( $logged . ' ' . sprintf( __( '[attached: %s]', 'nexus-lead-suite' ), $document['name'] ) );
			}
			\nexulesuite_\Core\Chat_Store::record_exchange( $session_id, $logged, $answer, $sources, '' !== $image, $page_url, $tags['intent'], $tags['sentiment'] );
		}

		// Citations are noise on greetings/social turns, handoff requests, or weak matches — hide them there.
		$is_social = (bool) preg_match(
			'/^\s*(?:hi|hey+|hello|hiya|yo|sup|hola|namaste|salam|assalam[ou]*|good\s+(?:morning|afternoon|evening|day)'
			. '|thanks?|thank\s+you|thx|ok(?:ay)?|cool|great|nice|bye|goodbye|see\s+ya|yes|no|yeah|nope|hmm+)\b/i',
			$message
		);
		if ( $is_social || $handoff || ! empty( $res['low_confidence'] ) ) {
			$sources = array();
		}

		// WooCommerce product cards (guarded — empty unless Woo active + product-y message).
		$products = $this->ai_woo_product_cards( $message );

		return rest_ensure_response(
			array(
				'success' => true,
				'data'    => array(
					'answer'        => $answer,
					'sources'       => $sources,
					'lowConfidence' => ! empty( $res['low_confidence'] ),
					'handoff'       => $handoff,
					'intent'        => $tags['intent'],
					'sentiment'     => $tags['sentiment'],
					'products'      => $products,
				),
			)
		);
	}

	/**
	 * Decodes an attached document and extracts its text.
	 *
	 * Images take the vision path instead; this handles PDFs and plain-text formats,
	 * whose text is folded into the prompt so every provider can read them.
	 *
	 * @param array<string,mixed> $file Browser payload: name, mime, base64 data.
	 * @return array{name:string,mime:string,text:string}|\WP_Error
	 */
	private function ai_read_attached_file( array $file ) {
		require_once nexulesuite_PLUGIN_DIR . 'ai/class-file-text.php';

		$name = sanitize_file_name( (string) ( $file['name'] ?? '' ) );
		$mime = strtolower( trim( (string) ( $file['mime'] ?? '' ) ) );
		$data = (string) ( $file['data'] ?? '' );

		if ( '' === $name ) {
			$name = 'attachment';
		}

		// Accept a bare base64 payload or a full data: URI.
		if ( 0 === strncmp( $data, 'data:', 5 ) ) {
			$comma = strpos( $data, ',' );
			if ( false === $comma ) {
				return new \WP_Error( 'nexulesuite_ai_badfile', \nexulesuite_\AI\File_Text::error_message( 'unsupported' ), array( 'status' => 400 ) );
			}
			$data = substr( $data, $comma + 1 );
		}
		$data = preg_replace( '/\s+/', '', $data );

		if ( ! is_string( $data ) || '' === $data ) {
			return new \WP_Error( 'nexulesuite_ai_badfile', \nexulesuite_\AI\File_Text::error_message( 'empty' ), array( 'status' => 400 ) );
		}
		// 4/3 inflation, plus padding slack.
		if ( strlen( $data ) > (int) ceil( \nexulesuite_\AI\File_Text::MAX_BYTES * 4 / 3 ) + 1024 ) {
			return new \WP_Error( 'nexulesuite_ai_bigfile', \nexulesuite_\AI\File_Text::error_message( 'too_large' ), array( 'status' => 413 ) );
		}

		$bytes = base64_decode( $data, true ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_decode -- transport encoding, validated below.
		if ( false === $bytes ) {
			return new \WP_Error( 'nexulesuite_ai_badfile', \nexulesuite_\AI\File_Text::error_message( 'corrupt' ), array( 'status' => 400 ) );
		}

		try {
			$text = \nexulesuite_\AI\File_Text::extract( $mime, $bytes );
		} catch ( \Throwable $e ) {
			$status = in_array( $e->getMessage(), array( 'too_large' ), true ) ? 413 : 400;
			return new \WP_Error( 'nexulesuite_ai_filetext', \nexulesuite_\AI\File_Text::error_message( $e->getMessage() ), array( 'status' => $status ) );
		}

		return array(
			'name' => $name,
			'mime' => $mime,
			'text' => $text,
		);
	}

	/**
	 * Answers one turn by calling the model provider's API directly (no AI server).
	 *
	 * Retrieval happens here: the visitor's message is embedded, the WordPress vector
	 * store returns the closest chunks, and they ride on the *final user turn* inside a
	 * `<reference_context>` block rather than in the system prompt. That keeps the
	 * system + few-shot prefix byte-identical between turns (so provider-side prompt
	 * caching can hit) and clearly delimits untrusted page text from instructions.
	 *
	 * Returns the same shape the AI server's `/chat` does, so the caller's
	 * source/handoff/logging code is identical for both modes.
	 *
	 * @param array<string,mixed>              $s       Pre-read AI settings.
	 * @param string                           $message Visitor message (may be empty when image-only).
	 * @param array<int,array<string,string>>  $history Sanitized prior turns.
	 * @param string                           $image   Optional validated data-URI.
	 * @param string                           $system  Resolved system prompt.
	 * @return array{answer:string,sources:array<int,array<string,mixed>>,low_confidence:bool}|\WP_Error
	 */
	private function ai_chat_direct( array $s, string $message, array $history, string $image, string $system ) {
		self::ai_load_llm_client();
		self::ai_load_vector_store();

		$provider = (string) $s['llm_provider'];
		if ( '' === $provider || ! \nexulesuite_\AI\Llm_Client::supports_direct_chat( $provider ) ) {
			return new \WP_Error( 'nexulesuite_ai_noprovider', __( 'No AI provider is configured.', 'nexus-lead-suite' ), array( 'status' => 500 ) );
		}

		// ── Retrieve. A missing embedding provider is not fatal: the assistant still
		// answers, it just has no site context to ground the reply in.
		$hits  = array();
		$embed = $this->ai_embed_config( $s );
		if ( null !== $embed && '' !== $message && \nexulesuite_\Core\Vector_Store::count() > 0 ) {
			$vectors = \nexulesuite_\AI\Llm_Client::embed( $embed['provider'], $embed['model'], $embed['key'], array( $message ) );
			if ( ! is_wp_error( $vectors ) && ! empty( $vectors[0] ) ) {
				$hits = \nexulesuite_\Core\Vector_Store::search( $vectors[0], (int) $s['max_chunks'] );
			}
		}

		/*
		 * `search()` is a pure top-k — it always returns k rows, however poor the match.
		 * Feeding an unrelated passage to the model is worse than feeding none, so drop
		 * anything under the absolute floor or far below the best hit before it becomes
		 * context. What survives here is also what may be cited.
		 */
		if ( ! empty( $hits ) ) {
			$floor = max( self::AI_DIRECT_MIN_SCORE, (float) $hits[0]['score'] * self::AI_DIRECT_RELATIVE );
			$hits  = array_values(
				array_filter(
					$hits,
					static function ( $hit ) use ( $floor ) {
						return (float) $hit['score'] >= $floor;
					}
				)
			);
		}

		// ── Assemble the turns: admin few-shot examples, then history, then this message.
		$messages = array();
		foreach ( $this->ai_parse_examples( (string) $s['examples'] ) as $example ) {
			$messages[] = $example;
		}
		foreach ( $history as $turn ) {
			$messages[] = $turn;
		}

		$final = $message;
		if ( ! empty( $hits ) ) {
			$context = '';
			foreach ( $hits as $hit ) {
				$context .= '## ' . $hit['title'] . "\n" . $hit['content'] . "\n\n";
			}
			$final = "<reference_context>\n" . trim( $context ) . "\n</reference_context>\n\n" . $message;
		}

		$can_see = \nexulesuite_\AI\Llm_Client::supports_vision( $provider );
		if ( '' !== $image && ! $can_see ) {
			$final = trim( $final . "\n\n[The visitor attached an image, but this model cannot read images. Ask them to describe it in words.]" );
		}

		$messages[] = array(
			'role'    => 'user',
			'content' => $final,
			'image'   => $can_see ? $image : '',
		);

		$reply = \nexulesuite_\AI\Llm_Client::chat(
			$provider,
			(string) $s['llm_model'],
			(string) $s['llm_key'],
			array(
				'system'      => $system,
				'messages'    => $messages,
				'max_tokens'  => 800,
				'temperature' => 0.2,
				'timeout'     => ( '' !== $image && $can_see ) ? 120 : 60,
			)
		);
		if ( is_wp_error( $reply ) ) {
			return $reply;
		}

		$sources = array();
		foreach ( $hits as $hit ) {
			$sources[] = array(
				'title' => (string) $hit['title'],
				'url'   => (string) $hit['url'],
				'score' => (float) $hit['score'],
			);
		}

		return array(
			'answer'  => (string) $reply['text'],
			'sources' => $sources,
			// Everything under AI_DIRECT_MIN_SCORE was already filtered out above, so an
			// empty hit list means nothing on the site was relevant to the question.
			'low_confidence' => empty( $hits ),
		);
	}

	/**
	 * Public: capture a chat lead (name / email / phone) and notify the business.
	 *
	 * Guarded like {@see ai_chat()} (custom nonce + per-IP rate limit). Stored via
	 * the existing submissions store and surfaced in the Activities log.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function ai_lead( \WP_REST_Request $request ) {
		$json  = $request->get_json_params();
		$json  = is_array( $json ) ? $json : array();
		$get   = static function ( $key ) use ( $request, $json ) {
			$v = $request->get_param( $key );
			if ( ( null === $v || '' === $v ) && isset( $json[ $key ] ) ) {
				$v = $json[ $key ];
			}
			return is_string( $v ) ? $v : '';
		};

		$nonce = sanitize_text_field( $get( 'nonce' ) );
		if ( ! wp_verify_nonce( $nonce, 'nexulesuite_ai' ) ) {
			return new \WP_Error( 'nexulesuite_ai_nonce', __( 'Your session expired. Please refresh and try again.', 'nexus-lead-suite' ), array( 'status' => 403 ) );
		}

		$s = $this->ai_settings();
		if ( empty( $s['enabled'] ) || empty( $s['lead_enabled'] ) ) {
			return new \WP_Error( 'nexulesuite_ai_lead_off', __( 'Lead capture is not available.', 'nexus-lead-suite' ), array( 'status' => 403 ) );
		}

		// Per-IP rate limit (reuse the chat limiter key space, lighter cap).
		$ip     = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( (string) $_SERVER['REMOTE_ADDR'] ) ) : '';
		$rl_key = 'nexulesuite_aileadrl_' . md5( $ip );
		if ( (int) get_transient( $rl_key ) >= 5 ) {
			return new \WP_Error( 'nexulesuite_ai_lead_rl', __( 'Too many requests. Please wait a moment.', 'nexus-lead-suite' ), array( 'status' => 429 ) );
		}
		set_transient( $rl_key, ( (int) get_transient( $rl_key ) ) + 1, 5 * MINUTE_IN_SECONDS );

		$name    = mb_substr( sanitize_text_field( $get( 'name' ) ), 0, 120 );
		$email   = sanitize_email( $get( 'email' ) );
		$phone   = mb_substr( sanitize_text_field( $get( 'phone' ) ), 0, 40 );
		$message = mb_substr( sanitize_textarea_field( $get( 'message' ) ), 0, 1000 );
		$page    = esc_url_raw( $get( 'page_url' ) );
		$session = preg_replace( '/[^A-Za-z0-9_\-]/', '', $get( 'session_id' ) );
		$session = mb_substr( (string) $session, 0, 64 );

		if ( '' !== $email && ! is_email( $email ) ) {
			$email = '';
		}
		if ( '' === $email && '' === $phone ) {
			return new \WP_Error( 'nexulesuite_ai_lead_empty', __( 'Please provide an email or phone number.', 'nexus-lead-suite' ), array( 'status' => 400 ) );
		}

		$payload = array(
			'source'     => 'ai_chat',
			'name'       => $name,
			'email'      => $email,
			'phone'      => $phone,
			'message'    => $message,
			'page_url'   => $page,
			'session_id' => $session,
		);

		// Store via the existing submissions store (retention/purge/export already handle it).
		require_once nexulesuite_PLUGIN_DIR . 'core/class-form-submissions-store.php';
		\nexulesuite_\Core\Form_Submissions_Store::insert( 'ai_chat_lead', $payload );

		// Surface in the Activities dashboard.
		require_once nexulesuite_PLUGIN_DIR . 'core/class-activities-store.php';
		\nexulesuite_\Core\Activities_Store::record_interaction(
			'ai_lead',
			$email ? $email : $phone,
			$page,
			array(
				'name'    => $name,
				'email'   => $email,
				'phone'   => $phone,
				'message' => $message,
			)
		);

		// Notify the business.
		$to      = $this->ai_lead_recipient();
		$site    = wp_strip_all_tags( (string) get_bloginfo( 'name' ) );
		$subject = sprintf( /* translators: %s: site name. */ __( 'New chat lead from %s', 'nexus-lead-suite' ), $site );
		$lines   = array(
			__( 'A visitor left their details in the AI chat:', 'nexus-lead-suite' ),
			'',
			$name ? __( 'Name: ', 'nexus-lead-suite' ) . $name : '',
			$email ? __( 'Email: ', 'nexus-lead-suite' ) . $email : '',
			$phone ? __( 'Phone: ', 'nexus-lead-suite' ) . $phone : '',
			$message ? __( 'Question: ', 'nexus-lead-suite' ) . $message : '',
			$page ? __( 'Page: ', 'nexus-lead-suite' ) . $page : '',
		);
		$body = implode( "\n", array_filter( $lines, static function ( $l ) { return '' !== $l; } ) );
		if ( $to && is_email( $to ) ) {
			wp_mail( $to, $subject, $body );
		}

		return rest_ensure_response(
			array(
				'success' => true,
				'message' => __( 'Thanks! Our team will reach out to you shortly.', 'nexus-lead-suite' ),
			)
		);
	}

	/**
	 * Admin: chatbot report dashboard data — aggregate stats + conversation list.
	 *
	 * @param \WP_REST_Request $request Request (dateFrom, dateTo, search).
	 * @return \WP_REST_Response
	 */
	public function ai_logs_report( \WP_REST_Request $request ): \WP_REST_Response {
		require_once nexulesuite_PLUGIN_DIR . 'core/class-chat-store.php';

		$from   = sanitize_text_field( (string) $request->get_param( 'dateFrom' ) );
		$to     = sanitize_text_field( (string) $request->get_param( 'dateTo' ) );
		$search = sanitize_text_field( (string) $request->get_param( 'search' ) );

		if ( ! preg_match( '/^\d{4}-\d{2}-\d{2}$/', $from ) ) {
			$from = '';
		}
		if ( ! preg_match( '/^\d{4}-\d{2}-\d{2}$/', $to ) ) {
			$to = '';
		}

		return rest_ensure_response(
			array(
				'success' => true,
				'data'    => array(
					'loggingEnabled' => ! empty( $this->ai_settings()['log_chats'] ),
					'stats'          => \nexulesuite_\Core\Chat_Store::stats(),
					'conversations'  => \nexulesuite_\Core\Chat_Store::list_conversations( $from, $to, $search ),
				),
			)
		);
	}

	/**
	 * Admin: full transcript for one conversation.
	 *
	 * @param \WP_REST_Request $request Request (session).
	 * @return \WP_REST_Response
	 */
	public function ai_logs_detail( \WP_REST_Request $request ): \WP_REST_Response {
		require_once nexulesuite_PLUGIN_DIR . 'core/class-chat-store.php';

		$session = sanitize_text_field( (string) $request->get_param( 'session' ) );

		return rest_ensure_response(
			array(
				'success' => true,
				'data'    => array(
					'sessionId'  => $session,
					'transcript' => \nexulesuite_\Core\Chat_Store::get_transcript( $session ),
				),
			)
		);
	}

	/**
	 * Admin: purge all stored chat transcripts.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response
	 */
	public function ai_logs_clear( \WP_REST_Request $request ): \WP_REST_Response {
		unset( $request );
		require_once nexulesuite_PLUGIN_DIR . 'core/class-chat-store.php';

		return rest_ensure_response(
			array(
				'success' => true,
				'data'    => array( 'deleted' => \nexulesuite_\Core\Chat_Store::clear_all() ),
			)
		);
	}

	/**
	 * Admin: read the FAQ / conditional-button config + logging toggle.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response
	 */
	public function get_ai_faq( \WP_REST_Request $request ): \WP_REST_Response {
		unset( $request );
		$s = $this->ai_settings();

		return rest_ensure_response(
			array(
				'success' => true,
				'data'    => array(
					'enabled'       => (bool) $s['faq_enabled'],
					'logChats'      => (bool) $s['log_chats'],
					'items'         => $s['faq_items'],
					'actions'       => $s['faq_actions'],
					'disclaimer'    => (string) $s['disclaimer'],
					'triggerLabel'  => (string) $s['trigger_label'],
					'leadEnabled'   => (bool) $s['lead_enabled'],
					'leadOffer'     => (string) $s['lead_offer'],
					'leadRecipient' => (string) $s['lead_recipient'],
					'wooCards'         => (bool) $s['woo_cards'],
					'wooActive'        => function_exists( 'wc_get_product' ),
					'extraUrls'        => implode( "\n", $s['extra_urls'] ),
					'contactShortcode' => (string) $s['contact_shortcode'],
					'examples'         => (string) $s['examples'],
					'iconKeys'         => $this->ai_allowed_icon_keys(),
				),
			)
		);
	}

	/**
	 * Admin: save the FAQ config + logging toggle (granular update, preserves the rest).
	 *
	 * @param \WP_REST_Request $request Request (enabled, logChats, items, actions, disclaimer, triggerLabel).
	 * @return \WP_REST_Response
	 */
	public function save_ai_faq( \WP_REST_Request $request ): \WP_REST_Response {
		$opt = get_option( self::GENERAL_SETTINGS_OPTION_KEY, array() );
		if ( ! is_array( $opt ) ) {
			$opt = array();
		}

		$opt['aiFaqEnabled']   = ! empty( $request->get_param( 'enabled' ) );
		$opt['aiLogChats']     = ! empty( $request->get_param( 'logChats' ) );
		$opt['aiFaqFlows']     = $this->sanitize_ai_faq_items( $request->get_param( 'items' ) );
		$opt['aiActions']      = $this->sanitize_ai_actions( $request->get_param( 'actions' ) );
		$opt['aiDisclaimer']   = mb_substr( sanitize_textarea_field( (string) $request->get_param( 'disclaimer' ) ), 0, 300 );
		$opt['aiTriggerLabel'] = mb_substr( sanitize_text_field( (string) $request->get_param( 'triggerLabel' ) ), 0, 40 );
		$opt['aiLeadEnabled']  = ! empty( $request->get_param( 'leadEnabled' ) );
		$opt['aiLeadOffer']    = mb_substr( sanitize_text_field( (string) $request->get_param( 'leadOffer' ) ), 0, 200 );
		$lead_to               = sanitize_email( (string) $request->get_param( 'leadRecipient' ) );
		$opt['aiLeadRecipient'] = ( '' !== $lead_to && is_email( $lead_to ) ) ? $lead_to : '';
		$opt['aiWooCards']     = ! empty( $request->get_param( 'wooCards' ) );
		if ( $request->has_param( 'extraUrls' ) ) {
			$opt['aiExtraUrls'] = $this->sanitize_ai_urls( $request->get_param( 'extraUrls' ) );
		}
		if ( $request->has_param( 'contactShortcode' ) ) {
			$opt['aiContactShortcode'] = mb_substr( sanitize_text_field( (string) $request->get_param( 'contactShortcode' ) ), 0, 500 );
		}
		if ( $request->has_param( 'examples' ) ) {
			$opt['aiExamples'] = mb_substr( sanitize_textarea_field( (string) $request->get_param( 'examples' ) ), 0, 20000 );
		}

		update_option( self::GENERAL_SETTINGS_OPTION_KEY, $opt, false );

		return rest_ensure_response(
			array(
				'success' => true,
				'data'    => array(
					'enabled'          => (bool) $opt['aiFaqEnabled'],
					'logChats'         => (bool) $opt['aiLogChats'],
					'items'            => $opt['aiFaqFlows'],
					'actions'          => $opt['aiActions'],
					'disclaimer'       => (string) $opt['aiDisclaimer'],
					'triggerLabel'     => (string) $opt['aiTriggerLabel'],
					'leadEnabled'      => (bool) $opt['aiLeadEnabled'],
					'leadOffer'        => (string) $opt['aiLeadOffer'],
					'leadRecipient'    => (string) $opt['aiLeadRecipient'],
					'wooCards'         => ! isset( $opt['aiWooCards'] ) || ! empty( $opt['aiWooCards'] ),
					'wooActive'        => function_exists( 'wc_get_product' ),
					'extraUrls'        => implode( "\n", $this->sanitize_ai_urls( $opt['aiExtraUrls'] ?? array() ) ),
					'contactShortcode' => (string) ( $opt['aiContactShortcode'] ?? '' ),
					'examples'         => (string) ( $opt['aiExamples'] ?? '' ),
					'iconKeys'         => $this->ai_allowed_icon_keys(),
				),
			)
		);
	}

	/**
	 * Builds a compact text sample of the site (name, tagline, page/post titles +
	 * excerpts) for the business-analysis endpoint. Capped so requests stay small.
	 *
	 * @return string
	 */
	private function ai_build_content_sample(): string {
		$parts = array();

		$tagline = wp_strip_all_tags( (string) get_bloginfo( 'description' ) );
		if ( '' !== trim( $tagline ) ) {
			$parts[] = 'Tagline: ' . $tagline;
		}

		$query = new \WP_Query(
			array(
				'post_type'           => array( 'page', 'post' ),
				'post_status'         => 'publish',
				'posts_per_page'      => 25,
				'orderby'             => 'comment_count', // roughly prioritise popular pages.
				'order'               => 'DESC',
				'ignore_sticky_posts' => true,
				'no_found_rows'       => true,
			)
		);

		foreach ( $query->posts as $post ) {
			$title = trim( wp_strip_all_tags( (string) get_the_title( $post ) ) );
			$body  = trim( wp_strip_all_tags( (string) $post->post_content ) );
			$body  = wp_trim_words( $body, 55, '' );
			$line  = '[' . $post->post_type . '] ' . $title;
			if ( '' !== $body ) {
				$line .= ': ' . $body;
			}
			$parts[] = $line;
		}
		wp_reset_postdata();

		return mb_substr( implode( "\n\n", $parts ), 0, 14000 );
	}

	/**
	 * Admin: analyse the site and propose a tailored persona + suggested questions + actions.
	 * Purely a preview — nothing is saved until {@see ai_autogen_apply()}.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response
	 */
	public function ai_autogen( \WP_REST_Request $request ): \WP_REST_Response {
		unset( $request );

		$s = $this->ai_settings();
		if ( empty( $s['enabled'] ) ) {
			return rest_ensure_response(
				array(
					'success' => false,
					'message' => __( 'Enable the AI Chatbot (Settings) first, then Save.', 'nexus-lead-suite' ),
				)
			);
		}

		if ( 'direct' === $s['mode'] ) {
			$res = $this->ai_autogen_direct( $s );
		} else {
			if ( '' === $s['url'] ) {
				return rest_ensure_response(
					array(
						'success' => false,
						'message' => __( 'Set the AI server URL (Settings) first, then Save.', 'nexus-lead-suite' ),
					)
				);
			}

			$payload = array(
				'site_id'        => $this->ai_site_id(),
				'site_name'      => wp_strip_all_tags( (string) get_bloginfo( 'name' ) ),
				'content_sample' => $this->ai_build_content_sample(),
			);
			if ( '' !== $s['model'] ) {
				$payload['chat_model'] = $s['model'];
			}
			$llm_override = $this->ai_llm_override( $s );
			if ( null !== $llm_override ) {
				$payload['llm'] = $llm_override;
			}

			$res = $this->ai_server_request( 'POST', '/analyze', $payload, 120 );
		}

		if ( is_wp_error( $res ) ) {
			return rest_ensure_response( array( 'success' => false, 'message' => $res->get_error_message() ) );
		}

		$allowed = $this->ai_allowed_icon_keys();
		$map     = static function ( $list, $cap ) use ( $allowed ) {
			$out = array();
			if ( is_array( $list ) ) {
				foreach ( $list as $row ) {
					if ( ! is_array( $row ) ) {
						continue;
					}
					$label = trim( sanitize_text_field( (string) ( $row['label'] ?? '' ) ) );
					if ( '' === $label ) {
						continue;
					}
					$icon = sanitize_key( (string) ( $row['icon'] ?? '' ) );
					$out[] = array(
						'label' => mb_substr( $label, 0, 120 ),
						'icon'  => in_array( $icon, $allowed, true ) ? $icon : '',
					);
					if ( count( $out ) >= $cap ) {
						break;
					}
				}
			}
			return $out;
		};

		return rest_ensure_response(
			array(
				'success' => true,
				'data'    => array(
					'businessType' => sanitize_text_field( (string) ( $res['business_type'] ?? '' ) ),
					'summary'      => sanitize_text_field( (string) ( $res['summary'] ?? '' ) ),
					'systemPrompt' => sanitize_textarea_field( (string) ( $res['system_prompt'] ?? '' ) ),
					'questions'    => $map( $res['questions'] ?? array(), 6 ),
					'actions'      => $map( $res['actions'] ?? array(), 3 ),
				),
			)
		);
	}

	/**
	 * Auto-Setup against a provider API, mirroring the AI server's `/analyze` response.
	 *
	 * The model is asked only for the *classification* (business type, summary, suggested
	 * questions and actions). The system prompt is then assembled deterministically from
	 * that summary — models asked to write their own prompt return nested objects and
	 * wildly variable prose, which is unusable as a stored setting.
	 *
	 * @param array<string,mixed> $s Pre-read AI settings.
	 * @return array<string,mixed>|\WP_Error
	 */
	private function ai_autogen_direct( array $s ) {
		self::ai_load_llm_client();

		$provider = (string) $s['llm_provider'];
		if ( '' === $provider || ! \nexulesuite_\AI\Llm_Client::supports_direct_chat( $provider ) ) {
			return new \WP_Error(
				'nexulesuite_ai_noprovider',
				__( 'Choose an AI provider and save its API key (Settings → AI Chatbot) first.', 'nexus-lead-suite' ),
				array( 'status' => 400 )
			);
		}

		$site_name = wp_strip_all_tags( (string) get_bloginfo( 'name' ) );
		$icons     = implode( ', ', $this->ai_allowed_icon_keys() );

		$instruction = sprintf(
			/* translators: 1: site name, 2: allowed icon keys, 3: site content sample. */
			"You are analysing the website \"%1\$s\" to configure its support chatbot.\n\n"
			. "Return ONLY a JSON object with exactly these keys:\n"
			. "  \"business_type\": a two-to-four word label for what this business does.\n"
			. "  \"summary\": one or two sentences describing what they offer, in the third person.\n"
			. "  \"questions\": 4-6 objects {\"label\", \"icon\"} — questions a real visitor would ask this business.\n"
			. "  \"actions\": 2-3 objects {\"label\", \"icon\"} — short call-to-action button labels.\n\n"
			. "Every \"icon\" MUST be one of: %2\$s\n"
			. "Base everything strictly on the content below. Do not invent services.\n\n"
			. "<site_content>\n%3\$s\n</site_content>",
			$site_name,
			$icons,
			$this->ai_build_content_sample()
		);

		$reply = \nexulesuite_\AI\Llm_Client::chat(
			$provider,
			(string) $s['llm_model'],
			(string) $s['llm_key'],
			array(
				'system'      => 'You are a precise analyst. You reply with a single JSON object and nothing else.',
				'messages'    => array( array( 'role' => 'user', 'content' => $instruction ) ),
				'max_tokens'  => 900,
				'temperature' => 0.1,
				'json'        => true,
				'timeout'     => 120,
			)
		);
		if ( is_wp_error( $reply ) ) {
			return $reply;
		}

		$parsed = $this->ai_extract_json( (string) $reply['text'] );
		if ( null === $parsed ) {
			return new \WP_Error(
				'nexulesuite_ai_badjson',
				__( 'The model did not return usable JSON. Try again, or pick a stronger model.', 'nexus-lead-suite' ),
				array( 'status' => 502 )
			);
		}

		$summary = trim( (string) ( $parsed['summary'] ?? '' ) );
		$prompt  = $this->ai_default_system_prompt();
		if ( '' !== $summary ) {
			$prompt .= "\n\nAbout us: " . $summary;
		}

		return array(
			'business_type' => (string) ( $parsed['business_type'] ?? '' ),
			'summary'       => $summary,
			'system_prompt' => $prompt,
			'questions'     => isset( $parsed['questions'] ) && is_array( $parsed['questions'] ) ? $parsed['questions'] : array(),
			'actions'       => isset( $parsed['actions'] ) && is_array( $parsed['actions'] ) ? $parsed['actions'] : array(),
		);
	}

	/**
	 * Decodes a JSON object from a model reply, tolerating ```json fences and prose around
	 * it (providers without a native JSON mode — Anthropic — wrap the object).
	 *
	 * @param string $text Raw model output.
	 * @return array<string,mixed>|null
	 */
	private function ai_extract_json( string $text ): ?array {
		$text = trim( $text );

		$decoded = json_decode( $text, true );
		if ( is_array( $decoded ) ) {
			return $decoded;
		}

		$start = strpos( $text, '{' );
		$end   = strrpos( $text, '}' );
		if ( false === $start || false === $end || $end <= $start ) {
			return null;
		}

		$decoded = json_decode( substr( $text, $start, $end - $start + 1 ), true );

		return is_array( $decoded ) ? $decoded : null;
	}

	/**
	 * Admin: apply selected auto-generated suggestions to the live config.
	 * Only the chosen parts are written; other settings are preserved.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response
	 */
	public function ai_autogen_apply( \WP_REST_Request $request ): \WP_REST_Response {
		$opt = get_option( self::GENERAL_SETTINGS_OPTION_KEY, array() );
		if ( ! is_array( $opt ) ) {
			$opt = array();
		}

		$applied = array();

		if ( ! empty( $request->get_param( 'applyPrompt' ) ) ) {
			$prompt = trim( sanitize_textarea_field( (string) $request->get_param( 'systemPrompt' ) ) );
			if ( '' !== $prompt ) {
				$opt['aiSystemPrompt'] = mb_substr( $prompt, 0, 1500 );
				$applied[]             = 'prompt';
			}
		}

		if ( ! empty( $request->get_param( 'applyQuestions' ) ) ) {
			$raw_q = $request->get_param( 'questions' );
			$items = array();
			if ( is_array( $raw_q ) ) {
				foreach ( $raw_q as $q ) {
					if ( ! is_array( $q ) ) {
						continue;
					}
					// Suggested questions have no canned answer — clicking sends them to the AI.
					$items[] = array(
						'label'     => (string) ( $q['label'] ?? '' ),
						'answer'    => '',
						'icon'      => (string) ( $q['icon'] ?? '' ),
						'followups' => array(),
					);
				}
			}
			$opt['aiFaqFlows']   = $this->sanitize_ai_faq_items( $items );
			$opt['aiFaqEnabled'] = true;
			$applied[]           = 'questions';
		}

		if ( ! empty( $request->get_param( 'applyActions' ) ) ) {
			$opt['aiActions'] = $this->sanitize_ai_actions( $request->get_param( 'actions' ) );
			$applied[]        = 'actions';
		}

		update_option( self::GENERAL_SETTINGS_OPTION_KEY, $opt, false );

		return rest_ensure_response(
			array(
				'success' => true,
				'data'    => array(
					'applied'      => $applied,
					'faqEnabled'   => ! empty( $opt['aiFaqEnabled'] ),
					'items'        => $opt['aiFaqFlows'] ?? array(),
					'actions'      => $opt['aiActions'] ?? array(),
					'systemPrompt' => (string) ( $opt['aiSystemPrompt'] ?? '' ),
				),
			)
		);
	}

	/**
	 * Issues a short-lived token and returns the full front-end URL (uses {@see home_url()}).
	 *
	 * @param \WP_REST_Request $request Request (optional tokenTTL minutes).
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function generate_client_access_link( \WP_REST_Request $request ) {
		require_once nexulesuite_PLUGIN_DIR . 'public/class-client-access.php';

		$saved = get_option( self::GENERAL_SETTINGS_OPTION_KEY, array() );
		if ( ! is_array( $saved ) || empty( $saved['allowClientAccess'] ) ) {
			return new \WP_Error(
				'nexulesuite_client_access_off',
				__( 'Save settings with "Allow Client Access" enabled before generating a link.', 'nexus-lead-suite' ),
				array( 'status' => 403 )
			);
		}

		$ttl_saved = isset( $saved['tokenTTL'] ) ? max( 1, min( 10080, (int) $saved['tokenTTL'] ) ) : 5;
		$ttl_req   = $request->get_param( 'tokenTTL' );
		$ttl_min   = ( null !== $ttl_req && '' !== $ttl_req )
			? max( 1, min( 10080, absint( $ttl_req ) ) )
			: $ttl_saved;

		$token = wp_generate_password( 48, false, false );
		\nexulesuite_\Public\Client_Access::store_token( $token, MINUTE_IN_SECONDS * $ttl_min );

		return rest_ensure_response(
			array(
				'success' => true,
				'data'    => array(
					'url'              => \nexulesuite_\Public\Client_Access::build_access_url( $token ),
					'expiresInMinutes' => $ttl_min,
				),
			)
		);
	}

	/**
	 * Lists the named share links. Tokens are never returned — they exist only in the
	 * URL handed over at creation time.
	 *
	 * @return \WP_REST_Response
	 */
	public function list_client_links(): \WP_REST_Response {
		require_once nexulesuite_PLUGIN_DIR . 'public/class-client-access.php';
		require_once nexulesuite_PLUGIN_DIR . 'core/class-report-source.php';

		$links = array();
		foreach ( \nexulesuite_\Public\Client_Access::all_links() as $link ) {
			$links[] = array(
				'id'       => (string) ( $link['id'] ?? '' ),
				'label'    => (string) ( $link['label'] ?? '' ),
				'created'  => (int) ( $link['created'] ?? 0 ),
				'expires'  => (int) ( $link['expires'] ?? 0 ),
				'sections' => \nexulesuite_\Core\Report_Source::sanitize_sections( $link['sections'] ?? array() ),
				'uses'     => (int) ( $link['uses'] ?? 0 ),
				'lastUsed' => (int) ( $link['last_used'] ?? 0 ),
			);
		}

		return rest_ensure_response(
			array(
				'success' => true,
				'data'    => array(
					'links'    => $links,
					'sections' => \nexulesuite_\Core\Report_Source::SECTIONS,
				),
			)
		);
	}

	/**
	 * Creates a share link. The URL is returned once and cannot be recovered later.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function create_client_link( \WP_REST_Request $request ) {
		require_once nexulesuite_PLUGIN_DIR . 'public/class-client-access.php';
		require_once nexulesuite_PLUGIN_DIR . 'core/class-report-source.php';

		if ( ! \nexulesuite_\Public\Client_Access::is_allowed_from_db() ) {
			return new \WP_Error(
				'nexulesuite_client_access_disabled',
				__( 'Save settings with "Allow Client Access" enabled before generating a link.', 'nexus-lead-suite' ),
				array( 'status' => 403 )
			);
		}

		$label = trim( sanitize_text_field( (string) $request->get_param( 'label' ) ) );
		if ( '' === $label ) {
			$label = __( 'Client link', 'nexus-lead-suite' );
		}

		// 0 means "never expires"; otherwise cap at two years.
		$expires_days = min( 730, absint( $request->get_param( 'expiresDays' ) ) );

		$sections = \nexulesuite_\Core\Report_Source::sanitize_sections( $request->get_param( 'sections' ) );
		if ( empty( $sections ) ) {
			$sections = \nexulesuite_\Core\Report_Source::DEFAULT_SHARED_SECTIONS;
		}

		$created = \nexulesuite_\Public\Client_Access::create_link( $label, $expires_days, $sections );

		return rest_ensure_response(
			array(
				'success' => true,
				'data'    => array(
					'id'       => $created['id'],
					'url'      => $created['url'],
					'label'    => $label,
					'expires'  => (int) $created['link']['expires'],
					'sections' => $sections,
				),
			)
		);
	}

	/**
	 * Revokes a share link.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function revoke_client_link( \WP_REST_Request $request ) {
		require_once nexulesuite_PLUGIN_DIR . 'public/class-client-access.php';

		$id = sanitize_text_field( (string) $request->get_param( 'id' ) );
		if ( ! \nexulesuite_\Public\Client_Access::revoke_link( $id ) ) {
			return new \WP_Error( 'nexulesuite_link_not_found', __( 'That link no longer exists.', 'nexus-lead-suite' ), array( 'status' => 404 ) );
		}

		return rest_ensure_response( array( 'success' => true ) );
	}

	/**
	 * Returns a complete JSON snapshot (tracked options + custom tables).
	 * Query: embed_media=0 skips embedded upload files (smaller, faster) if full export runs out of memory.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function export_full_data_bundle( $request ) {
		$embed = true;
		if ( $request instanceof \WP_REST_Request ) {
			$embed = ( '0' !== (string) $request->get_param( 'embed_media' ) );
		}

		// Second arg: JSON_* flags only. Third arg: max depth (not 8192 as a flag).
		$json_flags = 0;
		if ( defined( 'JSON_INVALID_UTF8_SUBSTITUTE' ) ) {
			$json_flags = JSON_INVALID_UTF8_SUBSTITUTE;
		}

		try {
			$bundle = Data_Bundle::collect_bundle( $embed );
			try {
				$check = wp_json_encode( $bundle, $json_flags, 8192 );
			} catch ( \Throwable $json_err ) {
				// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
				error_log( 'Nexus Lead Suite full export json_encode: ' . $json_err->getMessage() );

				return new \WP_Error(
					'nexulesuite_export_encode',
					__( 'Could not serialize the export. Try embed_media=0 or reduce data in form/email HTML fields.', 'nexus-lead-suite' ) . ' ' . ( defined( 'WP_DEBUG' ) && WP_DEBUG ? $json_err->getMessage() : '' ),
					array( 'status' => 500 )
				);
			}
			if ( false === $check ) {
				return new \WP_Error(
					'nexulesuite_export_encode',
					__( 'Could not build the export file. Try export with ?embed_media=0 or disable embedded media from Backup settings.', 'nexus-lead-suite' ),
					array( 'status' => 500 )
				);
			}

			return rest_ensure_response(
				array(
					'success' => true,
					'data'    => array(
						'bundle' => $bundle,
					),
				)
			);
		} catch ( \Throwable $e ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( 'Nexus Lead Suite full export: ' . $e->getMessage() . "\n" . $e->getTraceAsString() );

			$msg = __( 'Full export failed on the server. Try again with embed_media=0 (settings-only backup), increase PHP memory_limit, or check debug.log.', 'nexus-lead-suite' );
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
				$msg .= ' ' . $e->getMessage();
			}

			return new \WP_Error(
				'nexulesuite_export_failed',
				$msg,
				array( 'status' => 500 )
			);
		}
	}

	/**
	 * Full site replace: all tracked options, extra plugin options from the file, and custom tables
	 * are overwritten; any previous `nexulesuite_ls*` extra options not in the export are removed.
	 *
	 * @param mixed $request Request body: { bundle: object }.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function import_full_data_bundle( $request ) {
		$bundle = null;
		if ( $request instanceof \WP_REST_Request ) {
			$bundle = $request->get_param( 'bundle' );
		}
		if ( ! is_array( $bundle ) ) {
			return new \WP_Error(
				'nexulesuite_import_invalid',
				__( 'Invalid import payload.', 'nexus-lead-suite' ),
				array( 'status' => 400 )
			);
		}

		try {
			$result = Data_Bundle::apply_bundle( $bundle );
		} catch ( \Throwable $e ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( 'Nexus Lead Suite full import: ' . $e->getMessage() . "\n" . $e->getTraceAsString() );

			$msg = __( 'Import failed on the server. If the file is large, increase post_max_size and memory_limit, then check debug.log.', 'nexus-lead-suite' );
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
				$msg .= ' ' . $e->getMessage();
			}

			return new \WP_Error(
				'nexulesuite_import_failed',
				$msg,
				array(
					'status'  => 500,
					'detail'  => $e->getMessage(),
					'file'    => $e->getFile(),
					'line'    => $e->getLine(),
					'code'    => $e->getCode(),
				)
			);
		}

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return rest_ensure_response(
			array(
				'success' => true,
				'data'    => array(
					'message' => __( 'Import finished. Previous plugin settings, forms, popups, email, menu, activity tables, and media mapping were replaced entirely by this file.', 'nexus-lead-suite' ),
				),
			)
		);
	}

	/**
	 * Livechat avatar upload: saves to Media Library without generating responsive subsizes.
	 *
	 * Skips {@see wp_generate_attachment_metadata()} so weak hosts (e.g. XAMPP GD) do not trigger
	 * “The web server cannot generate responsive image sizes…” notices.
	 *
	 * @param \WP_REST_Request $request Request with multipart file under `file`.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function upload_livechat_avatar( \WP_REST_Request $request ) {
		$file_params = $request->get_file_params();
		$file        = ( isset( $file_params['file'] ) && is_array( $file_params['file'] ) )
			? $file_params['file']
			: array();

		$tmp_name = isset( $file['tmp_name'] ) ? (string) $file['tmp_name'] : '';
		if ( '' === $tmp_name || ! is_uploaded_file( $tmp_name ) ) {
			return new \WP_Error(
				'nexulesuite_no_file',
				__( 'No valid image upload received.', 'nexus-lead-suite' ),
				array( 'status' => 400 )
			);
		}

		if ( ! empty( $file['error'] ) ) {
			return new \WP_Error(
				'nexulesuite_upload_err',
				sprintf(
					/* translators: %s: PHP upload error code */
					__( 'Upload failed (code %s).', 'nexus-lead-suite' ),
					(string) $file['error']
				),
				array( 'status' => 400 )
			);
		}

		$max_bytes = 3 * 1024 * 1024;
		if ( isset( $file['size'] ) && (int) $file['size'] > $max_bytes ) {
			return new \WP_Error(
				'nexulesuite_file_large',
				__( 'Image must be 3 MB or smaller.', 'nexus-lead-suite' ),
				array( 'status' => 400 )
			);
		}

		// Only file.php is needed (for wp_handle_upload). image.php is intentionally
		// NOT loaded: this method deliberately skips wp_generate_attachment_metadata().
		require_once ABSPATH . 'wp-admin/includes/file.php';

		$mimes = array(
			'jpg|jpeg|jpe' => 'image/jpeg',
			'png'          => 'image/png',
			'gif'          => 'image/gif',
			'webp'         => 'image/webp',
		);

		$upload = wp_handle_upload(
			$file,
			array(
				'test_form' => false,
				'mimes'     => $mimes,
			)
		);

		if ( isset( $upload['error'] ) ) {
			return new \WP_Error(
				'nexulesuite_upload_failed',
				sanitize_text_field( (string) $upload['error'] ),
				array( 'status' => 400 )
			);
		}

		$wp_filetype = wp_check_filetype( basename( $upload['file'] ), $mimes );
		$mime        = (string) ( $wp_filetype['type'] ?? '' );
		if ( '' === $mime || ! str_starts_with( $mime, 'image/' ) ) {
			if ( isset( $upload['file'] ) && is_string( $upload['file'] ) && file_exists( $upload['file'] ) ) {
				wp_delete_file( $upload['file'] );
			}
			return new \WP_Error(
				'nexulesuite_bad_type',
				__( 'Only JPEG, PNG, GIF, or WebP images are allowed.', 'nexus-lead-suite' ),
				array( 'status' => 400 )
			);
		}

		$attachment_post = array(
			'post_mime_type' => $mime,
			'post_title'     => sanitize_text_field( pathinfo( basename( $upload['file'] ), PATHINFO_FILENAME ) ),
			'post_content'   => '',
			'post_status'    => 'inherit',
		);

		$attach_id = wp_insert_attachment( $attachment_post, $upload['file'], 0 );

		if ( false === $attach_id || $attach_id <= 0 ) {
			if ( isset( $upload['file'] ) && is_string( $upload['file'] ) && file_exists( $upload['file'] ) ) {
				wp_delete_file( $upload['file'] );
			}
			return new \WP_Error(
				'nexulesuite_attachment_failed',
				__( 'Could not save attachment.', 'nexus-lead-suite' ),
				array( 'status' => 500 )
			);
		}

		$relative = _wp_relative_upload_path( $upload['file'] );
		if ( ! is_string( $relative ) || '' === $relative ) {
			wp_delete_attachment( $attach_id, true );
			return new \WP_Error(
				'nexulesuite_path_failed',
				__( 'Could not resolve upload path.', 'nexus-lead-suite' ),
				array( 'status' => 500 )
			);
		}

		$meta = array(
			'file'  => $relative,
			'sizes' => array(),
		);

		$dims = wp_getimagesize( $upload['file'] );
		if ( is_array( $dims ) && isset( $dims[0], $dims[1] ) ) {
			$meta['width']  = (int) $dims[0];
			$meta['height'] = (int) $dims[1];
		}

		wp_update_attachment_metadata( $attach_id, $meta );

		$url = wp_get_attachment_url( $attach_id );
		if ( ! $url ) {
			wp_delete_attachment( $attach_id, true );
			return new \WP_Error(
				'nexulesuite_url_failed',
				__( 'Could not resolve attachment URL.', 'nexus-lead-suite' ),
				array( 'status' => 500 )
			);
		}

		return rest_ensure_response(
			array(
				'success' => true,
				'data'    => array(
					'id'  => $attach_id,
					'url' => $url,
				),
			)
		);
	}

	/**
	 * Report/PDF logo upload: saves to Media Library without generating responsive subsizes.
	 *
	 * @param \WP_REST_Request $request Request with multipart file under `file`.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function upload_report_logo( \WP_REST_Request $request ) {
		// Same behavior and constraints as livechat avatar upload.
		return $this->upload_livechat_avatar( $request );
	}

	/**
	 * Returns persisted Menu Items with global font size.
	 *
	 * @return \WP_REST_Response
	 */
	public function get_menu_items() {
		require_once nexulesuite_PLUGIN_DIR . 'core/class-menu-items-payload.php';

		$stored     = get_option( self::MENU_ITEMS_OPTION_KEY, array() );
		$normalized = \nexulesuite_\Core\Menu_Items_Payload::normalize_stored( $stored );

		return rest_ensure_response(
			array(
				'success' => true,
				'data'    => array(
					'groups'         => $normalized['groups'],
					'globalFontSize' => $normalized['globalFontSize'],
				),
			)
		);
	}

	/**
	 * Returns persisted Popups.
	 *
	 * @return \WP_REST_Response
	 */
	public function get_popups() {
		$items = get_option( self::POPUPS_OPTION_KEY, array() );
		if ( ! is_array( $items ) ) {
			$items = array();
		}

		return rest_ensure_response(
			array(
				'success' => true,
				'data'    => array(
					'popups' => $items,
				),
			)
		);
	}

	/**
	 * Saves Popups.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function save_popups( \WP_REST_Request $request ) {
		$popups = $request->get_param( 'popups' );
		if ( ! is_array( $popups ) ) {
			return new \WP_Error( 'nexulesuite_invalid_popups', 'Invalid popups payload.' );
		}

		$clean = $this->sanitize_popups_payload( $popups );
		update_option( self::POPUPS_OPTION_KEY, $clean, false );

		return rest_ensure_response(
			array(
				'success' => true,
				'data'    => array(
					'popups' => $clean,
				),
			)
		);
	}

	/**
	 * Saves Menu Items.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function save_menu_items( \WP_REST_Request $request ) {
		require_once nexulesuite_PLUGIN_DIR . 'core/class-menu-items-payload.php';

		$groups_in = $request->get_param( 'groups' );
		$items_in  = $request->get_param( 'items' );

		if ( is_array( $groups_in ) ) {
			$clean_groups = $this->sanitize_menu_groups( $groups_in );
		} elseif ( is_array( $items_in ) ) {
			$clean_groups = array(
				\nexulesuite_\Core\Menu_Items_Payload::build_default_group(
					$this->sanitize_menu_items( $items_in )
				),
			);
		} else {
			return new \WP_Error( 'nexulesuite_invalid_menu_items', 'Invalid menu items payload.' );
		}

		$global_font_size = max( 10, min( 32, (int) ( $request->get_param( 'globalFontSize' ) ?? 14 ) ) );

		$payload = array(
			'groups'         => $clean_groups,
			'globalFontSize' => $global_font_size,
		);

		update_option( self::MENU_ITEMS_OPTION_KEY, $payload, false );

		return rest_ensure_response(
			array(
				'success' => true,
				'data'    => array(
					'groups'         => $clean_groups,
					'globalFontSize' => $global_font_size,
				),
			)
		);
	}

	/**
	 * Searches published pages/posts for the menu condition picker.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response
	 */
	public function search_menu_content( \WP_REST_Request $request ) {
		$search = sanitize_text_field( (string) ( $request->get_param( 'search' ) ?? '' ) );
		$types  = sanitize_text_field( (string) ( $request->get_param( 'types' ) ?? 'page,post' ) );

		$allowed = array( 'page', 'post' );
		$wanted  = array();
		foreach ( array_map( 'trim', explode( ',', $types ) ) as $type ) {
			$clean = sanitize_key( $type );
			if ( in_array( $clean, $allowed, true ) ) {
				$wanted[] = $clean;
			}
		}
		if ( count( $wanted ) === 0 ) {
			$wanted = $allowed;
		}

		$query_args = array(
			'post_type'              => $wanted,
			'post_status'            => 'publish',
			'posts_per_page'         => 20,
			'orderby'                => 'title',
			'order'                  => 'ASC',
			'no_found_rows'          => true,
			'update_post_meta_cache' => false,
			'update_post_term_cache' => false,
		);

		if ( '' !== $search ) {
			$query_args['s'] = $search;
		}

		$query   = new \WP_Query( $query_args );
		$results = array();

		foreach ( $query->posts as $post ) {
			if ( ! $post instanceof \WP_Post ) {
				continue;
			}
			$results[] = array(
				'id'    => (int) $post->ID,
				'title' => get_the_title( $post ),
				'type'  => $post->post_type,
			);
		}

		return rest_ensure_response(
			array(
				'success' => true,
				'data'    => array(
					'results' => $results,
				),
			)
		);
	}

	/**
	 * Returns taxonomy/post-type metadata for the menu condition builder.
	 *
	 * @return \WP_REST_Response
	 */
	public function get_menu_condition_meta() {
		$post_types = array();
		$objects    = get_post_types( array( 'public' => true ), 'objects' );
		foreach ( $objects as $obj ) {
			if ( ! $obj instanceof \WP_Post_Type ) {
				continue;
			}
			$post_types[] = array(
				'slug'  => $obj->name,
				'label' => $obj->labels->singular_name ?: $obj->label,
			);
		}

		$categories = array();
		$cat_terms  = get_terms(
			array(
				'taxonomy'   => 'category',
				'hide_empty' => false,
				'number'     => 200,
			)
		);
		if ( is_array( $cat_terms ) ) {
			foreach ( $cat_terms as $term ) {
				if ( $term instanceof \WP_Term ) {
					$categories[] = array(
						'id'   => (int) $term->term_id,
						'name' => $term->name,
					);
				}
			}
		}

		$tags = array();
		$tag_terms = get_terms(
			array(
				'taxonomy'   => 'post_tag',
				'hide_empty' => false,
				'number'     => 200,
			)
		);
		if ( is_array( $tag_terms ) ) {
			foreach ( $tag_terms as $term ) {
				if ( $term instanceof \WP_Term ) {
					$tags[] = array(
						'id'   => (int) $term->term_id,
						'name' => $term->name,
					);
				}
			}
		}

		return rest_ensure_response(
			array(
				'success' => true,
				'data'    => array(
					'postTypes'  => $post_types,
					'categories' => $categories,
					'tags'       => $tags,
				),
			)
		);
	}

	/**
	 * Sanitizes grouped menu payload.
	 *
	 * @param array<int,mixed> $groups Groups.
	 * @return array<int,array<string,mixed>>
	 */
	private function sanitize_menu_groups( array $groups ): array {
		$out = array();

		foreach ( $groups as $group ) {
			if ( ! is_array( $group ) ) {
				continue;
			}

			$id = isset( $group['id'] ) ? sanitize_text_field( (string) $group['id'] ) : '';
			if ( '' === $id ) {
				$id = 'group-' . ( count( $out ) + 1 );
			}

			$name     = isset( $group['name'] ) ? sanitize_text_field( (string) $group['name'] ) : '';
			$priority = isset( $group['priority'] ) ? (int) $group['priority'] : 0;
			$priority = max( 0, min( 999, $priority ) );
			$enabled  = ! array_key_exists( 'enabled', $group ) || ! empty( $group['enabled'] );

			$conditions_in = isset( $group['conditions'] ) && is_array( $group['conditions'] )
				? $group['conditions']
				: array();
			$match         = isset( $conditions_in['match'] ) ? sanitize_key( (string) $conditions_in['match'] ) : 'any';
			if ( 'all' !== $match ) {
				$match = 'any';
			}

			$rules_in = isset( $conditions_in['rules'] ) && is_array( $conditions_in['rules'] )
				? $conditions_in['rules']
				: array();
			$rules    = $this->sanitize_menu_condition_rules( $rules_in );

			$buttons_in = isset( $group['buttons'] ) && is_array( $group['buttons'] )
				? $group['buttons']
				: array();

			$out[] = array(
				'id'         => $id,
				'name'       => $name,
				'priority'   => $priority,
				'enabled'    => $enabled,
				'conditions' => array(
					'match' => $match,
					'rules' => $rules,
				),
				'buttons'    => $this->sanitize_menu_items( $buttons_in ),
			);
		}

		return $out;
	}

	/**
	 * @param array<int,mixed> $rules Condition rules.
	 * @return array<int,array<string,mixed>>
	 */
	private function sanitize_menu_condition_rules( array $rules ): array {
		$allowed_types = array( 'all', 'homepage', 'page', 'post', 'post_type', 'category', 'tag', 'custom_link' );
		$out           = array();

		foreach ( $rules as $rule ) {
			if ( ! is_array( $rule ) ) {
				continue;
			}

			$type = isset( $rule['type'] ) ? sanitize_key( (string) $rule['type'] ) : '';
			if ( ! in_array( $type, $allowed_types, true ) ) {
				continue;
			}

			$clean = array( 'type' => $type );

			if ( in_array( $type, array( 'page', 'post', 'category', 'tag' ), true ) ) {
				$ids = isset( $rule['ids'] ) && is_array( $rule['ids'] ) ? $rule['ids'] : array();
				$clean['ids'] = array_values(
					array_unique(
						array_filter(
							array_map( 'absint', $ids ),
							static function ( int $id ): bool {
								return $id > 0;
							}
						)
					)
				);
			}

			if ( 'post_type' === $type ) {
				$slugs = isset( $rule['slugs'] ) && is_array( $rule['slugs'] ) ? $rule['slugs'] : array();
				$clean_slugs = array();
				foreach ( $slugs as $slug ) {
					$key = sanitize_key( (string) $slug );
					if ( '' !== $key ) {
						$clean_slugs[] = $key;
					}
				}
				$clean['slugs'] = array_values( array_unique( $clean_slugs ) );
			}

			if ( 'custom_link' === $type ) {
				$url = isset( $rule['url'] ) ? trim( (string) $rule['url'] ) : '';
				if ( '' === $url ) {
					$clean['url'] = '';
				} elseif ( preg_match( '#^https?://#i', $url ) ) {
					$clean['url'] = esc_url_raw( $url );
				} else {
					$clean['url'] = sanitize_text_field( '/' . ltrim( $url, '/' ) );
				}
			}

			$out[] = $clean;
		}

		return $out;
	}

	/**
	 * Sanitizes Menu Items payload.
	 *
	 * @param array<int,mixed> $items Items.
	 * @return array<int,array<string,mixed>>
	 */
	private function sanitize_menu_items( array $items ): array {
		$out = array();

		$allowed_hover = array( 'none', 'lift', 'glow', 'shake', 'scale', 'rotate', 'darken' );

		foreach ( $items as $item ) {
			if ( ! is_array( $item ) ) {
				continue;
			}

			$id    = isset( $item['id'] ) ? sanitize_text_field( (string) $item['id'] ) : '';
			$label = isset( $item['label'] ) ? sanitize_text_field( (string) $item['label'] ) : '';
			$event = isset( $item['eventName'] ) ? sanitize_text_field( (string) $item['eventName'] ) : '';
			$icon  = isset( $item['icon'] ) ? sanitize_text_field( (string) $item['icon'] ) : 'none';

			/*
			 * esc_url_raw() rejects the plugin's pseudo-scheme "popup:id", wiping the URL and losing the trigger.
			 * Persist popup:… verbatim and sync eventName when the admin only fills Link URL.
			 */
			$url_raw_in = isset( $item['url'] ) ? trim( (string) $item['url'] ) : '';
			$url        = '';
			if ( str_starts_with( $url_raw_in, 'popup:' ) ) {
				$popup_ref = sanitize_text_field( trim( substr( $url_raw_in, 6 ) ) );
				$url       = '' !== $popup_ref ? 'popup:' . $popup_ref : '';
				if ( '' === $event && '' !== $popup_ref ) {
					$event = $popup_ref;
				}
			} elseif ( '' !== $url_raw_in ) {
				$url = esc_url_raw( $url_raw_in );
			}

			if ( 'popup' === $icon && '' === $event && str_starts_with( (string) $url, 'popup:' ) ) {
				$popup_ref2 = sanitize_text_field( trim( substr( (string) $url, 6 ) ) );
				if ( '' !== $popup_ref2 ) {
					$event = $popup_ref2;
				}
			}
			$css_id       = isset( $item['cssId'] ) ? sanitize_text_field( (string) $item['cssId'] ) : '';
			$css_class    = isset( $item['cssClass'] ) ? sanitize_text_field( (string) $item['cssClass'] ) : '';
			$display_mode = isset( $item['displayMode'] ) ? sanitize_text_field( (string) $item['displayMode'] ) : 'inline';
			if ( ! in_array( $display_mode, array( 'inline', 'block' ), true ) ) {
				$display_mode = 'inline';
			}

			$style_in  = isset( $item['style'] ) && is_array( $item['style'] ) ? $item['style'] : array();
			$bg        = isset( $style_in['bg'] ) ? sanitize_hex_color( (string) $style_in['bg'] ) : '#2563eb';
			$text      = isset( $style_in['text'] ) ? sanitize_hex_color( (string) $style_in['text'] ) : '#ffffff';
			$pv    = isset( $style_in['paddingVertical'] ) ? (int) $style_in['paddingVertical'] : 12;
			$ph    = isset( $style_in['paddingHorizontal'] ) ? (int) $style_in['paddingHorizontal'] : 24;
			$rad   = isset( $style_in['radius'] ) ? (int) $style_in['radius'] : 8;
			$hover = isset( $style_in['hoverEffect'] ) ? sanitize_text_field( (string) $style_in['hoverEffect'] ) : 'none';

			if ( ! $bg ) {
				$bg = '#2563eb';
			}
			if ( ! $text ) {
				$text = '#ffffff';
			}

			$pv  = max( 0, min( 80, $pv ) );
			$ph  = max( 0, min( 120, $ph ) );
			$rad = max( 0, min( 80, $rad ) );

			if ( ! in_array( $hover, $allowed_hover, true ) ) {
				$hover = 'none';
			}

			$display_mode = isset( $item['displayMode'] ) ? sanitize_text_field( (string) $item['displayMode'] ) : 'inline';
			if ( ! in_array( $display_mode, array( 'inline', 'block' ), true ) ) {
				$display_mode = 'inline';
			}

			$out[] = array(
				'id'          => $id !== '' ? $id : 'btn-' . ( count( $out ) + 1 ),
				'label'       => $label,
				'url'         => $url,
				'eventName'   => $event,
				'icon'        => $icon,
				'displayMode' => $display_mode,
				'cssId'       => $css_id,
				'cssClass'    => $css_class,
				'style'     => array(
					'bg'                => $bg,
					'text'              => $text,
					'paddingVertical'   => (string) $pv,
					'paddingHorizontal' => (string) $ph,
					'radius'            => (string) $rad,
					'hoverEffect'       => $hover,
				),
			);
		}

		return $out;
	}

	/**
	 * Sanitizes popups payload.
	 *
	 * @param array<int,mixed> $popups Popups.
	 * @return array<int,array<string,mixed>>
	 */
	private function sanitize_popups_payload( array $popups ): array {
		$out = array();
		$allowed_align = array( 'left', 'center', 'right' );
		$allowed_trigger = array( 'click', 'timer', 'scroll', 'exit' );
		$allowed_heading_mode = array( 'visual', 'code' );

		foreach ( $popups as $popup ) {
			if ( ! is_array( $popup ) ) {
				continue;
			}

			$id = isset( $popup['id'] ) ? sanitize_text_field( (string) $popup['id'] ) : '';
			$name = isset( $popup['name'] ) ? sanitize_text_field( (string) $popup['name'] ) : '';
			$event = isset( $popup['eventName'] ) ? sanitize_text_field( (string) $popup['eventName'] ) : '';
			$heading = isset( $popup['heading'] ) ? (string) $popup['heading'] : '';
			$sub = isset( $popup['subHeading'] ) ? sanitize_text_field( (string) $popup['subHeading'] ) : '';
			$align = isset( $popup['textAlign'] ) ? sanitize_text_field( (string) $popup['textAlign'] ) : 'left';
			$heading_mode = isset( $popup['headingEditMode'] ) ? sanitize_text_field( (string) $popup['headingEditMode'] ) : 'visual';
			$content = isset( $popup['content'] ) ? (string) $popup['content'] : '';

			if ( ! in_array( $align, $allowed_align, true ) ) {
				$align = 'left';
			}
			if ( ! in_array( $heading_mode, $allowed_heading_mode, true ) ) {
				$heading_mode = 'visual';
			}

			$style_in = isset( $popup['style'] ) && is_array( $popup['style'] ) ? $popup['style'] : array();
			$button_color = sanitize_hex_color( (string) ( $style_in['buttonColor'] ?? '#2563eb' ) ) ?: '#2563eb';
			$heading_text = sanitize_hex_color( (string) ( $style_in['headingTextColor'] ?? '#ffffff' ) ) ?: '#ffffff';
			$heading_bg = sanitize_hex_color( (string) ( $style_in['headingBgColor'] ?? '#1e3a8a' ) ) ?: '#1e3a8a';
			$body_bg = sanitize_hex_color( (string) ( $style_in['bodyBgColor'] ?? '#ffffff' ) ) ?: '#ffffff';
			$close_color = sanitize_hex_color( (string) ( $style_in['closeIconColor'] ?? '#ffffff' ) ) ?: '#ffffff';
			$close_bg = sanitize_hex_color( (string) ( $style_in['closeIconBg'] ?? '#ff4444' ) ) ?: '#ff4444';

		$button_width    = (int) ( $style_in['buttonWidth'] ?? 100 );
		$width           = (int) ( $style_in['width'] ?? 600 );
		$radius          = (int) ( $style_in['radius'] ?? 16 );
		$padding         = (int) ( $style_in['padding'] ?? 30 );
		$close_size      = (int) ( $style_in['closeIconSize'] ?? 20 );
		$heading_fs      = (int) ( $style_in['headingFontSize'] ?? 20 );

		$button_width = max( 10, min( 100, $button_width ) );
		$width        = max( 240, min( 1200, $width ) );
		$radius       = max( 0, min( 60, $radius ) );
		$padding      = max( 0, min( 80, $padding ) );
		$close_size   = max( 10, min( 48, $close_size ) );
		$heading_fs   = max( 12, min( 64, $heading_fs ) );

			$logic_in = isset( $popup['logic'] ) && is_array( $popup['logic'] ) ? $popup['logic'] : array();
			$logic_out = array();
			foreach ( $logic_in as $idx => $rule ) {
				if ( ! is_array( $rule ) ) {
					continue;
				}
				$rid = isset( $rule['id'] ) ? sanitize_text_field( (string) $rule['id'] ) : '';
				$trigger = isset( $rule['trigger'] ) ? sanitize_text_field( (string) $rule['trigger'] ) : 'timer';
				$delay = (int) ( $rule['delay'] ?? 0 );
				$scroll = (int) ( $rule['scrollPercentage'] ?? 0 );

				if ( ! in_array( $trigger, $allowed_trigger, true ) ) {
					$trigger = 'timer';
				}
				$delay  = max( 0, min( 3600, $delay ) );
				$scroll = max( 0, min( 100, $scroll ) );

				$logic_out[] = array(
					'id'               => $rid !== '' ? $rid : 'L' . ( $idx + 1 ),
					'trigger'          => $trigger,
					'delay'            => (string) $delay,
					'scrollPercentage' => (string) $scroll,
				);
			}
			if ( empty( $logic_out ) ) {
				$logic_out = array(
					array(
						'id'               => 'L1',
						'trigger'          => 'timer',
						'delay'            => '5',
						'scrollPercentage' => '0',
					),
				);
			}

			$conditions_in = isset( $popup['conditions'] ) && is_array( $popup['conditions'] )
				? $popup['conditions']
				: array();
			$match         = isset( $conditions_in['match'] ) ? sanitize_key( (string) $conditions_in['match'] ) : 'any';
			if ( 'all' !== $match ) {
				$match = 'any';
			}
			$rules_in = isset( $conditions_in['rules'] ) && is_array( $conditions_in['rules'] )
				? $conditions_in['rules']
				: array();
			$rules    = $this->sanitize_menu_condition_rules( $rules_in );

			$out[] = array(
				'id'              => $id !== '' ? $id : 'pop-' . ( count( $out ) + 1 ),
				'name'            => $name,
				'eventName'        => $event,
				'heading'         => wp_kses_post( $heading ),
				'headingEditMode' => $heading_mode,
				'subHeading'      => $sub,
				'textAlign'       => $align,
				'content'         => \nexulesuite_\sanitize_popup_body_for_storage( $content ),
				'conditions'      => array(
					'match' => $match,
					'rules' => $rules,
				),
			'style'           => array(
				'buttonColor'     => $button_color,
				'buttonWidth'     => (string) $button_width,
				'headingTextColor' => $heading_text,
				'headingBgColor'  => $heading_bg,
				'headingFontSize' => (string) $heading_fs,
				'bodyBgColor'     => $body_bg,
				'width'           => (string) $width,
				'radius'          => (string) $radius,
				'padding'         => (string) $padding,
				'closeIconSize'   => (string) $close_size,
				'closeIconColor'  => $close_color,
				'closeIconBg'     => $close_bg,
			),
				'logic'           => $logic_out,
			);
		}

		return $out;
	}

	/**
	 * Allows admins or holders of a valid client-access token (same gate for PDF + email routes).
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return bool
	 */
	public function can_access_reports_rest( \WP_REST_Request $request ): bool {
		if ( current_user_can( 'manage_options' ) ) {
			return true;
		}

		require_once nexulesuite_PLUGIN_DIR . 'public/class-client-access.php';

		$saved = get_option( self::GENERAL_SETTINGS_OPTION_KEY, array() );
		if ( ! is_array( $saved ) || empty( $saved['allowClientAccess'] ) ) {
			return false;
		}

		$token = sanitize_text_field( (string) $request->get_param( 'token' ) );

		return \nexulesuite_\Public\Client_Access::is_token_valid( $token );
	}

	/**
	 * Permission check for report generation (logged-in admin only — retained for clarity).
	 *
	 * @return bool
	 */
	public function can_generate_reports(): bool {
		return current_user_can( 'manage_options' );
	}

	/**
	 * Renders arbitrary content via do_shortcode() for admin preview use.
	 * Only accessible by admins — never expose shortcode rendering publicly.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response
	 */
	public function render_shortcode_preview( \WP_REST_Request $request ): \WP_REST_Response {
		$raw = wp_unslash( (string) $request->get_param( 'content' ) );
		if ( '' === trim( $raw ) ) {
			$jp = $request->get_json_params();
			if ( is_array( $jp ) && isset( $jp['content'] ) && is_string( $jp['content'] ) ) {
				$raw = wp_unslash( $jp['content'] );
			}
		}

		// Sanitised before rendering: wp_kses_post() removes script/style tags,
		// event-handler attributes and any other unsafe markup.
		$data = \nexulesuite_\build_popup_preview_payload( wp_kses_post( $raw ) );

		return rest_ensure_response(
			array(
				'success' => true,
				'data'    => $data,
			)
		);
	}

	/**
	 * Permission check for settings management.
	 *
	 * @return bool
	 */
	public function can_manage_settings(): bool {
		return current_user_can( 'manage_options' );
	}

	/**
	 * Returns saved reCAPTCHA keys (v2 checkbox or v3 score) and secret mask.
	 *
	 * @return \WP_REST_Response
	 */
	public function get_recaptcha_keys() {
		$opt = get_option( self::RECAPTCHA_OPTION_KEY, array() );
		if ( ! is_array( $opt ) ) {
			$opt = array();
		}
		$site = isset( $opt['siteKey'] ) ? sanitize_text_field( (string) $opt['siteKey'] ) : '';
		$secret = isset( $opt['secretKey'] ) ? (string) $opt['secretKey'] : '';
		$api    = isset( $opt['apiVersion'] ) ? strtolower( sanitize_text_field( (string) $opt['apiVersion'] ) ) : 'v2';
		if ( 'v3' !== $api ) {
			$api = 'v2';
		}
		$score = isset( $opt['scoreThreshold'] ) ? (float) $opt['scoreThreshold'] : 0.5;
		$score = max( 0.0, min( 1.0, $score ) );

		return rest_ensure_response(
			array(
				'success' => true,
				'data'    => array(
					'siteKey'         => $site,
					'secretMasked'    => '' !== trim( $secret ) ? '••••••••' : '',
					'apiVersion'      => $api,
					'scoreThreshold'  => $score,
				),
			)
		);
	}

	/**
	 * Saves reCAPTCHA keys and integration mode (v2 / v3).
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response
	 */
	public function save_recaptcha_keys( \WP_REST_Request $request ) {
		$prev     = get_option( self::RECAPTCHA_OPTION_KEY, array() );
		$prev_sec = ( is_array( $prev ) && isset( $prev['secretKey'] ) ) ? trim( (string) $prev['secretKey'] ) : '';

		$site = sanitize_text_field( (string) $request->get_param( 'siteKey' ) );
		$raw  = (string) $request->get_param( 'secretKey' );
		$sec  = trim( $raw );
		if ( '' === $sec ) {
			$sec = $prev_sec;
		}

		$api_param = $request->get_param( 'apiVersion' );
		if ( null === $api_param || '' === trim( (string) $api_param ) ) {
			$api = ( is_array( $prev ) && isset( $prev['apiVersion'] ) && 'v3' === strtolower( (string) $prev['apiVersion'] ) )
				? 'v3'
				: 'v2';
		} else {
			$api = strtolower( sanitize_text_field( (string) $api_param ) );
			if ( 'v3' !== $api ) {
				$api = 'v2';
			}
		}

		$score_raw = $request->get_param( 'scoreThreshold' );
		if ( null === $score_raw || '' === trim( (string) $score_raw ) ) {
			$score = ( is_array( $prev ) && isset( $prev['scoreThreshold'] ) && is_numeric( $prev['scoreThreshold'] ) )
				? max( 0.0, min( 1.0, (float) $prev['scoreThreshold'] ) )
				: 0.5;
		} else {
			$score = is_numeric( $score_raw ) ? max( 0.0, min( 1.0, (float) $score_raw ) ) : 0.5;
		}

		update_option(
			self::RECAPTCHA_OPTION_KEY,
			array(
				'siteKey'         => $site,
				'secretKey'       => $sec,
				'apiVersion'      => $api,
				'scoreThreshold'  => $score,
			),
			false
		);

		return rest_ensure_response(
			array(
				'success' => true,
				'data'    => array(
					'siteKey'         => $site,
					'secretMasked'    => '' !== $sec ? '••••••••' : '',
					'apiVersion'      => $api,
					'scoreThreshold'  => $score,
				),
			)
		);
	}

	/**
	 * Returns saved Turnstile keys (secret masked).
	 *
	 * @return \WP_REST_Response
	 */
	public function get_turnstile_keys() {
		$opt = get_option( self::TURNSTILE_OPTION_KEY, array() );
		if ( ! is_array( $opt ) ) {
			$opt = array();
		}
		$site = isset( $opt['siteKey'] ) ? sanitize_text_field( (string) $opt['siteKey'] ) : '';
		$secret = isset( $opt['secretKey'] ) ? (string) $opt['secretKey'] : '';

		return rest_ensure_response(
			array(
				'success' => true,
				'data'    => array(
					'siteKey'      => $site,
					'secretMasked' => '' !== $secret ? '••••••••' : '',
				),
			)
		);
	}

	/**
	 * Saves Turnstile keys.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response
	 */
	public function save_turnstile_keys( \WP_REST_Request $request ) {
		$site = sanitize_text_field( (string) $request->get_param( 'siteKey' ) );
		$secret = (string) $request->get_param( 'secretKey' );

		update_option(
			self::TURNSTILE_OPTION_KEY,
			array(
				'siteKey'   => $site,
				'secretKey' => trim( $secret ),
			),
			false
		);

		return rest_ensure_response(
			array(
				'success' => true,
				'data'    => array(
					'siteKey'      => $site,
					'secretMasked' => '' !== trim( $secret ) ? '••••••••' : '',
				),
			)
		);
	}

	/**
	 * Returns the saved site-wide form appearance preset.
	 *
	 * @return \WP_REST_Response
	 */
	public function get_global_appearance() {
		$raw = get_option( self::GLOBAL_APPEARANCE_OPTION_KEY, array() );
		$styling_in = is_array( $raw ) && isset( $raw['styling'] ) && is_array( $raw['styling'] ) ? $raw['styling'] : ( is_array( $raw ) ? $raw : array() );

		return rest_ensure_response(
			array(
				'success' => true,
				'data'    => array(
					'styling'   => $this->sanitize_form_styling( $styling_in ),
					'updatedAt' => isset( $raw['updatedAt'] ) ? sanitize_text_field( (string) $raw['updatedAt'] ) : '',
				),
			)
		);
	}

	/**
	 * Saves the site-wide form appearance preset (applied across forms/fields).
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function save_global_appearance( \WP_REST_Request $request ) {
		$styling_in = $request->get_param( 'styling' );
		if ( ! is_array( $styling_in ) ) {
			return new \WP_Error( 'nexulesuite_invalid_appearance', 'Invalid appearance styling.' );
		}

		$styling = $this->sanitize_form_styling( $styling_in );
		$payload = array(
			'styling'   => $styling,
			'updatedAt' => gmdate( 'c' ),
		);
		update_option( self::GLOBAL_APPEARANCE_OPTION_KEY, $payload, false );

		return rest_ensure_response(
			array(
				'success' => true,
				'data'    => $payload,
			)
		);
	}

	/**
	 * Sanitizes form builder appearance/styling payload.
	 *
	 * @param array<string,mixed> $styling_in Raw styling.
	 * @return array<string,mixed>
	 */
	private function sanitize_form_styling( array $styling_in ): array {
		$fi_design = sanitize_text_field( (string) ( $styling_in['forminatorDesign'] ?? 'default' ) );
		if ( ! in_array( $fi_design, array( 'default', 'flat', 'bold', 'material' ), true ) ) {
			$fi_design = 'default';
		}
		$fi_theme = sanitize_text_field( (string) ( $styling_in['forminatorTheme'] ?? 'default' ) );
		if ( ! in_array( $fi_theme, array( 'default', 'dark', 'light' ), true ) ) {
			$fi_theme = 'default';
		}

		$row_gap   = max( 0, min( 100, (int) ( $styling_in['rowGap'] ?? $styling_in['fieldGap'] ?? 16 ) ) );
		$col_gap   = max( 0, min( 100, (int) ( $styling_in['columnGap'] ?? 16 ) ) );
		$field_pad = max( 0, min( 100, (int) ( $styling_in['fieldPadding'] ?? 12 ) ) );
		$label_sp  = max( 0, min( 100, (int) ( $styling_in['labelSpacing'] ?? 6 ) ) );
		$border_r  = max( 0, min( 100, (int) ( $styling_in['fieldBorderRadius'] ?? 6 ) ) );
		$border_w  = max( 0, min( 100, (int) ( $styling_in['fieldBorderWidth'] ?? 1 ) ) );

		$primary = sanitize_hex_color( (string) ( $styling_in['primaryColor'] ?? $styling_in['buttonColor'] ?? '#7c3aed' ) ) ?: '#7c3aed';
		$button  = sanitize_hex_color( (string) ( $styling_in['buttonColor'] ?? $primary ) ) ?: $primary;
		$input   = sanitize_hex_color( (string) ( $styling_in['inputColor'] ?? $styling_in['fieldTextColor'] ?? '#000000' ) ) ?: '#000000';

		$border_style = sanitize_text_field( (string) ( $styling_in['fieldBorderStyle'] ?? 'solid' ) );
		if ( ! in_array( $border_style, array( 'solid', 'dashed', 'dotted', 'none' ), true ) ) {
			$border_style = 'solid';
		}

		$hex = static function ( $value, string $fallback ): string {
			$clean = sanitize_hex_color( (string) $value );
			return $clean ? $clean : $fallback;
		};

		$stack_bp = max( 320, min( 1200, (int) ( $styling_in['stackBreakpoint'] ?? 640 ) ) );

		return array(
			'backgroundColor'       => $hex( $styling_in['backgroundColor'] ?? '#ffffff', '#ffffff' ),
			'textColor'             => $hex( $styling_in['textColor'] ?? '#1e293b', '#1e293b' ),
			'buttonColor'           => $button,
			'primaryColor'          => $primary,
			'stepperColor'          => $hex( $styling_in['stepperColor'] ?? $primary, $primary ),
			'fieldFontSize'         => max( 10, min( 24, (int) ( $styling_in['fieldFontSize'] ?? $styling_in['inputFontSize'] ?? 14 ) ) ),
			'inputFontSize'         => max( 10, min( 24, (int) ( $styling_in['inputFontSize'] ?? $styling_in['fieldFontSize'] ?? 14 ) ) ),
			'labelFontSize'         => max( 10, min( 22, (int) ( $styling_in['labelFontSize'] ?? 13 ) ) ),
			'placeholderFontSize'   => max( 10, min( 22, (int) ( $styling_in['placeholderFontSize'] ?? 14 ) ) ),
			'fieldGap'              => $row_gap,
			'rowGap'                => $row_gap,
			'columnGap'             => $col_gap,
			'fieldPadding'          => $field_pad,
			'labelSpacing'          => $label_sp,
			'fieldBorderRadius'     => $border_r,
			'fieldBorderWidth'      => $border_w,
			'fieldBorderStyle'      => $border_style,
			'fieldBackgroundColor'  => $hex( $styling_in['fieldBackgroundColor'] ?? '#ffffff', '#ffffff' ),
			'fieldTextColor'        => $input,
			'inputColor'            => $input,
			'fieldBorderColor'      => $hex( $styling_in['fieldBorderColor'] ?? '#cbd5e1', '#cbd5e1' ),
			'focusBorderColor'      => $hex( $styling_in['focusBorderColor'] ?? $primary, $primary ),
			'errorBorderColor'      => $hex( $styling_in['errorBorderColor'] ?? '#dc2626', '#dc2626' ),
			'errorColor'            => $hex( $styling_in['errorColor'] ?? '#dc2626', '#dc2626' ),
			'successColor'          => $hex( $styling_in['successColor'] ?? '#16a34a', '#16a34a' ),
			'labelColor'            => $hex( $styling_in['labelColor'] ?? '#334155', '#334155' ),
			'placeholderColor'      => $hex( $styling_in['placeholderColor'] ?? '#94a3b8', '#94a3b8' ),
			'fieldFontWeight'       => sanitize_text_field( (string) ( $styling_in['fieldFontWeight'] ?? $styling_in['inputFontWeight'] ?? '500' ) ),
			'inputFontWeight'       => sanitize_text_field( (string) ( $styling_in['inputFontWeight'] ?? $styling_in['fieldFontWeight'] ?? '500' ) ),
			'labelFontWeight'       => sanitize_text_field( (string) ( $styling_in['labelFontWeight'] ?? '600' ) ),
			'placeholderFontWeight' => sanitize_text_field( (string) ( $styling_in['placeholderFontWeight'] ?? '400' ) ),
			'labelFontFamily'       => sanitize_text_field( (string) ( $styling_in['labelFontFamily'] ?? 'inherit' ) ),
			'placeholderFontFamily' => sanitize_text_field( (string) ( $styling_in['placeholderFontFamily'] ?? 'inherit' ) ),
			'labelLineHeight'       => sanitize_text_field( (string) ( $styling_in['labelLineHeight'] ?? '1.4' ) ),
			'placeholderLineHeight' => sanitize_text_field( (string) ( $styling_in['placeholderLineHeight'] ?? '1.4' ) ),
			'fieldShadow'           => sanitize_text_field( (string) ( $styling_in['fieldShadow'] ?? 'none' ) ),
			'formShadow'            => sanitize_text_field( (string) ( $styling_in['formShadow'] ?? '0 2px 8px rgba(15, 23, 42, 0.07)' ) ),
			'focusShadow'           => sanitize_text_field( (string) ( $styling_in['focusShadow'] ?? '0 0 0 3px rgba(124, 58, 237, 0.25)' ) ),
			'autoStack'             => ! empty( $styling_in['autoStack'] ),
			'stackBreakpoint'       => $stack_bp,
			'forminatorDesign'      => $fi_design,
			'forminatorTheme'       => $fi_theme,
		);
	}

	/**
	 * Returns persisted forms payload.
	 *
	 * @return \WP_REST_Response
	 */
	public function get_forms() {
		$raw = get_option( self::FORMS_OPTION_KEY, '' );
		$decoded = $this->decode_payload( is_string( $raw ) ? $raw : '' );
		if ( ! is_array( $decoded ) ) {
			$decoded = array(
				'forms' => array(),
			);
		}

		if ( empty( $decoded['forms'] ) || ! is_array( $decoded['forms'] ) ) {
			$decoded['forms'] = array();
		}

		$repaired = $this->repair_forms_payload( $decoded );
		if ( $repaired !== $decoded ) {
			update_option( self::FORMS_OPTION_KEY, $this->encode_payload( $repaired ), false );
			$decoded = $repaired;
		}

		return rest_ensure_response(
			array(
				'success' => true,
				'data'    => array(
					'payload' => $decoded,
				),
			)
		);
	}

	/**
	 * Saves forms payload.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function save_forms( \WP_REST_Request $request ) {
		$payload = $request->get_param( 'payload' );
		if ( ! is_array( $payload ) ) {
			return new \WP_Error( 'nexulesuite_invalid_forms', 'Invalid forms payload.' );
		}

		$clean = $this->sanitize_forms_payload( $payload );
		$encoded = $this->encode_payload( $clean );

		update_option( self::FORMS_OPTION_KEY, $encoded, false );

		return rest_ensure_response(
			array(
				'success' => true,
				'data'    => array(
					'payload' => $clean,
				),
			)
		);
	}

	/**
	 * Sanitizes forms payload (shallow allowlist).
	 *
	 * @param array<string,mixed> $payload Payload.
	 * @return array<string,mixed>
	 */
	private function sanitize_forms_payload( array $payload ): array {
		$forms = isset( $payload['forms'] ) && is_array( $payload['forms'] ) ? $payload['forms'] : array();
		$out_forms = array();

		foreach ( $forms as $form ) {
			if ( ! is_array( $form ) ) {
				continue;
			}

			$id   = isset( $form['id'] ) ? sanitize_text_field( (string) $form['id'] ) : '';
			$name = isset( $form['name'] ) ? sanitize_text_field( (string) $form['name'] ) : '';
			$form_type = isset( $form['formType'] ) ? sanitize_text_field( (string) $form['formType'] ) : 'simple';
			if ( 'multi' !== $form_type ) {
				$form_type = 'simple';
			}

			$submit_btn_text = isset( $form['submitBtnText'] ) ? sanitize_text_field( (string) $form['submitBtnText'] ) : 'Submit';
			$submission_method = isset( $form['submissionMethod'] ) ? sanitize_text_field( (string) $form['submissionMethod'] ) : 'ajax';
			if ( 'reload' !== $submission_method ) {
				$submission_method = 'ajax';
			}

			$notification_email_raw = isset( $form['notificationEmail'] ) ? sanitize_text_field( (string) $form['notificationEmail'] ) : '';

			$crm_webhook = isset( $form['crmWebhookUrl'] ) ? $this->sanitize_integration_webhook_url( (string) $form['crmWebhookUrl'] ) : '';

			$published = true;
			if ( array_key_exists( 'published', $form ) ) {
				$published = (bool) $form['published'];
			}

			$styling_in  = isset( $form['styling'] ) && is_array( $form['styling'] ) ? $form['styling'] : array();
			$styling_out = $this->sanitize_form_styling( $styling_in );

			// Custom header/footer HTML is intentionally not accepted or stored: arbitrary
			// markup insertion is not permitted through the plugin interface.

			// Custom CSS is intentionally not accepted or stored: arbitrary style/code
			// insertion is not permitted. Use the theme Customizer's Additional CSS instead.
			$terms_out = isset( $form['termsConditionText'] ) ? sanitize_textarea_field( (string) $form['termsConditionText'] ) : '';

			$steps_in = isset( $form['steps'] ) && is_array( $form['steps'] ) ? $form['steps'] : array();
			$steps_out = array();

			foreach ( $steps_in as $step ) {
				if ( ! is_array( $step ) ) {
					continue;
				}
				$step_id = isset( $step['id'] ) ? sanitize_text_field( (string) $step['id'] ) : '';
				$title   = isset( $step['title'] ) ? sanitize_text_field( (string) $step['title'] ) : '';
				$subtitle = isset( $step['subtitle'] ) ? sanitize_text_field( (string) $step['subtitle'] ) : '';
				$fields_in = isset( $step['fields'] ) && is_array( $step['fields'] ) ? $step['fields'] : array();
				$fields_out = $this->sanitize_form_blocks( $fields_in );

				$steps_out[] = array(
					'id'       => $step_id !== '' ? $step_id : 'step-' . ( count( $steps_out ) + 1 ),
					'title'    => $title,
					'subtitle' => $subtitle,
					'fields'   => $fields_out,
				);
			}

			if ( empty( $steps_out ) ) {
				$steps_out = array(
					array(
						'id'       => 'step-1',
						'title'    => '',
						'subtitle' => '',
						'fields'   => array(),
					),
				);
			}

			// Conditional confirmations (ordered list; the server picks the first match, else the default).
			$confirmations_out = array();
			$has_default       = false;
			$confirmations_in  = isset( $form['confirmations'] ) && is_array( $form['confirmations'] ) ? $form['confirmations'] : array();
			foreach ( $confirmations_in as $conf ) {
				if ( ! is_array( $conf ) ) {
					continue;
				}
				$is_default = ! empty( $conf['isDefault'] );
				$has_default = $has_default || $is_default;
				$confirmations_out[] = array(
					'id'          => isset( $conf['id'] ) ? sanitize_text_field( (string) $conf['id'] ) : 'confirm-' . ( count( $confirmations_out ) + 1 ),
					'name'        => isset( $conf['name'] ) ? sanitize_text_field( (string) $conf['name'] ) : 'Confirmation',
					'isDefault'   => $is_default,
					'type'        => ( isset( $conf['type'] ) && 'redirect' === $conf['type'] ) ? 'redirect' : 'message',
					'message'     => isset( $conf['message'] ) ? wp_kses_post( (string) $conf['message'] ) : '',
					'redirectUrl' => isset( $conf['redirectUrl'] ) ? esc_url_raw( trim( (string) $conf['redirectUrl'] ) ) : '',
					'conditional' => $is_default ? array( 'enabled' => false, 'match' => 'all', 'rules' => array() ) : $this->sanitize_confirmation_conditional( $conf['conditional'] ?? array() ),
				);
			}
			if ( ! $has_default ) {
				array_unshift( $confirmations_out, array(
					'id' => 'confirm-default', 'name' => 'Default confirmation', 'isDefault' => true, 'type' => 'message',
					'message' => __(
						"Thanks for reaching out! We've received your request and are reviewing your details. We will follow up soon to confirm your insurance and finalize your appointment.\n\nNeed help right away? Please call us during our office hours. For all medical emergencies, please call 911 immediately.",
						'nexus-lead-suite'
					),
					'redirectUrl' => '',
					'conditional' => array( 'enabled' => false, 'match' => 'all', 'rules' => array() ),
				) );
			}

			// Conditional email routing (extra recipients when a rule set matches).
			$email_routes_out = array();
			$email_routes_in  = isset( $form['emailRoutes'] ) && is_array( $form['emailRoutes'] ) ? $form['emailRoutes'] : array();
			foreach ( $email_routes_in as $route ) {
				if ( ! is_array( $route ) ) {
					continue;
				}
				$route_recipient = isset( $route['recipient'] ) ? sanitize_text_field( (string) $route['recipient'] ) : '';
				if ( '' === trim( $route_recipient ) ) {
					continue;
				}
				$email_routes_out[] = array(
					'id'          => isset( $route['id'] ) ? sanitize_text_field( (string) $route['id'] ) : 'route-' . ( count( $email_routes_out ) + 1 ),
					'recipient'   => $route_recipient,
					'conditional' => $this->sanitize_confirmation_conditional( $route['conditional'] ?? array() ),
				);
			}
			$out_forms[] = array(
				'id'                => $id !== '' ? $id : 'form-' . ( count( $out_forms ) + 1 ),
				'name'              => $name,
				'formType'          => $form_type,
				'published'         => $published,
				'submitBtnText'     => $submit_btn_text,
				'submissionMethod'  => $submission_method,
				'notificationEmail' => $notification_email_raw,
				'crmWebhookUrl'     => $crm_webhook,
				'styling'           => $styling_out,
				'termsConditionText'=> $terms_out,
				'confirmations'     => $confirmations_out,
				'emailRoutes'       => $email_routes_out,
				'steps'             => $steps_out,
			);
		}

		return array(
			'forms' => $out_forms,
		);
	}

	/**
	 * Sanitizes a confirmation/route conditional block: { enabled, match:'all'|'any', rules:[{field,operator,value}] }.
	 * Mirrors the per-field conditional shape but without the show/hide action.
	 *
	 * @param mixed $raw Raw conditional payload.
	 * @return array<string,mixed>
	 */
	private function sanitize_confirmation_conditional( $raw ): array {
		$in          = is_array( $raw ) ? $raw : array();
		$match       = isset( $in['match'] ) && 'any' === $in['match'] ? 'any' : 'all';
		$allowed_ops = array( 'is', 'is_not', 'contains', 'starts_with', 'ends_with', 'greater_than', 'less_than', 'is_empty', 'is_not_empty' );
		$rules_in    = isset( $in['rules'] ) && is_array( $in['rules'] ) ? $in['rules'] : array();
		$rules_out   = array();
		foreach ( $rules_in as $rule ) {
			if ( ! is_array( $rule ) ) {
				continue;
			}
			$field = isset( $rule['field'] ) ? sanitize_text_field( (string) $rule['field'] ) : '';
			if ( '' === $field ) {
				continue;
			}
			$op = isset( $rule['operator'] ) ? sanitize_text_field( (string) $rule['operator'] ) : 'is';
			if ( ! in_array( $op, $allowed_ops, true ) ) {
				$op = 'is';
			}
			$rules_out[] = array(
				'field'    => $field,
				'operator' => $op,
				'value'    => isset( $rule['value'] ) ? sanitize_text_field( (string) $rule['value'] ) : '',
			);
		}
		return array(
			'enabled' => ! empty( $in['enabled'] ) && ! empty( $rules_out ),
			'match'   => $match,
			'rules'   => $rules_out,
		);
	}

	/**
	 * Sanitizes blocks inside steps, including nested layout blocks.
	 *
	 * Supported shapes:
	 * - Field block:  { id, moduleId, columnSpan?, settings? }
	 * - Layout block: { kind: "layout", id?, layout: { columns, items: [ [blocks], [blocks], ... ] } }
	 *
	 * @param array<int,mixed> $blocks Incoming blocks.
	 * @return array<int,array<string,mixed>> Sanitized blocks.
	 */
	private function sanitize_form_blocks( array $blocks ): array {
		$out = array();

		foreach ( $blocks as $block ) {
			if ( ! is_array( $block ) ) {
				continue;
			}

			$kind = isset( $block['kind'] ) ? sanitize_text_field( (string) $block['kind'] ) : 'field';
			$is_layout = ( 'layout' === $kind );
			if ( ! $is_layout && isset( $block['layout'] ) && is_array( $block['layout'] ) ) {
				// Back-compat: older/broken saves may omit `kind` but include a layout object.
				$is_layout = true;
			}

			if ( $is_layout ) {
				$layout_in = isset( $block['layout'] ) && is_array( $block['layout'] ) ? $block['layout'] : array();
				$cols      = isset( $layout_in['columns'] ) ? (int) $layout_in['columns'] : 2;
				$cols      = max( 1, min( 4, $cols ) );

				$items_in = isset( $layout_in['items'] ) && is_array( $layout_in['items'] ) ? $layout_in['items'] : array();
				$items_out = array();
				for ( $i = 0; $i < $cols; $i++ ) {
					$col = isset( $items_in[ $i ] ) && is_array( $items_in[ $i ] ) ? $items_in[ $i ] : array();
					$items_out[ $i ] = $this->sanitize_form_blocks( $col );
				}

				$out[] = array(
					'kind'   => 'layout',
					'id'     => isset( $block['id'] ) ? sanitize_text_field( (string) $block['id'] ) : 'layout-' . ( count( $out ) + 1 ),
					'layout' => array(
						'columns' => $cols,
						'items'   => $items_out,
					),
				);
				continue;
			}

			$field = $this->sanitize_form_field_block( $block, count( $out ) + 1 );
			if ( null !== $field ) {
				$out[] = $field;
			}
		}

		return $out;
	}

	/**
	 * Repairs and normalizes a persisted forms payload.
	 *
	 * - Drops invalid/blank field blocks (e.g. moduleId missing).
	 * - Fixes legacy/broken layout blocks that have `layout` but missing `kind`.
	 * - Recursively sanitizes nested blocks to the current supported shape.
	 *
	 * @param array<string,mixed> $payload Payload.
	 * @return array<string,mixed>
	 */
	private function repair_forms_payload( array $payload ): array {
		$forms_in = isset( $payload['forms'] ) && is_array( $payload['forms'] ) ? $payload['forms'] : array();
		$forms_out = array();

		foreach ( $forms_in as $form ) {
			if ( ! is_array( $form ) ) {
				continue;
			}

			$steps_in = isset( $form['steps'] ) && is_array( $form['steps'] ) ? $form['steps'] : array();
			$steps_out = array();

			foreach ( $steps_in as $step ) {
				if ( ! is_array( $step ) ) {
					continue;
				}

				$fields_in = isset( $step['fields'] ) && is_array( $step['fields'] ) ? $step['fields'] : array();
				$fields_out = $this->sanitize_form_blocks( $fields_in );

				$step_out = $step;
				$step_out['fields'] = $fields_out;
				$steps_out[] = $step_out;
			}

			$form_out = $form;
			$form_out['steps'] = $steps_out;
			$forms_out[] = $form_out;
		}

		$out = $payload;
		$out['forms'] = $forms_out;
		return $out;
	}

	/**
	 * Sanitizes a single field block.
	 *
	 * @param array<string,mixed> $field Field.
	 * @param int                $fallback_index Used for generating stable ids.
	 * @return array<string,mixed>|null
	 */
	private function sanitize_form_field_block( array $field, int $fallback_index ): ?array {
		$field_id  = isset( $field['id'] ) ? sanitize_text_field( (string) $field['id'] ) : '';
		$module_id = isset( $field['moduleId'] ) ? sanitize_text_field( (string) $field['moduleId'] ) : '';
		if ( '' === $module_id ) {
			return null;
		}

		$column_span = isset( $field['columnSpan'] ) ? (int) $field['columnSpan'] : 1;
		if ( $column_span < 1 || $column_span > 4 ) {
			$column_span = 1;
		}

		$settings = isset( $field['settings'] ) && is_array( $field['settings'] ) ? $field['settings'] : array();
		$visibility = isset( $settings['visibility'] ) && is_array( $settings['visibility'] ) ? $settings['visibility'] : array();
		$visibility_mode = isset( $visibility['mode'] ) ? sanitize_text_field( (string) $visibility['mode'] ) : 'single';
		if ( 'expanded' !== $visibility_mode ) {
			$visibility_mode = 'single';
		}

		$option_layout = isset( $settings['optionLayout'] ) ? sanitize_text_field( (string) $settings['optionLayout'] ) : 'vertical';
		if ( 'inline' !== $option_layout ) {
			$option_layout = 'vertical';
		}

		$options_in = isset( $settings['options'] ) && is_array( $settings['options'] ) ? $settings['options'] : array();
		$options_out = array();
		foreach ( $options_in as $opt ) {
			if ( ! is_array( $opt ) ) {
				continue;
			}
			$opt_label = isset( $opt['label'] ) ? sanitize_text_field( (string) $opt['label'] ) : '';
			$opt_value = isset( $opt['value'] ) ? sanitize_text_field( (string) $opt['value'] ) : '';
			if ( '' === $opt_label && '' === $opt_value ) {
				continue;
			}
			$options_out[] = array(
				'label' => $opt_label,
				'value' => $opt_value,
			);
		}

		$name_parts_in = isset( $settings['nameParts'] ) && is_array( $settings['nameParts'] ) ? $settings['nameParts'] : array();
		$name_parts_out = array();
		foreach ( array( 'prefix', 'first', 'middle', 'last' ) as $part_key ) {
			$part = isset( $name_parts_in[ $part_key ] ) && is_array( $name_parts_in[ $part_key ] ) ? $name_parts_in[ $part_key ] : array();
			$name_parts_out[ $part_key ] = array(
				'enabled' => ! empty( $part['enabled'] ),
				'label'   => sanitize_text_field( (string) ( $part['label'] ?? '' ) ),
			);
		}

		$phone_validation_in = isset( $settings['phoneValidation'] ) && is_array( $settings['phoneValidation'] ) ? $settings['phoneValidation'] : array();
		$phone_validation_type = isset( $phone_validation_in['type'] ) ? sanitize_text_field( (string) $phone_validation_in['type'] ) : 'none';
		$allowed_phone_types = array( 'none', 'national', 'international', 'character_limit' );
		if ( ! in_array( $phone_validation_type, $allowed_phone_types, true ) ) {
			$phone_validation_type = 'none';
		}
		$phone_character_limit = isset( $phone_validation_in['characterLimit'] ) ? (int) $phone_validation_in['characterLimit'] : 0;
		if ( $phone_character_limit < 0 || $phone_character_limit > 64 ) {
			$phone_character_limit = 0;
		}

		$address_parts_in = isset( $settings['addressParts'] ) && is_array( $settings['addressParts'] ) ? $settings['addressParts'] : array();
		$address_parts_out = array();
		foreach ( array( 'address1', 'address2', 'city', 'state', 'zip', 'country' ) as $part_key ) {
			$part = isset( $address_parts_in[ $part_key ] ) && is_array( $address_parts_in[ $part_key ] ) ? $address_parts_in[ $part_key ] : array();
			$address_parts_out[ $part_key ] = array(
				'enabled' => ! empty( $part['enabled'] ),
				'label'   => sanitize_text_field( (string) ( $part['label'] ?? '' ) ),
			);
		}

		$consent_in = isset( $settings['consent'] ) && is_array( $settings['consent'] ) ? $settings['consent'] : array();
		$consent_mode = isset( $consent_in['mode'] ) ? sanitize_text_field( (string) $consent_in['mode'] ) : 'visual';
		if ( 'code' !== $consent_mode ) {
			$consent_mode = 'visual';
		}
		$consent_out = array(
			'label' => sanitize_text_field( (string) ( $consent_in['label'] ?? '' ) ),
			'html'  => wp_kses_post( (string) ( $consent_in['html'] ?? '' ) ),
			'mode'  => $consent_mode,
		);

		$help_in = sanitize_text_field( (string) ( $settings['helpText'] ?? '' ) );
		if ( '' === $help_in && isset( $settings['description'] ) ) {
			$help_in = sanitize_text_field( (string) $settings['description'] );
		}

		$conditional_in  = isset( $settings['conditional'] ) && is_array( $settings['conditional'] ) ? $settings['conditional'] : array();
		$cond_action     = isset( $conditional_in['action'] ) && 'hide' === $conditional_in['action'] ? 'hide' : 'show';
		$cond_match       = isset( $conditional_in['match'] ) && 'any' === $conditional_in['match'] ? 'any' : 'all';
		$allowed_cond_ops = array( 'is', 'is_not', 'contains', 'starts_with', 'ends_with', 'greater_than', 'less_than', 'is_empty', 'is_not_empty' );
		$cond_rules_in    = isset( $conditional_in['rules'] ) && is_array( $conditional_in['rules'] ) ? $conditional_in['rules'] : array();
		$cond_rules_out   = array();
		foreach ( $cond_rules_in as $rule ) {
			if ( ! is_array( $rule ) ) {
				continue;
			}
			$rule_field = isset( $rule['field'] ) ? sanitize_text_field( (string) $rule['field'] ) : '';
			if ( '' === $rule_field ) {
				continue;
			}
			$rule_op = isset( $rule['operator'] ) ? sanitize_text_field( (string) $rule['operator'] ) : 'is';
			if ( ! in_array( $rule_op, $allowed_cond_ops, true ) ) {
				$rule_op = 'is';
			}
			$cond_rules_out[] = array(
				'field'    => $rule_field,
				'operator' => $rule_op,
				'value'    => isset( $rule['value'] ) ? sanitize_text_field( (string) $rule['value'] ) : '',
			);
		}
		$conditional_out = array(
			'enabled' => ! empty( $conditional_in['enabled'] ) && ! empty( $cond_rules_out ),
			'action'  => $cond_action,
			'match'   => $cond_match,
			'rules'   => $cond_rules_out,
		);

		$settings_out = array(
			'label'           => sanitize_text_field( (string) ( $settings['label'] ?? '' ) ),
			'showLabel'       => ! isset( $settings['showLabel'] ) ? true : ! empty( $settings['showLabel'] ),
			'placeholder'     => sanitize_text_field( (string) ( $settings['placeholder'] ?? '' ) ),
			'helpText'        => $help_in,
			'required'        => ! empty( $settings['required'] ),
			'visibility'      => array(
				'mode' => $visibility_mode,
			),
			'backgroundColor' => sanitize_hex_color( (string) ( $settings['backgroundColor'] ?? '#ffffff' ) ) ?: '#ffffff',
			'textColor'       => sanitize_hex_color( (string) ( $settings['textColor'] ?? '#000000' ) ) ?: '#000000',
			'borderColor'     => sanitize_hex_color( (string) ( $settings['borderColor'] ?? '#cbd5e1' ) ) ?: '#cbd5e1',
			'borderRadius'    => max( 0, min( 100, (int) ( $settings['borderRadius'] ?? 6 ) ) ),
			'borderWidth'     => max( 0, min( 100, (int) ( $settings['borderWidth'] ?? 1 ) ) ),
			'padding'         => max( 0, min( 100, (int) ( $settings['padding'] ?? 12 ) ) ),
			'fontSize'        => max( 10, (int) ( $settings['fontSize'] ?? 14 ) ),
			'fontWeight'      => sanitize_text_field( (string) ( $settings['fontWeight'] ?? '500' ) ),
			'options'         => $options_out,
			'optionLayout'    => $option_layout,
			'nameParts'       => $name_parts_out,
			'phoneValidation' => array(
				'type'           => $phone_validation_type,
				'characterLimit' => $phone_character_limit,
			),
			'addressParts'    => $address_parts_out,
			'consent'         => $consent_out,
			'conditional'     => $conditional_out,
			'columnSpan'      => $column_span,
		);

		return array(
			'kind'      => 'field',
			'id'        => $field_id !== '' ? $field_id : 'field-' . $fallback_index,
			'moduleId'  => $module_id,
			'columnSpan'=> $column_span,
			'settings'  => $settings_out,
		);
	}

	/**
	 * Encodes payload as base64(rawurlencode(JSON)).
	 *
	 * @param array<string,mixed> $payload Payload.
	 * @return string
	 */
	private function encode_payload( array $payload ): string {
		return Forms_Payload_Codec::encode_for_storage( $payload );
	}

	/**
	 * Decodes payload from base64(rawurlencode(JSON)).
	 *
	 * @param string $encoded Encoded payload.
	 * @return array<string,mixed>|null
	 */
	private function decode_payload( string $encoded ) {
		return Forms_Payload_Codec::decode_from_storage_string( $encoded );
	}

	/**
	 * Returns saved email templates.
	 *
	 * @return \WP_REST_Response
	 */
	public function get_email_templates() {
		$templates = get_option( self::EMAIL_TEMPLATES_OPTION_KEY, null );
		if ( null === $templates ) {
			// Back-compat: older builds used this option key.
			$templates = get_option( 'nexulesuite_email_templates', array() );
		}
		if ( ! is_array( $templates ) ) {
			$templates = array();
		}

		$templates = $this->normalize_email_templates( $templates );

		return rest_ensure_response(
			array(
				'success' => true,
				'data'    => array(
					'templates' => $templates,
				),
			)
		);
	}

	/**
	 * Saves email templates.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response
	 */
	public function save_email_templates( \WP_REST_Request $request ) {
		$templates = $request->get_param( 'templates' );
		if ( ! is_array( $templates ) ) {
			$templates = array();
		}

		$content_encoding = $request->get_param( 'contentEncoding' );
		$use_base64       = is_string( $content_encoding ) && 'base64' === strtolower( $content_encoding );
		if ( $use_base64 ) {
			foreach ( $templates as $idx => $tpl ) {
				if ( ! is_array( $tpl ) || ! isset( $tpl['content'] ) ) {
					continue;
				}
				$raw     = (string) $tpl['content'];
				$decoded = base64_decode( $raw, true );
				if ( false !== $decoded ) {
					$templates[ $idx ]['content'] = $decoded;
				}
			}
		}

		$clean = $this->sanitize_email_templates_payload( $templates );

		update_option( self::EMAIL_TEMPLATES_OPTION_KEY, $clean, false );

		return rest_ensure_response(
			array(
				'success' => true,
				'data'    => array(
					'templates' => $clean,
				),
			)
		);
	}

	/**
	 * Normalizes stored templates into v1 schema.
	 *
	 * @param array<int,mixed> $templates Templates.
	 * @return array<int,array<string,mixed>>
	 */
	private function normalize_email_templates( array $templates ): array {
		$out = array();
		foreach ( $templates as $tpl ) {
			if ( ! is_array( $tpl ) ) {
				continue;
			}

			// Old shape support: { id, emails(string), subject, contents }.
			if ( isset( $tpl['emails'] ) || isset( $tpl['contents'] ) ) {
				$id = isset( $tpl['id'] ) ? sanitize_text_field( (string) $tpl['id'] ) : '';
				$subject = isset( $tpl['subject'] ) ? sanitize_text_field( (string) $tpl['subject'] ) : '';
				$emails_raw = isset( $tpl['emails'] ) ? (string) $tpl['emails'] : '';
				$contents = isset( $tpl['contents'] ) ? (string) $tpl['contents'] : '';

				$recipients = preg_split( '/[\r\n,]+/', $emails_raw );
				if ( ! is_array( $recipients ) ) {
					$recipients = array();
				}
				$recipients = array_values(
					array_filter(
						array_map(
							static function ( $e ) {
								$e = sanitize_email( (string) $e );
								return ( $e && is_email( $e ) ) ? $e : '';
							},
							$recipients
						)
					)
				);
				$recipients = array_values( array_unique( $recipients ) );

				$out[] = array(
					'id'         => $id !== '' ? $id : 'template-' . ( count( $out ) + 1 ),
					'name'       => 'Email Template',
					'uuid'       => wp_generate_uuid4(),
					'recipients' => $recipients,
					'subject'    => $subject,
					'content'    => $contents,
				);
				continue;
			}

			// New shape.
			$out[] = $tpl;
		}

		return $this->sanitize_email_templates_payload( $out );
	}

	/**
	 * Sanitizes email templates payload.
	 *
	 * @param array<int,mixed> $templates Templates.
	 * @return array<int,array<string,mixed>>
	 */
	private function sanitize_email_templates_payload( array $templates ): array {
		$out = array();
		$allowed_html = wp_kses_allowed_html( 'post' );
		$allowed_html['html']   = array( 'lang' => true );
		$allowed_html['head']   = array();
		$allowed_html['body']   = array();
		$allowed_html['title']  = array();
		$allowed_html['meta']   = array(
			'charset'    => true,
			'name'       => true,
			'content'    => true,
			'http-equiv' => true,
		);
		$allowed_html['style']  = array( 'type' => true );

		foreach ( $templates as $tpl ) {
			if ( ! is_array( $tpl ) ) {
				continue;
			}

			$id   = isset( $tpl['id'] ) ? sanitize_text_field( (string) $tpl['id'] ) : '';
			$name = isset( $tpl['name'] ) ? sanitize_text_field( (string) $tpl['name'] ) : '';
			$uuid = isset( $tpl['uuid'] ) ? sanitize_text_field( (string) $tpl['uuid'] ) : '';
			if ( '' === $uuid ) {
				$uuid = wp_generate_uuid4();
			}

			$subject = isset( $tpl['subject'] ) ? sanitize_text_field( (string) $tpl['subject'] ) : '';
			$content = isset( $tpl['content'] ) ? (string) $tpl['content'] : '';

			// Block scripts explicitly.
			$content = preg_replace( '#<\s*script[^>]*>.*?<\s*/\s*script\s*>#is', '', $content );
			$content = is_string( $content ) ? $content : '';
			$content = wp_kses( $content, $allowed_html );

			$recipients_in = isset( $tpl['recipients'] ) && is_array( $tpl['recipients'] ) ? $tpl['recipients'] : array();
			$recipients = array();
			foreach ( $recipients_in as $email ) {
				$email = sanitize_email( (string) $email );
				if ( $email && is_email( $email ) ) {
					$recipients[] = $email;
				}
			}
			$recipients = array_values( array_unique( $recipients ) );

			$out[] = array(
				'id'         => $id !== '' ? $id : 'template-' . ( count( $out ) + 1 ),
				'name'       => $name !== '' ? $name : 'Untitled Template',
				'uuid'       => $uuid,
				'recipients' => $recipients,
				'subject'    => $subject,
				'content'    => $content,
			);
		}

		return $out;
	}

	/**
	 * Returns SMTP settings (password omitted).
	 *
	 * @return \WP_REST_Response
	 */
	public function get_smtp_settings() {
		$opt = get_option( \nexulesuite_\Mailer::OPTION_KEY, array() );
		if ( ! is_array( $opt ) ) {
			$opt = array();
		}

		return rest_ensure_response(
			array(
				'success' => true,
				'data'    => $this->smtp_public_payload( $opt ),
			)
		);
	}

	/**
	 * Saves SMTP settings to the database.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function save_smtp_settings( \WP_REST_Request $request ) {
		require_once nexulesuite_PLUGIN_DIR . 'core/class-mailer.php';

		$settings = $request->get_param( 'settings' );
		if ( ! is_array( $settings ) ) {
			return new \WP_Error( 'nexulesuite_invalid_smtp', 'Invalid SMTP settings.' );
		}

		$prev = get_option( \nexulesuite_\Mailer::OPTION_KEY, array() );
		$prev = is_array( $prev ) ? $prev : array();
		$prev_pass   = isset( $prev['password'] ) ? (string) $prev['password'] : '';
		$new_pass    = isset( $settings['password'] ) ? (string) $settings['password'] : '';
		$prev_secret = isset( $prev['oauth_client_secret'] ) ? (string) $prev['oauth_client_secret'] : '';
		$new_secret  = isset( $settings['oauth_client_secret'] ) ? (string) $settings['oauth_client_secret'] : '';

		$mailer = sanitize_key( (string) ( $settings['mailer'] ?? 'other' ) );
		$allowed_mailers = array( 'other', 'gmail', 'outlook' );
		if ( ! in_array( $mailer, $allowed_mailers, true ) ) {
			$mailer = 'other';
		}

		$clean = array(
			'enabled'         => ! empty( $settings['enabled'] ),
			'mailer'          => $mailer,
			'host'            => sanitize_text_field( (string) ( $settings['host'] ?? '' ) ),
			'port'            => (int) ( $settings['port'] ?? 587 ),
			'secure'          => sanitize_text_field( (string) ( $settings['secure'] ?? 'tls' ) ),
			'username'        => sanitize_text_field( (string) ( $settings['username'] ?? '' ) ),
			// Empty password in payload keeps the stored (already-encrypted) password;
			// a new password is encrypted at rest before storage.
			'password'        => '' !== $new_pass ? \nexulesuite_\Mailer::encrypt_secret( $new_pass ) : $prev_pass,
			'from_email'      => sanitize_email( (string) ( $settings['from_email'] ?? '' ) ),
			'from_name'       => sanitize_text_field( (string) ( $settings['from_name'] ?? '' ) ),
			'force_from_name' => ! empty( $settings['force_from_name'] ),
			// OAuth app credentials (Gmail / Outlook). Secret is encrypted; empty keeps the stored one.
			'oauth_client_id'     => sanitize_text_field( (string) ( $settings['oauth_client_id'] ?? '' ) ),
			'oauth_client_secret' => '' !== $new_secret ? \nexulesuite_\Mailer::encrypt_secret( $new_secret ) : $prev_secret,
		);

		// Preserve tokens obtained via the OAuth flow — the settings form never sends these.
		foreach ( array( 'oauth_refresh_token', 'oauth_access_token', 'oauth_expires', 'oauth_email' ) as $keep ) {
			if ( isset( $prev[ $keep ] ) ) {
				$clean[ $keep ] = $prev[ $keep ];
			}
		}
		// Changing the OAuth app credentials invalidates any existing connection.
		if ( '' !== $new_secret && $prev_secret !== $clean['oauth_client_secret'] ) {
			unset( $clean['oauth_refresh_token'], $clean['oauth_access_token'], $clean['oauth_expires'], $clean['oauth_email'] );
		}

		// Provider presets own their relay endpoint — store the preset values so the
		// saved record is self-consistent even though get_effective_settings() re-applies them.
		$presets = \nexulesuite_\Mailer::mailer_presets();
		if ( isset( $presets[ $mailer ] ) ) {
			$clean['host']   = $presets[ $mailer ]['host'];
			$clean['port']   = (int) $presets[ $mailer ]['port'];
			$clean['secure'] = $presets[ $mailer ]['secure'];
		}

		if ( $clean['port'] <= 0 || $clean['port'] > 65535 ) {
			$clean['port'] = 587;
		}

		$allowed_secure = array( '', 'tls', 'ssl' );
		if ( ! in_array( $clean['secure'], $allowed_secure, true ) ) {
			$clean['secure'] = 'tls';
		}

		update_option( \nexulesuite_\Mailer::OPTION_KEY, $clean, false );

		return rest_ensure_response(
			array(
				'success' => true,
				'data'    => $this->smtp_public_payload( $clean ),
			)
		);
	}

	/**
	 * Builds the browser-safe SMTP payload: settings with every secret stripped,
	 * plus non-sensitive status flags and OAuth action URLs.
	 *
	 * @param array<string,mixed> $opt Raw stored settings.
	 * @return array<string,mixed>
	 */
	private function smtp_public_payload( array $opt ): array {
		require_once nexulesuite_PLUGIN_DIR . 'core/class-smtp-oauth.php';

		$public = $opt;
		unset(
			$public['password'],
			$public['oauth_client_secret'],
			$public['oauth_refresh_token'],
			$public['oauth_access_token'],
			$public['oauth_expires']
		);

		return array(
			'settings'        => $public,
			'hasPassword'     => ! empty( $opt['password'] ),
			'hasClientSecret' => ! empty( $opt['oauth_client_secret'] ),
			'connected'       => ! empty( $opt['oauth_refresh_token'] ),
			'oauth_email'     => isset( $opt['oauth_email'] ) ? (string) $opt['oauth_email'] : '',
			'redirect_uri'    => \nexulesuite_\Smtp_OAuth::redirect_uri(),
			'authorize_urls'  => array(
				'gmail'   => \nexulesuite_\Smtp_OAuth::authorize_url( 'gmail' ),
				'outlook' => \nexulesuite_\Smtp_OAuth::authorize_url( 'outlook' ),
			),
			'disconnect_url'  => \nexulesuite_\Smtp_OAuth::disconnect_url(),
		);
	}

	/**
	 * Sends a test email using current wp_mail configuration.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function smtp_send_test_email( \WP_REST_Request $request ) {
		$to = sanitize_email( (string) $request->get_param( 'to' ) );
		if ( ! $to || ! is_email( $to ) ) {
			return new \WP_Error( 'nexulesuite_invalid_email', 'Invalid email address.' );
		}

		$as_html = (bool) $request->get_param( 'html' );

		$site = get_bloginfo( 'name' );
		$subject = sprintf(
			/* translators: %s: site name */
			__( 'SMTP Test - %s', 'nexus-lead-suite' ),
			$site
		);
		$body = __( 'This is a test email from Nexus Lead Suite SMTP settings.', 'nexus-lead-suite' );
		if ( $as_html ) {
			$message = wpautop( esc_html( $body ) );
			$headers = array( 'Content-Type: text/html; charset=UTF-8' );
		} else {
			$message = $body;
			$headers = array( 'Content-Type: text/plain; charset=UTF-8' );
		}

		$last_mail_error = null;
		$listener        = static function ( $wp_error ) use ( &$last_mail_error ) {
			if ( $wp_error instanceof \WP_Error ) {
				$last_mail_error = $wp_error;
			}
		};
		$sent = false;
		try {
			add_action( 'wp_mail_failed', $listener, 10, 1 );
			$sent = wp_mail( array( $to ), $subject, $message, $headers );
			remove_action( 'wp_mail_failed', $listener, 10 );
		} catch ( \Throwable $e ) {
			remove_action( 'wp_mail_failed', $listener, 10 );
			$sent = false;
		}

		if ( ! $sent ) {
			$detail = '';
			if ( $last_mail_error instanceof \WP_Error ) {
				$detail = $last_mail_error->get_error_message();
			}
			return new \WP_Error( 'nexulesuite_test_failed', $detail !== '' ? $detail : 'Test email failed.' );
		}

		return rest_ensure_response(
			array(
				'success' => true,
			)
		);
	}

	/**
	 * GET: activity rows for the admin SPA or a valid client-access token.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response
	 */
	public function list_activities_report( \WP_REST_Request $request ): \WP_REST_Response {
		require_once nexulesuite_PLUGIN_DIR . 'core/class-activities-store.php';

		/*
		 * can_access_reports_rest() only proves the token is valid. A share link is also
		 * scoped to a set of sections, so re-check that this link was granted "activities"
		 * before returning any rows; otherwise a link created for summary-only access
		 * could read the full activity log.
		 */
		if ( ! current_user_can( 'manage_options' ) ) {
			$permitted = $this->permitted_report_sections( $request );
			if ( ! in_array( 'activities', $permitted, true ) ) {
				$denied = rest_ensure_response(
					array(
						'success' => false,
						'code'    => 'nexulesuite_section_forbidden',
						'message' => __( 'This link cannot view activities.', 'nexus-lead-suite' ),
					)
				);
				$denied->set_status( 403 );

				return $denied;
			}
		}

		$tab    = $this->sanitize_activity_tab( (string) $request->get_param( 'tab' ) );
		$from   = sanitize_text_field( (string) $request->get_param( 'dateFrom' ) );
		$to     = sanitize_text_field( (string) $request->get_param( 'dateTo' ) );
		$search = sanitize_text_field( (string) $request->get_param( 'search' ) );

		if ( ! preg_match( '/^\d{4}-\d{2}-\d{2}$/', $from ) ) {
			$from = '';
		}
		if ( ! preg_match( '/^\d{4}-\d{2}-\d{2}$/', $to ) ) {
			$to = '';
		}

		$db_rows = \nexulesuite_\Core\Activities_Store::fetch_report_rows( $tab, $from, $to, $search );
		$rows    = array();

		foreach ( $db_rows as $row ) {
			$rows[] = \nexulesuite_\Core\Activities_Store::map_db_row_to_activity( $row );
		}

		return rest_ensure_response(
			array(
				'success' => true,
				'data'    => array(
					'rows' => $rows,
				),
			)
		);
	}

	/**
	 * POST: clears all activities rows (admin only).
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response
	 */
	public function clear_activities_report( \WP_REST_Request $request ): \WP_REST_Response {
		require_once nexulesuite_PLUGIN_DIR . 'core/class-activities-store.php';

		$deleted = \nexulesuite_\Core\Activities_Store::clear_all();

		return rest_ensure_response(
			array(
				'success' => true,
				'data'    => array(
					'deleted' => $deleted,
				),
			)
		);
	}

	/**
	 * Normalizes activity tab query parameter.
	 *
	 * @param string $tab Raw tab.
	 * @return string
	 */
	private function sanitize_activity_tab( string $tab ): string {
		$tab = strtolower( sanitize_text_field( $tab ) );

		return in_array( $tab, array( 'all', 'forms', 'calls', 'consultations', 'interactions' ), true ) ? $tab : 'all';
	}

	/**
	 * Accepts batched behavioural events from the public tracker script (nonce + light rate limit).
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function receive_track_events( \WP_REST_Request $request ) {
		$nonce = sanitize_text_field( (string) $request->get_param( 'nonce' ) );
		$events_in = $request->get_param( 'events' );

		$json_params = $request->get_json_params();
		if ( is_array( $json_params ) ) {
			if ( '' === $nonce && isset( $json_params['nonce'] ) ) {
				$nonce = sanitize_text_field( (string) $json_params['nonce'] );
			}
			if ( ( ! is_array( $events_in ) ) && isset( $json_params['events'] ) && is_array( $json_params['events'] ) ) {
				$events_in = $json_params['events'];
			}
		}

		if ( ! is_array( $events_in ) ) {
			$raw_body = $request->get_body();
			if ( is_string( $raw_body ) && '' !== $raw_body ) {
				$decoded = json_decode( $raw_body, true );
				if ( is_array( $decoded ) ) {
					if ( '' === $nonce && isset( $decoded['nonce'] ) ) {
						$nonce = sanitize_text_field( (string) $decoded['nonce'] );
					}
					if ( isset( $decoded['events'] ) && is_array( $decoded['events'] ) ) {
						$events_in = $decoded['events'];
					}
				}
			}
		}

		if ( ! wp_verify_nonce( $nonce, 'nexulesuite_track' ) ) {
			return new \WP_Error(
				'nexulesuite_track_nonce',
				__( 'Invalid tracking nonce.', 'nexus-lead-suite' ),
				array( 'status' => 403 )
			);
		}

		if ( ! is_array( $events_in ) ) {
			return new \WP_Error(
				'nexulesuite_track_payload',
				__( 'Invalid events payload.', 'nexus-lead-suite' ),
				array( 'status' => 400 )
			);
		}

		$count = count( $events_in );
		if ( $count > 25 ) {
			return new \WP_Error(
				'nexulesuite_track_limit',
				__( 'Too many events in one request.', 'nexus-lead-suite' ),
				array( 'status' => 400 )
			);
		}

		if ( $count > 0 ) {
			$ip      = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( (string) $_SERVER['REMOTE_ADDR'] ) ) : '';
			$rl_key  = 'nexulesuite_trkrl_' . md5( $ip );
			$burst   = (int) get_transient( $rl_key );
			$allowed = 240;
			if ( $burst + $count > $allowed ) {
				return new \WP_Error(
					'nexulesuite_track_ratelimit',
					__( 'Too many tracking requests.', 'nexus-lead-suite' ),
					array( 'status' => 429 )
				);
			}
			set_transient( $rl_key, $burst + $count, MINUTE_IN_SECONDS );
		}

		require_once nexulesuite_PLUGIN_DIR . 'core/class-activities-store.php';
		require_once nexulesuite_PLUGIN_DIR . 'core/class-activity-notifier.php';

		/*
		 * Logical aggregation + dedupe
		 * - Scroll depth: only keep the highest percent from a single batch.
		 * - Any event: drop invalid payloads and prevent near-duplicate bursts when the tracker is loaded twice.
		 */
		$max_scroll_pct   = null;
		$scroll_template  = null;
		$dedupe_bucket    = (int) floor( time() / 10 ); // 10s bucket for passive events.
		$click_dedupe_bucket = (int) floor( ( microtime( true ) * 1000 ) / 800 ); // ~800ms for clicks.
		$ip_for_dedupe    = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( (string) $_SERVER['REMOTE_ADDR'] ) ) : '';
		$ua_for_dedupe    = isset( $_SERVER['HTTP_USER_AGENT'] ) ? sanitize_text_field( wp_unslash( (string) $_SERVER['HTTP_USER_AGENT'] ) ) : '';
		$click_types      = array( 'footer_click', 'click_link', 'click_phone', 'click_mailto', 'popup_open' );
		$events_sanitized = array();

		foreach ( $events_in as $ev ) {
			if ( ! is_array( $ev ) ) {
				continue;
			}

			$type = isset( $ev['type'] ) ? sanitize_key( (string) $ev['type'] ) : '';
			if ( ! in_array( $type, \nexulesuite_\Core\Activities_Store::CLIENT_TRACK_TYPES, true ) ) {
				continue;
			}

			$page = isset( $ev['page_url'] ) ? esc_url_raw( (string) $ev['page_url'] ) : '';
			$ref  = isset( $ev['referrer_url'] ) ? esc_url_raw( (string) $ev['referrer_url'] ) : '';

			$meta_raw = isset( $ev['meta'] ) && is_array( $ev['meta'] ) ? $ev['meta'] : array();
			$meta     = $this->sanitize_track_meta_flat( $meta_raw );

			$target = isset( $ev['target_key'] ) ? sanitize_text_field( (string) $ev['target_key'] ) : '';
			if ( strlen( $target ) > 191 ) {
				$target = substr( $target, 0, 191 );
			}

			if ( 'scroll_depth' === $type ) {
				$pct = isset( $meta['percent'] ) ? (int) $meta['percent'] : 0;
				$pct = max( 0, min( 100, $pct ) );
				$meta['percent'] = $pct;
				// Aggregate: keep only the highest scroll depth in this batch.
				if ( null === $max_scroll_pct || $pct > $max_scroll_pct ) {
					$max_scroll_pct  = $pct;
					$scroll_template = array(
						'type'   => $type,
						'page'   => $page,
						'ref'    => $ref,
						'meta'   => $meta,
						'target' => $target,
					);
				}
				continue;
			}

			// Auto-triggered popups must never be stored (client should not send; defense in depth).
			if ( 'popup_open' === $type ) {
				$open_source = isset( $meta['open_source'] ) ? sanitize_key( (string) $meta['open_source'] ) : '';
				if ( 'auto' === $open_source ) {
					continue;
				}
				if ( '' === $target && isset( $meta['popup_event'] ) ) {
					$target = sanitize_text_field( (string) $meta['popup_event'] );
					if ( strlen( $target ) > 191 ) {
						$target = substr( $target, 0, 191 );
					}
				}
			}

			// Basic invalid payload guard (avoid empty records).
			if ( '' === $page && '' === $target && empty( $meta ) ) {
				continue;
			}

			$is_click_type = in_array( $type, $click_types, true );
			$dedupe_slice  = $is_click_type ? $click_dedupe_bucket : $dedupe_bucket;
			$dedupe_meta   = $meta;
			if ( $is_click_type ) {
				$dedupe_meta = array(
					'label'       => isset( $meta['label'] ) ? (string) $meta['label'] : '',
					'href'        => isset( $meta['href'] ) ? (string) $meta['href'] : '',
					'popup_event' => isset( $meta['popup_event'] ) ? (string) $meta['popup_event'] : '',
					'open_source' => isset( $meta['open_source'] ) ? (string) $meta['open_source'] : '',
				);
			}

			// Near-duplicate dedupe (prevents double-init tracker bursts + multi-click).
			$dedupe_key = 'nexulesuite_evdd_' . md5( $ip_for_dedupe . '|' . $ua_for_dedupe . '|' . $type . '|' . $page . '|' . $target . '|' . wp_json_encode( $dedupe_meta ) . '|' . (string) $dedupe_slice );
			if ( get_transient( $dedupe_key ) ) {
				continue;
			}
			set_transient( $dedupe_key, 1, $is_click_type ? 2 : 30 );

			$events_sanitized[] = array(
				'type'   => $type,
				'page'   => $page,
				'ref'    => $ref,
				'meta'   => $meta,
				'target' => $target,
			);
		}

		// Add aggregated scroll depth (one row per batch).
		if ( is_array( $scroll_template ) && null !== $max_scroll_pct ) {
			$scroll_template['meta']['percent'] = (int) $max_scroll_pct;
			if ( '' === $scroll_template['target'] ) {
				$scroll_template['target'] = 'pct-' . (string) (int) $max_scroll_pct;
			}

			$dedupe_key_scroll = 'nexulesuite_evdd_' . md5( $ip_for_dedupe . '|' . $ua_for_dedupe . '|scroll_depth|' . (string) $scroll_template['page'] . '|pct:' . (string) (int) $max_scroll_pct . '|' . $dedupe_bucket );
			if ( ! get_transient( $dedupe_key_scroll ) ) {
				set_transient( $dedupe_key_scroll, 1, 30 );
				$events_sanitized[] = $scroll_template;
			}
		}

		foreach ( $events_sanitized as $sev ) {
			$etype = (string) $sev['type'];
			$emeta = is_array( $sev['meta'] ) ? $sev['meta'] : array();

			if ( \nexulesuite_\Core\Activity_Notifier::should_notify( $etype, $emeta ) ) {
				\nexulesuite_\Core\Activities_Store::record_and_notify(
					$etype,
					(string) $sev['target'],
					(string) $sev['page'],
					$emeta,
					(string) $sev['ref']
				);
				continue;
			}

			\nexulesuite_\Core\Activities_Store::record_interaction(
				$etype,
				(string) $sev['target'],
				(string) $sev['page'],
				$emeta,
				(string) $sev['ref']
			);
		}

		return rest_ensure_response(
			array(
				'success' => true,
			)
		);
	}

	/**
	 * Sanitizes a shallow meta array from the tracker (strings + numbers only).
	 *
	 * @param array<mixed,mixed> $raw Raw meta.
	 * @return array<string,int|float|string>
	 */
	private function sanitize_track_meta_flat( array $raw ): array {
		$out = array();
		foreach ( $raw as $k => $v ) {
			$key = sanitize_key( (string) $k );
			if ( '' === $key ) {
				continue;
			}
			if ( is_string( $v ) ) {
				$val       = sanitize_text_field( $v );
				$out[ $key ] = strlen( $val ) > 600 ? substr( $val, 0, 600 ) : $val;
			} elseif ( is_int( $v ) || is_float( $v ) ) {
				$out[ $key ] = $v;
			} elseif ( is_numeric( $v ) ) {
				$out[ $key ] = 0 + $v;
			}
		}

		return $out;
	}

	/**
	 * Sections this request may render.
	 *
	 * An admin gets whatever they ask for; a share link is confined to the sections it
	 * was created with, so a link that cannot see chats never renders one — even if the
	 * client edits the request body.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return string[]
	 */
	private function permitted_report_sections( \WP_REST_Request $request ): array {
		require_once nexulesuite_PLUGIN_DIR . 'core/class-report-source.php';

		$requested = \nexulesuite_\Core\Report_Source::sanitize_sections( $request->get_param( 'sections' ) );
		if ( empty( $requested ) ) {
			$requested = array( 'summary', 'activities' );
		}

		if ( current_user_can( 'manage_options' ) ) {
			return $requested;
		}

		require_once nexulesuite_PLUGIN_DIR . 'public/class-client-access.php';
		$granted = \nexulesuite_\Public\Client_Access::token_sections( (string) $request->get_param( 'token' ) );

		return array_values( array_intersect( $requested, $granted ) );
	}

	/**
	 * Generates a report PDF and returns its URL.
	 *
	 * Serves both `/reports/activities/pdf` (legacy, defaults to summary + activity) and
	 * `/reports/combined/pdf`, which may also carry form submissions and chat transcripts.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function generate_activities_pdf( \WP_REST_Request $request ) {
		require_once nexulesuite_PLUGIN_DIR . 'core/class-report-source.php';
		require_once nexulesuite_PLUGIN_DIR . 'core/class-report-pdf.php';

		try {
			$tab       = $this->sanitize_activity_tab( (string) $request->get_param( 'tab' ) );
			$date_from = sanitize_text_field( (string) $request->get_param( 'dateFrom' ) );
			$date_to   = sanitize_text_field( (string) $request->get_param( 'dateTo' ) );
			$search    = sanitize_text_field( (string) $request->get_param( 'search' ) );
			$sections  = $this->permitted_report_sections( $request );

			if ( empty( $sections ) ) {
				return new \WP_Error(
					'nexulesuite_report_forbidden',
					__( 'This link cannot export those sections.', 'nexus-lead-suite' ),
					array( 'status' => 403 )
				);
			}

			if ( ! preg_match( '/^\d{4}-\d{2}-\d{2}$/', $date_from ) ) {
				$date_from = '';
			}
			if ( ! preg_match( '/^\d{4}-\d{2}-\d{2}$/', $date_to ) ) {
				$date_to = '';
			}

			$report = \nexulesuite_\Core\Report_Source::fetch(
				array(
					'tab'      => $tab,
					'from'     => $date_from,
					'to'       => $date_to,
					'search'   => $search,
					'sections' => $sections,
					'limit'    => 5000,
				)
			);

			$logo = $this->get_report_logo_jpeg_data();
			if ( null === $logo ) {
				$logo = $this->get_site_logo_jpeg_data();
			}
			if ( is_array( $logo ) ) {
				$logo['max_display'] = $this->get_report_logo_pdf_max_display();
			}

			$pdf_bytes = \nexulesuite_\Core\Report_Pdf::build( $report, is_array( $logo ) ? $logo : array() );

			$uploads = wp_upload_dir();
			if ( empty( $uploads['basedir'] ) || empty( $uploads['baseurl'] ) ) {
				return new \WP_Error( 'nexulesuite_uploads_unavailable', 'Uploads directory unavailable.' );
			}

			$subdir   = dirname( nexulesuite_PLUGIN_BASENAME );
			$dir      = trailingslashit( (string) $uploads['basedir'] ) . $subdir;
			$url_base = trailingslashit( (string) $uploads['baseurl'] ) . $subdir;

			if ( ! file_exists( $dir ) ) {
				$made = wp_mkdir_p( $dir );
				if ( ! $made ) {
					return new \WP_Error( 'nexulesuite_uploads_mkdir_failed', 'Failed to create uploads directory.' );
				}
			}

			require_once ABSPATH . 'wp-admin/includes/file.php';
			if ( ! WP_Filesystem() ) {
				return new \WP_Error( 'nexulesuite_uploads_fs_unavailable', 'Filesystem unavailable.' );
			}

			global $wp_filesystem;
			if ( ! is_object( $wp_filesystem ) || ! $wp_filesystem->is_dir( $dir ) || ! $wp_filesystem->is_writable( $dir ) ) {
				return new \WP_Error( 'nexulesuite_uploads_not_writable', 'Uploads directory is not writable.' );
			}

			$filename = 'nexulesuite_activities-report-' . gmdate( 'Ymd-His' ) . '-' . wp_generate_password( 6, false, false ) . '.pdf';
			$path     = trailingslashit( $dir ) . $filename;
			$url      = trailingslashit( $url_base ) . $filename;

			$written = $wp_filesystem->put_contents( $path, $pdf_bytes, FS_CHMOD_FILE );
			if ( ! $written || strlen( $pdf_bytes ) < 10 ) {
				return new \WP_Error( 'nexulesuite_pdf_write_failed', 'Failed to write PDF.' );
			}

			return rest_ensure_response(
				array(
					'success' => true,
					'data'    => array(
						'pdf_url' => esc_url_raw( $url ),
					),
				)
			);
		} catch ( \Throwable $e ) {
			return new \WP_Error( 'nexulesuite_pdf_exception', 'PDF generation failed.' );
		}
	}

	/**
	 * Gets the site's logo as JPEG bytes for PDF embedding, resolved dynamically.
	 *
	 * Falls back through the images a site is most likely to have set, so the report
	 * header shows the current site's branding without any manual upload:
	 * Customizer logo (custom_logo) → Site Icon / favicon (site_icon).
	 *
	 * @return array<string,mixed>|null
	 */
	private function get_site_logo_jpeg_data() {
		$logo = $this->attachment_jpeg_data( (int) get_theme_mod( 'custom_logo' ), 'site-logo' );
		if ( null !== $logo ) {
			return $logo;
		}

		return $this->attachment_jpeg_data( (int) get_option( 'site_icon' ), 'site-icon' );
	}

	/**
	 * Reads a media attachment and returns it as JPEG bytes (converting when needed).
	 *
	 * @param int    $attachment_id Media attachment ID.
	 * @param string $slug          Slug used for the temp JPEG filename.
	 * @return array<string,mixed>|null jpeg_bytes/w/h, or null when unavailable.
	 */
	private function attachment_jpeg_data( int $attachment_id, string $slug ) {
		if ( $attachment_id <= 0 ) {
			return null;
		}

		$path = get_attached_file( $attachment_id );
		if ( ! $path || ! file_exists( $path ) ) {
			return null;
		}

		$info = @getimagesize( $path );
		if ( ! is_array( $info ) || empty( $info['mime'] ) ) {
			return null;
		}

		$mime = (string) $info['mime'];
		$w    = isset( $info[0] ) ? (int) $info[0] : 0;
		$h    = isset( $info[1] ) ? (int) $info[1] : 0;

		// If already JPEG, read as-is.
		if ( 'image/jpeg' === $mime ) {
			$bytes = file_get_contents( $path );
			if ( false === $bytes ) {
				return null;
			}
			return array(
				'jpeg_bytes' => $bytes,
				'w'          => $w,
				'h'          => $h,
			);
		}

		// Convert to JPEG via WP image editor (handles PNG/WebP/etc depending on server support).
		$editor = wp_get_image_editor( $path );
		if ( is_wp_error( $editor ) ) {
			return null;
		}

		$uploads = wp_upload_dir();
		if ( empty( $uploads['path'] ) ) {
			return null;
		}

		$tmp = trailingslashit( $uploads['path'] ) . 'nexulesuite_' . $slug . '-' . wp_generate_password( 6, false, false ) . '.jpg';
		$saved = $editor->save( $tmp, 'image/jpeg' );
		if ( is_wp_error( $saved ) || empty( $saved['path'] ) ) {
			return null;
		}

		$tmp_path = (string) $saved['path'];
		$bytes    = file_get_contents( $tmp_path );
		if ( false === $bytes ) {
			return null;
		}

		$w = isset( $saved['width'] ) ? (int) $saved['width'] : $w;
		$h = isset( $saved['height'] ) ? (int) $saved['height'] : $h;

		return array(
			'jpeg_bytes' => $bytes,
			'w'          => max( 1, $w ),
			'h'          => max( 1, $h ),
		);
	}

	/**
	 * Max bounding-box side (100–1000) for the report/PDF header logo.
	 *
	 * @return int
	 */
	private function get_report_logo_pdf_max_display(): int {
		$opt = get_option( self::GENERAL_SETTINGS_OPTION_KEY, array() );
		if ( ! is_array( $opt ) || ! isset( $opt['reportLogoPdfMax'] ) ) {
			return 400;
		}

		return max( 100, min( 1000, (int) $opt['reportLogoPdfMax'] ) );
	}

	/**
	 * Gets Report Logo (from settings.reportLogo) as JPEG bytes for PDF embedding.
	 * Only allows files inside the WordPress uploads directory (prevents SSRF / arbitrary file read).
	 *
	 * @return array<string,mixed>|null
	 */
	private function get_report_logo_jpeg_data() {
		$opt = get_option( self::GENERAL_SETTINGS_OPTION_KEY, array() );
		if ( ! is_array( $opt ) ) {
			return null;
		}
		$url = isset( $opt['reportLogo'] ) ? esc_url_raw( (string) $opt['reportLogo'] ) : '';
		if ( '' === $url ) {
			return null;
		}

		$uploads = wp_upload_dir();
		if ( empty( $uploads['baseurl'] ) || empty( $uploads['basedir'] ) ) {
			return null;
		}

		$baseurl = trailingslashit( (string) $uploads['baseurl'] );
		$basedir = trailingslashit( (string) $uploads['basedir'] );

		if ( strpos( $url, $baseurl ) !== 0 ) {
			return null;
		}

		$rel  = ltrim( substr( $url, strlen( $baseurl ) ), '/' );
		$path = $basedir . $rel;
		if ( ! $path || ! file_exists( $path ) ) {
			return null;
		}

		$info = @getimagesize( $path );
		if ( ! is_array( $info ) || empty( $info['mime'] ) ) {
			return null;
		}

		$mime = (string) $info['mime'];
		$w    = isset( $info[0] ) ? (int) $info[0] : 0;
		$h    = isset( $info[1] ) ? (int) $info[1] : 0;

		if ( 'image/jpeg' === $mime ) {
			$bytes = file_get_contents( $path );
			if ( false === $bytes ) {
				return null;
			}
			return array(
				'jpeg_bytes' => $bytes,
				'w'          => $w,
				'h'          => $h,
			);
		}

		$editor = wp_get_image_editor( $path );
		if ( is_wp_error( $editor ) ) {
			return null;
		}

		if ( empty( $uploads['path'] ) ) {
			return null;
		}

		$tmp = trailingslashit( (string) $uploads['path'] ) . 'nexulesuite_report-logo-' . wp_generate_password( 6, false, false ) . '.jpg';
		$saved = $editor->save( $tmp, 'image/jpeg' );
		if ( is_wp_error( $saved ) || empty( $saved['path'] ) ) {
			return null;
		}

		$tmp_path = (string) $saved['path'];
		$bytes    = file_get_contents( $tmp_path );
		if ( false === $bytes ) {
			return null;
		}

		$w = isset( $saved['width'] ) ? (int) $saved['width'] : $w;
		$h = isset( $saved['height'] ) ? (int) $saved['height'] : $h;

		return array(
			'jpeg_bytes' => $bytes,
			'w'          => max( 1, $w ),
			'h'          => max( 1, $h ),
		);
	}

	/**
	 * Sends an Activities report email with PDF attachment.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function send_activities_email( \WP_REST_Request $request ) {
		$recipients = $request->get_param( 'recipients' );
		if ( ! is_array( $recipients ) ) {
			$recipients = array();
		}

		$clean_recipients = array();
		foreach ( $recipients as $email ) {
			$email = sanitize_email( (string) $email );
			if ( $email && is_email( $email ) ) {
				$clean_recipients[] = $email;
			}
		}
		$clean_recipients = array_values( array_unique( $clean_recipients ) );

		if ( empty( $clean_recipients ) ) {
			return new \WP_Error( 'nexulesuite_no_recipients', 'No valid recipients provided.' );
		}

		// Generate PDF using the same logic.
		$pdf_response = $this->generate_activities_pdf( $request );
		if ( is_wp_error( $pdf_response ) ) {
			return $pdf_response;
		}

		$data = $pdf_response->get_data();
		$pdf_url = isset( $data['data']['pdf_url'] ) ? (string) $data['data']['pdf_url'] : '';
		if ( '' === $pdf_url ) {
			return new \WP_Error( 'nexulesuite_pdf_missing', 'PDF URL missing.' );
		}

		$uploads = wp_upload_dir();
		$baseurl = isset( $uploads['baseurl'] ) ? (string) $uploads['baseurl'] : '';
		$basedir = isset( $uploads['basedir'] ) ? (string) $uploads['basedir'] : '';

		if ( '' === $baseurl || '' === $basedir ) {
			return new \WP_Error( 'nexulesuite_uploads_unavailable', 'Uploads directory unavailable.' );
		}

		$pdf_path = str_replace( $baseurl, $basedir, $pdf_url );
		$pdf_path = wp_normalize_path( $pdf_path );
		if ( ! file_exists( $pdf_path ) ) {
			return new \WP_Error( 'nexulesuite_pdf_not_found', 'PDF file not found.' );
		}

		$custom_message = (string) $request->get_param( 'customMessage' );
		$custom_message = sanitize_textarea_field( $custom_message );

		$site = get_bloginfo( 'name' );
		$subject = sprintf(
			/* translators: %s: site name */
			__( 'Activities Report - %s', 'nexus-lead-suite' ),
			$site
		);

		$message  = '';
		if ( '' !== $custom_message ) {
			$message .= wpautop( esc_html( $custom_message ) );
			$message .= "<hr />\n";
		}

		$message .= wpautop(
			sprintf(
				/* translators: %s: site name */
				esc_html__( 'Attached is the Activities Report for %s.', 'nexus-lead-suite' ),
				$site
			)
		);

		$headers = array( 'Content-Type: text/html; charset=UTF-8' );
		// Do not set From: here — it overrides SMTP envelope (Gmail etc.) and breaks delivery.
		$reply = sanitize_email( (string) get_bloginfo( 'admin_email' ) );
		if ( $reply && is_email( $reply ) ) {
			$headers[] = 'Reply-To: ' . $reply;
		}

		$last_mail_error = null;
		$listener        = static function ( $wp_error ) use ( &$last_mail_error ) {
			if ( $wp_error instanceof \WP_Error ) {
				$last_mail_error = $wp_error;
			}
		};
		$sent = false;
		try {
			add_action( 'wp_mail_failed', $listener, 10, 1 );
			$sent = wp_mail( $clean_recipients, $subject, $message, $headers, array( $pdf_path ) );
			remove_action( 'wp_mail_failed', $listener, 10 );
		} catch ( \Throwable $e ) {
			remove_action( 'wp_mail_failed', $listener, 10 );
			$sent = false;
		}
		if ( ! $sent ) {
			$detail = '';
			if ( $last_mail_error instanceof \WP_Error ) {
				$detail = $last_mail_error->get_error_message();
			}
			return new \WP_Error(
				'nexulesuite_mail_failed',
				$detail !== '' ? $detail : 'Email sending failed.'
			);
		}

		return rest_ensure_response(
			array(
				'success' => true,
				'data'    => array(
					'pdf_url'     => esc_url_raw( $pdf_url ),
					'recipients'  => $clean_recipients,
				),
			)
		);
	}
}
