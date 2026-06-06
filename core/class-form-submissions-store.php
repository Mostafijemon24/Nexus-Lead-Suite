<?php
/**
 * Form submission records (short retention) + outbound CRM/webhook dispatch.
 *
 * Table: {@see Activator::install_tables()} `*_nexus_ls_submissions`.
 * Payload JSON includes an `entry` object: field label => value (all submitted data).
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

		return $wpdb->prefix . 'nexus_ls_submissions';
	}

	/**
	 * @return int Retention window in days (filterable).
	 */
	public static function retention_days(): int {
		$d = (int) apply_filters( 'nexus_ls_submission_retention_days', self::RETENTION_DAYS );

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
						'User-Agent'   => 'NexusLeadSuite/' . ( defined( 'NEXUS_LS_VERSION' ) ? NEXUS_LS_VERSION : '1' ) . '; ' . home_url( '/' ),
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
