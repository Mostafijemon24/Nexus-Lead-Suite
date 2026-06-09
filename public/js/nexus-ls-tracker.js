/**
 * Lightweight site-wide behaviour tracker for Nexus Activities (scroll, exit intent, clicks, etc.).
 *
 * @package Nexus_Lead_Suite
 */
(function () {
	'use strict';

	// Prevent double-init if the script is enqueued twice.
	if ( window.__nexusLsTrackerInit ) {
		return;
	}
	window.__nexusLsTrackerInit = true;

	var cfg = window.nexusLsTrackCfg || {};
	var q = [];
	var marks = Array.isArray( cfg.scrollMarks ) ? cfg.scrollMarks : [ 25, 50, 75, 90, 100 ];

	function flush() {
		if ( ! q.length || ! cfg.endpoint || ! cfg.nonce ) {
			return;
		}
		var batch = q.splice( 0, q.length );
		var headers = { 'Content-Type': 'application/json' };
		if ( cfg.restNonce ) {
			headers[ 'X-WP-Nonce' ] = cfg.restNonce;
		}
		fetch( cfg.endpoint, {
			method: 'POST',
			credentials: 'same-origin',
			headers: headers,
			body: JSON.stringify( { nonce: cfg.nonce, events: batch } ),
		} ).catch( function () {} );
	}

	var api = window.NexusLsTrack || {};
	api.push = function ( ev ) {
		if ( ! ev || ! ev.type ) {
			return;
		}
		ev.page_url = ev.page_url || window.location.href;
		try {
			ev.referrer_url = document.referrer || '';
		} catch ( _e ) {
			ev.referrer_url = '';
		}
		ev.meta = ev.meta && typeof ev.meta === 'object' ? ev.meta : {};
		q.push( ev );
		if ( q.length >= 14 ) {
			flush();
		}
	};
	api.flush = flush;
	window.NexusLsTrack = api;

	setInterval( flush, 4500 );
	document.addEventListener( 'visibilitychange', function () {
		if ( document.visibilityState === 'hidden' ) {
			flush();
		}
	} );
	window.addEventListener( 'pagehide', flush );

	/* ── Scroll depth milestones (once per tab session) ── */
	marks.forEach( function ( pct ) {
		var k = 'nexus_ls_sd_' + pct;
		try {
			if ( sessionStorage.getItem( k ) ) {
				return;
			}
		} catch ( _e ) {}

		function totalScrollable() {
			var doc = document.documentElement;
			var body = document.body;
			var h = Math.max(
				body.scrollHeight,
				body.offsetHeight,
				doc.clientHeight,
				doc.scrollHeight,
				doc.offsetHeight
			);
			return Math.max( 1, h - window.innerHeight );
		}

		function check() {
			var total = totalScrollable();
			var y = window.scrollY || window.pageYOffset || 0;
			if ( total <= 0 ) {
				return;
			}
			if ( ( y / total ) * 100 >= pct ) {
				window.removeEventListener( 'scroll', onScroll );
				try {
					sessionStorage.setItem( k, '1' );
				} catch ( _e2 ) {}
				api.push( { type: 'scroll_depth', meta: { percent: pct } } );
			}
		}

		function onScroll() {
			check();
		}

		window.addEventListener( 'scroll', onScroll, { passive: true } );
		check();
	} );

	/* ── Exit intent (desktop, once per tab session) ── */
	(function () {
		var k = 'nexus_ls_ex';
		try {
			if ( sessionStorage.getItem( k ) ) {
				return;
			}
		} catch ( _e ) {}

		var html = document.documentElement;
		if ( ! html || ! html.addEventListener ) {
			return;
		}

		function onLeave( e ) {
			if ( ( e.clientY || 0 ) > 0 ) {
				return;
			}
			html.removeEventListener( 'mouseleave', onLeave );
			try {
				sessionStorage.setItem( k, '1' );
			} catch ( _e2 ) {}
			api.push( { type: 'exit_intent', meta: {} } );
		}

		html.addEventListener( 'mouseleave', onLeave );
	})();

	function zoneOf( el ) {
		if ( el.closest( '.nexus-popup-overlay' ) ) {
			return 'popup';
		}
		var foot = document.querySelector(
			'footer,[role="contentinfo"],#footer,.site-footer,#colophon'
		);
		if ( foot && foot.contains( el ) ) {
			return 'footer';
		}
		return 'page';
	}

	function trimLabel( t ) {
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

	function textFromNode( node ) {
		if ( ! node || node.nodeType !== 1 ) {
			return '';
		}
		var tag = String( node.tagName || '' ).toUpperCase();
		if ( tag === 'INPUT' ) {
			var submitVal = node.value || node.getAttribute( 'value' ) || '';
			submitVal = trimLabel( submitVal );
			if ( submitVal ) {
				return submitVal;
			}
		}
		var t = trimLabel( node.innerText || node.textContent || '' );
		if ( t && ! isGenericTagLabel( t ) ) {
			return t;
		}
		return '';
	}

	/*
	 * Visible label of the clicked control (button/link text the visitor actually tapped).
	 */
	function labelOf( el, clickTarget ) {
		if ( ! el ) {
			return '';
		}

		var candidates = [];
		if ( clickTarget && el.contains && el.contains( clickTarget ) ) {
			var hop = clickTarget;
			while ( hop && hop !== el ) {
				candidates.push( hop );
				hop = hop.parentElement;
			}
		}
		candidates.push( el );

		var i;
		for ( i = 0; i < candidates.length; i++ ) {
			var t = textFromNode( candidates[ i ] );
			if ( t ) {
				return t;
			}
		}

		var aria = el.getAttribute( 'aria-label' ) || el.getAttribute( 'aria-labelledby' );
		if ( aria ) {
			aria = trimLabel( aria );
			if ( aria && ! isGenericTagLabel( aria ) ) {
				return aria;
			}
		}
		if ( el.title ) {
			var title = trimLabel( el.title );
			if ( title && ! isGenericTagLabel( title ) ) {
				return title;
			}
		}

		return '';
	}

	/*
	 * Bubble phase on purpose: popup-bridge uses capture:true + stopPropagation when opening a popup.
	 * If both handlers used capture on document, load/minify order could run the tracker first and block the bridge.
	 */
	document.addEventListener( 'click', function ( e ) {
		if ( e.target.closest( '#wpadminbar' ) ) {
			return;
		}

		var el = e.target.closest(
			'a[href],button,[role="button"],input[type="submit"],input[type="button"]'
		);
		if ( ! el ) {
			return;
		}

		var zone = zoneOf( el );
		var href = '';
		if ( el.tagName === 'A' ) {
			href = el.href || '';
		} else {
			var pa = el.closest( 'a[href]' );
			if ( pa ) {
				href = pa.href || '';
			}
		}

		var lab = labelOf( el, e.target );

		/*
		 * Email notify taps log trigger_notify server-side; skip duplicate click_phone / click_mailto rows.
		 */
		function nexasTriggerIsEmailNotify( node ) {
			var trig = node && node.closest ? node.closest( '[data-nexas-trigger]' ) : null;
			if ( trig ) {
				var raw = String( trig.getAttribute( 'data-nexas-trigger' ) || '' ).trim();
				if ( raw.indexOf( ',' ) !== -1 ) {
					return true;
				}
			}

			var notifyMap =
				window.nexusLsPopupBridgeCfg && window.nexusLsPopupBridgeCfg.notifyClassMap
					? window.nexusLsPopupBridgeCfg.notifyClassMap
					: null;
			if ( ! notifyMap || ! node ) {
				return false;
			}

			var hop = node;
			var depth = 0;
			while ( hop && hop !== document.body && depth < 12 ) {
				depth++;
				if ( hop.classList && hop.classList.length ) {
					for ( var ci = 0; ci < hop.classList.length; ci++ ) {
						var cls = hop.classList.item( ci );
						if ( ! cls ) {
							continue;
						}
						if ( notifyMap[ cls ] || notifyMap[ cls.toLowerCase() ] ) {
							return true;
						}
					}
				}
				hop = hop.parentElement;
			}

			return false;
		}

		if ( href.indexOf( 'tel:' ) === 0 ) {
			if ( ! nexasTriggerIsEmailNotify( el ) ) {
				api.push( { type: 'click_phone', meta: { label: lab, href: href, zone: zone } } );
			}
			return;
		}
		if ( href.indexOf( 'mailto:' ) === 0 ) {
			if ( ! nexasTriggerIsEmailNotify( el ) ) {
				api.push( { type: 'click_mailto', meta: { label: lab, href: href, zone: zone } } );
			}
			return;
		}

		if ( zone === 'footer' ) {
			api.push( { type: 'footer_click', meta: { label: lab, href: href, zone: zone } } );
			return;
		}

		if ( el.closest( '.nexus-popup__close' ) ) {
			return;
		}

		api.push( { type: 'click_link', meta: { label: lab, href: href, zone: zone } } );
	} );
})();
