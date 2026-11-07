# Existing website audit: logoaustin.com

Audit date: 7 November 2026. Sources: live HTML crawl of every page, the Yoast sitemaps, and a read-only inspection of the WordPress install through the connected Novamira connector (pages, posts, media library, menus, Elementor templates, Forminator forms, Yoast settings). Nothing on the live site was modified except the temporary removal of one export file the audit itself created in `wp-content/uploads`.

## Platform summary

| Item | Finding |
| --- | --- |
| CMS | WordPress 7.1.4, PHP 8.5, theme Hello Elementor, Elementor Pro 4.3 (containers), FlyingPress cache, Yoast SEO Premium, Forminator, Site Kit, Event Tracker |
| Content | 38 published pages, 24 published posts, 424 media items, 1 menu ("Mobile Menu", 25 items), Elementor header/footer templates, 1 popup (free consultation, 20 s delay) |
| URL structure | `/%postname%/` with trailing slash; pages and posts both live at the root (e.g. `/branding/`, `/hospital-branding-austin/`) |
| Indexing | `blog_public = 1`, robots.txt allows all, Yoast sitemap index with post/page/category/author sitemaps |
| Homepage weight | 914 KB HTML (Elementor inline CSS), 7 Google-font families referenced (Inter, DM Serif Display, Poppins, Manrope, Roboto, Roboto Slab, Saira Condensed, plus Antonio on older pages) |
| Languages | English only. The header "EN / Español" switcher sends visitors to a Google-translated proxy (`logoaustin-com.translate.goog`); there are no native Spanish pages |
| Forms | Elementor Pro forms on the consultation page and popup (name, email, mobile, service radio); two Forminator forms exist but are unused on the front end. Submissions email `zalalbd@gmail.com` |
| Reviews | No testimonials or review widgets anywhere. The portfolio page contains a hidden lorem-ipsum testimonial slider ("Michael Robert / Client") and a lorem-ipsum form section |
| Analytics | Site Kit installed but no GA4 property or Tag Manager container configured (`measurementID` empty) |

## Design system observed

- Colors: orange `#e04a00` (primary), ink navy `#0f1b2d` (dark sections), cream `#faf7f2`, soft grey `#f4f5f7`, body text `#3d4451`, charcoal header `#24262b`, footer `#333333` with orange `#ff6600` bottom bar, blue `#3d7fe6` top-bar CTA.
- Two generations of templates coexist: the newer "lda" pages (home, branding, graphic design, website design, fix-AI-logo, industry pages, consultation) use Inter + DM Serif Display with cards, trust strips and accordions; the older "la" pages (custom design, brand logo, business packages, locations, portfolio, legal, two Elementor posts) use Antonio + Saira Condensed with a simpler row/column system.
- Header: orange promo bar ("Do you want a logo that gets your business noticed?" + blue Free Consultation button), charcoal bar with light logo PNG (288×68), language switcher, menu, phone button.
- Footer: logo, "Same day appointment" phone, payment methods (Cash App, Zelle, PayPal, Bank Deposit), three link columns, address (7600 Chevy Chase Dr Suite 300, Austin TX 78752), Facebook, Google Maps embed, legal links, orange bar with Call Us / WhatsApp.

## Issues found

| # | Severity | Issue | Where | Resolution in the rebuild |
| --- | --- | --- | --- | --- |
| 1 | High | 41 broken image references (HTTP 404), mostly `logodesignportfolio-*.jpg` on the portfolio page, plus two 404 images on other pages | `/portfolio/`, `/texas-logo-design-service-…/` | Dropped from the rebuild; portfolio rebuilt from the 55 images that exist. Owner may supply the missing originals |
| 2 | High | Placeholder lorem-ipsum testimonial slider and a lorem-ipsum heading + form ("Veniam nostrum exercita…", "Clean catering Layout") | `/portfolio/` | Removed; never fabricated reviews. Reviews block now links to the verified Google listing |
| 3 | High | LocalBusiness schema says `addressLocality: Houston` while the business is in Austin; schema `geo` is downtown Austin, not the office | Yoast schema on every page | Corrected to the Austin address and the Maps-embed coordinates in `src/data/site.ts` (please verify) |
| 4 | Medium | Mixed-up menu hierarchy: industry pages nested under "Business Packages", city pages under "Consultation" | Header menu | Proposed IA groups them under Logo Design / Industries / Branding and a Locations group on mobile (approval item A3) |
| 5 | Medium | Footer typo "SAVE DAY APPOINMENT" and "Austin Logo Design • Logo Design Austin" filename-style alt text on many images | Footer, media library | Corrected copy; 40 images flagged for descriptive alt text (see image inventory) |
| 6 | Medium | Popup script leaks a template string `'+hi+'` into an `<h3>` | Popup template | Popup rebuilt as an accessible `<dialog>` component |
| 7 | Medium | 7+ font families loaded; 914 KB homepage HTML; render-blocking Elementor CSS | All pages | Two self-hosted font families (Inter, DM Serif Display), 34 KB total CSS, static HTML |
| 8 | Medium | Many `.avif` files are actually JPEG/PNG with the wrong extension; several 1280–1600 px originals served at 400 px | Media library | Re-encoded as real AVIF with 480/960/1440 responsive variants, descriptive filenames |
| 9 | Medium | No analytics or conversion tracking configured | Site Kit | Add GA4/GTM at launch (approval item A9); no tracking is shipped in staging |
| 10 | Low | Blog author shown as "admin" with no bio; one post in "Uncategorized" | Posts | Author rendered as "Logo Austin Design Team" linking to the team page; categories retained |
| 11 | Low | Duplicate location-page template text (14 city pages share the same structure) and 8 near-identical industry pages | Location/industry pages | Content preserved as-is; each page keeps unique local copy, portfolio and FAQs. Consolidation only with approval (A6) |
| 12 | Low | `privacy-policy` fetch returned a bot-challenge interstitial ("One moment, please…") on first crawl | Hosting WAF | Informational; the new static host serves HTML directly |
| 13 | Info | No hreflang, no Spanish content | Global | hreflang only added when native Spanish routes are approved (A2) |

## Duplicate content, metadata, links

- Titles and meta descriptions: unique on all 62 indexable URLs; two titles exceed 60 characters (see `seo-metadata-inventory.md`).
- Internal links: all content-level links resolve to existing routes (`internal-linking-map.md`); the only external targets are Facebook, WhatsApp, Google Maps and the Google-translate proxy.
- Blog posts link to each other and to the money pages inconsistently; the rebuild adds a data-driven "related services / guides" block.

## Pages and assets

Complete per-URL detail is in `page-inventory.md`, `seo-metadata-inventory.md`, `image-inventory.md` and `portfolio-inventory.md`. No page was deleted or merged; every existing URL is preserved as-is in the new site.
