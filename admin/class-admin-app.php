<?php
/**
 * Admin SPA loader (menu + asset enqueue).
 *
 * @package nexulesuite_
 */

declare(strict_types=1);

namespace nexulesuite_\Admin;

use nexulesuite_\Forms_Payload_Codec;
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
		add_action( 'admin_menu', array( $this, 'reorder_submenu' ), 999 );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_assets' ) );
		add_action( 'wp_ajax_nexulesuite_popup_preview', array( $this, 'ajax_popup_preview' ) );
	}

	/**
	 * Returns submenu slug → React route map.
	 *
	 * @return array<string, string>
	 */
	private function get_submenu_routes(): array {
		// Parent slug lands on Forms. Legacy sub-slugs keep their routes for bookmarks.
		return array(
			self::MENU_SLUG                   => 'form-builder',
			self::MENU_SLUG . '-analytics'    => 'activities',
			self::MENU_SLUG . '-forms'        => 'form-builder',
			self::MENU_SLUG . '-templates'    => 'form-templates',
			self::MENU_SLUG . '-submissions'  => 'form-submissions',
			self::MENU_SLUG . '-popups'       => 'popups',
			self::MENU_SLUG . '-menus'        => 'menu-items',
			self::MENU_SLUG . '-emails'       => 'emails',
			self::MENU_SLUG . '-accessibility'=> 'accessibility',
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
			self::MENU_SLUG . '-analytics'     => __( 'Analytics', 'nexus-lead-suite' ),
			self::MENU_SLUG                    => __( 'Forms', 'nexus-lead-suite' ),
			self::MENU_SLUG . '-popups'        => __( 'Popups', 'nexus-lead-suite' ),
			self::MENU_SLUG . '-menus'         => __( 'Smart Buttons', 'nexus-lead-suite' ),
			self::MENU_SLUG . '-emails'        => __( 'Email', 'nexus-lead-suite' ),
			self::MENU_SLUG . '-accessibility' => __( 'Acc & Lang', 'nexus-lead-suite' ),
			self::MENU_SLUG . '-settings'      => __( 'Settings', 'nexus-lead-suite' ),
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

		/* Forms children live in the React sidebar only (not as WP top-level peers). */
		$hidden_form_pages = array(
			self::MENU_SLUG . '-forms'       => __( 'Forms', 'nexus-lead-suite' ),
			self::MENU_SLUG . '-templates'   => __( 'Templates', 'nexus-lead-suite' ),
			self::MENU_SLUG . '-submissions' => __( 'Submissions', 'nexus-lead-suite' ),
		);
		foreach ( $hidden_form_pages as $slug => $label ) {
			add_submenu_page(
				null,
				$label . ' — ' . __( 'Nexus Lead Suite', 'nexus-lead-suite' ),
				$label,
				'manage_options',
				$slug,
				array( $this, 'render_app' )
			);
		}
	}

	/**
	 * Forces WP admin submenu order (parent slug otherwise always stays first).
	 *
	 * @return void
	 */
	public function reorder_submenu(): void {
		global $submenu;

		if ( ! isset( $submenu[ self::MENU_SLUG ] ) || ! is_array( $submenu[ self::MENU_SLUG ] ) ) {
			return;
		}

		$desired = array(
			self::MENU_SLUG . '-analytics',
			self::MENU_SLUG,
			self::MENU_SLUG . '-popups',
			self::MENU_SLUG . '-menus',
			self::MENU_SLUG . '-emails',
			self::MENU_SLUG . '-accessibility',
			self::MENU_SLUG . '-settings',
		);

		$by_slug = array();
		foreach ( $submenu[ self::MENU_SLUG ] as $item ) {
			if ( ! is_array( $item ) || ! isset( $item[2] ) ) {
				continue;
			}
			$by_slug[ (string) $item[2] ] = $item;
		}

		$ordered = array();
		foreach ( $desired as $slug ) {
			if ( isset( $by_slug[ $slug ] ) ) {
				$ordered[] = $by_slug[ $slug ];
				unset( $by_slug[ $slug ] );
			}
		}
		foreach ( $by_slug as $item ) {
			$ordered[] = $item;
		}

		$submenu[ self::MENU_SLUG ] = $ordered;
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

		// Note: WP admin's .wrap applies max-width constraints; our SPA needs full width.
		echo '<div id="nexulesuite_admin-root"></div>';
	}

	/**
	 * Admin-ajax: expands popup body shortcodes for the Pop-Up Simulator (not REST_REQUEST).
	 *
	 * @return void
	 */
	public function ajax_popup_preview(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => __( 'Forbidden.', 'nexus-lead-suite' ) ), 403 );
			return;
		}

		if ( ! check_ajax_referer( 'nexulesuite_popup_preview', 'nonce', false ) ) {
			wp_send_json_error( array( 'message' => __( 'Invalid or expired session. Reload the page.', 'nexus-lead-suite' ) ), 403 );
			return;
		}

		// Nonce verified above. Sanitised with wp_kses_post(), which drops <script>,
		// <style>, event handlers and any other unsafe markup before the preview is built.
		$content = isset( $_POST['content'] ) ? wp_kses_post( wp_unslash( (string) $_POST['content'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Missing -- nonce verified above.

		$data = \nexulesuite_\build_popup_preview_payload( $content );

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
		$this->enqueue_admin_chrome_styles();
		$this->enqueue_admin_global_font();
		$this->maybe_enqueue_popup_simulator_form_styles( $page );

		// Google Fonts <link>s (ours and other plugins', e.g. Elementor) are render-blocking:
		// if fonts.googleapis.com stalls, the whole admin page stays white until the request
		// times out. On our SPA pages, swap them to non-blocking (print → all on load).
		add_filter( 'style_loader_tag', array( $this, 'make_google_fonts_non_blocking' ), 10, 4 );

		// Popups Main Heading Editor uses TinyMCE; stray #mce-modal-blocker overlays are
		// neutralized in wp-admin-chrome.css and purged from assets/admin/js/main.js.
		wp_enqueue_script( 'wp-tinymce' );

		// Command Palette (Sprint 1): depend on core's `wp-commands` when it exists
		// (WordPress 7.0+) so the SPA can register Nexus commands into the native
		// Cmd/Ctrl+K palette. Added conditionally so older cores still load the app.
		$admin_script_deps = array( 'wp-tinymce' );
		if ( wp_script_is( 'wp-commands', 'registered' ) ) {
			$admin_script_deps[] = 'wp-commands';
		}

		// Dev mode (optional): define('nexulesuite_VITE_DEV', true) in wp-config.php.
		if ( defined( 'nexulesuite_VITE_DEV' ) && nexulesuite_VITE_DEV ) {
			$this->enqueue_vite_dev();
			return;
		}

		$manifest = $this->read_vite_manifest();
		if ( is_wp_error( $manifest ) ) {
			$fallback_css_path = nexulesuite_PLUGIN_DIR . 'assets/admin/css/main.css';
			$fallback_js_path  = nexulesuite_PLUGIN_DIR . 'assets/admin/js/main.js';
			$fallback_css_ver  = file_exists( $fallback_css_path ) ? (string) filemtime( $fallback_css_path ) : nexulesuite_VERSION;
			$fallback_js_ver   = file_exists( $fallback_js_path ) ? (string) filemtime( $fallback_js_path ) : nexulesuite_VERSION;

			wp_enqueue_style(
				'nexulesuite_admin-fallback',
				esc_url( nexulesuite_PLUGIN_URL . 'assets/admin/css/main.css' ),
				array(),
				$fallback_css_ver
			);

			$fui_css_path = nexulesuite_PLUGIN_DIR . 'assets/admin/css/form-builder-fui.css';
			if ( file_exists( $fui_css_path ) ) {
				wp_enqueue_style(
					'nexulesuite_admin-form-builder-fui',
					esc_url( nexulesuite_PLUGIN_URL . 'assets/admin/css/form-builder-fui.css' ),
					array( 'nexulesuite_admin-fallback' ),
					(string) filemtime( $fui_css_path )
				);
			}

			$range_css_path = nexulesuite_PLUGIN_DIR . 'assets/admin/css/range-slider.css';
			if ( file_exists( $range_css_path ) ) {
				wp_enqueue_style(
					'nexulesuite_admin-range-slider',
					esc_url( nexulesuite_PLUGIN_URL . 'assets/admin/css/range-slider.css' ),
					array( 'nexulesuite_admin-fallback' ),
					(string) filemtime( $range_css_path )
				);
			}

			wp_enqueue_script(
				'nexulesuite_admin-fallback',
				esc_url( nexulesuite_PLUGIN_URL . 'assets/admin/js/main.js' ),
				$admin_script_deps,
				$fallback_js_ver,
				true
			);

			$this->localize_admin_script( 'nexulesuite_admin-fallback' );
			$this->append_email_templates_rest_patch( 'nexulesuite_admin-fallback' );

			return;
		}

		$entry = $manifest['src/main.jsx'] ?? null;
		if ( ! is_array( $entry ) || empty( $entry['file'] ) ) {
			return;
		}

		$css_files = array();
		if ( ! empty( $entry['css'] ) && is_array( $entry['css'] ) ) {
			$css_files = $entry['css'];
		} elseif ( isset( $manifest['style.css']['file'] ) && is_string( $manifest['style.css']['file'] ) ) {
			// IIFE builds emit CSS as a separate manifest chunk without linking it on the JS entry.
			$css_files = array( $manifest['style.css']['file'] );
		} else {
			$css_files = array( 'css/main.css' );
		}

		foreach ( $css_files as $idx => $css_file ) {
			$css_rel  = ltrim( (string) $css_file, '/' );
			$css_path = nexulesuite_PLUGIN_DIR . 'assets/admin/' . $css_rel;
			if ( ! file_exists( $css_path ) ) {
				continue;
			}
			$css_ver = (string) filemtime( $css_path );

			wp_enqueue_style(
				'nexulesuite_admin-' . absint( $idx ),
				esc_url( nexulesuite_PLUGIN_URL . 'assets/admin/' . $css_rel ),
				array(),
				$css_ver
			);
		}

		$fui_css_path = nexulesuite_PLUGIN_DIR . 'assets/admin/css/form-builder-fui.css';
		if ( file_exists( $fui_css_path ) ) {
			wp_enqueue_style(
				'nexulesuite_admin-form-builder-fui',
				esc_url( nexulesuite_PLUGIN_URL . 'assets/admin/css/form-builder-fui.css' ),
				array( 'nexulesuite_admin-0' ),
				(string) filemtime( $fui_css_path )
			);
		}

		$range_css_path = nexulesuite_PLUGIN_DIR . 'assets/admin/css/range-slider.css';
		if ( file_exists( $range_css_path ) ) {
			wp_enqueue_style(
				'nexulesuite_admin-range-slider',
				esc_url( nexulesuite_PLUGIN_URL . 'assets/admin/css/range-slider.css' ),
				array( 'nexulesuite_admin-0' ),
				(string) filemtime( $range_css_path )
			);
		}

		$js_rel  = ltrim( (string) $entry['file'], '/' );
		$js_path = nexulesuite_PLUGIN_DIR . 'assets/admin/' . $js_rel;
		$js_ver  = file_exists( $js_path ) ? (string) filemtime( $js_path ) : nexulesuite_VERSION;

		wp_enqueue_script(
			'nexulesuite_admin',
			esc_url( nexulesuite_PLUGIN_URL . 'assets/admin/' . $js_rel ),
			$admin_script_deps,
			$js_ver,
			true
		);

		wp_set_script_translations( 'nexulesuite_admin', 'nexus-lead-suite', nexulesuite_PLUGIN_DIR . 'languages' );

		// Resolve initial route from current page query param.
		$submenu_routes = $this->get_submenu_routes();
		$current_page   = isset( $_GET['page'] ) ? sanitize_text_field( wp_unslash( $_GET['page'] ) ) : self::MENU_SLUG; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$initial_route  = $submenu_routes[ $current_page ] ?? 'form-builder';

		// Build admin page URLs for React sidebar navigation.
		$admin_pages = array();
		foreach ( $submenu_routes as $slug => $route ) {
			$admin_pages[ $route ] = esc_url_raw( admin_url( 'admin.php?page=' . $slug ) );
		}

		$this->localize_admin_script( 'nexulesuite_admin', $initial_route, $admin_pages );
		$this->append_email_templates_rest_patch( 'nexulesuite_admin' );

		// Enhance Livechat "Button 01 → Popup" dropdown: include Form Builder forms as selectable items.
		// The bundled admin UI currently shows only popups; selecting a form stores "popup:form:{id}".
		wp_add_inline_script(
			'nexulesuite_admin',
			'(function(){' .
			'"use strict";' .
			'function getForms(){try{var p=window.nexulesuite_Admin&&window.nexulesuite_Admin.formsPayload;var f=p&&Array.isArray(p.forms)?p.forms:[];return f.map(function(x){return {id:String(x.id||"").trim(),name:String(x.name||"").trim()};}).filter(function(x){return x.id;});}catch(e){return [];}}' .
			'function isChatButtonsPopupSelect(sel){if(!sel||sel.tagName!=="SELECT")return false;var opt0=sel.querySelector("option");if(!opt0)return false;return (opt0.textContent||"").toLowerCase().indexOf("select a popup")!==-1;}' .
			'function inject(sel){if(!isChatButtonsPopupSelect(sel))return; if(sel.__nexulesuite_FormsInjected)return; var forms=getForms(); if(!forms.length)return;' .
			// Only inject into the first chat-buttons select on the page (Button 01).
			'var wrap=sel.closest("div.p-5"); if(!wrap)return; var label=wrap.querySelector("label"); if(!label)return; var txt=(label.textContent||"").toLowerCase(); if(txt.indexOf("button 01")===-1)return;' .
			// Add a visual separator (disabled option) once.
			'var hasSep=false; Array.prototype.slice.call(sel.options).forEach(function(o){if(o && o.disabled && (o.value||"")==="__forms__") hasSep=true;});' .
			'if(!hasSep){var sep=document.createElement("option"); sep.value="__forms__"; sep.disabled=true; sep.textContent="— Forms —"; sel.appendChild(sep);} ' .
			// Append forms.
			'forms.forEach(function(f){var v="form:"+f.id; for(var i=0;i<sel.options.length;i++){if(sel.options[i] && sel.options[i].value===v) return;} var o=document.createElement("option"); o.value=v; o.textContent=(f.name?f.name:f.id); sel.appendChild(o);});' .
			'sel.__nexulesuite_FormsInjected=true;}' .
			'function scan(root){var r=root||document; var sels=r.querySelectorAll("select"); for(var i=0;i<sels.length;i++){inject(sels[i]);}}' .
			'scan(document);' .
			'var mo=new MutationObserver(function(muts){muts.forEach(function(m){if(m.addedNodes){for(var i=0;i<m.addedNodes.length;i++){var n=m.addedNodes[i]; if(n&&n.nodeType===1){scan(n);}}}});});' .
			'mo.observe(document.documentElement,{childList:true,subtree:true});' .
			'})();',
			'after'
		);
	}

	/**
	 * Enqueues the saved global font for the admin SPA.
	 *
	 * @return void
	 */
	private function enqueue_admin_global_font(): void {
		require_once nexulesuite_PLUGIN_DIR . 'core/class-global-font.php';
		\nexulesuite_\Core\Global_Font::enqueue( 'nexulesuite_global-font' );

		// Font picker previews each family in its own typeface, so the admin screens
		// declare every bundled face. All files are served from this plugin folder.
		wp_add_inline_style(
			'nexulesuite_global-font',
			\nexulesuite_\Core\Global_Font::get_all_font_faces_css()
		);
	}

	/**
	 * Rewrites Google Fonts stylesheet tags to load without blocking rendering.
	 *
	 * Loads with media="print" (non-blocking) and swaps to the real media once the
	 * stylesheet arrives, so a slow/unreachable fonts CDN can never white-screen
	 * the admin SPA. System font fallbacks apply until then.
	 *
	 * @param string $tag    Link tag HTML.
	 * @param string $handle Style handle.
	 * @param string $href   Stylesheet URL.
	 * @param string $media  Media attribute value.
	 * @return string
	 */
	public function make_google_fonts_non_blocking( string $tag, string $handle, string $href, string $media ): string {
		if ( ! $this->style_render_blocks_on_google_fonts( $href ) ) {
			return $tag;
		}
		if ( false !== strpos( $tag, 'onload=' ) ) {
			return $tag;
		}

		$media  = '' !== $media ? $media : 'all';
		$search = "media='" . $media . "'";
		if ( false === strpos( $tag, $search ) ) {
			return $tag;
		}

		return str_replace(
			$search,
			"media='print' onload=\"this.onload=null;this.media='" . esc_attr( $media ) . "'\"",
			$tag
		);
	}

	/**
	 * Whether a stylesheet URL render-blocks on fonts.googleapis.com.
	 *
	 * Direct Google Fonts URLs qualify, and so do local stylesheets that start
	 * with an `@import url(https://fonts.googleapis.com/...)` (e.g. astra-sites'
	 * zip-ai sidebar CSS) — a <link> only counts as loaded once its imports
	 * resolve, so those block rendering just the same.
	 *
	 * @param string $href Stylesheet URL.
	 * @return bool
	 */
	private function style_render_blocks_on_google_fonts( string $href ): bool {
		if ( false !== strpos( $href, 'fonts.googleapis.com' ) ) {
			return true;
		}

		// Map local wp-content URLs to file paths; skip anything else.
		$content_url = content_url();
		if ( 0 !== strpos( $href, $content_url ) ) {
			return false;
		}

		$rel  = wp_parse_url( substr( $href, strlen( $content_url ) ), PHP_URL_PATH );
		$path = WP_CONTENT_DIR . $rel;
		if ( ! is_string( $rel ) || '' === $rel || ! file_exists( $path ) ) {
			return false;
		}

		static $cache = array();
		if ( ! array_key_exists( $path, $cache ) ) {
			$head           = (string) file_get_contents( $path, false, null, 0, 512 ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents -- local file head read.
			$cache[ $path ] = false !== strpos( $head, '@import' ) && false !== strpos( $head, 'fonts.googleapis.com' );
		}

		return $cache[ $path ];
	}

	/**
	 * Removes default WP admin content padding so the SPA sits flush against the menu.
	 *
	 * @return void
	 */
	private function enqueue_admin_chrome_styles(): void {
		$path = nexulesuite_PLUGIN_DIR . 'assets/admin/css/wp-admin-chrome.css';
		$ver  = file_exists( $path ) ? (string) filemtime( $path ) : nexulesuite_VERSION;

		wp_enqueue_style(
			'nexulesuite_admin-chrome',
			esc_url( nexulesuite_PLUGIN_URL . 'assets/admin/css/wp-admin-chrome.css' ),
			array(),
			$ver
		);
	}

	/**
	 * Localizes admin script globals for the React SPA.
	 *
	 * @param string               $handle        Script handle.
	 * @param string               $initial_route Optional initial route.
	 * @param array<string,string> $admin_pages   Optional admin page URLs.
	 * @return void
	 */
	private function localize_admin_script( string $handle, string $initial_route = 'form-builder', array $admin_pages = array() ): void {
		if ( array() === $admin_pages ) {
			$submenu_routes = $this->get_submenu_routes();
			// phpcs:ignore WordPress.Security.NonceVerification.Recommended
			$current_page  = isset( $_GET['page'] ) ? sanitize_text_field( wp_unslash( (string) $_GET['page'] ) ) : self::MENU_SLUG;
			$initial_route = $submenu_routes[ $current_page ] ?? 'form-builder';
			foreach ( $submenu_routes as $slug => $route ) {
				$admin_pages[ $route ] = esc_url_raw( admin_url( 'admin.php?page=' . $slug ) );
			}
		}

		require_once nexulesuite_PLUGIN_DIR . 'core/class-global-font.php';
		$global_font     = \nexulesuite_\Core\Global_Font::get_saved_font();
		$global_weights  = \nexulesuite_\Core\Global_Font::get_weights_for_font( $global_font );
		$global_appearance = get_option( 'nexulesuite_global_appearance_v1', array() );
		$global_appearance_styling = array();
		if ( is_array( $global_appearance ) ) {
			if ( isset( $global_appearance['styling'] ) && is_array( $global_appearance['styling'] ) ) {
				$global_appearance_styling = $global_appearance['styling'];
			} elseif ( $global_appearance ) {
				$global_appearance_styling = $global_appearance;
			}
		}

		wp_localize_script(
			$handle,
			'nexulesuite_Admin',
			array(
				'restUrl'           => esc_url_raw( rest_url() ),
				'nonce'             => wp_create_nonce( 'wp_rest' ),
				'adminAjaxUrl'      => esc_url_raw( admin_url( 'admin-ajax.php' ) ),
				'popupPreviewNonce' => wp_create_nonce( 'nexulesuite_popup_preview' ),
				'pluginUrl'         => esc_url_raw( nexulesuite_PLUGIN_URL ),
				'pluginVersion'     => nexulesuite_VERSION,
				'siteUrl'           => esc_url_raw( home_url( '/' ) ),
				'siteTitle'         => get_bloginfo( 'name' ),
				'formsPayload'      => $this->get_forms_payload_for_boot(),
				'initialRoute'      => $initial_route,
				'adminPages'        => $admin_pages,
				'globalFont'        => $global_font,
				'globalFontWeights' => $global_weights,
				'globalAppearance'  => array(
					'styling'   => $global_appearance_styling,
					'updatedAt' => is_array( $global_appearance ) && isset( $global_appearance['updatedAt'] ) ? (string) $global_appearance['updatedAt'] : '',
				),
			)
		);
	}

	/**
	 * Enqueues front-end form CSS for the Pop-Up Simulator preview (popups admin only).
	 *
	 * @param string $page Admin page slug from {@see $_GET['page']}.
	 * @return void
	 */
	private function maybe_enqueue_popup_simulator_form_styles( string $page ): void {
		$submenu_routes = $this->get_submenu_routes();
		if ( ( $submenu_routes[ $page ] ?? '' ) !== 'popups' ) {
			return;
		}

		$forms_css_path = nexulesuite_PLUGIN_DIR . 'public/css/forms-runtime.css';
		if ( ! file_exists( $forms_css_path ) ) {
			return;
		}

		wp_enqueue_style(
			'nexulesuite_forms-runtime-preview',
			esc_url( nexulesuite_PLUGIN_URL . 'public/css/forms-runtime.css' ),
			array(),
			(string) filemtime( $forms_css_path )
		);
	}

	/**
	 * Patches fetch() so email template saves use a canonical REST URL and base64 HTML bodies (avoids WAF/HTML blocks).
	 *
	 * @param string $handle Script handle to attach the patch before.
	 * @return void
	 */
	private function append_email_templates_rest_patch( string $handle ): void {
		wp_add_inline_script(
			$handle,
			'(function(){' .
			'"use strict";' .
			'if(window.__nexulesuite_EmailTemplatesFetchPatch){return;}' .
			'window.__nexulesuite_EmailTemplatesFetchPatch=true;' .
			'var nativeFetch=window.fetch.bind(window);' .
			'function restBase(){var raw=(window.nexulesuite_Admin&&window.nexulesuite_Admin.restUrl)||"/wp-json/";return raw.replace(/\\/?$/,"/");}' .
			'function templatesUrl(){return restBase()+"nexulesuite_/v1/emails/templates";}' .
			'function encodeUtf8Base64(value){var bytes=new TextEncoder().encode(String(value||""));var binary="";for(var i=0;i<bytes.length;i++){binary+=String.fromCharCode(bytes[i]);}return btoa(binary);}' .
			'window.fetch=function(input,init){' .
			'var url=typeof input==="string"?input:(input&&input.url)||"";' .
			'var method=(init&&init.method)||"GET";' .
			'var nextInit=init;' .
			'var nextUrl=url;' .
			'if(url.indexOf("emails/templates")!==-1){nextUrl=templatesUrl();' .
			'if(method.toUpperCase()==="POST"&&init&&typeof init.body==="string"){' .
			'try{var parsed=JSON.parse(init.body);' .
			'if(parsed&&Array.isArray(parsed.templates)&&parsed.contentEncoding!=="base64"){' .
			'parsed.contentEncoding="base64";' .
			'parsed.templates=parsed.templates.map(function(tpl){' .
			'var copy={};for(var k in tpl){if(Object.prototype.hasOwnProperty.call(tpl,k)){copy[k]=tpl[k];}}' .
			'copy.content=encodeUtf8Base64(tpl.content||"");return copy;});' .
			'nextInit=Object.assign({},init,{body:JSON.stringify(parsed)});' .
			'}}catch(e){}}}' .
			'if(typeof input==="string"){return nativeFetch(nextUrl,nextInit);}' .
			'return nativeFetch(input,nextInit);' .
			'};' .
			'})();',
			'before'
		);
	}

	/**
	 * Returns decoded forms payload for instant boot.
	 *
	 * @return array<string,mixed>
	 */
	private function get_forms_payload_for_boot(): array {
		$raw = get_option( 'nexulesuite_forms_builder_v0', null );
		if ( null === $raw ) {
			$raw = get_option( 'step_forms_builder_v0', '' );
		}

		return Forms_Payload_Codec::decode_mixed_for_scan( $raw );
	}

	/**
	 * Reads Vite manifest.json.
	 *
	 * @return array<string, mixed>|WP_Error
	 */
	private function read_vite_manifest() {
		$path = nexulesuite_PLUGIN_DIR . 'assets/admin/vite-manifest.json';
		if ( ! file_exists( $path ) ) {
			return new WP_Error( 'nexulesuite_manifest_missing', 'manifest missing' );
		}

		$raw = file_get_contents( $path );
		if ( false === $raw ) {
			return new WP_Error( 'nexulesuite_manifest_unreadable', 'manifest unreadable' );
		}

		$decoded = json_decode( $raw, true );
		if ( ! is_array( $decoded ) ) {
			return new WP_Error( 'nexulesuite_manifest_invalid', 'manifest invalid' );
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
			'nexulesuite_vite-client',
			esc_url( $origin . '/@vite/client' ),
			array(),
			nexulesuite_VERSION,
			true
		);

		// Entry module.
		wp_enqueue_script(
			'nexulesuite_admin-dev',
			esc_url( $origin . '/src/main.jsx' ),
			array(),
			nexulesuite_VERSION,
			true
		);

		// Ensure script tags are output as type="module".
		add_filter(
			'script_loader_tag',
			static function ( string $tag, string $handle, string $src ): string {
				if ( 'nexulesuite_vite-client' !== $handle && 'nexulesuite_admin-dev' !== $handle ) {
					return $tag;
				}

				if ( false !== strpos( $tag, 'type=' ) ) {
					return $tag;
				}

				return str_replace( ' src=', ' type="module" src=', $tag );
			},
			10,
			3
		);
	}
}

