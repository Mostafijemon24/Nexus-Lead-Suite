<?php
/**
 * Turns a visitor's attachment into plain text the chat model can read.
 *
 * Extraction happens here, in PHP, rather than in the AI server, so it works the
 * same whether the site talks to a model API directly or to a self-hosted server.
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
 * Extracts text from the document types the chat accepts.
 */
final class File_Text {

	/**
	 * Largest attachment we will decode, in bytes.
	 */
	public const MAX_BYTES = 10485760; // 10 MB.

	/**
	 * Characters of extracted text handed to the model. Roughly 3k tokens.
	 */
	public const MAX_CHARS = 12000;

	/**
	 * MIME types the chat accepts, mapped to the extension shown to the visitor.
	 *
	 * @return array<string, string>
	 */
	public static function allowed_mimes(): array {
		return array(
			'application/pdf'  => 'pdf',
			'text/plain'       => 'txt',
			'text/markdown'    => 'md',
			'text/csv'         => 'csv',
			'text/html'        => 'html',
			'application/json' => 'json',
		);
	}

	/**
	 * Extracts readable text from an attachment.
	 *
	 * @param string $mime  MIME type declared by the browser.
	 * @param string $bytes Raw file bytes.
	 * @return string Plain text, trimmed to {@see MAX_CHARS}.
	 * @throws \RuntimeException Codes: unsupported, too_large, empty, encrypted, not_pdf, no_text.
	 */
	public static function extract( string $mime, string $bytes ): string {
		$mime = strtolower( trim( $mime ) );
		if ( ! isset( self::allowed_mimes()[ $mime ] ) ) {
			throw new \RuntimeException( 'unsupported' );
		}
		if ( '' === $bytes ) {
			throw new \RuntimeException( 'empty' );
		}
		if ( strlen( $bytes ) > self::MAX_BYTES ) {
			throw new \RuntimeException( 'too_large' );
		}

		if ( 'application/pdf' === $mime ) {
			require_once nexulesuite_PLUGIN_DIR . 'ai/class-pdf-text.php';
			$text = Pdf_Text::extract( $bytes ); // Throws not_pdf / encrypted.
		} elseif ( 'text/html' === $mime ) {
			$text = self::from_html( $bytes );
		} else {
			$text = self::to_utf8( $bytes );
		}

		$text = self::tidy( $text );
		if ( '' === $text ) {
			// A scanned PDF is images all the way down: no text layer to read.
			throw new \RuntimeException( 'no_text' );
		}

		return self::truncate( $text );
	}

	/**
	 * Human-readable reason for an extraction failure.
	 *
	 * @param string $code Exception code from {@see extract()}.
	 * @return string
	 */
	public static function error_message( string $code ): string {
		switch ( $code ) {
			case 'unsupported':
				return __( 'That file type is not supported. Attach a PDF, TXT, MD, CSV, HTML or JSON file, or an image.', 'nexus-lead-suite' );
			case 'too_large':
				return __( 'That file is too large (max 10 MB).', 'nexus-lead-suite' );
			case 'encrypted':
				return __( 'That PDF is password-protected, so its text cannot be read.', 'nexus-lead-suite' );
			case 'not_pdf':
				return __( 'That file is not a valid PDF.', 'nexus-lead-suite' );
			case 'empty':
				return __( 'That file is empty.', 'nexus-lead-suite' );
			case 'corrupt':
				return __( 'That file could not be read. It may be damaged.', 'nexus-lead-suite' );
			case 'no_text':
				return __( 'No readable text was found. Scanned PDFs are images — try attaching a screenshot instead so the assistant can look at it.', 'nexus-lead-suite' );
			default:
				return __( 'That file could not be read.', 'nexus-lead-suite' );
		}
	}

	/**
	 * Strips an HTML document down to its visible text.
	 *
	 * @param string $bytes Raw HTML.
	 * @return string
	 */
	private static function from_html( string $bytes ): string {
		$html = self::to_utf8( $bytes );
		$html = preg_replace( '#<(script|style|noscript|template)\b[^>]*>.*?</\1>#is', ' ', $html );
		// Block boundaries carry meaning; without them headings run into the next paragraph.
		$html = preg_replace( '#</?(p|div|br|li|tr|h[1-6]|section|article|blockquote)\b[^>]*>#i', "\n", (string) $html );
		$text = wp_strip_all_tags( (string) $html );

		return html_entity_decode( $text, ENT_QUOTES | ENT_HTML5, 'UTF-8' );
	}

	/**
	 * Normalises bytes to UTF-8, honouring a BOM and falling back to Windows-1252.
	 *
	 * @param string $bytes Raw bytes.
	 * @return string
	 */
	private static function to_utf8( string $bytes ): string {
		if ( 0 === strncmp( $bytes, "\xEF\xBB\xBF", 3 ) ) {
			$bytes = substr( $bytes, 3 );
		}
		if ( mb_check_encoding( $bytes, 'UTF-8' ) ) {
			return $bytes;
		}
		$out = @mb_convert_encoding( $bytes, 'UTF-8', 'Windows-1252' ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged

		return is_string( $out ) ? $out : '';
	}

	/**
	 * Collapses whitespace and drops control characters.
	 *
	 * @param string $text Extracted text.
	 * @return string
	 */
	private static function tidy( string $text ): string {
		$text = str_replace( array( "\r\n", "\r" ), "\n", $text );
		$text = preg_replace( '/[^\P{C}\n\t]+/u', '', $text );
		if ( ! is_string( $text ) ) {
			return '';
		}
		$text = preg_replace( '/[ \t]+/', ' ', $text );
		$text = preg_replace( '/\n{3,}/', "\n\n", (string) $text );

		return trim( (string) $text );
	}

	/**
	 * Cuts the text to the model budget on a word boundary and says so.
	 *
	 * @param string $text Extracted text.
	 * @return string
	 */
	private static function truncate( string $text ): string {
		if ( mb_strlen( $text ) <= self::MAX_CHARS ) {
			return $text;
		}

		$cut   = mb_substr( $text, 0, self::MAX_CHARS );
		$space = mb_strrpos( $cut, ' ' );
		if ( false !== $space && $space > self::MAX_CHARS - 200 ) {
			$cut = mb_substr( $cut, 0, $space );
		}

		return $cut . "\n\n[… document truncated …]";
	}
}
