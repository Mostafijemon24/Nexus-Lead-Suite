import type { Metadata } from "next";
import Button from "@/components/ui/Button";

export const metadata: Metadata = { title: "Page not found", robots: { index: false, follow: true } };

export default function NotFound() {
  return (
    <section className="sec bg-cream">
      <div className="container container--narrow align-center">
        <p className="eyebrow">404</p>
        <h1>We could not find that page</h1>
        <p>The link may be out of date. Start from the homepage, browse the portfolio, or talk to an Austin designer.</p>
        <div className="btn-group justify-center">
          <Button href="/" variant="primary">
            Back to Home
          </Button>
          <Button href="/portfolio/" variant="ghost">
            View Portfolio
          </Button>
        </div>
      </div>
    </section>
  );
}
