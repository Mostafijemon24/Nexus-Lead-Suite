<?php
/**
 * Renders a combined report ({@see Report_Source}) as a paginated PDF.
 *
 * Unlike {@see Simple_Pdf} this writer embeds a real Unicode font, wraps text on glyph
 * widths rather than character counts, and grows rows to fit their content — chat
 * transcripts and form answers are free text and do not survive a fixed 36-character cell.
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
 * Section-based PDF layout on top of {@see Pdf_Font}.
 */
final class Report_Pdf {

	private const PAGE_W = 612.0;
	private const PAGE_H = 792.0;
	private const MARGIN = 48.0;

	private const INK     = '0.059 0.090 0.165'; // slate-900
	private const BODY    = '0.118 0.161 0.231'; // slate-800
	private const MUTED   = '0.392 0.455 0.545'; // slate-500
	private const PRIMARY = '0.145 0.388 0.922'; // blue-600
	private const BORDER  = '0.886 0.910 0.941'; // slate-200
	private const TINT    = '0.973 0.980 0.988'; // slate-50

	/**
	 * Embedded font.
	 *
	 * @var Pdf_Font
	 */
	private $font;

	/**
	 * Finished page content streams.
	 *
	 * @var string[]
	 */
	private $pages = array();

	/**
	 * Content stream of the page being drawn.
	 *
	 * @var string
	 */
	private $stream = '';

	/**
	 * Current baseline cursor, measured from the page bottom.
	 *
	 * @var float
	 */
	private $y = 0.0;

	/**
	 * Cover logo: jpeg_bytes, w, h, max_display.
	 *
	 * @var array<string,mixed>
	 */
	private $logo = array();

	/**
	 * Generated reports are written to the uploads folder; anything older than this is
	 * swept by the daily cron rather than accumulating forever.
	 */
	public const KEEP_FILES_DAYS = 7;

	/**
	 * Deletes generated report PDFs past {@see KEEP_FILES_DAYS}.
	 *
	 * @return int Files removed.
	 */
	public static function purge_generated_files(): int {
		$uploads = wp_upload_dir();
		if ( empty( $uploads['basedir'] ) ) {
			return 0;
		}

		$dir = trailingslashit( (string) $uploads['basedir'] ) . dirname( nexulesuite_PLUGIN_BASENAME );
		if ( ! is_dir( $dir ) ) {
			return 0;
		}

		$files = glob( trailingslashit( $dir ) . '*.pdf' );
		if ( ! is_array( $files ) ) {
			return 0;
		}

		$cutoff  = time() - ( self::KEEP_FILES_DAYS * DAY_IN_SECONDS );
		$removed = 0;
		foreach ( $files as $file ) {
			if ( is_file( $file ) && filemtime( $file ) < $cutoff && wp_delete_file_from_directory( $file, $dir ) ) {
				++$removed;
			}
		}

		return $removed;
	}

	/**
	 * Builds the PDF bytes for a report.
	 *
	 * @param array<string,mixed> $report Output of {@see Report_Source::fetch()}.
	 * @param array<string,mixed> $logo   Optional jpeg_bytes/w/h/max_display.
	 * @return string PDF bytes.
	 * @throws \RuntimeException When the bundled font cannot be read.
	 */
	public static function build( array $report, array $logo = array() ): string {
		require_once nexulesuite_PLUGIN_DIR . 'core/class-pdf-font.php';

		$writer = new self();
		$writer->font = new Pdf_Font( nexulesuite_PLUGIN_DIR . 'assets/fonts/NotoSans-Regular.ttf' );
		$writer->logo = ( isset( $logo['jpeg_bytes'], $logo['w'], $logo['h'] ) && is_string( $logo['jpeg_bytes'] ) ) ? $logo : array();

		$writer->render( $report );

		return $writer->assemble();
	}

	/**
	 * Draws every requested section.
	 *
	 * @param array<string,mixed> $report Report payload.
	 * @return void
	 */
	private function render( array $report ): void {
		$meta     = isset( $report['meta'] ) && is_array( $report['meta'] ) ? $report['meta'] : array();
		$sections = isset( $meta['sections'] ) && is_array( $meta['sections'] ) ? $meta['sections'] : array();

		$this->new_page();
		$this->cover( $meta );

		if ( in_array( 'summary', $sections, true ) && is_array( $report['summary'] ?? null ) ) {
			$this->summary_section( $report['summary'], $meta );
		}
		if ( in_array( 'forms', $sections, true ) && is_array( $report['forms'] ?? null ) ) {
			$this->forms_section( $report['forms'], $meta );
		}
		if ( in_array( 'chats', $sections, true ) && is_array( $report['chats'] ?? null ) ) {
			$this->chats_section( $report['chats'] );
		}
		if ( in_array( 'activities', $sections, true ) && is_array( $report['activities'] ?? null ) ) {
			$this->activities_section( $report['activities'] );
		}

		$this->end_page();
		$this->add_footers( (string) ( $meta['siteTitle'] ?? '' ) );
	}

	/* ── sections ──────────────────────────────────────────────────────── */

	/**
	 * Logo, title and the filters the report was built with.
	 *
	 * @param array<string,mixed> $meta Report meta.
	 * @return void
	 */
	private function cover( array $meta ): void {
		if ( ! empty( $this->logo ) ) {
			$max = max( 100, min( 1000, (int) ( $this->logo['max_display'] ?? 400 ) ) );
			$box = min( (float) $max, self::PAGE_W - ( 2 * self::MARGIN ), self::PAGE_H * 0.28 );
			$w   = (float) $this->logo['w'];
			$h   = (float) $this->logo['h'];
			$s   = min( $box / $w, $box / $h );
			$dw  = $w * $s;
			$dh  = $h * $s;
			$x   = ( self::PAGE_W - $dw ) / 2;

			$this->y -= $dh;
			$this->stream .= sprintf( "q\n%s 0 0 %s %s %s cm\n/Im1 Do\nQ\n", $this->num( $dw ), $this->num( $dh ), $this->num( $x ), $this->num( $this->y ) );
			$this->y -= 18;
		}

		$this->center( (string) ( $meta['siteTitle'] ?? 'Report' ), 20, true, self::INK );
		$this->y -= 6;
		$this->center( __( 'Leads & Conversations Report', 'nexus-lead-suite' ), 12, false, self::MUTED );
		$this->y -= 4;
		$this->center(
			sprintf(
				/* translators: %s: generation timestamp. */
				__( 'Generated %s', 'nexus-lead-suite' ),
				(string) ( $meta['generatedAt'] ?? '' )
			),
			9,
			false,
			self::MUTED
		);

		$range = $this->date_range_label( $meta );
		if ( '' !== $range ) {
			$this->y -= 2;
			$this->center( $range, 9, false, self::MUTED );
		}

		$this->y -= 14;
		$this->rule();
		$this->y -= 12;
	}

	/**
	 * Describes the filters the report was built with, or '' when unfiltered.
	 *
	 * @param array<string,mixed> $meta Report meta.
	 * @return string
	 */
	private function date_range_label( array $meta ): string {
		$from   = (string) ( $meta['from'] ?? '' );
		$to     = (string) ( $meta['to'] ?? '' );
		$search = (string) ( $meta['search'] ?? '' );
		$parts  = array();

		if ( '' !== $from && '' !== $to ) {
			/* translators: 1: start date, 2: end date. */
			$parts[] = sprintf( __( '%1$s to %2$s', 'nexus-lead-suite' ), $from, $to );
		} elseif ( '' !== $from ) {
			/* translators: %s: start date. */
			$parts[] = sprintf( __( 'From %s', 'nexus-lead-suite' ), $from );
		} elseif ( '' !== $to ) {
			/* translators: %s: end date. */
			$parts[] = sprintf( __( 'Up to %s', 'nexus-lead-suite' ), $to );
		}

		if ( '' !== $search ) {
			/* translators: %s: search term. */
			$parts[] = sprintf( __( 'matching “%s”', 'nexus-lead-suite' ), $search );
		}

		return implode( '  ·  ', $parts );
	}

	/**
	 * Headline counts.
	 *
	 * @param array<string,mixed> $summary Summary block.
	 * @param array<string,mixed> $meta    Report meta.
	 * @return void
	 */
	private function summary_section( array $summary, array $meta ): void {
		$this->heading( __( 'Summary', 'nexus-lead-suite' ) );

		$cards = array(
			array( __( 'Form submissions', 'nexus-lead-suite' ), (string) ( $summary['formSubmissions'] ?? 0 ) ),
		);
		if ( array_key_exists( 'conversations', $summary ) ) {
			$cards[] = array( __( 'Conversations', 'nexus-lead-suite' ), (string) $summary['conversations'] );
			$cards[] = array( __( 'Chat messages', 'nexus-lead-suite' ), (string) ( $summary['messages'] ?? 0 ) );
			$cards[] = array( __( 'With images', 'nexus-lead-suite' ), (string) ( $summary['withImages'] ?? 0 ) );
		}

		$this->stat_cards( $cards );

		$retention = (int) ( $meta['retentionDays'] ?? 0 );
		if ( $retention > 0 ) {
			$this->y -= 4;
			$this->paragraph(
				sprintf(
					/* translators: %d: retention window in days. */
					__( 'Form answers are retained for %d days; older submissions appear as activity entries only.', 'nexus-lead-suite' ),
					$retention
				),
				8.5,
				self::MUTED
			);
		}
		$this->y -= 10;
	}

	/**
	 * One block per submission, with every submitted field.
	 *
	 * @param array<int,array<string,mixed>> $forms Submissions.
	 * @param array<string,mixed>            $meta  Report meta.
	 * @return void
	 */
	private function forms_section( array $forms, array $meta ): void {
		$this->heading( sprintf( '%s (%d)', __( 'Form submissions', 'nexus-lead-suite' ), count( $forms ) ) );

		if ( empty( $forms ) ) {
			$this->paragraph( __( 'No submissions in this period.', 'nexus-lead-suite' ), 9.5, self::MUTED );
			$this->y -= 10;
			return;
		}

		foreach ( $forms as $form ) {
			$this->need( 60 );
			$this->text( (string) ( $form['formName'] ?? '' ), self::MARGIN, 11, true, self::INK );
			$this->y -= 13;

			$sub = (string) ( $form['submittedAt'] ?? '' );
			if ( null !== ( $form['mailSent'] ?? null ) ) {
				$sub .= '  ·  ' . ( $form['mailSent'] ? __( 'Notification sent', 'nexus-lead-suite' ) : __( 'Notification not sent', 'nexus-lead-suite' ) );
			}
			$this->text( $sub, self::MARGIN, 8.5, false, self::MUTED );
			$this->y -= 14;

			foreach ( (array) ( $form['fields'] ?? array() ) as $field ) {
				$this->field_row( (string) ( $field['label'] ?? '' ), (string) ( $field['value'] ?? '' ) );
			}

			$this->y -= 6;
			$this->rule( self::BORDER );
			$this->y -= 12;
		}
	}

	/**
	 * One block per conversation, with the full transcript.
	 *
	 * @param array<int,array<string,mixed>> $chats Conversations.
	 * @return void
	 */
	private function chats_section( array $chats ): void {
		$this->heading( sprintf( '%s (%d)', __( 'Chat conversations', 'nexus-lead-suite' ), count( $chats ) ) );

		if ( empty( $chats ) ) {
			$this->paragraph( __( 'No conversations in this period.', 'nexus-lead-suite' ), 9.5, self::MUTED );
			$this->y -= 10;
			return;
		}

		$index = 0;
		foreach ( $chats as $chat ) {
			++$index;
			$this->need( 70 );

			$this->text(
				sprintf(
					/* translators: 1: conversation number, 2: message count. */
					__( 'Conversation %1$d — %2$d messages', 'nexus-lead-suite' ),
					$index,
					(int) ( $chat['messageCount'] ?? 0 )
				),
				self::MARGIN,
				11,
				true,
				self::INK
			);
			$this->y -= 13;
			$this->text( (string) ( $chat['lastAt'] ?? '' ), self::MARGIN, 8.5, false, self::MUTED );
			$this->y -= 15;

			foreach ( (array) ( $chat['transcript'] ?? array() ) as $turn ) {
				$question = trim( (string) ( $turn['question'] ?? '' ) );
				if ( '' === $question && ! empty( $turn['hasImage'] ) ) {
					$question = __( '(image attached)', 'nexus-lead-suite' );
				}
				if ( '' !== $question ) {
					$this->speaker_block( __( 'Visitor', 'nexus-lead-suite' ), $question, self::PRIMARY );
				}
				$this->speaker_block( __( 'Assistant', 'nexus-lead-suite' ), (string) ( $turn['answer'] ?? '' ), self::BODY );
			}

			$this->y -= 4;
			$this->rule( self::BORDER );
			$this->y -= 12;
		}
	}

	/**
	 * The activity log, as a wrapping table.
	 *
	 * @param array<int,array<string,mixed>> $rows Activity rows.
	 * @return void
	 */
	private function activities_section( array $rows ): void {
		$this->heading( sprintf( '%s (%d)', __( 'Activity', 'nexus-lead-suite' ), count( $rows ) ) );

		if ( empty( $rows ) ) {
			$this->paragraph( __( 'No activity in this period.', 'nexus-lead-suite' ), 9.5, self::MUTED );
			return;
		}

		$widths = array( 150.0, 80.0, 100.0, 186.0 );
		$header = array(
			__( 'Action', 'nexus-lead-suite' ),
			__( 'Type', 'nexus-lead-suite' ),
			__( 'Date', 'nexus-lead-suite' ),
			__( 'Page', 'nexus-lead-suite' ),
		);

		$this->table_header( $header, $widths );
		foreach ( $rows as $row ) {
			$this->table_row(
				array(
					(string) ( $row['actionName'] ?? '' ),
					(string) ( $row['category'] ?? '' ),
					(string) ( $row['dateTime'] ?? '' ),
					(string) ( $row['pageUrl'] ?? '' ),
				),
				$widths,
				$header
			);
		}
	}

	/* ── building blocks ───────────────────────────────────────────────── */

	/**
	 * Section title with a rule under it.
	 *
	 * @param string $title Title.
	 * @return void
	 */
	private function heading( string $title ): void {
		$this->need( 44 );
		$this->text( $title, self::MARGIN, 13, true, self::INK );
		$this->y -= 8;
		$this->rule( self::BORDER );
		$this->y -= 16;
	}

	/**
	 * A row of label/value boxes.
	 *
	 * @param array<int,array{0:string,1:string}> $cards Label/value pairs.
	 * @return void
	 */
	private function stat_cards( array $cards ): void {
		if ( empty( $cards ) ) {
			return;
		}

		$this->need( 56 );
		$gap   = 10.0;
		$total = self::PAGE_W - ( 2 * self::MARGIN );
		$w     = ( $total - ( $gap * ( count( $cards ) - 1 ) ) ) / count( $cards );
		$h     = 46.0;
		$top   = $this->y;

		$x = self::MARGIN;
		foreach ( $cards as $card ) {
			$this->rect( $x, $top - $h, $w, $h, self::TINT, self::BORDER );
			$this->text( $card[1], $x + 10, 17, true, self::INK, $top - 24 );
			$this->text( $this->fit( $card[0], $w - 20, 7.5 ), $x + 10, 7.5, false, self::MUTED, $top - 36 );
			$x += $w + $gap;
		}

		$this->y = $top - $h - 6;
	}

	/**
	 * `Label: value` with the value wrapped in the remaining width.
	 *
	 * @param string $label Field label.
	 * @param string $value Field value.
	 * @return void
	 */
	private function field_row( string $label, string $value ): void {
		$label_w = 130.0;
		$value_w = self::PAGE_W - ( 2 * self::MARGIN ) - $label_w;
		$lines   = $this->wrap( '' !== $value ? $value : '—', $value_w, 9.5 );

		$this->need( count( $lines ) * 13 + 4 );
		$top = $this->y;

		$this->text( $this->fit( $label, $label_w - 8, 9.5 ), self::MARGIN, 9.5, false, self::MUTED, $top );
		foreach ( $lines as $i => $line ) {
			$this->text( $line, self::MARGIN + $label_w, 9.5, false, self::BODY, $top - ( $i * 13 ) );
		}

		$this->y = $top - ( count( $lines ) * 13 );
	}

	/**
	 * A speaker label followed by its wrapped message.
	 *
	 * @param string $who   Speaker.
	 * @param string $text  Message.
	 * @param string $color Speaker colour.
	 * @return void
	 */
	private function speaker_block( string $who, string $text, string $color ): void {
		$text = trim( $text );
		if ( '' === $text ) {
			return;
		}

		$indent = 14.0;
		$width  = self::PAGE_W - ( 2 * self::MARGIN ) - $indent;

		$this->need( 26 );
		$this->text( $who, self::MARGIN + $indent, 8.5, true, $color );
		$this->y -= 12;

		foreach ( $this->wrap( $text, $width, 9.5 ) as $line ) {
			$this->need( 13 );
			$this->text( $line, self::MARGIN + $indent, 9.5, false, self::BODY );
			$this->y -= 12.5;
		}
		$this->y -= 6;
	}

	/**
	 * Table header band.
	 *
	 * @param string[] $labels Column labels.
	 * @param float[]  $widths Column widths.
	 * @return void
	 */
	private function table_header( array $labels, array $widths ): void {
		// Reserve the header plus a first row, or the header strands itself at a page foot.
		$this->need( 50 );
		$h = 20.0;
		$top = $this->y;
		$this->rect( self::MARGIN, $top - $h, array_sum( $widths ), $h, self::TINT, self::BORDER );

		$x = self::MARGIN;
		foreach ( $labels as $i => $label ) {
			$this->text( $label, $x + 6, 8.5, true, self::INK, $top - 14 );
			$x += $widths[ $i ];
		}
		$this->y = $top - $h;
	}

	/**
	 * Table row whose height grows to fit the tallest wrapped cell.
	 *
	 * @param string[] $cells  Cell texts.
	 * @param float[]  $widths Column widths.
	 * @param string[] $header Header labels, redrawn after a page break.
	 * @return void
	 */
	private function table_row( array $cells, array $widths, array $header ): void {
		$wrapped = array();
		$max     = 1;
		foreach ( $cells as $i => $cell ) {
			$lines        = $this->wrap( $cell, $widths[ $i ] - 12, 8.5 );
			$wrapped[ $i ] = $lines;
			$max           = max( $max, count( $lines ) );
		}

		$h = ( $max * 11 ) + 8;
		if ( $this->y - $h < self::MARGIN + 24 ) {
			$this->end_page();
			$this->new_page();
			$this->table_header( $header, $widths );
		}

		$top = $this->y;
		$x   = self::MARGIN;
		foreach ( $wrapped as $i => $lines ) {
			foreach ( $lines as $n => $line ) {
				$this->text( $line, $x + 6, 8.5, false, self::BODY, $top - 12 - ( $n * 11 ) );
			}
			$x += $widths[ $i ];
		}

		$this->y = $top - $h;
		$this->line( self::MARGIN, $this->y, self::MARGIN + array_sum( $widths ), $this->y, self::BORDER );
	}

	/* ── primitives ────────────────────────────────────────────────────── */

	/**
	 * Starts a page.
	 *
	 * @return void
	 */
	private function new_page(): void {
		$this->stream = '';
		$this->y      = self::PAGE_H - self::MARGIN;
	}

	/**
	 * Finishes the current page.
	 *
	 * @return void
	 */
	private function end_page(): void {
		$this->pages[] = $this->stream;
		$this->stream  = '';
	}

	/**
	 * Breaks to a new page when the next block would not fit.
	 *
	 * @param float $height Needed height.
	 * @return void
	 */
	private function need( float $height ): void {
		if ( $this->y - $height < self::MARGIN + 24 ) {
			$this->end_page();
			$this->new_page();
		}
	}

	/**
	 * Draws one line of text. Bold is synthesised by stroking the glyph outline, so a
	 * single embedded weight covers both — a second font file would add ~570 KB.
	 *
	 * @param string     $text  UTF-8 text.
	 * @param float      $x     Left edge.
	 * @param float      $size  Font size.
	 * @param bool       $bold  Faux bold.
	 * @param string     $color `r g b` fill colour.
	 * @param float|null $y     Baseline; defaults to the cursor.
	 * @return void
	 */
	private function text( string $text, float $x, float $size, bool $bold = false, string $color = self::BODY, ?float $y = null ): void {
		$hex = $this->font->hex_string( $text );
		if ( '<>' === $hex ) {
			return;
		}
		$y = ( null === $y ) ? $this->y : $y;

		$this->stream .= "BT\n" . $color . " rg\n";
		if ( $bold ) {
			$this->stream .= $color . " RG\n" . $this->num( $size * 0.032 ) . " w\n2 Tr\n";
		}
		$this->stream .= sprintf( "/F1 %s Tf\n1 0 0 1 %s %s Tm\n%s Tj\n", $this->num( $size ), $this->num( $x ), $this->num( $y ), $hex );
		if ( $bold ) {
			$this->stream .= "0 Tr\n";
		}
		$this->stream .= "ET\n";
	}

	/**
	 * Centred single line, consuming vertical space.
	 *
	 * @param string $text  Text.
	 * @param float  $size  Font size.
	 * @param bool   $bold  Faux bold.
	 * @param string $color Colour.
	 * @return void
	 */
	private function center( string $text, float $size, bool $bold, string $color ): void {
		$this->y -= $size + 4;
		$w = $this->font->text_width( $text, $size );
		$this->text( $text, ( self::PAGE_W - $w ) / 2, $size, $bold, $color );
	}

	/**
	 * Wrapped paragraph, consuming vertical space.
	 *
	 * @param string $text  Text.
	 * @param float  $size  Font size.
	 * @param string $color Colour.
	 * @return void
	 */
	private function paragraph( string $text, float $size, string $color ): void {
		foreach ( $this->wrap( $text, self::PAGE_W - ( 2 * self::MARGIN ), $size ) as $line ) {
			$this->need( $size + 5 );
			$this->text( $line, self::MARGIN, $size, false, $color );
			$this->y -= $size + 3;
		}
	}

	/**
	 * Splits text into lines that fit a width, measured on real glyph advances.
	 * Honours existing newlines and breaks over-long words (URLs) mid-token.
	 *
	 * @param string $text  Text.
	 * @param float  $width Available width.
	 * @param float  $size  Font size.
	 * @return string[]
	 */
	private function wrap( string $text, float $width, float $size ): array {
		$text = str_replace( array( "\r\n", "\r" ), "\n", trim( $text ) );
		if ( '' === $text ) {
			return array( '' );
		}

		$lines = array();
		foreach ( explode( "\n", $text ) as $paragraph ) {
			$line = '';
			foreach ( preg_split( '/\s+/', $paragraph ) ?: array() as $word ) {
				if ( '' === $word ) {
					continue;
				}
				$candidate = ( '' === $line ) ? $word : $line . ' ' . $word;
				if ( $this->font->text_width( $candidate, $size ) <= $width ) {
					$line = $candidate;
					continue;
				}
				if ( '' !== $line ) {
					$lines[] = $line;
					$line    = '';
				}
				// A single token wider than the column (a long URL) must be split.
				while ( $this->font->text_width( $word, $size ) > $width && mb_strlen( $word ) > 1 ) {
					$cut = 1;
					while ( $cut < mb_strlen( $word ) && $this->font->text_width( mb_substr( $word, 0, $cut + 1 ), $size ) <= $width ) {
						++$cut;
					}
					$lines[] = mb_substr( $word, 0, $cut );
					$word    = mb_substr( $word, $cut );
				}
				$line = $word;
			}
			$lines[] = $line;
		}

		return empty( $lines ) ? array( '' ) : $lines;
	}

	/**
	 * Truncates to fit a width, appending an ellipsis.
	 *
	 * @param string $text  Text.
	 * @param float  $width Available width.
	 * @param float  $size  Font size.
	 * @return string
	 */
	private function fit( string $text, float $width, float $size ): string {
		if ( $this->font->text_width( $text, $size ) <= $width ) {
			return $text;
		}
		while ( mb_strlen( $text ) > 1 && $this->font->text_width( $text . '…', $size ) > $width ) {
			$text = mb_substr( $text, 0, mb_strlen( $text ) - 1 );
		}

		return $text . '…';
	}

	/**
	 * Filled + stroked rectangle.
	 *
	 * @param float  $x      Left.
	 * @param float  $y      Bottom.
	 * @param float  $w      Width.
	 * @param float  $h      Height.
	 * @param string $fill   Fill colour.
	 * @param string $stroke Stroke colour.
	 * @return void
	 */
	private function rect( float $x, float $y, float $w, float $h, string $fill, string $stroke ): void {
		$this->stream .= sprintf(
			"%s rg\n%s RG\n0.6 w\n%s %s %s %s re\nB\n",
			$fill,
			$stroke,
			$this->num( $x ),
			$this->num( $y ),
			$this->num( $w ),
			$this->num( $h )
		);
	}

	/**
	 * Horizontal rule at the cursor.
	 *
	 * @param string $color Colour.
	 * @return void
	 */
	private function rule( string $color = self::BORDER ): void {
		$this->line( self::MARGIN, $this->y, self::PAGE_W - self::MARGIN, $this->y, $color );
	}

	/**
	 * Straight line.
	 *
	 * @param float  $x1    Start x.
	 * @param float  $y1    Start y.
	 * @param float  $x2    End x.
	 * @param float  $y2    End y.
	 * @param string $color Colour.
	 * @return void
	 */
	private function line( float $x1, float $y1, float $x2, float $y2, string $color ): void {
		$this->stream .= sprintf(
			"%s RG\n0.6 w\n%s %s m\n%s %s l\nS\n",
			$color,
			$this->num( $x1 ),
			$this->num( $y1 ),
			$this->num( $x2 ),
			$this->num( $y2 )
		);
	}

	/**
	 * Adds `Site — Page N of M` to the bottom of every page, now that M is known.
	 *
	 * @param string $site_title Site name.
	 * @return void
	 */
	private function add_footers( string $site_title ): void {
		$total = count( $this->pages );
		foreach ( $this->pages as $index => $stream ) {
			$label = sprintf(
				/* translators: 1: site title, 2: page number, 3: total pages. */
				__( '%1$s — page %2$d of %3$d', 'nexus-lead-suite' ),
				$site_title,
				$index + 1,
				$total
			);
			$hex = $this->font->hex_string( $label );
			if ( '<>' === $hex ) {
				continue;
			}
			$x = ( self::PAGE_W - $this->font->text_width( $label, 8 ) ) / 2;

			$this->pages[ $index ] = $stream . sprintf(
				"BT\n%s rg\n/F1 8 Tf\n1 0 0 1 %s %s Tm\n%s Tj\nET\n",
				self::MUTED,
				$this->num( $x ),
				$this->num( self::MARGIN - 16 ),
				$hex
			);
		}
	}

	/* ── file assembly ─────────────────────────────────────────────────── */

	/**
	 * Serialises the object graph into PDF bytes.
	 *
	 * @return string
	 */
	private function assemble(): string {
		$catalog_id = 1;
		$pages_id   = 2;

		$font      = $this->font->pdf_objects( 3 );
		$next      = 3 + $this->font->object_count();
		$image_id  = 0;
		$has_logo  = ! empty( $this->logo );

		if ( $has_logo ) {
			$image_id = $next;
			++$next;
		}

		$page_ids    = array();
		$content_ids = array();
		foreach ( $this->pages as $i => $unused ) {
			$page_ids[ $i ]    = $next++;
			$content_ids[ $i ] = $next++;
		}

		$resources = '<< /Font << /F1 ' . $font['font_id'] . ' 0 R >>'
			. ( $has_logo ? ' /XObject << /Im1 ' . $image_id . ' 0 R >>' : '' )
			. ' >>';

		$objects = array();
		$objects[ $catalog_id ] = '<< /Type /Catalog /Pages ' . $pages_id . ' 0 R >>';

		$kids = array();
		foreach ( $page_ids as $id ) {
			$kids[] = $id . ' 0 R';
		}
		$objects[ $pages_id ] = '<< /Type /Pages /Count ' . count( $page_ids ) . ' /Kids [' . implode( ' ', $kids ) . '] >>';

		foreach ( $font['objects'] as $id => $body ) {
			$objects[ $id ] = $body;
		}

		if ( $has_logo ) {
			$jpeg           = (string) $this->logo['jpeg_bytes'];
			$objects[ $image_id ] = '<< /Type /XObject /Subtype /Image /Width ' . (int) $this->logo['w']
				. ' /Height ' . (int) $this->logo['h']
				. ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' . strlen( $jpeg ) . " >>\nstream\n" . $jpeg . "\nendstream";
		}

		foreach ( $this->pages as $i => $stream ) {
			$objects[ $page_ids[ $i ] ] = '<< /Type /Page /Parent ' . $pages_id . ' 0 R'
				. ' /MediaBox [0 0 ' . $this->num( self::PAGE_W ) . ' ' . $this->num( self::PAGE_H ) . ']'
				. ' /Resources ' . $resources
				. ' /Contents ' . $content_ids[ $i ] . ' 0 R >>';

			$deflated = gzcompress( $stream, 9 );
			if ( false === $deflated ) {
				$objects[ $content_ids[ $i ] ] = '<< /Length ' . strlen( $stream ) . " >>\nstream\n" . $stream . "\nendstream";
			} else {
				$objects[ $content_ids[ $i ] ] = '<< /Length ' . strlen( $deflated ) . " /Filter /FlateDecode >>\nstream\n" . $deflated . "\nendstream";
			}
		}

		ksort( $objects );

		$pdf     = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
		$offsets = array();
		foreach ( $objects as $id => $body ) {
			$offsets[ $id ] = strlen( $pdf );
			$pdf           .= $id . " 0 obj\n" . $body . "\nendobj\n";
		}

		$xref_at = strlen( $pdf );
		$count   = count( $objects ) + 1;

		$pdf .= "xref\n0 " . $count . "\n0000000000 65535 f \n";
		for ( $id = 1; $id < $count; $id++ ) {
			$pdf .= sprintf( "%010d 00000 n \n", $offsets[ $id ] ?? 0 );
		}
		$pdf .= "trailer\n<< /Size " . $count . ' /Root ' . $catalog_id . " 0 R >>\nstartxref\n" . $xref_at . "\n%%EOF";

		return $pdf;
	}

	/**
	 * Formats a coordinate without locale surprises or trailing zeros.
	 *
	 * @param float $value Number.
	 * @return string
	 */
	private function num( float $value ): string {
		return rtrim( rtrim( number_format( $value, 3, '.', '' ), '0' ), '.' ) ?: '0';
	}
}
