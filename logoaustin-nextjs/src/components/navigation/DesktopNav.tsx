import Link from "next/link";
import type { NavItem } from "@/data/navigation";
import Icon from "@/components/ui/Icon";

/** Crawlable desktop navigation; dropdowns open on hover and keyboard focus (CSS only). */
export default function DesktopNav({ items }: { items: NavItem[] }) {
  return (
    <nav className="nav" aria-label="Main">
      <ul className="nav__list">
        {items.map((item) => (
          <li key={item.href + item.label} className={`nav__item${item.children ? " has-children" : ""}`}>
            <Link href={item.href} className="nav__link">
              {item.label}
              {item.children ? <Icon name="chevron-down" size={14} /> : null}
            </Link>
            {item.children ? (
              <ul className="nav__dropdown">
                {item.children.map((c) => (
                  <li key={c.href}>
                    <Link href={c.href}>
                      <span>{c.label}</span>
                      {c.description ? <small>{c.description}</small> : null}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>
    </nav>
  );
}
