<?php
/**
 * Sends activity notification emails after tracked interactions.
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
 * Centralizes outbound mail for activity events (uses wp_mail + SMTP Mailer hooks).
 */
final class Activity_Notifier {

	/**
	 * Event types that trigger an email after recording.
	 */
	public const EMAIL_EVENT_TYPES = array(
		'footer_click',
		'click_link',
		'click_phone',
		'click_mailto',
		'popup_open',
		'trigger_notify',
	);

	private const EMAIL_TEMPLATES_OPTION_KEY = 'nexulesuite_email_templates_v1';

	private const GENERAL_SETTINGS_OPTION_KEY = 'nexulesuite_general_settings_v1';

	/**
	 * Whether this event type + meta should send email.
	 *
	 * @param string               $event_type Event slug.
	 * @param array<string,mixed>  $meta       Sanitized meta.
	 * @return bool
	 */
	public static function should_notify( string $event_type, array $meta = array() ): bool {
		$event_type = sanitize_key( $event_type );
		if ( ! in_array( $event_type, self::EMAIL_EVENT_TYPES, true ) ) {
			return false;
		}

		if ( 'popup_open' === $event_type ) {
			$open_source = isset( $meta['open_source'] ) ? sanitize_key( (string) $meta['open_source'] ) : '';
			if ( 'auto' === $open_source ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Sends notification email for an activity event.
	 *
	 * @param string               $event_type Event slug.
	 * @param string               $target_key Target key.
	 * @param string               $page_url   Page URL.
	 * @param array<string,mixed>  $meta       Sanitized meta.
	 * @return bool True when wp_mail reports success.
	 */
	public static function send_for_event( string $event_type, string $target_key, string $page_url, array $meta = array() ): bool {
		if ( ! self::should_notify( $event_type, $meta ) ) {
			return false;
		}

		$templates = self::read_email_templates_from_storage();
		$general   = get_option( self::GENERAL_SETTINGS_OPTION_KEY, array() );
		$sel_id    = is_array( $general ) ? sanitize_text_field( (string) ( $general['selectedEmailTemplate'] ?? '' ) ) : '';
		$event_tpl = self::find_email_template_by_id( $templates, $sel_id );
		if ( ! is_array( $event_tpl ) ) {
			$event_tpl = self::find_first_email_template_with_html( $templates );
		}

		$recipients = self::collect_recipients_from_template( $event_tpl );
		if ( empty( $recipients ) ) {
			$recipients = self::collect_union_recipients_from_templates( $templates );
		}
		if ( empty( $recipients ) ) {
			$admin = (string) get_option( 'admin_email' );
			if ( $admin && is_email( $admin ) ) {
				$recipients[] = $admin;
			}
		}

		if ( empty( $recipients ) ) {
			return false;
		}

		$context   = self::build_merge_context( $event_type, $target_key, $page_url, $meta );
		$site_name = (string) get_bloginfo( 'name' );
		$sent      = false;

		try {
			$html_body = self::get_email_template_html_body( $event_tpl );
			if ( is_array( $event_tpl ) && '' !== trim( $html_body ) ) {
				$subject = isset( $event_tpl['subject'] ) ? (string) $event_tpl['subject'] : '';
				if ( '' === trim( $subject ) ) {
					$subject = sprintf( '[%s] %s', $site_name, $context['purpose'] );
				}
				$subject   = self::apply_activity_merge_tags( $subject, $context );
				$html_body = self::apply_activity_merge_tags( $html_body, $context );
				$headers   = array(
					'MIME-Version: 1.0',
					'Content-Type: text/html; charset=UTF-8',
				);
				$sent = (bool) wp_mail( $recipients, $subject, $html_body, $headers );
			} else {
				$subject = sprintf( '[%s] %s', $site_name, $context['purpose'] );
				$message = sprintf(
					"A visitor action was recorded on your website.\n\nEvent: %s\nLabel: %s\nPage: %s\nTime: %s\n",
					$context['event_type'],
					$context['btn_name'],
					$context['page_url'],
					current_time( 'mysql' )
				);
				$sent = (bool) wp_mail( $recipients, $subject, $message );
			}
		} catch ( \Throwable $e ) {
			$sent = false;
		}

		return $sent;
	}

	/**
	 * @param string               $event_type Event slug.
	 * @param string               $target_key Target key.
	 * @param string               $page_url   Page URL.
	 * @param array<string,mixed>  $meta       Meta.
	 * @return array<string,string>
	 */
	private static function build_merge_context( string $event_type, string $target_key, string $page_url, array $meta ): array {
		$label = isset( $meta['label'] ) ? sanitize_text_field( (string) $meta['label'] ) : '';
		$href  = isset( $meta['href'] ) ? esc_url_raw( (string) $meta['href'] ) : '';

		if ( 'trigger_notify' === $event_type ) {
			$trigger_id   = $target_key;
			$notify_label = isset( $meta['notify_label'] ) ? sanitize_text_field( (string) $meta['notify_label'] ) : $label;
			$btn          = '' !== $notify_label ? $notify_label : $trigger_id;
			$purpose      = '' !== $notify_label ? $notify_label : $trigger_id;
		} elseif ( 'popup_open' === $event_type ) {
			$popup_event  = isset( $meta['popup_event'] ) ? sanitize_text_field( (string) $meta['popup_event'] ) : $target_key;
			$trigger_id   = $popup_event;
			$notify_label = $label;
			$btn          = '' !== $label ? $label : $popup_event;
			$purpose      = '' !== $label ? $label : $popup_event;
		} else {
			$trigger_id   = $target_key;
			$notify_label = $label;
			$btn          = '' !== $label ? $label : ( '' !== $href ? $href : self::default_purpose_for_type( $event_type ) );
			$purpose      = $btn;
		}

		return array(
			'event_type'   => sanitize_key( $event_type ),
			'trigger_id'   => $trigger_id,
			'notify_label' => $notify_label,
			'btn_name'     => $btn,
			'purpose'      => $purpose,
			'page_url'     => $page_url,
			'href'         => $href,
		);
	}

	/**
	 * @param string $event_type Event slug.
	 * @return string
	 */
	private static function default_purpose_for_type( string $event_type ): string {
		switch ( $event_type ) {
			case 'footer_click':
				return __( 'Footer click', 'nexus-lead-suite' );
			case 'click_phone':
				return __( 'Phone tap', 'nexus-lead-suite' );
			case 'click_mailto':
				return __( 'Email tap', 'nexus-lead-suite' );
			default:
				return __( 'Site interaction', 'nexus-lead-suite' );
		}
	}

	/**
	 * @param string              $text    Subject or HTML body.
	 * @param array<string,string> $context Merge context.
	 * @return string
	 */
	private static function apply_activity_merge_tags( string $text, array $context ): string {
		$site_name = wp_strip_all_tags( (string) get_bloginfo( 'name' ) );
		$ts        = wp_date( 'M j, Y g:i A', current_time( 'timestamp' ) );
		$dash      = '—';
		$home      = home_url( '/' );
		$page      = '' !== $context['page_url'] ? $context['page_url'] : $home;

		$pairs = array(
			'{btnName}'       => esc_html( $context['btn_name'] ),
			'{eventId}'       => esc_html( $context['trigger_id'] ),
			'{purpose}'       => esc_html( $context['purpose'] ),
			'{dateTime}'      => esc_html( $ts ),
			'{year}'          => esc_html( (string) gmdate( 'Y' ) ),
			'{siteName}'      => esc_html( $site_name ),
			'{siteUrl}'       => esc_url( $home ),
			'{pageUrl}'       => esc_url( $page ),
			'{userName}'      => esc_html( $dash ),
			'{userEmail}'     => esc_html( $dash ),
			'{ipAddress}'     => esc_html( $dash ),
			'{userLocation}'  => esc_html( $dash ),
			'{formName}'      => esc_html( self::form_name_for_event_type( $context['event_type'] ) ),
			'{stepNo}'        => esc_html( '1' ),
		);

		foreach ( $pairs as $needle => $repl ) {
			if ( false !== strpos( $text, $needle ) ) {
				$text = str_replace( $needle, $repl, $text );
			}
		}

		$text = str_replace( array( '{appointmentDate}', '{reference}' ), '', $text );

		return $text;
	}

	/**
	 * @param string $event_type Event slug.
	 * @return string
	 */
	private static function form_name_for_event_type( string $event_type ): string {
		switch ( $event_type ) {
			case 'trigger_notify':
				return __( 'Trigger notification', 'nexus-lead-suite' );
			case 'popup_open':
				return __( 'Popup opened', 'nexus-lead-suite' );
			case 'footer_click':
				return __( 'Footer click', 'nexus-lead-suite' );
			case 'click_phone':
				return __( 'Phone tap', 'nexus-lead-suite' );
			case 'click_mailto':
				return __( 'Email tap', 'nexus-lead-suite' );
			default:
				return __( 'Site interaction', 'nexus-lead-suite' );
		}
	}

	/**
	 * @return array<int,mixed>
	 */
	private static function read_email_templates_from_storage(): array {
		$templates = get_option( self::EMAIL_TEMPLATES_OPTION_KEY, null );
		if ( null === $templates ) {
			$templates = get_option( 'nexulesuite_email_templates', array() );
		}

		return is_array( $templates ) ? $templates : array();
	}

	/**
	 * @param array<string,mixed>|null $tpl Template or null.
	 * @return array<int,string>
	 */
	private static function collect_recipients_from_template( ?array $tpl ): array {
		if ( ! is_array( $tpl ) ) {
			return array();
		}

		$list = array();
		if ( isset( $tpl['recipients'] ) && is_array( $tpl['recipients'] ) ) {
			$list = $tpl['recipients'];
		} elseif ( isset( $tpl['emails'] ) ) {
			$split = preg_split( '/[\r\n,]+/', (string) $tpl['emails'] );
			$list  = is_array( $split ) ? $split : array();
		}

		$seen = array();
		$out  = array();
		foreach ( $list as $email ) {
			$email = sanitize_email( trim( (string) $email ) );
			if ( $email && is_email( $email ) && ! isset( $seen[ $email ] ) ) {
				$seen[ $email ] = true;
				$out[]          = $email;
			}
		}

		return $out;
	}

	/**
	 * @param array<int,mixed> $templates Templates payload.
	 * @return array<int,string>
	 */
	private static function collect_union_recipients_from_templates( array $templates ): array {
		$seen = array();
		$out  = array();
		foreach ( $templates as $tpl ) {
			if ( ! is_array( $tpl ) ) {
				continue;
			}
			foreach ( self::collect_recipients_from_template( $tpl ) as $email ) {
				if ( ! isset( $seen[ $email ] ) ) {
					$seen[ $email ] = true;
					$out[]          = $email;
				}
			}
		}

		return $out;
	}

	/**
	 * @param array<int,mixed> $templates Templates.
	 * @param string           $id        Template id.
	 * @return array<string,mixed>|null
	 */
	private static function find_email_template_by_id( array $templates, string $id ): ?array {
		if ( '' === $id ) {
			return null;
		}
		foreach ( $templates as $tpl ) {
			if ( ! is_array( $tpl ) ) {
				continue;
			}
			$tid = isset( $tpl['id'] ) ? (string) $tpl['id'] : '';
			if ( $tid === $id ) {
				return $tpl;
			}
		}

		return null;
	}

	/**
	 * @param array<string,mixed>|null $tpl Template or null.
	 * @return string
	 */
	private static function get_email_template_html_body( ?array $tpl ): string {
		if ( ! is_array( $tpl ) ) {
			return '';
		}
		$html = isset( $tpl['content'] ) ? (string) $tpl['content'] : '';
		if ( '' === trim( $html ) && isset( $tpl['contents'] ) ) {
			$html = (string) $tpl['contents'];
		}

		return $html;
	}

	/**
	 * @param array<int,mixed> $templates Templates.
	 * @return array<string,mixed>|null
	 */
	private static function find_first_email_template_with_html( array $templates ): ?array {
		foreach ( $templates as $tpl ) {
			if ( ! is_array( $tpl ) ) {
				continue;
			}
			if ( '' !== trim( self::get_email_template_html_body( $tpl ) ) ) {
				return $tpl;
			}
		}

		return null;
	}
}
