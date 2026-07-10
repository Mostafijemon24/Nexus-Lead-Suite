<?php
/**
 * The single query layer behind every report surface.
 *
 * The admin Activities screen, the PDF writer and the token-gated client gateway all
 * read through here, so a section means the same thing everywhere and access control
 * has exactly one place to filter.
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
 * Assembles a combined report from activities, form submissions and chat transcripts.
 */
final class Report_Source {

	/**
	 * Every section a report can carry, in render order.
	 */
	public const SECTIONS = array( 'summary', 'forms', 'chats', 'activities' );

	/**
	 * Sections a freshly created share link starts with. Chat transcripts and raw form
	 * fields carry visitor PII, so they are opt-in rather than opt-out.
	 */
	public const DEFAULT_SHARED_SECTIONS = array( 'summary', 'activities' );

	/**
	 * Normalises an arbitrary list into known section slugs, in render order.
	 *
	 * @param mixed $sections Raw list.
	 * @return string[] Empty array means "nothing requested".
	 */
	public static function sanitize_sections( $sections ): array {
		if ( ! is_array( $sections ) ) {
			return array();
		}

		$clean = array();
		foreach ( self::SECTIONS as $section ) {
			if ( in_array( $section, $sections, true ) ) {
				$clean[] = $section;
			}
		}

		return $clean;
	}

	/**
	 * Builds a report.
	 *
	 * Only the requested sections are queried, so a link that may not see chats never
	 * reads the chat table.
	 *
	 * @param array<string,mixed> $args from, to, search, tab, sections, limit.
	 * @return array<string,mixed>
	 */
	public static function fetch( array $args = array() ): array {
		$from     = self::date_or_empty( (string) ( $args['from'] ?? '' ) );
		$to       = self::date_or_empty( (string) ( $args['to'] ?? '' ) );
		$search   = trim( (string) ( $args['search'] ?? '' ) );
		$tab      = (string) ( $args['tab'] ?? 'all' );
		$limit    = max( 1, min( 5000, (int) ( $args['limit'] ?? 500 ) ) );
		$sections = self::sanitize_sections( $args['sections'] ?? self::SECTIONS );

		$report = array(
			'meta'     => array(
				'siteTitle'     => (string) get_bloginfo( 'name' ),
				'generatedAt'   => wp_date( 'M j, Y g:i A' ),
				'from'          => $from,
				'to'            => $to,
				'search'        => $search,
				'sections'      => $sections,
				'retentionDays' => 0,
			),
			'summary'  => null,
			'forms'    => null,
			'chats'    => null,
			'activities' => null,
		);

		if ( in_array( 'forms', $sections, true ) ) {
			require_once nexulesuite_PLUGIN_DIR . 'core/class-form-submissions-store.php';
			$report['forms'] = Form_Submissions_Store::list_submissions( $from, $to, $search, $limit );
			// Field-level detail only survives the purge window; the report says so.
			$report['meta']['retentionDays'] = Form_Submissions_Store::retention_days();
		}

		if ( in_array( 'chats', $sections, true ) ) {
			$report['chats'] = self::fetch_chats( $from, $to, $search, $limit );
		}

		if ( in_array( 'activities', $sections, true ) ) {
			$report['activities'] = self::fetch_activities( $tab, $from, $to, $search, $limit );
		}

		if ( in_array( 'summary', $sections, true ) ) {
			$report['summary'] = self::fetch_summary( $from, $to, $sections );
		}

		return $report;
	}

	/**
	 * Conversations with their full transcripts.
	 *
	 * @param string $from   `Y-m-d` or ''.
	 * @param string $to     `Y-m-d` or ''.
	 * @param string $search Free text.
	 * @param int    $limit  Conversation cap.
	 * @return array<int, array<string,mixed>>
	 */
	private static function fetch_chats( string $from, string $to, string $search, int $limit ): array {
		require_once nexulesuite_PLUGIN_DIR . 'core/class-chat-store.php';

		$conversations = Chat_Store::list_conversations( $from, $to, $search, min( 500, $limit ) );
		foreach ( $conversations as &$conversation ) {
			$conversation['transcript'] = Chat_Store::get_transcript( (string) $conversation['sessionId'] );
		}
		unset( $conversation );

		return $conversations;
	}

	/**
	 * Activity rows in the shape the admin UI and gateway already render.
	 *
	 * @param string $tab    Activity tab.
	 * @param string $from   `Y-m-d` or ''.
	 * @param string $to     `Y-m-d` or ''.
	 * @param string $search Free text.
	 * @param int    $limit  Row cap.
	 * @return array<int, array<string,mixed>>
	 */
	private static function fetch_activities( string $tab, string $from, string $to, string $search, int $limit ): array {
		require_once nexulesuite_PLUGIN_DIR . 'core/class-activities-store.php';

		$rows = array();
		foreach ( Activities_Store::fetch_report_rows( $tab, $from, $to, $search, $limit ) as $row ) {
			$rows[] = Activities_Store::map_db_row_to_activity( $row );
		}

		return $rows;
	}

	/**
	 * Headline counts. Chat figures are omitted when the caller cannot see chats.
	 *
	 * @param string   $from     `Y-m-d` or ''.
	 * @param string   $to       `Y-m-d` or ''.
	 * @param string[] $sections Granted sections.
	 * @return array<string,mixed>
	 */
	private static function fetch_summary( string $from, string $to, array $sections ): array {
		require_once nexulesuite_PLUGIN_DIR . 'core/class-form-submissions-store.php';

		$summary = array(
			'formSubmissions' => Form_Submissions_Store::count_submissions( $from, $to ),
		);

		if ( in_array( 'chats', $sections, true ) ) {
			require_once nexulesuite_PLUGIN_DIR . 'core/class-chat-store.php';
			$stats = Chat_Store::stats();

			$summary['conversations'] = (int) ( $stats['conversations'] ?? 0 );
			$summary['messages']      = (int) ( $stats['messages'] ?? 0 );
			$summary['withImages']    = (int) ( $stats['withImages'] ?? 0 );
			$summary['topIntents']    = isset( $stats['intents'] ) && is_array( $stats['intents'] ) ? $stats['intents'] : array();
			$summary['sentiments']    = isset( $stats['sentiments'] ) && is_array( $stats['sentiments'] ) ? $stats['sentiments'] : array();
		}

		return $summary;
	}

	/**
	 * Passes through a `Y-m-d` date, otherwise ''.
	 *
	 * @param string $value Candidate.
	 * @return string
	 */
	private static function date_or_empty( string $value ): string {
		return preg_match( '/^\d{4}-\d{2}-\d{2}$/', $value ) ? $value : '';
	}
}
