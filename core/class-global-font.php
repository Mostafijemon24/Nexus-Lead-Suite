<?php
/**
 * Shared global font helpers (Settings → globalFont).
 *
 * @package nexulesuite_
 */

declare(strict_types=1);

namespace nexulesuite_\Core;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Loads Google Fonts and injects --nexulesuite_font for plugin UI surfaces.
 */
final class Global_Font {

	/**
	 * Option key for general settings.
	 */
	private const SETTINGS_OPTION_KEY = 'nexulesuite_general_settings_v1';

	/**
	 * Default font family.
	 */
	private const DEFAULT_FONT = 'Inter';

	/**
	 * Returns the saved global font family.
	 *
	 * @return string
	 */
	public static function get_saved_font(): string {
		$opt = get_option( self::SETTINGS_OPTION_KEY, array() );
		if ( ! is_array( $opt ) ) {
			return self::DEFAULT_FONT;
		}

		$font = isset( $opt['globalFont'] ) ? sanitize_text_field( (string) $opt['globalFont'] ) : self::DEFAULT_FONT;
		if ( '' === $font ) {
			return self::DEFAULT_FONT;
		}

		return $font;
	}

	/**
	 * Families bundled with the plugin, in load order.
	 *
	 * Each entry: file basename (without extension) under assets/fonts/, the CSS
	 * generic fallback, and the font-weight range the file covers. Variable files
	 * carry the whole 100-900 axis in one request; fixed-weight families list the
	 * individual files they ship.
	 *
	 * Nothing here is fetched remotely — every file lives in assets/fonts/.
	 *
	 * @return array<string, array{files: array<string, string>, fallback: string, variable: bool}>
	 */
	public static function get_bundled_fonts(): array {
		$variable = array(
			'Inter'            => 'sans-serif',
			'Roboto'           => 'sans-serif',
			'Open Sans'        => 'sans-serif',
			'Montserrat'       => 'sans-serif',
			'Nunito'           => 'sans-serif',
			'Work Sans'        => 'sans-serif',
			'Figtree'          => 'sans-serif',
			'Outfit'           => 'sans-serif',
			'Manrope'          => 'sans-serif',
			'Raleway'          => 'sans-serif',
			'Rubik'            => 'sans-serif',
			'Lexend'           => 'sans-serif',
			'Oswald'           => 'sans-serif',
			'Playfair Display' => 'serif',
			'Lora'             => 'serif',
			'Merriweather'     => 'serif',
			'Dancing Script'   => 'cursive',
			'JetBrains Mono'   => 'monospace',
			'Source Code Pro'  => 'monospace',
		);

		$fonts = array();

		foreach ( $variable as $family => $fallback ) {
			$slug              = self::family_slug( $family );
			$fonts[ $family ] = array(
				'files'    => array( '100 900' => $slug . '-latin-wght-normal.woff2' ),
				'fallback' => $fallback,
				'variable' => true,
			);
		}

		$fonts['Poppins'] = array(
			'files'    => array(
				'400' => 'poppins-latin-400-normal.woff2',
				'500' => 'poppins-latin-500-normal.woff2',
				'600' => 'poppins-latin-600-normal.woff2',
				'700' => 'poppins-latin-700-normal.woff2',
			),
			'fallback' => 'sans-serif',
			'variable' => false,
		);
		$fonts['Lato'] = array(
			'files'    => array(
				'400' => 'lato-latin-400-normal.woff2',
				'700' => 'lato-latin-700-normal.woff2',
			),
			'fallback' => 'sans-serif',
			'variable' => false,
		);
		$fonts['Bebas Neue'] = array(
			'files'    => array( '400' => 'bebas-neue-latin-400-normal.woff2' ),
			'fallback' => 'sans-serif',
			'variable' => false,
		);
		$fonts['Pacifico'] = array(
			'files'    => array( '400' => 'pacifico-latin-400-normal.woff2' ),
			'fallback' => 'cursive',
			'variable' => false,
		);

		ksort( $fonts );

		return $fonts;
	}

	/**
	 * Lowercase, hyphenated file slug for a family name.
	 *
	 * @param string $family Family name.
	 * @return string
	 */
	private static function family_slug( string $family ): string {
		return str_replace( ' ', '-', strtolower( $family ) );
	}

	/**
	 * Whether a family ships with the plugin.
	 *
	 * @param string $font Family name.
	 * @return bool
	 */
	public static function is_bundled( string $font ): bool {
		return isset( self::get_bundled_fonts()[ $font ] );
	}

	/**
	 * Builds the @font-face block for one bundled family.
	 *
	 * @param string $font Family name.
	 * @return string CSS, or '' when the family is not bundled.
	 */
	public static function get_font_face_css( string $font ): string {
		$fonts = self::get_bundled_fonts();
		if ( ! isset( $fonts[ $font ] ) ) {
			return '';
		}

		$css = '';
		foreach ( $fonts[ $font ]['files'] as $weight => $file ) {
			$css .= '@font-face{'
				. "font-family:'" . $font . "';"
				. 'font-style:normal;'
				. 'font-display:swap;'
				. 'font-weight:' . $weight . ';'
				. "src:url('" . esc_url( nexulesuite_PLUGIN_URL . 'assets/fonts/' . $file ) . "') format('woff2');"
				. 'unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;'
				. '}';
		}

		return $css;
	}

	/**
	 * @font-face blocks for every bundled family.
	 *
	 * Used on the plugin's own admin screens so the font picker can preview each
	 * family in its own typeface. Front-end pages only ever load the one family
	 * that is actually selected.
	 *
	 * @return string
	 */
	public static function get_all_font_faces_css(): string {
		$css = '';
		foreach ( array_keys( self::get_bundled_fonts() ) as $family ) {
			$css .= self::get_font_face_css( $family );
		}

		return $css;
	}

	/**
	 * @param string $font Font family.
	 * @return string
	 */
	public static function get_weights_for_font( string $font ): string {
		$fonts = self::get_bundled_fonts();
		if ( ! isset( $fonts[ $font ] ) ) {
			return '400;700';
		}
		return implode( ';', array_keys( $fonts[ $font ]['files'] ) );
	}

	/**
	 * @param string $font Font family.
	 * @return string
	 */
	public static function get_font_stack( string $font ): string {
		$fonts    = self::get_bundled_fonts();
		$fallback = isset( $fonts[ $font ] ) ? $fonts[ $font ]['fallback'] : 'sans-serif';

		return "'" . esc_attr( $font ) . "', " . $fallback;
	}

	/**
	 * @return string
	 */
	public static function get_css_var_root_rule(): string {
		$font = self::get_saved_font();
		return ':root { --nexulesuite_font: ' . self::get_font_stack( $font ) . '; }';
	}

	/**
	 * Front-end plugin widget selectors.
	 *
	 * @return string
	 */
	public static function get_frontend_font_rules(): string {
		return '.nexulesuite_st-form, .nexulesuite_st-form * { font-family: var(--nexulesuite_font) !important; }' . "\n"
			. '.nexulesuite_popup-overlay, .nexulesuite_popup-overlay *, .nexulesuite_popup, .nexulesuite_popup * { font-family: var(--nexulesuite_font) !important; }' . "\n"
			. '.nexulesuite_menu-widget, .nexulesuite_menu-widget * { font-family: var(--nexulesuite_font) !important; }' . "\n"
			. '.nexulesuite_chat-widget, .nexulesuite_chat-widget * { font-family: var(--nexulesuite_font) !important; }' . "\n"
			. '#nexulesuite_ve-root, #nexulesuite_ve-root *, .nexulesuite_ve, .nexulesuite_ve *, .nexulesuite_ve-successBackdrop, .nexulesuite_ve-successBackdrop * { font-family: var(--nexulesuite_font) !important; }' . "\n"
			. '.nexulesuite_client-gateway, .nexulesuite_client-gateway * { font-family: var(--nexulesuite_font) !important; }';
	}

	/**
	 * Admin SPA selectors (preserve dashicons).
	 *
	 * @return string
	 */
	public static function get_admin_font_rules(): string {
		return '.nexulesuite_admin-app, .nexulesuite_admin-app *:not(.dashicons):not([class*="dashicons"]) { font-family: var(--nexulesuite_font) !important; }';
	}

	/**
	 * Registers an inline-only style handle and returns the global-font CSS.
	 *
	 * @param string      $style_handle Enqueued style handle to attach inline CSS to.
	 * @param string|null $font         Optional font override.
	 * @return string Inline CSS.
	 */
	public static function enqueue( string $style_handle, ?string $font = null ): string {
		$font = null !== $font ? sanitize_text_field( $font ) : self::get_saved_font();
		if ( '' === $font ) {
			$font = self::DEFAULT_FONT;
		}

		/*
		 * The font file ships inside the plugin (assets/fonts/) and is declared with a
		 * local @font-face rule. No request leaves the visitor's browser for a
		 * third-party CDN, per the WordPress.org plugin guidelines.
		 */
		wp_register_style( 'nexulesuite_global-font', false, array(), nexulesuite_VERSION ); // phpcs:ignore WordPress.WP.EnqueuedResourceParameters.NotInFooter
		wp_enqueue_style( 'nexulesuite_global-font' );

		$css = self::get_font_face_css( $font );
		$css .= ':root { --nexulesuite_font: ' . self::get_font_stack( $font ) . '; }' . "\n";

		if ( is_admin() ) {
			$css .= self::get_admin_font_rules();
		} else {
			$css .= self::get_frontend_font_rules();
		}

		wp_add_inline_style( 'nexulesuite_global-font', $css );

		return $css;
	}
}
