<?php
/**
 * Full-site export/import: options, custom tables, and embedded uploads referenced in that data.
 *
 * @package Nexus_Lead_Suite
 */

declare(strict_types=1);

namespace Nexus_Lead_Suite;

use Nexus_Lead_Suite\Core\Activities_Store;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Collects / applies JSON bundles for backup and migration between sites.
 */
final class Data_Bundle {

	/**
	 * Skip embedding uploads larger than this to avoid memory exhaustion and REST JSON failures.
	 *
	 * @var int
	 */
	private const MAX_EMBEDDED_MEDIA_BYTES = 10485760;

	public const EXPORT_FORMAT_CURRENT = 4;

	public const EXPORT_FORMAT_WITH_MEDIA_NATIVE_FORMS = 3;

	public const EXPORT_FORMAT_LEGACY  = 2;

	/**
	 * Distinct marker so `get_option( $key, $marker )` ≠ stored `false`.
	 *
	 * @return object
	 */
	private static function missing_option_marker(): object {
		static $marker;
		return $marker ??= new \stdClass();
	}

	/**
	 * Option keys mirrored in uninstall cleanup (must stay aligned with uninstall.php).
	 *
	 * @var array<int,string>
	 */
	private const OPTION_KEYS = array(
		'nexus_ls_db_version',
		'nexus_ls_ca_rw_ok',
		'nexus_ls_migrate_nav_client_off_v3',
		'nexus_ls_migrate_auto_popup_off_v1',
		'nexus_ls_migrate_livechat_off_v1',
		'nexus_ls_general_settings_v1',
		'step_forms_builder_v0',
		'step_recaptcha_keys_v0',
		'step_turnstile_keys_v0',
		'nexus_ls_menu_items_v1',
		'nexus_ls_popups_v1',
		'nexus_ls_email_templates_v1',
		'nexus_ls_email_templates',
		'nexus_ls_smtp_settings',
		'nexus_ls_erase_on_uninstall',
	);

	/**
	 * @param bool $embed_media When false, skips scanning uploads and Base64 payloads (settings + DB tables only).
	 * @return array<string,mixed>
	 */
	public static function collect_bundle( bool $embed_media = true ): array {
		if ( function_exists( 'wp_raise_memory_limit' ) ) {
			wp_raise_memory_limit( 'admin' );
		}
		$mem_limit = (string) ini_get( 'memory_limit' );
		if ( '-1' !== $mem_limit && function_exists( 'wp_convert_hr_to_bytes' ) ) {
			$cur = wp_convert_hr_to_bytes( $mem_limit );
			if ( false === $cur || $cur < 512 * 1024 * 1024 ) {
				@ini_set( 'memory_limit', '512M' ); // phpcs:ignore Squiz.PHP.DiscouragedFunctions.Discouraged -- large import/export requires raised memory.
			}
		} elseif ( '-1' !== $mem_limit ) {
			@ini_set( 'memory_limit', '512M' ); // phpcs:ignore Squiz.PHP.DiscouragedFunctions.Discouraged -- large import/export requires raised memory.
		}
		set_time_limit( 300 ); // phpcs:ignore Squiz.PHP.DiscouragedFunctions.Discouraged -- large import/export may exceed default timeout.

		$marker  = self::missing_option_marker();
		$options = array();
		foreach ( self::OPTION_KEYS as $key ) {
			$value = get_option( $key, $marker );
			if ( $value === $marker ) {
				$options[ $key ] = null;
				continue;
			}
			$options[ $key ] = $value;
		}

		$upload = wp_upload_dir();
		$tables = self::safe_collect_tables();

		$options_for_media = $options;
		$options_out       = $options;
		if ( array_key_exists( 'step_forms_builder_v0', $options_for_media ) && null !== $options_for_media['step_forms_builder_v0'] ) {
			$options_for_media['step_forms_builder_v0'] = Forms_Payload_Codec::decode_mixed_for_scan( $options_for_media['step_forms_builder_v0'] );
		}
		if ( array_key_exists( 'step_forms_builder_v0', $options_out ) && null !== $options_out['step_forms_builder_v0'] ) {
			$options_out['step_forms_builder_v0'] = Forms_Payload_Codec::decode_mixed_for_scan( $options_out['step_forms_builder_v0'] );
		}

		$bundle = array(
			'nexus_ls_export_format' => self::EXPORT_FORMAT_CURRENT,
			'json_export_schema'     => 'nexus-lead-suite-full-json/1',
			'plugin_version'         => defined( 'NEXUS_LS_VERSION' ) ? NEXUS_LS_VERSION : '',
			'exported_at'            => gmdate( 'c' ),
			'source_site_url'        => home_url( '/' ),
			'export_uploads_baseurl' => (string) ( $upload['baseurl'] ?? '' ),
			'options'                => $options_out,
			// Any other wp_options rows for this plugin not in OPTION_KEYS (future-safe).
			'extra_options'          => self::safe_collect_orphan_plugin_options(),
			'tables'                 => $tables,
			'media'                  => $embed_media ? self::safe_collect_embedded_media( $options_for_media, $tables ) : array(),
		);

		if ( ! $embed_media ) {
			$bundle['media_embed_skipped'] = true;
		}

		try {
			return self::prepare_tree_for_json_export( $bundle );
		} catch ( \Throwable $e ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( 'Nexus Lead Suite collect_bundle prepare_tree: ' . $e->getMessage() );

			return $bundle;
		}
	}

	/**
	 * @return array<string,array<int,array<string,mixed>>>
	 */
	private static function safe_collect_tables(): array {
		try {
			return self::collect_tables();
		} catch ( \Throwable $e ) { // phpcs:ignore Generic.CodeAnalysis.EmptyStatement.DetectedCatch
			unset( $e );

			return array(
				'interactions' => array(),
				'submissions'  => array(),
			);
		}
	}

	/**
	 * @return array<string,mixed>
	 */
	private static function safe_collect_orphan_plugin_options(): array {
		try {
			return self::collect_orphan_plugin_options();
		} catch ( \Throwable $e ) { // phpcs:ignore Generic.CodeAnalysis.EmptyStatement.DetectedCatch
			unset( $e );

			return array();
		}
	}

	/**
	 * @param array<string,mixed>            $options Options snapshot.
	 * @param array<string,array<int,mixed>> $tables  Tables snapshot.
	 * @return array<int,array<string,mixed>>
	 */
	private static function safe_collect_embedded_media( array $options, array $tables ): array {
		try {
			return self::collect_embedded_media( $options, $tables );
		} catch ( \Throwable $e ) { // phpcs:ignore Generic.CodeAnalysis.EmptyStatement.DetectedCatch
			unset( $e );

			return array();
		}
	}

	/**
	 * Options in the database whose names match this plugin but are not in {@see OPTION_KEYS}.
	 *
	 * @return array<string,mixed>
	 */
	private static function collect_orphan_plugin_options(): array {
		global $wpdb;

		$known = array_flip( self::OPTION_KEYS );
		$like  = $wpdb->esc_like( 'nexus_ls' ) . '%';

		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.NoCaching,WordPress.DB.DirectDatabaseQuery.DirectQuery
		$rows = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT option_name, option_value FROM {$wpdb->options} WHERE option_name LIKE %s",
				$like
			),
			ARRAY_A
		);

		if ( ! is_array( $rows ) ) {
			return array();
		}

		$out = array();
		foreach ( $rows as $row ) {
			if ( ! isset( $row['option_name'] ) ) {
				continue;
			}
			$name = (string) $row['option_name'];
			if ( isset( $known[ $name ] ) ) {
				continue;
			}
			if ( ! self::is_allowed_extra_option_name( $name ) ) {
				continue;
			}
			$out[ $name ] = maybe_unserialize( $row['option_value'] );
		}

		return $out;
	}

	/**
	 * @param string $name Option name.
	 */
	private static function is_allowed_extra_option_name( string $name ): bool {
		return (bool) preg_match( '/^nexus_ls[A-Za-z0-9_]+$/', $name );
	}

	/**
	 * Strips non-JSON-safe values (resources, NaN) and safely converts objects.
	 * Avoids running heavy UTF-8 passes on large Base64 payloads (that broke exports on some hosts).
	 *
	 * @param mixed $data Tree.
	 * @param int   $depth Current recursion depth.
	 * @return mixed
	 */
	private static function prepare_tree_for_json_export( $data, int $depth = 0 ) {
		if ( $depth > 512 ) {
			return null;
		}

		if ( is_resource( $data ) ) {
			return null;
		}

		if ( null === $data || is_bool( $data ) || is_int( $data ) || is_float( $data ) ) {
			if ( is_float( $data ) && ( is_nan( $data ) || is_infinite( $data ) ) ) {
				return null;
			}

			return $data;
		}

		if ( is_string( $data ) ) {
			$slen = strlen( $data );
			// Avoid OOM / PCRE limits on huge blobs (forms payload, HTML in options, etc.).
			if ( $slen > 524288 ) {
				return $data;
			}
			if ( self::string_looks_like_binary_payload( $data ) ) {
				return $data;
			}
			$fixed = wp_check_invalid_utf8( $data, true );
			if ( ! is_string( $fixed ) ) {
				return '';
			}

			return $fixed;
		}

		if ( is_object( $data ) ) {
			try {
				if ( $data instanceof \JsonSerializable ) {
					return self::prepare_tree_for_json_export( $data->jsonSerialize(), $depth + 1 );
				}

				$encoded = wp_json_encode( $data );
				if ( is_string( $encoded ) && '' !== $encoded ) {
					$decoded = json_decode( $encoded, true );
					if ( is_array( $decoded ) ) {
						return self::prepare_tree_for_json_export( $decoded, $depth + 1 );
					}
				}
			} catch ( \Throwable $e ) { // phpcs:ignore Generic.CodeAnalysis.EmptyStatement.DetectedCatch
				unset( $e );
			}

			return array(
				'_nexus_ls_export_object' => is_object( $data ) ? get_class( $data ) : 'unknown',
			);
		}

		if ( is_array( $data ) ) {
			$out = array();
			foreach ( $data as $k => $v ) {
				$nk = $k;
				if ( is_string( $k ) ) {
					if ( ! self::string_looks_like_binary_payload( $k ) ) {
						$fixed_k = wp_check_invalid_utf8( $k, true );
						$nk      = is_string( $fixed_k ) ? $fixed_k : $k;
					}
				} elseif ( ! is_int( $k ) ) {
					$nk = (string) $k;
				}
				$out[ $nk ] = self::prepare_tree_for_json_export( $v, $depth + 1 );
			}

			return $out;
		}

		return null;
	}

	/**
	 * Long ASCII-only strings (e.g. Base64 file payloads) skip costly UTF-8 normalization.
	 *
	 * @param string $s String.
	 */
	private static function string_looks_like_binary_payload( string $s ): bool {
		$len = strlen( $s );
		if ( $len < 4096 || $len > 1048576 ) {
			return false;
		}

		return (bool) preg_match( '/\A[A-Za-z0-9+\/\r\n=*]+\z/', $s );
	}

	/**
	 * @return array<string,array<int,array<string,mixed>>>
	 */
	private static function collect_tables(): array {
		global $wpdb;

		$interactions = Activities_Store::table();
		$submissions  = $wpdb->prefix . 'nexus_ls_submissions';

		return array(
			'interactions' => self::fetch_all_rows( $interactions ),
			'submissions'  => self::fetch_all_rows( $submissions ),
		);
	}

	/**
	 * @param string $table Table name (wp prefix + known suffix only).
	 * @return array<int,array<string,mixed>>
	 */
	private static function fetch_all_rows( string $table ): array {
		global $wpdb;

		if ( ! preg_match( '/^[0-9a-zA-Z_]+$/', $table ) ) {
			return array();
		}

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- table existence check during export; table name validated by regex above.
		$found = $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $table ) );
		if ( $found !== $table ) {
			return array();
		}

		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.NoCaching,WordPress.DB.DirectDatabaseQuery.DirectQuery,PluginCheck.Security.DirectDB.UnescapedDBParameter -- table name validated by regex above.
		$rows = $wpdb->get_results( "SELECT * FROM {$table}", ARRAY_A );

		return is_array( $rows ) ? $rows : array();
	}

	/**
	 * Embed files under wp-content/uploads referenced anywhere in options or plugin tables.
	 *
	 * @param array<string,mixed>                $options Options snapshot.
	 * @param array<string,array<int,mixed>>     $tables  Tables snapshot.
	 * @return array<int,array<string,mixed>>
	 */
	private static function collect_embedded_media( array $options, array $tables ): array {
		$url_bag = array();
		self::walk_collect_upload_urls( $options, $url_bag );
		self::walk_collect_upload_urls( $tables, $url_bag );

		$by_rel = array();
		foreach ( array_keys( $url_bag ) as $url ) {
			$url = trim( $url );
			if ( '' === $url ) {
				continue;
			}
			$file_info = self::resolve_upload_file_from_url( $url );
			if ( null === $file_info ) {
				continue;
			}
			$rel = $file_info['relative'];
			if ( ! isset( $by_rel[ $rel ] ) ) {
				$by_rel[ $rel ] = array(
					'relative_path' => $rel,
					'abs_path'      => $file_info['absolute'],
					'mime_type'     => $file_info['mime'],
					'urls'          => array(),
				);
			}
			$by_rel[ $rel ]['urls'][ $url ] = true;
			$id = isset( $file_info['attachment_id'] ) ? (int) $file_info['attachment_id'] : 0;
			if ( $id > 0 ) {
				foreach ( self::gather_attachment_variant_urls( $id ) as $vu ) {
					$vu = trim( $vu );
					if ( '' !== $vu ) {
						$by_rel[ $rel ]['urls'][ $vu ] = true;
					}
				}
			}
		}

		$list = array();
		foreach ( $by_rel as $rel => $row ) {
			if ( empty( $row['abs_path'] ) || ! is_readable( $row['abs_path'] ) || ! is_file( $row['abs_path'] ) ) {
				continue;
			}
			$fsize = @filesize( $row['abs_path'] );
			if ( false !== $fsize && $fsize > self::MAX_EMBEDDED_MEDIA_BYTES ) {
				continue;
			}
			$raw = file_get_contents( $row['abs_path'] );
			if ( false === $raw ) {
				continue;
			}

			$urls = array_keys( $row['urls'] );
			sort( $urls );
			if ( empty( $urls ) ) {
				continue;
			}

			$canonical = '';
			foreach ( $urls as $candidate ) {
				if ( strpos( $candidate, 'https://' ) === 0 ) {
					$canonical = $candidate;
					break;
				}
			}
			if ( '' === $canonical ) {
				$canonical = $urls[0];
			}

			$aliases = array();
			foreach ( $urls as $u ) {
				if ( $u !== $canonical ) {
					$aliases[] = esc_url_raw( $u );
				}
			}

			$list[] = array(
				'source_url'    => esc_url_raw( $canonical ),
				'alias_urls'    => array_values(
					array_filter(
						array_unique( $aliases ),
						static function ( $x ) {
							return is_string( $x ) && '' !== $x;
						}
					)
				),
				'relative_path' => $rel,
				'mime_type'     => (string) ( $row['mime_type'] ?? '' ),
				'data_base64'   => base64_encode( $raw ),
			);
		}

		return $list;
	}

	/**
	 * @param mixed               $node   Tree.
	 * @param array<string,mixed>  $bucket URL => true.
	 */
	private static function walk_collect_upload_urls( $node, array &$bucket ): void {
		if ( is_string( $node ) ) {
			foreach ( self::extract_urls_pointing_at_uploads( $node ) as $u ) {
				if ( '' !== $u ) {
					$bucket[ $u ] = true;
				}
			}

			return;
		}

		if ( ! is_array( $node ) ) {
			return;
		}

		foreach ( $node as $child ) {
			self::walk_collect_upload_urls( $child, $bucket );
		}
	}

	/**
	 * @return array<int,string>
	 */
	private static function extract_urls_pointing_at_uploads( string $s ): array {
		$out = array();
		if ( preg_match_all( '#(?:https?:)?//[^\s\\\\"\'<>]+#i', $s, $m ) ) {
			foreach ( $m[0] as $raw ) {
				$url = trim( $raw );
				if ( '' === $url || ! self::string_maybe_contains_upload_reference( $url ) ) {
					continue;
				}
				$res = self::normalize_possibly_scheme_relative_url( $url );
				if ( '' !== $res && self::url_points_at_uploads( $res ) ) {
					$out[] = $res;
				}
			}
		}

		if ( preg_match_all( '#/wp-content/uploads/[^\s\\\\"\'<>]+#i', $s, $m2 ) ) {
			foreach ( $m2[0] as $pathish ) {
				$resolved = esc_url_raw( home_url( $pathish ) );
				if ( self::url_points_at_uploads( $resolved ) ) {
					$out[] = $resolved;
				}
			}
		}

		return array_values( array_unique( $out ) );
	}

	private static function string_maybe_contains_upload_reference( string $s ): bool {
		return strpos( $s, 'wp-content/uploads' ) !== false;
	}

	private static function url_points_at_uploads( string $url ): bool {
		$path = wp_parse_url( $url, PHP_URL_PATH );

		return is_string( $path ) && strpos( $path, '/wp-content/uploads' ) !== false;
	}

	private static function normalize_possibly_scheme_relative_url( string $url ): string {
		$url = trim( $url );
		if ( '' === $url ) {
			return '';
		}
		if ( strpos( $url, '//' ) === 0 ) {
			$s = wp_parse_url( home_url( '/' ), PHP_URL_SCHEME );
			$s = is_string( $s ) ? $s : 'https';

			return esc_url_raw( $s . ':' . $url );
		}

		return esc_url_raw( $url );
	}

	private static function attachment_id_from_upload_url( string $url ): int {
		$url = esc_url_raw( trim( $url ) );
		if ( '' === $url ) {
			return 0;
		}

		$id = (int) attachment_url_to_postid( $url );
		if ( $id > 0 ) {
			return $id;
		}

		$rel = self::relative_path_from_upload_url( $url );
		if ( null === $rel ) {
			return 0;
		}

		$file      = basename( $rel );
		$directory = dirname( $rel );

		if ( preg_match( '/^(.+?)-\d+x\d+(\.[^.]+)$/i', $file, $m ) ) {
			$stripped   = $m[1] . $m[2];
			$parent_rel = ( '.' === $directory || '' === $directory )
				? $stripped
				: $directory . '/' . $stripped;
			$upload = wp_upload_dir();
			if ( isset( $upload['baseurl'] ) && '' !== $upload['baseurl'] ) {
				$try_url = trailingslashit( (string) $upload['baseurl'] ) . str_replace( '\\', '/', wp_normalize_path( $parent_rel ) );

				return (int) attachment_url_to_postid( esc_url_raw( $try_url ) );
			}
		}

		return 0;
	}

	/**
	 * @return array<int,string>
	 */
	private static function gather_attachment_variant_urls( int $attachment_id ): array {
		$urls   = array();
		$file   = get_attached_file( $attachment_id );
		$direct = wp_get_attachment_url( $attachment_id );
		if ( is_string( $direct ) && '' !== $direct ) {
			$urls[] = $direct;
		}

		$upload = wp_upload_dir();
		$base_u = isset( $upload['baseurl'] ) ? trailingslashit( (string) $upload['baseurl'] ) : '';

		if ( is_string( $file ) && '' !== $file && '' !== $base_u ) {
			$relative = _wp_relative_upload_path( $file );
			if ( is_string( $relative ) && '' !== $relative ) {
				$m = wp_get_attachment_metadata( $attachment_id );
				if ( isset( $m['sizes'] ) && is_array( $m['sizes'] ) ) {
					$dir_rel = strpos( $relative, '/' ) !== false ? trailingslashit( dirname( $relative ) ) : '';
					foreach ( $m['sizes'] as $size ) {
						if ( isset( $size['file'] ) && is_string( $size['file'] ) && '' !== $size['file'] ) {
							$urls[] = $base_u . $dir_rel . $size['file'];
						}
					}
				}
			}
		}

		return array_values( array_unique( array_filter( $urls ) ) );
	}

	/**
	 * @return array{relative:string,absolute:string,mime:string,attachment_id?:int}|null
	 */
	private static function resolve_upload_file_from_url( string $url ): ?array {
		$url = esc_url_raw( trim( $url ) );
		if ( '' === $url || ! self::url_points_at_uploads( $url ) ) {
			return null;
		}

		$id = self::attachment_id_from_upload_url( $url );

		if ( $id > 0 ) {
			$file = get_attached_file( $id );
			if ( ! is_string( $file ) || '' === $file || ! is_readable( $file ) ) {
				return null;
			}
			$rel = _wp_relative_upload_path( $file );
			if ( ! is_string( $rel ) || '' === $rel ) {
				return null;
			}
			$rel  = wp_normalize_path( str_replace( '\\', '/', $rel ) );
			$type = wp_check_filetype( $file );
			$mime = is_array( $type ) ? (string) ( $type['type'] ?? '' ) : '';

			return array(
				'relative'      => $rel,
				'absolute'      => $file,
				'mime'          => '' !== $mime ? $mime : 'application/octet-stream',
				'attachment_id' => $id,
			);
		}

		$relative = self::relative_path_from_upload_url( $url );
		if ( null === $relative ) {
			return null;
		}

		$upload = wp_upload_dir();
		$base   = isset( $upload['basedir'] ) ? trailingslashit( (string) $upload['basedir'] ) : '';
		if ( '' === $base ) {
			return null;
		}

		$abs_path = wp_normalize_path( $base . $relative );

		if ( ! is_readable( $abs_path ) || ! is_file( $abs_path ) ) {
			return null;
		}

		$type = wp_check_filetype( $abs_path );
		$mime = is_array( $type ) ? (string) ( $type['type'] ?? '' ) : '';

		return array(
			'relative' => $relative,
			'absolute' => $abs_path,
			'mime'     => '' !== $mime ? $mime : 'application/octet-stream',
		);
	}

	private static function relative_path_from_upload_url( string $url ): ?string {
		$parsed = wp_parse_url( esc_url_raw( $url ), PHP_URL_PATH );
		if ( ! is_string( $parsed ) || '' === $parsed ) {
			return null;
		}

		$upload = wp_upload_dir();
		$base   = isset( $upload['baseurl'] ) ? wp_parse_url( (string) $upload['baseurl'], PHP_URL_PATH ) : null;
		if ( is_string( $base ) && '' !== $base && strpos( $parsed, $base ) === 0 ) {
			$sub = substr( $parsed, strlen( $base ) );

			return ltrim( wp_normalize_path( str_replace( '\\', '/', $sub ) ), '/' );
		}

		$marker = '/wp-content/uploads/';
		$pos    = strpos( $parsed, $marker );
		if ( false !== $pos ) {
			$sub = substr( $parsed, $pos + strlen( $marker ) );

			return ltrim( wp_normalize_path( str_replace( '\\', '/', $sub ) ), '/' );
		}

		return null;
	}

	/**
	 * @param array<string,mixed> $bundle Raw decoded JSON.
	 * @return true|\WP_Error
	 */
	public static function apply_bundle( array $bundle ) {
		if ( function_exists( 'wp_raise_memory_limit' ) ) {
			wp_raise_memory_limit( 'admin' );
		}
		$mem_limit = (string) ini_get( 'memory_limit' );
		if ( '-1' !== $mem_limit && function_exists( 'wp_convert_hr_to_bytes' ) ) {
			$cur = wp_convert_hr_to_bytes( $mem_limit );
			if ( false === $cur || $cur < 512 * 1024 * 1024 ) {
				@ini_set( 'memory_limit', '512M' ); // phpcs:ignore Squiz.PHP.DiscouragedFunctions.Discouraged -- large import/export requires raised memory.
			}
		} elseif ( '-1' !== $mem_limit ) {
			@ini_set( 'memory_limit', '512M' ); // phpcs:ignore Squiz.PHP.DiscouragedFunctions.Discouraged -- large import/export requires raised memory.
		}
		set_time_limit( 300 ); // phpcs:ignore Squiz.PHP.DiscouragedFunctions.Discouraged -- large import/export may exceed default timeout.

		$fmt = isset( $bundle['nexus_ls_export_format'] ) ? (int) $bundle['nexus_ls_export_format'] : 0;
		$allowed = array(
			self::EXPORT_FORMAT_LEGACY,
			self::EXPORT_FORMAT_WITH_MEDIA_NATIVE_FORMS,
			self::EXPORT_FORMAT_CURRENT,
		);
		if ( ! in_array( $fmt, $allowed, true ) ) {
			return new \WP_Error(
				'nexus_ls_bundle_format',
				__( 'Unsupported or invalid export file. Use a Nexus Lead Suite full export.', 'nexus-lead-suite' ),
				array( 'status' => 400 )
			);
		}

		if ( ! isset( $bundle['options'] ) || ! is_array( $bundle['options'] ) ) {
			return new \WP_Error( 'nexus_ls_bundle_options', __( 'Missing options object in bundle.', 'nexus-lead-suite' ), array( 'status' => 400 ) );
		}

		$opts = $bundle['options'];

		foreach ( self::OPTION_KEYS as $key ) {
			if ( ! array_key_exists( $key, $opts ) ) {
				return new \WP_Error(
					'nexus_ls_bundle_incomplete',
					sprintf(
						/* translators: %s: option key */
						__( 'Export file is incomplete (missing option: %s). Re-export from the latest plugin version.', 'nexus-lead-suite' ),
						$key
					),
					array( 'status' => 400 )
				);
			}
		}

		try {
			self::ensure_tables_exist();
		} catch ( \Throwable $e ) {
			return new \WP_Error(
				'nexus_ls_import_schema',
				__( 'Could not prepare database tables for import.', 'nexus-lead-suite' ) . ' ' . $e->getMessage(),
				array( 'status' => 500 )
			);
		}

		$tables_in = isset( $bundle['tables'] ) && is_array( $bundle['tables'] ) ? $bundle['tables'] : array();

		$media_items = isset( $bundle['media'] ) && is_array( $bundle['media'] ) ? $bundle['media'] : array();
		$imported    = self::import_media_items( $media_items );
		if ( is_wp_error( $imported ) ) {
			return $imported;
		}

		$url_map = self::expand_url_replacement_map( $imported );

		$old_upload_base = isset( $bundle['export_uploads_baseurl'] ) ? rtrim( (string) $bundle['export_uploads_baseurl'], '/' ) : '';
		$new_upload_base = rtrim( (string) ( wp_upload_dir()['baseurl'] ?? '' ), '/' );
		if ( '' !== $old_upload_base && '' !== $new_upload_base && $old_upload_base !== $new_upload_base ) {
			$url_map = self::expand_url_replacement_map(
				array_merge(
					array( $old_upload_base => $new_upload_base ),
					$url_map
				)
			);
		}

		if ( array_key_exists( 'step_forms_builder_v0', $opts ) && null !== $opts['step_forms_builder_v0'] ) {
			$opts['step_forms_builder_v0'] = Forms_Payload_Codec::decode_mixed_for_scan( $opts['step_forms_builder_v0'] );
		}

		$opts      = self::deep_apply_url_map( $opts, $url_map );
		$tables_in = self::deep_apply_url_map( $tables_in, $url_map );

		foreach ( self::OPTION_KEYS as $key ) {
			$val = $opts[ $key ];
			if ( null === $val ) {
				delete_option( $key );
				continue;
			}
			if ( 'step_forms_builder_v0' === $key ) {
				$val = Forms_Payload_Codec::encode_mixed_for_storage( $val );
			}
			update_option( $key, $val, false );
		}

		$extra_opts = isset( $bundle['extra_options'] ) && is_array( $bundle['extra_options'] ) ? $bundle['extra_options'] : array();
		$extra_opts = self::deep_apply_url_map( $extra_opts, $url_map );
		foreach ( $extra_opts as $xkey => $xval ) {
			if ( ! is_string( $xkey ) || ! self::is_allowed_extra_option_name( $xkey ) ) {
				continue;
			}
			if ( in_array( $xkey, self::OPTION_KEYS, true ) ) {
				continue;
			}
			if ( null === $xval ) {
				delete_option( $xkey );
				continue;
			}
			update_option( $xkey, $xval, false );
		}

		$db_err = self::restore_table(
			Activities_Store::table(),
			isset( $tables_in['interactions'] ) && is_array( $tables_in['interactions'] ) ? $tables_in['interactions'] : array(),
			array(
				'id'           => '%d',
				'session_key'  => '%s',
				'event_type'   => '%s',
				'target_key'   => '%s',
				'page_url'     => '%s',
				'referrer_url' => '%s',
				'meta'         => '%s',
				'ip_hash'      => '%s',
				'ua_hash'      => '%s',
				'created_at'   => '%s',
			)
		);
		if ( is_wp_error( $db_err ) ) {
			return $db_err;
		}

		global $wpdb;
		$submissions = $wpdb->prefix . 'nexus_ls_submissions';
		$db_err        = self::restore_table(
			$submissions,
			isset( $tables_in['submissions'] ) && is_array( $tables_in['submissions'] ) ? $tables_in['submissions'] : array(),
			array(
				'id'         => '%d',
				'form_key'   => '%s',
				'status'     => '%s',
				'payload'    => '%s',
				'ip_hash'    => '%s',
				'ua_hash'    => '%s',
				'created_at' => '%s',
				'updated_at' => '%s',
			)
		);
		if ( is_wp_error( $db_err ) ) {
			return $db_err;
		}

		/*
		 * Full replace: remove orphan nexus_ls* options that existed on this site but were not in
		 * the export (tracked keys + extra_options). Otherwise old data merges with the import.
		 */
		self::purge_extra_options_not_in_bundle( $bundle );

		if ( function_exists( 'wp_cache_flush' ) ) {
			wp_cache_flush();
		}

		return true;
	}

	/**
	 * Deletes wp_options rows for plugin-scoped extras not listed in the bundle (full import wipe).
	 *
	 * Core {@see OPTION_KEYS} are already updated above; this only targets `nexus_ls*` names
	 * outside that set that are absent from `extra_options` in the file.
	 *
	 * @param array<string,mixed> $bundle Import bundle.
	 */
	private static function purge_extra_options_not_in_bundle( array $bundle ): void {
		global $wpdb;

		$extra_in_bundle = isset( $bundle['extra_options'] ) && is_array( $bundle['extra_options'] ) ? $bundle['extra_options'] : array();
		$allowed_extra   = array_keys( $extra_in_bundle );
		$known_flip      = array_flip( self::OPTION_KEYS );

		$like = $wpdb->esc_like( 'nexus_ls' ) . '%';
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$rows = $wpdb->get_col(
			$wpdb->prepare(
				"SELECT option_name FROM {$wpdb->options} WHERE option_name LIKE %s",
				$like
			)
		);
		if ( ! is_array( $rows ) ) {
			return;
		}

		foreach ( $rows as $name ) {
			if ( ! is_string( $name ) || '' === $name ) {
				continue;
			}
			if ( isset( $known_flip[ $name ] ) ) {
				continue;
			}
			if ( ! self::is_allowed_extra_option_name( $name ) ) {
				continue;
			}
			if ( in_array( $name, $allowed_extra, true ) ) {
				continue;
			}
			delete_option( $name );
		}
	}

	/**
	 * @param array<int,array<string,mixed>|mixed> $items Media entries from bundle.
	 * @return array<string,string>|\WP_Error Map old URL => new URL.
	 */
	private static function import_media_items( array $items ) {
		if ( array() === $items ) {
			return array();
		}

		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/image.php';
		// wp_insert_attachment() and related media helpers (not loaded on every REST request).
		require_once ABSPATH . 'wp-admin/includes/media.php';

		$map       = array();
		$upload    = wp_upload_dir();
		$basedir_o = isset( $upload['basedir'] ) ? trailingslashit( (string) $upload['basedir'] ) : '';
		if ( '' === $basedir_o ) {
			return new \WP_Error( 'nexus_ls_import_uploads_base', __( 'Uploads folder is unavailable for import.', 'nexus-lead-suite' ), array( 'status' => 500 ) );
		}

		$upload_root = wp_normalize_path( rtrim( $basedir_o, '/\\' ) );

		foreach ( $items as $idx => $item ) {
			if ( ! is_array( $item ) ) {
				continue;
			}

			$canonical = isset( $item['source_url'] ) ? esc_url_raw( trim( (string) $item['source_url'] ) ) : '';
			$b64       = isset( $item['data_base64'] ) ? trim( (string) $item['data_base64'] ) : '';
			$rel_raw   = isset( $item['relative_path'] ) ? trim( (string) $item['relative_path'] ) : '';
			$rel_raw   = str_replace( '\\', '/', $rel_raw );
			$rel_raw   = ltrim( wp_normalize_path( $rel_raw ), '/' );

			if ( '' === $canonical || '' === $b64 || '' === $rel_raw ) {
				return new \WP_Error(
					'nexus_ls_import_media_bad',
					sprintf(
						/* translators: %d: row index (1-based) */
						__( 'Invalid embedded media row at #%d.', 'nexus-lead-suite' ),
						(int) $idx + 1
					),
					array( 'status' => 400 )
				);
			}

			if ( false !== strpos( $rel_raw, '..' ) ) {
				return new \WP_Error( 'nexus_ls_import_media_path', __( 'Unsafe media relative path.', 'nexus-lead-suite' ), array( 'status' => 400 ) );
			}

			// phpcs:disable WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_decode
			$bytes = base64_decode( $b64, true );
			// phpcs:enable
			if ( false === $bytes || '' === $bytes ) {
				return new \WP_Error( 'nexus_ls_import_media_b64', __( 'Could not decode embedded file data.', 'nexus-lead-suite' ), array( 'status' => 400 ) );
			}

			$dest = wp_normalize_path( $upload_root . '/' . $rel_raw );
			$dir  = dirname( $dest );
			if ( strpos( wp_normalize_path( $dir ), $upload_root ) !== 0 ) {
				return new \WP_Error( 'nexus_ls_media_dest', __( 'Rejected media destination outside uploads.', 'nexus-lead-suite' ), array( 'status' => 400 ) );
			}

			wp_mkdir_p( $dir );

			if ( file_put_contents( $dest, $bytes ) === false ) {
				return new \WP_Error(
					'nexus_ls_import_media_write',
					sprintf(
						/* translators: %s: file name */
						__( 'Could not write file: %s', 'nexus-lead-suite' ),
						basename( $dest )
					),
					array( 'status' => 500 )
				);
			}

			if ( isset( $item['mime_type'] ) && is_string( $item['mime_type'] ) && '' !== trim( $item['mime_type'] ) ) {
				$mime = sanitize_mime_type( (string) $item['mime_type'] );
				if ( '' === $mime ) {
					$check = wp_check_filetype( $dest );
					$mime  = is_array( $check ) ? (string) ( $check['type'] ?? '' ) : '';
				}
			} else {
				$check = wp_check_filetype( $dest );
				$mime  = is_array( $check ) ? (string) ( $check['type'] ?? '' ) : '';
			}
			if ( '' === $mime ) {
				$mime = 'application/octet-stream';
			}

			$post_id = wp_insert_attachment(
				array(
					'post_mime_type' => $mime,
					'post_title'     => sanitize_text_field( pathinfo( basename( $dest ), PATHINFO_FILENAME ) ),
					'post_content'   => '',
					'post_status'    => 'inherit',
				),
				$dest,
				0
			);

			if ( ! is_numeric( $post_id ) || (int) $post_id <= 0 ) {
				return new \WP_Error( 'nexus_ls_attachment_failed', __( 'Could not register media in the Media Library.', 'nexus-lead-suite' ), array( 'status' => 500 ) );
			}

			$post_id = (int) $post_id;

			$meta_gen = false;
			try {
				$meta_gen = wp_generate_attachment_metadata( $post_id, $dest );
			} catch ( \Throwable $e ) {
				// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
				error_log( 'Nexus Lead Suite import: wp_generate_attachment_metadata failed: ' . $e->getMessage() );
			}
			if ( is_array( $meta_gen ) ) {
				wp_update_attachment_metadata( $post_id, $meta_gen );
			} else {
				$relative_wp = _wp_relative_upload_path( $dest );
				$meta_fb     = array(
					'file'  => is_string( $relative_wp ) ? $relative_wp : basename( $dest ),
					'sizes' => array(),
				);
				$dims = wp_getimagesize( $dest );
				if ( is_array( $dims ) && isset( $dims[0], $dims[1] ) ) {
					$meta_fb['width']  = (int) $dims[0];
					$meta_fb['height'] = (int) $dims[1];
				}
				wp_update_attachment_metadata( $post_id, $meta_fb );
			}

			$new_url = wp_get_attachment_url( $post_id );
			if ( ! is_string( $new_url ) || '' === $new_url ) {
				return new \WP_Error( 'nexus_ls_attachment_url_failed', __( 'Imported file has no URL.', 'nexus-lead-suite' ), array( 'status' => 500 ) );
			}

			$old_list = array_merge( array( $canonical ), isset( $item['alias_urls'] ) && is_array( $item['alias_urls'] ) ? $item['alias_urls'] : array() );
			foreach ( $old_list as $old_url ) {
				$old_url = esc_url_raw( trim( (string) $old_url ) );
				if ( '' === $old_url ) {
					continue;
				}
				$map[ $old_url ] = $new_url;
			}
		}

		return $map;
	}

	/**
	 * Add http/https alternates so stored strings still match.
	 *
	 * @param array<string,string> $pairs Old => new.
	 * @return array<string,string>
	 */
	private static function expand_url_replacement_map( array $pairs ): array {
		if ( empty( $pairs ) ) {
			return array();
		}

		$out = $pairs;
		foreach ( $pairs as $old => $new ) {
			if ( ! is_string( $old ) || ! is_string( $new ) ) {
				continue;
			}
			$scheme = wp_parse_url( $old, PHP_URL_SCHEME );
			if ( 'https' === $scheme ) {
				$http_old = preg_replace( '#^https#i', 'http', $old, 1 );
				if ( is_string( $http_old ) && $http_old !== $old ) {
					$n_http = preg_replace( '#^https#i', 'http', $new, 1 );
					$out[ $http_old ] = is_string( $n_http ) ? $n_http : $new;
				}
			} elseif ( 'http' === $scheme ) {
				$https_old = preg_replace( '#^http#i', 'https', $old, 1 );
				if ( is_string( $https_old ) && $https_old !== $old ) {
					$n_https = preg_replace( '#^http#i', 'https', $new, 1 );
					$out[ $https_old ] = is_string( $n_https ) ? $n_https : $new;
				}
			}
		}

		return $out;
	}

	/**
	 * Ensure URL replacement map uses string keys only (avoids PHP 8 usort TypeError with mixed keys).
	 *
	 * @param array<string,string> $map URL map.
	 * @return array<string,string>
	 */
	private static function normalize_url_string_map( array $map ): array {
		$out = array();
		foreach ( $map as $k => $v ) {
			if ( ! is_string( $v ) || '' === $v ) {
				continue;
			}
			$key = is_string( $k ) ? $k : (string) $k;
			if ( '' === $key ) {
				continue;
			}
			$out[ $key ] = $v;
		}

		return $out;
	}

	private static function ensure_tables_exist(): void {
		Activator::install_tables();
	}

	/**
	 * @param mixed                $data Data tree.
	 * @param array<string,string> $map  Old URL => new URL.
	 * @return mixed
	 */
	private static function deep_apply_url_map( $data, array $map ) {
		if ( empty( $map ) ) {
			return $data;
		}

		$map = self::normalize_url_string_map( $map );
		if ( empty( $map ) ) {
			return $data;
		}

		$keys = array_keys( $map );
		usort(
			$keys,
			static function ( $a, $b ) {
				return strlen( (string) $b ) <=> strlen( (string) $a );
			}
		);

		return self::deep_apply_ordered_keys( $data, $map, $keys );
	}

	/**
	 * @param mixed                $data Tree.
	 * @param array<string,string> $map  Full map.
	 * @param array<int,string>    $keys Sorted old URLs (longest first).
	 * @return mixed
	 */
	private static function deep_apply_ordered_keys( $data, array $map, array $keys ) {
		if ( is_string( $data ) ) {
			$s = $data;
			foreach ( $keys as $old ) {
				if ( '' === $old || ! isset( $map[ $old ] ) ) {
					continue;
				}
				if ( strpos( $s, $old ) !== false ) {
					$s = str_replace( $old, $map[ $old ], $s );
				}
			}

			return $s;
		}

		if ( ! is_array( $data ) ) {
			return $data;
		}

		foreach ( $data as $k => $v ) {
			$data[ $k ] = self::deep_apply_ordered_keys( $v, $map, $keys );
		}

		return $data;
	}

	/**
	 * @param string                               $table   Full prefixed table name.
	 * @param array<int,array<string,mixed>>       $rows    Rows.
	 * @param array<string,string>                 $columns Map column => $wpdb format.
	 * @return true|\WP_Error
	 */
	private static function restore_table( string $table, array $rows, array $columns ) {
		global $wpdb;

		if ( ! preg_match( '/^[0-9a-zA-Z_]+$/', $table ) ) {
			return true;
		}

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- table existence check during import restore.
		$found = $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $table ) );
		if ( $found !== $table ) {
			return true;
		}

		try {
			// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.NoCaching,WordPress.DB.DirectDatabaseQuery.DirectQuery,PluginCheck.Security.DirectDB.UnescapedDBParameter -- table name validated by regex above; import restore.
			$trunc = $wpdb->query( "TRUNCATE TABLE {$table}" );
			if ( false === $trunc ) {
				// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.NoCaching,WordPress.DB.DirectDatabaseQuery.DirectQuery,PluginCheck.Security.DirectDB.UnescapedDBParameter -- table name validated by regex above; import restore.
				$wpdb->query( "DELETE FROM {$table}" );
			}
		} catch ( \Throwable $e ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( 'Nexus Lead Suite restore_table truncate: ' . $e->getMessage() );

			return new \WP_Error(
				'nexus_ls_import_truncate',
				__( 'Could not clear activity tables for import.', 'nexus-lead-suite' ) . ' ' . $e->getMessage(),
				array( 'status' => 500 )
			);
		}

		if ( empty( $rows ) ) {
			return true;
		}

		$col_order = array_keys( $columns );

		foreach ( $rows as $idx => $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}

			$data   = array();
			$format = array();
			foreach ( $col_order as $col ) {
				if ( ! array_key_exists( $col, $row ) ) {
					continue;
				}
				$val = $row[ $col ];
				if ( 'meta' === $col || 'payload' === $col ) {
					if ( is_array( $val ) ) {
						$val = wp_json_encode( $val );
					} elseif ( is_object( $val ) ) {
						$val = wp_json_encode( (array) $val );
					} elseif ( null === $val ) {
						$val = '';
					} else {
						$val = (string) $val;
					}
				} elseif ( 'id' === $col ) {
					$val = (int) $val;
				} elseif ( null === $val && in_array( $col, array( 'page_url', 'referrer_url', 'created_at', 'updated_at', 'session_key', 'event_type', 'target_key', 'form_key', 'status', 'ip_hash', 'ua_hash' ), true ) ) {
					$val = '';
				}

				$data[ $col ] = $val;
				$format[]     = $columns[ $col ];
			}

			if ( empty( $data ) ) {
				continue;
			}

			try {
				$ok = $wpdb->insert( $table, $data, $format ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
			} catch ( \Throwable $e ) {
				return new \WP_Error(
					'nexus_ls_import_row',
					sprintf(
						/* translators: 1: row number (1-based), 2: error message */
						__( 'Database import failed at row %1$s: %2$s', 'nexus-lead-suite' ),
						(string) ( (int) $idx + 1 ),
						$e->getMessage()
					),
					array( 'status' => 500, 'table' => $table )
				);
			}

			if ( false === $ok ) {
				return new \WP_Error(
					'nexus_ls_import_row',
					sprintf(
						/* translators: 1: row number (1-based), 2: database error */
						__( 'Database import failed at row %1$s: %2$s', 'nexus-lead-suite' ),
						(string) ( (int) $idx + 1 ),
						$wpdb->last_error !== '' ? $wpdb->last_error : __( 'insert returned false', 'nexus-lead-suite' )
					),
					array( 'status' => 500, 'table' => $table )
				);
			}
		}

		return true;
	}
}
