<?php
/**
 * Shared global font helpers (Settings → globalFont).
 *
 * @package Nexus_Lead_Suite
 */

declare(strict_types=1);

namespace Nexus_Lead_Suite\Core;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Loads Google Fonts and injects --nexus-ls-font for plugin UI surfaces.
 */
final class Global_Font {

	/**
	 * Option key for general settings.
	 */
	private const SETTINGS_OPTION_KEY = 'nexus_ls_general_settings_v1';

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
	 * Google Font weight axes per family.
	 *
	 * @return array<string, string>
	 */
	public static function get_weights_map(): array {
		return array(
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
	}

	/**
	 * @param string $font Font family.
	 * @return string
	 */
	public static function get_weights_for_font( string $font ): string {
		$map = self::get_weights_map();
		return isset( $map[ $font ] ) ? $map[ $font ] : '400;700';
	}

	/**
	 * @param string $font Font family.
	 * @return string
	 */
	public static function get_font_stack( string $font ): string {
		return "'" . esc_attr( $font ) . "', sans-serif";
	}

	/**
	 * @return string
	 */
	public static function get_css_var_root_rule(): string {
		$font = self::get_saved_font();
		return ':root { --nexus-ls-font: ' . self::get_font_stack( $font ) . '; }';
	}

	/**
	 * Front-end plugin widget selectors.
	 *
	 * @return string
	 */
	public static function get_frontend_font_rules(): string {
		return '.nexus-st-form, .nexus-st-form * { font-family: var(--nexus-ls-font) !important; }' . "\n"
			. '.nexus-popup-overlay, .nexus-popup-overlay *, .nexus-popup, .nexus-popup * { font-family: var(--nexus-ls-font) !important; }' . "\n"
			. '.nexus-menu-widget, .nexus-menu-widget * { font-family: var(--nexus-ls-font) !important; }' . "\n"
			. '.nexus-chat-widget, .nexus-chat-widget * { font-family: var(--nexus-ls-font) !important; }' . "\n"
			. '#nexus-ls-ve-root, #nexus-ls-ve-root *, .nexus-ve, .nexus-ve *, .nexus-ve-successBackdrop, .nexus-ve-successBackdrop * { font-family: var(--nexus-ls-font) !important; }' . "\n"
			. '.nexus-ls-client-gateway, .nexus-ls-client-gateway * { font-family: var(--nexus-ls-font) !important; }';
	}

	/**
	 * Admin SPA selectors (preserve dashicons).
	 *
	 * @return string
	 */
	public static function get_admin_font_rules(): string {
		return '.nexus-ls-admin-app, .nexus-ls-admin-app *:not(.dashicons):not([class*="dashicons"]) { font-family: var(--nexus-ls-font) !important; }';
	}

	/**
	 * Enqueues the Google Font stylesheet and returns inline CSS for the handle.
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

		$weights = self::get_weights_for_font( $font );
		$gf_url  = 'https://fonts.googleapis.com/css2?family=' . rawurlencode( $font ) . ':wght@' . $weights . '&display=swap';

		wp_enqueue_style(
			'nexus-ls-global-font',
			esc_url( $gf_url ),
			array(),
			null // phpcs:ignore WordPress.WP.EnqueuedResourceParameters.MissingVersion
		);

		$css = ':root { --nexus-ls-font: ' . self::get_font_stack( $font ) . '; }' . "\n";

		if ( is_admin() ) {
			$css .= self::get_admin_font_rules();
		} else {
			$css .= self::get_frontend_font_rules();
		}

		wp_add_inline_style( 'nexus-ls-global-font', $css );

		return $css;
	}
}
