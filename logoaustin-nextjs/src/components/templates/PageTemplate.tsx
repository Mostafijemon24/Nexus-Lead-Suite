import type { PageDoc, Section } from "@/types/content";
import SectionRenderer from "@/components/sections/SectionRenderer";
import Breadcrumbs, { type Crumb } from "@/components/layout/Breadcrumbs";
import ReviewsSection from "@/components/reviews/ReviewsSection";
import PortfolioPreview from "@/components/portfolio/PortfolioPreview";
import RelatedServices from "@/components/sections/RelatedServices";
import JsonLd from "@/components/seo/JsonLd";
import OnThisPage from "@/components/sections/OnThisPage";
import FullPortfolio from "@/components/portfolio/FullPortfolio";
import { getService, isLocationPage, isPrimaryPage } from "@/data/services";
import { absoluteUrl } from "@/data/site";
import { breadcrumbSchema, faqSchema, graph, localBusinessSchema, organizationSchema, serviceSchema, webPageSchema, websiteSchema, reviewSchemas } from "@/lib/schema";

export function crumbsFor(doc: PageDoc): Crumb[] {
  const crumbs: Crumb[] = [{ name: "Home", url: "/" }];
  if (isLocationPage(doc.slug)) crumbs.push({ name: "Austin Logo Designers", url: "/austin-logo-designers/" });
  else if (getService(doc.slug)?.category === "industry") crumbs.push({ name: "Industry Logos", url: "/small-business-logo-design/" });
  crumbs.push({ name: doc.title, url: doc.url });
  return crumbs;
}

export default function PageTemplate({ doc }: { doc: PageDoc }) {
  const crumbs = crumbsFor(doc);
  const breadcrumbId = `${absoluteUrl(doc.url)}#breadcrumb`;
  const primary = isPrimaryPage(doc.slug);
  const svc = getService(doc.slug);
  const sections = doc.sections;
  const lastIsCta = sections.length > 1 && sections[sections.length - 1].variant === "cta";
  const bodySections = lastIsCta ? sections.slice(0, -1) : sections;
  const ctaSection = lastIsCta ? sections[sections.length - 1] : null;
  const hasGallery = sections.some((s) => s.variant === "gallery" || JSON.stringify(s.children).includes('"t":"gallery"'));
  const hero = sections[0]?.variant === "hero" ? sections[0] : null;
  // Portfolio page: the legacy image-row section (index 2) is replaced by the categorised FullPortfolio grid.
  const isPortfolio = doc.slug === "portfolio";
  const rest = (hero ? bodySections.slice(1) : bodySections).filter((s) => !(isPortfolio && s.variant === "split"));
  const showToc = primary && doc.wordCount > 1200;

  const json = graph([
    organizationSchema(),
    localBusinessSchema(),
    websiteSchema(),
    webPageSchema(doc, breadcrumbId),
    breadcrumbSchema(crumbs, breadcrumbId),
    serviceSchema(doc),
    faqSchema(doc.faq, doc.url),
    ...reviewSchemas(),
  ]);

  return (
    <>
      <JsonLd json={json} />
      {hero ? (
        <div className="hero-wrap">
          <div className="container">
            <Breadcrumbs items={crumbs} light />
          </div>
          <SectionRenderer section={hero} index={0} />
        </div>
      ) : (
        <div className="container">
          <Breadcrumbs items={crumbs} />
        </div>
      )}
      {showToc ? <OnThisPage sections={rest} /> : null}
      {rest.map((s: Section, i: number) => (
        <div key={s.id} className="contents">
          <SectionRenderer section={s} index={i + 1} />
          {isPortfolio && i === 0 ? <FullPortfolio /> : null}
        </div>
      ))}
      {primary && !hasGallery && svc ? <PortfolioPreview tags={svc.portfolioTags} /> : null}
      {primary && !svc ? <PortfolioPreview tags={["logo"]} title="Logos Designed for Central Texas Businesses" /> : null}
      {primary || doc.slug === "portfolio" || doc.slug === "consultation" ? <ReviewsSection context={svc?.name.toLowerCase()} /> : null}
      {svc ? <RelatedServices slug={doc.slug} /> : null}
      {ctaSection ? <SectionRenderer section={ctaSection} index={sections.length} /> : null}
    </>
  );
}
