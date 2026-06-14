import React, { useEffect, useMemo, useState } from 'react';
import { Activity, Search, Trash2, X } from 'lucide-react';
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

function PdfIcon( { className = 'h-4 w-4' } ) {
	return (
		<svg
			className={ className }
			fill="none"
			viewBox="0 0 24 24"
			strokeWidth={ 1.8 }
			stroke="currentColor"
			aria-hidden="true"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 15.75h3.375c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9H5.625c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125H9"
			/>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M10 18.25h.75a1.75 1.75 0 0 0 0-3.5H10v3.5Zm4.25 0v-3.5h1.9m-.8 1.75h-1.1"
			/>
		</svg>
	);
}

function TabButton( { active, children, onClick } ) {
	return (
		<button
			type="button"
			onClick={ onClick }
			className={ `nls-act-tab${ active ? ' is-active' : '' }` }
		>
			{ children }
		</button>
	);
}

function Badge( { tone, children } ) {
	const tones = {
		blue: 'is-blue',
		green: 'is-green',
		purple: 'is-purple',
		amber: 'is-amber',
		red: 'is-red',
		slate: 'is-slate',
	};
	return (
		<span className={ `nls-act-badge ${ tones[ tone ] || tones.slate }` }>
			{ children }
		</span>
	);
}

function splitLines( value ) {
	return String( value || '' )
		.split( /\r?\n/ )
		.map( ( line ) => line.trim() )
		.filter( Boolean );
}

function splitComma( value ) {
	return String( value || '' )
		.split( ',' )
		.map( ( line ) => line.trim() )
		.filter( Boolean );
}

function getMailSent( row ) {
	if ( ! ( 'mailSent' in row ) && ! ( 'mail_sent' in row ) ) {
		return undefined;
	}
	const sent = 'mailSent' in row ? row.mailSent : row.mail_sent;
	return sent === null ? null : sent;
}

function getMailStatus( row ) {
	return row.mailStatus ?? row.mail_status ?? '—';
}

function getRest() {
	const admin = window.nexusLsAdmin || {};
	return {
		restUrl: admin.restUrl || '',
		nonce: admin.nonce || '',
		siteTitle: admin.siteTitle || 'Website',
	};
}

function ActivitiesReportModal( { open, onClose, filters } ) {
	const { restUrl, nonce, siteTitle } = getRest();
	const [ generating, setGenerating ] = useState( false );
	const [ sending, setSending ] = useState( false );
	const [ templates, setTemplates ] = useState( [] );
	const [ customMessage, setCustomMessage ] = useState( '' );
	const [ customEmails, setCustomEmails ] = useState( '' );
	const [ selectedRecipients, setSelectedRecipients ] = useState( {} );
	const [ modal, setModal ] = useState( { open: false, variant: 'success', title: '', message: '' } );

	useEffect( () => {
		if ( ! open ) {
			return undefined;
		}
		const controller = new AbortController();
		( async () => {
			try {
				const response = await fetch( `${ restUrl }nexus-lead-suite/v1/emails/templates`, {
					headers: { 'X-WP-Nonce': nonce },
					credentials: 'same-origin',
					signal: controller.signal,
				} );
				const json = await response.json();
				const rows = json?.data?.templates;
				setTemplates( Array.isArray( rows ) ? rows : [] );
			} catch {
				setTemplates( [] );
			}
		} )();
		return () => controller.abort();
	}, [ open, restUrl, nonce ] );

	useEffect( () => {
		if ( ! open ) {
			return undefined;
		}
		const onKeyDown = ( event ) => {
			if ( event.key === 'Escape' ) {
				onClose();
			}
		};
		window.addEventListener( 'keydown', onKeyDown );
		return () => window.removeEventListener( 'keydown', onKeyDown );
	}, [ open, onClose ] );

	const savedRecipients = useMemo( () => {
		const emails = [];
		for ( const template of templates ) {
			const rows = Array.isArray( template?.recipients )
				? template.recipients
				: splitLines( template?.emails );
			for ( const email of rows ) {
				emails.push( String( email ).trim() );
			}
		}
		return Array.from( new Set( emails.filter( ( email ) => email !== '' ) ) );
	}, [ templates ] );

	const selectedCount = useMemo(
		() => Object.values( selectedRecipients ).filter( Boolean ).length,
		[ selectedRecipients ]
	);

	const previewPdf = async () => {
		if ( generating ) {
			return;
		}
		setGenerating( true );
		try {
			const response = await fetch( `${ restUrl }nexus-lead-suite/v1/reports/activities/pdf`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-WP-Nonce': nonce,
				},
				credentials: 'same-origin',
				body: JSON.stringify( {
					tab: filters.tab,
					dateFrom: filters.fromDate,
					dateTo: filters.toDate,
					search: filters.search,
				} ),
			} );
			const json = await response.json();
			const pdfUrl = json?.data?.pdf_url;
			if ( ! response.ok || ! pdfUrl ) {
				setModal( {
					open: true,
					variant: 'error',
					title: 'Error!',
					message: 'Failed to generate PDF.',
				} );
				return;
			}
			window.open( pdfUrl, '_blank', 'noopener,noreferrer' );
		} catch {
			setModal( {
				open: true,
				variant: 'error',
				title: 'Error!',
				message: 'Failed to generate PDF.',
			} );
		} finally {
			setGenerating( false );
		}
	};

	const sendEmail = async () => {
		if ( sending ) {
			return;
		}
		const checked = savedRecipients.filter( ( email ) => selectedRecipients[ email ] );
		const manual = splitComma( customEmails );
		const recipients = [ ...checked, ...manual ];
		if ( recipients.length === 0 ) {
			setModal( {
				open: true,
				variant: 'error',
				title: 'Error!',
				message: 'Please select or enter at least one recipient.',
			} );
			return;
		}
		setSending( true );
		try {
			const response = await fetch( `${ restUrl }nexus-lead-suite/v1/reports/activities/email`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-WP-Nonce': nonce,
				},
				credentials: 'same-origin',
				body: JSON.stringify( {
					tab: filters.tab,
					dateFrom: filters.fromDate,
					dateTo: filters.toDate,
					search: filters.search,
					recipients,
					customMessage,
				} ),
			} );
			const json = await response.json();
			if ( ! response.ok || ! json?.success ) {
				const message =
					json?.message || json?.data?.message || 'Failed to send email.';
				setModal( {
					open: true,
					variant: 'error',
					title: 'Error!',
					message: typeof message === 'string' ? message : 'Failed to send email.',
				} );
				return;
			}
			setModal( {
				open: true,
				variant: 'success',
				title: 'Success!',
				message: 'Email sent successfully.',
			} );
		} catch {
			setModal( {
				open: true,
				variant: 'error',
				title: 'Error!',
				message: 'Failed to send email.',
			} );
		} finally {
			setSending( false );
		}
	};

	if ( ! open ) {
		return null;
	}

	return (
		<>
			<ResultModal
				open={ modal.open }
				variant={ modal.variant }
				title={ modal.title }
				message={ modal.message }
				onDismiss={ () => setModal( ( state ) => ( { ...state, open: false } ) ) }
			/>
			<div className="nls-act-modal">
				<button
					type="button"
					className="nls-act-modal-backdrop"
					aria-label="Close modal"
					onClick={ onClose }
				/>
				<div className="nls-act-modal-panel" role="dialog" aria-modal="true" aria-labelledby="nls-act-report-title">
					<div className="nls-act-modal-head">
						<div>
							<h2 id="nls-act-report-title" className="nls-act-modal-title">
								Activities Report
							</h2>
							<p className="nls-act-modal-date">
								{ new Date().toLocaleDateString( undefined, {
									year: 'numeric',
									month: 'short',
									day: 'numeric',
								} ) }
							</p>
						</div>
						<button
							type="button"
							onClick={ onClose }
							className="nls-act-modal-close"
							aria-label="Close"
						>
							<X className="h-5 w-5" />
						</button>
					</div>

					<div className="nls-act-modal-body">
						<button
							type="button"
							onClick={ previewPdf }
							disabled={ generating }
							className="nls-act-btn-primary nls-act-btn-primary--block"
						>
							{ generating ? 'Generating…' : 'Preview PDF Report' }
						</button>

						<div className="nls-act-modal-divider" />

						<h3 className="nls-act-modal-subtitle">Share via Email</h3>

						<div className="nls-act-modal-fields">
							<div>
								<label className="nls-act-field-label" htmlFor="nls-act-custom-message">
									Custom Message (Optional)
								</label>
								<textarea
									id="nls-act-custom-message"
									value={ customMessage }
									onChange={ ( event ) => setCustomMessage( event.target.value ) }
									rows={ 3 }
									placeholder="Add a personal message to include in the email..."
									className="nls-act-textarea"
								/>
							</div>

							<div>
								<label className="nls-act-field-label" htmlFor="nls-act-custom-emails">
									Custom Email Addresses
								</label>
								<input
									id="nls-act-custom-emails"
									value={ customEmails }
									onChange={ ( event ) => setCustomEmails( event.target.value ) }
									placeholder="Enter email addresses separated by commas"
									className="nls-act-input"
								/>
							</div>

							<div>
								<p className="nls-act-field-label">Or Select from Email Settings:</p>
								<div className="nls-act-recipient-box">
									<p className="nls-act-recipient-site">{ siteTitle }</p>
									<div className="nls-act-recipient-list">
										{ savedRecipients.length === 0 ? (
											<p className="nls-act-recipient-empty">
												No saved email recipients yet. Save Emails settings first.
											</p>
										) : (
											savedRecipients.map( ( email ) => (
												<label key={ email } className="nls-act-recipient-item">
													<input
														type="checkbox"
														checked={ !! selectedRecipients[ email ] }
														onChange={ ( event ) =>
															setSelectedRecipients( ( state ) => ( {
																...state,
																[ email ]: event.target.checked,
															} ) )
														}
													/>
													{ email }
												</label>
											) )
										) }
									</div>
								</div>
								<p className="nls-act-recipient-count">{ selectedCount } recipients selected</p>
							</div>
						</div>
					</div>

					<div className="nls-act-modal-foot">
						<button type="button" onClick={ onClose } className="nls-act-btn-secondary">
							Cancel
						</button>
						<button
							type="button"
							onClick={ sendEmail }
							disabled={ sending }
							className="nls-act-btn-primary"
						>
							{ sending ? 'Sending…' : 'Send Email' }
						</button>
					</div>
				</div>
			</div>
		</>
	);
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
	const [ pdfOpen, setPdfOpen ] = useState( false );
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

	const resetFilters = () => {
		setDateFrom( '' );
		setDateTo( '' );
		setSearch( '' );
		setDebouncedSearch( '' );
		setTab( 'all' );
	};

	return (
		<PageShell
			title="Activities"
			subtitle="Unified log: forms, calls, interactions and triggers"
			icon={ <Activity size={ 18 } /> }
			footer={ <AdminStickyFooter /> }
			headerRight={
				<div className="nls-act-search">
					<input
						value={ search }
						onChange={ ( event ) => setSearch( event.target.value ) }
						placeholder="Search..."
						className="nls-act-search-input"
					/>
					<span className="nls-act-search-ico" aria-hidden="true">
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

			<ActivitiesReportModal
				open={ pdfOpen }
				onClose={ () => setPdfOpen( false ) }
				filters={ {
					tab,
					fromDate: dateFrom,
					toDate: dateTo,
					search,
				} }
			/>

			<div className="nls-activities-wrap">
				<div className="nls-act-card">
					<section className="nls-act-section is-first">
						<div className="nls-act-sec-head">
							<span className="nls-act-sec-ico" aria-hidden="true">
								<Activity size={ 16 } />
							</span>
							<div>
								<span className="nls-act-sec-title">Activity Log</span>
								<p className="nls-act-sec-desc">
									Filter by type, date range, or keyword. Export a PDF report or share it by email.
								</p>
							</div>
						</div>

						<div className="nls-act-toolbar">
							<div className="nls-act-tabs">
								{ TABS.map( ( item ) => (
									<TabButton
										key={ item.id }
										active={ tab === item.id }
										onClick={ () => setTab( item.id ) }
									>
										{ item.label }
									</TabButton>
								) ) }
							</div>

							<div className="nls-act-filters">
								<label className="nls-act-date">
									<span>From:</span>
									<input
										type="date"
										value={ dateFrom }
										onChange={ ( event ) => setDateFrom( event.target.value ) }
									/>
								</label>
								<label className="nls-act-date">
									<span>To:</span>
									<input
										type="date"
										value={ dateTo }
										onChange={ ( event ) => setDateTo( event.target.value ) }
									/>
								</label>
								<button type="button" onClick={ resetFilters } className="nls-act-btn-ghost">
									Clear
								</button>
								{ loading ? (
									<span className="nls-act-updating">Updating…</span>
								) : null }
								<span className="nls-act-filter-divider" aria-hidden="true" />
								<button
									type="button"
									onClick={ () => setPdfOpen( true ) }
									className="nls-act-btn-pdf"
								>
									<PdfIcon className="h-3.5 w-3.5" />
									<span className="hidden sm:inline">Report PDF</span>
									<span className="sm:hidden">PDF</span>
								</button>
								<button
									type="button"
									onClick={ clearAll }
									disabled={ clearing }
									className="nls-act-btn-danger"
								>
									<Trash2 className="h-3.5 w-3.5" />
									<span className="hidden sm:inline">{ clearing ? 'Clearing…' : 'Clear All' }</span>
									<span className="sm:hidden">{ clearing ? '…' : 'Clear' }</span>
								</button>
							</div>
						</div>
					</section>

					<section className="nls-act-section">
						<div className="nls-act-table-wrap">
							<table className="nls-act-table">
								<thead>
									<tr>
										<th>Action Name</th>
										<th>Page URL</th>
										<th>Purpose</th>
										<th>Interaction</th>
										<th>Date/Time</th>
										<th className="nls-act-col-mail">Mail Status</th>
										<th>Reference</th>
									</tr>
								</thead>
								<tbody>
									{ loading && rows.length === 0 ? (
										<tr>
											<td colSpan={ 7 } className="nls-act-empty">
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
												const mailSent = getMailSent( row );
												const mailTone =
													mailSent === undefined || mailSent === null
														? 'slate'
														: mailSent === true || mailSent === 1
															? 'green'
															: 'red';
												return (
													<tr key={ row.id }>
														<td className="nls-act-cell-strong">{ row.actionName }</td>
														<td>
															{ row.pageUrl ? (
																<a
																	href={ row.pageUrl }
																	target="_blank"
																	rel="noopener noreferrer"
																	className="nls-act-link"
																>
																	<span className="truncate">{ row.pageUrl }</span>
																	<span className="nls-act-link-ico" aria-hidden="true">
																		↗
																	</span>
																</a>
															) : (
																<span className="nls-act-muted">—</span>
															) }
														</td>
														<td>
															<Badge tone={ tone }>{ row.category }</Badge>
														</td>
														<td>{ row.context }</td>
														<td>{ row.dateTime }</td>
														<td className="nls-act-col-mail">
															<Badge tone={ mailTone }>{ getMailStatus( row ) }</Badge>
														</td>
														<td className="nls-act-ref">{ row.id }</td>
													</tr>
												);
											} ) }
											{ ! loading && rows.length === 0 ? (
												<tr>
													<td colSpan={ 7 } className="nls-act-empty">
														{ error || 'No activities found.' }
													</td>
												</tr>
											) : null }
										</>
									) }
								</tbody>
							</table>
						</div>
					</section>
				</div>
			</div>
		</PageShell>
	);
}
