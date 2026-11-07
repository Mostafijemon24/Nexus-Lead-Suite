import type { MetadataRoute } from "next";
import { absoluteUrl, IS_STAGING } from "@/data/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  if (IS_STAGING) {
    // Temporary domain: never indexable.
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
