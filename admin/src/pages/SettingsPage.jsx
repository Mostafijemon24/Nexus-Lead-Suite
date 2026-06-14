import React, { useState, useEffect, useRef } from 'react';
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
} from 'lucide-react';

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

/* ─────────────────────────────────────────────────────────────
   Defaults & API helpers
───────────────────────────────────────────────────────────── */
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
	autoPopupFormIds: [],
};

function newAutoPopupFormRow() {
	const rk =
		typeof window !== 'undefined' && window.crypto?.randomUUID
			? window.crypto.randomUUID()
			: `apf-${ Date.now() }-${ Math.floor( Math.random() * 1e6 ) }`;
	return { rowKey: rk, formId: '' };
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
		const base = window?.nexusLsAdmin?.restUrl || '';
		const nonce = window?.nexusLsAdmin?.nonce || '';
		const res = await fetch( `${ base }nexus-lead-suite/v1${ path }`, {
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
	const base = window?.nexusLsAdmin?.restUrl || '';
	const nonce = window?.nexusLsAdmin?.nonce || '';
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
	<div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm transition-all h-[90px]">
		<div className="flex items-center gap-3">
			{ Icon && (
				<div className={ `p-2 rounded-lg ${ enabled ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400' }` }>
					<Icon size={ 18 } />
				</div>
			) }
			<div className="flex flex-col">
				<h5 className="text-sm font-bold text-slate-800 capitalize leading-none">{ label }</h5>
				{ desc && <p className="text-[10px] text-slate-400 font-medium capitalize mt-1">{ desc }</p> }
			</div>
		</div>
		<button
			type="button"
			onClick={ onClick }
			className={ `w-12 h-6 rounded-full transition-colors duration-300 relative shrink-0 focus:outline-none ${ enabled ? 'bg-blue-600' : 'bg-slate-300' }` }
		>
			<div className={ `absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-sm ${ enabled ? 'translate-x-7' : 'translate-x-1' }` }></div>
		</button>
	</div>
);

/* ─────────────────────────────────────────────────────────────
   Main component
───────────────────────────────────────────────────────── */
export function SettingsPage() {
	const [ activeTab, setActiveTab ] = useState( 'general' );
	const [ generatedLink, setGeneratedLink ] = useState( '' );
	const [ copySuccess, setCopySuccess ] = useState( false );
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
				const [ gResult, tResult, postsRaw, pagesRaw, popupsResult, formsResult ] = await Promise.allSettled( [
					apiFetch( '/settings/general', { method: 'GET' } ),
					apiFetch( '/emails/templates', { method: 'GET' } ),
					wpFetch( 'wp/v2/posts?per_page=50&_fields=id,title' ),
					wpFetch( 'wp/v2/pages?per_page=50&_fields=id,title' ),
					apiFetch( '/popups', { method: 'GET' } ),
					apiFetch( '/forms', { method: 'GET' } ),
				] );

				if ( gResult.status === 'fulfilled' && gResult.value.res.ok && gResult.value.json?.success ) {
					const srvSettings = gResult.value.json?.data?.settings || {};
					setSettings( ( prev ) => ( { ...prev, ...srvSettings } ) );
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
				setSettings( ( prev ) => ( { ...prev, ...saved } ) );
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

			const base = ( window?.nexusLsAdmin?.restUrl || '' ).replace( /\/?$/, '' );
			const fd = new FormData();
			fd.append( 'file', uploadFile );

			const res = await fetch( `${ base }/nexus-lead-suite/v1/settings/upload-chat-image`, {
				method: 'POST',
				credentials: 'same-origin',
				headers: { 'X-WP-Nonce': window?.nexusLsAdmin?.nonce || '' },
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

			const base = ( window?.nexusLsAdmin?.restUrl || '' ).replace( /\/?$/, '' );
			const fd = new FormData();
			fd.append( 'file', uploadFile );

			const res = await fetch( `${ base }/nexus-lead-suite/v1/settings/upload-report-logo`, {
				method: 'POST',
				credentials: 'same-origin',
				headers: { 'X-WP-Nonce': window?.nexusLsAdmin?.nonce || '' },
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

	const handleGenerateLink = async ( e ) => {
		if ( e ) e.preventDefault();
		try {
			const ttl = parseInt( String( settings.tokenTTL || '5' ), 10 );
			const { res, json } = await apiFetch( '/settings/generate-client-access-link', {
				method: 'POST',
				body: JSON.stringify( { tokenTTL: Number.isFinite( ttl ) ? ttl : 5 } ),
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
			if ( url ) {
				showNotice( 'success', 'Access link generated. Open it before it expires (TTL).' );
			}
		} catch ( err ) {
			showNotice( 'error', err?.message || 'Could not generate link.' );
		}
	};

	const copyToClipboard = () => {
		if ( ! generatedLink ) return;
		navigator.clipboard.writeText( generatedLink );
		setCopySuccess( true );
		setTimeout( () => setCopySuccess( false ), 2000 );
	};

	const toggleExclusion = ( field, item ) => {
		const list = settings[ field ];
		const exists = list.find( ( i ) => i.id === item.id );
		updateSetting( field, exists ? list.filter( ( i ) => i.id !== item.id ) : [ ...list, item ] );
	};

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

	const TABS = [
		{ id: 'general', label: 'General & Navigation', icon: Layout },
		{ id: 'popup', label: 'Auto PopUp Logic', icon: Zap },
		{ id: 'chat', label: 'Livechat & Styling', icon: MessageCircle },
		{ id: 'backup', label: 'Export Settings', icon: Database },
	];

	return (
		<PageShell
			title="Settings"
			subtitle="Global configuration & automation logic"
			icon={ <Settings size={ 18 } /> }
			footer={
				[ 'general', 'popup', 'chat', 'backup' ].includes( activeTab ) ? (
					<AdminStickyFooter
						actions={
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
									className="flex items-center gap-3 rounded-xl bg-[#2563EB] px-10 py-3 text-xs font-black text-white shadow-xl transition-all duration-200 hover:bg-blue-600 active:scale-95 disabled:opacity-60"
								>
									<Save size={ 16 } />{ saving ? 'Saving...' : 'Save Configuration' }
								</button>
							</>
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
							<Server size={ 12 } className="text-blue-500" /> Ver 1.0.0 Nexus
						</div>
						<div className="flex items-center gap-2 px-3 py-1.5">
							<CircleDot size={ 12 } className="text-green-500 animate-pulse" /> System Active
						</div>
					</div>

				<div className="bg-white rounded-[2rem] md:rounded-[1rem] border border-slate-200 shadow-sm flex flex-col overflow-hidden">

					{/* ── Tabs ── */}
					<div className="flex flex-wrap border-b border-slate-100 p-2 bg-slate-50/50 gap-1 md:gap-2">
						{ TABS.map( ( tab ) => (
							<button
								key={ tab.id }
								onClick={ () => setActiveTab( tab.id ) }
								className={ `flex items-center gap-2 px-4 md:px-6 py-3 rounded-xl md:rounded-2xl text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all duration-200 ${ activeTab === tab.id ? 'bg-white shadow-md text-blue-600' : 'text-slate-400 hover:text-slate-600' }` }
							>
								<tab.icon size={ 14 } />{ tab.label }
							</button>
						) ) }
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
									<div className="nls-settings-general-wrap">
										<div className="nls-sg-card">
											<section className="nls-sg-section is-first">
												<div className="nls-sg-sec-head">
													<span className="nls-sg-sec-ico">
														<Layout size={ 16 } />
													</span>
													<div>
														<span className="nls-sg-sec-title">Navigation &amp; Email</span>
														<p className="nls-sg-sec-desc">Footer menu behaviour and activity notification routing.</p>
													</div>
												</div>
												<div className="nls-sg-grid-2">
													<div className="nls-sg-stack">
														<div className="nls-sg-toggle-card">
															<div className="nls-sg-toggle-card-body">
																<span className="nls-sg-toggle-card-title">Enable Navigation</span>
																<p className="hint">Footer navigation menu auto-stack</p>
															</div>
															<div
																className={ `nls-sg-toggle${ settings.enableNavigation ? ' on' : '' }` }
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
														<div className="nls-sg-select-card">
															<span className="lbl">Events Email Template</span>
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
													<div className="nls-sg-stack">
														<div className="nls-sg-toggle-card">
															<div className="nls-sg-toggle-card-body">
																<span className="nls-sg-toggle-card-title">Allow Client Access</span>
																<p className="hint">Temporary reporting access</p>
															</div>
															<div
																className={ `nls-sg-toggle${ settings.allowClientAccess ? ' on' : '' }` }
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
														<div className={ `nls-sg-client-panel${ ! settings.allowClientAccess ? ' is-disabled' : '' }` }>
															<div className="nls-sg-field">
																<span className="lbl">Report URL slug</span>
																<input
																	type="text"
																	className="inp"
																	value={ settings.clientAccessSlug }
																	onChange={ ( e ) => updateSetting( 'clientAccessSlug', e.target.value ) }
																	placeholder="report-access"
																/>
																<p className="hint">
																	Pretty URL path (save settings, then generate link). Plain permalinks use a query-string URL automatically.
																</p>
															</div>
															<div className="nls-sg-field">
																<span className="lbl">Token TTL (Minutes)</span>
																<input
																	type="number"
																	className="inp"
																	value={ settings.tokenTTL }
																	onChange={ ( e ) => updateSetting( 'tokenTTL', e.target.value ) }
																/>
															</div>
															<button
																type="button"
																onClick={ handleGenerateLink }
																className="nls-sg-btn nls-sg-btn-primary"
															>
																<Wand2 size={ 14 } /> Generate Dynamic Access Link
															</button>
															<div className="nls-sg-link-box">
																<span className="nls-sg-link-ico" aria-hidden="true"><Globe size={ 16 } /></span>
																{ generatedLink ? (
																	<div className="nls-sg-link-inner">
																		<input readOnly value={ generatedLink } className="nls-sg-link-inp" />
																		<button type="button" onClick={ copyToClipboard } className="nls-sg-link-copy" aria-label="Copy link">
																			{ copySuccess ? <Check size={ 16 } className="is-copied" /> : <Copy size={ 16 } /> }
																		</button>
																	</div>
																) : (
																	<span className="nls-sg-link-placeholder">Link will appear here after generation...</span>
																) }
															</div>
														</div>
													</div>
												</div>
											</section>

											<section className="nls-sg-section">
												<div className="nls-sg-sec-head">
													<span className="nls-sg-sec-ico">
														<ImageIcon size={ 16 } />
													</span>
													<div>
														<span className="nls-sg-sec-title">Report &amp; PDF Logo</span>
														<p className="nls-sg-sec-desc">
															If uploaded, the logo appears above the site title in PDF reports; otherwise only the title shows.
														</p>
													</div>
												</div>
												<div className="nls-sg-grid-2">
													<div className="nls-sg-stack">
														<div className="nls-sg-field">
															<span className="lbl">Logo URL</span>
															<div className="nls-sg-logo-row">
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
																	className="nls-sg-btn nls-sg-btn-primary"
																>
																	{ uploadingReportLogo ? <Loader2 size={ 16 } className="animate-spin" /> : <Upload size={ 16 } /> }
																	Upload
																</button>
																<button
																	type="button"
																	onClick={ () => updateSetting( 'reportLogo', '' ) }
																	disabled={ ! settings.reportLogo }
																	className="nls-sg-btn nls-sg-btn-secondary"
																>
																	<X size={ 16 } /> Remove
																</button>
															</div>
															<p className="hint">
																Source file min. <strong>700 × 700 px</strong> for sharp PDF · transparent PNG/WebP · max 3 MB · Preview uses <strong>70 × 70 px</strong> (no cropping or stretch).
															</p>
														</div>
													</div>
													<div className="nls-sg-stack">
														<span className="lbl">PDF report header preview</span>
														<div className="nls-sg-preview-box">
															<div className="nls-sg-preview-logo">
																{ settings.reportLogo ? (
																	<img
																		src={ settings.reportLogo }
																		alt="Report Logo"
																		className="nls-sg-preview-img"
																	/>
																) : (
																	<ImageIcon size={ 22 } className="nls-sg-preview-empty" aria-hidden />
																) }
															</div>
															<div className="nls-sg-preview-title">{ window?.nexusLsAdmin?.siteName || 'Site Title' }</div>
															<div className="nls-sg-preview-sub">Activities Report</div>
														</div>
													</div>
												</div>
											</section>

											<section className="nls-sg-section">
												<div className="nls-sg-sec-head">
													<span className="nls-sg-sec-ico is-violet">
														<FontIcon size={ 16 } />
													</span>
													<div>
														<span className="nls-sg-sec-title">Global Font Settings</span>
														<p className="nls-sg-sec-desc">
															Applies to all plugin elements: Forms, Popups, Menu Items, Reports &amp; PDF.
														</p>
													</div>
												</div>
												<div className="nls-sg-grid-2">
													<div className="nls-sg-stack">
														<input
															type="text"
															className="inp"
															placeholder="Search fonts..."
															value={ fontSearch }
															onChange={ ( e ) => setFontSearch( e.target.value ) }
														/>
														<div className="nls-sg-font-list">
															{ filteredFonts.length === 0 ? (
																<div className="nls-sg-font-empty">No fonts found</div>
															) : filteredFonts.map( ( font ) => {
																const isSelected = settings.globalFont === font.family;
																return (
																	<button
																		key={ font.family }
																		type="button"
																		onClick={ () => updateSetting( 'globalFont', font.family ) }
																		className={ `nls-sg-font-item${ isSelected ? ' is-selected' : '' }` }
																		style={ { fontFamily: `'${ font.family }', ${ font.category === 'Serif' ? 'serif' : font.category === 'Monospace' ? 'monospace' : 'sans-serif' }` } }
																	>
																		<span className="nls-sg-font-name">{ font.family }</span>
																		<span className="nls-sg-font-cat">{ font.category }</span>
																	</button>
																);
															} ) }
														</div>
														<p className="nls-sg-font-meta">{ GOOGLE_FONTS.length } fonts · Google CDN · zero files in plugin</p>
													</div>
													<div className="nls-sg-stack">
														<div
															className="nls-sg-font-preview"
															style={ { fontFamily: settings.globalFont ? `'${ settings.globalFont }', sans-serif` : 'inherit' } }
														>
															<div className="nls-sg-font-preview-head">
																<span className="lbl">Live Preview</span>
																<span className="nls-sg-font-badge">{ settings.globalFont || 'System Default' }</span>
															</div>
															<h2 className="nls-sg-font-h2">The quick brown fox</h2>
															<h4 className="nls-sg-font-h4">Jumps over the lazy dog</h4>
															<p className="nls-sg-font-body">
																Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
															</p>
															<div className="nls-sg-font-btns">
																<button type="button" className="nls-sg-font-btn-primary">Submit Form</button>
																<button type="button" className="nls-sg-font-btn-secondary">Chat Now</button>
															</div>
															<div className="nls-sg-font-input-demo">
																<span className="lbl">Form Input</span>
																<div className="nls-sg-font-input-fake">Type your name here...</div>
															</div>
														</div>
														<div className="nls-sg-info-box">
															<Info size={ 14 } className="nls-sg-info-ico" />
															<p>
																Font, size, weight &amp; line height apply globally to all plugin frontend elements: Forms, Popups, Menu Items &amp; Reports. Served via Google CDN — <strong>no files stored in plugin</strong>.
															</p>
														</div>
													</div>
												</div>
											</section>

											<div className="nls-sg-alert">
												<span className="nls-sg-alert-ico" aria-hidden="true"><AlertTriangle size={ 18 } /></span>
												<div>
													<h6 className="nls-sg-alert-title">System Notification Logic Alert</h6>
													<p className="nls-sg-alert-text">
														The email template selected above is strictly for <strong>Activity Notifications only</strong>.
														Submission data will NOT be sent via this notification email.
													</p>
												</div>
											</div>
										</div>
									</div>
								) }

								{/* ════════════════════════════════════════════
								    AUTO POPUP LOGIC
								════════════════════════════════════════════ */}
								{ activeTab === 'popup' && (
									<div className="space-y-8 flex flex-col">
										<div className="p-8 bg-white border border-slate-200 rounded-[2.5rem] space-y-6">
											<InlineToggle
												enabled={ settings.enableAutoPopup }
												onClick={ () => updateSetting( 'enableAutoPopup', ! settings.enableAutoPopup ) }
												label="Enable Auto POPUP"
												icon={ Zap }
											/>

											<div className="space-y-3">
												<label className="text-[11px] font-bold text-slate-600 capitalize tracking-widest ml-1">Button Classes</label>
												<textarea
													value={ settings.activityButtonClasses }
													onChange={ ( e ) => updateSetting( 'activityButtonClasses', e.target.value ) }
													className="w-full h-24 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-all"
													placeholder="nexas | xyz-pop, xyz-alert"
												/>
												<div className="text-[10px] text-slate-400 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 font-medium">
													Each class should be separated by a comma. Use a pipe (<span className="text-blue-600 font-bold">|</span>) before class for popups.
													<br /><span className="font-bold">Example:</span> <code className="bg-white border px-1 rounded text-blue-600 font-bold">popupId | className</code>
												</div>
											</div>
										</div>

										<div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:items-stretch">
											<div className="nls-settings-autopopup-exclusion-wrap flex flex-col min-h-[320px]">
												<div className="nls-sap-excl-card">
													<section className="nls-sap-excl-section is-first">
														<div className="nls-sap-excl-sec-head">
															<span className="nls-sap-excl-sec-ico" aria-hidden="true">
																<FileX size={ 16 } />
															</span>
															<div>
																<span className="nls-sap-excl-sec-title">Exclusion Rules</span>
																<p className="nls-sap-excl-sec-desc">Suppress auto popup on selected posts and pages.</p>
															</div>
														</div>
														<div className="nls-sap-excl-stack">
															<div className="nls-sap-excl-field">
																<span className="lbl">Exclude Posts</span>
																<select
																	onChange={ ( e ) => {
																		const item = allPosts.find( ( p ) => p.id === parseInt( e.target.value ) );
																		if ( item ) toggleExclusion( 'excludePosts', item );
																		e.target.value = '';
																	} }
																	className="sel"
																>
																	<option value="">Select posts...</option>
																	{ allPosts.filter( ( p ) => ! settings.excludePosts.some( ( ex ) => ex.id === p.id ) ).map( ( p ) => (
																		<option key={ p.id } value={ p.id }>{ p.title }</option>
																	) ) }
																</select>
																{ settings.excludePosts.length > 0 && (
																	<div className="nls-sap-excl-tags">
																		{ settings.excludePosts.map( ( post ) => (
																			<span key={ post.id } className="nls-sap-excl-chip is-post">
																				{ post.title }
																				<button
																					type="button"
																					className="nls-sap-excl-chip-remove"
																					onClick={ () => toggleExclusion( 'excludePosts', post ) }
																					aria-label={ `Remove ${ post.title }` }
																				>
																					<X size={ 12 } />
																				</button>
																			</span>
																		) ) }
																	</div>
																) }
															</div>
															<div className="nls-sap-excl-field">
																<span className="lbl">Exclude Pages</span>
																<select
																	onChange={ ( e ) => {
																		const item = allPages.find( ( p ) => p.id === parseInt( e.target.value ) );
																		if ( item ) toggleExclusion( 'excludePages', item );
																		e.target.value = '';
																	} }
																	className="sel"
																>
																	<option value="">Select pages...</option>
																	{ allPages.filter( ( p ) => ! settings.excludePages.some( ( ex ) => ex.id === p.id ) ).map( ( p ) => (
																		<option key={ p.id } value={ p.id }>{ p.title }</option>
																	) ) }
																</select>
																{ settings.excludePages.length > 0 && (
																	<div className="nls-sap-excl-tags">
																		{ settings.excludePages.map( ( page ) => (
																			<span key={ page.id } className="nls-sap-excl-chip is-page">
																				{ page.title }
																				<button
																					type="button"
																					className="nls-sap-excl-chip-remove"
																					onClick={ () => toggleExclusion( 'excludePages', page ) }
																					aria-label={ `Remove ${ page.title }` }
																				>
																					<X size={ 12 } />
																				</button>
																			</span>
																		) ) }
																	</div>
																) }
															</div>
														</div>
													</section>
												</div>
											</div>

											<div
												className={ [
													'p-8 bg-slate-900 text-white rounded-[2.5rem] shadow-xl flex flex-col gap-6 border border-white/5 min-h-[320px]',
													settings.enableAutoPopup ? '' : 'opacity-55 pointer-events-none',
												].join( ' ' ) }
											>
												<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
													<div className="flex items-start gap-3 min-w-0">
														<Layers size={ 22 } className="shrink-0 text-blue-400 mt-0.5" aria-hidden />
														<div className="min-w-0">
															<h5 className="text-sm font-bold uppercase tracking-tight text-white leading-snug">
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
														className="inline-flex items-center justify-center gap-2 shrink-0 rounded-xl bg-blue-600 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg shadow-blue-900/40 transition-all hover:bg-blue-500 active:scale-[0.98] sm:self-start"
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
																		className="min-w-0 flex-1 p-2.5 bg-white/10 border border-white/20 rounded-lg text-xs font-medium text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
									<div className="nls-settings-livechat-wrap">
										<div className="nls-lc-layout">
											<div className="nls-lc-main">
												<div className="nls-lc-card">
													<section className="nls-lc-section is-first">
														<div className="nls-lc-sec-head">
															<span className="nls-lc-sec-ico" aria-hidden="true">
																<MessageCircle size={ 16 } />
															</span>
															<div>
																<span className="nls-lc-sec-title">Livechat Widget</span>
																<p className="nls-lc-sec-desc">Enable the floating chat widget and configure header content shown in the panel.</p>
															</div>
														</div>
														<div className="nls-lc-stack">
															<div className="nls-lc-toggle-card">
																<div className="nls-lc-toggle-card-body">
																	<span className="nls-lc-toggle-card-title">Enable Livechat Widget</span>
																	<p className="hint">Show the floating chat launcher on the front-end</p>
																</div>
																<div
																	className={ `nls-lc-toggle${ settings.enableLivechat ? ' on' : '' }` }
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
															<div className="nls-lc-grid-2">
																<div className="nls-lc-field is-full">
																	<span className="lbl">Livechat Button Image</span>
																	<div className="nls-lc-upload-row">
																		<input
																			type="text"
																			className="inp"
																			value={ settings.chatButtonImage }
																			onChange={ ( e ) => updateSetting( 'chatButtonImage', e.target.value ) }
																			placeholder="URL or upload — chat panel header only (launcher uses chat icon)"
																		/>
																		<input type="file" accept="image/*" className="hidden" ref={ fileInputRef } onChange={ handleImageUpload } />
																		<button
																			type="button"
																			disabled={ uploadingChatImg }
																			onClick={ () => fileInputRef.current.click() }
																			className="nls-lc-btn nls-lc-btn-primary"
																			title="Upload to Media Library"
																		>
																			{ uploadingChatImg ? <Loader2 size={ 16 } className="animate-spin" /> : <Upload size={ 16 } /> }
																			Upload
																		</button>
																	</div>
																</div>
																<div className="nls-lc-field">
																	<span className="lbl">Livechat Title</span>
																	<input
																		type="text"
																		className="inp"
																		value={ settings.chatTitle }
																		onChange={ ( e ) => updateSetting( 'chatTitle', e.target.value ) }
																	/>
																</div>
																<div className="nls-lc-field">
																	<span className="lbl">Livechat Badge</span>
																	<input
																		type="text"
																		className="inp"
																		value={ settings.chatBadge }
																		onChange={ ( e ) => updateSetting( 'chatBadge', e.target.value ) }
																	/>
																</div>
																<div className="nls-lc-field is-full">
																	<span className="lbl">Livechat Content</span>
																	<textarea
																		className="ta"
																		value={ settings.chatContent }
																		onChange={ ( e ) => updateSetting( 'chatContent', e.target.value ) }
																	/>
																</div>
															</div>
														</div>
													</section>

													<section className="nls-lc-section">
														<div className="nls-lc-sec-head">
															<span className="nls-lc-sec-ico is-violet" aria-hidden="true">
																<MousePointer2 size={ 16 } />
															</span>
															<div>
																<span className="nls-lc-sec-title">Chat Buttons &amp; Redirects</span>
																<p className="nls-lc-sec-desc">Configure button labels and where each action links — URL or popup.</p>
															</div>
														</div>
														<div className="nls-lc-btn-list">
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
																	<div key={ btn.key } className="nls-lc-btn-card">
																		<div className="nls-lc-field">
																			<span className="lbl">{ btn.label } — Label</span>
																			<input
																				type="text"
																				className="inp"
																				value={ settings[ btn.key ] }
																				onChange={ ( e ) => updateSetting( btn.key, e.target.value ) }
																				placeholder={ btn.placeholder }
																			/>
																		</div>
																		<div className="nls-lc-field">
																			<span className="lbl">Link Type</span>
																			<div className="nls-lc-seg">
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
																			<div className="nls-lc-field">
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
																			<div className="nls-lc-field is-popup-select">
																				<span className="lbl">Select Popup</span>
																				{ popups.length === 0 ? (
																					<div className="nls-lc-alert">
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
																			<p className="nls-lc-info-note">
																				Selected popup content is shown inside the chat bubble. Use <code>[smart_trigger_form id=&quot;…&quot;]</code> in the popup body. Set recipient email(s) on that form under <strong>Form Builder → Advanced → Submission notification email(s)</strong>.
																			</p>
																		) }
																	</div>
																);
															} ) }
														</div>
													</section>

													<section className="nls-lc-section">
														<div className="nls-lc-sec-head">
															<span className="nls-lc-sec-ico is-violet" aria-hidden="true">
																<Paintbrush size={ 16 } />
															</span>
															<div>
																<span className="nls-lc-sec-title">Button &amp; Widget Styling</span>
																<p className="nls-lc-sec-desc">Position, colours, spacing, and hover effects for the chat widget and buttons.</p>
															</div>
														</div>
														<div className="nls-lc-grid-2">
															<div className="nls-lc-field is-full">
																<span className="lbl">Widget Position</span>
																<div className="nls-lc-seg">
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
																<p className="hint">Pins the entire floating chat widget to the left or right edge of the site (same as front-end).</p>
															</div>
															<div className="nls-lc-color-field">
																<span className="lbl">Button BG</span>
																<div className="cgroup">
																	<label className="cswatch" style={ { backgroundColor: settings.primaryBtnBg } }>
																		<input type="color" value={ settings.primaryBtnBg } onChange={ ( e ) => updateSetting( 'primaryBtnBg', e.target.value ) } />
																	</label>
																	<input type="text" className="chex" value={ settings.primaryBtnBg } onChange={ ( e ) => updateSetting( 'primaryBtnBg', e.target.value ) } />
																</div>
															</div>
															<div className="nls-lc-range-field">
																<div className="nls-lc-range-head">
																	<span className="lbl">Padding (px)</span>
																	<span className="nls-lc-range-val">{ settings.chatPadding }</span>
																</div>
																<input type="range" min="4" max="40" value={ settings.chatPadding } onChange={ ( e ) => updateSetting( 'chatPadding', e.target.value ) } className="nls-lc-range" />
															</div>
															<div className="nls-lc-color-field">
																<span className="lbl">Button Text</span>
																<div className="cgroup">
																	<label className="cswatch" style={ { backgroundColor: settings.primaryBtnText } }>
																		<input type="color" value={ settings.primaryBtnText } onChange={ ( e ) => updateSetting( 'primaryBtnText', e.target.value ) } />
																	</label>
																	<input type="text" className="chex" value={ settings.primaryBtnText } onChange={ ( e ) => updateSetting( 'primaryBtnText', e.target.value ) } />
																</div>
															</div>
															<div className="nls-lc-color-field">
																<span className="lbl">Online Blink Dot</span>
																<div className="cgroup">
																	<label className="cswatch" style={ { backgroundColor: settings.chatBlinkDotColor } }>
																		<input type="color" value={ settings.chatBlinkDotColor } onChange={ ( e ) => updateSetting( 'chatBlinkDotColor', e.target.value ) } />
																	</label>
																	<input type="text" className="chex" value={ settings.chatBlinkDotColor } onChange={ ( e ) => updateSetting( 'chatBlinkDotColor', e.target.value ) } />
																</div>
																<p className="hint">Header status indicator next to the badge text.</p>
															</div>
															<div className="nls-lc-range-field">
																<div className="nls-lc-range-head">
																	<span className="lbl">Radius (px)</span>
																	<span className="nls-lc-range-val">{ settings.chatBorderRadius }</span>
																</div>
																<input type="range" min="0" max="50" value={ settings.chatBorderRadius } onChange={ ( e ) => updateSetting( 'chatBorderRadius', e.target.value ) } className="nls-lc-range" />
															</div>
															<div className="nls-lc-field">
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

											<aside className="nls-lc-preview">
												<div className="nls-lc-preview-head">
													<Eye size={ 14 } aria-hidden="true" />
													<span>Real-time Preview</span>
												</div>
												<div className={ `nls-lc-preview-stage${ settings.chatAlign === 'left' ? ' is-left' : ' is-right' }` }>
													<div
														className="nls-lc-preview-panel"
														style={ {
															fontFamily: settings.globalFont ? `'${ settings.globalFont }', sans-serif` : 'inherit',
														} }
													>
														<div className="nls-lc-preview-header">
															{ settings.chatButtonImage
																? <img src={ settings.chatButtonImage } className="nls-lc-preview-avatar" alt="Support" />
																: <div className="nls-lc-preview-avatar-fallback"><MessageCircle size={ 22 } /></div>
															}
															<div className="nls-lc-preview-meta">
																<h6>{ settings.chatTitle || 'Support Widget' }</h6>
																<span className="nls-lc-preview-badge">
																	<span className="nls-lc-preview-dot" style={ { backgroundColor: settings.chatBlinkDotColor || settings.primaryBtnText } } aria-hidden />
																	{ settings.chatBadge || 'Online' }
																</span>
															</div>
														</div>
														<div className="nls-lc-preview-body">{ settings.chatContent }</div>
														<div className="nls-lc-preview-actions">
															<button type="button" className={ `nls-lc-preview-btn is-full ${ getHoverClass( settings.chatHoverEffect ) }` } style={ { backgroundColor: settings.primaryBtnBg, color: settings.primaryBtnText, padding: `${ settings.chatPadding }px`, borderRadius: `${ settings.chatBorderRadius }px` } }>
																{ settings.chatFormButton || 'Start Conversation' }
															</button>
															<div className="nls-lc-preview-btn-row">
																<button type="button" className={ `nls-lc-preview-btn ${ getHoverClass( settings.chatHoverEffect ) }` } style={ { backgroundColor: settings.primaryBtnBg, color: settings.primaryBtnText, padding: `${ settings.chatPadding }px`, borderRadius: `${ settings.chatBorderRadius }px`, opacity: 0.9 } }>
																	{ settings.chatButtonTwo || "What's App" }
																</button>
																<button type="button" className={ `nls-lc-preview-btn ${ getHoverClass( settings.chatHoverEffect ) }` } style={ { backgroundColor: settings.primaryBtnBg, color: settings.primaryBtnText, padding: `${ settings.chatPadding }px`, borderRadius: `${ settings.chatBorderRadius }px`, opacity: 0.9 } }>
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
														const data = { version: '1.0.0', settings };
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
																	if ( data.settings ) setSettings( ( prev ) => ( { ...prev, ...data.settings } ) );
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
