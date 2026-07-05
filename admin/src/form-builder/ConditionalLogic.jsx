/**
 * Conditional-logic editor for a single form field.
 *
 * Lets a builder show or hide the selected field based on the live value of
 * other fields in the same step. The rule shape persisted into
 * `settings.conditional` is:
 *
 *   { enabled, action: 'show'|'hide', match: 'all'|'any',
 *     rules: [ { field: <controllerFieldId>, operator, value } ] }
 *
 * The frontend runtime (public/js/forms-runtime.js) reads the same shape from a
 * `data-nexulesuite_conditional` attribute and toggles the field live.
 */
import React from 'react';
import { GitBranch, Plus, Trash2 } from 'lucide-react';

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

/** Operators that don't need a comparison value. */
const VALUELESS_OPS = new Set( [ 'is_empty', 'is_not_empty' ] );

const EMPTY_RULE = { field: '', operator: 'is', value: '' };

function normalizeConditional( raw ) {
	const c = raw && typeof raw === 'object' ? raw : {};
	return {
		enabled: !! c.enabled,
		action: c.action === 'hide' ? 'hide' : 'show',
		match: c.match === 'any' ? 'any' : 'all',
		rules: Array.isArray( c.rules ) ? c.rules : [],
	};
}

export function ConditionalLogicEditor( { field, fields = [], onChange } ) {
	if ( ! field ) {
		return null;
	}
	const cond = normalizeConditional( field.settings?.conditional );
	const others = Array.isArray( fields ) ? fields : [];

	const emit = ( patch ) => {
		onChange?.( { ...cond, ...patch } );
	};

	const setRule = ( idx, patch ) => {
		const rules = cond.rules.map( ( r, i ) => ( i === idx ? { ...r, ...patch } : r ) );
		emit( { rules } );
	};

	const addRule = () => {
		emit( { rules: [ ...cond.rules, { ...EMPTY_RULE, field: others[ 0 ]?.id || '' } ] } );
	};

	const removeRule = ( idx ) => {
		emit( { rules: cond.rules.filter( ( _r, i ) => i !== idx ) } );
	};

	const toggleEnabled = ( on ) => {
		if ( on && cond.rules.length === 0 ) {
			emit( { enabled: true, rules: [ { ...EMPTY_RULE, field: others[ 0 ]?.id || '' } ] } );
		} else {
			emit( { enabled: on } );
		}
	};

	return (
		<div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
			<button
				type="button"
				onClick={ () => toggleEnabled( ! cond.enabled ) }
				aria-pressed={ cond.enabled }
				className="flex w-full items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 text-left transition-colors hover:bg-slate-50"
			>
				<span className="flex items-center gap-2">
					<span className="flex h-7 w-7 flex-none items-center justify-center rounded-lg bg-violet-50 text-violet-600">
						<GitBranch size={ 15 } />
					</span>
					<span className="block">
						<span className="block text-sm font-semibold text-slate-800">Conditional Logic</span>
						<span className="block text-xs text-slate-400">Show or hide this field based on other answers.</span>
					</span>
				</span>
				<span
					role="switch"
					aria-checked={ cond.enabled }
					className={ `relative inline-flex h-6 w-11 flex-none items-center rounded-full transition-colors ${ cond.enabled ? 'bg-violet-600' : 'bg-slate-300' }` }
				>
					<span
						className={ `inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${ cond.enabled ? 'translate-x-[22px]' : 'translate-x-0.5' }` }
					/>
				</span>
			</button>

			{ cond.enabled && (
				<div className="space-y-4 p-4">
					{ others.length === 0 ? (
						<p className="rounded-lg border border-dashed border-slate-200 bg-slate-50/60 px-3 py-4 text-center text-xs text-slate-500">
							Add at least one more field to this step to build a condition.
						</p>
					) : (
						<>
							<div className="flex flex-wrap items-center gap-2 text-sm text-slate-700">
								<select
									value={ cond.action }
									onChange={ ( e ) => emit( { action: e.target.value } ) }
									className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm font-semibold outline-none ring-violet-200 focus:ring-2"
								>
									<option value="show">Show</option>
									<option value="hide">Hide</option>
								</select>
								<span>this field when</span>
								<select
									value={ cond.match }
									onChange={ ( e ) => emit( { match: e.target.value } ) }
									className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm font-semibold outline-none ring-violet-200 focus:ring-2"
								>
									<option value="all">all</option>
									<option value="any">any</option>
								</select>
								<span>of these match:</span>
							</div>

							<div className="space-y-2">
								{ cond.rules.map( ( rule, idx ) => {
									const controller = others.find( ( o ) => o.id === rule.field );
									const hasOptions = controller && controller.options && controller.options.length > 0;
									const needsValue = ! VALUELESS_OPS.has( rule.operator );
									return (
										<div
											key={ idx }
											className="grid grid-cols-1 gap-2 rounded-xl border border-slate-200 bg-slate-50/50 p-2 sm:grid-cols-[1fr_auto]"
										>
											<div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
												<select
													value={ rule.field }
													onChange={ ( e ) => setRule( idx, { field: e.target.value } ) }
													className="h-9 min-w-0 rounded-lg border border-slate-200 bg-white px-2 text-sm outline-none ring-violet-200 focus:ring-2"
												>
													<option value="" disabled>
														Select field…
													</option>
													{ others.map( ( o ) => (
														<option key={ o.id } value={ o.id }>
															{ o.label }
														</option>
													) ) }
												</select>
												<select
													value={ rule.operator }
													onChange={ ( e ) => setRule( idx, { operator: e.target.value } ) }
													className="h-9 min-w-0 rounded-lg border border-slate-200 bg-white px-2 text-sm outline-none ring-violet-200 focus:ring-2"
												>
													{ OPERATORS.map( ( op ) => (
														<option key={ op.value } value={ op.value }>
															{ op.label }
														</option>
													) ) }
												</select>
												{ needsValue ? (
													hasOptions ? (
														<select
															value={ rule.value }
															onChange={ ( e ) => setRule( idx, { value: e.target.value } ) }
															className="h-9 min-w-0 rounded-lg border border-slate-200 bg-white px-2 text-sm outline-none ring-violet-200 focus:ring-2"
														>
															<option value="" disabled>
																Select value…
															</option>
															{ controller.options.map( ( o, i ) => (
																<option key={ i } value={ o.value }>
																	{ o.label }
																</option>
															) ) }
														</select>
													) : (
														<input
															type="text"
															value={ rule.value }
															onChange={ ( e ) => setRule( idx, { value: e.target.value } ) }
															placeholder="Value"
															className="h-9 min-w-0 rounded-lg border border-slate-200 bg-white px-2 text-sm outline-none ring-violet-200 focus:ring-2"
														/>
													)
												) : (
													<span className="flex h-9 items-center px-2 text-xs italic text-slate-400">
														no value needed
													</span>
												) }
											</div>
											<button
												type="button"
												onClick={ () => removeRule( idx ) }
												className="inline-flex h-9 w-9 items-center justify-center justify-self-end rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
												title="Remove condition"
												aria-label="Remove condition"
											>
												<Trash2 size={ 15 } />
											</button>
										</div>
									);
								} ) }
							</div>

							<button
								type="button"
								onClick={ addRule }
								className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-violet-300 hover:text-violet-700"
							>
								<Plus size={ 14 } />
								Add condition
							</button>
						</>
					) }
				</div>
			) }
		</div>
	);
}
