/* global nexusLsVePatches */
( function () {
	'use strict';

	var list = typeof nexusLsVePatches !== 'undefined' && nexusLsVePatches ? nexusLsVePatches : [];
	if ( ! list.length ) {
		return;
	}

	function applyOne( p ) {
		if ( ! p || ! p.selector ) {
			return;
		}
		var el;
		try {
			el = document.querySelector( p.selector );
		} catch ( _e ) {
			return;
		}
		if ( ! el || el.nodeType !== 1 ) {
			return;
		}
		var tn = String( el.tagName || '' ).toLowerCase();
		if ( p.tag && String( p.tag ).toLowerCase() !== tn ) {
			return;
		}

		var cls =
			typeof p[ 'class' ] === 'string'
				? p[ 'class' ]
				: typeof p.class === 'string'
					? p.class
					: '';
		var idAttr = typeof p.idAttr === 'string' ? p.idAttr : '';
		var href = typeof p.href === 'string' ? p.href : '';
		var wrap = !! p.wrap;

		if ( cls ) {
			el.setAttribute( 'class', cls );
		} else {
			el.removeAttribute( 'class' );
		}

		if ( idAttr ) {
			el.setAttribute( 'id', idAttr );
		} else {
			el.removeAttribute( 'id' );
		}

		if ( tn === 'a' ) {
			if ( href ) {
				el.setAttribute( 'href', href );
			} else {
				el.removeAttribute( 'href' );
			}
			return;
		}

		if ( href && wrap ) {
			var pa = el.parentElement;
			if ( pa && String( pa.tagName || '' ).toLowerCase() === 'a' && pa.children.length === 1 ) {
				pa.setAttribute( 'href', href );
				pa.setAttribute( 'rel', 'noopener' );
				pa.setAttribute( 'target', '_self' );
				return;
			}
			var a = document.createElement( 'a' );
			a.setAttribute( 'href', href );
			a.setAttribute( 'rel', 'noopener' );
			a.setAttribute( 'target', '_self' );
			a.setAttribute( 'data-nexus-ve-wrap', '1' );
			el.parentNode.insertBefore( a, el );
			a.appendChild( el );
		}
	}

	function run() {
		for ( var i = 0; i < list.length; i++ ) {
			applyOne( list[ i ] );
		}
	}

	function scheduleRuns() {
		run();
		try {
			window.setTimeout( run, 0 );
			window.setTimeout( run, 120 );
			window.setTimeout( run, 450 );
			window.setTimeout( run, 1200 );
			window.setTimeout( run, 2800 );
		} catch ( _e ) {}
	}

	function boot() {
		scheduleRuns();
		if ( document.readyState === 'complete' ) {
			window.setTimeout( run, 80 );
		} else {
			window.addEventListener( 'load', function () {
				run();
				window.setTimeout( run, 200 );
			} );
		}
	}

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', boot );
	} else {
		boot();
	}
} )();
