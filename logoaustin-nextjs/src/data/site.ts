/**
 * Central business configuration. Every component reads from here; nothing is hardcoded in pages.
 * Facts below were taken from the live logoaustin.com header, footer and schema on 2026-11-07.
 * Items marked VERIFY need confirmation from the business owner before launch.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://logoaustin.com").replace(/\/$/, "");
export const IS_STAGING = process.env.NEXT_PUBLIC_NOINDEX === "1";

export const site = {
  name: "Logo Austin",
  brandName: "Logo Design Austin",
  legalName: "Logo In Hours LLC",
  tagline: "Custom Logo Design Service in Austin",
  description:
    "Austin logo design studio that creates custom logos, fixes and vectorizes AI-generated logos, and builds brand identities for Central Texas businesses, delivered remotely.",
  url: SITE_URL,
  locale: "en_US",
  languages: {
    default: "en",
    /** Native Spanish routes (/es/) are only published after translated content is approved. */
    enabledLocales: (process.env.NEXT_PUBLIC_LOCALES || "en").split(","),
    plannedLocales: ["es"],
  },
  phone: { display: "(512) 782-9748", e164: "+15127829748" },
  phoneAlt: { display: "512-717-7453", e164: "+15127177453", label: "Same-day appointment line" },
  whatsapp: { display: "WhatsApp", number: "19792507486", url: "https://wa.me/19792507486" },
  email: "", // VERIFY: no public email is shown on the live site; add before launch if desired.
  address: {
    street: "7600 Chevy Chase Dr, Suite 300",
    city: "Austin",
    region: "TX",
    postalCode: "78752",
    country: "US",
    display: "7600 Chevy Chase Dr Suite No 300, Austin, TX 78752",
  },
  geo: { lat: 30.3409607, lng: -97.7045468 }, // from the footer Google Maps embed
  hours: "Seven days a week, by phone, text, WhatsApp and email", // VERIFY exact opening hours
  serviceArea: ["Austin", "Round Rock", "Cedar Park", "Georgetown", "Pflugerville", "Leander", "Kyle", "Buda", "Lakeway", "Bee Cave", "Hutto", "Manor", "San Marcos", "Del Valle"],
  social: {
    facebook: "https://www.facebook.com/logodesignaustin",
  },
  /** Google Business Profile listing (from the live footer map embed: "Logo Design Austin Logo in Hours"). */
  google: {
    mapsUrl: "https://maps.google.com/?cid=5231014890376063003",
    reviewsUrl: "https://search.google.com/local/reviews?placeid=", // VERIFY: add place ID or use mapsUrl
    embedUrl:
      "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d13773.405729646292!2d-97.7045468!3d30.3409607!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8644b51f5cb8d925%3A0x48984c53e3a4e81b!2sLogo%20Design%20Austin%20Logo%20in%20Hours!5e0!3m2!1sen!2sus!4v1680298894688!5m2!1sen!2sus",
  },
  payments: ["Cash App", "Zelle", "PayPal", "Bank Deposit"],
  pricing: { logoFrom: 125, logoTo: 175, starterPackage: 950 },
  logo: {
    light: { src: "/logos/logo-design-austin-light.png", width: 288, height: 68, alt: "Logo Design Austin" },
    dark: { src: "/logos/logo-design-austin.png", width: 288, height: 68, alt: "Logo Design Austin" },
    icon: { src: "/logos/cropped-logo-design-austin-1.png", width: 512, height: 512, alt: "Logo Design Austin icon" },
  },
  defaultOgImage: "/images/pages/logo-design-austin.avif",
  consultation: {
    leadEmailTo: process.env.LEAD_EMAIL_TO || "", // server only
    formEndpoint: process.env.NEXT_PUBLIC_FORM_ENDPOINT || "/api/consultation/",
  },
} as const;

export const googleTranslateEs = (path: string) =>
  `https://logoaustin-com.translate.goog${path}?_x_tr_sl=en&_x_tr_tl=es&_x_tr_hl=es`;

export const absoluteUrl = (path: string) => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
