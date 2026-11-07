# Deployment

Two supported targets. Both read the same code and content; only the build command and the form endpoint differ.

## A. Temporary domain (Hostinger managed hosting, static export) — used now

The temporary domain `mediumturquoise-grasshopper-861147.hostingersite.com` runs LiteSpeed + PHP with a fresh WordPress install and no Node runtime, so the site is deployed as a static export next to the WordPress files.

```bash
cp .env.example .env.local        # NEXT_PUBLIC_SITE_URL=https://<temporary-domain>, NEXT_PUBLIC_NOINDEX=1
npm ci
npm run build:static              # -> out/
```

Upload the contents of `out/` to `public_html/`, plus `deploy/staging/api/consultation/index.php` to `public_html/api/consultation/index.php`, and append `deploy/staging/htaccess-staging.txt` to `public_html/.htaccess`. Existing files and directories are served directly, so every exported route wins over WordPress; `wp-admin`, `wp-json` and the Novamira connector keep working.

Automated in this project: `scripts/deploy-staging.sh` zips the export and the staging files; the archive is uploaded through the site's Novamira upload link and extracted with a one-line PHP call (see the deployment log in the final report).

Staging protections: `<meta name="robots" content="noindex,nofollow">` on every page, `X-Robots-Tag: noindex` header, `robots.txt` disallow-all, no sitemap reference, optional basic auth block (commented) in the .htaccess snippet.

## B. Permanent domain on the Hostinger VPS (Node, recommended for production)

Requirements: Ubuntu 22.04/24.04 VPS, Node.js 22 LTS, Nginx, PM2 (or systemd), Certbot, UFW.

```bash
# 1. Server hardening (once)
adduser deploy && usermod -aG sudo deploy
# SSH keys only, disable password + root login in /etc/ssh/sshd_config, then: systemctl restart ssh
ufw allow OpenSSH && ufw allow 'Nginx Full' && ufw enable
apt update && apt install -y nginx certbot python3-certbot-nginx
curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && apt install -y nodejs
npm i -g pm2

# 2. Build (on the server or in CI)
git clone <repo> /var/www/logoaustin && cd /var/www/logoaustin/logoaustin-nextjs
cp .env.example .env.production   # NEXT_PUBLIC_SITE_URL=https://logoaustin.com, NEXT_PUBLIC_NOINDEX=0, SMTP_*, LEAD_EMAIL_TO
npm ci && npm run build
# standalone output: .next/standalone (server.js) + copy static assets
cp -r public .next/standalone/ && cp -r .next/static .next/standalone/.next/

# 3. Run under PM2
cd .next/standalone && PORT=3000 pm2 start server.js --name logoaustin && pm2 save && pm2 startup

# 4. Nginx reverse proxy + HTTPS
# /etc/nginx/sites-available/logoaustin.com  (see deploy/vps/nginx.conf)
ln -s /etc/nginx/sites-available/logoaustin.com /etc/nginx/sites-enabled/ && nginx -t && systemctl reload nginx
certbot --nginx -d logoaustin.com -d www.logoaustin.com
```

`deploy/vps/nginx.conf` enables gzip/brotli, long-lived caching for `/_next/static` and `/images`, HSTS, and proxies everything else to port 3000.

Operations:
- Logs: `pm2 logs logoaustin`; Nginx access/error logs in `/var/log/nginx/`.
- Zero-downtime release: build into a new directory, `pm2 reload logoaustin`. Rollback: point the symlink back and reload.
- Backups: the site is fully reproducible from git + `public/images`; back up `.env.production` and Nginx config. Hostinger VPS snapshots weekly.
- Monitoring: Hostinger uptime monitor or UptimeRobot on `https://logoaustin.com/` and `/sitemap.xml`; Search Console crawl stats.
- Secrets never live in the repo: `.env*` is git-ignored.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin used in metadata, sitemap, schema, Open Graph |
| `NEXT_PUBLIC_NOINDEX` | `1` on staging (noindex + robots disallow + X-Robots-Tag), `0` in production |
| `NEXT_PUBLIC_LOCALES` | `en` now; `en,es` once Spanish content is approved |
| `NEXT_PUBLIC_FORM_ENDPOINT` | Browser form target; `/api/consultation/` for both targets (PHP on static, route handler on Node) |
| `SMTP_HOST/PORT/USER/PASS`, `LEAD_EMAIL_TO`, `LEAD_EMAIL_FROM` | Node form delivery |
| `STATIC_EXPORT` | Build-time switch used by `npm run build:static` |
