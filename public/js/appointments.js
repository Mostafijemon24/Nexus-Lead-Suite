/* Nexus Lead Suite — appointment module front end: booking, auth, patient and doctor panels.
 * Vanilla JS, no dependencies. Mount points: [data-nxa="booking"], [data-nxa="auth"], [data-nxa="panel"], [data-nxa="tabs"].
 * Structure follows the observed original (DocMent): Patient/Doctor tabs on login and register,
 * a Department → Doctor → Date → Schedule booking form, a "Create Appointment" box on the doctor
 * profile, patient Dashboard / Appointment-Prescription List / Order List, doctor Today Appointments /
 * Manage Appointment (New, Not treated, History) / Manage Leave / Payment History / Time Schedule. */
( function () {
	'use strict';

	var cfg = window.nexulesuite_Appt || {};
	var t = cfg.i18n || {};
	var WEEKDAYS = cfg.weekdays || [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ];
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
	function sameOrigin( url ) { if ( ! url ) { return ''; } try { return new URL( url, window.location.href ).origin === window.location.origin ? url : ''; } catch ( e ) { return ''; } } // open-redirect guard for ?redirect_to=
	function clear( node ) { while ( node.firstChild ) { node.removeChild( node.firstChild ); } return node; }
	function money( v ) { v = Number( v || 0 ); return v > 0 ? ( cfg.currencySymbol || '$' ) + v.toFixed( 2 ) : ( t.free || 'Free' ); }
	function badge( status ) { return el( 'span', { class: 'nxa-badge nxa-badge-' + status, text: t[ status ] || status } ); }
	function pad( n ) { return ( n < 10 ? '0' : '' ) + n; }
	function ymd( d ) { return d.getFullYear() + '-' + pad( d.getMonth() + 1 ) + '-' + pad( d.getDate() ); }
	function parseYmd( s ) { var p = s.split( '-' ); return new Date( Number( p[ 0 ] ), Number( p[ 1 ] ) - 1, Number( p[ 2 ] ) ); }
	function fmtDate( s ) { if ( ! s ) { return ''; } var d = parseYmd( s ); return WEEKDAYS[ d.getDay() ].slice( 0, 3 ) + ', ' + d.getDate() + ' ' + MONTHS[ d.getMonth() ].slice( 0, 3 ) + ' ' + d.getFullYear(); }
	function addDays( s, n ) { var d = parseYmd( s ); d.setDate( d.getDate() + n ); return ymd( d ); }
	function today() { return cfg.today || ymd( new Date() ); }

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
					var err = new Error( ( data && data.code === 'rest_cookie_invalid_nonce' && t.sessionExpired ) || ( data && data.message ) || ( t.networkError || 'Request failed' ) );
					err.code = data && data.code; err.status = res.status; err.errors = ( data && data.data && data.data.errors ) || {}; err.data = ( data && data.data ) || {};
					throw err;
				}
				return data;
			} );
		}, function () { var err = new Error( t.networkError || 'Network error' ); err.code = 'network'; err.errors = {}; err.data = {}; throw err; } );
	}

	function alertBox( kind, msg, extra ) { var a = el( 'div', { class: 'nxa-alert nxa-alert-' + kind, role: kind === 'error' ? 'alert' : 'status', text: msg } ); if ( extra ) { a.appendChild( document.createTextNode( ' ' ) ); a.appendChild( extra ); } return a; }
	function skeleton( n ) { var w = el( 'div' ); for ( var i = 0; i < ( n || 4 ); i++ ) { w.appendChild( el( 'div', { class: 'nxa-skeleton', style: 'width:' + ( 60 + ( i * 13 ) % 40 ) + '%' } ) ); } return w; }
	function field( opts ) {
		var input = el( opts.tag || 'input', Object.assign( { name: opts.name, id: 'nxa-' + opts.name + '-' + Math.random().toString( 36 ).slice( 2, 6 ) }, opts.attrs || {} ) );
		if ( opts.tag === 'select' ) { ( opts.options || [] ).forEach( function ( o ) { input.appendChild( el( 'option', { value: o.value, text: o.label, selected: String( o.value ) === String( opts.value ), disabled: !! o.disabled } ) ); } ); }
		else if ( opts.value !== undefined ) { input.value = opts.value; }
		var wrap = el( 'label', { class: 'nxa-field', for: input.id }, [ el( 'span', { text: opts.label } ), input ] );
		wrap.showError = function ( msg ) { wrap.classList.toggle( 'has-error', !! msg ); var e = wrap.querySelector( '.nxa-error-text' ); if ( e ) { e.remove(); } if ( msg ) { wrap.appendChild( el( 'span', { class: 'nxa-error-text', text: msg } ) ); } };
		wrap.input = input;
		wrap.setOptions = function ( options, value ) { clear( input ); options.forEach( function ( o ) { input.appendChild( el( 'option', { value: o.value, text: o.label, selected: String( o.value ) === String( value ), disabled: !! o.disabled } ) ); } ); };
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
	function refreshSession( role ) { return api( 'public/me' ).then( function ( me ) { cfg.nonce = me.nonce || cfg.nonce; cfg.loggedIn = !! me.loggedIn; cfg.role = me.role || role; } ); }

	/* ---------------- Tabs (doctor profile) ---------------- */
	function Tabs( root ) {
		var buttons = root.querySelectorAll( '[data-nxa-tab]' );
		var panels = root.querySelectorAll( '[data-nxa-panel]' );
		function activate( key ) {
			buttons.forEach( function ( b ) { var on = b.getAttribute( 'data-nxa-tab' ) === key; b.classList.toggle( 'is-active', on ); b.setAttribute( 'aria-selected', on ? 'true' : 'false' ); } );
			panels.forEach( function ( p ) { var on = p.getAttribute( 'data-nxa-panel' ) === key; p.classList.toggle( 'is-active', on ); p.hidden = ! on; } );
		}
		buttons.forEach( function ( b ) { b.addEventListener( 'click', function () { activate( b.getAttribute( 'data-nxa-tab' ) ); } ); } );
		document.querySelectorAll( '[data-nxa-tab-link]' ).forEach( function ( a ) { a.addEventListener( 'click', function ( e ) { e.preventDefault(); activate( a.getAttribute( 'data-nxa-tab-link' ) ); root.scrollIntoView( { behavior: 'smooth', block: 'start' } ); } ); } );
		if ( location.hash === '#nxa-tab-appointment' ) { activate( 'appointment' ); }
	}

	/* ---------------- Auth (Patient | Doctor tabs, login | register) ---------------- */
	function Auth( root, opts ) {
		opts = opts || {};
		var type = opts.type || root.getAttribute( 'data-type' ) || 'patient';
		var mode = opts.mode || root.getAttribute( 'data-mode' ) || 'login';
		var redirectTo = sameOrigin( opts.redirect || root.getAttribute( 'data-redirect' ) || '' );
		var notice = null;
		var verified = root.getAttribute( 'data-verified' );
		if ( verified === 'ok' ) { notice = alertBox( 'success', t.verifiedOk ); }
		if ( verified === 'fail' ) { notice = alertBox( 'error', t.verifiedFail ); mode = 'resend'; }
		var lookups = null;

		function render() {
			clear( root );
			var box = el( 'div', { class: opts.inline ? 'nxa-inline-auth' : 'nxa-card' } );
			if ( notice ) { box.appendChild( notice ); }
			if ( ! opts.inline && ( mode === 'login' || mode === 'register' ) ) {
				box.appendChild( el( 'h3', { text: mode === 'login' ? t.login : t.register } ) );
				box.appendChild( el( 'div', { class: 'nxa-tabs', role: 'tablist' }, [
					el( 'button', { type: 'button', role: 'tab', 'aria-selected': type === 'patient' ? 'true' : 'false', class: 'nxa-tab' + ( type === 'patient' ? ' is-active' : '' ), text: t.patientTab, onClick: function () { type = 'patient'; render(); } } ),
					el( 'button', { type: 'button', role: 'tab', 'aria-selected': type === 'doctor' ? 'true' : 'false', class: 'nxa-tab' + ( type === 'doctor' ? ' is-active' : '' ), text: t.doctorTab, onClick: function () { type = 'doctor'; render(); } } ),
				] ) );
			} else if ( opts.inline ) {
				box.appendChild( el( 'div', { class: 'nxa-tabs', role: 'tablist' }, [
					el( 'button', { type: 'button', role: 'tab', class: 'nxa-tab' + ( mode === 'login' ? ' is-active' : '' ), text: t.login, onClick: function () { mode = 'login'; render(); } } ),
					el( 'button', { type: 'button', role: 'tab', class: 'nxa-tab' + ( mode !== 'login' ? ' is-active' : '' ), text: t.register, onClick: function () { mode = 'register'; render(); } } ),
				] ) );
			}
			if ( mode === 'login' ) { box.appendChild( loginForm() ); }
			else if ( mode === 'register' ) { box.appendChild( type === 'doctor' ? doctorRegisterForm() : registerForm() ); }
			else { box.appendChild( verifyBox() ); }
			root.appendChild( box );
		}
		function footer( isLogin ) {
			return el( 'p', { class: 'nxa-auth-foot' }, [ ( isLogin ? t.noAccount : t.haveAccount ) + ' ', el( 'a', { href: '#', text: isLogin ? t.signUp : t.login, onClick: function ( e ) { e.preventDefault(); mode = isLogin ? 'register' : 'login'; notice = null; render(); } } ) ] );
		}
		function loginForm() {
			var email = field( { name: 'email', label: t.email, attrs: { type: 'email', required: true, autocomplete: 'email' } } );
			var pass = field( { name: 'password', label: t.password, attrs: { type: 'password', required: true, autocomplete: 'current-password' } } );
			var remember = el( 'input', { type: 'checkbox', name: 'remember', value: '1' } );
			var btn = el( 'button', { type: 'submit', class: 'nxa-btn nxa-btn-primary', text: t.login } );
			var msg = el( 'div' );
			var form = el( 'form', { novalidate: true, onSubmit: function ( e ) {
				e.preventDefault(); clear( msg ); busy( btn, true );
				api( 'public/login', { method: 'POST', body: { email: email.input.value, password: pass.input.value, remember: remember.checked, type: type } } ).then( function ( r ) {
					cfg.nonce = r.nonce || cfg.nonce; cfg.loggedIn = true; cfg.role = type;
					if ( opts.onSuccess ) { return refreshSession( type ).then( function () { opts.onSuccess( r ); } ); }
					window.location.href = redirectTo || r.redirect;
				} ).catch( function ( err ) {
					busy( btn, false );
					msg.appendChild( alertBox( 'error', applyErrors( form, err.errors, err.message ) ) );
					if ( err.code === 'email_unverified' ) { msg.appendChild( el( 'button', { type: 'button', class: 'nxa-btn nxa-btn-sm', text: t.resend, onClick: function () { mode = 'resend'; render(); } } ) ); }
				} );
			} }, [ msg, email, pass, el( 'label', { class: 'nxa-check-field' }, [ remember, t.rememberMe ] ), el( 'div', { class: 'nxa-actions' }, [ el( 'a', { href: cfg.lostPasswordUrl, text: t.forgot } ), btn ] ), footer( true ) ] );
			return form;
		}
		function registerForm() {
			var name = field( { name: 'name', label: t.name, attrs: { type: 'text', required: true, autocomplete: 'name' } } );
			var email = field( { name: 'email', label: t.email, attrs: { type: 'email', required: true, autocomplete: 'email' } } );
			var pass = field( { name: 'password', label: t.password, attrs: { type: 'password', required: true, minlength: 8, autocomplete: 'new-password' } } );
			var pass2 = field( { name: 'passwordConfirm', label: t.passwordConfirm, attrs: { type: 'password', required: true, autocomplete: 'new-password' } } );
			var btn = el( 'button', { type: 'submit', class: 'nxa-btn nxa-btn-primary', text: t.register } );
			var msg = el( 'div' );
			var form = el( 'form', { novalidate: true, onSubmit: function ( e ) {
				e.preventDefault(); clear( msg ); busy( btn, true );
				api( 'public/register', { method: 'POST', body: formData( form ) } ).then( function ( r ) {
					if ( r.verificationRequired ) { notice = alertBox( 'info', t.checkInbox ); mode = 'verify'; render(); return; }
					if ( opts.onSuccess ) { return refreshSession( 'patient' ).then( function () { opts.onSuccess( r ); } ); }
					window.location.href = redirectTo || r.redirect;
				} ).catch( function ( err ) { busy( btn, false ); msg.appendChild( alertBox( 'error', applyErrors( form, err.errors, err.message ) ) ); } );
			} }, [ msg, name, email, pass, pass2, el( 'div', { class: 'nxa-actions' }, [ el( 'span' ), btn ] ), footer( false ) ] );
			return form;
		}
		function doctorRegisterForm() {
			var name = field( { name: 'name', label: t.name, attrs: { type: 'text', required: true } } );
			var desig = field( { name: 'designations', label: t.designations, attrs: { type: 'text', placeholder: 'MBBS, FCPS' } } );
			var email = field( { name: 'email', label: t.email, attrs: { type: 'email', required: true } } );
			var phone = field( { name: 'phone', label: t.phone, attrs: { type: 'tel' } } );
			var pass = field( { name: 'password', label: t.password, attrs: { type: 'password', required: true, minlength: 8, autocomplete: 'new-password' } } );
			var pass2 = field( { name: 'passwordConfirm', label: t.passwordConfirm, attrs: { type: 'password', required: true, autocomplete: 'new-password' } } );
			var dep = field( { name: 'departmentId', tag: 'select', label: t.selectDepartment, options: [ { value: '', label: t.selectDepartment } ] } );
			var loc = field( { name: 'locationId', tag: 'select', label: t.selectLocation, options: [ { value: '', label: t.selectLocation } ] } );
			var btn = el( 'button', { type: 'submit', class: 'nxa-btn nxa-btn-primary', text: t.register } );
			var msg = el( 'div' );
			( lookups ? Promise.resolve( lookups ) : Promise.all( [ api( 'public/departments' ), api( 'public/locations' ) ] ).then( function ( r ) { lookups = r; return r; } ) ).then( function ( r ) {
				dep.setOptions( [ { value: '', label: t.selectDepartment } ].concat( r[ 0 ].items.map( function ( d ) { return { value: d.id, label: d.name }; } ) ) );
				loc.setOptions( [ { value: '', label: t.selectLocation } ].concat( r[ 1 ].items.map( function ( d ) { return { value: d.id, label: d.name }; } ) ) );
			} ).catch( function ( err ) { msg.appendChild( alertBox( 'error', err.message ) ); } );
			var form = el( 'form', { novalidate: true, onSubmit: function ( e ) {
				e.preventDefault(); clear( msg ); busy( btn, true );
				var body = formData( form ); body.type = 'doctor';
				api( 'public/register', { method: 'POST', body: body } ).then( function () { notice = alertBox( 'success', t.doctorPending ); mode = 'login'; render(); } )
					.catch( function ( err ) { busy( btn, false ); msg.appendChild( alertBox( 'error', applyErrors( form, err.errors, err.message ) ) ); } );
			} }, [ msg, name, desig, email, phone, el( 'div', { class: 'nxa-row' }, [ pass, pass2 ] ), el( 'div', { class: 'nxa-row' }, [ dep, loc ] ), el( 'div', { class: 'nxa-actions' }, [ el( 'span' ), btn ] ), footer( false ) ] );
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

	/* ---------------- Booking: Department → Doctor → Date → Schedule → (review) → confirm ---------------- */
	function Booking( root ) {
		var compact = root.getAttribute( 'data-compact' ) === '1';
		var presetDoctor = Number( root.getAttribute( 'data-doctor-id' ) || 0 );
		var presetDept = Number( root.getAttribute( 'data-department-id' ) || 0 );
		var S = { departments: null, doctors: [], doctor: null, date: '', day: null, slot: null, reason: '', paymentMethod: 'pay_at_clinic', stage: 'form', result: null, error: '' };
		var maxDate = addDays( today(), Number( cfg.bookingWindowDays || 30 ) );

		function render() {
			clear( root );
			if ( S.stage === 'done' ) { root.appendChild( successView() ); return; }
			if ( S.stage === 'review' ) { root.appendChild( reviewView() ); return; }
			if ( ! S.departments ) {
				root.appendChild( skeleton( 3 ) );
				var reqs = [ api( 'public/departments' ) ];
				if ( presetDoctor ) { reqs.push( api( 'public/doctors', { query: { perPage: 50 } } ) ); }
				Promise.all( reqs ).then( function ( r ) {
					S.departments = r[ 0 ].items;
					if ( presetDoctor ) { S.doctor = r[ 1 ].items.filter( function ( d ) { return d.id === presetDoctor; } )[ 0 ] || null; if ( ! S.doctor ) { presetDoctor = 0; } }
					render();
				} ).catch( fail );
				return;
			}
			root.appendChild( formView() );
		}
		function formView() {
			var wrap = el( 'div' );
			if ( S.error ) { wrap.appendChild( alertBox( 'error', S.error ) ); }
			var form = el( 'form', { class: 'nxa-booking-form' + ( compact ? '' : ' is-wide' ), novalidate: true } );
			var dep = null, doc = null;
			if ( ! presetDoctor ) {
				dep = field( { name: 'departmentId', tag: 'select', label: t.selectDepartment, value: presetDept || '', options: [ { value: '', label: t.selectDepartment } ].concat( S.departments.map( function ( d ) { return { value: d.id, label: d.name }; } ) ) } );
				doc = field( { name: 'doctorId', tag: 'select', label: t.selectDoctor, value: S.doctor ? S.doctor.id : '', options: [ { value: '', label: t.selectDoctor } ].concat( S.doctors.map( function ( d ) { return { value: d.id, label: d.name }; } ) ) } );
				dep.input.addEventListener( 'change', function () {
					S.doctor = null; S.doctors = []; S.date = ''; S.day = null; S.slot = null;
					doc.setOptions( [ { value: '', label: t.loading } ], '' ); sched.setOptions( [ { value: '', label: t.selectSchedule } ], '' ); dateF.input.value = '';
					if ( ! dep.input.value ) { doc.setOptions( [ { value: '', label: t.selectDoctor } ], '' ); return; }
					api( 'public/doctors', { query: { departmentId: dep.input.value, perPage: 50 } } ).then( function ( r ) { S.doctors = r.items; doc.setOptions( [ { value: '', label: r.items.length ? t.selectDoctor : t.noDoctors } ].concat( r.items.map( function ( d ) { return { value: d.id, label: d.name + ( d.fee > 0 ? ' · ' + money( d.fee ) : '' ) }; } ) ), '' ); } ).catch( function ( err ) { msg.appendChild( alertBox( 'error', err.message ) ); } );
				} );
				doc.input.addEventListener( 'change', function () { S.doctor = S.doctors.filter( function ( d ) { return String( d.id ) === doc.input.value; } )[ 0 ] || null; S.date = ''; S.day = null; S.slot = null; dateF.input.value = ''; sched.setOptions( [ { value: '', label: t.selectSchedule } ], '' ); } );
				if ( presetDept && ! S.doctors.length ) { setTimeout( function () { dep.input.dispatchEvent( new Event( 'change' ) ); }, 0 ); }
			}
			var dateF = field( { name: 'date', label: t.selectDate, value: S.date, attrs: { type: 'date', min: today(), max: maxDate, required: true } } );
			var sched = field( { name: 'startTime', tag: 'select', label: t.selectSchedule, value: S.slot ? S.slot.start : '', options: [ { value: '', label: t.selectSchedule } ] } );
			var msg = el( 'div', { class: 'nxa-booking-msg' } );
			if ( S.day ) { fillSchedule( sched, msg ); }
			dateF.input.addEventListener( 'change', function () {
				S.date = dateF.input.value; S.slot = null; S.day = null; clear( msg );
				if ( ! S.doctor ) { sched.setOptions( [ { value: '', label: t.selectSchedule } ], '' ); msg.appendChild( alertBox( 'info', t.chooseDoctor ) ); return; }
				if ( ! S.date ) { return; }
				sched.setOptions( [ { value: '', label: t.loadingSchedule } ], '' );
				api( 'public/availability', { query: { doctorId: S.doctor.id, date: S.date } } ).then( function ( r ) { S.day = r; fillSchedule( sched, msg ); } ).catch( function ( err ) { msg.appendChild( alertBox( 'error', err.message ) ); } );
			} );
			sched.input.addEventListener( 'change', function () { S.slot = S.day ? S.day.slots.filter( function ( s ) { return s.start === sched.input.value; } )[ 0 ] || null : null; } );
			var btn = el( 'button', { type: 'submit', class: 'nxa-btn nxa-btn-primary', text: compact ? t.submit : t.createAppointment } );
			form.addEventListener( 'submit', function ( e ) {
				e.preventDefault(); S.error = '';
				if ( ! S.doctor ) { msg.appendChild( alertBox( 'error', t.chooseDoctor ) ); return; }
				if ( ! S.date ) { msg.appendChild( alertBox( 'error', t.chooseDate ) ); return; }
				if ( ! S.slot ) { msg.appendChild( alertBox( 'error', t.chooseTime ) ); return; }
				S.stage = 'review'; render();
			} );
			if ( presetDoctor && ! compact ) { wrap.appendChild( el( 'div', { class: 'nxa-doctor-pick' }, [ S.doctor.name + ' · ' + S.doctor.departmentName ] ) ); }
			if ( dep ) { form.appendChild( dep ); form.appendChild( doc ); }
			form.appendChild( dateF ); form.appendChild( sched ); form.appendChild( el( 'div', {}, [ btn ] ) );
			wrap.appendChild( form ); wrap.appendChild( msg );
			if ( ! S.day ) { msg.appendChild( el( 'p', { class: 'nxa-muted', text: t.noAvailability } ) ); }
			return wrap;
		}
		function fillSchedule( sched, msg ) {
			clear( msg );
			var r = S.day;
			if ( r.status === 'leave' ) { sched.setOptions( [ { value: '', label: t.selectSchedule } ], '' ); msg.appendChild( alertBox( 'info', t.onLeave ) ); return; }
			if ( r.status === 'closed' || r.status === 'past' || r.status === 'beyond' ) { sched.setOptions( [ { value: '', label: t.selectSchedule } ], '' ); msg.appendChild( alertBox( 'info', t.closed ) ); return; }
			if ( r.status === 'full' ) { msg.appendChild( alertBox( 'info', t.noSlots ) ); }
			sched.setOptions( [ { value: '', label: t.selectSchedule } ].concat( r.slots.map( function ( s ) { return { value: s.start, label: s.label || ( s.start + ' - ' + s.end ), disabled: ! s.available }; } ) ), S.slot ? S.slot.start : '' );
		}
		function reviewView() {
			var body = el( 'div' );
			if ( S.error ) { body.appendChild( alertBox( 'error', S.error ) ); }
			body.appendChild( el( 'h3', { text: t.review } ) );
			body.appendChild( el( 'ul', { class: 'nxa-summary' }, [
				el( 'li', {}, [ el( 'span', { text: t.doctor } ), el( 'strong', { text: S.doctor.name } ) ] ),
				el( 'li', {}, [ el( 'span', { text: t.department } ), el( 'span', { text: S.doctor.departmentName } ) ] ),
				el( 'li', {}, [ el( 'span', { text: t.date } ), el( 'span', { text: fmtDate( S.date ) } ) ] ),
				el( 'li', {}, [ el( 'span', { text: t.time } ), el( 'span', { text: S.slot.label || ( S.slot.start + ' - ' + S.slot.end ) } ) ] ),
				el( 'li', {}, [ el( 'span', { text: t.fee } ), el( 'strong', { text: money( S.doctor.fee ) } ) ] ),
			] ) );
			var back = el( 'button', { type: 'button', class: 'nxa-btn', text: t.back, onClick: function () { S.stage = 'form'; S.error = ''; render(); } } );
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
					api( 'patient/appointments', { method: 'POST', body: { doctorId: S.doctor.id, date: S.date, startTime: S.slot.start, reason: S.reason, paymentMethod: S.paymentMethod } } ).then( function ( r ) { S.result = r; S.stage = 'done'; render(); } ).catch( function ( err ) {
						busy( btn, false ); S.error = err.message;
						if ( err.code === 'profile_incomplete' ) { S.error = ''; clear( body ); body.appendChild( alertBox( 'error', err.message || t.profileIncomplete, el( 'a', { class: 'nxa-btn nxa-btn-sm nxa-btn-primary', href: ( err.data && err.data.redirect ) || cfg.pages.patientPanel + '#profile', text: t.completeProfile } ) ) ); body.appendChild( back ); return; }
						if ( err.code === 'slot_taken' || err.code === 'invalid_slot' ) { S.day = null; S.slot = null; S.stage = 'form'; }
						render();
					} );
				} } );
				body.appendChild( el( 'div', { class: 'nxa-actions' }, [ back, btn ] ) );
			} else if ( cfg.loggedIn ) {
				body.appendChild( alertBox( 'info', t.loginToBook ) );
				body.appendChild( el( 'div', { class: 'nxa-actions' }, [ back, el( 'a', { class: 'nxa-btn', href: cfg.logoutUrl, text: t.logout } ) ] ) );
			} else {
				body.appendChild( alertBox( 'info', t.loginToBook ) );
				var mount = el( 'div' );
				body.appendChild( mount );
				Auth( mount, { type: 'patient', inline: true, onSuccess: function () { render(); } } );
				body.appendChild( el( 'div', { class: 'nxa-actions' }, [ back ] ) );
			}
			return body;
		}
		function successView() {
			var r = S.result;
			return el( 'div', { class: 'nxa-success' }, [
				el( 'div', { class: 'nxa-check', text: '✓' } ),
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
					el( 'a', { class: 'nxa-btn nxa-btn-primary', href: cfg.pages.patientPanel + '#orders', text: t.viewAppointments } ),
					el( 'button', { type: 'button', class: 'nxa-btn', text: t.bookAnother, onClick: function () { S.result = null; S.date = ''; S.slot = null; S.day = null; S.stage = 'form'; render(); } } ),
				] ),
			] );
		}
		function fail( err ) { clear( root ); root.appendChild( alertBox( 'error', err.message ) ); root.appendChild( el( 'button', { type: 'button', class: 'nxa-btn', text: t.retry, onClick: function () { S.departments = null; render(); } } ) ); }
		render();
	}

	/* ---------------- Panels ---------------- */
	function Panel( root ) {
		var role = root.getAttribute( 'data-role' );
		var items = role === 'doctor'
			? [ [ 'dashboard', t.dashboard ], [ 'today', t.todayAppointments ], [ 'appointments', t.manageAppointment ], [ 'leaves', t.manageLeave ], [ 'payments', t.paymentHistory ], [ 'schedule', t.timeSchedule ], [ 'profile', t.updateProfile ], [ 'password', t.changePassword ] ]
			: [ [ 'dashboard', t.dashboard ], [ 'book', t.makeAppointment ], [ 'appointments', t.appointmentList ], [ 'orders', t.orderList ], [ 'profile', t.editProfile ], [ 'password', t.changePassword ] ];
		var views = { dashboard: role === 'doctor' ? viewDoctorDashboard : viewPatientDashboard, today: viewDoctorToday, appointments: role === 'doctor' ? viewDoctorAppointments : viewPatientAppointments, orders: viewOrders, payments: viewDoctorPayments, profile: viewProfile, password: viewPassword, schedule: viewSchedule, leaves: viewLeaves };
		var content = el( 'div', { class: 'nxa-content' } );
		var side = el( 'nav', { class: 'nxa-side', 'aria-label': 'Account' } );
		function current() { var h = ( location.hash || '' ).replace( '#', '' ).split( '/' ); return { view: views[ h[ 0 ] ] ? h[ 0 ] : items[ 0 ][ 0 ], arg: h[ 1 ] || '' }; }
		function renderSide() {
			clear( side );
			var cur = current().view;
			items.forEach( function ( it ) {
				if ( it[ 0 ] === 'book' ) { side.appendChild( el( 'a', { href: cfg.pages.booking, text: it[ 1 ] } ) ); return; }
				side.appendChild( el( 'a', { href: '#' + it[ 0 ], class: cur === it[ 0 ] ? 'is-active' : '', text: it[ 1 ] } ) );
			} );
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
		function chart( byDay, month ) {
			var wrap = el( 'div', { class: 'nxa-chart-wrap' }, [ el( 'h3', { text: t.earningsMonth } ) ] );
			if ( ! byDay || ! byDay.length ) { wrap.appendChild( el( 'p', { class: 'nxa-muted', text: t.noEarnings } ) ); return wrap; }
			var max = Math.max.apply( null, byDay.map( function ( d ) { return d.amount; } ) ) || 1;
			var days = new Date( Number( month.slice( 0, 4 ) ), Number( month.slice( 5, 7 ) ), 0 ).getDate();
			var map = {}; byDay.forEach( function ( d ) { map[ d.date ] = d.amount; } );
			var bars = el( 'div', { class: 'nxa-chart', role: 'img', 'aria-label': t.earningsMonth } );
			for ( var i = 1; i <= days; i++ ) {
				var key = month + '-' + pad( i ); var amt = map[ key ] || 0;
				bars.appendChild( el( 'div', { class: 'nxa-chart-bar', title: key + ': ' + money( amt ) }, [ el( 'i', { style: 'height:' + Math.round( ( amt / max ) * 100 ) + '%' } ), el( 'span', { text: String( i ) } ) ] ) );
			}
			wrap.appendChild( bars );
			return wrap;
		}
		function apptTable( items, who ) {
			var header = who === 'doctor' ? t.patient : t.doctor;
			return table( [ t.bookingCode, header, t.date, t.time, t.status, t.actions ], items.map( function ( a ) {
				var actions = el( 'div', { class: 'nxa-row-actions' }, [ el( 'a', { class: 'nxa-btn nxa-btn-sm' + ( who === 'doctor' && a.status !== 'treated' && a.status !== 'cancelled' ? ' nxa-btn-primary' : '' ), href: '#appointments/' + a.id, text: who === 'doctor' && a.status !== 'treated' && a.status !== 'cancelled' ? t.treat : t.view } ) ] );
				if ( a.printUrl ) { actions.appendChild( el( 'a', { class: 'nxa-btn nxa-btn-sm', href: a.printUrl, target: '_blank', rel: 'noopener', text: t.print } ) ); }
				return [ a.code, who === 'doctor' ? a.patientName : a.doctorName, fmtDate( a.date ), a.startTime, badge( a.status ), actions ];
			} ) );
		}

		/* --- patient --- */
		function viewPatientDashboard( node ) {
			node.appendChild( el( 'h3', { text: t.dashboard } ) );
			var box = el( 'div' ); node.appendChild( box );
			load( box, api( 'patient/dashboard' ), function ( r ) {
				if ( ! r.profileComplete ) { box.appendChild( alertBox( 'info', t.profileIncomplete, el( 'a', { class: 'nxa-btn nxa-btn-sm', href: '#profile', text: t.completeProfile } ) ) ); }
				box.appendChild( stats( r.stats, [ [ 'upcoming', t.upcoming ], [ 'treated', t.treated ], [ 'total', t.total ] ] ) );
				box.appendChild( el( 'div', { class: 'nxa-panel-head' }, [ el( 'h3', { text: t.upcoming } ), el( 'a', { class: 'nxa-btn nxa-btn-primary nxa-btn-sm', href: cfg.pages.booking, text: t.makeAppointment } ) ] ) );
				if ( ! r.upcoming.length ) { box.appendChild( el( 'div', { class: 'nxa-empty', text: t.empty } ) ); } else { box.appendChild( apptTable( r.upcoming, 'patient' ) ); }
			} );
		}
		function viewPatientAppointments( node, arg ) {
			if ( arg ) { return viewPatientDetail( node, arg ); }
			// The original lists only appointments already treated by a doctor; other filters are a superset.
			var view = typeof node.nxaView === 'string' ? node.nxaView : 'treated'; // resets to "treated" on every page load, as on the original
			var box = el( 'div' );
			var bar = el( 'div', { class: 'nxa-toolbar' } );
			[ [ 'treated', t.treated ], [ 'upcoming', t.upcoming ], [ '', t.all ] ].forEach( function ( v ) { bar.appendChild( el( 'button', { type: 'button', class: 'nxa-pill' + ( view === v[ 0 ] ? ' is-active' : '' ), text: v[ 1 ], onClick: function () { node.nxaView = v[ 0 ]; viewPatientAppointments( clear( node ) ); } } ) ); } );
			node.appendChild( el( 'h3', { text: t.appointmentList } ) ); node.appendChild( bar ); node.appendChild( box );
			load( box, api( 'patient/appointments', { query: { view: view, perPage: 100, order: view === 'upcoming' ? 'asc' : 'desc' } } ), function ( r ) {
				if ( ! r.items.length ) { box.appendChild( el( 'div', { class: 'nxa-empty' }, [ el( 'p', { text: t.empty } ), el( 'a', { class: 'nxa-btn nxa-btn-primary', href: cfg.pages.booking, text: t.makeAppointment } ) ] ) ); return; }
				box.appendChild( apptTable( r.items, 'patient' ) );
			} );
		}
		function viewPatientDetail( node, id ) {
			node.appendChild( el( 'p', {}, [ el( 'a', { href: '#appointments', text: '‹ ' + t.appointmentList } ) ] ) );
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
		function viewOrders( node ) {
			node.appendChild( el( 'h3', { text: t.orderList } ) );
			var box = el( 'div' ); node.appendChild( box );
			load( box, api( 'patient/appointments', { query: { perPage: 100 } } ), function ( r ) {
				if ( ! r.items.length ) { box.appendChild( el( 'div', { class: 'nxa-empty', text: t.empty } ) ); return; }
				box.appendChild( table( [ t.order, t.doctor, t.date, t.fee, t.paymentMethod, t.paid, t.status, t.actions ], r.items.map( function ( a ) { return [ a.code, a.doctorName, fmtDate( a.date ) + ' ' + a.startTime, money( a.fee ), a.paymentMethod === 'bank_transfer' ? t.bankTransfer : ( a.paymentMethod === 'pay_at_clinic' ? t.payAtClinic : '—' ), badge( a.paymentStatus ), badge( a.status ), el( 'a', { class: 'nxa-btn nxa-btn-sm', href: '#appointments/' + a.id, text: t.view } ) ]; } ) ) );
			} );
		}
		function viewProfile( node ) {
			node.appendChild( el( 'h3', { text: role === 'doctor' ? t.updateProfile : t.editProfile } ) );
			var box = el( 'div', { class: 'nxa-card' } ); node.appendChild( box );
			var path = role === 'doctor' ? 'doctor/profile' : 'patient/profile';
			load( box, api( path ), function ( p ) {
				var name = field( { name: 'name', label: t.fullName, value: p.name, attrs: { type: 'text', required: true } } );
				var email = field( { name: 'email', label: t.email, value: p.email, attrs: { type: 'email', disabled: true } } );
				var phone = field( { name: 'phone', label: t.phone, value: p.phone, attrs: { type: 'tel' } } );
				var address = field( { name: 'address', tag: 'textarea', label: t.address, value: p.address, attrs: { rows: 3 } } );
				var extra = [];
				if ( role === 'doctor' ) {
					extra.push( field( { name: 'designations', label: t.designations, value: p.designations, attrs: { type: 'text', maxlength: 190 } } ) );
					extra.push( field( { name: 'bio', tag: 'textarea', label: t.about, value: p.bio, attrs: { rows: 4 } } ) );
					[ [ 'education', 'Education' ], [ 'experience', 'Experience' ], [ 'qualification', 'Qualification' ] ].forEach( function ( f ) { extra.push( field( { name: f[ 0 ], tag: 'textarea', label: f[ 1 ], value: p[ f[ 0 ] ], attrs: { rows: 3 } } ) ); } );
				}
				var btn = el( 'button', { type: 'submit', class: 'nxa-btn nxa-btn-primary', text: t.save } );
				var msg = el( 'div' );
				var form = el( 'form', { novalidate: true, onSubmit: function ( e ) { e.preventDefault(); clear( msg ); busy( btn, true ); var body = formData( form ); delete body.email; api( path, { method: 'POST', body: body } ).then( function () { busy( btn, false ); applyErrors( form, {}, '' ); msg.appendChild( alertBox( 'success', t.saved ) ); } ).catch( function ( err ) { busy( btn, false ); msg.appendChild( alertBox( 'error', applyErrors( form, err.errors, err.message ) ) ); } ); } }, [ msg, name, email, phone, address ].concat( extra, [ el( 'div', { class: 'nxa-actions' }, [ el( 'span' ), btn ] ) ] ) );
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
			node.appendChild( el( 'form', { class: 'nxa-card', novalidate: true, onSubmit: function ( e ) { e.preventDefault(); clear( msg ); busy( btn, true ); var form = e.target; api( ( role === 'doctor' ? 'doctor' : 'patient' ) + '/password', { method: 'POST', body: formData( form ) } ).then( function () { busy( btn, false ); form.reset(); applyErrors( form, {}, '' ); msg.appendChild( alertBox( 'success', t.saved ) ); } ).catch( function ( err ) { busy( btn, false ); msg.appendChild( alertBox( 'error', applyErrors( form, err.errors, err.message ) ) ); } ); } }, [ msg, cur, el( 'div', { class: 'nxa-row' }, [ nw, nw2 ] ), el( 'div', { class: 'nxa-actions' }, [ el( 'span' ), btn ] ) ] ) );
		}

		/* --- doctor --- */
		function viewDoctorDashboard( node ) {
			node.appendChild( el( 'h3', { text: t.dashboard } ) );
			var box = el( 'div' ); node.appendChild( box );
			load( box, api( 'doctor/dashboard' ), function ( r ) {
				box.appendChild( stats( r.stats, [ [ 'today', t.todayAppointments ], [ 'earningsMonth', t.earningsMonth, money ], [ 'newThisWeek', t.newThisWeek ], [ 'patients', t.totalPatients ] ] ) );
				box.appendChild( el( 'h3', { text: t.todayAppointments } ) );
				if ( ! r.today.length ) { box.appendChild( el( 'div', { class: 'nxa-empty', text: t.empty } ) ); } else { box.appendChild( apptTable( r.today, 'doctor' ) ); }
				if ( r.new.length ) { box.appendChild( el( 'h3', { text: t.newAppointment, style: 'margin-top:20px' } ) ); box.appendChild( apptTable( r.new, 'doctor' ) ); }
				box.appendChild( chart( r.stats.earningsByDay, r.stats.month ) );
			} );
		}
		function viewDoctorToday( node ) {
			node.appendChild( el( 'h3', { text: t.todayAppointments } ) );
			var box = el( 'div' ); node.appendChild( box );
			load( box, api( 'doctor/appointments', { query: { view: 'today', order: 'asc', perPage: 100 } } ), function ( r ) {
				if ( ! r.items.length ) { box.appendChild( el( 'div', { class: 'nxa-empty', text: t.empty } ) ); return; }
				box.appendChild( apptTable( r.items, 'doctor' ) );
			} );
		}
		function viewDoctorAppointments( node, arg ) {
			if ( arg ) { return viewDoctorDetail( node, arg ); }
			var view = typeof node.nxaView === 'string' ? node.nxaView : 'new';
			var bar = el( 'div', { class: 'nxa-toolbar' } );
			[ [ 'new', t.newAppointment ], [ 'pending', t.notTreatedLabel ], [ 'history', t.historyLabel ] ].forEach( function ( v ) { bar.appendChild( el( 'button', { type: 'button', class: 'nxa-pill' + ( view === v[ 0 ] ? ' is-active' : '' ), text: v[ 1 ], onClick: function () { node.nxaView = v[ 0 ]; viewDoctorAppointments( clear( node ) ); } } ) ); } );
			var box = el( 'div' );
			node.appendChild( el( 'h3', { text: t.manageAppointment } ) ); node.appendChild( bar ); node.appendChild( box );
			load( box, api( 'doctor/appointments', { query: { view: view, perPage: 100, order: view === 'history' ? 'desc' : 'asc' } } ), function ( r ) {
				if ( ! r.items.length ) { box.appendChild( el( 'div', { class: 'nxa-empty', text: t.empty } ) ); return; }
				box.appendChild( apptTable( r.items, 'doctor' ) );
			} );
		}
		function viewDoctorDetail( node, id ) {
			node.appendChild( el( 'p', {}, [ el( 'a', { href: '#appointments', text: '‹ ' + t.manageAppointment } ) ] ) );
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
		function viewDoctorPayments( node ) {
			node.appendChild( el( 'h3', { text: t.paymentHistory } ) );
			var from = field( { name: 'dateFrom', label: t.from, attrs: { type: 'date' } } );
			var to = field( { name: 'dateTo', label: t.to, attrs: { type: 'date' } } );
			var btn = el( 'button', { type: 'submit', class: 'nxa-btn nxa-btn-primary', text: t.search } );
			var box = el( 'div' );
			var form = el( 'form', { class: 'nxa-filter-row', novalidate: true, onSubmit: function ( e ) { e.preventDefault(); draw(); } }, [ from, to, btn ] );
			node.appendChild( form ); node.appendChild( box );
			function draw() {
				load( box, api( 'doctor/appointments', { query: { paymentStatus: 'paid', dateFrom: from.input.value, dateTo: to.input.value, perPage: 200, order: 'desc' } } ), function ( r ) {
					var total = r.items.reduce( function ( s, a ) { return s + Number( a.fee || 0 ); }, 0 );
					box.appendChild( el( 'div', { class: 'nxa-stats' }, [ el( 'div', { class: 'nxa-stat' }, [ el( 'span', { text: t.totalEarnings } ), el( 'strong', { text: money( total ) } ) ] ), el( 'div', { class: 'nxa-stat' }, [ el( 'span', { text: t.appointments } ), el( 'strong', { text: String( r.total ) } ) ] ) ] ) );
					if ( ! r.items.length ) { box.appendChild( el( 'div', { class: 'nxa-empty', text: t.empty } ) ); return; }
					box.appendChild( table( [ t.bookingCode, t.patient, t.date, t.fee, t.paymentMethod ], r.items.map( function ( a ) { return [ a.code, a.patientName, fmtDate( a.date ), money( a.fee ), a.paymentMethod === 'bank_transfer' ? t.bankTransfer : ( a.paymentMethod === 'pay_at_clinic' ? t.payAtClinic : '—' ) ]; } ) ) );
				} );
			}
			draw();
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
			node.appendChild( el( 'h3', { text: t.manageLeave } ) );
			var box = el( 'div' ); node.appendChild( box );
			function draw() {
				load( box, api( 'doctor/leaves' ), function ( leaves ) {
					var date = field( { name: 'date', label: t.date, attrs: { type: 'date', required: true, min: today() } } );
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
		document.querySelectorAll( '[data-nxa="tabs"]' ).forEach( Tabs );
		document.querySelectorAll( '[data-nxa="booking"]' ).forEach( Booking );
		document.querySelectorAll( '[data-nxa="auth"]' ).forEach( function ( n ) { Auth( n ); } );
		document.querySelectorAll( '[data-nxa="panel"]' ).forEach( Panel );
	}
	if ( document.readyState === 'loading' ) { document.addEventListener( 'DOMContentLoaded', mount ); } else { mount(); }
	window.nexulesuiteAppt = { api: api, mount: mount };
} )();
