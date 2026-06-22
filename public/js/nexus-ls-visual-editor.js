( function () {
	'use strict';

	var cfg = window.nexulesuite_VeCfg || {};
	if ( ! cfg || ! cfg.endpoint || ! ( window.wp && wp.element ) ) {
		return;
	}

	function veGlobalFontStack() {
		var f = ( cfg.globalFont && String( cfg.globalFont ).trim() ) || 'Inter';
		return "'" + f.replace( /\\/g, '\\\\' ).replace( /'/g, "\\'" ) + "', sans-serif";
	}

	var __classGroups = []; // Optional; kept for future compatibility.

	function isEditorUi( node ) {
		if ( ! node ) return false;
		try {
			if ( node.id === 'nexulesuite_ve-root' ) return true;
			if ( node.closest && node.closest( '#nexulesuite_ve-root' ) ) return true;
		} catch ( e ) {}
		return false;
	}

	function resolveVePostId() {
		var n = Number( cfg.postId || 0 );
		return n > 0 ? n : 0;
	}

	function veCssPath( el ) {
		try {
			if ( ! el || ! el.tagName ) return '';
			if ( el.id ) return '#' + String( el.id ).replace( /([ !"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g, '\\$1' );
			var parts = [];
			var node = el;
			var depth = 0;
			while ( node && node.nodeType === 1 && depth < 6 ) {
				var name = String( node.tagName ).toLowerCase();
				if ( ! name || name === 'html' || name === 'body' ) break;
				var parent = node.parentNode;
				if ( ! parent || parent.nodeType !== 1 ) break;
				var idx = 1;
				var sib = node;
				while ( ( sib = sib.previousElementSibling ) ) {
					if ( String( sib.tagName ).toLowerCase() === name ) idx++;
				}
				parts.unshift( name + ':nth-of-type(' + idx + ')' );
				node = parent;
				depth++;
			}
			return parts.join( ' > ' );
		} catch ( e ) {
			return '';
		}
	}

	function ensureStopProp( a ) {
		if ( a.getAttribute( 'data-nexulesuite_ve-stop-prop' ) ) return;
		a.setAttribute( 'data-nexulesuite_ve-stop-prop', '1' );
		a.addEventListener( 'click', function ( e ) {
			e.stopPropagation();
		} );
	}

	var raf = 0;
	var last = null;

	( function injectVeHoverStyle() {
		try {
			if ( document.getElementById( 'nexulesuite_ve-hover-style' ) ) {
				return;
			}
			var styleEl = document.createElement( 'style' );
			styleEl.id = 'nexulesuite_ve-hover-style';
			styleEl.textContent =
				'[data-nexulesuite_ve-hover]{outline:2px solid #4f46e5!important;outline-offset:2px!important}';
			( document.head || document.documentElement ).appendChild( styleEl );
		} catch ( e ) {}
	} )();

	function clearOutline() {
		if ( ! last ) return;
		try {
			last.removeAttribute( 'data-nexulesuite_ve-hover' );
			last.style.outline = '';
			last.style.outlineOffset = '';
		} catch ( e ) {}
		last = null;
	}

	function applyOutline( node ) {
		if ( ! node || node === last ) return;
		clearOutline();
		last = node;
		try {
			node.setAttribute( 'data-nexulesuite_ve-hover', '1' );
		} catch ( e ) {}
	}

	/**
	 * Snapshot outerHTML without Visual Editor hover artifacts (inline outline / data attrs).
	 * Those are added on hover/click and break server-side post_content matching.
	 *
	 * @param {Element} el Target element.
	 * @return {string}
	 */
	function snapshotOuterHtml( el ) {
		if ( ! el || ! el.outerHTML ) {
			return '';
		}
		var hadHover = false;
		var prevOutline = '';
		var prevOutlineOffset = '';
		try {
			hadHover = el.getAttribute && el.getAttribute( 'data-nexulesuite_ve-hover' ) === '1';
			if ( hadHover ) {
				el.removeAttribute( 'data-nexulesuite_ve-hover' );
			}
			prevOutline = el.style.outline || '';
			prevOutlineOffset = el.style.outlineOffset || '';
			el.style.outline = '';
			el.style.outlineOffset = '';
			var html = el.outerHTML;
			el.style.outline = prevOutline;
			el.style.outlineOffset = prevOutlineOffset;
			if ( hadHover ) {
				el.setAttribute( 'data-nexulesuite_ve-hover', '1' );
			}
			return html;
		} catch ( e ) {
			try {
				if ( hadHover ) {
					el.setAttribute( 'data-nexulesuite_ve-hover', '1' );
				}
				el.style.outline = prevOutline;
				el.style.outlineOffset = prevOutlineOffset;
			} catch ( ex ) {}
			return el.outerHTML;
		}
	}

	function pickHoverTarget( x, y ) {
		var node = document.elementFromPoint( x, y );
		if ( ! node || node === document.body || node === document.documentElement ) return null;
		if ( isEditorUi( node ) ) return null;
		var tag = ( node.tagName || '' ).toLowerCase();
		if ( tag === 'html' || tag === 'body' || tag === 'script' || tag === 'style' ) return null;
		return node;
	}

	function onMove( e ) {
		if ( raf ) return;
		raf = window.requestAnimationFrame( function () {
			raf = 0;
			var node = pickHoverTarget( e.clientX, e.clientY );
			if ( node ) applyOutline( node );
		} );
	}

	function ensureRoot() {
		var root = document.getElementById( 'nexulesuite_ve-root' );
		if ( root ) return root;
		root = document.createElement( 'div' );
		root.id = 'nexulesuite_ve-root';
		root.style.position = 'fixed';
		root.style.zIndex = '2147483647';
		root.style.left = '0';
		root.style.top = '0';
		root.style.width = '0';
		root.style.height = '0';
		document.body.appendChild( root );
		return root;
	}

	function mountMenu( opts ) {
		var root = ensureRoot();
		var React = wp && wp.element ? wp.element : null;
		if ( ! React ) return;

		var createElement = React.createElement;
		var Fragment = React.Fragment;
		var useEffect = React.useEffect;
		var useMemo = React.useMemo;
		var useRef = React.useRef;
		var useState = React.useState;

		function veSvgIcon( paths, iconOpts ) {
			iconOpts = iconOpts || {};
			var s = iconOpts.size != null ? iconOpts.size : 16;
			var sw = iconOpts.strokeWidth != null ? iconOpts.strokeWidth : 2;
			return createElement(
				'svg',
				{
					xmlns: 'http://www.w3.org/2000/svg',
					width: s,
					height: s,
					viewBox: '0 0 24 24',
					fill: 'none',
					stroke: 'currentColor',
					strokeWidth: sw,
					strokeLinecap: 'round',
					strokeLinejoin: 'round',
					'aria-hidden': 'true',
					focusable: 'false',
				},
				paths.map( function ( d, i ) {
					return createElement( 'path', { key: i, d: d } );
				} )
			);
		}

		function Menu() {
			var initial = opts && opts.initial ? opts.initial : {};
			var target = opts && opts.target ? opts.target : null;
			var anchor = opts && opts.anchor ? opts.anchor : { x: 24, y: 24 };

			var [ selectedClasses, setSelectedClasses ] = useState(
				String( initial.cssClass || '' ).split( /\s+/ ).map( function ( s ) { return s.trim(); } ).filter( Boolean )
			);
			var [ customClass, setCustomClass ] = useState( '' );
			var [ cssId, setCssId ] = useState( initial.cssId || '' );
			var [ link, setLink ] = useState( initial.link || '' );
			var [ status, setStatus ] = useState( '' );
			var [ successOpen, setSuccessOpen ] = useState( false );
			var [ successMessage, setSuccessMessage ] = useState( '' );
			var [ busy, setBusy ] = useState( false );
			var customInputRef = useRef( null );

			var ui = useMemo( function () {
				return {
					radius: 24,
					radiusSm: 16,
					border: '#e2e8f0',
					borderSoft: '#f1f5f9',
					bgSoft: '#fbfdff',
					bgSubtle: '#f8fafc',
					textMuted: '#64748b',
					indigoBg: '#eef2ff',
					indigoText: '#4f46e5',
					shadow: '0 28px 80px rgba(2,6,23,.18), 0 10px 30px rgba(2,6,23,.10)',
				};
			}, [] );

			var icons = useMemo( function () {
				return {
					link: veSvgIcon(
						[ 'M9 17H7A5 5 0 0 1 7 7h2', 'M15 7h2a5 5 0 1 1 0 10h-2', 'M8 12h8' ],
						{ size: 14 }
					),
					bell: veSvgIcon(
						[ 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9', 'M10.3 21a1.94 1.94 0 0 0 3.4 0' ],
						{ size: 14 }
					),
					tag: veSvgIcon(
						[
							'M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z',
							'M7.5 7.5h.01',
						],
						{ size: 14 }
					),
					save: veSvgIcon( [ 'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z', 'M17 21v-8H7v8', 'M7 3v5h8' ], { size: 18 } ),
					xMd: veSvgIcon( [ 'M18 6 6 18', 'M6 6l12 12' ], { size: 20 } ),
					xSm: veSvgIcon( [ 'M18 6 6 18', 'M6 6l12 12' ], { size: 12, strokeWidth: 2.25 } ),
				};
			}, [] );

			var classGroups = useMemo( function () {
				var raw = typeof cfg.activityButtonClasses === 'string' ? cfg.activityButtonClasses : '';
				raw = String( raw || '' );
				if ( ! raw.trim() ) return [];

				var lines = raw.split( /\r\n|\r|\n/ );
				var out = [];
				for ( var i = 0; i < lines.length; i++ ) {
					var line = String( lines[ i ] || '' ).trim();
					if ( ! line ) continue;
					var parts = line.split( '|' );
					if ( parts.length < 2 ) continue;
					var eventId = String( parts[ 0 ] || '' ).trim();
					var classesRaw = String( parts.slice( 1 ).join( '|' ) || '' ).trim();
					if ( ! eventId || ! classesRaw ) continue;

					// Strip optional prefixes (keeps backward compatibility with past formats).
					if ( eventId.indexOf( 'popup:' ) === 0 ) {
						eventId = eventId.slice( 6 ).trim();
					}
					if ( eventId.indexOf( '#' ) === 0 ) {
						eventId = eventId.slice( 1 ).trim();
					}
					if ( ! eventId ) continue;

					var clsParts = classesRaw.split( ',' ).map( function ( s ) {
						return String( s || '' ).trim();
					} ).filter( Boolean );
					if ( ! clsParts.length ) continue;

					var popupClass = '';
					var notifyClasses = [];
					var autoClasses = [];

					clsParts.forEach( function ( token ) {
						if ( token.indexOf( 'popup:' ) === 0 ) {
							var p = token.slice( 6 ).trim();
							if ( p ) popupClass = p;
							return;
						}
						if ( token.indexOf( 'mail:' ) === 0 || token.indexOf( 'notify:' ) === 0 ) {
							var n = token.indexOf( 'mail:' ) === 0 ? token.slice( 5 ).trim() : token.slice( 7 ).trim();
							if ( n ) notifyClasses.push( n );
							return;
						}
						autoClasses.push( token );
					} );

					if ( autoClasses.length === 1 ) {
						notifyClasses.push( autoClasses[ 0 ] );
					} else if ( autoClasses.length > 1 ) {
						if ( ! popupClass ) {
							popupClass = autoClasses[ 0 ];
						}
						autoClasses.slice( 1 ).forEach( function ( c ) {
							if ( notifyClasses.indexOf( c ) === -1 ) {
								notifyClasses.push( c );
							}
						} );
					}

					out.push( {
						eventId: eventId,
						popupClass: popupClass,
						notifyClasses: notifyClasses,
					} );
				}
				return out;
			}, [] );

			var css = useMemo( function () {
				var fontStack = veGlobalFontStack();
				return (
					'' +
					'.nexulesuite_ve,.nexulesuite_ve *,.nexulesuite_ve-successBackdrop,.nexulesuite_ve-successBackdrop *{font-family:' +
					fontStack +
					'!important}' +
					'.nexulesuite_ve *{box-sizing:border-box}' +
					'.nexulesuite_ve input.nexulesuite_ve-input{width:100%;height:46px;border:1px solid ' +
					ui.border +
					';border-radius:' +
					ui.radiusSm +
					'px;padding:0 14px;background:' +
					ui.bgSubtle +
					';outline:none;font-size:13px;color:#475569;box-shadow:none;transition:border-color .15s ease,box-shadow .15s ease}' +
					'.nexulesuite_ve input.nexulesuite_ve-input::placeholder{color:#cbd5e1}' +
					'.nexulesuite_ve input.nexulesuite_ve-input:focus{border-color:' +
					ui.indigoText +
					';box-shadow:0 0 0 4px rgba(79,70,229,.12)}' +
					'.nexulesuite_ve .nexulesuite_ve-header{padding:20px 22px 18px;border-bottom:1px solid ' +
					ui.borderSoft +
					';background:linear-gradient(180deg,#ffffff 0%,' +
					ui.bgSoft +
					' 100%)}' +
					'.nexulesuite_ve .nexulesuite_ve-h1{margin:0;font-size:20px;font-weight:800;color:#1e293b;letter-spacing:-.02em}' +
					'.nexulesuite_ve .nexulesuite_ve-metaRow{display:flex;align-items:center;gap:8px;margin-top:6px;flex-wrap:wrap}' +
					'.nexulesuite_ve .nexulesuite_ve-chipIndigo{display:inline-flex;align-items:center;padding:2px 8px;border-radius:6px;background:' +
					ui.indigoBg +
					';color:' +
					ui.indigoText +
					';font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}' +
					'.nexulesuite_ve .nexulesuite_ve-selectedHint{font-size:12px;color:#94a3b8;font-weight:600;font-style:italic}' +
					'.nexulesuite_ve .nexulesuite_ve-closeBtn{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border:0;border-radius:999px;background:transparent;color:#94a3b8;cursor:pointer;transition:background .15s ease,color .15s ease}' +
					'.nexulesuite_ve .nexulesuite_ve-closeBtn:hover{background:#f1f5f9;color:#64748b}' +
					'.nexulesuite_ve .nexulesuite_ve-body{padding:22px;display:flex;flex-direction:column;gap:22px;overflow-y:auto;min-height:0;-webkit-overflow-scrolling:touch}' +
					'.nexulesuite_ve .nexulesuite_ve-fieldLbl{display:flex;align-items:center;gap:8px;margin:0 0 8px;font-size:13px;font-weight:700;color:#334155}' +
					'.nexulesuite_ve .nexulesuite_ve-fieldLblIcon{color:#cbd5e1;line-height:0;display:inline-flex}' +
					'.nexulesuite_ve .nexulesuite_ve-dashBox{border:1px dashed #cbd5e1;border-radius:' +
					ui.radiusSm +
					'px;background:' +
					ui.bgSubtle +
					';padding:14px 14px 12px;min-height:96px}' +
					'.nexulesuite_ve .nexulesuite_ve-dashBrand{display:block;font-size:10px;font-weight:800;color:#94a3b8;letter-spacing:.2em;text-transform:uppercase;margin:0 0 10px}' +
					'.nexulesuite_ve .nexulesuite_ve-chipRow{display:flex;flex-wrap:wrap;gap:8px;align-items:center}' +
					'.nexulesuite_ve .nexulesuite_ve-tagPill{display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:8px;background:#fff;border:1px solid ' +
					ui.border +
					';box-shadow:0 1px 2px rgba(15,23,42,.05);font-size:12px;font-weight:800;color:#334155}' +
					'.nexulesuite_ve .nexulesuite_ve-tagX{border:0;background:transparent;padding:0;margin:0;cursor:pointer;color:#cbd5e1;line-height:0;display:inline-flex;align-items:center;justify-content:center}' +
					'.nexulesuite_ve .nexulesuite_ve-tagX:hover{color:#ef4444}' +
					'.nexulesuite_ve .nexulesuite_ve-addGhost{display:inline-flex;align-items:center;padding:6px 10px;border-radius:8px;border:1px dashed #cbd5e1;background:transparent;color:#94a3b8;font-size:12px;font-weight:600;cursor:pointer;transition:border-color .15s ease,color .15s ease}' +
					'.nexulesuite_ve .nexulesuite_ve-addGhost:hover{border-color:' +
					ui.indigoText +
					';color:' +
					ui.indigoText +
					'}' +
					'.nexulesuite_ve .nexulesuite_ve-availLbl{font-size:11px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em;margin:12px 0 8px}' +
					'.nexulesuite_ve .nexulesuite_ve-pickBtn{height:28px;padding:0 10px;border-radius:999px;border:1px solid ' +
					ui.border +
					';background:#fff;color:#475569;font-size:11px;font-weight:800;cursor:pointer;transition:border-color .15s ease,background .15s ease,color .15s ease}' +
					'.nexulesuite_ve .nexulesuite_ve-pickBtn.nexulesuite_ve-onPopup{border-color:#bfdbfe;background:#eff6ff;color:#1d4ed8}' +
					'.nexulesuite_ve .nexulesuite_ve-pickBtn.nexulesuite_ve-onMail{border-color:#fde68a;background:#fffbeb;color:#b45309}' +
					'.nexulesuite_ve .nexulesuite_ve-footer{padding:22px;display:flex;gap:12px;background:rgba(248,250,252,.65);border-top:1px solid ' +
					ui.borderSoft +
					'}' +
					'.nexulesuite_ve button.nexulesuite_ve-btn{flex:1;height:46px;border-radius:' +
					ui.radiusSm +
					'px;font-size:13px;font-weight:800;cursor:pointer;transition:transform .12s ease,filter .15s ease,opacity .15s ease,background .15s ease,border-color .15s ease,box-shadow .15s ease;display:inline-flex;align-items:center;justify-content:center;gap:8px}' +
					'.nexulesuite_ve button.nexulesuite_ve-btn:active{transform:scale(.98)}' +
					'.nexulesuite_ve button.nexulesuite_ve-btnPrimary{border:0;color:#fff;background:linear-gradient(180deg,#0f172a 0%,#020617 100%);box-shadow:0 12px 28px rgba(15,23,42,.18)}' +
					'.nexulesuite_ve button.nexulesuite_ve-btnPrimary:hover{filter:brightness(1.06)}' +
					'.nexulesuite_ve button.nexulesuite_ve-btnPrimary:disabled{opacity:.65;cursor:not-allowed;transform:none}' +
					'.nexulesuite_ve button.nexulesuite_ve-btnGhost{flex:0 auto;min-width:108px;padding:0 18px;border:1px solid ' +
					ui.border +
					';background:#fff;color:#475569;box-shadow:none;font-weight:800}' +
					'.nexulesuite_ve button.nexulesuite_ve-btnGhost:hover{background:' +
					ui.bgSubtle +
					'}' +
					'.nexulesuite_ve .nexulesuite_ve-status{margin:0;font-size:12px;line-height:1.45;font-weight:600}' +
					'.nexulesuite_ve .nexulesuite_ve-statusErr{color:#b91c1c}' +
					'.nexulesuite_ve-successBackdrop{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;background:rgba(15,23,42,.5);padding:16px;box-sizing:border-box}' +
					'.nexulesuite_ve-successCard{width:100%;max-width:28rem;overflow:hidden;border-radius:24px;border:1px solid #f1f5f9;background:#fff;box-shadow:0 25px 50px -12px rgba(0,0,0,.25)}' +
					'.nexulesuite_ve-successBody{padding:32px 32px 24px;text-align:center}' +
					'.nexulesuite_ve-successIconWrap{margin:0 auto;display:flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:999px;background:#ecfdf5;color:#10b981}' +
					'.nexulesuite_ve-successTitle{margin:20px 0 0;font-size:20px;font-weight:800;color:#0f172a;line-height:1.25}' +
					'.nexulesuite_ve-successMsg{margin:8px 0 0;font-size:14px;line-height:1.625;color:#64748b;white-space:pre-wrap;word-break:break-word}' +
					'.nexulesuite_ve-successFoot{padding:0 32px 32px}' +
					'.nexulesuite_ve-successDismiss{width:100%;border:0;border-radius:16px;background:#0f172a;color:#fff;padding:16px;font-size:14px;font-weight:800;cursor:pointer;transition:background .15s ease}' +
					'.nexulesuite_ve-successDismiss:hover{background:#000}'
				);
			}, [ ui ] );

			var style = useMemo( function () {
				var w = Math.min( 420, Math.max( 300, ( window.innerWidth || 420 ) - 24 ) );
				var h = Math.max( 220, Math.min( 560, ( window.innerHeight || 600 ) - 24 ) );
				var left = Math.min( ( window.innerWidth || 360 ) - w - 12, Math.max( 12, anchor.x + 12 ) );
				var top = Math.min( ( window.innerHeight || 600 ) - h - 12, Math.max( 12, anchor.y + 12 ) );

				if ( ( window.innerWidth || 0 ) < 520 ) {
					left = 12;
					top = 12;
				}

				return {
					position: 'fixed',
					left: left + 'px',
					top: top + 'px',
					width: w + 'px',
					maxHeight: h + 'px',
					display: 'flex',
					flexDirection: 'column',
					background: 'linear-gradient(180deg,#ffffff 0%,' + ui.bgSoft + ' 100%)',
					border: '1px solid ' + ui.border,
					borderRadius: ui.radius + 'px',
					boxShadow: ui.shadow,
					overflow: 'hidden',
					fontFamily: veGlobalFontStack(),
					backdropFilter: 'blur(10px)',
				};
			}, [ anchor.x, anchor.y, ui ] );

			var tagName = target && target.tagName ? String( target.tagName ).toLowerCase() : 'element';

			function close() {
				try {
					wp.element.unmountComponentAtNode( root );
				} catch ( e ) {}
			}

			function dismissSuccess() {
				setSuccessOpen( false );
			}

			useEffect( function () {
				function onKey( ev ) {
					if ( ev.key === 'Escape' ) close();
				}
				window.addEventListener( 'keydown', onKey );
				return function () {
					window.removeEventListener( 'keydown', onKey );
				};
			}, [] );

			function removeClassToken( cls ) {
				setSelectedClasses( function ( prev ) {
					var next = prev.slice( 0 );
					var idx = next.indexOf( cls );
					if ( idx !== -1 ) next.splice( idx, 1 );
					return next;
				} );
			}

			function focusCustomInput() {
				window.setTimeout( function () {
					try {
						if ( customInputRef.current && typeof customInputRef.current.focus === 'function' ) {
							customInputRef.current.focus();
						}
					} catch ( ex ) {}
				}, 0 );
			}

			var activeChipItems = useMemo( function () {
				var out = [];
				if ( ! classGroups || ! classGroups.length ) return out;
				for ( var gi = 0; gi < classGroups.length; gi++ ) {
					var g = classGroups[ gi ];
					if ( g.popupClass && selectedClasses.indexOf( g.popupClass ) !== -1 ) {
						out.push( { id: g.eventId + ':p:' + g.popupClass, label: 'POPUP: ' + g.popupClass, cls: g.popupClass } );
					}
					if ( g.notifyClasses && g.notifyClasses.length ) {
						for ( var ni = 0; ni < g.notifyClasses.length; ni++ ) {
							var nc = g.notifyClasses[ ni ];
							if ( nc && selectedClasses.indexOf( nc ) !== -1 ) {
								out.push( { id: g.eventId + ':n:' + nc, label: 'MAIL: ' + nc, cls: nc } );
							}
						}
					}
				}
				return out;
			}, [ selectedClasses, classGroups ] );

			async function save() {
				if ( busy ) return;
				if ( ! target ) return;

				setBusy( true );
				setStatus( '' );
				setSuccessOpen( false );

				var originalHtml = '';
				try {
					originalHtml =
						target.__nexulesuite_VeOriginalOuterHTML || snapshotOuterHtml( target ) || target.outerHTML;
				} catch ( e ) {}

				var extra = String( customClass || '' ).trim();
				var merged = selectedClasses.slice( 0 );
				if ( extra ) {
					extra.split( /\s+/ ).forEach( function ( c ) {
						c = String( c || '' ).trim();
						if ( c && merged.indexOf( c ) === -1 ) merged.push( c );
					} );
				}

				var attrs = {
					class: merged.join( ' ' ).trim(),
					id: String( cssId || '' ),
					href: String( link || '' ),
				};

				try {
					if ( attrs.class ) target.className = attrs.class;
					else target.removeAttribute( 'class' );
					if ( attrs.id ) target.id = attrs.id;
					else target.removeAttribute( 'id' );
				} catch ( e ) {}

			try {
				var veTargetTag = String( target.tagName || '' ).toLowerCase();
				if ( attrs.href ) {
					if ( veTargetTag === 'a' ) {
						target.setAttribute( 'href', attrs.href );
						ensureStopProp( target );
					} else {
						var vePa = target.parentElement;
						var veWrapA = null;
						if ( vePa && vePa.getAttribute && vePa.getAttribute( 'data-nexulesuite_ve-wrap' ) ) {
							vePa.setAttribute( 'href', attrs.href );
							vePa.setAttribute( 'rel', 'noopener' );
							vePa.setAttribute( 'target', '_self' );
							veWrapA = vePa;
						} else if ( vePa && String( vePa.tagName || '' ).toLowerCase() === 'a' && vePa.children.length === 1 ) {
							vePa.setAttribute( 'href', attrs.href );
							vePa.setAttribute( 'rel', 'noopener' );
							vePa.setAttribute( 'target', '_self' );
							veWrapA = vePa;
						} else {
							var veNewA = document.createElement( 'a' );
							veNewA.setAttribute( 'href', attrs.href );
							veNewA.setAttribute( 'rel', 'noopener' );
							veNewA.setAttribute( 'target', '_self' );
							veNewA.setAttribute( 'data-nexulesuite_ve-wrap', '1' );
							target.parentNode.insertBefore( veNewA, target );
							veNewA.appendChild( target );
							veWrapA = veNewA;
						}
						if ( veWrapA ) ensureStopProp( veWrapA );
					}
				} else {
					if ( veTargetTag === 'a' ) {
						target.removeAttribute( 'href' );
					}
				}
			} catch ( e ) {}

				var body = {
					postId: resolveVePostId(),
					originalHtml: originalHtml,
					attributes: attrs,
					wrapWithLink: Boolean( attrs.href && String( target.tagName || '' ).toLowerCase() !== 'a' ),
					selectorPath: veCssPath( target ),
					tagName: String( target.tagName || '' ).toLowerCase(),
				};

				try {
					var res = await window.fetch( cfg.endpoint, {
						method: 'POST',
						credentials: 'same-origin',
						headers: {
							'Content-Type': 'application/json',
							'X-WP-Nonce': String( cfg.nonce || '' ),
						},
						body: JSON.stringify( body ),
					} );
					var json = await res.json().catch( function () { return null; } );
					if ( ! res.ok || ! json || ! json.success ) {
						var msg = ( json && ( json.message || ( json.data && json.data.message ) ) ) || 'Failed to save.';
						setStatus( String( msg ) );
						return;
					}
					if ( json && json.data && json.data.mode === 'post_meta' ) {
						setSuccessMessage(
							'Saved (page patch). Reload without the editor to confirm for visitors.'
						);
					} else {
						setSuccessMessage(
							'Your settings have been successfully updated. All changes are now live.'
						);
					}
					setSuccessOpen( true );
				} catch ( e ) {
					setStatus( 'Failed to save.' );
				} finally {
					setBusy( false );
				}
			}

			function toggleFromPicker( cls ) {
				setSelectedClasses( function ( prev ) {
					var next = prev.slice( 0 );
					var idx = next.indexOf( cls );
					if ( idx !== -1 ) next.splice( idx, 1 );
					else next.push( cls );
					return next;
				} );
			}

			var chips = activeChipItems.map( function ( it ) {
				return createElement(
					'div',
					{ key: it.id, className: 'nexulesuite_ve-tagPill' },
					[
						createElement( 'span', { key: 'l' }, it.label ),
						createElement(
							'button',
							{
								key: 'x',
								type: 'button',
								className: 'nexulesuite_ve-tagX',
								'aria-label': 'Remove ' + it.cls,
								onClick: function () { removeClassToken( it.cls ); },
							},
							icons.xSm
						),
					]
				);
			} );

			chips.push(
				createElement(
					'button',
					{ key: 'add', type: 'button', className: 'nexulesuite_ve-addGhost', onClick: focusCustomInput },
					'+ Add New'
				)
			);

			var successCard = successOpen
				? createElement(
					'div',
					{
						key: 'success',
						className: 'nexulesuite_ve-successBackdrop',
						role: 'dialog',
						'aria-modal': 'true',
						'aria-labelledby': 'nexulesuite_ve-success-title',
						onMouseDown: function ( e ) {
							if ( e.target === e.currentTarget ) {
								dismissSuccess();
							}
						},
					},
					createElement(
						'div',
						{ className: 'nexulesuite_ve-successCard' },
						[
							createElement(
								'div',
								{ key: 'body', className: 'nexulesuite_ve-successBody' },
								[
									createElement(
										'div',
										{ key: 'ico', className: 'nexulesuite_ve-successIconWrap' },
										veSvgIcon(
											[ 'M21.801 10A10 10 0 1 1 17 3.335', 'm9 11 3 3L22 4' ],
											{ size: 28 }
										)
									),
									createElement(
										'h3',
										{ key: 't', id: 'nexulesuite_ve-success-title', className: 'nexulesuite_ve-successTitle' },
										'Success!'
									),
									createElement(
										'p',
										{ key: 'm', className: 'nexulesuite_ve-successMsg' },
										successMessage ||
											'Your settings have been successfully updated. All changes are now live.'
									),
								]
							),
							createElement(
								'div',
								{ key: 'ft', className: 'nexulesuite_ve-successFoot' },
								createElement(
									'button',
									{
										type: 'button',
										className: 'nexulesuite_ve-successDismiss',
										onClick: dismissSuccess,
									},
									'Dismiss'
								)
							),
						]
					)
				)
				: null;

			return createElement(
				Fragment,
				null,
				createElement(
				'div',
				{ className: 'nexulesuite_ve', style: style, role: 'dialog', 'aria-modal': 'true' },
				createElement( 'style', { key: 'css', dangerouslySetInnerHTML: { __html: css } } ),
				createElement(
					'header',
					{ key: 'hdr', className: 'nexulesuite_ve-header' },
					createElement(
						'div',
						{ style: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' } },
						[
							createElement(
								'div',
								{ key: 'left' },
								[
									createElement( 'h1', { key: 't', className: 'nexulesuite_ve-h1' }, 'Visual Editor' ),
									createElement(
										'div',
										{ key: 'm', className: 'nexulesuite_ve-metaRow' },
										[
											createElement(
												'span',
												{ key: 'chip', className: 'nexulesuite_ve-chipIndigo' },
												String( tagName || '' ).toUpperCase()
											),
											createElement( 'span', { key: 'sel', className: 'nexulesuite_ve-selectedHint' }, 'Selected element' ),
										]
									),
								]
							),
							createElement(
								'button',
								{ key: 'x', type: 'button', onClick: close, className: 'nexulesuite_ve-closeBtn', 'aria-label': 'Close' },
								icons.xMd
							),
						]
					)
				),
				createElement(
					'div',
					{ key: 'body', className: 'nexulesuite_ve-body', style: { flex: '1 1 auto', minHeight: 0 } },
					[
						createElement(
							'div',
							{ key: 'lnk' },
							[
								createElement(
									'label',
									{ key: 'lb', className: 'nexulesuite_ve-fieldLbl', htmlFor: 'nexulesuite_ve-link' },
									[ createElement( 'span', { key: 'i', className: 'nexulesuite_ve-fieldLblIcon' }, icons.link ), 'Link (optional)' ]
								),
								createElement( 'input', {
									key: 'in',
									id: 'nexulesuite_ve-link',
									className: 'nexulesuite_ve-input',
									type: 'text',
									value: link,
									onChange: function ( e ) { setLink( e.target.value ); },
									placeholder: 'https://example.com',
								} ),
							]
						),
						createElement(
							'div',
							{ key: 'pop' },
							[
								createElement(
									'label',
									{ key: 'lb', className: 'nexulesuite_ve-fieldLbl' },
									[
										createElement( 'span', { key: 'i', className: 'nexulesuite_ve-fieldLblIcon' }, icons.bell ),
										'Auto Popup / Notify classes (multi-select)',
									]
								),
								createElement(
									'div',
									{ key: 'box', className: 'nexulesuite_ve-dashBox' },
									[
										createElement( 'span', { key: 'brand', className: 'nexulesuite_ve-dashBrand' }, 'nexus' ),
										createElement( 'div', { key: 'row', className: 'nexulesuite_ve-chipRow' }, chips ),
										classGroups && classGroups.length
											? createElement(
												'div',
												{ key: 'pick' },
												[
													createElement( 'div', { key: 'al', className: 'nexulesuite_ve-availLbl' }, 'Available from settings' ),
												].concat(
													classGroups.map( function ( g ) {
														var rows = [];
														if ( g.popupClass ) rows.push( { kind: 'popup', cls: g.popupClass } );
														if ( g.notifyClasses && g.notifyClasses.length ) {
															for ( var ni = 0; ni < g.notifyClasses.length; ni++ ) {
																rows.push( { kind: 'mail', cls: g.notifyClasses[ ni ] } );
															}
														}
														return createElement(
															'div',
															{ key: g.eventId, style: { marginBottom: '10px' } },
															[
																createElement(
																	'div',
																	{ key: 'ev', style: { fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '6px' } },
																	g.eventId
																),
																createElement(
																	'div',
																	{ key: 'ch', className: 'nexulesuite_ve-chipRow' },
																	rows.map( function ( row ) {
																		var cls = row.cls;
																		var checked = selectedClasses.indexOf( cls ) !== -1;
																		var isPopup = row.kind === 'popup';
																		return createElement(
																			'button',
																			{
																				key: row.kind + ':' + cls,
																				type: 'button',
																				className:
																					'nexulesuite_ve-pickBtn' +
																					( checked ? ( isPopup ? ' nexulesuite_ve-onPopup' : ' nexulesuite_ve-onMail' ) : '' ),
																				onClick: function () { toggleFromPicker( cls ); },
																			},
																			( isPopup ? 'POPUP: ' : 'MAIL: ' ) + cls
																		);
																	} )
																),
															]
														);
													} )
												)
											)
											: createElement( 'div', { key: 'nocfg', style: { marginTop: '10px', color: ui.textMuted, fontSize: '12px', fontWeight: 700 } }, 'No classes configured in Settings → Button Classes.' ),
									]
								),
							]
						),
						createElement(
							'div',
							{ key: 'cust' },
							[
								createElement(
									'label',
									{ key: 'lb', className: 'nexulesuite_ve-fieldLbl', htmlFor: 'nexulesuite_ve-custom-class' },
									[
										createElement( 'span', { key: 'i', className: 'nexulesuite_ve-fieldLblIcon' }, icons.tag ),
										'Custom classes (optional)',
									]
								),
								createElement( 'input', {
									key: 'in',
									id: 'nexulesuite_ve-custom-class',
									ref: customInputRef,
									className: 'nexulesuite_ve-input',
									type: 'text',
									value: customClass,
									onChange: function ( e ) { setCustomClass( e.target.value ); },
									placeholder: 'e.g. my-extra-class another-class',
								} ),
							]
						),
						createElement(
							'div',
							{ key: 'cls' },
							[
								createElement( 'label', { key: 'l', className: 'nexulesuite_ve-fieldLbl', htmlFor: 'nexulesuite_ve-css-class' }, 'CSS Class' ),
								createElement( 'input', {
									key: 'i',
									id: 'nexulesuite_ve-css-class',
									className: 'nexulesuite_ve-input',
									type: 'text',
									value: selectedClasses.join( ' ' ),
									onChange: function ( e ) {
										var v = String( e.target.value || '' );
										setSelectedClasses( v.split( /\s+/ ).map( function ( s ) { return s.trim(); } ).filter( Boolean ) );
									},
									placeholder: 'Selected classes (space-separated)',
								} ),
							]
						),
						createElement(
							'div',
							{ key: 'id' },
							[
								createElement( 'label', { key: 'l', className: 'nexulesuite_ve-fieldLbl', htmlFor: 'nexulesuite_ve-css-id' }, 'ID' ),
								createElement( 'input', {
									key: 'i',
									id: 'nexulesuite_ve-css-id',
									className: 'nexulesuite_ve-input',
									type: 'text',
									value: cssId,
									onChange: function ( e ) { setCssId( e.target.value ); },
									placeholder: 'e.g. hero-cta',
								} ),
							]
						),
						status
							? createElement(
								'p',
								{
									key: 'st',
									className: 'nexulesuite_ve-status nexulesuite_ve-statusErr',
								},
								status
							)
							: null,
					].filter( Boolean )
				),
				createElement(
					'footer',
					{ key: 'ft', className: 'nexulesuite_ve-footer' },
					[
						createElement(
							'button',
							{ key: 'save', type: 'button', onClick: save, disabled: busy, className: 'nexulesuite_ve-btn nexulesuite_ve-btnPrimary' },
							[ icons.save, busy ? 'Saving…' : 'Save Changes' ]
						),
						createElement(
							'button',
							{ key: 'cancel', type: 'button', onClick: close, className: 'nexulesuite_ve-btn nexulesuite_ve-btnGhost' },
							'Cancel'
						),
					]
				)
			),
				successCard
			);
		}

		wp.element.render( createElement( Menu ), root );
	}

	function onClick( e ) {
		if ( e.button !== 0 ) return;
		if ( isEditorUi( e.target ) ) return;
		if ( ! last ) return;

		e.preventDefault();
		e.stopPropagation();

		if ( ! last.__nexulesuite_VeOriginalOuterHTML ) {
			try {
				last.__nexulesuite_VeOriginalOuterHTML = snapshotOuterHtml( last );
			} catch ( ex ) {}
		}

		var initialLink = '';
		try {
			var linkNode = last;
			if ( linkNode && String( linkNode.tagName || '' ).toLowerCase() !== 'a' && linkNode.parentElement ) {
				var linkPa = linkNode.parentElement;
				if ( String( linkPa.tagName || '' ).toLowerCase() === 'a' && linkPa.children.length === 1 ) {
					linkNode = linkPa;
				}
			}
			if ( linkNode && String( linkNode.tagName || '' ).toLowerCase() === 'a' && linkNode.getAttribute ) {
				initialLink = linkNode.getAttribute( 'href' ) || '';
			}
		} catch ( ex2 ) {}

		mountMenu( {
			target: last,
			anchor: { x: e.clientX, y: e.clientY },
			initial: {
				cssClass: last.getAttribute ? last.getAttribute( 'class' ) || '' : '',
				cssId: last.getAttribute ? last.getAttribute( 'id' ) || '' : '',
				link: initialLink,
			},
		} );
	}

	document.addEventListener( 'mousemove', onMove, { passive: true } );
	document.addEventListener( 'click', onClick, true );
	window.addEventListener( 'blur', clearOutline );
} )();

