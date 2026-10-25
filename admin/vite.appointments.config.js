import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname( fileURLToPath( import.meta.url ) );

/*
 * Separate bundle for the Appointments admin page. The shipped assets/admin/js/main.js
 * was built from a newer source tree than admin/src (distribution snapshot), so the
 * appointment module ships as its own entry and never overwrites main.js / main.css.
 *   cd admin && npx vite build --config vite.appointments.config.js
 */
export default defineConfig( {
	plugins: [ react() ],
	root: __dirname,
	base: './',
	css: { postcss: path.join( __dirname, 'postcss.config.js' ) },
	build: {
		outDir: path.join( __dirname, '../assets/admin' ),
		emptyOutDir: false,
		cssCodeSplit: false,
		manifest: false,
		rollupOptions: {
			input: path.join( __dirname, 'src/appointments-main.jsx' ),
			output: {
				format: 'iife',
				entryFileNames: 'js/appointments.js',
				assetFileNames: 'css/appointments.css',
				inlineDynamicImports: true,
			},
		},
	},
} );
