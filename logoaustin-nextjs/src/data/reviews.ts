/**
 * Customer reviews. ONLY verified, authorised reviews may be added here.
 * The live site shows no testimonials (the portfolio page contained a lorem-ipsum placeholder
 * slider, which was removed). Until the owner supplies verified reviews with source links,
 * the Reviews components link to the Google Business Profile listing instead.
 *
 * To add a review: { quote, author, source: "Google", sourceUrl, date, rating, project? }
 */
export type Review = {
  quote: string;
  author: string;
  source: "Google" | "Facebook" | "Email" | "Other";
  sourceUrl: string;
  date?: string;
  rating?: 1 | 2 | 3 | 4 | 5;
  project?: string;
  verified: true;
};

export const reviews: Review[] = [];

export const reviewSources = [
  { name: "Google", label: "Read our Google reviews", url: "https://maps.google.com/?cid=5231014890376063003" },
  { name: "Facebook", label: "Facebook page", url: "https://www.facebook.com/logodesignaustin" },
] as const;

/** Aggregate rating is only rendered when verified figures are provided (never estimated). */
export const aggregateRating: { ratingValue: number; reviewCount: number } | null = null;
