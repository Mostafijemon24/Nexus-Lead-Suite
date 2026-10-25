/** Tailwind config for the Appointments admin bundle (vite.appointments.config.js). */
export default {
	content: [
		'./src/appointments-main.jsx',
		'./src/appointments/**/*.{js,jsx}',
		'./src/pages/AppointmentsPage.jsx',
		'./src/components/AdminSidebar.jsx',
		'./src/components/PageShell.jsx',
		'./src/components/NexusModal.jsx',
		'./src/components/AdminErrorBoundary.jsx',
	],
	theme: {
		extend: {
			fontFamily: { sans: [ 'Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif' ], display: [ 'Sora', 'Inter', 'sans-serif' ] },
			colors: { navy: '#10142a', pop: '#8b5cf6', page: '#f3f5fa', line: '#e7eaf3', form: '#10b981', ink: '#101322' },
		},
	},
	plugins: [],
};
