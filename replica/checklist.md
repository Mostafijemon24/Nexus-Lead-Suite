# Progress checklist — DocMent clone in Nexus Lead Suite

Updated: 2026-10-25. Legend: ✅ completed · ⬜ not started · ⚠️ unverified (built but not checked against the live demo or a real WordPress install) · 🚫 cannot be reproduced.

## Workflow steps

| step | status | notes |
| --- | --- | --- |
| 1 Inspect the website | ⚠️ partial | Live demo and vendor hosts blocked by the environment's network policy (403 on CONNECT, DNS not found in WebFetch). Evidence collected only through search-indexed text of the docs, the CodeCanyon listing and six public demo pages. No panel page seen. |
| 2 Map the website | ✅ with gaps | `recon.md`: 50 screens, 9 flows, ~25 entities, each row tagged V / I / U. Admin, doctor and patient panel layouts are inferred. |
| 3 Investigate with evidence | ⚠️ | No scripts or network behaviour could be observed. Verified vs assumed vs unknown is separated per row. |
| 4 Specification | ✅ draft | `spec.md`: layouts, components, flows, validation, loading/error/empty states, responsive rules. Validation copy and breakpoints of the original unknown. |
| 5 Implement | ⬜ | Blocked on two decisions in `plan.md` §0 (scope slice, network allowlist). |
| 6 Test | ⬜ | Strategy in `plan.md` §3. |
| 7 Report | ✅ this file | |

## Features (mirror of `features.csv`, clone column)

All 63 non-skip features: ⬜ not started.

## Cannot be reproduced / needs the user

- 🚫 Vendor's design, copy, images, demo data (theirs; clean-room clone uses its own).
- 🚫 Tawk live chat widget (replaced by the project's own chatbot), preloader toggle, one-click "clear database".
- 🚫 bKash gateway without a merchant account.
- ⚠️ Stripe / PayPal / Razorpay / Zoom: buildable against official APIs, untestable here without the user's sandbox credentials and outbound network.
- ⚠️ Real-time chat: WordPress hosting has no socket server; polling stands in.
- ❓ Doctor subscription plans: not evidenced for DocMent; verify on the demo.

## Evidence coverage

| area | verified rows | inferred/unknown rows |
| --- | --- | --- |
| public site | nav, home sections, doctor profile fields, department pages, booking steps, booking rules | routes other than the four indexed ones, layouts, pagination, copy |
| patient panel | treated-only list + print, profile, password, orders, chat, Zoom join | sidebar order, dashboard, columns |
| doctor panel | dashboard stats, new/not-treated/history, treatment+prescription+print, schedule, leave, payment history, withdraw, Zoom, chat | field lists, labels |
| admin panel | sidebar sections (Appointment, Schedule, Doctor, Department, Location, Blog, Pages, FAQs, App Settings, Withdraw Payment, Testimonial, Subscriber, Contact Message), medicine types/medicines, patients, multi-admin, home-section toggles, gateways, settings items | login page layout, dashboard content, every form, validation, responsive behaviour |
