<?php
/**
 * REST API bootstrap (routes registered here in future milestones).
 *
 * @package Nexus_Lead_Suite
 */

declare(strict_types=1);

namespace Nexus_Lead_Suite\Api;

use Nexus_Lead_Suite\Data_Bundle;
use Nexus_Lead_Suite\Forms_Payload_Codec;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers REST API integration.
 *
 * Loaded from {@see \Nexus_Lead_Suite\Plugin::bootstrap_rest_api()} on {@see 'rest_api_init'} (priority 0)
 * so this file is not parsed on ordinary frontend page views.
 */
final class Rest_Api {
	/**
	 * Forms option key (base64 + rawurlencode JSON).
	 */
	private const FORMS_OPTION_KEY = 'nexus_ls_forms_builder_v0';
	private const RECAPTCHA_OPTION_KEY = 'nexus_ls_recaptcha_keys_v0';
	private const TURNSTILE_OPTION_KEY = 'nexus_ls_turnstile_keys_v0';
	private const MENU_ITEMS_OPTION_KEY = 'nexus_ls_menu_items_v1';
	private const POPUPS_OPTION_KEY = 'nexus_ls_popups_v1';
	private const EMAIL_TEMPLATES_OPTION_KEY = 'nexus_ls_email_templates_v1';
	private const GENERAL_SETTINGS_OPTION_KEY = 'nexus_ls_general_settings_v1';

	/**
	 * Post meta: Visual Editor DOM patches when markup is not in post_content (theme/header/builders).
	 */
	private const VE_DOM_PATCHES_META_KEY = '_nexus_ls_ve_dom_patches';

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
			'nexus-lead-suite/v1',
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
			'nexus-lead-suite/v1',
			'/settings/general',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_general_settings' ),
				'permission_callback' => array( $this, 'can_manage_settings' ),
			)
		);

		register_rest_route(
			'nexus-lead-suite/v1',
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
			'nexus-lead-suite/v1',
			'/form-submissions',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_form_submissions' ),
				'permission_callback' => array( $this, 'can_manage_settings' ),
			)
		);

		register_rest_route(
			'nexus-lead-suite/v1',
			'/settings/upload-chat-image',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'upload_livechat_avatar' ),
				'permission_callback' => array( $this, 'can_manage_settings' ),
			)
		);

		register_rest_route(
			'nexus-lead-suite/v1',
			'/settings/upload-report-logo',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'upload_report_logo' ),
				'permission_callback' => array( $this, 'can_manage_settings' ),
			)
		);

		register_rest_route(
			'nexus-lead-suite/v1',
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
			'nexus-lead-suite/v1',
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
			'nexus-lead-suite/v1',
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
			'nexus-lead-suite/v1',
			'/captcha/recaptcha',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_recaptcha_keys' ),
				'permission_callback' => array( $this, 'can_manage_settings' ),
			)
		);

		register_rest_route(
			'nexus-lead-suite/v1',
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
			'nexus-lead-suite/v1',
			'/captcha/turnstile',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_turnstile_keys' ),
				'permission_callback' => array( $this, 'can_manage_settings' ),
			)
		);

		register_rest_route(
			'nexus-lead-suite/v1',
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
			'nexus-lead-suite/v1',
			'/forms',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_forms' ),
				'permission_callback' => array( $this, 'can_manage_settings' ),
			)
		);

		register_rest_route(
			'nexus-lead-suite/v1',
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
			'nexus-lead-suite/v1',
			'/smtp/settings',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_smtp_settings' ),
				'permission_callback' => array( $this, 'can_manage_settings' ),
			)
		);

		register_rest_route(
			'nexus-lead-suite/v1',
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
			'nexus-lead-suite/v1',
			'/smtp/test',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'smtp_send_test_email' ),
				'permission_callback' => array( $this, 'can_manage_settings' ),
				'args'                => array(
					'to' => array(
						'type'              => 'string',
						'required'          => true,
						'sanitize_callback' => 'sanitize_email',
					),
				),
			)
		);

		register_rest_route(
			'nexus-lead-suite/v1',
			'/emails/templates',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_email_templates' ),
				'permission_callback' => array( $this, 'can_manage_settings' ),
			)
		);

		register_rest_route(
			'nexus-lead-suite/v1',
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
			'nexus-lead-suite/v1',
			'/menu-items',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_menu_items' ),
				'permission_callback' => array( $this, 'can_manage_settings' ),
			)
		);

		register_rest_route(
			'nexus-lead-suite/v1',
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
			'nexus-lead-suite/v1',
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
			'nexus-lead-suite/v1',
			'/menu-items/condition-meta',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_menu_condition_meta' ),
				'permission_callback' => array( $this, 'can_manage_settings' ),
			)
		);

		register_rest_route(
			'nexus-lead-suite/v1',
			'/popups',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_popups' ),
				'permission_callback' => array( $this, 'can_manage_settings' ),
			)
		);

		register_rest_route(
			'nexus-lead-suite/v1',
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
			'nexus-lead-suite/v1',
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
			'nexus-lead-suite/v1',
			'/reports/activities/clear',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'clear_activities_report' ),
				'permission_callback' => array( $this, 'can_manage_settings' ),
			)
		);

		register_rest_route(
			'nexus-lead-suite/v1',
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
				),
			)
		);

		register_rest_route(
			'nexus-lead-suite/v1',
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
			'nexus-lead-suite/v1',
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

		register_rest_route(
			'nexus-lead-suite/v1',
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
			'nexus-lead-suite/v1',
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

		$name    = 'nexus_ls_ve';
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
		$rid    = 'nexus-ls-ve-' . preg_replace( '/[^a-z0-9]/i', '', (string) wp_generate_password( 10, false, false ) );
		if ( '' === $rid ) {
			$rid = 'nexus-ls-ve-root';
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
			return new \WP_Error( 'nexus_ls_ve_bad_post', 'Invalid postId.', array( 'status' => 400 ) );
		}

		$post = get_post( $post_id );
		if ( ! $post || ! isset( $post->post_content ) ) {
			return new \WP_Error( 'nexus_ls_ve_missing_post', 'Post not found.', array( 'status' => 404 ) );
		}

		$original_html = (string) $request->get_param( 'originalHtml' );
		$original_html = trim( $original_html );
		if ( '' === $original_html ) {
			return new \WP_Error( 'nexus_ls_ve_bad_html', 'Missing originalHtml.', array( 'status' => 400 ) );
		}

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
			return new \WP_Error( 'nexus_ls_ve_empty', 'Post content is empty and no selector was provided.', array( 'status' => 400 ) );
		}

		$libxml_prev = libxml_use_internal_errors( true );
		$found       = null;
		$doc         = null;
		$xpath       = null;
		$root        = null;

		if ( $has_content ) {
			$doc = new \DOMDocument();
			$wrapper_id = 'nexus-ls-ve-wrapper';
			$html       = '<!doctype html><html><head><meta charset="utf-8"></head><body><div id="' . esc_attr( $wrapper_id ) . '">' . $content . '</div></body></html>';

			$loaded = $doc->loadHTML( $html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD );
			if ( false === $loaded ) {
				libxml_clear_errors();
				libxml_use_internal_errors( $libxml_prev );
				return new \WP_Error( 'nexus_ls_ve_parse_failed', 'Failed to parse HTML.', array( 'status' => 500 ) );
			}

			$xpath = new \DOMXPath( $doc );
			$root  = $xpath->query( '//*[@id="' . $wrapper_id . '"]' );
			$root  = ( $root instanceof \DOMNodeList && $root->length > 0 ) ? $root->item( 0 ) : null;
			if ( ! ( $root instanceof \DOMElement ) ) {
				libxml_clear_errors();
				libxml_use_internal_errors( $libxml_prev );
				return new \WP_Error( 'nexus_ls_ve_root_missing', 'Root wrapper missing.', array( 'status' => 500 ) );
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
				'nexus_ls_ve_not_found',
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
			'formFieldBorderWidth'  => 2,
			'formFieldBorderRadius' => 10,
			'submissionWebhookUrl'  => '',
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
		$merged['formFieldBorderWidth']  = max( 0, min( 10, (int) ( $merged['formFieldBorderWidth'] ?? 2 ) ) );
		$merged['formFieldBorderRadius'] = max( 0, min( 30, (int) ( $merged['formFieldBorderRadius'] ?? 10 ) ) );
		unset( $merged['chatHeaderTagline'], $merged['popupShowDuration'], $merged['popupDisappearTime'] );

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
	 * Recent stored form submissions (short retention table). For export / debugging.
	 *
	 * @return \WP_REST_Response
	 */
	public function get_form_submissions(): \WP_REST_Response {
		global $wpdb;

		$table = \Nexus_Lead_Suite\Core\Form_Submissions_Store::table();

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching,WordPress.DB.PreparedSQL.NotPrepared,PluginCheck.Security.DirectDB.UnescapedDBParameter -- table name from trusted prefix; admin-only REST endpoint.
		$rows = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT id, form_key, status, payload, created_at FROM {$table} ORDER BY id DESC LIMIT %d",
				500
			),
			ARRAY_A
		);
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching,WordPress.DB.PreparedSQL.NotPrepared,PluginCheck.Security.DirectDB.UnescapedDBParameter

		$out = array();
		foreach ( is_array( $rows ) ? $rows : array() as $row ) {
			$decoded = json_decode( (string) ( $row['payload'] ?? '' ), true );
			$out[]   = array(
				'id'        => (int) ( $row['id'] ?? 0 ),
				'formKey'   => (string) ( $row['form_key'] ?? '' ),
				'status'    => (string) ( $row['status'] ?? '' ),
				'createdAt' => (string) ( $row['created_at'] ?? '' ),
				'payload'   => is_array( $decoded ) ? $decoded : array(),
			);
		}

		return rest_ensure_response(
			array(
				'success' => true,
				'data'    => array(
					'items' => $out,
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
			return new \WP_Error( 'nexus_ls_invalid_settings', 'Invalid settings payload.' );
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
		$form_border_width  = max( 0, min( 10, (int) ( $input['formFieldBorderWidth'] ?? 2 ) ) );
		$form_border_radius = max( 0, min( 30, (int) ( $input['formFieldBorderRadius'] ?? 10 ) ) );

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
			'enableLivechat'        => ! empty( $input['enableLivechat'] ),
			'chatButtonImage'       => $this->sanitize_chat_button_image( (string) ( $input['chatButtonImage'] ?? '' ) ),
			'chatTitle'             => sanitize_text_field( (string) ( $input['chatTitle'] ?? 'Customer Support' ) ),
			'chatBadge'             => sanitize_text_field( (string) ( $input['chatBadge'] ?? 'Online' ) ),
			'chatContent'           => sanitize_textarea_field( (string) ( $input['chatContent'] ?? '' ) ),
			'chatFormButton'        => sanitize_text_field( (string) ( $input['chatFormButton'] ?? '' ) ),
			'chatFormButtonLink'    => sanitize_text_field( (string) ( $input['chatFormButtonLink'] ?? '' ) ),
			'chatButtonTwo'         => sanitize_text_field( (string) ( $input['chatButtonTwo'] ?? '' ) ),
			'chatButtonTwoLink'     => esc_url_raw( (string) ( $input['chatButtonTwoLink'] ?? '' ) ),
			'chatButtonThird'       => sanitize_text_field( (string) ( $input['chatButtonThird'] ?? '' ) ),
			'chatButtonThirdLink'   => sanitize_text_field( (string) ( $input['chatButtonThirdLink'] ?? '' ) ),
			'chatAlign'             => $chat_align,
			'chatPadding'           => (string) $chat_padding,
			'chatBorderRadius'      => (string) $chat_radius,
			'primaryBtnBg'          => $primary_bg,
			'primaryBtnText'        => $primary_text,
			'chatBubbleBg'          => $chat_bubble_bg,
			'chatOnlineDotColor'    => $chat_online_dot,
			'chatHoverEffect'       => $chat_hover,
			'reportLogo'            => esc_url_raw( (string) ( $input['reportLogo'] ?? '' ) ),
			'reportLogoPdfMax'      => max( 100, min( 1000, (int) ( $input['reportLogoPdfMax'] ?? 400 ) ) ),
			'clientAccessSlug'      => $slug_raw,
			'formFieldTextColor'    => $form_field_text,
			'formPlaceholderColor'  => $form_placeholder,
			'formFieldBorderColor'  => $form_border_color,
			'formFieldBorderStyle'  => $form_border_style,
			'formFieldBorderWidth'  => (int) $form_border_width,
			'formFieldBorderRadius' => (int) $form_border_radius,
			'submissionWebhookUrl'  => $submission_webhook,
		);

		update_option( self::GENERAL_SETTINGS_OPTION_KEY, $clean, false );

		$prev_slug = isset( $prev['clientAccessSlug'] ) ? sanitize_title( (string) $prev['clientAccessSlug'] ) : '';
		if ( '' === $prev_slug ) {
			$prev_slug = 'report-access';
		}
		$need_rewrite_flush = ( $prev_slug !== $slug_raw )
			|| ( ! empty( $prev['allowClientAccess'] ) !== ! empty( $clean['allowClientAccess'] ) );

		if ( $need_rewrite_flush ) {
			require_once NEXUS_LS_PLUGIN_DIR . 'public/class-client-access.php';
			\Nexus_Lead_Suite\Public\Client_Access::sync_rewrite_rules();
			flush_rewrite_rules( false );
		}

		return rest_ensure_response(
			array(
				'success' => true,
				'data'    => array(
					'settings' => $clean,
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
		require_once NEXUS_LS_PLUGIN_DIR . 'public/class-client-access.php';

		$saved = get_option( self::GENERAL_SETTINGS_OPTION_KEY, array() );
		if ( ! is_array( $saved ) || empty( $saved['allowClientAccess'] ) ) {
			return new \WP_Error(
				'nexus_ls_client_access_off',
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
		\Nexus_Lead_Suite\Public\Client_Access::store_token( $token, MINUTE_IN_SECONDS * $ttl_min );

		return rest_ensure_response(
			array(
				'success' => true,
				'data'    => array(
					'url'              => \Nexus_Lead_Suite\Public\Client_Access::build_access_url( $token ),
					'expiresInMinutes' => $ttl_min,
				),
			)
		);
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
					'nexus_ls_export_encode',
					__( 'Could not serialize the export. Try embed_media=0 or reduce data in form/email HTML fields.', 'nexus-lead-suite' ) . ' ' . ( defined( 'WP_DEBUG' ) && WP_DEBUG ? $json_err->getMessage() : '' ),
					array( 'status' => 500 )
				);
			}
			if ( false === $check ) {
				return new \WP_Error(
					'nexus_ls_export_encode',
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
				'nexus_ls_export_failed',
				$msg,
				array( 'status' => 500 )
			);
		}
	}

	/**
	 * Full site replace: all tracked options, extra plugin options from the file, and custom tables
	 * are overwritten; any previous `nexus_ls*` extra options not in the export are removed.
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
				'nexus_ls_import_invalid',
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
				'nexus_ls_import_failed',
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
				'nexus_ls_no_file',
				__( 'No valid image upload received.', 'nexus-lead-suite' ),
				array( 'status' => 400 )
			);
		}

		if ( ! empty( $file['error'] ) ) {
			return new \WP_Error(
				'nexus_ls_upload_err',
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
				'nexus_ls_file_large',
				__( 'Image must be 3 MB or smaller.', 'nexus-lead-suite' ),
				array( 'status' => 400 )
			);
		}

		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/image.php';

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
				'nexus_ls_upload_failed',
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
				'nexus_ls_bad_type',
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
				'nexus_ls_attachment_failed',
				__( 'Could not save attachment.', 'nexus-lead-suite' ),
				array( 'status' => 500 )
			);
		}

		$relative = _wp_relative_upload_path( $upload['file'] );
		if ( ! is_string( $relative ) || '' === $relative ) {
			wp_delete_attachment( $attach_id, true );
			return new \WP_Error(
				'nexus_ls_path_failed',
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
				'nexus_ls_url_failed',
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
		require_once NEXUS_LS_PLUGIN_DIR . 'core/class-menu-items-payload.php';

		$stored     = get_option( self::MENU_ITEMS_OPTION_KEY, array() );
		$normalized = \Nexus_Lead_Suite\Core\Menu_Items_Payload::normalize_stored( $stored );

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
			return new \WP_Error( 'nexus_ls_invalid_popups', 'Invalid popups payload.' );
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
		require_once NEXUS_LS_PLUGIN_DIR . 'core/class-menu-items-payload.php';

		$groups_in = $request->get_param( 'groups' );
		$items_in  = $request->get_param( 'items' );

		if ( is_array( $groups_in ) ) {
			$clean_groups = $this->sanitize_menu_groups( $groups_in );
		} elseif ( is_array( $items_in ) ) {
			$clean_groups = array(
				\Nexus_Lead_Suite\Core\Menu_Items_Payload::build_default_group(
					$this->sanitize_menu_items( $items_in )
				),
			);
		} else {
			return new \WP_Error( 'nexus_ls_invalid_menu_items', 'Invalid menu items payload.' );
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
		$allowed_types = array( 'all', 'homepage', 'page', 'post', 'post_type', 'category', 'tag' );
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
				'content'         => wp_kses_post( $content ),
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

		require_once NEXUS_LS_PLUGIN_DIR . 'public/class-client-access.php';

		$saved = get_option( self::GENERAL_SETTINGS_OPTION_KEY, array() );
		if ( ! is_array( $saved ) || empty( $saved['allowClientAccess'] ) ) {
			return false;
		}

		$token = sanitize_text_field( (string) $request->get_param( 'token' ) );

		return \Nexus_Lead_Suite\Public\Client_Access::is_token_valid( $token );
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

		$data = \Nexus_Lead_Suite\build_popup_preview_payload( $raw );

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
		if ( ! \Nexus_Lead_Suite\Core\Access_Gate::is_unlocked() ) {
			return false;
		}
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
			return new \WP_Error( 'nexus_ls_invalid_forms', 'Invalid forms payload.' );
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

			$notification_email_raw = isset( $form['notificationEmail'] ) ? sanitize_text_field( (string) $form['notificationEmail'] ) : '';

			$crm_webhook = isset( $form['crmWebhookUrl'] ) ? $this->sanitize_integration_webhook_url( (string) $form['crmWebhookUrl'] ) : '';

			$published = true;
			if ( array_key_exists( 'published', $form ) ) {
				$published = (bool) $form['published'];
			}

			$styling_in = isset( $form['styling'] ) && is_array( $form['styling'] ) ? $form['styling'] : array();
			$fi_design = sanitize_text_field( (string) ( $styling_in['forminatorDesign'] ?? 'default' ) );
			if ( ! in_array( $fi_design, array( 'default', 'flat', 'bold', 'material' ), true ) ) {
				$fi_design = 'default';
			}
			$fi_theme = sanitize_text_field( (string) ( $styling_in['forminatorTheme'] ?? 'default' ) );
			if ( ! in_array( $fi_theme, array( 'default', 'dark', 'light' ), true ) ) {
				$fi_theme = 'default';
			}

			$styling_out = array(
				'backgroundColor'    => sanitize_hex_color( (string) ( $styling_in['backgroundColor'] ?? '#ffffff' ) ) ?: '#ffffff',
				'textColor'          => sanitize_hex_color( (string) ( $styling_in['textColor'] ?? '#1e293b' ) ) ?: '#1e293b',
				'buttonColor'        => sanitize_hex_color( (string) ( $styling_in['buttonColor'] ?? '#7c3aed' ) ) ?: '#7c3aed',
				'stepperColor'       => sanitize_hex_color( (string) ( $styling_in['stepperColor'] ?? '#7c3aed' ) ) ?: '#7c3aed',
				'forminatorDesign'   => $fi_design,
				'forminatorTheme'    => $fi_theme,
			);

			$custom_html_in = isset( $form['customHTML'] ) && is_array( $form['customHTML'] ) ? $form['customHTML'] : array();
			$custom_html_out = array(
				'header' => wp_kses_post( (string) ( $custom_html_in['header'] ?? '' ) ),
				'footer' => wp_kses_post( (string) ( $custom_html_in['footer'] ?? '' ) ),
			);

			$custom_css_out = isset( $form['customCSS'] ) ? sanitize_textarea_field( (string) $form['customCSS'] ) : '';
			$terms_out      = isset( $form['termsConditionText'] ) ? sanitize_textarea_field( (string) $form['termsConditionText'] ) : '';

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

			$out_forms[] = array(
				'id'                => $id !== '' ? $id : 'form-' . ( count( $out_forms ) + 1 ),
				'name'              => $name,
				'formType'          => $form_type,
				'published'         => $published,
				'submitBtnText'     => $submit_btn_text,
				'notificationEmail' => $notification_email_raw,
				'crmWebhookUrl'     => $crm_webhook,
				'styling'           => $styling_out,
				'customHTML'        => $custom_html_out,
				'customCSS'         => $custom_css_out,
				'termsConditionText'=> $terms_out,
				'steps'             => $steps_out,
			);
		}

		return array(
			'forms' => $out_forms,
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
			'borderColor'     => sanitize_hex_color( (string) ( $settings['borderColor'] ?? '#d1d5db' ) ) ?: '#d1d5db',
			'borderRadius'    => max( 0, (int) ( $settings['borderRadius'] ?? 6 ) ),
			'borderWidth'     => max( 0, (int) ( $settings['borderWidth'] ?? 1 ) ),
			'padding'         => max( 0, (int) ( $settings['padding'] ?? 12 ) ),
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
			$templates = get_option( 'nexus_ls_email_templates', array() );
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
		$opt = get_option( \Nexus_Lead_Suite\Mailer::OPTION_KEY, array() );
		if ( ! is_array( $opt ) ) {
			$opt = array();
		}
		unset( $opt['password'] );

		return rest_ensure_response(
			array(
				'success' => true,
				'data'    => array(
					'settings' => $opt,
				),
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
		require_once NEXUS_LS_PLUGIN_DIR . 'core/class-mailer.php';

		$settings = $request->get_param( 'settings' );
		if ( ! is_array( $settings ) ) {
			return new \WP_Error( 'nexus_ls_invalid_smtp', 'Invalid SMTP settings.' );
		}

		$prev = get_option( \Nexus_Lead_Suite\Mailer::OPTION_KEY, array() );
		$prev = is_array( $prev ) ? $prev : array();
		$prev_pass = isset( $prev['password'] ) ? (string) $prev['password'] : '';
		$new_pass  = isset( $settings['password'] ) ? (string) $settings['password'] : '';

		$clean = array(
			'enabled'    => ! empty( $settings['enabled'] ),
			'host'       => sanitize_text_field( (string) ( $settings['host'] ?? '' ) ),
			'port'       => (int) ( $settings['port'] ?? 587 ),
			'secure'     => sanitize_text_field( (string) ( $settings['secure'] ?? 'tls' ) ),
			'username'   => sanitize_text_field( (string) ( $settings['username'] ?? '' ) ),
			// Empty password in payload keeps the stored password (admin UI often omits it on save).
			'password'   => '' !== $new_pass ? $new_pass : $prev_pass,
			'from_email' => sanitize_email( (string) ( $settings['from_email'] ?? '' ) ),
			'from_name'  => sanitize_text_field( (string) ( $settings['from_name'] ?? '' ) ),
		);

		if ( $clean['port'] <= 0 || $clean['port'] > 65535 ) {
			$clean['port'] = 587;
		}

		$allowed_secure = array( '', 'tls', 'ssl' );
		if ( ! in_array( $clean['secure'], $allowed_secure, true ) ) {
			$clean['secure'] = 'tls';
		}

		update_option( \Nexus_Lead_Suite\Mailer::OPTION_KEY, $clean, false );

		$return = $clean;
		unset( $return['password'] );

		return rest_ensure_response(
			array(
				'success' => true,
				'data'    => array(
					'settings' => $return,
				),
			)
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
			return new \WP_Error( 'nexus_ls_invalid_email', 'Invalid email address.' );
		}

		$site = get_bloginfo( 'name' );
		$subject = sprintf(
			/* translators: %s: site name */
			__( 'SMTP Test - %s', 'nexus-lead-suite' ),
			$site
		);
		$message = wpautop( esc_html__( 'This is a test email from Nexus Lead Suite SMTP settings.', 'nexus-lead-suite' ) );
		$headers = array( 'Content-Type: text/html; charset=UTF-8' );

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
			return new \WP_Error( 'nexus_ls_test_failed', $detail !== '' ? $detail : 'Test email failed.' );
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
		require_once NEXUS_LS_PLUGIN_DIR . 'core/class-activities-store.php';

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

		$db_rows = \Nexus_Lead_Suite\Core\Activities_Store::fetch_report_rows( $tab, $from, $to, $search );
		$rows    = array();

		foreach ( $db_rows as $row ) {
			$rows[] = \Nexus_Lead_Suite\Core\Activities_Store::map_db_row_to_activity( $row );
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
		require_once NEXUS_LS_PLUGIN_DIR . 'core/class-activities-store.php';

		$deleted = \Nexus_Lead_Suite\Core\Activities_Store::clear_all();

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

		if ( ! wp_verify_nonce( $nonce, 'nexus_ls_track' ) ) {
			return new \WP_Error(
				'nexus_ls_track_nonce',
				__( 'Invalid tracking nonce.', 'nexus-lead-suite' ),
				array( 'status' => 403 )
			);
		}

		if ( ! is_array( $events_in ) ) {
			return new \WP_Error(
				'nexus_ls_track_payload',
				__( 'Invalid events payload.', 'nexus-lead-suite' ),
				array( 'status' => 400 )
			);
		}

		$count = count( $events_in );
		if ( $count > 25 ) {
			return new \WP_Error(
				'nexus_ls_track_limit',
				__( 'Too many events in one request.', 'nexus-lead-suite' ),
				array( 'status' => 400 )
			);
		}

		if ( $count > 0 ) {
			$ip      = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( (string) $_SERVER['REMOTE_ADDR'] ) ) : '';
			$rl_key  = 'nexus_ls_trkrl_' . md5( $ip );
			$burst   = (int) get_transient( $rl_key );
			$allowed = 240;
			if ( $burst + $count > $allowed ) {
				return new \WP_Error(
					'nexus_ls_track_ratelimit',
					__( 'Too many tracking requests.', 'nexus-lead-suite' ),
					array( 'status' => 429 )
				);
			}
			set_transient( $rl_key, $burst + $count, MINUTE_IN_SECONDS );
		}

		require_once NEXUS_LS_PLUGIN_DIR . 'core/class-activities-store.php';

		/*
		 * Logical aggregation + dedupe
		 * - Scroll depth: only keep the highest percent from a single batch.
		 * - Any event: drop invalid payloads and prevent near-duplicate bursts when the tracker is loaded twice.
		 */
		$max_scroll_pct   = null;
		$scroll_template  = null;
		$dedupe_bucket    = (int) floor( time() / 10 ); // 10s bucket
		$ip_for_dedupe    = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( (string) $_SERVER['REMOTE_ADDR'] ) ) : '';
		$ua_for_dedupe    = isset( $_SERVER['HTTP_USER_AGENT'] ) ? sanitize_text_field( wp_unslash( (string) $_SERVER['HTTP_USER_AGENT'] ) ) : '';
		$events_sanitized = array();

		foreach ( $events_in as $ev ) {
			if ( ! is_array( $ev ) ) {
				continue;
			}

			$type = isset( $ev['type'] ) ? sanitize_key( (string) $ev['type'] ) : '';
			if ( ! in_array( $type, \Nexus_Lead_Suite\Core\Activities_Store::CLIENT_TRACK_TYPES, true ) ) {
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

			// Basic invalid payload guard (avoid empty records).
			if ( '' === $page && '' === $target && empty( $meta ) ) {
				continue;
			}

			// Near-duplicate dedupe (prevents double-init tracker bursts).
			$dedupe_key = 'nexus_ls_evdd_' . md5( $ip_for_dedupe . '|' . $ua_for_dedupe . '|' . $type . '|' . $page . '|' . wp_json_encode( $meta ) . '|' . $dedupe_bucket );
			if ( get_transient( $dedupe_key ) ) {
				continue;
			}
			set_transient( $dedupe_key, 1, 30 ); // 30 seconds is enough for accidental doubles.

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

			$dedupe_key_scroll = 'nexus_ls_evdd_' . md5( $ip_for_dedupe . '|' . $ua_for_dedupe . '|scroll_depth|' . (string) $scroll_template['page'] . '|pct:' . (string) (int) $max_scroll_pct . '|' . $dedupe_bucket );
			if ( ! get_transient( $dedupe_key_scroll ) ) {
				set_transient( $dedupe_key_scroll, 1, 30 );
				$events_sanitized[] = $scroll_template;
			}
		}

		foreach ( $events_sanitized as $sev ) {
			\Nexus_Lead_Suite\Core\Activities_Store::record_interaction(
				(string) $sev['type'],
				(string) $sev['target'],
				(string) $sev['page'],
				is_array( $sev['meta'] ) ? $sev['meta'] : array(),
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
	 * Builds PDF table rows from stored interactions (never trusts client-supplied row payloads).
	 *
	 * @param string $tab       Tab filter.
	 * @param string $date_from Start date Y-m-d or empty.
	 * @param string $date_to   End date Y-m-d or empty.
	 * @param string $search    Search string.
	 * @return array<int,array<string,string>>
	 */
	private function build_pdf_table_rows_from_filters( string $tab, string $date_from, string $date_to, string $search ): array {
		require_once NEXUS_LS_PLUGIN_DIR . 'core/class-activities-store.php';

		$db_rows    = \Nexus_Lead_Suite\Core\Activities_Store::fetch_report_rows(
			$tab,
			$date_from,
			$date_to,
			$search,
			\Nexus_Lead_Suite\Core\Activities_Store::PDF_EXPORT_ROW_LIMIT
		);
		$table_rows = array();

		foreach ( $db_rows as $row ) {
			$act          = \Nexus_Lead_Suite\Core\Activities_Store::map_db_row_to_activity( $row );
			$table_rows[] = array(
				'identifier'  => $act['actionName'],
				'reference'   => $act['pageUrl'],
				'mail_status' => isset( $act['mailStatus'] ) ? (string) $act['mailStatus'] : '',
			);
		}

		return $table_rows;
	}

	/**
	 * Generates an Activities PDF report and returns a URL.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function generate_activities_pdf( \WP_REST_Request $request ) {
		require_once NEXUS_LS_PLUGIN_DIR . 'core/class-simple-pdf.php';

		try {
			$tab       = $this->sanitize_activity_tab( (string) $request->get_param( 'tab' ) );
			$date_from = sanitize_text_field( (string) $request->get_param( 'dateFrom' ) );
			$date_to   = sanitize_text_field( (string) $request->get_param( 'dateTo' ) );
			$search    = sanitize_text_field( (string) $request->get_param( 'search' ) );

			if ( ! preg_match( '/^\d{4}-\d{2}-\d{2}$/', $date_from ) ) {
				$date_from = '';
			}
			if ( ! preg_match( '/^\d{4}-\d{2}-\d{2}$/', $date_to ) ) {
				$date_to = '';
			}

			$date_line  = wp_date( 'M j, Y', current_time( 'timestamp' ) );
			$table_rows = $this->build_pdf_table_rows_from_filters( $tab, $date_from, $date_to, $search );

			$logo = $this->get_report_logo_jpeg_data();
			if ( null === $logo ) {
				$logo = $this->get_site_logo_jpeg_data();
			}
			if ( is_array( $logo ) ) {
				$logo['max_display'] = $this->get_report_logo_pdf_max_display();
			}

			$pdf_bytes = \Nexus_Lead_Suite\Simple_Pdf::build_activities_report_pdf(
				(string) get_bloginfo( 'name' ),
				array(
					'date_line' => $date_line,
					'tab'       => $tab,
					'dateFrom'  => $date_from,
					'dateTo'    => $date_to,
					'search'    => $search,
				),
				$table_rows,
				is_array( $logo ) ? $logo : array()
			);

			$uploads = wp_upload_dir();
			if ( empty( $uploads['basedir'] ) || empty( $uploads['baseurl'] ) ) {
				return new \WP_Error( 'nexus_ls_uploads_unavailable', 'Uploads directory unavailable.' );
			}

			$subdir   = dirname( NEXUS_LS_PLUGIN_BASENAME );
			$dir      = trailingslashit( (string) $uploads['basedir'] ) . $subdir;
			$url_base = trailingslashit( (string) $uploads['baseurl'] ) . $subdir;

			if ( ! file_exists( $dir ) ) {
				$made = wp_mkdir_p( $dir );
				if ( ! $made ) {
					return new \WP_Error( 'nexus_ls_uploads_mkdir_failed', 'Failed to create uploads directory.' );
				}
			}

			require_once ABSPATH . 'wp-admin/includes/file.php';
			if ( ! WP_Filesystem() ) {
				return new \WP_Error( 'nexus_ls_uploads_fs_unavailable', 'Filesystem unavailable.' );
			}

			global $wp_filesystem;
			if ( ! is_object( $wp_filesystem ) || ! $wp_filesystem->is_dir( $dir ) || ! $wp_filesystem->is_writable( $dir ) ) {
				return new \WP_Error( 'nexus_ls_uploads_not_writable', 'Uploads directory is not writable.' );
			}

			$filename = 'nexus-activities-report-' . gmdate( 'Ymd-His' ) . '-' . wp_generate_password( 6, false, false ) . '.pdf';
			$path     = trailingslashit( $dir ) . $filename;
			$url      = trailingslashit( $url_base ) . $filename;

			$written = $wp_filesystem->put_contents( $path, $pdf_bytes, FS_CHMOD_FILE );
			if ( ! $written || strlen( $pdf_bytes ) < 10 ) {
				return new \WP_Error( 'nexus_ls_pdf_write_failed', 'Failed to write PDF.' );
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
			return new \WP_Error( 'nexus_ls_pdf_exception', 'PDF generation failed.' );
		}
	}

	/**
	 * Gets Site Logo as JPEG bytes for PDF embedding (converts if needed).
	 *
	 * @return array<string,mixed>|null
	 */
	private function get_site_logo_jpeg_data() {
		$logo_id = (int) get_theme_mod( 'custom_logo' );
		if ( $logo_id <= 0 ) {
			return null;
		}

		$path = get_attached_file( $logo_id );
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

		$tmp = trailingslashit( $uploads['path'] ) . 'nexus-site-logo-' . wp_generate_password( 6, false, false ) . '.jpg';
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

		$tmp = trailingslashit( (string) $uploads['path'] ) . 'nexus-report-logo-' . wp_generate_password( 6, false, false ) . '.jpg';
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
			return new \WP_Error( 'nexus_ls_no_recipients', 'No valid recipients provided.' );
		}

		// Generate PDF using the same logic.
		$pdf_response = $this->generate_activities_pdf( $request );
		if ( is_wp_error( $pdf_response ) ) {
			return $pdf_response;
		}

		$data = $pdf_response->get_data();
		$pdf_url = isset( $data['data']['pdf_url'] ) ? (string) $data['data']['pdf_url'] : '';
		if ( '' === $pdf_url ) {
			return new \WP_Error( 'nexus_ls_pdf_missing', 'PDF URL missing.' );
		}

		$uploads = wp_upload_dir();
		$baseurl = isset( $uploads['baseurl'] ) ? (string) $uploads['baseurl'] : '';
		$basedir = isset( $uploads['basedir'] ) ? (string) $uploads['basedir'] : '';

		if ( '' === $baseurl || '' === $basedir ) {
			return new \WP_Error( 'nexus_ls_uploads_unavailable', 'Uploads directory unavailable.' );
		}

		$pdf_path = str_replace( $baseurl, $basedir, $pdf_url );
		$pdf_path = wp_normalize_path( $pdf_path );
		if ( ! file_exists( $pdf_path ) ) {
			return new \WP_Error( 'nexus_ls_pdf_not_found', 'PDF file not found.' );
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
				'nexus_ls_mail_failed',
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
