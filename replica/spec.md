# Specification: appointment system for Nexus Lead Suite (clone of DocMent's observable behaviour)

Companion to `recon.md` (evidence) and `plan.md` (how it lands in this codebase). Tags `[V]` `[I]` `[U]` as in `recon.md`. Every `[I]` and `[U]` item is a proposal that must be checked against the live demo once the network block is lifted; until then it is the behaviour the clone will implement.

## 1. Platform mapping

| DocMent (Laravel) | Nexus Lead Suite equivalent |
| --- | --- |
| `/admin/login` + Laravel admin panel | WordPress login → **Nexus → Appointments** React pages inside the existing admin SPA |
| Doctor panel at `/doctor/*` | front-end panel rendered by shortcode `[nexulesuite_doctor_panel]` for users with role `nexulesuite_doctor` |
| Patient panel at `/user/*` | front-end panel rendered by shortcode `[nexulesuite_patient_panel]` for role `nexulesuite_patient` |
| Public Blade pages | shortcodes placed on WordPress pages (`[nexulesuite_doctors]`, `[nexulesuite_doctor]`, `[nexulesuite_departments]`, `[nexulesuite_department]`, `[nexulesuite_appointment]`, `[nexulesuite_auth]`) + rewrite rules for `/doctor-details/{slug}` and `/department-details/{slug}` |
| Blog, Pages | WordPress posts and pages (already exist) |
| FAQ, Testimonials, Slider, Services | small option-backed lists managed in the React admin, rendered by shortcodes |
| Contact form → Contact Message | existing Form Builder + Submissions |
| Newsletter subscriber | existing Form Builder (e-mail field) + a "Subscribers" filter, send via existing Mailer |
| E-mail templates, SMTP | existing Email templates + Mailer |
| reCAPTCHA | existing Form Builder keys |
| SEO settings | new "Appointments → Settings → SEO" fields emitted on the shortcode pages |

## 2. Layout and navigation

### 2.1 Admin (inside the existing SPA)

- New sidebar entry **Appointments** (lucide `Stethoscope` or `CalendarCheck`) between *Form Builder* and *Settings*, registered as a WordPress submenu page like the others (`admin/class-admin-app.php`).
- The page uses `PageShell` with tabs across the top: **Dashboard · Appointments · Doctors · Departments · Locations · Schedules · Medicines · Patients · Withdrawals · Content · Settings**. Tabs mirror the DocMent sidebar sections `[V names]`; grouping into one page is a project convention `[I]`.
- Every list tab: toolbar (search input, status filter, "Add New" primary button), table (desktop) that collapses to stacked cards under 768 px (existing Tailwind breakpoints), row actions (Edit, Delete; plus View/Print for appointments). Empty state: icon + "No … yet" + Add New button. Loading state: skeleton rows. Error state: inline red banner with Retry.
- Create/edit: slide-over panel from the right (reuse `ModalBackdrop`), fields listed in §4, footer with Cancel / Save; Save shows a spinner and disables inputs; success closes the panel and shows `SuccessModal`; validation errors render under the field and in a summary at the top.
- Delete: `ConfirmDiscardModal` variant "Delete {name}?" with the consequence line (e.g. "Appointments of this doctor are kept but the doctor can no longer be booked").

### 2.2 Public pages

- Doctors listing: filter bar (Location select, Department select, Doctor name text, Search button) above a responsive card grid (3 columns ≥ 992 px, 2 at ≥ 576 px, 1 below) `[I]`; card = photo, name, department, location, fee, "View profile" and "Book now". Pagination 12 per page `[I]`.
- Doctor profile: two columns (≥ 992 px): left photo + name + department + location + fee + experience + address + about; right card "Book an appointment" (date → slots → continue). Below: weekly schedule table (Day · Hours) `[V]`.
- Department listing: card grid; department detail: header + description + doctors grid `[V]`.
- Quick appointment: stepper with 5 steps `[V]`: 1 Department, 2 Doctor (filtered), 3 Date (calendar; leave days and weekdays without schedule disabled `[V]`), 4 Time slot (chips; taken slots disabled `[I]`), 5 Review & payment (summary, payment method radio, Confirm). Not logged in → inline login/register panel at step 5 `[I]`.
- Auth: single `[nexulesuite_auth]` shortcode showing Login / Register tabs and a Doctor login toggle (`?type=doctor`) `[V]`; Forgot password link to WP lost-password.
- Patient and doctor panels: left sidebar (collapsible to a top dropdown on mobile) + content; sidebar items per §3.

## 3. Panels

### 3.1 Patient panel `[nexulesuite_patient_panel]`
Sidebar: Dashboard `[I]`, Appointments `[V]`, Payments `[V]`, Messages `[V]`, Profile `[V]`, Change Password `[V]`, Logout.
- Appointments: table Doctor · Date · Time · Status · Fee · Actions. Treated rows show **Print prescription** `[V]`; pending/paid rows show "Awaiting treatment" and, when a Zoom meeting exists, **Join** `[V]`. (DocMent lists only treated appointments `[V]`; the clone shows all with a status filter defaulting to "Treated" so nothing the original shows is hidden.)
- Payments: Order · Doctor · Amount · Method · Status · Date.
- Profile: name, e-mail (read-only), phone, address, photo. Change password: current, new, confirm.

### 3.2 Doctor panel `[nexulesuite_doctor_panel]`
Sidebar: Dashboard, Appointments, Time Schedule, Leave Days, Prescriptions, Payments, Withdraw, Live Consultation, Messages, Profile, Change Password, Logout. Names follow the documentation where it names them `[V]`, otherwise `[I]`.
- Dashboard: stat cards Today's appointments · This month's earnings · New appointments · Total patients; list of today's appointments `[V]`.
- Appointments: tabs New · Not treated · History `[V]`; row actions Treat, Create Zoom meeting, Message.
- Treat (S32): patient summary; textarea "Treatment notes"; medicine rows (Medicine type → Medicine select, Dosage text, Duration text, Instruction text; Add row / Remove) `[I fields]`; Save marks the appointment treated `[V]`; Print opens the prescription print view.
- Time Schedule: 7 weekday rows, each with Enabled toggle, Start, End, Slot length (min) `[I slot length]`.
- Leave Days: date input + Add; list with Remove.
- Payments: From/To date filter, table, total `[V]`.
- Withdraw: available balance; form Amount · Method (Bank transfer / PayPal / Other) · Account details; list of requests with status `[V]`.
- Live Consultation: per appointment "Create Zoom meeting"; history table with start URL (doctor) `[V]`.

### 3.3 Admin tabs
- Dashboard: counters Doctors · Patients · Appointments (today / total) · Revenue (month) · Pending withdrawals; recent appointments table `[I]`.
- Appointments: filters Doctor, Status, Date range; table; View (detail drawer incl. treatment), Print prescription, Cancel.
- Doctors: list + form (see §4). Departments, Locations, Medicine types, Medicines: list + form.
- Schedules: Doctor select → same 7-row editor as the doctor panel.
- Patients: list, view, deactivate.
- Withdrawals: list, Approve / Reject with note.
- Content: sub-tabs FAQs, Testimonials, Slider, Services, Home sections (on/off toggles for Hero, Search, Services, Counters, Departments, Doctors, Testimonials, Blog, Newsletter) `[V toggles]`.
- Settings: General (currency, time zone from WP, slot length default, booking lead time), Payments (Stripe, PayPal, Razorpay, Bank transfer, each: enabled + keys + instructions), Zoom (account id, client id, client secret), Notifications (templates for booking confirmed, treatment ready, withdrawal decision), SEO (title, description per public page).

## 4. Forms and validation

All validation runs server-side in the REST layer (and mirrored client-side for immediate feedback). Rules marked `[I]` are the clone's; the original's exact rules are unknown.

| form | field | rule |
| --- | --- | --- |
| Doctor | name | required, 2–100 chars |
| | e-mail | required, valid, unique among WP users |
| | password (create only) | required, ≥ 8 chars |
| | department, location | required, must exist |
| | fee | required, decimal ≥ 0 |
| | experience | integer 0–80 |
| | photo | image ≤ 2 MB (WP media) |
| | status | active / inactive |
| Department / Location / Medicine type | name | required, unique, ≤ 100 |
| Medicine | name, type | required |
| Schedule row | start < end; slot length 5–120 min; start/end on the slot grid |
| Leave day | date | today or later; not duplicate |
| Booking | date | not in the past; doctor has an enabled weekday row; not a leave day |
| | slot | belongs to the day's generated slots; not taken (unique index) |
| | patient | logged in with patient role |
| | payment method | one of the enabled gateways; bank transfer creates a `pending` appointment |
| Register | name, e-mail (unique), password ≥ 8, confirm match, phone optional, reCAPTCHA when configured; e-mail verification token (24 h) |
| Login | e-mail + password; 5 failures → 15 min lockout per IP `[I]` |
| Treatment | notes optional; at least one medicine row OR notes `[I]` |
| Withdraw | amount > 0 and ≤ available balance; method required |
| Contact | handled by existing Form Builder validation |

## 5. States

- Loading: skeletons for tables and cards, spinner in buttons; date and slot pickers show a spinner while availability loads.
- Empty: every list has a sentence and a primary action; public doctors search shows "No doctors match. Clear filters".
- Error: REST errors surface the server message; network errors show "Could not reach the server. Retry".
- Success: `SuccessModal` in admin; inline green alert in front-end panels; booking ends on a confirmation screen with appointment number, doctor, date, time, fee, payment status.
- Permission: a logged-in user without the needed role sees "This area is for doctors/patients" with a logout link; logged-out visitors see the auth shortcode.
- Print: prescription print view hides chrome via `@media print`; header with site logo (reuse the existing report logo setting), doctor, patient, date, medicines table, notes, signature line.

## 6. Responsive behaviour

- Admin: existing breakpoints (`sm` 640, `md` 768); tables become cards below `md`; the slide-over becomes full-screen below `sm`.
- Public: card grids 1 / 2 / 3 columns at 0 / 576 / 992 px (`[I]`, mirrors Bootstrap 5 which the original uses `[V]`); stepper collapses to a progress bar with the current step title on phones; the booking card on the doctor profile moves below the profile under 992 px.
- Panels: sidebar becomes a horizontal scrollable tab strip under 768 px.

## 7. Security and privacy

- Every REST route has a `permission_callback`: admin routes `manage_options`; doctor routes `nexulesuite_doctor` capability and ownership checks; patient routes `nexulesuite_patient` and ownership; public routes read-only and rate-limited (reuse the chatbot's IP limiter pattern).
- Nonces on all state-changing front-end calls (`X-WP-Nonce` as the admin already does).
- Gateway secrets stored with the existing encrypted-option helper used for AI keys; never returned to the browser.
- Health data (treatment notes, prescriptions) is personal data: export/erase hooks registered with WordPress's privacy tools; retention not auto-purged.

## 8. Not reproducible here and why

- Exact visual design, copy, icon set, animation timings, pagination sizes, validation copy of the original: **unknown** until the demo is reachable.
- Payment and Zoom flows: implementable against official APIs but **unverifiable** in this container (no outbound network, no merchant/Zoom accounts).
- WebSocket real-time chat: WordPress hosting has no persistent socket server; the clone uses 5-second polling, which looks the same to a user.
- Doctor subscription plans: not evidenced; built only if the demo shows them.

## 9. Clone decisions and unresolved questions (Phases 1–3 build)

Behaviour the original leaves undocumented was **not** invented silently; where the clone had to pick something, the choice is recorded here as a decision to confirm against the live demo once it is reachable.

| topic | what the clone does | status |
| --- | --- | --- |
| Admin login page | WordPress login; the module lives under *Nexus → Appointments*. No separate `/admin/login` page. | decision |
| Appointment status names | `pending → confirmed → treated`, `pending|confirmed → cancelled`; payment is a separate field (`unpaid|paid|refunded`). | inferred `[I]`; original names unknown |
| "New" appointments (doctor panel) | booked within the last 7 days and not yet treated or cancelled. | inferred `[I]` |
| Patient appointment list | the original shows treated appointments only `[V]`; the clone shows all with a filter that defaults to *Upcoming*, and a *Treated* filter that matches the original. | decision (superset) |
| Slot length | per weekday row (default from settings, 30 min). The original's slot model is unknown. | `[U]` |
| Minimum notice and cancel window | 60 min to book, 120 min to cancel online; both admin settings. | decision |
| Booking window | 30 days ahead (setting). | decision |
| Deleting a doctor with appointments | refused; deactivate instead. Deleting a department/location/medicine type in use: refused. | decision |
| Doctor self-service profile | name, phone, address, bio, photo. Fee, department, location, status stay with the admin. | inferred `[I]` |
| Payment at booking | pay at clinic or bank transfer (manual). Gateways are Phase 4. Free doctors are marked paid/none automatically. | scope |
| E-mail verification | required by default, 24 h token, resend endpoint never reveals whether an account exists. | decision |
| Rate limits | 120 public reads / minute / IP; 10 register-login attempts / 10 minutes / IP. | decision |
| Pretty URLs | `/doctor-details/{slug}` and `/department-details/{slug}` map onto the configured pages (matches the demo's URL shape `[V]`). | decision |
| Front-end rendering | catalogue pages are server-rendered (SEO, as the Laravel original); booking, auth and panels are JS apps on top of REST. | decision |
| Admin bundle | the shipped `assets/admin/js/main.js` predates `admin/src` (distribution snapshot); the Appointments page ships as its own bundle `assets/admin/js/appointments.js` and the main bundle is untouched. A sidebar link is injected on the other pages. | repository constraint |
| Health data | treatment notes and prescriptions are stored in plugin tables; access is ownership-checked. No HIPAA claim is made; a separate assessment is required. | caveat |

Open questions for the live demo: exact admin sidebar labels and order; fields of the doctor form (photo upload vs. media picker); whether patients can cancel at all; whether a doctor may edit their fee; the real status vocabulary; validation copy; pagination sizes; the look of the five-step booking stepper; whether the "SaaS" plans exist in DocMent.
