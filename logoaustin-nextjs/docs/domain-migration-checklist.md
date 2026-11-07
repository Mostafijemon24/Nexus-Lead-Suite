# Permanent-domain migration checklist (logoaustin.com)

Do not start until explicitly approved. The current WordPress site stays untouched until step 9.

| # | Task | How |
| --- | --- | --- |
| 1 | Production environment | `.env.production`: `NEXT_PUBLIC_SITE_URL=https://logoaustin.com`, `NEXT_PUBLIC_NOINDEX=0`, SMTP + `LEAD_EMAIL_TO` (approved recipient), GA4/GTM IDs if approved |
| 2 | Build and deploy to the VPS | `npm ci && npm run build`, PM2 + Nginx per `deployment.md`; smoke-test on the VPS IP with a `Host: logoaustin.com` header before DNS changes |
| 3 | HTTPS | Certbot for `logoaustin.com` and `www`; HSTS enabled; www → apex 301 |
| 4 | Canonicals, Open Graph, schema, sitemap, hreflang | All derive from `NEXT_PUBLIC_SITE_URL`; verify one page of each type in view-source |
| 5 | Internal links and image URLs | Relative in the build; run `node scripts/generate-docs.mjs` after `npm run build:static` and read `technical-seo-report.md` (0 unknown routes expected) |
| 6 | Redirects | None required: every existing URL is preserved. Add Yoast-era redirects (if any exist in Yoast Premium's redirect manager, export them) to `deploy/vps/nginx.conf` as 301s; never redirect unrelated pages to the homepage |
| 7 | Remove staging restrictions | Production build has no noindex meta, no `X-Robots-Tag`, `robots.txt` allows all and references the sitemap. Confirm with `curl -I https://logoaustin.com/` |
| 8 | Keep a copy of the WordPress site | Full backup/export of the live WordPress (files + DB) before DNS switch; keep it available for 90 days |
| 9 | DNS cut-over | Lower TTL 24 h before; point the A/AAAA records to the VPS; keep MX/TXT records unchanged |
| 10 | Google Search Console | Verify the domain property (DNS TXT), submit `https://logoaustin.com/sitemap.xml`, request indexing of the homepage and top money pages, check Coverage/Pages the next day |
| 11 | Google Business Profile | Confirm the website URL still points to logoaustin.com; confirm the reviews link in `site.ts` |
| 12 | Forms and tracking | Submit the consultation form from desktop and mobile; confirm the email arrives; confirm GA4 events (if configured) |
| 13 | Monitoring | Uptime monitor on `/` and `/sitemap.xml`; Core Web Vitals in Search Console after 28 days; 404 log review weekly for the first month |
| 14 | Yoast/WordPress decommission | After 2–4 weeks of stable indexing, retire the WordPress hosting or keep it offline-only. Keep the media library archive |
