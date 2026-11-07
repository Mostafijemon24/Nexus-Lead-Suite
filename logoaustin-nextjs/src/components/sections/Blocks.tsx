import Link from "next/link";
import type { CSSProperties, ElementType } from "react";
import type { ContentNode, ContainerNode, HeadingNode, TextNode, ListNode, ImageNode, GalleryNode, AccordionNode, FormNode } from "@/types/content";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import SmartImage from "@/components/ui/SmartImage";
import Faq from "./Faq";
import PortfolioGallery from "@/components/portfolio/PortfolioGallery";
import ConsultationForm from "@/components/consultation/ConsultationForm";
import BlogIndex from "@/components/blog/BlogIndex";
import GoogleMap from "@/components/layout/GoogleMap";

type Ctx = { sectionVariant: string; depth: number; inHero: boolean };

const HEADING_TAGS = new Set(["h1", "h2", "h3", "h4", "h5", "h6"]);

function hasRenderableContent(node: ContentNode): boolean {
  if (node.t !== "container") return true;
  return node.children.some(hasRenderableContent);
}

function Heading({ node, ctx }: { node: HeadingNode; ctx: Ctx }) {
  const lvl = node.level.toLowerCase();
  const align = node.align ? ` align-${node.align}` : "";
  if (lvl === "p" || lvl === "span") {
    // Elementor "heading" widgets with p/span size are eyebrow labels in this design
    return <p className={`eyebrow${align}`}>{node.text}</p>;
  }
  const Tag = (HEADING_TAGS.has(lvl) ? lvl : "h2") as ElementType;
  const cls = `${ctx.inHero && lvl === "h1" ? "hero__title" : ""}${align}`.trim();
  const inner = node.href ? <Link href={node.href}>{node.text}</Link> : node.text;
  return <Tag className={cls || undefined} id={lvl === "h2" ? slugId(node.text) : undefined}>{inner}</Tag>;
}

export function slugId(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function Text({ node, ctx }: { node: TextNode; ctx: Ctx }) {
  // Breadcrumb paragraphs from the old templates are replaced by the Breadcrumbs component.
  const html = node.html.replace(/<p><a href="\/">Home<\/a> ›[^<]*(<a[^>]*>[^<]*<\/a>[^<]*)*<\/p>/, "");
  if (!html.trim()) return null;
  const cls = `rich${node.align ? ` align-${node.align}` : ""}${ctx.inHero ? " hero__text" : ""}`;
  return <div className={cls} dangerouslySetInnerHTML={{ __html: html }} />;
}

function List({ node }: { node: ListNode }) {
  return (
    <ul className="checklist">
      {node.items.map((it, i) => (
        <li key={i}>
          <Icon name={it.icon || "check-circle"} size={18} />
          {it.href ? <Link href={it.href}>{it.text}</Link> : <span>{it.text}</span>}
        </li>
      ))}
    </ul>
  );
}

function Img({ node, ctx }: { node: ImageNode; ctx: Ctx }) {
  const isHero = ctx.inHero;
  const img = (
    <SmartImage
      src={node.src}
      alt={node.alt}
      width={node.width}
      height={node.height}
      priority={isHero}
      fetchPriority={isHero ? "high" : undefined}
      loading={isHero ? "eager" : "lazy"}
      sizes={isHero ? "(max-width: 767px) 92vw, 520px" : "(max-width: 767px) 92vw, (max-width: 1279px) 45vw, 560px"}
      className="img"
    />
  );
  const figure = <figure className={`figure${isHero ? " figure--hero" : ""}`}>{node.href ? <Link href={node.href}>{img}</Link> : img}</figure>;
  return figure;
}

function Gallery({ node }: { node: GalleryNode }) {
  return <PortfolioGallery images={node.images} cols={node.cols} />;
}

function Accordion({ node }: { node: AccordionNode }) {
  return <Faq items={node.items} />;
}

function Form({ node }: { node: FormNode }) {
  void node;
  return <ConsultationForm source="page" />;
}

function Container({ node, ctx }: { node: ContainerNode; ctx: Ctx }) {
  if (!hasRenderableContent(node)) return null;
  const classes = node.classes.filter((c) => !["wd2e-row", "wd2e-col", "la-text", "lda-sec", "la-sec", "wd2e-section"].includes(c));
  const isRow = node.dir === "row";
  const isCard = node.classes.includes("lda-card") || node.classes.includes("la-card");
  const isHead = node.classes.includes("lda-head");
  const isBtns = node.classes.includes("la-btns");
  const onlyButtons = node.children.length > 0 && node.children.every((c) => c.t === "button");
  const style: CSSProperties & Record<string, string | number> = {};
  if (node.width && node.width <= 100) style["--w"] = `${node.width}%`;
  if (node.widthTablet && node.widthTablet <= 100) style["--wt"] = `${node.widthTablet}%`;
  if (node.bg && !/^#fff(fff)?$/i.test(node.bg) && !isCard) style["--bg"] = node.bg;
  const cls = [
    isRow ? "row" : "col",
    isRow && node.wrap ? "row--wrap" : "",
    node.width && node.width <= 100 ? "has-w" : "",
    isCard ? "card" : "",
    isHead ? "sec-head" : "",
    node.classes.includes("lda-center") || node.classes.includes("la-center") ? "align-center" : "",
    isBtns ? "has-btns" : "",
    onlyButtons ? "btn-group" : "",
    node.align === "center" ? "items-center" : "",
    node.justify === "center" ? "justify-center" : "",
    node.justify === "space-between" ? "justify-between" : "",
    ...classes,
  ]
    .filter(Boolean)
    .join(" ");
  // Flatten the step/number pattern: heading h3 preceded by a span-number is handled by CSS counters
  return (
    <div className={cls} style={Object.keys(style).length ? style : undefined}>
      {node.children.map((c, i) => (
        <Block key={i} node={c} ctx={{ ...ctx, depth: ctx.depth + 1 }} />
      ))}
    </div>
  );
}

export default function Block({ node, ctx }: { node: ContentNode; ctx: Ctx }) {
  switch (node.t) {
    case "container":
      return <Container node={node} ctx={ctx} />;
    case "heading":
      return <Heading node={node} ctx={ctx} />;
    case "text":
      return <Text node={node} ctx={ctx} />;
    case "list":
      return <List node={node} />;
    case "button": {
      const onDark = ctx.sectionVariant === "hero" || ctx.sectionVariant === "cta";
      const secondary = node.style === "ghost" || (node.style === "primary" && /^call\b/i.test(node.text));
      const variant = node.style === "link" ? "link" : secondary ? (onDark ? "light" : "ghost") : "primary";
      const icon = node.icon || (secondary && /^call\b/i.test(node.text) ? "phone" : undefined);
      return (
        <Button href={node.href} variant={variant} icon={icon} iconPosition={node.style === "link" ? "right" : "left"}>
          {node.text}
        </Button>
      );
    }
    case "image":
      return <Img node={node} ctx={ctx} />;
    case "icon":
      return (
        <span className="card__icon" aria-hidden="true">
          <Icon name={node.icon} size={22} />
        </span>
      );
    case "iconBox":
      return (
        <div className="iconbox">
          <span className="iconbox__icon" aria-hidden="true">
            <Icon name={node.icon} size={22} />
          </span>
          <div>
            <p className="iconbox__title">{node.title}</p>
            <p className="iconbox__desc">{node.desc}</p>
          </div>
        </div>
      );
    case "accordion":
      return <Accordion node={node} />;
    case "gallery":
      return <Gallery node={node} />;
    case "badge":
      return (
        <div className="badge">
          <strong>{node.strong}</strong>
          <span>{node.text}</span>
        </div>
      );
    case "map":
      return <GoogleMap />;
    case "form":
      return <Form node={node} />;
    case "posts":
      return <BlogIndex />;
    case "divider":
      return <hr className="divider" />;
    default:
      return null;
  }
}
