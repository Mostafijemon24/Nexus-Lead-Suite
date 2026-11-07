import { absoluteUrl, SITE_URL, site } from "@/data/site";
import { aggregateRating, reviews } from "@/data/reviews";
import { getService } from "@/data/services";
import type { AnyDoc, FaqItem } from "@/types/content";
import { descriptionFor, titleFor, toIso } from "./seo";

type JsonLd = Record<string, unknown>;

const ORG_ID = `${SITE_URL}/#organization`;
const SITE_ID = `${SITE_URL}/#website`;
const BUSINESS_ID = `${SITE_URL}/#localbusiness`;

export function organizationSchema(): JsonLd {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: site.brandName,
    alternateName: [site.name, "Austin Logo design company"],
    legalName: site.legalName,
    url: `${SITE_URL}/`,
    logo: { "@type": "ImageObject", url: absoluteUrl(site.logo.dark.src), width: site.logo.dark.width, height: site.logo.dark.height, caption: site.brandName },
    image: absoluteUrl(site.logo.dark.src),
    telephone: site.phone.e164,
    sameAs: [...Object.values(site.social), site.google.mapsUrl],
  };
}

export function localBusinessSchema(): JsonLd {
  const schema: JsonLd = {
    "@type": ["ProfessionalService", "LocalBusiness"],
    "@id": BUSINESS_ID,
    name: site.brandName,
    url: `${SITE_URL}/`,
    logo: absoluteUrl(site.logo.dark.src),
    image: absoluteUrl(site.logo.dark.src),
    telephone: site.phone.e164,
    description: site.description,
    priceRange: `$${site.pricing.logoFrom}–$${site.pricing.starterPackage}`,
    parentOrganization: { "@type": "Organization", name: site.legalName },
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressRegion: site.address.region,
      postalCode: site.address.postalCode,
      addressCountry: site.address.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lng },
    areaServed: site.serviceArea.map((c) => ({ "@type": "City", name: `${c}, TX` })),
    hasMap: site.google.mapsUrl,
    sameAs: Object.values(site.social),
    paymentAccepted: site.payments.join(", "),
  };
  if (aggregateRating) {
    schema.aggregateRating = { "@type": "AggregateRating", ratingValue: aggregateRating.ratingValue, reviewCount: aggregateRating.reviewCount };
  }
  return schema;
}

export function websiteSchema(): JsonLd {
  return {
    "@type": "WebSite",
    "@id": SITE_ID,
    url: `${SITE_URL}/`,
    name: site.brandName,
    description: site.tagline,
    publisher: { "@id": ORG_ID },
    inLanguage: "en-US",
  };
}

export function webPageSchema(doc: AnyDoc, breadcrumbId: string): JsonLd {
  const url = absoluteUrl(doc.url);
  return {
    "@type": doc.type === "post" ? "WebPage" : doc.slug === "consultation" ? "ContactPage" : doc.slug === "portfolio" ? "CollectionPage" : "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: titleFor(doc),
    description: descriptionFor(doc),
    isPartOf: { "@id": SITE_ID },
    about: { "@id": BUSINESS_ID },
    breadcrumb: { "@id": breadcrumbId },
    datePublished: toIso(doc.date),
    dateModified: toIso(doc.modified),
    inLanguage: "en-US",
    ...(doc.featuredImage ? { primaryImageOfPage: { "@type": "ImageObject", url: absoluteUrl(doc.featuredImage.src), width: doc.featuredImage.width, height: doc.featuredImage.height, caption: doc.featuredImage.alt } } : {}),
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[], id: string): JsonLd {
  return {
    "@type": "BreadcrumbList",
    "@id": id,
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: absoluteUrl(it.url) })),
  };
}

export function serviceSchema(doc: AnyDoc): JsonLd | null {
  const svc = getService(doc.slug);
  if (!svc) return null;
  return {
    "@type": "Service",
    "@id": `${absoluteUrl(doc.url)}#service`,
    name: svc.name,
    serviceType: svc.serviceType,
    description: descriptionFor(doc),
    provider: { "@id": BUSINESS_ID },
    areaServed: { "@type": "City", name: "Austin, TX" },
    url: absoluteUrl(doc.url),
    offers: svc.category === "logo" || svc.category === "industry" ? { "@type": "Offer", priceCurrency: "USD", price: String(site.pricing.logoFrom), priceSpecification: { "@type": "PriceSpecification", minPrice: site.pricing.logoFrom, maxPrice: site.pricing.logoTo, priceCurrency: "USD" } } : svc.slug === "business-packages" ? { "@type": "Offer", priceCurrency: "USD", price: String(site.pricing.starterPackage) } : undefined,
  };
}

export function faqSchema(items: FaqItem[], pageUrl: string): JsonLd | null {
  if (!items.length) return null;
  return {
    "@type": "FAQPage",
    "@id": `${absoluteUrl(pageUrl)}#faq`,
    mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: stripHtml(f.a) } })),
  };
}

export function blogPostingSchema(doc: AnyDoc, words: number): JsonLd {
  const url = absoluteUrl(doc.url);
  return {
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: doc.title,
    description: descriptionFor(doc),
    url,
    mainEntityOfPage: { "@id": `${url}#webpage` },
    datePublished: toIso(doc.date),
    dateModified: toIso(doc.modified),
    author: { "@type": "Organization", name: `${site.name} Design Team`, url: `${SITE_URL}/austin-logo-designers/` },
    publisher: { "@id": ORG_ID },
    wordCount: words,
    inLanguage: "en-US",
    ...(doc.featuredImage ? { image: absoluteUrl(doc.featuredImage.src) } : {}),
  };
}

export function reviewSchemas(): JsonLd[] {
  // Only verified reviews are ever marked up; self-serving aggregate ratings are not fabricated.
  return reviews.map((r) => ({
    "@type": "Review",
    itemReviewed: { "@id": BUSINESS_ID },
    author: { "@type": "Person", name: r.author },
    reviewBody: r.quote,
    ...(r.rating ? { reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 } } : {}),
    ...(r.date ? { datePublished: r.date } : {}),
    url: r.sourceUrl,
  }));
}

export function graph(nodes: (JsonLd | null | undefined)[]): string {
  const g = { "@context": "https://schema.org", "@graph": nodes.filter(Boolean) };
  return JSON.stringify(g).replace(/</g, "\\u003c");
}

function stripHtml(h: string) {
  return h.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}
