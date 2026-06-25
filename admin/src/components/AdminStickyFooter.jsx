import React from 'react';
import { Check } from 'lucide-react';

export function AdminStickyFooter( { actions = null } ) {
	return (
		<footer className="sticky bottom-0 z-30 flex shrink-0 flex-col gap-4 rounded-b-2xl border-t border-white/[0.08] bg-[#0B1120] px-6 py-4 md:flex-row md:items-center md:justify-between md:gap-4 md:px-8 md:py-4">
			<div className="flex min-w-0 items-center gap-2.5 text-slate-300">
				<span
					className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 shadow-sm shadow-emerald-900/30"
					aria-hidden="true"
				>
					<Check className="h-3.5 w-3.5 text-white" strokeWidth={ 3 } />
				</span>
				<span className="text-[11px] font-medium leading-snug text-slate-200 md:text-xs">
					Developed by{ ' ' }
					<a
						href="https://mostafijemon.com/"
						target="_blank"
						rel="noopener noreferrer"
						className="font-semibold text-white underline underline-offset-2 hover:text-slate-100"
					>
						Mostafij Emon
					</a>
					.
				</span>
			</div>
			{ actions ? (
				<div className="flex flex-wrap items-center justify-end gap-3 md:gap-4">{ actions }</div>
			) : null }
		</footer>
	);
}
