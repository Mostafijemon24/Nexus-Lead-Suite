import SmartImage from "@/components/ui/SmartImage";
import type { ImageRef } from "@/types/content";

type Item = ImageRef & { title?: string; category?: string; href?: string };

/** Lightweight responsive grid (no slider JS). */
export default function PortfolioGallery({ images, cols = 4, showCaptions = false }: { images: Item[]; cols?: number; showCaptions?: boolean }) {
  if (!images.length) return null;
  return (
    <ul className={`gallery gallery--${Math.min(Math.max(cols, 2), 4)}`}>
      {images.map((img, i) => (
        <li key={`${img.src}-${i}`} className="gallery__item">
          <figure>
            <SmartImage src={img.src} alt={img.alt} width={img.width} height={img.height} sizes="(max-width: 767px) 46vw, (max-width: 1279px) 30vw, 290px" className="gallery__img" />
            {showCaptions && (img.title || img.category) ? (
              <figcaption>
                {img.title ? <strong>{img.title}</strong> : null}
                {img.category ? <span>{img.category}</span> : null}
              </figcaption>
            ) : null}
          </figure>
        </li>
      ))}
    </ul>
  );
}
