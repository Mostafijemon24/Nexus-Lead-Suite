<?php
/**
 * Minimal PDF generator (no external dependencies).
 *
 * Notes:
 * - Generates PDFs with basic text, optional logo, and simple tables (activities report may span pages).
 * - Intended for lightweight admin reports.
 *
 * @package Nexus_Lead_Suite
 */

declare(strict_types=1);

namespace Nexus_Lead_Suite;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Very small single-page PDF builder.
 */
final class Simple_Pdf {

	/**
	 * Builds a single-page PDF with provided lines.
	 *
	 * @param string[] $lines Text lines.
	 * @return string PDF binary string.
	 */
	public static function build_text_pdf( array $lines ): string {
		$lines = array_values(
			array_filter(
				array_map(
					static function ( $v ): string {
						$v = is_string( $v ) ? $v : '';
						$v = wp_strip_all_tags( $v );
						$v = preg_replace( '/\s+/', ' ', $v );
						return (string) $v;
					},
					$lines
				)
			)
		);

		if ( empty( $lines ) ) {
			$lines = array( 'Report' );
		}

		// Content stream: text at left margin, descending.
		$y        = 800; // points.
		$content  = "BT\n/F1 12 Tf\n72 {$y} Td\n";
		$max_lines = 55;
		$count     = 0;

		foreach ( $lines as $line ) {
			if ( $count >= $max_lines ) {
				break;
			}
			$content .= '(' . self::pdf_escape_text( $line ) . ") Tj\n";
			$content .= "0 -14 Td\n";
			$count++;
		}

		$content .= "ET\n";

		$objects = array();

		// 1: Catalog.
		$objects[] = "<< /Type /Catalog /Pages 2 0 R >>";
		// 2: Pages.
		$objects[] = "<< /Type /Pages /Kids [3 0 R] /Count 1 >>";
		// 3: Page.
		$objects[] = "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>";
		// 4: Font.
		$objects[] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
		// 5: Contents stream.
		$objects[] = "<< /Length " . strlen( $content ) . " >>\nstream\n{$content}\nendstream";

		$pdf     = "%PDF-1.4\n";
		$offsets = array( 0 );

		// Build body.
		foreach ( $objects as $i => $obj ) {
			$offsets[] = strlen( $pdf );
			$obj_num   = $i + 1;
			$pdf      .= "{$obj_num} 0 obj\n{$obj}\nendobj\n";
		}

		// xref.
		$xref_offset = strlen( $pdf );
		$pdf        .= "xref\n0 " . ( count( $objects ) + 1 ) . "\n";
		$pdf        .= "0000000000 65535 f \n";

		for ( $i = 1; $i <= count( $objects ); $i++ ) {
			$pdf .= sprintf( "%010d 00000 n \n", $offsets[ $i ] );
		}

		// trailer.
		$pdf .= "trailer\n<< /Size " . ( count( $objects ) + 1 ) . " /Root 1 0 R >>\n";
		$pdf .= "startxref\n{$xref_offset}\n%%EOF";

		return $pdf;
	}

	/**
	 * Builds an Activities report PDF with optional logo and a 3-column table (Action, Mail, Page URL).
	 * Splits across multiple pages when rows exceed the first page / continuation capacities.
	 *
	 * @param string              $site_title Site title.
	 * @param array<string,mixed> $generated_info Generated info (date/time line).
	 * @param array<int,array{identifier:string,reference:string,mail_status?:string}> $rows Table rows.
	 * @param array<string,mixed> $logo Optional logo data: ['jpeg_bytes'=>string,'w'=>int,'h'=>int,'max_display'=>int] or empty.
	 *                                        max_display: 100–1000 (points-ish box side); larger dimension of the image fits inside this square.
	 * @return string
	 */
	public static function build_activities_report_pdf( string $site_title, array $generated_info, array $rows, array $logo = array() ): string {
		$site_title = wp_strip_all_tags( $site_title );
		$site_title = preg_replace( '/\s+/', ' ', (string) $site_title );
		$site_title = (string) $site_title;

		$date_line = isset( $generated_info['date_line'] ) ? (string) $generated_info['date_line'] : '';
		$date_line = wp_strip_all_tags( $date_line );
		$date_line = preg_replace( '/\s+/', ' ', (string) $date_line );

		$page_w  = 612;
		$page_h  = 792;
		$margin  = 48;
		$row_h   = 22;
		$pad_x   = 8;
		$table_x = $margin;
		$table_w = $page_w - ( 2 * $margin );
		$col1_w  = 168;
		$col2_w  = 92;
		$col3_w  = $table_w - $col1_w - $col2_w;

		$has_logo = isset( $logo['jpeg_bytes'], $logo['w'], $logo['h'] ) && is_string( $logo['jpeg_bytes'] );

		$y_measure = self::activities_pdf_y_after_first_page_pre_table( $page_w, $page_h, $margin, $row_h, $has_logo, $logo );
		$rows_first = max( 1, (int) floor( ( $y_measure - (float) $margin ) / $row_h ) );

		$y_cont    = (float) $page_h - (float) $margin - 28.0 - (float) $row_h;
		$rows_cont = max( 1, (int) floor( ( $y_cont - (float) $margin ) / $row_h ) );

		$rows   = array_values( $rows );
		$n      = count( $rows );
		$chunks = array();
		if ( 0 === $n ) {
			$chunks[] = array();
		} else {
			$at    = 0;
			$first = true;
			while ( $at < $n ) {
				$cap  = $first ? $rows_first : $rows_cont;
				$take = min( $cap, $n - $at );
				if ( $take < 1 ) {
					$take = min( 1, $n - $at );
				}
				$chunks[] = array_slice( $rows, $at, $take );
				$at      += $take;
				$first    = false;
			}
		}

		$total_pages  = count( $chunks );
		$page_streams = array();

		foreach ( $chunks as $pi => $slice ) {
			$c = '';
			if ( 0 === $pi ) {
				$c .= self::activities_pdf_fragment_logo_stream( $page_w, $page_h, $margin, $has_logo, $logo );
				$y = (float) $page_h - (float) $margin;
				if ( $has_logo ) {
					$y = self::activities_pdf_y_after_logo( $page_w, $page_h, $margin, $logo, $y );
				}
				$tb = self::activities_pdf_fragment_title_block( $page_w, $margin, $site_title, $date_line, $y );
				$c .= $tb[0];
				$y  = $tb[1];
				$c .= "BT\n/F1 12 Tf\n";
				$c .= sprintf( "%.2f %.2f Td\n", (float) $margin, (float) $y );
				$c .= "(All Activities) Tj\nET\n";
				$y -= 18.0;
			} else {
				$y         = (float) $page_h - (float) $margin;
				$pn        = $pi + 1;
				$cont_line = $site_title . ' Activity Report — page ' . $pn . ' of ' . $total_pages;
				$fs        = 9;
				$cx        = self::pdf_center_x( $page_w, $cont_line, $fs );
				$c        .= "BT\n/F1 {$fs} Tf\n";
				$c        .= sprintf( "%.2f %.2f Td\n", (float) $cx, (float) ( $y - 12.0 ) );
				$c        .= '(' . self::pdf_escape_text( $cont_line ) . ") Tj\nET\n";
				$y        -= 28.0;
			}

			$hdr = self::activities_pdf_fragment_table_header( $y, $table_x, $table_w, $col1_w, $col2_w, $col3_w, $row_h, $pad_x );
			$c  .= $hdr[0];
			$y   = $hdr[1];
			$c  .= self::activities_pdf_fragment_data_rows( $slice, $y, $table_x, $table_w, $col1_w, $col2_w, $col3_w, $row_h, $pad_x );

			$page_streams[] = $c;
		}

		return self::activities_pdf_assemble_multipage_activity( $page_streams, $has_logo, $logo, $page_w, $page_h );
	}

	/**
	 * Vertical position after first-page branding up to (but not including) the table header row.
	 *
	 * @param int                  $page_w Page width.
	 * @param int                  $page_h Page height.
	 * @param int                  $margin Margin.
	 * @param int                  $row_h Row height.
	 * @param bool                 $has_logo Has logo.
	 * @param array<string,mixed> $logo Logo.
	 * @return float Y coordinate for top of table header row.
	 */
	private static function activities_pdf_y_after_first_page_pre_table( int $page_w, int $page_h, int $margin, int $row_h, bool $has_logo, array $logo ): float {
		$y = (float) $page_h - (float) $margin;
		if ( $has_logo ) {
			$y = self::activities_pdf_y_after_logo( $page_w, $page_h, $margin, $logo, $y );
		}
		/* Title, subtitle, divider, All Activities, then table header — same vertical steps as the stream builder. */
		$y -= 20.0 + 18.0 + 44.0 + 18.0 + (float) $row_h;

		return $y;
	}

	/**
	 * Y after drawing the logo (spacing included).
	 *
	 * @param int                  $page_w Page width.
	 * @param int                  $page_h Page height.
	 * @param int                  $margin Margin.
	 * @param array<string,mixed> $logo Logo.
	 * @param float                $y Top y before logo.
	 * @return float
	 */
	private static function activities_pdf_y_after_logo( int $page_w, int $page_h, int $margin, array $logo, float $y ): float {
		$img_w_px = max( 1, (int) $logo['w'] );
		$img_h_px = max( 1, (int) $logo['h'] );
		$box      = isset( $logo['max_display'] ) ? (int) $logo['max_display'] : 400;
		$box      = max( 100, min( 1000, $box ) );
		$box      = min( $box, $page_w - ( 2 * $margin ), (int) floor( $page_h * 0.42 ) );
		$box      = max( 100, $box );
		$scale    = min( (float) $box / (float) $img_w_px, (float) $box / (float) $img_h_px );
		$target_h = max( 1.0, (float) $img_h_px * $scale );
		$y_img    = $y - $target_h;

		return $y_img - 18.0;
	}

	/**
	 * PDF stream fragment for optional logo.
	 *
	 * @param int                  $page_w Page width.
	 * @param int                  $page_h Page height.
	 * @param int                  $margin Margin.
	 * @param bool                 $has_logo Has logo.
	 * @param array<string,mixed> $logo Logo.
	 * @return string
	 */
	private static function activities_pdf_fragment_logo_stream( int $page_w, int $page_h, int $margin, bool $has_logo, array $logo ): string {
		if ( ! $has_logo ) {
			return '';
		}
		$img_w_px = max( 1, (int) $logo['w'] );
		$img_h_px = max( 1, (int) $logo['h'] );
		$box      = isset( $logo['max_display'] ) ? (int) $logo['max_display'] : 400;
		$box      = max( 100, min( 1000, $box ) );
		$box      = min( $box, $page_w - ( 2 * $margin ), (int) floor( $page_h * 0.42 ) );
		$box      = max( 100, $box );
		$scale    = min( (float) $box / (float) $img_w_px, (float) $box / (float) $img_h_px );
		$target_w = max( 1.0, (float) $img_w_px * $scale );
		$target_h = max( 1.0, (float) $img_h_px * $scale );
		$y        = (float) $page_h - (float) $margin;
		$x        = ( (float) $page_w - $target_w ) / 2.0;
		$y_img    = $y - $target_h;
		$s        = "q\n";
		$s       .= sprintf( "%.2f 0 0 %.2f %.2f %.2f cm\n", $target_w, $target_h, $x, $y_img );
		$s       .= "/Im1 Do\nQ\n";

		return $s;
	}

	/**
	 * Title, subtitle, divider (first page).
	 *
	 * @param int    $page_w Page width.
	 * @param int    $margin Margin.
	 * @param string $site_title Site title.
	 * @param string $date_line Date line.
	 * @param float  $y Y after logo block.
	 * @return array{0:string,1:float} Stream and Y after divider (before All Activities).
	 */
	private static function activities_pdf_fragment_title_block( int $page_w, int $margin, string $site_title, string $date_line, float $y ): array {
		$font_size_title = 16;
		$title_x         = self::pdf_center_x( $page_w, $site_title, $font_size_title );
		$s               = "BT\n/F2 {$font_size_title} Tf\n";
		$s              .= sprintf( "%.2f %.2f Td\n", (float) $title_x, (float) $y );
		$s              .= '(' . self::pdf_escape_text( $site_title ) . ") Tj\nET\n";

		$y -= 20.0;
		$subtitle = $site_title . ' Activity Report';
		if ( '' !== $date_line ) {
			$subtitle .= ' - ' . $date_line;
		}
		$font_size_sub = 10;
		$sub_x         = self::pdf_center_x( $page_w, $subtitle, $font_size_sub );
		$s            .= "BT\n/F1 {$font_size_sub} Tf\n";
		$s            .= sprintf( "%.2f %.2f Td\n", (float) $sub_x, (float) $y );
		$s            .= '(' . self::pdf_escape_text( $subtitle ) . ") Tj\nET\n";

		$y -= 18.0;
		$s .= "0.6 w\n";
		$s .= sprintf( "%.2f %.2f m %.2f %.2f l S\n", (float) $margin, (float) $y, (float) ( $page_w - $margin ), (float) $y );
		$y -= 44.0;

		return array( $s, $y );
	}

	/**
	 * Table header row graphics + labels.
	 *
	 * @param float $y Top y of header row.
	 * @return array{0:string,1:float} Content and y after header.
	 */
	private static function activities_pdf_fragment_table_header( float $y, int $table_x, int $table_w, int $col1_w, int $col2_w, int $col3_w, int $row_h, int $pad_x ): array {
		$c  = "0.95 g\n";
		$c .= sprintf( "%.2f %.2f %.2f %.2f re f\n", (float) $table_x, (float) ( $y - $row_h ), (float) $table_w, (float) $row_h );
		$c .= "0 g\n";
		$c .= "0.6 w\n";
		$c .= sprintf( "%.2f %.2f %.2f %.2f re S\n", (float) $table_x, (float) ( $y - $row_h ), (float) $table_w, (float) $row_h );
		$c .= sprintf( "%.2f %.2f m %.2f %.2f l S\n", (float) ( $table_x + $col1_w ), (float) ( $y - $row_h ), (float) ( $table_x + $col1_w ), (float) $y );
		$c .= sprintf( "%.2f %.2f m %.2f %.2f l S\n", (float) ( $table_x + $col1_w + $col2_w ), (float) ( $y - $row_h ), (float) ( $table_x + $col1_w + $col2_w ), (float) $y );

		$c .= "BT\n/F2 9 Tf\n";
		$c .= sprintf( "%.2f %.2f Td\n", (float) ( $table_x + $pad_x ), (float) ( $y - 15 ) );
		$c .= "(Action) Tj\nET\n";

		$c .= "BT\n/F2 9 Tf\n";
		$c .= sprintf( "%.2f %.2f Td\n", (float) ( $table_x + $col1_w + $pad_x ), (float) ( $y - 15 ) );
		$c .= "(Mail) Tj\nET\n";

		$c .= "BT\n/F2 9 Tf\n";
		$c .= sprintf( "%.2f %.2f Td\n", (float) ( $table_x + $col1_w + $col2_w + $pad_x ), (float) ( $y - 15 ) );
		$c .= "(Page URL) Tj\nET\n";

		return array( $c, $y - (float) $row_h );
	}

	/**
	 * Data rows fragment.
	 *
	 * @param array<int,array<string,string>> $slice Rows.
	 * @return string
	 */
	private static function activities_pdf_fragment_data_rows( array $slice, float $y, int $table_x, int $table_w, int $col1_w, int $col2_w, int $col3_w, int $row_h, int $pad_x ): string {
		$c = '';
		foreach ( $slice as $r ) {
			$identifier = isset( $r['identifier'] ) ? (string) $r['identifier'] : '';
			$reference  = isset( $r['reference'] ) ? (string) $r['reference'] : '';
			$mail_st    = isset( $r['mail_status'] ) ? (string) $r['mail_status'] : '';
			$identifier = self::pdf_trim_to_len( $identifier, 36 );
			$mail_st    = self::pdf_trim_to_len( $mail_st, 22 );
			$reference  = self::pdf_trim_to_len( $reference, 70 );

			$c .= sprintf( "%.2f %.2f %.2f %.2f re S\n", (float) $table_x, (float) ( $y - $row_h ), (float) $table_w, (float) $row_h );
			$c .= sprintf( "%.2f %.2f m %.2f %.2f l S\n", (float) ( $table_x + $col1_w ), (float) ( $y - $row_h ), (float) ( $table_x + $col1_w ), (float) $y );
			$c .= sprintf( "%.2f %.2f m %.2f %.2f l S\n", (float) ( $table_x + $col1_w + $col2_w ), (float) ( $y - $row_h ), (float) ( $table_x + $col1_w + $col2_w ), (float) $y );

			$c .= "BT\n/F1 9 Tf\n";
			$c .= sprintf( "%.2f %.2f Td\n", (float) ( $table_x + $pad_x ), (float) ( $y - 15 ) );
			$c .= '(' . self::pdf_escape_text( $identifier ) . ") Tj\nET\n";

			$c .= "BT\n/F1 9 Tf\n";
			$c .= sprintf( "%.2f %.2f Td\n", (float) ( $table_x + $col1_w + $pad_x ), (float) ( $y - 15 ) );
			$c .= '(' . self::pdf_escape_text( $mail_st ) . ") Tj\nET\n";

			$c .= "BT\n/F1 9 Tf\n";
			$c .= sprintf( "%.2f %.2f Td\n", (float) ( $table_x + $col1_w + $col2_w + $pad_x ), (float) ( $y - 15 ) );
			$c .= '(' . self::pdf_escape_text( $reference ) . ") Tj\nET\n";

			$y -= (float) $row_h;
		}

		return $c;
	}

	/**
	 * Assembles multi-page activity PDF object graph.
	 *
	 * @param array<int,string>    $page_streams Content streams per page.
	 * @param bool                 $has_logo Has logo.
	 * @param array<string,mixed> $logo Logo.
	 * @param int                  $page_w Page width.
	 * @param int                  $page_h Page height.
	 * @return string
	 */
	private static function activities_pdf_assemble_multipage_activity( array $page_streams, bool $has_logo, array $logo, int $page_w, int $page_h ): string {
		$p = count( $page_streams );
		if ( $p < 1 ) {
			$page_streams = array( '' );
			$p            = 1;
		}

		$objects   = array();
		$objects[] = '<< /Type /Catalog /Pages 2 0 R >>';

		$kid_parts = array();
		for ( $i = 0; $i < $p; $i++ ) {
			$kid_parts[] = (string) ( 3 + 2 * $i ) . ' 0 R';
		}
		$objects[] = '<< /Type /Pages /Kids [' . implode( ' ', $kid_parts ) . "] /Count {$p} >>";

		$res_num = 2 + 2 * $p + 2 + ( $has_logo ? 2 : 1 );

		for ( $i = 0; $i < $p; $i++ ) {
			$page_num = 3 + 2 * $i;
			$cont_num = 4 + 2 * $i;
			$stream   = (string) $page_streams[ $i ];
			$objects[] = "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {$page_w} {$page_h}] /Resources {$res_num} 0 R /Contents {$cont_num} 0 R >>";
			$objects[] = '<< /Length ' . strlen( $stream ) . " >>\nstream\n{$stream}\nendstream";
		}

		$font1 = 2 + 2 * $p + 1;
		$font2 = 2 + 2 * $p + 2;
		$objects[] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';
		$objects[] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>';

		if ( $has_logo ) {
			$jpeg_bytes = (string) $logo['jpeg_bytes'];
			$img_w_px   = max( 1, (int) $logo['w'] );
			$img_h_px   = max( 1, (int) $logo['h'] );
			$img_num    = $font2 + 1;
			$objects[]  = "<< /Type /XObject /Subtype /Image /Width {$img_w_px} /Height {$img_h_px} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length " . strlen( $jpeg_bytes ) . " >>\nstream\n{$jpeg_bytes}\nendstream";
			$resources  = "<< /Font << /F1 {$font1} 0 R /F2 {$font2} 0 R >> /XObject << /Im1 {$img_num} 0 R >> >>";
		} else {
			$resources = "<< /Font << /F1 {$font1} 0 R /F2 {$font2} 0 R >> >>";
		}

		$objects[] = $resources;

		return self::build_pdf_from_objects( $objects );
	}

	/**
	 * Escapes text for a PDF string literal.
	 *
	 * @param string $text Text.
	 * @return string Escaped.
	 */
	private static function pdf_escape_text( string $text ): string {
		$text = str_replace( array( '\\', '(', ')' ), array( '\\\\', '\\(', '\\)' ), $text );
		// Keep it ASCII-ish to avoid encoding issues in this minimal implementation.
		$text = preg_replace( '/[^\x09\x0A\x0D\x20-\x7E]/', '', $text );
		return (string) $text;
	}

	/**
	 * Trims and normalizes a line for PDF output.
	 *
	 * @param string $text Text.
	 * @param int    $max_len Max length.
	 * @return string
	 */
	private static function pdf_trim_to_len( string $text, int $max_len ): string {
		$text = wp_strip_all_tags( $text );
		$text = preg_replace( '/\s+/', ' ', (string) $text );
		$text = (string) $text;
		if ( strlen( $text ) > $max_len ) {
			$text = substr( $text, 0, $max_len - 1 ) . '…';
		}
		return $text;
	}

	/**
	 * Computes a best-effort centered X for a given text.
	 *
	 * @param int    $page_w Page width.
	 * @param string $text Text.
	 * @param int    $font_size Font size.
	 * @return float
	 */
	private static function pdf_center_x( int $page_w, string $text, int $font_size ): float {
		$text = (string) $text;
		// Approximate width for Helvetica: ~0.5em per char.
		$w = strlen( $text ) * ( $font_size * 0.5 );
		$x = ( $page_w - $w ) / 2;
		return (float) max( 48, $x );
	}

	/**
	 * Builds final PDF bytes with xref/trailer from object strings.
	 *
	 * @param string[] $objects Objects in order.
	 * @return string
	 */
	private static function build_pdf_from_objects( array $objects ): string {
		$pdf     = "%PDF-1.4\n";
		$offsets = array( 0 );

		foreach ( $objects as $i => $obj ) {
			$offsets[] = strlen( $pdf );
			$obj_num   = $i + 1;
			$pdf      .= "{$obj_num} 0 obj\n{$obj}\nendobj\n";
		}

		$xref_offset = strlen( $pdf );
		$pdf        .= "xref\n0 " . ( count( $objects ) + 1 ) . "\n";
		$pdf        .= "0000000000 65535 f \n";

		for ( $i = 1; $i <= count( $objects ); $i++ ) {
			$pdf .= sprintf( "%010d 00000 n \n", $offsets[ $i ] );
		}

		$pdf .= "trailer\n<< /Size " . ( count( $objects ) + 1 ) . " /Root 1 0 R >>\n";
		$pdf .= "startxref\n{$xref_offset}\n%%EOF";

		return $pdf;
	}
}

