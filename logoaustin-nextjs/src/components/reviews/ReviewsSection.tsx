import { reviews, reviewSources, aggregateRating } from "@/data/reviews";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";

/**
 * Reusable reviews block for every primary page. Shows verified reviews when present; otherwise
 * it links to the Google Business Profile so visitors read authentic reviews at the source.
 */
export default function ReviewsSection({ context }: { context?: string }) {
  const google = reviewSources[0];
  return (
    <section className="sec sec--reviews bg-cream" id="reviews" aria-labelledby="reviews-title">
      <div className="container">
        <div className="sec-head align-center">
          <p className="eyebrow">Customer reviews</p>
          <h2 id="reviews-title">What Austin Business Owners Say About Working With Us</h2>
          <p>
            Every review we show is written by a real client and linked to its original source. Read them on Google{context ? ` before you start your ${context} project` : ""}, or leave your own after we deliver your files.
          </p>
        </div>

        {reviews.length > 0 ? (
          <ul className="reviews">
            {reviews.map((r, i) => (
              <li key={i} className="review">
                {r.rating ? (
                  <p className="review__stars" aria-label={`${r.rating} out of 5 stars`}>
                    {Array.from({ length: r.rating }).map((_, j) => (
                      <Icon key={j} name="star" size={16} />
                    ))}
                  </p>
                ) : null}
                <blockquote>
                  <p>{r.quote}</p>
                </blockquote>
                <footer>
                  <strong>{r.author}</strong>
                  {r.project ? <span> · {r.project}</span> : null}
                  <a href={r.sourceUrl} target="_blank" rel="noopener noreferrer nofollow">
                    {r.source} <Icon name="external-link" size={12} />
                  </a>
                </footer>
              </li>
            ))}
          </ul>
        ) : (
          <div className="reviews-empty">
            <Icon name="quote" size={28} />
            <p>Read authentic, unedited reviews from Austin-area clients directly on our Google Business Profile.</p>
          </div>
        )}

        {aggregateRating ? (
          <p className="reviews__agg">
            Rated {aggregateRating.ratingValue} out of 5 from {aggregateRating.reviewCount} Google reviews.
          </p>
        ) : null}

        <div className="btn-group justify-center">
          <Button href={google.url} variant="primary" icon="star">
            {google.label}
          </Button>
          <Button href="#consultation" variant="ghost">
            Start Your Free Consultation
          </Button>
        </div>
      </div>
    </section>
  );
}
