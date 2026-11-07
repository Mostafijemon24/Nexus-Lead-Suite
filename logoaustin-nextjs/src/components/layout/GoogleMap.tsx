import { site } from "@/data/site";

/** Static map link instead of an iframe on first paint keeps the footer light; the embed loads lazily. */
export default function GoogleMap() {
  return (
    <div className="map">
      <iframe
        src={site.google.embedUrl}
        title={`${site.brandName} on Google Maps`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  );
}
