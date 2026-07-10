import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname( fileURLToPath( import.meta.url ) );

export default defineConfig( {
	plugins: [ react() ],
	root: __dirname,
	base: './',
	build: {
		outDir: path.join( __dirname, '../assets/admin' ),
		emptyOutDir: false,
		cssCodeSplit: false,
		manifest: '.vite/manifest.json',
		rollupOptions: {
			input: path.join( __dirname, 'src/main.jsx' ),
			output: {
				/*
				 * IIFE, not ES: wp_enqueue_script() emits a classic <script>, whose top-level
				 * const/let land in the global lexical scope. An ES bundle therefore leaks every
				 * top-level name, and a minified one colliding with a global from an earlier
				 * script (e.g. wp-i18n's `var wp`) is a hard SyntaxError that blanks the app.
				 * inlineDynamicImports keeps this a single chunk, so React stays a single tree.
				 */
				format: 'iife',
				entryFileNames: 'js/main.js',
				assetFileNames: 'css/main.css',
				inlineDynamicImports: true,
			},
		},
	},
	server: {
		port: 5173,
		strictPort: true,
	},
} );
