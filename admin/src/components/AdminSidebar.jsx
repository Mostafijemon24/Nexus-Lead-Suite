import React, { useId, useState } from 'react';
import {
	Activity,
	ChevronLeft,
	ChevronDown,
	FileText,
	Layout,
	Mail,
	Settings,
} from 'lucide-react';

const NAV_ITEMS = [
	{ id: 'activities', label: 'Activities', icon: Activity },
	{ id: 'menu-items', label: 'Menu Items', icon: Layout },
	{ id: 'popups', label: 'Popups', icon: Layout },
	{ id: 'emails', label: 'Emails', icon: Mail },
	{ id: 'form-builder', label: 'Form Builder', icon: FileText },
	{ id: 'settings', label: 'Settings', icon: Settings },
];

function SidebarLogo() {
	return (
		<div
			className="flex h-full w-full items-center justify-center rounded-xl bg-slate-800 shadow-sm shadow-black/35"
			aria-hidden="true"
		>
			<span
				className="dashicons dashicons-screenoptions"
				style={ {
					fontFamily: 'dashicons',
					fontSize: '22px',
					lineHeight: 1,
					width: '22px',
					height: '22px',
				} }
			/>
		</div>
	);
}

export function AdminSidebar( { activeId, onNavigate } ) {
	const navLabelId = useId();
	const [ collapsed, setCollapsed ] = useState( false );

	return (
		<aside
			className={ [
				'flex h-full min-h-screen flex-col border-r border-sidebar-border bg-sidebar py-4 text-slate-200 transition-[width] duration-200 ease-out',
				collapsed ? 'w-[4.5rem]' : 'w-60',
			].join( ' ' ) }
			aria-label="Nexus Lead Suite navigation"
		>
			<div
				className={
					collapsed
						? 'flex justify-center px-2'
						: 'grid grid-cols-[2.5rem_minmax(0,1fr)] items-center gap-3 px-3'
				}
			>
				<div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl">
					<SidebarLogo />
				</div>
				{ ! collapsed && (
					<button
						type="button"
						className="flex min-h-10 min-w-0 items-center gap-1.5 rounded-lg py-0 text-left text-white outline-none ring-violet-500/50 transition hover:bg-white/5 focus-visible:ring-2"
						aria-expanded="false"
						aria-haspopup="true"
					>
						<span className="truncate text-[15px] font-semibold leading-normal tracking-tight">Nexus</span>
						<ChevronDown className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
					</button>
				) }
			</div>

			<div className="mx-3 mt-4 border-t border-sidebar-border" role="presentation" />

			<nav
				id="nexus-ls-sidebar-nav"
				className="mt-4 flex flex-1 flex-col gap-0.5 px-2"
				aria-labelledby={ navLabelId }
			>
				<h2 id={ navLabelId } className="sr-only">
					Main menu
				</h2>
				{ NAV_ITEMS.map( ( item ) => {
					const Icon = item.icon;
					const isActive = activeId === item.id;
					const href =
						window?.nexusLsAdmin?.adminPages?.[ item.id ] || '#';

					return (
						<div key={ item.id }>
							<a
								href={ href }
								onClick={ ( event ) => {
									if (
										event.button !== 0 ||
										event.metaKey ||
										event.ctrlKey ||
										event.shiftKey ||
										event.altKey
									) {
										return;
									}
									event.preventDefault();
									if ( onNavigate ) {
										onNavigate( item.id );
									}
									if ( typeof history !== 'undefined' && href && href !== '#' ) {
										history.pushState( null, '', href );
									}
								} }
								className={ [
									'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] font-medium outline-none transition-colors no-underline',
									collapsed ? 'justify-center px-2' : '',
									isActive
										? 'bg-sidebar-active text-white shadow-sm'
										: 'text-slate-400 hover:bg-white/[0.06] hover:text-slate-200',
								].join( ' ' ) }
								title={ collapsed ? item.label : undefined }
								aria-current={ isActive ? 'page' : undefined }
							>
								<Icon className={ [ 'h-5 w-5 shrink-0', isActive ? 'text-white' : '' ].join( ' ' ) } />
								{ ! collapsed && (
									<span className="min-w-0 flex-1 truncate">{ item.label }</span>
								) }
							</a>
						</div>
					);
				} ) }
			</nav>

			<div className="mx-3 mt-auto border-t border-sidebar-border pt-3">
				<button
					type="button"
					onClick={ () => setCollapsed( ( value ) => ! value ) }
					className={ [
						'flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-[14px] font-medium text-slate-400 outline-none ring-violet-500/50 transition hover:bg-white/[0.06] hover:text-slate-200 focus-visible:ring-2',
						collapsed ? 'justify-center px-2' : '',
					].join( ' ' ) }
					aria-label={ collapsed ? 'Expand sidebar' : 'Collapse sidebar' }
				>
					<ChevronLeft
						className={ [ 'h-4 w-4 shrink-0 transition-transform', collapsed ? 'rotate-180' : '' ].join( ' ' ) }
					/>
					{ ! collapsed && <span>Collapse</span> }
				</button>
			</div>
		</aside>
	);
}

