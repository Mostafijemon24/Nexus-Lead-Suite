import React from 'react';
import { WEEKDAYS } from './api.js';
import { Field, inputCls } from './ui.jsx';

/**
 * Seven weekday rows: enabled, start, end, slot length. `value` is the API shape.
 */
export function ScheduleEditor( { value, onChange, errors = {} } ) {
	const rows = Array.isArray( value ) && value.length ? value : [ 1, 2, 3, 4, 5, 6, 0 ].map( ( wd ) => ( { weekday: wd, enabled: wd >= 1 && wd <= 5, startTime: '09:00', endTime: '17:00', slotMinutes: 30 } ) );
	const update = ( i, patch ) => onChange( rows.map( ( r, idx ) => ( idx === i ? { ...r, ...patch } : r ) ) );
	return (
		<div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
			{ rows.map( ( r, i ) => {
				const err = errors[ `schedule.${ r.weekday }.endTime` ] || errors[ `schedule.${ i }.weekday` ];
				return (
					<div key={ r.weekday } className="grid grid-cols-1 items-end gap-3 px-3 py-3 sm:grid-cols-[110px_auto_1fr_1fr_110px]">
						<div className="text-sm font-bold text-slate-800">{ WEEKDAYS[ r.weekday ] }</div>
						<label className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
							<input type="checkbox" checked={ !! r.enabled } onChange={ ( e ) => update( i, { enabled: e.target.checked } ) } /> Open
						</label>
						<Field label="From"><input type="time" step={ 300 } disabled={ ! r.enabled } className={ inputCls( false ) } value={ r.startTime } onChange={ ( e ) => update( i, { startTime: e.target.value } ) } /></Field>
						<Field label="To" error={ err }><input type="time" step={ 300 } disabled={ ! r.enabled } className={ inputCls( err ) } value={ r.endTime } onChange={ ( e ) => update( i, { endTime: e.target.value } ) } /></Field>
						<Field label="Slot (min)"><input type="number" min={ 5 } max={ 240 } step={ 5 } disabled={ ! r.enabled } className={ inputCls( false ) } value={ r.slotMinutes } onChange={ ( e ) => update( i, { slotMinutes: Number( e.target.value ) } ) } /></Field>
					</div>
				);
			} ) }
		</div>
	);
}
