/**
 * Click lock / debounce helpers for Nexus activity tracking.
 *
 * @package nexulesuite_
 */
(function () {
	'use strict';

	var TTL_MS = 800;
	var locks = Object.create( null );

	function elementKey( el ) {
		if ( ! el || el.nodeType !== 1 ) {
			return '';
		}
		if ( el.id ) {
			return 'id:' + String( el.id );
		}
		var tag = String( el.tagName || 'el' ).toLowerCase();
		var href = '';
		if ( el.getAttribute ) {
			href = String( el.getAttribute( 'href' ) || '' ).slice( 0, 120 );
		}
		var cls = '';
		if ( el.classList && el.classList.length ) {
			cls = el.classList.item( 0 ) || '';
		}
		return tag + '|' + href + '|' + cls;
	}

	function lockId( el, eventType ) {
		return String( eventType || 'click' ) + '::' + elementKey( el );
	}

	function pruneExpired( now ) {
		var k;
		for ( k in locks ) {
			if ( Object.prototype.hasOwnProperty.call( locks, k ) && locks[ k ] <= now ) {
				delete locks[ k ];
			}
		}
	}

	/**
	 * Returns true when the lock was acquired (caller may proceed).
	 *
	 * @param {Element|null} el
	 * @param {string} eventType
	 * @return {boolean}
	 */
	function tryAcquireLock( el, eventType ) {
		var now = Date.now();
		pruneExpired( now );
		var id = lockId( el, eventType );
		if ( ! id || id === String( eventType || 'click' ) + '::' ) {
			return true;
		}
		if ( locks[ id ] && locks[ id ] > now ) {
			return false;
		}
		locks[ id ] = now + TTL_MS;
		return true;
	}

	/**
	 * Push a track event only when the click lock is free.
	 *
	 * @param {object|null} trackApi window.nexulesuite_Track
	 * @param {object} ev Event payload
	 * @param {Element|null} el Click control for lock key
	 * @return {boolean} Whether the event was queued
	 */
	function debouncePush( trackApi, ev, el ) {
		if ( ! trackApi || typeof trackApi.push !== 'function' || ! ev ) {
			return false;
		}
		var type = ev.type || 'click';
		if ( ! tryAcquireLock( el, type ) ) {
			return false;
		}
		trackApi.push( ev );
		return true;
	}

	/**
	 * True when the click is inside plugin admin/editor UI (not a real visitor action).
	 *
	 * @param {EventTarget|null} target Click target.
	 * @return {boolean}
	 */
	function isExcludedPluginUiClick( target ) {
		if ( ! target || ! target.closest ) {
			return false;
		}

		// Only exclude clicks inside plugin chrome — not page content VE may have patched
		// (e.g. data-nexulesuite_ve-wrap on visitor-facing link wrappers).
		return !! target.closest(
			'#wpadminbar, #nexulesuite_ve-root, .nexulesuite_ve, .nexulesuite_ve-successBackdrop, .nexulesuite_popup-overlay, .nexulesuite_chat-widget'
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
		return /^(A|BUTTON|INPUT|DIV|SPAN|IMG|I|SVG|LABEL|P)$/i.test( String( t || '' ).trim() );
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
		if ( tag === 'IMG' ) {
			var alt = trimClickLabel( node.getAttribute( 'alt' ) || '' );
			if ( alt && ! isGenericTagLabel( alt ) ) {
				return alt;
			}
		}
		var t = trimClickLabel( node.innerText || node.textContent || '' );
		if ( t && ! isGenericTagLabel( t ) ) {
			return t;
		}
		return '';
	}

	function resolveAriaLabelledBy( el ) {
		if ( ! el || ! el.getAttribute ) {
			return '';
		}
		var labelledBy = el.getAttribute( 'aria-labelledby' );
		if ( ! labelledBy ) {
			return '';
		}
		var ids = String( labelledBy ).split( /\s+/ );
		var parts = [];
		var i;
		for ( i = 0; i < ids.length; i++ ) {
			var ref = document.getElementById( ids[ i ] );
			if ( ref ) {
				var t = textFromClickNode( ref );
				if ( t ) {
					parts.push( t );
				}
			}
		}
		return trimClickLabel( parts.join( ' ' ) );
	}

	function configuredTriggerLabel( el ) {
		if ( ! el || ! el.closest ) {
			return '';
		}
		var trig = el.closest( '[data-nexulesuite_trigger]' );
		if ( ! trig ) {
			return '';
		}
		var raw = String( trig.getAttribute( 'data-nexulesuite_trigger' ) || '' ).trim();
		if ( ! raw || raw.indexOf( ',' ) === -1 ) {
			return '';
		}
		var parts = raw.split( ',' );
		return trimClickLabel( parts.slice( 1 ).join( ',' ) );
	}

	function parentMeaningfulText( el, maxDepth ) {
		if ( ! el || ! el.parentElement ) {
			return '';
		}
		var hop = el.parentElement;
		var depth = 0;
		while ( hop && hop !== document.body && depth < ( maxDepth || 4 ) ) {
			depth++;
			var t = textFromClickNode( hop );
			if ( t ) {
				return t;
			}
			hop = hop.parentElement;
		}
		return '';
	}

	/**
	 * Best-effort visible label for a clicked control (button/link text, aria, trigger config).
	 *
	 * @param {Element|null} el Click control (button, link, etc.).
	 * @param {EventTarget|null} clickTarget Raw event target.
	 * @return {string}
	 */
	function resolveClickLabel( el, clickTarget ) {
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
			var t = textFromClickNode( candidates[ i ] );
			if ( t ) {
				return t;
			}
		}

		var aria = el.getAttribute ? el.getAttribute( 'aria-label' ) : '';
		if ( aria ) {
			aria = trimClickLabel( aria );
			if ( aria && ! isGenericTagLabel( aria ) ) {
				return aria;
			}
		}
		aria = resolveAriaLabelledBy( el );
		if ( aria && ! isGenericTagLabel( aria ) ) {
			return aria;
		}
		if ( el.title ) {
			var title = trimClickLabel( el.title );
			if ( title && ! isGenericTagLabel( title ) ) {
				return title;
			}
		}

		var cfg = configuredTriggerLabel( el );
		if ( cfg && ! isGenericTagLabel( cfg ) ) {
			return cfg;
		}

		return parentMeaningfulText( el, 4 );
	}

	window.nexulesuite_TrackUtils = {
		TTL_MS: TTL_MS,
		tryAcquireLock: tryAcquireLock,
		debouncePush: debouncePush,
		lockId: lockId,
		isExcludedPluginUiClick: isExcludedPluginUiClick,
		trimClickLabel: trimClickLabel,
		isGenericTagLabel: isGenericTagLabel,
		textFromClickNode: textFromClickNode,
		parentMeaningfulText: parentMeaningfulText,
		resolveClickLabel: resolveClickLabel,
	};
})();
