import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
	ArrowRight,
	Bell,
	Calendar,
	ChevronLeft,
	Copy,
	Download,
	Eye,
	GripVertical,
	Layers,
	Mail,
	MapPin,
	MessageSquare,
	MousePointerClick,
	Phone,
	Plus,
	Settings2,
	Target,
	Trash2,
	X,
} from 'lucide-react';
import { DisplayConditionsEditor } from '../components/DisplayConditionsEditor.jsx';
import { SuccessModal } from '../components/NexusModal.jsx';

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

function createDefaultButton() {
	return {
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
	};
}

function createDefaultGroup() {
	return {
		id: `group-${ Date.now() }`,
		name: 'New Button Group',
		priority: 50,
		enabled: true,
		conditions: { match: 'any', rules: [] },
		buttons: [],
	};
}

function normalizeGroup( group ) {
	if ( ! group || typeof group !== 'object' ) {
		return createDefaultGroup();
	}
	return {
		...group,
		buttons: Array.isArray( group.buttons ) ? group.buttons : [],
		conditions: {
			match: group.conditions?.match === 'all' ? 'all' : 'any',
			rules: Array.isArray( group.conditions?.rules ) ? group.conditions.rules : [],
		},
	};
}

function BtnRangeSlider( { label, accent, value, min, max, unit, onChange } ) {
	const [ dragging, setDragging ] = useState( false );
	const numVal = parseInt( value, 10 ) || min;
	const pct = ( ( numVal - min ) / ( max - min ) ) * 100;

	return (
		<div className={ `slide-field${ dragging ? ' dragging' : '' }` }>
			<label>
				<span>
					{ label }
					{ accent ? <span className="accent">{ accent }</span> : null }
				</span>
				<span className="val">{ numVal }{ unit }</span>
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

function BtnColorField( { label, value, onChange } ) {
	const normalized = value || '#ffffff';

	return (
		<div>
			<span className="lbl">{ label }</span>
			<div className="cgroup">
				<span className="cswatch" style={ { background: normalized } }>
					<input
						type="color"
						value={ normalized }
						onChange={ ( e ) => onChange( e.target.value ) }
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
						onChange( next );
					} }
				/>
			</div>
		</div>
	);
}

function getHoverClass( effect ) {
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
}

export function MenuItemsPage() {
	const [ groups, setGroups ] = useState( [] );
	const [ savedGroups, setSavedGroups ] = useState( [] );
	const [ selectedGroupId, setSelectedGroupId ] = useState( null );
	const [ selectedButtonId, setSelectedButtonId ] = useState( null );
	const [ panel, setPanel ] = useState( 'group' );
	const [ globalFontSize, setGlobalFontSize ] = useState( 14 );
	const [ savedFontSize, setSavedFontSize ] = useState( 14 );
	const [ popups, setPopups ] = useState( [] );
	const [ conditionMeta, setConditionMeta ] = useState( { postTypes: [], categories: [], tags: [] } );
	const [ contentSearch, setContentSearch ] = useState( {} );
	const [ status, setStatus ] = useState( { loading: true, saving: false, error: '' } );
	const [ successOpen, setSuccessOpen ] = useState( false );
	const [ popOutBtn, setPopOutBtn ] = useState( null );
	const [ dragGroupId, setDragGroupId ] = useState( null );
	const [ dragButtonId, setDragButtonId ] = useState( null );
	const [ dropGroupId, setDropGroupId ] = useState( null );
	const [ dropButtonId, setDropButtonId ] = useState( null );

	const selectedGroup = useMemo(
		() => groups.find( ( g ) => g.id === selectedGroupId ) || null,
		[ groups, selectedGroupId ]
	);

	const selectedButton = useMemo( () => {
		if ( ! selectedGroup ) {
			return null;
		}
		return selectedGroup.buttons.find( ( b ) => b.id === selectedButtonId ) || null;
	}, [ selectedGroup, selectedButtonId ] );

	const isDirty = useMemo(
		() => JSON.stringify( groups ) !== JSON.stringify( savedGroups ) || globalFontSize !== savedFontSize,
		[ groups, savedGroups, globalFontSize, savedFontSize ]
	);

	const restBase = window?.nexulesuite_Admin?.restUrl || '/wp-json/';
	const nonce = window?.nexulesuite_Admin?.nonce || '';

	useEffect( () => {
		let cancelled = false;
		( async () => {
			setStatus( ( s ) => ( { ...s, loading: true, error: '' } ) );
			try {
				const [ menuRes, popupRes, metaRes ] = await Promise.all( [
					fetch( `${ restBase }nexulesuite_/v1/menu-items`, {
						credentials: 'same-origin',
						headers: { 'X-WP-Nonce': nonce },
					} ),
					fetch( `${ restBase }nexulesuite_/v1/popups`, {
						credentials: 'same-origin',
						headers: { 'X-WP-Nonce': nonce },
					} ),
					fetch( `${ restBase }nexulesuite_/v1/menu-items/condition-meta`, {
						credentials: 'same-origin',
						headers: { 'X-WP-Nonce': nonce },
					} ),
				] );
				const menuJson = await menuRes.json();
				const popupJson = await popupRes.json();
				const metaJson = await metaRes.json();
				if ( cancelled ) {
					return;
				}

				const loadedGroups = Array.isArray( menuJson?.data?.groups )
					? menuJson.data.groups.map( normalizeGroup )
					: [];
				const font = typeof menuJson?.data?.globalFontSize === 'number' ? menuJson.data.globalFontSize : 14;
				setGroups( loadedGroups );
				setSavedGroups( loadedGroups );
				setGlobalFontSize( font );
				setSavedFontSize( font );
				setSelectedGroupId( loadedGroups[ 0 ]?.id ?? null );
				setSelectedButtonId( null );
				setPanel( 'group' );

				setPopups( Array.isArray( popupJson?.data?.popups ) ? popupJson.data.popups : [] );

				if ( metaJson?.data ) {
					setConditionMeta( {
						postTypes: Array.isArray( metaJson.data.postTypes ) ? metaJson.data.postTypes : [],
						categories: Array.isArray( metaJson.data.categories ) ? metaJson.data.categories : [],
						tags: Array.isArray( metaJson.data.tags ) ? metaJson.data.tags : [],
					} );
				}
			} catch {
				if ( ! cancelled ) {
					setStatus( ( s ) => ( { ...s, error: 'Failed to load menu items.' } ) );
				}
			} finally {
				if ( ! cancelled ) {
					setStatus( ( s ) => ( { ...s, loading: false } ) );
				}
			}
		} )();
		return () => {
			cancelled = true;
		};
	}, [ restBase, nonce ] );

	const updateGroup = useCallback( ( groupId, patch ) => {
		setGroups( ( prev ) => prev.map( ( g ) => ( g.id === groupId ? { ...g, ...patch } : g ) ) );
	}, [] );

	const updateGroupField = useCallback( ( groupId, field, value ) => {
		setGroups( ( prev ) => prev.map( ( g ) => ( g.id === groupId ? { ...g, [ field ]: value } : g ) ) );
	}, [] );

	const updateButton = useCallback( ( groupId, buttonId, field, value ) => {
		setGroups( ( prev ) => prev.map( ( g ) => {
			if ( g.id !== groupId ) {
				return g;
			}
			return {
				...g,
				buttons: g.buttons.map( ( b ) => ( b.id === buttonId ? { ...b, [ field ]: value } : b ) ),
			};
		} ) );
	}, [] );

	const updateButtonStyle = useCallback( ( groupId, buttonId, field, value ) => {
		setGroups( ( prev ) => prev.map( ( g ) => {
			if ( g.id !== groupId ) {
				return g;
			}
			return {
				...g,
				buttons: g.buttons.map( ( b ) => (
					b.id === buttonId ? { ...b, style: { ...b.style, [ field ]: value } } : b
				) ),
			};
		} ) );
	}, [] );

	const addGroup = () => {
		const group = createDefaultGroup();
		setGroups( ( prev ) => [ ...prev, group ] );
		setSelectedGroupId( group.id );
		setSelectedButtonId( null );
		setPanel( 'group' );
	};

	const deleteGroup = ( groupId ) => {
		if ( ! window.confirm( 'Delete this button group and all its buttons?' ) ) {
			return;
		}
		setGroups( ( prev ) => {
			const next = prev.filter( ( g ) => g.id !== groupId );
			setSelectedGroupId( ( cur ) => ( cur === groupId ? next[ 0 ]?.id ?? null : cur ) );
			setSelectedButtonId( null );
			setPanel( 'group' );
			return next;
		} );
	};

	const addButton = () => {
		if ( ! selectedGroup ) {
			return;
		}
		const btn = createDefaultButton();
		updateGroup( selectedGroup.id, { buttons: [ ...( selectedGroup.buttons || [] ), btn ] } );
		setSelectedButtonId( btn.id );
		setPanel( 'button' );
	};

	const deleteButton = ( buttonId ) => {
		if ( ! selectedGroup ) {
			return;
		}
		if ( ! window.confirm( 'Delete this menu button?' ) ) {
			return;
		}
		const nextButtons = selectedGroup.buttons.filter( ( b ) => b.id !== buttonId );
		updateGroup( selectedGroup.id, { buttons: nextButtons } );
		setSelectedButtonId( ( cur ) => ( cur === buttonId ? nextButtons[ 0 ]?.id ?? null : cur ) );
		if ( ! nextButtons.length ) {
			setPanel( 'group' );
		}
	};

	const duplicateButton = ( buttonId ) => {
		if ( ! selectedGroup ) {
			return;
		}
		const idx = selectedGroup.buttons.findIndex( ( b ) => b.id === buttonId );
		if ( idx === -1 ) {
			return;
		}
		const copy = {
			...selectedGroup.buttons[ idx ],
			id: `btn-${ Date.now() }`,
			label: selectedGroup.buttons[ idx ].label
				? `${ selectedGroup.buttons[ idx ].label } (Copy)`
				: 'New Action Button (Copy)',
			style: { ...selectedGroup.buttons[ idx ].style },
			cssId: '',
		};
		const next = [ ...selectedGroup.buttons ];
		next.splice( idx + 1, 0, copy );
		updateGroup( selectedGroup.id, { buttons: next } );
		setSelectedButtonId( copy.id );
		setPanel( 'button' );
	};

	const reorderGroups = ( fromId, toId ) => {
		if ( ! fromId || ! toId || fromId === toId ) {
			return;
		}
		setGroups( ( prev ) => {
			const fromIdx = prev.findIndex( ( g ) => g.id === fromId );
			const toIdx = prev.findIndex( ( g ) => g.id === toId );
			if ( fromIdx === -1 || toIdx === -1 ) {
				return prev;
			}
			const next = [ ...prev ];
			const [ moved ] = next.splice( fromIdx, 1 );
			next.splice( toIdx, 0, moved );
			return next;
		} );
	};

	const reorderButtons = ( fromId, toId ) => {
		if ( ! selectedGroup || ! fromId || ! toId || fromId === toId ) {
			return;
		}
		const fromIdx = selectedGroup.buttons.findIndex( ( b ) => b.id === fromId );
		const toIdx = selectedGroup.buttons.findIndex( ( b ) => b.id === toId );
		if ( fromIdx === -1 || toIdx === -1 ) {
			return;
		}
		const next = [ ...selectedGroup.buttons ];
		const [ moved ] = next.splice( fromIdx, 1 );
		next.splice( toIdx, 0, moved );
		updateGroup( selectedGroup.id, { buttons: next } );
	};

	const searchContent = async ( key, types, query ) => {
		setContentSearch( ( s ) => ( { ...s, [ key ]: { loading: true, results: s[ key ]?.results || [] } } ) );
		try {
			const params = new URLSearchParams( { search: query, types } );
			const res = await fetch( `${ restBase }nexulesuite_/v1/menu-items/content-search?${ params }`, {
				credentials: 'same-origin',
				headers: { 'X-WP-Nonce': nonce },
			} );
			const json = await res.json();
			const results = Array.isArray( json?.data?.results ) ? json.data.results : [];
			setContentSearch( ( s ) => ( { ...s, [ key ]: { loading: false, results } } ) );
		} catch {
			setContentSearch( ( s ) => ( { ...s, [ key ]: { loading: false, results: [] } } ) );
		}
	};

	const saveAll = async () => {
		setStatus( ( s ) => ( { ...s, saving: true, error: '' } ) );
		try {
			const res = await fetch( `${ restBase }nexulesuite_/v1/menu-items`, {
				method: 'POST',
				credentials: 'same-origin',
				headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': nonce },
				body: JSON.stringify( { groups, globalFontSize } ),
			} );
			const json = await res.json();
			if ( ! res.ok || json?.success !== true ) {
				throw new Error( json?.message || 'Save failed.' );
			}
			const saved = Array.isArray( json?.data?.groups ) ? json.data.groups : groups;
			const font = typeof json?.data?.globalFontSize === 'number' ? json.data.globalFontSize : globalFontSize;
			setGroups( saved );
			setSavedGroups( saved );
			setGlobalFontSize( font );
			setSavedFontSize( font );
			setStatus( { loading: false, saving: false, error: '' } );
			setSuccessOpen( true );
		} catch ( err ) {
			setStatus( ( s ) => ( { ...s, saving: false, error: err?.message || 'Save failed.' } ) );
		}
	};

	const discard = () => {
		setGroups( savedGroups );
		setGlobalFontSize( savedFontSize );
		setSelectedGroupId( savedGroups[ 0 ]?.id ?? null );
		setSelectedButtonId( null );
		setPanel( 'group' );
	};

	const ButtonRender = ( { btn, isPopout = false } ) => (
		<a
			href={ btn.url || '#' }
			id={ btn.cssId }
			className={ `
        flex items-center justify-center gap-3 transition-all duration-300 font-bold select-none
        ${ btn.displayMode === 'block' && ! isPopout ? 'w-full' : 'w-auto' }
        ${ getHoverClass( btn.style?.hoverEffect ) }
        ${ btn.cssClass || '' }
      ` }
			style={ {
				backgroundColor: btn.style?.bg || '#2563eb',
				color: btn.style?.text || '#ffffff',
				padding: `${ btn.style?.paddingVertical || 12 }px ${ btn.style?.paddingHorizontal || 24 }px`,
				borderRadius: `${ btn.style?.radius || 8 }px`,
				fontSize: `${ globalFontSize }px`,
				textDecoration: 'none',
			} }
			onClick={ ( e ) => e.preventDefault() }
		>
			{ iconLibrary[ btn.icon || 'none' ] }
			<span>{ btn.label || 'Button' }</span>
		</a>
	);

	const renderGroupSettings = () => {
		if ( ! selectedGroup ) {
			return null;
		}

		const groupEnabled = selectedGroup.enabled !== false;
		const flipGroupEnabled = () => {
			updateGroupField( selectedGroup.id, 'enabled', ! groupEnabled );
		};

		return (
			<div className="nexulesuite_group-details-wrap max-w-[880px] mx-auto w-full pb-10">
				<div className="nexulesuite_gd-card">
					<div className="nexulesuite_gd-pad">
						<div className="nexulesuite_gd-section">
							<div className="nexulesuite_gd-sec-head">
								<span className="nexulesuite_gd-sec-ico">
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
										<path d="M12 3l9 5-9 5-9-5 9-5z" />
										<path d="M3 13l9 5 9-5" />
									</svg>
								</span>
								<span className="nexulesuite_gd-sec-title">Group Details</span>
							</div>
							<div className="nexulesuite_gd-grid-2">
								<div className="nexulesuite_gd-field">
									<label htmlFor={ `nexulesuite_group-name-${ selectedGroup.id }` }>Group name</label>
									<input
										id={ `nexulesuite_group-name-${ selectedGroup.id }` }
										type="text"
										value={ selectedGroup.name || '' }
										onChange={ ( e ) => updateGroupField( selectedGroup.id, 'name', e.target.value ) }
									/>
								</div>
								<div className="nexulesuite_gd-field">
									<label htmlFor={ `nexulesuite_group-priority-${ selectedGroup.id }` }>Priority</label>
									<input
										id={ `nexulesuite_group-priority-${ selectedGroup.id }` }
										type="number"
										min="0"
										max="999"
										value={ selectedGroup.priority ?? 0 }
										onChange={ ( e ) => updateGroupField( selectedGroup.id, 'priority', Number( e.target.value ) ) }
									/>
								</div>
							</div>
							<div
								className={ `nexulesuite_gd-toggle${ groupEnabled ? ' on' : '' }` }
								role="switch"
								aria-checked={ groupEnabled }
								tabIndex={ 0 }
								onClick={ flipGroupEnabled }
								onKeyDown={ ( e ) => {
									if ( e.key === ' ' || e.key === 'Enter' ) {
										e.preventDefault();
										flipGroupEnabled();
									}
								} }
							>
								<span className="track">
									<span className="knob" />
								</span>
								<span className="lbl">Group enabled</span>
							</div>
							<div className="nexulesuite_gd-actions">
								<button
									type="button"
									onClick={ () => {
										setPanel( 'button' );
										if ( selectedGroup.buttons?.length && ! selectedButtonId ) {
											setSelectedButtonId( selectedGroup.buttons[ 0 ].id );
										}
									} }
									className="nexulesuite_gd-btn"
								>
									<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
										<path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4" />
									</svg>
									Manage buttons
									{ selectedGroup.buttons?.length ? (
										<span className="cnt">{ selectedGroup.buttons.length }</span>
									) : null }
								</button>
								<button
									type="button"
									onClick={ addButton }
									className="nexulesuite_gd-btn primary"
								>
									<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
										<path d="M12 5v14M5 12h14" />
									</svg>
									Add button
								</button>
							</div>
						</div>

						<div className="nexulesuite_gd-section">
							<div className="nexulesuite_gd-sec-head">
								<span className="nexulesuite_gd-sec-ico">
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
										<path d="M4 6h16M7 12h10M10 18h4" />
									</svg>
								</span>
								<span className="nexulesuite_gd-sec-title">Display Conditions</span>
							</div>
							<DisplayConditionsEditor
								variant="reference"
								conditions={ selectedGroup.conditions || { match: 'any', rules: [] } }
								onChange={ ( next ) => updateGroup( selectedGroup.id, { conditions: next } ) }
								conditionMeta={ conditionMeta }
								contentSearch={ contentSearch }
								onSearchContent={ searchContent }
								searchKeyPrefix={ selectedGroup.id }
								description="Multiple groups can be active on the same page. Leave all rules unchecked to show on every page."
							/>
						</div>
					</div>
				</div>
			</div>
		);
	};

	const renderButtonEditor = () => {
		if ( ! selectedGroup || ! selectedButton ) {
			return null;
		}
		const btn = selectedButton;

		return (
			<div className="nexulesuite_btn-editor-wrap">
				<div className="nexulesuite_be-inner">
					<div className="nexulesuite_be-card">
						<div className="nexulesuite_be-section is-first">
							<div className="nexulesuite_be-sec-head">
								<span className="nexulesuite_be-sec-ico">
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
										<path d="M4 7V4h16v3M9 20h6M12 4v16" />
									</svg>
								</span>
								<span className="nexulesuite_be-sec-title">Content &amp; Action</span>
							</div>

							<div className="nexulesuite_be-row-2">
								<div className="nexulesuite_be-field">
									<span className="lbl">Button text</span>
									<input
										type="text"
										className="inp"
										value={ btn.label || '' }
										onChange={ ( e ) => updateButton( selectedGroup.id, btn.id, 'label', e.target.value ) }
									/>
								</div>
								<div className="nexulesuite_be-field">
									<span className="lbl">Action icon</span>
									<select
										className="sel"
										value={ btn.icon || 'none' }
										onChange={ ( e ) => updateButton( selectedGroup.id, btn.id, 'icon', e.target.value ) }
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
							</div>

							<div className="nexulesuite_be-row-2">
								<div className="nexulesuite_be-field">
									<span className="lbl">Link URL</span>
									<input
										type="text"
										className="inp"
										value={ btn.url || '' }
										placeholder="https://example.com"
										onChange={ ( e ) => updateButton( selectedGroup.id, btn.id, 'url', e.target.value ) }
									/>
								</div>
								<div className="nexulesuite_be-field">
									<span className="lbl">Popup event id (manual click)</span>
									{ popups.length > 0 ? (
										<select
											className="sel"
											value={ btn.eventName || '' }
											onChange={ ( e ) => updateButton( selectedGroup.id, btn.id, 'eventName', e.target.value ) }
										>
											<option value="">— No popup (use Link URL) —</option>
											{ popups.map( ( p ) => {
												const val = String( p.eventName || '' ).trim() || String( p.id || '' ).trim();
												return (
													<option key={ p.id } value={ val }>
														{ val } · { p.name || 'Unnamed' }
													</option>
												);
											} ) }
										</select>
									) : (
										<input
											type="text"
											className="inp mono"
											value={ btn.eventName || '' }
											placeholder="e.g. nexus-pop"
											onChange={ ( e ) => updateButton( selectedGroup.id, btn.id, 'eventName', e.target.value ) }
										/>
									) }
									<div className="hint">
										Select a popup from the list, or go to the <b>Popups page</b> to create one first.
									</div>
								</div>
							</div>
						</div>

						<div className="nexulesuite_be-section">
							<div className="nexulesuite_be-sec-head">
								<span className="nexulesuite_be-sec-ico is-pink">
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
										<circle cx="13.5" cy="6.5" r="2.5" />
										<circle cx="6.5" cy="12" r="2.5" />
										<circle cx="15" cy="16" r="2.5" />
										<path d="M3 21c2-4 4-6 8-7" />
									</svg>
								</span>
								<span className="nexulesuite_be-sec-title">Visual Styling</span>
							</div>

							<div className="nexulesuite_be-row-2 is-triple">
								<BtnColorField
									label="Background"
									value={ btn.style?.bg || '#10b981' }
									onChange={ ( val ) => updateButtonStyle( selectedGroup.id, btn.id, 'bg', val ) }
								/>
								<BtnColorField
									label="Text color"
									value={ btn.style?.text || '#ffffff' }
									onChange={ ( val ) => updateButtonStyle( selectedGroup.id, btn.id, 'text', val ) }
								/>
								<div className="nexulesuite_be-field">
									<span className="lbl">Hover animation</span>
									<select
										className="sel"
										value={ btn.style?.hoverEffect || 'glow' }
										onChange={ ( e ) => updateButtonStyle( selectedGroup.id, btn.id, 'hoverEffect', e.target.value ) }
									>
										<option value="none">None</option>
										<option value="glow">Outer Glow</option>
										<option value="lift">Lift</option>
										<option value="scale">Scale up</option>
										<option value="shake">Wobble/Shake</option>
										<option value="rotate">Slight Rotate</option>
										<option value="darken">Color Shift</option>
									</select>
								</div>
							</div>

							<div className="slide-grid">
								<BtnRangeSlider
									label="Vertical padding"
									value={ btn.style?.paddingVertical || 12 }
									min={ 4 }
									max={ 32 }
									unit="px"
									onChange={ ( val ) => updateButtonStyle( selectedGroup.id, btn.id, 'paddingVertical', val ) }
								/>
								<BtnRangeSlider
									label="Border radius"
									value={ btn.style?.radius || 8 }
									min={ 0 }
									max={ 32 }
									unit="px"
									onChange={ ( val ) => updateButtonStyle( selectedGroup.id, btn.id, 'radius', val ) }
								/>
								<BtnRangeSlider
									label="Horizontal padding"
									value={ btn.style?.paddingHorizontal || 24 }
									min={ 8 }
									max={ 48 }
									unit="px"
									onChange={ ( val ) => updateButtonStyle( selectedGroup.id, btn.id, 'paddingHorizontal', val ) }
								/>
								<BtnRangeSlider
									label="Font size"
									accent="(all buttons)"
									value={ globalFontSize }
									min={ 10 }
									max={ 24 }
									unit="px"
									onChange={ ( val ) => setGlobalFontSize( Number( val ) ) }
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	};

	return (
		<>
			<SuccessModal
				open={ successOpen }
				message="Your settings have been successfully updated. All changes are now live."
				onDismiss={ () => setSuccessOpen( false ) }
			/>
		<div className="min-h-screen bg-[#f6f7fb] px-8 py-6 font-sans text-slate-900">
			<div className="w-full bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-3.25rem)]">
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
					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={ addGroup }
							className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl transition-all text-sm font-semibold"
						>
							<Plus size={ 16 } /> Add Group
						</button>
						<button
							type="button"
							onClick={ addButton }
							disabled={ ! selectedGroup }
							className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl transition-all text-sm font-semibold shadow-lg shadow-blue-100"
						>
							<Plus size={ 18 } /> Add New Button
						</button>
					</div>
				</div>

				<div className="flex flex-1 overflow-hidden">
					<div className="w-72 border-r border-slate-200 bg-slate-50 flex flex-col shrink-0 overflow-hidden">
						{ panel === 'group' ? (
							<>
								<div className="p-4 border-b border-slate-200 flex items-center justify-between shrink-0">
									<div>
										<h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Button Groups</h2>
										<p className="mt-1 text-[10px] text-slate-400">Drag to reorder</p>
									</div>
									<button type="button" onClick={ addGroup } className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg" title="Add group">
										<Plus size={ 14 } />
									</button>
								</div>
								<div className="flex-1 overflow-y-auto p-3 space-y-2">
									{ status.loading ? (
										<div className="text-sm text-slate-500 px-2 py-3">Loading…</div>
									) : groups.length === 0 ? (
										<div className="text-xs text-slate-400 px-2 py-3">No groups yet.</div>
									) : (
										groups.map( ( group ) => {
											const isActive = selectedGroupId === group.id;
											return (
												<div
													key={ group.id }
													onClick={ () => {
														setSelectedGroupId( group.id );
														setSelectedButtonId( null );
														setPanel( 'group' );
													} }
													onDragOver={ ( e ) => {
														e.preventDefault();
														setDropGroupId( group.id );
													} }
													onDragLeave={ () => setDropGroupId( null ) }
													onDrop={ ( e ) => {
														e.preventDefault();
														e.stopPropagation();
														reorderGroups( dragGroupId, group.id );
														setDragGroupId( null );
														setDropGroupId( null );
													} }
													className={ `group p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
														isActive
															? 'bg-white border-blue-500 shadow-md ring-2 ring-blue-500/10'
															: 'bg-transparent border-transparent hover:bg-slate-200/50'
													} ${ dropGroupId === group.id && dragGroupId !== group.id ? 'ring-2 ring-blue-300 border-blue-200' : '' } ${
														dragGroupId === group.id ? 'opacity-50' : ''
													}` }
												>
													<div className="flex min-w-0 flex-1 items-center gap-2 truncate">
														<button
															type="button"
															draggable
															onDragStart={ ( e ) => {
																setDragGroupId( group.id );
																e.dataTransfer.effectAllowed = 'move';
															} }
															onDragEnd={ () => {
																setDragGroupId( null );
																setDropGroupId( null );
															} }
															onClick={ ( e ) => e.stopPropagation() }
															className="shrink-0 rounded p-1 text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing"
															title="Drag to reorder"
															aria-label="Drag to reorder"
														>
															<GripVertical size={ 16 } />
														</button>
														<div className="min-w-0">
															<span className={ `text-sm font-semibold truncate block ${ isActive ? 'text-slate-900' : 'text-slate-500' }` }>
																{ group.name || 'Untitled group' }
															</span>
															<span className="text-[10px] text-slate-400">
																Priority { group.priority ?? 0 } · { group.buttons?.length || 0 } button{ ( group.buttons?.length || 0 ) === 1 ? '' : 's' }
															</span>
														</div>
													</div>
													<button
														type="button"
														onClick={ ( e ) => {
															e.stopPropagation();
															deleteGroup( group.id );
														} }
														className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
													>
														<Trash2 size={ 14 } />
													</button>
												</div>
											);
										} )
									) }
								</div>
							</>
						) : (
							<>
								<div className="p-4 border-b border-slate-200 shrink-0 space-y-3">
									<button
										type="button"
										onClick={ () => {
											setPanel( 'group' );
											setSelectedButtonId( null );
										} }
										className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
									>
										<ChevronLeft size={ 14 } />
										Back to groups
									</button>
									<div className="flex items-center justify-between gap-2">
										<div className="min-w-0">
											<h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Button Layers</h2>
											<p className="mt-1 text-[10px] text-slate-400 truncate" title={ selectedGroup?.name }>
												{ selectedGroup?.name || 'Group' } · Drag to reorder
											</p>
										</div>
										<button
											type="button"
											onClick={ addButton }
											disabled={ ! selectedGroup }
											className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg disabled:opacity-40"
											title="Add button"
										>
											<Plus size={ 14 } />
										</button>
									</div>
								</div>
								<div className="flex-1 overflow-y-auto p-3 space-y-2">
									{ ! selectedGroup ? (
										<div className="text-xs text-slate-400 px-2 py-3">Select a group first.</div>
									) : selectedGroup.buttons.length === 0 ? (
										<div className="px-2 py-3 text-center">
											<p className="text-xs text-slate-400">No buttons in this group.</p>
											<button
												type="button"
												onClick={ addButton }
												className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
											>
												<Plus size={ 14 } /> Add button
											</button>
										</div>
									) : (
										selectedGroup.buttons.map( ( btn ) => {
											const isActive = selectedButtonId === btn.id;
											return (
												<div
													key={ btn.id }
													onClick={ () => {
														setSelectedButtonId( btn.id );
														setPanel( 'button' );
													} }
													onDragOver={ ( e ) => {
														e.preventDefault();
														setDropButtonId( btn.id );
													} }
													onDragLeave={ () => setDropButtonId( null ) }
													onDrop={ ( e ) => {
														e.preventDefault();
														e.stopPropagation();
														reorderButtons( dragButtonId, btn.id );
														setDragButtonId( null );
														setDropButtonId( null );
													} }
													className={ `group p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
														isActive
															? 'bg-white border-blue-500 shadow-md ring-2 ring-blue-500/10'
															: 'bg-transparent border-transparent hover:bg-slate-200/50'
													} ${ dropButtonId === btn.id && dragButtonId !== btn.id ? 'ring-2 ring-blue-300 border-blue-200' : '' } ${
														dragButtonId === btn.id ? 'opacity-50' : ''
													}` }
												>
													<div className="flex min-w-0 flex-1 items-center gap-2 truncate">
														<button
															type="button"
															draggable
															onDragStart={ ( e ) => {
																setDragButtonId( btn.id );
																e.dataTransfer.effectAllowed = 'move';
															} }
															onDragEnd={ () => {
																setDragButtonId( null );
																setDropButtonId( null );
															} }
															onClick={ ( e ) => e.stopPropagation() }
															className="shrink-0 rounded p-1 text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing"
															title="Drag to reorder"
															aria-label="Drag to reorder"
														>
															<GripVertical size={ 16 } />
														</button>
														<div className={ isActive ? 'text-blue-600 shrink-0' : 'text-slate-400 shrink-0' }>
															{ iconLibrary[ btn.icon || 'none' ] }
														</div>
														<span className={ `text-sm font-semibold truncate ${ isActive ? 'text-slate-900' : 'text-slate-500' }` }>
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
														<button
															type="button"
															onClick={ () => deleteButton( btn.id ) }
															className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
														>
															<Trash2 size={ 14 } />
														</button>
													</div>
												</div>
											);
										} )
									) }
								</div>
							</>
						) }
					</div>

					<div className="flex-1 overflow-y-auto p-8 bg-white">
						{ status.error ? (
							<div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
								{ status.error }
							</div>
						) : null }

						{ ! selectedGroup ? (
							<div className="flex h-full flex-col items-center justify-center text-center text-slate-500">
								<p className="text-sm">Create a button group to get started.</p>
								<button
									type="button"
									onClick={ addGroup }
									className="mt-4 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold"
								>
									<Plus size={ 16 } /> Add Group
								</button>
							</div>
						) : panel === 'group' ? (
							renderGroupSettings()
						) : panel === 'button' && selectedButton ? (
							renderButtonEditor()
						) : (
							<p className="text-sm text-slate-500">Select a button from the sidebar or add a new one.</p>
						) }
					</div>
				</div>

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

			{ popOutBtn ? (
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
			) : null }
		</div>
		</>
	);
}
