import inventory from "@/content/image-inventory.json";

/**
 * Portfolio records are derived from the migrated image inventory (real client work already
 * published on logoaustin.com). Titles come from the approved alt text; nothing is invented.
 * Images without a descriptive alt are shown with a generic caption and flagged for the owner
 * to name (see docs/portfolio-inventory.md).
 */
export type PortfolioItem = {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  title: string;
  category: string;
  tags: string[];
  named: boolean;
  pages: string[];
};

type InvRecord = {
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
  folder?: string;
  name?: string;
  pages?: string[];
  altNeedsReview?: boolean;
  missing?: boolean;
};

const CATEGORY_RULES: [RegExp, string, string[]][] = [
  [/website|homepage|login page/i, "Website design", ["web"]],
  [/flyer|banner|postcard|business card|label|cap|face mask|pillow|embroider|printed/i, "Graphic & print design", ["graphic", "print", "branding"]],
  [/roof|construction|contractor|paint|chimney|crane|laborers|building|remodel|electric/i, "Construction & trades", ["construction", "logo"]],
  [/propert|realt|investments|house|homes|estate/i, "Real estate", ["real-estate", "logo"]],
  [/clean|maid|detailing|trash|janitor|wash/i, "Cleaning services", ["cleaning", "logo"]],
  [/animal|clinic|hospital|therapy|skincare|strength|health|dental|medical/i, "Medical & wellness", ["medical", "logo"]],
  [/truck|transport|moving|trucking|haul/i, "Transportation & moving", ["transport", "logo"]],
  [/hair|braid|beauty|salon|spa/i, "Beauty", ["beauty", "logo"]],
  [/drinks|cafe|bakery|food|martini|bar\b/i, "Food & hospitality", ["food", "logo"]],
  [/tax|law|legal|account|consult/i, "Professional services", ["professional", "logo"]],
  [/apparel|clothing|shirt|wear/i, "Apparel", ["apparel", "logo"]],
];

function titleFromAlt(alt: string): string {
  // "Road Bull Transportation logo with a red semi truck and bull horns" -> "Road Bull Transportation"
  const m = alt.match(/^(.*?)(?:\s+(?:logo|badge logo|round orange logo|gold logo|neon-style logo|website homepage|business card|banner|flyer|postcard|product label|logo embroidered|logo printed|website login page design)\b)/i);
  const t = (m ? m[1] : alt).replace(/\s+(with|in|on|featuring)\s.*$/i, "").trim();
  return t.length > 2 && t.length < 60 ? t : alt;
}

function categorize(alt: string, pages: string[]): { category: string; tags: string[] } {
  for (const [re, category, tags] of CATEGORY_RULES) if (re.test(alt)) return { category, tags };
  for (const p of pages) {
    for (const [re, category, tags] of CATEGORY_RULES) if (re.test(p.replace(/-/g, " "))) return { category, tags };
  }
  return { category: "Logo design", tags: ["logo"] };
}

const records = (inventory as InvRecord[]).filter((r) => !r.missing && r.src && r.folder === "portfolio" && (r.width ?? 0) >= 200);

export const portfolio: PortfolioItem[] = records.map((r) => {
  const alt = r.alt || "";
  const named = !!alt && !r.altNeedsReview;
  const { category, tags } = categorize(alt, r.pages || []);
  return {
    id: r.name!,
    src: r.src!,
    alt: named ? alt : "Custom logo designed by Logo Austin for a Central Texas business",
    width: r.width!,
    height: r.height!,
    title: named ? titleFromAlt(alt) : "Custom logo design",
    category,
    tags,
    named,
    pages: r.pages || [],
  };
});

/** Logos only (square-ish marks), named first. */
export const featuredLogos = portfolio
  .filter((p) => p.tags.includes("logo") && Math.abs(p.width / p.height - 1) < 0.5)
  .sort((a, b) => Number(b.named) - Number(a.named));

export function portfolioFor(tags: string[], limit = 6): PortfolioItem[] {
  const scored = portfolio
    .map((p) => ({ p, score: p.tags.filter((t) => tags.includes(t)).length * 2 + (p.named ? 1 : 0) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
  const picked = scored.slice(0, limit).map((x) => x.p);
  if (picked.length < limit) {
    for (const p of featuredLogos) {
      if (picked.length >= limit) break;
      if (!picked.includes(p)) picked.push(p);
    }
  }
  return picked;
}

export const portfolioCategories = [...new Set(portfolio.map((p) => p.category))].sort();
