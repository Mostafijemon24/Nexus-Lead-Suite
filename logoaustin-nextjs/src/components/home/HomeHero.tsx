import type { ContentNode, Section } from "@/types/content";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import SmartImage from "@/components/ui/SmartImage";
import Link from "next/link";
import { site } from "@/data/site";

/**
 * Homepage hero rebuilt as a dedicated component. Copy is taken from the approved live hero
 * (same H1, lead paragraph and proof points) with the CTA set requested in the brief.
 */
export default function HomeHero({ section }: { section: Section }) {
  const flat: ContentNode[] = [];
  const walk = (n: ContentNode) => {
    flat.push(n);
    if (n.t === "container") n.children.forEach(walk);
  };
  section.children.forEach(walk);
  const eyebrow = flat.find((n) => n.t === "heading" && n.level === "p");
  const h1 = flat.find((n) => n.t === "heading" && n.level === "h1");
  const lead = flat.find((n) => n.t === "text");
  const list = flat.find((n) => n.t === "list");
  const note = flat.filter((n) => n.t === "text")[1];
  const image = flat.find((n) => n.t === "image");
  const badge = flat.find((n) => n.t === "badge");

  return (
    <header className="sec sec--hero bg-ink home-hero">
      <div className="container row items-center justify-between">
        <div className="col has-w home-hero__copy" style={{ ["--w" as string]: "54%" }}>
          {eyebrow && eyebrow.t === "heading" ? <p className="eyebrow">{eyebrow.text}</p> : null}
          <h1 className="hero__title">{h1 && h1.t === "heading" ? h1.text : "Custom Logo Design & AI Logo Redesign in Austin, TX"}</h1>
          {lead && lead.t === "text" ? <div className="rich hero__text" dangerouslySetInnerHTML={{ __html: lead.html }} /> : null}
          {list && list.t === "list" ? (
            <ul className="checklist">
              {list.items.map((it, i) => (
                <li key={i}>
                  <Icon name="check-circle" size={18} />
                  <span>{it.text}</span>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="btn-group">
            <Button href="#consultation" variant="primary" size="lg">
              Get a Free Design Consultation
            </Button>
            <Button href="/portfolio/" variant="light" size="lg" icon="images">
              Explore Our Portfolio
            </Button>
          </div>
          <p className="home-hero__links">
            <a href="#reviews">
              <Icon name="star" size={14} /> Read Customer Reviews
            </a>
            <a href={`tel:${site.phone.e164}`}>
              <Icon name="phone" size={14} /> Call {site.phone.display}
            </a>
          </p>
          {note && note.t === "text" ? <div className="rich hero__note" dangerouslySetInnerHTML={{ __html: note.html }} /> : null}
        </div>
        <div className="col has-w home-hero__media" style={{ ["--w" as string]: "42%" }}>
          {image && image.t === "image" ? (
            <figure className="figure figure--hero">
              <SmartImage src={image.src} alt={image.alt} width={image.width} height={image.height} priority fetchPriority="high" sizes="(max-width: 767px) 92vw, 520px" />
            </figure>
          ) : null}
          {badge && badge.t === "badge" ? (
            <Link href="/fix-ai-generated-logo/" className="badge badge--link">
              <strong>{badge.strong}</strong>
              <span>{badge.text}</span>
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
