import React from 'react';

export class AdminErrorBoundary extends React.Component {
	constructor( props ) {
		super( props );
		this.state = { error: null };
	}

	static getDerivedStateFromError( error ) {
		return { error };
	}

	componentDidCatch( error, info ) {
		// eslint-disable-next-line no-console
		console.error( 'Nexus admin render error:', error, info );
	}

	render() {
		if ( this.state.error ) {
			return (
				<div className="min-h-screen bg-[#f6f7fb] p-8 font-sans text-slate-800">
					<div className="mx-auto max-w-xl rounded-2xl border border-rose-200 bg-white p-6 shadow-lg">
						<h1 className="text-lg font-bold text-rose-700">Nexus admin failed to load</h1>
						<p className="mt-2 text-sm text-slate-600">
							Open the browser console (F12) for details, then reload the page.
						</p>
						<pre className="mt-4 overflow-auto rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
							{ String( this.state.error?.message || this.state.error ) }
						</pre>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}
