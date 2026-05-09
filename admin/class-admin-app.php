<?php
/**
 * Admin SPA loader (menu + asset enqueue).
 *
 * @package Nexus_Lead_Suite
 */

declare(strict_types=1);

namespace Nexus_Lead_Suite\Admin;

use Nexus_Lead_Suite\Forms_Payload_Codec;
use WP_Error;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers the admin app page and enqueues the built assets (Vite manifest).
 */
final class Admin_App {

	/**
	 * Menu slug for the SPA page.
	 */
	public const MENU_SLUG = 'nexus-lead-suite';

	/**
	 * Hooks.
	 *
	 * @return void
	 */
	public function register_hooks(): void {
		add_action( 'admin_menu', array( $this, 'register_menu' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_assets' ) );
		add_action( 'wp_ajax_nexus_ls_popup_preview', array( $this, 'ajax_popup_preview' ) );
	}

	/**
	 * Returns submenu slug → React route map.
	 *
	 * @return array<string, string>
	 */
	private function get_submenu_routes(): array {
		return array(
			self::MENU_SLUG                   => 'activities',
			self::MENU_SLUG . '-menus'        => 'menu-items',
			self::MENU_SLUG . '-popups'       => 'popups',
			self::MENU_SLUG . '-emails'       => 'emails',
			self::MENU_SLUG . '-forms'        => 'form-builder',
			self::MENU_SLUG . '-settings'     => 'settings',
		);
	}

	/**
	 * Registers top-level menu and all submenu pages.
	 *
	 * @return void
	 */
	public function register_menu(): void {
		add_menu_page(
			__( 'Nexus Lead Suite', 'nexus-lead-suite' ),
			__( 'Nexus', 'nexus-lead-suite' ),
			'manage_options',
			self::MENU_SLUG,
			array( $this, 'render_app' ),
			'dashicons-screenoptions',
			56
		);

		$subpages = array(
			self::MENU_SLUG                   => __( 'Activities', 'nexus-lead-suite' ),
			self::MENU_SLUG . '-menus'        => __( 'Menus', 'nexus-lead-suite' ),
			self::MENU_SLUG . '-popups'       => __( 'Popups', 'nexus-lead-suite' ),
			self::MENU_SLUG . '-emails'       => __( 'Emails', 'nexus-lead-suite' ),
			self::MENU_SLUG . '-forms'        => __( 'Forms', 'nexus-lead-suite' ),
			self::MENU_SLUG . '-settings'     => __( 'Settings', 'nexus-lead-suite' ),
		);

		foreach ( $subpages as $slug => $label ) {
			add_submenu_page(
				self::MENU_SLUG,
				$label . ' — ' . __( 'Nexus Lead Suite', 'nexus-lead-suite' ),
				$label,
				'manage_options',
				$slug,
				array( $this, 'render_app' )
			);
		}
	}

	/**
	 * Renders the mount point.
	 *
	 * @return void
	 */
	public function render_app(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'You do not have permission to access this page.', 'nexus-lead-suite' ) );
		}

		if ( ! \Nexus_Lead_Suite\Core\Access_Gate::is_unlocked() ) {
			\Nexus_Lead_Suite\Core\Access_Gate::render_lock_screen_and_exit(
				__( 'Nexus Lead Suite — Locked', 'nexus-lead-suite' ),
				isset( $_POST['nexus_ls_gate_password'] ) ? __( 'Wrong password.', 'nexus-lead-suite' ) : ''
			);
		}

		// Note: WP admin's .wrap applies max-width constraints; our SPA needs full width.
		echo '<div id="nexus-ls-admin-root"></div>';
	}

	/**
	 * Admin-ajax: expands popup body shortcodes for the Pop-Up Simulator (not REST_REQUEST).
	 *
	 * @return void
	 */
	public function ajax_popup_preview(): void {
		if ( ! \Nexus_Lead_Suite\Core\Access_Gate::is_unlocked() ) {
			wp_send_json_error( array( 'message' => __( 'Plugin is locked.', 'nexus-lead-suite' ) ), 403 );
			return;
		}

		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => __( 'Forbidden.', 'nexus-lead-suite' ) ), 403 );
			return;
		}

		if ( ! check_ajax_referer( 'nexus_ls_popup_preview', 'nonce', false ) ) {
			wp_send_json_error( array( 'message' => __( 'Invalid or expired session. Reload the page.', 'nexus-lead-suite' ) ), 403 );
			return;
		}

		$content = isset( $_POST['content'] ) ? wp_unslash( (string) $_POST['content'] ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Missing -- nonce verified above.

		$data = \Nexus_Lead_Suite\build_popup_preview_payload( $content );

		wp_send_json_success( $data );
	}

	/**
	 * Enqueues React app assets only on our plugin pages.
	 *
	 * Hook-suffix patterns for submenu pages vary by sanitized menu title,
	 * so we use the page query param (allowlist-checked) for reliability.
	 *
	 * @param string $hook_suffix Current admin hook (unused; kept for WP API compat).
	 * @return void
	 */
	public function enqueue_assets( string $hook_suffix ): void {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$page = isset( $_GET['page'] ) ? sanitize_text_field( wp_unslash( $_GET['page'] ) ) : '';
		if ( ! array_key_exists( $page, $this->get_submenu_routes() ) ) {
			return;
		}

		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		wp_enqueue_style( 'dashicons' );

		// Load TinyMCE core so the React heading editor can call window.tinymce.init() directly.
		// We deliberately avoid wp_enqueue_editor() because it outputs conflicting
		// initialization JavaScript (via _WP_Editors::editor_js) for editors that
		// don't yet exist in the DOM, which can break the React SPA.
		wp_enqueue_script( 'wp-tinymce' );

		// Dev mode (optional): define('NEXUS_LS_VITE_DEV', true) in wp-config.php.
		if ( defined( 'NEXUS_LS_VITE_DEV' ) && NEXUS_LS_VITE_DEV ) {
			$this->enqueue_vite_dev();
			return;
		}

		$manifest = $this->read_vite_manifest();
		if ( is_wp_error( $manifest ) ) {
			$fallback_css_path = NEXUS_LS_PLUGIN_DIR . 'assets/admin/css/main.css';
			$fallback_js_path  = NEXUS_LS_PLUGIN_DIR . 'assets/admin/js/main.js';
			$fallback_css_ver  = file_exists( $fallback_css_path ) ? (string) filemtime( $fallback_css_path ) : NEXUS_LS_VERSION;
			$fallback_js_ver   = file_exists( $fallback_js_path ) ? (string) filemtime( $fallback_js_path ) : NEXUS_LS_VERSION;

			wp_enqueue_style(
				'nexus-ls-admin-fallback',
				esc_url( NEXUS_LS_PLUGIN_URL . 'assets/admin/css/main.css' ),
				array(),
				$fallback_css_ver
			);

			wp_enqueue_script(
				'nexus-ls-admin-fallback',
				esc_url( NEXUS_LS_PLUGIN_URL . 'assets/admin/js/main.js' ),
				array(),
				$fallback_js_ver,
				true
			);

			return;
		}

		$entry = $manifest['src/main.jsx'] ?? null;
		if ( ! is_array( $entry ) || empty( $entry['file'] ) ) {
			return;
		}

		if ( ! empty( $entry['css'] ) && is_array( $entry['css'] ) ) {
			foreach ( $entry['css'] as $idx => $css_file ) {
				$css_rel  = ltrim( (string) $css_file, '/' );
				$css_path = NEXUS_LS_PLUGIN_DIR . 'assets/admin/' . $css_rel;
				$css_ver  = file_exists( $css_path ) ? (string) filemtime( $css_path ) : NEXUS_LS_VERSION;

				wp_enqueue_style(
					'nexus-ls-admin-' . absint( $idx ),
					esc_url( NEXUS_LS_PLUGIN_URL . 'assets/admin/' . $css_rel ),
					array(),
					$css_ver
				);
			}
		}

		$js_rel  = ltrim( (string) $entry['file'], '/' );
		$js_path = NEXUS_LS_PLUGIN_DIR . 'assets/admin/' . $js_rel;
		$js_ver  = file_exists( $js_path ) ? (string) filemtime( $js_path ) : NEXUS_LS_VERSION;

		wp_enqueue_script(
			'nexus-ls-admin',
			esc_url( NEXUS_LS_PLUGIN_URL . 'assets/admin/' . $js_rel ),
			array(),
			$js_ver,
			true
		);

		wp_set_script_translations( 'nexus-ls-admin', 'nexus-lead-suite', NEXUS_LS_PLUGIN_DIR . 'languages' );

		// Resolve initial route from current page query param.
		$submenu_routes = $this->get_submenu_routes();
		$current_page   = isset( $_GET['page'] ) ? sanitize_text_field( wp_unslash( $_GET['page'] ) ) : self::MENU_SLUG; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$initial_route  = $submenu_routes[ $current_page ] ?? 'activities';

		// Build admin page URLs for React sidebar navigation.
		$admin_pages = array();
		foreach ( $submenu_routes as $slug => $route ) {
			$admin_pages[ $route ] = esc_url_raw( admin_url( 'admin.php?page=' . $slug ) );
		}

		wp_localize_script(
			'nexus-ls-admin',
				'nexusLsAdmin',
				array(
					'restUrl'           => esc_url_raw( rest_url() ),
					'nonce'             => wp_create_nonce( 'wp_rest' ),
					'adminAjaxUrl'      => esc_url_raw( admin_url( 'admin-ajax.php' ) ),
					'popupPreviewNonce' => wp_create_nonce( 'nexus_ls_popup_preview' ),
					'pluginUrl'         => esc_url_raw( NEXUS_LS_PLUGIN_URL ),
					'siteUrl'           => esc_url_raw( home_url( '/' ) ),
					'siteTitle'         => get_bloginfo( 'name' ),
					'formsPayload'      => $this->get_forms_payload_for_boot(),
					'initialRoute'      => $initial_route,
					'adminPages'        => $admin_pages,
				)
		);

		// Enhance Livechat "Button 01 → Popup" dropdown: include Form Builder forms as selectable items.
		// The bundled admin UI currently shows only popups; selecting a form stores "popup:form:{id}".
		wp_add_inline_script(
			'nexus-ls-admin',
			'(function(){' .
			'"use strict";' .
			'function getForms(){try{var p=window.nexusLsAdmin&&window.nexusLsAdmin.formsPayload;var f=p&&Array.isArray(p.forms)?p.forms:[];return f.map(function(x){return {id:String(x.id||\"\").trim(),name:String(x.name||\"\").trim()};}).filter(function(x){return x.id;});}catch(e){return [];}}' .
			'function isChatButtonsPopupSelect(sel){if(!sel||sel.tagName!==\"SELECT\")return false;var opt0=sel.querySelector(\"option\");if(!opt0)return false;return (opt0.textContent||\"\").toLowerCase().indexOf(\"select a popup\")!==-1;}' .
			'function inject(sel){if(!isChatButtonsPopupSelect(sel))return; if(sel.__nexusFormsInjected)return; var forms=getForms(); if(!forms.length)return;' .
			// Only inject into the first chat-buttons select on the page (Button 01).
			'var wrap=sel.closest(\"div.p-5\"); if(!wrap)return; var label=wrap.querySelector(\"label\"); if(!label)return; var txt=(label.textContent||\"\").toLowerCase(); if(txt.indexOf(\"button 01\")===-1)return;' .
			// Add a visual separator (disabled option) once.
			'var hasSep=false; Array.prototype.slice.call(sel.options).forEach(function(o){if(o && o.disabled && (o.value||\"\")===\"__forms__\") hasSep=true;});' .
			'if(!hasSep){var sep=document.createElement(\"option\"); sep.value=\"__forms__\"; sep.disabled=true; sep.textContent=\"— Forms —\"; sel.appendChild(sep);} ' .
			// Append forms.
			'forms.forEach(function(f){var v=\"form:\"+f.id; for(var i=0;i<sel.options.length;i++){if(sel.options[i] && sel.options[i].value===v) return;} var o=document.createElement(\"option\"); o.value=v; o.textContent=(f.name?f.name:f.id); sel.appendChild(o);});' .
			'sel.__nexusFormsInjected=true;}' .
			'function scan(root){var r=root||document; var sels=r.querySelectorAll(\"select\"); for(var i=0;i<sels.length;i++){inject(sels[i]);}}' .
			'scan(document);' .
			'var mo=new MutationObserver(function(muts){muts.forEach(function(m){if(m.addedNodes){for(var i=0;i<m.addedNodes.length;i++){var n=m.addedNodes[i]; if(n&&n.nodeType===1){scan(n);}}}});});' .
			'mo.observe(document.documentElement,{childList:true,subtree:true});' .
			'})();',
			'after'
		);
	}

	/**
	 * Returns decoded forms payload for instant boot.
	 *
	 * @return array<string,mixed>
	 */
	private function get_forms_payload_for_boot(): array {
		$raw = get_option( 'step_forms_builder_v0', '' );

		return Forms_Payload_Codec::decode_mixed_for_scan( $raw );
	}

	/**
	 * Reads Vite manifest.json.
	 *
	 * @return array<string, mixed>|WP_Error
	 */
	private function read_vite_manifest() {
		$path = NEXUS_LS_PLUGIN_DIR . 'assets/admin/.vite/manifest.json';
		if ( ! file_exists( $path ) ) {
			return new WP_Error( 'nexus_ls_manifest_missing', 'manifest missing' );
		}

		$raw = file_get_contents( $path );
		if ( false === $raw ) {
			return new WP_Error( 'nexus_ls_manifest_unreadable', 'manifest unreadable' );
		}

		$decoded = json_decode( $raw, true );
		if ( ! is_array( $decoded ) ) {
			return new WP_Error( 'nexus_ls_manifest_invalid', 'manifest invalid' );
		}

		return $decoded;
	}

	/**
	 * Enqueues assets via Vite dev server for live reload.
	 *
	 * @return void
	 */
	private function enqueue_vite_dev(): void {
		$origin = 'http://localhost:5173';

		// Vite client (HMR).
		wp_enqueue_script(
			'nexus-ls-vite-client',
			esc_url( $origin . '/@vite/client' ),
			array(),
			null,
			true
		);

		// Entry module.
		wp_enqueue_script(
			'nexus-ls-admin-dev',
			esc_url( $origin . '/src/main.jsx' ),
			array(),
			null,
			true
		);

		// Ensure script tags are output as type="module".
		add_filter(
			'script_loader_tag',
			static function ( string $tag, string $handle, string $src ): string {
				if ( 'nexus-ls-vite-client' !== $handle && 'nexus-ls-admin-dev' !== $handle ) {
					return $tag;
				}

				return sprintf(
					'<script type="module" src="%s"></script>',
					esc_url( $src )
				);
			},
			10,
			3
		);
	}
}

