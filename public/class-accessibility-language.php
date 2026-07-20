<?php
/**
 * Frontend Accessibility widget + GTranslate-style language switcher.
 *
 * @package nexulesuite_
 */

declare(strict_types=1);

namespace nexulesuite_\Public;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Enqueues and boots Accessibility & Language tools on the public site.
 */
final class Accessibility_Language {

	public const OPTION_KEY = 'nexulesuite_a11y_lang_v1';

	/**
	 * Hooks.
	 *
	 * @return void
	 */
	public function register_hooks(): void {
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_assets' ), 40 );
		add_action( 'wp_enqueue_scripts', array( $this, 'print_early_translate_css' ), 1 );
		add_action( 'wp_footer', array( $this, 'render_markup' ), 40 );
	}

	/**
	 * Hide Google Translate chrome before it paints (reduces layout flicker).
	 *
	 * @return void
	 */
	public function print_early_translate_css(): void {
		if ( is_admin() ) {
			return;
		}
		$settings = self::get_settings();
		if ( empty( $settings['languageEnabled'] ) ) {
			return;
		}

		/*
		 * Attached to the plugin's own registered stylesheet rather than printed as a raw
		 * <style> tag, so it goes through the core enqueue pipeline while still landing in
		 * wp_head() early enough to prevent the Google Translate banner from flashing.
		 */
		if ( ! wp_style_is( 'nexulesuite_a11y-anti-flicker', 'registered' ) ) {
			wp_register_style( 'nexulesuite_a11y-anti-flicker', false, array(), nexulesuite_VERSION ); // phpcs:ignore WordPress.WP.EnqueuedResourceParameters.NotInFooter
		}
		wp_enqueue_style( 'nexulesuite_a11y-anti-flicker' );
		wp_add_inline_style( 'nexulesuite_a11y-anti-flicker', '.goog-te-banner-frame,iframe.goog-te-banner-frame,body>.skiptranslate:not(#nexulesuite_a11y-root):not(.nexulesuite_gt-host),.goog-te-spinner-pos{display:none!important;visibility:hidden!important;height:0!important}html.translated-ltr,html.translated-rtl{margin-top:0!important}body{top:0!important;position:static!important}html.translated-ltr font,html.translated-rtl font{background:transparent!important;box-shadow:none!important}#nexulesuite_a11y-root{display:block!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important;overflow:visible!important}.nexulesuite_a11y-dock{display:block!important;visibility:visible!important;opacity:1!important;overflow:visible!important}.nexulesuite_a11y-fab,.nexulesuite_a11y-lang-btn{display:flex!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important;aspect-ratio:1/1!important;border-radius:50%!important;box-sizing:border-box!important;padding:0!important}' );
	}

	/**
	 * Default settings.
	 *
	 * @return array<string, mixed>
	 */
	public static function defaults(): array {
		return array(
			'accessibilityEnabled'    => false,
			'languageEnabled'         => false,
			'liveChatInDock'          => true,
			'liveChatButtonImage'     => '',
			'liveChatButtonBg'        => '#2563eb',
			'liveChatButtonText'      => '#ffffff',
			'liveChatButtonIconSize'  => 22,
			'customButtonEnabled'     => false,
			'customButtonUrl'         => '',
			'customButtonLabel'       => 'Custom',
			'customButtonIcon'        => 'link',
			'customButtonBg'          => '#2563eb',
			'customButtonText'        => '#ffffff',
			'customButtonOpenNewTab'  => true,
			'dockButtonOrder'         => array( 'custom', 'chat', 'language', 'accessibility' ),
			'dockButtonConditions'    => array(
				'custom'         => array( 'match' => 'any', 'rules' => array() ),
				'chat'           => array( 'match' => 'any', 'rules' => array() ),
				'language'       => array( 'match' => 'any', 'rules' => array() ),
				'accessibility'  => array( 'match' => 'any', 'rules' => array() ),
			),
			'dockButtonOffsets'       => array(
				'custom'         => array( 'x' => 0, 'y' => 0 ),
				'chat'           => array( 'x' => 0, 'y' => 0 ),
				'language'       => array( 'x' => 0, 'y' => 0 ),
				'accessibility'  => array( 'x' => 0, 'y' => 0 ),
			),
			'buttonPosition'          => 'right',
			'buttonOffsetX'           => 0,
			'buttonOffsetY'           => 0,
			'buttonOffsetUnit'        => 'px',
			'buttonSize'              => 52,
			'buttonIconSize'          => 26,
			'buttonGap'               => 10,
			'accessibilityButtonBg'   => '#0f766e',
			'accessibilityButtonText' => '#ffffff',
			'languageButtonBg'        => '#0f766e',
			'languageButtonText'      => '#ffffff',
			'defaultLanguage'         => 'en',
			'languages'               => array( 'en', 'bn', 'hi', 'ar', 'es', 'fr', 'de', 'zh-CN', 'ja', 'ko' ),
		);
	}

	/**
	 * Supported languages (code => label + flag ISO).
	 *
	 * @return array<string, array{label: string, flag: string}>
	 */
	public static function language_catalog(): array {
		return array(
			'en'    => array( 'label' => 'English', 'flag' => 'us' ),
			'bn'    => array( 'label' => 'Bangla', 'flag' => 'bd' ),
			'hi'    => array( 'label' => 'Hindi', 'flag' => 'in' ),
			'ar'    => array( 'label' => 'Arabic', 'flag' => 'sa' ),
			'es'    => array( 'label' => 'Spanish', 'flag' => 'es' ),
			'fr'    => array( 'label' => 'French', 'flag' => 'fr' ),
			'de'    => array( 'label' => 'German', 'flag' => 'de' ),
			'it'    => array( 'label' => 'Italian', 'flag' => 'it' ),
			'pt'    => array( 'label' => 'Portuguese', 'flag' => 'pt' ),
			'ru'    => array( 'label' => 'Russian', 'flag' => 'ru' ),
			'zh-CN' => array( 'label' => 'Chinese', 'flag' => 'cn' ),
			'ja'    => array( 'label' => 'Japanese', 'flag' => 'jp' ),
			'ko'    => array( 'label' => 'Korean', 'flag' => 'kr' ),
			'tr'    => array( 'label' => 'Turkish', 'flag' => 'tr' ),
			'nl'    => array( 'label' => 'Dutch', 'flag' => 'nl' ),
			'pl'    => array( 'label' => 'Polish', 'flag' => 'pl' ),
			'th'    => array( 'label' => 'Thai', 'flag' => 'th' ),
			'vi'    => array( 'label' => 'Vietnamese', 'flag' => 'vn' ),
			'id'    => array( 'label' => 'Indonesian', 'flag' => 'id' ),
			'ms'    => array( 'label' => 'Malay', 'flag' => 'my' ),
			'ur'    => array( 'label' => 'Urdu', 'flag' => 'pk' ),
			'fa'    => array( 'label' => 'Persian', 'flag' => 'ir' ),
			'sw'    => array( 'label' => 'Swahili', 'flag' => 'ke' ),
		);
	}

	/**
	 * Sanitized settings from option.
	 *
	 * @return array<string, mixed>
	 */
	public static function get_settings(): array {
		$raw = get_option( self::OPTION_KEY, array() );
		if ( ! is_array( $raw ) ) {
			$raw = array();
		}
		return self::sanitize( $raw );
	}

	/**
	 * Sanitize settings payload.
	 *
	 * @param array<string, mixed> $input Input.
	 * @return array<string, mixed>
	 */
	public static function sanitize( array $input ): array {
		$defaults = self::defaults();
		$catalog  = self::language_catalog();
		$langs_in = isset( $input['languages'] ) && is_array( $input['languages'] ) ? $input['languages'] : $defaults['languages'];
		$langs    = array();
		foreach ( $langs_in as $code ) {
			$code = sanitize_text_field( (string) $code );
			if ( isset( $catalog[ $code ] ) && ! in_array( $code, $langs, true ) ) {
				$langs[] = $code;
			}
		}
		if ( empty( $langs ) ) {
			$langs = $defaults['languages'];
		}

		$pos = sanitize_text_field( (string) ( $input['buttonPosition'] ?? $defaults['buttonPosition'] ) );
		if ( ! in_array( $pos, array( 'left', 'right', 'center' ), true ) ) {
			$pos = 'right';
		}

		$button_size = max( 0, min( 100, (int) ( $input['buttonSize'] ?? $defaults['buttonSize'] ) ) );
		$icon_size   = isset( $input['buttonIconSize'] )
			? max( 0, min( 100, (int) $input['buttonIconSize'] ) )
			: max( 0, min( 100, (int) round( $button_size * 0.5 ) ) );
		$button_gap  = max( 0, min( 100, (int) ( $input['buttonGap'] ?? $defaults['buttonGap'] ) ) );
		$offset_x    = max( -2000, min( 2000, (int) ( $input['buttonOffsetX'] ?? $defaults['buttonOffsetX'] ) ) );
		$offset_y    = max( -2000, min( 2000, (int) ( $input['buttonOffsetY'] ?? $defaults['buttonOffsetY'] ) ) );
		$offset_unit = sanitize_text_field( (string) ( $input['buttonOffsetUnit'] ?? $defaults['buttonOffsetUnit'] ) );
		if ( ! in_array( $offset_unit, array( 'px', 'em' ), true ) ) {
			$offset_unit = 'px';
		}

		$default_lang = sanitize_text_field( (string) ( $input['defaultLanguage'] ?? $defaults['defaultLanguage'] ) );
		if ( ! isset( $catalog[ $default_lang ] ) ) {
			$default_lang = 'en';
		}
		if ( ! in_array( $default_lang, $langs, true ) ) {
			$langs[] = $default_lang;
		}

		$a11y_bg   = sanitize_hex_color( (string) ( $input['accessibilityButtonBg'] ?? $defaults['accessibilityButtonBg'] ) );
		$a11y_text = sanitize_hex_color( (string) ( $input['accessibilityButtonText'] ?? $defaults['accessibilityButtonText'] ) );
		$lang_bg   = sanitize_hex_color( (string) ( $input['languageButtonBg'] ?? $defaults['languageButtonBg'] ) );
		$lang_text = sanitize_hex_color( (string) ( $input['languageButtonText'] ?? $defaults['languageButtonText'] ) );
		$custom_bg = sanitize_hex_color( (string) ( $input['customButtonBg'] ?? $defaults['customButtonBg'] ) );
		$custom_tx = sanitize_hex_color( (string) ( $input['customButtonText'] ?? $defaults['customButtonText'] ) );
		$chat_bg   = sanitize_hex_color( (string) ( $input['liveChatButtonBg'] ?? $defaults['liveChatButtonBg'] ) );
		$chat_tx   = sanitize_hex_color( (string) ( $input['liveChatButtonText'] ?? $defaults['liveChatButtonText'] ) );
		$chat_icon = max( 14, min( 40, (int) ( $input['liveChatButtonIconSize'] ?? $defaults['liveChatButtonIconSize'] ) ) );
		$chat_img  = self::sanitize_button_image( (string) ( $input['liveChatButtonImage'] ?? '' ) );

		$custom_url = esc_url_raw( trim( (string) ( $input['customButtonUrl'] ?? '' ) ) );
		$custom_lbl = sanitize_text_field( (string) ( $input['customButtonLabel'] ?? $defaults['customButtonLabel'] ) );
		if ( '' === $custom_lbl ) {
			$custom_lbl = (string) $defaults['customButtonLabel'];
		}
		$custom_icon = sanitize_text_field( (string) ( $input['customButtonIcon'] ?? $defaults['customButtonIcon'] ) );
		$icon_allow  = array_keys( self::custom_button_icons() );
		if ( ! in_array( $custom_icon, $icon_allow, true ) ) {
			$custom_icon = (string) $defaults['customButtonIcon'];
		}
		$dock_order   = self::sanitize_dock_button_order( $input['dockButtonOrder'] ?? $defaults['dockButtonOrder'] );
		$dock_conds   = self::sanitize_dock_button_conditions( $input['dockButtonConditions'] ?? $defaults['dockButtonConditions'] );
		$dock_offsets = self::sanitize_dock_button_offsets(
			$input['dockButtonOffsets'] ?? null,
			$offset_x,
			$offset_y
		);
		// Keep legacy globals in sync with the Accessibility button offset.
		$offset_x = (int) $dock_offsets['accessibility']['x'];
		$offset_y = (int) $dock_offsets['accessibility']['y'];

		return array(
			'accessibilityEnabled'    => ! empty( $input['accessibilityEnabled'] ),
			'languageEnabled'         => ! empty( $input['languageEnabled'] ),
			'liveChatInDock'          => ! isset( $input['liveChatInDock'] ) ? true : ! empty( $input['liveChatInDock'] ),
			'liveChatButtonImage'     => $chat_img,
			'liveChatButtonBg'        => $chat_bg ? $chat_bg : $defaults['liveChatButtonBg'],
			'liveChatButtonText'      => $chat_tx ? $chat_tx : $defaults['liveChatButtonText'],
			'liveChatButtonIconSize'  => $chat_icon,
			'customButtonEnabled'     => ! empty( $input['customButtonEnabled'] ),
			'customButtonUrl'         => $custom_url,
			'customButtonLabel'       => $custom_lbl,
			'customButtonIcon'        => $custom_icon,
			'customButtonBg'          => $custom_bg ? $custom_bg : $defaults['customButtonBg'],
			'customButtonText'        => $custom_tx ? $custom_tx : $defaults['customButtonText'],
			'customButtonOpenNewTab'  => ! empty( $input['customButtonOpenNewTab'] ),
			'dockButtonOrder'         => $dock_order,
			'dockButtonConditions'    => $dock_conds,
			'dockButtonOffsets'       => $dock_offsets,
			'buttonPosition'          => $pos,
			'buttonOffsetX'           => $offset_x,
			'buttonOffsetY'           => $offset_y,
			'buttonOffsetUnit'        => $offset_unit,
			'buttonSize'              => $button_size,
			'buttonIconSize'          => $icon_size,
			'buttonGap'               => $button_gap,
			'accessibilityButtonBg'   => $a11y_bg ? $a11y_bg : $defaults['accessibilityButtonBg'],
			'accessibilityButtonText' => $a11y_text ? $a11y_text : $defaults['accessibilityButtonText'],
			'languageButtonBg'        => $lang_bg ? $lang_bg : $defaults['languageButtonBg'],
			'languageButtonText'      => $lang_text ? $lang_text : $defaults['languageButtonText'],
			'defaultLanguage'         => $default_lang,
			'languages'               => array_values( $langs ),
		);
	}

	/**
	 * Allowed dock button order keys (top → bottom).
	 *
	 * @return list<string>
	 */
	public static function dock_button_keys(): array {
		return array( 'custom', 'chat', 'language', 'accessibility' );
	}

	/**
	 * Default empty conditions (show on every page).
	 *
	 * @return array{match:string,rules:array<int,array<string,mixed>>}
	 */
	public static function empty_display_conditions(): array {
		return array(
			'match' => 'any',
			'rules' => array(),
		);
	}

	/**
	 * Sanitize per-button offset map.
	 *
	 * @param mixed $raw       Raw map.
	 * @param int   $fallback_x Legacy global X.
	 * @param int   $fallback_y Legacy global Y.
	 * @return array<string,array{x:int,y:int}>
	 */
	public static function sanitize_dock_button_offsets( $raw, int $fallback_x = 0, int $fallback_y = 0 ): array {
		$fallback_x = max( -2000, min( 2000, $fallback_x ) );
		$fallback_y = max( -2000, min( 2000, $fallback_y ) );
		$raw        = is_array( $raw ) ? $raw : array();
		$out        = array();

		foreach ( self::dock_button_keys() as $key ) {
			$item = isset( $raw[ $key ] ) && is_array( $raw[ $key ] ) ? $raw[ $key ] : array();
			$x    = isset( $item['x'] ) ? (int) $item['x'] : $fallback_x;
			$y    = isset( $item['y'] ) ? (int) $item['y'] : $fallback_y;
			$out[ $key ] = array(
				'x' => max( -2000, min( 2000, $x ) ),
				'y' => max( -2000, min( 2000, $y ) ),
			);
		}

		return $out;
	}

	/**
	 * Sanitize per-button display conditions map.
	 *
	 * @param mixed $raw Raw map.
	 * @return array<string,array{match:string,rules:array<int,array<string,mixed>>}>
	 */
	public static function sanitize_dock_button_conditions( $raw ): array {
		$out = array();
		$raw = is_array( $raw ) ? $raw : array();
		foreach ( self::dock_button_keys() as $key ) {
			$item = isset( $raw[ $key ] ) && is_array( $raw[ $key ] ) ? $raw[ $key ] : array();
			$out[ $key ] = self::sanitize_display_conditions( $item );
		}
		return $out;
	}

	/**
	 * Sanitize a single conditions payload (same shape as menu groups).
	 *
	 * @param array<string,mixed> $conditions Conditions.
	 * @return array{match:string,rules:array<int,array<string,mixed>>}
	 */
	public static function sanitize_display_conditions( array $conditions ): array {
		$match = isset( $conditions['match'] ) ? sanitize_key( (string) $conditions['match'] ) : 'any';
		if ( 'all' !== $match ) {
			$match = 'any';
		}

		$rules_in = isset( $conditions['rules'] ) && is_array( $conditions['rules'] )
			? $conditions['rules']
			: array();
		$allowed = array( 'all', 'homepage', 'page', 'post', 'post_type', 'category', 'tag', 'custom_link' );
		$rules   = array();

		foreach ( $rules_in as $rule ) {
			if ( ! is_array( $rule ) ) {
				continue;
			}
			$type = isset( $rule['type'] ) ? sanitize_key( (string) $rule['type'] ) : '';
			if ( ! in_array( $type, $allowed, true ) ) {
				continue;
			}
			$clean = array( 'type' => $type );
			if ( in_array( $type, array( 'page', 'post', 'category', 'tag' ), true ) ) {
				$ids          = isset( $rule['ids'] ) && is_array( $rule['ids'] ) ? $rule['ids'] : array();
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
				$slugs       = isset( $rule['slugs'] ) && is_array( $rule['slugs'] ) ? $rule['slugs'] : array();
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
			$rules[] = $clean;
		}

		return array(
			'match' => $match,
			'rules' => $rules,
		);
	}

	/**
	 * Which dock buttons match the current front-end request.
	 *
	 * @param array<string,mixed>|null $settings Settings (defaults to stored).
	 * @return array<string,bool>
	 */
	public static function dock_button_visibility( ?array $settings = null ): array {
		$settings = is_array( $settings ) ? $settings : self::get_settings();
		$conds = isset( $settings['dockButtonConditions'] ) && is_array( $settings['dockButtonConditions'] )
			? $settings['dockButtonConditions']
			: array();

		if ( ! class_exists( \nexulesuite_\Core\Menu_Group_Resolver::class ) ) {
			require_once nexulesuite_PLUGIN_DIR . 'core/class-menu-group-resolver.php';
		}

		$resolver = new \nexulesuite_\Core\Menu_Group_Resolver();
		$out      = array();
		foreach ( self::dock_button_keys() as $key ) {
			$item        = isset( $conds[ $key ] ) && is_array( $conds[ $key ] ) ? $conds[ $key ] : self::empty_display_conditions();
			$out[ $key ] = $resolver->group_matches( $item );
		}
		return $out;
	}

	/**
	 * Sanitize dock button order list.
	 *
	 * @param mixed $raw Raw order.
	 * @return list<string>
	 */
	public static function sanitize_dock_button_order( $raw ): array {
		$allowed = self::dock_button_keys();
		$out     = array();
		if ( is_array( $raw ) ) {
			foreach ( $raw as $key ) {
				$key = sanitize_text_field( (string) $key );
				if ( in_array( $key, $allowed, true ) && ! in_array( $key, $out, true ) ) {
					$out[] = $key;
				}
			}
		}
		foreach ( $allowed as $key ) {
			if ( ! in_array( $key, $out, true ) ) {
				$out[] = $key;
			}
		}
		return $out;
	}

	/**
	 * Allowed custom dock button icons (key => admin label).
	 *
	 * @return array<string, string>
	 */
	public static function custom_button_icons(): array {
		return array(
			'link'        => 'Link',
			'call'        => 'Call / Phone',
			'mail'        => 'Email',
			'message'     => 'Message',
			'location'    => 'Location',
			'appointment' => 'Appointment',
			'download'    => 'Download',
			'popup'       => 'Target / Focus',
			'cta'         => 'CTA / Click',
			'event'       => 'Notification',
			'arrow'       => 'Arrow',
			'globe'       => 'Website',
			'user'        => 'User / Account',
			'info'        => 'Info',
			'whatsapp'    => 'WhatsApp',
			'home'        => 'Home',
			'heart'       => 'Heart',
			'cart'        => 'Shop / Cart',
			'help'        => 'Help',
			'video'       => 'Video',
		);
	}

	/**
	 * Sanitize dock button image: HTTPS URL or small data URI.
	 *
	 * @param string $raw Raw value.
	 * @return string
	 */
	private static function sanitize_button_image( string $raw ): string {
		$raw = trim( $raw );
		if ( '' === $raw ) {
			return '';
		}
		if ( preg_match( '#^data:image/(jpeg|jpg|png|gif|webp);base64,#i', $raw ) ) {
			return strlen( $raw ) > 524288 ? '' : $raw;
		}

		return esc_url_raw( $raw );
	}

	/**
	 * Enqueue frontend assets when features are on.
	 *
	 * @return void
	 */
	public function enqueue_assets(): void {
		if ( is_admin() ) {
			return;
		}

		$settings = self::get_settings();
		$general  = get_option( 'nexulesuite_general_settings_v1', array() );
		if ( ! is_array( $general ) ) {
			$general = array();
		}
		$livechat_on   = ! empty( $general['enableLivechat'] );
		$livechat_dock = $livechat_on && ! empty( $settings['liveChatInDock'] );
		if ( empty( $settings['accessibilityEnabled'] ) && empty( $settings['languageEnabled'] ) && ! $livechat_dock ) {
			return;
		}

		$ver = defined( 'nexulesuite_VERSION' ) ? nexulesuite_VERSION : '1.0.0';

		wp_enqueue_style(
			'nexulesuite_a11y-lang',
			nexulesuite_PLUGIN_URL . 'public/css/accessibility-language.css',
			array(),
			$ver
		);

		/*
		 * The dyslexia-friendly reading mode renders in Lexend. The font file ships in
		 * assets/fonts/ and is declared locally — no third-party request is made.
		 */
		if ( ! empty( $settings['accessibilityEnabled'] ) ) {
			require_once nexulesuite_PLUGIN_DIR . 'core/class-global-font.php';
			$lexend_css = \nexulesuite_\Core\Global_Font::get_font_face_css( 'Lexend' );
			if ( '' !== $lexend_css ) {
				wp_add_inline_style( 'nexulesuite_a11y-lang', $lexend_css );
			}
		}

		wp_enqueue_script(
			'nexulesuite_a11y-lang',
			nexulesuite_PLUGIN_URL . 'public/js/accessibility-language.js',
			array(),
			$ver,
			true
		);

		$catalog = self::language_catalog();
		$langs   = array();
		foreach ( $settings['languages'] as $code ) {
			if ( ! isset( $catalog[ $code ] ) ) {
				continue;
			}
			$langs[] = array(
				'code'  => $code,
				'label' => $catalog[ $code ]['label'],
				'flag'  => $catalog[ $code ]['flag'],
			);
		}

		wp_localize_script(
			'nexulesuite_a11y-lang',
			'nexulesuite_A11yLang',
			array(
				'accessibilityEnabled'    => (bool) $settings['accessibilityEnabled'],
				'languageEnabled'         => (bool) $settings['languageEnabled'],
				'liveChatInDock'          => (bool) $settings['liveChatInDock'],
				'liveChatAvailable'       => $livechat_on,
				'liveChatButtonImage'     => (string) $settings['liveChatButtonImage'],
				'liveChatButtonBg'        => (string) $settings['liveChatButtonBg'],
				'liveChatButtonText'      => (string) $settings['liveChatButtonText'],
				'liveChatButtonIconSize'  => (int) $settings['liveChatButtonIconSize'],
				'customButtonEnabled'     => (bool) $settings['customButtonEnabled'],
				'customButtonUrl'         => (string) $settings['customButtonUrl'],
				'customButtonLabel'       => (string) $settings['customButtonLabel'],
				'customButtonIcon'        => (string) $settings['customButtonIcon'],
				'customButtonBg'          => (string) $settings['customButtonBg'],
				'customButtonText'        => (string) $settings['customButtonText'],
				'customButtonOpenNewTab'  => (bool) $settings['customButtonOpenNewTab'],
				'dockButtonOrder'         => array_values( (array) $settings['dockButtonOrder'] ),
				'dockButtonConditions'    => $settings['dockButtonConditions'],
				'dockButtonOffsets'       => $settings['dockButtonOffsets'],
				'dockButtonVisible'       => self::dock_button_visibility( $settings ),
				'buttonPosition'          => (string) $settings['buttonPosition'],
				'buttonOffsetX'           => (int) $settings['buttonOffsetX'],
				'buttonOffsetY'           => (int) $settings['buttonOffsetY'],
				'buttonOffsetUnit'        => (string) $settings['buttonOffsetUnit'],
				'buttonSize'              => (int) $settings['buttonSize'],
				'buttonIconSize'          => (int) $settings['buttonIconSize'],
				'buttonGap'               => (int) $settings['buttonGap'],
				'accessibilityButtonBg'   => (string) $settings['accessibilityButtonBg'],
				'accessibilityButtonText' => (string) $settings['accessibilityButtonText'],
				'languageButtonBg'        => (string) $settings['languageButtonBg'],
				'languageButtonText'      => (string) $settings['languageButtonText'],
				'defaultLanguage'         => (string) $settings['defaultLanguage'],
				'languages'               => $langs,
				'icons'                   => array(
					'accessibility' => nexulesuite_PLUGIN_URL . 'public/images/accessibility-icon.png',
					'translate'     => nexulesuite_PLUGIN_URL . 'public/images/translate-icon.png',
				),
				'i18n'                    => array(
					'accessibility'   => __( 'Accessibility', 'nexus-lead-suite' ),
					'openPanel'       => __( 'Open accessibility options', 'nexus-lead-suite' ),
					'closePanel'      => __( 'Close accessibility options', 'nexus-lead-suite' ),
					'textSize'        => __( 'Text Size', 'nexus-lead-suite' ),
					'increase'        => __( 'Increase', 'nexus-lead-suite' ),
					'decrease'        => __( 'Decrease', 'nexus-lead-suite' ),
					'contrast'        => __( 'Color Contrast', 'nexus-lead-suite' ),
					'highContrast'    => __( 'High Contrast', 'nexus-lead-suite' ),
					'invert'          => __( 'Invert Colors', 'nexus-lead-suite' ),
					'darkMode'        => __( 'Dark Mode', 'nexus-lead-suite' ),
					'grayscale'       => __( 'Grayscale', 'nexus-lead-suite' ),
					'dyslexia'        => __( 'Dyslexia Friendly Font', 'nexus-lead-suite' ),
					'highlightLinks'  => __( 'Highlight Links', 'nexus-lead-suite' ),
					'pauseAnimations' => __( 'Pause Animations', 'nexus-lead-suite' ),
					'bigCursor'       => __( 'Bigger Cursor', 'nexus-lead-suite' ),
					'spacing'         => __( 'Line & Word Spacing', 'nexus-lead-suite' ),
					'tts'             => __( 'Text to Speech', 'nexus-lead-suite' ),
					'ttsHint'         => __( 'Select text, then press Speak', 'nexus-lead-suite' ),
					'speak'           => __( 'Speak', 'nexus-lead-suite' ),
					'stop'            => __( 'Stop', 'nexus-lead-suite' ),
					'readingMask'     => __( 'Reading Mask', 'nexus-lead-suite' ),
					'focusIndicator'  => __( 'Focus Indicator', 'nexus-lead-suite' ),
					'reset'           => __( 'Reset All', 'nexus-lead-suite' ),
					'languages'       => __( 'Languages', 'nexus-lead-suite' ),
					'language'        => __( 'Language', 'nexus-lead-suite' ),
					'selectLanguage'  => __( 'Select language', 'nexus-lead-suite' ),
					'liveChat'        => __( 'Live chat', 'nexus-lead-suite' ),
					'openChat'        => __( 'Open chat', 'nexus-lead-suite' ),
					'customButton'    => __( 'Custom link', 'nexus-lead-suite' ),
				),
			)
		);

		if ( ! empty( $settings['languageEnabled'] ) ) {
			wp_enqueue_script(
				'nexulesuite_google-translate',
				'https://translate.google.com/translate_a/element.js?cb=nexulesuite_googleTranslateInit',
				array( 'nexulesuite_a11y-lang' ),
				// phpcs:ignore WordPress.WP.EnqueuedResourceParameters.MissingVersion -- third-party CDN asset; Google versions the loader itself and an extra ?ver= is not ours to set.
				null,
				true
			);
		}
	}

	/**
	 * Footer mount points (hidden Google Translate host).
	 *
	 * @return void
	 */
	public function render_markup(): void {
		if ( is_admin() ) {
			return;
		}

		$settings = self::get_settings();
		$general  = get_option( 'nexulesuite_general_settings_v1', array() );
		if ( ! is_array( $general ) ) {
			$general = array();
		}
		$livechat_dock = ! empty( $general['enableLivechat'] ) && ! empty( $settings['liveChatInDock'] );
		if ( empty( $settings['accessibilityEnabled'] ) && empty( $settings['languageEnabled'] ) && ! $livechat_dock ) {
			return;
		}

		echo '<div id="nexulesuite_a11y-root" class="nexulesuite_a11y-root skiptranslate" translate="no" aria-live="polite"></div>';
		if ( ! empty( $settings['languageEnabled'] ) ) {
			echo '<div id="nexulesuite_google_translate_element" class="nexulesuite_gt-host skiptranslate" translate="no" aria-hidden="true"></div>';
		}
	}
}
