import React from 'react';

export class AdminErrorBoundary extends React.Component {
	constructor( props ) {
		super( props );
		this.state = { error: null, info: null };
	}

	static getDerivedStateFromError( error ) {
		return { error };
	}

	componentDidCatch( error, info ) {
		// eslint-disable-next-line no-console
		console.error( 'Nexus admin render error:', error, info );
		this.setState( { info } );
	}

	render() {
		if ( this.state.error ) {
			const message = String( this.state.error?.message || this.state.error );
			const stack = String( this.state.error?.stack || '' );
			const componentStack = String( this.state.info?.componentStack || '' );

			/* Inline styles on purpose: if the stylesheet failed, this must still be visible. */
			return (
				<div style={ { minHeight: '100vh', background: '#f6f7fb', padding: '32px', fontFamily: 'system-ui, sans-serif', color: '#1e293b', boxSizing: 'border-box' } }>
					<div style={ { maxWidth: '860px', margin: '0 auto', background: '#fff', border: '2px solid #f43f5e', borderRadius: '16px', boxShadow: '0 20px 44px -16px rgba(16,19,34,.25)', overflow: 'hidden' } }>
						<div style={ { background: '#f43f5e', color: '#fff', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '10px' } }>
							<span aria-hidden="true" style={ { fontSize: '20px', lineHeight: 1 } }>⚠</span>
							<strong style={ { fontSize: '16px' } }>Nexus admin crashed while rendering</strong>
						</div>
						<div style={ { padding: '20px 24px' } }>
							<p style={ { margin: '0 0 12px', fontSize: '14px', color: '#475569' } }>
								A JavaScript error interrupted this screen. Copy the details below when reporting the issue, then reload the page.
							</p>
							<div style={ { background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '10px', padding: '12px 14px', fontFamily: 'ui-monospace, monospace', fontSize: '13px', color: '#be123c', fontWeight: 700, wordBreak: 'break-word' } }>
								{ message }
							</div>
							{ stack ? (
								<details style={ { marginTop: '14px' } } open>
									<summary style={ { cursor: 'pointer', fontSize: '12px', fontWeight: 700, color: '#334155' } }>Stack trace</summary>
									<pre style={ { marginTop: '8px', maxHeight: '220px', overflow: 'auto', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', fontSize: '11px', lineHeight: 1.5, color: '#334155', whiteSpace: 'pre-wrap', wordBreak: 'break-word' } }>{ stack }</pre>
								</details>
							) : null }
							{ componentStack ? (
								<details style={ { marginTop: '10px' } }>
									<summary style={ { cursor: 'pointer', fontSize: '12px', fontWeight: 700, color: '#334155' } }>Component stack</summary>
									<pre style={ { marginTop: '8px', maxHeight: '180px', overflow: 'auto', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', fontSize: '11px', lineHeight: 1.5, color: '#334155', whiteSpace: 'pre-wrap', wordBreak: 'break-word' } }>{ componentStack }</pre>
								</details>
							) : null }
							<button
								type="button"
								onClick={ () => window.location.reload() }
								style={ { marginTop: '18px', display: 'inline-block', background: '#101322', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 22px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' } }
							>
								Reload page
							</button>
						</div>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}
