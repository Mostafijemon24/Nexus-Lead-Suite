/* Chatbot admin panels. No longer a standalone page — these three components are mounted
   inside Settings → AI Chatbot (FaqTab, AutoSetupTab) and Activities (ReportsTab). */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
	Bot,
	MessageSquare,
	Users,
	CalendarDays,
	ImageIcon,
	Search,
	Trash2,
	RefreshCw,
	Plus,
	Save,
	ChevronRight,
	Sparkles,
	X,
} from 'lucide-react';

function getRest() {
	const admin = window.nexulesuite_Admin || {};
	return {
		restUrl: admin.restUrl || '',
		nonce: admin.nonce || '',
	};
}

const API = 'nexulesuite_/v1';

/* Icon keys must match Shortcodes::livechat_ai_icon_set() in PHP. */
const FAQ_ICONS = [
	{ key: '', label: '— No icon —' },
	{ key: 'stethoscope', label: '🩺 Stethoscope' },
	{ key: 'dollar', label: '💲 Dollar / price' },
	{ key: 'shield', label: '🛡️ Shield / insurance' },
	{ key: 'pin', label: '📍 Location pin' },
	{ key: 'directions', label: '🧭 Directions / map' },
	{ key: 'calendar', label: '📅 Calendar / booking' },
	{ key: 'phone', label: '📞 Phone / call' },
	{ key: 'mail', label: '✉️ Email' },
	{ key: 'chat', label: '💬 Chat' },
	{ key: 'question', label: '❓ Question' },
	{ key: 'clock', label: '🕐 Hours / time' },
	{ key: 'info', label: 'ℹ️ Info' },
	{ key: 'heart', label: '❤️ Care / health' },
	{ key: 'user', label: '👤 Person / doctor' },
];

function IconSelect( { value, onChange, className = '' } ) {
	return (
		<select
			value={ value || '' }
			onChange={ ( e ) => onChange( e.target.value ) }
			className={ `rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm text-slate-700 ${ className }` }
			aria-label="Icon"
		>
			{ FAQ_ICONS.map( ( ic ) => (
				<option key={ ic.key } value={ ic.key }>{ ic.label }</option>
			) ) }
		</select>
	);
}

/* ── Small building blocks ─────────────────────────────────────────── */

function StatCard( { icon, label, value, tone = 'blue' } ) {
	const tones = {
		blue: 'bg-blue-50 text-blue-600',
		green: 'bg-emerald-50 text-emerald-600',
		purple: 'bg-violet-50 text-violet-600',
		amber: 'bg-amber-50 text-amber-600',
		slate: 'bg-slate-100 text-slate-600',
	};
	return (
		<div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
			<div className={ `flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${ tones[ tone ] || tones.blue }` }>
				{ icon }
			</div>
			<div className="min-w-0">
				<div className="text-2xl font-bold leading-none text-slate-900">{ value }</div>
				<div className="mt-1 truncate text-xs font-medium uppercase tracking-wide text-slate-400">{ label }</div>
			</div>
		</div>
	);
}

function Toggle( { checked, onChange, label, hint } ) {
	return (
		<label className="flex cursor-pointer items-start gap-3">
			<button
				type="button"
				role="switch"
				aria-checked={ !! checked }
				onClick={ () => onChange( ! checked ) }
				className={ `relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors ${ checked ? 'bg-blue-600' : 'bg-slate-300' }` }
			>
				<span className={ `absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${ checked ? 'left-[1.375rem]' : 'left-0.5' }` } />
			</button>
			<span className="min-w-0">
				<span className="block text-sm font-semibold text-slate-800">{ label }</span>
				{ hint ? <span className="mt-0.5 block text-xs text-slate-500">{ hint }</span> : null }
			</span>
		</label>
	);
}

function fmtDate( value ) {
	if ( ! value ) {
		return '—';
	}
	// Stored as 'YYYY-MM-DD HH:MM:SS' (site time). Render compactly without TZ shifting.
	const [ d, t ] = String( value ).split( ' ' );
	return t ? `${ d } ${ t.slice( 0, 5 ) }` : d;
}

/* ── Reports dashboard ─────────────────────────────────────────────── */

export function ReportsTab() {
	const { restUrl, nonce } = getRest();
	const [ loading, setLoading ] = useState( true );
	const [ stats, setStats ] = useState( null );
	const [ loggingEnabled, setLoggingEnabled ] = useState( false );
	const [ conversations, setConversations ] = useState( [] );
	const [ dateFrom, setDateFrom ] = useState( '' );
	const [ dateTo, setDateTo ] = useState( '' );
	const [ search, setSearch ] = useState( '' );
	const [ active, setActive ] = useState( null ); // { sessionId, transcript }
	const [ loadingDetail, setLoadingDetail ] = useState( false );

	const load = useCallback( async () => {
		setLoading( true );
		try {
			const params = new URLSearchParams();
			if ( dateFrom ) params.set( 'dateFrom', dateFrom );
			if ( dateTo ) params.set( 'dateTo', dateTo );
			if ( search ) params.set( 'search', search );
			const res = await fetch( `${ restUrl }${ API }/ai/logs?${ params }`, {
				headers: { 'X-WP-Nonce': nonce },
			} );
			const json = await res.json();
			if ( json && json.success ) {
				setStats( json.data.stats );
				setLoggingEnabled( !! json.data.loggingEnabled );
				setConversations( json.data.conversations || [] );
			}
		} catch ( e ) {
			// Silent — surfaced as empty state.
		} finally {
			setLoading( false );
		}
	}, [ restUrl, nonce, dateFrom, dateTo, search ] );

	useEffect( () => {
		load();
	}, [] ); // initial only; filters apply via the Apply button.

	const openConversation = async ( sessionId ) => {
		setActive( { sessionId, transcript: null } );
		setLoadingDetail( true );
		try {
			const res = await fetch(
				`${ restUrl }${ API }/ai/logs/detail?session=${ encodeURIComponent( sessionId ) }`,
				{ headers: { 'X-WP-Nonce': nonce } }
			);
			const json = await res.json();
			if ( json && json.success ) {
				setActive( { sessionId, transcript: json.data.transcript || [] } );
			}
		} catch ( e ) {
			setActive( { sessionId, transcript: [] } );
		} finally {
			setLoadingDetail( false );
		}
	};

	const clearAll = async () => {
		// eslint-disable-next-line no-alert
		if ( ! window.confirm( 'Permanently delete ALL stored chat transcripts? This cannot be undone.' ) ) {
			return;
		}
		try {
			await fetch( `${ restUrl }${ API }/ai/logs/clear`, {
				method: 'POST',
				headers: { 'X-WP-Nonce': nonce },
			} );
			setActive( null );
			load();
		} catch ( e ) {
			// no-op
		}
	};

	return (
		<div className="space-y-5">
			{ ! loggingEnabled && (
				<div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
					Transcript storage is <b>off</b>. Turn on <b>“Store chat transcripts”</b> in Settings → AI Chatbot → FAQ &amp; Buttons to start
					collecting conversations here. Existing rows still display below.
				</div>
			) }

			<div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
				<StatCard tone="blue" icon={ <Users className="h-5 w-5" /> } label="Conversations" value={ stats ? stats.conversations : '—' } />
				<StatCard tone="green" icon={ <MessageSquare className="h-5 w-5" /> } label="Messages" value={ stats ? stats.messages : '—' } />
				<StatCard tone="purple" icon={ <CalendarDays className="h-5 w-5" /> } label="Today" value={ stats ? stats.today : '—' } />
				<StatCard tone="amber" icon={ <CalendarDays className="h-5 w-5" /> } label="Last 7 days" value={ stats ? stats.last7 : '—' } />
				<StatCard tone="slate" icon={ <ImageIcon className="h-5 w-5" /> } label="With images" value={ stats ? stats.withImages : '—' } />
			</div>

			{ stats && ( ( stats.intents && stats.intents.length ) || ( stats.sentiments && Object.keys( stats.sentiments ).length ) ) ? (
				<div className="grid gap-4 md:grid-cols-2">
					<div className="rounded-2xl border border-slate-200 bg-white p-4">
						<div className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">Top intents</div>
						<div className="space-y-2">
							{ ( stats.intents || [] ).map( ( it ) => {
								const max = Math.max( ...stats.intents.map( ( x ) => x.count ), 1 );
								return (
									<div key={ it.label } className="flex items-center gap-3">
										<span className="w-24 shrink-0 truncate text-sm capitalize text-slate-600">{ it.label }</span>
										<span className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
											<span className="block h-full rounded-full bg-blue-500" style={ { width: `${ Math.round( ( it.count / max ) * 100 ) }%` } } />
										</span>
										<span className="w-8 shrink-0 text-right text-sm font-semibold text-slate-700">{ it.count }</span>
									</div>
								);
							} ) }
							{ ! ( stats.intents || [] ).length ? <div className="text-sm text-slate-400">No data yet.</div> : null }
						</div>
					</div>
					<div className="rounded-2xl border border-slate-200 bg-white p-4">
						<div className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">Sentiment</div>
						<div className="flex flex-wrap gap-2">
							{ [ 'positive', 'neutral', 'negative', 'urgent' ].map( ( key ) => {
								const tones = { positive: 'bg-emerald-50 text-emerald-700', neutral: 'bg-slate-100 text-slate-600', negative: 'bg-red-50 text-red-700', urgent: 'bg-amber-50 text-amber-700' };
								const count = ( stats.sentiments && stats.sentiments[ key ] ) || 0;
								return (
									<span key={ key } className={ `rounded-xl px-3 py-2 text-sm font-semibold capitalize ${ tones[ key ] }` }>
										{ key }: { count }
									</span>
								);
							} ) }
						</div>
					</div>
				</div>
			) : null }

			{ /* Filters */ }
			<div className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4">
				<label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
					From
					<input type="date" value={ dateFrom } onChange={ ( e ) => setDateFrom( e.target.value ) } className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800" />
				</label>
				<label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
					To
					<input type="date" value={ dateTo } onChange={ ( e ) => setDateTo( e.target.value ) } className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800" />
				</label>
				<label className="flex flex-1 flex-col gap-1 text-xs font-medium text-slate-500">
					Search
					<span className="relative">
						<Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
						<input type="text" value={ search } onChange={ ( e ) => setSearch( e.target.value ) } onKeyDown={ ( e ) => e.key === 'Enter' && load() } placeholder="Message text…" className="w-full rounded-lg border border-slate-300 py-2 pr-3 text-sm text-slate-800" style={ { paddingLeft: '2.25rem' } } />
					</span>
				</label>
				<button type="button" onClick={ load } className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
					<RefreshCw className="h-4 w-4" /> Apply
				</button>
				<button type="button" onClick={ clearAll } className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100">
					<Trash2 className="h-4 w-4" /> Clear all
				</button>
			</div>

			{ /* List + transcript */ }
			<div className="grid gap-4 lg:grid-cols-2">
				<div className="rounded-2xl border border-slate-200 bg-white">
					<div className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
						Conversations { conversations.length ? `(${ conversations.length })` : '' }
					</div>
					<div className="max-h-[46vh] overflow-y-auto">
						{ loading ? (
							<div className="p-6 text-center text-sm text-slate-400">Loading…</div>
						) : conversations.length === 0 ? (
							<div className="p-6 text-center text-sm text-slate-400">No conversations yet.</div>
						) : (
							conversations.map( ( c ) => (
								<button
									key={ c.sessionId }
									type="button"
									onClick={ () => openConversation( c.sessionId ) }
									className={ `flex w-full items-center gap-3 border-b border-slate-50 px-4 py-3 text-left hover:bg-slate-50 ${ active && active.sessionId === c.sessionId ? 'bg-blue-50/60' : '' }` }
								>
									<div className="min-w-0 flex-1">
										<div className="truncate text-sm font-medium text-slate-800">{ c.firstQuestion || '(image / no text)' }</div>
										<div className="mt-0.5 flex items-center gap-2 text-xs text-slate-400">
											<span>{ fmtDate( c.lastAt ) }</span>
											<span>·</span>
											<span>{ c.messageCount } msg{ c.messageCount === 1 ? '' : 's' }</span>
											{ c.imageCount > 0 ? <span>· 📎 { c.imageCount }</span> : null }
										</div>
									</div>
									<ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
								</button>
							) )
						) }
					</div>
				</div>

				<div className="rounded-2xl border border-slate-200 bg-white">
					<div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
						<span>Transcript</span>
						{ active ? (
							<button type="button" onClick={ () => setActive( null ) } className="text-slate-400 hover:text-slate-600">
								<X className="h-4 w-4" />
							</button>
						) : null }
					</div>
					<div className="max-h-[46vh] overflow-y-auto p-4">
						{ ! active ? (
							<div className="p-6 text-center text-sm text-slate-400">Select a conversation to read it.</div>
						) : loadingDetail ? (
							<div className="p-6 text-center text-sm text-slate-400">Loading…</div>
						) : ! active.transcript || active.transcript.length === 0 ? (
							<div className="p-6 text-center text-sm text-slate-400">Empty transcript.</div>
						) : (
							<div className="space-y-4">
								{ active.transcript.map( ( row, i ) => (
									<div key={ i } className="space-y-2">
										<div className="flex justify-end">
											<div className="max-w-[85%] rounded-2xl rounded-br-sm bg-blue-600 px-3 py-2 text-sm text-white">
												{ row.question || ( row.hasImage ? '🖼️ (image attached)' : '—' ) }
											</div>
										</div>
										<div className="flex justify-start">
											<div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-slate-100 px-3 py-2 text-sm text-slate-800 whitespace-pre-wrap">
												{ row.answer }
												{ row.sources && row.sources.length ? (
													<div className="mt-2 flex flex-wrap gap-1.5">
														{ row.sources.map( ( s, si ) => (
															<a key={ si } href={ s.url } target="_blank" rel="noopener noreferrer" className="rounded-md border border-slate-300 bg-white px-2 py-0.5 text-[11px] text-blue-600 hover:border-blue-400">
																{ s.title || s.url }
															</a>
														) ) }
													</div>
												) : null }
											</div>
										</div>
										<div className="text-center text-[11px] text-slate-300">{ fmtDate( row.createdAt ) }</div>
									</div>
								) ) }
							</div>
						) }
					</div>
				</div>
			</div>
		</div>
	);
}

/* ── FAQ / conditional-button editor ───────────────────────────────── */

function FollowupRow( { value, onChange, onRemove } ) {
	return (
		<div className="rounded-lg border border-slate-200 bg-white p-3">
			<div className="flex items-center gap-2">
				<input
					type="text"
					value={ value.label }
					onChange={ ( e ) => onChange( { ...value, label: e.target.value } ) }
					placeholder="Follow-up button label (e.g. PPO plans)"
					maxLength={ 120 }
					className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm"
				/>
				<button type="button" onClick={ onRemove } className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500">
					<Trash2 className="h-4 w-4" />
				</button>
			</div>
			<textarea
				value={ value.answer }
				onChange={ ( e ) => onChange( { ...value, answer: e.target.value } ) }
				placeholder="Answer shown when this button is tapped"
				rows={ 2 }
				maxLength={ 2000 }
				className="mt-2 w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm"
			/>
		</div>
	);
}

function FaqItemCard( { item, index, onChange, onRemove } ) {
	const update = ( patch ) => onChange( { ...item, ...patch } );
	const setFollowup = ( i, val ) => {
		const next = item.followups.slice();
		next[ i ] = val;
		update( { followups: next } );
	};
	const addFollowup = () => update( { followups: [ ...item.followups, { label: '', answer: '' } ] } );
	const removeFollowup = ( i ) => update( { followups: item.followups.filter( ( _, j ) => j !== i ) } );

	return (
		<div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
			<div className="flex items-center gap-2">
				<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">{ index + 1 }</span>
				<input
					type="text"
					value={ item.label }
					onChange={ ( e ) => update( { label: e.target.value } ) }
					placeholder="Button label (e.g. Do you accept my insurance?)"
					maxLength={ 120 }
					className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium"
				/>
				<IconSelect value={ item.icon } onChange={ ( v ) => update( { icon: v } ) } className="w-40 shrink-0" />
				<button type="button" onClick={ onRemove } className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500">
					<Trash2 className="h-4 w-4" />
				</button>
			</div>
			<textarea
				value={ item.answer }
				onChange={ ( e ) => update( { answer: e.target.value } ) }
				placeholder="Answer shown when this button is tapped"
				rows={ 2 }
				maxLength={ 2000 }
				className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
			/>

			<div className="mt-3">
				<div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
					Conditional follow-up buttons
				</div>
				<div className="space-y-2">
					{ item.followups.map( ( fu, i ) => (
						<FollowupRow key={ i } value={ fu } onChange={ ( v ) => setFollowup( i, v ) } onRemove={ () => removeFollowup( i ) } />
					) ) }
				</div>
				<button type="button" onClick={ addFollowup } className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:border-blue-400 hover:text-blue-600">
					<Plus className="h-3.5 w-3.5" /> Add follow-up
				</button>
			</div>
		</div>
	);
}

function ActionRow( { value, index, onChange, onRemove } ) {
	const update = ( patch ) => onChange( { ...value, ...patch } );
	return (
		<div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3">
			<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-700 text-xs font-bold text-white">{ index + 1 }</span>
			<input
				type="text"
				value={ value.label }
				onChange={ ( e ) => update( { label: e.target.value } ) }
				placeholder="Button (e.g. Book a visit)"
				maxLength={ 60 }
				className="min-w-[9rem] flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
			/>
			<IconSelect value={ value.icon } onChange={ ( v ) => update( { icon: v } ) } className="w-36 shrink-0" />
			<input
				type="text"
				value={ value.url }
				onChange={ ( e ) => update( { url: e.target.value } ) }
				placeholder={ 'Link (tel:713…, https://…, #form, or paste a form shortcode like [nexulesuite_form id="5"])' }
				className="min-w-[11rem] flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
			/>
			<button type="button" onClick={ onRemove } className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500">
				<Trash2 className="h-4 w-4" />
			</button>
		</div>
	);
}

export function FaqTab() {
	const { restUrl, nonce } = getRest();
	const [ loading, setLoading ] = useState( true );
	const [ saving, setSaving ] = useState( false );
	const [ saved, setSaved ] = useState( false );
	const [ faqEnabled, setFaqEnabled ] = useState( false );
	const [ logChats, setLogChats ] = useState( false );
	const [ items, setItems ] = useState( [] );
	const [ actions, setActions ] = useState( [] );
	const [ disclaimer, setDisclaimer ] = useState( '' );
	const [ triggerLabel, setTriggerLabel ] = useState( '' );
	const [ leadEnabled, setLeadEnabled ] = useState( false );
	const [ leadOffer, setLeadOffer ] = useState( '' );
	const [ leadRecipient, setLeadRecipient ] = useState( '' );
	const [ wooCards, setWooCards ] = useState( true );
	const [ wooActive, setWooActive ] = useState( false );
	const [ extraUrls, setExtraUrls ] = useState( '' );
	const [ contactShortcode, setContactShortcode ] = useState( '' );
	const [ examples, setExamples ] = useState( '' );

	useEffect( () => {
		( async () => {
			try {
				const res = await fetch( `${ restUrl }${ API }/ai/faq`, { headers: { 'X-WP-Nonce': nonce } } );
				const json = await res.json();
				if ( json && json.success ) {
					setFaqEnabled( !! json.data.enabled );
					setLogChats( !! json.data.logChats );
					setItems( ( json.data.items || [] ).map( ( it ) => ( { ...it, icon: it.icon || '', followups: it.followups || [] } ) ) );
					setActions( ( json.data.actions || [] ).map( ( a ) => ( { label: a.label || '', icon: a.icon || '', url: a.url || '' } ) ) );
					setDisclaimer( json.data.disclaimer || '' );
					setTriggerLabel( json.data.triggerLabel || '' );
					setLeadEnabled( !! json.data.leadEnabled );
					setLeadOffer( json.data.leadOffer || '' );
					setLeadRecipient( json.data.leadRecipient || '' );
					setWooCards( json.data.wooCards !== false );
					setWooActive( !! json.data.wooActive );
					setExtraUrls( json.data.extraUrls || '' );
					setContactShortcode( json.data.contactShortcode || '' );
					setExamples( json.data.examples || '' );
				}
			} catch ( e ) {
				// no-op
			} finally {
				setLoading( false );
			}
		} )();
	}, [ restUrl, nonce ] );

	const addItem = () => setItems( [ ...items, { id: '', label: '', answer: '', icon: '', followups: [] } ] );
	const setItem = ( i, val ) => {
		const next = items.slice();
		next[ i ] = val;
		setItems( next );
	};
	const removeItem = ( i ) => setItems( items.filter( ( _, j ) => j !== i ) );

	const addAction = () => setActions( [ ...actions, { label: '', icon: '', url: '' } ] );
	const setAction = ( i, val ) => {
		const next = actions.slice();
		next[ i ] = val;
		setActions( next );
	};
	const removeAction = ( i ) => setActions( actions.filter( ( _, j ) => j !== i ) );

	const save = async () => {
		setSaving( true );
		setSaved( false );
		try {
			const res = await fetch( `${ restUrl }${ API }/ai/faq`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': nonce },
				body: JSON.stringify( { enabled: faqEnabled, logChats, items, actions, disclaimer, triggerLabel, leadEnabled, leadOffer, leadRecipient, wooCards, extraUrls, contactShortcode, examples } ),
			} );
			const json = await res.json();
			if ( json && json.success ) {
				setItems( ( json.data.items || [] ).map( ( it ) => ( { ...it, icon: it.icon || '', followups: it.followups || [] } ) ) );
				setActions( ( json.data.actions || [] ).map( ( a ) => ( { label: a.label || '', icon: a.icon || '', url: a.url || '' } ) ) );
				setSaved( true );
				setTimeout( () => setSaved( false ), 2500 );
			}
		} catch ( e ) {
			// no-op
		} finally {
			setSaving( false );
		}
	};

	if ( loading ) {
		return <div className="p-6 text-center text-sm text-slate-400">Loading…</div>;
	}

	return (
		<div className="space-y-5">
			<div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
				<Toggle
					checked={ logChats }
					onChange={ setLogChats }
					label="Store chat transcripts"
					hint="Save visitor↔assistant conversations so they appear in the Reports tab. On a medical site, add a consent notice first."
				/>
				<Toggle
					checked={ faqEnabled }
					onChange={ setFaqEnabled }
					label="Show quick-reply buttons"
					hint="Display the buttons below at the top of the AI chat. Requires the AI Chatbot to be enabled in Settings."
				/>
			</div>

			<div className="space-y-3">
				{ items.length === 0 ? (
					<div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-400">
						No buttons yet. Add your first quick-reply question below.
					</div>
				) : (
					items.map( ( item, i ) => (
						<FaqItemCard key={ i } item={ item } index={ i } onChange={ ( v ) => setItem( i, v ) } onRemove={ () => removeItem( i ) } />
					) )
				) }
			</div>

			<button type="button" onClick={ addItem } className="inline-flex items-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-500 hover:border-blue-400 hover:text-blue-600">
				<Plus className="h-4 w-4" /> Add quick-reply button
			</button>

			{ /* Quick-action buttons (Book / Call / Directions) */ }
			<div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
				<div>
					<h3 className="text-sm font-bold text-slate-800">Quick-action buttons</h3>
					<p className="mt-0.5 text-xs text-slate-500">
						Shown under the suggestions (like “Book a visit / Call / Directions”). The first button is highlighted.
						Link can be <span className="font-mono">tel:713…</span>, <span className="font-mono">https://…</span>. Links: <span className="font-mono">#lead</span> (built-in contact form), <span className="font-mono">#form</span> (the single shortcode below), or <span className="font-mono">tel:</span> / <span className="font-mono">mailto:</span> / <span className="font-mono">https://</span>.
						To open a specific form inside the chat, paste its shortcode straight into the link box — e.g. <span className="font-mono">[nexulesuite_form id=&quot;5&quot;]</span>. Each button can open a different form this way.
					</p>
				</div>
				<div className="space-y-2">
					{ actions.map( ( a, i ) => (
						<ActionRow key={ i } value={ a } index={ i } onChange={ ( v ) => setAction( i, v ) } onRemove={ () => removeAction( i ) } />
					) ) }
				</div>
				<button type="button" onClick={ addAction } className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:border-blue-400 hover:text-blue-600">
					<Plus className="h-3.5 w-3.5" /> Add action button
				</button>
			</div>

			{ /* Contact form shortcode for the #form action */ }
			<div className="rounded-2xl border border-slate-200 bg-white p-4">
				<h3 className="text-sm font-bold text-slate-800">Contact form for “Get in Touch” (<span className="font-mono">#form</span>)</h3>
				<p className="mt-0.5 text-xs text-slate-500">
					Paste any form shortcode — your Form Builder form <span className="font-mono">[nexulesuite_form id="…"]</span>, Contact Form 7,
					WPForms, Fluent Forms, etc. An action button with link <span className="font-mono">#form</span> opens it right inside the chat.
					Leave blank and use <span className="font-mono">#lead</span> for the built-in name/email/phone form instead.
				</p>
				<input
					type="text"
					value={ contactShortcode }
					onChange={ ( e ) => setContactShortcode( e.target.value ) }
					placeholder={ '[nexulesuite_form id="123"]' }
					className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs"
				/>
			</div>

			{ /* Few-shot response examples */ }
			<div className="rounded-2xl border border-slate-200 bg-white p-4">
				<h3 className="text-sm font-bold text-slate-800">Response examples (few-shot)</h3>
				<p className="mt-0.5 text-xs text-slate-500">
					Teach the AI your tone and how short/precise to answer. A built-in universal set (greetings, thanks,
					pricing, booking, handoff…) is always active — add your own business examples here to make replies
					more on-brand. Format: <span className="font-mono">User:</span> / <span className="font-mono">Assistant:</span> blocks separated by <span className="font-mono">---</span>.
				</p>
				<textarea
					value={ examples }
					onChange={ ( e ) => setExamples( e.target.value ) }
					rows={ 8 }
					placeholder={ 'User: Do you deliver on weekends?\nAssistant: Yes — we deliver Saturday and Sunday, 9 AM–5 PM.\n---\nUser: Where are you located?\nAssistant: We\'re at 12 Main Street, Dhaka. Would you like directions?' }
					className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs leading-relaxed"
				/>
			</div>

			{ /* Disclaimer + trigger label */ }
			<div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
				<label className="flex flex-col gap-1.5">
					<span className="text-sm font-semibold text-slate-800">Footer disclaimer</span>
					<span className="text-xs text-slate-500">Small print under the chat input (e.g. “Not medical advice. For emergencies call 911.”).</span>
					<textarea
						value={ disclaimer }
						onChange={ ( e ) => setDisclaimer( e.target.value ) }
						rows={ 2 }
						maxLength={ 300 }
						placeholder="Not medical advice. For emergencies call 911."
						className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
					/>
				</label>
				<label className="flex flex-col gap-1.5">
					<span className="text-sm font-semibold text-slate-800">Launcher label</span>
					<span className="text-xs text-slate-500">Text shown on the floating bubble (e.g. “Ask us”). Leave blank for icon-only.</span>
					<input
						type="text"
						value={ triggerLabel }
						onChange={ ( e ) => setTriggerLabel( e.target.value ) }
						maxLength={ 40 }
						placeholder="Ask us"
						className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
					/>
				</label>
			</div>

			{ /* Smart lead capture / human handoff */ }
			<div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
				<Toggle
					checked={ leadEnabled }
					onChange={ setLeadEnabled }
					label="Smart lead capture & human handoff"
					hint="When the AI can't confidently answer, it offers to take the visitor's contact details, saves a lead, and emails you. Also triggered by an action button with link #lead."
				/>
				{ leadEnabled ? (
					<div className="grid gap-4 sm:grid-cols-2">
						<label className="flex flex-col gap-1.5">
							<span className="text-sm font-semibold text-slate-800">Offer message</span>
							<span className="text-xs text-slate-500">Shown when the bot offers to collect the visitor's contact details.</span>
							<input
								type="text"
								value={ leadOffer }
								onChange={ ( e ) => setLeadOffer( e.target.value ) }
								maxLength={ 200 }
								placeholder="Would you like our team to reach out to you?"
								className="mt-auto w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
							/>
						</label>
						<label className="flex flex-col gap-1.5">
							<span className="text-sm font-semibold text-slate-800">Notify email</span>
							<span className="text-xs text-slate-500">Where new leads are sent. Blank = site admin email.</span>
							<input
								type="email"
								value={ leadRecipient }
								onChange={ ( e ) => setLeadRecipient( e.target.value ) }
								placeholder="you@example.com"
								className="mt-auto w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
							/>
						</label>
					</div>
				) : null }
			</div>

			{ /* Extra knowledge sources */ }
			<div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
				<h3 className="text-sm font-bold text-slate-800">Extra pages to learn from (URLs)</h3>
				<p className="text-xs text-slate-500">
					Your whole WordPress site (pages, posts, products) is already learned when you click <b>Train Now</b> in
					Settings → AI Chatbot — you don’t need to paste it here. Use this only for <b>external</b> pages
					(a booking/Calendly page, a Google Maps link, a partner site). One URL per line; re-run <b>Train Now</b> after saving.
				</p>
				<textarea
					value={ extraUrls }
					onChange={ ( e ) => setExtraUrls( e.target.value ) }
					rows={ 3 }
					placeholder={ 'https://calendly.com/your-clinic\nhttps://maps.google.com/…' }
					className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs"
				/>
			</div>

			{ wooActive ? (
				<div className="rounded-2xl border border-slate-200 bg-white p-4">
					<Toggle
						checked={ wooCards }
						onChange={ setWooCards }
						label="WooCommerce product cards"
						hint="When a visitor asks about products/pricing, show matching product cards (image, price, sale badge) under the answer. Run Train Now so products are indexed."
					/>
				</div>
			) : null }

			<div className="sticky bottom-0 -mx-4 flex items-center justify-end gap-3 border-t border-slate-200 bg-white/90 px-4 py-3 backdrop-blur md:-mx-8 md:px-8">
				{ saved ? <span className="text-sm font-medium text-emerald-600">Saved ✓</span> : null }
				<button type="button" onClick={ save } disabled={ saving } className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60">
					<Save className="h-4 w-4" /> { saving ? 'Saving…' : 'Save configuration' }
				</button>
			</div>
		</div>
	);
}

/* ── Auto-Setup (business auto-adaptation) ─────────────────────────── */

function iconEmoji( key ) {
	const found = FAQ_ICONS.find( ( ic ) => ic.key === key );
	return found && found.key ? found.label.split( ' ' )[ 0 ] : '•';
}

export function AutoSetupTab() {
	const { restUrl, nonce } = getRest();
	const [ analyzing, setAnalyzing ] = useState( false );
	const [ applying, setApplying ] = useState( false );
	const [ error, setError ] = useState( '' );
	const [ done, setDone ] = useState( '' );
	const [ result, setResult ] = useState( null );
	const [ systemPrompt, setSystemPrompt ] = useState( '' );
	const [ applyPrompt, setApplyPrompt ] = useState( true );
	const [ applyQuestions, setApplyQuestions ] = useState( true );
	const [ applyActions, setApplyActions ] = useState( true );

	const analyze = async () => {
		setAnalyzing( true );
		setError( '' );
		setDone( '' );
		setResult( null );
		try {
			const res = await fetch( `${ restUrl }${ API }/ai/autogen`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': nonce },
			} );
			const json = await res.json();
			if ( json && json.success ) {
				setResult( json.data );
				setSystemPrompt( json.data.systemPrompt || '' );
			} else {
				setError( ( json && json.message ) || 'Analysis failed. Is the AI server running?' );
			}
		} catch ( e ) {
			setError( 'Could not reach the server. Check the AI server URL in Settings.' );
		} finally {
			setAnalyzing( false );
		}
	};

	const apply = async () => {
		if ( ! result ) return;
		setApplying( true );
		setDone( '' );
		try {
			const res = await fetch( `${ restUrl }${ API }/ai/autogen/apply`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': nonce },
				body: JSON.stringify( {
					applyPrompt,
					applyQuestions,
					applyActions,
					systemPrompt,
					questions: result.questions || [],
					actions: result.actions || [],
				} ),
			} );
			const json = await res.json();
			if ( json && json.success ) {
				const parts = json.data.applied || [];
				setDone( parts.length ? `Applied: ${ parts.join( ', ' ) }. Open “FAQ & Buttons” to review.` : 'Nothing selected to apply.' );
			} else {
				setError( ( json && json.message ) || 'Apply failed.' );
			}
		} catch ( e ) {
			setError( 'Apply request failed.' );
		} finally {
			setApplying( false );
		}
	};

	return (
		<div className="space-y-5">
			<div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-violet-50 to-blue-50 p-5">
				<div className="flex items-start gap-3">
					<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white">
						<Sparkles className="h-5 w-5" />
					</div>
					<div className="min-w-0">
						<h3 className="text-base font-bold text-slate-900">Auto-adapt to your business</h3>
						<p className="mt-1 text-sm text-slate-600">
							The AI reads your trained website content, detects what your business does, and proposes a tailored
							assistant persona, suggested questions, and quick-action buttons. Review, then apply.
						</p>
						<p className="mt-2 text-xs text-slate-500">
							Tip: run <b>Train Now</b> (Settings → AI Chatbot) first so the analysis reflects your latest content.
						</p>
					</div>
				</div>
				<button
					type="button"
					onClick={ analyze }
					disabled={ analyzing }
					className="mt-4 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-violet-700 disabled:opacity-60"
				>
					<Sparkles className="h-4 w-4" /> { analyzing ? 'Analyzing your website…' : 'Analyze my website' }
				</button>
			</div>

			{ error ? (
				<div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{ error }</div>
			) : null }

			{ result ? (
				<div className="space-y-5">
					<div className="rounded-2xl border border-slate-200 bg-white p-4">
						<div className="flex flex-wrap items-center gap-2">
							<span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700">
								{ result.businessType || 'Business' }
							</span>
							<span className="text-sm text-slate-600">{ result.summary }</span>
						</div>
					</div>

					<label className="block rounded-2xl border border-slate-200 bg-white p-4">
						<div className="flex items-center gap-2">
							<input type="checkbox" checked={ applyPrompt } onChange={ ( e ) => setApplyPrompt( e.target.checked ) } className="h-4 w-4" />
							<span className="text-sm font-semibold text-slate-800">Assistant persona (system prompt)</span>
						</div>
						<textarea
							value={ systemPrompt }
							onChange={ ( e ) => setSystemPrompt( e.target.value ) }
							rows={ 4 }
							className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
						/>
					</label>

					<div className="rounded-2xl border border-slate-200 bg-white p-4">
						<div className="flex items-center gap-2">
							<input type="checkbox" checked={ applyQuestions } onChange={ ( e ) => setApplyQuestions( e.target.checked ) } className="h-4 w-4" />
							<span className="text-sm font-semibold text-slate-800">Suggested questions ({ ( result.questions || [] ).length })</span>
						</div>
						<p className="mt-1 text-xs text-slate-500">These appear as tappable chips; tapping one asks the AI directly.</p>
						<div className="mt-3 flex flex-wrap gap-2">
							{ ( result.questions || [] ).map( ( q, i ) => (
								<span key={ i } className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700">
									<span>{ iconEmoji( q.icon ) }</span> { q.label }
								</span>
							) ) }
						</div>
					</div>

					{ ( result.actions || [] ).length ? (
						<div className="rounded-2xl border border-slate-200 bg-white p-4">
							<div className="flex items-center gap-2">
								<input type="checkbox" checked={ applyActions } onChange={ ( e ) => setApplyActions( e.target.checked ) } className="h-4 w-4" />
								<span className="text-sm font-semibold text-slate-800">Quick-action buttons ({ result.actions.length })</span>
							</div>
							<p className="mt-1 text-xs text-slate-500">Add the links (tel:, https:, #form) afterwards in “FAQ & Buttons”.</p>
							<div className="mt-3 flex flex-wrap gap-2">
								{ result.actions.map( ( a, i ) => (
									<span key={ i } className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700">
										<span>{ iconEmoji( a.icon ) }</span> { a.label }
									</span>
								) ) }
							</div>
						</div>
					) : null }

					{ done ? (
						<div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{ done }</div>
					) : null }

					<button
						type="button"
						onClick={ apply }
						disabled={ applying }
						className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
					>
						<Save className="h-4 w-4" /> { applying ? 'Applying…' : 'Apply selected' }
					</button>
				</div>
			) : null }
		</div>
	);
}

