/* Nexus Lead Suite — appointment module front end: booking, auth, patient and doctor panels.
 * Vanilla JS, no dependencies. Mount points: [data-nxa="booking"], [data-nxa="auth"], [data-nxa="panel"]. */
( function () {
	'use strict';

	var cfg = window.nexulesuite_Appt || {};
	var t = cfg.i18n || {};
	var WEEKDAYS = cfg.weekdays || [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ];
	var MONTHS = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];

	/* ---------------- helpers ---------------- */
	function el( tag, attrs, children ) {
		var node = document.createElement( tag );
		attrs = attrs || {};
		Object.keys( attrs ).forEach( function ( k ) {
			var v = attrs[ k ];
			if ( v === null || v === undefined || v === false ) { return; }
			if ( k === 'class' ) { node.className = v; }
			else if ( k === 'text' ) { node.textContent = v; }
			else if ( k === 'html' ) { node.innerHTML = v; }
			else if ( k.indexOf( 'on' ) === 0 && typeof v === 'function' ) { node.addEventListener( k.slice( 2 ).toLowerCase(), v ); }
			else if ( k === 'disabled' || k === 'checked' || k === 'selected' ) { node[ k ] = !! v; }
			else { node.setAttribute( k, v ); }
		} );
		( children || [] ).forEach( function ( c ) {
			if ( c === null || c === undefined || c === false ) { return; }
			node.appendChild( typeof c === 'string' ? document.createTextNode( c ) : c );
		} );
		return node;
	}
	function clear( node ) { while ( node.firstChild ) { node.removeChild( node.firstChild ); } return node; }
	function money( v ) { v = Number( v || 0 ); return v > 0 ? ( cfg.currencySymbol || '$' ) + v.toFixed( 2 ) : ( t.free || 'Free' ); }
	function badge( status ) { return el( 'span', { class: 'nxa-badge nxa-badge-' + status, text: t[ status ] || status } ); }
	function pad( n ) { return ( n < 10 ? '0' : '' ) + n; }
	function ymd( d ) { return d.getFullYear() + '-' + pad( d.getMonth() + 1 ) + '-' + pad( d.getDate() ); }
	function parseYmd( s ) { var p = s.split( '-' ); return new Date( Number( p[ 0 ] ), Number( p[ 1 ] ) - 1, Number( p[ 2 ] ) ); }
	function fmtDate( s ) { if ( ! s ) { return ''; } var d = parseYmd( s ); return WEEKDAYS[ d.getDay() ].slice( 0, 3 ) + ', ' + d.getDate() + ' ' + MONTHS[ d.getMonth() ].slice( 0, 3 ) + ' ' + d.getFullYear(); }

	function api( path, opts ) {
		opts = opts || {};
		var headers = { 'X-WP-Nonce': cfg.nonce || '' };
		var init = { method: opts.method || 'GET', headers: headers, credentials: 'same-origin' };
		var url = cfg.restUrl + path.replace( /^\//, '' );
		if ( opts.query ) {
			var qs = Object.keys( opts.query ).filter( function ( k ) { return opts.query[ k ] !== undefined && opts.query[ k ] !== null && opts.query[ k ] !== ''; } ).map( function ( k ) { return encodeURIComponent( k ) + '=' + encodeURIComponent( opts.query[ k ] ); } ).join( '&' );
			if ( qs ) { url += ( url.indexOf( '?' ) === -1 ? '?' : '&' ) + qs; }
		}
		if ( opts.body ) { headers[ 'Content-Type' ] = 'application/json'; init.body = JSON.stringify( opts.body ); }
		return fetch( url, init ).then( function ( res ) {
			return res.text().then( function ( txt ) {
				var data = null;
				try { data = txt ? JSON.parse( txt ) : null; } catch ( e ) { data = null; }
				if ( ! res.ok ) {
					var err = new Error( ( data && data.message ) || ( t.networkError || 'Request failed' ) );
					err.code = data && data.code; err.status = res.status; err.errors = ( data && data.data && data.data.errors ) || {};
					throw err;
				}
				return data;
			} );
		}, function () { var err = new Error( t.networkError || 'Network error' ); err.code = 'network'; err.errors = {}; throw err; } );
	}

	function alertBox( kind, msg ) { return el( 'div', { class: 'nxa-alert nxa-alert-' + kind, role: kind === 'error' ? 'alert' : 'status', text: msg } ); }
	function skeleton( n ) { var w = el( 'div' ); for ( var i = 0; i < ( n || 4 ); i++ ) { w.appendChild( el( 'div', { class: 'nxa-skeleton', style: 'width:' + ( 60 + ( i * 13 ) % 40 ) + '%' } ) ); } return w; }
	function field( opts ) {
		var input = el( opts.tag || 'input', Object.assign( { name: opts.name, id: 'nxa-' + opts.name + '-' + Math.random().toString( 36 ).slice( 2, 6 ) }, opts.attrs || {} ) );
		if ( opts.tag === 'select' ) { ( opts.options || [] ).forEach( function ( o ) { input.appendChild( el( 'option', { value: o.value, text: o.label, selected: o.value === opts.value } ) ); } ); }
		else if ( opts.value !== undefined ) { input.value = opts.value; }
		var wrap = el( 'label', { class: 'nxa-field', for: input.id }, [ el( 'span', { text: opts.label } ), input ] );
		wrap.showError = function ( msg ) { wrap.classList.toggle( 'has-error', !! msg ); var e = wrap.querySelector( '.nxa-error-text' ); if ( e ) { e.remove(); } if ( msg ) { wrap.appendChild( el( 'span', { class: 'nxa-error-text', text: msg } ) ); } };
		wrap.input = input;
		return wrap;
	}
	function applyErrors( form, errors, fallback ) {
		var fields = form.querySelectorAll( '.nxa-field' );
		var first = null;
		fields.forEach( function ( f ) { if ( ! f.showError ) { return; } var n = f.input && f.input.name; var m = errors && errors[ n ]; f.showError( m || '' ); if ( m && ! first ) { first = f; } } );
		if ( first && first.input ) { first.input.focus(); }
		return first ? ( t.fixFields || fallback ) : fallback;
	}
	function busy( btn, on ) { btn.classList.toggle( 'is-loading', !! on ); btn.disabled = !! on; }
	function formData( form ) { var o = {}; new FormData( form ).forEach( function ( v, k ) { o[ k ] = v; } ); return o; }

	/* ---------------- Auth ---------------- */
	function Auth( root, opts ) {
		opts = opts || {};
		var type = opts.type || root.getAttribute( 'data-type' ) || 'patient';
		var redirectTo = opts.redirect || root.getAttribute( 'data-redirect' ) || '';
		var mode = 'login';
		var notice = null;
		var verified = root.getAttribute( 'data-verified' );
		if ( verified === 'ok' ) { notice = alertBox( 'success', t.verifiedOk ); }
		if ( verified === 'fail' ) { notice = alertBox( 'error', t.verifiedFail ); mode = 'resend'; }

		function render() {
			clear( root );
			var box = el( 'div', { class: opts.inline ? 'nxa-inline-auth' : 'nxa-card' } );
			if ( notice ) { box.appendChild( notice ); }
			if ( type === 'patient' && mode !== 'verify' ) {
				box.appendChild( el( 'div', { class: 'nxa-tabs', role: 'tablist' }, [
					el( 'button', { type: 'button', role: 'tab', class: 'nxa-tab' + ( mode === 'login' ? ' is-active' : '' ), text: t.login, onClick: function () { mode = 'login'; notice = null; render(); } } ),
					el( 'button', { type: 'button', role: 'tab', class: 'nxa-tab' + ( mode === 'register' || mode === 'resend' ? ' is-active' : '' ), text: t.register, onClick: function () { mode = 'register'; notice = null; render(); } } ),
				] ) );
			} else if ( type === 'doctor' ) {
				box.appendChild( el( 'h3', { text: t.doctorLogin } ) );
			}
			if ( mode === 'login' ) { box.appendChild( loginForm() ); }
			else if ( mode === 'register' ) { box.appendChild( registerForm() ); }
			else if ( mode === 'verify' || mode === 'resend' ) { box.appendChild( verifyBox() ); }
			if ( ! opts.inline ) {
				var sw = el( 'p', { class: 'nxa-auth-switch' } );
				if ( type === 'doctor' ) { sw.appendChild( el( 'a', { href: cfg.pages.auth, text: t.patientLogin } ) ); }
				else { sw.appendChild( el( 'a', { href: cfg.pages.auth + ( cfg.pages.auth.indexOf( '?' ) === -1 ? '?' : '&' ) + 'type=doctor', text: t.doctorLogin } ) ); }
				box.appendChild( sw );
			}
			root.appendChild( box );
		}
		function loginForm() {
			var email = field( { name: 'email', label: t.email, attrs: { type: 'email', required: true, autocomplete: 'email' } } );
			var pass = field( { name: 'password', label: t.password, attrs: { type: 'password', required: true, autocomplete: 'current-password' } } );
			var btn = el( 'button', { type: 'submit', class: 'nxa-btn nxa-btn-primary', text: t.login } );
			var msg = el( 'div' );
			var form = el( 'form', { novalidate: true, onSubmit: function ( e ) {
				e.preventDefault(); clear( msg ); busy( btn, true );
				api( 'public/login', { method: 'POST', body: { email: email.input.value, password: pass.input.value, type: type } } ).then( function ( r ) {
					cfg.nonce = r.nonce || cfg.nonce; cfg.loggedIn = true; cfg.role = type;
					if ( opts.onSuccess ) { opts.onSuccess( r ); return; }
					window.location.href = redirectTo || r.redirect;
				} ).catch( function ( err ) {
					busy( btn, false );
					var m = applyErrors( form, err.errors, err.message );
					msg.appendChild( alertBox( 'error', m ) );
					if ( err.code === 'email_unverified' ) { msg.appendChild( el( 'button', { type: 'button', class: 'nxa-btn nxa-btn-sm', text: t.resend, onClick: function () { mode = 'resend'; render(); } } ) ); }
				} );
			} }, [ msg, email, pass, el( 'div', { class: 'nxa-actions' }, [ el( 'a', { href: cfg.lostPasswordUrl, text: t.forgot } ), btn ] ) ] );
			return form;
		}
		function registerForm() {
			var name = field( { name: 'name', label: t.fullName, attrs: { type: 'text', required: true, autocomplete: 'name' } } );
			var email = field( { name: 'email', label: t.email, attrs: { type: 'email', required: true, autocomplete: 'email' } } );
			var phone = field( { name: 'phone', label: t.phone, attrs: { type: 'tel', autocomplete: 'tel' } } );
			var pass = field( { name: 'password', label: t.password, attrs: { type: 'password', required: true, minlength: 8, autocomplete: 'new-password' } } );
			var pass2 = field( { name: 'passwordConfirm', label: t.passwordConfirm, attrs: { type: 'password', required: true, autocomplete: 'new-password' } } );
			var btn = el( 'button', { type: 'submit', class: 'nxa-btn nxa-btn-primary', text: t.register } );
			var msg = el( 'div' );
			var form = el( 'form', { novalidate: true, onSubmit: function ( e ) {
				e.preventDefault(); clear( msg ); busy( btn, true );
				api( 'public/register', { method: 'POST', body: formData( form ) } ).then( function ( r ) {
					if ( r.verificationRequired ) { notice = alertBox( 'info', t.checkInbox ); mode = 'verify'; render(); return; }
					if ( opts.onSuccess ) { opts.onSuccess( r ); return; }
					window.location.href = redirectTo || r.redirect;
				} ).catch( function ( err ) { busy( btn, false ); msg.appendChild( alertBox( 'error', applyErrors( form, err.errors, err.message ) ) ); } );
			} }, [ msg, name, email, phone, el( 'div', { class: 'nxa-row' }, [ pass, pass2 ] ), el( 'div', { class: 'nxa-actions' }, [ el( 'span' ), btn ] ) ] );
			return form;
		}
		function verifyBox() {
			var email = field( { name: 'email', label: t.email, attrs: { type: 'email', required: true } } );
			var btn = el( 'button', { type: 'submit', class: 'nxa-btn', text: t.resend } );
			var msg = el( 'div' );
			return el( 'form', { novalidate: true, onSubmit: function ( e ) {
				e.preventDefault(); clear( msg ); busy( btn, true );
				api( 'public/resend-verification', { method: 'POST', body: { email: email.input.value } } ).then( function () { busy( btn, false ); msg.appendChild( alertBox( 'success', t.resent ) ); } ).catch( function ( err ) { busy( btn, false ); msg.appendChild( alertBox( 'error', err.message ) ); } );
			} }, [ msg, email, el( 'div', { class: 'nxa-actions' }, [ el( 'button', { type: 'button', class: 'nxa-btn', text: t.login, onClick: function () { mode = 'login'; notice = null; render(); } } ), btn ] ) ] );
		}
		render();
	}

	/* ---------------- Booking ---------------- */
	function Booking( root ) {
		var compact = root.getAttribute( 'data-compact' ) === '1';
		var S = { step: 1, departments: null, department: null, doctors: null, doctor: null, month: null, days: {}, date: '', slots: null, slot: null, reason: '', paymentMethod: 'pay_at_clinic', result: null, error: '' };
		var presetDoctor = Number( root.getAttribute( 'data-doctor-id' ) || 0 );
		var presetDept = Number( root.getAttribute( 'data-department-id' ) || 0 );
		var STEPS = [ t.department, t.doctor, t.date, t.time, t.confirm ];

		function go( step ) { S.step = step; S.error = ''; render(); }
		function render() {
			clear( root );
			var wrap = el( 'div' );
			if ( S.result ) { wrap.appendChild( successView() ); root.appendChild( wrap ); return; }
			if ( ! compact ) {
				var steps = el( 'ol', { class: 'nxa-steps' } );
				STEPS.forEach( function ( label, i ) { steps.appendChild( el( 'li', { class: i + 1 === S.step ? 'is-active' : ( i + 1 < S.step ? 'is-done' : '' ), text: ( i + 1 ) + '. ' + label } ) ); } );
				wrap.appendChild( steps );
			}
			if ( S.error ) { wrap.appendChild( alertBox( 'error', S.error ) ); }
			var body = el( 'div' );
			wrap.appendChild( body );
			root.appendChild( wrap );
			[ null, stepDepartment, stepDoctor, stepDate, stepTime, stepConfirm ][ S.step ]( body );
		}
		function nav( body, backStep, nextBtn ) {
			var row = el( 'div', { class: 'nxa-actions' } );
			row.appendChild( backStep ? el( 'button', { type: 'button', class: 'nxa-btn', text: t.back, onClick: function () { go( backStep ); } } ) : el( 'span' ) );
			if ( nextBtn ) { row.appendChild( nextBtn ); }
			body.appendChild( row );
		}
		function stepDepartment( body ) {
			body.appendChild( el( 'h3', { text: t.chooseDepartment } ) );
			if ( ! S.departments ) {
				body.appendChild( skeleton( 4 ) );
				api( 'public/departments' ).then( function ( r ) { S.departments = r.items; if ( presetDept ) { var d = r.items.filter( function ( x ) { return x.id === presetDept; } )[ 0 ]; if ( d ) { S.department = d; presetDept = 0; go( 2 ); return; } } render(); } ).catch( fail );
				return;
			}
			if ( ! S.departments.length ) { body.appendChild( el( 'div', { class: 'nxa-empty', text: t.empty } ) ); return; }
			var list = el( 'div', { class: 'nxa-choice-list' } );
			S.departments.forEach( function ( d ) {
				list.appendChild( el( 'button', { type: 'button', class: 'nxa-choice' + ( S.department && S.department.id === d.id ? ' is-selected' : '' ), onClick: function () { if ( ! S.department || S.department.id !== d.id ) { S.doctors = null; S.doctor = null; } S.department = d; go( 2 ); } }, [ el( 'span', { class: 'nxa-dept-icon', text: initials( d.name ) } ), el( 'span', {}, [ el( 'strong', { text: d.name } ), el( 'small', { text: d.doctorCount + ' ' + t.doctor.toLowerCase() + ( d.doctorCount === 1 ? '' : 's' ) } ) ] ) ] ) );
			} );
			body.appendChild( list );
		}
		function stepDoctor( body ) {
			body.appendChild( el( 'h3', { text: t.chooseDoctor } ) );
			if ( ! S.doctors ) {
				body.appendChild( skeleton( 4 ) );
				api( 'public/doctors', { query: { departmentId: S.department ? S.department.id : '', perPage: 50 } } ).then( function ( r ) { S.doctors = r.items; render(); } ).catch( fail );
				return;
			}
			if ( ! S.doctors.length ) { body.appendChild( el( 'div', { class: 'nxa-empty', text: t.noDoctors } ) ); nav( body, 1 ); return; }
			var list = el( 'div', { class: 'nxa-choice-list' } );
			S.doctors.forEach( function ( d ) {
				list.appendChild( el( 'button', { type: 'button', class: 'nxa-choice' + ( S.doctor && S.doctor.id === d.id ? ' is-selected' : '' ), onClick: function () { selectDoctor( d ); go( 3 ); } }, [ d.photoUrl ? el( 'img', { src: d.photoUrl, alt: '', width: 48, height: 48, style: 'border-radius:50%;object-fit:cover' } ) : el( 'span', { class: 'nxa-avatar', style: 'width:48px;height:48px;font-size:16px', text: initials( d.name ) } ), el( 'span', {}, [ el( 'strong', { text: d.name } ), el( 'small', { text: d.departmentName + ( d.locationName ? ' · ' + d.locationName : '' ) + ' · ' + t.fee + ' ' + money( d.fee ) } ) ] ) ] ) );
			} );
			body.appendChild( list );
			nav( body, 1 );
		}
		function selectDoctor( d ) { if ( ! S.doctor || S.doctor.id !== d.id ) { S.days = {}; S.date = ''; S.slots = null; S.slot = null; } S.doctor = d; }
		function stepDate( body ) {
			body.appendChild( el( 'h3', { text: t.chooseDate } ) );
			if ( ! S.month ) { var now = new Date(); S.month = now.getFullYear() + '-' + pad( now.getMonth() + 1 ); }
			if ( ! S.days[ S.month ] ) {
				body.appendChild( skeleton( 5 ) );
				api( 'public/availability-month', { query: { doctorId: S.doctor.id, month: S.month } } ).then( function ( r ) { S.days[ S.month ] = r.days; render(); } ).catch( fail );
				return;
			}
			var days = S.days[ S.month ];
			var y = Number( S.month.slice( 0, 4 ) ), m = Number( S.month.slice( 5, 7 ) );
			var head = el( 'div', { class: 'nxa-cal-head' }, [
				el( 'button', { type: 'button', class: 'nxa-btn nxa-btn-sm', 'aria-label': 'Previous month', text: '‹', onClick: function () { shiftMonth( -1 ); } } ),
				el( 'span', { text: MONTHS[ m - 1 ] + ' ' + y } ),
				el( 'button', { type: 'button', class: 'nxa-btn nxa-btn-sm', 'aria-label': 'Next month', text: '›', onClick: function () { shiftMonth( 1 ); } } ),
			] );
			var grid = el( 'div', { class: 'nxa-cal-grid', role: 'grid' } );
			WEEKDAYS.forEach( function ( w ) { grid.appendChild( el( 'div', { class: 'nxa-cal-dow', text: w.slice( 0, 2 ) } ) ); } );
			var first = new Date( y, m - 1, 1 ).getDay();
			for ( var i = 0; i < first; i++ ) { grid.appendChild( el( 'div' ) ); }
			Object.keys( days ).forEach( function ( date ) {
				var status = days[ date ];
				var btn = el( 'button', { type: 'button', class: 'nxa-cal-day is-' + status + ( S.date === date ? ' is-selected' : '' ), text: String( Number( date.slice( 8, 10 ) ) ), disabled: status !== 'open', 'aria-label': date + ' ' + status, onClick: function () { S.date = date; S.slots = null; S.slot = null; go( 4 ); } } );
				grid.appendChild( btn );
			} );
			body.appendChild( el( 'div', { class: 'nxa-cal' }, [ head, grid, el( 'div', { class: 'nxa-cal-legend' }, [ el( 'span', { text: '■ ' + t.upcoming } ), el( 'span', { text: '■ ' + ( t.onLeave || '' ).replace( /\.$/, '' ) } ), el( 'span', { text: '■ ' + ( t.noSlots || '' ).split( '.' )[ 0 ] } ) ] ) ] ) );
			nav( body, presetDoctor ? null : 2 );
		}
		function shiftMonth( delta ) { var y = Number( S.month.slice( 0, 4 ) ), m = Number( S.month.slice( 5, 7 ) ) + delta; if ( m < 1 ) { m = 12; y--; } if ( m > 12 ) { m = 1; y++; } S.month = y + '-' + pad( m ); render(); }
		function stepTime( body ) {
			body.appendChild( el( 'h3', { text: t.chooseTime } ) );
			body.appendChild( el( 'p', { class: 'nxa-muted', text: fmtDate( S.date ) } ) );
			if ( ! S.slots ) {
				body.appendChild( skeleton( 3 ) );
				api( 'public/availability', { query: { doctorId: S.doctor.id, date: S.date } } ).then( function ( r ) { S.slots = r; render(); } ).catch( fail );
				return;
			}
			if ( S.slots.status === 'leave' ) { body.appendChild( alertBox( 'info', t.onLeave ) ); }
			else if ( S.slots.status !== 'open' ) { body.appendChild( alertBox( 'info', S.slots.status === 'closed' ? t.closed : t.noSlots ) ); }
			else {
				var wrap = el( 'div', { class: 'nxa-slots', role: 'listbox' } );
				S.slots.slots.forEach( function ( s ) { wrap.appendChild( el( 'button', { type: 'button', role: 'option', class: 'nxa-slot' + ( S.slot && S.slot.start === s.start ? ' is-selected' : '' ), disabled: ! s.available, text: s.start + ' – ' + s.end, onClick: function () { S.slot = s; render(); } } ) ); } );
				body.appendChild( wrap );
			}
			nav( body, 3, el( 'button', { type: 'button', class: 'nxa-btn nxa-btn-primary', disabled: ! S.slot, text: t.next, onClick: function () { go( 5 ); } } ) );
		}
		function stepConfirm( body ) {
			body.appendChild( el( 'h3', { text: t.review } ) );
			body.appendChild( el( 'ul', { class: 'nxa-summary' }, [
				el( 'li', {}, [ el( 'span', { text: t.doctor } ), el( 'strong', { text: S.doctor.name } ) ] ),
				el( 'li', {}, [ el( 'span', { text: t.department } ), el( 'span', { text: S.doctor.departmentName } ) ] ),
				el( 'li', {}, [ el( 'span', { text: t.date } ), el( 'span', { text: fmtDate( S.date ) } ) ] ),
				el( 'li', {}, [ el( 'span', { text: t.time } ), el( 'span', { text: S.slot.start + ' – ' + S.slot.end } ) ] ),
				el( 'li', {}, [ el( 'span', { text: t.fee } ), el( 'strong', { text: money( S.doctor.fee ) } ) ] ),
			] ) );
			if ( cfg.loggedIn && cfg.role === 'patient' ) {
				var reason = field( { name: 'reason', tag: 'textarea', label: t.reason, value: S.reason, attrs: { rows: 3, maxlength: 2000 } } );
				body.appendChild( reason );
				if ( Number( S.doctor.fee ) > 0 ) {
					body.appendChild( el( 'div', { class: 'nxa-field' }, [ el( 'span', { text: t.paymentMethod } ) ] ) );
					[ [ 'pay_at_clinic', t.payAtClinic ], [ 'bank_transfer', t.bankTransfer ] ].forEach( function ( pm ) {
						body.appendChild( el( 'label', { class: 'nxa-radio' }, [ el( 'input', { type: 'radio', name: 'paymentMethod', value: pm[ 0 ], checked: S.paymentMethod === pm[ 0 ], onChange: function () { S.paymentMethod = pm[ 0 ]; } } ), pm[ 1 ] ] ) );
					} );
				}
				var btn = el( 'button', { type: 'button', class: 'nxa-btn nxa-btn-primary', text: t.confirm, onClick: function () {
					S.reason = reason.input.value; busy( btn, true );
					api( 'patient/appointments', { method: 'POST', body: { doctorId: S.doctor.id, date: S.date, startTime: S.slot.start, reason: S.reason, paymentMethod: S.paymentMethod } } ).then( function ( r ) { S.result = r; render(); } ).catch( function ( err ) {
						busy( btn, false ); S.error = err.message;
						if ( err.code === 'slot_taken' || err.code === 'invalid_slot' ) { S.slots = null; S.slot = null; S.step = 4; }
						render();
					} );
				} } );
				nav( body, 4, btn );
			} else if ( cfg.loggedIn ) {
				body.appendChild( alertBox( 'info', t.loginToBook ) );
				body.appendChild( el( 'a', { class: 'nxa-btn', href: cfg.logoutUrl, text: t.logout } ) );
				nav( body, 4 );
			} else {
				body.appendChild( alertBox( 'info', t.loginToBook ) );
				var mount = el( 'div' );
				body.appendChild( mount );
				Auth( mount, { type: 'patient', inline: true, onSuccess: function () { render(); } } );
				nav( body, 4 );
			}
		}
		function successView() {
			var r = S.result;
			return el( 'div', { class: 'nxa-success' }, [
				el( 'div', { class: 'nxa-check', text: '✓' }),
				el( 'h3', { text: t.booked } ),
				el( 'p', { class: 'nxa-muted', text: t.bookingCode } ),
				el( 'p', { class: 'nxa-code', text: r.code } ),
				el( 'ul', { class: 'nxa-summary', style: 'text-align:left' }, [
					el( 'li', {}, [ el( 'span', { text: t.doctor } ), el( 'span', { text: r.doctorName } ) ] ),
					el( 'li', {}, [ el( 'span', { text: t.date } ), el( 'span', { text: fmtDate( r.date ) + ' ' + r.startTime } ) ] ),
					el( 'li', {}, [ el( 'span', { text: t.fee } ), el( 'span', { text: money( r.fee ) } ) ] ),
					el( 'li', {}, [ el( 'span', { text: t.status } ), badge( r.status ) ] ),
				] ),
				el( 'div', { class: 'nxa-actions', style: 'justify-content:center' }, [
					el( 'a', { class: 'nxa-btn nxa-btn-primary', href: cfg.pages.patientPanel + '#appointments', text: t.viewAppointments } ),
					el( 'button', { type: 'button', class: 'nxa-btn', text: t.bookAnother, onClick: function () { S.result = null; S.date = ''; S.slot = null; S.slots = null; S.days = {}; go( presetDoctor ? 3 : 1 ); } } ),
				] ),
			] );
		}
		function fail( err ) { S.error = err.message; clear( root ); root.appendChild( alertBox( 'error', err.message ) ); root.appendChild( el( 'button', { type: 'button', class: 'nxa-btn', text: t.retry, onClick: function () { S.error = ''; render(); } } ) ); }
		function initials( n ) { return ( n || '' ).replace( /^Dr\.?\s+/i, '' ).split( /\s+/ ).slice( 0, 2 ).map( function ( p ) { return p.charAt( 0 ); } ).join( '' ).toUpperCase(); }

		if ( presetDoctor ) {
			root.appendChild( skeleton( 4 ) );
			api( 'public/doctors', { query: { perPage: 1, search: '' } } ).then( function () {
				// Fetch the preset doctor by scanning the public list once (slug unknown here).
				return api( 'public/doctors', { query: { perPage: 50 } } );
			} ).then( function ( r ) {
				var d = r.items.filter( function ( x ) { return x.id === presetDoctor; } )[ 0 ];
				if ( ! d ) { presetDoctor = 0; go( 1 ); return; }
				S.department = { id: d.departmentId, name: d.departmentName };
				selectDoctor( d ); go( 3 );
			} ).catch( fail );
		} else {
			render();
		}
	}

	/* ---------------- Panels ---------------- */
	function Panel( root ) {
		var role = root.getAttribute( 'data-role' );
		var items = role === 'doctor'
			? [ [ 'dashboard', t.dashboard ], [ 'appointments', t.appointments ], [ 'schedule', t.timeSchedule ], [ 'leaves', t.leaveDays ], [ 'profile', t.profile ], [ 'password', t.changePassword ] ]
			: [ [ 'appointments', t.appointments ], [ 'payments', t.payments ], [ 'profile', t.profile ], [ 'password', t.changePassword ] ];
		var views = { dashboard: viewDoctorDashboard, appointments: role === 'doctor' ? viewDoctorAppointments : viewPatientAppointments, payments: viewPayments, profile: viewProfile, password: viewPassword, schedule: viewSchedule, leaves: viewLeaves };
		var content = el( 'div', { class: 'nxa-content' } );
		var side = el( 'nav', { class: 'nxa-side', 'aria-label': 'Account' } );
		function current() { var h = ( location.hash || '' ).replace( '#', '' ).split( '/' ); return { view: views[ h[ 0 ] ] ? h[ 0 ] : items[ 0 ][ 0 ], arg: h[ 1 ] || '' }; }
		function renderSide() {
			clear( side );
			var cur = current().view;
			items.forEach( function ( it ) { side.appendChild( el( 'a', { href: '#' + it[ 0 ], class: cur === it[ 0 ] ? 'is-active' : '', text: it[ 1 ] } ) ); } );
			side.appendChild( el( 'a', { href: cfg.logoutUrl, text: t.logout } ) );
		}
		function route() { renderSide(); clear( content ); var c = current(); views[ c.view ]( content, c.arg ); }
		window.addEventListener( 'hashchange', route );
		clear( root ); root.appendChild( side ); root.appendChild( content ); route();

		function load( node, promise, fn ) {
			clear( node ); node.appendChild( skeleton( 5 ) );
			promise.then( function ( r ) { clear( node ); fn( r ); } ).catch( function ( err ) { clear( node ); node.appendChild( alertBox( 'error', err.message ) ); node.appendChild( el( 'button', { type: 'button', class: 'nxa-btn', text: t.retry, onClick: function () { load( node, promise, fn ); } } ) ); } );
		}
		function table( headers, rows ) {
			var thead = el( 'thead', {}, [ el( 'tr', {}, headers.map( function ( h ) { return el( 'th', { text: h } ); } ) ) ] );
			var tbody = el( 'tbody' );
			rows.forEach( function ( cells ) { tbody.appendChild( el( 'tr', {}, cells.map( function ( c, i ) { var td = el( 'td', { 'data-label': headers[ i ] } ); if ( c === null || c === undefined ) { return td; } td.appendChild( typeof c === 'string' || typeof c === 'number' ? document.createTextNode( String( c ) ) : c ); return td; } ) ) ); } );
			return el( 'table', { class: 'nxa-table nxa-table-responsive' }, [ thead, tbody ] );
		}
		function stats( s, keys ) { var w = el( 'div', { class: 'nxa-stats' } ); keys.forEach( function ( k ) { w.appendChild( el( 'div', { class: 'nxa-stat' }, [ el( 'span', { text: k[ 1 ] } ), el( 'strong', { text: k[ 2 ] ? k[ 2 ]( s[ k[ 0 ] ] ) : String( s[ k[ 0 ] ] ) } ) ] ) ); } ); return w; }

		/* --- patient --- */
		function viewPatientAppointments( node, arg ) {
			if ( arg ) { return viewPatientDetail( node, arg ); }
			var view = sessionStorage.getItem( 'nxa_pview' ) || 'upcoming';
			var box = el( 'div' );
			var bar = el( 'div', { class: 'nxa-toolbar' } );
			[ [ 'upcoming', t.upcoming ], [ 'treated', t.treated ], [ '', t.all ] ].forEach( function ( v ) { bar.appendChild( el( 'button', { type: 'button', class: 'nxa-pill' + ( view === v[ 0 ] ? ' is-active' : '' ), text: v[ 1 ], onClick: function () { sessionStorage.setItem( 'nxa_pview', v[ 0 ] ); viewPatientAppointments( node ); } } ) ); } );
			clear( node ); node.appendChild( el( 'h3', { text: t.appointments } ) ); node.appendChild( bar ); node.appendChild( box );
			load( box, api( 'patient/appointments', { query: { view: view, perPage: 100, order: view === 'upcoming' ? 'asc' : 'desc' } } ), function ( r ) {
				if ( ! r.items.length ) { box.appendChild( el( 'div', { class: 'nxa-empty' }, [ el( 'p', { text: t.empty } ), el( 'a', { class: 'nxa-btn nxa-btn-primary', href: cfg.pages.booking, text: t.bookAnother } ) ] ) ); return; }
				box.appendChild( table( [ t.doctor, t.date, t.time, t.status, t.fee, t.actions ], r.items.map( function ( a ) {
					var actions = el( 'div', { class: 'nxa-row-actions' } );
					actions.appendChild( el( 'a', { class: 'nxa-btn nxa-btn-sm', href: '#appointments/' + a.id, text: t.view } ) );
					if ( a.printUrl ) { actions.appendChild( el( 'a', { class: 'nxa-btn nxa-btn-sm', href: a.printUrl, target: '_blank', rel: 'noopener', text: t.print } ) ); }
					return [ a.doctorName, fmtDate( a.date ), a.startTime, badge( a.status ), money( a.fee ) + ' · ' + ( t[ a.paymentStatus ] || a.paymentStatus ), actions ];
				} ) ) );
			} );
		}
		function viewPatientDetail( node, id ) {
			node.appendChild( el( 'p', {}, [ el( 'a', { href: '#appointments', text: '‹ ' + t.appointments } ) ] ) );
			var box = el( 'div', { class: 'nxa-card nxa-detail' } ); node.appendChild( box );
			load( box, api( 'patient/appointments/' + id ), function ( a ) {
				box.appendChild( el( 'h3', { text: a.code } ) );
				box.appendChild( el( 'dl', {}, [ el( 'dt', { text: t.doctor } ), el( 'dd', { text: a.doctorName + ' · ' + a.departmentName } ), el( 'dt', { text: t.date } ), el( 'dd', { text: fmtDate( a.date ) + ' ' + a.startTime + ' – ' + a.endTime } ), el( 'dt', { text: t.status } ), el( 'dd', {}, [ badge( a.status ) ] ), el( 'dt', { text: t.fee } ), el( 'dd', { text: money( a.fee ) + ' · ' + ( t[ a.paymentStatus ] || a.paymentStatus ) } ), el( 'dt', { text: t.reason } ), el( 'dd', { text: a.reason || '—' } ) ] ) );
				if ( a.treatment ) {
					box.appendChild( el( 'h3', { text: t.prescriptions } ) );
					if ( a.treatment.notes ) { box.appendChild( el( 'p', { text: a.treatment.notes, style: 'white-space:pre-wrap' } ) ); }
					if ( a.treatment.items.length ) { box.appendChild( table( [ t.medicine, t.dosage, t.duration, t.instruction ], a.treatment.items.map( function ( i ) { return [ i.medicineName, i.dosage, i.duration, i.instruction ]; } ) ) ); }
					if ( a.treatment.advice ) { box.appendChild( el( 'p', {}, [ el( 'strong', { text: t.advice + ': ' } ), a.treatment.advice ] ) ); }
					if ( a.treatment.followUpDate ) { box.appendChild( el( 'p', {}, [ el( 'strong', { text: t.followUp + ': ' } ), fmtDate( a.treatment.followUpDate ) ] ) ); }
				}
				var actions = el( 'div', { class: 'nxa-actions' } );
				if ( a.printUrl ) { actions.appendChild( el( 'a', { class: 'nxa-btn nxa-btn-primary', href: a.printUrl, target: '_blank', rel: 'noopener', text: t.print } ) ); }
				if ( a.status === 'pending' || a.status === 'confirmed' ) {
					var cbtn = el( 'button', { type: 'button', class: 'nxa-btn nxa-btn-danger', text: t.cancel, onClick: function () { if ( ! window.confirm( t.cancelConfirm ) ) { return; } busy( cbtn, true ); api( 'patient/appointments/' + id + '/cancel', { method: 'POST' } ).then( function () { viewPatientDetail( clear( node ), id ); } ).catch( function ( err ) { busy( cbtn, false ); box.insertBefore( alertBox( 'error', err.message ), box.firstChild ); } ); } } );
					actions.appendChild( cbtn );
				}
				box.appendChild( actions );
			} );
		}
		function viewPayments( node ) {
			node.appendChild( el( 'h3', { text: t.payments } ) );
			var box = el( 'div' ); node.appendChild( box );
			load( box, api( 'patient/appointments', { query: { perPage: 100 } } ), function ( r ) {
				var rows = r.items.filter( function ( a ) { return Number( a.fee ) > 0; } );
				if ( ! rows.length ) { box.appendChild( el( 'div', { class: 'nxa-empty', text: t.empty } ) ); return; }
				box.appendChild( table( [ t.bookingCode, t.doctor, t.date, t.fee, t.paymentMethod, t.status ], rows.map( function ( a ) { return [ a.code, a.doctorName, fmtDate( a.date ), money( a.fee ), a.paymentMethod === 'bank_transfer' ? t.bankTransfer : ( a.paymentMethod === 'pay_at_clinic' ? t.payAtClinic : a.paymentMethod ), badge( a.paymentStatus ) ]; } ) ) );
			} );
		}
		function viewProfile( node ) {
			node.appendChild( el( 'h3', { text: t.profile } ) );
			var box = el( 'div', { class: 'nxa-card' } ); node.appendChild( box );
			var path = role === 'doctor' ? 'doctor/profile' : 'patient/profile';
			load( box, api( path ), function ( p ) {
				var name = field( { name: 'name', label: t.fullName, value: p.name, attrs: { type: 'text', required: true } } );
				var email = field( { name: 'email', label: t.email, value: p.email, attrs: { type: 'email', disabled: true } } );
				var phone = field( { name: 'phone', label: t.phone, value: p.phone, attrs: { type: 'tel' } } );
				var address = field( { name: 'address', tag: 'textarea', label: t.address, value: p.address, attrs: { rows: 3 } } );
				var bio = role === 'doctor' ? field( { name: 'bio', tag: 'textarea', label: t.about, value: p.bio, attrs: { rows: 5 } } ) : null;
				var btn = el( 'button', { type: 'submit', class: 'nxa-btn nxa-btn-primary', text: t.save } );
				var msg = el( 'div' );
				var form = el( 'form', { novalidate: true, onSubmit: function ( e ) { e.preventDefault(); clear( msg ); busy( btn, true ); var body = formData( form ); delete body.email; api( path, { method: 'POST', body: body } ).then( function () { busy( btn, false ); msg.appendChild( alertBox( 'success', t.saved ) ); } ).catch( function ( err ) { busy( btn, false ); msg.appendChild( alertBox( 'error', applyErrors( form, err.errors, err.message ) ) ); } ); } }, [ msg, name, email, phone, address, bio, el( 'div', { class: 'nxa-actions' }, [ el( 'span' ), btn ] ) ] );
				box.appendChild( form );
			} );
		}
		function viewPassword( node ) {
			node.appendChild( el( 'h3', { text: t.changePassword } ) );
			var cur = field( { name: 'currentPassword', label: t.currentPassword, attrs: { type: 'password', required: true, autocomplete: 'current-password' } } );
			var nw = field( { name: 'newPassword', label: t.newPassword, attrs: { type: 'password', required: true, minlength: 8, autocomplete: 'new-password' } } );
			var nw2 = field( { name: 'newPasswordConfirm', label: t.passwordConfirm, attrs: { type: 'password', required: true, autocomplete: 'new-password' } } );
			var btn = el( 'button', { type: 'submit', class: 'nxa-btn nxa-btn-primary', text: t.save } );
			var msg = el( 'div' );
			var form = el( 'form', { class: 'nxa-card', novalidate: true, onSubmit: function ( e ) { e.preventDefault(); clear( msg ); busy( btn, true ); api( ( role === 'doctor' ? 'doctor' : 'patient' ) + '/password', { method: 'POST', body: formData( form ) } ).then( function () { busy( btn, false ); form.reset(); applyErrors( form, {}, '' ); msg.appendChild( alertBox( 'success', t.saved ) ); } ).catch( function ( err ) { busy( btn, false ); msg.appendChild( alertBox( 'error', applyErrors( form, err.errors, err.message ) ) ); } ); } }, [ msg, cur, el( 'div', { class: 'nxa-row' }, [ nw, nw2 ] ), el( 'div', { class: 'nxa-actions' }, [ el( 'span' ), btn ] ) ] );
			node.appendChild( form );
		}

		/* --- doctor --- */
		function viewDoctorDashboard( node ) {
			node.appendChild( el( 'h3', { text: t.dashboard } ) );
			var box = el( 'div' ); node.appendChild( box );
			load( box, api( 'doctor/dashboard' ), function ( r ) {
				box.appendChild( stats( r.stats, [ [ 'today', t.today ], [ 'earningsMonth', t.earningsMonth, money ], [ 'newThisWeek', t.newThisWeek ], [ 'patients', t.totalPatients ] ] ) );
				box.appendChild( el( 'h3', { text: t.today } ) );
				if ( ! r.today.length ) { box.appendChild( el( 'div', { class: 'nxa-empty', text: t.empty } ) ); }
				else { box.appendChild( apptTable( r.today ) ); }
				if ( r.new.length ) { box.appendChild( el( 'h3', { text: t.new, style: 'margin-top:20px' } ) ); box.appendChild( apptTable( r.new ) ); }
			} );
		}
		function apptTable( items ) {
			return table( [ t.bookingCode, t.patient, t.date, t.time, t.status, t.actions ], items.map( function ( a ) {
				var actions = el( 'div', { class: 'nxa-row-actions' }, [ el( 'a', { class: 'nxa-btn nxa-btn-sm' + ( a.status === 'treated' ? '' : ' nxa-btn-primary' ), href: '#appointments/' + a.id, text: a.status === 'treated' ? t.view : t.treat } ) ] );
				if ( a.printUrl ) { actions.appendChild( el( 'a', { class: 'nxa-btn nxa-btn-sm', href: a.printUrl, target: '_blank', rel: 'noopener', text: t.print } ) ); }
				return [ a.code, a.patientName, fmtDate( a.date ), a.startTime, badge( a.status ), actions ];
			} ) );
		}
		function viewDoctorAppointments( node, arg ) {
			if ( arg ) { return viewDoctorDetail( node, arg ); }
			var view = sessionStorage.getItem( 'nxa_dview' ) || 'new';
			var bar = el( 'div', { class: 'nxa-toolbar' } );
			[ [ 'new', t.new ], [ 'pending', t.notTreated ], [ 'history', t.history ] ].forEach( function ( v ) { bar.appendChild( el( 'button', { type: 'button', class: 'nxa-pill' + ( view === v[ 0 ] ? ' is-active' : '' ), text: v[ 1 ], onClick: function () { sessionStorage.setItem( 'nxa_dview', v[ 0 ] ); viewDoctorAppointments( clear( node ) ); } } ) ); } );
			var box = el( 'div' );
			node.appendChild( el( 'h3', { text: t.appointments } ) ); node.appendChild( bar ); node.appendChild( box );
			load( box, api( 'doctor/appointments', { query: { view: view, perPage: 100, order: view === 'history' ? 'desc' : 'asc' } } ), function ( r ) {
				if ( ! r.items.length ) { box.appendChild( el( 'div', { class: 'nxa-empty', text: t.empty } ) ); return; }
				box.appendChild( apptTable( r.items ) );
			} );
		}
		function viewDoctorDetail( node, id ) {
			node.appendChild( el( 'p', {}, [ el( 'a', { href: '#appointments', text: '‹ ' + t.appointments } ) ] ) );
			var box = el( 'div' ); node.appendChild( box );
			load( box, Promise.all( [ api( 'doctor/appointments/' + id ), api( 'doctor/medicines' ) ] ), function ( res ) {
				var a = res[ 0 ], meds = res[ 1 ];
				var info = el( 'div', { class: 'nxa-card nxa-detail' } );
				info.appendChild( el( 'h3', { text: a.code + ' · ' + a.patientName } ) );
				info.appendChild( el( 'dl', {}, [ el( 'dt', { text: t.date } ), el( 'dd', { text: fmtDate( a.date ) + ' ' + a.startTime + ' – ' + a.endTime } ), el( 'dt', { text: t.status } ), el( 'dd', {}, [ badge( a.status ) ] ), el( 'dt', { text: t.phone } ), el( 'dd', { text: ( a.patient && a.patient.phone ) || '—' } ), el( 'dt', { text: t.email } ), el( 'dd', { text: ( a.patient && a.patient.email ) || '—' } ), el( 'dt', { text: t.reason } ), el( 'dd', { text: a.reason || '—' } ), el( 'dt', { text: t.fee } ), el( 'dd', { text: money( a.fee ) + ' · ' + ( t[ a.paymentStatus ] || a.paymentStatus ) } ) ] ) );
				if ( a.patientHistory && a.patientHistory.length ) { info.appendChild( el( 'h4', { text: t.previousHistory } ) ); info.appendChild( table( [ t.date, t.bookingCode, t.actions ], a.patientHistory.map( function ( h ) { return [ fmtDate( h.date ), h.code, el( 'a', { class: 'nxa-btn nxa-btn-sm', href: '#appointments/' + h.id, text: t.view } ) ]; } ) ) ); }
				box.appendChild( info );
				if ( a.status === 'cancelled' ) { return; }

				var tr = a.treatment || { notes: '', advice: '', followUpDate: '', items: [] };
				var form = el( 'form', { class: 'nxa-card', novalidate: true, style: 'margin-top:16px' } );
				var msg = el( 'div' );
				var notes = field( { name: 'notes', tag: 'textarea', label: t.treatmentNotes, value: tr.notes, attrs: { rows: 5 } } );
				var rows = el( 'div' );
				var items = tr.items.slice();
				function renderRows() {
					clear( rows );
					items.forEach( function ( it, idx ) {
						var sel = field( { name: 'medicineId', tag: 'select', label: t.medicine, value: it.medicineId || 0, options: [ { value: 0, label: '—' } ].concat( meds.medicines.map( function ( m ) { return { value: m.id, label: m.name + ( m.typeName ? ' (' + m.typeName + ')' : '' ) }; } ) ) } );
						var name = field( { name: 'medicineName', label: t.medicine, value: it.medicineName || '', attrs: { type: 'text', placeholder: t.medicine } } );
						var dosage = field( { name: 'dosage', label: t.dosage, value: it.dosage || '', attrs: { type: 'text', placeholder: '1-0-1' } } );
						var duration = field( { name: 'duration', label: t.duration, value: it.duration || '', attrs: { type: 'text', placeholder: '7 days' } } );
						var instr = field( { name: 'instruction', label: t.instruction, value: it.instruction || '', attrs: { type: 'text' } } );
						sel.input.addEventListener( 'change', function () { it.medicineId = Number( sel.input.value ); if ( it.medicineId ) { var m = meds.medicines.filter( function ( x ) { return x.id === it.medicineId; } )[ 0 ]; name.input.value = m ? m.name : ''; it.medicineName = name.input.value; } } );
						name.input.addEventListener( 'input', function () { it.medicineName = name.input.value; if ( it.medicineId ) { it.medicineId = 0; sel.input.value = '0'; } } );
						dosage.input.addEventListener( 'input', function () { it.dosage = dosage.input.value; } );
						duration.input.addEventListener( 'input', function () { it.duration = duration.input.value; } );
						instr.input.addEventListener( 'input', function () { it.instruction = instr.input.value; } );
						var medCol = el( 'div', {}, [ meds.medicines.length ? sel : null, name ] );
						rows.appendChild( el( 'div', { class: 'nxa-rx-row', 'data-index': idx }, [ medCol, dosage, duration, instr, el( 'button', { type: 'button', class: 'nxa-btn nxa-btn-sm nxa-btn-danger', text: t.remove, onClick: function () { items.splice( idx, 1 ); renderRows(); } } ) ] ) );
					} );
				}
				renderRows();
				var advice = field( { name: 'advice', tag: 'textarea', label: t.advice, value: tr.advice, attrs: { rows: 2 } } );
				var follow = field( { name: 'followUpDate', label: t.followUp, value: tr.followUpDate, attrs: { type: 'date' } } );
				var save = el( 'button', { type: 'submit', class: 'nxa-btn nxa-btn-primary', text: t.saveTreatment } );
				form.addEventListener( 'submit', function ( e ) {
					e.preventDefault(); clear( msg ); busy( save, true );
					api( 'doctor/appointments/' + id + '/treatment', { method: 'POST', body: { notes: notes.input.value, advice: advice.input.value, followUpDate: follow.input.value, items: items } } ).then( function ( r ) {
						busy( save, false ); applyErrors( form, {}, '' ); msg.appendChild( alertBox( 'success', t.saved ) );
						if ( r.appointment.printUrl ) { msg.appendChild( el( 'a', { class: 'nxa-btn', href: r.appointment.printUrl, target: '_blank', rel: 'noopener', text: t.print } ) ); }
						info.querySelector( 'dd .nxa-badge' ).replaceWith( badge( r.appointment.status ) );
					} ).catch( function ( err ) { busy( save, false ); var m = err.message; if ( err.errors ) { Object.keys( err.errors ).forEach( function ( k ) { if ( k.indexOf( 'items.' ) === 0 ) { m += ' ' + err.errors[ k ]; } } ); } msg.appendChild( alertBox( 'error', applyErrors( form, err.errors, m ) ) ); } );
				} );
				form.appendChild( el( 'h3', { text: a.treatment ? t.prescriptions : t.treat } ) );
				form.appendChild( msg );
				form.appendChild( notes );
				form.appendChild( el( 'div', { class: 'nxa-field' }, [ el( 'span', { text: t.medicines } ) ] ) );
				form.appendChild( rows );
				form.appendChild( el( 'button', { type: 'button', class: 'nxa-btn nxa-btn-sm', text: '+ ' + t.addMedicine, onClick: function () { items.push( { medicineId: 0, medicineName: '', dosage: '', duration: '', instruction: '' } ); renderRows(); } } ) );
				form.appendChild( el( 'div', { class: 'nxa-row', style: 'margin-top:12px' }, [ advice, follow ] ) );
				var actions = el( 'div', { class: 'nxa-actions' }, [ el( 'span' ), save ] );
				if ( a.printUrl ) { actions.firstChild.replaceWith( el( 'a', { class: 'nxa-btn', href: a.printUrl, target: '_blank', rel: 'noopener', text: t.print } ) ); }
				form.appendChild( actions );
				box.appendChild( form );
			} );
		}
		function viewSchedule( node ) {
			node.appendChild( el( 'h3', { text: t.timeSchedule } ) );
			var box = el( 'div', { class: 'nxa-card' } ); node.appendChild( box );
			load( box, api( 'doctor/schedule' ), function ( rows ) {
				var msg = el( 'div' );
				var form = el( 'form', { novalidate: true } );
				form.appendChild( msg );
				var state = rows.map( function ( r ) { return Object.assign( {}, r ); } );
				state.forEach( function ( r, i ) {
					var en = el( 'input', { type: 'checkbox', checked: r.enabled, onChange: function () { r.enabled = en.checked; } } );
					var st = field( { name: 'startTime' + i, label: t.from, value: r.startTime, attrs: { type: 'time', step: 300 } } );
					var en2 = field( { name: 'endTime' + i, label: t.to, value: r.endTime, attrs: { type: 'time', step: 300 } } );
					var sl = field( { name: 'slotMinutes' + i, label: t.slotLength, value: r.slotMinutes, attrs: { type: 'number', min: 5, max: 240, step: 5 } } );
					st.input.addEventListener( 'change', function () { r.startTime = st.input.value; } );
					en2.input.addEventListener( 'change', function () { r.endTime = en2.input.value; } );
					sl.input.addEventListener( 'change', function () { r.slotMinutes = Number( sl.input.value ); } );
					form.appendChild( el( 'div', { class: 'nxa-sched-row' }, [ el( 'strong', { text: WEEKDAYS[ r.weekday ] } ), el( 'label', { class: 'nxa-toggle' }, [ en, t.enabled ] ), st, en2, sl ] ) );
				} );
				var btn = el( 'button', { type: 'submit', class: 'nxa-btn nxa-btn-primary', text: t.save } );
				form.appendChild( el( 'div', { class: 'nxa-actions' }, [ el( 'span' ), btn ] ) );
				form.addEventListener( 'submit', function ( e ) { e.preventDefault(); clear( msg ); busy( btn, true ); api( 'doctor/schedule', { method: 'PUT', body: { schedule: state } } ).then( function () { busy( btn, false ); msg.appendChild( alertBox( 'success', t.saved ) ); } ).catch( function ( err ) { busy( btn, false ); var m = err.message; Object.keys( err.errors || {} ).forEach( function ( k ) { m += ' ' + err.errors[ k ]; } ); msg.appendChild( alertBox( 'error', m ) ); } ); } );
				box.appendChild( form );
			} );
		}
		function viewLeaves( node ) {
			node.appendChild( el( 'h3', { text: t.leaveDays } ) );
			var box = el( 'div' ); node.appendChild( box );
			function draw() {
				load( box, api( 'doctor/leaves' ), function ( leaves ) {
					var date = field( { name: 'date', label: t.date, attrs: { type: 'date', required: true, min: ymd( new Date() ) } } );
					var note = field( { name: 'note', label: t.note, attrs: { type: 'text', maxlength: 190 } } );
					var btn = el( 'button', { type: 'submit', class: 'nxa-btn nxa-btn-primary', text: t.addLeave } );
					var msg = el( 'div' );
					var form = el( 'form', { class: 'nxa-card', novalidate: true, onSubmit: function ( e ) { e.preventDefault(); clear( msg ); busy( btn, true ); api( 'doctor/leaves', { method: 'POST', body: formData( form ) } ).then( draw ).catch( function ( err ) { busy( btn, false ); msg.appendChild( alertBox( 'error', applyErrors( form, err.errors, err.message ) ) ); } ); } }, [ msg, el( 'div', { class: 'nxa-row' }, [ date, note ] ), el( 'div', { class: 'nxa-actions' }, [ el( 'span' ), btn ] ) ] );
					box.appendChild( form );
					if ( ! leaves.length ) { box.appendChild( el( 'div', { class: 'nxa-empty', text: t.empty, style: 'margin-top:12px' } ) ); return; }
					box.appendChild( table( [ t.date, t.note, t.actions ], leaves.map( function ( l ) { return [ fmtDate( l.date ), l.note, el( 'button', { type: 'button', class: 'nxa-btn nxa-btn-sm nxa-btn-danger', text: t.remove, onClick: function () { api( 'doctor/leaves/' + l.id, { method: 'DELETE' } ).then( draw ); } } ) ]; } ) ) );
				} );
			}
			draw();
		}
	}

	/* ---------------- mount ---------------- */
	function mount() {
		document.querySelectorAll( '[data-nxa="booking"]' ).forEach( Booking );
		document.querySelectorAll( '[data-nxa="auth"]' ).forEach( function ( n ) { Auth( n ); } );
		document.querySelectorAll( '[data-nxa="panel"]' ).forEach( Panel );
	}
	if ( document.readyState === 'loading' ) { document.addEventListener( 'DOMContentLoaded', mount ); } else { mount(); }
	window.nexulesuiteAppt = { api: api, mount: mount };
} )();
