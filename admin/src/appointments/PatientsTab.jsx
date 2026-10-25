import React, { useState } from 'react';
import { api } from './api.js';
import { Badge, Btn, EmptyState, ErrorState, Pagination, Skeleton, Table, Toolbar, useDebounce, useList } from './ui.jsx';

export function PatientsTab( { onNotify } ) {
	const [ search, setSearch ] = useState( '' );
	const [ status, setStatus ] = useState( '' );
	const [ page, setPage ] = useState( 1 );
	const q = useDebounce( search );
	const { loading, error, data, reload } = useList( 'admin/patients', { search: q, status, page, perPage: 20 } );
	const [ busyId, setBusyId ] = useState( 0 );

	async function toggle( p ) {
		setBusyId( p.id );
		try {
			await api( `admin/patients/${ p.id }`, { method: 'PUT', body: { status: p.status === 'active' ? 'inactive' : 'active' } } );
			onNotify?.( 'success', `Patient ${ p.status === 'active' ? 'deactivated' : 'activated' }.` );
			reload();
		} catch ( e ) {
			onNotify?.( 'error', e.message );
		} finally {
			setBusyId( 0 );
		}
	}

	const columns = [
		{ key: 'name', label: 'Patient', render: ( r ) => <div><div className="font-semibold text-slate-800">{ r.name }</div><div className="text-xs text-slate-500">{ r.email }</div></div> },
		{ key: 'phone', label: 'Phone', render: ( r ) => r.phone || '—' },
		{ key: 'emailVerified', label: 'E-mail', render: ( r ) => <Badge value={ r.emailVerified ? 'active' : 'pending' } /> },
		{ key: 'appointmentCount', label: 'Appointments' },
		{ key: 'createdAt', label: 'Registered', render: ( r ) => <span className="text-slate-500">{ ( r.createdAt || '' ).slice( 0, 10 ) }</span> },
		{ key: 'status', label: 'Status', render: ( r ) => <Badge value={ r.status } /> },
		{ key: 'actions', label: '', className: 'md:text-right', render: ( r ) => <Btn size="sm" variant={ r.status === 'active' ? 'danger' : 'secondary' } loading={ busyId === r.id } onClick={ () => toggle( r ) }>{ r.status === 'active' ? 'Deactivate' : 'Activate' }</Btn> },
	];

	return (
		<div>
			<Toolbar search={ search } onSearch={ ( v ) => { setSearch( v ); setPage( 1 ); } } status={ status } onStatus={ ( v ) => { setStatus( v ); setPage( 1 ); } } />
			{ loading && ! data ? <Skeleton rows={ 6 } /> : null }
			{ error ? <ErrorState message={ error } onRetry={ reload } /> : null }
			{ data ? (
				<>
					<Table columns={ columns } rows={ data.items } empty={ <EmptyState title="No patients yet" text="Patients register themselves on the site and verify their e-mail." /> } />
					<Pagination page={ data.page } perPage={ data.perPage } total={ data.total } onChange={ setPage } />
				</>
			) : null }
		</div>
	);
}
