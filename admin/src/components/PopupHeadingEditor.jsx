import React, { useCallback, useEffect, useRef, useState } from 'react';

const MCE_ID = 'nexus-heading-mce';

/**
 * TinyMCE heading editor with Visual / Code tabs (matches popup-styling-matched.html).
 */
export function PopupHeadingEditor( { heading, onChange, disabled } ) {
	const [ mode, setMode ] = useState( 'visual' );
	const [ focused, setFocused ] = useState( false );
	const editorRef = useRef( null );
	const codeRef = useRef( null );
	const segRef = useRef( null );
	const visualRef = useRef( null );
	const codeBtnRef = useRef( null );
	const onChangeRef = useRef( onChange );
	onChangeRef.current = onChange;

	const positionGlider = useCallback( () => {
		const seg = segRef.current;
		const active = mode === 'code' ? codeBtnRef.current : visualRef.current;
		const glider = seg?.querySelector( '.glider' );
		if ( ! seg || ! active || ! glider ) {
			return;
		}
		glider.style.width = `${ active.offsetWidth }px`;
		glider.style.transform = `translateX(${ active.offsetLeft - 4 }px)`;
	}, [ mode ] );

	useEffect( () => {
		positionGlider();
		window.addEventListener( 'resize', positionGlider );
		return () => window.removeEventListener( 'resize', positionGlider );
	}, [ positionGlider ] );

	useEffect( () => {
		if ( disabled ) {
			const existing = editorRef.current || window?.tinymce?.get( MCE_ID );
			if ( existing ) {
				try {
					existing.remove();
				} catch {
					// ignore.
				}
			}
			editorRef.current = null;
			return undefined;
		}

		let cancelled = false;
		let timer;

		const boot = () => {
			if ( cancelled ) {
				return;
			}
			if ( ! window?.tinymce ) {
				timer = setTimeout( boot, 300 );
				return;
			}
			if ( ! document.getElementById( MCE_ID ) ) {
				timer = setTimeout( boot, 100 );
				return;
			}

			const prev = window.tinymce.get( MCE_ID );
			if ( prev ) {
				try {
					prev.remove();
				} catch {
					// ignore.
				}
			}

			window.tinymce.init( {
				selector: `textarea#${ MCE_ID }`,
				height: 170,
				menubar: false,
				statusbar: false,
				branding: false,
				wpautop: false,
				plugins: 'lists link hr charmap paste textcolor colorpicker',
				toolbar:
					'formatselect | bold italic underline strikethrough | alignleft aligncenter alignright | bullist numlist | link | forecolor backcolor | removeformat | undo redo',
				content_style:
					'body { font-family: "Plus Jakarta Sans", system-ui, sans-serif; font-size: 20px; line-height: 1.35; color: #0f172a; padding: 18px; margin: 0; }',
				setup: ( editor ) => {
					editorRef.current = editor;
					editor.on( 'init', () => {
						editor.setContent( heading || '' );
					} );
					editor.on( 'change keyup input', () => {
						onChangeRef.current( editor.getContent() );
					} );
					editor.on( 'focus', () => setFocused( true ) );
					editor.on( 'blur', () => setFocused( false ) );
				},
			} );
		};

		timer = setTimeout( boot, 200 );

		return () => {
			cancelled = true;
			if ( timer ) {
				clearTimeout( timer );
			}
			const ed = editorRef.current || window?.tinymce?.get( MCE_ID );
			if ( ed ) {
				try {
					ed.remove();
				} catch {
					// ignore.
				}
			}
			editorRef.current = null;
		};
	}, [ disabled ] );

	useEffect( () => {
		const ed = editorRef.current || window?.tinymce?.get( MCE_ID );
		if ( ed?.initialized && mode === 'visual' ) {
			ed.setContent( heading || '' );
		}
		if ( mode === 'code' && codeRef.current ) {
			codeRef.current.value = heading || '';
		}
	}, [ heading, mode ] );

	const switchToCode = () => {
		const ed = editorRef.current || window?.tinymce?.get( MCE_ID );
		const html = ed?.initialized ? ed.getContent() : ( heading || '' );
		if ( codeRef.current ) {
			codeRef.current.value = html;
		}
		onChange( html );
		setMode( 'code' );
	};

	const switchToVisual = () => {
		const html = codeRef.current?.value ?? ( heading || '' );
		onChange( html );
		setMode( 'visual' );
		setTimeout( () => {
			const ed = editorRef.current || window?.tinymce?.get( MCE_ID );
			if ( ed?.initialized ) {
				ed.setContent( html );
			}
		}, 50 );
	};

	return (
		<div className={ [ 'rte nexus-mce-wrap', focused ? 'focused' : '' ].filter( Boolean ).join( ' ' ) }>
			<div style={ { display: mode === 'visual' ? 'block' : 'none' } }>
				<textarea
					id={ MCE_ID }
					defaultValue={ heading || '' }
					className="nexus-mce-textarea"
				/>
			</div>
			{ mode === 'code' && (
				<textarea
					ref={ codeRef }
					defaultValue={ heading || '' }
					onChange={ ( e ) => onChange( e.target.value ) }
					onFocus={ () => setFocused( true ) }
					onBlur={ () => setFocused( false ) }
					className="rte-code"
				/>
			) }
			<div className="rte-foot">
				<div className="seg auto-width" ref={ segRef } role="tablist" aria-label="Edit mode">
					<span className="glider" />
					<button
						ref={ visualRef }
						type="button"
						className={ mode === 'visual' ? 'active' : '' }
						role="tab"
						aria-selected={ mode === 'visual' }
						onClick={ switchToVisual }
					>
						Visual
					</button>
					<button
						ref={ codeBtnRef }
						type="button"
						className={ mode === 'code' ? 'active' : '' }
						role="tab"
						aria-selected={ mode === 'code' }
						onClick={ switchToCode }
					>
						Code
					</button>
				</div>
			</div>
		</div>
	);
}
