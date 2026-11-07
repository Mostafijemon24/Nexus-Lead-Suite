# Accessibility report

Tested on 7 November 2026 with axe-core 4.x (WCAG 2.0/2.1 A + AA + best-practice rules) via Playwright on desktop (1366 px) and iPhone 13 viewports, plus Lighthouse accessibility audits.

## Result

| Page | Desktop violations | Mobile violations | Lighthouse a11y |
| --- | --- | --- | --- |
| `/` | 0 | 0 | 100 |
| `/branding/` | 0 | 0 | 100 |
| `/round-rock-logo-design/` | 0 | 0 | 100 |
| `/portfolio/` | 0 | 0 | — |
| `/blogs/` | 0 | 0 | — |
| `/hospital-branding-austin/` | 0 | 0 | 100 |
| `/consultation/` | 0 | 0 | — |
| `/privacy-policy/` | 0 | 0 | — |

## Issues found during the audit and fixed

| Issue | Fix |
| --- | --- |
| Brand orange `#e04a00` text on white/cream/soft backgrounds (3.7–4.1:1) and white text on orange buttons (4.1:1) failed AA | Text, links, eyebrows and button fills use `#bf3f00` / `#c44100` (≥ 4.5:1); large icon tiles and backgrounds keep `#e04a00` |
| Blue promo-bar button `#3d7fe6` with white text (3.9:1) | `#2f6fd6` (4.8:1) |
| Muted grey `#6b7280` on soft grey background (4.4:1) | `#5b6270` (5.6:1) |
| Language button accessible name did not include its visible label ("EN") | `aria-label="EN – change language"` |
| Blog post content jumped from `<h2>` to `<h5>` | Converter normalises h4–h6 inside classic posts to `<h3>` |
| Empty heading in the legal page template | Empty headings are skipped by the renderer |
| Floating reviews button outside any landmark (mobile) | Wrapped in `<aside aria-label="Customer reviews shortcut">` |
| Mobile menu panel kept `display:flex` while `hidden` | Global `[hidden] { display: none !important }` |

## Built-in accessibility features

- Semantic landmarks: skip link, `<header>`, `<nav aria-label>` (main, mobile, breadcrumb, quick actions), `<main id="main">`, `<footer>`, `<aside>`.
- Keyboard: all controls are native buttons/links; dropdowns open on focus-within; the mobile menu traps focus logically, closes on Escape and returns focus to the hamburger; the consultation dialog is a native `<dialog>` (focus trap, Escape, backdrop click).
- Touch targets ≥ 44 px for header controls, menu rows, sticky bar items and the reviews button.
- Forms: visible labels on every field, `fieldset/legend` for the radio group, `aria-live` status/alert messages, honeypot hidden from assistive tech.
- FAQ accordions use native `<details>/<summary>` (no JavaScript, works with screen readers).
- Images: descriptive alt text on 161 images; decorative duplicates (blog card thumbnails) use empty alt; 40 legacy portfolio images use a truthful generic alt pending client naming.
- Motion: smooth scrolling and transitions are disabled under `prefers-reduced-motion`.
- Language: `<html lang="en">`; the Spanish link carries `lang="es"`/`hreflang="es"`.

## Not yet verified (recommended before launch)

- Manual screen-reader pass (VoiceOver iOS, NVDA) on the homepage, a service page and the form.
- Zoom to 200% / 400% reflow check (layout is fluid, but confirm on real devices).
- Color-blind simulation of the orange CTAs against the dark sections.
