import type { Metadata } from "next";
import { getPage } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import HomeHero from "@/components/home/HomeHero";
import SectionRenderer from "@/components/sections/SectionRenderer";
import ReviewsSection from "@/components/reviews/ReviewsSection";
import JsonLd from "@/components/seo/JsonLd";
import { absoluteUrl } from "@/data/site";
import { breadcrumbSchema, faqSchema, graph, localBusinessSchema, organizationSchema, webPageSchema, websiteSchema, reviewSchemas } from "@/lib/schema";

export function generateMetadata(): Metadata {
  const doc = getPage("home")!;
  return buildMetadata(doc);
}

export default function HomePage() {
  const doc = getPage("home")!;
  const breadcrumbId = `${absoluteUrl("/")}#breadcrumb`;
  const json = graph([organizationSchema(), localBusinessSchema(), websiteSchema(), webPageSchema(doc, breadcrumbId), breadcrumbSchema([{ name: "Home", url: "/" }], breadcrumbId), faqSchema(doc.faq, doc.url), ...reviewSchemas()]);
  const [hero, ...rest] = doc.sections;
  // Insert the reviews block after the portfolio section ("Recent Logos for Austin-Area Businesses")
  const portfolioIdx = rest.findIndex((s) => JSON.stringify(s.children).includes("Recent Logos"));
  return (
    <>
      <JsonLd json={json} />
      <HomeHero section={hero} />
      {rest.map((s, i) => (
        <div key={s.id} className="contents">
          <SectionRenderer section={s} index={i + 1} />
          {i === portfolioIdx ? <ReviewsSection /> : null}
        </div>
      ))}
    </>
  );
}
