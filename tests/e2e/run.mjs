/* End-to-end click-through of the appointment module against tests/e2e/server.php.
 * Usage: node tests/e2e/run.mjs   (starts the PHP server itself) */
import { createRequire } from 'node:module';
const require = createRequire( import.meta.url );
const { chromium } = require( 'playwright' );
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const PORT = 8787;
const BASE = `http://127.0.0.1:${ PORT }`;
const SHOTS = new URL( '../../replica/screens/clone/', import.meta.url ).pathname;
mkdirSync( SHOTS, { recursive: true } );

let passed = 0, failed = 0;
const failures = [];
async function step( name, fn ) {
	try { await fn(); passed++; console.log( '  ok   ' + name ); }
	catch ( e ) { failed++; failures.push( name + ': ' + e.message ); console.log( '  FAIL ' + name + '\n       ' + e.message.split( '\n' )[ 0 ] ); }
	finally { if ( typeof page !== 'undefined' ) { await page.setViewportSize( { width: 1280, height: 900 } ); } } // a failed responsive step must not leak its viewport into the next one
}
function expect( cond, msg ) { if ( ! cond ) { throw new Error( msg || 'expectation failed' ); } }

const server = spawn( 'php', [ '-S', `127.0.0.1:${ PORT }`, '-t', '.', 'tests/e2e/server.php' ], { stdio: [ 'ignore', 'ignore', 'pipe' ], env: { ...process.env, NXA_E2E_STATE: '/tmp/nxa-e2e-' + process.pid } } );
let serverLog = '';
server.stderr.on( 'data', ( d ) => { const s = d.toString(); if ( /PHP (Fatal|Warning|Notice|Parse)/.test( s ) ) { serverLog += s; } } );
await sleep( 800 );

const browser = await chromium.launch();
const ctx = await browser.newContext( { viewport: { width: 1280, height: 900 } } );
const page = await ctx.newPage();
const consoleErrors = [];
page.on( 'pageerror', ( e ) => consoleErrors.push( 'pageerror: ' + e.message ) );
page.on( 'console', ( m ) => { if ( m.type() === 'error' ) { consoleErrors.push( m.text() ); } } );

const j = async ( path ) => ( await ( await page.request.get( BASE + path ) ).json() );
let seed;

try {
	await step( 'harness: reset, fix the clock to Mon 2026-10-26 08:00 and seed data', async () => {
		await j( '/__test/reset' );
		await j( '/__test/now?set=' + encodeURIComponent( '2026-10-26 08:00' ) );
		seed = await j( '/__test/seed' );
		expect( seed.doctors.length === 2, 'two doctors seeded' );
	} );

	/* ---------------- admin SPA ---------------- */
	await step( 'admin: Appointments page renders tabs and dashboard counters', async () => {
		await page.goto( BASE + '/wp-admin/?page=appointments' );
		await page.getByRole( 'heading', { name: 'Appointments', exact: true } ).waitFor();
		await page.getByRole( 'tab', { name: 'Dashboard' } ).waitFor();
		await page.getByText( 'Doctors', { exact: true } ).first().waitFor();
		await page.waitForSelector( 'text=Recently booked' );
		await page.screenshot( { path: SHOTS + 'admin-dashboard-1280.png', fullPage: true } );
	} );
	await step( 'admin: sidebar shows the Appointments entry and tab bar hash routing works', async () => {
		expect( await page.locator( 'aside a', { hasText: 'Appointments' } ).count() === 1, 'sidebar link' );
		await page.getByRole( 'tab', { name: 'Departments' } ).click();
		expect( page.url().endsWith( '#departments' ), 'hash updated: ' + page.url() );
		await page.getByRole( 'cell', { name: 'Cardiology', exact: true } ).first().waitFor();
	} );
	await step( 'admin: department form validates and creates', async () => {
		await page.getByRole( 'button', { name: 'Add new' } ).click();
		await page.getByRole( 'button', { name: 'Save' } ).click();
		await page.getByText( 'This field is required.' ).waitFor();
		await page.getByLabel( 'Name' ).fill( 'Dermatology' );
		await page.getByLabel( 'Description' ).fill( 'Skin care' );
		await page.getByRole( 'button', { name: 'Save' } ).click();
		await page.getByText( 'Department created.' ).waitFor();
		await page.getByRole( 'cell', { name: 'Dermatology', exact: true } ).first().waitFor();
	} );
	await step( 'admin: in-use department cannot be deleted (409 shown in dialog)', async () => {
		const row = page.locator( 'tr', { hasText: 'Cardiology' } );
		await row.getByLabel( 'Delete Cardiology' ).click();
		await page.getByRole( 'button', { name: 'Delete', exact: true } ).click();
		await page.getByText( 'still has doctors' ).waitFor();
		await page.getByRole( 'button', { name: 'Cancel', exact: true } ).click();
		await page.locator( '[role=dialog]' ).waitFor( { state: 'detached' } );
	} );
	await step( 'admin: doctor form shows field errors then creates a doctor with schedule', async () => {
		await page.getByRole( 'tab', { name: 'Doctors' } ).click();
		await page.getByRole( 'cell', { name: /Dr\. Jane Roe/ } ).first().waitFor();
		await page.getByRole( 'button', { name: 'Add doctor' } ).click();
		await page.getByRole( 'button', { name: 'Create doctor' } ).click();
		await page.getByText( 'Password must be at least 8 characters.' ).waitFor();
		await page.getByLabel( 'Full name' ).fill( 'Dr. John M Brown' );
		await page.getByLabel( 'E-mail (login)' ).fill( 'john@example.test' );
		await page.getByLabel( /^Password/ ).fill( 'doctorpass123' );
		await page.getByLabel( /^Department/ ).selectOption( { label: 'Dermatology' } );
		await page.getByLabel( 'Consultation fee' ).fill( '40' );
		await page.getByRole( 'button', { name: 'Weekly schedule' } ).click();
		await page.locator( 'input[type=time]' ).first().fill( '10:00' );
		await page.getByRole( 'button', { name: 'Create doctor' } ).click();
		await page.getByText( 'Doctor created.' ).waitFor();
		await page.getByRole( 'button', { name: 'Leave days' } ).click();
		await page.locator( 'input[type=date]' ).fill( '2026-10-29' );
		await page.getByRole( 'button', { name: 'Add', exact: true } ).click();
		await page.getByText( '2026-10-29' ).waitFor();
		await page.getByRole( 'button', { name: 'Close', exact: true } ).last().click();
		await page.getByRole( 'cell', { name: /Dr\. John M Brown/ } ).first().waitFor();
		await page.screenshot( { path: SHOTS + 'admin-doctors-1280.png', fullPage: true } );
	} );
	await step( 'admin: medicines sub-tabs and settings save', async () => {
		await page.getByRole( 'tab', { name: 'Medicines' } ).click();
		await page.getByRole( 'cell', { name: 'Aspirin 75 mg', exact: true } ).first().waitFor();
		await page.getByRole( 'button', { name: 'Medicine types' } ).click();
		await page.getByRole( 'cell', { name: 'Tablet', exact: true } ).first().waitFor();
		await page.getByRole( 'tab', { name: 'Settings' } ).click();
		await page.getByLabel( 'Symbol' ).fill( '$' );
		await page.getByLabel( 'Booking window (days ahead)' ).fill( '45' );
		await page.getByRole( 'button', { name: 'Save settings' } ).click();
		await page.getByText( 'Settings saved.' ).waitFor();
	} );
	await step( 'admin: responsive at 375px (tables collapse to cards)', async () => {
		await page.setViewportSize( { width: 375, height: 800 } );
		await page.getByRole( 'tab', { name: 'Doctors' } ).click();
		await page.getByRole( 'cell', { name: /Dr\. Jane Roe/ } ).first().waitFor();
		const th = page.locator( 'thead' ).first();
		expect( ! ( await th.isVisible() ), 'table header hidden on phone' );
		await page.screenshot( { path: SHOTS + 'admin-doctors-375.png', fullPage: true } );
		await page.setViewportSize( { width: 1280, height: 900 } );
	} );

	/* ---------------- public pages ---------------- */
	await step( 'public: doctors listing renders cards, filters by department, paginates', async () => {
		await page.goto( BASE + '/__test/logout' ); // drop the admin harness session: public flows run as a guest
		await page.goto( BASE + '/nexus-doctors/' );
		expect( ( await page.locator( '.nxa-doctor-card' ).count() ) === 3, 'three active doctors' );
		await page.selectOption( 'select[name=department]', { label: 'Pediatric' } );
		await page.getByRole( 'button', { name: 'Search' } ).click();
		expect( ( await page.locator( '.nxa-doctor-card' ).count() ) === 1, 'filtered to one' );
		await page.screenshot( { path: SHOTS + 'public-doctors-1280.png', fullPage: true } );
		await page.goto( BASE + '/nexus-doctors/?q=zzz' );
		await page.getByText( 'No doctors match your search.' ).waitFor();
	} );
	await step( 'public: doctor profile has schedule table, fee and a live booking widget', async () => {
		await page.goto( BASE + '/doctor-details/dr-jane-roe/' );
		await page.getByRole( 'heading', { name: 'Dr. Jane Roe' } ).waitFor();
		expect( await page.getByText( '$25.00' ).first().isVisible(), 'fee shown' );
		expect( ( await page.locator( '.nxa-profile-schedule tbody tr' ).count() ) === 5, 'only the five open weekdays are listed (as on the original)' );
		expect( await page.locator( '.nxa-profile-schedule tbody' ).textContent().then( ( x ) => x.includes( '9:00 AM - 12:00 PM' ) ), '12-hour working hours' );
		for ( const tab of [ 'Doctor Info', 'Working Hours', 'Address', 'Education', 'Experience', 'Qualification', 'Appointment' ] ) { await page.getByRole( 'tab', { name: tab } ).waitFor(); }
		await page.getByRole( 'tab', { name: 'Appointment' } ).click();
		await page.locator( '.nxa-booking form.nxa-booking-form' ).waitFor();
		await page.locator( 'select[name=startTime]' ).waitFor();
		await page.screenshot( { path: SHOTS + 'public-doctor-profile-1280.png', fullPage: true } );
		await page.goto( BASE + '/doctor-details/nobody/' );
		await page.getByText( 'This doctor profile is not available.' ).waitFor();
	} );
	await step( 'public: departments listing and department detail', async () => {
		await page.goto( BASE + '/nexus-departments/' );
		expect( ( await page.locator( '.nxa-dept-card' ).count() ) === 3, 'three departments' );
		await page.goto( BASE + '/department-details/cardiology/' );
		await page.getByRole( 'heading', { name: 'Cardiology' } ).waitFor();
		expect( ( await page.locator( '.nxa-doctor-card' ).count() ) === 1, 'one doctor in cardiology' );
		expect( ( await page.locator( '.nxa-dept-list a' ).count() ) === 3, 'department sidebar lists every active department' );
		expect( ( await page.locator( '.nxa-dept-list a.is-active' ).textContent() ).trim() === 'Cardiology', 'current department highlighted' );
		await page.locator( '.nxa-dept-list a', { hasText: 'Pediatric' } ).click();
		await page.getByRole( 'heading', { name: 'Pediatric' } ).waitFor();
		await page.screenshot( { path: SHOTS + 'public-department-1280.png', fullPage: true } );
	} );

	/* ---------------- booking as a new patient ---------------- */
	let verifyLink = '';
	await step( 'booking: guest fills Department → Doctor → Date → Schedule (as on the original), then registers inline', async () => {
		await page.goto( BASE + '/nexus-booking/' );
		await page.locator( 'select[name=departmentId]' ).selectOption( { label: 'Cardiology' } );
		await page.locator( 'select[name=doctorId] option[value="' + seed.doctors[ 0 ].id + '"]' ).waitFor( { state: 'attached' } );
		await page.locator( 'select[name=doctorId]' ).selectOption( String( seed.doctors[ 0 ].id ) );
		await page.locator( 'input[name=date]' ).fill( '2026-10-31' ); // Saturday: closed
		await page.getByText( 'The doctor has no hours this day.' ).waitFor();
		await page.locator( 'input[name=date]' ).fill( '2026-10-27' );
		await page.locator( 'select[name=startTime] option[value="09:00"]' ).waitFor( { state: 'attached' } );
		expect( ( await page.locator( 'select[name=startTime] option[value="09:00"]' ).textContent() ).includes( '9:00 AM - 9:30 AM' ), '12-hour schedule labels' );
		await page.locator( 'select[name=startTime]' ).selectOption( '09:00' );
		await page.screenshot( { path: SHOTS + 'public-booking-form-1280.png', fullPage: true } );
		await page.getByRole( 'button', { name: 'Create Appointment' } ).click();
		await page.getByText( 'Review and confirm' ).waitFor();
		await page.getByText( 'Log in or create a patient account' ).waitFor();
		await page.screenshot( { path: SHOTS + 'public-booking-review-1280.png', fullPage: true } );
		await page.getByRole( 'tab', { name: 'Register' } ).click();
		expect( ( await page.locator( 'form input[name=phone]' ).count() ) === 0, 'patient registration has no phone field (as on the original)' );
		await page.getByLabel( 'Name', { exact: true } ).fill( 'Pat Smith' );
		await page.getByLabel( 'E-mail' ).fill( 'pat@example.test' );
		await page.getByLabel( 'Password', { exact: true } ).fill( 'patientpass1' );
		await page.getByLabel( 'Confirm password' ).fill( 'patientpass2' );
		await page.getByRole( 'button', { name: 'Register' } ).click();
		await page.getByText( 'Passwords do not match.' ).waitFor();
		await page.getByLabel( 'Confirm password' ).fill( 'patientpass1' );
		await page.getByRole( 'button', { name: 'Register' } ).click();
		await page.getByText( 'We sent a confirmation link' ).waitFor();
		const mails = await j( '/__test/mails' );
		const m = mails[ mails.length - 1 ].message.match( /https?:\S+nexulesuite_verify=\S+/ );
		expect( m, 'verification link in mail' );
		verifyLink = m[ 0 ].replace( /&amp;/g, '&' );
	} );
	await step( 'booking: unverified login is refused; verification link activates; login redirects to panel', async () => {
		await page.goto( BASE + '/nexus-auth/' );
		await page.getByRole( 'tab', { name: 'Patient' } ).waitFor();
		await page.getByRole( 'tab', { name: 'Doctor' } ).waitFor();
		await page.getByText( 'Remember Me' ).waitFor();
		await page.getByRole( 'link', { name: 'Forgot your password?' } ).waitFor();
		await page.screenshot( { path: SHOTS + 'public-login-1280.png', fullPage: true } );
		await page.getByLabel( 'E-mail' ).fill( 'pat@example.test' );
		await page.getByLabel( 'Password', { exact: true } ).fill( 'patientpass1' );
		await page.getByRole( 'button', { name: 'Log in' } ).click();
		await page.getByText( 'confirm your e-mail' ).waitFor();
		await page.goto( verifyLink );
		await page.waitForURL( /verified=1/ );
		await page.getByText( 'Your e-mail is confirmed.' ).waitFor();
		await page.getByLabel( 'E-mail' ).fill( 'pat@example.test' );
		await page.getByLabel( 'Password', { exact: true } ).fill( 'patientpass1' );
		await page.getByRole( 'button', { name: 'Log in' } ).click();
		await page.waitForURL( /nexus-patient-panel/ );
		await page.getByText( 'Your profile is incomplete.' ).waitFor();
		await page.locator( '.nxa-stat' ).first().waitFor();
	} );
	let code = '';
	await step( 'booking: incomplete profile is sent to the profile page first (as on the original), then booking succeeds', async () => {
		await page.goto( BASE + '/nexus-booking/?doctor=' + seed.doctors[ 0 ].id );
		await page.locator( 'input[name=date]' ).fill( '2026-10-27' );
		await page.locator( 'select[name=startTime] option[value="09:00"]' ).waitFor( { state: 'attached' } );
		await page.locator( 'select[name=startTime]' ).selectOption( '09:00' );
		await page.getByRole( 'button', { name: 'Create Appointment' } ).click();
		await page.getByRole( 'button', { name: 'Confirm' } ).click();
		await page.getByText( 'Please complete your profile' ).waitFor();
		await page.getByRole( 'link', { name: 'Complete profile' } ).click();
		await page.waitForURL( /#profile/ );
		await page.getByLabel( 'Phone' ).fill( '555-0100' );
		await page.getByLabel( 'Address' ).fill( '1 Test Street' );
		await page.getByRole( 'button', { name: 'Save' } ).click();
		await page.getByText( 'Saved.' ).waitFor();
		await page.goto( BASE + '/nexus-booking/?doctor=' + seed.doctors[ 0 ].id );
		await page.locator( 'input[name=date]' ).fill( '2026-10-27' );
		await page.locator( 'select[name=startTime] option[value="09:00"]' ).waitFor( { state: 'attached' } );
		await page.locator( 'select[name=startTime]' ).selectOption( '09:00' );
		await page.getByRole( 'button', { name: 'Create Appointment' } ).click();
		await page.getByLabel( /Reason for visit/ ).fill( 'Chest pain after exercise' );
		await page.getByText( 'Bank transfer' ).click();
		await page.getByRole( 'button', { name: 'Confirm' } ).click();
		await page.getByText( 'Your appointment is booked.' ).waitFor();
		code = ( await page.locator( '.nxa-code' ).textContent() ).trim();
		expect( /^AP[A-Z0-9]{8}$/.test( code ), 'code format ' + code );
		await page.screenshot( { path: SHOTS + 'public-booking-success-1280.png', fullPage: true } );
	} );
	await step( 'booking: the taken slot is now disabled for everyone', async () => {
		await page.goto( BASE + '/nexus-booking/?doctor=' + seed.doctors[ 0 ].id );
		await page.locator( 'input[name=date]' ).fill( '2026-10-27' );
		const slot = page.locator( 'select[name=startTime] option[value="09:00"]' );
		await slot.waitFor( { state: 'attached' } );
		const optDisabled = ( sel ) => page.locator( sel ).evaluate( ( o ) => o.disabled ); // Playwright's isDisabled() ignores <option>
		expect( await optDisabled( 'select[name=startTime] option[value="09:00"]' ), '09:00 disabled' );
		expect( ! ( await optDisabled( 'select[name=startTime] option[value="09:30"]' ) ), '09:30 free' );
	} );
	await step( 'patient panel: Order List shows the booking; Appointment/Prescription List shows treated only; cancel then rebook', async () => {
		await page.goto( BASE + '/nexus-patient-panel/#orders' );
		await page.getByRole( 'heading', { name: 'Order List' } ).waitFor();
		await page.getByRole( 'cell', { name: 'Dr. Jane Roe' } ).first().waitFor();
		await page.goto( BASE + '/nexus-patient-panel/#appointments' );
		await page.getByRole( 'heading', { name: 'Appointment/Prescription List' } ).waitFor();
		await page.getByText( 'Nothing here yet.' ).waitFor(); // not treated yet
		await page.getByRole( 'button', { name: 'Upcoming' } ).click();
		await page.getByRole( 'cell', { name: 'Dr. Jane Roe' } ).first().waitFor();
		await page.getByRole( 'link', { name: 'View' } ).click();
		await page.getByText( 'Chest pain after exercise' ).waitFor();
		page.once( 'dialog', ( d ) => d.accept() );
		await page.getByRole( 'button', { name: 'Cancel appointment' } ).click();
		await page.locator( '.nxa-badge-cancelled' ).waitFor();
		await page.goto( BASE + '/nexus-booking/?doctor=' + seed.doctors[ 0 ].id );
		await page.locator( 'input[name=date]' ).fill( '2026-10-27' );
		await page.locator( 'select[name=startTime] option[value="09:00"]' ).waitFor( { state: 'attached' } );
		await page.locator( 'select[name=startTime]' ).selectOption( '09:00' );
		await page.getByRole( 'button', { name: 'Create Appointment' } ).click();
		await page.getByRole( 'button', { name: 'Confirm' } ).click();
		await page.getByText( 'Your appointment is booked.' ).waitFor();
		code = ( await page.locator( '.nxa-code' ).textContent() ).trim();
	} );
	await step( 'patient panel: profile save, password change validation, responsive 375', async () => {
		await page.goto( BASE + '/nexus-patient-panel/#profile' );
		await page.getByLabel( 'Phone' ).fill( '555-0101' );
		await page.getByRole( 'button', { name: 'Save' } ).click();
		await page.getByText( 'Saved.' ).waitFor();
		await page.goto( BASE + '/nexus-patient-panel/#password' );
		await page.getByLabel( 'Current password' ).fill( 'wrong' );
		await page.getByLabel( 'New password' ).fill( 'patientpass9' );
		await page.getByLabel( 'Confirm password' ).fill( 'patientpass9' );
		await page.getByRole( 'button', { name: 'Save' } ).click();
		await page.getByText( 'The current password is incorrect.' ).waitFor();
		await page.setViewportSize( { width: 375, height: 800 } );
		await page.goto( BASE + '/nexus-patient-panel/#appointments' );
		await page.getByRole( 'button', { name: 'Upcoming' } ).click(); // default "Treated" is empty at this point
		await page.locator( '.nxa-table' ).waitFor();
		await page.screenshot( { path: SHOTS + 'public-patient-panel-375.png', fullPage: true } );
		await page.setViewportSize( { width: 1280, height: 900 } );
	} );

	/* ---------------- doctor ---------------- */
	let printUrl = '';
	await step( 'doctor: patient cannot open the doctor panel; doctor logs in via ?type=doctor', async () => {
		await page.goto( BASE + '/nexus-doctor-panel/' );
		await page.getByText( 'This area is for doctors.' ).waitFor();
		await page.goto( BASE + '/__test/logout' );
		await page.goto( BASE + '/nexus-auth/?type=doctor' );
		expect( ( await page.getByRole( 'tab', { name: 'Doctor' } ).getAttribute( 'aria-selected' ) ) === 'true', 'Doctor tab preselected' );
		await page.getByLabel( 'E-mail' ).fill( 'pat@example.test' );
		await page.getByLabel( 'Password', { exact: true } ).fill( 'patientpass1' );
		await page.getByRole( 'button', { name: 'Log in' } ).click();
		await page.getByText( 'not a doctor account' ).waitFor();
		await page.getByLabel( 'E-mail' ).fill( 'jane@example.test' );
		await page.getByLabel( 'Password', { exact: true } ).fill( 'doctorpass123' );
		await page.getByRole( 'button', { name: 'Log in' } ).click();
		await page.waitForURL( /nexus-doctor-panel/ );
		await page.locator( '.nxa-stats' ).waitFor();
		await page.screenshot( { path: SHOTS + 'public-doctor-dashboard-1280.png', fullPage: true } );
	} );
	await step( 'doctor: new appointment → treatment with medicines → status treated → print', async () => {
		await page.goto( BASE + '/nexus-doctor-panel/#appointments' );
		await page.getByRole( 'cell', { name: code, exact: true } ).first().waitFor();
		await page.getByRole( 'link', { name: 'Treat' } ).first().click();
		await page.getByText( 'Pat Smith' ).first().waitFor();
		await page.getByRole( 'button', { name: 'Save treatment and prescription' } ).click();
		await page.getByText( 'Write treatment notes or add at least one medicine.' ).waitFor();
		await page.getByLabel( 'Treatment notes' ).fill( 'Mild hypertension. Rest and follow-up.' );
		await page.getByRole( 'button', { name: '+ Add medicine' } ).click();
		await page.locator( '.nxa-rx-row select' ).first().selectOption( { label: 'Aspirin 75 mg (Tablet)' } );
		await page.locator( '.nxa-rx-row input[name=dosage]' ).first().fill( '1-0-1' );
		await page.locator( '.nxa-rx-row input[name=duration]' ).first().fill( '7 days' );
		await page.getByRole( 'button', { name: 'Save treatment and prescription' } ).click();
		await page.getByText( 'Saved.' ).waitFor();
		await page.locator( '.nxa-badge-treated' ).first().waitFor();
		printUrl = await page.getByRole( 'link', { name: 'Print prescription' } ).first().getAttribute( 'href' );
		expect( printUrl.includes( 'nexulesuite_prescription=' ), 'print url' );
		await page.screenshot( { path: SHOTS + 'public-doctor-treatment-1280.png', fullPage: true } );
	} );
	await step( 'doctor: printable prescription renders medicines; history tab lists treated', async () => {
		await page.goto( printUrl );
		await page.getByText( 'Aspirin 75 mg' ).waitFor();
		await page.getByText( 'Dr. Jane Roe' ).first().waitFor();
		await page.screenshot( { path: SHOTS + 'print-prescription.png', fullPage: true } );
		await page.goto( BASE + '/nexus-doctor-panel/#appointments' );
		await page.getByRole( 'button', { name: 'Appointments History' } ).click();
		await page.getByRole( 'cell', { name: code, exact: true } ).first().waitFor();
	} );
	await step( 'doctor: schedule editor saves; leave day added and blocks booking', async () => {
		await page.goto( BASE + '/nexus-doctor-panel/#schedule' );
		await page.locator( '.nxa-sched-row' ).first().waitFor();
		await page.getByRole( 'button', { name: 'Save' } ).click();
		await page.getByText( 'Saved.' ).waitFor();
		await page.goto( BASE + '/nexus-doctor-panel/#leaves' );
		await page.locator( 'input[name=date]' ).fill( '2026-10-28' );
		await page.getByRole( 'button', { name: 'Add leave day' } ).click();
		await page.getByRole( 'cell', { name: /28 Oct 2026/ } ).first().waitFor();
		await page.goto( BASE + '/nexus-booking/?doctor=' + seed.doctors[ 0 ].id );
		await page.locator( 'input[name=date]' ).fill( '2026-10-28' );
		await page.getByText( 'The doctor is on leave this day.' ).waitFor();
		expect( await page.locator( 'select[name=startTime] option' ).count() === 1, 'no schedule options on a leave day' );
	} );
	await step( 'patient: sees treated appointment with Print; other patient data never exposed', async () => {
		await page.goto( BASE + '/__test/logout' );
		await j( '/__test/login-as?email=pat@example.test' );
		await page.goto( BASE + '/nexus-patient-panel/#appointments' );
		await page.getByRole( 'link', { name: 'Print prescription' } ).first().waitFor(); // treated-only default list
		const other = await page.request.get( BASE + '/wp-json/nexulesuite_/v1/appt/patient/appointments/999' );
		expect( other.status() === 404, 'unknown appointment is 404' );
		const admin = await page.request.get( BASE + '/wp-json/nexulesuite_/v1/appt/admin/appointments' );
		expect( admin.status() === 403, 'patient cannot call admin routes: ' + admin.status() );
	} );
	await step( 'doctor: Today Appointments and Payment History views render; dashboard shows the monthly chart', async () => {
		await page.goto( BASE + '/__test/logout' );
		await j( '/__test/login-as?email=jane@example.test' );
		await page.goto( BASE + '/nexus-doctor-panel/#today' );
		await page.getByRole( 'heading', { name: 'Today Appointments' } ).waitFor();
		await page.goto( BASE + '/nexus-doctor-panel/#payments' );
		await page.getByRole( 'heading', { name: 'Payment History' } ).waitFor();
		await page.getByText( 'Total earnings' ).waitFor();
		await page.goto( BASE + '/nexus-doctor-panel/#dashboard' );
		await page.locator( '.nxa-chart-wrap' ).waitFor();
		await page.setViewportSize( { width: 768, height: 1024 } );
		await page.goto( BASE + '/nexus-doctor-panel/#appointments' );
		await page.locator( '.nxa-side' ).waitFor();
		await page.screenshot( { path: SHOTS + 'public-doctor-appointments-768.png', fullPage: true } );
		await page.setViewportSize( { width: 1280, height: 900 } );
	} );
	await step( 'register: Doctor tab registers an inactive doctor pending admin approval', async () => {
		await page.goto( BASE + '/__test/logout' );
		await page.goto( BASE + '/nexus-auth/?mode=register&type=doctor' );
		await page.getByLabel( 'Designations' ).waitFor();
		await page.getByLabel( 'Name', { exact: true } ).fill( 'Dr. Self Registered' );
		await page.getByLabel( 'Designations' ).fill( 'MBBS' );
		await page.getByLabel( 'E-mail' ).fill( 'self@example.test' );
		await page.getByLabel( 'Phone' ).fill( '555-7' );
		await page.getByLabel( 'Password', { exact: true } ).fill( 'doctorpass123' );
		await page.getByLabel( 'Confirm password' ).fill( 'doctorpass123' );
		await page.locator( 'select[name=departmentId] option', { hasText: 'Cardiology' } ).waitFor( { state: 'attached' } );
		await page.locator( 'select[name=departmentId]' ).selectOption( { label: 'Cardiology' } );
		await page.getByRole( 'button', { name: 'Register' } ).click();
		await page.getByText( 'will be reviewed and activated' ).waitFor();
		const pub = await ( await page.request.get( BASE + '/wp-json/nexulesuite_/v1/appt/public/doctors' ) ).json();
		expect( ! pub.items.some( ( d ) => d.name === 'Dr. Self Registered' ), 'inactive doctor hidden from the public list' );
	} );
	await step( 'public: tablet (768) and phone (375) layouts of the doctors page and profile', async () => {
		for ( const w of [ 768, 375 ] ) {
			await page.setViewportSize( { width: w, height: 1000 } );
			await page.goto( BASE + '/nexus-doctors/' );
			await page.locator( '.nxa-doctor-card' ).first().waitFor();
			expect( ! ( await page.evaluate( () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1 ) ), 'no horizontal overflow at ' + w );
			await page.screenshot( { path: SHOTS + 'public-doctors-' + w + '.png', fullPage: true } );
			await page.goto( BASE + '/doctor-details/dr-jane-roe/' );
			await page.getByRole( 'tab', { name: 'Working Hours' } ).click();
			expect( ! ( await page.evaluate( () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1 ) ), 'no horizontal overflow on profile at ' + w );
			await page.screenshot( { path: SHOTS + 'public-doctor-profile-' + w + '.png', fullPage: true } );
		}
		await page.setViewportSize( { width: 1280, height: 900 } );
	} );
	await step( 'admin: appointment appears treated with treatment details', async () => {
		await page.goto( BASE + '/__test/logout' );
		await page.goto( BASE + '/wp-admin/?page=appointments#appointments' );
		await page.getByRole( 'cell', { name: /Pat Smith/ } ).first().waitFor();
		await page.getByRole( 'button', { name: code } ).click();
		await page.getByText( 'Mild hypertension' ).waitFor();
		await page.screenshot( { path: SHOTS + 'admin-appointment-detail-1280.png', fullPage: true } );
	} );
	await step( 'no JavaScript errors and no PHP notices during the run', async () => {
		const real = consoleErrors.filter( ( e ) => ! /Failed to load resource|dashicons|fonts\.googleapis/.test( e ) );
		expect( real.length === 0, 'console errors: ' + real.slice( 0, 5 ).join( ' | ' ) );
		expect( serverLog === '', 'php: ' + serverLog.slice( 0, 500 ) );
	} );
} finally {
	await browser.close();
	server.kill();
}
console.log( `\n${ passed } passed, ${ failed } failed` );
failures.forEach( ( f ) => console.log( '  - ' + f ) );
process.exit( failed ? 1 : 0 );
