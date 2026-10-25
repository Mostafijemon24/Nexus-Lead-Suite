import React from 'react';
import { createRoot } from 'react-dom/client';
import { AdminErrorBoundary } from './components/AdminErrorBoundary.jsx';
import { AdminSidebar } from './components/AdminSidebar.jsx';
import { AppointmentsPage } from './pages/AppointmentsPage.jsx';
import './index.css';

/*
 * Standalone mount for the Appointments admin page. Other Nexus pages are rendered by
 * assets/admin/js/main.js; navigating to them from this sidebar is a full page load.
 */
const rootEl = document.getElementById( 'nexulesuite_admin-root' );

if ( rootEl ) {
	createRoot( rootEl ).render(
		<React.StrictMode>
			<AdminErrorBoundary>
				<div className="nexulesuite_admin-app flex min-h-screen">
					<AdminSidebar
						activeId="appointments"
						defaultCollapsed={ typeof window !== 'undefined' && window.innerWidth < 768 }
						onNavigate={ ( id ) => {
							const href = window?.nexulesuite_Admin?.adminPages?.[ id ];
							if ( href && id !== 'appointments' ) {
								window.location.href = href;
							}
						} }
					/>
					<main className="min-h-screen flex-1">
						<AppointmentsPage />
					</main>
				</div>
			</AdminErrorBoundary>
		</React.StrictMode>
	);
}
