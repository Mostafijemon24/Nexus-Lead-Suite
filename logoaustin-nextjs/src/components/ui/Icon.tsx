import type { SVGProps } from "react";

/**
 * Lightweight inline icon set (24x24, stroke based). Font Awesome class names coming from the
 * migrated content are mapped onto these icons, so no icon font is loaded.
 */
const paths: Record<string, string> = {
  "check-circle": "M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3",
  check: "M20 6 9 17l-5-5",
  "arrow-right": "M5 12h14M12 5l7 7-7 7",
  phone: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z",
  star: "m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  sparkles: "M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8",
  palette: "M12 22a10 10 0 1 1 10-10c0 2-1.5 3-3 3h-2a2 2 0 0 0-1.5 3.3c.6.7.3 1.7-.5 2.2a9 9 0 0 1-3 .5zM7.5 10.5h.01M12 7h.01M16.5 10.5h.01",
  pen: "M12 19l7-7 3 3-7 7-3-3zM18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5zM2 2l7.586 7.586M11 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  "hand-coins": "M11 15h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 17M7 21l1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2L21 13.5M17 3a3 3 0 1 1-3 3 3 3 0 0 1 3-3z",
  shirt: "M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z",
  layers: "m12 2 10 5-10 5L2 7l10-5zM2 12l10 5 10-5M2 17l10 5 10-5",
  laptop: "M3 5h18v11H3zM1 19h22",
  box: "M21 8 12 3 3 8v8l9 5 9-5V8zM3 8l9 5 9-5M12 13v9",
  "hard-hat": "M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a7 7 0 0 0-7-7H9a7 7 0 0 0-7 7v2zM10 10V5a2 2 0 0 1 4 0v5",
  download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
  sign: "M4 3v18M4 5h14l3 3-3 3H4",
  home: "m3 11 9-8 9 8v10a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2V11z",
  bezier: "M4 7h16M12 7v10M4 17h16M3 5h2v4H3zM19 5h2v4h-2zM3 15h2v4H3zM19 15h2v4h-2z",
  "id-card": "M2 5h20v14H2zM6 9h4v4H6zM14 9h5M14 13h5",
  hash: "M4 9h16M4 15h16M10 3 8 21M16 3l-2 18",
  stethoscope: "M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6 6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3M8 15v1a6 6 0 0 0 6 6 6 6 0 0 0 6-6v-4M20 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  soap: "M7 10h10a4 4 0 0 1 4 4v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6a4 4 0 0 1 4-4zM9 10V6a3 3 0 0 1 6 0v4M15 3h.01M18 5h.01",
  tools: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z",
  bolt: "M13 2 3 14h9l-1 8 10-12h-9l1-8z",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  building: "M4 22V3h12v19M20 22V9h-4M8 7h2M8 11h2M8 15h2M12 7h2M12 11h2M12 15h2M2 22h20",
  car: "M5 17H3v-5l2-5h14l2 5v5h-2M5 17a2 2 0 1 0 4 0 2 2 0 1 0-4 0zM15 17a2 2 0 1 0 4 0 2 2 0 1 0-4 0zM5 12h14",
  images: "M3 7h14v12H3zM7 3h14v12M3 15l4-4 3 3 3-3 4 4",
  font: "M4 20h16M6 20 12 4l6 16M8.5 14h7",
  "file-pdf": "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM14 2v6h6M8 17h8M8 13h8",
  image: "M3 5h18v14H3zM8 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM21 15l-5-5-9 9",
  mobile: "M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM12 18h.01",
  store: "M3 9l1.5-5h15L21 9M3 9v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9M3 9h18M9 21v-7h6v7",
  sync: "M21 2v6h-6M3 22v-6h6M21 8a9 9 0 0 0-15-4.5L3 8M3 16a9 9 0 0 0 15 4.5L21 16",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35",
  truck: "M1 3h15v13H1zM16 8h4l3 3v5h-7V8zM5.5 19a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM18.5 19a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  "file-text": "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM14 2v6h6M16 13H8M16 17H8M10 9H8",
  megaphone: "m3 11 18-5v12L3 14v-3zM11.6 16.8a3 3 0 1 1-5.8-1.6",
  gem: "M6 3h12l4 6-10 13L2 9l4-6zM2 9h20M12 22 7 9l3-6M12 22l5-13-3-6",
  heart: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
  scale: "M12 3v18M3 7l9-4 9 4M5 7l-3 7a4 4 0 0 0 6 0L5 7zM19 7l-3 7a4 4 0 0 0 6 0l-3-7",
  grid: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  scissors: "M6 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12",
  "text-height": "M4 20h8M8 4v16M6 4h4M15 7l3-3 3 3M18 4v16M15 17l3 3 3-3",
  book: "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z",
  printer: "M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z",
  flag: "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1v12zM4 22v-7",
  utensils: "M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7",
  drop: "M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z",
  door: "M13 4h3a2 2 0 0 1 2 2v14M2 20h3M13 20h9M10 12v.01M13 4.56v16.88a1 1 0 0 1-1.24.97l-5-1.25A1 1 0 0 1 6 20.2V3.8a1 1 0 0 1 1.24-.97l5 1.25A1 1 0 0 1 13 4.56z",
  paw: "M12 13a5 5 0 0 1 5 5c0 1.5-1 2.5-2.5 2.5-1 0-1.5-.5-2.5-.5s-1.5.5-2.5.5C8 20.5 7 19.5 7 18a5 5 0 0 1 5-5zM7 9a1.7 2.2 0 1 0 0-.1M17 9a1.7 2.2 0 1 0 0-.1M10 5a1.6 2.2 0 1 0 0-.1M14 5a1.6 2.2 0 1 0 0-.1",
  whatsapp: "M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21zM9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1",
  menu: "M4 6h16M4 12h16M4 18h16",
  x: "M18 6 6 18M6 6l12 12",
  "chevron-down": "m6 9 6 6 6-6",
  globe: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z",
  mail: "M4 4h16v16H4zM4 7l8 6 8-6",
  "map-pin": "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2",
  facebook: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z",
  "external-link": "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3",
  quote: "M3 21c3 0 7-1 7-8V5c0-1.25-.76-2.02-2-2H4c-1.25 0-2 .75-2 1.97V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .01-1 1.01V21zM15 21c3 0 7-1 7-8V5c0-1.25-.76-2.02-2-2h-4c-1.25 0-2 .75-2 1.97V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3z",
  send: "m22 2-7 20-4-9-9-4 20-7zM22 2 11 13",
};

const faMap: Record<string, string> = {
  "fa-check-circle": "check-circle",
  "fa-check": "check",
  "fa-arrow-right": "arrow-right",
  "fa-phone-alt": "phone",
  "fa-phone": "phone",
  "fa-star": "star",
  "fa-magic": "sparkles",
  "fa-palette": "palette",
  "fa-pen-nib": "pen",
  "fa-hand-holding-usd": "hand-coins",
  "fa-tshirt": "shirt",
  "fa-layer-group": "layers",
  "fa-laptop": "laptop",
  "fa-box-open": "box",
  "fa-hard-hat": "hard-hat",
  "fa-file-download": "download",
  "fa-sign": "sign",
  "fa-home": "home",
  "fa-bezier-curve": "bezier",
  "fa-id-card": "id-card",
  "fa-hashtag": "hash",
  "fa-stethoscope": "stethoscope",
  "fa-soap": "soap",
  "fa-tools": "tools",
  "fa-bolt": "bolt",
  "fa-eye": "eye",
  "fa-building": "building",
  "fa-car": "car",
  "fa-car-side": "car",
  "fa-images": "images",
  "fa-font": "font",
  "fa-file-pdf": "file-pdf",
  "fa-image": "image",
  "fa-mobile-alt": "mobile",
  "fa-store": "store",
  "fa-sync-alt": "sync",
  "fa-search": "search",
  "fa-truck-pickup": "truck",
  "fa-truck": "truck",
  "fa-file-contract": "file-text",
  "fa-file-alt": "file-text",
  "fa-file-medical": "file-text",
  "fa-bullhorn": "megaphone",
  "fa-gem": "gem",
  "fa-user-md": "stethoscope",
  "fa-tooth": "heart",
  "fa-hand-holding-heart": "heart",
  "fa-vector-square": "bezier",
  "fa-spell-check": "check",
  "fa-th": "grid",
  "fa-balance-scale": "scale",
  "fa-broom": "soap",
  "fa-cut": "scissors",
  "fa-text-height": "text-height",
  "fa-book-open": "book",
  "fa-print": "printer",
  "fa-flag": "flag",
  "fa-utensils": "utensils",
  "fa-tint": "drop",
  "fa-door-open": "door",
  "fa-paw": "paw",
  "fa-whatsapp": "whatsapp",
  "fa-facebook-f": "facebook",
};

export function resolveIcon(name?: string): string {
  if (!name) return "sparkles";
  if (paths[name]) return name;
  const fa = name.split(/\s+/).find((c) => c.startsWith("fa-") && c !== "fa-solid");
  return (fa && faMap[fa]) || "sparkles";
}

type Props = SVGProps<SVGSVGElement> & { name?: string; size?: number; title?: string };

export default function Icon({ name, size = 20, title, ...rest }: Props) {
  const key = resolveIcon(name);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      focusable="false"
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      <path d={paths[key]} />
    </svg>
  );
}
