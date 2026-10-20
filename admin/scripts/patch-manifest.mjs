/**
 * Post-build step: normalise the Vite manifest and publish it where the PHP loader
 * reads it (assets/admin/vite-manifest.json). The IIFE build emits CSS as a separate
 * "style.css" chunk, so the entry's `css` list is filled in here.
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join( path.dirname( fileURLToPath( import.meta.url ) ), '..' );
const assetsDir = path.join( root, '../assets/admin' );
const viteManifest = path.join( assetsDir, '.vite/manifest.json' );
const publicManifest = path.join( assetsDir, 'vite-manifest.json' );

if ( ! existsSync( viteManifest ) ) {
	console.error( 'patch-manifest: missing ' + viteManifest );
	process.exit( 1 );
}

const manifest = JSON.parse( readFileSync( viteManifest, 'utf8' ) );
const entry = manifest['src/main.jsx'];

if ( entry && typeof entry === 'object' ) {
	const css = manifest['style.css']?.file || 'css/main.css';
	if ( ! Array.isArray( entry.css ) || entry.css.length === 0 ) {
		entry.css = [ css ];
	}
}

const json = `${ JSON.stringify( manifest, null, 2 ) }\n`;
writeFileSync( viteManifest, json );
writeFileSync( publicManifest, json );
console.log( 'patch-manifest: wrote ' + publicManifest );
