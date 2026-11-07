import type { Section } from "@/types/content";
import Block from "./Blocks";

/**
 * Renders a migrated Elementor section as a semantic <section>. Variant + background classes
 * drive the styling in styles/sections.css; the inner block tree carries the content.
 */
export default function SectionRenderer({ section, index }: { section: Section; index: number }) {
  const ctx = { sectionVariant: section.variant, depth: 0, inHero: section.variant === "hero" };
  const isHero = section.variant === "hero";
  const Tag = isHero ? "header" : "section";
  // "la-faq" legacy pattern (h3 + text) gets converted to a real accordion by collapsing blocks
  const children = section.variant === "faq" ? faqify(section) : section.children;
  return (
    <Tag className={`sec sec--${section.variant} bg-${section.bg}`} id={isHero ? undefined : `s-${index}`} data-variant={section.variant}>
      <div className="container">
        {children.map((c, i) => (
          <Block key={i} node={c} ctx={ctx} />
        ))}
      </div>
    </Tag>
  );
}

import type { ContentNode, ContainerNode } from "@/types/content";

function faqify(section: Section): ContentNode[] {
  // Walk the tree; for containers with class la-faq, convert h3 + text pairs into an accordion node.
  const convert = (node: ContentNode): ContentNode => {
    if (node.t !== "container") return node;
    if (node.classes.includes("la-faq")) {
      const out: ContentNode[] = [];
      const items: { q: string; a: string }[] = [];
      const kids = node.children;
      for (let i = 0; i < kids.length; i++) {
        const k = kids[i];
        if (k.t === "heading" && k.level === "h3" && kids[i + 1]?.t === "text") {
          const a = kids[i + 1];
          if (a.t === "text") items.push({ q: k.text, a: a.html });
          i++;
        } else out.push(k);
      }
      if (items.length) out.push({ t: "accordion", items, classes: [] });
      return { ...node, children: out } as ContainerNode;
    }
    return { ...node, children: node.children.map(convert) } as ContainerNode;
  };
  return section.children.map(convert);
}
