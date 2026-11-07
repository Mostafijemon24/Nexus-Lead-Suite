"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { googleTranslateEs, site } from "@/data/site";
import Icon from "@/components/ui/Icon";

/**
 * EN / ES selector. Native Spanish routes (/es/...) are used once `es` is in NEXT_PUBLIC_LOCALES
 * (after translated content is approved). Until then Spanish opens the Google-translated view,
 * which is the behaviour of the current live site.
 */
export default function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname() || "/";
  const nativeEs = site.languages.enabledLocales.includes("es");
  const isEs = pathname.startsWith("/es/");
  const enPath = isEs ? pathname.replace(/^\/es/, "") || "/" : pathname;
  const esHref = nativeEs ? `/es${enPath}` : googleTranslateEs(enPath);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("click", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className={`lang${open ? " is-open" : ""}`} ref={ref} translate="no">
      <button type="button" className="lang__btn" aria-haspopup="menu" aria-expanded={open} aria-label={`${isEs ? "ES" : "EN"} – change language`} onClick={() => setOpen((o) => !o)}>
        <Icon name="globe" size={16} />
        <span>{isEs ? "ES" : "EN"}</span>
        <Icon name="chevron-down" size={14} />
      </button>
      <ul className="lang__menu" role="menu" hidden={!open}>
        <li role="none">
          <Link role="menuitem" href={enPath} lang="en" hrefLang="en" className={!isEs ? "on" : ""} onClick={() => setOpen(false)}>
            English
          </Link>
        </li>
        <li role="none">
          {nativeEs ? (
            <Link role="menuitem" href={esHref} lang="es" hrefLang="es" className={isEs ? "on" : ""} onClick={() => setOpen(false)}>
              Español
            </Link>
          ) : (
            <a role="menuitem" href={esHref} lang="es" hrefLang="es" rel="nofollow noopener" onClick={() => setOpen(false)}>
              Español
            </a>
          )}
        </li>
      </ul>
    </div>
  );
}
