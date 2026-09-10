import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PageShell } from '../components/PageShell.jsx';
import { AdminStickyFooter } from '../components/AdminStickyFooter.jsx';
import { ConfirmDiscardModal, ErrorModal, SuccessModal } from '../components/NexusModal.jsx';
import {
	Settings, FileText, Database,
	Download, Upload, Save,
	Layout,
	Zap, Globe,
	CircleDot, Server,
	Type, MousePointer2, Eye,
	AlignLeft, AlignRight,
	Image as ImageIcon, MessageCircle, Clock, X,
	Mail, Link as LinkIcon, ShieldCheck, Wand2, Copy, Check, AlertTriangle,
	FileX, Paintbrush, Info, Type as FontIcon, Loader2, Plus, Trash2, Layers,
	Send, Lock, Bot, RefreshCw, Code2,
} from 'lucide-react';
import { FaqTab, AutoSetupTab } from './ChatbotPage.jsx';

/* ─────────────────────────────────────────────────────────────
   Google Fonts catalogue — loaded via Google CDN, zero files in plugin
───────────────────────────────────────────────────────────── */
const GOOGLE_FONTS = [
	{ family: 'Inter', category: 'Sans-serif', weights: '400;500;600;700' },
	{ family: 'Roboto', category: 'Sans-serif', weights: '400;500;700' },
	{ family: 'Open Sans', category: 'Sans-serif', weights: '400;600;700' },
	{ family: 'Lato', category: 'Sans-serif', weights: '400;700' },
	{ family: 'Montserrat', category: 'Sans-serif', weights: '400;500;600;700' },
	{ family: 'Poppins', category: 'Sans-serif', weights: '400;500;600;700' },
	{ family: 'Raleway', category: 'Sans-serif', weights: '400;600;700' },
	{ family: 'Nunito', category: 'Sans-serif', weights: '400;600;700' },
	{ family: 'Ubuntu', category: 'Sans-serif', weights: '400;500;700' },
	{ family: 'Rubik', category: 'Sans-serif', weights: '400;500;600;700' },
	{ family: 'Work Sans', category: 'Sans-serif', weights: '400;500;600;700' },
	{ family: 'DM Sans', category: 'Sans-serif', weights: '400;500;700' },
	{ family: 'Figtree', category: 'Sans-serif', weights: '400;500;600;700' },
	{ family: 'Plus Jakarta Sans', category: 'Sans-serif', weights: '400;500;600;700' },
	{ family: 'Outfit', category: 'Sans-serif', weights: '400;500;600;700' },
	{ family: 'Barlow', category: 'Sans-serif', weights: '400;500;600;700' },
	{ family: 'Manrope', category: 'Sans-serif', weights: '400;500;600;700' },
	{ family: 'Mulish', category: 'Sans-serif', weights: '400;600;700' },
	{ family: 'Quicksand', category: 'Sans-serif', weights: '400;500;600;700' },
	{ family: 'Cabin', category: 'Sans-serif', weights: '400;500;600;700' },
	{ family: 'Karla', category: 'Sans-serif', weights: '400;500;700' },
	{ family: 'Josefin Sans', category: 'Sans-serif', weights: '400;600;700' },
	{ family: 'Exo 2', category: 'Sans-serif', weights: '400;500;600;700' },
	{ family: 'Space Grotesk', category: 'Sans-serif', weights: '400;500;600;700' },
	{ family: 'Noto Sans', category: 'Sans-serif', weights: '400;700' },
	{ family: 'IBM Plex Sans', category: 'Sans-serif', weights: '400;500;600;700' },
	{ family: 'Syne', category: 'Display', weights: '400;500;600;700;800' },
	{ family: 'Oswald', category: 'Display', weights: '400;500;600;700' },
	{ family: 'Bebas Neue', category: 'Display', weights: '400' },
	{ family: 'Anton', category: 'Display', weights: '400' },
	{ family: 'Fjalla One', category: 'Display', weights: '400' },
	{ family: 'Righteous', category: 'Display', weights: '400' },
	{ family: 'Titan One', category: 'Display', weights: '400' },
	{ family: 'Secular One', category: 'Display', weights: '400' },
	{ family: 'Abril Fatface', category: 'Display', weights: '400' },
	{ family: 'Playfair Display', category: 'Serif', weights: '400;600;700' },
	{ family: 'Merriweather', category: 'Serif', weights: '400;700' },
	{ family: 'Lora', category: 'Serif', weights: '400;500;600;700' },
	{ family: 'PT Serif', category: 'Serif', weights: '400;700' },
	{ family: 'Libre Baskerville', category: 'Serif', weights: '400;700' },
	{ family: 'Cormorant Garamond', category: 'Serif', weights: '400;500;600;700' },
	{ family: 'EB Garamond', category: 'Serif', weights: '400;500;600;700' },
	{ family: 'Spectral', category: 'Serif', weights: '400;500;600;700' },
	{ family: 'Cinzel', category: 'Serif', weights: '400;600;700' },
	{ family: 'Crimson Text', category: 'Serif', weights: '400;600;700' },
	{ family: 'Dancing Script', category: 'Handwriting', weights: '400;600;700' },
	{ family: 'Pacifico', category: 'Handwriting', weights: '400' },
	{ family: 'Caveat', category: 'Handwriting', weights: '400;600;700' },
	{ family: 'Satisfy', category: 'Handwriting', weights: '400' },
	{ family: 'Permanent Marker', category: 'Handwriting', weights: '400' },
	{ family: 'Inconsolata', category: 'Monospace', weights: '400;600;700' },
	{ family: 'Source Code Pro', category: 'Monospace', weights: '400;600;700' },
	{ family: 'JetBrains Mono', category: 'Monospace', weights: '400;500;700' },
	{ family: 'Fira Code', category: 'Monospace', weights: '400;500;700' },
];

const FONT_CATEGORIES = [ 'Sans-serif', 'Serif', 'Display', 'Handwriting', 'Monospace' ];

/* Must stay in sync with Report_Source::SECTIONS. */
const REPORT_SECTIONS = [
	{ id: 'summary', label: 'Summary counts' },
	{ id: 'forms', label: 'Form submissions (full answers)' },
	{ id: 'chats', label: 'Chat transcripts' },
	{ id: 'activities', label: 'Activity log' },
];

/* ─────────────────────────────────────────────────────────────
   Defaults & API helpers
───────────────────────────────────────────────────────────── */

/* The provider catalogue (labels, endpoints, default models, capabilities) is owned by
   PHP — Rest_Api::get_general_settings() ships Llm_Client::ui_registry() as
   `settings.aiProviders`. Nothing here needs to know a base URL. */
const aiProviders = ( settings ) => settings.aiProviders || {};

/* `direct` mode talks to the vendor's API; `server` mode proxies through a self-hosted
   Nexus AI Server, which only knows a subset of vendors. */
const aiChatProviders = ( settings, mode ) =>
	Object.entries( aiProviders( settings ) )
		.filter( ( [ , p ] ) => p.chat && ( mode === 'direct' ? p.direct : p.server ) )
		.map( ( [ id, p ] ) => ( { id, ...p } ) );

const aiEmbedProviders = ( settings ) =>
	Object.entries( aiProviders( settings ) )
		.filter( ( [ , p ] ) => p.embed && p.direct )
		.map( ( [ id, p ] ) => ( { id, ...p } ) );

const aiProvider = ( settings, id ) => aiProviders( settings )[ id ] || null;
const aiProviderLabel = ( settings, id ) => aiProvider( settings, id )?.label || id || '—';

/* The AI connection fields as the server last saw them — Test and the stored keys are bound to these, not to what is on screen. */
const aiSavedSnapshot = ( s ) => ( {
	connMode: s.aiConnMode || 'direct',
	serverUrl: s.aiServerUrl || '',
	llmProvider: s.aiLlmProvider || '',
	llmModel: s.aiLlmModel || '',
	embedProvider: s.aiEmbedProvider || '',
	embedModel: s.aiEmbedModel || '',
} );

const DEFAULT_SETTINGS = {
	enableNavigation: false,
	selectedEmailTemplate: '',
	allowClientAccess: false,
	tokenTTL: '5',
	clientAccessSlug: 'report-access',
	globalFont: 'Inter',
	enableAutoPopup: false,
	autoPopupFormId: '',
	activityButtonClasses: '',
	excludePosts: [],
	excludePages: [],
	enableLivechat: false,
	chatButtonImage: '',
	chatTitle: 'Customer Support',
	chatBadge: 'Online',
	chatContent: 'Hello! How can we help you today?',
	chatFormButton: '',
	chatFormButtonLink: '',
	chatButtonTwo: '',
	chatButtonTwoLink: '',
	chatButtonThird: '',
	chatButtonThirdLink: '',
	chatAlign: 'right',
	chatPadding: '12',
	chatBorderRadius: '12',
	primaryBtnBg: '#2563eb',
	primaryBtnText: '#ffffff',
	chatBlinkDotColor: '#ffffff',
	chatHoverEffect: 'lift',
	reportLogo: '',
	reportLogoPdfMax: 400,
	autoPopupFormIds: [],
	// AI Chatbot (RAG)
	aiEnabled: false,
	// 'direct' = call the model vendor's API from WordPress; 'server' = self-hosted AI server.
	aiConnMode: 'direct',
	aiServerUrl: '',
	aiApiKey: '',
	hasAiKey: false,
	// Chat model provider.
	aiLlmProvider: '',
	aiLlmModel: '',
	aiLlmApiKey: '',
	hasLlmKey: false,
	aiLlmProviders: [],
	aiProviders: {},
	// Embedding provider — powers retrieval over the WordPress-stored knowledge base.
	aiEmbedProvider: '',
	aiEmbedModel: '',
	aiEmbedApiKey: '',
	hasEmbedKey: false,
	aiIndex: { chunks: 0, documents: 0, dims: 0 },
	aiSystemPrompt: '',
	aiWelcomeMessage: "Hi! Ask me anything about our site and I'll help right away.",
	aiInputPlaceholder: '',
	aiChatModel: '',
	aiVisionModel: 'llava',
	aiAllowImages: false,
	aiMaxChunks: 4,
	aiManualQa: '',
};

const DEFAULT_SMTP = {
	enabled: false,
	mailer: 'other',
	host: '',
	port: '587',
	secure: 'tls',
	username: '',
	password: '',
	from_email: '',
	from_name: '',
	force_from_name: false,
	oauth_client_id: '',
	oauth_client_secret: '',
};

const DEFAULT_SMTP_META = {
	connected: false,
	oauth_email: '',
	hasClientSecret: false,
	redirect_uri: '',
	authorize_urls: {},
	disconnect_url: '',
};

// Provider cards. Gmail/Outlook are relay presets whose host/port/encryption are
// auto-configured server-side (kept in sync with Mailer::mailer_presets() in PHP).
const SMTP_MAILERS = [
	{ id: 'default', name: 'Default (PHP)', tagline: 'WordPress built-in mail()', accent: 'slate' },
	{ id: 'gmail', name: 'Google / Gmail', tagline: 'Gmail & Workspace · OAuth 2.0', accent: 'rose' },
	{ id: 'outlook', name: 'Microsoft / Outlook', tagline: 'Microsoft 365 · OAuth 2.0', accent: 'blue' },
	{ id: 'other', name: 'Other SMTP', tagline: 'Any SMTP server', accent: 'violet' },
];

const SMTP_MAILER_ACCENTS = {
	slate: 'border-slate-300 bg-slate-50 text-slate-600',
	rose: 'border-rose-300 bg-rose-50 text-rose-600',
	blue: 'border-blue-300 bg-blue-50 text-blue-600',
	violet: 'border-violet-300 bg-violet-50 text-violet-600',
};

const REPORT_LOGO_PDF_MIN = 100;
const REPORT_LOGO_PDF_MAX = 1000;
const REPORT_LOGO_PDF_DEFAULT = 400;

function clampReportLogoPdfMax( value ) {
	const n = Math.round( Number( value ) );
	if ( ! Number.isFinite( n ) ) {
		return REPORT_LOGO_PDF_DEFAULT;
	}
	return Math.max( REPORT_LOGO_PDF_MIN, Math.min( REPORT_LOGO_PDF_MAX, n ) );
}

function newAutoPopupFormRow() {
	const rk =
		typeof window !== 'undefined' && window.crypto?.randomUUID
			? window.crypto.randomUUID()
			: `apf-${ Date.now() }-${ Math.floor( Math.random() * 1e6 ) }`;
	return { rowKey: rk, formId: '' };
}

/* Exclusion lists must be arrays of { id, title }. Legacy saves, imports, and PHP
   associative arrays (serialized as JSON objects) otherwise crash the popup tab
   with "excludePosts.some is not a function". */
function looksLikeContentUrl( raw ) {
	const q = String( raw || '' ).trim();
	if ( ! q ) {
		return false;
	}
	if ( /^https?:\/\//i.test( q ) || q.startsWith( '/' ) ) {
		return true;
	}
	if ( q.includes( '.php' ) && ( q.includes( 'page_id=' ) || q.includes( '?p=' ) ) ) {
		return true;
	}
	return /^[a-z0-9.-]+\.[a-z]{2,}(\/|$)/i.test( q );
}

function exclusionRowKey( item ) {
	const id = Number( item?.id );
	if ( id > 0 ) {
		return `id:${ id }`;
	}
	const url = String( item?.url || '' ).trim();
	if ( url ) {
		return `url:${ url }`;
	}
	return '';
}

function normalizeExclusionList( value ) {
	const list = Array.isArray( value )
		? value
		: value && typeof value === 'object'
			? Object.values( value )
			: [];
	const out = [];
	const seen = new Set();
	list.forEach( ( item ) => {
		if ( ! item || typeof item !== 'object' ) {
			return;
		}
		const id = Number( item.id );
		const url = String( item.url ?? '' ).trim();
		const title = String( item.title ?? '' );
		if ( ! ( id > 0 ) && ! url && ! looksLikeContentUrl( title ) ) {
			return;
		}
		const row = {
			id: id > 0 ? id : 0,
			title: title || url || ( id > 0 ? `#${ id }` : '' ),
			url,
		};
		const key = exclusionRowKey( row );
		if ( ! key || seen.has( key ) ) {
			return;
		}
		seen.add( key );
		out.push( row );
	} );
	return out;
}

function normalizeExclusionFields( s ) {
	if ( ! s || typeof s !== 'object' ) {
		return {};
	}
	const out = {};
	if ( 'excludePosts' in s ) out.excludePosts = normalizeExclusionList( s.excludePosts );
	if ( 'excludePages' in s ) out.excludePages = normalizeExclusionList( s.excludePages );
	return out;
}

function rowsFromSavedAutoPopupSettings( s ) {
	if ( ! s || typeof s !== 'object' ) {
		return [];
	}
	const ids = Array.isArray( s.autoPopupFormIds ) ? s.autoPopupFormIds : [];
	if ( ids.length > 0 ) {
		return ids.map( ( formId, idx ) => ( {
			rowKey: `srv-${ String( formId ) }-${ idx }`,
			formId: String( formId ),
		} ) );
	}
	if ( s.autoPopupFormId ) {
		return [ { rowKey: 'legacy', formId: String( s.autoPopupFormId ) } ];
	}
	return [];
}

	const apiFetch = async ( path, options = {} ) => {
		const base = window?.nexulesuite_Admin?.restUrl || '';
		const nonce = window?.nexulesuite_Admin?.nonce || '';
		const res = await fetch( `${ base }nexulesuite_/v1${ path }`, {
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json',
				'X-WP-Nonce': nonce,
				...( options.headers || {} ),
			},
			...options,
		} );
		const json = await res.json().catch( () => ( {} ) );
		return { res, json };
	};

const wpFetch = async ( path ) => {
	const base = window?.nexulesuite_Admin?.restUrl || '';
	const nonce = window?.nexulesuite_Admin?.nonce || '';
	const res = await fetch( `${ base }${ path }`, {
		credentials: 'same-origin',
		headers: { 'X-WP-Nonce': nonce },
	} );
	return res.json().catch( () => [] );
};

/**
 * Re-encode as JPEG via canvas so PHP GD / WordPress can generate responsive subsizes.
 * Fixes uploads that trigger “Convert it to JPEG or PNG…” (WebP, AVIF, odd PNGs on XAMPP, etc.).
 *
 * @param {File} file Original image file.
 * @param {number} maxSide Max width or height in px (avatar/icon — keep small).
 * @returns {Promise<File>}
 */
async function normalizeImageForWpUpload( file, maxSide = 512 ) {
	return new Promise( ( resolve, reject ) => {
		const img = new Image();
		const objUrl = URL.createObjectURL( file );
		img.onload = () => {
			URL.revokeObjectURL( objUrl );
			let w = img.naturalWidth;
			let h = img.naturalHeight;
			if ( ! w || ! h ) {
				reject( new Error( 'Could not read image dimensions.' ) );
				return;
			}
			let tw = w;
			let th = h;
			if ( tw > maxSide || th > maxSide ) {
				if ( tw > th ) {
					th = Math.round( ( th * maxSide ) / tw );
					tw = maxSide;
				} else {
					tw = Math.round( ( tw * maxSide ) / th );
					th = maxSide;
				}
			}
			const canvas = document.createElement( 'canvas' );
			canvas.width = tw;
			canvas.height = th;
			const ctx = canvas.getContext( '2d' );
			if ( ! ctx ) {
				reject( new Error( 'Your browser cannot process images here.' ) );
				return;
			}
			ctx.fillStyle = '#ffffff';
			ctx.fillRect( 0, 0, tw, th );
			ctx.drawImage( img, 0, 0, tw, th );
			canvas.toBlob(
				( blob ) => {
					if ( ! blob ) {
						reject( new Error( 'Could not convert image to JPEG.' ) );
						return;
					}
					resolve(
						new File( [ blob ], 'nexus-chat-avatar.jpg', {
							type: 'image/jpeg',
							lastModified: Date.now(),
						} )
					);
				},
				'image/jpeg',
				0.92
			);
		};
		img.onerror = () => {
			URL.revokeObjectURL( objUrl );
			reject( new Error( 'Could not load image. Use JPEG or PNG.' ) );
		};
		img.src = objUrl;
	} );
}

/* Inject a Google Font <link> tag in the document head */
const injectGoogleFont = ( family, weights ) => {
	if ( ! family ) return;
	const linkId = `nexus-gf-preview-${ family.replace( /\s+/g, '-' ).toLowerCase() }`;
	if ( document.getElementById( linkId ) ) return;
	const link = document.createElement( 'link' );
	link.id = linkId;
	link.rel = 'stylesheet';
	link.href = `https://fonts.googleapis.com/css2?family=${ encodeURIComponent( family ) }:wght@${ weights }&display=swap`;
	document.head.appendChild( link );
};

/* ─────────────────────────────────────────────────────────────
   Shared sub-components
───────────────────────────────────────────────────────────── */
const ColorField = ( { label, value, onChange, hint } ) => (
	<div className="space-y-2">
		<label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{ label }</label>
		<div className="flex items-center gap-2">
			<input
				type="color"
				value={ value }
				onChange={ ( e ) => onChange( e.target.value ) }
				className="h-10 w-10 border-none cursor-pointer rounded-lg shrink-0 shadow-sm"
			/>
			<input
				type="text"
				value={ value }
				onChange={ ( e ) => onChange( e.target.value ) }
				className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-mono uppercase focus:ring-2 focus:ring-blue-500 outline-none"
			/>
		</div>
		{ hint ? <p className="text-[10px] text-slate-500 ml-1 leading-relaxed">{ hint }</p> : null }
	</div>
);

const InlineToggle = ( { enabled, onClick, label, desc, icon: Icon } ) => (
	<div className="flex items-center justify-between p-4 bg-white border border-line rounded-card shadow-card transition-all h-[90px]">
		<div className="flex items-center gap-3">
			{ Icon && (
				<div className={ `p-2 rounded-tile ${ enabled ? 'bg-pop-soft text-pop' : 'bg-line-soft text-faint' }` }>
					<Icon size={ 18 } />
				</div>
			) }
			<div className="flex flex-col">
				<h5 className="font-display text-sm font-bold text-ink capitalize leading-none">{ label }</h5>
				{ desc && <p className="text-[10px] text-faint font-medium capitalize mt-1">{ desc }</p> }
			</div>
		</div>
		<button
			type="button"
			onClick={ onClick }
			className={ `w-12 h-6 rounded-full transition-colors duration-300 relative shrink-0 focus:outline-none ${ enabled ? 'bg-pop' : 'bg-line' }` }
		>
			<div className={ `absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-sm ${ enabled ? 'translate-x-7' : 'translate-x-1' }` }></div>
		</button>
	</div>
);

/* Small hover/focus tooltip — keeps long help text off the page until needed. */
const InfoTip = ( { text, label = 'More information' } ) => (
	<button type="button" className="nexulesuite_tip" aria-label={ label }>
		<Info size={ 13 } aria-hidden="true" />
		<span className="nexulesuite_tip-bubble" role="tooltip">{ text }</span>
	</button>
);

/**
 * Exclusion Rules picker: a pasted permalink is added as that URL.
 * Title search is only a helper when you do not have the link.
 */
function ExclusionField( {
	label,
	chipClass,
	placeholder,
	options,
	selected,
	type,
	onToggle,
	onAdd,
	resolve,
} ) {
	const [ query, setQuery ] = useState( '' );
	const [ hint, setHint ] = useState( '' );
	const [ busy, setBusy ] = useState( false );
	const [ results, setResults ] = useState( [] );
	const debounceRef = useRef( 0 );
	const selectedKeys = new Set( ( Array.isArray( selected ) ? selected : [] ).map( exclusionRowKey ).filter( Boolean ) );

	const toRow = ( item ) => ( {
		id: Number( item?.id ) > 0 ? Number( item.id ) : 0,
		title: String( item?.title ?? '' ),
		url: String( item?.url ?? '' ).trim(),
	} );

	const pick = ( item ) => {
		const row = toRow( item );
		if ( ! exclusionRowKey( row ) ) {
			return;
		}
		onAdd( row );
		setQuery( '' );
		setResults( [] );
		setHint( '' );
	};

	const submit = async () => {
		const q = query.trim();
		if ( ! q || busy ) {
			return;
		}
		setBusy( true );
		setHint( '' );
		try {
			const json = await resolve( q, type );
			if ( json?.success && ( Number( json.data?.id ) > 0 || json.data?.url ) ) {
				pick( json.data );
			} else if ( looksLikeContentUrl( q ) ) {
				pick( { id: 0, title: q, url: q } );
			} else if ( json?.code === 'ambiguous' && Array.isArray( json.data?.results ) ) {
				setResults( json.data.results );
				setHint( json.message || 'Pick a match from the list.' );
			} else {
				setHint( json?.message || 'Could not add that page.' );
				setResults( [] );
			}
		} catch {
			if ( looksLikeContentUrl( q ) ) {
				pick( { id: 0, title: q, url: q } );
			} else {
				setHint( 'Could not look up that page.' );
			}
		} finally {
			setBusy( false );
		}
	};

	useEffect( () => {
		const q = query.trim();
		window.clearTimeout( debounceRef.current );
		if ( q.length < 2 ) {
			setResults( [] );
			return undefined;
		}
		if ( looksLikeContentUrl( q ) ) {
			setResults( [ { id: 0, title: q, url: q } ] );
		}
		debounceRef.current = window.setTimeout( async () => {
			try {
				const json = await resolve( q, type );
				if ( json?.success && ( Number( json.data?.id ) > 0 || json.data?.url ) ) {
					setResults( [ json.data ] );
				} else if ( json?.code === 'ambiguous' && Array.isArray( json.data?.results ) ) {
					setResults( json.data.results );
				} else if ( looksLikeContentUrl( q ) ) {
					setResults( [ { id: 0, title: q, url: q } ] );
				} else {
					setResults( [] );
				}
			} catch {
				setResults( looksLikeContentUrl( q ) ? [ { id: 0, title: q, url: q } ] : [] );
			}
		}, 280 );
		return () => window.clearTimeout( debounceRef.current );
	}, [ query, type, resolve ] );

	const qLower = query.trim().toLowerCase();
	const queryIsUrl = looksLikeContentUrl( query );
	const localHits = queryIsUrl
		? []
		: ( Array.isArray( options ) ? options : [] )
			.filter( ( o ) => ! selectedKeys.has( exclusionRowKey( o ) ) )
			.filter( ( o ) => ( ! qLower ? true : String( o.title || '' ).toLowerCase().includes( qLower ) ) )
			.slice( 0, 12 );
	const merged = [];
	const seen = new Set();
	[ ...results, ...localHits ].forEach( ( row ) => {
		const key = exclusionRowKey( row );
		if ( ! key || seen.has( key ) || selectedKeys.has( key ) ) {
			return;
		}
		seen.add( key );
		merged.push( row );
	} );

	return (
		<div className="nexulesuite_sap-excl-field">
			<span className="lbl">{ label }</span>
			<div className="nexulesuite_sap-excl-link-row">
				<input
					type="search"
					className="inp"
					value={ query }
					onChange={ ( e ) => {
						setQuery( e.target.value );
						setHint( '' );
					} }
					onKeyDown={ ( e ) => {
						if ( e.key === 'Enter' ) {
							e.preventDefault();
							submit();
						}
					} }
					placeholder={ placeholder }
					autoComplete="off"
					spellCheck={ false }
					aria-label={ label }
				/>
				<button
					type="button"
					className="nexulesuite_sap-excl-link-btn"
					onClick={ submit }
					disabled={ busy || ! query.trim() }
				>
					{ busy ? '…' : 'Add' }
				</button>
			</div>
			<p className="nexulesuite_sap-excl-hint">
				Paste the page link and click Add. Title search is optional if you do not have the URL.
			</p>
			{ hint ? <p className="nexulesuite_sap-excl-hint is-error">{ hint }</p> : null }
			{ query.trim().length >= 1 && merged.length > 0 ? (
				<div className="nexulesuite_sap-excl-results" role="listbox">
					{ merged.map( ( row ) => (
						<button
							key={ exclusionRowKey( row ) || row.title }
							type="button"
							className="nexulesuite_sap-excl-result"
							onClick={ () => pick( row ) }
						>
							<span className="t">{ row.title || row.url || `#${ row.id }` }</span>
							<span className="meta">{ Number( row.id ) > 0 ? `#${ row.id }` : ( row.url || 'URL' ) }</span>
						</button>
					) ) }
				</div>
			) : null }
			{ selected.length > 0 && (
				<div className="nexulesuite_sap-excl-tags">
					{ selected.map( ( row ) => (
						<span key={ exclusionRowKey( row ) || row.title } className={ `nexulesuite_sap-excl-chip ${ chipClass }` }>
							{ row.title || row.url || `#${ row.id }` }
							<button
								type="button"
								className="nexulesuite_sap-excl-chip-remove"
								onClick={ () => onToggle( row ) }
								aria-label={ `Remove ${ row.title || row.url }` }
							>
								<X size={ 12 } />
							</button>
						</span>
					) ) }
				</div>
			) }
		</div>
	);
}

/* ─────────────────────────────────────────────────────────────
   Main component
───────────────────────────────────────────────────────── */
export function SettingsPage() {
	const pluginVersion = window?.nexulesuite_Admin?.pluginVersion || '';
	const [ activeTab, setActiveTab ] = useState( 'general' );
	const [ aiSubTab, setAiSubTab ] = useState( 'setup' );
	const [ generatedLink, setGeneratedLink ] = useState( '' );
	const [ copySuccess, setCopySuccess ] = useState( false );
	const [ clientLinks, setClientLinks ] = useState( [] );
	const [ linkLabel, setLinkLabel ] = useState( '' );
	const [ linkExpiryDays, setLinkExpiryDays ] = useState( '0' );
	const [ linkSections, setLinkSections ] = useState( [ 'summary', 'activities' ] );
	const fileInputRef = useRef( null );
	const [ uploadingChatImg, setUploadingChatImg ] = useState( false );
	const reportLogoInputRef = useRef( null );
	const [ uploadingReportLogo, setUploadingReportLogo ] = useState( false );
	const [ fontSearch, setFontSearch ] = useState( '' );

	const [ settings, setSettings ] = useState( DEFAULT_SETTINGS );
	const [ loading, setLoading ] = useState( true );
	const [ saving, setSaving ] = useState( false );
	const [ errorAlert, setErrorAlert ] = useState( { open: false, text: '' } );
	const [ successOpen, setSuccessOpen ] = useState( false );
	const [ discardOpen, setDiscardOpen ] = useState( false );
	const [ emailTemplates, setEmailTemplates ] = useState( [] );
	const [ allPosts, setAllPosts ] = useState( [] );
	const [ allPages, setAllPages ] = useState( [] );
	const [ popups, setPopups ] = useState( [] );
	const [ formsList, setFormsList ] = useState( [] );
	const [ autoPopupFormRows, setAutoPopupFormRows ] = useState( [] );
	const [ smtp, setSmtp ] = useState( DEFAULT_SMTP );
	const [ smtpHasPassword, setSmtpHasPassword ] = useState( false );
	const [ smtpSaving, setSmtpSaving ] = useState( false );
	const [ smtpTesting, setSmtpTesting ] = useState( false );
	const [ smtpTestEmail, setSmtpTestEmail ] = useState( '' );
	const [ smtpTestResult, setSmtpTestResult ] = useState( null );
	const [ smtpTestHtml, setSmtpTestHtml ] = useState( true );
	const [ smtpMeta, setSmtpMeta ] = useState( DEFAULT_SMTP_META );
	const [ redirectCopied, setRedirectCopied ] = useState( false );
	const [ embedCopied, setEmbedCopied ] = useState( '' );
	const [ aiTesting, setAiTesting ] = useState( false );
	const [ aiTestResult, setAiTestResult ] = useState( null );
	const [ savedAi, setSavedAi ] = useState( () => aiSavedSnapshot( DEFAULT_SETTINGS ) );
	const [ aiTraining, setAiTraining ] = useState( false );
	const [ aiTrainResult, setAiTrainResult ] = useState( null );
	const [ aiResetting, setAiResetting ] = useState( false );

	const showNotice = ( type, text ) => {
		if ( type === 'success' ) {
			return;
		}
		const msg = typeof text === 'string' && text.trim() !== '' ? text.trim() : 'An error occurred.';
		setErrorAlert( { open: true, text: msg } );
	};

	const dismissErrorAlert = () => setErrorAlert( { open: false, text: '' } );

	/* Pre-load font whenever selection changes */
	useEffect( () => {
		if ( ! settings.globalFont ) return;
		const fontObj = GOOGLE_FONTS.find( ( f ) => f.family === settings.globalFont );
		if ( fontObj ) injectGoogleFont( fontObj.family, fontObj.weights );
	}, [ settings.globalFont ] );

	useEffect( () => {
		( async () => {
			try {
				const [ gResult, tResult, postsRaw, pagesRaw, popupsResult, formsResult, smtpResult ] = await Promise.allSettled( [
					apiFetch( '/settings/general', { method: 'GET' } ),
					apiFetch( '/emails/templates', { method: 'GET' } ),
					wpFetch( 'wp/v2/posts?per_page=100&_fields=id,title' ),
					wpFetch( 'wp/v2/pages?per_page=100&_fields=id,title' ),
					apiFetch( '/popups', { method: 'GET' } ),
					apiFetch( '/forms', { method: 'GET' } ),
					apiFetch( '/smtp/settings', { method: 'GET' } ),
				] );

				if ( gResult.status === 'fulfilled' && gResult.value.res.ok && gResult.value.json?.success ) {
					const srvSettings = gResult.value.json?.data?.settings || {};
					setSettings( ( prev ) => ( { ...prev, ...srvSettings, ...normalizeExclusionFields( srvSettings ) } ) );
					setSavedAi( aiSavedSnapshot( srvSettings ) );
					setAutoPopupFormRows( rowsFromSavedAutoPopupSettings( srvSettings ) );
				}
				if ( tResult.status === 'fulfilled' && tResult.value.res.ok && tResult.value.json?.success ) {
					setEmailTemplates( tResult.value.json.data?.templates || [] );
				}
				if ( popupsResult.status === 'fulfilled' && popupsResult.value.res.ok && popupsResult.value.json?.success ) {
					setPopups( popupsResult.value.json.data?.popups || [] );
				}
				if ( formsResult.status === 'fulfilled' && formsResult.value.res.ok && formsResult.value.json?.success ) {
					const rawForms = Array.isArray( formsResult.value.json.data?.payload?.forms )
						? formsResult.value.json.data.payload.forms
						: [];
					setFormsList(
						rawForms
							.filter( ( f ) => f != null && String( f.id ?? '' ).trim() !== '' )
							.map( ( f ) => ( {
								id: String( f.id ).trim(),
								name: typeof f.name === 'string' && f.name.trim() !== '' ? f.name.trim() : 'Untitled form',
							} ) )
					);
				}

				if ( smtpResult.status === 'fulfilled' && smtpResult.value.res.ok && smtpResult.value.json?.success ) {
					const smtpData = smtpResult.value.json?.data || {};
					const srvSmtp = smtpData.settings || {};
					setSmtp( ( prev ) => ( {
						...prev,
						...srvSmtp,
						port: srvSmtp.port != null ? String( srvSmtp.port ) : prev.port,
						password: '',
						oauth_client_secret: '',
					} ) );
					setSmtpHasPassword( !! smtpData.hasPassword );
					setSmtpMeta( {
						connected: !! smtpData.connected,
						oauth_email: smtpData.oauth_email || '',
						hasClientSecret: !! smtpData.hasClientSecret,
						redirect_uri: smtpData.redirect_uri || '',
						authorize_urls: smtpData.authorize_urls || {},
						disconnect_url: smtpData.disconnect_url || '',
					} );
				}

				const posts = postsRaw.status === 'fulfilled' && Array.isArray( postsRaw.value ) ? postsRaw.value : [];
				const pages = pagesRaw.status === 'fulfilled' && Array.isArray( pagesRaw.value ) ? pagesRaw.value : [];
				setAllPosts( posts.map( ( p ) => ( { id: p.id, title: p.title?.rendered || '' } ) ) );
				setAllPages( pages.map( ( p ) => ( { id: p.id, title: p.title?.rendered || '' } ) ) );
			} catch ( _e ) {
				// ignore
			} finally {
				setLoading( false );
			}
		} )();
	}, [] );

	const updateSetting = ( field, value ) => setSettings( ( prev ) => ( { ...prev, [ field ]: value } ) );

	const updateSmtp = ( field, value ) => setSmtp( ( prev ) => ( { ...prev, [ field ]: value } ) );

	// Surface the OAuth connect / disconnect result after the provider redirects back.
	useEffect( () => {
		const params = new URLSearchParams( window.location.search );
		const status = params.get( 'nls_smtp' );
		if ( ! status ) {
			return;
		}
		setActiveTab( 'smtp' );
		if ( status === 'connected' || status === 'disconnected' ) {
			setSuccessOpen( true );
		} else if ( status === 'error' ) {
			const msg = params.get( 'nls_smtp_msg' );
			showNotice( 'error', msg ? decodeURIComponent( msg ) : 'OAuth authorization failed.' );
		}
		params.delete( 'nls_smtp' );
		params.delete( 'nls_smtp_msg' );
		const qs = params.toString();
		window.history.replaceState( {}, '', window.location.pathname + ( qs ? `?${ qs }` : '' ) + window.location.hash );
	}, [] );

	const copyRedirectUri = () => {
		const text = smtpMeta.redirect_uri || '';
		if ( ! text || ! navigator?.clipboard?.writeText ) {
			return;
		}
		navigator.clipboard.writeText( text ).then( () => {
			setRedirectCopied( true );
			window.setTimeout( () => setRedirectCopied( false ), 2000 );
		} ).catch( () => {} );
	};

	/* ── Livechat embed snippets ── */
	const chatShortcode = '[nexulesuite_chat]';
	const chatEmbedUrl = `${ ( window?.nexulesuite_Admin?.siteUrl || '/' ).replace( /\/?$/, '/' ) }?nexulesuite_chat_embed=1`;
	const chatIframeCode = `<iframe src="${ chatEmbedUrl }" title="${ settings.chatTitle || 'Chat' }" width="100%" height="620" style="border:0;border-radius:22px;" loading="lazy"></iframe>`;

	const copyEmbed = ( kind, text ) => {
		if ( ! text || ! navigator?.clipboard?.writeText ) {
			return;
		}
		navigator.clipboard.writeText( text ).then( () => {
			setEmbedCopied( kind );
			window.setTimeout( () => setEmbedCopied( '' ), 2000 );
		} ).catch( () => {} );
	};

	// Provider card currently selected: "default" means SMTP disabled (WordPress mail()).
	const smtpCurrentMailer = smtp.enabled ? ( smtp.mailer || 'other' ) : 'default';

	const selectSmtpMailer = ( id ) => {
		if ( id === 'default' ) {
			setSmtp( ( prev ) => ( { ...prev, enabled: false } ) );
			return;
		}
		setSmtp( ( prev ) => ( { ...prev, enabled: true, mailer: id } ) );
	};

	const handleSaveSmtp = async () => {
		if ( smtpSaving ) return;
		setSmtpSaving( true );
		setSmtpTestResult( null );
		try {
			const port = parseInt( smtp.port, 10 );
			const payload = {
				enabled: !! smtp.enabled,
				mailer: smtp.mailer || 'other',
				host: ( smtp.host || '' ).trim(),
				port: Number.isFinite( port ) && port > 0 ? port : 587,
				secure: smtp.secure || 'tls',
				username: ( smtp.username || '' ).trim(),
				from_email: ( smtp.from_email || '' ).trim(),
				from_name: ( smtp.from_name || '' ).trim(),
				force_from_name: !! smtp.force_from_name,
				oauth_client_id: ( smtp.oauth_client_id || '' ).trim(),
			};
			// Only send secrets the admin actually typed; empty values keep the
			// encrypted values already stored server-side.
			if ( smtp.password ) {
				payload.password = smtp.password;
			}
			if ( smtp.oauth_client_secret ) {
				payload.oauth_client_secret = smtp.oauth_client_secret;
			}
			const { res, json } = await apiFetch( '/smtp/settings', {
				method: 'POST',
				body: JSON.stringify( { settings: payload } ),
			} );
			if ( ! res.ok || ! json?.success ) throw new Error( json?.message || 'Save failed.' );
			if ( smtp.password ) {
				setSmtpHasPassword( true );
			}
			const saved = json?.data || {};
			setSmtpMeta( {
				connected: !! saved.connected,
				oauth_email: saved.oauth_email || '',
				hasClientSecret: !! saved.hasClientSecret,
				redirect_uri: saved.redirect_uri || smtpMeta.redirect_uri,
				authorize_urls: saved.authorize_urls || smtpMeta.authorize_urls,
				disconnect_url: saved.disconnect_url || smtpMeta.disconnect_url,
			} );
			setSmtp( ( prev ) => ( { ...prev, password: '', oauth_client_secret: '' } ) );
			setSuccessOpen( true );
		} catch ( e ) {
			showNotice( 'error', e?.message || 'Could not save SMTP settings.' );
		} finally {
			setSmtpSaving( false );
		}
	};

	const handleTestSmtp = async () => {
		if ( smtpTesting ) return;
		const to = ( smtpTestEmail || '' ).trim();
		if ( ! to || ! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test( to ) ) {
			setSmtpTestResult( { ok: false, text: 'Enter a valid email address to send the test to.' } );
			return;
		}
		setSmtpTesting( true );
		setSmtpTestResult( null );
		try {
			const { res, json } = await apiFetch( '/smtp/test', {
				method: 'POST',
				body: JSON.stringify( { to, html: !! smtpTestHtml } ),
			} );
			if ( ! res.ok || ! json?.success ) {
				throw new Error( json?.message || 'Test email failed.' );
			}
			setSmtpTestResult( { ok: true, text: `Test email sent to ${ to }. Check the inbox (and spam).` } );
		} catch ( e ) {
			setSmtpTestResult( { ok: false, text: e?.message || 'Test email failed.' } );
		} finally {
			setSmtpTesting( false );
		}
	};

	/* ── AI Chatbot: uses SAVED settings — remind the user to Save first. ── */
	const handleAiTest = async () => {
		if ( aiTesting ) return;
		// Testing now would probe the previously saved provider and key, and the mismatch reads as a bad key.
		if ( aiConnDirty ) {
			setAiTestResult( {
				ok: false,
				text: 'Unsaved changes: Test uses your saved settings. Click Save Configuration first, then Test.',
			} );
			return;
		}
		setAiTesting( true );
		setAiTestResult( null );
		try {
			const { res, json } = await apiFetch( '/ai/test', { method: 'POST' } );
			const d = json?.data || {};

			// A direct-mode failure still ships diagnostics, so read `data` before throwing.
			if ( ! res.ok || ! json?.success ) {
				throw new Error( json?.message || 'Connection failed.' );
			}

			if ( d.mode === 'direct' ) {
				const parts = [ `Provider: ${ d.provider }`, `Model: ${ d.chat_model }` ];
				if ( d.providerTest?.latency_ms ) parts.push( `key verified in ${ d.providerTest.latency_ms } ms` );
				parts.push( `Images: ${ d.capabilities?.vision ? 'yes' : 'no' }` );
				if ( d.embed?.ok ) parts.push( `Embeddings: ${ d.embed.provider } (${ d.embed.dims }d)` );
				parts.push( `Knowledge base: ${ d.documents || 0 } doc(s), ${ d.chunks || 0 } chunk(s)` );

				const note = ! d.chunks ? ' Click Train Now to index your site content.' : '';
				setAiTestResult( { ok: true, text: `Connected. ${ parts.join( ' · ' ) }.${ note }` } );
				return;
			}

			// Self-hosted server mode.
			const caps = d.capabilities || {};
			const probe = d.providerTest || null;
			const parts = [ `Provider: ${ d.provider || '—' }`, `Model: ${ d.chat_model || '—' }` ];
			parts.push( `Tools: ${ caps.tools ? 'yes' : 'no' }` );
			parts.push( `Images: ${ caps.vision ? 'yes' : 'no' }` );
			if ( probe?.ok && probe.latency_ms ) parts.push( `key verified in ${ probe.latency_ms } ms` );

			// Ollama serves embeddings (and Ollama-only vision), so it matters even on a cloud provider —
			// but a cloud chat model still answers without it, so this is a warning, not a failure.
			const notes = [];
			if ( ! d.ollama ) notes.push( 'Ollama is not responding — training/retrieval will fail until it is running.' );
			if ( ! probe && ! d.has_credential ) notes.push( 'No provider key configured here or on the server.' );
			if ( ! caps.tools ) notes.push( 'This model cannot call tools — the assistant will use the basic reply path.' );

			setAiTestResult( {
				ok: notes.length === 0,
				text: `Connected. ${ parts.join( ' · ' ) }${ notes.length ? '. ' + notes.join( ' ' ) : '.' }`,
			} );
		} catch ( e ) {
			setAiTestResult( { ok: false, text: e?.message || 'Connection failed.' } );
		} finally {
			setAiTesting( false );
		}
	};

	const handleAiTrain = async () => {
		if ( aiTraining ) return;
		setAiTraining( true );
		setAiTrainResult( null );
		try {
			let offset = 0;
			let reset = true;
			let totalChunks = 0;
			let total = 0;
			let processedTotal = 0;
			// Batched loop so large sites don't time out (server pages posts/pages).
			for ( let i = 0; i < 500; i++ ) {
				const { res, json } = await apiFetch( '/ai/train', {
					method: 'POST',
					body: JSON.stringify( { offset, reset } ),
				} );
				if ( ! res.ok || ! json?.success ) {
					throw new Error( json?.message || 'Training failed.' );
				}
				const d = json.data || {};
				totalChunks = d.totalChunks || totalChunks;
				total = d.total || total;
				processedTotal += d.processed || 0;
				setAiTrainResult( { ok: true, text: `Training… ${ processedTotal }/${ total || '?' } items processed.` } );
				reset = false;
				if ( d.done || d.nextOffset == null ) break;
				offset = d.nextOffset;
			}
			setAiTrainResult( { ok: true, text: `Training complete — ${ total } item(s) indexed, ${ totalChunks } chunk(s) in memory.` } );
		} catch ( e ) {
			setAiTrainResult( { ok: false, text: e?.message || 'Training failed. Save your settings and test the connection first.' } );
		} finally {
			setAiTraining( false );
		}
	};

	const handleAiReset = async () => {
		if ( aiResetting ) return;
		setAiResetting( true );
		try {
			const { res, json } = await apiFetch( '/ai/reset', { method: 'POST' } );
			if ( ! res.ok || ! json?.success ) {
				throw new Error( json?.message || 'Failed to clear memory.' );
			}
			setAiTrainResult( { ok: true, text: 'Memory cleared. Re-train to rebuild the knowledge base.' } );
		} catch ( e ) {
			setAiTrainResult( { ok: false, text: e?.message || 'Failed to clear memory.' } );
		} finally {
			setAiResetting( false );
		}
	};

	/* ── AI tab: derived provider + embedding state (mirrors Rest_Api::ai_embed_config). ── */
	const aiMode = settings.aiConnMode || 'direct';
	const aiActiveProvider = aiProvider( settings, settings.aiLlmProvider );
	// A blank embedding provider means "reuse the chat provider", which only works when it can embed.
	const aiEmbedId = settings.aiEmbedProvider || ( aiActiveProvider?.embed ? settings.aiLlmProvider : '' );
	const aiEmbedDef = aiProvider( settings, aiEmbedId );
	const aiEmbedSharesChatKey = !! aiEmbedId && aiEmbedId === settings.aiLlmProvider;
	// A stored key belongs to the provider it was saved under; picking another vendor invalidates it.
	const aiLlmKeySaved = !! settings.hasLlmKey && ( settings.aiLlmProvider || '' ) === savedAi.llmProvider;
	const aiEmbedKeySaved = !! settings.hasEmbedKey && ( settings.aiEmbedProvider || '' ) === savedAi.embedProvider;
	const aiEmbedHasKey = aiEmbedSharesChatKey
		? ( aiLlmKeySaved || !! settings.aiLlmApiKey )
		: ( aiEmbedKeySaved || !! settings.aiEmbedApiKey );
	const aiEmbedReady = !! aiEmbedId && aiEmbedHasKey;
	// Test and Train read the saved option, so anything unsaved here would be tested against the old provider/key.
	const aiConnDirty =
		aiMode !== savedAi.connMode ||
		( settings.aiServerUrl || '' ) !== savedAi.serverUrl ||
		( settings.aiLlmProvider || '' ) !== savedAi.llmProvider ||
		( settings.aiLlmModel || '' ) !== savedAi.llmModel ||
		( settings.aiEmbedProvider || '' ) !== savedAi.embedProvider ||
		( settings.aiEmbedModel || '' ) !== savedAi.embedModel ||
		!! settings.aiApiKey ||
		!! settings.aiLlmApiKey ||
		!! settings.aiEmbedApiKey;

	// Report/PDF logo size: clamped value drives the slider + live preview; the raw
	// field value is kept as-typed so the number input stays editable (normalized on blur).
	const reportLogoPdfMax = clampReportLogoPdfMax( settings.reportLogoPdfMax );
	const reportLogoPreviewPx = Math.round(
		40 + ( ( reportLogoPdfMax - REPORT_LOGO_PDF_MIN ) / ( REPORT_LOGO_PDF_MAX - REPORT_LOGO_PDF_MIN ) ) * 80
	);

	const handleSave = async () => {
		if ( saving ) return;
		setSaving( true );
		try {
			const settingsPayload = {
				...settings,
				autoPopupFormIds: autoPopupFormRows
					.map( ( r ) => r.formId )
					.filter( ( id ) => typeof id === 'string' && id.trim() !== '' ),
			};
			const { res, json } = await apiFetch( '/settings/general', {
				method: 'POST',
				body: JSON.stringify( { settings: settingsPayload } ),
			} );
			if ( ! res.ok || ! json?.success ) throw new Error( json?.message || 'Save failed.' );
			const saved = json?.data?.settings;
			if ( saved && typeof saved === 'object' ) {
				// `saved` omits the API keys (masked) and carries hasAiKey/hasLlmKey/hasEmbedKey — clear the inputs so the masked placeholders show.
				setSettings( ( prev ) => ( { ...prev, ...saved, ...normalizeExclusionFields( saved ), aiApiKey: '', aiLlmApiKey: '', aiEmbedApiKey: '' } ) );
				setSavedAi( aiSavedSnapshot( saved ) );
				setAutoPopupFormRows( rowsFromSavedAutoPopupSettings( saved ) );
			}
			setSuccessOpen( true );
		} catch ( e ) {
			showNotice( 'error', e?.message || 'Save failed.' );
		} finally {
			setSaving( false );
		}
	};

	const handleDiscard = () => {
		const next =
			typeof structuredClone === 'function'
				? structuredClone( DEFAULT_SETTINGS )
				: JSON.parse( JSON.stringify( DEFAULT_SETTINGS ) );
		setSettings( next );
		setAutoPopupFormRows( [] );
		setGeneratedLink( '' );
		setCopySuccess( false );
	};

	const handleImageUpload = async ( e ) => {
		const input = e.target;
		const file = input.files?.[ 0 ];
		if ( ! file ) return;

		if ( ! file.type.startsWith( 'image/' ) ) {
			showNotice( 'error', 'Please choose an image file.' );
			input.value = '';
			return;
		}
		if ( file.size > 3 * 1024 * 1024 ) {
			showNotice( 'error', 'Image must be under 3 MB.' );
			input.value = '';
			return;
		}

		setUploadingChatImg( true );
		try {
			let uploadFile;
			try {
				uploadFile = await normalizeImageForWpUpload( file );
			} catch ( convErr ) {
				throw convErr instanceof Error ? convErr : new Error( String( convErr ) );
			}

			const base = ( window?.nexulesuite_Admin?.restUrl || '' ).replace( /\/?$/, '' );
			const fd = new FormData();
			fd.append( 'file', uploadFile );

			const res = await fetch( `${ base }/nexulesuite_/v1/settings/upload-chat-image`, {
				method: 'POST',
				credentials: 'same-origin',
				headers: { 'X-WP-Nonce': window?.nexulesuite_Admin?.nonce || '' },
				body: fd,
			} );

			const json = await res.json().catch( () => null );
			if ( ! res.ok ) {
				let msg = json?.message ?? json?.code ?? `Upload failed (${ res.status })`;
				if ( typeof msg === 'object' && msg !== null ) {
					msg = msg.message || msg.code || 'Upload failed.';
				}
				throw new Error( typeof msg === 'string' ? msg : 'Upload failed.' );
			}

			const url = json?.data?.url || json?.source_url || json?.guid?.rendered;
			if ( ! url ) {
				throw new Error( 'No image URL returned.' );
			}

			updateSetting( 'chatButtonImage', url );
			showNotice( 'success', 'Image uploaded. Save configuration if you have other unsaved changes.' );
		} catch ( err ) {
			showNotice( 'error', err?.message || 'Could not upload image. Try pasting an image URL instead.' );
		} finally {
			setUploadingChatImg( false );
			input.value = '';
		}
	};

	const handleReportLogoUpload = async ( e ) => {
		const input = e.target;
		const file = input.files?.[ 0 ];
		if ( ! file ) return;

		if ( ! file.type.startsWith( 'image/' ) ) {
			showNotice( 'error', 'Please choose an image file.' );
			input.value = '';
			return;
		}
		if ( file.size > 3 * 1024 * 1024 ) {
			showNotice( 'error', 'Image must be under 3 MB.' );
			input.value = '';
			return;
		}

		setUploadingReportLogo( true );
		try {
			let uploadFile;
			try {
				uploadFile = await normalizeImageForWpUpload( file );
			} catch ( convErr ) {
				throw convErr instanceof Error ? convErr : new Error( String( convErr ) );
			}

			const base = ( window?.nexulesuite_Admin?.restUrl || '' ).replace( /\/?$/, '' );
			const fd = new FormData();
			fd.append( 'file', uploadFile );

			const res = await fetch( `${ base }/nexulesuite_/v1/settings/upload-report-logo`, {
				method: 'POST',
				credentials: 'same-origin',
				headers: { 'X-WP-Nonce': window?.nexulesuite_Admin?.nonce || '' },
				body: fd,
			} );

			const json = await res.json().catch( () => null );
			if ( ! res.ok ) {
				let msg = json?.message ?? json?.code ?? `Upload failed (${ res.status })`;
				if ( typeof msg === 'object' && msg !== null ) {
					msg = msg.message || msg.code || 'Upload failed.';
				}
				throw new Error( typeof msg === 'string' ? msg : 'Upload failed.' );
			}

			const url = json?.data?.url || json?.source_url || json?.guid?.rendered;
			if ( ! url ) {
				throw new Error( 'No image URL returned.' );
			}

			updateSetting( 'reportLogo', url );
			showNotice( 'success', 'Report logo uploaded. Save configuration to apply it in PDF reports.' );
		} catch ( err ) {
			showNotice( 'error', err?.message || 'Could not upload image. Try pasting an image URL instead.' );
		} finally {
			setUploadingReportLogo( false );
			input.value = '';
		}
	};

	const loadClientLinks = useCallback( async () => {
		try {
			const { res, json } = await apiFetch( '/settings/client-links' );
			if ( res.ok && json?.success ) {
				setClientLinks( json.data.links || [] );
			}
		} catch ( err ) {
			// Silent: the panel simply shows no links.
		}
	}, [] );

	useEffect( () => {
		loadClientLinks();
	}, [ loadClientLinks ] );

	const toggleLinkSection = ( id ) => {
		setLinkSections( ( current ) =>
			current.includes( id ) ? current.filter( ( s ) => s !== id ) : [ ...current, id ]
		);
	};

	const handleGenerateLink = async ( e ) => {
		if ( e ) e.preventDefault();
		try {
			const days = parseInt( String( linkExpiryDays || '0' ), 10 );
			const { res, json } = await apiFetch( '/settings/client-links', {
				method: 'POST',
				body: JSON.stringify( {
					label: linkLabel,
					expiresDays: Number.isFinite( days ) ? days : 0,
					sections: linkSections,
				} ),
			} );
			if ( ! res.ok || ! json?.success ) {
				let msg = json?.message || json?.code || 'Could not generate link.';
				if ( typeof msg === 'object' && msg !== null ) {
					msg = msg.message || msg.code || 'Could not generate link.';
				}
				throw new Error( typeof msg === 'string' ? msg : 'Could not generate link.' );
			}
			const url = json?.data?.url || '';
			setGeneratedLink( url );
			setLinkLabel( '' );
			await loadClientLinks();
			if ( url ) {
				showNotice( 'success', 'Share link created. Copy it now — it is shown only once.' );
			}
		} catch ( err ) {
			showNotice( 'error', err?.message || 'Could not generate link.' );
		}
	};

	const handleRevokeLink = async ( id ) => {
		// eslint-disable-next-line no-alert
		if ( ! window.confirm( 'Revoke this link? Anyone holding it loses access immediately.' ) ) {
			return;
		}
		try {
			const { res, json } = await apiFetch( `/settings/client-links/${ id }`, { method: 'DELETE' } );
			if ( ! res.ok || ! json?.success ) {
				throw new Error( 'Could not revoke link.' );
			}
			setGeneratedLink( '' );
			await loadClientLinks();
			showNotice( 'success', 'Link revoked.' );
		} catch ( err ) {
			showNotice( 'error', err?.message || 'Could not revoke link.' );
		}
	};

	const copyToClipboard = () => {
		if ( ! generatedLink ) return;
		navigator.clipboard.writeText( generatedLink );
		setCopySuccess( true );
		setTimeout( () => setCopySuccess( false ), 2000 );
	};

	const toggleExclusion = ( field, item ) => {
		const list = Array.isArray( settings[ field ] ) ? settings[ field ] : [];
		const key = exclusionRowKey( item );
		const exists = key && list.some( ( i ) => exclusionRowKey( i ) === key );
		const next = exists
			? list.filter( ( i ) => exclusionRowKey( i ) !== key )
			: [ ...list, {
				id: Number( item?.id ) > 0 ? Number( item.id ) : 0,
				title: String( item?.title ?? '' ),
				url: String( item?.url ?? '' ).trim(),
			} ];
		updateSetting( field, next );
	};

	const addExclusion = ( field, item ) => {
		setSettings( ( prev ) => {
			const list = Array.isArray( prev[ field ] ) ? prev[ field ] : [];
			const row = {
				id: Number( item?.id ) > 0 ? Number( item.id ) : 0,
				title: String( item?.title ?? '' ),
				url: String( item?.url ?? '' ).trim(),
			};
			const key = exclusionRowKey( row );
			if ( ! key || list.some( ( i ) => exclusionRowKey( i ) === key ) ) {
				return prev;
			}
			return {
				...prev,
				[ field ]: [ ...list, row ],
			};
		} );
	};

	const resolveExclusionContent = useCallback( async ( q, type ) => {
		const params = new URLSearchParams( { q, type } );
		const { json } = await apiFetch( `/settings/resolve-content?${ params.toString() }`, { method: 'GET' } );
		return json;
	}, [] );

	const getHoverClass = ( effect ) => {
		const map = {
			lift: 'hover:-translate-y-1 hover:shadow-xl',
			scale: 'hover:scale-105',
			glow: 'hover:shadow-[0_0_20px_rgba(37,99,235,0.6)]',
			shake: 'hover:animate-bounce',
			rotate: 'hover:rotate-2',
			darken: 'hover:brightness-90',
		};
		return map[ effect ] || '';
	};

	/* Filtered fonts for the picker */
	const filteredFonts = GOOGLE_FONTS.filter( ( f ) =>
		! fontSearch || f.family.toLowerCase().includes( fontSearch.toLowerCase() )
	);

	const selectedFontObj = GOOGLE_FONTS.find( ( f ) => f.family === settings.globalFont );

	/* Module accents mirror the Nexus Hub console palette (set/pop/menu/bot/mail/form). */
	const TAB_ACCENTS = {
		general: '#64748b',
		popup: '#8b5cf6',
		chat: '#06b6d4',
		ai: '#6366f1',
		smtp: '#f43f5e',
		backup: '#10b981',
	};

	const TABS = [
		{ id: 'general', label: 'General & Navigation', icon: Layout },
		{ id: 'popup', label: 'Auto PopUp Logic', icon: Zap },
		{ id: 'chat', label: 'Livechat & Styling', icon: MessageCircle },
		{ id: 'ai', label: 'AI Chatbot', icon: Bot },
		{ id: 'smtp', label: 'SMTP / Email', icon: Mail },
		{ id: 'backup', label: 'Export Settings', icon: Database },
	];

	return (
		<PageShell
			title="Settings"
			subtitle="Global configuration & automation logic"
			icon={ <Settings size={ 18 } /> }
			footer={
				( [ 'general', 'popup', 'chat', 'backup', 'smtp' ].includes( activeTab ) || ( activeTab === 'ai' && aiSubTab === 'setup' ) ) ? (
					<AdminStickyFooter
						actions={
							activeTab === 'smtp' ? (
								<button
									type="button"
									disabled={ smtpSaving }
									onClick={ handleSaveSmtp }
									className="flex items-center gap-3 rounded-tile px-10 py-3 text-xs font-black text-white transition-all duration-200 hover:brightness-110 active:scale-95 disabled:opacity-60"
									style={ {
										background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
										boxShadow: '0 8px 18px -8px #6366f1',
									} }
								>
									<Save size={ 16 } />{ smtpSaving ? 'Saving...' : 'Save SMTP Settings' }
								</button>
							) : (
								<>
									<button
										type="button"
										onClick={ () => setDiscardOpen( true ) }
										className="font-bold text-[10px] uppercase tracking-widest text-slate-400 transition-colors duration-200 hover:text-white"
									>
										Discard Changes
									</button>
									<button
										type="button"
										disabled={ saving }
										onClick={ handleSave }
										className="flex items-center gap-3 rounded-tile px-10 py-3 text-xs font-black text-white transition-all duration-200 hover:brightness-110 active:scale-95 disabled:opacity-60"
										style={ {
											background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
											boxShadow: '0 8px 18px -8px #6366f1',
										} }
									>
										<Save size={ 16 } />{ saving ? 'Saving...' : 'Save Configuration' }
									</button>
								</>
							)
						}
					/>
				) : null
			}
		>
			<SuccessModal
				open={ successOpen }
				message="Your settings have been successfully updated. All changes are now live."
				onDismiss={ () => setSuccessOpen( false ) }
			/>
			<ErrorModal
				open={ errorAlert.open }
				message={ errorAlert.text }
				onDismiss={ dismissErrorAlert }
			/>
			<ConfirmDiscardModal
				open={ discardOpen }
				onCancel={ () => setDiscardOpen( false ) }
				onConfirm={ () => {
					setDiscardOpen( false );
					handleDiscard();
				} }
				title="Reset settings to defaults?"
				description="All fields on this page return to factory defaults. Your saved server settings are unchanged until you click Save Configuration."
			/>

			<div className="w-full flex flex-col gap-6 md:gap-8">
					<div className="flex gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 text-[10px] font-bold text-slate-500 uppercase">
						<div className="flex items-center gap-2 px-3 py-1.5 border-r border-slate-100">
							<Server size={ 12 } className="text-blue-500" /> Ver { pluginVersion } Nexus
						</div>
						<div className="flex items-center gap-2 px-3 py-1.5">
							<CircleDot size={ 12 } className="text-green-500 animate-pulse" /> System Active
						</div>
					</div>

				<div className="bg-white rounded-[2rem] md:rounded-[1rem] border border-slate-200 shadow-sm flex flex-col overflow-hidden">

					{/* ── Tabs ── */}
					<div className="flex flex-wrap border-b border-line-soft p-2 bg-[#fbfcfe] gap-1 md:gap-2">
						{ TABS.map( ( tab ) => {
							const isActive = activeTab === tab.id;
							const accent = TAB_ACCENTS[ tab.id ] || '#6366f1';
							return (
								<button
									key={ tab.id }
									onClick={ () => setActiveTab( tab.id ) }
									className={ `flex items-center gap-2 px-4 md:px-6 py-3 rounded-tile text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all duration-200 ${ isActive ? 'text-white' : 'text-faint hover:text-ink-2' }` }
									style={ isActive ? { background: accent, boxShadow: `0 5px 12px -5px ${ accent }` } : undefined }
								>
									<tab.icon size={ 14 } />{ tab.label }
								</button>
							);
						} ) }
					</div>

					{/* ── Content ── */}
					<div className="p-6 md:p-10 flex-1 overflow-y-auto">
						{ loading ? (
							<div className="flex items-center justify-center min-h-[400px]">
								<div className="flex flex-col items-center gap-4">
									<div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
									<span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Loading configuration...</span>
								</div>
							</div>
						) : (
							<>
								{/* ════════════════════════════════════════════
								    GENERAL & NAVIGATION
								════════════════════════════════════════════ */}
								{ activeTab === 'general' && (
									<div className="nexulesuite_settings-general-wrap">
										<div className="nexulesuite_sg-card">
											<section className="nexulesuite_sg-section is-first">
												<div className="nexulesuite_sg-sec-head">
													<span className="nexulesuite_sg-sec-ico">
														<Layout size={ 16 } />
													</span>
													<div>
														<span className="nexulesuite_sg-sec-title nexulesuite_sg-title-tip">Navigation &amp; Email <InfoTip text={ 'Footer menu behaviour and activity notification routing.' } /></span>
													</div>
												</div>
												<div className="nexulesuite_sg-grid-2 nexulesuite_sg-grid-2-stretch">
													<div className="nexulesuite_sg-stack">
														<div className="nexulesuite_sg-toggle-card">
															<div className="nexulesuite_sg-toggle-card-body">
																<span className="nexulesuite_sg-toggle-card-title">Enable Navigation</span>
																<p className="hint">Footer navigation menu auto-stack</p>
															</div>
															<div
																className={ `nexulesuite_sg-toggle${ settings.enableNavigation ? ' on' : '' }` }
																role="switch"
																aria-checked={ settings.enableNavigation }
																tabIndex={ 0 }
																onClick={ () => updateSetting( 'enableNavigation', ! settings.enableNavigation ) }
																onKeyDown={ ( e ) => {
																	if ( e.key === ' ' || e.key === 'Enter' ) {
																		e.preventDefault();
																		updateSetting( 'enableNavigation', ! settings.enableNavigation );
																	}
																} }
															>
																<span className="track"><span className="knob" /></span>
															</div>
														</div>
														<div className="nexulesuite_sg-select-card">
															<span className="lbl nexulesuite_lbl-tip">Events Email Template <InfoTip text={ 'Used for Activity Notifications only — form submission data is NOT sent via this notification email.' } /></span>
															<select
																className="sel"
																value={ settings.selectedEmailTemplate }
																onChange={ ( e ) => updateSetting( 'selectedEmailTemplate', e.target.value ) }
															>
																<option value="">No Template Selected</option>
																{ emailTemplates.map( ( t ) => (
																	<option key={ t.id } value={ t.id }>{ t.name }</option>
																) ) }
															</select>
														</div>
													</div>
													<div className="nexulesuite_sg-stack">
														<div className="nexulesuite_sg-toggle-card">
															<div className="nexulesuite_sg-toggle-card-body">
																<span className="nexulesuite_sg-toggle-card-title">Allow Client Access</span>
																<p className="hint">Temporary reporting access</p>
															</div>
															<div
																className={ `nexulesuite_sg-toggle${ settings.allowClientAccess ? ' on' : '' }` }
																role="switch"
																aria-checked={ settings.allowClientAccess }
																tabIndex={ 0 }
																onClick={ () => updateSetting( 'allowClientAccess', ! settings.allowClientAccess ) }
																onKeyDown={ ( e ) => {
																	if ( e.key === ' ' || e.key === 'Enter' ) {
																		e.preventDefault();
																		updateSetting( 'allowClientAccess', ! settings.allowClientAccess );
																	}
																} }
															>
																<span className="track"><span className="knob" /></span>
															</div>
														</div>
														<div className={ `nexulesuite_sg-client-panel${ ! settings.allowClientAccess ? ' is-disabled' : '' }` }>
															<div className="nexulesuite_sg-field">
																<span className="lbl nexulesuite_lbl-tip">Report URL slug <InfoTip text={ 'Pretty URL path (save settings, then generate the link). Plain permalinks use a query-string URL automatically.' } /></span>
																<input
																	type="text"
																	className="inp"
																	value={ settings.clientAccessSlug }
																	onChange={ ( e ) => updateSetting( 'clientAccessSlug', e.target.value ) }
																	placeholder="report-access"
																/>
															</div>
															<div className="nexulesuite_sg-grid-2">
																<div className="nexulesuite_sg-field">
																	<span className="lbl">Link name</span>
																	<input
																		type="text"
																		className="inp"
																		value={ linkLabel }
																		onChange={ ( e ) => setLinkLabel( e.target.value ) }
																		placeholder="Acme Corp"
																	/>
																</div>
																<div className="nexulesuite_sg-field">
																	<span className="lbl nexulesuite_lbl-tip">Expires in (days) <InfoTip text={ '0 keeps the link alive until you revoke it.' } /></span>
																	<input
																		type="number"
																		min="0"
																		max="730"
																		className="inp"
																		value={ linkExpiryDays }
																		onChange={ ( e ) => setLinkExpiryDays( e.target.value ) }
																	/>
																</div>
															</div>

															<div className="nexulesuite_sg-field">
																<span className="lbl nexulesuite_lbl-tip">Sections this client may see <InfoTip text={ 'Chat transcripts and form answers contain visitor personal data. The link only exposes what you tick here, and the export endpoint enforces it too.' } /></span>
																<div className="nexulesuite_sg-checks">
																	{ REPORT_SECTIONS.map( ( section ) => (
																		<label key={ section.id } className="nexulesuite_sg-check">
																			<input
																				type="checkbox"
																				checked={ linkSections.includes( section.id ) }
																				onChange={ () => toggleLinkSection( section.id ) }
																			/>
																			<span>{ section.label }</span>
																		</label>
																	) ) }
																</div>
															</div>

															<button
																type="button"
																onClick={ handleGenerateLink }
																className="nexulesuite_sg-btn nexulesuite_sg-btn-primary"
															>
																<Wand2 size={ 14 } /> Create share link
															</button>

															{ /* Shown once: the token lives only in this URL, never in the database. */ }
															<div className="nexulesuite_sg-link-box">
																<span className="nexulesuite_sg-link-ico" aria-hidden="true"><Globe size={ 16 } /></span>
																{ generatedLink ? (
																	<div className="nexulesuite_sg-link-inner">
																		<input readOnly value={ generatedLink } className="nexulesuite_sg-link-inp" />
																		<button type="button" onClick={ copyToClipboard } className="nexulesuite_sg-link-copy" aria-label="Copy link">
																			{ copySuccess ? <Check size={ 16 } className="is-copied" /> : <Copy size={ 16 } /> }
																		</button>
																	</div>
																) : (
																	<span className="nexulesuite_sg-link-placeholder">Copy the link now — it is shown only once.</span>
																) }
															</div>

															{ clientLinks.length > 0 ? (
																<table className="nexulesuite_sg-links-table">
																	<thead>
																		<tr>
																			<th>Name</th>
																			<th>Sections</th>
																			<th>Expires</th>
																			<th>Opened</th>
																			<th />
																		</tr>
																	</thead>
																	<tbody>
																		{ clientLinks.map( ( link ) => (
																			<tr key={ link.id }>
																				<td>{ link.label }</td>
																				<td className="nexulesuite_sg-links-sections">{ link.sections.join( ', ' ) || '—' }</td>
																				<td>{ link.expires ? new Date( link.expires * 1000 ).toLocaleDateString() : 'Never' }</td>
																				<td>{ link.uses }×</td>
																				<td>
																					<button
																						type="button"
																						className="nexulesuite_sg-link-revoke"
																						onClick={ () => handleRevokeLink( link.id ) }
																					>
																						Revoke
																					</button>
																				</td>
																			</tr>
																		) ) }
																	</tbody>
																</table>
															) : null }
														</div>
													</div>
												</div>
											</section>

											<section className="nexulesuite_sg-section">
												<div className="nexulesuite_sg-sec-head">
													<span className="nexulesuite_sg-sec-ico">
														<ImageIcon size={ 16 } />
													</span>
													<div>
														<span className="nexulesuite_sg-sec-title nexulesuite_sg-title-tip">Report &amp; PDF Logo <InfoTip text={ 'If uploaded, the logo appears above the site title in PDF reports; otherwise only the title shows.' } /></span>
													</div>
												</div>
												<div className="nexulesuite_sg-grid-2">
													<div className="nexulesuite_sg-stack">
														<div className="nexulesuite_sg-field">
															<span className="lbl nexulesuite_lbl-tip">Logo URL <InfoTip text={ 'Source file min. 700 × 700 px for sharp PDF · transparent PNG/WebP · max 3 MB · Preview uses 70 × 70 px (no cropping or stretch).' } /></span>
															<div className="nexulesuite_sg-logo-row">
																<input
																	type="text"
																	className="inp"
																	value={ settings.reportLogo }
																	onChange={ ( e ) => updateSetting( 'reportLogo', e.target.value ) }
																	placeholder="Paste an image URL or upload…"
																/>
																<input type="file" accept="image/*" className="hidden" ref={ reportLogoInputRef } onChange={ handleReportLogoUpload } />
																<button
																	type="button"
																	onClick={ () => reportLogoInputRef.current?.click?.() }
																	disabled={ uploadingReportLogo }
																	className="nexulesuite_sg-btn nexulesuite_sg-btn-primary"
																>
																	{ uploadingReportLogo ? <Loader2 size={ 16 } className="animate-spin" /> : <Upload size={ 16 } /> }
																	Upload
																</button>
																<button
																	type="button"
																	onClick={ () => updateSetting( 'reportLogo', '' ) }
																	disabled={ ! settings.reportLogo }
																	className="nexulesuite_sg-btn nexulesuite_sg-btn-secondary"
																>
																	<X size={ 16 } /> Remove
																</button>
															</div>
														</div>
														<div className="nexulesuite_sg-field">
															<span className="lbl nexulesuite_lbl-tip">Logo size in PDF <InfoTip text={ `Controls how large the logo prints in PDF reports. Range ${ REPORT_LOGO_PDF_MIN }–${ REPORT_LOGO_PDF_MAX } · default ${ REPORT_LOGO_PDF_DEFAULT }. The preview updates as you drag.` } /></span>
															<div className="nexulesuite_sg-logo-size-row">
																<input type="range" min={ REPORT_LOGO_PDF_MIN } max={ REPORT_LOGO_PDF_MAX } step="10" value={ reportLogoPdfMax } onChange={ ( e ) => updateSetting( 'reportLogoPdfMax', Number( e.target.value ) ) } className="nexulesuite_sg-logo-size-range" aria-label="Logo size in PDF reports" />
																<input type="number" min={ REPORT_LOGO_PDF_MIN } max={ REPORT_LOGO_PDF_MAX } step="10" value={ settings.reportLogoPdfMax ?? REPORT_LOGO_PDF_DEFAULT } onChange={ ( e ) => updateSetting( 'reportLogoPdfMax', e.target.value === '' ? '' : Number( e.target.value ) ) } onBlur={ () => updateSetting( 'reportLogoPdfMax', clampReportLogoPdfMax( settings.reportLogoPdfMax ) ) } className="inp nexulesuite_sg-logo-size-num" aria-label="Logo size in PDF reports (points)" />
																<span className="nexulesuite_sg-logo-size-unit">pt</span>
															</div>
														</div>
													</div>
													<div className="nexulesuite_sg-stack">
														<span className="lbl">PDF report header preview</span>
														<div className="nexulesuite_sg-preview-box">
																<div
																	className="nexulesuite_sg-preview-logo"
																	style={ {
																		width: `${ reportLogoPreviewPx }px`,
																		height: `${ reportLogoPreviewPx }px`,
																		minWidth: `${ reportLogoPreviewPx }px`,
																		minHeight: `${ reportLogoPreviewPx }px`,
																	} }
																>
																{ settings.reportLogo ? (
																	<img
																		src={ settings.reportLogo }
																		alt="Report Logo"
																		className="nexulesuite_sg-preview-img"
																	/>
																) : (
																	<ImageIcon size={ 22 } className="nexulesuite_sg-preview-empty" aria-hidden />
																) }
															</div>
															<div className="nexulesuite_sg-preview-title">{ window?.nexulesuite_Admin?.siteName || 'Site Title' }</div>
															<div className="nexulesuite_sg-preview-sub">Activities Report</div>
														</div>
													</div>
												</div>
											</section>

											<section className="nexulesuite_sg-section">
												<div className="nexulesuite_sg-sec-head">
													<span className="nexulesuite_sg-sec-ico is-violet">
														<FontIcon size={ 16 } />
													</span>
													<div>
														<span className="nexulesuite_sg-sec-title nexulesuite_sg-title-tip">Global Font Settings <InfoTip text={ 'Font, size, weight & line height apply globally to all plugin frontend elements (Forms, Popups, Menu Items & Reports). Served via Google CDN — no files stored in the plugin.' } /></span>
													</div>
												</div>
												<div className="nexulesuite_sg-grid-2">
													<div className="nexulesuite_sg-stack">
														<input
															type="text"
															className="inp"
															placeholder="Search fonts..."
															value={ fontSearch }
															onChange={ ( e ) => setFontSearch( e.target.value ) }
														/>
														<div className="nexulesuite_sg-font-list">
															{ filteredFonts.length === 0 ? (
																<div className="nexulesuite_sg-font-empty">No fonts found</div>
															) : filteredFonts.map( ( font ) => {
																const isSelected = settings.globalFont === font.family;
																return (
																	<button
																		key={ font.family }
																		type="button"
																		onClick={ () => updateSetting( 'globalFont', font.family ) }
																		className={ `nexulesuite_sg-font-item${ isSelected ? ' is-selected' : '' }` }
																		style={ { fontFamily: `'${ font.family }', ${ font.category === 'Serif' ? 'serif' : font.category === 'Monospace' ? 'monospace' : 'sans-serif' }` } }
																	>
																		<span className="nexulesuite_sg-font-name">{ font.family }</span>
																		<span className="nexulesuite_sg-font-cat">{ font.category }</span>
																	</button>
																);
															} ) }
														</div>
														<p className="nexulesuite_sg-font-meta">{ GOOGLE_FONTS.length } fonts · Google CDN · zero files in plugin</p>
													</div>
													<div className="nexulesuite_sg-stack">
														<div
															className="nexulesuite_sg-font-preview"
															style={ { fontFamily: settings.globalFont ? `'${ settings.globalFont }', sans-serif` : 'inherit' } }
														>
															<div className="nexulesuite_sg-font-preview-head">
																<span className="lbl">Live Preview</span>
																<span className="nexulesuite_sg-font-badge">{ settings.globalFont || 'System Default' }</span>
															</div>
															<h2 className="nexulesuite_sg-font-h2">The quick brown fox</h2>
															<h4 className="nexulesuite_sg-font-h4">Jumps over the lazy dog</h4>
															<p className="nexulesuite_sg-font-body">
																Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
															</p>
															<div className="nexulesuite_sg-font-btns">
																<button type="button" className="nexulesuite_sg-font-btn-primary">Submit Form</button>
																<button type="button" className="nexulesuite_sg-font-btn-secondary">Chat Now</button>
															</div>
															<div className="nexulesuite_sg-font-input-demo">
																<span className="lbl">Form Input</span>
																<div className="nexulesuite_sg-font-input-fake">Type your name here...</div>
															</div>
														</div>
													</div>
												</div>
											</section>

										</div>
									</div>
								) }

								{/* ════════════════════════════════════════════
								    AUTO POPUP LOGIC
								════════════════════════════════════════════ */}
								{ activeTab === 'popup' && (
									<div className="space-y-8 flex flex-col">
										<div className="p-8 bg-white border border-line rounded-card shadow-card space-y-6">
											<InlineToggle
												enabled={ settings.enableAutoPopup }
												onClick={ () => updateSetting( 'enableAutoPopup', ! settings.enableAutoPopup ) }
												label="Enable Auto POPUP"
												icon={ Zap }
											/>

											<div className="space-y-3">
												<label className="text-[11px] font-bold text-muted uppercase tracking-widest ml-1">Button Classes</label>
												<textarea
													value={ settings.activityButtonClasses }
													onChange={ ( e ) => updateSetting( 'activityButtonClasses', e.target.value ) }
													className="w-full h-24 p-4 bg-[#fbfcfe] border border-line rounded-tile text-xs font-mono focus:ring-2 focus:ring-pop/30 focus:border-pop outline-none resize-none transition-all"
													placeholder="nexas | xyz-pop, xyz-alert"
												/>
												<div className="text-[10px] text-muted leading-relaxed bg-[#fbfcfe] p-4 rounded-tile border border-line-soft font-medium">
													Each class should be separated by a comma. Use a pipe (<span className="text-pop font-bold">|</span>) before class for popups.
													<br /><span className="font-bold">Example:</span> <code className="bg-white border border-line px-1 rounded text-pop font-bold">popupId | className</code>
												</div>
											</div>
										</div>

										<div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:items-stretch">
											<div className="nexulesuite_settings-autopopup-exclusion-wrap flex flex-col min-h-[320px]">
												<div className="nexulesuite_sap-excl-card">
													<section className="nexulesuite_sap-excl-section is-first">
														<div className="nexulesuite_sap-excl-sec-head">
															<span className="nexulesuite_sap-excl-sec-ico" aria-hidden="true">
																<FileX size={ 16 } />
															</span>
															<div>
																<span className="nexulesuite_sap-excl-sec-title">Exclusion Rules</span>
																<p className="nexulesuite_sap-excl-sec-desc">Suppress auto popup on selected posts and pages.</p>
															</div>
														</div>
														<div className="nexulesuite_sap-excl-stack">
															<ExclusionField
																label="Exclude Posts"
																chipClass="is-post"
																placeholder="Paste post URL or search title…"
																options={ allPosts }
																selected={ settings.excludePosts }
																type="post"
																onToggle={ ( item ) => toggleExclusion( 'excludePosts', item ) }
																onAdd={ ( item ) => addExclusion( 'excludePosts', item ) }
																resolve={ resolveExclusionContent }
															/>
															<ExclusionField
																label="Exclude Pages"
																chipClass="is-page"
																placeholder="Paste page URL or search title…"
																options={ allPages }
																selected={ settings.excludePages }
																type="page"
																onToggle={ ( item ) => toggleExclusion( 'excludePages', item ) }
																onAdd={ ( item ) => addExclusion( 'excludePages', item ) }
																resolve={ resolveExclusionContent }
															/>
														</div>
													</section>
												</div>
											</div>

											<div
												className={ [
													'p-8 bg-navy text-white rounded-card shadow-lift flex flex-col gap-6 border border-white/5 min-h-[320px]',
													settings.enableAutoPopup ? '' : 'opacity-55 pointer-events-none',
												].join( ' ' ) }
											>
												<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
													<div className="flex items-start gap-3 min-w-0">
														<Layers size={ 22 } className="shrink-0 text-[#a78bfa] mt-0.5" aria-hidden />
														<div className="min-w-0">
															<h5 className="font-display text-sm font-bold uppercase tracking-tight text-white leading-snug">
																Default Nexus forms (timer / scroll / exit)
															</h5>
															<p className="mt-2 text-[10px] text-slate-400 leading-relaxed">
																Add one or more form slots — same idea as <strong className="font-semibold text-slate-200">Emails → template layers</strong>. Order is top to bottom in the popup.
															</p>
														</div>
													</div>
													<button
														type="button"
														onClick={ () => setAutoPopupFormRows( ( prev ) => [ ...prev, newAutoPopupFormRow() ] ) }
														className="inline-flex items-center justify-center gap-2 shrink-0 rounded-tile px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-white transition-all hover:brightness-110 active:scale-[0.98] sm:self-start"
														style={ {
															background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
															boxShadow: '0 8px 18px -8px #8b5cf6',
														} }
													>
														<Plus size={ 14 } /> Add form slot
													</button>
												</div>

												<div className="flex-1 flex flex-col gap-4 min-h-0">
													{ autoPopupFormRows.length === 0 ? (
														<div className="rounded-2xl border border-dashed border-white/25 bg-white/5 px-4 py-8 text-center flex-1 flex flex-col items-center justify-center">
															<p className="text-xs font-semibold text-slate-200">No default Nexus forms configured</p>
															<p className="mt-2 text-[10px] text-slate-400 leading-relaxed max-w-md">
																Leave this empty or add slots and pick a Nexus form in each dropdown. Multiple forms append in sequence when <strong className="text-slate-300">Popup Body</strong> is empty.
															</p>
															<button
																type="button"
																onClick={ () => setAutoPopupFormRows( [ newAutoPopupFormRow() ] ) }
																className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-semibold text-white border border-white/15 hover:bg-white/15"
															>
																<Plus size={ 16 } /> Add first form slot
															</button>
														</div>
													) : (
														<ul className="space-y-2">
															{ autoPopupFormRows.map( ( row, idx ) => (
																<li
																	key={ row.rowKey }
																	className="flex flex-wrap items-center gap-2 rounded-xl border border-white/15 bg-white/5 p-3"
																>
																	<span className="w-8 shrink-0 text-center text-[10px] font-bold text-slate-500 tabular-nums">{ idx + 1 }</span>
																	<select
																		value={ row.formId }
																		onChange={ ( e ) => {
																			const val = e.target.value;
																			setAutoPopupFormRows( ( prev ) =>
																				prev.map( ( r ) => ( r.rowKey === row.rowKey ? { ...r, formId: val } : r ) )
																			);
																		} }
																		className="min-w-0 flex-1 p-2.5 bg-white/10 border border-white/20 rounded-lg text-xs font-medium text-white outline-none focus:ring-2 focus:ring-pop focus:border-transparent"
																		aria-label={ `Default Nexus form slot ${ idx + 1 }` }
																	>
																		<option value="">— Skip this slot —</option>
																		{ formsList.map( ( f ) => (
																			<option key={ f.id } value={ f.id }>{ f.name } (Nexus)</option>
																		) ) }
																	</select>
																	<button
																		type="button"
																		title="Remove this slot"
																		aria-label="Remove this slot"
																		onClick={ () =>
																			setAutoPopupFormRows( ( prev ) => prev.filter( ( r ) => r.rowKey !== row.rowKey ) )
																		}
																		className="shrink-0 rounded-lg border border-transparent p-2 text-slate-500 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-rose-400"
																	>
																		<Trash2 size={ 16 } />
																	</button>
																</li>
															) ) }
														</ul>
													) }

													<p className="text-[10px] text-slate-400 leading-relaxed mt-auto pt-2 border-t border-white/10">
														<strong className="font-semibold text-slate-200">Nexus Form Builder</strong> only. Prepend runs <strong className="font-semibold text-slate-200">only when the popup body is completely empty</strong> and the popup uses timer, scroll, or exit. If <strong className="font-semibold text-slate-200">Popups → Popup Body</strong> has any shortcode or HTML, nothing is prepended. Third-party forms: paste their shortcode in the body and remove these slots.
													</p>
												</div>
											</div>
										</div>
									</div>
								) }

								{/* ════════════════════════════════════════════
								    LIVECHAT & STYLING
								════════════════════════════════════════════ */}
								{ activeTab === 'chat' && (
									<div className="nexulesuite_settings-livechat-wrap">
										<div className="nexulesuite_lc-layout">
											<div className="nexulesuite_lc-main">
												<div className="nexulesuite_lc-card">
													<section className="nexulesuite_lc-section is-first">
														<div className="nexulesuite_lc-sec-head">
															<span className="nexulesuite_lc-sec-ico" aria-hidden="true">
																<MessageCircle size={ 16 } />
															</span>
															<div>
																<span className="nexulesuite_lc-sec-title nexulesuite_sg-title-tip">Livechat Widget <InfoTip text={ 'Enable the floating chat widget and configure the header content shown in the panel.' } /></span>
															</div>
														</div>
														<div className="nexulesuite_lc-stack">
															<div className="nexulesuite_lc-toggle-card">
																<div className="nexulesuite_lc-toggle-card-body">
																	<span className="nexulesuite_lc-toggle-card-title">Enable Livechat Widget</span>
																</div>
																<div
																	className={ `nexulesuite_lc-toggle${ settings.enableLivechat ? ' on' : '' }` }
																	role="switch"
																	aria-checked={ settings.enableLivechat }
																	tabIndex={ 0 }
																	onClick={ () => updateSetting( 'enableLivechat', ! settings.enableLivechat ) }
																	onKeyDown={ ( e ) => {
																		if ( e.key === ' ' || e.key === 'Enter' ) {
																			e.preventDefault();
																			updateSetting( 'enableLivechat', ! settings.enableLivechat );
																		}
																	} }
																>
																	<span className="track"><span className="knob" /></span>
																</div>
															</div>
															<div className="nexulesuite_lc-grid-2">
																<div className="nexulesuite_lc-field is-full">
																	<div className="nexulesuite_lc-upload-row">
																		<input
																			type="text"
																			className="inp"
																			value={ settings.chatButtonImage }
																			onChange={ ( e ) => updateSetting( 'chatButtonImage', e.target.value ) }
																			placeholder="Livechat button image — URL or upload…"
																		/>
																		<input type="file" accept="image/*" className="hidden" ref={ fileInputRef } onChange={ handleImageUpload } />
																		<button
																			type="button"
																			disabled={ uploadingChatImg }
																			onClick={ () => fileInputRef.current.click() }
																			className="nexulesuite_lc-btn nexulesuite_lc-btn-primary"
																			title="Upload to Media Library"
																		>
																			{ uploadingChatImg ? <Loader2 size={ 16 } className="animate-spin" /> : <Upload size={ 16 } /> }
																			Upload
																		</button>
																	</div>
																</div>
																<div className="nexulesuite_lc-field">
																	<input
																		type="text"
																		className="inp"
																		value={ settings.chatTitle }
																		onChange={ ( e ) => updateSetting( 'chatTitle', e.target.value ) }
																		placeholder="Livechat Title"
																	/>
																</div>
																<div className="nexulesuite_lc-field">
																	<input
																		type="text"
																		className="inp"
																		value={ settings.chatBadge }
																		onChange={ ( e ) => updateSetting( 'chatBadge', e.target.value ) }
																		placeholder="Livechat Badge"
																	/>
																</div>
																<div className="nexulesuite_lc-field is-full">
																	<textarea
																		className="ta"
																		value={ settings.chatContent }
																		onChange={ ( e ) => updateSetting( 'chatContent', e.target.value ) }
																		placeholder="Livechat Content"
																	/>
																</div>
															</div>
														</div>
													</section>

													<section className="nexulesuite_lc-section">
														<div className="nexulesuite_lc-sec-head">
															<span className="nexulesuite_lc-sec-ico" aria-hidden="true">
																<Code2 size={ 16 } />
															</span>
															<div>
																<span className="nexulesuite_lc-sec-title nexulesuite_sg-title-tip">Embed Code <InfoTip text={ 'The floating widget already shows site-wide. Use these to put the same chat inside a specific page — it runs the identical chat, so AI replies, FAQ buttons and inline forms all behave the same.' } /></span>
															</div>
														</div>
														<div className="nexulesuite_lc-stack">
															{ ! settings.enableLivechat && (
																<p className="hint">Turn on <strong>Enable Livechat Widget</strong> above — the embed stays blank while livechat is off.</p>
															) }

															<div className="nexulesuite_sg-field">
																<span className="lbl nexulesuite_lbl-tip">Shortcode <InfoTip text={ 'Paste into any page, post, widget area or page builder. Optional attributes: height, max_width, full_width, hide_floating, mode.' } /></span>
																<div className="nexulesuite_sg-link-box">
																	<span className="nexulesuite_sg-link-ico" aria-hidden="true"><Code2 size={ 16 } /></span>
																	<div className="nexulesuite_sg-link-inner">
																		<input readOnly value={ chatShortcode } className="nexulesuite_sg-link-inp" onFocus={ ( e ) => e.target.select() } />
																		<button type="button" onClick={ () => copyEmbed( 'shortcode', chatShortcode ) } className="nexulesuite_sg-link-copy" aria-label="Copy shortcode">
																			{ embedCopied === 'shortcode' ? <Check size={ 16 } className="is-copied" /> : <Copy size={ 16 } /> }
																		</button>
																	</div>
																</div>
																<p className="hint">Renders straight into the page and fills its container, so it reads as part of the design rather than a floating bubble. If your builder drops it into a narrow column, the chat can only be as wide as that column &mdash; use <code>[nexulesuite_chat full_width=&quot;yes&quot; max_width=&quot;1200px&quot;]</code> to span the page anyway. The floating bubble stands down on that page so visitors get one chat, not two; add <code>hide_floating=&quot;no&quot;</code> to keep both.</p>
															</div>

															<div className="nexulesuite_sg-field">
																<span className="lbl nexulesuite_lbl-tip">HTML embed <InfoTip text={ 'Only for places that cannot run a shortcode at all. Loads the chat in an iframe, which is a fixed box rather than part of the page flow.' } /></span>
																<div className="nexulesuite_sg-link-box">
																	<span className="nexulesuite_sg-link-ico" aria-hidden="true"><LinkIcon size={ 16 } /></span>
																	<div className="nexulesuite_sg-link-inner">
																		<input readOnly value={ chatIframeCode } className="nexulesuite_sg-link-inp" onFocus={ ( e ) => e.target.select() } />
																		<button type="button" onClick={ () => copyEmbed( 'iframe', chatIframeCode ) } className="nexulesuite_sg-link-copy" aria-label="Copy HTML embed code">
																			{ embedCopied === 'iframe' ? <Check size={ 16 } className="is-copied" /> : <Copy size={ 16 } /> }
																		</button>
																	</div>
																</div>
																<p className="hint">Prefer the shortcode. Use this only where a shortcode cannot run &mdash; it is an iframe, so it stays a fixed box and cannot grow with the page.</p>
															</div>
														</div>
													</section>

													<section className="nexulesuite_lc-section">
														<div className="nexulesuite_lc-sec-head">
															<span className="nexulesuite_lc-sec-ico is-violet" aria-hidden="true">
																<MousePointer2 size={ 16 } />
															</span>
															<div>
																<span className="nexulesuite_lc-sec-title nexulesuite_sg-title-tip">Chat Buttons &amp; Redirects <InfoTip text={ 'Configure the button labels and where each action links — a URL or a popup.' } /></span>
															</div>
														</div>
														<div className="nexulesuite_lc-btn-list">
															{ [
																{ key: 'chatFormButton', linkKey: 'chatFormButtonLink', label: 'Button 01', placeholder: 'Start Conversation' },
																{ key: 'chatButtonTwo',  linkKey: 'chatButtonTwoLink',  label: 'Button 02', placeholder: "What's App" },
																{ key: 'chatButtonThird', linkKey: 'chatButtonThirdLink', label: 'Button 03', placeholder: 'E-mail' },
															].map( ( btn ) => {
																const rawLink   = settings[ btn.linkKey ] || '';
																const isPopup   = rawLink.startsWith( 'popup:' );
																const popupVal  = isPopup ? rawLink.replace( 'popup:', '' ) : '';
																const linkType  = isPopup ? 'popup' : 'link';
																const isBtn1    = btn.key === 'chatFormButton';

																const switchType = ( type ) => {
																	if ( type === 'popup' ) {
																		updateSetting( btn.linkKey, 'popup:' );
																	} else {
																		updateSetting( btn.linkKey, '' );
																	}
																};
																const setPopupVal = ( eventName ) => updateSetting( btn.linkKey, 'popup:' + eventName );

																return (
																	<div key={ btn.key } className="nexulesuite_lc-btn-card">
																		<div className="nexulesuite_lc-field">
																			<span className="lbl">{ btn.label } — Label</span>
																			<input
																				type="text"
																				className="inp"
																				value={ settings[ btn.key ] }
																				onChange={ ( e ) => updateSetting( btn.key, e.target.value ) }
																				placeholder={ btn.placeholder }
																			/>
																		</div>
																		<div className="nexulesuite_lc-field">
																			<span className="lbl">Link Type</span>
																			<div className="nexulesuite_lc-seg">
																				{ [ 'link', 'popup' ].map( ( type ) => (
																					<button
																						key={ type }
																						type="button"
																						onClick={ () => switchType( type ) }
																						className={ linkType === type ? 'is-active' : '' }
																					>
																						{ type === 'link' ? 'Link' : 'Popup' }
																					</button>
																				) ) }
																			</div>
																		</div>
																		{ linkType === 'link' ? (
																			<div className="nexulesuite_lc-field">
																				<span className="lbl">Destination URL</span>
																				<input
																					type="text"
																					className="inp mono"
																					value={ isPopup ? '' : rawLink }
																					onChange={ ( e ) => updateSetting( btn.linkKey, e.target.value ) }
																					placeholder="https://wa.me/... or mailto:... or any URL"
																				/>
																			</div>
																		) : (
																			<div className="nexulesuite_lc-field is-popup-select">
																				<span className="lbl">Select Popup</span>
																				{ popups.length === 0 ? (
																					<div className="nexulesuite_lc-alert">
																						No popups created yet. Go to <strong>Nexus → Popups</strong> and create one first.
																					</div>
																				) : (
																					<select
																						value={ popupVal }
																						onChange={ ( e ) => setPopupVal( e.target.value ) }
																						className="sel"
																					>
																						<option value="">— Select a Popup —</option>
																						{ popups.map( ( p ) => (
																							<option key={ p.id } value={ p.eventName || p.id }>
																								{ p.name || p.id }{ p.eventName ? ` (event: ${ p.eventName })` : '' }
																							</option>
																						) ) }
																					</select>
																				) }
																			</div>
																		) }
																		{ isBtn1 && linkType === 'popup' && (
																			<p className="nexulesuite_lc-info-note">
																				Popup form setup <InfoTip text={ 'Selected popup content is shown inside the chat bubble. Use [nexulesuite_form id="…"] in the popup body, and set recipient email(s) on that form under Form Builder → Advanced → Submission notification email(s).' } />
																			</p>
																		) }
																	</div>
																);
															} ) }
														</div>
													</section>

													<section className="nexulesuite_lc-section">
														<div className="nexulesuite_lc-sec-head">
															<span className="nexulesuite_lc-sec-ico is-violet" aria-hidden="true">
																<Paintbrush size={ 16 } />
															</span>
															<div>
																<span className="nexulesuite_lc-sec-title nexulesuite_sg-title-tip">Button &amp; Widget Styling <InfoTip text={ 'Position, colours, spacing and hover effects for the chat widget and buttons.' } /></span>
															</div>
														</div>
														<div className="nexulesuite_lc-grid-2">
															<div className="nexulesuite_lc-field is-full">
																<span className="lbl nexulesuite_lbl-tip">Widget Position <InfoTip text={ 'Pins the entire floating chat widget to the left or right edge of the site (same as the front-end).' } /></span>
																<div className="nexulesuite_lc-seg">
																	{ [
																		{ id: 'left', label: 'Left side', Icon: AlignLeft },
																		{ id: 'right', label: 'Right side', Icon: AlignRight },
																	].map( ( { id, label, Icon } ) => {
																		const active = ( settings.chatAlign === 'left' ? 'left' : 'right' ) === id;
																		return (
																			<button
																				key={ id }
																				type="button"
																				onClick={ () => updateSetting( 'chatAlign', id ) }
																				className={ active ? 'is-active' : '' }
																			>
																				<Icon size={ 15 } strokeWidth={ 2.25 } aria-hidden />
																				<span>{ label }</span>
																			</button>
																		);
																	} ) }
																</div>
															</div>
															<div className="nexulesuite_lc-color-field">
																<span className="lbl">Button BG</span>
																<div className="cgroup">
																	<label className="cswatch" style={ { backgroundColor: settings.primaryBtnBg } }>
																		<input type="color" value={ settings.primaryBtnBg } onChange={ ( e ) => updateSetting( 'primaryBtnBg', e.target.value ) } />
																	</label>
																	<input type="text" className="chex" value={ settings.primaryBtnBg } onChange={ ( e ) => updateSetting( 'primaryBtnBg', e.target.value ) } />
																</div>
															</div>
															<div className="nexulesuite_lc-range-field">
																<div className="nexulesuite_lc-range-head">
																	<span className="lbl">Padding (px)</span>
																	<span className="nexulesuite_lc-range-val">{ settings.chatPadding }</span>
																</div>
																<input type="range" min="4" max="40" value={ settings.chatPadding } onChange={ ( e ) => updateSetting( 'chatPadding', e.target.value ) } className="nexulesuite_lc-range" />
															</div>
															<div className="nexulesuite_lc-color-field">
																<span className="lbl">Button Text</span>
																<div className="cgroup">
																	<label className="cswatch" style={ { backgroundColor: settings.primaryBtnText } }>
																		<input type="color" value={ settings.primaryBtnText } onChange={ ( e ) => updateSetting( 'primaryBtnText', e.target.value ) } />
																	</label>
																	<input type="text" className="chex" value={ settings.primaryBtnText } onChange={ ( e ) => updateSetting( 'primaryBtnText', e.target.value ) } />
																</div>
															</div>
															<div className="nexulesuite_lc-color-field">
																<span className="lbl nexulesuite_lbl-tip">Online Blink Dot <InfoTip text={ 'Header status indicator shown next to the badge text.' } /></span>
																<div className="cgroup">
																	<label className="cswatch" style={ { backgroundColor: settings.chatBlinkDotColor } }>
																		<input type="color" value={ settings.chatBlinkDotColor } onChange={ ( e ) => updateSetting( 'chatBlinkDotColor', e.target.value ) } />
																	</label>
																	<input type="text" className="chex" value={ settings.chatBlinkDotColor } onChange={ ( e ) => updateSetting( 'chatBlinkDotColor', e.target.value ) } />
																</div>
															</div>
															<div className="nexulesuite_lc-range-field">
																<div className="nexulesuite_lc-range-head">
																	<span className="lbl">Radius (px)</span>
																	<span className="nexulesuite_lc-range-val">{ settings.chatBorderRadius }</span>
																</div>
																<input type="range" min="0" max="50" value={ settings.chatBorderRadius } onChange={ ( e ) => updateSetting( 'chatBorderRadius', e.target.value ) } className="nexulesuite_lc-range" />
															</div>
															<div className="nexulesuite_lc-field">
																<span className="lbl">Button Hover Effect</span>
																<select value={ settings.chatHoverEffect } onChange={ ( e ) => updateSetting( 'chatHoverEffect', e.target.value ) } className="sel">
																	<option value="none">None</option>
																	<option value="lift">Lift Up</option>
																	<option value="scale">Scale Pulse</option>
																	<option value="glow">Outer Glow</option>
																	<option value="shake">Wobble/Shake</option>
																	<option value="rotate">Slight Rotate</option>
																	<option value="darken">Color Shift</option>
																</select>
															</div>
														</div>
													</section>
												</div>
											</div>

											<aside className="nexulesuite_lc-preview">
												<div className="nexulesuite_lc-preview-head">
													<Eye size={ 14 } aria-hidden="true" />
													<span>Real-time Preview</span>
												</div>
												<div className={ `nexulesuite_lc-preview-stage${ settings.chatAlign === 'left' ? ' is-left' : ' is-right' }` }>
													<div
														className="nexulesuite_lc-preview-panel"
														style={ {
															fontFamily: settings.globalFont ? `'${ settings.globalFont }', sans-serif` : 'inherit',
														} }
													>
														<div className="nexulesuite_lc-preview-header">
															{ settings.chatButtonImage
																? <img src={ settings.chatButtonImage } className="nexulesuite_lc-preview-avatar" alt="Support" />
																: <div className="nexulesuite_lc-preview-avatar-fallback"><MessageCircle size={ 22 } /></div>
															}
															<div className="nexulesuite_lc-preview-meta">
																<h6>{ settings.chatTitle || 'Support Widget' }</h6>
																<span className="nexulesuite_lc-preview-badge">
																	<span className="nexulesuite_lc-preview-dot" style={ { backgroundColor: settings.chatBlinkDotColor || settings.primaryBtnText } } aria-hidden />
																	{ settings.chatBadge || 'Online' }
																</span>
															</div>
														</div>
														<div className="nexulesuite_lc-preview-body">{ settings.chatContent }</div>
														<div className="nexulesuite_lc-preview-actions">
															<button type="button" className={ `nexulesuite_lc-preview-btn is-full ${ getHoverClass( settings.chatHoverEffect ) }` } style={ { backgroundColor: settings.primaryBtnBg, color: settings.primaryBtnText, padding: `${ settings.chatPadding }px`, borderRadius: `${ settings.chatBorderRadius }px` } }>
																{ settings.chatFormButton || 'Start Conversation' }
															</button>
															<div className="nexulesuite_lc-preview-btn-row">
																<button type="button" className={ `nexulesuite_lc-preview-btn ${ getHoverClass( settings.chatHoverEffect ) }` } style={ { backgroundColor: settings.primaryBtnBg, color: settings.primaryBtnText, padding: `${ settings.chatPadding }px`, borderRadius: `${ settings.chatBorderRadius }px`, opacity: 0.9 } }>
																	{ settings.chatButtonTwo || "What's App" }
																</button>
																<button type="button" className={ `nexulesuite_lc-preview-btn ${ getHoverClass( settings.chatHoverEffect ) }` } style={ { backgroundColor: settings.primaryBtnBg, color: settings.primaryBtnText, padding: `${ settings.chatPadding }px`, borderRadius: `${ settings.chatBorderRadius }px`, opacity: 0.9 } }>
																	{ settings.chatButtonThird || 'E-mail' }
																</button>
															</div>
														</div>
													</div>
												</div>
											</aside>
										</div>
									</div>
								) }

								{/* ════════════════════════════════════════════
								    AI CHATBOT (RAG)
								════════════════════════════════════════════ */}
								{ activeTab === 'ai' && (
									<>
										<div className="mb-5 inline-flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
											{ [ { id: 'setup', label: 'Model & Knowledge' }, { id: 'faq', label: 'FAQ & Buttons' }, { id: 'autosetup', label: 'Auto-Setup' } ].map( ( st ) => (
												<button key={ st.id } type="button" onClick={ () => setAiSubTab( st.id ) } className={ `rounded-lg px-4 py-2 text-sm font-semibold transition ${ aiSubTab === st.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700' }` }>{ st.label }</button>
											) ) }
										</div>

										{ aiSubTab === 'setup' && (
									<div className="nexulesuite_settings-general-wrap">
										<div className="nexulesuite_sg-card">

											{/* ── Connection: a model vendor's API (default) or a self-hosted server ── */}
											<section className="nexulesuite_sg-section is-first">
												<div className="nexulesuite_sg-sec-head">
													<span className="nexulesuite_sg-sec-ico">
														<Bot size={ 16 } />
													</span>
													<div>
														<span className="nexulesuite_sg-sec-title nexulesuite_sg-title-tip">AI Connection <InfoTip text={ 'Choose which AI model answers your visitors. In Model API mode WordPress calls the provider directly — no server to run. Keys are encrypted at rest and never sent to the browser.' } /></span>
													</div>
												</div>

												<div className="nexulesuite_sg-field" style={ { marginBottom: '18px' } }>
													<div
														className={ `nexulesuite_smtp-htmltoggle${ settings.aiEnabled ? ' on' : '' }` }
														role="switch"
														aria-checked={ !! settings.aiEnabled }
														tabIndex={ 0 }
														onClick={ () => updateSetting( 'aiEnabled', ! settings.aiEnabled ) }
														onKeyDown={ ( e ) => {
															if ( e.key === ' ' || e.key === 'Enter' ) {
																e.preventDefault();
																updateSetting( 'aiEnabled', ! settings.aiEnabled );
															}
														} }
													>
														<span className="nexulesuite_smtp-htmltoggle-label">Enable AI chat mode in the Livechat widget</span>
														<span className={ `nexulesuite_sg-toggle${ settings.aiEnabled ? ' on' : '' }` }><span className="track"><span className="knob" /></span></span>
													</div>
												</div>

												{/* Mode picker */}
												<div className="grid gap-3 sm:grid-cols-2" style={ { marginBottom: '18px' } }>
													{ [
														{ id: 'direct', icon: <Bot size={ 16 } />, title: 'Model API', copy: 'Connect straight to OpenAI, Claude, Gemini, Groq and more with an API key. Nothing to host.' },
														{ id: 'server', icon: <Server size={ 16 } />, title: 'Self-hosted server', copy: 'Proxy through your own Nexus AI Server (FastAPI + Ollama) on a VPS or localhost.' },
													].map( ( m ) => {
														const active = ( settings.aiConnMode || 'direct' ) === m.id;
														return (
															<button
																key={ m.id }
																type="button"
																onClick={ () => updateSetting( 'aiConnMode', m.id ) }
																className={ `flex flex-col items-start gap-1 rounded-xl border px-4 py-3 text-left transition ${ active ? 'border-indigo-400 bg-indigo-50 ring-1 ring-indigo-300' : 'border-slate-200 bg-white hover:border-slate-300' }` }
															>
																<span className={ `flex items-center gap-2 text-[13px] font-bold ${ active ? 'text-indigo-700' : 'text-slate-700' }` }>
																	{ m.icon }{ m.title }
																	{ active ? <Check size={ 14 } className="ml-auto" /> : null }
																</span>
																<span className="text-[11.5px] font-medium leading-snug text-slate-500">{ m.copy }</span>
															</button>
														);
													} ) }
												</div>

												<div className="nexulesuite_sg-info-box" style={ { marginBottom: '18px' } }>
													<Info size={ 14 } className="nexulesuite_sg-info-ico" />
													<p>Test &amp; Train use your <strong>saved</strong> settings — click <strong>Save Configuration</strong> (bottom bar) after changing anything here, then Test.</p>
												</div>

												{ ( settings.aiConnMode || 'direct' ) === 'server' ? (
													<div className="nexulesuite_sg-grid-2">
														<div className="nexulesuite_sg-field">
															<span className="lbl nexulesuite_lbl-tip">Server URL <InfoTip text={ 'Base URL of your AI server, e.g. https://ai.your-domain.com — no trailing path.' } /></span>
															<input type="url" className="inp" value={ settings.aiServerUrl } onChange={ ( e ) => updateSetting( 'aiServerUrl', e.target.value ) } placeholder="https://ai.your-domain.com" autoComplete="off" spellCheck={ false } />
														</div>
														<div className="nexulesuite_sg-field">
															<span className="lbl">Server API Key</span>
															<input type="password" className="inp" value={ settings.aiApiKey } onChange={ ( e ) => updateSetting( 'aiApiKey', e.target.value ) } placeholder={ settings.hasAiKey ? '•••••••• saved — leave blank to keep' : 'Bearer API key (from your server .env)' } autoComplete="new-password" />
															<p className="hint">{ settings.hasAiKey ? 'A key is saved (encrypted). Leave blank to keep it, or type a new one to replace.' : 'Stored encrypted (AES-256-GCM) — never shown again after saving.' }</p>
														</div>
													</div>
												) : null }

												{/* Chat provider + model + key */}
												<div className="nexulesuite_sg-grid-2" style={ { marginTop: ( settings.aiConnMode || 'direct' ) === 'server' ? '18px' : 0 } }>
													<div className="nexulesuite_sg-field">
														<span className="lbl nexulesuite_lbl-tip">Chat provider <InfoTip text={ 'Which company’s model writes the replies. In self-hosted mode only the provider name is sent to your server — it resolves the endpoint itself.' } /></span>
														<select
															className="inp"
															value={ settings.aiLlmProvider }
															onChange={ ( e ) => {
																const id = e.target.value;
																setSettings( ( prev ) => ( {
																	...prev,
																	aiLlmProvider: id,
																	// Model ids are vendor-scoped — OpenAI's `gpt-4o-mini` is `openai/gpt-4o-mini` on OpenRouter.
																	aiLlmModel: aiProvider( prev, id )?.chatModel || '',
																	// The saved key belongs to the vendor being left behind; the server clears it on save.
																	aiLlmApiKey: '',
																} ) );
																setAiTestResult( null );
															} }
														>
															<option value="">
																{ ( settings.aiConnMode || 'direct' ) === 'direct' ? 'Select a provider…' : "Use the AI server's own setting" }
															</option>
															{ aiChatProviders( settings, settings.aiConnMode || 'direct' ).map( ( p ) => (
																<option key={ p.id } value={ p.id }>{ p.label }</option>
															) ) }
														</select>
													</div>

													<div className="nexulesuite_sg-field">
														<span className="lbl nexulesuite_lbl-tip">Model <InfoTip text={ 'Exact model id, e.g. gpt-4o-mini. Any id the provider accepts works — the list is only a shortcut.' } /></span>
														<input
															type="text"
															className="inp"
															list="nexulesuite_ai-model-suggestions"
															value={ settings.aiLlmModel }
															onChange={ ( e ) => updateSetting( 'aiLlmModel', e.target.value ) }
															placeholder={ aiProvider( settings, settings.aiLlmProvider )?.chatModel || 'gpt-4o-mini' }
															autoComplete="off"
															spellCheck={ false }
														/>
														<datalist id="nexulesuite_ai-model-suggestions">
															{ ( aiProvider( settings, settings.aiLlmProvider )?.chatModels || [] ).map( ( m ) => <option key={ m } value={ m } /> ) }
														</datalist>
													</div>
												</div>

												{ settings.aiLlmProvider && settings.aiLlmProvider !== 'ollama' ? (
													<div className="nexulesuite_sg-field" style={ { marginTop: '18px' } }>
														<span className="lbl">{ aiProviderLabel( settings, settings.aiLlmProvider ) } API Key</span>
														<input
															type="password"
															className="inp"
															value={ settings.aiLlmApiKey }
															onChange={ ( e ) => updateSetting( 'aiLlmApiKey', e.target.value ) }
															placeholder={ aiLlmKeySaved ? '•••••••• saved — leave blank to keep' : ( aiProvider( settings, settings.aiLlmProvider )?.keyHint || 'Provider API key' ) }
															autoComplete="new-password"
														/>
														<p className="hint">
															{ aiLlmKeySaved
																? 'A key is saved (encrypted). Leave blank to keep it, or type a new one to replace.'
																: `Paste your ${ aiProviderLabel( settings, settings.aiLlmProvider ) } key — each provider needs its own. Stored encrypted (AES-256-GCM), never sent to the browser.` }
															{ aiProvider( settings, settings.aiLlmProvider )?.keyUrl ? (
																<> Get one at <a href={ aiProvider( settings, settings.aiLlmProvider ).keyUrl } target="_blank" rel="noreferrer">{ aiProvider( settings, settings.aiLlmProvider ).keyUrl.replace( /^https:\/\//, '' ) }</a>.</>
															) : null }
														</p>
													</div>
												) : null }

												{ settings.aiLlmProvider && ! aiProvider( settings, settings.aiLlmProvider )?.vision && settings.aiAllowImages ? (
													<div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] font-semibold text-amber-800">
														<AlertTriangle size={ 16 } className="mt-0.5 shrink-0" />
														<span>{ aiProviderLabel( settings, settings.aiLlmProvider ) } cannot read images with this model. Visitors can still attach one, but the assistant will ask them to describe it instead.</span>
													</div>
												) : null }

												{ ( settings.aiConnMode || 'direct' ) === 'server' && settings.aiLlmProvider && settings.aiLlmProvider !== 'ollama' && /^http:\/\//i.test( settings.aiServerUrl || '' ) && ! /^http:\/\/(localhost|127\.0\.0\.1)/i.test( settings.aiServerUrl || '' ) ? (
													<div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] font-semibold text-amber-800">
														<AlertTriangle size={ 16 } className="mt-0.5 shrink-0" />
														<span>Your AI server URL is plain http:// — the provider key is sent to it on every message. Use https:// for a remote server.</span>
													</div>
												) : null }

												<button type="button" onClick={ handleAiTest } disabled={ aiTesting } className="nexulesuite_sg-btn nexulesuite_sg-btn-secondary" style={ { marginTop: '20px' } }>
													{ aiTesting ? <Loader2 size={ 14 } className="animate-spin" /> : <ShieldCheck size={ 14 } /> }
													{ aiTesting ? 'Testing…' : 'Test Connection' }
												</button>

												{ aiTestResult ? (
													<div className={ `mt-4 flex items-start gap-2 rounded-xl border px-4 py-3 text-[12px] font-semibold ${ aiTestResult.ok ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700' }` }>
														{ aiTestResult.ok ? <Check size={ 16 } className="mt-0.5 shrink-0" /> : <AlertTriangle size={ 16 } className="mt-0.5 shrink-0" /> }
														<span>{ aiTestResult.text }</span>
													</div>
												) : null }
											</section>

											{/* ── Knowledge base / training ── */}
											<section className="nexulesuite_sg-section">
												<div className="nexulesuite_sg-sec-head">
													<span className="nexulesuite_sg-sec-ico">
														<Database size={ 16 } />
													</span>
													<div>
														<span className="nexulesuite_sg-sec-title nexulesuite_sg-title-tip">Knowledge Base (Training) <InfoTip text={ 'Train Now chunks your published posts, pages and products, turns each chunk into a vector, and stores it so the chatbot can quote your real content.' } /></span>
													</div>
												</div>

												{ aiMode === 'direct' ? (
													<>
														<div className="nexulesuite_sg-grid-2" style={ { marginBottom: '18px' } }>
															<div className="nexulesuite_sg-field">
																<span className="lbl nexulesuite_lbl-tip">Embedding provider <InfoTip text={ 'Turns your content into vectors so the chatbot can find the right passage. OpenRouter, OpenAI, Gemini, Mistral and Voyage can all do this — leave it on “Same as chat provider” to reuse your chat key, so one key powers both. Claude and Groq have no embeddings API, so pair those with one of the above.' } /></span>
																<select
																	className="inp"
																	value={ settings.aiEmbedProvider }
																	onChange={ ( e ) => {
																		const id = e.target.value;
																		setSettings( ( prev ) => ( {
																			...prev,
																			aiEmbedProvider: id,
																			aiEmbedModel: aiProvider( prev, id )?.embedModel || '',
																			// Same vendor-scoping as the chat key: a switch invalidates what is stored.
																			aiEmbedApiKey: '',
																		} ) );
																		setAiTestResult( null );
																	} }
																>
																	<option value="">
																		{ aiActiveProvider?.embed
																			? `Same as chat provider (${ aiActiveProvider.label })`
																			: 'Select an embedding provider…' }
																	</option>
																	{ aiEmbedProviders( settings ).map( ( p ) => (
																		<option key={ p.id } value={ p.id }>{ p.label }</option>
																	) ) }
																</select>
															</div>

															<div className="nexulesuite_sg-field">
																<span className="lbl nexulesuite_lbl-tip">Embedding model <InfoTip text={ 'Leave blank for the provider default. Changing this changes the vector size, which invalidates everything already indexed — re-train after switching.' } /></span>
																<input
																	type="text"
																	className="inp"
																	list="nexulesuite_ai-embed-suggestions"
																	value={ settings.aiEmbedModel }
																	onChange={ ( e ) => updateSetting( 'aiEmbedModel', e.target.value ) }
																	placeholder={ aiEmbedDef?.embedModel || 'text-embedding-3-small' }
																	autoComplete="off"
																	spellCheck={ false }
																/>
																<datalist id="nexulesuite_ai-embed-suggestions">
																	{ ( aiEmbedDef?.embedModels || [] ).map( ( m ) => <option key={ m } value={ m } /> ) }
																</datalist>
															</div>
														</div>

														{ aiEmbedId && ! aiEmbedSharesChatKey ? (
															<div className="nexulesuite_sg-field" style={ { marginBottom: '18px' } }>
																<span className="lbl">{ aiProviderLabel( settings, aiEmbedId ) } API Key (embeddings)</span>
																<input
																	type="password"
																	className="inp"
																	value={ settings.aiEmbedApiKey }
																	onChange={ ( e ) => updateSetting( 'aiEmbedApiKey', e.target.value ) }
																	placeholder={ aiEmbedKeySaved ? '•••••••• saved — leave blank to keep' : ( aiEmbedDef?.keyHint || 'Embedding provider API key' ) }
																	autoComplete="new-password"
																/>
																<p className="hint">
																	{ aiEmbedKeySaved
																		? 'A key is saved (encrypted). Leave blank to keep it, or type a new one to replace.'
																		: 'Stored encrypted (AES-256-GCM), never sent to the browser.' }
																	{ aiEmbedDef?.keyUrl ? (
																		<> Get one at <a href={ aiEmbedDef.keyUrl } target="_blank" rel="noreferrer">{ aiEmbedDef.keyUrl.replace( /^https:\/\//, '' ) }</a>.</>
																	) : null }
																</p>
															</div>
														) : null }

														{ aiEmbedReady && aiEmbedSharesChatKey ? (
															<div className="mb-[18px] flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[12px] font-semibold text-emerald-800">
																<ShieldCheck size={ 16 } className="mt-0.5 shrink-0" />
																<span>One key covers everything — your { aiActiveProvider?.label } chat key also powers embeddings, so there’s nothing to add here. Just Save, then Train.</span>
															</div>
														) : null }

														{ ! aiEmbedReady ? (
															<div className="mb-[18px] flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] font-semibold text-amber-800">
																<AlertTriangle size={ 16 } className="mt-0.5 shrink-0" />
																<span>
																	{ ! aiEmbedId
																		? 'Pick an embedding provider, then Save. Without one the chatbot cannot search your pages and will answer from general knowledge only.'
																		: aiEmbedSharesChatKey
																			? `Add your ${ aiActiveProvider?.label || 'chat provider' } key in the Model API section above, then Save — the same key powers training.`
																			: 'Add the embedding provider’s API key, then Save — until then the chatbot answers without knowing your site content.' }
																</span>
															</div>
														) : null }

														<div className="mb-[18px] flex flex-wrap items-center gap-x-5 gap-y-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[12px] font-semibold text-slate-600">
															<span className="flex items-center gap-1.5"><Database size={ 13 } />Indexed now:</span>
															<span>{ settings.aiIndex?.documents || 0 } document(s)</span>
															<span>{ settings.aiIndex?.chunks || 0 } chunk(s)</span>
															{ settings.aiIndex?.dims ? <span>{ settings.aiIndex.dims }-dimension vectors</span> : null }
														</div>
													</>
												) : null }

												<div className="nexulesuite_sg-field">
													<span className="lbl">Extra notes / Q&amp;A (optional)</span>
													<textarea className="inp" rows={ 5 } value={ settings.aiManualQa } onChange={ ( e ) => updateSetting( 'aiManualQa', e.target.value ) } placeholder={ 'Add facts the chatbot should always know, e.g.\nQ: What is your refund policy?\nA: 30-day money-back guarantee on annual plans.' } />
													<p className="hint">Included in training alongside your posts &amp; pages. Save first, then Train.</p>
												</div>

												<div className="flex flex-wrap gap-3" style={ { marginTop: '20px' } }>
													<button type="button" onClick={ handleAiTrain } disabled={ aiTraining || aiResetting } className="nexulesuite_sg-btn nexulesuite_sg-btn-primary">
														{ aiTraining ? <Loader2 size={ 14 } className="animate-spin" /> : <RefreshCw size={ 14 } /> }
														{ aiTraining ? 'Training…' : 'Train Now' }
													</button>
													<button type="button" onClick={ handleAiReset } disabled={ aiTraining || aiResetting } className="nexulesuite_sg-btn nexulesuite_sg-btn-secondary">
														{ aiResetting ? <Loader2 size={ 14 } className="animate-spin" /> : <Trash2 size={ 14 } /> }
														{ aiResetting ? 'Clearing…' : 'Clear Memory' }
													</button>
												</div>

												{ aiTrainResult ? (
													<div className={ `mt-4 flex items-start gap-2 rounded-xl border px-4 py-3 text-[12px] font-semibold ${ aiTrainResult.ok ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700' }` }>
														{ aiTrainResult.ok ? <Check size={ 16 } className="mt-0.5 shrink-0" /> : <AlertTriangle size={ 16 } className="mt-0.5 shrink-0" /> }
														<span>{ aiTrainResult.text }</span>
													</div>
												) : null }
											</section>

											{/* ── Assistant behaviour ── */}
											<section className="nexulesuite_sg-section">
												<div className="nexulesuite_sg-sec-head">
													<span className="nexulesuite_sg-sec-ico">
														<Wand2 size={ 16 } />
													</span>
													<div>
														<span className="nexulesuite_sg-sec-title nexulesuite_sg-title-tip">Assistant Behavior <InfoTip text={ 'Controls how the assistant greets visitors and answers. Leave the system prompt blank to use a safe default that answers only from your content.' } /></span>
													</div>
												</div>

												<div className="nexulesuite_sg-field">
													<span className="lbl">Welcome message</span>
													<input type="text" className="inp" value={ settings.aiWelcomeMessage } onChange={ ( e ) => updateSetting( 'aiWelcomeMessage', e.target.value ) } placeholder="Hi! Ask me anything about our site." />
												</div>

												<div className="nexulesuite_sg-field" style={ { marginTop: '18px' } }>
													<span className="lbl nexulesuite_lbl-tip">Input placeholder <InfoTip text={ 'The hint text shown inside the chat message box. Leave blank for the default "Write a message…".' } /></span>
													<input type="text" className="inp" maxLength={ 120 } value={ settings.aiInputPlaceholder || '' } onChange={ ( e ) => updateSetting( 'aiInputPlaceholder', e.target.value ) } placeholder="Write a message…" />
												</div>

												<div className="nexulesuite_sg-field" style={ { marginTop: '18px' } }>
													<span className="lbl nexulesuite_lbl-tip">System prompt <InfoTip text={ 'The instruction the model follows. Keep the "answer only from context" rule to reduce made-up answers.' } /></span>
													<textarea className="inp" rows={ 4 } value={ settings.aiSystemPrompt } onChange={ ( e ) => updateSetting( 'aiSystemPrompt', e.target.value ) } placeholder={ 'You are the support assistant for our website. Answer ONLY from the provided context; if unknown, say so and offer a human.' } />
												</div>

												<div className="nexulesuite_sg-grid-2" style={ { marginTop: '18px' } }>
													{ aiMode === 'server' ? (
														<div className="nexulesuite_sg-field">
															<span className="lbl nexulesuite_lbl-tip">Ollama model override <InfoTip text={ 'Optional. Only used when your AI server falls back to Ollama. Must be pulled on that server.' } /></span>
															<input type="text" className="inp" value={ settings.aiChatModel } onChange={ ( e ) => updateSetting( 'aiChatModel', e.target.value ) } placeholder="llama3.1:8b (default)" autoComplete="off" spellCheck={ false } />
														</div>
													) : null }
													<div className="nexulesuite_sg-field">
														<span className="lbl nexulesuite_lbl-tip">Context snippets <InfoTip text={ 'How many of the most relevant chunks to feed the model per question (1–10). More = richer context but slower.' } /></span>
														<input type="number" className="inp" min={ 1 } max={ 10 } value={ settings.aiMaxChunks } onChange={ ( e ) => updateSetting( 'aiMaxChunks', e.target.value ) } />
													</div>
												</div>
											</section>

											{/* ── Image understanding (vision) ── */}
											<section className="nexulesuite_sg-section">
												<div className="nexulesuite_sg-sec-head">
													<span className="nexulesuite_sg-sec-ico">
														<ImageIcon size={ 16 } />
													</span>
													<div>
														<span className="nexulesuite_sg-sec-title nexulesuite_sg-title-tip">Attachments (Vision &amp; Documents) <InfoTip text={ 'Let visitors attach an image, screenshot, or document (PDF, TXT, MD, CSV, HTML, JSON). Images go to the vision model — in Model API mode the chat model reads them directly, no extra setup. Document text is extracted on your server, so it works with any provider. Scanned PDFs hold no text; attach them as an image instead.' } /></span>
													</div>
												</div>

												<div className="nexulesuite_sg-field" style={ { marginBottom: '18px' } }>
													<div
														className={ `nexulesuite_smtp-htmltoggle${ settings.aiAllowImages ? ' on' : '' }` }
														role="switch"
														aria-checked={ !! settings.aiAllowImages }
														tabIndex={ 0 }
														onClick={ () => updateSetting( 'aiAllowImages', ! settings.aiAllowImages ) }
														onKeyDown={ ( e ) => {
															if ( e.key === ' ' || e.key === 'Enter' ) {
																e.preventDefault();
																updateSetting( 'aiAllowImages', ! settings.aiAllowImages );
															}
														} }
													>
														<span className="nexulesuite_smtp-htmltoggle-label">Allow visitors to attach images and documents</span>
														<span className={ `nexulesuite_sg-toggle${ settings.aiAllowImages ? ' on' : '' }` }><span className="track"><span className="knob" /></span></span>
													</div>
												</div>

												{ aiMode === 'server' ? (
													<>
														<div className="nexulesuite_sg-grid-2">
															<div className="nexulesuite_sg-field">
																<span className="lbl nexulesuite_lbl-tip">Vision model <InfoTip text={ 'The Ollama model used to read attached images (e.g. llava, llava:13b, bakllava). Must be pulled on your server.' } /></span>
																<input type="text" className="inp" value={ settings.aiVisionModel } onChange={ ( e ) => updateSetting( 'aiVisionModel', e.target.value ) } placeholder="llava" autoComplete="off" spellCheck={ false } />
															</div>
														</div>

														<div className="nexulesuite_sg-info-box" style={ { marginTop: '16px' } }>
															<Info size={ 14 } className="nexulesuite_sg-info-ico" />
															<p>On your VPS run <code>ollama pull llava</code> first. Image analysis is slower &amp; uses more memory than text.</p>
														</div>
													</>
												) : (
													<div className="nexulesuite_sg-info-box" style={ { marginTop: '16px' } }>
														<Info size={ 14 } className="nexulesuite_sg-info-ico" />
														<p>
															{ aiActiveProvider?.vision
																? <>Images go straight to <strong>{ aiActiveProvider.label }</strong> with the question — nothing else to configure. Image turns cost more tokens than text.</>
																: <>Pick a provider that supports images (OpenAI, Claude, Gemini, Mistral, OpenRouter or xAI) to enable this. Other providers will ask the visitor to describe the image instead.</> }
														</p>
													</div>
												) }
											</section>

										</div>
									</div>
										) }
										{ aiSubTab === 'faq' && <FaqTab /> }
										{ aiSubTab === 'autosetup' && <AutoSetupTab /> }
									</>
								) }

								{ activeTab === 'smtp' && (
									<div className="nexulesuite_settings-general-wrap nexulesuite_smtp-wrap">
										<div className="nexulesuite_sg-card">
											<section className="nexulesuite_sg-section is-first">
												<div className="nexulesuite_sg-sec-head">
													<span className="nexulesuite_sg-sec-ico">
														<Mail size={ 16 } />
													</span>
													<div>
														<span className="nexulesuite_sg-sec-title nexulesuite_sg-title-tip">Mail <InfoTip text={ 'The From address & name applied to every email this website sends (forms, reports & all WordPress mail).' } /></span>
													</div>
												</div>
												<div className="nexulesuite_sg-grid-2">
													<div className="nexulesuite_sg-field">
														<span className="lbl nexulesuite_lbl-tip">From Email <InfoTip text={ 'Use an address on your sending domain — providers reject mismatched From addresses.' } /></span>
														<input type="email" className="inp" value={ smtp.from_email } onChange={ ( e ) => updateSmtp( 'from_email', e.target.value ) } placeholder="no-reply@example.com" autoComplete="off" spellCheck={ false } />
													</div>
													<div className="nexulesuite_sg-field">
														<span className="lbl">From Name</span>
														<input type="text" className="inp" value={ smtp.from_name } onChange={ ( e ) => updateSmtp( 'from_name', e.target.value ) } placeholder={ window?.nexulesuite_Admin?.siteTitle || 'Your site name' } />
														<label className="mt-2 flex cursor-pointer items-center gap-2 text-[11px] font-semibold text-slate-500">
															<input type="checkbox" className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" checked={ !! smtp.force_from_name } onChange={ ( e ) => updateSmtp( 'force_from_name', e.target.checked ) } />
															Force From Name — override the name set by other plugins
														</label>
													</div>
												</div>
											</section>

											<section className="nexulesuite_sg-section">
												<div className="nexulesuite_sg-sec-head">
													<span className="nexulesuite_sg-sec-ico">
														<Server size={ 16 } />
													</span>
													<div>
														<span className="nexulesuite_sg-sec-title nexulesuite_sg-title-tip">Mailer <InfoTip text={ 'Choose how email is delivered. Selecting a provider routes all site mail through it.' } /></span>
													</div>
												</div>
												<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
													{ SMTP_MAILERS.map( ( m ) => {
														const selected = smtpCurrentMailer === m.id;
														return (
															<button
																key={ m.id }
																type="button"
																onClick={ () => selectSmtpMailer( m.id ) }
																className={ `flex flex-col items-start gap-1.5 rounded-2xl border-2 p-5 text-left transition-all ${ selected ? 'border-blue-500 bg-blue-50/60 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300' }` }
																aria-pressed={ selected }
															>
																<span className={ `flex h-9 w-9 items-center justify-center rounded-lg border ${ SMTP_MAILER_ACCENTS[ m.accent ] }` }>
																	{ m.id === 'gmail' || m.id === 'outlook' ? <Mail size={ 16 } /> : <Server size={ 16 } /> }
																</span>
																<span className="mt-1 text-[13px] font-bold text-slate-800">{ m.name }</span>
																<span className="text-[10px] leading-tight text-slate-400">{ m.tagline }</span>
															</button>
														);
													} ) }
												</div>
											</section>

											{ smtpCurrentMailer === 'default' ? (
												<section className="nexulesuite_sg-section">
													<div className="nexulesuite_sg-info-box">
														<Info size={ 14 } className="nexulesuite_sg-info-ico" />
														<p>WordPress will keep using the default PHP <code>mail()</code> function. Choose a mailer above to deliver email reliably through your own provider.</p>
													</div>
												</section>
											) : (
												<section className="nexulesuite_sg-section">
													<div className="nexulesuite_sg-sec-head">
														<span className="nexulesuite_sg-sec-ico">
															<Lock size={ 16 } />
														</span>
														<div>
															<span className="nexulesuite_sg-sec-title nexulesuite_sg-title-tip">
																{ ( SMTP_MAILERS.find( ( m ) => m.id === smtpCurrentMailer )?.name || 'SMTP' ) } Settings
																<InfoTip text={ smtpCurrentMailer === 'gmail'
																	? 'OAuth 2.0 — no password stored. Host auto-set to smtp.gmail.com:465 (SSL). Client secret & OAuth tokens are encrypted at rest and never sent to the browser.'
																	: smtpCurrentMailer === 'outlook'
																		? 'OAuth 2.0 — no password stored. Host auto-set to smtp.office365.com:587 (TLS). Client secret & OAuth tokens are encrypted at rest and never sent to the browser.'
																		: 'Enter the SMTP host, port & credentials from your provider. Passwords are encrypted at rest; you can also define nexulesuite_SMTP_PASS in wp-config.php to keep them out of the database.' } />
															</span>
														</div>
													</div>

													{ smtpCurrentMailer === 'other' ? (
														<div className="nexulesuite_sg-grid-2">
															<div className="nexulesuite_sg-field">
																<span className="lbl">SMTP Host</span>
																<input type="text" className="inp" value={ smtp.host } onChange={ ( e ) => updateSmtp( 'host', e.target.value ) } placeholder="smtp.example.com" autoComplete="off" spellCheck={ false } />
															</div>
															<div className="nexulesuite_sg-field">
																<span className="lbl">Port</span>
																<input type="number" className="inp" value={ smtp.port } onChange={ ( e ) => updateSmtp( 'port', e.target.value ) } placeholder="587" />
															</div>
															<div className="nexulesuite_sg-field">
																<span className="lbl">Encryption</span>
																<select className="sel" value={ smtp.secure } onChange={ ( e ) => updateSmtp( 'secure', e.target.value ) }>
																	<option value="tls">TLS — recommended (port 587)</option>
																	<option value="ssl">SSL (port 465)</option>
																	<option value="">None</option>
																</select>
															</div>
															<div className="nexulesuite_sg-field">
																<span className="lbl">SMTP Username</span>
																<input type="text" className="inp" value={ smtp.username } onChange={ ( e ) => updateSmtp( 'username', e.target.value ) } placeholder="you@example.com" autoComplete="off" spellCheck={ false } />
															</div>
															<div className="nexulesuite_sg-field">
																<span className="lbl">SMTP Password</span>
																<input type="password" className="inp" value={ smtp.password } onChange={ ( e ) => updateSmtp( 'password', e.target.value ) } placeholder={ smtpHasPassword ? '•••••••• saved — leave blank to keep' : 'SMTP password' } autoComplete="new-password" />
																<p className="hint">
																	{ smtpHasPassword
																		? 'A password is already saved (encrypted). Leave blank to keep it, or type a new one to replace.'
																		: 'Stored encrypted (AES-256-GCM) — never shown again after saving.' }
																</p>
															</div>
														</div>
													) : (
														<>
															<div className="nexulesuite_sg-grid-2">
																<div className="nexulesuite_sg-field">
																	<span className="lbl">Client ID</span>
																	<input type="text" className="inp" value={ smtp.oauth_client_id } onChange={ ( e ) => updateSmtp( 'oauth_client_id', e.target.value ) } placeholder={ smtpCurrentMailer === 'gmail' ? 'xxxx.apps.googleusercontent.com' : 'Application (client) ID' } autoComplete="off" spellCheck={ false } />
																</div>
																<div className="nexulesuite_sg-field">
																	<span className="lbl">Client Secret</span>
																	<input type="password" className="inp" value={ smtp.oauth_client_secret } onChange={ ( e ) => updateSmtp( 'oauth_client_secret', e.target.value ) } placeholder={ smtpMeta.hasClientSecret ? '•••••••• saved — leave blank to keep' : 'Client secret' } autoComplete="new-password" />
																	<p className="hint">Leave blank to keep the saved one.</p>
																</div>
															</div>

															<div className="nexulesuite_sg-field" style={ { marginTop: '22px' } }>
																<span className="lbl nexulesuite_lbl-tip">Authorized Redirect URI <InfoTip text={ smtpCurrentMailer === 'gmail' ? 'Add this exact URL to your Google Cloud Console OAuth client as an authorized redirect URI.' : 'Add this exact URL to your Microsoft Entra app as an authorized redirect URI.' } /></span>
																<div className="nexulesuite_sg-link-box">
																	<span className="nexulesuite_sg-link-ico" aria-hidden="true"><LinkIcon size={ 16 } /></span>
																	<div className="nexulesuite_sg-link-inner">
																		<input readOnly value={ smtpMeta.redirect_uri } className="nexulesuite_sg-link-inp" onFocus={ ( e ) => e.target.select() } />
																		<button type="button" onClick={ copyRedirectUri } className="nexulesuite_sg-link-copy" aria-label="Copy redirect URI">
																			{ redirectCopied ? <Check size={ 16 } className="is-copied" /> : <Copy size={ 16 } /> }
																		</button>
																	</div>
																</div>
															</div>

															<div style={ { marginTop: '24px' } }>
																{ smtpMeta.connected ? (
																	<div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
																		<span className="flex items-center gap-2 text-[12px] font-semibold text-emerald-700">
																			<Check size={ 16 } /> Connected as { smtpMeta.oauth_email || 'your account' }
																		</span>
																		<a href={ smtpMeta.disconnect_url || '#' } className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-[11px] font-bold text-rose-600 transition-colors hover:bg-rose-50">Disconnect</a>
																	</div>
																) : (
																	<div className="flex flex-col gap-2">
																		<a
																			href={ ( smtpMeta.authorize_urls && smtpMeta.authorize_urls[ smtpCurrentMailer ] ) || '#' }
																			className="nexulesuite_sg-btn nexulesuite_sg-btn-primary"
																			style={ { alignSelf: 'flex-start' } }
																		>
																			<ShieldCheck size={ 14 } /> Authorize with { smtpCurrentMailer === 'gmail' ? 'Google' : 'Microsoft' }
																		</a>
																		<p className="hint">Save your Client ID &amp; Secret first, then Authorize.</p>
																	</div>
																) }
															</div>
														</>
													) }

												</section>
											) }

											<section className="nexulesuite_sg-section">
												<div className="nexulesuite_sg-sec-head">
													<span className="nexulesuite_sg-sec-ico">
														<Send size={ 16 } />
													</span>
													<div>
														<span className="nexulesuite_sg-sec-title nexulesuite_sg-title-tip">Send a Test Email <InfoTip text={ 'Sends a real message using the settings above — the result shown is the actual send outcome, not a demo.' } /></span>
													</div>
												</div>

												{ ! smtp.enabled ? (
													<div className="nexulesuite_sg-info-box" style={ { marginBottom: '20px' } }>
														<Info size={ 14 } className="nexulesuite_sg-info-ico" />
														<p>SMTP is currently <strong>off</strong> — this test uses the default WordPress <code>mail()</code>. Select and connect a mailer above to test your provider.</p>
													</div>
												) : null }

												<div className="nexulesuite_sg-grid-2">
													<div className="nexulesuite_sg-field">
														<span className="lbl">Send To</span>
														<input type="email" className="inp" value={ smtpTestEmail } onChange={ ( e ) => setSmtpTestEmail( e.target.value ) } placeholder="you@example.com" autoComplete="off" spellCheck={ false } />
													</div>
													<div className="nexulesuite_sg-field">
														<span className="lbl">Format</span>
														<div
															className={ `nexulesuite_smtp-htmltoggle${ smtpTestHtml ? ' on' : '' }` }
															role="switch"
															aria-checked={ smtpTestHtml }
															tabIndex={ 0 }
															onClick={ () => setSmtpTestHtml( ( v ) => ! v ) }
															onKeyDown={ ( e ) => {
																if ( e.key === ' ' || e.key === 'Enter' ) {
																	e.preventDefault();
																	setSmtpTestHtml( ( v ) => ! v );
																}
															} }
														>
															<span className="nexulesuite_smtp-htmltoggle-label">Send as HTML</span>
															<span className={ `nexulesuite_sg-toggle${ smtpTestHtml ? ' on' : '' }` }><span className="track"><span className="knob" /></span></span>
														</div>
													</div>
												</div>

												<button
													type="button"
													onClick={ handleTestSmtp }
													disabled={ smtpTesting }
													className="nexulesuite_sg-btn nexulesuite_sg-btn-secondary"
													style={ { marginTop: '20px' } }
												>
													{ smtpTesting ? <Loader2 size={ 14 } className="animate-spin" /> : <Send size={ 14 } /> }
													{ smtpTesting ? 'Sending…' : 'Send Test Email' }
												</button>

												{ smtpTestResult ? (
													<div
														className={ `mt-4 flex items-start gap-2 rounded-xl border px-4 py-3 text-[12px] font-semibold ${ smtpTestResult.ok ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700' }` }
													>
														{ smtpTestResult.ok ? <Check size={ 16 } className="mt-0.5 shrink-0" /> : <AlertTriangle size={ 16 } className="mt-0.5 shrink-0" /> }
														<span>{ smtpTestResult.text }</span>
													</div>
												) : null }
											</section>
										</div>
									</div>
								) }



								{/* ════════════════════════════════════════════
								    EXPORT SETTINGS
								════════════════════════════════════════════ */}
								{ activeTab === 'backup' && (
									<div className="flex flex-col gap-6">
										<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
											<div className="p-8 bg-white border border-slate-200 rounded-[2.5rem] space-y-5">
												<div className="flex items-center gap-3">
													<div className="p-2.5 bg-green-50 text-green-600 rounded-2xl"><Download size={ 20 } /></div>
													<div>
														<h4 className="text-sm font-bold text-slate-800 capitalize leading-none">Export full backup</h4>
														<p className="text-[10px] text-slate-400 font-medium mt-0.5">Settings, forms, popups, emails, nav, analytics &amp; uploads — one JSON file.</p>
													</div>
												</div>
												<button
													type="button"
													onClick={ () => {
														const data = { version: pluginVersion, settings };
														const blob = new Blob( [ JSON.stringify( data, null, 2 ) ], { type: 'application/json' } );
														const url = URL.createObjectURL( blob );
														const a = document.createElement( 'a' );
														a.href = url;
														a.download = 'nexus-settings-export.json';
														a.click();
														URL.revokeObjectURL( url );
													} }
													className="w-full flex items-center justify-center gap-2 py-4 bg-green-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all hover:bg-green-500"
												>
													<Download size={ 16 } /> Export Settings JSON
												</button>
											</div>

											<div className="p-8 bg-white border border-slate-200 rounded-[2.5rem] space-y-5">
												<div className="flex items-center gap-3">
													<div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl"><Upload size={ 20 } /></div>
													<div>
														<h4 className="text-sm font-bold text-slate-800 capitalize leading-none">Import full backup</h4>
														<p className="text-[10px] text-slate-400 font-medium mt-0.5">Upload a full export (.json). Replaces all plugin data — no Save step.</p>
													</div>
												</div>
												<label className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all hover:bg-blue-500 cursor-pointer">
													<Upload size={ 16 } /> Import Settings JSON
													<input
														type="file"
														accept=".json"
														className="hidden"
														onChange={ ( e ) => {
															const file = e.target.files[ 0 ];
															if ( ! file ) return;
															const reader = new FileReader();
															reader.onload = ( ev ) => {
																try {
																	const data = JSON.parse( ev.target.result );
																	if ( data.settings ) setSettings( ( prev ) => ( { ...prev, ...data.settings, ...normalizeExclusionFields( data.settings ) } ) );
																	showNotice( 'success', 'Settings imported. Click "Save Configuration" to apply.' );
																} catch ( _err ) {
																	showNotice( 'error', 'Invalid JSON file.' );
																}
															};
															reader.readAsText( file );
															e.target.value = '';
														} }
													/>
												</label>
											</div>
										</div>

										<div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4 items-start shadow-sm">
											<div className="bg-amber-500 p-2 rounded-lg text-white shrink-0 shadow-lg shadow-amber-200"><AlertTriangle size={ 18 } /></div>
											<div className="space-y-1">
												<h6 className="text-xs font-bold text-amber-900 capitalize leading-tight">Important Notice</h6>
												<p className="text-[10px] text-amber-700/80 leading-relaxed font-medium">
													Importing a settings file will overwrite your current configuration. Always export a backup before importing.
												</p>
											</div>
										</div>
									</div>
								) }
							</>
						) }
					</div>
				</div>
			</div>
		</PageShell>
	);
}
