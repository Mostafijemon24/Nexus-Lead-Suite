<?php
/**
 * Embeds a TrueType font into a PDF so report text is not limited to ASCII.
 *
 * The legacy writer used the built-in Helvetica and dropped every non-ASCII byte, which
 * silently deleted accents, curly quotes and dashes from reports. This reads the font's
 * own tables and emits a Type0 / CIDFontType2 font with Identity-H encoding plus a
 * /ToUnicode CMap, so the text also stays selectable and searchable in a viewer.
 *
 * Latin, Greek and Cyrillic are covered by the bundled Noto Sans. Complex scripts
 * (Bengali, Devanagari, Arabic) need glyph shaping — reordering and conjunct formation
 * that a cmap lookup cannot do — so they are NOT supported here; the print view exists
 * for those, where the browser does the shaping.
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
 * Parses a TrueType file and produces the PDF objects that embed it.
 */
final class Pdf_Font {

	/**
	 * Raw font bytes.
	 *
	 * @var string
	 */
	private $data;

	/**
	 * Table directory: tag => [offset, length].
	 *
	 * @var array<string, array{int,int}>
	 */
	private $tables = array();

	/**
	 * Design units per em from `head`.
	 *
	 * @var int
	 */
	private $units_per_em = 1000;

	/**
	 * Unicode code point => glyph id, from `cmap` format 4 / 12.
	 *
	 * @var array<int,int>
	 */
	private $cmap = array();

	/**
	 * Glyph id => advance width in design units, from `hmtx`.
	 *
	 * @var array<int,int>
	 */
	private $widths = array();

	/**
	 * Font descriptor metrics.
	 *
	 * @var array<string,int>
	 */
	private $metrics = array();

	/**
	 * Glyph ids actually used, so /W and /ToUnicode stay small.
	 *
	 * @var array<int,int> Glyph id => code point.
	 */
	private $used = array();

	/**
	 * Loads and parses a TrueType file.
	 *
	 * @param string $path Absolute path to a .ttf.
	 * @throws \RuntimeException When the file is missing or not TrueType-outlined.
	 */
	public function __construct( string $path ) {
		if ( ! is_readable( $path ) ) {
			throw new \RuntimeException( 'font_missing' );
		}

		$data = file_get_contents( $path ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents -- local bundled asset, not a remote fetch.
		if ( false === $data || strlen( $data ) < 12 ) {
			throw new \RuntimeException( 'font_unreadable' );
		}
		$this->data = $data;

		// Only plain TrueType outlines; CFF/OpenType ('OTTO') would need a different font dict.
		if ( "\x00\x01\x00\x00" !== substr( $data, 0, 4 ) && 'true' !== substr( $data, 0, 4 ) ) {
			throw new \RuntimeException( 'font_not_truetype' );
		}

		$this->read_table_directory();
		$this->read_head();
		$this->read_metrics();
		$this->read_hmtx();
		$this->read_cmap();
	}

	/**
	 * PostScript-safe base font name.
	 *
	 * @return string
	 */
	public function base_name(): string {
		return 'NotoSans';
	}

	/**
	 * Maps a UTF-8 string to glyph ids, recording them for later subset metadata.
	 * Unmapped code points (e.g. Bengali, emoji) are dropped rather than drawn as tofu.
	 *
	 * @param string $text UTF-8 text.
	 * @return int[]
	 */
	public function glyph_ids( string $text ): array {
		$glyphs = array();
		foreach ( $this->code_points( $text ) as $code ) {
			if ( ! isset( $this->cmap[ $code ] ) ) {
				continue;
			}
			$gid                 = $this->cmap[ $code ];
			$this->used[ $gid ]  = $code;
			$glyphs[]            = $gid;
		}

		return $glyphs;
	}

	/**
	 * Whether a code point has a glyph in this font.
	 *
	 * @param int $code Unicode code point.
	 * @return bool
	 */
	public function has_glyph( int $code ): bool {
		return isset( $this->cmap[ $code ] );
	}

	/**
	 * Width of a string at a given font size, in PDF points.
	 *
	 * @param string $text UTF-8 text.
	 * @param float  $size Font size in points.
	 * @return float
	 */
	public function text_width( string $text, float $size ): float {
		$units = 0;
		foreach ( $this->code_points( $text ) as $code ) {
			if ( ! isset( $this->cmap[ $code ] ) ) {
				continue;
			}
			$gid    = $this->cmap[ $code ];
			$units += $this->widths[ $gid ] ?? 0;
		}

		return ( $units / $this->units_per_em ) * $size;
	}

	/**
	 * A PDF hex string of glyph ids, ready for `Tj` under Identity-H.
	 *
	 * @param string $text UTF-8 text.
	 * @return string e.g. `<00480065>`
	 */
	public function hex_string( string $text ): string {
		$hex = '';
		foreach ( $this->glyph_ids( $text ) as $gid ) {
			$hex .= sprintf( '%04X', $gid );
		}

		return '<' . $hex . '>';
	}

	/**
	 * Builds the PDF objects for this font.
	 *
	 * Object numbers are assigned from `$first_id`; the caller appends the returned
	 * bodies in order and references the Type0 font by the returned `font_id`.
	 *
	 * @param int $first_id Object number of the first object produced.
	 * @return array{font_id:int, objects:array<int,string>}
	 */
	public function pdf_objects( int $first_id ): array {
		$type0_id      = $first_id;
		$cid_id        = $first_id + 1;
		$descriptor_id = $first_id + 2;
		$file_id       = $first_id + 3;
		$tounicode_id  = $first_id + 4;

		$compressed = gzcompress( $this->data, 9 );
		if ( false === $compressed ) {
			$compressed = $this->data;
			$file_dict  = '<< /Length ' . strlen( $compressed ) . ' /Length1 ' . strlen( $this->data ) . ' >>';
		} else {
			$file_dict = '<< /Length ' . strlen( $compressed ) . ' /Length1 ' . strlen( $this->data ) . ' /Filter /FlateDecode >>';
		}

		$to_unicode = $this->to_unicode_cmap();
		$tu_deflated = gzcompress( $to_unicode, 9 );
		if ( false === $tu_deflated ) {
			$tu_deflated = $to_unicode;
			$tu_dict     = '<< /Length ' . strlen( $tu_deflated ) . ' >>';
		} else {
			$tu_dict = '<< /Length ' . strlen( $tu_deflated ) . ' /Filter /FlateDecode >>';
		}

		$objects = array(
			$type0_id => '<< /Type /Font /Subtype /Type0 /BaseFont /' . $this->base_name()
				. ' /Encoding /Identity-H /DescendantFonts [' . $cid_id . ' 0 R]'
				. ' /ToUnicode ' . $tounicode_id . ' 0 R >>',

			$cid_id => '<< /Type /Font /Subtype /CIDFontType2 /BaseFont /' . $this->base_name()
				. ' /CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >>'
				. ' /FontDescriptor ' . $descriptor_id . ' 0 R'
				. ' /DW ' . $this->scale( $this->widths[0] ?? 500 )
				. ' /W ' . $this->widths_array()
				. ' /CIDToGIDMap /Identity >>',

			$descriptor_id => '<< /Type /FontDescriptor /FontName /' . $this->base_name()
				. ' /Flags 32'
				. ' /FontBBox [' . $this->metrics['bbox_left'] . ' ' . $this->metrics['bbox_bottom'] . ' ' . $this->metrics['bbox_right'] . ' ' . $this->metrics['bbox_top'] . ']'
				. ' /ItalicAngle 0'
				. ' /Ascent ' . $this->metrics['ascent']
				. ' /Descent ' . $this->metrics['descent']
				. ' /CapHeight ' . $this->metrics['cap_height']
				. ' /StemV 80'
				. ' /FontFile2 ' . $file_id . ' 0 R >>',

			$file_id      => $file_dict . "\nstream\n" . $compressed . "\nendstream",
			$tounicode_id => $tu_dict . "\nstream\n" . $tu_deflated . "\nendstream",
		);

		return array(
			'font_id' => $type0_id,
			'objects' => $objects,
		);
	}

	/**
	 * Number of PDF objects {@see pdf_objects()} emits.
	 *
	 * @return int
	 */
	public function object_count(): int {
		return 5;
	}

	/* ── TrueType parsing ──────────────────────────────────────────────── */

	/**
	 * Reads the sfnt table directory.
	 *
	 * @return void
	 */
	private function read_table_directory(): void {
		$count = $this->uint16( 4 );
		for ( $i = 0; $i < $count; $i++ ) {
			$record = 12 + ( $i * 16 );
			$tag    = substr( $this->data, $record, 4 );
			$this->tables[ $tag ] = array( $this->uint32( $record + 8 ), $this->uint32( $record + 12 ) );
		}
	}

	/**
	 * Offset of a required table.
	 *
	 * @param string $tag Four-character tag.
	 * @return int
	 * @throws \RuntimeException When absent.
	 */
	private function table( string $tag ): int {
		if ( ! isset( $this->tables[ $tag ] ) ) {
			throw new \RuntimeException( 'font_table_missing_' . esc_html( trim( $tag ) ) );
		}

		return $this->tables[ $tag ][0];
	}

	/**
	 * Reads `head` for unitsPerEm and the font bounding box.
	 *
	 * @return void
	 */
	private function read_head(): void {
		$head               = $this->table( 'head' );
		$this->units_per_em = max( 16, $this->uint16( $head + 18 ) );

		$this->metrics['bbox_left']   = $this->scale( $this->int16( $head + 36 ) );
		$this->metrics['bbox_bottom'] = $this->scale( $this->int16( $head + 38 ) );
		$this->metrics['bbox_right']  = $this->scale( $this->int16( $head + 40 ) );
		$this->metrics['bbox_top']    = $this->scale( $this->int16( $head + 42 ) );
	}

	/**
	 * Reads ascent/descent from `hhea` and cap height from `OS/2`.
	 *
	 * @return void
	 */
	private function read_metrics(): void {
		$hhea = $this->table( 'hhea' );

		$this->metrics['ascent']  = $this->scale( $this->int16( $hhea + 4 ) );
		$this->metrics['descent'] = $this->scale( $this->int16( $hhea + 6 ) );

		$cap = 0;
		if ( isset( $this->tables['OS/2'] ) ) {
			$os2     = $this->tables['OS/2'][0];
			$version = $this->uint16( $os2 );
			if ( $version >= 2 && $this->tables['OS/2'][1] >= 90 ) {
				$cap = $this->scale( $this->int16( $os2 + 88 ) );
			}
		}
		$this->metrics['cap_height'] = 0 !== $cap ? $cap : (int) round( $this->metrics['ascent'] * 0.7 );
	}

	/**
	 * Reads advance widths from `hmtx` (the last entry repeats for trailing glyphs).
	 *
	 * @return void
	 */
	private function read_hmtx(): void {
		$hhea      = $this->table( 'hhea' );
		$maxp      = $this->table( 'maxp' );
		$hmtx      = $this->table( 'hmtx' );
		$num_h     = $this->uint16( $hhea + 34 );
		$num_glyph = $this->uint16( $maxp + 4 );

		$last = 0;
		for ( $gid = 0; $gid < $num_glyph; $gid++ ) {
			if ( $gid < $num_h ) {
				$last = $this->uint16( $hmtx + ( $gid * 4 ) );
			}
			$this->widths[ $gid ] = $last;
		}
	}

	/**
	 * Reads a Unicode `cmap` subtable (prefers format 12, falls back to format 4).
	 *
	 * @return void
	 * @throws \RuntimeException When no Unicode subtable exists.
	 */
	private function read_cmap(): void {
		$cmap   = $this->table( 'cmap' );
		$count  = $this->uint16( $cmap + 2 );
		$best   = 0;
		$format = 0;

		for ( $i = 0; $i < $count; $i++ ) {
			$record   = $cmap + 4 + ( $i * 8 );
			$platform = $this->uint16( $record );
			$encoding = $this->uint16( $record + 2 );
			$offset   = $cmap + $this->uint32( $record + 4 );
			$this_fmt = $this->uint16( $offset );

			$unicode = ( 3 === $platform && in_array( $encoding, array( 1, 10 ), true ) ) || 0 === $platform;
			if ( ! $unicode ) {
				continue;
			}
			// Format 12 covers astral planes; prefer it when present.
			if ( 12 === $this_fmt || ( 4 === $this_fmt && 12 !== $format ) ) {
				$best   = $offset;
				$format = $this_fmt;
			}
		}

		if ( 12 === $format ) {
			$this->read_cmap_format12( $best );
			return;
		}
		if ( 4 === $format ) {
			$this->read_cmap_format4( $best );
			return;
		}

		throw new \RuntimeException( 'font_no_unicode_cmap' );
	}

	/**
	 * Parses cmap format 4 (Basic Multilingual Plane).
	 *
	 * @param string|int $offset Subtable offset.
	 * @return void
	 */
	private function read_cmap_format4( int $offset ): void {
		$seg_x2 = $this->uint16( $offset + 6 );
		$segs   = (int) ( $seg_x2 / 2 );

		$ends    = $offset + 14;
		$starts  = $ends + $seg_x2 + 2;
		$deltas  = $starts + $seg_x2;
		$ranges  = $deltas + $seg_x2;

		for ( $s = 0; $s < $segs; $s++ ) {
			$end   = $this->uint16( $ends + ( $s * 2 ) );
			$start = $this->uint16( $starts + ( $s * 2 ) );
			$delta = $this->int16( $deltas + ( $s * 2 ) );
			$range = $this->uint16( $ranges + ( $s * 2 ) );

			if ( 0xFFFF === $start ) {
				continue;
			}

			for ( $code = $start; $code <= $end && $code <= 0xFFFF; $code++ ) {
				if ( 0 === $range ) {
					$gid = ( $code + $delta ) & 0xFFFF;
				} else {
					$glyph_addr = $ranges + ( $s * 2 ) + $range + ( ( $code - $start ) * 2 );
					if ( $glyph_addr + 1 >= strlen( $this->data ) ) {
						continue;
					}
					$gid = $this->uint16( $glyph_addr );
					if ( 0 !== $gid ) {
						$gid = ( $gid + $delta ) & 0xFFFF;
					}
				}
				if ( 0 !== $gid ) {
					$this->cmap[ $code ] = $gid;
				}
			}
		}
	}

	/**
	 * Parses cmap format 12 (full Unicode range).
	 *
	 * @param int $offset Subtable offset.
	 * @return void
	 */
	private function read_cmap_format12( int $offset ): void {
		$groups = $this->uint32( $offset + 12 );
		for ( $g = 0; $g < $groups; $g++ ) {
			$record = $offset + 16 + ( $g * 12 );
			$start  = $this->uint32( $record );
			$end    = $this->uint32( $record + 4 );
			$gid    = $this->uint32( $record + 8 );

			// Guard against pathological ranges in malformed fonts.
			if ( $end < $start || ( $end - $start ) > 0xFFFF ) {
				continue;
			}
			for ( $code = $start; $code <= $end; $code++ ) {
				$this->cmap[ $code ] = $gid + ( $code - $start );
			}
		}
	}

	/* ── PDF pieces ────────────────────────────────────────────────────── */

	/**
	 * The /W widths array, listing only glyphs this document uses.
	 *
	 * @return string
	 */
	private function widths_array(): string {
		if ( empty( $this->used ) ) {
			return '[]';
		}

		$gids = array_keys( $this->used );
		sort( $gids );

		$parts = array();
		foreach ( $gids as $gid ) {
			$parts[] = $gid . ' [' . $this->scale( $this->widths[ $gid ] ?? 0 ) . ']';
		}

		return '[' . implode( ' ', $parts ) . ']';
	}

	/**
	 * A /ToUnicode CMap mapping the used glyph ids back to code points, so the text
	 * in the finished PDF can be selected, searched and copied.
	 *
	 * @return string
	 */
	private function to_unicode_cmap(): string {
		$entries = array();
		foreach ( $this->used as $gid => $code ) {
			$entries[] = sprintf( '<%04X> <%s>', $gid, $this->utf16be_hex( $code ) );
		}

		$body = '';
		// A bfchar block may hold at most 100 entries.
		foreach ( array_chunk( $entries, 100 ) as $chunk ) {
			$body .= count( $chunk ) . " beginbfchar\n" . implode( "\n", $chunk ) . "\nendbfchar\n";
		}

		return "/CIDInit /ProcSet findresource begin\n"
			. "12 dict begin\nbegincmap\n"
			. "/CIDSystemInfo << /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def\n"
			. "/CMapName /Adobe-Identity-UCS def\n/CMapType 2 def\n"
			. "1 begincodespacerange\n<0000> <FFFF>\nendcodespacerange\n"
			. $body
			. "endcmap\nCMapName currentdict /CMap defineresource pop\nend\nend";
	}

	/**
	 * Code point as UTF-16BE hex (surrogate pair beyond the BMP).
	 *
	 * @param int $code Code point.
	 * @return string
	 */
	private function utf16be_hex( int $code ): string {
		if ( $code > 0xFFFF ) {
			$code -= 0x10000;
			return sprintf( '%04X%04X', 0xD800 + ( $code >> 10 ), 0xDC00 + ( $code & 0x3FF ) );
		}

		return sprintf( '%04X', $code );
	}

	/* ── helpers ───────────────────────────────────────────────────────── */

	/**
	 * Converts design units to the PDF glyph space of 1000 units per em.
	 *
	 * @param int $units Design units.
	 * @return int
	 */
	private function scale( int $units ): int {
		return (int) round( ( $units * 1000 ) / $this->units_per_em );
	}

	/**
	 * Splits UTF-8 into code points.
	 *
	 * @param string $text UTF-8 text.
	 * @return int[]
	 */
	private function code_points( string $text ): array {
		$codes = array();
		$len   = mb_strlen( $text, 'UTF-8' );
		for ( $i = 0; $i < $len; $i++ ) {
			$char    = mb_substr( $text, $i, 1, 'UTF-8' );
			$ord     = mb_ord( $char, 'UTF-8' );
			$codes[] = false === $ord ? 0 : (int) $ord;
		}

		return $codes;
	}

	/**
	 * Unsigned 16-bit big-endian read.
	 *
	 * @param int $offset Byte offset.
	 * @return int
	 */
	private function uint16( int $offset ): int {
		$bytes = substr( $this->data, $offset, 2 );
		if ( 2 !== strlen( $bytes ) ) {
			return 0;
		}

		return unpack( 'n', $bytes )[1];
	}

	/**
	 * Signed 16-bit big-endian read.
	 *
	 * @param int $offset Byte offset.
	 * @return int
	 */
	private function int16( int $offset ): int {
		$value = $this->uint16( $offset );

		return $value >= 0x8000 ? $value - 0x10000 : $value;
	}

	/**
	 * Unsigned 32-bit big-endian read.
	 *
	 * @param int $offset Byte offset.
	 * @return int
	 */
	private function uint32( int $offset ): int {
		$bytes = substr( $this->data, $offset, 4 );
		if ( 4 !== strlen( $bytes ) ) {
			return 0;
		}

		return unpack( 'N', $bytes )[1];
	}
}
