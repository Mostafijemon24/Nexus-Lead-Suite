import { portfolio, portfolioCategories } from "@/data/portfolio";
import PortfolioGallery from "./PortfolioGallery";
import Button from "@/components/ui/Button";

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

/**
 * Complete portfolio grouped by category (anchor-linked filter, no JavaScript).
 * Replaces the legacy image-row layout of the live portfolio page.
 */
export default function FullPortfolio() {
  const groups = portfolioCategories
    .map((c) => ({ category: c, items: portfolio.filter((p) => p.category === c).sort((a, b) => Number(b.named) - Number(a.named)) }))
    .filter((g) => g.items.length > 0)
    .sort((a, b) => b.items.length - a.items.length);
  return (
    <section className="sec bg-white" id="recent-work" aria-labelledby="recent-work-title">
      <div className="container">
        <div className="sec-head align-center">
          <p className="eyebrow">Recent work</p>
          <h2 id="recent-work-title">Recent Works: Custom Logos and Brand Designs</h2>
          <p>
            {portfolio.length} projects designed from scratch for Austin-area businesses. Browse by industry, then tell us about your own project.
          </p>
        </div>
        <ul className="portfolio-filter" aria-label="Jump to a category">
          {groups.map((g) => (
            <li key={g.category}>
              <a href={`#cat-${slug(g.category)}`}>
                {g.category} ({g.items.length})
              </a>
            </li>
          ))}
        </ul>
        {groups.map((g) => (
          <div key={g.category} className="portfolio-group">
            <h3 id={`cat-${slug(g.category)}`}>{g.category}</h3>
            <PortfolioGallery images={g.items} cols={4} showCaptions />
          </div>
        ))}
        <div className="btn-group justify-center">
          <Button href="#consultation" variant="primary" size="lg">
            Start Your Own Logo
          </Button>
          <Button href="/austin-logo-designers/" variant="ghost">
            Meet the Designers
          </Button>
        </div>
      </div>
    </section>
  );
}
