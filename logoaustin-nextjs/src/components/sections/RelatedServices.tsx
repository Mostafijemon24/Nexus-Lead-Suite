import Link from "next/link";
import { getService } from "@/data/services";
import { getAllPages, getAllPosts } from "@/lib/content";
import Icon from "@/components/ui/Icon";

/** Contextual internal links: related services + supporting articles for a money page. */
export default function RelatedServices({ slug }: { slug: string }) {
  const svc = getService(slug);
  if (!svc) return null;
  const pages = getAllPages();
  const posts = getAllPosts();
  const related = svc.related.map((s) => pages.find((p) => p.slug === s)).filter(Boolean);
  const articles = svc.articles.map((s) => posts.find((p) => p.slug === s)).filter(Boolean);
  if (!related.length && !articles.length) return null;
  return (
    <section className="sec sec--related bg-soft" aria-labelledby="related-title">
      <div className="container">
        <div className="related-grid">
          {related.length ? (
            <div>
              <p className="eyebrow">Related services</p>
              <h2 id="related-title">Explore More Design Services in Austin</h2>
              <ul className="link-cards">
                {related.map((p) => (
                  <li key={p!.slug}>
                    <Link href={p!.url}>
                      <span>{p!.title}</span>
                      <Icon name="arrow-right" size={16} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {articles.length ? (
            <div>
              <p className="eyebrow">Guides</p>
              <h2>Helpful Reading Before You Start</h2>
              <ul className="link-cards">
                {articles.map((p) => (
                  <li key={p!.slug}>
                    <Link href={p!.url}>
                      <span>{p!.title}</span>
                      <Icon name="arrow-right" size={16} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
