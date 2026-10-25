import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import { api } from './api.js';
import { ModalBackdrop } from '../components/NexusModal.jsx';

/* ---------- data hooks ---------- */
export function useList( path, params, deps = [] ) {
	const [ state, setState ] = useState( { loading: true, error: '', data: null } );
	const [ tick, setTick ] = useState( 0 );
	const reload = useCallback( () => setTick( ( n ) => n + 1 ), [] );
	useEffect( () => {
		let alive = true;
		setState( ( s ) => ( { ...s, loading: true, error: '' } ) );
		api( path, { query: params } )
			.then( ( data ) => alive && setState( { loading: false, error: '', data } ) )
			.catch( ( err ) => alive && setState( { loading: false, error: err.message, data: null } ) );
		return () => {
			alive = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ path, tick, JSON.stringify( params ), ...deps ] );
	return { ...state, reload };
}

export function useDebounce( value, ms = 300 ) {
	const [ v, setV ] = useState( value );
	useEffect( () => {
		const id = setTimeout( () => setV( value ), ms );
		return () => clearTimeout( id );
	}, [ value, ms ] );
	return v;
}

/* ---------- atoms ---------- */
export function Btn( { variant = 'secondary', size = 'md', loading = false, className = '', children, ...rest } ) {
	const styles = {
		primary: 'bg-blue-600 text-white hover:bg-blue-700 border-transparent',
		secondary: 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200',
		danger: 'bg-white text-rose-600 hover:bg-rose-50 border-rose-200',
		ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 border-transparent',
	};
	const sizes = { sm: 'px-2.5 py-1.5 text-xs', md: 'px-4 py-2 text-sm' };
	return (
		<button
			type="button"
			{ ...rest }
			disabled={ rest.disabled || loading }
			className={ `inline-flex items-center justify-center gap-1.5 rounded-lg border font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${ styles[ variant ] } ${ sizes[ size ] } ${ className }` }
		>
			{ loading ? <Loader2 size={ 14 } className="animate-spin" /> : null }
			{ children }
		</button>
	);
}

export function Badge( { value } ) {
	const map = {
		active: 'bg-emerald-50 text-emerald-700',
		inactive: 'bg-slate-100 text-slate-600',
		pending: 'bg-amber-50 text-amber-700',
		confirmed: 'bg-blue-50 text-blue-700',
		treated: 'bg-emerald-50 text-emerald-700',
		cancelled: 'bg-rose-50 text-rose-700',
		paid: 'bg-emerald-50 text-emerald-700',
		unpaid: 'bg-amber-50 text-amber-700',
		refunded: 'bg-slate-100 text-slate-600',
	};
	return <span className={ `inline-block rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${ map[ value ] || 'bg-slate-100 text-slate-600' }` }>{ value }</span>;
}

export function Field( { label, error, hint, children, className = '' } ) {
	return (
		<label className={ `block ${ className }` }>
			<span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">{ label }</span>
			{ children }
			{ error ? <span className="mt-1 block text-xs font-medium text-rose-600">{ error }</span> : hint ? <span className="mt-1 block text-xs text-slate-400">{ hint }</span> : null }
		</label>
	);
}

export const inputCls = ( error ) =>
	`w-full rounded-lg border px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/40 ${ error ? 'border-rose-400' : 'border-slate-200' }`;

export function Alert( { kind = 'error', children } ) {
	const cls = kind === 'error' ? 'border-rose-200 bg-rose-50 text-rose-700' : kind === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-blue-200 bg-blue-50 text-blue-800';
	return <div role={ kind === 'error' ? 'alert' : 'status' } className={ `mb-3 rounded-lg border px-3 py-2 text-sm ${ cls }` }>{ children }</div>;
}

export function Skeleton( { rows = 5 } ) {
	return (
		<div className="space-y-3" aria-busy="true" aria-label="Loading">
			{ Array.from( { length: rows } ).map( ( _, i ) => (
				<div key={ i } className="h-4 animate-pulse rounded bg-slate-100" style={ { width: `${ 55 + ( ( i * 17 ) % 40 ) }%` } } />
			) ) }
		</div>
	);
}

export function EmptyState( { icon = null, title, text, action = null } ) {
	return (
		<div className="rounded-2xl border border-dashed border-slate-200 px-6 py-12 text-center">
			{ icon ? <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">{ icon }</div> : null }
			<h3 className="text-base font-bold text-slate-800">{ title }</h3>
			{ text ? <p className="mt-1 text-sm text-slate-500">{ text }</p> : null }
			{ action ? <div className="mt-4">{ action }</div> : null }
		</div>
	);
}

export function ErrorState( { message, onRetry } ) {
	return (
		<div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-8 text-center">
			<AlertTriangle className="mx-auto mb-2 text-rose-500" size={ 24 } />
			<p className="text-sm font-semibold text-rose-700">{ message }</p>
			{ onRetry ? <Btn className="mt-3" onClick={ onRetry }>Retry</Btn> : null }
		</div>
	);
}

/* ---------- responsive table ---------- */
export function Table( { columns, rows, keyField = 'id', empty = null } ) {
	if ( ! rows.length && empty ) {
		return empty;
	}
	return (
		<div className="overflow-x-auto rounded-xl border border-slate-200">
			<table className="nexulesuite_appt-table w-full text-left text-sm">
				<thead className="hidden bg-slate-50 text-xs uppercase tracking-wide text-slate-500 md:table-header-group">
					<tr>
						{ columns.map( ( c ) => (
							<th key={ c.key } className={ `px-3 py-2 font-semibold ${ c.className || '' }` }>{ c.label }</th>
						) ) }
					</tr>
				</thead>
				<tbody>
					{ rows.map( ( row ) => (
						<tr key={ row[ keyField ] } className="block border-t border-slate-100 md:table-row">
							{ columns.map( ( c ) => (
								<td key={ c.key } className={ `flex justify-between gap-3 px-3 py-2 align-top md:table-cell ${ c.className || '' }` }>
									<span className="text-xs font-semibold uppercase text-slate-400 md:hidden">{ c.label }</span>
									<span className="min-w-0 text-right md:text-left">{ c.render ? c.render( row ) : row[ c.key ] }</span>
								</td>
							) ) }
						</tr>
					) ) }
				</tbody>
			</table>
		</div>
	);
}

export function Pagination( { page, perPage, total, onChange } ) {
	const pages = Math.max( 1, Math.ceil( total / Math.max( 1, perPage ) ) );
	if ( pages <= 1 ) {
		return null;
	}
	return (
		<div className="mt-3 flex items-center justify-between text-sm text-slate-600">
			<span>
				Page { page } of { pages } · { total } total
			</span>
			<div className="flex gap-2">
				<Btn size="sm" disabled={ page <= 1 } onClick={ () => onChange( page - 1 ) }>Previous</Btn>
				<Btn size="sm" disabled={ page >= pages } onClick={ () => onChange( page + 1 ) }>Next</Btn>
			</div>
		</div>
	);
}

/* ---------- drawer (slide-over) ---------- */
export function Drawer( { open, title, onClose, children, footer = null, wide = false } ) {
	const ref = useRef( null );
	useEffect( () => {
		if ( ! open ) {
			return undefined;
		}
		const onKey = ( e ) => e.key === 'Escape' && onClose && onClose();
		window.addEventListener( 'keydown', onKey );
		return () => window.removeEventListener( 'keydown', onKey );
	}, [ open, onClose ] );
	if ( ! open ) {
		return null;
	}
	return (
		<ModalBackdrop open onClose={ onClose }>
			<div ref={ ref } className={ `flex max-h-[95vh] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ${ wide ? 'max-w-4xl' : 'max-w-2xl' }` } onMouseDown={ ( e ) => e.stopPropagation() }>
				<div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
					<h3 className="text-base font-bold text-slate-900">{ title }</h3>
					<button type="button" onClick={ onClose } aria-label="Close" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100">
						<X size={ 18 } />
					</button>
				</div>
				<div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{ children }</div>
				{ footer ? <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">{ footer }</div> : null }
			</div>
		</ModalBackdrop>
	);
}

export function ConfirmDialog( { open, title, text, confirmLabel = 'Delete', loading = false, onCancel, onConfirm } ) {
	if ( ! open ) {
		return null;
	}
	return (
		<ModalBackdrop open onClose={ onCancel }>
			<div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onMouseDown={ ( e ) => e.stopPropagation() }>
				<div className="flex items-start gap-3">
					<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-500"><AlertTriangle size={ 20 } /></div>
					<div>
						<h3 className="text-base font-bold text-slate-900">{ title }</h3>
						<p className="mt-1 text-sm text-slate-500">{ text }</p>
					</div>
				</div>
				<div className="mt-5 flex justify-end gap-2">
					<Btn onClick={ onCancel }>Cancel</Btn>
					<Btn variant="danger" loading={ loading } onClick={ onConfirm }>{ confirmLabel }</Btn>
				</div>
			</div>
		</ModalBackdrop>
	);
}

/* ---------- toolbar ---------- */
export function Toolbar( { search, onSearch, status, onStatus, statuses = [ [ '', 'All' ], [ 'active', 'Active' ], [ 'inactive', 'Inactive' ] ], children } ) {
	return (
		<div className="mb-3 flex flex-wrap items-center gap-2">
			{ onSearch ? (
				<input type="search" value={ search } onChange={ ( e ) => onSearch( e.target.value ) } placeholder="Search…" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm sm:w-56" aria-label="Search" />
			) : null }
			{ onStatus ? (
				<div className="flex gap-1 rounded-lg bg-slate-100 p-1">
					{ statuses.map( ( [ v, l ] ) => (
						<button key={ v } type="button" onClick={ () => onStatus( v ) } className={ `rounded-md px-3 py-1 text-xs font-semibold ${ status === v ? 'bg-white text-slate-900 shadow' : 'text-slate-500' }` }>{ l }</button>
					) ) }
				</div>
			) : null }
			<div className="ml-auto flex gap-2">{ children }</div>
		</div>
	);
}
