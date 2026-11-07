import type { MetadataRoute } from "next";
import { getAllPages, getAllPosts } from "@/lib/content";
import { absoluteUrl } from "@/data/site";
import { toIso } from "@/lib/seo";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = getAllPages().map((p) => ({
    url: absoluteUrl(p.url),
    lastModified: toIso(p.modified),
    changeFrequency: (p.slug === "home" ? "weekly" : "monthly") as "weekly" | "monthly",
    priority: p.slug === "home" ? 1 : p.slug === "privacy-policy" || p.slug === "terms-of-use" || p.slug === "disclaimers" ? 0.2 : 0.8,
    images: p.featuredImage ? [absoluteUrl(p.featuredImage.src)] : undefined,
  }));
  const posts = getAllPosts().map((p) => ({
    url: absoluteUrl(p.url),
    lastModified: toIso(p.modified),
    changeFrequency: "yearly" as const,
    priority: 0.6,
    images: p.featuredImage ? [absoluteUrl(p.featuredImage.src)] : undefined,
  }));
  return [...pages, ...posts];
}
