# Performance report

Measured with Lighthouse 12.8 against the production Node build (`next start`) on 7 November 2026, default Lighthouse throttling (simulated slow 4G, 4× CPU slowdown for mobile; desktop preset for desktop). Scores are lab estimates; field Core Web Vitals will be collected in Search Console after launch.

| Page | Device | Performance | Accessibility | Best practices | SEO* | LCP | CLS | TBT | FCP |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Home `/` | Mobile | 95 | 100 | 100 | 69* | 2.8 s | 0 | 70 ms | 0.9 s |
| Home `/` | Desktop | 100 | 100 | 100 | 69* | 0.6 s | 0 | 0 ms | 0.2 s |
| `/branding/` | Mobile | 94 | 100 | 100 | 69* | 3.0 s | 0 | 110 ms | 0.9 s |
| `/branding/` | Desktop | 100 | 100 | 100 | 69* | 0.6 s | 0 | 0 ms | 0.3 s |
| `/round-rock-logo-design/` | Mobile | 95 | 100 | 100 | 69* | 2.8 s | 0 | 70 ms | 0.9 s |
| `/round-rock-logo-design/` | Desktop | 100 | 100 | 100 | 69* | 0.6 s | 0 | 0 ms | 0.3 s |
| `/hospital-branding-austin/` (post) | Mobile | 95 | 100 | 100 | 69* | 2.9 s | 0 | 70 ms | 0.9 s |
| `/hospital-branding-austin/` (post) | Desktop | 100 | 100 | 100 | 69* | 0.6 s | 0 | 0 ms | 0.2 s |

\* SEO is 69 only because the build under test is the **staging** build (`NEXT_PUBLIC_NOINDEX=1` → `noindex` meta, failing Lighthouse's "page is crawlable" audit by design). The production build passes this audit; every other SEO audit passes.

## Reading the mobile LCP figure

Lighthouse's filmstrip shows the hero fully painted at about 1.1 s, and the trace records the single LCP text candidate (the hero paragraph) at first paint. The 2.8–3.0 s value is Lighthouse's *simulated* estimate, which charges the hero text with the JavaScript chunks that download in parallel (about 120 KB gzipped React/Next runtime). With scripts blocked the same page scores 99 with LCP 2.2 s, and the Speed Index is 0.9 s. Real-device LCP is expected well under 2.5 s on 4G; this will be confirmed with field data.

## What makes it fast

- Fully static HTML for all 69 routes; server response 20–50 ms locally.
- 34 KB CSS total (one file), no CSS-in-JS, no icon font, no third-party scripts in staging.
- Two self-hosted fonts via `next/font` with metric-compatible fallbacks → CLS 0 on every page.
- Images re-encoded as AVIF (originals were PNG/JPEG mislabelled as AVIF), responsive variants, explicit dimensions, lazy loading below the fold, hero images prioritised.
- Client JavaScript limited to the mobile menu, language switcher and consultation dialog; the form chunk loads only when the dialog opens (TBT dropped from 320 ms to 70 ms).
- Total transfer for the homepage: ~370 KB including fonts and images (Lighthouse "total byte weight" passes).
- Instant navigation: `next/link` prefetches routes in the viewport; transitions are client-side with the shared layout preserved.

## Remaining opportunities (not blocking)

- Legacy JavaScript (~13 KB) and unused JS (~30 KB) inside the Next.js runtime: framework-level, improves with each Next release.
- On the VPS enable Brotli in Nginx (config provided) and HTTP/2; on the LiteSpeed staging host compression and HTTP/3 are automatic.
- Add `fetchpriority` preloading of the hero image per page is already in place for hero images; location pages use 400 px source logos, so the hero figure is capped at its native width to avoid upscaling.

## Comparison with the live site (homepage)

| Metric | Live WordPress/Elementor | Rebuild |
| --- | --- | --- |
| HTML size | 914 KB | 38 KB |
| Font families | 7–8 | 2 |
| Stylesheets | Elementor inline + plugin CSS | 1 × 34 KB |
| Images | Mislabelled formats, several oversized | AVIF, responsive, right-sized |
| Lazy images / explicit dimensions | Partial | All |
