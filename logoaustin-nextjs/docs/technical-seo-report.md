# Technical SEO report

Checked 62 exported HTML routes from `out/` on 2026-11-07.

- Routes exported: 62 (expected 62 content routes + home)
- Duplicate titles: none
- Images without alt attribute: 0
- Issues found: 0
- Trailing-slash URLs (matching the WordPress permalink structure): yes
- robots.txt: User-Agent: * / Disallow: /
- sitemap.xml: 62 URLs

## Issues

None.


## Manual checklist (verify on the deployed host)

- HTTPS and HSTS enabled, HTTP → HTTPS redirect
- 301 redirects: none required (all URLs preserved); add any approved changes to deploy/redirects.md
- X-Robots-Tag noindex present on staging only; absent in production
- Core Web Vitals field data after launch (Search Console)
- Google Search Console property verified and sitemap submitted (production only)
