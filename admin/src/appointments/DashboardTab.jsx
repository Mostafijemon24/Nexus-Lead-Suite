import React, { useState } from 'react';
import { CalendarCheck, Clock, Stethoscope, Users, Wallet } from 'lucide-react';
import { money } from './api.js';
import { AppointmentDetail } from './AppointmentsTab.jsx';
import { Badge, EmptyState, ErrorState, Skeleton, Table, useList } from './ui.jsx';

export function DashboardTab( { currencySymbol } ) {
	const { loading, error, data, reload } = useList( 'admin/dashboard', {} );
	const [ openId, setOpenId ] = useState( null );
	if ( loading && ! data ) {
		return <Skeleton rows={ 8 } />;
	}
	if ( error ) {
		return <ErrorState message={ error } onRetry={ reload } />;
	}
	const s = data.stats;
	const cards = [
		[ "Today's appointments", s.today, <Clock size={ 18 } key="c" /> ],
		[ 'Pending', s.pending, <CalendarCheck size={ 18 } key="p" /> ],
		[ 'Doctors', s.doctors, <Stethoscope size={ 18 } key="d" /> ],
		[ 'Patients', s.patients, <Users size={ 18 } key="u" /> ],
		[ 'Revenue this month', money( s.earningsMonth, currencySymbol ), <Wallet size={ 18 } key="w" /> ],
		[ 'Treated', s.treated, <CalendarCheck size={ 18 } key="t" /> ],
	];
	const cols = [
		{ key: 'code', label: 'Code', render: ( r ) => <button type="button" className="font-mono text-xs font-bold text-blue-700" onClick={ () => setOpenId( r.id ) }>{ r.code }</button> },
		{ key: 'patientName', label: 'Patient' },
		{ key: 'doctorName', label: 'Doctor' },
		{ key: 'date', label: 'When', render: ( r ) => `${ r.date } ${ r.startTime }` },
		{ key: 'status', label: 'Status', render: ( r ) => <Badge value={ r.status } /> },
	];
	return (
		<div className="space-y-6">
			<div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
				{ cards.map( ( [ label, value, icon ] ) => (
					<div key={ label } className="rounded-xl border border-slate-200 bg-white p-4">
						<div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700">{ icon }</div>
						<div className="text-2xl font-extrabold text-slate-900">{ value }</div>
						<div className="text-xs font-medium uppercase tracking-wide text-slate-500">{ label }</div>
					</div>
				) ) }
			</div>
			<section>
				<h3 className="mb-2 text-sm font-bold text-slate-800">Today</h3>
				<Table columns={ cols } rows={ data.today } empty={ <EmptyState title="No appointments today" /> } />
			</section>
			<section>
				<h3 className="mb-2 text-sm font-bold text-slate-800">Recently booked</h3>
				<Table columns={ cols } rows={ data.recent } empty={ <EmptyState title="Nothing booked yet" text="Share the booking page with your patients." /> } />
			</section>
			<AppointmentDetail id={ openId } onClose={ () => setOpenId( null ) } onChanged={ reload } currencySymbol={ currencySymbol } />
		</div>
	);
}
