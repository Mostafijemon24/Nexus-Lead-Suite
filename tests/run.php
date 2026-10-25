<?php
declare(strict_types=1);
require_once __DIR__ . '/bootstrap.php';
$files = $argv[1] ?? '';
$list  = '' !== $files ? array( $files ) : glob( __DIR__ . '/test-*.php' );
foreach ( $list as $file ) {
	echo "\n" . basename( $file ) . "\n";
	require $file;
}
exit( T::summary() );
