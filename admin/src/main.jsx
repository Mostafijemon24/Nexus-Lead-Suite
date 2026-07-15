import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.jsx';
import './index.css';

const rootEl = document.getElementById( 'nexulesuite_admin-root' );

/* Nexus Hub console typefaces (Sora / Inter / JetBrains Mono). Injected from JS so a
   slow or blocked fonts CDN never render-blocks the page — CSS falls back to system fonts. */
if ( rootEl && ! document.getElementById( 'nexulesuite_hub-fonts' ) ) {
	const fontsLink = document.createElement( 'link' );
	fontsLink.id = 'nexulesuite_hub-fonts';
	fontsLink.rel = 'stylesheet';
	fontsLink.href =
		'https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap';
	document.head.appendChild( fontsLink );
}

if ( rootEl ) {
	createRoot( rootEl ).render(
		<React.StrictMode>
			<App />
		</React.StrictMode>
	);
}
