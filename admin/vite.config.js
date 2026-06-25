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
				// Match Downloads release bundle (ES — single React tree, form icons render correctly).
				format: 'es',
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
