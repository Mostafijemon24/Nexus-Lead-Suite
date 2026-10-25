import React, { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { api } from './api.js';
import { Alert, Badge, Btn, ConfirmDialog, Drawer, EmptyState, ErrorState, Field, Pagination, Skeleton, Table, Toolbar, inputCls, useDebounce, useList } from './ui.jsx';

/**
 * Generic CRUD for departments, locations, medicine types and medicines.
 * `kind` is the REST segment: departments | locations | medicine-types | medicines.
 */
const META = {
	departments: { singular: 'Department', plural: 'Departments', count: 'doctorCount', countLabel: 'Doctors' },
	locations: { singular: 'Location', plural: 'Locations', count: 'doctorCount', countLabel: 'Doctors' },
	'medicine-types': { singular: 'Medicine type', plural: 'Medicine types', count: 'medicineCount', countLabel: 'Medicines' },
	medicines: { singular: 'Medicine', plural: 'Medicines', count: null },
};

export function CatalogTab( { kind, onNotify } ) {
	const meta = META[ kind ];
	const [ search, setSearch ] = useState( '' );
	const [ status, setStatus ] = useState( '' );
	const [ page, setPage ] = useState( 1 );
	const q = useDebounce( search );
	const { loading, error, data, reload } = useList( `admin/catalog/${ kind }`, { search: q, status, page, perPage: 25 } );
	const types = useList( 'admin/catalog/medicine-types', { perPage: 200 }, [ kind === 'medicines' ] );
	const [ editing, setEditing ] = useState( null ); // null | {} (new) | item
	const [ deleting, setDeleting ] = useState( null );
	const [ busy, setBusy ] = useState( false );
	const [ deleteError, setDeleteError ] = useState( '' );

	const columns = [
		{ key: 'name', label: 'Name', render: ( r ) => <span className="font-semibold text-slate-800">{ r.name }</span> },
	];
	if ( kind === 'departments' ) {
		columns.push( { key: 'slug', label: 'Slug', render: ( r ) => <code className="text-xs">{ r.slug }</code> } );
	}
	if ( kind === 'locations' ) {
		columns.push( { key: 'address', label: 'Address', render: ( r ) => <span className="text-slate-500">{ r.address || '—' }</span> } );
	}
	if ( kind === 'medicines' ) {
		columns.push( { key: 'typeName', label: 'Type', render: ( r ) => r.typeName || '—' } );
		columns.push( { key: 'note', label: 'Note', render: ( r ) => <span className="text-slate-500">{ r.note || '—' }</span> } );
	}
	if ( meta.count ) {
		columns.push( { key: meta.count, label: meta.countLabel, render: ( r ) => r[ meta.count ] ?? 0 } );
	}
	columns.push( { key: 'status', label: 'Status', render: ( r ) => <Badge value={ r.status } /> } );
	columns.push( {
		key: 'actions',
		label: '',
		className: 'md:text-right',
		render: ( r ) => (
			<span className="inline-flex gap-1">
				<Btn size="sm" onClick={ () => setEditing( r ) } aria-label={ `Edit ${ r.name }` }><Pencil size={ 13 } /> Edit</Btn>
				<Btn size="sm" variant="danger" onClick={ () => { setDeleteError( '' ); setDeleting( r ); } } aria-label={ `Delete ${ r.name }` }><Trash2 size={ 13 } /></Btn>
			</span>
		),
	} );

	async function doDelete() {
		setBusy( true );
		setDeleteError( '' );
		try {
			await api( `admin/catalog/${ kind }/${ deleting.id }`, { method: 'DELETE' } );
			setDeleting( null );
			onNotify?.( 'success', `${ meta.singular } deleted.` );
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
				<Btn variant="primary" onClick={ () => setEditing( {} ) }><Plus size={ 14 } /> Add new</Btn>
			</Toolbar>
			{ loading && ! data ? <Skeleton rows={ 6 } /> : null }
			{ error ? <ErrorState message={ error } onRetry={ reload } /> : null }
			{ data ? (
				<>
					<Table
						columns={ columns }
						rows={ data.items }
						empty={ <EmptyState title={ `No ${ meta.plural.toLowerCase() } yet` } text={ search || status ? 'Try clearing the search or filter.' : `Create your first ${ meta.singular.toLowerCase() } to get started.` } action={ <Btn variant="primary" onClick={ () => setEditing( {} ) }><Plus size={ 14 } /> Add { meta.singular.toLowerCase() }</Btn> } /> }
					/>
					<Pagination page={ data.page } perPage={ data.perPage } total={ data.total } onChange={ setPage } />
				</>
			) : null }

			<CatalogForm
				kind={ kind }
				meta={ meta }
				item={ editing }
				types={ types.data?.items || [] }
				onClose={ () => setEditing( null ) }
				onSaved={ ( item, isNew ) => { setEditing( null ); onNotify?.( 'success', `${ meta.singular } ${ isNew ? 'created' : 'updated' }.` ); reload(); if ( kind === 'medicine-types' ) { types.reload(); } } }
			/>
			<ConfirmDialog
				open={ !! deleting }
				title={ `Delete ${ deleting?.name }?` }
				text={ deleteError || ( kind === 'medicines' ? 'Medicines already used in prescriptions cannot be deleted; set them inactive instead.' : 'This cannot be undone. Items still in use cannot be deleted.' ) }
				loading={ busy }
				onCancel={ () => setDeleting( null ) }
				onConfirm={ doDelete }
			/>
		</div>
	);
}

function CatalogForm( { kind, meta, item, types, onClose, onSaved } ) {
	const open = item !== null;
	const isNew = open && ! item.id;
	const [ form, setForm ] = useState( {} );
	const [ errors, setErrors ] = useState( {} );
	const [ message, setMessage ] = useState( '' );
	const [ saving, setSaving ] = useState( false );
	const [ seeded, setSeeded ] = useState( null );

	if ( open && seeded !== item ) {
		setSeeded( item );
		setForm( { name: '', status: 'active', description: '', address: '', icon: '', typeId: '', note: '', ...item } );
		setErrors( {} );
		setMessage( '' );
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
			const payload = { ...form };
			if ( kind === 'medicines' ) {
				payload.typeId = Number( payload.typeId || 0 );
			}
			const res = isNew
				? await api( `admin/catalog/${ kind }`, { method: 'POST', body: payload } )
				: await api( `admin/catalog/${ kind }/${ item.id }`, { method: 'PUT', body: payload } );
			onSaved( res, isNew );
		} catch ( e ) {
			setErrors( e.errors || {} );
			setMessage( e.message );
		} finally {
			setSaving( false );
		}
	}

	return (
		<Drawer open title={ isNew ? `New ${ meta.singular.toLowerCase() }` : `Edit ${ meta.singular.toLowerCase() }` } onClose={ onClose } footer={ <><Btn onClick={ onClose }>Cancel</Btn><Btn variant="primary" loading={ saving } onClick={ save }>Save</Btn></> }>
			<form className="space-y-4" onSubmit={ ( e ) => { e.preventDefault(); save(); } } noValidate>
				{ message ? <Alert>{ message }</Alert> : null }
				<Field label="Name" error={ errors.name }><input className={ inputCls( errors.name ) } value={ form.name } onChange={ set( 'name' ) } required maxLength={ 120 } autoFocus /></Field>
				{ kind === 'departments' ? (
					<>
						<Field label="Description" error={ errors.description }><textarea className={ inputCls( errors.description ) } rows={ 4 } value={ form.description } onChange={ set( 'description' ) } /></Field>
						<Field label="Icon (optional key)" error={ errors.icon } hint="A short identifier such as heart-pulse; used by themes."><input className={ inputCls( errors.icon ) } value={ form.icon } onChange={ set( 'icon' ) } maxLength={ 64 } /></Field>
					</>
				) : null }
				{ kind === 'locations' ? (
					<Field label="Address" error={ errors.address }><textarea className={ inputCls( errors.address ) } rows={ 3 } value={ form.address } onChange={ set( 'address' ) } /></Field>
				) : null }
				{ kind === 'medicines' ? (
					<>
						<Field label="Type" error={ errors.typeId }>
							<select className={ inputCls( errors.typeId ) } value={ form.typeId || '' } onChange={ set( 'typeId' ) }>
								<option value="">— No type —</option>
								{ types.map( ( t ) => <option key={ t.id } value={ t.id }>{ t.name }</option> ) }
							</select>
						</Field>
						<Field label="Note" error={ errors.note }><input className={ inputCls( errors.note ) } value={ form.note } onChange={ set( 'note' ) } maxLength={ 255 } /></Field>
					</>
				) : null }
				<Field label="Status" error={ errors.status }>
					<select className={ inputCls( errors.status ) } value={ form.status } onChange={ set( 'status' ) }>
						<option value="active">Active</option>
						<option value="inactive">Inactive</option>
					</select>
				</Field>
				<button type="submit" className="hidden" aria-hidden="true" />
			</form>
		</Drawer>
	);
}
