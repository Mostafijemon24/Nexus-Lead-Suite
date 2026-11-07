import type { ContentNode, Section } from "@/types/content";
import { slugId } from "./Blocks";

function firstH2(nodes: ContentNode[]): string | null {
  for (const n of nodes) {
    if (n.t === "heading" && n.level === "h2") return n.text;
    if (n.t === "container") {
      const r = firstH2(n.children);
      if (r) return r;
    }
  }
  return null;
}

/** Compact in-page navigation for long money pages (anchors account for the sticky header via CSS). */
export default function OnThisPage({ sections }: { sections: Section[] }) {
  const items = sections
    .map((s) => firstH2(s.children))
    .filter((t): t is string => !!t)
    .slice(0, 8);
  const extra = [
    { id: "portfolio-preview", text: "Portfolio" },
    { id: "reviews", text: "Reviews" },
  ];
  if (items.length < 3) return null;
  return (
    <nav className="otp" aria-label="On this page">
      <div className="container otp__inner">
        <span className="otp__label">On this page</span>
        <ul>
          {items.map((t) => (
            <li key={t}>
              <a href={`#${slugId(t)}`}>{shorten(t)}</a>
            </li>
          ))}
          {extra.map((e) => (
            <li key={e.id}>
              <a href={`#${e.id}`}>{e.text}</a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

function shorten(t: string) {
  const s = t.replace(/\?$/, "");
  return s.length > 34 ? `${s.slice(0, 32).trimEnd()}…` : s;
}
