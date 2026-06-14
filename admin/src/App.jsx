import React, { useEffect, useState } from 'react';
import { AdminErrorBoundary } from './components/AdminErrorBoundary.jsx';
import { AdminSidebar } from './components/AdminSidebar.jsx';
import { ActivitiesPage } from './pages/ActivitiesPage.jsx';
import { MenuItemsPage } from './pages/MenuItemsPage.jsx';
import { PopupsPage } from './pages/PopupsPage.jsx';
import { EmailsPage } from './pages/EmailsPage.jsx';
import { FormBuilderPage } from './pages/FormBuilderPage.jsx';
import { SettingsPage } from './pages/SettingsPage.jsx';

const ROUTES = {
	activities: ActivitiesPage,
	'menu-items': MenuItemsPage,
	popups: PopupsPage,
	emails: EmailsPage,
	'form-builder': FormBuilderPage,
	settings: SettingsPage,
};

export function App() {
	const [ route, setRoute ] = useState(
		window?.nexusLsAdmin?.initialRoute || 'activities'
	);

	useEffect( () => {
		function syncFromUrl() {
			const pages = window?.nexusLsAdmin?.adminPages;
			if ( ! pages ) {
				return;
			}
			const href = window.location.href;
			for ( const id in pages ) {
				if ( pages[ id ] === href ) {
					setRoute( id );
					break;
				}
			}
		}

		window.addEventListener( 'popstate', syncFromUrl );
		return () => window.removeEventListener( 'popstate', syncFromUrl );
	}, [] );

	const Page = ROUTES[ route ] || null;

	return (
		<AdminErrorBoundary>
		<div className="nexus-ls-admin-app flex min-h-screen">
			<AdminSidebar activeId={ route } onNavigate={ setRoute } />
			<main className="min-h-screen flex-1">
				{ Page ? (
					<Page />
				) : (
					<div className="min-h-screen bg-[#f6f7fb] px-8 py-6 text-slate-800">
						<h1 className="text-lg font-semibold">Coming soon</h1>
						<p className="mt-2 text-sm text-slate-600">
							This section will be implemented next: <span className="font-mono">{ route }</span>.
						</p>
					</div>
				) }
			</main>
		</div>
		</AdminErrorBoundary>
	);
}
