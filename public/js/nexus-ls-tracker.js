/**
 * Lightweight site-wide behaviour tracker for Nexus Activities (scroll, exit intent, clicks, etc.).
 *
 * @package nexulesuite_
 */
(function () {
	'use strict';

	// Prevent double-init if the script is enqueued twice.
	if ( window.__nexulesuite_TrackerInit ) {
		return;
	}
	window.__nexulesuite_TrackerInit = true;

	var cfg = window.nexulesuite_TrackCfg || {};
	var trackUtils = window.nexulesuite_TrackUtils || null;
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

	var api = window.nexulesuite_Track || {};
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
	window.nexulesuite_Track = api;

	setInterval( flush, 4500 );
	document.addEventListener( 'visibilitychange', function () {
		if ( document.visibilityState === 'hidden' ) {
			flush();
		}
	} );
	window.addEventListener( 'pagehide', flush );

	/* ── Scroll depth milestones (once per tab session) ── */
	marks.forEach( function ( pct ) {
		var k = 'nexulesuite_sd_' + pct;
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
		var k = 'nexulesuite_ex';
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
		if ( el.closest( '.nexulesuite_popup-overlay' ) ) {
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

	function labelOf( el, clickTarget ) {
		if ( trackUtils && typeof trackUtils.resolveClickLabel === 'function' ) {
			return trackUtils.resolveClickLabel( el, clickTarget );
		}
		return '';
	}

	/*
	 * Bubble phase on purpose: popup-bridge uses capture:true + stopPropagation when opening a popup.
	 * If both handlers used capture on document, load/minify order could run the tracker first and block the bridge.
	 */
	document.addEventListener( 'click', function ( e ) {
		if ( e.__nexulesuite_bridgeHandled ) {
			return;
		}

		if ( trackUtils && typeof trackUtils.isExcludedPluginUiClick === 'function' ) {
			if ( trackUtils.isExcludedPluginUiClick( e.target ) ) {
				return;
			}
		} else if (
			e.target.closest(
				'#wpadminbar, #nexulesuite_ve-root, .nexulesuite_ve, .nexulesuite_ve-successBackdrop, .nexulesuite_popup-overlay, .nexulesuite_chat-widget'
			)
		) {
			return;
		}

		var el = e.target.closest(
			'a[href],button,[role="button"],input[type="submit"],input[type="button"],.nexulesuite_bottom-nav__btn,[data-nexulesuite_trigger],[data-nexulesuite_ve-wrap]'
		);
		if ( ! el ) {
			return;
		}

		if ( trackUtils && typeof trackUtils.tryAcquireLock === 'function' ) {
			if ( ! trackUtils.tryAcquireLock( el, 'tracker-click' ) ) {
				return;
			}
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
		function nexulesuite_TriggerIsEmailNotify( node ) {
			var trig = node && node.closest ? node.closest( '[data-nexulesuite_trigger]' ) : null;
			if ( trig ) {
				var raw = String( trig.getAttribute( 'data-nexulesuite_trigger' ) || '' ).trim();
				if ( raw.indexOf( ',' ) !== -1 ) {
					return true;
				}
			}

			var notifyMap =
				window.nexulesuite_PopupBridgeCfg && window.nexulesuite_PopupBridgeCfg.notifyClassMap
					? window.nexulesuite_PopupBridgeCfg.notifyClassMap
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
			if ( ! nexulesuite_TriggerIsEmailNotify( el ) ) {
				api.push( { type: 'click_phone', meta: { label: lab, href: href, zone: zone } } );
			}
			return;
		}
		if ( href.indexOf( 'mailto:' ) === 0 ) {
			if ( ! nexulesuite_TriggerIsEmailNotify( el ) ) {
				api.push( { type: 'click_mailto', meta: { label: lab, href: href, zone: zone } } );
			}
			return;
		}

		if ( zone === 'footer' ) {
			api.push( { type: 'footer_click', meta: { label: lab, href: href, zone: zone } } );
			return;
		}

		api.push( { type: 'click_link', meta: { label: lab, href: href, zone: zone } } );
	} );
})();
