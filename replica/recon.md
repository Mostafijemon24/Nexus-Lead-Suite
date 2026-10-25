# Recon map: DocMent (web) — SaaS Based Multi Doctor Appointment System

Scope: the admin panel reached from `/admin/login`, plus the doctor panel, the patient panel and the public booking front end that the admin panel manages. The admin panel on its own is meaningless without the doctors, patients and appointments it administers, so the slice is the whole product's core loop.
For: Nexus Lead Suite (WordPress plugin, React 18 + Vite admin SPA, PHP REST API) — owner Mostafijemon24.
Date: 2026-10-25
Target URL given: https://docment.websolutionus.com/admin/login

## Evidence legend

Every row below carries one of these tags. Nothing tagged `[U]` or `[I]` may be reported as "99 % similar" until it has been checked against the live site.

| tag | meaning |
| --- | --- |
| `[V]` | verified from text the vendor published (documentation, CodeCanyon listing, indexed demo pages) |
| `[I]` | inferred from the product category, the Laravel/Bootstrap conventions WebSolutionUS uses, or the sister product DocPoint |
| `[U]` | unknown; needs the live demo |

## Access status (read this first)

The session's cloud container could **not** open the target. Every outbound request to the demo host and to the vendor's other hosts was refused by the environment's network policy (HTTP 403 on CONNECT from the egress proxy; the WebFetch tool returned DNS "not found" for the same hosts). Only web search worked, so this map was built from indexed text of:

- the vendor documentation,
- the CodeCanyon item page and the bKash add-on page,
- six indexed pages of the live demo (home, two department pages, three doctor pages).

No page of the admin panel, the doctor panel or the patient panel was seen. Layout, field order, validation messages, loading states, responsive breakpoints and exact menu labels of those panels are therefore `[I]` or `[U]`.

To lift the block, add these hosts under **Allowed domains** in the environment's network settings (Limited level, keep "Allow package managers" ticked): `docment.websolutionus.com`, `doc.websolutionus.com`, `codecanyon.net`, `websolutionus.com`. Then re-run Steps 1 to 3 of the workflow with Playwright (pre-installed) to replace every `[I]`/`[U]` tag with evidence and to fill `replica/screens/` with reference screenshots.

## Sources

| # | source | URL | what it gave | status |
| --- | --- | --- | --- | --- |
| 1 | vendor documentation | https://doc.websolutionus.com/docment/ | admin sidebar sections, default logins for admin/doctor/patient, booking rules (weekday, leave days, time schedule), doctor and patient panel behaviour, requirements | read via search snippets only |
| 2 | CodeCanyon listing | https://codecanyon.net/item/docment-saas-based-multi-doctor-appointment-system/33132125 | admin/doctor/patient feature lists, Laravel 10 + Bootstrap 5, v4.1.1 (21 Apr 2026), $69, demo links | read via search snippets only |
| 3 | bKash add-on listing | https://codecanyon.net/item/bkash-addon-for-docment/56175994 | demo URLs for the three panels, payment gateways extend through add-ons, compatible with DocMent ≥ 4.0.0 | read via search snippets only |
| 4 | live demo, indexed pages | https://docment.websolutionus.com/ , /department-details/pediatric , /department-details/cardiology , /doctor-details/dr-miguel-silva , /doctor-details/dr-jesse-moran , /doctor-details/dr-john-m-brown | public navigation, home sections, doctor profile fields (specialty, experience, fee, weekly schedule, address) | read via search snippets only |
| 5 | sister product docs (DocPoint) | https://doc.websolutionus.com/docpoint/ | how WebSolutionUS models doctor subscription plans; used only to flag `[I]` rows | analogy only |
| 6 | target admin login | https://docment.websolutionus.com/admin/login | nothing — blocked | **not inspected** |

Terms check: the demo is a public showcase and the documentation is public. No account that is not the user's own was used; the vendor's published demo credentials were not used because the host is unreachable from here. The clone is clean-room: no source, assets, copy or network calls of the original are taken.

## Core loop

A patient finds a doctor by department or location, picks an available day and time slot, pays the consultation fee, and the doctor treats the appointment and issues a printable prescription. The admin runs the catalogue (departments, locations, doctors, schedules, medicines), the money (payments, doctor withdrawals) and the marketing site. `[V]`

## Roles and entry points `[V]`

| role | login route on the demo | how accounts are created |
| --- | --- | --- |
| Admin | `/admin/login` | seeded; the main admin adds further admins |
| Doctor | `/login?type=doctor` | created by an admin only; doctors cannot self-register |
| Patient | `/login`; register at `/register` `[I path]` | self-registration with e-mail verification |

## Screens

Public site = S01–S19, patient panel = S20–S29, doctor panel = S30–S39, admin panel = S40–S69.

| ID | screen | route / how to reach | purpose | key components | states seen | tag |
| --- | --- | --- | --- | --- | --- | --- |
| S01 | Home | `/` | pitch + search + entry to booking | top bar (phone, e-mail, account link), nav (Home, Doctors, Blog, About Us, Pages ▾ [Doctors, Department, Service, Testimonial], Contact Us, Appointment), hero, "Search The Best Doctors" (location / doctor / department), services grid (Heart Surgery, DNA Testing, Dental Care, Ambulance Service), counters (patients, departments, expert doctors, labs), departments, doctors, testimonials, blog teasers, footer (FAQ, Blog, Privacy Policy, Terms and Conditions, contact block) | filled; every section can be switched off by admin | `[V]` |
| S02 | Doctors listing | `/doctors` `[I path]` | browse and filter doctors | search by location / doctor name / department, doctor cards (photo, name, department, fee, "Book" link), pagination | filled; empty result `[U]` | `[V]` feature, `[I]` layout |
| S03 | Doctor details | `/doctor-details/{slug}` | profile and booking entry | photo, name, department/specialty, years of experience, fee, address, weekly schedule table, book-appointment CTA, about text | filled | `[V]` |
| S04 | Department details | `/department-details/{slug}` | describe department, list its doctors | header, description, doctor cards | filled | `[V]` |
| S05 | Departments listing | Pages ▾ Department | all departments | department cards with icon | filled | `[V]` menu, `[I]` layout |
| S06 | Services | Pages ▾ Service | service cards | cards (title, text, icon) | filled | `[V]` menu |
| S07 | Testimonials | Pages ▾ Testimonial | patient quotes | testimonial cards | filled | `[V]` menu |
| S08 | Blog list | `/blog` `[I path]` | posts | post cards, categories sidebar `[I]`, pagination | filled | `[V]` menu |
| S09 | Blog post | `/blog/{slug}` `[I]` | read a post | title, image, body, share, related `[I]` | filled | `[I]` |
| S10 | About Us | `/about-us` `[I]` | static page | hero, text, counters `[I]` | filled | `[V]` menu |
| S11 | Contact Us | `/contact-us` `[I]` | send a message | form (name, e-mail, subject, message `[I]`), map `[I]`, contact block | success/error `[U]` | `[V]` menu; messages land in admin "Contact Message" `[V]` |
| S12 | FAQ | footer | questions and answers (accordion `[I]`) | accordion | filled | `[V]` |
| S13 | Custom page (Privacy Policy, Terms and Conditions) | footer | static legal pages from "Manage Pages" | title, body | filled | `[V]` |
| S14 | Appointment (quick booking) | nav "Appointment" | book without going through a profile | step 1 department → step 2 doctor → step 3 date → step 4 time slot → step 5 payment | leave day blocked, no slot `[U]` | `[V]` flow |
| S15 | Patient login | `/login` | sign in | e-mail, password, remember `[I]`, forgot link `[I]`, link to register | invalid credentials `[U]` | `[V]` |
| S16 | Patient register | `/register` `[I]` | create account | name, e-mail, phone `[I]`, password, confirm `[I]`, reCAPTCHA (when on) | "check your e-mail" state | `[V]` verification, `[I]` fields |
| S17 | Forgot / reset password | `/forgot-password` `[I]` | recover | e-mail form; reset form with token | sent / invalid token `[U]` | `[I]` |
| S18 | Doctor login | `/login?type=doctor` | doctor sign in | same form as S15 with type flag | | `[V]` |
| S19 | Newsletter subscribe (footer block) | footer | collect e-mails for admin "Subscriber" | e-mail input + button | success `[U]` | `[V]` feature |
| S20 | Patient dashboard | `/user/dashboard` `[I]` | overview | counters (appointments, upcoming) `[I]`, sidebar (Dashboard, Appointments, Messages, Profile, Change Password, Logout) | | `[I]` |
| S21 | Patient appointments | sidebar | list treated appointments; print prescription | table (doctor, date, time, status, fee, actions), print button | shows only appointments a doctor has treated `[V]`; empty `[U]` | `[V]` |
| S22 | Patient orders / payment history | sidebar | list payments | table (order id, doctor, amount, gateway, status, date) | | `[V]` ("appointments and orders"), `[I]` columns |
| S23 | Patient profile | sidebar | edit profile | name, e-mail, phone, address, photo `[I]` | saved toast `[U]` | `[V]` |
| S24 | Change password | sidebar | change password | current, new, confirm | validation `[U]` | `[V]` |
| S25 | Messages (real-time chat with doctor) | sidebar | chat | conversation list, thread, composer | | `[V]` |
| S26 | Join Zoom consultation | from appointment | join link | button to meeting URL | | `[V]` |
| S30 | Doctor dashboard | `/doctor/dashboard` `[I]` | today's appointments, monthly earnings, new-appointment alerts | stat cards, today's list | | `[V]` |
| S31 | Doctor appointments | sidebar | new / not treated / history | tabs or filters, table, actions (treat, Zoom, message) | | `[V]` |
| S32 | Treatment & prescription | from an appointment | write treatment, add medicines (type, name, dosage, duration, instructions `[I]`), save, print | form, medicine rows, print view | printed `[V]` | `[V]` |
| S33 | Time schedule | sidebar | per-weekday slots | weekday rows with start/end times, slot length `[I]` | | `[V]` |
| S34 | Leave days | sidebar | block dates | date picker, list, delete | patients cannot book on leave days `[V]` | `[V]` |
| S35 | Payment history | sidebar | earnings by date range | from/to filter, table, totals | | `[V]` |
| S36 | Withdraw request | sidebar | request payout | amount, method, account details `[I]`; list with status (pending/approved/rejected `[I]`) | | `[V]` |
| S37 | Live consultation (Zoom) | sidebar | create meeting per appointment; history | create button, meeting list | | `[V]` |
| S38 | Messages | sidebar | chat with patients | as S25 | | `[V]` |
| S39 | Doctor profile / password | sidebar | edit profile incl. fee, bio, photo `[I]` | form | | `[I]` |
| S40 | Admin login | `/admin/login` | admin sign in | e-mail, password, remember `[I]`, forgot link `[I]`; no self-registration | invalid credentials `[U]` | `[V]` exists, `[U]` layout |
| S41 | Admin dashboard | after login | KPIs | counters (doctors, patients, appointments, revenue `[I]`), recent appointments `[I]` | | `[V]` name, `[I]` content |
| S42 | Manage Appointment | sidebar | all appointments | filters (doctor, status, date `[I]`), table, view, print prescription | | `[V]` |
| S43 | Manage Schedule | sidebar | doctor weekday schedules | pick doctor → weekday rows | | `[V]` |
| S44 | Manage Doctor | sidebar | list / Add New / edit / delete | table, form (name, e-mail, password, department, location, fee, experience, photo, bio, status `[I]`) | | `[V]` |
| S45 | Manage Department | Doctor menu ▾ | CRUD | table, form (name, slug, icon/image, description, status `[I]`) | | `[V]` |
| S46 | Manage Location | Doctor menu ▾ | CRUD | table, form (name, status `[I]`) | | `[V]` |
| S47 | Medicine Type | sidebar | CRUD | table, form (name) | | `[V]` |
| S48 | Medicine | sidebar | CRUD | table, form (name, type, note `[I]`) | | `[V]` |
| S49 | Patients | sidebar | list, view, delete `[I]` | table | | `[V]` |
| S50 | Prescriptions | from S42 | view / print | print layout | | `[V]` |
| S51 | Manage Withdraw Payment | sidebar | approve / reject doctor payouts | table, status action, note `[I]` | | `[V]` |
| S52 | Payment methods | App Settings ▾ `[I]` | PayPal, Stripe, Razorpay, bank transfer, more via add-ons (bKash) | per-gateway toggle + keys + currency | | `[V]` gateways |
| S53 | Manage Blog | sidebar | posts (+ categories `[I]`) | table, editor, image, SEO fields `[I]` | | `[V]` |
| S54 | Manage Pages | sidebar | custom pages | table, editor | | `[V]` |
| S55 | Manage FAQs | sidebar | CRUD | table, form (question, answer) | | `[V]` |
| S56 | Manage Testimonial | sidebar | CRUD | table, form (name, designation, photo, text, rating `[I]`) | | `[V]` |
| S57 | Slider photos | home-page settings | CRUD | image, title, subtitle, button `[I]` | | `[V]` |
| S58 | Home page sections | settings | on/off per section | toggles | | `[V]` |
| S59 | Subscriber | sidebar | list, send e-mail to all | table, compose form | | `[V]` |
| S60 | Contact Message | sidebar | read messages | table, view, delete `[I]` | | `[V]` |
| S61 | App Settings | sidebar | general, SEO, e-mail template, cookie consent, reCAPTCHA, Google Analytics, Tawk live chat, preloader on/off, clear database, languages, currencies | tabbed settings | | `[V]` |
| S62 | Admins | sidebar | add more admins | table, form | | `[V]` |
| S63 | Admin profile / password | top-right menu `[I]` | | form | | `[I]` |
| S64 | Pricing plans / doctor subscriptions | — | the title says "SaaS Based" but no plan menu appears in the documentation sidebar; the sister product DocPoint has "Pricing plan" where doctors buy a subscription | | | `[U]` |

## Flows

```
F01 Patient books an appointment from a doctor profile
    S01 -> S02 -> S03 -> (login/register S15/S16 if needed) -> date -> time slot -> payment (S52 gateway) -> confirmation
    happy path clicks: 7 (home, doctors, doctor, book, date, slot, pay)              [I count]
    edge: doctor on leave that day [V], weekday with no schedule [V], slot already taken [I],
          payment fails/cancelled [I], unverified e-mail [V]

F02 Patient books via the quick "Appointment" menu
    S01 -> S14 (department -> doctor -> date -> time slot -> payment)                 [V]
    happy path clicks: 6

F03 Doctor treats an appointment
    S18 -> S30 -> S31 (new) -> S32 write treatment + medicines -> save -> print       [V]
    after save the appointment appears in the patient's list (S21) [V]

F04 Doctor manages availability
    S33 set weekday hours -> S34 add leave days                                        [V]

F05 Doctor gets paid
    S35 earnings -> S36 withdraw request -> admin S51 approves/rejects                 [V]

F06 Admin onboards a doctor
    S40 -> S45 department -> S46 location -> S44 Add New doctor -> S43 schedule        [V]

F07 Admin runs the marketing site
    S53 blog, S54 pages, S55 FAQ, S56 testimonials, S57 slider, S58 section toggles,
    S59 subscribers, S60 contact messages                                             [V]

F08 Live consultation
    S37 doctor creates Zoom meeting for an appointment -> patient joins (S26)          [V]

F09 Real-time chat
    S25 <-> S38                                                                        [V]
```

## Components

| component | variants | states | used on | tag |
| --- | --- | --- | --- | --- |
| Public header + nav | desktop bar, mobile off-canvas `[I]` | active item, dropdown "Pages" | S01–S19 | `[V]` items |
| Footer | — | — | public | `[V]` links |
| Search bar (location / doctor / department) | home hero, doctors page | empty, results | S01, S02 | `[V]` |
| Doctor card | grid, list `[I]` | — | S01, S02, S04 | `[V]` |
| Department card | grid | — | S01, S05 | `[V]` |
| Weekly schedule table | profile, admin | — | S03, S33, S43 | `[V]` |
| Date picker | booking | disabled leave days / no-schedule weekdays | S14, S03 flow | `[V]` rule |
| Time-slot picker | booking | available, taken `[I]`, selected | S14 | `[V]` step |
| Payment method chooser | booking | per enabled gateway | S14 | `[V]` |
| Auth form (login / register / reset) | patient, doctor, admin | error, loading `[U]` | S15–S18, S40 | `[V]` |
| Panel layout (sidebar + content) | patient, doctor, admin | collapsed `[I]` | S20–S64 | `[I]` |
| Stat card | dashboard | — | S30, S41 | `[V]` |
| Data table with actions | every CRUD list | empty `[U]`, paginated `[I]`, search `[I]` | admin, doctor | `[I]` |
| CRUD form (create/edit) | all catalogue entities | validation errors `[U]` | admin | `[I]` |
| Status toggle (active/inactive, on/off) | sections, entities | on, off | S58, S44, S45 | `[V]` for sections |
| Prescription print view | doctor, patient, admin | print | S32, S21, S50 | `[V]` |
| Chat thread | doctor, patient | — | S25, S38 | `[V]` |
| Toast / alert | success, error | — | all panels | `[I]` |
| Confirm dialog (delete) | — | — | admin lists | `[I]` |
| Rich text editor | blog, pages, doctor bio | — | S53, S54, S44 | `[I]` |
| Image upload | doctor photo, slider, blog | preview | admin | `[I]` |

## Inferred data model

```
Admin        id, name, email, password_hash, role (super | admin), status
             evidence: S40, S62 (multi-admin)                        confidence: high

Doctor       id, user_id, slug, name, email, phone, photo, department_id, location_id,
             fee, experience_years, bio, address, status
             evidence: S03 (fee, experience, address, schedule), S44, S02 filters
             confidence: high

Department   id, name, slug, icon/image, description, status
             evidence: S04, S45                                       confidence: high

Location     id, name, status
             evidence: S02 filter, S46                                confidence: high

Schedule     id, doctor_id, weekday (0-6), start_time, end_time, slot_minutes?, status
             evidence: S03 weekly table, S33, S43, booking rule        confidence: high (slot_minutes: guess)

LeaveDay     id, doctor_id, date, note?
             evidence: S34, booking rule "cannot book on leave days"   confidence: high

Patient      id, user_id, name, email, phone, address, photo, email_verified_at
             evidence: S16 verification, S23, S49                      confidence: high

Appointment  id, patient_id, doctor_id, date, time_slot, status (pending | paid | treated | cancelled),
             fee, payment_id, zoom_meeting_id?, created_at
             evidence: F01, S21 (treated), S31 (new / not treated), S42   confidence: high (status names: guess)

Payment      id, appointment_id, patient_id, doctor_id, gateway, amount, currency, txn_id, status
             evidence: S22, S52, gateways list                          confidence: high

Treatment    id, appointment_id, doctor_id, notes, created_at
Prescription id, treatment_id, items[] {medicine_id, dosage, duration, instruction}
             evidence: S32, S50, print                                   confidence: medium (item fields: guess)

MedicineType id, name            Medicine id, type_id, name, note?
             evidence: S47, S48                                          confidence: high

Withdrawal   id, doctor_id, amount, method, account_details, status (pending | approved | rejected), note
             evidence: S36, S51                                          confidence: high (fields: medium)

Message      id, from_user_id, to_user_id, appointment_id?, body, read_at, created_at
             evidence: S25, S38 real-time messaging                      confidence: medium

ZoomMeeting  id, appointment_id, doctor_id, join_url, start_url, start_at
             evidence: S37, S26                                           confidence: medium

Post, PostCategory?, Page, Faq, Testimonial, Slide, Subscriber, ContactMessage,
HomeSectionToggle, Setting (general, seo, email template, cookie, recaptcha, analytics, tawk, preloader),
Language, Currency
             evidence: S53–S61                                             confidence: high (existence), low (fields)

PricingPlan / Subscription   — not evidenced for DocMent; exists in DocPoint    confidence: guess
```

Relationships: Department 1-n Doctor; Location 1-n Doctor; Doctor 1-n Schedule, 1-n LeaveDay, 1-n Appointment, 1-n Withdrawal; Patient 1-n Appointment; Appointment 1-1 Payment, 1-0..1 Treatment, 1-0..1 ZoomMeeting; Treatment 1-n PrescriptionItem n-1 Medicine n-1 MedicineType; User n-n Message.

## Feature matrix

See `features.csv` (69 rows). Must: 31, should: 23, could: 9, skip: 6 (two of the skips are must-priority originals that are replaced by design: vendor assets and Laravel internals).

## Out of scope (cannot or should not be cloned)

- **Payment gateways need the user's own merchant accounts.** Stripe, PayPal, Razorpay and bKash can be wired through their official APIs only with the user's keys; the demo's gateway configuration is private.
- **Zoom** needs the user's own Zoom app credentials (official API). Reproducible, but not testable here.
- **The vendor's demo data, copy, images, icons and theme** are theirs. The clone uses its own copy and assets.
- **Tawk live chat** is a third-party widget; the project already has its own AI chatbot, which covers that role.
- **"Clear database" admin action** is a hosted-script convenience; in WordPress the equivalent is the plugin's existing uninstall/clean-up setting, not a destructive one-click reset.
- **Laravel-specific internals** (routes, controllers, Blade templates) are not reproduced; the equivalent in this project is WordPress REST routes + React + shortcodes.
- **Doctor subscription plans** (the "SaaS" in the name) are `[U]`: not evidenced for DocMent. Listed as `could` pending verification.

## Size

Screens 50 (19 public, 7 patient, 10 doctor, 14+ admin), flows 9, entities ~25. Hard parts: slot generation from weekday schedules + leave days + taken slots; three roles on top of WordPress users and capabilities; payments; real-time chat (polling or WebSocket); Zoom; printable prescriptions; the marketing CMS half (blog, pages, FAQ, testimonials, slider, section toggles) which overlaps WordPress itself. Size: **XL** as a whole. Rescoped to the appointment core (Phases 1–3 in `plan.md`): **L**.
