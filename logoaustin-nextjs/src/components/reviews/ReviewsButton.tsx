import { reviewSources } from "@/data/reviews";
import Icon from "@/components/ui/Icon";

/**
 * Compact floating "★ Reviews" button (mobile). Two anchors are rendered; CSS (`body:has(#reviews)`)
 * shows the in-page one when the page has a reviews section and the Google listing otherwise.
 */
export default function ReviewsButton() {
  const google = reviewSources[0];
  return (
    <>
      <a href="#reviews" className="reviews-fab reviews-fab--local" aria-label="Jump to customer reviews">
        <Icon name="star" size={16} />
        <span>Reviews</span>
      </a>
      <a href={google.url} className="reviews-fab reviews-fab--gbp" target="_blank" rel="noopener noreferrer" aria-label="Read our Google reviews (opens in a new tab)">
        <Icon name="star" size={16} />
        <span>Reviews</span>
      </a>
    </>
  );
}
