import Link from "next/link";
import { site } from "@/data/site";
import Icon from "@/components/ui/Icon";
import ConsultationTrigger from "@/components/consultation/ConsultationTrigger";
import ReviewsButton from "@/components/reviews/ReviewsButton";

/** Mobile-only bottom conversion bar + floating Reviews button (coordinated positions in CSS). */
export default function StickyBar() {
  return (
    <>
      <ReviewsButton />
      <nav className="sticky-bar" aria-label="Quick actions">
        <a href={`tel:${site.phone.e164}`} className="sticky-bar__item">
          <Icon name="phone" size={20} />
          <span>Call Now</span>
        </a>
        <ConsultationTrigger className="sticky-bar__item sticky-bar__item--primary">
          <Icon name="send" size={20} />
          <span>Free Consultation</span>
        </ConsultationTrigger>
        <Link href="/portfolio/" className="sticky-bar__item">
          <Icon name="images" size={20} />
          <span>Portfolio</span>
        </Link>
      </nav>
    </>
  );
}
