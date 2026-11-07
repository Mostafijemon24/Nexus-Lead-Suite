"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/data/navigation";
import { site } from "@/data/site";
import Icon from "@/components/ui/Icon";
import { openConsultation } from "@/components/consultation/consultation-events";

export default function MobileMenu({ items }: { items: NavItem[] }) {
  // The menu is "open for a given path": navigating closes it without an effect.
  const pathname = usePathname();
  const [openAt, setOpenAt] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const open = openAt === pathname;
  const panelRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const close = () => setOpenAt(null);

  useEffect(() => {
    if (!open) {
      document.documentElement.classList.remove("menu-open");
      return;
    }
    document.documentElement.classList.add("menu-open");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenAt(null);
        btnRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    panelRef.current?.querySelector<HTMLElement>("a,button")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.classList.remove("menu-open");
    };
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      <button ref={btnRef} type="button" className="burger" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpenAt(open ? null : pathname)}>
        <Icon name={open ? "x" : "menu"} size={24} />
      </button>
      <div id="mobile-menu" ref={panelRef} className={`mmenu${open ? " is-open" : ""}`} hidden={!open} role="dialog" aria-modal="true" aria-label="Site menu">
        <nav aria-label="Mobile">
          <ul className="mmenu__list">
            {items.map((item) => {
              const key = item.label;
              const hasKids = !!item.children?.length;
              const isExp = expanded === key;
              return (
                <li key={key} className={isActive(item.href) ? "is-active" : ""}>
                  <div className="mmenu__row">
                    <Link href={item.href} aria-current={isActive(item.href) ? "page" : undefined} onClick={close}>
                      {item.label}
                    </Link>
                    {hasKids ? (
                      <button type="button" aria-expanded={isExp} aria-controls={`sub-${key}`} aria-label={`${isExp ? "Collapse" : "Expand"} ${item.label}`} onClick={() => setExpanded(isExp ? null : key)}>
                        <Icon name="chevron-down" size={18} style={{ transform: isExp ? "rotate(180deg)" : undefined }} />
                      </button>
                    ) : null}
                  </div>
                  {hasKids ? (
                    <ul id={`sub-${key}`} className="mmenu__sub" hidden={!isExp}>
                      {item.children!.map((c) => (
                        <li key={c.href}>
                          <Link href={c.href} aria-current={isActive(c.href) ? "page" : undefined} onClick={close}>
                            {c.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="mmenu__footer">
          <button
            type="button"
            className="btn btn--primary btn--lg"
            onClick={() => {
              close();
              openConsultation({ source: "mobile-menu" });
            }}
          >
            <span>Free Consultation</span>
          </button>
          <a className="btn btn--light btn--lg" href={`tel:${site.phone.e164}`}>
            <Icon name="phone" size={18} />
            <span>Call {site.phone.display}</span>
          </a>
          <a className="mmenu__wa" href={site.whatsapp.url} target="_blank" rel="noopener noreferrer">
            <Icon name="whatsapp" size={18} /> WhatsApp
          </a>
        </div>
      </div>
    </>
  );
}
