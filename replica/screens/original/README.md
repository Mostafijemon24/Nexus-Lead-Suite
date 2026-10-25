# Reference captures of the original DocMent site

Put screenshots and saved pages of the **original** site here so the comparison can be done
from the cloud session. Nothing in this folder ships with the plugin; it is reference only.

The cloud environment can now reach the vendor hosts at the network level, but the vendor's
server resets the TLS handshake from the cloud egress range, so captures must come from an
ordinary connection (your browser or a local Claude Code run).

## What to capture

| # | page on docment.websolutionus.com | file name prefix | notes |
| --- | --- | --- | --- |
| 1 | Home `/` | `home` | full page |
| 2 | Doctors listing | `doctors` | with the search bar visible; one capture after filtering by a department |
| 3 | Doctor profile `/doctor-details/<slug>` | `doctor-profile` | include the weekly schedule and the booking box |
| 4 | Department detail `/department-details/<slug>` | `department` | |
| 5 | Appointment / booking flow | `booking-step1` … `booking-step5` | one capture per step: department, doctor, date, time slot, payment/confirm |
| 6 | Login `/login` and `/login?type=doctor` | `login-patient`, `login-doctor` | also one capture with a validation error (wrong password) |
| 7 | Register | `register` | also one with a validation error |
| 8 | Patient dashboard and each sidebar item | `patient-<section>` | your own demo account only |
| 9 | Doctor dashboard and each sidebar item | `doctor-<section>` | your own demo account only; include the treatment/prescription form and the printed prescription |
| 10 | Admin login `/admin/login` and admin dashboard + each sidebar item | `admin-<section>` | demo admin only |

## Sizes and naming

Capture each page at three widths and name the files `<prefix>-<width>.png`:

- `1280` desktop, `768` tablet, `375` phone (Chrome DevTools device toolbar: set the width, then "Capture full size screenshot" from the command menu, Ctrl/Cmd+Shift+P).
- Example: `doctors-1280.png`, `doctors-768.png`, `doctors-375.png`.

Alongside each page, save the HTML with "Save page as… → Webpage, HTML only" as `<prefix>.html`.
That lets the comparison read labels, field names, validation copy and link structure, not just pixels.

## Captured so far (2026-10-25, from the cloud session during a window when the vendor host answered)

| file(s) | page | notes |
| --- | --- | --- |
| `home-1280/768/375.png` | `/` | full page |
| `department-1280/768/375.png` | `/department-details/cardiology` | description, sidebar list, "Department Doctor" cards |
| `doctor-profile-375.png` | `/doctor-details/dr-miguel-silva` | 1280/768 captures still missing (host reset the connection) |
| `login-patient-1280/768/375.png` | `/login` | Patient/Doctor tabs |
| `register-375.png` | `/register` | 1280/768 still missing |
| `admin-login-1280/768/375.png` | `/admin/login` | |

Saved HTML of these pages is kept outside the repository (vendor markup). Still missing: `/doctors`, the booking modal steps, every patient, doctor and admin screen behind a login.

## Rules

- Use only the vendor's public demo and your own demo accounts; never another person's data.
- Do not capture anything behind a paywall or a login you are not entitled to.
- Do not copy assets (logos, images, fonts) into the plugin; they stay here as reference only.

## Then

Commit the folder to branch `claude/lucid-gates-nnhorp` (or upload the files to the session) and
send: "Reference captures are in replica/screens/original/. Run the comparison."
