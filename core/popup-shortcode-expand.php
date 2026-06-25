<?php
/**
 * Expands popup body shortcodes with third‑party quirks (Forminator preview mode, etc.).
 *
 * @package nexulesuite_
 */

declare(strict_types=1);

namespace nexulesuite_;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Allowed HTML for echoing the plugin's OWN form / popup / lock markup through wp_kses().
 *
 * wp_kses_post() strips <form>, <input>, <select>, <button>, <textarea>, <svg> and every
 * data-* / aria-* attribute, which would destroy every form, popup and icon. This extends the
 * post allow-list with the interactive + SVG elements the plugin emits and explicitly whitelists
 * each data-* and aria-* attribute it uses (KSES strips them unless explicitly listed).
 *
 * Notes:
 *  - Inline `style` is filtered by safecss_filter_attr(), which keeps CSS custom properties
 *    (--var) on WordPress 5.8+.
 *  - KSES lowercases SVG attribute names (viewBox -> viewbox); browsers re-correct the case for
 *    inline SVG via the HTML5 foreign-content adjustment, so icons still render correctly.
 *  - Do NOT use this for do_shortcode()/Forminator output — that markup is the shortcode's own
 *    responsibility to escape and uses attributes (e.g. data-sitekey) not whitelisted here.
 *
 * @return array<string,array<string,bool>> Allow-list for wp_kses().
 */
function allowed_form_html(): array {
	$globals = array(
		'class'           => true,
		'id'              => true,
		'style'           => true,
		'title'           => true,
		'role'            => true,
		'tabindex'        => true,
		'hidden'          => true,
		'aria-controls'   => true,
		'aria-expanded'   => true,
		'aria-hidden'     => true,
		'aria-label'      => true,
		'aria-live'       => true,
		'aria-modal'      => true,
		'aria-required'   => true,
		'aria-valuemax'   => true,
		'aria-valuemin'   => true,
		'aria-valuenow'   => true,
		'data-action'     => true,
		'data-default'    => true,
		'data-event'      => true,
		'data-form-id'    => true,
		'data-form-type'  => true,
		'data-label-hide' => true,
		'data-label-show' => true,
		'data-logic'      => true,
		'data-module'     => true,
		'data-popup-id'   => true,
		'data-single'     => true,
		'data-sitekey'    => true,
		'data-step-dot'   => true,
		'data-step-index' => true,
		'data-submit-text'                   => true,
		'data-total-steps'                   => true,
		'data-nexulesuite_chat-open-form'    => true,
		'data-nexulesuite_chat-popup'        => true,
		'data-nexulesuite_draft-step'        => true,
		'data-nexulesuite_gate'              => true,
		'data-nexulesuite_gate-eye-off'      => true,
		'data-nexulesuite_gate-eye-on'       => true,
		'data-nexulesuite_gate-pass'         => true,
		'data-nexulesuite_gate-toggle'       => true,
		'data-nexulesuite_mask'              => true,
		'data-nexulesuite_submit-gate'       => true,
		'data-nexulesuite_trigger'           => true,
		'data-nexulesuite_ve-hover'          => true,
		'data-nexulesuite_ve-stop-prop'      => true,
		'data-nexulesuite_ve-wrap'           => true,
		'data-nexulesuite_widget-id'         => true,
	);

	$form = array(
		'form'     => array( 'action' => true, 'method' => true, 'enctype' => true, 'novalidate' => true, 'target' => true, 'name' => true, 'accept-charset' => true ),
		'input'    => array( 'type' => true, 'name' => true, 'value' => true, 'placeholder' => true, 'required' => true, 'checked' => true, 'disabled' => true, 'readonly' => true, 'min' => true, 'max' => true, 'step' => true, 'pattern' => true, 'autocomplete' => true, 'inputmode' => true, 'accept' => true, 'multiple' => true, 'size' => true, 'maxlength' => true, 'minlength' => true, 'list' => true ),
		'select'   => array( 'name' => true, 'required' => true, 'multiple' => true, 'disabled' => true, 'size' => true ),
		'option'   => array( 'value' => true, 'selected' => true, 'disabled' => true, 'label' => true ),
		'optgroup' => array( 'label' => true, 'disabled' => true ),
		'textarea' => array( 'name' => true, 'rows' => true, 'cols' => true, 'placeholder' => true, 'required' => true, 'disabled' => true, 'readonly' => true, 'maxlength' => true, 'wrap' => true ),
		'button'   => array( 'type' => true, 'name' => true, 'value' => true, 'disabled' => true ),
		'label'    => array( 'for' => true ),
		'fieldset' => array( 'disabled' => true, 'name' => true ),
		'legend'   => array(),
		'datalist' => array(),
	);

	$svg = array(
		'svg'            => array( 'xmlns' => true, 'viewbox' => true, 'width' => true, 'height' => true, 'fill' => true, 'stroke' => true, 'focusable' => true, 'preserveaspectratio' => true ),
		'path'           => array( 'd' => true, 'fill' => true, 'stroke' => true, 'fill-rule' => true, 'clip-rule' => true, 'stroke-width' => true, 'stroke-linecap' => true, 'stroke-linejoin' => true, 'opacity' => true ),
		'g'              => array( 'fill' => true, 'stroke' => true, 'transform' => true ),
		'circle'         => array( 'cx' => true, 'cy' => true, 'r' => true, 'fill' => true, 'stroke' => true, 'stroke-width' => true ),
		'rect'           => array( 'x' => true, 'y' => true, 'rx' => true, 'ry' => true, 'width' => true, 'height' => true, 'fill' => true, 'stroke' => true ),
		'line'           => array( 'x1' => true, 'y1' => true, 'x2' => true, 'y2' => true, 'stroke' => true, 'stroke-width' => true, 'stroke-linecap' => true ),
		'polyline'       => array( 'points' => true, 'fill' => true, 'stroke' => true, 'stroke-width' => true ),
		'polygon'        => array( 'points' => true, 'fill' => true, 'stroke' => true ),
		'defs'           => array(),
		'lineargradient' => array( 'x1' => true, 'y1' => true, 'x2' => true, 'y2' => true, 'gradientunits' => true ),
		'radialgradient' => array( 'cx' => true, 'cy' => true, 'r' => true ),
		'stop'           => array( 'offset' => true, 'stop-color' => true, 'stop-opacity' => true ),
		'desc'           => array(),
	);

	$tags = array_merge( wp_kses_allowed_html( 'post' ), $form, $svg );
	foreach ( $tags as $tag => $attrs ) {
		$tags[ $tag ] = array_merge( is_array( $attrs ) ? $attrs : array(), $globals );
	}

	return $tags;
}

/**
 * Toggles trusted-inline-CSS allowance around a wp_kses() call on the plugin's OWN markup.
 *
 * safecss_filter_attr() (used by wp_kses for the style attribute) drops several non-dangerous CSS
 * properties the plugin uses inline (box-shadow, transform, etc.). Call this with true immediately
 * before `echo wp_kses( $html, allowed_form_html() )` for HTML carrying hardcoded inline styles
 * (e.g. the lock screen), then false straight after, so inline styling renders unchanged while the
 * markup is still sanitized. Only wrap plugin-built / admin-sanitized HTML — never visitor input.
 * Escaping stays on wp_kses() at the echo (not a wrapper) so Plugin Check's sniff recognises it.
 *
 * @param bool $on True before the echo, false after.
 * @return void
 */
function allow_trusted_inline_css( bool $on ): void {
	static $extra_css = null;
	if ( null === $extra_css ) {
		$extra_css = static function ( array $props ): array {
			return array_merge(
				$props,
				array( 'box-shadow', 'box-sizing', 'transform', 'transform-origin', 'transition', 'outline', 'outline-offset', 'opacity', 'flex', 'flex-direction', 'flex-wrap', 'gap', 'object-fit', 'pointer-events', 'white-space', 'z-index', 'filter', 'backdrop-filter' )
			);
		};
	}

	if ( $on ) {
		add_filter( 'safe_style_css', $extra_css );
		add_filter( 'safecss_filter_attr_allow_css', '__return_true' );
	} else {
		remove_filter( 'safecss_filter_attr_allow_css', '__return_true' );
		remove_filter( 'safe_style_css', $extra_css );
	}
}

/**
 * True while {@see expand_popup_body_shortcodes()} is running (forms inherit popup button styling).
 */
final class Popup_Form_Render_Context {

	/**
	 * @var bool
	 */
	private static $active = false;

	/**
	 * @param bool $active Whether nexulesuite_ forms are rendered inside popup markup.
	 */
	public static function set_active( bool $active ): void {
		self::$active = $active;
	}

	/**
	 * @return bool
	 */
	public static function is_active(): bool {
		return self::$active;
	}
}

/**
 * Sanitizes popup body HTML for storage while keeping shortcodes intact.
 *
 * wp_kses_post() alone strips bracket shortcodes (e.g. [nexulesuite_form id="…"]).
 *
 * @param string $content Raw popup body from admin.
 * @return string
 */
function sanitize_popup_body_for_storage( string $content ): string {
	if ( '' === $content ) {
		return '';
	}

	$placeholders = array();
	$index        = 0;

	$protected = preg_replace_callback(
		'/\[[\/]?[a-zA-Z0-9_\-]+[^\]]*\]/',
		static function ( array $matches ) use ( &$placeholders, &$index ): string {
			$key                 = '%%NLS_POPUP_SC_' . $index . '%%';
			$placeholders[ $key ] = $matches[0];
			++$index;

			return $key;
		},
		$content
	);

	if ( ! is_string( $protected ) ) {
		$protected = $content;
	}

	$sanitized = wp_kses_post( $protected );

	if ( ! empty( $placeholders ) ) {
		$sanitized = strtr( $sanitized, $placeholders );
	}

	return (string) preg_replace( '#<\s*script\b[^>]*>.*?</\s*script\s*>#is', '', $sanitized );
}

/**
 * Forminator skips full markup unless "preview" unless page-builder preview is detected;
 * REST/admin simulator is neither, so force preview for shortcode rendering only.
 * If output is still empty, run the_content pipeline once (blocks/embeds/other hooks).
 *
 * @param string $raw Popup body (already stripped of disallowed script tags if applicable).
 * @return string
 */
function expand_popup_body_shortcodes( string $raw ): string {
	Popup_Form_Render_Context::set_active( true );

	$form_preview = static function (): bool {
		return true;
	};

	add_filter( 'forminator_render_shortcode_is_preview', $form_preview, 1099 );

	try {
		$html = do_shortcode( $raw );
		$html = do_shortcode( (string) $html );

		if ( '' === trim( $html ) && strpos( $raw, '[' ) !== false ) {
			// phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound -- core WordPress content filter required for third-party shortcodes.
			$fallback = apply_filters( 'the_content', $raw );
			if ( '' !== trim( $fallback ) ) {
				$html = $fallback;
			}
		}

		return $html;
	} finally {
		remove_filter( 'forminator_render_shortcode_is_preview', $form_preview, 1099 );
		Popup_Form_Render_Context::set_active( false );
	}
}

/**
 * Builds HTML/CSS/assets for the popup simulator (admin). Runs outside REST so plugins
 * like Forminator do not treat the request as REST (their render class sets is_admin from REST_REQUEST).
 *
 * @param string $raw Popup body (may contain shortcodes).
 * @return array{html:string,css:string,headHtml:string,footerHtml:string}
 */
function build_popup_preview_payload( string $raw ): array {
	$output_buffer_level = ob_get_level();
	ob_start();
	try {
		$raw = trim( (string) preg_replace( '#<\s*script\b[^>]*>.*?</\s*script\s*>#is', '', wp_unslash( $raw ) ) );

		if ( ! did_action( 'wp_enqueue_scripts' ) ) {
			// phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound -- core WordPress hook required to load theme/plugin assets in preview.
			do_action( 'wp_enqueue_scripts' );
		}

		$html = expand_popup_body_shortcodes( $raw );

		ob_start();
		wp_print_styles();
		$head_html = (string) ob_get_clean();

		ob_start();
		wp_print_footer_scripts();
		$footer_html = (string) ob_get_clean();

		$css_path = nexulesuite_PLUGIN_DIR . 'public/css/forms-runtime.css';
		$css      = file_exists( $css_path ) ? (string) file_get_contents( $css_path ) : ''; // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents

		return array(
			'html'       => $html,
			'css'        => $css,
			'headHtml'   => $head_html,
			'footerHtml' => $footer_html,
		);
	} finally {
		while ( ob_get_level() > $output_buffer_level ) {
			ob_end_clean();
		}
	}
}
