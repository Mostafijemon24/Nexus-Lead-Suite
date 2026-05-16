import React, { useEffect, useState } from 'react';
import { Activity, FileText, Search, Trash2 } from 'lucide-react';
import { PageShell } from '../components/PageShell.jsx';
import { AdminStickyFooter } from '../components/AdminStickyFooter.jsx';
import { ResultModal } from '../components/NexusModal.jsx';

const TABS = [
	{ id: 'all', label: 'All' },
	{ id: 'forms', label: 'Forms' },
	{ id: 'calls', label: 'Calls' },
	{ id: 'consultations', label: 'Consultations' },
	{ id: 'interactions', label: 'Interactions' },
];

function TabButton( { active, children, onClick } ) {
	return (
		<button
			type="button"
			onClick={ onClick }
			className={ [
				'rounded-lg border px-3 py-1.5 text-xs font-semibold transition',
				active
					? 'border-violet-200 bg-violet-50 text-violet-700'
					: 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
			].join( ' ' ) }
		>
			{ children }
		</button>
	);
}

function Badge( { tone, children } ) {
	const tones = {
		blue: 'bg-blue-50 text-blue-700',
		green: 'bg-emerald-50 text-emerald-700',
		purple: 'bg-violet-50 text-violet-700',
		amber: 'bg-amber-50 text-amber-800',
		red: 'bg-rose-50 text-rose-700',
		slate: 'bg-slate-100 text-slate-600',
	};
	return (
		<span
			className={ `inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold ${ tones[ tone ] || tones.slate }` }
		>
			{ children }
		</span>
	);
}

function getRest() {
	const admin = window.nexusLsAdmin || {};
	return {
		restUrl: admin.restUrl || '',
		nonce: admin.nonce || '',
	};
}

export function ActivitiesPage() {
	const [ tab, setTab ] = useState( 'all' );
	const [ search, setSearch ] = useState( '' );
	const [ debouncedSearch, setDebouncedSearch ] = useState( '' );
	const [ dateFrom, setDateFrom ] = useState( '' );
	const [ dateTo, setDateTo ] = useState( '' );
	const [ rows, setRows ] = useState( [] );
	const [ loading, setLoading ] = useState( true );
	const [ error, setError ] = useState( '' );
	const [ clearing, setClearing ] = useState( false );
	const [ modal, setModal ] = useState( { open: false, variant: 'success', title: '', message: '' } );

	useEffect( () => {
		const timer = setTimeout( () => setDebouncedSearch( search.trim() ), 400 );
		return () => clearTimeout( timer );
	}, [ search ] );

	useEffect( () => {
		let cancelled = false;

		( async () => {
			setLoading( true );
			setError( '' );
			try {
				const { restUrl, nonce } = getRest();
				const params = new URLSearchParams( {
					tab,
					dateFrom,
					dateTo,
					search: debouncedSearch,
				} );
				const response = await fetch(
					`${ restUrl }nexus-lead-suite/v1/reports/activities/list?${ params }`,
					{
						headers: { 'X-WP-Nonce': nonce },
						credentials: 'same-origin',
					}
				);
				const json = await response.json().catch( () => ( {} ) );
				if ( cancelled ) {
					return;
				}
				if ( ! response.ok || ! json?.success ) {
					setRows( [] );
					const message =
						typeof json?.message === 'string'
							? json.message
							: json?.code || 'Could not load activities.';
					setError( message );
					return;
				}
				setRows( Array.isArray( json?.data?.rows ) ? json.data.rows : [] );
			} catch {
				if ( ! cancelled ) {
					setRows( [] );
					setError( 'Could not load activities.' );
				}
			} finally {
				if ( ! cancelled ) {
					setLoading( false );
				}
			}
		} )();

		return () => {
			cancelled = true;
		};
	}, [ tab, dateFrom, dateTo, debouncedSearch ] );

	const clearAll = async () => {
		if ( clearing || ! window.confirm( 'Clear all activities? This cannot be undone.' ) ) {
			return;
		}
		setClearing( true );
		try {
			const { restUrl, nonce } = getRest();
			const response = await fetch( `${ restUrl }nexus-lead-suite/v1/reports/activities/clear`, {
				method: 'POST',
				headers: { 'X-WP-Nonce': nonce },
				credentials: 'same-origin',
			} );
			const json = await response.json().catch( () => ( {} ) );
			if ( ! response.ok || ! json?.success ) {
				const message =
					typeof json?.message === 'string'
						? json.message
						: json?.code || 'Could not clear activities.';
				setModal( { open: true, variant: 'error', title: 'Error!', message } );
				return;
			}
			setRows( [] );
			setModal( {
				open: true,
				variant: 'success',
				title: 'Success!',
				message: 'All activities have been cleared.',
			} );
		} catch {
			setModal( {
				open: true,
				variant: 'error',
				title: 'Error!',
				message: 'Could not clear activities.',
			} );
		} finally {
			setClearing( false );
		}
	};

	return (
		<PageShell
			title="Activities"
			subtitle="Unified log: forms, calls, interactions and triggers"
			icon={ <Activity size={ 18 } /> }
			footer={ <AdminStickyFooter /> }
			headerRight={
				<div className="relative">
					<input
						value={ search }
						onChange={ ( event ) => setSearch( event.target.value ) }
						placeholder="Search..."
						className="h-9 w-44 rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs outline-none ring-violet-200 focus:ring-2 sm:w-56 md:w-72 md:text-sm"
					/>
					<span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
						<Search size={ 16 } />
					</span>
				</div>
			}
		>
			<ResultModal
				open={ modal.open }
				variant={ modal.variant }
				title={ modal.title }
				message={ modal.message }
				onDismiss={ () => setModal( ( state ) => ( { ...state, open: false } ) ) }
			/>

			<div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
				<div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-slate-50 p-1">
					{ TABS.map( ( item ) => (
						<TabButton key={ item.id } active={ tab === item.id } onClick={ () => setTab( item.id ) }>
							{ item.label }
						</TabButton>
					) ) }
				</div>
				<div className="flex flex-wrap items-center gap-2 sm:ml-auto">
					<label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
						<span>From:</span>
						<input
							type="date"
							value={ dateFrom }
							onChange={ ( event ) => setDateFrom( event.target.value ) }
							className="h-8 min-w-0 rounded-lg border border-slate-200 bg-white px-2 text-xs outline-none ring-violet-200 focus:ring-2"
						/>
					</label>
					<label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
						<span>To:</span>
						<input
							type="date"
							value={ dateTo }
							onChange={ ( event ) => setDateTo( event.target.value ) }
							className="h-8 min-w-0 rounded-lg border border-slate-200 bg-white px-2 text-xs outline-none ring-violet-200 focus:ring-2"
						/>
					</label>
					<button
						type="button"
						onClick={ () => {
							setDateFrom( '' );
							setDateTo( '' );
							setSearch( '' );
							setDebouncedSearch( '' );
							setTab( 'all' );
						} }
						className="h-8 rounded-lg px-3 text-xs font-semibold text-slate-500 hover:bg-slate-50"
					>
						Clear
					</button>
					{ loading ? (
						<span className="text-[11px] font-semibold uppercase tracking-wide text-violet-600">
							Updating…
						</span>
					) : null }
					<button
						type="button"
						onClick={ clearAll }
						className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 text-xs font-semibold text-rose-700 hover:bg-rose-100"
					>
						<Trash2 className="h-3.5 w-3.5" />
						{ clearing ? 'Clearing…' : 'Clear All' }
					</button>
				</div>
			</div>

			<div className="mt-4 overflow-x-auto overflow-hidden rounded-xl border border-slate-200">
				<table className="min-w-[720px] w-full border-separate border-spacing-0">
					<thead>
						<tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500">
							<th className="px-4 py-3">Action Name</th>
							<th className="px-4 py-3">Page URL</th>
							<th className="px-4 py-3">Purpose</th>
							<th className="px-4 py-3">Interaction</th>
							<th className="px-4 py-3">Date/Time</th>
							<th className="px-4 py-3">Mail Status</th>
							<th className="px-4 py-3">Reference</th>
						</tr>
					</thead>
					<tbody className="text-sm">
						{ loading && rows.length === 0 ? (
							<tr>
								<td colSpan={ 7 } className="px-4 py-10 text-center text-sm text-slate-500">
									Loading activities…
								</td>
							</tr>
						) : (
							<>
								{ rows.map( ( row ) => {
									const categoryKey = row.categoryKey || 'forms';
									const tone =
										categoryKey === 'forms'
											? 'blue'
											: categoryKey === 'calls'
												? 'green'
												: categoryKey === 'consultations'
													? 'purple'
													: 'amber';
									return (
										<tr
											key={ row.id }
											className="border-t border-slate-200 hover:bg-slate-50/60"
										>
											<td className="px-4 py-3 font-semibold text-slate-800">
												{ row.actionName }
											</td>
											<td className="px-4 py-3">
												{ row.pageUrl ? (
													<a
														href={ row.pageUrl }
														target="_blank"
														rel="noopener noreferrer"
														className="inline-flex max-w-[220px] items-center gap-1 text-slate-600 hover:text-slate-900"
													>
														<span className="truncate">{ row.pageUrl }</span>
													</a>
												) : (
													<span className="text-slate-400">—</span>
												) }
											</td>
											<td className="px-4 py-3">
												<Badge tone={ tone }>{ row.category }</Badge>
											</td>
											<td className="px-4 py-3 text-slate-600">{ row.context }</td>
											<td className="px-4 py-3 text-slate-600">{ row.dateTime }</td>
											<td className="px-4 py-3">
												<Badge tone="slate">{ row.mailStatus ?? row.mail_status ?? '—' }</Badge>
											</td>
											<td className="px-4 py-3 font-mono text-xs text-slate-600">{ row.id }</td>
										</tr>
									);
								} ) }
								{ ! loading && rows.length === 0 ? (
									<tr>
										<td colSpan={ 7 } className="px-4 py-10 text-center text-sm text-slate-500">
											{ error || 'No activities found.' }
										</td>
									</tr>
								) : null }
							</>
						) }
					</tbody>
				</table>
			</div>

			<p className="mt-4 flex items-center gap-2 text-xs text-slate-400">
				<FileText size={ 14 } />
				Full PDF report UI lives in the production bundle; list and clear endpoints are implemented here.
			</p>
		</PageShell>
	);
}
