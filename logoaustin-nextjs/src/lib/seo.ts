import type { Metadata } from "next";
import { absoluteUrl, IS_STAGING, site } from "@/data/site";
import type { AnyDoc } from "@/types/content";

const SEP = " | ";

export function titleFor(doc: AnyDoc): string {
  const t = doc.seo.title?.trim();
  if (t) return t;
  return `${doc.title}${SEP}${site.name}`;
}

export function descriptionFor(doc: AnyDoc): string {
  return doc.seo.description?.trim() || site.description;
}

export const robotsMeta: Metadata["robots"] = IS_STAGING
  ? { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } }
  : { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } };

export function buildMetadata(doc: AnyDoc): Metadata {
  const url = absoluteUrl(doc.url);
  const image = doc.featuredImage ? absoluteUrl(doc.featuredImage.src.replace(/\.avif$/, `-w${pickOgWidth(doc.featuredImage.width)}.avif`)) : absoluteUrl(site.defaultOgImage);
  const isPost = doc.type === "post";
  return {
    title: { absolute: titleFor(doc) }, // Yoast titles already carry the brand suffix
    description: descriptionFor(doc),
    alternates: { canonical: doc.seo.canonical || url, languages: alternatesFor(doc.url) },
    robots: robotsMeta,
    openGraph: {
      type: isPost ? "article" : "website",
      url,
      siteName: site.brandName,
      locale: site.locale,
      title: titleFor(doc),
      description: descriptionFor(doc),
      images: [{ url: image, width: doc.featuredImage?.width ?? 1200, height: doc.featuredImage?.height ?? 630, alt: doc.featuredImage?.alt ?? site.brandName }],
      ...(isPost ? { publishedTime: toIso(doc.date), modifiedTime: toIso(doc.modified), authors: [`${site.name} Design Team`] } : {}),
    },
    twitter: { card: "summary_large_image", title: titleFor(doc), description: descriptionFor(doc), images: [image] },
  };
}

function pickOgWidth(w: number) {
  return [480, 960, 1440].find((x) => x >= Math.min(w, 1200)) ?? Math.min(w, 1600);
}

export function alternatesFor(path: string): Record<string, string> | undefined {
  const locales = site.languages.enabledLocales;
  if (locales.length <= 1) return undefined; // hreflang only once native Spanish routes are approved
  const map: Record<string, string> = { "x-default": absoluteUrl(path), en: absoluteUrl(path) };
  if (locales.includes("es")) map.es = absoluteUrl(`/es${path}`);
  return map;
}

export function toIso(wpDate: string): string {
  // WordPress stores "YYYY-MM-DD HH:MM:SS" in site time (America/Chicago)
  return new Date(wpDate.replace(" ", "T") + "-06:00").toISOString();
}

export function formatDate(wpDate: string): string {
  return new Date(wpDate.replace(" ", "T")).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}
