import type { AnyDoc, PageDoc, PostDoc } from "@/types/content";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import SmartImage from "@/components/ui/SmartImage";
import Toc from "@/components/blog/Toc";
import JsonLd from "@/components/seo/JsonLd";
import SectionRenderer from "@/components/sections/SectionRenderer";
import Button from "@/components/ui/Button";
import PostCard from "@/components/blog/PostCard";
import { services } from "@/data/services";
import { absoluteUrl, site } from "@/data/site";
import { formatDate } from "@/lib/seo";
import { getAllPages, getAllPosts, isPostDoc, readingTime } from "@/lib/content";
import { blogPostingSchema, breadcrumbSchema, faqSchema, graph, localBusinessSchema, organizationSchema, webPageSchema, websiteSchema } from "@/lib/schema";
import Link from "next/link";
import Icon from "@/components/ui/Icon";

export default function PostTemplate({ doc }: { doc: AnyDoc }) {
  const crumbs = [
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blogs/" },
    { name: doc.title, url: doc.url },
  ];
  const breadcrumbId = `${absoluteUrl(doc.url)}#breadcrumb`;
  const relatedServices = services.filter((s) => s.articles.includes(doc.slug)).slice(0, 3);
  const pages = getAllPages();
  const more = getAllPosts().filter((p) => p.slug !== doc.slug).slice(0, 3);
  const faq = !isPostDoc(doc) ? (doc as PageDoc).faq : [];
  const json = graph([organizationSchema(), localBusinessSchema(), websiteSchema(), webPageSchema(doc, breadcrumbId), breadcrumbSchema(crumbs, breadcrumbId), blogPostingSchema(doc, doc.wordCount), faqSchema(faq, doc.url)]);

  return (
    <article className="post">
      <JsonLd json={json} />
      <header className="post__header">
        <div className="container container--narrow">
          <Breadcrumbs items={crumbs} />
          <h1>{doc.title}</h1>
          <p className="post__meta">
            <span>
              By <Link href="/austin-logo-designers/">{site.name} Design Team</Link>
            </span>
            <span>
              Published <time dateTime={doc.date.slice(0, 10)}>{formatDate(doc.date)}</time>
            </span>
            {doc.modified.slice(0, 10) !== doc.date.slice(0, 10) ? (
              <span>
                Updated <time dateTime={doc.modified.slice(0, 10)}>{formatDate(doc.modified)}</time>
              </span>
            ) : null}
            <span>{readingTime(doc.wordCount)}</span>
          </p>
          {doc.featuredImage ? (
            <figure className="post__hero">
              <SmartImage src={doc.featuredImage.src} alt={doc.featuredImage.alt} width={doc.featuredImage.width} height={doc.featuredImage.height} priority sizes="(max-width: 767px) 92vw, 860px" />
            </figure>
          ) : null}
        </div>
      </header>

      {isPostDoc(doc) ? (
        <div className="container container--narrow post__layout">
          <Toc items={(doc as PostDoc).toc} />
          <div className="prose" dangerouslySetInnerHTML={{ __html: (doc as PostDoc).html }} />
        </div>
      ) : (
        (doc as PageDoc).sections.map((s, i) => <SectionRenderer key={s.id} section={s} index={i} />)
      )}

      <aside className="container container--narrow post__cta" aria-labelledby="post-cta-title">
        <div className="cta-card">
          <div>
            <p className="eyebrow">Work with Austin designers</p>
            <h2 id="post-cta-title">Need this done for your business?</h2>
            <p>Custom logos from ${site.pricing.logoFrom} to ${site.pricing.logoTo}, branding, graphics and websites, with no upfront payment.</p>
            {relatedServices.length ? (
              <ul className="inline-links">
                {relatedServices.map((s) => {
                  const p = pages.find((x) => x.slug === s.slug);
                  return p ? (
                    <li key={s.slug}>
                      <Link href={p.url}>
                        {s.name} <Icon name="arrow-right" size={14} />
                      </Link>
                    </li>
                  ) : null;
                })}
              </ul>
            ) : null}
          </div>
          <div className="btn-group">
            <Button href="#consultation" variant="primary">
              Get a Free Consultation
            </Button>
            <Button href="/portfolio/" variant="ghost">
              See the Portfolio
            </Button>
          </div>
        </div>
      </aside>

      <section className="container post__more" aria-labelledby="more-title">
        <h2 id="more-title">More guides</h2>
        <ul className="post-grid">
          {more.map((p) => (
            <li key={p.slug}>
              <PostCard post={p} />
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
