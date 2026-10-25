import React, { useState } from 'react';
import { api } from './api.js';
import { Alert, Btn, ErrorState, Field, Skeleton, inputCls, useList } from './ui.jsx';

const PAGE_LABELS = { doctors: 'Doctors listing', doctor: 'Doctor profile', departments: 'Departments listing', department: 'Department detail', booking: 'Booking (quick appointment)', auth: 'Login / register', patient_panel: 'Patient panel', doctor_panel: 'Doctor panel' };

export function SettingsTab( { onSaved } ) {
	const { loading, error, data, reload } = useList( 'admin/settings', {} );
	const [ form, setForm ] = useState( null );
	const [ saving, setSaving ] = useState( false );
	const [ message, setMessage ] = useState( null );
	if ( loading && ! data ) {
		return <Skeleton rows={ 8 } />;
	}
	if ( error ) {
		return <ErrorState message={ error } onRetry={ reload } />;
	}
	const f = form || data;
	const set = ( k ) => ( e ) => setForm( { ...f, [ k ]: e.target.type === 'checkbox' ? e.target.checked : e.target.value } );
	async function save() {
		setSaving( true );
		setMessage( null );
		try {
			const res = await api( 'admin/settings', { method: 'POST', body: { slotMinutes: f.slotMinutes, bookingWindowDays: f.bookingWindowDays, leadTimeMinutes: f.leadTimeMinutes, cancelLeadMinutes: f.cancelLeadMinutes, currency: f.currency, currencySymbol: f.currencySymbol, requireEmailVerification: f.requireEmailVerification, perPage: f.perPage, pages: Object.fromEntries( Object.entries( f.pageDetails || {} ).map( ( [ k, v ] ) => [ k, v.id ] ) ) } } );
			setForm( null );
			setMessage( [ 'success', 'Settings saved.' ] );
			onSaved?.( res );
			reload();
		} catch ( e ) {
			setMessage( [ 'error', e.message ] );
		} finally {
			setSaving( false );
		}
	}
	return (
		<div className="max-w-3xl space-y-6">
			{ message ? <Alert kind={ message[ 0 ] }>{ message[ 1 ] }</Alert> : null }
			<section className="rounded-xl border border-slate-200 p-4">
				<h3 className="mb-3 text-sm font-bold">Booking rules</h3>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<Field label="Default slot length (minutes)" hint="Used for new doctors; each weekday can override it."><input type="number" min={ 5 } max={ 240 } className={ inputCls( false ) } value={ f.slotMinutes } onChange={ set( 'slotMinutes' ) } /></Field>
					<Field label="Booking window (days ahead)"><input type="number" min={ 1 } max={ 365 } className={ inputCls( false ) } value={ f.bookingWindowDays } onChange={ set( 'bookingWindowDays' ) } /></Field>
					<Field label="Minimum notice to book (minutes)"><input type="number" min={ 0 } className={ inputCls( false ) } value={ f.leadTimeMinutes } onChange={ set( 'leadTimeMinutes' ) } /></Field>
					<Field label="Patients may cancel until (minutes before)"><input type="number" min={ 0 } className={ inputCls( false ) } value={ f.cancelLeadMinutes } onChange={ set( 'cancelLeadMinutes' ) } /></Field>
					<Field label="Doctors per page (public listing)"><input type="number" min={ 1 } max={ 100 } className={ inputCls( false ) } value={ f.perPage } onChange={ set( 'perPage' ) } /></Field>
					<label className="flex items-center gap-2 self-end text-sm font-medium text-slate-700"><input type="checkbox" checked={ !! f.requireEmailVerification } onChange={ set( 'requireEmailVerification' ) } /> Require e-mail verification for new patients</label>
				</div>
			</section>
			<section className="rounded-xl border border-slate-200 p-4">
				<h3 className="mb-3 text-sm font-bold">Currency</h3>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<Field label="Currency code"><input className={ inputCls( false ) } maxLength={ 3 } value={ f.currency } onChange={ set( 'currency' ) } /></Field>
					<Field label="Symbol"><input className={ inputCls( false ) } maxLength={ 5 } value={ f.currencySymbol } onChange={ set( 'currencySymbol' ) } /></Field>
				</div>
			</section>
			<section className="rounded-xl border border-slate-200 p-4">
				<h3 className="mb-1 text-sm font-bold">Pages and shortcodes</h3>
				<p className="mb-3 text-xs text-slate-500">These pages were created on activation. Change the page ID if you moved a shortcode to another page.</p>
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
					{ Object.entries( f.pageDetails || {} ).map( ( [ key, p ] ) => (
						<Field key={ key } label={ PAGE_LABELS[ key ] || key } hint={ p.url ? <a href={ p.url } target="_blank" rel="noopener noreferrer" className="text-blue-700">{ p.url }</a> : 'No page assigned' }>
							<div className="flex gap-2">
								<input type="number" min={ 0 } className={ inputCls( false ) } value={ p.id } onChange={ ( e ) => setForm( { ...f, pageDetails: { ...f.pageDetails, [ key ]: { ...p, id: Number( e.target.value || 0 ) } } } ) } aria-label={ `${ PAGE_LABELS[ key ] } page ID` } />
								<code className="shrink-0 self-center rounded bg-slate-100 px-2 py-1 text-xs">{ p.shortcode }</code>
							</div>
						</Field>
					) ) }
				</div>
			</section>
			<div className="flex justify-end"><Btn variant="primary" loading={ saving } onClick={ save }>Save settings</Btn></div>
		</div>
	);
}
