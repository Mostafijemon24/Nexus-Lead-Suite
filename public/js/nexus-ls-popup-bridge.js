/**
 * Popup manual-click bridge + notify triggers.
 * Matches overlays by data-event OR data-popup-id (trimmed; optional case-insensitive).
 *
 * @package Nexus_Lead_Suite
 */
(function () {
	'use strict';

	var cfg = window.nexusLsPopupBridgeCfg || {};

	window.NexusLsPopupUi = window.NexusLsPopupUi || {};

	function norm( s ) {
		s = String( s || '' ).trim();
		// Accept common admin/user variants: "#event", "popup:event", "POPUP:event".
		if ( s.charAt( 0 ) === '#' ) {
			s = s.slice( 1 ).trim();
		}
		if ( s.slice( 0, 5 ).toLowerCase() === 'popup:' ) {
			s = s.slice( 5 ).trim();
		}
		return s;
	}

	function equalsLoose( a, b ) {
		a = norm( a );
		b = norm( b );
		if ( ! a || ! b ) {
			return false;
		}
		if ( a === b ) {
			return true;
		}
		return a.toLowerCase() === b.toLowerCase();
	}

	window.NexusLsPopupUi.findOverlayByEventId = function ( want ) {
		want = norm( want );
		if ( ! want ) {
			return null;
		}
		var nodes = document.querySelectorAll( '.nexus-popup-overlay' );
		var i;
		var node;
		var ev;
		var pid;
		for ( i = 0; i < nodes.length; i++ ) {
			node = nodes[ i ];
			ev = norm( node.getAttribute( 'data-event' ) );
			pid = norm( node.getAttribute( 'data-popup-id' ) );
			if ( equalsLoose( want, ev ) || equalsLoose( want, pid ) ) {
				return node;
			}
		}
		return null;
	};

	window.NexusLsPopupUi.open = function ( el, openContext ) {
		if ( ! el || el.classList.contains( 'nexus-popup--open' ) ) {
			return;
		}
		el.classList.add( 'nexus-popup--open' );
		el.setAttribute( 'aria-hidden', 'false' );
		document.body.style.overflow = 'hidden';
		try {
			var evn =
				norm( el.getAttribute( 'data-event' ) ) ||
				norm( el.getAttribute( 'data-popup-id' ) );
			if ( window.NexusLsTrack && typeof window.NexusLsTrack.push === 'function' ) {
				var openMeta = { popup_event: evn };
				var label = '';
				var openSource = 'click';
				var autoTrigger = '';

				if ( typeof openContext === 'string' ) {
					label = trimClickLabel( openContext );
				} else if ( openContext && typeof openContext === 'object' ) {
					label = trimClickLabel( openContext.label || '' );
					openSource = openContext.source === 'auto' ? 'auto' : 'click';
					autoTrigger = trimClickLabel( openContext.autoTrigger || '' );
				}

				if ( label ) {
					openMeta.label = label;
				}
				if ( 'auto' === openSource ) {
					openMeta.open_source = 'auto';
					if ( autoTrigger ) {
						openMeta.auto_trigger = autoTrigger;
					}
				}
				window.NexusLsTrack.push( { type: 'popup_open', meta: openMeta } );
				if ( typeof window.NexusLsTrack.flush === 'function' ) {
					window.NexusLsTrack.flush();
				}
			}
		} catch ( _err ) {}
	};

	window.NexusLsPopupUi.close = function ( el ) {
		if ( ! el ) {
			return;
		}
		el.classList.remove( 'nexus-popup--open' );
		el.setAttribute( 'aria-hidden', 'true' );
		document.body.style.overflow = '';
		if ( typeof window.nexusLsResetPopupFormResult === 'function' ) {
			window.nexusLsResetPopupFormResult( el );
		}
	};

	function buildEventOverlayMap() {
		var out = Object.create( null );
		var nodes = document.querySelectorAll( '.nexus-popup-overlay' );
		for ( var i = 0; i < nodes.length; i++ ) {
			var node = nodes[ i ];
			var ev = norm( node.getAttribute( 'data-event' ) );
			if ( ev ) {
				out[ ev ] = node;
				out[ ev.toLowerCase() ] = node;
			}
			var pid = norm( node.getAttribute( 'data-popup-id' ) );
			if ( pid ) {
				out[ pid ] = node;
				out[ pid.toLowerCase() ] = node;
			}
		}
		return out;
	}

	function findPopupByClassOnTarget( target, map ) {
		if ( ! target || ! map ) return null;
		// Do not trigger when clicking inside an open popup.
		if ( target.closest && target.closest( '.nexus-popup-overlay' ) ) return null;

		var node = target;
		var hop = 0;
		while ( node && node !== document.body && hop < 12 ) {
			hop++;
			if ( node.classList && node.classList.length ) {
				for ( var i = 0; i < node.classList.length; i++ ) {
					var cls = node.classList.item( i );
					if ( ! cls ) continue;
					var key = norm( cls );
					if ( key && map[ key ] ) return map[ key ];
					var low = key && key.toLowerCase ? key.toLowerCase() : '';
					if ( low && map[ low ] ) return map[ low ];
				}
			}
			node = node.parentElement;
		}
		return null;
	}

	var __nexusPopupEventMap = null;
	var __nexusClassToEvent = null;
	var __nexusNotifyClassToEvent = null;
	var __nexusPopupClassToEvent = null;

	function shouldAllowDefaultNavigation( node ) {
		if ( ! node ) return false;
		if ( node.tagName !== 'A' ) return false;
		var hrefRaw = norm( node.getAttribute( 'href' ) ) || '';
		return (
			hrefRaw.indexOf( 'tel:' ) === 0 ||
			hrefRaw.indexOf( 'mailto:' ) === 0 ||
			hrefRaw.indexOf( 'http://' ) === 0 ||
			hrefRaw.indexOf( 'https://' ) === 0
		);
	}

	function trimClickLabel( t ) {
		t = String( t || '' ).trim().replace( /\s+/g, ' ' );
		if ( ! t ) {
			return '';
		}
		if ( t.length > 120 ) {
			return t.slice( 0, 117 ) + '…';
		}
		return t;
	}

	function isGenericTagLabel( t ) {
		return /^(A|BUTTON|INPUT|DIV|SPAN|IMG|I|SVG)$/i.test( String( t || '' ).trim() );
	}

	function textFromClickNode( node ) {
		if ( ! node || node.nodeType !== 1 ) {
			return '';
		}
		var tag = String( node.tagName || '' ).toUpperCase();
		if ( tag === 'INPUT' ) {
			var submitVal = trimClickLabel( node.value || node.getAttribute( 'value' ) || '' );
			if ( submitVal ) {
				return submitVal;
			}
		}
		var t = trimClickLabel( node.innerText || node.textContent || '' );
		if ( t && ! isGenericTagLabel( t ) ) {
			return t;
		}
		return '';
	}

	function clickControlOf( target ) {
		if ( ! target || ! target.closest ) {
			return null;
		}
		return target.closest(
			'a[href],button,[role="button"],input[type="submit"],input[type="button"]'
		);
	}

	function clickLabelOf( target ) {
		var el = clickControlOf( target );
		if ( ! el ) {
			return '';
		}

		var candidates = [];
		if ( target && el.contains && el.contains( target ) ) {
			var hop = target;
			while ( hop && hop !== el ) {
				candidates.push( hop );
				hop = hop.parentElement;
			}
		}
		candidates.push( el );

		var i;
		for ( i = 0; i < candidates.length; i++ ) {
			var t = textFromClickNode( candidates[ i ] );
			if ( t ) {
				return t;
			}
		}

		var aria = el.getAttribute( 'aria-label' ) || el.getAttribute( 'aria-labelledby' );
		if ( aria ) {
			aria = trimClickLabel( aria );
			if ( aria && ! isGenericTagLabel( aria ) ) {
				return aria;
			}
		}
		if ( el.title ) {
			var title = trimClickLabel( el.title );
			if ( title && ! isGenericTagLabel( title ) ) {
				return title;
			}
		}

		return '';
	}

	function fireNotifyForEvent( trigId, notifyLabel ) {
		if ( ! trigId || ! cfg.ajaxUrl ) {
			return;
		}
		var fd = new FormData();
		fd.append( 'action', 'nexus_ls_trigger_notify' );
		fd.append( 'nonce', cfg.notifyNonce || '' );
		fd.append( 'trigger_id', trigId );
		fd.append( 'notify_label', notifyLabel || trigId );
		fd.append( 'page_url', window.location.href );
		try {
			if ( typeof navigator.sendBeacon === 'function' && navigator.sendBeacon( cfg.ajaxUrl, fd ) ) {
				return;
			}
		} catch ( _beaconErr ) {}
		fetch( cfg.ajaxUrl, {
			method: 'POST',
			body: fd,
			credentials: 'same-origin',
			keepalive: true,
		} ).catch( function () {} );
	}

	document.addEventListener(
		'click',
		function ( e ) {
			// Lazy-build overlay map (popups are rendered in footer).
			if ( ! __nexusPopupEventMap ) {
				__nexusPopupEventMap = buildEventOverlayMap();
			}
			if ( ! __nexusClassToEvent ) {
				__nexusClassToEvent = cfg && cfg.classMap ? cfg.classMap : null;
			}
			if ( ! __nexusPopupClassToEvent ) {
				__nexusPopupClassToEvent = cfg && cfg.popupClassMap ? cfg.popupClassMap : null;
			}
			if ( ! __nexusNotifyClassToEvent ) {
				__nexusNotifyClassToEvent = cfg && cfg.notifyClassMap ? cfg.notifyClassMap : null;
			}

		/*
		 * Visual Editor support (Settings → Button Classes):
		 * - popupClassMap: first class in the line => popup open
		 * - notifyClassMap: remaining classes => email click notify
		 *
		 * If both classes are present on the same element, do both (notify + popup).
		 * Popup always blocks navigation. Notify-only with a real href allows navigation.
		 */
		var popupEvent =
			__nexusPopupClassToEvent ? findPopupByClassOnTarget( e.target, __nexusPopupClassToEvent ) : null;
		var notifyEvent =
			__nexusNotifyClassToEvent ? findPopupByClassOnTarget( e.target, __nexusNotifyClassToEvent ) : null;

		var clickLabel = clickLabelOf( e.target );

		if ( notifyEvent ) {
			fireNotifyForEvent( notifyEvent, clickLabel || notifyEvent );
		}

		var notifyNavAnchor = e.target.closest ? e.target.closest( 'a[href]' ) : null;
		var notifyAllowsRealLink =
			notifyEvent &&
			notifyNavAnchor &&
			shouldAllowDefaultNavigation( notifyNavAnchor );

		if ( popupEvent && ! ( notifyAllowsRealLink && notifyEvent === popupEvent ) ) {
			var overlay =
				window.NexusLsPopupUi &&
				typeof window.NexusLsPopupUi.findOverlayByEventId === 'function'
					? window.NexusLsPopupUi.findOverlayByEventId( popupEvent )
					: null;
			if ( overlay ) {
				e.preventDefault();
				e.stopPropagation();
				window.NexusLsPopupUi.open( overlay, clickLabel );
				return;
			}
		}

		// Notify + real tel/mailto/http(s) link: email sent above; keep default navigation.
		if ( notifyAllowsRealLink ) {
			return;
		}

			// Back-compat: direct match class==eventId (older setups).
			var popupByClass = findPopupByClassOnTarget( e.target, __nexusPopupEventMap );
			if ( popupByClass ) {
				e.preventDefault();
				e.stopPropagation();
				window.NexusLsPopupUi.open( popupByClass, clickLabel );
				return;
			}

			var el = e.target.closest( '[data-nexas-trigger]' );
			if ( ! el ) {
				return;
			}
			var raw = norm( String( el.getAttribute( 'data-nexas-trigger' ) || '' ).trim() );
			if ( ! raw ) {
				return;
			}
			var parts = raw.split( ',' );
			if ( parts.length >= 2 ) {
				var trigId = norm( parts[ 0 ] );
				var notifyLabel = norm( parts.slice( 1 ).join( ',' ) );
				var resolvedNotifyLabel = clickLabel || notifyLabel;

				function fireNotify() {
					fireNotifyForEvent( trigId, resolvedNotifyLabel );
				}

				var hrefRaw = norm( el.getAttribute( 'href' ) ) || '';

				var popup =
					trigId &&
					window.NexusLsPopupUi &&
					typeof window.NexusLsPopupUi.findOverlayByEventId === 'function'
						? window.NexusLsPopupUi.findOverlayByEventId( trigId )
						: null;

				fireNotify();

				if ( popup ) {
					e.preventDefault();
					e.stopPropagation();
					window.NexusLsPopupUi.open( popup, clickLabel || notifyLabel );
					return;
				}

				/* Real links: keep tel / mailto / http(s) navigation while still sending notify. */
				var allowDefault =
					el.tagName === 'A' &&
					( hrefRaw.indexOf( 'tel:' ) === 0 ||
						hrefRaw.indexOf( 'mailto:' ) === 0 ||
						hrefRaw.indexOf( 'http://' ) === 0 ||
						hrefRaw.indexOf( 'https://' ) === 0 );

				if ( allowDefault ) {
					return;
				}

				if ( el.tagName === 'A' && ( hrefRaw === '#' || hrefRaw === '' ) ) {
					e.preventDefault();
					return;
				}

				e.preventDefault();
				return;
			}
			var evName = norm( parts[ 0 ] );
			var popup =
				window.NexusLsPopupUi &&
				typeof window.NexusLsPopupUi.findOverlayByEventId === 'function'
					? window.NexusLsPopupUi.findOverlayByEventId( evName )
					: null;
			var hrefRaw = norm( el.getAttribute( 'href' ) );
			if ( popup ) {
				e.preventDefault();
				e.stopPropagation();
				window.NexusLsPopupUi.open( popup, clickLabel );
			} else if ( evName && parts.length === 1 && ( hrefRaw === '' || hrefRaw === '#' ) ) {
				/* Popup configured but overlay missing / mismatch — avoid broken empty href or hash jump. */
				e.preventDefault();
			}
		},
		true
	);
})();
