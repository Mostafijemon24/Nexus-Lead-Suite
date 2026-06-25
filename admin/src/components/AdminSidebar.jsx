import React, { useId, useState } from 'react';
import {
	Activity,
	ChevronLeft,
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
			className="nexulesuite_sidebar-logo flex h-full w-full items-center justify-center rounded-xl"
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
				'nexulesuite_admin-sidebar flex h-full min-h-screen flex-col border-r py-5 transition-[width] duration-200 ease-out',
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
					<div className="nexulesuite_sidebar-brand flex min-h-10 min-w-0 items-center rounded-lg py-0 text-left text-[15px] font-semibold leading-normal tracking-tight">
						<span className="truncate">Nexus</span>
					</div>
				) }
			</div>

			<div className="nexulesuite_sidebar-divider mx-3 mt-4 border-t" role="presentation" />

			<nav
				id="nexulesuite_sidebar-nav"
				className="mt-5 flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto px-3"
				aria-labelledby={ navLabelId }
			>
				<h2 id={ navLabelId } className="sr-only">
					Main menu
				</h2>
				{ NAV_ITEMS.map( ( item ) => {
					const Icon = item.icon;
					const isActive = activeId === item.id;
					const href =
						window?.nexulesuite_Admin?.adminPages?.[ item.id ] || '#';

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
									'nexulesuite_sidebar-link flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-left text-[14px] font-medium outline-none',
									collapsed ? 'justify-center px-2.5' : '',
									isActive ? 'is-active' : '',
								].join( ' ' ) }
								title={ collapsed ? item.label : undefined }
								aria-current={ isActive ? 'page' : undefined }
							>
								<Icon className="h-5 w-5 shrink-0" />
								{ ! collapsed && (
									<span className="min-w-0 flex-1 truncate">{ item.label }</span>
								) }
							</a>
						</div>
					);
				} ) }
			</nav>

			<div className="nexulesuite_sidebar-footer nexulesuite_sidebar-divider relative z-10 mx-3 mt-auto shrink-0 border-t pt-3">
				<button
					type="button"
					onClick={ () => setCollapsed( ( value ) => ! value ) }
					className={ [
						'nexulesuite_sidebar-collapse flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-[14px] font-medium outline-none ring-violet-500/50 transition focus-visible:ring-2',
						collapsed ? 'justify-center px-2' : '',
					].join( ' ' ) }
					aria-label={ collapsed ? 'Expand sidebar' : 'Collapse sidebar' }
				>
					<ChevronLeft
						className={ [ 'pointer-events-none h-4 w-4 shrink-0 transition-transform', collapsed ? 'rotate-180' : '' ].join( ' ' ) }
						aria-hidden="true"
					/>
					{ ! collapsed && <span className="pointer-events-none">Collapse</span> }
				</button>
			</div>
		</aside>
	);
}
