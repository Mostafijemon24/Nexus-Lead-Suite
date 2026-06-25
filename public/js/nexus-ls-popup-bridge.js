/**
 * Popup manual-click bridge + notify triggers.
 * Matches overlays by data-event OR data-popup-id (trimmed; optional case-insensitive).
 *
 * @package nexulesuite_
 */
(function () {
	'use strict';

	var cfg = window.nexulesuite_PopupBridgeCfg || {};
	var trackUtils = window.nexulesuite_TrackUtils || null;

	window.nexulesuite_PopupUi = window.nexulesuite_PopupUi || {};

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

	window.nexulesuite_PopupUi.findOverlayByEventId = function ( want ) {
		want = norm( want );
		if ( ! want ) {
			return null;
		}
		var nodes = document.querySelectorAll( '.nexulesuite_popup-overlay' );
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

	window.nexulesuite_PopupUi.open = function ( el, openContext ) {
		if ( ! el || el.classList.contains( 'nexulesuite_popup--open' ) ) {
			return;
		}
		el.classList.add( 'nexulesuite_popup--open' );
		el.setAttribute( 'aria-hidden', 'false' );
		document.body.style.overflow = 'hidden';

		var openSource = 'click';
		var autoTrigger = '';
		var label = '';

		if ( typeof openContext === 'string' ) {
			label = trimClickLabel( openContext );
		} else if ( openContext && typeof openContext === 'object' ) {
			label = trimClickLabel( openContext.label || '' );
			openSource = openContext.source === 'auto' ? 'auto' : 'click';
			autoTrigger = trimClickLabel( openContext.autoTrigger || '' );
		}

		// Auto popups (timer / scroll / exit): open UI only — no track, no REST.
		if ( 'auto' === openSource ) {
			return;
		}

		try {
			var evn =
				norm( el.getAttribute( 'data-event' ) ) ||
				norm( el.getAttribute( 'data-popup-id' ) );
			if ( window.nexulesuite_Track && typeof window.nexulesuite_Track.push === 'function' ) {
				var openMeta = {
					popup_event: evn,
					open_source: 'click',
				};
				if ( label ) {
					openMeta.label = label;
					if ( evn && label.toLowerCase() !== evn.toLowerCase() ) {
						openMeta.popup_title = label;
					}
				}
				if ( trackUtils && typeof trackUtils.debouncePush === 'function' ) {
					trackUtils.debouncePush(
						window.nexulesuite_Track,
						{ type: 'popup_open', meta: openMeta },
						el
					);
				} else {
					window.nexulesuite_Track.push( { type: 'popup_open', meta: openMeta } );
				}
				if ( typeof window.nexulesuite_Track.flush === 'function' ) {
					window.nexulesuite_Track.flush();
				}
			}
		} catch ( _err ) {}
	};

	window.nexulesuite_PopupUi.close = function ( el ) {
		if ( ! el ) {
			return;
		}
		el.classList.remove( 'nexulesuite_popup--open' );
		el.setAttribute( 'aria-hidden', 'true' );
		document.body.style.overflow = '';
		if ( typeof window.nexulesuite_ResetPopupFormResult === 'function' ) {
			window.nexulesuite_ResetPopupFormResult( el );
		}
	};

	function buildEventOverlayMap() {
		var out = Object.create( null );
		var nodes = document.querySelectorAll( '.nexulesuite_popup-overlay' );
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

	function findClassMatchNodeOnTarget( target, map ) {
		if ( ! target || ! map ) {
			return null;
		}
		// Do not trigger when clicking inside an open popup.
		if ( target.closest && target.closest( '.nexulesuite_popup-overlay' ) ) {
			return null;
		}

		var node = target;
		var hop = 0;
		while ( node && node !== document.body && hop < 12 ) {
			hop++;
			if ( node.classList && node.classList.length ) {
				for ( var i = 0; i < node.classList.length; i++ ) {
					var cls = node.classList.item( i );
					if ( ! cls ) {
						continue;
					}
					var key = norm( cls );
					if ( key && map[ key ] ) {
						return node;
					}
					var low = key && key.toLowerCase ? key.toLowerCase() : '';
					if ( low && map[ low ] ) {
						return node;
					}
				}
			}
			node = node.parentElement;
		}
		return null;
	}

	function findPopupByClassOnTarget( target, map ) {
		var matched = findClassMatchNodeOnTarget( target, map );
		if ( ! matched || ! map ) {
			return null;
		}
		var i;
		if ( matched.classList && matched.classList.length ) {
			for ( i = 0; i < matched.classList.length; i++ ) {
				var cls = matched.classList.item( i );
				if ( ! cls ) {
					continue;
				}
				var key = norm( cls );
				if ( key && map[ key ] ) {
					return map[ key ];
				}
				var low = key && key.toLowerCase ? key.toLowerCase() : '';
				if ( low && map[ low ] ) {
					return map[ low ];
				}
			}
		}
		return null;
	}

	function combinedActivityClassPresenceMap() {
		var out = Object.create( null );
		var maps = [ __nexulesuite_PopupClassToEvent, __nexulesuite_NotifyClassToEvent ];
		var mi;
		for ( mi = 0; mi < maps.length; mi++ ) {
			var m = maps[ mi ];
			if ( ! m ) {
				continue;
			}
			var k;
			for ( k in m ) {
				if ( Object.prototype.hasOwnProperty.call( m, k ) ) {
					out[ k ] = true;
				}
			}
		}
		return out;
	}

	var __nexulesuite_PopupEventMap = null;
	var __nexulesuite_ClassToEvent = null;
	var __nexulesuite_NotifyClassToEvent = null;
	var __nexulesuite_PopupClassToEvent = null;

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
		var el = target.closest(
			'a[href],button,[role="button"],input[type="submit"],input[type="button"],.nexulesuite_bottom-nav__btn,[data-nexulesuite_trigger],[data-nexulesuite_ve-wrap]'
		);
		if ( el ) {
			return el;
		}
		return findClassMatchNodeOnTarget( target, combinedActivityClassPresenceMap() );
	}

	function clickLabelOf( target ) {
		var el = clickControlOf( target );
		if ( ! el && target && target.closest ) {
			el = target.closest( '[data-nexulesuite_trigger]' );
		}
		if ( trackUtils && typeof trackUtils.resolveClickLabel === 'function' ) {
			var resolved = trackUtils.resolveClickLabel( el, target );
			if ( resolved ) {
				return resolved;
			}
		} else if ( el ) {
			var direct = textFromClickNode( el );
			if ( direct ) {
				return direct;
			}
		}
		if ( el && trackUtils && typeof trackUtils.parentMeaningfulText === 'function' ) {
			return trackUtils.parentMeaningfulText( el, 4 );
		}
		return '';
	}

	function markBridgeHandled( e ) {
		try {
			e.__nexulesuite_bridgeHandled = true;
		} catch ( _markErr ) {}
	}

	function acquireBridgeClickLock( e, control ) {
		if ( ! trackUtils || typeof trackUtils.tryAcquireLock !== 'function' ) {
			return true;
		}
		var lockEl = control || clickControlOf( e.target );
		if ( ! trackUtils.tryAcquireLock( lockEl, 'bridge-click' ) ) {
			e.preventDefault();
			e.stopPropagation();
			return false;
		}
		return true;
	}

	function fireNotifyForEvent( trigId, notifyPurpose, clickLabel ) {
		if ( ! trigId || ! cfg.ajaxUrl ) {
			return;
		}
		var visibleLabel = trimClickLabel( clickLabel || '' );
		var purpose = trimClickLabel( notifyPurpose || '' );
		if ( ! purpose || purpose.toLowerCase() === String( trigId || '' ).toLowerCase() ) {
			purpose = visibleLabel;
		}
		var actionLabel = visibleLabel;
		if ( ! actionLabel && purpose && purpose.toLowerCase() !== String( trigId || '' ).toLowerCase() ) {
			actionLabel = purpose;
		}
		var fd = new FormData();
		fd.append( 'action', 'nexulesuite_trigger_notify' );
		fd.append( 'nonce', cfg.notifyNonce || '' );
		fd.append( 'trigger_id', trigId );
		fd.append( 'notify_label', purpose || visibleLabel || trigId );
		fd.append( 'label', actionLabel );
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
			if ( e.__nexulesuite_bridgeHandled ) {
				return;
			}

			if ( trackUtils && typeof trackUtils.isExcludedPluginUiClick === 'function' ) {
				if ( trackUtils.isExcludedPluginUiClick( e.target ) ) {
					return;
				}
			}

			// Lazy-build overlay map (popups are rendered in footer).
			if ( ! __nexulesuite_PopupEventMap ) {
				__nexulesuite_PopupEventMap = buildEventOverlayMap();
			}
			if ( ! __nexulesuite_ClassToEvent ) {
				__nexulesuite_ClassToEvent = cfg && cfg.classMap ? cfg.classMap : null;
			}
			if ( ! __nexulesuite_PopupClassToEvent ) {
				__nexulesuite_PopupClassToEvent = cfg && cfg.popupClassMap ? cfg.popupClassMap : null;
			}
			if ( ! __nexulesuite_NotifyClassToEvent ) {
				__nexulesuite_NotifyClassToEvent = cfg && cfg.notifyClassMap ? cfg.notifyClassMap : null;
			}

		/*
		 * Visual Editor support (Settings → Button Classes):
		 * - popupClassMap: first class in the line => popup open
		 * - notifyClassMap: remaining classes => email click notify
		 *
		 * When both classes are on the same element, popup_open carries email (one row, one email).
		 * Popup always blocks navigation. Notify-only with a real href allows navigation.
		 */
		var popupEvent =
			__nexulesuite_PopupClassToEvent ? findPopupByClassOnTarget( e.target, __nexulesuite_PopupClassToEvent ) : null;
		var notifyEvent =
			__nexulesuite_NotifyClassToEvent ? findPopupByClassOnTarget( e.target, __nexulesuite_NotifyClassToEvent ) : null;

		var clickLabel = clickLabelOf( e.target );
		var clickControl = clickControlOf( e.target );

		var notifyNavAnchor = e.target.closest ? e.target.closest( 'a[href]' ) : null;
		var notifyAllowsRealLink =
			notifyEvent &&
			! popupEvent &&
			notifyNavAnchor &&
			shouldAllowDefaultNavigation( notifyNavAnchor );

		if ( popupEvent && ! ( notifyAllowsRealLink && notifyEvent === popupEvent ) ) {
			if ( ! acquireBridgeClickLock( e, clickControl ) ) {
				return;
			}
			var overlay =
				window.nexulesuite_PopupUi &&
				typeof window.nexulesuite_PopupUi.findOverlayByEventId === 'function'
					? window.nexulesuite_PopupUi.findOverlayByEventId( popupEvent )
					: null;
			if ( overlay ) {
				e.preventDefault();
				e.stopPropagation();
				markBridgeHandled( e );
				// popup_open (with open_source click) sends the single email — skip separate notify AJAX.
				window.nexulesuite_PopupUi.open( overlay, clickLabel );
				return;
			}
		}

		if ( notifyEvent && ! popupEvent ) {
			if ( ! acquireBridgeClickLock( e, clickControl ) ) {
				return;
			}
			markBridgeHandled( e );
			fireNotifyForEvent( notifyEvent, '', clickLabel );
		}

		// Notify + real tel/mailto/http(s) link: email sent above; keep default navigation.
		if ( notifyAllowsRealLink ) {
			return;
		}

			// Back-compat: direct match class==eventId (older setups).
			var popupByClass = findPopupByClassOnTarget( e.target, __nexulesuite_PopupEventMap );
			if ( popupByClass ) {
				if ( ! acquireBridgeClickLock( e, clickControl ) ) {
					return;
				}
				e.preventDefault();
				e.stopPropagation();
				markBridgeHandled( e );
				window.nexulesuite_PopupUi.open( popupByClass, clickLabel );
				return;
			}

			var el = e.target.closest( '[data-nexulesuite_trigger]' );
			if ( ! el ) {
				return;
			}
			var raw = norm( String( el.getAttribute( 'data-nexulesuite_trigger' ) || '' ).trim() );
			if ( ! raw ) {
				return;
			}
			var parts = raw.split( ',' );
			if ( parts.length >= 2 ) {
				var trigId = norm( parts[ 0 ] );
				var notifyLabel = norm( parts.slice( 1 ).join( ',' ) );

				var hrefRaw = norm( el.getAttribute( 'href' ) ) || '';

				var popup =
					trigId &&
					window.nexulesuite_PopupUi &&
					typeof window.nexulesuite_PopupUi.findOverlayByEventId === 'function'
						? window.nexulesuite_PopupUi.findOverlayByEventId( trigId )
						: null;

				if ( ! acquireBridgeClickLock( e, el ) ) {
					return;
				}

				if ( popup ) {
					e.preventDefault();
					e.stopPropagation();
					markBridgeHandled( e );
					window.nexulesuite_PopupUi.open( popup, clickLabel || notifyLabel );
					return;
				}

				markBridgeHandled( e );
				fireNotifyForEvent( trigId, notifyLabel, clickLabel || notifyLabel );

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
				window.nexulesuite_PopupUi &&
				typeof window.nexulesuite_PopupUi.findOverlayByEventId === 'function'
					? window.nexulesuite_PopupUi.findOverlayByEventId( evName )
					: null;
			var hrefRaw = norm( el.getAttribute( 'href' ) );
			if ( popup ) {
				if ( ! acquireBridgeClickLock( e, el ) ) {
					return;
				}
				e.preventDefault();
				e.stopPropagation();
				markBridgeHandled( e );
				window.nexulesuite_PopupUi.open( popup, clickLabel );
			} else if ( evName && parts.length === 1 && ( hrefRaw === '' || hrefRaw === '#' ) ) {
				/* Popup configured but overlay missing / mismatch — avoid broken empty href or hash jump. */
				e.preventDefault();
			}
		},
		true
	);
})();
