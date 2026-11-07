import { portfolioFor } from "@/data/portfolio";
import PortfolioGallery from "./PortfolioGallery";
import Button from "@/components/ui/Button";

export default function PortfolioPreview({ tags, title, intro }: { tags: string[]; title?: string; intro?: string }) {
  const items = portfolioFor(tags, 6);
  if (!items.length) return null;
  return (
    <section className="sec sec--portfolio bg-white" id="portfolio-preview" aria-labelledby="portfolio-preview-title">
      <div className="container">
        <div className="sec-head align-center">
          <p className="eyebrow">Our work</p>
          <h2 id="portfolio-preview-title">{title ?? "Recent Work From the Logo Austin Portfolio"}</h2>
          <p>{intro ?? "Real projects designed from scratch for Austin-area businesses. Every mark is delivered as scalable vector files you own."}</p>
        </div>
        <PortfolioGallery images={items} cols={3} showCaptions />
        <div className="btn-group justify-center">
          <Button href="/portfolio/" variant="ghost" icon="arrow-right" iconPosition="right">
            View the Full Portfolio
          </Button>
          <Button href="#consultation" variant="primary">
            Get a Free Consultation
          </Button>
        </div>
      </div>
    </section>
  );
}
