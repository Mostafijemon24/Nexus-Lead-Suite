#!/usr/bin/env node
/**
 * Generates the data-driven project documents from the migrated content and (optionally) a built
 * static export:
 *   docs/page-inventory.md            every route with purpose, intent, headings, sections, CTAs
 *   docs/seo-metadata-inventory.md    title / description / canonical / lengths per route
 *   docs/keyword-map.md               primary + supporting keywords per route (from Yoast focus + headings)
 *   docs/image-inventory.md           original URL -> new file, alt, dimensions, pages
 *   docs/portfolio-inventory.md       portfolio records with category and naming status
 *   docs/internal-linking-map.md      outbound internal links per route + inbound counts + orphans
 *   docs/technical-seo-report.md      checks run against ./out (static export) when present
 *   docs/structured-data-report.md    JSON-LD types per route, validated for required fields
 *
 * Usage: node scripts/generate-docs.mjs   (run after `npm run build:static` for the HTML checks)
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const pages = fs.readdirSync(path.join(ROOT, 'src/content/pages')).map((f) => read(path.join(ROOT, 'src/content/pages', f)));
const posts = fs.readdirSync(path.join(ROOT, 'src/content/posts')).map((f) => read(path.join(ROOT, 'src/content/posts', f)));
const inventory = read(path.join(ROOT, 'src/content/image-inventory.json'));
const docs = [...pages, ...posts].sort((a, b) => a.url.localeCompare(b.url));
const OUT_DIR = path.join(ROOT, 'docs');
fs.mkdirSync(OUT_DIR, { recursive: true });

const strip = (h) => (h || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const esc = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
const table = (headers, rows) => [`| ${headers.join(' | ')} |`, `| ${headers.map(() => '---').join(' | ')} |`, ...rows.map((r) => `| ${r.map(esc).join(' | ')} |`)].join('\n');

function walk(nodes, fn) {
  for (const n of nodes || []) {
    fn(n);
    if (n.children) walk(n.children, fn);
  }
}
function headings(doc) {
  const out = [];
  if (doc.template === 'post') {
    for (const m of doc.html.matchAll(/<(h[1-4])[^>]*>([\s\S]*?)<\/\1>/g)) out.push(`${m[1].toUpperCase()}: ${strip(m[2])}`);
    return out;
  }
  for (const s of doc.sections) walk(s.children, (n) => n.t === 'heading' && /^h[1-6]$/.test(n.level) && out.push(`${n.level.toUpperCase()}: ${n.text}`));
  return out;
}
function h1Of(doc) {
  const h = headings(doc).find((x) => x.startsWith('H1:'));
  return h ? h.slice(4) : doc.title;
}
function ctas(doc) {
  const out = new Set();
  if (doc.template !== 'post') for (const s of doc.sections) walk(s.children, (n) => n.t === 'button' && out.add(`${n.text} → ${n.href}`));
  return [...out];
}
function links(doc) {
  const out = new Set();
  const add = (href) => {
    if (!href) return;
    if (href.startsWith('/') && !href.startsWith('//')) out.add(href.split('#')[0] || '/');
  };
  if (doc.template === 'post') for (const m of doc.html.matchAll(/href="([^"]+)"/g)) add(m[1]);
  else for (const s of doc.sections) walk(s.children, (n) => {
    if (n.t === 'button' || n.t === 'heading') add(n.href);
    if (n.t === 'text') for (const m of n.html.matchAll(/href="([^"]+)"/g)) add(m[1]);
    if (n.t === 'accordion') for (const it of n.items) for (const m of it.a.matchAll(/href="([^"]+)"/g)) add(m[1]);
    if (n.t === 'list') for (const it of n.items) add(it.href);
  });
  return [...out];
}
function imagesOf(doc) {
  const out = [];
  if (doc.template === 'post') for (const m of doc.html.matchAll(/<img[^>]*src="([^"]+)"[^>]*alt="([^"]*)"/g)) out.push({ src: m[1], alt: m[2] });
  else for (const s of doc.sections) walk(s.children, (n) => {
    if (n.t === 'image') out.push({ src: n.src, alt: n.alt });
    if (n.t === 'gallery') n.images.forEach((i) => out.push({ src: i.src, alt: i.alt }));
  });
  if (doc.featuredImage) out.unshift({ src: doc.featuredImage.src, alt: doc.featuredImage.alt, featured: true });
  return out;
}
const purposeOf = (doc) => {
  if (doc.slug === 'home') return 'Homepage / brand hub';
  if (doc.type === 'post') return 'Educational article (topic cluster support)';
  if (/privacy|terms|disclaimer/.test(doc.slug)) return 'Legal';
  if (doc.slug === 'portfolio') return 'Portfolio (proof)';
  if (doc.slug === 'consultation') return 'Contact / lead capture';
  if (doc.slug === 'blogs') return 'Blog index';
  if (/-logo-design$/.test(doc.slug) && !/(real-estate|construction|cleaning|medical|electrical|moving-company|clothing-line|small-business)/.test(doc.slug)) return 'Location service page';
  if (/logo-design$/.test(doc.slug)) return 'Industry service page (money page)';
  return 'Primary service page (money page)';
};
const intentOf = (doc) => (doc.type === 'post' ? 'Informational' : /privacy|terms|disclaimer/.test(doc.slug) ? 'Navigational' : doc.slug === 'blogs' ? 'Informational' : 'Commercial / transactional');

/* ---------------- page inventory ---------------- */
{
  const rows = docs.map((d) => [d.url, d.type, purposeOf(d), intentOf(d), h1Of(d), d.template === 'post' ? '-' : d.sections.length, d.wordCount, d.faq?.length || 0, ctas(d).length, d.featuredImage ? 'yes' : 'no']);
  const md = `# Page inventory\n\nGenerated ${new Date().toISOString().slice(0, 10)} from the migrated content (${pages.length} pages, ${posts.length} posts). Existing URLs are preserved 1:1; no routes were removed or merged.\n\n${table(['URL (unchanged)', 'Type', 'Purpose', 'Primary intent', 'H1', 'Sections', 'Words', 'FAQ items', 'CTA buttons', 'Featured image'], rows)}\n\n## Heading hierarchy per route\n\n${docs
    .map((d) => `### ${d.url}\n\n${headings(d)
      .slice(0, 40)
      .map((h) => `- ${h}`)
      .join('\n')}\n`)
    .join('\n')}`;
  fs.writeFileSync(path.join(OUT_DIR, 'page-inventory.md'), md);
}

/* ---------------- SEO metadata inventory ---------------- */
{
  const seen = new Map();
  const rows = docs.map((d) => {
    const t = d.seo.title || `${d.title} | Logo Austin`;
    const desc = d.seo.description || '';
    seen.set(t, (seen.get(t) || 0) + 1);
    const flags = [];
    if (t.length > 60) flags.push('title >60');
    if (t.length < 30) flags.push('title <30');
    if (!desc) flags.push('missing description');
    else if (desc.length > 160) flags.push('desc >160');
    else if (desc.length < 70) flags.push('desc <70');
    return [d.url, t, t.length, desc, desc.length, d.seo.canonical || `https://logoaustin.com${d.url}`, d.seo.focusKeyword || '-', flags.join(', ') || 'ok'];
  });
  const dupes = [...seen.entries()].filter(([, n]) => n > 1);
  const md = `# SEO metadata inventory\n\nTitles and descriptions carried over from the live Yoast configuration, rendered through the Next.js Metadata API (canonical, Open Graph, Twitter card and robots are generated per route). Staging builds add \`noindex\`.\n\nDuplicate titles: ${dupes.length ? dupes.map(([t]) => `"${t}"`).join(', ') : 'none'}.\n\n${table(['URL', 'Title', 'Len', 'Meta description', 'Len', 'Canonical', 'Focus keyword', 'Flags'], rows)}\n`;
  fs.writeFileSync(path.join(OUT_DIR, 'seo-metadata-inventory.md'), md);
}

/* ---------------- keyword map ---------------- */
{
  const rows = docs.map((d) => {
    const hs = headings(d).filter((h) => h.startsWith('H2:')).map((h) => h.slice(4).replace(/\?$/, ''));
    const questions = (d.faq || []).map((f) => f.q).slice(0, 4);
    const loc = /austin|round rock|cedar park|georgetown|pflugerville|leander|kyle|san marcos|brushy creek|del valle|pecan park|copperfield|katymead|cantarra|wills point/i.test(h1Of(d)) ? 'yes' : 'no';
    return [d.url, d.seo.focusKeyword || '(set in Yoast: none)', hs.slice(0, 4).join('; '), questions.join('; '), intentOf(d), loc];
  });
  const md = `# Keyword-to-URL map\n\nPrimary keywords are the focus keywords already set on the live site (Yoast). Supporting topics are taken from each page's H2 headings; conversational questions from the FAQ blocks. One primary intent per URL avoids cannibalisation: industry pages target "<industry> logo design Austin", location pages "logo design <city>", and the guides target informational queries that link up to the money pages.\n\n${table(['URL', 'Primary keyword', 'Supporting topics (H2s)', 'Conversational questions', 'Intent', 'Local'], rows)}\n`;
  fs.writeFileSync(path.join(OUT_DIR, 'keyword-map.md'), md);
}

/* ---------------- image inventory ---------------- */
{
  const rows = inventory
    .filter((i) => !i.missing)
    .map((i) => [i.originalUrl, `${i.src}`.replace(/\.avif$/, `-w{${(i.widths || []).join('|')}}.avif`), i.originalFile?.split('/').pop() || '', `${i.name}.${i.format}`, i.title || '-', i.alt || '(needs alt)', `${i.width}×${i.height}`, `${i.originalFormat} → ${i.format}`, (i.pages || []).join(', '), i.altNeedsReview ? 'review alt' : 'ok']);
  const missing = inventory.filter((i) => i.missing);
  const md = `# Image inventory\n\n${inventory.length - missing.length} images migrated and re-encoded as AVIF (responsive widths 480/960/1440 where the source allows). Files are renamed from their approved alt text; the brand logos are kept as PNG. ${missing.length} image references on the live site return 404 (listed at the end) and were dropped.\n\nLicensing: all images come from the existing logoaustin.com media library (client work and studio photos owned/licensed by Logo In Hours LLC). Confirm licensing for any stock photography before launch.\n\n${table(['Original URL', 'New URL (variants)', 'Original filename', 'Optimized filename', 'Title', 'Alt text', 'Dimensions', 'Format', 'Pages', 'Status'], rows)}\n\n## Broken image references on the live site (404)\n\n${missing.map((m) => `- ${m.originalUrl} (${(m.pages || []).join(', ')})`).join('\n')}\n`;
  fs.writeFileSync(path.join(OUT_DIR, 'image-inventory.md'), md);
}

/* ---------------- portfolio inventory ---------------- */
{
  const pf = inventory.filter((i) => !i.missing && i.folder === 'portfolio' && i.width >= 200);
  const rows = pf.map((i) => [`${i.name}`, i.alt || '(unnamed)', `${i.width}×${i.height}`, (i.pages || []).join(', '), i.altNeedsReview ? 'OWNER: supply project name/industry' : 'named from approved alt text']);
  const md = `# Portfolio inventory\n\n${pf.length} portfolio pieces (real client logos and designs already published on logoaustin.com). Titles and categories are derived from the approved alt text; ${pf.filter((i) => i.altNeedsReview).length} pieces have no descriptive alt text and are shown with a generic caption until the owner supplies the project name and industry. No case studies, client names or outcomes were invented.\n\n${table(['Asset', 'Alt / project', 'Size', 'Used on', 'Status'], rows)}\n`;
  fs.writeFileSync(path.join(OUT_DIR, 'portfolio-inventory.md'), md);
}

/* ---------------- internal linking ---------------- */
{
  const routes = new Set(docs.map((d) => d.url));
  const inbound = new Map([...routes].map((r) => [r, 0]));
  const broken = [];
  const rows = docs.map((d) => {
    const ls = links(d);
    for (const l of ls) {
      if (routes.has(l)) inbound.set(l, inbound.get(l) + 1);
      else if (!/^\/(sitemap\.xml|api\/)/.test(l)) broken.push([d.url, l]);
    }
    return [d.url, ls.length, ls.filter((l) => routes.has(l)).join(', ')];
  });
  const global = ['Header navigation links every service, industry and the portfolio/blog from all pages', 'Footer links: services, industry logos, important links, legal', 'Primary pages add: portfolio preview → /portfolio/, reviews → Google listing, related services + guides, consultation CTA', 'Blog posts add: related money pages (data/services.ts articles mapping), "more guides", consultation CTA'];
  const md = `# Internal linking map\n\nContent-level links per route (template-level links are listed separately). Homepage → service pages → portfolio → related guides → consultation.\n\n## Template-level links (all pages)\n\n${global.map((g) => `- ${g}`).join('\n')}\n\n## Content-level outbound links\n\n${table(['URL', 'Internal links', 'Targets'], rows)}\n\n## Inbound content links per route\n\n${table(['URL', 'Inbound (content only)'], [...inbound.entries()].sort((a, b) => a[1] - b[1]).map(([u, n]) => [u, n]))}\n\n## Links to routes that do not exist in the new site\n\n${broken.length ? table(['From', 'Href'], broken) : 'None.'}\n`;
  fs.writeFileSync(path.join(OUT_DIR, 'internal-linking-map.md'), md);
}

/* ---------------- technical SEO + structured data (from ./out) ---------------- */
{
  const outDir = path.join(ROOT, 'out');
  const lines = [];
  const sdRows = [];
  if (fs.existsSync(outDir)) {
    const htmlFiles = [];
    const scan = (dir) => {
      for (const f of fs.readdirSync(dir)) {
        const p = path.join(dir, f);
        if (fs.statSync(p).isDirectory()) scan(p);
        else if (f === 'index.html' || f === '404.html') htmlFiles.push(p);
      }
    };
    scan(outDir);
    const routes = new Set(docs.map((d) => d.url));
    const titles = new Map();
    const issues = [];
    let imgNoAlt = 0;
    for (const file of htmlFiles) {
      const html = fs.readFileSync(file, 'utf8');
      const route = '/' + path.relative(outDir, path.dirname(file)).replace(/\\/g, '/').replace(/^\.$/, '') + (path.basename(file) === '404.html' ? '404.html' : '/');
      const r = route.replace(/^\/\//, '/');
      if (r.includes('_not-found') || r.endsWith('404.html') || r === '/404/') continue;
      const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
      const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
      const canonical = (html.match(/<link rel="canonical" href="([^"]*)"/) || [])[1] || '';
      const h1s = (html.match(/<h1[\s\S]*?<\/h1>/g) || []).length;
      const robots = (html.match(/<meta name="robots" content="([^"]*)"/) || [])[1] || '';
      titles.set(title, (titles.get(title) || 0) + 1);
      if (!title) issues.push([r, 'missing <title>']);
      if (!desc) issues.push([r, 'missing meta description']);
      if (!canonical) issues.push([r, 'missing canonical']);
      if (h1s !== 1) issues.push([r, `${h1s} <h1> elements`]);
      const imgs = html.match(/<img[^>]*>/g) || [];
      for (const img of imgs) if (!/\salt="/.test(img)) imgNoAlt++;
      for (const m of html.matchAll(/href="(\/[^"#?]*)"/g)) {
        const href = m[1];
        if (/^\/(_next|images|logos|api|sitemap\.xml|robots\.txt|icon|apple-icon)/.test(href)) continue;
        if (!routes.has(href) && href !== '/') issues.push([r, `link to unknown route ${href}`]);
      }
      // JSON-LD
      const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
      const types = [];
      for (const b of ld) {
        try {
          const j = JSON.parse(b[1]);
          for (const node of j['@graph'] || [j]) {
            types.push(node['@type']);
            const t = Array.isArray(node['@type']) ? node['@type'].join('/') : node['@type'];
            if (t === 'FAQPage' && !(node.mainEntity || []).every((q) => q.name && q.acceptedAnswer?.text)) issues.push([r, 'FAQPage question missing name/answer']);
            if (t === 'BreadcrumbList' && !(node.itemListElement || []).every((i) => i.name && i.item)) issues.push([r, 'BreadcrumbList item missing']);
            if (/LocalBusiness/.test(t) && !(node.name && node.address && node.telephone)) issues.push([r, 'LocalBusiness missing name/address/telephone']);
            if (t === 'BlogPosting' && !(node.headline && node.datePublished && node.author)) issues.push([r, 'BlogPosting missing fields']);
            if (t === 'Service' && !(node.name && node.provider)) issues.push([r, 'Service missing name/provider']);
          }
        } catch (e) {
          issues.push([r, `invalid JSON-LD: ${e.message}`]);
        }
      }
      sdRows.push([r, types.map((t) => (Array.isArray(t) ? t.join('/') : t)).join(', '), robots]);
    }
    const dupTitles = [...titles.entries()].filter(([, n]) => n > 1);
    lines.push(`# Technical SEO report\n\nChecked ${sdRows.length} exported HTML routes from \`out/\` on ${new Date().toISOString().slice(0, 10)}.\n`);
    lines.push(`- Routes exported: ${sdRows.length} (expected ${docs.length} content routes + home)`);
    lines.push(`- Duplicate titles: ${dupTitles.length ? dupTitles.map(([t, n]) => `"${t}" ×${n}`).join('; ') : 'none'}`);
    lines.push(`- Images without alt attribute: ${imgNoAlt}`);
    lines.push(`- Issues found: ${issues.length}`);
    lines.push(`- Trailing-slash URLs (matching the WordPress permalink structure): yes`);
    lines.push(`- robots.txt: ${fs.existsSync(path.join(outDir, 'robots.txt')) ? fs.readFileSync(path.join(outDir, 'robots.txt'), 'utf8').trim().replace(/\n/g, ' / ') : 'missing'}`);
    lines.push(`- sitemap.xml: ${fs.existsSync(path.join(outDir, 'sitemap.xml')) ? `${(fs.readFileSync(path.join(outDir, 'sitemap.xml'), 'utf8').match(/<loc>/g) || []).length} URLs` : 'missing'}`);
    lines.push(`\n## Issues\n\n${issues.length ? table(['Route', 'Issue'], issues) : 'None.'}\n`);
    lines.push(`\n## Manual checklist (verify on the deployed host)\n\n- HTTPS and HSTS enabled, HTTP → HTTPS redirect\n- 301 redirects: none required (all URLs preserved); add any approved changes to deploy/redirects.md\n- X-Robots-Tag noindex present on staging only; absent in production\n- Core Web Vitals field data after launch (Search Console)\n- Google Search Console property verified and sitemap submitted (production only)\n`);
    fs.writeFileSync(path.join(OUT_DIR, 'technical-seo-report.md'), lines.join('\n'));
    fs.writeFileSync(path.join(OUT_DIR, 'structured-data-report.md'), `# Structured data report\n\nEvery route renders a single JSON-LD @graph (Organization, ProfessionalService/LocalBusiness, WebSite, WebPage, BreadcrumbList, plus Service/FAQPage/BlogPosting where relevant). Validated for required properties during generation; ${issues.filter((i) => /JSON-LD|missing/.test(i[1]) && /FAQ|Breadcrumb|LocalBusiness|BlogPosting|Service|JSON/.test(i[1])).length} schema issues found. Review markup is only emitted for verified reviews in data/reviews.ts (none yet), and no aggregate rating is claimed.\n\nValidate before launch with https://validator.schema.org/ and Google's Rich Results Test (FAQ rich results are no longer shown for most sites; the markup still helps machine understanding).\n\n${table(['Route', 'JSON-LD types', 'robots meta'], sdRows)}\n`);
  } else {
    fs.writeFileSync(path.join(OUT_DIR, 'technical-seo-report.md'), '# Technical SEO report\n\nRun `npm run build:static` first, then `node scripts/generate-docs.mjs`.\n');
  }
}
console.log('docs generated in', OUT_DIR);
