import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.jsx';
import './index.css';

const rootEl = document.getElementById( 'nexus-ls-admin-root' );

if ( rootEl ) {
	createRoot( rootEl ).render(
		<React.StrictMode>
			<App />
		</React.StrictMode>
	);
}
