# Architecture, design preservation, mobile UX, portfolio/reviews and performance plans

## 1. Proposed Next.js architecture (implemented)

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16.4 (App Router, React Server Components), React 19.3, TypeScript 5 |
| Rendering | Every route is statically generated at build time (`generateStaticParams`, `dynamicParams = false`). Content changes = rebuild (seconds). ISR/SSR are not needed because all content is static; the Node build keeps the door open for ISR later |
| Content | Elementor/WordPress export → `scripts/convert-elementor.mjs` → normalized JSON in `src/content/pages` and `src/content/posts` (block tree per section, SEO fields, FAQ items, word counts). Rendered by `components/sections/SectionRenderer` + `Blocks` |
| Configuration | `src/data/site.ts` (business facts, domain from env, phones, address, social, Google listing), `navigation.ts`, `services.ts` (money pages, portfolio tags, related links, articles), `reviews.ts`, `portfolio.ts` (derived from the image inventory) |
| Images | Pre-generated AVIF variants (480/960/1440) in `public/images/**`; `next/image` with a custom loader (`src/lib/image-loader.ts`) so the same build works on a Node server and as a static export |
| Styling | One plain CSS design system (`src/app/globals.css`, ~34 KB) with tokens; no CSS-in-JS, no utility framework |
| Client JS | Only four client components: mobile menu, language switcher, consultation modal (form loaded on open) and the form itself. Everything else is server-rendered |
| SEO | Metadata API per route, JSON-LD @graph (`src/lib/schema.ts`), `sitemap.ts`, `robots.ts`, trailing-slash URLs identical to WordPress |
| Forms | `POST /api/consultation/` (Node route handler, SMTP via nodemailer) or, for the static export, `deploy/staging/api/consultation/index.php` (wp_mail on the staging host) |
| Deployment | `npm run build` → standalone Node server (Hostinger VPS); `npm run build:static` → `out/` for any static host (used for the temporary hostingersite.com domain, which has no Node runtime) |

### Folder structure

```
logoaustin-nextjs/
  src/app/                 layout, home, [...slug] (pages + posts), sitemap, robots, api/consultation (Node only)
  src/components/          layout, navigation, sections, portfolio, reviews, consultation, blog, seo, ui, templates, home
  src/content/             migrated content JSON + image inventory (generated)
  src/data/                site, navigation, services, reviews, portfolio
  src/lib/                 content loader, seo, schema, image loader
  src/types/               content types
  public/images, public/logos
  scripts/                 convert-elementor.mjs, build-image-widths.mjs, generate-docs.mjs
  deploy/                  staging .htaccess snippet, PHP form endpoint, VPS notes
  docs/                    all deliverables
```

## 2. Design preservation plan

Preserved from the live site: logo files (light header PNG, dark footer PNG, square icon), orange/ink/cream/soft palette, charcoal header with orange promo bar and blue CTA, dark footer with the same four content groups and legal bar, hero layouts (copy left / artwork right), card grids, numbered process steps, FAQ accordions, dark CTA bands, all headings and body copy, all existing portfolio imagery, Google Maps embed, phone/WhatsApp CTAs.

Harmonised (proposed improvements, see approvals): the two template generations are unified on the newer "lda" look (Inter + DM Serif Display) so location and legacy pages match the homepage; buttons, cards and spacing use one token set; images are no longer stretched beyond their native size; the duplicated "Home › …" breadcrumb text inside heroes is replaced by a real breadcrumb component with schema.

Accessibility-driven changes: text set in brand orange now uses `#bf3f00`/`#c44100` (≥ 4.5:1 on white, cream and soft backgrounds) while large accents keep `#e04a00`; the blue top-bar CTA uses `#2f6fd6`; muted grey text is `#5b6270`.

## 3. Mobile UX plan (implemented)

- Header: single row with exactly three elements (logo, EN/ES selector, hamburger), 68 px tall, 44 px touch targets, sticky.
- Hamburger menu: full-height panel; Home, Services, Industries, Portfolio, About, Locations, Blog, Contact plus Free Consultation and Call buttons; nested groups expand in place; focus moves into the panel; Escape closes; active page highlighted.
- Content order on service pages: hero → trust strip → benefits/services → process → portfolio → reviews → FAQs → related links → consultation CTA. Hero artwork shows first on phones, then the headline.
- Sticky bottom bar (Call Now / Free Consultation / Portfolio) with safe-area padding; floating ★ Reviews button sits above it on the right and hides when the menu or modal is open. Both are hidden from 768 px upwards.
- No horizontal scroll at 390 px (verified on every template), fluid type with `clamp()`, tables scroll inside their container, galleries fall back to two columns.

## 4. Portfolio and reviews plan (implemented)

- Portfolio data is derived from the migrated image inventory (`src/data/portfolio.ts`): 55 real pieces, titles from approved alt text, categories inferred (construction, real estate, cleaning, medical, apparel, web, print…). Unnamed pieces show a truthful generic caption and are listed for the owner to name.
- Every primary money page gets a `PortfolioPreview` (six relevant pieces chosen by tags) unless it already has its own gallery, followed by `ReviewsSection`, `RelatedServices` and the page's CTA band. `/portfolio/` renders the complete categorised gallery with anchor filters.
- Reviews: `ReviewsSection` renders verified reviews from `src/data/reviews.ts` with source links and `Review` schema. The array is empty on purpose; until verified reviews are supplied it links to the Google Business Profile listing. No ratings or aggregate figures are shown or marked up.
- Mobile ★ Reviews button scrolls to the on-page reviews block, or opens the Google listing on pages without one.

## 5. Performance plan (implemented and measured)

- Static HTML for all 69 routes, standalone Node output (or static export), gzip/brotli at the proxy.
- Two self-hosted fonts (next/font, `display: swap`, metric-compatible fallbacks → CLS 0).
- Images: real AVIF, responsive variants, explicit width/height everywhere, hero images eager/high priority, everything else lazy.
- JavaScript: ~120 KB gzipped runtime shared across pages; the consultation form chunk loads only when the dialog opens. No analytics or third-party scripts in staging.
- Navigation: `next/link` prefetching + shared root layout gives near-instant client transitions; scroll restoration is native.
- Measured (Lighthouse 12, local production server): see `performance-report.md`.
