/* REST client for the appointment module (admin). */
const base = () => `${ window?.nexulesuite_Admin?.restUrl || '/wp-json/' }nexulesuite_/v1/appt/`;
const nonce = () => window?.nexulesuite_Admin?.nonce || '';

export class ApiError extends Error {
	constructor( message, { code = '', status = 0, errors = {} } = {} ) {
		super( message );
		this.code = code;
		this.status = status;
		this.errors = errors;
	}
}

export async function api( path, { method = 'GET', body, query } = {} ) {
	let url = base() + path.replace( /^\//, '' );
	if ( query ) {
		const qs = Object.entries( query )
			.filter( ( [ , v ] ) => v !== undefined && v !== null && v !== '' )
			.map( ( [ k, v ] ) => `${ encodeURIComponent( k ) }=${ encodeURIComponent( v ) }` )
			.join( '&' );
		if ( qs ) {
			url += ( url.includes( '?' ) ? '&' : '?' ) + qs;
		}
	}
	const headers = { 'X-WP-Nonce': nonce() };
	const init = { method, headers, credentials: 'same-origin' };
	if ( body !== undefined ) {
		headers[ 'Content-Type' ] = 'application/json';
		init.body = JSON.stringify( body );
	}
	let res;
	try {
		res = await fetch( url, init );
	} catch ( e ) {
		throw new ApiError( 'Could not reach the server. Check your connection and retry.', { code: 'network' } );
	}
	const text = await res.text();
	let data = null;
	try {
		data = text ? JSON.parse( text ) : null;
	} catch ( e ) {
		data = null;
	}
	if ( ! res.ok ) {
		throw new ApiError( data?.message || `Request failed (${ res.status })`, {
			code: data?.code || '',
			status: res.status,
			errors: data?.data?.errors || {},
		} );
	}
	return data;
}

export const WEEKDAYS = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ];

export function money( value, symbol ) {
	const n = Number( value || 0 );
	return n > 0 ? `${ symbol || '$' }${ n.toFixed( 2 ) }` : 'Free';
}
