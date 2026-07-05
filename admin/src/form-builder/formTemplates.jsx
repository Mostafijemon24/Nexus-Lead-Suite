/**
 * Premade form templates for the Form Builder.
 *
 * Each template is a lightweight blueprint: metadata for the picker gallery plus
 * a `build()` that returns a fresh array of field objects. Field objects only
 * carry `moduleId` + `settings`; the builder re-attaches the catalog `module`
 * (icon, span, etc.) via resolveModule() on render, so templates stay serialisable.
 */
import {
	FilePlus2,
	Stethoscope,
	CalendarPlus,
	PhoneCall,
} from 'lucide-react';
import { createDefaultFieldSettings } from './core.js';

/** Default column spans per module — mirrors FIELD_CATALOG_META in fieldCatalog.jsx. */
const SPAN_BY_MODULE = {
	name: 1,
	email: 1,
	'single-line-text': 1,
	textarea: 2,
	dropdown: 1,
	radio: 1,
	checkbox: 1,
	phone: 1,
	address: 2,
	'date-time': 1,
	password: 1,
	website: 1,
	number: 1,
	'file-upload': 2,
	date: 1,
	time: 1,
	'terms-conditions': 1,
};

let __fieldSeq = 0;

/** Runtime-only unique id (templates build on click, never at module load). */
function uid( prefix ) {
	__fieldSeq += 1;
	return `${ prefix }-${ Date.now() }-${ __fieldSeq }-${ Math.random().toString( 16 ).slice( 2, 8 ) }`;
}

/** Build a single field block matching the shape produced by the field picker. */
function field( moduleId, settings = {}, columnSpan ) {
	const span = columnSpan || SPAN_BY_MODULE[ moduleId ] || 1;
	return {
		id: uid( 'field' ),
		kind: 'field',
		moduleId,
		columnSpan: span,
		settings: {
			...createDefaultFieldSettings( span ),
			...settings,
			columnSpan: span,
		},
	};
}

/** Shorthand for dropdown/radio/checkbox option lists. */
function opts( ...labels ) {
	return labels.map( ( label ) => ( {
		label,
		value: String( label ).toLowerCase().replace( /[^a-z0-9]+/g, '_' ).replace( /^_+|_+$/g, '' ),
	} ) );
}

/** Shared "Purpose of Visit" choices used by the consultation templates. */
const PURPOSE_OF_VISIT = [
	'General Checkup',
	'New Patient Appointment',
	'Follow-Up Visit',
	'Consultation',
	'Lab Test / Screening',
	'Urgent Care / Same-Day Visit',
	'Prescription Refill',
	'Annual Physical',
	'Other',
];

/** Consent copy shared by the consultation templates. */
const CONSULTATION_CONSENT = {
	label: 'Consent',
	html: 'I consent to receive calls, texts, or emails for scheduling and treatment purposes. Message/data rates may apply.',
	mode: 'visual',
};

/**
 * Fresh "show once a patient type is chosen" rule (shown for BOTH New and
 * Returning). References the `patient_type` symbolic key, resolved to the real
 * radio id by {@see buildTemplateFields}. New object per call so built fields
 * never share a conditional reference.
 */
const patientGate = () => ( {
	enabled: true,
	action: 'show',
	match: 'all',
	rules: [ { field: 'patient_type', operator: 'is_not_empty', value: '' } ],
} );

/**
 * Fresh "show only for New patient" rule. The value `new_patient` must match the
 * slug {@see opts} generates for the "New patient" option label.
 */
const newPatientOnly = () => ( {
	enabled: true,
	action: 'show',
	match: 'all',
	rules: [ { field: 'patient_type', operator: 'is', value: 'new_patient' } ],
} );

export const FORM_TEMPLATES = [
	{
		id: 'consultation-one',
		name: 'Consultation One',
		tagline: 'New patients get the full intake; returning get a short form',
		accent: 'blue',
		Icon: Stethoscope,
		stepTitle: 'Need Consultation / Appointment',
		stepSubtitle: "Please submit the form and we'll call you back.",
		submitBtnText: 'Submit',
		fields: [
			[ 'radio', {
				label: 'Patient Type',
				required: true,
				optionLayout: 'inline',
				options: opts( 'New patient', 'Returning patient' ),
			}, 'patient_type' ],
			// Shown for both New and Returning.
			[ 'name', { label: 'Full Name', required: true, placeholder: 'Full Name', conditional: patientGate() } ],
			[ 'phone', { label: 'Phone', required: true, placeholder: 'Phone', conditional: patientGate() } ],
			// New patients only — returning patients already have these on file.
			[ 'email', { label: 'Email', required: true, placeholder: 'Email', conditional: newPatientOnly() } ],
			// Shown for both.
			[ 'date', { label: 'Preferred Date', required: true, conditional: patientGate() } ],
			// New patients only.
			[ 'radio', {
				label: 'Preferred Time Format',
				required: true,
				optionLayout: 'inline',
				options: opts( 'AM', 'PM' ),
				conditional: newPatientOnly(),
			} ],
			[ 'radio', {
				label: 'Insurance or Self-Pay',
				required: true,
				optionLayout: 'inline',
				options: opts( 'Insurance', 'Self-Pay' ),
				conditional: newPatientOnly(),
			} ],
			// Shown for both.
			[ 'dropdown', {
				label: 'Purpose of Visit',
				required: true,
				placeholder: 'Purpose of Visit…',
				options: opts( ...PURPOSE_OF_VISIT ),
				conditional: patientGate(),
			} ],
			[ 'terms-conditions', { label: 'Consent', required: true, consent: { ...CONSULTATION_CONSENT }, conditional: patientGate() } ],
		],
	},
	{
		id: 'consultation-two',
		name: 'Consultation Two',
		tagline: 'Appointment intake shown right away',
		accent: 'emerald',
		Icon: CalendarPlus,
		stepTitle: 'Need Consultation / Appointment',
		stepSubtitle: "Please submit the form and we'll call you back.",
		submitBtnText: 'Submit',
		fields: [
			[ 'name', { label: 'Full Name', required: true, placeholder: 'Full Name' } ],
			[ 'phone', { label: 'Phone', required: true, placeholder: 'Phone' } ],
			[ 'email', { label: 'Email', required: true, placeholder: 'Email' } ],
			[ 'date', { label: 'Preferred Date', required: true } ],
			[ 'radio', {
				label: 'Preferred Time Format',
				required: true,
				optionLayout: 'inline',
				options: opts( 'AM', 'PM' ),
			} ],
			[ 'radio', {
				label: 'Insurance or Self-Pay',
				required: true,
				optionLayout: 'inline',
				options: opts( 'Insurance', 'Self-Pay' ),
			} ],
			[ 'dropdown', {
				label: 'Purpose of Visit',
				required: true,
				placeholder: 'Purpose of Visit…',
				options: opts( ...PURPOSE_OF_VISIT ),
			} ],
			[ 'terms-conditions', { label: 'Consent', required: true, consent: { ...CONSULTATION_CONSENT } } ],
		],
	},
	{
		id: 'consultation-three',
		name: 'Consultation Three',
		tagline: 'Compact intake with contact method',
		accent: 'rose',
		Icon: PhoneCall,
		stepTitle: 'Need Consultation with designer?',
		stepSubtitle: "Please submit the form and we'll call you back.",
		submitBtnText: 'Submit',
		fields: [
			[ 'name', { label: 'Full Name', required: true, placeholder: 'Full Name' } ],
			[ 'phone', { label: 'Phone', required: true, placeholder: 'Phone' } ],
			[ 'email', { label: 'Email', required: true, placeholder: 'Email' } ],
			[ 'dropdown', {
				label: 'Purpose of Visit',
				required: true,
				placeholder: 'Purpose of Visit…',
				options: opts( ...PURPOSE_OF_VISIT ),
			} ],
			[ 'dropdown', {
				label: 'Contact method',
				required: true,
				placeholder: 'Contact method…',
				options: opts( 'Phone', 'Email' ),
			} ],
			[ 'terms-conditions', { label: 'Consent', required: true, consent: { ...CONSULTATION_CONSENT } } ],
		],
	},
];

/** Icon used for the "Blank" card in the picker. */
export const BLANK_TEMPLATE_ICON = FilePlus2;

/**
 * Build the fresh `fields` array for a template.
 *
 * A template field entry is `[ moduleId, settings, key? ]`. The optional `key`
 * is a stable symbolic name a conditional rule can reference before real field
 * ids exist. After ids are minted we rewrite each `conditional.rules[].field`
 * from its symbolic key to the freshly generated controller id, without ever
 * mutating the (module-level) template literal.
 */
export function buildTemplateFields( template ) {
	if ( ! template || ! Array.isArray( template.fields ) ) {
		return [];
	}
	const keyToId = {};
	const built = template.fields.map( ( entry ) => {
		const moduleId = entry[ 0 ];
		const settings = entry[ 1 ] || {};
		const key = entry[ 2 ];
		const f = field( moduleId, settings );
		if ( key ) {
			keyToId[ key ] = f.id;
		}
		return f;
	} );
	return built.map( ( f ) => {
		const cond = f.settings && f.settings.conditional;
		if ( ! cond || ! Array.isArray( cond.rules ) || ! cond.rules.length ) {
			return f;
		}
		const rules = cond.rules.map( ( r ) => {
			const ref = r && r.field;
			return ref && keyToId[ ref ] ? { ...r, field: keyToId[ ref ] } : { ...r };
		} );
		return { ...f, settings: { ...f.settings, conditional: { ...cond, rules } } };
	} );
}
