/** @type {import('tailwindcss').Config} */

/*
 * Design tokens ported from the Nexus Hub console
 * (Nexus-Web/frontend/tailwind.config.js) so plugin admin pages share
 * the same visual language: ink/muted text scale, hairline borders,
 * per-module accents (pop = popups, set = settings, …), card radii
 * and the soft two-layer card shadow.
 */
export default {
	content: [ './src/**/*.{js,jsx}' ],
	theme: {
		extend: {
			colors: {
				ink: { DEFAULT: '#101322', 2: '#3b4258' },
				muted: '#6b7390',
				faint: '#9aa1bc',
				line: { DEFAULT: '#e7eaf3', soft: '#eef1f8' },
				page: '#f3f5fa',
				// module accents (soft = tinted background)
				act: { DEFAULT: '#f59e0b', soft: '#fef3e2' },
				menu: { DEFAULT: '#06b6d4', soft: '#e6f9fd' },
				pop: { DEFAULT: '#8b5cf6', soft: '#f1ebfe' },
				mail: { DEFAULT: '#f43f5e', soft: '#feebee' },
				form: { DEFAULT: '#10b981', soft: '#e6f9f2' },
				bot: { DEFAULT: '#6366f1', soft: '#eceefe' },
				set: { DEFAULT: '#64748b', soft: '#eef1f5' },
				navy: { DEFAULT: '#10142a', deep: '#0c0f22' },
			},
			fontFamily: {
				display: [ 'Sora', 'Inter', 'sans-serif' ],
				sans: [ 'Inter', 'system-ui', 'sans-serif' ],
				mono: [ '"JetBrains Mono"', 'ui-monospace', 'monospace' ],
			},
			borderRadius: { card: '16px', tile: '11px' },
			boxShadow: {
				card: '0 1px 2px rgba(16,19,34,.05), 0 10px 30px -14px rgba(16,19,34,.14)',
				lift: '0 4px 8px rgba(16,19,34,.05), 0 20px 44px -16px rgba(16,19,34,.2)',
			},
		},
	},
	plugins: [],
};
