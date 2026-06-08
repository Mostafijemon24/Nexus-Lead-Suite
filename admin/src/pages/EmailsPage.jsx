import React, { useEffect, useMemo, useState } from 'react';
import {
	Activity,
	Calendar,
	Check,
	Code,
	Copy,
	Database,
	Eye,
	Globe,
	Hash,
	Layout,
	Layers,
	Mail,
	MapPin,
	MousePointer2,
	Plus,
	Save,
	Smartphone,
	Terminal,
	Trash2,
	User,
	UserPlus,
	X,
} from 'lucide-react';

function copyText( text ) {
	if ( navigator?.clipboard?.writeText ) {
		navigator.clipboard.writeText( text );
	}
}

function getPluginRestUrl( route ) {
	const base = ( window?.nexusLsAdmin?.restUrl || '/wp-json/' ).replace( /\/?$/, '/' );
	const path = String( route || '' ).replace( /^\//, '' );
	return `${ base }${ path }`;
}

function encodeUtf8Base64( value ) {
	const bytes = new TextEncoder().encode( String( value ?? '' ) );
	let binary = '';
	bytes.forEach( ( byte ) => {
		binary += String.fromCharCode( byte );
	} );
	return btoa( binary );
}

async function parsePluginRestJson( res ) {
	const text = await res.text();
	const trimmed = text.trim();
	if ( trimmed.startsWith( '<' ) ) {
		const hint =
			res.status === 403 || res.status === 406
				? 'The server security layer blocked this save (HTML email content). Try again or ask your host to allow REST POST to wp-json.'
				: `The server returned an HTML page instead of JSON (HTTP ${ res.status }). Check that WordPress REST API and permalinks are working.`;
		throw new Error( hint );
	}
	try {
		return trimmed ? JSON.parse( text ) : {};
	} catch {
		throw new Error( 'Invalid response from server while saving email templates.' );
	}
}

function makeTemplate() {
	const now = Date.now();
	const uuid = window?.crypto?.randomUUID ? window.crypto.randomUUID() : `uuid-${ now }`;
	return {
		id: `template-${ now }`,
		name: 'Untitled Template',
		uuid,
		recipients: [],
		subject: 'Notification from {siteName}',
		content: '<html><body><h1>Notification</h1><p>Triggered by {btnName}</p></body></html>',
	};
}

const DEFAULT_HTML = `<html>
<head>
  <style>
    body { font-family: 'Inter', sans-serif; background-color: #f9fafb; color: #111827; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb; }
    .header { background: #2563eb; padding: 30px; color: white; text-align: center; }
    .content { padding: 40px; }
    .footer { padding: 20px; background: #f3f4f6; text-align: center; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>Notification</h1></div>
    <div class="content">
      <p>Hello,</p>
      <p>A user named <strong>{userName}</strong> ({userEmail}) has interacted with <strong>{btnName}</strong> on your site.</p>
      <hr/>
      <p><strong>Details:</strong></p>
      <ul>
        <li>IP: {ipAddress}</li>
        <li>Page: {pageUrl}</li>
      </ul>
    </div>
    <div class="footer">Sent via Smart Trigger Automation</div>
  </div>
</body>
</html>`;

const TAGS = [
	{ label: 'Button Name', val: '{btnName}', Icon: MousePointer2 },
	{ label: 'Event ID', val: '{eventId}', Icon: Activity },
	{ label: 'Date/Time', val: '{dateTime}', Icon: Calendar },
	{ label: 'User Name', val: '{userName}', Icon: User },
	{ label: 'User Email', val: '{userEmail}', Icon: Mail },
	{ label: 'IP Address', val: '{ipAddress}', Icon: Globe },
	{ label: 'Location', val: '{userLocation}', Icon: MapPin },
	{ label: 'Site Name', val: '{siteName}', Icon: Layout },
	{ label: 'Site URL', val: '{siteUrl}', Icon: Globe },
	{ label: 'Page URL', val: '{pageUrl}', Icon: Code },
	{ label: 'Form Name', val: '{formName}', Icon: Terminal },
	{ label: 'Reference', val: '{reference}', Icon: Hash },
	{ label: 'Step No', val: '{stepNo}', Icon: Layers },
].sort( ( a, b ) => a.label.localeCompare( b.label ) );

export function EmailsPage() {
	const [ templates, setTemplates ] = useState( [] );
	const [ activeId, setActiveId ] = useState( null );
	const [ recipientInput, setRecipientInput ] = useState( '' );
	const [ copied, setCopied ] = useState( false );
	const [ codeOpen, setCodeOpen ] = useState( false );
	const [ preview, setPreview ] = useState( null );
	const [ status, setStatus ] = useState( { loading: true, saving: false, error: '' } );
	const [ savedSnapshot, setSavedSnapshot ] = useState( [] );

	const active = useMemo( () => templates.find( ( t ) => t.id === activeId ) || templates[ 0 ], [ templates, activeId ] );
	const isDirty = useMemo( () => JSON.stringify( templates ) !== JSON.stringify( savedSnapshot ), [ templates, savedSnapshot ] );

	useEffect( () => {
		let cancelled = false;
		async function boot() {
			setStatus( { loading: true, saving: false, error: '' } );
			try {
				const res = await fetch( getPluginRestUrl( 'nexus-lead-suite/v1/emails/templates' ), {
					method: 'GET',
					credentials: 'same-origin',
					headers: { 'X-WP-Nonce': window?.nexusLsAdmin?.nonce || '' },
				} );
				const json = await parsePluginRestJson( res );
				const loaded = Array.isArray( json?.data?.templates ) ? json.data.templates : [];

				const initial = loaded.length > 0 ? loaded : [
					{
						id: 'template-1',
						name: 'Welcome Series Notification',
						uuid: window?.crypto?.randomUUID ? window.crypto.randomUUID() : 'template-uuid',
						recipients: [ 'admin@example.com' ],
						subject: 'New Lead: {userName} clicked {btnName}',
						content: DEFAULT_HTML,
					},
				];

				if ( cancelled ) return;
				setTemplates( initial );
				setSavedSnapshot( initial );
				setActiveId( initial[ 0 ]?.id || null );
				setStatus( { loading: false, saving: false, error: '' } );
			} catch ( e ) {
				if ( cancelled ) return;
				const fallback = [ makeTemplate() ];
				setTemplates( fallback );
				setSavedSnapshot( fallback );
				setActiveId( fallback[ 0 ]?.id || null );
				setStatus( { loading: false, saving: false, error: e?.message || 'Failed to load templates.' } );
			}
		}
		boot();
		return () => {
			cancelled = true;
		};
	}, [] );

	const patchActive = ( patch ) => {
		if ( ! active ) return;
		setTemplates( ( prev ) => prev.map( ( t ) => ( t.id === active.id ? { ...t, ...patch } : t ) ) );
	};

	const createNew = () => {
		const tpl = makeTemplate();
		setTemplates( ( prev ) => [ ...prev, tpl ] );
		setActiveId( tpl.id );
	};

	const remove = ( id ) => {
		setTemplates( ( prev ) => {
			if ( prev.length <= 1 ) return prev;
			const next = prev.filter( ( t ) => t.id !== id );
			setActiveId( ( cur ) => ( cur === id ? next[ 0 ]?.id || null : cur ) );
			return next;
		} );
	};

	const addRecipientOnKey = ( e ) => {
		if ( e.key !== 'Enter' && e.key !== ',' ) return;
		e.preventDefault();
		const raw = recipientInput.trim().replace( ',', '' );
		if ( ! raw ) return;
		const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test( raw );
		if ( ! ok ) return;

		const current = Array.isArray( active?.recipients ) ? active.recipients : [];
		if ( current.includes( raw ) ) {
			setRecipientInput( '' );
			return;
		}
		patchActive( { recipients: [ ...current, raw ] } );
		setRecipientInput( '' );
	};

	const discard = () => {
		setTemplates( savedSnapshot );
		setActiveId( savedSnapshot[ 0 ]?.id || null );
	};

	const save = async () => {
		setStatus( ( s ) => ( { ...s, saving: true, error: '' } ) );
		try {
			const res = await fetch( getPluginRestUrl( 'nexus-lead-suite/v1/emails/templates' ), {
				method: 'POST',
				credentials: 'same-origin',
				headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': window?.nexusLsAdmin?.nonce || '' },
				body: JSON.stringify( {
					contentEncoding: 'base64',
					templates: templates.map( ( tpl ) => ( {
						...tpl,
						content: encodeUtf8Base64( tpl?.content || '' ),
					} ) ),
				} ),
			} );
			const json = await parsePluginRestJson( res );
			if ( ! res.ok || json?.success !== true ) {
				throw new Error( json?.message || 'Save failed.' );
			}
			const saved = Array.isArray( json?.data?.templates ) ? json.data.templates : templates;
			setTemplates( saved );
			setSavedSnapshot( saved );
			setStatus( { loading: false, saving: false, error: '' } );
		} catch ( e ) {
			setStatus( ( s ) => ( { ...s, saving: false, error: e?.message || 'Save failed.' } ) );
		}
	};

	const renderPreviewHtml = ( tpl ) => {
		const now = new Date().toLocaleString();
		return ( tpl?.content || '' )
			.replace(/{userName}/g, 'Demo User')
			.replace(/{userEmail}/g, 'demo@example.com')
			.replace(/{btnName}/g, 'Contact Us')
			.replace(/{dateTime}/g, now)
			.replace(/{ipAddress}/g, '192.0.2.10')
			.replace(/{pageUrl}/g, '/contact-us')
			.replace(/{siteName}/g, window?.nexusLsAdmin?.siteTitle || 'Site' )
			.replace(/{siteUrl}/g, window?.location?.origin || '' );
	};

	return (
		<div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans text-slate-900">
			<div className="w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[90vh]">
				<header className="p-6 border-b border-slate-200 bg-white flex justify-between items-center shrink-0">
					<div className="flex items-center gap-4">
						<div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg">
							<Mail size={ 24 } />
						</div>
						<div>
							<h1 className="text-xl font-bold tracking-tight">Email Automation Builder</h1>
							<p className="text-xs text-slate-400">Manage dynamic email triggers and contents</p>
						</div>
					</div>
					<button
						type="button"
						onClick={ createNew }
						className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-2xl transition-all text-sm font-bold shadow-xl active:scale-95"
					>
						<Plus size={ 18 } /> Create New Template
					</button>
				</header>

				<div className="flex flex-1 overflow-hidden">
					<aside className="w-72 border-r border-slate-100 bg-slate-50 flex flex-col shrink-0">
						<div className="p-4 border-b border-slate-100 flex items-center justify-between">
							<h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Template Layers</h2>
							<Layers size={ 14 } className="text-slate-300" />
						</div>
						<div className="flex-1 overflow-y-auto p-3 space-y-2">
							{ status.loading ? <div className="px-2 py-3 text-sm text-slate-500">Loading…</div> : null }
							{ templates.map( ( t ) => {
								const isActive = t.id === activeId;
								return (
									<div
										key={ t.id }
										onClick={ () => setActiveId( t.id ) }
										className={ [
											'group relative p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between',
											isActive ? 'bg-white border-indigo-500 shadow-md ring-2 ring-indigo-500/5' : 'bg-transparent border-transparent hover:bg-slate-200/50',
										].join( ' ' ) }
									>
										<div className="flex items-center gap-3 truncate">
											<Mail size={ 16 } className={ isActive ? 'text-indigo-600' : 'text-slate-400' } />
											<span className={ [ 'text-sm font-bold truncate', isActive ? 'text-slate-900' : 'text-slate-500' ].join( ' ' ) }>{ t.name }</span>
										</div>
										<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={ ( e ) => e.stopPropagation() }>
											<button
												type="button"
												onClick={ () => setPreview( t ) }
												className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-white shadow-sm"
												aria-label="Preview"
											>
												<Eye size={ 12 } />
											</button>
											{ templates.length > 1 ? (
												<button
													type="button"
													onClick={ () => remove( t.id ) }
													className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-white shadow-sm"
													aria-label="Delete"
												>
													<Trash2 size={ 12 } />
												</button>
											) : null }
										</div>
									</div>
								);
							} ) }
						</div>
					</aside>

					<main className="flex-1 overflow-y-auto bg-white">
						{ status.error ? (
							<div className="mx-10 mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{ status.error }</div>
						) : null }

						<div className="w-full p-10 space-y-12 pb-20">
							<div className="space-y-4">
								<div className="flex items-center justify-between group gap-6">
									<div className="flex-1">
										<label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] ml-1 mb-1 block">Template Name</label>
										<input
											type="text"
											value={ active?.name || '' }
											onChange={ ( e ) => patchActive( { name: e.target.value } ) }
											className="w-full text-xl font-bold bg-transparent border-none p-0 focus:ring-0 outline-none text-slate-900 placeholder:text-slate-200"
											placeholder="Template Name..."
										/>
									</div>
									<div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100 group-hover:shadow-sm transition-shadow">
										<Hash size={ 14 } className="text-indigo-500" />
										<span className="text-[11px] font-mono font-bold text-slate-500">{ ( active?.uuid || '' ).substring( 0, 18 ) }...</span>
										<button
											type="button"
											onClick={ () => {
												copyText( active?.uuid || '' );
												setCopied( true );
												setTimeout( () => setCopied( false ), 1800 );
											} }
											className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"
											aria-label="Copy UUID"
										>
											{ copied ? <Check size={ 14 } className="text-emerald-500" /> : <Copy size={ 14 } /> }
										</button>
									</div>
								</div>
							</div>

							<section className="space-y-4">
								<div className="flex items-center gap-2 text-indigo-600 border-b border-slate-50 pb-2">
									<UserPlus size={ 18 } />
									<h3 className="font-bold text-slate-800">Recipients Management</h3>
								</div>
								<div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-wrap gap-2 items-center min-h-[60px] focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
									{ ( active?.recipients || [] ).map( ( email, i ) => (
										<span key={ `${ email }-${ i }` } className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-indigo-700 rounded-xl text-xs font-bold shadow-sm">
											{ email }
											<button
												type="button"
												onClick={ () => patchActive( { recipients: active.recipients.filter( ( _, idx ) => idx !== i ) } ) }
												className="text-indigo-300 hover:text-red-500"
												aria-label="Remove recipient"
											>
												<X size={ 12 } />
											</button>
										</span>
									) ) }
									<input
										type="text"
										value={ recipientInput }
										onChange={ ( e ) => setRecipientInput( e.target.value ) }
										onKeyDown={ addRecipientOnKey }
										placeholder="Enter email address..."
										className="flex-1 min-w-[200px] bg-transparent border-none p-1 text-sm focus:ring-0 outline-none"
									/>
								</div>
							</section>

							<section className="space-y-4">
								<div className="flex items-center gap-2 text-blue-600 border-b border-slate-50 pb-2">
									<Terminal size={ 18 } />
									<h3 className="font-bold text-slate-800">Email Subject Line</h3>
								</div>
								<input
									type="text"
									value={ active?.subject || '' }
									onChange={ ( e ) => patchActive( { subject: e.target.value } ) }
									placeholder="Enter Subject..."
									className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-300"
								/>
							</section>

							<div className="pt-10 space-y-10 border-t border-slate-100 mt-20">
								<section className="space-y-6">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2 text-slate-500">
											<Database size={ 16 } />
											<h3 className="text-xs font-bold uppercase tracking-widest">Data Injection Library</h3>
										</div>
										<span className="text-[10px] font-bold text-slate-400">CLICK TAG TO AUTO-INSERT INTO SUBJECT</span>
									</div>
									<div className="flex flex-wrap gap-3">
										{ TAGS.map( ( tag ) => (
											<button
												key={ tag.val }
												type="button"
												onClick={ () => patchActive( { subject: ( active?.subject || '' ) + tag.val } ) }
												className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-[11px] font-bold hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all active:scale-95 shadow-sm"
											>
												<tag.Icon size={ 12 } />
												<span>{ tag.label }</span>
												<code className="text-[9px] opacity-40 ml-1">{ tag.val }</code>
											</button>
										) ) }
									</div>
								</section>

								<section className="flex flex-col items-center justify-center p-12 bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 gap-6">
									<div className="bg-white p-4 rounded-3xl shadow-xl text-slate-300">
										<Code size={ 32 } />
									</div>
									<div className="text-center">
										<h4 className="text-lg font-bold text-slate-800">HTML Source Controller</h4>
										<p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">Manage the visual structure and dynamic content mapping here.</p>
									</div>
									<button
										type="button"
										onClick={ () => setCodeOpen( true ) }
										className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-black transition-all shadow-xl active:scale-95"
									>
										<Code size={ 18 } /> Open Source Code Editor
									</button>
								</section>
							</div>
						</div>
					</main>
				</div>

				<footer className="p-6 border-t border-slate-100 bg-white flex justify-between items-center px-12 shrink-0">
					<div className="flex items-center gap-2">
						<div className="w-2 h-2 bg-green-500 rounded-full" />
						<span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Workflow Ready</span>
					</div>
					<div className="flex gap-4">
						<button
							type="button"
							onClick={ discard }
							disabled={ ! isDirty || status.saving }
							className="px-6 py-2.5 text-slate-400 hover:text-slate-600 font-bold text-sm transition-colors disabled:opacity-50"
						>
							Discard
						</button>
						<button
							type="button"
							onClick={ save }
							disabled={ status.saving || ! isDirty }
							className="flex items-center gap-2 px-10 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-sm shadow-xl shadow-indigo-100 transition-all active:scale-95 disabled:opacity-60"
						>
							<Save size={ 18 } /> { status.saving ? 'Saving…' : 'Save & Deploy Template' }
						</button>
					</div>
				</footer>
			</div>

			{ codeOpen && (
				<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-slate-900/90 backdrop-blur-xl animate-in fade-in duration-200">
					<div className="bg-[#0f172a] rounded-[2.5rem] shadow-2xl w-full max-w-6xl h-full flex flex-col overflow-hidden border border-slate-800/50 animate-in zoom-in-95">
						<div className="px-8 py-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
							<div className="flex items-center gap-4">
								<div className="bg-indigo-500/10 p-2 rounded-xl text-indigo-400">
									<Code size={ 20 } />
								</div>
								<div>
									<h4 className="text-white font-bold">HTML Code Editor</h4>
									<p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{ active?.name }</p>
								</div>
							</div>
							<button type="button" onClick={ () => setCodeOpen( false ) } className="p-3 bg-white/5 text-slate-400 hover:text-white rounded-full transition-all" aria-label="Close">
								<X size={ 24 } />
							</button>
						</div>
						<textarea
							value={ active?.content || '' }
							onChange={ ( e ) => patchActive( { content: e.target.value } ) }
							className="flex-1 bg-transparent p-10 text-indigo-300 font-mono text-sm leading-relaxed outline-none resize-none"
							spellCheck="false"
						/>
						<div className="p-6 border-t border-slate-800 flex justify-end gap-3 bg-slate-900/50">
							<button type="button" onClick={ () => setCodeOpen( false ) } className="px-8 py-3 text-slate-400 font-bold text-sm">
								Cancel
							</button>
							<button type="button" onClick={ () => setCodeOpen( false ) } className="px-10 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-xl active:scale-95">
								Apply Changes
							</button>
						</div>
					</div>
				</div>
			) }

			{ preview && (
				<div className="fixed inset-0 z-[101] flex items-center justify-center p-4 md:p-10 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
					<div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl h-full flex flex-col overflow-hidden animate-in zoom-in-95">
						<div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
							<div className="flex items-center gap-3">
								<Eye className="text-indigo-600" size={ 20 } />
								<h4 className="font-bold text-slate-800 text-lg">Render Preview</h4>
							</div>
							<button type="button" onClick={ () => setPreview( null ) } className="p-2 hover:bg-slate-200 rounded-full transition-all text-slate-400" aria-label="Close">
								<X size={ 24 } />
							</button>
						</div>
						<div className="flex-1 bg-slate-100 p-8 overflow-y-auto">
							<div className="max-w-[600px] mx-auto bg-white shadow-2xl rounded-2xl min-h-full overflow-hidden">
								<div className="p-4 bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-mono flex justify-between">
									<span>Subject: { ( preview.subject || '' ).substring( 0, 50 ) }...</span>
									<div className="flex gap-2">
										<Globe size={ 10 } /> <Smartphone size={ 10 } />
									</div>
								</div>
								<div className="p-1" dangerouslySetInnerHTML={ { __html: renderPreviewHtml( preview ) } } />
							</div>
						</div>
						<div className="p-6 border-t border-slate-100 flex justify-center">
							<button type="button" onClick={ () => setPreview( null ) } className="px-10 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm">
								Close Preview
							</button>
						</div>
					</div>
				</div>
			) }
		</div>
	);
}

