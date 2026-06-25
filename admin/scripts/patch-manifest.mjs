import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join( path.dirname( fileURLToPath( import.meta.url ) ), '..' );
const manifestPath = path.join( root, '../assets/admin/.vite/manifest.json' );

const manifest = JSON.parse( readFileSync( manifestPath, 'utf8' ) );
const entry = manifest['src/main.jsx'];

if ( entry && typeof entry === 'object' ) {
	const css = manifest['style.css']?.file || 'css/main.css';
	if ( ! Array.isArray( entry.css ) || entry.css.length === 0 ) {
		entry.css = [ css ];
	}
	writeFileSync( manifestPath, `${ JSON.stringify( manifest, null, 2 ) }\n` );
}
