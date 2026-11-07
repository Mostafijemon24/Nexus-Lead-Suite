#!/usr/bin/env node
/**
 * Content migration: Elementor/WordPress export -> normalized content JSON + optimized images.
 *
 * Usage:
 *   node scripts/convert-elementor.mjs --export <elementor-export.json> --posts <posts.json> \
 *        --media <downloaded uploads dir> --media-tsv <media.tsv> --out <project root>
 *
 * Produces:
 *   src/content/pages/<slug>.json      normalized block tree per Elementor page
 *   src/content/posts/<slug>.json      blog posts (rendered HTML, TOC, meta)
 *   src/content/image-inventory.json   original URL -> optimized asset + alt/dimensions
 *   public/images/**                   optimized AVIF variants (480/960/1440 widths)
 *   public/logos/**                    brand logos (PNG preserved)
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, arr) => {
    if (a.startsWith('--')) acc.push([a.slice(2), arr[i + 1]]);
    return acc;
  }, [])
);
const EXPORT = args.export;
const POSTS = args.posts;
const MEDIA = args.media;
const MEDIA_TSV = args['media-tsv'];
const OUT = args.out || process.cwd();
const UPLOADS = 'https://logoaustin.com/wp-content/uploads/';
const HOME = 'https://logoaustin.com';
const WIDTHS = [480, 960, 1440];
const GENERIC_ALTS = new Set(
  [
    'logo design austin',
    'custom logo design austin',
    'logo designer austin',
    'austin logo design',
    'logodesignerusa',
    'top logo designer near me',
    'logo designer near me',
    'austin logos',
    'logo design austin logo',
    '',
  ].map((s) => s.toLowerCase())
);

const pages = JSON.parse(fs.readFileSync(EXPORT, 'utf8'));
const posts = JSON.parse(fs.readFileSync(POSTS, 'utf8'));
const mediaAlt = new Map();
if (MEDIA_TSV && fs.existsSync(MEDIA_TSV)) {
  for (const line of fs.readFileSync(MEDIA_TSV, 'utf8').split('\n')) {
    const [id, mime, rel, dims, kb, parent, alt, title] = line.split('\t');
    if (rel) mediaAlt.set(rel, { alt: alt || '', title: title || '', id });
  }
}

/* ---------------------------------- utils ---------------------------------- */
const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/&amp;/g, ' and ')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72)
    .replace(/-[^-]*$/, (m, off, str) => (str.length >= 72 ? '' : m))
    .replace(/-+$/g, '');
const stripTags = (h) => (h || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const decode = (s) =>
  (s || '')
    .replace(/&amp;/g, '&')
    .replace(/&#8217;|&rsquo;/g, '’')
    .replace(/&#8216;|&lsquo;/g, '‘')
    .replace(/&#8220;|&ldquo;/g, '“')
    .replace(/&#8221;|&rdquo;/g, '”')
    .replace(/&#8211;|&ndash;/g, '–')
    .replace(/&#8212;|&mdash;/g, '—')
    .replace(/&#038;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&rsaquo;/g, '›')
    .replace(/&hellip;/g, '…')
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

function normalizeHref(url) {
  if (!url) return '';
  if (url.startsWith('#elementor-action')) return '#consultation';
  if (url.startsWith(HOME)) url = url.slice(HOME.length) || '/';
  if (url.startsWith('/') && !url.startsWith('//')) {
    const [p, hash] = url.split('#');
    let np = p;
    if (!np.endsWith('/') && !/\.[a-z0-9]+$/i.test(np)) np += '/';
    return hash ? `${np}#${hash}` : np;
  }
  return url;
}

function cleanHtml(html) {
  if (!html) return '';
  let h = html;
  h = h.replace(/<\/?span[^>]*>/g, '');
  h = h.replace(/\sstyle="[^"]*"/g, '');
  h = h.replace(/\sclass="[^"]*"/g, '');
  h = h.replace(/<script[\s\S]*?<\/script>/g, '');
  h = h.replace(/href="([^"]+)"/g, (m, u) => `href="${normalizeHref(decode(u))}"`);
  h = h.replace(/<p>\s*(&nbsp;)?\s*<\/p>/g, '');
  return h.trim();
}

/* ------------------------------ image handling ------------------------------ */
const inventory = new Map(); // originalUrl -> record
const usedNames = new Set();

function localPathFor(url) {
  const rel = url.replace(UPLOADS, '');
  const direct = path.join(MEDIA, rel);
  if (fs.existsSync(direct) && isImage(direct)) return { file: direct, rel };
  // strip -WxH suffix
  const m = rel.match(/^(.*)-\d+x\d+(\.[a-z]+)$/i);
  if (m) {
    const orig = path.join(MEDIA, m[1] + m[2]);
    if (fs.existsSync(orig) && isImage(orig)) return { file: orig, rel: m[1] + m[2] };
  }
  return null;
}
function isImage(file) {
  try {
    const fd = fs.openSync(file, 'r');
    const b = Buffer.alloc(16);
    fs.readSync(fd, b, 0, 16, 0);
    fs.closeSync(fd);
    const head = b.toString('latin1');
    return !/^\s*<|^<!DOCTYPE|^<html/i.test(head) && b.length > 0;
  } catch {
    return false;
  }
}

function decideName(rel, alt, folder) {
  const base = path.basename(rel).replace(/\.[a-z]+$/i, '').replace(/-\d+x\d+$/, '');
  let name;
  if (alt && !GENERIC_ALTS.has(alt.toLowerCase())) {
    name = slugify(alt);
  } else {
    name = slugify(base);
  }
  if (folder === 'portfolio' && !/logo/.test(name)) name = `${name}-logo`;
  let candidate = name;
  let i = 2;
  while (usedNames.has(`${folder}/${candidate}`)) candidate = `${name}-${i++}`;
  usedNames.add(`${folder}/${candidate}`);
  return candidate;
}

async function registerImage(url, { alt = '', page = '', context = 'content', title = '' } = {}) {
  url = decode(url).split('?')[0];
  if (!url.startsWith(UPLOADS)) return null;
  const relKey = url.replace(UPLOADS, '').replace(/-\d+x\d+(\.[a-z]+)$/i, '$1');
  const libAlt = mediaAlt.get(relKey)?.alt || '';
  const chosenAlt = alt && !GENERIC_ALTS.has(alt.toLowerCase()) ? alt : libAlt && !GENERIC_ALTS.has(libAlt.toLowerCase()) ? libAlt : alt || libAlt;
  if (inventory.has(url)) {
    const r = inventory.get(url);
    if (!r.pages.includes(page) && page) r.pages.push(page);
    if (!r.alt && chosenAlt) r.alt = chosenAlt;
    return r;
  }
  const loc = localPathFor(url);
  if (!loc) {
    const r = { originalUrl: url, missing: true, alt: chosenAlt, pages: page ? [page] : [], context };
    inventory.set(url, r);
    return r;
  }
  let meta;
  try {
    meta = await sharp(loc.file).metadata();
  } catch (e) {
    const r = { originalUrl: url, missing: true, error: String(e.message), alt: chosenAlt, pages: page ? [page] : [], context };
    inventory.set(url, r);
    return r;
  }
  const isLogoAsset = /2023\/06\/logo-design-Austin|cropped-logo-design-austin-1/.test(url);
  const folder = isLogoAsset ? 'logos' : context === 'portfolio' ? 'portfolio' : context === 'post' ? 'blog' : 'pages';
  const name = decideName(loc.rel, chosenAlt, folder);
  const record = {
    originalUrl: url,
    originalFile: loc.rel,
    originalFormat: meta.format,
    width: meta.width,
    height: meta.height,
    alt: chosenAlt,
    altNeedsReview: !chosenAlt || GENERIC_ALTS.has(chosenAlt.toLowerCase()),
    title: title || mediaAlt.get(relKey)?.title || '',
    context,
    pages: page ? [page] : [],
    folder,
    name,
    src: '',
    widths: [],
    format: 'avif',
  };
  if (isLogoAsset) {
    const ext = meta.format === 'png' ? 'png' : meta.format === 'jpeg' ? 'jpg' : meta.format;
    const dest = path.join(OUT, 'public', 'logos', `${name}.${ext}`);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(loc.file, dest);
    record.src = `/logos/${name}.${ext}`;
    record.format = ext;
  } else {
    const destDir = path.join(OUT, 'public', 'images', folder);
    fs.mkdirSync(destDir, { recursive: true });
    const widths = WIDTHS.filter((w) => w < meta.width);
    widths.push(Math.min(meta.width, 1600));
    record.widths = [...new Set(widths)].sort((a, b) => a - b);
    for (const w of record.widths) {
      const dest = path.join(destDir, `${name}-w${w}.avif`);
      if (!fs.existsSync(dest)) {
        await sharp(loc.file)
          .rotate()
          .resize({ width: w, withoutEnlargement: true })
          .avif({ quality: 62, effort: 3 })
          .toFile(dest);
      }
    }
    record.src = `/images/${folder}/${name}.avif`; // logical src; loader maps width
    record.width = Math.min(meta.width, 1600);
    record.height = Math.round((meta.height * record.width) / meta.width);
  }
  inventory.set(url, record);
  return record;
}

/* --------------------------- Elementor normalization --------------------------- */
const sizeVal = (v) => (v && typeof v === 'object' && 'size' in v ? v.size : v);

async function convertNode(el, ctx) {
  const s = el.settings || {};
  const type = el.widgetType || el.elType;
  const classes = (s.css_classes || '').split(/\s+/).filter(Boolean);
  switch (type) {
    case 'container': {
      const children = [];
      for (const c of el.elements || []) {
        const n = await convertNode(c, ctx);
        if (n) children.push(n);
      }
      const node = {
        t: 'container',
        classes,
        dir: s.flex_direction || 'column',
        wrap: s.flex_wrap === 'wrap',
        width: sizeVal(s.width),
        widthTablet: sizeVal(s.width_tablet),
        widthMobile: sizeVal(s.width_mobile),
        boxed: s.content_width !== 'full',
        bg: s.background_color || undefined,
        align: s.flex_align_items || undefined,
        justify: s.flex_justify_content || undefined,
        children,
      };
      Object.keys(node).forEach((k) => node[k] === undefined && delete node[k]);
      return node;
    }
    case 'heading': {
      const link = s.link?.url ? normalizeHref(decode(s.link.url)) : undefined;
      return { t: 'heading', level: s.header_size || 'h2', text: decode(stripTags(s.title)), ...(link ? { href: link } : {}), ...(s.align ? { align: s.align } : {}), classes };
    }
    case 'text-editor':
      return { t: 'text', html: cleanHtml(decode(s.editor)), ...(s.align ? { align: s.align } : {}), classes };
    case 'icon-list':
      return {
        t: 'list',
        items: (s.icon_list || []).map((i) => ({ text: decode(stripTags(i.text)), icon: i.selected_icon?.value || '', ...(i.link?.url ? { href: normalizeHref(decode(i.link.url)) } : {}) })),
        classes,
      };
    case 'button': {
      const href = normalizeHref(decode(s.link?.url || ''));
      const bg = (s.background_color || '').toLowerCase().replace(/\s/g, '');
      const transparent = /rgba\(0,0,0,0\)|rgba\(255,255,255,0\)/.test(bg) || bg === '';
      const icon = s.selected_icon?.value || '';
      const style = transparent ? (/arrow/.test(icon) ? 'link' : 'ghost') : 'primary';
      return { t: 'button', text: decode(stripTags(s.text)), href, style, ...(icon ? { icon } : {}), classes };
    }
    case 'image': {
      const url = s.image?.url;
      if (!url) return null;
      const rec = await registerImage(url, { alt: s.image?.alt || '', page: ctx.slug, context: ctx.imageContext || 'content' });
      if (!rec || rec.missing) return null;
      const href = s.link_to === 'custom' && s.link?.url ? normalizeHref(decode(s.link.url)) : undefined;
      return { t: 'image', src: rec.src, alt: rec.alt, width: rec.width, height: rec.height, ...(href ? { href } : {}), ...(s.width?.size ? { displayWidth: s.width.size } : {}), classes };
    }
    case 'icon':
      return { t: 'icon', icon: s.selected_icon?.value || '', classes };
    case 'icon-box':
      return { t: 'iconBox', icon: s.selected_icon?.value || '', title: decode(stripTags(s.title_text)), desc: decode(stripTags(s.description_text)), classes };
    case 'accordion':
      return {
        t: 'accordion',
        items: (s.tabs || []).map((tab) => ({ q: decode(stripTags(tab.tab_title)), a: cleanHtml(decode(tab.tab_content)) })),
        classes,
      };
    case 'image-gallery': {
      const images = [];
      for (const g of s.wp_gallery || []) {
        const rec = await registerImage(g.url, { page: ctx.slug, context: 'portfolio' });
        if (rec && !rec.missing) images.push({ src: rec.src, alt: rec.alt || 'Custom logo designed by Logo Austin', width: rec.width, height: rec.height });
      }
      return { t: 'gallery', images, cols: Number(s.gallery_columns || 4), classes };
    }
    case 'html': {
      const html = s.html || '';
      const badge = html.match(/<div class="lda-badge"><strong>(.*?)<\/strong><span>(.*?)<\/span><\/div>/);
      if (badge) return { t: 'badge', strong: decode(stripTags(badge[1])), text: decode(stripTags(badge[2])), classes };
      if (/<iframe[^>]+google\.com\/maps/.test(html)) return { t: 'map', classes };
      if (/wvh-lang|lih-cf-css|<style/.test(html)) return null; // presentation-only HTML widgets are rebuilt as components
      const text = decode(stripTags(html));
      return text ? { t: 'text', html: cleanHtml(decode(html)), classes } : null;
    }
    case 'form':
      return {
        t: 'form',
        name: s.form_name || 'Consultation',
        fields: (s.form_fields || []).map((f) => ({ id: f.custom_id, type: f.field_type, label: decode(f.field_label || ''), placeholder: decode(f.placeholder || ''), required: f.required === 'true', width: Number(f.width || 100), options: f.field_options ? decode(f.field_options).split('\n') : undefined })),
        button: decode(s.button_text || 'Send'),
        success: decode(s.success_message || ''),
        classes,
      };
    case 'posts':
      return { t: 'posts', classes };
    case 'divider':
      return { t: 'divider', classes };
    case 'slides':
      // Placeholder lorem-ipsum testimonial slider on the live site: dropped (never fabricate testimonials).
      ctx.dropped.push('slides (lorem ipsum testimonial slider)');
      return null;
    default:
      ctx.dropped.push(type);
      return null;
  }
}

function detectVariant(section) {
  const cls = section.classes;
  const has = (c) => cls.includes(c);
  if (has('lda-hero') || has('la-hero')) return 'hero';
  if (has('lda-trust') || has('la-facts')) return 'trust';
  if (has('la-cards')) return 'cards';
  if (has('la-split')) return 'split';
  if (has('la-steps')) return 'steps';
  if (has('la-faq')) return 'faq';
  if (has('lda-cta') || has('la-cta')) return 'cta';
  if (has('la-table')) return 'table';
  if (has('la-blogs')) return 'blogIndex';
  if (has('la-post-top')) return 'postTop';
  if (has('la-post-bottom')) return 'postBottom';
  if (has('lih-cf')) return 'consultationForm';
  if (has('la-text')) return 'text';
  // infer from content
  const types = [];
  const walk = (n) => {
    types.push(n.t);
    (n.children || []).forEach(walk);
    if (n.classes?.length) types.push(...n.classes.map((c) => `.${c}`));
  };
  walk(section);
  if (types.includes('accordion')) return 'faq';
  if (types.includes('gallery')) return 'gallery';
  if (types.includes('form')) return 'formSection';
  if (types.includes('.lda-card')) return 'cards';
  if (types.includes('iconBox')) return 'trust';
  if (types.includes('image') && types.includes('heading')) return 'split';
  if (types.filter((t) => t === 'image').length >= 4) return 'gallery';
  return 'generic';
}

function detectBg(section) {
  const cls = section.classes;
  if (cls.includes('lda-bg-ink') || cls.includes('la-dark')) return 'ink';
  if (cls.includes('lda-bg-cream')) return 'cream';
  if (cls.includes('lda-bg-soft')) return 'soft';
  return 'white';
}

function collectFaq(section) {
  const items = [];
  const walk = (n, parent) => {
    if (n.t === 'accordion') items.push(...n.items);
    if (n.t === 'container' && n.classes?.includes('la-faq')) {
      // h3 followed by text
      const kids = n.children || [];
      for (let i = 0; i < kids.length; i++) {
        if (kids[i].t === 'heading' && kids[i].level === 'h3' && kids[i + 1]?.t === 'text') items.push({ q: kids[i].text, a: kids[i + 1].html });
      }
    }
    (n.children || []).forEach((c) => walk(c, n));
  };
  walk(section);
  return items;
}

function wordCount(sections) {
  let text = '';
  const walk = (n) => {
    if (n.t === 'heading') text += ' ' + n.text;
    if (n.t === 'text') text += ' ' + stripTags(n.html);
    if (n.t === 'list') text += ' ' + n.items.map((i) => i.text).join(' ');
    if (n.t === 'iconBox') text += ` ${n.title} ${n.desc}`;
    if (n.t === 'accordion') text += ' ' + n.items.map((i) => `${i.q} ${stripTags(i.a)}`).join(' ');
    (n.children || []).forEach(walk);
  };
  sections.forEach(walk);
  return text.split(/\s+/).filter(Boolean).length;
}

/* ------------------------------------ main ------------------------------------ */
const outPages = path.join(OUT, 'src', 'content', 'pages');
const outPosts = path.join(OUT, 'src', 'content', 'posts');
fs.mkdirSync(outPages, { recursive: true });
fs.mkdirSync(outPosts, { recursive: true });

const report = { pages: [], posts: [], dropped: {} };
const postsById = new Map(posts.map((p) => [p.id, p]));

for (const p of pages) {
  const slug = p.slug === 'home' ? 'home' : p.slug;
  const url = slug === 'home' ? '/' : `/${slug}/`;
  const ctx = { slug, dropped: [], imageContext: slug === 'portfolio' ? 'portfolio' : 'content' };
  const meta = {
    id: p.id,
    type: p.type,
    slug,
    url,
    title: decode(p.title),
    seo: {
      title: decode((p.yoast.title || '').replace(/%%sep%%/g, '|').replace(/%%sitename%%/g, 'Logo Austin').replace(/%%page%%/g, '').trim()),
      description: decode(p.yoast.desc || ''),
      focusKeyword: p.yoast.focus || '',
      canonical: p.yoast.canonical || '',
    },
    featuredImage: null,
    date: p.date,
    modified: p.modified,
  };
  if (p.thumb) {
    const rec = await registerImage(p.thumb, { page: slug, context: p.type === 'post' ? 'post' : 'content' });
    if (rec && !rec.missing) meta.featuredImage = { src: rec.src, alt: rec.alt, width: rec.width, height: rec.height };
  }
  if (p.elementor) {
    const sections = [];
    for (const e of p.elementor) {
      const node = await convertNode(e, ctx);
      if (!node) continue;
      const section = { id: e.id, classes: node.classes, bg: 'white', variant: 'generic', children: node.children };
      section.variant = detectVariant(section);
      section.bg = detectBg(section);
      if (section.variant === 'generic' && node.bg && /#333|#0f1b2d|#24262b/i.test(node.bg)) section.bg = 'ink';
      // Drop the placeholder lorem-ipsum form section on the portfolio page
      const txt = JSON.stringify(section.children);
      if (/Veniam nostrum|Lorem insum|Clean catering Layout/i.test(txt)) {
        ctx.dropped.push('lorem ipsum placeholder section');
        continue;
      }
      sections.push(section);
    }
    const faq = sections.flatMap(collectFaq);
    const doc = { ...meta, template: p.elementor.some((e) => (e.settings?.css_classes || '').includes('lda-')) ? 'lda' : 'la', sections, faq, wordCount: wordCount(sections) };
    fs.writeFileSync(path.join(p.type === 'post' ? outPosts : outPages, `${slug}.json`), JSON.stringify(doc, null, 1));
    report.pages.push({ slug, url, type: p.type, sections: sections.length, words: doc.wordCount, faq: faq.length, dropped: ctx.dropped });
  } else {
    // Classic post: use REST rendered HTML
    const rest = postsById.get(p.id);
    let html = rest?.content?.rendered || p.content || '';
    html = html.replace(/<script[\s\S]*?<\/script>/g, '');
    // rewrite images
    const imgs = [...html.matchAll(/<img[^>]*src="([^"]+)"[^>]*>/g)];
    for (const m of imgs) {
      const altM = m[0].match(/alt="([^"]*)"/);
      const rec = await registerImage(m[1], { alt: altM ? decode(altM[1]) : '', page: slug, context: 'post' });
      if (rec && !rec.missing) html = html.replace(m[0], `<img src="${rec.src}" alt="${rec.alt.replace(/"/g, '&quot;')}" width="${rec.width}" height="${rec.height}" loading="lazy" decoding="async" />`);
    }
    html = html.replace(/href="([^"]+)"/g, (m, u) => `href="${normalizeHref(decode(u))}"`);
    html = html.replace(/\sstyle="[^"]*"/g, '').replace(/\sclass="[^"]*"/g, '');
    // keep a logical heading outline (some posts jump from h2 to h5)
    html = html.replace(/<(\/?)h[456]\b/g, '<$1h3');
    // headings -> ids + toc
    const toc = [];
    html = html.replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/g, (m, attrs, inner) => {
      const text = decode(stripTags(inner));
      const id = slugify(text);
      toc.push({ id, text });
      return `<h2 id="${id}">${inner}</h2>`;
    });
    const cats = (p.yoast && []) || [];
    const doc = { ...meta, template: 'post', html, toc, excerpt: decode(stripTags(rest?.excerpt?.rendered || '')).replace(/\s*\[&hellip;\]|\s*\[…\]/g, '…'), wordCount: stripTags(html).split(/\s+/).filter(Boolean).length };
    fs.writeFileSync(path.join(outPosts, `${slug}.json`), JSON.stringify(doc, null, 1));
    report.posts.push({ slug, url, words: doc.wordCount, h2: toc.length });
  }
}

// brand assets
for (const u of ['2023/06/logo-design-Austin-light.png', '2023/06/logo-design-Austin.png', '2022/01/cropped-logo-design-austin-1.avif']) {
  await registerImage(UPLOADS + u, { alt: 'Logo Design Austin', page: 'global', context: 'logo' });
}

const inv = [...inventory.values()].sort((a, b) => (a.src || '').localeCompare(b.src || ''));
fs.writeFileSync(path.join(OUT, 'src', 'content', 'image-inventory.json'), JSON.stringify(inv, null, 1));
fs.writeFileSync(path.join(OUT, 'src', 'content', 'migration-report.json'), JSON.stringify(report, null, 1));
const widthMap = Object.fromEntries(inv.filter((i) => i.src && i.widths?.length).map((i) => [i.src, i.widths]));
fs.writeFileSync(path.join(OUT, 'src', 'content', 'image-widths.json'), JSON.stringify(widthMap));
console.log(`pages: ${report.pages.length}, posts: ${report.posts.length}, images: ${inv.length} (missing: ${inv.filter((i) => i.missing).length})`);
for (const r of report.pages) if (r.dropped.length) console.log(' dropped on', r.slug, ':', [...new Set(r.dropped)].join(', '));
