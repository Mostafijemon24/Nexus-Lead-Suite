<?php
/**
 * AI chatbot conversation log: one row per visitor↔assistant exchange.
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
 * Chat transcript store backed by {@see dbDelta()} table `*_nexulesuite_chat_logs`.
 *
 * Only written when the admin enables "Store chat transcripts" (aiLogChats). A row
 * groups by the client-minted `session_id` so a conversation = all rows sharing it.
 */
final class Chat_Store {

	/**
	 * Qualified table name.
	 *
	 * @return string
	 */
	public static function table(): string {
		global $wpdb;

		return $wpdb->prefix . 'nexulesuite_chat_logs';
	}

	/**
	 * Best-effort client IP (mirrors Activities_Store hashing input).
	 *
	 * @return string
	 */
	private static function client_ip(): string {
		return isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( (string) $_SERVER['REMOTE_ADDR'] ) ) : '';
	}

	/**
	 * Records one visitor question + assistant answer exchange.
	 *
	 * @param string                       $session_id Client-minted conversation id (max 64 chars).
	 * @param string                       $question   Visitor message (may be empty when image-only).
	 * @param string                       $answer     Assistant reply.
	 * @param array<int,array<string,string>> $sources  RAG citation list ({title,url}).
	 * @param bool                         $has_image  Whether the visitor attached an image.
	 * @param string                       $page_url   Page the widget was used on.
	 * @return void
	 */
	public static function record_exchange( string $session_id, string $question, string $answer, array $sources = array(), bool $has_image = false, string $page_url = '', string $intent = '', string $sentiment = '' ): void {
		global $wpdb;

		$session_id = preg_replace( '/[^A-Za-z0-9_\-]/', '', $session_id );
		$session_id = substr( (string) $session_id, 0, 64 );
		if ( '' === $session_id ) {
			$session_id = 'anon';
		}

		$clean_sources = array();
		foreach ( $sources as $src ) {
			if ( ! is_array( $src ) ) {
				continue;
			}
			$url = esc_url_raw( (string) ( $src['url'] ?? '' ) );
			if ( '' === $url ) {
				continue;
			}
			$clean_sources[] = array(
				'title' => sanitize_text_field( (string) ( $src['title'] ?? $url ) ),
				'url'   => $url,
			);
		}

		$wpdb->insert( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery -- custom chat-log table insert.
			self::table(),
			array(
				'session_id' => $session_id,
				'question'   => mb_substr( wp_strip_all_tags( $question ), 0, 4000 ),
				'answer'     => mb_substr( wp_strip_all_tags( $answer ), 0, 8000 ),
				'sources'    => wp_json_encode( $clean_sources ),
				'has_image'  => $has_image ? 1 : 0,
				'intent'     => substr( sanitize_key( $intent ), 0, 32 ),
				'sentiment'  => substr( sanitize_key( $sentiment ), 0, 16 ),
				'page_url'   => '' !== $page_url ? esc_url_raw( $page_url ) : '',
				'ip_hash'    => hash( 'sha256', self::client_ip() ),
				'ua_hash'    => hash( 'sha256', isset( $_SERVER['HTTP_USER_AGENT'] ) ? sanitize_text_field( wp_unslash( (string) $_SERVER['HTTP_USER_AGENT'] ) ) : '' ),
				'created_at' => current_time( 'mysql' ),
			),
			array( '%s', '%s', '%s', '%s', '%d', '%s', '%s', '%s', '%s', '%s', '%s' )
		);
	}

	/**
	 * Aggregate report stats for the dashboard.
	 *
	 * @return array<string,int>
	 */
	public static function stats(): array {
		global $wpdb;

		$table = self::table();

		// phpcs:disable WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$total_messages      = (int) $wpdb->get_var( $wpdb->prepare( 'SELECT COUNT(*) FROM %i', $table ) );
		$total_conversations = (int) $wpdb->get_var( $wpdb->prepare( 'SELECT COUNT(DISTINCT session_id) FROM %i', $table ) );
		$today               = (int) $wpdb->get_var(
			$wpdb->prepare( 'SELECT COUNT(*) FROM %i WHERE created_at >= %s', $table, gmdate( 'Y-m-d 00:00:00', (int) current_time( 'timestamp' ) ) )
		);
		$last7               = (int) $wpdb->get_var(
			$wpdb->prepare( 'SELECT COUNT(*) FROM %i WHERE created_at >= %s', $table, gmdate( 'Y-m-d 00:00:00', (int) current_time( 'timestamp' ) - 6 * DAY_IN_SECONDS ) )
		);
		$with_images         = (int) $wpdb->get_var( $wpdb->prepare( 'SELECT COUNT(*) FROM %i WHERE has_image = 1', $table ) );

		$intent_rows = $wpdb->get_results( $wpdb->prepare( "SELECT intent, COUNT(*) AS c FROM %i WHERE intent <> '' GROUP BY intent ORDER BY c DESC LIMIT 8", $table ), ARRAY_A );
		$sent_rows   = $wpdb->get_results( $wpdb->prepare( "SELECT sentiment, COUNT(*) AS c FROM %i WHERE sentiment <> '' GROUP BY sentiment", $table ), ARRAY_A );
		// phpcs:enable

		$intents = array();
		foreach ( (array) $intent_rows as $row ) {
			$intents[] = array( 'label' => (string) $row['intent'], 'count' => (int) $row['c'] );
		}
		$sentiments = array();
		foreach ( (array) $sent_rows as $row ) {
			$sentiments[ (string) $row['sentiment'] ] = (int) $row['c'];
		}

		return array(
			'conversations' => $total_conversations,
			'messages'      => $total_messages,
			'today'         => $today,
			'last7'         => $last7,
			'withImages'    => $with_images,
			'intents'       => $intents,
			'sentiments'    => $sentiments,
		);
	}

	/**
	 * Lists conversations (grouped by session), newest activity first.
	 *
	 * @param string $from   Optional YYYY-MM-DD lower bound (inclusive).
	 * @param string $to     Optional YYYY-MM-DD upper bound (inclusive).
	 * @param string $search Optional substring match on question/answer.
	 * @param int    $limit  Max conversations returned.
	 * @return array<int,array<string,mixed>>
	 */
	public static function list_conversations( string $from = '', string $to = '', string $search = '', int $limit = 200 ): array {
		global $wpdb;

		$table  = self::table();
		$where  = array( '1=1' );
		$params = array();

		if ( preg_match( '/^\d{4}-\d{2}-\d{2}$/', $from ) ) {
			$where[]  = 'created_at >= %s';
			$params[] = $from . ' 00:00:00';
		}
		if ( preg_match( '/^\d{4}-\d{2}-\d{2}$/', $to ) ) {
			$where[]  = 'created_at <= %s';
			$params[] = $to . ' 23:59:59';
		}
		if ( '' !== $search ) {
			$like     = '%' . $wpdb->esc_like( $search ) . '%';
			$where[]  = '(question LIKE %s OR answer LIKE %s)';
			$params[] = $like;
			$params[] = $like;
		}

		$limit     = max( 1, min( 500, $limit ) );
		$where_sql = implode( ' AND ', $where );

		// Placeholder order across the query: %i (FROM), then the WHERE values, then %d (LIMIT).
		array_unshift( $params, $table );
		$params[] = $limit;

		// Group by session for the list; pull first question + counts + timespan.
		// phpcs:disable WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter, WordPress.DB.PreparedSQLPlaceholders.ReplacementsWrongNumber -- $where_sql is assembled from literal fragments above; every value, and the table name, is bound through prepare(). The sniff cannot count args passed as one array, which prepare() supports.
		$rows = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT session_id,
					COUNT(*) AS message_count,
					MIN(created_at) AS started_at,
					MAX(created_at) AS last_at,
					SUM(has_image) AS image_count,
					SUBSTRING_INDEX(GROUP_CONCAT(question ORDER BY created_at ASC SEPARATOR '\\n'), '\\n', 1) AS first_question
				FROM %i
				WHERE {$where_sql}
				GROUP BY session_id
				ORDER BY last_at DESC
				LIMIT %d",
				$params
			),
			ARRAY_A
		);
		// phpcs:enable

		$out = array();
		foreach ( (array) $rows as $row ) {
			$out[] = array(
				'sessionId'     => (string) $row['session_id'],
				'messageCount'  => (int) $row['message_count'],
				'imageCount'    => (int) $row['image_count'],
				'startedAt'     => (string) $row['started_at'],
				'lastAt'        => (string) $row['last_at'],
				'firstQuestion' => (string) $row['first_question'],
			);
		}

		return $out;
	}

	/**
	 * Returns the full ordered transcript for one conversation.
	 *
	 * @param string $session_id Conversation id.
	 * @return array<int,array<string,mixed>>
	 */
	public static function get_transcript( string $session_id ): array {
		global $wpdb;

		$session_id = preg_replace( '/[^A-Za-z0-9_\-]/', '', $session_id );
		$session_id = substr( (string) $session_id, 0, 64 );
		if ( '' === $session_id ) {
			return array();
		}

		$table = self::table();

		// phpcs:disable WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$rows = $wpdb->get_results(
			$wpdb->prepare( 'SELECT question, answer, sources, has_image, page_url, created_at FROM %i WHERE session_id = %s ORDER BY created_at ASC, id ASC', $table, $session_id ),
			ARRAY_A
		);
		// phpcs:enable

		$out = array();
		foreach ( (array) $rows as $row ) {
			$sources = json_decode( (string) ( $row['sources'] ?? '' ), true );
			$out[]   = array(
				'question' => (string) $row['question'],
				'answer'   => (string) $row['answer'],
				'sources'  => is_array( $sources ) ? $sources : array(),
				'hasImage' => (int) $row['has_image'] === 1,
				'pageUrl'  => (string) $row['page_url'],
				'createdAt' => (string) $row['created_at'],
			);
		}

		return $out;
	}

	/**
	 * Deletes all chat-log rows (admin-only purge).
	 *
	 * @return int Rows removed (best effort).
	 */
	public static function clear_all(): int {
		global $wpdb;

		$table = self::table();

		// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared,WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching,PluginCheck.Security.DirectDB.UnescapedDBParameter -- table name from trusted prefix; admin-only purge.
		$deleted = $wpdb->query( "TRUNCATE TABLE {$table}" );
		if ( false === $deleted ) {
			// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared,WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching,PluginCheck.Security.DirectDB.UnescapedDBParameter -- table name from trusted prefix; admin-only purge.
			$deleted = $wpdb->query( "DELETE FROM {$table}" );
		}

		return is_int( $deleted ) ? $deleted : 0;
	}
}
