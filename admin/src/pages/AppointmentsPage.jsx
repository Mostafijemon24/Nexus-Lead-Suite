import React, { useEffect, useState } from 'react';
import { CalendarCheck } from 'lucide-react';
import { PageShell } from '../components/PageShell.jsx';
import { Alert } from '../appointments/ui.jsx';
import { api } from '../appointments/api.js';
import { DashboardTab } from '../appointments/DashboardTab.jsx';
import { AppointmentsTab } from '../appointments/AppointmentsTab.jsx';
import { DoctorsTab } from '../appointments/DoctorsTab.jsx';
import { CatalogTab } from '../appointments/CatalogTab.jsx';
import { PatientsTab } from '../appointments/PatientsTab.jsx';
import { SettingsTab } from '../appointments/SettingsTab.jsx';

const TABS = [
	[ 'dashboard', 'Dashboard' ],
	[ 'appointments', 'Appointments' ],
	[ 'doctors', 'Doctors' ],
	[ 'departments', 'Departments' ],
	[ 'locations', 'Locations' ],
	[ 'medicines', 'Medicines' ],
	[ 'patients', 'Patients' ],
	[ 'settings', 'Settings' ],
];

function tabFromHash() {
	const h = ( window.location.hash || '' ).replace( '#', '' );
	return TABS.some( ( [ k ] ) => k === h ) ? h : 'dashboard';
}

export function AppointmentsPage() {
	const [ tab, setTab ] = useState( tabFromHash );
	const [ notice, setNotice ] = useState( null );
	const [ medicineSub, setMedicineSub ] = useState( 'medicines' );
	const [ currencySymbol, setCurrencySymbol ] = useState( '$' );

	useEffect( () => {
		const onHash = () => setTab( tabFromHash() );
		window.addEventListener( 'hashchange', onHash );
		api( 'admin/settings' ).then( ( s ) => setCurrencySymbol( s.currencySymbol || '$' ) ).catch( () => {} );
		return () => window.removeEventListener( 'hashchange', onHash );
	}, [] );

	useEffect( () => {
		if ( ! notice ) {
			return undefined;
		}
		const id = setTimeout( () => setNotice( null ), 4000 );
		return () => clearTimeout( id );
	}, [ notice ] );

	const go = ( k ) => {
		setTab( k );
		if ( window.location.hash !== `#${ k }` ) {
			history.replaceState( null, '', `#${ k }` );
		}
	};
	const notify = ( kind, text ) => setNotice( [ kind, text ] );

	return (
		<PageShell title="Appointments" subtitle="Departments, doctors, schedules, bookings, patients and prescriptions" icon={ <CalendarCheck size={ 20 } /> }>
			<div className="-mt-2 mb-5 flex gap-1 overflow-x-auto border-b border-slate-200" role="tablist" aria-label="Appointment sections">
				{ TABS.map( ( [ k, label ] ) => (
					<button key={ k } type="button" role="tab" aria-selected={ tab === k } onClick={ () => go( k ) } className={ `-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-sm font-semibold ${ tab === k ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800' }` }>{ label }</button>
				) ) }
			</div>
			{ notice ? <Alert kind={ notice[ 0 ] }>{ notice[ 1 ] }</Alert> : null }
			{ tab === 'dashboard' ? <DashboardTab currencySymbol={ currencySymbol } /> : null }
			{ tab === 'appointments' ? <AppointmentsTab onNotify={ notify } currencySymbol={ currencySymbol } /> : null }
			{ tab === 'doctors' ? <DoctorsTab onNotify={ notify } currencySymbol={ currencySymbol } /> : null }
			{ tab === 'departments' ? <CatalogTab kind="departments" onNotify={ notify } /> : null }
			{ tab === 'locations' ? <CatalogTab kind="locations" onNotify={ notify } /> : null }
			{ tab === 'medicines' ? (
				<div>
					<div className="mb-3 inline-flex gap-1 rounded-lg bg-slate-100 p-1">
						{ [ [ 'medicines', 'Medicines' ], [ 'medicine-types', 'Medicine types' ] ].map( ( [ k, l ] ) => <button key={ k } type="button" onClick={ () => setMedicineSub( k ) } className={ `rounded-md px-3 py-1 text-xs font-semibold ${ medicineSub === k ? 'bg-white text-slate-900 shadow' : 'text-slate-500' }` }>{ l }</button> ) }
					</div>
					<CatalogTab key={ medicineSub } kind={ medicineSub } onNotify={ notify } />
				</div>
			) : null }
			{ tab === 'patients' ? <PatientsTab onNotify={ notify } /> : null }
			{ tab === 'settings' ? <SettingsTab onSaved={ ( s ) => setCurrencySymbol( s.currencySymbol || '$' ) } /> : null }
		</PageShell>
	);
}
