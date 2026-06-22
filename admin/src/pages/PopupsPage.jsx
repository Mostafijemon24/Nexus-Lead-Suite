import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
	Code,
	Eye,
	Laptop,
	Layers,
	Plus,
	Save,
	Smartphone,
	Sparkles,
	Tablet,
	Target,
	Trash2,
	X,
} from 'lucide-react';
import { DisplayConditionsEditor } from '../components/DisplayConditionsEditor.jsx';
import { PopupHeadingEditor } from '../components/PopupHeadingEditor.jsx';
import { SuccessModal } from '../components/NexusModal.jsx';

const ALIGN_OPTIONS = [
	{
		id: 'left',
		label: 'Align left',
		icon: (
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
				<path d="M4 6h16M4 12h10M4 18h13" />
			</svg>
		),
	},
	{
		id: 'center',
		label: 'Align center',
		icon: (
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
				<path d="M4 6h16M7 12h10M5 18h14" />
			</svg>
		),
	},
	{
		id: 'right',
		label: 'Align right',
		icon: (
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
				<path d="M4 6h16M10 12h10M7 18h13" />
			</svg>
		),
	},
];

const COLOR_FIELDS = [
	{ key: 'headingBgColor', label: 'Header', badge: 'Area 1' },
	{ key: 'bodyBgColor', label: 'Body', badge: 'Area 2' },
	{ key: 'buttonColor', label: 'Button' },
	{ key: 'closeIconColor', label: 'Icon color' },
	{ key: 'closeIconBg', label: 'Icon bg' },
];

function PopAlignSegment( { value, onChange } ) {
	const segRef = useRef( null );
	const btnRefs = useRef( {} );

	const positionGlider = useCallback( () => {
		const seg = segRef.current;
		const active = btnRefs.current[ value ];
		const glider = seg?.querySelector( '.glider' );
		if ( ! seg || ! active || ! glider ) {
			return;
		}
		glider.style.width = `${ active.offsetWidth }px`;
		glider.style.transform = `translateX(${ active.offsetLeft - 4 }px)`;
	}, [ value ] );

	useEffect( () => {
		positionGlider();
		window.addEventListener( 'resize', positionGlider );
		return () => window.removeEventListener( 'resize', positionGlider );
	}, [ positionGlider ] );

	return (
		<div className="seg icononly" ref={ segRef } role="tablist" aria-label="Text alignment">
			<span className="glider" />
			{ ALIGN_OPTIONS.map( ( opt ) => (
				<button
					key={ opt.id }
					ref={ ( el ) => {
						btnRefs.current[ opt.id ] = el;
					} }
					type="button"
					className={ value === opt.id ? 'active' : '' }
					role="tab"
					aria-label={ opt.label }
					onClick={ () => onChange( opt.id ) }
				>
					{ opt.icon }
				</button>
			) ) }
		</div>
	);
}

function PopRangeSlider( { label, value, min, max, unit, onChange } ) {
	const [ dragging, setDragging ] = useState( false );
	const numVal = parseInt( value, 10 ) || min;
	const pct = ( ( numVal - min ) / ( max - min ) ) * 100;

	return (
		<div className={ `slide-field${ dragging ? ' dragging' : '' }` }>
			<label>
				{ label } <span className="val">{ numVal }{ unit }</span>
			</label>
			<input
				type="range"
				min={ min }
				max={ max }
				value={ numVal }
				style={ { '--pct': `${ pct }%` } }
				onChange={ ( e ) => onChange( e.target.value ) }
				onPointerDown={ () => setDragging( true ) }
				onPointerUp={ () => setDragging( false ) }
				onPointerCancel={ () => setDragging( false ) }
				onBlur={ () => setDragging( false ) }
			/>
		</div>
	);
}

function PopColorField( { label, badge, colorKey, value, onChange } ) {
	const normalized = value || '#ffffff';

	const applyColor = ( next ) => {
		onChange( colorKey, next );
	};

	return (
		<div>
			<div className="clab">
				<span className="t">{ label }</span>
				{ badge ? <span className="badge">{ badge }</span> : null }
			</div>
			<div className="cgroup">
				<span className="cswatch" style={ { background: normalized } }>
					<input
						type="color"
						value={ normalized }
						onChange={ ( e ) => applyColor( e.target.value ) }
					/>
				</span>
				<input
					type="text"
					className="chex"
					value={ normalized }
					onChange={ ( e ) => {
						let next = e.target.value.trim();
						if ( next && ! next.startsWith( '#' ) ) {
							next = `#${ next }`;
						}
						applyColor( next );
					} }
				/>
			</div>
		</div>
	);
}

export function PopupsPage() {

	const makeDefaultPopup = () => ( {
		id: `pop-${ Date.now() }`,
		name: 'New Popup',
		eventName: `nexus-pop-${ Date.now() }`,
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
			headingFontSize: '20',
			bodyBgColor: '#ffffff',
			width: '600',
			radius: '16',
			padding: '30',
			closeIconSize: '20',
			closeIconColor: '#ffffff',
			closeIconBg: '#ff4444',
		},
		logic: [ { id: 'L1', trigger: 'scroll', delay: '0', scrollPercentage: '0' } ],
		conditions: { match: 'any', rules: [] },
	} );

	const [ popups, setPopups ] = useState( [] );
	const [ activeId, setActiveId ] = useState( null );
	const [ previewPopup, setPreviewPopup ] = useState( null );
	const [ previewDevice, setPreviewDevice ] = useState( 'desktop' );
	const [ status, setStatus ] = useState( { loading: true, saving: false, error: '' } );
	const [ successOpen, setSuccessOpen ] = useState( false );
	const [ savedSnapshot, setSavedSnapshot ] = useState( [] );
	const [ conditionMeta, setConditionMeta ] = useState( { postTypes: [], categories: [], tags: [] } );
	const [ contentSearch, setContentSearch ] = useState( {} );

	const activePopup = useMemo( () => popups.find( ( p ) => p.id === activeId ) || popups[ 0 ], [ popups, activeId ] );
	const isDirty = useMemo( () => JSON.stringify( popups ) !== JSON.stringify( savedSnapshot ), [ popups, savedSnapshot ] );

	useEffect( () => {
		let cancelled = false;
		async function boot() {
			setStatus( { loading: true, saving: false, error: '' } );
			try {
				const base = window?.nexulesuite_Admin?.restUrl || '/wp-json/';
				const [ popRes, metaRes ] = await Promise.all( [
					fetch( `${ base }nexulesuite_/v1/popups`, {
						method: 'GET',
						credentials: 'same-origin',
						headers: { 'X-WP-Nonce': window?.nexulesuite_Admin?.nonce || '' },
					} ),
					fetch( `${ base }nexulesuite_/v1/menu-items/condition-meta`, {
						method: 'GET',
						credentials: 'same-origin',
						headers: { 'X-WP-Nonce': window?.nexulesuite_Admin?.nonce || '' },
					} ),
				] );
				const json = await popRes.json();
				const metaJson = await metaRes.json();
				const loaded = Array.isArray( json?.data?.popups ) ? json.data.popups : [];

				if ( cancelled ) return;
				setPopups( loaded );
				setSavedSnapshot( loaded );
				setActiveId( loaded[ 0 ]?.id || null );
				if ( metaJson?.data ) {
					setConditionMeta( {
						postTypes: Array.isArray( metaJson.data.postTypes ) ? metaJson.data.postTypes : [],
						categories: Array.isArray( metaJson.data.categories ) ? metaJson.data.categories : [],
						tags: Array.isArray( metaJson.data.tags ) ? metaJson.data.tags : [],
					} );
				}
				setStatus( { loading: false, saving: false, error: '' } );
			} catch ( e ) {
				if ( cancelled ) return;
				setPopups( [] );
				setSavedSnapshot( [] );
				setActiveId( null );
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
			const filtered = prev.filter( ( p ) => p.id !== id );
			setActiveId( ( cur ) => ( cur === id ? filtered[ 0 ]?.id || null : cur ) );
			return filtered;
		} );
	};

	const searchContent = async ( key, types, query ) => {
		setContentSearch( ( s ) => ( { ...s, [ key ]: { loading: true, results: s[ key ]?.results || [] } } ) );
		try {
			const base = window?.nexulesuite_Admin?.restUrl || '/wp-json/';
			const params = new URLSearchParams( { search: query, types } );
			const res = await fetch( `${ base }nexulesuite_/v1/menu-items/content-search?${ params }`, {
				credentials: 'same-origin',
				headers: { 'X-WP-Nonce': window?.nexulesuite_Admin?.nonce || '' },
			} );
			const json = await res.json();
			const results = Array.isArray( json?.data?.results ) ? json.data.results : [];
			setContentSearch( ( s ) => ( { ...s, [ key ]: { loading: false, results } } ) );
		} catch {
			setContentSearch( ( s ) => ( { ...s, [ key ]: { loading: false, results: [] } } ) );
		}
	};

	const discard = () => {
		setPopups( savedSnapshot );
		setActiveId( savedSnapshot[ 0 ]?.id || null );
	};

	const saveAll = async () => {
		setStatus( ( s ) => ( { ...s, saving: true, error: '' } ) );
		try {
			const base = window?.nexulesuite_Admin?.restUrl || '/wp-json/';
			const res = await fetch( `${ base }nexulesuite_/v1/popups`, {
				method: 'POST',
				credentials: 'same-origin',
				headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': window?.nexulesuite_Admin?.nonce || '' },
				body: JSON.stringify( { popups } ),
			} );
			const json = await res.json();
			if ( ! res.ok || json?.success !== true ) {
				throw new Error( json?.message || 'Save failed.' );
			}
			const saved = Array.isArray( json?.data?.popups ) ? json.data.popups : popups;
			setPopups( saved );
			setSavedSnapshot( saved );
			setActiveId( saved[ 0 ]?.id || null );
			setStatus( { loading: false, saving: false, error: '' } );
			setSuccessOpen( true );
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
		<>
			<SuccessModal
				open={ successOpen }
				message="Your settings have been successfully updated. All changes are now live."
				onDismiss={ () => setSuccessOpen( false ) }
			/>
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
					<main className="flex-1 overflow-y-auto p-8" style={ { background: '#f4f5f8' } }>
						<div className="nexulesuite_popups-editor-wrap max-w-[1080px] mx-auto pb-20">
							{ status.error ? (
								<div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{ status.error }</div>
							) : null }

							<div className="nexulesuite_pop-card">
								<section className="nexulesuite_pop-section is-first">
									<div className="nexulesuite_pop-sec-head">
										<span className="nexulesuite_pop-sec-ico">
											<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
												<rect x="3" y="4" width="18" height="16" rx="2" />
												<path d="M3 9h18M9 9v11" />
											</svg>
										</span>
										<span className="nexulesuite_pop-sec-title">Identity &amp; Core Structure</span>
									</div>

									<div className="id-row">
										<div>
											<span className="lbl">Internal name</span>
											<input
												type="text"
												className="inp"
												value={ activePopup?.name || '' }
												onChange={ ( e ) => updateActive( { name: e.target.value } ) }
											/>
										</div>
										<div>
											<span className="lbl">Event name (unique id)</span>
											<input
												type="text"
												className="inp mono"
												value={ activePopup?.eventName || '' }
												onChange={ ( e ) => updateActive( { eventName: e.target.value } ) }
												placeholder="e.g. nexus-pop-contact"
											/>
											<div className="hint">
												This ID is used to link a <b>Menu Item button</b> to this popup (Manual Click trigger).
											</div>
										</div>
										<div>
											<span className="lbl">Text alignment</span>
											<PopAlignSegment
												value={ activePopup?.textAlign || 'left' }
												onChange={ ( next ) => updateActive( { textAlign: next } ) }
											/>
										</div>
									</div>
								</section>

								<section className="nexulesuite_pop-section">
									<div className="nexulesuite_pop-sec-head">
										<span className="nexulesuite_pop-sec-ico pink">
											<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
												<path d="M6 4v16M18 4v16M6 12h12M4 4h4M16 4h4M4 20h4M16 20h4" />
											</svg>
										</span>
										<span className="nexulesuite_pop-sec-title">Main Heading Editor</span>
									</div>
									<PopupHeadingEditor
										heading={ activePopup?.heading || '' }
										onChange={ ( html ) => updateActive( { heading: html } ) }
										disabled={ ! activePopup }
									/>
								</section>

								<section className="nexulesuite_pop-section">
									<div className="nexulesuite_pop-sec-head">
										<span className="nexulesuite_pop-sec-ico">
											<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
												<path d="M4 7h16M4 12h12M4 17h8" />
											</svg>
										</span>
										<span className="nexulesuite_pop-sec-title">Sub Heading Text</span>
									</div>
									<input
										type="text"
										className="inp"
										value={ activePopup?.subHeading || '' }
										onChange={ ( e ) => updateActive( { subHeading: e.target.value } ) }
										style={ { textAlign: activePopup?.textAlign || 'left' } }
									/>
								</section>

								<section className="nexulesuite_pop-section">
									<div className="nexulesuite_pop-sec-head">
										<span className="nexulesuite_pop-sec-ico">
											<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
												<circle cx="13.5" cy="6.5" r="2.5" />
												<circle cx="6.5" cy="12" r="2.5" />
												<circle cx="15" cy="16" r="2.5" />
												<path d="M3 21c2-4 4-6 8-7" />
											</svg>
										</span>
										<span className="nexulesuite_pop-sec-title">Visual Styling &amp; Area Controls</span>
									</div>

									<div className="color-row5">
										{ COLOR_FIELDS.map( ( f ) => (
											<PopColorField
												key={ f.key }
												label={ f.label }
												badge={ f.badge }
												colorKey={ f.key }
												value={ activePopup?.style?.[ f.key ] || '#ffffff' }
												onChange={ ( key, val ) => updateStyle( { [ key ]: val } ) }
											/>
										) ) }
									</div>

									<div className="slider-panel">
										<div className="slider-grid">
											<PopRangeSlider
												label="Button width (%)"
												value={ activePopup?.style?.buttonWidth || 100 }
												min={ 40 }
												max={ 100 }
												unit="%"
												onChange={ ( val ) => updateStyle( { buttonWidth: val } ) }
											/>
											<PopRangeSlider
												label="Popup radius (px)"
												value={ activePopup?.style?.radius || 16 }
												min={ 0 }
												max={ 40 }
												unit="px"
												onChange={ ( val ) => updateStyle( { radius: val } ) }
											/>
											<PopRangeSlider
												label="Close icon size (px)"
												value={ activePopup?.style?.closeIconSize || 20 }
												min={ 14 }
												max={ 36 }
												unit="px"
												onChange={ ( val ) => updateStyle( { closeIconSize: val } ) }
											/>
											<PopRangeSlider
												label="Heading font size (px)"
												value={ activePopup?.style?.headingFontSize || 20 }
												min={ 14 }
												max={ 40 }
												unit="px"
												onChange={ ( val ) => updateStyle( { headingFontSize: val } ) }
											/>
										</div>
									</div>
								</section>

								<section className="nexulesuite_pop-section">
									<div className="nexulesuite_pop-sec-head dense">
										<span className="nexulesuite_pop-sec-ico">
											<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
												<path d="M4 6h16M7 12h10M10 18h4" />
											</svg>
										</span>
										<span className="nexulesuite_pop-sec-title">Display Conditions</span>
									</div>
									<DisplayConditionsEditor
										variant="popup-reference"
										conditions={ activePopup?.conditions || { match: 'any', rules: [] } }
										onChange={ ( next ) => updateActive( { conditions: next } ) }
										conditionMeta={ conditionMeta }
										contentSearch={ contentSearch }
										onSearchContent={ searchContent }
										searchKeyPrefix={ `popup-${ activePopup?.id || 'new' }` }
										description="Where this popup is allowed to appear. Leave all rules unchecked to show on every page."
									/>
								</section>

								<section className="nexulesuite_pop-section">
									<div className="nexulesuite_pop-sec-head dense">
										<span className="nexulesuite_pop-sec-ico pink">
											<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
												<path d="M13 2L4 14h6l-1 8 9-12h-6z" />
											</svg>
										</span>
										<span className="nexulesuite_pop-sec-title">Advanced Automation Logic</span>
										<span className="nexulesuite_pop-sec-pill">
											{ ( activePopup?.logic || [] ).length } trigger{ ( activePopup?.logic || [] ).length !== 1 ? 's' : '' }
										</span>
									</div>
									<p className="nexulesuite_pop-sec-sub">When the popup fires. Add multiple triggers to fire on whichever happens first.</p>

									<div className="nexulesuite_pop-logic-list">
										{ ( activePopup?.logic || [] ).map( ( rule, idx ) => (
											<div key={ rule.id } className="nexulesuite_pop-logic-row">
												<div className="nexulesuite_pop-logic-top">
													<span className="ln">{ idx + 1 }</span>
													<span className="lt">Trigger { idx + 1 }</span>
													{ ( activePopup?.logic || [] ).length > 1 ? (
														<button
															type="button"
															onClick={ () => removeRule( rule.id ) }
															className="nexulesuite_pop-icon-btn danger"
															aria-label="Remove trigger"
														>
															<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
																<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
															</svg>
														</button>
													) : null }
												</div>
												<div className="nexulesuite_pop-logic-grid">
													<div className="nexulesuite_pop-field">
														<label>Event</label>
														<select
															value={ rule.trigger }
															onChange={ ( e ) => updateRule( rule.id, { trigger: e.target.value } ) }
														>
															<option value="scroll">On scroll</option>
															<option value="timer">After delay</option>
															<option value="exit">Exit intent</option>
															<option value="click">Manual Click</option>
														</select>
													</div>

													<div className="nexulesuite_pop-field" style={ { display: rule.trigger === 'timer' ? '' : 'none' } }>
														<label>Delay (sec)</label>
														<input
															type="number"
															value={ rule.delay }
															min="0"
															onChange={ ( e ) => updateRule( rule.id, { delay: e.target.value } ) }
														/>
													</div>

													<div className="nexulesuite_pop-field" style={ { display: rule.trigger === 'scroll' ? '' : 'none' } }>
														<label>Scroll depth (%)</label>
														<input
															type="number"
															value={ rule.scrollPercentage }
															min="0"
															max="100"
															onChange={ ( e ) => updateRule( rule.id, { scrollPercentage: e.target.value } ) }
														/>
													</div>
												</div>
											</div>
										) ) }
									</div>

									<button type="button" onClick={ addRule } className="nexulesuite_pop-add-dash">
										<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
											<path d="M12 5v14M5 12h14" />
										</svg>
										Add trigger
									</button>
								</section>

								<section className="nexulesuite_pop-section">
									<div className="nexulesuite_pop-sec-head dense">
										<span className="nexulesuite_pop-sec-ico">
											<Code size={ 16 } strokeWidth={ 2 } />
										</span>
										<span className="nexulesuite_pop-sec-title">Popup Body (HTML / Shortcode)</span>
									</div>
									<p className="content-hint">
										Put the form you want here (e.g. <code>[nexulesuite_form id="…"]</code>). If this box has any content, Settings → Default Nexus forms (ordered list) are <b>not</b> prepended — you will not get duplicate forms. Leave it empty only if you rely on those global defaults for timer/scroll/exit.
									</p>
									<textarea
										className="content-code"
										value={ activePopup?.content || '' }
										onChange={ ( e ) => updateActive( { content: e.target.value } ) }
									/>
								</section>
							</div>
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
		</>
	);
}

