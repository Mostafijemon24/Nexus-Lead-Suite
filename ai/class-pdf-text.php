<?php
/**
 * Minimal, dependency-free PDF text extractor.
 *
 * Only what the chatbot needs: pull the visible text out of a text-based PDF so it
 * can be fed to the model. It understands the shapes real producers emit — Flate
 * streams, object streams, PNG predictors, and the /ToUnicode CMaps that Identity-H
 * subset fonts need in order to be readable at all.
 *
 * It deliberately does NOT do: encryption, OCR of scanned pages, or layout/columns.
 * A scanned PDF yields no text and the caller reports that back to the visitor.
 *
 * @package nexulesuite_
 */

declare(strict_types=1);

namespace nexulesuite_\AI;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Extracts a plain-text rendering of a PDF's text content.
 */
final class Pdf_Text {

	/**
	 * Stop collecting once the output reaches this many bytes (the caller trims further).
	 */
	private const MAX_CHARS = 400000;

	/**
	 * A TJ horizontal adjustment at least this large (in 1/1000 em) reads as a word gap.
	 * Kerning pairs sit well under this; producers use 200-400 for real spaces.
	 */
	private const TJ_SPACE = 120.0;

	/**
	 * Extracts text from raw PDF bytes.
	 *
	 * @param string $raw Raw PDF file bytes.
	 * @return string Extracted text ('' when the PDF carries no text layer).
	 * @throws \RuntimeException When the file is not a PDF or is encrypted.
	 */
	public static function extract( string $raw ): string {
		if ( 0 !== strncmp( $raw, '%PDF', 4 ) ) {
			throw new \RuntimeException( 'not_pdf' );
		}
		if ( preg_match( '#/Encrypt\s+\d+\s+\d+\s+R#', $raw ) ) {
			throw new \RuntimeException( 'encrypted' );
		}

		$objs = self::parse_objects( $raw );
		$objs = self::expand_object_streams( $objs );

		$out   = '';
		$cmaps = array();
		foreach ( self::page_numbers( $objs ) as $page_num ) {
			$content = self::page_content( $objs, $page_num );
			if ( '' === $content ) {
				continue;
			}
			$fonts = self::page_fonts( $objs, $page_num, $cmaps );
			$out  .= self::text_from_content( $content, $fonts ) . "\n\n";
			if ( strlen( $out ) >= self::MAX_CHARS ) {
				break;
			}
		}

		// No /Type /Page found (or none carried text): sweep every stream that looks like content.
		if ( '' === trim( $out ) ) {
			foreach ( $objs as $obj ) {
				$data = self::stream_data( $obj );
				if ( '' === $data || false === strpos( $data, 'BT' ) ) {
					continue;
				}
				$out .= self::text_from_content( $data, array() ) . "\n\n";
				if ( strlen( $out ) >= self::MAX_CHARS ) {
					break;
				}
			}
		}

		return self::tidy( $out );
	}

	/**
	 * Splits the file into `N 0 obj … endobj` bodies, keyed by object number.
	 * Later definitions win, which is what incremental updates mean.
	 *
	 * @param string $raw Raw PDF bytes.
	 * @return array<int, array{dict:string, stream:?string}>
	 */
	private static function parse_objects( string $raw ): array {
		$objs = array();
		$len  = strlen( $raw );
		$from = 0;

		while ( $from < $len && preg_match( '/(\d+)\s+\d+\s+obj\b/', $raw, $m, PREG_OFFSET_CAPTURE, $from ) ) {
			$num  = (int) $m[1][0];
			$body = $m[0][1] + strlen( $m[0][0] );

			$endobj = strpos( $raw, 'endobj', $body );
			$stream = strpos( $raw, 'stream', $body );

			if ( false !== $stream && ( false === $endobj || $stream < $endobj ) ) {
				$dict = substr( $raw, $body, $stream - $body );

				// Stream data starts after the EOL that follows the `stream` keyword.
				$start = $stream + 6;
				if ( "\r\n" === substr( $raw, $start, 2 ) ) {
					$start += 2;
				} elseif ( $start < $len && ( "\n" === $raw[ $start ] || "\r" === $raw[ $start ] ) ) {
					++$start;
				}

				$end = strpos( $raw, 'endstream', $start );
				if ( false === $end ) {
					break;
				}

				$objs[ $num ] = array(
					'dict'   => $dict,
					'stream' => substr( $raw, $start, $end - $start ),
				);
				$from = $end + 9;
			} else {
				$dict         = ( false === $endobj ) ? substr( $raw, $body ) : substr( $raw, $body, $endobj - $body );
				$objs[ $num ] = array(
					'dict'   => $dict,
					'stream' => null,
				);
				$from = ( false === $endobj ) ? $len : $endobj + 6;
			}
		}

		return $objs;
	}

	/**
	 * PDF 1.5+ packs most objects inside compressed /ObjStm containers; unpack them
	 * so pages and fonts are visible to the rest of the extractor.
	 *
	 * @param array<int, array{dict:string, stream:?string}> $objs Parsed objects.
	 * @return array<int, array{dict:string, stream:?string}>
	 */
	private static function expand_object_streams( array $objs ): array {
		foreach ( $objs as $obj ) {
			if ( ! preg_match( '#/Type\s*/ObjStm\b#', $obj['dict'] ) ) {
				continue;
			}
			$data = self::stream_data( $obj );
			if ( '' === $data ) {
				continue;
			}
			if ( ! preg_match( '#/N\s+(\d+)#', $obj['dict'], $nm ) || ! preg_match( '#/First\s+(\d+)#', $obj['dict'], $fm ) ) {
				continue;
			}

			$count = (int) $nm[1];
			$first = (int) $fm[1];
			$head  = substr( $data, 0, $first );
			if ( ! preg_match_all( '/(\d+)\s+(\d+)/', $head, $pairs, PREG_SET_ORDER ) ) {
				continue;
			}

			for ( $i = 0; $i < $count && $i < count( $pairs ); $i++ ) {
				$num    = (int) $pairs[ $i ][1];
				$offset = $first + (int) $pairs[ $i ][2];
				$next   = isset( $pairs[ $i + 1 ] ) ? $first + (int) $pairs[ $i + 1 ][2] : strlen( $data );
				if ( $offset >= strlen( $data ) || $next <= $offset ) {
					continue;
				}
				// A packed object never has its own stream.
				$objs[ $num ] = array(
					'dict'   => substr( $data, $offset, $next - $offset ),
					'stream' => null,
				);
			}
		}

		return $objs;
	}

	/**
	 * Returns an object's stream contents with its filters applied.
	 *
	 * @param array{dict:string, stream:?string} $obj Object.
	 * @return string Decoded bytes ('' when absent or filtered with a codec we skip).
	 */
	private static function stream_data( array $obj ): string {
		if ( null === $obj['stream'] || '' === $obj['stream'] ) {
			return '';
		}

		$dict = $obj['dict'];

		// Image/other codecs carry no text; skip rather than emit binary noise.
		if ( preg_match( '#/(DCTDecode|JPXDecode|CCITTFaxDecode|JBIG2Decode|LZWDecode|RunLengthDecode)\b#', $dict ) ) {
			return '';
		}

		$data = $obj['stream'];

		if ( false !== strpos( $dict, 'FlateDecode' ) ) {
			$out = @gzuncompress( $data ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged -- malformed streams are expected; we fall through.
			if ( false === $out ) {
				$out = @gzinflate( $data ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
			}
			if ( false === $out ) {
				$out = @gzinflate( substr( $data, 2 ) ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
			}
			if ( false === $out ) {
				return '';
			}
			$data = $out;

			if ( preg_match( '#/Predictor\s+(\d+)#', $dict, $pm ) && (int) $pm[1] >= 10 ) {
				$columns = preg_match( '#/Columns\s+(\d+)#', $dict, $cm ) ? max( 1, (int) $cm[1] ) : 1;
				$data    = self::undo_png_predictor( $data, $columns );
			}
		}

		return $data;
	}

	/**
	 * Reverses the PNG row predictor that /DecodeParms applies to some streams.
	 *
	 * @param string $data    Predicted bytes.
	 * @param int    $columns Bytes per row.
	 * @return string
	 */
	private static function undo_png_predictor( string $data, int $columns ): string {
		$row_len = $columns + 1;
		$prev    = str_repeat( "\x00", $columns );
		$out     = '';

		for ( $pos = 0; $pos + $row_len <= strlen( $data ); $pos += $row_len ) {
			$tag = ord( $data[ $pos ] );
			$row = substr( $data, $pos + 1, $columns );

			if ( 2 === $tag ) { // Up.
				for ( $i = 0; $i < $columns; $i++ ) {
					$row[ $i ] = chr( ( ord( $row[ $i ] ) + ord( $prev[ $i ] ) ) & 0xFF );
				}
			}
			$out .= $row;
			$prev = $row;
		}

		return $out;
	}

	/**
	 * Object numbers of every page, in ascending object order.
	 *
	 * @param array<int, array{dict:string, stream:?string}> $objs Objects.
	 * @return int[]
	 */
	private static function page_numbers( array $objs ): array {
		$pages = array();
		foreach ( $objs as $num => $obj ) {
			if ( preg_match( '#/Type\s*/Page(?![sA-Za-z])#', $obj['dict'] ) ) {
				$pages[] = (int) $num;
			}
		}
		sort( $pages );

		return $pages;
	}

	/**
	 * Concatenated, decoded content streams of a page.
	 *
	 * @param array<int, array{dict:string, stream:?string}> $objs Objects.
	 * @param int                                            $page Page object number.
	 * @return string
	 */
	private static function page_content( array $objs, int $page ): string {
		$value = self::dict_value( $objs[ $page ]['dict'], 'Contents' );
		if ( '' === $value ) {
			return '';
		}

		$out = '';
		if ( preg_match_all( '/(\d+)\s+\d+\s+R/', $value, $refs ) ) {
			foreach ( $refs[1] as $ref ) {
				$ref = (int) $ref;
				if ( isset( $objs[ $ref ] ) ) {
					$out .= self::stream_data( $objs[ $ref ] ) . "\n";
				}
			}
		}

		return $out;
	}

	/**
	 * Maps a page's font resource names (`/F1`) to their /ToUnicode CMaps.
	 *
	 * Without the CMap an Identity-H subset font's bytes are glyph ids, not characters,
	 * so those runs are dropped instead of emitted as mojibake.
	 *
	 * @param array<int, array{dict:string, stream:?string}> $objs  Objects.
	 * @param int                                            $page  Page object number.
	 * @param array<int, array|null>                         $cache Font object number => cmap, reused across pages.
	 * @return array<string, array|null>
	 */
	private static function page_fonts( array $objs, int $page, array &$cache ): array {
		$resources = self::inherited_value( $objs, $page, 'Resources' );
		if ( '' === $resources ) {
			return array();
		}
		$resources = self::resolve( $objs, $resources );
		$font_dict = self::resolve( $objs, self::dict_value( $resources, 'Font' ) );
		if ( '' === $font_dict ) {
			return array();
		}

		$fonts = array();
		if ( ! preg_match_all( '#/([A-Za-z0-9_.+-]+)\s+(\d+)\s+\d+\s+R#', $font_dict, $refs, PREG_SET_ORDER ) ) {
			return array();
		}

		foreach ( $refs as $ref ) {
			$name = $ref[1];
			$num  = (int) $ref[2];

			if ( ! array_key_exists( $num, $cache ) ) {
				$cache[ $num ] = self::font_cmap( $objs, $num );
			}
			$fonts[ $name ] = $cache[ $num ];
		}

		return $fonts;
	}

	/**
	 * Builds the code -> text map for one font object.
	 *
	 * @param array<int, array{dict:string, stream:?string}> $objs Objects.
	 * @param int                                            $num  Font object number.
	 * @return array{map:array<string,string>, bytes:int, identity:bool}|null
	 */
	private static function font_cmap( array $objs, int $num ): ?array {
		if ( ! isset( $objs[ $num ] ) ) {
			return null;
		}
		$dict     = $objs[ $num ]['dict'];
		$identity = (bool) preg_match( '#/Encoding\s*/Identity-[HV]#', $dict );

		if ( ! preg_match( '#/ToUnicode\s+(\d+)\s+\d+\s+R#', $dict, $m ) ) {
			// Composite fonts also hide behind /DescendantFonts; a Type0 without ToUnicode is unreadable.
			return $identity ? array(
				'map'      => array(),
				'bytes'    => 2,
				'identity' => true,
			) : null;
		}

		$cmap_obj = (int) $m[1];
		if ( ! isset( $objs[ $cmap_obj ] ) ) {
			return null;
		}

		$cmap = self::parse_cmap( self::stream_data( $objs[ $cmap_obj ] ) );
		if ( null !== $cmap ) {
			$cmap['identity'] = $identity;
		}

		return $cmap;
	}

	/**
	 * Parses a /ToUnicode CMap into a code -> UTF-8 map.
	 *
	 * @param string $cmap CMap program text.
	 * @return array{map:array<string,string>, bytes:int, identity:bool}|null
	 */
	private static function parse_cmap( string $cmap ): ?array {
		if ( '' === $cmap ) {
			return null;
		}

		$bytes = 2;
		if ( preg_match( '/begincodespacerange(.*?)endcodespacerange/s', $cmap, $cs )
			&& preg_match( '/<([0-9A-Fa-f]+)>/', $cs[1], $lo ) ) {
			$bytes = max( 1, (int) ( strlen( $lo[1] ) / 2 ) );
		}

		$map = array();

		if ( preg_match_all( '/beginbfchar(.*?)endbfchar/s', $cmap, $blocks ) ) {
			foreach ( $blocks[1] as $block ) {
				if ( preg_match_all( '/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]*)>/', $block, $pairs, PREG_SET_ORDER ) ) {
					foreach ( $pairs as $pair ) {
						$map[ strtolower( $pair[1] ) ] = self::utf16be_to_utf8( $pair[2] );
					}
				}
			}
		}

		if ( preg_match_all( '/beginbfrange(.*?)endbfrange/s', $cmap, $blocks ) ) {
			foreach ( $blocks[1] as $block ) {
				// <lo> <hi> [ <d> <d> … ]
				if ( preg_match_all( '/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*\[(.*?)\]/s', $block, $arrays, PREG_SET_ORDER ) ) {
					foreach ( $arrays as $range ) {
						$code = hexdec( $range[1] );
						if ( preg_match_all( '/<([0-9A-Fa-f]*)>/', $range[3], $dsts ) ) {
							foreach ( $dsts[1] as $dst ) {
								$map[ self::code_key( $code, $range[1] ) ] = self::utf16be_to_utf8( $dst );
								++$code;
							}
						}
					}
					$block = preg_replace( '/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*\[(.*?)\]/s', '', $block );
				}
				// <lo> <hi> <dstStart>
				if ( is_string( $block ) && preg_match_all( '/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/', $block, $ranges, PREG_SET_ORDER ) ) {
					foreach ( $ranges as $range ) {
						$lo  = hexdec( $range[1] );
						$hi  = hexdec( $range[2] );
						$dst = hexdec( $range[3] );
						if ( $hi < $lo || ( $hi - $lo ) > 65535 ) {
							continue;
						}
						for ( $code = $lo; $code <= $hi; $code++ ) {
							$map[ self::code_key( $code, $range[1] ) ] = self::code_point_to_utf8( $dst + ( $code - $lo ) );
						}
					}
				}
			}
		}

		if ( empty( $map ) ) {
			return null;
		}

		return array(
			'map'      => $map,
			'bytes'    => $bytes,
			'identity' => false,
		);
	}

	/**
	 * Zero-padded lowercase hex key for a character code, matching the source width.
	 *
	 * @param int    $code    Code.
	 * @param string $pattern Original hex literal (its length fixes the key width).
	 * @return string
	 */
	private static function code_key( int $code, string $pattern ): string {
		return strtolower( str_pad( dechex( $code ), strlen( $pattern ), '0', STR_PAD_LEFT ) );
	}

	/**
	 * Converts a UTF-16BE hex literal (possibly a surrogate pair or ligature run) to UTF-8.
	 *
	 * @param string $hex Hex digits.
	 * @return string
	 */
	private static function utf16be_to_utf8( string $hex ): string {
		if ( '' === $hex || 0 !== strlen( $hex ) % 2 ) {
			return '';
		}
		$bin = @hex2bin( $hex ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
		if ( false === $bin || '' === $bin ) {
			return '';
		}
		if ( 1 === strlen( $bin ) ) {
			return self::code_point_to_utf8( ord( $bin ) );
		}
		$out = @mb_convert_encoding( $bin, 'UTF-8', 'UTF-16BE' ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged

		return is_string( $out ) ? $out : '';
	}

	/**
	 * Encodes one Unicode code point as UTF-8.
	 *
	 * @param int $code Code point.
	 * @return string
	 */
	private static function code_point_to_utf8( int $code ): string {
		if ( $code < 0 || $code > 0x10FFFF ) {
			return '';
		}
		$out = @mb_convert_encoding( pack( 'N', $code ), 'UTF-8', 'UTF-32BE' ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged

		return is_string( $out ) ? $out : '';
	}

	/**
	 * Reads a dictionary entry's raw value: an inline `<< … >>`, an `N 0 R` reference,
	 * an `[ … ]` array, a `/Name`, or a number.
	 *
	 * @param string $dict Dictionary text.
	 * @param string $key  Key without the slash.
	 * @return string
	 */
	private static function dict_value( string $dict, string $key ): string {
		if ( ! preg_match( '#/' . preg_quote( $key, '#' ) . '(?![A-Za-z0-9])#', $dict, $m, PREG_OFFSET_CAPTURE ) ) {
			return '';
		}

		$i   = $m[0][1] + strlen( $m[0][0] );
		$len = strlen( $dict );
		while ( $i < $len && preg_match( '/\s/', $dict[ $i ] ) ) {
			++$i;
		}
		if ( $i >= $len ) {
			return '';
		}

		if ( '<' === $dict[ $i ] && '<' === substr( $dict, $i + 1, 1 ) ) {
			$depth = 0;
			for ( $j = $i; $j < $len - 1; $j++ ) {
				if ( '<' === $dict[ $j ] && '<' === $dict[ $j + 1 ] ) {
					++$depth;
					++$j;
				} elseif ( '>' === $dict[ $j ] && '>' === $dict[ $j + 1 ] ) {
					--$depth;
					++$j;
					if ( 0 === $depth ) {
						return substr( $dict, $i, $j + 1 - $i );
					}
				}
			}
			return '';
		}

		if ( '[' === $dict[ $i ] ) {
			$end = strpos( $dict, ']', $i );
			return ( false === $end ) ? '' : substr( $dict, $i, $end + 1 - $i );
		}

		$rest = substr( $dict, $i, 64 );
		if ( preg_match( '/^\d+\s+\d+\s+R/', $rest, $ref ) ) {
			return $ref[0];
		}
		if ( preg_match( '#^/[A-Za-z0-9_.+-]+#', $rest, $name ) ) {
			return $name[0];
		}
		if ( preg_match( '/^-?[\d.]+/', $rest, $num ) ) {
			return $num[0];
		}

		return '';
	}

	/**
	 * Follows an `N 0 R` reference to the referenced object's dictionary; passes other values through.
	 *
	 * @param array<int, array{dict:string, stream:?string}> $objs  Objects.
	 * @param string                                         $value Raw value.
	 * @return string
	 */
	private static function resolve( array $objs, string $value ): string {
		if ( preg_match( '/^(\d+)\s+\d+\s+R$/', trim( $value ), $m ) ) {
			$num = (int) $m[1];
			return isset( $objs[ $num ] ) ? $objs[ $num ]['dict'] : '';
		}

		return $value;
	}

	/**
	 * Reads a key from a page, walking up /Parent when the page inherits it.
	 *
	 * @param array<int, array{dict:string, stream:?string}> $objs Objects.
	 * @param int                                            $page Page object number.
	 * @param string                                         $key  Key name.
	 * @return string
	 */
	private static function inherited_value( array $objs, int $page, string $key ): string {
		$node = $page;
		for ( $hop = 0; $hop < 8 && isset( $objs[ $node ] ); $hop++ ) {
			$value = self::dict_value( $objs[ $node ]['dict'], $key );
			if ( '' !== $value ) {
				return $value;
			}
			if ( ! preg_match( '#/Parent\s+(\d+)\s+\d+\s+R#', $objs[ $node ]['dict'], $m ) ) {
				break;
			}
			$node = (int) $m[1];
		}

		return '';
	}

	/**
	 * Walks a content stream and emits the text its show operators paint.
	 *
	 * Line breaks come from the baseline's vertical position, not from seeing a
	 * positioning operator: Chrome emits one `Td` per glyph with ty=0 to advance
	 * horizontally, so treating every `Td` as a newline puts each letter on its own line.
	 * The baseline is the text matrix offset plus the CTM offset, because producers split
	 * across the two — Chrome moves the text matrix per line, Typst wraps each line in
	 * `q … cm` and leaves the text matrix at identity.
	 *
	 * @param string                    $content Decoded content stream.
	 * @param array<string, array|null> $fonts   Resource name => cmap.
	 * @return string
	 */
	private static function text_from_content( string $content, array $fonts ): string {
		$len      = strlen( $content );
		$out      = '';
		$operands = array();
		$font     = null;
		$i        = 0;
		$y        = 0.0;
		$last_y   = null;
		$leading  = 0.0;
		$ctm_y    = 0.0;
		$gs_stack = array();

		while ( $i < $len ) {
			$ch = $content[ $i ];

			if ( " " === $ch || "\t" === $ch || "\r" === $ch || "\n" === $ch || "\f" === $ch || "\0" === $ch ) {
				++$i;
				continue;
			}

			if ( '%' === $ch ) {
				$nl = strcspn( $content, "\r\n", $i );
				$i += $nl;
				continue;
			}

			if ( '(' === $ch ) {
				$operands[] = array( 'str', self::read_literal_string( $content, $i ) );
				continue;
			}

			if ( '<' === $ch ) {
				if ( '<' === substr( $content, $i + 1, 1 ) ) {
					$i = self::skip_dict( $content, $i );
					continue;
				}
				$end = strpos( $content, '>', $i );
				if ( false === $end ) {
					break;
				}
				$hex        = preg_replace( '/[^0-9A-Fa-f]/', '', substr( $content, $i + 1, $end - $i - 1 ) );
				$operands[] = array( 'str', self::hex_to_bin( (string) $hex ) );
				$i          = $end + 1;
				continue;
			}

			if ( '/' === $ch ) {
				preg_match( '~^/([A-Za-z0-9_.+#-]*)~', substr( $content, $i, 96 ), $nm );
				$operands[] = array( 'name', isset( $nm[1] ) ? $nm[1] : '' );
				$i         += isset( $nm[0] ) ? strlen( $nm[0] ) : 1;
				continue;
			}

			if ( '[' === $ch || ']' === $ch ) {
				$operands[] = array( 'mark', $ch );
				++$i;
				continue;
			}

			if ( ctype_digit( $ch ) || '-' === $ch || '+' === $ch || '.' === $ch ) {
				preg_match( '/^[-+]?[\d.]+/', substr( $content, $i, 32 ), $num );
				$operands[] = array( 'num', isset( $num[0] ) ? (float) $num[0] : 0.0 );
				$i         += isset( $num[0] ) ? strlen( $num[0] ) : 1;
				continue;
			}

			if ( "'" === $ch || '"' === $ch ) {
				$y       -= $leading;
				$out     .= "\n" . self::show_operands( $operands, $fonts, $font );
				$last_y   = $ctm_y + $y;
				$operands = array();
				++$i;
				continue;
			}

			if ( ctype_alpha( $ch ) ) {
				preg_match( '/^[A-Za-z][A-Za-z0-9*]*/', substr( $content, $i, 32 ), $op );
				$token = isset( $op[0] ) ? $op[0] : $ch;
				$i    += strlen( $token );
				$nums  = self::numeric_operands( $operands );

				switch ( $token ) {
					case 'Tf':
						foreach ( $operands as $operand ) {
							if ( 'name' === $operand[0] ) {
								$font = $operand[1];
							}
						}
						break;
					case 'q':
						$gs_stack[] = $ctm_y;
						break;
					case 'Q':
						if ( ! empty( $gs_stack ) ) {
							$ctm_y = (float) array_pop( $gs_stack );
						}
						break;
					case 'cm':
						if ( count( $nums ) >= 6 ) {
							$ctm_y += $nums[5];
						}
						break;
					case 'BT':
						// Only the position resets; last_y carries over, or every font run
						// (Chrome opens a fresh BT…ET for each) would start a new line.
						$y = 0.0;
						break;
					case 'Tm':
						if ( count( $nums ) >= 6 ) {
							$y = $nums[5];
						}
						break;
					case 'Td':
						if ( count( $nums ) >= 2 ) {
							$y += $nums[ count( $nums ) - 1 ];
						}
						break;
					case 'TD':
						if ( count( $nums ) >= 2 ) {
							$ty       = $nums[ count( $nums ) - 1 ];
							$leading  = -$ty;
							$y       += $ty;
						}
						break;
					case 'TL':
						if ( ! empty( $nums ) ) {
							$leading = (float) end( $nums );
						}
						break;
					case 'T*':
						$y -= $leading;
						break;
					case 'Tj':
					case 'TJ':
						$baseline = $ctm_y + $y;
						// Half a point of drift is float noise or a super/subscript, not a new line.
						if ( null !== $last_y && abs( $baseline - $last_y ) > 0.5 ) {
							$out .= "\n";
						}
						$out   .= self::show_operands( $operands, $fonts, $font );
						$last_y = $baseline;
						break;
				}
				$operands = array();
				continue;
			}

			++$i;
		}

		return $out;
	}

	/**
	 * The numeric operands of the pending operator, in order.
	 *
	 * @param array<int, array{0:string,1:mixed}> $operands Operand stack.
	 * @return float[]
	 */
	private static function numeric_operands( array $operands ): array {
		$nums = array();
		foreach ( $operands as $operand ) {
			if ( 'num' === $operand[0] ) {
				$nums[] = (float) $operand[1];
			}
		}

		return $nums;
	}

	/**
	 * Renders the string operands of a show operator, inserting gaps for TJ kerning jumps.
	 *
	 * @param array<int, array{0:string,1:mixed}> $operands Operand stack.
	 * @param array<string, array|null>           $fonts    Resource name => cmap.
	 * @param string|null                         $font     Current font resource name.
	 * @return string
	 */
	private static function show_operands( array $operands, array $fonts, ?string $font ): string {
		$cmap = ( null !== $font && isset( $fonts[ $font ] ) ) ? $fonts[ $font ] : null;
		$out  = '';

		foreach ( $operands as $operand ) {
			if ( 'str' === $operand[0] ) {
				$out .= self::decode_string( (string) $operand[1], $cmap );
			} elseif ( 'num' === $operand[0] && (float) $operand[1] <= -self::TJ_SPACE ) {
				$out .= ' ';
			}
		}

		return $out;
	}

	/**
	 * Turns raw string bytes into UTF-8 using the font's CMap, or Windows-1252 when there is none.
	 *
	 * @param string     $bytes Raw string bytes.
	 * @param array|null $cmap  Font CMap.
	 * @return string
	 */
	private static function decode_string( string $bytes, ?array $cmap ): string {
		if ( '' === $bytes ) {
			return '';
		}

		if ( null !== $cmap && ! empty( $cmap['map'] ) ) {
			$width = ( 2 === (int) $cmap['bytes'] ) ? 2 : 1;
			$out   = '';
			for ( $i = 0; $i + $width <= strlen( $bytes ); $i += $width ) {
				$key  = strtolower( bin2hex( substr( $bytes, $i, $width ) ) );
				$out .= isset( $cmap['map'][ $key ] ) ? $cmap['map'][ $key ] : '';
			}
			return $out;
		}

		// Identity-H glyph ids without a CMap decode to nothing meaningful — drop rather than emit mojibake.
		if ( null !== $cmap && ! empty( $cmap['identity'] ) ) {
			return '';
		}

		$out = @mb_convert_encoding( $bytes, 'UTF-8', 'Windows-1252' ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged

		return is_string( $out ) ? $out : '';
	}

	/**
	 * Reads a `( … )` literal string, honouring escapes and nested parentheses.
	 * Advances the cursor past the closing paren.
	 *
	 * @param string $content Content stream.
	 * @param int    $i       Cursor, at the opening paren; updated in place.
	 * @return string Raw (unescaped) string bytes.
	 */
	private static function read_literal_string( string $content, int &$i ): string {
		$len   = strlen( $content );
		$depth = 0;
		$out   = '';

		for ( ; $i < $len; $i++ ) {
			$ch = $content[ $i ];

			if ( '\\' === $ch ) {
				$next = ( $i + 1 < $len ) ? $content[ $i + 1 ] : '';
				++$i;
				switch ( $next ) {
					case 'n':
						$out .= "\n";
						break;
					case 'r':
						$out .= "\r";
						break;
					case 't':
						$out .= "\t";
						break;
					case 'b':
						$out .= "\x08";
						break;
					case 'f':
						$out .= "\x0C";
						break;
					case "\n":
						break; // Line continuation.
					case "\r":
						if ( "\n" === substr( $content, $i + 1, 1 ) ) {
							++$i;
						}
						break;
					default:
						if ( ctype_digit( $next ) ) {
							preg_match( '/^[0-7]{1,3}/', substr( $content, $i, 3 ), $oct );
							if ( isset( $oct[0] ) ) {
								$out .= chr( octdec( $oct[0] ) & 0xFF );
								$i   += strlen( $oct[0] ) - 1;
							}
						} else {
							$out .= $next;
						}
				}
				continue;
			}

			if ( '(' === $ch ) {
				++$depth;
				if ( 1 === $depth ) {
					continue;
				}
			} elseif ( ')' === $ch ) {
				--$depth;
				if ( 0 === $depth ) {
					++$i;
					return $out;
				}
			}

			$out .= $ch;
		}

		return $out;
	}

	/**
	 * Skips a balanced `<< … >>` inline dictionary.
	 *
	 * @param string $content Content stream.
	 * @param int    $i       Cursor at the opening `<<`.
	 * @return int Cursor past the closing `>>`.
	 */
	private static function skip_dict( string $content, int $i ): int {
		$len   = strlen( $content );
		$depth = 0;

		for ( ; $i < $len - 1; $i++ ) {
			if ( '<' === $content[ $i ] && '<' === $content[ $i + 1 ] ) {
				++$depth;
				++$i;
			} elseif ( '>' === $content[ $i ] && '>' === $content[ $i + 1 ] ) {
				--$depth;
				++$i;
				if ( 0 === $depth ) {
					return $i + 1;
				}
			}
		}

		return $len;
	}

	/**
	 * Hex string to bytes, tolerating an odd trailing nibble as the spec requires.
	 *
	 * @param string $hex Hex digits.
	 * @return string
	 */
	private static function hex_to_bin( string $hex ): string {
		if ( 0 !== strlen( $hex ) % 2 ) {
			$hex .= '0';
		}
		$bin = @hex2bin( $hex ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged

		return ( false === $bin ) ? '' : $bin;
	}

	/**
	 * Collapses the whitespace the operator walk produces into readable paragraphs.
	 *
	 * @param string $text Raw extracted text.
	 * @return string
	 */
	private static function tidy( string $text ): string {
		$text = str_replace( array( "\r\n", "\r" ), "\n", $text );
		// Subset fonts map ligatures to their Unicode presentation forms; fold them back.
		$text = str_replace(
			array( "\u{FB00}", "\u{FB01}", "\u{FB02}", "\u{FB03}", "\u{FB04}" ),
			array( 'ff', 'fi', 'fl', 'ffi', 'ffl' ),
			$text
		);
		$text = preg_replace( '/[^\P{C}\n\t]+/u', '', $text );
		if ( ! is_string( $text ) ) {
			return '';
		}
		$text = preg_replace( '/[ \t]+/', ' ', $text );
		$text = preg_replace( '/ ?\n ?/', "\n", (string) $text );
		$text = preg_replace( '/\n{3,}/', "\n\n", (string) $text );

		return trim( (string) $text );
	}
}
