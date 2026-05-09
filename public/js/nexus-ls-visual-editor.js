( function () {
	'use strict';

	var cfg = window.nexusLsVeCfg || {};
	if ( ! cfg || ! cfg.endpoint || ! ( window.wp && wp.element ) ) {
		return;
	}

	var __classGroups = []; // Optional; kept for future compatibility.

	function isEditorUi( node ) {
		if ( ! node ) return false;
		try {
			if ( node.id === 'nexus-ls-ve-root' ) return true;
			if ( node.closest && node.closest( '#nexus-ls-ve-root' ) ) return true;
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

	var raf = 0;
	var last = null;
	var lastOutline = '';
	var lastOutlineOffset = '';

	function clearOutline() {
		if ( ! last ) return;
		try {
			last.style.outline = lastOutline || '';
			last.style.outlineOffset = lastOutlineOffset || '';
		} catch ( e ) {}
		last = null;
		lastOutline = '';
		lastOutlineOffset = '';
	}

	function applyOutline( node ) {
		if ( ! node || node === last ) return;
		clearOutline();
		last = node;
		try {
			lastOutline = node.style.outline || '';
			lastOutlineOffset = node.style.outlineOffset || '';
			node.style.outline = '2px solid #4f46e5';
			node.style.outlineOffset = '2px';
		} catch ( e ) {}
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
		var root = document.getElementById( 'nexus-ls-ve-root' );
		if ( root ) return root;
		root = document.createElement( 'div' );
		root.id = 'nexus-ls-ve-root';
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

					// Keep the same semantics as the backend parser:
					// first => popup, remaining => notify/mail.
					out.push( {
						eventId: eventId,
						popupClass: clsParts[ 0 ],
						notifyClasses: clsParts.slice( 1 ),
					} );
				}
				return out;
			}, [] );

			var css = useMemo( function () {
				return (
					'' +
					'.nexus-ve *{box-sizing:border-box}' +
					'.nexus-ve input.nexus-ve-input{width:100%;height:46px;border:1px solid ' +
					ui.border +
					';border-radius:' +
					ui.radiusSm +
					'px;padding:0 14px;background:' +
					ui.bgSubtle +
					';outline:none;font-size:13px;color:#475569;box-shadow:none;transition:border-color .15s ease,box-shadow .15s ease}' +
					'.nexus-ve input.nexus-ve-input::placeholder{color:#cbd5e1}' +
					'.nexus-ve input.nexus-ve-input:focus{border-color:' +
					ui.indigoText +
					';box-shadow:0 0 0 4px rgba(79,70,229,.12)}' +
					'.nexus-ve .nexus-ve-header{padding:20px 22px 18px;border-bottom:1px solid ' +
					ui.borderSoft +
					';background:linear-gradient(180deg,#ffffff 0%,' +
					ui.bgSoft +
					' 100%)}' +
					'.nexus-ve .nexus-ve-h1{margin:0;font-size:20px;font-weight:800;color:#1e293b;letter-spacing:-.02em}' +
					'.nexus-ve .nexus-ve-metaRow{display:flex;align-items:center;gap:8px;margin-top:6px;flex-wrap:wrap}' +
					'.nexus-ve .nexus-ve-chipIndigo{display:inline-flex;align-items:center;padding:2px 8px;border-radius:6px;background:' +
					ui.indigoBg +
					';color:' +
					ui.indigoText +
					';font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}' +
					'.nexus-ve .nexus-ve-selectedHint{font-size:12px;color:#94a3b8;font-weight:600;font-style:italic}' +
					'.nexus-ve .nexus-ve-closeBtn{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border:0;border-radius:999px;background:transparent;color:#94a3b8;cursor:pointer;transition:background .15s ease,color .15s ease}' +
					'.nexus-ve .nexus-ve-closeBtn:hover{background:#f1f5f9;color:#64748b}' +
					'.nexus-ve .nexus-ve-body{padding:22px;display:flex;flex-direction:column;gap:22px;overflow-y:auto;min-height:0;-webkit-overflow-scrolling:touch}' +
					'.nexus-ve .nexus-ve-fieldLbl{display:flex;align-items:center;gap:8px;margin:0 0 8px;font-size:13px;font-weight:700;color:#334155}' +
					'.nexus-ve .nexus-ve-fieldLblIcon{color:#cbd5e1;line-height:0;display:inline-flex}' +
					'.nexus-ve .nexus-ve-dashBox{border:1px dashed #cbd5e1;border-radius:' +
					ui.radiusSm +
					'px;background:' +
					ui.bgSubtle +
					';padding:14px 14px 12px;min-height:96px}' +
					'.nexus-ve .nexus-ve-dashBrand{display:block;font-size:10px;font-weight:800;color:#94a3b8;letter-spacing:.2em;text-transform:uppercase;margin:0 0 10px}' +
					'.nexus-ve .nexus-ve-chipRow{display:flex;flex-wrap:wrap;gap:8px;align-items:center}' +
					'.nexus-ve .nexus-ve-tagPill{display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:8px;background:#fff;border:1px solid ' +
					ui.border +
					';box-shadow:0 1px 2px rgba(15,23,42,.05);font-size:12px;font-weight:800;color:#334155}' +
					'.nexus-ve .nexus-ve-tagX{border:0;background:transparent;padding:0;margin:0;cursor:pointer;color:#cbd5e1;line-height:0;display:inline-flex;align-items:center;justify-content:center}' +
					'.nexus-ve .nexus-ve-tagX:hover{color:#ef4444}' +
					'.nexus-ve .nexus-ve-addGhost{display:inline-flex;align-items:center;padding:6px 10px;border-radius:8px;border:1px dashed #cbd5e1;background:transparent;color:#94a3b8;font-size:12px;font-weight:600;cursor:pointer;transition:border-color .15s ease,color .15s ease}' +
					'.nexus-ve .nexus-ve-addGhost:hover{border-color:' +
					ui.indigoText +
					';color:' +
					ui.indigoText +
					'}' +
					'.nexus-ve .nexus-ve-availLbl{font-size:11px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em;margin:12px 0 8px}' +
					'.nexus-ve .nexus-ve-pickBtn{height:28px;padding:0 10px;border-radius:999px;border:1px solid ' +
					ui.border +
					';background:#fff;color:#475569;font-size:11px;font-weight:800;cursor:pointer;transition:border-color .15s ease,background .15s ease,color .15s ease}' +
					'.nexus-ve .nexus-ve-pickBtn.nexus-ve-onPopup{border-color:#bfdbfe;background:#eff6ff;color:#1d4ed8}' +
					'.nexus-ve .nexus-ve-pickBtn.nexus-ve-onMail{border-color:#fde68a;background:#fffbeb;color:#b45309}' +
					'.nexus-ve .nexus-ve-footer{padding:22px;display:flex;gap:12px;background:rgba(248,250,252,.65);border-top:1px solid ' +
					ui.borderSoft +
					'}' +
					'.nexus-ve button.nexus-ve-btn{flex:1;height:46px;border-radius:' +
					ui.radiusSm +
					'px;font-size:13px;font-weight:800;cursor:pointer;transition:transform .12s ease,filter .15s ease,opacity .15s ease,background .15s ease,border-color .15s ease,box-shadow .15s ease;display:inline-flex;align-items:center;justify-content:center;gap:8px}' +
					'.nexus-ve button.nexus-ve-btn:active{transform:scale(.98)}' +
					'.nexus-ve button.nexus-ve-btnPrimary{border:0;color:#fff;background:linear-gradient(180deg,#0f172a 0%,#020617 100%);box-shadow:0 12px 28px rgba(15,23,42,.18)}' +
					'.nexus-ve button.nexus-ve-btnPrimary:hover{filter:brightness(1.06)}' +
					'.nexus-ve button.nexus-ve-btnPrimary:disabled{opacity:.65;cursor:not-allowed;transform:none}' +
					'.nexus-ve button.nexus-ve-btnGhost{flex:0 auto;min-width:108px;padding:0 18px;border:1px solid ' +
					ui.border +
					';background:#fff;color:#475569;box-shadow:none;font-weight:800}' +
					'.nexus-ve button.nexus-ve-btnGhost:hover{background:' +
					ui.bgSubtle +
					'}' +
					'.nexus-ve .nexus-ve-status{margin:0;font-size:12px;line-height:1.45;font-weight:600}' +
					'.nexus-ve .nexus-ve-statusOk{color:#059669}' +
					'.nexus-ve .nexus-ve-statusErr{color:#b91c1c}'
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
					fontFamily: 'system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif',
					backdropFilter: 'blur(10px)',
				};
			}, [ anchor.x, anchor.y, ui ] );

			var tagName = target && target.tagName ? String( target.tagName ).toLowerCase() : 'element';

			function close() {
				try {
					wp.element.unmountComponentAtNode( root );
				} catch ( e ) {}
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

				var originalHtml = '';
				try {
					originalHtml = target.__nexusVeOriginalOuterHTML || target.outerHTML;
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
					if ( attrs.href ) {
						if ( String( target.tagName || '' ).toLowerCase() === 'a' ) {
							target.setAttribute( 'href', attrs.href );
						}
					} else {
						if ( String( target.tagName || '' ).toLowerCase() === 'a' ) {
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
						setStatus( 'Saved (page patch). Reload without the editor to confirm for visitors.' );
					} else {
						setStatus( 'Saved successfully.' );
					}
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
					{ key: it.id, className: 'nexus-ve-tagPill' },
					[
						createElement( 'span', { key: 'l' }, it.label ),
						createElement(
							'button',
							{
								key: 'x',
								type: 'button',
								className: 'nexus-ve-tagX',
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
					{ key: 'add', type: 'button', className: 'nexus-ve-addGhost', onClick: focusCustomInput },
					'+ Add New'
				)
			);

			return createElement(
				'div',
				{ className: 'nexus-ve', style: style, role: 'dialog', 'aria-modal': 'true' },
				createElement( 'style', { key: 'css', dangerouslySetInnerHTML: { __html: css } } ),
				createElement(
					'header',
					{ key: 'hdr', className: 'nexus-ve-header' },
					createElement(
						'div',
						{ style: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' } },
						[
							createElement(
								'div',
								{ key: 'left' },
								[
									createElement( 'h1', { key: 't', className: 'nexus-ve-h1' }, 'Visual Editor' ),
									createElement(
										'div',
										{ key: 'm', className: 'nexus-ve-metaRow' },
										[
											createElement(
												'span',
												{ key: 'chip', className: 'nexus-ve-chipIndigo' },
												String( tagName || '' ).toUpperCase()
											),
											createElement( 'span', { key: 'sel', className: 'nexus-ve-selectedHint' }, 'Selected element' ),
										]
									),
								]
							),
							createElement(
								'button',
								{ key: 'x', type: 'button', onClick: close, className: 'nexus-ve-closeBtn', 'aria-label': 'Close' },
								icons.xMd
							),
						]
					)
				),
				createElement(
					'div',
					{ key: 'body', className: 'nexus-ve-body', style: { flex: '1 1 auto', minHeight: 0 } },
					[
						createElement(
							'div',
							{ key: 'lnk' },
							[
								createElement(
									'label',
									{ key: 'lb', className: 'nexus-ve-fieldLbl', htmlFor: 'nexus-ve-link' },
									[ createElement( 'span', { key: 'i', className: 'nexus-ve-fieldLblIcon' }, icons.link ), 'Link (optional)' ]
								),
								createElement( 'input', {
									key: 'in',
									id: 'nexus-ve-link',
									className: 'nexus-ve-input',
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
									{ key: 'lb', className: 'nexus-ve-fieldLbl' },
									[
										createElement( 'span', { key: 'i', className: 'nexus-ve-fieldLblIcon' }, icons.bell ),
										'Auto Popup / Notify classes (multi-select)',
									]
								),
								createElement(
									'div',
									{ key: 'box', className: 'nexus-ve-dashBox' },
									[
										createElement( 'span', { key: 'brand', className: 'nexus-ve-dashBrand' }, 'nexus' ),
										createElement( 'div', { key: 'row', className: 'nexus-ve-chipRow' }, chips ),
										classGroups && classGroups.length
											? createElement(
												'div',
												{ key: 'pick' },
												[
													createElement( 'div', { key: 'al', className: 'nexus-ve-availLbl' }, 'Available from settings' ),
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
																	{ key: 'ch', className: 'nexus-ve-chipRow' },
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
																					'nexus-ve-pickBtn' +
																					( checked ? ( isPopup ? ' nexus-ve-onPopup' : ' nexus-ve-onMail' ) : '' ),
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
									{ key: 'lb', className: 'nexus-ve-fieldLbl', htmlFor: 'nexus-ve-custom-class' },
									[
										createElement( 'span', { key: 'i', className: 'nexus-ve-fieldLblIcon' }, icons.tag ),
										'Custom classes (optional)',
									]
								),
								createElement( 'input', {
									key: 'in',
									id: 'nexus-ve-custom-class',
									ref: customInputRef,
									className: 'nexus-ve-input',
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
								createElement( 'label', { key: 'l', className: 'nexus-ve-fieldLbl', htmlFor: 'nexus-ve-css-class' }, 'CSS Class' ),
								createElement( 'input', {
									key: 'i',
									id: 'nexus-ve-css-class',
									className: 'nexus-ve-input',
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
								createElement( 'label', { key: 'l', className: 'nexus-ve-fieldLbl', htmlFor: 'nexus-ve-css-id' }, 'ID' ),
								createElement( 'input', {
									key: 'i',
									id: 'nexus-ve-css-id',
									className: 'nexus-ve-input',
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
									className:
										'nexus-ve-status ' + ( status.indexOf( 'Saved' ) === 0 ? 'nexus-ve-statusOk' : 'nexus-ve-statusErr' ),
								},
								status
							)
							: null,
					].filter( Boolean )
				),
				createElement(
					'footer',
					{ key: 'ft', className: 'nexus-ve-footer' },
					[
						createElement(
							'button',
							{ key: 'save', type: 'button', onClick: save, disabled: busy, className: 'nexus-ve-btn nexus-ve-btnPrimary' },
							[ icons.save, busy ? 'Saving…' : 'Save Changes' ]
						),
						createElement(
							'button',
							{ key: 'cancel', type: 'button', onClick: close, className: 'nexus-ve-btn nexus-ve-btnGhost' },
							'Cancel'
						),
					]
				)
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

		if ( ! last.__nexusVeOriginalOuterHTML ) {
			try {
				last.__nexusVeOriginalOuterHTML = last.outerHTML;
			} catch ( ex ) {}
		}

		mountMenu( {
			target: last,
			anchor: { x: e.clientX, y: e.clientY },
			initial: {
				cssClass: last.getAttribute ? last.getAttribute( 'class' ) || '' : '',
				cssId: last.getAttribute ? last.getAttribute( 'id' ) || '' : '',
				link:
					last.tagName && String( last.tagName ).toLowerCase() === 'a' && last.getAttribute
						? last.getAttribute( 'href' ) || ''
						: '',
			},
		} );
	}

	document.addEventListener( 'mousemove', onMove, { passive: true } );
	document.addEventListener( 'click', onClick, true );
	window.addEventListener( 'blur', clearOutline );
} )();

