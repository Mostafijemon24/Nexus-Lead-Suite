import React, { useState } from 'react';
import { Printer } from 'lucide-react';
import { api, money } from './api.js';
import { Alert, Badge, Btn, Drawer, EmptyState, ErrorState, Field, Pagination, Skeleton, Table, inputCls, useDebounce, useList } from './ui.jsx';

const STATUSES = [ [ '', 'All' ], [ 'pending', 'Pending' ], [ 'confirmed', 'Confirmed' ], [ 'treated', 'Treated' ], [ 'cancelled', 'Cancelled' ] ];
/* The original's Appointment menu: All Appointment · New Appointments · Pending Appointments · Prescription · Payment History. */
const VIEWS = [ [ 'all', 'All Appointment', {} ], [ 'new', 'New Appointments', { view: 'new' } ], [ 'pending', 'Pending Appointments', { view: 'pending' } ], [ 'prescription', 'Prescription', { view: 'treated' } ], [ 'payments', 'Payment History', { paymentStatus: 'paid' } ] ];

export function AppointmentsTab( { onNotify, currencySymbol } ) {
	const [ search, setSearch ] = useState( '' );
	const [ status, setStatus ] = useState( '' );
	const [ doctor, setDoctor ] = useState( '' );
	const [ from, setFrom ] = useState( '' );
	const [ to, setTo ] = useState( '' );
	const [ page, setPage ] = useState( 1 );
	const [ view, setView ] = useState( 'all' );
	const q = useDebounce( search );
	const viewParams = ( VIEWS.find( ( v ) => v[ 0 ] === view ) || VIEWS[ 0 ] )[ 2 ];
	const { loading, error, data, reload } = useList( 'admin/appointments', { search: q, status, doctorId: doctor, dateFrom: from, dateTo: to, page, perPage: 20, ...viewParams } );
	const doctors = useList( 'admin/doctors', { perPage: 200 } );
	const [ openId, setOpenId ] = useState( null );

	const columns = [
		{ key: 'code', label: 'Code', render: ( r ) => <button type="button" className="font-mono text-xs font-bold text-blue-700 underline-offset-2 hover:underline" onClick={ () => setOpenId( r.id ) }>{ r.code }</button> },
		{ key: 'patientName', label: 'Patient', render: ( r ) => <div><div className="font-semibold text-slate-800">{ r.patientName }</div><div className="text-xs text-slate-500">{ r.patientPhone || r.patientEmail }</div></div> },
		{ key: 'doctorName', label: 'Doctor', render: ( r ) => <div>{ r.doctorName }<div className="text-xs text-slate-500">{ r.departmentName }</div></div> },
		{ key: 'date', label: 'When', render: ( r ) => <span>{ r.date } <span className="text-slate-500">{ r.startTime }–{ r.endTime }</span></span> },
		{ key: 'fee', label: 'Fee', render: ( r ) => <span>{ money( r.fee, currencySymbol ) } <Badge value={ r.paymentStatus } /></span> },
		{ key: 'status', label: 'Status', render: ( r ) => <Badge value={ r.status } /> },
		{ key: 'actions', label: '', className: 'md:text-right', render: ( r ) => (
			<span className="inline-flex gap-1">
				<Btn size="sm" onClick={ () => setOpenId( r.id ) }>View</Btn>
				{ r.printUrl ? <a className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50" href={ r.printUrl } target="_blank" rel="noopener noreferrer"><Printer size={ 13 } /> Print</a> : null }
			</span>
		) },
	];

	return (
		<div>
			<div className="mb-3 flex gap-1 overflow-x-auto border-b border-slate-200" role="tablist" aria-label="Appointment views">
				{ VIEWS.map( ( [ k, label ] ) => <button key={ k } type="button" role="tab" aria-selected={ view === k } onClick={ () => { setView( k ); setPage( 1 ); } } className={ `-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-xs font-semibold ${ view === k ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800' }` }>{ label }</button> ) }
			</div>
			<div className="mb-3 flex flex-wrap items-end gap-2">
				<input type="search" value={ search } onChange={ ( e ) => { setSearch( e.target.value ); setPage( 1 ); } } placeholder="Code, patient, doctor…" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm sm:w-56" aria-label="Search appointments" />
				<select value={ doctor } onChange={ ( e ) => { setDoctor( e.target.value ); setPage( 1 ); } } className="rounded-lg border border-slate-200 px-3 py-2 text-sm" aria-label="Filter by doctor">
					<option value="">All doctors</option>
					{ ( doctors.data?.items || [] ).map( ( d ) => <option key={ d.id } value={ d.id }>{ d.name }</option> ) }
				</select>
				<input type="date" value={ from } onChange={ ( e ) => { setFrom( e.target.value ); setPage( 1 ); } } className="rounded-lg border border-slate-200 px-3 py-2 text-sm" aria-label="From date" />
				<input type="date" value={ to } onChange={ ( e ) => { setTo( e.target.value ); setPage( 1 ); } } className="rounded-lg border border-slate-200 px-3 py-2 text-sm" aria-label="To date" />
				<div className="flex gap-1 overflow-x-auto rounded-lg bg-slate-100 p-1">
					{ STATUSES.map( ( [ v, l ] ) => <button key={ v } type="button" onClick={ () => { setStatus( v ); setPage( 1 ); } } className={ `whitespace-nowrap rounded-md px-3 py-1 text-xs font-semibold ${ status === v ? 'bg-white text-slate-900 shadow' : 'text-slate-500' }` }>{ l }</button> ) }
				</div>
			</div>
			{ loading && ! data ? <Skeleton rows={ 6 } /> : null }
			{ error ? <ErrorState message={ error } onRetry={ reload } /> : null }
			{ data ? (
				<>
					<Table columns={ columns } rows={ data.items } empty={ <EmptyState title="No appointments" text={ search || status || doctor || from || to ? 'Try widening the filters.' : 'Appointments booked on the site will appear here.' } /> } />
					<Pagination page={ data.page } perPage={ data.perPage } total={ data.total } onChange={ setPage } />
				</>
			) : null }
			<AppointmentDetail id={ openId } onClose={ () => setOpenId( null ) } onChanged={ () => { reload(); onNotify?.( 'success', 'Appointment updated.' ); } } currencySymbol={ currencySymbol } />
		</div>
	);
}

export function AppointmentDetail( { id, onClose, onChanged, currencySymbol } ) {
	const { loading, error, data, reload } = useList( id ? `admin/appointments/${ id }` : 'admin/appointments', id ? {} : { perPage: 1 }, [ id ] );
	const [ saving, setSaving ] = useState( false );
	const [ message, setMessage ] = useState( '' );
	const [ form, setForm ] = useState( null );
	if ( ! id ) {
		return null;
	}
	const a = data && data.id === id ? data : null;
	const f = form && form.id === id ? form : a ? { id, status: a.status, paymentStatus: a.paymentStatus, paymentMethod: a.paymentMethod } : null;

	async function save() {
		setSaving( true );
		setMessage( '' );
		try {
			await api( `admin/appointments/${ id }`, { method: 'PUT', body: { status: f.status, paymentStatus: f.paymentStatus, paymentMethod: f.paymentMethod } } );
			setForm( null );
			reload();
			onChanged?.();
		} catch ( e ) {
			setMessage( e.message );
		} finally {
			setSaving( false );
		}
	}

	return (
		<Drawer open title={ a ? `Appointment ${ a.code }` : 'Appointment' } onClose={ onClose } footer={ a && a.status !== 'cancelled' && a.status !== 'treated' ? <><Btn onClick={ onClose }>Close</Btn><Btn variant="primary" loading={ saving } onClick={ save }>Save</Btn></> : <Btn onClick={ onClose }>Close</Btn> }>
			{ loading && ! a ? <Skeleton rows={ 8 } /> : null }
			{ error ? <ErrorState message={ error } onRetry={ reload } /> : null }
			{ a ? (
				<div className="space-y-5 text-sm">
					{ message ? <Alert>{ message }</Alert> : null }
					<dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2">
						<dt className="text-slate-500">Patient</dt><dd className="font-semibold">{ a.patientName } <span className="font-normal text-slate-500">· { a.patientEmail } { a.patientPhone }</span></dd>
						<dt className="text-slate-500">Doctor</dt><dd>{ a.doctorName } <span className="text-slate-500">· { a.departmentName }</span></dd>
						<dt className="text-slate-500">When</dt><dd>{ a.date } { a.startTime }–{ a.endTime }</dd>
						<dt className="text-slate-500">Fee</dt><dd>{ money( a.fee, currencySymbol ) }</dd>
						<dt className="text-slate-500">Reason</dt><dd className="whitespace-pre-wrap">{ a.reason || '—' }</dd>
						<dt className="text-slate-500">Booked</dt><dd>{ a.createdAt }</dd>
					</dl>
					{ a.status === 'treated' || a.status === 'cancelled' ? (
						<div className="flex flex-wrap items-center gap-2"><Badge value={ a.status } /><Badge value={ a.paymentStatus } />{ a.status === 'treated' ? <PaymentOnly f={ f } setForm={ setForm } save={ save } saving={ saving } /> : null }</div>
					) : (
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
							<Field label="Status"><select className={ inputCls( false ) } value={ f.status } onChange={ ( e ) => setForm( { ...f, status: e.target.value } ) }><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="cancelled">Cancelled</option></select></Field>
							<Field label="Payment"><select className={ inputCls( false ) } value={ f.paymentStatus } onChange={ ( e ) => setForm( { ...f, paymentStatus: e.target.value } ) }><option value="unpaid">Unpaid</option><option value="paid">Paid</option><option value="refunded">Refunded</option></select></Field>
							<Field label="Method"><select className={ inputCls( false ) } value={ f.paymentMethod } onChange={ ( e ) => setForm( { ...f, paymentMethod: e.target.value } ) }><option value="pay_at_clinic">Pay at clinic</option><option value="bank_transfer">Bank transfer</option><option value="none">None</option></select></Field>
						</div>
					) }
					{ a.treatment ? (
						<section className="rounded-xl border border-slate-200 p-4">
							<div className="mb-2 flex items-center justify-between"><h4 className="font-bold">Treatment &amp; prescription</h4>{ a.printUrl ? <a className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700" href={ a.printUrl } target="_blank" rel="noopener noreferrer"><Printer size={ 13 } /> Print</a> : null }</div>
							{ a.treatment.notes ? <p className="whitespace-pre-wrap">{ a.treatment.notes }</p> : null }
							{ a.treatment.items.length ? (
								<table className="mt-2 w-full text-left text-xs"><thead className="text-slate-500"><tr><th className="py-1">Medicine</th><th>Dosage</th><th>Duration</th><th>Instruction</th></tr></thead><tbody>{ a.treatment.items.map( ( it ) => <tr key={ it.id } className="border-t border-slate-100"><td className="py-1 font-semibold">{ it.medicineName }</td><td>{ it.dosage }</td><td>{ it.duration }</td><td>{ it.instruction }</td></tr> ) }</tbody></table>
							) : null }
							{ a.treatment.advice ? <p className="mt-2"><strong>Advice:</strong> { a.treatment.advice }</p> : null }
							{ a.treatment.followUpDate ? <p><strong>Follow-up:</strong> { a.treatment.followUpDate }</p> : null }
						</section>
					) : null }
				</div>
			) : null }
		</Drawer>
	);
}

function PaymentOnly( { f, setForm, save, saving } ) {
	return (
		<span className="ml-auto inline-flex items-center gap-2">
			<select className={ inputCls( false ) } value={ f.paymentStatus } onChange={ ( e ) => setForm( { ...f, paymentStatus: e.target.value } ) } aria-label="Payment status"><option value="unpaid">Unpaid</option><option value="paid">Paid</option><option value="refunded">Refunded</option></select>
			<Btn size="sm" variant="primary" loading={ saving } onClick={ save }>Update payment</Btn>
		</span>
	);
}
