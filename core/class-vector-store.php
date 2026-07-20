<?php
/**
 * Knowledge-base vector store: chunked site content + embeddings, kept in the WP database.
 *
 * This is what replaces ChromaDB when the chatbot talks to a hosted model API
 * directly. Embeddings are L2-normalized before they are stored, so retrieval is
 * a plain dot product — no square roots at query time.
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
 * Store backed by {@see dbDelta()} table `*_nexulesuite_ai_vectors`.
 *
 * One row per chunk. `doc_id` groups the chunks of a single post/page/product so a
 * re-train can replace one document without touching the rest of the knowledge base.
 */
final class Vector_Store {

	/**
	 * Target characters per chunk.
	 */
	private const CHUNK_SIZE = 1100;

	/**
	 * Characters repeated from the previous chunk, so a fact split across a boundary
	 * still appears whole in at least one chunk.
	 */
	private const CHUNK_OVERLAP = 180;

	/**
	 * Chunks kept per document — a runaway page cannot swamp the index.
	 */
	private const MAX_CHUNKS_PER_DOC = 60;

	/**
	 * Rows scanned per SELECT while searching.
	 */
	private const SCAN_BATCH = 500;

	/**
	 * Hard ceiling on rows compared in one search (keeps a huge index from timing out).
	 */
	private const SCAN_MAX_ROWS = 20000;

	/**
	 * Qualified table name.
	 *
	 * @return string
	 */
	public static function table(): string {
		global $wpdb;

		return $wpdb->prefix . 'nexulesuite_ai_vectors';
	}

	/**
	 * Splits document text into overlapping chunks on paragraph boundaries.
	 *
	 * @param string $text Plain text.
	 * @return array<int,string>
	 */
	public static function chunk_text( string $text ): array {
		$text = preg_replace( '/[ \t]+/', ' ', trim( $text ) );
		$text = (string) preg_replace( '/\n{3,}/', "\n\n", (string) $text );
		if ( '' === $text ) {
			return array();
		}

		$chunks = array();
		$buffer = '';

		foreach ( preg_split( '/\n{2,}/', $text ) as $para ) {
			$para = trim( (string) $para );
			if ( '' === $para ) {
				continue;
			}

			if ( mb_strlen( $para ) > self::CHUNK_SIZE ) {
				if ( '' !== $buffer ) {
					$chunks[] = $buffer;
					$buffer   = '';
				}
				foreach ( self::split_long( $para ) as $piece ) {
					$chunks[] = $piece;
				}
				continue;
			}

			if ( '' === $buffer ) {
				$buffer = $para;
			} elseif ( mb_strlen( $buffer ) + 2 + mb_strlen( $para ) <= self::CHUNK_SIZE ) {
				$buffer .= "\n\n" . $para;
			} else {
				$chunks[] = $buffer;
				$tail     = mb_substr( $buffer, -self::CHUNK_OVERLAP );
				$buffer   = trim( $tail ) . "\n\n" . $para;
			}
		}

		if ( '' !== trim( $buffer ) ) {
			$chunks[] = $buffer;
		}

		return array_slice( $chunks, 0, self::MAX_CHUNKS_PER_DOC );
	}

	/**
	 * Hard-splits a paragraph longer than one chunk, keeping the overlap.
	 *
	 * @param string $para Paragraph.
	 * @return array<int,string>
	 */
	private static function split_long( string $para ): array {
		$out    = array();
		$length = mb_strlen( $para );
		$step   = max( 1, self::CHUNK_SIZE - self::CHUNK_OVERLAP );

		for ( $start = 0; $start < $length; $start += $step ) {
			$piece = trim( mb_substr( $para, $start, self::CHUNK_SIZE ) );
			if ( '' !== $piece ) {
				$out[] = $piece;
			}
			if ( count( $out ) >= self::MAX_CHUNKS_PER_DOC ) {
				break;
			}
		}

		return $out;
	}

	/**
	 * Replaces every chunk of one document with a fresh set.
	 *
	 * @param string                       $doc_id  Stable document id (e.g. `post-12`).
	 * @param array<string,string>         $meta    `{source_type, source_ref, title, url}`.
	 * @param array<int,string>            $chunks  Chunk texts.
	 * @param array<int,array<int,float>>  $vectors Embedding per chunk, same order.
	 * @return int Rows written.
	 */
	public static function replace_document( string $doc_id, array $meta, array $chunks, array $vectors ): int {
		global $wpdb;

		$doc_id = mb_substr( sanitize_text_field( $doc_id ), 0, 191 );
		if ( '' === $doc_id ) {
			return 0;
		}

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- custom vector table.
		$wpdb->delete( self::table(), array( 'doc_id' => $doc_id ), array( '%s' ) );

		$now     = current_time( 'mysql' );
		$written = 0;
		foreach ( $chunks as $index => $chunk ) {
			if ( ! isset( $vectors[ $index ] ) || ! is_array( $vectors[ $index ] ) || count( $vectors[ $index ] ) < 2 ) {
				continue;
			}
			$packed = self::pack_vector( $vectors[ $index ] );
			if ( '' === $packed ) {
				continue;
			}

			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery -- custom vector table insert.
			$ok = $wpdb->insert(
				self::table(),
				array(
					'doc_id'      => $doc_id,
					'chunk_index' => (int) $index,
					'source_type' => mb_substr( sanitize_key( (string) ( $meta['source_type'] ?? '' ) ), 0, 32 ),
					'source_ref'  => mb_substr( sanitize_text_field( (string) ( $meta['source_ref'] ?? '' ) ), 0, 191 ),
					'title'       => mb_substr( sanitize_text_field( (string) ( $meta['title'] ?? '' ) ), 0, 500 ),
					'url'         => esc_url_raw( (string) ( $meta['url'] ?? '' ) ),
					'content'     => (string) $chunk,
					'embedding'   => $packed,
					'dims'        => count( $vectors[ $index ] ),
					'created_at'  => $now,
				),
				array( '%s', '%d', '%s', '%s', '%s', '%s', '%s', '%s', '%d', '%s' )
			);
			if ( false !== $ok ) {
				++$written;
			}
		}

		return $written;
	}

	/**
	 * Top-k chunks by cosine similarity against a query embedding.
	 *
	 * Rows whose dimensionality differs from the query are skipped in SQL — switching
	 * embedding models therefore degrades to "no results" rather than to nonsense.
	 *
	 * @param array<int,float> $query Query embedding.
	 * @param int              $k     How many chunks to return.
	 * @return array<int,array<string,mixed>> `{title, url, content, source_type, score}` best first.
	 */
	public static function search( array $query, int $k = 4 ): array {
		global $wpdb;

		$dims = count( $query );
		if ( $dims < 2 ) {
			return array();
		}
		$k     = max( 1, min( 20, $k ) );
		$table = self::table();
		$norm  = self::normalize( $query );
		if ( empty( $norm ) ) {
			return array();
		}

		$scores = array();
		for ( $offset = 0; $offset < self::SCAN_MAX_ROWS; $offset += self::SCAN_BATCH ) {
			// phpcs:disable WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$rows = $wpdb->get_results(
				$wpdb->prepare(
					'SELECT id, embedding FROM %i WHERE dims = %d ORDER BY id ASC LIMIT %d OFFSET %d',
					$table,
					$dims,
					self::SCAN_BATCH,
					$offset
				),
				ARRAY_A
			);
			// phpcs:enable

			if ( empty( $rows ) ) {
				break;
			}

			foreach ( $rows as $row ) {
				$vector = @unpack( 'g*', (string) $row['embedding'] ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged -- malformed blob must not fatal a visitor request.
				if ( ! is_array( $vector ) || count( $vector ) !== $dims ) {
					continue;
				}
				// Both sides are unit vectors, so the dot product IS the cosine similarity.
				$dot   = 0.0;
				$index = 1;
				foreach ( $norm as $component ) {
					$dot  += $component * $vector[ $index ];
					++$index;
				}
				$scores[ (int) $row['id'] ] = $dot;
			}

			if ( count( $rows ) < self::SCAN_BATCH ) {
				break;
			}
		}

		if ( empty( $scores ) ) {
			return array();
		}

		arsort( $scores );
		$top_ids = array_slice( array_keys( $scores ), 0, $k, true );

		$placeholders = implode( ',', array_fill( 0, count( $top_ids ), '%d' ) );
		// phpcs:disable WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$hits = $wpdb->get_results(
			$wpdb->prepare(
				// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.PreparedSQLPlaceholders.UnfinishedPrepare -- $placeholders is a generated run of '%d' only; table and ids are bound below.
				"SELECT id, title, url, content, source_type FROM %i WHERE id IN ({$placeholders})",
				array_merge( array( $table ), $top_ids )
			),
			ARRAY_A
		);
		// phpcs:enable

		$by_id = array();
		foreach ( (array) $hits as $hit ) {
			$by_id[ (int) $hit['id'] ] = $hit;
		}

		$out = array();
		foreach ( $top_ids as $id ) {
			if ( ! isset( $by_id[ $id ] ) ) {
				continue;
			}
			$out[] = array(
				'title'       => (string) $by_id[ $id ]['title'],
				'url'         => (string) $by_id[ $id ]['url'],
				'content'     => (string) $by_id[ $id ]['content'],
				'source_type' => (string) $by_id[ $id ]['source_type'],
				'score'       => round( (float) $scores[ $id ], 4 ),
			);
		}

		return $out;
	}

	/**
	 * Total chunks indexed.
	 *
	 * @return int
	 */
	public static function count(): int {
		global $wpdb;

		$table = self::table();

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		return (int) $wpdb->get_var( $wpdb->prepare( 'SELECT COUNT(*) FROM %i', $table ) );
	}

	/**
	 * Distinct documents indexed.
	 *
	 * @return int
	 */
	public static function documents(): int {
		global $wpdb;

		$table = self::table();

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		return (int) $wpdb->get_var( $wpdb->prepare( 'SELECT COUNT(DISTINCT doc_id) FROM %i', $table ) );
	}

	/**
	 * Dimensionality of the stored vectors (0 when the index is empty). Used to warn
	 * the admin that changing the embedding model orphans the existing index.
	 *
	 * @return int
	 */
	public static function dims(): int {
		global $wpdb;

		$table = self::table();

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		return (int) $wpdb->get_var( $wpdb->prepare( 'SELECT dims FROM %i ORDER BY id DESC LIMIT 1', $table ) );
	}

	/**
	 * Wipes the knowledge base.
	 *
	 * @return int Rows removed (best effort).
	 */
	public static function delete_all(): int {
		global $wpdb;

		$table = self::table();

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- admin-only purge.
		$deleted = $wpdb->query( $wpdb->prepare( 'TRUNCATE TABLE %i', $table ) );
		if ( false === $deleted ) {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- admin-only purge.
			$deleted = $wpdb->query( $wpdb->prepare( 'DELETE FROM %i', $table ) );
		}

		return is_int( $deleted ) ? $deleted : 0;
	}

	/**
	 * Scales a vector to unit length so similarity is a bare dot product.
	 *
	 * @param array<int,float> $vector Raw embedding.
	 * @return array<int,float> Empty when the vector is degenerate.
	 */
	private static function normalize( array $vector ): array {
		$sum = 0.0;
		foreach ( $vector as $component ) {
			$sum += (float) $component * (float) $component;
		}
		if ( $sum <= 0.0 ) {
			return array();
		}

		$magnitude = sqrt( $sum );
		$out       = array();
		foreach ( $vector as $component ) {
			$out[] = (float) $component / $magnitude;
		}

		return $out;
	}

	/**
	 * Normalizes then packs a vector as little-endian float32 for the BLOB column.
	 *
	 * @param array<int,float> $vector Raw embedding.
	 * @return string Empty on a degenerate vector.
	 */
	private static function pack_vector( array $vector ): string {
		$norm = self::normalize( $vector );
		if ( empty( $norm ) ) {
			return '';
		}

		return (string) pack( 'g*', ...$norm );
	}
}
