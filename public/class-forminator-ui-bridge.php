<?php
/**
 * Loads vendored Forminator UI (GPLv3) assets and maps Nexus form markup to FUI classes.
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
 * Forminator UI asset helpers (vendored under assets/vendor/forminator-ui).
 */
final class Forminator_UI_Bridge {

	public const VENDOR_REL = 'assets/vendor/forminator-ui';

	/**
	 * @return string Absolute URL to a vendored file.
	 */
	public static function vendor_url( string $rel ): string {
		return NEXUS_LS_PLUGIN_URL . self::VENDOR_REL . '/' . ltrim( $rel, '/' );
	}

	/**
	 * @return string Absolute filesystem path.
	 */
	public static function vendor_path( string $rel ): string {
		return NEXUS_LS_PLUGIN_DIR . self::VENDOR_REL . '/' . ltrim( $rel, '/' );
	}

	public static function is_available(): bool {
		return file_exists( self::vendor_path( 'js/forminator-form.min.js' ) );
	}

	public static function normalize_design( string $raw ): string {
		$raw = strtolower( trim( $raw ) );
		$allowed = array( 'default', 'flat', 'bold', 'material' );

		return in_array( $raw, $allowed, true ) ? $raw : 'default';
	}

	public static function normalize_theme( string $raw ): string {
		$raw = strtolower( trim( $raw ) );
		$allowed = array( 'default', 'dark', 'light' );

		return in_array( $raw, $allowed, true ) ? $raw : 'default';
	}

	/**
	 * Extra classes for the outer form wrapper (validated tokens only).
	 *
	 * @param array<string,mixed> $form Form row.
	 * @return string Space-separated class list.
	 */
	public static function root_classes( array $form ): string {
		$styling = isset( $form['styling'] ) && is_array( $form['styling'] ) ? $form['styling'] : array();
		$design  = self::normalize_design( (string) ( $styling['forminatorDesign'] ?? 'default' ) );
		$theme   = self::normalize_theme( (string) ( $styling['forminatorTheme'] ?? 'default' ) );

		return 'forminator-ui forminator-custom-form forminator-design--' . $design . ' forminator-theme--' . $theme;
	}

	/**
	 * Enqueues core Forminator UI styles + design slice + forminator-form.js + Nexus FUI bridge.
	 *
	 * @param string[] $designs Unique design keys (default, flat, bold, material).
	 * @param bool     $is_multi Whether pagination field CSS is needed.
	 * @return void
	 */
	public static function enqueue( array $designs, bool $is_multi ): void {
		if ( ! self::is_available() ) {
			return;
		}

		wp_enqueue_script( 'jquery' );

		$handles_chain = array();

		$core_styles = array(
			'nexus-fui-base'   => 'css/forminator-base.min.css',
			'nexus-fui-global' => 'css/forminator-global.min.css',
			'nexus-fui-grid'   => 'css/forminator-grid.min.css',
			'nexus-fui-forms'  => 'css/forminator-forms.min.css',
			'nexus-fui-icons'  => 'css/forminator-icons.min.css',
			'nexus-fui-shell'  => 'css/forminator-ui.min.css',
		);

		foreach ( $core_styles as $handle => $rel ) {
			$path = self::vendor_path( $rel );
			if ( ! file_exists( $path ) ) {
				continue;
			}
			wp_enqueue_style(
				$handle,
				self::vendor_url( $rel ),
				$handles_chain,
				(string) filemtime( $path )
			);
			$handles_chain = array( $handle );
		}

		$designs = array_values( array_unique( array_map( array( self::class, 'normalize_design' ), $designs ) ) );
		if ( array() === $designs ) {
			$designs = array( 'default' );
		}

		$deps_after_core = $handles_chain;

		foreach ( $designs as $design ) {
			$full_rel = 'css/src/form/forminator-form-' . $design . '.full.min.css';
			$full_p   = self::vendor_path( $full_rel );
			$h        = 'nexus-fui-design-' . $design;
			$pag_dep  = $deps_after_core;
			if ( file_exists( $full_p ) ) {
				wp_enqueue_style(
					$h,
					self::vendor_url( $full_rel ),
					$deps_after_core,
					(string) filemtime( $full_p )
				);
				$pag_dep = array( $h );
			}
			if ( $is_multi ) {
				$pag_rel = 'css/src/form/forminator-form-' . $design . '.pagination.min.css';
				$pag_p   = self::vendor_path( $pag_rel );
				if ( file_exists( $pag_p ) ) {
					$ph = 'nexus-fui-pag-' . $design;
					wp_enqueue_style(
						$ph,
						self::vendor_url( $pag_rel ),
						$pag_dep,
						(string) filemtime( $pag_p )
					);
				}
			}
		}

		$js_p = self::vendor_path( 'js/forminator-form.min.js' );
		wp_enqueue_script(
			'nexus-fui-form',
			self::vendor_url( 'js/forminator-form.min.js' ),
			array( 'jquery' ),
			file_exists( $js_p ) ? (string) filemtime( $js_p ) : NEXUS_LS_VERSION,
			true
		);

		$bridge_js = NEXUS_LS_PLUGIN_DIR . 'public/js/nexus-ls-forminator-fui.js';
		if ( file_exists( $bridge_js ) ) {
			wp_enqueue_script(
				'nexus-ls-forminator-fui',
				NEXUS_LS_PLUGIN_URL . 'public/js/nexus-ls-forminator-fui.js',
				array( 'jquery', 'nexus-fui-form', 'nexus-ls-forms-runtime' ),
				(string) filemtime( $bridge_js ),
				true
			);
		}

		$bridge_css = NEXUS_LS_PLUGIN_DIR . 'public/css/nexus-ls-forminator-bridge.css';
		if ( file_exists( $bridge_css ) ) {
			wp_enqueue_style(
				'nexus-ls-forminator-bridge',
				NEXUS_LS_PLUGIN_URL . 'public/css/nexus-ls-forminator-bridge.css',
				array( 'nexus-ls-forms-runtime' ),
				(string) filemtime( $bridge_css )
			);
		}
	}
}
