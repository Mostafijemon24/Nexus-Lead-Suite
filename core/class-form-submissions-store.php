<?php
/**
 * Form submission records (short retention) + outbound CRM/webhook dispatch.
 *
 * Table: {@see Activator::install_tables()} `*_nexulesuite_submissions`.
 * Payload JSON includes an `entry` object: field label => value (all submitted data).
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
 * Persists submissions locally and POSTs JSON to integration URLs (HubSpot workflows,
 * Salesforce platform events via middleware, Zapier/Make, etc.).
 */
final class Form_Submissions_Store {

	public const RETENTION_DAYS = 30;

	/** Payload key holding label => value pairs for all fields. */
	public const PAYLOAD_ENTRY_KEY = 'entry';

	/**
	 * Qualified table name.
	 */
	public static function table(): string {
		global $wpdb;

		return $wpdb->prefix . 'nexulesuite_submissions';
	}

	/**
	 * @return int Retention window in days (filterable).
	 */
	public static function retention_days(): int {
		$d = (int) apply_filters( 'nexulesuite_submission_retention_days', self::RETENTION_DAYS );

		return max( 1, min( 365, $d ) );
	}

	/**
	 * Deletes rows older than the retention policy (site-local time, matches `current_time` inserts).
	 *
	 * @return int Rows deleted (best effort).
	 */
	public static function purge_expired(): int {
		global $wpdb;

		$table = self::table();
		$days  = self::retention_days();
		$cut   = wp_date( 'Y-m-d H:i:s', time() - ( $days * DAY_IN_SECONDS ) );

		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching,WordPress.DB.PreparedSQL.NotPrepared,PluginCheck.Security.DirectDB.UnescapedDBParameter -- table from trusted prefix; retention purge.
		$ok = $wpdb->query( $wpdb->prepare( "DELETE FROM {$table} WHERE created_at < %s", $cut ) );

		return is_int( $ok ) ? $ok : 0;
	}

	/**
	 * Stores one submission snapshot in the database.
	 *
	 * @param string               $form_id Form id (truncated for form_key column).
	 * @param array<string,mixed>  $payload Must include {@see self::PAYLOAD_ENTRY_KEY} for field map.
	 * @return void
	 */
	public static function insert( string $form_id, array $payload ): void {
		global $wpdb;

		$form_id = sanitize_text_field( $form_id );
		if ( '' === $form_id ) {
			return;
		}

		$table = self::table();
		$json  = wp_json_encode( $payload );
		if ( ! is_string( $json ) ) {
			return;
		}

		$wpdb->insert( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery -- custom submissions table insert.
			$table,
			array(
				'form_key'   => substr( $form_id, 0, 64 ),
				'status'     => 'stored',
				'payload'    => $json,
				'ip_hash'    => hash( 'sha256', self::client_ip() ),
				'ua_hash'    => hash(
					'sha256',
					isset( $_SERVER['HTTP_USER_AGENT'] )
						? sanitize_text_field( wp_unslash( (string) $_SERVER['HTTP_USER_AGENT'] ) )
						: ''
				),
				'created_at' => current_time( 'mysql' ),
				'updated_at' => current_time( 'mysql' ),
			),
			array( '%s', '%s', '%s', '%s', '%s', '%s', '%s' )
		);
	}

	/**
	 * Reads stored submissions with their full field values, newest first.
	 *
	 * Note the {@see RETENTION_DAYS} purge: rows older than the window are gone, so a
	 * report can only show discrete field values for recent submissions. Older ones
	 * survive as one-line summaries in {@see Activities_Store}.
	 *
	 * @param string $from   `Y-m-d` lower bound, or ''.
	 * @param string $to     `Y-m-d` upper bound, or ''.
	 * @param string $search Free text matched against the form key and payload.
	 * @param int    $limit  Row cap (1..1000).
	 * @return array<int, array{id:int, formKey:string, formName:string, submittedAt:string, pageUrl:string, mailSent:?bool, fields:array<int,array{label:string,value:string}>}>
	 */
	public static function list_submissions( string $from = '', string $to = '', string $search = '', int $limit = 500 ): array {
		global $wpdb;

		$table = self::table();
		$limit = max( 1, min( 1000, $limit ) );

		$where  = array( '1=1' );
		$params = array();

		if ( preg_match( '/^\d{4}-\d{2}-\d{2}$/', $from ) ) {
			$where[]  = 'DATE(created_at) >= %s';
			$params[] = $from;
		}
		if ( preg_match( '/^\d{4}-\d{2}-\d{2}$/', $to ) ) {
			$where[]  = 'DATE(created_at) <= %s';
			$params[] = $to;
		}
		if ( '' !== $search ) {
			$like     = '%' . $wpdb->esc_like( $search ) . '%';
			$where[]  = '(form_key LIKE %s OR payload LIKE %s)';
			$params[] = $like;
			$params[] = $like;
		}

		$params[] = $limit;
		$sql      = 'SELECT id, form_key, payload, created_at FROM ' . $table
			. ' WHERE ' . implode( ' AND ', $where )
			. ' ORDER BY created_at DESC, id DESC LIMIT %d';

		// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- table from trusted prefix; values bound below.
		$rows = $wpdb->get_results( $wpdb->prepare( $sql, $params ), ARRAY_A );
		if ( ! is_array( $rows ) ) {
			return array();
		}

		$out = array();
		foreach ( $rows as $row ) {
			$payload = json_decode( (string) ( $row['payload'] ?? '' ), true );
			if ( ! is_array( $payload ) ) {
				$payload = array();
			}

			$out[] = array(
				'id'          => (int) ( $row['id'] ?? 0 ),
				'formKey'     => (string) ( $row['form_key'] ?? '' ),
				'formName'    => self::submission_form_name( (string) ( $row['form_key'] ?? '' ), $payload ),
				'submittedAt' => (string) ( $row['created_at'] ?? '' ),
				'pageUrl'     => (string) ( $payload['page_url'] ?? '' ),
				'mailSent'    => array_key_exists( 'mail_sent', $payload ) ? (bool) $payload['mail_sent'] : null,
				'fields'      => self::submission_fields( $payload ),
			);
		}

		return $out;
	}

	/**
	 * Counts stored submissions in a date window.
	 *
	 * @param string $from `Y-m-d` or ''.
	 * @param string $to   `Y-m-d` or ''.
	 * @return int
	 */
	public static function count_submissions( string $from = '', string $to = '' ): int {
		global $wpdb;

		$table  = self::table();
		$where  = array( '1=1' );
		$params = array();

		if ( preg_match( '/^\d{4}-\d{2}-\d{2}$/', $from ) ) {
			$where[]  = 'DATE(created_at) >= %s';
			$params[] = $from;
		}
		if ( preg_match( '/^\d{4}-\d{2}-\d{2}$/', $to ) ) {
			$where[]  = 'DATE(created_at) <= %s';
			$params[] = $to;
		}

		$sql = 'SELECT COUNT(*) FROM ' . $table . ' WHERE ' . implode( ' AND ', $where );
		if ( empty( $params ) ) {
			// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- no user input in this branch.
			return (int) $wpdb->get_var( $sql );
		}

		// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- values bound below.
		return (int) $wpdb->get_var( $wpdb->prepare( $sql, $params ) );
	}

	/**
	 * Human label for a stored submission.
	 *
	 * @param string              $form_key Stored form key.
	 * @param array<string,mixed> $payload  Decoded payload.
	 * @return string
	 */
	private static function submission_form_name( string $form_key, array $payload ): string {
		if ( isset( $payload['form']['name'] ) && '' !== (string) $payload['form']['name'] ) {
			return (string) $payload['form']['name'];
		}
		if ( 'ai_chat_lead' === $form_key ) {
			return __( 'AI chat lead', 'nexus-lead-suite' );
		}

		return '' !== $form_key ? $form_key : __( 'Submission', 'nexus-lead-suite' );
	}

	/**
	 * Flattens a payload into ordered label/value pairs.
	 *
	 * Two writers produce two shapes: the Form Builder nests everything under
	 * {@see PAYLOAD_ENTRY_KEY}, while the AI chat lead capture stores name/email/phone
	 * at the top level with no `entry` key at all. Handle both, or chat leads read as blank.
	 *
	 * @param array<string,mixed> $payload Decoded payload.
	 * @return array<int, array{label:string, value:string}>
	 */
	private static function submission_fields( array $payload ): array {
		$entry = array();

		if ( isset( $payload[ self::PAYLOAD_ENTRY_KEY ] ) && is_array( $payload[ self::PAYLOAD_ENTRY_KEY ] ) ) {
			$entry = $payload[ self::PAYLOAD_ENTRY_KEY ];
		} else {
			foreach ( array( 'name', 'email', 'phone', 'message' ) as $key ) {
				if ( isset( $payload[ $key ] ) && '' !== (string) $payload[ $key ] ) {
					$entry[ ucfirst( $key ) ] = $payload[ $key ];
				}
			}
		}

		$fields = array();
		foreach ( $entry as $label => $value ) {
			$fields[] = array(
				'label' => (string) $label,
				'value' => self::flatten_value( $value ),
			);
		}

		return $fields;
	}

	/**
	 * Renders a submitted value as one string (checkbox groups arrive as arrays).
	 *
	 * @param mixed $value Raw value.
	 * @return string
	 */
	private static function flatten_value( $value ): string {
		if ( is_array( $value ) ) {
			$parts = array();
			foreach ( $value as $item ) {
				$parts[] = self::flatten_value( $item );
			}
			return implode( ', ', array_filter( $parts, 'strlen' ) );
		}
		if ( is_bool( $value ) ) {
			return $value ? __( 'Yes', 'nexus-lead-suite' ) : __( 'No', 'nexus-lead-suite' );
		}
		if ( is_scalar( $value ) ) {
			return trim( (string) $value );
		}

		return '';
	}

	/**
	 * Non-blocking POST of JSON to each HTTPS webhook (CRM automation, Zapier, etc.).
	 *
	 * @param array<int,string>   $urls    Absolute URLs.
	 * @param array<string,mixed> $payload JSON-serializable body.
	 * @return void
	 */
	public static function dispatch_webhooks( array $urls, array $payload ): void {
		$seen = array();
		$body = wp_json_encode( $payload );
		if ( ! is_string( $body ) ) {
			return;
		}

		foreach ( $urls as $url ) {
			$url = esc_url_raw( trim( (string) $url ) );
			if ( '' === $url || isset( $seen[ $url ] ) ) {
				continue;
			}
			if ( ! wp_http_validate_url( $url ) ) {
				continue;
			}
			$scheme = wp_parse_url( $url, PHP_URL_SCHEME );
			if ( ! is_string( $scheme ) || ! in_array( strtolower( $scheme ), array( 'https', 'http' ), true ) ) {
				continue;
			}
			$seen[ $url ] = true;

			wp_remote_post(
				$url,
				array(
					'timeout'  => 8,
					'blocking' => false,
					'headers'  => array(
						'Content-Type' => 'application/json; charset=utf-8',
						'User-Agent'   => 'nexulesuite_LeadSuite/' . ( defined( 'nexulesuite_VERSION' ) ? nexulesuite_VERSION : '1' ) . '; ' . home_url( '/' ),
					),
					'body'     => $body,
				)
			);
		}
	}

	/**
	 * @return string
	 */
	private static function client_ip(): string {
		return isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( (string) $_SERVER['REMOTE_ADDR'] ) ) : '';
	}
}
