import React, { useEffect, useMemo, useState } from 'react';
import {
	Clipboard,
	ClipboardList,
	ChevronDown,
	Copy,
	Eye,
	EyeOff,
	LayoutTemplate,
	Plus,
	Save,
	Trash2,
	X,
} from 'lucide-react';
import { PageShell } from '../components/PageShell.jsx';
import { AdminStickyFooter } from '../components/AdminStickyFooter.jsx';
import { SuccessModal, ErrorModal } from '../components/NexusModal.jsx';
import { DynamicFieldsBuilder } from '../form-builder/DynamicFieldsBuilder.jsx';
import { FieldSettingsInline } from '../form-builder/FieldSettingsInline.jsx';
import { ConditionalLogicEditor } from '../form-builder/ConditionalLogic.jsx';
import { ConfirmationsEditor } from '../form-builder/Confirmations.jsx';
import { FormPreviewModal } from '../form-builder/FormPreviewModal.jsx';
import {
	FORM_TEMPLATES,
	BLANK_TEMPLATE_ICON,
	buildTemplateFields,
} from '../form-builder/formTemplates.jsx';

const DEFAULT_STYLING = {
	backgroundColor: '#ffffff',
	textColor: '#1e293b',
	buttonColor: '#7c3aed',
	stepperColor: '#7c3aed',
};

const DEFAULT_CUSTOM_HTML = {
	header: '',
	footer: '',
};

const INITIAL_FORM = {
	id: 'form-1',
	name: 'Contact Form',
	formType: 'simple',
	submitBtnText: 'Submit',
	notificationEmail: '',
	crmWebhookUrl: '',
	published: true,
	styling: { ...DEFAULT_STYLING },
	customHTML: { ...DEFAULT_CUSTOM_HTML },
	customCSS: '',
	termsConditionText: '',
	confirmations: [ defaultConfirmation() ],
	emailRoutes: [],
	steps: [
		{
			id: 'step-1',
			title: 'Contact Information',
			subtitle: 'Please fill in your details',
			fields: [],
		},
	],
};

/** The always-present fallback confirmation (no conditions — shown when nothing else matches). */
function defaultConfirmation() {
	return {
		id: 'confirm-default',
		name: 'Default confirmation',
		isDefault: true,
		type: 'message',
		message: 'Thank you! Your submission has been received.',
		redirectUrl: '',
		conditional: { enabled: false, match: 'all', rules: [] },
	};
}

/** Guarantees a well-formed confirmations list with exactly one default fallback. */
function normalizeConfirmations( list ) {
	const arr = Array.isArray( list ) ? list.filter( Boolean ) : [];
	const out = arr.map( ( c, i ) => ( {
		id: c.id || `confirm-${ i }-${ Math.random().toString( 36 ).slice( 2, 7 ) }`,
		name: c.name || 'Confirmation',
		isDefault: !! c.isDefault,
		type: c.type === 'redirect' ? 'redirect' : 'message',
		message: typeof c.message === 'string' ? c.message : '',
		redirectUrl: typeof c.redirectUrl === 'string' ? c.redirectUrl : '',
		conditional: {
			enabled: !! c.conditional?.enabled,
			match: c.conditional?.match === 'any' ? 'any' : 'all',
			rules: Array.isArray( c.conditional?.rules ) ? c.conditional.rules : [],
		},
	} ) );
	if ( ! out.some( ( c ) => c.isDefault ) ) {
		out.unshift( defaultConfirmation() );
	}
	return out;
}

function normalizeForm( form ) {
	return {
		customCSS: '',
		termsConditionText: '',
		notificationEmail: '',
		crmWebhookUrl: '',
		published: true,
		...form,
		styling: {
			...DEFAULT_STYLING,
			...( form?.styling || {} ),
		},
		customHTML: {
			...DEFAULT_CUSTOM_HTML,
			...( form?.customHTML || {} ),
		},
		confirmations: normalizeConfirmations( form?.confirmations ),
		emailRoutes: Array.isArray( form?.emailRoutes ) ? form.emailRoutes : [],
	};
}

function createBlankFormTemplate() {
	return {
		...INITIAL_FORM,
		styling: { ...DEFAULT_STYLING },
		customHTML: { ...DEFAULT_CUSTOM_HTML },
		customCSS: '',
		termsConditionText: '',
		notificationEmail: '',
		crmWebhookUrl: '',
		steps: [
			{
				...INITIAL_FORM.steps[ 0 ],
				id: `step-${ Date.now() }`,
				fields: [],
			},
		],
	};
}

/** Next non-colliding `form-N` id (survives deletes / duplicates). */
function nextFormId( items ) {
	const used = new Set( ( items || [] ).map( ( f ) => f.id ) );
	let n = ( items?.length || 0 ) + 1;
	while ( used.has( `form-${ n }` ) ) {
		n += 1;
	}
	return `form-${ n }`;
}

/** Assemble a full form object from a premade template (or a blank form when template is null). */
function buildFormFromTemplate( template, id ) {
	const base = createBlankFormTemplate();
	if ( ! template ) {
		return { ...base, id, name: 'New Simple Form', formType: 'simple' };
	}
	return {
		...base,
		id,
		name: template.name,
		formType: 'simple',
		submitBtnText: template.submitBtnText || base.submitBtnText,
		steps: [
			{
				...base.steps[ 0 ],
				id: `step-${ Date.now() }-${ Math.random().toString( 16 ).slice( 2, 8 ) }`,
				title: template.stepTitle || template.name,
				subtitle: template.stepSubtitle || '',
				fields: buildTemplateFields( template ),
			},
		],
	};
}

const TEMPLATE_ACCENTS = {
	violet: 'bg-violet-50 text-violet-600',
	blue: 'bg-blue-50 text-blue-600',
	emerald: 'bg-emerald-50 text-emerald-600',
	amber: 'bg-amber-50 text-amber-600',
	pink: 'bg-pink-50 text-pink-600',
	rose: 'bg-rose-50 text-rose-600',
	slate: 'bg-slate-100 text-slate-600',
};

/** One field drawn as a tiny wireframe shape, keyed off its module type. */
function MiniField( { moduleId } ) {
	const box = 'rounded bg-white ring-1 ring-slate-200';
	if ( moduleId === 'radio' || moduleId === 'checkbox' ) {
		return (
			<div className="flex gap-1.5">
				<span className="h-2.5 w-8 rounded-full bg-slate-200" />
				<span className="h-2.5 w-8 rounded-full bg-slate-100" />
			</div>
		);
	}
	if ( moduleId === 'terms-conditions' ) {
		return (
			<div className="flex items-center gap-1.5">
				<span className="h-2.5 w-2.5 flex-none rounded-[3px] ring-1 ring-slate-300" />
				<span className="h-1.5 flex-1 rounded-full bg-slate-200" />
			</div>
		);
	}
	if ( moduleId === 'dropdown' ) {
		return (
			<div className={ `flex h-3.5 items-center justify-end px-1 ${ box }` }>
				<ChevronDown size={ 10 } className="text-slate-300" />
			</div>
		);
	}
	if ( moduleId === 'textarea' || moduleId === 'address' || moduleId === 'file-upload' ) {
		return <div className={ `h-6 ${ box }` } />;
	}
	return <div className={ `h-3.5 ${ box }` } />;
}

/** A miniature, text-free wireframe of the template — a "display preview" thumbnail. */
function TemplateMiniPreview( { fields } ) {
	if ( ! fields?.length ) {
		// Blank template — a "start from scratch" placeholder that fills the card.
		return (
			<div className="mt-3 flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50/50 py-10 text-slate-400">
				<span className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-500">
					<Plus size={ 22 } />
				</span>
				<span className="text-xs font-semibold text-slate-500">Start from scratch</span>
				<span className="text-[11px] text-slate-400">Add your own fields</span>
			</div>
		);
	}
	return (
		<div className="mt-3 rounded-lg border border-slate-200 bg-slate-50/70 p-2.5">
			<div className="mb-2 flex flex-col items-center gap-1">
				<span className="h-1.5 w-16 rounded-full bg-slate-300" />
				<span className="h-1 w-24 rounded-full bg-slate-200" />
			</div>
			<div className="space-y-1.5">
				{ fields.map( ( f, i ) => (
					<MiniField key={ i } moduleId={ f.moduleId } />
				) ) }
			</div>
			<div className="mt-2 h-3.5 rounded bg-slate-300" />
		</div>
	);
}

function TemplateCard( { icon, name, tagline, fields, onClick, onPreview } ) {
	return (
		<div className="group flex flex-col rounded-xl border border-slate-200 bg-white transition-all hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md">
			<button
				type="button"
				onClick={ onClick }
				className="flex flex-1 flex-col rounded-xl p-4 text-left focus:outline-none focus:ring-2 focus:ring-violet-200"
			>
				<div className="flex items-center gap-3">
					<span className={ `flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${ icon.accent }` }>
						{ icon.node }
					</span>
					<span className="min-w-0">
						<span className="block truncate text-sm font-bold text-slate-800">{ name }</span>
						<span className="mt-0.5 block truncate text-xs text-slate-500">{ tagline }</span>
					</span>
				</div>
				<TemplateMiniPreview fields={ fields } />
			</button>
			{ onPreview ? (
				<div className="flex items-center justify-between gap-2 border-t border-slate-100 px-4 py-2">
					<span className="text-[11px] font-medium text-slate-400">Click card to use</span>
					<button
						type="button"
						onClick={ onPreview }
						className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-violet-600 transition-colors hover:bg-violet-50"
					>
						<Eye size={ 14 } />
						Preview
					</button>
				</div>
			) : null }
		</div>
	);
}

function FormTemplatePicker( { open, onClose, onSelect, onPreview } ) {
	if ( ! open ) {
		return null;
	}
	const BlankIcon = BLANK_TEMPLATE_ICON;
	return (
		<>
			<div className="fixed inset-0 z-40 bg-black/50 transition-opacity" onClick={ onClose } />
			<div className="fixed left-1/2 top-1/2 z-50 flex max-h-[85vh] w-[92vw] max-w-4xl -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl bg-white shadow-2xl">
				<div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
					<div>
						<h2 className="text-xl font-bold text-slate-900">Add a Form</h2>
						<p className="mt-0.5 text-xs text-slate-500">
							Start from a ready-made template or build one from scratch.
						</p>
					</div>
					<button
						type="button"
						onClick={ onClose }
						className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100"
						aria-label="Close"
					>
						<X size={ 20 } />
					</button>
				</div>

				<div className="grid grid-cols-1 gap-3 overflow-y-auto px-6 py-5 sm:grid-cols-2 lg:grid-cols-3">
					<TemplateCard
						icon={ { node: <BlankIcon size={ 20 } />, accent: TEMPLATE_ACCENTS.slate } }
						name="Blank Simple Form"
						tagline="Start from scratch"
						fields={ [] }
						onClick={ () => onSelect( null ) }
					/>
					{ FORM_TEMPLATES.map( ( tpl ) => {
						const Icon = tpl.Icon;
						return (
							<TemplateCard
								key={ tpl.id }
								icon={ {
									node: <Icon size={ 20 } />,
									accent: TEMPLATE_ACCENTS[ tpl.accent ] || TEMPLATE_ACCENTS.violet,
								} }
								name={ tpl.name }
								tagline={ tpl.tagline }
								fields={ tpl.fields.map( ( [ moduleId ] ) => ( { moduleId } ) ) }
								onClick={ () => onSelect( tpl ) }
								onPreview={ () => onPreview?.( tpl ) }
							/>
						);
					} ) }
				</div>
			</div>
		</>
	);
}

function copyShortcode( formId, onCopied ) {
	const shortcode = `[nexulesuite_form id="${ formId }"]`;
	const done = () => {
		onCopied( formId );
		window.setTimeout( () => onCopied( null ), 2000 );
	};
	const fallback = () => {
		let el = null;
		try {
			el = document.createElement( 'textarea' );
			el.value = shortcode;
			el.setAttribute( 'readonly', '' );
			el.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
			document.body.appendChild( el );
			el.focus();
			el.select();
			return document.execCommand( 'copy' );
		} catch {
			return false;
		} finally {
			if ( el?.parentNode ) {
				el.parentNode.removeChild( el );
			}
		}
	};
	const clip = navigator?.clipboard;
	if ( clip && typeof clip.writeText === 'function' ) {
		clip.writeText( shortcode ).then( done ).catch( () => {
			if ( fallback() ) {
				done();
			}
		} );
	} else if ( fallback() ) {
		done();
	}
}

async function apiFetch( path, options = {} ) {
	const base = window?.nexulesuite_Admin?.restUrl || '';
	const url = base.replace( /\/$/, '' ) + path;
	const res = await fetch( url, {
		...options,
		headers: {
			'Content-Type': 'application/json',
			'X-WP-Nonce': window?.nexulesuite_Admin?.nonce || '',
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

function SimpleFormColorField( { label, value, onChange } ) {
	const normalized = value || '#ffffff';

	return (
		<div className="nexulesuite_fb-color-field">
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

function FormItem( {
	form,
	expanded,
	activeTab,
	onToggle,
	onDelete,
	onDuplicate,
	onUpdate,
	onTabChange,
	copiedId,
	onCopiedIdChange,
	onPreview,
	onPublishPersist,
} ) {
	const styling = form.styling || DEFAULT_STYLING;
	const isSimple = form.formType !== 'multi';

	if ( isSimple ) {
		return (
			<li className="nexulesuite_form-builder-wrap">
				<div className={ `nexulesuite_fb-card${ expanded ? ' is-expanded' : '' }` }>
					<div className="nexulesuite_fb-head">
						<button type="button" onClick={ onToggle } className="nexulesuite_fb-head-main">
							<span className="nexulesuite_fb-title">{ form.name || 'Untitled Form' }</span>
							<span className="nexulesuite_fb-badge">Simple</span>
							{ form.published === false ? (
								<span className="nexulesuite_fb-badge is-muted">Hidden</span>
							) : null }
						</button>
						<div className="nexulesuite_fb-actions" onClick={ ( e ) => e.stopPropagation() }>
							<button
								type="button"
								onClick={ () => onPreview?.( form.id ) }
								className="nexulesuite_fb-icon-btn"
								title="Preview"
							>
								<Eye size={ 16 } />
							</button>
							<button
								type="button"
								onClick={ () => onPublishPersist?.( form.id, form.published === false ) }
								className={ `nexulesuite_fb-icon-btn${ form.published === false ? ' is-warn' : '' }` }
								title={ form.published === false ? 'Show form on website' : 'Hide form on website' }
							>
								{ form.published === false ? <Eye size={ 16 } /> : <EyeOff size={ 16 } /> }
							</button>
							<button
								type="button"
								onClick={ () => copyShortcode( form.id, onCopiedIdChange ) }
								className={ `nexulesuite_fb-icon-btn${ copiedId === form.id ? ' is-success' : '' }` }
								title="Copy shortcode"
							>
								<Clipboard size={ 16 } />
							</button>
							<button
								type="button"
								onClick={ () => onDuplicate( form.id ) }
								className="nexulesuite_fb-icon-btn"
								title="Duplicate"
							>
								<Copy size={ 16 } />
							</button>
							<button
								type="button"
								onClick={ () => onDelete( form.id ) }
								className="nexulesuite_fb-icon-btn is-danger"
								title="Delete"
							>
								<Trash2 size={ 16 } />
							</button>
							<button
								type="button"
								onClick={ onToggle }
								className="nexulesuite_fb-icon-btn nexulesuite_fb-chevron"
								title={ expanded ? 'Collapse' : 'Expand' }
							>
								<ChevronDown size={ 16 } className={ expanded ? 'is-open' : '' } />
							</button>
						</div>
					</div>

					{ expanded && (
						<div className="nexulesuite_fb-body">
							<div className="nexulesuite_fb-name-row">
								<div className="nexulesuite_fb-field">
									<span className="lbl">Form Name</span>
									<input
										type="text"
										className="inp"
										value={ form.name }
										onChange={ ( e ) => onUpdate( form.id, { name: e.target.value } ) }
									/>
								</div>
								<div className="nexulesuite_fb-shortcode-col">
									<span className="lbl">Shortcode</span>
									<div className="nexulesuite_fb-shortcode-row">
										<code className="nexulesuite_fb-shortcode">
											[nexulesuite_form id=&quot;{ form.id }&quot;]
										</code>
										<button
											type="button"
											onClick={ () => copyShortcode( form.id, onCopiedIdChange ) }
											className={ `nexulesuite_fb-copy-btn${ copiedId === form.id ? ' is-copied' : '' }` }
										>
											{ copiedId === form.id ? 'Copied!' : 'Copy' }
										</button>
									</div>
								</div>
							</div>

							<div className="nexulesuite_fb-tabs" role="tablist">
								{ [ 'fields', 'styling', 'confirmations', 'advanced' ].map( ( tab ) => (
									<button
										key={ tab }
										type="button"
										role="tab"
										aria-selected={ activeTab === tab }
										onClick={ () => onTabChange( tab ) }
										className={ `nexulesuite_fb-tab${ activeTab === tab ? ' active' : '' }` }
									>
										{ tab.charAt( 0 ).toUpperCase() + tab.slice( 1 ) }
									</button>
								) ) }
							</div>

							{ activeTab === 'fields' && (
								<div className="nexulesuite_fb-tab-panel">
									<DynamicFieldsBuilder
										form={ form }
										onPatchForm={ ( patch ) => onUpdate( form.id, patch ) }
										onSelectionChange={ form.onSelectionChange }
									/>
								</div>
							) }

							{ activeTab === 'styling' && (
								<div className="nexulesuite_fb-tab-panel">
									<div className="nexulesuite_fb-color-grid">
										{ [
											[ 'Background Color', 'backgroundColor' ],
											[ 'Text Color', 'textColor' ],
											[ 'Button Color', 'buttonColor' ],
											[ 'Stepper Color', 'stepperColor' ],
										].map( ( [ label, key ] ) => (
											<SimpleFormColorField
												key={ key }
												label={ label }
												value={ styling[ key ] }
												onChange={ ( next ) =>
													onUpdate( form.id, {
														styling: { ...styling, [ key ]: next },
													} )
												}
											/>
										) ) }
									</div>
									<div className="nexulesuite_fb-field nexulesuite_fb-submit-field">
										<span className="lbl">Submit Button Text</span>
										<input
											type="text"
											className="inp"
											value={ form.submitBtnText || '' }
											onChange={ ( e ) => onUpdate( form.id, { submitBtnText: e.target.value } ) }
										/>
									</div>
								</div>
							) }

							{ activeTab === 'confirmations' && (
								<div className="nexulesuite_fb-tab-panel nexulesuite_fb-advanced">
									<ConfirmationsEditor form={ form } onUpdate={ ( patch ) => onUpdate( form.id, patch ) } />
								</div>
							) }

							{ activeTab === 'advanced' && (
								<div className="nexulesuite_fb-tab-panel nexulesuite_fb-advanced">
									<section className="nexulesuite_fb-section is-first">
										<div className="nexulesuite_fb-sec-head">
											<span className="nexulesuite_fb-sec-ico">
												<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
													<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
													<circle cx="12" cy="12" r="3" />
												</svg>
											</span>
											<span className="nexulesuite_fb-sec-title">Visibility</span>
										</div>
										<div className="nexulesuite_fb-toggle-card">
											<div className="nexulesuite_fb-toggle-card-body">
												<span className="nexulesuite_fb-toggle-card-title">Show form on website</span>
												<p className="hint">
													Turn off to hide everywhere on the front (shortcodes, popups, widgets). The form stays in the builder for editing.
												</p>
											</div>
											<div
												className={ `nexulesuite_fb-toggle${ form.published !== false ? ' on' : '' }` }
												role="switch"
												aria-checked={ form.published !== false }
												tabIndex={ 0 }
												onClick={ () => onUpdate( form.id, { published: form.published === false } ) }
												onKeyDown={ ( e ) => {
													if ( e.key === ' ' || e.key === 'Enter' ) {
														e.preventDefault();
														onUpdate( form.id, { published: form.published === false } );
													}
												} }
											>
												<span className="track">
													<span className="knob" />
												</span>
											</div>
										</div>
									</section>

									<section className="nexulesuite_fb-section">
										<div className="nexulesuite_fb-sec-head">
											<span className="nexulesuite_fb-sec-ico is-amber">
												<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
													<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
													<path d="M13.73 21a2 2 0 0 1-3.46 0" />
												</svg>
											</span>
											<span className="nexulesuite_fb-sec-title">Notifications &amp; Integrations</span>
										</div>
										<div className="nexulesuite_fb-adv-stack">
											<div className="nexulesuite_fb-field">
												<span className="lbl">Submission notification email(s)</span>
												<input
													type="text"
													className="inp"
													value={ form.notificationEmail || '' }
													onChange={ ( e ) => onUpdate( form.id, { notificationEmail: e.target.value } ) }
													placeholder="team@example.com, other@example.com"
												/>
												<p className="hint">
													Comma-separated. Submissions go here. If empty, the site admin email is used.
												</p>
											</div>
											<div className="nexulesuite_fb-field">
												<span className="lbl">CRM / Webhook URL (this form)</span>
												<input
													type="url"
													className="inp"
													value={ form.crmWebhookUrl || '' }
													onChange={ ( e ) => onUpdate( form.id, { crmWebhookUrl: e.target.value } ) }
													placeholder="https://hooks.zapier.com/..."
												/>
												<p className="hint">
													Optional. Per-form JSON webhook; set a global URL in Settings for all forms too.
												</p>
											</div>
										</div>
									</section>

									<section className="nexulesuite_fb-section">
										<div className="nexulesuite_fb-sec-head">
											<span className="nexulesuite_fb-sec-ico is-pink">
												<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
													<polyline points="16 18 22 12 16 6" />
													<polyline points="8 6 2 12 8 18" />
												</svg>
											</span>
											<span className="nexulesuite_fb-sec-title">Custom Markup</span>
										</div>
										<div className="nexulesuite_fb-adv-stack">
											<div className="nexulesuite_fb-field">
												<span className="lbl">Custom Header HTML</span>
												<textarea
													className="ta mono"
													value={ form.customHTML?.header || '' }
													onChange={ ( e ) =>
														onUpdate( form.id, {
															customHTML: { ...form.customHTML, header: e.target.value },
														} )
													}
													rows={ 3 }
													placeholder="<div>Your custom header HTML...</div>"
												/>
											</div>
											<div className="nexulesuite_fb-field">
												<span className="lbl">Custom Footer HTML</span>
												<textarea
													className="ta mono"
													value={ form.customHTML?.footer || '' }
													onChange={ ( e ) =>
														onUpdate( form.id, {
															customHTML: { ...form.customHTML, footer: e.target.value },
														} )
													}
													rows={ 3 }
													placeholder="<div>Your custom footer HTML...</div>"
												/>
											</div>
											<div className="nexulesuite_fb-field">
												<span className="lbl">Custom CSS</span>
												<textarea
													className="ta mono"
													value={ form.customCSS || '' }
													onChange={ ( e ) => onUpdate( form.id, { customCSS: e.target.value } ) }
													rows={ 5 }
													placeholder=".nexulesuite_form { /* your styles */ }"
												/>
											</div>
										</div>
									</section>

									<section className="nexulesuite_fb-section">
										<div className="nexulesuite_fb-sec-head">
											<span className="nexulesuite_fb-sec-ico">
												<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
													<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
												</svg>
											</span>
											<span className="nexulesuite_fb-sec-title">Legal</span>
										</div>
										<div className="nexulesuite_fb-field">
											<span className="lbl">Terms &amp; Conditions Text</span>
											<textarea
												className="ta"
												value={ form.termsConditionText || '' }
												onChange={ ( e ) => onUpdate( form.id, { termsConditionText: e.target.value } ) }
												rows={ 2 }
												placeholder="I agree to the terms and conditions"
											/>
										</div>
									</section>
								</div>
							) }
						</div>
					) }
				</div>
			</li>
		);
	}

	return (
		<li className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
			<button
				type="button"
				onClick={ onToggle }
				className="flex w-full items-center justify-between border-b border-slate-200 px-3 py-3 text-left sm:px-4"
			>
				<div className="flex min-w-0 items-center gap-2">
					<span className="truncate text-sm font-semibold text-slate-800">{ form.name || 'Untitled Form' }</span>
					<span className="rounded-full bg-violet-50 px-2 py-0.5 text-xs font-semibold text-violet-700">
						{ form.formType === 'multi' ? 'Multi-Step' : 'Simple' }
					</span>
					{ form.published === false ? (
						<span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-600">Hidden</span>
					) : null }
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
						onClick={ () => onPublishPersist?.( form.id, form.published === false ) }
						className={ [
							'inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
							form.published === false
								? 'text-amber-600 hover:bg-amber-50 hover:text-amber-700'
								: 'text-slate-400 hover:bg-slate-50 hover:text-slate-700',
						].join( ' ' ) }
						title={ form.published === false ? 'Show form on website' : 'Hide form on website' }
					>
						{ form.published === false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" /> }
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
				<div className="space-y-4 px-3 py-4 sm:space-y-6 sm:px-4">
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
									[nexulesuite_form id=&quot;{ form.id }&quot;]
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

					<div className="flex border-b border-slate-200">
						{ [ 'fields', 'styling', 'confirmations', 'advanced' ].map( ( tab ) => (
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

					{ activeTab === 'fields' && (
						<div className="space-y-4">
							<DynamicFieldsBuilder
								form={ form }
								onPatchForm={ ( patch ) => onUpdate( form.id, patch ) }
								onSelectionChange={ form.onSelectionChange }
							/>
						</div>
					) }

					{ activeTab === 'styling' && (
						<div className="space-y-4">
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
												value={ styling[ key ] }
												onChange={ ( e ) =>
													onUpdate( form.id, {
														styling: { ...styling, [ key ]: e.target.value },
													} )
												}
												className="h-10 w-10 cursor-pointer rounded border border-slate-200"
											/>
											<input
												type="text"
												value={ styling[ key ] }
												onChange={ ( e ) =>
													onUpdate( form.id, {
														styling: { ...styling, [ key ]: e.target.value },
													} )
												}
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
									value={ form.submitBtnText || '' }
									onChange={ ( e ) => onUpdate( form.id, { submitBtnText: e.target.value } ) }
									className="h-10 w-full max-w-xs rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none ring-violet-200 focus:ring-2"
								/>
							</div>
						</div>
					) }

					{ activeTab === 'confirmations' && (
						<div className="nexulesuite_fb-tab-panel nexulesuite_fb-advanced">
							<ConfirmationsEditor form={ form } onUpdate={ ( patch ) => onUpdate( form.id, patch ) } />
						</div>
					) }

					{ activeTab === 'advanced' && (
						<div className="space-y-4">
							<div className="rounded-lg border border-slate-200 bg-slate-50/90 px-3 py-3">
								<label className="flex cursor-pointer items-start gap-3">
									<input
										type="checkbox"
										className="mt-1 h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
										checked={ form.published !== false }
										onChange={ ( e ) => onUpdate( form.id, { published: e.target.checked } ) }
									/>
									<span className="min-w-0">
										<span className="block text-sm font-semibold text-slate-800">Show form on website</span>
										<span className="mt-0.5 block text-xs text-slate-500">
											Turn off to hide everywhere on the front (shortcodes, popups, widgets). The form stays in the builder for editing.
										</span>
									</span>
								</label>
							</div>
							<div>
								<label className="mb-1.5 block text-sm font-semibold text-slate-700">Submission notification email(s)</label>
								<input
									type="text"
									value={ form.notificationEmail || '' }
									onChange={ ( e ) => onUpdate( form.id, { notificationEmail: e.target.value } ) }
									placeholder="team@example.com, other@example.com"
									className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none ring-violet-200 focus:ring-2"
								/>
								<p className="mt-1.5 text-xs text-slate-500">
									Comma-separated. Submissions go here. If empty, the site admin email is used.
								</p>
							</div>
							<div className="space-y-1.5">
								<label className="mb-1.5 block text-sm font-semibold text-slate-700">CRM / Webhook URL (this form)</label>
								<input
									type="url"
									value={ form.crmWebhookUrl || '' }
									onChange={ ( e ) => onUpdate( form.id, { crmWebhookUrl: e.target.value } ) }
									placeholder="https://hooks.zapier.com/..."
									className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none ring-violet-200 focus:ring-2"
								/>
								<p className="mt-1.5 text-xs text-slate-500">
									Optional. Per-form JSON webhook; set a global URL in Settings for all forms too.
								</p>
							</div>
							<div>
								<label className="mb-1.5 block text-sm font-semibold text-slate-700">Custom Header HTML</label>
								<textarea
									value={ form.customHTML?.header || '' }
									onChange={ ( e ) =>
										onUpdate( form.id, {
											customHTML: { ...form.customHTML, header: e.target.value },
										} )
									}
									rows={ 3 }
									placeholder="<div>Your custom header HTML...</div>"
									className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm outline-none ring-violet-200 focus:ring-2"
								/>
							</div>
							<div>
								<label className="mb-1.5 block text-sm font-semibold text-slate-700">Custom Footer HTML</label>
								<textarea
									value={ form.customHTML?.footer || '' }
									onChange={ ( e ) =>
										onUpdate( form.id, {
											customHTML: { ...form.customHTML, footer: e.target.value },
										} )
									}
									rows={ 3 }
									placeholder="<div>Your custom footer HTML...</div>"
									className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm outline-none ring-violet-200 focus:ring-2"
								/>
							</div>
							<div>
								<label className="mb-1.5 block text-sm font-semibold text-slate-700">Custom CSS</label>
								<textarea
									value={ form.customCSS || '' }
									onChange={ ( e ) => onUpdate( form.id, { customCSS: e.target.value } ) }
									rows={ 5 }
									placeholder=".nexulesuite_form { /* your styles */ }"
									className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm outline-none ring-violet-200 focus:ring-2"
								/>
							</div>
							<div>
								<label className="mb-1.5 block text-sm font-semibold text-slate-700">Terms &amp; Conditions Text</label>
								<textarea
									value={ form.termsConditionText || '' }
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
	const bootForms = window?.nexulesuite_Admin?.formsPayload?.forms;
	const [ search, setSearch ] = useState( '' );
	const [ items, setItems ] = useState( Array.isArray( bootForms ) ? bootForms.map( normalizeForm ) : [] );
	const [ expandedId, setExpandedId ] = useState( null );
	const [ copiedId, setCopiedId ] = useState( null );
	const [ activeTab, setActiveTab ] = useState( 'fields' );
	const [ saving, setSaving ] = useState( false );
	const [ saveError, setSaveError ] = useState( '' );
	const [ showSuccess, setShowSuccess ] = useState( false );
	const [ selectedCtx, setSelectedCtx ] = useState( null );
	const [ previewFormId, setPreviewFormId ] = useState( null );
	const [ loadingForms, setLoadingForms ] = useState( false );
	const [ showTemplatePicker, setShowTemplatePicker ] = useState( false );
	const [ templatePreview, setTemplatePreview ] = useState( null );

	const addForm = ( template ) => {
		const id = nextFormId( items );
		setItems( ( prev ) => [ ...prev, buildFormFromTemplate( template, id ) ] );
		setExpandedId( id );
		setActiveTab( 'fields' );
		setSelectedCtx( null );
		setShowTemplatePicker( false );
	};

	useEffect( () => {
		let alive = true;
		setLoadingForms( true );
		( async () => {
			try {
				const res = await apiFetch( '/nexulesuite_/v1/forms' );
				const forms = res?.data?.payload?.forms;
				if ( alive && Array.isArray( forms ) ) {
					setItems( forms.map( normalizeForm ) );
				}
			} catch {
				// Keep boot defaults.
			} finally {
				if ( alive ) {
					setLoadingForms( false );
				}
			}
		} )();
		return () => {
			alive = false;
		};
	}, [] );

	const filtered = useMemo( () => {
		const q = search.trim().toLowerCase();
		if ( ! q ) {
			return items;
		}
		return items.filter( ( f ) => ( f.name + ' ' + f.id ).toLowerCase().includes( q ) );
	}, [ items, search ] );

	const previewForm = useMemo( () => {
		if ( ! previewFormId ) {
			return null;
		}
		return items.find( ( f ) => f.id === previewFormId ) || null;
	}, [ items, previewFormId ] );

	const saveAll = async ( nextItems = items ) => {
		setSaving( true );
		setSaveError( '' );
		try {
			await apiFetch( '/nexulesuite_/v1/forms', {
				method: 'POST',
				body: JSON.stringify( { payload: { forms: nextItems } } ),
			} );
			setShowSuccess( true );
		} catch ( e ) {
			setSaveError( e?.message || 'Save failed.' );
		} finally {
			setSaving( false );
		}
	};

	const publishPersist = async ( id, published ) => {
		const next = items.map( ( f ) => ( f.id === id ? { ...f, published } : f ) );
		setItems( next );
		await saveAll( next );
	};

	return (
		<PageShell
			title="Form Builder"
			subtitle="Build multi-step forms and copy shortcodes"
			icon={ <ClipboardList size={ 18 } /> }
			headerRight={
				<div className="relative">
					<input
						value={ search }
						onChange={ ( e ) => setSearch( e.target.value ) }
						placeholder="Search..."
						className="h-9 w-44 rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none ring-violet-200 focus:ring-2 sm:w-56 md:w-72 md:text-sm"
					/>
				</div>
			}
			footer={
				<AdminStickyFooter
					actions={
						<button
							type="button"
							disabled={ saving }
							onClick={ () => saveAll() }
							className="flex items-center gap-2 rounded-xl bg-[#2563EB] px-8 py-3 text-xs font-bold text-white shadow-lg transition-all hover:bg-blue-600 active:scale-95 disabled:opacity-60"
						>
							<Save size={ 18 } />
							{ saving ? 'Saving…' : 'Save' }
						</button>
					}
				/>
			}
		>
			<SuccessModal open={ showSuccess } onDismiss={ () => setShowSuccess( false ) } />
			<ErrorModal open={ !! saveError } message={ saveError } title="Error!" onDismiss={ () => setSaveError( '' ) } />

			<div className="mt-4 space-y-4 md:space-y-6">
				<div>
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
										if ( ! source ) {
											return;
										}
										const newId = nextFormId( items );
										setItems( ( prev ) => [ ...prev, { ...source, id: newId, name: `${ source.name } (Copy)` } ] );
										setExpandedId( newId );
										setSelectedCtx( null );
									} }
									onUpdate={ ( id, patch ) =>
										setItems( ( prev ) => prev.map( ( f ) => ( f.id === id ? { ...f, ...patch } : f ) ) )
									}
									onPublishPersist={ publishPersist }
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

						<div className="nexulesuite_form-builder-wrap nexulesuite_fb-add-wrap">
							<button
								type="button"
								onClick={ () => setShowTemplatePicker( true ) }
								className="nexulesuite_fb-add-dash"
							>
								<LayoutTemplate size={ 16 } />
								Add Form / Template
							</button>
						</div>
					</div>
				</div>

				{ selectedCtx?.field ? (
					<aside className="space-y-4">
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
							</div>
						</div>
						<ConditionalLogicEditor
							field={ selectedCtx.field }
							fields={ selectedCtx.fields || [] }
							onChange={ ( conditional ) => {
								selectedCtx.updateSettings( {
									...( selectedCtx.field.settings || {} ),
									conditional,
								} );
							} }
						/>
					</aside>
				) : null }
			</div>

			<FormPreviewModal isOpen={ !! previewFormId } onClose={ () => setPreviewFormId( null ) } form={ previewForm } />

			<FormTemplatePicker
				open={ showTemplatePicker }
				onClose={ () => setShowTemplatePicker( false ) }
				onSelect={ addForm }
				onPreview={ ( tpl ) => setTemplatePreview( buildFormFromTemplate( tpl, 'template-preview' ) ) }
			/>

			{ /* Rendered after the picker so it stacks on top when previewing a template. */ }
			<FormPreviewModal
				isOpen={ !! templatePreview }
				onClose={ () => setTemplatePreview( null ) }
				form={ templatePreview }
			/>
		</PageShell>
	);
}
