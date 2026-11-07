import type { NextConfig } from "next";

/**
 * Deployment modes
 *  - default (Node server / Hostinger VPS):   `npm run build`   -> standalone server in .next/standalone
 *  - static export (any static host/CDN):      `npm run build:static` (STATIC_EXPORT=1) -> ./out
 *
 * The consultation API route only exists in Node mode (see `pageExtensions` below):
 * route files are named `route.node.ts` so the static export never tries to bundle a POST handler.
 */
const isStaticExport = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  output: isStaticExport ? "export" : "standalone",
  trailingSlash: true, // preserves the existing WordPress URL style (/branding/)
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  pageExtensions: isStaticExport ? ["tsx", "ts"] : ["tsx", "ts", "node.ts"],
  images: {
    // Pre-generated AVIF variants (scripts/convert-elementor.mjs) served from /public.
    // Works identically for the Node build and the static export.
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    deviceSizes: [480, 960, 1440],
    imageSizes: [],
  },
  async headers() {
    if (isStaticExport) return [];
    const noindex = process.env.NEXT_PUBLIC_NOINDEX === "1";
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          ...(noindex ? [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] : []),
        ],
      },
      {
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/logos/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
