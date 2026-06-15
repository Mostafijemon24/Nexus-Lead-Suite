<?php
/**
 * Encode / decode form builder payload stored in {@see nexus_ls_forms_builder_v0}.
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
 * Storage format: base64( rawurlencode( JSON ) ).
 */
final class Forms_Payload_Codec {

	/**
	 * Decode from DB string; empty or invalid returns null (matches legacy REST behaviour).
	 *
	 * @param string $encoded Raw option value.
	 * @return array<string,mixed>|null
	 */
	public static function decode_from_storage_string( string $encoded ): ?array {
		$encoded = trim( $encoded );
		if ( '' === $encoded ) {
			return null;
		}

		$decoded = base64_decode( $encoded, true );
		if ( false === $decoded ) {
			return null;
		}

		$json = rawurldecode( (string) $decoded );
		$arr  = json_decode( $json, true );
		if ( ! is_array( $arr ) ) {
			return null;
		}

		return $arr;
	}

	/**
	 * Encode for wp_options storage.
	 *
	 * @param array<string,mixed> $payload Must include `forms` list when present.
	 * @return string
	 */
	public static function encode_for_storage( array $payload ): string {
		$json = wp_json_encode( $payload );
		if ( ! is_string( $json ) || '' === $json ) {
			$json = '{}';
		}

		return base64_encode( rawurlencode( $json ) );
	}

	/**
	 * Normalise any stored/exported shape to a plain array for JSON export, URL scanning, and URL rewrite.
	 *
	 * @param mixed $value Raw option (string storage, array from JSON export, or null).
	 * @return array<string,mixed> Shape: [ 'forms' => array ]
	 */
	public static function decode_mixed_for_scan( $value ): array {
		if ( null === $value ) {
			return array( 'forms' => array() );
		}
		if ( is_array( $value ) ) {
			$forms = isset( $value['forms'] ) && is_array( $value['forms'] ) ? $value['forms'] : array();

			return array( 'forms' => $forms );
		}
		if ( is_string( $value ) ) {
			$parsed = self::decode_from_storage_string( $value );
			if ( null === $parsed ) {
				return array( 'forms' => array() );
			}
			$forms = isset( $parsed['forms'] ) && is_array( $parsed['forms'] ) ? $parsed['forms'] : array();

			return array( 'forms' => $forms );
		}

		return array( 'forms' => array() );
	}

	/**
	 * Persistable string for {@see update_option()}; arrays are encoded, strings assumed already encoded.
	 *
	 * @param mixed $value Array (JSON bundle) or string (legacy storage).
	 * @return string
	 */
	public static function encode_mixed_for_storage( $value ): string {
		if ( is_string( $value ) ) {
			return $value;
		}
		if ( ! is_array( $value ) ) {
			return self::encode_for_storage( array( 'forms' => array() ) );
		}
		$forms = isset( $value['forms'] ) && is_array( $value['forms'] ) ? $value['forms'] : array();

		return self::encode_for_storage( array( 'forms' => $forms ) );
	}
}
