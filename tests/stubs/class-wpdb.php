<?php
/**
 * SQLite-backed stand-in for $wpdb, enough for the appointment module queries.
 */

declare(strict_types=1);

class wpdb {
	public $prefix = 'wp_';
	public $insert_id = 0;
	public $last_error = '';
	public $last_query = '';
	public $num_rows = 0;
	/** @var PDO */
	public $pdo;

	public function __construct( string $dsn = 'sqlite::memory:' ) {
		$this->pdo = new PDO( $dsn );
		$this->pdo->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );
	}

	public function get_charset_collate(): string { return ''; }
	public function esc_like( $s ): string { return addcslashes( (string) $s, '_%\\' ); }
	public function _real_escape( $s ) { return substr( $this->pdo->quote( (string) $s ), 1, -1 ); }

	public function prepare( $query, ...$args ) {
		if ( 1 === count( $args ) && is_array( $args[0] ) ) { $args = $args[0]; }
		$i = 0;
		$query = str_replace( "'%s'", '%s', (string) $query );
		return preg_replace_callback( '/%(%|d|s|f|F|i)/', function ( $m ) use ( &$i, $args ) {
			if ( '%' === $m[1] ) { return '%'; }
			$v = $args[ $i ] ?? null; $i++;
			switch ( $m[1] ) {
				case 'd': return (string) (int) $v;
				case 'f': case 'F': return (string) (float) $v;
				case 'i': return '`' . str_replace( '`', '', (string) $v ) . '`';
				default: return $this->pdo->quote( (string) $v );
			}
		}, $query );
	}

	public function query( $sql ) {
		$this->last_query = (string) $sql; $this->last_error = '';
		try { $n = $this->pdo->exec( (string) $sql ); $this->insert_id = (int) $this->pdo->lastInsertId(); return false === $n ? false : $n; }
		catch ( PDOException $e ) { $this->last_error = $e->getMessage(); return false; }
	}

	public function get_results( $sql, $output = OBJECT ) {
		$this->last_query = (string) $sql; $this->last_error = '';
		try { $rows = $this->pdo->query( (string) $sql )->fetchAll( PDO::FETCH_ASSOC ); }
		catch ( PDOException $e ) { $this->last_error = $e->getMessage(); return array(); }
		$this->num_rows = count( $rows );
		if ( ARRAY_A === $output ) { return $rows; }
		if ( ARRAY_N === $output ) { return array_map( 'array_values', $rows ); }
		return array_map( function ( $r ) { return (object) $r; }, $rows );
	}

	public function get_row( $sql, $output = OBJECT, $y = 0 ) { $r = $this->get_results( $sql, $output ); return $r[ $y ] ?? null; }
	public function get_var( $sql, $x = 0, $y = 0 ) { $r = $this->get_results( $sql, ARRAY_N ); return isset( $r[ $y ][ $x ] ) ? $r[ $y ][ $x ] : null; }
	public function get_col( $sql, $x = 0 ) { $r = $this->get_results( $sql, ARRAY_N ); return array_map( function ( $row ) use ( $x ) { return $row[ $x ]; }, $r ); }

	public function insert( $table, $data, $format = null ) {
		$cols = array_keys( $data );
		$sql  = "INSERT INTO {$table} (" . implode( ',', $cols ) . ') VALUES (' . implode( ',', array_map( array( $this, 'q' ), array_values( $data ) ) ) . ')';
		$n    = $this->query( $sql );
		return false === $n ? false : 1;
	}
	public function update( $table, $data, $where, $format = null, $wf = null ) {
		$set = array(); foreach ( $data as $k => $v ) { $set[] = "{$k} = " . $this->q( $v ); }
		$w = array(); foreach ( $where as $k => $v ) { $w[] = "{$k} = " . $this->q( $v ); }
		return $this->query( "UPDATE {$table} SET " . implode( ', ', $set ) . ' WHERE ' . implode( ' AND ', $w ) );
	}
	public function delete( $table, $where, $wf = null ) {
		$w = array(); foreach ( $where as $k => $v ) { $w[] = "{$k} = " . $this->q( $v ); }
		return $this->query( "DELETE FROM {$table} WHERE " . implode( ' AND ', $w ) );
	}
	public function replace( $table, $data, $format = null ) { return $this->insert( $table, $data ); }
	private function q( $v ) { if ( null === $v ) { return 'NULL'; } if ( is_int( $v ) || is_float( $v ) ) { return (string) $v; } if ( is_bool( $v ) ) { return $v ? '1' : '0'; } return $this->pdo->quote( (string) $v ); }
}

/**
 * Converts a MySQL dbDelta CREATE TABLE into SQLite statements and runs them.
 */
function dbDelta( $queries, $execute = true ) {
	global $wpdb;
	$out = array();
	foreach ( (array) $queries as $sql ) {
		if ( ! preg_match( '/CREATE TABLE\s+(\S+)\s*\((.*)\)\s*[^)]*;?\s*$/is', $sql, $m ) ) { continue; }
		$table = $m[1]; $body = $m[2];
		$lines = array_map( 'trim', preg_split( '/,\s*\n/', trim( $body ) ) );
		$cols = array(); $indexes = array();
		foreach ( $lines as $line ) {
			$line = rtrim( $line, ',' );
			if ( '' === $line ) { continue; }
			if ( preg_match( '/^PRIMARY KEY/i', $line ) ) { continue; }
			if ( preg_match( '/^(UNIQUE\s+)?KEY\s+(\w+)\s*\(([^)]*)\)/i', $line, $k ) ) {
				$indexes[] = 'CREATE ' . ( $k[1] ? 'UNIQUE ' : '' ) . "INDEX IF NOT EXISTS {$table}_{$k[2]} ON {$table} ({$k[3]})";
				continue;
			}
			if ( preg_match( '/^(\w+)\s+bigint.*AUTO_INCREMENT/i', $line, $k ) ) { $cols[] = "{$k[1]} INTEGER PRIMARY KEY AUTOINCREMENT"; continue; }
			$line = preg_replace( '/\bunsigned\b/i', '', $line );
			$line = preg_replace( '/\b(bigint|int|smallint|tinyint|mediumint)\s*\(\d+\)/i', 'INTEGER', $line );
			$line = preg_replace( '/\b(varchar|char)\s*\(\d+\)/i', 'TEXT', $line );
			$line = preg_replace( '/\b(longtext|mediumtext|text|datetime|date|time)\b/i', 'TEXT', $line );
			$line = preg_replace( '/\bdecimal\s*\(\d+,\d+\)/i', 'REAL', $line );
			$cols[] = preg_replace( '/\s+/', ' ', trim( $line ) );
		}
		$create = "CREATE TABLE IF NOT EXISTS {$table} (" . implode( ', ', $cols ) . ')';
		$wpdb->query( $create );
		if ( '' !== $wpdb->last_error ) { throw new RuntimeException( 'dbDelta failed: ' . $wpdb->last_error . ' in ' . $create ); }
		foreach ( $indexes as $ix ) { $wpdb->query( $ix ); if ( '' !== $wpdb->last_error ) { throw new RuntimeException( 'index failed: ' . $wpdb->last_error . ' in ' . $ix ); } }
		$out[ $table ] = 'Created table ' . $table;
	}
	return $out;
}
