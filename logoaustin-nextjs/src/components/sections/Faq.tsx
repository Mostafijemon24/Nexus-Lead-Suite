import type { FaqItem } from "@/types/content";
import Icon from "@/components/ui/Icon";

/** Accessible, JavaScript-free FAQ accordion using native <details>. */
export default function Faq({ items, title }: { items: FaqItem[]; title?: string }) {
  if (!items.length) return null;
  return (
    <div className="faq">
      {title ? <h2>{title}</h2> : null}
      {items.map((it, i) => (
        <details key={i} className="faq__item" open={i === 0}>
          <summary>
            <span>{it.q}</span>
            <Icon name="chevron-down" size={18} />
          </summary>
          <div className="faq__answer rich" dangerouslySetInnerHTML={{ __html: it.a }} />
        </details>
      ))}
    </div>
  );
}
