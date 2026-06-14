import React, { useEffect, useMemo, useState } from 'react';
import {
	Clipboard,
	ClipboardList,
	ChevronDown,
	Copy,
	Eye,
	EyeOff,
	Plus,
	Save,
	Trash2,
} from 'lucide-react';
import { PageShell } from '../components/PageShell.jsx';
import { AdminStickyFooter } from '../components/AdminStickyFooter.jsx';
import { SuccessModal, ErrorModal } from '../components/NexusModal.jsx';
import { DynamicFieldsBuilder } from '../form-builder/DynamicFieldsBuilder.jsx';
import { FieldSettingsInline } from '../form-builder/FieldSettingsInline.jsx';
import { FormPreviewModal } from '../form-builder/FormPreviewModal.jsx';

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
	steps: [
		{
			id: 'step-1',
			title: 'Contact Information',
			subtitle: 'Please fill in your details',
			fields: [],
		},
	],
};

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

function copyShortcode( formId, onCopied ) {
	const shortcode = `[smart_trigger_form id="${ formId }"]`;
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

function SimpleFormColorField( { label, value, onChange } ) {
	const normalized = value || '#ffffff';

	return (
		<div className="nls-fb-color-field">
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
			<li className="nls-form-builder-wrap">
				<div className={ `nls-fb-card${ expanded ? ' is-expanded' : '' }` }>
					<div className="nls-fb-head">
						<button type="button" onClick={ onToggle } className="nls-fb-head-main">
							<span className="nls-fb-title">{ form.name || 'Untitled Form' }</span>
							<span className="nls-fb-badge">Simple</span>
							{ form.published === false ? (
								<span className="nls-fb-badge is-muted">Hidden</span>
							) : null }
						</button>
						<div className="nls-fb-actions" onClick={ ( e ) => e.stopPropagation() }>
							<button
								type="button"
								onClick={ () => onPreview?.( form.id ) }
								className="nls-fb-icon-btn"
								title="Preview"
							>
								<Eye size={ 16 } />
							</button>
							<button
								type="button"
								onClick={ () => onPublishPersist?.( form.id, form.published === false ) }
								className={ `nls-fb-icon-btn${ form.published === false ? ' is-warn' : '' }` }
								title={ form.published === false ? 'Show form on website' : 'Hide form on website' }
							>
								{ form.published === false ? <Eye size={ 16 } /> : <EyeOff size={ 16 } /> }
							</button>
							<button
								type="button"
								onClick={ () => copyShortcode( form.id, onCopiedIdChange ) }
								className={ `nls-fb-icon-btn${ copiedId === form.id ? ' is-success' : '' }` }
								title="Copy shortcode"
							>
								<Clipboard size={ 16 } />
							</button>
							<button
								type="button"
								onClick={ () => onDuplicate( form.id ) }
								className="nls-fb-icon-btn"
								title="Duplicate"
							>
								<Copy size={ 16 } />
							</button>
							<button
								type="button"
								onClick={ () => onDelete( form.id ) }
								className="nls-fb-icon-btn is-danger"
								title="Delete"
							>
								<Trash2 size={ 16 } />
							</button>
							<button
								type="button"
								onClick={ onToggle }
								className="nls-fb-icon-btn nls-fb-chevron"
								title={ expanded ? 'Collapse' : 'Expand' }
							>
								<ChevronDown size={ 16 } className={ expanded ? 'is-open' : '' } />
							</button>
						</div>
					</div>

					{ expanded && (
						<div className="nls-fb-body">
							<div className="nls-fb-name-row">
								<div className="nls-fb-field">
									<span className="lbl">Form Name</span>
									<input
										type="text"
										className="inp"
										value={ form.name }
										onChange={ ( e ) => onUpdate( form.id, { name: e.target.value } ) }
									/>
								</div>
								<div className="nls-fb-shortcode-col">
									<span className="lbl">Shortcode</span>
									<div className="nls-fb-shortcode-row">
										<code className="nls-fb-shortcode">
											[smart_trigger_form id=&quot;{ form.id }&quot;]
										</code>
										<button
											type="button"
											onClick={ () => copyShortcode( form.id, onCopiedIdChange ) }
											className={ `nls-fb-copy-btn${ copiedId === form.id ? ' is-copied' : '' }` }
										>
											{ copiedId === form.id ? 'Copied!' : 'Copy' }
										</button>
									</div>
								</div>
							</div>

							<div className="nls-fb-tabs" role="tablist">
								{ [ 'fields', 'styling', 'advanced' ].map( ( tab ) => (
									<button
										key={ tab }
										type="button"
										role="tab"
										aria-selected={ activeTab === tab }
										onClick={ () => onTabChange( tab ) }
										className={ `nls-fb-tab${ activeTab === tab ? ' active' : '' }` }
									>
										{ tab.charAt( 0 ).toUpperCase() + tab.slice( 1 ) }
									</button>
								) ) }
							</div>

							{ activeTab === 'fields' && (
								<div className="nls-fb-tab-panel">
									<DynamicFieldsBuilder
										form={ form }
										onPatchForm={ ( patch ) => onUpdate( form.id, patch ) }
										onSelectionChange={ form.onSelectionChange }
									/>
								</div>
							) }

							{ activeTab === 'styling' && (
								<div className="nls-fb-tab-panel">
									<div className="nls-fb-color-grid">
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
									<div className="nls-fb-field nls-fb-submit-field">
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

							{ activeTab === 'advanced' && (
								<div className="nls-fb-tab-panel nls-fb-advanced">
									<section className="nls-fb-section is-first">
										<div className="nls-fb-sec-head">
											<span className="nls-fb-sec-ico">
												<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
													<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
													<circle cx="12" cy="12" r="3" />
												</svg>
											</span>
											<span className="nls-fb-sec-title">Visibility</span>
										</div>
										<div className="nls-fb-toggle-card">
											<div className="nls-fb-toggle-card-body">
												<span className="nls-fb-toggle-card-title">Show form on website</span>
												<p className="hint">
													Turn off to hide everywhere on the front (shortcodes, popups, widgets). The form stays in the builder for editing.
												</p>
											</div>
											<div
												className={ `nls-fb-toggle${ form.published !== false ? ' on' : '' }` }
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

									<section className="nls-fb-section">
										<div className="nls-fb-sec-head">
											<span className="nls-fb-sec-ico is-amber">
												<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
													<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
													<path d="M13.73 21a2 2 0 0 1-3.46 0" />
												</svg>
											</span>
											<span className="nls-fb-sec-title">Notifications &amp; Integrations</span>
										</div>
										<div className="nls-fb-adv-stack">
											<div className="nls-fb-field">
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
											<div className="nls-fb-field">
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

									<section className="nls-fb-section">
										<div className="nls-fb-sec-head">
											<span className="nls-fb-sec-ico is-pink">
												<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
													<polyline points="16 18 22 12 16 6" />
													<polyline points="8 6 2 12 8 18" />
												</svg>
											</span>
											<span className="nls-fb-sec-title">Custom Markup</span>
										</div>
										<div className="nls-fb-adv-stack">
											<div className="nls-fb-field">
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
											<div className="nls-fb-field">
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
											<div className="nls-fb-field">
												<span className="lbl">Custom CSS</span>
												<textarea
													className="ta mono"
													value={ form.customCSS || '' }
													onChange={ ( e ) => onUpdate( form.id, { customCSS: e.target.value } ) }
													rows={ 5 }
													placeholder=".smart-trigger-form { /* your styles */ }"
												/>
											</div>
										</div>
									</section>

									<section className="nls-fb-section">
										<div className="nls-fb-sec-head">
											<span className="nls-fb-sec-ico">
												<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
													<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
												</svg>
											</span>
											<span className="nls-fb-sec-title">Legal</span>
										</div>
										<div className="nls-fb-field">
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
									placeholder=".smart-trigger-form { /* your styles */ }"
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
	const bootForms = window?.nexusLsAdmin?.formsPayload?.forms;
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

	useEffect( () => {
		let alive = true;
		setLoadingForms( true );
		( async () => {
			try {
				const res = await apiFetch( '/nexus-lead-suite/v1/forms' );
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
			await apiFetch( '/nexus-lead-suite/v1/forms', {
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
										const newId = `form-${ items.length + 1 }`;
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

						<div className="nls-form-builder-wrap nls-fb-add-wrap">
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
								className="nls-fb-add-dash"
							>
								<Plus size={ 16 } />
								Add Simple Form
							</button>
						</div>
					</div>
				</div>

				{ selectedCtx?.field ? (
					<aside>
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
					</aside>
				) : null }
			</div>

			<FormPreviewModal isOpen={ !! previewFormId } onClose={ () => setPreviewFormId( null ) } form={ previewForm } />
		</PageShell>
	);
}
