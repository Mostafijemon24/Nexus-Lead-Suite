import React, { useEffect, useState } from 'react';
import { CalendarOff, Pencil, Plus, Trash2 } from 'lucide-react';
import { api, money } from './api.js';
import { ScheduleEditor } from './ScheduleEditor.jsx';
import { Alert, Badge, Btn, ConfirmDialog, Drawer, EmptyState, ErrorState, Field, Pagination, Skeleton, Table, Toolbar, inputCls, useDebounce, useList } from './ui.jsx';

export function DoctorsTab( { onNotify, currencySymbol } ) {
	const [ search, setSearch ] = useState( '' );
	const [ status, setStatus ] = useState( '' );
	const [ department, setDepartment ] = useState( '' );
	const [ page, setPage ] = useState( 1 );
	const q = useDebounce( search );
	const { loading, error, data, reload } = useList( 'admin/doctors', { search: q, status, departmentId: department, page, perPage: 20 } );
	const departments = useList( 'admin/catalog/departments', { perPage: 200 } );
	const locations = useList( 'admin/catalog/locations', { perPage: 200 } );
	const [ editing, setEditing ] = useState( null );
	const [ deleting, setDeleting ] = useState( null );
	const [ busy, setBusy ] = useState( false );
	const [ deleteError, setDeleteError ] = useState( '' );

	const columns = [
		{ key: 'name', label: 'Doctor', render: ( r ) => (
			<div className="flex items-center gap-2">
				{ r.photoUrl ? <img src={ r.photoUrl } alt="" className="h-8 w-8 rounded-full object-cover" /> : <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">{ initials( r.name ) }</span> }
				<div><div className="font-semibold text-slate-800">{ r.name }{ r.designations ? <span className="ml-1 font-normal text-slate-500">({ r.designations })</span> : null }</div><div className="text-xs text-slate-500">{ r.email }</div></div>
			</div>
		) },
		{ key: 'departmentName', label: 'Department', render: ( r ) => r.departmentName || '—' },
		{ key: 'locationName', label: 'Location', render: ( r ) => r.locationName || '—' },
		{ key: 'fee', label: 'Fee', render: ( r ) => money( r.fee, currencySymbol ) },
		{ key: 'schedule', label: 'Days', render: ( r ) => <span className="text-xs text-slate-500">{ r.schedule.filter( ( s ) => s.enabled ).length } / 7 open</span> },
		{ key: 'status', label: 'Status', render: ( r ) => <Badge value={ r.status } /> },
		{ key: 'actions', label: '', className: 'md:text-right', render: ( r ) => (
			<span className="inline-flex gap-1">
				<Btn size="sm" onClick={ () => setEditing( r ) }><Pencil size={ 13 } /> Edit</Btn>
				<Btn size="sm" variant="danger" onClick={ () => { setDeleteError( '' ); setDeleting( r ); } } aria-label={ `Delete ${ r.name }` }><Trash2 size={ 13 } /></Btn>
			</span>
		) },
	];

	async function doDelete() {
		setBusy( true );
		try {
			await api( `admin/doctors/${ deleting.id }`, { method: 'DELETE' } );
			setDeleting( null );
			onNotify?.( 'success', 'Doctor deleted.' );
			reload();
		} catch ( e ) {
			setDeleteError( e.message );
		} finally {
			setBusy( false );
		}
	}

	return (
		<div>
			<Toolbar search={ search } onSearch={ ( v ) => { setSearch( v ); setPage( 1 ); } } status={ status } onStatus={ ( v ) => { setStatus( v ); setPage( 1 ); } }>
				<select value={ department } onChange={ ( e ) => { setDepartment( e.target.value ); setPage( 1 ); } } className="rounded-lg border border-slate-200 px-3 py-2 text-sm" aria-label="Filter by department">
					<option value="">All departments</option>
					{ ( departments.data?.items || [] ).map( ( d ) => <option key={ d.id } value={ d.id }>{ d.name }</option> ) }
				</select>
				<Btn variant="primary" onClick={ () => setEditing( {} ) }><Plus size={ 14 } /> Add doctor</Btn>
			</Toolbar>
			{ loading && ! data ? <Skeleton rows={ 6 } /> : null }
			{ error ? <ErrorState message={ error } onRetry={ reload } /> : null }
			{ data ? (
				<>
					<Table columns={ columns } rows={ data.items } empty={ <EmptyState title="No doctors yet" text={ departments.data && ! departments.data.total ? 'Create a department first, then add doctors.' : 'Doctors cannot register themselves; add them here.' } action={ <Btn variant="primary" onClick={ () => setEditing( {} ) }><Plus size={ 14 } /> Add doctor</Btn> } /> } />
					<Pagination page={ data.page } perPage={ data.perPage } total={ data.total } onChange={ setPage } />
				</>
			) : null }
			<DoctorForm item={ editing } departments={ departments.data?.items || [] } locations={ locations.data?.items || [] } onClose={ () => setEditing( null ) } onSaved={ ( d, isNew ) => { setEditing( isNew ? d : null ); onNotify?.( 'success', isNew ? 'Doctor created. You can now manage leave days below.' : 'Doctor updated.' ); reload(); } } />
			<ConfirmDialog open={ !! deleting } title={ `Delete ${ deleting?.name }?` } text={ deleteError || 'The doctor and their WordPress login are removed. Doctors with appointments cannot be deleted; set them inactive instead.' } loading={ busy } onCancel={ () => setDeleting( null ) } onConfirm={ doDelete } />
		</div>
	);
}

function initials( n ) {
	return ( n || '' ).replace( /^Dr\.?\s+/i, '' ).split( /\s+/ ).slice( 0, 2 ).map( ( p ) => p.charAt( 0 ) ).join( '' ).toUpperCase();
}

function DoctorForm( { item, departments, locations, onClose, onSaved } ) {
	const open = item !== null;
	const isNew = open && ! item.id;
	const [ form, setForm ] = useState( {} );
	const [ errors, setErrors ] = useState( {} );
	const [ message, setMessage ] = useState( '' );
	const [ saving, setSaving ] = useState( false );
	const [ seeded, setSeeded ] = useState( null );
	const [ tab, setTab ] = useState( 'profile' );

	if ( open && seeded !== item ) {
		setSeeded( item );
		setForm( { name: '', email: '', phone: '', password: '', designations: '', departmentId: '', locationId: '', fee: 0, experienceYears: 0, bio: '', education: '', experience: '', qualification: '', address: '', status: 'active', photoId: 0, schedule: null, ...item } );
		setErrors( {} );
		setMessage( '' );
		setTab( 'profile' );
	}
	if ( ! open ) {
		return null;
	}
	const set = ( k ) => ( e ) => setForm( ( f ) => ( { ...f, [ k ]: e.target.value } ) );

	async function save() {
		setSaving( true );
		setErrors( {} );
		setMessage( '' );
		try {
			const payload = { ...form, departmentId: Number( form.departmentId || 0 ), locationId: Number( form.locationId || 0 ), fee: Number( form.fee || 0 ), experienceYears: Number( form.experienceYears || 0 ), photoId: Number( form.photoId || 0 ) };
			if ( ! payload.password ) {
				delete payload.password;
			}
			if ( ! payload.schedule ) {
				delete payload.schedule;
			}
			const res = isNew ? await api( 'admin/doctors', { method: 'POST', body: payload } ) : await api( `admin/doctors/${ item.id }`, { method: 'PUT', body: payload } );
			onSaved( res, isNew );
		} catch ( e ) {
			setErrors( e.errors || {} );
			setMessage( e.message );
			if ( Object.keys( e.errors || {} ).some( ( k ) => k.startsWith( 'schedule.' ) ) ) {
				setTab( 'schedule' );
			} else if ( Object.keys( e.errors || {} ).length ) {
				setTab( 'profile' );
			}
		} finally {
			setSaving( false );
		}
	}

	const tabs = [ [ 'profile', 'Profile' ], [ 'schedule', 'Weekly schedule' ] ];
	if ( ! isNew ) {
		tabs.push( [ 'leaves', 'Leave days' ] );
	}

	return (
		<Drawer open wide title={ isNew ? 'New doctor' : item.name } onClose={ onClose } footer={ tab === 'leaves' ? <Btn onClick={ onClose }>Close</Btn> : <><Btn onClick={ onClose }>Cancel</Btn><Btn variant="primary" loading={ saving } onClick={ save }>{ isNew ? 'Create doctor' : 'Save changes' }</Btn></> }>
			<div className="mb-4 flex gap-1 rounded-lg bg-slate-100 p-1">
				{ tabs.map( ( [ k, l ] ) => <button key={ k } type="button" onClick={ () => setTab( k ) } className={ `rounded-md px-3 py-1.5 text-xs font-semibold ${ tab === k ? 'bg-white text-slate-900 shadow' : 'text-slate-500' }` }>{ l }</button> ) }
			</div>
			{ message ? <Alert>{ message }</Alert> : null }
			{ tab === 'profile' ? (
				<form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={ ( e ) => { e.preventDefault(); save(); } } noValidate>
					<Field label="Full name" error={ errors.name }><input className={ inputCls( errors.name ) } value={ form.name } onChange={ set( 'name' ) } autoFocus /></Field>
					<Field label="E-mail (login)" error={ errors.email }><input type="email" className={ inputCls( errors.email ) } value={ form.email } onChange={ set( 'email' ) } /></Field>
					<Field label={ isNew ? 'Password' : 'New password (leave blank to keep)' } error={ errors.password } hint="At least 8 characters."><input type="password" autoComplete="new-password" className={ inputCls( errors.password ) } value={ form.password } onChange={ set( 'password' ) } /></Field>
					<Field label="Phone" error={ errors.phone }><input className={ inputCls( errors.phone ) } value={ form.phone } onChange={ set( 'phone' ) } /></Field>
					<Field label="Designations" error={ errors.designations } hint="Shown after the name, e.g. MBBS, FCPS, FRCS" className="sm:col-span-2"><input className={ inputCls( errors.designations ) } value={ form.designations } onChange={ set( 'designations' ) } maxLength={ 190 } /></Field>
					<Field label="Department" error={ errors.departmentId }>
						<select className={ inputCls( errors.departmentId ) } value={ form.departmentId || '' } onChange={ set( 'departmentId' ) }>
							<option value="">— Select —</option>
							{ departments.map( ( d ) => <option key={ d.id } value={ d.id }>{ d.name }</option> ) }
						</select>
					</Field>
					<Field label="Location" error={ errors.locationId }>
						<select className={ inputCls( errors.locationId ) } value={ form.locationId || '' } onChange={ set( 'locationId' ) }>
							<option value="">— None —</option>
							{ locations.map( ( d ) => <option key={ d.id } value={ d.id }>{ d.name }</option> ) }
						</select>
					</Field>
					<Field label="Consultation fee" error={ errors.fee }><input type="number" min={ 0 } step="0.01" className={ inputCls( errors.fee ) } value={ form.fee } onChange={ set( 'fee' ) } /></Field>
					<Field label="Years of experience" error={ errors.experienceYears }><input type="number" min={ 0 } max={ 80 } className={ inputCls( errors.experienceYears ) } value={ form.experienceYears } onChange={ set( 'experienceYears' ) } /></Field>
					<Field label="Photo (media ID)" error={ errors.photoId } hint="Upload the photo in Media and paste its ID." className="sm:col-span-1"><input type="number" min={ 0 } className={ inputCls( errors.photoId ) } value={ form.photoId } onChange={ set( 'photoId' ) } /></Field>
					<Field label="Status" error={ errors.status }>
						<select className={ inputCls( errors.status ) } value={ form.status } onChange={ set( 'status' ) }><option value="active">Active (bookable)</option><option value="inactive">Inactive (hidden)</option></select>
					</Field>
					<Field label="Address" error={ errors.address } className="sm:col-span-2"><textarea rows={ 2 } className={ inputCls( errors.address ) } value={ form.address } onChange={ set( 'address' ) } /></Field>
					<Field label="About / bio" error={ errors.bio } className="sm:col-span-2"><textarea rows={ 5 } className={ inputCls( errors.bio ) } value={ form.bio } onChange={ set( 'bio' ) } /></Field>
					<Field label="Education (one item per line)" error={ errors.education }><textarea rows={ 4 } className={ inputCls( errors.education ) } value={ form.education } onChange={ set( 'education' ) } /></Field>
					<Field label="Experience (one item per line)" error={ errors.experience }><textarea rows={ 4 } className={ inputCls( errors.experience ) } value={ form.experience } onChange={ set( 'experience' ) } /></Field>
					<Field label="Qualification (one item per line)" error={ errors.qualification } className="sm:col-span-2"><textarea rows={ 3 } className={ inputCls( errors.qualification ) } value={ form.qualification } onChange={ set( 'qualification' ) } /></Field>
					<button type="submit" className="hidden" aria-hidden="true" />
				</form>
			) : null }
			{ tab === 'schedule' ? (
				<ScheduleEditor value={ form.schedule || item.schedule } onChange={ ( schedule ) => setForm( ( f ) => ( { ...f, schedule } ) ) } errors={ errors } />
			) : null }
			{ tab === 'leaves' ? <LeaveDays doctorId={ item.id } /> : null }
		</Drawer>
	);
}

function LeaveDays( { doctorId } ) {
	const [ leaves, setLeaves ] = useState( null );
	const [ error, setError ] = useState( '' );
	const [ date, setDate ] = useState( '' );
	const [ note, setNote ] = useState( '' );
	const [ fieldError, setFieldError ] = useState( '' );
	const [ saving, setSaving ] = useState( false );
	const load = () => api( `admin/doctors/${ doctorId }/leaves` ).then( setLeaves ).catch( ( e ) => setError( e.message ) );
	useEffect( () => { load(); }, [ doctorId ] ); // eslint-disable-line react-hooks/exhaustive-deps

	async function add( e ) {
		e.preventDefault();
		setSaving( true );
		setFieldError( '' );
		try {
			await api( `admin/doctors/${ doctorId }/leaves`, { method: 'POST', body: { date, note } } );
			setDate( '' );
			setNote( '' );
			await load();
		} catch ( err ) {
			setFieldError( err.errors?.date || err.message );
		} finally {
			setSaving( false );
		}
	}
	async function remove( id ) {
		await api( `admin/doctors/${ doctorId }/leaves/${ id }`, { method: 'DELETE' } );
		load();
	}
	return (
		<div>
			<form onSubmit={ add } className="mb-4 grid grid-cols-1 items-end gap-3 sm:grid-cols-[1fr_2fr_auto]">
				<Field label="Date" error={ fieldError }><input type="date" required className={ inputCls( fieldError ) } value={ date } onChange={ ( e ) => setDate( e.target.value ) } /></Field>
				<Field label="Note"><input className={ inputCls( false ) } value={ note } onChange={ ( e ) => setNote( e.target.value ) } maxLength={ 190 } /></Field>
				<Btn variant="primary" loading={ saving } onClick={ add }><Plus size={ 14 } /> Add</Btn>
			</form>
			{ error ? <Alert>{ error }</Alert> : null }
			{ ! leaves ? <Skeleton rows={ 3 } /> : leaves.length === 0 ? <EmptyState icon={ <CalendarOff size={ 20 } /> } title="No leave days" text="Patients cannot book on leave days." /> : (
				<ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
					{ leaves.map( ( l ) => (
						<li key={ l.id } className="flex items-center justify-between px-3 py-2 text-sm">
							<span><strong>{ l.date }</strong> { l.note ? <span className="text-slate-500">· { l.note }</span> : null }</span>
							<Btn size="sm" variant="danger" onClick={ () => remove( l.id ) }>Remove</Btn>
						</li>
					) ) }
				</ul>
			) }
		</div>
	);
}
