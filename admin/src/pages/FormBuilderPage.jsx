import React, { useEffect, useMemo, useState } from 'react';
import { AdminTopBar } from '../components/AdminTopBar.jsx';
import { ChevronDown, Clipboard, Copy, Eye, GripVertical, Plus, Trash2, X } from 'lucide-react';
import { DynamicFieldsBuilder } from '../form-builder/DynamicFieldsBuilder.jsx';
import { FieldSettingsInline } from '../form-builder/FieldSettingsInline.jsx';
import { FormPreviewModal } from '../form-builder/FormPreviewModal.jsx';

const fieldTypes = [
	{ value: 'text', label: 'Text' },
	{ value: 'email', label: 'Email' },
	{ value: 'phone', label: 'Phone' },
	{ value: 'textarea', label: 'Textarea' },
	{ value: 'select', label: 'Select' },
	{ value: 'radio', label: 'Radio' },
	{ value: 'checkbox', label: 'Checkbox' },
	{ value: 'date', label: 'Date' },
	{ value: 'time', label: 'Time' },
	{ value: 'datetime', label: 'Date & Time' },
	{ value: 'number', label: 'Number' },
];

function Pill( { children } ) {
	return <span className="rounded-md bg-violet-50 px-2 py-0.5 text-[11px] font-bold text-violet-700">{ children }</span>;
}

function copyShortcode( formId, onCopied ) {
	const shortcode = `[smart_trigger_form id="${ formId }"]`;
	if ( navigator?.clipboard?.writeText ) {
		navigator.clipboard.writeText( shortcode );
	}
	onCopied( formId );
	window.setTimeout( () => onCopied( null ), 2000 );
}

const INITIAL = [
	{
		id: 'form-1',
		name: 'Contact Form',
		formType: 'simple',
		submitBtnText: 'Submit',
		steps: [
			{
				id: 'step-1',
				title: 'Contact Information',
				subtitle: 'Please fill in your details',
				fields: [],
			},
		],
	},
];

function createBlankFormTemplate() {
	return {
		...INITIAL[ 0 ],
		// Ensure fresh step ids to avoid collisions in UI.
		steps: [
			{
				...INITIAL[ 0 ].steps[ 0 ],
				id: `step-${ Date.now() }`,
				fields: [],
			},
		],
	};
}

async function apiFetch( path, options = {} ) {
	const base = window?.nexusLsAdmin?.restUrl || '';
	const url = base.replace( /\/$/, '' ) + path;

	const res = await fetch( url, {
		...options,
		headers: {
			'Content-Type': 'application/json',
			'X-WP-Nonce': window?.nexusLsAdmin?.nonce || '',
			...( options.headers || {} ),
		},
	} );

	const json = await res.json().catch( () => null );
	if ( ! res.ok ) {
		const msg = json?.message || json?.data?.message || `Request failed (${ res.status })`;
		throw new Error( msg );
	}
	return json;
}

function FormItem( { form, expanded, activeTab, onToggle, onDelete, onDuplicate, onUpdate, onTabChange, copiedId, onCopiedIdChange, onPreview } ) {
	return (
		<li className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
			<button type="button" onClick={ onToggle } className="flex w-full items-center justify-between border-b border-slate-200 px-4 py-3 text-left">
				<div className="flex items-center gap-3">
					<span className="text-sm font-semibold text-slate-800">{ form.name || 'Untitled Form' }</span>
					<span className="rounded-full bg-violet-50 px-2 py-0.5 text-xs font-semibold text-violet-700">
						{ form.formType === 'multi' ? 'Multi-Step' : 'Simple' }
					</span>
				</div>
				<div className="flex items-center gap-1" onClick={ ( e ) => e.stopPropagation() }>
					<button
						type="button"
						onClick={ () => onPreview?.( form.id ) }
						className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700"
						title="Preview"
					>
						<Eye className="h-4 w-4" />
					</button>
					<button
						type="button"
						onClick={ () => copyShortcode( form.id, onCopiedIdChange ) }
						className={ [
							'inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
							copiedId === form.id ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700',
						].join( ' ' ) }
						title="Copy shortcode"
					>
						<Clipboard className="h-4 w-4" />
					</button>
					<button
						type="button"
						onClick={ () => onDuplicate( form.id ) }
						className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700"
						title="Duplicate"
					>
						<Copy className="h-4 w-4" />
					</button>
					<button
						type="button"
						onClick={ () => onDelete( form.id ) }
						className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-700"
						title="Delete"
					>
						<Trash2 className="h-4 w-4" />
					</button>
					<ChevronDown className={ [ 'h-4 w-4 text-slate-400 transition-transform', expanded ? 'rotate-180' : '' ].join( ' ' ) } />
				</div>
			</button>

			{ expanded && (
				<div className="space-y-6 px-4 py-4">
					{/* Form Name & Shortcode */}
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div>
							<label className="mb-1.5 block text-sm font-semibold text-slate-700">Form Name</label>
							<input
								type="text"
								value={ form.name }
								onChange={ ( e ) => onUpdate( form.id, { name: e.target.value } ) }
								className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none ring-violet-200 focus:ring-2"
							/>
						</div>
						<div>
							<label className="mb-1.5 block text-sm font-semibold text-slate-700">Shortcode</label>
							<div className="flex items-center gap-2">
								<code className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm text-slate-700">
									[smart_trigger_form id=&quot;{ form.id }&quot;]
								</code>
								<button
									type="button"
									onClick={ () => copyShortcode( form.id, onCopiedIdChange ) }
									className={ [
										'rounded-lg px-3 py-2 text-xs font-semibold transition-colors',
										copiedId === form.id ? 'bg-emerald-100 text-emerald-700' : 'bg-violet-600 text-white hover:bg-violet-700',
									].join( ' ' ) }
								>
									{ copiedId === form.id ? 'Copied!' : 'Copy' }
								</button>
							</div>
						</div>
					</div>

					{/* Tabs */}
					<div className="flex border-b border-slate-200">
						{ [ 'fields', 'styling', 'advanced' ].map( ( tab ) => (
							<button
								key={ tab }
								type="button"
								onClick={ () => onTabChange( tab ) }
								className={ [
									'-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors',
									activeTab === tab ? 'border-violet-600 text-violet-700' : 'border-transparent text-slate-400 hover:text-slate-700',
								].join( ' ' ) }
							>
								{ tab.charAt( 0 ).toUpperCase() + tab.slice( 1 ) }
							</button>
						) ) }
					</div>

					{/* Fields */}
					{ activeTab === 'fields' && (
						<div className="space-y-4">
							<DynamicFieldsBuilder
								form={ form }
								onPatchForm={ ( patch ) => {
									onUpdate( form.id, patch );
								} }
								onSelectionChange={ form.onSelectionChange }
							/>
						</div>
					) }

					{/* Styling */}
					{ activeTab === 'styling' && (
						<div className="space-y-4">
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								{ [
									[ 'Background Color', 'backgroundColor' ],
									[ 'Text Color', 'textColor' ],
									[ 'Button Color', 'buttonColor' ],
									[ 'Stepper Color', 'stepperColor' ],
								].map( ( [ label, key ] ) => (
									<div key={ key }>
										<label className="mb-1.5 block text-sm font-semibold text-slate-700">{ label }</label>
										<div className="flex items-center gap-2">
											<input
												type="color"
												value={ form.styling[ key ] }
												onChange={ ( e ) => onUpdate( form.id, { styling: { ...form.styling, [ key ]: e.target.value } } ) }
												className="h-10 w-10 cursor-pointer rounded border border-slate-200"
											/>
											<input
												type="text"
												value={ form.styling[ key ] }
												onChange={ ( e ) => onUpdate( form.id, { styling: { ...form.styling, [ key ]: e.target.value } } ) }
												className="h-10 flex-1 rounded-lg border border-slate-200 bg-white px-3 font-mono text-sm outline-none"
											/>
										</div>
									</div>
								) ) }
							</div>

							<div>
								<label className="mb-1.5 block text-sm font-semibold text-slate-700">Submit Button Text</label>
								<input
									type="text"
									value={ form.submitBtnText }
									onChange={ ( e ) => onUpdate( form.id, { submitBtnText: e.target.value } ) }
									className="h-10 w-full max-w-xs rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none ring-violet-200 focus:ring-2"
								/>
							</div>
						</div>
					) }

					{/* Advanced */}
					{ activeTab === 'advanced' && (
						<div className="space-y-4">
							<div>
								<label className="mb-1.5 block text-sm font-semibold text-slate-700">Custom Header HTML</label>
								<textarea
									value={ form.customHTML.header }
									onChange={ ( e ) => onUpdate( form.id, { customHTML: { ...form.customHTML, header: e.target.value } } ) }
									rows={ 3 }
									placeholder="<div>Your custom header HTML...</div>"
									className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm outline-none ring-violet-200 focus:ring-2"
								/>
							</div>
							<div>
								<label className="mb-1.5 block text-sm font-semibold text-slate-700">Custom Footer HTML</label>
								<textarea
									value={ form.customHTML.footer }
									onChange={ ( e ) => onUpdate( form.id, { customHTML: { ...form.customHTML, footer: e.target.value } } ) }
									rows={ 3 }
									placeholder="<div>Your custom footer HTML...</div>"
									className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm outline-none ring-violet-200 focus:ring-2"
								/>
							</div>
							<div>
								<label className="mb-1.5 block text-sm font-semibold text-slate-700">Custom CSS</label>
								<textarea
									value={ form.customCSS }
									onChange={ ( e ) => onUpdate( form.id, { customCSS: e.target.value } ) }
									rows={ 5 }
									placeholder=".smart-trigger-form { /* your styles */ }"
									className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm outline-none ring-violet-200 focus:ring-2"
								/>
							</div>
							<div>
								<label className="mb-1.5 block text-sm font-semibold text-slate-700">Terms & Conditions Text</label>
								<textarea
									value={ form.termsConditionText }
									onChange={ ( e ) => onUpdate( form.id, { termsConditionText: e.target.value } ) }
									rows={ 2 }
									placeholder="I agree to the terms and conditions"
									className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-violet-200 focus:ring-2"
								/>
							</div>
						</div>
					) }
				</div>
			) }
		</li>
	);
}

export function FormBuilderPage() {
	const [ search, setSearch ] = useState( '' );
	const bootForms = window?.nexusLsAdmin?.formsPayload?.forms;
	const [ items, setItems ] = useState( Array.isArray( bootForms ) ? bootForms : [] );
	const [ expandedId, setExpandedId ] = useState( null );
	const [ copiedId, setCopiedId ] = useState( null );
	const [ activeTab, setActiveTab ] = useState( 'fields' );
	const [ saving, setSaving ] = useState( false );
	const [ saveError, setSaveError ] = useState( '' );
	const [ selectedCtx, setSelectedCtx ] = useState( null );
	const [ previewFormId, setPreviewFormId ] = useState( null );
	const [ loadingForms, setLoadingForms ] = useState( false );

	useEffect( () => {
		let alive = true;
		setLoadingForms( true );
		( async () => {
			try {
				const res = await apiFetch( '/nexus-lead-suite/v1/forms' );
				const payload = res?.data?.payload;
				const forms = payload?.forms;
				if ( alive && Array.isArray( forms ) ) {
					setItems( forms );
				}
			} catch ( e ) {
				// Keep defaults if API unavailable.
			} finally {
				if ( alive ) setLoadingForms( false );
			}
		} )();
		return () => {
			alive = false;
		};
	}, [] );

	const filtered = useMemo( () => {
		const q = search.trim().toLowerCase();
		if ( q.length === 0 ) {
			return items;
		}
		return items.filter( ( i ) => ( i.name + ' ' + i.id ).toLowerCase().includes( q ) );
	}, [ items, search ] );

	const previewForm = useMemo( () => {
		if ( ! previewFormId ) return null;
		return items.find( ( f ) => f.id === previewFormId ) || null;
	}, [ items, previewFormId ] );

	const saveAll = async () => {
		setSaving( true );
		setSaveError( '' );
		try {
			await apiFetch( '/nexus-lead-suite/v1/forms', {
				method: 'POST',
				body: JSON.stringify( { payload: { forms: items } } ),
			} );
		} catch ( e ) {
			setSaveError( e?.message || 'Save failed.' );
		} finally {
			setSaving( false );
		}
	};

	return (
		<div className="min-h-screen bg-[#f6f7fb] px-8 py-6 text-slate-800">
			<AdminTopBar title="Form Builder" search={ search } onSearchChange={ setSearch } />

			<div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-12">
				<div className="lg:col-span-9">
					<div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
						{ loadingForms && (
							<div className="mb-3 rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-xs font-semibold text-slate-500">
								Loading saved forms…
							</div>
						) }
						<ul className="space-y-3">
							{ filtered.map( ( form ) => (
								<FormItem
									key={ form.id }
									form={ { ...form, onSelectionChange: setSelectedCtx } }
									expanded={ expandedId === form.id }
									activeTab={ activeTab }
									onToggle={ () => setExpandedId( ( cur ) => ( cur === form.id ? null : form.id ) ) }
									onPreview={ ( id ) => setPreviewFormId( id ) }
									onDelete={ ( id ) => {
										setItems( ( prev ) => prev.filter( ( f ) => f.id !== id ) );
										setExpandedId( ( cur ) => ( cur === id ? null : cur ) );
										setSelectedCtx( null );
										setPreviewFormId( ( cur ) => ( cur === id ? null : cur ) );
									} }
									onDuplicate={ ( id ) => {
										const source = items.find( ( f ) => f.id === id );
										if ( ! source ) return;
										const newId = `form-${ items.length + 1 }`;
										setItems( ( prev ) => [ ...prev, { ...source, id: newId, name: `${ source.name } (Copy)` } ] );
										setExpandedId( newId );
										setSelectedCtx( null );
									} }
									onUpdate={ ( id, patch ) => setItems( ( prev ) => prev.map( ( f ) => ( f.id === id ? { ...f, ...patch } : f ) ) ) }
									onTabChange={ setActiveTab }
									copiedId={ copiedId }
									onCopiedIdChange={ setCopiedId }
								/>
							) ) }
						</ul>

						{ filtered.length === 0 && (
							<div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/40 p-8 text-center">
								<p className="text-sm font-semibold text-slate-700">No forms yet</p>
								<p className="mt-1 text-xs text-slate-400">Create your first form and save it.</p>
							</div>
						) }

						<div className="mt-4 flex flex-wrap items-center justify-center gap-3">
							<button
								type="button"
								onClick={ () => {
									const id = `form-${ items.length + 1 }`;
									setItems( ( prev ) => [
										...prev,
										{
											...createBlankFormTemplate(),
											id,
											name: 'New Simple Form',
											formType: 'simple',
										},
									] );
									setExpandedId( id );
									setActiveTab( 'fields' );
								} }
								className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
							>
								<Plus className="h-4 w-4 text-violet-700" />
								Add Simple Form
							</button>
						</div>
					</div>
				</div>

				<aside className="lg:col-span-3">
					{ selectedCtx?.field ? (
						<div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
							<div className="border-b border-slate-200 px-4 py-3">
								<p className="text-sm font-semibold text-slate-800">Field Settings</p>
							</div>
							<div className="p-4">
								<FieldSettingsInline
									field={ selectedCtx.field }
									onUpdate={ ( fieldId, nextSettings ) => {
										selectedCtx.updateSettings( nextSettings );
									} }
									onClose={ () => {
										selectedCtx.clear?.();
										setSelectedCtx( null );
									} }
								/>

								<div className="mt-5 border-t border-slate-200 pt-4">
									<button
										type="button"
										disabled={ saving }
										onClick={ saveAll }
										className={ [
											'w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white',
											saving ? 'bg-violet-400' : 'bg-violet-600 hover:bg-violet-700',
										].join( ' ' ) }
									>
										{ saving ? 'Saving…' : 'Save' }
									</button>
									{ saveError && <p className="mt-2 text-xs font-semibold text-rose-600">{ saveError }</p> }
								</div>
							</div>
						</div>
					) : (
						<div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
							<div className="border-b border-slate-200 px-4 py-3">
								<p className="text-sm font-semibold text-slate-800">Save</p>
							</div>
							<div className="p-4">
								<button
									type="button"
									disabled={ saving }
									onClick={ saveAll }
									className={ [
										'w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white',
										saving ? 'bg-violet-400' : 'bg-violet-600 hover:bg-violet-700',
									].join( ' ' ) }
								>
									{ saving ? 'Saving…' : 'Save' }
								</button>
								{ saveError && <p className="mt-2 text-xs font-semibold text-rose-600">{ saveError }</p> }
							</div>
						</div>
					) }
				</aside>
			</div>

			<FormPreviewModal
				isOpen={ !! previewFormId }
				onClose={ () => setPreviewFormId( null ) }
				form={ previewForm }
			/>
		</div>
	);
}

