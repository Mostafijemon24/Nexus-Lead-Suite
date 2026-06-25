import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

export function ModalBackdrop( { open, onClose, children } ) {
	if ( ! open ) {
		return null;
	}

	return (
		<div
			className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 p-4"
			role="dialog"
			aria-modal="true"
			onMouseDown={ ( event ) => {
				if ( event.target === event.currentTarget && onClose ) {
					onClose();
				}
			} }
		>
			{ children }
		</div>
	);
}

export function ResultModal( {
	open,
	variant = 'success',
	title,
	message,
	dismissLabel = 'Dismiss',
	onDismiss,
} ) {
	if ( ! open ) {
		return null;
	}

	const isSuccess = variant === 'success';
	const heading = title ?? ( isSuccess ? 'Success!' : 'Error!' );
	const body =
		message ??
		( isSuccess
			? 'Your settings have been successfully updated. All changes are now live.'
			: 'An error occurred.' );
	const Icon = isSuccess ? CheckCircle2 : AlertTriangle;
	const iconWrap = isSuccess ? 'bg-emerald-50' : 'bg-rose-50';
	const iconColor = isSuccess ? 'text-emerald-500' : 'text-rose-500';

	return (
		<ModalBackdrop open={ open } onClose={ onDismiss }>
			<div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl">
				<div className="px-8 pb-6 pt-8 text-center">
					<div className={ `mx-auto flex h-14 w-14 items-center justify-center rounded-full ${ iconWrap }` }>
						<Icon size={ 28 } className={ iconColor } />
					</div>
					<h3 className="mt-5 text-xl font-extrabold text-slate-900">{ heading }</h3>
					<p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-500">{ body }</p>
				</div>
				<div className="px-8 pb-8">
					<button
						type="button"
						onClick={ onDismiss }
						className="w-full rounded-2xl bg-slate-900 py-4 text-sm font-extrabold text-white transition hover:bg-black"
					>
						{ dismissLabel }
					</button>
				</div>
			</div>
		</ModalBackdrop>
	);
}

export function SuccessModal( props ) {
	return <ResultModal variant="success" { ...props } />;
}

export function ErrorModal( props ) {
	return <ResultModal variant="error" { ...props } />;
}

export function ConfirmDiscardModal( { open, onCancel, onConfirm, title, description } ) {
	const heading = title || 'Reset to defaults?';
	const body =
		description ||
		'This clears the current editor and restores this page to its default values. Nothing is saved to the server until you click Save.';

	return (
		<ModalBackdrop open={ open } onClose={ onCancel }>
			<div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl">
				<div className="px-8 pb-6 pt-8">
					<div className="flex items-start gap-4">
						<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-50">
							<AlertTriangle size={ 22 } className="text-amber-500" />
						</div>
						<div className="min-w-0">
							<h3 className="text-lg font-extrabold text-slate-900">{ heading }</h3>
							<p className="mt-1 text-sm leading-relaxed text-slate-500">{ body }</p>
						</div>
					</div>
				</div>
				<div className="flex items-center justify-end gap-3 px-8 pb-8">
					<button
						type="button"
						onClick={ onCancel }
						className="rounded-2xl px-5 py-3 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50"
					>
						Cancel
					</button>
					<button
						type="button"
						onClick={ onConfirm }
						className="rounded-2xl border border-rose-100 bg-rose-50 px-5 py-3 text-sm font-extrabold text-rose-600 transition hover:bg-rose-100"
					>
						Yes, Discard
					</button>
				</div>
			</div>
		</ModalBackdrop>
	);
}



