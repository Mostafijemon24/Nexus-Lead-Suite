<?php
/**
 * Activity log: forms, popup UX, clicks, scroll depth, exit intent, triggers.
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
 * Activity log backed by {@see dbDelta()} table `*_nexulesuite_interactions`.
 */
final class Activities_Store {

	/**
	 * Event types accepted from the public REST batch tracker (must stay in sync with tracker JS).
	 */
	public const CLIENT_TRACK_TYPES = array(
		'scroll_depth',
		'exit_intent',
		'popup_open',
		'popup_close',
		'footer_click',
		'click_link',
		'click_phone',
		'click_mailto',
	);

	/**
	 * Qualified table name.
	 *
	 * @return string
	 */
	public static function table(): string {
		global $wpdb;

		return $wpdb->prefix . 'nexulesuite_interactions';
	}

	/**
	 * Generic insert used by REST tracking and internal loggers.
	 *
	 * @param string               $event_type    Short slug (column event_type).
	 * @param string               $target_key    Optional grouping key (max 191 chars).
	 * @param string               $page_url      Current page URL.
	 * @param array<string,mixed>  $meta          JSON-safe meta (sanitized by caller).
	 * @param string               $referrer_url  Optional referrer.
	 * @return void
	 */
	public static function record_interaction( string $event_type, string $target_key, string $page_url, array $meta = array(), string $referrer_url = '' ): void {
		global $wpdb;

		$event_type = sanitize_key( $event_type );
		if ( '' === $event_type ) {
			return;
		}

		$table = self::table();

		$wpdb->insert( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery -- custom activities table insert.
			$table,
			array(
				'session_key'   => '',
				'event_type'    => substr( $event_type, 0, 64 ),
				'target_key'    => substr( $target_key, 0, 191 ),
				'page_url'      => '' !== $page_url ? esc_url_raw( $page_url ) : '',
				'referrer_url'  => '' !== $referrer_url ? esc_url_raw( $referrer_url ) : '',
				'meta'          => wp_json_encode( $meta ),
				'ip_hash'       => hash( 'sha256', self::client_ip() ),
				'ua_hash'       => hash( 'sha256', isset( $_SERVER['HTTP_USER_AGENT'] ) ? sanitize_text_field( wp_unslash( (string) $_SERVER['HTTP_USER_AGENT'] ) ) : '' ),
				'created_at'    => current_time( 'mysql' ),
			),
			array( '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s' )
		);
	}

	/**
	 * Deletes all activity rows (admin-only operation, called from REST).
	 *
	 * @return int Number of deleted rows (best effort).
	 */
	public static function clear_all(): int {
		global $wpdb;

		$table = self::table();

		// TRUNCATE is faster but may require higher privileges; fallback to DELETE.
		// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared,WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching,PluginCheck.Security.DirectDB.UnescapedDBParameter -- table name from trusted prefix; admin-only purge.
		$deleted = $wpdb->query( "TRUNCATE TABLE {$table}" );
		if ( false === $deleted ) {
			// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared,WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching,PluginCheck.Security.DirectDB.UnescapedDBParameter -- table name from trusted prefix; admin-only purge.
			$deleted = $wpdb->query( "DELETE FROM {$table}" );
		}

		return is_int( $deleted ) ? $deleted : 0;
	}

	/**
	 * Records a normal or popup-embedded form submission after outbound mail attempt.
	 *
	 * @param string             $form_id       Form UUID/key.
	 * @param string             $form_name     Human-readable form title.
	 * @param string             $page_url      Submission page URL.
	 * @param array<int,string>  $summary_lines Lines shown in emails / summary.
	 * @param bool               $mail_sent     Whether wp_mail succeeded.
	 * @param string             $popup_event   Popup data-event id when submitted inside overlay (empty for inline/page forms).
	 * @return void
	 */
	public static function record_form_submission( string $form_id, string $form_name, string $page_url, array $summary_lines, bool $mail_sent, string $popup_event = '' ): void {
		$popup_event = sanitize_text_field( $popup_event );
		if ( strlen( $popup_event ) > 120 ) {
			$popup_event = substr( $popup_event, 0, 120 );
		}

		$type = '' !== $popup_event ? 'popup_form_submission' : 'form_submission';

		$meta = array(
			'form_name' => $form_name,
			'summary'   => implode( "\n", $summary_lines ),
			/* Store as int so DB/JSON decode never drops a boolean edge case. */
			'mail_sent' => $mail_sent ? 1 : 0,
		);
		if ( '' !== $popup_event ) {
			$meta['popup_event'] = $popup_event;
		}

		self::record_interaction(
			$type,
			substr( $form_id, 0, 191 ),
			$page_url,
			$meta,
			''
		);
	}

	/**
	 * Best-effort client IP for hashing (no forwarded headers).
	 *
	 * @return string
	 */
	private static function client_ip(): string {
		return isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( (string) $_SERVER['REMOTE_ADDR'] ) ) : '';
	}

	/** Max rows for PDF / bulk export (UI list still defaults to 500). */
	public const PDF_EXPORT_ROW_LIMIT = 100000;

	/**
	 * Fetches raw rows for reporting.
	 *
	 * @param string $tab       all|forms|calls|consultations|interactions.
	 * @param string $date_from Y-m-d or empty.
	 * @param string $date_to   Y-m-d or empty.
	 * @param string $search    Free-text filter.
	 * @param int    $limit     Max rows (UI default 500; pass {@see self::PDF_EXPORT_ROW_LIMIT} for full PDF exports).
	 * @return array<int,array<string,mixed>>
	 */
	public static function fetch_report_rows( string $tab, string $date_from, string $date_to, string $search, int $limit = 500 ): array {
		global $wpdb;

		$table = self::table();
		$limit = max( 1, min( self::PDF_EXPORT_ROW_LIMIT, $limit ) );
		$pieces = array( '1=1' );
		$params = array();

		if ( 'forms' === $tab ) {
			$pieces[] = $wpdb->prepare(
				'event_type IN (%s, %s)',
				'form_submission',
				'popup_form_submission'
			);
		} elseif ( 'calls' === $tab ) {
			$pieces[] = $wpdb->prepare(
				'event_type IN (%s, %s, %s)',
				'click_phone',
				'click_mailto',
				'trigger_notify'
			);
		} elseif ( 'consultations' === $tab ) {
			$pieces[] = $wpdb->prepare(
				'event_type IN (%s, %s)',
				'scroll_depth',
				'exit_intent'
			);
		} elseif ( 'interactions' === $tab ) {
			$pieces[] = $wpdb->prepare(
				'event_type IN (%s, %s, %s, %s)',
				'popup_open',
				'popup_close',
				'footer_click',
				'click_link'
			);
		}

		if ( preg_match( '/^\d{4}-\d{2}-\d{2}$/', $date_from ) ) {
			$pieces[] = 'DATE(created_at) >= %s';
			$params[] = $date_from;
		}
		if ( preg_match( '/^\d{4}-\d{2}-\d{2}$/', $date_to ) ) {
			$pieces[] = 'DATE(created_at) <= %s';
			$params[] = $date_to;
		}

		$search = trim( $search );
		if ( '' !== $search ) {
			$like     = '%' . $wpdb->esc_like( $search ) . '%';
			$pieces[] = '(target_key LIKE %s OR page_url LIKE %s OR meta LIKE %s OR event_type LIKE %s)';
			$params[] = $like;
			$params[] = $like;
			$params[] = $like;
			$params[] = $like;
		}

		$sql = "SELECT id, event_type, target_key, page_url, meta, created_at FROM {$table} WHERE "
			. implode( ' AND ', $pieces )
			. ' ORDER BY created_at DESC LIMIT %d';

		$params[] = $limit;

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching,WordPress.DB.PreparedSQL.NotPrepared,PluginCheck.Security.DirectDB.UnescapedDBParameter -- dynamic WHERE with placeholders; table from trusted prefix.
		$rows = $wpdb->get_results( $wpdb->prepare( $sql, ...$params ), ARRAY_A );

		return is_array( $rows ) ? $rows : array();
	}

	/**
	 * Maps DB row to Activities UI row shape.
	 *
	 * @param array<string,mixed> $row DB row.
	 * @return array<string,mixed>
	 */
	public static function map_db_row_to_activity( array $row ): array {
		$meta = array();
		if ( ! empty( $row['meta'] ) ) {
			$decoded = json_decode( (string) $row['meta'], true );
			$meta    = is_array( $decoded ) ? $decoded : array();
		}

		$etype = (string) ( $row['event_type'] ?? '' );

		$category      = __( 'Interactions', 'nexus-lead-suite' );
		$category_slug = 'interactions';
		$context       = '—';
		$action        = sanitize_text_field( $etype );
		$mail_sent     = null;
		$mail_status   = '—';

		switch ( $etype ) {
			case 'form_submission':
				$category      = __( 'Forms', 'nexus-lead-suite' );
				$category_slug = 'forms';
				$form_name     = isset( $meta['form_name'] ) ? sanitize_text_field( (string) $meta['form_name'] ) : '';
				$mail_sent     = self::meta_mail_sent_value( $meta );
				$summary       = isset( $meta['summary'] ) ? sanitize_textarea_field( (string) $meta['summary'] ) : '';
				$context       = self::truncate_ctx( $summary );
				$action        = '' !== $form_name
					? sprintf(
						/* translators: %s: form name */
						__( 'Form: %s', 'nexus-lead-suite' ),
						$form_name
					)
					: __( 'Form submission', 'nexus-lead-suite' );
				break;

			case 'popup_form_submission':
				$category      = __( 'Forms', 'nexus-lead-suite' );
				$category_slug = 'forms';
				$form_name     = isset( $meta['form_name'] ) ? sanitize_text_field( (string) $meta['form_name'] ) : '';
				$popup_ev      = isset( $meta['popup_event'] ) ? sanitize_text_field( (string) $meta['popup_event'] ) : '';
				$mail_sent     = self::meta_mail_sent_value( $meta );
				$summary       = isset( $meta['summary'] ) ? sanitize_textarea_field( (string) $meta['summary'] ) : '';
				$ctx_line      = '' !== $popup_ev
					? sprintf(
						/* translators: 1: popup id/event, 2: summary excerpt */
						__( 'Popup “%1$s”. %2$s', 'nexus-lead-suite' ),
						$popup_ev,
						$summary
					)
					: $summary;
				$context       = self::truncate_ctx( $ctx_line );
				$action        = '' !== $form_name
					? sprintf(
						/* translators: %s: form name */
						__( 'Popup form: %s', 'nexus-lead-suite' ),
						$form_name
					)
					: __( 'Popup form submitted', 'nexus-lead-suite' );
				break;

			case 'trigger_notify':
				$category      = __( 'Calls', 'nexus-lead-suite' );
				$category_slug = 'calls';
				$tid           = sanitize_text_field( (string) ( $row['target_key'] ?? '' ) );
				$label         = isset( $meta['notify_label'] ) ? sanitize_text_field( (string) $meta['notify_label'] ) : '';
				$mail_sent     = self::meta_mail_sent_value( $meta );
				$action        = __( 'Notify trigger', 'nexus-lead-suite' );
				$context       = self::click_element_label_context( $label, '' );
				if ( '—' === $context && '' !== $tid ) {
					$context = $tid;
				}
				break;

			case 'click_phone':
			case 'click_mailto':
				$category      = __( 'Calls', 'nexus-lead-suite' );
				$category_slug = 'calls';
				$label         = isset( $meta['label'] ) ? sanitize_text_field( (string) $meta['label'] ) : '';
				$href          = isset( $meta['href'] ) ? esc_url_raw( (string) $meta['href'] ) : '';
				$action        = 'click_phone' === $etype ? __( 'Phone tap', 'nexus-lead-suite' ) : __( 'Email tap', 'nexus-lead-suite' );
				$context       = self::click_element_label_context( $label, $href );
				$mail_sent     = self::meta_mail_sent_value( $meta );
				break;

			case 'scroll_depth':
				$category      = __( 'Consultations', 'nexus-lead-suite' );
				$category_slug = 'consultations';
				$pct           = isset( $meta['percent'] ) ? (int) $meta['percent'] : 0;
				$action        = __( 'Scroll depth', 'nexus-lead-suite' );
				/* translators: %d: scroll percent */
				$context       = sprintf( __( 'Reached %d%% of page height', 'nexus-lead-suite' ), max( 0, min( 100, $pct ) ) );
				break;

			case 'exit_intent':
				$category      = __( 'Consultations', 'nexus-lead-suite' );
				$category_slug = 'consultations';
				$action        = __( 'Exit intent', 'nexus-lead-suite' );
				$context       = __( 'Cursor left toward browser chrome (once per session)', 'nexus-lead-suite' );
				break;

			case 'popup_open':
			case 'popup_close':
				$category      = __( 'Interactions', 'nexus-lead-suite' );
				$category_slug = 'interactions';
				$label         = isset( $meta['label'] ) ? sanitize_text_field( (string) $meta['label'] ) : '';
				$open_source   = isset( $meta['open_source'] ) ? sanitize_key( (string) $meta['open_source'] ) : '';
				$auto_trigger  = isset( $meta['auto_trigger'] ) ? sanitize_key( (string) $meta['auto_trigger'] ) : '';
				$action        = 'popup_open' === $etype ? __( 'Popup opened', 'nexus-lead-suite' ) : __( 'Popup closed', 'nexus-lead-suite' );
				if ( 'popup_open' === $etype && 'auto' === $open_source ) {
					$context = self::auto_popup_open_context( $auto_trigger );
				} else {
					$context = self::click_element_label_context( $label, '' );
					if ( '—' === $context ) {
						$context = 'popup_open' === $etype
							? __( 'Pop-up opened', 'nexus-lead-suite' )
							: __( 'Pop-up closed', 'nexus-lead-suite' );
					}
				}
				break;

			case 'footer_click':
			case 'click_link':
				$category      = __( 'Interactions', 'nexus-lead-suite' );
				$category_slug = 'interactions';
				$label         = isset( $meta['label'] ) ? sanitize_text_field( (string) $meta['label'] ) : '';
				$href          = isset( $meta['href'] ) ? esc_url_raw( (string) $meta['href'] ) : '';
				$action        = 'footer_click' === $etype ? __( 'Footer click', 'nexus-lead-suite' ) : __( 'Button / link click', 'nexus-lead-suite' );
				$context       = self::click_element_label_context( $label, $href );
				break;

			default:
				$summary = isset( $meta['summary'] ) ? sanitize_textarea_field( (string) $meta['summary'] ) : '';
				if ( '' !== $summary ) {
					$context = self::truncate_ctx( $summary );
				}
				break;
		}

		$mail_applies = in_array(
			$etype,
			array( 'form_submission', 'popup_form_submission', 'trigger_notify' ),
			true
		) || (
			in_array( $etype, array( 'click_phone', 'click_mailto' ), true )
			&& array_key_exists( 'mail_sent', $meta )
		);
		if ( ! $mail_applies ) {
			$mail_sent   = null;
			$mail_status = __( 'No email', 'nexus-lead-suite' );
		} else {
			$mail_status = self::mail_status_for_activity( $mail_sent );
		}

		$ts = strtotime( (string) ( $row['created_at'] ?? '' ) );
		if ( false === $ts ) {
			$ts = 0;
		}

		$date_display = $ts > 0 ? wp_date( 'M j, Y g:i A', $ts ) : '';

		$out = array(
			'id'          => 'nx-' . (string) (int) ( $row['id'] ?? 0 ),
			'actionName'  => $action,
			'pageUrl'     => esc_url_raw( (string) ( $row['page_url'] ?? '' ) ),
			'category'    => $category,
			'categoryKey' => $category_slug,
			'context'     => $context,
			'dateTime'    => $date_display,
			'mailStatus'  => $mail_status,
			/* Always present so the admin UI can style Sent / failed / no-email rows reliably. */
			'mailSent'    => $mail_applies ? $mail_sent : null,
			'mail_status' => $mail_status,
			'mail_sent'   => $mail_applies ? $mail_sent : null,
		);

		return $out;
	}

	/**
	 * Reads `mail_sent` from stored activity meta. Null when the field was never recorded.
	 *
	 * @param array<string,mixed> $meta Decoded meta.
	 * @return bool|null True sent, false failed, null unknown / not applicable.
	 */
	private static function meta_mail_sent_value( array $meta ): ?bool {
		if ( ! array_key_exists( 'mail_sent', $meta ) ) {
			return null;
		}
		$v = $meta['mail_sent'];
		if ( is_bool( $v ) ) {
			return $v;
		}
		if ( is_int( $v ) || is_float( $v ) ) {
			return 0 !== (int) $v;
		}
		if ( is_string( $v ) ) {
			$s = strtolower( trim( $v ) );
			if ( in_array( $s, array( '1', 'true', 'yes', 'on' ), true ) ) {
				return true;
			}
			if ( in_array( $s, array( '0', 'false', 'no', 'off', '' ), true ) ) {
				return false;
			}
		}

		return (bool) $v;
	}

	/**
	 * Human label for rows where outbound mail is tracked (forms + notify trigger).
	 *
	 * @param bool|null $flag From {@see self::meta_mail_sent_value()}.
	 * @return string
	 */
	private static function mail_status_for_activity( ?bool $flag ): string {
		if ( null === $flag ) {
			return __( 'Unknown', 'nexus-lead-suite' );
		}

		return $flag
			? __( 'Sent', 'nexus-lead-suite' )
			: __( 'Send failed', 'nexus-lead-suite' );
	}

	/**
	 * Interaction text when a popup was opened by timer / scroll / exit intent.
	 *
	 * @param string $auto_trigger timer|scroll|exit or empty.
	 * @return string
	 */
	private static function auto_popup_open_context( string $auto_trigger ): string {
		switch ( $auto_trigger ) {
			case 'timer':
				return __( 'Auto pop-up · time delay', 'nexus-lead-suite' );
			case 'scroll':
				return __( 'Auto pop-up · scroll depth', 'nexus-lead-suite' );
			case 'exit':
				return __( 'Auto pop-up · exit intent', 'nexus-lead-suite' );
			default:
				return __( 'Auto pop-up', 'nexus-lead-suite' );
		}
	}

	/**
	 * Interaction column text for click rows: the visible control label the visitor tapped.
	 *
	 * @param string $label Sanitized label from tracker meta.
	 * @param string $href  Optional link (tel/mailto/http) fallback when label is empty.
	 * @return string
	 */
	private static function click_element_label_context( string $label, string $href = '' ): string {
		$label = trim( $label );
		if ( '' !== $label && ! preg_match( '/^(A|BUTTON|INPUT|DIV|SPAN|IMG|I|SVG)$/i', $label ) ) {
			return self::truncate_ctx( $label );
		}

		$href = trim( $href );
		if ( '' !== $href ) {
			if ( 0 === stripos( $href, 'tel:' ) ) {
				return self::truncate_ctx( substr( $href, 4 ) );
			}
			if ( 0 === stripos( $href, 'mailto:' ) ) {
				return self::truncate_ctx( substr( $href, 7 ) );
			}

			return self::truncate_ctx( $href );
		}

		return '—';
	}

	/**
	 * Shortens context for grid display.
	 *
	 * @param string $text Raw context.
	 * @return string
	 */
	private static function truncate_ctx( string $text ): string {
		$text = trim( $text );
		if ( '' === $text ) {
			return '—';
		}
		if ( strlen( $text ) > 140 ) {
			return substr( $text, 0, 137 ) . '…';
		}

		return $text;
	}
}
