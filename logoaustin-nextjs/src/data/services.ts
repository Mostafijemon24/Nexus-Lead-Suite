/**
 * Primary "money" pages: each gets a portfolio preview, a reviews block, related-service links,
 * Service schema and a consultation CTA. `portfolioTags` select relevant work from data/portfolio.ts.
 */
export type ServiceDef = {
  slug: string;
  name: string;
  serviceType: string;
  category: "logo" | "branding" | "graphic" | "web" | "package" | "industry" | "location";
  portfolioTags: string[];
  related: string[]; // slugs
  articles: string[]; // blog slugs
};

export const services: ServiceDef[] = [
  { slug: "austin-logo-designers", name: "Austin Logo Designers", serviceType: "Logo design", category: "logo", portfolioTags: ["logo"], related: ["custom-design", "fix-ai-generated-logo", "branding", "portfolio"], articles: ["choose-the-best-logo-design-company", "custom-logo-design-brand-identity", "simple-logos-with-great-volume"] },
  { slug: "custom-design", name: "Custom Logo Design", serviceType: "Custom logo design", category: "logo", portfolioTags: ["logo"], related: ["austin-logo-designers", "small-business-logo-design", "brand-logo", "fix-ai-generated-logo"], articles: ["texas-logo-design-service-for-custom-logo-design-based-on-vision", "why-we-prefer-adobe-illustrator-to-design-logo", "custom-logo-design-brand-identity"] },
  { slug: "fix-ai-generated-logo", name: "Fix AI-Generated Logo", serviceType: "AI logo cleanup and vectorization", category: "logo", portfolioTags: ["logo"], related: ["logo-cleaning-service-or-logo-redesign", "custom-design", "branding"], articles: ["logo-cleaning-service-or-logo-redesign", "simple-logos-with-great-volume"] },
  { slug: "brand-logo", name: "Brand Logo Design", serviceType: "Brand identity design", category: "branding", portfolioTags: ["branding", "logo"], related: ["branding", "custom-design", "business-packages"], articles: ["brand-identity-design-services-austin-tx", "logo-and-branding-design-austin", "custom-logo-design-brand-identity"] },
  { slug: "branding", name: "Branding", serviceType: "Small business branding", category: "branding", portfolioTags: ["branding", "logo"], related: ["brand-logo", "graphic-designer-austin", "business-packages", "website-designer-austin"], articles: ["branding-agency-in-austin-for-small-businesses", "local-business-branding-consultant-in-austin", "startup-branding-austin"] },
  { slug: "graphic-designer-austin", name: "Graphic Design", serviceType: "Graphic design", category: "graphic", portfolioTags: ["graphic", "apparel", "print"], related: ["branding", "custom-design", "website-designer-austin"], articles: ["business-card-design-austin", "brochure-design-austin", "graphic-designer-in-austin-for-clothing-brands"] },
  { slug: "website-designer-austin", name: "Website Design", serviceType: "Small business website design", category: "web", portfolioTags: ["web"], related: ["business-packages", "branding", "custom-design"], articles: ["professional-website-design-for-small-businesses", "startup-branding-and-marketing-in-austin"] },
  { slug: "business-packages", name: "Business Starter Package", serviceType: "Logo, website and business card package", category: "package", portfolioTags: ["web", "logo", "print"], related: ["website-designer-austin", "custom-design", "branding"], articles: ["startup-branding-and-marketing-in-austin", "affordable-logo-branding-tshirt-design-austin-tx"] },
  { slug: "logo-designing-company-near-me-austin-tx", name: "Logo Design Company Near Me", serviceType: "Logo design", category: "logo", portfolioTags: ["logo"], related: ["austin-logo-designers", "custom-design", "portfolio"], articles: ["choose-the-best-logo-design-company"] },
  { slug: "real-estate-logo-design", name: "Real Estate Logo Design", serviceType: "Real estate logo design", category: "industry", portfolioTags: ["real-estate", "logo"], related: ["construction-logo-design", "custom-design", "branding"], articles: ["custom-logo-design-brand-identity"] },
  { slug: "construction-logo-design", name: "Construction Logo Design", serviceType: "Construction and contractor logo design", category: "industry", portfolioTags: ["construction", "logo"], related: ["electrical-logo-design", "real-estate-logo-design", "custom-design"], articles: ["simple-logos-with-great-volume"] },
  { slug: "cleaning-logo-design", name: "Cleaning Company Logo Design", serviceType: "Cleaning company logo design", category: "industry", portfolioTags: ["cleaning", "logo"], related: ["small-business-logo-design", "moving-company-logo-design", "custom-design"], articles: ["custom-logo-design-brand-identity"] },
  { slug: "medical-logo-design", name: "Medical Logo Design", serviceType: "Medical and healthcare logo design", category: "industry", portfolioTags: ["medical", "logo"], related: ["branding", "custom-design", "small-business-logo-design"], articles: ["hospital-branding-austin"] },
  { slug: "electrical-logo-design", name: "Electrical Logo Design", serviceType: "Electrician logo design", category: "industry", portfolioTags: ["construction", "logo"], related: ["construction-logo-design", "small-business-logo-design", "custom-design"], articles: ["simple-logos-with-great-volume"] },
  { slug: "moving-company-logo-design", name: "Moving Company Logo Design", serviceType: "Moving company logo design", category: "industry", portfolioTags: ["transport", "logo"], related: ["cleaning-logo-design", "small-business-logo-design", "custom-design"], articles: ["custom-logo-design-brand-identity"] },
  { slug: "clothing-line-logo-design", name: "Clothing Line Logo Design", serviceType: "Clothing brand logo design", category: "industry", portfolioTags: ["apparel", "logo"], related: ["graphic-designer-austin", "branding", "custom-design"], articles: ["graphic-designer-in-austin-for-clothing-brands", "who-designs-custom-t-shirts-and-branding-for-startups-in-austin", "same-day-tshirt-brand-design-services-austin"] },
  { slug: "small-business-logo-design", name: "Small Business Logo Design", serviceType: "Small business logo design", category: "industry", portfolioTags: ["logo"], related: ["custom-design", "business-packages", "branding"], articles: ["affordable-logo-branding-tshirt-design-austin-tx", "choose-the-best-logo-design-company"] },
];

export const locationSlugs = [
  "round-rock-logo-design",
  "cedar-park-logo-design",
  "georgetown-logo-design",
  "pflugerville-logo-design",
  "leander-logo-design",
  "kyle-logo-design",
  "san-marcos-logo-design",
  "brushy-creek-logo-design",
  "del-valle-logo-design",
  "pecan-park-logo-design",
  "copperfield-logo-design",
  "katymead-logo-design",
  "cantarra-logo-design",
  "wills-point-logo-design",
];

export const getService = (slug: string) => services.find((s) => s.slug === slug);
export const isLocationPage = (slug: string) => locationSlugs.includes(slug);
export const isPrimaryPage = (slug: string) => !!getService(slug) || isLocationPage(slug);
