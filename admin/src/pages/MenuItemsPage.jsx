import React, { useEffect, useMemo, useState } from 'react';
import {
	ArrowRight,
	Bell,
	Calendar,
	Code,
	Copy,
	Download,
	Eye,
	GripVertical,
	Mail,
	MapPin,
	MessageSquare,
	MousePointerClick,
	Palette,
	Phone,
	Plus,
	Settings2,
	Target,
	Trash2,
	Type,
	X,
} from 'lucide-react';

export function MenuItemsPage() {

	const iconLibrary = {
		none: null,
		call: <Phone size={ 16 } />,
		mail: <Mail size={ 16 } />,
		message: <MessageSquare size={ 16 } />,
		location: <MapPin size={ 16 } />,
		appointment: <Calendar size={ 16 } />,
		download: <Download size={ 16 } />,
		popup: <Target size={ 16 } />,
		cta: <MousePointerClick size={ 16 } />,
		event: <Bell size={ 16 } />,
		arrow: <ArrowRight size={ 16 } />,
	};

	const EMPTY_BUTTON = () => ( {
		id: `btn-${ Date.now() }`,
		label: 'New Action Button',
		url: '',
		eventName: '',
		icon: 'none',
		displayMode: 'inline',
		cssId: '',
		cssClass: '',
		style: {
			bg: '#10b981',
			text: '#ffffff',
			paddingVertical: '12',
			paddingHorizontal: '24',
			radius: '8',
			hoverEffect: 'glow',
		},
	} );

	const [ buttons, setButtons ] = useState( [] );
	const [ activeTab, setActiveTab ] = useState( null );
	const [ popOutBtn, setPopOutBtn ] = useState( null );
	const [ status, setStatus ] = useState( { loading: true, saving: false, error: '' } );
	const [ savedSnapshot, setSavedSnapshot ] = useState( [] );
	const [ dragId, setDragId ] = useState( null );
	const [ dropId, setDropId ] = useState( null );

	const activeBtn = useMemo( () => buttons.find( ( b ) => b.id === activeTab ) || buttons[ 0 ], [ buttons, activeTab ] );

	const isDirty = useMemo( () => JSON.stringify( buttons ) !== JSON.stringify( savedSnapshot ), [ buttons, savedSnapshot ] );

	useEffect( () => {
		let cancelled = false;

		async function boot() {
			setStatus( { loading: true, saving: false, error: '' } );
			try {
				const base = window?.nexusLsAdmin?.restUrl || '/wp-json/';
				const res = await fetch( `${ base }nexus-lead-suite/v1/menu-items`, {
					method: 'GET',
					credentials: 'same-origin',
					headers: {
						'X-WP-Nonce': window?.nexusLsAdmin?.nonce || '',
					},
				} );
				const json = await res.json();
				const items = json?.data?.items;

				const initial = Array.isArray( items ) && items.length > 0 ? items : [
					{
						id: 'btn-1',
						label: 'Book Appointment',
						url: '#',
						eventName: 'appointment-modal',
						icon: 'appointment',
						displayMode: 'inline',
						cssId: 'btn-book-now',
						cssClass: 'custom-cta',
						style: {
							bg: '#2563eb',
							text: '#ffffff',
							paddingVertical: '14',
							paddingHorizontal: '28',
							radius: '10',
							hoverEffect: 'lift',
						},
					},
				];

				if ( cancelled ) {
					return;
				}
				setButtons( initial );
				setSavedSnapshot( initial );
				setActiveTab( initial[ 0 ]?.id || null );
				setStatus( { loading: false, saving: false, error: '' } );
			} catch ( e ) {
				if ( cancelled ) {
					return;
				}
				const fallback = [ EMPTY_BUTTON() ];
				setButtons( fallback );
				setSavedSnapshot( fallback );
				setActiveTab( null );
				setStatus( { loading: false, saving: false, error: e?.message || 'Failed to load menu items.' } );
			}
		}

		boot();
		return () => {
			cancelled = true;
		};
	}, [] );

	const updateBtn = ( id, field, value ) => {
		setButtons( ( prev ) => prev.map( ( b ) => ( b.id === id ? { ...b, [ field ]: value } : b ) ) );
	};

	const updateStyle = ( id, field, value ) => {
		setButtons( ( prev ) =>
			prev.map( ( b ) => ( b.id === id ? { ...b, style: { ...b.style, [ field ]: value } } : b ) )
		);
	};

	const addNewButton = () => {
		const newBtn = EMPTY_BUTTON();
		setButtons( ( prev ) => [ ...prev, newBtn ] );
		setActiveTab( newBtn.id );
	};

	const duplicateButton = ( id ) => {
		const source = buttons.find( ( b ) => b.id === id );
		if ( ! source ) {
			return;
		}

		const newId = `btn-${ Date.now() }`;
		const copy = {
			...source,
			id: newId,
			label: source.label ? `${ source.label } (Copy)` : 'New Action Button (Copy)',
			style: { ...source.style },
			cssId: '',
		};

		setButtons( ( prev ) => {
			const idx = prev.findIndex( ( b ) => b.id === id );
			if ( idx === -1 ) {
				return prev;
			}
			return [ ...prev.slice( 0, idx + 1 ), copy, ...prev.slice( idx + 1 ) ];
		} );
		setActiveTab( newId );
	};

	const removeButton = ( id ) => {
		setButtons( ( prev ) => {
			if ( prev.length <= 1 ) {
				return prev;
			}
			const filtered = prev.filter( ( b ) => b.id !== id );
			const nextActive = filtered[ 0 ]?.id || null;
			setActiveTab( ( cur ) => ( cur === id ? nextActive : cur ) );
			return filtered;
		} );
	};

	const reorderButtons = ( fromId, toId ) => {
		if ( ! fromId || ! toId || fromId === toId ) {
			return;
		}
		setButtons( ( prev ) => {
			const fromIdx = prev.findIndex( ( b ) => b.id === fromId );
			const toIdx = prev.findIndex( ( b ) => b.id === toId );
			if ( fromIdx === -1 || toIdx === -1 ) {
				return prev;
			}
			const next = [ ...prev ];
			const [ moved ] = next.splice( fromIdx, 1 );
			next.splice( toIdx, 0, moved );
			return next;
		} );
	};

	const getHoverClass = ( effect ) => {
		switch ( effect ) {
			case 'lift':
				return 'hover:-translate-y-1 hover:shadow-xl';
			case 'glow':
				return 'hover:shadow-[0_0_25px_rgba(59,130,246,0.7)]';
			case 'shake':
				return 'hover:animate-bounce';
			case 'scale':
				return 'hover:scale-105';
			case 'rotate':
				return 'hover:rotate-3';
			case 'darken':
				return 'hover:brightness-90';
			default:
				return '';
		}
	};

	const ButtonRender = ( { btn, isPopout = false } ) => (
		<a
			href={ btn.url }
			id={ btn.cssId }
			className={ `
        flex items-center justify-center gap-3 transition-all duration-300 font-bold select-none
        ${ btn.displayMode === 'block' && ! isPopout ? 'w-full' : 'w-auto' }
        ${ getHoverClass( btn.style.hoverEffect ) }
        ${ btn.cssClass }
      ` }
			style={ {
				backgroundColor: btn.style.bg,
				color: btn.style.text,
				padding: `${ btn.style.paddingVertical }px ${ btn.style.paddingHorizontal }px`,
				borderRadius: `${ btn.style.radius }px`,
				textDecoration: 'none',
			} }
			onClick={ ( e ) => e.preventDefault() }
		>
			{ iconLibrary[ btn.icon || 'none' ] }
			<span>{ btn.label || 'Button' }</span>
		</a>
	);

	const saveAll = async () => {
		setStatus( ( s ) => ( { ...s, saving: true, error: '' } ) );
		try {
			const base = window?.nexusLsAdmin?.restUrl || '/wp-json/';
			const res = await fetch( `${ base }nexus-lead-suite/v1/menu-items`, {
				method: 'POST',
				credentials: 'same-origin',
				headers: {
					'Content-Type': 'application/json',
					'X-WP-Nonce': window?.nexusLsAdmin?.nonce || '',
				},
				body: JSON.stringify( { items: buttons } ),
			} );
			const json = await res.json();
			if ( ! res.ok || json?.success !== true ) {
				throw new Error( json?.message || 'Save failed.' );
			}

			const saved = Array.isArray( json?.data?.items ) ? json.data.items : buttons;
			setButtons( saved );
			setSavedSnapshot( saved );
			setStatus( { loading: false, saving: false, error: '' } );
		} catch ( e ) {
			setStatus( ( s ) => ( { ...s, saving: false, error: e?.message || 'Save failed.' } ) );
		}
	};

	const discard = () => {
		setButtons( savedSnapshot );
		setActiveTab( savedSnapshot[ 0 ]?.id || null );
	};

	return (
		<div className="min-h-screen bg-[#f6f7fb] px-8 py-6 font-sans text-slate-900">
			<div className="w-full bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-3.25rem)]">
				{/* Top Header */}
				<div className="p-5 border-b border-slate-200 bg-white flex justify-between items-center shrink-0">
					<div className="flex items-center gap-3">
						<div className="bg-blue-600 p-2 rounded-lg text-white">
							<Settings2 size={ 20 } />
						</div>
						<div>
							<h1 className="text-lg font-bold">Menu Items</h1>
							<p className="text-xs text-slate-400">Configure triggers, styles and actions</p>
						</div>
					</div>
					<button
						type="button"
						onClick={ addNewButton }
						className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-all text-sm font-semibold shadow-lg shadow-blue-100"
					>
						<Plus size={ 18 } /> Add New Button
					</button>
				</div>

				<div className="flex flex-1 overflow-hidden">
					{/* Left Sidebar: Button List */}
					<div className="w-72 border-r border-slate-200 bg-slate-50 flex flex-col shrink-0">
						<div className="p-4 border-b border-slate-200">
							<h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Button Layers</h2>
							<p className="mt-1 text-[10px] text-slate-400">Drag to reorder</p>
						</div>
						<div className="flex-1 overflow-y-auto p-3 space-y-2">
							{ status.loading ? (
								<div className="text-sm text-slate-500 px-2 py-3">Loading…</div>
							) : (
								buttons.map( ( btn ) => (
									<div
										key={ btn.id }
										onClick={ () => setActiveTab( btn.id ) }
										onDragOver={ ( e ) => {
											e.preventDefault();
											setDropId( btn.id );
										} }
										onDragLeave={ () => setDropId( null ) }
										onDrop={ ( e ) => {
											e.preventDefault();
											e.stopPropagation();
											reorderButtons( dragId, btn.id );
											setDragId( null );
											setDropId( null );
										} }
										className={ `group p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
											activeTab === btn.id
												? 'bg-white border-blue-500 shadow-md ring-2 ring-blue-500/10'
												: 'bg-transparent border-transparent hover:bg-slate-200/50'
										} ${ dropId === btn.id && dragId !== btn.id ? 'ring-2 ring-blue-300 border-blue-200' : '' } ${
											dragId === btn.id ? 'opacity-50' : ''
										}` }
									>
										<div className="flex min-w-0 flex-1 items-center gap-2 truncate">
											<button
												type="button"
												draggable
												onDragStart={ ( e ) => {
													setDragId( btn.id );
													e.dataTransfer.effectAllowed = 'move';
												} }
												onDragEnd={ () => {
													setDragId( null );
													setDropId( null );
												} }
												onClick={ ( e ) => e.stopPropagation() }
												className="shrink-0 rounded p-1 text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing"
												title="Drag to reorder"
												aria-label="Drag to reorder"
											>
												<GripVertical size={ 16 } />
											</button>
											<div className={ activeTab === btn.id ? 'text-blue-600 shrink-0' : 'text-slate-400 shrink-0' }>
												{ iconLibrary[ btn.icon || 'none' ] }
											</div>
											<span
												className={ `text-sm font-semibold truncate ${
													activeTab === btn.id ? 'text-slate-900' : 'text-slate-500'
												}` }
											>
												{ btn.label }
											</span>
										</div>
										<div className="flex items-center gap-1" onClick={ ( e ) => e.stopPropagation() }>
											<button
												type="button"
												onClick={ () => setPopOutBtn( btn ) }
												className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
												title="Quick Preview"
											>
												<Eye size={ 14 } />
											</button>
											<button
												type="button"
												onClick={ () => duplicateButton( btn.id ) }
												className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
												title="Duplicate"
											>
												<Copy size={ 14 } />
											</button>
											{ buttons.length > 1 && (
												<button
													type="button"
													onClick={ () => removeButton( btn.id ) }
													className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
												>
													<Trash2 size={ 14 } />
												</button>
											) }
										</div>
									</div>
								) )
							) }
						</div>
					</div>

					{/* Middle: Settings Panel */}
					<div className="flex-1 overflow-y-auto p-8 bg-white">
						{ status.error ? (
							<div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
								{ status.error }
							</div>
						) : null }

						<div className="w-full space-y-10 pb-10">
							{/* Section: Content */}
							<section className="space-y-6">
								<div className="flex items-center gap-2 text-blue-600 border-b border-slate-100 pb-2">
									<Type size={ 18 } />
									<h3 className="font-bold text-slate-800">Content & Action</h3>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div className="space-y-2">
										<label className="text-xs font-bold text-slate-500 uppercase">Button Text</label>
										<input
											type="text"
											value={ activeBtn?.label || '' }
											onChange={ ( e ) => updateBtn( activeBtn.id, 'label', e.target.value ) }
											className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
										/>
									</div>
									<div className="space-y-2">
										<label className="text-xs font-bold text-slate-500 uppercase">Action Icon</label>
										<select
											value={ activeBtn?.icon || 'none' }
											onChange={ ( e ) => updateBtn( activeBtn.id, 'icon', e.target.value ) }
											className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
										>
											<option value="none">No Icon</option>
											<option value="call">Call (Phone)</option>
											<option value="mail">Email (Envelope)</option>
											<option value="message">Message (Chat)</option>
											<option value="location">Location (Map)</option>
											<option value="appointment">Appointment (Calendar)</option>
											<option value="download">Download</option>
											<option value="popup">Trigger Pop-up</option>
											<option value="cta">Action (Pointer)</option>
											<option value="event">Event (Bell)</option>
											<option value="arrow">Next (Arrow)</option>
										</select>
									</div>
									<div className="space-y-2">
										<label className="text-xs font-bold text-slate-500 uppercase">Link URL</label>
										<input
											type="text"
											value={ activeBtn?.url || '' }
											placeholder="https://example.com"
											onChange={ ( e ) => updateBtn( activeBtn.id, 'url', e.target.value ) }
											className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
										/>
									</div>
									<div className="space-y-2">
										<label className="text-xs font-bold text-slate-500 uppercase">Event / Popup ID</label>
										<input
											type="text"
											value={ activeBtn?.eventName || '' }
											placeholder="e.g. contact-form-id"
											onChange={ ( e ) => updateBtn( activeBtn.id, 'eventName', e.target.value ) }
											className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono outline-none focus:ring-2 focus:ring-blue-500"
										/>
									</div>
								</div>
							</section>

							{/* Section: Design */}
							<section className="space-y-6">
								<div className="flex items-center gap-2 text-purple-600 border-b border-slate-100 pb-2">
									<Palette size={ 18 } />
									<h3 className="font-bold text-slate-800">Visual Styling</h3>
								</div>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
									<div className="space-y-2">
										<label className="text-xs font-bold text-slate-500 uppercase">Background</label>
										<div className="flex items-center gap-3">
											<input
												type="color"
												value={ activeBtn?.style?.bg || '#2563eb' }
												onChange={ ( e ) => updateStyle( activeBtn.id, 'bg', e.target.value ) }
												className="h-10 w-10 border-none bg-transparent cursor-pointer"
											/>
											<input
												type="text"
												value={ activeBtn?.style?.bg || '' }
												onChange={ ( e ) => updateStyle( activeBtn.id, 'bg', e.target.value ) }
												className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs font-mono"
											/>
										</div>
									</div>
									<div className="space-y-2">
										<label className="text-xs font-bold text-slate-500 uppercase">Text Color</label>
										<div className="flex items-center gap-3">
											<input
												type="color"
												value={ activeBtn?.style?.text || '#ffffff' }
												onChange={ ( e ) => updateStyle( activeBtn.id, 'text', e.target.value ) }
												className="h-10 w-10 border-none bg-transparent cursor-pointer"
											/>
											<input
												type="text"
												value={ activeBtn?.style?.text || '' }
												onChange={ ( e ) => updateStyle( activeBtn.id, 'text', e.target.value ) }
												className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs font-mono"
											/>
										</div>
									</div>
									<div className="space-y-2">
										<label className="text-xs font-bold text-slate-500 uppercase">Display Mode</label>
										<select
											value={ activeBtn?.displayMode || 'inline' }
											onChange={ ( e ) => updateBtn( activeBtn.id, 'displayMode', e.target.value ) }
											className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
										>
											<option value="inline">Inline (Auto)</option>
											<option value="block">Full Width (100%)</option>
										</select>
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
									<div className="space-y-4">
										<div className="space-y-1">
											<div className="flex justify-between items-center">
												<label className="text-xs font-bold text-slate-500 uppercase">Vertical Padding</label>
												<span className="text-xs font-mono text-blue-600">{ activeBtn?.style?.paddingVertical }px</span>
											</div>
											<input
												type="range"
												min="4"
												max="40"
												value={ activeBtn?.style?.paddingVertical || 12 }
												onChange={ ( e ) => updateStyle( activeBtn.id, 'paddingVertical', e.target.value ) }
												className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
											/>
										</div>
										<div className="space-y-1">
											<div className="flex justify-between items-center">
												<label className="text-xs font-bold text-slate-500 uppercase">Horizontal Padding</label>
												<span className="text-xs font-mono text-blue-600">{ activeBtn?.style?.paddingHorizontal }px</span>
											</div>
											<input
												type="range"
												min="10"
												max="80"
												value={ activeBtn?.style?.paddingHorizontal || 24 }
												onChange={ ( e ) => updateStyle( activeBtn.id, 'paddingHorizontal', e.target.value ) }
												className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
											/>
										</div>
									</div>
									<div className="space-y-4">
										<div className="space-y-1">
											<div className="flex justify-between items-center">
												<label className="text-xs font-bold text-slate-500 uppercase">Border Radius</label>
												<span className="text-xs font-mono text-blue-600">{ activeBtn?.style?.radius }px</span>
											</div>
											<input
												type="range"
												min="0"
												max="50"
												value={ activeBtn?.style?.radius || 8 }
												onChange={ ( e ) => updateStyle( activeBtn.id, 'radius', e.target.value ) }
												className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
											/>
										</div>
										<div className="space-y-2">
											<label className="text-xs font-bold text-slate-500 uppercase">Hover Animation</label>
											<select
												value={ activeBtn?.style?.hoverEffect || 'none' }
												onChange={ ( e ) => updateStyle( activeBtn.id, 'hoverEffect', e.target.value ) }
												className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
											>
												<option value="none">Simple</option>
												<option value="lift">Lift Up</option>
												<option value="scale">Scale Pulse</option>
												<option value="glow">Outer Glow</option>
												<option value="shake">Wobble/Shake</option>
												<option value="rotate">Slight Rotate</option>
												<option value="darken">Color Shift</option>
											</select>
										</div>
									</div>
								</div>
							</section>

							{/* Section: Advanced */}
							<section className="space-y-6">
								<div className="flex items-center gap-2 text-slate-600 border-b border-slate-100 pb-2">
									<Code size={ 18 } />
									<h3 className="font-bold text-slate-800">Advanced Attributes</h3>
								</div>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div className="space-y-2">
										<label className="text-xs font-bold text-slate-500 uppercase">Custom CSS ID</label>
										<input
											type="text"
											value={ activeBtn?.cssId || '' }
											onChange={ ( e ) => updateBtn( activeBtn.id, 'cssId', e.target.value ) }
											className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
										/>
									</div>
									<div className="space-y-2">
										<label className="text-xs font-bold text-slate-500 uppercase">Custom CSS Classes</label>
										<input
											type="text"
											value={ activeBtn?.cssClass || '' }
											onChange={ ( e ) => updateBtn( activeBtn.id, 'cssClass', e.target.value ) }
											className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
										/>
									</div>
								</div>
							</section>

							{/* Debug Info */}
							<div className="mt-10 p-4 bg-slate-900 rounded-2xl border border-slate-800">
								<div className="text-[10px] text-slate-500 uppercase font-bold mb-3 tracking-widest">Active Button Schema</div>
								<div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px] text-blue-400 font-mono">
									<div className="bg-white/5 p-2 rounded">ID: { activeBtn?.cssId || 'None' }</div>
									<div className="bg-white/5 p-2 rounded">Event: { activeBtn?.eventName || 'None' }</div>
									<div className="bg-white/5 p-2 rounded">Hover: { activeBtn?.style?.hoverEffect }</div>
									<div className="bg-white/5 p-2 rounded">Icon: { activeBtn?.icon }</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Footer Actions */}
				<div className="p-5 border-t border-slate-200 bg-white flex justify-end gap-3 px-10 shrink-0">
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
						onClick={ saveAll }
						disabled={ status.saving || ! isDirty }
						className="px-10 py-2.5 bg-slate-900 hover:bg-black text-white font-bold rounded-xl text-sm shadow-xl transition-all active:scale-95 disabled:opacity-60"
					>
						{ status.saving ? 'Saving…' : 'Save All Buttons' }
					</button>
				</div>
			</div>

			{/* Pop-out Modal Preview */}
			{ popOutBtn && (
				<div
					className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-slate-900/45 backdrop-blur-md animate-in fade-in duration-200"
					role="presentation"
					onClick={ () => setPopOutBtn( null ) }
				>
					<div
						className="bg-white rounded-3xl shadow-[0_30px_80px_rgba(2,6,23,0.35)] w-full max-w-lg overflow-hidden border border-slate-100 ring-1 ring-slate-200/60 animate-in zoom-in-95 duration-200"
						role="dialog"
						aria-modal="true"
						onClick={ ( e ) => e.stopPropagation() }
					>
						<div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
							<div className="flex items-center gap-2">
								<Eye className="text-blue-600" size={ 18 } />
								<h4 className="font-bold text-slate-800">Quick Preview: { popOutBtn.label }</h4>
							</div>
							<button
								type="button"
								onClick={ () => setPopOutBtn( null ) }
								className="p-2 hover:bg-slate-100 rounded-full transition-colors"
							>
								<X size={ 20 } />
							</button>
						</div>
						<div className="p-12 flex flex-col items-center justify-center gap-8 bg-slate-50/60 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px]">
							<ButtonRender btn={ popOutBtn } isPopout={ true } />
							<div className="text-center">
								<p className="text-xs text-slate-400 italic">This is how your button looks in isolation.</p>
							</div>
						</div>
						<div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-center">
							<button
								type="button"
								onClick={ () => setPopOutBtn( null ) }
								className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
							>
								Close Preview
							</button>
						</div>
					</div>
				</div>
			) }
		</div>
	);
}

