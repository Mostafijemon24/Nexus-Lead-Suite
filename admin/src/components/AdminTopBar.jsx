import React from 'react';
import { Search } from 'lucide-react';

export function AdminTopBar( { title, search = '', onSearchChange } ) {
	return (
		<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
			<h1 className="text-2xl font-black tracking-tight text-slate-900">{ title }</h1>
			{ typeof onSearchChange === 'function' && (
				<div className="relative w-full md:max-w-sm">
					<Search size={ 16 } className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
					<input
						type="search"
						value={ search }
						onChange={ ( e ) => onSearchChange( e.target.value ) }
						placeholder="Search forms…"
						className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>
			) }
		</div>
	);
}
