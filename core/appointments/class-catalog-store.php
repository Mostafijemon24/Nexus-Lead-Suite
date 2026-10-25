<?php
/**
 * CRUD for the simple catalogue entities: departments, locations, medicine types, medicines.
 *
 * @package nexulesuite_
 */

declare(strict_types=1);

namespace nexulesuite_\Appointments;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * One store for the four lookup tables; the shape of each row is normalised to camelCase.
 */
final class Catalog_Store {

	public const KINDS = array( 'departments', 'locations', 'medicine_types', 'medicines' );

	/**
	 * @param string $kind Kind.
	 * @return void
	 */
	private static function assert_kind( string $kind ): void {
		if ( ! in_array( $kind, self::KINDS, true ) ) {
			throw new \InvalidArgumentException( 'Unknown catalogue kind: ' . $kind );
		}
	}

	/**
	 * Lists rows.
	 *
	 * @param string              $kind Kind.
	 * @param array<string,mixed> $args status, search, typeId, page, perPage, withCounts.
	 * @return array{items:array<int,array<string,mixed>>,total:int,page:int,perPage:int}
	 */
	public static function all( string $kind, array $args = array() ): array {
		global $wpdb;
		self::assert_kind( $kind );

		$table    = Schema::table( $kind );
		$where    = array( '1=1' );
		$params   = array();
		$status   = isset( $args['status'] ) ? sanitize_key( (string) $args['status'] ) : '';
		$search   = isset( $args['search'] ) ? trim( (string) $args['search'] ) : '';
		$page     = max( 1, (int) ( $args['page'] ?? 1 ) );
		$per_page = max( 1, min( 500, (int) ( $args['perPage'] ?? 100 ) ) );

		if ( '' !== $status && 'all' !== $status ) {
			$where[]  = 'status = %s';
			$params[] = $status;
		}
		if ( '' !== $search ) {
			$where[]  = 'name LIKE %s';
			$params[] = '%' . $wpdb->esc_like( $search ) . '%';
		}
		if ( 'medicines' === $kind && ! empty( $args['typeId'] ) ) {
			$where[]  = 'type_id = %d';
			$params[] = (int) $args['typeId'];
		}

		$where_sql = implode( ' AND ', $where );
		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- custom tables; where clauses prepared above.
		$count_sql = "SELECT COUNT(*) FROM {$table} WHERE {$where_sql}";
		$total     = (int) ( $params ? $wpdb->get_var( $wpdb->prepare( $count_sql, $params ) ) : $wpdb->get_var( $count_sql ) );

		$offset   = ( $page - 1 ) * $per_page;
		$list_sql = "SELECT * FROM {$table} WHERE {$where_sql} ORDER BY name ASC LIMIT %d OFFSET %d";
		$rows     = $wpdb->get_results( $wpdb->prepare( $list_sql, array_merge( $params, array( $per_page, $offset ) ) ), ARRAY_A );
		// phpcs:enable

		$items = array();
		foreach ( (array) $rows as $row ) {
			$items[] = self::normalize( $kind, (array) $row );
		}

		if ( ! empty( $args['withCounts'] ) && array() !== $items ) {
			$items = self::attach_counts( $kind, $items );
		}

		return array(
			'items'   => $items,
			'total'   => $total,
			'page'    => $page,
			'perPage' => $per_page,
		);
	}

	/**
	 * Adds doctorCount / medicineCount columns.
	 *
	 * @param string                           $kind  Kind.
	 * @param array<int,array<string,mixed>>   $items Items.
	 * @return array<int,array<string,mixed>>
	 */
	private static function attach_counts( string $kind, array $items ): array {
		global $wpdb;

		$map = array(
			'departments'    => array( Schema::table( 'doctors' ), 'department_id', 'doctorCount' ),
			'locations'      => array( Schema::table( 'doctors' ), 'location_id', 'doctorCount' ),
			'medicine_types' => array( Schema::table( 'medicines' ), 'type_id', 'medicineCount' ),
		);
		if ( ! isset( $map[ $kind ] ) ) {
			return $items;
		}
		list( $ref_table, $col, $key ) = $map[ $kind ];
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- custom tables.
		$rows   = $wpdb->get_results( "SELECT {$col} AS ref_id, COUNT(*) AS c FROM {$ref_table} GROUP BY {$col}", ARRAY_A );
		$counts = array();
		foreach ( (array) $rows as $r ) {
			$counts[ (int) $r['ref_id'] ] = (int) $r['c'];
		}
		foreach ( $items as &$item ) {
			$item[ $key ] = $counts[ (int) $item['id'] ] ?? 0;
		}
		unset( $item );

		return $items;
	}

	/**
	 * @param string $kind Kind.
	 * @param int    $id   Row id.
	 * @return array<string,mixed>|null
	 */
	public static function get( string $kind, int $id ): ?array {
		global $wpdb;
		self::assert_kind( $kind );
		if ( $id <= 0 ) {
			return null;
		}
		$table = Schema::table( $kind );
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- custom table.
		$row = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$table} WHERE id = %d", $id ), ARRAY_A );

		return $row ? self::normalize( $kind, (array) $row ) : null;
	}

	/**
	 * @param string $kind Kind (departments or locations).
	 * @param string $slug Slug.
	 * @return array<string,mixed>|null
	 */
	public static function get_by_slug( string $kind, string $slug ): ?array {
		global $wpdb;
		self::assert_kind( $kind );
		$slug = sanitize_title( $slug );
		if ( '' === $slug || ! in_array( $kind, array( 'departments', 'locations' ), true ) ) {
			return null;
		}
		$table = Schema::table( $kind );
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- custom table.
		$row = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$table} WHERE slug = %s", $slug ), ARRAY_A );

		return $row ? self::normalize( $kind, (array) $row ) : null;
	}

	/**
	 * Validates input for create/update.
	 *
	 * @param string              $kind  Kind.
	 * @param array<string,mixed> $input Input.
	 * @param int                 $id    Existing id (0 on create).
	 * @return array{data:array<string,mixed>,errors:array<string,string>}
	 */
	private static function validate( string $kind, array $input, int $id ): array {
		global $wpdb;

		$v    = new Validator();
		$data = array();

		$data['name']   = $v->text( $input, 'name', 2, 120 );
		$data['status'] = $v->one_of( $input, 'status', array( 'active', 'inactive' ), 'active' );

		if ( 'departments' === $kind ) {
			$data['description'] = $v->textarea( $input, 'description', 5000 );
			$data['icon']        = substr( sanitize_key( (string) ( $input['icon'] ?? '' ) ), 0, 64 );
		} elseif ( 'locations' === $kind ) {
			$data['address'] = $v->textarea( $input, 'address', 1000 );
		} elseif ( 'medicines' === $kind ) {
			$data['type_id'] = $v->int( $input, 'typeId', 0, PHP_INT_MAX, 0 );
			$data['note']    = $v->text( $input, 'note', 0, 255, false );
			if ( $data['type_id'] > 0 && null === self::get( 'medicine_types', $data['type_id'] ) ) {
				$v->add( 'typeId', __( 'Select an existing medicine type.', 'nexus-lead-suite' ) );
			}
		}

		if ( in_array( $kind, array( 'departments', 'locations' ), true ) && '' !== $data['name'] ) {
			$data['slug'] = self::unique_slug( $kind, isset( $input['slug'] ) && '' !== trim( (string) $input['slug'] ) ? (string) $input['slug'] : $data['name'], $id );
		}

		if ( 'medicine_types' === $kind && '' !== $data['name'] ) {
			$table = Schema::table( $kind );
			// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- custom table.
			$dupe = (int) $wpdb->get_var( $wpdb->prepare( "SELECT id FROM {$table} WHERE name = %s AND id <> %d", $data['name'], $id ) );
			if ( $dupe > 0 ) {
				$v->add( 'name', __( 'A medicine type with this name already exists.', 'nexus-lead-suite' ) );
			}
		}

		return array(
			'data'   => $data,
			'errors' => $v->errors(),
		);
	}

	/**
	 * Builds a slug unique within the table.
	 *
	 * @param string $kind       Kind.
	 * @param string $source     Name or slug.
	 * @param int    $exclude_id Row id to ignore.
	 * @return string
	 */
	public static function unique_slug( string $kind, string $source, int $exclude_id = 0 ): string {
		global $wpdb;

		$base = sanitize_title( $source );
		if ( '' === $base ) {
			$base = 'item';
		}
		$base  = substr( $base, 0, 120 );
		$table = Schema::table( $kind );
		$slug  = $base;
		$n     = 2;
		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- custom table.
		while ( (int) $wpdb->get_var( $wpdb->prepare( "SELECT id FROM {$table} WHERE slug = %s AND id <> %d", $slug, $exclude_id ) ) > 0 ) {
			$slug = $base . '-' . $n;
			++$n;
		}
		// phpcs:enable

		return $slug;
	}

	/**
	 * Creates a row.
	 *
	 * @param string              $kind  Kind.
	 * @param array<string,mixed> $input Input.
	 * @return array<string,mixed>|\WP_Error
	 */
	public static function create( string $kind, array $input ) {
		global $wpdb;
		self::assert_kind( $kind );

		$r = self::validate( $kind, $input, 0 );
		if ( array() !== $r['errors'] ) {
			return self::validation_error( $r['errors'] );
		}

		$now                = current_time( 'mysql' );
		$r['data']['created_at'] = $now;
		$r['data']['updated_at'] = $now;

		$ok = $wpdb->insert( Schema::table( $kind ), $r['data'] ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery -- custom table.
		if ( false === $ok ) {
			return new \WP_Error( 'db_error', __( 'Could not save. Please try again.', 'nexus-lead-suite' ), array( 'status' => 500 ) );
		}

		return self::get( $kind, (int) $wpdb->insert_id );
	}

	/**
	 * Updates a row.
	 *
	 * @param string              $kind  Kind.
	 * @param int                 $id    Id.
	 * @param array<string,mixed> $input Input.
	 * @return array<string,mixed>|\WP_Error
	 */
	public static function update( string $kind, int $id, array $input ) {
		global $wpdb;
		self::assert_kind( $kind );

		$existing = self::get( $kind, $id );
		if ( null === $existing ) {
			return new \WP_Error( 'not_found', __( 'Item not found.', 'nexus-lead-suite' ), array( 'status' => 404 ) );
		}

		$r = self::validate( $kind, array_merge( self::denormalize( $existing ), $input ), $id );
		if ( array() !== $r['errors'] ) {
			return self::validation_error( $r['errors'] );
		}
		$r['data']['updated_at'] = current_time( 'mysql' );

		$ok = $wpdb->update( Schema::table( $kind ), $r['data'], array( 'id' => $id ) ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery -- custom table.
		if ( false === $ok ) {
			return new \WP_Error( 'db_error', __( 'Could not save. Please try again.', 'nexus-lead-suite' ), array( 'status' => 500 ) );
		}

		return self::get( $kind, $id );
	}

	/**
	 * Deletes a row unless it is still referenced.
	 *
	 * @param string $kind Kind.
	 * @param int    $id   Id.
	 * @return true|\WP_Error
	 */
	public static function delete( string $kind, int $id ) {
		global $wpdb;
		self::assert_kind( $kind );

		if ( null === self::get( $kind, $id ) ) {
			return new \WP_Error( 'not_found', __( 'Item not found.', 'nexus-lead-suite' ), array( 'status' => 404 ) );
		}

		$refs = array(
			'departments'    => array( Schema::table( 'doctors' ), 'department_id', __( 'This department still has doctors. Move or delete them first.', 'nexus-lead-suite' ) ),
			'locations'      => array( Schema::table( 'doctors' ), 'location_id', __( 'This location still has doctors. Move or delete them first.', 'nexus-lead-suite' ) ),
			'medicine_types' => array( Schema::table( 'medicines' ), 'type_id', __( 'This type still has medicines. Move or delete them first.', 'nexus-lead-suite' ) ),
			'medicines'      => array( Schema::table( 'prescriptions' ), 'medicine_id', __( 'This medicine is used in prescriptions. Set it inactive instead.', 'nexus-lead-suite' ) ),
		);
		list( $ref_table, $col, $message ) = $refs[ $kind ];
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- custom table.
		$in_use = (int) $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM {$ref_table} WHERE {$col} = %d", $id ) );
		if ( $in_use > 0 ) {
			return new \WP_Error( 'in_use', $message, array( 'status' => 409 ) );
		}

		$wpdb->delete( Schema::table( $kind ), array( 'id' => $id ), array( '%d' ) ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery -- custom table.

		return true;
	}

	/**
	 * Row => API shape.
	 *
	 * @param string              $kind Kind.
	 * @param array<string,mixed> $row  Row.
	 * @return array<string,mixed>
	 */
	public static function normalize( string $kind, array $row ): array {
		$out = array(
			'id'        => (int) $row['id'],
			'name'      => (string) $row['name'],
			'status'    => (string) ( $row['status'] ?? 'active' ),
			'createdAt' => (string) ( $row['created_at'] ?? '' ),
			'updatedAt' => (string) ( $row['updated_at'] ?? '' ),
		);
		if ( 'departments' === $kind ) {
			$out['slug']        = (string) $row['slug'];
			$out['description'] = (string) ( $row['description'] ?? '' );
			$out['icon']        = (string) ( $row['icon'] ?? '' );
		} elseif ( 'locations' === $kind ) {
			$out['slug']    = (string) $row['slug'];
			$out['address'] = (string) ( $row['address'] ?? '' );
		} elseif ( 'medicines' === $kind ) {
			$out['typeId'] = (int) ( $row['type_id'] ?? 0 );
			$out['note']   = (string) ( $row['note'] ?? '' );
			$type          = $out['typeId'] > 0 ? self::get( 'medicine_types', $out['typeId'] ) : null;
			$out['typeName'] = $type ? $type['name'] : '';
		}

		return $out;
	}

	/**
	 * API shape => input keys (for merge on update).
	 *
	 * @param array<string,mixed> $item Item.
	 * @return array<string,mixed>
	 */
	private static function denormalize( array $item ): array {
		return $item;
	}

	/**
	 * @param array<string,string> $errors Field errors.
	 * @return \WP_Error
	 */
	public static function validation_error( array $errors ): \WP_Error {
		return new \WP_Error(
			'validation_failed',
			__( 'Please correct the highlighted fields.', 'nexus-lead-suite' ),
			array(
				'status' => 422,
				'errors' => $errors,
			)
		);
	}
}
