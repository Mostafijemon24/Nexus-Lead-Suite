<?php
/**
 * Expands popup body shortcodes with third‑party quirks (Forminator preview mode, etc.).
 *
 * @package Nexus_Lead_Suite
 */

declare(strict_types=1);

namespace Nexus_Lead_Suite;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
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
	 * @param bool $active Whether smart-trigger forms are rendered inside popup markup.
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
			do_action( 'wp_enqueue_scripts' );
		}

		$html = expand_popup_body_shortcodes( $raw );

		ob_start();
		wp_print_styles();
		$head_html = (string) ob_get_clean();

		ob_start();
		wp_print_footer_scripts();
		$footer_html = (string) ob_get_clean();

		$css_path = NEXUS_LS_PLUGIN_DIR . 'public/css/forms-runtime.css';
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
