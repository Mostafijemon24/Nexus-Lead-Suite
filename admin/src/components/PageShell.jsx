import React from 'react';

/**
 * Unified admin page shell (matches Menu Items layout).
 *
 * @param {{
 *  title: string,
 *  subtitle?: string,
 *  icon?: React.ReactNode,
 *  headerRight?: React.ReactNode,
 *  children: React.ReactNode,
 *  footer?: React.ReactNode,
 * }} props
 */
export function PageShell( { title, subtitle = '', icon = null, headerRight = null, footer = null, children } ) {
	return (
		<div className="min-h-screen bg-[#f6f7fb] px-2 py-2 sm:px-4 sm:py-4 md:px-8 md:py-6 font-sans text-slate-900">
			<div className="w-full bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col md:h-[calc(100vh-3.25rem)]">
				<div className="px-4 py-4 md:p-5 border-b border-slate-200 bg-white flex flex-wrap gap-3 justify-between items-center shrink-0">
					<div className="flex items-center gap-3">
						{ icon ? <div className="bg-blue-600 p-2 rounded-lg text-white">{ icon }</div> : null }
						<div>
							<h1 className="text-base md:text-lg font-bold">{ title }</h1>
							{ subtitle ? <p className="text-xs text-slate-400 hidden sm:block">{ subtitle }</p> : null }
						</div>
					</div>
					{ headerRight ? <div className="flex items-center gap-2">{ headerRight }</div> : null }
				</div>

				<div className="flex min-h-0 flex-1 flex-col bg-white">
					<div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-8">{ children }</div>
					{ footer }
				</div>
			</div>
		</div>
	);
}


