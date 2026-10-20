/** @type {import('tailwindcss').Config} */

/*
 * Tailwind is used for layout utilities only. Preflight (the global reset) is
 * disabled because it leaked into the whole wp-admin document; a scoped
 * equivalent lives in src/styles/base.css. Colour aliases map to the design
 * tokens in src/styles/tokens.css so utilities and components share one palette.
 */
export default {
	content: [ './src/**/*.{js,jsx}' ],
	corePlugins: {
		preflight: false,
	},
	theme: {
		extend: {
			colors: {
				ink: { DEFAULT: '#0f172a', 2: '#334155' },
				muted: '#64748b',
				faint: '#64748b',
				line: { DEFAULT: '#e2e8f0', soft: '#f1f5f9' },
				page: '#f3f4f6',
				// module accents (soft = tinted background)
				act: { DEFAULT: '#b45309', soft: '#fffbeb' },
				menu: { DEFAULT: '#0e7490', soft: '#ecfeff' },
				pop: { DEFAULT: '#4f46e5', soft: '#eef2ff' },
				mail: { DEFAULT: '#e11d48', soft: '#fff1f2' },
				form: { DEFAULT: '#059669', soft: '#ecfdf5' },
				bot: { DEFAULT: '#4f46e5', soft: '#eef2ff' },
				set: { DEFAULT: '#64748b', soft: '#f1f5f9' },
				navy: { DEFAULT: '#0f172a', deep: '#0b1120' },
			},
			fontFamily: {
				display: [ 'inherit' ],
				sans: [ 'inherit' ],
				mono: [ 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace' ],
			},
			borderRadius: { card: '10px', tile: '8px' },
			boxShadow: {
				card: '0 1px 2px rgba(15,23,42,.05)',
				lift: '0 2px 6px rgba(15,23,42,.08), 0 1px 2px rgba(15,23,42,.04)',
			},
		},
	},
	plugins: [],
};
