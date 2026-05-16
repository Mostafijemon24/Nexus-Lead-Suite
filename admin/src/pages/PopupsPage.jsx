import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
	AlignCenter,
	AlignLeft,
	AlignRight,
	Clock,
	Code,
	Eye,
	Info,
	Laptop,
	Layers,
	Layout,
	Palette,
	Plus,
	Save,
	Smartphone,
	Sparkles,
	Tablet,
	Target,
	Trash2,
	X,
} from 'lucide-react';

export function PopupsPage() {

	const makeDefaultPopup = () => ( {
		id: `pop-${ Date.now() }`,
		name: 'New Popup',
		eventName: `event-${ Date.now() }`,
		heading: '<h2 style="margin:0; font-weight:500;">New Campaign Heading</h2>',
		headingEditMode: 'visual',
		subHeading: 'Sub-text here',
		textAlign: 'left',
		content: '<p>Content...</p>',
		style: {
			buttonColor: '#2563eb',
			buttonWidth: '100',
			headingTextColor: '#ffffff',
			headingBgColor: '#1e3a8a',
			bodyBgColor: '#ffffff',
			width: '600',
			radius: '16',
			padding: '30',
			closeIconSize: '20',
			closeIconColor: '#ffffff',
			closeIconBg: '#ff4444',
		},
		logic: [ { id: 'L1', trigger: 'scroll', delay: '0', scrollPercentage: '0' } ],
	} );

	const [ popups, setPopups ] = useState( [] );
	const [ activeId, setActiveId ] = useState( null );
	const [ previewPopup, setPreviewPopup ] = useState( null );
	const [ previewDevice, setPreviewDevice ] = useState( 'desktop' );
	const [ status, setStatus ] = useState( { loading: true, saving: false, error: '' } );
	const [ savedSnapshot, setSavedSnapshot ] = useState( [] );
	const visualHeadingRef = useRef( null );

	const activePopup = useMemo( () => popups.find( ( p ) => p.id === activeId ) || popups[ 0 ], [ popups, activeId ] );
	const isDirty = useMemo( () => JSON.stringify( popups ) !== JSON.stringify( savedSnapshot ), [ popups, savedSnapshot ] );

	useEffect( () => {
		let cancelled = false;
		async function boot() {
			setStatus( { loading: true, saving: false, error: '' } );
			try {
				const base = window?.nexusLsAdmin?.restUrl || '/wp-json/';
				const res = await fetch( `${ base }nexus-lead-suite/v1/popups`, {
					method: 'GET',
					credentials: 'same-origin',
					headers: { 'X-WP-Nonce': window?.nexusLsAdmin?.nonce || '' },
				} );
				const json = await res.json();
				const loaded = Array.isArray( json?.data?.popups ) ? json.data.popups : [];

				const initial = loaded.length > 0 ? loaded : [
					{
						id: 'pop-1',
						name: 'Appointment/Consultation!',
						eventName: 'voss-pop',
						heading: '<h2 style="margin:0; font-weight:500;">Book Your <span style="color:#ffcc00;">Consultation</span></h2>',
						headingEditMode: 'visual',
						subHeading: 'GET EXPERT ADVICE WITHIN 24 HOURS.',
						textAlign: 'left',
						content: '<p>[forminator_form id="244624"]</p>',
						style: {
							buttonColor: '#2563eb',
							buttonWidth: '100',
							headingTextColor: '#ffffff',
							headingBgColor: '#1e3a8a',
							bodyBgColor: '#ffffff',
							width: '600',
							radius: '16',
							padding: '30',
							closeIconSize: '20',
							closeIconColor: '#ffffff',
							closeIconBg: '#ff4444',
						},
						logic: [ { id: 'L1', trigger: 'scroll', delay: '0', scrollPercentage: '0' } ],
					},
				];

				if ( cancelled ) return;
				setPopups( initial );
				setSavedSnapshot( initial );
				setActiveId( initial[ 0 ]?.id || null );
				setStatus( { loading: false, saving: false, error: '' } );
			} catch ( e ) {
				if ( cancelled ) return;
				const fallback = [ makeDefaultPopup() ];
				setPopups( fallback );
				setSavedSnapshot( fallback );
				setActiveId( fallback[ 0 ]?.id || null );
				setStatus( { loading: false, saving: false, error: e?.message || 'Failed to load popups.' } );
			}
		}
		boot();
		return () => {
			cancelled = true;
		};
	}, [] );

	const updateActive = ( patch ) => {
		if ( ! activePopup ) return;
		setPopups( ( prev ) => prev.map( ( p ) => ( p.id === activePopup.id ? { ...p, ...patch } : p ) ) );
	};

	const updateStyle = ( patch ) => {
		if ( ! activePopup ) return;
		setPopups( ( prev ) =>
			prev.map( ( p ) => ( p.id === activePopup.id ? { ...p, style: { ...p.style, ...patch } } : p ) )
		);
	};

	const updateRule = ( rid, patch ) => {
		if ( ! activePopup ) return;
		const next = ( activePopup.logic || [] ).map( ( r ) => ( r.id === rid ? { ...r, ...patch } : r ) );
		updateActive( { logic: next } );
	};

	const addRule = () => {
		if ( ! activePopup ) return;
		const next = [ ...( activePopup.logic || [] ), { id: `L-${ Date.now() }`, trigger: 'timer', delay: '5', scrollPercentage: '0' } ];
		updateActive( { logic: next } );
	};

	const removeRule = ( rid ) => {
		if ( ! activePopup ) return;
		if ( ( activePopup.logic || [] ).length <= 1 ) return;
		updateActive( { logic: activePopup.logic.filter( ( r ) => r.id !== rid ) } );
	};

	const addPopup = () => {
		const next = makeDefaultPopup();
		setPopups( ( prev ) => [ ...prev, next ] );
		setActiveId( next.id );
	};

	const deletePopup = ( id ) => {
		setPopups( ( prev ) => {
			if ( prev.length <= 1 ) return prev;
			const filtered = prev.filter( ( p ) => p.id !== id );
			setActiveId( ( cur ) => ( cur === id ? filtered[ 0 ]?.id || null : cur ) );
			return filtered;
		} );
	};

	const syncVisualHeading = () => {
		if ( ! visualHeadingRef.current ) return;
		updateActive( { heading: visualHeadingRef.current.innerHTML } );
	};

	const discard = () => {
		setPopups( savedSnapshot );
		setActiveId( savedSnapshot[ 0 ]?.id || null );
	};

	const saveAll = async () => {
		setStatus( ( s ) => ( { ...s, saving: true, error: '' } ) );
		try {
			const base = window?.nexusLsAdmin?.restUrl || '/wp-json/';
			const res = await fetch( `${ base }nexus-lead-suite/v1/popups`, {
				method: 'POST',
				credentials: 'same-origin',
				headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': window?.nexusLsAdmin?.nonce || '' },
				body: JSON.stringify( { popups } ),
			} );
			const json = await res.json();
			if ( ! res.ok || json?.success !== true ) {
				throw new Error( json?.message || 'Save failed.' );
			}
			const saved = Array.isArray( json?.data?.popups ) ? json.data.popups : popups;
			setPopups( saved );
			setSavedSnapshot( saved );
			setStatus( { loading: false, saving: false, error: '' } );
		} catch ( e ) {
			setStatus( ( s ) => ( { ...s, saving: false, error: e?.message || 'Save failed.' } ) );
		}
	};

	const safePreviewHtml = ( html ) => {
		if ( typeof html !== 'string' ) return '';
		return html.replace(
			/\[forminator_form.*?\]/g,
			'<div style="background:#f8fafc; border:2px dashed #cbd5e1; height:100px; display:flex; align-items:center; justify-content:center; border-radius:12px; color:#94a3b8; font-weight:600; font-size:11px;">FORM INTEGRATION PREVIEW</div>'
		);
	};

	return (
		<div className="min-h-screen bg-slate-100 px-4 py-4 md:px-8 md:py-8 font-medium text-slate-900 leading-relaxed">
			<div className="w-full bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[92vh]">
				{/* Header */}
				<header className="px-6 py-6 border-b border-slate-100 bg-white flex justify-between items-center shrink-0">
					<div className="flex items-center gap-4">
						<div className="bg-blue-600 p-3 rounded-2xl text-white shadow-xl">
							<Sparkles size={ 24 } />
						</div>
						<div>
							<h1 className="text-xl font-bold tracking-tight">Popups</h1>
							<p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Advanced Automation Logic</p>
						</div>
					</div>
					<button
						type="button"
						onClick={ addPopup }
						className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-2xl transition-all text-sm font-semibold shadow-xl active:scale-95"
					>
						<Plus size={ 18 } /> Add New PopUp
					</button>
				</header>

				<div className="flex flex-1 overflow-hidden">
					{/* Sidebar */}
					<aside className="w-72 border-r border-slate-100 bg-slate-50 flex flex-col shrink-0">
						<div className="p-4 border-b border-slate-100 flex items-center justify-between">
							<h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PopUp Layers</h2>
							<Layers size={ 14 } className="text-slate-300" />
						</div>
						<div className="flex-1 overflow-y-auto p-3 space-y-2">
							{ status.loading ? <div className="px-2 py-3 text-sm text-slate-500">Loading…</div> : null }
							{ popups.map( ( pop ) => {
								const isActive = pop.id === activeId;
								return (
									<div
										key={ pop.id }
										onClick={ () => setActiveId( pop.id ) }
										className={ [
											'group relative px-4 py-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between',
											isActive ? 'bg-white border-blue-500 shadow-lg ring-2 ring-blue-500/5' : 'bg-transparent border-transparent hover:bg-slate-200/50',
										].join( ' ' ) }
									>
										<div className="flex items-center gap-3 truncate">
											<Target size={ 16 } className={ isActive ? 'text-blue-600' : 'text-slate-400' } />
											<span className="text-sm font-semibold truncate">{ pop.name || 'Popup' }</span>
										</div>
										<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={ ( e ) => e.stopPropagation() }>
											<button type="button" onClick={ () => setPreviewPopup( pop ) } className="p-1 text-slate-400 hover:text-blue-600" aria-label="Preview">
												<Eye size={ 14 } />
											</button>
											<button
												type="button"
												onClick={ () => deletePopup( pop.id ) }
												className="p-1 text-slate-400 hover:text-red-500"
												aria-label="Delete"
											>
												<Trash2 size={ 14 } />
											</button>
										</div>
									</div>
								);
							} ) }
						</div>
					</aside>

					{/* Settings Canvas */}
					<main className="flex-1 overflow-y-auto bg-white p-10">
						{ status.error ? (
							<div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{ status.error }</div>
						) : null }

						<div className="max-w-5xl mx-auto space-y-12 pb-20">
							{/* Identity */}
							<section className="space-y-6">
								<div className="flex items-center gap-2 text-blue-600 border-b border-slate-100 pb-3">
									<Layout size={ 18 } />
									<h3 className="font-bold text-slate-800">Identity & Core Structure</h3>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
									<div className="space-y-2">
										<label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Internal Name</label>
										<input
											type="text"
											value={ activePopup?.name || '' }
											onChange={ ( e ) => updateActive( { name: e.target.value } ) }
											className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
										/>
									</div>

									<div className="space-y-2">
										<label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Event Name (Unique ID)</label>
										<input
											type="text"
											value={ activePopup?.eventName || '' }
											onChange={ ( e ) => updateActive( { eventName: e.target.value } ) }
											className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
										/>
									</div>

									<div className="space-y-2">
										<label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Text Alignment</label>
										<div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
											{ [
												{ id: 'left', Icon: AlignLeft },
												{ id: 'center', Icon: AlignCenter },
												{ id: 'right', Icon: AlignRight },
											].map( ( a ) => {
												const selected = ( activePopup?.textAlign || 'left' ) === a.id;
												return (
													<button
														key={ a.id }
														type="button"
														onClick={ () => updateActive( { textAlign: a.id } ) }
														className={ [
															'flex-1 flex justify-center py-2 rounded-xl transition-all',
															selected ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600',
														].join( ' ' ) }
														aria-label={ a.id }
													>
														<a.Icon size={ 18 } />
													</button>
												);
											} ) }
										</div>
									</div>

									{/* Heading editor */}
									<div className="space-y-2 md:col-span-2 lg:col-span-3">
										<div className="flex items-center justify-between mb-1">
											<label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Main Heading Editor</label>
											<div className="flex bg-slate-100 p-1 rounded-lg">
												{ [
													{ id: 'visual', label: 'Visual', Icon: Sparkles },
													{ id: 'code', label: 'Code', Icon: Code },
												].map( ( m ) => {
													const selected = ( activePopup?.headingEditMode || 'visual' ) === m.id;
													return (
														<button
															key={ m.id }
															type="button"
															onClick={ () => updateActive( { headingEditMode: m.id } ) }
															className={ [
																'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold transition-all',
																selected ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700',
															].join( ' ' ) }
														>
															<m.Icon size={ 12 } />
															{ m.label }
														</button>
													);
												} ) }
											</div>
										</div>

										{ ( activePopup?.headingEditMode || 'visual' ) === 'visual' ? (
											<div
												ref={ visualHeadingRef }
												contentEditable
												onInput={ syncVisualHeading }
												onBlur={ syncVisualHeading }
												className="w-full min-h-[120px] px-6 py-6 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col justify-center transition-all outline-none focus:border-blue-300"
												style={ {
													backgroundColor: activePopup?.style?.headingBgColor || '#1e3a8a',
													color: activePopup?.style?.headingTextColor || '#ffffff',
													textAlign: activePopup?.textAlign || 'left',
												} }
												dangerouslySetInnerHTML={ { __html: activePopup?.heading || '' } }
											/>
										) : (
											<textarea
												value={ activePopup?.heading || '' }
												onChange={ ( e ) => updateActive( { heading: e.target.value } ) }
												className="w-full h-32 px-4 py-4 bg-slate-900 text-blue-300 font-mono border border-slate-800 rounded-2xl text-xs focus:ring-2 focus:ring-blue-500 outline-none resize-none"
												style={ { textAlign: activePopup?.textAlign || 'left' } }
												placeholder="Add heading HTML..."
											/>
										) }
										<p className="text-[9px] text-slate-400 italic mt-1 font-medium">Visual mode lets you edit inline; Code mode stores HTML.</p>
									</div>

									<div className="space-y-2 md:col-span-2 lg:col-span-3">
										<label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Sub Heading Text</label>
										<input
											type="text"
											value={ activePopup?.subHeading || '' }
											onChange={ ( e ) => updateActive( { subHeading: e.target.value } ) }
											className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
											style={ { textAlign: activePopup?.textAlign || 'left' } }
										/>
									</div>
								</div>
							</section>

							{/* Visual Styling */}
							<section className="space-y-8">
								<div className="flex items-center gap-2 text-purple-600 border-b border-slate-100 pb-3">
									<Palette size={ 18 } />
									<h3 className="font-bold text-slate-800">Visual Styling & Area Controls</h3>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
									{ [
										{ key: 'headingBgColor', label: 'Header', badge: 'Area 1' },
										{ key: 'bodyBgColor', label: 'Body', badge: 'Area 2' },
										{ key: 'buttonColor', label: 'Button' },
										{ key: 'closeIconColor', label: 'Icon Color' },
										{ key: 'closeIconBg', label: 'Icon BG' },
									].map( ( f ) => (
										<div key={ f.key } className="space-y-2">
											<label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
												{ f.label }
												{ f.badge ? <span className="bg-blue-100 text-blue-600 px-1 rounded">{ f.badge }</span> : null }
											</label>
											<div className="flex items-center gap-2">
												<input
													type="color"
													value={ activePopup?.style?.[ f.key ] || '#ffffff' }
													onChange={ ( e ) => updateStyle( { [ f.key ]: e.target.value } ) }
													className="h-10 w-10 border-none cursor-pointer rounded-lg shrink-0"
												/>
												<input
													type="text"
													value={ activePopup?.style?.[ f.key ] || '' }
													onChange={ ( e ) => updateStyle( { [ f.key ]: e.target.value } ) }
													className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-mono uppercase focus:ring-2 focus:ring-blue-500 outline-none"
												/>
											</div>
										</div>
									) ) }
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
									<div className="space-y-6">
										<div className="space-y-1">
											<div className="flex justify-between mb-1">
												<label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Button Width (%)</label>
												<span className="text-xs font-bold text-blue-600">{ activePopup?.style?.buttonWidth }%</span>
											</div>
											<input
												type="range"
												min="10"
												max="100"
												value={ activePopup?.style?.buttonWidth || 100 }
												onChange={ ( e ) => updateStyle( { buttonWidth: e.target.value } ) }
												className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
											/>
										</div>
										<div className="space-y-1">
											<div className="flex justify-between mb-1">
												<label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Close Icon Size (px)</label>
												<span className="text-xs font-bold text-blue-600">{ activePopup?.style?.closeIconSize }px</span>
											</div>
											<input
												type="range"
												min="12"
												max="40"
												value={ activePopup?.style?.closeIconSize || 20 }
												onChange={ ( e ) => updateStyle( { closeIconSize: e.target.value } ) }
												className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
											/>
										</div>
									</div>

									<div className="space-y-6">
										<div className="space-y-1">
											<div className="flex justify-between mb-1">
												<label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Popup Radius (px)</label>
												<span className="text-xs font-bold text-blue-600">{ activePopup?.style?.radius }px</span>
											</div>
											<input
												type="range"
												min="0"
												max="50"
												value={ activePopup?.style?.radius || 16 }
												onChange={ ( e ) => updateStyle( { radius: e.target.value } ) }
												className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
											/>
										</div>
										<div className="p-4 bg-white/50 border border-slate-200 rounded-2xl flex items-center gap-3">
											<Info size={ 16 } className="text-blue-500 shrink-0" />
											<p className="text-[10px] text-slate-400 font-medium leading-tight">Preview uses a blurred backdrop for an immersive simulator feel.</p>
										</div>
									</div>
								</div>
							</section>

							{/* Logic */}
							<section className="space-y-8 bg-indigo-50/20 p-8 rounded-[2.5rem] border border-indigo-100">
								<div className="flex items-center justify-between border-b border-indigo-100 pb-4">
									<div className="flex items-center gap-2 text-indigo-600">
										<Clock size={ 18 } />
										<h3 className="font-bold text-slate-800">Advanced Behavior & Logic</h3>
									</div>
									<button
										type="button"
										onClick={ addRule }
										className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-xl text-[11px] font-bold shadow-xl shadow-indigo-100 transition-all hover:bg-indigo-700 active:scale-95"
									>
										<Plus size={ 14 } /> Add New Trigger
									</button>
								</div>

								<div className="space-y-4">
									{ ( activePopup?.logic || [] ).map( ( rule, idx ) => (
										<div key={ rule.id } className="p-6 bg-white rounded-[2rem] border border-indigo-50 shadow-sm relative group">
											<div className="flex flex-col md:flex-row items-end gap-6">
												<div className="flex-1 space-y-2 w-full">
													<label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Trigger Type { idx + 1 }</label>
													<select
														value={ rule.trigger }
														onChange={ ( e ) => updateRule( rule.id, { trigger: e.target.value } ) }
														className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
													>
														<option value="click">Manual Click</option>
														<option value="timer">Time Delay</option>
														<option value="scroll">Scroll Percentage</option>
														<option value="exit">Exit Intent</option>
													</select>
												</div>

												{ rule.trigger === 'timer' ? (
													<div className="flex-1 space-y-2 w-full">
														<label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Delay Time (Seconds)</label>
														<input
															type="number"
															value={ rule.delay }
															onChange={ ( e ) => updateRule( rule.id, { delay: e.target.value } ) }
															className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
														/>
													</div>
												) : null }

												{ rule.trigger === 'scroll' ? (
													<div className="flex-1 space-y-2 w-full">
														<label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Scroll Depth (%)</label>
														<input
															type="number"
															value={ rule.scrollPercentage }
															onChange={ ( e ) => updateRule( rule.id, { scrollPercentage: e.target.value } ) }
															className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
														/>
													</div>
												) : null }

												<div className="flex items-center gap-2">
													{ ( activePopup?.logic || [] ).length > 1 ? (
														<button
															type="button"
															onClick={ () => removeRule( rule.id ) }
															className="p-3 text-red-400 hover:bg-red-50 rounded-2xl transition-colors border border-transparent hover:border-red-100"
															aria-label="Remove trigger"
														>
															<Trash2 size={ 18 } />
														</button>
													) : null }
												</div>
											</div>
										</div>
									) ) }
								</div>
							</section>

							{/* Content */}
							<section className="space-y-6">
								<div className="flex items-center gap-2 text-slate-800 border-b border-slate-100 pb-3">
									<Code size={ 18 } />
									<h3 className="font-bold tracking-tight">Popup Body (HTML / Shortcode)</h3>
								</div>
								<textarea
									value={ activePopup?.content || '' }
									onChange={ ( e ) => updateActive( { content: e.target.value } ) }
									className="w-full h-[350px] px-8 py-8 bg-slate-900 border border-slate-800 rounded-[2.5rem] text-sm font-mono text-blue-300 leading-relaxed outline-none focus:ring-2 focus:ring-blue-500/20"
								/>
							</section>
						</div>
					</main>
				</div>

				{/* Footer */}
				<footer className="px-12 py-6 border-t border-slate-100 bg-white flex justify-between items-center shrink-0">
					<div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
						<span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
						System Ready & Synchronized
					</div>
					<div className="flex gap-4">
						<button
							type="button"
							onClick={ discard }
							disabled={ ! isDirty || status.saving }
							className="px-6 py-2.5 text-slate-400 hover:text-slate-600 font-bold text-sm disabled:opacity-50"
						>
							Discard
						</button>
						<button
							type="button"
							onClick={ saveAll }
							disabled={ status.saving || ! isDirty }
							className="flex items-center gap-3 px-12 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-sm shadow-xl transition-all active:scale-95 disabled:opacity-60"
						>
							<Save size={ 18 } /> { status.saving ? 'Saving…' : 'Save Popup Configuration' }
						</button>
					</div>
				</footer>
			</div>

			{/* Simulator Modal */}
			{ previewPopup && (
				<div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 md:p-12 animate-in fade-in duration-300 backdrop-blur-md bg-slate-900/60">
					<div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-[1200px] h-full flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">
						<div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
							<div className="flex items-center gap-3">
								<Eye className="text-blue-600" size={ 20 } />
								<h4 className="font-bold text-slate-800 text-lg">Pop-Up Simulator</h4>
							</div>
							<div className="flex bg-slate-200/50 p-1 rounded-xl">
								{ [
									{ id: 'desktop', Icon: Laptop },
									{ id: 'tablet', Icon: Tablet },
									{ id: 'mobile', Icon: Smartphone },
								].map( ( d ) => {
									const selected = previewDevice === d.id;
									return (
										<button
											key={ d.id }
											type="button"
											onClick={ () => setPreviewDevice( d.id ) }
											className={ [ 'p-2 rounded-lg transition-all', selected ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600' ].join( ' ' ) }
											aria-label={ d.id }
										>
											<d.Icon size={ 16 } />
										</button>
									);
								} ) }
							</div>
							<button
								type="button"
								onClick={ () => setPreviewPopup( null ) }
								className="p-3 bg-white border border-slate-200 hover:bg-rose-50 text-slate-500 rounded-full transition-all"
								aria-label="Close"
							>
								<X size={ 20 } />
							</button>
						</div>

						<div className="flex-1 bg-slate-200/20 p-12 overflow-y-auto flex items-center justify-center">
							<div
								className={ [
									'transition-all duration-500 ease-out shadow-2xl overflow-hidden relative',
									previewDevice === 'mobile' ? 'max-w-[320px]' : previewDevice === 'tablet' ? 'max-w-[500px]' : '',
								].join( ' ' ) }
								style={ {
									backgroundColor: previewPopup.style.bodyBgColor,
									width: previewDevice === 'desktop' ? `${ previewPopup.style.width }px` : '100%',
									borderRadius: `${ previewPopup.style.radius }px`,
								} }
							>
								<button
									type="button"
									className="absolute top-4 right-4 flex items-center justify-center transition-transform hover:rotate-90"
									style={ {
										width: `${ parseInt( previewPopup.style.closeIconSize, 10 ) + 12 }px`,
										height: `${ parseInt( previewPopup.style.closeIconSize, 10 ) + 12 }px`,
										backgroundColor: previewPopup.style.closeIconBg,
										color: previewPopup.style.closeIconColor,
										borderRadius: '9999px',
										zIndex: 10,
									} }
								>
									<X size={ previewPopup.style.closeIconSize } />
								</button>

								<div
									style={ {
										backgroundColor: previewPopup.style.headingBgColor,
										color: previewPopup.style.headingTextColor,
										padding: `${ previewPopup.style.padding }px`,
										textAlign: previewPopup.textAlign,
									} }
								>
									<div className="font-bold prose prose-invert max-w-none" dangerouslySetInnerHTML={ { __html: previewPopup.heading } } />
									<p className="text-xs opacity-80 font-semibold mt-1 uppercase tracking-wider">{ previewPopup.subHeading }</p>
								</div>

								<div className="p-10" style={ { backgroundColor: previewPopup.style.bodyBgColor } }>
									<div className="prose prose-slate max-w-none mb-8 font-medium" dangerouslySetInnerHTML={ { __html: safePreviewHtml( previewPopup.content ) } } />
									<div className="flex justify-center">
										<button
											type="button"
											className="py-4 text-white font-bold text-sm rounded-xl shadow-xl hover:brightness-90 transition-all active:scale-95"
											style={ { backgroundColor: previewPopup.style.buttonColor, width: `${ previewPopup.style.buttonWidth }%` } }
										>
											Complete Action
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			) }
		</div>
	);
}

