import { useCallback, useEffect, useRef } from 'react';

const RULE_DEFS = [
	{ type: 'homepage', label: 'Homepage' },
	{ type: 'page', label: 'Specific Page', idKey: 'ids', searchTypes: 'page' },
	{ type: 'post', label: 'Specific Post', idKey: 'ids', searchTypes: 'post' },
	{ type: 'post_type', label: 'Post Type', slugKey: 'slugs' },
	{ type: 'category', label: 'Category', idKey: 'ids', taxonomy: 'category' },
	{ type: 'tag', label: 'Tag', idKey: 'ids', taxonomy: 'tag' },
];

const RULE_REF_TAGS = {
	homepage: 'page',
	page: 'page IDs',
	post: 'post IDs',
	post_type: 'type',
	category: 'slugs',
	tag: 'slugs',
};

const RULE_REF_ICONS = {
	homepage: (
		<>
			<path d="M3 11l9-8 9 8" />
			<path d="M5 10v10h14V10" />
		</>
	),
	page: (
		<>
			<rect x="5" y="3" width="14" height="18" rx="2" />
			<path d="M9 8h6M9 12h6" />
		</>
	),
	post: (
		<>
			<path d="M4 5h16v14H4z" />
			<path d="M8 9h8M8 13h5" />
		</>
	),
	post_type: (
		<>
			<rect x="4" y="4" width="7" height="7" rx="1.5" />
			<rect x="13" y="4" width="7" height="7" rx="1.5" />
			<rect x="4" y="13" width="7" height="7" rx="1.5" />
		</>
	),
	category: (
		<>
			<path d="M3 7l9-4 9 4-9 4-9-4z" />
			<path d="M3 12l9 4 9-4" />
		</>
	),
	tag: (
		<>
			<path d="M3 11l8-8 9 1 1 9-8 8z" />
			<circle cx="14.5" cy="9.5" r="1.5" />
		</>
	),
};

const RULE_REF_PLACEHOLDERS = {
	page: 'e.g. 2, 14, 87',
	post: 'e.g. 105, 233',
};

function ruleLabel( rule, meta ) {
	const def = RULE_DEFS.find( ( r ) => r.type === rule.type );
	if ( ! def ) {
		return rule.type;
	}
	if ( rule.type === 'homepage' ) {
		return 'Homepage';
	}
	if ( rule.type === 'post_type' ) {
		const slugs = Array.isArray( rule.slugs ) ? rule.slugs : [];
		return `${ def.label }: ${ slugs.join( ', ' ) || '—' }`;
	}
	if ( def.idKey && Array.isArray( rule.ids ) && rule.ids.length > 0 ) {
		if ( rule.type === 'category' ) {
			const names = rule.ids.map( ( id ) => meta.categories?.find( ( c ) => c.id === id )?.name || `#${ id }` );
			return `${ def.label }: ${ names.join( ', ' ) }`;
		}
		if ( rule.type === 'tag' ) {
			const names = rule.ids.map( ( id ) => meta.tags?.find( ( t ) => t.id === id )?.name || `#${ id }` );
			return `${ def.label }: ${ names.join( ', ' ) }`;
		}
		return `${ def.label }: ${ rule.ids.map( ( id ) => `#${ id }` ).join( ', ' ) }`;
	}
	return def.label;
}

function ruleSummaryValue( rule, meta ) {
	const def = RULE_DEFS.find( ( r ) => r.type === rule.type );
	if ( ! def || rule.type === 'homepage' ) {
		return '';
	}
	if ( rule.type === 'post_type' ) {
		const slugs = Array.isArray( rule.slugs ) ? rule.slugs.filter( Boolean ) : [];
		return slugs.length ? ` · ${ slugs.join( ', ' ) }` : '';
	}
	if ( def.idKey && Array.isArray( rule.ids ) && rule.ids.length > 0 ) {
		if ( rule.type === 'category' ) {
			const names = rule.ids.map( ( id ) => meta.categories?.find( ( c ) => c.id === id )?.name || `#${ id }` );
			return ` · ${ names.join( ', ' ) }`;
		}
		if ( rule.type === 'tag' ) {
			const names = rule.ids.map( ( id ) => meta.tags?.find( ( t ) => t.id === id )?.name || `#${ id }` );
			return ` · ${ names.join( ', ' ) }`;
		}
		return ` · ${ rule.ids.map( ( id ) => `#${ id }` ).join( ', ' ) }`;
	}
	return '';
}

function ReferenceConditionsSummary( { rules, match, conditionMeta, context = 'group' } ) {
	if ( ! rules.length ) {
		const emptyMsg = context === 'popup'
			? (
				<>
					No rules selected — this popup can appear on <span className="empty">every page</span> of your site.
				</>
			)
			: (
				<>
					No rules selected — this group shows on <span className="empty">every page</span> of your site.
				</>
			);
		return <p className="stext">{ emptyMsg }</p>;
	}

	const op = match === 'any' ? 'OR' : 'AND';
	const verb = match === 'any' ? 'any' : 'all';

	if ( context === 'popup' ) {
		return (
			<p className="stext">
				Allow this popup when <b>{ verb }</b> of these match:
				<br />
				{ rules.map( ( rule, idx ) => {
					const def = RULE_DEFS.find( ( r ) => r.type === rule.type );
					const name = def?.label || rule.type;
					const val = ruleSummaryValue( rule, conditionMeta );
					return (
						<span key={ rule.type }>
							{ idx > 0 ? <span className="op">{ op }</span> : null }
							<span className="rule">
								{ name }
								{ val }
							</span>
						</span>
					);
				} ) }
			</p>
		);
	}

	return (
		<p className="stext">
			Show this group when <b>{ verb }</b> of these match:
			<br />
			{ rules.map( ( rule, idx ) => {
				const def = RULE_DEFS.find( ( r ) => r.type === rule.type );
				const name = def?.label || rule.type;
				const val = ruleSummaryValue( rule, conditionMeta );
				return (
					<span key={ rule.type }>
						{ idx > 0 ? <span className="op">{ op }</span> : null }
						<span className="rule">
							{ name }
							{ val }
						</span>
					</span>
				);
			} ) }
		</p>
	);
}

function ReferenceConditionsEditor( {
	conditions,
	onChange,
	conditionMeta,
	contentSearch,
	onSearchContent,
	searchKeyPrefix,
	description,
	toggleRule,
	updateRule,
	rules,
	match,
	summaryContext = 'group',
	secSubClassName = 'nexulesuite_gd-sec-sub',
} ) {
	const segRef = useRef( null );
	const orRef = useRef( null );
	const andRef = useRef( null );

	const positionGlider = useCallback( () => {
		const seg = segRef.current;
		const active = match === 'all' ? andRef.current : orRef.current;
		const glider = seg?.querySelector( '.glider' );
		if ( ! seg || ! active || ! glider ) {
			return;
		}
		glider.style.width = `${ active.offsetWidth }px`;
		glider.style.transform = `translateX(${ active.offsetLeft - 4 }px)`;
	}, [ match ] );

	useEffect( () => {
		positionGlider();
		window.addEventListener( 'resize', positionGlider );
		return () => window.removeEventListener( 'resize', positionGlider );
	}, [ positionGlider ] );

	const renderCondPanel = ( def, rule, active ) => {
		if ( ! active ) {
			return null;
		}

		if ( def.type === 'homepage' ) {
			return null;
		}

		if ( def.slugKey ) {
			return (
				<div className="nexulesuite_gd-cond-panel">
					<div className="pick-list">
						{ ( conditionMeta.postTypes || [] ).map( ( pt ) => {
							const slugs = Array.isArray( rule?.slugs ) ? rule.slugs : [];
							const checked = slugs.includes( pt.slug );
							return (
								<label key={ pt.slug } className="pick-item">
									<input
										type="checkbox"
										checked={ checked }
										onChange={ ( e ) => {
											const next = new Set( slugs );
											if ( e.target.checked ) {
												next.add( pt.slug );
											} else {
												next.delete( pt.slug );
											}
											updateRule( def.type, { slugs: [ ...next ] } );
										} }
										onClick={ ( e ) => e.stopPropagation() }
									/>
									{ pt.label }
								</label>
							);
						} ) }
					</div>
					<div className="phint">Select one or more post types to match.</div>
				</div>
			);
		}

		if ( def.taxonomy === 'category' ) {
			return (
				<div className="nexulesuite_gd-cond-panel">
					<div className="pick-list">
						{ ( conditionMeta.categories || [] ).map( ( cat ) => {
							const ids = Array.isArray( rule?.ids ) ? rule.ids : [];
							const checked = ids.includes( cat.id );
							return (
								<label key={ cat.id } className="pick-item">
									<input
										type="checkbox"
										checked={ checked }
										onChange={ ( e ) => {
											const next = new Set( ids );
											if ( e.target.checked ) {
												next.add( cat.id );
											} else {
												next.delete( cat.id );
											}
											updateRule( def.type, { ids: [ ...next ] } );
										} }
										onClick={ ( e ) => e.stopPropagation() }
									/>
									{ cat.name }
								</label>
							);
						} ) }
					</div>
					<div className="phint">Matches when the visitor is on one of these categories.</div>
				</div>
			);
		}

		if ( def.taxonomy === 'tag' ) {
			return (
				<div className="nexulesuite_gd-cond-panel">
					<div className="pick-list">
						{ ( conditionMeta.tags || [] ).map( ( tag ) => {
							const ids = Array.isArray( rule?.ids ) ? rule.ids : [];
							const checked = ids.includes( tag.id );
							return (
								<label key={ tag.id } className="pick-item">
									<input
										type="checkbox"
										checked={ checked }
										onChange={ ( e ) => {
											const next = new Set( ids );
											if ( e.target.checked ) {
												next.add( tag.id );
											} else {
												next.delete( tag.id );
											}
											updateRule( def.type, { ids: [ ...next ] } );
										} }
										onClick={ ( e ) => e.stopPropagation() }
									/>
									{ tag.name }
								</label>
							);
						} ) }
					</div>
					<div className="phint">Matches when the visitor is on one of these tags.</div>
				</div>
			);
		}

		if ( def.searchTypes && onSearchContent ) {
			return (
				<div className="nexulesuite_gd-cond-panel">
					<input
						type="search"
						placeholder={ RULE_REF_PLACEHOLDERS[ def.type ] || `Search ${ def.label.toLowerCase() }…` }
						onChange={ ( e ) => onSearchContent( `${ searchKeyPrefix }-${ def.type }`, def.searchTypes, e.target.value ) }
						onClick={ ( e ) => e.stopPropagation() }
					/>
					<div className="pick-list">
						{ ( contentSearch[ `${ searchKeyPrefix }-${ def.type }` ]?.results || [] ).map( ( item ) => {
							const ids = Array.isArray( rule?.ids ) ? rule.ids : [];
							const checked = ids.includes( item.id );
							return (
								<label key={ item.id } className="pick-item">
									<input
										type="checkbox"
										checked={ checked }
										onChange={ ( e ) => {
											const next = new Set( ids );
											if ( e.target.checked ) {
												next.add( item.id );
											} else {
												next.delete( item.id );
											}
											updateRule( def.type, { ids: [ ...next ] } );
										} }
										onClick={ ( e ) => e.stopPropagation() }
									/>
									{ item.title } (#{ item.id })
								</label>
							);
						} ) }
					</div>
					<div className="phint">Comma-separated. Matches when the visitor is on one of these.</div>
				</div>
			);
		}

		return null;
	};

	return (
		<>
			{ description ? <p className={ secSubClassName }>{ description }</p> : null }

			<div className="nexulesuite_gd-mode-bar">
				<span className="ml">Match mode</span>
				<div className="nexulesuite_gd-seg" ref={ segRef } role="tablist" aria-label="Match mode">
					<span className="glider" />
					<button
						ref={ orRef }
						type="button"
						className={ match === 'any' ? 'active' : '' }
						role="tab"
						aria-selected={ match === 'any' }
						onClick={ () => onChange( { match: 'any', rules } ) }
					>
						OR <span className="tag">Any rule</span>
					</button>
					<button
						ref={ andRef }
						type="button"
						className={ match === 'all' ? 'active' : '' }
						role="tab"
						aria-selected={ match === 'all' }
						onClick={ () => onChange( { match: 'all', rules } ) }
					>
						AND <span className="tag">All rules</span>
					</button>
				</div>
			</div>

			<div className="nexulesuite_gd-cond-grid">
				{ RULE_DEFS.map( ( def ) => {
					const active = rules.some( ( r ) => r.type === def.type );
					const rule = rules.find( ( r ) => r.type === def.type );
					return (
						<div key={ def.type } className={ `nexulesuite_gd-cond${ active ? ' on' : '' }` }>
							<div
								className="nexulesuite_gd-cond-top"
								role="button"
								tabIndex={ 0 }
								onClick={ () => toggleRule( def.type, ! active ) }
								onKeyDown={ ( e ) => {
									if ( e.key === ' ' || e.key === 'Enter' ) {
										e.preventDefault();
										toggleRule( def.type, ! active );
									}
								} }
							>
								<span className="nexulesuite_gd-cbox">
									<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5">
										<path d="M5 13l4 4L19 7" />
									</svg>
								</span>
								<span className="ci">
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
										{ RULE_REF_ICONS[ def.type ] }
									</svg>
								</span>
								<span className="cname">{ def.label }</span>
								<span className="ctag">{ RULE_REF_TAGS[ def.type ] }</span>
							</div>
							{ renderCondPanel( def, rule, active ) }
						</div>
					);
				} ) }
			</div>

			<div className="nexulesuite_gd-summary">
				<span className="si">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
						<path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z" />
						<path d="M9 12l2 2 4-4" />
					</svg>
				</span>
				<ReferenceConditionsSummary rules={ rules } match={ match } conditionMeta={ conditionMeta } context={ summaryContext } />
			</div>
		</>
	);
}

/**
 * Shared display-condition builder (pages, posts, taxonomies, etc.).
 *
 * @param {{
 *   conditions: { match?: string, rules?: Array<object> },
 *   onChange: (next: object) => void,
 *   conditionMeta: { postTypes?: Array<object>, categories?: Array<object>, tags?: Array<object> },
 *   contentSearch?: Record<string, { results?: Array<object> }>,
 *   onSearchContent?: (key: string, types: string, query: string) => void,
 *   searchKeyPrefix?: string,
 *   accent?: 'emerald' | 'blue',
 *   description?: string,
 *   headingIcon?: React.ReactNode,
 *   inputClassName?: string,
 *   cardClassName?: string,
 *   activeCardClassName?: string,
 *   variant?: 'default' | 'reference' | 'popup-reference',
 * }} props
 */
export function DisplayConditionsEditor( {
	conditions,
	onChange,
	conditionMeta = { postTypes: [], categories: [], tags: [] },
	contentSearch = {},
	onSearchContent,
	searchKeyPrefix = 'cond',
	accent = 'blue',
	description = 'Control which pages this item appears on. Multiple matching items can be active on the same page.',
	headingIcon = null,
	inputClassName = 'w-full p-2 text-xs border border-slate-200 rounded-lg',
	cardClassName = 'rounded-xl border p-4 border-slate-200',
	activeCardClassName = '',
	variant = 'default',
} ) {
	const rules = Array.isArray( conditions?.rules ) ? conditions.rules : [];
	const match = conditions?.match === 'all' ? 'all' : 'any';

	const activeBorder = accent === 'emerald'
		? 'border-emerald-300 bg-emerald-50/40'
		: 'border-blue-300 bg-blue-50/40';
	const resolvedActiveCard = activeCardClassName || activeBorder;

	const toggleRule = ( type, enabled ) => {
		const nextRules = [ ...rules ];
		const idx = nextRules.findIndex( ( r ) => r.type === type );
		if ( enabled && idx === -1 ) {
			const rule = { type };
			if ( type === 'post_type' ) {
				rule.slugs = [];
			} else if ( type !== 'homepage' ) {
				rule.ids = [];
			}
			nextRules.push( rule );
		} else if ( ! enabled && idx !== -1 ) {
			nextRules.splice( idx, 1 );
		}
		onChange( { match, rules: nextRules } );
	};

	const updateRule = ( type, patch ) => {
		onChange( {
			match,
			rules: rules.map( ( r ) => ( r.type === type ? { ...r, ...patch } : r ) ),
		} );
	};

	if ( variant === 'reference' || variant === 'popup-reference' ) {
		return (
			<ReferenceConditionsEditor
				conditions={ conditions }
				onChange={ onChange }
				conditionMeta={ conditionMeta }
				contentSearch={ contentSearch }
				onSearchContent={ onSearchContent }
				searchKeyPrefix={ searchKeyPrefix }
				description={ description }
				toggleRule={ toggleRule }
				updateRule={ updateRule }
				rules={ rules }
				match={ match }
				summaryContext={ variant === 'popup-reference' ? 'popup' : 'group' }
				secSubClassName={ variant === 'popup-reference' ? 'nexulesuite_pop-sec-sub' : 'nexulesuite_gd-sec-sub' }
			/>
		);
	}

	return (
		<div className="space-y-6">
			{ description ? <p className="text-xs text-slate-500">{ description }</p> : null }
			<div className="flex flex-wrap gap-3 items-center">
				<label className="text-xs font-bold text-slate-500 uppercase">Match mode</label>
				<select
					value={ match }
					onChange={ ( e ) => onChange( { match: e.target.value, rules } ) }
					className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
				>
					<option value="any">Any rule (OR)</option>
					<option value="all">All rules (AND)</option>
				</select>
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
				{ RULE_DEFS.map( ( def ) => {
					const active = rules.some( ( r ) => r.type === def.type );
					const rule = rules.find( ( r ) => r.type === def.type );
					return (
						<div
							key={ def.type }
							className={ `${ cardClassName } ${ active ? resolvedActiveCard : '' }` }
						>
							<label className="flex items-center gap-2 cursor-pointer">
								<input
									type="checkbox"
									checked={ active }
									onChange={ ( e ) => toggleRule( def.type, e.target.checked ) }
								/>
								<span className="text-sm font-semibold text-slate-700">{ def.label }</span>
							</label>
							{ active && def.slugKey ? (
								<div className="mt-3 max-h-36 overflow-y-auto space-y-1">
									{ ( conditionMeta.postTypes || [] ).map( ( pt ) => {
										const slugs = Array.isArray( rule?.slugs ) ? rule.slugs : [];
										const checked = slugs.includes( pt.slug );
										return (
											<label key={ pt.slug } className="flex items-center gap-2 text-xs text-slate-600">
												<input
													type="checkbox"
													checked={ checked }
													onChange={ ( e ) => {
														const next = new Set( slugs );
														if ( e.target.checked ) {
															next.add( pt.slug );
														} else {
															next.delete( pt.slug );
														}
														updateRule( def.type, { slugs: [ ...next ] } );
													} }
												/>
												{ pt.label }
											</label>
										);
									} ) }
								</div>
							) : null }
							{ active && def.taxonomy === 'category' ? (
								<div className="mt-3 max-h-36 overflow-y-auto space-y-1">
									{ ( conditionMeta.categories || [] ).map( ( cat ) => {
										const ids = Array.isArray( rule?.ids ) ? rule.ids : [];
										const checked = ids.includes( cat.id );
										return (
											<label key={ cat.id } className="flex items-center gap-2 text-xs text-slate-600">
												<input
													type="checkbox"
													checked={ checked }
													onChange={ ( e ) => {
														const next = new Set( ids );
														if ( e.target.checked ) {
															next.add( cat.id );
														} else {
															next.delete( cat.id );
														}
														updateRule( def.type, { ids: [ ...next ] } );
													} }
												/>
												{ cat.name }
											</label>
										);
									} ) }
								</div>
							) : null }
							{ active && def.taxonomy === 'tag' ? (
								<div className="mt-3 max-h-36 overflow-y-auto space-y-1">
									{ ( conditionMeta.tags || [] ).map( ( tag ) => {
										const ids = Array.isArray( rule?.ids ) ? rule.ids : [];
										const checked = ids.includes( tag.id );
										return (
											<label key={ tag.id } className="flex items-center gap-2 text-xs text-slate-600">
												<input
													type="checkbox"
													checked={ checked }
													onChange={ ( e ) => {
														const next = new Set( ids );
														if ( e.target.checked ) {
															next.add( tag.id );
														} else {
															next.delete( tag.id );
														}
														updateRule( def.type, { ids: [ ...next ] } );
													} }
												/>
												{ tag.name }
											</label>
										);
									} ) }
								</div>
							) : null }
							{ active && def.searchTypes && onSearchContent ? (
								<div className="mt-3 space-y-2">
									<input
										type="search"
										placeholder={ `Search ${ def.label.toLowerCase() }…` }
										className={ inputClassName }
										onChange={ ( e ) => onSearchContent( `${ searchKeyPrefix }-${ def.type }`, def.searchTypes, e.target.value ) }
									/>
									<div className="max-h-28 overflow-y-auto space-y-1">
										{ ( contentSearch[ `${ searchKeyPrefix }-${ def.type }` ]?.results || [] ).map( ( item ) => {
											const ids = Array.isArray( rule?.ids ) ? rule.ids : [];
											const checked = ids.includes( item.id );
											return (
												<label key={ item.id } className="flex items-center gap-2 text-xs text-slate-600">
													<input
														type="checkbox"
														checked={ checked }
														onChange={ ( e ) => {
															const next = new Set( ids );
															if ( e.target.checked ) {
																next.add( item.id );
															} else {
																next.delete( item.id );
															}
															updateRule( def.type, { ids: [ ...next ] } );
														} }
													/>
													{ item.title } (#{ item.id })
												</label>
											);
										} ) }
									</div>
								</div>
							) : null }
						</div>
					);
				} ) }
			</div>
			{ rules.length > 0 ? (
				<div className="rounded-xl bg-slate-900 p-4 text-[11px] font-mono text-blue-300">
					<div className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">Active rules</div>
					{ rules.map( ( rule ) => (
						<div key={ rule.type }>• { ruleLabel( rule, conditionMeta ) }</div>
					) ) }
				</div>
			) : null }
			{ headingIcon }
		</div>
	);
}
