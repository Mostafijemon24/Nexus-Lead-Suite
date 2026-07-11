/**
 * Form-level "Conditional Confirmations" editor (Fluent-Forms-Pro style).
 *
 * A form holds an ordered `confirmations` list + an `emailRoutes` list:
 *   confirmation = { id, name, isDefault, type:'message'|'redirect', message, redirectUrl,
 *                    conditional: { enabled, match:'all'|'any', rules:[{field,operator,value}] } }
 *   emailRoute   = { id, recipient, conditional:{…} }
 *
 * On submit the server evaluates the conditional confirmations top-to-bottom and uses the first
 * match; if none match, the single `isDefault` confirmation is used. Rules reference the builder
 * field ids (same shape as the per-field ConditionalLogicEditor).
 */
import React from 'react';
import { Plus, Trash2, MessageSquare, Mail } from 'lucide-react';
import { collectStepFieldDescriptors } from './core.js';

const OPERATORS = [
	{ value: 'is', label: 'is' },
	{ value: 'is_not', label: 'is not' },
	{ value: 'contains', label: 'contains' },
	{ value: 'starts_with', label: 'starts with' },
	{ value: 'ends_with', label: 'ends with' },
	{ value: 'greater_than', label: 'greater than' },
	{ value: 'less_than', label: 'less than' },
	{ value: 'is_empty', label: 'is empty' },
	{ value: 'is_not_empty', label: 'is not empty' },
];
const VALUELESS_OPS = new Set( [ 'is_empty', 'is_not_empty' ] );
const EMPTY_RULE = { field: '', operator: 'is', value: '' };

/** Every input-field descriptor across all steps (id, label, options) — the rule controllers. */
export function formFieldDescriptors( form ) {
	const out = [];
	( form?.steps || [] ).forEach( ( step ) => {
		collectStepFieldDescriptors( step?.fields || [] ).forEach( ( d ) => out.push( d ) );
	} );
	return out;
}

/** Rule rows shared by confirmations + email routes: match all/any + [field][operator][value]. */
function ConditionRows( { cond, fields, onChange } ) {
	const c = {
		enabled: !! cond?.enabled,
		match: cond?.match === 'any' ? 'any' : 'all',
		rules: Array.isArray( cond?.rules ) ? cond.rules : [],
	};
	const emit = ( patch ) => onChange( { ...c, ...patch } );
	const setRule = ( i, patch ) => emit( { rules: c.rules.map( ( r, j ) => ( j === i ? { ...r, ...patch } : r ) ) } );
	const addRule = () => emit( { enabled: true, rules: [ ...c.rules, { ...EMPTY_RULE, field: fields[ 0 ]?.id || '' } ] } );
	const removeRule = ( i ) => {
		const rules = c.rules.filter( ( _r, j ) => j !== i );
		emit( { rules, enabled: rules.length > 0 } );
	};

	if ( fields.length === 0 ) {
		return (
			<p className="rounded-lg border border-dashed border-slate-200 bg-white px-3 py-3 text-center text-xs text-slate-500">
				Add fields to the form to build conditions.
			</p>
		);
	}

	return (
		<div className="space-y-2">
			<div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
				<span>Use this when</span>
				<select
					value={ c.match }
					onChange={ ( e ) => emit( { match: e.target.value } ) }
					className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold"
				>
					<option value="all">all</option>
					<option value="any">any</option>
				</select>
				<span>of these match:</span>
			</div>
			{ c.rules.map( ( rule, idx ) => {
				const ctl = fields.find( ( o ) => o.id === rule.field );
				const hasOpts = ctl && ctl.options && ctl.options.length > 0;
				const needsVal = ! VALUELESS_OPS.has( rule.operator );
				return (
					<div key={ idx } className="grid grid-cols-[1fr_auto] gap-2 rounded-xl border border-slate-200 bg-white p-2">
						<div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
							<select
								value={ rule.field }
								onChange={ ( e ) => setRule( idx, { field: e.target.value } ) }
								className="h-8 min-w-0 rounded-lg border border-slate-200 bg-white px-2 text-xs"
							>
								<option value="" disabled>Select field…</option>
								{ fields.map( ( o ) => <option key={ o.id } value={ o.id }>{ o.label }</option> ) }
							</select>
							<select
								value={ rule.operator }
								onChange={ ( e ) => setRule( idx, { operator: e.target.value } ) }
								className="h-8 min-w-0 rounded-lg border border-slate-200 bg-white px-2 text-xs"
							>
								{ OPERATORS.map( ( op ) => <option key={ op.value } value={ op.value }>{ op.label }</option> ) }
							</select>
							{ needsVal ? (
								hasOpts ? (
									<select
										value={ rule.value }
										onChange={ ( e ) => setRule( idx, { value: e.target.value } ) }
										className="h-8 min-w-0 rounded-lg border border-slate-200 bg-white px-2 text-xs"
									>
										<option value="" disabled>Select value…</option>
										{ ctl.options.map( ( o, i ) => <option key={ i } value={ o.value }>{ o.label }</option> ) }
									</select>
								) : (
									<input
										type="text"
										value={ rule.value }
										onChange={ ( e ) => setRule( idx, { value: e.target.value } ) }
										placeholder="Value"
										className="h-8 min-w-0 rounded-lg border border-slate-200 bg-white px-2 text-xs"
									/>
								)
							) : (
								<span className="flex h-8 items-center px-2 text-[11px] italic text-slate-400">no value</span>
							) }
						</div>
						<button
							type="button"
							onClick={ () => removeRule( idx ) }
							className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"
							title="Remove condition"
							aria-label="Remove condition"
						>
							<Trash2 size={ 14 } />
						</button>
					</div>
				);
			} ) }
			<button
				type="button"
				onClick={ addRule }
				className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-violet-300 hover:text-violet-700"
			>
				<Plus size={ 14 } />
				Add condition
			</button>
		</div>
	);
}

export function ConfirmationsEditor( { form, onUpdate } ) {
	const fields = formFieldDescriptors( form );
	const confirmations = Array.isArray( form?.confirmations ) ? form.confirmations : [];
	const emailRoutes = Array.isArray( form?.emailRoutes ) ? form.emailRoutes : [];

	const setConfirmations = ( next ) => onUpdate( { confirmations: next } );
	const updateConf = ( id, patch ) => setConfirmations( confirmations.map( ( c ) => ( c.id === id ? { ...c, ...patch } : c ) ) );
	const removeConf = ( id ) => setConfirmations( confirmations.filter( ( c ) => c.id !== id ) );
	const addConf = () => setConfirmations( [
		...confirmations,
		{
			id: `confirm-${ Date.now().toString( 36 ) }`,
			name: `Confirmation ${ confirmations.length + 1 }`,
			isDefault: false,
			type: 'message',
			message: '',
			redirectUrl: '',
			conditional: { enabled: true, match: 'all', rules: [ { ...EMPTY_RULE, field: fields[ 0 ]?.id || '' } ] },
		},
	] );
	const moveConf = ( id, dir ) => {
		const i = confirmations.findIndex( ( c ) => c.id === id );
		const j = i + dir;
		if ( i < 0 || j < 0 || j >= confirmations.length ) return;
		if ( confirmations[ i ].isDefault || confirmations[ j ].isDefault ) return; // keep the default pinned at the top
		const next = confirmations.slice();
		[ next[ i ], next[ j ] ] = [ next[ j ], next[ i ] ];
		setConfirmations( next );
	};

	const setRoutes = ( next ) => onUpdate( { emailRoutes: next } );
	const updateRoute = ( id, patch ) => setRoutes( emailRoutes.map( ( r ) => ( r.id === id ? { ...r, ...patch } : r ) ) );
	const removeRoute = ( id ) => setRoutes( emailRoutes.filter( ( r ) => r.id !== id ) );
	const addRoute = () => setRoutes( [
		...emailRoutes,
		{ id: `route-${ Date.now().toString( 36 ) }`, recipient: '', conditional: { enabled: true, match: 'all', rules: [ { ...EMPTY_RULE, field: fields[ 0 ]?.id || '' } ] } },
	] );

	return (
		<div className="space-y-6">
			<section className="nexulesuite_fb-section is-first">
				<div className="nexulesuite_fb-sec-head">
					<span className="nexulesuite_fb-sec-ico"><MessageSquare size={ 16 } /></span>
					<span className="nexulesuite_fb-sec-title">Confirmations</span>
				</div>
				<p className="hint" style={ { marginTop: '-6px', marginBottom: '12px' } }>
					After a submit, the first confirmation whose conditions match (top to bottom) is used. If none match, the default is shown.
				</p>
				<div className="space-y-3">
					{ confirmations.map( ( c ) => (
						<div key={ c.id } className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/60 shadow-sm">
							<div className="flex items-center gap-2 border-b border-slate-200 bg-white px-3 py-2">
								{ c.isDefault ? (
									<span className="rounded-md bg-violet-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-violet-700">Default</span>
								) : (
									<span className="flex flex-col leading-none text-slate-400">
										<button type="button" onClick={ () => moveConf( c.id, -1 ) } className="px-1 hover:text-slate-700" title="Move up" aria-label="Move up">▲</button>
										<button type="button" onClick={ () => moveConf( c.id, 1 ) } className="px-1 hover:text-slate-700" title="Move down" aria-label="Move down">▼</button>
									</span>
								) }
								<input
									type="text"
									value={ c.name }
									onChange={ ( e ) => updateConf( c.id, { name: e.target.value } ) }
									className="min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-1.5 py-1 text-sm font-semibold text-slate-800 hover:border-slate-200 focus:border-slate-300 focus:bg-white focus:outline-none"
								/>
								<select
									value={ c.type }
									onChange={ ( e ) => updateConf( c.id, { type: e.target.value } ) }
									className="h-8 flex-none rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold"
								>
									<option value="message">Message</option>
									<option value="redirect">Redirect</option>
								</select>
								{ ! c.isDefault && (
									<button type="button" onClick={ () => removeConf( c.id ) } className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600" title="Delete confirmation" aria-label="Delete confirmation">
										<Trash2 size={ 15 } />
									</button>
								) }
							</div>
							<div className="space-y-3 p-3">
								{ c.type === 'redirect' ? (
									<label className="block">
										<span className="mb-1 block text-xs font-semibold text-slate-600">Redirect URL</span>
										<input
											type="url"
											value={ c.redirectUrl }
											onChange={ ( e ) => updateConf( c.id, { redirectUrl: e.target.value } ) }
											placeholder="https://example.com/thank-you"
											className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-sm"
										/>
										<span className="mt-1 block text-[11px] text-slate-400">Visitor is sent here after submit — a page URL on your site or any external URL.</span>
									</label>
								) : (
									<label className="block">
										<span className="mb-1 block text-xs font-semibold text-slate-600">Confirmation message</span>
										<textarea
											value={ c.message }
											onChange={ ( e ) => updateConf( c.id, { message: e.target.value } ) }
											rows={ 3 }
											placeholder="Thank you! We'll be in touch soon."
											className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm"
										/>
										<span className="mt-1 block text-[11px] text-slate-400">Shown in place of the form. Basic HTML allowed.</span>
									</label>
								) }
								{ ! c.isDefault && (
									<div className="rounded-xl border border-slate-200 bg-white p-2.5">
										<ConditionRows cond={ c.conditional } fields={ fields } onChange={ ( conditional ) => updateConf( c.id, { conditional } ) } />
									</div>
								) }
							</div>
						</div>
					) ) }
				</div>
				<button
					type="button"
					onClick={ addConf }
					className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:border-violet-300 hover:text-violet-700"
				>
					<Plus size={ 14 } />
					Add confirmation
				</button>
			</section>

			<section className="nexulesuite_fb-section">
				<div className="nexulesuite_fb-sec-head">
					<span className="nexulesuite_fb-sec-ico is-amber"><Mail size={ 16 } /></span>
					<span className="nexulesuite_fb-sec-title">Conditional email routing</span>
				</div>
				<p className="hint" style={ { marginTop: '-6px', marginBottom: '12px' } }>
					Also send the submission notification to extra recipient(s) when conditions match — on top of the base notification email.
				</p>
				<div className="space-y-3">
					{ emailRoutes.map( ( r ) => (
						<div key={ r.id } className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/60 shadow-sm">
							<div className="flex items-center gap-2 border-b border-slate-200 bg-white px-3 py-2">
								<input
									type="text"
									value={ r.recipient }
									onChange={ ( e ) => updateRoute( r.id, { recipient: e.target.value } ) }
									placeholder="sales@example.com, other@example.com"
									className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm"
								/>
								<button type="button" onClick={ () => removeRoute( r.id ) } className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600" title="Delete route" aria-label="Delete route">
									<Trash2 size={ 15 } />
								</button>
							</div>
							<div className="p-3">
								<ConditionRows cond={ r.conditional } fields={ fields } onChange={ ( conditional ) => updateRoute( r.id, { conditional } ) } />
							</div>
						</div>
					) ) }
				</div>
				<button
					type="button"
					onClick={ addRoute }
					className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:border-amber-300 hover:text-amber-700"
				>
					<Plus size={ 14 } />
					Add email route
				</button>
			</section>
		</div>
	);
}
