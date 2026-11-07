export type NavItem = { label: string; href: string; children?: NavItem[]; description?: string };

/**
 * Proposed information architecture (approval item A3 in docs/approvals.md).
 * The live menu nests industry pages under "Business Packages" and city pages under "Consultation";
 * this grouping keeps every existing URL but organises them by intent.
 */
export const industryPages: NavItem[] = [
  { label: "Real Estate Logos", href: "/real-estate-logo-design/" },
  { label: "Construction Logos", href: "/construction-logo-design/" },
  { label: "Cleaning Company Logos", href: "/cleaning-logo-design/" },
  { label: "Medical Logos", href: "/medical-logo-design/" },
  { label: "Electrical Logos", href: "/electrical-logo-design/" },
  { label: "Moving Company Logos", href: "/moving-company-logo-design/" },
  { label: "Clothing Line Logos", href: "/clothing-line-logo-design/" },
  { label: "Small Business Logos", href: "/small-business-logo-design/" },
];

export const locationPages: NavItem[] = [
  { label: "Round Rock", href: "/round-rock-logo-design/" },
  { label: "Cedar Park", href: "/cedar-park-logo-design/" },
  { label: "Georgetown", href: "/georgetown-logo-design/" },
  { label: "Pflugerville", href: "/pflugerville-logo-design/" },
  { label: "Leander", href: "/leander-logo-design/" },
  { label: "Kyle", href: "/kyle-logo-design/" },
  { label: "San Marcos", href: "/san-marcos-logo-design/" },
  { label: "Brushy Creek", href: "/brushy-creek-logo-design/" },
  { label: "Del Valle", href: "/del-valle-logo-design/" },
  { label: "Pecan Park", href: "/pecan-park-logo-design/" },
  { label: "Copperfield", href: "/copperfield-logo-design/" },
  { label: "Katymead", href: "/katymead-logo-design/" },
  { label: "Cantarra", href: "/cantarra-logo-design/" },
  { label: "Wills Point", href: "/wills-point-logo-design/" },
];

export const servicePages: NavItem[] = [
  { label: "Austin Logo Designers", href: "/austin-logo-designers/", description: "Our team, process and pricing" },
  { label: "Custom Logo Design", href: "/custom-design/", description: "Concepts, revisions and final files" },
  { label: "Fix an AI-Generated Logo", href: "/fix-ai-generated-logo/", description: "Cleanup and vector rebuild" },
  { label: "Logo Cleanup vs Redesign", href: "/logo-cleaning-service-or-logo-redesign/", description: "Which one you need" },
  { label: "Brand Logo & Identity", href: "/brand-logo/", description: "Research, naming and visual identity" },
  { label: "Branding", href: "/branding/", description: "Colors, fonts, cards and brand guide" },
  { label: "Graphic Design", href: "/graphic-designer-austin/", description: "Flyers, banners, menus and social" },
  { label: "Website Design", href: "/website-designer-austin/", description: "Small business websites" },
  { label: "Business Starter Package", href: "/business-packages/", description: "Logo, website and cards for $950" },
  { label: "Logo Design Company Near Me", href: "/logo-designing-company-near-me-austin-tx/", description: "How to choose" },
];

export const mainNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Logo Design", href: "/austin-logo-designers/", children: servicePages.slice(0, 4) },
  { label: "Industries", href: "/small-business-logo-design/", children: industryPages },
  { label: "Branding", href: "/branding/", children: servicePages.slice(4, 6).concat(servicePages.slice(8, 9)) },
  { label: "Graphic Design", href: "/graphic-designer-austin/" },
  { label: "Website Design", href: "/website-designer-austin/" },
  { label: "Portfolio", href: "/portfolio/" },
  { label: "Blog", href: "/blogs/" },
];

export const mobileNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/austin-logo-designers/", children: servicePages },
  { label: "Industries", href: "/small-business-logo-design/", children: industryPages },
  { label: "Portfolio", href: "/portfolio/" },
  { label: "About", href: "/austin-logo-designers/" },
  { label: "Locations", href: "/austin-logo-designers/", children: locationPages },
  { label: "Blog", href: "/blogs/" },
  { label: "Contact", href: "/consultation/" },
];

export const footerLinks = {
  services: [
    { label: "Custom Logo Design", href: "/custom-design/" },
    { label: "Fix AI-Generated Logos", href: "/fix-ai-generated-logo/" },
    { label: "Brand Identity Design", href: "/brand-logo/" },
    { label: "Business Branding Packages", href: "/business-packages/" },
    { label: "Graphic Design", href: "/graphic-designer-austin/" },
    { label: "Website Design", href: "/website-designer-austin/" },
    { label: "Logo Portfolio", href: "/portfolio/" },
  ],
  industries: industryPages.slice(0, 7),
  company: [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/austin-logo-designers/" },
    { label: "Services", href: "/custom-design/" },
    { label: "Portfolio", href: "/portfolio/" },
    { label: "Blog", href: "/blogs/" },
    { label: "Contact", href: "/consultation/" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy-policy/" },
    { label: "Terms of Use", href: "/terms-of-use/" },
    { label: "Disclaimers", href: "/disclaimers/" },
    { label: "Sitemap", href: "/sitemap.xml" },
  ],
};
