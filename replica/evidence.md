# Evidence from the original DocMent site (captured 2026-10-25)

Sources reached from the cloud session after the network allowlist was applied. The vendor host
resets many connections (TLS "connection reset by peer"), so each capture took several retries;
some pages never loaded. Everything below is **verified** unless marked otherwise.

| source | status | what it gave |
| --- | --- | --- |
| `https://doc.websolutionus.com/docment/` (vendor manual, 107 KB) | captured | full feature lists, admin/patient/doctor section manuals, default credentials, changelog 1.0 → 4.1.1 |
| `/doctor-details/dr-miguel-silva` (demo) | captured HTML + 375 px screenshot | doctor profile structure, forms, working-hours format |
| `/department-details/cardiology` (demo) | captured HTML + 1280/768/375 screenshots | department page structure |
| `/login` (demo) | HTML + 3 screenshots | login tabs and fields |
| `/register` (demo) | HTML + 375 screenshot | patient and doctor registration fields |
| `/admin/login` (demo) | HTML + 3 screenshots | admin login form |
| `/` (demo home) | 1280/768/375 screenshots (HTML fetch failed) | home sections |
| `/doctors`, `/appointment`, `/departments` | not captured (`/appointment` and `/departments` return 404: quick appointment is a modal, departments are reached via the Pages menu) | — |

Screenshots live in `replica/screens/original/` (reference only, never shipped).

## Verified structure of the public site

- **Stack:** Laravel, Bootstrap 5, jQuery 3.7, Nunito font, nice-select, select2, datatables, owl/swiper/slick carousels, magnific-popup, wow/animate.
- **Top bar:** e-mail, phone, language selector (English, Arabic), currency selector (USD, Naira, Rupee, Peso, CAD, Taka), social icons.
- **Nav:** Home · Doctors · Blog · About Us · Pages ▾ (Doctors, Department, Service, Testimonial) · Contact Us · **Appointment** (coral button, opens the "Create Appointment" modal).
- **Create Appointment modal:** Select Department → Select Doctor → Select Date (datepicker) → Select Schedule (select) → Close / Create Appointment. Posts to `/create-appointment`; the manual says the patient is then redirected to the payment page.
- **Home (768 px screenshot):** hero "Search The Best Doctors" (location / department / doctor selects + Search), three feature tiles, "How We Work" with video, FAQ accordion ("Ensure Your Health with Our Medical Services"), Our Service (6 cards), counters (500 Patients, 16 Departments, 50 Expert Doctors, 120 Total Labs), Our Departments (6 tiles + All Department), Our Patients (testimonial), Our Doctors (cards), Our Blog, Subscribe Us, partners strip, footer.
- **Doctor profile:** breadcrumb hero with "Dr. Miguel Silva (MBBS, FCPS, FRCS)"; photo; name; "Pediatric (MBBS, FCPS, FRCS)"; "Years of experience: 4"; "Fee: $9.00"; bio paragraph; tabs **Doctor Info · Working Hours · Address · Education · Experience · Qualification · Appointment**; Working Hours table "Week Day | Schedule" listing only scheduled days in 12-hour format ("Saturday 10:00 AM - 11:00 AM"); Education/Experience/Qualification as bullet lists; Create Appointment box = Select Date + Select Schedule + Submit.
- **Doctor card (department page):** name, department, designations ("MBBS, FCPS, FRCS"), location. No fee on the card.
- **Department page:** title + breadcrumb, description, Frequently Asked Questions accordion, Related Video, department list sidebar, Contact Us quick form (Name, Phone, Email, Subject, Message), "Department Doctor" cards.
- **Login page:** card with pill tabs **Patient | Doctor**; Email, Password, Remember Me, "Forgot password?", Login, "Dont have an account? Sign up". Doctor tab posts to `/doctor/doctor-login` with its own forgot link `?type=doctor`.
- **Register page:** tabs Patient | Doctor. Patient: Name, Email, Password, Confirm Password. Doctor: Name, Designations, Email, Phone, Password, Confirm Password, Select Department, Select Location. (The manual's doctor section still says doctors cannot self-register; the register page and the v2.5 changelog say they can. The approval step after doctor registration is undocumented.)
- **Admin login:** separate page `/admin/login`: Email *, Password *, Remember Me, Forgot Password?, Login.
- **Footer:** Subscribe Us newsletter, contact strip, About Us, Important Link (Home, About Us, Department, Doctors, Service), Account (Blog, Faq, Contact Us, Privacy Policy, Terms and Condition), Recent Post, app-store badges, copyright.

## Verified panel structure (vendor manual)

- **Admin sidebar:** Manage Order (Order History, Successful Order, Pending Order) · Appointment (All Appointment, New Appointments, Pending Appointments, Prescription, Payment History, Schedule, Days, Habits) · Zoom Meeting · Manage Patient (+ Send bulk mail) · Doctor (Department, Location, Doctor, Leave) · Medicine (Medicine, Medicine Type) · Services · Manage Blogs · Menu Builder · Home Section · Manage Pages · FAQs · Social Link · App Settings · Withdraw Payment · Testimonial · NewsLetter · Contact Message · Settings (General, Logo, Cookie, Breadcrumb, Maintenance, reCAPTCHA, Analytics, Tag Manager, Facebook pixel, Social Login, Tawk, Email, Email template, Language, SEO, Clear Cache, Clear Database, Custom Code, Payment Method, Admin & Roles).
- **Patient:** Registration (e-mail verification; cannot log in before confirming) · Login · Forget Password · Dashboard · Edit Profile (and change password, left sidebar) · Make Appointment (department → doctor → date; weekday and leave days checked; "all his time schedule will be displayed"; Submit → payment page; **incomplete profile redirects to the profile page first**) · Appointment/Prescription List (**only appointments treated by a doctor**; print from the bottom) · Order List (orders with their appointments, detail popup) · Zoom Meeting.
- **Doctor:** Login (manual: created by admin) · Forget Password · Dashboard (current-day appointments, new appointments, earnings, **chart of current-month earnings**) · Update Profile (top-right photo) · **Today Appointments** (create treatment / prescription via View) · Manage Appointment (**New Appointment, Not treated Appointments, Appointments History**) · Live Consultation (Zoom) · **Manage Leave** · **Payment History** (total earnings, search between two dates) · Payment Withdraw Request · **Time Schedule** (schedules added by admin) · Messaging.
- **Payment methods:** PayPal, Stripe, Razorpay, Flutterwave, Mollie, Paystack, Instamojo, Paymongo, Bank.
- **Requirements:** PHP ≥ 8.1 and standard extensions.

## What this changed in the clone (Phases 1–3)

Login/register with Patient|Doctor tabs and the exact field sets; doctor self-registration (inactive until an admin activates: documented decision); doctor designations/education/experience/qualification and the seven profile tabs; 12-hour working hours listing only open days; doctor cards without fee; booking as Department → Doctor → Date → Schedule select; patient Dashboard, Make Appointment, Appointment/Prescription List (treated by default), Order List, Edit Profile; doctor Today Appointments, Manage Appointment (New / Not treated / History), Manage Leave, Payment History with date search and total, Time Schedule, monthly earnings chart; admin Appointment views (All, New, Pending, Prescription, Payment History); profile completeness required before booking; Nunito, blue/coral palette.

## Still unverified

Admin panel screens (behind login; the vendor's demo credentials are public but were not used), doctor and patient panel screens, the `/doctors` listing page, the payment page, validation copy, exact spacing and typography scale.
